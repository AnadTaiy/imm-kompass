/* Animate original vector paths in temporary groups; never modify their geometry. */
(()=>{
 const logo=document.querySelector('.brand-logo'),key='imm-logo-intro-v1',wrappers=[];
 const restore=()=>wrappers.forEach(g=>{const path=g.firstElementChild;if(path)g.replaceWith(path);});
 try{
  if(!logo||matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem(key))return;
  const group=logo.querySelector('g'),letters=[...group.children];
  if(letters.length!==3||!letters.every(p=>p.tagName.toLowerCase()==='path')||typeof letters[0].animate!=='function')return;
  const positions=letters.map(p=>p.transform.baseVal.consolidate().matrix.e);
  const movements=[[letters[0],positions[1]-positions[0]],[letters[2],positions[1]-positions[2]]];
  sessionStorage.setItem(key,'1');
  const animations=movements.map(([path,offset])=>{
   const wrapper=document.createElementNS('http://www.w3.org/2000/svg','g');
   wrapper.setAttribute('data-logo-animation','');path.before(wrapper);wrapper.append(path);wrappers.push(wrapper);
   return wrapper.animate([{transform:`translateX(${offset}px)`},{transform:'translateX(0px)'}],{duration:1200,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'});
  });
  Promise.all(animations.map(a=>a.finished)).then(restore,restore);
 }catch{restore();}
})();
