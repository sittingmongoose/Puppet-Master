/* BrainStorm concept protocol: validated recorded inputs on the existing
 * CollaborativeRun. No provider execution, network research or project writes.
 * The Plan owner creates the single resulting Deep Plan. No second Plan store. */
(function(){
 'use strict';
 const E=window.PM56_EXT,C=window.PM56_COLLAB,P=window.PM56_PLANS;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 const run=id=>C.run(id),owns=id=>!!run(id)?.brainstorm?.protocolVersion,fail=error=>({ok:false,error});
 const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const labels={intake:'Intake',blind_proposals:'Independent proposals',normalize:'Options compared',debate:'Debating alternatives',evidence:'Checking evidence',vote:'Considering votes',synthesis:'Ready to synthesize',completed:'Deep Plan ready'};
 function phaseLabel(r){return labels[r.brainstorm.phase]||r.brainstorm.phase;}
 function say(r,type,body,p){return C.appendMessage(r.id,{senderKind:p?'participant':'coordinator',senderId:p?.id||null,senderName:p?.role||'BrainStorm coordinator',messageType:type,body});}
 function core(r){return r.participants.filter(p=>p.additiveRoleKind==='none'||!p.additiveRoleKind);}
 function current(r,a){const p=r.participants.find(p=>p.id===a.participantId);return !!(p&&p.assignmentRevision===a.assignmentRevision&&(!a.completionAttemptId||p.attempts.at(-1)?.attempt_id===a.completionAttemptId)&&(!a.completionAttemptId||p.outcome==='completed'));}
 function gate(r,x){if(!object(x))return 'invalid_payload';if(!r?.brainstorm?.protocolVersion)return 'brainstorm_input_unavailable';if(r.status!=='running')return 'run_not_running';if(x.epoch!==r.stopEpoch)return 'stale_epoch';if(x.sourceHash!==r.brainstorm.input.sourceHash)return 'different_source_hash';if(r.definitionRevision!==r.brainstorm.definitionRevision)return 'definition_changed';return null;}
 function evidenceValid(r,ids){return Array.isArray(ids)&&ids.length>0&&ids.every(id=>r.brainstorm.input.evidence.some(e=>e.id===id));}
 /* IMPACT A1-01: only a draft flagged recorded hands its fixture to the protocol (COLLAB's commit already gates
    this; the owner refuses on its own too). The recorded fixture's own rules (input.constraints, which the
    decision and planPayload read) are the rules this run decides by, so the run records exactly those as its
    must-haves (review fix, honesty): the recorded sheet shows them read-only and nothing the user could type
    is kept on a run that ignores it. A run of the user's own keeps draft.mustHaves (COLLAB writes them). */
 function recordedRules(input){return (input&&Array.isArray(input.constraints)?input.constraints:[]).filter(c=>c&&c.hard).map(c=>String(c.text||'')).filter(Boolean);}
 function admit(r,d){
  if(!d.brainstormInput)return;
  if(C.isRecordedDraft&&!C.isRecordedDraft(d))return;
  const mustHaves=recordedRules(d.brainstormInput);
  const input=freeze({...clone(d.brainstormInput),frozenAt:new Date().toISOString()});
  r.brainstorm={protocolVersion:1,definitionRevision:r.definitionRevision,input,phase:'intake',mustHaves,
   questionBank:{baselineLimit:r.config.questionLimit,grillExtension:r.config.grillExtension,grillMeEnabled:!!d.grillMe,askedIds:[],resolvedIds:[],duplicateIds:[],researchRoutedIds:input.evidence.map(e=>e.id),importedAnswers:clone(input.answers||[])},
   attempts:core(r).map(p=>({id:'bs-attempt-'+r.id+'-'+p.id,participantId:p.id,assignmentRevision:p.assignmentRevision,epoch:r.stopEpoch,sourceHash:input.sourceHash,status:'running',input:{sourceHash:input.sourceHash,peerProposals:[],peerIdentities:[]},proposal:null})),
   proposals:[],debates:[],evidenceChecks:[],votes:[],hardConstraintViolations:[],dissent:[],decision:null,synthesis:null};
  // Batch 14: BrainStorm and its eventual Plan consume the same QuestionItem
  // store. This is a projection adapter, not a second participant allowance.
  const budgetKey='plan:brainstorm-plan-'+r.id,policy=window.PM56_QUESTION_BUDGET.defaults();
  policy.deep_plan_limits.brainstorm=r.config.questionLimit;
  policy.grill_me_extension=r.config.grillExtension;
  const bound=P.budgetOwner.ensure(budgetKey,'brainstorm',!!d.grillMe,policy);
  if(!bound.ok){r.brainstorm.budgetError=bound.error;return;}
  const bank=r.brainstorm.questionBank;bank.budgetKey=budgetKey;
  Object.defineProperties(bank,{
   askedIds:{enumerable:true,configurable:true,get:()=>P.budgetOwner.get(budgetKey).order.slice()},
   baselineLimit:{enumerable:true,configurable:true,get:()=>P.budgetOwner.projection(budgetKey).base_limit},
   grillExtension:{enumerable:true,configurable:true,get:()=>P.budgetOwner.projection(budgetKey).grill_me_extension},
   grillMeEnabled:{enumerable:true,configurable:true,get:()=>P.budgetOwner.projection(budgetKey).grill_me_enabled,set:v=>P.budgetOwner.setGrill(budgetKey,!!v)}
  });
  core(r).forEach(p=>{p.status='working';p.outcome=null;p.current='Independent proposal against the frozen brief';});
  r.expectedOutputs=[{id:'deep-plan-'+r.id,delivered:false}];
  /* IMPACT A3-03: the recorded stamp reads the one provenance predicate (the words stay exact: the run view's
     display rewrite, G-33, matches them) */
  const recorded=!C.provenance||C.provenance(r.id)==='recorded';
  say(r,'message',(recorded?'Recorded example: ':'')+input.label+'. '+(input.answers||[]).length+' prior answers retained; no repeat questions.');
 }
 function submitProposal(id,x){
  const r=run(id),why=gate(r,x);if(why)return fail(why);const b=r.brainstorm,a=b.attempts.find(a=>a.id===x.attemptId);
  if(!a||!current(r,a)||a.assignmentRevision!==x.assignmentRevision)return fail('stale_assignment');
  if(a.status==='completed')return JSON.stringify(a.proposal)===JSON.stringify(x.proposal)?{ok:true,reused:true}:fail('conflicting_proposal');
  if(!['intake','blind_proposals'].includes(b.phase))return fail('proposal_round_closed');
  const q=x.proposal;
  if(!object(q)||!q.id||!q.optionKey||!q.title||!q.approach||!object(q.facts)||!evidenceValid(r,q.evidenceRefs)||['assumptions','benefits','costs','risks','validation','rollback'].some(k=>!Array.isArray(q[k])||!q[k].length))return fail('incomplete_proposal');
  if(b.input.constraints.some(c=>!(c.field in q.facts)||typeof q.facts[c.field]!==typeof c.expected))return fail('missing_constraint_fact');
  if(b.attempts.some(other=>other!==a&&other.proposal?.id===q.id))return fail('duplicate_proposal_id');
  a.proposal=freeze(clone(q));a.status='completed';b.phase='blind_proposals';
  const p=core(r).find(p=>p.id===a.participantId);C.setOutcome(id,p.id,'completed',{reason:'Recorded independent proposal received'});a.completionAttemptId=p.attempts.at(-1).attempt_id;p.current='Proposal submitted independently';
  say(r,'pass','Independent proposal submitted.',p);return {ok:true,attemptId:a.id};
 }
 function normalize(id,x){
  const r=run(id),why=gate(r,x);if(why)return fail(why);const b=r.brainstorm;
  if(b.attempts.some(a=>a.status!=='completed'||!current(r,a)))return fail('proposals_incomplete_or_stale');
  if(b.proposals.length)return {ok:true,reused:true};
  const map=new Map();
  for(const a of b.attempts){const q=a.proposal,old=map.get(q.optionKey),semantic=clone(q);delete semantic.id;
   if(old&&old.fingerprint!==JSON.stringify(semantic))return fail('conflicting_option_definition');
   if(old){old.originatingParticipantIds.push(a.participantId);old.originalProposalIds.push(q.id);}
   else map.set(q.optionKey,{...clone(q),id:q.optionKey,originatingParticipantIds:[a.participantId],originalProposalIds:[q.id],fingerprint:JSON.stringify(semantic)});
  }
  b.proposals=freeze([...map.values()]);b.phase='normalize';say(r,'message',b.attempts.length+' independent proposals consolidated into '+b.proposals.length+' alternatives. All origins retained.');return {ok:true};
 }
 function debate(id,x){
  const r=run(id),why=gate(r,x);if(why)return fail(why);const b=r.brainstorm;
  if(b.attempts.some(a=>!current(r,a)))return fail('stale_assignment');
  const previous=b.debates.find(d=>d.round===x.round);
  if(previous)return JSON.stringify(previous.messages)===JSON.stringify(x.messages)?{ok:true,reused:true}:fail('conflicting_debate_round');
  if(!['normalize','debate'].includes(b.phase)||x.round!==b.debates.length+1||x.round>r.config.debateRounds)return fail('invalid_debate_round');
  if(!Array.isArray(x.messages)||x.messages.length<2||x.messages.some(m=>!object(m)||!core(r).some(p=>p.id===m.participantId)||!m.body||!evidenceValid(r,m.evidenceRefs)))return fail('invalid_debate_message');
  b.debates.push(freeze({round:x.round,messages:clone(x.messages)}));b.phase='debate';x.messages.forEach(m=>say(r,'message',m.body,core(r).find(p=>p.id===m.participantId)));return {ok:true};
 }
 function recordEvidence(id,x){
  const r=run(id),why=gate(r,x);if(why)return fail(why);const b=r.brainstorm;
  if(b.attempts.some(a=>!current(r,a)))return fail('stale_assignment');
  if(b.evidenceChecks.length)return JSON.stringify(b.evidenceChecks)===JSON.stringify(x.checks)?{ok:true,reused:true}:fail('conflicting_evidence');
  if(b.phase!=='debate'||b.debates.length!==r.config.debateRounds)return fail('debate_incomplete');
  if(!Array.isArray(x.checks)||x.checks.some(c=>!object(c))||x.checks.length!==b.proposals.length||new Set(x.checks.map(c=>c.proposalId)).size!==x.checks.length)return fail('evidence_coverage');
  for(const q of b.proposals){const check=x.checks.find(c=>c.proposalId===q.id);if(!check||!evidenceValid(r,check.evidenceRefs)||!check.summary)return fail('invalid_evidence');}
  b.evidenceChecks=freeze(clone(x.checks));
  b.hardConstraintViolations=b.proposals.flatMap(q=>b.input.constraints.filter(c=>c.hard&&q.facts[c.field]!==c.expected).map(c=>({proposalId:q.id,approach:q.title,constraintId:c.id,constraint:c.text,actual:q.facts[c.field],expected:c.expected,evidenceRefs:q.evidenceRefs,detail:'Frozen option capability conflicts with the required value.'})));
  b.phase='evidence';say(r,'response','Evidence checked for every option. '+b.hardConstraintViolations.length+' hard-constraint conflict'+(b.hardConstraintViolations.length===1?'':'s')+' retained.');return {ok:true};
 }
 function vote(id,participantId,x){
  const r=run(id),why=gate(r,x);if(why)return fail(why);const b=r.brainstorm,a=b.attempts.find(a=>a.participantId===participantId);
  if(!a||!current(r,a)||a.status!=='completed')return fail('participant_not_current');
  if(!['evidence','vote'].includes(b.phase))return fail('evidence_round_incomplete');
  if(!b.proposals.some(q=>q.id===x.proposalId)||!['support','oppose','abstain'].includes(x.position)||!['high','medium','low'].includes(x.confidence)||!x.reason||!evidenceValid(r,x.evidenceRefs))return fail('invalid_vote');
  const p=core(r).find(p=>p.id===participantId),v={id:'vote-'+id+'-'+participantId,participantId,participantRole:p.role,proposalId:x.proposalId,position:x.position,confidence:x.confidence,reason:x.reason,evidenceRefs:clone(x.evidenceRefs),sourceHash:x.sourceHash,assignmentRevision:p.assignmentRevision,attemptId:a.completionAttemptId,hardConstraintConflicts:b.hardConstraintViolations.filter(h=>h.proposalId===x.proposalId).map(h=>h.constraintId)};
  const old=b.votes.find(v=>v.participantId===participantId);if(old)return JSON.stringify(old)===JSON.stringify(v)?{ok:true,reused:true}:fail('conflicting_vote');
  b.votes.push(freeze(v));b.phase='vote';say(r,'vote',x.position+' · '+b.proposals.find(q=>q.id===x.proposalId).title+' — '+x.reason,p);return {ok:true};
 }
 function decide(id,x){
  const r=run(id),why=gate(r,x);if(why)return fail(why);const b=r.brainstorm;
  if(b.votes.length!==b.attempts.length)return fail('votes_incomplete');
  if(b.attempts.some(a=>!current(r,a)||!b.votes.some(v=>v.participantId===a.participantId&&v.attemptId===a.completionAttemptId&&v.assignmentRevision===a.assignmentRevision)))return fail('stale_participant_result');
  const q=b.proposals.find(q=>q.id===x.selectedProposalId);if(!q||!x.reason||!Array.isArray(x.steps)||!x.steps.length)return fail('incomplete_synthesis');
  if(b.hardConstraintViolations.some(h=>h.proposalId===q.id))return fail('hard_constraint_disqualified');
  const seen=new Set();for(const s of x.steps){if(!object(s)||!s.id||seen.has(s.id)||!s.title||!s.text||!s.acceptance||!Array.isArray(s.dependsOn)||s.dependsOn.some(id=>!seen.has(id)))return fail('invalid_plan_steps');seen.add(s.id);}
  const d={selectedProposalId:q.id,reason:x.reason,steps:clone(x.steps)};
  if(b.decision)return JSON.stringify(b.decision)===JSON.stringify(d)?{ok:true,reused:true}:fail('conflicting_synthesis_decision');
  b.decision=freeze(d);b.dissent=freeze(b.votes.filter(v=>(v.proposalId!==q.id&&v.position==='support')||(v.proposalId===q.id&&v.position==='oppose')).map(v=>clone(v)));b.phase='synthesis';say(r,'response','Recommended: '+q.title+'. '+x.reason);return {ok:true};
 }
 function planPayload(r){
  const b=r.brainstorm,d=b.decision,q=b.proposals.find(q=>q.id===d.selectedProposalId),h=text=>({t:'heading',d:2,text}),p=text=>({t:'paragraph',text}),ul=items=>({t:'unordered_list',items});
  const blocks=[h('Objective'),p(b.input.objective),h('Decision'),p(q.title+' — '+d.reason),h('Constraints'),ul(b.input.constraints.map(c=>c.text)),h('Research and evidence'),...b.input.evidence.map(e=>p(e.label+' — '+(e.summary||e.provenance)+' [source: '+e.id+']')),h('Implementation'),...d.steps.map(s=>({t:'plan_step',plan_step_id:s.id,title:s.title,text:s.text,depends_on:s.dependsOn,parent_step_id:null,parallel_group_id:null})),h('Verification'),ul(d.steps.map(s=>s.acceptance)),h('Assumptions'),ul(q.assumptions),h('Risks and trade-offs'),ul([...q.risks,...q.costs]),h('Rollback'),ul(q.rollback),h('Alternatives considered'),...b.proposals.filter(p=>p.id!==q.id).map(o=>p(o.title+' — '+(b.hardConstraintViolations.filter(h=>h.proposalId===o.id).map(h=>'Disqualified: '+h.constraint).join('; ')||'Not selected: '+o.approach))),h('Dissent'),...(b.dissent.length?b.dissent.map(v=>p(v.participantRole+' ['+v.position+'; confidence '+v.confidence+']: '+v.reason+' · evidence: '+v.evidenceRefs.join(', '))):[p('No opposing position was recorded in this example.')]),h('Scope notes'),p(b.input.scopeNotes),h('Provenance'),p('Recorded BrainStorm example. Local evidence is frozen, not live external research; provider, persistence and native-runtime proof are outside this demonstration.')];
  const result={runId:r.id,threadId:r.threadId,sourceHash:b.input.sourceHash,title:q.title,blocks,steps:d.steps,sourceRefs:b.input.evidence.map(e=>({ref:'brainstorm-evidence:'+r.id+':'+e.id,kind:'recorded_evidence',summary:e.label})),ledgerEntries:[{k:'objective',v:b.input.objective},{k:'decision',v:q.title+' — '+d.reason},...b.input.constraints.map(c=>({k:'constraint',v:c.text})),...b.dissent.map(v=>({k:'dissent',v:v.participantRole+': '+v.reason}))]};
  return window.PM56_WONDERER?.augmentPlan(r,result)||result;
 }
 function synthesize(id){
  const r=run(id);if(!owns(id))return fail('brainstorm_input_unavailable');const b=r.brainstorm;
  if(b.synthesis)return {ok:true,reused:true,planId:b.synthesis.planId};
  const why=gate(r,{epoch:r.stopEpoch,sourceHash:b.input.sourceHash});if(why)return fail(why);
  if(b.phase!=='synthesis'||!b.decision)return fail('synthesis_not_ready');
  if(b.attempts.some(a=>!current(r,a)))return fail('stale_participant_result');
  if(b.hardConstraintViolations.some(h=>h.proposalId===b.decision.selectedProposalId))return fail('hard_constraint_disqualified');
  const wonderGate=window.PM56_WONDERER?.convergence(r);if(wonderGate&&!wonderGate.ok)return fail('wonderer_dispositions_incomplete');
  const result=P.createFromBrainstorm(planPayload(r));if(!result.ok)return result;
  const q=b.proposals.find(q=>q.id===b.decision.selectedProposalId);
  b.synthesis=freeze({planId:result.planId,selected:q.id,summary:b.decision.reason,dissentPreserved:b.dissent.length,sourceHash:b.input.sourceHash});
  b.phase='completed';r.status='completed';r.completedAt=new Date().toISOString();r.expectedOutputs.forEach(x=>{x.delivered=true;});r.artifacts.push({id:'plan:'+result.planId,kind:'assistant_plan',plan_id:result.planId,title:q.title});
  say(r,'response','Deep Plan ready. '+b.dissent.length+' dissenting position'+(b.dissent.length===1?'':'s')+' preserved. No build has started.');return result;
 }
 function tally(r){
  const b=r.brainstorm,valid=b.votes.filter(v=>{const a=b.attempts.find(a=>a.participantId===v.participantId);return a&&current(r,a)&&a.completionAttemptId===v.attemptId;}),selected=b.decision?.selectedProposalId;
  const byOption=b.proposals.map(q=>({proposalId:q.id,support:valid.filter(v=>v.proposalId===q.id&&v.position==='support').length,oppose:valid.filter(v=>v.proposalId===q.id&&v.position==='oppose').length,disqualified:b.hardConstraintViolations.some(h=>h.proposalId===q.id)}));
  const chosen=byOption.find(q=>q.proposalId===selected),support=chosen?.support||0,oppose=chosen?.oppose||0;
  return {support,oppose,abstain:valid.filter(v=>v.position==='abstain').length,other_option_support:valid.filter(v=>v.position==='support'&&v.proposalId!==selected).length,ineligible:b.votes.length-valid.length,denominator:valid.length,support_pct:selected&&valid.length?Math.round(100*support/valid.length):null,quorum:valid.length===b.attempts.length?'reached':'none',tie:false,selected_proposal_id:selected||null,by_option:byOption,decision_rule:'hard constraints and evidence; not majority rule'};
 }
 function renderActions(c,r,withPlayback=true){const b=r.brainstorm;return '<div class="bs-actions">'+(withPlayback?(window.PM56_BRAINSTORM_DEMOS?.controls(c,r)||''):'')+'<button class="text-button" data-action="brainstorm-open-results" data-run="'+c.esc(r.id)+'">'+c.icon('brain',12)+' See how they decided</button>'+(b.synthesis?'<button class="soft-button" data-action="brainstorm-open-plan" data-run="'+c.esc(r.id)+'">Open Plan</button>':'<button class="soft-button" data-action="collab-brainstorm-synthesize" data-run="'+c.esc(r.id)+'"'+(b.phase==='synthesis'&&r.status==='running'?'':' disabled')+'>Write the plan</button>')+'</div>';}
 function renderSummary(c,r){const b=r.brainstorm;return '<div class="bs-summary"><strong>'+c.esc(phaseLabel(r))+'</strong><span>'+b.proposals.length+' alternatives · '+b.votes.length+'/'+b.attempts.length+' votes</span></div>'+renderActions(c,r,false);}
 function markdown(r){const b=r.brainstorm;return ['# '+r.title,'',b.input.objective,'','## Alternatives',...b.proposals.map(q=>'### '+q.title+'\n'+q.approach+'\n'+q.originatingParticipantIds.length+' originating participants\n'+b.hardConstraintViolations.filter(h=>h.proposalId===q.id).map(h=>'Disqualified: '+h.constraint).join('\n')),'','## Debate',...b.debates.map(d=>'### Round '+d.round+'\n'+d.messages.map(m=>core(r).find(p=>p.id===m.participantId).role+': '+m.body).join('\n')),'','## Votes',...b.votes.map(v=>v.participantRole+' — '+v.position+' '+b.proposals.find(q=>q.id===v.proposalId).title+' ('+v.confidence+'): '+v.reason),'','## Decision',b.decision?.reason||'No final decision.','','## Preserved dissent',...b.dissent.map(v=>v.participantRole+': '+v.reason+' [evidence '+v.evidenceRefs.join(', ')+']'),'','## Source',b.input.sourceHash,'Recorded example; no live provider calls.'].join('\n');}
 /* The BrainStorm documents (brainstorm:{runId} and brainstorm-evidence:{runId}:{eid}) are rendered by
    brainstorm-view.js (STORM-B): PM56_BRAINSTORM.viewParts, decisionVM and renderDecision. markdown(r) stays here for
    its Plain text mode. */
 function openResults(c,id){if(!owns(id))return;c.closeMenu();c.closeDialog();c.state.editorRevealed=true;c.openEditor('brainstorm:'+id);}
 E.action('brainstorm-open-results',(c,b)=>{openResults(c,b.dataset.run);return true;});
 /* brainstorm-view (MUST-KEEP): brainstorm-view.js records the mode in its chain and falls through to this render */
 E.action('brainstorm-view',c=>{c.renderApp();return true;});
 E.action('brainstorm-open-evidence',(c,b)=>{if(!owns(b.dataset.run))return true;c.closeDialog();c.state.editorRevealed=true;c.openEditor('brainstorm-evidence:'+b.dataset.run+':'+b.dataset.evidence);return true;});
 E.action('brainstorm-open-plan',(c,b)=>{const id=run(b.dataset.run)?.brainstorm?.synthesis?.planId;if(id){c.closeDialog();P.openDetails(c,id);}return true;});
 E.chainAction('collab-brainstorm-synthesize',(c,b)=>{if(!owns(b.dataset.run))return false;const res=synthesize(b.dataset.run);if(!res.ok)c.toast('Synthesis not ready',res.error);else {c.closeDialog();P.openDetails(c,res.planId);}c.renderApp();return true;});
 E.chainAction('collab-brainstorm-next-round',(c,b)=>{if(!owns(b.dataset.run))return false;c.toast('Protocol advances on results','Recorded inputs must complete the current round.');return true;});
 E.chainAction('collab-open-configure',(c,b)=>{if(!owns(b.dataset.reconfigure))return false;const r=run(b.dataset.reconfigure);if(['running','paused'].includes(r.status)){c.toast('Configuration is frozen for this run','Cancel this run before starting with a different configuration.');return true;}C.openConfigure('brainstorm');const d=C.draft();d.brainstormInput=clone(r.brainstorm.input);d.name=r.title+' (new run)';
  /* the recording's rules come with it (review fix): the re-opened sheet shows the rules the new run will decide by */
  d.mustHaves=recordedRules(r.brainstorm.input).join('\n');if(C.markRecorded)C.markRecorded(d);c.openDialog({type:'collab-configure'});return true;});

 /* =====================================================================================================
    PRESENTATION (STORM-A; DESIGN-SPEC 8.0 KIND INTERFACE, 8.4 BrainStorm, 7 in-chat grammar, 5.5 moments).
    Pure readers of the draft and the protocol record: nothing here writes the run, the question budget or
    planPayload. sheetParts feeds COLLAB's sheet frame; cardParts feeds COLLAB's card frame (the shared
    waiting, paused, cancelled, limit and generic failed faces are COLLAB's, A3-04: a BrainStorm supplies only
    its nouns and allowed actions for those). The run view and BrainStormDecisionVM live in brainstorm-view.js.
    ===================================================================================================== */
 const S_=()=>window.PM56_SHELL,X_=()=>window.PM56_PMX,H=s=>S_().esc(String(s==null?'':s));
 const plural=(n,w)=>n+' '+w+(n===1?'':'s');
 const listWords=a=>a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
 const ink=(key,text)=>{const P=X_();return P&&P.ink?P.ink(key,text):H(text);};
 /* the seven chapters: short plate label, the card's stop label, the canonical name (hover), the plate part */
 const CHAPTERS=[['Understand','Understand the ask','Intake and frontier','questions'],['Draft alone','Draft ideas alone','Blind proposals','blind'],
  ['Line up','Line up the options','Normalize','team'],['Debate','Debate','Debate','rounds'],['Check facts','Check the facts','Evidence round','research'],
  ['Vote','Vote','Vote','team'],['Write the plan','Write the plan','Synthesis','you']];
 const PHASE_STOP={intake:1,blind_proposals:1,normalize:2,debate:3,evidence:4,vote:5,synthesis:6,completed:7};
 const SPEC_SEAT={wonderer:7,grillMe:8};
 const CONF_WORD={high:'very sure',medium:'fairly sure',low:'unsure'},CONF_N={high:3,medium:2,low:1};
 const WAIT_NOUN='the team hasn’t started drafting';

 /* ---- sheet: the plate (8.4 "Who's on the team"). Four modes, richest first, each at its natural height:
    full 216 (chapters, helpers named behind screens, the branches merging into one plan, You), compact 108
    (the diverge-converge plate a 4-helper sheet shows at 1440 x 900: chapters, marks behind screens, the
    branches merging, You), strip 64 (marks behind screens and You) and the caption. Built only from
    PM56_SHELL.pmxPlateParts, so the plate needs no kind CSS. ---- */
 function seatOf(d,row,i){const C2=window.PM56_COLLAB;return C2&&typeof C2.seatOf==='function'?C2.seatOf(d,row):(i%8)+1;}
 function fitLabel(text,px){text=String(text||'');const max=Math.max(4,Math.floor(px/6.6));return text.length>max?text.slice(0,max-1).replace(/\s+$/,'')+'…':text;}
 function modelShort(id){const ms=window.PM56_DATA&&window.PM56_DATA.models,arr=Array.isArray(ms)?ms:Object.values(ms||{}),m=arr.find(x=>x&&x.id===id);return String(m?m.name:(id||'')).replace(/^Claude /,'');}
 function chapterRow(P,y,pitch,x0){
  let s=P.line({key:'pmx-p-chapters',from:{x:x0,y},to:{x:x0+6*pitch,y},style:'fixed',part:'rounds'});
  CHAPTERS.forEach((c,i)=>{s+=P.chapter({key:'pmx-p-ch:'+i,x:x0+i*pitch,y,label:c[0],state:'next',part:c[3]+(i===0?' job':'')});});
  return s;
 }
 /* the branches merge into one stem (the kind mark's idea): each helper drops to one rail, the rail runs to You */
 function mergeRail(P,xs,top,railY,you){
  if(!xs.length)return '';
  let s='';xs.forEach((x,i)=>{s+=P.line({key:'pmx-p-drop:'+i,from:{x,y:top},to:{x,y:railY},style:'fixed',part:'team you'});});
  const x0=Math.min(...xs),x1=Math.max(...xs);
  if(x1>x0)s+=P.line({key:'pmx-p-rail',from:{x:x0,y:railY},to:{x:x1,y:railY},style:'fixed',part:'team you'});
  return s+P.line({key:'pmx-p-toyou',d:you,style:'toyou',part:'you'});
 }
 function plateFit(d){
  const S=S_(),P=S.pmxPlateParts,n=d.rows.length,specs=(d.wonderer?1:0)+(d.grillMe?1:0);
  const rules=String(d.mustHaves||'').trim()?1:0,C2=window.PM56_COLLAB,lean=!!(C2&&C2.isRecordedDraft&&C2.isRecordedDraft(d));
  const seats=d.rows.map((r,i)=>({r,seat:seatOf(d,r,i),role:String(r.persona||'Implementer')}));
  function spread(x0,x1,step){const span=n<2?0:Math.min(step,(x1-x0)/(n-1)),c=(x0+x1)/2;return seats.map((_,i)=>Math.round(c+(i-(n-1)/2)*span));}
  function full(){
   const H2=216,HY=86,RAIL=158;
   let s=chapterRow(P,12,77,50);
   const xs=spread(specs?80:70,specs?400:500,118),lab=n<2?120:Math.max(58,Math.min(118,(xs[1]-xs[0]))-14);
   for(let i=0;i<n-1;i++)s+=P.screen({key:'pmx-p-scr:'+i,x:(xs[i]+xs[i+1])/2,y:HY,h:28,part:'blind'});
   seats.forEach((o,i)=>{s+=P.seat({key:'pmx-p-seat:bs:'+o.r.rowId,x:xs[i],y:HY,role:o.role,seat:o.seat,label:H(fitLabel(o.r.role||'Helper',lab)),sub:H(fitLabel(modelShort(o.r.requestedModelId),lab)),part:'team blind'});});
   if(d.wonderer)s+=P.seat({key:'pmx-p-seat:bs:wonderer',x:506,y:HY,role:'wonderer',seat:SPEC_SEAT.wonderer,label:'Wonderer',sub:'doesn’t vote',part:'wonderer specialists'});
   const cx=Math.round((xs[0]+xs[n-1])/2);
   s+=mergeRail(P,xs,HY+60,RAIL,'M'+cx+' '+RAIL+' V'+(RAIL+14));
   if(rules)s+=P.glyph('lock',cx+8,RAIL+2,11).replace('<g ','<g data-pmx-part="rules" ');
   s+=P.you({x:cx,y:RAIL+28,label:'You',sub:'get one plan'});
   if(d.grillMe)s+=P.seat({key:'pmx-p-seat:bs:grill',x:506,y:RAIL+22,role:'grill',seat:SPEC_SEAT.grillMe,label:'Grill Me',part:'grill questions specialists'});
   return S.pmxPlate({key:'pmx-plate-bs:full',kind:'brainstorm',mode:'full',w:576,h:H2,fitH:H2,svg:s});
  }
  /* lean (review fix): a guided demo's sheet carries the guide strip, which leaves the slot 94 px at 1440 x 900; the
     compact plate is then drawn 16 px shorter (the chapters' labels 8 px above the screens' glyphs, shorter screens),
     so the chapters and the merge into one plan still show where first-time users meet the sheet */
  function compact(){
   const H2=lean?92:108,HY=lean?57:68,RAIL=lean?84:99,YY=lean?HY-3:HY,end=specs?372:452;
   let s=chapterRow(P,lean?9:10,77,50);
   const xs=spread(60,end,96);
   for(let i=0;i<n-1;i++)s+=P.screen({key:'pmx-p-scr:'+i,x:(xs[i]+xs[i+1])/2,y:lean?HY+5:HY,h:lean?12:22,part:'blind'});
   seats.forEach((o,i)=>{s+=P.seat({key:'pmx-p-seat:bs:'+o.r.rowId,x:xs[i],y:HY,role:o.role,seat:o.seat,part:'team blind'});});
   if(d.wonderer)s+=P.seat({key:'pmx-p-seat:bs:wonderer',x:d.grillMe?404:430,y:HY,role:'wonderer',seat:SPEC_SEAT.wonderer,part:'wonderer specialists'});
   if(d.grillMe)s+=P.seat({key:'pmx-p-seat:bs:grill',x:d.wonderer?448:430,y:HY,role:'grill',seat:SPEC_SEAT.grillMe,part:'grill questions specialists'});
   s+=mergeRail(P,xs,HY+16,RAIL,'M'+xs[n-1]+' '+RAIL+' H552 V'+(YY+13));
   if(rules)s+=P.glyph('lock',xs[n-1]+(lean?18:12),RAIL-13,11).replace('<g ','<g data-pmx-part="rules" ');
   s+=P.you({x:552,y:YY,anchor:'end',label:'You',sub:'one plan'});
   return S.pmxPlate({key:'pmx-plate-bs:compact',kind:'brainstorm',mode:'compact',w:576,h:H2,fitH:H2,svg:s});
  }
  function strip(){
   const H2=64,Y=30,end=(specs?360:440);
   const xs=seats.map((_,i)=>Math.round(44+i*(n<2?0:Math.min(96,(end-44)/(n-1)))));
   let s='';
   for(let i=0;i<n-1;i++)s+=P.screen({key:'pmx-p-scr:'+i,x:(xs[i]+xs[i+1])/2,y:Y,h:22,part:'blind'});
   seats.forEach((o,i)=>{s+=P.seat({key:'pmx-p-seat:bs:'+o.r.rowId,x:xs[i],y:Y,role:o.role,seat:o.seat,part:'team blind job'});});
   if(d.wonderer)s+=P.seat({key:'pmx-p-seat:bs:wonderer',x:d.grillMe?404:430,y:Y,role:'wonderer',seat:SPEC_SEAT.wonderer,part:'wonderer specialists'});
   if(d.grillMe)s+=P.seat({key:'pmx-p-seat:bs:grill',x:d.wonderer?448:430,y:Y,role:'grill',seat:SPEC_SEAT.grillMe,part:'grill questions specialists'});
   s+=P.you({x:552,y:Y,anchor:'end',label:'You',sub:'one plan'});
   return S.pmxPlate({key:'pmx-plate-bs:strip',kind:'brainstorm',mode:'strip',w:576,h:H2,fitH:H2,svg:s});
  }
  const caption=plural(n,'helper')+' draft alone, debate, check the facts and vote. You get one plan.';
  const plates=n<=4?[full(),compact(),strip()]:n<=6?[compact(),strip()]:[];
  return S.pmxPlateFit({key:'pmx-plate-fit:bs',affects:'team',plates,caption:'<span data-pmx-part="team job">'+H(caption)+'</span>'});
 }

 /* ---- sheet: the question budget (8.4 "Questions for you"). The exact .collab-qmax node stays for the
    harnesses and is marked harness-only (IMPACT A2-19); the visible value, a 20-tick meter (25 ghost ticks
    under Grill Me) and a sibling helper say it in words. Layout classes are COLLAB's frame (pmx-collab-*). ---- */
 function qmaxBlock(d,lean){
  const base=d.config.questionLimit||20,ext=d.config.grillExtension||25;
  const text=d.grillMe?'Maximum questions: '+(base+ext)+' ('+base+' + Grill Me '+ext+')':'Maximum questions: '+base;
  let ticks='';for(let i=0;i<base;i++)ticks+='<i data-on="1"></i>';if(d.grillMe)for(let j=0;j<ext;j++)ticks+='<i data-on="0"></i>';
  return '<div class="pmx-collab-qmax" data-pmx-affects="questions grill">'+
   '<span class="pmx-ctl-label" data-hover-key="collab-qmax-help" data-hover-tip="The most questions the team may ask you, shared by everyone. It’s a limit, not a target: most runs ask far fewer, and anything research can settle doesn’t count.">Questions for you</span>'+
   '<span class="pmx-collab-qval">'+(d.grillMe?'Up to '+(base+ext)+' · '+base+' + Grill Me '+ext:'Up to '+base)+'</span>'+
   '<p class="collab-qmax" data-k="collab-qmax" data-pmx-harness>'+H(text)+'</p>'+
   '<span class="pmx-collab-meter" aria-hidden="true">'+ticks+'</span>'+
   /* the visible helper only while the side column has the line (no specialist rows; retro and short windows drop it) */
   (d.wonderer||d.grillMe||lean?'':'<p class="pmx-help pmx-bs-qhelp">Shared by everyone. A limit, not a target.</p>')+'</div>';
 }
 /* must-haves: the user field draft.mustHaves (IMPACT A1-01), one rule per line, in the hero's aside (8.0).
    Review fixes (J-2, honesty): the field grows with its rules from one line to two (field-sizing, inside a box that
    carries the border, so a third line scrolls inside the field and never shows half cut through its glyphs); a
    recorded example decides by the recording's own rules, so its sheet shows them read-only: the first rule on one
    line (every rule in its hover card) and "This recording uses its own 2 rules." */
 const ruleList=s=>String(s||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
 function mustHavesBlock(d,recorded){
  const label='<span class="pmx-ctl-label" data-hover-key="collab-must" data-hover-tip="Anything non-negotiable? One rule per line. Rules beat votes.">Must-haves</span>';
  if(recorded){
   const rules=ruleList(d.mustHaves);
   return '<div class="pmx-collab-must pmx-bs-must" data-pmx-affects="rules" data-recorded="1">'+label+
    '<span class="pmx-bs-mrule"'+(rules.length?' data-hover-key="bs-must-rules" data-hover-tip="'+H(rules.join('\n'))+'"':'')+'>'+(rules.length?H(rules[0]):'None')+'</span>'+
    '<span class="pmx-bs-mnote">'+(rules.length?'This recording uses its own '+(rules.length===1?'rule':plural(rules.length,'rule'))+'.':'This recording has no rules of its own.')+'</span></div>';
  }
  const lines=Math.max(1,Math.min(2,String(d.mustHaves||'').split('\n').length));
  return '<label class="pmx-collab-must pmx-bs-must" data-pmx-affects="rules">'+label+
   '<span class="pmx-bs-mbox"><textarea rows="'+lines+'" data-collab-input="mustHaves" aria-label="Must-haves, optional" placeholder="e.g. No uploads">'+H(d.mustHaves||'')+'</textarea></span></label>';
 }
 function sheetParts(d,ctx,gen){
  if(!d||d.kind!=='brainstorm')return null;
  const S=S_(),C2=window.PM56_COLLAB,n=d.rows.length,cfg=d.config;
  const choices=C2&&C2.choices?C2.choices():{},rsOpts=(choices.externalResearch||{}).options||[];
  const rs=rsOpts.find(o=>o.value===cfg.externalResearch)||rsOpts[0]||{label:'Extensive research',read:'thoroughly'};
  const dr=Math.max(1,Math.min(4,cfg.debateRounds||2));
  const recorded=C2&&C2.isRecordedDraft?C2.isRecordedDraft(d):false;
  const rangeBad=n<2||n>8,needsJob=!String(d.purpose||'').trim();
  const research=S.pickerButton({action:'collab-pick-choice',anchor:'collab-choice-externalResearch',strong:H(rs.label),extra:'data-field="externalResearch" data-menu-title="Research depth"'});
  const out={
   title:'Set up a BrainStorm',
   lead:'Several AIs each draft a plan without peeking at the others. They debate, check the facts and vote, and you get one plan you can build.',
   hero:{n:1,title:'What should the team decide?',helper:'This becomes the plan’s goal. Everyone reads it.',placeholder:'e.g. How should search stay fast without uploading anything?',aside:mustHavesBlock(d,recorded)},
   whoTitle:'Who’s on the team',whoMeta:'<span data-k="cnt:'+n+'">'+plural(n,'helper')+'</span> · 2 to 8',
   rosterCols:[{label:'Job',helper:'What it looks at',hover:'What this helper looks at. The role name is the job; everyone also reads the question above.'},{label:'AI model',helper:'Which AI, which account pays'},{label:'Persona',helper:'How it works (builds, checks…)'}],
   plate:plateFit(d),
   howTitle:'How should they decide?',
   howHtml:S.pmxCtl({key:'ctl-debate',label:'<span data-hover-key="collab-debate" data-hover-tip="Each round, every helper challenges the others’ ideas.">Rounds of debate</span>',helper:'2 rounds is usually enough.',affects:'rounds',
     control:S.pmxStepper({key:'step-debate',input:{key:'cfg-debateRounds',attrs:'data-collab-input="cfg-debateRounds"'},value:dr,min:1,max:4,unit:'rounds',affects:'rounds'})})+
    S.pmxCtl({key:'ctl-research',label:'<span data-hover-key="collab-research" data-hover-tip="How much outside checking happens before deciding. More is slower and costs more.">Research depth</span>',affects:'research',control:research})+
    qmaxBlock(d,recorded),
   /* a recorded example's sheet carries the guide strip above it, so its side column is 35 px shorter: the
      question budget's helper and the dissent promise drop there (J-2: drop, never compress; measured 1440 x 900,
      the side column needed 507 of 459 px); the rule promise stays, it is what the constraint example shows */
   promises:[{key:'pr-built',glyph:'not',strong:'Nothing gets built.',text:'You get one plan to review first.',part:'you'},
    recorded?null:{key:'pr-dissent',glyph:'check',text:'Disagreements are kept word for word in the plan.',part:'team'},
    {key:'pr-rules',glyph:'lock',strong:'Rules beat votes:',text:'breaking a must-have rules an option out.',part:'rules'}].filter(Boolean),
   readback:[{part:'team',html:'<b>'+ink('rb:bs:n',plural(n,'helper'))+'</b> each draft a plan alone, '},
    {part:'rounds',html:'debate for <b>'+ink('rb:bs:r',plural(dr,'round'))+'</b>, '},
    {part:'research',html:'check the facts <b>'+ink('rb:bs:rs',rs.read||'thoroughly')+'</b>, then vote. You get <b>one plan</b>.'}],
   estimate:recorded?{recorded:true}:{text:'About 10–40 min plus your answers · stops at $'+Number(cfg.costLimitUsd||14).toFixed(2)+' · an estimate, not a promise'},
   primaryDisabled:rangeBad||needsJob,
   primaryReason:rangeBad?'BrainStorm needs 2 to 8 helpers.':needsJob?'Add a question first.':''
  };
  /* Advanced: COLLAB's shared rows, the kind rows and Technical details (A1-53). The Voting option's label is
     already a sentence (IMPACT A1-25), so its row must not add a second full stop. */
  if(gen&&gen.advanced)out.advanced={summary:'Stops after '+(cfg.timeLimitMinutes||90)+' min or $'+Number(cfg.costLimitUsd||14).toFixed(2)+' · dissent kept',rows:String(gen.advanced.rows||'').replace('A rule always wins..','A rule always wins.')};
  /* reconfigure / scheduled modes keep COLLAB's titles and primary */
  if(gen&&(d.reconfigureRunId||d.scheduleIntent)){out.title=gen.title;out.lead=gen.lead;}
  /* any other reason COLLAB blocks Start for (owner answer E-03 B: an offline chosen model blocks Start until it
     is replaced) is kept: BrainStorm only adds its own range and question reasons */
  if(!out.primaryDisabled&&gen&&gen.primaryDisabled&&gen.primaryReason){out.primaryDisabled=true;out.primaryReason=gen.primaryReason;}
  return out;
 }

 /* ---- card (8.4 "In chat", 7.1-7.5): data for COLLAB's card frame. Blind proposals as sealed notes, the
    options they boil down to, the debate as lanes, votes staged as people standing under options (the
    Wonderer abstains in the wing), a rule-broken option struck with its rule, preserved dissent as a
    pull-quote on the one-Plan result face. Every action carries data-run (G-19). Reads the protocol record
    only; runs without a protocol owner (seeds, wand-started) keep COLLAB's generic parts (null here). ---- */
 function seatP(r,p){if(p.additiveRoleKind==='wonderer')return SPEC_SEAT.wonderer;if(p.additiveRoleKind==='grill_me')return SPEC_SEAT.grillMe;const i=core(r).indexOf(p);return i<0?1:(i%8)+1;}
 function roleP(p){return p.additiveRoleKind==='wonderer'?'wonderer':p.additiveRoleKind==='grill_me'?'grill':String(p.effectivePersona||p.requestedPersona||'Implementer');}
 function markP(r,p,size,state){return S_().pmxMark({role:roleP(p),seat:seatP(r,p),size,state,standin:!!(p.effectiveModelId&&p.requestedModelId&&p.effectiveModelId!==p.requestedModelId)});}
 function wondererP(r){return r.participants.find(p=>p.additiveRoleKind==='wonderer'&&p.status!=='disabled')||null;}
 function stopOf(r){const b=r.brainstorm;return b.synthesis?7:(PHASE_STOP[b.phase]!=null?PHASE_STOP[b.phase]:1);}
 function ruleWords(t){t=String(t||'').replace(/\.\s*$/,'');return t.charAt(0).toLowerCase()+t.slice(1);}
 function trackOf(r,now){
  const at=stopOf(r),done=at>=7;
  return {key:'bs-track:'+r.id,stops:CHAPTERS.map((c,i)=>({key:'pmx-stop:'+r.id+':'+i,
    label:'<span data-hover-key="bs-stop:'+i+'" data-hover-tip="'+H(c[1])+' ('+H(c[2])+' in the product)">'+H(c[0])+'</span>',state:done||i<at?'done':i===at?'now':'next'})),
   nowText:'<b>'+H(CHAPTERS[Math.min(at,6)][1])+'</b> · '+(now?now+' · ':'')+'step '+Math.min(at+1,7)+' of 7'};
 }
 function budgetOf(r){const k=r.brainstorm.questionBank&&r.brainstorm.questionBank.budgetKey,O=P&&P.budgetOwner;try{return k&&O?O.projection(k):null;}catch(e){return null;}}
 /* blind proposals: one sealed note per helper, face down once it is in (never its text: BS-05) */
 function notesBoard(r){
  const b=r.brainstorm;
  return '<div class="pmx-bs-notes" data-k="bs-notes:'+H(r.id)+'" style="--n:'+b.attempts.length+'">'+b.attempts.map(a=>{
   const p=r.participants.find(x=>x.id===a.participantId)||{},inn=a.status==='completed';
   return '<div class="pmx-bs-note" data-k="bs-note:'+H(r.id)+':'+H(a.participantId)+'" data-pid="'+H(a.participantId)+'" data-state="'+(inn?'sealed':'writing')+'">'+
    markP(r,p,18,inn?'done':'working')+'<b class="pmx-bs-note-name">'+H(p.role||'Helper')+'</b>'+
    '<span class="pmx-bs-note-state">'+(inn?S_().pmxSealed(1)+'sealed':'writing')+'</span></div>';}).join('')+'</div>';
 }
 /* line up: each option with the marks of the helpers whose ideas it merged (every original idea is kept) */
 /* whose rules decide (review fix, honesty; STORM-B's decisionVM labels them the same way): a recorded example
    decides by the recording's own rules, a run of the user's own by the must-haves they typed */
 function ruleOwner(r){const C2=window.PM56_COLLAB;return !C2||!C2.provenance||C2.provenance(r.id)==='recorded'?'the recording’s rule':'your rule';}
 /* the ruled-out line (a two-line clamp): the fixed part first, so a long rule only ever cuts the quoted rule */
 function ruledLine(r,q,hard){
  const plain=q.title+' is ruled out: it breaks '+ruleOwner(r)+' “'+ruleWords(hard.constraint)+'”. Votes can’t override a rule.';
  return '<p class="pmx-ruled collab-hardconflict" data-k="bs-ruled:'+H(r.id)+':'+H(q.id)+'" data-hover-key="bs-ruled:'+H(r.id)+':'+H(q.id)+'" data-hover-tip="'+H(plain)+'">'+S_().pmxGlyph('not',14)+'<span>Votes can’t override a rule: <s>'+H(q.title)+'</s> breaks '+ruleOwner(r)+' “'+H(ruleWords(hard.constraint))+'”.</span></p>';
 }
 function optionsBoard(r){
  const b=r.brainstorm,hard=id=>b.hardConstraintViolations.find(h=>h.proposalId===id);
  const ruled=b.proposals.filter(q=>hard(q.id)).map(q=>ruledLine(r,q,hard(q.id))).join('');
  return '<div class="pmx-bs-opts" data-k="bs-opts:'+H(r.id)+'">'+b.proposals.map(q=>'<div class="pmx-bs-opt" data-k="bs-opt:'+H(r.id)+':'+H(q.id)+'"'+(hard(q.id)?' data-state="ruled"':'')+'>'+
   '<span class="pmx-bs-opt-marks">'+q.originatingParticipantIds.map(pid=>{const p=r.participants.find(x=>x.id===pid)||{};return '<span class="pmx-bs-from" data-pid="'+H(pid)+'">'+markP(r,p,18,'done')+'</span>';}).join('')+'</span>'+
   '<b class="pmx-bs-opt-title">'+(hard(q.id)?'<s>'+H(q.title)+'</s>':H(q.title))+'</b><span class="pmx-bs-opt-from">'+H(plural(q.originatingParticipantIds.length,'idea'))+'</span></div>').join('')+'</div>'+ruled;
 }
 /* the vote staged as positions: backers stand under their option, the undecided in the aisle, the Wonderer (and any
    abstaining helper) in the wing. Review fixes (J-2: never cut a name to letters): the marks stand alone and the
    backers' names are printed once as a wrapping line under their column; option titles wrap to two lines; a column's
    width follows its backers; the aisle and the wing are drawn only while someone stands there; a rule-broken option
    keeps its title struck and says "ruled out" in its count (the board's own opacity rule is not used: the names
    under a ruled option stay readable). The layout is kind-scoped CSS over pmxVoteBoard (FOUNDATION REQUEST). */
 function voteBoard(r,o){
  o=o||{};
  const b=r.brainstorm,S=S_(),cs=core(r),voted=new Map(b.votes.map(v=>[v.participantId,v])),all=b.votes.length===b.attempts.length;
  const opts=b.proposals.map(q=>{
   const sup=b.votes.filter(v=>v.proposalId===q.id&&v.position==='support'),opp=b.votes.filter(v=>v.proposalId===q.id&&v.position==='oppose');
   const hard=b.hardConstraintViolations.find(h=>h.proposalId===q.id);
   /* a ruled option's votes don't count, so its count never says "so far" (one line in retro's monospace at 391) */
   const n=!b.votes.length?'no votes yet':sup.length+'\u00a0for'+(opp.length?' · '+opp.length+'\u00a0against':'')+(all||hard?'':' so\u00a0far');
   const names=sup.map(v=>{const p=cs.find(x=>x.id===v.participantId)||{};return '<span class="pmx-bs-vn">'+H(p.role||'Helper')+'</span>';}).join(', ');
   return {key:'pmx-vote:'+r.id+':'+q.id,sup:sup.length,ruled:!!hard,plain:q.title,
    title:hard?'<s>'+H(q.title)+'</s>':H(q.title),
    count:'<span class="pmx-bs-vc">'+(hard?'ruled out · ':'')+H(n)+'</span>'+(names?'<span class="pmx-bs-vnames">'+names+'</span>':''),
    ruledOut:false,
    backers:sup.map(v=>{const p=cs.find(x=>x.id===v.participantId)||{};return {key:'pmx-voter:'+r.id+':'+v.participantId,markHtml:'<span class="pmx-bs-vmark" data-hover-key="bs-voter:'+H(r.id)+':'+H(v.participantId)+'" data-hover-tip="'+H((p.role||'Helper')+' · '+(CONF_WORD[v.confidence]||'unsure'))+'">'+markP(r,p,22,'done')+'</span>',conf:CONF_N[v.confidence]||2,name:''};}),
    hard};
  });
  /* the aisle holds one standing voter, a mark only (the sentence above names everyone still deciding, and the mark's
     hover card names it: a role like "Implementation" never fits a narrow aisle whole); any others are counted */
  const und=cs.filter(p=>!voted.has(p.id));
  const deciding=und.slice(0,1).map(p=>'<span class="pmx-voter" data-k="pmx-voter:'+H(r.id)+':'+H(p.id)+'"><span class="pmx-bs-vmark" data-hover-key="bs-voter:'+H(r.id)+':'+H(p.id)+'" data-hover-tip="'+H((p.role||'Helper')+' · still deciding')+'">'+markP(r,p,22,'working')+'</span>'+(und.length>1?'<span class="pmx-bs-more">+'+(und.length-1)+'</span>':'')+'</span>').join('');
  const w=wondererP(r),abst=cs.filter(p=>voted.get(p.id)&&voted.get(p.id).position==='abstain');
  const standIn=(p,label)=>'<span class="pmx-voter" data-k="pmx-voter:'+H(r.id)+':'+H(p.id)+'">'+markP(r,p,22,'abstained')+'<span>'+H(label)+'</span></span>';
  /* the Wonderer never votes (8.4 "doesn't vote"); a core helper that abstains did */
  const wing=(w?'<p class="pmx-bs-wlab">Doesn’t vote</p>'+standIn(w,'Wonderer'):'')+(abst.length?'<p class="pmx-bs-wlab">Abstained</p>'+abst.map(p=>standIn(p,p.role||'Helper')).join(''):'');
  /* column widths (measured at 391 in basic and retro): with two options (the common case) both keep an equal share,
     which holds each title on one line and gives three backers the 90 px their marks need; with three or more options
     a column grows with its backers */
  const cols=opts.map(x=>opts.length===2?'minmax(96px,1fr)':'minmax(0,'+(4+Math.min(4,x.sup))+'fr)');
  const grid=(opts.length===2?[cols[0],und.length?'64px':null,cols[1]]:cols.concat(und.length?['64px']:[])).concat(wing?['76px']:[]).filter(Boolean).join(' ');
  /* 7.2 S tier (< 360 px): the staged board would stack and break the card budget, so there the card shows one counted
     line; a ruled option stays in it, struck ("ruled out"), so a one-vote pick never looks unexplained */
  const tally='<p class="pmx-bs-tally" data-k="bs-tally:'+H(r.id)+'">'+opts.map(x=>'<span class="pmx-bs-ti"><b>'+(x.ruled?'<s>'+H(x.plain)+'</s>':H(x.plain))+'</b> <span class="pmx-bs-tc">'+(x.ruled?'ruled out':H(!b.votes.length?'no votes yet':x.sup+'\u00a0for'))+'</span></span>').join('<span class="pmx-sep"> · </span>')+(und.length?'<span class="pmx-sep"> · </span><span class="pmx-bs-tc">'+und.length+'\u00a0deciding</span>':'')+'</p>';
  const ruled=o.ruledLine===false?'':opts.filter(x=>x.hard).map(x=>ruledLine(r,{id:x.key.split(':').pop(),title:x.plain},x.hard)).join('');
  return '<div class="pmx-bs-board" data-k="bs-board:'+H(r.id)+'" data-aisle="'+(und.length?1:0)+'" data-wing="'+(wing?1:0)+'" style="--pmx-bs-vote-cols:'+grid+'">'+
   S.pmxVoteBoard({key:'votes:'+r.id,options:opts,deciding,abstained:wing||'',ruledCls:'collab-hardconflict'})+'</div>'+tally+ruled;
 }
 function debateLanes(r){
  const b=r.brainstorm,S=S_(),d=b.debates[b.debates.length-1];if(!d)return null;
  const who=m=>core(r).find(p=>p.id===m.participantId)||{},ms=d.messages,last=ms[ms.length-1],prev=ms[ms.length-2];
  const ra='data-run="'+H(r.id)+'"';
  const lane=(m,kind)=>{const p=who(m),quote=kind==='quote';
   /* R-29: the folded previous turn uses the idle (muted) verb, never the done colour */
   return {key:'pmx-lane:'+r.id+':'+p.id,state:quote?'working':'idle',action:'collab-open-participant',attrs:ra+' data-participant="'+H(p.id)+'"',
    mark:markP(r,p,22,quote?'working':'idle'),name:H(p.role),verb:quote?'answered':'spoke first',verbKey:'vb:'+r.id+':'+p.id+':'+d.round+':'+(quote?'a':'f'),
    line2:quote?'“'+H(m.body)+'”':'round '+d.round+' · '+H(String(m.body).split(/(?<=[.!?])\s/)[0]),line2Kind:quote?'quote':'detail',
    keep:quote,keepKey:'l2:'+r.id+':'+p.id+':quote:'+H(r.id+'-r'+d.round+'-'+ms.indexOf(m))};};
  return S.pmxLanes({key:'lanes:'+r.id,runId:r.id,kind:'brainstorm',lanesHtml:[last&&lane(last,'quote'),prev&&lane(prev,'detail')].filter(Boolean).map(l=>S.pmxLane(l)).join(''),more:null});
 }
 function dissentQuote(r){
  const b=r.brainstorm,v=b.dissent[0];if(!v)return '';
  /* the card clamps the quote (3 lines, 2 at the S tier): where a quote this long is clamped, its caption says where
     the whole of it is instead of "kept word for word" (review fix; the lengths are 2 and 3 lines of retro's monospace) */
  const len=String(v.reason||'').length,long=len>130?'m':len>70?'s':'';
  return S_().pmxQuote({key:'bs-dissent:'+r.id,cls:'collab-dissent',attrs:long?' data-bs-long="'+long+'"':'',text:H(v.reason),who:H(v.participantRole),
   note:H(CONF_WORD[v.confidence]||'unsure')+' · <span class="pmx-bs-qkeep">kept word for word</span><span class="pmx-bs-qfull">full text in the panel</span>'});
 }
 function cardParts(id,ctx,face){
  const r=typeof id==='string'?run(id):id;if(!r||r.kind!=='brainstorm'||!r.brainstorm||!r.brainstorm.protocolVersion)return null;
  const b=r.brainstorm,S=S_(),ra='data-run="'+H(r.id)+'"',cs=core(r),n=b.attempts.length,C2=window.PM56_COLLAB;
  const rec=C2&&C2.provenance?C2.provenance(r.id)==='recorded':true,X=X_(),viewOpen=!!(X&&X.viewOpen&&X.viewOpen(r.id));
  const inn=b.attempts.filter(a=>a.status==='completed').length,voted=b.votes.length,phase=b.phase;
  const q=b.decision&&b.proposals.find(x=>x.id===b.decision.selectedProposalId);
  const progress={intake:'while drafting',blind_proposals:'while drafting',normalize:'while lining up the options',debate:'while debating',evidence:'while checking the facts',vote:'while voting',synthesis:'before writing the plan',completed:''}[phase]||'';
  const w=wondererP(r),gate=window.PM56_WONDERER&&window.PM56_WONDERER.convergence?window.PM56_WONDERER.convergence(r):null,blocked=!!(gate&&!gate.ok);
  const budget=budgetOf(r);
  const qline=budget?(budget.exhausted?'The team has asked all the questions it’s allowed. It will decide the rest from research and your earlier answers.':(budget.questions_asked?budget.questions_asked+' asked · '+budget.questions_remaining+' left (shared)':'No questions yet · up to '+budget.effective_limit+' (shared)')):'';
  const reused=(b.input.answers||[]).length;
  const cluster=cs.map(p=>{const a=b.attempts.find(x=>x.participantId===p.id)||{},v=b.votes.find(x=>x.participantId===p.id);
    const st=b.synthesis?'done':phase==='vote'||phase==='evidence'||phase==='synthesis'?(v?'done':'working'):a.status==='completed'&&(phase==='intake'||phase==='blind_proposals')?'done':'working';
    return {role:roleP(p),seat:seatP(r,p),name:p.role,state:r.status==='running'||b.synthesis?st:'idle',standin:!!(p.effectiveModelId&&p.effectiveModelId!==p.requestedModelId)};})
   .concat(w?[{role:'wonderer',seat:SPEC_SEAT.wonderer,name:'Wonderer',state:'abstained'}]:[]);
  const openA={action:'brainstorm-open-results',attrs:ra,label:'Open Panel',core:true};
  const clusterHtml=cluster.map(c=>({html:S.pmxMark({role:c.role,seat:c.seat,size:18,state:c.state,standin:c.standin}),mini:S.pmxMark({role:c.role,seat:c.seat,size:12})}));
  const base={kindWord:'BrainStorm',owned:true,openAction:'brainstorm-open-results',cluster:clusterHtml,
   nouns:{waiting:WAIT_NOUN,progress,cancelExtra:progress},allowedActions:[],clusterRoles:cluster,
   technical:{command:'cmd.collaboration.open',text:'Open Panel sends cmd.collaboration.open {target: run_view}.'}};
  /* the one Plan (BS-10): the card stays and says what was picked; the Plan card is born beneath it (plans.js) */
  if(b.synthesis){
   const plan=P&&P.get?P.get(b.synthesis.planId):null,ver=plan&&plan.version?'Plan V'+plan.version:'Plan ready';
   const backed=b.votes.filter(v=>v.proposalId===q.id&&v.position==='support').length;
   const ruled=b.hardConstraintViolations.filter((h,i,a)=>a.findIndex(x=>x.proposalId===h.proposalId)===i);
   /* the figures line is one line at 391 in retro (about 50 characters): the rule is named only when the whole line
      stays that short, else "1 ruled out" (review fix; the rule is in the struck board and the run view) */
   const head=[backed+' of '+n+' backed it',b.dissent.length?b.dissent.length+' still disagree'+(b.dissent.length===1?'s':''):'no one disagrees'].join(' · ');
   const rw=ruled.length?ruleWords(ruled[0].constraint):'',long=ruled.length&&(head+' · 1 option ruled out (broke ‘'+rw+'’)').length<=50;
   const sub=[head,ruled.length?(long?plural(ruled.length,'option')+' ruled out (broke ‘'+H(rw)+'’)':ruled.length+' ruled out'):''].filter(Boolean).join(' · ');
   return Object.assign(base,{density:'result',track:trackOf(r,''),
    result:{key:'bs-result:'+r.id,glyph:'check',headline:'Picked: '+H(q.title),sub,boardHtml:dissentQuote(r)},
    receipt:{headline:'Picked: '+H(q.title),glyph:'check',recorded:rec,time:ver,cost:''},
    meta:{recorded:rec,parts:[ver+' · nothing has been built yet']},
    /* S tier (review fix): the next step is the Plan, so Open Plan is a core action and stays on the one row */
    actions:[{action:'brainstorm-open-plan',attrs:ra,label:'Open Plan',primary:true,core:true},openA],
    technical:{command:'cmd.nav.open_subject',text:'Open Plan sends cmd.nav.open_subject. Open Panel sends cmd.collaboration.open {target: run_view}.'}});
  }
  const running=r.status==='running';
  let sentence,board='',lanes='',decision=null,now='',density='live',tone='',followOns=[];
  const straggle=cs.filter(p=>{const a=b.attempts.find(x=>x.participantId===p.id);return a&&a.status!=='completed';}).map(p=>p.role);
  if(phase==='intake'||phase==='blind_proposals'){
   now=inn+' of '+n+' in';board=notesBoard(r);
   sentence=!inn?{status:'starting',word:'Starting',reason:'Everyone drafts an idea alone. '+(reused?plural(reused,'earlier answer')+' reused, so nobody asks again.':'Nobody sees the others’ ideas.')}
    :{status:'running',word:'Running',reason:inn+' of '+n+' ideas are in. '+H(listWords(straggle))+(straggle.length===1?' is':' are')+' still writing. Nobody sees the others’ ideas yet.'};
   if(!inn)density='starting';
  }else if(phase==='normalize'){
   board=optionsBoard(r);now=plural(b.proposals.length,'option');
   sentence={status:'running',word:'Running',reason:n+' ideas boiled down to '+plural(b.proposals.length,'option')+'. Every original idea is kept.'};
  }else if(phase==='debate'){
   const d=b.debates[b.debates.length-1],R=r.config.debateRounds||b.debates.length,ms=d.messages;
   const a=core(r).find(p=>p.id===ms[ms.length-1].participantId),z=core(r).find(p=>p.id===(ms[ms.length-2]||{}).participantId);
   now='round '+d.round+' of '+R;lanes=debateLanes(r);
   sentence={status:'running',word:'Debating',reason:'round '+d.round+' of '+R+'. '+H(a?a.role:'A helper')+(z?' answered '+H(z.role):' spoke')+'. Next: '+(d.round<R?'round '+(d.round+1)+'.':'the fact check.')};
  }else if(phase==='evidence'){
   const ruled=[...new Set(b.hardConstraintViolations.map(h=>h.proposalId))].length;
   board=optionsBoard(r);now='all '+plural(b.proposals.length,'option');
   sentence={status:'running',word:'Running',reason:'Facts checked for all '+plural(b.proposals.length,'option')+'. '+(ruled?plural(ruled,'option')+' '+(ruled===1?'is':'are')+' ruled out by '+ruleOwner(r)+'s.':'Nothing is ruled out.')+' Voting is next.'};
  }else if(phase==='vote'){
   const und=cs.filter(p=>!b.votes.some(v=>v.participantId===p.id)).map(p=>p.role);
   board=voteBoard(r);now=voted+' of '+n+' voted';
   sentence=und.length?{status:'running',word:'Voting',reason:voted+' of '+n+' have voted. '+H(listWords(und))+(und.length===1?' is':' are')+' still deciding.'}
    :{status:'running',word:'Voting',reason:'All '+n+' have voted. The Coordinator is weighing the evidence and '+ruleOwner(r).replace(/ rule$/,' rules')+'.'};
  }else if(phase==='synthesis'){
   /* the attention budget (7.2): the two-line ruled-out block leaves; the board keeps the ruled option struck
      ("ruled out · 3 for") and the decision sentence says what the rule did (review fix: the rule-beats-vote moment
      stays visible exactly when the user acts) */
   board=voteBoard(r,{ruledLine:false});density='attention';
   const ruledQ=[...new Set(b.hardConstraintViolations.map(h=>h.proposalId))].map(id=>b.proposals.find(x=>x.id===id)).filter(Boolean);
   const ruledVotes=q=>b.votes.filter(v=>v.proposalId===q.id&&v.position==='support').length;
   /* short enough for the S tier's three lines: a recorded run says "A rule", a run of the user's own "Your rule" */
   const whose=ruleOwner(r)==='your rule'?'Your rule':'A rule';
   const ruledSay=ruledQ.length===1?' '+whose+' ruled out <s>'+H(ruledQ[0].title)+'</s>'+(ruledVotes(ruledQ[0])?', so its '+plural(ruledVotes(ruledQ[0]),'vote')+' don’t count.':'.')
    :ruledQ.length?' '+(whose==='A rule'?'Rules':'Your rules')+' ruled out '+plural(ruledQ.length,'option')+'.':'';
   const write={action:'collab-brainstorm-synthesize',attrs:ra,label:'Write the plan',primary:!blocked,disabled:blocked},
    again={action:'collab-brainstorm-next-round',attrs:ra,label:'One more debate round'};
   if(blocked){
    /* Wonderer's ideas still need a decision (b13 convergence): a warm needs-you row whose sentence prints the one
       reason the Wonderer workspace prints (never "Ready" beside a dead primary; review fix) */
    const W=window.PM56_WONDERER,leads=(r.wonderer&&r.wonderer.leads)||[];
    /* the one reason string (STORM-B's PM56_WONDERER.convergenceState), worded as the run view's next-step row words it:
       undecided -> "Decide on Wonderer’s N ideas first."; stale / pending -> the reason itself; then "Then write the plan."
       One live action (Open Wonderer’s ideas); no dead Write the plan beside it (the view draws none either) */
    const ws=W&&typeof W.convergenceState==='function'?W.convergenceState(r)
     :leads.some(l=>l.state==='stale')?{code:'stale',reason:'Check or set aside the ideas that changed first.'}
     :leads.some(l=>l.state==='research_pending')?{code:'pending',reason:'Wait for the check that is running to finish first.'}
     :{code:'undecided',reason:'Give each idea a decision first.',count:gate.unresolved.length};
    const cnt=ws.count||gate.unresolved.length,left=ws.code==='undecided'&&cnt?'Decide on Wonderer’s '+plural(cnt,'idea')+' first.':(ws.reason||'Give each idea a decision first.');
    const acts=[{action:'b13-open',attrs:ra,label:'Open Wonderer’s ideas',primary:true}];
    decision={tone:'warm',glyph:'ring-dot',sentence:'<b>'+H(left)+'</b> Then write the plan.',actions:running?acts:[]};
    sentence={status:'needs',word:'Almost ready',reason:H(left)+' Then write the plan.'};
   }else{
    tone='accent';
    const acts=[write,again];
    decision={tone:'accent',glyph:'ring-dot',sentence:'<b>Ready to write the plan.</b>'+(ruledSay||' One Deep Plan, with the disagreement kept in it. Nothing gets built yet.'),actions:running&&!viewOpen?acts:[]};
    if(running&&viewOpen)followOns=acts;
    sentence={status:'yourmove',word:'Ready to write the plan',reason:'One Deep Plan, with the disagreement kept in it.'};
   }
   base.technical={command:'cmd.brainstorm.synthesize_plan',text:'Write the plan sends cmd.brainstorm.synthesize_plan. One more debate round sends cmd.brainstorm.next_round.'};
  }
  const playable=running&&!!(window.PM56_BRAINSTORM_DEMOS&&ctx&&window.PM56_BRAINSTORM_DEMOS.controls(ctx,r));
  const actions=[openA,{action:'collab-message',attrs:ra,label:'Message',core:true}];
  /* the vote draws no disabled Write the plan (review cycle): the actions row has no slot to print its reason, and in
     retro at 391 it wrapped the row; the sentence says who is still deciding and the Ready face brings the button */
  if(playable)actions.push({action:'brainstorm-example-play',attrs:ra,label:'Play the recording'});
  return Object.assign(base,{density,tone,sentence,decision,track:trackOf(r,now),board,lanes,followOns,
   pointer:'Deciding in the panel beside the chat',
   meta:{recorded:rec,parts:[qline,rec?'':S.pmxCost({state:'running',spent:r.usage&&r.usage.costUsd,limit:r.config.costLimitUsd||14})].filter(Boolean)},
   actions,
   more:[{action:'collab-open-configure',attrs:'data-kind="brainstorm" data-reconfigure="'+H(r.id)+'"',label:'Change setup…',disabled:running,reason:running?'Stop this BrainStorm first; what it has done so far is kept.':''}]});
 }

 /* ---- motion (5.5 BrainStorm moments), started from PM56_PMX.after on state transitions seen by a module-local
    map (5.3 rule 4), never on node creation, so the demo's 450 ms re-render replays nothing:
    - Line up: the sealed notes turn over and merge into the option rows (420 move, once per run);
    - Vote: each voter walks from the aisle to the option it backs (320 move) as its vote lands.
    Positions are read relative to the card, so a scroll between two renders moves nothing. Reduced motion:
    PM56_PMX.animate applies the end state at once (IMPACT A1-03). ---- */
 const lastSeen=new Map();
 function relRect(el,card){const a=el.getBoundingClientRect(),c=card.getBoundingClientRect();return {x:a.left-c.left,y:a.top-c.top};}
 function motion(ctx,ph){
  if(ph!=='app')return;const X=X_();if(!X||!X.animate||!X.t)return;
  document.querySelectorAll('#pmRoot .pmx-run[data-pmx-kind="brainstorm"][data-run-id]:not([data-pmx-preview])').forEach(card=>{
   const id=card.getAttribute('data-run-id'),r=run(id);if(!r||!r.brainstorm||!r.brainstorm.protocolVersion)return;
   const was=lastSeen.get(id),now={phase:r.brainstorm.phase,notes:{},voters:{}};
   card.querySelectorAll('.pmx-bs-note[data-pid]').forEach(el=>{now.notes[el.getAttribute('data-pid')]=relRect(el,card);});
   card.querySelectorAll('.pmx-voter[data-k^="pmx-voter:"]').forEach(el=>{const pid=el.getAttribute('data-k').split(':').pop(),opt=el.closest('.pmx-vote-opt');now.voters[pid]={at:relRect(el,card),where:opt?opt.getAttribute('data-k'):el.closest('.pmx-vote-aisle')?'aisle':'wing'};});
   if(was&&!card.hasAttribute('data-pmx-arrive')){
    if((was.phase==='blind_proposals'||was.phase==='intake')&&now.phase==='normalize'){
     const flip=X.t('draw');/* 420 ms: the spec's one BrainStorm signature (8.4) shares the draw token's length */
     card.querySelectorAll('.pmx-bs-from[data-pid]').forEach((el,i)=>{const from=was.notes[el.getAttribute('data-pid')],to=relRect(el,card);
      const dx=from?from.x-to.x:0,dy=from?from.y-to.y:-6;
      X.animate(el,[{transform:'translate('+dx+'px,'+dy+'px) rotateY(180deg)',opacity:.4},{transform:'translate(0,0) rotateY(0deg)',opacity:1}],{duration:flip,delay:Math.min(i,5)*X.t('cascade'),easing:X.ease('move'),fill:'backwards'});});
     card.querySelectorAll('.pmx-bs-opt-title,.pmx-bs-opt-from').forEach(el=>X.animate(el,[{opacity:0,transform:'translateY(3px)'},{opacity:1,transform:'none'}],{duration:X.t('row'),delay:Math.max(0,flip-X.t('row')),easing:X.ease('out'),fill:'backwards'}));
    }
    Object.keys(now.voters).forEach(pid=>{const a=was.voters[pid],b=now.voters[pid];if(!a||!b||a.where===b.where)return;
     const el=card.querySelector('.pmx-voter[data-k="pmx-voter:'+CSS.escape(id)+':'+CSS.escape(pid)+'"]');if(!el)return;
     X.animate(el,[{transform:'translate('+(a.at.x-b.at.x)+'px,'+(a.at.y-b.at.y)+'px)'},{transform:'none'}],{duration:X.t('move'),easing:X.ease('move')});});
   }
   lastSeen.set(id,now);
  });
 }
 if(window.PM56_PMX&&window.PM56_PMX.after)window.PM56_PMX.after(motion);
 /* must-haves: the field scrolls by whole 17.5 px lines (closing follow-up). The CSS lands typing on whole lines; a
    wheel, trackpad or scrollbar scroll, or a caret reveal while an earlier line is edited, can still stop part way,
    so when a scroll of the field ends it settles on the nearest whole line (instantly under reduced motion). Rounding
    to the nearest line keeps the caret's line in view (the reveal is off by the caret's half-leading, under 9 px). */
 const MUST_LINE=17.5,MUST_SEL='.pmx-bs-mbox > textarea[data-collab-input="mustHaves"]',mustT=new WeakMap();
 function snapMust(el){
  mustT.delete(el);if(!el.isConnected)return;
  const max=el.scrollHeight-el.clientHeight;if(max<=0)return;
  const to=Math.max(0,Math.min(max,Math.round(el.scrollTop/MUST_LINE)*MUST_LINE));
  if(Math.abs(to-el.scrollTop)<=0.5)return;/* whole-pixel scroll offsets: within 0.5 px is on the line */
  const X=X_(),still=!!(X&&X.reduced&&X.reduced());
  try{el.scrollTo({top:to,behavior:still?'auto':'smooth'});}catch(e){el.scrollTop=to;}
 }
 function mustLater(el,ms){clearTimeout(mustT.get(el));mustT.set(el,setTimeout(()=>snapMust(el),ms));}
 const HAS_SCROLLEND='onscrollend' in window;
 document.addEventListener(HAS_SCROLLEND?'scrollend':'scroll',e=>{const el=e.target;
  if(el&&el.tagName==='TEXTAREA'&&el.matches(MUST_SEL))mustLater(el,HAS_SCROLLEND?0:150);},{capture:true,passive:true});
 ['input','keyup'].forEach(t=>document.addEventListener(t,e=>{const el=e.target;
  if(el&&el.tagName==='TEXTAREA'&&el.matches(MUST_SEL))requestAnimationFrame(()=>mustLater(el,0));},true));
 window.PM56_BRAINSTORM={admit,owns,phaseLabel,tally,submitProposal,normalize,debate,recordEvidence,vote,decide,synthesize,renderSummary,renderActions,markdown,openResults,planPayload,
  /* presentation (STORM-A): the KIND INTERFACE parts, the waiting noun (IMPACT A1-20 / A3-04) and the chapters */
  sheetParts,cardParts,waitingNoun:WAIT_NOUN,chapters:()=>CHAPTERS.map(c=>({plate:c[0],stop:c[1],canon:c[2],part:c[3]}))};
})();
