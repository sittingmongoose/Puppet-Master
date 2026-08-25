import { chromium } from 'playwright';
import path from 'path'; import { pathToFileURL } from 'url';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1600,height:980}});
await page.goto(pathToFileURL(path.join(ROOT,'index.html')).href,{waitUntil:'load'});
await page.waitForFunction(()=>window.__PM56_BOOT_OK===true);
const before=await page.evaluate(()=>({bw:document.body.scrollWidth,cw:document.documentElement.clientWidth}));
await page.evaluate(()=>PM56_DEMO.pinActivity());
await page.waitForTimeout(600);
const r=await page.evaluate(()=>{
  const out=[];
  document.querySelectorAll('*').forEach(el=>{
    const b=el.getBoundingClientRect();
    if(b.right>innerWidth+0.5 && b.width>0) out.push({sel:el.tagName+'.'+String(el.className).slice(0,50), right:Math.round(b.right), w:Math.round(b.width), left:Math.round(b.left)});
  });
  const grid=document.querySelector('.assistant-grid');
  return {bw:document.body.scrollWidth, cw:document.documentElement.clientWidth,
    gridCols:grid?getComputedStyle(grid).gridTemplateColumns:null,
    offenders: out.slice(0,12)};
});
console.log(JSON.stringify({before, after:r},null,1));
await browser.close();
