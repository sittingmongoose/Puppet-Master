// FO-73: the real Copy action must preserve its press face in Copy and Copied states.
import { LOOKS } from '../browser-check.config.mjs';
const sel='#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="copyText"]';
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});
 await f.waitForFunction(()=>window.O55?.S?.open);
 await f.evaluate(()=>{window.__copyClicks=[];window.addEventListener('click',e=>{if(e.target.closest?.('[data-o55-do="copyText"]'))window.__copyClicks.push(e.isTrusted);},true);});
 const motions=t.args.motion?String(t.args.motion).split(','):['no-preference','reduce','attribute'];
 const looks=t.args.look?String(t.args.look).split(','):LOOKS;
 for(const motion of motions) {
  await t.emulate({reducedMotion:motion==='attribute'?'no-preference':motion});
  for(const look of looks) {
   await t.page.mouse.move(2,2);await f.evaluate(([a,b])=>O55.ui.applyLook(a,b),look.split('-'));await f.waitForTimeout(1600);
   await f.evaluate(m=>{document.documentElement.setAttribute('data-motion',m==='attribute'?'reduced':'full');O55.S.sess.server.kind='cloud';O55.S.sess.server.platform='linux';O55.ui.go('s-wait',{noHistory:true});},motion);await f.waitForTimeout(1800);
   const c=f.locator(sel).first();await c.scrollIntoViewIfNeeded();await c.click();
   await f.waitForFunction(s=>document.querySelector(s)?.textContent===O55.t('chrome.copied'),sel);
   for(const state of ['copied','copy']) {
    if(state==='copy')await f.waitForFunction(s=>document.querySelector(s)?.textContent===O55.t('chrome.copy'),sel,{timeout:5000});
    const tag=`${look} ${motion} ${state}`,face=await c.evaluate(e=>e.childElementCount===1&&e.firstElementChild?.tagName==='SPAN');
    await t.check(`FO-73 Copy retains inner face ${tag}`,face);
    if(!face)continue;
    // Refresh the acknowledgement's own deadline with a real click before its hold.
    if(state==='copied')await c.click();
    const b=await c.boundingBox(),rest=await c.evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}),before=await f.evaluate(()=>window.__copyClicks.length);
    await t.page.mouse.move(b.x+1,b.y+b.height/2);await t.page.mouse.down();
    const h=await c.evaluate((e,b)=>new Promise(resolve=>{const start=performance.now();let worst=0,frames=0;const tick=()=>{const r=e.getBoundingClientRect();frames++;worst=Math.max(worst,Math.abs(r.x-b.x),Math.abs(r.y-b.y),Math.abs(r.width-b.width),Math.abs(r.height-b.height));if(performance.now()-start<350)requestAnimationFrame(tick);else{const k=e.firstElementChild,s=k&&getComputedStyle(k);resolve({worst,frames,translate:s?.translate,scale:s?.scale,identity:!s||s.transform==='none'||new DOMMatrixReadOnly(s.transform).isIdentity});}};requestAnimationFrame(tick);}),rest);
    await t.page.mouse.up();await f.waitForFunction(n=>window.__copyClicks.length>n,before,{timeout:1000});
    const clicks=await f.evaluate(n=>window.__copyClicks.slice(n),before);
    const still=h.worst<=.01&&h.frames>=2,flat=['none','0px','0px 0px'].includes(h.translate)&&['none','1','1 1'].includes(h.scale)&&h.identity;
    await t.check(`FO-73 Copy held edge activates with stable target ${tag}`,still&&clicks.length===1&&clicks[0],JSON.stringify({h,clicks}));
    await t.check(`FO-73 Copy look feedback ${tag}`,motion==='no-preference'?!flat:flat,JSON.stringify(h));
   }
  }
 }
 await f.evaluate(()=>document.documentElement.setAttribute('data-motion','full'));await t.emulate({reducedMotion:'no-preference'});
}
