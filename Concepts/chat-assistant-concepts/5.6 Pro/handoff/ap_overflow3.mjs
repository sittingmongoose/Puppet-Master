import { chromium } from 'playwright';
import path from 'path'; import { pathToFileURL } from 'url';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1600,height:980}});
await page.goto(pathToFileURL(path.join(ROOT,'index.html')).href,{waitUntil:'load'});
await page.waitForFunction(()=>window.__PM56_BOOT_OK===true);
const r=await page.evaluate(async ()=>{
  const m=()=>({bw:document.body.scrollWidth,cw:document.documentElement.clientWidth,
    cols:getComputedStyle(document.querySelector('.assistant-grid')||document.body).gridTemplateColumns});
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  PM56_DEMO.pinActivity(); await wait(400);
  const withModule=m();
  // disable this module's slot entirely -> app.js's stock accordion renders instead
  const saved=window.PM56_EXT._slots.activityPanelBody;
  window.PM56_EXT._slots.activityPanelBody=[];
  PM56_DEMO.setVariant(4,0); await wait(400);
  const stock=m();
  window.PM56_EXT._slots.activityPanelBody=saved;
  // and with no activity panel at all
  PM56_DEMO.openActivity('goal');
  document.querySelector('[data-action="close-activity"]').click(); await wait(400);
  const closed=m();
  return {withModule, stock, closed};
});
console.log(JSON.stringify(r,null,1));
await browser.close();
