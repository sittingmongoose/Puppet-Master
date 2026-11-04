// Activity Detail layout across shared looks, host widths and reduced motion.
import {LOOKS} from '../browser-check.config.mjs';
export default async function(t){
 const f=await t.app.open();
 for(const look of LOOKS){
  await t.app.look(look);
  for(const reducedMotion of ['reduce','no-preference']){
   await t.emulate({reducedMotion});
   for(const w of [740,860,1024,1280,1390,1920]){
    await t.viewport(w,900);
    await f.evaluate(()=>{PMW.chatCol.setWidth(760);PM56_DEMO.openActivity('subagents','agent-schema');});
    const r=await f.evaluate(()=>({w:document.querySelector('#pmRoot .chat-stage').getBoundingClientRect().width,cover:!!document.querySelector('#pmRoot .activity-panel.cover')}));
    await t.check(`${look} ${reducedMotion} ${w} messages >=360 or covered`,r.cover||r.w>=360);
   }
  }
 }
}
