const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const dose=require('./dosage.js');let checks=0;const check=(label,value)=>{assert.ok(value,label);checks++;};
const ctx={TextEncoder,Uint8Array,DataView,console,state:{meds:[]},IMMDose:dose,esc:s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),sourceLabel:s=>s.name,initiativeLabel:v=>v==='patient'?'Initiert av pasient':'',observation:v=>typeof v==='string'?{dose:v,comment:''}:{dose:v?.dose||'',comment:v?.comment||'',initiative:v?.initiative||''},actualUse:m=>ctx.observation(m.actualUses?.[ctx.reporterId]),reporterLabel:()=>ctx.reporterId==='patient'?'Pasient / faktisk bruk':'Pårørende / faktisk bruk · Ektefelle',comparisonSources:()=>ctx.sources,doseText:(raw,m)=>dose.parse(raw,m.doseUnit||'tablett').text};
ctx.reporterId='patient';ctx.sources=[{id:'epj',name:'EPJ'},{id:'kj',name:'KJ'}];vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/comparison-export.js','utf8'),ctx);const run=s=>vm.runInContext(s,ctx);
ctx.state.meds=[{id:'a',name:'Eksempel <A> & Ø 5 mg',doseUnit:'tablett',indication:'Hypertensjon',observations:{epj:{dose:'1x1',comment:'Kilde én\nKontrolleres'},kj:{dose:'2x1'}},actualUses:{patient:{dose:'',comment:'Ikke avklart'},relative:{dose:'1+1',comment:'Ektefelle'}}}];
let d=run('comparisonExportData()');
check('all columns and actual use preserved',d.headers.length===4&&d.rows[0].length===4);
check('actual use never substituted by a source',d.rows[0][3]==='Ikke registrert\nIkke avklart');
check('dose code and multiline comments retained',d.rows[0][1]==='1x1\nKilde én\nKontrolleres');
check('HTML escapes user input',run('comparisonExportTables(comparisonExportData())').includes('Eksempel &lt;A&gt; &amp; Ø'));
ctx.reporterId='relative';d=run('comparisonExportData()');check('selected relative controls last column',d.headers.at(-1).includes('Ektefelle')&&d.rows[0].at(-1).includes('1+1')&&d.rows[0].at(-1).includes('Ektefelle'));
ctx.sources=Array.from({length:8},(_,i)=>({id:'s'+i,name:'Kilde '+(i+1)}));d=run('comparisonExportData()');const sections=run('comparisonExportSections(comparisonExportData())');
check('many sources grouped without column loss',sections.length===4&&sections.flatMap(s=>s.headers.slice(1,-1)).length===8&&sections.every(s=>s.headers.length<=4));
check('medicine and actual repeated in every group',sections.every(s=>s.rows[0][0]===d.rows[0][0]&&s.rows[0].at(-1)===d.rows[0].at(-1)));
ctx.sources=[];check('no comparison source still preserves actual',run('comparisonExportSections(comparisonExportData())')[0].headers.length===2);
ctx.sources=[{id:'epj',name:'EPJ'},{id:'kj',name:'KJ'}];ctx.reporterId='patient';
const zip=run('comparisonDocx(comparisonExportData())'),bytes=Buffer.from(zip);check('valid ZIP signature',bytes.readUInt32LE(0)===0x04034b50);
const entries=new Map();let at=0;while(bytes.readUInt32LE(at)===0x04034b50){const size=bytes.readUInt32LE(at+18),n=bytes.readUInt16LE(at+26),extra=bytes.readUInt16LE(at+28),name=bytes.subarray(at+30,at+30+n).toString(),start=at+30+n+extra;entries.set(name,bytes.subarray(start,start+size).toString('utf8'));at=start+size;}
check('OOXML package includes content types and relationships',['[Content_Types].xml','_rels/.rels','word/_rels/document.xml.rels','word/document.xml','word/styles.xml'].every(k=>entries.has(k)));
const xml=entries.get('word/document.xml');check('Word XML escapes and preserves Norwegian',xml.includes('Eksempel &lt;A&gt; &amp; Ø')&&xml.includes('Kilde én'));
check('portrait A4, repeat header, flexible rows',xml.includes('w:orient="portrait"')&&xml.includes('w:tblHeader')&&!xml.includes('w:trHeight'));
check('paragraph breaks preserved',xml.includes('<w:br/>'));
if(process.argv[2]){fs.writeFileSync(process.argv[2],zip);console.log('Fixture saved: '+process.argv[2]);}
console.log('PASS: '+checks+' comparison and DOCX export checks.');

