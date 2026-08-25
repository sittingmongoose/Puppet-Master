import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await p.evaluate(()=>{window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');});
await p.waitForTimeout(900);
console.log('--- shorthand as parsed ---');
console.log(JSON.stringify(await p.evaluate(()=>{
  const q=s=>{const e=document.querySelector(s);if(!e)return null;const c=getComputedStyle(e);
    return {dur:c.animationDuration,delay:c.animationDelay,ease:c.animationTimingFunction.slice(0,26),fill:c.animationFillMode};};
  const m=document.querySelector('.goal-meter i');const mc=getComputedStyle(m);
  return {phase:q('.goal-phase'), replanMarker:q('.goal-replan-marker'),
    meter:{dur:mc.transitionDuration,delay:mc.transitionDelay}};
}),null,1));
// how long is a freshly mounted phase row invisible for?
await p.evaluate(()=>{document.querySelector('.activity-panel .goal-phase.blocked .goal-phase-row').click();});
const trace=[];
for(let i=0;i<14;i++){
  trace.push(await p.evaluate(()=>{const d=document.querySelector('.activity-panel .goal-phase.blocked .goal-phase-detail');
    return d?{t:Math.round(performance.now()),op:+getComputedStyle(d).opacity,clip:getComputedStyle(d).clipPath}:null;}));
  await p.waitForTimeout(60);
}
const t0=trace[0].t;
console.log('--- detail-open opacity trace (ms after click, opacity) ---');
console.log(trace.map(x=>`${x.t-t0}:${x.op}`).join('  '));
await b.close();
