const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const DATA=JSON.parse(fs.readFileSync(__dirname+'/data.json','utf8'));
for(const [k,f] of [['catalog','catalog/catalog.json'],['clinical','clinical-rules.json'],['natural','natural-products.json']])DATA[k]=JSON.parse(fs.readFileSync(__dirname+'/'+f,'utf8'));
DATA.older.translations={...JSON.parse(fs.readFileSync(__dirname+'/start-nb.json','utf8')),...JSON.parse(fs.readFileSync(__dirname+'/stopp-nb.json','utf8'))};DATA.older.parameters=JSON.parse(fs.readFileSync(__dirname+'/criteria-parameters.json','utf8'));
const context={DATA,URL,URLSearchParams,console,crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},location:{href:'http://localhost/',search:''},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{}}},window:{addEventListener(){}}};vm.createContext(context);
let app=JSON.parse(fs.readFileSync(__dirname+'/app-files.json','utf8')).map(n=>fs.readFileSync(__dirname+'/'+n,'utf8')).join('\n');vm.runInContext(app.slice(0,app.lastIndexOf("if(resourceOnly){page='library'")),context);context.IMMCalc=context.window.IMMCalc;context.IMMDose=context.window.IMMDose;
const run=s=>vm.runInContext(s,context);let checks=0;
function check(name,s){assert.equal(run(s),true,name);checks++;}
run(`state=blank();state.profile.age='78';state.diagnosisList=[{text:'Lokalisert ødem',system:'ICD-10',code:'R60.0'},{text:'Essensiell hypertensjon (HT)',system:'ICD-10',code:'I10'},{text:'Diaré',system:'ICD-10',code:'R19.7'},{text:'Tørrhoste',system:'',code:''},{text:'Urininkontinens',system:'ICD-10',code:'R32'}];var norvasc=DATA.catalog.meds.find(m=>m.atc==='C08CA01'&&m.uses.length);`);
check('amlodipine does not inherit edema from patient background',`indicationOptions(norvasc,'').every(x=>x.origin==='product'&&!/ødem/i.test(x.text))`);
check('amlodipine retains its actual product-label uses',`indicationOptions(norvasc,'').some(x=>/høyt blodtrykk/i.test(x.text))&&indicationOptions(norvasc,'').some(x=>/angina|hjertekrampe/i.test(x.text))`);
check('no product means no unsolicited patient diagnosis choices',`indicationOptions(null,'').length===0`);
check('one character cannot dump patient diagnoses into suggestions',`indicationOptions(norvasc,'ø').every(x=>x.origin==='product')`);
check('manual edema search is labeled as diagnosis, never product indication',`indicationOptions(norvasc,'ødem').length>0&&indicationOptions(norvasc,'ødem').every(x=>x.origin==='diagnosis'&&/ikke (bekreftet|kontrollert)/.test(x.hint))`);
check('ICD code search still available',`indicationOptions(norvasc,'I10').some(x=>x.system==='ICD-10'&&x.code==='I10')`);
check('clinical abbreviations still search diagnoses',`indicationOptions(norvasc,'AF').some(x=>/I48|K78/.test(x.code))`);
check('matching patient diagnosis appears once per code',`indicationOptions(norvasc,'ødem').filter(x=>x.system==='ICD-10'&&x.code==='R60.0').length===1`);
check('administrative route and duration labels not treatment causes',`['ØYEDRÅPER','TIL INJEKSJON','TIL INFUSJON','TIL INSULINPUMPE','LANGTIDSVIRKENDE','TIL KATT','HJERTEMEDISIN','VANNDRIVENDE'].every(x=>!therapeuticUseLabel(x))`);
check('explicit treatment and prevention labels retained',`['MOT ØDEM','MOT HØYT BLODTRYKK','FOREBYGGER HJERNESLAG','ØYEDRÅPER MOT ALLERGI','VED SØVNVANSKER','TIL PREVENSJON'].every(therapeuticUseLabel)`);
check('injection with route-only label has no fabricated indication',`(()=>{const p=DATA.catalog.meds.find(m=>m.brand==='Furix'&&m.uses.length===1&&m.uses[0]==='1152');return !!p&&indicationOptions(p,'').length===0;})()`);
check('the rule applies to every product in the catalog',`DATA.catalog.meds.every(p=>indicationOptions(p,'').every(x=>x.origin==='product'&&x.system==='FEST 7488'&&p.uses.includes(x.code)||x.origin==='shared-fest'&&sharedFestIndicationOptions(p).some(y=>y.code===x.code)&&!!x.source||x.origin==='spc'&&!!indicationEvidence(p)&&!x.system&&!x.code&&!!x.source))`);
check('changing patient symptoms cannot change default choices for any product',`DATA.catalog.meds.every(p=>JSON.stringify(indicationOptions(p,'',state.diagnosisList))===JSON.stringify(indicationOptions(p,'',[])))`);
// Newly reviewed SPC fallback: never generalise an ATC class to all routes/products.
check('morphine and oxycodone injections have source-backed pain suggestions',`DATA.catalog.meds.filter(p=>p.ordinary&&['N02AA01','N02AA05'].includes(p.atc)&&/inj/i.test(p.form)).every(p=>indicationOptions(p,'').some(x=>x.origin==='spc'&&/smerter/.test(x.text)))`);
check('epidural morphine retains the epidural qualifier',`indicationOptions(DATA.catalog.meds.find(p=>p.brand==='Morfin Epidural'),'').every(x=>/epidural/.test(x.text))`);
check('opioid indications never gain palliative off-label dyspnea automatically',`DATA.catalog.meds.filter(p=>p.atc==='N02AA05').every(p=>indicationOptions(p,'').every(x=>!/dysp|tungpust|forebygg/i.test(x.text)))`);
check('changing ATC or form cannot borrow an SPC suggestion',`(()=>{const p=DATA.catalog.meds.find(p=>p.brand==='OxyNorm'&&/inj/i.test(p.form));return !indicationEvidence({...p,atc:'C08CA01'})&&!indicationEvidence({...p,form:'Inhalasjon'});})()`);
// FEST can remove/rename products or add products without reviewed indications.
// Pin the reviewed matching contract, not the contents of a changing catalog.
check('every reviewed family matches only its exact product, ATC and form',`INDICATION_EVIDENCE.every(r=>{const p={brand:r.brand,atc:r.atc,form:r.form,spc:r.source||'https://produktinformasjon.legemiddelsok.no/preparatomtaler/'+r.spc+'.pdf'};return r.uses.length>0&&indicationEvidence(p)===r&&evidenceIndicationOptions(p).every(x=>x.origin==='spc'&&/^https:\\/\\//.test(x.source))&&!indicationEvidence({...p,brand:p.brand+' UNKNOWN'})&&!indicationEvidence({...p,atc:'UNKNOWN'})&&!indicationEvidence({...p,form:'UNKNOWN'})&&!indicationEvidence({...p,spc:''});})`);
check('new unreviewed analgesic cannot inherit a family suggestion',`evidenceIndicationOptions({brand:'Unreviewed analgesic',atc:'N02AA01',form:'Injeksjonsvæske, oppløsning',spc:'https://example.invalid/spc'}).length===0`);
const coverage=run(`({unmatched:INDICATION_EVIDENCE.filter(r=>!DATA.catalog.meds.some(p=>indicationEvidence(p)===r)).map(r=>r.brand+' / '+r.form),withoutOptions:DATA.catalog.meds.filter(p=>p.ordinary&&p.atc.startsWith('N02')&&!indicationOptions(p,'').length).map(p=>p.name||p.brand)})`);
console.log('Indication coverage audit (manual search and SPC remain available): '+JSON.stringify(coverage));
// Realistic cascading case must still work without falsifying amlodipine indication.
run(`state.meds=[{id:'aml',name:'Norvasc',atc:'C08CA01',form:'Tablett',indication:'Hypertensjon',status:'Uendret',schedule:'Fast',actualUses:{patient:{dose:'1x1'}}},{id:'fur',name:'Furix',atc:'C03CA01',form:'Tablett',indication:'Vanndrivende',status:'Uendret',schedule:'Fast',actualUses:{patient:{dose:'1x1'}}}];var before=JSON.stringify(state);`);
check('patient-level edema still triggers the cascade',`cascadeFindings().some(h=>h.rule==='PIPC-05'&&h.evidenceSource==='patient')`);
check('cascade and choices cannot rewrite indications or diagnoses',`indicationOptions(norvasc,'');cascadeFlag(state.meds[0]);JSON.stringify(state)===before&&state.meds[0].indication==='Hypertensjon'`);
// Exercise the actual rendering, not only the choice builder.
run(`var form={elements:{catalogId:{value:norvasc.id},atc:{value:norvasc.atc},indication:{value:''},diagnosisSystem:{value:''},diagnosisCode:{value:''}}},suggestions={innerHTML:''},source={innerHTML:''};document.querySelector=s=>s==='#med-form'?form:s==='#indication-suggestions'?suggestions:s==='#indication-source'?source:null;captureDraft=()=>{};showIndications();`);
check('empty edit renders product choices immediately without filling the field',`suggestions.innerHTML.includes('Bruksområder for valgt preparat')&&!suggestions.innerHTML.includes('Lokalisert ødem')&&form.elements.indication.value===''`);
check('SPC is linked for the selected product',`!norvasc.spc||source.innerHTML.includes(norvasc.spc)`);
check('manual-search block explains the semantic distinction',`form.elements.indication.value='ødem';showIndications();suggestions.innerHTML.includes('Manuelt diagnosesøk')&&suggestions.innerHTML.includes('ikke hvilke sykdommer preparatet behandler')`);
check('search does not auto-select a diagnosis',`form.elements.indication.value==='ødem'&&form.elements.diagnosisCode.value===''`);
check('explicit selection alone populates indication and diagnosis code',`(()=>{const i=indicationChoices.findIndex(d=>d.code==='R60.0');selectIndication(i);return form.elements.indication.value==='Lokalisert ødem'&&form.elements.diagnosisCode.value==='R60.0'&&state.meds[0].indication==='Hypertensjon';})()`);
check('mismatched catalog and manually edited ATC cannot borrow product uses',`form.elements.indication.value='';form.elements.atc.value='A10BA02';showIndications();indicationChoices.length===0&&source.innerHTML===''`);
check('malicious patient text is escaped in manual search',`state.diagnosisList=[{text:'Test <img src=x onerror=alert(1)>',system:'',code:''}];form.elements.indication.value='Test <img';showIndications();suggestions.innerHTML.includes('&lt;img')&&!suggestions.innerHTML.includes('<img')`);
console.log('PASS: '+checks+' indication provenance, whole-catalog, manual-search and cascade separation checks.');

