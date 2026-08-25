import { chromium } from 'playwright-core';
const EXE='/home/sittingmongoose/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const URL='file:///mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6%20Pro/index.html';
const b=await chromium.launch({executablePath:EXE});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
await p.goto(URL,{waitUntil:'load'}); await p.waitForTimeout(500);
await p.click('.selector-button[data-kind="model"]'); await p.waitForTimeout(500);
const row = await p.$('.model-row');
await row.hover();
const out = await p.evaluate(async ()=>{
  const s=[]; const t0=performance.now();
  await new Promise(res=>{(function step(){
    const el=document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="sidecar"]');
    if(el){const cs=getComputedStyle(el);s.push([+(performance.now()-t0).toFixed(0),+(+cs.opacity).toFixed(3),cs.transform,cs.transformOrigin,el.getAttribute('data-side')]);}
    if(performance.now()-t0<520) requestAnimationFrame(step); else res();
  })();});
  const el=document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="sidecar"]');
  const r = el?el.getBoundingClientRect():null;
  const root=document.querySelector('#pmOverlayRoot .overlay-menu[data-overlay="root-menu"]').getBoundingClientRect();
  const hit = r? document.elementFromPoint(r.left+r.width/2, r.top+20):null;
  return {samples:s.filter((_,i)=>i%3===0).slice(0,8), rect:r?{x:+r.left.toFixed(1),y:+r.top.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)}:null,
     rootRight:+root.right.toFixed(1), rootLeft:+root.left.toFixed(1), owns: !!hit && el.contains(hit),
     overlapRoot: r? !(r.right<root.left||r.left>root.right) : null};
});
console.log(JSON.stringify(out,null,1)); console.log('errors',errs);
await b.close();
