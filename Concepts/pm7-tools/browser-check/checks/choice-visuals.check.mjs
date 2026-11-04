// FO-49: native boxes stay fixed; material and content lift together, focus stays visible.
import { LOOKS } from '../browser-check.config.mjs';
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});
 await f.waitForFunction(()=>window.O55?.S?.open);
 for(const motion of ['no-preference','reduce']) {
  await t.emulate({reducedMotion:motion});
  for(const look of (t.args.look?[t.args.look]:LOOKS)) {
   await f.evaluate(([fam,mode])=>O55.ui.applyLook(fam,mode),look.split('-'));await f.waitForTimeout(1500);
   for(const screen of ['where','look']) {
    await t.page.mouse.move(2,2);await f.evaluate(s=>O55.ui.go(s,{noHistory:true}),screen);await f.waitForTimeout(1700);
    const c=f.locator('.o55-layer:not(.o55-out) '+(screen==='where'?'.o55-card[data-arg="server"]':'.o55-tile')).first();
    await c.scrollIntoViewIfNeeded();await f.waitForTimeout(500);
    const read=()=>c.evaluate(e=>{const r=e.getBoundingClientRect(),v=e.firstElementChild.getBoundingClientRect(),p=getComputedStyle(e,'::before');return {x:r.x,y:r.y,child:v.y,paint:getComputedStyle(e).getPropertyValue('--o55-hover-y'),pointer:p.pointerEvents,outline:p.outlineStyle,outlineWidth:p.outlineWidth,bg:p.background,shadow:p.boxShadow,focus:e.matches(':focus-visible')};});
    const a=await read(),b=await c.boundingBox();await t.page.mouse.move(b.x+b.width/2,b.y+b.height/2);await f.waitForTimeout(600);const z=await read();
    const family=look.split('-')[0], lift=family==='nier'||(family==='retro'&&screen==='where')?0:screen==='where'?-1:-2;
    await t.check(`${look} ${motion} ${screen}: native box fixed, paint lifts ${lift}px`,Math.abs(z.y-a.y)<.01&&Math.abs(z.x-a.x)<.01&&Math.abs(z.child-a.child-lift)<.02&&Math.abs(parseFloat(z.paint)-lift)<.02&&z.pointer==='none',JSON.stringify({a,z,lift}));
    await c.focus();await t.page.keyboard.press('Tab');await t.page.keyboard.press('Shift+Tab');const k=await read();
    await t.check(`${look} ${motion} ${screen}: native keyboard focus has its painted ring`,k.focus&&k.outline==='solid'&&parseFloat(k.outlineWidth)===2,JSON.stringify(k));
    if(t.args.visualShots&&motion==='no-preference') await t.crop(`${look}-${screen}`,await c.boundingBox(),'Lift, selected material, focus ring and Glass lens on the stationary choice.');
   }
  }
 }
 await t.emulate({reducedMotion:'no-preference'});
}
