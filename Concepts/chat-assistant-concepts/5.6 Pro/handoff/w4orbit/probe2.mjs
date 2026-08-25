import { chromium } from 'playwright';
import path from 'path';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+path.resolve(process.cwd(),'index.html'));
await p.waitForFunction(()=>window.PM56_DEMO);
await p.evaluate(()=>{ window.PM56_DEMO.setVariant(2,1); window.PM56_DEMO.setWorkStep(6); });
await p.waitForTimeout(600);
console.log('orbit-node transition:', JSON.stringify(await p.evaluate(()=>{
  const n=document.querySelector('.orbit-node'); const cs=getComputedStyle(n);
  return {prop:cs.transitionProperty, dur:cs.transitionDuration, delay:cs.transitionDelay};
})));
// grid 0fr -> 1fr animation support test
const gridTest = await p.evaluate(async ()=>{
  const d=document.createElement('div');
  d.style.cssText='position:fixed;left:0;top:0;width:400px;display:grid;grid-template-columns:auto 0fr;transition:grid-template-columns 400ms linear';
  d.innerHTML='<i style="width:60px;display:block"></i><b style="overflow:hidden;min-width:0">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</b>';
  document.body.appendChild(d);
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const w0=d.children[1].getBoundingClientRect().width;
  d.style.gridTemplateColumns='auto 1fr';
  await new Promise(r=>setTimeout(r,200));
  const wMid=d.children[1].getBoundingClientRect().width;
  await new Promise(r=>setTimeout(r,400));
  const wEnd=d.children[1].getBoundingClientRect().width;
  d.remove();
  return {w0,wMid,wEnd, animates: wMid>w0+2 && wMid<wEnd-2};
});
console.log('grid fr animation:', JSON.stringify(gridTest));
// max-width 0 -> 100% test
const mwTest = await p.evaluate(async ()=>{
  const d=document.createElement('div');
  d.style.cssText='position:fixed;left:0;top:0;width:400px;display:flex';
  d.innerHTML='<i style="width:60px;flex:0 0 auto"></i><b style="flex:1 1 0;min-width:0;overflow:hidden;max-width:0;transition:max-width 400ms linear">xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</b>';
  document.body.appendChild(d);
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const w0=d.children[1].getBoundingClientRect().width;
  d.children[1].style.maxWidth='100%';
  await new Promise(r=>setTimeout(r,200));
  const wMid=d.children[1].getBoundingClientRect().width;
  await new Promise(r=>setTimeout(r,400));
  const wEnd=d.children[1].getBoundingClientRect().width;
  d.remove();
  return {w0,wMid,wEnd, animates: wMid>w0+2 && wMid<wEnd-2};
});
console.log('max-width animation:', JSON.stringify(mwTest));
console.log('UA:', await p.evaluate(()=>navigator.userAgent));
await b.close();
