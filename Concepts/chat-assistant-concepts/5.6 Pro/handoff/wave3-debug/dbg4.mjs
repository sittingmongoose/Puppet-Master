import path from 'path'; import {pathToFileURL} from 'url';
const {chromium}=await import('playwright');
const root='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
for (const file of ['index.html','tests/_wave3/nocontext.html']){
  const p=await b.newPage({viewport:{width:390,height:900}});
  await p.goto(pathToFileURL(path.join(root,file)).href,{waitUntil:'load'});
  await p.waitForFunction(()=>window.__PM56_BOOT_OK===true);
  await p.evaluate(()=>window.PM56_DEMO.openContext());
  await p.locator('.drawer').first().waitFor({state:'visible'});
  console.log(file, await p.evaluate(()=>{
    const d=document.querySelector('.drawer'); const r=d.getBoundingClientRect(); const cs=getComputedStyle(d);
    return {innerWidth:innerWidth, clientWidth:document.documentElement.clientWidth,
      left:r.left,right:r.right,width:r.width, cssRight:cs.right, cssWidth:cs.width, cssLeft:cs.left,
      pos:cs.position, offsetParent:d.offsetParent?d.offsetParent.id||d.offsetParent.className:null,
      overlayRoot:(()=>{const o=document.getElementById('pmOverlayRoot');const rr=o.getBoundingClientRect();return {l:rr.left,r:rr.right,w:rr.width,t:getComputedStyle(o).transform};})()};
  }));
  await p.close();
}
await b.close();
