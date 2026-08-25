import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
const probe=()=>p.evaluate(()=>{
  const h=document.querySelector('.chat-header');
  const hr=h.getBoundingClientRect();
  return {bodyScrollW:document.body.scrollWidth, docScrollW:document.documentElement.scrollWidth,
    headerW:Math.round(hr.width), headerScrollW:h.scrollWidth,
    kids:[...h.children].map(c=>{const r=c.getBoundingClientRect();
      return c.tagName+'.'+String(c.className).split(' ')[0]+' w='+Math.round(r.width)+' right='+Math.round(r.right);}),
    overflowing:[...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+0.5;}).map(e=>e.tagName+'.'+String(e.className).split(' ')[0]).slice(0,8)};
});
console.log('--- panel CLOSED ---'); console.log(JSON.stringify(await probe(),null,1));
await p.evaluate(()=>{window.PM56_DEMO.pinActivity();window.PM56_DEMO.openActivity('goal');});
await p.waitForTimeout(500);
console.log('--- panel PINNED, chip present ---'); console.log(JSON.stringify(await probe(),null,1));
await p.evaluate(()=>{const s=document.createElement('style');s.id='hidechip';s.textContent='.goal-chip{display:none!important}';document.head.appendChild(s);});
await p.waitForTimeout(300);
console.log('--- panel PINNED, chip HIDDEN (is the overflow pre-existing?) ---'); console.log(JSON.stringify(await probe(),null,1));
await b.close();
