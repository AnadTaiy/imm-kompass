"""Build only public reference data. Reviews and browser storage are never inputs."""
import hashlib,json,re,shutil,sys,os,argparse,subprocess
from pathlib import Path
from urllib.request import urlopen,Request
ROOT=Path(__file__).resolve().parent;W=ROOT/'work';OUT=ROOT/'outputs';SITE=ROOT/'site'
sys.path.insert(0,str(W))
from sync_engine import sync_once,read_json,write_json,run_checks,node_executable,process_options
FILES=['calculators.js','dosage.js','review-store.js','sessions.js','workflow.js','lms-v3.js','renal-policy.js','clinical-ui.js','help.js','older-ui.js','patient-context.js','criteria-policy.js','practical-ui.js','catalog-ui.js','journal-v3.js','substances.js','interactions.js','state-migration.js','sync-ui.js','app.js']
STATE=['catalog/fest.zip','catalog/icd.xlsx','catalog/icpc.xlsx','catalog/catalog.json','catalog/download_sources.json','catalog/refresh-meta.json','clinical-rules.json','sync-status.json','sync-cache.json','sync-cache/icd.html','sync-cache/icpc.html']
def compact(data):return json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')

MAX_SCRIPT_BYTES=1_500_000  # Margin below Googlebot's 2 MB uncompressed resource limit.

def catalog_scripts(key,rows):
 """Keep complete records and their order; every chunk is independently valid JS."""
 target='DATA.catalog.'+key
 first=True;records=[];size=0
 def wrapper():return (target+'=[','];') if first else (target+'='+target+'.concat([',']);')
 for row in rows:
  encoded=compact(row);row_bytes=len(encoded.encode('utf-8'))
  prefix,suffix=wrapper()
  if records and len((prefix+suffix).encode('utf-8'))+size+1+row_bytes>MAX_SCRIPT_BYTES:
   yield prefix+','.join(records)+suffix
   first=False;records=[];size=0;prefix,suffix=wrapper()
  if len((prefix+suffix).encode('utf-8'))+row_bytes>MAX_SCRIPT_BYTES:
   raise ValueError(f'A {key} record exceeds the script size limit')
  size+=row_bytes+(1 if records else 0);records.append(encoded)
 if records or first:
  prefix,suffix=wrapper();yield prefix+','.join(records)+suffix

def catalog_guard(parts):
 expected={key:len(rows) for key,rows in parts.items()}
 return """(()=>{
 const expected="""+compact(expected)+""";
 if(typeof DATA==='undefined'||!DATA.catalog||Object.entries(expected).some(([key,count])=>!Array.isArray(DATA.catalog[key])||DATA.catalog[key].length!==count)){
  document.getElementById('main').innerHTML='<section class="panel sectiongap"><div class="panelbody"><h1>Datagrunnlaget er ikke ferdig lastet</h1><p class="sectiongap">En eller flere datafiler mangler. Last siden på nytt for å åpne gjennomgangen.</p><a class="button sectiongap" href="./">Last siden på nytt</a></div></section>';
  throw new Error('IMM catalog incomplete; app startup stopped');
 }
})();
/* IMM_CATALOG_READY */
"""
def build_data():
 data=read_json(W/'data.json');data['documents']=[];data['older']['translations']=read_json(W/'start-nb.json');data['older']['parameters']=read_json(W/'criteria-parameters.json');data['catalog']=read_json(W/'catalog/catalog.json');data['clinical']=read_json(W/'clinical-rules.json');return data
def monolith(data):
 html=(W/'index.template.html').read_text(encoding='utf-8').replace('/*LOGO_INTRO*/',(W/'logo-intro.js').read_text(encoding='utf-8'))
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
  if suffix=='js' and len(content.encode('utf-8'))>MAX_SCRIPT_BYTES:raise ValueError(f'Script too large: {label}')
  name=f'{label}-{hashlib.sha256(content.encode()).hexdigest()[:20]}.{suffix}';(SITE/'assets'/name).write_text(content,encoding='utf-8');asset_paths.append(name);return 'assets/'+name
 parts={k:data['catalog'].pop(k) for k in ['meds','diagnoses','interactions']}
 scripts=[asset('grunnlag','const DATA='+compact(data)+';')]
 for key,rows in parts.items():
  for i,chunk in enumerate(catalog_scripts(key,rows),1):scripts.append(asset(f'{key}-{i:02d}',chunk))
 code=catalog_guard(parts)+'\n'.join((W/f).read_text(encoding='utf-8') for f in FILES)
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
 about=(W/'about.template.html').read_text(encoding='utf-8').replace('/*STYLE*/',style)
 about=about.replace('<!--FAVICON-->',re.search(r'<link\b[^>]*rel=["\']icon["\'][^>]*>',html)[0])
 (SITE/'om-meg.html').write_text(about,encoding='utf-8')
 shutil.copytree(ROOT/'public',SITE,dirs_exist_ok=True)
 (SITE/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+url+path+'</loc></url>' for path in ['', 'om-meg.html'])+'</urlset>',encoding='utf-8')
 assert 'base64' not in compact(data.get('documents',[]))
 subprocess.run([node_executable(),str(ROOT/'test_web_build.cjs')],check=True,encoding='utf-8',timeout=60,**process_options())
 print(json.dumps({'revision':revision,'assets':asset_paths,'status':status.get('phase'),'bytes':sum(p.stat().st_size for p in SITE.rglob('*') if p.is_file())}))
if __name__=='__main__':main()
