"""Public reference data only. Incremental FEST, conditional code downloads, staged validation.
No browser storage or patient records are read. No remotely supplied code is executed.
"""
import copy,datetime,hashlib,html,json,os,re,shutil,subprocess,sys,tempfile,uuid,zipfile
import xml.etree.ElementTree as E
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from urllib.parse import urljoin,urlparse,unquote
from contextlib import contextmanager
from refresh_lists import validate_catalog
from runtime_support import node_executable,python_executable,process_options

SERVICE='https://fest.legemiddelverket.no/Fest/FestService251.svc'
ACTION='http://www.slv.no/201410325/FestService251/GetM30'
HOSTS={'www.dmp.no','www.helsedirektoratet.no','fest.legemiddelverket.no'}
DATA_RE=re.compile(r'const DATA=(.*?);\s*</script>',re.S)
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(b):return hashlib.sha256(b).hexdigest()
def atomic(path,b):
 path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
 temp=path.with_name(path.name+'.'+uuid.uuid4().hex+'.pending');temp.write_bytes(b);os.replace(temp,path)
def write_json(path,d):atomic(path,json.dumps(d,ensure_ascii=False,indent=2).encode('utf-8'))
def read_json(path,default=None):
 return json.loads(Path(path).read_text(encoding='utf-8')) if Path(path).exists() else copy.deepcopy(default)
def safe_url(url):
 if urlparse(url).scheme!='https' or urlparse(url).hostname not in HOSTS:raise ValueError('Unexpected reference host')
 return url
def fetch(url,headers=None,data=None,limit=150_000_000):
 with urlopen(Request(safe_url(url),data=data,headers={'User-Agent':'IMM-Kompass reference sync/1.0',**(headers or {})}),timeout=45) as r:
  safe_url(r.url);b=r.read(limit+1)
  if len(b)>limit:raise ValueError('Reference response too large')
  return b,dict(r.headers)
def conditional(url,path,cache):
 """304 avoids the body. Compare hashes even if server omits validators."""
 prior=cache.get(url,{}) if path.exists() else {};h={}
 if prior.get('etag'):h['If-None-Match']=prior['etag']
 if prior.get('modified'):h['If-Modified-Since']=prior['modified']
 try:b,headers=fetch(url,h)
 except HTTPError as e:
  if e.code==304 and path.exists():return False,0
  raise
 changed=not path.exists() or sha(path.read_bytes())!=sha(b)
 if changed:atomic(path,b)
 lower={k.lower():v for k,v in headers.items()}
 cache[url]={'etag':lower.get('etag'),'modified':lower.get('last-modified'),'sha256':sha(b)}
 return changed,len(b)
def strip_ns(root):
 for e in root.iter():e.tag=e.tag.split('}')[-1]
 return root
def load_fest(path):
 with zipfile.ZipFile(path) as z:
  names=[n for n in z.namelist() if n.lower().endswith('.xml')]
  if len(names)!=1 or z.getinfo(names[0]).file_size>800_000_000:raise ValueError('Unexpected FEST archive')
  return strip_ns(E.fromstring(z.read(names[0])))
def soap_delta(cursor):
 # incrementalDate and namespace are from the production WSDL, not the older PDF spelling.
 body=f'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing"><s:Header><a:Action s:mustUnderstand="1">{ACTION}</a:Action><a:To s:mustUnderstand="1">{SERVICE}</a:To></s:Header><s:Body><GetM30 xmlns="http://www.slv.no/201410325/"><filter>Rekvirent</filter><incrementalDate>{html.escape(cursor)}</incrementalDate></GetM30></s:Body></s:Envelope>'
 b,_=fetch(SERVICE,{'Content-Type':f'application/soap+xml; charset=utf-8; action="{ACTION}"'},body.encode())
 r=strip_ns(E.fromstring(b));code=r.find('.//Returkode')
 if code is None or code.get('V')!='1' or r.find('.//Fault') is not None:raise ValueError('FEST did not return OK')
 m=r.find('.//M30Message')
 if m is None:raise ValueError('Empty FEST response; verify through full snapshot')
 return m,len(b)
