import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import fs from 'fs';
const T="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const LABEL=process.argv[2]||'before';
const reduced = process.argv[3]==='reduced';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
const p=await ctx.newPage();
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERROR '+e));
await p.goto(pathToFileURL(T).href,{waitUntil:'load',timeout:30000});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO,{timeout:15000});
const R={label:LABEL,reduced};
const tick=(ms)=>p.waitForTimeout(ms);

// --- real painted-pixel reader: screenshot a crop, hand it back as a data URL,
//     draw to canvas, getImageData. No getBoundingClientRect trust.
async function paint(x,y,w,h){
  const buf=await p.screenshot({clip:{x:Math.max(0,Math.round(x)),y:Math.max(0,Math.round(y)),width:Math.max(1,Math.round(w)),height:Math.max(1,Math.round(h))}});
  const dataUrl='data:image/png;base64,'+buf.toString('base64');
  return p.evaluate(async (u)=>{
    const img=new Image(); img.src=u; await img.decode();
    const c=document.createElement('canvas'); c.width=img.width; c.height=img.height;
    const g=c.getContext('2d',{willReadFrequently:true}); g.drawImage(img,0,0);
    const d=g.getImageData(0,0,c.width,c.height).data;
    const set=new Set(); let sum=[0,0,0];
    for(let i=0;i<d.length;i+=4){ set.add(`${d[i]},${d[i+1]},${d[i+2]}`); sum[0]+=d[i];sum[1]+=d[i+1];sum[2]+=d[i+2]; }
    const n=d.length/4;
    return {colours:set.size, mean:[Math.round(sum[0]/n),Math.round(sum[1]/n),Math.round(sum[2]/n)], w:c.width,h:c.height};
  },dataUrl);
}
const rectOf=(sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};},sel);

// ===== 1. OVER-LONG MENU: clamped to viewport AND scrolls =====
await p.evaluate(()=>{const el=document.querySelector('[data-action="open-menu"][data-menu="persona"]')||document.querySelector('[data-action="open-menu"]'); el.click();});
await tick(250);
R.menu_natural = await p.evaluate(()=>{const m=document.querySelector('[data-overlay="root-menu"]');const cs=getComputedStyle(m);const r=m.getBoundingClientRect();
  return {cls:m.className, h:r.height, top:r.top, bottom:r.bottom, overflowY:cs.overflowY, maxH:cs.maxHeight, overscroll:cs.overscrollBehaviorY, scrollH:m.scrollHeight, clientH:m.clientHeight};});
// force it long: clone 40 extra items into the live menu
R.menu_long = await p.evaluate(async ()=>{
  const m=document.querySelector('[data-overlay="root-menu"]');
  const item=m.querySelector('.menu-item')||m.firstElementChild;
  for(let i=0;i<40;i++){const c=item.cloneNode(true);c.textContent='filler '+i;m.appendChild(c);}
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const r=m.getBoundingClientRect(), cs=getComputedStyle(m);
  const before=m.scrollTop; m.scrollTop=9999; const after=m.scrollTop;
  const last=m.lastElementChild; const lr=last.getBoundingClientRect();
  const hit=document.elementFromPoint(lr.left+lr.width/2, lr.top+lr.height/2);
  return {h:r.height, top:r.top, bottom:r.bottom, vh:innerHeight, insideViewport:(r.top>=0&&r.bottom<=innerHeight+0.5),
          overflowY:cs.overflowY, scrollH:m.scrollHeight, clientH:m.clientHeight, didScroll:after>before, scrollTop:after,
          lastVisible:!!(hit&&(hit===last||last.contains(hit)))};});
await p.evaluate(()=>document.body.click()); await tick(150);

// ===== 2. RESIZERS: touch-action / user-select actually reach one =====
R.resizers = await p.evaluate(()=>{
  const out={};
  for(const s of ['.resizer','.panel-resize']){
    const e=document.querySelector(s); if(!e){out[s]=null;continue;}
    const cs=getComputedStyle(e);
    out[s]={touchAction:cs.touchAction, userSelect:cs.userSelect||cs.webkitUserSelect};
  }
  // simulate a drag: add .dragging like the pointerdown handler does, read body select
  const h=document.querySelector('.panel-resize'); if(h){h.classList.add('dragging');
    out.bodyDuringDrag=getComputedStyle(document.body).userSelect; h.classList.remove('dragging');}
  return out;});

// ===== 3. ACTIVITY-BAR HOVER changes painted pixels =====
{
  const sel='.activity-item[data-hover-domain]';
  const r0=await rectOf(sel);
  R.activity_hover={rect:r0};
  if(r0){
    const rest=await paint(r0.x-2,r0.y-2,r0.w+4,r0.h+4);
    await p.hover(sel); await tick(500);
    const hov=await paint(r0.x-2,r0.y-2,r0.w+4,r0.h+4);
    const rect1=await rectOf(sel);
    R.activity_hover={rect:r0,rest,hov,changed:JSON.stringify(rest.mean)!==JSON.stringify(hov.mean),
      hoverCard: await p.evaluate(()=>{const c=document.querySelector('.hover-card');if(!c)return null;const r=c.getBoundingClientRect();return {w:r.width,h:r.height,top:r.top};}),
      yShift:(rect1?rect1.y-r0.y:null)};
    await p.mouse.move(700,700); await tick(300);
  }
}

