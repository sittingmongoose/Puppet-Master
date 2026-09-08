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
const functions=['savedCheckpoint','adoptCheckpointRecovery','recoveryBlocked','renderRecovery','localActionResult','persistCheckpoint','clearCheckpoint','start','resume','replay','pause','next','back','finish','performOwnerAction'];
const extracted=functions.map(extract).join('\n');
const inspection=source.match(/captureOriginal:(function\(\)\{[^\n]+?\})\n/);assert.ok(inspection,'Closed read-only inspection entrypoint.');
function fixture(raw=null,{unavailable=false}={}){
  let stored=raw,blockedRead=unavailable;const writes=[],calls=[],records=[];
  const node=()=>({hidden:true,disabled:false,dataset:{},style:{},innerHTML:'',textContent:'',attributes:{},setAttribute(key,value){this.attributes[key]=value;},removeAttribute(key){delete this.attributes[key];},focus(){calls.push('focus');}});
  const root=node(),heading=node(),stage=node(),skip=node();root.querySelector=()=>skip;stage.querySelector=()=>heading;
  const state={open:false,status:'first_launch',step_id:'tour.intro.comfort',step_index:0,source:'unknown',eli5_enabled:false,completed:false,skipped:false,layout_disposition:'pending',layout_snapshot_restored:false};
  const steps=[{id:'tour.intro.comfort',index:0,meaningful:false},{id:'tour.workspace.chat.dock',index:1,meaningful:true},{id:'tour.chat.teacher.ask',index:2,meaningful:true},{id:'tour.planning.approval_boundary',index:3,meaningful:false}];
  const context=vm.createContext({state,original:null,checkpointRecovery:null,STEP_BY_ID:Object.fromEntries(steps.map(step=>[step.id,step])),STEP_DEFS:steps,STORYBOARD:{revision},root,stage,heading,skip,callout:node(),resumeButton:node(),replayButton:node(),backButton:node(),eli5Button:node(),halo:node(),pointer:node(),progress:node(),forwardSlot:node(),transitionTimer:0,history:[],effectReceipts:[],uiActionLog:[],receiptSerial:0,sessionSerial:0,meaningful:[],planningFixture:null,teacherPending:null,practiceWidgetId:null,workspacePanelId:null,completedSteps:{},innerWidth:1440,innerHeight:960,
    AUTHORITATIVE_PROMPT:'What happens before Puppet Master changes my files?',
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
  check('causal ablation: removing the restart guard is detected as baseline replacement',()=>{
    const f=fixture(marker({})),safe=extract('start');
    const unsafe=safe.replace(/    if\(checkpointRecovery\|\|\(!original&&adoptCheckpointRecovery\(savedCheckpoint\(\)\)\)\)return recoveryBlocked\([^\n]+\n/,'');assert.notEqual(unsafe,safe);
    f.run(unsafe);assert.throws(()=>expectBlocked(f,'missing_original_snapshots'),/demonstrating|recovery_required/);assert.ok(f.calls.includes('captureOriginal'));
  });
  check('causal ablation: treating corrupt data as absent permits an unsafe fresh Start',()=>{
    const f=fixture('{broken');f.run('function savedCheckpoint(){return {kind:"absent"};}');
    const result=f.value('start()');assert.equal(result.status,'demonstrating');assert.equal(result.layout_snapshot_captured,true);assert.ok(f.calls.includes('captureOriginal'));
  });
  report.pass=true;
}catch(error){report.pass=false;report.failure=String(error.stack||error);console.error(report.failure);process.exitCode=1;}
if(reportArg)writeFileSync(resolve(reportArg),JSON.stringify(report,null,2)+'\n');
console.log(`${report.checks.length} controller unit checks ${report.pass?'passed':'before failure'}.`);
