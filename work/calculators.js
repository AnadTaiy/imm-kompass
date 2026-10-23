/* Published CKD-EPI (2021/2012), Cockcroft–Gault (1976), Mosteller (1987).
   Pure functions. No dose recommendations. No rounding of intermediates.
   Formula sources and test methodology are supplied in the application. */
(function(root){
  'use strict';
  function number(value){
    const s=String(value??'').trim().replace(',','.');
    if(!s || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;
    const n=Number(s);return Number.isFinite(n)?n:null;
  }
  function scrMgDl(value,unit){
    const n=number(value);if(n===null||n<=0)return null;
    return unit==='umol'?n/88.4:unit==='mgdl'?n:null;
  }
  function egfrCr(age,sex,scr){
    const female=sex==='female',k=female?.7:.9,alpha=female?-.241:-.302;
    return 142*Math.pow(Math.min(scr/k,1),alpha)*Math.pow(Math.max(scr/k,1),-1.2)*Math.pow(.9938,age)*(female?1.012:1);
  }
  function egfrCrCys(age,sex,scr,cys){
    const female=sex==='female',k=female?.7:.9,alpha=female?-.219:-.144;
    return 135*Math.pow(Math.min(scr/k,1),alpha)*Math.pow(Math.max(scr/k,1),-.544)*Math.pow(Math.min(cys/.8,1),-.323)*Math.pow(Math.max(cys/.8,1),-.778)*Math.pow(.9961,age)*(female?.963:1);
  }
  function egfrCys(age,sex,cys){
    return 133*Math.pow(Math.min(cys/.8,1),-.499)*Math.pow(Math.max(cys/.8,1),-1.328)*Math.pow(.996,age)*(sex==='female'?.932:1);
  }
  function crcl(age,sex,scr,weight){return (140-age)*weight/(72*scr)*(sex==='female'?.85:1);}
  function bsa(height,weight){return Math.sqrt(height*weight/3600);}
  function evaluate(p){
    const a=number(p.age),scr=scrMgDl(p.creatinine,p.scrUnit),cys=number(p.cystatin),w=number(p.weight),h=number(p.height);
    const messages=[],invalid=[],values={cr:null,combined:null,cys:null,cg:null,bsa:null};
    if(a===null||a<16||a>=140)messages.push('Oppgi alder fra 16 til under 140 år. CKD-EPI beregnes først fra 18 år; Cockcroft–Gault fra 16 år.');
    if(!['female','male'].includes(p.sex))messages.push('Velg kjønnskoeffisient for den publiserte formelen.');
    if(p.stability!=='stable')messages.push(p.stability==='unstable'?'Akutt eller skiftende nyrefunksjon: standardestimatene vises ikke. Vurder klinisk utvikling, prøvetrend og egnet spesialiststøtte.':'Avklar om nyrefunksjonen er stabil før beregning.');
    if(p.dialysis)messages.push('Dialyse: standardestimatene brukes ikke her. Bruk råd tilpasset dialyseform og legemiddel.');
    if(p.pregnant)messages.push('Graviditet: standardestimatene er ikke validert for denne bruken og vises ikke.');
    if(p.creatinine!==''&&p.creatinine!=null&&!scr)invalid.push('Kreatinin må være et positivt, eksakt tall. Kontroller valgt enhet.');
    if(p.cystatin!==''&&p.cystatin!=null&&!(cys>0))invalid.push('Cystatin C må være et positivt tall i mg/L.');
    if(p.weight!==''&&p.weight!=null&&!(w>0&&w<=1000))invalid.push('Kontroller faktisk vekt: oppgi kg, større enn 0 og høyst 1000.');
    if(p.height!==''&&p.height!=null&&!(h>0&&h<=300))invalid.push('Kontroller høyde: oppgi cm, større enn 0 og høyst 300.');
    const cw=p.cgWeightType==='actual'?w:number(p.cgWeight);
    if(p.cgWeightType&&!['actual','ideal','adjusted','other'].includes(p.cgWeightType))invalid.push('Velg et gyldig vektgrunnlag.');
    if(p.cgWeightType&&!(cw>0&&cw<=1000))invalid.push('Oppgi gyldig vektgrunnlag for Cockcroft–Gault i kg.');
    if(!messages.length&&!invalid.length){
      if(a>=18&&scr)values.cr=egfrCr(a,p.sex,scr);
      if(a>=18&&cys>0)values.cys=egfrCys(a,p.sex,cys);
      if(a>=18&&scr&&cys>0)values.combined=egfrCrCys(a,p.sex,scr,cys);
      if(scr&&p.cgWeightType&&cw>0)values.cg=crcl(a,p.sex,scr,cw);
      if(w>0&&h>0)values.bsa=bsa(h,w);
    }
    const warnings=a!==null&&a>=16&&a<18?['16–17 år: kun Cockcroft–Gault vises. CKD-EPI-formlene her gjelder fra 18 år.']:[],
      valid=!messages.length&&!invalid.length;
    return {values,messages:[...messages,...invalid],warnings,scrMgDl:scr,cgWeight:cw,valid};
  }
  const api={number,scrMgDl,egfrCr,egfrCrCys,egfrCys,crcl,bsa,evaluate};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.IMMCalc=api;
})(typeof window!=='undefined'?window:null);
