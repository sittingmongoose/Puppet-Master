// FO-73 painted primary/secondary faces: native crops and calibrated held-press film.
import { LOOKS } from '../browser-check.config.mjs';
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});
 await f.waitForFunction(()=>window.O55?.S?.open);
 await t.emulate({reducedMotion:'no-preference'});
 await f.evaluate(()=>{
  O55.S.draft().project_name='Press example';
  window.__faceClicks=[];
  window.addEventListener('click',e=>{window.__faceClicks.push(e.target.closest('button')?.className||null);e.stopImmediatePropagation();e.preventDefault();},true);
 });
 const fe=f===t.page.mainFrame()?null:await f.frameElement(),off=fe?await fe.boundingBox():{x:0,y:0};
 for(const look of (t.args.look?String(t.args.look).split(','):LOOKS)) {
  await t.page.mouse.move(2,2);
  await f.evaluate(([fam,mode])=>O55.ui.applyLook(fam,mode),look.split('-'));await f.waitForTimeout(1600);
  await f.evaluate(()=>{document.documentElement.setAttribute('data-motion','full');O55.ui.go('safe',{noHistory:true});});await f.waitForTimeout(1800);
  for(const kind of ['primary','secondary']) {
   const sel=`#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-btn.o55-${kind}:not([aria-disabled="true"])`,c=f.locator(sel).first();
   await t.check(`${look} ${kind} enabled face exists`,await c.count()>0);
   if(!await c.count())continue;
   await c.scrollIntoViewIfNeeded();await t.page.mouse.move(2,2);await f.waitForTimeout(500);
   const b=await c.boundingBox(),rect={x:Math.floor(b.x-8),y:Math.floor(b.y-8),width:Math.ceil(b.width+16),height:Math.ceil(b.height+16)};
   await t.crop(`${look}-${kind}-rest`,rect,'Resting native face and shadow, compare control and fixed crop at original resolution.');
   const native=await c.evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,classes:e.className};});
   await t.page.mouse.move(b.x+1,b.y+b.height/2);await t.mark(`down ${look} ${kind} left-1 ${JSON.stringify(native)}`);await t.page.mouse.down();
   const drift=await c.evaluate((e,rest)=>new Promise(resolve=>{const start=performance.now();let worst=0,frames=0;const tick=()=>{const r=e.getBoundingClientRect();frames++;worst=Math.max(worst,Math.abs(r.x-rest.x),Math.abs(r.y-rest.y),Math.abs(r.width-rest.w),Math.abs(r.height-rest.h));if(performance.now()-start<600)requestAnimationFrame(tick);else resolve({worst,frames});};requestAnimationFrame(tick);}),native);
   await t.crop(`${look}-${kind}-held`,rect,'Held native face: target border stays at rest bounds; inner content retains the look press cue.');
   await t.mark(`up ${look} ${kind} left-1`);await t.page.mouse.up();
   await t.check(`${look} ${kind} held face target stationary`,drift.worst<=.01,JSON.stringify({native,drift}));
   await t.page.mouse.move(2,2);await f.waitForTimeout(250);
  }
 }
}
