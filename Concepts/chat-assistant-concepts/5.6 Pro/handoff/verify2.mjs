import {chromium} from 'playwright';
import {pathToFileURL} from 'url';
import fs from 'fs';
const OUT='/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/handoff/w6/waves/shots';
fs.mkdirSync(OUT,{recursive:true});
const target="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errs=[];p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text())});p.on('pageerror',e=>errs.push('PAGEERROR '+e));
await p.goto(pathToFileURL(target).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
const R={};

/* Real painted-pixel read: screenshot a crop, hand the PNG back to the page as
   a data URL, draw it on a canvas and read getImageData. Not a bounding box. */
async function cropStats(clip,name){
  const buf=await p.screenshot({clip});
  fs.writeFileSync(`${OUT}/${name}.png`,buf);
  const dataUrl='data:image/png;base64,'+buf.toString('base64');
  return p.evaluate(async (u)=>{
    const img=new Image(); img.src=u; await img.decode();
    const c=document.createElement('canvas'); c.width=img.width; c.height=img.height;
    const g=c.getContext('2d'); g.drawImage(img,0,0);
    const d=g.getImageData(0,0,c.width,c.height).data;
    const seen=new Map(); let sum=0;
    for(let i=0;i<d.length;i+=4){ const k=`${d[i]},${d[i+1]},${d[i+2]}`; seen.set(k,(seen.get(k)||0)+1); sum+=(d[i]+d[i+1]+d[i+2])/3; }
    const top=[...seen.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3);
    return {w:c.width,h:c.height,distinctColours:seen.size,meanLuma:Math.round(sum/(d.length/4)),top};
  },dataUrl);
}
const box=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height};},sel);

// ---- New-thread button in BOTH history modes, pixel-verified ----
R.newThread={};
for(const mode of ['pinned','floating']){
  if(mode==='floating'){
    if((await p.evaluate(()=>PM56_DEMO.getState().historyMode))!=='pinned'){await p.locator('[data-action="toggle-history"]').first().click();await p.waitForTimeout(250);}
    await p.locator('[data-action="unpin-history"]').first().click(); await p.waitForTimeout(400);
  }
  const live=await p.evaluate(()=>PM56_DEMO.getState().historyMode);
  const bx=await box('.chat-header [data-action="new-thread"]');
  const hit=await p.evaluate(()=>{const e=document.querySelector('.chat-header [data-action="new-thread"]');const r=e.getBoundingClientRect();const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {isSelf:!!(t&&e.contains(t)),tag:t&&t.tagName};});
  const pix=await cropStats({x:Math.round(bx.x),y:Math.round(bx.y),width:Math.round(bx.width),height:Math.round(bx.height)},`newthread-${mode}`);
  const before=await p.evaluate(()=>PM56_DEMO.getState().threads.length);
  await p.locator('.chat-header [data-action="new-thread"]').click(); await p.waitForTimeout(350);
  const after=await p.evaluate(()=>PM56_DEMO.getState().threads.length);
  R.newThread[mode]={historyMode:live,box:bx,hit,pixels:pix,created:after>before};
}
await p.evaluate(()=>PM56_DEMO.selectThread('query'));
// restore pinned history
if((await p.evaluate(()=>PM56_DEMO.getState().historyMode))!=='pinned'){await p.locator('[data-action="pin-history"]').first().click();await p.waitForTimeout(300);}

// ---- model menu: painted rows + real scroll, at stock fixture size ----
await p.locator('[data-action="open-menu"][data-menu="model"]').click(); await p.waitForTimeout(400);
const mb=await box('.model-menu');
R.modelMenu={rowsPainted:await p.evaluate(()=>{const s=document.querySelector('.model-scroll');const sr=s.getBoundingClientRect();let n=0;for(const r of document.querySelectorAll('.model-row')){const rr=r.getBoundingClientRect();const cy=rr.top+rr.height/2;if(cy<sr.top||cy>sr.bottom)continue;const t=document.elementFromPoint(rr.left+rr.width/2,cy);if(t&&r.contains(t))n++;}return n;}),
  pixels:await cropStats({x:Math.round(mb.x),y:Math.round(mb.y),width:Math.round(mb.width),height:Math.round(mb.height)},'model-menu')};
