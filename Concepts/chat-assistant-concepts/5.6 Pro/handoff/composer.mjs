import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
const measure=()=>p.evaluate(()=>({
  tools:document.querySelector('.composer-tools').getBoundingClientRect().width,
  sel:[...document.querySelectorAll('.selector-button')].map(e=>({t:e.textContent.trim().slice(0,12),w:+e.getBoundingClientRect().width.toFixed(1)})),
  overflowInTools:document.querySelector('.composer-tools').scrollWidth-document.querySelector('.composer-tools').clientWidth
}));
console.log('BEFORE send', JSON.stringify(await measure()));
await p.evaluate(()=>{const t=document.querySelector('[data-input="composer"]');t.value='x';t.dispatchEvent(new Event('input',{bubbles:true}));});
await p.locator('[data-action="send"]').click(); await p.waitForTimeout(400);
console.log('AFTER send ', JSON.stringify(await measure()));
await b.close();
