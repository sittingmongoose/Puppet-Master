/* Batch 12 — bounded LOCAL BSD state machine. No native command, EventRecord,
 * provider attempt, persisted receipt, permission grant, or primary writer.
 * Source: Plans/Back_Seat_Driver.md §§3–15, modal correction, BSD-026..028.
 * The injected reader owns primary truth; the advisor gets redacted copies.
 */
(function(root){
 'use strict';
 const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
 const canonical=x=>x===null?'null':Array.isArray(x)?'['+x.map(canonical).join(',')+']':typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}':JSON.stringify(x);
 // Local deterministic identity, not a cryptographic integrity or security claim.
 const digest=x=>{let h=2166136261;for(const c of canonical(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');};
 const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const TRIGGERS=['pre_first_material_mutation','pre_high_risk_action','constraint_divergence','repeated_normalized_failure','environment_identity_change','major_verification_failure','pre_terminal_completion_claim','configured_stage_boundary','project_watch_rule','held_finding_reconfirmation'];
 const STAGES=[['prd_builder','PRD Builder'],['planning_wizard','Planning Wizard'],['deep_plan','Plan Drafting'],['planunit_compile','PlanUnit Compilation'],['worknode_generation','WorkNode Generation'],['worknode_execution','Code Generation'],['verification','Verification Run'],['plan_compile','Gate Evaluation'],['worknode_audit','Audit Review'],['certification','Certification']];
 const READ_TOOLS=['file.read','file.search','grep','lsp.diagnostics','scm.diff','test.inspect','artifact.read','receipt.read','usage.read','browser.inspect','research.read'];
 const QUARANTINE=['malformed_output','mutating_instruction','credential_exfiltration','instruction_override','unsafe_content','tool_authority_violation'];
 const rank={nit:0,concern:1,critical:2};
 const result=(ok,fields={})=>({ok,kind:'local_bsd_receipt',native:false,primary_run_mutated:false,authority_granted:false,...clone(fields)});
 function defaults(){return {mode:'auto',modelId:'sonnet46',persona:'Critical Advisor',effort:'',fast:false,sensitivity:'balanced',catchUpSeconds:30,cooldownTurns:3,retainTranscript:true,selfCompactThreshold:.8,workflowMode:'inherit',stages:STAGES.map(([id,label])=>({id,label,mode:'inherit'}))};}
 class Engine {
  constructor(options={}){this.clock=options.clock||(()=>Date.now());this.onChange=options.onChange||(()=>{});this.clear();}
  clear(){this.policies=new Map();this.sources=new Map();this.assignments=new Map();this.byScope=new Map();this.closed=new Map();this.bindings=[];this.workflowBindings=new Map();this.receipts=[];this.serial=0;this.lifecycle=(this.lifecycle||0)+1;}
  id(prefix){return prefix+'-'+this.lifecycle+'-'+(++this.serial);}
  register(threadId,reader){if(!threadId||typeof reader!=='function')return result(false,{error:'invalid_request'});this.sources.set(threadId,reader);return result(true);}
  read(threadId){const reader=this.sources.get(threadId);let s=null;try{s=reader?clone(reader()):null;}catch(_){return null;}return s&&s.threadId===threadId&&s.projectId&&s.runId&&Number.isInteger(s.generation)?s:null;}
  policy(projectId){return clone(this.policies.get(projectId)||{projectId,revision:0,...defaults()});}
  validate(values){
   if(!values||typeof values.fast!=='boolean'||typeof values.effort!=='string'||!['off','auto','on'].includes(values.mode)||!['inherit','off','auto','on'].includes(values.workflowMode)||!['conservative','balanced','frequent'].includes(values.sensitivity)||![0,15,30,60].includes(values.catchUpSeconds)||!Number.isInteger(values.cooldownTurns)||values.cooldownTurns<0||values.cooldownTurns>100||typeof values.retainTranscript!=='boolean'||!Number.isFinite(values.selfCompactThreshold)||values.selfCompactThreshold<.1||values.selfCompactThreshold>.95||typeof values.modelId!=='string'||!values.modelId||typeof values.persona!=='string'||!values.persona)return 'invalid_request';
   if(!Array.isArray(values.stages)||values.stages.length!==STAGES.length||STAGES.some(([id])=>values.stages.filter(s=>s&&s.id===id).length!==1)||values.stages.some(s=>!s||!['inherit','off','auto','on'].includes(s.mode)))return 'invalid_request';
   if(values.tools&&(!Array.isArray(values.tools)||values.tools.some(t=>!READ_TOOLS.includes(t))))return 'tool_profile_widening_rejected';
   return null;
  }
  configure(req){
   if(!req||!req.projectId)return result(false,{error:'project_not_found'});
   const old=this.policy(req.projectId);if(old.revision!==req.expectedRevision)return result(false,{error:'stale_policy_revision'});
   const error=this.validate(req.values);if(error)return result(false,{error});
   let a=null;if(req.assignmentId){a=this.assignments.get(req.assignmentId);const s=a&&this.sync(a);if(!a||a.projectId!==req.projectId||!s||!this.sameScope(a,s))return result(false,{error:'stale_projection'});if(a.epoch!==req.expectedEpoch)return result(false,{error:'stale_epoch'});}
   const p={projectId:req.projectId,revision:old.revision+1};for(const k of Object.keys(defaults()))p[k]=clone(req.values[k]);this.policies.set(req.projectId,p);
   if(a){a.policy=clone(p);a.bindingRevision++;a.paused=false;a.quarantined=false;a.quarantineCount=0;a.mode=this.resolve(p,a.stage).mode;a.modeSource=this.resolve(p,a.stage).source;a.identity=clone(req.identity||a.identity);this.resetAssignment(a,'explicit_reconfiguration',false);a.state=a.stopped?'stopped':a.mode==='off'?'off':a.identity?.available===false?'unavailable':'idle';this.workflowBindings.set(this.workflowKey(this.read(a.threadId)),{id:a.bindingId,revision:a.bindingRevision,policy:clone(p),identity:clone(a.identity)});this.bindings.push(this.binding(a));}
   if(!a&&req.threadId){const source=this.read(req.threadId);if(source&&source.projectId===req.projectId){const key=this.workflowKey(source),wb=this.workflowBindings.get(key);if(wb)this.workflowBindings.set(key,{...wb,revision:wb.revision+1,policy:clone(p),identity:clone(req.identity||wb.identity)});}}
   this.onChange();return result(true,{revision:p.revision,epoch:a?.epoch,policy:p});
  }
  resolve(p,stage){const row=p.stages.find(s=>s.id===stage);if(row&&row.mode!=='inherit')return {mode:row.mode,source:'stage'};if(p.workflowMode!=='inherit')return {mode:p.workflowMode,source:'workflow'};return {mode:['off','auto','on'].includes(p.mode)?p.mode:'auto',source:'project'};}
  workflowKey(s){return canonical([s.projectId,s.threadId,s.runId,s.workflow||'assistant']);}
  key(s){return canonical([s.projectId,s.threadId,s.runId,s.workflow||'assistant',s.stage||'worknode_execution']);}
  fingerprint(s){return digest([s.projectId,s.threadId,s.runId,s.primaryEpoch||0,s.worktree,s.primaryRoute,s.permission,s.contextRevision||'',s.historyRevision||'']);}
  sameScope(a,s){return a.scopeKey===this.key(s);}
  binding(a){return {id:a.bindingId,revision:a.bindingRevision,assignmentId:a.id,projectId:a.projectId,threadId:a.threadId,policy:clone(a.policy),identity:clone(a.identity),mode:a.mode,stage:a.stage};}
  bind(threadId,identity){
   const s=this.read(threadId);if(!s)return result(false,{error:'owner_unavailable'});
   let wb=this.workflowBindings.get(this.workflowKey(s));if(!wb){wb={id:this.id('workflow-binding'),revision:1,policy:this.policy(s.projectId),identity:clone(identity)};this.workflowBindings.set(this.workflowKey(s),wb);}const p=clone(wb.policy),mode=this.resolve(p,s.stage||'worknode_execution'),key=this.key(s),prior=this.byScope.get(key);identity=clone(wb.identity);
   if(prior)return result(true,{assignmentId:prior,duplicate:true,binding:this.binding(this.assignments.get(prior))});
   if(mode.mode==='off'){this.receipts.push({threadId,projectId:s.projectId,outcome:'no_call_off',local:true});return result(true,{assignmentId:null,noCall:'no_call_off'});}
   const a={id:this.id('advisor'),bindingId:wb.id,bindingRevision:wb.revision,scopeKey:key,projectId:s.projectId,threadId,runId:s.runId,stage:s.stage||'worknode_execution',policy:p,mode:mode.mode,modeSource:mode.source,identity:clone(identity),epoch:1,fingerprint:this.fingerprint(s),primaryEpoch:s.primaryEpoch||0,historyRevision:s.historyRevision||'',cursor:s.generation,generation:s.generation,stablePrefix:digest(['local-read-only',identity]),reprimeRequired:false,state:identity?.available===false?'unavailable':'idle',paused:false,stopped:false,quarantined:false,quarantineCount:0,hostWarnings:0,pending:null,findings:[],cycles:[],transcript:[],usage:{localEvaluations:0,providerCalls:0,noCalls:0,held:0,cleared:0,emitted:0,suppressed:0,failures:0,timeouts:0,quarantines:0,quotaPauses:0,costUsd:null,inputTokens:null,outputTokens:null},lastChecked:null,cooldownUntil:0,controlsRevision:0};
   this.assignments.set(a.id,a);this.byScope.set(key,a.id);this.bindings.push(this.binding(a));this.onChange();return result(true,{assignmentId:a.id,binding:this.binding(a)});
  }
  current(threadId){const s=this.read(threadId);return s?this.assignments.get(this.byScope.get(this.key(s)))||null:null;}
  sync(a){const s=this.read(a.threadId);if(!s||!this.sameScope(a,s))return null;
   if(a.fingerprint!==this.fingerprint(s)){const primaryChanged=a.primaryEpoch!==(s.primaryEpoch||0)||a.historyRevision!==(s.historyRevision||'');this.resetAssignment(a,'primary_identity_changed',primaryChanged);a.fingerprint=this.fingerprint(s);a.primaryEpoch=s.primaryEpoch||0;a.historyRevision=s.historyRevision||'';}
   a.generation=s.generation;return s;
  }
  resetAssignment(a,reason,primaryChanged){
   if(a.pending){const cycle=a.cycles.find(c=>c.id===a.pending.id);if(cycle){cycle.status='cancelled';cycle.reason=reason;}a.pending=null;}
   if(a.catchUp?.state==='waiting'){a.catchUp.state='released';a.catchUp.reason=reason;}a.epoch++;a.controlsRevision++;a.cursor=0;a.localContextChars=0;a.stablePrefix=digest(['local-read-only',a.identity,a.epoch]);a.reprimeRequired=true;a.lastChecked=null;a.transcript=[];a.cooldownUntil=0;
   a.findings.forEach(f=>{if(f.status==='held'){f.history.push({generation:a.generation,what:'Preserved across '+reason+'. Reconfirmation required.'});f.needsReconfirmation=true;if(primaryChanged){f.status='closed';f.closeReason='epoch_replaced';}}});
   a.state=a.mode==='off'?'off':a.paused?'paused':'catching_up';
  }
  reset(threadId,reason='primary_compaction'){const a=this.current(threadId);if(!a)return result(false,{error:'bsd_assignment_not_found'});this.resetAssignment(a,reason,false);this.onChange();return result(true,{epoch:a.epoch});}
  selfCompact(threadId){const a=this.current(threadId);if(!a)return result(false,{error:'bsd_assignment_not_found'});this.resetAssignment(a,'advisor_self_compaction',false);this.onChange();return result(true,{epoch:a.epoch});}
  noCall(a,reason){a.usage.noCalls++;a.cycles.push({id:this.id('no-call'),local:true,epoch:a.epoch,generation:a.generation,status:'no_call',reason});this.onChange();return result(true,{noCall:reason});}
  begin(threadId,options={}){
   const a=this.current(threadId);if(!a)return result(false,{error:'mode_off_no_assignment'});const s=this.sync(a);if(!s)return result(false,{error:'stale_projection'});
   if(options.expectedEpoch!=null&&options.expectedEpoch!==a.epoch)return result(false,{error:'stale_epoch'});
   if(a.mode==='off')return this.noCall(a,'no_call_off');
   if(a.stopped||a.paused)return this.noCall(a,'no_call_paused');
   if(a.state==='quota_paused')return this.noCall(a,'no_call_quota_unavailable');
   if(a.identity?.available===false)return result(false,{error:'advisor_model_unavailable'});
   if(a.pending)return result(true,{ticket:clone(a.pending),duplicate:true});
   if(options.quotaUnavailable)return this.noCall(a,'no_call_quota_unavailable');
   if(options.resourceRefused)return this.noCall(a,'no_call_resource_refused');
   if(options.costLimit)return this.noCall(a,'no_call_cost_limit');
   if(options.stageLimit)return this.noCall(a,'no_call_stage_limit');
   const held=a.findings.filter(f=>f.status==='held');let trigger=options.trigger;
   if(held.length)trigger='held_finding_reconfirmation';
   if(a.mode==='auto'&&!TRIGGERS.includes(trigger))return this.noCall(a,'no_call_no_trigger');
   if(!options.material&&!held.length&&!TRIGGERS.includes(trigger))return this.noCall(a,'no_call_no_material_delta');
   if(!s.redaction?.checked||s.redaction.scope!=='local-fixture')return result(false,{error:'policy_denied'});
   if((a.localContextChars||0)>=20000*a.policy.selfCompactThreshold)this.resetAssignment(a,'advisor_self_compaction',false);
   const delta=(s.deltas||[]).filter(d=>d.generation>a.cursor&&d.generation<=s.generation&&!['bsd-advice','internal_memory','auth'].includes(d.kind)).slice(-12).map(d=>({generation:d.generation,kind:d.kind,summary:String(d.summary||'').slice(0,1600),ref:d.ref}));
   const manifest={kind:'bounded_local_input',projectId:s.projectId,threadId:s.threadId,runId:s.runId,stage:a.stage,epoch:a.epoch,generation:s.generation,cursor:a.cursor,trigger:trigger||'eligible_update',delta,constraints:[...new Set(s.constraints||[])],refs:clone(s.refs||{}),redaction:clone(s.redaction),runtime:{worktree:s.worktree,primaryRoute:s.primaryRoute,permission:s.permission},held:held.map(f=>({id:f.id,key:f.key,severity:f.severity,raisedAgainst:f.raisedAgainst})),watch:(s.watch||[]).map(w=>({path:w.path,scope:w.scope,text:String(w.text||'').slice(0,1200),truncated:String(w.text||'').length>1200})),stablePrefix:a.stablePrefix};
   if(canonical(manifest).length>16000)return this.noCall(a,'no_call_resource_refused');
   const frozen=Boolean(options.frozen&&s.frozen&&['configured_stage_boundary','pre_first_material_mutation','pre_high_risk_action','pre_terminal_completion_claim'].includes(trigger));
   const ticket={id:this.id('cycle'),assignmentId:a.id,epoch:a.epoch,fingerprint:a.fingerprint,generation:s.generation,scopeKey:a.scopeKey,manifest,frozen,terminal:Boolean(options.terminal),startedAt:this.clock(),lifecycle:this.lifecycle,bindingRevision:a.bindingRevision};
   a.pending=ticket;a.usage.localEvaluations++;a.state='reviewing';a.cycles.push({...clone(ticket),status:'reviewing',local:true});this.onChange();return result(true,{ticket});
  }
  unsafe(output){if(!output||!Array.isArray(output.findings))return 'malformed_output';if(output.quarantine)return QUARANTINE.includes(output.quarantine)?output.quarantine:'malformed_output';const text=output.findings.map(f=>String(f?.title||'')+' '+String(f?.detail||'')).join(' ');if(/(?:sk-[a-zA-Z0-9]{16,}|Bearer [a-zA-Z0-9._-]{16,})/.test(text))return 'credential_exfiltration';if(/ignore (?:all |previous |prior )*(?:instructions|rules)|override (?:the )?(?:hold|policy|permissions)/i.test(text))return 'instruction_override';if(/(?:run|execute)\s+[`"']?(?:rm\s+-rf|git\s+push|npm\s+install)|approve (?:this|the) (?:permission|request)/i.test(text))return 'mutating_instruction';if(output.tools!=null&&!Array.isArray(output.tools))return 'malformed_output';if(output.tools?.some(t=>!READ_TOOLS.includes(t)))return 'tool_authority_violation';if(output.findings.some(f=>!f||typeof f!=='object'||!Object.hasOwn(rank,f.severity)||!f.family||!Array.isArray(f.objectRefs)||!f.ruleRef||!f.evidenceFingerprint||typeof f.title!=='string'||typeof f.detail!=='string'))return 'malformed_output';return null;}
  finish(ticket,output){
   const a=ticket&&this.assignments.get(ticket.assignmentId);if(!a||ticket.lifecycle!==this.lifecycle)return result(false,{error:'stale_epoch'});
   const stored=a.cycles.find(c=>c.id===ticket.id);if(!stored)return result(false,{error:'invalid_request'});if(['epoch','fingerprint','generation','scopeKey','manifest','frozen','terminal','startedAt','bindingRevision'].some(k=>canonical(stored[k])!==canonical(ticket[k])))return result(false,{error:'stale_projection'});const s=this.sync(a);if(!s||ticket.scopeKey!==a.scopeKey||ticket.epoch!==a.epoch||ticket.fingerprint!==a.fingerprint)return result(false,{error:'stale_epoch'});
   const cycle=a.cycles.find(c=>c.id===ticket.id);if(!cycle)return result(false,{error:'invalid_request'});if(cycle.result)return clone(cycle.result);
   if(!a.pending||a.pending.id!==ticket.id)return result(false,{error:'cancelled'});
   a.pending=null;cycle.finishedAt=this.clock();cycle.latencyMs=cycle.finishedAt-ticket.startedAt;
   const end=(fields)=>{cycle.result=result(true,fields);this.onChange();return clone(cycle.result);};
   if(output?.failure){const type=output.failure;if(!['failed','timed_out','quota_paused','unavailable'].includes(type)){cycle.status='failed';return end({outcome:'failed'});}cycle.status=type;a.state=type;if(a.catchUp?.state==='waiting'){a.catchUp.state='released';a.catchUp.reason=type;}if(type==='quota_paused')a.usage.quotaPauses++;else if(type==='timed_out')a.usage.timeouts++;else a.usage.failures++;return end({outcome:type});}
   const unsafe=this.unsafe(output);if(unsafe){cycle.status='quarantined';cycle.reason=unsafe;cycle.payloadFingerprint=digest(output);a.usage.quarantines++;a.quarantineCount++;if(a.quarantineCount>=2){a.paused=true;a.quarantined=true;a.state='paused';a.hostWarnings=1;}else{this.resetAssignment(a,'quarantine_reprime',false);}return end({outcome:'quarantined',reason:unsafe,paused:a.paused});}
   a.quarantineCount=0;a.quarantined=false;const nowCurrent=ticket.generation===s.generation;let emitted=0;const outcomes=[];
   // Only a review of the latest generation may clear or reconfirm a held issue.
   // A late generation is evidence of what was inspected, not current approval.
   const existingHeld=new Set(ticket.manifest.held.map(f=>f.id));const reRaised=new Set();
   for(const input of output.findings){
    const f=clone(input);const family=canonical([norm(f.family),f.objectRefs.map(String).sort(),norm(f.ruleRef)]),key=family+'|'+f.evidenceFingerprint,closureKey=a.projectId+'|'+a.runId+'|'+key;
    if(!f.detail.trim()||/^(looks fine|nothing to add|stop|ok)[.! ]*$/i.test(f.detail)){a.usage.suppressed++;outcomes.push('content_free_suppressed');continue;}
    let previous=a.findings.find(x=>x.family===family&&x.status==='held')||a.findings.find(x=>x.key===key&&['emitted','closed','cleared'].includes(x.status));
    if(previous&&rank[f.severity]<rank[previous.severity]){if(previous.status==='held')reRaised.add(previous.id);a.usage.suppressed++;outcomes.push('severity_downgrade_rejected');continue;}
    if(this.closed.has(closureKey)){a.usage.suppressed++;outcomes.push('duplicate_suppressed');continue;}
    if(previous?.status==='emitted'&&previous.key===key&&rank[f.severity]<=rank[previous.severity]){a.usage.suppressed++;outcomes.push('duplicate_suppressed');continue;}
    if(previous?.status==='cleared'&&previous.key===key)previous=null;
    const wasHeld=previous?.status==='held';if(wasHeld)reRaised.add(previous.id);
    const canEmit=nowCurrent&&emitted===0&&((wasHeld&&existingHeld.has(previous.id)&&ticket.generation>previous.raisedAgainst)||ticket.frozen||f.severity==='nit'&&!ticket.terminal);
    let record=previous;
    if(!record||record.status==='closed'||record.key!==key&&!wasHeld){record={id:this.id('finding'),family,key,raisedAgainst:ticket.generation,history:[],projectId:a.projectId,threadId:a.threadId,runId:a.runId,advisor:clone(a.identity),originalEpoch:a.epoch};a.findings.push(record);}
    Object.assign(record,{key,title:f.title,detail:f.detail,severity:f.severity,evidence:clone(f.evidence||[]),evidenceFingerprint:f.evidenceFingerprint,latestChecked:ticket.generation,epoch:a.epoch,needsReconfirmation:!nowCurrent});
    if(canEmit){record.terminalStale=false;record.status='emitted';record.advisor=clone(a.identity);record.deliveredAt=s.generation;record.channel=s.status==='paused'||s.status==='stopped'?'resume_only':a.cooldownUntil>s.generation?'aside':'advice';record.history.push({generation:s.generation,what:ticket.frozen?'Reviewed at a recorded frozen boundary.':'Reconfirmed against current evidence.'});a.usage.emitted++;emitted++;outcomes.push('emitted');if(f.severity!=='nit')a.cooldownUntil=s.generation+a.policy.cooldownTurns;}
    else{if(!wasHeld)a.usage.held++;record.needsReconfirmation=true;record.status='held';record.history.push({generation:ticket.generation,what:nowCurrent?'Held for a separate reconfirmation.':'Earlier-generation result held; current work is newer.'});outcomes.push('held');}
   }
   if(nowCurrent)for(const f of a.findings){if(f.status==='held'&&existingHeld.has(f.id)&&ticket.generation>f.raisedAgainst&&!reRaised.has(f.id)){f.status='cleared';f.latestChecked=s.generation;f.history.push({generation:s.generation,what:'Reconfirmation found no surviving issue in current evidence.'});a.usage.cleared++;outcomes.push('cleared');}}
   if(nowCurrent&&a.catchUp?.state==='waiting'){a.catchUp.state='released';a.catchUp.reason='advisor_converged';}a.localContextChars=(a.localContextChars||0)+canonical(ticket.manifest).length;a.cursor=Math.max(a.cursor,ticket.generation);a.reprimeRequired=false;a.lastChecked=this.clock();a.state=a.findings.some(f=>f.status==='held')?'held':emitted?'delivered':a.cursor<s.generation?'catching_up':'idle';cycle.status=outcomes.includes('emitted')?'emitted':outcomes[0]||'silent';cycle.outcomes=outcomes;
   if(a.policy.retainTranscript)a.transcript.push({cycleId:ticket.id,generation:ticket.generation,epoch:a.epoch,manifest:clone(ticket.manifest),outcome:cycle.status,findings:output.findings.map(f=>({title:f.title,severity:f.severity}))});
   return end({outcome:cycle.status,outcomes,emitted});
  }
  closeFinding(threadId,id,expectedEpoch){const a=this.current(threadId),s=a&&this.sync(a);if(!a||!s)return result(false,{error:'bsd_assignment_not_found'});if(expectedEpoch!==a.epoch)return result(false,{error:'stale_epoch'});const f=a.findings.find(f=>f.id===id);if(!f)return result(false,{error:'bsd_finding_not_found'});f.status='closed';f.history.push({generation:s.generation,what:'Dismissed by the user; unchanged evidence stays closed.'});this.closed.set(a.projectId+'|'+a.runId+'|'+f.key,{id:f.id,evidenceFingerprint:f.evidenceFingerprint});this.onChange();return result(true);}
  control(threadId,action,expectedEpoch){const a=this.current(threadId);if(!a)return result(false,{error:'bsd_assignment_not_found'});this.sync(a);if(expectedEpoch!==a.epoch)return result(false,{error:'stale_epoch'});if(a.stopped)return result(false,{error:'already_in_state'});if(action==='pause'&&a.paused||action==='resume'&&!a.paused&&a.state!=='quota_paused')return result(false,{error:'already_in_state'});if(action==='resume'&&a.quarantined)return result(false,{error:'quarantine_terminal_pause'});if(!['pause','resume','stop'].includes(action))return result(false,{error:'invalid_request'});a.paused=action==='pause';a.stopped=action==='stop';this.resetAssignment(a,action,false);a.state=action==='resume'?'idle':action==='stop'?'stopped':'paused';if(action==='stop')a.findings.filter(f=>f.status==='held').forEach(f=>{f.status='closed';f.closeReason='assignment_stopped';});this.onChange();return result(true,{epoch:a.epoch});}
  startCatchup(threadId,expectedEpoch){const a=this.current(threadId),s=a&&this.sync(a);if(!a||!s)return result(false,{error:'bsd_assignment_not_found'});if(expectedEpoch!==a.epoch)return result(false,{error:'stale_epoch'});if(!s.frozen&&s.status!=='completed')return result(false,{error:'invalid_request'});if(!a.findings.some(f=>f.status==='held'&&f.severity==='critical')&&!s.frozen)return result(false,{error:'invalid_request'});if(a.catchUp?.state==='waiting')return result(true,{duplicate:true,catchUp:a.catchUp});a.catchUp={state:'waiting',generation:s.generation,epoch:a.epoch,startedAt:this.clock(),deadline:this.clock()+a.policy.catchUpSeconds*1000,budgetSeconds:a.policy.catchUpSeconds,terminal:s.status==='completed'};this.onChange();return result(true,{catchUp:a.catchUp});}
  endCatchup(threadId,expectedEpoch,abort=false){const a=this.current(threadId),s=a&&this.sync(a);if(!a||!s||expectedEpoch!==a.epoch)return result(false,{error:'stale_epoch'});const w=a.catchUp;if(!w||w.epoch!==a.epoch||w.state!=='waiting')return result(false,{error:'already_in_state'});if(!abort&&this.clock()<w.deadline)return result(false,{error:'catch_up_not_expired'});w.state=abort?'aborted':'expired';w.finishedAt=this.clock();if(!abort&&w.terminal&&s.status==='completed'){const f=a.findings.find(f=>f.status==='held'&&f.severity==='critical');if(f){f.terminalStale=true;f.history.push({generation:s.generation,what:'Bounded terminal catch-up expired. Earlier-generation critical remains unreconfirmed.'});}}this.onChange();return result(true,{catchUp:w});}
  terminalTimeout(threadId){const a=this.current(threadId);return this.endCatchup(threadId,a?.epoch,false);}
  snapshot(threadId){const a=this.current(threadId);if(!a)return null;this.sync(a);return clone(a);}
  nativeCommand(){return result(false,{error:'command_not_registered'});}
 }
 root.PM56_BSD_ENGINE={Engine,defaults,TRIGGERS,STAGES,READ_TOOLS,QUARANTINE,clone,digest,canonical};
})(typeof window==='undefined'?globalThis:window);
