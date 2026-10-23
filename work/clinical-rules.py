"""Reviewed ATC reminders and a separately labelled renal source index.
No dosing, stopping, or patient-specific treatment decisions. Refresh manually after evidence review.
"""
import json,re,html,unicodedata,csv,io,hashlib
from pathlib import Path
P=Path(__file__).parent
CAT=json.loads((P/'catalog/catalog.json').read_text(encoding='utf-8'))
RENAL='https://www.legemiddelhandboka.no/extended/spesielle-pasientgrupper/legemiddelbruk-og-dosering-ved-nedsatt-nyrefunksjon/dosering-ved-nedsatt-nyrefunksjon-alfabetisk-liste'
TAPER='https://www.legemiddelhandboka.no/forslag-til-nedtrapping-for-legemidler-som-bor-trappes-ned-gradvis-for-seponering'
KDIGO='https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf'
def norm(s):return ''.join(c for c in unicodedata.normalize('NFD',s.casefold().replace('ø','o').replace('æ','ae')) if unicodedata.category(c)!='Mn').strip()
rules=[]
def rule(kind,label,prefixes,source,detail):
 rules.append(dict(id=f'{kind}-{len(rules)+1}',kind=kind,label=label,atc=prefixes.split(),source=source,detail=detail,reviewed='2026-10-22'))
for label,codes in [
 ('Benzodiazepiner og Z-hypnotika','N05BA N05CD N05CF'),('Sederende antihistaminer','R06AD01 R06AD02 R06AA09'),
 ('Antipsykotika','N05AA N05AB N05AC N05AD N05AE N05AF N05AG N05AH N05AL N05AX'),
 ('Antidepressiva','N06A'),('Antiepileptika / gabapentinoider','N03A N02BF'),('Opioidanalgetika','N02A'),
 ('Protonpumpehemmere','A02BC'),('H2-blokkere','A02BA'),('Systemiske glukokortikoider','H02AB'),
 ('Betablokkere','C07'),('Isosorbidmononitrat','C01DA14')]:
 rule('taper',label,codes,TAPER,'Hvis avslutning vurderes: planlegg individuelt etter indikasjon, dose, varighet og formulering.')
for label,codes in [
 ('NSAID (systemisk)','M01A'),('Aminoglykosider (systemisk)','J01G'),('Vankomycin (systemisk)','J01XA01'),
 ('Litium','N05AN01'),('Kalsineurinhemmere (systemisk)','L04AD'),('Protonpumpehemmere','A02BC')]:
 rule('renal',label,codes,KDIGO,'Mulig nyrepåvirkning. Vurder prøvetrend, eksponering og samtidig behandling; KDIGO tabell 31.')
for label,codes in [('RAAS-legemidler','C09'),('Kaliumsparende diuretika','C03D'),('Trimetoprim','J01EA01 J01EE01'),('Hepariner','B01AB')]:
 rule('renal',label,codes,KDIGO,'Vurder kalium og nyrefunksjon; KDIGO tabell 26. Nyrebeskyttende behandling skal ikke stoppes ut fra dette symbolet.')
for label,codes in [
 ('Metformin','A10BA02'),('Sulfonylurea','A10BB'),('Insulin','A10A'),('Gliptiner, unntatt linagliptin','A10BH01 A10BH02 A10BH03 A10BH04'),
 ('DOAK','B01AE07 B01AF'),('Fondaparinuks','B01AX05'),('Digoksin','C01AA05'),('Sotalol','C07AA07'),('Atenolol','C07AB03'),
 ('Diuretika','C03A C03B C03C'),('Kaliumtilskudd','A12BA'),('Magnesium','A12CC A02AA'),('Aktivt vitamin D','A11CC03 A11CC04'),
 ('Gabapentinoider','N02BF N03AX12 N03AX16'),('Baklofen','M03BX01'),('Levetiracetam','N03AX14'),('Topiramat','N03AX11'),('Memantin','N06DX01'),
 ('Morfin / kodein / petidin / tramadol','N02AA01 N02AA59 N02AB02 N02AX02 N02AJ06 N02AJ13 R05DA04'),
 ('Metotreksat','L01BA01 L04AX03'),('Allopurinol','M04AA01'),('Kolkisin','M04AC01'),('Bisfosfonater','M05BA M05BB'),
 ('Penicilliner','J01C'),('Cefalosporiner / karbapenemer','J01D'),('Kinoloner','J01M'),('Nitrofurantoin','J01XE01'),
 ('Aciklovir / valaciklovir','J05AB01 J05AB11'),('Ganciklovir / valganciklovir','J05AB06 J05AB14'),('Tenofovir','J05AF07 J05AF13'),
 ('Flukonazol','J02AC01'),('Amfotericin B (systemisk)','J02AA01'),('Mesalazin / sulfasalazin','A07EC'),
 ('Platinaforbindelser','L01XA'),('Ifosfamid','L01AA06'),('Pemetreksed','L01BA04'),('Kapecitabin','L01BC06'),
 ('Amisulprid / risperidon / paliperidon','N05AL05 N05AX08 N05AX13'),('Metoklopramid','A03FA01')]:
 rule('renal',label,codes,RENAL,'Kontroller legemiddelspesifikke nyrehensyn: dose/eksponering, elektrolytter eller monitorering i oppdatert preparatomtale.')
