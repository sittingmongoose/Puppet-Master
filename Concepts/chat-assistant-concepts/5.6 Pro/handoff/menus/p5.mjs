import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const PICK=[['persona','.selector-button[data-kind="persona"]'],['model','.selector-button[data-kind="model"]'],
  ['mode','.selector-button[data-kind="mode"]'],['permissions','.selector-button[data-kind="permissions"]'],
  ['worktree','.chat-header .worktree-button']];
const b=await chromium.launch({executablePath:EXE});
const errs=[];
for(const w of [1440,1200,1024,900]){
  const p=await b.newPage({viewport:{width:w,height:900}});
  p.on('console',m=>{if(m.type()==='error')errs.push([w,m.text()])}); p.on('pageerror',e=>errs.push([w,String(e)]));
  await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(500);
  const row={};
  for(const [name,sel] of PICK){
    const r = await p.evaluate(async ([sel])=>{
      const btn=document.querySelector(sel); if(!btn) return {missing:true};
      btn.click(); await new Promise(x=>setTimeout(x,480));
      const m=document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]');
      if(!m) return {noMenu:true};
      const a=btn.getBoundingClientRect(), q=m.getBoundingClientRect();
      const sp=document.getElementById('pmOverlayRoot').getAttribute('data-pm56-sprout');
      const overlap=!(q.right<a.left||q.left>a.right||q.bottom<a.top||q.top>a.bottom);
      const hit=document.elementFromPoint(q.left+q.width/2,q.top+Math.min(24,q.height/2));
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
      await new Promise(x=>setTimeout(x,380));
      return {gap:+(sp==='b'? a.top-q.bottom : q.top-a.bottom).toFixed(1), sp, overlap,
        w:+q.width.toFixed(1), h:+q.height.toFixed(1),
        inView: q.left>=-0.5 && q.top>=-0.5 && q.right<=innerWidth+0.5 && q.bottom<=innerHeight+0.5,
        owns: !!hit && m.contains(hit),
        leftover: document.querySelectorAll('#pmOverlayRoot .overlay-menu').length};
    },[sel]);
    row[name]=r;
  }
  console.log(w, JSON.stringify(row));
  await p.close();
}
console.log('errors', errs);
await b.close();
