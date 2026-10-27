function cleanImported(raw,preserveIds=false){
 if(raw?.format!=='IMM-Kompass'||![1,2,3].includes(raw.version)||!raw.state)throw Error('Ukjent filformat.');
 const s=raw.state,b=blank(),str=v=>typeof v==='string'?v.slice(0,30000):'',id=v=>preserveIds&&typeof v==='string'&&/^[\w-]{1,100}$/.test(v)?v:uid();
 b.diagnosisList=(Array.isArray(s.diagnosisList)?s.diagnosisList:[]).slice(0,200).map(d=>({id:id(d.id),system:['ICD-10','ICPC-2'].includes(d.system)?d.system:'',code:str(d.code),text:str(d.text)}));
 for(const k of ['clinicalFacts','chaReview'])b[k]=Object.fromEntries(Object.entries(s[k]||{}).filter(([key])=>/^[A-Za-z][A-Za-z0-9]{0,60}$/.test(key)&&!['constructor','prototype','__proto__'].includes(key)).map(([key,v])=>[key,str(v)]));
 // Imported criterion confirmations are deliberately reset: IDs and source context can change.
 b.startReviews=preserveIds&&s.startReviews&&typeof s.startReviews==='object'?JSON.parse(JSON.stringify(s.startReviews)):{};
 b.criterionChecks=preserveIds&&s.criterionChecks&&typeof s.criterionChecks==='object'?JSON.parse(JSON.stringify(s.criterionChecks)):{};
 const indices=(v,n)=>Array.isArray(v)?[...new Set(v.filter(x=>Number.isInteger(x)&&x>=0&&x<n))]:[];
 for(const k of Object.keys(b.profile))b.profile[k]=typeof b.profile[k]==='boolean'?s.profile?.[k]===true:str(s.profile?.[k]);
 if(!/^\d{0,6}$/.test(b.profile.patientNumber))b.profile.patientNumber='';
 if(!['umol','mgdl'].includes(b.profile.scrUnit))b.profile.scrUnit='umol';if(!['','female','male'].includes(b.profile.sex))b.profile.sex='';
 if(!['','stable','unstable'].includes(b.profile.stability))b.profile.stability='';if(!['','actual','ideal','adjusted','other'].includes(b.profile.cgWeightType))b.profile.cgWeightType='';
 for(const k of ['sources','discrepancies','notes'])b.lms[k]=str(s.lms?.[k]);
 b.profile.egfrMode=s.profile?.egfrMode==='auto'?'auto':s.profile?.egfr?'manual':'auto';
 b.lms.confirmed=s.version===3&&s.lms?.confirmed===true;b.lms.checks=indices(s.lms?.checks,LMS_CHECKS.length);b.lms.interview=indices(s.lms?.interview,INTERVIEW.length);b.lms.supportChecks=indices(s.lms?.supportChecks,SUPPORT.length);
 for(const [id,value] of Object.entries(s.startChecks||{}))if(olderCriteria.get(id)?.tool==='START'&&['','review','covered','irrelevant','contra'].includes(value))b.startChecks[id]=value;
 const sourceIdMap=new Map();
 if(Array.isArray(s.lms?.sourceList)){
  if(s.lms.sourceList.length>100)throw Error('For mange kilder.');
  const used=new Set();b.lms.sourceList=s.lms.sourceList.filter(x=>x.type!=='P').map(x=>{let safe=id(x.id);if(used.has(safe))safe=uid();used.add(safe);sourceIdMap.set(x.id,safe);return {id:safe,type:SOURCE_TYPES.some(t=>t[0]===x.type)?x.type:'Annet',name:str(x.name),date:str(x.date),note:str(x.note),relation:str(x.relation),relationOther:str(x.relationOther)};});
 }
 b.lms.reporterId=sourceIdMap.get(s.lms?.reporterId)||'';
 b.review=b.review.map((r,i)=>({checked:s.review?.[i]?.checked===true,note:str(s.review?.[i]?.note),sub:indices(s.review?.[i]?.sub,REVIEW_SUB[i]?.length||0)}));
 for(const k of Object.keys(b.discharge))b.discharge[k]=k==='checks'?indices(s.discharge?.checks,DISCHARGE_CHECKS.length):str(s.discharge?.[k]);
 if(!Array.isArray(s.meds)||!Array.isArray(s.lrps)||s.meds.length>500||s.lrps.length>500)throw Error('Ugyldig antall legemidler eller problemer.');
 b.meds=s.meds.map(m=>{
  const o=Object.fromEntries(['name','form','dose','doseUnit','schedule','indication','source','status','change','catalogId','atc','diagnosisSystem','diagnosisCode','ingredients','ingredientsEn','date','resolution','reconciliation','legacyPatient','durationWeeks','dailyDoseMg','treatmentPurpose','naturalId','naturalMode'].map(k=>[k,str(m[k])]));
  const obs=v=>typeof v==='string'?{dose:str(v),comment:''}:{dose:str(v?.dose),comment:str(v?.comment),initiative:validInitiative(v?.initiative)};
  o.id=id(m.id);o.observations={};o.actualUses={};
  for(const src of b.lms.sourceList){const old=[...sourceIdMap].find(([,v])=>v===src.id)?.[0]||src.id;o.observations[src.id]=obs(m.observations?.[old]);if(m.actualUses?.[old])o.actualUses[src.id]=obs(m.actualUses[old]);else if(s.version!==3&&src.type==='PR')o.actualUses[src.id]=obs(m.observations?.[old]);}
  if(m.actualUses?.patient)o.actualUses.patient=obs(m.actualUses.patient);
  if(s.version!==3){
   const ps=(s.lms?.sourceList||[]).filter(x=>x.type==='P'),reported=ps.map(x=>obs(m.observations?.[x.id]).dose).filter(Boolean);
   o.actualUses.patient={dose:reported[0]||str(m.dose),comment:''};
   o.legacyPatient=[...reported.slice(1),m.dose&&reported[0]&&m.dose!==reported[0]?'Tidligere samstemt dose: '+str(m.dose):''].filter(Boolean).join('\n');
   o.reconciliation='Ikke avklart';
  }
  o.doseUnit=Object.keys(IMMDose.UNITS).includes(o.doseUnit)?o.doseUnit:IMMDose.inferUnit(o.form);
  const catalog=medicineIndex.get(o.catalogId);
  if(!o.ingredientsEn&&catalog&&o.ingredients===(catalog.ingredients||[]).join('\n'))o.ingredientsEn=(catalog.ingredientsEn||[]).join('\n');
  return o;
 });
 b.lrps=s.lrps.map(l=>{const o=Object.fromEntries(['title','date','type','drug','kind','priority','problem','evidence','action','monitor','owner','when','status','result','source','measure','purpose','agreement','taperPlan','restartPlan','listPlan'].map(k=>[k,str(l[k])]));o.id=id(l.id);o.implemented=l.implemented===true;if(!o.title)o.title=o.drug||REVIEW[+o.type]?.title||'Problem';if(!['high','medium','low'].includes(o.priority))o.priority='medium';if(!/^[0-9]$/.test(o.type))o.type='9';return o;});
 if(s.journal){b.journal.title=str(s.journal.title)||'Legemiddelgjennomgang';if(s.journal.entries!==undefined&&!Array.isArray(s.journal.entries))throw Error('Ugyldige journalpunkter.');if(s.journal.entries?.length>100)throw Error('For mange journalpunkter.');b.journal.entries=(s.journal.entries||[]).map(e=>({id:id(e.id),title:str(e.title),lrp:str(e.lrp),suggestion:str(e.suggestion),implemented:e.implemented===true,measure:str(e.measure)}));}
 return b;
}
function cleanDrafts(raw){const result={};if(!raw||typeof raw!=='object')return result;for(const d of Object.values(raw).slice(0,100)){if(!d||!['med','lrp'].includes(d.kind)||typeof d.id!=='string'||!/^[\w-]{0,100}$/.test(d.id))continue;const allowed=d.kind==='med'?['name','form','dose','doseUnit','reporterId','retiredReporter','schedule','indication','source','status','change','catalogId','atc','diagnosisSystem','diagnosisCode','ingredients','ingredientsEn','date','resolution','reconciliation','durationWeeks','dailyDoseMg','treatmentPurpose','naturalId','naturalMode']:['title','date','type','drug','kind','priority','problem','evidence','action','monitor','owner','when','status','result','source','implemented','measure','purpose','agreement','taperPlan','restartPlan','listPlan'];const values={};for(const [k,v]of Object.entries(d.values||{})){if((allowed.includes(k)||d.kind==='med'&&/^(obs|dose|comment|initiative)_[\w-]{1,100}$/.test(k))&&typeof v==='string')values[k]=v.slice(0,30000);}result[`${d.kind}:${d.id}`]={kind:d.kind,id:d.id,values};}return result;}
