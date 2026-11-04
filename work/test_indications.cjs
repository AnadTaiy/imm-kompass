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
check('the rule applies to every product in the catalog',`DATA.catalog.meds.every(p=>indicationOptions(p,'').every(x=>x.origin==='product'&&x.system==='FEST 7488'&&p.uses.includes(x.code)))`);
check('changing patient symptoms cannot change default choices for any product',`DATA.catalog.meds.every(p=>JSON.stringify(indicationOptions(p,'',state.diagnosisList))===JSON.stringify(indicationOptions(p,'',[])))`);
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