rule('renal','SGLT2-hemmere','A10BK',KDIGO,'Nyrebeskyttende behandling med indikasjonsspesifikke nyregrenser og råd ved akutt sykdom; ikke et generelt nefrotoksisitetsvarsel.')

# Only names are indexed, never copied dosing paragraphs. The index does NOT infer a toxic effect.
if (P/'renal-source.html').exists():
 source_html=(P/'renal-source.html').read_text(encoding='utf-8')
else:
 from urllib.request import Request,urlopen
 with urlopen(Request(RENAL,headers={'User-Agent':'IMM-Kompass reference update'}),timeout=45) as response:source_html=response.read(5000000).decode('utf-8')
names=[]
for match in re.findall(r'<p[^>]*>\s*<strong[^>]*>(.*?)</strong>',source_html,re.S):
 text=html.unescape(re.sub('<[^>]+>','',match)).strip()
 if 2<len(text)<110 and text not in names:names.append(text)
lookup={norm(n):n for n in names}
def indexed(name):
 n=norm(name)
 if n in lookup:return lookup[n]
 for base,original in lookup.items():
  if n.startswith(base+' ') and n[len(base)+1:] in ['hydroklorid','hydrobromid','natrium','kalium','sulfat','kalsium','dihydrat','monohydrat','hemihydrat','hydrogenmaleat','maleat']:return original
 return None
atc={c:n for c,n,p in CAT['atc'] if len(c)==7}
direct={code:[r['id'] for r in rules if any(code.startswith(pre) for pre in r['atc'])] for code in atc}
# Ingredient inheritance is limited to systemic ATC families. Topical/ocular formulations are not labelled from systemic evidence.
systemic=lambda code:bool(code) and (code[0] in 'ABCGHJLMNPV' or code.startswith(('R05','R06')))
by_name={norm(name):code for code,name in atc.items() if systemic(code)}
entries={}
for code,name in atc.items():
 if not systemic(code):continue
 ids=direct[code];mention=indexed(name)
 if ids or mention:entries[code]={'atc':code,'name':name,'rules':ids.copy(),'renalIndex':[mention] if mention else []}
for med in CAT['meds']:
 code=med['atc']
 if not systemic(code):continue
 ids=set(direct.get(code,[]));mentions=set()
 for ingredient in med['ingredients']:
  base=by_name.get(norm(ingredient))
  if base:ids.update(direct.get(base,[]))
  mention=indexed(ingredient)
  if mention:mentions.add(mention)
 if ids or mentions:
  e=entries.setdefault(code,dict(atc=code,name=atc.get(code,med['substance']),rules=[],renalIndex=[]))
  e['rules']=sorted(set(e['rules'])|ids);e['renalIndex']=sorted(set(e['renalIndex'])|mentions)
data=dict(reviewed='2026-10-22',renalIndexSource=RENAL,renalIndexRevision='08.11.2021 (dato oppgitt på nettsiden)',sourceHash=hashlib.sha256(source_html.encode()).hexdigest(),rules=rules,entries=sorted(entries.values(),key=lambda e:e['atc']),coverage='Kuratert regelsett og navneindeks fra Legemiddelhåndbokas nyretabell, koblet til humane FEST-ATC-koder. Ikke komplett. Ingen automatisk doseendring eller seponering. Kliniske regler oppdateres kun etter ny faglig gjennomgang.')
(P/'clinical-rules.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
out=io.StringIO(newline='');w=csv.writer(out,delimiter=';');w.writerow(['ATC','Virkestoff / ATC-navn','Seponeringsplan','Nyrehensyn','Omtalt i nyrekilde','Regler','Kilder'])
rulemap={r['id']:r for r in rules}
for e in data['entries']:
 rs=[rulemap[k] for k in e['rules']];w.writerow([e['atc'],e['name'],any(r['kind']=='taper' for r in rs),any(r['kind']=='renal' for r in rs),', '.join(e['renalIndex']),', '.join(r['label'] for r in rs),' | '.join(sorted({r['source'] for r in rs}|({RENAL} if e['renalIndex'] else set())))])
(P.parent/'outputs/ATC-kontrollpunkter.csv').write_text(out.getvalue(),encoding='utf-8-sig')
print(json.dumps({'rules':len(rules),'ATC_entries':len(entries),'renal_source_names':len(names)}))
