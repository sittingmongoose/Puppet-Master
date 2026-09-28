/* Bounded Crew concept result/admission protocol on RT.collab.runs.
 * Local example calculations only: no provider calls, native dispatch, filesystem
 * edits, or production Usage. Contracts are fixture inputs, not new product canon. */
(function(){
 'use strict';
 const E=window.PM56_EXT,C=window.PM56_COLLAB;
 const clone=x=>JSON.parse(JSON.stringify(x)),fail=error=>({ok:false,error});
 const canonical=x=>x&&typeof x==='object'?(Array.isArray(x)?x.map(canonical):Object.fromEntries(Object.keys(x).sort().filter(k=>x[k]!==undefined).map(k=>[k,canonical(x[k])]))):x===undefined?null:x;
 const stable=x=>JSON.stringify(canonical(x));
 const hash=x=>{let h=2166136261;for(const c of stable(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return 'example:'+((h>>>0).toString(16)).padStart(8,'0');};
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 const run=id=>C.run(id),owns=id=>!!run(id)?.crew?.protocolVersion,autoRequests=new Map();
 const sourceHash=input=>{const x=clone(input);delete x.sourceHash;return hash(x);};
 const signature=d=>hash({thread:d.threadId,name:d.name,purpose:d.purpose,request:d.requestKey,rows:d.rows,config:d.config,input:d.crewInput,policy:d.policyRevision||null});
 function preflight(d,c){
  if(!d||d.kind!=='crew'||!d.crewInput)return fail('crew_work_missing');
  const i=d.crewInput;
  if(!d.requestKey||!c.state.threads.some(t=>t.id===(d.threadId||c.state.selectedThread)))return fail('destination_missing');
  if(d.reconfigureRunId||d.boundPlanId)return fail('bound_plan_or_reconfiguration_not_in_this_example');
  if(!['Agent'].includes(c.state.mode))return fail('parent_mode_disallows_example_execution');
  if(d.wonderer||d.grillMe||(!Array.isArray(d.rows)||d.rows.length!==3))return fail('this_recorded_work_contract_requires_three_core_roles');
  if(i.sourceHash!==sourceHash(i))return fail('source_hash_mismatch');
  if(!Array.isArray(i.rows)||!i.rows.length||i.rows.some(r=>typeof r.id!=='string'||typeof r.title!=='string')||new Set(i.rows.map(r=>r.id)).size!==i.rows.length)return fail('invalid_input_rows');
  if(i.taskSet!=='collection-csv-v1'||!Number.isInteger(i.capacity?.maxConcurrent)||i.capacity.maxConcurrent<1||!Number.isInteger(i.capacity.maxMembers)||i.capacity.maxMembers<3)return fail('invalid_or_insufficient_example_capacity');
  if(!Number.isInteger(+d.config.parallelism)||+d.config.parallelism<1)return fail('invalid_parallelism');
  if(d.config.coordinator!=='parent_assistant')return fail('this_example_uses_current_assistant_coordination');
  if(!d.rows.every(r=>r.rowId&&r.role?.trim())||new Set(d.rows.map(r=>r.rowId)).size!==3)return fail('invalid_role_identity');
  return {ok:true};
 }
 const defs=[{id:'normalize',title:'Normalize titles',slot:0,dependsOn:[],outputContract:'normalized_rows',expects:'Trim titles; keep identifiers and order.',proof:'Every title is trimmed, and the ids and their order match the job’s input.'},
  {id:'quoting',title:'Verify CSV quoting',slot:1,dependsOn:[],outputContract:'quoting_checks',expects:'Commas and quotes are escaped without data loss.',proof:'Commas, quotes and line breaks each come back unchanged.'},
  {id:'export',title:'Assemble and verify export',slot:2,dependsOn:['normalize','quoting'],outputContract:'csv_export',expects:'Combine verified inputs into an exact CSV file.',proof:'The file has every row, in the original order, with its quotes intact.'}];
 function admit(r,d,c,fingerprint){
  r.crew={protocolVersion:1,requestFingerprint:fingerprint,definitionRevision:r.definitionRevision,input:freeze(clone(d.crewInput)),
   parent:freeze({mode:c.state.mode,permissions:c.state.permissions,worktree:c.state.worktree}),policyRevision:d.policyRevision||null,
   admissionKind:d.autoAdmission?'auto':'explicit',requestedConcurrency:+d.config.parallelism,effectiveConcurrency:Math.min(+d.config.parallelism,d.crewInput.capacity.maxConcurrent,3),
   assignments:defs.map(t=>({...clone(t),participantId:r.participants[t.slot].id,assignedRole:r.participants[t.slot].role,expectedOutput:t.expects,status:'pending',attempt:null,result:null})),summary:null};
  r.expectedOutputs=[{id:'crew-csv-'+r.id,delivered:false}];
 }
 function authority(r){const c=E.ctx();return r.crew.parent.mode===c.state.mode&&r.crew.parent.permissions===c.state.permissions&&r.crew.parent.worktree===c.state.worktree;}
 function gate(r,x){if(!r?.crew?.protocolVersion)return 'crew_work_missing';if(!x||x.epoch!==r.stopEpoch)return 'stale_epoch';if(x.sourceHash!==r.crew.input.sourceHash)return 'different_source';if(r.definitionRevision!==r.crew.definitionRevision)return 'definition_changed';if(!authority(r))return 'parent_context_changed';if(r.status!=='running')return 'run_not_running';return null;}
 function current(r,a){const p=r.participants.find(p=>p.id===a.participantId);return !!(a.attempt&&p&&p.assignmentRevision===a.attempt.assignmentRevision&&p.attempts.at(-1)?.attempt_id===(a.completionAttemptId||a.attempt.id)&&(!a.completionAttemptId||p.outcome==='completed'));}
 function claim(id,assignmentId,x){
  const r=run(id),why=gate(r,x);if(why)return fail(why);const a=r.crew.assignments.find(t=>t.id===assignmentId);if(!a)return fail('assignment_missing');
  if(a.status==='done')return current(r,a)?{ok:true,reused:true,attempt:clone(a.attempt)}:fail('stale_participant_attempt');
  if(a.status==='running')return current(r,a)?{ok:true,reused:true,attempt:clone(a.attempt)}:fail('stale_participant_attempt');
  if(a.dependsOn.some(d=>{const dep=r.crew.assignments.find(t=>t.id===d);return dep.status!=='done'||!current(r,dep);}))return fail('dependencies_pending');
  if(r.crew.assignments.filter(t=>t.status==='running').length>=r.crew.effectiveConcurrency)return fail('concurrency_full');
  const p=r.participants.find(p=>p.id===a.participantId);if(!p||p.outcome)return fail('participant_unavailable');
  const attempt={id:'crew-attempt-'+r.id+'-'+a.id+'-'+p.assignmentRevision,assignmentRevision:p.assignmentRevision,participantId:p.id};
  p.attempts.push({attempt_id:attempt.id,outcome:'in_flight',epoch:r.stopEpoch});p.status='working';p.current=a.title;
  a.status='running';a.attempt=freeze(attempt);C.appendMessage(id,{senderKind:'coordinator',senderName:'Coordinator',messageType:'request',recipientIds:[p.id],body:a.title+'. Done when: '+a.expects});return {ok:true,attempt:clone(attempt)};
 }
 function quote(s){return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
 function calculate(input,assignmentId,dependencies){
  if(assignmentId==='normalize')return {kind:'normalized_rows',rows:input.rows.map(r=>({id:r.id,title:r.title.trim()}))};
  if(assignmentId==='quoting'){const examples=['plain','comma, value','say "hello"','line\nbreak'];return {kind:'quoting_checks',cases:examples.map(s=>({input:s,encoded:quote(s)})),delimiter:',',lineEnding:'CRLF'};}
  if(assignmentId==='export'){
   if(!dependencies?.normalize||!dependencies?.quoting)return null;
   return {kind:'csv_export',filename:'collection.csv',content:'id,title\r\n'+dependencies.normalize.rows.map(r=>[quote(r.id),quote(r.title)].join(',')).join('\r\n')+'\r\n',rowCount:dependencies.normalize.rows.length};
  }return null;
 }
 function payload(id,assignmentId){const r=run(id);if(!owns(id))return null;const a=r.crew.assignments.find(t=>t.id===assignmentId);if(!a?.attempt)return null;
  const deps=Object.fromEntries(a.dependsOn.map(k=>[k,r.crew.assignments.find(t=>t.id===k).result]));
  return {epoch:r.stopEpoch,sourceHash:r.crew.input.sourceHash,attemptId:a.attempt.id,assignmentRevision:a.attempt.assignmentRevision,result:calculate(r.crew.input,assignmentId,deps),evidenceRefs:['input','output-contract']};
 }
 function deliver(id,assignmentId,x){
  const r=run(id),why=gate(r,x);if(why)return fail(why);const a=r.crew.assignments.find(t=>t.id===assignmentId);if(!a)return fail('assignment_missing');
  if(!current(r,a)||x.attemptId!==a.attempt.id||x.assignmentRevision!==a.attempt.assignmentRevision)return fail('stale_participant_attempt');
  if(a.dependsOn.some(d=>{const dep=r.crew.assignments.find(t=>t.id===d);return dep.status!=='done'||!current(r,dep);}))return fail('dependencies_pending_or_stale');
  if(a.status==='done')return stable(a.result)===stable(x.result)?{ok:true,reused:true}:fail('conflicting_result');
  if(a.status!=='running')return fail('assignment_not_running');
  const expected=payload(id,assignmentId).result;
  if(!x.result||stable(x.result)!==stable(expected))return fail('output_contract_unsatisfied');
  if(!Array.isArray(x.evidenceRefs)||!x.evidenceRefs.includes('input')||!x.evidenceRefs.includes('output-contract')||x.evidenceRefs.some(v=>!['input','output-contract'].includes(v)))return fail('evidence_missing');
  a.result=freeze(clone(x.result));a.status='done';a.evidenceNote=a.proof||'Checked against what the part was asked to do.';
  C.setOutcome(id,a.participantId,'completed',{reason:a.evidenceNote});a.completionAttemptId=r.participants.find(p=>p.id===a.participantId).attempts.at(-1).attempt_id;
  C.appendMessage(id,{senderKind:'participant',senderId:a.participantId,senderName:a.assignedRole,messageType:'response',body:a.title+' is done and checked. '+a.evidenceNote});return {ok:true};
 }
 function finalize(id,x){const r=run(id);if(r?.crew?.summary){return r.status==='completed'&&x?.epoch===r.stopEpoch&&x.sourceHash===r.crew.input.sourceHash&&r.crew.assignments.every(a=>current(r,a))?{ok:true,reused:true,artifactId:r.crew.summary.artifactId}:fail('stale_finalization');}
  const why=gate(r,x);if(why)return fail(why);if(r.crew.assignments.some(a=>a.status!=='done'||!current(r,a)))return fail('assignments_incomplete_or_stale');
  const output=r.crew.assignments.find(a=>a.id==='export').result,artifactId='crew-csv-'+id;
  r.artifacts.push({id:artifactId,label:output.filename,kind:'csv',body:output.content,readOnly:true,sourceRunId:id,sourceHash:r.crew.input.sourceHash});
  r.crew.summary=freeze({artifactId,completedAssignments:3,rowCount:output.rowCount,sourceHash:r.crew.input.sourceHash});r.expectedOutputs[0].delivered=true;r.status='completed';r.completedAt=new Date().toISOString();
  C.appendMessage(id,{senderKind:'coordinator',senderName:'Coordinator',messageType:'handoff',body:'Every part is checked. '+output.filename+' is ready, and no project files were changed.'});
  parentSummary(r,output);return {ok:true,artifactId};
 }
 /* G-30, IMPACT A1-46: the parent assistant's ordinary reply under the card. Only a recorded run gets one (the
    recorded example's own summary, with the recorded tick in its meta row); a real run never gets an invented
    assistant turn. No Revert row: this example changes no project file, so REVERT has no manifest for it. */
 function parentSummary(r,output){
  if(C.provenance?.(r.id)!=='recorded')return;
  const c=E.ctx(),t=c.state.threads.find(t=>t.id===r.threadId);if(!t||t.messages.some(m=>m.crewSummaryOf===r.id))return;
  c.appendMessage({id:'crew-summary-'+r.id,role:'assistant',type:'text',crewSummaryOf:r.id,recordedExample:true,time:new Date().toISOString(),
   body:'The Crew finished '+output.filename+': '+output.rowCount+' rows in their original order, titles trimmed, and every comma and quote kept inside its cell. Each part was checked before it counted, and nothing in your project was changed.'},t);
 }
 /* IMPACT A1-32 (canon CW:155): the Crew Auto member cap is configuration (4) and the roster never raises it. A
    team over the cap is refused with invalid_policy_roster, naming the row that pushes it over (COLLAB marks that
    row data-state="error" and prints the refusal through pmxRefusal). */
 const autoCap=()=>C.definitions().crew.autoMaxMembers||4;
 function commitPolicy(d){
  if(!d||d.kind!=='crew'||!d.autoMode)return fail('auto_configuration_required');
  if(d.wonderer||d.grillMe)return fail('invalid_policy_roster');
  const cap=autoCap();
  if(Array.isArray(d.rows)&&d.rows.length>cap)return {ok:false,error:'invalid_policy_roster',over:true,cap,rowId:d.rows[cap].rowId};
  if(!Array.isArray(d.rows)||!d.rows.length||!Number.isInteger(+d.config.parallelism)||+d.config.parallelism<1)return fail('invalid_policy_roster');
  const pre=C.validateStart(d);if(!pre.ok)return pre;
  if(!['high','medium'].includes(d.config.autoComplexity)||!['2','3'].includes(String(d.config.autoMinIndependent||'2')))return fail('invalid_auto_criteria');
  const def=C.definitions().crew,revision=(def.autoPolicy?.revision||0)+1;
  def.autoPolicy=freeze({revision,name:d.name,purpose:d.purpose,rows:clone(d.rows),config:clone({...d.config,autoMinIndependent:String(d.config.autoMinIndependent||'2')}),maxMembers:cap});
  window.PM56_RUNTIME.collab.effects.settingsWrites++;def.autoConfigured=true;def.autoEnabled=true;def.autoRosterTemplate=clone(d.rows);return {ok:true,revision};
 }
 /* IMPACT A2-26: evaluate stays fixture-static. With {dryRun:true, policy:{rows, config}} it judges a request by the
    rules alone (size, then parts that can run at once) and records, admits and bills nothing: no autoRequests
    entry, no run, no effect counter, no Usage. The Crew Auto sheet's "How it would decide" reads it (COLLAB calls it
    when evaluate.dryRun is true). Runtime conditions (Crew Auto on, the chat's mode, an explicit single-agent
    choice) are not rules and are not judged in a dry run. */
 const RANK={low:1,medium:2,high:3};
 function dryRun(request,policy){
  const cfg=policy?.config||{};
  if(!request||!['low','medium','high'].includes(request.complexity))return fail('invalid_request');
  const parts=Number.isInteger(request.input?.independentParts)?request.input.independentParts:defs.filter(t=>!t.dependsOn.length).length;
  let reason=null;
  if(RANK[request.complexity]<({medium:2,high:3}[cfg.autoComplexity]||3))reason='complexity_below_threshold';
  else if(parts<Number(cfg.autoMinIndependent||2))reason='insufficient_independent_work';
  return {ok:true,dryRun:true,admitted:!reason,reason,requestId:request.id||null,independentParts:parts};
 }
 function evaluate(request,opts){
  if(opts?.dryRun)return dryRun(request,opts.policy);
  const c=E.ctx(),def=C.definitions().crew,policy=def.autoPolicy;
  if(!request?.id||!request.threadId||!request.input||typeof request.explicitSingle!=='boolean'||!['low','medium','high'].includes(request.complexity))return fail('invalid_request');
  /* a request is judged for a chat that exists: nothing is recorded or admitted for any other (the Crew Auto sheet's
     samples use threadId 'crew-auto-sheet', so one that reached here without its dryRun flag records nothing) */
  if(!c.state.threads.some(t=>t.id===request.threadId))return fail('invalid_request');
  const fp=hash(request),key=request.threadId+':'+request.id,old=autoRequests.get(key);
  if(old)return old.fingerprint===fp?{...clone(old.result),reused:true}:fail('conflicting_request');
  let reason=null;
  /* owner answer E-02: Crew Auto is the assistant's permission to call a Crew by itself, on by default; this chat's
     Crew Auto check overrides the project default (PM56_COLLAB.crewAutoAllowed) */
  const allowed=typeof C.crewAutoAllowed==='function'?C.crewAutoAllowed(request.threadId):!!(def.autoEnabled&&def.autoConfigured);
  if(!allowed||!policy)reason='auto_not_enabled';
  else if(request.explicitSingle)reason='explicit_single_agent';
  else if(c.state.mode!=='Agent')reason='parent_mode_disallows_execution';
  else if((RANK[request.complexity]||0)<({medium:2,high:3}[policy.config.autoComplexity]))reason='complexity_below_threshold';
  else if(defs.filter(t=>!t.dependsOn.length).length<Number(policy.config.autoMinIndependent))reason='insufficient_independent_work';
  else if(request.memberCount!==3||request.memberCount>policy.maxMembers||request.memberCount>request.input.capacity?.maxMembers)reason='member_cap';
  if(reason){const result={ok:true,admitted:false,reason,requestId:request.id,policyRevision:policy?.revision||null};autoRequests.set(key,{fingerprint:fp,result});return result;}
  const d={kind:'crew',threadId:request.threadId,requestKey:'auto:'+key,name:request.input.label,purpose:request.input.objective,rows:clone(policy.rows),config:clone(policy.config),crewInput:request.input,autoAdmission:true,policyRevision:policy.revision};
  const started=C.admitCrewWork(d,c);if(!started.ok)return started;
  const result={ok:true,admitted:true,runId:started.runId,requestId:request.id,policyRevision:policy.revision};autoRequests.set(key,{fingerprint:fp,result});return result;
 }
 /* renderSummary stays exported (spec 8.0) and delegates to cardParts: nothing in the app calls it since the card
    frame composes cardParts itself; an outside caller gets the card's own counted progress line. */
 function renderSummary(c,r){const p=cardParts(r,c);return p?.track?.nowText?'<p class="pmx-fine">'+p.track.nowText+'</p>':'';}
 /* every Crew run of this chat (protocol, seed, wand-started and plan-bound), so the Activity chip never falls back
    to the legacy "0 members" card in a chat that has Crews (7.13; COLLAB fix-cycle-1 request) */
 function activityRuns(c){return C.runsForThread(c.state.selectedThread).filter(r=>r.kind==='crew');}
 const LEGACY_STATUS={running:'working',working:'working',completed:'done',done:'done',failed:'blocked',blocked:'blocked'};
 /* the Activity chip's tone reads these (activity-bar worstTone): a helper waiting for the Coordinator's plan or
    for its turn is queued, not "waiting" (which the chip paints as needing attention); only a blocked helper is */
 /* the members stay the protocol Crews' (the legacy crew list already carries the seeds' members) */
 function activityMembers(c){return activityRuns(c).filter(r=>owns(r.id)).flatMap(r=>{const vm=planVM(r),st=C.presentState?.(r);return r.participants.map(p=>{const x=vm?.parts.find(x=>x.owner.id===p.id);
  const status=st==='completed'||x?.checked?'done':p.status==='blocked'?'blocked':x?.status==='running'&&st==='running'?'working':'queued';
  return {...p,status,name:p.role,current:x?x.title:p.current,crewRunId:r.id};});});}
 /* 7.13 (G-24): the legacy `crew` Activity domain in the collaboration grammar. Hover rows keep
    button.ab-row[data-crew-run] with open-activity; each shows the kind mark and the card title, then the run's one
    true sentence (PM56_COLLAB.sentenceOf, the card's own), then its clock; newest first, at most four, then the
    rest named in one line. The Detail body: title, sentence, the track's nowText, one 36 px row per part
    (button.crew-activity-member[data-action="collab-open-participant"]), Open Panel and Message. */
 function clockText(r){const g=C.card?.generic?.(r);return g&&g.clock!=null?g.clock:S_().pmxTime.clock(null);}
 function runSentence(r){const sn=C.sentenceOf?.(r)||{status:'running',word:'Running',reason:''};return sn;}
 function activityHover(c){const S=S_(),runs=activityRuns(c).slice().reverse();
  return '<div class="ab-head"><strong>Crew</strong><span>'+plural(runs.length,'run')+'</span></div><div class="ab-body">'+runs.slice(0,4).map(r=>{const sn=runSentence(r);
   return '<button type="button" class="ab-row pmx-crew-abrow" data-k="crew-hover:'+H(r.id)+'" data-action="open-activity" data-domain="crew" data-crew-run="'+H(r.id)+'">'+
    '<span class="pmx-crew-abmark">'+S.pmxKindMark('crew',16)+'</span><span class="ab-row-copy"><b>'+H(r.title)+'</b><span class="pmx-crew-absay"><b>'+H(sn.word)+'</b>'+(sn.reason?' · '+H(sn.reason):'')+'</span></span>'+
    '<span class="pmx-clock">'+clockText(r)+'</span></button>';}).join('')+
   (runs.length>4?'<p class="pmx-fine pmx-crew-abmore">and '+(runs.length-4)+' more · Show all in Activity</p>':'')+'</div>';}
 function activityBody(c){let rows=activityRuns(c);const selected=c.state.activity.selected;if(selected?.domain==='crew'&&rows.some(r=>r.id===selected.id))rows=rows.filter(r=>r.id===selected.id);
  const S=S_();
  return '<div class="crew-activity-body">'+rows.map(r=>{const sn=runSentence(r),p=cardParts(r,c),vm=planVM(r),ra='data-run="'+H(r.id)+'"',ended=['completed','canceled','cancelled','failed'].includes(r.status);
   const open=owns(r.id)?'crew-open-work':(C.card?.openAction?.(r)||'collab-open-panel'),track=p?.track||C.card?.track?.(r);
   /* a Crew with no protocol record (seed, wand-started, plan-bound): one row per helper, its card mark and its status */
   const marks=vm?null:(C.card?.marks?.(r,18)||[]).filter(m=>m!=='|').slice(1);
   const team=!vm?r.participants.map((q,i)=>S.pmxTeamRow({key:'crew-ab-p:'+r.id+':'+q.id,kind:'crew',size:'s',cls:'crew-activity-member',markHtml:marks[i]||'',
     name:H(q.role),route:H(q.current||''),outcome:H({working:'Working',done:'Done',blocked:'Needs attention'}[LEGACY_STATUS[q.status]]||'Queued'),attrs:ra+' data-participant="'+H(q.id)+'"'})).join('')
    :vm.parts.map(x=>{const s=x.checked?'done':x.status==='running'?'working':'queued';
    return S.pmxTeamRow({key:'crew-ab-p:'+r.id+':'+x.id,kind:'crew',size:'s',cls:'crew-activity-member',markHtml:S.pmxMark({role:x.owner.persona,seat:x.owner.seat,size:18,state:s,standin:x.owner.standIn}),
     name:H(x.owner.name),route:H(x.title),outcome:H(x.checked?'Done':x.status==='running'?'Working':x.waitsOn.length&&r.crew.assignments.some(a=>a.attempt)?'Waiting its turn':'Queued'),attrs:ra+' data-participant="'+H(x.owner.id)+'"'});}).join('');
   return '<section class="pmx-crew-ab" data-k="crew-ab-'+H(r.id)+'" data-crew-activity="'+H(r.id)+'"><p class="pmx-crew-ab-title">'+H(r.title)+'</p>'+
    S.pmxSentence({status:sn.status,word:H(sn.word),reason:H(sn.reason)})+(track?.nowText?'<p class="pmx-fine pmx-crew-ab-now">'+track.nowText+'</p>':'')+
    '<div class="pmx-crew-ab-team">'+team+'</div><div class="pmx-actions pmx-crew-ab-acts">'+
    '<button type="button" class="text-button pmx-act" data-action="'+open+'" '+ra+'>Open Panel</button>'+(ended?'':'<button type="button" class="text-button pmx-act" data-action="collab-message" '+ra+'>Message</button>')+'</div></section>';}).join('')+'</div>';}
 E.chainAction('open-activity',(c,b)=>{if(!b.dataset.crewRun||!activityRuns(c).some(r=>r.id===b.dataset.crewRun))return false;c.state.activity.pinned=true;c.state.activity.selected={domain:'crew',id:b.dataset.crewRun};return false;});
 E.chainAction('open-crew',(c,b)=>{const r=activityRuns(c).find(r=>r.participants.some(p=>p.id===b.dataset.id));if(!r)return false;c.state.activity.pinned=true;c.state.activity.selected={domain:'crew',id:r.id};c.state.activity.scope='focus';c.state.activity.open=true;c.renderApp();return true;});
 E.chainAction('collab-modal-commit',(c)=>{const d=C.draft();if(d?.kind!=='crew')return false;
  if(d.autoMode){const wasOn=autoProjectOn(),res=commitPolicy(d);if(!res.ok){d.lastFailure={message:(wasOn?'Nothing was saved.':'Nothing was turned on.')+' Your rules are unchanged.',...res};c.renderOverlays();return true;}window.PM56_RUNTIME.collab.draft=null;autoReceipt(c,res.revision);c.closeDialog();c.renderApp();return true;}
  /* IMPACT A1-23: the recorded-example preflight (three core rows, no specialists, this chat's assistant leading,
     Agent mode) runs only on a draft a recorded example put together. A wand-started Crew goes to COLLAB's commit
     and is never refused for not being a recording. */
  if(!d.crewInput||!C.isRecordedDraft(d))return false;const res=C.admitCrewWork(d,c);if(!res.ok){d.lastFailure={error:res.error,message:'No work was started. This local example needs three roles and the current assistant as coordinator.'};c.renderOverlays();return true;}window.PM56_RUNTIME.collab.draft=null;c.closeDialog();c.renderApp();return true;
 });
 function runAgain(c,id){const r=run(id);if(!owns(id))return;if(['running','paused'].includes(r.status)){c.toast('Stop before reconfiguring','Cancel the current run first; its completed results will be retained.');return;}C.openConfigure('crew',id,false);const d=C.draft();d.reconfigureRunId=null;d.threadId=r.threadId;d.requestKey='crew-rerun:'+r.id+':'+d.rows[0].rowId;d.crewInput=clone(r.crew.input);d.name=r.title+' · another run';c.openDialog({type:'collab-configure'});}
 E.chainAction('collab-open-configure',(c,b)=>{if(!owns(b.dataset.reconfigure))return false;runAgain(c,b.dataset.reconfigure);return true;});
 E.action('crew-run-again',(c,b)=>{runAgain(c,b.dataset.run);return true;});
 E.chainAction('collab-evidence-confirm',(c,b)=>{if(!owns(b.dataset.run))return false;c.toast('Verified output required','A free-text note cannot complete this assignment.');return true;});
 E.chainAction('collab-crew-complete',(c,b)=>{if(!owns(b.dataset.run))return false;c.state.editorRevealed=true;c.openEditor('crew-work:'+b.dataset.run);return true;});
 E.action('crew-open-work',(c,b)=>{if(!owns(b.dataset.run))return true;c.closeDialog();c.closeMenu();c.state.editorRevealed=true;c.openEditor('crew-work:'+b.dataset.run);return true;});
 E.action('crew-export-result',(c,b)=>{const r=run(b.dataset.run),a=r?.artifacts.find(a=>a.id===r.crew?.summary?.artifactId);if(!a)return true;const url=URL.createObjectURL(new Blob([a.body],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=a.label;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);c.renderApp();return true;});
 E.chainAction('reset-all',()=>{autoRequests.clear();checkedSeen.clear();retryPending.clear();return false;});
 /* Retry (7.6, IMPACT A1-34; cmd.collaboration.reconfigure): a new attempt for the failed slot (the Coordinator's, or
    the first failed helper's). It changes the run, so it lives here, above the presentation section. Nothing runs by
    itself in this preview, so the run then waits honestly instead of pretending the retry is working; retryPending
    tells the card to show that wait (the waiting face, "not started" in the clock slot) until the second try starts. */
 const retryPending=new Set();
 function retrySlot(r){const cp=C.completion?.(r.id);if(!cp)return null;const pid=cp.coordinator_failed?r.coordinator:(cp.failed_slots||[])[0];return r.participants.find(p=>p.id===pid||p.id===pid?.participant_id)||null;}
 E.action('crew-retry',(c,b)=>{const r=run(b.dataset.run);if(!r||r.kind!=='crew')return true;const cp=C.completion?.(r.id);if(!cp?.attention_required||!failureOf(r))return true;
  const p=b.dataset.slot==='coordinator'?r.participants.find(p=>p.id===r.coordinator):retrySlot(r);if(!p){c.toast('Nothing to retry','No part of this Crew failed, so there is nothing to start again.');return true;}
  const res=C.retryParticipant(r.id,p.id);if(!res.ok){c.toast('Can’t retry yet',res.error);return true;}
  p.status='waiting';p.current='Waiting to try again';r.status='waiting';r.blockedReason='Nothing runs by itself in this preview, so '+(p.id===r.coordinator?'the Coordinator’s':p.role+'’s')+' second try hasn’t started yet.';retryPending.add(r.id);
  C.appendMessage(r.id,{senderKind:'system',senderName:'System',messageType:'message',body:'Retrying '+(p.id===r.coordinator?'the Coordinator':p.role)+' with the same model. Everything so far is kept.'});
  c.renderApp();return true;});
 /* =====================================================================
    PRESENTATION (DESIGN-SPEC 8.0 KIND INTERFACE, 8.1 Crew, 8.2 Crew Auto, 7 in-chat grammar).
    The Crew's parts for COLLAB's frame: sheetParts (the sheet), planVM (the CrewPlanVM protocol adapter, A1-50),
    cardParts (the run card), the Crew Auto receipt and the parent summary's recorded tick. Presentation only:
    nothing below changes a run, a draft or the policy, and nothing below is a state machine.
    ===================================================================== */
 const S_=()=>window.PM56_SHELL,X_=()=>window.PM56_PMX;
 const H=v=>S_().esc(String(v==null?'':v));
 const plural=(n,w)=>n+' '+w+(n===1?'':'s');
 const ink=(key,text)=>X_()?.ink?X_().ink(key,text):H(text);
 const optionOf=(list,v)=>list.find(o=>String(o.value)===String(v))||list[0];
 const listWords=a=>a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
 /* The plan's capacity (the most a Crew runs at once in this concept): a recorded fixture brings its own, a wand
    draft gets COLLAB's (PLAN_CAPACITY 2; request in CREW-A-NOTES: export it as PM56_COLLAB.capacity(draft)). */
 const capacityOf=d=>C.capacity?C.capacity(d):(d.crewInput?.capacity?.maxConcurrent||2);
 const choiceTrigger=(d,field,small)=>{const spec=C.choices()[field],cur=optionOf(spec.options,d.config[field]);
  return S_().pickerButton({action:'collab-pick-choice',anchor:'collab-choice-'+field,strong:H(cur.label),small:small===false?'':H(cur.small||''),extra:'data-field="'+field+'" data-menu-title="'+H(spec.title)+'"'});};
 const policyWords=p=>{const ch=C.choices(),cx=optionOf(ch.autoComplexity.options,p?.config?.autoComplexity||'high'),mi=optionOf(ch.autoMinIndependent.options,String(p?.config?.autoMinIndependent||'2'));return {cx,mi,size:cx.value==='medium'?'medium and big jobs':'big jobs',split:mi.value+'+ parts'};};

 /* ---- sheetParts (8.0 KIND INTERFACE): the Crew's own words and questions. COLLAB keeps the frame parts: the
    roster, the specialists shelf, the plate (PM56_COLLAB.sheet.plateParts.crew), the Advanced rows (the nine shared
    rows, the Crew's Shared notes row and Technical details) and the preview's first frame. The modes (Change this
    Crew, Run this Crew again, the scheduled build, Build With Crew) are the frame's: in those modes the head, hero
    and primary stay COLLAB's. ---- */
 /* E-02: the project default (Crew Auto on, with default rules) and this chat's answer (its Crew Auto check) */
 const autoProjectOn=()=>{const def=C.definitions().crew;return !!(def.autoEnabled&&def.autoConfigured);};
 const autoChatOn=tid=>typeof C.crewAutoAllowed==='function'?C.crewAutoAllowed(tid):autoProjectOn();
 function sheetParts(d,ctx,gen){
  if(!d||d.kind!=='crew')return null;
  const S=S_(),cfg=d.config,n=d.rows.length,rec=C.isRecordedDraft(d),def=C.definitions().crew,pol=def.autoPolicy;
  const needsJob=!String(d.purpose||'').trim();
  if(d.autoMode){
   /* 8.2: the readback reads the rules on the sheet; the cap sentence reads the configured cap (A1-32, E-15) */
   const w=policyWords({config:cfg}),on=autoProjectOn(),bad=n<1;
   return {
    title:'Crew Auto',lead:'Nothing starts now. This sets when Puppet Master may bring in your Crew by itself, and which team it uses.',
    readback:[{part:'auto',html:'When a <b>'+ink('rb:auto:cx',w.cx.read)+'</b> request splits into <b>'+ink('rb:auto:mi',w.mi.read)+'</b> parts, '},{part:'team',html:'Puppet Master starts <b>this Crew</b> by itself.'}],
    estimate:{text:on?'Each Crew it starts has its own time and cost limit. Saving changes the rules for every chat.':'Each Crew it starts has its own time and cost limit. Turning it on saves these rules as your Crew Auto default.'},
    primaryLabel:on?'Save Crew Auto rules':'Turn on Crew Auto',primaryDisabled:bad,primaryReason:bad?'Crew Auto teams have 1 to '+autoCap()+' helpers.':''
   };
  }
  const plain=!d.reconfigureRunId&&!d.rerunOf&&!d.scheduleIntent&&!d.buildWithCrew;
  const ch=C.choices(),coord=optionOf(ch.coordinator.options,cfg.coordinator);
  const asked=Math.max(1,Math.min(8,+cfg.parallelism||1)),cap=capacityOf(d),eff=Math.min(asked,cap,Math.max(1,n));
  const clamp=S.pmxClamp({asked,runs:cap}),bad=n<1||n>8;
  const autoOn=autoChatOn(ctx?.state?.selectedThread),aw=policyWords(pol);
  const settings='<button type="button" class="text-button crew-pr-act" data-action="collab-open-configure" data-kind="crew" data-auto="1">Settings…</button>';
  const p={
   whoTitle:'Who’s in the Crew',whoMeta:'<span data-k="cnt:'+n+'">'+plural(n,'helper')+'</span> · up to 8',
   howTitle:'How should they work together?',
   howHtml:
    S.pmxCtl({key:'ctl-coordinator',label:'Coordinator',helper:'Splits the job, hands out the parts, checks and combines the results.',affects:'lead',control:choiceTrigger(d,'coordinator')})+
    S.pmxCtl({key:'ctl-assign',label:'Who decides who does what',helper:'How parts are handed out.',affects:'assign',control:choiceTrigger(d,'assignmentStrategy',false)})+
    S.pmxCtl({key:'ctl-parallel',label:'Working at the same time',helper:'More at once is faster but uses your limits faster.',capSay:clamp?H(clamp.sheet):'',affects:'parallel',
     control:S.pmxStepper({key:'step-parallel',input:{key:'cfg-parallelism',attrs:'data-collab-input="cfg-parallelism"'},value:asked,min:1,max:8,cap,unit:'at once',affects:'parallel'})}),
   promises:[
    {key:'pr-perm',glyph:'lock',strong:'Helpers can’t do more than this chat.',text:'',part:'permission'},
    autoOn?{key:'pr-auto',glyph:'kind-crew-auto',strong:'Crew Auto is on',text:'for '+H(aw.size)+'.',extra:settings,part:'auto'}
     :{key:'pr-auto',glyph:'not',strong:'Crew Auto is off:',text:'no Crew starts by itself.',extra:settings,part:'auto'}],
   advanced:gen?.advanced?{summary:'This Crew stops after '+(cfg.timeLimitMinutes||45)+' min or $'+Number(cfg.costLimitUsd||6).toFixed(2),rows:gen.advanced.rows}:undefined,
   readback:[
    {part:'team',html:'<b>'+ink('rb:crew:n',plural(n,'helper'))+'</b> work on it, '},
    {part:'parallel',html:'<b>'+ink('rb:crew:eff',eff+' at a time')+'</b>, '},
    {part:'lead',html:'and <b>'+ink('rb:crew:lead',coord.read||coord.label)+'</b> checks every part before it counts.'}],
   estimate:rec?{recorded:true}:{minutes:[5,15],limitUsd:cfg.costLimitUsd||6}
  };
  if(plain)Object.assign(p,{
   title:'Set up a Crew',lead:'A small team of AIs splits your job into parts. A Coordinator hands them out and only accepts a part once its result is checked.',
   hero:Object.assign({},gen?.hero||{},{n:1,title:'What should the Crew get done?',helper:'Describe the finished result in your own words. The Coordinator turns it into parts, and everyone in the Crew reads it.',placeholder:'e.g. Export the collection to CSV without losing quotes or order'}),
   primaryLabel:'Start Crew · <span data-k="pc:'+n+'">'+plural(n,'helper')+'</span>',
   primaryDisabled:bad||needsJob,primaryReason:bad?'Crew needs 1 to 8 helpers.':needsJob?'Add a job first.':''
  });
  return p;
 }

 /* ---- the Crew Auto receipt (8.2, IMPACT A4-03): it exists only after a successful commit, one line in the chat.
    No card, no run; "Change" reopens the rules (cmd.chat.crew_auto.open_config). ---- */
 function autoReceipt(c,revision){
  const t=c.state.threads.find(t=>t.id===c.state.selectedThread);if(!t)return;
  c.appendMessage({id:'crew-auto-receipt-'+revision+'-'+t.id,role:'system',type:'crew-auto-receipt',revision,threadId:t.id,time:new Date().toISOString()},t);
 }
 function autoReceiptHtml(m){
  const S=S_(),pol=C.definitions().crew.autoPolicy,w=policyWords(pol),rev=m.revision||pol?.revision||1;
  return S.pmxLedgerLine({key:'crew-auto-receipt:'+m.id,cls:'crew-auto-receipt',kind:'crew-auto',markHtml:S.pmxKindMark('crew-auto',16),kindWord:'',
   /* the rules are saved for every chat; this chat's own Crew Auto check may still say no (E-02) */
   headline:(autoChatOn(m.threadId)?'Crew Auto is on · ':'Crew Auto rules saved · off in this chat · ')+H(w.size)+' that split into '+H(w.split),time:'rules v'+H(rev),
   actions:[{action:'collab-open-configure',attrs:'data-kind="crew" data-auto="1"',label:'Change'}]});
 }
 E.slot('transcriptMessage',c=>c.m?.type==='crew-auto-receipt'?autoReceiptHtml(c.m):'');
 E.slot('transcriptFamily',c=>c.m?.type==='crew-auto-receipt'?'ledger':'');
 /* the parent summary's recorded tick (G-30, A1-46): "Recorded example · no AI cost" in its meta row */
 E.slot('messageMeta',c=>{const m=c.message;return m&&m.crewSummaryOf&&m.recordedExample?S_().pmxTick({key:'crew-summary-rec:'+m.id,cls:'crew-summary-rec',glyph:'play-ring',text:'Recorded example · no AI cost'}):'';});

 /* ---- CrewPlanVM {parts[], evidence[], result, planBound} (IMPACT A1-50): the protocol adapter. One view model
    for the card (lanes, track, credits) and the run view (CREW-B's renderer in crew-view.js reads the same one).
    Legacy, seed and plan-bound Crews are COLLAB's legacy adapter; this reads only the protocol record. ---- */
 const DID={normalize:'cleaned up titles',quoting:'fixed quoting',export:'built and tested it'};
 function planVM(id){
  const r=typeof id==='string'?run(id):id;if(!r?.crew?.protocolVersion)return null;
  const w=r.crew,byId=Object.fromEntries(w.assignments.map(a=>[a.id,a]));
  const seatOf=pid=>Math.max(1,r.participants.findIndex(p=>p.id===pid)+1);
  const parts=w.assignments.map(a=>{const p=r.participants.find(p=>p.id===a.participantId)||{};
   /* a retry counts only on a real second attempt at this part (8.1 MUST-KEEP: never the admission attempt) */
   const tries=(p.attempts||[]).filter(t=>String(t.attempt_id||'').indexOf('crew-attempt-'+r.id+'-'+a.id+'-')===0||t.reason==='retry').length,after=a.dependsOn.map(k=>byId[k]?.title).filter(Boolean);
   const waitsOn=a.dependsOn.filter(k=>byId[k]?.status!=='done').map(k=>byId[k]?.title).filter(Boolean);
   return {id:a.id,title:a.title,status:a.status,checked:a.status==='done'&&current(r,a),owner:{id:p.id,name:a.assignedRole,persona:p.requestedPersona||p.persona||'Implementer',seat:seatOf(p.id),
    requestedModel:String(p.requestedModelName||'').split(' · ')[0],effectiveModel:String(p.effectiveModelName||'').split(' · ')[0],standIn:!!(p.effectiveModelId&&p.requestedModelId&&p.effectiveModelId!==p.requestedModelId)},
    doneWhen:a.expectedOutput,startsAfter:after,waitsOn,secondTry:tries>1,evidence:a.evidenceNote||'',did:DID[a.id]||'did its part',
    cls:'crew-work-row',key:'crew-part:'+r.id+':'+a.id};});
  const out=w.summary&&r.artifacts.find(a=>a.id===w.summary.artifactId);
  const lines=out?String(out.body).split(/\r?\n/).filter(Boolean):[];
  return {kind:'crew',runId:r.id,parts,
   evidence:parts.filter(x=>x.checked).map(x=>({partId:x.id,text:x.evidence})),
   result:out?{name:out.label,rowCount:w.summary.rowCount,lines:lines.slice(0,3),body:out.body,meta:plural(w.summary.rowCount,'row')+' · original order kept · quotes checked',downloadAction:'crew-export-result'}:null,
   planBound:null,concurrency:{asked:w.requestedConcurrency,runs:w.effectiveConcurrency},admission:w.admissionKind,policyRevision:w.policyRevision,
   source:{rows:w.input.rows,hash:w.input.sourceHash,cls:'crew-work-source'}};
 }

 /* ---- cardParts(run, ctx, face, generic) (8.0 KIND INTERFACE, 7.1, 8.1 "In chat"): the Crew's parts for COLLAB's
    card frame, in the frame's shape (collaboration.js section 7: every field returned replaces the generic one).
    COLLAB keeps the head, the faces it decides (waiting, collapsed, receipt), the actions, the More row and the
    shared faces (waiting, paused, cancelled, stopped at your limit, generic failed; A3-04), for which a Crew gives
    only its nouns and allowed actions. A Crew gives its own sentence, counted track, one lane per part, cast,
    result (the checked output and who did what), receipt headline and meta. ---- */
 const STOPS=['Split the job','Do the parts','Put it together'];
 const WAIT_NOUN='the Coordinator hasn’t split the job';
 function allowedActionsOf(r){
  const cp=C.completion?.(r.id);if(!cp?.attention_required||!failureOf(r))return [];
  const ra='data-run="'+H(r.id)+'"';
  const MAP={retry_coordinator:{action:'crew-retry',attrs:ra+' data-slot="coordinator"',label:'Retry',primary:true},replace_coordinator:{action:'crew-pick-coordinator',attrs:ra,label:'Pick a new Coordinator'},
   retry:{action:'crew-retry',attrs:ra,label:'Retry',primary:true},cancel:{action:'collab-cancel-ask',attrs:ra,label:'Cancel Crew…'},details:{action:'collab-open-panel',attrs:ra,label:'Details'}};
  const order=['retry_coordinator','retry','replace_coordinator','cancel','details'];
  const can=k=>k==='cancel'?(typeof C.canCancel==='function'?C.canCancel(r):true):k==='retry'?!!retrySlot(r):k==='retry_coordinator'?!!r.coordinator:(cp.allowed_actions||[]).includes(k);
  return order.filter(k=>MAP[k]&&(k==='cancel'||(cp.allowed_actions||[]).includes(k))&&can(k)).map(k=>Object.assign({id:k},MAP[k]));
 }
 /* 7.6, IMPACT A1-28/A1-34: the Coordinator's failure is "Needs attention", with Retry first */
 function failureOf(r){
  const cp=C.completion?.(r.id);if(!cp?.attention_required)return null;
  if(cp.coordinator_failed)return {status:'attention',word:'Needs attention',reason:'The Coordinator stopped, so the final summary is missing.',code:'coordinator_failed'};
  /* a running Crew's outputs are simply not written yet: only an ended or blocked one is missing its summary */
  if(cp.attention_reason==='required_outputs_missing'&&['blocked','failed','completed'].includes(r.status))return {status:'attention',word:'Needs attention',reason:'The final summary was never written.',code:'required_outputs_missing'};
  return null;
 }
 function cardParts(id,ctx,face,generic){
  const r=typeof id==='string'?run(id):id;if(!r||r.kind!=='crew')return null;
  const S=S_(),vm=planVM(r),failure=failureOf(r),allowed=allowedActionsOf(r);
  const done=vm?vm.parts.filter(x=>x.checked).length:(r.crew?.assignments||[]).filter(a=>a.status==='done').length,total=vm?vm.parts.length:(r.crew?.assignments||[]).length;
  const out={kindWord:'Crew',
   nouns:{waiting:WAIT_NOUN,progress:total?done+' of '+total+' parts done':undefined,cancelExtra:total?done+' of '+total+' parts done':undefined},
   allowedActions:allowed.length?allowed:undefined,
   technical:{text:'Open Panel sends cmd.collaboration.open {target: run_view}'+(r.status==='completed'&&vm?.result?'; Download sends cmd.collaboration.export {content_kind: result}':'')}};
  /* after Retry (7.6/7.7): the second try waits, so the card takes the waiting face (Open Panel · Message · More with
     Cancel) and the clock slot reads "not started" instead of running on; COLLAB keeps the owner's sentence */
  if(retryPending.has(r.id)&&r.status!=='waiting')retryPending.delete(r.id);
  if(retryPending.has(r.id)&&!failure){Object.assign(out,{density:'waiting',clock:H(S.pmxTime.clock(null))});if(vm)out.openAction='crew-open-work';return out;}
  if(failure)Object.assign(out,{density:'attention',sentence:{status:'attention',word:H(failure.word),reason:H(failure.reason)},
   decision:{tone:'warm',glyph:'warn',sentence:'<b>'+H(failure.word)+'</b> · '+H(failure.reason),actions:allowed.filter(a=>a.id!=='details')}});
  /* a Crew with no protocol record (seed, legacy, wand-started) keeps COLLAB's generic parts, except the one face
     A1-28/A1-34 give the Crew: a failed Coordinator reads "Needs attention" and offers Retry */
  if(!vm)return failure?out:null;
  const w=r.crew,ra='data-run="'+H(r.id)+'"',rec=C.provenance?.(r.id)==='recorded',fin=r.status==='completed';
  const started=w.assignments.some(a=>a.attempt),running=vm.parts.filter(x=>x.status==='running'),exporting=running.find(x=>x.id==='export');
  out.openAction='crew-open-work';
  /* one flex item: the button's gap would otherwise open between "Open" and " Panel" */
  const OPEN='<span>Open<span class="pmx-long"> Panel</span></span>';
  /* the cast: the Coordinator first, then each part's owner in its seat, in its state (C2) */
  const st=x=>fin||x.checked?'done':!started?'queued':x.status==='running'?'working':x.waitsOn.length?'queued':'idle';
  const cast=[{role:'lead',seat:0,state:fin?'done':started?'working':'idle'}].concat(vm.parts.map(x=>({role:x.owner.persona,seat:x.owner.seat,state:st(x),standin:x.owner.standIn})));
  out.cluster=cast.map(c=>({html:S.pmxMark({role:c.role,seat:c.seat,size:18,state:c.state,standin:c.standin}),mini:S.pmxMark({role:c.role,seat:c.seat,size:12,state:c.state})}));
  /* the track: counted stops, never a percent (C4); "Put it together" once both parts are checked */
  const at=!started?0:(exporting||vm.parts.filter(x=>x.id!=='export').every(x=>x.checked))?2:1;
  out.track={stops:STOPS.map((l,i)=>({key:'pmx-stop:'+r.id+':'+i,label:l,state:fin||i<at?'done':i===at&&started?'now':'next'})),
   nowText:'<b>'+H(fin?STOPS[2]:STOPS[at])+'</b> · '+(started||fin?done+' of '+total+' checked':'starting')};
  /* meta: recorded first (7.3), the clamp, then a stand-in; at most 3 parts at the M tier. A Crew that Crew Auto
     started begins with that (8.2: the one line that says why a Crew appeared by itself), then the recorded words,
     then the clamp worded for rules the user did not type ("rules allow 3", never "you asked for 3") */
  const clamp=S.pmxClamp({asked:w.requestedConcurrency,runs:w.effectiveConcurrency});
  const standIn=vm.parts.filter(x=>x.owner.standIn).map(x=>S.pmxStandIn({requested:x.owner.requestedModel,effective:x.owner.effectiveModel,reason:'offline'})?.card).filter(Boolean)[0];
  const auto=w.admissionKind==='auto',free=vm.parts.filter(x=>!x.startsAfter.length).length;
  const startedBy=auto?'Started by Crew Auto: this job splits into '+plural(free,'part')+' (rules v'+H(w.policyRevision||1)+')':'';
  const clampWords=!clamp?'':auto?H(w.effectiveConcurrency+' at a time (rules allow '+w.requestedConcurrency+')'):H(clamp.card);
  const recWords='<span class="pmx-recorded">'+H(S.PMX_COPY?.cost?.recorded||'Recorded example · no AI cost')+'</span>';
  if(fin){
   const t=r.completedAt&&r.createdAt?Date.parse(r.completedAt)-Date.parse(r.createdAt):null,n=r.participants.length;
   const headline=vm.result?'Export ready: all '+total+' parts checked':'Finished: all '+total+' parts checked';
   const viewing=!!X_()?.viewOpen?.(r.id),g=generic?.receipt||{};
   /* below the L tier the receipt's time · cost leave the line (R-21): the headline's short form carries them there */
   const rcHead=H(vm.result?'Export ready':'Finished')+'<span class="crew-rc-l">: all '+total+' parts checked</span><span class="crew-rc-m">'+(g.time?' · '+g.time:'')+(!rec&&g.cost?'<span class="crew-rc-cost"> · '+g.cost+'</span>':'')+'</span>';
   Object.assign(out,{density:'result',
    result:{glyph:'check',headline:H(headline),
     /* the figures: a recorded run leads with "Recorded example · no AI cost" (7.3), so no tier cuts it */
     sub:(rec?[S.pmxCost({state:'recorded'}),t!=null?S.pmxFill(S.PMX_COPY.worked,{time:S.pmxTime.worked(t),n}):'']
      :[t!=null?S.pmxFill(S.PMX_COPY.worked,{time:S.pmxTime.worked(t),n}):'',S.pmxCost({state:'done',spent:r.usage?.costUsd,limit:r.config?.costLimitUsd||6})]).filter(Boolean).join(' · '),
     outputHtml:vm.result?S.pmxOutput({key:'crew-output:'+r.id,name:H(vm.result.name),meta:H(plural(vm.result.rowCount,'row')),lines:vm.result.lines.map(H)}):'',boardHtml:'',
     creditsHtml:S.pmxCredits({key:'cred:'+r.id,title:'Who did what',items:[{mark:S.pmxMark({role:'lead',size:18,state:'done'}),name:'Coordinator',did:'checked each part'}]
      .concat(vm.parts.map(x=>({mark:S.pmxMark({role:x.owner.persona,seat:x.owner.seat,size:18,state:'done'}),name:H(x.owner.name),did:H(x.did+(x.secondTry?', 2nd try':''))})))})},
    receipt:Object.assign({},g,{glyph:'check',headline:rcHead,recorded:rec}),
    actions:[{action:'crew-open-work',label:OPEN,primary:!viewing,core:true}].concat(vm.result?[{action:'crew-export-result',label:'Download',core:true}]:[]),followOns:[],
    meta:{recorded:rec,parts:[startedBy||'Completed · started by you']}});
   return out;
  }
  const costNow=rec?'':S.pmxCost({state:'running',spent:r.usage?.costUsd,limit:r.config?.costLimitUsd||6});
  out.meta=auto?{recorded:false,parts:[startedBy,rec?recWords:costNow,clampWords].filter(Boolean)}
   :{recorded:rec,parts:[costNow,clampWords,standIn||''].filter(Boolean).slice(0,3)};
  /* starting and live keep COLLAB's actions with the S-tier labels ("Play", "Open"; 7.2) and the open action pointed at
     the Crew's own run view */
  if(Array.isArray(generic?.actions))out.actions=generic.actions.map(a=>a&&a.action==='crew-example-play'?Object.assign({},a,{label:'<span>Play<span class="pmx-long"> the recording</span></span>'})
   :a&&a.core&&/^(collab-open-panel|crew-open-work)$/.test(a.action)?Object.assign({},a,{action:'crew-open-work',label:OPEN}):a);
  if(failure)return out;
  /* the sentence (8.1 table; 9.0 rule 8: at most 110 characters) */
  let sentence;
  if(!started)sentence={status:'starting',word:'Starting',reason:'The Coordinator is reading the job.'};
  else if(exporting)sentence={status:'running',word:'Running',reason:H(exporting.owner.name)+' is putting the checked parts together.'};
  else if(running.length){const next=vm.parts.find(x=>x.status==='pending'&&x.waitsOn.length);
   sentence={status:'running',word:'Running',reason:H(listWords(running.map(x=>x.owner.name)))+(running.length>1?' are':' is')+' working.'+(next?' '+H(next.owner.name)+' starts after '+(next.waitsOn.length>1?'both parts are':'that part is')+' checked.':'')};}
  else if(vm.parts.every(x=>x.checked))sentence={status:'running',word:'Running',reason:'Putting the checked parts together.'};
  else sentence={status:'running',word:'Running',reason:'The Coordinator is handing out the next part.'};
  /* lanes: one per part (8.1); line 1 = part · verb, line 2 = its owner and what it waits for or how it was checked.
     Before the Coordinator's plan they are the helpers, each waiting for it. */
  const lane=x=>{const s=!started?'queued':x.checked?'done':x.status==='running'?'working':'queued';
   const verb=!started?'Queued':x.checked?'Done':x.status==='running'?'Working':x.waitsOn.length?'Waiting its turn':'Queued';
   const l2=!started?'waits for the Coordinator’s plan':x.checked?'checked against its “done when”'+(x.secondTry?' · 2nd try':''):x.status==='running'?'working on it: '+H(x.doneWhen):x.waitsOn.length?'starts after '+H(listWords(x.waitsOn)):'waits its turn ('+H(clamp?clamp.card:w.effectiveConcurrency+' at a time')+')';
   return S.pmxLane({key:'pmx-lane:'+r.id+':'+x.id,state:s,action:'collab-open-participant',attrs:ra+' data-participant="'+H(x.owner.id)+'"',
    mark:S.pmxMark({role:x.owner.persona,seat:x.owner.seat,size:22,state:s,standin:x.owner.standIn}),
    name:H(started?x.title:x.owner.name),sub:H(x.owner.effectiveModel),verb:H(verb),verbKey:'vb:'+r.id+':'+x.id+':'+s,
    line2:started?H(x.owner.name)+' · '+l2:l2,line2Kind:'detail'});};
  const shown=vm.parts.length>3?vm.parts.slice(0,2):vm.parts;
  Object.assign(out,{density:started?'live':'starting',sentence,
   lanes:S.pmxLanes({key:'pmx-lanes:'+r.id,kind:'crew',runId:r.id,lanesHtml:shown.map(lane).join(''),
    more:vm.parts.length>3?{count:vm.parts.length-2,text:'Show all',action:'collab-toggle-expand',attrs:ra}:null})});
  return out;
 }
 /* M4 (5.5, 8.1 Motion): when the Coordinator checks a part, one attention bar travels from that part's lane mark to
    the Coordinator's mark in the head cluster (the move token, E-22: no literal duration). Event-driven, never a loop: a module-local map of the
    checked parts per run sees the change after the render that shows it (5.3 rule 4). Nothing plays on the first
    look at a run, under reduced motion, or when either mark is off screen. The bar is a transient body child like
    the Start flight's clone (never a node of the patched card) and is removed when it lands. */
 const checkedSeen=new Map();
 function spotTravel(){
  const P=X_();if(!P?.after)return;
  P.after((ctx,phase)=>{if(phase!=='app')return;
   C.runs().forEach(r=>{if(!owns(r.id))return;const now=r.crew.assignments.filter(a=>a.status==='done').map(a=>a.id),prev=checkedSeen.get(r.id);checkedSeen.set(r.id,now);
    if(!prev||P.reduced?.())return;
    now.filter(id=>!prev.includes(id)).forEach(pid=>{
     const card=document.querySelector('#pmRoot .transcript .pmx-run[data-run-id="'+CSS.escape(r.id)+'"]');if(!card)return;
     const from=card.querySelector('[data-k="pmx-lane:'+CSS.escape(r.id)+':'+CSS.escape(pid)+'"] .pmx-lane-mark'),to=card.querySelector('.pmx-run-head .pmx-cluster > .pmx-mark');
     if(!from||!to)return;const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();if(!a.width||!b.width||a.bottom<0||a.top>innerHeight)return;
     const bar=document.createElement('i');bar.className='pmx-crew-spot';bar.setAttribute('aria-hidden','true');bar.dataset.k='pmx-spot:'+r.id+':'+pid;document.body.appendChild(bar);
     const x0=a.left+a.width/2-7,y0=a.bottom+2,x1=b.left+b.width/2-7,y1=b.bottom+2;
     const anim=P.animate(bar,[{transform:'translate('+x0+'px,'+y0+'px)',opacity:1},{transform:'translate('+x1+'px,'+y1+'px)',opacity:1,offset:.85},{transform:'translate('+x1+'px,'+y1+'px)',opacity:0}],{duration:P.t('move'),easing:P.ease('move'),fill:'forwards'});
     const done=()=>bar.remove();if(anim?.finished)anim.finished.then(done,done);else done();
    });
   });
  });
 }
 spotTravel();
 /* Pick a new Coordinator (7.6; cmd.collaboration.configure, then the sheet's "Save changes" sends
    cmd.collaboration.reconfigure): opens this run's Change setup sheet through COLLAB's own open path. Its own action
    name, so a card never carries a second `collab-open-configure[data-kind="crew"]` beside the wand row. */
 E.action('crew-pick-coordinator',(c,b)=>{const r=run(b.dataset.run);if(!r||r.kind!=='crew')return true;const x=document.createElement('button');x.dataset.kind='crew';x.dataset.reconfigure=r.id;E.run('collab-open-configure',x,new Event('click'));return true;});
 window.PM56_CREW={activityRuns,activityMembers,activityHover,activityBody,preflight,signature,sourceHash,admit,owns,claim,deliver,payload,calculate,finalize,evaluate,commitPolicy,renderSummary,current,sheetParts,cardParts,planVM,autoCap};
 /* A2-26: evaluate declares its side-effect-free dry run (evaluate.dryRun, the flag COLLAB's Crew Auto sheet reads).
    A pass-through stand-in assigned over it (the pmx-verify ledger spy wraps it to count calls without copying its
    properties) keeps the declaration: this accessor exists only for that and goes when the spy copies own properties
    (FOUNDATION REQUEST in CREW-A-NOTES). The flag is carried only to a stand-in that can pass the dry run on (one
    that forwards every argument, length 0, or declares the second); one that takes the request alone never gets it,
    and even then the real evaluate records nothing for a chat that does not exist, so a sample never admits. */
 let evaluateFn=evaluate;evaluate.dryRun=true;
 Object.defineProperty(window.PM56_CREW,'evaluate',{enumerable:true,configurable:true,get:()=>evaluateFn,set:f=>{if(typeof f==='function'&&f.dryRun===undefined&&(f.length===0||f.length>=2))f.dryRun=true;evaluateFn=f;}});
})();
