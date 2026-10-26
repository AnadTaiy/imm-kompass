const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const DATA=JSON.parse(fs.readFileSync(__dirname+'/data.json','utf8'));DATA.catalog=JSON.parse(fs.readFileSync(__dirname+'/catalog/catalog.json','utf8'));DATA.older.translations=JSON.parse(fs.readFileSync(__dirname+'/start-nb.json','utf8'));Object.assign(DATA.older.translations,JSON.parse(fs.readFileSync(__dirname+'/stopp-nb.json','utf8')));DATA.older.translationNotes=JSON.parse(fs.readFileSync(__dirname+'/stopp-notes-nb.json','utf8'));DATA.older.parameters=JSON.parse(fs.readFileSync(__dirname+'/criteria-parameters.json','utf8'));
DATA.natural=JSON.parse(fs.readFileSync(__dirname+'/natural-products.json','utf8'));
const context={IMMCalc:require('./calculators.js'),DATA,URLSearchParams,URL,console,crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},location:{href:'http://localhost/index.html',search:''},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{}}},window:{addEventListener(){}}};
vm.createContext(context);
const files=['calculators.js','dosage.js','review-store.js','sessions.js','workflow.js','lms-v3.js','renal-policy.js','clinical-ui.js','help.js','older-ui.js','patient-context.js','stopp-context.js','criteria-policy.js','practical-ui.js','catalog-ui.js','natural-products.js','source-context.js','journal-v3.js','substances.js','interactions.js','state-migration.js','sync-ui.js','app.js'];
let app=files.map(n=>fs.readFileSync(__dirname+'/'+n,'utf8')).join('\n');app=app.slice(0,app.lastIndexOf("if(resourceOnly){page='library'"));vm.runInContext(app,context);context.IMMDose=context.window.IMMDose;
let count=0;const check=(name,script)=>{assert.equal(vm.runInContext(script,context),true,name);count++;};
const run=s=>vm.runInContext(s,context);

