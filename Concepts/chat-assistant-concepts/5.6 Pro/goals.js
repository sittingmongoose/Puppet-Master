/* Goal Runtime concept owner, Batch 15.
 * One text objective, four lifecycle states, explicit authority and epoch-fenced
 * continuation. Records are session-memory projections, not native durability.
 * Plan/To-Do/work/evidence/scheduling ownership remains with the shared owners.
 */
(function(){
 'use strict';
 const D=window.PM56_DATA, E=window.PM56_EXT, TX=window.PM56_TX;
 const RT=window.PM56_RUNTIME=window.PM56_RUNTIME||{};
 const clone=x=>x==null?x:JSON.parse(JSON.stringify(x)), now=()=>new Date().toISOString();
 const store=RT.goals={byId:{},currentByThread:{},cancellations:{},proposals:{},tickets:{},receipts:{},seq:0,generation:1};
 RT.boundGoals={byPlan:{},seq:0};
 const owners=new Map(),timers=new Map();
 const ui={editing:null,draft:null,history:false,continuations:false,proposal:null};
 const labels={active:'Running',paused:'Paused',blocked:'Blocked',completed:'Completed'};
 const tones={active:'working',paused:'idle',blocked:'blocked',completed:'done'};
 const origins=['user_request','agent_requested_by_user','plan_build','internal_workflow'];
 const originLabels={user_request:'the user asked for it directly',agent_requested_by_user:'an agent created it because the user asked the agent to',plan_build:'an approved Plan was built as a Goal',internal_workflow:'a workflow uses it internally'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const context=()=>E.ctx?.();
 const thread=tid=>context()?.state.threads.find(t=>t.id===tid);
 function scope(tid){const t=thread(tid);if(!t)return null;return {projectId:t.projectId||'pm',threadId:t.id,worktreeId:t.worktreeId||t.worktree?.id||context().state.worktree||'concept:default'};}
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const cancelled=g=>!!(g&&store.cancellations[g.id]);
 function get(tid){tid=tid||context()?.thread.id||'query';const g=store.byId[store.currentByThread[tid]];if(g?.demo&&!g.scopeInitialized&&context()){g.scope=scope(tid);g.projectId=g.scope.projectId;g.scopeInitialized=true;}return g&&!cancelled(g)?g:null;}
 const byId=id=>store.byId[id]||null;
 function lineageFor(id,revision,kind,o={}){if(!origins.includes(kind))throw new Error('invalid_origin_kind');return {schema:'pm.goal.origin_lineage.v1',goal_id:id,goal_revision:revision,origin_kind:kind,origin_label:originLabels[kind],source_message_refs:o.source_message_refs||[],source_context_manifest_ref:o.source_context_manifest_ref||null,bound_plan_ref:o.bound_plan_ref||null,owning_workflow_ref:o.owning_workflow_ref||null};}
  var GOAL_FIXTURE = {
    demo:true,
    id:'goal-query-perf',
    projectId:'pm',
    thread:'query',
    /* One paragraph. The outcome, the finish condition and the constraints all
       live in this prose, because a user who wants to change any of them edits
       one field rather than reconciling five. */
    objective:'Reduce the tenant-scoped analytics query p95 below 100 ms without exceeding the accepted 8% write-amplification threshold, while preserving a rehearsed forward-rollback path.',
    revision:3,
    status:'active',                 /* active | paused | blocked | completed  */
    blockedReason:null,
    activeRunRef:'run-query-perf',
    createdAt:'2026-08-24T09:10:00Z',
    updatedAt:'2026-08-27T11:42:00Z',
    currentnessHash:'c8a1f0d4',
    stopEpoch:0,                     /* latched by Pause / Cancel             */
    mode:null,                       /* a Goal is not a mode — permanently null */
    revisions:[
      { revision:1, at:'2026-08-24T09:10:00Z', source:'user_direct',
        objective:'Make the analytics query faster.' },
      { revision:2, at:'2026-08-24T14:05:00Z', source:'user_direct',
        objective:'Reduce the tenant-scoped analytics query p95 below 100 ms.' },
      { revision:3, at:'2026-08-27T11:42:00Z', source:'agent_proposed_user_approved',
        approvalId:'apr-4471',
        objective:'Reduce the tenant-scoped analytics query p95 below 100 ms without exceeding the accepted 8% write-amplification threshold, while preserving a rehearsed forward-rollback path.' }
    ],
    /* GoalContinuationRecord projections. `result` is the host decision, not a
       model assertion; `stopEpochAt` is what the decision was computed against. */
    continuations:[
      { id:'cont-1', at:'2026-08-27T11:44:00Z', result:'continue', stopEpochAt:0, note:'Objective unfinished, thread idle, no stop latched.' },
      { id:'cont-2', at:'2026-08-27T11:58:00Z', result:'continue', stopEpochAt:0, note:'Index rewrite landed; benchmark evidence still open.' },
      { id:'cont-3', at:'2026-08-27T12:11:00Z', result:'continue', stopEpochAt:0, note:'Third host-admitted turn. One model response was never completion.' }
    ]
  };

 function change(g,values){for(const [k,v] of Object.entries(values))TX.set(g,k,v);}
 function stamp(g){TX.set(g,'updatedAt',now());TX.set(g,'currentnessHash',g.id+':r'+g.revision+':e'+g.stopEpoch+':'+(++store.seq));}
 function capture(g){return g?{goalId:g.id,revision:g.revision,hash:g.currentnessHash,epoch:g.stopEpoch,run:g.activeRunRef||null,scope:clone(g.scope),binding:clone(g.binding||null),generation:store.generation}:null;}
 function current(token){const g=byId(token?.goalId);if(!g||cancelled(g))return 'goal_unavailable';if(token.generation!==store.generation)return 'restored_generation';if(token.revision!==g.revision||token.hash!==g.currentnessHash)return 'stale_objective_revision';if(token.epoch!==g.stopEpoch)return 'stale_stop_epoch';if(token.run!==(g.activeRunRef||null))return 'run_replaced';if(!equal(token.scope,g.scope)||!equal(g.scope,scope(g.thread)))return 'scope_changed';if(!equal(token.binding,g.binding||null))return 'binding_changed';return null;}
 function allowedMutation(token){const error=current(token);if(error)return {ok:false,error};const g=byId(token.goalId);if(context()?.thread.id!==g.thread)return {ok:false,error:'wrong_thread'};if(!['active','paused','blocked'].includes(g.status))return {ok:false,error:'goal_not_mutable'};return {ok:true,goal:g};}
 function textError(text){return typeof text!=='string'||!text.trim()?'objective_required':text.length>4000?'objective_too_long':null;}
 function create(o){
  const error=textError(o.objective);if(error)return {ok:false,error};
  if(o.explicitRequest!==true)return {ok:false,error:'explicit_request_required'};
  const sc=scope(o.threadId);if(!sc||o.projectId&&o.projectId!==sc.projectId)return {ok:false,error:'scope_changed'};
  if(o.scope&&!equal(o.scope,sc))return {ok:false,error:'scope_changed'};
  const prior=get(o.threadId);if(prior&&prior.status!=='completed')return {ok:false,error:'active_goal_exists'};
  const kind=o.origin||'user_request';if(!origins.includes(kind))return {ok:false,error:'invalid_origin_kind'};
  const seq=store.seq+1;TX.set(store,'seq',seq);const id='goal-'+seq+'-'+o.threadId;
  const g={id,projectId:sc.projectId,thread:o.threadId,scope:clone(sc),objective:o.objective,revision:1,status:'active',blockedReason:null,activeRunRef:o.runId||null,createdAt:now(),updatedAt:now(),currentnessHash:id+':r1:e0',stopEpoch:0,
   revisions:[{revision:1,at:now(),source:'user_direct',objective:o.objective,sourceMessageId:o.sourceMessageId||null}],continuations:[],history:[],
   lineage:lineageFor(id,1,kind,{source_message_refs:o.sourceMessageId?[o.sourceMessageId]:[],owning_workflow_ref:o.workRef?.ref||null}),workRef:o.workRef?clone(o.workRef):null};
  TX.set(store.byId,id,g);TX.set(store.currentByThread,o.threadId,id);return {ok:true,goal:g};
 }
 function fence(g,reason){clearTimeout(timers.get(g.id));timers.delete(g.id);TX.set(g,'stopEpoch',g.stopEpoch+1);TX.set(g,'history',(g.history||[]).concat({at:now(),what:'fenced',note:reason}));stamp(g);}
 function edit(token,text,source='user_direct',approvalId=null){
  const a=allowedMutation(token);if(!a.ok)return a;const g=a.goal,error=textError(text);if(error)return {ok:false,error};
  if(!['user_direct','agent_proposed_user_approved'].includes(source))return {ok:false,error:'silent_rewrite_forbidden'};
  if(source==='agent_proposed_user_approved'){
   const p=store.proposals[approvalId];if(!p||p.state!=='approving'||p.objective!==text||!equal(p.token,token))return {ok:false,error:'approval_required'};
  }
  if(g.objective===text)return {ok:true,unchanged:true,goal:g};
  fence(g,'Objective revision changed; earlier callbacks are invalid.');
  change(g,{objective:text,revision:g.revision+1,revisions:g.revisions.concat({revision:g.revision+1,at:now(),source,approvalId,objective:text}),lineage:{...g.lineage,goal_revision:g.revision+1}});stamp(g);
  if(g.binding){window.PM56_PLANS?.goalConflict?.(g.binding.assistant_plan_id);change(g,{status:'blocked',blockedReason:'The objective changed. Review the exact bound Plan through Revise before admitting more mutation.'});}
  else if(g.status==='active')TX.defer(()=>kick(g.id));
  return {ok:true,goal:g};
 }
 function propose(token,text,request){
  const a=allowedMutation(token);if(!a.ok)return a;
  const error=textError(text);if(error)return {ok:false,error};
  if(!request?.explicit||typeof request.text!=='string'||!request.text.trim())return {ok:false,error:'explicit_change_request_required'};
  const id='goal-approval-'+(++store.seq),p={id,token:clone(token),current:a.goal.objective,objective:text,request:request.text,state:'pending',createdAt:now(),expiresAt:Date.now()+300000};
  store.proposals[id]=p;ui.proposal=id;return {ok:true,approval:clone(p)};
 }
 function approve(id){const p=store.proposals[id];if(!p||p.state!=='pending')return {ok:false,error:'approval_not_pending'};
  if(Date.now()>p.expiresAt){p.state='expired';return {ok:false,error:'approval_expired'};}
  const error=current(p.token);if(error){p.state='stale';return {ok:false,error};}
  p.state='approving';const out=edit(p.token,p.objective,'agent_proposed_user_approved',id);p.state=out.ok?'approved':'stale';if(ui.proposal===id)ui.proposal=null;return out;
 }
 function deny(id){const p=store.proposals[id];if(!p||p.state!=='pending')return {ok:false,error:'approval_not_pending'};p.state='denied';if(ui.proposal===id)ui.proposal=null;return {ok:true};}
 function lifecycle(token,to){
  const a=allowedMutation(token);if(!a.ok)return a;const g=a.goal,P=window.PM56_PLANS;
  if(to==='active'){
   if(!['paused','blocked'].includes(g.status))return {ok:false,error:'not_resumable'};
   const eligible=resumeEligibility(g);if(!eligible.ok)return eligible;
   if(g.binding){const check=P?.canResumeGoal?.(g.binding);if(check&&!check.ok)return check;}
  }else if(!['paused','cancel'].includes(to))return {ok:false,error:'invalid_transition'};
  fence(g,'Explicit user '+to+'.');
  if(to==='cancel'){
   const receipt={goal_id:g.id,revision:g.revision,user_stop_epoch:g.stopEpoch,at:now(),event:'goal.cancelled'};
   TX.set(store.cancellations,g.id,receipt);if(store.currentByThread[g.thread]===g.id)TX.remove(store.currentByThread,g.thread);
   if(g.binding)P?.boundCancel(g.binding.assistant_plan_id,g.stopEpoch);
   return {ok:true,receipt};
  }
  TX.set(g,'status',to);if(to==='active')TX.set(g,'blockedReason',null);stamp(g);
  if(g.binding){if(to==='paused')P?.boundPause(g.binding.assistant_plan_id,g.stopEpoch);else P?.boundResume(g.binding.assistant_plan_id,g.stopEpoch);}
  else if(to==='active')kick(g.id);
  return {ok:true,goal:g};
 }
 function inspector(g){const owner=g.workRef&&owners.get(g.workRef.kind);if(!owner)return {eligible:false,complete:false,reason:'No work/evidence evaluator is attached in this local concept.',fingerprint:'unbound'};
  try{return owner.inspect(g.workRef.ref,g);}catch(e){return {eligible:false,complete:false,reason:'Owner inspection failed: '+e.message,fingerprint:'failed'};}
 }
 // A blocked owner must report its condition cleared; an explicit user Resume
 // never means a provider reset or a stale callback may resume by itself.
 function resumeEligibility(g){
  if(!g||g.status==='completed'||cancelled(g))return {ok:false,error:'not_resumable'};
  if(g.binding&&g.blockedReason)return {ok:false,error:'owner_block_not_cleared'};
  if(g.status==='blocked'&&!g.demo){const x=inspector(g);if(!x.eligible&&!decisionComplete(x))return {ok:false,error:x.reason||'owner_block_not_cleared'};}
  return {ok:true};
 }
 function block(g,reason,waitKind){if(waitKind==='quota')return;if(g.status==='active'){TX.set(g,'status','blocked');TX.set(g,'blockedReason',reason||'The work owner has no eligible attempt.');stamp(g);}}
 function decisionComplete(x){return x?.complete===true&&x.requiredResolved===true&&x.verified===true&&Array.isArray(x.evidenceRefs)&&x.evidenceRefs.length>0;}
 function evaluate(id){const g=byId(id);if(!g||cancelled(g))return {ok:false,error:'goal_unavailable'};
  const error=current(capture(g));if(error)return {ok:false,error};
  const x=inspector(g),key=[g.id,g.revision,g.activeRunRef,g.stopEpoch,x.nextAttemptRef||x.fingerprint].join('|');
  const prior=Object.values(store.tickets).find(t=>t.key===key&&t.state==='pending');if(prior)return {ok:true,ticket:clone(prior),replayed:true};
  const result=g.status==='paused'?'pause':g.status==='blocked'?'blocked':g.status==='completed'?'complete':decisionComplete(x)?'complete':x.eligible?'continue':'blocked';
  const t={id:'continuation-'+(++store.seq),key,token:capture(g),fingerprint:x.fingerprint,result,state:'pending',evidenceRefs:clone(x.evidenceRefs||[]),reason:x.reason||null,waitKind:x.waitKind||null,at:now()};
  store.tickets[t.id]=t;return {ok:true,ticket:clone(t)};
 }
 function recordDecision(g,t,result,note){g.continuations.push({id:t.id,at:now(),result,stopEpochAt:t.token.epoch,goalRevision:t.token.revision,runRef:t.token.run,note:note||'',completion_evidence_refs:clone(t.evidenceRefs)});}
 function dispatch(ticketId){const t=store.tickets[ticketId];if(!t)return {ok:false,error:'unknown_continuation'};
  if(t.state==='settled')return {ok:true,replayed:true,receipt:clone(t.receipt)};
  if(t.state!=='pending')return {ok:false,error:'continuation_discarded'};
  const g=byId(t.token.goalId),error=current(t.token);if(error){t.state='discarded';t.reason=error;if(g)recordDecision(g,t,'pause',error);return {ok:false,error};}
  if(g.status!=='active'){t.state='discarded';recordDecision(g,t,g.status==='paused'?'pause':'blocked','Goal is not active.');return {ok:false,error:'goal_not_active'};}
  const x=inspector(g);if(x.fingerprint!==t.fingerprint){t.state='discarded';recordDecision(g,t,'blocked','Work or evidence changed after evaluation.');return {ok:false,error:'work_currentness_changed',reason:x.reason,waitKind:x.waitKind||null};}
  if(t.result==='complete'){
   if(!decisionComplete(x)){t.state='discarded';return {ok:false,error:'completion_not_verified'};}
   const owner=owners.get(g.workRef?.kind),settled=owner?.complete?.(g.workRef.ref,g,x)||{ok:true};
   if(!settled.ok){t.state='discarded';return settled;}
   change(g,{status:'completed',blockedReason:null,completion:{at:now(),revision:g.revision,runRef:g.activeRunRef,evidenceRefs:clone(x.evidenceRefs),binding:clone(g.binding||null)}});stamp(g);
   recordDecision(g,t,'complete','The owning workflow verified all required outcomes and supplied current evidence.');
  }else if(t.result==='continue'&&x.eligible){
   const out=owners.get(g.workRef.kind)?.advance?.(g.workRef.ref,g,t);
   if(!out?.ok){t.state='discarded';block(g,out?.error||'Work admission refused.');recordDecision(g,t,'blocked',out?.error||'Work admission refused.');return out||{ok:false,error:'work_admission_refused'};}
   recordDecision(g,t,'continue','One ordinary local work attempt was admitted against the captured objective, scope and stop epoch.');
  }else{t.state='discarded';block(g,x.reason||'No runnable work.',x.waitKind);recordDecision(g,t,'blocked',x.reason||'No runnable work.');return {ok:false,error:'work_not_eligible',reason:x.reason,waitKind:x.waitKind||null};}
  t.state='settled';t.receipt={continuation_id:t.id,goal_id:g.id,result:t.result,revision:t.token.revision,run_ref:t.token.run};store.receipts[t.id]=clone(t.receipt);
  return {ok:true,receipt:clone(t.receipt)};
 }
 function kick(id){const g=byId(id);if(!g||g.binding||cancelled(g)||g.status!=='active'||timers.has(id))return;
  const e=evaluate(id);if(!e.ok)return;if(e.ticket.result==='blocked'){block(g,e.ticket.reason,e.ticket.waitKind);return;}if(!['continue','complete'].includes(e.ticket.result))return;
  const timer=setTimeout(()=>{timers.delete(id);const out=dispatch(e.ticket.id);context()?.renderApp();if(out.ok&&g.status==='active')kick(id);},1000);timers.set(id,timer);
 }
 // Called only by an admitted shared quota consent. It never clears a manual
 // stop or changes Goal lifecycle. The captured revision/run/epoch must match.
 function resumeFromQuota(token){
  const error=current(token),g=byId(token?.goalId);if(error)return {ok:false,error};
  if(g.status!=='active')return {ok:false,error:'goal_not_active'};
  if(g.binding){const out=window.PM56_PLANS.resumeFromQuota(g.binding);return out;}
  const x=inspector(g);if(!x.eligible&&!decisionComplete(x))return {ok:false,error:x.reason||'work_not_eligible'};
  kick(g.id);return {ok:true,goal_id:g.id,run_id:g.activeRunRef};
 }
 function bound(planId){return RT.boundGoals.byPlan[planId]||null;}
 function boundList(tid){return Object.values(RT.boundGoals.byPlan).filter(g=>!cancelled(g)&&(!tid||g.thread===tid));}
 function createBound(o){
  const prior=bound(o.plan_id);if(prior?.idempotency_key===o.idempotency_key&&!cancelled(prior))return {ok:true,goal:prior,replayed:true};
  if(prior&&!cancelled(prior)&&prior.status!=='completed')return {ok:false,error:'active_run_exists'};
  if(o.expected_hash!==o.plan_hash)return {ok:false,error:'stale_plan_version'};
  const out=create({threadId:o.thread,projectId:o.project_id,scope:o.scope,objective:'Complete the approved Plan “'+o.title+'” at version V'+o.version+' exactly as written.',explicitRequest:true,origin:'plan_build',runId:o.plan_run_id,workRef:{kind:'assistant_plan',ref:o.plan_id}});
  if(!out.ok)return out;const g=out.goal;
  change(g,{bound:true,idempotency_key:o.idempotency_key,binding:{schema:'pm.goal.plan_binding.v1',goal_id:g.id,assistant_plan_id:o.plan_id,plan_version:o.version,plan_hash:o.plan_hash,plan_run_id:o.plan_run_id,todo_list_ref:'todos:'+o.thread,planunit_bundle_ref:o.planunit_bundle_ref||null},lineage:lineageFor(g.id,1,'plan_build',{source_message_refs:o.source_refs||[],bound_plan_ref:o.plan_id+'@V'+o.version,owning_workflow_ref:o.plan_run_id})});
  TX.set(RT.boundGoals.byPlan,o.plan_id,g);return {ok:true,goal:g};
 }
 function boundTransition(planId,to,note){const g=bound(planId);if(!g)return null;
  if(to==='completed'){const e=evaluate(g.id);return e.ok?dispatch(e.ticket.id):e;}
  return lifecycle(capture(g),to==='canceled'||to==='cancelled'?'cancel':to);
 }
 function checkpoint(tid){const g=get(tid);return {schema:'pm.concept.goal_checkpoint.v1',durability:'session_memory_only',goal:g?clone(g):null,scope:scope(tid),capturedAt:now()};}
 function rebind(snapshot,targetId,kind){
  if(!snapshot?.goal)return {ok:true,empty:true};if(!['branch','restore','rewind'].includes(kind))return {ok:false,error:'invalid_rebind_kind'};
  const sc=scope(targetId);if(!sc||sc.projectId!==snapshot.scope?.projectId)return {ok:false,error:'project_mismatch'};
  const old=get(targetId);if(old&&old.status!=='completed'){fence(old,'Explicit '+kind+' safe boundary.');if(old.binding)window.PM56_PLANS?.boundPause(old.binding.assistant_plan_id);}
  const g=clone(snapshot.goal),id=kind==='branch'?'goal-branch-'+(++store.seq)+'-'+targetId:g.id;
  g.id=id;g.thread=targetId;g.scope=clone(sc);g.projectId=sc.projectId;g.stopEpoch=Math.max(g.stopEpoch,old?.stopEpoch||0)+1;g.currentnessHash=id+':rebind:'+g.stopEpoch+':'+(++store.seq);g.status='paused';g.blockedReason=null;g.activeRunRef=null;g.binding=null;g.bound=false;g.workRef=null;
  g.lineage={...g.lineage,goal_id:id,rebound_from:snapshot.goal.id,rebind_kind:kind,live_controller_reused:false};
  store.byId[id]=g;store.currentByThread[targetId]=id;delete store.cancellations[id];return {ok:true,goal:g,requiresExplicitWorkRebind:true};
 }
 function restore(){for(const t of timers.values())clearTimeout(t);timers.clear();store.generation++;for(const k of ['byId','currentByThread','cancellations','proposals','tickets','receipts'])store[k]={};RT.boundGoals.byPlan={};RT.boundGoals.seq=0;Object.assign(ui,{editing:null,draft:null,proposal:null,history:false,continuations:false});const g=clone(GOAL_FIXTURE);g.scope=scope('query')||{projectId:g.projectId,threadId:'query',worktreeId:'concept:default'};g.projectId=g.scope.projectId;g.workRef=null;g.lineage=lineageFor(g.id,g.revision,'user_request');store.byId[g.id]=g;store.currentByThread.query=g.id;D.goal=g;}
 function summary(tid){const g=get(tid);return g?{tone:tones[g.status],status:g.status,statusLine:labels[g.status],objective:g.objective,revision:g.revision,blocker:g.blockedReason}:{tone:'idle',status:'none',statusLine:'No goal',objective:''};}
 const button=(action,label,extra='')=>'<button class="soft-button" data-action="'+action+'" '+extra+'>'+esc(label)+'</button>';
 function renderEditor(c){const p=store.proposals[ui.proposal];if(!p||p.state!=='pending'||p.token.goalId!==get()?.id)return '';
  return '<section class="goal-approval" data-k="goal-approval:'+p.id+'"><strong>Review objective change</strong><div class="goal-approval-pair"><div><label>Current</label><p>'+esc(p.current)+'</p></div><div><label>Proposed</label><p>'+esc(p.objective)+'</p></div></div><p class="goal-note">Nothing changes until you approve.</p><div class="plan-actions">'+button('goal-deny-proposal','Cancel')+button('goal-approve-proposal','Approve Change')+'</div></section>';
 }
 function renderSection(c){const g=get(c.thread.id);if(!g)return '<section class="goal-section-v2"><p>No Goal on this thread.</p>'+button('goal-new','Create Goal')+'</section>';
  const editing=ui.editing?.goalId===g.id,wait=g.status==='active'?inspector(g):null;
  return '<section class="goal-section-v2" data-goal-id="'+esc(g.id)+'" data-k="goal:'+esc(g.id)+'">'+renderEditor(c)+
   '<div class="goal-head"><span class="goal-chip goal-chip-'+g.status+'"><i class="goal-dot goal-dot-'+g.status+'"></i>'+labels[g.status]+'</span><span class="goal-rev">Revision '+g.revision+'</span></div>'+
   (wait?.waitKind==='quota'?'<p class="goal-note">Waiting for provider Usage. The Goal stays running; continuation requires the shared quota owner.</p>':'')+
   (g.blockedReason?'<p class="goal-blocker-line">'+esc(g.blockedReason)+'</p>':'')+
   (editing?'<div class="goal-edit"><textarea class="goal-objective-input" data-goal-input="objective" data-pm-keep rows="5">'+esc(ui.draft)+'</textarea><div class="goal-edit-foot"><span class="goal-count">'+ui.draft.length+' / 4000</span><span class="spacer"></span>'+button('goal-cancel-edit','Cancel edit')+button('goal-save','Save')+'</div></div>':'<p class="goal-objective-full">'+esc(g.objective)+'</p>')+
   '<div class="goal-lifecycle">'+(g.status==='active'?button('goal-pause','Pause'):button('goal-resume','Resume',!resumeEligibility(g).ok?'disabled':''))+button('goal-cancel','Cancel Goal',g.status==='completed'?'disabled':'')+(!editing?button('goal-edit','Edit objective',g.status==='completed'?'disabled':''):'')+'</div>'+
   (g.binding?'<div class="goal-lifecycle">'+button('goal-bound-open-plan','Open exact Plan · V'+g.binding.plan_version,'data-id="'+esc(g.binding.assistant_plan_id)+'"')+(g.blockedReason?button('goal-revise-plan','Revise Plan','data-id="'+esc(g.binding.assistant_plan_id)+'"'):'')+'</div>':'')+
   '<div class="goal-disclosures">'+button('goal-toggle-history','Objective history')+button('goal-toggle-conts','Continuation decisions')+button('goal-request-change','Ask for a replacement',g.status==='completed'?'disabled':'')+'</div>'+
   (ui.history?'<div class="goal-history">'+g.revisions.slice().reverse().map(r=>'<div class="goal-history-row"><strong>Revision '+r.revision+'</strong><small>'+esc(r.source==='user_direct'?'Your direct change':'Your approved proposal')+'</small><p>'+esc(r.objective)+'</p></div>').join('')+'</div>':'')+
   (ui.continuations?'<div class="goal-conts">'+g.continuations.slice().reverse().map(t=>'<div class="goal-cont-row"><strong>'+esc(t.result)+'</strong><small>Stop epoch '+t.stopEpochAt+'</small><p>'+esc(t.note)+'</p></div>').join('')+(g.continuations.length?'':'<p>No continuation decision yet.</p>')+'</div>':'')+
   '<details class="goal-technical"><summary>Details</summary><p>Session-memory concept. No native host persistence or provider execution.</p><pre>'+esc(JSON.stringify({goal_id:g.id,origin:g.lineage,scope:g.scope,binding:g.binding||null,active_run_ref:g.activeRunRef,currentness_hash:g.currentnessHash,user_stop_epoch:g.stopEpoch},null,2))+'</pre>'+(!g.binding?button('goal-continue','Evaluate next turn',g.status==='active'?'':'disabled'):'')+'</details></section>';
 }
 function renderCompact(c){const g=get(c.thread.id);if(!g)return '';if(ui.editing||ui.proposal||ui.history||ui.continuations)return renderSection(c);
  return '<section class="goal-compact" data-goal-id="'+esc(g.id)+'"><div class="goal-compact-head"><span class="goal-chip goal-chip-'+g.status+'">'+labels[g.status]+'</span><span class="goal-rev">Revision '+g.revision+'</span></div><p class="ab-objective goal-objective-2">'+esc(g.objective)+'</p><div class="goal-compact-actions">'+(g.status==='active'?button('goal-pause','Pause'):button('goal-resume','Resume',!resumeEligibility(g).ok?'disabled':''))+button('goal-open-editor','Edit objective',g.status==='completed'?'disabled':'')+button('goal-cancel','Cancel',g.status==='completed'?'disabled':'')+button('goal-details','Details')+'</div></section>';
 }
 function refresh(c,out){c.renderApp();c.renderOverlays?.();if(out?.ok===false)c.toast('No change made',out.error?.replaceAll('_',' ')||'The owner refused this action.');}
 function openGoal(c){c.state.activity.open=true;c.state.activity.domain='goal';c.state.activity.scope='focus';c.state.menu=null;if(c.state.activity.expanded&&!c.state.activity.expanded.includes('goal'))c.state.activity.expanded.push('goal');}
 const actions={
  'goal-new':c=>{c.state.composer='/goal '+c.state.composer.replace(/^\/goal\s*/,'');c.state.menu=null;refresh(c);setTimeout(()=>document.querySelector('textarea.composer-input,textarea[data-composer]')?.focus(),0);},
  'goal-details':c=>{ui.history=true;openGoal(c);refresh(c);},
  'goal-edit':c=>{const g=get();if(!g||g.status==='completed')return;ui.editing=capture(g);ui.draft=g.objective;refresh(c);},
  'goal-open-editor':c=>{actions['goal-edit'](c);openGoal(c);refresh(c);},
  'goal-cancel-edit':c=>{ui.editing=null;ui.draft=null;refresh(c);},
  'goal-save':c=>{const out=edit(ui.editing,ui.draft);if(out.ok){ui.editing=null;ui.draft=null;}refresh(c,out);},
  'goal-pause':c=>refresh(c,lifecycle(capture(get()),'paused')),
  'goal-resume':c=>refresh(c,lifecycle(capture(get()),'active')),
  'goal-cancel':c=>{const out=lifecycle(capture(get()),'cancel');if(out.ok){ui.editing=null;ui.proposal=null;}refresh(c,out);},
  'goal-toggle-history':c=>{ui.history=!ui.history;refresh(c);},
  'goal-toggle-conts':c=>{ui.continuations=!ui.continuations;refresh(c);},
  'goal-request-change':c=>{const g=get();if(!g)return;RT.composer.destination={kind:'goal-objective-proposal',refId:g.id,label:'Request objective change',goalToken:capture(g)};c.toast('Composer targeted at the objective','Send the complete replacement you explicitly want proposed. Approval is still required.');refresh(c);},
  'goal-approve-proposal':c=>refresh(c,approve(ui.proposal)),
  'goal-deny-proposal':c=>refresh(c,deny(ui.proposal)),
  'goal-continue':c=>{const g=get();if(!g)return;const out=evaluate(g.id);if(out.ok){setTimeout(()=>refresh(context(),dispatch(out.ticket.id)),450);}ui.continuations=true;refresh(c,out);},
  'goal-bound-open-plan':(c,b)=>window.PM56_PLANS?.openDetails(c,b.dataset.id),
  'goal-revise-plan':(c,b)=>E._actions[window.PM56_PLANS?.get(b.dataset.id)?.status==='building'?'pd-stop-revise':'pd-revise']?.(c,{dataset:{id:b.dataset.id}})
 };
 for(const [name,fn] of Object.entries(actions))E.action(name,(c,b)=>{fn(c,b);return true;});
 for(const [name,to] of [['goal-bound-pause','paused'],['goal-bound-resume','active'],['goal-bound-cancel','cancel']])E.action(name,(c,b)=>{refresh(c,lifecycle(capture(bound(b.dataset.id)),to));return true;});
 E.chainAction('stop-run',c=>{const g=get(c.thread.id);if(g?.status==='active')lifecycle(capture(g),'paused');else{const r=window.PM56_PLANS?.current(c.thread.id);if(r?.workRef&&r.status==='building')window.PM56_PLANS.boundPause(r.plan_id);}window.PM56_SCHED?.latchStop('Explicit Stop from the composer.');return false;});
 E.slot('goalSection',renderSection);E.slot('goalEditor',renderEditor);E.chainAction('reset-all',()=>{restore();return false;});
 document.addEventListener('input',e=>{if(e.target.getAttribute?.('data-goal-input')==='objective'){ui.draft=e.target.value;const count=e.target.parentNode.querySelector('.goal-count');if(count)count.textContent=ui.draft.length+' / 4000';}});
 window.PM56_GOAL={get,byId,summary,create,capture,current,resumeEligibility,resumeFromQuota,edit,propose,approve,deny,lifecycle,evaluate,dispatch,kick,scope,checkpoint,rebind,
  cancelled,proposal:id=>clone(store.proposals[id]||null),tickets:()=>clone(store.tickets),cancellation:id=>clone(store.cancellations[id]||null),
  registerOwner:(kind,api)=>{if(owners.has(kind))throw new Error('duplicate_goal_work_owner');owners.set(kind,api);},
  fenceThread:tid=>{const g=get(tid);if(g){fence(g,'Thread lineage changed.');g.status='paused';if(g.binding)window.PM56_PLANS?.boundPause(g.binding.assistant_plan_id);}return g;},
  bound,boundList,createBound,boundTransition,restore,fixture:()=>clone(GOAL_FIXTURE),render:{section:renderSection,compact:renderCompact,editor:renderEditor},chip:()=>'',sidebar:()=>summary().statusLine,
  originKinds:()=>origins.slice(),originLabel:k=>originLabels[k]||null,lineageFor,progress:()=>({completed:0,total:0,open:0,retired:true}),phaseNumber:()=>0,
  exportRecord:id=>{const g=byId(id);return g?{schema_id:'pm.goal.record.v2',goal_id:g.id,project_id:g.projectId,thread_id:g.thread,objective_text:g.objective,revision:g.revision,state:g.status,blocked_reason_ref:g.blockedReason,active_run_ref:g.activeRunRef,created_at:g.createdAt,updated_at:g.updatedAt,currentness_hash:g.currentnessHash}:null;}
 };
 restore();
})();
