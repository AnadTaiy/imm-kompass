const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const sandbox={DATA:{catalog:{interactions:[],substanceRelations:{}}},state:{meds:[]},document:{addEventListener(){},querySelectorAll:()=>[]},window:{addEventListener(){}},URL,location:{href:'https://example.test/'},esc:s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;')};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(__dirname+'/interactions.js','utf8'),sandbox);
const route=edges=>{sandbox.edges=edges;return vm.runInContext('layoutInteractionRoutes(edges)',sandbox);};
let checks=0;
function validate(edges){const input=JSON.stringify(edges),layout=route(edges);assert.equal(JSON.stringify(edges),input);assert.equal(layout.routes.length,edges.length);checks+=2;for(const a of layout.routes){assert.ok(a.x+10<=layout.width);assert.ok(!/NaN|undefined/.test(a.d));assert.ok(a.top<=a.bottom);checks+=3;for(const b of layout.routes)if(a.key<b.key&&a.top-14<=b.bottom+14&&b.top-14<=a.bottom+14){assert.notEqual(a.lane,b.lane,'overlapping intervals share a vertical track');checks++;}}return layout;}
assert.equal(route([]).routes.length,0);checks++;
const many=validate(Array.from({length:20},(_,i)=>({key:'nested-'+i,y1:40+i*32,y2:1800-i*32,level:i%2+1})));
assert.equal(new Set(many.routes.map(r=>r.x)).size,20);checks++;
const separate=validate([{key:'a',y1:20,y2:100},{key:'b',y1:150,y2:250}]);assert.equal(separate.routes[0].lane,separate.routes[1].lane);checks++;
validate([{key:'shared-top-a',y1:50,y2:160},{key:'shared-top-b',y1:50,y2:280},{key:'cross',y1:120,y2:380},{key:'reversed',y1:550,y2:260},{key:'short',y1:580,y2:585}]);
const example=Array.from({length:16},(_,i)=>({key:'p'+i,y1:30+i*43,y2:900+i*63}));const normal=validate(example);assert.deepEqual(JSON.parse(JSON.stringify(normal)),JSON.parse(JSON.stringify(route([...example].reverse()))));checks++;
assert.equal(route([{key:'broken',y1:NaN,y2:50}]).routes.length,0);checks++;
// Exercise public markup: pair numbering does not change severity or source URL.
vm.runInContext(`state.meds=[{id:'a',name:'Test A'},{id:'b',name:'Test B'}];interactionCache={key:'a::::Test A|b::::Test B',pairs:[{key:'pair-a:b',a:'a',b:'b',number:12,level:1,ids:['test-source']}]};interactionIndex.set('test-source',{condition:''});`,sandbox);
const markup=vm.runInContext('interactionFlags(state.meds[0])',sandbox);
assert.ok(markup.includes('level-1'));assert.ok(markup.includes('>12</button>'));assert.ok(markup.includes('interactions=test-source'));assert.ok(markup.includes('mark-interaction-pair'));checks+=4;
console.log('PASS: '+checks+' interaction routing, crowded-lane and source-link checks.');
