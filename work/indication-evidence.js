/* Reviewed registration suggestions, 2026-11-14. Not an ATC-to-diagnosis inference.
 * Exact product-family, form and ATC must match. The cited SPC explicitly covers
 * each listed family/form; strengths in one shared SPC share section 4.1.
 * This deliberately remains separate from patient diagnoses, adverse effects
 * and guideline-supported off-label palliative use. No automatic ICD coding.
 */
const INDICATION_EVIDENCE = [
 {"brand": "Aclasta", "atc": "M05BA08", "form": "Infusjonsvæske, oppløsning", "uses": ["Osteoporose med økt bruddrisiko", "Osteoporose ved langvarig systemisk glukokortikoidbehandling", "Pagets bensykdom hos voksne"], "note": "Osteoporose: postmenopausale kvinner og voksne menn med økt bruddrisiko. Gjelder 5 mg/100 ml. Kontroller full indikasjon i punkt 4.1.", "exactSpc": true, "reviewed": "2026-11-22", "source": "https://www.ema.europa.eu/no/documents/product-information/aclasta-epar-product-information_no.pdf"},
 {"brand": "Zoledronic Acid Oresund Pharma", "atc": "M05BA08", "form": "Infusjonsvæske, oppløsning", "uses": ["Osteoporose med økt bruddrisiko", "Osteoporose ved langvarig systemisk glukokortikoidbehandling", "Pagets bensykdom hos voksne"], "note": "Osteoporose: postmenopausale kvinner og voksne menn med økt bruddrisiko. Gjelder 5 mg/100 ml. Kontroller full indikasjon i punkt 4.1.", "exactSpc": true, "reviewed": "2026-11-22", "spc": "15-10549"},
 {"brand": "Zoledronsyre Sun Pharma", "atc": "M05BA08", "form": "Infusjonsvæske, oppløsning", "uses": ["Osteoporose med økt bruddrisiko", "Osteoporose ved langvarig systemisk glukokortikoidbehandling", "Pagets bensykdom hos voksne"], "note": "Osteoporose: postmenopausale kvinner og voksne menn med økt bruddrisiko. Gjelder 5 mg/100 ml. Kontroller full indikasjon i punkt 4.1.", "exactSpc": true, "reviewed": "2026-11-22", "spc": "23-15250"},
 {"brand": "Oftagel", "atc": "S01XA20", "form": "Øyegel", "spc": "04-3155", "exactSpc": true, "reviewed": "2026-11-22", "uses": ["Tørre øyne – symptomlindring"], "note": "Preparatomtale punkt 4.1. Velg den faktiske behandlingsårsaken."},
 {"brand": "Oftagel", "atc": "S01XA20", "form": "Øyegel", "spc": "03-1678", "exactSpc": true, "reviewed": "2026-11-22", "uses": ["Tørre øyne – symptomlindring"], "note": "Preparatomtale punkt 4.1. Velg den faktiske behandlingsårsaken."},
 {brand:'Morfin Abcur',atc:'N02AA01',form:'Injeksjonsvæske, oppløsning',spc:'13-9756',uses:['Sterke smerter']},
 {brand:'Morfin',atc:'N02AA01',form:'Injeksjonsvæske, oppløsning',spc:'0000-06314',uses:['Sterke smerter']},
 {brand:'Morfin Orifarm',atc:'N02AA01',form:'Injeksjonsvæske, oppløsning',spc:'16-11053',uses:['Sterke smerter']},
 {brand:'Morfin Epidural',atc:'N02AA01',form:'Injeksjonsvæske, oppløsning',spc:'0000-07233',uses:['Smerter etter operasjon – epidural behandling','Smerter etter skade – epidural behandling','Kreftrelaterte smerter – epidural behandling']},
 {brand:'OxyNorm',atc:'N02AA05',form:'Injeksjons-/infusjonsvæske, oppløsning',spc:'2002-00216',uses:['Sterke smerter som krever opioidbehandling'],note:'Fra 12 år; se punkt 4.1 og 4.2.'},
 {brand:'Oxycodone Abboxia',atc:'N02AA05',form:'Injeksjons-/infusjonsvæske, oppløsning',spc:'21-14094',uses:['Moderate til sterke smerter som krever opioidbehandling']},
 {brand:'Oxycodone Hameln',atc:'N02AA05',form:'Injeksjons-/infusjonsvæske, oppløsning',spc:'17-11701',uses:['Kreftrelaterte smerter som krever opioidbehandling','Smerter etter operasjon','Sterke smerter som krever sterke opioider'],note:'Voksne.'},
 {brand:'Hydofon',atc:'N02AA03',form:'Injeksjons-/infusjonsvæske, oppløsning',spc:'18-12169',uses:['Sterke smerter'],note:'Voksne og ungdom over 12 år. 50 mg/ml er ikke beregnet for oppstart av opioidbehandling.'},
 {brand:'Palladon',atc:'N02AA03',form:'Injeksjons-/infusjonsvæske, oppløsning',spc:'08-5879',uses:['Sterke smerter'],note:'50 mg/ml er ikke beregnet for oppstart av opioidbehandling.'},
 {brand:'Palexia depot',atc:'N02AX06',form:'Depottablett',spc:'09-6806',uses:['Sterke, langvarige smerter som krever opioidbehandling'],note:'Voksne og barn over 6 år; se punkt 4.1 og 4.2.'},
 {brand:'Tapentadol Medical Valley',atc:'N02AX06',form:'Depottablett',spc:'21-13989',uses:['Sterke, langvarige smerter som krever opioidbehandling'],note:'Voksne og barn over 6 år; se punkt 4.1 og 4.2.'},
 {brand:'Pethidine Macure',atc:'N02AB02',form:'Injeksjonsvæske, oppløsning',spc:'22-14618',uses:['Akutte, sterke smerter'],note:'Voksne.'},
 {brand:'Petidin',atc:'N02AB02',form:'Injeksjonsvæske, oppløsning',spc:'0000-06456',uses:['Sterke smerter']},
 {brand:'Comboval',atc:'N02BE51',form:'Infusjonsvæske, oppløsning',spc:'20-13578',uses:['Akutte, moderate smerter – kortvarig intravenøs behandling'],note:'Voksne, når intravenøs behandling er nødvendig eller andre administrasjonsveier ikke kan brukes.'},
 {brand:'Paracet',atc:'N02BE01',form:'Smeltetablett',spc:'2002-00074',uses:['Lette til moderate smerter','Feber – kortvarig behandling']},
 {brand:'Paracet',atc:'N02BE01',form:'Stikkpille',spc:'0000-07457',uses:['Lette til moderate smerter','Feber – kortvarig behandling']},
 {brand:'Paracetduo',atc:'N02BE51',form:'Tablett',spc:'11-8172',uses:['Lette til moderate smerter','Feber – kortvarig behandling'],note:'Voksne og barn over 12 år.'},
 {brand:'Paralen',atc:'N02BE51',form:'Tablett',spc:'11-8251',uses:['Migrenehodepine – akutt behandling','Spenningshodepine'],note:'Fra 12 år.'},
 {brand:'Pinex',atc:'N02BE01',form:'Granulat i dosepose',spc:'08-6189',uses:['Lette til moderate smerter','Feber']},
 {brand:'Panodil-duo',atc:'N02BE51',form:'Tablett, filmdrasjert',spc:'17-11655',uses:['Lette til moderate smerter – kortvarig behandling','Feber – kortvarig behandling'],note:'Voksne og barn over 12 år og over 40 kg.'},
 {brand:'Prialt',atc:'N02BG08',form:'Infusjonsvæske, oppløsning',source:'https://www.ema.europa.eu/en/medicines/human/EPAR/prialt',uses:['Sterke, langvarige smerter som krever intratekal smertelindring'],note:'EMA: Therapeutic indication. Intratekal behandling; ikke et subkutant preparat til lindrende skrin.'},
 {brand:'Glitinum',atc:'N02CX',form:'Kapsel, hard',spc:'17-11860',uses:['Forebygging av migrene'],note:'Tradisjonelt plantebasert legemiddel. Bruksområdet bygger på lang brukstradisjon; alvorlig årsak skal være utelukket av lege. Voksne.'}
];
function indicationEvidence(product){
 if(!product||!product.spc)return null;
 return INDICATION_EVIDENCE.find(r=>normCatalog(r.brand)===normCatalog(product.brand)&&r.atc===product.atc&&normCatalog(r.form)===normCatalog(product.form)&&(!r.exactSpc||product.spc===(r.source||'https://produktinformasjon.legemiddelsok.no/preparatomtaler/'+r.spc+'.pdf')))||null;
}
function evidenceIndicationOptions(product){
 const r=indicationEvidence(product);if(!r)return [];
 return r.uses.map(text=>({text,system:'',code:'',origin:'spc',source:r.source||'https://produktinformasjon.legemiddelsok.no/preparatomtaler/'+r.spc+'.pdf',hint:(r.source?'Godkjent produktinformasjon · ':'Preparatomtale, punkt 4.1 · ')+(r.note||'Kort oppsummering; kontroller full indikasjon og aktuell pasientgruppe.')}));
}

