import { chromium } from 'playwright';
import path from 'path';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+path.resolve(process.cwd(),'index.html'));
await p.waitForFunction(()=>window.PM56_DEMO);
async function drag(pct){ const h=await p.locator('[data-resize="editor"]').first().boundingBox();
  await p.mouse.move(h.x+h.width/2,h.y+h.height/2); await p.mouse.down();
  await p.mouse.move(1440*(pct/100), h.y+h.height/2,{steps:14}); await p.mouse.up(); await p.waitForTimeout(400); }
await p.evaluate(()=>{ window.PM56_DEMO.setVariant(2,1); window.PM56_DEMO.setWorkStep(7); });
await p.waitForTimeout(700);
await p.evaluate(()=>document.querySelector('.orbit-node[data-value="7"]').click());
await p.waitForTimeout(700);
const out={};
for(const pct of [26,34,44,54,62,70]){
  await drag(pct); await p.waitForTimeout(500);
  out[pct]=await p.evaluate(()=>{
    const st=document.querySelector('.orbit-stage'); const dial=st.querySelector('.orbit-dial');
    const core=st.querySelector('.orbit-core'); const dr=dial.getBoundingClientRect();
    const cx=dr.left+dr.width/2, cy=dr.top+dr.height/2;
    const coreR=core.getBoundingClientRect().width/2;
    const sats=[...st.querySelectorAll('.orbit-sat')].map(s=>{const b=s.getBoundingClientRect();
      return {r:Math.hypot(b.left+b.width/2-cx,b.top+b.height/2-cy), half:b.width/2};});
    const nodes=[...st.querySelectorAll('.orbit-node')].map(n=>{const b=n.getBoundingClientRect();
      return {r:Math.hypot(b.left+b.width/2-cx,b.top+b.height/2-cy), half:b.width/2};});
    const lab=core.querySelector('strong');
    const lr=lab.getBoundingClientRect(), cr=core.getBoundingClientRect();
    return {
      stageW:+st.getBoundingClientRect().width.toFixed(1), dialW:+dr.width.toFixed(1), coreD:+(coreR*2).toFixed(1),
      satCount:sats.length,
      satCoreGap: sats.length? +Math.min(...sats.map(s=>s.r-s.half-coreR)).toFixed(1): null,
      satNodeGap: (sats.length&&nodes.length)? +(Math.min(...nodes.map(n=>n.r-n.half)) - Math.max(...sats.map(s=>s.r+s.half))).toFixed(1): null,
      labelOverflowPx: +Math.max(0, (lr.width - (cr.width-16))).toFixed(1),
      labelEscapes: +Math.max(0, (lr.left<cr.left? cr.left-lr.left:0) + (lr.right>cr.right? lr.right-cr.right:0)).toFixed(1),
      labelText: lab.textContent, coreScrollW: core.scrollWidth, coreClientW: core.clientWidth
    };
  });
}
console.log(JSON.stringify(out,null,1));
await b.close();
