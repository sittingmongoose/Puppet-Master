import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const b=await chromium.launch({executablePath:EXE});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push(String(e)));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(400);
const out = await p.evaluate(async ()=>{
  const r={};
  const btn=document.querySelector('.selector-button[data-kind="model"]');
  r.hasModelBtn=!!btn;
  // Instrument positionOverlays' measurement: record the menu rect at the exact moment
  // it would be measured (first rAF after the click).
  btn.click();
  await new Promise(res=>requestAnimationFrame(()=>res()));
  const m=document.querySelector('.overlay-menu[data-overlay="root-menu"]');
  r.midRect = m ? {w:+m.getBoundingClientRect().width.toFixed(1), h:+m.getBoundingClientRect().height.toFixed(1)} : null;
  r.midTransform = m ? getComputedStyle(m).transform : null;
  r.inlineHeight = m ? m.style.height : null;
  await new Promise(res=>setTimeout(res,700));
  const rect=m.getBoundingClientRect();
  r.settled={l:+rect.left.toFixed(1),t:+rect.top.toFixed(1),w:+rect.width.toFixed(1),h:+rect.height.toFixed(1)};
  r.originX=m.style.getPropertyValue('--origin-x'); r.originY=m.style.getPropertyValue('--origin-y');
  const sc=m.querySelector('.model-scroll');
  r.rows=m.querySelectorAll('.model-row').length;
  r.groups=m.querySelectorAll('.menu-section-label').length;
  r.scroll={clientH:sc.clientHeight, scrollH:sc.scrollHeight};
  // anchor rect
  const ab=document.querySelector('.selector-button[data-kind="model"]').getBoundingClientRect();
  r.anchor={l:+ab.left.toFixed(1),t:+ab.top.toFixed(1),r:+ab.right.toFixed(1),b:+ab.bottom.toFixed(1)};
  // now filter
  const inp=m.querySelector('input[data-input="model-search"]');
  inp.value='claude'; inp.dispatchEvent(new Event('input',{bubbles:true}));
  await new Promise(res=>requestAnimationFrame(()=>res()));
  const r1=m.getBoundingClientRect();
  r.duringFilter={t:+r1.top.toFixed(1),h:+r1.height.toFixed(1),bottom:+r1.bottom.toFixed(1),inline:m.style.height};
  await new Promise(res=>setTimeout(res,800));
  const r2=m.getBoundingClientRect();
  r.afterFilter={t:+r2.top.toFixed(1),h:+r2.height.toFixed(1),bottom:+r2.bottom.toFixed(1),rows:m.querySelectorAll('.model-row').length};
  r.overlayChildren=[...document.getElementById('pmOverlayRoot').children].map(c=>c.className||c.tagName);
  return r;
});
console.log(JSON.stringify(out,null,1));
console.log('errors',errs);
await b.close();
