/* PDF is generated locally. Libraries/font are fetched only on first export,
 * from this site's versioned assets; no review data is sent to any service. */
let comparisonPdfAssetsPromise=null,comparisonPdfBusy=false;
function comparisonPdfAssets(){
 if(comparisonPdfAssetsPromise)return comparisonPdfAssetsPromise;
 comparisonPdfAssetsPromise=(async()=>{
  const assets=window.IMM_PDF_ASSETS;if(!assets)throw new Error('PDF-filene er ikke tilgjengelige. Last siden på nytt.');
  const script=(src,ready)=>ready?Promise.resolve():new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=()=>{el.remove();reject(new Error('PDF-verktøyet kunne ikke lastes. Kontroller nettilkoblingen og prøv igjen.'));};document.head.append(el);});
  await Promise.all([script(assets.pdf,window.PDFLib),script(assets.fontkit,window.fontkit)]);
  const response=await fetch(assets.font,{credentials:'same-origin'});if(!response.ok)throw new Error('Skriften til PDF-filen kunne ikke lastes.');
  return {library:window.PDFLib,fontkit:window.fontkit,font:new Uint8Array(await response.arrayBuffer())};
 })().catch(e=>{comparisonPdfAssetsPromise=null;throw e;});return comparisonPdfAssetsPromise;
}
async function saveComparisonPdf(button){
 if(comparisonPdfBusy)return;const data=comparisonExportData();if(!data.rows.length)return;
 comparisonPdfBusy=true;if(button){button.disabled=true;button.textContent='Lager PDF …';}
 try{const a=await comparisonPdfAssets();download('Legemiddeloversikt.pdf',await comparisonPdf(data,a.library,a.fontkit,a.font),'application/pdf');}
 catch(e){toast(e.message||'PDF kunne ikke opprettes. Prøv igjen eller velg Word.');}
 finally{comparisonPdfBusy=false;if(button){button.disabled=false;button.textContent='Lagre PDF';}}
}
async function comparisonPdf(data,library,fontkit,fontBytes){
 const {PDFDocument,rgb}=library,doc=await PDFDocument.create();doc.registerFontkit(fontkit);
 const font=await doc.embedFont(fontBytes,{subset:true});doc.setTitle('');doc.setAuthor('');doc.setCreator('');doc.setProducer('');doc.setLanguage('nb-NO');
 const charset=new Set(font.getCharacterSet()),clean=v=>String(v??'').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'').replace(/\t/g,' ');
 const texts=[data.date,data.patientNumber,...data.headers,...data.rows.flat()];
 for(const text of texts)for(const c of clean(text))if(c!=='\n'&&c!=='\r'&&!charset.has(c.codePointAt(0)))throw new Error('PDF-skriften støtter ikke tegnet «'+c+'». Bruk Word for å bevare teksten.');
 const size=9,line=13,pad=7,margin=34,pageW=595.28,pageH=841.89,width=pageW-2*margin;
 const wrap=(value,maxWidth,fontSize=size)=>clean(value).split(/\r?\n/).flatMap(paragraph=>{
  const out=[];let current='';for(const token of paragraph.split(/(\s+)/).filter(Boolean)){
   if(font.widthOfTextAtSize(current+token,fontSize)<=maxWidth){current+=token;continue;}
   if(current.trim())out.push(current.trimEnd());current=token.trimStart();
   if(font.widthOfTextAtSize(current,fontSize)>maxWidth){let part='';for(const c of current){if(part&&font.widthOfTextAtSize(part+c,fontSize)>maxWidth){out.push(part);part='';}part+=c;}current=part;}
  }out.push(current.trimEnd());return out;
 });
 let page,y;
 for(const section of comparisonExportSections(data)){
  const widths=section.headers.map((_,i)=>i?(width-150)/(section.headers.length-1):150),headers=section.headers.map((h,i)=>wrap(h,widths[i]-2*pad));
  const headerHeight=Math.max(...headers.map(a=>a.length))*line+2*pad;
  if(headerHeight>150)throw new Error('Et kildenavn er for langt for PDF-tabellen. Kort ned kildenavnet eller bruk Word.');
  const drawRow=(cells,height,header=false,shade=false)=>{let x=margin;for(let i=0;i<cells.length;i++){
   page.drawRectangle({x,y:y-height,width:widths[i],height,color:header?rgb(.90,.93,.95):shade?rgb(.97,.98,.98):rgb(1,1,1),borderColor:rgb(.78,.81,.83),borderWidth:.5});
   cells[i].forEach((text,n)=>page.drawText(text,{x:x+pad,y:y-pad-size-n*line,font,size,color:rgb(.07,.07,.07)}));x+=widths[i];
  }y-=height;};
  const newPage=()=>{page=doc.addPage([pageW,pageH]);y=pageH-margin;
   for(const text of ['Dato: '+data.date,'Pasientnummer: '+(data.patientNumber||'Ikke registrert')]){for(const row of wrap(text,width,11)){page.drawText(row,{x:margin,y:y-11,font,size:11});y-=16;}}
   y-=14;if(section.title){page.drawText(section.title,{x:margin,y:y-10,font,size:10});y-=23;}drawRow(headers,headerHeight,true);
  };
  newPage();
  for(const [ri,row] of section.rows.entries()){
   const cells=row.map((text,i)=>wrap(text,widths[i]-2*pad));let remaining=Math.max(...cells.map(a=>a.length)),offset=0;
   const fullHeight=remaining*line+2*pad;if(fullHeight>y-margin&&fullHeight<pageH-2*margin-90-headerHeight)newPage();
   while(remaining>0){let lines=Math.floor((y-margin-2*pad)/line);if(lines<1){newPage();lines=Math.floor((y-margin-2*pad)/line);}if(lines<1)throw new Error('Pasientnummeret er for langt for PDF-siden.');
    const count=Math.min(lines,remaining),slice=cells.map(c=>c.slice(offset,offset+count));drawRow(slice,count*line+2*pad,false,ri%2===1);remaining-=count;offset+=count;if(remaining)newPage();
   }
  }
 }
 return doc.save();
}
