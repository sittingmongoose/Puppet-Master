// FO-73: an empty consent checkbox still paints and presses its inner ring.
import { appendFile } from 'node:fs/promises';
import { LOOKS } from '../browser-check.config.mjs';
const sel='#pm-o55-onboarding .o55-layer:not(.o55-out) button[data-o55-do="consent"]';
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});await f.waitForFunction(()=>window.O55?.S?.open);
 const fe=f===t.page.mainFrame()?null:await f.frameElement(),off=fe?await fe.boundingBox():{x:0,y:0};
 await f.evaluate(()=>{window.__consent={hold:false,clicks:[]};window.addEventListener('click',e=>{if(!window.__consent.hold)return;window.__consent.clicks.push({trusted:e.isTrusted,own:!!e.target.closest?.('[data-o55-do="consent"]')});e.stopImmediatePropagation();e.preventDefault();},true);});
 for(const motion of (t.args.motion?String(t.args.motion).split(','):['no-preference','reduce','attribute'])) {
  await t.emulate({reducedMotion:motion==='attribute'?'no-preference':motion});
  for(const look of (t.args.look?String(t.args.look).split(','):LOOKS)) {
   await t.page.mouse.move(2,2);await f.evaluate(v=>O55.ui.applyLook(...v),look.split('-'));await f.waitForTimeout(1600);
   await f.evaluate(m=>{document.documentElement.setAttribute('data-motion',m==='attribute'?'reduced':'full');O55.S.draft().remote_mode='reverse_proxy';O55.S.draft().proxy_hostname='https://pm.example.net';O55.ui.go('away',{noHistory:true});},motion);await f.waitForTimeout(1800);
   for(const state of ['false','true']) {
    const c=f.locator(sel);await c.scrollIntoViewIfNeeded();if(await c.getAttribute('aria-checked')!==state)await c.click();
    await f.waitForFunction(({s,v})=>document.querySelector(s)?.getAttribute('aria-checked')===v,{s:sel,v:state});await t.page.mouse.move(2,2);await f.waitForTimeout(300);
    const tag=`${look}-${motion}-${state}`,b=await c.boundingBox(),rect={x:Math.floor(off.x+b.x-5),y:Math.floor(off.y+b.y-5),width:Math.ceil(b.width+10),height:Math.ceil(b.height+10)};
    if(t.args.visuals)await t.crop(`${tag}-rest`,rect,'Consent paint before press; compare checked and empty native rings at original resolution.');
    const data=[];
    const pts=t.args.film?[[b.width/2,b.height/2]]:[[1,b.height/2],[b.width-1,b.height/2],[b.width/2,1],[b.width/2,b.height-1],[2,b.height/2],[b.width-2,b.height/2],[b.width/2,2],[b.width/2,b.height-2],[3,3],[b.width-3,3],[3,b.height-3],[b.width-3,b.height-3]];
    for(const [x,y] of pts) {
     await t.page.mouse.move(off.x+b.x+x,off.y+b.y+y);
     const base=await c.evaluate(e=>{const r=e.getBoundingClientRect();window.__consent.hold=true;window.__consent.clicks=[];return {x:r.x,y:r.y,w:r.width,h:r.height};});
     if(t.args.film)await t.mark(`down ${tag} ${JSON.stringify(base)}`);await t.page.mouse.down();
     const h=await c.evaluate((e,b)=>new Promise(resolve=>{let worst=0,frames=0;const start=performance.now(),tick=()=>{const r=e.getBoundingClientRect();frames++;worst=Math.max(worst,Math.abs(r.x-b.x),Math.abs(r.y-b.y),Math.abs(r.width-b.w),Math.abs(r.height-b.h));if(performance.now()-start<350)requestAnimationFrame(tick);else{const face=e.querySelector('.o55-checkface'),p=face||e,s=getComputedStyle(p),q=p.getBoundingClientRect();resolve({worst,frames,face:!!face,paintWidth:q.width,paintBorder:parseFloat(s.borderTopWidth),scale:s.scale,transform:s.transform,rootBorder:parseFloat(getComputedStyle(e).borderTopWidth)});}};requestAnimationFrame(tick);}),base);
     if(t.args.film){await t.crop(`${tag}-held`,rect,'Held ring: inner paint squeezes in Friendly; native target stays fixed.');await t.mark(`up ${tag}`);}
     await t.page.mouse.up();await f.waitForFunction(()=>window.__consent.clicks.length,null,{timeout:1000}).catch(()=>{});
     const clicks=await f.evaluate(()=>{window.__consent.hold=false;return window.__consent.clicks;});data.push({x,y,base,h,clicks});await f.waitForTimeout(220);
    }
    await t.check(`FO-73 consent native held edges and corners ${tag}`,data.every(v=>v.h.worst<=.01&&v.h.frames>=2&&v.clicks.length===1&&v.clicks[0].trusted&&v.clicks[0].own),JSON.stringify(data));
    await t.check(`FO-73 consent painted ring keeps look cue ${tag}`,data.every(v=>v.h.paintBorder>0&&(motion==='no-preference'&&look.startsWith('friendly')?v.h.paintWidth<v.base.w-.1:Math.abs(v.h.paintWidth-v.base.w)<.02)),JSON.stringify(data));
    if(t.args.dataOut)await appendFile(String(t.args.dataOut),JSON.stringify({tag,data})+'\n');
   }
  }
 }
 await f.evaluate(()=>document.documentElement.setAttribute('data-motion','full'));await t.emulate({reducedMotion:'no-preference'});
}
