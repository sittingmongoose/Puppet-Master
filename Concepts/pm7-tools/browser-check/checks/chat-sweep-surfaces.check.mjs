import {LOOKS} from '../browser-check.config.mjs';
export const tests={
 'SW13 SW19 Room controls and sheet face':async t=>{
  const f=await t.app.open();
  for(const look of (t.args.looks?String(t.args.looks).split(','):LOOKS)){
   await t.app.look(look);
   await f.evaluate(()=>{PM56_COLLAB.openConfigure('chat_room');PM56_APP.ctx().openDialog({type:'collab-configure'});});
   await t.page.waitForTimeout(700);
   const sheet=f.locator('#pmOverlayRoot .pmx-sheet').last();
   const controls=sheet.locator(t.args.fields?'input[data-collab-input="name"],input.pmx-row-job':'button,input:not([readonly]),select');
   const count=await controls.count();let unchanged=[];
   for(let i=0;i<count;i++){
    const b=controls.nth(i); if(!await b.isVisible()||!await b.isEnabled()||await b.getAttribute('aria-hidden')==='true')continue;
    await t.page.mouse.move(0,0);await t.page.waitForTimeout(180);
    const style=e=>{const host=e.closest('label,.input-wrap')||e;return [host,...host.querySelectorAll('span,svg')].map(n=>{const c=getComputedStyle(n);return [c.backgroundColor,c.borderColor,c.outlineColor,c.outlineWidth,c.outlineStyle,c.boxShadow,c.color,c.textDecorationLine].join('|')}).join('~')};
    const before=await b.evaluate(style);await b.hover({timeout:1500}).catch(()=>{});await t.page.waitForTimeout(250);
    if(before===await b.evaluate(style))unchanged.push(await b.evaluate(e=>e.outerHTML.slice(0,180)));
   }
   t.log(look+' room controls '+count+' unchanged '+JSON.stringify(unchanged));
   await t.check(look+' Room controls emphasize',count>0&&unchanged.length===0);
   const face=sheet.locator('.pmx-pip-host .pmx-pip-face');
   t.log(look+' face groups '+await face.count());
   const head=await sheet.evaluate(e=>({filter:getComputedStyle(e.querySelector('.pmx-pip-pup')).filter,ids:e.querySelectorAll('.pmx-pip-host [id]').length}));
   await t.check(look+' SW20 head stays id-free',head.ids===0);
   if(look.startsWith('glass'))await t.check(look+' SW20 glow and shadow',(head.filter.match(/drop-shadow/g)||[]).length===2);
   const pure=await f.evaluate(()=>['idle','happy','alert','error','sleep','think','watch','oops'].every(m=>{const a=PM56_SHELL.pmxPipHost('crew',m);return a===PM56_SHELL.pmxPipHost('crew',m)&&!/(?:\bid=|url\(#)/.test(a)}));
   await t.check(look+' SW20 eight faces deterministic and no SVG refs',pure);
   if(look.startsWith('retro'))await t.check(look+' sheet has movable face',await face.count()>0);
   await f.evaluate(()=>PM56_APP.ctx().closeDialog());
  }
 },
 'SW14 infinite loops reduced motion':async t=>{
  await t.emulate({reducedMotion:'reduce'});const f=await t.app.open();
  for(const look of ['basic-dark','nier-dark']){
   await t.app.look(look);
   await f.evaluate(()=>PM56_DEMO.openActivity('subagents'));
   t.log('working agents '+await f.evaluate(()=>PM_WORK.items({thread:PM56_APP.ctx().state.selectedThread,kind:'agent'}).filter(x=>PM_WORK.isLive(x)).length));
   const loops=await f.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'&&a.effect?.getTiming().iterations===Infinity).map(a=>({name:a.animationName,cls:a.effect.target?.className?.baseVal||a.effect.target?.className})));
   t.log(look+' '+JSON.stringify(loops));
   await t.check(look+' no targeted loops',!loops.some(x=>/thread-working-pulse|wt-dirty|thread-wt-glyph|pm6-subagent-status|subagent-dot|nx-st-working/.test(x.cls)));
  }
 },
 'SW27 animation speed SW02 composer SW32 faces':async t=>{
  await t.emulate({reducedMotion:'no-preference'});const f=await t.app.open();const durations=[];
  for(const speed of ['Fast','Cinematic']){
   await f.evaluate(s=>{PM12_KIMI.setSettingFromHost('general.visual.animation-speed',s,false,false);PM56_DEMO.openActivity('subagents');},speed);
   durations.push(await f.locator('#pmRoot .activity-panel').evaluate(e=>getComputedStyle(e).animationDuration));
   await f.locator('#pmRoot [data-action="close-activity"]').click();
  }
  t.log('entry durations '+JSON.stringify(durations));await t.check('entry speed changes',durations[0]!==durations[1]);
  t.log(await f.evaluate(()=>JSON.stringify({model:PM56_APP.ctx().model, workFaces:PMLogo.STATUS_FACE, chatMarks:PM56_SHELL.pmxPip({mood:'think',size:22}).slice(0,180)})));
 }
};
