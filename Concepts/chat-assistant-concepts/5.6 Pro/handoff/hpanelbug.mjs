import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
for (const [label,f] of [['NEGATIVE(no history module)','/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/nohistory.html'],
                          ['CURRENT','/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html']]){
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto(pathToFileURL(f).href,{waitUntil:'load'});
  await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
  await p.evaluate(()=>PM56_DEMO.setVariant(1,5)); await p.waitForTimeout(700);
  console.log(label, JSON.stringify(await p.evaluate(()=>{
    const host=document.querySelector('.history-panel')||document.querySelector('.history-flyout');
    if(!host) return 'no host';
    const kids=[...host.children].map(c=>({cls:c.className,r:Math.round(c.getBoundingClientRect().top)+'-'+Math.round(c.getBoundingClientRect().bottom)}));
    const sr=host.querySelector('.history-scroll'), se=host.querySelector('.history-search');
    let overlap=null;
    if(sr&&se){const a=se.getBoundingClientRect(),bb=sr.getBoundingClientRect();overlap=Math.round(a.bottom-bb.top);}
    const hr=host.getBoundingClientRect();
    const escapes = sr? Math.round(sr.getBoundingClientRect().bottom-hr.bottom):null;
    return {host:host.className, display:getComputedStyle(host).display, rows:getComputedStyle(host).gridTemplateRows, kids,
            searchOverlapsScrollBy:overlap, scrollBottomBeyondHostBy:escapes};
  })));
  await p.close();
}
await b.close();
