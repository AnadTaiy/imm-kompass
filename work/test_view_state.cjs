const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
let checks=0,frames=[],details=[],scrolls=[],focused=null,draws=0;
const main={dataset:{viewKey:'workspace:1'},contains:n=>!!n,querySelectorAll:s=>s==='details'?details:s==='.tablewrap,.interaction-rail-viewport'?scrolls:[]};
const document={querySelector:s=>s==='#main'?main:null,get activeElement(){return focused;},querySelectorAll:()=>[]};
const window={scrollX:0,scrollY:500,scrollTo(p){this.scrollX=p.left;this.scrollY=p.top;}};
const context={document,window,requestAnimationFrame:fn=>frames.push(fn),setTimeout(){},console,drawInteractionLines(){draws++;},$:s=>document.querySelector(s)};
vm.createContext(context);vm.runInContext("let page='workspace',step=1;",context);vm.runInContext(fs.readFileSync(__dirname+'/view-state.js','utf8'),context);
const run=s=>vm.runInContext(s,context),check=(name,f)=>{f();checks++;};
function detail(key,open){return {dataset:{uiKey:key},id:'',open};}
details=[detail('med:a:decision',true),detail('med:b:decision',false)];scrolls=[{scrollLeft:88,scrollTop:0}];
run('var plan=prepareWorkRender()');details=[detail('med:b:decision',true),detail('med:a:decision',false)];scrolls=[{scrollLeft:0,scrollTop:0}];run('restoreWorkRender(plan)');
check('open/closed disclosure follows stable identity after reorder',()=>{assert.equal(details[0].open,false);assert.equal(details[1].open,true);});
window.scrollY=0;frames.shift()();check('scroll offsets restored after layout',()=>{assert.equal(window.scrollY,500);assert.equal(scrolls[0].scrollLeft,88);assert.equal(draws,1);});
run("page='journal';var newPage=prepareWorkRender({resetScroll:true})");check('different workflow view does not inherit old disclosure state',()=>assert.equal(run('newPage.view'),undefined));
run('restoreWorkRender(newPage)');frames.shift()();check('intentional navigation starts at top',()=>assert.equal(window.scrollY,0));
run("page='workspace';step=1;var returnPlan=prepareWorkRender()");check('original workflow retains its saved section state',()=>assert.equal(run('returnPlan.view.details[0][0]'),'med:b:decision'));
run('startEditReturn();var edit=takeEditReturn()');check('editor return snapshot is consumed once',()=>{assert.ok(run('edit'));assert.equal(run('takeEditReturn()'),null);});
run('resetWorkViews()');check('switching review clears all view memory',()=>{assert.equal(run('workViews.size'),0);assert.equal(main.dataset.viewKey,undefined);});
main.dataset.viewKey='workspace:1';run('var stale=prepareWorkRender();restoreWorkRender(stale);resetWorkViews()');const previousDraws=draws;frames.shift()();check('old scheduled restoration cannot affect next review',()=>assert.equal(draws,previousDraws));
const fake={dataset:{},id:'',closest:()=>({dataset:{medRow:'a'}}),querySelector:()=>({querySelector:()=>null,textContent:'  Beslutning   / endring '})};context.fake=fake;
check('fallback disclosure key is row-specific',()=>assert.equal(run('detailViewKey(fake,0)'),'a:Beslutning / endring'));
const heading={dataset:{},id:'',closest:()=>null,querySelector:()=>({querySelector:()=>({textContent:'START'}),textContent:'START 12 kontrollpunkter'})};context.heading=heading;
check('section identity ignores changing count in its summary',()=>assert.equal(run('detailViewKey(heading,0)'),':START'));
// Exercise the real partial refresh: both medicine disclosures and START details
// are replaced, without rebuilding #main or changing the current view.
main.dataset.viewKey='workspace:1';details=[detail('med:a:actions',true),detail('start:criterion',true)];scrolls=[{scrollLeft:91,scrollTop:0}];window.scrollY=730;
const comparison={set innerHTML(value){details=[detail('med:a:actions',false),details[1]];scrolls=[{scrollLeft:0,scrollTop:0}];}};
context.$=s=>s==='#main'?main:s==='#med-comparison'?comparison:null;
context.medTable=()=>'<table></table>';context.refreshStart=()=>{details[1]=detail('start:criterion',false);};context.refreshCriterionCandidates=()=>{};
const older=fs.readFileSync(__dirname+'/older-ui.js','utf8');vm.runInContext(older.slice(older.indexOf('function refreshOlder(){'),older.indexOf('\nfunction olderAction')),context);
run('refreshOlder()');check('partial medicine and START refresh preserves open details',()=>assert.ok(details.every(n=>n.open)));
window.scrollY=0;frames.shift()();check('partial refresh retains page and table scroll',()=>{assert.equal(window.scrollY,730);assert.equal(scrolls[0].scrollLeft,91);});
// A subsequent refreshStart call from profile updates must not close nested
// criterion text or create a competing asynchronous page restoration.
let startRoot;const startNode=items=>({querySelectorAll:()=>items,set outerHTML(value){startRoot=startNode([detail('start:panel',true),detail('criterion:START-K2',false)]);}});
startRoot=startNode([detail('start:panel',false),detail('criterion:START-K2',true)]);
context.$=s=>s==='#main'?main:s==='#start-review'?startRoot:null;context.startPanel=()=>'<section></section>';
vm.runInContext(older.slice(older.indexOf('function refreshStart(){'),older.indexOf('\nfunction refreshOlder')),context);
const queued=frames.length;run('refreshStart()');check('standalone START refresh retains outer and nested disclosure states',()=>{assert.equal(startRoot.querySelectorAll()[0].open,false);assert.equal(startRoot.querySelectorAll()[1].open,true);assert.equal(frames.length,queued);});
run("let filters={q:'nyre',tags:['nyre'],interactionDatabases:true};let sourceContext={atc:'B01AF02'};resetWorkViews();");
check('review switch clears old search and drug context',()=>{assert.equal(run('filters.q'),'');assert.equal(run('filters.tags.length'),0);assert.equal(run('Object.keys(sourceContext).length'),0);assert.equal(run('filters.interactionDatabases'),undefined);});
console.log('PASS: '+checks+' disclosure identity, scroll, navigation and review isolation checks.');
