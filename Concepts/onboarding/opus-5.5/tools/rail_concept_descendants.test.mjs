// Execute shipped-data expanded builders, not a hand-maintained marker fixture.
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const base='../../../leftrail-redesign/src/';
const rules=JSON.parse(read('./active_descendant_rules.json')).rules;
class DomNode {
 constructor(tag='#text',text=''){this.tag=tag;this.attrs={};this.childNodes=[];this.parentNode=null;this.dataset={};this._text=text;this.listeners={};this.style={setProperty(k,v){this[k]=v;}};}
 get children(){return this.childNodes.filter(n=>n.tag!=='#text');}
 get className(){return this.attrs.class||'';} set className(v){this.attrs.class=String(v);}
 get classes(){return this.className.split(/\s+/).filter(Boolean);}
 get classList(){const self=this;return {contains:c=>self.classes.includes(c),add(...cs){self.className=[...new Set([...self.classes,...cs])].join(' ');},remove(...cs){self.className=self.classes.filter(c=>!cs.includes(c)).join(' ');},toggle(c,on){on=on??!self.classes.includes(c);this[on?'add':'remove'](c);return on;}};}
 get textContent(){return this._text+this.childNodes.map(n=>n.textContent).join('');} set textContent(v){this._text=String(v??'');this.childNodes=[];}
 set innerHTML(html){this.childNodes=[];const stack=[this];for(const m of String(html).matchAll(/<\/?([\w:-]+)\b([^>]*?)>/g)){const tag=m[1];if(m[0][1]==='/'){if(stack.length>1)stack.pop();continue;}const n=new DomNode(tag);for(const a of m[2].matchAll(/([\w:-]+)="([^"]*)"/g))n.setAttribute(a[1],a[2]);stack.at(-1).appendChild(n);if(!m[0].endsWith('/>')&&!['br','input','img','hr'].includes(tag))stack.push(n);}}
 appendChild(n){if(!(n instanceof DomNode))n=new DomNode('#text',String(n));n.parentNode=this;this.childNodes.push(n);return n;}
 append(...ns){ns.flat(Infinity).filter(n=>n!=null&&n!==false).forEach(n=>this.appendChild(n));}
 setAttribute(k,v){this.attrs[k]=String(v);if(k==='hidden')this.hidden=true;}getAttribute(k){return this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];if(k==='hidden')this.hidden=false;}
 addEventListener(k,f){(this.listeners[k]??=[]).push(f);}removeEventListener(){}
 click(){for(const f of this.listeners.click||[])f({target:this,preventDefault(){},stopPropagation(){}});}
 matches(s){return s.split(',').some(sel=>{const tag=/^[\w-]+/.exec(sel)?.[0];if(tag&&tag!==this.tag)return false;if([...sel.matchAll(/\.([\w-]+)/g)].some(m=>!this.classes.includes(m[1])))return false;return [...sel.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)].every(m=>this.getAttribute(m[1])!=null&&(m[2]===undefined||this.getAttribute(m[1])===m[2]));});}
 querySelectorAll(s){return descendants(this).filter(n=>n.matches(s));}querySelector(s){return this.querySelectorAll(s)[0]||null;}
 getContext(){return {measureText:s=>({width:String(s).length*8})};}
}
const descendants=n=>n.children.flatMap(c=>[c,...descendants(c)]);
const doc={createElement:t=>new DomNode(t),createTextNode:t=>new DomNode('#text',t),addEventListener(){},documentElement:{getAttribute:k=>k==='data-motion'?'reduced':null}};
const ctx=vm.createContext({document:doc,Node:DomNode,window:{},addEventListener(){},localStorage:{getItem:()=>null,setItem(){}},MutationObserver:class{observe(){}},setTimeout:()=>0,clearTimeout(){},console});
ctx.window=ctx;
vm.runInContext(read(base+'js/00-core.js')+'\n'+read(base+'js/10-glyphs.js')+'\n'+read(base+'js/20-menu.js')+'\n'+['05-data-files.js','06-data-source.js','07-data-docker.js','08-data.js'].map(p=>read(base+'js/'+p)).join('\n'),ctx);
const evaluate=s=>vm.runInContext(s,ctx);
evaluate(read(base+'js/12-rules.js'));
ctx.PMR.concepts={register(){}};
const aSrc=read(base+'concepts/a/00-a.js')+'\n'+read(base+'concepts/a/20-source.js');
evaluate('(function(PMR){'+aSrc+'\nglobalThis.A6={row,detailOf,sourceRowOpts,actionRow,factsBlock};})(PMR)');
evaluate('(function(PMR){'+read(base+'concepts/b/00-b.js')+'\n'+read(base+'concepts/b/15-views.js')+'\nglobalThis.B6={row,itemBody,itemRow,itemDesc,areaDesc,actRow,actionList};})(PMR)');
const cSrc=['00-c.js','05-lens.js','08-panel.js','10-files.js','20-source.js','30-docker.js'].map(p=>read(base+'concepts/c/'+p)).join('\n');
evaluate('(function(PMR){'+cSrc+'\nglobalThis.C6={specs:C_SPECS,cDocFor,cItemRow,cLensDoc,cActRow,cRowFactory:(P,panel)=>{'+read(base+'concepts/c/08-panel.js').match(/  P\.row = o => \{[^]*?\n  };/)[0]+'return P.row;}};})(PMR)');
const panels=evaluate('Object.values(PMR.data)');
const cases=[], branches=Object.fromEntries(['note','preview','metrics','hunks','children','ports','facts','extra','actions','danger','primary','disabled','menu','key'].map(k=>[k,0]));
const allActions=[];
function objects(v,out=[]){if(!v||typeof v!=='object')return out;if(!Array.isArray(v))out.push(v);for(const x of Object.values(v))if(x&&typeof x==='object')objects(x,out);return out;}
const opened=new Set();
function openDisclosures(root){for(let round=0;round<20;round++){const ns=[root,...descendants(root)].filter(n=>n.getAttribute('aria-expanded')==='false'&&(n.listeners.click||[]).length);if(!ns.length)return;for(const n of ns){n.click();opened.add(n);}}throw Error('disclosures did not settle');}
for(const panel of panels){
 ctx.panel=panel;
 const inst={pid:panel.id,panel,menus:panel.menus,open:{get:()=>true,has:()=>true,set(){}}};ctx.inst=inst;
 const items=objects(panel).filter(v=>v.id&&v.name&&v.kind);
 for(const action of objects(panel).filter(v=>v.label&&(v.cmd||v.local||v.menu||v.commandId||v.uiActionId))){allActions.push({panel,action});for(const k of ['danger','primary','disabled','menu','key'])if(action[k])branches[k]++;}
 for(const item of items){
  ctx.item=item;ctx.opts={menus:panel.menus};
  const actualView=[...(panel.views||[]),...(panel.jjViews||[])].find(v=>objects(v).includes(item))||panel.views[0];ctx.actualView=actualView;
  if(panel.id==='source'){
   const v=[...(panel.views||[]),...(panel.jjViews||[])].find(v=>(v.sections||[]).some(s=>(s.items||[]).includes(item)));
   const sec=v?.sections?.find(s=>(s.items||[]).includes(item));
   if(sec){ctx.view=v;ctx.sec=sec;ctx.opts=evaluate('A6.sourceRowOpts(inst,sec,view)');}
  }
  const opts=ctx.opts;
  for(const k of ['note','preview','metrics','hunks','children','ports','facts','actions'])if(item[k]&&(!Array.isArray(item[k])||item[k].length))branches[k]++;
  if(opts.extra)branches.extra++;
  const ar=evaluate('A6.row(inst,item,opts)');assert(!ar.classes.includes('is-flat')||!evaluate('!!(item.actions?.length||item.facts?.length||item.note||item.preview||item.hunks?.length||item.children?.length||item.ports?.length||item.metrics?.length||opts.extra)'));openDisclosures(ar);cases.push({name:'A '+panel.id+'/'+item.id,root:ar});
  // B details are a sibling drill page, never an invented child of the index row.
  ctx.st={panel,menus:panel.menus};const desc=evaluate('B6.itemDesc(st,item,[item],{})');const bdoc=ctx.PMR.h('div.pmr-b-content',desc.build());openDisclosures(bdoc);cases.push({name:'B open '+panel.id+'/'+item.id,root:bdoc});
  const br=evaluate('B6.itemRow(st,item,[item],{})');cases.push({name:'B index '+panel.id+'/'+item.id,root:br});
  ctx.P={panel,viewId:actualView.id,viewDef:()=>actualView,menus:panel.menus,sel:item.id,reg(){}};evaluate('P.spec=C6.specs[panel.id];P.row=C6.cRowFactory(P,panel)');
  const cr=evaluate('C6.cItemRow(P,item,{})');cases.push({name:'C index '+panel.id+'/'+item.id,root:cr});
  const cd=evaluate('C6.cDocFor(P,item,{})');openDisclosures(cd);cases.push({name:'C open '+panel.id+'/'+item.id,root:cd});
 }
}
// Public kit variants use real shipped actions. A child button is not itself the cursor carrier.
for(const panel of panels)for(const menu of Object.values(panel.menus||{}))for(const group of menu.groups||[])for(const item of group.items||[]){
 ctx.menu=menu;ctx.menuItem=item;cases.push({name:'PMR shipped menu '+panel.id+'/'+menu.id+'/'+item.label,root:evaluate('menuItemEl(menu,menuItem,{reserveIcon:true})')});
}
for(const {panel,action} of allActions)for(const variant of ['text','icon','primary','quiet','row']){
 ctx.action=action;ctx.panel=panel;ctx.variant=variant;
 const carrier=ctx.PMR.h('div.pmr-a-row.pmr-cur',ctx.PMR.h('div.pmr-a-detail',evaluate('PMR.button(action,{variant,menus:panel.menus})')));
 cases.push({name:'kit '+variant+'/'+action.label,root:carrier});
}
for(const [branch,n] of Object.entries(branches))assert(n>0,'shipped fixtures must exercise '+branch);
const failures=new Map(), counts={}, inherited={};
for(const {name,root} of cases)for(const carrier of [root,...descendants(root)]){
 const ids=[],role=carrier.getAttribute('role'),enabled=carrier.getAttribute('aria-disabled')!=='true';
 if(carrier.classes.includes('pmr-cur')&&enabled)ids.push(13,14);
 if(carrier.classes.includes('pmr-mi'))ids.push(2);
 if((role==='option'&&enabled)||role==='menuitem')ids.push(0);
 if(role==='option'||role==='menuitemradio')ids.push(6);
 for(const id of ids){const r=rules.find(r=>r.rule===id);const match=r.replacement.match(/:where\(([^()]*)\)\s*$/);assert(match,'class keyed descendant rule '+id);const allowed=new Set([...match[1].matchAll(/\.([\w-]+)/g)].map(m=>m[1]));
  for(const el of descendants(carrier)){
   counts[id]=(counts[id]||0)+1;if(el.classes.some(c=>allowed.has(c)))continue;
   if(['svg','path','rect','circle','g','line','polyline','polygon','ellipse','defs','mask','br'].includes(el.tag)&&el.classes.length===0){inherited[id]=(inherited[id]||0)+1;continue;}
   const feature=el.classes.includes('pmr-btn')?'pmr-btn':el.classes[0]||'<'+el.tag+'>';
   const key=id+':'+feature;if(!failures.has(key))failures.set(key,{rule:id,feature,elements:0,samples:[]});const f=failures.get(key);f.elements++;if(f.samples.length<4)f.samples.push(name+': '+el.tag+'.'+el.classes.join('.'));
  }
 }
}
const result={cases:cases.length,shippedPanels:panels.map(p=>p.id),branches,openedDisclosures:opened.size,counts,inherited,missing:[...failures.values()]};
const output=process.argv.find(x=>x.startsWith('--out='))?.slice(6);if(output)writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
assert.equal(failures.size,0,'real shipped expanded builders lost descendant features');
console.log('PASS shipped A/B/C expanded rows, drill pages, Lens documents and shared kit variants');
