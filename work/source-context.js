/* Source routing is separate from clinical rules: no diagnosis is inferred from an ATC. */
function explicitSourceQuestion(){return !!(filters.q?.trim()||filters.topic||filters.tags?.length||filters.cat||filters.purpose||filters.fav||filters.interactionDatabases);}
function hasDrugSourceContext(){return !!(sourceContext.scope==='drug'||sourceContext.catalogId||sourceContext.atc||sourceContext.naturalId||sourceContext.naturalMode);}
function sourceIndicationTerm(value){const text=normCatalog(value||'').trim();return DATA.resources.flatMap(r=>r.diagnosisTerms||[]).find(t=>text===normCatalog(t)||text.startsWith(normCatalog(t)+' (')||text.startsWith(normCatalog(t)+' i '))||'';}
function patientSourceDiagnoses(){const items=[...patientDiagnoses(),...state.meds.filter(m=>m.indication).map(m=>({text:m.indication,system:m.diagnosisSystem,code:m.diagnosisCode})),...String(state.profile.diagnoses||'').split(/[\n;,]/).map(text=>({text:text.trim(),system:'',code:''}))];const seen=new Set();return items.filter(d=>(d.text||d.code)&&!seen.has(JSON.stringify(d))&&seen.add(JSON.stringify(d)));}
function patientSourceDefault(){return !resourceOnly&&!hasDrugSourceContext()&&!sourceContext.diagnosisCode&&sourceContext.scope!=='all'&&!explicitSourceQuestion()&&(patientSourceDiagnoses().length>0||state.meds.length>0);}
function sourceHasContext(){return hasDrugSourceContext()||!!sourceContext.diagnosisCode||patientSourceDefault();}
function sourceDiagnosisMatches(r,d){if(['ICD-10','ICPC-2'].includes(d.system)&&d.code)return diagnosisMatches(d,r.codes?.icd||[],r.codes?.icpc||[]);const text=normCatalog(d.text||'').trim();if(/\b(ikke|ingen|avkreftet|mistanke|familie|mor|far)\b/.test(text))return false;
 return (r.diagnosisTerms||[]).some(term=>{const s=normCatalog(term);return text===s||text.startsWith(s+' (')||text.startsWith(s+' i ')||text.startsWith(s+' med ');});
}
function sourceMatch(r){const c=r.codes||{},drug=hasDrugSourceContext(),defaults=patientSourceDefault();let matches=[],score=0;
 const diagnoses=sourceContext.diagnosisCode?[{system:sourceContext.diagnosisSystem,code:sourceContext.diagnosisCode,text:sourceContext.diagnosisCode}]:sourceIndicationTerm(sourceContext.indication)?[{text:sourceIndicationTerm(sourceContext.indication)}]:defaults?patientSourceDiagnoses():[];
 for(const d of diagnoses)if(sourceDiagnosisMatches(r,d))matches.push(d.text||d.code);
 if(matches.length)score=r.scope==='referral'?2:r.scope==='book'?3:6;
 // Herbal ATCs can sit inside antidepressant/dementia classes. That does not
 // make ordinary psychopharmacology or withdrawal guidelines product-specific.
 const isNatural=m=>!!m.naturalId||m.naturalMode==='on'||isNaturalProduct(medicineIndex.get(m.catalogId))||['N06AX25','N06DX02'].includes(m.atc);
 const natural=naturalContext()||['N06AX25','N06DX02'].includes(sourceContext.atc)||defaults&&state.meds.some(isNatural);
 const atcs=sourceContext.atc&&!naturalContext()&&!['N06AX25','N06DX02'].includes(sourceContext.atc)?[sourceContext.atc.toUpperCase()]:defaults?state.meds.filter(m=>!isNatural(m)).map(m=>(m.atc||'').toUpperCase()):[];
 if(!r.diagnosisOnly)for(const a of atcs)if((c.atc||[]).some(p=>a.startsWith(p))){matches.push('ATC '+a);score=Math.max(score,r.scope==='book'?3:5);}
 if(natural&&r.taxonomy.primary.includes('naturmidler')){matches.push('Naturmidler / kosttilskudd');score=defaults?5:6;}
 // Generic monograph / interaction engines help with every identified medicine.
 // Organ, administration and geriatric resources require an explicit topic filter.
 const usefulGeneral=['r008','r014','r015','r016','r019','r028','r057','r058','r092','r093','r094','r095','r096','r219'].includes(r.id);
 if(!score&&c.general&&(filters.general||explicitSourceQuestion()||drug&&usefulGeneral))score=1;
 if(r.minAge&&defaults&&(!(Number(state.profile.age)>=r.minAge)))score=0;
 return {score,label:matches.length?[...new Set(matches)].join(' · '):score?'Oppslagsverk – søk på valgt preparat':'Ingen direkte emnekobling'};
}
function sourceScopePanel(){if(filters.interactionDatabases)return '<section id="source-scope-panel" class="source-scope sectiongap"><p class="hint">Viser interaksjonsdatabaser uavhengig av pasientens diagnoser og valgt legemiddel. Søk og tilgangsfilter kan avgrense listen. Fjern avkrysningen for å gå tilbake til forrige søk.</p></section>';if(hasDrugSourceContext()||sourceContext.diagnosisCode)return `<p class="hint sectiongap">Avgrenset til valgt ${hasDrugSourceContext()?'preparat og registrert indikasjon':'diagnose'}. Andre pasientdiagnoser blandes ikke inn.</p>`;if(resourceOnly)return '';
 const active=patientSourceDefault(),ds=patientSourceDiagnoses();return `<section id="source-scope-panel" class="source-scope panel sectiongap"><div class="panelbody"><label class="field">Utgangspunkt for fagkilder<select id="source-scope"><option value="patient" ${sourceContext.scope!=='all'?'selected':''}>Pasientens diagnoser og legemidler</option><option value="all" ${sourceContext.scope==='all'?'selected':''}>Hele kildebiblioteket</option></select></label><p class="hint sectiongap">${active?'Viser emnetreff for '+esc(ds.map(d=>d.text||d.code).join(', ')||'registrerte legemidler')+'.':explicitSourceQuestion()?'Søk og filtre avgrenser nå resultatene. Nullstill for å gå tilbake til pasientgrunnlaget.':ds.length?'Velg pasientgrunnlaget for relevante treff.':'Legg inn diagnoser i pasientgrunnlaget, eller søk etter et tema.'}</p>${active&&ds.some(d=>!DATA.resources.some(r=>sourceDiagnosisMatches(r,d)))?'<p class="hint">Noen diagnoser har ingen direkte koblet retningslinje. Søk på diagnosen eller åpne hele kildebiblioteket; ingen kilde tilordnes ved gjetting.</p>':''}</div></section>`;
}
document.addEventListener('change',e=>{if(e.target.id==='source-scope'){sourceContext.scope=e.target.value;render();}});