function equivalentIndicationKey(p){
 if(!p?.spc||!p.brand||!p.name||!p.atc||!p.form||!p.ingredientIds?.length)return '';
 const name=normCatalog(p.name).trim(),brand=normCatalog(p.brand).trim();if(!name.startsWith(brand))return '';
 const presentation=name.slice(brand.length).trim().replace(/\s+/g,' ');if(!presentation)return '';
 return JSON.stringify([p.spc,p.atc,normCatalog(p.form),presentation,[...p.ingredientIds].sort()]);
}
let equivalentIndicationIndex;
function sharedFestIndicationOptions(product){
 const key=equivalentIndicationKey(product);if(!key)return [];
 if(!equivalentIndicationIndex){
  equivalentIndicationIndex=new Map();
  for(const p of DATA.catalog.meds){const k=equivalentIndicationKey(p),codes=(p.uses||[]).filter(c=>therapeuticUseLabel(DATA.catalog.uses[c]));if(!k||!codes.length)continue;
   const prev=equivalentIndicationIndex.get(k);equivalentIndicationIndex.set(k,prev?{codes:prev.codes.filter(c=>codes.includes(c)),donors:[...prev.donors,p.id]}:{codes,donors:[p.id]});
  }
 }
 const group=equivalentIndicationIndex.get(key);if(!group)return [];
 return group.codes.map(code=>{const label=DATA.catalog.uses[code];return {text:label.charAt(0)+label.slice(1).toLocaleLowerCase('nb'),system:'FEST 7488',code,origin:'shared-fest',source:product.spc,donors:group.donors,hint:'FEST-etikett fra tilsvarende preparat med samme styrke/form, virkestoff og preparatomtale · kontroller behandlingsårsaken'};});
}
function defaultIndicationOptions(product){
 const evidence=evidenceIndicationOptions(product);if(evidence.length)return evidence;
 const own=(product?.uses||[]).filter(c=>therapeuticUseLabel(DATA.catalog.uses[c])).map(code=>{const label=DATA.catalog.uses[code];return {text:label.charAt(0)+label.slice(1).toLocaleLowerCase('nb'),system:'FEST 7488',code,origin:'product',hint:'Bruksområdeetikett fra FEST · kontroller behandlingsårsak og preparatomtale'};});
 return own.length?own:sharedFestIndicationOptions(product);
}
