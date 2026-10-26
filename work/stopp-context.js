/* Patient-specific suggestions, separate from the complete manual STOPP index.
 * Basis: STOPP v3 (2023, CC BY 4.0), Norwegian handbook revision 01.12.2024.
 * A diagnosis match suggests review; it never establishes severity, timing or indication.
 * No free-text inference, no inferred negative history, no automatic discontinuation. */
const STOPP_OAC=['B01AA','B01AE07','B01AF'];
const STOPP_DOAC=['B01AE07','B01AF'];
const STOPP_PGP=['C01BD01','C01BD07','J01FA','C07AG02','L04AD01','J02AC02','J02AB02','P01BC01','C01EB18','L02BA01','B01AC24','C08DA01'];
const STOPP_DX={
 af:[['I48'],['K78']],hf:[['I50'],['K77']],ht:[['I10','I11','I12','I13','I15'],['K86','K87']],
 vascular:[['I20','I21','I22','I25','I63','I69.3','I70','I73.9'],['K74','K75','K76','K90','K92']],
 stroke:[['I63','I69.3','G45'],['K89','K90']],dvt:[['I80.1','I80.2'],[]],pe:[['I26'],[]],
 dementia:[['F00','F01','F02','F03','G30'],['P70']],delirium:[['F05'],[]],parkinson:[['G20','G21','G22'],['N87']],
 constipation:[['K59.0'],['D12']],bph:[['N40'],['Y85']],retention:[['R33'],['U08']],
 glaucoma:[['H40.2'],[]],orthostasis:[['I95.1'],[]],syncope:[['R55'],['A06']],
 seizure:[['G40','G41'],['N88']],insomnia:[['F51.0','G47.0'],['P06']],
 ulcer:[['K25','K26','K27','K28'],['D85','D86']],upperGI:[['K20','K25','K26','K27','K28','K29','R13'],['D21','D84','D85','D86','D87']],
 dysphagia:[['R13'],['D21']],copd:[['J44'],['R95']],respFailure:[['J96'],[]],
 oa:[['M15','M16','M17','M18','M19'],['L89','L90','L91']],ra:[['M05','M06'],['L88']],gout:[['M10'],['T92']],
 dm2:[['E11'],['T90']],diabetes:[['E10','E11','E12','E13','E14'],['T89','T90']],
 breastCancer:[['C50','Z85.3'],['X76']],aorticStenosis:[['I35.0','I35.2'],[]],
 tremor:[['G25.0'],[]],drugParkinson:[['G21.0','G21.1','G21.2'],[]]
};
function stoppHasDx(name){const pair=STOPP_DX[name];return !!pair&&codedDiagnoses().some(d=>diagnosisMatches(d,...pair));}
function stoppCode(m){return String(m.atc||'').trim().toUpperCase();}
function stoppIs(m,prefixes){return prefixes.some(p=>stoppCode(m).startsWith(p));}
function stoppOther(m,prefixes){return activeMedicines().some(x=>x!==m&&(!m.id||x.id!==m.id)&&stoppIs(x,prefixes));}
function stoppPair(m,left,right){return stoppIs(m,left)&&stoppOther(m,right)||stoppIs(m,right)&&stoppOther(m,left);}
function stoppForm(m){return String(m.form||'')+' '+String(m.name||'');}
function stoppDrugMatches(r,m){
 const code=stoppCode(m);
 if(r.section!=='A'&&!atcMatches(code,r))return false;
 if(r.id==='STOPP-B20'&&/^C09[ABCD]/.test(code))return false; // Norwegian exception: ACEI/ARB, including fixed combinations.
 if(r.id==='STOPP-D12'&&['N05AH02','N05AH04'].includes(code))return false;
 if(['STOPP-I5','STOPP-K10'].includes(r.id)&&code==='G04CA04')return false;
 if(r.id==='STOPP-E6'&&code.startsWith('A10BD')&&!/metformin/i.test(m.ingredients||''))return false;
 if(r.id==='STOPP-J4'&&code.startsWith('A10BD')&&!/gliflozin/i.test(m.ingredients||''))return false;
 if(['STOPP-C4','STOPP-C5','STOPP-C8','STOPP-C9','STOPP-C10','STOPP-C12'].includes(r.id)&&code.startsWith('B01AE')&&code!=='B01AE07')return false;
 if(['STOPP-C15','STOPP-J5','STOPP-J6','STOPP-J8'].includes(r.id)&&/vagin|vag\b/i.test(stoppForm(m)))return false;
 if(r.id==='STOPP-H8'&&/infus|injeks|inj\b/i.test(stoppForm(m)))return false;
 if(r.id==='STOPP-L4'&&!/plaster|patch/i.test(stoppForm(m)))return false;
 return true;
}
function stoppAdditionalChecks(r,m){
 const id=r.id,c=state.clinicalFacts||{},out=[];
 const pair=(label,left,right)=>out.push({label,pass:stoppPair(m,left,right)});
 if(id==='STOPP-B13')pair('Aldosteronantagonist sammen med et annet kaliumsparende legemiddel',['C03DA'],['C03DA','C03DB','C09A','C09B','C09C','C09D']);
 if(id==='STOPP-C3')pair('Acetylsalisylsyre og klopidogrel er begge registrert',['B01AC06'],['B01AC04']);
 if(['STOPP-C4','STOPP-C5'].includes(id))pair('Platehemmer og oral antikoagulant er begge registrert',['B01AC'],STOPP_OAC);
 if(id==='STOPP-C12')pair('SSRI og oral antikoagulant er begge registrert',['N06AB'],STOPP_OAC);
 if(id==='STOPP-C13')pair('Dabigatran og verapamil/diltiazem er begge registrert',['B01AE07'],['C08DA01','C08DB01']);
 if(id==='STOPP-C14')pair('DOAK og en oppført P-gp-hemmer er begge registrert',STOPP_DOAC,STOPP_PGP);
 if(id==='STOPP-C7')out.push({label:'Platehemmer erstatter antikoagulasjon; ingen oral antikoagulant er registrert',pass:!activeMedicines().some(x=>stoppIs(x,STOPP_OAC))});
 if(id==='STOPP-D18')pair('Acetylkolinesterasehemmer og et pulssenkende legemiddel er begge registrert',['N06DA'],['C07','C01AA05','C08DB01','C08DA01']);
 if(id==='STOPP-M1')out.push({label:'Minst to legemidler fra de antikolinerge oppslagsgruppene er registrert',pass:activeMedicines().some(x=>x!==m&&(!m.id||x.id!==m.id)&&atcMatches(stoppCode(x),r))});
 if(id==='STOPP-H7')out.push({label:'Ingen samtidig protonpumpehemmer er registrert (norsk versjon)',pass:!activeMedicines().some(x=>stoppIs(x,['A02BC']))});
 if(id==='STOPP-B5'){
  if(stoppHasDx('af')||codedDiagnoses().some(d=>diagnosisMatches(d,['I20','I71'],['K74'])))out.push({label:'Annen registrert mulig indikasjon for betablokker må avklares',pass:false});
  if(stoppOther(m,['C02','C03','C07','C08','C09']))out.push({label:'Betablokker brukes alene mot hypertensjon',pass:false});
 }
 if(id==='STOPP-B9'){
  const k=IMMCalc.number(c.potassium),na=IMMCalc.number(c.sodium),ca=IMMCalc.number(c.calcium);
  out.push({label:'Kalium < 3,0, natrium < 130, korrigert kalsium > 2,65 eller urinsyregikt',pass:stoppHasDx('gout')||k>0&&k<3||na>0&&na<130||ca>2.65?true:null}); // Normal labs do not exclude an unrecorded gout history.
 }
 if(id==='STOPP-B15'){
  const q=IMMCalc.number(c.qtc),sex=state.profile.sex;
  out.push({label:'QTc over 450 ms hos menn eller 470 ms hos kvinner',pass:q===null||!['male','female'].includes(sex)?null:q>(sex==='male'?450:470)});
  if(['N06AB04','N06AB10'].includes(stoppCode(m))){const dose=IMMCalc.number(m.dailyDoseMg),limit=stoppCode(m)==='N06AB04'?20:10;out.push({label:'Døgndose over '+limit+' mg',pass:dose===null?null:dose>limit});}
 }
 if(id==='STOPP-C1'){const dose=IMMCalc.number(m.dailyDoseMg);out.push({label:'Acetylsalisylsyre over 100 mg/døgn',pass:dose===null?null:dose>100});}
 if(id==='STOPP-C16')out.push({label:'Acetylsalisylsyre brukes til primærforebygging',pass:m.treatmentPurpose==='primary'?true:m.treatmentPurpose==='secondary'?false:null});
 if(id==='STOPP-F2'){const weeks=IMMCalc.number(m.durationWeeks);out.push({label:'Behandling i over åtte uker',pass:weeks===null?null:weeks>8});}
 if(id==='STOPP-F4'){const dose=IMMCalc.number(m.dailyDoseMg);out.push({label:'Bekreftet elementær jerndose over 200 mg/døgn',pass:dose===null||c.ironDoseElemental!=='yes'?null:dose>200});}
 if(['STOPP-F5','STOPP-H1'].includes(id))out.push({label:'Ingen registrert syrehemmende beskyttelse som angitt i kriteriet',pass:!activeMedicines().some(x=>stoppIs(x,id==='STOPP-H1'?['A02BC','A02BA']:['A02BC']))});
 return out;
}
// Each criterion has an explicit suggestion policy. Unmodelled contexts stay in the manual index.
function stoppContextReason(r,m){
 const id=r.id,c=state.clinicalFacts||{},checks=criterionKnownChecks(r,m);
 if(checks.some(x=>x.pass===false))return '';
 const known=()=>checks.length>0&&checks.every(x=>x.pass===true)?'Registrerte verdier oppfyller de modellerte vilkårene.':'';
 const dx=(...names)=>names.some(stoppHasDx)?'Relevant diagnosekode er registrert. Avklar indikasjon, alvorlighetsgrad og øvrige vilkår.':'';
 const fact=(key,label)=>c[key]==='yes'?label:'';
 const combination=()=>checks.some(x=>x.pass===true)?'Den aktuelle legemiddelkombinasjonen er registrert. Kontroller øvrige vilkår.':'';
 const weeks=IMMCalc.number(m.durationWeeks),dose=IMMCalc.number(m.dailyDoseMg);
 if(r.section==='E')return known();
 if(r.section==='K')return c.recurrentFalls==='yes'?'Gjentatte fall er bekreftet. Kontroller legemidlets rolle og øvrige vilkår.':'';
 switch(id){
  case 'STOPP-A1':case 'STOPP-A2':case 'STOPP-A3':return '';
  case 'STOPP-B1':case 'STOPP-B2':return dx('hf');
  case 'STOPP-B3':case 'STOPP-B13':case 'STOPP-C13':case 'STOPP-C14':case 'STOPP-D18':case 'STOPP-M1':return combination();
  case 'STOPP-B4':return IMMCalc.number(c.pulse)>0&&IMMCalc.number(c.pulse)<50?'Registrert puls er under 50/min.':fact('heartBlock','Hjerteblokk er registrert.');
  case 'STOPP-B5':case 'STOPP-B7':return dx('ht');
  case 'STOPP-B6':return fact('firstLineAntiarrhythmic','Førstelinjebehandling av supraventrikulær takyarytmi er bekreftet.');
  case 'STOPP-B8':return fact('dependentOedema','Avhengige ankelødemer er registrert.');
  case 'STOPP-B9':case 'STOPP-B12':case 'STOPP-B15':case 'STOPP-B16':case 'STOPP-D3':case 'STOPP-D6':case 'STOPP-H2':case 'STOPP-L6':return known();
  case 'STOPP-B10':return stoppHasDx('ht')&&c.urinaryIncontinence==='yes'?'Hypertensjon og urininkontinens er registrert.':'';
  case 'STOPP-B11':return 'Sentralt virkende blodtrykksmiddel. Avklar tidligere behandlingsforsøk og norske unntak.';
  case 'STOPP-B14':return stoppPair(m,['G04BE'],['C01DA'])?'PDE5-hemmer og nitrat er begge registrert.':stoppIs(m,['G04BE'])&&stoppHasDx('hf')&&IMMCalc.number(c.systolic)>0&&IMMCalc.number(c.systolic)<90?'Hjertesvikt og systolisk blodtrykk under 90 mmHg er registrert.':'';
  case 'STOPP-B17':case 'STOPP-B18':return c.longTermTherapy==='yes'?dx('vascular'):'';
  case 'STOPP-B19':return stoppOther(m,['C03C'])?dx('hf'):'';
  case 'STOPP-B20':return dx('aorticStenosis');
  case 'STOPP-B21':return weeks!==null&&weeks>13?dx('af'):'';
  case 'STOPP-C1':return dose>100&&c.longTermTherapy==='yes'?'Høy ASA-dose og langvarig behandling er registrert.':'';
  case 'STOPP-C2':return fact('majorBleedingRisk','Betydelig blødningsrisiko er bekreftet.');
  case 'STOPP-C3':return weeks>4?dx('stroke'):'';
  case 'STOPP-C4':case 'STOPP-C7':case 'STOPP-C11':return dx('af');
  case 'STOPP-C5':return dx('vascular');
  case 'STOPP-C6':return 'Tiklopidin er registrert; kriteriet gjelder uavhengig av indikasjon.';
  case 'STOPP-C8':return dx('dvt');
  case 'STOPP-C9':return dx('pe');
  case 'STOPP-C10':return combination();
  case 'STOPP-C12':return fact('previousMajorBleeding','Kombinasjonen er registrert og tidligere alvorlig blødning er bekreftet.');
  case 'STOPP-C15':case 'STOPP-J6':return dx('dvt','pe');
  case 'STOPP-C16':return known();
  case 'STOPP-D1':return dx('dementia','glaucoma','bph','constipation','retention','orthostasis')||fact('recurrentFalls','Gjentatte fall er bekreftet.');
  case 'STOPP-D2':return fact('firstLineDepression','Oppstart som førstevalg ved alvorlig depresjon er bekreftet.');
  case 'STOPP-D4':return dx('bph','retention');
  case 'STOPP-D5':return weeks>13?dx('dementia'):'';
  case 'STOPP-D7':return fact('recentBleeding','Pågående eller nylig betydelig blødning er registrert.');
  case 'STOPP-D8':return known();
  case 'STOPP-D9':return dx('dementia');
  case 'STOPP-D10':case 'STOPP-D11':return weeks>=2?dx('insomnia'):'';
  case 'STOPP-D12':case 'STOPP-F1':return dx('parkinson');
  case 'STOPP-D13':return fact('drugInducedEPS','Legemiddelutløste ekstrapyramidale symptomer er registrert.');
  case 'STOPP-D14':return dx('dementia','delirium');
  case 'STOPP-D15':return weeks>12?dx('dementia'):'';
  case 'STOPP-D16':case 'STOPP-D25':return dx('insomnia');
  case 'STOPP-D17':return IMMCalc.number(c.pulse)>0&&IMMCalc.number(c.pulse)<60?'Puls under 60/min er registrert. Kontroller varighet.':dx('syncope');
  case 'STOPP-D19':return dx('seizure');
  case 'STOPP-D20':return dx('dementia');
  case 'STOPP-D21':return fact('firstLinePsychosis','Førstevalg ved psykose eller demenssymptomer er registrert.');
  case 'STOPP-D22':return dx('tremor');
  case 'STOPP-D23':return dx('drugParkinson');
  case 'STOPP-D24':return fact('firstLineAllergy','Førstevalg mot allergi eller kløe er registrert.');
  case 'STOPP-F2':return weeks>8?dx('ulcer','upperGI'):'';
  case 'STOPP-F3':case 'STOPP-I4':return dx('constipation');
  case 'STOPP-F4':return known();
  case 'STOPP-F5':return dx('ulcer','upperGI');
  case 'STOPP-F6':return fact('gave','Gastrisk antral vaskulær ektasi (GAVE) er bekreftet.');
  case 'STOPP-F7':return dx('dysphagia');
  case 'STOPP-F8':return fact('appetiteTreatment','Behandling for å øke appetitten er bekreftet.');
  case 'STOPP-G1':case 'STOPP-G2':return dx('copd');
  case 'STOPP-G3':return dx('glaucoma','retention','bph');
  case 'STOPP-G4':return dx('respFailure');
  case 'STOPP-H1':return dx('ulcer')||fact('previousGIBleeding','Tidligere gastrointestinal blødning er bekreftet.');
  case 'STOPP-H3':return weeks>=13?dx('oa'):'';
  case 'STOPP-H4':return weeks>=13?dx('ra'):'';
  case 'STOPP-H5':return dx('oa');
  case 'STOPP-H6':return weeks>=13?dx('gout'):'';
  case 'STOPP-H7':return combination();
  case 'STOPP-H8':return /tab|kaps|peror|oral/i.test(stoppForm(m))?dx('upperGI'):'';
  case 'STOPP-H9':return c.longTermTherapy==='yes'?dx('oa'):'';
  case 'STOPP-I1':return dx('dementia')||fact('cognitiveImpairment','Kronisk kognitiv svikt er registrert.');
  case 'STOPP-I2':return dx('glaucoma');
  case 'STOPP-I3':return dx('bph');
  case 'STOPP-I5':return dx('orthostasis','syncope');
  case 'STOPP-I6':return fact('severeLabileHypertension','Alvorlig eller labil hypertensjon er bekreftet.');
  case 'STOPP-I7':return fact('urgeIncontinence','Urgeinkontinens er bekreftet.');
  case 'STOPP-I8':return fact('asymptomaticBacteriuria','Asymptomatisk bakteriuri er bekreftet.');
  case 'STOPP-J1':return dx('dm2');
  case 'STOPP-J2':return dx('hf');
  case 'STOPP-J3':return c.recurrentHypoglycaemia==='yes'?dx('diabetes'):'';
  case 'STOPP-J4':return fact('symptomaticHypotension','Symptomgivende hypotensjon er bekreftet.');
  case 'STOPP-J5':return dx('breastCancer');
  case 'STOPP-J7':return dx('vascular');
  case 'STOPP-J8':return c.intactUterus==='yes'&&!activeMedicines().some(x=>stoppIs(x,['G03D','G03F','G02BA03']))?'Intakt livmor er bekreftet; gestagen er ikke registrert.':'';
  case 'STOPP-J9':return fact('subclinicalHypothyroidism','Subklinisk hypotyreose er bekreftet. Kontroller fritt T4 og TSH.');
  case 'STOPP-J10':return fact('urinaryIncontinence','Urininkontinens er registrert.');
  case 'STOPP-L1':return fact('firstLineMildPain','Førstevalg mot milde smerter er bekreftet.');
  case 'STOPP-L2':return known();
  case 'STOPP-L3':return fact('breakthroughPain','Gjennombrudd av moderate/sterke smerter er registrert.');
  case 'STOPP-L4':return dx('oa');
  case 'STOPP-L5':return fact('nonNeuropathicPain','Ikke-nevropatisk smerteindikasjon er bekreftet.');
  default:return '';
 }
}
function stoppManualKey(r,m){return m.id+':'+r.id;}
function stoppTranslationCredit(){return `<details class="sectiongap"><summary>Om kriterietekstene</summary><p class="hint sectiongap">${esc(DATA.older.attribution)} Lokal norsk oversettelse og bearbeiding, kontrollert 26.10.2026 mot Legemiddelhåndboka. Forskjeller mellom versjonene er merket ved kriteriet. ATC- og diagnosekoblingene er lokale tillegg. ${external(DATA.older.article,'Originalpublikasjon')} · ${external(DATA.older.license,'CC BY 4.0')}</p></details>`;}
function stoppReviewCandidates(){return activeMedicines().flatMap(m=>stoppCandidateRules(m).filter(r=>{
 const saved=state.criterionChecks?.[stoppManualKey(r,m)],a=criterionApplicability(r,m);
 return !!saved||(a.status==='pending'&&!!stoppContextReason(r,m));
 }).map(r=>({r,m})));}
