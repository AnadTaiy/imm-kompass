const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const S=require('./sadman-policy.js');let count=0;
function equal(actual,expected,label){assert.deepEqual(actual,expected,label);count++;}
const ids=(atc,extra={})=>S.forMedicine({atc,form:'Tablett',...extra},{age:'78'}).map(g=>g.id);
// Clinical fixtures: constituent groups, not brand-name or whole-ATC-chapter guesses.
for(const [name,atc,expected] of [
 ['Glimepirid','A10BB12',['su']],['Ramipril','C09AA05',['ace']],['Enalapril','C09AA02',['ace']],
 ['Furix','C03CA01',['diuretic']],['Burinex','C03CA02',['diuretic']],['Spironolakton','C03DA01',['diuretic']],['Eplerenon','C03DA04',['diuretic']],
 ['Glucophage','A10BA02',['metformin']],['Atacand','C09CA06',['arb']],['Ibux','M01AE01',['nsaid']],['Celekoksib','M01AH01',['nsaid']],['Nabumeton','M01AX01',['nsaid']],
 ['Jardiance','A10BK03',['sglt2']],['Aliskiren','C09XA02',['renin']],
 ['Synjardy','A10BD20',['metformin','sglt2']],['Metformin/glimepirid','A10BD02',['su','metformin']],['Glimepirid/dapagliflozin','A10BD32',['su','sglt2']],
 ['Atacand Plus','C09DA06',['diuretic','arb']],['Entresto','C09DX04',['arb']],['Triplixam','C09BX01',['ace','diuretic']],
 ['Rosuvastatin/perindopril/indapamid','C10BX13',['ace','diuretic']],['Aliskiren/HCTZ','C09XA52',['diuretic','renin']],
 ['Valsartan/aliskiren','C09DX02',['arb','renin']],['Eplerenon/dapagliflozin','C03DA54',['diuretic','sglt2']],
 ['Norvasc','C08CA01',[]],['Eliquis','B01AF02',[]],['Albyl-E','B01AC06',[]],['Atorvastatin','C10AA05',[]],['Glukosamin','M01AX05',[]],
 ['Kondroitin','M01AX25',[]],['Diacerein','M01AX21',[]],['Diklofenak gel','M02AA15',[]],['Finerenon','C03DA05',[]],['Tolvaptan','C03XA01',[]],
 ['Insulin','A10AB01',[]],['Pioglitazon/alogliptin','A10BD09',[]],['Atorvastatin/amlodipin','C10BX03',[]],['Litium','N05AN01',[]],
 ['Feil eller manglende kode','A10',[]],['Ukjent','',[]]
])equal(ids(atc),expected,name);
for(const extra of [{status:'Pausert'},{status:'Seponert'},{schedule:'Bruker ikke'},{actualDose:'0'},{actualDose:' S '},{form:'Gel'},{form:'Øyedråper'}])equal(ids('M01AE01',extra),[],JSON.stringify(extra));
equal(ids('M01AE01',{schedule:'Ved behov',actualDose:'1 vb'}),['nsaid'],'PRN included');
for(const age of ['17','-1','ukjent','140'])equal(S.forMedicine({atc:'A10BA02'},{age}).length,0,'invalid/pediatric '+age);
for(const age of ['','18','64','90'])equal(S.forMedicine({atc:'A10BA02'},{age}).length,1,'adult or unspecified '+age);
for(const egfr of ['','120','10'])equal(S.forMedicine({atc:'A10BA02'},{age:'78',egfr}).length,1,'not an eGFR diagnosis '+egfr);
const DATA=JSON.parse(fs.readFileSync(__dirname+'/data.json','utf8'));DATA.catalog=JSON.parse(fs.readFileSync(__dirname+'/catalog/catalog.json','utf8'));DATA.older.translations=JSON.parse(fs.readFileSync(__dirname+'/start-nb.json','utf8'));Object.assign(DATA.older.translations,JSON.parse(fs.readFileSync(__dirname+'/stopp-nb.json','utf8')));DATA.older.translationNotes=JSON.parse(fs.readFileSync(__dirname+'/stopp-notes-nb.json','utf8'));DATA.older.parameters=JSON.parse(fs.readFileSync(__dirname+'/criteria-parameters.json','utf8'));DATA.natural=JSON.parse(fs.readFileSync(__dirname+'/natural-products.json','utf8'));
const context={IMMCalc:require('./calculators.js'),DATA,URLSearchParams,URL,console,crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},location:{href:'http://localhost/index.html?secret=private#private',search:''},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{}}},window:{addEventListener(){}}};vm.createContext(context);
let app=JSON.parse(fs.readFileSync(__dirname+'/app-files.json','utf8')).map(n=>fs.readFileSync(__dirname+'/'+n,'utf8')).join('\n');vm.runInContext(app.slice(0,app.lastIndexOf("if(resourceOnly){page='library'")),context);context.IMMDose=context.window.IMMDose;
const run=s=>vm.runInContext(s,context),check=(label,s)=>equal(run(s),true,label);
run(`state=blank();state.profile.age='78';var product=DATA.catalog.meds.find(m=>m.atc==='A10BA02'&&m.spc);var med={...product,id:'fixture',catalogId:product.id,name:'Private entered name',indication:'private indication',actualUses:{patient:{dose:'1x1'}}};state.meds=[med];`);
check('one badge, public identifiers only, new tab',`(()=>{const html=sadmanFlag(med),u=new URL(sadmanSourceUrl(med));return (html.match(/class="risk-flag/g)||[]).length===1&&html.includes('target="_blank"')&&u.searchParams.get('catalog')===product.id&&u.searchParams.get('topic')==='dehydrering'&&!/private|secret|indication/i.test(u.href)&&!u.hash;})()`);
check('no state or LRP mutation by rendering',`(()=>{const before=JSON.stringify(state);sadmanFlag(med);return before===JSON.stringify(state);})()`);
check('source panel includes matched product SPC and credible references',`queryParams.set('sadman','1');sourceContext={catalogId:product.id,atc:product.atc};sadmanSourcePanel().includes(product.spc)&&sadmanSourcePanel().includes('pubmed.ncbi.nlm.nih.gov/36470530/')&&sadmanSourcePanel().includes('Helsedirektoratet')`);
check('mismatched catalog cannot supply wrong SPC',`sourceContext.atc='C03CA01';!sadmanSourcePanel().includes(product.spc)&&sadmanSourcePanel().includes('Diuretika')`);
check('invalid ATC explains no match',`sourceContext={atc:'invalid'};sadmanSourcePanel().includes('Ingen SADMAN-kobling')`);
check('HTML injection escaped',`sourceContext={atc:'<img onerror=alert(1)>'};!sadmanSourcePanel().includes('<img onerror')`);
check('all-groups view includes exceptions and restart',`sourceContext={};sadmanSourcePanel().includes('Sulfonylurea')&&sadmanSourcePanel().includes('gjenoppstart')&&sadmanHelp().includes('finerenon')`);
check('only SADMAN link activates source panel',`queryParams.delete('sadman');sadmanSourcePanel()===''`);
check('actual reporter use overrides source list',`med.actualUses.patient.dose='S';sadmanFlag(med)===''`);
check('PR reporter is respected',`state.lms.sourceList.push({id:'relative',type:'PR',name:'Test'});state.lms.reporterId='relative';med.actualUses.relative={dose:'1x1'};sadmanFlag(med).includes('SADMAN')`);
check('live refresh hides badge after age change',`(()=>{const el={dataset:{sadmanMed:med.id},innerHTML:'old'};const old=document.querySelectorAll;document.querySelectorAll=()=>[el];state.profile.age='17';refreshSadman();document.querySelectorAll=old;return el.innerHTML==='';})()`);
function query(q){context.q=q;return run(`state=blank();filters={q,tags:[],mode:'any',cat:'',access:'',fav:false,pediatric:false};sourceContext={};filteredResources().map(r=>r.id).join(',')`);}
const result=query('SADMAN');equal(result.split(',').length,7,'seven directly relevant sources');
for(const q of ['SADMANS','dehydrering','dehydration','sick day','sick-day','sick day rules','volume depletion'])equal(query(q),result,'same topic '+q);
equal(result.split(',')[0],'sadman-hdir','Helsedirektoratet first');
for(const q of ['cypinfo','cypinfo.no','gentest','farmakogenetikk'])assert.ok(query(q).includes('cypinfo'),q);count+=4;
check('CYP result when recorded, without genetic inference',`state=blank();state.profile.cyp='Test result';filters={q:'',tags:[]};sourceContext={};filteredResources().some(r=>r.id==='cypinfo')`);
check('no CYP assumption for a drug-only route',`sourceContext={scope:'drug',atc:'C08CA01'};!filteredResources().some(r=>r.id==='cypinfo')`);
check('CYP link sends no genotype',`cypInfoLink().includes('href="https://cypinfo.no/"')&&!cypInfoLink().includes('Test result')`);
check('CYP not mislabeled as interaction database',`filters={q:'',tags:[],interactionDatabases:true};!filteredResources().some(r=>r.id==='cypinfo')`);
// Audit the bundled product inventory: no known unrelated ingredient may be swept in.
const matches=DATA.catalog.meds.filter(m=>S.classify(m).length);
equal(matches.some(m=>/^(Glucosamine|Glukosamin|Chondroitin|Kondroitin|Amlodipine|Amlodipin|Insulin)$/i.test(m.substance||'')),false,'catalog false-positive check');
console.log(`PASS: ${count} SADMAN, combination, exception, source, privacy and refresh checks (${matches.length} catalog products mapped).`);

const bootContext={...context,location:{href:'http://localhost/index.html?tool=sources&sadman=1&topic=dehydrering&atc=C03CA01',search:'?tool=sources&sadman=1&topic=dehydrering&atc=C03CA01'},document:{...context.document,body:{classList:{add(){}}}},window:{addEventListener(){}}};
vm.createContext(bootContext);vm.runInContext(app.slice(0,app.lastIndexOf("if(resourceOnly){page='library'")),bootContext);
vm.runInContext(app.slice(app.lastIndexOf("if(resourceOnly){page='library'")).split('\n')[0],bootContext);
equal(vm.runInContext("filters.topic==='dehydrering'&&filteredResources().length===7",bootContext),true,'actual source-tab boot honors SADMAN topic');
console.log('PASS: SADMAN source-tab boot filter.');
