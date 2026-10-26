"""Build a dated, traceable local reference snapshot. No patient data or dosing rules."""
import json,re,zipfile,hashlib,collections,os,datetime
import xml.etree.ElementTree as E
from pathlib import Path
P=Path(os.environ.get('IMM_CATALOG_DIR',Path(__file__).parent))
def save(name,data): (P/name).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
def xlsx(name):
 z=zipfile.ZipFile(P/name); ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
 ss=[''.join(e.itertext()) for e in E.fromstring(z.read('xl/sharedStrings.xml'))]
 for row in E.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//s:row',ns)[1:]:
  values={}
  for c in row:
   v=c.find('s:v',ns);v=v.text if v is not None else ''
   values[re.sub(r'\d','',c.get('r'))]=ss[int(v)] if c.get('t')=='s' and v else v
  if values.get('A') and values.get('B'):yield values
def attr(e,path,key='V'):
 v=e.find(path);return v.get(key,'') if v is not None else ''
def term(e):
 terms=e.findall('Term')
 return next((t.findtext('Term','') for t in terms if attr(t,'Sprak')=='NO'),terms[0].findtext('Term','') if terms else '')
z=zipfile.ZipFile(P/'fest.zip');root=E.parse(z.open(z.namelist()[0])).getroot()
for e in root.iter():e.tag=e.tag.split('}')[-1]
codes={c.findtext('Info/Id').split('.')[-1]:c for c in root.findall('KatKodeverk/OppfKodeverk')}
atc=[]
for e in codes['7180'].findall('Element'):
 c=e.findtext('Kode','')
 if re.fullmatch(r'[ABCDGHJLMNPRSV](?:\d{2}(?:[A-Z](?:[A-Z](?:\d{2})?)?)?)?',c):
  length={1:0,3:1,4:3,5:4,7:5}[len(c)]
  atc.append([c,term(e),c[:length]])
atc.sort()
label_codes={e.findtext('Kode'):term(e) for e in codes['7488'].findall('Element')}
packings=collections.defaultdict(list)
for wrapper in root.findall('KatLegemiddelpakning/OppfLegemiddelpakning'):
 if attr(wrapper,'Status')!='A':continue
 e=wrapper.find('Legemiddelpakning')
 for ref in e.findall('Pakningsinfo/RefLegemiddelMerkevare'):
  packings[ref.text].append({k:e.findtext('Markedsforingsinfo/'+k,'') for k in ['Markedsforingsdato','Avregistreringsdato','MidlUtgattDato']})
substances={e.findtext('Id'):e.findtext('Navn','') for e in root.findall('KatVirkestoff/OppfVirkestoff/Virkestoff')}
substances_en={e.findtext('Id'):e.findtext('NavnEngelsk','') for e in root.findall('KatVirkestoff/OppfVirkestoff/Virkestoff')}
strengths={e.findtext('Id'):e.findtext('RefVirkestoff') for e in root.findall('KatVirkestoff/OppfVirkestoff/VirkestoffMedStyrke')}
meds=[]
for wrapper in root.findall('KatLegemiddelMerkevare/OppfLegemiddelMerkevare'):
 if attr(wrapper,'Status')!='A':continue
 e=wrapper.find('LegemiddelMerkevare'); code=attr(e,'Atc')
 if code.startswith('Q'):continue
 medid=e.findtext('Id');ptype=attr(e,'Preparattype')
 spc=attr(e,'Preparatomtaleavsnitt/Lenke/Www')
 use=sorted(set(x.get('V') for x in e.findall('AdministreringLegemiddel/BruksomradeEtikett')))
 ingredient_ids=list(dict.fromkeys(strengths.get(x.text) for x in e.findall('SortertVirkestoffMedStyrke/RefVirkestoffMedStyrke') if substances.get(strengths.get(x.text),'')))
 # Herbal products often declare substance references without a strength record.
 # Preserve these exact FEST IDs; do not infer ingredients from the trade name.
 ingredient_ids=list(dict.fromkeys(ingredient_ids+[x.text for x in e.findall('SortertVirkestoffUtenStyrke/RefVirkestoff') if substances.get(x.text)]))
 meds.append({'id':medid,'name':e.findtext('NavnFormStyrke',''),'brand':e.findtext('Varenavn',''),
  'form':e.findtext('LegemiddelformLang',''),'producer':e.findtext('ProduktInfo/Produsent',''),'atc':code,'substance':attr(e,'Atc','DN'),
  'type':ptype,'typeLabel':attr(e,'Preparattype','DN'),'spc':spc,'uses':use,
  'ingredients':[substances[i] for i in ingredient_ids],
  'ingredientsEn':[substances_en.get(i,'') for i in ingredient_ids],
  'ingredientIds':ingredient_ids,
  'ordinary':ptype in ['6','7','8','12','13','19'],
  'withdrawn':bool(packings[medid]) and all(p['Avregistreringsdato'] and p['Avregistreringsdato']<=datetime.date.today().isoformat() for p in packings[medid])})
