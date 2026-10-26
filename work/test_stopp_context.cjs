const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const DATA=JSON.parse(fs.readFileSync(__dirname+'/data.json','utf8'));DATA.catalog=JSON.parse(fs.readFileSync(__dirname+'/catalog/catalog.json','utf8'));DATA.older.translations={...JSON.parse(fs.readFileSync(__dirname+'/start-nb.json','utf8')),...JSON.parse(fs.readFileSync(__dirname+'/stopp-nb.json','utf8'))};DATA.older.parameters=JSON.parse(fs.readFileSync(__dirname+'/criteria-parameters.json','utf8'));DATA.older.translationNotes=JSON.parse(fs.readFileSync(__dirname+'/stopp-notes-nb.json','utf8'));
const context={IMMCalc:require('./calculators.js'),DATA,URLSearchParams,URL,console,crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},location:{href:'http://localhost/index.html',search:''},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{}}},window:{addEventListener(){}}};vm.createContext(context);
const files=['calculators.js','dosage.js','review-store.js','sessions.js','workflow.js','lms-v3.js','renal-policy.js','clinical-ui.js','help.js','older-ui.js','patient-context.js','stopp-context.js','criteria-policy.js','practical-ui.js','catalog-ui.js','journal-v3.js','substances.js','interactions.js','state-migration.js','sync-ui.js','app.js'];let app=files.map(n=>fs.readFileSync(__dirname+'/'+n,'utf8')).join('\n');app=app.slice(0,app.lastIndexOf("if(resourceOnly){page='library'"));vm.runInContext(app,context);context.IMMDose=context.window.IMMDose;
const run=s=>vm.runInContext(s,context);let count=0;function check(name,s){assert.equal(run(s),true,name);count++;}
const reset=()=>run(`state=blank();state.profile.age='78';state.profile.stability='stable';state.profile.endOfLife='no';`);
const meds=rows=>run(`state.meds=${JSON.stringify(rows.map((m,i)=>({id:'m'+i,name:'Test '+i,schedule:'Fast',...m})))};`);
const dx=codes=>run(`state.diagnosisList=${JSON.stringify(codes.map(code=>({system:'ICD-10',code,text:'Testdiagnose'})))};`);
const rule=id=>`olderCriteria.get('${id}')`;
const candidate=(id,n=0)=>`stoppReviewCandidates().some(x=>x.r.id==='${id}'&&x.m===state.meds[${n}])`;
reset();
check('133 STOPP and 57 START texts translated',`Object.keys(DATA.older.translations).length===190&&DATA.older.criteria.every(r=>DATA.older.translations[r.id]?.length>20)`);
check('translations do not silently change original PE boundary',`DATA.older.translations['STOPP-C9'].includes('tolv')&&DATA.older.translationNotes['STOPP-C9'].includes('seks')`);
for(const r of DATA.older.criteria.filter(r=>r.tool==='STOPP')){
 check('Norwegian rendered '+r.id,`criterionDetail(${rule(r.id)}).includes('lang="nb"')&&criterionDetail(${rule(r.id)}).includes('legemiddelhandboka.no/stopp-2')`);
 for(const atc of r.atc){reset();meds([{atc}]);if(!['STOPP-B11','STOPP-C6','STOPP-L2'].includes(r.id))check('age and ATC alone not a review '+r.id+'/'+atc,`!${candidate(r.id)}`);}
}
// Synthetic six-drug case: no original case file or identifying data in this repository.
reset();meds([{atc:'B01AF02',ingredients:'Apiksaban'},{atc:'C07AB02'},{atc:'C09AA05'},{atc:'A10BA02'},{atc:'C10AA05'},{atc:'N02BE01'}]);dx(['I48.2','I10','E11.9','M12.46']);
check('six-drug case has no unsupported STOPP reviews',`stoppReviewCandidates().length===0`);
check('AF does not imply GAVE, VTE, bleeding or a drug pair',`!stoppReviewCandidates().some(x=>x.m===state.meds[0])`);
check('empty kidney value not renal STOPP',`!state.meds.some(m=>olderHits(m).some(r=>r.section==='E'))`);
check('metoprolol with AF and ramipril not HT monotherapy',`criterionApplicability(${rule('STOPP-B5')},state.meds[1]).status==='excluded'`);
check('apixaban recognized as anticoagulation',`chaAnticoagulants().length===1`);
check('not artrose from M12 code',`!stoppHasDx('oa')`);
for(const [id,left,right,diagnoses,fact] of [
 ['STOPP-B3','C07AB02','C08DA01',[]],['STOPP-B13','C09AA05','C03DA01',[]],
 ['STOPP-C4','B01AF02','B01AC06',['I48.2']],['STOPP-C5','B01AF02','B01AC04',['I25.1']],
 ['STOPP-C10','B01AF02','M01AE01',[]],['STOPP-C12','B01AF02','N06AB06',[],'previousMajorBleeding'],
 ['STOPP-C13','B01AE07','C08DA01',[]],['STOPP-C14','B01AF02','C01BD01',[]],
 ['STOPP-D18','C07AB02','N06DA02',[]],['STOPP-H7','M01AE01','H02AB06',[]],['STOPP-M1','N06AA09','G04BD07',[]]
]){
 reset();meds([{atc:left}]);dx(diagnoses);if(fact)run(`state.clinicalFacts.${fact}='yes';`);
 check(id+' absent partner excludes',`criterionApplicability(${rule(id)},state.meds[0]).status==='excluded'`);
 meds([{atc:left},{atc:right}]);
 check(id+' pair makes review or matched flag',`${candidate(id)}||olderHits(state.meds[0]).some(r=>r.id==='${id}')`);
 check(id+' symmetric on partner',`${candidate(id,1)}||olderHits(state.meds[1]).some(r=>r.id==='${id}')`);
 run(`state.meds[1].status='Seponert';`);check(id+' stopped partner excluded',`!${candidate(id)}&&!olderHits(state.meds[0]).some(r=>r.id==='${id}')`);
}
reset();meds([{atc:'B01AF02'},{atc:'N06AB06'}]);check('SSRI and apixaban without bleed history not C12',`!${candidate('STOPP-C12')}`);
run(`state.clinicalFacts.previousMajorBleeding='yes';`);check('known bleed history enables C12 review',candidate('STOPP-C12'));
run(`state.clinicalFacts.gave='yes';`);check('known GAVE enables F6',candidate('STOPP-F6'));
reset();meds([{atc:'B01AF02'},{atc:'C07AB02'},{atc:'C09AA05'}]);check('metoprolol and ramipril are not listed Pgp partners',`!${candidate('STOPP-C14')}`);
reset();meds([{atc:'B01AC06'},{atc:'B01AF02'}]);dx(['I48']);check('combined OAC and platelet not replacement C7',`!${candidate('STOPP-C7')}`);
reset();meds([{atc:'M01AE01'},{atc:'H02AB06'},{atc:'A02BC02'}]);check('Norwegian PPI exception H7',`!${candidate('STOPP-H7')}`);
reset();meds([{atc:'C09AA05'}]);dx(['I35.0']);check('Norwegian ACEI exception B20',`!stoppCandidateRules(state.meds[0]).some(r=>r.id==='STOPP-B20')`);
reset();meds([{atc:'B01AF02'}]);
for(const [egfr,expected] of [['',false],['15',false],['14',true],['90',false]])check('apixaban renal boundary '+egfr,`state.profile.egfr='${egfr}';olderHits(state.meds[0]).some(r=>r.id==='STOPP-E3')===${expected}`);
check('unstable function no E3',`state.profile.egfr='14';state.profile.stability='unstable';!olderHits(state.meds[0]).some(r=>r.id==='STOPP-E3')`);
for(const [id,atc,extra] of [
 ['STOPP-J4','A10BD19',{ingredients:'Metformin\nLinagliptin'}],['STOPP-E6','A10BD25',{ingredients:'Empagliflozin\nLinagliptin'}],
 ['STOPP-D12','N05AH04',{}],['STOPP-I5','G04CA04',{}],['STOPP-K10','G04CA04',{}],
 ['STOPP-H8','M05BA06',{form:'Infusjonsvæske'}],['STOPP-L4','N01BB02',{form:'Injeksjonsvæske'}],
 ['STOPP-J5','G03CA03',{form:'Vaginalkrem'}],['STOPP-C4','B01AE03',{}]
]){reset();meds([{atc,...extra}]);check('specific ingredient/form exclusion '+id,`!stoppDrugMatches(${rule(id)},state.meds[0])`);}
reset();meds([{atc:'N05BA01',durationWeeks:'5'}]);
check('duration evidence suggests D8',candidate('STOPP-D8'));
run(`state.criterionChecks['m0:STOPP-D8']={manual:true,value:'yes',fingerprint:criterionFingerprint()};`);
check('review confirmation flag',`olderHits(state.meds[0]).some(r=>r.id==='STOPP-D8')`);
run(`state.meds[0].form='Ny administrasjonsform';`);check('form change invalidates confirmation',`!olderHits(state.meds[0]).some(r=>r.id==='STOPP-D8')`);
reset();meds([{atc:'B01AF02'}]);run(`state.criterionChecks['m0:STOPP-F6']={manual:true,value:'',fingerprint:criterionFingerprint()};`);
check('manual lookup without coded GAVE retained',candidate('STOPP-F6'));
check('manual lookup reload retained',`const reload=cleanImported({format:'IMM-Kompass',version:3,state},true);reload.criterionChecks['m0:STOPP-F6'].manual===true`);
run(`state.criterionChecks['m0:STOPP-C14']={manual:true,value:'yes',fingerprint:criterionFingerprint()};`);
check('confirmation cannot bypass absent Pgp partner',`!olderHits(state.meds[0]).some(r=>r.id==='STOPP-C14')`);
check('manual excluded point remains visible with reason',`criterionCheckHtml(${rule('STOPP-C14')},state.meds[0]).includes('Kriteriet er utelukket')`);
run(`state.criterionChecks['m0:STOPP-A1']={manual:true,value:'',fingerprint:criterionFingerprint()};`);
check('general criteria available manually',candidate('STOPP-A1'));
check('empty indication alone is not no indication',`!stoppContextReason(${rule('STOPP-A1')},state.meds[0])`);
check('all 133 criteria selectable manually',`stoppManualPicker().includes('Finn et STOPP-kriterium manuelt')`);
for(const age of ['',64,65,78,140])check('age selection '+age,`state.profile.age='${age}';stoppReviewCandidates().length>0===${age>=65&&age<140}`);
// Optional local-only regression input; never serialize case content to the build or logs.
if(process.argv[2]){context.localCase=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));run(`state=cleanImported(localCase);`);check('attached case no unsupported apixaban review',`!stoppReviewCandidates().some(x=>x.m.atc==='B01AF02')`);console.log('Local case checked; '+run('stoppReviewCandidates().length')+' contextual STOPP review points.');}
console.log('PASS: '+count+' STOPP context, combinations, exclusions, translations and manual-review checks.');
