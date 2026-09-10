/* Batch 13: four self-contained local exercises on the existing owners.
 * No provider/network calls. No product persistence or runtime admission.
 * Evidence samples are inspectable artifacts; only a small JS fence is tested.
 */
(function () {
  'use strict';
  const E=window.PM56_EXT, C=window.PM56_COLLAB, B=window.PM56_BRAINSTORM;
  const D=window.PM56_DATA, L=window.PM56_LENS, BD=window.PM56_BRAINSTORM_DEMOS;
  const copy=x=>JSON.parse(JSON.stringify(x));
  const protocol=new window.PM56_WONDERER_ENGINE.Protocol(id=>D.artifacts.find(a=>a.id===id));
  const sessions=new Map(), clocks=new Map(), reasons=new Map(), disclosures=new Set();let serial=0;
  const flows={
    shape:{title:'Shape, summarize, and restore',detail:'Mute → Focus → source preview → restore unchanged history',kind:'lens'},
    stale:{title:'A preview is not a promise',detail:'Change a source → reject stale Apply → review the new version',kind:'lens'},
    leads:{title:'Follow a connected lead',detail:'Research a hypothesis → deliberate disposition → one Deep Plan',kind:'wonderer'},
    dissent:{title:'Evidence changes; dissent stays',detail:'Reject an outdated check → research again → retain core dissent',kind:'wonderer'}
  };
  const run=id=>C.run(id), session=tid=>sessions.get(tid||E.ctx().thread.id);
  const current=c=>C.runsForThread(c.thread.id).find(r=>r.wonderer);
  const refresh=()=>{E.ctx().renderApp();E.ctx().renderOverlays();};
  function reply(r){if(!r?.ok)E.ctx().toast('No change made',(r?.error||'Unavailable').replaceAll('_',' ')+'.');refresh();return r;}
  function button(c,action,label,attrs='',why=''){
    return '<button class="soft-button" data-action="'+action+'" '+attrs+(why?' disabled title="'+c.esc(why)+'"':'')+'>'+label+'</button>';
  }
  function newThread(flow){
    const c=E.ctx(),tid='batch13-'+flow+'-'+(++serial),base=copy(c.state.threads.find(t=>t.id==='query'));
    Object.assign(base,{id:tid,title:flows[flow].title+' · local example',status:'ready',pinned:false,archived:false,goalId:null,messages:[]});
    c.state.threads.push(base);sessions.set(tid,{threadId:tid,flow,guide:true,startedAt:Date.now()});
    Object.assign(c.state,{demoOpen:false,menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false});
    c.state.activity.open=false;c.state.capabilities.goal=false;
    c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};
    return {c,t:base,tid};
  }
  function start(flow){
    if(!flows[flow])return;
    const {c,t,tid}=newThread(flow),s=session(tid);
    if(flows[flow].kind==='lens'){
      const texts=[
        ['user','Design local collection search. Collection contents must never leave this device.'],
        ['assistant','Preserve the existing ranking. A padded query such as " alpha " must return the same matches in the same order.'],
        ['user','Keep a simple local-filter fallback. Do not introduce a persistent database migration for this change.'],
        ['assistant','A snapshot worker is an option, not a measured speedup. Discard obsolete query responses and measure startup and transfer overhead before choosing the default.'],
        ['user','This older color discussion is unrelated to search. We compared amber and blue icons; leave that decision for a separate task.'],
        ['assistant','Verification: check offline behavior, query ordering, cancellation, source revisions, and a reversible fallback. No benchmark results have been supplied.']
      ];
      t.messages=texts.map(([role,body],i)=>({id:tid+'-m'+(i+1),role,type:'text',body,revision:1}));
      t.messages.push({id:tid+'-controls',role:'assistant',type:'b13-lens-controls',threadId:tid});
      s.sourceId=tid+'-m2';s.originalBodies=t.messages.filter(m=>m.type==='text').map(m=>({id:m.id,body:m.body}));
      c.switchThread(tid);return;
    }
    const input=BD.fixture(flow==='dissent'?'constraint':'synthesis');
    t.messages=[{id:tid+'-request',role:'user',type:'text',body:input.objective+' Keep Wonderer’s adjacent leads separate from the core decision.'},{id:tid+'-work',role:'assistant',type:'b13-wonderer',threadId:tid}];
    C.openConfigure('brainstorm');const d=C.draft();
    d.name=flows[flow].title;d.purpose=input.objective;d.brainstormInput=input;d.wonderer=true;
    d.wondererInput={seedId:'offline-search',seed:input.objective,projectId:t.projectId??null,flow};
    c.state.dialog={type:'collab-configure'};c.switchThread(tid);
  }
  function artifact(r,suffix,name,value){
    const t=E.ctx().state.threads.find(t=>t.id===r.threadId),id='wonderer-'+r.id+'-'+suffix;
    const a={id,name,type:'text',extension:'json',projectId:t?.projectId??null,threadId:r.threadId,version:1,status:'active',content:JSON.stringify(value,null,2),provenance:'Supplied local exercise. Not live research, a native worker, or a device benchmark.'};
    D.artifacts.push(a);return a;
  }
  function admit(r,d){
    const result=protocol.attach(r,d.wondererInput);if(!result.ok)return result;
    const w=r.wonderer;w.flow=d.wondererInput.flow;w.corePlayback={cursor:0,status:'not_started',errors:[]};
    const fence=artifact(r,'fence','Latest-query fence.json',{kind:'latest_query_fence',latestRequest:2,arrivals:[{requestId:2,value:'new result'},{requestId:1,value:'old result'}],expected:'new result'});
    const measure=artifact(r,'measurement','Measurement availability.json',{kind:'measurement_availability',measurements:[],note:'No worker startup, transfer, latency, CPU or memory measurements have been supplied.'});
    w.artifactIds=[fence.id,measure.id];
    const leads=[
      {id:'fence',claim:'Treat stale query replies like out-of-order deliveries: admit only the current request.',dimension:'Distributed systems · ordering',tether:'The search UI must not let an old query replace a newer result.',artifactId:fence.id},
      {id:'speed',claim:'A worker may improve responsiveness, but setup and transfer overhead could outweigh its benefit.',dimension:'Scale boundary · measurement',tether:'The seed asks for responsive local search, so the cutoff needs device evidence.',artifactId:measure.id},
      {id:'fallback',claim:'Keep an explicit local-filter fallback while the worker path is evaluated.',dimension:'Human factors · reversibility',tether:'A reversible rollout limits disruption without claiming an unmeasured performance improvement.',artifactId:null}
    ];
    for(const lead of leads){const out=protocol.add(r,{...lead,seedId:w.seedId});if(!out.ok)throw Error(out.error);}
    const s=session(r.threadId);if(s)s.runId=r.id;return result;
  }
  function sourceResult(a){
    try{
      if(a.content.length>20000)return {ok:false,error:'evidence_too_large'};
      const v=JSON.parse(a.content);let outcome,summary;
      if(v.kind==='latest_query_fence'&&Number.isInteger(v.latestRequest)&&v.latestRequest>=0&&typeof v.expected==='string'&&Array.isArray(v.arrivals)&&v.arrivals.length>0&&v.arrivals.length<=30){
        let accepted=null;const dropped=[];
        for(const item of v.arrivals){if(!Number.isInteger(item.requestId)||typeof item.value!=='string')return {ok:false,error:'invalid_sample'};if(item.requestId===v.latestRequest)accepted=item.value;else dropped.push(item.requestId);}
        outcome=accepted===v.expected?'supports':'refutes';
        summary='Executed the supplied JS ordering sample: accepted '+JSON.stringify(accepted)+'; rejected request IDs '+JSON.stringify(dropped)+'. This checks the fence algorithm only, not a real worker or its latency.';
      }else if(v.kind==='measurement_availability'&&Array.isArray(v.measurements)&&v.measurements.length===0){
        outcome='inconclusive';summary='No device measurements are present. This sample cannot substantiate a speedup or a default threshold.';
      }else return {ok:false,error:'unsupported_evidence_sample'};
      return {ok:true,record:{artifactId:a.id,outcome,summary}};
    }catch(_){return {ok:false,error:'invalid_evidence_sample'};}
  }
  function research(r,id){
    const l=protocol.lead(r,id);if(!l?.artifactId)return reply({ok:false,error:'no_evidence_selected'});
    const res=protocol.begin(r,id,l.artifactId);if(!res.ok)return reply(res);
    const evidence=sourceResult(res.source),key=res.ticket.id;
    // Completion uses the original run/ticket, never whichever thread is open later.
    clocks.set(key,setTimeout(()=>{
      clocks.delete(key);
      if(evidence.ok)protocol.complete(r,key,evidence.record);
      else {const ticket=r.wonderer.pending.find(t=>t.id===key);ticket.finished=true;protocol.lead(r,id).state='hypothesis';protocol.receipt(r,'research_refused',{leadId:id,reason:evidence.error});}
      refresh();
    },1250));refresh();return res;
  }
  function coreActions(r){
    const records=BD.expected(r,r.wonderer.flow==='dissent'?'constraint':'synthesis'),a=r.brainstorm.attempts;
    const x=()=>({epoch:r.stopEpoch,sourceHash:r.brainstorm.input.sourceHash});
    const actions=a.map((attempt,i)=>()=>B.submitProposal(r.id,{...x(),attemptId:attempt.id,assignmentRevision:attempt.assignmentRevision,proposal:copy(records.proposals[i])}));
    actions.push(()=>B.normalize(r.id,x()));
    for(let round=1;round<=r.config.debateRounds;round++)actions.push(()=>B.debate(r.id,{...x(),round,messages:[{participantId:a[0].participantId,body:'Preserve offline operation and ranking. The specialist’s leads are separate hypotheses until disposed.',evidenceRefs:['requirements','query']},{participantId:a[1].participantId,body:'Keep uncertainty and dissent visible. No device speedup has been measured.',evidenceRefs:['latency']}]}));
    actions.push(()=>B.recordEvidence(r.id,{...x(),checks:r.brainstorm.proposals.map(q=>({proposalId:q.id,evidenceRefs:q.evidenceRefs,summary:q.facts.networkRequired?'This candidate requires a network and fails the offline rule.':'This candidate preserves local data; device performance is unmeasured.'}))}));
    actions.push(()=>{for(let i=0;i<a.length;i++){const out=B.vote(r.id,a[i].participantId,{...x(),...copy(records.votes[i])});if(!out.ok)return out;}return {ok:true};});
    actions.push(()=>B.decide(r.id,{...x(),selectedProposalId:'worker',reason:'Choose a local snapshot design with a reversible fallback. The offline constraint remains controlling; recorded opposing preferences remain dissent, and no unmeasured speedup is asserted.',steps:records.steps}));return actions;
  }
  function playCore(r){
    if(!r?.wonderer||r.status!=='running')return reply({ok:false,error:'run_not_running'});
    const state=r.wonderer.corePlayback;if(state.status==='completed'||clocks.has('core:'+r.id))return;
    const actions=coreActions(r);state.status='playing';
    function next(){
      if(r.status==='paused'){clocks.set('core:'+r.id,setTimeout(next,200));return;}
      if(r.status!=='running'){state.status='stopped';clocks.delete('core:'+r.id);refresh();return;}
      const res=actions[state.cursor]();if(!res.ok){state.status='failed';state.errors.push(res.error);clocks.delete('core:'+r.id);refresh();return;}
      state.cursor++;if(state.cursor<actions.length)clocks.set('core:'+r.id,setTimeout(next,300));else {state.status='completed';clocks.delete('core:'+r.id);}refresh();
    }
    clocks.set('core:'+r.id,setTimeout(next,400));refresh();
  }
  function augmentPlan(r,payload){
    if(!r.wonderer)return payload;
    const g=protocol.convergence(r),h=text=>({t:'heading',d:2,text}),p=text=>({t:'paragraph',text});
    payload.blocks.push(h('Wonderer · deliberately selected additions'));
    if(!g.additions.length)payload.blocks.push(p('No specialist lead was included. Core decisions remain unchanged.'));
    for(const l of g.additions){
      payload.blocks.push(h(l.claim),p('Connection to the seed: '+l.tether),p((l.state==='user_decided'?'Explicit user decision, not an established fact':'Locally researched lead')+' — '+l.decision.reason),p(l.evidence?l.evidence.summary+' [artifact: '+l.evidence.artifactId+'; version '+l.evidence.version+']':'No research evidence supplied. This is a deliberate user choice.'));
      payload.ledgerEntries.push({k:l.state==='user_decided'?'user_decision':'researched_lead',v:l.claim+' — '+l.decision.reason});
      if(l.evidence)payload.sourceRefs.push({ref:'wonderer-evidence:'+l.evidence.artifactId+':v'+l.evidence.version,kind:'recorded_evidence',summary:l.evidence.summary});
    }
    payload.blocks.push(h('Wonderer · excluded leads and remaining uncertainty'));
    for(const l of g.all.filter(l=>!l.included))payload.blocks.push(p('Excluded: '+l.claim+' — '+(l.decision?.reason||'No current admission.')+' This is not a Plan decision.'));
    payload.blocks.push(p('Wonderer is an additive Persona plus methodology Skill. It abstains from the core ballot; no core participant, vote, decision, or dissent was replaced. Local exercise evidence is not live external research.'));
    return payload;
  }
  function leadCard(c,r,l){
    const w=r.wonderer,esc=c.esc,attrs='data-run="'+esc(r.id)+'" data-lead="'+esc(l.id)+'"',busy=l.state==='research_pending'||w.pending.some(t=>t.leadId===l.id&&!t.finished),why=r.status!=='running'?'Run is not running':'';
    const label=({hypothesis:'Hypothesis',research_pending:'Checking source',researched:'Source supports this lead',unsubstantiated:'Not substantiated',user_decided:'User decision · not fact',stale:'Out of date',dropped:'Excluded outdated lead'})[l.state]||l.state;
    return '<section class="b13-lead" data-k="lead:'+esc(r.id+':'+l.id)+'" data-lead-id="'+esc(l.id)+'" data-state="'+l.state+'"><div class="b13-lead-head"><small>'+esc(l.dimension)+'</small><span class="b13-status">'+esc(label)+'</span></div><h2>'+esc(l.claim)+'</h2><p class="b13-tether"><strong>Why it matters</strong> '+esc(l.tether)+'</p>'+
      (l.evidence?'<div class="b13-evidence"><strong>Evidence · version '+l.evidence.version+'</strong><p>'+esc(l.evidence.summary)+'</p><small>'+esc(l.evidence.provenance)+'</small></div>':'<p class="b13-quiet">'+(l.state==='user_decided'?'No research evidence supplied. Included only as an explicit user choice.':'No research conclusion yet. This lead is not a fact or an accepted decision.')+'</p>')+
      (l.state==='stale'?'<p class="b13-warning">The source changed. The old conclusion is not eligible for inclusion. Check the current version or explicitly exclude it.</p>':'')+
      (l.decision?'<p class="b13-disposition"><strong>'+(l.included?'Included':'Excluded')+'</strong> · '+esc(l.decision.reason)+'</p>':'')+
      '<div class="b13-actions">'+(l.artifactId?button(c,'b13-research',busy?'Checking…':l.evidence||l.state==='stale'?'Research again':'Research local sample',attrs,why||(busy?'Check already pending':''))+button(c,'b13-source','Open source',attrs)+(w.flow==='dissent'&&l.id==='fence'?button(c,'b13-source-change','Revise ordering sample','data-run="'+esc(r.id)+'"',why):''):'')+'</div>'+
      '<label class="b13-reason">Disposition reason<textarea data-k="reason:'+esc(r.id+':'+l.id)+'" data-b13-reason="'+esc(r.id+':'+l.id)+'" rows="2" placeholder="Explain the inclusion, exclusion, or explicit user choice.">'+esc(reasons.get(r.id+':'+l.id)||'')+'</textarea></label><div class="b13-actions">'+
      button(c,'b13-decide',l.state==='user_decided'?'Include user decision':'Include researched lead',attrs+' data-kind="include"',why||(!['researched','user_decided'].includes(l.state)?'Research support or an explicit user decision is required':''))+
      button(c,'b13-decide','Exclude',attrs+' data-kind="exclude"',why||(busy?'Wait for the source check':''))+
      button(c,'b13-decide','Use as my decision',attrs+' data-kind="user_decided"',why||(['research_pending','stale','dropped'].includes(l.state)?'Refresh or finish the source check first':''))+'</div><small class="b13-quiet">A user choice remains labelled as a choice, never as researched fact.</small></section>';
  }
  function workspace(c,r){
    if(!r?.wonderer)return '<article class="editor-doc"><h1>Wonderer unavailable</h1><p>Start a configured collaborative run first.</p></article>';
    const w=protocol.refresh(r),g=protocol.convergence(r),esc=c.esc,attrs='data-run="'+esc(r.id)+'"',s=session(r.threadId);
    const core=r.participants.filter(p=>!p.additiveRoleKind||p.additiveRoleKind==='none');
    return '<article class="editor-doc b13-workspace" data-wonderer-run="'+esc(r.id)+'"><header class="b13-heading"><small>Wonderer · additive exploration</small><h1>'+esc(w.seed)+'</h1><p>Three connected leads. One existing collaborative run. No automatic promotion.</p></header><div class="b13-stats"><span><strong>'+core.length+'</strong> core roles</span><span><strong>1</strong> Wonderer</span><span><strong>'+g.additions.length+'</strong> included</span><span><strong>'+g.unresolved.length+'</strong> undecided</span></div>'+
      '<div class="b13-actions">'+button(c,'b13-core',w.corePlayback.status==='playing'?'Core round playing…':w.corePlayback.status==='completed'?'Core round complete':'Play recorded core round',attrs,r.status!=='running'||['playing','completed'].includes(w.corePlayback.status)?'Core round is already running, complete, or unavailable':'')+button(c,'brainstorm-open-results','Core exploration',attrs)+button(c,'collab-pause','Pause',attrs,r.status!=='running'?'Run is not running':'')+button(c,'collab-resume','Resume',attrs,r.status!=='paused'?'Run is not paused':'')+'</div>'+
      (w.corePlayback.errors.length?'<p class="b13-warning">'+esc(w.corePlayback.errors.join('; '))+'</p>':'')+
      '<p class="b13-quiet">Built-in Persona + methodology Skill · default ballot: abstain · local sample only · no provider calls or claimed cost.</p>'+
      w.leads.map(l=>leadCard(c,r,l)).join('')+
      '<section class="b13-convergence" data-k="convergence:'+esc(r.id)+'"><h2>Bring the work together</h2><p>'+(g.ok?'Every specialist lead has an explicit disposition.':'Resolve '+g.unresolved.length+' specialist lead'+(g.unresolved.length===1?'':'s')+' before synthesis.')+' Core votes and dissent stay separate.</p><p>Core phase: <strong>'+esc(B.phaseLabel(r))+'</strong> · recorded dissent: <strong>'+r.brainstorm.dissent.length+'</strong></p>'+button(c,'collab-brainstorm-synthesize',r.brainstorm.synthesis?'Open Deep Plan':'Synthesize Deep Plan',attrs,!r.brainstorm.synthesis&&(!g.ok||r.brainstorm.phase!=='synthesis'||r.status!=='running')?'Finish the core round and every specialist disposition':'')+'</section>'+
      '<details class="b13-technical" data-b13-disclosure="'+esc(r.id)+'"'+(disclosures.has(r.id)?' open':'')+' data-k="technical:'+esc(r.id)+'"><summary>Technical details and source-revision exercise</summary><p>Run '+esc(r.id)+' · '+esc(r.status)+' · epoch '+r.stopEpoch+' · definition '+r.definitionRevision+'</p><p>Source checks rejected: '+w.rejected.length+'. Local record history is session-only.</p>'+button(c,'b13-source-change','Revise the ordering sample',attrs,r.status!=='running'?'Run is not running':'')+'<p>Changes the shared artifact version. A pending response must be rejected; an included result becomes stale.</p><pre>'+esc(JSON.stringify({defaultSpecialistVote:w.defaultVote,coreVotes:r.brainstorm.votes,dissent:r.brainstorm.dissent,rejected:w.rejected},null,2))+'</pre></details>'+((s?.guide)?'<p class="b13-quiet">Start with Research local sample. Give every lead an explicit disposition, play the core round, then synthesize. '+button(c,'b13-hide-guide','Dismiss guidance')+'</p>':'')+'</article>';
  }
  function lensCard(c){
    const s=session(),tid=c.thread.id;if(!s)return '';
    return '<section class="b13-lens-tools" data-k="b13-lens-tools"><h3>Source and effective context</h3><p>Inspect what the local Lens assembler would include. The original conversation is never rewritten.</p><div class="b13-actions">'+button(c,'b13-effective','Inspect effective context')+button(c,'b13-change-message','Revise the ranking source')+'</div><small class="b13-quiet">The revision button edits message 2 in this exercise only; it tests an outdated preview. Other threads are unchanged.</small></section>';
  }
  function guide(c){const s=session(c.thread.id);if(!s?.guide)return '';return '<div class="b13-guide" data-k="b13-guide"><div><strong>'+c.esc(flows[s.flow].title)+'</strong><span>'+c.esc(flows[s.flow].kind==='lens'?'Open Lens beside search. Choose a mode, select messages, then preview or seal.':'Configure Wonderer additively, then open the leads workspace. Research alone does not include a lead.')+'</span></div><button class="icon-button" data-action="b13-hide-guide" title="Dismiss guidance">'+c.icon('close',12)+'</button></div>';}
  E.slot('composerBelow',guide);
  E.slot('transcriptMessage',c=>{
    if(c.m?.type==='b13-lens-controls')return lensCard(c);
    if(c.m?.type!=='b13-wonderer')return '';
    const r=current(c);return '<section class="b13-entry" data-k="b13-entry"><div>'+c.icon('sparkles',20)+'</div><div><h3>Wonderer · connected leads</h3><p>'+(r?'Hypotheses, source checks, and deliberate choices stay separate from the core vote.':'Configure the additive specialist. Opening the modal starts nothing.')+'</p>'+button(c,r?'b13-open':'b13-configure',r?'Open leads and evidence':'Configure BrainStorm','data-run="'+c.esc(r?.id||'')+'"')+'</div></section>';
  });
  E.slot('editorTabLabel',c=>c.editorId?.startsWith('wonderer:')?'Wonderer · leads':c.editorId?.startsWith('wonder-source:')?'Wonderer · source':c.editorId?.startsWith('lens-effective:')?'Effective context':'');
  E.slot('editorDocument',c=>{
    if(c.editorId?.startsWith('wonderer:'))return workspace(c,run(c.editorId.slice(9)));
    if(c.editorId?.startsWith('wonder-source:')){const a=D.artifacts.find(a=>a.id===c.editorId.slice(14));return '<article class="editor-doc b13-source"><small>Shared artifact · current version '+c.esc(a?.version??'unknown')+'</small><h1>'+c.esc(a?.name||'Source unavailable')+'</h1><pre>'+c.esc(a?.status==='active'?a.content:'Source unavailable or revoked.')+'</pre><p>'+c.esc(a?.provenance||'')+'</p></article>';}
    if(c.editorId?.startsWith('lens-effective:')){const tid=c.editorId.slice(15),f=L.effectiveHistory(tid);return '<article class="editor-doc b13-source"><small>Local Lens assembly · session-only</small><h1>Effective context</h1><p>Read-only projection of selected canonical messages and source-linked summaries. Focus preserves chronology and marks priority; it does not claim a live provider prompt.</p><pre>'+c.esc(JSON.stringify(f,null,2))+'</pre></article>';}
    return '';
  });
  E.action('b13-start',(c,b)=>{start(b.dataset.flow);return true;});
  E.action('b13-hide-guide',c=>{const s=session();if(s)s.guide=false;refresh();return true;});
  E.action('b13-open',(c,b)=>{c.openEditor('wonderer:'+b.dataset.run);return true;});
  E.action('b13-configure',c=>{const s=session();if(s)start(s.flow);return true;});
  E.action('b13-core',(c,b)=>{playCore(run(b.dataset.run));return true;});
  E.action('b13-research',(c,b)=>{research(run(b.dataset.run),b.dataset.lead);return true;});
  E.action('b13-source',(c,b)=>{const l=protocol.lead(run(b.dataset.run),b.dataset.lead);if(l?.artifactId)c.openEditor('wonder-source:'+l.artifactId);return true;});
  E.action('b13-decide',(c,b)=>{reply(protocol.decide(run(b.dataset.run),b.dataset.lead,b.dataset.kind,reasons.get(b.dataset.run+':'+b.dataset.lead)||''));return true;});
  E.action('b13-source-change',(c,b)=>{const r=run(b.dataset.run);if(!r||r.status!=='running')return true;const a=D.artifacts.find(a=>a.id===r.wonderer.artifactIds[0]);if(a){const x=JSON.parse(a.content);x.latestRequest++;x.arrivals.unshift({requestId:x.latestRequest,value:'new result'});a.version++;a.content=JSON.stringify(x,null,2);protocol.refresh(r);refresh();}return true;});
  E.action('b13-effective',c=>{c.openEditor('lens-effective:'+c.thread.id);return true;});
  E.action('b13-change-message',c=>{const s=session(),m=c.thread.messages.find(m=>m.id===s?.sourceId);if(m){m.body+=' Revision '+(++m.revision)+': preserve rank even when matching is case-insensitive.';L.engine.refresh(c.thread.id);refresh();}return true;});
  document.addEventListener('toggle',e=>{const id=e.target?.dataset?.b13Disclosure;if(id){if(e.target.open)disclosures.add(id);else disclosures.delete(id);}},true);
  document.addEventListener('input',e=>{const key=e.target?.dataset?.b13Reason;if(key)reasons.set(key,e.target.value);});
  E.chainAction('reset-all',()=>{for(const t of clocks.values())clearTimeout(t);clocks.clear();sessions.clear();reasons.clear();disclosures.clear();return false;});
  const G=window.PM56_REPAIR_DEMOS,previous=G.gallery;
  G.gallery=c=>'<section class="demo-section"><h3>Context Lens & Wonderer · Batch 13</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="b13-start" data-flow="'+id+'"><strong>'+c.esc(f.title)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+previous(c);
  window.PM56_WONDERER={protocol,admit,convergence:r=>protocol.convergence(r),augmentPlan,sourceResult,research,playCore};
  window.PM56_BATCH13={start,flows,snapshot:tid=>copy(session(tid)||null),currentRun:()=>current(E.ctx())};
})();
