// SW-26 source cut: an unrelated editor prebuild must wait while the inbox opens, stays open and closes.
import { writeFileSync } from 'node:fs';
export default async function(t) {
 const cdp=await t.page.context().newCDPSession(t.page);
 await cdp.send('Tracing.start',{categories:'devtools.timeline,v8.execute,blink.user_timing,disabled-by-default-devtools.timeline.stack',transferMode:'ReturnAsStream'});
 try {
  for(let rep=0;rep<Number(t.args.reps||1);rep++) {
  const f=await t.app.open({settleMs:0});
  if(!await t.check('editor cache is not built before the early bell press',await f.locator('.pmed-cz').count()===0))continue;
  await t.mark('early bell');
  await f.locator('#pmnStack').click();
  await t.check('inbox open',await f.evaluate(()=>PM_TITLEBAR_NOTIFY.isOpen()));
  await t.page.waitForTimeout(3500);
  await t.check('editor cache is deferred while inbox is open',await f.locator('.pmed-cz').count()===0);
  await t.page.keyboard.press('Escape');
  await f.locator('#pmnPanel').waitFor({state:'hidden',timeout:10000});
  await t.mark('inbox closed');
  await f.locator('.pmed-cz.pmed-prepared').waitFor({state:'attached',timeout:15000});
  await t.check('editor cache resumes after inbox closes',await f.locator('.pmed-cz.pmed-prepared').count()===1);
  }
 } finally {
  const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const {stream}=await complete;
  let data='';for(;;){const r=await cdp.send('IO.read',{handle:stream});data+=r.data;if(r.eof)break;}await cdp.send('IO.close',{handle:stream});await cdp.detach();
  if(t.args.trace)writeFileSync(t.args.trace,data);
 }
}