meds.sort(key=lambda m:m['name'].lower())
diagnoses=[]
for row in xlsx('icd.xlsx'):
 c=row['A'];c=c[:3]+'.'+c[3:] if len(c)>3 and '.' not in c else c
 diagnoses.append(['ICD-10',c,row['B']])
for row in xlsx('icpc.xlsx'):diagnoses.append(['ICPC-2',row['A'],row['B']])
sources=json.loads((P/'download_sources.json').read_text())
publication=re.search(r'(\d{4})(\d{2})(\d{2})',z.namelist()[0])
publication='-'.join(publication.groups()) if publication else root.findtext('HentetDato','')[:10]
provenance=json.loads((P/'refresh-meta.json').read_text()) if (P/'refresh-meta.json').exists() else {'downloaded':'2026-10-21','diagnosisYear':2026}
data={'meta':{'parserVersion':2,'downloaded':provenance['downloaded'],'festPublication':publication,'festExtracted':root.findtext('HentetDato'),'diagnosisYear':provenance['diagnosisYear'],
 'sources':sources,'coverage':'Alle aktive humane merkevareoppføringer i FEST Rekvirent 2.5.1. ATC omfatter humane koder som brukes i FEST og deres overordnede nivåer, ikke hele WHOs internasjonale register. Godkjente preparater som ikke er markedsført kan mangle.',
 'hashes':{f:hashlib.sha256((P/f).read_bytes()).hexdigest() for f in ['fest.zip','icd.xlsx','icpc.xlsx']}},
 'meds':meds,'atc':atc,'uses':label_codes,'diagnoses':diagnoses}
# FEST interaction endpoints are ATC prefixes OR exact substance references, not guessed name matches.
def group(g):return {'name':g.findtext('Navn','') or ' / '.join(x.findtext('Substans','') for x in g.findall('Substans')),'atc':list(dict.fromkeys(x.get('V') for x in g.findall('Substans/Atc'))),'refs':list(dict.fromkeys(x.text for x in g.findall('Substans/RefVirkestoff')))}
interactions=[];not_assessed=[]
for wrapper in root.findall('KatInteraksjon/OppfInteraksjon'):
 if attr(wrapper,'Status')!='A':continue
 e=wrapper.find('Interaksjon')
 if e is None:
  u=wrapper.find('InteraksjonIkkeVurdert')
  if u is not None:not_assessed.append({'atc':[x.get('V') for x in u.findall('.//Atc')],'refs':[x.text for x in u.findall('.//RefVirkestoff')]})
  continue
 if attr(e,'Relevans') not in ['1','2']:continue
 interactions.append({'id':e.findtext('Id',''),'level':int(attr(e,'Relevans')),'groups':[group(g) for g in e.findall('Substansgruppe')],
  'condition':e.findtext('Situasjonskriterium',''),'consequence':e.findtext('KliniskKonsekvens',''),'mechanism':e.findtext('Interaksjonsmekanisme',''),'handling':e.findtext('Handtering',''),
  'evidence':attr(e,'Kildegrunnlag','DN'),'references':[{'title':r.findtext('Kilde',''),'url':attr(r,'Lenke')} for r in e.findall('Referanse')]})
assert all(len(i['groups'])==2 for i in interactions)
assert len({i['id'] for i in interactions})==len(interactions)
data['interactions']=interactions;data['interactionsNotAssessed']=not_assessed
data['substanceRelations']={e.findtext('Id'):[x.text for x in e.findall('RefVirkestoff')] for e in root.findall('KatVirkestoff/OppfVirkestoff/Virkestoff') if e.findall('RefVirkestoff')}
save('catalog.json',data)
print(json.dumps({'medicines':len(meds),'ordinary':sum(m['ordinary'] for m in meds),'atc':len(atc),'diagnoses':len(diagnoses),'uses':len(label_codes),'interactions':len(interactions),'notAssessed':len(not_assessed)}))
