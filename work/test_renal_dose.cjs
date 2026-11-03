/* Independent renal reference values and integration checks for dose-source navigation. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=require('./calculators.js');
let count=0;const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);count++;};
const p={age:'50',sex:'female',weight:'90',height:'170',creatinine:'250',scrUnit:'umol',cystatin:'',stability:'stable',cgWeightType:'actual',cgWeight:'',labEgfr:'20',labMethod:'EKFC 2021',doseDrug:'Fiktivt testpreparat',doseIndication:'Test · IV',doseMetric:'cg'};
near(c.body(p).bsa,Math.sqrt(4.25));near(c.body(p).ideal,61.064);near(c.body(p).adjusted,72.6384);
near(c.evaluate(p).values.cg,33.813);near(c.evaluate({...p,cgWeightType:'ousAdjusted'}).values.cg,27.29024688);
near(c.renalBasis(p,'labAbsolute'),20*Math.sqrt(4.25)/1.73);
near(c.renalBasis({...p,labEgfr:'77',height:'169',weight:'120'},'labAbsolute'),77*Math.sqrt(169*120/3600)/1.73);
near(c.renalBasis(p,'cgIndexed')*c.body(p).bsa/1.73,c.renalBasis(p,'cg'));
near(c.renalBasis({...p,creatinine:String(250/88.4),scrUnit:'mgdl'},'cg'),33.813);
near(c.renalBasis({...p,labEgfr:'20,5'},'labIndexed'),20.5);
for(const kind of ['cr','combined','cys']){
 const q={...p,cystatin:'2.3'};
 near(c.renalBasis(q,kind+'Absolute'),c.renalBasis(q,kind+'Indexed')*Math.sqrt(4.25)/1.73);
}
// No substitution of CKD-EPI, laboratory eGFR or creatinine clearance.
assert.equal(c.renalBasis({...p,cgWeightType:''},'cg'),null);count++;
assert.equal(c.renalBasis({...p,labEgfr:'>90'},'labAbsolute'),null);count++;
assert.equal(c.renalBasis({...p,height:''},'labAbsolute'),null);count++;
near(c.renalBasis({...p,height:'',weight:'',sex:'',creatinine:''},'labIndexed'),20);
for(const delta of [{stability:''},{stability:'unstable'},{dialysis:true},{pregnant:true},{age:'17'},{age:''},{age:'140'}]){
 for(const key of ['cg','cgIndexed','crIndexed','combinedAbsolute','cysAbsolute','labIndexed','labAbsolute']){assert.equal(c.renalBasis({...p,...delta},key),null,JSON.stringify({delta,key}));count++;}
}
for(const key of ['', 'incorrect','combinedAbsolute','cysIndexed']){assert.equal(c.renalBasis(p,key),null);count++;}
assert.equal(c.renalBasis({...p,labMethod:''},'labIndexed'),null);count++;
assert.equal(c.body({...p,height:'140'}).ideal,null);assert.equal(c.body({...p,weight:'40'}).adjusted,null);count+=2;
// Integration uses the real application modules and state migration.
const DATA=JSON.parse(fs.readFileSync(__dirname+'/data.json','utf8'));DATA.catalog=JSON.parse(fs.readFileSync(__dirname+'/catalog/catalog.json','utf8'));DATA.clinical=JSON.parse(fs.readFileSync(__dirname+'/clinical-rules.json','utf8'));DATA.natural=JSON.parse(fs.readFileSync(__dirname+'/natural-products.json','utf8'));DATA.older.translations={...JSON.parse(fs.readFileSync(__dirname+'/start-nb.json','utf8')),...JSON.parse(fs.readFileSync(__dirname+'/stopp-nb.json','utf8'))};DATA.older.parameters=JSON.parse(fs.readFileSync(__dirname+'/criteria-parameters.json','utf8'));
const context={IMMCalc:c,DATA,URLSearchParams,URL,console,crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},location:{href:'http://localhost/index.html',search:''},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{}}},window:{addEventListener(){}}};vm.createContext(context);
const files=JSON.parse(fs.readFileSync(__dirname+'/app-files.json','utf8'));
let app=files.map(n=>fs.readFileSync(__dirname+'/'+n,'utf8')).join('\n');app=app.slice(0,app.lastIndexOf("if(resourceOnly){page='library'"));vm.runInContext(app,context);context.IMMDose=context.window.IMMDose;
const check=(name,script)=>{assert.equal(vm.runInContext(script,context),true,name);count++;};
vm.runInContext('state.profile={...profileBlank(),...'+JSON.stringify(p)+'};',context);
check('lab transfer persists and is indexed',`state.profile.egfrMode='lab';syncRenal();state.profile.egfr==='20'&&state.profile.egfrMethod.includes('EKFC')`);
check('creatinine recalculation cannot overwrite lab mode',`state.profile.creatinine='125';syncRenal();state.profile.egfr==='20'`);
check('auto CKD-EPI transfer still works',`state.profile.egfrMode='auto';syncRenal();Number(state.profile.egfr)>20&&state.profile.egfrMethod.includes('CKD-EPI')`);
check('reload retains laboratory mode and source context',`state.profile.egfrMode='lab';const restored=cleanImported({format:'IMM-Kompass',version:3,state},true);restored.profile.labEgfr==='20'&&restored.profile.labMethod==='EKFC 2021'&&restored.profile.egfrMode==='lab'&&restored.profile.doseDrug==='Fiktivt testpreparat'`);
check('import retains valid optional weight method',`state.profile.cgWeightType='ousAdjusted';cleanImported({format:'IMM-Kompass',version:3,state}).profile.cgWeightType==='ousAdjusted'`);
check('dose worksheet and sample date are absent in rendered calculator',`const html=renderRenal();!html.includes('Regn ut dose fra kilden')&&!html.includes('profile.labDate')&&html.includes('Legemiddel og dosekilder')`);
check('sample date absent in reconciliation',`!renderLms().includes('profile.labDate')`);
check('invalid context retains source access but no numeric basis',`state.profile.dialysis=true;state.profile.doseMetric='cg';renalDoseBasis().includes('Verdien kan ikke beregnes')&&renalDrugLinks().includes('UpToDate')`);
check('no private sample data in source URL',`state.profile.doseDrug='Test';state.profile.doseAtc='J05AB01';!drugSourceUrl(renalDoseDrug(),'nyre').includes('50')`);
check('selected FEST medicine supplies its exact SPC link',`const med=DATA.catalog.meds.find(m=>m.spc&&m.atc==='J05AB01');state.profile.doseCatalogId=med.id;state.profile.doseAtc=med.atc;renalDrugLinks().includes(esc(med.spc))&&renalDrugLinks().includes(RENAL_GUIDES.ous)`);
check('non-antiinfective does not get an antibiotic-only source',`state.profile.doseCatalogId='';state.profile.doseAtc='C08CA01';!renalDrugLinks().includes(RENAL_GUIDES.ous)`);
console.log('Renal estimates and dose sources: '+count+' checks passed');
