import { chromium } from 'playwright';
import path from 'path'; import { pathToFileURL } from 'url';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto(pathToFileURL(path.join(ROOT,'index.html')).href,{waitUntil:'load'});
await page.waitForFunction(()=>window.__PM56_BOOT_OK===true);
const r=await page.evaluate(()=>{
  const ctx=window.PM56_EXT.ctx({});
  const count=(h,t)=>((h.match(new RegExp('<'+t+'[\\s>]','g'))||[]).length)+'/'+((h.match(new RegExp('</'+t+'>','g'))||[]).length);
  const goal=window.PM56_EXT._slots.goalSection.map(f=>f(ctx)).join('');
  const body=window.PM56_EXT._slots.activityPanelBody.map(f=>f(ctx)).join('');
  return { goalLen:goal.length, goalDiv:count(goal,'div'), goalSpan:count(goal,'span'), goalBtn:count(goal,'button'), goalSec:count(goal,'section'),
           bodyLen:body.length, bodyDiv:count(body,'div'), bodyTail:body.slice(-260), goalTail:goal.slice(-260) };
});
console.log(JSON.stringify(r,null,1));
await browser.close();
