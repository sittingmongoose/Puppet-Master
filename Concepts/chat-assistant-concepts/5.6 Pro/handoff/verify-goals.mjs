import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import fs from 'fs';
const OUT='/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/waves/shots-goals';
fs.mkdirSync(OUT,{recursive:true});
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text())});p.on('pageerror',e=>errs.push('PAGEERROR '+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load',timeout:20000});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO,{timeout:10000});
const R={};

/* PAINTED-PIXEL READ: screenshot the crop, hand the PNG back to the page as a
   data URL, draw it to a canvas and getImageData. No assertion below rests on
   getBoundingClientRect alone. */
async function paint(sel, dx=0.5, dy=0.5){
  const box=await p.evaluate(([sel,dx,dy])=>{
    const el=document.querySelector(sel); if(!el) return null;
    el.scrollIntoView({block:'center',inline:'nearest'});
    const r=el.getBoundingClientRect();
    return {x:r.left+r.width*dx, y:r.top+r.height*dy, w:r.width, h:r.height,
            vis:r.top>=0&&r.bottom<=innerHeight&&r.width>0&&r.height>0};
  },[sel,dx,dy]);
  if(!box) return {found:false};
  await p.waitForTimeout(120);
  if(box.x<3||box.y<3||box.x>1437||box.y>897) return {found:true,offscreen:true,...box};
  const buf=await p.screenshot({clip:{x:Math.max(0,Math.round(box.x)-2),y:Math.max(0,Math.round(box.y)-2),width:5,height:5}});
  const rgba=await p.evaluate(async (b64)=>{
    const img=new Image(); img.src='data:image/png;base64,'+b64;
    await img.decode();
    const c=document.createElement('canvas'); c.width=img.width; c.height=img.height;
    c.getContext('2d').drawImage(img,0,0);
    const d=c.getContext('2d').getImageData(2,2,1,1).data;
    return [d[0],d[1],d[2],d[3]];
  }, buf.toString('base64'));
  const hit=await p.evaluate(([sel,x,y])=>{
    const el=document.querySelector(sel); const top=document.elementFromPoint(x,y);
    return {isSelf:!!(top&&(top===el||el.contains(top)||(top.closest&&top.closest(sel)===el))),
            topTag: top?top.tagName+'.'+String(top.className||'').slice(0,40):null};
  },[sel,box.x,box.y]);
  return {found:true,rgba,...hit,w:box.w,h:box.h};
}
const st=()=>p.evaluate(()=>{
  const g=window.PM56_DATA.goal; const S=window.PM56_GOAL;
  return {status:g&&g.status, current:g&&g.currentPhaseId,
          phases:(g&&g.phases||[]).map(x=>x.id+':'+x.status),
          budget:g&&g.budget, replans:(g&&g.replans||[]).length,
          progress:g&&g.progress, blocker:!!(g&&g.blocker),
          summary:S.summary()};
});

// ---- open the Activity Detail panel on the Goal domain ----
await p.evaluate(()=>window.PM56_DEMO.pinActivity());
await p.evaluate(()=>window.PM56_DEMO.openActivity('goal'));
await p.waitForTimeout(500);

R.boot=await st();
R.phaseRows=await p.evaluate(()=>[...document.querySelectorAll('.activity-panel .goal-phase')].map(li=>({
  k:li.getAttribute('data-k'), cls:li.className,
  num:li.querySelector('.goal-phase-num').textContent,
  title:li.querySelector('.goal-phase-text').textContent,
  badge:li.querySelector('.goal-phase-badge').textContent,
  glyphPath:(li.querySelector('.goal-glyph-svg')||{}).innerHTML
})));
// every row painted + hit-testable at its own centre
await p.evaluate(()=>document.querySelector('.activity-panel .goal-phases').scrollIntoView({block:'center'}));
await p.waitForTimeout(200);
R.rowsHit=await p.evaluate(()=>{
  const out=[];
  for(const li of document.querySelectorAll('.activity-panel .goal-phase')){
    const btn=li.querySelector('.goal-phase-row'); const r=btn.getBoundingClientRect();
    const x=r.left+r.width*0.55, y=r.top+r.height/2;
    const top=document.elementFromPoint(x,y);
    out.push({title:li.querySelector('.goal-phase-text').textContent, isSelf:!!(top&&btn.contains(top)), w:Math.round(r.width), h:Math.round(r.height)});
  }
  return out;
});
// TWO CHANNELS on the current phase: colour AND glyph shape
/* Sampling a hollow glyph's CENTRE returns the row background, which is how the
   first pass "measured" two different statuses as the same colour. Crop the
   whole 16x16 glyph instead and take the painted pixel FURTHEST from the row's
   own background -- that is the ink, whatever shape it is drawn in. */
async function glyphInk(sel){
  const box=await p.evaluate(sel=>{
    const el=document.querySelector(sel); if(!el) return null;
    el.scrollIntoView({block:'center'});
    const r=el.getBoundingClientRect(), row=el.closest('.goal-phase').getBoundingClientRect();
    return {x:Math.round(r.left)-1,y:Math.round(r.top)-1,w:Math.round(r.width)+2,h:Math.round(r.height)+2,
            bx:Math.round(row.right)-6, by:Math.round(row.top)+4};
  },sel);
  if(!box) return {found:false};
  await p.waitForTimeout(120);
  const b2=await p.evaluate(sel=>{const el=document.querySelector(sel);const r=el.getBoundingClientRect();
    const row=el.closest('.goal-phase').getBoundingClientRect();
    return {x:Math.round(r.left)-1,y:Math.round(r.top)-1,w:Math.round(r.width)+2,h:Math.round(r.height)+2,
            bx:Math.round(row.right)-6,by:Math.round(row.top)+4};},sel);
  const shot=await p.screenshot({clip:{x:b2.x,y:b2.y,width:b2.w,height:b2.h}});
  const bgShot=await p.screenshot({clip:{x:b2.bx,y:b2.by,width:3,height:3}});
  const out=await p.evaluate(async ([a,bg,w,h])=>{
    async function px(b64,W,H){const i=new Image();i.src='data:image/png;base64,'+b64;await i.decode();
      const c=document.createElement('canvas');c.width=i.width;c.height=i.height;
      c.getContext('2d').drawImage(i,0,0);return c.getContext('2d').getImageData(0,0,i.width,i.height);}
    const G=await px(a), B=await px(bg);
    const b=[B.data[0],B.data[1],B.data[2]];
    let best=null,bd=-1;
    for(let i=0;i<G.data.length;i+=4){
      const q=[G.data[i],G.data[i+1],G.data[i+2]];
      const d=Math.abs(q[0]-b[0])+Math.abs(q[1]-b[1])+Math.abs(q[2]-b[2]);
      if(d>bd){bd=d;best=q;}
    }
    return {ink:best, bg:b, delta:bd};
  },[shot.toString('base64'),bgShot.toString('base64'),b2.w,b2.h]);
  const hit=await p.evaluate(sel=>{const el=document.querySelector(sel);const r=el.getBoundingClientRect();
    const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
    return !!(t&&(t===el||el.contains(t)));},sel);
  return {found:true,...out,hitTestsToSelf:hit};
}
R.currentGlyph = await glyphInk('.activity-panel .goal-phase.is-current .goal-phase-glyph');
R.doneGlyph    = await glyphInk('.activity-panel .goal-phase.completed .goal-phase-glyph');
R.blockedGlyph = await glyphInk('.activity-panel .goal-phase.blocked .goal-phase-glyph');
R.pendingGlyph = await glyphInk('.activity-panel .goal-phase.pending .goal-phase-glyph');
R.abandonedGlyph = await glyphInk('.activity-panel .goal-phase.abandoned .goal-phase-glyph');
R.strikePainted = await p.evaluate(()=>{
  const li=document.querySelector('.activity-panel .goal-phase.completed');
  const s=li.querySelector('.goal-strike'), t=li.querySelector('.goal-phase-title');
  const rs=s.getBoundingClientRect(), rt=t.getBoundingClientRect();
  return {strikeW:Math.round(rs.width), titleW:Math.round(rt.width), transform:getComputedStyle(s).transform,
          currentStrike:(function(){const c=document.querySelector('.activity-panel .goal-phase.is-current .goal-strike');
            return c?getComputedStyle(c).transform:null;})()};
});
R.currentBg    = await paint('.activity-panel .goal-phase.is-current', 0.97, 0.12);
R.pendingBg    = await paint('.activity-panel .goal-phase.pending', 0.97, 0.12);
R.glyphShapes = await p.evaluate(()=>{
  const m={};
  for(const li of document.querySelectorAll('.activity-panel .goal-phase')){
    const s=li.className.split(' ').filter(c=>['pending','in-progress','completed','blocked','abandoned'].includes(c))[0];
    const g=li.querySelector('.goal-glyph-svg');
    if(g&&!m[s]) m[s]=g.innerHTML.replace(/\s+/g,' ').slice(0,90);
  }
  return m;
});
// structured blocker + replan markers
R.blockerFields=await p.evaluate(()=>{
  const dl=document.querySelector('.activity-panel .goal-blocker-grid'); if(!dl) return null;
  return {dts:[...dl.querySelectorAll('dt')].map(x=>x.textContent),
          dds:[...dl.querySelectorAll('dd')].map(x=>x.textContent.length)};
});
R.replanMarkers=await p.evaluate(()=>[...document.querySelectorAll('.activity-panel .goal-replan-marker')].map(x=>x.querySelector('strong').textContent));
R.counter=await p.evaluate(()=>{const c=document.querySelector('.activity-panel .goal-counter');return c?c.textContent.replace(/\s+/g,' ').trim():null;});
R.headerChip=await p.evaluate(()=>{const c=document.querySelector('.chat-header .goal-chip');return c?c.textContent.trim()+' | title='+c.title.slice(0,60):null;});
R.sidebar=await p.evaluate(()=>{const c=document.querySelector('.goal-sidebar .goal-sidebar-line');return c?c.textContent:null;});
await p.screenshot({path:`${OUT}/01-section-dark.png`,clip:await p.evaluate(()=>{const a=document.querySelector('.activity-panel').getBoundingClientRect();return{x:a.left,y:a.top,width:a.width,height:Math.min(a.height,860)};})});

// ---- phase drill-in ----
await p.locator('.activity-panel .goal-phase.blocked .goal-phase-row').click();
await p.waitForTimeout(350);
R.drill=await paint('.activity-panel .goal-phase.blocked .goal-phase-detail',0.5,0.2);
R.drillText=await p.evaluate(()=>{const d=document.querySelector('.activity-panel .goal-phase.blocked .goal-phase-detail');return d?d.textContent.replace(/\s+/g,' ').slice(0,220):null;});
await p.screenshot({path:`${OUT}/02-phase-drill.png`,clip:await p.evaluate(()=>{const a=document.querySelector('.activity-panel').getBoundingClientRect();return{x:a.left,y:a.top,width:a.width,height:Math.min(a.height,860)};})});
await p.locator('.activity-panel .goal-phase.blocked .goal-phase-row').click();
await p.waitForTimeout(200);

// ---- lifecycle buttons change REAL state ----
const click=async sel=>{await p.locator(sel).first().click();await p.waitForTimeout(320);};
R.life={};
await click('.activity-panel [data-action="pause-goal"]');
R.life.afterPause=await st();
R.life.pauseChip=await p.evaluate(()=>document.querySelector('.activity-panel .goal-status-chip').textContent.trim());
R.life.pauseDisabled=await p.evaluate(()=>({pause:!!document.querySelector('.activity-panel [data-action="pause-goal"]').disabled,resume:!!document.querySelector('.activity-panel [data-action="resume-goal"]').disabled}));
await click('.activity-panel [data-action="resume-goal"]');
R.life.afterResume=await st();
await click('.activity-panel [data-action="stop-goal"]');
R.life.afterStop=await st();
R.life.stopChip=await p.evaluate(()=>document.querySelector('.activity-panel .goal-status-chip').textContent.trim());
// restore to active for the rest of the run
await p.evaluate(()=>{window.PM56_DATA.goal.status='active';});
await p.evaluate(()=>window.PM56_DEMO.openActivity('goal'));
await p.waitForTimeout(200);
// clear -> confirm -> cleared -> restore
await click('.activity-panel [data-action="clear-goal"]');
R.life.confirmVisible=await p.evaluate(()=>!!document.querySelector('.activity-panel .goal-confirm'));
await click('.activity-panel [data-action="goal-clear-confirm"]');
R.life.afterClear=await st();
R.life.clearedBlock=await p.evaluate(()=>{const c=document.querySelector('.activity-panel .goal-cleared');return c?c.textContent.replace(/\s+/g,' ').slice(0,110):null;});
R.life.barCountWhenCleared=await p.evaluate(()=>{const b=document.querySelector('.activity-item[data-hover-domain="goal"] .count');return b?b.textContent:null;});
await click('.activity-panel [data-action="goal-restore"]');
R.life.afterRestore=await st();

// ---- edit -> material replan ----
await click('.activity-panel [data-action="edit-goal"]');
R.edit={editorOpen:await p.evaluate(()=>!!document.querySelector('.goal-doc .goal-edit'))};
await p.evaluate(()=>{const t=document.querySelector('[data-goal-input="objective"]');t.value=t.value+' Also keep p99 under 400 ms.';t.dispatchEvent(new Event('input',{bubbles:true}));});
await click('[data-action="goal-save-edit"]');
R.edit.after=await st();
R.edit.callout=await p.evaluate(()=>{const c=document.querySelector('.goal-replan-callout');return c?c.textContent.replace(/\s+/g,' ').slice(0,120):null;});
R.edit.newMarkerCount=await p.evaluate(()=>document.querySelectorAll('.goal-doc .goal-replan-marker').length);
await click('[data-action="goal-accept-replan"]');
R.edit.accepted=(await st()).status;

// ---- goal editor surface has no literals left ----
R.editor=await p.evaluate(()=>{
  const d=document.querySelector('.goal-doc'); if(!d) return null;
  const t=d.textContent;
  return {chars:t.length,
    hasOldLiterals:/Phase 2 of 4|Revision 4|68%|Goal Mode/.test(t),
    hasRuntimeLabels:['Mode','Provider','Model','Effort','Subagents','Tokens','Context','Est. Cost','Worktree','Merge Status','takeover_state'].every(l=>t.includes(l)),
    phases:d.querySelectorAll('.goal-phase').length,
    tabLabel:(document.querySelector('.editor-tab.active .editor-tab-label')||{}).textContent};
});
await p.screenshot({path:`${OUT}/03-editor-dark.png`,fullPage:false});

// ---- agent step: completion wipe + backward pointer + budget_limited + complete ----
R.flow=[];
async function step(label){ await click('[data-action="goal-agent-step"]'); const s=await st(); R.flow.push({label,status:s.status,current:s.current,budget:s.budget,phases:s.phases}); }
await step('step1');
R.flow.push({label:'unblock-before',blocker:(await st()).blocker});
await click('.goal-doc [data-action="goal-unblock"]');
const afterUnblock=await st(); R.flow.push({label:'unblocked',status:afterUnblock.status,current:afterUnblock.current,phases:afterUnblock.phases});
await step('step2');
await step('step3-budget');
R.flow.push({label:'budgetLimited',status:(await st()).status});
await click('[data-action="goal-raise-budget"]');
await step('step4-complete');
R.completionReport=await p.evaluate(()=>{const r=document.querySelector('.goal-report');return r?r.textContent.replace(/\s+/g,' ').slice(0,200):null;});

R.consoleErrors=errs;
fs.writeFileSync(`${OUT}/../verify-goals.json`,JSON.stringify(R,null,1));
console.log(JSON.stringify(R,null,1));
await b.close();
