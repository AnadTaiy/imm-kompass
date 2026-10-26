const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const DATA=JSON.parse(fs.readFileSync(__dirname+'/data.json','utf8'));DATA.catalog=JSON.parse(fs.readFileSync(__dirname+'/catalog/catalog.json','utf8'));DATA.older.translations=JSON.parse(fs.readFileSync(__dirname+'/start-nb.json','utf8'));Object.assign(DATA.older.translations,JSON.parse(fs.readFileSync(__dirname+'/stopp-nb.json','utf8')));DATA.older.translationNotes=JSON.parse(fs.readFileSync(__dirname+'/stopp-notes-nb.json','utf8'));DATA.older.parameters=JSON.parse(fs.readFileSync(__dirname+'/criteria-parameters.json','utf8'));
DATA.natural=JSON.parse(fs.readFileSync(__dirname+'/natural-products.json','utf8'));
const context={IMMCalc:require('./calculators.js'),DATA,URLSearchParams,URL,console,crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},location:{href:'http://localhost/index.html',search:''},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{}}},window:{addEventListener(){}}};
vm.createContext(context);
const files=['calculators.js','dosage.js','review-store.js','sessions.js','workflow.js','lms-v3.js','renal-policy.js','clinical-ui.js','help.js','older-ui.js','patient-context.js','stopp-context.js','criteria-policy.js','practical-ui.js','catalog-ui.js','natural-products.js','source-context.js','journal-v3.js','substances.js','interactions.js','state-migration.js','sync-ui.js','app.js'];
let app=files.map(n=>fs.readFileSync(__dirname+'/'+n,'utf8')).join('\n');app=app.slice(0,app.lastIndexOf("if(resourceOnly){page='library'"));vm.runInContext(app,context);context.IMMDose=context.window.IMMDose;
let count=0;const check=(name,script)=>{assert.equal(vm.runInContext(script,context),true,name);count++;};
const run=s=>vm.runInContext(s,context);
check('all 190 criteria inventoried',`DATA.older.criteria.length===190&&DATA.older.criteria.every(r=>DATA.older.parameters[r.id]?.parameters.includes('alder'))`);
check('all 57 START texts Norwegian',`DATA.older.criteria.filter(r=>r.tool==='START').length===57&&DATA.older.criteria.filter(r=>r.tool==='START').every(r=>DATA.older.translations[r.id]?.length>20)`);
run(`state=blank();state.profile.age='78';state.profile.endOfLife='no';state.meds=[{id:'statin',atc:'C10AA05',name:'Atorvastatin',schedule:'Fast',treatmentPurpose:'primary'}];state.profile.frail=true;state.clinicalFacts.prognosisUnder3='yes';`);
for(const age of [65,78,84,85,90])check('B16 age '+age,`state.profile.age='${age}';olderHits(state.meds[0]).some(r=>r.id==='STOPP-B16')===${age>=85}`);
check('secondary prevention excludes B16',`state.meds[0].treatmentPurpose='secondary';!olderHits(state.meds[0]).some(r=>r.id==='STOPP-B16')`);
check('unknown indication not primary',`state.meds[0].treatmentPurpose='';!olderHits(state.meds[0]).some(r=>r.id==='STOPP-B16')`);
check('unknown prognosis no B16',`state.meds[0].treatmentPurpose='primary';state.clinicalFacts.prognosisUnder3='';!olderHits(state.meds[0]).some(r=>r.id==='STOPP-B16')`);
check('unknown frailty no B16',`state.clinicalFacts.prognosisUnder3='yes';state.profile.frail=false;!olderHits(state.meds[0]).some(r=>r.id==='STOPP-B16')`);
run(`state=blank();state.profile.age='78';state.profile.endOfLife='no';`);
for(const r of DATA.older.criteria.filter(r=>r.tool==='STOPP'&&!['STOPP-B11','STOPP-C6'].includes(r.id))){
 for(const atc of r.atc)check('no unsupported drug-only alert '+r.id+' '+atc,`!olderHits({id:'x',atc:${JSON.stringify(atc)},schedule:'Fast'}).some(r=>r.id===${JSON.stringify(r.id)})`);
}
run(`state.meds=[{id:'x',atc:'N05BA01',schedule:'Fast',name:'Diazepam',durationWeeks:'1'}];`);
check('one week benzodiazepine not D8',`criterionApplicability(olderCriteria.get('STOPP-D8'),state.meds[0]).status==='excluded'`);
check('four weeks is eligible for manual confirmation',`state.meds[0].durationWeeks='4';criterionApplicability(olderCriteria.get('STOPP-D8'),state.meds[0]).status==='pending'`);
check('manual confirmation activates eligible criterion',`state.criterionChecks['x:STOPP-D8']={value:'yes',fingerprint:criterionFingerprint()};olderHits(state.meds[0]).some(r=>r.id==='STOPP-D8')`);
check('changing dose invalidates previous confirmation',`state.meds[0].actualUses={patient:{dose:'2x1'}};!olderHits(state.meds[0]).some(r=>r.id==='STOPP-D8')`);
check('general fall risk not recurrent falls',`state.profile.fall=true;!olderHits(state.meds[0]).some(r=>r.id==='STOPP-K1')`);
check('recurrent falls no blocks criterion',`state.clinicalFacts.recurrentFalls='no';criterionApplicability(olderCriteria.get('STOPP-K1'),state.meds[0]).status==='excluded'`);
run(`state=blank();state.profile.age='78';state.profile.endOfLife='no';state.diagnosisList=[{id:'af',system:'ICD-10',code:'I48.0',text:'Atrieflimmer (AF)'}];`);
check('patient diagnosis activates START without medication indication',`startCandidates().some(r=>r.id==='START-C1')&&chaRelevant()`);
check('free text never silently coded',`state.diagnosisList=[{text:'Atrieflimmer',system:'',code:''}];!chaRelevant()&&!startCandidates().some(r=>r.id==='START-C1')`);
check('HT abbreviation searchable',`diagnosisSearch('HT').some(({d})=>d[0]==='ICD-10'&&d[1]==='I10')`);
check('AF abbreviation searchable',`diagnosisSearch('AF').some(({d})=>d[1]==='I48.0')`);
check('AF needed for score',`state.chaReview={};!chaScore().valid`);
check('unknown factors not zero',`state.chaReview={clinicalAF:'yes'};chaScore().score===2&&!chaScore().complete&&chaScore().max===8`);
for(const age of [18,64,65,74,75,110])for(let combination=0;combination<243;combination++){
 let code=combination,expected=age>=75?2:age>=65?1:0,missing=0,max=expected;
 const facts={clinicalAF:'yes'},keys=['heartFailure','hypertension','diabetes','stroke','vascular'],points=[1,1,1,2,1];
 for(let i=0;i<5;i++){const value=code%3;code=Math.floor(code/3);facts[keys[i]]=['','yes','no'][value];if(value===1){expected+=points[i];max+=points[i];}if(value===0){missing++;max+=points[i];}}
 check('CHA independent combination '+age+'/'+combination,`state.profile.age='${age}';state.chaReview=${JSON.stringify(facts)};(()=>{const s=chaScore();return s.score===${expected}&&s.max===${max}&&s.unknown.length===${missing}&&s.complete===${missing===0};})()`);
}
for(const age of ['',-1,0,16,140,'abc'])check('invalid adult age '+age,`state.profile.age=${JSON.stringify(String(age))};!chaScore().valid`);
run(`state.profile.age='78';state.chaReview={clinicalAF:'yes',heartFailure:'yes',hypertension:'yes',diabetes:'yes',stroke:'no',vascular:'yes'};`);
check('screenshot factors score6 without invented percentage',`chaScore().score===6&&!chaResult().includes('15,5')&&!chaResult().includes('5,4')`);
for(const atc of ['B01AA03','B01AE07','B01AF01','B01AF02','B01AF03'])check('oral anticoagulant '+atc,`state.meds=[{id:'a',atc:'${atc}',schedule:'Fast'}];chaAnticoagulants().length===1`);
for(const atc of ['B01AC06','B01AB05','B01AE03',''])check('not oral anticoagulant '+atc,`state.meds=[{id:'a',atc:'${atc}',schedule:'Fast'}];chaAnticoagulants().length===0`);
check('stopped anticoagulant not treated as present',`state.meds=[{id:'a',atc:'B01AF02',status:'Seponert'}];chaAnticoagulants().length===0`);
check('paused actual anticoagulant not present',`state.meds=[{id:'a',atc:'B01AF02',actualUses:{patient:{dose:'0'}}}];chaAnticoagulants().length===0`);
check('new patient fields survive reload migration',`state.diagnosisList=[{id:'af',system:'ICD-10',code:'I48.0',text:'Atrieflimmer'}];state.clinicalFacts.potassium='4.5';const imported=cleanImported({format:'IMM-Kompass',version:3,state},true);imported.diagnosisList[0].code==='I48.0'&&imported.chaReview.heartFailure==='yes'&&imported.clinicalFacts.potassium==='4.5'`);
check('new med fields survive draft migration',`const draft=cleanDrafts({x:{kind:'med',id:'',values:{durationWeeks:'5',dailyDoseMg:'3000',treatmentPurpose:'primary'}}});draft['med:'].values.durationWeeks==='5'&&draft['med:'].values.dailyDoseMg==='3000'`);
check('START source uses handbook not supplement footer',`queryParams.set('older','START');queryParams.set('criteria','START-K2');const html=olderSourcePanel();html.includes('legemiddelhandboka.no/start-v3')&&!html.includes('Originalvedlegg')&&!html.includes('Laxatives in patients')`);
check('render all patient panels',`renderLms().includes('Diagnoser og sykehistorie')&&chaPanel().includes('CHA₂DS₂-VA')`);
check('new diabetes diagnosis invalidates old negative answer',`state.chaReview.diabetes='no';invalidateChaForDiagnosis({system:'ICD-10',code:'E11'});state.chaReview.diabetes===''`);
check('new flutter/AF code requires renewed AF confirmation',`state.chaReview.clinicalAF='yes';invalidateChaForDiagnosis({system:'ICD-10',code:'I48.9'});state.chaReview.clinicalAF===''`);
check('AF search does not return incidental text matches',`diagnosisSearch('AF').every(({d})=>abbreviation(d)==='AF')`);
check('renin inhibitor not falsely ACE/ARB B12',`state.profile.age='78';state.clinicalFacts.potassium='6';!olderHits({atc:'C09XA02'}).some(r=>r.id==='STOPP-B12')`);
check('no paracetamol L6 on other analgesic combination',`state.profile.liver=true;!olderHits({atc:'N02AJ07',ingredients:'Kodein og Acetylsalisylsyre',dailyDoseMg:'3000'}).some(r=>r.id==='STOPP-L6')`);
check('covered START status expires when therapy changes',`state.startChecks['START-C1']='covered';state.startReviews['START-C1']=criterionFingerprint();const r=olderCriteria.get('START-C1');const before=startStatus(r);state.meds.push({id:'changed',atc:'N02AA01'});before==='covered'&&startStatus(r)===''`);
console.log('PASS: '+count+' patient-context, criterion boundaries, translation and CHA₂DS₂-VA checks.');
