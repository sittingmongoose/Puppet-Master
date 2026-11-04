// SW19: pixel evidence is recorded with --record; transforms are the regression gate.
export default async function(t){
 await t.emulate({reducedMotion:'no-preference'});const f=await t.app.open();
 for(const look of ['basic-dark','retro-dark','retro-light']){
  await t.app.look(look);
  await f.evaluate(()=>{PM56_COLLAB.openConfigure('crew');PM56_APP.ctx().openDialog({type:'collab-configure'});});
  await t.page.waitForTimeout(800);
  const pip=f.locator('.pmx-sheet .pmx-pip-host').last();
  const box=await pip.boundingBox();await t.check(look+' visible Pip',!!box);
  if(!box)continue;
  t.log(look+' Pip '+JSON.stringify(box));
  for(let rep=0;rep<3;rep++){
   const transforms=[];
   for(const side of [-1,1]){
    await t.page.mouse.move(box.x+box.width/2+side*160,box.y+box.height/2);
    await t.page.waitForTimeout(350);
    await t.mark(look+' '+rep+' '+(side<0?'left':'right'));
    transforms.push(await pip.evaluate(e=>{const face=e.querySelector('.pmx-pip-face');return face?getComputedStyle(face).transform:null;}));
    await t.page.waitForTimeout(300);
   }
   t.log(look+' '+JSON.stringify(transforms));
   await t.check(look+' gaze follows both sides '+rep,transforms[0]!==null&&transforms[0]!==transforms[1]);
  }
  await f.evaluate(()=>PM56_APP.ctx().closeDialog());
 }
 await t.app.look('basic-dark');
 const durations=[];
 for(const speed of ['Fast','Cinematic']){
  await f.evaluate(s=>PM12_KIMI.setSettingFromHost('general.visual.animation-speed',s,false,false),speed);
  for(let i=0;i<3;i++){
   await t.mark('SW27 '+speed+' open '+i);
   await f.locator('#pmRoot [data-action="open-activity"]').first().click();
   durations.push([speed,await f.locator('#pmRoot .activity-panel').evaluate(e=>getComputedStyle(e).animationDuration)]);
   await t.page.waitForTimeout(1200);
   await f.locator('#pmRoot [data-action="close-activity"]').click();
   await t.page.waitForTimeout(200);
  }
 }
 t.log('SW27 '+JSON.stringify(durations));
 await t.check('SW27 entry scales',durations[0][1]!==durations[3][1]);
}
