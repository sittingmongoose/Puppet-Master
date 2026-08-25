import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const FILE="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(FILE).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.waitForTimeout(800);
// how expensive is one renderApp / renderOverlays?
console.log('cost', await p.evaluate(()=>{
  const ctx=window.PM56_EXT.ctx();
  const a=[],o=[];
  for(let i=0;i<5;i++){const t=performance.now();ctx.renderApp();a.push(Math.round(performance.now()-t));}
  for(let i=0;i<5;i++){const t=performance.now();ctx.renderOverlays();o.push(Math.round(performance.now()-t));}
  return {renderApp:a, renderOverlays:o};
}));
// in-page rAF trace of the open
async function trace(label, action){
  await p.evaluate(()=>{window.__tr=[];window.__t0=null;
    const step=()=>{ if(window.__t0==null){requestAnimationFrame(step);return;}
      const f=document.querySelector('.history-flyout');
      const g=document.querySelector('.assistant-grid');
      window.__tr.push({t:Math.round(performance.now()-window.__t0),
        x:f?Math.round(f.getBoundingClientRect().left):null,
        w:f?Math.round(f.getBoundingClientRect().width):null,
        gp:g?Math.round(parseFloat(getComputedStyle(g).paddingLeft)):null});
      if(performance.now()-window.__t0<800) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  await p.evaluate(sel=>{window.__t0=performance.now();
    window.__marks=[];
    var el=document.querySelector(sel);
    window.__marks.push(['click-dispatch',Math.round(performance.now()-window.__t0)]);
    el.click();
    window.__marks.push(['handler-returned',Math.round(performance.now()-window.__t0)]);
    window.__marks.push(['node',!!document.querySelector('.history-flyout')]);
  }, action);
  await p.waitForTimeout(950);
  const tr=await p.evaluate(()=>window.__tr);
  const mk=await p.evaluate(()=>window.__marks);
  console.log(label, JSON.stringify(mk), JSON.stringify(tr.filter((s,i)=>i<22)));
}
await p.locator('[data-action="toggle-history"]').first().click(); await p.waitForTimeout(700);
await trace('OPEN ', '[data-action="toggle-history"]');
await p.waitForTimeout(500);
await trace('PIN  ', '[data-action="ph-toggle-pin"]');
await p.waitForTimeout(500);
await trace('CLOSE', '[data-action="toggle-history"]');
await b.close();
