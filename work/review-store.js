/* One atomic localStorage value per review. Never overwrite a newer revision. */
class IMMReviewStore {
 constructor(storage){this.storage=storage;this.prefix='imm-review-v1:';this.activeKey='imm-active-review-v1';}
 // Retired identifiers are not renamed to patientNumber: initials remain identifying.
 static withoutRetiredFields(state){
  if(!state?.profile)return state;
  const profile={...state.profile};
  for(const key of ['initials','admittedFrom','admittedDate','bed'])delete profile[key];
  return {...state,profile};
 }
 migratePrivacy(){
  const keys=Array.from({length:this.storage.length},(_,i)=>this.storage.key(i)).filter(k=>k?.startsWith(this.prefix));
  for(const key of keys){
   let record;try{record=this.read(key.slice(this.prefix.length));}catch{continue;}
   if(!record||!['initials','admittedFrom','admittedDate','bed'].some(k=>Object.hasOwn(record.state.profile||{},k)))continue;
   const next={...record,state:IMMReviewStore.withoutRetiredFields(record.state),revision:record.revision+1};
   // One atomic write per review; errors propagate so removal is never silently claimed.
   this.storage.setItem(key,JSON.stringify(next));
  }
 }
 read(id){
  const text=this.storage.getItem(this.prefix+id);
  if(text===null)return null;
  const r=JSON.parse(text);
  if(r.format!=='IMM-local-review'||r.version!==1||r.id!==id||!r.state||!Number.isInteger(r.revision))throw Error('Uleselig lokal gjennomgang.');
  return r;
 }
 list(){
  const rows=[];
  for(let i=0;i<this.storage.length;i++){
   const key=this.storage.key(i);
   if(!key?.startsWith(this.prefix))continue;
   const id=key.slice(this.prefix.length);
   try{const r=this.read(id);if(r)rows.push(r);}
   catch{rows.push({id,name:'Uleselig gjennomgang',corrupt:true,updatedAt:''});}
  }
  return rows.sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
 }
 active(){return this.storage.getItem(this.activeKey);}
 select(id){if(id)this.storage.setItem(this.activeKey,id);else this.storage.removeItem(this.activeKey);}
 save(record,expectedRevision){
  const old=this.read(record.id);
  if(expectedRevision===null?old!==null:old?.revision!==expectedRevision){
   const e=Error('Gjennomgangen er endret eller slettet i en annen fane. Lagre arbeidet som en ny gjennomgang.');e.code='CONFLICT';throw e;
  }
  const next={...record,state:IMMReviewStore.withoutRetiredFields(record.state),format:'IMM-local-review',version:1,revision:(expectedRevision??0)+1};
  this.storage.setItem(this.prefix+next.id,JSON.stringify(next));
  // A failed active-pointer write must not invalidate the saved review itself.
  try{this.select(next.id);}catch{}
  return next;
 }
 remove(id,expectedRevision){
  if(expectedRevision!==undefined&&this.read(id)?.revision!==expectedRevision)throw Error('Gjennomgangen ble endret i en annen fane. Oppdater oversikten før du sletter.');
  this.storage.removeItem(this.prefix+id);
  try{if(this.active()===id)this.select(null);}catch{}
 }
 restore(record){
  if(this.read(record.id)!==null)throw Error('Gjennomgangen finnes allerede. Gjenoppretting ble ikke utført.');
  // Keep revisions increasing across deletion/restoration; stale tabs must still conflict.
  const next={...record,state:IMMReviewStore.withoutRetiredFields(record.state),format:'IMM-local-review',version:1,revision:record.revision+1};
  this.storage.setItem(this.prefix+next.id,JSON.stringify(next));
  try{this.select(next.id);}catch{}
  return next;
 }
}
/* In-memory, bounded undo. One editing gesture may perform several state writes. */
class IMMUndoHistory {
 constructor(limit=20,maxBytes=2000000){this.limit=limit;this.maxBytes=maxBytes;this.reset(null);}
 reset(value){this.current=JSON.stringify(value);this.entries=[];}
 observe(value,label,group){
  const next=JSON.stringify(value);if(next===this.current)return false;
  const last=this.entries.at(-1);
  if(last&&last.group===group){last.after=next;if(last.before===next)this.entries.pop();}
  else this.entries.push({before:this.current,after:next,label,group});
  this.current=next;
  while(this.entries.length>this.limit||this.entries.reduce((n,e)=>n+(e.before.length+e.after.length)*2,0)>this.maxBytes)this.entries.shift();
  return true;
 }
 peek(){const e=this.entries.at(-1);return e?{value:JSON.parse(e.before),after:JSON.parse(e.after),label:e.label}:null;}
 consume(){const e=this.entries.pop();if(e)this.current=e.before;}
}
if(typeof module!=='undefined'&&module.exports){module.exports=IMMReviewStore;module.exports.IMMUndoHistory=IMMUndoHistory;}
