/* Adversarial additions from source-backed slice-5 continuation.
 * These call the real shared owners and keep all retained assertions. */
(function(){
'use strict';
const P=PM56_PLANS,W=PM56_B17_WORK,E=PM56_EXT,A=PM56_ARTIFACTS,S=PM56_SCHED,T=PM56_TODOS;
function paused(){W.start('documents');document.querySelector('[data-action="send"]').click();const p=P.get(W.snapshot().planId);const out=P.build({plan_id:p.plan_id,expected:P.admissionSnapshot(p.plan_id),paused:true});if(!out.ok)throw Error(out.error);return p;}
const state=p=>JSON.stringify({p,work:W.records(),artifacts:PM56_DATA.artifacts,todos:T.get(),bindings:T.bindings(E.ctx().thread.id),runs:P.runs()});
Object.assign(B17_CASES,{
 recovery_respects_scheduler_stop:ck=>{
  const p=paused();S.latchStop('User explicitly stopped scheduled continuation');
  const expected=P.recoverySnapshot(p.plan_id),before=state(p),out=P.recoveryCommand({expected,action:'resume',idempotency_key:'stopped-resume'});
  ck('A fresh snapshot of a stopped scheduler cannot admit recovery',!out.ok&&out.error==='manual_stop_latched');
  ck('Stop refusal writes no attempt, Plan, To-Do, artifact or run state',state(p)===before);
  E._actions['sched-clear-stop'](E.ctx(),{dataset:{}});
  ck('Old stop epoch stays fenced after explicit resume',!P.recoveryCommand({expected,action:'resume',idempotency_key:'old-stop'}).ok);
  const fresh=P.recoveryCommand({expected:P.recoverySnapshot(p.plan_id),action:'resume',idempotency_key:'fresh-stop'});
  ck('Fresh explicit recovery after scheduler Resume is admitted',fresh.ok);
 },
 malformed_callback_fails_closed:ck=>{
  const p=paused(),before=state(p);
  for(const [id,ticket,binding] of [['missing',{},'x'],[W.snapshot().id,null,'x'],[W.snapshot().id,{},'x'],[W.snapshot().id,{todo_id:'unknown'},null]]){
   const out=W.acceptResult(id,ticket,binding,{});ck('Malformed/unknown callback identity is a typed refusal',!out.ok&&out.error==='stale_work_callback');
  }
  ck('Invalid callbacks leave every owner unchanged',state(p)===before);
 },
 untrusted_artifact_route_is_text:ck=>{
  const payload='\"><img src=x onerror="window.__routeInjected=true">',ref={artifact_id:'missing',artifact_version:payload,project_id:'scope',thread_id:'thread'};
  const box=document.createElement('div');box.innerHTML=A.editor(ref);
  ck('Malformed version is escaped in every artifact editor field',box.querySelectorAll('img,script,[onerror]').length===0);
  ck('Invalid route is explicitly unavailable rather than latest',box.textContent.includes('invalid artifact reference')&&box.textContent.includes('No newer version'));
 }
});
})();

