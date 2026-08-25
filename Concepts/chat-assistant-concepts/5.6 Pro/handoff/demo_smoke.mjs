import {chromium} from 'playwright';import {pathToFileURL} from 'url';
const T="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(''+e));
await p.goto(pathToFileURL(T).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
await p.evaluate(()=>document.querySelector('[data-action="open-demo"],[data-action="demo-studio"],[data-action="open-dialog"]')?.click()
  || [...document.querySelectorAll('button')].find(b=>/demo studio/i.test(b.textContent))?.click());
await p.waitForTimeout(600);
const g0=await p.evaluate(()=>{const d=document.querySelector('.demo-dialog');return d?d.getBoundingClientRect().toJSON():null;});
if(g0){
  const bar=await p.evaluate(()=>document.querySelector('.demo-dialog [data-dialog-drag]').getBoundingClientRect().toJSON());
  await p.mouse.move(bar.x+bar.width/2,bar.y+bar.height/2); await p.mouse.down();
  await p.mouse.move(bar.x+bar.width/2-140,bar.y+bar.height/2+90,{steps:8}); await p.mouse.up();
  await p.waitForTimeout(250);
  const g1=await p.evaluate(()=>document.querySelector('.demo-dialog').getBoundingClientRect().toJSON());
  const h=await p.evaluate(()=>document.querySelector('.demo-resize[data-dialog-resize="se"]').getBoundingClientRect().toJSON());
  await p.mouse.move(h.x+h.width/2,h.y+h.height/2); await p.mouse.down();
  await p.mouse.move(h.x-120,h.y-100,{steps:8}); await p.mouse.up(); await p.waitForTimeout(250);
  const g2=await p.evaluate(()=>document.querySelector('.demo-dialog').getBoundingClientRect().toJSON());
  const hit=await p.evaluate(()=>{const d=document.querySelector('.demo-dialog');const r=d.getBoundingClientRect();
    const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!(e&&d.contains(e));});
  console.log(JSON.stringify({moved:[g0.x,g0.y,'->',g1.x,g1.y],resized:[g1.width,g1.height,'->',g2.width,g2.height],hit},null,0));
} else console.log('demo dialog not opened');
// also: real resizer drag does not select text
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
const rz=await p.evaluate(()=>document.querySelector('.resizer').getBoundingClientRect().toJSON());
await p.mouse.move(rz.x+rz.width/2,rz.y+200); await p.mouse.down();
await p.mouse.move(rz.x+rz.width/2-120,rz.y+240,{steps:10});
const during=await p.evaluate(()=>({sel:String(window.getSelection()),bodySel:getComputedStyle(document.body).userSelect,cls:document.querySelector('.resizer').className}));
await p.mouse.up(); await p.waitForTimeout(200);
const after=await p.evaluate(()=>({editorW:getComputedStyle(document.documentElement).getPropertyValue('--editor-w'),bodySel:getComputedStyle(document.body).userSelect}));
console.log('resizerDrag', JSON.stringify({during,after}));
console.log('errs',errs.length,errs.slice(0,4));
await b.close();
