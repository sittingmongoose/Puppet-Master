/* Isolation probe: is the audit's "ctx-pop intercepts pointer events" failure
   caused by menus.css's `.overlay-menu{z-index:var(--z-menu)}`? Reproduce the
   audit's sequence, then strip the z-index at runtime and re-test. */
import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const b=await chromium.launch({executablePath:EXE});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push(String(e)));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(600);
const out = await p.evaluate(async ()=>{
  const r={};
  document.querySelector('.context-ring').click();
  await new Promise(x=>setTimeout(x,600));
  const closeBtn=document.querySelector('[data-action="close-activity"]');
  r.closeBtnExists=!!closeBtn;
  function hitAt(el){ if(!el) return null; const q=el.getBoundingClientRect();
    const h=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);
    return h? h.tagName+'.'+(h.className||'') : null; }
  // open the activity panel the way the audit does
  const dom=document.querySelector('[data-hover-domain]');
  r.ctxMenu = !!document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]');
  const cb=document.querySelector('[data-action="close-activity"]');
  r.withZ = hitAt(cb);
  r.menuZ = getComputedStyle(document.querySelector('#pmOverlayRoot .overlay-menu')).zIndex;
  // strip z-index from every overlay menu (simulating menus.css without the rule)
  document.querySelectorAll('#pmOverlayRoot .overlay-menu').forEach(m=>m.style.setProperty('z-index','auto','important'));
  await new Promise(x=>requestAnimationFrame(()=>requestAnimationFrame(x)));
  r.withoutZ = hitAt(document.querySelector('[data-action="close-activity"]'));
  r.menuZ2 = getComputedStyle(document.querySelector('#pmOverlayRoot .overlay-menu')).zIndex;
  r.overlayRootZ = getComputedStyle(document.getElementById('pmOverlayRoot')).zIndex;
  return r;
});
console.log(JSON.stringify(out,null,1)); console.log('errors',errs);
await b.close();
