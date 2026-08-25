import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERROR '+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load',timeout:20000});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO,{timeout:10000});
await p.locator('[data-action="open-demo"]').first().click();
await p.locator('.demo-dialog').waitFor({state:'visible'});
await p.waitForTimeout(500);
const g0=await p.evaluate(()=>PM56_DEMO.getState().dialog.geom);
// pixel proof the dialog head is actually painted where we think: elementFromPoint at head centre
const headHit=await p.evaluate(()=>{const h=document.querySelector('.demo-dialog .drawer-head[data-dialog-drag]');const r=h.getBoundingClientRect();const el=document.elementFromPoint(r.left+40,r.top+r.height/2);return {cls:el&&el.className&&String(el.className),inHead:!!(el&&el.closest('[data-dialog-drag]'))};});
// DRAG: pointer down on head (avoid buttons), move, up
const hb=await p.evaluate(()=>{const r=document.querySelector('.demo-dialog .drawer-head').getBoundingClientRect();return {x:r.left+r.width*0.45,y:r.top+r.height/2};});
await p.mouse.move(hb.x,hb.y); await p.mouse.down(); await p.mouse.move(hb.x-140,hb.y+90,{steps:12}); await p.mouse.up();
await p.waitForTimeout(150);
const g1=await p.evaluate(()=>PM56_DEMO.getState().dialog.geom);
// RESIZE from the se handle
const se=await p.evaluate(()=>{const r=document.querySelector('.demo-resize[data-dialog-resize="se"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
await p.mouse.move(se.x,se.y); await p.mouse.down(); await p.mouse.move(se.x-120,se.y-100,{steps:12}); await p.mouse.up();
await p.waitForTimeout(150);
const g2=await p.evaluate(()=>PM56_DEMO.getState().dialog.geom);
// pixel proof: sample a colour inside the dialog body vs outside it after the move
const shotBox=await p.evaluate(()=>{const r=document.querySelector('.demo-dialog').getBoundingClientRect();return {x:Math.round(r.left+8),y:Math.round(r.top+8),width:20,height:20};});
await p.screenshot({path:'/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/waves/demo-dialog.png'});
const insideHit=await p.evaluate(()=>{const r=document.querySelector('.demo-dialog').getBoundingClientRect();const el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!(el&&el.closest('.demo-dialog'));});
console.log(JSON.stringify({headHit,g0,g1,g2,moved:(g1.left!==g0.left&&g1.top!==g0.top),resized:(g2.width!==g1.width&&g2.height!==g1.height),insideHit,errs},null,1));
await b.close();
