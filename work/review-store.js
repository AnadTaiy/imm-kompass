/* One atomic localStorage value per review. Never overwrite a newer revision. */
class IMMReviewStore {
 constructor(storage){this.storage=storage;this.prefix='imm-review-v1:';this.activeKey='imm-active-review-v1';}
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
  const next={...record,format:'IMM-local-review',version:1,revision:(expectedRevision??0)+1};
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
}
if(typeof module!=='undefined'&&module.exports)module.exports=IMMReviewStore;
