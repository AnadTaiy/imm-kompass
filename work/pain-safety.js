/* Source-backed review prompts, reviewed 2026-11-06. No diagnosis or dose changes. */
(function(root){
 'use strict';
 const S=root.IMMLrpSignals||(typeof require==='function'?require('./lrp-signals.js'):null);
 const sources={
  safeOpioid:['Helsedirektoratet – trygg bruk av avhengighetsskapende legemidler','https://www.helsedirektoratet.no/veiledere/avhengighetsskapende-legemidler/trygg-bruk-av-avhengighetsskapende-legemidler'],
  opioid:['Legemiddelhåndboka – opioidanalgetika','https://www.legemiddelhandboka.no/extended/virkestoff/opioidanalgetika'],
  benzo:['MHRA – opioider og benzodiazepiner/Z-hypnotika','https://www.gov.uk/drug-safety-update/benzodiazepines-and-opioids-reminder-of-risk-of-potentially-fatal-respiratory-depression'],
  gabapentinoid:['MHRA – pregabalin og respirasjonsdepresjon','https://www.gov.uk/drug-safety-update/pregabalin-lyrica-reports-of-severe-respiratory-depression'],
  breathing:['FDA – gabapentin/pregabalin, opioider og lungesykdom','https://www.fda.gov/safety/medical-product-safety-information/neurontin-gralise-horizant-gabapentin-and-lyrica-lyrica-cr-pregabalin-drug-safety-communication'],
  oxyLung:['OxyNorm – preparatomtale, punkt 4.3–4.5 (eksempel)','https://preparatomtaler.blob.core.windows.net/spc/2001-09979.pdf'],
  moh:['Legemiddelhåndboka – medikamentoverforbrukshodepine','https://www.legemiddelhandboka.no/extended/nevrologiske-sykdommer/hodepine-og-ansiktssmerter/medikamentoverforbrukshodepine-moh'],
  ichd:['IHS / ICHD-3 – kriterier for medikamentoverforbrukshodepine','https://ichd-3.org/8-headache-attributed-to-a-substance-or-its-withdrawal/8-2-medication-overuse-headache-moh/'],
  combination:['ICHD-3 – kombinasjonsanalgetika','https://ichd-3.org/8-headache-attributed-to-a-substance-or-its-withdrawal/8-2-medication-overuse-headache-moh/8-2-5-combination-analgesic-overuse-headache/']
 };
 const rules=[
  {id:'resp-opioid-benzo',kind:'respiration',title:'Opioid sammen med benzodiazepin eller Z-hypnotikum',detail:'Kombinasjonen kan forsterke sedasjon og hemme pusten. Risikoen må vurderes også ved behovsbruk dersom legemidlene tas samtidig.',advice:'Avklar faktisk samtidig bruk, dose, nylig oppstart eller doseøkning og behov for overvåkning. Vurder alternativer med lege. KOLS, astma og redusert lungefunksjon gjør vurderingen særlig viktig. Langvarig opioid- eller benzodiazepinbehandling skal ikke avsluttes brått uten plan.',refs:['safeOpioid','opioid','benzo']},
  {id:'resp-opioid-gaba',kind:'respiration',title:'Opioid sammen med gabapentin eller pregabalin',detail:'Gabapentinoider sammen med opioider kan øke risikoen for alvorlig respirasjonsdepresjon.',advice:'Vurder samtidig bruk, sedasjon, nyrefunksjon, dose og oppfølging med lege. Eldre og pasienter med nedsatt lungefunksjon, blant annet ved KOLS, er særlig utsatt. Ingen trygg kombinasjonsdose beregnes her.',refs:['safeOpioid','opioid','gabapentinoid','breathing']},
  {id:'resp-lung',kind:'respiration',title:'Respirasjonshemmende legemiddel ved registrert KOLS eller astma',detail:'Opioider og gabapentin/pregabalin krever særlig vurdering ved redusert lungefunksjon. Diagnosekoden beskriver ikke alene hvor alvorlig sykdommen er.',advice:'Avklar sykdomskontroll, forverring, lungefunksjon og andre dempende midler. Kontroller det aktuelle preparatets punkt 4.3–4.5: enkelte opioider har kontraindikasjoner ved alvorlig KOLS eller alvorlig astma. Vanlig astma/KOLS-kode alene merkes derfor ikke som en påvist kontraindikasjon.',refs:['safeOpioid','opioid','oxyLung','gabapentinoid','breathing']},
  {id:'moh-10',kind:'headache',title:'Hodepine og legemidler med 10-dagersgrense i MOH-kriteriene',detail:'Triptaner, ergotamin, opioide analgetika og kombinasjonsanalgetika med opioid eller koffein kan bidra til medikamentoverforbrukshodepine ved hyppig bruk.',advice:'Avklar bruksdager per måned og varighet med hodepinedagbok. ICHD-3 bruker minst 10 bruksdager per måned i mer enn 3 måneder; MOH krever også hodepine minst 15 dager per måned og klinisk vurdering av årsak. En registrert kombinasjon er ikke en diagnose.',refs:['moh','ichd','combination']},
  {id:'moh-15',kind:'headache',title:'Hodepine og ikke-opioide smertestillende',detail:'Paracetamol, acetylsalisylsyre i smertedose og systemiske NSAID kan bidra til medikamentoverforbrukshodepine ved hyppig bruk.',advice:'ICHD-3 bruker samlet minst 15 bruksdager per måned for ikke-opioide analgetika i mer enn 3 måneder. MOH krever også hodepine minst 15 dager per måned og klinisk vurdering. Kartlegg flere preparater samlet; samme kalenderdag telles én gang, ikke én gang per preparat.',refs:['moh','ichd']},
  {id:'moh-check',kind:'headache',title:'Kombinasjonspreparat – avklar innhold og risiko for overforbrukshodepine',detail:'Preparatet er et kombinasjonsanalgetikum, men innholdet er ikke sikkert nok kartlagt til å velge en 10- eller 15-dagersgrense.',advice:'Kontroller virkestoffene og faktisk bruk i preparatomtalen og ICHD-3. En kombinasjon av bare ikke-opioide analgetika har ikke automatisk 10-dagersgrense.',refs:['moh','ichd','combination']}
 ];
 const group=(m,idx)=>{const codes=S.codes(m,idx);return {
  opioid:codes.some(c=>/^N02A/.test(c)||['N07BC01','N07BC02','N07BC03','N07BC05','N07BC06','N07BC51','R05DA01','R05DA03','R05DA04','R05FA01','R05FA02'].includes(c)),
  benzo:codes.some(c=>/^(N05BA|N05CD|N05CF|N03AE)/.test(c)),
  gaba:codes.some(c=>['N02BF01','N02BF02','N03AX12','N03AX16'].includes(c))
 };};
 const nsaid=c=>/^(M01A[ABCEGH]\d{2}|M01AX01)$/.test(c);
 const nonopioid=c=>c==='N02BE01'||/^N02B[AB][0-4]\d$/.test(c)||nsaid(c);
 function headacheClass(m,idx){
  const c=String(m.atc||'').toUpperCase(),p=S.product(m,idx),codes=S.codes(m,idx);
  if(/^N02A/.test(c)||/^N02CC/.test(c)||['N02CA01','N02CA02','N02CA51','N02CA52'].includes(c))return 10;
  if(/^N02B[ABE][5-9]\d$/.test(c)){
   if(!p?.ingredientIds?.length)return 'check';
   if(codes.some(x=>/^N02A/.test(x)||['R05DA04','N06BC01'].includes(x)))return 10;
   if(p.ingredientIds.every(id=>[...(idx.single.get(id)||[])].some(nonopioid)))return 15;
   return 'check';
  }
  return nonopioid(c)?15:null; // Excludes low-dose antiplatelet ASA, topical NSAID, gepants and preventive drugs.
 }
 const dx=(d,icd,icpc)=>d.system==='ICD-10'?icd.some(c=>String(d.code||'').replace(/\./g,'').startsWith(c)):d.system==='ICPC-2'&&icpc.includes(d.code);
 const headacheContext=ds=>ds.some(d=>dx(d,['G43','G44','R51'],['N01','N89','N90','N95']));
 const primaryHeadache=ds=>ds.some(d=>dx(d,['G43','G440','G442'],['N89','N90','N95']));
 const days=raw=>{const v=String(raw??'').trim();return /^\d{1,2}$/.test(v)&&+v<=31?+v:null;};
 function findings(meds,profile,diagnoses,idx){
  if(!S.adult(profile))return [];
  const list=meds.filter(S.active),out=[],lung=diagnoses.filter(d=>dx(d,['J43','J44','J45','J46'],['R95','R96']));
  for(const m of list){const g=group(m,idx);if(g.opioid)for(const other of list){if(other.id===m.id)continue;const h=group(other,idx);for(const [key,rule]of [['benzo','resp-opioid-benzo'],['gaba','resp-opioid-gaba']])if(h[key])out.push({rule,kind:'respiration',level:2,medIds:[m.id,other.id],lung:lung.length>0,evidence:`${m.name} + ${other.name}. Avklar samtidig bruk.${lung.length?' Registrert KOLS/astma: vurder lungefunksjon og alvorlighetsgrad.':''}`});}
   if(lung.length&&(g.opioid||g.gaba))out.push({rule:'resp-lung',kind:'respiration',level:2,medIds:[m.id],lung:true,evidence:'Registrert KOLS/astma og '+m.name+'. Sykdomsgrad og lungefunksjon må avklares.'});
   const cls=headacheClass(m,idx);if(!cls||!headacheContext(diagnoses))continue;
   const used=days(m.headacheUseDays),head=days(profile.headacheDays),over=m.headacheOver3Months==='yes';
   if(used===0||cls!=='check'&&used!==null&&used<cls)continue;
   const frequent=cls!=='check'&&used!==null&&used>=cls,possible=frequent&&over&&head!==null&&head>=15&&primaryHeadache(diagnoses);
   out.push({rule:cls==='check'?'moh-check':'moh-'+cls,kind:'headache',level:2,medIds:[m.id],stage:possible?'possible':frequent?'frequent':'check',evidence:(possible?'Mulig overforbrukshodepine – vilkår må vurderes av lege. ':frequent?'Hyppig bruk – vurder overforbruksrisiko. ':'Hodepine/migrene registrert – avklar bruksdager. ')+(used===null?'Bruksdager ikke avklart. ':used+' bruksdager/måned. ')+(over?'Dette bruksmønsteret er registrert i mer enn 3 måneder. ':'Varighet over 3 måneder er ikke bekreftet. ')+(head===null?'Hodepinedager ikke registrert.':head+' hodepinedager/måned.')});
  }
  return out;
 }
 function matchesSource(rule,m,idx){const g=group(m,idx);return rule.id==='resp-opioid-benzo'?g.opioid||g.benzo:rule.id==='resp-opioid-gaba'?g.opioid||g.gaba:rule.id==='resp-lung'?g.opioid||g.gaba:rule.kind==='headache'&&('moh-'+headacheClass(m,idx))===rule.id;}
 function peerRelevant(a,b,idx){const x=group(a,idx),y=group(b,idx);return x.opioid&&(y.benzo||y.gaba)||y.opioid&&(x.benzo||x.gaba);}
 const api={sources,rules,group,headacheClass,headacheContext,primaryHeadache,days,findings,matchesSource,peerRelevant};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;root.IMMPainSafety=api;
})(typeof window!=='undefined'?window:globalThis);