// ===== 4. DECISION EVIDENCE at narrow viewport, per variant =====
await p.setViewportSize({width:700,height:850}); await tick(200);
R.decision_narrow={};
for(let v=0;v<8;v++){
  await p.evaluate(v=>{window.PM56_DEMO.setVariant(4,v);window.PM56_DEMO.openQuestionnaire();},v);
  await tick(150);
  R.decision_narrow[v]=await p.evaluate(()=>{
    const host=document.querySelector('.decision-host'); const ev=document.querySelector('.decision-evidence');
    const surf=document.querySelector('.decision-surface');
    return {variant:host?host.dataset.variant:null, hasEvidence:!!ev, display:ev?getComputedStyle(ev).display:null,
      surfMaxW:surf?getComputedStyle(surf).maxWidth:null, surfW:surf?surf.getBoundingClientRect().width:null};});
}
await p.setViewportSize({width:1440,height:900}); await tick(200);
R.decision_wide=await p.evaluate(()=>{const s=document.querySelector('.decision-surface');return s?{maxW:getComputedStyle(s).maxWidth,w:s.getBoundingClientRect().width}:null;});
await p.evaluate(()=>window.PM56_DEMO.reset()); await tick(200);

// ===== 5. TOAST fades before removal =====
R.toast=await p.evaluate(async ()=>{
  const el0=document.querySelector('.toast'); // none yet
  window.PM56_DEMO.trigger && 0;
  return null;});
await p.evaluate(()=>{ const btn=document.querySelector('[data-action="copy-message"]'); if(btn) btn.click(); });
await tick(120);
R.toast=await p.evaluate(async ()=>{
  const t=document.querySelector('.toast'); if(!t) return {found:false};
  const cs=getComputedStyle(t);
  const samples=[];
  const t0=performance.now();
  await new Promise(res=>{ const iv=setInterval(()=>{ const n=document.querySelector('.toast');
    samples.push({t:Math.round(performance.now()-t0), op:n?Number(getComputedStyle(n).opacity).toFixed(3):null, present:!!n});
    if(performance.now()-t0>3100){clearInterval(iv);res();} },150); });
  return {found:true, anim:cs.animationName, dur:cs.animationDuration, samples};});

// ===== 6. pm-materialize will-change leak =====
await p.evaluate(()=>window.PM56_DEMO.startWorking()); await tick(1500);
R.willchange=await p.evaluate(()=>{
  const all=[...document.querySelectorAll('.pm-materialize')];
  const leaked=all.filter(e=>getComputedStyle(e).willChange!=='auto');
  return {total:all.length, leaked:leaked.length, sample:all[0]?getComputedStyle(all[0]).willChange:null,
    doneClass:document.querySelectorAll('.pm-materialize-done').length};});
await p.evaluate(()=>window.PM56_DEMO.reset()); await tick(200);

// ===== 7. chat-header icon buttons =====
R.header={};
for(const w of [1440,1100,900]){
  await p.setViewportSize({width:w,height:900}); await tick(250);
  R.header[w]=await p.evaluate(()=>[...document.querySelectorAll('.chat-header .icon-button')].map(e=>{
    const r=e.getBoundingClientRect(); return {t:e.title||e.dataset.action, w:+r.width.toFixed(1), h:+r.height.toFixed(1)};}));
}
await p.setViewportSize({width:1440,height:900}); await tick(200);

// ===== 8. --composer-h / transient activity panel =====
await p.evaluate(()=>{const s=window.PM56_DEMO.getState(); window.PM56_DEMO.openActivity('todo');});
await tick(300);
R.composer=await p.evaluate(()=>{
  const c=document.querySelector('.composer'); const panel=document.querySelector('.activity-panel.transient');
  const v=getComputedStyle(document.documentElement).getPropertyValue('--composer-h').trim();
  const vb=getComputedStyle(document.body).getPropertyValue('--composer-h').trim();
  return {varRoot:v||null, varBody:vb||null, composerH:c?+c.getBoundingClientRect().height.toFixed(1):null,
    panelBottomCss:panel?getComputedStyle(panel).bottom:null,
    panelPresent:!!panel,
    gapToComposer: (panel&&c)? +(c.getBoundingClientRect().top - panel.getBoundingClientRect().bottom).toFixed(1) : null};});

// ===== 9. dead vars/keyframes present in sheet? (informational) =====
R.errs=errs;
fs.writeFileSync(`/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/probe1b_${LABEL}${reduced?'_rm':''}.json`, JSON.stringify(R,null,1));
console.log(JSON.stringify(R,null,1));
await b.close();
