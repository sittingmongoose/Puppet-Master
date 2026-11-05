// Native outer face stays at the target while content lifts inside it. Film before/after and edge activation.
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});await f.waitForFunction(()=>O55.S?.open);
 for(const look of ['basic-light','glass-light']) for(const motion of ['no-preference','reduce','attribute']) {
  await t.emulate({reducedMotion:motion==='attribute'?'no-preference':motion});
  await f.evaluate(([look,m])=>{document.documentElement.setAttribute('data-motion',m==='attribute'?'reduced':'full');O55.ui.applyLook(...look.split('-'));},[look,motion]);await f.waitForTimeout(1500);
  for(const screen of ['where','look']) {
   await f.evaluate(s=>O55.ui.go(s,{noHistory:true}),screen);await f.waitForTimeout(1600);
   for(let repeat=0;repeat<2;repeat++) {
    await t.page.mouse.move(2,2);await f.waitForTimeout(500);
    const c=f.locator('.o55-pane > .o55-layer:not(.o55-out) '+(screen==='where'?'.o55-card[data-arg="server"]':'.o55-tile[data-arg="friendly"]'));
    const b=await c.boundingBox(),name=`${look} ${motion} ${screen} ${repeat}`;
    await t.mark(name+' before');await f.waitForTimeout(1000);
    await t.page.mouse.move(b.x+b.width/2,b.y+b.height-.5);await f.waitForTimeout(600);await t.mark(name+' hover');await f.waitForTimeout(1000);
    const r=await c.evaluate(e=>{const s=getComputedStyle(e),p=getComputedStyle(e,'::before');e.dataset.edgeClicks='0';e.addEventListener('click',()=>e.dataset.edgeClicks=String(+e.dataset.edgeClicks+1),{once:true});return {bg:s.backgroundColor,border:s.borderBottomColor,y:e.getBoundingClientRect().y,child:e.firstElementChild.getBoundingClientRect().y,paint:s.getPropertyValue('--o55-hover-y'),pseudo:p.translate};});
    await t.check(name+' painted native face',r.bg!=='rgba(0, 0, 0, 0)'&&r.border!=='rgba(0, 0, 0, 0)'&&Math.abs(r.y-b.y)<.01,JSON.stringify({b,r}));
    await t.check(name+' reduced displacement',motion==='no-preference'||parseFloat(r.paint)===0,JSON.stringify(r));
    // At the exact strip rejected by review: 0.5 px inside the resting bottom boundary.
    await t.page.mouse.click(b.x+b.width/2,b.y+b.height-.5);await f.waitForTimeout(300);
    await t.check(name+' native edge activates',await c.getAttribute('data-edge-clicks')==='1');
    t.log(JSON.stringify({name,box:b,state:r}));await t.mark(name+' clicked');
   }
  }
 }
}
