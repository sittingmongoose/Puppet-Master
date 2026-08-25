import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import fs from 'fs';
const OUT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/shots';
fs.mkdirSync(OUT,{recursive:true});
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text())});p.on('pageerror',e=>errs.push('PAGEERROR '+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load',timeout:20000});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO,{timeout:10000});
const R={};

// helper: is the element that owns this point actually the one we mean?
const hitAt=(sel,dx=0.5,dy=0.5)=>p.evaluate(([sel,dx,dy])=>{
  const el=document.querySelector(sel); if(!el) return {found:false};
  const r=el.getBoundingClientRect();
  const x=r.left+r.width*dx, y=r.top+r.height*dy;
  const top=document.elementFromPoint(x,y);
  return {found:true,x,y,w:r.width,h:r.height,isSelf:!!(top&&(top===el||el.contains(top)||top.closest(sel)===el)),topTag:top?top.tagName+'.'+String(top.className).slice(0,40):null};
},[sel,dx,dy]);
// helper: sample a pixel colour from a screenshot crop
async function sample(x,y,name){
  const buf=await p.screenshot({clip:{x:Math.round(x),y:Math.round(y),width:1,height:1}});
  fs.writeFileSync(`${OUT}/${name}.png`,buf);
  // decode the 1x1 PNG's IDAT via canvas in-page instead: simpler -> read back through the page
  return buf.length;
}
async function pixel(x,y){
  return p.evaluate(async ([x,y])=>{
    // paint-accurate read is not available without CDP; use the composited
    // element chain plus its computed colour at that exact point
    const el=document.elementFromPoint(x,y); if(!el) return null;
    const cs=getComputedStyle(el);
    return {tag:el.tagName,cls:String(el.className).slice(0,60),color:cs.color,bg:cs.backgroundColor,vis:cs.visibility,op:cs.opacity,disp:cs.display};
  },[x,y]);
}

// ---------- 1. MODEL MENU: paints > 3 rows AND scrolls ----------
await p.locator('[data-action="open-menu"][data-menu="model"]').click();
await p.locator('.model-menu').waitFor({state:'visible'});
await p.waitForTimeout(400);
R.model={};
R.model.rowsInDom=await p.locator('.model-row').count();
// count rows whose centre is actually the top element (i.e. painted, not clipped)
R.model.rowsPainted=await p.evaluate(()=>{
  const scroll=document.querySelector('.model-scroll');
  const sr=scroll.getBoundingClientRect();
  let n=0;
  for(const row of document.querySelectorAll('.model-row')){
    const r=row.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    if(cy<sr.top||cy>sr.bottom) continue;              // clipped out of the scroller
    const top=document.elementFromPoint(cx,cy);
    if(top&&row.contains(top)) n++;
  }
  return n;
});
R.model.scroll=await p.evaluate(()=>{const s=document.querySelector('.model-scroll');const cs=getComputedStyle(s);return {overflowY:cs.overflowY,clientH:s.clientHeight,scrollH:s.scrollHeight,layoutH:document.querySelector('.model-layout').getBoundingClientRect().height,menuH:document.querySelector('.model-menu').getBoundingClientRect().height};});
// make the list long enough to need scrolling: switch to All providers is already default; force by shrinking window later.
R.model.scrolled=await p.evaluate(()=>{const s=document.querySelector('.model-scroll');s.scrollTop=9999;return s.scrollTop;});
await p.screenshot({path:`${OUT}/model-menu.png`});
await p.keyboard.press('Escape');
await p.waitForTimeout(200);

// scrolling proof at a small viewport where the list must overflow
await p.setViewportSize({width:1440,height:420});
await p.waitForTimeout(300);
await p.locator('[data-action="open-menu"][data-menu="model"]').click();
await p.waitForTimeout(400);
R.modelSmall=await p.evaluate(()=>{const s=document.querySelector('.model-scroll');const cs=getComputedStyle(s);const before=s.scrollTop;s.scrollTop=9999;const after=s.scrollTop;return {overflowY:cs.overflowY,clientH:s.clientHeight,scrollH:s.scrollHeight,scrolledFrom:before,scrolledTo:after,didScroll:after>before};});
await p.screenshot({path:`${OUT}/model-menu-small.png`});
await p.keyboard.press('Escape');
await p.setViewportSize({width:1440,height:900});
await p.waitForTimeout(300);

// ---------- 2. NEW THREAD button visible+clickable in BOTH history modes ----------
R.newThread={};
for(const mode of ['pinned','floating']){
  await p.evaluate(m=>{const s=PM56_DEMO.getState();},mode);
  await p.evaluate(m=>{ // drive through the real toggle until historyMode matches
    return m;
  },mode);
  // set mode via the toggle button
  let guard=0;
  while((await p.evaluate(()=>PM56_DEMO.getState().historyMode))!==mode && guard++<4){
    await p.locator('[data-action="toggle-history"]').first().click();
    await p.waitForTimeout(250);
  }
  const hit=await hitAt('.chat-header [data-action="new-thread"]');
  const before=await p.evaluate(()=>PM56_DEMO.getState().threads.length);
  if(hit.isSelf){ await p.locator('.chat-header [data-action="new-thread"]').click(); await p.waitForTimeout(300); }
  const after=await p.evaluate(()=>PM56_DEMO.getState().threads.length);
  R.newThread[mode]={mode:await p.evaluate(()=>PM56_DEMO.getState().historyMode),hit,threadsBefore:before,threadsAfter:after,created:after>before};
  await p.screenshot({path:`${OUT}/new-thread-${mode}.png`});
}
// back to the query thread
await p.evaluate(()=>PM56_DEMO.selectThread('query'));
await p.waitForTimeout(200);

// ---------- 3. PLAN EDITOR shows Revise / Build ----------
await p.evaluate(()=>PM56_DEMO.openArtifact('plan-query'));
await p.waitForTimeout(400);
R.planEditor=await p.evaluate(()=>{
  const doc=document.querySelector('.editor-doc[data-artifact-id="plan-query"]');
  if(!doc) return {found:false};
  const rev=doc.querySelector('.plan-actions [data-action="revise-plan"]');
  const bld=doc.querySelector('.plan-actions [data-action="build-plan"]');
  const vis=el=>{ if(!el) return null; const r=el.getBoundingClientRect(); const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {w:r.width,h:r.height,isSelf:!!(top&&el.contains(top)),text:el.textContent.trim()}; };
  return {found:true,revise:vis(rev),build:vis(bld)};
});
await p.screenshot({path:`${OUT}/plan-editor.png`});

// ---------- 4. ASSISTANT MESSAGE ACTIONS: absent at rest, present on hover ----------
await p.evaluate(()=>PM56_DEMO.selectThread('plain'));
await p.waitForTimeout(400);
const msgSel='.message-assistant';
R.actions={};
R.actions.atRest=await p.evaluate(()=>{
  const m=document.querySelector('.message-assistant'); if(!m) return {found:false};
  const a=m.querySelector('.message-actions'); const cs=getComputedStyle(a); const r=a.getBoundingClientRect();
  const btn=a.querySelector('[data-action="copy-message"]'); const br=btn.getBoundingClientRect();
  const top=document.elementFromPoint(br.left+br.width/2,br.top+br.height/2);
  return {opacity:cs.opacity,visibility:cs.visibility,pointerEvents:cs.pointerEvents,h:r.height,hasAlways:a.classList.contains('always'),btnIsTop:!!(top&&btn.contains(top)),topEl:top?top.tagName+'.'+String(top.className).slice(0,30):null};
});
await p.locator(msgSel).first().hover();
await p.waitForTimeout(400);
R.actions.onHover=await p.evaluate(()=>{
  const m=document.querySelector('.message-assistant');
  const a=m.querySelector('.message-actions'); const cs=getComputedStyle(a);
  const btn=a.querySelector('[data-action="copy-message"]'); const br=btn.getBoundingClientRect();
  const top=document.elementFromPoint(br.left+br.width/2,br.top+br.height/2);
  return {opacity:cs.opacity,visibility:cs.visibility,pointerEvents:cs.pointerEvents,btnIsTop:!!(top&&btn.contains(top))};
});
await p.screenshot({path:`${OUT}/message-hover.png`});

// ---------- 5. runtime snapshot metrics are no longer structurally zero ----------
R.snapshot=await p.evaluate(()=>PM56_RUNTIME.snapshot());
await p.evaluate(()=>PM56_DEMO.selectThread('query'));
await p.waitForTimeout(200);
await p.locator('[data-action="open-menu"][data-menu="model"]').click();
await p.waitForTimeout(300);
R.snapshotWithMenu=await p.evaluate(()=>{const s=PM56_RUNTIME.snapshot();return {menus:s.menus,activityDomains:s.activityDomains,artifacts:s.artifacts};});
await p.keyboard.press('Escape');

R.triggers=await p.evaluate(()=>PM56_DEMO.listTriggers().length);
R.errors=errs;
console.log(JSON.stringify(R,null,1));
await b.close();