def merge_delta(root,delta):
 """Outer Oppf Id identifies a revision. U retires that revision; A adds/replaces it."""
 before=root.findtext('HentetDato');after=delta.findtext('HentetDato')
 if not after or datetime.datetime.fromisoformat(after)<datetime.datetime.fromisoformat(before):raise ValueError('FEST cursor regressed')
 changes=0
 for cat in delta:
  if not cat.tag.startswith('Kat'):continue
  existing=root.find(cat.tag)
  if existing is None:existing=E.SubElement(root,cat.tag)
  index={e.findtext('Id'):e for e in existing}
  if None in index or len(index)!=len(existing):raise ValueError('Ambiguous FEST revision IDs')
  for entry in cat:
   ident=entry.findtext('Id');status=entry.find('Status')
   if not ident or status is None or status.get('V') not in ['A','U']:raise ValueError('Unknown FEST revision/status')
   old=index.get(ident)
   if old is not None:existing.remove(old)
   if status.get('V')=='A':new=copy.deepcopy(entry);existing.append(new);index[ident]=new
   else:index.pop(ident,None)
   changes+=1
 root.find('HentetDato').text=after
 return after,changes
def update_fest(path,cache,source,known_cursor=None):
 root=None;cursor=known_cursor;total=0;revisions=0
 try:
  if not cursor:root=load_fest(path);cursor=root.findtext('HentetDato')
  seen={cursor}
  for _ in range(40):
   delta,n=soap_delta(cursor);total+=n;new_cursor=delta.findtext('HentetDato')
   if new_cursor==cursor:
    if any(len(c) for c in delta if c.tag.startswith('Kat')):raise ValueError('Same cursor with uncommitted data')
    if revisions:
     pending=path.with_suffix('.pending.zip')
     with zipfile.ZipFile(pending,'w',zipfile.ZIP_DEFLATED) as z:z.writestr('FEST.xml',E.tostring(root,encoding='utf-8',xml_declaration=True))
     os.replace(pending,path)
    return {'changed':bool(revisions),'mode':'incremental','bytes':total,'revisions':revisions,'cursor':cursor}
   if new_cursor in seen:raise ValueError('FEST cursor loop')
   if root is None:
    root=load_fest(path)
    if root.findtext('HentetDato')!=cursor:raise ValueError('Stored FEST cursor mismatch')
   cursor,n=merge_delta(root,delta);revisions+=n;seen.add(cursor)
  raise ValueError('Too many FEST batches')
 except Exception as error:
  # The partial merge exists only in memory. A failed batch never advances the live cursor.
  changed,n=conditional(source,path,cache);loaded=load_fest(path)
  if cursor and datetime.datetime.fromisoformat(loaded.findtext('HentetDato'))<datetime.datetime.fromisoformat(cursor):
   raise ValueError('Full snapshot older than staged incremental data') from error
  return {'changed':changed,'mode':'snapshot','bytes':total+n,'cursor':loaded.findtext('HentetDato'),'fallback':type(error).__name__}
def select_code_url(system,year,content,page):
 links=list(dict.fromkeys(urljoin(page,html.unescape(u)) for u in re.findall(r'href=["\']([^"\']+)["\']',content)))
 links=[u for u in links if re.search(r'(?<!\d)'+str(year)+r'(?!\d)',unquote(u)) and '.xlsx' in u.lower()]
 links=[u for u in links if ('kodeliste' in unquote(u).lower() if system=='icd' else 'utvidet' in unquote(u).lower() and 'flere' in unquote(u).lower())]
 if len(links)!=1:raise ValueError(f'{system}: current-year source is missing or ambiguous')
 return safe_url(links[0])
def record_diff(old,new):
 result={}
 for key,identity in [('meds',lambda r:r['id']),('atc',lambda r:r[0]),('interactions',lambda r:r['id']),('diagnoses',lambda r:tuple(r))]:
  a={identity(r):r for r in old[key]};b={identity(r):r for r in new[key]}
  result[key]={'added':len(b.keys()-a.keys()),'removed':len(a.keys()-b.keys()),'changed':sum(a[k]!=b[k] for k in a.keys()&b.keys())}
 return result
