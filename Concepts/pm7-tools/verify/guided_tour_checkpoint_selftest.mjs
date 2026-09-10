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
if(source.includes('  function planningResumePrerequisite('))functions.push('planningResumePrerequisite');
if(source.includes('  function completedWorkspaceResumeCheck('))functions.push('completedWorkspaceResumeCheck');
if(source.includes('  function usageWidgetContext('))functions.push('usageWidgetContext');
if(source.includes('  function widgetResumeCheck('))functions.push('widgetResumeCheck');
if(source.includes('  function teacherExchangeReady('))functions.push('teacherExchangeReady');
if(source.includes('  function teacherResumePrerequisite('))functions.push('teacherResumePrerequisite');
const extracted=functions.map(extract).join('\n');
const inspection=source.match(/captureOriginal:(function\(\)\{[^\n]+?\})\n/);assert.ok(inspection,'Closed read-only inspection entrypoint.');
function fixture(raw=null,{unavailable=false}={}){
  let stored=raw,blockedRead=unavailable;const writes=[],calls=[],records=[];
  const node=()=>({hidden:true,disabled:false,dataset:{},style:{},innerHTML:'',textContent:'',attributes:{},setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];},focus(){calls.push('focus');}});
  const root=node(),heading=node(),stage=node(),skip=node();root.querySelector=()=>skip;stage.querySelector=()=>heading;
  const state={open:false,status:'first_launch',step_id:'tour.intro.comfort',step_index:0,source:'unknown',eli5_enabled:false,completed:false,skipped:false,layout_disposition:'pending',layout_snapshot_restored:false};
  const steps=[{id:'tour.intro.comfort',index:0,meaningful:false},{id:'tour.workspace.chat.dock',index:1,meaningful:true},{id:'tour.chat.teacher.ask',index:2,meaningful:true},{id:'tour.planning.approval_boundary',index:3,meaningful:false}];
  const context=vm.createContext({state,original:null,checkpointRecovery:null,STEP_BY_ID:Object.fromEntries(steps.map(step=>[step.id,step])),STEP_DEFS:steps,STORYBOARD:{revision},root,stage,heading,skip,callout:node(),resumeButton:node(),replayButton:node(),backButton:node(),eli5Button:node(),halo:node(),pointer:node(),progress:node(),forwardSlot:node(),transitionTimer:0,history:[],effectReceipts:[],uiActionLog:[],receiptSerial:0,sessionSerial:0,meaningful:[],planningFixture:null,teacherPending:null,practiceWidgetId:null,workspacePanelId:null,completedSteps:{},innerWidth:1440,innerHeight:960,
    AUTHORITATIVE_PROMPT:'What happens before Puppet Master changes my files?',guidedThreadIds:Object.create(null),resumeRevalidationError:null,teacherExchange:null,
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
    window:{PM7_USAGE:{state:{room:'usage',hidden:{}},rerender:()=>f.calls.push('rerenderUsage'),layoutFor:()=>({cols:4,rows:2})},PM_DEMO:{state:{chat:{activeThread:'guided-thread',threads:{'guided-thread':{guided_example:true,messages:[]},ordinary:{guided_example:false}}}},chat:{send:()=>{f.calls.push('ordinarySend');return {ordinary_sentinel:true};}}}},
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
function planningResumeFixture(id='tour.planning.approval_boundary'){
  const f=liveResumeFixture(id),defs=source.match(/  var STEP_DEFS=\[[\s\S]*?\n  var STORYBOARD=/);assert.ok(defs);
  f.run(defs[0].replace(/\n  var STORYBOARD=$/,''));f.run(extract('createGuidedPlanningPractice'));
  f.run('var practiceModel=createGuidedPlanningPractice({goal:"Accepted fixture goal"});planningFixture=practiceModel.create();');
  for(const [action,value] of [['project'],['goal','Accepted fixture goal'],['guided'],['outcomes'],['answer','organizers'],['why'],['review'],['edit'],['answer','me']]){
    const result=f.value(`practiceModel.apply(planningFixture,${JSON.stringify(action)},${JSON.stringify(value)})`);assert.equal(result.ok,true);f.context.planningFixture=result.state;
  }
  const def=f.context.STEP_BY_ID[id];Object.assign(f.context.state,{step_id:id,step_index:def.index,action_status:'complete',action_mode:'try'});
  f.context.completedSteps=Object.fromEntries(f.context.STEP_DEFS.filter(row=>row.meaningful&&row.index<=def.index).map(row=>[row.id,{status:'applied',sentinel:row.id}]));
  f.context.history=f.context.STEP_DEFS.filter(row=>row.index<def.index).map(row=>row.id);f.context.planningGoalDraft='Unsubmitted fixture text';
  return f;
}
function completedMoveFixture(id='tour.workspace.chat.dock'){
  const f=liveResumeFixture(id),chat=id==='tour.workspace.chat.dock',surface=chat?'chat':'retained-panel';
  const before={surface_instance_id:surface,host:'dock_left',slot_index:0,visible:true},current={...before,host:'dock_right'};
  f.context.stepBaseline=chat?{chat:before}:{panel:before};f.context.currentChat=current;f.context.window.PM_HOME_WORKSPACE={layout:{surfaces:[current]}};
  f.context.state.action_status='complete';f.context.completedSteps[id]={status:'applied',at:123,metadata:{historical:true}};f.context.completedSteps['tour.chat.teacher.select']={status:'applied'};
  f.context.effectReceipts=[{historical:true}];f.context.history=['tour.chat.teacher.select'];f.run(['homeSurface','panelMoved'].map(extract).join('\n'));
  return {...f,current,before};
}
function widgetFixture({completed=false,hidden=false,card=true}={}){
  const f=liveResumeFixture('tour.workspace.widget.manage'),item={id:'retained-widget'},other={id:'new-widget'},layouts={'retained-widget':{cols:2,rows:2},'new-widget':{cols:2,rows:2}},events=[];
  const api={state:{room:'usage',hidden:{'usage:retained-widget':hidden,'usage:new-widget':true}},widgetById:id=>id===item.id?item:id===other.id?other:null,roomWidgets:()=>[item,other],layoutFor:row=>layouts[row.id],rerender:()=>f.calls.push('rerenderUsage'),sizePresets:()=>[[2,2],[4,2]],setLayout:(row,cols,rows)=>{f.calls.push('setLayout:'+row.id);layouts[row.id]={cols,rows};}};
  f.context.window.PM7_USAGE=api;f.context.stepBaseline={widget:{id:item.id,room:'usage',hidden,cols:2,rows:2}};f.context.document.querySelector=()=>card?{}:null;
  f.context.ownerActionEvent=(action,payload)=>events.push({action,payload});f.context.setUsageVisible=(id,visible)=>{f.calls.push('setUsageVisible:'+id);api.state.hidden[api.state.room+':'+id]=!visible;return true;};
  f.run(['usageWidgetReady','configureUsageWidget'].map(extract).join('\n'));
  if(completed){f.context.completedSteps['tour.workspace.widget.manage']={status:'applied',at:123};f.context.state.action_status='complete';}
  return {...f,api,item,other,layouts,events};
}
function teacherExchangeFixture(id='tour.chat.teacher.ask'){
  const f=liveResumeFixture(id),thread=f.context.window.PM_DEMO.state.chat.threads['guided-thread'];
  const defs=source.match(/  var STEP_DEFS=\[[\s\S]*?\n  var STORYBOARD=/);f.run(defs[0].replace(/\n  var STORYBOARD=$/,''));f.context.state.step_index=f.context.STEP_BY_ID[id].index;
  const question={role:'user',text:'Fixture question',guided_example:true},reply={role:'assistant',html:'Fixture answer',stopped:false,guided_example:true};thread.messages=[question,reply];
  f.context.teacherExchange={thread_record:thread,user_message:question,reply_message:reply,message_id:'reply-1',answer_id:'fixture-answer'};
  Object.assign(f.context.state,{teacher_message_sent:true,teacher_response_index:1,teacher_response_message_id:'reply-1',teacher_answer_id:'fixture-answer',teacher_copy_mode:'normal',teacher_last_prompt:'Fixture question'});
  return {...f,thread,question,reply};
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
    const f=widgetFixture();const before=f.value('stepBaseline');f.run('resume()');assert.deepEqual(f.value('stepBaseline'),before);assert.equal(f.context.practiceWidgetId,'retained-widget');assert.ok(!f.calls.includes('chooseUsageWidget'));assert.equal(f.context.completion,undefined);assert.equal(f.calls.filter(name=>name==='watchCurrentPredicate').length,1);
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
    const question={role:'user',text:'Fixture question',guided_example:true};thread.messages=[question];f.context.state.teacher_last_prompt=question.text;d.emit=()=>{};f.context.state.open=true;f.context.sessionSerial=1;f.context.teacherTurnCurrent=()=>true;f.context.document.querySelector=()=>null;f.context.setTimeout=fn=>{settle=fn;return 1;};
    f.context.pending={session:1,thread:'guided-thread',thread_record:thread,user_message:question,message:'reply-1',step_id:'tour.chat.teacher.ask'};f.run(extract('completeTeacherTurn'));assert.equal(f.run('completeTeacherTurn(window.PM_DEMO,pending,{html:"Local answer",id:"example",copy_mode:"normal"},"done")'),true);assert.equal(typeof settle,'function');
    if(switchThread)d.state.chat.activeThread='ordinary';settle();assert.equal(f.calls.includes('completeStep'),!switchThread);assert.equal(thread.messages.length,2);
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
  check('Resume returns from the approval boundary to an interrupted answer edit without replay',()=>{
    const f=planningResumeFixture();f.run('planningFixture=practiceModel.apply(planningFixture,"edit").state;');const before=f.value('planningFixture'),original=f.value('original');
    f.run('resume()');assert.equal(f.context.state.step_id,'tour.planning.edit');assert.equal(f.context.state.action_status,'idle');assert.deepEqual(f.value('planningFixture'),before);assert.deepEqual(f.value('original'),original);assert.equal(f.context.planningGoalDraft,'Unsubmitted fixture text');assert.equal(f.context.completedSteps['tour.planning.edit'],undefined);assert.ok(f.context.completedSteps['tour.planning.review']);assert.equal(f.context.completion,undefined);assert.ok(!f.calls.includes('watchCurrentPredicate'));assert.ok(!f.calls.includes('captureOriginal'));
  });
  for(const [field,value,id] of [
    ['project_selected',false,'project_source'],['goal_submitted',false,'goal'],['guided_selected',false,'guided_help'],
    ['outcomes_visible',false,'requirements'],['answer',null,'question'],['why_visible',false,'why'],['review_visible',false,'review'],['edited',false,'edit']
  ])check(`Resume revalidates the ${id} predicate and invalidates only its dependent Planning credits`,()=>{
    const f=planningResumeFixture();f.context.planningFixture[field]=value;f.context.planningFixture.edited=false;const before=f.value('planningFixture'),credits=f.value('completedSteps');f.context.effectReceipts.push({historical:'keep'});
    f.run('resume()');const step=f.context.STEP_BY_ID[`tour.planning.${id}`];assert.equal(f.context.state.step_id,step.id);assert.equal(f.context.state.step_index,step.index);assert.equal(f.context.state.action_status,'idle');assert.deepEqual(f.value('planningFixture'),before);assert.deepEqual(f.value('effectReceipts'),[{historical:'keep'}]);
    for(const row of f.context.STEP_DEFS.filter(row=>row.meaningful))if(row.chapter==='planning_wizard'&&row.index>=step.index)assert.equal(f.context.completedSteps[row.id],undefined);else assert.deepEqual(f.value(`completedSteps[${JSON.stringify(row.id)}]`),credits[row.id]);
    assert.ok(f.context.history.every(item=>f.context.STEP_BY_ID[item].index<step.index));assert.equal(f.records.at(-1).payload.resume_step_id,step.id);assert.equal(f.records.at(-1).payload.owner_action_dispatched,false);assert.equal(f.context.completion,undefined);assert.deepEqual(f.calls,['routeView','ensurePlanningFixture','renderPlanningFixture','render']);assert.ok(!f.raw().includes('Unsubmitted fixture text'));
  });
  check('an unchanged completed Planning checkpoint stays put without new completion or dispatch',()=>{
    const f=planningResumeFixture(),before=f.value('completedSteps'),history=f.value('history');f.run('resume()');assert.equal(f.context.state.step_id,'tour.planning.approval_boundary');assert.deepEqual(f.value('completedSteps'),before);assert.deepEqual(f.value('history'),history);assert.equal(f.context.completion,undefined);assert.equal(f.records.at(-1).payload.planning_revalidation,'unchanged');
  });
  check('a stale current completion is revoked even when Resume need not change steps',()=>{
    const f=planningResumeFixture('tour.planning.goal');f.context.planningFixture.goal_submitted=false;f.run('resume()');assert.equal(f.context.state.step_id,'tour.planning.goal');assert.equal(f.context.state.action_status,'idle');assert.equal(f.context.completedSteps['tour.planning.goal'],undefined);assert.ok(f.context.completedSteps['tour.planning.project_source']);assert.equal(f.context.completion,undefined);
  });
  check('Resume does not demand future Planning predicates before their step is reached',()=>{
    const f=planningResumeFixture('tour.planning.goal');Object.assign(f.context.planningFixture,{guided_selected:false,outcomes_visible:false,answer:null,why_visible:false,review_visible:false,edited:false});const credits=f.value('completedSteps');f.run('resume()');assert.equal(f.context.state.step_id,'tour.planning.goal');assert.deepEqual(f.value('completedSteps'),credits);assert.equal(f.context.completion,undefined);
  });
  for(const invalid of [null,{schema_id:'old'}, {work_started:true}, {goal_submitted:'true'}, {answer:'not-a-choice'}])check(`unavailable or malformed Planning state is not replaced (${JSON.stringify(invalid)})`,()=>{
    const f=planningResumeFixture();f.context.planningFixture=invalid===null?null:{...f.context.planningFixture,...invalid};const before=f.value('planningFixture'),credits=f.value('completedSteps'),original=f.value('original');f.run('resume()');assert.equal(f.context.state.status,'recovery_required');assert.equal(f.context.state.action_status,'failed');assert.match(f.context.state.last_error,/retained practice state is unavailable/);assert.deepEqual(f.value('planningFixture'),before);assert.deepEqual(f.value('completedSteps'),credits);assert.deepEqual(f.value('original'),original);assert.deepEqual(f.calls,['render']);assert.deepEqual(f.writes,[]);assert.equal(f.context.completion,undefined);
  });
  check('a predicate exception is bounded and blocks all progress actions but permits retry',()=>{
    const f=planningResumeFixture(),predicate=f.context.stepPredicate,retained=f.value('planningFixture');f.context.stepPredicate=()=>{throw Error('private-owner-error');};f.run('resume()');assert.equal(f.context.state.status,'recovery_required');assert.doesNotMatch(f.context.state.last_error,/private-owner-error/);
    f.run(['beginTry','beginShowMe','planningAction','toggleEli5','syncEli5','stepTargetSelector'].map(extract).join('\n'));
    for(const action of ['next()','back()','finish("complete")','beginTry(null)','beginShowMe(null)']){f.run(action);assert.equal(f.context.state.step_id,'tour.planning.approval_boundary');assert.equal(f.context.state.completed,false);}
    assert.equal(f.value('performOwnerAction(currentDef())').owner_action_dispatched,false);assert.equal(f.run('planningAction("project")'),false);assert.equal(f.run('toggleEli5(true)'),false);assert.equal(f.run('stepTargetSelector(state.step_id)'),'');f.run('syncEli5()');assert.deepEqual(f.value('planningFixture'),retained);assert.ok(f.calls.every(name=>name==='render'));assert.deepEqual(f.writes,[]);
    f.context.stepPredicate=predicate;f.run('resume()');assert.equal(f.context.resumeRevalidationError,null);assert.equal(f.context.state.status,'demonstrating');assert.equal(f.context.state.step_id,'tour.planning.approval_boundary');assert.equal(f.context.completion,undefined);
  });
  check('causal ablation: bypassing Planning revalidation accepts a stale final step',()=>{
    const f=planningResumeFixture();f.context.planningFixture.answer=null;f.context.planningResumePrerequisite=()=>({step:null,error:null});f.run('resume()');assert.equal(f.context.state.step_id,'tour.planning.approval_boundary');assert.ok(f.context.completedSteps['tour.planning.question']);
  });
  check('unavailable Planning state renders retry controls instead of cached success or Finish',()=>{
    const f=planningResumeFixture();f.context.planningFixture=null;f.run('resume()');
    Object.assign(f.context,{motionReduced:()=>true,syncEli5:()=>{},copyForStep:()=>({kicker:'Old',title:'Old success',body:'Old body',success:'Cached completion',note:'Old note'}),targetAdapter:{resolve:()=>null},scheduleTargetTracking:()=>{},chapterLabels:{planning_wizard:'Planning'},currentTheme:()=> 'paper'});
    f.run(extract('render'));f.run('render("forward")');assert.match(f.context.stage.innerHTML,/Your practice needs another check/);assert.match(f.context.stage.innerHTML,/Pause to retry/);assert.doesNotMatch(f.context.stage.innerHTML,/Cached completion|data-tour-action="finish"|data-tour-keep-layout/);assert.equal(f.context.backButton.disabled,true);assert.equal(f.context.eli5Button.disabled,true);assert.equal(f.context.planningFixture,null);
  });
  check('unavailable Planning state keeps Skip available and clears the fence only after cleanup succeeds',()=>{
    const f=planningResumeFixture();f.context.planningFixture=null;f.run('resume()');f.context.layoutNow=()=>({});f.context.receipt=()=>{};f.context.originalFocus=()=>{};
    f.context.cleanupForExit=()=>({ok:false});f.run('finish("skip")');assert.equal(f.context.state.skipped,false);assert.ok(f.context.resumeRevalidationError);
    f.context.cleanupForExit=()=>({ok:true,final_page:'dashboard'});f.run('finish("skip")');assert.equal(f.context.state.skipped,true);assert.equal(f.context.resumeRevalidationError,null);assert.equal(f.context.planningFixture,null);assert.equal(f.raw(),null);
  });
  for(const [field,value,id] of [['goal','   ','goal'],['consequence_revision',0,'edit']])check(`a cached completion cannot substitute for the accepted ${id} value`,()=>{
    const f=planningResumeFixture();f.context.planningFixture[field]=value;f.run('resume()');assert.equal(f.context.state.step_id,'tour.planning.'+id);assert.equal(f.context.state.action_status,'idle');assert.equal(f.context.completion,undefined);assert.equal(f.run('stepPredicate(state.step_id)'),false);
  });
  check('an explicit fresh Replay clears the unavailable-state fence only after successful cleanup',()=>{
    const f=planningResumeFixture();f.context.planningFixture=null;f.run('resume()');f.context.cleanupForExit=()=>({ok:false});f.run('replay()');assert.ok(f.context.resumeRevalidationError);assert.ok(!f.calls.includes('captureOriginal'));
    f.context.cleanupForExit=()=>({ok:true});f.context.prepareStep=()=>f.calls.push('prepareStep');f.run('replay()');assert.equal(f.context.resumeRevalidationError,null);assert.equal(f.context.state.status,'demonstrating');assert.equal(f.context.state.step_id,'tour.intro.comfort');assert.equal(f.calls.filter(name=>name==='captureOriginal').length,1);
  });
  check('Resume revokes an undone completed Chat move without recapturing or replaying it',()=>{
    const f=completedMoveFixture();f.current.host=f.before.host;const baseline=f.value('stepBaseline'),original=f.value('original');f.run('resume()');assert.equal(f.context.completedSteps['tour.workspace.chat.dock'],undefined);assert.equal(f.context.state.action_status,'idle');assert.equal(f.context.state.action_mode,null);assert.deepEqual(f.value('stepBaseline'),baseline);assert.deepEqual(f.value('original'),original);assert.equal(f.current.host,'dock_left');assert.equal(f.context.completion,undefined);assert.ok(!f.calls.includes('watchCurrentPredicate'));assert.ok(!f.calls.includes('placeChatRight'));assert.ok(!f.calls.includes('captureOriginal'));
  });
  for(const id of ['tour.workspace.chat.dock','tour.workspace.panels.rearrange']){
    for(const change of ['host','slot'])check(`a still-applied completed ${id} ${change} move keeps its original receipt`,()=>{
      const f=completedMoveFixture(id);if(change==='slot'){f.current.host=f.before.host;f.current.slot_index=1;}const baseline=f.value('stepBaseline'),credits=f.value('completedSteps');f.run('resume()');assert.equal(f.context.state.action_status,'complete');assert.deepEqual(f.value('completedSteps'),credits);assert.deepEqual(f.value('stepBaseline'),baseline);assert.equal(f.context.completion,undefined);assert.deepEqual(f.value('effectReceipts'),[{historical:true}]);assert.deepEqual(f.calls,['routeView','render']);assert.equal(f.records.at(-1).payload.completed_workspace_revalidation,'satisfied');assert.equal(f.records.at(-1).payload.owner_action_dispatched,false);
    });
    check(`an undone ${id} preserves unrelated credits, history, owner state, and baseline`,()=>{
      const f=completedMoveFixture(id);Object.assign(f.current,f.before);const before=f.value('window.PM_HOME_WORKSPACE.layout'),baseline=f.value('stepBaseline'),history=f.value('history');f.run('resume()');assert.equal(f.context.state.step_id,id);assert.equal(f.context.state.action_status,'idle');assert.equal(f.context.completedSteps[id],undefined);assert.ok(f.context.completedSteps['tour.chat.teacher.select']);assert.deepEqual(f.value('history'),history);assert.deepEqual(f.value('stepBaseline'),baseline);assert.deepEqual(f.value('window.PM_HOME_WORKSPACE.layout'),before);assert.equal(f.context.workspacePanelId,'retained-panel');assert.deepEqual(f.value('effectReceipts'),[{historical:true}]);assert.deepEqual(f.calls,['routeView','render']);assert.equal(f.records.at(-1).payload.completed_workspace_revalidation,'unsatisfied');
    });
  }
  for(const [name,mutate] of [
    ['missing comparison',f=>f.context.stepBaseline=null],
    ['wrong comparison identity',f=>f.before.surface_instance_id='different-panel'],
    ['missing current panel',f=>{f.context.currentChat=null;f.context.window.PM_HOME_WORKSPACE.layout.surfaces=[];}],
    ['wrong current identity',f=>f.current.surface_instance_id='different-panel'],
    ['hidden current panel',f=>f.current.visible=false],
    ['coerced prior slot',f=>f.before.slot_index='0'],
    ['negative current slot',f=>f.current.slot_index=-1],
    ['empty host',f=>f.current.host='']
  ])check(`${name} cannot certify a completed move or cause preparation`,()=>{
    const f=completedMoveFixture();mutate(f);const baseline=f.value('stepBaseline'),credits=f.value('completedSteps'),original=f.value('original');f.run('resume()');assert.equal(f.context.state.status,'recovery_required');assert.equal(f.context.state.action_status,'failed');assert.match(f.context.state.last_error,/comparison or its panel is unavailable/);assert.deepEqual(f.value('stepBaseline'),baseline);assert.deepEqual(f.value('completedSteps'),credits);assert.deepEqual(f.value('original'),original);assert.deepEqual(f.calls,['render']);assert.deepEqual(f.writes,[]);assert.equal(f.context.completion,undefined);
  });
  check('a throwing move owner is bounded and blocks Next despite its cached completion',()=>{
    const f=completedMoveFixture(),read=f.context.chatSurfaceRecord;f.context.chatSurfaceRecord=()=>{throw Error('private-owner-details');};f.run('resume()');assert.equal(f.context.state.status,'recovery_required');assert.doesNotMatch(f.context.state.last_error,/private-owner-details/);f.run('next()');assert.equal(f.context.state.step_id,'tour.workspace.chat.dock');assert.equal(f.value('performOwnerAction(currentDef())').owner_action_dispatched,false);assert.deepEqual(f.calls,['render','render']);
    f.context.chatSurfaceRecord=read;f.run('resume()');assert.equal(f.context.resumeRevalidationError,null);assert.equal(f.context.state.action_status,'complete');assert.equal(f.context.completion,undefined);assert.equal(f.records.at(-1).payload.completed_workspace_revalidation,'satisfied');
  });
  check('an undone move waits for an explicit retry instead of restarting the interrupted demonstration',()=>{
    const f=completedMoveFixture();Object.assign(f.current,f.before);f.run('resume()');f.context.ack=()=>{};f.run(extract('beginTry'));f.run('beginTry(null)');assert.equal(f.context.state.action_status,'watching');assert.equal(f.calls.filter(name=>name==='watchCurrentPredicate').length,1);assert.equal(f.context.state.action_mode,'try');assert.equal(f.current.host,f.before.host);assert.equal(f.context.completion,undefined);
  });
  check('a move recheck does not certify unrelated completed workspace actions',()=>{
    const f=liveResumeFixture('tour.workspace.widget.manage');f.context.completedSteps['tour.workspace.widget.manage']={status:'applied'};f.context.state.action_status='complete';assert.equal(f.value('completedWorkspaceResumeCheck(currentDef())').status,'not_applicable');assert.deepEqual(f.calls,[]);
  });
  check('causal ablation: skipping the completed move check restores the stale-credit bug',()=>{
    const f=completedMoveFixture();Object.assign(f.current,f.before);f.context.completedWorkspaceResumeCheck=()=>({status:'not_applicable',error:null});f.run('resume()');assert.equal(f.context.state.action_status,'complete');assert.ok(f.context.completedSteps['tour.workspace.chat.dock']);
  });
  check('Show Me modifies the retained widget rather than choosing another newly hidden widget',()=>{
    const f=widgetFixture(),baseline=f.value('stepBaseline');assert.equal(f.run('configureUsageWidget()'),true);assert.equal(f.context.practiceWidgetId,'retained-widget');assert.deepEqual(f.value('stepBaseline'),baseline);assert.deepEqual(f.calls,['setLayout:retained-widget']);assert.deepEqual(f.layouts['new-widget'],{cols:2,rows:2});assert.equal(f.api.state.hidden['usage:new-widget'],true);assert.equal(f.events[0].payload.widget_id,'retained-widget');
  });
  check('adding the retained hidden widget does not show another hidden widget',()=>{
    const f=widgetFixture({hidden:true});assert.equal(f.run('configureUsageWidget()'),true);assert.deepEqual(f.calls,['setUsageVisible:retained-widget']);assert.equal(f.api.state.hidden['usage:retained-widget'],false);assert.equal(f.api.state.hidden['usage:new-widget'],true);assert.equal(f.context.practiceWidgetId,'retained-widget');assert.equal(f.events[0].action,'cmd.widget.add');assert.equal(f.run('usageWidgetReady()'),true);
  });
  for(const baselineHidden of [false,true])check(`a hidden current widget fails the predicate despite a stale card (baseline hidden=${baselineHidden})`,()=>{
    const f=widgetFixture({hidden:baselineHidden});f.api.state.hidden['usage:retained-widget']=true;f.layouts['retained-widget']={cols:4,rows:2};assert.equal(f.run('usageWidgetReady()'),false);assert.equal(f.run('stepPredicate("tour.workspace.widget.manage")'),false);assert.deepEqual(f.calls,[]);
  });
  for(const change of ['resize','show'])check(`Resume keeps an observed ${change} completion without another receipt or action`,()=>{
    const f=widgetFixture({completed:true,hidden:change==='show'});if(change==='resize')f.layouts['retained-widget']={cols:4,rows:2};else f.api.state.hidden['usage:retained-widget']=false;const before=f.value('stepBaseline'),credits=f.value('completedSteps');f.run('resume()');assert.equal(f.context.state.action_status,'complete');assert.deepEqual(f.value('stepBaseline'),before);assert.deepEqual(f.value('completedSteps'),credits);assert.deepEqual(f.events,[]);assert.equal(f.context.completion,undefined);assert.deepEqual(f.calls,['routeView','rerenderUsage','render']);
  });
  for(const failure of ['resize undone','hidden again','card missing'])check(`Resume revokes a completed widget when ${failure}`,()=>{
    const f=widgetFixture({completed:true,hidden:failure==='hidden again',card:failure!=='card missing'});if(failure==='card missing')f.layouts['retained-widget']={cols:4,rows:2};const before=f.value('stepBaseline');f.context.completedSteps.other={keep:true};f.run('resume()');assert.equal(f.context.state.action_status,'idle');assert.equal(f.context.completedSteps['tour.workspace.widget.manage'],undefined);assert.equal(f.context.completedSteps.other.keep,true);assert.deepEqual(f.value('stepBaseline'),before);assert.deepEqual(f.events,[]);assert.equal(f.context.completion,undefined);assert.deepEqual(f.calls,['routeView','rerenderUsage','render']);
  });
  for(const [name,mutate] of [
    ['missing baseline',f=>f.context.stepBaseline=null],['missing original room',f=>delete f.context.stepBaseline.widget.room],
    ['changed room',f=>f.api.state.room='different-room'],['retargeted identity',f=>f.context.practiceWidgetId='new-widget'],
    ['missing widget',f=>f.api.widgetById=()=>null],['wrong widget result',f=>f.api.widgetById=()=>f.other],
    ['malformed hidden value',f=>f.api.state.hidden['usage:retained-widget']='false'],['malformed hidden map',f=>f.api.state.hidden=[]],['unknown layout',f=>f.api.layoutFor=()=>null],
    ['nonpositive dimensions',f=>f.layouts['retained-widget']={cols:0,rows:2}],['coerced original dimensions',f=>f.context.stepBaseline.widget.cols='2']
  ])check(`${name} blocks widget Resume and Show Me without changing any widget`,()=>{
    const f=widgetFixture({completed:true});mutate(f);const before=f.value('stepBaseline');f.run('resume()');assert.equal(f.context.state.status,'recovery_required');assert.equal(f.context.state.action_status,'failed');assert.deepEqual(f.calls,['render']);assert.deepEqual(f.events,[]);assert.deepEqual(f.writes,[]);assert.deepEqual(f.value('stepBaseline'),before);assert.ok(f.context.completedSteps['tour.workspace.widget.manage']);assert.equal(f.value('performOwnerAction(currentDef())').owner_action_dispatched,false);assert.equal(f.run('usageWidgetReady()'),false);assert.equal(f.run('configureUsageWidget()'),false);assert.deepEqual(f.events,[]);assert.deepEqual(f.calls,['render']);
  });
  check('an owner exception gives a bounded widget recovery reason and can be retried',()=>{
    const f=widgetFixture({completed:true}),read=f.api.layoutFor;f.api.layoutFor=()=>{throw Error('private-widget-failure');};f.run('resume()');assert.equal(f.context.state.status,'recovery_required');assert.doesNotMatch(f.context.state.last_error,/private-widget-failure/);assert.deepEqual(f.calls,['render']);f.api.layoutFor=read;f.layouts['retained-widget']={cols:4,rows:2};f.run('resume()');assert.equal(f.context.state.action_status,'complete');assert.equal(f.context.resumeRevalidationError,null);assert.deepEqual(f.events,[]);
  });
  check('a rejected resize does not complete and cannot mutate another widget',()=>{
    const f=widgetFixture();f.api.setLayout=()=>{f.calls.push('rejectedResize');return {ok:false};};assert.equal(f.run('configureUsageWidget()'),false);assert.equal(f.run('usageWidgetReady()'),false);assert.equal(f.events[0].payload.success,false);assert.deepEqual(f.calls,['rejectedResize']);assert.deepEqual(f.layouts['new-widget'],{cols:2,rows:2});
  });
  check('a refused show action cannot claim a hidden widget was added',()=>{
    const f=widgetFixture({hidden:true});f.context.setUsageVisible=()=>false;assert.equal(f.run('configureUsageWidget()'),false);assert.equal(f.events[0].payload.success,false);assert.equal(f.run('usageWidgetReady()'),false);
  });
  check('an owner that updates dimensions in place still produces an accurate resize comparison',()=>{
    const f=widgetFixture();f.api.setLayout=(item,cols,rows)=>Object.assign(f.layouts[item.id],{cols,rows});assert.equal(f.run('configureUsageWidget()'),true);assert.deepEqual(JSON.parse(JSON.stringify(f.events[0].payload.before)),{cols:2,rows:2});assert.equal(f.events[0].payload.after.cols,4);
  });
  check('a fresh widget step captures its room once without serializing the comparison',()=>{
    const f=widgetFixture();f.run('prepareStep(currentDef(),false)');assert.equal(f.context.stepBaseline.widget.room,'usage');assert.equal(f.context.stepBaseline.widget.id,'new-widget');assert.equal(Object.hasOwn(JSON.parse(f.raw()),'stepBaseline'),false);assert.equal(Object.hasOwn(JSON.parse(f.raw()),'room'),false);
  });
  check('causal ablation: ignoring current hidden state wrongly accepts a stale card',()=>{
    const f=widgetFixture({hidden:true}),safe=extract('usageWidgetReady'),unsafe=safe.replace('context.error||context.hidden','context.error');assert.notEqual(unsafe,safe);f.run(unsafe);assert.equal(f.run('usageWidgetReady()'),true);assert.equal(f.api.state.hidden['usage:retained-widget'],true);
  });
  check('a Usage view change during remount fails closed before accepting cached completion',()=>{
    const f=widgetFixture({completed:true});f.layouts['retained-widget']={cols:4,rows:2};f.api.rerender=()=>{f.calls.push('rerenderUsage');f.api.state.room='changed-during-remount';};f.run('resume()');assert.equal(f.context.state.status,'recovery_required');assert.equal(f.context.state.action_status,'failed');assert.match(f.context.state.last_error,/Usage view changed/);assert.ok(f.context.completedSteps['tour.workspace.widget.manage']);assert.deepEqual(f.events,[]);assert.equal(f.context.completion,undefined);
  });
  check('a changed widget context has no target and cannot dispatch before Resume',()=>{
    const f=widgetFixture();f.context.state.open=true;f.api.state.room='different-room';f.run(extract('stepTargetSelector'));assert.equal(f.run('stepTargetSelector(state.step_id)'),'');assert.equal(f.value('performOwnerAction(currentDef())').owner_action_dispatched,false);assert.deepEqual(f.events,[]);assert.deepEqual(f.calls,[]);
  });
  check('a removed Teacher reply cannot satisfy the cached answered flag',()=>{
    const f=teacherExchangeFixture();f.thread.messages.pop();assert.equal(f.context.state.teacher_message_sent,true);assert.equal(f.run('stepPredicate("tour.chat.teacher.ask")'),false);
  });
  for(const [name,mutate] of [
    ['removed question',f=>f.thread.messages.shift()],['replacement reply',f=>f.thread.messages[1]={...f.reply}],
    ['replacement question',f=>f.thread.messages[0]={...f.question}],['stopped reply',f=>f.reply.stopped=true],
    ['ordinary reply',f=>f.reply.guided_example=false],['wrong role',f=>f.reply.role='user'],
    ['empty reply',f=>f.reply.html='   '],['edited question',f=>f.question.text='Different question'],
    ['reversed pair',f=>f.thread.messages.reverse()],['duplicated reply object',f=>f.thread.messages.push(f.reply)],
    ['mismatched message ref',f=>f.context.state.teacher_response_message_id='unrelated'],['mismatched answer ref',f=>f.context.state.teacher_answer_id='unrelated']
  ])check(`${name} cannot satisfy Teacher completion or receive an ELI5 edit`,()=>{
    const f=teacherExchangeFixture();mutate(f);const before=f.value('window.PM_DEMO.state.chat');assert.equal(f.run('teacherExchangeReady()'),false);assert.equal(f.run('stepPredicate("tour.chat.teacher.ask")'),false);f.run(extract('applyTeacherMode'));assert.equal(f.run('applyTeacherMode()'),false);assert.deepEqual(f.value('window.PM_DEMO.state.chat'),before);assert.deepEqual(f.calls,[]);
  });
  check('unrelated message insertion cannot redirect ELI5 through an old array index',()=>{
    const f=teacherExchangeFixture('tour.chat.teacher.eli5'),unrelated={role:'assistant',html:'Do not overwrite',guided_example:false},sink={textContent:''};f.thread.messages.unshift(unrelated);assert.equal(f.context.state.teacher_response_index,1);let selector;
    f.context.document.querySelector=value=>{selector=value;return sink;};f.context.guidedTeacherAnswer=()=>({id:'fixture-answer',html:'Simpler answer',copy_mode:'eli5'});f.run(extract('applyTeacherMode'));assert.equal(f.run('applyTeacherMode()'),true);assert.equal(f.reply.html,'Simpler answer');assert.equal(f.question.text,'Fixture question');assert.equal(unrelated.html,'Do not overwrite');assert.equal(f.context.state.teacher_response_index,2);assert.equal(sink.textContent,'Simpler answer');assert.equal(selector,'[data-pm6-mid="reply-1"] .pm6-chat-sink');assert.equal(f.context.state.teacher_copy_mode,'eli5');
  });
  check('an unavailable reply DOM sink does not cause a fallback write into another answer',()=>{
    const f=teacherExchangeFixture();let selectors=[];f.context.document.querySelector=value=>{selectors.push(value);return null;};f.context.guidedTeacherAnswer=()=>({id:'fixture-answer',html:'Simpler answer',copy_mode:'eli5'});f.run(extract('applyTeacherMode'));assert.equal(f.run('applyTeacherMode()'),true);assert.deepEqual(selectors,['[data-pm6-mid="reply-1"] .pm6-chat-sink']);assert.equal(f.reply.html,'Simpler answer');
  });
  for(const id of ['tour.chat.teacher.ask','tour.chat.teacher.reply','tour.chat.teacher.eli5'])check(`Resume from ${id} returns to the missing exchange without sending or replacing a draft`,()=>{
    const f=teacherExchangeFixture(id);f.thread.messages.pop();f.context.completedSteps={'tour.chat.teacher.select':{keep:true},'tour.chat.teacher.ask':{status:'applied'},'tour.chat.teacher.eli5':{status:'applied'}};f.context.state.action_status='complete';f.context.history=['tour.intro.comfort','tour.chat.teacher.ask','tour.chat.teacher.reply'];const before=f.value('window.PM_DEMO.state.chat'),original=f.value('original');
    f.run('resume()');assert.equal(f.context.state.step_id,'tour.chat.teacher.ask');assert.equal(f.context.state.action_status,'idle');assert.equal(f.context.state.teacher_message_sent,false);assert.equal(f.context.completedSteps['tour.chat.teacher.ask'],undefined);assert.equal(f.context.completedSteps['tour.chat.teacher.eli5'],undefined);assert.equal(f.context.completedSteps['tour.chat.teacher.select'].keep,true);assert.deepEqual(f.value('window.PM_DEMO.state.chat'),before);assert.deepEqual(f.value('original'),original);assert.deepEqual(f.calls,['render']);assert.equal(f.context.completion,undefined);assert.equal(f.records.at(-1).payload.resume_step_id,'tour.chat.teacher.ask');assert.equal(f.records.at(-1).payload.owner_action_dispatched,false);assert.ok(f.context.history.every(row=>f.context.STEP_BY_ID[row].index<f.context.state.step_index));
  });
  check('Resume preserves a still-valid completed exchange without another receipt',()=>{
    const f=teacherExchangeFixture();f.context.completedSteps['tour.chat.teacher.ask']={status:'applied'};f.context.state.action_status='complete';const before=f.value('window.PM_DEMO.state.chat');f.run('resume()');assert.equal(f.context.state.action_status,'complete');assert.deepEqual(f.value('window.PM_DEMO.state.chat'),before);assert.deepEqual(f.calls,['render']);assert.equal(f.context.completion,undefined);assert.equal(f.run('teacherExchangeReady()'),true);
  });
  check('an observed answer can be completed after an interruption with no replay',()=>{
    const f=teacherExchangeFixture();f.run('resume()');assert.equal(f.context.completion.status,'no_change');assert.equal(f.context.completion.metadata.owner_action_dispatched,false);assert.ok(!f.calls.includes('ordinarySend'));assert.ok(!f.calls.includes('prepareTeacherPractice'));
  });
  check('Resume revokes an undone ELI5 setting without repeating the valid exchange',()=>{
    const f=teacherExchangeFixture('tour.chat.teacher.eli5');f.context.completedSteps['tour.chat.teacher.ask']={status:'applied'};f.context.completedSteps['tour.chat.teacher.eli5']={status:'applied'};f.context.state.action_status='complete';f.context.state.eli5_enabled=false;f.run('resume()');assert.equal(f.context.state.step_id,'tour.chat.teacher.eli5');assert.equal(f.context.state.action_status,'idle');assert.equal(f.context.completedSteps['tour.chat.teacher.eli5'],undefined);assert.ok(f.context.completedSteps['tour.chat.teacher.ask']);assert.equal(f.thread.messages.length,2);assert.deepEqual(f.calls,['render']);
  });
  check('an unreadable guided message collection blocks Resume before preparation',()=>{
    const f=teacherExchangeFixture();f.thread.messages=null;f.context.completedSteps['tour.chat.teacher.ask']={status:'applied'};f.run('resume()');assert.equal(f.context.state.status,'recovery_required');assert.match(f.context.state.last_error,/conversation is unavailable/);assert.deepEqual(f.calls,['render']);assert.deepEqual(f.writes,[]);assert.equal(f.thread.messages,null);
  });
  check('a missing exchange cannot receive a Teacher ELI5 owner action or reply highlight',()=>{
    const f=teacherExchangeFixture('tour.chat.teacher.eli5');f.thread.messages.pop();f.context.state.open=true;f.run(['toggleEli5','stepTargetSelector'].map(extract).join('\n'));assert.equal(f.value('performOwnerAction(currentDef())').owner_action_dispatched,false);assert.equal(f.run('toggleEli5(true)'),false);assert.equal(f.run('stepTargetSelector("tour.chat.teacher.reply")'),'');assert.deepEqual(f.calls,[]);
  });
  check('exchange refs and conversation content are absent from the safe marker',()=>{
    const f=teacherExchangeFixture();f.run('persistCheckpoint()');assert.equal(Object.hasOwn(JSON.parse(f.raw()),'teacherExchange'),false);assert.equal(f.raw().includes('Fixture question'),false);assert.equal(f.raw().includes('Fixture answer'),false);
  });
  check('causal ablation: a cached answered flag accepts a removed owner reply',()=>{
    const f=teacherExchangeFixture();f.thread.messages.pop();f.context.teacherExchangeReady=()=>!!f.context.state.teacher_message_sent;assert.equal(f.run('stepPredicate("tour.chat.teacher.ask")'),true);
  });
  check('the real local send/completion path binds the question and reply without copying them',()=>{
    const f=teacherExchangeFixture(),d=f.context.window.PM_DEMO;Object.assign(f.context,{teacherOriginalSend:null,teacherMessageSerial:0,sessionSerial:1,teacherPending:null,guidedTeacherAnswer:()=>({id:'new-answer',html:'New local answer',copy_mode:'normal'})});d.emit=()=>{};f.context.document.querySelector=()=>null;f.run(['installTeacherSendAdapter','teacherTurnCurrent','completeTeacherTurn'].map(extract).join('\n'));f.run('installTeacherSendAdapter()');
    const result=f.value('window.PM_DEMO.chat.send("guided-thread","New fixture question")');assert.equal(result.ok,true);assert.equal(result.provider_dispatch,false);assert.equal(result.usage_write,false);assert.equal(f.context.teacherExchange.user_message,f.thread.messages[2]);assert.equal(f.context.teacherExchange.reply_message,f.thread.messages[3]);assert.equal(f.context.teacherExchange.thread_record,f.thread);assert.equal(f.run('teacherExchangeReady()'),true);assert.equal(f.thread.messages[0],f.question);assert.equal(f.thread.messages[1],f.reply);
  });
  check('starting another local turn invalidates old completion until its new reply finishes',()=>{
    const f=teacherExchangeFixture(),d=f.context.window.PM_DEMO;let done;Object.assign(f.context,{teacherOriginalSend:null,teacherMessageSerial:0,sessionSerial:1,teacherPending:null,guidedTeacherAnswer:()=>({id:'new-answer',html:'New local answer',copy_mode:'normal'})});d.emit=()=>{};d.stream={start:(_chunk,_html,options)=>{done=options.onDone;return {cancel(){}};}};f.context.document.querySelector=()=>null;f.run(['installTeacherSendAdapter','teacherTurnCurrent','completeTeacherTurn'].map(extract).join('\n'));f.run('installTeacherSendAdapter()');assert.equal(f.value('window.PM_DEMO.chat.send("guided-thread","New fixture question")').ok,true);assert.equal(f.context.teacherExchange,null);assert.equal(f.context.state.teacher_message_sent,false);assert.equal(f.run('teacherExchangeReady()'),false);assert.equal(f.thread.messages.length,3);done('done');assert.equal(f.run('teacherExchangeReady()'),true);assert.equal(f.thread.messages.length,4);
  });
  check('a stopped local reply cannot bind a completed exchange',()=>{
    const f=teacherExchangeFixture(),d=f.context.window.PM_DEMO;f.context.teacherTurnCurrent=()=>true;d.emit=()=>{};f.context.pending={session:1,thread:'guided-thread',thread_record:f.thread,user_message:f.question,message:'stopped-reply',step_id:'tour.chat.teacher.ask'};f.run(extract('completeTeacherTurn'));assert.equal(f.run('completeTeacherTurn(window.PM_DEMO,pending,{html:"Partial answer",id:"fixture-answer",copy_mode:"normal"},"stopped")'),true);assert.equal(f.context.teacherExchange,null);assert.equal(f.context.state.teacher_message_sent,false);assert.equal(f.run('teacherExchangeReady()'),false);
  });
  check('an unavailable owner message list refuses local send without resetting the old exchange',()=>{
    const f=teacherExchangeFixture(),d=f.context.window.PM_DEMO,exchange=f.context.teacherExchange;f.thread.messages=null;f.context.teacherOriginalSend=null;f.run(extract('installTeacherSendAdapter'));f.run('installTeacherSendAdapter()');const result=f.value('window.PM_DEMO.chat.send("guided-thread","Do not lose this draft")');assert.equal(result.ok,false);assert.equal(result.provider_dispatch,false);assert.equal(f.context.teacherExchange,exchange);assert.equal(f.context.state.teacher_last_prompt,'Fixture question');assert.deepEqual(f.calls,[]);
  });
  report.pass=true;
  report.pass=true;
  report.pass=true;
  report.pass=true;
}catch(error){report.pass=false;report.failure=String(error.stack||error);console.error(report.failure);process.exitCode=1;}
if(reportArg)writeFileSync(resolve(reportArg),JSON.stringify(report,null,2)+'\n');
console.log(`${report.checks.length} controller unit checks ${report.pass?'passed':'before failure'}.`);