check('all natural FEST product categories are searchable without frozen product counts',`['12','13','16'].every(type=>DATA.catalog.meds.some(m=>m.type===type&&isNaturalProduct(m)))&&DATA.catalog.meds.filter(isNaturalProduct).every(m=>['12','13','16'].includes(m.type))`);
check('both strengthened and unstrengthened ingredients preserved',`DATA.catalog.meds.filter(m=>['12','13'].includes(m.type)).every(m=>m.ingredientIds.length>0)`);
check('Bio-Biloba has its exact Ginkgo substance',`medicineIndex.get('ID_74066A2D-6A42-4B8C-BC48-668F6CBCD589').ingredientIds.includes('ID_EF1C35D8-6A28-4561-9C3B-64FE495E66A4')`);
for(const q of ['johannesurt','prikkperikum','Hypericum','St John','ginseng','magnesium'])check('natural search '+q,`naturalSearch(${JSON.stringify(q)}).length>0`);
check('Johannesurt is a substance lookup, not invented FEST brand',`naturalSearch('johannesurt').some(m=>m.naturalId==='johannesurt'&&m.type==='lookup')`);
check('FEST supplements are absent from ordinary drug search',`!searchMedicines('magnesium').some(m=>m.type==='16')`);
check('natural widget closed by default',`naturalInput({}).includes('id="natural-search-area" hidden')`);
check('natural widget restored for selected product',`!naturalInput({catalogId:'ID_74066A2D-6A42-4B8C-BC48-668F6CBCD589'}).includes('id="natural-search-area" hidden')`);
run(`state=blank();const herb=naturalRecord(naturalEntry('johannesurt'));state.meds=[{...herb,id:'herb'}, {id:'rx',name:'Apiksaban',atc:'B01AF02'}];`);
check('Johannesurt plus apixaban finds actual FEST interaction',`interactionPairs().some(p=>p.ids.some(id=>interactionIndex.get(id).groups.some(g=>g.name==='Johannesurt')))`);
check('unknown herb identity does not inherit IDs',`trustedNaturalRefs({naturalId:'johannesurt',name:'Annet produkt',atc:'N06AX25'}).length===0`);
check('topical and homeopathic Hypericum not equated with St Johns wort',`DATA.catalog.meds.filter(m=>/Hypericum/i.test(m.name)).every(m=>!medEndpoints({...m,catalogId:m.id}).has(interactionPairs()[0].ids[0]))`);
run(`const bio=DATA.catalog.meds.find(m=>m.brand==='Bio-Biloba');state.meds=[{...bio,id:'bio',catalogId:bio.id,atc:''},{id:'warfarin',name:'Warfarin',atc:'B01AA03'}];`);
check('Ginkgo product without ATC matches by exact substance',`interactionPairs().length>0`);
check('valid substance refs not described as absent code basis',`!interactionCoverage().includes('Interaksjonssøk mangler kodegrunnlag for: Bio-Biloba')`);
check('source link keeps natural context, omits non-ATC WITHOUT',`const link=new URL(drugSourceUrl({...bio,catalogId:bio.id}));link.searchParams.get('naturalMode')==='on'&&!link.searchParams.has('atc')`);
run(`state=blank();globalThis.testMed=saveMedication({name:'Johannesurt / prikkperikum',naturalMode:'on',naturalId:'johannesurt',atc:'N06AX25',doseUnit:'tablett',schedule:'Fast',dose_actual:'uregelmessig',initiative_actual:'patient',dose_baseline:'1x1',initiative_baseline:'not-doctor',comment_baseline:'EPJ'});testMed.id='synthetic';state.meds=[testMed];`);
check('initiative does not overwrite dose',`testMed.observations.baseline.dose==='1x1'&&testMed.observations.baseline.initiative==='not-doctor'&&testMed.actualUses.patient.initiative==='patient'`);
check('irregular actual usage does not remain fixed daily schedule',`testMed.schedule==='Uregelmessig bruk'&&IMMDose.parse('uregelmessig bruk').code==='uregelmessig'`);
check('natural and initiative survive export/import',`const imported=cleanImported({format:'IMM-Kompass',version:3,state},true).meds[0];imported.naturalId==='johannesurt'&&imported.naturalMode==='on'&&imported.observations.baseline.initiative==='not-doctor'&&imported.actualUses.patient.initiative==='patient'`);
check('natural and initiative survive draft cleaning',`const clean=cleanDrafts({x:{kind:'med',id:'',values:{naturalMode:'on',naturalId:'johannesurt',initiative_actual:'patient',dose_actual:'1x1'}}})['med:'].values;clean.naturalId==='johannesurt'&&clean.initiative_actual==='patient'&&clean.dose_actual==='1x1'`);
check('initiative options available for each source',`doseInput('KJ','dose_kj','1x1','','tablett','patient').includes('Initiert av pasient')&&doseInput('EPJ','dose_baseline','','','tablett').includes('Ikke initiert av lege')`);
check('new herb links use only trusted declared HTTPS sources',`DATA.natural.entries.every(e=>e.sources.every(s=>s.url.startsWith('https://')))&&DATA.natural.entries.length===46`);
function results(diagnoses=[],ctx={},extra={}){context.testDiagnoses=diagnoses;context.testCtx=ctx;context.testExtra=extra;return run(`state=blank();state.diagnosisList=testDiagnoses;sourceContext=testCtx;filters={q:'',cat:'',tags:[],mode:'any',fav:false,pediatric:false,access:'',...testExtra};filteredResources().map(r=>r.id)`);}
const oa={system:'ICD-10',code:'M17.9',text:'Gonartrose'},af={system:'ICD-10',code:'I48.0',text:'Atrieflimmer'},dm={system:'ICPC-2',code:'T90',text:'Diabetes type 2'};
let rs=results([oa]);assert.ok(rs.indexOf('oa-hdir')<rs.indexOf('oa-nrf')&&rs.indexOf('oa-nrf')<rs.indexOf('oa-nlh'));count++;
assert.ok(rs.includes('mb001')&&!rs.includes('r196')&&!rs.includes('r197'),'OA is not RA or asthma');count++;
for(const code of ['M15','M16.1','M17.9','M18.0','M19.9']){assert.ok(results([{system:'ICD-10',code,text:code}]).includes('oa-nrf'),code);count++;}
for(const code of ['L89','L90','L91']){assert.ok(results([{system:'ICPC-2',code,text:code}]).includes('oa-nrf'),code);count++;}
for(const code of ['M12.46','M05.9','M10.9']){assert.ok(!results([{system:'ICD-10',code,text:'Artrose'}]).includes('oa-nrf'),'wrong explicit code never silently recoded '+code);count++;}
for(const text of ['Artrose','Kneartrose','Artrose i kne','Osteoarthritis']){assert.ok(results([{text,code:'',system:''}]).includes('oa-nrf'),'free-text search '+text);count++;}
for(const text of ['Ikke artrose','Ingen artrose','Mistanke om artrose','Mor har artrose']){results([{text}]);check('negative/uncertain not autolinked: '+text,`!sourceDiagnosisMatches(DATA.resources.find(r=>r.id==='oa-nrf'),{text:${JSON.stringify(text)}})`);}
rs=results([oa,af,dm]);assert.ok(rs.includes('oa-nrf')&&rs.includes('r166')&&(rs.includes('r041')||rs.includes('r151')));count++;
rs=results([oa,af,dm],{atc:'B01AF02',diagnosisSystem:'ICD-10',diagnosisCode:'I48.0'});assert.ok(!rs.includes('oa-nrf')&&!rs.includes('r166')&&(rs.includes('r041')||rs.includes('r151')),'drug route isolates indication');count++;
rs=results([oa,af,dm],{atc:'N02BE01'});assert.ok(!rs.includes('oa-nrf')&&!rs.includes('r075')&&!rs.includes('r159'),'paracetamol does not infer OA, opioid conversion or palliation');count++;
rs=results([oa],{atc:'N02BE01',indication:'artrose'});assert.ok(rs.includes('oa-nrf'),'recognized free indication supported without invented ICD');count++;
rs=results([oa],{scope:'drug'});assert.ok(!rs.includes('oa-nrf'),'manual drug without codes cannot import all patient diagnoses');count++;
rs=results([oa],{}, {q:'asthma'});assert.ok(rs.includes('r197')&&!rs.includes('oa-nrf'),'explicit search overrides default diagnosis scope');count++;
rs=results([oa],{scope:'all'});assert.ok(rs.includes('r197'),'all-library opt out works');count++;
rs=results([],{naturalId:'johannesurt',naturalMode:'on',atc:'N06AX25'});assert.ok(rs.includes('natural-source-2')&&!rs.includes('r184'),'herb does not imply depression diagnosis');count++;
check('recognized source term only in URL; no raw patient prose',`const url=new URL(drugSourceUrl({name:'Paracet',atc:'N02BE01',indication:'Artrose i kne',note:'PERSON'}));url.searchParams.get('indication')==='artrose'&&!url.href.includes('kne')&&!url.href.includes('PERSON')`);
check('all 54 supplied Metodebok titles retained',`DATA.resources.filter(r=>/^mb[0-9]+$/.test(r.id)).length===54`);
check('local books and special procedural titles not blindly linked to all cases',`!sourceMatch(DATA.resources.find(r=>r.id==='mb052')).score`);
rs=results([],{naturalId:'johannesurt',naturalMode:'on',atc:'N06AX25'});assert.ok(!rs.includes('r189')&&!rs.includes('r191')&&!rs.includes('r185')&&!rs.includes('r043'),'herb ATC never implies addiction or synthetic antidepressant switching');count++;
rs=results([],{atc:'B01AF02'});assert.ok(!rs.includes('r038')&&!rs.includes('r128')&&!rs.includes('r129'),'apixaban alone does not imply atherosclerotic prevention');count++;
assert.ok(!rs.includes('r153')&&!rs.includes('r154'),'AF risk scores require AF indication rather than any antithrombotic');count++;
rs=results([oa]);assert.ok(!rs.includes('mb034'),'OA alone does not imply postoperative care');count++;
rs=results([{system:'ICPC-2',code:'A99',text:'Uspesifisert tilstand'}]);assert.ok(!rs.includes('mb041'),'unspecific ICPC is not palliative care');count++;
results([oa]);run(`state.meds=[{name:'Johannesurt / prikkperikum',atc:'N06AX25',naturalId:'johannesurt',naturalMode:'on'}]`);
check('patient default includes natural sources without unrelated addiction',`const ids=filteredResources().map(r=>r.id);ids.includes('natural-source-2')&&ids.includes('oa-nrf')&&!ids.includes('r189')&&!ids.includes('r185')`);
for(const topic of Object.keys(DATA.searchTopics)){
 results([],{}, {topic});
 check('global publisher order for topic '+topic,`(()=>{const ranks=filteredResources().map(sourcePriority);return ranks.every((v,i)=>!i||v>=ranks[i-1]);})()`);
}
for(const ctx of [{atc:'B01AF02'},{atc:'N06AX25',naturalId:'johannesurt'},{priority:'dose'}]){
 results([oa,af,dm],ctx);check('publisher order across drug, natural and dose contexts',`(()=>{const ranks=filteredResources().map(sourcePriority);return ranks.every((v,i)=>!i||v>=ranks[i-1]);})()`);
}
console.log(`PASS: ${count} natural products, exact FEST substance matching, source context and dose metadata checks.`);
