"""Build only public reference data. Reviews and browser storage are never inputs."""
import hashlib,json,re,shutil,sys,os,argparse
from pathlib import Path
from urllib.request import urlopen,Request
ROOT=Path(__file__).resolve().parent;W=ROOT/'work';OUT=ROOT/'outputs';SITE=ROOT/'site'
sys.path.insert(0,str(W))
from sync_engine import sync_once,read_json,write_json,run_checks
FILES=['calculators.js','dosage.js','review-store.js','sessions.js','workflow.js','lms-v3.js','clinical-ui.js','help.js','older-ui.js','practical-ui.js','catalog-ui.js','journal-v3.js','substances.js','interactions.js','state-migration.js','sync-ui.js','app.js']
STATE=['catalog/fest.zip','catalog/icd.xlsx','catalog/icpc.xlsx','catalog/catalog.json','catalog/download_sources.json','catalog/refresh-meta.json','clinical-rules.json','sync-status.json','sync-cache.json','sync-cache/icd.html','sync-cache/icpc.html']
def compact(data):return json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
def build_data():
 data=read_json(W/'data.json');data['documents']=[];data['catalog']=read_json(W/'catalog/catalog.json');data['clinical']=read_json(W/'clinical-rules.json');return data
def monolith(data):
 html=(W/'index.template.html').read_text(encoding='utf-8')
 html=re.sub(r'<style>.*?</style>',lambda m:'<style>'+(W/'style-v2.css').read_text(encoding='utf-8')+'</style>',html,count=1,flags=re.S)
 return html.replace('/*DATA*/','const DATA='+compact(data)+';').replace('/*APP*/','\n'.join((W/f).read_text(encoding='utf-8') for f in FILES))
def cache_copy(source,destination):
 for name in STATE:
  p=source/name
  if p.is_file():
   d=destination/name;d.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,d)
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--sync',action='store_true');args=parser.parse_args()
 OUT.mkdir(exist_ok=True);SITE.mkdir(exist_ok=True);(SITE/'assets').mkdir(exist_ok=True)
 if args.sync and (ROOT/'.state/catalog/catalog.json').exists():
  cached=read_json(ROOT/'.state/catalog/catalog.json');seed=read_json(W/'catalog/catalog.json')
  if cached['meta']['festExtracted']>=seed['meta']['festExtracted'] and cached['meta']['diagnosisYear']>=seed['meta']['diagnosisYear']:cache_copy(ROOT/'.state',W)
 page=OUT/'index.html';page.write_text(monolith(build_data()),encoding='utf-8')
 if args.sync:
  try:
   sync_once(W,page,read_json(W/'sync-status.json',{}))
  except Exception as error:
   status=read_json(W/'sync-status.json',{});status.update(phase='error',error=type(error).__name__+': '+str(error)[:200]);write_json(W/'sync-status.json',status)
  cache_copy(W,ROOT/'.state')
 run_checks(W)
 data=build_data();html=monolith(data);asset_paths=[]
 def asset(label,content,suffix='js'):
  name=f'{label}-{hashlib.sha256(content.encode()).hexdigest()[:20]}.{suffix}';(SITE/'assets'/name).write_text(content,encoding='utf-8');asset_paths.append(name);return 'assets/'+name
 parts={k:data['catalog'].pop(k) for k in ['meds','diagnoses','interactions']}
 scripts=[asset('grunnlag','const DATA='+compact(data)+';')]
 for k,v in parts.items():scripts.append(asset(k,'DATA.catalog.'+k+'='+compact(v)+';'))
 code='\n'.join((W/f).read_text(encoding='utf-8') for f in FILES)
 app=asset('app',code);style=asset('style',(W/'style-v2.css').read_text(encoding='utf-8'),'css')
 revision=hashlib.sha256('|'.join(asset_paths).encode()).hexdigest()[:24]
 html=re.sub(r'<script>\s*const DATA=.*?</script>\s*<script>.*?</script>\s*</body>',lambda m:'<script>window.IMM_WEB_VERSION='+json.dumps(revision)+';</script>\n'+'\n'.join('<script src="'+p+'"></script>' for p in scripts+[app])+'\n</body>',html,flags=re.S)
 html=re.sub(r'<style>.*?</style>',lambda m:'<link rel="stylesheet" href="'+style+'">',html,count=1,flags=re.S)
 url='https://anadtaiy.github.io/imm-kompass/'
 html=html.replace('<title>IMM Kompass · Klinisk farmasi</title>','<title>IMM Kompass – Mohanad Taiy | Klinisk farmasi</title>')
 html=re.sub(r'<meta name="description"[^>]*>','<meta name="description" content="IMM Kompass av Mohanad Taiy. Et selvstendig studentprosjekt for læring i klinisk farmasi: legemiddelsamstemming, legemiddelgjennomgang og journalutkast.">',html)
 metadata={'@context':'https://schema.org','@type':'LearningResource','name':'IMM Kompass','url':url,'inLanguage':'nb','isAccessibleForFree':True,'author':{'@type':'Person','name':'Mohanad Taiy'},'description':'Selvstendig studentprosjekt for læring i klinisk farmasi.'}
 html=html.replace('</head>','<meta name="author" content="Mohanad Taiy"><link rel="canonical" href="'+url+'"><script type="application/ld+json">'+compact(metadata)+'</script></head>')
 html=html.replace('<body>','<body><noscript><h1>IMM Kompass av Mohanad Taiy</h1><p>Læringsverktøy for klinisk farmasi. Aktiver JavaScript for å bruke appen.</p></noscript>')
 (SITE/'index.html').write_text(html,encoding='utf-8');(SITE/'.nojekyll').touch()
 status=read_json(W/'sync-status.json',{'phase':'waiting'});status.update(service='IMM-Kompass-sync',revision=revision);write_json(SITE/'version.json',status)
 (SITE/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+url+'</loc></url></urlset>',encoding='utf-8')
 assert 'base64' not in compact(data.get('documents',[]));assert len(scripts)==4
 print(json.dumps({'revision':revision,'assets':asset_paths,'status':status.get('phase'),'bytes':sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())}))
if __name__=='__main__':main()
