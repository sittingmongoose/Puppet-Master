/* Review protocol projection. Uses the existing CollaborativeRun/message store,
 * To-Do owner and editor host. No provider adapter, file writes, or native runtime.
 * Only a supplied immutable target enters this executable concept slice. Recorded
 * demo results enter through the same validated ingress; they are never live AI. */
(function(){
 'use strict';
 const E=window.PM56_EXT,C=window.PM56_COLLAB,T=window.PM56_TODOS;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 const dispositions=['confirmed','rejected','duplicate','uncertain'],severities=['critical','major','minor','suggestion'];
 const ctx=()=>E.ctx(),run=id=>C.run(id),owns=id=>!!run(id)?.review?.protocolVersion;
 const say=(r,type,body,p)=>C.appendMessage(r.id,{senderKind:p?'participant':'coordinator',senderId:p?.id||null,senderName:p?.role||'Review coordinator',messageType:type,body});
 const fail=error=>({ok:false,error});
 const unique=a=>Array.from(new Set(a));
 /* the passes that count: a pass whose reviewer you set aside (Continue with N, A1-34) is kept in the record but never
    merged, voted on or required */
 function activePasses(r){return r.review.passes.filter(a=>a.status!=='waived');}
 function passIsCurrent(r,a){const p=r.participants.find(p=>p.id===a.participantId);return !!(p&&a.status==='completed'&&p.assignmentRevision===a.assignmentRevision&&p.outcome==='completed'&&p.attempts.at(-1)?.attempt_id===a.completionAttemptId);}
 /* IMPACT A1-01: reviewTarget is a recorded example's fixture, never a user field; only a draft flagged recorded
    (PM56_COLLAB.isRecordedDraft) is admitted here. A wand draft's target is draft.reviewTargetChoice (COLLAB). */
 function admit(r,d){
  if(!d||!d.reviewTarget||(C.isRecordedDraft&&!C.isRecordedDraft(d)))return;
  const snapshot=clone(d.reviewTarget);snapshot.frozenAt=new Date().toISOString();const target=freeze(snapshot);
  r.config.autoRepair=false;
  r.review={protocolVersion:1,phase:'independent',targetPack:target,requestedPasses:r.participants.length,roundNumber:1,
   passes:r.participants.map(p=>({id:'review-attempt-'+r.id+'-'+p.id,participantId:p.id,assignmentRevision:p.assignmentRevision,
    epoch:r.stopEpoch,targetHash:target.targetHashes.primary,status:'running',findings:[],
    input:{targetHash:target.targetHashes.primary,evidenceIds:target.evidence.map(e=>e.id),peerFindings:[],peerIdentities:[]}})),
   findings:[],excludedFindings:[],duplicates:[],report:null};
  r.participants.forEach(p=>{p.status='working';p.outcome=null;p.current='Independent inspection of the frozen target';});
  r.expectedOutputs=[{id:'review-report-'+r.id,delivered:false}];
  /* 9.0: a single pass has nobody to be blind to */
  say(r,'message','Took a snapshot of '+target.label+'. '+(r.participants.length===1?'One reviewer reads it in a single pass.':'Each reviewer works alone and can’t see anyone else’s notes.')+(recordedRun(r)?' '+RECORDED_STAMP:''));
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
  p.current='Done reading · '+fs.length+' note'+(fs.length===1?'':'s')+(r.participants.length===1?'':', sealed until everyone is done');
  say(r,'pass',p.current,p);
  return {ok:true,attemptId:a.id};
 }
 function normalize(id){
  const r=run(id);if(!owns(id)||r.status!=='running')return fail('run_not_running');
  if(r.review.phase!=='independent')return {ok:true,reused:true};
  const live=activePasses(r);
  if(!live.length||live.some(a=>a.status!=='completed'))return fail('initial_passes_incomplete');
  if(live.some(a=>!passIsCurrent(r,a)))return fail('stale_assignment');
  const grouped=new Map(),duplicates=[];
  live.forEach(a=>a.findings.forEach(f=>{
   const rawId=a.id+':'+f.id;let dest=grouped.get(f.findingKey);
   if(!dest){dest={...clone(f),id:'finding-'+r.id+'-'+(grouped.size+1),originalFindingIds:[],originatingReviewerIds:[],evidenceRefs:[],reviewerVotes:[],disposition:'uncertain',dissent:null};grouped.set(f.findingKey,dest);}
   else duplicates.push({originalFindingId:rawId,canonicalFindingId:dest.id,participantId:a.participantId,evidenceRefs:clone(f.evidenceRefs)});
   dest.originalFindingIds.push(rawId);dest.originatingReviewerIds=unique([...dest.originatingReviewerIds,a.participantId]);dest.evidenceRefs=unique([...dest.evidenceRefs,...f.evidenceRefs]);
  }));
  r.review.findings=[...grouped.values()];r.review.duplicates=duplicates;
  r.review.phase=live.length===1?'synthesis':'corroboration';
  const notes=live.reduce((n,a)=>n+a.findings.length,0);
  say(r,'message',notes+' note'+(notes===1?'':'s')+' became '+grouped.size+' possible problem'+(grouped.size===1?'':'s')+(duplicates.length?' ('+duplicates.length+(duplicates.length===1?' was':' were')+' the same)':'')+'.');
  return {ok:true,findings:r.review.findings.length,duplicates:duplicates.length};
 }
 function vote(id,participantId,findingId,decision){
  const r=run(id),why=gate(r,decision);if(why)return fail(why);
  if(r.review.phase!=='corroboration'||activePasses(r).length<2)return fail('no_peer_round');
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
  const live=activePasses(r);
  if(live.some(a=>!passIsCurrent(r,a)))return fail('stale_assignment');
  if(!Array.isArray(resolutions)||resolutions.length!==r.review.findings.length)return fail('resolution_coverage');
  const ids=resolutions.map(x=>x.findingId);if(new Set(ids).size!==ids.length)return fail('duplicate_resolution');
  for(const f of r.review.findings){
   const d=resolutions.find(d=>d.findingId===f.id);
   if(!d||!dispositions.includes(d.disposition)||!d.reason)return fail('invalid_resolution');
   if(live.length>1&&f.reviewerVotes.length!==live.length)return fail('peer_round_incomplete');
  }
  r.review.findings.forEach(f=>{
   const d=resolutions.find(d=>d.findingId===f.id);f.disposition=d.disposition;f.adjudication=d.reason;
   const dissent=f.reviewerVotes.filter(v=>v.disposition!==f.disposition);
   f.dissent=dissent.length?dissent.map(v=>r.participants.find(p=>p.id===v.participantId).role+': '+v.reason).join('\n'):null;
  });
  const report=freeze({id:'review-report-'+r.id,kind:'review_report',version:1,runId:r.id,title:r.title,target:clone(r.review.targetPack),
   strategy:r.config.strategy,roundNumber:r.review.roundNumber,reviewers:r.participants.map(p=>({id:p.id,role:p.role,requestedModel:p.requestedModelName,effectiveModel:p.effectiveModelName,persona:p.effectivePersona,
    finished:p.outcome==='completed',setAside:p.outcome==='explicitly_waived'})),
   passes:clone(r.review.passes),findings:clone(r.review.findings),duplicates:clone(r.review.duplicates),coverage:r.review.coverage?clone(r.review.coverage):null,
   /* 8.5 counting rule, the same headline the card and the report show ("2 small things to fix · 1 idea") */
   summary:countLine(buildVM(r).counts)+'.'+(r.review.coverage?' '+coverageLine(r.review.coverage):''),
   authority:'Read-only: nothing was changed. Fixing anything is a separate step you choose.',provenance:recordedRun(r)?PROVENANCE_REPORT:'',createdAt:new Date().toISOString()});
  r.review.resolutionFingerprint=JSON.stringify(resolutions);r.review.report=report;r.review.phase='completed';r.status='completed';r.completedAt=report.createdAt;
  r.expectedOutputs.forEach(o=>{o.delivered=true;});r.artifacts.push(report);
  say(r,'message','Report ready: '+headlineOf(buildVM(r))+'.');
  return {ok:true,artifactId:report.id};
 }
 /* A1-34 Continue with N: only once every reviewer has stopped (finished, failed or set aside) and at least one
    finished. The missing reviewers are set aside with your reason, their passes are kept but never merged, and the
    run goes on through the protocol on the passes that finished (normalize now; the peer round and the report come
    from the same calls as any run). The run is never marked completed here: a report is written by finalize only. */
 function acceptPartial(id){
  const r=run(id);if(!owns(id))return fail('review_unavailable');
  if(!['running','blocked'].includes(r.status))return fail('run_not_running');
  if(r.review.phase!=='independent')return fail('initial_round_closed');
  if(r.participants.some(p=>!p.outcome))return fail('reviewers_still_reading');
  const done=r.review.passes.filter(a=>a.status==='completed'&&passIsCurrent(r,a));
  if(!done.length)return fail('no_finished_pass');
  const missing=r.participants.filter(p=>p.outcome!=='completed'&&p.outcome!=='explicitly_waived');
  const why=missing.some(p=>p.outcome==='timed_out')?'ran out of time':'didn’t finish';
  missing.forEach(p=>C.setOutcome(r.id,p.id,'explicitly_waived',{reason:'You continued with the reviewers who finished.',actor:'user'}));
  r.review.passes.forEach(a=>{if(a.status!=='completed')a.status='waived';});
  r.review.coverage={requested:r.participants.length,finished:done.length,missing:missing.map(p=>p.role),why};
  r.degraded=true;if(r.status==='blocked'){r.status='running';r.blockedReason=null;}
  say(r,'message','You continued with the '+(done.length===1?'reviewer':done.length+' reviewers')+' who finished. '+coverageLine(r.review.coverage));
  return normalize(r.id);
 }
 /* "Only 2 of 3 reviewers finished (Fresh eyes ran out of time)." -- the coverage note of a partial review */
 function coverageLine(c){return c?'Only '+c.finished+' of '+c.requested+' reviewers finished'+(c.missing&&c.missing.length?' ('+c.missing.join(' and ')+' '+(c.why||'didn’t finish')+')':'')+'.':'';}
 function selected(id){return C.selectedFindings(id);}
 function toggleFinding(c,b){const r=run(b.dataset.run),f=r?.review?.findings.find(f=>f.id===b.dataset.finding);if(!f||r.status!=='completed'||f.disposition!=='confirmed'||f.todoId)return true;selected(r.id)[f.id]=!selected(r.id)[f.id];c.renderApp();return true;}
 function createSelectedTodos(c,b){
  const r=run(b.dataset.run);if(!r?.review)return true;
  const sel=selected(r.id),ids=Object.keys(sel).filter(id=>sel[id]);
  const res=T.materializeForReview(r,ids);if(!res.ok){notice.set(r.id,{code:res.error,text:refusalText(res.error)});c.toast('No To-Dos created',refusalText(res.error));c.renderApp();return true;}
  notice.delete(r.id);
  res.items.forEach(x=>{const f=r.review.findings.find(f=>f.id===x.finding_id);f.todoId=x.todo_id;f.convertedToTodo=true;delete sel[f.id];});
  if(res.created)say(r,'request',res.created+' To-Do'+(res.created===1?'':'s')+' created from confirmed findings. Nothing was fixed.');
  c.renderApp();return true;
 }
 /* 8.5 G-33: Send Findings To Agent fills the source chat's EMPTY message box and never sends. The text names what
    to fix in plain words; the lineage (run id, finding ids) is kept beside the draft, never in the text. */
 function sendText(r,fs){
  const trim=t=>String(t||'').trim().replace(/[.\s]+$/,'');
  return 'Please fix these review findings from ‘'+r.title+'’:\n'+fs.map((f,i)=>(i+1)+'. '+trim(f.claim)+'.'+
   (f.proposedRemediation?' Suggested fix: '+trim(f.proposedRemediation)+'.':'')+(f.expectedOutcome?' You’ll know it’s fixed when '+trim(f.expectedOutcome).replace(/^./,x=>x.toLowerCase())+'.':'')).join('\n');
 }
 function sendSelected(c,b){
  const r=run(b.dataset.run);if(!r||r.status!=='completed')return true;
  const fs=r.review.findings.filter(f=>selected(r.id)[f.id]&&f.disposition==='confirmed');
  if(!fs.length){notice.set(r.id,{code:'no_findings_selected',text:refusalText('no_findings_selected')});c.renderApp();return true;}
  const CS=window.PM56_COMPOSER_STATE,buffer=CS?.bufferFor(r.threadId);
  const existing=(buffer&&buffer.text)||c.state.drafts?.[r.threadId]||(c.state.selectedThread===r.threadId?c.state.composer:'');
  // Explicitly target the source thread; never send or overwrite another draft (9.3 G-33 refusal, shown on the card).
  if(String(existing||'').trim()){notice.set(r.id,{code:'composer_not_empty',text:'Your message box already has text. Send or clear it first.'});c.toast('Nothing was added','Your message box already has text. Send or clear it first.');c.renderApp();return true;}
  notice.delete(r.id);
  const text=sendText(r,fs);lineage.set(r.threadId,{runId:r.id,findingIds:fs.map(f=>f.id),at:new Date().toISOString()});
  c.switchThread(r.threadId);window.PM56_RUNTIME.composer.destination=null;
  c.state.composer=text;c.state.drafts[r.threadId]=text;if(buffer){buffer.text=text;buffer.destination=null;}
  c.closeDialog();c.state.editorRevealed=false;c.renderApp();return true;
 }
 function renderSummary(c,r){
  const v=r.review,done=v.passes.filter(p=>p.status==='completed').length;
  return '<div class="review-compact"><div class="review-status-line"><strong>'+c.esc(v.report?v.report.summary:({independent:'Independent review',corroboration:'Comparing findings',synthesis:'Preparing report'}[v.phase]||v.phase))+'</strong><span>'+done+'/'+v.passes.length+' reviewers</span></div><div class="review-caption">'+c.esc(v.targetPack.label)+' · read-only</div>'+(v.report?'<button class="text-button" data-action="review-open-report" data-run="'+c.esc(r.id)+'">'+c.icon('document',12)+' Open report · V1</button>':'')+'</div>';
 }
 function renderActions(c,r){return '<div class="review-action-row">'+(window.PM56_REVIEW_DEMOS?.controls(c,r)||'')+(r.review.report?'<button class="soft-button" data-action="review-open-report" data-run="'+c.esc(r.id)+'">Open report</button>':'')+'<button class="soft-button" data-action="collab-review-run-again" data-run="'+c.esc(r.id)+'">Run another review…</button></div>';}
 /* The Plain text view and the Export (REVIEW-B's view reads both from here, so they never differ): the report in
    the report's own words (9.0; DON'T 18/22): the 8.5 count line, reviewers by name and model, findings by number with
    their proof by label and who found them by name. Engine ids, the report version and the snapshot hash go to one
    closing "Technical details" section. b10 anchors kept: '## Agreement matrix' (multi only), every dissent reason,
    the frozen hash, every claim. */
 function markdown(report){
  const t=report.target||{},evid=id=>((t.evidence||[]).find(e=>e.id===id)||{}).label||id;
  const who=new Map((report.reviewers||[]).map(p=>[p.id,p.role||p.id]));
  const nameOf=id=>who.get(id)||'A reviewer';
  const list=a=>a.length<3?a.join(' and '):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
  const single=(report.reviewers||[]).length<2||report.strategy==='single_agent';
  const trim=x=>String(x||'').trim().replace(/[.\s]+$/,'');
  const kindOf=f=>f.disposition==='confirmed'&&f.severity!=='suggestion'&&(f.evidenceRefs||[]).length?0:f.disposition==='uncertain'&&f.severity!=='suggestion'?10:f.severity==='suggestion'&&f.disposition!=='rejected'&&f.disposition!=='duplicate'?20:30;
  const fs=(report.findings||[]).slice().sort((a,b)=>(kindOf(a)+(SEV_RANK[a.severity]||0))-(kindOf(b)+(SEV_RANK[b.severity]||0)));
  const num=new Map(fs.map((f,i)=>[f.id,i+1]));
  const word=d=>DISP[d]||'Unsure',sev=v=>({critical:'Critical',major:'Major',minor:'Minor',suggestion:'Suggestion'}[v]||'Minor');
  const out=['# '+report.title,'',report.summary+(report.provenance?'\n'+report.provenance:''),'',report.authority,'',
   '## What was reviewed','A snapshot of '+(t.label||'the work')+'. '+(single?'The reviewer':'Every reviewer')+' read that exact version.','',
   '## Reviewers',(report.reviewers||[]).map(p=>'- '+[p.role,p.effectiveModel,p.persona].filter(Boolean).join(' · ')+(p.setAside?' · didn’t finish, set aside':'')).join('\n'),'',
   '## Findings',fs.length?fs.map((f,i)=>{
    const by=(f.originatingReviewerIds||[]).map(nameOf);
    return ['### '+(i+1)+'. '+f.claim+'\n'+[sev(f.severity),word(f.disposition),by.length?'Found by '+list(by):''].filter(Boolean).join(' · '),
     f.adjudication||'',
     [f.proposedRemediation?'Suggested fix: '+trim(f.proposedRemediation)+'.':'',f.expectedOutcome?'You’ll know it’s fixed when '+trim(f.expectedOutcome).replace(/^./,x=>x.toLowerCase())+'.':'',
      (f.evidenceRefs||[]).length?'Proof: '+f.evidenceRefs.map(evid).join('; '):''].filter(Boolean).join('\n'),
     f.dissent?'Not everyone agreed:\n'+String(f.dissent).split('\n').map(x=>'- '+x).join('\n'):''].filter(Boolean).join('\n\n');
   }).join('\n\n'):'No problems found.'];
  const dups=report.duplicates||[];
  if(dups.length){
   const noteOf=d=>{const a=(report.passes||[]).find(a=>d.originalFindingId.indexOf(a.id+':')===0),f=a&&(a.findings||[]).find(f=>a.id+':'+f.id===d.originalFindingId);return f?f.claim:'';};
   out.push('','## Notes that were the same',dups.map(d=>{const n=nameOf(d.participantId),c=noteOf(d);return '- '+n+(/s$/i.test(n)?'’':'’s')+' note'+(c?' “'+c+'”':'')+' is the same as finding '+(num.get(d.canonicalFindingId)||'')+'.';}).join('\n'));
  }
  if(!single)out.push('','## Agreement matrix',fs.map(f=>num.get(f.id)+'. '+f.claim+'\n'+((f.reviewerVotes||[]).length?f.reviewerVotes.map(v=>'- '+nameOf(v.participantId)+': '+word(v.disposition)+' · '+v.reason).join('\n'):'- Not compared.')).join('\n\n'));
  else out.push('','One reviewer, so nothing was double-checked.');
  out.push('','## Technical details','Report V'+report.version+' · '+report.id,'Snapshot '+((t.targetHashes&&t.targetHashes.primary)||''),
   'Reviewers: '+(report.reviewers||[]).map(p=>p.role+' = '+p.id).join(', '),
   fs.map(f=>'Finding '+num.get(f.id)+' = '+f.id+' · evidence '+(f.evidenceRefs||[]).join(', ')+' · found by '+(f.originatingReviewerIds||[]).join(', ')).join('\n')+
   (dups.length?'\n'+dups.map(d=>'Same note: '+d.originalFindingId+' = '+d.canonicalFindingId).join('\n'):''));
  return out.join('\n')+'\n';
 }
 /* =====================================================================================================
    PRESENTATION (REVIEW-A, DESIGN-SPEC 8.5 on the 8.0 KIND INTERFACE). Nothing below changes the protocol
    record except the three card decisions at the end (Retry, Continue with 2, Finish on the old snapshot),
    which go through PM56_COLLAB's own participant API. Everything is drawn with PM56_SHELL builders.
      cardVM(run)                   the card's view model: its live phases (reading, comparing, partial, target
                                    changed ...) for protocol runs and legacy/seed run.review alike. The finished
                                    board reads REVIEW-B's ReviewReportVM (PM56_REVIEW.reportVM, review-view.js, the
                                    one protocol adapter of IMPACT A1-50) when it is loaded, so the card and the
                                    report never disagree; cardVM's own findings are the fallback (legacy seeds, or
                                    a build without review-view.js)
      sheetParts(draft, ctx, generic)  the Review sheet (8.5 sheet), over COLLAB's generic parts
      cardParts(run, ctx, face)     the Review card parts (8.5 in chat; the proto-src/40-collab.js C.card contract)
    ===================================================================================================== */
 const SH=()=>window.PM56_SHELL,PX=()=>window.PM56_PMX;
 const H=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const RECORDED_STAMP='Recorded example · no AI cost';
 const PROVENANCE_REPORT='Example report: no AI was contacted.';
 /* IMPACT A3-03: every recorded stamp reads the one provenance predicate */
 function recordedRun(r){try{return !!(r&&C.provenance&&C.provenance(r.id)==='recorded');}catch(e){return false;}}
 const notice=new Map(),lineage=new Map(),preticked=new Set();
 /* 9.3: To-Do owner codes -> sentences (the code stays in data-failure) */
 function refusalText(code){const t=SH()?.pmxRefusalText?.(code);return t?((t.strong?t.strong+' ':'')+t.text):({review_not_completed:'The review has to finish first.',no_findings_selected:'Tick at least one finding.',confirmed_evidenced_findings_only:'Only confirmed findings with proof can become To-Dos.'}[code]||'Nothing was created.');}
 const SEV_RANK={critical:0,major:1,minor:2,suggestion:3};
 const DISP={confirmed:'Confirmed',uncertain:'Unsure',unsure:'Unsure',rejected:'Rejected',duplicate:'Duplicate'};
 const STOPS=['Snapshot','Reading on their own','Comparing notes','Writing the report'];
 const clockOf=ms=>SH()?.pmxTime?SH().pmxTime.clock(ms):'';
 const workedOf=ms=>SH()?.pmxTime?SH().pmxTime.worked(ms):'';
 const atOf=iso=>SH()?.pmxTime?SH().pmxTime.at(iso,null,{day:false}):'';
 const msSince=iso=>{const t=Date.parse(iso||'');return isFinite(t)?Math.max(0,Date.now()-t):null;};
 const plural=(n,w,ws)=>n+' '+(n===1?w:(ws||w+'s'));
 const joinNames=a=>a.length<3?a.join(' and '):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
 function shortTarget(t){
  const ref=String((t&&t.targetRefs&&t.targetRefs[0])||'').replace(/^fixture:/,'').replace(/#.*$/,'');
  const file=/[\w.-]+\.[a-z]{1,5}$/i.exec(ref.trim());
  return file?file[0]:(t&&t.label)||ref||'the snapshot';
 }
 function voteOf(d){return d==='confirmed'?'agree':d==='rejected'?'disagree':'unsure';}
 function viewIsOpen(id){try{return !!(PX()&&PX().viewOpen&&PX().viewOpen(id));}catch(e){return false;}}

 /* ---- the card VM. Fields (all text unescaped; renderers escape):
    {runId, title, population:'protocol'|'legacy', recorded, provenanceLine, multi, status, phase,
     target:{label, file, kind, hash, frozenAt, time, refs, evidence:[{id,label}]},
     reviewers:[{pid, name, seat, persona, model, requested, state, notes, done, outcome}],
     findings:[{id, n, claim, severity, disposition, dispWord, suggestion, toFix, unsure, idea, votes:[{seat,vote}],
                agreeWords, why, fix, expected, evidence:[ids], dissent, todoId, selectable, selected, cls}],
     excluded:[{id, claim, reason, hash, frozenHash, cls}], agreement:{rows:[{findingId, claim, severity, votes}]}|null,
     counts:{toFix, unsure, ideas, smallOnly, notes, duplicates, checked}, headline, receiptHeadline,
     readOnly:{text, cls}, followOns:{runId, selectedIds, createCount, todos, canAct, notice},
     partial:{done, of, missing:[names], why}|null, stale:{file, chosen}|null, degraded:bool,
     usage:{costUsd, limitUsd, workedMs, startedAt, completedAt}, hasReport, cls:{...hook classes}} ---- */
 function buildVM(r){
  const v=r.review||{},protocol=!!v.protocolVersion,parts=r.participants||[];
  const multi=((r.config&&r.config.strategy)||'multi_pass')!=='single_agent'&&parts.length>1;
  const passes=v.passes||[];
  const reviewers=parts.map((p,i)=>{
   const pass=passes.find(a=>a.participantId===p.id);
   const done=pass?pass.status==='completed':(p.outcome==='completed'||p.status==='done');
   const waived=p.outcome==='explicitly_waived',failed=!waived&&(!!(p.outcome&&p.outcome!=='completed')||p.status==='failed');
   /* a retried reviewer is "trying again" only while its newest attempt is the retry and has no outcome yet: its next
      participant event (it finishes or fails again) ends it, so the card never sticks on the retrying face */
   const last=(p.attempts||[]).at(-1)||{},retrying=!p.outcome&&last.reason==='retry'&&last.outcome==='in_flight';
   return {pid:p.id,name:p.role||('Reviewer '+(i+1)),seat:(i%8)+1,persona:p.effectivePersona||p.persona||'Reviewer',model:p.effectiveModelName||p.requestedModelName||'',
    requested:p.requestedModelName||'',notes:pass?pass.findings.length:0,done:done&&!failed&&!waived,outcome:p.outcome||null,waived,retrying,
    state:waived?'waived':failed?'failed':done?'done':(r.status==='running'||r.status==='blocked'?'working':'queued')};
  });
  /* the reviewers whose notes count: one you set aside (Continue with N) has no vote and no seat in the agreement */
  const voters=reviewers.filter(x=>!x.waived),compared=multi&&voters.length>1;
  const sel=C.selectedFindings?C.selectedFindings(r.id):{};
  const completed=r.status==='completed';
  let findings=(v.findings||[]).map(f=>{
   const disposition=f.disposition==='unsure'?'uncertain':(f.disposition||'uncertain'),suggestion=f.severity==='suggestion';
   const origin=(f.originatingReviewerIds||[]);
   const votes=compared?voters.map(rv=>{const ri=reviewers.indexOf(rv),vt=(f.reviewerVotes||[]).find(x=>x.participantId===rv.pid||x.reviewerIndex===ri);
    return {seat:rv.seat,vote:vt?voteOf(vt.disposition):origin.some(o=>o===rv.pid||o===ri)?'agree':'unsure'};}):[];
   const ag=agreeOf(votes);
   const toFix=disposition==='confirmed'&&!suggestion&&!!(f.evidenceRefs||[]).length;
   return {id:f.id,claim:f.claim||'',severity:SEV_RANK[f.severity]!=null?f.severity:'minor',disposition,dispWord:DISP[disposition]||'Unsure',suggestion,toFix,
    unsure:disposition==='uncertain'&&!suggestion,idea:suggestion&&disposition!=='rejected'&&disposition!=='duplicate',votes,agreeWords:ag.short,agreeHead:ag.head,agreeTail:ag.tail,agreeLong:ag.long,
    why:f.adjudication||'',fix:f.proposedRemediation||'',expected:f.expectedOutcome||'',evidence:(f.evidenceRefs||[]).slice(),dissent:f.dissent||null,
    todoId:f.todoId||null,selectable:completed&&toFix&&!f.todoId,selected:!!sel[f.id]&&!f.todoId,cls:'collab-finding'};
  });
  const order=f=>(f.toFix?0:f.unsure?10:f.idea?20:30)+SEV_RANK[f.severity];
  findings.sort((a,b)=>order(a)-order(b));findings.forEach((f,i)=>{f.n=i+1;});
  const toFix=findings.filter(f=>f.toFix),counts={toFix:toFix.length,unsure:findings.filter(f=>f.unsure).length,ideas:findings.filter(f=>f.idea).length,
   smallOnly:toFix.length>0&&toFix.every(f=>f.severity==='minor'),notes:passes.reduce((n,a)=>n+(a.findings||[]).length,0),duplicates:(v.duplicates||[]).length,
   checked:findings.filter(f=>f.votes.length&&f.votes.length===(v.findings||[]).find(x=>x.id===f.id)?.reviewerVotes?.length).length};
  const t=v.targetPack||{};
  const blocked=r.status==='blocked'&&/partial/i.test(String(r.blockedReason||''));
  const failedRv=reviewers.filter(x=>x.state==='failed'),going=reviewers.filter(x=>x.state==='working'||x.state==='queued'),again=reviewers.filter(x=>x.retrying);
  const ended=completed||r.status==='canceled'||r.status==='cancelled';
  /* A1-34: the partial decision comes only once every reviewer has stopped (finished, failed or set aside) and none
     is trying again; a reviewer failing while the others read shows on its own lane and the live face stays */
  const partial=!ended&&!again.length&&(blocked||(failedRv.length&&!going.length))?{done:reviewers.filter(x=>x.done).length,of:reviewers.length,
   missing:failedRv.map(x=>x.name),why:failedRv.some(x=>x.outcome==='timed_out')?'ran out of time':'didn’t finish'}:null;
  const retrying=!ended&&!partial&&again.length&&going.every(x=>x.retrying)?again.map(x=>x.name):null;
  const st=v.staleTarget&&!v.staleTarget.chosen&&r.status==='running'?{file:shortTarget(t),chosen:null}:null;
  const phase=r.status==='canceled'||r.status==='cancelled'?'cancelled':r.status==='paused'?'paused':r.status==='failed'?'failed':completed?'done':
   partial?'partial':retrying?'retrying':st?'stale':!protocol&&r.status==='running'&&C.provenance&&C.provenance(r.id)==='wand'?'waiting':
   !protocol?(r.status==='running'?'reading':'waiting'):v.phase==='independent'?(passes.some(a=>a.status==='completed')||failedRv.length||again.length?'reading':'snapshot'):
   v.phase==='corroboration'?((v.findings||[]).every(f=>(f.reviewerVotes||[]).length===parts.length)?'writing':'comparing'):v.phase==='synthesis'?'writing':'done';
  const headline=headlineOf({counts,findings});
  const vm={runId:r.id,title:r.title||'Review',population:protocol?'protocol':'legacy',recorded:recordedRun(r),multi,compared,voters,retrying,status:r.status,phase,
   provenanceLine:recordedRun(r)?PROVENANCE_REPORT:'',
   target:{label:t.label||(t.targetRefs&&t.targetRefs[0])||'the work',file:shortTarget(t),kind:t.targetKind||'',hash:(t.targetHashes&&t.targetHashes.primary)||'',
    frozenAt:t.frozenAt||null,time:atOf(t.frozenAt),refs:(t.targetRefs||[]).slice(),evidence:(t.evidence||[]).map(e=>({id:e.id,label:e.label}))},
   reviewers,findings,counts,headline,receiptHeadline:receiptOf(counts),
   excluded:(v.excludedFindings||[]).map(x=>({id:x.id||'excluded',claim:x.claim||(x.payload&&x.payload.findings&&x.payload.findings[0]&&x.payload.findings[0].claim)||'',
    reason:'this reviewer saw an older version of the file',hash:x.targetHash||(x.payload&&x.payload.targetHash)||'',frozenHash:(t.targetHashes&&t.targetHashes.primary)||'',cls:'collab-finding collab-excluded'})),
   agreement:compared?{rows:findings.map(f=>({findingId:f.id,claim:f.claim,severity:f.severity,votes:f.votes}))}:null,
   readOnly:{text:'Review never changes your files and never auto-repairs.',cls:'collab-readonly-note'},
   followOns:{runId:r.id,selectedIds:findings.filter(f=>f.selected).map(f=>f.id),createCount:findings.filter(f=>f.selected&&f.selectable).length,
    todos:findings.filter(f=>f.todoId).map(f=>({findingId:f.id,n:f.n,todoId:f.todoId})),canAct:completed,notice:notice.get(r.id)||null},
   partial,stale:st,degraded:!!r.degraded,coverage:v.coverage||null,
   usage:{costUsd:(r.usage&&r.usage.costUsd)||0,limitUsd:(r.config&&r.config.costLimitUsd)||null,startedAt:r.createdAt||null,completedAt:r.completedAt||null,
    workedMs:r.completedAt&&r.createdAt?Math.max(0,Date.parse(r.completedAt)-Date.parse(r.createdAt)):msSince(r.createdAt)},
   hasReport:!!(v.report||(!protocol&&(r.artifacts||[]).some(a=>a.kind==='review_report'))),
   cls:{document:'review-document',finding:'collab-finding',excluded:'collab-excluded',targetpack:'collab-targetpack',readonly:'collab-readonly-note',markdown:'review-markdown',source:'review-source'}};
  return vm;
 }
 /* 8.5 counting rule: "N to fix" = confirmed Critical/Major/Minor with proof ("N small things to fix" when all Minor);
    "N unsure"; Suggestions are "N ideas"; nothing to fix is a success */
 function countLine(c){
  const out=[];
  if(c.toFix)out.push(c.smallOnly?plural(c.toFix,'small thing')+' to fix':c.toFix+' to fix');
  if(c.unsure)out.push(c.unsure+' unsure');
  if(c.ideas)out.push(plural(c.ideas,'idea'));
  return out.length?out.join(' · '):'No problems found';
 }
 function headlineOf(vm){return countLine(vm.counts)+' · nothing was changed';}
 /* agreement words (8.5, 9.0): the short form rides the finding's meta line ("2 of 3 agree · 1 unsure"), the long
    sentence is its hover card. Counts are of the reviewers whose notes count. */
 function agreeOf(votes){
  const N=votes.length;if(!N)return {short:'',head:'',tail:'',long:''};
  const a=votes.filter(x=>x.vote==='agree').length,d=votes.filter(x=>x.vote==='disagree').length,u=N-a-d;
  const all=N===2?'both':'all '+N;
  if(a===N)return {short:all+' agree',head:all+' agree',tail:'',long:(N===2?'Both':'All '+N)+' reviewers agree.'};
  if(d===N)return {short:all+' disagree',head:all+' disagree',tail:'',long:(N===2?'Both':'All '+N)+' reviewers disagree.'};
  const sh=[a?a+' of '+N+' agree':'',d?d+' disagreed':'',u?(u===N?'all '+N+' unsure':u+' unsure'):''].filter(Boolean);
  /* head = the first clause, tail = the rest: below 360 px the tail drops (the dots show it) */
  const lg=[a?a+' of the '+N+' reviewers agree':'',d?d+' disagreed':'',u?(u===N?'none of the '+N+' reviewers is sure':u+(u===1?' wasn’t sure':' weren’t sure')):''].filter(Boolean);
  const t=lg.join('; ');return {short:sh.join(' · '),head:sh[0],tail:sh.slice(1).join(' · '),long:t.charAt(0).toUpperCase()+t.slice(1)+'.'};
 }
 /* the receipt keeps the short form (9.0: <= 40 characters; R-21 leaves the headline ~150 px at 417) */
 function receiptOf(c){
  const out=[];if(c.toFix)out.push(c.toFix+' to fix');if(c.unsure)out.push(c.unsure+' unsure');if(c.ideas)out.push(plural(c.ideas,'idea'));
  return out.length?out.join(', '):'No problems found';
 }
 /* pre-ticked = exactly the "to fix" set, once per run (8.5); a tick the user already set or cleared is theirs */
 function pretick(r,vm){
  if(!vm.followOns.canAct||preticked.has(r.id))return;preticked.add(r.id);
  const sel=C.selectedFindings(r.id);vm.findings.forEach(f=>{if(f.selectable&&sel[f.id]===undefined)sel[f.id]=true;f.selected=!!sel[f.id]&&!f.todoId;});
  vm.followOns.selectedIds=vm.findings.filter(f=>f.selected).map(f=>f.id);vm.followOns.createCount=vm.findings.filter(f=>f.selected&&f.selectable).length;
 }
 /* the finished board from REVIEW-B's ReviewReportVM (one adapter, A1-50) when review-view.js is loaded: same
    findings, order, words, counts and ticks as the report; mapped onto the card VM's field names */
 function withReport(r,vm){
  const RV=window.PM56_REVIEW&&window.PM56_REVIEW.reportVM;
  if(typeof RV!=='function'||vm.population!=='protocol'||r.status!=='completed')return vm;
  let b=null;try{b=RV(r);}catch(e){b=null;}
  if(!b||!Array.isArray(b.findings)||!b.counts)return vm;
  const sel=C.selectedFindings(r.id);
  vm.findings=b.findings.map(f=>{const votes=vm.compared?(f.votes||[]):[],ag=agreeOf(votes);return {id:f.id,n:f.n,claim:f.claim||'',severity:f.severity,disposition:f.disposition,dispWord:f.dispWord,suggestion:f.severity==='suggestion',
   toFix:!!f.toFix,unsure:!f.toFix&&!f.idea&&(f.disposition==='uncertain'||f.disposition==='unsure'),idea:!!f.idea,votes,agreeWords:ag.short,agreeHead:ag.head,agreeTail:ag.tail,agreeLong:ag.long,
   why:f.why||'',fix:f.fix||'',expected:f.expected||'',todoId:f.todoId||null,selectable:!!f.canTick&&!f.todoId,selected:!!sel[f.id]&&!f.todoId,cls:'collab-finding'};});
  vm.counts=Object.assign({},vm.counts,{toFix:b.counts.toFix,unsure:b.counts.unsure,ideas:b.counts.ideas,smallOnly:!!b.counts.allMinor});
  vm.headline=headlineOf(vm);vm.receiptHeadline=receiptOf(vm.counts);
  vm.followOns.todos=vm.findings.filter(f=>f.todoId).map(f=>({findingId:f.id,n:f.n,todoId:f.todoId}));
  vm.followOns.selectedIds=vm.findings.filter(f=>f.selected).map(f=>f.id);vm.followOns.createCount=vm.findings.filter(f=>f.selected&&f.selectable).length;
  return vm;
 }
 function cardVM(r){const vm=buildVM(r);pretick(r,vm);return withReport(r,vm);}

 /* ---------------------------------------------------------------- the sheet (8.5) */
 const TARGET_READ={changes:'your latest changes',answer:'the last answer',run:'the last agent run',plan:'the Plan',files:'the file changes',artifacts:'the artifacts',task:'the task result'};
 const FOCUS=[['bugs','Bugs','Wrong results, crashes'],['security','Security','Leaks, unsafe input'],['speed','Speed','Slow paths, wasted work'],['read','Easy to read','Confusing or tangled code'],['tests','Tests','Missing or weak tests'],['any','Anything','Whatever looks wrong']];
 const GIVE=[['plan','The plan'],['changes','The changes'],['tests','Test results'],['rules','Your rules']];
 const openedTarget=new WeakMap();
 /* Owner answer E-37 (A, 2026-09-27): Review's "Start from a team", handed to COLLAB as roster.recipes (KIND
    INTERFACE; COLLAB's menu and applyRecipe honour a kind's array: rows are [job, persona, model], config sets the
    strategy and COLLAB re-normalises). A different model on every row, so no preset raises the "Same model as" note. */
 const TEAMS=[
  {value:'careful',label:'Careful review',description:'Security, Bugs and Tests (3 reviewers)',config:{strategy:'multi_pass'},
   rows:[['Security','Reviewer','sonnet46'],['Bugs','Reviewer','opus5'],['Tests','Reviewer','gpt53']]},
  {value:'quick',label:'Quick check',description:'One reviewer',config:{strategy:'single_agent'},
   rows:[['Bugs','Reviewer','opus5']]},
  {value:'deep',label:'Deep audit',description:'5 reviewers, one of them a Critical Advisor',config:{strategy:'multi_pass'},
   rows:[['Security','Reviewer','sonnet46'],['Bugs','Reviewer','opus5'],['Tests','Reviewer','gpt53'],['Speed','Reviewer','glm52'],['Fresh eyes','Critical Advisor','kimi-k3']]}];
 function lastTimeOf(old){
  const vm=buildVM(old);if(old.status!=='completed')return '';
  return vm.receiptHeadline.replace(/^No problems found$/,'no problems found')+(atOf(old.completedAt)?' ('+atOf(old.completedAt)+')':'');
 }
 function sheetParts(d,ctx,gen){
  if(!d||d.kind!=='review'||d.autoMode)return undefined;
  const S=SH(),n=d.rows.length,single=d.config.strategy==='single_agent'||n===1,cfg=d.config;
  const limit=Number(cfg.costLimitUsd||5),recorded=C.isRecordedDraft?C.isRecordedDraft(d):false;
  const strat=((C.choices?C.choices().strategy:null)||{options:[]}).options.find(o=>o.value===cfg.strategy)||{label:single?'Single Agent':'Multi-Pass Review',small:single?'One fresh reviewer':'Check alone, then compare'};
  const read=TARGET_READ[d.reviewTargetChoice]||'the work';
  const ink=(k,t)=>PX()&&PX().ink?PX().ink(k,t):H(t);
  const old=d.rerunOf&&run(d.rerunOf),last=old?lastTimeOf(old):'';
  /* G-30 MOD-15: the target changed while the sheet was open (its size line moved under the same choice) */
  const trig=gen&&gen.hero&&gen.hero.before||'';
  const seen=openedTarget.get(d);
  if(!seen||seen.value!==d.reviewTargetChoice)openedTarget.set(d,{value:d.reviewTargetChoice,html:trig});
  const changed=!!(seen&&seen.value===d.reviewTargetChoice&&seen.html!==trig);
  const count=S.pmxStepper({key:'step-reviewers',input:{key:'cfg-reviewerCount',attrs:'data-collab-input="cfg-reviewerCount"'},value:n,min:1,max:8,cells:false,unit:n===1?'reviewer':'reviewers',affects:'count'});
  const stratBtn=S.pickerButton({action:'collab-pick-choice',anchor:'collab-choice-strategy',strong:H(strat.label),small:H(strat.small||''),extra:'data-field="strategy" data-menu-title="Review approach"'});
  const focus='<div class="pmx-collab-focus">'+FOCUS.map(x=>S.pmxCheck({key:'focus-'+x[0],attrs:'data-collab-input="focus-'+x[0]+'"',checked:!!(d.reviewFocus||{})[x[0]],label:x[1],helper:x[2]})).join('')+'</div>'+
   '<div class="pmx-collab-give"><span class="pmx-ctl-label">Also give them</span>'+S.pmxWords({key:'give',action:'collab-review-give',label:'Also give them',
    items:GIVE.map(g=>({value:g[0],label:g[1],on:!!(cfg.alsoGive||{})[g[0]],attrs:g[0]==='rules'?'data-hover-key="collab-give-rules" data-hover-tip="Your rules = the rules you taught Puppet Master."':''}))})+'</div>';
  const rangeBad=n<1||n>8;
  const parts={
   title:old?'Run another Review':'Set up a Review',
   lead:'Fresh AI reviewers check the work and list problems. They never change anything; you decide what to fix.'+(last?' Last time: '+H(last)+'.':''),
   hero:Object.assign({},gen&&gen.hero||{},{n:1,title:'What should they review?',helper:'We take a snapshot when you press Start. Every reviewer sees that exact version, even if you keep working.',
    placeholder:'Anything specific? e.g. Does search still handle padded queries?',
    before:changed?trig.replace('</div>','<span class="pmx-fine pmx-review-changed" data-k="rv-changed">'+S.pmxGlyph('swap',12)+'Changed since you opened this</span></div>'):trig}),
   whoTitle:'Who reviews',whoMeta:'<span data-k="cnt:'+n+'">'+plural(n,'reviewer')+'</span> · up to 8',whoAffects:'count',
   rosterCols:[{label:'Looks for',helper:'What it checks',hover:'What this reviewer checks. Each focus goes into a reviewer’s job.'},
    {label:'AI model',helper:'Different models notice different things',hover:'Which AI reviews, and which of your accounts pays for it. Different models notice different things.'},
    {label:'Persona',helper:'How it works (checks, doubts…)',hover:'How this reviewer works: Reviewer checks, Critical Advisor doubts.'}],
   roster:{recipes:TEAMS,addLabel:'Add a reviewer'},
   rowExtras:(row,i)=>{if(!i)return {};for(let k=0;k<i;k++)if(d.rows[k].requestedModelId===row.requestedModelId){const who=d.rows[k].role||('reviewer '+(k+1));
    return {note:'Same model as '+H(who)+', in its own fresh session, so it can’t see '+H(who)+(/s$/i.test(who)?'’':'’s')+' notes.'};}return {};},
   plate:C.sheet&&C.sheet.plateParts&&C.sheet.plateParts.review?C.sheet.plateParts.review(d):gen&&gen.plate,
   shelf:null,
   howN:3,howTitle:'<span data-hover-key="collab-focus" data-hover-tip="Each focus goes into a reviewer’s job.">What should they look for?</span>',howAffects:'focus',howHtml:focus,
   sideExtra:S.pmxQuestion({key:'q-count',n:4,title:'How many reviewers?',helper:'Set it to 1 for a Single Agent review.',affects:'count',body:'<div class="pmx-collab-count">'+count+stratBtn+'</div>'}),
   promises:[
    single?{key:'pr-blind',glyph:'eye-off',strong:'A single pass:',text:'one reviewer, so nothing is double-checked.',part:'blind'}
     :{key:'pr-blind',glyph:'eye-off',strong:'They check alone first:',text:'no one sees another’s notes early.',part:'blind',attrs:' data-hover-key="rv-blind" data-hover-tip="No reviewer sees another’s notes until everyone is done."'},
    /* IMPACT A2-19: the disabled Auto-repair checkbox exists only for the harness (collaboration-verify); pmxPromise
       clips it inside its data-pmx-harness span */
    {key:'pr-ro',glyph:'lock',strong:'Review never changes your files.',text:'You decide what to fix.',
     harness:'<label class="collab-checkbox-row"><input type="checkbox" disabled> Auto-repair: permanently off. Review never changes your files</label>'},
    {key:'pr-fresh',glyph:'check',strong:'Fresh eyes:',text:'reviewers don’t see how the work was made.'}],
   advanced:{summary:'Stops after '+(cfg.timeLimitMinutes||30)+' min or $'+limit.toFixed(2)+' · file and line cited',
    /* A1-53: Technical details names the command the primary sends; a re-run is cmd.review.run_again (8.15) */
    rows:String(gen&&gen.advanced&&gen.advanced.rows||'').replace(old?'<code>cmd.collaboration.start</code>':'\u0000','<code>cmd.review.run_again</code>')},
   readback:single
    ?[{part:'count',html:'<b>'+ink('rb:rev:n','1 reviewer')+'</b> reads a locked snapshot of '},{part:'target',html:'<b>'+ink('rb:rev:t',read)+'</b> in a single pass. <b>Nothing is changed.</b>'}]
    :[{part:'count',html:'<b>'+ink('rb:rev:n',plural(n,'reviewer'))+'</b> read a locked snapshot of '},{part:'target',html:'<b>'+ink('rb:rev:t',read)+'</b> '},{part:'blind',html:'on their own, then compare notes. <b>Nothing is changed.</b>'}],
   estimate:recorded?{recorded:true}:{text:(single?'Usually under a minute':'About 3–8 min')+' · stops at $'+limit.toFixed(2)+' · an estimate, not a promise'},
   primaryLabel:old?'Run Another Review':'Start Review · <span data-k="pc:'+n+'">'+plural(n,'reviewer')+'</span>',
   /* E-03 (B): an offline chosen model blocks Start until replaced; COLLAB's offlineReason overrides the primary
      state after the kind's parts. Review also keeps any block the generic parts raise instead of masking it */
   primaryDisabled:rangeBad||!!(gen&&gen.primaryDisabled),primaryReason:rangeBad?'Review needs 1 to 8 reviewers.':(gen&&gen.primaryDisabled&&gen.primaryReason)||''
  };
  return parts;
 }

 /* ---------------------------------------------------------------- the card (8.5 in chat) */
 /* cardParts(run, ctx, face) -> the proto-src/40-collab.js C.card contract, with the 8.0 names:
    {kindWord, openAction, openAttrs, screens, cluster:[html|'|'], clusterMini:[html], clusterRoles:[{role,seat,state}], clock,
     density (the face this run would take by itself), sentence:{status,word,reason}, decision (pmxDecision args)|null,
     track:{stops,nowText}, board (html)|'', lanes (html)|'', meta:[html], recorded, actions:[{action,label,attrs,primary,disabled}],
     pointer (text)|'', more:[{action,label,attrs,disabled,reason}], result (html)|'', receipt:{headline,glyph,time,cost,recorded},
     technical (html), waitingNoun, progressNoun, notice:{code,text}|null}
    Every string is HTML (escaped here). Every button carries data-run. */
 const WAIT_NOUN='the snapshot hasn’t been taken';
 function naturalFace(vm){
  return {waiting:'waiting',snapshot:'live',reading:'live',comparing:'live',writing:'live',retrying:'live',partial:'attention',stale:'attention',
   done:'result',cancelled:'failed',failed:'failed',paused:'live'}[vm.phase]||'live';
 }
 function cardParts(r,ctx,face){
  if(!r||r.kind!=='review')return undefined;
  const S=SH(),vm=cardVM(r),id=H(r.id),R='data-run="'+id+'"',live=['snapshot','reading','comparing','writing','retrying'].includes(vm.phase);
  face=face||naturalFace(vm);
  const screens=vm.multi&&(vm.phase==='snapshot'||vm.phase==='reading');
  const mState=rv=>vm.phase==='waiting'?'queued':rv.state==='failed'?'failed':rv.state==='waived'?'idle':rv.state==='done'||vm.phase==='done'?'done':live?'working':'idle';
  const cluster=[],clusterMini=[];
  vm.reviewers.forEach((rv,i)=>{if(i&&screens)cluster.push('|');cluster.push(S.pmxMark({role:rv.persona,seat:rv.seat,size:18,state:mState(rv)}));clusterMini.push(S.pmxMark({role:rv.persona,seat:rv.seat,size:12}));});
  const out={kindWord:'Review',openAction:vm.hasReport&&vm.population==='protocol'?'review-open-report':'collab-open-panel',openAttrs:R,screens,cluster,clusterMini,
   clusterRoles:vm.reviewers.map(rv=>({role:rv.persona,seat:rv.seat,state:mState(rv)})),density:naturalFace(vm),waitingNoun:WAIT_NOUN,
   progressNoun:vm.reviewers.filter(x=>x.done).length+' of '+plural(vm.reviewers.length,'reviewer')+' finished',notice:vm.followOns.notice,recorded:vm.recorded,
   clock:vm.phase==='waiting'?clockOf(null):live||vm.phase==='paused'?clockOf(vm.usage.workedMs):H(workedOf(vm.usage.workedMs))};
  out.technical=vm.phase==='done'&&vm.followOns.canAct?'Create To-Dos sends <code>cmd.review.create_todos</code>; Send Findings To Agent sends <code>cmd.review.send_findings_to_agent</code>. Snapshot <code>'+H(vm.target.hash)+'</code>.'
   :'Open Panel sends <code>cmd.collaboration.open</code>. Snapshot <code>'+H(vm.target.hash)+'</code>.';
  /* the track: Snapshot -> Reading on their own -> Comparing notes -> Writing the report (Single Agent drops Comparing) */
  const stops=vm.multi?STOPS:STOPS.filter(s=>s!=='Comparing notes');
  const at={waiting:-1,snapshot:1,reading:1,retrying:1,partial:1,stale:1,comparing:2,writing:vm.multi?3:2,done:stops.length,paused:1,cancelled:1,failed:1}[vm.phase];
  const now=Math.min(at==null?1:at,stops.length);
  const doneN=vm.reviewers.filter(x=>x.done).length;
  const nowText=vm.phase==='waiting'?'<b>Snapshot</b> · not taken yet':vm.phase==='done'?'<b>'+H(stops[stops.length-1])+'</b> · done':
   vm.phase==='comparing'?'<b>Comparing notes</b> · '+vm.counts.checked+' of '+plural(vm.findings.length,'possible problem')+' checked':
   vm.phase==='writing'?'<b>Writing the report</b>':'<b>Reading on their own</b> · '+doneN+' of '+vm.reviewers.length+' done';
  out.track={key:'trk:'+r.id,stops:stops.map((l,i)=>({key:'pmx-stop:'+r.id+':'+i,label:H(l),state:vm.phase==='failed'&&i===now?'failed':i<now?'done':i===now&&vm.phase!=='waiting'?'now':'next'})),nowText};
  /* the sentence (7.1 / 9.1); while some still read, a reviewer that stopped (or is trying again) is named */
  const stopped=vm.phase==='reading'?vm.reviewers.filter(x=>x.state==='failed'||x.retrying):[],reading=vm.reviewers.filter(x=>x.state==='working'&&!x.retrying);
  const snapTime=vm.target.time?' ('+H(vm.target.time)+')':'';
  const sentence={
   waiting:{status:'waiting',word:'Waiting to start',reason:H(C.waitingReason?C.waitingReason(r):'Nothing runs by itself in this preview, so '+WAIT_NOUN+' yet.')},
   snapshot:{status:'running',word:'Running',reason:'Took a snapshot of '+H(vm.target.file)+snapTime+'. '+(vm.multi?'Each reviewer works alone.':'One fresh reviewer reads it.')},
   reading:{status:'running',word:'Running',reason:stopped.length?H(joinNames(stopped.map(x=>x.name)))+' '+(stopped.every(x=>x.retrying)?(stopped.length===1?'is':'are')+' retrying':stopped[0].outcome==='timed_out'?'ran out of time':'didn’t finish')+'; '+plural(reading.length,'reviewer')+(reading.length===1?' is':' are')+' still reading. You can decide once '+(reading.length===1?'it finishes':'they finish')+'.'
    :vm.reviewers.every(x=>x.done)?(vm.multi?'All '+vm.reviewers.length+' reviewers are done reading. Next they compare notes.':'The reviewer is done reading. Next it writes the report.')
    :vm.multi?plural(vm.reviewers.length,'reviewer')+' are reading on their own; they can’t see each other’s notes yet.':'One reviewer is reading the snapshot on its own.'},
   retrying:{status:'waiting',word:'Waiting',reason:H(joinNames(vm.retrying||['The reviewer']))+' will retry (queued). Nothing runs by itself in this preview.'},
   comparing:{status:'running',word:'Running',reason:plural(vm.counts.notes,'note')+' became '+plural(vm.findings.length,'possible problem')+(vm.counts.duplicates?' ('+vm.counts.duplicates+(vm.counts.duplicates===1?' was':' were')+' the same)':'')+'. The reviewers are checking each one.'},
   writing:{status:'running',word:'Running',reason:'Writing the report.'},
   paused:{status:'paused',word:'Paused',reason:'nothing is lost.'},
   cancelled:{status:'cancelled',word:'Cancelled',reason:doneN+' of '+plural(vm.reviewers.length,'reviewer')+' finished · everything so far is kept.'},
   failed:{status:'failed',word:'Failed',reason:H(r.blockedReason||'the review stopped before the report was written.')},
   done:{status:'done',word:'Done',reason:H(vm.headline)+'.'},
   partial:{status:'attention',word:'Needs attention',reason:vm.partial&&!vm.partial.done?'no reviewer finished.':'only '+(vm.partial?vm.partial.done+' of '+vm.partial.of:'some')+' reviewers finished.'},
   stale:{status:'attention',word:'Needs attention',reason:H(vm.target.file)+' changed after this review started.'}}[vm.phase];
  out.sentence=sentence;
  /* the dock line (C14/C15) says what the card says: the partial decision is "needs you" only once it is offered */
  out.dock=vm.phase==='partial'||vm.phase==='stale'?{tone:'needs',sentence:'<b>'+sentence.word+'</b> · '+sentence.reason}:live?{tone:'live',sentence:sentence.reason}:null;
  /* the one loud moment (7.4): partial (A1-34 Retry) and the target that changed mid-run */
  out.decision=null;
  if(vm.phase==='partial'&&vm.partial){
   const P=vm.partial,miss=P.missing.length?' ('+H(joinNames(P.missing))+' '+H(P.why)+')':'';
   /* Continue with N only when N >= 1 (a partial review needs at least one reviewer's notes) */
   out.decision={key:'dec:'+r.id,tone:'warm',glyph:'warn',
    sentence:P.done?'<b>Only '+P.done+' of '+P.of+' reviewers finished</b>'+miss+'. This is a partial review.':P.of===1?'<b>The reviewer didn’t finish</b>'+miss+'. There are no notes yet.':'<b>None of the '+P.of+' reviewers finished</b>'+miss+'. There are no notes yet.',
    actions:[{action:'review-retry',label:'Retry',primary:true,attrs:R},P.done?{action:'review-accept-partial',label:'Continue with '+P.done,attrs:R}:null,{action:'collab-cancel',label:'Cancel',attrs:R}].filter(Boolean)};
  }
  if(vm.phase==='stale'){
   out.decision={key:'dec:'+r.id,tone:'warm',glyph:'warn',sentence:'<b>'+H(vm.target.file)+' changed after this review started.</b> Notes about the new version are set aside, never mixed in.',
    /* below 360 px the last word of each label drops (.pmx-long, as the receipt's "Open Panel"): at a 204 px card
       "Finish on the old snapshot" ran 31 px past the card in retro. Each label is one outer span, so the button's
       flex gap never falls between "new" and " version" (a double word gap) */
    actions:[{action:'collab-review-run-again',label:'<span>Review the new<span class="pmx-long"> version</span></span>',primary:true,attrs:R},{action:'review-keep-snapshot',label:'<span>Finish on the old<span class="pmx-long"> snapshot</span></span>',attrs:R}]};
  }
  /* lanes (reading): reviewer mark, focus, verb, time; line 2 = sealed squares, never dispositions (REV-05) */
  out.lanes='';out.board='';
  if(vm.phase==='snapshot'||vm.phase==='reading'||vm.phase==='retrying'||vm.phase==='paused'||vm.phase==='partial'){
   /* at most 3 rows (7.2): 3 lanes, or the 2 most urgent (failed, then reading) plus "+N more"; shown in seat order
      so a reviewer finishing never reorders the rows */
   const pri=rv=>rv.state==='failed'||rv.retrying?0:rv.state==='working'?1:2;
   const list=vm.reviewers;
   const pick=list.length>3?list.slice().sort((a,b)=>pri(a)-pri(b)||a.seat-b.seat).slice(0,2):list;
   const shown=list.filter(rv=>pick.includes(rv)),rest=list.filter(rv=>!pick.includes(rv));
   const lanes=shown.map(rv=>{
    const off=rv.state==='failed'||rv.state==='waived';
    const verb=rv.state==='failed'?(rv.outcome==='timed_out'?'ran out of time':'didn’t finish'):rv.state==='waived'?'set aside':rv.retrying?'retrying':rv.done?'done reading':vm.phase==='paused'?'paused':'reading '+vm.target.file;
    /* 9.0: a single pass has nobody to be sealed from, so its notes are only counted */
    const l2=off?'Its notes are missing from this review.':rv.retrying?'Queued to retry':!rv.notes?'No notes yet':vm.multi?S.pmxSealed(rv.notes)+plural(rv.notes,'note')+' · sealed until everyone is done':plural(rv.notes,'note');
    return S.pmxLane({key:'pmx-lane:'+r.id+':'+rv.pid,action:'collab-open-participant',attrs:R+' data-participant="'+H(rv.pid)+'"',state:off?'failed':rv.done?'done':'working',
     mark:S.pmxMark({role:rv.persona,seat:rv.seat,size:22,state:mState(rv)}),name:H(rv.name),sub:H(rv.model),verb:H(verb),verbKey:'vb:'+rv.pid+':'+S.pmxHash(verb),
     time:rv.done||off||rv.retrying?'':clockOf(vm.usage.workedMs),line2:l2,line2Kind:off||rv.retrying||!vm.multi?'detail':'sealed',keepKey:'l2:'+r.id+':'+rv.pid+':'+(vm.multi?'sealed:':'n:')+rv.notes});
   }).join('');
   const working=rest.filter(x=>x.state==='working').length,finished=rest.filter(x=>x.done).length;
   out.lanes=S.pmxLanes({key:'lanes:'+r.id,lanesHtml:lanes,runId:r.id,kind:'review',
    more:rest.length?{count:rest.length,text:[working?working+' reading':'',finished?finished+' done':''].filter(Boolean).join(', ')+' · Show all',action:'collab-toggle-expand',attrs:R}:null});
  }
  /* comparing: a compact agreement grid, at most 4 rows, then "and N more" */
  if(vm.phase==='comparing'){
   const rows=vm.findings.slice(0,vm.findings.length>4?3:4);
   out.board='<div class="pmx-review-grid" data-k="rvgrid:'+id+'">'+rows.map(f=>{
    const vv=((r.review.findings||[]).find(x=>x.id===f.id)||{}).reviewerVotes||[];
    const votes=vm.voters.map(rv=>{const x=vv.find(v=>v.participantId===rv.pid);return {seat:rv.seat,vote:x?voteOf(x.disposition):'pending'};});
    const n=vv.length;
    return '<p class="pmx-review-grid-row" data-k="rvg:'+H(f.id)+'">'+S.pmxSeverity(f.severity)+'<span class="pmx-review-grid-claim">'+H(f.claim)+'</span>'+
     S.pmxAgree({votes,words:n+' of '+vm.voters.length+' checked'})+'</p>';}).join('')+
    (vm.findings.length>rows.length?'<p class="pmx-review-grid-more">and '+(vm.findings.length-rows.length)+' more</p>':'')+'</div>';
  }
  /* meta: recorded first (C11), then the reviewers and the snapshot, at most three parts */
  const cost=vm.recorded?'':S.pmxCost({state:live?'running':'done',spent:vm.usage.costUsd||null,limit:vm.usage.limitUsd});
  out.meta=vm.phase==='waiting'?['Nothing spent · your setup is saved on this card',plural(vm.reviewers.length,'reviewer')+' · '+(vm.multi?'Multi-Pass Review':'Single Agent')]
   :[plural(vm.reviewers.length,'reviewer')+' · '+(vm.multi?'Multi-Pass Review':'Single Agent'),vm.target.time?'snapshot taken '+H(vm.target.time):'',cost].filter(Boolean);
  /* follow-ons: one control set per run (7.12): while the report is the active editor tab, one pointer line */
  const viewOpen=viewIsOpen(r.id);
  out.pointer='';out.more=[];out.result=null;
  const open={action:out.openAction,label:'Open Panel',attrs:R,core:true};
  const example=window.PM56_REVIEW_DEMOS&&window.PM56_REVIEW_DEMOS.controls?window.PM56_REVIEW_DEMOS.controls(ctx||E.ctx(),r):'';
  out.actions=[open,{action:'collab-message',label:'Message',attrs:R,core:true}];
  /* one name for the in-place playback: the recorded demo's own button label ("Play recorded passes") */
  if(example&&!/disabled/.test(example))out.actions.unshift({action:'review-example-play',label:(/>([^<>]+)<\/button>\s*$/.exec(example)||[])[1]||'Play recorded passes',attrs:R});
  if(vm.phase==='done'){
   out.receipt={headline:H(vm.receiptHeadline),glyph:'check',time:H(atOf(vm.usage.completedAt)),cost:vm.recorded?'':S.pmxCost({spent:vm.usage.costUsd||null,limit:vm.usage.limitUsd}),recorded:vm.recorded};
   out.result=resultHtml(r,vm,viewOpen);
   /* COLLAB's More row already carries Run Another Review and the disabled Message (G-30); the kind adds only the
      follow-on, because below 360 px a kind's extra leaves the actions row (7.2). The More row replaces the actions
      row, so the two never show at once. */
   const fo=followOnsOf(vm),nSel=vm.followOns.createCount;
   /* the follow-on is the result's primary and core: it stays on the face at every width (7.2 S tier). When the row
      holds both, Open Panel is the one that leaves below 360 px (pmx-act-extra); the report stays one click away
      through More (listed there for that case), "N more in the report" and the receipt */
   /* one span per label: a flex button would put its gap between the verb and the rest */
   const f=fo==='todos'?{action:'review-open-todos',label:'<span><span class="pmx-review-verb">Open </span>To-Dos</span>',primary:true,core:true,attrs:R}:fo==='create'?{action:'collab-review-create-todos',label:'<span><span class="pmx-review-verb">Create </span>To-Dos ('+nSel+')</span>',primary:true,core:true,attrs:R,disabled:!nSel}:null;
   out.followOns=[];
   /* 7.12 one control set: while the report is the active editor tab the follow-on is handed to COLLAB as followOns,
      which it replaces with the pointer line ("Choosing in the report beside the chat"); Open Panel leaves too (the
      report is already the active tab), so the pointer, the chevron and More keep one row at 391 and 417 */
   if(viewOpen){out.pointer=(SH().PMX_COPY&&SH().PMX_COPY.oneControlSet.review)||'Choosing in the report beside the chat';out.actions=[];if(f)out.followOns=[f];}
   else if(f){out.actions=[f,Object.assign({},open,{core:false,extra:true})];out.more=[{action:open.action,label:'Open Panel',attrs:R}];}
   else out.actions=[open];
  }
  return out;
 }
 /* The finished face: answer first (7.5, 8.5). Budget (7.2: 360 at M, R-31 400 in retro): the top 2 findings that
    need a decision (to fix, then unsure; ideas are counted in "N more in the report"), one note, then the actions
    row Create To-Dos (n) · Open Panel · chevron · More, which fits one row at 417 px in every theme. Send Findings
    To Agent is the note's trailing text button (with all three buttons the row wrapped in retro and friendly and put
    the face over its budget). One control set: nothing here appears twice (DON'T 31). */
 const TOP_FINDINGS=2;
 function followOnsOf(vm){return vm.phase==='done'&&vm.followOns.canAct&&(vm.followOns.todos.length||vm.counts.toFix)?(vm.followOns.todos.length?'todos':'create'):'';}
 function resultHtml(r,vm,viewOpen){
  const S=SH(),id=H(r.id),R='data-run="'+id+'"';
  /* R-11 figures sentence; a recorded run says so first, so a width ellipsis never cuts "no AI cost" */
  /* "compared notes" only when at least two reviewers' notes were compared (a partial review can leave one) */
  const sub=[vm.recorded?RECORDED_STAMP:'',!vm.multi?'One reviewer':!vm.compared?'Notes not compared':vm.degraded?plural(vm.voters.length,'reviewer')+' compared notes':'Checked alone, then compared notes',
   H(workedOf(vm.usage.workedMs)),vm.recorded?'':S.pmxCost({spent:vm.usage.costUsd||null,limit:vm.usage.limitUsd})].filter(Boolean);
  if(vm.degraded)sub.splice(vm.recorded?1:0,0,H(S.pmxFill&&S.PMX_COPY&&S.PMX_COPY.degraded?S.pmxFill(S.PMX_COPY.degraded,{done:vm.reviewers.filter(x=>x.done).length,all:vm.reviewers.length}):'Degraded result'));
  let board='';
  const listed=vm.findings.filter(f=>f.toFix||f.unsure||f.idea),top=vm.findings.filter(f=>f.toFix||f.unsure||f.todoId).slice(0,TOP_FINDINGS),more=listed.length-top.length;
  /* Single Agent (8.5): "Single pass: one reviewer, so nothing was double-checked." and no agreement words or dots */
  const single=vm.compared?'':'<p class="pmx-review-note" data-k="rvsingle:'+id+'"><span>'+(vm.multi?'<b>Not double-checked:</b> only one reviewer finished.':'<b>Single pass:</b> one reviewer, so nothing was double-checked.')+'</span></p>';
  if(!listed.length||viewOpen)board=single;
  if(!viewOpen&&listed.length){
   board=single+(top.length?S.pmxFindings(top.map(f=>{
    const box=f.selectable?{attrs:'data-action="collab-review-toggle-finding" '+R+' data-finding="'+H(f.id)+'"',checked:f.selected}:{attrs:'tabindex="-1" aria-hidden="true"',checked:!!f.todoId,disabled:true};
    /* "To-Do created" in place of the disposition word (8.5); Open To-Dos is the row's one control for them (7.12,
       and a per-finding Open put the face 20 px a finding over its 360 budget) */
    /* the meta line wraps as whole parts (never cut, J-2); with agreement dots on the line the disposition word is
       the part that drops below 360 px (the tick and the dots carry it); the long agreement sentence is the hover */
    /* once a finding's To-Do exists its decision is made: the agreement keeps its head and dots ("2 of 3 agree"),
       the tail ("· 1 unsure") stays in the hover card, so "To-Do created" never wraps the line */
    const ag=vm.compared&&f.agreeWords,words=H(f.agreeHead||f.agreeWords)+(f.agreeTail&&!f.todoId?'<span class="pmx-review-tail"> · '+H(f.agreeTail)+'</span>':'');
    /* below 360 px "To-Do created" drops with the disposition word too: the note under the findings says which
       findings became To-Dos */
    return S.pmxFinding({key:'collab-f-'+f.id,n:f.n,sev:f.severity,cls:'pmx-review-finding',severity:S.pmxSeverity(f.severity),disposition:'<span class="pmx-review-disp'+(ag?' pmx-review-opt':'')+'">'+(f.todoId?'To-Do created':H(f.dispWord))+'</span>',
     agree:ag?S.pmxAgree({votes:f.votes,words,cls:'pmx-review-agree',attrs:' data-hover-key="rv-agree:'+H(f.id)+'" data-hover-tip="'+H(f.agreeLong)+'"'}):'',claim:H(f.claim),box,
     attrs:f.toFix||f.todoId?'':' data-hover-key="rv-only-confirmed:'+H(f.id)+'" data-hover-tip="Only confirmed findings can become To-Dos."',
     todo:''});
   }).join(''),{key:'rvfind:'+r.id}):'');
   const fo=followOnsOf(vm),todos=vm.followOns.todos,n=vm.followOns.notice;
   /* J-2 rule 3: a control keeps 16 px from unrelated text on its line, so the note is text only and the links
      (Send Findings To Agent, "N more in the report") sit on their own row under it */
   const send=fo==='create'&&vm.followOns.createCount?'<button type="button" class="text-button" data-action="collab-review-send-findings" '+R+' data-hover-key="rv-send" data-hover-tip="Puts a fix request in your message box for you to send. It never sends by itself.">Send Findings To Agent</button>':'';
   /* G-14: "N more in the report" opens the report at the first finding the card does not list */
   const next=listed.find(f=>top.indexOf(f)<0);
   const moreTxt=more>0&&next?'<button type="button" class="text-button" data-action="'+(vm.hasReport&&vm.population==='protocol'?'review-open-report':'collab-open-panel')+'" '+R+' data-finding="'+H(next.id)+'"><span>'+more+' more<span class="pmx-review-long"> in the report</span></span></button>':'';
   const say=n?H(n.text):todos.length?plural(todos.length,'To-Do')+' created from finding'+(todos.length===1?' ':'s ')+H(todos.map(t=>t.n).join(todos.length===2?' and ':', '))+'. Nothing was fixed.'
    :vm.counts.toFix?(fo==='create'&&!vm.followOns.createCount?'Tick at least one finding to create To-Dos.':'Only ticked findings become To-Dos.'):'Only confirmed findings can become To-Dos.';
   board+='<p class="pmx-review-note" data-k="rvnote:'+id+'"'+(n?' data-failure="'+H(n.code)+'"':'')+(!n&&!todos.length&&vm.counts.toFix?' data-hover-key="rv-ticked" data-hover-tip="Ticked: the ones reviewers confirmed. Nothing is fixed for you."':'')+'>'+
    (n?S.pmxGlyph('warn',13):todos.length?S.pmxGlyph('check',13):'')+'<span>'+say+'</span></p>'+
    (send||moreTxt?'<p class="pmx-review-links" data-k="rvlinks:'+id+'">'+send+moreTxt+'</p>':'');
  }
  /* the frame draws it with pmxResult and its hooks (.collab-status, .collab-card-meta on the figures) */
  return {glyph:vm.counts.toFix?'check':'check-circle',headline:H(vm.headline),sub:sub.join(' · '),boardHtml:board};
 }

 /* ---------------------------------------------------------------- card decisions (7.6, A1-34; 8.15: cmd.collaboration.reconfigure) */
 E.action('review-retry',(c,b)=>{
  const r=run(b.dataset.run);if(!r)return true;
  const names=[];(r.participants||[]).forEach(p=>{if(p.outcome&&p.outcome!=='completed'&&p.outcome!=='explicitly_waived'){const res=C.retryParticipant(r.id,p.id);if(res&&res.ok)names.push(p.role);}});
  if(names.length){
   /* the run is going again (a blocked partial seed included); the card's retrying face is derived from the retried
      reviewers' newest attempts, so their next outcome ends it */
   if(r.status==='blocked'){r.status='running';r.blockedReason=null;}
   C.appendMessage(r.id,{senderKind:'system',senderName:'System',messageType:'message',body:joinNames(names)+(names.length===1?' is':' are')+' queued to retry.'});
  }
  c.renderApp();return true;
 });
 /* A1-34 Continue with N: a protocol run goes on through acceptPartial (normalize over the passes that finished; the
    report comes from finalize, never from here). A legacy seed carries its own partial report artifact (labelled
    partial), so it may finish on it; without one it stays open. Refusals print on the card (DON'T 15). */
 E.action('review-accept-partial',(c,b)=>{
  const r=run(b.dataset.run);if(!r||['completed','canceled','cancelled'].includes(r.status))return true;
  if(owns(r.id)){
   const res=acceptPartial(r.id);
   if(res&&res.ok===false)notice.set(r.id,{code:res.error,text:res.error==='reviewers_still_reading'?'Some reviewers are still reading. Decide once they finish.':res.error==='no_finished_pass'?'No reviewer finished, so there are no notes to continue with.':'Nothing changed.'});
   else notice.delete(r.id);
   c.renderApp();return true;
  }
  const parts=r.participants||[],done=parts.filter(p=>p.outcome==='completed').length;
  if(parts.some(p=>!p.outcome)||!done)return true;
  parts.forEach(p=>{if(p.outcome!=='completed'&&p.outcome!=='explicitly_waived')C.setOutcome(r.id,p.id,'explicitly_waived',{reason:'You continued with the reviewers who finished.',actor:'user'});});
  r.degraded=true;r.blockedReason=null;
  if((r.artifacts||[]).some(a=>a.kind==='review_report')){r.status='completed';r.completedAt=new Date().toISOString();}
  else if(r.status==='blocked')r.status='running';
  C.appendMessage(r.id,{senderKind:'system',senderName:'System',messageType:'message',body:'You continued with the '+(done===1?'reviewer':done+' reviewers')+' who finished. This is a partial review.'});
  c.renderApp();return true;
 });
 E.action('review-keep-snapshot',(c,b)=>{
  const r=run(b.dataset.run),st=r&&r.review&&r.review.staleTarget;if(!st||st.chosen)return true;
  st.chosen='use_frozen_target';r.status='completed';r.completedAt=new Date().toISOString();
  C.appendMessage(r.id,{senderKind:'system',senderName:'System',messageType:'message',body:'Finished on the old snapshot. Notes about the new version stay set aside.'});
  c.renderApp();return true;
 });
 function openReport(c,id){if(!run(id)?.review?.report)return;c.closeMenu();c.closeDialog();c.state.editorRevealed=true;c.openEditor('review:'+id);}
 E.action('review-open-report',(c,b)=>{openReport(c,b.dataset.run);if(b.dataset.finding)requestAnimationFrame(()=>document.querySelector('.review-document [data-finding="'+CSS.escape(b.dataset.finding)+'"]')?.scrollIntoView({block:'center'}));return true;});
 E.action('review-open-evidence',(c,b)=>{c.closeDialog();c.state.editorRevealed=true;c.openEditor('review-evidence:'+b.dataset.run+':'+b.dataset.evidence);return true;});
 E.action('review-report-view',c=>{c.renderApp();return true;}); /* the Formatted / Plain text switch; REVIEW-B's view chains it and keeps the mode */
 E.action('review-open-todos',(c,b)=>{const r=run(b.dataset.run);if(!r)return true;c.closeDialog();c.switchThread(r.threadId);c.state.editorRevealed=false;Object.assign(c.state.activity,{open:true,pinned:true,domain:'todo',scope:'focus',selected:null});c.renderApp();return true;});
 E.action('review-export-report',(c,b)=>{const a=run(b.dataset.run)?.review?.report;if(!a)return true;const u=URL.createObjectURL(new Blob([window.PM56_REVIEW.markdown(a)],{type:'text/markdown;charset=utf-8'})),link=document.createElement('a');link.href=u;link.download=a.id+'-v1.md';link.click();setTimeout(()=>URL.revokeObjectURL(u),1000);return true;});
 E.chainAction('collab-open-configure',(c,b,e)=>{const old=run(b.dataset.reconfigure);if(old?.review?.report){const el=document.createElement('button');el.dataset.run=old.id;E.run('collab-review-run-again',el,e);return true;}return false;});
 E.chainAction('reset-all',()=>{notice.clear();lineage.clear();preticked.clear();return false;});
 window.PM56_REVIEW={admit,owns,submitPass,normalize,vote,finalize,renderSummary,renderActions,toggleFinding,createSelectedTodos,sendSelected,markdown,openReport,acceptPartial,
  /* presentation (REVIEW-A): the card VM, the sheet and card parts. REVIEW-B's review-view.js (loaded later) adds
     reportVM, viewParts and the review: / review-evidence: documents (the one renderer, IMPACT A1-50) */
  cardVM,sheetParts,cardParts,sendText,sentLineage:tid=>lineage.get(tid)||null};
})();