def replace_app_data(app,data):
 text=app.read_text(encoding='utf-8');matches=list(DATA_RE.finditer(text))
 if len(matches)!=1:raise ValueError('Application data block ambiguous')
 m=matches[0];payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
 return (text[:m.start(1)]+payload+text[m.end(1):]).encode('utf-8')
def run_checks(work):
 node=node_executable()
 for name in ['test_v3.cjs','test_filters.cjs','test_calculators.cjs','test_persistence.cjs','test_renal_policy.cjs']:
  subprocess.run([node,str(work/name)],check=True,capture_output=True,encoding='utf-8',timeout=90,**process_options())
@contextmanager
def sync_lock(work):
 """An OS-held lock is released even if the updater crashes. Never steal another run's lock."""
 path=Path(work)/'sync.lock'
 with open(path,'a+b') as lock:
  if path.stat().st_size==0:lock.write(b'0');lock.flush()
  lock.seek(0)
  if os.name=='nt':
   import msvcrt
   try:msvcrt.locking(lock.fileno(),msvcrt.LK_NBLCK,1)
   except OSError as error:raise RuntimeError('An IMM Kompass reference update is already running') from error
  else:
   import fcntl
   fcntl.flock(lock.fileno(),fcntl.LOCK_EX|fcntl.LOCK_NB)
  try:yield
  finally:
   lock.seek(0)
   if os.name=='nt':msvcrt.locking(lock.fileno(),msvcrt.LK_UNLCK,1)
   else:fcntl.flock(lock.fileno(),fcntl.LOCK_UN)

@contextmanager
def staging_directory(work):
 parent=(work/'.sync-staging').resolve();parent.mkdir(exist_ok=True)
 folder=parent/uuid.uuid4().hex;folder.mkdir()
 try:yield folder
 finally:
  # Delete only this newly created stage, never an inferred or external workspace.
  if folder.resolve().parent!=parent or not re.fullmatch('[0-9a-f]{32}',folder.name):raise ValueError('Unsafe staging cleanup')
  shutil.rmtree(folder)
def sync_once(work,app,status):
 with sync_lock(work):
  try:return _sync_once(work,app,status)
  except Exception as error:
   status.update(phase='error',attempt=now(),error=type(error).__name__+': '+str(error)[:300])
   write_json(Path(work)/'sync-status.json',status)
   raise

