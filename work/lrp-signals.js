/* Curated review prompts, 2026-11-05. No automatic prescribing decisions.
 * Product constituents come from FEST identifiers, never entered brand names.
 * See lrp-signals-sources.md for boundaries and clinical sources. */
(function(root){
 'use strict';
 const base='https://www.legemiddelhandboka.no/extended/ernaering-vaeskesubstitusjon-og-elektrolyttforstyrrelser/behandling-av-elektrolyttforstyrrelser/';
 const sources={
  review:['Helsedirektoratet – legemiddelgjennomgang','https://www.helsedirektoratet.no/faglige-rad/legemiddelsamstemming-og-legemiddelgjennomgang/gjennomforing-av-legemiddelgjennomgang'],
  lowK:['Legemiddelhåndboka – hypokalemi',base+'hypokalemi'],highK:['Legemiddelhåndboka – hyperkalemi',base+'hyperkalemi'],
  lowNa:['Legemiddelhåndboka – hyponatremi',base+'hyponatremi'],highNa:['Legemiddelhåndboka – hypernatremi',base+'hypernatremi'],
  lithium:['Legemiddelhåndboka – diabetes insipidus','https://www.legemiddelhandboka.no/extended/endokrine-sykdommer/hypofysesykdommer/hypofysesvikt/sentral-diabetes-insipidus'],
  range:['Fürst – referanseområder','https://www.furst.no/analyse-og-klinikk/referanseomrader'],
  nsaid:['Legemiddelhåndboka – NSAID','https://www.legemiddelhandboka.no/extended/ikke-steroide-antiinflammatoriske-midler-nsaid'],
  metoclopramide:['Afipran – preparatomtale, punkt 4.3 og 4.4','https://produktinformasjon.legemiddelsok.no/preparatomtaler/1994-03424.pdf'],
  propranolol:['Propranolol – preparatomtale, punkt 4.3 og 4.4','https://www.medicines.org.uk/emc/product/100086/smpc']
 };
 const rules=[
  {id:'duplicate',kind:'duplicate',title:'Samme virkestoff i flere preparater',detail:'FEST viser felles virkestoff i minst to registrerte preparater. Dette kan være en dobbeltføring, men også en planlagt kombinasjon av styrker, behovs- og fast behandling eller en overgang.',advice:'Sammenlign faktisk samtidig bruk, administrasjonsvei og samlet dose. Kontroller om begge preparatene skal stå på listen før du registrerer et problem.',refs:['review']},
  {id:'low-k-diuretic',kind:'lab',lab:'potassium',direction:'low',atc:['C03AA','C03BA','C03CA','C03CC'],title:'Lavt kalium og kaliumtapende diuretikum',detail:'Slynge- og tiazid/tiazidlignende diuretika kan bidra til kaliumtap.',advice:'Vurder legemiddelbidrag, væskestatus, magnesium og behov for oppfølging sammen med lege. Kombinasjon med kaliumsparende behandling opphever ikke et målt lavt kalium.',refs:['lowK']},
  {id:'low-k-digoxin',kind:'lab',lab:'potassium',direction:'low',atc:['C01AA05'],title:'Lavt kalium ved digoksinbruk',detail:'Lavt kalium øker følsomheten for digitalis og risikoen for arytmi. Digoksin er ikke her markert som årsak til kaliumtap.',advice:'Avklar symptomer, EKG, nyrefunksjon og behov for kontroll av digoksinkonsentrasjon.',refs:['lowK']},
  {id:'high-k',kind:'lab',lab:'potassium',direction:'high',atc:['C09AA','C09CA','C09XA02','C03DA','C03DB','A12BA','J01EA01','J01EE01'],title:'Høyt kalium og legemiddel som kan øke kalium',detail:'RAAS-hemmere, kaliumsparende diuretika, kaliumtilskudd og trimetoprim kan bidra til økt kalium. Kombinasjonspreparater vurderes etter kartlagte virkestoffer.',advice:'Kontroller prøvesvaret, inkludert mulig hemolyse. Vurder nyrefunksjon, tilskudd og samlet behandling. Avklar videre håndtering med lege ut fra nivå, symptomer og EKG.',refs:['highK']},
  {id:'low-na',kind:'lab',lab:'sodium',direction:'low',atc:['C03AA','C03BA','N06AB','N03AF01','N03AF02','J01EA01','J01EE01','H01BA02'],title:'Lavt natrium og mulig legemiddelbidrag',detail:'Tiazider/tiazidlignende diuretika, SSRI, karbamazepin, okskarbazepin, trimetoprim og desmopressin kan være relevante ved lavt natrium.',advice:'Vurder væskestatus, symptomer, glukose og tidsforløp. Drøft om legemiddelet bidrar og hvordan kontroll eller endring skal følges opp. En verdi alene påviser ikke SIADH.',refs:['lowNa','lithium']},
  {id:'high-na-lithium',kind:'lab',lab:'sodium',direction:'high',atc:['N05AN01'],title:'Høyt natrium ved litiumbruk',detail:'Litium kan svekke nyrenes evne til å konsentrere urin. Vanntap ved nefrogen diabetes insipidus kan bidra til høyt natrium.',advice:'Avklar tørste, urinmengde, væskeinntak, nyrefunksjon og litiumkonsentrasjon med lege. Andre årsaker til vanntap må også vurderes.',refs:['highNa','lithium']},
  {id:'parkinson-metoclopramide',kind:'disease',atc:['A03FA01'],icd:['G20'],icpc:[],level:1,title:'Parkinsons sykdom og metoklopramid',detail:'Metoklopramid blokkerer dopaminreseptorer og kan forverre Parkinsons sykdom. Parkinsons sykdom er oppført som kontraindikasjon.',advice:'Kontroller at diagnosen gjelder og avklar behandlingen og et egnet alternativ med lege. Se preparatomtalens punkt 4.3 og 4.4.',refs:['metoclopramide']},
  {id:'parkinsonism-metoclopramide',kind:'disease',atc:['A03FA01'],icd:['G21'],icpc:['N87'],level:2,title:'Parkinsonisme og metoklopramid – avklar diagnose',detail:'ICPC-2 N87 omfatter flere former for parkinsonisme, ikke bare Parkinsons sykdom. Metoklopramid kan utløse eller forverre parkinsonistiske symptomer.',advice:'Avklar diagnosen og mulig legemiddelbidrag. Ved Parkinsons sykdom er metoklopramid kontraindisert. Kategorien alene fastslår ikke denne diagnosen.',refs:['metoclopramide']},
  {id:'asthma-propranolol',kind:'disease',atc:['C07AA05'],icd:['J45','J46'],icpc:['R96'],level:1,title:'Astma og propranolol',detail:'Propranolol er en ikke-selektiv betablokker som kan gi bronkospasme. Astma, også i sykehistorien, er oppført som kontraindikasjon.',advice:'Avklar behandlingen med lege og kontroller preparatomtalen. Betablokkerbehandling skal ikke avsluttes brått på egen hånd. Dette treffet gjelder propranolol, ikke alle betablokkere.',refs:['propranolol']},
  {id:'hf-nsaid',kind:'disease',nsaid:true,icd:['I50','I11.0','I13.0','I13.2'],icpc:['K77'],level:2,title:'Hjertesvikt og systemisk NSAID',detail:'NSAID kan gi væskeretensjon og forverre nyre- og hjertefunksjon ved hjertesvikt.',advice:'Avklar alvorlighetsgrad, symptomer, nyrefunksjon, varighet og behandlingsalternativ. Kontraindikasjonene varierer med preparatet og graden av hjertesvikt; diagnosekoden alene er ikke nok til å avgjøre dette.',refs:['nsaid']},
  {id:'ulcer-nsaid',kind:'disease',nsaid:true,icd:['K25','K26','K27','K28'],icpc:['D85','D86'],level:2,title:'Ulcus i sykehistorien og systemisk NSAID',detail:'Ulcus i sykehistorien øker risikoen for gastrointestinal skade ved NSAID-bruk.',advice:'Avklar om såret er aktivt, tidligere blødning/perforasjon og gjentatte sår. Kontroller kontraindikasjoner og behov for alternativ behandling eller gastrobeskyttelse. Historisk kode alene dokumenterer ikke aktivt ulcus.',refs:['nsaid']}
 ];
 const norm=v=>String(v??'').trim().toLowerCase();
 const number=v=>/^\d+(?:[.,]\d+)?$/.test(String(v??'').trim())?Number(String(v).trim().replace(',','.')):null;
 const adult=p=>{const v=String(p.age??'').trim(),n=number(v);return !v||(n!==null&&n>=18&&n<=120);};
 const active=m=>!['pausert','seponert'].includes(norm(m.status))&&norm(m.schedule)!=='bruker ikke'&&!['0','s','bruker ikke','seponert','pausert'].includes(norm(m.actualDose));
 const route=m=>/øy|oye|ophthalm/i.test(m.form||'')?'eye':/nese|nasal/i.test(m.form||'')?'nose':/inhal/i.test(m.form||'')?'inhaled':/øre|ore|otic/i.test(m.form||'')?'ear':/krem|salve|gel|kutan|sjampo|plaster|transderm/i.test(m.form||'')?'skin':'systemic';
 const nsaid=atc=>/^(M01A[ABCEGH]\d{2}|M01AX01)$/.test(atc);
 function index(products){const byId=new Map(products.map(p=>[p.id,p])),single=new Map();for(const p of products)if(p.ingredientIds?.length===1&&/^[A-Z]\d{2}[A-Z]{2}\d{2}$/.test(p.atc||'')){const id=p.ingredientIds[0];if(!single.has(id))single.set(id,new Set());single.get(id).add(p.atc);}return {byId,single};}
 function product(m,idx){const p=idx.byId.get(m.catalogId);return p&&p.atc===m.atc?p:null;}
 function codes(m,idx){const atc=String(m.atc||'').trim().toUpperCase();if(!/^[A-Z]\d{2}[A-Z]{2}\d{2}$/.test(atc))return [];const p=product(m,idx);return [...new Set([atc,...(p?.ingredientIds?.length>1?p.ingredientIds.flatMap(id=>[...(idx.single.get(id)||[])]):[])])];}
 function labValue(raw,key){const text=String(raw??'').trim(),v=number(text);if(!text)return {state:'missing'};if(v===null||v<=0||v>(key==='potassium'?20:300))return {state:'invalid'};const [lo,hi]=key==='potassium'?[3.6,5]:[137,145];return {value:v,state:v<lo?'low':v>hi?'high':'within',lo,hi};}
 function diagnosis(d,r){const c=String(d.code||'').toUpperCase().replace(/\./g,'');if(d.system==='ICD-10'&&/^[A-Z]\d{2}[A-Z0-9]{0,4}$/.test(c))return r.icd.some(p=>c.startsWith(p.replace(/\./g,'')));if(d.system==='ICPC-2'&&/^[A-Z]\d{2}$/.test(c))return r.icpc.includes(c);return false;}
 function findings(meds,profile,diagnoses,idx){
  const out=[],list=meds.filter(active),used=new Map();
  for(const m of list){const p=product(m,idx);for(const id of new Set(p?.ingredientIds||[])){const key=route(p)+'|'+id;if(!used.has(key))used.set(key,[]);used.get(key).push({m,p,id});}}
  for(const members of used.values())if(members.length>1){const first=members[0],name=first.p.ingredients?.[first.p.ingredientIds.indexOf(first.id)]||first.p.substance;out.push({rule:'duplicate',kind:'duplicate',level:2,medIds:members.map(x=>x.m.id),ingredient:name});}
  if(!adult(profile))return out;
  for(const m of list){if(route(product(m,idx)||m)!=='systemic')continue;const atcs=codes(m,idx);
   for(const r of rules){if(r.kind==='duplicate'||!(r.nsaid?atcs.some(nsaid):atcs.some(c=>r.atc.some(p=>c.startsWith(p)))))continue;
    if(r.kind==='lab'){const lab=labValue(profile[r.lab],r.lab);if(lab.state===r.direction)out.push({rule:r.id,kind:r.kind,level:2,medIds:[m.id],value:lab.value,lab:r.lab});}
    else {const matched=diagnoses.filter(d=>diagnosis(d,r));if(matched.length)out.push({rule:r.id,kind:r.kind,level:r.level,medIds:[m.id],diagnoses:matched});}
   }
  }
  // G20 is more precise than the broad N87 category if both were entered.
  return out.filter(f=>f.rule!=='parkinsonism-metoclopramide'||!out.some(g=>g.rule==='parkinson-metoclopramide'&&g.medIds[0]===f.medIds[0]));
 }
 const api={sources,rules,index,product,codes,labValue,findings,active,adult,route};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;root.IMMLrpSignals=api;
})(typeof window!=='undefined'?window:globalThis);
