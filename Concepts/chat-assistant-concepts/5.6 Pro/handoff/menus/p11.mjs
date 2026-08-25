/* Reproduce menus-verify's exact prefix, then report placement delta per picker. */
import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const PICK=[['persona','.selector-button[data-kind="persona"]'],['model','.selector-button[data-kind="model"]'],
  ['mode','.selector-button[data-kind="mode"]'],['permissions','.selector-button[data-kind="permissions"]'],
  ['worktree','.chat-header .worktree-button']];
const b=await chromium.launch({executablePath:EXE});
for(let run=0;run<3;run++){
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(500);
  // prefix: the dot-colour loop
  for(const id of ['main','feature/query-index','concept/chat-5-6-pro','review/query-benchmarks']){
    await p.evaluate(async (v)=>{ document.querySelector('.chat-header .worktree-button').click();
      await new Promise(r=>setTimeout(r,200));
      const row=document.querySelector(`#pmOverlayRoot [data-action="set-worktree"][data-value="${v.replace(/["\\]/g,'\\$&')}"]`);
      if(row) row.click(); }, id);
    await p.waitForTimeout(450);
  }
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  const out={};
  for(const [name,sel] of PICK){
    await p.click(sel); await p.waitForTimeout(430);
    out[name] = await p.evaluate((s)=>{
      const a=document.querySelector(s).getBoundingClientRect();
      const m=document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]').getBoundingClientRect();
      const sp=document.getElementById('pmOverlayRoot').getAttribute('data-pm56-sprout');
      return {gap:+((sp==='b'? a.top-m.bottom : m.top-a.bottom)).toFixed(1), h:+m.height.toFixed(1), top:+m.top.toFixed(1),
        anchored:document.getElementById('pmOverlayRoot').classList.contains('pm56-anchor-bottom')};
    }, sel);
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  }
  console.log('run',run,JSON.stringify(out));
  await p.close();
}
await b.close();
