// Expanded real-page selector census. Uses rail_layer's review extras without replacing any builder.
// browser-check run <this file> --config <kit config> --set page=<build URL> --set bundle=<review JSON> --set out=<JSON>
import {readFileSync,writeFileSync} from 'node:fs';
import {installRailReview,visitExpandedRails} from './rail_expanded_states.mjs';
import {muteSound} from '../../../pm7-tools/browser-check/helpers/quiet-page.mjs';
const RULES=JSON.parse(readFileSync(new URL('./active_descendant_rules.json',import.meta.url),'utf8')).rules;
const RULE0=RULES[0].original;
const DECLS={0:'color:inherit!important;-webkit-text-fill-color:currentColor',1:'color:inherit!important;-webkit-text-fill-color:currentColor',2:'color:inherit!important',3:'color:inherit;-webkit-text-fill-color:currentColor',5:'color:var(--pm-switch-ink-on,var(--text-primary))!important',6:'color:inherit!important;-webkit-text-fill-color:currentColor',7:'color:inherit!important;-webkit-text-fill-color:currentColor',8:'color:inherit!important;-webkit-text-fill-color:currentColor',9:'color:inherit;-webkit-text-fill-color:currentColor',10:'animation:none!important',11:'color:inherit;-webkit-text-fill-color:currentColor',13:'color:inherit!important;-webkit-text-fill-color:currentColor',14:'color:inherit!important;-webkit-text-fill-color:currentColor'};
const FORCE = [
  { cls: 'o55np-cur-over', sel: RULE0.slice(RULE0.indexOf(':is('), RULE0.lastIndexOf('.o55np-cur-over')) },
  { cls: 'pmh-on', sel: ':is([data-pmh-kind="icon"]:not(.activity-bar .icon), .pmw-tab, #projectMenuBtn, #themeSelect)' },
  { cls: 'active', sel: '.pmr-menu .pmr-mi' },
  { cls: 'selected', sel: '#sidePanelSlot .fm-row' },
  { cls: 'o55np-cur-over', sel: '#sidePanelSlot :is(.pmr-cur, .fm-row, .pm-segtab-item)' },
  { cls: 'active', sel: '#pm-settings-root .domain-link' },
  { cls: 'pill-fit-measure', sel: '.side-panel-slot' },
  { cls: 'active', sel: '#pm-settings-root .rail-scroll > .side-link' },
  { cls: 'active', sel: '.orch-tabs .orch-tab' },
  { cls: 'active', sel: '.pmu-navbtn' },
  // rule 6: every selected-state signal of its :is() list
  { cls: 'is-selected', sel: '.pm6-tb-menu-item' },
  { attr: ['aria-checked', 'true'], sel: '.pm6-tt-mode, [role="menuitemradio"]' },
  { cls: 'active', sel: '.activity-bar .icon, .domain-link, .side-link, .workspace-tab, .manager-tab, .resource-row, .pm7u-navbtn, .pm7u-poprow, .orch-tab, .chat-dropdown-item, .chat-thread-item' },
  { cls: 'is-active', sel: '.index-link, .pm51-popout-item' },
  { cls: 'is-current', sel: '.page-index-title' },
  { cls: 'selected', sel: '.fm-row' },
  { attr: ['aria-selected', 'true'], sel: '[role="option"], .pm51-popout-item' },
];
FORCE.push({cls:'o55np-cur-over',sel:'.pmr-cur'},{cls:'is-current',sel:'.pmr-cur'},{attr:['aria-selected','true'],sel:'.pmr-cur'});
export default async function(t){
 await t.viewport(1920,1080);await muteSound(t.page);await t.emulate({reducedMotion:'no-preference'});
 const actualRules=t.args.rules?JSON.parse(readFileSync(String(t.args.rules),'utf8')).rules:RULES;
 const page=await t.app.open({query:'pm-warm=0',sandbox:false});
 await installRailReview(page,JSON.parse(readFileSync(String(t.args.bundle),'utf8')));
 const result={page:t.args.page,states:[],maxMatches:{},totalMatches:{},features:{},rawInherited:{},rawRestoreMax:{},rawStyleDifferences:[],mismatches:[],errors:[]};
 const save=()=>writeFileSync(String(t.args.out),JSON.stringify(result,null,1)+'\n');
 const check=async meta=>{
  const rows=await page.evaluate(([rules,force,decls])=>{
   const added=[],attrs=[];
   const describe=e=>{const path=[];for(let n=e;n&&path.length<4;n=n.parentElement)path.push(n.tagName.toLowerCase()+(n.id?'#'+n.id:'')+(n.classList.length?'.'+[...n.classList].join('.'):''));return path.join(' < ')+(e.children.length?'':' ['+e.textContent.trim().slice(0,60)+']');};
   const compare=forced=>rules.flatMap(r=>(r.variants||[r]).map((v,vi)=>{
    const a=[...document.querySelectorAll(v.original)],b=r.omit?[]:[...document.querySelectorAll(v.replacement)],sa=new Set(a),sb=new Set(b);
    const missing=a.filter(e=>!sb.has(e)),extra=b.filter(e=>!sa.has(e));
    // A non-inherited old declaration (notably rule 10's animation) always needs a direct selector.
    const colourOnly=decls[r.rule]?.split(';').filter(Boolean).every(d=>['color','-webkit-text-fill-color'].includes(d.split(':')[0]));
    const inherited=missing.filter(e=>colourOnly&&(e.namespaceURI==='http://www.w3.org/2000/svg'&&(!e.classList.length||e.matches('g.nx-st-base'))||e.tagName==='BR'));
    const real=missing.filter(e=>!inherited.includes(e));
    const feature=e=>e.matches('.pmr-btn')?'pmr-btn':e.matches('.pmr-btn-label')?'pmr-btn-label':e.classList.length?[...e.classList].sort().join('.'):'unmarked:'+e.tagName.toLowerCase();
    const groups={};for(const e of real){const k=feature(e);const g=groups[k]||={n:0,samples:[]};g.n++;if(g.samples.length<3&&!g.samples.includes(describe(e)))g.samples.push(describe(e));}
    const rawChanges=[];let rawRestore=null;
    if(forced&&inherited.length){const props=decls[r.rule].includes('-webkit-text-fill-color')?['color','-webkit-text-fill-color']:['color'];const values=()=>inherited.map(e=>props.map(p=>getComputedStyle(e).getPropertyValue(p)).join('|'));const before=values(),restored=window.__pmrOriginalSelectorProbe(v);rawRestore={rules:restored.rules,arms:restored.arms};let after;try{after=values();}finally{restored.restore();}for(let i=0;i<inherited.length;i++)if(before[i]!==after[i])rawChanges.push({el:describe(inherited[i]),before:before[i],original:after[i]});}
    const raw={};for(const e of inherited){const k=e.tagName.toLowerCase();raw[k]=(raw[k]||0)+1;}
    return {rule:r.rule,variant:vi,forced,original:a.length,replacement:b.length,groups,raw,rawChanges,rawRestore,extra:extra.map(describe),omitted:!!r.omit};
   }));
   const rows=compare(false);
   try{for(const f of force)for(const e of document.querySelectorAll(f.sel)){
    if(f.cls&&!e.classList.contains(f.cls)){e.classList.add(f.cls);added.push([e,f.cls]);}
    if(f.attr&&e.getAttribute(f.attr[0])!==f.attr[1]){attrs.push([e,f.attr[0],e.getAttribute(f.attr[0])]);e.setAttribute(f.attr[0],f.attr[1]);}
   }rows.push(...compare(true));}
   finally{for(const[e,c]of added)e.classList.remove(c);for(const[e,k,v]of attrs.reverse())v===null?e.removeAttribute(k):e.setAttribute(k,v);}
   return rows;
  },[actualRules,FORCE,DECLS]);
  const state={...meta,rules:rows.map(({rule,variant,forced,original,replacement})=>({rule,variant,forced,original,replacement}))};result.states.push(state);
  for(const row of rows){const r=row.rule;result.maxMatches[r]=Math.max(result.maxMatches[r]||0,row.original);result.totalMatches[r]=(result.totalMatches[r]||0)+row.original;
   for(const[k,n]of Object.entries(row.raw)){const raw=result.rawInherited[r]||={};raw[k]=(raw[k]||0)+n;}
   if(row.rawRestore)result.rawRestoreMax[r]={rules:Math.max(result.rawRestoreMax[r]?.rules||0,row.rawRestore.rules),arms:Math.max(result.rawRestoreMax[r]?.arms||0,row.rawRestore.arms)};
   if(row.rawChanges.length)result.rawStyleDifferences.push({state:result.states.length-1,rule:r,changes:row.rawChanges});
   for(const[k,g]of Object.entries(row.groups)){const group=(result.features[r]||={})[k]||={elements:0,states:0,samples:g.samples,first:meta};group.elements+=g.n;group.states++;}
   if(Object.keys(row.groups).length||row.extra.length||row.omitted&&row.original)result.mismatches.push({state:result.states.length-1,...row});
  }
  if(result.states.length%20===0){save();t.log('expanded census '+result.states.length+' '+JSON.stringify(meta));}
 };
 try{
  for(const look of String(t.args.looks||'nier-dark').split(',')){
   await t.app.look(look);if(look.startsWith('nier-')){const keys=await page.evaluate(()=>{const k=PM_NIER.PARTS.map(p=>p.key);PM_NIER.setParts(k);return k;});await page.waitForFunction(k=>PM_NIER.on()&&k.every(x=>(document.documentElement.getAttribute('data-o55-nier-parts')||'').split(/\s+/).includes(x)),keys,{timeout:45000});}
   for(const view of ['dashboard','projects','wizard','orchestrator','usage','settings']){await page.evaluate(v=>PM_PAGES.go(v),view);await t.page.waitForTimeout(80);await check({look,kind:'page',view});}
   const count=await page.locator('#pm-settings-root .domain-link').count();for(let i=0;i<count;i++){await page.locator('#pm-settings-root .domain-link').nth(i).evaluate(e=>e.click());await check({look,kind:'settings domain',domain:i});}
   await page.evaluate(()=>PM_PAGES.go('dashboard'));
   await visitExpandedRails(page,meta=>check({look,...meta}));
   // Exercise actual shared menu builder for every shipped panel menu, including submenus.
   const menus=await page.evaluate(()=>{const result=[];for(const p of Object.values(PMR.data))for(const[k,m]of Object.entries(p.menus||{}))result.push({panel:p.id,key:k});return result;});
   for(const m of menus){await page.evaluate(({panel,key})=>{const p=Object.values(PMR.data).find(p=>p.id===panel);PMR.menu.closeAll();PMR.menu.open(p.menus[key],document.querySelector('.activity-bar .icon'),{menus:p.menus});},m);await check({look,kind:'shipped menu',...m});}
   await page.evaluate(()=>PMR.menu.closeAll());
  }
 }catch(e){result.errors.push(String(e.stack||e));throw e;}
 finally{result.notExercised=actualRules.filter(r=>!r.omit&&!result.maxMatches[r.rule]).map(r=>r.rule);result.pass=!result.mismatches.length&&!result.rawStyleDifferences.length&&!result.notExercised.length&&!result.errors.length;save();t.log('EXPANDED RESULT '+JSON.stringify({states:result.states.length,features:result.features,maxMatches:result.maxMatches,notExercised:result.notExercised,errors:result.errors}));}
 await t.check('expanded real builders retain every non-inherited descendant feature',!result.mismatches.length,JSON.stringify(result.features));
 await t.check('raw primitive groups retain original computed colour/text-fill',!result.rawStyleDifferences.length,JSON.stringify({groups:result.rawStyleDifferences.length}));
 await t.check('every rewritten rule matched',!result.notExercised.length,JSON.stringify(result.notExercised));
}
export {FORCE};
