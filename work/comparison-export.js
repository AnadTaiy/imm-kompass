/* Local export of the recorded comparison. No network calls or source inference. */
function comparisonExportData(){
 const sources=comparisonSources();
 const cell=(o,m)=>[o.dose.trim()?(IMMDose.parse(o.dose,m.doseUnit||IMMDose.inferUnit(m.form)).code||o.dose):'Ikke registrert',initiativeLabel(o.initiative),o.comment].filter(Boolean).join('\n');
 return {date:new Intl.DateTimeFormat('nb-NO',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'Europe/Oslo'}).format(new Date()),patientNumber:String(state.profile?.patientNumber||''),headers:['Legemiddel',...sources.map(s=>[sourceLabel(s),s.date].filter(Boolean).join('\n')),reporterLabel()],rows:state.meds.map(m=>[
  [m.name,'Doseenhet: '+(m.doseUnit||IMMDose.inferUnit(m.form)),m.indication?'Indikasjon: '+m.indication:'',m.status&&m.status!=='Uendret'?'Status: '+m.status:'',m.schedule?'Bruksmønster: '+m.schedule:''].filter(Boolean).join('\n'),
  ...sources.map(s=>cell(observation(m.observations?.[s.id]),m)),cell(actualUse(m),m)
 ])};
}
function comparisonExportSections(data){
 const count=data.headers.length-2,sections=[];
 for(let start=0;start<Math.max(1,count);start+=2){const indices=[0,...Array.from({length:Math.min(2,count-start)},(_,i)=>start+i+1),data.headers.length-1];sections.push({title:count>2?'Kilder '+(start+1)+'–'+Math.min(start+2,count)+' av '+count:'',headers:indices.map(i=>data.headers[i]),rows:data.rows.map(row=>indices.map(i=>row[i]))});}
 return sections;
}
function comparisonExportTables(data){return comparisonExportSections(data).map(s=>`<section class="comparison-export-section">${s.title?`<h2>${esc(s.title)}</h2>`:''}<table class="comparison-export-table"><thead><tr>${s.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.rows.map(row=>`<tr>${row.map((v,i)=>`<${i?'td':'th scope="row"'}>${esc(v)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table></section>`).join('');}
function showComparisonExport(){
 if(!state.meds.length){toast('Legg til legemidler før du eksporterer oversikten.');return;}
 const data=comparisonExportData();
 modal('Lagre legemiddeloversikt',`<div class="modalbody"><p>Alle ${data.rows.length} legemidler og alle registrerte kilder tas med. Dosering og kommentarer beholdes. Faktisk bruk hentes fra ${reporter().type==='PR'?'valgt pårørende':'pasientfeltet'}.</p><p class="hint sectiongap">A4 stående. Filene inneholder bare dato, pasientnummer og oversikten. Ved mange kilder gjentas legemiddel og faktisk bruk i hver tabelldel.</p><div class="comparison-export-preview sectiongap"><p>Dato: ${esc(data.date)}<br>Pasientnummer: ${esc(data.patientNumber||'Ikke registrert')}</p>${comparisonExportTables(data)}</div></div>`,`<div class="modalfoot"><button data-action="close-modal">Lukk</button><button class="word-export-button" data-action="comparison-word">Lagre Word (.docx)</button><button class="primary" data-action="comparison-pdf">Lagre PDF</button></div>`);
}
// A small standards-based OOXML package; keeps the browser export dependency-free.
function comparisonDocx(data){
 const xml=s=>String(s).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const p=(text,style='',bold=false)=>'<w:p><w:pPr>'+(style?'<w:pStyle w:val="'+style+'"/>':'')+'<w:spacing w:after="70"/></w:pPr>'+String(text).split(/\r?\n/).map((line,i)=>'<w:r><w:rPr>'+(bold?'<w:b/>':'')+'</w:rPr>'+(i?'<w:br/>':'')+'<w:t xml:space="preserve">'+xml(line)+'</w:t></w:r>').join('')+'</w:p>';
 let body=p('Dato: '+data.date)+p('Pasientnummer: '+(data.patientNumber||'Ikke registrert'));
 for(const [n,s] of comparisonExportSections(data).entries()){
  if(n)body+='<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  if(s.title)body+=p(s.title,'Heading1');
  const available=10506,first=2800,rest=Math.floor((available-first)/(s.headers.length-1)),widths=s.headers.map((_,i)=>i?rest:first);
  body+='<w:tbl><w:tblPr><w:tblW w:w="'+widths.reduce((a,b)=>a+b,0)+'" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders>'+['top','left','bottom','right','insideH','insideV'].map(x=>'<w:'+x+' w:val="single" w:sz="4" w:color="D9D9D9"/>').join('')+'</w:tblBorders><w:tblCellMar><w:top w:w="110" w:type="dxa"/><w:left w:w="110" w:type="dxa"/><w:bottom w:w="110" w:type="dxa"/><w:right w:w="110" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>'+widths.map(w=>'<w:gridCol w:w="'+w+'"/>').join('')+'</w:tblGrid>';
  for(const [ri,row] of [s.headers,...s.rows].entries())body+='<w:tr><w:trPr>'+(ri===0?'<w:tblHeader/>':'')+'</w:trPr>'+row.map((text,i)=>'<w:tc><w:tcPr><w:tcW w:w="'+widths[i]+'" w:type="dxa"/><w:vAlign w:val="center"/>'+(!ri?'<w:shd w:fill="E5EDF3"/>':ri%2===0?'<w:shd w:fill="F5F7F8"/>':'')+'</w:tcPr>'+p(text,'',!ri||!i)+'</w:tc>').join('')+'</w:tr>';
  body+='</w:tbl>'+p('');
 }
 const documentXml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838" w:orient="portrait"/><w:pgMar w:top="700" w:right="700" w:bottom="700" w:left="700" w:header="300" w:footer="300" w:gutter="0"/></w:sectPr></w:body></w:document>';
 return comparisonZip({
  '[Content_Types].xml':'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
  '_rels/.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  'word/_rels/document.xml.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
  'word/document.xml':documentXml,
  'word/styles.xml':'<?xml version="1.0"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="20"/><w:color w:val="111111"/><w:lang w:val="nb-NO"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="000000"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style></w:styles>'
 });
}
function comparisonZip(files){
 const encode=new TextEncoder(),parts=[],central=[];let offset=0;
 const crc=bytes=>{let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;};
 const header=size=>{const a=new Uint8Array(size);return [a,new DataView(a.buffer)];};
 for(const [name,value] of Object.entries(files)){
  const path=encode.encode(name),bytes=encode.encode(value),sum=crc(bytes),[local,v]=header(30);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint16(12,33,true);v.setUint32(14,sum,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,path.length,true);
  parts.push(local,path,bytes);const [entry,d]=header(46);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint16(14,33,true);d.setUint32(16,sum,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,path.length,true);d.setUint32(42,offset,true);central.push(entry,path);offset+=30+path.length+bytes.length;
 }
 const size=central.reduce((n,a)=>n+a.length,0),[end,v]=header(22),count=Object.keys(files).length;v.setUint32(0,0x06054b50,true);v.setUint16(8,count,true);v.setUint16(10,count,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);
 const all=[...parts,...central,end],result=new Uint8Array(offset+size+22);let at=0;for(const a of all){result.set(a,at);at+=a.length;}return result;
}
