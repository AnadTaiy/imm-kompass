const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const DATA=JSON.parse(fs.readFileSync(__dirname+'/data.json','utf8'));DATA.catalog=JSON.parse(fs.readFileSync(__dirname+'/catalog/catalog.json','utf8'));DATA.older.translations=JSON.parse(fs.readFileSync(__dirname+'/start-nb.json','utf8'));Object.assign(DATA.older.translations,JSON.parse(fs.readFileSync(__dirname+'/stopp-nb.json','utf8')));DATA.older.translationNotes=JSON.parse(fs.readFileSync(__dirname+'/stopp-notes-nb.json','utf8'));DATA.older.parameters=JSON.parse(fs.readFileSync(__dirname+'/criteria-parameters.json','utf8'));
DATA.natural=JSON.parse(fs.readFileSync(__dirname+'/natural-products.json','utf8'));
const context={IMMCalc:require('./calculators.js'),DATA,URLSearchParams,URL,console,crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},location:{href:'http://localhost/index.html',search:''},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{}}},window:{addEventListener(){}}};
vm.createContext(context);
const files=['calculators.js','dosage.js','review-store.js','sessions.js','work-status.js','view-state.js','workflow.js','lms-v3.js','renal-policy.js','clinical-ui.js','help.js','older-ui.js','patient-context.js','stopp-context.js','criteria-policy.js','practical-ui.js','catalog-ui.js','natural-products.js','source-context.js','journal-v3.js','substances.js','interactions.js','state-migration.js','sync-ui.js','app.js'];
let app=files.map(n=>fs.readFileSync(__dirname+'/'+n,'utf8')).join('\n');app=app.slice(0,app.lastIndexOf("if(resourceOnly){page='library'"));vm.runInContext(app,context);context.IMMDose=context.window.IMMDose;
let count=0;const check=(name,script)=>{assert.equal(vm.runInContext(script,context),true,name);count++;};
const run=s=>vm.runInContext(s,context);


run(`state=blank();state.meds=[{id:'a',name:'A <test>',atc:''},{id:'b',name:'B',atc:''}];interactionPairs=()=>[{a:'a',b:'b',key:'pair-a:b',number:1,level:1,ids:['test-record']}];interactionIndex.set('test-record',{condition:'Kun ved samtidig bruk'});`);
check('conditional database label retained',`interactionFlags(state.meds[0]).includes('Databasetreff · avklar vilkår')`);
check('interaction severity and source unchanged',`interactionFlags(state.meds[0]).includes('level-1')&&interactionFlags(state.meds[0]).includes('interactions=test-record')`);
check('names escaped in visible flags',`interactionFlags(state.meds[1]).includes('A &lt;test&gt;')`);
check('extra explanation button removed',`!medTable().includes('Hvorfor markert')&&!medTable().includes('explain-warnings')`);
check('editing and drug-specific sources remain outside more actions',`/Sammenlign \\/ rediger<\\/button><a[^>]+scope=drug[^>]+>Fagkilder/.test(medTable())`);
check('problem registration and removal share more actions',`/<div class="med-more-content"><button[^>]+data-action="med-lrp"[^>]*>Registrer problem<\\/button><button[^>]+data-action="remove-med"/.test(medTable())`);
check('all pair anchors and rail retained',`(medTable().match(/data-interaction-anchor=/g)||[]).length===2&&medTable().includes('interaction-rail-viewport')`);
run(`interactionPairs=()=>[];state=blank();state.profile.age='78';state.meds=[{id:'s',name:'Atorvastatin',atc:'C10AA05',status:'Uendret',schedule:'Fast',actualUses:{patient:{dose:'1x1'}},treatmentPurpose:'primary'}];state.profile.frail=true;state.clinicalFacts.prognosisUnder3='yes';`);
check('excluded criterion status explicit',`criterionCheckHtml(olderCriteria.get('STOPP-B16'),state.meds[0]).includes('Ikke aktuelt ut fra registrerte opplysninger')`);
run(`state.profile.age='85';`);
check('matched criterion status explicit',`criterionCheckHtml(olderCriteria.get('STOPP-B16'),state.meds[0]).includes('Vilkår passer registrerte opplysninger')`);
run(`state=blank();state.profile.age='78';state.profile.endOfLife='no';state.meds=[{id:'o',name:'Morfin',atc:'N02AA01',status:'Uendret',schedule:'Fast',actualUses:{patient:{dose:'1x2'}}}];`);
check('START presents reason and incomplete-list caveat',`startPanel().includes('Grunnlag for kontrollpunktet:')&&startPanel().includes('Ingen behandling fra denne gruppen er registrert.')`);
console.log('PASS: '+count+' calm overview, source links and unchanged clinical status checks.');
