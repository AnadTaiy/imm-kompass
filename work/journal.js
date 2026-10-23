function journalEntry(){
 return {id:uid(),title:'',lrp:'',suggestion:'',implemented:false,measure:''};
}
function journalBlank(){return {title:'Legemiddelgjennomgang',entries:[journalEntry()]};}
function journalText(j=state.journal){
 const entries=j.entries.filter(e=>[e.title,e.lrp,e.suggestion,e.measure].some(v=>v.trim()));
 return [j.title.trim(),...entries.map(e=>[
   e.title.trim(),
   `LRP: ${e.lrp.trim()}`,
   `Forslag: ${e.suggestion.trim()}`,
   ...(e.implemented&&e.measure.trim()?[`Tiltak (lege konsultert, iverksatt): ${e.measure.trim()}`]:[])
 ].join('\n'))].filter(Boolean).join('\n\n');
}
function journalValidation(j=state.journal){
 if(!j.title.trim())return 'Skriv en tittel på journalnotatet.';
 const entries=j.entries.filter(e=>[e.title,e.lrp,e.suggestion,e.measure].some(v=>v.trim())||e.implemented);
 if(!entries.length)return 'Skriv inn minst ett LRP og et forslag.';
 for(const e of entries){
   const n=j.entries.indexOf(e)+1;
   if(!e.title.trim()||!e.lrp.trim()||!e.suggestion.trim())return `Fyll ut tittel, LRP og forslag for punkt ${n}.`;
   if(e.implemented&&!e.measure.trim())return `Beskriv tiltaket i punkt ${n}, eller fjern avkrysningen dersom tiltaket ikke er iverksatt.`;
 }
 return '';
}
function renderJournal(){
 return heading('Journalskriving','Et kort notat med tydelig problem, forslag og eventuelle iverksatte tiltak.')+
 `<div class="journal-layout"><section><div class="panel"><div class="panelbody">
 ${field('Tittel på journalnotatet','journal.title','text')}
 <p class="smalltext muted sectiongap">Legg det viktigste problemet først. Ett punkt per LRP.</p>
 </div></div><div class="sectiongap" id="journal-entries">${state.journal.entries.map((e,i)=>
 `<section class="panel journal-entry" data-journal-index="${i}">
 <div class="panelhead"><h2>Punkt ${i+1}</h2><div class="actions">
 <button class="small iconbtn" data-action="journal-up" data-index="${i}" aria-label="Flytt punkt ${i+1} opp" ${i===0?'disabled':''}>↑</button>
 <button class="small iconbtn" data-action="journal-down" data-index="${i}" aria-label="Flytt punkt ${i+1} ned" ${i===state.journal.entries.length-1?'disabled':''}>↓</button>
 <button class="small" data-action="journal-remove" data-index="${i}">Fjern punkt</button></div></div>
 <div class="panelbody stack">
 ${field('Tittel / problemområde',`journal.entries.${i}.title`,'text','Kort overskrift, for eksempel «Uavklart indikasjon».')}
 ${field('LRP',`journal.entries.${i}.lrp`,'textarea','Beskriv problemet og den viktigste begrunnelsen. Skill mellom egne funn og det pasienten oppgir.')}
 ${field('Forslag',`journal.entries.${i}.suggestion`,'textarea','Skriv konkret hva som foreslås, hvorfor og eventuell oppfølging.')}
 <div class="journal-measure-check"><label class="checkline"><input type="checkbox" data-bind="journal.entries.${i}.implemented" ${e.implemented?'checked':''}><strong>Lege er konsultert, og tiltak er iverksatt</strong></label>
 <p class="smalltext muted" style="margin:6px 0 0 27px">Avkrysning og beskrivelse kreves for å ta med «Tiltak» i ferdig tekst.</p></div>
 <div class="journal-measure" ${e.implemented?'':'hidden'}>
 ${field('Tiltak som er iverksatt',`journal.entries.${i}.measure`,'textarea','Hva ble gjort? Ta med relevant oppfølging, ansvar og tidspunkt kort.')}
 </div></div></section>`).join('')}</div>
 <div class="toolbarbottom"><button data-action="journal-add">${icon('plus')}Legg til LRP-punkt</button><button class="primary" data-action="journal-preview">${icon('file')}Lag journaltekst</button></div></section>
 <aside class="stack"><section class="panel"><div class="panelhead"><h2>Hent et registrert LRP</h2></div><div class="panelbody">
 <p class="smalltext muted">Kopier et utgangspunkt fra arbeidsøkten og kort det ned her. Forslag forblir forslag til du selv bekrefter et iverksatt tiltak.</p>
 <label class="field sectiongap">Velg LRP<select id="journal-lrp"><option value="">Velg et registrert problem …</option>${state.lrps.map((l,i)=>`<option value="${esc(l.id)}">${i+1}. ${esc(l.drug||REVIEW[+l.type]?.title||'LRP')} – ${esc(l.problem.slice(0,75))}</option>`).join('')}</select></label>
 <button class="small sectiongap" data-action="journal-from-lrp" ${state.lrps.length?'':'disabled'}>Hent til journalutkast</button>
 </div></section><details class="panel"><summary class="panelhead"><h2>Kort skriveveiledning</h2></summary><div class="panelbody"><ul class="bulletlist"><li>Skriv kort, objektivt og forståelig. Pasienten kan lese notatet.</li><li>Begrunn problemet og forslaget med de relevante funnene.</li><li>Skill mellom pasientens opplysninger, egne observasjoner, forslag og gjennomførte tiltak.</li><li>Ta med hva som skal følges opp, av hvem og når, der det er relevant.</li><li>Kontroller tekst og riktig pasient i journalsystemet. Følg lokal rutine for veiledning og godkjenning.</li></ul><p class="smalltext muted">Strukturen bygger på skjermbildene du har delt. Medisinske råd fra eksempelet er ikke lagt inn som standardtekst.</p></div></details>
 <section class="panel"><div class="panelbody"><h3>Format i ferdig tekst</h3><pre class="journal-example">Legemiddelgjennomgang

Kort problemoverskrift
LRP: Problem og begrunnelse.
Forslag: Anbefalt oppfølging.
Tiltak: Kun når bekreftet og beskrevet.</pre><p class="smalltext muted">Feltene settes sammen som skrevet. Teksten forkortes eller tolkes ikke automatisk.</p></div></section>
 <button data-action="export-json">Eksporter arbeidsøkt</button></aside></div>`+footer();
}
function journalPreview(){
 const error=journalValidation();
 if(error){toast(error);return;}
 modal('Ferdig journaltekst',`<div class="modalbody"><p class="formintro">Les gjennom før du kopierer til journalsystemet.</p><pre class="report journal-output">${esc(journalText())}</pre></div>`,
 `<div class="modalfoot"><button data-action="close-modal">Tilbake</button><button data-action="journal-download">Last ned .txt</button><button class="primary" data-action="journal-copy" aria-label="Kopier journaltekst">${icon('copy')}Kopier tekst</button></div>`);
}
async function copyJournal(){
 const error=journalValidation();if(error){toast(error);return;}
 try{await navigator.clipboard.writeText(journalText());toast('Journalteksten er kopiert.');}
 catch{
  const area=document.createElement('textarea');area.value=journalText();area.style.position='fixed';area.style.opacity='0';
  document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();
  toast(ok?'Journalteksten er kopiert.':'Kopiering ble blokkert. Bruk «Last ned .txt».');
 }
}
async function journalAction(a,t){
 const i=Number(t.dataset.index),entries=state.journal.entries;
 if(a==='journal-preview')journalPreview();
 if(a==='journal-copy')await copyJournal();
 if(a==='journal-download'){if(!journalValidation())download('IMM-journalnotat.txt',journalText());}
 if(a==='journal-add'){entries.push(journalEntry());markChanged();render();}
 if(a==='journal-up'&&i>0){[entries[i-1],entries[i]]=[entries[i],entries[i-1]];markChanged();render();}
 if(a==='journal-down'&&i<entries.length-1){[entries[i+1],entries[i]]=[entries[i],entries[i+1]];markChanged();render();}
 if(a==='journal-remove'){
  modal('Fjern dette journalpunktet?',`<div class="modalbody"><p>Punkt ${i+1} fjernes fra utkastet.</p></div>`,`<div class="modalfoot"><button data-action="close-modal">Avbryt</button><button class="danger" data-action="journal-confirm-remove" data-index="${i}">Fjern punkt</button></div>`);
 }
 if(a==='journal-confirm-remove'){entries.splice(i,1);if(!entries.length)entries.push(journalEntry());markChanged();$('#modal').close();render();}
 if(a==='journal-from-lrp'){
  const l=state.lrps.find(x=>x.id===$('#journal-lrp').value);
  if(!l){toast('Velg et registrert LRP først.');return;}
  const entry={...journalEntry(),title:l.drug||REVIEW[+l.type]?.title||'',lrp:[l.problem,l.evidence].filter(Boolean).join(' '),suggestion:l.action||''};
  const empty=entries.findIndex(e=>![e.title,e.lrp,e.suggestion,e.measure].some(v=>v.trim())&&!e.implemented);
  if(empty>=0)entries[empty]=entry;else entries.push(entry);
  markChanged();render();toast('LRP hentet. Kort ned teksten og kontroller innholdet.');
 }
}
