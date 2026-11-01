/* Workflow bookkeeping only: these counts are not a clinical completeness score. */
function workStatusData(current=state,assess=discrepancy){
 const meds=Array.isArray(current.meds)?current.meds:[],lrps=Array.isArray(current.lrps)?current.lrps:[];
 const discrepancies=[],incomplete=[];
 for(const m of meds){
  const comparison=assess(m);
  if(comparison.different&&m.reconciliation!=='Avklart')discrepancies.push(m.id);
  if(comparison.missing)incomplete.push(m.id);
 }
 return {discrepancies,incomplete,lrps:lrps.filter(l=>!String(l.action??'').trim()).map(l=>l.id),medCount:meds.length,lrpCount:lrps.length};
}
function workStatusTargets(kind,data=workStatusData()){
 if(!['discrepancies','incomplete','lrps'].includes(kind))return [];
 return data[kind].map(id=>({type:kind==='lrps'?'lrp':'med',id}));
}
function workStatusTarget(kind,data=workStatusData()){return workStatusTargets(kind,data)[0]||null;}
function workStatusHtml(data=workStatusData()){
 if(!data.medCount&&!data.lrpCount)return '<div id="work-status"></div>';
 const parts=[];
 if(data.discrepancies.length){const n=data.discrepancies.length;parts.push(['discrepancies',`${n} ${n===1?'uavklart avvik':'uavklarte avvik'}`,'Vis legemiddel med ulik dosering som ikke er markert avklart']);}
 if(data.incomplete.length){const n=data.incomplete.length;parts.push(['incomplete',`${n} ${n===1?'legemiddel':'legemidler'} med manglende dosering`,'Vis legemiddel som mangler dosering fra en kilde eller oppgitt faktisk bruk']);}
 if(data.lrps.length)parts.push(['lrps',`${data.lrps.length} LRP uten forslag`,'Vis registrert problem uten forslag til tiltak']);
 const content=parts.length?parts.map(([kind,label,title])=>`<button type="button" data-action="jump-work-status" data-kind="${kind}" title="${title}">${label}</button>`).join('<span class="work-status-separator" aria-hidden="true">·</span>'):`<span>${data.medCount} ${data.medCount===1?'legemiddel':'legemidler'} · ${data.lrpCount} LRP registrert</span>`;
 return `<div id="work-status" class="work-status" role="group" aria-label="Arbeidsstatus – registrerte opplysninger"><span class="work-status-label">Arbeidsstatus</span><div class="work-status-items">${content}</div></div>`;
}
if(typeof module!=='undefined'&&module.exports)module.exports={workStatusData,workStatusTargets,workStatusTarget,workStatusHtml};
