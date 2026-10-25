/* Display policy reviewed 25.10.2026. These are prompts for source review, never dose decisions.
   A name in a renal reference is NOT a positive finding. eGFR <60 is a local review
   trigger (KDIGO G3a–G5), not a universal dose threshold or a diagnosis of CKD.
   CrCl thresholds below use only Cockcroft–Gault; indexed eGFR is never substituted.
   Evidence links and explicit exceptions are exposed under Help and in source tabs. */
(function(root){
 'use strict';
 const sources={
  kdigo:'https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf',
  method:'https://www.sps.nhs.uk/articles/calculating-kidney-function/',
  gabapentin:'https://produktinformasjon.legemiddelsok.no/preparatomtaler/15-10874.pdf',
  pregabalin:'https://www.ema.europa.eu/en/documents/product-information/lyrica-epar-product-information_en.pdf',
  apixaban:'https://www.ema.europa.eu/en/documents/product-information/eliquis-epar-product-information_en.pdf',
  ceftriaxone:'https://produktinformasjon.legemiddelsok.no/preparatomtaler/11-8744.pdf',
  moxifloxacin:'https://www.felleskatalogen.no/medisin/xinaflox-2care4-generics-786257'
 };
 const crclRules={
  N02BF01:{below:80,source:sources.gabapentin},N03AX12:{below:80,source:sources.gabapentin},
  N02BF02:{below:60,source:sources.pregabalin},N03AX16:{below:60,source:sources.pregabalin},
  B01AF02:{below:30,source:sources.apixaban},
  J01DD04:{below:10,screenBelow:15,source:sources.ceftriaxone}
 };
 const number=v=>{const t=String(v??'').trim().replace(',','.');return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(t)&&Number.isFinite(+t)?+t:null;};
 function context(p,cg=null){
  const age=number(p.age),g=number(p.egfr),c=number(cg);
  if(age===null||age<18||age>=140)return {reason:'Oppgi voksen alder for nyrekontrollpunktene.',egfr:null,cg:null};
  if(p.dialysis)return {reason:'Dialyse krever egne dosekilder. Vanlige nyregrenser brukes ikke.',special:true,egfr:null,cg:null};
  if(p.pregnant)return {reason:'Graviditet krever særskilt vurdering av nyrefunksjon og legemidler.',special:true,egfr:null,cg:null};
  if(p.stability==='unstable')return {reason:'Akutt eller skiftende nyrefunksjon: vurder prøvetrend og legemidler særskilt.',special:true,egfr:null,cg:null};
  if(p.stability!=='stable')return {reason:'Avklar om nyrefunksjonen er stabil før nyremarkeringene vurderes.',egfr:null,cg:null};
  const egfr=g!==null&&g>0?g:null,crcl=c!==null&&c>0?c:null;
  return {egfr,cg:crcl,reason:egfr===null&&crcl===null?'Nyrefunksjon mangler. Oppgi eGFR eller beregn CrCl før nyremarkeringene vurderes.':''};
 }
 function assess(m,p,rules,cg=null){
  if(['Pausert','Seponert'].includes(m.status)||m.schedule==='Bruker ikke')return null;
  const atc=String(m.atc||'').trim().toUpperCase(),c=context(p,cg);
  if(c.reason||!/^[A-Z]\d{2}[A-Z]{2}\d{2}$/.test(atc))return null;
  // Local preparations do not inherit systemic warnings from their ingredient names.
  if(/^(?:D|S|M02|R01|R02|R03)/.test(atc)||/øyedråp|øyesalve|nesespray|krem|salve|kutan|inhalasjon/i.test(m.form||''))return null;
  const exact=crclRules[atc];
  if(exact){
   if(c.cg!==null){
    if(c.cg>=exact.below)return null;
    return {kind:'review',label:'Kontroller nyredose',reason:`CrCl ${c.cg.toFixed(1)} ml/min er under ${exact.below}. Kontroller preparatomtalens vilkår, indikasjon og aktuell dose.`,source:exact.source};
   }
   if(c.egfr!==null&&c.egfr<(exact.screenBelow||60))return {kind:'missing',label:'Avklar CrCl',reason:`eGFR ${c.egfr} ml/min/1,73 m² er ikke CrCl. Beregn kreatininclearance før legemidlets CrCl-grenser vurderes.`,source:exact.source};
   return null;
  }
  // Neither a rare idiosyncratic adverse effect nor a whole reference index warrants
  // a routine per-drug alarm. These medicines remain available via Fagkilder.
  if(atc.startsWith('A02BC')||atc==='J01MA14')return null;
  if(c.egfr===null||c.egfr>=60)return null;
  const relevant=rules.filter(r=>r&&r.kind==='renal');
  if(!relevant.length)return null;
  const names=relevant.map(r=>r.label).join(', ');
  const doac=/^B01A(?:E07|F\d{2})$/.test(atc);
  if(doac&&c.cg===null)return {kind:'missing',label:'Avklar CrCl',reason:`eGFR ${c.egfr} ml/min/1,73 m². DOAK vurderes med Cockcroft–Gault, indikasjon og øvrige dosekriterier. CrCl er ikke beregnet.`,source:sources.method};
  const label=relevant.some(r=>/kalium|RAAS|Trimetoprim|Hepariner|Diuretika|Magnesium|vitamin D/i.test(r.label))?'Vurder prøver':'Vurder nyrehensyn';
  return {kind:'review',label,reason:`eGFR ${c.egfr} ml/min/1,73 m². ${names}: ${label==='Vurder prøver'?'kontroller aktuelle elektrolytter, væskestatus og prøvetrend':'kontroller legemiddelspesifikke nyrehensyn i fagkilden'}. Dette er et kontrollpunkt; dosen og et eventuelt LRP er ikke fastslått.`,source:relevant[0].source};
 }
 const api={context,assess,sources,crclRules};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.IMMRenal=api;
})(typeof window!=='undefined'?window:null);
