import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import fs from 'fs';
const T="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const reduced = process.argv[2]==='reduced';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
const p=await ctx.newPage();
const errs=[],warns=[];
p.on('console',m=>{if(m.type()==='error')errs.push(m.text());else if(m.type()==='warning')warns.push(m.text())});
p.on('pageerror',e=>errs.push('PAGEERROR '+e));
await p.goto(pathToFileURL(T).href,{waitUntil:'load',timeout:30000});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO,{timeout:15000});
const R={reduced}; const tick=ms=>p.waitForTimeout(ms);
async function paint(x,y,w,h){
  const buf=await p.screenshot({clip:{x:Math.max(0,Math.round(x)),y:Math.max(0,Math.round(y)),width:Math.max(1,Math.round(w)),height:Math.max(1,Math.round(h))}});
  return p.evaluate(async u=>{const img=new Image();img.src=u;await img.decode();
    const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
    const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
    const d=g.getImageData(0,0,c.width,c.height).data;const set=new Set();let s=[0,0,0];
    for(let i=0;i<d.length;i+=4){set.add(d[i]+','+d[i+1]+','+d[i+2]);s[0]+=d[i];s[1]+=d[i+1];s[2]+=d[i+2];}
    const n=d.length/4;return{colours:set.size,mean:[+(s[0]/n).toFixed(2),+(s[1]/n).toFixed(2),+(s[2]/n).toFixed(2)]};},
    'data:image/png;base64,'+buf.toString('base64'));
}

/* ===== A. OVER-LONG MENU: real render path, short viewport ===== */
R.menu={};
for(const vh of [900,300,220]){
  await p.setViewportSize({width:1440,height:vh}); await tick(300);
  const per={};
  const menus=await p.evaluate(()=>[...document.querySelectorAll('[data-action="open-menu"]')].map(e=>e.dataset.menu));
  for(const mname of menus){
    await p.evaluate(m=>{const e=document.querySelector(`[data-action="open-menu"][data-menu="${m}"]`);if(e)e.click();},mname);
    await tick(260);
    per[mname]=await p.evaluate(()=>{const m=document.querySelector('[data-overlay="root-menu"]');if(!m)return null;
      const r=m.getBoundingClientRect(),cs=getComputedStyle(m);
      const b4=m.scrollTop;m.scrollTop=99999;const af=m.scrollTop;m.scrollTop=b4;
      return {h:+r.height.toFixed(1),top:+r.top.toFixed(1),bottom:+r.bottom.toFixed(1),vh:innerHeight,
        inViewport:r.top>=-0.5&&r.bottom<=innerHeight+0.5,
        needsScroll:m.scrollHeight>m.clientHeight+1,canScroll:af>b4,overflowY:cs.overflowY,overscroll:cs.overscrollBehaviorY,
        maxH:cs.maxHeight};});
    await p.evaluate(()=>document.body.click()); await tick(120);
  }
  R.menu[vh]=per;
}
// prove the LAST row of a scrolled menu is really the painted element there
await p.setViewportSize({width:1440,height:220}); await tick(250);
await p.evaluate(()=>{const e=document.querySelector('[data-action="open-menu"][data-menu="model"]')||document.querySelector('[data-action="open-menu"]');e.click();});
await tick(300);
R.menu_lastrow=await p.evaluate(()=>{const m=document.querySelector('[data-overlay="root-menu"]');
  m.scrollTop=99999; const kids=[...m.querySelectorAll('button,.menu-item,.model-row')];
  const last=kids[kids.length-1]; if(!last) return {no:true};
  const r=last.getBoundingClientRect(); const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {scrolled:m.scrollTop>0,lastHit:!!(hit&&(hit===last||last.contains(hit)||hit.contains(last))),
    lastInViewport:r.top>=0&&r.bottom<=innerHeight+0.5, menuBottom:+m.getBoundingClientRect().bottom.toFixed(1), vh:innerHeight};});
await p.evaluate(()=>document.body.click());
await p.setViewportSize({width:1440,height:900}); await tick(300);

/* ===== B. RESIZERS ===== */
R.resizers=await p.evaluate(()=>{const o={};
  for(const s of ['.resizer','.panel-resize']){const e=document.querySelector(s);if(!e){o[s]=null;continue;}
    const cs=getComputedStyle(e);o[s]={touchAction:cs.touchAction,userSelect:cs.userSelect};}
  const h=document.querySelector('.panel-resize');
  if(h){h.classList.add('dragging');
    o.bodyDuringDrag=getComputedStyle(document.body).userSelect;
    o.transcriptDuringDrag=getComputedStyle(document.querySelector('.transcript')).userSelect;
    o.cursorDuringDrag=getComputedStyle(document.body).cursor;
    h.classList.remove('dragging');
    o.bodyAfterDrag=getComputedStyle(document.body).userSelect;}
  return o;});
