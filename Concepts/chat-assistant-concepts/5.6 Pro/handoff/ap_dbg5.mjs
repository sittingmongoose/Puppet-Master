import { chromium } from 'playwright';
import path from 'path'; import { pathToFileURL } from 'url';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1600,height:980}});
await page.goto(pathToFileURL(path.join(ROOT,'index.html')).href,{waitUntil:'load'});
await page.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await page.evaluate(()=>PM56_DEMO.pinActivity());
await page.evaluate(()=>PM56_DEMO.setVariant(4,3));
await page.waitForTimeout(250);
const r=await page.evaluate(()=>{
  const s=document.querySelector('.activity-scroll');
  const gs=[...document.querySelectorAll('.pmap-md-group')].map(g=>{const b=g.getBoundingClientRect();return {h:Math.round(b.height),top:Math.round(b.top),first:(g.textContent||'').trim().slice(0,40)};});
  const gb=document.querySelector('.pmap-md-list .goal-block');
  return {scroll:{h:Math.round(s.getBoundingClientRect().height), sh:s.scrollHeight, ch:s.clientHeight}, panelW:Math.round(document.querySelector('.activity-panel').getBoundingClientRect().width), gs, goalBlock: gb?{h:Math.round(gb.getBoundingClientRect().height), disp:getComputedStyle(gb).display}:null};
});
console.log(JSON.stringify(r,null,1));
await browser.close();
