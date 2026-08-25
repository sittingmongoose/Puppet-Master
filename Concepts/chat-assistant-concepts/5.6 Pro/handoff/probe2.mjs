import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+':'+m.text())});p.on('pageerror',e=>errs.push('PE '+e));
await p.goto(pathToFileURL("/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html").href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
const r=await p.evaluate(()=>{
  const btn=document.createElement('button');
  btn.setAttribute('data-action','pause-goal'); btn.textContent='x';
  document.body.appendChild(btn); btn.click(); btn.remove();
  return {override:!!window.__EXT_GOAL_OVERRIDE};
});
console.log(JSON.stringify({...r,errs}));
await b.close();
