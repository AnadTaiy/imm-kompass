const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/visit-counter.js','utf8');
function simulate(options={}){
 const requests=[],events=new Map();
 const document={visibilityState:options.hidden?'hidden':'visible',prerendering:!!options.prerendering,querySelector:()=>({content:options.site??'https://imm-example.goatcounter.com'}),addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name)};
 for(const prop of ['title','referrer','forms','body','cookie'])Object.defineProperty(document,prop,{get(){throw new Error('Must not read '+prop);}});
 const window={self:{}};window.top=options.frame?{}:window.self;
 const location={hostname:options.host??'anadtaiy.github.io',pathname:options.path??'/imm-kompass/'};
 for(const prop of ['href','search','hash'])Object.defineProperty(location,prop,{get(){throw new Error('Must not read full or clinical URL');}});
 const navigator={webdriver:!!options.bot,doNotTrack:options.dnt,globalPrivacyControl:options.gpc};
 const context={document,window,location,navigator,URLSearchParams,fetch:(url,init)=>{requests.push({url,init});return options.fail?Promise.reject(new Error('Blocked')):Promise.resolve();}};
 for(const prop of ['state','localStorage','sessionStorage'])Object.defineProperty(context,prop,{get(){throw new Error('Must not read stored review');}});
 vm.runInNewContext(code,context);
 return {requests,document,events};
}
const normal=simulate();assert.equal(normal.requests.length,1);
const request=normal.requests[0],url=new URL(request.url);
assert.equal(url.origin,'https://imm-example.goatcounter.com');assert.equal(url.pathname,'/count');
assert.deepEqual([...url.searchParams],[['p','/imm-kompass/'],['t','IMM Kompass'],['r','']]);
assert.equal(request.init.credentials,'omit');assert.equal(request.init.referrerPolicy,'no-referrer');assert.equal(request.init.mode,'no-cors');
assert.equal(request.init.method,'GET');assert.equal(request.init.cache,'no-store');
for(const options of [{site:''},{site:'https://user:example@imm-example.goatcounter.com'},{site:'https://imm-example.goatcounter.com/?token=example'},{site:'https://example.com'},{site:'http://imm-example.goatcounter.com'},{host:'127.0.0.1'},{host:'localhost'},{path:'/pk-lab/'},{frame:true},{bot:true},{dnt:'1'},{gpc:true}])assert.equal(simulate(options).requests.length,0,JSON.stringify(options));
for(const path of ['/imm-kompass/','/imm-kompass/index.html','/imm-kompass/om-meg.html'])assert.equal(new URL(simulate({path}).requests[0].url).searchParams.get('p'),'/imm-kompass/');
const hidden=simulate({hidden:true});assert.equal(hidden.requests.length,0);hidden.document.visibilityState='visible';hidden.events.get('visibilitychange')();assert.equal(hidden.requests.length,1);assert.equal(hidden.events.size,0);
const pre=simulate({prerendering:true});assert.equal(pre.requests.length,0);pre.document.prerendering=false;pre.events.get('prerenderingchange')();assert.equal(pre.requests.length,1);
simulate({fail:true});
setImmediate(()=>console.log('Visit counter privacy and activation checks passed.'));