await p.keyboard.press('Escape'); await p.waitForTimeout(200);

// ---- orbit node is hit-testable despite .orbit-ring{pointer-events:none} ----
await p.evaluate(()=>{PM56_DEMO.setVariant(2,1);PM56_DEMO.setWorkStep(4);});
await p.waitForTimeout(500);
R.orbit=await p.evaluate(()=>{
  const n=document.querySelector('.orbit-node'); if(!n) return {found:false};
  const r=n.getBoundingClientRect();
  const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {found:true,ringPE:getComputedStyle(document.querySelector('.orbit-ring')).pointerEvents,nodePE:getComputedStyle(n).pointerEvents,isSelf:!!(t&&n.contains(t)),hasAction:n.dataset.action,k:n.dataset.k};
});
if(R.orbit.isSelf){
  const before=await p.evaluate(()=>PM56_DEMO.getState().work.step);
  await p.evaluate(()=>{const ns=[...document.querySelectorAll('.orbit-node')];ns[ns.length-1].click();});
  await p.waitForTimeout(300);
  R.orbit.stepChanged=(await p.evaluate(()=>PM56_DEMO.getState().work.step))!==before;
}
// orbit stage survives completion (CHROME_OPTS[1].keepBody)
await p.evaluate(()=>PM56_DEMO.completeWorking()); await p.waitForTimeout(500);
R.orbit.stageAfterComplete=await p.evaluate(()=>!!document.querySelector('.orbit-stage'));
await p.screenshot({path:`${OUT}/orbit.png`});
await p.evaluate(()=>{PM56_DEMO.setVariant(2,0);PM56_DEMO.resetWorking();});

// ---- 15d: clipboard + dismiss-event actually mutate ----
await p.context().grantPermissions(['clipboard-read','clipboard-write']).catch(()=>{});
await p.evaluate(()=>PM56_DEMO.selectThread('plain')); await p.waitForTimeout(300);
await p.locator('.message-assistant').first().hover(); await p.waitForTimeout(250);
await p.locator('.message-assistant [data-action="copy-message"]').first().click(); await p.waitForTimeout(400);
R.clipboard=await p.evaluate(async()=>{try{return {text:(await navigator.clipboard.readText()).slice(0,60)};}catch(e){return {err:String(e).slice(0,80)};}});
await p.evaluate(()=>PM56_DEMO.trigger('BSD intervention')); await p.waitForTimeout(500);
R.dismiss=await p.evaluate(()=>{
  const t=PM56_DEMO.getState().threads.find(x=>x.id==='bsd');
  const before=t.messages.length;
  const btn=document.querySelector('[data-action="dismiss-event"]');
  if(!btn) return {noButton:true,before};
  btn.click();
  const after=PM56_DEMO.getState().threads.find(x=>x.id==='bsd').messages.length;
  return {before,after,removed:after<before};
});

// ---- 15e: three BSD triggers now land on three different states ----
const snap=async n=>{await p.evaluate(x=>PM56_DEMO.trigger(x),n);await p.waitForTimeout(400);return p.evaluate(()=>{const s=PM56_DEMO.getState();const t=s.threads.find(x=>x.id===s.selectedThread);const last=t.messages[t.messages.length-1];return {thread:s.selectedThread,dialog:s.dialog?.type||null,lastType:last?.type||null,lastTitle:(last?.title||'').slice(0,44)};});};
R.bsd={intervention:await snap('BSD intervention')};
await p.keyboard.press('Escape');
R.bsd.silent=await snap('BSD silent check');
R.bsd.timeout=await snap('BSD timeout');
R.ctx={focus:await snap('Context Focus'),mute:await snap('Context Mute')};
R.ctx.subcompact=await snap('Subcompact preview'); await p.keyboard.press('Escape');

R.errors=errs;
console.log(JSON.stringify(R,null,1));
await b.close();
