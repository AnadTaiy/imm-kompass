let reviewStore=null,activeReview=null,saveError='',drafts={};
const undoHistory=new IMMUndoHistory();
let undoGroup={},undoTarget=null,undoLabel='Endring',deletedReviewUndo=null;
function undoModel(){return {state,drafts,name:activeReview?.name||''};}
function resetUndo(){undoHistory.reset(undoModel());deletedReviewUndo=null;undoTarget=null;undoGroup={};}
function rememberEdit(event){
 const t=event.target,a=t.closest?.('[data-action]')?.dataset.action;
 if(event.type==='click'&&!a)return;
 if(event.type==='focusin'||event.type==='click'||event.type==='submit'||t!==undoTarget){
  undoGroup={};undoTarget=t;
  const labels={'confirm-remove-med':'Legemiddel fjernet','confirm-remove-lrp':'LRP fjernet','confirm-remove-source':'Kilde fjernet','patient-diagnosis-remove':'Diagnose fjernet','save-review-name':'Navn endret','lrp-up':'LRP flyttet','lrp-down':'LRP flyttet','discard-draft':'Kladd fjernet','add-source':'Kilde lagt til'};
  undoLabel=labels[a]||(event.type==='submit'?(t.id==='med-form'?'Legemiddel lagret':'LRP lagret'):'Endring');
 }
}
for(const type of ['focusin','input','change','click','submit'])document.addEventListener(type,rememberEdit,true);
function captureUndo(){
 // Draft typing is already autosaved. Only completed edits and explicit draft deletion create undo steps.
 const model=undoModel(),previous=JSON.parse(undoHistory.current);
 if(!previous){undoHistory.reset(model);return;}
 if(deletedReviewUndo&&JSON.stringify(previous)!==JSON.stringify(model))deletedReviewUndo=null;
 if(previous&&JSON.stringify(previous.state)===JSON.stringify(state)&&previous.name===model.name&&undoLabel!=='Kladd fjernet'){
  undoHistory.current=JSON.stringify(model);return;
 }
 if(undoHistory.observe(model,undoLabel,undoGroup))deletedReviewUndo=null;
}
function undoButton(){const label=deletedReviewUndo?'Gjennomgang slettet':undoHistory.entries.at(-1)?.label;return label?`<button class="small undo-button" data-action="undo" title="Angre: ${esc(label)}" aria-label="Angre: ${esc(label)}"><span aria-hidden="true">↶</span> Angre</button>`:'';}
function undoDrafts(before,after,current){
 const restored=JSON.parse(JSON.stringify(current));
 for(const key of new Set([...Object.keys(before||{}),...Object.keys(after||{})])){
  if(JSON.stringify(before?.[key])===JSON.stringify(after?.[key])||JSON.stringify(current[key])!==JSON.stringify(after?.[key]))continue;
  if(Object.hasOwn(before||{},key))restored[key]=before[key];else delete restored[key];
 }
 return restored;
}
function undoLastChange(){
 if($('#modal')?.open){toast('Lukk registreringsvinduet før du angrer. Kladden beholdes.');return;}
 try{
  if(deletedReviewUndo){
   const backup=deletedReviewUndo,selected=reviewStore.active();
   const saved=reviewStore.restore({...backup.record,updatedAt:new Date().toISOString()});
   if(backup.wasActive)restoreReview(saved);else {try{reviewStore.select(selected);}catch{}deletedReviewUndo=null;}
   render();toast('Gjennomgangen er gjenopprettet.');return;
  }
  const entry=undoHistory.peek();if(!entry||!activeReview)return;
  const model=entry.value;
  model.drafts=undoDrafts(model.drafts,entry.after.drafts,drafts);
  // Save first with revision checking. A failed or conflicting write must not consume history or replace the UI.
  const saved=reviewStore.save({...activeReview,state:model.state,drafts:model.drafts,name:model.name||activeReview.name,updatedAt:new Date().toISOString(),page,step},activeReview.revision);
  state=model.state;drafts=model.drafts;activeReview=saved;dirty=false;saveError='';undoHistory.consume();undoHistory.current=JSON.stringify(undoModel());undoGroup={};undoTarget=null;
  render();toast('Angret: '+entry.label.toLocaleLowerCase('nb-NO')+'.');
 }catch(error){toast(error.message);}
}
const localTime=value=>value?new Date(value).toLocaleString('nb-NO',{dateStyle:'short',timeStyle:'short'}):'Ukjent tidspunkt';
function storageError(error){
 saveError=error?.code==='CONFLICT'?error.message:'Kunne ikke lagre lokalt. Nettleserlagring kan være full eller blokkert. Eksporter arbeidsøkten før du lukker appen.';
 updateSaveStatus();
}
function persistCurrent(){
 try{
  if(!reviewStore)throw Error('Lagring er utilgjengelig.');
  const now=new Date().toISOString();
  const record=activeReview||{id:uid(),name:`Gjennomgang ${localTime(now)}`,createdAt:now,revision:null};
  activeReview=reviewStore.save({...record,state,drafts,updatedAt:now,page:page==='sessions'?'workspace':page,step},record.revision);
  const observed=JSON.parse(undoHistory.current);if(observed){observed.name=activeReview.name;undoHistory.current=JSON.stringify(observed);}
  dirty=false;saveError='';updateSaveStatus();return true;
 }catch(error){dirty=true;storageError(error);return false;}
}
function markChanged(){if(resourceOnly)return;syncRenal();captureUndo();dirty=true;persistCurrent();}
function updateSaveStatus(){
 const el=$('#save-status');if(!el||resourceOnly)return;
 el.className=`save-status ${saveError?'save-failed':''}`;
 el.innerHTML=saveError
  ?`<div role="alert"><strong>Ikke lagret lokalt</strong><p>${esc(saveError)}</p></div><div class="actions">${undoButton()}<button class="small" data-action="retry-save">Prøv igjen</button><button class="small" data-action="save-as-new">Lagre som ny</button><button class="small" data-action="export-json">Eksporter arbeidsøkt</button></div>`
  :`<span>${activeReview?`<strong>${esc(activeReview.name)}</strong> · Lagret lokalt ${esc(localTime(activeReview.updatedAt))}`:'Automatisk lokal lagring starter når du skriver.'}</span><div class="actions">${undoButton()}<button class="small" data-action="route" data-page="sessions">Gjennomganger</button></div>`;
}
function restoreReview(record){
 state=cleanImported({format:'IMM-Kompass',version:1,state:record.state},true);
 syncRenal();drafts=cleanDrafts(record.drafts);
 activeReview=record;dirty=false;saveError='';
 page=navItems.some(x=>x[0]===record.page)?record.page:'workspace';if(page==='lrp')page='workspace';
 step=[1,2,3].includes(record.step)?record.step:1;
 try{reviewStore.select(record.id);}catch{}
 resetUndo();
}
function initReviewStorage(){
 try{
  reviewStore=new IMMReviewStore(localStorage);
  reviewStore.migratePrivacy();
  const active=reviewStore.active();
  const record=active?reviewStore.read(active):reviewStore.list().find(r=>!r.corrupt);
  if(record)restoreReview(record);else resetUndo();
 }catch(error){storageError(error);}
}
function startNewReview(imported=null,importedDrafts={}){
 if(dirty&&!persistCurrent())return false;
 state=imported||blank();drafts=cleanDrafts(importedDrafts);activeReview=null;step=1;page='workspace';
 resetUndo();
 markChanged();route('workspace');
 toast(imported?'Importert som en egen gjennomgang.':'Ny gjennomgang startet. Tidligere gjennomganger er beholdt.');
 return true;
}
function captureDraft(target){
 const form=target.closest?.('#med-form, #lrp-form');if(!form)return;
 const kind=form.id==='med-form'?'med':'lrp',id=form.dataset.id||'';
 const values=Object.fromEntries(new FormData(form));if(kind==='med')values.naturalMode=form.elements.naturalMode?.checked?'on':'';if(kind==='lrp')values.implemented=form.elements.implemented?.checked?'on':'';
 drafts[`${kind}:${id}`]={kind,id,values};
 markChanged();
}
function renderDrafts(){
 const list=Object.entries(drafts);if(!list.length)return '';
 return `<section class="notice info sectiongap"><strong>Uferdige kladder i denne gjennomgangen</strong><p class="smalltext">Kladdene er lagret, men er ikke lagt til legemiddellisten eller LRP-listen ennå.</p><div class="toolbarbottom">${list.map(([key,d])=>`<button class="small" data-action="resume-draft" data-id="${esc(key)}">${esc(d.kind==='med'?'Legemiddel':'LRP')}: ${esc(d.values.name||d.values.drug||d.values.problem?.slice(0,40)||'Uferdig kladd')}</button>`).join('')}</div></section>`;
}
function renderSessions(){
 let records=[];try{records=reviewStore?.list()||[];}catch(error){storageError(error);}
 return heading('Gjennomganger','Fortsett der du slapp, eller rydd bort tidligere gjennomganger.')+
 `<div class="notice info">Arbeidet lagres automatisk i denne nettleseren. Bruk samme nettleserprofil og samme filplassering eller nettadresse for å finne det igjen. Sletting av nettleserdata eller privat modus kan fjerne lagringen. Eksporter ved behov for en separat sikkerhetskopi.</div>
 <div class="toolbarbottom"><button class="primary" data-action="new">${icon('plus')}Ny gjennomgang</button><button data-action="import-json">Importer arbeidsøkt</button>${activeReview?'<button data-action="export-json">Eksporter aktiv gjennomgang</button><button data-action="rename-review">Gi aktiv gjennomgang navn</button>':''}</div>${renderDrafts()}
 <div class="session-list sectiongap">${records.length?records.map(r=>`<article class="panel session-card"><div><h2>${esc(r.name)}</h2><p class="smalltext muted">${r.corrupt?'Innholdet kunne ikke leses.':'Sist lagret '+esc(localTime(r.updatedAt))+' · '+(r.state?.meds?.length||0)+' legemidler · '+(r.state?.lrps?.length||0)+' LRP'}</p>${r.id===activeReview?.id?'<span class="badge">Aktiv gjennomgang</span>':''}</div><div class="actions">${!r.corrupt?`<button data-action="open-review" data-id="${esc(r.id)}">Åpne</button>`:''}<button class="danger" data-action="delete-review" data-id="${esc(r.id)}">Slett</button></div></article>`).join(''):'<div class="empty">Ingen lagrede gjennomganger ennå.</div>'}</div>`+footer();
}
function sessionAction(action,target){
 const id=target.dataset.id;
 if(action==='undo'){undoLastChange();return true;}
 if(action==='retry-save'){persistCurrent();return true;}
 if(action==='save-as-new'){activeReview=null;resetUndo();markChanged();return true;}
 if(action==='new'){startNewReview();return true;}
 if(action==='rename-review'&&activeReview){
  modal('Navn på gjennomgangen',`<div class="modalbody"><label class="field">Kort navn, uten personidentifikatorer<input id="review-name" maxlength="120" value="${esc(activeReview.name)}"></label></div>`,`<div class="modalfoot"><button data-action="close-modal">Avbryt</button><button class="primary" data-action="save-review-name">Lagre navn</button></div>`);return true;
 }
 if(action==='save-review-name'){
  const name=$('#review-name').value.trim();if(!name){toast('Skriv et navn først.');return true;}
  activeReview.name=name;markChanged();$('#modal').close();render();return true;
 }
 if(action==='open-review'){
  if(dirty&&!persistCurrent())return true;
  try{const r=reviewStore.read(id);if(!r)throw Error('Gjennomgangen finnes ikke lenger.');restoreReview(r);route(page);if(Object.keys(drafts).length)toast('Du har en lagret kladd under «Gjennomganger».');}
  catch(error){toast(error.message);}return true;
 }
 if(action==='delete-review'){
  const r=reviewStore.list().find(r=>r.id===id);if(!r)return true;
  modal('Slett gjennomgangen?',`<div class="modalbody"><p>«${esc(r.name)}» slettes fra denne nettleseren. Eventuelle eksporterte filer beholdes.${r.corrupt?' Denne uleselige gjennomgangen kan ikke gjenopprettes med Angre.':' Du kan angre slettingen før du redigerer eller bytter gjennomgang, så lenge siden er åpen.'}</p></div>`,`<div class="modalfoot"><button data-action="close-modal">Avbryt</button><button class="danger" data-action="confirm-delete-review" data-id="${esc(id)}" data-revision="${r.corrupt?'':r.revision}">Slett gjennomgang</button></div>`);return true;
 }
 if(action==='confirm-delete-review'){
  try{
   const backup=target.dataset.revision===''?null:reviewStore.read(id),wasActive=id===activeReview?.id;
   reviewStore.remove(id,target.dataset.revision===''?undefined:Number(target.dataset.revision));
   if(id===activeReview?.id){state=blank();drafts={};activeReview=null;dirty=false;saveError='';}
   resetUndo();if(backup)deletedReviewUndo={record:backup,wasActive};
   $('#modal').close();route('sessions');toast('Gjennomgangen er slettet lokalt.',true);
  }catch(error){toast(error.message);}return true;
 }
 if(action==='resume-draft'){
  const d=drafts[id];if(d){if(d.kind==='med')medModal(d.id);else lrpModal(d.id);}return true;
 }
 if(action==='discard-draft'){
  delete drafts[id];markChanged();$('#modal').close();render();return true;
 }
 return false;
}
window.addEventListener('storage',event=>{
 if(activeReview&&event.key===`imm-review-v1:${activeReview.id}`){
  saveError='Gjennomgangen er endret eller slettet i en annen fane. Åpne den på nytt fra «Gjennomganger», eller lagre ditt arbeid som en ny gjennomgang.';
  updateSaveStatus();
 }
});
window.addEventListener('pagehide',()=>{if(dirty)persistCurrent();});
