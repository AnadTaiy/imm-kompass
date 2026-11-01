/* UI-only memory for the current review. Never exported or used in clinical rules. */
const workViews=new Map();
let editReturnView=null,viewRenderTicket=0;
function workViewKey(){return page+':'+(page==='workspace'?step:'');}
function resetWorkViews(){workViews.clear();editReturnView=null;viewRenderTicket++;const main=$('#main');if(main)delete main.dataset.viewKey;if(typeof filters!=='undefined')filters={q:'',cat:'',tags:[],mode:'any',fav:false,pediatric:false,access:''};if(typeof sourceContext!=='undefined')sourceContext={};}
function detailViewKey(node,index){
 if(node.dataset.uiKey)return node.dataset.uiKey;
 if(node.id)return 'id:'+node.id;
 const row=node.closest('[data-med-row],[data-lrp-row]'),scope=row?.dataset.medRow||row?.dataset.lrpRow||'';
 const summary=node.querySelector(':scope > summary');
 const title=(summary?.querySelector('h2,h3')?.textContent||summary?.textContent||'').trim().replace(/\s+/g,' ');
 return scope+':'+(title||'details-'+index);
}
function viewElementRef(node,main){
 if(!node||!main?.contains(node))return null;
 const row=node.closest('[data-med-row],[data-lrp-row]');
 const attrs={};for(const key of ['id','data-bind','data-action','data-id','data-index','data-list','data-review','data-ui-key'])if(node.hasAttribute(key))attrs[key]=node.getAttribute(key);
 if(!Object.keys(attrs).length)return null;
 return {med:row?.dataset.medRow,lrp:row?.dataset.lrpRow,attrs};
}
function resolveViewElement(ref,main=$('#main')){
 if(!ref||!main)return null;
 let root=main;
 if(ref.med||ref.lrp)root=[...main.querySelectorAll('[data-med-row],[data-lrp-row]')].find(n=>ref.med?n.dataset.medRow===ref.med:n.dataset.lrpRow===ref.lrp);
 if(!root)return null;
 return [...root.querySelectorAll('button,a,input,select,textarea,details,[tabindex]')].find(n=>Object.entries(ref.attrs).every(([key,value])=>n.getAttribute(key)===value))||null;
}
function captureWorkView(){
 const main=$('#main');if(!main?.dataset.viewKey)return null;
 const focused=document.activeElement,focus=viewElementRef(focused,main);
 return {key:main.dataset.viewKey,details:[...main.querySelectorAll('details')].map((n,i)=>[detailViewKey(n,i),n.open]),scrolls:[...main.querySelectorAll('.tablewrap,.interaction-rail-viewport')].map(n=>[n.scrollLeft,n.scrollTop]),x:window.scrollX,y:window.scrollY,focus,focusY:focus?focused.getBoundingClientRect().top:null};
}
function startEditReturn(){editReturnView=captureWorkView();}
function takeEditReturn(){const view=editReturnView;editReturnView=null;return view;}
function prepareWorkRender(options={}){
 const outgoing=captureWorkView();if(outgoing)workViews.set(outgoing.key,outgoing);
 const key=workViewKey(),view=options.view?.key===key?options.view:workViews.get(key);
 return {key,view,resetScroll:!!options.resetScroll,changed:options.changed,ticket:++viewRenderTicket};
}
function preserveWorkView(update){const plan=prepareWorkRender();const result=update();restoreWorkRender(plan);return result;}
function restoreWorkRender(plan){
 const main=$('#main');if(!main)return;
 main.dataset.viewKey=plan.key;
 if(plan.view){const states=new Map(plan.view.details);main.querySelectorAll('details').forEach((n,i)=>{const key=detailViewKey(n,i);if(states.has(key))n.open=states.get(key);});}
 requestAnimationFrame(()=>{
  if(plan.ticket!==viewRenderTicket||main.dataset.viewKey!==plan.key)return;
  drawInteractionLines();
  if(plan.view)main.querySelectorAll('.tablewrap,.interaction-rail-viewport').forEach((n,i)=>{const pos=plan.view.scrolls[i];if(pos){n.scrollLeft=pos[0];n.scrollTop=pos[1];}});
  if(plan.resetScroll)window.scrollTo({top:0,left:0,behavior:'instant'});
  else if(plan.view){
   const focus=resolveViewElement(plan.view.focus,main);
   window.scrollTo({top:focus&&plan.view.focusY!==null?window.scrollY+focus.getBoundingClientRect().top-plan.view.focusY:plan.view.y,left:plan.view.x,behavior:'instant'});
   if(focus&&focus.getClientRects().length)focus.focus({preventScroll:true});
  }
  if(plan.changed){const row=workTargetElement(plan.changed);if(row)markWorkTarget(row);}
 });
}
function workTargetElement(target){return [...document.querySelectorAll(target.type==='med'?'[data-med-row]':'[data-lrp-row]')].find(n=>(target.type==='med'?n.dataset.medRow:n.dataset.lrpRow)===target.id)||null;}
function markWorkTarget(row){row.classList.remove('row-updated');void row.offsetWidth;row.classList.add('row-updated');setTimeout(()=>row.classList.remove('row-updated'),2200);}
function refreshWorkStatus(){const el=$('#work-status');if(el)el.outerHTML=workStatusHtml();}
function jumpWorkStatus(kind){
 const target=workStatusTarget(kind);if(!target)return;
 if(target.type==='med'&&(page!=='workspace'||step!==1)){step=1;route('workspace');}
 else if(target.type==='lrp'&&page!=='journal'&&(page!=='workspace'||step!==2)){step=2;route('workspace');}
 requestAnimationFrame(()=>{
  const row=workTargetElement(target);if(!row)return;
  for(let n=row.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;
  const control=target.type==='med'?row.querySelector('[data-action="edit-med"]'):row.querySelector('textarea[data-bind$=".action"],[data-action="edit-lrp"]');
  row.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
  if(control)control.focus({preventScroll:true});else {row.tabIndex=-1;row.focus({preventScroll:true});}
  markWorkTarget(row);drawInteractionLines();
 });
}
