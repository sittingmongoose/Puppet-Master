// FO-49: a short, repeatable 60 fps painted-edge control/fix film.
export default async function(t) {
 const f=await t.app.open({onboarding:true,query:'o55=fresh'});
 await f.waitForFunction(()=>window.O55?.S?.open);
 const fe=f===t.page.mainFrame()?null:await f.frameElement(), off=fe?await fe.boundingBox():{x:0,y:0};
 for(const motion of ['no-preference','reduce']) {
  await t.emulate({reducedMotion:motion});
  for(const [screen,sel] of [['where','.o55-card[data-arg="server"]'],['look','.o55-tile[data-arg="friendly"]']]) {
   await t.page.mouse.move(2,2);
   await f.evaluate(()=>O55.ui.applyLook('glass','light')); await f.waitForTimeout(1500);
   await f.evaluate(s=>O55.ui.go(s,{noHistory:true}),screen); await f.waitForTimeout(1800);
   const c=f.locator('.o55-pane > .o55-layer:not(.o55-out) '+sel);
   await c.scrollIntoViewIfNeeded(); const b=await c.boundingBox();
   await t.page.mouse.move(b.x+b.width/2,b.y+b.height-.5);
   await f.waitForTimeout(500);
   const name=`${screen} ${motion}`;
   await t.mark(name+' edge rest');
   t.log(JSON.stringify({name,box:b}));
   const r=await c.evaluate(e=>new Promise(resolve=>{let n=0,flips=0,last=null;const positions=new Set();const tick=()=>{const b=e.getBoundingClientRect(),h=e.matches(':hover');positions.add(b.y.toFixed(3));if(last!==null&&last!==h)flips++;last=h;if(++n<180)requestAnimationFrame(tick);else resolve({flips,positions:positions.size,hover:h});};tick();}));
   await t.mark(name+' end');
   await t.check(name+' holds',r.flips===0&&r.positions===1&&r.hover,JSON.stringify(r));
   await t.crop(name,{x:b.x-3,y:b.y-6,width:b.width+6,height:b.height+12},'Resting bottom edge and lifted visuals; compare control/fix films.');
  }
 }
 await t.emulate({reducedMotion:'no-preference'});
}
