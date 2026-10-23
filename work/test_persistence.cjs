const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Store=require('./review-store.js');
class MemoryStorage{
 constructor(){this.map=new Map();this.fail=false;}
 get length(){return this.map.size;}
 key(i){return [...this.map.keys()][i]??null;}
 getItem(k){return this.map.get(k)??null;}
 setItem(k,v){if(this.fail)throw Error('QuotaExceededError');this.map.set(k,v);}
 removeItem(k){this.map.delete(k);}
}
const storage=new MemoryStorage(),one=new Store(storage),two=new Store(storage);
const snapshot={id:'test-a',name:'Fiktiv A',state:{journal:{entries:[{lrp:'Et problem'}]}},drafts:{'med:':{kind:'med',id:'',values:{name:'Fiktiv kladd'}}},updatedAt:'2026-10-20T10:00:00Z'};
let saved=one.save(snapshot,null);
assert.equal(saved.revision,1);
assert.equal(two.active(),'test-a');
assert.deepEqual(two.read('test-a').state,snapshot.state);
assert.deepEqual(two.read('test-a').drafts,snapshot.drafts);
saved=one.save({...saved,name:'Endret navn'},saved.revision);
assert.throws(()=>two.save(snapshot,1),e=>e.code==='CONFLICT');
assert.equal(two.read('test-a').name,'Endret navn');
storage.fail=true;
assert.throws(()=>one.save({...saved,name:'Skal ikke erstatte'},2));
assert.equal(one.read('test-a').name,'Endret navn');
storage.fail=false;
const b=one.save({...snapshot,id:'test-b',updatedAt:'2026-10-20T11:00:00Z'},null);
assert.equal(one.list().length,2);
assert.equal(one.list()[0].id,'test-b');
assert.throws(()=>two.remove('test-a',1));
one.remove('test-a',2);
assert.equal(one.read('test-a'),null);
assert.throws(()=>two.save(saved,2),e=>e.code==='CONFLICT');
assert.equal(one.list().length,1);
assert.equal(one.active(),'test-b');
one.remove('test-b',b.revision);
assert.equal(one.active(),null);
storage.setItem('imm-review-v1:broken','{invalid');
assert.equal(one.list()[0].corrupt,true);
one.remove('broken');
assert.equal(one.list().length,0);
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/journal.js','utf8'),context);
const entry={title:'Kort tittel',lrp:'Problem',suggestion:'Forslag',implemented:false,measure:'Et gjennomført tiltak'};
const journal={title:'LMG',entries:[entry]};
assert.equal(context.journalValidation(journal),'');
assert(!context.journalText(journal).includes('Tiltak'));
entry.implemented=true;
assert(context.journalText(journal).includes('Tiltak (lege konsultert, iverksatt): Et gjennomført tiltak'));
entry.measure='';
assert(context.journalValidation(journal).includes('Beskriv tiltaket'));
entry.implemented=false;entry.suggestion='';
assert(context.journalValidation(journal).includes('Fyll ut'));
assert(context.journalValidation({title:'LMG',entries:[]}).includes('minst ett'));
console.log('PASS: persistence/reopen, drafts, quota failure, revision conflicts, deletion and journal gating (25 assertions).');
