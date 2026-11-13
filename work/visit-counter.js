/* Minimal GoatCounter integration: no application state, forms, searches or URL parameters. */
(()=>{
 'use strict';
 const site=document.querySelector('meta[name="imm-stats-site"]')?.content||'';
 if(!/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.goatcounter\.com$/.test(site))return;
 if(location.hostname!=='anadtaiy.github.io'||!['/imm-kompass/','/imm-kompass/index.html','/imm-kompass/om-meg.html'].includes(location.pathname))return;
 if(window.self!==window.top||navigator.webdriver||navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true||typeof fetch!=='function')return;
 let sent=false;
 function countVisit(){
  if(sent||document.visibilityState!=='visible'||document.prerendering)return;
  sent=true;
  document.removeEventListener('visibilitychange',countVisit);
  document.removeEventListener('prerenderingchange',countVisit);
  // Constant values deliberately group all app pages into one visit, including source tabs.
  const query=new URLSearchParams({p:'/imm-kompass/',t:'IMM Kompass',r:''});
  fetch(site+'/count?'+query,{method:'GET',mode:'no-cors',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',keepalive:true}).catch(()=>{});
 }
 document.addEventListener('visibilitychange',countVisit);
 document.addEventListener('prerenderingchange',countVisit);
 countVisit();
})();
