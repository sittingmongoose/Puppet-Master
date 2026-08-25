import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
for(const w of [1440,1100,900]){
  await p.setViewportSize({width:w,height:900});await p.waitForTimeout(300);
  console.log(w, JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('.chat-header > button, .chat-header > .context-ring')].map(e=>({a:e.dataset.action||e.className,w:+e.getBoundingClientRect().width.toFixed(1)})))));
}
await b.close();
