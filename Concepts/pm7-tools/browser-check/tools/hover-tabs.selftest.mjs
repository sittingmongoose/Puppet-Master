import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../checks/perf-hover-restyle.check.mjs',import.meta.url),'utf8');
const a=source.indexOf('const SCEN ='),b=source.indexOf('async function frameOffset',a);
function plan(selected) {
 const tabs=Array.from({length:3},(_,i)=>({getAttribute:(k)=>k==='aria-selected'?String(selected.includes(i)):null,getBoundingClientRect:()=>({left:i*100,top:100,width:80,height:30,bottom:130})}));
 const document={querySelectorAll:()=>[{querySelectorAll:()=>tabs}],elementFromPoint:(x)=>({closest:()=>tabs[Math.floor(x/100)]})};
 return new Function('document',source.slice(a,b)+'\nreturn SCEN.tab.find();')(document);
}
assert.deepEqual(plan([0]),[{x:140,y:115},{x:40,y:115}],'first click must leave the currently selected tab');
assert.deepEqual(plan([2]),[{x:40,y:115},{x:240,y:115}],'use the selected tab even when it is third in DOM order');
assert.equal(plan([]),null,'unknown initial selection is unjudgeable');
assert.equal(plan([0,1]),null,'ambiguous initial selection is unjudgeable');
console.log('PASS tab plan starts with an unselected tab, alternates real selections, and rejects unknown/ambiguous state');
