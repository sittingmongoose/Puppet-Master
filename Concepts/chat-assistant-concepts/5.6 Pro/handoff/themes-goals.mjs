import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import fs from 'fs';
const OUT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/shots-goals';
fs.mkdirSync(OUT,{recursive:true});
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const THEMES=['basic-dark','basic-light','friendly-dark','friendly-light','glass-dark','glass-light','retro-dark','retro-light'];
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const R={themes:{},errs:[]};

/* ---------- 1. all 8 themes, section + editor ---------- */
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});
p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')R.errs.push(m.type()+':'+m.text());});
p.on('pageerror',e=>R.errs.push('PAGEERROR '+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
for(const t of THEMES){
  await p.evaluate(th=>{window.PM56_DEMO.setTheme(th);window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');},t);
  await p.waitForTimeout(700);
  await p.evaluate(()=>document.querySelector('.activity-panel .goal-block').scrollIntoView({block:'start'}));
  await p.waitForTimeout(250);
  const clip=await p.evaluate(()=>{const a=document.querySelector('.activity-panel').getBoundingClientRect();
    return {x:Math.round(a.left),y:Math.round(a.top),width:Math.round(a.width),height:Math.round(Math.min(a.height,880))};});
  await p.screenshot({path:`${OUT}/theme-${t}.png`,clip});
  R.themes[t]=await p.evaluate(()=>{
    const ov=[...document.querySelectorAll('.goal-block *, .goal-chip, .goal-sidebar')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+0.5;}).map(e=>e.tagName+'.'+String(e.className).split(' ')[0]);
    const cs=s=>{const e=document.querySelector(s);return e?getComputedStyle(e).color:null;};
    return {docScrollW:document.documentElement.scrollWidth, bodyScrollW:document.body.scrollWidth,
      overflowing:ov,
      chipText:(document.querySelector('.activity-panel .goal-status-chip')||{}).textContent,
      colours:{current:cs('.goal-phase.is-current .goal-phase-glyph'),done:cs('.goal-phase.completed .goal-phase-glyph'),
               blocked:cs('.goal-phase.blocked .goal-phase-glyph'),pending:cs('.goal-phase.pending .goal-phase-glyph'),
               abandoned:cs('.goal-phase.abandoned .goal-phase-glyph')}};
  });
}
// editor view in one light + one dark theme
for(const t of ['basic-dark','basic-light']){
  await p.evaluate(th=>window.PM56_DEMO.setTheme(th),t);
  await p.evaluate(()=>document.querySelector('.chat-header .goal-chip').click());
  await p.waitForTimeout(600);
  await p.evaluate(()=>{['replans','history','subgoals'].forEach(v=>{
    const btn=document.querySelector(`.goal-doc [data-action="goal-toggle"][data-value="${v}"]`);
    if(btn && btn.getAttribute('aria-expanded')!=='true') btn.click();});});
  await p.waitForTimeout(700);
  await p.evaluate(()=>{document.querySelector('.editor-body').scrollTop=0;});
  await p.waitForTimeout(300);
  await p.screenshot({path:`${OUT}/editor-${t}-top.png`,clip:{x:0,y:46,width:770,height:854}});
  await p.evaluate(()=>{const e=document.querySelector('.editor-body');e.scrollTop=e.scrollHeight*0.42;});
  await p.waitForTimeout(400);
  await p.screenshot({path:`${OUT}/editor-${t}-mid.png`,clip:{x:0,y:46,width:770,height:854}});
  await p.evaluate(()=>{const e=document.querySelector('.editor-body');e.scrollTop=e.scrollHeight;});
  await p.waitForTimeout(400);
  await p.screenshot({path:`${OUT}/editor-${t}-end.png`,clip:{x:0,y:46,width:770,height:854}});
}
await p.close();

/* ---------- 2. reduced motion: decoration stops, STATE still advances ---------- */
const q=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const rmErrs=[]; q.on('pageerror',e=>rmErrs.push(''+e));
await q.goto(pathToFileURL(target).href,{waitUntil:'load'});
await q.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await q.evaluate(()=>{window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');});
await q.waitForTimeout(700);
R.reduced={};
R.reduced.loops=await q.evaluate(()=>{
  const out=[];
  for(const e of document.querySelectorAll('.goal-block *, .goal-chip, .goal-sidebar *')){
    const c=getComputedStyle(e);
    if(c.animationName!=='none'&&(c.animationIterationCount==='infinite'))
      out.push(String(e.className)+':'+c.animationName+':'+c.animationIterationCount);
  }
  return out;
});
R.reduced.pulseAnim=await q.evaluate(()=>{const e=document.querySelector('.goal-pulse');return e?getComputedStyle(e).animationName:'absent';});
R.reduced.chipDot=await q.evaluate(()=>{const e=document.querySelector('.goal-status-chip .goal-chip-dot');return e?getComputedStyle(e).animationName:'absent';});
R.reduced.before=await q.evaluate(()=>({s:window.PM56_DATA.goal.status,c:window.PM56_DATA.goal.currentPhaseId,
  done:window.PM56_DATA.goal.phases.filter(p=>p.status==='completed').length}));
await q.evaluate(()=>document.querySelector('.activity-panel [data-action="pause-goal"]').click());
await q.waitForTimeout(200);
R.reduced.afterPause=await q.evaluate(()=>window.PM56_DATA.goal.status);
await q.evaluate(()=>document.querySelector('.activity-panel [data-action="resume-goal"]').click());
await q.waitForTimeout(200);
await q.evaluate(()=>document.querySelector('.chat-header .goal-chip').click());
await q.waitForTimeout(400);
await q.evaluate(()=>document.querySelector('[data-action="goal-agent-step"]').click());
await q.waitForTimeout(250);
R.reduced.after=await q.evaluate(()=>({s:window.PM56_DATA.goal.status,c:window.PM56_DATA.goal.currentPhaseId,
  done:window.PM56_DATA.goal.phases.filter(p=>p.status==='completed').length,
  strikeTransform:(function(){const li=[...document.querySelectorAll('.goal-doc .goal-phase')].filter(x=>x.querySelector('.goal-phase-text').textContent==='Implement')[0];
    return li?getComputedStyle(li.querySelector('.goal-strike')).transform:null;})(),
  wipeDur:(function(){const li=[...document.querySelectorAll('.goal-doc .goal-phase')].filter(x=>x.querySelector('.goal-phase-text').textContent==='Implement')[0];
    return li?getComputedStyle(li.querySelector('.goal-strike')).animationDuration:null;})()}));
R.reduced.errs=rmErrs;
await q.close();
fs.writeFileSync(`${OUT}/../themes-goals.json`,JSON.stringify(R,null,1));
console.log(JSON.stringify(R,null,1));
await b.close();
