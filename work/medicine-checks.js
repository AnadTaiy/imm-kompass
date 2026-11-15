/* Source-based review prompts, 2026-11-15. No diagnosis of deficiency,
 * no automatic prescription and no assertion that a monitoring test is overdue.
 * Rules are deliberately separate from interaction severity and START criteria. */
(function(root){
 'use strict';
 const S=root.IMMLrpSignals||(typeof require==='function'?require('./lrp-signals.js'):null);
 const sources={
  mcMetformin:['MHRA – metformin og vitamin B12','https://www.gov.uk/drug-safety-update/metformin-and-reduced-vitamin-b12-levels-new-advice-for-monitoring-patients-at-risk'],
  mcB12:['NICE NG239 – B12: symptomer, risikofaktorer og utredning','https://www.nice.org.uk/guidance/ng239/chapter/Recommendations#recognising-vitamin-b12-deficiency'],
  mcMg:['MHRA – PPI og hypomagnesemi','https://www.gov.uk/drug-safety-update/proton-pump-inhibitors-in-long-term-use-reports-of-hypomagnesaemia'],
  mcMtx:['Legemiddelhåndboka – metotreksat','https://www.legemiddelhandboka.no/extended/virkestoff/metotreksat'],
  mcMtxMonitor:['NHS SPS – oppfølging av metotreksat','https://sps.nhs.uk/monitorings/methotrexate-monitoring/'],
  mcLithium:['NHS SPS – oppfølging av litium','https://sps.nhs.uk/monitorings/lithium-monitoring/'],
  mcAmiodarone:['NHS SPS – oppfølging av amiodaron','https://sps.nhs.uk/monitorings/amiodarone-monitoring/'],
  mcDoac:['NHS SPS – oppfølging av DOAK','https://sps.nhs.uk/monitorings/doacs-direct-oral-anticoagulants-monitoring/'],
  mcRaas:['NHS SPS – oppfølging av ACE-hemmere og ARB','https://sps.nhs.uk/monitorings/ace-inhibitors-and-angiotensin-ii-receptor-blockers-monitoring/'],
  mcSpironolactone:['NHS SPS – oppfølging av spironolakton','https://sps.nhs.uk/monitorings/spironolactone-monitoring/'],
  mcNsaid:['Legemiddelhåndboka – NSAID','https://www.legemiddelhandboka.no/extended/ikke-steroide-antiinflammatoriske-midler-nsaid'],
  mcSteroid:['Legemiddelhåndboka – systemiske glukokortikoider','https://www.legemiddelhandboka.no/extended/glukokortikoider-for-systemisk-effekt-og-lokal-injeksjon'],
  mcOpioid:['Helsedirektoratet – smerte og obstipasjonsprofylakse ved palliasjon','https://www.helsedirektoratet.no/retningslinjer/palliasjon-i-kreftomsorgen-handlingsprogram/symptomer-og-tilstander/smerte'],
  mcStart:['Legemiddelhåndboka – START v3','https://www.legemiddelhandboka.no/start-v3'],
  mcScottish:['Skotsk veileder 2026–2029 – risikokombinasjoner','https://www.gov.scot/publications/polypharmacy-guidance-appropriate-prescribing-making-medicines-safe-effective-sustainable-2026-2029/pages/16/'],
  mcDmp:['DMP – sjekkliste for legemiddelgjennomgang','https://www.dmp.no/bivirkninger-og-sikkerhet/rad-til-helsepersonell/legemiddelgjennomgang'],
  mcMonitoring:['NHS SPS – legemiddelvis oppfølging','https://sps.nhs.uk/home/tools/drug-monitoring/'],
  mcThink:['ThinkCascades – ni prioriterte forskrivningskaskader','https://pmc.ncbi.nlm.nih.gov/articles/PMC9477172/'],
  mcPincer:['OpenSAFELY – PINCER-indikatorer','https://reports.opensafely.org/reports/changes-in-pincer-measures-throughout-the-covid-19-pandemic/']
 };
 const rules=[
  {id:'mc-metformin-b12',atc:['A10BA02'],title:'Metformin – vurder vitamin B12',detail:'Metformin kan redusere B12-nivået. Risikoen øker blant annet med dose, behandlingslengde og andre risikofaktorer.',advice:'Avklar anemi, nevropati og andre symptomer eller risikofaktorer. Vurder B12-prøve ved mistanke og periodisk kontroll hos risikopasienter. Behandle mangel når det er indisert; metforminbruk alene betyr ikke at alle trenger tilskudd. Kontroller også nyrefunksjon.',refs:['mcMetformin','mcB12']},
  {id:'mc-ppi-review',atc:['A02BC'],title:'PPI – varighet, B12 og magnesium',detail:'Ved langvarig syrehemming bør fortsatt indikasjon og laveste effektive dose revurderes. PPI er en risikofaktor for B12-mangel og kan gi hypomagnesemi.',advice:'Avklar varighet og symptomer før prøvetaking. B12 vurderes ved mistanke eller relevante risikofaktorer. Vurder magnesium ved langvarig bruk, særlig sammen med digoksin eller diuretika. Verken B12-tilskudd eller rutineprøver er automatisk nødvendig for alle.',refs:['mcB12','mcMg']},
  {id:'mc-mtx-folate',atc:['L04AX03','L01BA01'],title:'Metotreksat – avklar folsyre',detail:'Ved ukentlig lavdosebehandling for inflammatorisk sykdom brukes folsyre for å redusere bivirkninger. Ingen sikker folsyre- eller folinatregistrering er funnet i den aktive listen.',advice:'Kontroller om folsyre tas utenfor listen og hvilken plan spesialisten har gitt. Dose og tidspunkt avklares mot indikasjon og lokale råd. Onkologisk behandling og folinatredning følger egne protokoller; dette er ikke et råd for slike regimer.',refs:['mcMtx']},
  {id:'mc-mtx-monitor',atc:['L04AX03','L01BA01'],title:'Metotreksat – doseringsintervall og oppfølging',detail:'Metotreksat krever kontroll av blant annet blodceller, lever og nyrefunksjon. Ved antiinflammatorisk behandling tas metotreksat vanligvis én dag i uken; daglig feildosering kan være livstruende.',advice:'Bekreft indikasjon, faktisk doseringsintervall og avtalt kontrollplan. Ved mulig daglig feildosering av ukentlig behandling må lege kontaktes straks. Onkologiske regimer vurderes etter behandlingsprotokollen. Et oppslag her betyr ikke at prøver mangler eller er forsinket.',refs:['mcMtx','mcMtxMonitor']},
  {id:'mc-lithium-monitor',atc:['N05AN01'],title:'Litium – konsentrasjon, nyre, stoffskifte og kalsium',detail:'Litium har smalt terapeutisk vindu. Oppfølging omfatter litiumkonsentrasjon, nyrefunksjon, elektrolytter, kalsium og tyreoideafunksjon.',advice:'Kontroller avtalt prøvetaking, tidspunkt i forhold til siste dose, væskeinntak og interaksjoner. Endret væske-/saltbalanse, nyresvikt eller nye legemidler kan kreve tettere oppfølging. Mistanke om forgiftning krever rask medisinsk vurdering.',refs:['mcLithium']},
  {id:'mc-amiodarone-monitor',atc:['C01BD01'],title:'Amiodaron – stoffskifte, lever, EKG og lungesymptomer',detail:'Langvarig amiodaronbehandling krever oppfølging av tyreoidea, lever, elektrolytter og EKG. Ny eller økende hoste eller tungpust kan være tegn på lungetoksisitet.',advice:'Avklar kontrollplan og nye symptomer. Rutinemessig lungeavbildning anbefales ikke hos alle; mistanke om lungetoksisitet utredes målrettet. Dette kontrollpunktet påviser ikke en bivirkning.',refs:['mcAmiodarone']},
  {id:'mc-doac-monitor',atc:['B01AE07','B01AF01','B01AF02','B01AF03'],title:'DOAK – dosegrunnlag, nyrefunksjon og hemoglobin',detail:'Dose og oppfølging avhenger av preparat, indikasjon, nyrefunksjon, alder, vekt og interaksjoner. DOAK følges ikke med INR som warfarin.',advice:'Kontroller hemoglobin/blodstatus, lever- og nyrefunksjon, blødningstegn og etterlevelse. Bruk kreatininclearance etter Cockcroft–Gault der preparatomtalen krever det; eGFR er ikke automatisk utskiftbart. Avklar individuell kontrollhyppighet.',refs:['mcDoac']},
  {id:'mc-raas-monitor',atc:['C09AA','C09CA'],title:'ACE-hemmer / ARB – kalium og nyrefunksjon',detail:'Kreatinin/eGFR, kalium og blodtrykk må følges ved oppstart, doseendring og videre behandling. Akutt sykdom eller væsketap kan endre risikoen.',advice:'Avklar kontrollplan og utviklingen i verdiene. Et enkelt normalt prøvesvar utelukker ikke behov for oppfølging etter en endring. Vurder samlet behandling med diuretika, kaliumsparende midler og NSAID.',refs:['mcRaas']},
  {id:'mc-spironolactone-monitor',atc:['C03DA01'],title:'Spironolakton – kalium og nyrefunksjon',detail:'Spironolakton kan øke kalium, særlig ved nedsatt nyrefunksjon eller samtidig RAAS-hemming.',advice:'Avklar indikasjon og avtalt oppfølging av kalium og nyrefunksjon, særlig etter oppstart eller doseøkning. Kontrollintervallet tilpasses pasienten; kilden viser blant annet oppfølging ved hjertesvikt.',refs:['mcSpironolactone']},
  {id:'mc-opioid-bowel',atc:['N02A'],title:'Fast opioidbehandling – avklar obstipasjonsprofylakse',detail:'Regelmessig opioidbruk kan gi vedvarende obstipasjon. Ingen aktiv behandling med laksantia er gjenkjent i listen.',advice:'Avklar avføring, faktisk bruk, reseptfrie midler og behov for laksantia. Diaré, ileus, stomi og andre forhold kan endre vurderingen. Manglende registrering er ikke det samme som manglende behandling.',refs:['mcOpioid','mcStart']},
  {id:'mc-nsaid-gastro',nsaid:true,title:'NSAID – vurder magebeskyttelse',detail:'Systemisk NSAID og registrert risikofaktor gir grunn til å vurdere gastrointestinal sikkerhet. Ingen PPI eller misoprostol er gjenkjent i den aktive listen.',advice:'Vurder først om NSAID er egnet, deretter eventuell gastrobeskyttelse. Alder, tidligere ulcus, antitrombotisk behandling og glukokortikoider påvirker risiko. Magebeskyttelse opphever ikke kontraindikasjoner eller nyre-/hjerterisiko.',refs:['mcNsaid','mcScottish']},
  {id:'mc-steroid-bone',atc:['H02AB'],title:'Langvarig glukokortikoid – vurder beinhelse',detail:'Langvarig systemisk glukokortikoidbehandling kan øke risikoen for osteoporose og brudd.',advice:'Vurder samlet frakturrisiko, dose og behandlingslengde, kalsiuminntak, vitamin D og behov for DXA eller beinbeskyttende behandling. Eksisterende tilskudd erstatter ikke en risikovurdering. Behandlingsmål og forventet nytte må tas med.',refs:['mcSteroid']},
  {id:'mc-triple-renal',atc:['C09AA','C09CA','C03'],nsaidAlso:true,title:'NSAID + ACE-hemmer/ARB + diuretikum',detail:'Denne tredobbelkombinasjonen kan øke risikoen for akutt nyreskade, særlig ved væsketap eller redusert nyrefunksjon.',advice:'Bekreft faktisk samtidig bruk, også reseptfritt NSAID. Vurder om NSAID kan unngås og avklar væskestatus, nyrefunksjon og oppfølging med lege. Ikke stopp all behandling automatisk.',refs:['mcScottish']}
 ].map(r=>({...r,kind:'medicine',level:2}));
 const norm=v=>String(v??'').trim().toLowerCase();
 const weeks=m=>/^\d+(?:[.,]\d+)?$/.test(String(m.durationWeeks??''))?Number(String(m.durationWeeks).replace(',','.')):null;
 const regular=m=>norm(m.schedule)==='fast'&&!/\b(vb|ved behov|uregelmessig)\b/i.test(m.actualDose||'');
 const weekly=m=>/^\d+(?:[.,]\d+)?\s*u(?:\s|$)/i.test(m.actualDose||'')||/\bukentlig\b|\ben gang (?:i |per )?uken\b|\bhver uke\b/i.test(m.actualDose||'');
 const nsaid=c=>/^(M01A[ABCEGH]\d{2}|M01AX01)$/.test(c);
 function matchesSource(r,m,idx){const cs=S.codes(m,idx);return r.nsaid?cs.some(nsaid):cs.some(c=>(r.nsaidAlso&&nsaid(c))||r.atc.some(a=>c.startsWith(a)));}
 function findings(meds,profile,diagnoses,idx){
  // New rules require an explicit adult age. Unknown age is not assumed adult.
  if(!String(profile.age??'').trim()||!S.adult(profile))return [];
  const list=meds.filter(S.active),cs=m=>S.codes(m,idx),has=(m,prefix)=>cs(m).some(c=>prefix.some(p=>c.startsWith(p))),any=prefix=>list.some(m=>has(m,prefix)),out=[];
  const dx=(icd,icpc=[])=>diagnoses.some(d=>d.system==='ICD-10'?icd.some(c=>String(d.code).toUpperCase().startsWith(c)):d.system==='ICPC-2'&&icpc.includes(d.code));
  const giRisk=Number(profile.age)>=65||dx(['K25','K26','K27','K28'],['D85','D86'])||any(['B01A','H02AB']);
  const triple=list.some(m=>has(m,['C09AA','C09CA']))&&list.some(m=>has(m,['C03']))&&list.some(m=>cs(m).some(nsaid));
  for(const m of list){const p=S.product(m,idx)||m,route=S.route(p),w=weeks(m);
   for(const r of rules){if(!matchesSource(r,m,idx))continue;
    // Transdermal analgesic opioids are systemic; skin NSAIDs/steroids are not.
    if(route!=='systemic'&&!(r.id==='mc-opioid-bowel'&&/plaster|transderm/i.test(p.form||'')))continue;
    let evidence=r.title+'. Avklar oppfølging; registrerte data fastslår ikke at noe mangler.';
    if(r.id==='mc-ppi-review'&&(!regular(m)||(w!==null&&w<13)))continue;
    if(r.id==='mc-mtx-folate'){
     const indication=[{system:m.diagnosisSystem,code:m.diagnosisCode}],inflammatory=has(m,['L04AX03'])||indication.some(d=>d.system==='ICD-10'&&/^(M05|M06|L40|K50)/.test(d.code||''));
     if(!inflammatory||!weekly(m)||any(['B03BB01','V03AF03','V03AF04']))continue;
     evidence='Ukentlig metotreksat ved inflammatorisk behandling. Folsyre/folinat er ikke gjenkjent i aktiv liste; kontroller også tilskudd utenfor FEST.';
    }
    if(r.id==='mc-amiodarone-monitor'&&/inj|infus/i.test(p.form||''))continue;
    if(r.id==='mc-opioid-bowel'){
     if(!regular(m)||any(['A06A'])||dx(['R19.7','K56','Z93.2'],['D11']))continue;
     evidence='Fast opioidbehandling. Laksantia er ikke gjenkjent i aktiv liste; avklar faktisk bruk og tarmfunksjon.';
    }
    if(r.id==='mc-nsaid-gastro'){if(!giRisk||any(['A02BC','A02BB01']))continue;evidence='Systemisk NSAID og gastrointestinal risikofaktor. Magebeskyttelse er ikke gjenkjent i aktiv liste.';}
    if(r.id==='mc-steroid-bone'&&(!regular(m)||w===null||w<=13||!/tablett|kapsel|mikstur|peror|oral/i.test(p.form||'')))continue;
    if(r.id==='mc-triple-renal'){if(!triple)continue;evidence='Aktiv liste inneholder NSAID, ACE-hemmer/ARB og diuretikum. Avklar faktisk samtidig bruk.';}
    out.push({rule:r.id,kind:r.kind,level:2,medIds:[m.id],evidence});
   }
  }
  return out;
 }
 const api={sources,rules,findings,matchesSource};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.IMMMedicineChecks=api;
})(typeof window!=='undefined'?window:globalThis);
