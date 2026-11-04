const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),C=require('./cascade-policy.js');
let checks=0;const check=(name,value)=>{assert.ok(value,name);checks++;};
const med=(id,atc,indication='',extra={})=>({id,atc,indication,name:id,form:'Tablett',schedule:'Fast',status:'Uendret',dose:'1x1',...extra});
function hits(a,b,indication,extra={},profile={age:'78'}){return C.findings([med('a',a,'Grunnbehandling'),med('b',b,indication,extra)],profile);}
// Clinically distinct examples, in the published table order. These are synthetic.
const examples=[
 ['C09AA05','R05DA04','Tørrhoste'],['C09AA05','R06AE05','Svimmelhet'],['C07AA05','N06AB06','Ny depresjon'],['C07AA05','G04BE03','Erektil dysfunksjon'],['C08CA01','C03CA01','Ødem'],['C08DA01','A06AD15','Forstoppelse'],['C03AA03','M04AA01','Urinsyregikt'],['C03CA01','G04BD08','Urininkontinens'],['C10AA05','N02BE01','Muskelsmerter'],['C10AA05','A12CC10','Myalgi'],['C10AA05','P01BC01','Muskelsmerter'],['C10AA05','N05CF01','Søvnvansker'],['C01AA05','A03FA01','Kvalme'],['C01CA17','C08CA01','Ny hypertensjon'],
 ['N03AX09','D07AA02','Hudutslett'],['N03AX09','A03FA01','Kvalme'],['N05AD01','C07AA05','Ekstrapyramidale symptomer'],['N05AD01','N04BA02','Parkinsonisme'],['N05AD01','N04AA02','Ekstrapyramidale symptomer'],['N05AD01','N05BA01','Akatisi'],['N05AD01','C01BD01','Ny arytmi'],['N05AH03','A10BA02','Ny hyperglykemi'],['N05BA01','N06DA02','Ny kognitiv svikt'],['N06DA02','G04BD08','Urininkontinens'],['N06DA02','N05CF01','Søvnvansker'],['N06DA02','A03FA01','Kvalme'],null,['N06DA02','A07DA03','Diaré'],['N06DA02','R06AX13','Rennende nese'],['N04BA02','N05AH04','Nye hallusinasjoner'],['N02BF02','C03CA01','Ankelødem'],['N06AB06','G04BD08','Urininkontinens'],['N06AA09','N06DA02','Ny kognitiv svikt'],['N06AA09','A06AD15','Obstipasjon'],['N06AA09','G04BD08','Urininkontinens'],['N07CA03','N06AB06','Ny depresjon'],['N05AN01','N04AA02','Parkinsonisme'],['N06AX16','C08CA01','Forverret hypertensjon'],['N06AX16','N05BA01','Tremor'],
 ['A10BH01','M01AE01','Leddsmerter'],['A10BK03','G01AF02','Underlivssopp'],['A10BA02','A07DA03','Diaré'],['A10BG03','C03CA01','Ødem'],['A10BG02','C03CA01','Ny hjertesvikt'],
 ['R06AE05','G04CA02','Urinretensjon'],['A03FA01','N04AA02','Parkinsonisme'],['A06AD15','A07DA03','Diaré'],['A02BC01','A11CC05','Ny osteoporose'],null,
 ['M05BA04','A02BC01','Gastritt'],['M01AE01','A02BC01','Magesår'],['M01AE01','A03FA01','Kvalme'],['M01AE01','C08CA01','Ny hypertensjon'],['M01AE01','C03CA01','Forverret hjertesvikt'],['N02AA05','N06AB06','Ny depresjon'],
 ['G04CA02','R06AE05','Svimmelhet'],null,
 ['J01DH02','N03AX14','Nye krampeanfall'],['H02AB06','N05CF01','Insomni'],['H02AB06','N05AH04','Ny psykose'],['H02AB06','C08CA01','Ny hypertensjon'],['D05BB02','G01AF02','Vaginal candidiasis'],['J01FA01','C01BD01','Ny arytmi'],['H02AA02','C08CA01','Ny hypertensjon'],['B03AA07','A06AD15','Forstoppelse']
];
check('published table has 65 traceable entries',C.rules.length===65&&examples.length===65);
examples.forEach((ex,i)=>{const id='PIPC-'+String(i+1).padStart(2,'0');if(!ex){check(id+' explicitly inactive',!!C.rules[i].disabled);return;}
 check(id+' clinically specified example',hits(...ex).some(h=>h.rule===id));
 check(id+' missing indication permits labelled patient candidate',C.findings([med('a',ex[0]),med('b',ex[1])],{age:78},[{text:ex[2]}]).some(h=>h.rule===id&&h.evidenceSource==='patient'&&h.indication===''));
 check(id+' absent evidence is not a candidate',!C.findings([med('a',ex[0]),med('b',ex[1])],{age:78}).some(h=>h.rule===id));
 for(const text of ['Ingen '+ex[2],'Profylakse mot '+ex[2],'Tidligere '+ex[2],'Mor har '+ex[2]])check(id+' patient evidence excludes '+text,!C.findings([med('a',ex[0]),med('b',ex[1])],{age:78},[{text}]).some(h=>h.rule===id));
 for(const indication of ['Ingen '+ex[2],'Profylakse mot '+ex[2],'Tidligere '+ex[2],'Mor har '+ex[2]])check(id+' excludes '+indication,!hits(ex[0],ex[1],indication).some(h=>h.rule===id));
 for(const status of ['Pausert','Seponert'])check(id+' excludes '+status,!hits(...ex,{status}).some(h=>h.rule===id));
});
for(const age of ['',undefined,null,'64','17','-1','NaN','140'])check('invalid/younger age '+age,hits('C08CA01','C03CA01','Ødem',{}, {age}).length===0);
check('65-year boundary',hits('C08CA01','C03CA01','Ødem',{}, {age:'65'}).some(h=>h.rule==='PIPC-05'));
for(const indication of ['Hjertesvikt','Ødem ved hjertesvikt','Ødem pga. nyresvikt','Lymfødem','Ingen ødem','Ikke ødem','Profylakse mot ødem','Tidligere ødem','Hypertensjon','Lungeødem',''])check('edema does not overmatch '+indication,hits('C08CA01','C03CA01',indication).length===0);
for(const dose of ['0','S'])check('actual non-use '+dose,hits('C08CA01','C03CA01','Ødem',{actualDose:dose}).length===0);
check('non-use schedule',hits('C08CA01','C03CA01','Ødem',{schedule:'Bruker ikke'}).length===0);
check('older registration date is not treatment onset',hits('C08CA01','C03CA01','Ødem',{date:'1999-01-01'}).length===1);
check('known longer B treatment suppresses candidate',C.findings([med('a','C08CA01','HT',{durationWeeks:'2'}),med('b','C03CA01','Ødem',{durationWeeks:'20'})],{age:78}).length===0);
check('known A before B can match',C.findings([med('a','C08CA01','HT',{durationWeeks:'20'}),med('b','C03CA01','Ødem',{durationWeeks:'2'})],{age:78}).length===1);
check('existing HT is not sufficient',hits('M01AE01','C08CA01','Hypertensjon').length===0);
check('English indication',hits('A10BA02','A07DA03','Diarrhea').some(h=>h.rule==='PIPC-42'));
check('Norwegian accent variant',hits('A10BA02','A07DA03','Diare').some(h=>h.rule==='PIPC-42'));
check('correct combination CCB',hits('C09DX01','C03CA01','Ødem').some(h=>h.rule==='PIPC-05'));
check('sacubitril/valsartan is not CCB',!hits('C09DX04','C03CA01','Ødem').some(h=>h.rule==='PIPC-05'));
check('metformin combination retained',hits('A10BD15','A07DA03','Diaré').some(h=>h.rule==='PIPC-42'));
check('insulin is not metformin',!hits('A10AB01','A07DA03','Diaré').some(h=>h.rule==='PIPC-42'));
check('IV bisphosphonate excluded',C.findings([med('a','M05BA08','Osteoporose',{form:'Infusjonsvæske'}),med('b','A02BC01','Gastritt')],{age:78}).length===0);
check('topical NSAID excluded',hits('M02AA15','C08CA01','Ny hypertensjon').length===0);
check('inhaled corticosteroid excluded',hits('R03BA02','N05CF01','Søvnvansker').length===0);
check('topical erythromycin excluded',hits('D10AF02','C01BD01','Ny arytmi').length===0);
check('IV iron excluded',hits('B03AC01','A06AD15','Forstoppelse').length===0);
check('lithium is not antipsychotic',!hits('N05AN01','A10BA02','Ny hyperglykemi').some(h=>h.rule==='PIPC-22'));
check('mirabegron is not antimuscarinic',!C.groupMatch(med('a','G04BD12'),'bladderAnticholinergic'));
check('vibegron is not antimuscarinic',!C.groupMatch(med('a','G04BD15'),'bladderAnticholinergic'));
check('trimipramine is TCA',C.groupMatch(med('a','N06AA06'),'tca'));
check('maprotiline not silently labelled TCA',!C.groupMatch(med('a','N06AA21'),'tca'));
check('opioid + constipation prophylaxis is not classified as inappropriate cascade',hits('N02AA05','A06AD15','Profylakse mot forstoppelse').length===0);
check('symptom alone without treatment B not cascade',C.findings([med('a','C08CA01','HT')],{age:78},[{text:'Ødem'}]).length===0);
const patientEdema=[{system:'ICD-10',code:'I10',text:'Essensiell hypertensjon'},{system:'ICD-10',code:'R60.0',text:'Lokalisert ødem'}];
for(const indication of ['', 'Vanndrivende', 'Diuretikum', 'Diuretika', 'Ukjent indikasjon']){
 const found=C.findings([med('a','C08CA01','Hypertensjon'),med('b','C03CA01',indication)],{age:78},patientEdema);
 check('HT/edema case with '+indication,found.length===1&&found[0].evidenceSource==='patient'&&found[0].patientEvidence[0]==='Lokalisert ødem');
}
for(const indication of ['Hypertensjon','Hjertesvikt','Ødem ved hjertesvikt','Ingen ødem','Tidligere ødem','Forebygging av ødem','Vanndrivende ved hjertesvikt'])check('patient diagnosis does not override '+indication,C.findings([med('a','C08CA01'),med('b','C03CA01',indication)],{age:78},patientEdema).length===0);
for(const text of ['Ødem ved hjertesvikt','Ødem pga. nyresvikt','Lungeødem','Lymfødem'])check('alternative edema cause in patient record: '+text,C.findings([med('a','C08CA01'),med('b','C03CA01','Vanndrivende')],{age:78},[{text}]).length===0);
check('explicit indication takes precedence without duplicate flags',C.findings([med('a','C08CA01'),med('b','C03CA01','Ødem')],{age:78},patientEdema).filter(f=>f.evidenceSource==='indication').length===1);
check('patient symptom duplicated across fields produces one candidate',C.findings([med('a','C08CA01'),med('b','C03CA01')],{age:78},[...patientEdema,{text:'Lokalisert ødem'}]).length===1);
check('coded chronic HT alone not enough',C.findings([med('a','M01AE01'),med('b','C08CA01','Blodtrykksmedisin')],{age:78},patientEdema).length===0);
check('new HT in patient context can qualify',C.findings([med('a','M01AE01'),med('b','C08CA01','Blodtrykksmedisin')],{age:78},[{text:'Forverret hypertensjon'}]).some(h=>h.rule==='PIPC-53'));
check('patient diagnoses do not bypass age',C.findings([med('a','C08CA01'),med('b','C03CA01')],{age:64},patientEdema).length===0);
check('patient diagnoses do not bypass nonuse',C.findings([med('a','C08CA01'),med('b','C03CA01','',{status:'Seponert'})],{age:78},patientEdema).length===0);
check('patient diagnoses do not bypass chronology',C.findings([med('a','C08CA01','',{durationWeeks:'2'}),med('b','C03CA01','',{durationWeeks:'20'})],{age:78},patientEdema).length===0);
// Source/UI integration uses the same manifest as production and staged FEST sync.
const DATA=JSON.parse(fs.readFileSync(__dirname+'/data.json','utf8'));
for(const [k,f] of [['catalog','catalog/catalog.json'],['clinical','clinical-rules.json'],['natural','natural-products.json']])DATA[k]=JSON.parse(fs.readFileSync(__dirname+'/'+f,'utf8'));
DATA.older.translations={...JSON.parse(fs.readFileSync(__dirname+'/start-nb.json','utf8')),...JSON.parse(fs.readFileSync(__dirname+'/stopp-nb.json','utf8'))};DATA.older.parameters=JSON.parse(fs.readFileSync(__dirname+'/criteria-parameters.json','utf8'));
const context={DATA,URL,URLSearchParams,console,crypto:require('node:crypto').webcrypto,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},location:{href:'http://localhost/?patient=private',search:''},localStorage:{getItem:()=>null,setItem(){}},document:{addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],documentElement:{dataset:{}}},window:{addEventListener(){}}};vm.createContext(context);
let app=JSON.parse(fs.readFileSync(__dirname+'/app-files.json','utf8')).map(n=>fs.readFileSync(__dirname+'/'+n,'utf8')).join('\n');app=app.slice(0,app.lastIndexOf("if(resourceOnly){page='library'"));vm.runInContext(app,context);context.IMMCalc=context.window.IMMCalc;context.IMMDose=context.window.IMMDose;
const run=s=>vm.runInContext(s,context);
run(`state=blank();state.profile.age='78';state.meds=[{id:'a',atc:'C08CA01',name:'A <test>',indication:'HT',actualUses:{patient:{dose:'1x1'}}},{id:'b',atc:'C03CA01',name:'B',indication:'Ødem <privat>',actualUses:{patient:{dose:'1x1'}}}];`);
check('uses saved indication',run('cascadeFindings().length===1'));
check('one discreet badge with escaped evidence',run(`cascadeFlag(state.meds[0]).includes('Mulig kaskade')&&cascadeFlag(state.meds[0]).includes('&lt;privat&gt;')&&!cascadeFlag(state.meds[0]).includes('<privat>')`));
check('source URL has no patient or indication text',run(`const u=cascadeSourceUrl(['PIPC-05'],state.meds[0]);!u.includes('privat')&&!u.includes('patient')&&!u.includes('indication')&&u.includes('cascade=PIPC-05')`));
check('updated indication invalidates cache',run(`state.meds[1].indication='Hypertensjon';cascadeFindings().length===0`));
check('updated status invalidates cache',run(`state.meds[1].indication='Ødem';state.meds[0].status='Seponert';cascadeFindings().length===0`));
run(`state.meds[0].status='Uendret';state.meds[1].indication='Vanndrivende';state.diagnosisList=[{system:'ICD-10',code:'R60.0',text:'Lokalisert ødem <privat>'}];`);
check('new patient diagnosis invalidates cache',run(`cascadeFindings().length===1&&cascadeFindings()[0].evidenceSource==='patient'`));
check('diagnosis badge explains evidence without exposing text in URL',run(`(()=>{const flag=cascadeFlag(state.meds[0]);const u=flag.match(/href="([^"]+)"/)[1];return flag.includes('Pasientgrunnlag:')&&flag.includes('&lt;privat&gt;')&&u.includes('basis=patient')&&!u.includes('privat')&&!u.includes('R60');})()`));
check('removing patient diagnosis clears cached finding',run(`state.diagnosisList=[];cascadeFindings().length===0`));
check('symptoms text in patient context also refreshes findings',run(`state.profile.symptoms='Lokalisert ødem';cascadeFindings().length===1`));
check('negated patient symptom does not match',run(`state.profile.symptoms='Ingen ødem';cascadeFindings().length===0`));
check('source panel cites paper and correction',run(`queryParams.set('cascade','PIPC-05');const panel=cascadeSourcePanel();panel.includes('PMC12712104')&&panel.includes('PMC12945913')&&panel.includes('legemiddelhandboka.no/virkestoff/kalsiumantagonister')`));
check('patient-source panel does not assert a known treatment indication',run(`queryParams.set('basis','patient');cascadeSourcePanel().includes('Avklar om behandlingen faktisk gjelder dette symptomet')`));
check('help explains scope',run(`cascadeHelp().includes('62 av 65')&&cascadeHelp().includes('65 år')`));
check('no frequency inferred from ATC alone',run(`reviewedAdverse({atc:'C08CA01'})===null`));
check('unreviewed product says no frequency overview',run(`adverseSummary({name:'Ukjent',atc:'C08CA01'}).includes('Kortoversikt er ikke tilgjengelig')`));
check('known brand gets reviewed source-specific summary',run(`const p=DATA.catalog.meds.find(m=>m.spc==='https://produktinformasjon.legemiddelsok.no/preparatomtaler/16-11439.pdf');adverseSummary({...p,catalogId:p.id}).includes('Svært vanlige: Ødem')`));
check('acitretin does not broaden to balanitis',!hits('D05BB02','G01AF02','Candidabalanitt').some(h=>h.rule==='PIPC-62'));
// Frequency facts remain tied to their reviewed SPC, adult context and formulation.
const ADR=require('./adverse-effects.js');
for(const r of ADR.records){
 check(r.atc+' traceable source',/^https:\/\/(produktinformasjon.legemiddelsok.no|www.ema.europa.eu)\//.test(r.url)&&/^[a-f0-9]{64}$/.test(r.sha256)&&r.checked==='2026-11-03'&&r.pages.length>0);
 check(r.atc+' exact product resolves',ADR.find({atc:r.atc,form:r.forms[0],ingredients:r.ingredients,spc:r.url})?.exact===true);
 check(r.atc+' alternate brand labelled',ADR.find({atc:r.atc,form:r.forms[0],ingredients:r.ingredients,spc:'https://example.org/other.pdf'})?.exact===false);
 check(r.atc+' no cross-route extrapolation',ADR.find({atc:r.atc,form:'Injeksjonsvæske',ingredients:r.ingredients,spc:r.url})===null);
 check(r.atc+' composition required',ADR.find({atc:r.atc,form:r.forms[0],spc:r.url})===null);
}
const record=atc=>ADR.records.find(r=>r.atc===atc);
check('39 reviewed SPCs',ADR.records.length===39);
check('statin frequencies are not class inferred',record('C10AA01').common.length===0&&record('C10AA05').common.some(s=>s.includes('Muskelsmerter')));
check('pantoprazole not given omeprazole frequencies',record('A02BC02').common.length===1&&!record('A02BC02').common[0].includes('Hodepine'));
check('oxazepam conflicting source frequency disclosed',!record('N05BA04').common.length&&record('N05BA04').note.includes('10–15 %'));
check('no invented frequency for levothyroxine',!record('H03AA01').common.length&&!record('H03AA01').very.length);
check('candesartan contexts not merged',record('C09CA06').common.length===0&&record('C09CA06').contexts.length===2);
check('apixaban pediatric nosebleed frequency not assigned to adults',record('B01AF02').very.length===0);
check('sulfonylurea/insulin qualifier retained',record('A10BK01').very[0].includes('samtidig')&&record('A10BK03').very.some(s=>s.includes('samtidig')));
check('benserazide not mapped through shared ATC',ADR.find({atc:'N04BA02',form:'Tablett',ingredients:['Levodopa','Benserazid']})===null);
check('unknown ingredients not guessed from product name',ADR.find({atc:'C08CA01',form:'Tablett',name:'Norvasc'})===null);
check('unreviewed combination not constructed from ingredients',ADR.find({atc:'C10BA02',form:'Tablett',ingredients:['Ezetimib','Simvastatin']})===null);
check('metformin 500 now has explicit representative overview',run(`const p500=DATA.catalog.meds.find(m=>m.name==='Glucophage tab 500 mg'&&m.ordinary);const summary500=adverseSummary({...p500,catalogId:p500.id});summary500.includes('Kvalme')&&summary500.includes('Virkestoffoppslag fra Glucophage')`));
check('reviewed source and chosen product not conflated',run(`adverseContent(window.IMMAdverse.find(DATA.catalog.meds.find(m=>m.name==='Glucophage tab 500 mg'&&m.ordinary))).includes('frekvensene er fra kildepreparatet')`));
check('help glossary contains requested tools',(()=>{const h=fs.readFileSync(__dirname+'/help.js','utf8');return ['START –','STOPP –','STOPPFrail –','STOPPFall –','CHA₂DS₂-VA –','CHA₂DS₂-VASc'].every(t=>h.includes(t));})());
// Regression: centrally authorised Eliquis SPC used to be lost on import.
check('parser upgraded',DATA.catalog.meta.parserVersion>=3);
check('Eliquis inherits its exact package SPC',DATA.catalog.meds.filter(m=>m.brand==='Eliquis'&&m.ordinary).some(m=>/ema.europa.eu\/no\/documents\/product-information\/eliquis-epar-product-information_no.pdf$/.test(m.spc)));
check('national product SPC remains direct',DATA.catalog.meds.some(m=>m.brand==='Norvasc'&&m.spc==='https://produktinformasjon.legemiddelsok.no/preparatomtaler/0000-07526.pdf'));
const many=Array.from({length:40},(_,i)=>med(String(i),i%2?'A07DA03':'A10BA02',i%2?'Diaré':'Diabetes'));
const start=performance.now();C.findings(many,{age:78});const elapsed=performance.now()-start;check('40-medicine review below 100 ms',elapsed<100);
console.log(JSON.stringify({suite:'cascades',checks,ruleCount:C.rules.length,activeRules:C.rules.filter(r=>!r.disabled).length,milliseconds40Meds:elapsed}));
