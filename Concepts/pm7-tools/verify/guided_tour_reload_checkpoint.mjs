/* Fail-closed browser-concept reload checks, NOT durable recovery certification.
 * node guided_tour_reload_checkpoint.mjs <artifact> <out> <modules> <chrome>
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
const {chromium}=require('playwright-core'),sha=value=>createHash('sha256').update(value).digest('hex');
const key='pm7:guided-tour:checkpoint:v3',revision='newbie-first-chat-workspace-planning-2026-09-04';
mkdirSync(out,{recursive:true});writeFileSync(join(out,'verifier.mjs'),readFileSync(fileURLToPath(import.meta.url)));
const report={scope:'concept missing-snapshot reload rejection, corrupt/stale markers, no baseline substitution, nonmutating dismissal and same-tab regression; no durable restore, native, provider telemetry, or final visual certification',artifact_sha256:sha(readFileSync(artifact)),verifier_sha256:sha(readFileSync(fileURLToPath(import.meta.url))),checks:[],errors:[],requests:[]};
let browser,context,page,observe=false;
const snap=()=>page.evaluate(()=>window.PM7_GUIDED_TOUR.snapshot());
async function check(name,fn){await fn();report.checks.push({name,pass:true});console.log(`PASS ${name}`);}
async function ready(){
  await page.waitForFunction(()=>window.PM7_GUIDED_TOUR&&window.PM_HOME_WORKSPACE&&window.PM_DEMO);
  const close=page.getByRole('button',{name:'Close onboarding',exact:true});if(await close.isVisible())await close.click();
}
async function fresh(seed=null,unavailable=false){
  observe=false;if(context)await context.close();context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(({seed,key,unavailable})=>{
    if(seed!==null)sessionStorage.setItem(key,seed);
    if(unavailable){const get=Storage.prototype.getItem;Storage.prototype.getItem=function(name){if(this===sessionStorage&&name===key)throw new DOMException('Fixture unavailable','SecurityError');return get.call(this,name);};window.__restoreTourStorage=()=>{Storage.prototype.getItem=get;};}
  },{seed,key,unavailable});
  page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',error=>report.errors.push(error.message));
  page.on('request',request=>{if(observe&&/^https?:/.test(request.url()))report.requests.push({url:request.url(),method:request.method()});});
  await page.route('**/*',route=>/^(file:|data:|blob:)/.test(route.request().url())?route.continue():route.abort());
  await page.goto(pathToFileURL(artifact).href);await ready();observe=true;
}
function assertUnfinished(state){assert.equal(state.status,'recovery_required');assert.equal(state.completed,false);assert.equal(state.skipped,false);assert.equal(state.layout_snapshot_captured,false);assert.equal(state.layout_snapshot_restored,false);assert.equal(state.work_started,false);assert.notEqual(state.layout_disposition,'kept');}
async function assertBlocked(reason){
  const initial=await snap();assertUnfinished(initial);assert.equal(initial.open,false);
  const result=await page.evaluate(key=>{
    const api=window.PM7_GUIDED_TOUR,d=window.PM_DEMO,storage=()=>JSON.stringify([localStorage,sessionStorage].map(store=>Object.keys(store).sort().map(name=>[name,store.getItem(name)])));
    const owner=()=>JSON.stringify({layout:api.target_adapter.layoutSnapshot(),chat:d.state.chat,persona:[...document.querySelectorAll('#chatPanel .persona-label,#floatingChat .persona-label')].map(el=>el.textContent),draft:[...document.querySelectorAll('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input')].map(el=>[el.value,el.getAttribute('placeholder')]),page:window.PM_PAGES.current});
    const before=owner(),stored=storage(),raw=sessionStorage.getItem(key),ownerReceipts=window.PM_HOME_WORKSPACE.receipt_log.length;
    const writes=[],events=[],sends=[];const set=Storage.prototype.setItem,remove=Storage.prototype.removeItem,send=d.chat.send;
    Storage.prototype.setItem=function(...args){writes.push(['set',args[0]]);return set.apply(this,args);};Storage.prototype.removeItem=function(...args){writes.push(['remove',args[0]]);return remove.apply(this,args);};d.chat.send=function(...args){sends.push(args[0]);return send.apply(this,args);};
    const listener=event=>events.push(event.detail.action_id);window.addEventListener('pm7.guided-tour.owner-action',listener);
    try{
      const captured=api.target_adapter.captureOriginal(),states=[api.resume(),api.start({step:'tour.planning.goal'}),api.replay({step:'tour.chat.teacher.ask'}),api.next(),api.back(),api.finish(),api.skip()],action=api.target_adapter.perform('ui.guided_tour.show_me');
      return {captured,states:states.map(state=>({status:state.status,step_id:state.step_id,completed:state.completed,skipped:state.skipped,layout_snapshot_captured:state.layout_snapshot_captured,layout_snapshot_restored:state.layout_snapshot_restored,work_started:state.work_started,layout_disposition:state.layout_disposition,last_result:state.last_result})),action,writes,events,sends,ownerUnchanged:before===owner(),storageUnchanged:stored===storage(),rawUnchanged:raw===sessionStorage.getItem(key),receiptDelta:window.PM_HOME_WORKSPACE.receipt_log.length-ownerReceipts,practiceCount:document.querySelectorAll('#pm7gt-planning-practice').length};
    }finally{Storage.prototype.setItem=set;Storage.prototype.removeItem=remove;d.chat.send=send;window.removeEventListener('pm7.guided-tour.owner-action',listener);}
  },key);
  assert.equal(result.captured,null);result.states.forEach(state=>{assertUnfinished(state);assert.equal(state.step_id,initial.step_id);assert.equal(state.last_result.status,'disabled');assert.equal(state.last_result.disabled_reason,reason);assert.equal(state.last_result.owner_action_dispatched,false);});
  assert.equal(result.action.status,'disabled');assert.equal(result.action.owner_action_dispatched,false);
  assert.equal(result.ownerUnchanged,true);assert.equal(result.storageUnchanged,true);assert.equal(result.rawUnchanged,true);assert.equal(result.receiptDelta,0);assert.equal(result.practiceCount,0);assert.deepEqual(result.writes,[]);assert.deepEqual(result.events,[]);assert.deepEqual(result.sends,[]);
  assert.equal(await page.locator('#pm7-guided-tour [data-tour-action],#pm7-guided-tour [data-tour-keep-layout]').count(),0);
  assert.equal(await page.locator('#pm7-guided-tour [data-ui-action-id="ui.guided_tour.skip"]').isDisabled(),true);
  assert.equal(await page.locator('#pm7gt-eli5').isDisabled(),true);
  await page.getByRole('button',{name:'Close message',exact:true}).click();assertUnfinished(await snap());assert.equal((await snap()).open,false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'pm7-guided-tour-resume');
  await page.getByRole('button',{name:'Review tour recovery',exact:true}).click();await page.keyboard.press('Escape');assertUnfinished(await snap());assert.equal((await snap()).open,false);
}
const marker=overrides=>JSON.stringify({schema_id:'pm.guided_tour.safe_checkpoint.v1',storyboard_revision:revision,concept_simulation_only:true,resume_requires_live_snapshot:true,step_id:'tour.workspace.chat.dock',eli5_enabled:false,status:'paused',source:'reload-fixture',...overrides});
try{
  browser=await chromium.launch({executablePath:chrome,headless:true});
  await fresh();
  await check('read-only snapshot inspection and Resume cannot start an untouched tour',async()=>{
    const before=await snap();assert.equal(before.status,'first_launch');assert.equal(await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.captureOriginal()),null);
    const after=await page.evaluate(()=>window.PM7_GUIDED_TOUR.resume());assert.equal(after.status,'first_launch');assert.equal(after.layout_snapshot_captured,false);assert.equal(after.open,false);assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),key),null);
  });
  await check('same-tab pause/resume preserves the original snapshot and Skip restores it',async()=>{
    const original=await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot());
    await page.evaluate(()=>window.PM7_GUIDED_TOUR.start({step:'tour.workspace.chat.dock'}));
    const captured=await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.captureOriginal());assert.deepEqual(captured,original);
    await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.perform('ui.guided_tour.show_me'));
    assert.notDeepEqual(await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot()),captured);
    await page.evaluate(()=>window.PM7_GUIDED_TOUR.pause());const resumed=await page.evaluate(()=>window.PM7_GUIDED_TOUR.resume());assert.equal(resumed.status,'demonstrating');assert.equal(resumed.layout_snapshot_captured,true);
    assert.deepEqual(await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.captureOriginal()),captured);
    const ended=await page.evaluate(()=>window.PM7_GUIDED_TOUR.skip());assert.equal(ended.skipped,true);assert.equal(ended.layout_snapshot_restored,true);assert.deepEqual(await page.evaluate(()=>window.PM7_GUIDED_TOUR.target_adapter.layoutSnapshot()),original);assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),key),null);
  });
  await fresh();
  await check('pause before the predicate poll does not erase an applied move or replay it',async()=>{
    const result=await page.evaluate(()=>{
      const api=window.PM7_GUIDED_TOUR,workspace=window.PM_HOME_WORKSPACE;api.start({step:'tour.workspace.chat.dock'});
      document.querySelector('#pm7-guided-tour [data-tour-action="try"]').click();
      const applied=api.target_adapter.perform('ui.guided_tour.show_me');api.pause();
      const before=JSON.stringify(api.target_adapter.layoutSnapshot()),receipts=workspace.receipt_log.length,resumed=api.resume();
      return {applied,resumed,layoutUnchanged:before===JSON.stringify(api.target_adapter.layoutSnapshot()),receiptDelta:workspace.receipt_log.length-receipts};
    });
    assert.equal(result.applied.status,'applied');assert.equal(result.resumed.action_status,'complete');assert.equal(result.resumed.last_result.status,'no_change');assert.equal(result.layoutUnchanged,true);assert.equal(result.receiptDelta,0);
    const ended=await page.evaluate(()=>window.PM7_GUIDED_TOUR.skip());assert.equal(ended.skipped,true);assert.equal(ended.layout_snapshot_restored,true);
  });
  await fresh();
  await check('same-tab Teacher Resume preserves the paused draft and thread',async()=>{
    await page.evaluate(()=>window.PM7_GUIDED_TOUR.start({step:'tour.chat.teacher.ask'}));
    await page.locator('#pm7-guided-tour [data-tour-action="try"]').click();await page.evaluate(()=>window.PM7_GUIDED_TOUR.pause());
    const input=page.locator('#chatPanel .pm6-chat-input');await input.fill('My own unsent practice question');
    const before=await page.evaluate(()=>({active:window.PM_DEMO.state.chat.activeThread,order:window.PM_DEMO.state.chat.order.slice()}));
    await page.locator('#pm7-guided-tour-resume').click();
    assert.equal(await input.inputValue(),'My own unsent practice question');assert.deepEqual(await page.evaluate(()=>({active:window.PM_DEMO.state.chat.activeThread,order:window.PM_DEMO.state.chat.order.slice()})),before);assert.equal((await snap()).teacher_message_sent,false);
  });
  await fresh();
  await check('wrong-thread Resume fences ordinary send and slash shortcuts until Pause',async()=>{
    await page.evaluate(()=>{
      const d=window.PM_DEMO;window.__wrongThread={original:d.state.chat.activeThread,ordinary:[],web:[]};
      d.chat.send=(...args)=>{window.__wrongThread.ordinary.push(args[0]);return {ok:false,ordinary_sentinel:true};};d.web.start=(...args)=>{window.__wrongThread.web.push(args);return {ok:false};};
      window.PM7_GUIDED_TOUR.start({step:'tour.chat.teacher.ask'});window.PM7_GUIDED_TOUR.pause();
      const row=document.querySelector('.chat-thread-item[data-thread="'+window.__wrongThread.original+'"]');if(!row)throw Error('Missing original thread fixture');row.click();
    });
    const input=page.locator('#chatPanel .pm6-chat-input');await input.fill('/web search example.com');await page.locator('#pm7-guided-tour-resume').click();
    assert.equal((await snap()).action_status,'failed');assert.equal(await input.inputValue(),'/web search example.com');
    const blocked=await page.evaluate(()=>window.PM_DEMO.chat.send(window.__wrongThread.original,'practice message'));assert.equal(blocked.provider_dispatch,false);
    await input.press('Enter');assert.equal(await input.inputValue(),'/web search example.com');assert.deepEqual(await page.evaluate(()=>window.__wrongThread.ordinary),[]);assert.deepEqual(await page.evaluate(()=>window.__wrongThread.web),[]);
    await page.getByRole('button',{name:'Pause to switch Chat',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.PM_DEMO.chat.send(window.__wrongThread.original,'ordinary sentinel').ordinary_sentinel),true);assert.equal(await page.evaluate(()=>window.__wrongThread.ordinary.length),1);
  });
  for(const text of ['UNSENT_BROWSER_FIXTURE: a <literal> goal','', '  A draft\nwith whitespace  ']){
    await fresh();
    await check(`Planning pause/resume retains an unsent ${text?'text':'empty'} draft`,async()=>{
      await page.evaluate(()=>window.PM7_GUIDED_TOUR.start({step:'tour.planning.goal'}));const input=page.locator('#pm7gt-planning-practice [data-practice-goal]');await input.fill(text);
      await page.locator('#pm7-guided-tour [data-ui-action-id="ui.guided_tour.pause"]').click();assert.equal(await page.locator('#pm7gt-planning-practice').count(),0);
      const saved=await page.evaluate(key=>sessionStorage.getItem(key),key);assert.equal(saved.includes('UNSENT_BROWSER_FIXTURE'),false);assert.equal(Object.hasOwn(JSON.parse(saved),'planningGoalDraft'),false);
      await page.locator('#pm7-guided-tour-resume').click();assert.equal(await input.inputValue(),text);assert.equal((await snap()).planning_goal,'');assert.equal((await snap()).planning_project_selected,false);assert.equal((await snap()).step_id,'tour.planning.project_source');
      await page.locator('#pm7gt-planning-practice [data-practice-action="project"]').click();assert.equal(await input.inputValue(),text);assert.equal((await snap()).planning_goal,'');
      await page.locator('#pm7gt-planning-practice [data-practice-action="goal"]').click();
      if(text.trim()){assert.equal((await snap()).planning_goal,text.trim());assert.equal(await input.count(),0);}
      else{assert.equal((await snap()).planning_goal,'');assert.equal(await input.inputValue(),'');assert.match(await page.locator('#pm7-guided-tour .pm7gt-reason').textContent(),/Add one sentence/);}
    });
  }
  await fresh();
  await check('Planning Resume leaves the final boundary for an interrupted second edit without replay',async()=>{
    await page.evaluate(()=>window.PM7_GUIDED_TOUR.start({source:'resume-prerequisite-check',step:'planning_wizard'}));
    const steps=['open','project_source','goal','guided_help','requirements','question','why','review','edit','consequence'];
    for(let index=0;index<steps.length-1;index++){
      assert.equal((await snap()).step_id,'tour.planning.'+steps[index]);await page.locator('#pm7-guided-tour [data-tour-action="show"]').click();
      await page.waitForFunction(id=>window.PM7_GUIDED_TOUR.snapshot().step_id===id,'tour.planning.'+steps[index+1]);
    }
    await page.locator('#pm7-guided-tour [data-tour-action="continue"]').click();assert.equal((await snap()).step_id,'tour.planning.approval_boundary');
    await page.locator('#pm7gt-planning-practice [data-practice-action="edit"]').click();const before=await snap();assert.equal(before.planning_edited,false);assert.equal(before.planning_answer,'me');
    await page.locator('#pm7-guided-tour [data-ui-action-id="ui.guided_tour.pause"]').click();await page.locator('#pm7-guided-tour-resume').click();
    const resumed=await snap();assert.equal(resumed.step_id,'tour.planning.edit');assert.equal(resumed.action_status,'idle');assert.equal(resumed.planning_answer,before.planning_answer);assert.equal(resumed.planning_goal,before.planning_goal);assert.equal(resumed.effect_receipts.length,before.effect_receipts.length);assert.equal(resumed.work_started,false);
    assert.equal(await page.locator('#pm7gt-planning-practice [data-practice-value="me"]').isDisabled(),true);assert.equal(await page.locator('#pm7-guided-tour [data-tour-action="finish"]').count(),0);
    await page.locator('#pm7-guided-tour [data-tour-action="try"]').click();await page.locator('#pm7gt-planning-practice [data-practice-action="answer"][data-practice-value="organizers"]').click();
    await page.waitForFunction(()=>window.PM7_GUIDED_TOUR.snapshot().step_id==='tour.planning.consequence');assert.equal((await snap()).planning_answer,'organizers');assert.equal(await page.locator('[data-tour-fixture-id="planning-shared-access"]').getAttribute('data-consequence-revision'),'2');
  });
  for(const paused of [true,false]){
    await fresh();
    await check(`${paused?'paused':'active'} tour reload cannot replace the original snapshot or dispatch work`,async()=>{
      await page.evaluate(paused=>{const api=window.PM7_GUIDED_TOUR;api.start({step:'tour.workspace.chat.dock'});api.target_adapter.perform('ui.guided_tour.show_me');if(paused)api.pause();},paused);
      const raw=await page.evaluate(key=>sessionStorage.getItem(key),key);assert.equal(JSON.parse(raw).resume_requires_live_snapshot,true);
      await page.reload();await ready();await assertBlocked('missing_original_snapshots');
      assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),key),raw);
      await page.reload();await ready();assertUnfinished(await snap());assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),key),raw);
    });
  }
  const cases=[
    ['legacy marker',JSON.stringify({schema_id:'pm.guided_tour.safe_checkpoint.v1',step_id:'tour.chat.teacher.ask',eli5_enabled:true,status:'paused',source:'old-preview'}),'legacy_checkpoint'],
    ['prior restoration failure',marker({status:'recovery_required'}),'missing_original_snapshots'],
    ['truncated JSON','{"schema_id":','invalid_checkpoint'],
    ['stored null','null','invalid_checkpoint'],
    ['stored array','[]','invalid_checkpoint'],
    ['empty marker','','invalid_checkpoint'],
    ['unknown story revision',marker({storyboard_revision:'retired-story'}),'stale_checkpoint'],
    ['unknown step',marker({step_id:'tour.retired.step'}),'invalid_checkpoint'],
    ['prototype step',marker({step_id:'__proto__'}),'invalid_checkpoint'],
    ['coerced step',marker({step_id:['tour.workspace.chat.dock']}),'invalid_checkpoint'],
    ['invalid explanation mode',marker({eli5_enabled:'false'}),'invalid_checkpoint'],
    ['false completed status',marker({status:'completed'}),'invalid_checkpoint'],
    ['unknown payload field',marker({raw_chat:'fixture-only forbidden content'}),'invalid_checkpoint'],
    ['oversized marker','x'.repeat(2049),'invalid_checkpoint'],
    ['wrong schema',marker({schema_id:'pm.guided_tour.checkpoint.v3'}),'invalid_checkpoint'],
    ['false live-snapshot claim',marker({resume_requires_live_snapshot:false}),'stale_checkpoint']
  ];
  for(const [name,raw,reason] of cases){await fresh(raw);await check(`${name} is preserved and fails closed`,()=>assertBlocked(reason));}
  await fresh(null,true);
  await check('unreadable checkpoint storage does not silently become an empty session',async()=>{await page.evaluate(()=>window.__restoreTourStorage());await assertBlocked('storage_unavailable');});
  await fresh(marker({}));
  await check('recovery explanation stays keyboard-dismissable at a constrained width',async()=>{
    await page.setViewportSize({width:390,height:700});await page.getByRole('button',{name:'Review tour recovery',exact:true}).click();
    const bounds=await page.locator('#pm7-guided-tour .pm7gt-callout').boundingBox();assert.ok(bounds.x>=-1&&bounds.y>=-1&&bounds.x+bounds.width<=391&&bounds.y+bounds.height<=701,JSON.stringify(bounds));
    await page.keyboard.press('Tab');assert.equal(await page.locator('#pm7-guided-tour').evaluate(root=>root.contains(document.activeElement)),true);
    await page.screenshot({path:join(out,'recovery-constrained.png')});await page.keyboard.press('Escape');assert.equal((await snap()).open,false);assertUnfinished(await snap());
    await page.setViewportSize({width:1440,height:960});await page.locator('#tab-settings').click();assert.equal(await page.evaluate(()=>window.PM_PAGES.current),'settings');
  });
  await check('no observed external request or page error in the scoped checks',()=>{assert.deepEqual(report.requests,[]);assert.deepEqual(report.errors,[]);});
  assert.equal(report.artifact_sha256,sha(readFileSync(artifact)));report.pass=true;
}catch(error){report.pass=false;report.execution_status=browser?'failed':'not_run_browser_unavailable';report.failure=String(error.stack||error);console.error(report.failure);if(page)try{report.failure_state=await snap();await page.screenshot({path:join(out,'failure.png')});}catch{}}
finally{writeFileSync(join(out,'guided-tour-reload-checkpoint.json'),JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();}
if(!report.pass)process.exitCode=1;
