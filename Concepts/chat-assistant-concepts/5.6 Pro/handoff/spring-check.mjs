import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+':'+m.text())});p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.locator('[data-action="open-demo"]').first().click();
await p.locator('.demo-dialog').waitFor({state:'visible'});
const R={};
R.demoDialog=await p.evaluate(()=>{const cs=getComputedStyle(document.querySelector('.demo-dialog'));return {name:cs.animationName,duration:cs.animationDuration,delay:cs.animationDelay,fill:cs.animationFillMode};});
// does it actually finish inside its declared window? sample opacity over time
R.opacitySamples=await p.evaluate(()=>new Promise(res=>{
  const el=document.querySelector('.demo-dialog'); const out=[]; const t0=performance.now();
  const tick=()=>{const t=performance.now()-t0; out.push([Math.round(t),+getComputedStyle(el).opacity]); if(t<900) requestAnimationFrame(tick); else res(out.filter((_,i)=>i%8===0));};
  requestAnimationFrame(tick);
}));
// every animation shorthand in the doc: any with a non-zero delay it did not ask for?
R.suspectDelays=await p.evaluate(()=>{
  const seen={};
  for(const el of document.querySelectorAll('*')){
    const cs=getComputedStyle(el);
    if(cs.animationName==='none'||!cs.animationName) continue;
    const d=cs.animationDelay;
    if(d&&d!=='0s'){ const k=cs.animationName+' delay='+d+' dur='+cs.animationDuration; seen[k]=(seen[k]||0)+1; }
  }
  return seen;
});
R.errors=errs;
console.log(JSON.stringify(R,null,1));
await b.close();
