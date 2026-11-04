// Stream F SW regressions. Uses actual controls and the public fixture APIs.
export const tests = {
 'SW01 first click in short window': async t => {
  await t.viewport(1024,480);
  for(let i=0;i<10;i++) {
   const f=await t.app.open();
   const b=f.locator('#pmRoot [data-action="open-activity"]').first();
   await b.click();
   await t.page.waitForTimeout(500);
   await t.check('first click '+i,await f.evaluate(()=>PM56_APP.ctx().state.activity.open));
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
 'SW36 dock keeps 360 pixels': async t => {
  await t.viewport(1177,900); const f=await t.app.open();
  await f.locator('#pmRoot [data-action="open-activity"]').first().click();
  await t.page.waitForTimeout(800);
  const r=await f.evaluate(()=>({w:document.querySelector('#pmRoot .chat-stage').getBoundingClientRect().width, cover:!!document.querySelector('#pmRoot .activity-panel[data-mode="cover"]')}));
  t.log(JSON.stringify(r)); await t.check('messages at least 360 or covered',r.w>=360||r.cover);
 }
};
