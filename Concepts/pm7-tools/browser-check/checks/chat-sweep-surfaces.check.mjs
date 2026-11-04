import {LOOKS} from '../browser-check.config.mjs';
export const tests={
 'SW13 SW19 Room controls and sheet face':async t=>{
  const f=await t.app.open();
  for(const look of LOOKS){
   await t.app.look(look);
   await f.evaluate(()=>{PM56_COLLAB.openConfigure('chat_room');PM56_APP.ctx().openDialog({type:'collab-configure'});});
   await t.page.waitForTimeout(700);
   const sheet=f.locator('#pmOverlayRoot .pmx-sheet').last();
   const controls=sheet.locator('button,input:not([readonly]),select');
   const count=await controls.count();let unchanged=[];
   for(let i=0;i<count;i++){
    const b=controls.nth(i); if(!await b.isVisible()||!await b.isEnabled())continue;
    await t.page.mouse.move(0,0);await t.page.waitForTimeout(180);
    const style=e=>{const c=getComputedStyle(e);return [c.backgroundColor,c.borderColor,c.outlineColor,c.boxShadow,c.color].join('|')};
    const before=await b.evaluate(style);await b.hover({timeout:1500}).catch(()=>{});await t.page.waitForTimeout(250);
    if(before===await b.evaluate(style))unchanged.push(await b.evaluate(e=>e.outerHTML.slice(0,180)));
   }
   t.log(look+' room controls '+count+' unchanged '+JSON.stringify(unchanged));
   await t.check(look+' Room controls emphasize',count>0&&unchanged.length===0);
   const face=sheet.locator('.pmx-pip-host .pmx-pip-face');
   t.log(look+' face groups '+await face.count());
   if(look.startsWith('retro'))await t.check(look+' sheet has movable face',await face.count()>0);
   await f.evaluate(()=>PM56_APP.ctx().closeDialog());
  }
 },
 'SW14 infinite loops reduced motion':async t=>{
  await t.emulate({reducedMotion:'reduce'});const f=await t.app.open();
  for(const look of ['basic-dark','nier-dark']){
   await t.app.look(look);
   const loops=await f.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'&&a.effect?.getTiming().iterations===Infinity).map(a=>({name:a.animationName,cls:a.effect.target?.className?.baseVal||a.effect.target?.className})));
   t.log(look+' '+JSON.stringify(loops));
   await t.check(look+' no targeted loops',!loops.some(x=>/thread-working-pulse|wt-dirty|thread-wt-glyph|pm6-subagent-status|subagent-dot|nx-st-working/.test(x.cls)));
  }
 },
 'SW27 animation speed SW02 composer SW32 faces':async t=>{
  const f=await t.app.open();const durations=[];
  for(const speed of ['Fast','Cinematic']){
   await f.evaluate(s=>{PM12_KIMI.setSettingFromHost('general.visual.animation-speed',s,false,false);PM56_DEMO.openActivity('subagents');},speed);
   durations.push(await f.locator('#pmRoot .activity-panel').evaluate(e=>getComputedStyle(e).animationDuration));
   await f.locator('#pmRoot [data-action="close-activity"]').click();
  }
  t.log('entry durations '+JSON.stringify(durations));await t.check('entry speed changes',durations[0]!==durations[1]);
  t.log(await f.evaluate(()=>JSON.stringify({model:PM56_APP.ctx().model, workFaces:PMLogo.STATUS_FACE, chatMarks:PM56_SHELL.pmxPip({mood:'think',size:22}).slice(0,180)})));
 }
};
