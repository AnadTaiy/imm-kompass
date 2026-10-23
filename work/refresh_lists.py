"""Maintenance entry point. Never called by the patient-facing app.
python work/refresh_lists.py --year 2026 [--apply]
python work/refresh_lists.py --validate-local --year 2026
Stages all data, validates/builds/tests, and only then replaces the app atomically.
Clinical sources, thresholds and manually curated rules require a separate evidence review.
"""
import argparse,datetime,hashlib,html,json,os,re,shutil,subprocess,sys,uuid,zipfile
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urljoin,urlparse,unquote

W=Path(__file__).resolve().parent
def fetch(url):
 with urlopen(Request(url,headers={'User-Agent':'IMM-Kompass local reference maintenance'}),timeout=60) as r:return r.read()
def discover(system,year):
 page='https://www.helsedirektoratet.no/digitalisering-og-e-helse/helsefaglige-kodeverk/'+system
 content=fetch(page).decode('utf-8');links=[urljoin(page,html.unescape(u)) for u in re.findall(r'href=["\']([^"\']+)["\']',content)]
 links=list(dict.fromkeys(u for u in links if str(year) in unquote(u) and '.xlsx' in u.lower()))
 if system=='icd':links=[u for u in links if 'kodeliste' in unquote(u).lower()]
 else:links=[u for u in links if 'utvidet' in unquote(u).lower() and 'flere' in unquote(u).lower()]
 if len(links)!=1:raise RuntimeError(f'{system}: expected one {year} source, found {len(links)}. Inspect the official page and supply a reviewed --manifest.')
 return links[0]
def validate_catalog(d,old):
 for key,minimum in [('meds',5000),('atc',4000),('diagnoses',20000),('interactions',8000)]:
  if len(d[key])<minimum or len(d[key])<len(old[key])*.85:raise RuntimeError(f'Unexpected data loss in {key}; inspect before applying.')
 atc={x[0] for x in d['atc']}
 assert all(not x[2] or x[2] in atc for x in d['atc'])
 assert len({m['id'] for m in d['meds']})==len(d['meds'])
 assert all(len(r['groups'])==2 and r['level'] in [1,2] and r['id'] for r in d['interactions'])
 assert any(m['brand']=='Eliquis' and m['atc']=='B01AF02' for m in d['meds'])
 assert any(dg[:2]==['ICPC-2','K78'] for dg in d['diagnoses'])
 assert any(dg[:2]==['ICD-10','I48.9'] for dg in d['diagnoses'])
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--year',type=int,required=True);p.add_argument('--manifest',type=Path);p.add_argument('--validate-local',action='store_true');p.add_argument('--apply',action='store_true');a=p.parse_args()
 run=W/'maintenance-runs'/(datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:6]);stage=run/'work';cat=stage/'catalog';cat.mkdir(parents=True)
 if a.validate_local and a.apply:raise ValueError('--validate-local is a dry run; omit --apply')
 sources=json.loads((W/'catalog/download_sources.json').read_text())
 if a.manifest:sources.update(json.loads(a.manifest.read_text(encoding='utf-8')))
 elif not a.validate_local:
  for system,filename in [('icd','icd.xlsx'),('icpc','icpc.xlsx')]:sources[filename]=discover(system,a.year)
 for name in ['fest.zip','icd.xlsx','icpc.xlsx']:
  u=sources[name];host=urlparse(u).hostname
  if host not in ['www.dmp.no','www.helsedirektoratet.no']:raise ValueError('Unexpected source host: '+str(host))
  if name.endswith('.xlsx') and str(a.year) not in unquote(u):raise ValueError('Source year mismatch: '+name)
  if a.validate_local:shutil.copy2(W/'catalog'/name,cat/name)
  else:(cat/name).write_bytes(fetch(u))
  with zipfile.ZipFile(cat/name) as z:
   bad=z.testzip()
   if bad:raise ValueError('Corrupt archive: '+bad)
 (cat/'download_sources.json').write_text(json.dumps(sources),encoding='utf-8')
 old=json.loads((W/'catalog/catalog.json').read_text(encoding='utf-8'))
 meta={'downloaded':old['meta']['downloaded'] if a.validate_local else datetime.date.today().isoformat(),'diagnosisYear':a.year}
 (cat/'refresh-meta.json').write_text(json.dumps(meta),encoding='utf-8')
 # Explicitly selected source/build files; no recursive copy of workspace or review data.
 for file in W.iterdir():
  if file.is_file() and (file.suffix in ['.js','.cjs','.json','.css','.html','.py']):shutil.copy2(file,stage/file.name)
 (stage/'geriatric').mkdir();shutil.copy2(W/'geriatric/rules.json',stage/'geriatric/rules.json')
 shutil.copy2(W/'catalog/build_catalog.py',cat/'build_catalog.py')
 subprocess.run([sys.executable,str(cat/'build_catalog.py')],check=True,env={**os.environ,'IMM_CATALOG_DIR':str(cat)})
 new=json.loads((cat/'catalog.json').read_text(encoding='utf-8'));validate_catalog(new,old)
 if new['meta']['festPublication']<old['meta']['festPublication']:raise ValueError('FEST publication went backwards.')
 (run/'outputs').mkdir(exist_ok=True)
 for script in ['clinical-rules.py','build_app.py']:subprocess.run([sys.executable,str(stage/script)],check=True)
 for test in ['test_v3.cjs','test_filters.cjs','test_calculators.cjs','test_persistence.cjs']:subprocess.run(['node',str(stage/test)],check=True)
 report={'sourceDates':new['meta'],'counts':{k:len(new[k]) for k in ['meds','atc','diagnoses','interactions']},'previousCounts':{k:len(old[k]) for k in ['meds','atc','diagnoses','interactions']},'clinicalRulesReviewed':json.loads((stage/'clinical-rules.json').read_text(encoding='utf-8'))['reviewed'],'clinicalNote':'Only reference data and links to existing rule groups rebuilt. Clinical recommendations, external links and WHO full ATC must be reviewed separately. No patient data processed.','applied':a.apply}
 (run/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 if a.apply:
  changes=[(cat/f,W/'catalog'/f) for f in ['fest.zip','icd.xlsx','icpc.xlsx','download_sources.json','refresh-meta.json','catalog.json']]+[(stage/f,W/f) for f in ['clinical-rules.json','data.json']]+[(run/'outputs'/f,W.parent/'outputs'/f) for f in ['ATC-kontrollpunkter.csv','Kildeoversikt-og-lenkelogg.json','index.html']]
  backup=run/'backup';backup.mkdir();written=[]
  try:
   for i,(src,dst) in enumerate(changes):
    saved=backup/str(i)
    if dst.exists():shutil.copy2(dst,saved)
    pending=dst.with_name(dst.name+'.pending');shutil.copy2(src,pending);os.replace(pending,dst);written.append((dst,saved))
  except BaseException:
   for dst,saved in reversed(written):
    if saved.exists():shutil.copy2(saved,dst)
   raise
 print('Verified maintenance run: '+str(run))
 print('Applied atomic app replacement.' if a.apply else 'Dry run only; live application unchanged.')
if __name__=='__main__':main()
