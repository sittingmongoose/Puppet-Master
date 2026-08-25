import { chromium } from 'playwright';
import path from 'path'; import { pathToFileURL } from 'url';
const ROOT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const browser=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const page=await browser.newPage({viewport:{width:900,height:900}});
await page.goto(pathToFileURL(path.join(ROOT,'index.html')).href,{waitUntil:'load'});
await page.waitForFunction(()=>window.__PM56_BOOT_OK===true);
const closed=await page.evaluate(()=>({bw:document.body.scrollWidth,cw:document.documentElement.clientWidth}));
await page.evaluate(()=>PM56_DEMO.openActivity('goal'));
await page.waitForTimeout(700);
const r=await page.evaluate(()=>{
  const panel=document.querySelector('.activity-panel');
  const p=panel.getBoundingClientRect();
  const esc=[...panel.querySelectorAll('*')].filter(el=>{
    if(el.classList.contains('panel-resize')||el.closest('.panel-resize'))return false;
    const b=el.getBoundingClientRect();
    return b.width>0 && (b.right>p.right+1.5 || b.left<p.left-1.5);
  }).map(el=>({sel:el.tagName+'.'+String(el.className).slice(0,45),l:Math.round(el.getBoundingClientRect().left),r:Math.round(el.getBoundingClientRect().right)}));
  const docOver=[...document.querySelectorAll('*')].filter(el=>{const b=el.getBoundingClientRect();return b.width>0&&b.right>innerWidth+0.5;}).map(el=>el.tagName+'.'+String(el.className).slice(0,40)).slice(0,8);
  return {bw:document.body.scrollWidth,cw:document.documentElement.clientWidth,panel:{l:Math.round(p.left),r:Math.round(p.right),w:Math.round(p.width)},esc:esc.slice(0,8),docOver};
});
// now disable my slot and compare
const stock=await page.evaluate(async ()=>{
  const saved=window.PM56_EXT._slots.activityPanelBody;
  window.PM56_EXT._slots.activityPanelBody=[];
  PM56_DEMO.setVariant(4,0);
  await new Promise(r=>setTimeout(r,500));
  const panel=document.querySelector('.activity-panel'); const p=panel.getBoundingClientRect();
  const esc=[...panel.querySelectorAll('*')].filter(el=>{
    if(el.classList.contains('panel-resize')||el.closest('.panel-resize'))return false;
    const b=el.getBoundingClientRect(); return b.width>0 && (b.right>p.right+1.5 || b.left<p.left-1.5);
  }).map(el=>el.tagName+'.'+String(el.className).slice(0,45));
  const out={bw:document.body.scrollWidth,cw:document.documentElement.clientWidth,esc:esc.slice(0,8),panelW:Math.round(p.width)};
  window.PM56_EXT._slots.activityPanelBody=saved; return out;
});
console.log(JSON.stringify({closed,mine:r,stock},null,1));
await browser.close();
