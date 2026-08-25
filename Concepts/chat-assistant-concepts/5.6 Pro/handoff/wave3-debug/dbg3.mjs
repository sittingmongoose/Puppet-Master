import path from 'path'; import {pathToFileURL} from 'url';
const {chromium}=await import('playwright');
const root='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(path.join(root,'index.html')).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
const chain=el=>{let s=[],n=el;while(n&&n!==document.documentElement){s.unshift(n.tagName+(n.id?'#'+n.id:'')+'.'+String(n.className||'').trim().split(/\s+/).join('.'));n=n.parentElement;}return s.join(' > ');};
await p.locator('.context-ring').click(); await p.waitForTimeout(200);
await p.evaluate(()=>{document.body.click();}); await p.waitForTimeout(250);
console.log(await p.evaluate((f)=>{const chain=new Function('el',f);
 return [...document.querySelectorAll('.overlay-menu,.ctx-pop')].map(e=>chain(e));},
 `let s=[],n=el;while(n&&n!==document.documentElement){s.unshift(n.tagName+(n.id?'#'+n.id:'')+'.'+String(n.className||'').trim().split(/\\s+/).join('.'));n=n.parentElement;}return s.join(' > ');`));
await p.waitForTimeout(2500);
console.log('after tick', await p.evaluate(()=>({menus:document.querySelectorAll('.overlay-menu').length,pops:document.querySelectorAll('.ctx-pop').length})));
await b.close();
