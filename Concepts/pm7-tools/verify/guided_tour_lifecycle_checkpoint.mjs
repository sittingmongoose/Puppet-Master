/* Browser-concept lifecycle checks. No native or final design certification.
 * node guided_tour_lifecycle_checkpoint.mjs <artifact> <out> <modules> <chrome>
 */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const [artifactArg,outArg,modulesArg,chrome]=process.argv.slice(2);
assert.ok(artifactArg&&outArg&&modulesArg&&chrome);
const artifact=resolve(artifactArg),out=resolve(outArg),require=createRequire(join(resolve(modulesArg),'noop.js'));
const {chromium}=require('playwright-core'),sha=v=>createHash('sha256').update(v).digest('hex');
mkdirSync(out,{recursive:true});
writeFileSync(join(out,'verifier.mjs'),readFileSync(fileURLToPath(import.meta.url)));
const report={scope:'concept full Show Me sequence and lifecycle faults only; not native, full manual, all-theme motion, or durable reload certification',artifact_sha256:sha(readFileSync(artifact)),verifier_sha256:sha(readFileSync(fileURLToPath(import.meta.url))),checks:[],errors:[],requests:[]};
const browser=await chromium.launch({executablePath:chrome,headless:true});let context,page,observeNetwork=false;
async function check(name,fn){await fn();report.checks.push({name,pass:true});console.log(`PASS ${name}`);}
async function fresh(){
  observeNetwork=false;if(context)await context.close();
  context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce',serviceWorkers:'block'});
  page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',error=>report.errors.push(error.message));
  page.on('request',request=>{if(observeNetwork&&/^https?:/.test(request.url()))report.requests.push({url:request.url(),method:request.method()});});
  await page.route('**/*',route=>/^(file:|data:|blob:)/.test(route.request().url())?route.continue():route.abort());
  await page.goto(pathToFileURL(artifact).href);await page.waitForFunction(()=>window.PM7_GUIDED_TOUR&&window.PM_DEMO&&window.PM_HOME_WORKSPACE);
  const close=page.getByRole('button',{name:'Close onboarding',exact:true});if(await close.isVisible())await close.click();
  await page.evaluate(()=>{
    const d=window.PM_DEMO,send=d.chat.send;window.__lifecycle={ordinary:[],events:[]};
    d.chat.send=function(...args){window.__lifecycle.ordinary.push(args[0]);return window.__lifecycle.ordinaryReturnOnly?{ordinary_sentinel:true}:send.apply(this,args);};
    window.__lifecycle.initialLayout=window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot();
    window.__lifecycle.initialThread=d.state.chat.activeThread;
    window.__lifecycle.initialPage=window.PM_PAGES.current;
  });observeNetwork=true;
}
const snap=()=>page.evaluate(()=>window.PM7_GUIDED_TOUR.snapshot());
const waitStep=id=>page.waitForFunction(value=>window.PM7_GUIDED_TOUR.snapshot().step_id===value,id);
async function runToBoundary(){
  await page.evaluate(()=>window.PM7_GUIDED_TOUR.start({source:'lifecycle-checkpoint'}));
  const steps=await page.evaluate(()=>window.PM7_GUIDED_TOUR.storyboard.order);
  for(let i=0;i<steps.length-1;i++){
    await waitStep(steps[i]);const show=page.locator('#pm7-guided-tour [data-tour-action="show"]');
    if(await show.count())await show.click();else await page.locator('#pm7-guided-tour [data-tour-action="continue"]').click();
    await waitStep(steps[i+1]);
  }
  const state=await snap();assert.equal(state.planning_edited,true);assert.equal(state.work_started,false);
  assert.equal(state.effect_receipts.filter(row=>row.local_action_result?.predicate_verified).length,state.meaningful_action_count);
}
try{
  await fresh();
  await check('Finish cannot bypass the practice or terminal step',async()=>{
    await page.evaluate(()=>window.PM7_GUIDED_TOUR.start());const state=await page.evaluate(()=>window.PM7_GUIDED_TOUR.finish());
    assert.equal(state.completed,false);assert.equal(state.open,true);assert.match(state.last_error,/Finish the practice/);
  });
  await fresh();
  await check('missing provider/usage telemetry is not certified as zero',async()=>{
    await page.evaluate(()=>window.PM7_GUIDED_TOUR.start());const state=await snap();
    assert.equal(state.provider_request_delta,null);assert.equal(state.usage_delta,null);assert.equal(state.zero_provider_verified,false);assert.equal(state.zero_usage_verified,false);
  });
  await fresh();
  await check('semantic resize rejects stale/foreign values and rolls back a failed save',async()=>{
    const result=await page.evaluate(()=>{
      const api=window.PM_HOME_WORKSPACE,id='chat',before=api.layout,revision=before.layout_revision,beforeSemantic=window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot(),stored=localStorage.getItem(api.storage_key);
      const stale=api.resizeSurface(id,{width_px:390,expected_layout_revision:revision-1});
      const foreign=api.resizeSurface(id,{width_px:390,domain_ref:{},expected_layout_revision:revision});
      const invalid=api.resizeSurface(id,{width_px:Infinity,expected_layout_revision:revision});
      api.failNextPersistenceWrite();const failed=api.resizeSurface(id,{width_px:390,expected_layout_revision:revision});
      const after=api.layout,afterSemantic=window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot(),storageUnchanged=stored===localStorage.getItem(api.storage_key),success=api.resizeSurface(id,{width_px:390,expected_layout_revision:after.layout_revision});
      return {before,after,beforeSemantic,afterSemantic,storageUnchanged,stale,foreign,invalid,failed,success,receipt:api.receipt_log.at(-1)};
    });assert.equal(result.stale.reason,'stale_layout_revision');assert.equal(result.foreign.reason,'invalid_resize_values');assert.equal(result.invalid.reason,'invalid_resize_values');assert.equal(result.failed.ok,false);
    assert.equal(result.after.layout_revision,result.before.layout_revision);assert.deepEqual(result.afterSemantic,result.beforeSemantic);assert.equal(result.storageUnchanged,true);assert.equal(result.success.ok,true);assert.equal(result.receipt.command_id,'cmd.workspace_layout.resize_surface');
  });
  await fresh();
  await check('paused guided Teacher messages never reach ordinary Chat',async()=>{
    await page.evaluate(()=>window.PM7_GUIDED_TOUR.start({step:'tour.chat.teacher.ask'}));
    await page.locator('#pm7-guided-tour [data-ui-action-id="ui.guided_tour.pause"]').click();
    const result=await page.evaluate(()=>window.PM_DEMO.chat.send(window.PM7_GUIDED_TOUR.snapshot().teacher_thread_id,'What is a Project?'));
    assert.equal(result.local_deterministic,true);await page.waitForFunction(()=>!window.PM_DEMO.state.chat.busy);
    assert.equal((await snap()).status,'paused');assert.deepEqual(await page.evaluate(()=>window.__lifecycle.ordinary),[]);
  });
  await check('the actual guided composer keeps slash text local instead of starting web work',async()=>{
    await page.evaluate(()=>{const d=window.PM_DEMO;window.__lifecycle.webCalls=[];d.web.start=(...args)=>{window.__lifecycle.webCalls.push(args);return {ok:true};};});
    const input=page.locator('#chatPanel .pm6-chat-input');await input.fill('/web search example.com');await input.press('Enter');
    await page.waitForFunction(()=>!window.PM_DEMO.state.chat.busy);
    assert.deepEqual(await page.evaluate(()=>window.__lifecycle.webCalls),[]);assert.deepEqual(await page.evaluate(()=>window.__lifecycle.ordinary),[]);
    assert.equal((await snap()).status,'paused');assert.match(await page.locator('#chatPanel .chatHeaderTitle').textContent(),/Guided example/);
  });
  await fresh();
  await check('pause cancels a Teacher stream and fences late chunks and completion',async()=>{
    await page.evaluate(()=>{
      window.PM7_GUIDED_TOUR.start({step:'tour.chat.teacher.ask'});const d=window.PM_DEMO;
      window.__lifecycle.streams=[];d.stream.start=(chunk,html,options)=>{const row={chunk,html,options,cancelled:false};window.__lifecycle.streams.push(row);return {cancel(){row.cancelled=true;options.onDone('stopped');}};};
      d.chat.send(window.PM7_GUIDED_TOUR.snapshot().teacher_thread_id,'What is a Project?');
    });
    await page.locator('#pm7-guided-tour [data-ui-action-id="ui.guided_tour.pause"]').click();
    const before=await snap();assert.equal(before.teacher_message_sent,false);
    const after=await page.evaluate(()=>{
      const row=window.__lifecycle.streams[0],d=window.PM_DEMO,id=window.PM7_GUIDED_TOUR.snapshot().teacher_thread_id,count=d.state.chat.threads[id].messages.length;
      row.chunk('STALE CHUNK');row.options.onDone('done');return {cancelled:row.cancelled,count,same_count:count===d.state.chat.threads[id].messages.length,busy:d.state.chat.busy,state:window.PM7_GUIDED_TOUR.snapshot()};
    });assert.equal(after.cancelled,true);assert.equal(after.same_count,true);assert.equal(after.busy,false);assert.equal(after.state.teacher_message_sent,false);assert.equal(after.state.status,'paused');
    await page.locator('#pm7-guided-tour-resume').click();assert.equal((await snap()).step_id,before.step_id);
    assert.equal((await snap()).teacher_message_sent,false);
    const restarted=await page.evaluate(()=>{
      const row=window.__lifecycle.streams[0],state=window.PM7_GUIDED_TOUR.replay();row.chunk('STALE AFTER REPLAY');row.options.onDone('done');
      return {started:state.step_id,current:window.PM7_GUIDED_TOUR.snapshot(),busy:window.PM_DEMO.state.chat.busy};
    });assert.equal(restarted.started,'tour.intro.comfort');assert.equal(restarted.current.teacher_message_sent,false);assert.equal(restarted.busy,false);
  });
  await check('the local guard still delegates unrelated threads to their original handler',async()=>{
    const observed=await page.evaluate(()=>{
      window.__lifecycle.ordinaryReturnOnly=true;const id=window.__lifecycle.initialThread,result=window.PM_DEMO.chat.send(id,'Unrelated thread probe');
      return {id,result,calls:window.__lifecycle.ordinary};
    });assert.equal(observed.result.ordinary_sentinel,true);assert.deepEqual(observed.calls,[observed.id]);
  });
  await fresh();
  await check('a stale Teacher completion cannot clear a replacement stream',async()=>{
    const result=await page.evaluate(()=>{
      window.PM7_GUIDED_TOUR.start({step:'tour.chat.teacher.ask'});const d=window.PM_DEMO;let old;
      d.stream.start=(chunk,html,options)=>{old=options;return {cancel(){options.onDone('stopped');}};};
      d.chat.send(window.PM7_GUIDED_TOUR.snapshot().teacher_thread_id,'What is a Project?');
      const replacement={cancel(){}};d.state.chat.activeStream=replacement;d.state.chat.busy=true;old.onDone('done');
      return {busy:d.state.chat.busy,replacement_preserved:d.state.chat.activeStream===replacement,state:window.PM7_GUIDED_TOUR.snapshot()};
    });assert.equal(result.busy,true);assert.equal(result.replacement_preserved,true);assert.equal(result.state.teacher_message_sent,false);
  });
  await fresh();
  await check('full Show Me journey restores by default and leaves the real Wizard',async()=>{
    await runToBoundary();assert.equal(await page.locator('[data-tour-keep-layout]').isChecked(),false);
    const screenshot=join(out,'finish-choice.png');await page.screenshot({path:screenshot});report.finish_screenshot=screenshot;
    await page.locator('#pm7-guided-tour [data-tour-action="finish"]').click();
    const state=await snap();report.default_finish=state;
    assert.equal(state.status,'completed',JSON.stringify(state.last_result));assert.equal(state.layout_disposition,'restored');assert.equal(state.layout_snapshot_restored,true);
    assert.equal(await page.locator('#pm7gt-planning-practice').count(),0);assert.equal(await page.evaluate(()=>window.PM_PAGES.current),'wizard');
    await page.waitForFunction(()=>document.activeElement===document.getElementById('panel-wizard'));
    assert.equal(await page.locator('#panel-wizard').getAttribute('aria-label'),'Planning Wizard');
    assert.deepEqual(await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot()),await page.evaluate(()=>window.__lifecycle.initialLayout));
    assert.equal(await page.evaluate(()=>window.PM_DEMO.state.chat.activeThread),await page.evaluate(()=>window.__lifecycle.initialThread));
    assert.equal(state.work_started,false);assert.deepEqual(await page.evaluate(()=>window.__lifecycle.ordinary),[]);
  });
  await check('retained Teacher thread stays local after completion and replay',async()=>{
    const id=(await snap()).teacher_thread_id;
    let result=await page.evaluate(id=>window.PM_DEMO.chat.send(id,'What is Safe History?'),id);assert.equal(result.local_deterministic,true);await page.waitForFunction(()=>!window.PM_DEMO.state.chat.busy);
    await page.evaluate(()=>window.PM7_GUIDED_TOUR.replay());
    result=await page.evaluate(id=>window.PM_DEMO.chat.send(id,'What is a Project?'),id);assert.equal(result.local_deterministic,true);await page.waitForFunction(()=>!window.PM_DEMO.state.chat.busy);
    assert.equal((await snap()).step_id,'tour.intro.comfort');assert.equal((await snap()).teacher_message_sent,false);assert.deepEqual(await page.evaluate(()=>window.__lifecycle.ordinary),[]);
  });
  await fresh();
  await check('explicit Keep preserves the demonstrated layout but clears practice',async()=>{
    await runToBoundary();const changed=await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot());assert.notDeepEqual(changed,await page.evaluate(()=>window.__lifecycle.initialLayout));
    await page.locator('[data-tour-keep-layout]').check();await page.locator('#pm7-guided-tour [data-tour-action="finish"]').click();
    const state=await snap();assert.equal(state.completed,true,JSON.stringify(state.last_result));assert.equal(state.layout_disposition,'kept');assert.equal(state.layout_snapshot_restored,false);
    assert.deepEqual(await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot()),changed);assert.equal(await page.locator('#pm7gt-planning-practice').count(),0);
  });
  await fresh();
  await check('restore failure stays unfinished and can retry without a new baseline',async()=>{
    await runToBoundary();await page.evaluate(()=>{const api=window.PM_HOME_WORKSPACE;window.__lifecycle.move=api.moveSurface;api.moveSurface=()=>({ok:false});});
    await page.locator('#pm7-guided-tour [data-tour-action="finish"]').click();
    let state=await snap();assert.equal(state.status,'recovery_required');assert.equal(state.completed,false);assert.equal(state.open,true);assert.equal(state.last_result.status,'failed');
    await page.evaluate(()=>{window.PM_HOME_WORKSPACE.moveSurface=window.__lifecycle.move;});
    await page.locator('#pm7-guided-tour [data-tour-action="finish"]').click();
    state=await snap();assert.equal(state.completed,true,JSON.stringify(state.last_result));assert.equal(state.layout_snapshot_restored,true);
    assert.deepEqual(await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot()),await page.evaluate(()=>window.__lifecycle.initialLayout));
  });
  await check('no ordinary Chat dispatch, external request, or page error in the scoped journeys',()=>{assert.deepEqual(report.requests,[]);assert.deepEqual(report.errors,[]);});
  assert.equal(report.artifact_sha256,sha(readFileSync(artifact)));report.pass=true;
}catch(error){report.pass=false;report.failure=String(error.stack||error);console.error(report.failure);if(page)try{report.failure_state=await snap();await page.screenshot({path:join(out,'failure.png')});}catch{}}
finally{writeFileSync(join(out,'guided-tour-lifecycle-checkpoint.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
if(!report.pass)process.exitCode=1;
