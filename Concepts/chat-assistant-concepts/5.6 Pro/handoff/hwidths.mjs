import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const FILE="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
for(const w of [1920,1440,1240,1100,980,760,430]){
  const p=await b.newPage({viewport:{width:w,height:900}});
  const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(pathToFileURL(FILE).href,{waitUntil:'load'});
  await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
  await p.evaluate(()=>PM56_DEMO.setVariant(1,5)); await p.waitForTimeout(700);
  const r=await p.evaluate(()=>{
    const f=document.querySelector('.history-flyout'), g=document.querySelector('.assistant-grid'),
          pane=document.querySelector('.assistant-pane'), tr=document.querySelector('.transcript');
    const cs=g?getComputedStyle(g):null;
    return {mode:document.body.dataset.phDrawer, drawerW:f?Math.round(f.getBoundingClientRect().width):null,
      paneW:pane?Math.round(pane.getBoundingClientRect().width):null,
      gutter:cs?Math.round(parseFloat(cs.paddingLeft)):null,
      transcriptW:tr?Math.round(tr.getBoundingClientRect().width):null,
      overflowX:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      drawerInside: f&&pane? (f.getBoundingClientRect().right<=pane.getBoundingClientRect().right+1):null};
  });
  // toggle closed and open again to prove it still works at this width
  await p.evaluate(()=>{document.querySelector('[data-action="toggle-history"]').click();});await p.waitForTimeout(500);
  const closed=await p.evaluate(()=>({mode:document.body.dataset.phDrawer,gutter:Math.round(parseFloat(getComputedStyle(document.querySelector('.assistant-grid')).paddingLeft))}));
  await p.evaluate(()=>{document.querySelector('[data-action="toggle-history"]').click();});await p.waitForTimeout(500);
  const reopened=await p.evaluate(()=>({mode:document.body.dataset.phDrawer,present:!!document.querySelector('.history-flyout')}));
  console.log(String(w).padStart(5), JSON.stringify(r), '| closed',JSON.stringify(closed), '| reopened',JSON.stringify(reopened), errs.length?('ERR '+errs[0]):'');
  await p.close();
}
await b.close();
