import { chromium } from 'playwright';
import path from 'path'; import { pathToFileURL } from 'url';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto(pathToFileURL(path.join(ROOT,'index.html')).href,{waitUntil:'load'});
await page.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await page.click('[data-hover-domain="todo"]');
await page.evaluate(()=>PM56_DEMO.setVariant(4,3));
await page.waitForTimeout(120);
const r=await page.evaluate(()=>{
  const p=document.querySelector('.activity-panel');
  return { panelKids:[...p.children].map(c=>c.className),
           scrollKids:[...p.querySelector('.activity-scroll').children].map(c=>c.className),
           mdKids: (()=>{const m=p.querySelector('.pmap-mdwrap'); return m?[...m.children].map(c=>c.className):null;})(),
           listKids: (()=>{const m=p.querySelector('.pmap-md-list'); return m?[...m.children].map(c=>c.className):null;})() };
});
console.log(JSON.stringify(r,null,1));
await browser.close();
