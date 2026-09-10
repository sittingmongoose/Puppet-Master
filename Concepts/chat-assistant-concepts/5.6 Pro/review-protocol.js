/* Review protocol projection. Uses the existing CollaborativeRun/message store,
 * To-Do owner and editor host. No provider adapter, file writes, or native runtime.
 * Only a supplied immutable target enters this executable concept slice. Recorded
 * demo results enter through the same validated ingress; they are never live AI. */
(function(){
 'use strict';
 const E=window.PM56_EXT,C=window.PM56_COLLAB,T=window.PM56_TODOS;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 const views=new Map();
 const dispositions=['confirmed','rejected','duplicate','uncertain'],severities=['critical','major','minor','suggestion'];
 const ctx=()=>E.ctx(),run=id=>C.run(id),owns=id=>!!run(id)?.review?.protocolVersion;
 const say=(r,type,body,p)=>C.appendMessage(r.id,{senderKind:p?'participant':'coordinator',senderId:p?.id||null,senderName:p?.role||'Review coordinator',messageType:type,body});
 const fail=error=>({ok:false,error});
 const unique=a=>Array.from(new Set(a));
 function passIsCurrent(r,a){const p=r.participants.find(p=>p.id===a.participantId);return !!(p&&a.status==='completed'&&p.assignmentRevision===a.assignmentRevision&&p.outcome==='completed'&&p.attempts.at(-1)?.attempt_id===a.completionAttemptId);}
 function admit(r,d){
  if(!d.reviewTarget)return;
  const snapshot=clone(d.reviewTarget);snapshot.frozenAt=new Date().toISOString();const target=freeze(snapshot);
  r.config.autoRepair=false;
  r.review={protocolVersion:1,phase:'independent',targetPack:target,requestedPasses:r.participants.length,roundNumber:1,
   passes:r.participants.map(p=>({id:'review-attempt-'+r.id+'-'+p.id,participantId:p.id,assignmentRevision:p.assignmentRevision,
    epoch:r.stopEpoch,targetHash:target.targetHashes.primary,status:'running',findings:[],
    input:{targetHash:target.targetHashes.primary,evidenceIds:target.evidence.map(e=>e.id),peerFindings:[],peerIdentities:[]}})),
   findings:[],excludedFindings:[],duplicates:[],report:null};
  r.participants.forEach(p=>{p.status='working';p.outcome=null;p.current='Independent inspection of the frozen target';});
  r.expectedOutputs=[{id:'review-report-'+r.id,delivered:false}];
  say(r,'message','Frozen '+target.label+'. Independent review contexts contain no peer findings. Recorded example; no provider calls.');
 }
 function gate(r,payload){
  if(!r?.review?.protocolVersion)return 'review_unavailable';
  if(r.status!=='running')return 'run_not_running';
  if(payload.epoch!==r.stopEpoch)return 'stale_epoch';
  if(payload.targetHash!==r.review.targetPack.targetHashes.primary)return 'different_target_hash';
  return null;
 }
 function submitPass(id,payload){
  const r=run(id),why=gate(r,payload);if(why){if(r?.review)r.review.excludedFindings.push({reason:why,payload:clone(payload)});return fail(why);}
  const a=r.review.passes.find(a=>a.id===payload.attemptId),p=a&&r.participants.find(p=>p.id===a.participantId);
  if(!a||!p)return fail('unknown_attempt');
  if(a.assignmentRevision!==p.assignmentRevision||payload.assignmentRevision!==p.assignmentRevision)return fail('stale_assignment');
  if(a.status==='completed')return JSON.stringify(a.findings)===JSON.stringify(payload.findings)?{ok:true,reused:true}:fail('conflicting_duplicate_pass');
  if(r.review.phase!=='independent')return fail('initial_round_closed');
  const fs=payload.findings;
  if(!Array.isArray(fs)||fs.some(f=>!f.id||!f.findingKey||!f.claim||!severities.includes(f.severity)||
      !Array.isArray(f.evidenceRefs)||!f.evidenceRefs.length||f.evidenceRefs.some(id=>!r.review.targetPack.evidence.some(e=>e.id===id))))return fail('invalid_finding_evidence');
  if(new Set(fs.map(f=>f.id)).size!==fs.length)return fail('duplicate_finding_identity');
  a.findings=freeze(clone(fs));a.status='completed';a.completedAt=new Date().toISOString();
  C.setOutcome(r.id,p.id,'completed',{reason:'Recorded independent pass received against the frozen target'});
  a.completionAttemptId=p.attempts.at(-1).attempt_id;
  p.current=fs.length+' finding'+(fs.length===1?'':'s')+' submitted';
  say(r,'pass',p.current,p);
  return {ok:true,attemptId:a.id};
 }
 function normalize(id){
  const r=run(id);if(!owns(id)||r.status!=='running')return fail('run_not_running');
  if(r.review.phase!=='independent')return {ok:true,reused:true};
  if(r.review.passes.some(a=>a.status!=='completed'))return fail('initial_passes_incomplete');
  if(r.review.passes.some(a=>!passIsCurrent(r,a)))return fail('stale_assignment');
  const grouped=new Map(),duplicates=[];
  r.review.passes.forEach(a=>a.findings.forEach(f=>{
   const rawId=a.id+':'+f.id;let dest=grouped.get(f.findingKey);
   if(!dest){dest={...clone(f),id:'finding-'+r.id+'-'+(grouped.size+1),originalFindingIds:[],originatingReviewerIds:[],evidenceRefs:[],reviewerVotes:[],disposition:'uncertain',dissent:null};grouped.set(f.findingKey,dest);}
   else duplicates.push({originalFindingId:rawId,canonicalFindingId:dest.id,participantId:a.participantId,evidenceRefs:clone(f.evidenceRefs)});
   dest.originalFindingIds.push(rawId);dest.originatingReviewerIds=unique([...dest.originatingReviewerIds,a.participantId]);dest.evidenceRefs=unique([...dest.evidenceRefs,...f.evidenceRefs]);
  }));
  r.review.findings=[...grouped.values()];r.review.duplicates=duplicates;
  r.review.phase=r.participants.length===1?'synthesis':'corroboration';
  say(r,'message',grouped.size+' distinct findings; '+duplicates.length+' duplicate observation'+(duplicates.length===1?'':'s')+' linked to their original passes.');
  return {ok:true,findings:r.review.findings.length,duplicates:duplicates.length};
 }
 function vote(id,participantId,findingId,decision){
  const r=run(id),why=gate(r,decision);if(why)return fail(why);
  if(r.review.phase!=='corroboration'||r.participants.length===1)return fail('no_peer_round');
  if(!r.participants.some(p=>p.id===participantId))return fail('unknown_participant');
  const attempt=r.review.passes.find(a=>a.participantId===participantId);
  if(!attempt||!passIsCurrent(r,attempt))return fail('reviewer_not_current_completed');
  const f=r.review.findings.find(f=>f.id===findingId);
  if(!f||!dispositions.includes(decision.disposition)||!decision.reason||!['high','medium','low'].includes(decision.confidence))return fail('invalid_vote');
  if(!Array.isArray(decision.evidenceRefs)||decision.evidenceRefs.some(id=>!r.review.targetPack.evidence.some(e=>e.id===id)))return fail('invalid_vote_evidence');
  const record={participantId,disposition:decision.disposition,confidence:decision.confidence,reason:decision.reason,evidenceRefs:clone(decision.evidenceRefs),targetHash:decision.targetHash};
  const old=f.reviewerVotes.find(v=>v.participantId===participantId);
  if(old)return JSON.stringify(old)===JSON.stringify(record)?{ok:true,reused:true}:fail('conflicting_duplicate_vote');
  f.reviewerVotes.push(record);return {ok:true};
 }
 function finalize(id,resolutions){
  const r=run(id);if(!owns(id))return fail('review_unavailable');
  if(r.review.report)return r.review.resolutionFingerprint===JSON.stringify(resolutions)?{ok:true,reused:true,artifactId:r.review.report.id}:fail('conflicting_finalization');
  if(r.status!=='running'||!['corroboration','synthesis'].includes(r.review.phase))return fail('review_not_ready');
  if(r.review.passes.some(a=>!passIsCurrent(r,a)))return fail('stale_assignment');
  if(!Array.isArray(resolutions)||resolutions.length!==r.review.findings.length)return fail('resolution_coverage');
  const ids=resolutions.map(x=>x.findingId);if(new Set(ids).size!==ids.length)return fail('duplicate_resolution');
  for(const f of r.review.findings){
   const d=resolutions.find(d=>d.findingId===f.id);
   if(!d||!dispositions.includes(d.disposition)||!d.reason)return fail('invalid_resolution');
   if(r.participants.length>1&&f.reviewerVotes.length!==r.participants.length)return fail('peer_round_incomplete');
  }
  r.review.findings.forEach(f=>{
   const d=resolutions.find(d=>d.findingId===f.id);f.disposition=d.disposition;f.adjudication=d.reason;
   const dissent=f.reviewerVotes.filter(v=>v.disposition!==f.disposition);
   f.dissent=dissent.length?dissent.map(v=>r.participants.find(p=>p.id===v.participantId).role+': '+v.reason).join('\n'):null;
  });
  const report=freeze({id:'review-report-'+r.id,kind:'review_report',version:1,runId:r.id,title:r.title,target:clone(r.review.targetPack),
   strategy:r.config.strategy,roundNumber:r.review.roundNumber,reviewers:r.participants.map(p=>({id:p.id,role:p.role,requestedModel:p.requestedModelName,effectiveModel:p.effectiveModelName,persona:p.effectivePersona})),
   passes:clone(r.review.passes),findings:clone(r.review.findings),duplicates:clone(r.review.duplicates),
   summary:r.review.findings.filter(f=>f.disposition==='confirmed').length+' confirmed · '+r.review.findings.filter(f=>f.disposition==='uncertain').length+' uncertain',
   authority:'Read-only; repairs are a separate explicit action',provenance:'Deterministic recorded example; no live reviewer or provider execution',createdAt:new Date().toISOString()});
  r.review.resolutionFingerprint=JSON.stringify(resolutions);r.review.report=report;r.review.phase='completed';r.status='completed';r.completedAt=report.createdAt;
  r.expectedOutputs.forEach(o=>{o.delivered=true;});r.artifacts.push(report);
  say(r,'message',report.summary+'. Review complete; the target has not been changed.');
  return {ok:true,artifactId:report.id};
 }
 function selected(id){return C.selectedFindings(id);}
 function toggleFinding(c,b){const r=run(b.dataset.run),f=r?.review?.findings.find(f=>f.id===b.dataset.finding);if(!f||r.status!=='completed'||f.disposition!=='confirmed'||f.todoId)return true;selected(r.id)[f.id]=!selected(r.id)[f.id];c.renderApp();return true;}
 function createSelectedTodos(c,b){
  const r=run(b.dataset.run);if(!r?.review)return true;
  const sel=selected(r.id),ids=Object.keys(sel).filter(id=>sel[id]);
  const res=T.materializeForReview(r,ids);if(!res.ok){c.toast('To-Dos not created',res.error);return true;}
  res.items.forEach(x=>{const f=r.review.findings.find(f=>f.id===x.finding_id);f.todoId=x.todo_id;f.convertedToTodo=true;delete sel[f.id];});
  if(res.created)say(r,'request',res.created+' confirmed finding'+(res.created===1?'':'s')+' converted to pending To-Dos. No repair has started.');
  c.renderApp();return true;
 }
 function sendSelected(c,b){
  const r=run(b.dataset.run);if(!r||r.status!=='completed')return true;
  const fs=r.review.findings.filter(f=>selected(r.id)[f.id]&&f.disposition==='confirmed');if(!fs.length)return true;
  const text='Please address the selected findings from '+r.title+':\n'+fs.map(f=>'- '+f.claim+' [Review '+r.id+' / '+f.id+']').join('\n');
  const CS=window.PM56_COMPOSER_STATE,buffer=CS?.bufferFor(r.threadId);
  // Explicitly target the source thread; never send or overwrite another draft.
  if(buffer?.text){c.toast('Draft already exists','Keep or send the existing draft before inserting findings.');return true;}
  c.switchThread(r.threadId);window.PM56_RUNTIME.composer.destination=null;
  c.state.composer=text;c.state.drafts[r.threadId]=text;if(buffer){buffer.text=text;buffer.destination=null;}
  c.closeDialog();c.state.editorRevealed=false;c.renderApp();return true;
 }
 function renderSummary(c,r){
  const v=r.review,done=v.passes.filter(p=>p.status==='completed').length;
  return '<div class="review-compact"><div class="review-status-line"><strong>'+c.esc(v.report?v.report.summary:({independent:'Independent review',corroboration:'Comparing findings',synthesis:'Preparing report'}[v.phase]||v.phase))+'</strong><span>'+done+'/'+v.passes.length+' reviewers</span></div><div class="review-caption">'+c.esc(v.targetPack.label)+' · read-only</div>'+(v.report?'<button class="text-button" data-action="review-open-report" data-run="'+c.esc(r.id)+'">'+c.icon('document',12)+' Open report · V1</button>':'')+'</div>';
 }
 function renderActions(c,r){return '<div class="review-action-row">'+(window.PM56_REVIEW_DEMOS?.controls(c,r)||'')+(r.review.report?'<button class="soft-button" data-action="review-open-report" data-run="'+c.esc(r.id)+'">Open report</button>':'')+'<button class="soft-button" data-action="collab-review-run-again" data-run="'+c.esc(r.id)+'">Run another review…</button></div>';}
 function findingHtml(c,r,f){
  const esc=c.esc,sel=selected(r.id),todo=r.review.findings.find(x=>x.id===f.id)?.todoId;
  return '<section class="review-finding" data-finding="'+esc(f.id)+'"><div class="review-finding-head">'+(f.disposition==='confirmed'?'<input type="checkbox" aria-label="Select '+esc(f.claim)+'" data-action="collab-review-toggle-finding" data-run="'+esc(r.id)+'" data-finding="'+esc(f.id)+'"'+(sel[f.id]?' checked':'')+(todo?' disabled':'')+'>':'')+'<strong>'+esc(f.claim)+'</strong></div><div class="review-tags"><span>'+esc(f.severity)+'</span><span>'+esc(f.disposition)+'</span><span>'+f.originatingReviewerIds.length+' source '+(f.originatingReviewerIds.length===1?'reviewer':'reviewers')+'</span>'+(todo?'<span>To-Do created</span>':'')+'</div><p>'+esc(f.adjudication)+'</p><div class="review-evidence-links">'+f.evidenceRefs.map(id=>'<button class="text-button" data-action="review-open-evidence" data-run="'+esc(r.id)+'" data-evidence="'+esc(id)+'">'+c.icon('document',11)+' '+esc(r.review.targetPack.evidence.find(e=>e.id===id)?.label||id)+'</button>').join('')+'</div>'+(f.dissent?'<details class="review-dissent"><summary>Dissent retained</summary><p>'+esc(f.dissent).replace(/\n/g,'<br>')+'</p></details>':'')+'</section>';
 }
 function markdown(report){
  return '# '+report.title+'\n\nReview report V'+report.version+' · '+report.target.targetHashes.primary+'\n\n'+report.summary+'\n\n'+report.provenance+'\n\n'+report.authority+'\n\n## Reviewers\n'+report.reviewers.map(p=>'- '+p.role+' · '+p.effectiveModel+' · '+p.persona+' · '+p.id).join('\n')+'\n\n## Findings\n'+report.findings.map(f=>'### '+f.claim+'\n'+f.severity+' · '+f.disposition+'\n\n'+f.adjudication+'\n\nEvidence: '+f.evidenceRefs.join(', ')+'\nOrigins: '+f.originatingReviewerIds.join(', ')+(f.dissent?'\n\nDissent: '+f.dissent:'')).join('\n\n')+'\n\n## Duplicate observations\n'+report.duplicates.map(d=>'- '+d.originalFindingId+' → '+d.canonicalFindingId).join('\n')+(report.reviewers.length>1?'\n\n## Agreement matrix\n'+report.findings.map(f=>f.claim+'\n'+f.reviewerVotes.map(v=>'- '+v.participantId+': '+v.disposition+' · '+v.reason).join('\n')).join('\n\n'):'\n\nSingle reviewer; no peer corroboration is claimed.')+'\n';
 }
 function documentHtml(c,id){
  const r=run(id);if(!r?.review?.report)return '<div class="editor-empty">Review report is not ready.</div>';
  const a=r.review.report,v=views.get(id)||{},esc=c.esc;
  const header='<div class="review-doc-meta"><span>Review report · V1</span><span>Read-only</span></div><h1>'+esc(a.title)+'</h1><p class="review-doc-summary">'+esc(a.summary)+'</p><div class="review-doc-toolbar"><button class="soft-button" data-action="review-report-view" data-run="'+esc(id)+'" data-view="'+(v.mode==='markdown'?'rich':'markdown')+'">'+(v.mode==='markdown'?'Rich Text':'Markdown')+'</button><button class="soft-button" data-action="review-export-report" data-run="'+esc(id)+'">Export Markdown</button></div>';
  let body=v.mode==='markdown'?'<pre class="review-markdown">'+esc(markdown(a))+'</pre>':
   '<div class="review-target-label"><strong>'+esc(a.target.label)+'</strong><span>Frozen '+esc(a.target.targetHashes.primary)+'</span></div>'+a.findings.slice().sort((x,y)=>(x.disposition==='confirmed'?0:1)-(y.disposition==='confirmed'?0:1)).map(f=>findingHtml(c,r,f)).join('')+
   '<details class="review-technical"><summary>Reviewers and '+a.passes.length+' independent '+(a.passes.length===1?'pass':'passes')+'</summary>'+a.reviewers.map(p=>'<div class="review-person-row"><strong>'+esc(p.role)+'</strong><span>'+esc(p.effectiveModel)+' · '+esc(p.persona)+'</span><code>'+esc(p.id)+'</code></div>').join('')+'</details>'+
   (a.reviewers.length>1?'<details class="review-technical"><summary>Agreement and duplicate observations</summary><div class="review-agreement">'+a.findings.map(f=>'<div><strong>'+esc(f.claim)+'</strong>'+f.reviewerVotes.map(v=>'<p>'+esc(a.reviewers.find(p=>p.id===v.participantId).role)+' · '+esc(v.disposition)+'<br><span>'+esc(v.reason)+'</span></p>').join('')+'</div>').join('')+'</div><p>'+a.duplicates.length+' duplicate observation(s); all original finding and reviewer identities retained.</p></details>':'<p class="review-caption">Single reviewer · no peer corroboration</p>');
  const chosen=a.findings.some(f=>selected(id)[f.id]&&f.disposition==='confirmed'&&!r.review.findings.find(x=>x.id===f.id)?.todoId);
  const count=r.review.findings.filter(f=>f.todoId).length;
  const actions='<div class="review-doc-actions">'+(v.mode!=='markdown'?'<button class="soft-button" data-action="collab-review-create-todos" data-run="'+esc(id)+'"'+(!chosen?' disabled':'')+'>Create To-Dos</button><button class="soft-button" data-action="collab-review-send-findings" data-run="'+esc(id)+'"'+(!chosen?' disabled':'')+'>Send findings to Agent</button>':'')+(count?'<button class="soft-button" data-action="review-open-todos" data-run="'+esc(id)+'">Open '+count+' To-Do'+(count===1?'':'s')+'</button>':'')+'<button class="text-button" data-action="collab-review-run-again" data-run="'+esc(id)+'">Run another review…</button></div>';
  return '<article class="editor-doc review-document" data-review-run="'+esc(id)+'">'+(window.PM56_REVIEW_DEMOS?.editorGuide(id)||'')+header+body+actions+'<p class="review-provenance">'+esc(a.provenance)+'</p></article>';
 }
 function evidenceHtml(c,id,eid){
  const r=run(id),t=r?.review?.targetPack,e=t?.evidence.find(e=>e.id===eid);if(!e)return '<div class="editor-empty">Frozen evidence unavailable.</div>';
  return '<article class="editor-doc review-document"><button class="text-button" data-action="review-open-report" data-run="'+c.esc(id)+'">'+c.icon('left',12)+' Back to report</button><div class="review-doc-meta">Frozen evidence · '+c.esc(t.targetHashes.primary)+'</div><h1>'+c.esc(e.label)+'</h1><p>'+c.esc(e.note||'Recorded fixture evidence, not production verification.')+'</p><pre class="review-source">'+c.esc(e.content)+'</pre></article>';
 }
 function openReport(c,id){if(!run(id)?.review?.report)return;c.closeMenu();c.closeDialog();c.state.editorRevealed=true;c.openEditor('review:'+id);}
 E.action('review-open-report',(c,b)=>{if(b.dataset.finding)views.set(b.dataset.run,{mode:'rich'});openReport(c,b.dataset.run);if(b.dataset.finding)requestAnimationFrame(()=>document.querySelector('.review-document [data-finding="'+CSS.escape(b.dataset.finding)+'"]')?.scrollIntoView({block:'center'}));return true;});
 E.action('review-open-evidence',(c,b)=>{c.closeDialog();c.state.editorRevealed=true;c.openEditor('review-evidence:'+b.dataset.run+':'+b.dataset.evidence);return true;});
 E.action('review-report-view',(c,b)=>{views.set(b.dataset.run,{mode:b.dataset.view});c.renderApp();return true;});
 E.action('review-open-todos',(c,b)=>{const r=run(b.dataset.run);if(!r)return true;c.closeDialog();c.switchThread(r.threadId);c.state.editorRevealed=false;Object.assign(c.state.activity,{open:true,pinned:true,domain:'todo',scope:'focus',selected:null});c.renderApp();return true;});
 E.action('review-export-report',(c,b)=>{const a=run(b.dataset.run)?.review?.report;if(!a)return true;const u=URL.createObjectURL(new Blob([markdown(a)],{type:'text/markdown;charset=utf-8'})),link=document.createElement('a');link.href=u;link.download=a.id+'-v1.md';link.click();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;});
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('review:')?(run(c.editorId.slice(7))?.title||'Review'):c.editorId?.startsWith('review-evidence:')?'Review evidence':'');
 E.slot('editorDocument',c=>{if(c.editorId?.startsWith('review:'))return documentHtml(c,c.editorId.slice(7));if(c.editorId?.startsWith('review-evidence:')){const [id,...eid]=c.editorId.slice(16).split(':');return evidenceHtml(c,id,eid.join(':'));}return '';});
 E.chainAction('collab-open-configure',(c,b,e)=>{const old=run(b.dataset.reconfigure);if(old?.review?.report){const el=document.createElement('button');el.dataset.run=old.id;E.run('collab-review-run-again',el,e);return true;}return false;});
 E.chainAction('reset-all',()=>{views.clear();return false;});
 window.PM56_REVIEW={admit,owns,submitPass,normalize,vote,finalize,renderSummary,renderActions,toggleFinding,createSelectedTodos,sendSelected,markdown,openReport};
})();
