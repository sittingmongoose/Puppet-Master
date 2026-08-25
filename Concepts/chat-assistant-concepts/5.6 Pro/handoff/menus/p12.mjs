import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const b=await chromium.launch({executablePath:EXE});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(500);
for(const id of ['main','feature/query-index','concept/chat-5-6-pro','review/query-benchmarks']){
  await p.evaluate(async (v)=>{ document.querySelector('.chat-header .worktree-button').click();
    await new Promise(r=>setTimeout(r,200));
    const row=document.querySelector(`#pmOverlayRoot [data-action="set-worktree"][data-value="${v.replace(/["\\]/g,'\\$&')}"]`);
    if(row) row.click(); }, id);
  await p.waitForTimeout(450);
}
await p.keyboard.press('Escape'); await p.waitForTimeout(400);
const out = await p.evaluate(async ()=>{
  const btn=document.querySelector('.selector-button[data-kind="persona"]');
  const trace=[];
  const snap=(tag)=>{const a=btn.getBoundingClientRect();
    const m=document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]');
    trace.push([tag, +a.top.toFixed(1), m?+m.getBoundingClientRect().top.toFixed(1):null,
      m?+m.getBoundingClientRect().height.toFixed(1):null, +document.querySelector('.composer').getBoundingClientRect().top.toFixed(1),
      +document.querySelector('.transcript').getBoundingClientRect().height.toFixed(1)]);};
  snap('before');
  btn.click();
  snap('sync');
  await new Promise(r=>requestAnimationFrame(()=>r()));
  snap('rAF1');
  await new Promise(r=>requestAnimationFrame(()=>r()));
  snap('rAF2');
  for(const ms of [60,150,300,430,900,2100]){ await new Promise(r=>setTimeout(r,ms===60?60:ms-trace[trace.length-1][0])); }
  return trace;
});
console.log('[tag, anchorTop, menuTop, menuH, composerTop, transcriptH]');
for(const t of out) console.log(JSON.stringify(t));
// then sample over time
const later = await p.evaluate(async ()=>{
  const btn=document.querySelector('.selector-button[data-kind="persona"]');
  const o=[];
  for(let i=0;i<10;i++){ await new Promise(r=>setTimeout(r,60));
    const a=btn.getBoundingClientRect();
    const m=document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]');
    o.push([i*60, +a.top.toFixed(1), m?+m.getBoundingClientRect().top.toFixed(1):null]);}
  return o;
});
console.log('later', JSON.stringify(later));
await b.close();
