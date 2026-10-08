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
  const sessions=new Map(), clocks=new Map(), reasons=new Map();let serial=0;
  const flows={
    shape:{title:'Shape, summarize, and restore',detail:'Mute → Focus → source preview → restore unchanged history',kind:'lens'},
    stale:{title:'A preview is not a promise',detail:'Change a source → reject stale Apply → review the new version',kind:'lens'},
    leads:{title:'Check an idea from another field',detail:'Check an idea → decide on it → one plan',kind:'wonderer'},
    dissent:{title:'A source changes; the disagreement stays',detail:'An old check is refused → check again → the disagreement is kept',kind:'wonderer'}
  };
  const run=id=>C.run(id), session=tid=>sessions.get(tid||E.ctx().thread.id);
  const current=c=>C.runsForThread(c.thread.id).find(r=>r.wonderer);
  const refresh=()=>{E.ctx().renderApp();E.ctx().renderOverlays();};
  /* 9.0/DON'T 18: a refusal reads as a sentence; the code stays out of the reading line */
  const REFUSED={explicit_reason_required:'Say why first: your reason goes into the plan with your choice.',lead_not_substantiated:'A check has to support it before it goes in the plan.',research_pending:'Wait for the check to finish.',refresh_stale_lead:'Check it again first: its source changed.',run_not_running:'The run isn’t running.',evidence_unavailable:'That source isn’t available.',no_evidence_selected:'This idea has no source to check.',lead_dropped:'This idea was set aside.'};
  function reply(r){if(!r?.ok)E.ctx().toast('Nothing changed',REFUSED[r?.error]||'That didn’t change anything.');refresh();return r;}
  function newThread(flow){
    const c=E.ctx(),tid='batch13-'+flow+'-'+(++serial),base=copy(c.state.threads.find(t=>t.id==='query'));
    Object.assign(base,{id:tid,title:flows[flow].title+(flows[flow].kind==='wonderer'?' · recorded example':' · local example'),status:'ready',pinned:false,archived:false,goalId:null,messages:[]});
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
    // IMPACT A1-01: a recorded draft is flagged; its rules are copied into the user field as prefill only
    d.mustHaves=input.constraints.filter(x=>x.hard).map(x=>x.text).join('\n');if(C.markRecorded)C.markRecorded(d);
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
  /* ---- presentation (G-26 · the Wonderer workspace, STORM-B): a pmxView with the Wonderer mark; one row per idea;
     "Bring the work together"; the run's Pause/Resume inside .b13-workspace (card 8: no Technical details). ---- */
  const S=window.PM56_SHELL;
  const STATE_WORD={hypothesis:'Hypothesis',research_pending:'Checking',researched:'Checked',unsubstantiated:'Not supported',user_decided:'Your choice',stale:'Out of date',dropped:'Set aside'};
  const PHASE_WORD={intake:'understanding the ask',blind_proposals:'drafting alone',normalize:'lining up the options',debate:'debating',evidence:'checking the facts',vote:'voting',synthesis:'ready to write the plan',completed:'plan written'};
  const wmark=size=>S.pmxMark({role:'wonderer',seat:7,size:size||22});
  function btn(c,action,label,attrs,disabled,primary){return '<button type="button" class="'+(primary?'primary-button':'text-button')+'" data-action="'+action+'" '+(attrs||'')+(disabled?' disabled':'')+'>'+label+'</button>';}
  function leadCard(c,r,l){
    const w=r.wonderer,esc=c.esc,attrs='data-run="'+esc(r.id)+'" data-lead="'+esc(l.id)+'"',running=r.status==='running';
    const busy=l.state==='research_pending'||w.pending.some(t=>t.leadId===l.id&&!t.finished);
    const canInclude=['researched','user_decided'].includes(l.state),canChoose=!['research_pending','stale','dropped'].includes(l.state);
    const why=[];
    if(!running)why.push('The run isn’t running, so nothing can change here.');
    else{
      if(busy)why.push('Checking the source now.');
      else if(!canInclude)why.push(l.state==='stale'?'Its source changed: check it again or set it aside.':'Use it in the plan once a check supports it, or make it your own decision.');
      if(!busy&&!canChoose&&l.state!=='stale')why.push('Check it again before making it your decision.');
    }
    const check=l.artifactId?btn(c,'b13-research',busy?'Checking…':l.evidence||l.state==='stale'?'Check it again':'Check it',attrs,!running||busy):'';
    const source=l.artifactId?btn(c,'b13-source','Open the source',attrs):'';
    const change=w.flow==='dissent'&&l.id==='fence'?btn(c,'b13-source-change','Change the sample','data-run="'+esc(r.id)+'"',!running):'';
    const state=STATE_WORD[l.state]||l.state;
    const said=l.evidence?esc(l.evidence.summary):l.state==='user_decided'?'No check supports it. It is in the plan only as your decision.':l.state==='stale'?'The source changed, so the earlier check no longer counts.':'Not checked yet. It is not a fact or a decision.';
    return '<section class="b13-lead" data-k="lead:'+esc(r.id+':'+l.id)+'" data-lead-id="'+esc(l.id)+'" data-state="'+esc(l.state)+'">'+
      '<p class="b13-idea">'+esc(l.claim)+'</p>'+
      '<p class="b13-line"><span>Relates to:</span> '+esc(l.dimension)+'</p><p class="b13-line"><span>Why it matters:</span> '+esc(l.tether)+'</p>'+
      '<p class="b13-state"><b>'+esc(state)+'</b> · '+said+'</p>'+
      (l.evidence?'<p class="b13-prov">'+esc(l.evidence.provenance)+' Version '+esc(l.evidence.version)+'.</p>':'')+
      (l.decision?'<p class="b13-decided"><b>'+(l.included?'In the plan':'Set aside')+'</b> · '+esc(l.decision.reason)+'</p>':'')+
      ((check||source||change)?'<div class="b13-acts">'+check+source+change+'</div>':'')+
      '<label class="b13-reason"><span>Why? This goes into the plan with your choice.</span><textarea data-k="reason:'+esc(r.id+':'+l.id)+'" data-b13-reason="'+esc(r.id+':'+l.id)+'" rows="2" placeholder="Say why you use it or set it aside.">'+esc(reasons.get(r.id+':'+l.id)||'')+'</textarea></label>'+
      '<div class="b13-acts">'+btn(c,'b13-decide',l.state==='user_decided'?'Keep my decision in the plan':'Use it in the plan',attrs+' data-kind="include"',!running||!canInclude)+
        btn(c,'b13-decide','Set aside',attrs+' data-kind="exclude"',!running||busy)+
        btn(c,'b13-decide','Use as my decision',attrs+' data-kind="user_decided"',!running||!canChoose)+'</div>'+
      (why.length?'<p class="pmx-reason b13-why">'+why.map(esc).join(' ')+'</p>':'')+
      '</section>';
  }
  /* The one reason "Write the plan" waits on the Wonderer's side (review fix: the card, the run view and this workspace
     print the same string). code: stale | pending | undecided | core | stopped | '' ; count = ideas still to decide. */
  function convergenceState(r,g){
    if(!r?.wonderer||!r.brainstorm)return {ok:true,code:'',reason:'',count:0};
    g=g||protocol.convergence(r);const leads=r.wonderer.leads||[],count=g.unresolved.length;
    if(r.brainstorm.synthesis)return {ok:true,code:'',reason:'',count:0};
    if(r.status!=='running')return {ok:false,code:'stopped',reason:'The run isn’t running.',count};
    if(leads.some(l=>l.state==='stale'))return {ok:false,code:'stale',reason:'Check or set aside the ideas that changed first.',count};
    if(leads.some(l=>l.state==='research_pending')||r.wonderer.pending.some(t=>!t.finished))return {ok:false,code:'pending',reason:'Wait for the check that is running to finish first.',count};
    if(!g.ok)return {ok:false,code:'undecided',reason:'Give each idea a decision first.',count};
    if(r.brainstorm.phase!=='synthesis')return {ok:false,code:'core',reason:'Finish the core round first.',count:0};
    return {ok:true,code:'',reason:'',count:0};
  }
  function convergenceReason(r,g){return convergenceState(r,g).reason;}
  function workspace(c,r){
    if(!r?.wonderer)return S.pmxView({key:'b13-none',cls:'b13-workspace',kind:'wonderer',markHtml:wmark(20),kindWord:'Wonderer',title:'Wonderer’s ideas',statusHtml:'Start a BrainStorm with Wonderer added first.'});
    const w=protocol.refresh(r),g=protocol.convergence(r),esc=c.esc,attrs='data-run="'+esc(r.id)+'"',running=r.status==='running';
    const core=r.participants.filter(p=>!p.additiveRoleKind||p.additiveRoleKind==='none'),b=r.brainstorm;
    const cp=w.corePlayback,acts=(running&&cp.status==='not_started'?btn(c,'b13-core','Play the core round',attrs):'')+btn(c,'brainstorm-open-results','See how they decided',attrs)+
      (running?btn(c,'collab-pause',S.pmxGlyph('pause',13)+'Pause',attrs):r.status==='paused'?btn(c,'collab-resume',S.pmxGlyph('play',13)+'Resume',attrs):'');
    const status='<b>'+(r.status==='paused'?'Paused':cp.status==='playing'?'The core round is playing':g.unresolved.length?plural(g.unresolved.length,'idea')+' to decide':'Every idea has a decision')+'</b> · Ideas from other fields. Each stays a hypothesis until it’s checked.';
    const why=convergenceReason(r,g),done=!!b.synthesis;
    const conv=S.pmxViewSection({key:'convergence:'+r.id,cls:'b13-convergence',title:'Bring the work together',
      body:'<p class="b13-say">'+(g.ok?'Every idea has a decision.':'Decide on '+plural(g.unresolved.length,'idea')+' first.')+' The core votes and the disagreement stay as they are.</p>'+
        '<p class="b13-say">Core round: '+esc(PHASE_WORD[b.phase]||b.phase)+' · '+plural(b.dissent.length,'disagreement')+' kept.</p>'+
        '<div class="b13-acts">'+btn(c,'collab-brainstorm-synthesize',done?'Open Plan':'Write the plan',attrs,!done&&!!why,true)+'</div>'+(why?'<p class="pmx-reason b13-why">'+esc(why)+'</p>':'')});
    const aside='<ul class="b13-aside"><li><b>'+plural(core.length,'core helper')+'</b> and one Wonderer</li><li><b>'+g.additions.length+'</b> in the plan · <b>'+g.unresolved.length+'</b> to decide</li><li>Wonderer never votes, so the core ballot is unchanged.</li>'+
      (cp.errors.length?'<li class="pmx-reason">The core round stopped. Replay the example to try again.</li>':'')+'</ul>';
    return S.pmxView({key:'b13-view:'+r.id,cls:'b13-workspace',attrs:'data-wonderer-run="'+esc(r.id)+'"',kind:'wonderer',markHtml:wmark(20),kindWord:'Wonderer · BrainStorm',title:'Wonderer’s ideas',
      statusHtml:status,actionsHtml:acts,mainHtml:'<div class="b13-leads">'+w.leads.map(l=>leadCard(c,r,l)).join('')+'</div>'+conv,asideHtml:aside});
  }
  function plural(n,one){return n+' '+one+(n===1?'':'s');}
  function lensCard(c){
    const s=session();if(!s)return '';
    return '<section class="b13-lens-tools" data-k="b13-lens-tools"><p class="b13-say"><b>What the assistant would read</b> · Lens never rewrites the conversation. Check what it would include, or change a message to test an out-of-date preview.</p><div class="b13-acts">'+btn(c,'b13-effective','See what it would read')+btn(c,'b13-change-message','Change message 2')+'</div></section>';
  }
  /* The guide reads the live state and moves on with the user (review fix): set up -> open the ideas -> check one ->
     decide on each -> write the plan -> done. Its caption is the run's provenance (the card's words). */
  function wondererStep(c,s){
    const r=current(c),esc=c.esc;
    if(!r)return {text:c.state.dialog?'Wonderer is already on the team. Press Start BrainStorm.':'Set up the BrainStorm. Wonderer is already on the team.'};
    const w=r.wonderer,leads=w?.leads||[],opened=s.opened||(c.state.editorTabs||[]).includes('wonderer:'+r.id),cp=w?.corePlayback||{},b=r.brainstorm||{};
    const open=[{action:'b13-open',label:'Open Wonderer’s ideas',attrs:'data-run="'+esc(r.id)+'"'}];
    if(['canceled','cancelled','failed'].includes(r.status)&&!b.synthesis)return {text:'This example ended. Everything so far is kept.'};
    if(b.synthesis)return {text:'Plan written. Wonderer’s ideas went in only as you decided; the core votes and the disagreement are unchanged. Nothing has been built.'};
    if(r.status==='paused')return {text:'Paused. Resume it from Wonderer’s ideas.',actions:opened?[]:open};
    if(!opened)return {text:'Open Wonderer’s ideas. Each one stays a hypothesis until it’s checked.',actions:open};
    const g=protocol.convergence(r),st=convergenceState(r,g);
    if(st.code==='stale')return {text:'A source changed, so its check no longer counts. Check that Wonderer idea again or set it aside.'};
    const checked=leads.some(l=>l.evidence||l.decision||l.state==='research_pending');
    if(!checked)return {text:(cp.status==='not_started'?'Play the core round, then check one of Wonderer’s ideas.':'Check one of Wonderer’s ideas.')+' A check alone never puts an idea in the plan.'};
    if(!g.ok){const n=g.unresolved.length,how='use it in the plan, set it aside or use it as your decision. Say why first.';return {text:n===leads.length?'Decide on each of Wonderer’s ideas: '+how:n===1?'One of Wonderer’s ideas is left. Decide on it: '+how:n+' of Wonderer’s ideas are left. Decide on each: '+how};}
    if(st.code==='core'||st.code==='pending')return {text:'Every Wonderer idea has a decision. '+(st.code==='core'?(cp.status==='not_started'?'Play the core round, then write the plan.':'Wait for the core round to finish, then write the plan.'):'Wait for the check to finish, then write the plan.')};
    return {text:'Every Wonderer idea has a decision. Press Write the plan: one plan, with the disagreement kept.'};
  }
  function guide(c){
    const s=session(c.thread.id);if(!s?.guide)return '';
    const lens=flows[s.flow].kind==='lens',step=lens?{text:'Open Lens beside search. Pick a mode, select messages, then preview or seal.'}:wondererStep(c,s);
    /* the Wonderer flows are recorded examples: the caption is the card's (PM56_COLLAB.provenance), Lens stays local */
    const r=lens?null:current(c),recorded=!lens&&(r?C.provenance(r.id)==='recorded':!!(C.isRecordedDraft&&C.isRecordedDraft(C.draft())));
    return S.pmxGuide({key:'b13-guide',cls:'b13-guide',placement:'dock',caption:recorded?undefined:'Local example · no AI cost',step:c.esc(step.text),actions:step.actions||[],close:{action:'b13-hide-guide',label:'Close the guide'}});
  }
  E.slot('composerBelow',guide);
  E.slot('transcriptMessage',c=>{
    if(c.m?.type==='b13-lens-controls')return lensCard(c);
    if(c.m?.type!=='b13-wonderer')return '';
    const r=current(c),g=r?protocol.convergence(r):null,tid=c.esc(c.thread.id);
    /* the one-line receipt in the ledger grammar (G-26) */
    return S.pmxLedgerLine({key:'b13-entry:'+tid,cls:'b13-entry',kind:'wonderer',markHtml:wmark(16),kindWord:'Wonderer',title:'Wonderer’s ideas',
      headline:r?plural(r.wonderer.leads.length,'idea')+' from other fields · '+g.additions.length+' in the plan · '+g.unresolved.length+' to decide':'Ideas from other fields, kept apart from the vote',
      actions:[{action:r?'b13-open':'b13-configure',label:r?'Open':'Set up BrainStorm',attrs:'data-run="'+c.esc(r?.id||'')+'"'}]});
  });
  E.slot('editorTabLabel',c=>c.editorId?.startsWith('wonderer:')?'Wonderer’s ideas':c.editorId?.startsWith('wonder-source:')?'Wonderer · source':c.editorId?.startsWith('lens-effective:')?'What it would read':'');
  E.slot('editorDocument',c=>{
    if(c.editorId?.startsWith('wonderer:'))return workspace(c,run(c.editorId.slice(9)));
    if(c.editorId?.startsWith('wonder-source:')){const a=D.artifacts.find(a=>a.id===c.editorId.slice(14)),on=a?.status==='active';
      return S.pmxView({key:'b13-src:'+c.editorId.slice(14),cls:'b13-source',kind:'wonderer',markHtml:wmark(20),kindWord:'Wonderer · source',title:c.esc(a?.name||'Source unavailable'),
        statusHtml:'Shared file · version '+c.esc(a?.version??'unknown'),mainHtml:'<pre class="b13-pre">'+c.esc(on?a.content:'This source is no longer available.')+'</pre>'+(a?.provenance?'<p class="b13-say">'+c.esc(a.provenance)+'</p>':'')});}
    if(c.editorId?.startsWith('lens-effective:')){const tid=c.editorId.slice(15),f=L.effectiveHistory(tid);
      return S.pmxView({key:'b13-eff:'+tid,cls:'b13-source',kind:'lens',markHtml:S.pmxGlyph('eye',20),kindWord:'Lens',title:'What the assistant would read',
        statusHtml:'A read-only view of the selected messages and their linked summaries, in order. Focus marks priority; it does not claim to be a real provider prompt.',mainHtml:'<pre class="b13-pre">'+c.esc(JSON.stringify(f,null,2))+'</pre>'});}
    return '';
  });
  E.action('b13-start',(c,b)=>{start(b.dataset.flow);return true;});
  E.action('b13-hide-guide',c=>{const s=session();if(s)s.guide=false;refresh();return true;});
  E.action('b13-open',(c,b)=>{const s=session();if(s)s.opened=true;c.openEditor('wonderer:'+b.dataset.run);return true;});
  E.action('b13-configure',c=>{const s=session();if(s)start(s.flow);return true;});
  E.action('b13-core',(c,b)=>{playCore(run(b.dataset.run));return true;});
  E.action('b13-research',(c,b)=>{research(run(b.dataset.run),b.dataset.lead);return true;});
  E.action('b13-source',(c,b)=>{const l=protocol.lead(run(b.dataset.run),b.dataset.lead);if(l?.artifactId)c.openEditor('wonder-source:'+l.artifactId);return true;});
  E.action('b13-decide',(c,b)=>{reply(protocol.decide(run(b.dataset.run),b.dataset.lead,b.dataset.kind,reasons.get(b.dataset.run+':'+b.dataset.lead)||''));return true;});
  E.action('b13-source-change',(c,b)=>{const r=run(b.dataset.run);if(!r||r.status!=='running')return true;const a=D.artifacts.find(a=>a.id===r.wonderer.artifactIds[0]);if(a){const x=JSON.parse(a.content);x.latestRequest++;x.arrivals.unshift({requestId:x.latestRequest,value:'new result'});a.version++;a.content=JSON.stringify(x,null,2);protocol.refresh(r);refresh();}return true;});
  E.action('b13-effective',c=>{c.openEditor('lens-effective:'+c.thread.id);return true;});
  E.action('b13-change-message',c=>{const s=session(),m=c.thread.messages.find(m=>m.id===s?.sourceId);if(m){m.body+=' Revision '+(++m.revision)+': preserve rank even when matching is case-insensitive.';L.engine.refresh(c.thread.id);refresh();}return true;});
  document.addEventListener('input',e=>{const key=e.target?.dataset?.b13Reason;if(key)reasons.set(key,e.target.value);});
  E.chainAction('reset-all',()=>{for(const t of clocks.values())clearTimeout(t);clocks.clear();sessions.clear();reasons.clear();return false;});
  const G=window.PM56_REPAIR_DEMOS,previous=G.gallery;
  G.gallery=c=>'<section class="demo-section"><h3>Context Lens and Wonderer</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="b13-start" data-flow="'+id+'"><strong>'+c.esc(f.title)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+previous(c);
  window.PM56_WONDERER={protocol,admit,convergence:r=>protocol.convergence(r),convergenceState:r=>convergenceState(r),convergenceReason:r=>convergenceReason(r),augmentPlan,sourceResult,research,playCore};
  window.PM56_BATCH13={start,flows,snapshot:tid=>copy(session(tid)||null),currentRun:()=>current(E.ctx())};
})();
