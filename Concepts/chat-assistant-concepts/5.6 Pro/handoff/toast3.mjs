import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const T="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto(pathToFileURL(T).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.waitForTimeout(500);
console.log(await p.evaluate(async()=>{
  const t0=performance.now();
  document.querySelector('[data-action="copy-message"]').click();
  const s=[];
  await new Promise(r=>{const iv=setInterval(()=>{const n=document.querySelector('.toast');
    s.push([Math.round(performance.now()-t0), n?+Number(getComputedStyle(n).opacity).toFixed(3):'GONE',
            n?getComputedStyle(n).animationName:'-']);
    if(performance.now()-t0>3000){clearInterval(iv);r();}},100);});
  return s.map(x=>x.join(' ')).join('\n');
}));
await b.close();
