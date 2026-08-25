import { chromium } from 'playwright';
import path from 'path';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+path.resolve(process.cwd(),'index.html'));
await p.waitForFunction(()=>window.PM56_DEMO);
async function drag(pct){ const h=await p.locator('[data-resize="editor"]').first().boundingBox();
  await p.mouse.move(h.x+h.width/2,h.y+h.height/2); await p.mouse.down();
  await p.mouse.move(1440*(pct/100), h.y+h.height/2,{steps:14}); await p.mouse.up(); await p.waitForTimeout(400); }
await p.evaluate(()=>{ window.PM56_DEMO.setVariant(2,1); });
const bad=[];
for(const pct of [26,44,54,62,70]){
  await drag(pct); await p.waitForTimeout(400);
  for(let i=0;i<14;i++){
    await p.evaluate(v=>window.PM56_DEMO.setWorkStep(v), i);
    await p.waitForTimeout(90);
    const r=await p.evaluate(()=>{
      const core=document.querySelector('.orbit-core'), lab=core.querySelector('strong');
      const cr=core.getBoundingClientRect(), lr=lab.getBoundingClientRect();
      return {label:lab.textContent, dial:+document.querySelector('.orbit-dial').getBoundingClientRect().width.toFixed(0),
        escapeX:+Math.max(0, cr.left-lr.left, lr.right-cr.right).toFixed(2),
        escapeY:+Math.max(0, cr.top-lr.top, lr.bottom-cr.bottom).toFixed(2),
        clippedH: lab.scrollHeight - lab.clientHeight, clippedW: lab.scrollWidth - lab.clientWidth,
        coreClipped: core.scrollHeight - core.clientHeight};
    });
    if(r.escapeX>0.5||r.escapeY>0.5||r.clippedH>1||r.clippedW>1||r.coreClipped>1) bad.push({pct,...r});
  }
}
console.log(bad.length? JSON.stringify(bad,null,1) : 'all 14 labels x 5 widths: contained, unclipped');
await b.close();
