/* DMP/FEST 2.5.1: match both substance groups by ATC prefix or exact substance IDs.
   Situation criteria remain visible; no inference from dose prose and no auto-prescribing. */
const interactionIndex=new Map(DATA.catalog.interactions.map(i=>[i.id,i]));
const interactionAtc=new Map(),interactionRefs=new Map();
for(const r of DATA.catalog.interactions)for(let side=0;side<2;side++)for(const [keys,index] of [[r.groups[side].atc,interactionAtc],[r.groups[side].refs,interactionRefs]])for(const key of keys){if(!index.has(key))index.set(key,[]);index.get(key).push([r.id,1<<side]);}
const substanceParents=new Map();
for(const [parent,children] of Object.entries(DATA.catalog.substanceRelations||{}))for(const child of children){if(!substanceParents.has(child))substanceParents.set(child,[]);substanceParents.get(child).push(parent);}
let interactionCache={key:'',pairs:[]};
function medEndpoints(m){const result=new Map(),code=String(m.atc||'').trim().toUpperCase();const catalog=medicineIndex.get(m.catalogId),refs=new Set([...(catalog&&(catalog.atc===code||catalog.atc==='WITHOUT'&&!code)?catalog.ingredientIds:[]),...trustedNaturalRefs(m)]);
 const visit=id=>{for(const parent of substanceParents.get(id)||[])if(!refs.has(parent)){refs.add(parent);visit(parent);}};for(const id of [...refs])visit(id);
 const add=entries=>{for(const [id,side] of entries||[])result.set(id,(result.get(id)||0)|side);};for(let n=1;n<=code.length;n++)add(interactionAtc.get(code.slice(0,n)));for(const id of refs)add(interactionRefs.get(id));return result;
}
function interactionPairs(){const key=state.meds.map(m=>[m.id,m.catalogId,m.atc,m.naturalId,m.name].join(':')).join('|');if(key===interactionCache.key)return interactionCache.pairs;const endpoints=state.meds.map(m=>medEndpoints(m)),pairs=[];
 for(let a=0;a<state.meds.length;a++)for(let b=a+1;b<state.meds.length;b++){const ids=[];for(const [id,mask] of endpoints[a]){const other=endpoints[b].get(id)||0;if(mask&1&&other&2||mask&2&&other&1)ids.push(id);}if(ids.length){ids.sort((x,y)=>interactionIndex.get(x).level-interactionIndex.get(y).level);pairs.push({key:'pair-'+[state.meds[a].id,state.meds[b].id].sort().map(encodeURIComponent).join(':'),a:state.meds[a].id,b:state.meds[b].id,ids,level:interactionIndex.get(ids[0]).level,number:pairs.length+1});}}
 interactionCache={key,pairs};return pairs;
}
function interactionSourceUrl(ids){const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('tool','sources');url.searchParams.set('interactions',ids.join(','));return url.href;}
function interactionSymbol(level){return level===1?`<svg class="interaction-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="m8 8 8 8m0-8-8 8" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>`:`<svg class="interaction-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1 24 23H0Z" fill="currentColor"/><path d="M12 8v7m0 3v1" stroke="white" stroke-width="2.5"/></svg>`;}
function interactionFlags(m){return interactionPairs().filter(p=>p.a===m.id||p.b===m.id).map(p=>{const other=state.meds.find(x=>x.id===(p.a===m.id?p.b:p.a)),label=p.level===1?'Bør unngås':'Forholdsregler bør tas',condition=p.ids.map(id=>interactionIndex.get(id).condition).filter(Boolean).join(' ');return `<div class="interaction-pair level-${p.level}" data-interaction-anchor="${p.key}"><button type="button" class="pair-marker" data-pair="${p.key}" data-action="mark-interaction-pair" aria-pressed="false" aria-label="${esc('Marker kobling '+p.number+': '+m.name+' og '+other.name)}" title="Marker begge legemidlene og forbindelsen">${p.number}</button><a class="interaction-flag level-${p.level}" data-pair="${p.key}" href="${esc(interactionSourceUrl(p.ids))}" target="_blank" rel="noopener noreferrer" title="${esc(label+': '+other.name+(condition?' · Situasjonskriterium: '+condition:''))}" aria-label="${esc(label+' med '+other.name)}">${interactionSymbol(p.level)}<span>${esc(other.name)}<small>${condition?'Databasetreff · avklar vilkår':'Databasetreff'}</small></span></a></div>`;}).join('');}
function interactionLineToolbar(){const count=interactionPairs().length;return count?`<div class="interaction-line-toolbar"><span><strong>${count} ${count===1?'kobling':'koblinger'}</strong> · Velg et nummer for å følge paret.</span><button class="small" data-action="clear-interaction-pair" hidden>Fjern markering</button><span class="screenreader" data-pair-status aria-live="polite"></span></div>`:'';}
function handlingSections(text){const blocks=[];for(const line of String(text||'').split(/\r?\n/)){const m=line.match(/^(Dosetilpasning|Legemiddelalternativer|Monitorering|JusteringAvDoseringstidspunkt):\s*(.*)$/);if(m)blocks.push({label:m[1]==='JusteringAvDoseringstidspunkt'?'Justering av doseringstidspunkt':m[1],text:m[2]});else if(blocks.length)blocks.at(-1).text+='\n'+line;else if(line.trim())blocks.push({label:'Øvrig håndtering',text:line});}return blocks;}
function handlingMarkup(text){return `<dl class="handling-list">${handlingSections(text).map(b=>`<dt>${esc(b.label)}:</dt><dd class="preserve">${esc(b.text.trim())}</dd>`).join('')}</dl>`;}
function interactionPanel(){const ids=(queryParams.get('interactions')||'').split(',').filter(Boolean),records=ids.map(id=>interactionIndex.get(id)).filter(Boolean);if(!ids.length)return '';
 return `<section class="panel sectiongap"><div class="panelhead"><h2>Interaksjonsfunn fra DMP / FEST</h2></div><div class="panelbody"><p class="smalltext muted">${esc(festVersionText())}. Vurder faktisk samtidig bruk, dose, formulering, varighet og pasientens situasjon.</p>${records.length?records.map(r=>`<article class="interaction-detail sectiongap"><h3 class="level-${r.level}">${interactionSymbol(r.level)}${r.level===1?'Bør unngås':'Forholdsregler bør tas'}</h3><h3 class="interaction-names sectiongap">${esc(r.groups.map(g=>g.name).join(' + '))}</h3>${r.condition?`<div class="notice sectiongap"><strong>Situasjonskriterium</strong><p class="preserve">${esc(r.condition)}</p></div>`:''}<h4 class="sectiongap">Klinisk konsekvens</h4><p class="preserve">${esc(r.consequence)}</p>${r.mechanism?`<details class="sectiongap"><summary>Interaksjonsmekanisme</summary><p class="preserve sectiongap">${esc(r.mechanism)}</p></details>`:''}${r.handling?`<h4 class="sectiongap">Håndtering i FEST</h4>${handlingMarkup(r.handling)}`:''}<p class="smalltext sectiongap">Kildegrunnlag: ${esc(r.evidence)}</p><div class="actions sectiongap">${external('https://www.legemiddelsok.no/sider/Interaksjoner.aspx?interaksjonsId='+encodeURIComponent(r.id.replace(/^ID_/,'')),'Åpne dette treffet hos DMP','button')}${external('https://www.felleskatalogen.no/medisin/interaksjon/','Felleskatalogens interaksjonsanalyse','button')}</div><details class="sectiongap"><summary>Kildereferanser levert i FEST</summary><ul class="bulletlist">${r.references.map(ref=>`<li>${isWeb(ref.url)?external(ref.url,ref.title):esc(ref.title)}</li>`).join('')}</ul></details></article>`).join(''):'<p class="notice">Interaksjonen finnes ikke i denne dataversjonen. Gjør et nytt søk i oppdatert interaksjonsverktøy.</p>'}<p class="hint sectiongap">Inneholder data under Norsk lisens for offentlige data (NLOD), tilgjengeliggjort av Direktoratet for medisinske produkter. Lokal presentasjon og kobling er ikke godkjent av DMP. ${external('https://www.dmp.no/om-oss/distribusjon-av-legemiddeldata/fest/ansvar-ved-bruk-av-fest','FEST – kilde og bruksvilkår')}</p><p class="sectiongap">Andre relevante oppslagsverk står nedenfor.</p></div></section>`;
}
function interactionCoverage(){const retired=state.meds.filter(m=>m.catalogId&&!medicineIndex.has(m.catalogId));const missing=state.meds.filter(m=>!atcIndex.has(String(m.atc||'').trim().toUpperCase())&&!trustedNaturalRefs(m).length&&!(medicineIndex.get(m.catalogId)?.ingredientIds.length&&(medicineIndex.get(m.catalogId).atc===m.atc||medicineIndex.get(m.catalogId).atc==='WITHOUT'&&!m.atc)));const unassessed=state.meds.filter(m=>{const med=medicineIndex.get(m.catalogId);return DATA.catalog.interactionsNotAssessed.some(r=>r.atc.includes(String(m.atc||'').trim().toUpperCase())||(med?.atc===m.atc&&r.refs.some(id=>med?.ingredientIds?.includes(id))));});return `${retired.length?`<p class="coverage-note">Registrert preparat finnes ikke lenger i dette FEST-uttrekket: ${esc(retired.map(m=>m.name).join(', '))}. Kontroller virkestoff, ATC og gjeldende produktinformasjon; registreringen er beholdt.</p>`:''}${missing.length?`<p class="coverage-note">Interaksjonssøk mangler kodegrunnlag for: ${esc(missing.map(m=>m.name).join(', '))}. Gjør et manuelt oppslag.</p>`:''}${unassessed.length?`<p class="coverage-note">FEST oppgir ikke vurdert: ${esc(unassessed.map(m=>m.name).join(', '))}. Fravær av treff kan ikke tolkes som fravær av interaksjon.</p>`:''}`;}
function interactionLegend(){return `<div class="interaction-legend"><span class="level-1">${interactionSymbol(1)} Bør unngås / kontraindisert når angitt i kilden</span><span class="level-2">${interactionSymbol(2)} Forholdsregler bør tas</span></div><p class="smalltext muted">Mulige kombinasjoner i registrerte legemidler, også pausert/seponert behandling. Vurder samtidig bruk og ettervirkning. Ingen symboler betyr ikke at kombinasjonen er undersøkt eller risikofri. ${esc(festVersionText())}.</p>${interactionCoverage()}`;}
/* Route short connections nearest the table. Reuse a lane only for disjoint
   vertical intervals, with clearance for the rounded corners and labels. */
