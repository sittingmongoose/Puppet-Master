// Native outer face stays at the target while content lifts inside it. Film before/after and edge activation.
// FO-85: the target is measured once the screen has settled, by the owner's own signal: the incoming layer keeps
// o55-entering (and o55-hold) until O55.motion.settled says every entrance animation finished (60-ui-core.js
// transition), and the outgoing layer is gone. Measured earlier, a staggered tile can still be in the last
// sub-pixel of its entrance (the VM flake: b.y 458.18 against a resting 457.78). --set settle=0 keeps the old
// fixed waits (the control); --set look=, motion=, screen= pick cells (comma lists); --set trace=1 logs the target's
// box on every frame from the screen change until 1 s after it settled, and when it last moved.
// --set cpu=<rate> slows the page's main thread (CDP Emulation.setCPUThrottlingRate) to stand in for a loaded machine.
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});await f.waitForFunction(()=>O55.S?.open);
 let cdp=null;if(t.args.cpu){cdp=await t.page.context().newCDPSession(t.page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:Number(t.args.cpu)});}
 try{
 const pick=(arg,all)=>t.args[arg]?String(t.args[arg]).split(','):all;
 const SETTLED=()=>{const r=document.getElementById('pm-o55-onboarding'),l=r&&r.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
  return !!l&&!l.classList.contains('o55-entering')&&!l.classList.contains('o55-hold')&&!r.classList.contains('o55-hold')&&!r.querySelector('.o55-pane > .o55-layer.o55-out');};
 const settle=async name=>{if(t.args.settle==='0')return;
  const ok=await f.waitForFunction(SETTLED,null,{timeout:10000}).then(()=>true,()=>false);
  await t.check(name+' screen settled (owner signal)',ok,'',{hard:true});};
 for(const look of pick('look',['basic-light','glass-light'])) for(const motion of pick('motion',['no-preference','reduce','attribute'])) {
  await t.emulate({reducedMotion:motion==='attribute'?'no-preference':motion});
  await f.evaluate(([look,m])=>{document.documentElement.setAttribute('data-motion',m==='attribute'?'reduced':'full');O55.ui.applyLook(...look.split('-'));},[look,motion]);await f.waitForTimeout(1500);
  for(const screen of pick('screen',['where','look'])) {
   await f.evaluate(s=>O55.ui.go(s,{noHistory:true}),screen);await f.waitForTimeout(1600);
   for(let repeat=0;repeat<2;repeat++) {
    const name=`${look} ${motion} ${screen} ${repeat}`,sel='.o55-pane > .o55-layer:not(.o55-out) '+(screen==='where'?'.o55-card[data-arg="server"]':'.o55-tile[data-arg="friendly"]');
    if(t.args.trace)await f.evaluate(sel=>{const t0=performance.now(),out=window.__fo85=[],first=document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)');let tail=null;const tick=()=>{const r=document.getElementById('pm-o55-onboarding'),l=r.querySelector('.o55-pane > .o55-layer:not(.o55-out)'),e=l&&l!==first?l.querySelector(sel.split(' ').pop()):null,b=e&&e.getBoundingClientRect();
     const settled=!!l&&l!==first&&!l.classList.contains('o55-entering')&&!l.classList.contains('o55-hold')&&!r.querySelector('.o55-pane > .o55-layer.o55-out');
     const layers=[...r.querySelectorAll('.o55-pane > .o55-layer')].map(x=>(x.dataset.screen||'?')+':'+[...x.classList].filter(c=>c!=='o55-layer').join('.')).join(' | ');
     out.push({t:Math.round(performance.now()-t0),y:b?+b.y.toFixed(3):null,h:b?+b.height.toFixed(3):null,w:b?+b.width.toFixed(3):null,settled,...(out.length&&out[out.length-1].layersAt===layers?{}:{layers}),layersAt:layers});
     if(settled&&tail===null)tail=performance.now();if(tail===null||performance.now()-tail<1000)requestAnimationFrame(tick);};requestAnimationFrame(tick);},sel);
    await t.mark(name+' go');
    await f.evaluate(([look,screen])=>{O55.ui.applyLook(...look.split('-'));O55.ui.go(screen,{noHistory:true});},[look,screen]);
    if(t.args.settle==='0')await f.waitForTimeout(1600);
    await settle(name);
    await t.page.mouse.move(2,2);await f.waitForTimeout(500);
    const c=f.locator(sel);
    const b=await c.boundingBox();
    await t.mark(name+' measured');
    await t.mark(name+' before');await f.waitForTimeout(1000);
    await t.page.mouse.move(b.x+b.width/2,b.y+b.height-.5);await f.waitForTimeout(600);await t.mark(name+' hover');await f.waitForTimeout(1000);
    const r=await c.evaluate(e=>{const s=getComputedStyle(e),p=getComputedStyle(e,'::before');window.__edgeClicked=false;document.addEventListener('click',ev=>{window.__edgeClicked=e===ev.target||e.contains(ev.target);},{once:true,capture:true});return {bg:s.backgroundColor,border:s.borderBottomColor,y:e.getBoundingClientRect().y,child:e.firstElementChild.getBoundingClientRect().y,paint:s.getPropertyValue('--o55-hover-y'),pseudo:p.translate};});
    await t.check(name+' painted native face',r.bg!=='rgba(0, 0, 0, 0)'&&r.border!=='rgba(0, 0, 0, 0)'&&Math.abs(r.y-b.y)<.01,JSON.stringify({b,r}));
    await t.check(name+' reduced displacement',motion==='no-preference'||parseFloat(r.paint)===0,JSON.stringify(r));
    // At the exact strip rejected by review: 0.5 px inside the resting bottom boundary.
    await t.page.mouse.click(b.x+b.width/2,b.y+b.height-.5);await f.waitForTimeout(300);
    await t.check(name+' native edge activates',await f.evaluate(()=>window.__edgeClicked));
    const trace=t.args.trace?await f.evaluate(()=>window.__fo85):undefined;
    if(trace){const st=trace.find(x=>x.settled),last=trace.filter(x=>x.y!==null),fin=last[last.length-1],moved=last.filter(x=>Math.abs(x.y-fin.y)>.001||Math.abs(x.h-fin.h)>.001);
     t.log(JSON.stringify({name,fo85:{settledAt:st?.t,lastMoveAt:moved.length?moved[moved.length-1].t:null,movedAfterSettled:st?moved.filter(x=>x.t>st.t).length:null,final:fin,measured:b}}));}
    t.log(JSON.stringify({name,box:b,state:r,trace}));await t.mark(name+' clicked');
   }
  }
 }
 }finally{if(cdp){await cdp.send('Emulation.setCPUThrottlingRate',{rate:1}).catch(()=>{});await cdp.detach().catch(()=>{});}}
}
