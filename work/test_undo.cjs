const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Store=require('./review-store.js'),History=Store.IMMUndoHistory;
class MemoryStorage {constructor(){this.map=new Map();this.fail=false;}get length(){return this.map.size;}key(i){return [...this.map.keys()][i]??null;}getItem(k){return this.map.get(k)??null;}setItem(k,v){if(this.fail)throw Error('Lagring full');this.map.set(k,v);}removeItem(k){this.map.delete(k);}}
let checks=0;function check(name,fn){fn();checks++;}
const h=new History(3),group={};h.reset({age:''});h.observe({age:'7'},'Alder',group);h.observe({age:'78'},'Alder',group);
check('typing groups into one action',()=>{assert.equal(h.entries.length,1);assert.deepEqual(h.peek().value,{age:''});});
h.observe({age:''},'Alder',group);check('returning to original value removes no-op',()=>assert.equal(h.entries.length,0));
for(let i=1;i<8;i++)h.observe({age:i},'Alder',{});check('bounded history',()=>assert.equal(h.entries.length,3));
const tiny=new History(20,10);tiny.reset({text:''});tiny.observe({text:'large'},'Text',{});check('memory bounded',()=>assert.equal(tiny.entries.length,0));
const storage=new MemoryStorage(),ctx={console,storage,document:{addEventListener(){}},window:{addEventListener(){}}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/review-store.js','utf8'),ctx);
vm.runInContext(`let counter=0,state={profile:{age:''},meds:[],lrps:[],lms:{sourceList:[],confirmed:false}},dirty=false,page='workspace',step=1,resourceOnly=false;
const uid=()=>String(++counter),esc=String,$=s=>s==='#modal'?{open:false,close(){}}:null;
const syncRenal=()=>{},render=()=>{},route=p=>{page=p;},toast=t=>{lastToast=t;};let lastToast='';
const blank=()=>({profile:{age:''},meds:[],lrps:[],lms:{sourceList:[],confirmed:false}}),cleanDrafts=x=>x,cleanImported=x=>x.state,navItems=[['workspace'],['sessions']];`,ctx);
vm.runInContext(fs.readFileSync(__dirname+'/sessions.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),value=s=>JSON.parse(JSON.stringify(run(s)));
function begin(){run(`state=blank();drafts={};activeReview=null;reviewStore=new IMMReviewStore(storage);resetUndo();persistCurrent();resetUndo();`);}
function change(s){run(`undoGroup={};undoLabel='Endring';${s};markChanged();`);}
begin();run(`undoGroup={};state.profile.age='7';markChanged();state.profile.age='78';markChanged();`);
check('one history step after repeated autosaves',()=>assert.equal(run('undoHistory.entries.length'),1));
run(`undoLastChange()`);check('undo is persisted',()=>{assert.equal(run('state.profile.age'),'');assert.equal(run('reviewStore.read(activeReview.id).state.profile.age'),'');});
change(`state.profile.age='78'`);run(`drafts['med:']={kind:'med',values:{name:'Uferdig'}};markChanged();undoLastChange();`);
check('newer unfinished draft survives state undo',()=>assert.equal(run("drafts['med:'].values.name"),'Uferdig'));
change(`state.meds=[{id:'a',name:'A',observations:{epj:{dose:'1x1'}}}];state.lrps=[{id:'l',drug:'A'}]`);change(`state.meds=[];state.lms.confirmed=false`);run('undoLastChange()');
check('undo medication deletion restores observations and keeps LRP',()=>{assert.equal(run("state.meds[0].observations.epj.dose"),'1x1');assert.equal(run('state.lrps.length'),1);});
change(`state.lms.sourceList=[{id:'epj'}];state.lms.confirmed=true`);change(`state.lms.sourceList=[];delete state.meds[0].observations.epj;state.lms.confirmed=false`);run('undoLastChange()');
check('source deletion fully restored',()=>{assert.equal(run('state.lms.sourceList.length'),1);assert.equal(run('state.lms.confirmed'),true);assert.equal(run("state.meds[0].observations.epj.dose"),'1x1');});
change(`state.lrps.push({id:'l2'})`);change(`state.lrps.reverse()`);run('undoLastChange()');check('LRP order restored',()=>assert.deepEqual(value('state.lrps.map(l=>l.id)'),['l','l2']));
change(`state.profile.age='79'`);const age=run('state.profile.age'),length=run('undoHistory.entries.length');storage.fail=true;run('undoLastChange()');
check('failed save preserves history and UI',()=>{assert.equal(run('state.profile.age'),age);assert.equal(run('undoHistory.entries.length'),length);});storage.fail=false;
run(`const other=reviewStore.read(activeReview.id);reviewStore.save({...other,name:'Annen fane'},other.revision);undoLastChange();`);
check('newer tab cannot be overwritten by undo',()=>{assert.equal(run('reviewStore.read(activeReview.id).name'),'Annen fane');assert.equal(run('state.profile.age'),age);assert.equal(run('undoHistory.entries.length'),length);});
begin();change(`state.profile.age='76'`);run(`const opened=reviewStore.save({id:'different',name:'Annen',state:blank(),drafts:{}},null);restoreReview(opened);`);
check('switching review clears undo',()=>assert.equal(run('undoHistory.peek()'),null));
begin();change(`state.profile.age='80'`);run(`const removed=reviewStore.read(activeReview.id);reviewStore.remove(removed.id,removed.revision);state=blank();drafts={};activeReview=null;resetUndo();deletedReviewUndo={record:removed,wasActive:true};undoLastChange();`);
check('deleted review restored with higher revision',()=>{assert.equal(run('state.profile.age'),'80');assert.equal(run('activeReview.revision'),run('removed.revision+1'));});
check('stale pre-deletion tab still conflicts',()=>assert.throws(()=>run(`reviewStore.save({...removed,state:blank()},removed.revision)`),/annen fane/));
run(`const removedAgain=reviewStore.read(activeReview.id);reviewStore.remove(removedAgain.id,removedAgain.revision);state=blank();drafts={};activeReview=null;resetUndo();deletedReviewUndo={record:removedAgain,wasActive:true};drafts['med:']={kind:'med',values:{name:'Ny kladd'}};markChanged();`);
check('draft editing clears deleted-review undo before new autosave',()=>assert.equal(run('deletedReviewUndo'),null));
check('draft merge never overwrites newer draft',()=>assert.deepEqual(value(`undoDrafts({'med:':{name:'old'}},{},{'med:':{name:'new'}})`),{'med:':{name:'new'}}));
check('draft removed during save can be recovered',()=>assert.deepEqual(value(`undoDrafts({'med:':{name:'old'}},{},{})`),{'med:':{name:'old'}}));
check('unchanged drafts are not reverted',()=>assert.deepEqual(value(`undoDrafts({'med:':{name:'same'}},{'med:':{name:'same'}},{'med:':{name:'new'}})`),{'med:':{name:'new'}}));
console.log('PASS: '+checks+' undo grouping, drafts, deletion, persistence and cross-tab checks.');