function stoppManualPicker(){return `<details class="sectiongap"><summary>Finn et STOPP-kriterium manuelt</summary><p class="hint sectiongap">Hele STOPP-listen er tilgjengelig. Velg et legemiddel og et kriterium for å vurdere opplysninger som ikke er registrert i appen.</p><div class="formgrid sectiongap"><label class="field">Legemiddel<select id="stopp-med-picker"><option value="">Velg legemiddel …</option>${activeMedicines().map(m=>`<option value="${esc(m.id)}">${esc(m.name||m.atc)}</option>`).join('')}</select></label><label class="field">STOPP-kriterium<select id="stopp-rule-picker"><option value="">Velg legemiddel først …</option></select></label></div><div class="actions sectiongap"><button type="button" data-action="stopp-add">Åpne kontrollpunkt</button>${external(olderSources.STOPP,'Hele STOPP-listen – norsk versjon','button')}</div></details>`;}
function stoppPickerOptions(){const el=$('#stopp-rule-picker'),m=state.meds.find(x=>x.id===$('#stopp-med-picker')?.value);if(el)el.innerHTML='<option value="">Velg kriterium …</option>'+(m?DATA.older.criteria.filter(r=>r.tool==='STOPP').map(r=>`<option value="${r.id}">${esc(r.id+' · '+(DATA.older.translations[r.id]||'').split('. ')[0].slice(0,120))}</option>`).join(''):'');}
function stoppAction(a){if(a!=='stopp-add')return false;const m=state.meds.find(x=>x.id===$('#stopp-med-picker')?.value),r=olderCriteria.get($('#stopp-rule-picker')?.value);if(!m||r?.tool!=='STOPP'){toast('Velg legemiddel og kriterium.');return true;}state.criterionChecks||={};state.criterionChecks[stoppManualKey(r,m)]||={manual:true,value:'',fingerprint:criterionFingerprint()};markChanged();refreshCriterionCandidates();return true;}
document.addEventListener('change',e=>{if(e.target.id==='stopp-med-picker')stoppPickerOptions();});
