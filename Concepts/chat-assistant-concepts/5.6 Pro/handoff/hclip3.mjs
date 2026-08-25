import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const FILE="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(FILE).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.waitForTimeout(700);
await p.evaluate(()=>{document.querySelector('[data-action="toggle-history"]').click();});
await p.waitForTimeout(700);
await p.evaluate(()=>{window.__tr=[];window.__t0=null;
  const step=()=>{ if(window.__t0==null){requestAnimationFrame(step);return;}
    const f=document.querySelector('.history-flyout');const pane=document.querySelector('.assistant-pane');
    if(f){const r=f.getBoundingClientRect();
      window.__tr.push({t:Math.round(performance.now()-window.__t0),x:Math.round(r.left),cp:getComputedStyle(f).clipPath,pl:Math.round(pane.getBoundingClientRect().left)});}
    if(performance.now()-window.__t0<500) requestAnimationFrame(step);};
  requestAnimationFrame(step);});
await p.evaluate(()=>{window.__t0=performance.now();document.querySelector('[data-action="toggle-history"]').click();});
await p.waitForTimeout(700);
const tr=await p.evaluate(()=>window.__tr);
for(const s of tr.slice(0,14)) console.log(s.t, 'x='+s.x, 'paneL='+s.pl, 'overhang='+(s.pl-s.x), s.cp);
await b.close();
