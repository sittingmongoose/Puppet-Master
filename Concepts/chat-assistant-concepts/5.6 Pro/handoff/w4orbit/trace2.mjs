import { chromium } from 'playwright';
import path from 'path';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+path.resolve(process.cwd(),'index.html'));
await p.waitForFunction(()=>window.PM56_DEMO);
await p.evaluate(()=>{ window.PM56_DEMO.setVariant(2,1); window.PM56_DEMO.setWorkStep(7); });
await p.waitForTimeout(800);
const t = await p.evaluate(async ()=>{
  const st=document.querySelector('.orbit-stage');
  st.querySelector('.orbit-node[data-value="4"]').click();
  await new Promise(r=>setTimeout(r,800));
  const out=[]; const t0=performance.now();
  st.querySelector('[data-action="orbit-collapse"]').click();
  await new Promise(res=>{
    const tick=()=>{ const pa=document.querySelector('.orbit-panel'); const pin=document.querySelector('.orbit-panel-in');
      out.push([+(performance.now()-t0).toFixed(0), +pa.getBoundingClientRect().height.toFixed(1), +getComputedStyle(pin).opacity.slice(0,5), pin.textContent.slice(0,22)]);
      if(performance.now()-t0<600) requestAnimationFrame(tick); else res(); };
    requestAnimationFrame(tick);
  });
  return out;
});
console.log('t  panelH  opacity  content');
for(const r of t) console.log(r.join('  '));
await b.close();
