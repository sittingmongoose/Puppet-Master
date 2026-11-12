// Real A/B/C row builders must retain their text parts after * becomes a class allow-list.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read = p => readFileSync(new URL(p,import.meta.url),'utf8');
const rules = JSON.parse(read('./active_descendant_rules.json')).rules;
const src = kind => read('../../../leftrail-redesign/src/concepts/'+kind+'/00-'+kind+'.js');
const fn = (s,n) => {const m=s.match(new RegExp('function '+n+'\\([^]*?\\n}'));assert.ok(m,n);return m[0];};
function h(spec,attrs,...kids) {
 const [tag,...classes]=spec.split('.');
 if(!attrs || typeof attrs!=='object' || Array.isArray(attrs) || attrs.tag){kids.unshift(attrs);attrs={};}
 const own=[attrs.class||[]].flat().filter(Boolean).join(' ').split(/\s+/).filter(Boolean);classes.push(...own);
 return {tag,attrs,classes,children:kids.flat(Infinity).filter(k=>k&&k.tag),dataset:{},
 append(...xs){this.children.push(...xs.flat(Infinity).filter(x=>x&&x.tag));},appendChild(x){this.append(x);},addEventListener(){},setAttribute(k,v){this.attrs[k]=v;},
 classList:{add(...cs){classes.push(...cs);}},matches(sel){return sel===tag;}};
}
const common={h,PMR:{hover(){},actionAttrs:()=>({})},cx:(...xs)=>xs.flat().filter(Boolean).join(' '),plain:String,asList:x=>Array.isArray(x)?x:x?[x]:[]};
const glyphSrc=read('../../../leftrail-redesign/src/js/10-glyphs.js');
const statuses=vm.createContext({PMR:{h},glyph:()=>null});
vm.runInContext(fn(glyphSrc,'statusEl')+'\n'+fn(glyphSrc,'letterEl'),statuses);
const statusEl=statuses.statusEl,letterEl=statuses.letterEl;
const a=vm.createContext({...common,inst:{open:new Map()},item:{id:'fixture',name:'Fixture',actions:[]}});
vm.runInContext(['row','hasDetail','primaryOf','nameEl','diffEl'].map(n=>fn(src('a'),n)).join('\n'),a);
const ar=vm.runInContext('row(inst,item,{flat:true,l2:()=>[]})',a);
const b=vm.createContext({...common,statusEl,PMR:{...common.PMR,letterEl:()=>null}});vm.runInContext(fn(src('b'),'row')+'\n'+fn(src('b'),'subLine'),b);
const br=vm.runInContext('row({key:"fixture",name:"Fixture",meta:["One fact"],selected:true,extra:[subLine({letter:"M",status:{word:"Modified",state:"changed"}}),statusEl({word:"Modified",state:"changed"})]})',b);
const cs=read('../../../leftrail-redesign/src/concepts/c/08-panel.js');const c=vm.createContext({...common,statusEl,letterEl,P:{sel:'fixture',viewId:'fixture',reg(){}},panel:{id:'fixture'}});
vm.runInContext(cs.match(/  P\.row = o => {[^]*?\n  };/)[0],c);
const cr=vm.runInContext('P.row({key:"fixture",name:"Fixture",lead:letterEl("M"),end:statusEl({word:"Modified",state:"changed"})})',c);
const menuSrc=read('../../../leftrail-redesign/src/js/20-menu.js');
const menu=vm.createContext({...common,PMR:{...common.PMR,h},selectable:m=>m.value!=null});
vm.runInContext(menuSrc.match(/const CHECK_SVG = [^]*?;/)[0]+'\n'+fn(menuSrc,'menuItemEl'),menu);
const plainMenu=vm.runInContext('menuItemEl({},{label:"Fixture",meta:"Meta",key:"K"},{reserveIcon:true})',menu);
const radioMenu=vm.runInContext('menuItemEl({value:"v"},{label:"Fixture",value:"v",meta:"Meta",key:"K"},{reserveIcon:true})',menu);
const all=n=>n.children.flatMap(k=>[k,...all(k)]), failures=[];
for(const [name,row,ids] of [['A',ar,[13,14]],['B',br,[13,14]],['C',cr,[0,6,13,14]],['PMR menu',plainMenu,[0,13,14]],['PMR radio',radioMenu,[6,13,14]]]) for(const id of ids) {
 const r=rules.find(r=>r.rule===id),allowed=new Set([...r.replacement.matchAll(/\.([\w-]+)/g)].map(m=>m[1]));
 for(const el of all(row)) if(!el.classes.some(x=>allowed.has(x)))failures.push(`${name} rule ${id}: ${el.tag}.${el.classes.join('.')}`);
}
for(const f of failures)console.log('FAIL '+f);
assert.equal(failures.length,0,'A/B/C builders lost descendant arms');
console.log('PASS actual A/B/C row and PMR menu builders retain text descendants in normal and chosen cursor rules');
