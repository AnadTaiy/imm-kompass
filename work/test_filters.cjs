const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const DATA=JSON.parse(fs.readFileSync(__dirname+'/data.json','utf8'));DATA.catalog=JSON.parse(fs.readFileSync(__dirname+'/catalog/catalog.json','utf8'));
const context={IMMCalc:require('./calculators.js'),DATA,URLSearchParams,URL,console,crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},location:{href:'http://localhost/index.html',search:''},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{}}},window:{addEventListener(){}}};
vm.createContext(context);
const files=['calculators.js','dosage.js','review-store.js','sessions.js','workflow.js','lms-v3.js','renal-policy.js','clinical-ui.js','help.js','older-ui.js','practical-ui.js','catalog-ui.js','journal-v3.js','substances.js','interactions.js','state-migration.js','sync-ui.js','app.js'];
let app=files.map(n=>fs.readFileSync(__dirname+'/'+n,'utf8')).join('\n');app=app.slice(0,app.lastIndexOf("if(resourceOnly){page='library'"));vm.runInContext(app,context);context.IMMDose=context.window.IMMDose;
const run=s=>vm.runInContext(s,context);let count=0;
function check(name,condition){assert.ok(condition,name);count++;}
function query(q='',extra={},ctx={}){context.testQ=q;context.testExtra=extra;context.testContext=ctx;return run(`filters={q:testQ,cat:'',tags:[],mode:'any',fav:false,pediatric:false,access:'',...testExtra};sourceContext=testContext;filteredResources().map(r=>r.id).join(',')`).split(',').filter(Boolean);}
check('all source records classified',DATA.resources.length===230&&DATA.resources.every(r=>r.taxonomy&&r.summary&&r.taxonomy.primary.every(k=>DATA.searchTopics[k])));
for(const [k,t] of Object.entries(DATA.searchTopics)){
 check('topic has direct results: '+k,query('',{topic:k,pediatric:true}).length>0);
 for(const word of t.terms){context.term=word;check('synonym recognized: '+word,run(`filters.q=term;sourceQuery().topics.includes(${JSON.stringify(k)})`));}
}
const pairs=[['nyre','kidney'],['nyrefunksjon','renal function'],['lever','liver'],['eldre','elderly'],['vekt','weight'],['fall','falls'],['sonde','feeding tube'],['graviditet','pregnancy'],['seponering','deprescribing'],['interaksjoner','drug interactions'],['infeksjon','infection'],['hjerte','cardiac'],['blodtrykk','blood pressure'],['atrieflimmer','atrial fibrillation'],['antikoagulasjon','anticoagulation'],['smerter','pain'],['palliasjon','palliative'],['osteoporose','osteoporosis'],['depresjon','depression'],['psykose','psychosis'],['rus','addiction'],['nevrologi','neurology'],['epilepsi','epilepsy'],['demens','dementia'],['lunge','pulmonary'],['astma','asthma'],['kols','copd'],['refluks','reflux'],['revmatologi','rheumatology'],['kreft','cancer'],['tdm','therapeutic drug monitoring'],['intravenøs','intravenous'],['administrasjon','drug administration'],['samstemming','medication reconciliation'],['etterlevelse','adherence'],['bivirkning','adverse effects'],['hjertesvikt','heart failure'],['multippel sklerose','multiple sclerosis'],['cystisk fibrose','cystic fibrosis'],['farmakogenetikk','pharmacogenomics'],['antibiotika nyre','antibiotics renal'],['nyre dosering','dose adjustment in renal impairment']];
for(const [no,en] of pairs)check('same results and order: '+no+' / '+en,JSON.stringify(query(no))===JSON.stringify(query(en)));
for(const [q,id] of [['renal','r021'],['liver','r060'],['heart failure','r217'],['asthma','r197'],['depresjon','r184'],['diabetes','r166'],['anticholinergic burden','r051'],['nyre diabetes','r168'],['seponering antidepressiva','r185'],['opioid tapering','r024'],['breastfeeding','r130'],['dose adjustment in renal impairment','r055']])check('expected relevant source: '+q,query(q).includes(id));
for(const [q,id] of [['nyre','r039'],['nyre','r040'],['lever','r217'],['asthma','r200'],['graviditet','r210'],['kols','r197'],['seponering','r026']])check('excludes unrelated source: '+q+' '+id,!query(q).includes(id));
const direct=query('nyre'),related=query('nyre',{related:true}),general=query('nyre',{general:true});
check('primary renal search excludes general portals',!direct.includes('r019')&&!direct.includes('r029'));
check('related explicitly extends results',related.length>direct.length&&direct.every(id=>related.includes(id))&&related.includes('r034'));
check('general explicitly includes subscriptions',general.includes('r019')&&general.includes('r008'));
check('direct relevance before general Norwegian portal',general.indexOf('r021')<general.indexOf('r029'));
check('UpToDate first via dose shortcut',query('',{tags:['nyre']},{priority:'dose'})[0]==='r021');
const all=query('',{tags:['nyre','vekt'],mode:'all'}),any=query('',{tags:['nyre','vekt'],mode:'any'});
check('all/any combination',all.includes('r020')&&all.length<any.length&&all.every(id=>any.includes(id)));
check('topic+patient facet intersection',query('',{topic:'infeksjon',tags:['nyre']}).includes('r020')&&!query('',{topic:'infeksjon',tags:['nyre']}).includes('r055'));
for(const access of ['open','paid','internal']){const rs=query('',{access});check('access facet '+access,rs.length>0&&rs.every(id=>{const a=DATA.resources.find(r=>r.id===id).access;return access==='open'?a==='Åpen':access==='internal'?a==='Internt':!['Åpen','Internt'].includes(a);}));}
check('paid renal source remains',query('nyre',{access:'paid'}).includes('r021'));
check('pediatric hidden by default',!query('MAMBA').length&&query('MAMBA',{pediatric:true}).length>0);
check('pediatric module shares URL but remains distinct',query('Micromedex',{pediatric:true}).includes('r163'));
for(const purpose of [...new Set(DATA.resources.map(r=>r.taxonomy.purpose))])check('purpose filter: '+purpose,query('',{purpose,pediatric:true}).length>0);
for(const cat of [...new Set(DATA.resources.map(r=>r.category))])check('category filter: '+cat,query('',{cat,pediatric:true}).every(id=>DATA.resources.find(r=>r.id===id).category===cat));
run("favorites=new Set(['r021','r197'])");check('favorite plus topic',query('nyre',{fav:true}).join(',')==='r021');
check('ATC context finds anticoagulation sources',query('',{}, {atc:'B01AF02'}).includes('r027'));
check('FEST use code is not sent as an ICD/ICPC diagnosis',run("const link=new URL(drugSourceUrl({atc:'B01AF02',diagnosisSystem:'FEST 7488',diagnosisCode:'123'}));link.searchParams.get('atc')==='B01AF02'&&!link.searchParams.has('system')&&!link.searchParams.has('code')"));
check('actual ICD diagnosis is retained in the source link',run("new URL(drugSourceUrl({atc:'B01AF02',diagnosisSystem:'ICD-10',diagnosisCode:'I48'})).searchParams.get('code')==='I48'"));
check('renal shortcut for warfarin excludes antiinfective dosing',!query('',{tags:['nyre']},{atc:'B01AA03'}).includes('r020')&&query('',{tags:['nyre']},{atc:'B01AA03'}).includes('r055'));
check('diagnosis context excludes unrelated specialty',!query('',{}, {diagnosisSystem:'ICD-10',diagnosisCode:'I48'}).includes('r197'));
check('diagnosis and topic retains atrial guideline',query('atrieflimmer',{}, {diagnosisSystem:'ICPC-2',diagnosisCode:'K78'}).some(id=>['r041','r151'].includes(id)));
check('unrecognized text is not ignored',query('totaltukjentsoekeord').length===0);
check('free words also narrow semantic search',query('nyre uptodate').join(',')==='r021');
check('unknown combination produces no fabricated match',query('asthma myasthenia').length===0);
check('invalid ATC does not silently show generic matches',query('',{},{atc:'XYZ'}).length===0);
check('diagnosis code requires correct code system',query('',{},{diagnosisCode:'I48'}).length===0);
check('ICD mismatch does not show unrelated results',query('',{},{diagnosisSystem:'ICPC-2',diagnosisCode:'I48'}).length===0);
check('drug dosing query handles common modifier',JSON.stringify(query('renal drug dosing'))===JSON.stringify(query('nyre dosering')));
check('administration includes intravenous sources',query('intravenous administration').includes('r033'));
check('multiple purposes preserve research',query('',{purpose:'Forskning'}).includes('r002'));
check('weekly amount retained from prose',run("weeklyAmount('2 uke','tablett')===2&&weeklyAmount('uke','tablett')===1&&weeklyAmount('0,5u man','tablett')===0.5"));
check('complex weekly prose not silently converted',run("weeklyAmount('uke: 2 mandag, 3 fredag','tablett')===null"));
check('young person hides older panel',run("state=blank();state.profile.age='64';!olderProfile().includes('Målgruppe for eldrekriterier')"));
check('65 enables older panel',run("state.profile.age='65';olderProfile().includes('Målgruppe for eldrekriterier')"));
check('dose overview compact, explanation retained',run("doseSummary('1 tablett ukentlig på mandag',{doseUnit:'tablett'}).includes('>1u man</span>')"));
check('dose presets visible for every source',run("doseInput('EPJ','dose_baseline','','','tablett').includes('data-dose-preset')&&doseInput('KJ','dose_kj','','','tablett').includes('Uke – velg ukedag')"));
check('FEST headings separated without changing paragraphs',run("const ss=handlingSections('Dosetilpasning: Første linje.\\nFortsettelse.\\nLegemiddelalternativer: Andre.\\nMonitorering: Tredje.\\nJusteringAvDoseringstidspunkt: Fjerde.');ss.length===4&&ss[0].text==='Første linje.\\nFortsettelse.'&&ss[3].label==='Justering av doseringstidspunkt'"));
check('handling HTML is escaped',run("handlingMarkup('Dosetilpasning: <script>bad</script>').includes('&lt;script&gt;')"));
// DOM stand-ins exercise input handling without accessing any real stored review.
run("markChanged=()=>syncRenal();state=blank();Object.assign(state.profile,{age:'60',sex:'male',creatinine:'88.4',stability:'stable',egfrMode:'manual',egfr:'42'});page='renal';updateBound({dataset:{bind:'profile.creatinine'},type:'text',value:'100'});");
check('new calculator input replaces manual eGFR',run("state.profile.egfrMode==='auto'&&Number(state.profile.egfr)!==42&&state.profile.egfrMethod.includes('2021')"));
run("page='workspace';updateBound({dataset:{bind:'profile.egfr'},type:'text',value:'45'});state.profile.weight='70';markChanged();");
check('direct eGFR entry remains editable',run("state.profile.egfr==='45'&&state.profile.egfrMode==='manual'"));
console.log(`PASS: ${count} filter taxonomy, bilingual search, ranking and usability checks.`);
check('snapshot date uses publication rather than earlier technical extraction',run("festDateLabel({festPublication:'2026-10-13',festExtracted:'2026-10-08T14:02:49'})==='13.10.2026'"));
check('newer incremental data date replaces older publication date',run("festDateLabel({festPublication:'2026-10-13',festExtracted:'2026-10-26T12:00:00',festIncremental:true})==='26.10.2026'"));
check('a check/download date alone does not change the FEST version',run("festDateLabel({festPublication:'2026-10-13',festExtracted:'2026-10-08',downloaded:'2026-10-23'})==='13.10.2026'"));
check('footer and FEST source panel use the same date',run("footer().includes(festDateLabel())&&festVersionText().includes(festDateLabel())"));
console.log('PASS: 4 dynamic FEST date checks.');
run("document.hidden=false;syncUntouched=true;syncReloading=false;");
context.nextStatus={phase:'updated',revision:'new-test-revision'};
check('new data can load automatically before work starts',run('syncCanApply(nextStatus)'));
check('typing prevents automatic reload',run('syncUntouched=false;!syncCanApply(nextStatus)'));
check('an open dialog prevents automatic reload',run('syncUntouched=true;document.getElementById=()=>({open:true});!syncCanApply(nextStatus)'));
check('background tabs never automatically reload',run('document.getElementById=()=>null;document.hidden=true;!syncCanApply(nextStatus)'));
check('an incomplete or failed update never automatically loads',run("document.hidden=false;['checking','validating','error'].every(phase=>!syncCanApply({...nextStatus,phase}))"));
check('same version does not reload',run("!syncCanApply({phase:'current',revision:DATA.catalog.meta.syncRevision})"));
run("globalThis.modalText='';modal=(title,body)=>{globalThis.modalText=body;};syncDetails();");
check('Datastatus and footer agree on the loaded data date',run('modalText.includes(festDateLabel())&&footer().includes(festDateLabel())'));
console.log('PASS: 7 startup update and date consistency checks.');

run("filters={q:'',topic:'',tags:['nyre']};sourceContext={atc:'N03AX16'};");
check('renal icon deep link exposes CrCl source',run("renalSourcePanel().includes('Grunnlag for CrCl-kontrollpunktet')"));
check('renal topic exposes source',run("filters.tags=[];filters.topic='nyre';renalSourcePanel().includes('metodevalg')"));
check('renal query exposes source',run("filters.topic='';filters.q='kidney';renalSourcePanel().includes('metodevalg')"));
check('clearing renal context removes method panel',run("filters.q='';renalSourcePanel()===''"));
check('failure never advertised as available update',run("!syncUpdateAvailable({phase:'error',revision:'different'})"));
check('unknown update phase is never applied',run("!syncUpdateAvailable({phase:'unknown',revision:'different'})"));
console.log('PASS: 6 renal source and sync-error presentation checks.');