check('diagnosis search caches repeated queries without changing results',`diagnosisSearch('astma')===diagnosisSearch('ASTMA')&&diagnosisSearch('j45.0').some(x=>x.d[1]==='J45.0')`);
const timings=[];
for(const term of ['as','ast','astm','astma','i4','i48','j45','j45.0','di','dia','diab','diabetes','k7','k78','hy','hyper','hypertensjon','AF','KOLS','nyre']){context.benchTerm=term;run('diagnosisQueryCache.delete(normCatalog(benchTerm).trim())');const start=performance.now();run('diagnosisSearch(benchTerm)');timings.push(performance.now()-start);}
console.log('Diagnosis search benchmark, 20 uncached queries: median '+timings.sort((a,b)=>a-b)[10].toFixed(2)+' ms, max '+Math.max(...timings).toFixed(2)+' ms.');

check('Aclasta has reviewed osteoporosis and Paget suggestions',`DATA.catalog.meds.filter(p=>p.brand==='Aclasta').every(p=>indicationOptions(p,'').some(x=>/Osteoporose/.test(x.text))&&indicationOptions(p,'').some(x=>/Paget/.test(x.text)))`);
check('Oftagel has dry-eye indication without a reimbursement code',`DATA.catalog.meds.filter(p=>p.brand==='Oftagel').every(p=>indicationOptions(p,'').some(x=>/Tørre øyne/.test(x.text)&&x.code===''))`);
check('zoledronic acid 4 mg does not inherit 5 mg indications',`DATA.catalog.meds.filter(p=>p.atc==='M05BA08'&&/4 mg/.test(p.name)).every(p=>!evidenceIndicationOptions(p).some(x=>/Osteoporose/.test(x.text)))`);
check('changed SPC invalidates reviewed exact-SPC fallback',`(()=>{const p=DATA.catalog.meds.find(p=>p.brand==='Aclasta');return !indicationEvidence({...p,spc:'https://example.invalid/changed.pdf'});})()`);
check('equivalent FEST fallback never uses ATC alone',`DATA.catalog.meds.every(p=>{const choices=sharedFestIndicationOptions(p);return choices.every(x=>x.donors.every(id=>equivalentIndicationKey(medicineIndex.get(id))===equivalentIndicationKey(p)));})`);
check('different presentation, form, ingredient or SPC prevents sharing',`(()=>{const p=DATA.catalog.meds.find(p=>p.ordinary&&p.uses?.some(c=>therapeuticUseLabel(DATA.catalog.uses[c]))&&equivalentIndicationKey(p));return [{name:p.name+' changed'},{form:'other'},{spc:p.spc+'?different'},{ingredientIds:['different']},{atc:'M05BA08'}].every(change=>sharedFestIndicationOptions({...p,...change,uses:[]}).length===0);})()`);
console.log('PASS: expanded '+checks+' indication checks.');
