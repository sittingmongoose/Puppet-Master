import {chromium} from 'playwright';import {pathToFileURL} from 'url';import fs from 'fs';
const T="/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html";
const b=await chromium.launch({headless:true,args:['--disable-gpu','--allow-file-access-from-files','--no-sandbox']});
const p=await b.newPage({viewport:{width:1440,height:220}});
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(''+e));
await p.goto(pathToFileURL(T).href,{waitUntil:'load'});
await p.waitForFunction(()=>window.__PM56_BOOT_OK===true&&window.PM56_DEMO);
const R={};
// --- painted-pixel reader
async function paint(x,y,w,h){
  const buf=await p.screenshot({clip:{x:Math.max(0,Math.round(x)),y:Math.max(0,Math.round(y)),width:Math.max(1,Math.round(w)),height:Math.max(1,Math.round(h))}});
  return p.evaluate(async u=>{const img=new Image();img.src=u;await img.decode();
    const c=document.createElement('canvas');c.width=img.width;c.height=img.height;
    const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);
    const d=g.getImageData(0,0,c.width,c.height).data;const set=new Set();let s=0;
    for(let i=0;i<d.length;i+=4){set.add(d[i]+','+d[i+1]+','+d[i+2]);s+=d[i]+d[i+1]+d[i+2];}
    return {colours:set.size,mean:+(s/(d.length/4*3)).toFixed(2)};},'data:image/png;base64,'+buf.toString('base64'));
}
// ===== over-long menu that really scrolls, last row proven by hit-test + pixels
await p.evaluate(()=>document.querySelector('[data-action="open-menu"][data-menu="persona"]').click());
await p.waitForTimeout(320);
R.menu=await p.evaluate(()=>{const m=document.querySelector('[data-overlay="root-menu"]');
  const r=m.getBoundingClientRect(),cs=getComputedStyle(m);
  return {top:+r.top.toFixed(1),bottom:+r.bottom.toFixed(1),vh:innerHeight,inViewport:r.top>=-0.5&&r.bottom<=innerHeight+0.5,
    maxH:cs.maxHeight,overflowY:cs.overflowY,overscroll:cs.overscrollBehaviorY,
    clientH:m.clientHeight,scrollH:m.scrollHeight};});
// scroll to the bottom, then prove the last row is the painted element at its own centre
R.menuScroll=await p.evaluate(async()=>{const m=document.querySelector('[data-overlay="root-menu"]');
  const before=m.scrollTop; m.scrollTop=99999; await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const after=m.scrollTop;
  const rows=[...m.querySelectorAll('.menu-item,button')]; const last=rows[rows.length-1];
  const lr=last.getBoundingClientRect();
  const hit=document.elementFromPoint(lr.left+lr.width/2,lr.top+lr.height/2);
  return {before,after,didScroll:after>before,rows:rows.length,
    lastText:(last.textContent||'').trim().slice(0,30),
    lastRect:{top:+lr.top.toFixed(1),bottom:+lr.bottom.toFixed(1)},
    lastInViewport:lr.top>=0&&lr.bottom<=innerHeight+0.5,
    lastIsPaintedElement:!!(hit&&(hit===last||last.contains(hit)))};});
{const lr=await p.evaluate(()=>{const m=document.querySelector('[data-overlay="root-menu"]');const rows=[...m.querySelectorAll('.menu-item,button')];const l=rows[rows.length-1].getBoundingClientRect();return{x:l.x,y:l.y,w:l.width,h:l.height};});
 R.menuLastRowPixels=await paint(lr.x,lr.y,lr.w,lr.h);}
await p.evaluate(()=>document.body.click());
// ===== toast: five consecutive toasts, each must fade
await p.setViewportSize({width:1440,height:900}); await p.waitForTimeout(400);
R.toasts=[];
for(let i=0;i<4;i++){
  const res=await p.evaluate(async()=>{
    const t0=performance.now();
    window.PM56_DEMO.trigger; // no-op
    const btn=document.querySelector('[data-action="copy-message"]');
    if(btn) btn.click(); else return {no:true};
    const s=[]; let ids=new Set();
    await new Promise(r=>{const iv=setInterval(()=>{const n=document.querySelector('.toast');
      if(n){ids.add(n);}
      s.push({t:Math.round(performance.now()-t0),op:n?+Number(getComputedStyle(n).opacity).toFixed(3):null});
      if(performance.now()-t0>3300){clearInterval(iv);r();}},60);});
    const mid=s.filter(x=>x.op!==null&&x.op>0.02&&x.op<0.98);
    const lastPresent=Math.max(...s.filter(x=>x.op!==null).map(x=>x.t));
    return {nodeChanges:ids.size, partialOpacitySamples:mid.length, opacities:mid.map(x=>x.op),
      fadeStart:mid.length?mid[0].t:null, lastPresent,
      animName:(()=>{const n=document.querySelector('.toast');return n?getComputedStyle(n).animationName:'(gone)';})()};});
  R.toasts.push(res);
  await p.waitForTimeout(400);
}
R.errs=errs;
fs.writeFileSync('/tmp/claude-1000/-mnt-Cursor-PuppetMaster/6b56d129-8eab-4a4f-bf02-133b45afc809/scratchpad/waves/menu_toast.json',JSON.stringify(R,null,1));
console.log(JSON.stringify(R,null,1));
await b.close();
