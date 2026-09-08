/* Source-extracted Node VM tests. DOM/owners are test doubles, not a browser.
 * node guided_tour_checkpoint_selftest.mjs <built-artifact> [report-path]
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const [artifactArg,reportArg]=process.argv.slice(2);assert.ok(artifactArg,'Pass the exact built artifact.');
const artifact=resolve(artifactArg),bytes=readFileSync(artifact),sha=value=>createHash('sha256').update(value).digest('hex');
const scripts=[...bytes.toString().matchAll(/<script id="pm7-guided-tour-js">([\s\S]*?)<\/script>/g)];assert.equal(scripts.length,1);
const source=scripts[0][1],key='pm7:guided-tour:checkpoint:v3',revision='newbie-first-chat-workspace-planning-2026-09-04';
const report={scope:'source-extracted controller unit tests with DOM/storage/owner doubles; not real browser, durable restore, native, or visual proof',artifact_sha256:sha(bytes),script_sha256:sha(source),verifier_sha256:sha(readFileSync(fileURLToPath(import.meta.url))),checks:[]};
function extract(name){
  const starts=[...source.matchAll(new RegExp('^  function '+name+'\\(','gm'))];assert.equal(starts.length,1,name);
  const start=starts[0].index,rest=source.slice(start),end=rest.slice(1).search(/\n  (?:function |var |root\.|document\.|window\.)/);
  assert.notEqual(end,-1,name);return rest.slice(0,end+1);
}
const functions=['savedCheckpoint','adoptCheckpointRecovery','recoveryBlocked','renderRecovery','localActionResult','persistCheckpoint','clearCheckpoint','start','resume','replay','pause','next','back','finish','performOwnerAction','teacherLessonActive','teacherContextRequired','teacherContextMessage','guidedTeacherTargetReady'];
const extracted=functions.map(extract).join('\n');
const inspection=source.match(/captureOriginal:(function\(\)\{[^\n]+?\})\n/);assert.ok(inspection,'Closed read-only inspection entrypoint.');
function fixture(raw=null,{unavailable=false}={}){
  let stored=raw,blockedRead=unavailable;const writes=[],calls=[],records=[];
  const node=()=>({hidden:true,disabled:false,dataset:{},style:{},innerHTML:'',textContent:'',attributes:{},setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];},focus(){calls.push('focus');}});
  const root=node(),heading=node(),stage=node(),skip=node();root.querySelector=()=>skip;stage.querySelector=()=>heading;
  const state={open:false,status:'first_launch',step_id:'tour.intro.comfort',step_index:0,source:'unknown',eli5_enabled:false,completed:false,skipped:false,layout_disposition:'pending',layout_snapshot_restored:false};
  const steps=[{id:'tour.intro.comfort',index:0,meaningful:false},{id:'tour.workspace.chat.dock',index:1,meaningful:true},{id:'tour.chat.teacher.ask',index:2,meaningful:true},{id:'tour.planning.approval_boundary',index:3,meaningful:false}];
  const context=vm.createContext({state,original:null,checkpointRecovery:null,STEP_BY_ID:Object.fromEntries(steps.map(step=>[step.id,step])),STEP_DEFS:steps,STORYBOARD:{revision},root,stage,heading,skip,callout:node(),resumeButton:node(),replayButton:node(),backButton:node(),eli5Button:node(),halo:node(),pointer:node(),progress:node(),forwardSlot:node(),transitionTimer:0,history:[],effectReceipts:[],uiActionLog:[],receiptSerial:0,sessionSerial:0,meaningful:[],planningFixture:null,teacherPending:null,practiceWidgetId:null,workspacePanelId:null,completedSteps:{},innerWidth:1440,innerHeight:960,
    AUTHORITATIVE_PROMPT:'What happens before Puppet Master changes my files?',guidedThreadIds:Object.create(null),
    document:{documentElement:node()},sessionStorage:{getItem(name){assert.equal(name,key);if(blockedRead)throw Error('fixture-unavailable');return stored;},setItem(name,value){writes.push(['set',name]);stored=value;},removeItem(name){writes.push(['remove',name]);stored=null;}},
    clone:value=>value==null?value:JSON.parse(JSON.stringify(value)),esc:value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'),stageButton:(action,label)=>`<button data-ui-action-id="${action}">${label}</button>`,
    clearTimeout:()=>{},clearAutoAdvance:()=>{},cancelStepPoll:()=>{},clearChoreography:()=>{},stopTargetTracking:()=>{},cancelTeacherTurn:()=>{},removePlanningFixture:()=>{},uninstallTeacherSendAdapter:()=>{},notify:()=>{},positionTarget:()=>{},
    recordUi:(action,payload)=>records.push({action,payload}),captureOriginal:()=>{calls.push('captureOriginal');context.original={semantic:{test:'captured-current'}};return context.original.semantic;},prepareStep:()=>{calls.push('prepareStep');},placeChatRight:()=>{calls.push('placeChatRight');},render:()=>{calls.push('render');},cleanupForExit:()=>{calls.push('cleanupForExit');return {ok:true};}
  });
  vm.runInContext(extracted+'\nfunction inspectOriginal(){return ('+inspection[1]+')();}\nfunction snapshot(){return Object.assign({},state,{layout_snapshot_captured:!!original});}\nfunction stepDef(id){return STEP_BY_ID[id||state.step_id]||STEP_DEFS[0];}\nfunction currentDef(){return stepDef();}',context);
  return {context,writes,calls,records,raw:()=>stored,unblock:()=>{blockedRead=false;},run:code=>vm.runInContext(code,context),value:code=>JSON.parse(JSON.stringify(vm.runInContext(code,context)))};
}
const marker=overrides=>JSON.stringify({schema_id:'pm.guided_tour.safe_checkpoint.v1',storyboard_revision:revision,concept_simulation_only:true,resume_requires_live_snapshot:true,step_id:'tour.workspace.chat.dock',eli5_enabled:false,status:'paused',source:'unit-fixture',...overrides});
function check(name,fn){fn();report.checks.push({name,pass:true});console.log(`PASS ${name}`);}
function expectUnfinished(state){assert.equal(state.status,'recovery_required');assert.equal(state.completed,false);assert.equal(state.skipped,false);assert.equal(state.layout_snapshot_captured,false);assert.equal(state.layout_snapshot_restored,false);assert.notEqual(state.layout_disposition,'kept');assert.equal(state.provider_request_baseline,null);assert.equal(state.usage_baseline,null);assert.equal(state.zero_provider_verified,false);assert.equal(state.zero_usage_verified,false);}
function expectBlocked(f,reason){
  assert.equal(f.run('adoptCheckpointRecovery(savedCheckpoint())'),true);const step=f.context.state.step_id;
  for(const expression of ['resume()','start({step:"tour.planning.approval_boundary"})','replay({step:"tour.chat.teacher.ask"})','next()','back()','finish("complete")','finish("skip")']){
    const result=f.value(expression);expectUnfinished(result);assert.equal(result.step_id,step);assert.equal(result.last_result.status,'disabled');assert.equal(result.last_result.disabled_reason,reason);assert.equal(result.last_result.owner_action_dispatched,false);assert.equal(result.last_result.original_snapshot_replaced,false);
  }
  assert.equal(f.run('inspectOriginal()'),null);const action=f.value('performOwnerAction(currentDef())');assert.equal(action.status,'disabled');assert.equal(action.owner_action_dispatched,false);
  f.run('persistCheckpoint();clearCheckpoint();');assert.deepEqual(f.writes,[]);
  assert.ok(!f.calls.some(name=>['captureOriginal','prepareStep','placeChatRight','cleanupForExit'].includes(name)),JSON.stringify(f.calls));
  assert.match(f.context.stage.innerHTML,/Close message/);assert.doesNotMatch(f.context.stage.innerHTML,/data-tour-keep-layout|data-tour-action|fixture-only forbidden/);assert.equal(f.context.skip.disabled,true);assert.equal(f.context.eli5Button.disabled,true);assert.equal(f.context.backButton.disabled,true);
  const paused=f.value('pause("escape")');expectUnfinished(paused);assert.equal(paused.open,false);assert.equal(f.context.root.hidden,true);assert.equal(f.context.resumeButton.hidden,false);assert.equal(f.context.resumeButton.textContent,'Review tour recovery');
  assert.equal(f.context.state.step_id,step);assert.deepEqual(f.writes,[]);
}
function liveResumeFixture(id='tour.workspace.chat.dock'){
  const f=fixture();
  Object.assign(f.context,{original:{semantic:{test:'initial'}},stepBaseline:{chat:{host:'dock_left',slot_index:0}},
    currentChat:{host:'dock_right',slot_index:0},practiceWidgetId:'retained-widget',workspacePanelId:'retained-panel',
    window:{PM7_USAGE:{state:{room:'usage',hidden:{}},rerender:()=>f.calls.push('rerenderUsage'),layoutFor:()=>({cols:4,rows:2})},PM_DEMO:{state:{chat:{activeThread:'guided-thread',threads:{'guided-thread':{guided_example:true},ordinary:{guided_example:false}}}},chat:{send:()=>{f.calls.push('ordinarySend');return {ordinary_sentinel:true};}}}},
    syncCompatibility:()=>{},mountedTarget:()=>null,stepTargetSelector:()=>'',setTimeout:()=>1,
    chatSurfaceRecord:()=>f.context.currentChat,goPage:()=>f.calls.push('routeView'),closeTeacherPicker:()=>{},
    installTeacherSendAdapter:()=>f.calls.push('installTeacherSendAdapter'),setTeacherPlaceholder:()=>f.calls.push('setTeacherPlaceholder'),selectPersona:()=>f.calls.push('selectPersona'),prepareTeacherPractice:()=>f.calls.push('prepareTeacherPractice'),fillTeacherQuestion:()=>f.calls.push('fillTeacherQuestion'),
    chooseUsageWidget:()=>{f.calls.push('chooseUsageWidget');return {id:'new-widget'};},usageWidgetReady:()=>false,
    ensurePlanningFixture:()=>f.calls.push('ensurePlanningFixture'),renderPlanningFixture:()=>f.calls.push('renderPlanningFixture'),
    updateCounterDeltas:()=>{f.context.state.provider_request_delta=null;f.context.state.usage_delta=null;},
    completeStep:(status,metadata)=>{f.calls.push('completeStep');f.context.completion={status,metadata};f.context.state.action_status='complete';return {...f.context.state};},
    watchCurrentPredicate:()=>f.calls.push('watchCurrentPredicate')
  });
  f.context.guidedThreadIds['guided-thread']=true;
  f.context.STEP_BY_ID[id]={id,index:1,meaningful:true};Object.assign(f.context.state,{status:'paused',step_id:id,step_index:1,action_status:'watching',action_mode:'show_me',teacher_thread_id:'guided-thread'});
  f.run(['prepareStep','stepIsComplete','stepPredicate','chatMoved','planningPredicate'].map(extract).join('\n'));
  return f;
}
function draftFixture(text='My unsent practice goal'){
  const f=fixture(),input={value:text};
  Object.assign(f.context,{BOOK_CLUB_GOAL:'Create the practice book-club website.',BOOK_CLUB_OUTCOMES:[],WHY_COPY:'Practice reason',planningGoalDraft:null,original:{semantic:{test:'initial'}},
    practiceRoot:{isConnected:true,querySelector:()=>input,remove(){this.isConnected=false;}},
    renderPlanningFixture:()=>f.calls.push('renderPlanningFixture'),ownerActionEvent:()=>f.calls.push('ownerActionEvent'),scheduleTargetTracking:()=>{},layoutNow:()=>({}),receipt:()=>{},originalFocus:()=>{}
  });
  f.context.document.getElementById=()=>({classList:{remove:()=>{}}});
  f.context.STEP_BY_ID['tour.planning.goal']={id:'tour.planning.goal',index:1,meaningful:true};Object.assign(f.context.state,{step_id:'tour.planning.goal',step_index:1,open:true,status:'demonstrating',planning_goal:'',planning_project_selected:false});
  const names=['createGuidedPlanningPractice','freshPlanningFixture','practiceButton','planningFixtureMarkup','removePlanningFixture','planningAction','esc'];
  if(source.includes('  function capturePlanningGoalDraft('))names.push('capturePlanningGoalDraft');
  f.run(names.map(extract).join('\n'));
  f.run('var practiceModel=createGuidedPlanningPractice({goal:BOOK_CLUB_GOAL});planningFixture=freshPlanningFixture();');
  return {...f,input,markupGoal:()=>{const match=f.run('planningFixtureMarkup()').match(/<textarea\b[^>]*>([\s\S]*?)<\/textarea>/);return match?.[1]??null;}};
}
try{
  check('an absent marker differs from invalid or unreadable storage',()=>{const f=fixture();assert.equal(f.value('savedCheckpoint()').kind,'absent');assert.equal(f.run('adoptCheckpointRecovery(savedCheckpoint())'),false);assert.equal(f.context.state.status,'first_launch');});
  check('inspection and Resume cannot start an untouched tour',()=>{const f=fixture();assert.equal(f.run('inspectOriginal()'),null);assert.equal(f.value('resume()').status,'first_launch');assert.deepEqual(f.calls,[]);assert.deepEqual(f.writes,[]);});
  check('an explicit fresh Start can still capture exactly one original snapshot',()=>{const f=fixture();const started=f.value('start()');assert.equal(started.status,'demonstrating');assert.equal(started.layout_snapshot_captured,true);assert.equal(started.open,true);assert.equal(f.calls.filter(name=>name==='captureOriginal').length,1);assert.deepEqual(f.value('inspectOriginal()'),{test:'captured-current'});assert.equal(f.calls.filter(name=>name==='captureOriginal').length,1);});
  const cases=[
    ['valid paused marker',marker({}),'missing_original_snapshots'],
    ['valid active marker',marker({status:'demonstrating'}),'missing_original_snapshots'],
    ['prior restoration failure',marker({status:'recovery_required'}),'missing_original_snapshots'],
    ['legacy marker',JSON.stringify({schema_id:'pm.guided_tour.safe_checkpoint.v1',step_id:'tour.chat.teacher.ask',eli5_enabled:true,status:'paused',source:'old-preview'}),'legacy_checkpoint'],
    ['truncated JSON','{"schema_id":','invalid_checkpoint'],['stored null','null','invalid_checkpoint'],['array','[]','invalid_checkpoint'],['empty string','','invalid_checkpoint'],
    ['stale story',marker({storyboard_revision:'retired'}),'stale_checkpoint'],['unknown step',marker({step_id:'retired'}),'invalid_checkpoint'],['prototype step',marker({step_id:'__proto__'}),'invalid_checkpoint'],['coerced step',marker({step_id:['tour.workspace.chat.dock']}),'invalid_checkpoint'],
    ['wrong boolean',marker({eli5_enabled:'false'}),'invalid_checkpoint'],['terminal status',marker({status:'completed'}),'invalid_checkpoint'],['unknown payload',marker({raw_chat:'fixture-only forbidden content'}),'invalid_checkpoint'],['oversized marker','x'.repeat(2049),'invalid_checkpoint'],
    ['wrong schema',marker({schema_id:'pm.guided_tour.checkpoint.v3'}),'invalid_checkpoint'],['missing live-snapshot requirement',marker({resume_requires_live_snapshot:false}),'stale_checkpoint'],['too-long source',marker({source:'x'.repeat(121)}),'invalid_checkpoint']
  ];
  for(const [name,raw,reason] of cases)check(`${name}: all entrypoints reject without a baseline or owner mutation`,()=>{const f=fixture(raw);expectBlocked(f,reason);assert.equal(f.raw(),raw);});
  check('storage failure remains guarded even if a later read becomes available',()=>{const f=fixture(null,{unavailable:true});expectBlocked(f,'storage_unavailable');f.unblock();expectUnfinished(f.value('start()'));assert.deepEqual(f.writes,[]);assert.ok(!f.calls.includes('captureOriginal'));});
  check('start rechecks a marker inserted after first-launch inspection',()=>{const f=fixture(marker({}));expectUnfinished(f.value('start()'));assert.ok(!f.calls.includes('captureOriginal'));assert.deepEqual(f.writes,[]);});
  check('same-tab Resume uses the retained original without recapturing or cleanup',()=>{const f=fixture(marker({}));f.run('original={semantic:{test:"initial"}};state.status="paused";');const result=f.value('resume()');assert.equal(result.status,'demonstrating');assert.equal(result.layout_snapshot_captured,true);assert.deepEqual(f.value('inspectOriginal()'),{test:'initial'});assert.deepEqual(f.calls,['prepareStep','render']);assert.deepEqual(f.writes,[]);});
  check('terminal Resume cannot reopen a completed session',()=>{const f=fixture();f.run('original={semantic:{test:"initial"}};state.status="completed";state.completed=true;');assert.equal(f.value('resume()').status,'completed');assert.deepEqual(f.calls,[]);});
  check('a new marker is bounded and explicitly cannot substitute for owner snapshots',()=>{const f=fixture();f.run('state.status="paused";state.source="x".repeat(180);persistCheckpoint();');const saved=JSON.parse(f.raw());assert.equal(saved.storyboard_revision,revision);assert.equal(saved.concept_simulation_only,true);assert.equal(saved.resume_requires_live_snapshot,true);assert.equal(saved.source.length,120);assert.equal(Object.hasOwn(saved,'raw_chat'),false);assert.equal(f.value('savedCheckpoint()').kind,'missing_original_snapshots');});
  check('terminal cleanup can remove a marker only with no recovery lock',()=>{const f=fixture(marker({}));f.run('clearCheckpoint()');assert.equal(f.raw(),null);assert.deepEqual(f.writes,[['remove',key]]);});
  check('same-step Resume preserves the action baseline and acknowledges an already-applied move',()=>{
    const f=liveResumeFixture(),before=f.value('stepBaseline');f.run('resume()');assert.deepEqual(f.value('stepBaseline'),before);assert.equal(f.context.completion?.status,'no_change');assert.equal(f.context.completion.metadata.resume_revalidated,true);assert.equal(f.context.completion.metadata.provider_request_delta,null);assert.equal(f.context.completion.metadata.usage_delta,null);assert.ok(!f.calls.includes('watchCurrentPredicate'));assert.ok(!f.calls.includes('placeChatRight'));assert.ok(!f.calls.includes('captureOriginal'));
  });
  check('Resume waits for an unapplied action without restarting Show Me choreography',()=>{
    const f=liveResumeFixture();f.context.currentChat={host:'dock_left',slot_index:0};f.run('resume()');assert.equal(f.context.completion,undefined);assert.equal(f.context.state.action_status,'watching');assert.equal(f.context.state.action_mode,'try');assert.equal(f.calls.filter(name=>name==='watchCurrentPredicate').length,1);assert.ok(!f.calls.includes('placeChatRight'));assert.ok(!f.calls.includes('captureOriginal'));
  });
  check('Teacher Resume does not redock, reselect, recreate a thread, or replace the draft',()=>{
    const f=liveResumeFixture('tour.chat.teacher.ask');f.context.state.teacher_message_sent=false;f.run('resume()');assert.deepEqual(f.calls,['render','watchCurrentPredicate']);assert.equal(f.context.state.action_status,'watching');
  });
  check('widget Resume retains its widget identity and original comparison geometry',()=>{
    const f=liveResumeFixture('tour.workspace.widget.manage');f.context.stepBaseline={widget:{id:'retained-widget',cols:2,rows:2,hidden:false}};const before=f.value('stepBaseline');f.run('resume()');assert.deepEqual(f.value('stepBaseline'),before);assert.equal(f.context.practiceWidgetId,'retained-widget');assert.ok(!f.calls.includes('chooseUsageWidget'));assert.equal(f.context.completion,undefined);assert.equal(f.calls.filter(name=>name==='watchCurrentPredicate').length,1);
  });
  check('Planning Resume remounts its retained fixture and credits an already-observed edit once',()=>{
    const f=liveResumeFixture('tour.planning.edit');const retained={edited:true,editing:false,answer:'me',consequence_revision:2};f.context.planningFixture=retained;f.run('resume()');assert.equal(f.context.planningFixture,retained);assert.equal(f.context.completion?.status,'no_change');assert.equal(f.calls.filter(name=>name==='ensurePlanningFixture').length,1);assert.equal(f.calls.filter(name=>name==='renderPlanningFixture').length,1);assert.ok(!f.calls.includes('watchCurrentPredicate'));
  });
  check('an unavailable resume predicate is not completed or replayed',()=>{
    const f=liveResumeFixture();f.context.chatSurfaceRecord=()=>{throw Error('fixture-owner-unavailable');};f.run('resume()');assert.equal(f.context.completion,undefined);assert.equal(f.context.state.action_status,'failed');assert.match(f.context.state.last_error,/could not recheck/);assert.doesNotMatch(f.context.state.last_error,/fixture-owner-unavailable/);assert.ok(!f.calls.includes('watchCurrentPredicate'));assert.ok(!f.calls.includes('placeChatRight'));assert.ok(!f.calls.includes('captureOriginal'));
  });
  for(const deltas of [{provider_request_delta:null,usage_delta:null},{provider_request_delta:2,usage_delta:3}])check(`predicate receipts retain measured deltas ${JSON.stringify(deltas)}`,()=>{
    const f=liveResumeFixture();f.context.state.open=true;f.context.updateCounterDeltas=()=>Object.assign(f.context.state,deltas);f.context.setInterval=()=>1;f.context.setTimeout=fn=>{fn();return 1;};f.run(extract('watchCurrentPredicate'));f.run('watchCurrentPredicate()');assert.equal(f.context.completion.status,'applied');assert.equal(f.context.completion.metadata.provider_request_delta,deltas.provider_request_delta);assert.equal(f.context.completion.metadata.usage_delta,deltas.usage_delta);
  });
  check('resuming into an ordinary thread cannot reuse a stale Teacher completion or dispatch Show Me',()=>{
    const f=liveResumeFixture('tour.chat.teacher.ask');f.context.window.PM_DEMO.state.chat.activeThread='ordinary';f.context.state.teacher_message_sent=true;f.run('resume()');assert.equal(f.context.completion,undefined);assert.equal(f.context.state.action_status,'failed');assert.match(f.context.state.last_error,/Guided example/);assert.equal(f.run('stepPredicate(state.step_id)'),false);assert.equal(f.value('performOwnerAction(currentDef())').owner_action_dispatched,false);f.run(extract('stepTargetSelector'));assert.equal(f.run('stepTargetSelector(state.step_id)'),'');assert.deepEqual(f.calls,['render']);
  });
  check('a missing or unowned guided thread is not accepted as the current Teacher context',()=>{
    const f=liveResumeFixture('tour.chat.teacher.ask');assert.equal(f.run('guidedTeacherTargetReady()'),true);f.context.window.PM_DEMO.state.chat.threads['guided-thread'].guided_example=false;assert.equal(f.run('guidedTeacherTargetReady()'),false);f.context.window.PM_DEMO.state.chat.threads['guided-thread'].guided_example=true;delete f.context.guidedThreadIds['guided-thread'];assert.equal(f.run('guidedTeacherTargetReady()'),false);delete f.context.window.PM_DEMO.state.chat.threads['guided-thread'];assert.equal(f.run('guidedTeacherTargetReady()'),false);
  });
  check('ordinary Chat dispatch is blocked during Teacher but delegates while paused or in another chapter',()=>{
    const f=liveResumeFixture('tour.chat.teacher.ask');f.context.teacherOriginalSend=null;f.context.state.open=true;f.run(extract('installTeacherSendAdapter'));assert.equal(f.run('installTeacherSendAdapter()'),true);const blocked=f.value('window.PM_DEMO.chat.send("ordinary","practice text")');assert.equal(blocked.ok,false);assert.equal(blocked.provider_dispatch,false);assert.deepEqual(f.calls,[]);f.context.state.open=false;assert.equal(f.value('window.PM_DEMO.chat.send("ordinary","ordinary text")').ordinary_sentinel,true);f.context.state.open=true;f.context.state.step_id='tour.workspace.chat.dock';assert.equal(f.value('window.PM_DEMO.chat.send("ordinary","ordinary text")').ordinary_sentinel,true);assert.deepEqual(f.calls,['ordinarySend','ordinarySend']);
  });
  check('the composer cancels ordinary slash/Enter dispatch without erasing the draft',()=>{
    const f=liveResumeFixture('tour.chat.teacher.ask');f.context.window.PM_DEMO.state.chat.activeThread='ordinary';f.context.state.open=true;f.run(extract('sendGuidedComposer'));
    const input={value:'/web search example.com',matches:()=>true,closest:()=>({})};f.context.event={type:'keydown',key:'Enter',target:input,preventDefault:()=>f.calls.push('preventDefault'),stopImmediatePropagation:()=>f.calls.push('stopImmediatePropagation')};f.run('sendGuidedComposer(event)');assert.equal(input.value,'/web search example.com');assert.deepEqual(f.calls,['preventDefault','stopImmediatePropagation','render']);assert.equal(f.context.state.action_status,'failed');
  });
  check('a wrong-thread question cannot replace the draft or dispatch, and ELI5 cannot alter it',()=>{
    const f=liveResumeFixture('tour.chat.teacher.ask');f.context.window.PM_DEMO.state.chat.activeThread='ordinary';f.context.state.open=true;f.context.document.querySelectorAll=()=>{f.calls.push('ordinaryToggleQuery');return [];};f.run(['sendTeacherQuestion','toggleEli5','syncEli5'].map(extract).join('\n'));assert.equal(f.run('sendTeacherQuestion("practice text")'),false);assert.equal(f.run('toggleEli5(true)'),false);f.run('syncEli5()');assert.deepEqual(f.calls,[]);
  });
  for(const switchThread of [false,true])check(`deferred Teacher completion ${switchThread?'rejects a changed thread':'rechecks the active guided thread'}`,()=>{
    const f=liveResumeFixture('tour.chat.teacher.ask'),d=f.context.window.PM_DEMO,thread=d.state.chat.threads['guided-thread'];let settle;
    thread.messages=[];d.emit=()=>{};f.context.state.open=true;f.context.sessionSerial=1;f.context.teacherTurnCurrent=()=>true;f.context.document.querySelector=()=>null;f.context.setTimeout=fn=>{settle=fn;return 1;};
    f.context.pending={session:1,thread:'guided-thread',thread_record:thread,message:'reply-1',step_id:'tour.chat.teacher.ask'};f.run(extract('completeTeacherTurn'));assert.equal(f.run('completeTeacherTurn(window.PM_DEMO,pending,{html:"Local answer",id:"example",copy_mode:"normal"},"done")'),true);assert.equal(typeof settle,'function');
    if(switchThread)d.state.chat.activeThread='ordinary';settle();assert.equal(f.calls.includes('completeStep'),!switchThread);assert.equal(thread.messages.length,1);
  });
  check('causal ablation: removing the restart guard is detected as baseline replacement',()=>{
    const f=fixture(marker({})),safe=extract('start');
    const unsafe=safe.replace(/    if\(checkpointRecovery\|\|\(!original&&adoptCheckpointRecovery\(savedCheckpoint\(\)\)\)\)return recoveryBlocked\([^\n]+\n/,'');assert.notEqual(unsafe,safe);
    f.run(unsafe);assert.throws(()=>expectBlocked(f,'missing_original_snapshots'),/demonstrating|recovery_required/);assert.ok(f.calls.includes('captureOriginal'));
  });
  check('causal ablation: treating corrupt data as absent permits an unsafe fresh Start',()=>{
    const f=fixture('{broken');f.run('function savedCheckpoint(){return {kind:"absent"};}');
    const result=f.value('start()');assert.equal(result.status,'demonstrating');assert.equal(result.layout_snapshot_captured,true);assert.ok(f.calls.includes('captureOriginal'));
  });
  check('pausing preserves an unsent Planning goal without submitting or serializing it',()=>{
    const f=draftFixture('UNSENT_FIXTURE_MARKER: my different goal'),before=f.value('planningFixture');f.run('pause()');assert.equal(f.context.practiceRoot,null);assert.equal(f.markupGoal(),'UNSENT_FIXTURE_MARKER: my different goal');assert.deepEqual(f.value('planningFixture'),before);assert.equal(f.context.state.planning_goal,'');assert.equal(f.context.state.planning_project_selected,false);assert.equal(f.context.state.status,'paused');assert.ok(!f.raw().includes('UNSENT_FIXTURE_MARKER'));assert.deepEqual(f.calls,[]);assert.deepEqual(f.writes,[['set',key]]);
  });
  for(const [name,text,escaped] of [
    ['empty','', ''],
    ['whitespace','  Draft\nsecond line\t  ','  Draft\nsecond line\t  '],
    ['literal markup','A <script> & "quoted" goal','A &lt;script&gt; &amp; &quot;quoted&quot; goal']
  ])check(`${name} Planning draft survives teardown exactly and remains unsubmitted`,()=>{
    const f=draftFixture(text);f.run('removePlanningFixture()');assert.equal(f.markupGoal(),escaped);assert.equal(f.context.planningFixture.goal_submitted,false);assert.equal(f.context.planningFixture.goal,f.context.BOOK_CLUB_GOAL);assert.deepEqual(f.writes,[]);assert.deepEqual(f.calls,[]);
  });
  check('a practice rerender captures the edited goal before making its replacement markup',()=>{
    const f=draftFixture('Text changed before choosing the Project');let markup='';
    f.context.ensurePlanningFixture=()=>({querySelector:()=>null});f.context.document.createElement=()=>({children:[],set innerHTML(value){markup=value;}});f.run(extract('renderPlanningFixture'));assert.equal(f.run('planningAction("project")'),true);assert.ok(markup.includes('Text changed before choosing the Project'));assert.equal(f.context.planningFixture.goal_submitted,false);assert.equal(f.context.state.planning_goal,'');assert.equal(f.context.planningGoalDraft,'Text changed before choosing the Project');assert.deepEqual(f.calls,['ownerActionEvent']);
  });
  check('only explicit valid submission promotes the retained draft to the accepted goal',()=>{
    const f=draftFixture('  The edited practice goal  ');f.run('removePlanningFixture()');assert.equal(f.run('planningAction("goal")'),false);assert.equal(f.context.planningFixture.goal_submitted,false);assert.equal(f.context.planningGoalDraft,'  The edited practice goal  ');
    assert.equal(f.run('planningAction("project")'),true);assert.equal(f.run('planningAction("goal")'),true);assert.equal(f.context.planningFixture.goal,'The edited practice goal');assert.equal(f.context.state.planning_goal,'The edited practice goal');assert.equal(f.context.planningFixture.goal_submitted,true);assert.equal(f.context.planningGoalDraft,null);assert.equal(f.markupGoal(),null);assert.deepEqual(f.writes,[]);
  });
  check('a rejected blank submission remains a blank draft after Pause',()=>{
    const f=draftFixture('   ');assert.equal(f.run('planningAction("project")'),true);assert.equal(f.run('planningAction("goal")'),false);assert.match(f.context.state.last_error,/Add one sentence/);assert.equal(f.calls.filter(name=>name==='render').length,1);assert.equal(f.input.value,'   ');f.run('pause()');assert.equal(f.markupGoal(),'   ');assert.equal(f.context.planningFixture.goal_submitted,false);assert.equal(f.context.state.planning_goal,'');assert.equal(Object.hasOwn(JSON.parse(f.raw()),'planningGoalDraft'),false);
  });
  check('an absent or detached form cannot overwrite a retained draft',()=>{
    const f=draftFixture('stale input');f.context.planningGoalDraft='Retained text';f.context.practiceRoot.isConnected=false;assert.equal(f.run('capturePlanningGoalDraft()'),false);f.context.practiceRoot=null;assert.equal(f.run('capturePlanningGoalDraft()'),false);assert.equal(f.context.planningGoalDraft,'Retained text');assert.deepEqual(f.writes,[]);
  });
  check('submitted Planning goals cannot be replaced by stale form text',()=>{
    const f=draftFixture('stale input');f.context.planningFixture.goal='Accepted goal';f.context.planningFixture.goal_submitted=true;assert.equal(f.run('capturePlanningGoalDraft()'),false);assert.equal(f.context.planningGoalDraft,null);assert.equal(f.markupGoal(),null);assert.ok(f.run('planningFixtureMarkup()').includes('Accepted goal'));assert.equal(f.context.planningFixture.goal,'Accepted goal');
  });
  check('Replay preserves the draft on failed cleanup and clears it only for a fresh session',()=>{
    const f=draftFixture('Previous-session draft');f.run('removePlanningFixture()');f.context.cleanupForExit=()=>({ok:false});f.run('replay()');assert.equal(f.context.planningGoalDraft,'Previous-session draft');assert.ok(!f.calls.includes('captureOriginal'));
    f.context.cleanupForExit=()=>({ok:true});f.run('replay()');assert.equal(f.context.planningGoalDraft,null);assert.equal(f.context.planningFixture,null);assert.ok(!f.markupGoal().includes('Previous-session draft'));assert.equal(f.calls.filter(name=>name==='captureOriginal').length,1);
  });
  for(const reason of ['skip','complete'])check(`${reason} clears the draft only after injected cleanup success`,()=>{
    const f=draftFixture('Draft before exit');f.run('capturePlanningGoalDraft()');if(reason==='complete'){f.context.state.step_id='tour.planning.approval_boundary';f.context.planningFixture.review_visible=true;f.context.planningFixture.edited=true;f.context.focusPlanningPage=()=>{};}
    f.context.cleanupForExit=()=>({ok:false});f.run(`finish(${JSON.stringify(reason)})`);assert.equal(f.context.planningGoalDraft,'Draft before exit');assert.equal(f.context.state.status,'recovery_required');
    f.context.cleanupForExit=()=>({ok:true,final_page:reason==='complete'?'wizard':'dashboard'});f.run(`finish(${JSON.stringify(reason)})`);assert.equal(f.context.planningGoalDraft,null);assert.equal(f.context.state.status,reason==='complete'?'completed':'skipped');assert.equal(f.raw(),null);
  });
  check('causal ablation: removing teardown capture restores the draft-loss bug',()=>{
    const f=draftFixture('A draft that must survive'),safe=extract('removePlanningFixture'),unsafe=safe.replace('capturePlanningGoalDraft();','');assert.notEqual(unsafe,safe);f.run(unsafe);f.run('pause()');assert.equal(f.markupGoal(),f.context.BOOK_CLUB_GOAL);assert.notEqual(f.markupGoal(),'A draft that must survive');assert.equal(f.context.planningFixture.goal_submitted,false);
  });
  report.pass=true;
}catch(error){report.pass=false;report.failure=String(error.stack||error);console.error(report.failure);process.exitCode=1;}
if(reportArg)writeFileSync(resolve(reportArg),JSON.stringify(report,null,2)+'\n');
console.log(`${report.checks.length} controller unit checks ${report.pass?'passed':'before failure'}.`);