// a real drag: can the browser still build a selection across it?
R.dragSelect=await p.evaluate(async ()=>{
  const h=document.querySelector('.panel-resize'); const r=h.getBoundingClientRect();
  h.classList.add('dragging');
  const t=document.querySelector('.thread-title span')||document.querySelector('.transcript');
  const sel=window.getSelection(); sel.removeAllRanges();
  const rng=document.createRange(); rng.selectNodeContents(t); sel.addRange(rng);
  // user-select:none makes the painted selection empty even if a range exists
  const cs=getComputedStyle(t).userSelect;
  h.classList.remove('dragging');
  sel.removeAllRanges();
  return {targetUserSelectDuringDrag:cs};});

/* ===== C. ACTIVITY BAR hover AND press, in painted pixels ===== */
{
  const sel='.activity-item[data-hover-domain]';
  const r=await p.evaluate(s=>{const e=document.querySelector(s);const b=e.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width,h:b.height};},sel);
  const box=[r.x-3,r.y-4,r.w+6,r.h+8];
  const rest=await paint(...box);
  await p.hover(sel); await tick(450);
  const hov=await paint(...box);
  // press: hold the mouse down over it
  await p.mouse.move(r.x+r.w/2,r.y+r.h/2); await p.mouse.down(); await tick(450);
  const press=await paint(...box);
  const pressCss=await p.evaluate(s=>getComputedStyle(document.querySelector(s)).transform,sel);
  await p.mouse.up(); await tick(200);
  await p.mouse.move(700,760); await tick(400);
  R.activity={rest,hov,press,pressCss,
    hoverChanged:JSON.stringify(rest.mean)!==JSON.stringify(hov.mean),
    pressChanged:JSON.stringify(hov.mean)!==JSON.stringify(press.mean)};
}

/* ===== D. DECISION EVIDENCE per variant, narrow + wide ===== */
R.decision={};
for(const w of [1440,700,560,390]){
  await p.setViewportSize({width:w,height:900}); await tick(250);
  const o={};
  for(let v=0;v<8;v++){
    await p.evaluate(v=>{window.PM56_DEMO.setVariant(6,v);window.PM56_DEMO.openQuestionnaire();},v);
    await tick(130);
    o[v]=await p.evaluate(()=>{const e=document.querySelector('.decision-evidence');
      if(!e)return '(absent)';
      const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
      return cs.display+'|'+(r.width>0&&r.height>0?'painted':'zero');});
  }
  o.surface=await p.evaluate(()=>{const s=document.querySelector('.decision-surface');return s?{maxW:getComputedStyle(s).maxWidth,w:+s.getBoundingClientRect().width.toFixed(1)}:null;});
  R.decision[w]=o;
}
await p.setViewportSize({width:2200,height:900}); await tick(300);
R.decision['2200_surface']=await p.evaluate(()=>{const s=document.querySelector('.decision-surface');return s?{maxW:getComputedStyle(s).maxWidth,w:+s.getBoundingClientRect().width.toFixed(1)}:null;});
await p.setViewportSize({width:1440,height:900}); await tick(200);
await p.evaluate(()=>window.PM56_DEMO.reset()); await tick(250);

/* ===== E. TOAST fades before removal ===== */
await p.evaluate(()=>{const b=document.querySelector('[data-action="copy-message"]');if(b)b.click();});
await tick(80);
R.toast=await p.evaluate(async()=>{
  const t=document.querySelector('.toast'); if(!t) return {found:false};
  const cs=getComputedStyle(document.querySelector('.toast'));
  const s=[]; const t0=performance.now();
  await new Promise(res=>{const iv=setInterval(()=>{const n=document.querySelector('.toast');
    s.push({t:Math.round(performance.now()-t0),op:n?+Number(getComputedStyle(n).opacity).toFixed(3):null,present:!!n});
    if(performance.now()-t0>3200){clearInterval(iv);res();}},80);});
  const fading=s.filter(x=>x.present&&x.op<0.98&&x.t>1000);
  const live=document.querySelector('.toast');
  const cs2=live?getComputedStyle(live):null;
  return {found:true,anim:cs.animationName,dur:cs.animationDuration,delay:cs.animationDelay,fill:cs.animationFillMode,
    sameNode: live===t, animAtEnd: cs2?cs2.animationName:null,
    minOpAfter2s:Math.min(...s.filter(x=>x.present&&x.t>2000).map(x=>x.op)),
    fadingSamples:fading.length, lastPresent:Math.max(...s.filter(x=>x.present).map(x=>x.t)),
    firstOp:s[0]?.op, tail:s.filter(x=>x.t>2300&&x.t<2950)};});
await tick(400);

