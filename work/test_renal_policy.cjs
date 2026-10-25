const assert=require('node:assert/strict'),fs=require('node:fs');
const policy=require('./renal-policy.js'),calc=require('./calculators.js');
const clinical=JSON.parse(fs.readFileSync(__dirname+'/clinical-rules.json','utf8'));
const index=new Map(clinical.entries.map(e=>[e.atc,e])),rules=new Map(clinical.rules.map(r=>[r.id,r]));
const profile={age:'76',egfr:'45',stability:'stable'};
const candidates=atc=>(index.get(atc)?.rules||[]).map(id=>rules.get(id));
const assess=(atc,p={},cg=null,med={})=>policy.assess({atc,...med},{...profile,...p},candidates(atc),cg);
let checks=0;
function check(name,fn){assert.ok(fn(),name);checks++;}
// An absent value never becomes zero or an inferred impairment, across the full registry.
for(const egfr of ['',null,undefined,'0','-1','abc','Infinity','<60']){
 check('no inferred impairment for '+egfr,()=>clinical.entries.every(e=>assess(e.atc,{egfr})===null));
}
for(const p of [{age:''},{age:'17'},{age:'140'},{stability:''},{stability:'unstable'},{dialysis:true},{pregnant:true}]){
 check('out-of-scope profile '+JSON.stringify(p),()=>clinical.entries.every(e=>assess(e.atc,p,20)===null));
}
check('normal eGFR is not a universal medicine warning',()=>clinical.entries.every(e=>assess(e.atc,{egfr:'95'})===null));
for(const atc of ['C08CA01','C10AA05','N02BE01','A02BC02','A10BH05','J01MA14','M02AA13','S01AA12']){
 check(atc+' has no routine renal flag from a name or broad category',()=>assess(atc)===null);
}
check('metformin at eGFR 45 is a review, not a dose conclusion',()=>assess('A10BA02').label==='Vurder nyrehensyn'&&assess('A10BA02').reason.includes('ikke fastslått'));
check('review threshold excludes eGFR exactly 60',()=>assess('A10BA02',{egfr:'60'})===null);
check('review threshold includes eGFR just below 60',()=>!!assess('A10BA02',{egfr:'59,9'}));
check('RAAS uses monitoring language',()=>assess('C09CA06').label==='Vurder prøver');
check('SGLT2 is not labelled nephrotoxic',()=>!assess('A10BK03').reason.includes('nyretoks'));
for(const atc of Object.keys(policy.crclRules)){
 const limit=policy.crclRules[atc].below;
 check(atc+' threshold is exclusive',()=>assess(atc,{},limit)===null);
 check(atc+' uses actual CrCl threshold',()=>assess(atc,{},limit-.01)?.label==='Kontroller nyredose');
 check(atc+' does not substitute low eGFR for normal CrCl',()=>assess(atc,{egfr:'8'},100)===null);
}
check('pregabalin with eGFR only asks for CrCl',()=>assess('N02BF02').kind==='missing');
check('apixaban with eGFR only asks for CrCl',()=>assess('B01AF02').label==='Avklar CrCl');
check('ceftriaxone is not a generic cephalosporin alarm at 45',()=>assess('J01DD04')===null);
check('ceftriaxone severe screening still asks for the correct method',()=>assess('J01DD04',{egfr:'12'}).kind==='missing');
check('CrCl can identify gabapentin check even with normal eGFR',()=>assess('N02BF01',{egfr:'90'},70).kind==='review');
check('no eGFR but a valid CrCl still supports a CrCl-specific check',()=>assess('N02BF01',{egfr:''},70).kind==='review');
for(const med of [{status:'Pausert'},{status:'Seponert'},{schedule:'Bruker ikke'},{form:'krem'}]){
 check('inactive or local drug '+JSON.stringify(med),()=>assess('A10BA02',{},null,med)===null);
}
check('missing data has one neutral explanation',()=>policy.context({...profile,egfr:''}).reason.includes('mangler'));
check('unstable function requests specific assessment',()=>policy.context({...profile,stability:'unstable'}).special);
const p={...profile,age:'80',sex:'male',weight:'60',cgWeightType:'actual',creatinine:'120',scrUnit:'umol'};
check('real calculator feeds CrCl, never eGFR',()=>{
 const cg=calc.evaluate(p).values.cg;
 return cg>36&&cg<38&&assess('B01AF02',p,cg)===null&&assess('N02BF02',p,cg).reason.startsWith('CrCl 36.8');
});
console.log(`PASS: ${checks} renal display, missing-data, scope and method-boundary checks (full registry screened).`);
