import { chromium } from 'playwright';
import path from 'path';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+path.resolve(process.cwd(),'index.html'));
await p.waitForFunction(()=>window.PM56_DEMO);
await p.evaluate(()=>{ window.PM56_DEMO.setVariant(2,3); window.PM56_DEMO.setWorkStep(6); });
await p.waitForTimeout(900);
console.log(JSON.stringify(await p.evaluate(()=>{
  const q=s=>{const e=document.querySelector(s); if(!e)return null; const cs=getComputedStyle(e);
    return {cls:e.className, color:cs.color, bg:cs.backgroundColor, step:cs.getPropertyValue('--pm-step'), svgW:e.querySelector('svg').getBoundingClientRect().width, sw:getComputedStyle(e.querySelector('svg')).strokeWidth, transform:cs.transform};};
  return {current:q('.wa-disc.current'), done:q('.wa-disc.done'), cardKind: document.querySelector('.working-card').dataset.stepKind};
}),null,1));
await b.close();