def _sync_once(work,app,status):
 work=Path(work);app=Path(app);cache=read_json(work/'sync-cache.json',{});old=read_json(work/'catalog/catalog.json')
 status.update(phase='checking',attempt=now(),error='');write_json(work/'sync-status.json',status)
 # UI serves its existing immutable file during all network, parsing and checks.
 with staging_directory(work) as tmp:
  stage=Path(tmp)/'work';cat=stage/'catalog';cat.mkdir(parents=True);(stage.parent/'outputs').mkdir()
  for name in ['fest.zip','icd.xlsx','icpc.xlsx']:shutil.copy2(work/'catalog'/name,cat/name)
  sources=read_json(work/'catalog/download_sources.json');fest=update_fest(cat/'fest.zip',cache,sources['fest.zip'],old['meta']['festExtracted']);changed=fest['changed'];received=fest['bytes']
  year=datetime.datetime.now().year
  for system in ['icd','icpc']:
   page='https://www.helsedirektoratet.no/digitalisering-og-e-helse/helsefaglige-kodeverk/'+system
   page_cache=work/'sync-cache'/(system+'.html');_,n=conditional(page,page_cache,cache);received+=n
   source=select_code_url(system,year,page_cache.read_text(encoding='utf-8'),page);sources[system+'.xlsx']=source
   # Helsedirektoratet uses content-addressed attachments. Verify the SHA-1 in the URL
   # against the local bytes; unchanged link+hash avoids downloading the same workbook.
   digest=re.search(r':([a-f0-9]{40})/',unquote(source));book=cat/(system+'.xlsx')
   if digest and hashlib.sha1(book.read_bytes()).hexdigest()==digest[1]:c,n=False,0
   else:
    c,n=conditional(source,book,cache)
    if digest and hashlib.sha1(book.read_bytes()).hexdigest()!=digest[1]:raise ValueError('Code workbook does not match its published content hash')
   changed|=c;received+=n
  # Cache HTTP validators only after all sources succeeded.
  if not changed:
   write_json(work/'sync-cache.json',cache)
   status.update(phase='current',checked=now(),revision=old['meta'].get('syncRevision',''),bytesReceived=received,transport=fest['mode'],fest=old['meta']['festPublication'],cursor=fest['cursor'],error='')
   write_json(work/'sync-status.json',status);return status
  status.update(phase='validating');write_json(work/'sync-status.json',status)
  write_json(cat/'download_sources.json',sources);write_json(cat/'refresh-meta.json',{'downloaded':now()[:10],'diagnosisYear':year})
  for p in work.iterdir():
   if p.is_file() and p.suffix in ['.js','.cjs','.json','.py','.html']:shutil.copy2(p,stage/p.name)
  shutil.copy2(work/'catalog/build_catalog.py',cat/'build_catalog.py')
  subprocess.run([python_executable(),str(cat/'build_catalog.py')],check=True,capture_output=True,timeout=180,env={**os.environ,'IMM_CATALOG_DIR':str(cat)},**process_options())
  new=read_json(cat/'catalog.json');validate_catalog(new,old)
  if datetime.datetime.fromisoformat(new['meta']['festExtracted'])<datetime.datetime.fromisoformat(old['meta']['festExtracted']):raise ValueError('FEST data regressed')
  new['meta']['festIncremental']=fest['mode']=='incremental' and fest['changed'] or old['meta'].get('festIncremental',False) and not fest['changed']
  if not fest['changed']:new['meta']['festPublication']=old['meta']['festPublication']
  write_json(cat/'catalog.json',new)
  subprocess.run([python_executable(),str(stage/'clinical-rules.py')],check=True,capture_output=True,timeout=90,**process_options())
  base=json.loads(DATA_RE.search(app.read_text(encoding='utf-8')).group(1));base['catalog']=new;base['clinical']=read_json(stage/'clinical-rules.json')
  base['catalog']['meta']['syncRevision']=uuid.uuid4().hex
  write_json(cat/'catalog.json',new)
  write_json(stage/'data.json',{k:v for k,v in base.items() if k not in ['catalog','documents']});run_checks(stage)
  diff=record_diff(old,new);rendered=replace_app_data(app,base)
  # Commit reference files, then replace the single app file last; backups restore on failure.
  targets=[(cat/n,work/'catalog'/n) for n in ['fest.zip','icd.xlsx','icpc.xlsx','catalog.json','download_sources.json','refresh-meta.json']]+[(stage/n,work/n) for n in ['clinical-rules.json','data.json']]
  backup=work/'sync-backup';backup.mkdir(exist_ok=True);written=[]
  try:
   for i,(src,dst) in enumerate(targets):
    prev=backup/str(i)
    if dst.exists():shutil.copy2(dst,prev)
    else:prev.unlink(missing_ok=True)
    atomic(dst,src.read_bytes());written.append((dst,prev))
   shutil.copy2(app,backup/'index.html');atomic(app,rendered)
  except BaseException:
   for dst,prev in reversed(written):
    if prev.exists():atomic(dst,prev.read_bytes())
    else:dst.unlink(missing_ok=True)
   raise
  write_json(work/'sync-cache.json',cache)
  status.update(phase='updated',checked=now(),updated=now(),revision=new['meta']['syncRevision'],diff=diff,bytesReceived=received,transport=fest['mode'],fest=new['meta']['festPublication'],cursor=fest['cursor'],error='')
  write_json(work/'sync-status.json',status);return status
