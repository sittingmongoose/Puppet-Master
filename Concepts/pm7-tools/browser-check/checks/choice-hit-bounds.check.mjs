// FO-49: real native clicks beyond every rest edge, before/after hover. Native event
// targets also catch activation of an already-selected choice. One measurement per
// trial keeps remote-browser latency out of the matrix without dropping any clicks.
import { LOOKS } from '../browser-check.config.mjs';
const L='.o55-pane > .o55-layer:not(.o55-out) ';
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});
 await f.waitForFunction(()=>window.O55?.S?.open);
 if(t.args.width)await t.viewport(Number(t.args.width),Number(t.args.height||1080));
 const fe=f===t.page.mainFrame()?null:await f.frameElement(),off=fe?await fe.boundingBox():{x:0,y:0};
 await f.evaluate(()=>{
  window.__choiceClicks=[];window.__choiceTrial='';
  document.addEventListener('click',e=>{const c=e.target.closest('.o55-card,.o55-tile');if(c)window.__choiceClicks.push({trial:window.__choiceTrial,arg:c.dataset.arg});},true);
 });
 for(const motion of (t.args.motion?[t.args.motion]:['no-preference','reduce'])) {
  await t.emulate({reducedMotion:motion});
  for(const look of (t.args.look?[t.args.look]:LOOKS)) {
   await f.evaluate(([fam,mode])=>O55.ui.applyLook(fam,mode),look.split('-'));await f.waitForTimeout(1600);
   for(const screen of (t.args.screen?[t.args.screen]:['where','look','nas-find'])) {
    await t.page.mouse.move(2,2);await f.evaluate(s=>O55.ui.go(s,{noHistory:true}),screen);await f.waitForTimeout(1800);
    const sel=L+(screen==='look'?'.o55-tile':'.o55-card'),count=await f.locator(sel).count();
    await f.evaluate(()=>window.__choiceClicks=[]);
    let trials=0;
    choices: for(let i=0;i<count;i++) {
     const c=f.locator(sel).nth(i);await c.scrollIntoViewIfNeeded();
     for(const hovered of [false,true])for(const d of [1,2,3])for(const edge of ['bottom','top','left','right']) {
      await t.page.mouse.move(2,2);
      const p=await f.evaluate(async({sel,i,trial})=>{
       const e=document.querySelectorAll(sel)[i];getComputedStyle(e).transform;
       await Promise.all(e.getAnimations().filter(a=>a.transitionProperty==='transform').map(a=>a.finished.catch(()=>{})));
       const r=e.getBoundingClientRect();window.__choiceTrial=trial;
       return {box:{x:r.x,y:r.y,width:r.width,height:r.height},bad:window.__choiceClicks};
      },{sel,i,trial:`${i} ${edge}+${d} hover=${hovered}`});
      if(p.bad.length)break choices;
      const b=p.box,x=off.x+(edge==='left'?b.x-d:edge==='right'?b.x+b.width+d:b.x+b.width/2),y=off.y+(edge==='top'?b.y-d:edge==='bottom'?b.y+b.height+d:b.y+b.height/2);
      if(hovered) {
       await t.page.mouse.move(off.x+b.x+b.width/2,off.y+b.y+b.height/2);
       // First point settles the lift; remaining trials include its transition.
       if(d===1&&edge==='bottom')await c.evaluate(async e=>{getComputedStyle(e).transform;await Promise.all(e.getAnimations().filter(a=>['transform','--o55-hover-y'].includes(a.transitionProperty)).map(a=>a.finished.catch(()=>{})));});
      }
      await t.page.mouse.click(x,y);trials++;
     }
    }
    const bad=await f.evaluate(()=>window.__choiceClicks);
    await t.check(`FO-49 outside bounds ${look} ${motion} ${screen}`,count>0&&!bad.length,`${count} choices, ${trials} native outside clicks; ${JSON.stringify(bad)}`);
    const on=f.locator(sel+'.o55-on').first(),control=await on.count()?on:f.locator(sel).first();
    await control.scrollIntoViewIfNeeded();await t.page.mouse.move(2,2);await f.waitForTimeout(450);
    const rb=await control.boundingBox();await f.evaluate(()=>{window.__choiceClicks=[];window.__choiceTrial='inside';});
    await t.page.mouse.click(rb.x+rb.width/2,rb.y+rb.height/2);
    await t.check(`FO-49 inside click ${look} ${motion} ${screen}`,(await f.evaluate(()=>window.__choiceClicks.length))===1);
    await control.focus();const focused=await control.evaluate(e=>document.activeElement===e);
    await t.check(`FO-49 native focus ${look} ${motion} ${screen}`,focused);
   }
  }
 }
 await t.emulate({reducedMotion:'no-preference'});
}
