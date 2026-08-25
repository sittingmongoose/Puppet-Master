import { chromium } from 'playwright';
import path from 'path'; import { pathToFileURL } from 'url';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1600,height:980}});
await page.goto(pathToFileURL(path.join(ROOT,'index.html')).href,{waitUntil:'load'});
await page.waitForFunction(()=>window.__PM56_BOOT_OK===true);
await page.evaluate(()=>PM56_DEMO.pinActivity());
await page.evaluate(()=>PM56_DEMO.setVariant(4,0));
await page.waitForTimeout(900);
console.log(JSON.stringify(await page.evaluate(()=>({
  ids: PM56_DATA.subagents.map(a=>a.id),
  expanded: PM56_DEMO.getState().activity.expanded,
  scope: PM56_DEMO.getState().activity.scope,
  domain: PM56_DEMO.getState().activity.domain,
  sections: [...document.querySelectorAll('.activity-section')].map(s=>s.dataset.domainSection),
  openAgents: [...document.querySelectorAll('.activity-scroll [data-action="open-agent"]')].map(b=>b.dataset.id).slice(0,20),
  openChanges: [...document.querySelectorAll('.activity-scroll [data-action="open-change"]')].length,
  openTodos: [...document.querySelectorAll('.activity-scroll [data-action="open-todo"]')].length
})),null,1));
await browser.close();
