'use strict';
const $=s=>document.querySelector(s);
function applyTheme(theme){
 document.documentElement.dataset.theme=theme;
 const button=$('#theme-toggle');
 if(button){button.textContent=theme==='dark'?'☀ Lys':'☾ Mørk';button.setAttribute('aria-pressed',String(theme==='dark'));button.setAttribute('aria-label',theme==='dark'?'Bytt til lys modus':'Bytt til mørk modus');}
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').toLocaleLowerCase('nb').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ø/g,'o').replace(/æ/g,'ae');
const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
const isWeb=url=>/^https?:\/\//i.test(url);
const external=(url,label,cls='')=>isWeb(url)?`<a class="${esc(cls)}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label.replace(/ ?↗$/,""))}${label.endsWith('↗')?icon('out'):''}</a>`:`<span>${esc(label)}</span>`;
const paths={
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16v.5"/>',
  up:'<path d="M12 20V4m-7 7 7-7 7 7"/>',
  down:'<path d="M12 4v16m-7-7 7 7 7-7"/>',
  arrow:'<path d="M4 12h16m-7-7 7 7-7 7"/>',
  back:'<path d="M20 12H4m7-7-7 7 7 7"/>',
  chevronDown:'<path d="m5 9 7 7 7-7"/>',
  warning:'<path d="m12 3 10 18H2zM12 9v5m0 3v1"/>',
  taper:'<path d="M3 5h6v5h6v5h6M17 11l4 4-4 4"/>',
  kidney:'<path d="M8 3C3 4 2 9 3 15c1 5 6 7 8 3 2-3-3-4-2-7 2-3 3-7-1-8Zm8 0c5 1 6 6 5 12-1 5-6 7-8 3-2-3 3-4 2-7-2-3-3-7 1-8Z"/>',
  copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  clipboard:'<rect x="5" y="3" width="14" height="19" rx="1"/><path d="M9 7h6M9 11h6M9 15h4"/>',
  book:'<path d="M12 5v16M12 5C8 2 4 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-2-1-6-2-10 1z"/>',
  calc:'<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M8 6h8M8 11h1M15 11h1M8 16h1M15 16h1"/>',
  check:'<rect x="3" y="3" width="18" height="18" rx="1"/><path d="m7 12 3 3 7-7"/>',
  file:'<path d="M14 2H5v20h14V7zM14 2v6h5"/>',
  folder:'<path d="M3 5h6l2 3h10v13H3z"/>',
  print:'<path d="M7 8V3h10v5M7 16H3V9h18v7h-4M7 13h10v9H7zM17 10h1"/>',
  plus:'<path d="M12 4v16M4 12h16"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  out:'<path d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>'
};
const icon=n=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[n]||paths.file}</svg>`;
const navItems=[['sessions','Gjennomganger','folder'],['workspace','Arbeidsflate','clipboard'],['library','Kildebibliotek','book'],['renal','Dosering og nyrefunksjon','calc'],['lrp','LRP og tiltak','check'],['journal','Journalskriving','file'],['discharge','Utskrivning','file'],['codes','Kodeverk','book']];
const REVIEW=[
 {title:'Monitorering og TDM',cat:'Monitorering og TDM',questions:['Er nødvendig effekt- og sikkerhetsmonitorering utført og fulgt opp?','Vurder TDM ved blant annet litium, digoksin, aminoglykosider, vankomycin, antiepileptika og immunsuppressiva.','Noter siste dose, prøvetidspunkt, resultat, målområde og plan for ny kontroll. Vurder farmakogenetikk når relevant.'],source:'Prosedyre D56621, side 3; forelesning, side 23.'},
 {title:'Bivirkninger og symptomer',cat:'Bivirkninger',questions:['Kan nye symptomer, fall eller endrede laboratorieverdier skyldes et legemiddel?','Vurder tidsforløp, doseendring, interaksjoner og alternative forklaringer. Unngå forskrivningskaskader.','Beskriv mistenkt legemiddel og funn; avklar tiltak, videre observasjon og eventuell bivirkningsmelding.'],source:'Prosedyre D56621, side 3–4 og 6.'},
 {title:'Mindre gunstig legemiddel',cat:'Eldre og skrøpelighet',questions:['Vurder STOPP/START, STOPPFall og eventuelt STOPPFrail for riktig målgruppe.','Se etter samlet antikolinerg belastning, sedasjon, ortostase og fallrisiko.','Vei mulig nytte mot behandlingsbyrde, skrøpelighet, prognose og pasientens mål; avtal eventuell nedtrapping.'],source:'Prosedyre D56621, side 4; forelesning, side 25.'},
 {title:'Interaksjoner',cat:'Interaksjoner',questions:['Kontroller hele listen, også behovsmedisin, reseptfrie midler, naturmidler og kosttilskudd.','Vurder farmakokinetikk og samlet farmakodynamisk belastning: blødning, sedasjon, QT, antikolinerg effekt, blodtrykk og elektrolytter.','Beskriv klinisk relevans, konkret tiltak og monitorering. Et databasefunn er ikke i seg selv en klinisk beslutning.'],source:'Prosedyre D56621, side 4; forelesning, side 26.'},
 {title:'Dose og pasienttilpasning',cat:'Dose og organfunksjon',questions:['Er dose, intervall og legemiddelform tilpasset indikasjon, alder, vekt, nyre- og leverfunksjon?','Kontroller nyrefunksjonens metode, enhet, prøvedato og stabilitet. Vurder riktig vektgrunnlag, CAVE og kontraindikasjoner.','Sjekk preparatomtale og legemiddelspesifikke anbefalinger. Ved dialyse eller akutt nyreskade trengs særskilt vurdering.'],source:'Prosedyre D56621, side 4; forelesning, side 27.'},
 {title:'Indikasjon mangler',cat:'Avmedisinering',questions:['Har hvert legemiddel en dokumentert, fortsatt relevant indikasjon?','Se etter dobbeltbehandling, videreført kur, unødvendig profylakse og manglende effekt.','Vurder seponering eller nedtrapping sammen med pasienten og legen; angi mål, oppfølging og kriterier for revurdering.'],source:'Prosedyre D56621, side 4; forelesning, side 28.'},
 {title:'Ikke optimalt behandlet / ubehandlet indikasjon',cat:'Retningslinjer',questions:['Er aktuelle diagnoser og plager tilstrekkelig behandlet i lys av pasientens mål?','Vurder blant annet trombose- og ulcusprofylakse, smerte, kvalme, obstipasjon, osteoporose og anemi når relevant.','Kontroller behandlingsmål og forklar mulige avvik fra retningslinjer. START er et supplement til individuell vurdering.'],source:'Prosedyre D56621, side 4–5; arbeidsskjema, side 2.'},
 {title:'Administrasjon / håndteringsproblem',cat:'Administrasjon',questions:['Kartlegg faktisk bruk, svelgevansker, inhalasjonsteknikk, håndtering av pakninger og behov for bistand.','Sjekk konkrete preparater før knusing/deling eller bruk i sonde. Vurder endret opptak etter tarmkirurgi.','Ved intravenøs behandling: kontroller utblanding, infusjon, tilganger og forlikelighet. Avtal praktisk opplæring.'],source:'Prosedyre D56621, side 5; arbeidsskjema, side 2.'},
 {title:'Kurlegemidler',cat:'Infeksjon',questions:['Er startdato, indikasjon, revurderingsdato og planlagt sluttdato kjent?','For antibiotika: vurder mikrobiologisvar, spektrum, dose, organfunksjon og overgang fra intravenøs til peroral behandling.','Avklar samlet behandlingsvarighet og hvem som følger opp kuren etter utskrivning.'],source:'Prosedyre D56621, side 5; forelesning, side 31.'},
 {title:'Annet og videre oppfølging',cat:'IMM og dokumentasjon',questions:['Er pasientens spørsmål og behov for legemiddelinformasjon ivaretatt?','Avklar tilgjengelighet, resepter, multidose/dosett og behov for kontakt med neste behandlingsnivå.','Dokumenter prioriterte tiltak, ansvarlig, tidspunkt, mål og resultat. Planlegg utskrivningssamtale og ny samstemming.'],source:'Prosedyre D56621, side 6; forelesning, side 32–33.'}
];
const LMS_CHECKS=['Pasient/pårørende intervjuet om faktisk bruk','Liste kontrollert mot aktuelle kilder og datoer','Reseptfrie midler, kosttilskudd og naturmidler avklart','Behovsmedisin, kurer og legemidler som ikke tas daglig avklart','Inhalatorer, øyedråper, plaster, kremer og injeksjoner avklart','CAVE, reaksjonstype, etterlevelse og håndtering kartlagt','Uoverensstemmelser avklart eller dokumentert med ansvarlig'];
const DISCHARGE_CHECKS=['Legemiddellisten samstemt på nytt ved utskrivning','Nye, endrede, pauserte og seponerte legemidler forklart med begrunnelse','Pasient/pårørende har fått oppdatert skriftlig liste','Forståelse kontrollert: pasienten forklarer bruken med egne ord','Resepter, utlevering og eventuell multidose/dosett avklart','Fastlege/kommune og andre relevante mottakere informert','Kontrollprøver og videre tiltak avtalt med ansvarlig og tidspunkt'];
const profileBlank=()=>({endOfLife:'',frailAdl:'',frailIrreversible:'',frailPrognosis:'',adherenceBarriers:'',adherenceSupport:'',initials:'',admittedDate:'',admittedFrom:'',bed:'',gfr:'',cyp:'',journalInfo:'',sensory:false,cognition:false,language:false,substances:false,age:'',weight:'',height:'',egfr:'',egfrMode:'auto',egfrMethod:'',sex:'',creatinine:'',scrUnit:'umol',cystatin:'',stability:'',cgWeightType:'',cgWeight:'',labDate:'',fall:false,frail:false,sonde:false,dialysis:false,pregnant:false,liver:false,goals:'',reason:'',diagnoses:'',cave:'',support:'',symptoms:'',labs:''});
const blank=()=>newWorkflowState();
let state=blank(),dirty=false,page='workspace',step=1;
let filters={q:'',cat:'',tags:[],mode:'any',fav:false,pediatric:false,access:''};
let auditFilter={q:'',status:''};
let favorites=new Set();try{favorites=new Set(JSON.parse(localStorage.getItem('imm-favorites-v1')||'[]'));}catch{}
const tagLabels={seponering:'Seponering',alder:'Alder / eldre',vekt:'Vekt',nyre:'Nyrefunksjon',lever:'Lever',fall:'Fall',sonde:'Sonde / svelg',graviditet:'Graviditet / amming'};
const get=(path)=>path.split('.').reduce((v,k)=>v?.[k],state);
function set(path,value){const keys=path.split('.');let obj=state;keys.slice(0,-1).forEach(k=>obj=obj[k]);obj[keys.at(-1)]=value;markChanged();}
function field(label,path,type='text',hint='',opts={}){
 const value=get(path);const attrs=`data-bind="${esc(path)}" ${opts.required?'required':''} ${opts.maxlength?'maxlength="'+opts.maxlength+'"':''}`;
 const input=type==='textarea'?`<textarea ${attrs} rows="${opts.rows||3}" autocomplete="off">${esc(value)}</textarea>`:type==='select'?`<select ${attrs}>${opts.options.map(([v,l])=>`<option value="${esc(v)}" ${value===v?'selected':''}>${esc(l)}</option>`).join('')}</select>`:`<input type="${type==='decimal'?'text':type}" ${type==='decimal'?'inputmode="decimal"':''} ${attrs} value="${esc(value)}" autocomplete="off">`;
 return `<label class="field ${opts.full?'full':''}">${esc(label)}${input}${hint?`<span class="hint">${esc(hint)}</span>`:''}</label>`;
}
const toggle=(label,path)=>`<label class="toggle-row"><input type="checkbox" data-bind="${esc(path)}" ${get(path)?'checked':''}><span>${esc(label)}</span></label>`;
const heading=(title,sub)=>`<div class="pagehead"><h1>${esc(title)}</h1><p class="lead">${esc(sub)}</p></div>`;
function stepper(active){return `<div class="stepper" aria-label="IMM-forløp">${[[1,'Samstemming'],[2,'Legemiddelgjennomgang'],[3,'Utskrivning og oppfølging']].map(([s,t])=>`<button data-action="step" data-step="${s}" class="${active===s?'active':''}" ${active===s?'aria-current="step"':''}><span class="stepnum">0${s}</span>${t}</button>`).join('')}</div>`;}
const byOriginal=id=>DATA.resources.find(r=>r.ids.includes(id));
function quick(id,label){const r=byOriginal(id);return r?`<a class="quicklink" href="${esc(r.directUrl||r.url)}" target="_blank" rel="noopener noreferrer">${esc(label||r.title)}${icon('chevron')}</a>`:'';}
function contextPanel(){
 return `<aside class="context stack"><section class="panel"><div class="panelbody"><h2>Pasientens forutsetninger</h2>${[['Alder (år)','age'],['Vekt (kg)','weight'],['eGFR (ml/min/1,73 m²)','egfr']].map(([l,k])=>`<label class="inlinefield">${l}<input type="text" inputmode="decimal" data-bind="profile.${k}" value="${esc(state.profile[k])}" autocomplete="off"></label>`).join('')}<hr class="divider">${toggle('Fallrisiko','profile.fall')}${toggle('Skrøpelighet','profile.frail')}${toggle('Sonde / svelgevansker','profile.sonde')}<div class="notice compact">Kontroller metode og enhet før dosevurdering.</div><button class="textlink smalltext sectiongap" data-action="route" data-page="renal">Åpne nyrefunksjonskalkulatorer ${icon('arrow')}</button></div></section><section class="panel"><div class="panelbody"><h2>Ofte brukt</h2>${external('https://www.felleskatalogen.no/medisin/','Preparatomtale / SPC ↗','quicklink')}${external('https://www.felleskatalogen.no/medisin/interaksjon/','Interaksjonssøk ↗','quicklink')}${quick(9,'STOPP / START')}${quick(35,'Antibiotika i sykehus')}</div></section><div id="context-alerts" class="context-alerts">${contextAlerts()}</div></aside>`;
}
function contextAlerts(){
 const p=state.profile,items=[];
 if(p.age&&IMMCalc.number(p.age)<18)items.push('Arbeidsflaten er rettet mot voksne. CKD-EPI vises fra 18 år; Cockcroft–Gault fra 16 år.');
 if(IMMCalc.number(p.age)>=65||p.frail)items.push('Vurder antikolinerg belastning, behandlingsbyrde og pasientens mål. Se kilder for eldre og skrøpelighet.');
 if(p.fall)items.push('Vurder sedasjon, ortostase og samlet legemiddelbelastning. Se STOPPFall.');
 if(p.sonde)items.push('Kontroller hvert preparat for knusing, formulering og egnethet ved sonde.');
 if(p.egfr)items.push('Registrer dato og metode for eGFR. Tallet alene angir ikke riktig dose eller kronisk nyresykdom.');
 return items.length?`<div class="notice info"><strong>Momenter å vurdere</strong><ul class="bulletlist">${items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul><button class="textlink" data-action="context-search">Finn relevante kilder ${icon('arrow')}</button></div>`:'';
}
function checks(items,key){return `<div class="checklist">${items.map((t,i)=>`<label class="checkline"><input type="checkbox" data-list="${key}" data-index="${i}" ${get(key).includes(i)?'checked':''}><span>${esc(t)}</span></label>`).join('')}</div>`;}
const verifyLabels={content:'Innhold / emne kontrollert',search:'Riktig emne funnet i søk',http:'Adressen svarer; innhold ikke fullverifisert',restricted:'Tilgang begrenset / krever innlogging',unverified:'Må kontrolleres ved åpning',user:'Bekreftet fungerende av bruker'};
const calcSources={
 niddk:'https://www.niddk.nih.gov/research-funding/research-programs/kidney-clinical-research-epidemiology/laboratory/glomerular-filtration-rate-equations/adults',
 dosing:'https://www.niddk.nih.gov/research-funding/research-programs/kidney-clinical-research-epidemiology/laboratory/ckd-drug-dosing-providers',
 cg:'https://www.kidney.org/sites/default/files/441-8491_2202_faqs_aboutgfr_v5.pdf',
 sps:'https://sps.nhs.uk/articles/calculating-kidney-function/'
};
function renderRenal(){
 return heading('Dosering og nyrefunksjon','Fire estimater, tydelige enheter og et eksplisitt vektgrunnlag.')+`<div class="split sectiongap"><section class="panel"><div class="panelhead"><h2>Inndata</h2><span class="smalltext muted">CKD-EPI ≥18 år · CrCl ≥16 år</span></div><div class="panelbody"><div class="formgrid">${field('Alder (år)','profile.age','decimal')}${field('Kjønnskoeffisient i formelen','profile.sex','select','Koeffisientene er publisert som female/male.',{options:[['','Velg koeffisient'],['female','Kvinne (female)'],['male','Mann (male)']]})}${creatinineField()}${field('Cystatin C (mg/L)','profile.cystatin','decimal','mg/L i både SI og konvensjonelt oppsett. Trengs for eGFRcys og eGFRcr-cys.')}${field('Prøvedato / tidspunkt','profile.labDate','text')}${field('Faktisk vekt (kg)','profile.weight','decimal')}${field('Høyde (cm)','profile.height','decimal')}<div class="full"><button class="textlink smalltext" data-action="convert-body">Har du vekt i lb eller høyde i tommer? Konverter ${icon('arrow')}</button></div>${field('Nyrefunksjonens stabilitet','profile.stability','select','Standardformlene skal ikke tolkes som pålitelige ved akutt/skiftende funksjon.',{full:true,options:[['','Ikke avklart'],['stable','Vurdert som stabil'],['unstable','Akutt / skiftende nyrefunksjon']]})}</div><hr class="divider"><h3>Vekt i Cockcroft–Gault</h3><p class="smalltext muted">Velg etter preparatomtale/lokal prosedyre. Appen velger ikke ideal- eller justert vekt automatisk.</p><div class="formgrid sectiongap">${field('Vektgrunnlag','profile.cgWeightType','select','Valget kan endre CrCl vesentlig.',{options:[['','Velg vektgrunnlag'],['actual','Faktisk kroppsvekt'],['ideal','Idealvekt – oppgitt av deg'],['adjusted','Justert vekt – oppgitt av deg'],['other','Annen begrunnet vekt']]})}${field('Valgt beregningsvekt (kg)','profile.cgWeight','decimal','Brukes ved ideal/justert/annen vekt. Faktisk vekt hentes ovenfra.')}</div><hr class="divider">${toggle('Dialyse','profile.dialysis')}${toggle('Graviditet','profile.pregnant')}<p class="smalltext muted sectiongap">Bruk standardiserte prøver: kreatinin sporbar til IDMS og cystatin C til IFCC. Cystatin C og kreatinin påvirkes også av andre forhold enn GFR.</p></div></section><div class="stack"><section class="panel"><div class="panelhead"><h2>Beregnede estimater</h2></div><div class="panelbody" id="renal-results" aria-live="polite">${renalResults()}</div></section><section class="panel"><div class="panelbody"><h2>Fra verdi til dosevurdering</h2><ol class="bulletlist"><li>Bekreft indikasjon, legemiddel, formulering og nåværende dose.</li><li>Velg nyrefunksjonsmål og enhet som doseringskilden angir. CrCl og eGFR er forskjellige estimater.</li><li>Vurder alder, vekt, skrøpelighet, leverfunksjon, interaksjoner og prøvetrend samlet.</li><li>Dokumenter forslag, begrunnelse, ansvarlig og plan for effekt-/sikkerhetskontroll.</li></ol><div class="actions"><button class="small" data-action="dose-sources">Finn dosekilder</button><button class="small primary" data-action="add-lrp" data-type="4">Registrer LRP</button></div>${quick(21,'UpToDate Kidney Dosing Tool')}${quick(89,'Legemiddelhåndboka: nyredosering')}${quick(20,'Antiinfektiva: nyre, dialyse og vekt')}</div></section></div></div><details class="panel sectiongap"><summary class="panelhead"><h2>Formler, versjoner og begrensninger</h2></summary><div class="panelbody"><button class="small" data-action="calibration">Sammenligningstest med UpToDate</button><p>Full presisjon brukes internt. Resultater vises med én desimal; kroppsoverflate med to. Dette uttrykker beregningspresisjon, ikke målepresisjon.</p><ul class="bulletlist"><li><strong>eGFRcr, CKD-EPI 2021:</strong> 142 × min(SCr/κ,1)<sup>α</sup> × max(SCr/κ,1)<sup>−1,200</sup> × 0,9938<sup>alder</sup> × 1,012 ved female. κ = 0,7/0,9 og α = −0,241/−0,302 (female/male).</li><li><strong>eGFRcr-cys, CKD-EPI 2021:</strong> 135 × min(SCr/κ,1)<sup>α</sup> × max(SCr/κ,1)<sup>−0,544</sup> × min(Scys/0,8,1)<sup>−0,323</sup> × max(Scys/0,8,1)<sup>−0,778</sup> × 0,9961<sup>alder</sup> × 0,963 ved female. α = −0,219/−0,144.</li><li><strong>eGFRcys, CKD-EPI 2012:</strong> 133 × min(Scys/0,8,1)<sup>−0,499</sup> × max(Scys/0,8,1)<sup>−1,328</sup> × 0,996<sup>alder</sup> × 0,932 ved female.</li><li><strong>CrCl, Cockcroft–Gault:</strong> (140 − alder) × valgt vekt / (72 × SCr), × 0,85 ved female. SCr i mg/dL, vekt i kg. Ingen oppjustering av lavt kreatinin.</li><li><strong>Mosteller BSA:</strong> √(høyde × faktisk vekt / 3600). <strong>Absolutt eGFR:</strong> indeksert eGFR × BSA / 1,73. Dette er fortsatt estimert GFR, ikke CrCl.</li></ul><p class="smalltext">CKD-EPI: fra 18 år. Cockcroft–Gault: fra 16 år. Øvre teknisk aldersgrense her er under 140 år, ikke en dokumentert valideringsgrense. Standardestimatene forutsetter stabil nyrefunksjon. Ett resultat diagnostiserer ikke kronisk nyresykdom. Lav muskelmasse, ekstrem kroppsstørrelse og resultater nær dosegrenser kan kreve et bedre nyrefunksjonsgrunnlag. Kombinert kreatinin/cystatin C gir ofte bedre estimat, men valg av metode må vurderes klinisk.</p><p class="smalltext sectiongap">Referansetester: ${external('https://www.tuftsmedicine.org/sites/default/files/2023-06/Implementation-of-2021-CKD-EPI-Equations%20-8%20Dec-21.pdf','CKD-EPI/Tufts – 16 kontrolltilfeller')}. Formler: ${external(calcSources.niddk,'NIDDK – eGFR for voksne')} · ${external('https://www.kidney.org/sites/default/files/441-8491_2202_faqs_aboutgfr_v5.pdf','NKF – GFR og Cockcroft–Gault')} · ${external(calcSources.dosing,'NIDDK – legemiddeldosering og BSA')} · ${external(calcSources.sps,'NHS SPS – metode og vektgrunnlag')}</p></div></details>`+footer();
}
const fmt=(v,d=1)=>v===null||!Number.isFinite(v)?'—':v.toLocaleString('nb-NO',{minimumFractionDigits:d,maximumFractionDigits:d});
function renalResults(){
 const r=IMMCalc.evaluate(state.profile),v=r.values;
 const cards=[['cr','eGFRcr','CKD-EPI 2021'],['combined','eGFRcr-cys','CKD-EPI 2021'],['cys','eGFRcys','CKD-EPI 2012'],['cg','CrCl','Cockcroft–Gault']];
 return `${renalTransfer()}${r.warnings?.length?`<div class="notice info">${r.warnings.map(esc).join('<br>')}</div>`:''}${r.messages.length?`<div class="notice">${r.messages.map(esc).join('<br>')}</div>`:''}<div class="metricrow">${cards.map(([k,t,method])=>`<div class="metric"><span>${t} · ${method}</span><strong data-result="${k}">${fmt(v[k])}${renalBadge(v[k],k==='cg'?'cg':'egfr')}</strong><span>${k==='cg'?'ml/min':'ml/min/1,73 m²'}</span>${k!=='cg'&&v[k]!==null&&v.bsa?`<p class="smalltext">Absolutt: <b>${fmt(v[k]*v.bsa/1.73)}</b> ml/min</p>`:''}</div>`).join('')}</div><p class="smalltext muted">Kroppsoverflate (Mosteller): <b>${fmt(v.bsa,2)} m²</b><br>CrCl-vekt: ${state.profile.cgWeightType?esc({actual:'Faktisk',ideal:'Idealvekt',adjusted:'Justert',other:'Annen'}[state.profile.cgWeightType]):'Ikke valgt'}${r.cgWeight>0?' · '+fmt(r.cgWeight)+' kg':''}</p>${r.valid&&!v.cr&&!v.cys&&!v.cg?'<p class="notice info sectiongap">Oppgi kreatinin og/eller cystatin C for eGFR. CrCl krever også valgt vektgrunnlag.</p>':''}<div class="notice info sectiongap">Indeksert eGFR, absolutt eGFR og CrCl må ikke byttes om. Kontroller mål og enhet i aktuell doseringskilde.</div>`;
}
function renderLrp(){
 const sorted=[...state.lrps].sort((a,b)=>({high:0,medium:1,low:2}[a.priority]-{high:0,medium:1,low:2}[b.priority]));
 return heading('LRP og tiltak','Fra begrunnet problem til avtalt handling og oppfølging.')+`<div class="subhead"><p class="muted">${state.lrps.length} registrert · ${state.lrps.filter(x=>x.status==='Avklart / fulgt opp').length} fulgt opp</p><button class="primary" data-action="add-lrp">${icon('plus')}Registrer LRP</button></div><div class="notice info">Prioriter reelle og potensielle problemer etter klinisk betydning. Drøft tiltak i tverrfaglig team og med pasienten; angi hvem som gjør hva og når.</div><div class="sectiongap">${sorted.length?sorted.map(l=>`<article class="lrpcard ${l.priority}"><div class="lrptop"><div><span class="priority ${l.priority}">${{high:'Høy prioritet',medium:'Middels prioritet',low:'Lav prioritet'}[l.priority]}</span> <span class="badge">${esc(l.kind)}</span><h3 style="margin-top:9px">${esc(l.drug||REVIEW[+l.type]?.title||'Legemiddelrelatert problem')}</h3></div><span class="smalltext muted">${esc(l.status)}</span></div><p style="white-space:pre-wrap">${esc(l.problem)}</p><div class="lrpfields">${[['Begrunnelse / funn',l.evidence],['Forslag til tiltak',l.action],['Mål / monitorering',l.monitor],['Ansvarlig og tidspunkt',[l.owner,l.when].filter(Boolean).join(' · ')],['Beslutning / resultat',l.result],['Fagkilde',l.source]].map(([t,v])=>`<div><small>${t}</small>${esc(v||'Ikke angitt')}</div>`).join('')}</div><div class="actions"><button class="small" data-action="edit-lrp" data-id="${l.id}">Rediger / følg opp</button><button class="quiet small" data-action="remove-lrp" data-id="${l.id}">Fjern</button></div></article>`).join(''):'<div class="empty"><h3>Gjør funnene konkrete</h3><p>Registrer et problem, klinisk begrunnelse, forslag til tiltak og hvem som følger opp.</p></div>'}</div><div class="toolbarbottom"><button data-action="report">Forhåndsvis samlet arbeidsnotat</button><button data-action="export-text">Last ned notat</button><button data-action="export-json">Eksporter arbeidsøkt</button><button data-action="import-json">Importer arbeidsøkt</button></div>`+footer();
}
function renderDischarge(){
 return heading('Utskrivning og oppfølging','Fullfør IMM-forløpet med samstemt liste, forståelig informasjon og tydelig ansvar.')+stepper(3)+`<div class="split"><section class="panel"><div class="panelhead"><h2>Før pasienten reiser</h2></div><div class="panelbody">${checks(DISCHARGE_CHECKS,'discharge.checks')}<hr class="divider">${field('Mottakere og hvordan informasjon er overført','discharge.recipient','textarea','Registrer funksjon/tjeneste, ikke personidentifikatorer.')}${field('Pasientinformasjon og demonstrert forståelse','discharge.education','textarea','Hva ble forklart? Kan pasienten vise eller forklare bruken?')}</div></section><section class="panel"><div class="panelhead"><h2>Plan for videre oppfølging</h2></div><div class="panelbody">${field('Plan: tiltak, ansvarlig, tidspunkt og mål','discharge.followup','textarea','Ta med kontrollprøver, effekt/bivirkninger, nedtrapping og kurer.',{rows:5})}${field('Uavklarte forhold / overlevering','discharge.notes','textarea','Beskriv hva som gjenstår og hvem som følger det opp.')}<div class="notice info sectiongap">${state.lrps.filter(l=>l.status!=='Avklart / fulgt opp').length} LRP er ikke markert fulgt opp. Kontroller at videre ansvar er avklart.</div><div class="actions sectiongap"><button data-action="route" data-page="lrp">Se LRP</button><button class="primary" data-action="report">Samlet arbeidsnotat</button></div></div></section></div><section class="panel sectiongap"><div class="panelhead"><h2>Legemiddelliste og endringer</h2><button class="small" data-action="add-med">Legg til legemiddel</button></div>${medTable()}</section><div class="toolbarbottom"><button data-action="print">Skriv ut arbeidsnotat</button><button data-action="export-text">Last ned som tekst</button></div>`+footer();
}
function renderSources(){
 const counts=DATA.audit.reduce((a,x)=>(a[x.outcome]=(a[x.outcome]||0)+1,a),{});
 return heading('Dokumenter og lenkestatus','Originalgrunnlaget, oppdaterte adresser og en sporbar kontroll av alle lenkemål.')+`<section class="panel"><div class="panelhead"><h2>De fire dokumentene</h2><span class="smalltext muted">Innebygd i denne lokale filen</span></div><div class="panelbody">${DATA.documents.map((d,i)=>`<div class="documentrow"><div><strong>${esc(d.short)}</strong><p>${esc(d.name)} · ${d.pages} sider</p><p>${esc(d.note)}</p></div><button class="small" data-action="pdf" data-index="${i}">Åpne PDF ↗</button></div>`).join('')}</div></section><div class="notice info sectiongap"><strong>Kontroll 19.–20. oktober 2026.</strong> Alle ${DATA.audit.length} unike innebygde lenkemål fra PDF-ene har en kontrolloppføring. HTTP-svar, riktig faglig emne og innlogget tilgang er forskjellige kontrollnivåer. Innhold bak skole-/arbeidsplassinnlogging og interne dokumentversjoner er ikke fullverifisert. Ingen betalte kilder er fjernet på grunn av tilgang.</div><div class="tagrow sectiongap">${Object.entries(counts).map(([s,n])=>`<span class="tag neutral">${esc(s)}: ${n}</span>`).join('')}</div><div class="filters sectiongap"><div class="filterline"><label class="searchbox"><span class="screenreader">Søk i lenkestatus</span>${icon('search')}<input id="audit-search" type="search" placeholder="Søk i originaladresse, kilde eller kommentar …" value="${esc(auditFilter.q)}"></label><select id="audit-status" aria-label="Lenkestatus"><option value="">Alle statuser</option>${Object.keys(counts).sort().map(s=>`<option ${s===auditFilter.status?'selected':''}>${esc(s)}</option>`).join('')}</select><button data-action="export-audit">Last ned lenkelogg</button></div></div><div id="audit-results">${auditResults()}</div><section class="panel sectiongap"><div class="panelbody"><h2>Hvordan materialet er brukt</h2><p class="smalltext sectiongap">IMM-arbeidsflyt og de ti vurderingsområdene bygger på prosedyre D56621 (versjon 1.01, gyldig fra 01.07.2025), arbeidsskjemaet og forelesningen. Kursoppgaver og instrukser til studenter er behandlet som dokumentinnhold, ikke som instruksjoner til denne appen. Gjeldende lokale prosedyrer og kliniske beslutninger må fortsatt forankres hos ansvarlig helsepersonell.</p><p class="smalltext sectiongap">Tidligere versjoner og interne nettverksbaner er bevart i loggen. Et offentlig emnealternativ er merket som alternativ og er ikke dokumentert som identisk med en lokal prosedyre. Pediatri er bevart i biblioteket, skjult i standardvisningen.</p>${external('https://www.helsedirektoratet.no/faglige-rad/legemiddelsamstemming-og-legemiddelgjennomgang','Nasjonale faglige råd om samstemming og legemiddelgjennomgang')}</div></section>`+footer();
}
function auditResults(){
 const rows=DATA.audit.filter(x=>(!auditFilter.status||x.outcome===auditFilter.status)&&norm([x.id,x.title,x.original,x.current,x.note].join(' ')).includes(norm(auditFilter.q)));
 return `<div class="resultbar">${rows.length} lenkeoppføringer</div>${rows.map(x=>`<details class="auditrow"><summary><span><b>#${x.id}</b> · ${esc(x.title)}</span><span class="nowrap">${esc(x.outcome)}</span></summary><div class="statusline">${x.sources.map(s=>`${esc(DATA.documents[s.doc-1].short)}, s. ${s.page}`).join(' · ')}<br>Originalkontroll: ${esc(x.http?`HTTP ${x.http}`:x.originalStatus)} · Valgt inngang: ${esc(x.currentHttp?'HTTP '+x.currentHttp:x.currentTechnical||'Se merknad')} · Fagkontroll: ${esc(verifyLabels[x.verification]||'Begrenset')}</div><p>${esc(x.note)}</p><div class="url"><strong>Opprinnelig:</strong> ${isWeb(x.original)?external(x.original,x.original):esc(x.original)}</div><div class="url"><strong>Valgt inngang / alternativ:</strong> ${isWeb(x.current)?external(x.current,x.current):esc(x.current)}</div></details>`).join('')||'<div class="empty">Ingen treff.</div>'}`;
}
function modal(title,body,footerHtml=''){
 const d=$('#modal');d.innerHTML=`<div class="modalhead"><h2 id="modal-title">${esc(title)}</h2><button class="iconbtn quiet" data-action="close-modal" aria-label="Lukk">${icon('close')}</button></div>${body}${footerHtml}`;d.showModal();
}
function modalField(label,name,value='',type='text',options=[]){
 let i=type==='textarea'?`<textarea name="${name}" rows="3">${esc(value)}</textarea>`:type==='select'?`<select name="${name}">${options.map(o=>{const [v,t]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${v===value?'selected':''}>${esc(t)}</option>`;}).join('')}</select>`:`<input name="${name}" type="${type}" value="${esc(value)}" autocomplete="off">`;
 return `<label class="field">${esc(label)}${i}</label>`;
}
function noteText(){
 const p=state.profile,r=IMMCalc.evaluate(p),v=r.values;
 const checkLines=(list,sel)=>list.map((x,i)=>`${sel.includes(i)?'[x]':'[ ]'} ${x}`).join('\n');
 return `IMM – ARBEIDSNOTAT\nUtkast til faglig vurdering – må kontrolleres og dokumenteres i godkjent journal.\n\nPASIENTENS MÅL OG FORUTSETNINGER\nKasus / initialer: ${p.initials} | Kjønn: ${p.sex}\nInnlagt: ${p.admittedDate} fra ${p.admittedFrom} | Plass: ${p.bed}\nAktuelt fra journal: ${p.journalInfo}\nGFR: ${p.gfr} | CYP-test: ${p.cyp}\nBistand: ${state.lms.supportChecks.map(i=>SUPPORT[i]).join(", ")}\nSærskilte hensyn: ${[["sensory","Hørsel/syn"],["cognition","Kognisjon"],["language","Språk/tolk"],["substances","Rus/røyk/alkohol"],["fall","Fall"],["frail","Skrøpelighet"],["sonde","Sonde/svelging"],["dialysis","Dialyse"],["liver","Leversykdom"],["pregnant","Graviditet"]].filter(([k])=>p[k]).map(([,v])=>v).join(", ")}\nMål: ${p.goals||'Ikke angitt'}\nBakgrunn: ${p.reason||'Ikke angitt'}\nDiagnoser: ${p.diagnoses||'Ikke angitt'}\nCAVE: ${p.cave||'Ikke angitt'}\nBistand/funksjon: ${p.support||'Ikke angitt'}\nSymptomer/funn: ${p.symptoms||'Ikke angitt'}\nLab/EKG: ${p.labs||'Ikke angitt'}\nAlder: ${p.age||'—'} år | Vekt: ${p.weight||'—'} kg | Høyde: ${p.height||'—'} cm\neGFR i gjennomgangen: ${p.egfr||'—'} ml/min/1,73 m²\n\nSAMSTEMMING\nBekreftet: ${state.lms.confirmed?'Ja':'Nei'}\nKilder/dato: ${state.lms.sourceList.map(s=>[sourceLabel(s),s.date,s.note].filter(Boolean).join(" · ")).join("; ")}\nTidligere kildenotat: ${state.lms.sources||'Ikke angitt'}\nUoverensstemmelser: ${state.lms.discrepancies||'Ikke angitt'}\n${checkLines(LMS_CHECKS,state.lms.checks)}\n${INTERVIEW.map((x,i)=>i===8&&p.sex!=='male'?'':`${state.lms.interview.includes(i)?'[x]':'[ ]'} ${x}`).filter(Boolean).join('\n')}\nSamtalenotat: ${state.lms.notes}\nEtterlevelse – barrierer: ${p.adherenceBarriers||'Ikke angitt'}\nEtterlevelse – støtte: ${p.adherenceSupport||'Ikke angitt'}\n\nLEGEMIDLER\n${state.meds.length?state.meds.map(m=>`${m.name} | ${m.form} | ${doseText(actualUse(m).dose,m)} | ${m.schedule}\nATC: ${m.atc||"—"} | Virkestoff: ${(m.ingredients||"").replace(/\n/g,", ")}\n${comparisonSources().map(s=>`${sourceLabel(s)}: ${doseText(observation(m.observations?.[s.id]).dose,m)||"Ikke registrert"} ${observation(m.observations?.[s.id]).comment}`).join("\n")}\n${reporterLabel()}: ${doseText(actualUse(m).dose,m)} ${actualUse(m).comment}\nAvklaring: ${m.reconciliation||"—"} | ${m.resolution||"—"}\nIndikasjon: ${m.indication||'—'} | Kilde: ${m.source||'—'}\nUtskrivning: ${m.status} | ${m.change||'—'}`).join('\n\n'):'Ingen registrert.'}\n\nNYREFUNKSJON – BEREGNET ESTIMAT\nPrøvetid: ${p.labDate||'Ikke angitt'}\nKreatinin: ${p.creatinine||'—'} ${p.scrUnit==='umol'?'µmol/L':'mg/dL'} | Cystatin C: ${p.cystatin||'—'} mg/L\nKoeffisient: ${p.sex||'Ikke valgt'} | Stabilitet: ${p.stability||'Ikke avklart'}\n${r.valid?`eGFRcr (2021): ${fmt(v.cr)} ml/min/1,73 m²\neGFRcr-cys (2021): ${fmt(v.combined)} ml/min/1,73 m²\neGFRcys (2012): ${fmt(v.cys)} ml/min/1,73 m²\nCrCl (Cockcroft–Gault): ${fmt(v.cg)} ml/min; vektgrunnlag ${p.cgWeightType||'—'}, ${fmt(r.cgWeight)} kg\nBSA (Mosteller): ${fmt(v.bsa,2)} m²${v.bsa?`\nAbsolutt eGFRcr: ${fmt(v.cr===null?null:v.cr*v.bsa/1.73)} ml/min\nAbsolutt eGFRcr-cys: ${fmt(v.combined===null?null:v.combined*v.bsa/1.73)} ml/min\nAbsolutt eGFRcys: ${fmt(v.cys===null?null:v.cys*v.bsa/1.73)} ml/min`:''}`:r.messages.join('\n')}\nIngen doseringsanbefaling utledes automatisk.\n\nTI VURDERINGSOMRÅDER\n${REVIEW.map((q,i)=>`${state.review[i].checked?'[x]':'[ ]'} ${q.title}\n${state.review[i].note||'Ingen vurdering notert.'}\n${(REVIEW_SUB[i]||[]).filter((_,j)=>state.review[i].sub.includes(j)).join('; ')}`).join('\n\n')}\n\nPRIORITERTE LRP OG TILTAK\n${orderedLrps().map((l,i)=>`${i+1}. ${l.drug||REVIEW[+l.type]?.title} – ${l.kind}, ${{high:'høy',medium:'middels',low:'lav'}[l.priority]} prioritet\nProblem: ${l.problem}\nBegrunnelse: ${l.evidence||'Ikke angitt'}\nTiltak: ${l.action||'Ikke angitt'}\nMål/monitorering: ${l.monitor||'Ikke angitt'}\nAnsvarlig: ${l.owner||'Ikke angitt'} | Tidspunkt: ${l.when||'Ikke angitt'}\nStatus: ${l.status} | Resultat: ${l.result||'Ikke angitt'}\nKilde: ${l.source||'Ikke angitt'}`).join('\n\n')||'Ingen registrert.'}\n\nJOURNALUTKAST\n${journalText()}\n\nUTSKRIVNING OG VIDERE OPPFØLGING\n${checkLines(DISCHARGE_CHECKS,state.discharge.checks)}\nMottakere: ${state.discharge.recipient||'Ikke angitt'}\nPasientinformasjon/forståelse: ${state.discharge.education||'Ikke angitt'}\nOppfølgingsplan: ${state.discharge.followup||'Ikke angitt'}\nUavklarte forhold: ${state.discharge.notes||'Ikke angitt'}\n\nGrunnlag: IMM Kompass, versjon 3.0. Datagrunnlag og lenkehistorikk finnes i kildeoversikten.\n`;
}
function reportModal(){modal('Samlet arbeidsnotat',`<div class="modalbody"><p class="formintro">Kontroller innholdet før eventuell overføring til godkjent journal.</p><pre class="report">${esc(noteText())}</pre></div>`,`<div class="modalfoot"><button data-action="copy-note">Kopier tekst</button><button data-action="export-text">Last ned</button><button class="primary" data-action="print">Skriv ut</button></div>`);}
function download(name,content,type='text/plain;charset=utf-8'){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function toast(t){$('#toast').textContent=t;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').textContent='',4500);}
function jumpCategory(cat){filters={q:'',cat,tags:[],mode:'any',fav:false,pediatric:false,access:''};route('library');}
function contextSearch(){
 const p=state.profile,tags=[];if(IMMCalc.number(p.age)>=65||p.frail)tags.push('alder');if(p.weight)tags.push('vekt');if(p.egfr||p.creatinine||p.dialysis)tags.push('nyre');if(p.fall)tags.push('fall');if(p.sonde)tags.push('sonde');
 filters={q:'',cat:'',tags,mode:'any',fav:false,pediatric:false,access:''};route('library');
}
function institution(){
 const proxy=DATA.audit.find(a=>a.id===72)?.original;
 modal('Tilgang via skole eller arbeidsplass',`<div class="modalbody"><p>Åpne ressursen i nettleseren der du vanligvis er innlogget. Bruk arbeidsplassens/skolens nett, VPN, bibliotekportal eller personlige konto etter din avtale.</p><ul class="bulletlist"><li>${external('https://www.helsebiblioteket.no/innhold/artikler/om-helsebiblioteket/oversikt-over-avtaler-og-tilgang-pa-helsebiblioteket.no','Helsebiblioteket – avtaler og tilgang')}</li><li>${external('https://www.uptodate.com/contents/search','UpToDate – direkte søk')}</li><li>${external('https://kidneydosing.uptodate.com/uptodate','UpToDate Kidney Dosing Tool – direkte inngang')}</li><li>${external('https://www.micromedexsolutions.com/micromedex2/librarian/ssl/true','Micromedex')}</li><li>${external('https://www.new.medicinescomplete.com/log-in/','MedicinesComplete')}</li>${proxy?`<li>${external(proxy,'UiT-proxy for MedicinesComplete (fra originalsamlingen)')}</li>`:''}</ul><p class="smalltext muted">Din konkrete lisens avgjør hvilke moduler du har. Logg inn direkte hos kilden eller gjennom bibliotekportalen.</p></div>`,`<div class="modalfoot"><button class="primary" data-action="close-modal">Lukk</button></div>`);
}
function calibration(){
 const cases=DATA.calibration||[];
 modal('Sammenlign med UpToDate',`<div class="modalbody"><p>Bruk samme formelår, koeffisient og enhet. Velg <strong>faktisk vekt</strong> i Cockcroft–Gault for disse testene. Alle er fiktive voksne med stabil nyrefunksjon, uten dialyse eller graviditet.</p><p class="smalltext sectiongap">Tallene er referanseberegninger fra de publiserte formlene. De er ikke målinger eller allerede bekreftede UpToDate-resultater.</p><div class="tablewrap sectiongap"><table class="datatable"><thead><tr><th>Test</th><th>Alder / kjønn</th><th>Kreatinin µmol/L</th><th>Cys mg/L</th><th>kg / cm</th><th>Åpne</th></tr></thead><tbody>${cases.map(c=>`<tr><td>${esc(c.id)}</td><td>${c.age} / ${c.sex==='female'?'K':'M'}</td><td>${c.creatinine}</td><td>${c.cystatin}</td><td>${c.weight} / ${c.height}</td><td><button class="small" data-action="test-case" data-id="${c.id}">Fyll inn</button></td></tr>`).join('')}</tbody></table></div><p class="smalltext sectiongap">«Fyll inn» erstatter kun kalkulatorens inndata. Det overskriver ikke legemidler eller LRP. Bruk gjerne en ny gjennomgang ved testing.</p><p class="smalltext sectiongap">Ved avvik: noter nøyaktig kalkulatornavn, årstall, alle inndata, valgt vekt og viste resultater. Vi retter dokumenterte feil; formlene justeres ikke vilkårlig for å treffe ett resultat.</p></div>`,`<div class="modalfoot"><button data-action="download-calibration">Last ned testsett med resultater</button><button class="primary" data-action="close-modal">Lukk</button></div>`);
}
function calibrationText(){
 return 'SAMMENLIGNING MED UPTODATE – FIKTIVE TESTDATA\nFormler: CKD-EPI kreatinin 2021, kreatinin+cystatin C 2021, cystatin C 2012, Cockcroft–Gault.\nStabil nyrefunksjon. CrCl bruker faktisk vekt. Ingen avrunding av kreatinin.\nResultater er beregnet lokalt fra publiserte formler; UpToDate-kolonnene fylles ut av deg.\n\n'+(DATA.calibration||[]).map(c=>{
 const r=IMMCalc.evaluate({...profileBlank(),...c,scrUnit:'umol',stability:'stable',cgWeightType:'actual'}),v=r.values;
 return `TEST ${c.id}\nAlder ${c.age} år, ${c.sex==='female'?'female / kvinne':'male / mann'}, kreatinin ${c.creatinine} µmol/L (= ${r.scrMgDl.toFixed(6)} mg/dL), cystatin C ${c.cystatin} mg/L, vekt ${c.weight} kg, høyde ${c.height} cm.\nVårt eGFRcr: ${fmt(v.cr)} ml/min/1,73 m² | UpToDate: ____\nVårt eGFRcr-cys: ${fmt(v.combined)} ml/min/1,73 m² | UpToDate: ____\nVårt eGFRcys: ${fmt(v.cys)} ml/min/1,73 m² | UpToDate: ____\nVårt CrCl: ${fmt(v.cg)} ml/min | UpToDate: ____\nBSA: ${fmt(v.bsa,4)} m²\nAbsolutt eGFRcr / cr-cys / cys: ${fmt(v.cr*v.bsa/1.73)} / ${fmt(v.combined*v.bsa/1.73)} / ${fmt(v.cys*v.bsa/1.73)} ml/min.\nKommentar/formelår/avrunding/vekt: ____`;
 }).join('\n\n');
}
function updateBound(target){
 const path=target.dataset.bind;if(!path)return;
 if(page==='renal'&&['age','sex','creatinine','scrUnit','cystatin','stability','dialysis','pregnant'].some(k=>path==='profile.'+k))state.profile.egfrMode='auto';
 if(path==='profile.egfr'){state.profile.egfrMode='manual';state.profile.egfrMethod='Manuelt registrert';}
 if(/^meds\.\d+\.reconciliation$/.test(path)&&target.value==='Avklart'){
  const m=state.meds[Number(path.split('.')[1])],d=discrepancy(m);
  if(d.missing||d.different&&!m.resolution?.trim()){target.value=m.reconciliation||'Ikke avklart';toast(d.missing?'Registrer dosering fra kildene og faktisk bruk før avklaring.':'Beskriv beslutning og ansvarlig før avviket markeres avklart.');return;}
 }

 if(path==='profile.scrUnit'&&state.profile.scrUnit!==target.value){
   const old=IMMCalc.number(state.profile.creatinine);
   if(old!==null&&old>0){state.profile.creatinine=String(state.profile.scrUnit==='umol'?old/88.4:old*88.4);const e=$('[data-bind="profile.creatinine"]');if(e)e.value=state.profile.creatinine;}
 }
 if(path==='lms.confirmed'&&target.checked&&(!state.lms.sourceList.length||state.meds.some(m=>m.reconciliation!=='Avklart'||discrepancy(m).missing))){target.checked=false;toast('Avklar legemidlene og registrer kilder før du bekrefter samstemmingen.');return;}
 set(path,target.type==='checkbox'?target.checked:target.value);
 if(path==='profile.sex'){
  if(target.value!=='male'){state.lms.interview=state.lms.interview.filter(i=>i!==8);markChanged();}
  if($('#interview-checks'))$('#interview-checks').innerHTML=interviewChecks();
 }
 if(path.startsWith('lms.sourceList.')){
  for(const m of state.meds)m.reconciliation='Ikke avklart';
  state.lms.confirmed=false;
  const confirmed=$('[data-bind="lms.confirmed"]');if(confirmed)confirmed.checked=false;
  if(path.endsWith('.type')){const i=Number(path.split('.')[2]);state.lms.sourceList[i].name=SOURCE_TYPES.find(x=>x[0]===target.value)?.[1]?.replace(/^[A-Z]+ – /,'')||'Kilde';const name=$('[data-bind="lms.sourceList.'+i+'.name"]');if(name)name.value=state.lms.sourceList[i].name;}
  const row=target.closest('.source-row'),src=state.lms.sourceList[Number(path.split('.')[2])];if(row?.querySelector('button'))row.querySelector('button').setAttribute('aria-label','Fjern kilde '+src.name);markChanged();if($('#med-comparison')){$('#med-comparison').innerHTML=medTable();requestAnimationFrame(drawInteractionLines);}if(path.endsWith('.type')||path.endsWith('.relation'))render();
 }
 if(path==='lms.reporterId'){for(const m of state.meds)m.reconciliation='Ikke avklart';state.lms.confirmed=false;markChanged();render();}
 if(path.startsWith('meds.')){state.lms.confirmed=false;markChanged();const row=target.closest('tr'),m=state.meds[Number(path.split('.')[1])];row?.classList.toggle('unresolved-row',discrepancy(m).different&&m.reconciliation!=='Avklart');const c=$('[data-bind="lms.confirmed"]');if(c)c.checked=false;}
 if(path.startsWith('lrps.')&&path.endsWith('.implemented')){const section=target.closest('.journal-entry')?.querySelector('.journal-measure');if(section)section.hidden=!target.checked;}
 if($('#journal-live'))$('#journal-live').textContent=journalText();
 if(path.startsWith('journal.entries.')&&path.endsWith('.implemented')){
  const section=target.closest('.journal-entry')?.querySelector('.journal-measure');
  if(section)section.hidden=!target.checked;
 }
 if(['profile.age','profile.fall','profile.endOfLife','profile.frailAdl','profile.frailIrreversible','profile.frailPrognosis'].includes(path))refreshOlder();
 if(path.startsWith('profile.')){
  const ef=$('[data-bind="profile.egfr"]');if(ef&&path!=='profile.egfr')ef.value=state.profile.egfr;
  if($('#egfr-badge'))$('#egfr-badge').innerHTML=renalBadge(state.profile.egfr);
  if($('#egfr-method'))$('#egfr-method').textContent=state.profile.egfrMethod||'Ikke angitt';
  if($('#creatinine-badge'))$('#creatinine-badge').innerHTML=renalBadge(state.profile.creatinine,'creatinine');

  if($('#renal-results'))$('#renal-results').innerHTML=renalResults();
  if($('#context-alerts'))$('#context-alerts').innerHTML=contextAlerts();
 }
}
document.addEventListener('input',e=>{
 const t=e.target;
 captureDraft(t);
 if(t.dataset.bind&&t.tagName!=='SELECT'&&t.type!=='checkbox')updateBound(t);
 if(t.id==='resource-search'){filters.q=t.value;$('#resource-results').innerHTML=resourceResults();}
 if(t.id==='audit-search'){auditFilter.q=t.value;$('#audit-results').innerHTML=auditResults();}
});
document.addEventListener('change',e=>{
 const t=e.target;
 captureDraft(t);
 if(t.name==='implemented'&&$('#lrp-measure'))$('#lrp-measure').hidden=!t.checked;
 if(t.dataset.bind)updateBound(t);
 if(t.dataset.review!==undefined){
  const i=+t.dataset.review;state.review[i].checked=t.checked;markChanged();
  t.closest('.reviewitem').classList.toggle('done',t.checked);
  const n=state.review.filter(x=>x.checked).length;$('#review-count').textContent=`${n} av 10 vurdert`;$('#review-progress').value=n;
 }
 if(t.dataset.list){const current=get(t.dataset.list),i=+t.dataset.index;set(t.dataset.list,t.checked?[...new Set([...current,i])]:current.filter(x=>x!==i));}
 if(t.id==='resource-category')filters.cat=t.value;
 if(t.id==='resource-access')filters.access=t.value;
 if(t.id==='resource-mode')filters.mode=t.value;
 if(t.id==='resource-fav')filters.fav=t.checked;
 if(t.id==='resource-pediatric')filters.pediatric=t.checked;
 if(t.id.startsWith('resource-')&&t.id!=='resource-search')$('#resource-results').innerHTML=resourceResults();
 if(t.id==='audit-status'){auditFilter.status=t.value;$('#audit-results').innerHTML=auditResults();}
});
document.addEventListener('submit',submitWorkflowForm);
async function copyNote(){
 try{await navigator.clipboard.writeText(noteText());toast('Arbeidsnotatet er kopiert.');}
 catch{const a=document.createElement('textarea');a.value=noteText();a.style.position='fixed';a.style.opacity='0';document.body.append(a);a.select();const ok=document.execCommand('copy');a.remove();toast(ok?'Arbeidsnotatet er kopiert.':'Kopiering ble blokkert. Bruk «Last ned».');}
}
function exportJson(){download('IMM-arbeidsokt.json',JSON.stringify({format:'IMM-Kompass',version:3,state,drafts},null,2),'application/json');toast('Arbeidsøkten er eksportert som lokal fil.');}
function importJson(){
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
 input.onchange=async()=>{
  const f=input.files?.[0];if(!f)return;
  try{
   if(f.size>3_000_000)throw Error('Filen er for stor (maks 3 MB).');
   const raw=JSON.parse(await f.text()),imported=cleanImported(raw,true),importedDrafts=cleanDrafts(raw.drafts);
   modal('Importer som ny gjennomgang?',`<div class="modalbody"><p>Filen inneholder ${imported.meds.length} legemidler og ${imported.lrps.length} LRP og ${imported.journal.entries.filter(e=>e.lrp).length} journalpunkter. Importen opprettes som en egen gjennomgang. Eksisterende gjennomganger beholdes.</p></div>`,`<div class="modalfoot"><button data-action="close-modal">Avbryt</button><button class="primary" id="confirm-import">Importer</button></div>`);
   $('#confirm-import').onclick=()=>{if(startNewReview(imported,importedDrafts))$('#modal').close();};
  }catch(err){toast(`Kunne ikke importere: ${err.message}`);}
 };input.click();
}
document.addEventListener('click',async e=>{
 const t=e.target.closest('[data-action]');if(!t)return;
 const a=t.dataset.action,id=t.dataset.id;
 if(await workflowAction(a,t))return;
 if(sessionAction(a,t))return;
 if(a==='theme'){
  const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(theme);
  try{localStorage.setItem('imm-theme-v1',theme);}catch{}
 }
 if(a.startsWith('journal-')){await journalAction(a,t);return;}
 if(a==='route')route(t.dataset.page);

 
 if(a==='close-modal')$('#modal').close();
 if(a==='category')jumpCategory(t.dataset.cat);
 if(a==='context-search')contextSearch();
 if(a==='dose-sources'){sourceContext={priority:'dose'};filters={q:'',cat:'',tags:['nyre'],mode:'any',fav:false,pediatric:false,access:''};route('library');}
 if(a==='tag'){const tag=t.dataset.tag;filters.tags=filters.tags.includes(tag)?filters.tags.filter(x=>x!==tag):[...filters.tags,tag];t.classList.toggle('active',filters.tags.includes(tag));t.setAttribute('aria-pressed',String(filters.tags.includes(tag)));$('#resource-results').innerHTML=resourceResults();}
 if(a==='clear-filters'){filters={q:'',cat:'',tags:[],mode:'any',fav:false,pediatric:false,access:''};render();}
 if(a==='favorite'){
  favorites.has(id)?favorites.delete(id):favorites.add(id);try{localStorage.setItem('imm-favorites-v1',JSON.stringify([...favorites]));}catch{toast('Favoritten beholdes bare i denne fanen. Nettleseren blokkerer lokal lagring.');}
  $('#resource-results').innerHTML=resourceResults();
 }
 if(a==='add-med')medModal();
 if(a==='edit-med')medModal(id);
 if(a==='remove-med'){state.meds=state.meds.filter(x=>x.id!==id);markChanged();$('#modal').close();render();toast('Legemiddel fjernet.');}
 if(a==='add-lrp')lrpModal('',+(t.dataset.type||0));
 if(a==='edit-lrp')lrpModal(id);
 if(a==='source-lrp'){const r=DATA.resources.find(x=>x.id===id);lrpModal('',(REVIEW.findIndex(x=>x.cat===r.category)<0?9:REVIEW.findIndex(x=>x.cat===r.category)),`${r.title}\n${r.directUrl||r.url}`);}
 if(a==='remove-lrp'){
  modal('Fjern dette LRP?',`<div class="modalbody"><p>Oppføringen fjernes fra denne arbeidsøkten.</p></div>`,`<div class="modalfoot"><button data-action="close-modal">Avbryt</button><button class="danger" data-action="confirm-remove-lrp" data-id="${id}">Fjern LRP</button></div>`);
 }
 if(a==='confirm-remove-lrp'){state.lrps=state.lrps.filter(x=>x.id!==id);delete drafts['lrp:'+id];markChanged();$('#modal').close();render();}
 if(a==='report')reportModal();
 if(a==='export-text')download('IMM-arbeidsnotat.txt',noteText());
 if(a==='copy-note')await copyNote();
 if(a==='export-json')exportJson();
 if(a==='import-json')importJson();
 if(a==='print'&&page==='journal'){const error=journalValidation();if(error){toast(error);return;}$('#printcontent').innerHTML=`<pre>${esc(journalText())}</pre>`;window.print();return;}
 if(a==='print'){$('#printcontent').innerHTML=`<h1>IMM · arbeidsnotat</h1><p class="printnote">Utkast til faglig vurdering. Kontrollér før journalføring. Ingen automatiske doseanbefalinger.</p><pre>${esc(noteText())}</pre>`;window.print();}
 if(a==='pdf'){
  const d=DATA.documents[+t.dataset.index],bytes=Uint8Array.from(atob(d.base64),c=>c.charCodeAt(0)),url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const win=window.open(url,'_blank');if(!win)download(d.name,bytes,'application/pdf');setTimeout(()=>URL.revokeObjectURL(url),120000);
 }
 if(a==='export-audit')download('IMM-lenkelogg.json',JSON.stringify(DATA.audit,null,2),'application/json');
 if(a==='audit-resource'){
  const r=DATA.resources.find(x=>x.id===id),items=DATA.audit.filter(x=>r.ids.includes(x.id));
  modal('Opprinnelige lenker',`<div class="modalbody">${items.map(x=>`<h3>#${x.id} · ${esc(x.outcome)}</h3><p class="smalltext" style="overflow-wrap:anywhere;margin:8px 0 16px">${isWeb(x.original)?external(x.original,x.original):esc(x.original)}<br>${esc(x.note)}</p>`).join('')}</div>`,`<div class="modalfoot"><button data-action="close-modal">Lukk</button></div>`);
 }
 if(a==='convert-body'){
  modal('Konverter vekt og høyde',`<div class="modalbody"><p class="formintro">1 lb = 0,45359237 kg. 1 tomme = 2,54 cm. Tomme felt beholdes som de er.</p><div class="formgrid"><label class="field">Vekt (lb)<input id="weight-lb" inputmode="decimal"></label><label class="field">Høyde (tommer)<input id="height-in" inputmode="decimal"></label></div></div>`,`<div class="modalfoot"><button data-action="close-modal">Avbryt</button><button class="primary" data-action="apply-body">Konverter og bruk</button></div>`);
 }
 if(a==='apply-body'){
  const w=$('#weight-lb').value.trim(),h=$('#height-in').value.trim(),wn=IMMCalc.number(w),hn=IMMCalc.number(h);
  if((w&&!(wn>0&&wn*.45359237<=1000))||(h&&!(hn>0&&hn*2.54<=300))){toast('Kontroller tallene før konvertering.');return;}
  if(w)state.profile.weight=String(wn*.45359237);if(h)state.profile.height=String(hn*2.54);
  markChanged();$('#modal').close();route('renal');toast('Vekt og høyde er omregnet til kg og cm.');
 }
 if(a==='institution')institution();
 if(a==='calibration')calibration();
 if(a==='download-calibration')download('IMM-sammenligning-UpToDate.txt',calibrationText());
 if(a==='test-case'){
  const c=DATA.calibration.find(x=>x.id===id);if(c){Object.assign(state.profile,c,{scrUnit:'umol',stability:'stable',cgWeightType:'actual',dialysis:false,pregnant:false});markChanged();$('#modal').close();route('renal');toast(`Fiktiv test ${id} er lagt inn.`);}
 }
});
document.addEventListener('pointerdown',e=>{const menu=$('#tools-menu');if(menu?.open&&!menu.contains(e.target))menu.open=false;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#tools-menu'))$('#tools-menu').open=false;});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
if(resourceOnly){page='library';document.body.classList.add('source-only');const topic=queryParams.get('topic');if(topic==='eldre'){filters.tags=['alder','seponering'];}if(['seponering','nyre'].includes(topic)){filters.tags=[topic];}if(queryParams.has('interactions')){filters.cat='Interaksjoner';sourceContext.showAll=true;}}else initReviewStorage();
render();
initSync();
