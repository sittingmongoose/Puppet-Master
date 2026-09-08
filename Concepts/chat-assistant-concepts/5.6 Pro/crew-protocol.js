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
 const run=id=>C.run(id),owns=id=>!!run(id)?.crew?.protocolVersion,views=new Map(),autoRequests=new Map();
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
 const defs=[{id:'normalize',title:'Normalize titles',slot:0,dependsOn:[],outputContract:'normalized_rows',expects:'Trim titles; keep identifiers and order.'},
  {id:'quoting',title:'Verify CSV quoting',slot:1,dependsOn:[],outputContract:'quoting_checks',expects:'Commas and quotes are escaped without data loss.'},
  {id:'export',title:'Assemble and verify export',slot:2,dependsOn:['normalize','quoting'],outputContract:'csv_export',expects:'Combine verified inputs into an exact CSV file.'}];
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
  a.status='running';a.attempt=freeze(attempt);C.appendMessage(id,{senderKind:'coordinator',senderName:'Coordinator',messageType:'request',recipientIds:[p.id],body:a.title+' — '+a.expects});return {ok:true,attempt:clone(attempt)};
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
  a.result=freeze(clone(x.result));a.status='done';a.evidenceNote='Verified against the frozen input and '+a.outputContract+' contract.';
  C.setOutcome(id,a.participantId,'completed',{reason:a.evidenceNote});a.completionAttemptId=r.participants.find(p=>p.id===a.participantId).attempts.at(-1).attempt_id;
  C.appendMessage(id,{senderKind:'participant',senderId:a.participantId,senderName:a.assignedRole,messageType:'response',body:a.title+' complete. '+a.evidenceNote});return {ok:true};
 }
 function finalize(id,x){const r=run(id);if(r?.crew?.summary){return r.status==='completed'&&x?.epoch===r.stopEpoch&&x.sourceHash===r.crew.input.sourceHash&&r.crew.assignments.every(a=>current(r,a))?{ok:true,reused:true,artifactId:r.crew.summary.artifactId}:fail('stale_finalization');}
  const why=gate(r,x);if(why)return fail(why);if(r.crew.assignments.some(a=>a.status!=='done'||!current(r,a)))return fail('assignments_incomplete_or_stale');
  const output=r.crew.assignments.find(a=>a.id==='export').result,artifactId='crew-csv-'+id;
  r.artifacts.push({id:artifactId,label:output.filename,kind:'csv',body:output.content,readOnly:true,sourceRunId:id,sourceHash:r.crew.input.sourceHash});
  r.crew.summary=freeze({artifactId,completedAssignments:3,rowCount:output.rowCount,sourceHash:r.crew.input.sourceHash});r.expectedOutputs[0].delivered=true;r.status='completed';r.completedAt=new Date().toISOString();
  C.appendMessage(id,{senderKind:'coordinator',senderName:'Coordinator',messageType:'handoff',body:'All three output contracts verified. '+output.filename+' is ready; no project files were changed.'});return {ok:true,artifactId};
 }
 function commitPolicy(d){
  if(!d||d.kind!=='crew'||!d.autoMode)return fail('auto_configuration_required');
  if(!Array.isArray(d.rows)||!d.rows.length||d.rows.length>8||d.wonderer||d.grillMe||!Number.isInteger(+d.config.parallelism)||+d.config.parallelism<1)return fail('invalid_policy_roster');
  const pre=C.validateStart(d);if(!pre.ok)return pre;
  if(!['high','medium'].includes(d.config.autoComplexity)||!['2','3'].includes(String(d.config.autoMinIndependent||'2')))return fail('invalid_auto_criteria');
  const def=C.definitions().crew,revision=(def.autoPolicy?.revision||0)+1;
  def.autoPolicy=freeze({revision,name:d.name,purpose:d.purpose,rows:clone(d.rows),config:clone({...d.config,autoMinIndependent:String(d.config.autoMinIndependent||'2')}),maxMembers:d.rows.length});
  window.PM56_RUNTIME.collab.effects.settingsWrites++;def.autoConfigured=true;def.autoEnabled=true;def.autoMaxMembers=d.rows.length;def.autoRosterTemplate=clone(d.rows);return {ok:true,revision};
 }
 function evaluate(request){
  const c=E.ctx(),def=C.definitions().crew,policy=def.autoPolicy;
  if(!request?.id||!request.threadId||!request.input||typeof request.explicitSingle!=='boolean'||!['low','medium','high'].includes(request.complexity))return fail('invalid_request');
  const fp=hash(request),key=request.threadId+':'+request.id,old=autoRequests.get(key);
  if(old)return old.fingerprint===fp?{...clone(old.result),reused:true}:fail('conflicting_request');
  let reason=null;
  if(!def.autoEnabled||!policy)reason='auto_not_enabled';
  else if(request.explicitSingle)reason='explicit_single_agent';
  else if(c.state.mode!=='Agent')reason='parent_mode_disallows_execution';
  else if(({low:1,medium:2,high:3}[request.complexity]||0)<({medium:2,high:3}[policy.config.autoComplexity]))reason='complexity_below_threshold';
  else if(defs.filter(t=>!t.dependsOn.length).length<Number(policy.config.autoMinIndependent))reason='insufficient_independent_work';
  else if(request.memberCount!==3||request.memberCount>policy.maxMembers||request.memberCount>request.input.capacity?.maxMembers)reason='member_cap';
  if(reason){const result={ok:true,admitted:false,reason,requestId:request.id,policyRevision:policy?.revision||null};autoRequests.set(key,{fingerprint:fp,result});return result;}
  const d={kind:'crew',threadId:request.threadId,requestKey:'auto:'+key,name:request.input.label,purpose:request.input.objective,rows:clone(policy.rows),config:clone(policy.config),crewInput:request.input,autoAdmission:true,policyRevision:policy.revision};
  const started=C.admitCrewWork(d,c);if(!started.ok)return started;
  const result={ok:true,admitted:true,runId:started.runId,requestId:request.id,policyRevision:policy.revision};autoRequests.set(key,{fingerprint:fp,result});return result;
 }
 function renderSummary(c,r){const done=r.crew.assignments.filter(a=>a.status==='done').length;
  return '<div class="crew-work-summary"><strong>'+done+' / 3 assignments complete</strong><span>'+r.crew.effectiveConcurrency+' simultaneous · '+(r.crew.admissionKind==='auto'?'Crew Auto':'Explicit Crew')+'</span></div><button class="text-button" data-action="crew-open-work" data-run="'+c.esc(r.id)+'">'+c.icon('document',12)+' '+(r.status==='completed'?'Open result':'Open assignments')+'</button>';
 }
 function documentHtml(c,id){const r=run(id);if(!owns(id))return '';const w=r.crew,esc=c.esc,view=views.get(id)||{},output=r.artifacts.find(a=>a.id===w.summary?.artifactId);
  const rows=w.assignments.map(a=>'<section class="crew-work-row" data-assignment="'+esc(a.id)+'"><header><strong>'+esc(a.title)+'</strong><span>'+esc(a.status==='done'?'Verified':a.status==='running'?'Working':'Pending')+'</span></header><p>'+esc(a.assignedRole)+(a.dependsOn.length?' · after '+a.dependsOn.map(k=>esc(w.assignments.find(t=>t.id===k).title)).join(' and '):' · independent')+'</p><details data-crew-disclosure="'+esc(a.id)+'" data-run="'+esc(id)+'"'+(view[a.id]?' open':'')+'><summary>Output contract'+(a.result?' and result':'')+'</summary><p>'+esc(a.expects)+'</p><small>Tools: local calculation · context: frozen collection example</small>'+(a.result?'<pre>'+esc(JSON.stringify(a.result,null,2))+'</pre>':'')+'</details></section>').join('');
  return '<article class="editor-doc crew-work-document" data-crew-run="'+esc(id)+'">'+(window.PM56_CREW_DEMOS?.editorGuide(id)||'')+'<div class="crew-work-meta"><span>Crew · '+esc(r.status)+'</span><span>'+esc(w.admissionKind==='auto'?'Auto policy v'+w.policyRevision:'Explicit delegation')+'</span></div><h1>'+esc(r.title)+'</h1><p class="crew-work-objective">'+esc(r.purpose)+'</p><div class="crew-work-stats"><span>'+w.assignments.filter(a=>a.status==='done').length+' / 3 verified</span><span>'+w.effectiveConcurrency+' simultaneous'+(w.effectiveConcurrency!==w.requestedConcurrency?' · requested '+w.requestedConcurrency:'')+'</span></div>'+rows+(output?'<section class="crew-work-result"><header><strong>'+esc(output.label)+'</strong><button class="text-button" data-action="crew-export-result" data-run="'+esc(id)+'">Export CSV</button></header><pre>'+esc(output.body)+'</pre><small>'+w.summary.rowCount+' rows · original order preserved · quotes verified</small></section>':'')+'<details class="crew-work-source" data-crew-disclosure="source" data-run="'+esc(id)+'"'+(view.source?' open':'')+'><summary>Frozen input and activity</summary><pre>'+esc(JSON.stringify(w.input.rows,null,2))+'</pre><small>'+esc(w.input.sourceHash)+'</small>'+r.messages.map(m=>'<p><strong>'+esc(m.senderName)+'</strong> '+esc(m.body)+'</p>').join('')+'</details><div class="crew-work-actions">'+(['running','paused'].includes(r.status)?'<button class="soft-button" data-action="'+(r.status==='paused'?'collab-resume':'collab-pause')+'" data-run="'+esc(id)+'">'+(r.status==='paused'?'Resume':'Pause')+'</button><button class="text-button" data-action="collab-cancel" data-run="'+esc(id)+'">Cancel</button>':'<button class="soft-button" data-action="crew-run-again" data-run="'+esc(id)+'">Run another Crew</button>')+'</div><p class="crew-work-provenance">Local recorded example · no provider calls or project writes</p></article>';
 }
 function activityRuns(c){return C.runsForThread(c.state.selectedThread).filter(r=>owns(r.id));}
 function activityMembers(c){return activityRuns(c).flatMap(r=>r.participants.map(p=>({...p,name:p.role,current:p.current,crewRunId:r.id})));}
 function activityHover(c){return '<div class="ab-head"><strong>Crew</strong><span>'+activityRuns(c).length+' run</span></div><div class="ab-body">'+activityRuns(c).slice(-4).map(r=>'<button class="ab-row" data-action="open-activity" data-domain="crew" data-crew-run="'+c.esc(r.id)+'"><span class="ab-row-copy"><b>'+c.esc(r.title)+'</b><i>'+c.esc(r.status)+' · '+r.crew.assignments.filter(a=>a.status==='done').length+'/3 assignments verified</i></span>'+c.icon('chevron',12)+'</button>').join('')+'</div>';}
 function activityBody(c){let rows=activityRuns(c);const selected=c.state.activity.selected;if(selected?.domain==='crew'&&rows.some(r=>r.id===selected.id))rows=rows.filter(r=>r.id===selected.id);
  return '<div class="crew-activity-body">'+rows.map(r=>'<section data-crew-activity="'+c.esc(r.id)+'"><h3>'+c.esc(r.title)+'</h3>'+renderSummary(c,r)+r.crew.assignments.map(a=>'<button class="crew-activity-member" data-action="collab-open-participant" data-run="'+c.esc(r.id)+'" data-participant="'+c.esc(a.participantId)+'"><strong>'+c.esc(a.assignedRole)+'</strong><span>'+c.esc(a.status==='done'?'Verified':a.status==='running'?'Working':'Pending')+'</span><small>'+c.esc(a.title)+'</small></button>').join('')+'</section>').join('')+'</div>';}
 // Disclosure state belongs to this run's view, not its result contract.
 document.addEventListener('toggle',e=>{const n=e.target;if(!n.isConnected||!n.matches?.('details[data-crew-disclosure]'))return;const id=n.dataset.run;if(!owns(id))return;const v=views.get(id)||{};v[n.dataset.crewDisclosure]=n.open;views.set(id,v);},true);
 E.chainAction('open-activity',(c,b)=>{if(!owns(b.dataset.crewRun))return false;c.state.activity.pinned=true;c.state.activity.selected={domain:'crew',id:b.dataset.crewRun};return false;});
 E.chainAction('open-crew',(c,b)=>{const r=activityRuns(c).find(r=>r.participants.some(p=>p.id===b.dataset.id));if(!r)return false;c.state.activity.pinned=true;c.state.activity.selected={domain:'crew',id:r.id};c.state.activity.scope='focus';c.state.activity.open=true;c.renderApp();return true;});
 E.chainAction('collab-modal-commit',(c)=>{const d=C.draft();if(d?.kind!=='crew')return false;
  if(d.autoMode){const res=commitPolicy(d);if(!res.ok){d.lastFailure={error:res.error,message:'Keep the configuration and correct this value.'};c.renderOverlays();return true;}window.PM56_RUNTIME.collab.draft=null;c.closeDialog();c.renderApp();return true;}
  if(!d.crewInput)return false;const res=C.admitCrewWork(d,c);if(!res.ok){d.lastFailure={error:res.error,message:'No work was started. This local example needs three roles and the current assistant as coordinator.'};c.renderOverlays();return true;}window.PM56_RUNTIME.collab.draft=null;c.closeDialog();c.renderApp();return true;
 });
 function runAgain(c,id){const r=run(id);if(!owns(id))return;if(['running','paused'].includes(r.status)){c.toast('Stop before reconfiguring','Cancel the current run first; its completed results will be retained.');return;}C.openConfigure('crew',id,false);const d=C.draft();d.reconfigureRunId=null;d.threadId=r.threadId;d.requestKey='crew-rerun:'+r.id+':'+d.rows[0].rowId;d.crewInput=clone(r.crew.input);d.name=r.title+' · another run';c.openDialog({type:'collab-configure'});}
 E.chainAction('collab-open-configure',(c,b)=>{if(!owns(b.dataset.reconfigure))return false;runAgain(c,b.dataset.reconfigure);return true;});
 E.action('crew-run-again',(c,b)=>{runAgain(c,b.dataset.run);return true;});
 E.chainAction('collab-evidence-confirm',(c,b)=>{if(!owns(b.dataset.run))return false;c.toast('Verified output required','A free-text note cannot complete this assignment.');return true;});
 E.chainAction('collab-crew-complete',(c,b)=>{if(!owns(b.dataset.run))return false;c.state.editorRevealed=true;c.openEditor('crew-work:'+b.dataset.run);return true;});
 E.action('crew-open-work',(c,b)=>{if(!owns(b.dataset.run))return true;c.closeDialog();c.closeMenu();c.state.editorRevealed=true;c.openEditor('crew-work:'+b.dataset.run);return true;});
 E.action('crew-export-result',(c,b)=>{const r=run(b.dataset.run),a=r?.artifacts.find(a=>a.id===r.crew?.summary?.artifactId);if(!a)return true;const url=URL.createObjectURL(new Blob([a.body],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=a.label;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);c.renderApp();return true;});
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('crew-work:')?'Crew work':'');
 E.slot('editorDocument',c=>c.editorId?.startsWith('crew-work:')?documentHtml(c,c.editorId.slice(10)):'');
 E.chainAction('reset-all',()=>{views.clear();autoRequests.clear();return false;});
 window.PM56_CREW={activityRuns,activityMembers,activityHover,activityBody,preflight,signature,sourceHash,admit,owns,claim,deliver,payload,calculate,finalize,evaluate,commitPolicy,renderSummary,documentHtml,current};
})();
