import path from 'path'; import {pathToFileURL} from 'url';
const {chromium}=await import('playwright');
const root='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
p.on('pageerror',e=>console.log('PAGEERR',String(e)));
await p.goto(pathToFileURL(path.join(root,'index.html')).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
console.log('slots registered for contextCompactMenu:', await p.evaluate(()=>window.PM56_EXT._slots.contextCompactMenu.length));
console.log('slots for contextDrawer:', await p.evaluate(()=>window.PM56_EXT._slots.contextDrawer.length));
await p.locator('.context-ring').click();
await p.waitForTimeout(300);
console.log(await p.evaluate(()=>{
  const pops=[...document.querySelectorAll('.ctx-pop')];
  return {menus:document.querySelectorAll('.overlay-menu').length, pops:pops.length,
    parents:pops.map(e=>e.parentElement.className+' | '+e.parentElement.parentElement.tagName+'.'+e.parentElement.parentElement.className)};
}));
await b.close();
