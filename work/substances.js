function substanceEnglishDose(m){return IMMDose.english(actualUse(m).dose,m.doseUnit||IMMDose.inferUnit(m.form));}
function substanceDoseLine(m,names,lang='no'){
 const oneLine=value=>String(value||'').replace(/\s+/g,' ').trim();
 const en=lang==='en',translated=en?substanceEnglishDose(m):null;
 const form=oneLine(m.form),name=oneLine(m.name),originalDose=oneLine(doseText(actualUse(m).dose,m));
 const dose=en?(translated.translated?oneLine(translated.text)||'Dose not recorded':'Original dosage (not translated): '+oneLine(translated.text)):originalDose||'Dosering ikke registrert';
 // FEST commonly keeps the strength in the product name and only the form in m.form.
 // Preserve that label verbatim rather than guessing or converting the strength.
 const presentation=/\d/.test(name)&&!/\d/.test(form)?name:form;
 const extra=[];
 const labels={'Ved behov':'As needed','Uregelmessig bruk':'Irregular use',Kur:'Treatment course','Ukentlig / periodisk':'Weekly / periodic use','Bruker ikke':'Not taking',Pausert:'Temporarily withheld',Seponert:'Discontinued'};
 const label=value=>en?labels[value]||value:value;
 if(m.schedule&&m.schedule!=='Fast'&&!norm(originalDose).includes(norm(m.schedule))&&!norm(dose).includes(norm(label(m.schedule))))extra.push(label(m.schedule));
 if(['Pausert','Seponert'].includes(m.status)&&!norm(dose).includes(norm(label(m.status))))extra.push(label(m.status));
 // Keep combinations and separate prescriptions together with their own dose.
 // Never infer actual use from a conflicting source or calculate a substance dose.
 return names.join(' / ')+(presentation?' ('+presentation+')':'')+' — '+dose+(extra.length?' · '+extra.join(' · '):'');
}
function substanceList(lang='no',selected=null,includeDose=false){
 const active=selected?state.meds.filter(m=>selected.includes(m.id)):state.meds.filter(m=>m.schedule!=='Bruker ikke'&&!['Pausert','Seponert'].includes(m.status));
 const key=lang==='en'?'ingredientsEn':'ingredients',missing=active.filter(m=>!m[key]?.trim()||lang==='en'&&m[key].split('\n').filter(x=>x.trim()).length!==m.ingredients?.split('\n').filter(x=>x.trim()).length);
 if(missing.length)return {error:(lang==='en'?'Engelsk virkestoffnavn':'Virkestoff')+' mangler for: '+missing.map(m=>m.name).join(', ')+'. Kontroller registreringen.',text:''};
 const names=m=>m[key].split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(includeDose){const untranslated=lang==='en'?active.filter(m=>!substanceEnglishDose(m).translated):[];return {text:active.map(m=>substanceDoseLine(m,names(m),lang)).join('\n'),warning:untranslated.length?'Fritekstdosering må oversettes manuelt for: '+untranslated.map(m=>m.name).join(', ')+'. Originalteksten er beholdt og merket.':''};}
 const seen=new Set(),values=active.flatMap(names).filter(x=>{const k=norm(x);if(seen.has(k))return false;seen.add(k);return true;});return {text:values.join('\n')};
}
function substanceSelection(){return [...document.querySelectorAll('[data-substance-med]:checked')].map(x=>x.value);}
function substanceDoseSelected(){return !!$('#substances-include-dose')?.checked;}
function updateSubstanceSelection(){
 const ids=substanceSelection(),includeDose=substanceDoseSelected();
 $('#substance-format-hint').textContent=includeDose
  ?'Ett legemiddel per linje med registrert form/styrke og dosering fra '+reporterLabel()+'. Engelsk liste oversetter dosering og bruksstatus. Preparatnavn beholdes som registrert. Fritekst som ikke kan oversettes sikkert, merkes.'
  :'Ett virkestoff per linje, kombinasjoner delt opp og duplikater fjernet. Engelsk navn hentes fra FEST. Kontroller at oppslagsverktøyet gjenkjenner navnene.';
 for(const lang of ['no','en']){const r=substanceList(lang,ids,includeDose);$('#substances-'+lang).value=r.text;$('#substances-error-'+lang).textContent=r.error||r.warning||'';$('#copy-substances-'+lang).disabled=!!r.error||!r.text;}
}
function substancePreview(){if(!state.meds.length){toast('Legg til legemidler først.');return;}modal('Virkestoffliste til oppslag',`<div class="modalbody"><p class="formintro">Velg legemidlene du vil ta med i listen.</p><label class="checkline"><input type="checkbox" id="substances-include-dose" aria-describedby="substance-format-hint"><span>Ta med dosering</span></label><p class="hint" id="substance-format-hint"></p><div class="checklist sectiongap">${state.meds.map(m=>`<label class="checkline"><input type="checkbox" data-substance-med value="${esc(m.id)}" ${m.schedule!=='Bruker ikke'&&!['Pausert','Seponert'].includes(m.status)?'checked':''}><span>${esc(m.name)}${['Pausert','Seponert'].includes(m.status)?' · '+esc(m.status):''}</span></label>`).join('')}</div><div class="formgrid sectiongap">${[['no','Norsk'],['en','Engelsk']].map(([lang,label])=>`<div><label class="field">${label}<textarea id="substances-${lang}" readonly rows="9" class="substance-text" aria-label="Virkestoffliste på ${label.toLowerCase()}"></textarea></label><p class="hint" id="substances-error-${lang}"></p></div>`).join('')}</div><p class="hint">Du kan også markere deler av teksten og kopiere med Ctrl+C. Pausert/seponert behandling er ikke forhåndsvalgt, men kan tas med ved behov.</p></div>`,`<div class="modalfoot"><button data-action="close-modal">Lukk</button><button id="copy-substances-no" class="primary" data-action="copy-substances" data-lang="no">${icon('copy')}Kopier norsk versjon</button><button id="copy-substances-en" data-action="copy-substances" data-lang="en">${icon('copy')}Kopier engelsk versjon</button></div>`);updateSubstanceSelection();}
async function copySubstanceSelection(lang){const r=substanceList(lang,substanceSelection(),substanceDoseSelected());if(r.error){toast(r.error);return;}if(r.text)await copyText(r.text,'Valgte virkestoffer'+(substanceDoseSelected()?' med dosering':'')+' er kopiert ('+(lang==='en'?'engelsk':'norsk')+').');}
document.addEventListener('change',e=>{if(e.target.matches('[data-substance-med], #substances-include-dose'))updateSubstanceSelection();});
