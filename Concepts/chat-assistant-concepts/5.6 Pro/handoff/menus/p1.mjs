import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const b=await chromium.launch({executablePath:EXE});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push(String(e)));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(500);
const out = await p.evaluate(async ()=>{
  const r={};
  const wt=document.querySelector('.chat-header .worktree-button');
  r.wt = wt ? {state:wt.dataset.wtState, rect:wt.getBoundingClientRect().toJSON(), title:wt.title} : null;
  const h=document.querySelector('.chat-header');
  r.order=[...h.children].map(c=>c.className||c.tagName);
  r.composerWt = getComputedStyle(document.querySelector('.composer-tools .selector-button[data-kind="worktree"]')).display;
  // open persona
  document.querySelector('.selector-button[data-kind="persona"]').click();
  const samples=[];
  const t0=performance.now();
  await new Promise(res=>{(function step(){
     const m=document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]');
     if(m){const cs=getComputedStyle(m);samples.push([+(performance.now()-t0).toFixed(0), +(+cs.opacity).toFixed(3), cs.transform, m.getBoundingClientRect().top.toFixed(1)]);}
     if(performance.now()-t0<520) requestAnimationFrame(step); else res();
  })();});
  r.openSamples=samples.filter((_,i)=>i%2===0).slice(0,14);
  r.sprout=document.getElementById('pmOverlayRoot').getAttribute('data-pm56-sprout');
  return r;
});
console.log(JSON.stringify(out,null,1));
console.log('errors',errs);
await b.close();
