import { chromium } from 'playwright';
import path from 'path';
const file = process.argv[2] || path.resolve(process.cwd(),'index.html');
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:900}, deviceScaleFactor:1 });
const errs=[]; p.on('console',m=>{ if(m.type()==='error'||m.type()==='warning') errs.push(m.type()+': '+m.text()); });
p.on('pageerror',e=>errs.push('pageerror: '+e.message));
await p.goto('file://'+file);
await p.waitForFunction(()=>window.PM56_DEMO);
await p.evaluate(()=>{ window.PM56_DEMO.setVariant(2,1); window.PM56_DEMO.setWorkStep(7); });
await p.waitForTimeout(900);
const geo = await p.evaluate(()=>{
  const st=document.querySelector('.orbit-stage');
  if(!st) return {missing:true, html:document.querySelector('.working-body')?.innerHTML.slice(0,400)};
  const dial=st.querySelector('.orbit-dial'), ring=st.querySelector('.orbit-ring'),
        core=st.querySelector('.orbit-core'), panel=st.querySelector('.orbit-panel'),
        nodes=[...st.querySelectorAll('.orbit-node')], sats=[...st.querySelectorAll('.orbit-sat')],
        track=st.querySelector('.orbit-track'), arc=st.querySelector('.orbit-arc');
  const r=e=>e?[+e.getBoundingClientRect().width.toFixed(1),+e.getBoundingClientRect().height.toFixed(1)]:null;
  const cs=getComputedStyle(ring);
  const dr = dial.getBoundingClientRect();
  const radii = nodes.map(n=>{const b=n.getBoundingClientRect();
    return +Math.hypot((b.left+b.width/2)-(dr.left+dr.width/2),(b.top+b.height/2)-(dr.top+dr.height/2)).toFixed(1);});
  return { stage:r(st), dial:r(dial), core:r(core), panel:r(panel), track:r(track), arc:r(arc),
    nodeCount:nodes.length, satCount:sats.length, nodeBox:r(nodes[0]),
    radiusMin:Math.min(...radii), radiusMax:Math.max(...radii),
    ringPE:cs.pointerEvents, nodePE:getComputedStyle(nodes[0]).pointerEvents,
    open:st.dataset.orbitOpen, gtc:getComputedStyle(st.querySelector('.orbit-layout')).gridTemplateColumns, gtr:getComputedStyle(st.querySelector('.orbit-layout')).gridTemplateRows,
    nodeDelay:getComputedStyle(nodes[0]).transitionDelay,
    chrome: !!document.querySelector('.working-variant-1 .wa-chrome'),
    chromeDisplay: document.querySelector('.working-variant-1 .wa-chrome') ? getComputedStyle(document.querySelector('.working-variant-1 .wa-chrome')).display : null,
    inlineAgents: !!document.querySelector('.live-agent-list')
  };
});
console.log('GEO', JSON.stringify(geo,null,1));
// hit-test the top node then click
const hit = await p.evaluate(()=>{
  const nodes=[...document.querySelectorAll('.orbit-node')];
  return nodes.map((n,i)=>{const b=n.getBoundingClientRect();
    const el=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
    return {i, self: n===el || n.contains(el), hitTag: el? el.className.toString().slice(0,40):null};});
});
console.log('HIT', JSON.stringify(hit));
await p.click('.orbit-node[data-value="3"]');
await p.waitForTimeout(700);
const opened = await p.evaluate(()=>{
  const st=document.querySelector('.orbit-stage'), panel=st.querySelector('.orbit-panel');
  const pin=st.querySelector('.orbit-panel-in');
  const pr=panel.getBoundingClientRect();
  const el=document.elementFromPoint(pr.left+pr.width/2, pr.top+18);
  return {open:st.dataset.orbitOpen, focus:st.dataset.orbitFocus, panelW:+pr.width.toFixed(1), panelH:+pr.height.toFixed(1), stageH:+st.getBoundingClientRect().height.toFixed(1),
    title:st.querySelector('.orbit-panel-title')?.textContent,
    rows:st.querySelectorAll('.orbit-rows .wa-row').length,
    hit: el? el.className.toString().slice(0,60):null,
    rot:getComputedStyle(st).getPropertyValue('--orbit-rot'),
    stepKind: st.dataset.stepKind, pinOpacity:getComputedStyle(pin).opacity };
});
console.log('OPENED', JSON.stringify(opened,null,1));
// agents phase
await p.click('.orbit-node[data-value="7"]');
await p.waitForTimeout(700);
const ag = await p.evaluate(()=>({
  sats: document.querySelectorAll('.orbit-sat').length,
  agents: document.querySelectorAll('.orbit-agent').length,
  names: [...document.querySelectorAll('.orbit-agent strong')].map(x=>x.textContent),
  satHit: (()=>{const s=document.querySelector('.orbit-sat'); if(!s)return null; const b=s.getBoundingClientRect();
    const el=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2); return s===el||s.contains(el);})()
}));
console.log('AGENTS', JSON.stringify(ag,null,1));
// collapse
await p.click('.orbit-close');
await p.waitForTimeout(700);
console.log('COLLAPSED', JSON.stringify(await p.evaluate(()=>{
  const st=document.querySelector('.orbit-stage'); const pr=st.querySelector('.orbit-panel').getBoundingClientRect();
  const dr=st.querySelector('.orbit-dial').getBoundingClientRect(), sr=st.getBoundingClientRect();
  return {open:st.dataset.orbitOpen, panelW:+pr.width.toFixed(2),
    dialCentreOffset:+(((dr.left+dr.width/2)-(sr.left+sr.width/2))).toFixed(2),
    gtc:getComputedStyle(st.querySelector('.orbit-layout')).gridTemplateColumns, gtr:getComputedStyle(st.querySelector('.orbit-layout')).gridTemplateRows, stageH:+sr.height.toFixed(1)};
})));
console.log('ERRORS', JSON.stringify(errs));
await b.close();
