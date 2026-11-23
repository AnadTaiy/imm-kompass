const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const PDFLib=require('./pdf-lib.min.js'),fontkit=require('./fontkit.umd.min.js');
const ctx={TextEncoder,Uint8Array,DataView,console,setTimeout,clearTimeout};vm.createContext(ctx);
for(const file of ['pdf-lib.min.js','fontkit.umd.min.js','comparison-export.js','comparison-pdf.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),ctx);
const data={date:'23.11.2026',patientNumber:'TEST 42',headers:['Legemiddel','EPJ','Kjernejournal','Pasient / faktisk bruk'],rows:Array.from({length:45},(_,i)=>['Testpreparat '+(i+1)+' – 5 mg\nBruksmønster: Ved behov','1 tablett morgen\nKilde: Øyvinds liste','2 tabletter daglig','Ikke registrert'])};
data.rows[8][2]='Kommentar med æøå og μg. '.repeat(110);
(async()=>{
 const font=fs.readFileSync(__dirname+'/export-font.ttf'),bytes=await ctx.comparisonPdf(data,ctx.PDFLib,ctx.fontkit,font),pdf=await PDFLib.PDFDocument.load(bytes,{updateMetadata:false});
 assert(pdf.getPageCount()>1);assert(pdf.getPages().every(p=>Math.abs(p.getWidth()-595.28)<.1&&Math.abs(p.getHeight()-841.89)<.1));
 assert.equal(pdf.getTitle(),'');assert.equal(pdf.getAuthor(),'');assert.equal(pdf.getCreator(),'');assert.equal(pdf.getProducer(),'');
 if(process.argv[2])fs.writeFileSync(process.argv[2],bytes);
 console.log('PASS: portrait A4, '+pdf.getPageCount()+' pages, Unicode, wrapping and no application metadata.');
})().catch(e=>{console.error(e);process.exit(1);});
