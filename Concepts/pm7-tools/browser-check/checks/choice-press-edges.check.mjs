// FO-49 press: a real held press near every edge of every card/tile activates it.
// Pointer-down, a 350 ms hold (longer than any press transition), then pointer-up at the
// same point: the native click must reach the pressed choice. In from each corner (past
// its rounding) and 1 and 2 px inside each side; normal motion, media Reduced Motion and
// the data-motion attribute; ten looks; Where, Look and NAS find. During the hold the
// pressed button itself must not move (its box equals its rest box) and, with Reduced
// Motion, no content scale shows either. The pressed box is read every frame of the hold. Clicks are taken in window capture and stopped
// there, so a press measures the browser's target and never re-renders or switches look.
import { LOOKS } from '../browser-check.config.mjs';
const L='.o55-pane > .o55-layer:not(.o55-out) ';
async function run(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});
 await f.waitForFunction(()=>window.O55?.S?.open);
 if(t.args.width)await t.viewport(Number(t.args.width),Number(t.args.height||1080));
 const hold=Number(t.args.hold||350);
 const fe=f===t.page.mainFrame()?null:await f.frameElement(),off=fe?await fe.boundingBox():{x:0,y:0};
 await f.evaluate(()=>{
  window.__press={clicks:[],downs:[],trial:''};
  const id=e=>{const c=e.target.closest&&e.target.closest('.o55-card,.o55-tile');return c?c.__pressId??'other-choice':null;};
  window.addEventListener('pointerdown',e=>window.__press.downs.push({trial:window.__press.trial,id:id(e)}),true);
  window.addEventListener('click',e=>{window.__press.clicks.push({trial:window.__press.trial,id:id(e)});e.stopImmediatePropagation();e.preventDefault();},true);
 });
 const motions=t.args.motion?String(t.args.motion).split(','):['no-preference','reduce','attribute'];
 const looks=t.args.look?String(t.args.look).split(','):LOOKS;
 const screens=t.args.screen?String(t.args.screen).split(','):['where','look','nas-find'];
 for(const motion of motions) {
  await t.emulate({reducedMotion:motion==='attribute'?'no-preference':motion});
  for(const look of looks) {
   await f.evaluate(([fam,mode])=>O55.ui.applyLook(fam,mode),look.split('-'));await f.waitForTimeout(1600);
   await f.evaluate(m=>document.documentElement.setAttribute('data-motion',m==='attribute'?'reduced':'full'),motion);
   for(const screen of screens) {
    await t.page.mouse.move(2,2);await f.evaluate(s=>O55.ui.go(s,{noHistory:true}),screen);await f.waitForTimeout(1800);
    const sel=L+(screen==='look'?'.o55-tile':'.o55-card'),count=await f.locator(sel).count(),tag=`${look} ${motion} ${screen}`;
    await f.evaluate(()=>{window.__press.clicks=[];window.__press.downs=[];});
    const misses=[],moved=[],scaled=[],flat=[];let presses=0,feedback=0;
    for(let i=0;i<count;i++) {
     if(t.args.first&&i>0)break;
     const c=f.locator(sel).nth(i);await c.scrollIntoViewIfNeeded();await t.page.mouse.move(2,2);
     const rest=await f.evaluate(async({sel,i})=>{
      const e=document.querySelectorAll(sel)[i];e.__pressId=i;getComputedStyle(e).transform;
      await Promise.all(e.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})));
      const r=e.getBoundingClientRect(),s=getComputedStyle(e);
      const rad=Math.min(r.width/2,r.height/2,Math.max(...['TopLeft','TopRight','BottomLeft','BottomRight'].map(k=>parseFloat(s['border'+k+'Radius'])||0)));
      return {x:r.x,y:r.y,w:r.width,h:r.height,rad};
     },{sel,i});
     const k=Math.ceil(rest.rad*0.293)+2,cx=rest.x+rest.w/2,cy=rest.y+rest.h/2,R=rest.x+rest.w,B=rest.y+rest.h;
     const pts=[['corner top-left',rest.x+k,rest.y+k],['corner top-right',R-k,rest.y+k],['corner bottom-left',rest.x+k,B-k],['corner bottom-right',R-k,B-k]];
     for(const d of [1,2])pts.push([`top-${d}`,cx,rest.y+d],[`bottom-${d}`,cx,B-d],[`left-${d}`,rest.x+d,cy],[`right-${d}`,R-d,cy]);
     for(const [name,x,y] of pts.filter(p=>!t.args.onePx||!p[0].endsWith('-2'))) {
      const trial=`${tag} ${i} ${name}`;
      await t.page.mouse.move(2,2);
      await f.evaluate(async({sel,i,trial})=>{const e=document.querySelectorAll(sel)[i];getComputedStyle(e).transform;
       await Promise.all(e.getAnimations({subtree:true}).filter(a=>a.transitionProperty).map(a=>a.finished.catch(()=>{})));window.__press.trial=trial;},{sel,i,trial});
      await t.page.mouse.move(off.x+x,off.y+y);if(t.args.marks)await t.mark(`down ${trial}`);await t.page.mouse.down();
      // the box is sampled in the page for the whole hold, every frame, so a spring between reads is seen too
      const drift=await f.evaluate(({sel,i,hold,rest})=>new Promise(res=>{const e=document.querySelectorAll(sel)[i],t0=performance.now();let worst=0,frames=0;
       const tick=()=>{const r=e.getBoundingClientRect();frames++;worst=Math.max(worst,Math.abs(r.x-rest.x),Math.abs(r.y-rest.y),Math.abs(r.width-rest.w),Math.abs(r.height-rest.h));
        if(performance.now()-t0<hold)requestAnimationFrame(tick);else res({worst,frames});};requestAnimationFrame(tick);}),{sel,i,hold,rest});
      const read=()=>f.evaluate(({sel,i})=>{const e=document.querySelectorAll(sel)[i],r=e.getBoundingClientRect(),kid=e.firstElementChild,ks=kid?getComputedStyle(kid):null;
       return {x:r.x,y:r.y,w:r.width,h:r.height,transform:getComputedStyle(e).transform,active:e.matches(':active'),kidScale:ks?ks.scale:'none',kidTransform:ks?ks.transform:'none'};},{sel,i});
      let h=await read();
      // Hovering a Look tile previews that look, which can hold the frame clock back: the squeeze is judged
      // by the end of a further second of the same hold, the press target on every read.
      if(motion==='no-preference'&&look.startsWith('friendly'))for(let w=0;w<10&&h.kidScale==='1';w++){await f.waitForTimeout(100);h=await read();}
      if(t.args.marks)await t.mark(`up ${trial}`);await t.page.mouse.up();presses++;
      const got=await f.evaluate(trial=>({c:window.__press.clicks.filter(x=>x.trial===trial),d:window.__press.downs.filter(x=>x.trial===trial)}),trial);
      if(!(got.d.length===1&&got.d[0].id===i&&got.c.length===1&&got.c[0].id===i))misses.push({trial,down:got.d.map(x=>x.id),click:got.c.map(x=>x.id),held:h.transform});
      if(drift.worst>.01||Math.abs(h.x-rest.x)>.01||Math.abs(h.y-rest.y)>.01||Math.abs(h.w-rest.w)>.01||Math.abs(h.h-rest.h)>.01)moved.push({trial,drift,rest,held:h});
      const contentScaled=(h.kidScale!=='none'&&h.kidScale!=='1')||/matrix\((?!1, 0, 0, 1,)/.test(h.kidTransform);
      if(contentScaled)feedback++;else flat.push({trial,active:h.active,kidScale:h.kidScale});
      if(motion!=='no-preference'&&(contentScaled||h.transform!=='none'))scaled.push({trial,transform:h.transform,kidScale:h.kidScale,kidTransform:h.kidTransform});
     }
    }
    await t.page.mouse.move(2,2);
    await t.check(`FO-49 press activates at every edge ${tag}`,count>0&&!misses.length,`${count} choices, ${presses} held presses; misses ${JSON.stringify(misses.slice(0,6))}${misses.length>6?` (+${misses.length-6})`:''}`);
    await t.check(`FO-49 pressed target stays at rest box ${tag}`,!moved.length,JSON.stringify(moved.slice(0,3)));
    if(motion!=='no-preference')await t.check(`FO-49 no press scale with Reduced Motion ${tag}`,!scaled.length,JSON.stringify(scaled.slice(0,3)));
    else if(look.startsWith('friendly'))await t.check(`FO-49 Friendly press feedback kept on content ${tag}`,feedback===presses,`${feedback}/${presses} holds showed a content scale; without: ${JSON.stringify(flat.slice(0,4))}`);
   }
  }
 }
 await f.evaluate(()=>document.documentElement.setAttribute('data-motion','full'));
 await t.emulate({reducedMotion:'no-preference'});
}

export default async function(t) {
 await run(t);
 if(!t.args.width&&!t.args.screen&&!t.args.look) {
  const saved={...t.args};
  for(const [width,height] of [[740,1000],[1280,500]]) {
   Object.assign(t.args,{width,height,look:'glass-light',screen:'look',first:1,onePx:0});
   await run(t);
  }
  Object.keys(t.args).forEach(k=>delete t.args[k]);Object.assign(t.args,saved);
 }
}
