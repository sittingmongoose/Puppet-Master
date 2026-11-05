import {installActivityInputProbe} from '../helpers/activity-paint.mjs';
import {beginActivityFrameClock} from '../helpers/activity-frame-clock.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

// Stream F SW regressions. Uses actual controls and the public fixture APIs.
export const tests = {
 'SW01 first click in short window': async t => {
  await t.viewport(1024,480);
  for(let i=0;i<Number(t.args.reps||10);i++) {
   const f=await t.app.open();
   await t.emulate({reducedMotion:'no-preference'});
   const b=f.locator('#pmRoot [data-action="open-activity"]').first();
   await f.evaluate(installActivityInputProbe);
   await f.evaluate(()=>{
    window.__activityClickRenders=0;window.__activityClickActive=false;
    PM56_EXT.slot('afterRender',(_ctx,info)=>{if(window.__activityClickActive&&info.phase==='app')window.__activityClickRenders++;});
    document.addEventListener('click',()=>{window.__activityClickActive=false;},{once:true});
    document.addEventListener('click',e=>{
     if(e.isTrusted&&e.target.closest('[data-action="open-activity"]'))window.__activityClickActive=true;
    },{capture:true,once:true});
   });
   const stage=await f.locator('#pmRoot .chat-stage').boundingBox();
   const box=await b.boundingBox();
   await t.page.mouse.move(box.x+box.width/2,box.y+box.height/2);
   const clock=await beginActivityFrameClock(t.window);
   let input,paint;
   try{
    await t.page.mouse.click(box.x+box.width/2,box.y+box.height/2);
    await t.page.waitForTimeout(1200);
    input=await f.evaluate(()=>window.__activityPaintInput);
   }finally{await clock.stop();}
   const dir=join(t.run.dir,'activity-first-paint-'+i);mkdirSync(dir,{recursive:true});
   for(let j=0;j<clock.frames.length;j++)writeFileSync(join(dir,String(j).padStart(3,'0')+'.png'),clock.frames[j].png);
   writeFileSync(join(dir,'frames.json'),JSON.stringify({input,stage,frames:clock.frames.map(({png,...frame})=>frame)},null,2));
   try{paint=clock.analyze(input,stage);}catch(error){paint={error:error.message};}
   writeFileSync(join(dir,'paint.json'),JSON.stringify(paint,null,2));
   const {samples,...summary}=paint;
   t.log('input to first cover paint '+i+': '+JSON.stringify({...summary,frames:samples?.length}));
   await t.check('first click painted within 500 ms '+i,
    !paint.error&&paint.input.trusted&&paint.elapsed>=0&&paint.elapsed<=500);
   await t.equal('cover click avoids full transcript render '+i,await f.evaluate(()=>window.__activityClickRenders),0);
   await t.painted('#pmRoot .activity-panel.cover');
  }
 },
 'SW11 duplicate titles select identity': async t => {
  const f=await t.app.open();
  const id=await f.evaluate(()=>{
   const W=PM_WORK, c=PM56_APP.ctx(), agents=W.items({thread:c.state.selectedThread,kind:'agent'}).filter(x=>x.role!=='main');
   agents[0].title=agents[1].title='Same title'; agents[0].state=agents[1].state='waiting'; agents[0].startedAt=Date.now(); agents[1].startedAt=Date.now()-10000; agents[0].ask=agents[1].ask='Review me';
   PM56_APP.render(); return agents[1].id;
  });
  await f.locator('[data-action="work-dock-review"][data-id="'+id+'"]').click();
  await t.equal('selected second agent',await f.evaluate(()=>PM56_APP.ctx().state.activity.selected?.id),id);
 },
 'SW12 shared sound switch': async t => {
  const f=await t.app.open();
  await f.locator('[data-action="chat-sound-toggle"]').click();
  const r=await f.evaluate(()=>({chat:PM56_SOUND.muted,pip:O55.sound.pip.chatMute.muted,row:PM_CHAT_SETTINGS.values()['general.interaction.sound-effects']}));
  t.log(JSON.stringify(r)); await t.check('chat and Pip share mute',r.chat===r.pip && r.row===!r.chat);
  await f.evaluate(()=>O55.sound.pip.chatMute.setMuted(false));
  await t.page.waitForTimeout(300);
  await t.check('Pip switch projects to chat',await f.evaluate(()=>!PM56_SOUND.muted));
 },
 'SW36 opened Detail resize frames': async t => {
  await t.viewport(1390,900);const f=await t.app.open();
  await f.evaluate(()=>{PMW.chatCol.setWidth(760);PM56_DEMO.openActivity('subagents','agent-schema');});
  await t.painted('#pmRoot .activity-panel');
  await f.evaluate(()=>{
   window.__dockFrames=[];window.__dockSampling=true;
   const sample=()=>{if(!window.__dockSampling)return;
    const panel=document.querySelector('#pmRoot .activity-panel'),stage=document.querySelector('#pmRoot .chat-stage');
    window.__dockFrames.push({time:performance.now(),width:stage.getBoundingClientRect().width,cover:panel.classList.contains('cover')});
    requestAnimationFrame(sample);
   };requestAnimationFrame(sample);
  });
  await t.viewport(1177,900);await t.until('twenty resize frame samples',()=>window.__dockFrames.length>=20);
  const frames=await f.evaluate(()=>{window.__dockSampling=false;return window.__dockFrames;});
  t.log(JSON.stringify(frames));
  await t.check('every resized frame has 360 messages or cover',frames.length>=20&&frames.every(x=>x.cover||x.width>=360));
  await t.painted('#pmRoot .activity-panel.cover');
 },
 'SW36 dock keeps 360 pixels': async t => {
  await t.viewport(1177,900); const f=await t.app.open();
  await f.locator('#pmRoot [data-action="open-activity"]').first().click();
  await t.page.waitForTimeout(800);
  for(const w of [740,860,1024,1120,1136,1137,1138,1176,1177,1178,1280,1390,1920]) {
   await t.viewport(w,900);await t.page.waitForTimeout(200);
   const r=await f.evaluate(()=>({w:document.querySelector('#pmRoot .chat-stage').getBoundingClientRect().width,cover:!!document.querySelector('#pmRoot .activity-panel.cover')}));
   t.log(w+' '+JSON.stringify(r));await t.check(w+' messages at least 360 or covered',r.w>=360||r.cover);
  }
 }
};
