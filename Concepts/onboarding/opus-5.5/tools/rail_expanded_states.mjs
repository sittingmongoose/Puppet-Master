// Reach every shipped rail view/detail. The review bundle comes from rail_layer's real review profile.
// Two test-only references expose existing A/C instances; no DOM/marker writer is replaced.
export async function installRailReview(page,bundle){
 await page.addStyleTag({content:bundle.css});await page.addScriptTag({content:bundle.js});
 await page.evaluate(()=>{window.__pmrExpandedAudit={queue:[],seen:new Set()};});await page.evaluate(installOriginalSelectorProbe);
}
export async function openRailDisclosures(page,scope='#sidePanelSlot, #pmr-overlay'){
 return page.evaluate(scope=>{
  let opened=0;const keys=[];
  for(let pass=0;pass<100;pass++){
   const roots=[...document.querySelectorAll(scope)];
   const candidates=roots.flatMap(r=>[...r.querySelectorAll('[aria-expanded="false"]:not([aria-haspopup]), details:not([open]) > summary, [data-collapse]')]);
   const closed=[...new Set(candidates)].filter(e=>{
    if(e.getAttribute('aria-disabled')==='true'||e.disabled)return false;
    if(e.matches('summary'))return !e.parentElement.open;
    if(e.getAttribute('aria-expanded')==='false')return true;
    if(e.getAttribute('aria-expanded')==='true')return false;
    const body=e.nextElementSibling;
    return e.hasAttribute('data-collapse')&&body&&(body.hidden||getComputedStyle(body).display==='none'||e.parentElement.matches('.collapsed,.is-collapsed'));
   });
   if(!closed.length)return {opened,keys,remaining:0};
   let changed=0;const observer=new MutationObserver(()=>{});for(const root of roots)observer.observe(root,{subtree:true,attributes:true,childList:true});
   for(const e of closed){
    observer.takeRecords();
    e.click();for(const a of document.getAnimations())if(a.effect?.getTiming().iterations!==Infinity)try{a.finish();}catch{}
    if(observer.takeRecords().length){opened++;changed++;keys.push(e.getAttribute('data-pmr-nav-id')||e.getAttribute('aria-label')||e.textContent.trim().slice(0,80));}
   }
   observer.disconnect();
   if(!changed)throw Error('disclosure did not open: '+closed.map(e=>e.outerHTML.slice(0,120)).join(' / '));
  }
  throw Error('disclosure traversal exceeded100 passes');
 },scope);
}
async function showPanel(page,id){
 await page.evaluate(id=>{
  const target='panel-'+id,e=document.querySelector('.activity-bar [data-target="'+target+'"]');if(!e)throw Error('no real activity control '+id);if(!PMR.host.isShown(target))e.click();
 },id);await page.waitForTimeout(50);
 await page.waitForFunction(id=>{const target='panel-'+id,c=PMR.concepts.current(),view=document.getElementById(c==='d'?target:'pmr-view-'+id);return PMR.host.isShown(target)&&view&&view.getBoundingClientRect().width>0&&getComputedStyle(view).display!=='none';},id,{timeout:15000});
}
const settle=async page=>{await page.evaluate(()=>{for(const a of document.getAnimations())if(a.effect?.getTiming().iterations!==Infinity)try{a.finish();}catch{}});await page.waitForTimeout(25);};
export async function visitExpandedRails(page,visit,{concepts=['a','b','c','d']}={}){
 const states=[];
 const record=async meta=>{const scope=(meta.concept==='d'?'#panel-':'#pmr-view-')+meta.panel+', #pmr-overlay';const expansion=await openRailDisclosures(page,scope);const panelVisible=await page.evaluate(meta=>{const e=document.getElementById((meta.concept==='d'?'panel-':'pmr-view-')+meta.panel);return !!(e&&e.getBoundingClientRect().width>0&&getComputedStyle(e).display!=='none'&&PMR.host.isShown('panel-'+meta.panel));},meta);if(!panelVisible)throw Error('rail panel hidden in expanded state '+JSON.stringify(meta));const state={...meta,expansion,panelVisible};states.push(state);await visit(state);};
 for(const concept of concepts)for(const engine of ['git','jj']){
  await page.evaluate(([c,e])=>{PMR.state.set('source.engine',e);PMR.host.setConcept(c,{force:true});},[concept,engine]);await settle(page);
  const panels=await page.evaluate(c=>c==='d'?[...document.querySelectorAll('#sidePanelSlot > .side-panel-view')].map(e=>e.id.replace('panel-','')):PMR.PANELS.map(p=>p.id),concept);
  for(const panel of panels){
   await showPanel(page,panel);
   if(concept==='a'){
    const views=await page.evaluate(id=>{const p=document.querySelector('[data-pmr-a-panel="'+id+'"]').__pmrAuditPanel;return p.views.map(v=>v.id);},panel);
    for(const view of views){await page.evaluate(([p,v])=>document.querySelector('[data-pmr-a-panel="'+p+'"]').__pmrAuditPanel.select(v),[panel,view]);await settle(page);await record({concept,engine,panel,view,kind:'all inline rows/sections/technical disclosures open',builder:'A makePanel/select/row/detailOf/section/miniDisclosure'});}
   }else if(concept==='b'){
    await page.evaluate(id=>{
     const st=document.querySelector('.pmr-b[data-panel="'+id+'"]')._stack,a=__pmrExpandedAudit;
     st.settle();while(st.pages.length>1){st.pop(1);st.settle();}
     a.stack=st;const desc=st.mod.root(st);a.queue=[{desc,context:desc.key}];a.seen=new Set();
    },panel);
    for(let n=0;;n++){
     const meta=await page.evaluate(()=>{
      const a=__pmrExpandedAudit,st=a.stack;let item;
      while(a.queue.length){const x=a.queue.shift();if(!a.seen.has(x.context+'|'+x.desc.key)){item=x;break;}}
      if(!item)return null;const d=item.desc;a.context=item.context;if(a.seen.size>2000)throw Error('Stack descriptor graph did not terminate');a.seen.add(item.context+'|'+d.key);
      st.settle();while(st.pages.length>1){st.pop(1);st.settle();}
      if(d.kind!=='root'){st.push(d);st.settle();}
      if(d.siblings)for(const sibling of d.siblings()||[])if(sibling.open){const desc=sibling.open();a.queue.push({desc,context:desc.kind==='area'?desc.key:a.context});}
      return {view:d.key,area:a.context,title:d.title,kind:d.kind||'area',pending:a.queue.length};
     });if(!meta)break;await settle(page);await record({concept,engine,panel,...meta,builder:'B Stack.build/push, real drill descriptors, areaDesc/itemDesc/section/disclosure'});
     // Opening lazy sections can build more drill controls. Capture their actual descriptors afterwards.
     await page.evaluate(()=>{const a=__pmrExpandedAudit,st=a.stack,push=st.push;st.push=function(desc){if(desc)a.queue.push({desc,context:desc.kind==='area'?desc.key:a.context});};try{for(const el of st.top().el.querySelectorAll('[data-pmr-nav="drill"]'))el.click();}finally{st.push=push;}});
    }
   }else if(concept==='c'){
    const views=await page.evaluate(id=>document.querySelector('.pmr-c-panel[data-panel="'+id+'"]').__pmrAuditPanel.views().map(v=>v.id),panel);
    for(const view of views){
     await page.evaluate(([id,v])=>document.querySelector('.pmr-c-panel[data-panel="'+id+'"]').__pmrAuditPanel.setView(v,{force:true}),[panel,view]);await settle(page);
     // Open tree folders through their real entry toggles until no unbuilt child remains.
     await page.evaluate(id=>{const P=document.querySelector('.pmr-c-panel[data-panel="'+id+'"]').__pmrAuditPanel;for(let i=0;i<100;i++){const e=[...P.entries.values()].find(e=>e.folder&&e.toggle&&e.el.getAttribute('aria-expanded')!=='true');if(!e)return;e.toggle(true);}throw Error('C folder traversal did not terminate');},panel);
     await record({concept,engine,panel,view,kind:'all folders/sections open',builder:'C cMountPanel.setView, real folder entry.toggle'});
     const entries=await page.evaluate(id=>[...document.querySelector('.pmr-c-panel[data-panel="'+id+'"]').__pmrAuditPanel.entries.values()].filter(e=>e.build).map(e=>({key:e.key,label:e.label})),panel);
     for(const entry of entries){await page.evaluate(([id,key])=>document.querySelector('.pmr-c-panel[data-panel="'+id+'"]').__pmrAuditPanel.select(key,{lens:true}),[panel,entry.key]);await settle(page);await record({concept,engine,panel,view,entry:entry.key,label:entry.label,kind:'Lens + technical disclosure open',builder:'C P.select/cLensShow/cDocFor/panel.itemLens/cTech'});}
     const other=await page.evaluate(id=>[...document.querySelectorAll('.pmr-c-panel[data-panel="'+id+'"] [data-pmr-nav="select"]:not(.pmr-c-row)')].map(e=>e.getAttribute('data-pmr-nav-id')),panel);
     for(const control of other){await page.evaluate(([id,key])=>{const e=[...document.querySelectorAll('.pmr-c-panel[data-panel="'+id+'"] [data-pmr-nav="select"]')].find(e=>e.getAttribute('data-pmr-nav-id')===key);if(!e)throw Error('C Lens control disappeared '+key);e.click();},[panel,control]);await settle(page);await record({concept,engine,panel,view,entry:control,kind:'identity/footer Lens + technical disclosure open',builder:'C identity/about/where, footer/ops, cSrcComposer/publish'});}
    }
   }else{
    if(panel==='source')await page.evaluate(e=>document.querySelector('#panel-source [data-pm7-scm-engine="'+e+'"]')?.click(),engine);
    await settle(page);
    const tabs=await page.evaluate(id=>[...document.querySelectorAll('#panel-'+id+' .pm-segtab-item, #panel-'+id+' [role="tab"]')].map((e,i)=>({index:i,label:e.textContent.trim(),attrs:[...e.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value])})),panel);
    await record({concept,engine,panel,view:'initial',kind:'all disclosures open',builder:'D shell + skin per-panel builders, data-collapse/aria-expanded/details'});
    for(const tab of tabs){await page.evaluate(([id,i])=>{const el=document.querySelectorAll('#panel-'+id+' .pm-segtab-item, #panel-'+id+' [role="tab"]')[i];if(!el)throw Error('D tab disappeared');el.click();},[panel,tab.index]);await settle(page);await record({concept,engine,panel,view:tab.label||String(tab.index),tab:tab.attrs,kind:'all disclosures open',builder:'D real segment/tab handlers + per-panel expanders'});}
   }
  }
 }
 return states;
}