/* Rescue continuation: concrete gaps checked against the recovered bytes first. */
(function(){
'use strict';
const P=PM56_PLANS,W=PM56_B17_WORK,E=PM56_EXT,A=PM56_ARTIFACTS,S=PM56_SCHED;
const act=(name,data={})=>E.run(name,{dataset:data},new Event('click'));
function prepared(){W.start('documents');document.querySelector('[data-action="send"]').click();return P.get(W.snapshot().planId);}
Object.assign(B17_CASES,{
 structured_artifact_content_not_blank:ck=>{
  const ref={artifact_id:'structured-payload',artifact_version:1,project_id:'test-project',thread_id:'test-thread'};
  const q={...ref,title:'Structured retained content',renderer_kind:'document',payload:{message:'Retain this payload',hostile:'<script>never execute</script>'}};
  ck('Payload-only artifact publication is admitted',A.publish(q).ok);
  const box=document.createElement('div');box.innerHTML=A.render(ref);
  ck('Shared document renderer preserves structured payload text',box.textContent.includes('Retain this payload'));
  ck('Structured text remains inert',box.querySelectorAll('script').length===0&&box.textContent.includes('<script>'));
  const block={...ref,artifact_id:'structured-blocks',title:'Structured blocks',renderer_kind:'text',blocks:[{kind:'note',text:'Retain block content'}]};
  ck('Block-only artifact publication is admitted',A.publish(block).ok);
  ck('Shared text renderer preserves block-only content',A.render(block).includes('Retain block content'));
 },
 repeated_revision_keeps_schedule_review_current:ck=>{
  const p=prepared();act('pd-build-at',{id:p.plan_id});act('sched-set-build-kind',{value:'one_time'});act('sched-create-build',{planId:p.plan_id,planVersion:String(p.version)});
  const b=S.list().builds.find(b=>b.target_id===p.plan_id);if(!b)throw Error('Real schedule creation was not admitted');
  const original={version:b.exact_target_version,hash:b.exact_target_hash};
  ck('V2 is authored through the Plan revision owner',P.revise(p.plan_id,'First revision').ok);
  const stale={id:b.schedule_id,version:String(b.pendingVersion),hash:b.pendingHash,revision:String(b.revision)};
  ck('V3 is authored through the same Plan identity',P.revise(p.plan_id,'Second revision').ok);
  ck('Already-invalidated schedule advertises V3, not stale V2',b.state==='invalidated'&&b.pendingVersion===3&&b.pendingHash===P.hash(p.plan_id));
  ck('Revision does not silently retarget bound V1',b.exact_target_version===original.version&&b.exact_target_hash===original.hash);
  const before=JSON.stringify(S.list());act('sched-rebind-build',stale);
  ck('Old Use V2 control cannot silently bind V3',JSON.stringify(S.list())===before&&b.state==='invalidated');
  act('sched-open-plan-record',{id:b.schedule_id});const button=document.querySelector('[data-action="sched-rebind-build"][data-id="'+b.schedule_id+'"]');
  ck('Review button carries exact V3 and schedule revision',button?.dataset.version==='3'&&button.dataset.hash===P.hash(p.plan_id)&&button.dataset.revision===String(b.revision));
  button.click();ck('Fresh explicit Use V3 binds exactly that version',b.state==='active'&&b.exact_target_version===3&&b.exact_target_hash===P.hash(p.plan_id));
 },
 unavailable_embed_reexports_exact_plan:ck=>{
  const p=prepared(),before=P.markdown(p.plan_id),hash=P.hash(p.plan_id);P.openDetails(E.ctx(),p.plan_id);
  const unavailable=document.querySelector('.editor-body .pd-embed-real[data-embed-state="missing"]');
  ck('Unavailable embed has a shared Plan re-export route',!!unavailable?.querySelector('[data-action="pd-export"]'));
  const button=unavailable.querySelector('[data-action="pd-export"]');const stale={...button.dataset};button.click();
  ck('Re-export dialog binds exact current version and hash',Array.from(document.querySelectorAll('[data-action="pd-export-do"][data-kind="plan_document"]')).every(b=>b.dataset.version==='1'&&b.dataset.hash===hash));
  ck('Unavailable-embed navigation does not mutate approved document',P.markdown(p.plan_id)===before&&P.hash(p.plan_id)===hash);
  act('pd-dlg-close');P.revise(p.plan_id,'A subsequent version');const dialog=JSON.stringify(E.ctx().state.dialog);act('pd-export',stale);
  ck('Stale embed re-export route cannot switch to a newer Plan',JSON.stringify(E.ctx().state.dialog)===dialog);
 },
 unknown_local_stage_is_rejected:ck=>{
  const p=prepared(),r=W.records()[W.snapshot().id],before=JSON.stringify({p,work:W.records(),artifacts:PM56_DATA.artifacts});let reason;
  try{W.compute(r,'not-a-stage');}catch(e){reason=e.message;}
  ck('Unknown stage fails at the work identity boundary',reason==='unknown_work_stage');
  ck('Unknown stage performs no output writes',JSON.stringify({p,work:W.records(),artifacts:PM56_DATA.artifacts})===before);
 }
});
})();

