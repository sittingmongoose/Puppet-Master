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
  const panel=st.querySelector('.orbit-panel'), layout=st.querySelector('.orbit-layout');
  const out=[];
  const t0=performance.now();
  st.querySelector('.orbit-node[data-value="4"]').click();
  await new Promise(res=>{
    const tick=()=>{ const l=document.querySelector('.orbit-layout'); const pa=document.querySelector('.orbit-panel');
      out.push([+(performance.now()-t0).toFixed(0), +pa.getBoundingClientRect().height.toFixed(1), getComputedStyle(l).gridTemplateRows]);
      if(performance.now()-t0<900) requestAnimationFrame(tick); else res(); };
    requestAnimationFrame(tick);
  });
  return out;
});
console.log('t(ms) panelH gridTemplateRows');
for(const r of t) console.log(r[0], r[1], r[2]);
await b.close();