function layoutInteractionRoutes(edges){
 const lanes=[],routes=[];
 for(const edge of edges.filter(e=>Number.isFinite(e.y1)&&Number.isFinite(e.y2)).map(e=>({...e,top:Math.min(e.y1,e.y2),bottom:Math.max(e.y1,e.y2)})).sort((a,b)=>(a.bottom-a.top)-(b.bottom-b.top)||a.top-b.top||a.key.localeCompare(b.key))){
  const lo=edge.top-14,hi=edge.bottom+14;
  let lane=lanes.findIndex(intervals=>intervals.every(([start,end])=>hi<start||lo>end));
  if(lane<0){lane=lanes.length;lanes.push([]);}lanes[lane].push([lo,hi]);
  const x=42+lane*18,r=Math.min(8,(edge.bottom-edge.top)/2);
  routes.push({...edge,lane,x,d:`M24 ${edge.top} H${x-r} Q${x} ${edge.top} ${x} ${edge.top+r} V${edge.bottom-r} Q${x} ${edge.bottom} ${x-r} ${edge.bottom} H24`});
 }
 return {routes,width:Math.max(68,60+(lanes.length-1)*18)};
}
let interactionLayoutObserver=null,interactionObservedTables=[],pinnedInteractionPair='',activeInteractionPair='';
function drawInteractionLines(){
 if(typeof ResizeObserver!=='undefined'){
  if(!interactionLayoutObserver)interactionLayoutObserver=new ResizeObserver(()=>requestAnimationFrame(drawInteractionLines));
  const tables=[...document.querySelectorAll('.comparison-layout table')];
  if(tables.length!==interactionObservedTables.length||tables.some((t,i)=>t!==interactionObservedTables[i])){interactionLayoutObserver.disconnect();tables.forEach(table=>interactionLayoutObserver.observe(table));interactionObservedTables=tables;}
 }
 const pairs=interactionPairs();
 if(!pairs.some(p=>p.key===pinnedInteractionPair))pinnedInteractionPair='';
 document.querySelectorAll('.comparison-layout').forEach(canvas=>{
  const svg=canvas.querySelector('.interaction-rail');if(!svg)return;
  const rect=canvas.getBoundingClientRect(),anchors=new Map();
  for(const node of canvas.querySelectorAll('[data-interaction-anchor]')){const marker=node.querySelector('.pair-marker'),r=marker.getBoundingClientRect(),key=node.dataset.interactionAnchor;if(!anchors.has(key))anchors.set(key,[]);anchors.get(key).push(r.top-rect.top+r.height/2);}
  const layout=layoutInteractionRoutes(pairs.flatMap(p=>{const ys=anchors.get(p.key)||[];return ys.length===2?[{...p,y1:ys[0],y2:ys[1]}]:[];}));
  canvas.style.setProperty('--rail-width',layout.width+'px');
  const height=canvas.querySelector('.tablewrap').offsetHeight;
  svg.setAttribute('height',height);svg.setAttribute('width',layout.width);svg.setAttribute('viewBox',`0 0 ${layout.width} ${height}`);
  svg.innerHTML=layout.routes.map(p=>{const names=state.meds.find(m=>m.id===p.a)?.name+' + '+state.meds.find(m=>m.id===p.b)?.name;return `<a href="${esc(interactionSourceUrl(p.ids))}" target="_blank" rel="noopener noreferrer" data-pair="${p.key}" class="level-${p.level}" aria-label="${esc('Åpne kobling '+p.number+': '+names)}"><title>${esc('Kobling '+p.number+': '+names)}</title><path class="pair-hit" d="${p.d}"/><path class="pair-halo" d="${p.d}"/><path class="pair-line" d="${p.d}"/>${[p.top,p.bottom].map(y=>`<circle class="pair-endpoint" cx="13" cy="${y}" r="10"/><text x="13" y="${y}" class="pair-number" aria-hidden="true">${p.number}</text>`).join('')}</a>`;}).join('');
 });
 highlightPair(pairs.some(p=>p.key===activeInteractionPair)?activeInteractionPair:'');
}
function highlightPair(key){
 activeInteractionPair=key||pinnedInteractionPair;
 const active=interactionPairs().find(p=>p.key===activeInteractionPair);if(!active)activeInteractionPair='';
 document.querySelectorAll('[data-pair]').forEach(n=>{n.classList.toggle('pair-active',n.dataset.pair===activeInteractionPair);if(n.matches('.pair-marker'))n.setAttribute('aria-pressed',String(n.dataset.pair===pinnedInteractionPair));});
 document.querySelectorAll('.comparison-layout').forEach(n=>n.classList.toggle('has-active-pair',!!active));
 document.querySelectorAll('[data-med-row]').forEach(n=>n.classList.toggle('pair-row',!!active&&(n.dataset.medRow===active.a||n.dataset.medRow===active.b)));
 document.querySelectorAll('[data-action="clear-interaction-pair"]').forEach(n=>n.hidden=!pinnedInteractionPair);
}
function pinInteractionPair(key){
 pinnedInteractionPair=pinnedInteractionPair===key?'':key;highlightPair('');
 const pair=interactionPairs().find(p=>p.key===pinnedInteractionPair);
 document.querySelectorAll('[data-pair-status]').forEach(n=>n.textContent=pair?'Kobling '+pair.number+' markert: '+state.meds.filter(m=>m.id===pair.a||m.id===pair.b).map(m=>m.name).join(' og '):'Alle koblinger vises.');
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-action]');if(t?.dataset.action==='mark-interaction-pair')pinInteractionPair(t.dataset.pair);if(t?.dataset.action==='clear-interaction-pair')pinInteractionPair(pinnedInteractionPair);});
document.addEventListener('pointerover',e=>{const node=e.target.closest('[data-pair]');if(node)highlightPair(node.dataset.pair);});
document.addEventListener('pointerout',e=>{if(e.target.closest('[data-pair]')&&!e.relatedTarget?.closest?.('[data-pair]'))highlightPair('');});
document.addEventListener('focusin',e=>highlightPair(e.target.closest('[data-pair]')?.dataset.pair||''));
document.addEventListener('focusout',e=>{if(e.target.closest('[data-pair]')&&!e.relatedTarget?.closest?.('[data-pair]'))highlightPair('');});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pinnedInteractionPair)pinInteractionPair(pinnedInteractionPair);});
window.addEventListener('resize',()=>requestAnimationFrame(drawInteractionLines));
