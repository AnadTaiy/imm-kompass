/* LMS D47439 v2.02: exact, conservative notation conversion. No dose inference. */
(function(root){
 const DAYS=[['man','mandag'],['tir','tirsdag'],['ons','onsdag'],['tors','torsdag'],['fre','fredag'],['lør','lørdag'],['søn','søndag']];
 const PRESETS=[['1x1','Én daglig'],['1+0','Morgen'],['0+1','Kveld'],['0+1+0+0','Formiddag'],['0+0+1+0','Ettermiddag'],['1+1','Morgen og kveld'],['2+2','To morgen og kveld'],['1x3','Tre ganger daglig'],['1+1+2','Morgen, middag og to kveld'],['1→ x 3','Inntil tre ganger daglig'],['1u','Ukentlig – velg dag'],['vb','Ved behov'],['uregelmessig','Uregelmessig bruk'],['eo','Etter liste / ordinasjon'],['e.a','Etter avtale'],['bil','Bilateralt'],['h øye','Høyre øye'],['v øye','Venstre øye'],['0','Pauset'],['S','Seponert']];
 const INITIATIVES=[['not-doctor','Ikke initiert av lege'],['patient','Initiert av pasient']];
 const UNITS={tablett:['tablett','tabletter'],kapsel:['kapsel','kapsler'],dråpe:['dråpe','dråper'],dose:['dose','doser'],puff:['puff','puff'],plaster:['plaster','plastre'],mg:['mg','mg'],'µg':['µg','µg'],ml:['ml','ml'],IE:['IE','IE'],enhet:['enhet','enheter']};
 const numeric='(?:\\d+(?:[,.]\\d+)?|[½¼¾])';
 function clean(s){return String(s??'').trim().toLocaleLowerCase('nb').replace(/\s+/g,' ');}
 function number(s){return ({'½':.5,'¼':.25,'¾':.75})[s]??Number(s.replace(',','.'));}
 function fmt(n){return String(n).replace('.',',');}
 function inferUnit(form){const s=clean(form);if(/tablett/.test(s))return 'tablett';if(/kaps/.test(s))return 'kapsel';if(/plaster/.test(s))return 'plaster';return 'enhet';}
 function parse(raw,unit='enhet'){
  const original=String(raw??'').trim();let s=clean(raw).replace(/×/g,'x');
  const words=UNITS[unit]||UNITS.enhet,quantity=n=>fmt(n)+' '+words[n===1?0:1];
  const done=(code,text,extra={})=>({code,text,recognized:true,...extra});
  const literal={'uregelmessig':'Uregelmessig bruk – oppgi dose og faktisk forbruk','uregelmessig bruk':'Uregelmessig bruk – oppgi dose og faktisk forbruk','vb':'Ved behov – dose og faktisk forbruk må presiseres','eo':'Etter liste / ordinasjon','e.a':'Etter avtale','bil':'Bilateralt','h øye':'Høyre øye','v øye':'Venstre øye','0':'Pauset (nullet)','s':'Seponert (avsluttet)'};
  if(s in literal)return done(s==='s'?'S':s==='uregelmessig bruk'?'uregelmessig':s,literal[s]);
  if(['ved behov','etter liste','etter ordinasjon','etter avtale','bilateralt','høyre øye','venstre øye'].includes(s)){
   const codes={'ved behov':'vb','etter liste':'eo','etter ordinasjon':'eo','etter avtale':'e.a','bilateralt':'bil','høyre øye':'h øye','venstre øye':'v øye'};return parse(codes[s],unit);
  }
  // Only remove an explicitly matching unit. A dose in mg is never converted to a tablet count.
  const unitPattern=words.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
  const prose=new RegExp('^('+numeric+') (?:'+unitPattern+') (.+)$').exec(s);
  if(prose){const n=fmt(number(prose[1])),tail=prose[2];
   const times={daglig:'x1',morgen:'+0',kveld:'0+',formiddag:'0+?+0+0',ettermiddag:'0+0+?+0','morgen og kveld':'double'};
   if(tail in times){s=tail==='kveld'?'0+'+n:tail==='formiddag'?'0+'+n+'+0+0':tail==='ettermiddag'?'0+0+'+n+'+0':tail==='morgen og kveld'?n+'+'+n:n+times[tail];}
   else if(/^(\d+) ganger daglig$/.test(tail))s=n+'x'+tail.match(/^\d+/)[0];
   else if(/^inntil (\d+) ganger daglig$/.test(tail))s=n+'→ x '+tail.match(/\d+/)[0];
   else if(/^(ukentlig|hver uke)( på [a-zæøå]+)?$/.test(tail))s=n+'u'+(tail.includes(' på ')?' '+tail.split(' på ')[1]:'');
  }
  let m=new RegExp('^('+numeric+')\\s*(?:u|ukentlig|hver uke)(?:\\s+(?:på\\s+)?([a-zæøå]+))?$').exec(s);
  if(m){const n=number(m[1]),day=m[2]?DAYS.find(d=>d.includes(m[2])):null;if(n<=0||m[2]&&!day)return {code:original,text:original,recognized:false};return done(fmt(n)+'u'+(day?' '+day[0]:''),quantity(n)+' ukentlig'+(day?' på '+day[1]:' (ukedag ikke angitt)'),{weekly:true,day:day?.[0]||'',amount:n});}
  m=new RegExp('^('+numeric+')\\s*(?:(→|->)\\s*)?x\\s*([1-9]\\d*)$').exec(s);
  if(m){const n=number(m[1]),times=Number(m[3]);if(n>0&&times<=24)return done(fmt(n)+(m[2]?'→ x ':'x')+times,quantity(n)+(m[2]?' inntil '+times+' ganger daglig':times===1?' daglig':' '+times+' ganger daglig'));}
  if(s.includes('+')){const parts=s.split('+').map(x=>x.trim());if([2,3,4].includes(parts.length)&&parts.every(x=>new RegExp('^'+numeric+'$').test(x))){const values=parts.map(number),labels={2:['morgen','kveld'],3:['morgen','middag','kveld'],4:['morgen','formiddag','ettermiddag','kveld']}[parts.length];if(values.some(n=>n>0))return done(values.map(fmt).join('+'),values.map((n,i)=>n?quantity(n)+' '+labels[i]:'').filter(Boolean).join(', '));}}
  return {code:original,text:original,recognized:false};
 }
 const EN_UNITS={tablett:['tablet','tablets'],kapsel:['capsule','capsules'],dråpe:['drop','drops'],dose:['dose','doses'],puff:['puff','puffs'],plaster:['patch','patches'],mg:['mg','mg'],'µg':['microgram','micrograms'],ml:['mL','mL'],IE:['IU','IU'],enhet:['unit','units']};
 const EN_DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
 function english(raw,unit='enhet'){
  const parsed=parse(raw,unit),original=String(raw??'').trim();
  const words=EN_UNITS[unit]||EN_UNITS.enhet,quantity=n=>String(n)+' '+words[n===1?0:1];
  const done=text=>({...parsed,text,translated:true});
  if(!original)return done('');
  if(parsed.recognized){
   const literals={uregelmessig:'Irregular use – specify dose and actual use',vb:'As needed – specify dose and actual use',eo:'As prescribed / according to medication chart','e.a':'As agreed',bil:'Bilaterally','h øye':'Right eye','v øye':'Left eye','0':'Temporarily withheld',S:'Discontinued'};
   if(parsed.code in literals)return done(literals[parsed.code]);
   if(parsed.weekly)return done(quantity(parsed.amount)+' once weekly'+(parsed.day?' on '+EN_DAYS[DAYS.findIndex(d=>d[0]===parsed.day)]:' (weekday not specified)'));
   const m=/^(\d+(?:,\d+)?)(→ x |x)(\d+)$/.exec(parsed.code);
   if(m){const n=number(m[1]),times=Number(m[3]);return done(quantity(n)+(m[2]==='→ x '?' up to '+times+' times daily':times===1?' once daily':' '+times+' times daily'));}
   if(parsed.code.includes('+')){
    const values=parsed.code.split('+').map(number),labels={2:['in the morning','in the evening'],3:['in the morning','at midday','in the evening'],4:['in the morning','in the late morning','in the afternoon','in the evening']}[values.length];
    if(labels)return done(values.map((n,i)=>n?quantity(n)+' '+labels[i]:'').filter(Boolean).join(', '));
   }
  }
  // An explicit unit in prose takes precedence over the selected shorthand unit.
  if(!parsed.recognized)for(const key of Object.keys(UNITS))if(key!==unit&&parse(original,key).recognized)return english(original,key);
  // Translate only this complete, unambiguous PRN sentence pattern; never replace
  // fragments in arbitrary instructions (which could omit negation or conditions).
  const unitNames=Object.entries(UNITS).flatMap(([key,forms])=>forms.map(word=>[word,key]));
  const unitPattern=[...new Set(unitNames.map(([word])=>word))].sort((a,b)=>b.length-a.length).join('|');
  const amount='('+numeric+')(?:\\s*[–-]\\s*('+numeric+'))?';
  const free=new RegExp('^'+amount+'\\s+('+unitPattern+')\\s+(ved behov|ved smerter)(?:,?\\s*(?:maks(?:imalt)?\\.?|maksimum)\\s+('+numeric+')(?:\\s+('+unitPattern+'))?\\s+(?:per døgn|daglig))?\\.?$').exec(clean(original));
  if(free){
   const n=number(free[1]),end=free[2]?number(free[2]):null;
   if(n>0&&(end===null||end>=n)&&(!free[5]||number(free[5])>0)){
    const key=unitNames.find(([word])=>word===free[3])[1],forms=EN_UNITS[key];
    let text=String(n)+(end===null?'':'–'+end)+' '+forms[end===null&&n===1?0:1]+(free[4]==='ved behov'?' as needed':' as needed for pain');
    if(free[5]){const max=number(free[5]),maxKey=free[6]?unitNames.find(([word])=>word===free[6])[1]:null;text+=', maximum '+max+(maxKey?' '+EN_UNITS[maxKey][max===1?0:1]:'')+' per day';}
    return done(text);
   }
  }
  return {...parsed,text:original,translated:false};
 }
 const api={DAYS,PRESETS,INITIATIVES,UNITS,parse,inferUnit,english};if(typeof module!=='undefined'&&module.exports)module.exports=api;if(root)root.IMMDose=api;
})(typeof window!=='undefined'?window:null);
