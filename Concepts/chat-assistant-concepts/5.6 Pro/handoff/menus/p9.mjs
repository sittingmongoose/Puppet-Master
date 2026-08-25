/* Ghost must not be addressable: reproduce the audit's open/close/open pattern
   and count duplicate control hooks while a ghost is on screen. */
import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const b=await chromium.launch({executablePath:EXE});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(500);
const out = await p.evaluate(async ()=>{
  const q=s=>document.querySelectorAll(s).length;
  document.querySelector('.selector-button[data-kind="mode"]').click();
  await new Promise(x=>setTimeout(x,500));
  const openCount=q('[data-submenu="deep-plan"]');
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  await new Promise(x=>setTimeout(x,60));
  const ghosts=q('.pm56-menu-ghost');
  const duringClose={submenu:q('[data-submenu="deep-plan"]'), action:q('[data-action="set-mode"]'), ids:q('[data-overlay]')};
  // reopen immediately, the audit's pattern
  document.querySelector('.selector-button[data-kind="mode"]').click();
  await new Promise(x=>setTimeout(x,40));
  const afterReopen={submenu:q('[data-submenu="deep-plan"]'), ghosts:q('.pm56-menu-ghost')};
  await new Promise(x=>setTimeout(x,500));
  return {openCount, ghostsWhileClosing:ghosts, duringClose, afterReopen,
    ghostAttrs: (()=>{const g=document.querySelector('.pm56-menu-ghost'); return g?[...g.attributes].map(a=>a.name):null;})()};
});
console.log(JSON.stringify(out,null,1));
await b.close();