// Installed in the page: undo only the build's class-arm split, at the existing CSSOM positions.
// A late extra !important rule can change tied declarations on marked ancestors and give a false raw-leaf failure.
export function installOriginalSelectorProbe(){
 window.__pmrOriginalSelectorProbe=variant=>{
  const prefix=variant.replacement.slice(0,variant.replacement.lastIndexOf(':where(')).trim();
  const compact=prefix.replace(/\s*([,>()+~])\s*/g,'$1'),parts=[];
  const optional=()=>{if(parts.at(-1)!=='\\s*')parts.push('\\s*');};
  for(const ch of compact){
   if(/\s/.test(ch))parts.push('\\s+');
   else if(',>()+~'.includes(ch)){optional();parts.push(ch.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));optional();}
   else parts.push(ch.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  }
  const pattern=new RegExp(parts.join('')+'\\s+:where\\([^()]*\\)(?=\\s*(?:,|$))','g'),swaps=[];let arms=0,originalArms=0;
  const split=text=>{const out=[];let start=0,paren=0,bracket=0,quote='';for(let i=0;i<text.length;i++){const c=text[i];if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}if(c==='"'||c==="'")quote=c;else if(c==='(')paren++;else if(c===')')paren--;else if(c==='[')bracket++;else if(c===']')bracket--;else if(c===','&&!paren&&!bracket){out.push(text.slice(start,i).trim());start=i+1;}}out.push(text.slice(start).trim());return out;};
  const walk=rules=>{for(const rule of rules){
   if(rule.selectorText){const previous=rule.selectorText;let found=0;const restored=new Set();const next=split(previous).flatMap(arm=>{let count=0;const original=arm.replace(pattern,()=>{count++;return variant.original;});if(!count)return[arm];found+=count;if(restored.has(original))return[];restored.add(original);return[original];}).join(', ');
    if(found){rule.selectorText=next;swaps.push([rule,previous]);arms+=found;originalArms+=restored.size;}
   }
   if(rule.cssRules)walk(rule.cssRules);
  }};
  try{for(const sheet of [...document.styleSheets,...document.adoptedStyleSheets]){let rules;try{rules=sheet.cssRules;}catch{continue;}walk(rules);}}
  catch(e){for(const[rule,previous]of swaps)rule.selectorText=previous;throw e;}
  if(!swaps.length)throw Error('No compiled selector arms found for '+prefix);
  return {rules:swaps.length,arms,originalArms,restore(){for(const[rule,previous]of swaps)rule.selectorText=previous;}};
 };
}
