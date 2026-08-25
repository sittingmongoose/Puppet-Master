import path from 'path'; import {pathToFileURL} from 'url';
const {chromium}=await import('playwright');
const root='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:430,height:900}});
p.on('pageerror',e=>console.log('PAGEERR',String(e)));
await p.goto(pathToFileURL(path.join(root,'tests/_wave3/nocontext.html')).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
for (const w of [430,1024]){
  await p.setViewportSize({width:w,height:900});
  await p.waitForTimeout(150);
  const r=await p.evaluate(()=>{
    const cw=document.documentElement.clientWidth;
    const out=[];
    document.querySelectorAll('*').forEach(el=>{
      const b=el.getBoundingClientRect();
      if(b.width>0 && b.right>cw+1) out.push({t:el.tagName,c:el.className&&el.className.toString().slice(0,60),right:Math.round(b.right),w:Math.round(b.width)});
    });
    return {cw, bw:document.body.scrollWidth, sw:document.documentElement.scrollWidth, out:out.slice(0,14)};
  });
  console.log(w, JSON.stringify(r,null,1));
}
await b.close();
