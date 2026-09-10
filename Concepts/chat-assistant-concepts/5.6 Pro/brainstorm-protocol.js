/* BrainStorm concept protocol: validated recorded inputs on the existing
 * CollaborativeRun. No provider execution, network research or project writes.
 * The Plan owner creates the single resulting Deep Plan. No second Plan store. */
(function(){
 'use strict';
 const E=window.PM56_EXT,C=window.PM56_COLLAB,P=window.PM56_PLANS;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 const run=id=>C.run(id),owns=id=>!!run(id)?.brainstorm?.protocolVersion,fail=error=>({ok:false,error});
 const views=new Map(),object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const labels={intake:'Intake',blind_proposals:'Independent proposals',normalize:'Options compared',debate:'Debating alternatives',evidence:'Checking evidence',vote:'Considering votes',synthesis:'Ready to synthesize',completed:'Deep Plan ready'};
 function phaseLabel(r){return labels[r.brainstorm.phase]||r.brainstorm.phase;}
 function say(r,type,body,p){return C.appendMessage(r.id,{senderKind:p?'participant':'coordinator',senderId:p?.id||null,senderName:p?.role||'BrainStorm coordinator',messageType:type,body});}
 function core(r){return r.participants.filter(p=>p.additiveRoleKind==='none'||!p.additiveRoleKind);}
 function current(r,a){const p=r.participants.find(p=>p.id===a.participantId);return !!(p&&p.assignmentRevision===a.assignmentRevision&&(!a.completionAttemptId||p.attempts.at(-1)?.attempt_id===a.completionAttemptId)&&(!a.completionAttemptId||p.outcome==='completed'));}
 function gate(r,x){if(!object(x))return 'invalid_payload';if(!r?.brainstorm?.protocolVersion)return 'brainstorm_input_unavailable';if(r.status!=='running')return 'run_not_running';if(x.epoch!==r.stopEpoch)return 'stale_epoch';if(x.sourceHash!==r.brainstorm.input.sourceHash)return 'different_source_hash';if(r.definitionRevision!==r.brainstorm.definitionRevision)return 'definition_changed';return null;}
 function evidenceValid(r,ids){return Array.isArray(ids)&&ids.length>0&&ids.every(id=>r.brainstorm.input.evidence.some(e=>e.id===id));}
 function admit(r,d){
  if(!d.brainstormInput)return;
  const input=freeze({...clone(d.brainstormInput),frozenAt:new Date().toISOString()});
  r.brainstorm={protocolVersion:1,definitionRevision:r.definitionRevision,input,phase:'intake',
   questionBank:{baselineLimit:r.config.questionLimit,grillExtension:r.config.grillExtension,grillMeEnabled:!!d.grillMe,askedIds:[],resolvedIds:[],duplicateIds:[],researchRoutedIds:input.evidence.map(e=>e.id),importedAnswers:clone(input.answers||[])},
   attempts:core(r).map(p=>({id:'bs-attempt-'+r.id+'-'+p.id,participantId:p.id,assignmentRevision:p.assignmentRevision,epoch:r.stopEpoch,sourceHash:input.sourceHash,status:'running',input:{sourceHash:input.sourceHash,peerProposals:[],peerIdentities:[]},proposal:null})),
   proposals:[],debates:[],evidenceChecks:[],votes:[],hardConstraintViolations:[],dissent:[],decision:null,synthesis:null};
  core(r).forEach(p=>{p.status='working';p.outcome=null;p.current='Independent proposal against the frozen brief';});
  r.expectedOutputs=[{id:'deep-plan-'+r.id,delivered:false}];
  say(r,'message','Recorded example: '+input.label+'. '+(input.answers||[]).length+' prior answers retained; no repeat questions.');
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
  return {runId:r.id,threadId:r.threadId,sourceHash:b.input.sourceHash,title:q.title,blocks,steps:d.steps,sourceRefs:b.input.evidence.map(e=>({ref:'brainstorm-evidence:'+r.id+':'+e.id,kind:'recorded_evidence',summary:e.label})),ledgerEntries:[{k:'objective',v:b.input.objective},{k:'decision',v:q.title+' — '+d.reason},...b.input.constraints.map(c=>({k:'constraint',v:c.text})),...b.dissent.map(v=>({k:'dissent',v:v.participantRole+': '+v.reason}))]};
 }
 function synthesize(id){
  const r=run(id);if(!owns(id))return fail('brainstorm_input_unavailable');const b=r.brainstorm;
  if(b.synthesis)return {ok:true,reused:true,planId:b.synthesis.planId};
  const why=gate(r,{epoch:r.stopEpoch,sourceHash:b.input.sourceHash});if(why)return fail(why);
  if(b.phase!=='synthesis'||!b.decision)return fail('synthesis_not_ready');
  if(b.attempts.some(a=>!current(r,a)))return fail('stale_participant_result');
  if(b.hardConstraintViolations.some(h=>h.proposalId===b.decision.selectedProposalId))return fail('hard_constraint_disqualified');
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
 function renderActions(c,r,withPlayback=true){const b=r.brainstorm;return '<div class="bs-actions">'+(withPlayback?(window.PM56_BRAINSTORM_DEMOS?.controls(c,r)||''):'')+'<button class="text-button" data-action="brainstorm-open-results" data-run="'+c.esc(r.id)+'">'+c.icon('brain',12)+' Open exploration</button>'+(b.synthesis?'<button class="soft-button" data-action="brainstorm-open-plan" data-run="'+c.esc(r.id)+'">Open Deep Plan</button>':'<button class="soft-button" data-action="collab-brainstorm-synthesize" data-run="'+c.esc(r.id)+'"'+(b.phase==='synthesis'&&r.status==='running'?'':' disabled')+'>Synthesize Deep Plan</button>')+'</div>';}
 function renderSummary(c,r){const b=r.brainstorm;return '<div class="bs-summary"><strong>'+c.esc(phaseLabel(r))+'</strong><span>'+b.proposals.length+' alternatives · '+b.votes.length+'/'+b.attempts.length+' votes</span></div>'+renderActions(c,r,false);}
 function markdown(r){const b=r.brainstorm;return ['# '+r.title,'',b.input.objective,'','## Alternatives',...b.proposals.map(q=>'### '+q.title+'\n'+q.approach+'\n'+q.originatingParticipantIds.length+' originating participants\n'+b.hardConstraintViolations.filter(h=>h.proposalId===q.id).map(h=>'Disqualified: '+h.constraint).join('\n')),'','## Debate',...b.debates.map(d=>'### Round '+d.round+'\n'+d.messages.map(m=>core(r).find(p=>p.id===m.participantId).role+': '+m.body).join('\n')),'','## Votes',...b.votes.map(v=>v.participantRole+' — '+v.position+' '+b.proposals.find(q=>q.id===v.proposalId).title+' ('+v.confidence+'): '+v.reason),'','## Decision',b.decision?.reason||'No final decision.','','## Preserved dissent',...b.dissent.map(v=>v.participantRole+': '+v.reason+' [evidence '+v.evidenceRefs.join(', ')+']'),'','## Source',b.input.sourceHash,'Recorded example; no live provider calls.'].join('\n');}
 function documentHtml(c,id){
  const r=run(id);if(!owns(id))return '';const b=r.brainstorm,esc=c.esc,mode=views.get(id)||'rich';
  const header='<div class="bs-meta"><span>BrainStorm · read-only</span><span>'+esc(phaseLabel(r))+'</span></div><h1>'+esc(b.input.label)+'</h1><p class="bs-objective">'+esc(b.input.objective)+'</p><div class="bs-toolbar"><button class="text-button" data-action="brainstorm-view" data-run="'+esc(id)+'" data-mode="rich" aria-pressed="'+(mode==='rich')+'">Rich Text</button><button class="text-button" data-action="brainstorm-view" data-run="'+esc(id)+'" data-mode="markdown" aria-pressed="'+(mode==='markdown')+'">Markdown</button></div>';
  const decision=b.decision?'<section class="bs-decision"><span>Recommendation</span><strong>'+esc(b.proposals.find(q=>q.id===b.decision.selectedProposalId).title)+'</strong><p>'+esc(b.decision.reason)+'</p></section>':'';
  const options=b.proposals.map(q=>{const violations=b.hardConstraintViolations.filter(h=>h.proposalId===q.id),votes=b.votes.filter(v=>v.proposalId===q.id&&v.position==='support');return '<section class="bs-option" data-proposal="'+esc(q.id)+'"><header><strong>'+esc(q.title)+'</strong><span>'+votes.length+' support'+(violations.length?' · Disqualified':'')+'</span></header><p>'+esc(q.approach)+'</p>'+violations.map(h=>'<div class="bs-constraint">'+c.icon('shield',12)+'<span>'+esc(h.constraint)+'</span></div>').join('')+'<details><summary>Trade-offs and evidence</summary><dl>'+[['Benefits',q.benefits],['Costs',q.costs],['Risks',q.risks]].map(([k,a])=>'<dt>'+k+'</dt><dd>'+a.map(esc).join('<br>')+'</dd>').join('')+'</dl><div class="bs-evidence-links">'+q.evidenceRefs.map(e=>'<button class="text-button" data-action="brainstorm-open-evidence" data-run="'+esc(id)+'" data-evidence="'+esc(e)+'">'+esc(b.input.evidence.find(x=>x.id===e).label)+'</button>').join('')+'</div><small>'+q.originatingParticipantIds.length+' original proposal'+(q.originatingParticipantIds.length===1?'':'s')+' retained</small></details></section>';}).join('');
  const votes=b.votes.length?'<details class="bs-detail" data-bs-section="votes"><summary>Votes · '+b.votes.length+' voices</summary>'+b.votes.map(v=>'<div class="bs-vote"><strong>'+esc(v.participantRole)+'</strong><span>'+esc(v.position)+' · '+esc(b.proposals.find(q=>q.id===v.proposalId).title)+'</span><p>'+esc(v.reason)+'</p><small>Confidence '+esc(v.confidence)+'</small></div>').join('')+'</details>':'';
  const dissent=b.dissent.length?'<details class="bs-detail" data-bs-section="dissent"><summary>Dissent retained · '+b.dissent.length+'</summary>'+b.dissent.map(v=>'<div class="bs-vote"><strong>'+esc(v.participantRole)+'</strong><p>'+esc(v.reason)+'</p><small>'+esc(v.position)+' · '+esc(v.confidence)+' confidence</small><div class="bs-evidence-links">'+v.evidenceRefs.map(e=>'<button class="text-button" data-action="brainstorm-open-evidence" data-run="'+esc(id)+'" data-evidence="'+esc(e)+'">'+esc(b.input.evidence.find(x=>x.id===e).label)+'</button>').join('')+'</div></div>').join('')+'</details>':'';
  const debate=b.debates.length?'<details class="bs-detail" data-bs-section="debate"><summary>Debate · '+b.debates.length+' rounds</summary>'+b.debates.map(d=>'<h3>Round '+d.round+'</h3>'+d.messages.map(m=>'<div class="bs-vote"><strong>'+esc(core(r).find(p=>p.id===m.participantId).role)+'</strong><p>'+esc(m.body)+'</p></div>').join('')).join('')+'</details>':'';
  const evidence='<details class="bs-detail" data-bs-section="evidence"><summary>Sources and prior answers</summary><div class="bs-evidence-links">'+b.input.evidence.map(e=>'<button class="text-button" data-action="brainstorm-open-evidence" data-run="'+esc(id)+'" data-evidence="'+esc(e.id)+'">'+c.icon('document',12)+' '+esc(e.label)+'</button>').join('')+'</div>'+(b.input.answers||[]).map(a=>'<p>'+esc(a.question)+' — '+esc(a.answer)+'</p>').join('')+'<small>Source checksum '+esc(b.input.sourceHash)+'</small></details>';
  return '<article class="editor-doc bs-document" data-brainstorm-run="'+esc(id)+'">'+(window.PM56_BRAINSTORM_DEMOS?.editorGuide(id)||'')+header+(mode==='markdown'?'<pre class="bs-markdown">'+esc(markdown(r))+'</pre>':decision+(options||'<p class="bs-empty">Independent proposals appear together after the blind round.</p>')+dissent+votes+debate+evidence)+renderActions(c,r)+'<p class="bs-provenance">Recorded example · local frozen evidence · no provider calls</p></article>';
 }
 function evidenceHtml(c,id,eid){const r=run(id),e=r?.brainstorm?.input.evidence.find(e=>e.id===eid);if(!e)return '';return '<article class="editor-doc bs-document"><button class="text-button" data-action="brainstorm-open-results" data-run="'+c.esc(id)+'">Back to exploration</button><div class="bs-meta">Frozen example evidence · '+c.esc(r.brainstorm.input.sourceHash)+'</div><h1>'+c.esc(e.label)+'</h1><pre class="bs-source">'+c.esc(e.content)+'</pre><p class="bs-provenance">'+c.esc(e.provenance||'Supplied demo input; not an external research result.')+'</p></article>';}
 function openResults(c,id){if(!owns(id))return;c.closeMenu();c.closeDialog();c.state.editorRevealed=true;c.openEditor('brainstorm:'+id);}
 E.action('brainstorm-open-results',(c,b)=>{openResults(c,b.dataset.run);return true;});
 E.action('brainstorm-view',(c,b)=>{views.set(b.dataset.run,b.dataset.mode==='markdown'?'markdown':'rich');c.renderApp();return true;});
 E.action('brainstorm-open-evidence',(c,b)=>{if(!owns(b.dataset.run))return true;c.closeDialog();c.state.editorRevealed=true;c.openEditor('brainstorm-evidence:'+b.dataset.run+':'+b.dataset.evidence);return true;});
 E.action('brainstorm-open-plan',(c,b)=>{const id=run(b.dataset.run)?.brainstorm?.synthesis?.planId;if(id){c.closeDialog();P.openDetails(c,id);}return true;});
 E.chainAction('collab-brainstorm-synthesize',(c,b)=>{if(!owns(b.dataset.run))return false;const res=synthesize(b.dataset.run);if(!res.ok)c.toast('Synthesis not ready',res.error);else {c.closeDialog();P.openDetails(c,res.planId);}c.renderApp();return true;});
 E.chainAction('collab-brainstorm-next-round',(c,b)=>{if(!owns(b.dataset.run))return false;c.toast('Protocol advances on results','Recorded inputs must complete the current round.');return true;});
 E.chainAction('collab-open-configure',(c,b)=>{if(!owns(b.dataset.reconfigure))return false;const r=run(b.dataset.reconfigure);if(['running','paused'].includes(r.status)){c.toast('Configuration is frozen for this run','Cancel this run before starting with a different configuration.');return true;}C.openConfigure('brainstorm');const d=C.draft();d.brainstormInput=clone(r.brainstorm.input);d.name=r.title+' (new run)';c.openDialog({type:'collab-configure'});return true;});
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('brainstorm:')?'BrainStorm':c.editorId?.startsWith('brainstorm-evidence:')?'BrainStorm evidence':'');
 E.slot('editorDocument',c=>{if(c.editorId?.startsWith('brainstorm:'))return documentHtml(c,c.editorId.slice(11));if(c.editorId?.startsWith('brainstorm-evidence:')){const [id,...e]=c.editorId.slice(20).split(':');return evidenceHtml(c,id,e.join(':'));}return '';});
 E.chainAction('reset-all',()=>{views.clear();return false;});
 window.PM56_BRAINSTORM={admit,owns,phaseLabel,tally,submitProposal,normalize,debate,recordEvidence,vote,decide,synthesize,renderSummary,renderActions,markdown,openResults,planPayload};
})();
