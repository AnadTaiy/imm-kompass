const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {workStatusData,workStatusTargets,workStatusTarget,workStatusHtml}=require('./work-status.js');
const compare=m=>({different:!!m.different,missing:!!m.missing});
let checks=0;function check(name,fn){fn();checks++;}
const state={meds:[
 {id:'different',different:true,reconciliation:'Ikke avklart'},
 {id:'resolved',different:true,reconciliation:'Avklart'},
 {id:'unknown',missing:true,reconciliation:'Ikke avklart'},
 {id:'both',different:true,missing:true,reconciliation:'Avvik til avklaring'},
 {id:'stale-resolved',missing:true,reconciliation:'Avklart'},
 {id:'equal',reconciliation:'Ikke avklart'}
],lrps:[{id:'empty',action:''},{id:'space',action:' \n '},{id:'ready',action:'Kontroller prøven'},{id:'old',status:'Avklart'}]};
const before=JSON.stringify(state),data=workStatusData(state,compare);
check('only actual unresolved differences are discrepancies',()=>assert.deepEqual(data.discrepancies,['different','both']));
check('missing information is separate and is not hidden by stale reconciliation',()=>assert.deepEqual(data.incomplete,['unknown','both','stale-resolved']));
check('blank or absent suggestions are counted even on older resolved LRPs',()=>assert.deepEqual(data.lrps,['empty','space','old']));
check('unconfirmed equal doses are not called discrepancies',()=>assert.ok(!data.discrepancies.includes('equal')));
check('calculation leaves review unchanged',()=>assert.equal(JSON.stringify(state),before));
check('targets follow current list order and preserve stable ids',()=>assert.deepEqual(workStatusTargets('discrepancies',data),[{type:'med',id:'different'},{type:'med',id:'both'}]));
check('LRP target is a problem rather than a medicine',()=>assert.deepEqual(workStatusTarget('lrps',data),{type:'lrp',id:'empty'}));
check('unknown category cannot navigate',()=>assert.equal(workStatusTarget('other',data),null));
check('empty category cannot navigate',()=>assert.equal(workStatusTarget('discrepancies',workStatusData({meds:[],lrps:[]},compare)),null));
check('each count has a distinct semantic action',()=>{const html=workStatusHtml(data);for(const kind of ['discrepancies','incomplete','lrps'])assert.ok(html.includes(`data-kind="${kind}"`));assert.equal((html.match(/data-action="jump-work-status"/g)||[]).length,3);});
check('blank review adds no status clutter',()=>assert.equal(workStatusHtml(workStatusData({meds:[],lrps:[]},compare)),'<div id="work-status"></div>'));
check('zero pending counts give neutral registration counts, not completion claims',()=>{const html=workStatusHtml(workStatusData({meds:[{id:'m'}],lrps:[{id:'l',action:'Vurder'}]},compare));assert.ok(html.includes('1 legemiddel · 1 LRP registrert'));assert.ok(!html.includes('data-action='));assert.ok(!/fullført|ferdig|komplett|uten problemer/i.test(html));});
check('singular labels are grammatical',()=>{const html=workStatusHtml(workStatusData({meds:[{id:'m',different:true,missing:true}],lrps:[{id:'l'}]},compare));assert.ok(html.includes('1 uavklart avvik'));assert.ok(html.includes('1 legemiddel med manglende dosering'));assert.ok(html.includes('1 LRP uten forslag'));});
check('counts update after resolving a difference or writing a suggestion',()=>{const changed=JSON.parse(before);changed.meds[0].reconciliation='Avklart';changed.lrps[0].action='Ny vurdering';const updated=workStatusData(changed,compare);assert.deepEqual(updated.discrepancies,['both']);assert.deepEqual(updated.lrps,['space','old']);});
// Exercise the real dose comparison, including coded versus written equivalent doses.
const context={console,document:{addEventListener(){}},window:{},norm:s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''),state:{lms:{sourceList:[{id:'epj',type:'EPJ'},{id:'kj',type:'KJ'}]},meds:[],lrps:[]}};
vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/dosage.js','utf8'),context);context.IMMDose=context.window.IMMDose;
vm.runInContext(fs.readFileSync(__dirname+'/lms-v3.js','utf8'),context);
const realData=vm.runInContext(`state.meds=[{id:'normalized',form:'Tablett',doseUnit:'tablett',actualUses:{patient:{dose:'1x1'}},observations:{epj:{dose:'1 tablett daglig'},kj:{dose:'1x1'}}},{id:'partial',form:'Tablett',doseUnit:'tablett',actualUses:{patient:{dose:'1x1'}},observations:{epj:{dose:'2x1'}}}];state.meds.map(m=>({id:m.id,...discrepancy(m)}))`,context);
check('real dose normalization does not create a false discrepancy',()=>{assert.equal(realData[0].different,false);assert.equal(realData[0].missing,false);});
check('real partial comparison can contain both a known difference and unknown dose',()=>{assert.equal(realData[1].different,true);assert.equal(realData[1].missing,true);});
console.log('PASS: '+checks+' work-status counts, navigation targets, dose comparison and non-mutation checks.');
