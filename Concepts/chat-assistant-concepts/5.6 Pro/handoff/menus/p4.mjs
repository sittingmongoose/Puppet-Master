import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const b=await chromium.launch({executablePath:EXE});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(600);
const out = await p.evaluate(async ()=>{
  const r={};
  const hit=el=>{const q=el.getBoundingClientRect();const h=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);return h?h.tagName+'.'+(h.className||''):null;};
  // 1. the audit's stale expectation
  r.compactNowExact = [...document.querySelectorAll('*')].some(n=>n.children.length===0 && n.textContent.trim()==='Compact Now');
  document.querySelector('.context-ring').click();
  await new Promise(x=>setTimeout(x,600));
  r.menuOpen = !!document.querySelector('#pmOverlayRoot .overlay-menu');
  r.compactNowExactInMenu = [...document.querySelectorAll('#pmOverlayRoot *')].filter(n=>n.children.length===0).map(n=>n.textContent.trim()).filter(t=>/^Compact/i.test(t));
  r.moreDetailsExact = [...document.querySelectorAll('#pmOverlayRoot *')].filter(n=>n.children.length===0).map(n=>n.textContent.trim()).filter(t=>/More [Dd]etails/.test(t));
  // 2. with the context menu still open, open an activity domain and try close-activity
  document.querySelector('[data-hover-domain="goal"]').click();
  await new Promise(x=>setTimeout(x,500));
  const cb=document.querySelector('[data-action="close-activity"]');
  r.closeBtn = !!cb;
  r.stillOpenMenu = !!document.querySelector('#pmOverlayRoot .overlay-menu');
  r.hitWithZ = cb?hit(cb):null;
  r.menuZ = document.querySelector('#pmOverlayRoot .overlay-menu') ? getComputedStyle(document.querySelector('#pmOverlayRoot .overlay-menu')).zIndex : null;
  document.querySelectorAll('#pmOverlayRoot .overlay-menu').forEach(m=>m.style.setProperty('z-index','auto','important'));
  await new Promise(x=>requestAnimationFrame(()=>requestAnimationFrame(x)));
  r.hitWithoutZ = cb?hit(cb):null;
  return r;
});
console.log(JSON.stringify(out,null,1));
await b.close();
