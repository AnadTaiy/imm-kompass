/* PIPC Table 1 (Rochon et al. 2025), CC BY 4.0. Norwegian paraphrases and
 * conservative ATC/indication matching are local, unvalidated adaptations.
 * No network, patient storage, diagnosis inference, or prescribing actions. */
(function(root){
'use strict';
const source='https://pmc.ncbi.nlm.nih.gov/articles/PMC12712104/';
const correction='https://pmc.ncbi.nlm.nih.gov/articles/PMC12945913/';
const groups={
 ace:['ACE-hemmer','C09A C09B'], bp:['Blodtrykksmiddel','C02 C03 C07 C08 C09'],
 beta:['Betablokker','C07'], ccb:['Kalsiumantagonist','C08'], diuretic:['Diuretikum','C03'],
 goutDiuretic:['Tiazid-/loopdiuretikum','C03AA C03AB C03BA C03CA C03EA C03EB'],
 statin:['Statin','C10AA C10BA C10BX'], digoxin:['Digoksin','C01AA05'], midodrine:['Midodrin','C01CA17'],
 cough:['Hostemiddel','R05D'], antiemetic:['Kvalmestillende','A04A A03FA01 A03FA03 A03FA05 R06AD02 R06AE03 R06AE05'],
 antidepressant:['Antidepressivum','N06A'], erectile:['Middel mot erektil dysfunksjon','G04BE'],
 laxative:['Avføringsmiddel','A06A'], gout:['Urinsyregiktmiddel','M04A'], bladder:['Middel mot overaktiv blære','G04BD'],
 pain:['Smertestillende','N02A N02BA N02BB N02BE M01A'], mineral:['Mineraltilskudd','A12'], quinine:['Kinin','P01BC01'],
 sleep:['Sovemiddel','N05C'], anticonvulsant:['Antiepileptikum','N03A N02BF'], topicalSteroid:['Kortikosteroid til huden','D07'],
 antipsychotic:['Antipsykotikum','N05A','N05AN'], parkinson:['Antiparkinsonmiddel','N04'], antimuscarinicParkinson:['Antikolinergt antiparkinsonmiddel','N04A'],
 sedative:['Sedativum','N05BA N05CD'], arrhythmia:['Antiarytmikum','C01B'], glucose:['Blodglukosesenkende middel','A10'],
 benzo:['Benzodiazepin','N05BA N05CD N03AE'], chei:['Kolinesterasehemmer','N06DA'],
 bismuth:['Vismutsubsalicylat','A07BB'], antidiarrheal:['Diarémiddel','A07DA'], antihistamine:['Antihistamin','R06A'],
 dopaminergic:['Dopaminergt antiparkinsonmiddel','N04B'], gabapentinoid:['Gabapentinoid','N02BF N03AX12 N03AX16'],
 ssriSnri:['SSRI/SNRI','N06AB N06AX16 N06AX21 N06AX23'], tca:['Trisyklisk antidepressivum','N06AA01 N06AA02 N06AA03 N06AA04 N06AA06 N06AA07 N06AA08 N06AA09 N06AA10 N06AA11 N06AA12 N06AA14 N06AA15 N06AA16 N06AA18 N06AA23'],
 flunarizine:['Flunarizin','N07CA03'], lithium:['Litium','N05AN01'], venlafaxine:['Venlafaksin','N06AX16'],
 dpp4:['DPP-4-hemmer','A10BH'], nsaid:['Systemisk NSAID','M01A'], sglt2:['SGLT2-hemmer','A10BK'],
 antifungal:['Soppmiddel','J02A G01AF D01A'], metformin:['Metformin','A10BA02'], glitazone:['Pioglitazon/rosiglitazon','A10BG02 A10BG03'], rosiglitazone:['Rosiglitazon','A10BG02'],
 anticholinergicEmetic:['Antikolinergt kvalmestillende','A04AD01 R06AD02 R06AE03 R06AE05'],
 antidopaminergicEmetic:['Dopaminantagonist mot kvalme','A03FA01 A03FA03 A03FA05'],
 alpha:['Alfa-1-blokker','G04CA C02CA'], ppi:['Protonpumpehemmer','A02BC01 A02BC02 A02BC03 A02BC04 A02BC05 A02BC06 A02BC07 A02BC11 A02BC51 A02BC53 A02BC54'], vitamin:['Vitamintilskudd','A11 A12AX'],
 bisphosphonate:['Peroralt bisfosfonat','M05BA M05BB'], gastro:['Syredempende / slimhinnebeskyttende middel','A02B'],
 heartFailure:['Hjertesviktmiddel','C03 C07 C09 A10BK'], opioid:['Opioid','N02A'],
 vestibular:['Middel mot vertigo','N07CA R06AE03 R06AE05'], bladderAnticholinergic:['Antikolinergt blæremiddel','G04BD','G04BD12 G04BD13 G04BD15'],
 saliva:['Spytterstatning',''], unknown:['Legemiddel B er uklart angitt',''], carbapenem:['Karbapenem','J01DH'], steroid:['Systemisk kortikosteroid','H02AB'],
 acitretin:['Acitretin','D05BB02'], erythromycin:['Systemisk erytromycin','J01FA01'], fludrocortisone:['Fludrokortison','H02AA02'], iron:['Peroralt jerntilskudd','B03AA B03AB B03AD']
};
// Known combination ATCs: exact ingredient groups, never every A10BD/C09D.
const combinations={
 ace:'C10BX04 C10BX06 C10BX07 C10BX11 C10BX12 C10BX13 C10BX14 C10BX15 C10BX17 C10BX18 C10BX21 C10BX23',
 ccb:'C09BB C09DB C09DX01 C09DX03 C09DX06 C09DX07 C09DX08 C09DX09 C07FB C10BX03 C10BX07 C10BX09 C10BX11 C10BX14 C10BX18 C10BX19 C10BX23 C10BX24',
 metformin:'A10BD02 A10BD03 A10BD05 A10BD07 A10BD08 A10BD10 A10BD11 A10BD13 A10BD14 A10BD15 A10BD16 A10BD17 A10BD18 A10BD20 A10BD22 A10BD23 A10BD25 A10BD26 A10BD27 A10BD28 A10BD31 A10BD34',
 dpp4:'A10BD07 A10BD08 A10BD09 A10BD10 A10BD11 A10BD12 A10BD13 A10BD18 A10BD19 A10BD21 A10BD22 A10BD24 A10BD25 A10BD27 A10BD28 A10BD29 A10BD30 A10BD31',
 sglt2:'A10BD15 A10BD16 A10BD19 A10BD20 A10BD21 A10BD23 A10BD24 A10BD25 A10BD27 A10BD29 A10BD30 A10BD31 A10BD32 A10BD33 A10BD34',
 glitazone:'A10BD03 A10BD04 A10BD05 A10BD06 A10BD09 A10BD12 A10BD33', rosiglitazone:'A10BD03 A10BD04'
};
// A matching word is evidence of a recorded indication, not of causation.
const events={
 cough:['Hoste','hoste|tørrhoste|cough'], dizzy:['Ortostatisk hypotensjon / svimmelhet','ortostatisk hypotensjon|ortostatisme|svimmelhet|svimmel|dizziness|vertigo'],
 depression:['Depressive symptomer','depresjon|depressive symptomer|depression',true], erectile:['Erektil dysfunksjon','erektil dysfunksjon|ereksjonssvikt|impotens|erectile dysfunction'],
 edema:['Perifert ødem','perifert ødem|perifere ødemer|ødem|ødemer|ankelødem|ankelødemer|hovne ankler|hevelse i ben|hevelse i beina|edema|oedema'],
 constipation:['Forstoppelse','forstoppelse|obstipasjon|constipation'], gout:['Urinsyregikt / hyperurikemi','urinsyregikt|podagra|hyperurikemi|gout|hyperuricemia'],
 incontinence:['Urininkontinens','urininkontinens|urgeinkontinens|overaktiv blære|urinary incontinence|overactive bladder'],
 myalgia:['Muskelsmerter / myositt','muskelsmerter|myalgi|myositt|muskelverk|myalgia|myositis'], insomnia:['Søvnvansker','søvnvansker|søvnløshet|insomni|insomnia'],
 nausea:['Kvalme','kvalme|nausea'], hypertension:['Ny / forverret hypertensjon','hypertensjon|høyt blodtrykk|blodtrykksstigning|hypertension|HT',true],
 rash:['Hudutslett','utslett|hudutslett|rash'], eps:['Ekstrapyramidale symptomer','ekstrapyramidale symptomer|ekstrapyramidale bivirkninger|parkinsonisme|extrapyramidal symptoms'],
 akathisia:['Akatisi / tardive bevegelser','akatisi|tardive bevegelser|tardiv dyskinesi|akathisia|tardive dyskinesia'],
 arrhythmia:['Ny / forverret arytmi','arytmi|hjerterytmeforstyrrelse|arrhythmia',true], hyperglycemia:['Ny / forverret hyperglykemi','hyperglykemi|hyperglycemia|høyt blodsukker',true],
 cognition:['Ny / forverret kognitiv svikt','kognitiv svikt|hukommelsessvikt|cognitive impairment',true],
 gi:['Mage-/tarmplager','kvalme|mageplager|dyspepsi|gastrointestinal upset|nausea'], diarrhea:['Diaré','diaré|diare|diarré|diarrhea|diarrhoea'],
 rhinorrhea:['Rennende nese','rennende nese|rhinoré|rhinore|rhinorrhea'], psychosis:['Psykose / hallusinasjoner','psykose|hallusinasjoner|psychosis|hallucinations',true],
 tremor:['Tremor','tremor|skjelving'], joint:['Leddsmerter','leddsmerter|artralgi|joint pain'],
 genitalFungus:['Genital soppinfeksjon','genital soppinfeksjon|underlivssopp|vaginal candidiasis|vaginal soppinfeksjon|vulvovaginal candidiasis|candidabalanitt|genital candidiasis'],
 vaginalFungus:['Vulvovaginal soppinfeksjon','vaginal candidiasis|vaginal soppinfeksjon|vulvovaginal candidiasis|vulvovaginal soppinfeksjon'],
 failure:['Ny / forverret hjertesvikt','hjertesvikt|heart failure',true], retention:['Urinretensjon','urinretensjon|urinary retention'],
 bone:['Osteoporose / lavenergibrudd','osteoporose|lavenergibrudd|osteoporosis|fragility fracture',true],
 deficiency:['Vitamin-/mineralmangel','vitaminmangel|mineralmangel'], gastritis:['Gastritt','gastritt|gastritis'],
 ulcer:['Gastritt / magesår / gastrointestinal blødning','gastritt|magesår|ventrikkelsår|duodenalsår|gastrointestinal blødning|gastritis|gastric ulcer|gastrointestinal bleed'],
 dryMouth:['Munntørrhet','munntørrhet|xerostomi|dry mouth'], seizure:['Nye krampeanfall','krampeanfall|epileptisk anfall|seizures',true]
};
// Numbering follows the 65 rows of Table 1; stable IDs are local identifiers.
const rows=[
 ['ace','cough','cough'],['bp','dizzy','antiemetic'],['beta','depression','antidepressant'],['beta','erectile','erectile'],['ccb','edema','diuretic'],['ccb','constipation','laxative'],['goutDiuretic','gout','gout'],['diuretic','incontinence','bladder'],['statin','myalgia','pain'],['statin','myalgia','mineral'],['statin','myalgia','quinine'],['statin','insomnia','sleep'],['digoxin','nausea','antiemetic'],['midodrine','hypertension','bp'],
 ['anticonvulsant','rash','topicalSteroid'],['anticonvulsant','nausea','antiemetic'],['antipsychotic','eps','beta'],['antipsychotic','eps','parkinson'],['antipsychotic','eps','antimuscarinicParkinson'],['antipsychotic','akathisia','sedative'],['antipsychotic','arrhythmia','arrhythmia'],['antipsychotic','hyperglycemia','glucose'],['benzo','cognition','chei'],['chei','incontinence','bladder'],['chei','insomnia','sleep'],['chei','gi','antiemetic'],['chei','gi','bismuth'],['chei','diarrhea','antidiarrheal'],['chei','rhinorrhea','antihistamine'],['dopaminergic','psychosis','antipsychotic'],['gabapentinoid','edema','diuretic'],['ssriSnri','incontinence','bladder'],['tca','cognition','chei'],['tca','constipation','laxative'],['tca','incontinence','bladder'],['flunarizine','depression','antidepressant'],['lithium','eps','parkinson'],['venlafaxine','hypertension','bp'],['venlafaxine','tremor','benzo'],
 ['dpp4','joint','nsaid'],['sglt2','genitalFungus','antifungal'],['metformin','diarrhea','antidiarrheal'],['glitazone','edema','diuretic'],['rosiglitazone','failure','diuretic'],
 ['anticholinergicEmetic','retention','alpha'],['antidopaminergicEmetic','eps','parkinson'],['laxative','diarrhea','antidiarrheal'],['ppi','bone','vitamin'],['ppi','deficiency','unknown'],
 ['bisphosphonate','gastritis','gastro'],['nsaid','ulcer','gastro'],['nsaid','nausea','antiemetic'],['nsaid','hypertension','bp'],['nsaid','failure','heartFailure'],['opioid','depression','antidepressant'],
 ['alpha','dizzy','vestibular'],['bladderAnticholinergic','dryMouth','saliva'],
 ['carbapenem','seizure','anticonvulsant'],['steroid','insomnia','sleep'],['steroid','psychosis','antipsychotic'],['steroid','hypertension','bp'],['acitretin','vaginalFungus','antifungal'],['erythromycin','arrhythmia','arrhythmia'],['fludrocortisone','hypertension','bp'],['iron','constipation','laxative']
];
const disabled={27:'Vismutsubsalicylat kan ikke identifiseres sikkert med en egen kode i dette FEST-uttrekket.',49:'Legemiddel B er uklart angitt i den publiserte tabellen. Ingen automatisk tolkning.',57:'Spytterstatninger har ikke et tilstrekkelig presist ATC-grunnlag i denne versjonen.'};
const areas=['Hjerte og kar','Sentralnervesystemet','Endokrine sykdommer','Mage og tarm','Muskel og skjelett','Urinveier','Andre terapiområder'];
const rules=rows.map(([a,event,b],i)=>({id:'PIPC-'+String(i+1).padStart(2,'0'),a,event,b,area:areas[i<14?0:i<39?1:i<44?2:i<49?3:i<55?4:i<57?5:6],minAge:65,disabled:disabled[i+1]||''}));
const norm=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ø/g,'o').replace(/æ/g,'ae');
const prefixes=s=>s?s.split(' '):[];
const matchesAtc=(code,list)=>prefixes(list).some(p=>code.startsWith(p));
function groupMatch(m,key){
 const code=String(m.atc||'').trim().toUpperCase(),g=groups[key];
 if(!/^[A-Z]\d{2}[A-Z]{2}\d{2}$/.test(code)||!g||matchesAtc(code,g[2]))return false;
 if(!matchesAtc(code,g[1])&&!matchesAtc(code,combinations[key]))return false;
 // Route-specific cascades: topical/IV products must not inherit oral effects.
 if(key==='bisphosphonate'&&!/tablett|kapsel|mikstur|oral/.test(norm(m.form||m.name)))return false;
 if(key==='iron'&&/infusjon|injeksjon|intraven|parenteral/.test(norm(m.form||m.name)))return false;
 return true;
}
const negative=/\b(ikke|ingen|uten|avkrefte[tr]?|benekter|fravaer|no|not|without|denies|tidligere|historisk|opphort|resolved)\b/;
const preventive=/\b(profylakse|profylaktisk|forebygg\w*|prevent\w*|prophylax\w*)\b/;
const changed=/\b(ny|nye|nyoppstatt|nyoppstatte|forverret|forverring|okende|oppstatt|utlost|bivirkning|legemiddelutlost|new|worsening|induced)\b/;
function evidence(text,event){
 const definition=events[event];if(!definition)return '';
 // Work clause by clause: a negated word never counts as a positive symptom.
 for(const clause of String(text||'').split(/[.;\n]/)){
  const n=norm(clause).replace(/ikke klassifisert annet sted/g,'');if(negative.test(n)||preventive.test(n)||/\b(mor|far|familie|mother|father|family)\b/.test(n))continue;
  const re=new RegExp('(?:^|[^a-z0-9])(?:'+norm(definition[1])+')(?=$|[^a-z0-9])');
  if(re.test(n)&&(!definition[2]||changed.test(n)))return clause.trim();
 }
 return '';
}
function active(m){return !['Pausert','Seponert'].includes(m.status)&&m.schedule!=='Bruker ikke'&&!['0','S'].includes(String(m.actualDose??m.dose??'').trim().toUpperCase());}
function findings(meds,profile={},diagnoses=[]){
 const age=Number(String(profile.age??'').replace(',','.'));if(!Number.isFinite(age)||age<65||age>=140)return [];
 const current=meds.filter(active),found=[];
 for(const r of rules){if(r.disabled)continue;
  const causes=current.filter(m=>groupMatch(m,r.a));if(!causes.length)continue;
  for(const b of current){if(!groupMatch(b,r.b))continue;const reason=evidence(b.indication,r.event);if(!reason)continue;
   // Localized edema alone is not proof of a drug effect. Explicit alternatives
   // in this same indication suppress the peripheral-edema cascade.
   if(r.event==='edema'&&/hjertesvikt|nyresvikt|levercirrhose|lymfodem|lungeodem|heart failure|renal failure/.test(norm(b.indication)))continue;
   for(const a of causes){if(a.id===b.id)continue;
    const da=Number(a.durationWeeks),db=Number(b.durationWeeks);
    if(a.durationWeeks!==''&&b.durationWeeks!==''&&da>0&&db>da)continue; // treatment B predates A
    found.push({rule:r.id,a:a.id,b:b.id,event:r.event,indication:reason,corroboration:diagnoses.map(d=>evidence(d.text,r.event)).filter(Boolean)});
   }
  }
 }
 return found;
}
const api={source,correction,groups,events,rules,groupMatch,evidence,active,findings};
if(typeof module==='object'&&module.exports)module.exports=api;
if(root)root.IMMCascade=api;
})(typeof window!=='undefined'?window:null);
