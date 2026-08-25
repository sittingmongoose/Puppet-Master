import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const T="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:560,height:900}});
await p.goto(pathToFileURL(T).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
for(const w of [590,560,480,390]){
  await p.setViewportSize({width:w,height:900}); await p.waitForTimeout(200);
  const out={};
  for(let v=0;v<8;v++){ await p.evaluate(v=>{window.PM56_DEMO.setVariant(6,v);window.PM56_DEMO.openQuestionnaire();},v); await p.waitForTimeout(100);
    out[v]=await p.evaluate(()=>{const e=document.querySelector('.decision-evidence');return e?getComputedStyle(e).display:'-';}); }
  console.log(w, JSON.stringify(out));
}
await b.close();
