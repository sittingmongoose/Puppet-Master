/* Reproduce audit.mjs:59-64 exactly, with and without this module's slot. */
import { chromium } from 'playwright';
import path from 'path'; import { pathToFileURL } from 'url';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
async function run(disableSlot){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(pathToFileURL(path.join(ROOT,'index.html')).href,{waitUntil:'load'});
  await page.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
  if(disableSlot) await page.evaluate(()=>{window.PM56_EXT._slots.activityPanelBody=[];PM56_DEMO.setVariant(4,0);});
  const res=[];
  for(const domain of ['goal','todo','subagents','changes','artifacts']){
    try{
      await page.locator(`[data-hover-domain="${domain}"]`).click({timeout:8000});
      await page.locator('.activity-panel').waitFor({state:'visible',timeout:8000});
      const cats=await page.locator('.activity-section').count();
      if(cats!==5) throw new Error(`sections ${cats}`);
      for(const label of ['Goal','Todo','Subagents','Changes','Artifacts'])
        await page.locator('.activity-section-head').filter({hasText:label}).first().waitFor({timeout:8000});
      await page.locator('[data-action="close-activity"]').first().click({timeout:8000});
      res.push(`${domain}:OK`);
    }catch(e){ res.push(`${domain}:FAIL ${String(e.message).split('\n')[0].slice(0,90)}`); }
  }
  await page.close();
  return res;
}
console.log(JSON.stringify({withModule:await run(false), stockAccordion:await run(true)},null,1));
await browser.close();
