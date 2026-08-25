import { chromium } from 'playwright';
import path from 'path';
const file = process.argv[2] || path.resolve(process.cwd(), 'index.html');
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+file);
await p.waitForFunction(()=>window.PM56_DEMO);
const out={};
for (const take of [3,8]) {
  await p.evaluate(t=>{ window.PM56_DEMO.setVariant(2,t); window.PM56_DEMO.setWorkStep(6); }, take);
  await p.waitForTimeout(600);
  out['take'+take] = await p.evaluate(()=>{
    const rest = document.querySelector('.wa-disc.done, .rail8-item.done');
    if(!rest) return {missing:true};
    const svg=rest.querySelector('svg'), sr=svg.getBoundingClientRect();
    return { discBox:[rest.getBoundingClientRect().width, rest.getBoundingClientRect().height],
      transform:getComputedStyle(rest).transform,
      svg:[+sr.width.toFixed(2)], stroke:getComputedStyle(svg).strokeWidth,
      effPx:+((parseFloat(getComputedStyle(svg).strokeWidth))*(sr.width/24)).toFixed(3) };
  });
}
console.log(JSON.stringify(out,null,1));
await b.close();
