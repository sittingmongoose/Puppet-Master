import { chromium } from 'playwright';
import path from 'path';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
await p.goto('file://'+path.resolve(process.cwd(),'index.html'));
await p.waitForFunction(()=>window.PM56_DEMO);
await p.evaluate(()=>{ window.PM56_DEMO.setVariant(2,1); window.PM56_DEMO.setWorkStep(7); });
await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(()=>{
  const st=document.querySelector('.orbit-stage');
  const cs=getComputedStyle(st);
  const body=st.closest('.working-body'), card=st.closest('.working-card');
  const chain=[];
  let e=st;
  while(e && e!==document.body){ const r=e.getBoundingClientRect(); const c=getComputedStyle(e);
    chain.push({cls:(e.className||'').toString().slice(0,40), tag:e.tagName, w:+r.width.toFixed(1), h:+r.height.toFixed(1), disp:c.display, pos:c.position, ct:c.containerType, cn:c.containerName});
    e=e.parentElement; if(chain.length>6) break; }
  const kids=[...st.children].map(k=>{const r=k.getBoundingClientRect(); return {cls:k.className.toString().slice(0,30), w:+r.width.toFixed(1), h:+r.height.toFixed(1), as:getComputedStyle(k).alignSelf};});
  const pin=st.querySelector('.orbit-panel-in'); const pr=pin.getBoundingClientRect();
  return {stageCT:cs.containerType, stageCN:cs.containerName, gtc:cs.gridTemplateColumns, gtr:cs.gridTemplateRows,
    ai:cs.alignItems, ji:cs.justifyItems, jc:cs.justifyContent, minH:cs.minHeight, h:cs.height,
    kids, pin:{w:+pr.width.toFixed(1),h:+pr.height.toFixed(1), css:getComputedStyle(pin).width, hh:getComputedStyle(pin).height}, chain};
}),null,1));
await b.close();
