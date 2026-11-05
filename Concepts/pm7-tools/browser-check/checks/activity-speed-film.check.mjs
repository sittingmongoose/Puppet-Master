// SW27, owner-API entry with a stable page viewport (no locator auto-scroll).
export default async function(t){
 await t.emulate({reducedMotion:'no-preference'});const f=await t.app.open();await t.app.look('basic-dark');
 for(const speed of ['Fast','Cinematic']){
  await f.evaluate(s=>PM12_KIMI.setSettingFromHost('general.visual.animation-speed',s,false,false),speed);
  for(let i=0;i<3;i++){
   await f.evaluate(()=>{window.scrollTo(0,0);PM56_APP.ctx().state.activity.open=false;PM56_APP.render();});
   await t.page.waitForTimeout(300);
   await t.mark(speed+' entry '+i);
   const r=await f.evaluate(()=>{PM56_DEMO.openActivity('goal');const p=document.querySelector('#pmRoot .activity-panel');return {duration:getComputedStyle(p).animationDuration,rect:p.getBoundingClientRect().toJSON(),scrollY:window.scrollY};});
   t.log(speed+' '+i+' '+JSON.stringify(r));await t.check('viewport stable',r.scrollY===0);
   await t.page.waitForTimeout(1300);await t.mark(speed+' settled '+i);
  }
 }
}
