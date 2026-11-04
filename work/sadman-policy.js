/* SADMAN/SADMANS: a medication-class lookup, not a diagnosis of dehydration
 * or an instruction to discontinue treatment. Reviewed 2026-11-04.
 * Explicit ATC groups and combination codes; no inference from brand names.
 * See sadman-sources.md for scope, exceptions and evidence. */
(function(root){
 'use strict';
 const sources={
  consensus:'https://pubmed.ncbi.nlm.nih.gov/36470530/',
  trial:'https://pubmed.ncbi.nlm.nih.gov/36046613/',
  review:'https://pubmed.ncbi.nlm.nih.gov/36046611/',
  kdigo:'https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf#page=136',
  norway:'https://www.nephro.no/veileder/CKD_veileder_fastleger_minirevisjon_april_2026.pdf',
  diabetes:'https://www.helsedirektoratet.no/retningslinjer/diabetes/behandling-med-blodsukkersenkende-legemidler-ved-diabetes/blodsukkersenkende-behandling-ved-interkurrent-sykdom-og-steroidbehandling',
  canada:'https://www.diabetes.ca/for-professionals/appendices/appendix-8'
 };
 const groups=[
  {id:'su',letter:'S',name:'Sulfonylurea',examples:'glimepirid, glipizid, glibenklamid',prefixes:['A10BB'],exact:['A10BD01','A10BD02','A10BD04','A10BD06','A10BD32'],risk:'Redusert matinntak og lavt blodsukker kan gjøre behandlingen risikabel.',advice:'Kontroller blodsukker og matinntak. Pause eller doseendring må vurderes særskilt; sulfonylurea skal ikke automatisk pauses bare fordi det er akutt sykdom.',refs:['consensus','canada']},
  {id:'ace',letter:'A',name:'ACE-hemmere',examples:'ramipril, enalapril, lisinopril',prefixes:['C09A','C09B'],exact:['C10BX04','C10BX06','C10BX07','C10BX11','C10BX12','C10BX13','C10BX14','C10BX15','C10BX17','C10BX18','C10BX21','C10BX23'],risk:'Ved væsketap kan blodtrykksfall og redusert nyrefiltrasjon bli problematisk.',advice:'Vurder midlertidig pause ved betydelig dehydrering. Avklar blodtrykk, nyrefunksjon, kalium og behandlingsindikasjon med lege.',refs:['norway','consensus']},
  {id:'diuretic',letter:'D',name:'Diuretika',examples:'furosemid, bumetanid, hydroklortiazid, spironolakton',prefixes:['C03A','C03B','C03C','C03DB','C03E','C07B','C07C','C07D','C02L','C09BA','C09DA'],exact:['C03DA01','C03DA02','C03DA03','C03DA04','C03DA54','C09BX01','C09BX03','C09BX06','C09DX01','C09DX03','C09DX06','C09DX07','C09DX08','C09DX09','C09XA52','C09XA54','C10BX13'],risk:'Kan forsterke væsketap og forstyrrelser i elektrolytter.',advice:'Vurder væskestatus og behov for midlertidig pause. Ved hjertesvikt må dehydrering skilles fra væskeopphopning; ukritisk pause kan forverre svikten.',refs:['norway','consensus','trial']},
  {id:'metformin',letter:'M',name:'Metformin',examples:'metformin, også i kombinasjonstabletter',prefixes:[],exact:['A10BA02','A10BD02','A10BD03','A10BD05','A10BD07','A10BD08','A10BD10','A10BD11','A10BD13','A10BD14','A10BD15','A10BD16','A10BD17','A10BD18','A10BD20','A10BD22','A10BD23','A10BD25','A10BD26','A10BD27','A10BD28','A10BD31','A10BD34'],risk:'Akutt nyrepåvirkning ved dehydrering kan gi akkumulering og økt risiko for laktacidose.',advice:'Vurder midlertidig pause ved dehydrering eller akutt nyrepåvirkning. Avklar nyrefunksjon og klinisk bedring før gjenoppstart.',refs:['diabetes','norway','consensus']},
  {id:'arb',letter:'A',name:'Angiotensin II-reseptorblokkere (ARB)',examples:'kandesartan, losartan, valsartan; også valsartan/sakubitril',prefixes:['C09C','C09D'],exact:['C10BX10','C10BX16','C10BX19','C10BX20','C10BX24'],risk:'Ved væsketap kan blodtrykk og nyrefiltrasjon falle.',advice:'Vurder midlertidig pause ved betydelig dehydrering. Valsartan/sakubitril inngår på grunn av valsartan; ved hjertesvikt må væskestatus og gjenoppstart vurderes individuelt.',refs:['norway','consensus','trial']},
  {id:'nsaid',letter:'N',name:'Systemiske NSAID',examples:'ibuprofen, naproksen, diklofenak, celekoksib',prefixes:['M01AA','M01AB','M01AC','M01AE','M01AG','M01AH'],exact:['M01AX01','M01AX02','M01AX04','M01AX07','M01AX13','M01AX17','M01AX18','M01AX22','M01AX23','M01AX68'],risk:'Kan redusere nyregjennomblødningen og øke risikoen for akutt nyreskade ved dehydrering.',advice:'Vurder midlertidig pause ved dehydrering. Ta også med reseptfri bruk. Lavdose acetylsalisylsyre som platehemmer og lokale hud-/øyepreparater omfattes ikke av denne markeringen.',refs:['consensus','kdigo']},
  {id:'sglt2',letter:'S',name:'SGLT2-hemmere',examples:'dapagliflozin, empagliflozin',prefixes:['A10BK'],exact:['A10BD15','A10BD16','A10BD19','A10BD20','A10BD21','A10BD23','A10BD24','A10BD25','A10BD27','A10BD29','A10BD30','A10BD31','A10BD32','A10BD33','A10BD34','C03DA54'],risk:'Væsketap og ketoacidose er relevante hensyn ved akutt sykdom; ketoacidose kan forekomme uten svært høyt blodsukker.',advice:'Vurder midlertidig pause ved dehydrering eller alvorlig akutt sykdom. Symptomer som kvalme, magesmerter, oppkast eller rask pust krever vurdering av ketoacidose. Følg preparatomtalens vilkår for gjenoppstart.',refs:['norway','consensus','canada']},
  {id:'renin',letter:'D+',name:'Direkte reninhemmer',examples:'aliskiren',prefixes:[],exact:['C09XA02','C09XA52','C09XA53','C09XA54','C09DX02'],risk:'Hemming av renin–angiotensinsystemet kan bli problematisk ved væsketap.',advice:'Aliskiren er et tillegg omtalt i KDIGOs SADMANS-beskrivelse. Vurder blodtrykk, nyrefunksjon, kalium og eventuell midlertidig pause.',refs:['kdigo']}
 ];
 const norm=v=>String(v??'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ø/g,'o').replace(/æ/g,'ae');
 function active(m){return !['pausert','seponert'].includes(norm(m.status))&&norm(m.schedule)!=='bruker ikke'&&!['0','s'].includes(norm(m.actualDose??m.dose));}
 function classify(m){
  const atc=String(m.atc||'').trim().toUpperCase();
  if(!/^[A-Z]\d{2}[A-Z]{2}\d{2}$/.test(atc))return [];
  // Do not attach a systemic lookup to a conflicting local formulation.
  if(/oyedrap|oyesalve|nesespray|krem|salve|kutan|gel\b|plaster|inhalasjon|munnskyll|sugetablett/.test(norm(m.form)))return [];
  return groups.filter(g=>g.exact.includes(atc)||g.prefixes.some(p=>atc.startsWith(p)));
 }
 function forMedicine(m,profile={}){
  const text=String(profile.age??'').trim().replace(',','.');
  if(text&&(!/^\d+(?:\.\d+)?$/.test(text)||+text<18||+text>=140))return [];
  return active(m)?classify(m):[];
 }
 const api={sources,groups,classify,forMedicine,active};
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.IMMSadman=api;
})(typeof window!=='undefined'?window:null);