/* The stopped V1 is still an unfinished run until V2 is accepted. */
(function(){
 const P=PM56_PLANS,W=PM56_B17_WORK,E=PM56_EXT,A=PM56_ARTIFACTS,G=PM56_GOAL;
 const act=(name,data={})=>E.run(name,{dataset:data},new Event('click'));
 function prepare(topology='agent'){W.start('documents');document.querySelector('[data-action="send"]').click();const p=P.get(W.snapshot().planId);const out=P.build({plan_id:p.plan_id,expected:P.admissionSnapshot(p.plan_id),paused:true,execution_topology:topology});if(!out.ok)throw Error(out.error);return p;}
 Object.assign(B17_CASES,{
  safe_stop_preserves_primary_until_new_revision:ck=>{
   const p=prepare(),runId=p.approved.plan_run_id,original=P.documentRef(p.plan_id),bytes=JSON.stringify(A.resolve(original).revision.record);
   act('pd-stop-revise',{id:p.plan_id});
   ck('Stopped V1 keeps Building and paused secondary truth',p.version===1&&P.buildLabel(p.plan_id)==='Building…'&&P.runs()[runId].state==='paused'&&P.attention(p.plan_id).line==='Paused');
   const before=JSON.stringify({p,runs:P.runs(),artifacts:PM56_DATA.artifacts}),publish=A.publish;A.publish=q=>q.artifact_version===2?{ok:false,error:'injected_revision_failure'}:publish(q);const no=P.revise(p.plan_id,'A new note');A.publish=publish;
   ck('Failed replacement leaves stopped V1 and every owner untouched',!no.ok&&JSON.stringify({p,runs:P.runs(),artifacts:PM56_DATA.artifacts})===before);
   const yes=P.revise(p.plan_id,'A new note');ck('Accepted V2 alone restores Build and closes the old run',yes.ok&&p.version===2&&P.buildLabel(p.plan_id)==='Build'&&P.runs()[runId].state==='cancelled');
   ck('Original shared V1 remains immutable and readable',JSON.stringify(A.resolve(original).revision.record)===bytes);
  },
  resume_invalidates_stopped_revision_permission:ck=>{
   const p=prepare();act('pd-stop-revise',{id:p.plan_id});const result=P.recoveryCommand({expected:P.recoverySnapshot(p.plan_id),action:'resume',idempotency_key:'resume-stopped-v1'});
   ck('Explicit Resume continues the same stopped V1 run',result.ok&&P.buildLabel(p.plan_id)==='Building…');
   const before=JSON.stringify(p),revision=P.revise(p.plan_id,'Stale stopped-state feedback');ck('Resumed execution cannot use an old safe-stop permission',revision.error==='safe_stop_required'&&JSON.stringify(p)===before);
  },
  stopped_goal_revision_does_not_rebind_old_goal:ck=>{
   const p=prepare('goal_driven'),g=G.bound(p.plan_id),runId=p.approved.plan_run_id;act('pd-stop-revise',{id:p.plan_id});
   ck('Stop preserves the exact V1 Goal binding while pausing it',g.status==='paused'&&!G.cancelled(g)&&g.binding.plan_run_id===runId);
   const publish=A.publish;A.publish=q=>q.artifact_version===2?{ok:false,error:'injected_revision_failure'}:publish(q);const no=P.revise(p.plan_id,'Failed new revision');A.publish=publish;
   ck('Rejected revision does not cancel the paused Goal',!no.ok&&!G.cancelled(g)&&g.status==='paused');
   const yes=P.revise(p.plan_id,'Approved new revision');ck('Accepted replacement retires the old Goal through its owner',yes.ok&&G.cancelled(g)&&G.get()===null&&P.runs()[runId].state==='cancelled'&&!p.goalBinding);
   const next=P.build({plan_id:p.plan_id,expected:P.admissionSnapshot(p.plan_id),paused:true});ck('Explicit V2 ordinary Build does not inherit the retired V1 Goal',next.ok&&next.plan_run_id!==runId&&G.get()===null&&P.runs()[next.plan_run_id].topology==='agent'&&!p.goalBinding);
  }
 });
})();

