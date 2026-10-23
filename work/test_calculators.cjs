const assert=require('node:assert/strict'),fs=require('node:fs');
const c=require('./calculators.js');
let count=0;
function equal(actual,expected,note,tolerance=1e-10){
 assert.ok(Math.abs(actual-expected)<=tolerance,`${note}: actual ${actual}, expected ${expected}`);count++;
}
// Published appendix, CKD-EPI Implementation, Tufts, 8 December 2021, page 6.
// age, female, creatinine mg/dL, cystatin C mg/L, eGFRcr, eGFRcys, eGFRcr-cys (rounded).
const published=[
[27,0,.68,.78,131,121,128],[27,0,.90,.80,120,119,121],[27,0,.91,.81,118,117,120],[27,0,1,1,106,89,96],
[27,1,.68,.78,122,113,119],[27,1,.70,.80,121,111,117],[27,1,.71,.81,119,109,115],[27,1,1,1,79,83,81],
[54,0,.68,.78,110,108,115],[54,0,.90,.80,101,107,109],[54,0,.91,.81,100,105,108],[54,0,1,1,89,80,87],
[54,1,.68,.78,103,101,107],[54,1,.70,.80,103,100,105],[54,1,.71,.81,101,98,103],[54,1,1,1,67,74,73]
];
for(const [age,f,cr,cy,a,b,d] of published){
 const sex=f?'female':'male';
 equal(Math.round(c.egfrCr(age,sex,cr)),a,'Published eGFRcr');
 equal(Math.round(c.egfrCys(age,sex,cy)),b,'Published eGFRcys');
 equal(Math.round(c.egfrCrCys(age,sex,cr,cy)),d,'Published combined');
}
for(const t of JSON.parse(fs.readFileSync(__dirname+'/decimal_fixtures.json','utf8'))){
 const {age,sex,cr,cys,expected:e}=t;
 equal(c.egfrCr(age,sex,cr),e.cr,'Decimal cr');
 equal(c.egfrCys(age,sex,cys),e.cys,'Decimal cys');
 equal(c.egfrCrCys(age,sex,cr,cys),e.combined,'Decimal combined');
 equal(c.crcl(age,sex,cr,70),e.cg,'Decimal CG');
}
const base={age:'81',sex:'female',creatinine:'105',scrUnit:'umol',cystatin:'1.5',weight:'55',height:'165',stability:'stable',cgWeightType:'actual',cgWeight:'',dialysis:false,pregnant:false};
const result=c.evaluate(base);
assert.ok(result.valid);count++;
for(const delta of [
 {age:'15'}, {age:'140'}, {age:''}, {sex:''}, {sex:'unselected'}, {stability:''},{stability:'unstable'},{dialysis:true},{pregnant:true},
 {creatinine:'0'},{creatinine:'-1'},{creatinine:'>150'},{creatinine:'NaN'},{scrUnit:'other'},
 {cystatin:'-1'},{cystatin:'1,5,3'},{weight:'0'},{weight:'1001'},{height:'0'},{height:'301'},{cgWeightType:'ideal',cgWeight:''},{cgWeightType:'x'}
]){
 const r=c.evaluate({...base,...delta});
 assert.ok(!r.valid,JSON.stringify(delta));
 assert.ok(Object.values(r.values).every(x=>x===null),'Blocked input must clear results');count+=2;
}
const onlyCG=c.evaluate({...base,age:'16'});assert.ok(onlyCG.values.cg>0);assert.equal(onlyCG.values.cr,null);assert.equal(onlyCG.values.cys,null);assert.equal(onlyCG.values.combined,null);count+=4;
const onlyCys=c.evaluate({...base,creatinine:''});assert.ok(onlyCys.values.cys>0);assert.equal(onlyCys.values.cr,null);assert.equal(onlyCys.values.combined,null);assert.equal(onlyCys.values.cg,null);count+=4;
const onlyCr=c.evaluate({...base,cystatin:''});assert.ok(onlyCr.values.cr>0);assert.ok(onlyCr.values.cg>0);assert.equal(onlyCr.values.cys,null);assert.equal(onlyCr.values.combined,null);count+=4;
assert.equal(c.evaluate({...base,cgWeightType:''}).values.cg,null);count++;
assert.equal(c.evaluate({...base,height:''}).values.bsa,null);count++;
equal(c.evaluate({...base,scrUnit:'mgdl',creatinine:String(105/88.4)}).values.cr,result.values.cr,'SI equivalence');
equal(c.evaluate({...base,cystatin:'1,5'}).values.combined,result.values.combined,'Decimal comma');
equal(c.evaluate({...base,cgWeightType:'adjusted',cgWeight:'65'}).values.cg,result.values.cg*65/55,'Explicit alternative weight');
equal(c.bsa(180,80),2,'Mosteller reference');
equal(Math.round(c.crcl(80,'male',120/88.4,60)),37,'NHS published CG example');
equal(c.crcl(50,'male',1,80),100,'CG hand worked');
equal(c.crcl(50,'female',1,80),85,'CG female hand worked');
for(const bad of ['',null,undefined,'<1','-1','NaN','Infinity','1e5']){assert.equal(c.number(bad),null);count++;}
const cases=JSON.parse(fs.readFileSync(__dirname+'/data.json','utf8')).calibration;
const outputs=cases.map(t=>({input:t,...c.evaluate({...base,...t})}));
fs.writeFileSync(__dirname+'/calibration_results.json',JSON.stringify(outputs,null,2));
console.log(`PASS: ${count} assertions; 16 published cases / 48 outcomes, 450 independent Decimal cases / 1800 outcomes, unit conversions and invalid-state checks.`);
console.log(outputs.map(r=>`${r.input.id}: ${Object.entries(r.values).map(([k,v])=>k+'='+v.toFixed(4)).join(', ')}`).join('\n'));