/* ===== F. will-change no longer leaks ===== */
await p.evaluate(()=>window.PM56_DEMO.startWorking()); await tick(1800);
R.willchange=await p.evaluate(()=>{const a=[...document.querySelectorAll('.pm-materialize')];
  return {total:a.length,leaked:a.filter(e=>getComputedStyle(e).willChange!=='auto').length,
   sample:a[0]?getComputedStyle(a[0]).willChange:null,
   shimmerHinted:[...document.querySelectorAll('.pm-shimmer:not(.pm-settled)')].length,
   settledCleared:[...document.querySelectorAll('.pm-shimmer.pm-settled')].every(e=>getComputedStyle(e).willChange==='auto')};});
await p.evaluate(()=>window.PM56_DEMO.reset()); await tick(300);

/* ===== G. chat-header controls hold their size ===== */
R.header={};
for(const w of [1440,1100,900,700]){await p.setViewportSize({width:w,height:900});await tick(250);
  R.header[w]=await p.evaluate(()=>[...document.querySelectorAll('.chat-header .icon-button')].map(e=>({t:(e.title||e.dataset.action||'').slice(0,24),w:+e.getBoundingClientRect().width.toFixed(1)})));}
await p.setViewportSize({width:1440,height:900}); await tick(250);

/* ===== H. transient activity panel clears the composer at any composer height ===== */
R.panel={};
for(const fill of ['', 'x\n'.repeat(1), 'lorem ipsum dolor sit amet\n'.repeat(6)]){
  await p.evaluate(v=>{const ta=document.querySelector('.composer-input'); if(ta){ta.value=v;ta.dispatchEvent(new Event('input',{bubbles:true}));}},fill);
  await tick(200);
  await p.evaluate(()=>window.PM56_DEMO.openActivity('todo')); await tick(400);
  R.panel[fill.length]=await p.evaluate(()=>{
    const pn=document.querySelector('.activity-panel.transient'), c=document.querySelector('.composer'),
          bar=document.querySelector('.activity-wrap'), tr=document.querySelector('.transcript');
    if(!pn) return {absent:true};
    const pr=pn.getBoundingClientRect();
    const hit=document.elementFromPoint(pr.left+pr.width/2,pr.top+8);
    return {composerH:+c.getBoundingClientRect().height.toFixed(1),
      panelBottom:+pr.bottom.toFixed(1), panelTop:+pr.top.toFixed(1), panelH:+pr.height.toFixed(1),
      barTop:+bar.getBoundingClientRect().top.toFixed(1),
      gapToNext:+(bar.getBoundingClientRect().top-pr.bottom).toFixed(1),
      overlapsComposer: pr.bottom > c.getBoundingClientRect().top,
      insideTranscriptRow: pr.top >= tr.getBoundingClientRect().top-0.5 && pr.bottom <= tr.getBoundingClientRect().bottom+0.5,
      bottomCss:getComputedStyle(pn).bottom,
      hitTop: hit? (hit===pn||pn.contains(hit)) : false};});
}
await p.evaluate(()=>{const ta=document.querySelector('.composer-input');if(ta){ta.value='';ta.dispatchEvent(new Event('input',{bubbles:true}));} window.PM56_DEMO.reset();});
await tick(300);

/* ===== I. 8 themes: no horizontal overflow, no console noise ===== */
R.themes={};
for(const t of ['basic-dark','basic-light','friendly-dark','friendly-light','retro-dark','retro-light','glass-dark','glass-light']){
  await p.evaluate(t=>window.PM56_DEMO.setTheme(t),t); await tick(200);
  R.themes[t]=await p.evaluate(()=>({ovX:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    ovY:document.documentElement.scrollHeight-document.documentElement.clientHeight}));
}
await p.evaluate(()=>window.PM56_DEMO.setTheme('basic-dark')); await tick(200);

/* ===== J. perpetual loops under reduced motion ===== */
R.loops=await p.evaluate(async()=>{
  await new Promise(r=>setTimeout(r,600));
  const inf=[];
  for(const el of document.querySelectorAll('*')){
    for(const a of el.getAnimations?el.getAnimations():[]){
      const it=a.effect?.getTiming?.().iterations;
      if(it===Infinity) inf.push((a.animationName||a.id||'?')+' @ '+el.className.toString().slice(0,30));
    }
  } return {infinite:inf.length, list:inf.slice(0,12)};});
// and that state still advances
await p.evaluate(()=>window.PM56_DEMO.startWorking()); await tick(1400);
R.stateAdvances=await p.evaluate(()=>window.PM56_DEMO.getState().work.step);
await p.evaluate(()=>window.PM56_DEMO.setWorkStep(3)); await tick(300);
R.stateAdvances2=await p.evaluate(()=>window.PM56_DEMO.getState().work.step);

R.errs=errs; R.warns=warns.slice(0,10); R.warnCount=warns.length;
const out=`/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/verify1b${reduced?'_rm':''}.json`;
fs.writeFileSync(out,JSON.stringify(R,null,1));
console.log('written',out,'errors',errs.length,'warnings',warns.length);
await b.close();