(function(){
 const P=PM56_PLANS,W=PM56_B17_WORK,T=PM56_TODOS,E=PM56_EXT,A=PM56_ARTIFACTS;
 const act=(name,data={})=>E.run(name,{dataset:data},new Event('click'));
 const wait=async(fn)=>{const end=performance.now()+24000;while(!fn()){if(performance.now()>end)throw Error('Actual work timeout');await new Promise(r=>setTimeout(r,40));}};
 Object.assign(B17_CASES,{
  revised_failed_run_builds_new_version_atomically:async ck=>{
   W.start('recovery');document.querySelector('[data-action="send"]').click();const r=W.records()[W.snapshot().id],p=P.get(r.planId);
   ck('Original V1 build admitted',P.build({plan_id:p.plan_id,expected:P.admissionSnapshot(p.plan_id)}).ok);await wait(()=>p.attention?.kind==='failed');
   const oldRun=p.approved.plan_run_id,oldList=JSON.stringify(T.get()),oldSource=P.documentRef(p.plan_id),normalized=r.outputs.normalize,oldTotal=T.get().find(t=>t.plan_step_ids.includes('total')),ticket=T.capture(r.threadId,oldTotal.todo_id),binding=T.bindingsFor(r.threadId,oldTotal.todo_id).at(-1);
   act('pd-stop-revise',{id:p.plan_id});ck('Failed V1 stops without becoming Build',P.buildLabel(p.plan_id)==='Building…');ck('New V2 is accepted without changing old list before Build',P.revise(p.plan_id,'Document explicit input reconnection.').ok&&JSON.stringify(T.get())===oldList);
   act('b17-reconnect',{work:r.id});
   const state=()=>JSON.stringify({p,work:W.records(),todos:T.snapshot(r.threadId),runs:P.runs(),artifacts:PM56_DATA.artifacts}),before=state(),original=P.commitRun;
   P.commitRun=(...args)=>{const out=original(...args);return out.ok?{ok:false,error:'new_run_fault_after_restructure'}:out;};const no=P.build({plan_id:p.plan_id,expected:P.admissionSnapshot(p.plan_id),paused:true});P.commitRun=original;
   ck('Rejected new Build rolls back actual To-Do replacement and cancellation receipts',!no.ok&&no.rollback.complete&&state()===before);
   const yes=P.build({plan_id:p.plan_id,expected:P.admissionSnapshot(p.plan_id)});ck('Explicit V2 Build admits a different run with three new pending leaves',yes.ok&&yes.plan_run_id!==oldRun&&T.get().length===3&&T.get().every(t=>t.status==='pending'&&t.plan_version===2));
   ck('Old item history and bindings retained with cancellation disposition',T.snapshot(r.threadId).removed.length===3&&T.bindings(r.threadId).find(b=>b.binding_id===binding.binding_id).state==='cancelled');
   const stable=state();ck('Old V1 callback cannot affect the V2 run',W.acceptResult(r.id,ticket,binding.binding_id,{}).error==='stale_work_callback'&&state()===stable);
   await wait(()=>p.status==='completed');ck('V2 completes from its own three accepted outcomes',T.outcomeSummary(r.threadId,p.requiredTodoIds).ok&&A.resolve(r.outputs.validate).revision.record.payload.total_cents==='9532');
   ck('Old document and successful V1 output remain available',A.resolve(oldSource).ok&&A.resolve(normalized).ok&&P.runs()[oldRun].state==='cancelled');
   ck('No false stale projection after lifecycle fence changes',!P.progress(p.plan_id).stale);
  },
  pause_epoch_is_not_admission_epoch:ck=>{
   W.start('documents');document.querySelector('[data-action="send"]').click();const p=P.get(W.snapshot().planId);P.build({plan_id:p.plan_id,expected:P.admissionSnapshot(p.plan_id),paused:true});
   const first=T.get()[0],initial=first.run_epoch;act('pd-stop-revise',{id:p.plan_id});
   ck('Pause changes dispatch epoch, not immutable admission epoch',p.runEpoch!==initial&&P.runs()[p.approved.plan_run_id].admission_epoch===initial&&first.run_epoch===initial&&!P.progress(p.plan_id).stale);
   first.run_epoch=initial+99;ck('Forged admission epoch still marks progress stale',P.progress(p.plan_id).stale);first.run_epoch=initial;
   P.runs()[p.approved.plan_run_id].epoch++;ck('Mismatched current dispatch epoch still marks progress stale',P.progress(p.plan_id).stale);
  }
 });
})();
