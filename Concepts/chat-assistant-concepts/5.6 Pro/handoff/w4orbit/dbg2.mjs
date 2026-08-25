import { chromium } from 'playwright';
import path from 'path';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+path.resolve(process.cwd(),'index.html'));
await p.waitForFunction(()=>window.PM56_DEMO);
await p.evaluate(()=>{ window.PM56_DEMO.setVariant(2,1); window.PM56_DEMO.setWorkStep(7); });
await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(()=>{
  const pin=document.querySelector('.orbit-panel-in');
  const walk=(e,d)=>{const r=e.getBoundingClientRect(); const c=getComputedStyle(e);
    return {cls:(e.className||'').toString().slice(0,28)||e.tagName, h:+r.height.toFixed(1), w:+r.width.toFixed(1), flex:c.flex, disp:c.display,
      kids: d>0? [...e.children].map(k=>walk(k,d-1)) : undefined };};
  return walk(pin,2);
}),null,1));
await b.close();
