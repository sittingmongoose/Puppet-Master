/* Batch 13: four self-contained local exercises on the existing owners.
 * No provider/network calls. No product persistence or runtime admission.
 * Evidence samples are inspectable artifacts; only a small JS fence is tested.
 * DL-218 (2026-10-20): the two Wonderer exercises are BrainStorm recorded examples of the Wonderer running alongside
 * the run. Its leads are held until every blind proposal is in, the team decides each one in the Debate (the
 * Coordinator records it, with a one-line reason), explored leads are researched in the Evidence round, and Write the
 * plan waits only for the team's decisions or research, never for you. Your one override is Check it. The lead engine
 * and every lead surface are PM56_WG (wonderer-grill.js); this file plays the recording and draws the Wonderer
 * workspace, the BrainStorm's fine document view of the leads.
 */
(function () {
  'use strict';
  const E=window.PM56_EXT, C=window.PM56_COLLAB, B=window.PM56_BRAINSTORM;
  const D=window.PM56_DATA, L=window.PM56_LENS, BD=window.PM56_BRAINSTORM_DEMOS;
  const copy=x=>JSON.parse(JSON.stringify(x));
  const WG=()=>window.PM56_WG;
  const sessions=new Map(), clocks=new Map();let serial=0;
  const flows={
    shape:{title:'Shape, summarize, and restore',detail:'Mute → Focus → source preview → restore unchanged history',kind:'lens'},
    stale:{title:'A preview is not a promise',detail:'Change a source → reject stale Apply → review the new version',kind:'lens'},
    leads:{title:'The team weighs the Wonderer’s leads',detail:'Grill Me at intake → leads held until every proposal is in → decided in the Debate → Write the plan waits for the team',kind:'wonderer'},
    dissent:{title:'A rule beats the vote; the Wonderer stays out of it',detail:'Leads released at Line up → one explored and not supported → the rule wins → every lead in the plan',kind:'wonderer'}
  };
  const run=id=>C.run(id), session=tid=>sessions.get(tid||E.ctx().thread.id);
  const current=c=>C.runsForThread(c.thread.id).find(r=>r.wonderer);
  const refresh=()=>{E.ctx().renderApp();E.ctx().renderOverlays();};
  const ms=v=>window.PM56_CLOCK&&window.PM56_CLOCK.ms?window.PM56_CLOCK.ms(v):v;
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
    const input=BD.fixture(flow==='dissent'?'constraint':'synthesis'),grill=flow==='leads';
    t.messages=[{id:tid+'-request',role:'user',type:'text',body:input.objective+(grill?' Ask me what you need to know first.':' Collection contents must stay on the device.')}];
    C.openConfigure('brainstorm');const d=C.draft();
    d.name=flows[flow].title;d.purpose=input.objective;d.brainstormInput=input;d.wonderer=true;d.grillMe=grill;
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
  /* ---- the recording (DL-218). Grill Me at intake (the Coordinator, before the blind proposals), then pass 1 of the
     Wonderer, explored in its own context from the start and HELD until every blind proposal is in; released at Line
     up, decided in the Debate (pass 2 is asked for there by a helper), explored in the Evidence round. ---- */
  const GRILL=[
    {id:'d-where',title:'Where search runs',prompt:'Keep everything on this device, with no upload?',why:'It decides which options the team may draft.',options:[{label:'Yes, nothing leaves the device'},{label:'Allow an upload for big collections'}],recommended:'Yes, nothing leaves the device'},
    {id:'d-rank',title:'Ranking',prompt:'Keep the current ranking for results?',why:'Changing it changes what people see first.',options:[{label:'Yes, keep today’s ranking'},{label:'Rank by recency instead'}],recommended:'Yes, keep today’s ranking'},
    {id:'f-size',kind:'fact',title:'How big a typical collection is'},
    {id:'d-target',title:'Size to stay fast for',prompt:'Stay fast up to 10,000 items?',why:'Research found a typical collection holds about 2,000 items.',dependsOn:['f-size'],options:[{label:'Yes, up to 10,000 items'},{label:'Up to 100,000 items'},{label:'Whatever fits on the device'}],recommended:'Yes, up to 10,000 items'},
    {id:'d-fallback',title:'Fallback',prompt:'Keep the plain local filter as the fallback?',why:'Asked now that search stays on the device.',dependsOn:['d-where'],options:[{label:'Yes, keep it as the fallback'},{label:'No fallback'}],recommended:'Yes, keep it as the fallback'}
  ];
  const PASS1={summary:'Explored the ground around responsive search over a local collection: how networks drop stale replies, where a worker stops paying for itself, what people feel as “instant”, and searching less often instead of faster.',
    angles:[{key:'adjacent',signal:'strong: stale replies are an ordering problem'},{key:'scale',signal:'a worker costs a fixed start-up'},{key:'human',signal:'instant means about a tenth of a second'},{key:'inversion',signal:'search less often'}],
    leads:[
      {id:'fence',angle:'adjacent',title:'Treat stale search replies like out-of-order network packets: keep only the newest request’s answer.',tether:'Typing fast fires many searches; an old reply must never replace a newer result.',source:{kind:'url',url:'https://en.wikipedia.org/wiki/Out-of-order_delivery',label:'wikipedia.org · Out-of-order delivery'},
       dossier:{found:'Protocols number each request and drop any answer older than the newest one.',why:'It makes a worker safe to use without a new mechanism.',next:'Run the ordering sample against the proposed fence.'}},
      {id:'speed',angle:'scale',title:'A worker pays a fixed start-up and copy cost; below some size a plain filter wins.',tether:'The question asks for responsive search, so the cut-off needs measuring on real devices.',source:{kind:'url',url:'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers',label:'developer.mozilla.org · Using web workers'},
       dossier:{found:'Creating a worker and copying data to it takes time before any search runs.',why:'It bounds when the worker option is worth it.',next:'Measurements on the slowest supported device.'}},
      {id:'instant',angle:'human',title:'People feel an answer as instant within about a tenth of a second, then wait for refinement.',tether:'The local filter could answer at once while the full search finishes.',source:{kind:'url',url:'https://www.nngroup.com/articles/response-times-3-important-limits/',label:'nngroup.com · Response times'},
       dossier:{found:'0.1 s feels instant; 1 s keeps the flow of thought.',why:'It turns “responsive” into a number the plan can test.',next:'Nothing; use it as the target.'}},
      {id:'debounce',angle:'inversion',title:'Instead of searching faster, search only when typing pauses.',tether:'Fewer searches would mean fewer stale replies to throw away.',source:{kind:'url',url:'https://developer.mozilla.org/en-US/docs/Glossary/Debounce',label:'developer.mozilla.org · Debounce'},
       dossier:{found:'Waiting for a pause cuts the number of searches sharply.',why:'It inverts the problem.',next:'Whether the delay is acceptable.'}}
    ]};
  const PASS2={summary:'A second pass, asked for by Adversarial Review, around what happens to the ranking when results arrive in pieces.',
    angles:[{key:'contradiction',signal:'strong: streaming reorders the list'},{key:'history',signal:'desktop search indexes up front'},{key:'future',signal:'people will want full text next'}],
    leads:[
      {id:'reorder',angle:'contradiction',title:'Search that shows partial results can reorder the list under the cursor.',tether:'The must-have says ranking must be preserved.',source:{kind:'message',from:'ask',label:'Adversarial Review’s question'},
       dossier:{found:'Lists that grow while you aim at them move what you meant to click.',why:'It is how a correct ranking can still feel wrong.',next:'Whether the options show results only once complete.'}},
      {id:'index',angle:'history',title:'Early desktop search indexed everything up front so typing never waited.',tether:'A local snapshot index is the same move at small scale.',source:{kind:'url',url:'https://en.wikipedia.org/wiki/Desktop_search',label:'wikipedia.org · Desktop search'}},
      {id:'fulltext',angle:'future',title:'Once search is instant, people expect it to search inside documents too.',tether:'The design should not rule out a richer index later.',source:{kind:'url',url:'https://en.wikipedia.org/wiki/Full-text_search',label:'wikipedia.org · Full-text search'}}
    ]};
  const DECIDE1=[['fence','explore','If it holds, it settles the worker option’s biggest risk.'],['speed','explore','We can’t claim a speed-up without numbers.'],['instant','use','Gives “responsive” a target; it stays a hypothesis.'],['debounce','set_aside','A pause adds delay to every search; the options already drop stale replies.']];
  /* a later pass is decided on delivery (steer 2026-10-20) */
  const DECIDE2=[['reorder','explore','Check it against the ranking rule before we vote.'],['index','use','Backs the snapshot approach; still a hypothesis.'],['fulltext','set_aside','Out of scope for this decision; noted for later.']];
  const PASS3={summary:'A last pass, asked for by Implementation, around what breaks when a collection is huge.',stopReason:'the rest of what it found repeated the earlier passes.',
    angles:[{key:'scale',signal:'the copy before the search'},{key:'dependency',signal:'nothing new'},{key:'future',signal:'nothing new'}],
    leads:[{id:'huge',angle:'scale',title:'A snapshot of a very large collection can take longer to copy than the search it serves.',tether:'The snapshot worker copies the collection before it searches it.',source:{kind:'message',from:'ask',label:'Implementation’s question'}}]};
  const DECIDE3=[['huge','explore','Check the copy cost before the plan settles a size.']];
  /* Grill Me turned on mid-run (the 'dissent' recording): one round at the next chapter, gating only the vote */
  const MIDRUN=[{id:'d-optin',title:'Opt-in upload',prompt:'Rule out any upload, even one people opt into?',why:'It decides whether the hosted option can be voted on. Only the vote waits for your answer; the debate goes on.',options:[{label:'Yes, no upload at all'},{label:'Allow an opt-in upload'}],recommended:'Yes, no upload at all'}];
  function admit(r,d){
    const W=WG();if(!W)return {ok:false,error:'wonderer_unavailable'};
    if(!W.engine.state(r))W.attach(r,d);
    const w=r.wonderer;if(!w)return {ok:false,error:'wonderer_not_configured'};
    w.flow=d.wondererInput.flow;w.corePlayback={cursor:0,status:'not_started',errors:[],step:0,at:{}};
    const fence=artifact(r,'fence','Latest-query fence.json',{kind:'latest_query_fence',latestRequest:2,arrivals:[{requestId:2,value:'new result'},{requestId:1,value:'old result'}],expected:'new result'});
    const measure=artifact(r,'measurement','Measurement availability.json',{kind:'measurement_availability',measurements:[],note:'No worker startup, transfer, latency, CPU or memory measurements have been supplied.'});
    w.artifactIds=[fence.id,measure.id];
    W.startPass(r,{kind:'start'});
    const s=session(r.threadId);if(s)s.runId=r.id;
    if(W.grillOn(r)){const g=W.begin('run:'+r.id,{by:'coordinator',subject:r.purpose,tree:copy(GRILL),cap:(r.config.questionLimit||20)+(r.config.grillExtension||25)});if(!g.ok)w.corePlayback.errors.push(g.error);}
    arm(r);return {ok:true};
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
  /* research by a core helper (the Wonderer never explores its own leads), from the supplied evidence samples */
  function researchResult(r,id){
    const w=r.wonderer;
    if(id==='fence'){const a=D.artifacts.find(a=>a.id===w.artifactIds[0]),res=sourceResult(a);return res.ok&&res.record.outcome==='supports'?{outcome:'supported',note:'The fence keeps only the newest request’s answer; the old reply is dropped.',evidence:{label:'Latest-query fence sample, version '+a.version,artifactId:a.id}}:{outcome:'not_supported',note:'The ordering sample did not keep only the newest answer.'};}
    if(id==='speed'){const a=D.artifacts.find(a=>a.id===w.artifactIds[1]),res=sourceResult(a);return {outcome:'not_supported',note:res.ok?'No device measurements were supplied, so nothing supports a cut-off yet.':'The measurement sample could not be read.'};}
    if(id==='reorder')return {outcome:'supported',note:'Showing partial results reorders the list; the options show results only once complete, so ranking holds.',evidence:{label:'Local query check: ranking kept when results arrive whole'}};
    if(id==='index')return {outcome:'supported',note:'The snapshot answers the two-row sample in one pass, without waiting on a network.',evidence:{label:'Local query check'}};
    if(id==='huge')return {outcome:'not_supported',note:'At the agreed 10,000 items the copy is small; it only matters far beyond the size the plan sets.'};
    return {outcome:'not_supported',note:'Nothing in the supplied samples supports it.'};
  }
  const RESEARCHER={fence:2,speed:2,reorder:0,index:1,instant:1,debounce:3,fulltext:0,huge:2};
  function say(r,body,o){return C.appendMessage(r.id,Object.assign({senderKind:'coordinator',senderName:'Coordinator',messageType:'message',body},o||{}));}
  function deliverPass(r,n){
    const W=WG(),w=r.wonderer,pass=w.passes[n],spec=copy(n===2?PASS3:n?PASS2:PASS1);
    spec.leads.forEach(l=>{if(l.source.kind==='message'){const m=r.messages.find(x=>x.id===pass.askedIn);l.source=m?{kind:'message',messageId:m.id,label:l.source.label}:{kind:'url',url:'https://en.wikipedia.org/wiki/Search_engine_indexing',label:'wikipedia.org'};}});
    return W.deliverPass(r,pass.id,spec);
  }
  /* one step per tick, on the run's own clock; it waits whenever the next move is yours (a grilling round, Confirm) */
  function steps(r){
    const W=WG(),records=BD.expected(r,r.wonderer.flow==='dissent'?'constraint':'synthesis'),a=r.brainstorm.attempts,x=()=>({epoch:r.stopEpoch,sourceHash:r.brainstorm.input.sourceHash});
    const P=i=>r.participants.find(p=>p.id===a[i].participantId),pass2=r.wonderer.flow==='leads';
    const out=[],say2=(x,d)=>say(r,'Lead '+W.engine.lead(r,x).n+': '+({explore:'explore',use:'use',set_aside:'set aside'})[d[0]]+'. '+d[1]+(d[0]==='explore'?' It is checked in the Evidence round.':''));
    /* the first pass runs during intake, before the blind proposals take the concurrency (steer 2026-10-20) */
    out.push({wait:300,run:()=>{if(r.wonderer.passes[0].status==='exploring')return 'later';a.forEach((t,i)=>{const p=P(i);p.status='working';p.current='Drafting alone';});return {ok:true};}});
    a.forEach((attempt,i)=>out.push({wait:650,run:()=>B.submitProposal(r.id,{...x(),attemptId:attempt.id,assignmentRevision:attempt.assignmentRevision,proposal:copy(records.proposals[i])})}));
    out.push({wait:700,run:()=>r.wonderer.passes[0].status==='exploring'?'later':B.normalize(r.id,x())});
    /* Grill Me turned on mid-run: the Coordinator grills you at this chapter boundary; only the vote waits */
    out.push({wait:300,run:()=>{if(!W.takeMidRun(r))return {ok:true};say(r,'Grill Me is on now, so I have one decision for you. The debate goes on while you answer; only the vote waits for it.');return W.begin('run:'+r.id,{by:'coordinator',subject:r.purpose,tree:copy(MIDRUN),cap:(r.config.questionLimit||20)+(r.config.grillExtension||25),gate:'vote',gateLabel:'the vote'});}});
    out.push({wait:900,run:()=>B.debate(r.id,{...x(),round:1,messages:[
      {participantId:a[1].participantId,body:'The Wonderer’s third lead fits: answer from the local filter at once, then refine. It stays a hypothesis until we measure.',evidenceRefs:['requirements','latency']},
      {participantId:a[3].participantId,body:'Wonderer, look wider around what happens to the ranking when results arrive in pieces. Streaming could reorder what people are looking at.',evidenceRefs:['requirements','query']}]})});
    out.push({wait:300,run:()=>{
      const msgs=r.messages.filter(m=>m.senderKind==='participant'),take=msgs.find(m=>m.senderId===a[1].participantId&&/third lead/.test(m.body)),ask=msgs.find(m=>m.senderId===a[3].participantId&&/^Wonderer,/.test(m.body));
      if(take)W.engine.takeUp(r,'instant',take.id,{id:a[1].participantId});
      /* the debate holds the slots, so the pass Adversarial Review asks for queues behind it */
      if(pass2&&ask){const p=P(3);return W.startPass(r,{kind:'participant',id:p.id,name:p.role},'what happens to the ranking when results arrive in pieces',ask.id,{queue:true});}
      return {ok:true};}});
    out.push({wait:400,run:()=>{say(r,'Recording the team’s decision on each of the Wonderer’s first four leads, from this round of the debate.');return {ok:true};}});
    DECIDE1.forEach(d=>out.push({wait:750,run:()=>{const res=W.dispose(r,d[0],d[1],d[2]);if(res.ok)say2(d[0],[d[1],d[2]]);return res;}}));
    if(pass2){
      out.push({wait:500,run:()=>{const q=r.wonderer.passes[1];if(q&&q.status==='queued'){W.engine.startQueued(r);}return {ok:true};}});
      out.push({wait:1700,run:()=>r.wonderer.passes[1]&&r.wonderer.passes[1].status==='exploring'?deliverPass(r,1):{ok:true}});
      out.push({wait:300,run:()=>{say(r,'The Wonderer’s second pass is in. Deciding its leads as they arrive.');return {ok:true};}});
      DECIDE2.forEach(d=>out.push({wait:650,run:()=>{const res=W.dispose(r,d[0],d[1],d[2]);if(res.ok)say2(d[0],[d[1],d[2]]);return res;}}));
    }
    out.push({wait:900,run:()=>B.debate(r.id,{...x(),round:2,messages:[
      {participantId:a[0].participantId,body:pass2?'Lead 5 matters: if partial results reorder the list, the plan should show results only once they are complete.':'Measure startup and transfer costs before choosing a default cutoff.',evidenceRefs:['query','latency']},
      {participantId:a[2].participantId,body:'Lead 1’s fence is cheap: keep only the newest request’s answer, whatever else we choose.',evidenceRefs:['requirements','capabilities']}]})});
    out.push({wait:300,run:()=>{const msgs=r.messages.filter(m=>m.senderKind==='participant');const m5=msgs.find(m=>m.senderId===a[0].participantId&&/^Lead 5/.test(m.body)),m1=msgs.find(m=>m.senderId===a[2].participantId&&/fence/.test(m.body));if(m5)W.engine.takeUp(r,'reorder',m5.id,{id:a[0].participantId});if(m1)W.engine.takeUp(r,'fence',m1.id,{id:a[2].participantId});return {ok:true};}});
    out.push({wait:800,run:()=>B.recordEvidence(r.id,{...x(),checks:r.brainstorm.proposals.map(q=>({proposalId:q.id,evidenceRefs:q.evidenceRefs,summary:q.facts.networkRequired?'This candidate requires a network and fails the offline rule.':'This candidate preserves local data; device performance is unmeasured.'}))})});
    /* the Evidence round researches every lead the team explores, each by a core helper */
    ['fence','speed','reorder'].forEach(id=>out.push({wait:700,run:()=>{const l=W.engine.lead(r,id);if(!l||!l.research||l.research.status!=='queued')return {ok:true};const p=r.participants[RESEARCHER[id]];return W.engine.startResearch(r,id,{id:p.id,name:p.role});}}));
    ['fence','speed','reorder'].forEach(id=>out.push({wait:900,run:()=>{const l=W.engine.lead(r,id);if(!l||!l.research||l.research.status!=='running')return {ok:true};return W.engine.finishResearch(r,id,researchResult(r,id));}}));
    /* at the vote Implementation asks for one last pass: Write the plan waits while it is in flight */
    if(pass2)out.push({wait:700,gate:'vote',run:()=>{const p=P(2),m=C.appendMessage(r.id,{senderKind:'participant',senderId:p.id,senderName:p.role,messageType:'request',recipientIds:[r.wonderer.participantId],body:'Wonderer, one last look: what breaks when a collection is huge?'});return W.startPass(r,{kind:'participant',id:p.id,name:p.role},'what breaks when a collection is huge',m.id,{queue:false});}});
    out.push({wait:900,gate:pass2?'':'vote',run:()=>{for(let i=0;i<a.length;i++){const res=B.vote(r.id,a[i].participantId,{...x(),...copy(records.votes[i])});if(!res.ok)return res;}return {ok:true};}});
    out.push({wait:900,run:()=>B.decide(r.id,{...x(),selectedProposalId:'worker',reason:r.wonderer.flow==='dissent'?'Choose the local snapshot path. The hosted option has more recorded support but violates the no-upload requirement; those preferences stay as dissent.':'Choose a local snapshot design with a reversible fallback. The offline constraint remains controlling; recorded opposing preferences remain dissent, and no unmeasured speedup is asserted.',steps:records.steps})});
    /* Write the plan waits (CWR-041, steer 2026-10-20): while the last pass is in flight, while its lead is undecided (it
       is decided on delivery), and while its research and any lead you sent with Check it are out */
    if(pass2){
      out.push({wait:2600,run:()=>r.wonderer.passes[2]&&r.wonderer.passes[2].status==='exploring'?deliverPass(r,2):{ok:true}});
      DECIDE3.forEach(d=>out.push({wait:900,run:()=>{const l=W.engine.lead(r,d[0]);if(!l||l.disposition)return {ok:true};const res=W.dispose(r,d[0],d[1],d[2]);if(res.ok)say(r,'The last pass is in. Lead '+l.n+': explore. '+d[2]);return res;}}));
    }
    out.push({wait:600,run:()=>{r.wonderer.leads.filter(l=>l.research&&l.research.status==='queued').forEach(l=>{const p=r.participants[RESEARCHER[l.id]||1];W.engine.startResearch(r,l.id,{id:p.id,name:p.role});});return {ok:true};}});
    out.push({wait:3000,run:()=>{const q=r.wonderer.leads.filter(l=>l.research&&l.research.status==='running');q.forEach(l=>W.engine.finishResearch(r,l.id,researchResult(r,l.id)));return {ok:true};}});
    return out;
  }
  function arm(r){if(clocks.has('core:'+r.id))return;clocks.set('core:'+r.id,setInterval(()=>tick(r),ms(450)));}
  function stopClock(r){const t=clocks.get('core:'+r.id);if(t)clearInterval(t);clocks.delete('core:'+r.id);}
  function tick(r){
    const W=WG(),w=r.wonderer,cp=w&&w.corePlayback;if(!w||!cp)return stopClock(r);
    if(r.status==='paused')return;
    if(r.status!=='running'){cp.status=r.status==='completed'?'completed':'stopped';return stopClock(r);}
    const at=(k,wait)=>{const t=Date.now();if(cp.at[k]==null){cp.at[k]=t;return false;}return t-cp.at[k]>=ms(wait);};
    /* research finds the intake fact while you answer; the Wonderer's first pass lands, held, while you are grilled */
    const s=r.grill;
    if(s&&s.tree.some(n=>n.id==='f-size'&&n.state==='researching')&&at('fact',1600)){W.factFound('run:'+r.id,'f-size','about 2,000 items (median of the collection stats)');refresh();return;}
    if(w.passes[0]&&w.passes[0].status==='exploring'&&at('pass1',2600)){deliverPass(r,0);refresh();return;}
    if(W.holds(r)||cp.status==='completed'||cp.status==='failed')return;
    if(cp.status==='not_started')cp.status='playing';
    const list=cp.list||(cp.list=steps(r)),st=list[cp.step];
    if(!st){cp.status='completed';refresh();return stopClock(r);}
    if(!at('s'+cp.step,st.wait))return;
    /* at the vote the recording gives you a moment to Check a lead (optional; it goes on without you) */
    if(st.gate==='vote'&&!cp.offered){cp.offered=true;cp.at['s'+cp.step]=Date.now()+ms(4200);refresh();return;}
    const res=st.run();
    if(res==='later')return;
    /* a later grilling session gates only its own step: this step waits, the rest already ran */
    if(res&&res.ok===false&&/grill_me_waits_for_confirm|a_session_is_already_open/.test(res.error))return;
    if(res&&res.ok===false){cp.status='failed';cp.errors.push(res.error);refresh();return stopClock(r);}
    cp.step++;cp.cursor=cp.step;refresh();
  }
  function playCore(r){if(r&&r.wonderer&&r.wonderer.corePlayback)arm(r);}
  /* the one reason Write the plan waits on the Wonderer's side (PM56_WG.gate), worded once for the card, the
     BrainStorm view and this workspace */
  function gateState(r){
    if(!r?.wonderer||!r.brainstorm)return {ok:true,code:'',reason:'',count:0};
    if(r.brainstorm.synthesis)return {ok:true,code:'',reason:'',count:0};
    const g=WG().gate(r);if(!g.ok)return g;
    if(r.status!=='running')return {ok:false,code:'stopped',reason:'The run isn’t running.',count:0};
    if(r.brainstorm.phase!=='synthesis')return {ok:false,code:'core',reason:'The team is still working through the chapters.',count:0};
    return {ok:true,code:'',reason:'',count:0};
  }
  /* ---- presentation: the Wonderer workspace (G-26 STORM-B, rebuilt for DL-218). A pmxView with the Wonderer's mark:
     every pass and lead with its status in place (the shared PM56_WG rows: angle, tether, source, the team's decision
     and reason, who recorded it, research results, the dossier on demand, Check it), the held state, and Write the plan
     with the one reason it waits. Nothing here asks you to decide a lead: the team does. No Technical details. ---- */
  const S=window.PM56_SHELL;
  const PHASE_WORD={intake:'understanding the ask',blind_proposals:'drafting alone',normalize:'lining up the options',debate:'debating',evidence:'checking the facts',vote:'voting',synthesis:'ready to write the plan',completed:'plan written'};
  const wmark=size=>S.pmxMark({role:'wonderer',seat:7,size:size||22});
  function btn(c,action,label,attrs,disabled,primary){return '<button type="button" class="'+(primary?'primary-button':'text-button')+'" data-action="'+action+'" '+(attrs||'')+(disabled?' disabled':'')+'>'+label+'</button>';}
  function plural(n,one){return n+' '+one+(n===1?'':'s');}
  function workspace(c,r){
    if(!r?.wonderer)return S.pmxView({key:'b13-none',cls:'b13-workspace',kind:'wonderer',markHtml:wmark(20),kindWord:'Wonderer',title:'Wonderer’s leads',statusHtml:'Start a BrainStorm with the Wonderer added first.'});
    const W=WG(),w=r.wonderer,esc=c.esc,attrs='data-run="'+esc(r.id)+'"',running=r.status==='running',b=r.brainstorm,cnt=W.counts(r);
    const held=w.passes.some(p=>p.status==='held'),exploring=w.passes.some(p=>p.status==='exploring');
    const acts=btn(c,'brainstorm-open-results','See how they decided',attrs)+
      (running?btn(c,'collab-pause',S.pmxGlyph('pause',13)+'Pause',attrs):r.status==='paused'?btn(c,'collab-resume',S.pmxGlyph('play',13)+'Resume',attrs):'');
    const lead=exploring?'Exploring':held?'Held until every proposal is in':cnt.waiting?plural(cnt.waiting,'lead')+' waiting for the team':cnt.exploring?plural(cnt.exploring,'lead')+' being checked':cnt.total?'Every lead decided':'Starting';
    const status='<b>'+esc(lead)+'.</b> '+esc(W.countsText(r)?W.countsText(r)+'.':'It runs alongside the BrainStorm.')+' It never votes, argues or takes a turn.';
    const g=gateState(r),done=!!b.synthesis;
    const conv=S.pmxViewSection({key:'convergence:'+r.id,cls:'b13-convergence',title:'Write the plan',
      body:'<p class="b13-say">'+(done?'The plan is written. It lists every lead with the team’s decision and its reason.':g.ok?'Every lead has a decision and nothing is in research. The plan will list each one with its reason; a lead the team used stays a hypothesis.':esc(g.reason))+'</p>'+
        '<p class="b13-say">Core round: '+esc(PHASE_WORD[b.phase]||b.phase)+' · '+plural(b.dissent.length,'disagreement')+' kept.</p>'+
        '<div class="b13-acts">'+btn(c,done?'brainstorm-open-plan':'collab-brainstorm-synthesize',done?'Open Plan':'Write the plan',attrs,!done&&!g.ok,true)+'</div>'+(!g.ok&&!done?'<p class="pmx-reason b13-why">Write the plan waits for the team’s decisions and for research, never for you.</p>':'')});
    const passes=w.passes.slice().reverse().map(p=>W.passBlock(r,p,{where:'view'})).join('')||'<p class="b13-say">The Wonderer’s first pass starts with the run.</p>';
    const aside='<ul class="b13-aside"><li><b>The team decides each lead</b>: explore it, use it or set it aside, with a reason you can read. The Coordinator records it.</li>'+
      '<li><b>Your one override</b> is Check it: it sends any lead to research, whatever the team decided.</li>'+
      '<li><b>'+plural(w.passes.length,'pass')+'</b> of up to 3 · '+W.engine.passesLeft(r)+' more only if someone asks.</li>'+
      '<li>The Wonderer never votes, so the core ballot is unchanged.</li>'+
      (w.corePlayback&&w.corePlayback.errors.length?'<li class="pmx-reason">The recording stopped. Replay the example to try again.</li>':'')+'</ul>';
    return S.pmxView({key:'b13-view:'+r.id,cls:'b13-workspace',attrs:'data-wonderer-run="'+esc(r.id)+'"',kind:'wonderer',markHtml:wmark(20),kindWord:'Wonderer · BrainStorm',title:'Wonderer’s leads',
      statusHtml:status,actionsHtml:acts,mainHtml:'<div class="b13-leads">'+passes+'</div>'+conv,asideHtml:aside});
  }
  function lensCard(c){
    const s=session();if(!s)return '';
    return '<section class="b13-lens-tools" data-k="b13-lens-tools"><p class="b13-say"><b>What the assistant would read</b> · Lens never rewrites the conversation. Check what it would include, or change a message to test an out-of-date preview.</p><div class="b13-acts">'+btn(c,'b13-effective','See what it would read')+btn(c,'b13-change-message','Change message 2')+'</div></section>';
  }
  /* The guide reads the live state and moves on with the user. Its caption is the run's provenance (the card's words). */
  function wondererStep(c,s){
    const r=current(c),W=WG();
    if(!r)return {text:c.state.dialog?'The Wonderer is already on the team'+(s.flow==='leads'?' and Grill Me is on':'')+'. Press Start BrainStorm.':'Set up the BrainStorm. The Wonderer is already on the team.'};
    const w=r.wonderer,b=r.brainstorm||{},cp=w?.corePlayback||{},esc=c.esc,open=[{action:'b13-open',label:'Open the Wonderer’s leads',attrs:'data-run="'+esc(r.id)+'"'}];
    const gs=r.grill&&W.sessionOf('run:'+r.id);
    if(cp.status==='failed')return {text:'This recording stopped here. Everything so far is kept. Replay starts it again.'};
    if(['canceled','cancelled','failed'].includes(r.status)&&!b.synthesis)return {text:'This example ended. Everything so far is kept.'};
    if(b.synthesis)return {text:'Plan written. It lists every Wonderer lead with the team’s decision and reason; the core votes and the disagreement are unchanged. Nothing has been built.',actions:[{action:'brainstorm-open-plan',label:'Open Plan',attrs:'data-run="'+esc(r.id)+'"'}]};
    if(gs&&gs.status==='grilling')return {text:'Grill Me is on, so the Coordinator is grilling you before anyone drafts. Meanwhile the Wonderer explores in its own context; its leads are held until every blind proposal is in.',actions:[{action:'wg-open-round',label:'Answer the round',attrs:'data-key="run:'+esc(r.id)+'"'}]};
    if(gs&&gs.status==='agreeing')return {text:'Confirm what you agreed. The blind proposals wait for it.',actions:[{action:'wg-show-agreed',label:'See what we agreed',attrs:'data-key="run:'+esc(r.id)+'"'}]};
    if(r.status==='paused')return {text:'Paused. Resume it from the Wonderer’s leads.',actions:open};
    const held=w.passes.some(p=>p.status==='held');
    if(w.flow==='dissent'&&!W.grillOn(r)&&['intake','blind_proposals','normalize'].includes(b.phase))return {text:'Every helper drafts alone, and the Wonderer’s leads are held until every proposal is in. Turn Grill Me on now: the Coordinator questions you at the next chapter, and only the vote waits for your answer.',actions:[{action:'collab-brainstorm-toggle-grill',label:'Turn Grill Me on',attrs:'data-run="'+esc(r.id)+'"'}]};
    const later=W.activeSession(r);
    if(later&&later.later)return later.status==='agreeing'?{text:'Confirm what you agreed. Only the vote waits for it; the debate went on.',actions:[{action:'wg-show-agreed',label:'See what we agreed',attrs:'data-key="run:'+esc(r.id)+'"'}]}:{text:'Grill Me is on mid-run: the Coordinator has one decision for you. The debate goes on; only the vote waits for your answer.',actions:[{action:'wg-open-round',label:'Answer it',attrs:'data-key="run:'+esc(r.id)+'"'}]};
    if(['intake','blind_proposals'].includes(b.phase))return {text:held?'Every helper drafts alone. The Wonderer’s first pass ran during intake; its leads are held until every proposal is in, so nobody’s draft is shaped by them.':'The Wonderer’s first pass runs during intake, before the helpers start drafting.',actions:open};
    if(b.phase==='normalize'||b.phase==='debate'){
      if(w.passes.length>1&&w.passes[1].status==='queued')return {text:'Adversarial Review asked the Wonderer for a second pass. The debate holds the slots, so the pass is queued behind it.',actions:open};
      if(w.passes.length>1&&w.passes[1].status==='exploring')return {text:'A slot freed up, so the second pass is exploring. Its leads are decided as they arrive.',actions:open};
      return {text:'Every proposal is in, so the leads are released. The team weighs them in the Debate, and the Coordinator records each decision with its reason.',actions:open};
    }
    if(b.phase==='evidence')return {text:'The Evidence round checks every lead the team chose to explore. Watch each one end supported or not supported.',actions:open};
    const used=w.leads.find(l=>l.disposition&&l.disposition.kind==='use'&&!l.research&&!l.checkedByUser);
    if(b.phase==='vote'&&used&&!w.leads.some(l=>l.checkedByUser))return {text:'Lead '+used.n+' is being used as a hypothesis. Check it sends it to research anyway: only you can do that.',actions:[{action:'wg-check-it',label:'Check lead '+used.n,attrs:'data-run="'+esc(r.id)+'" data-lead="'+esc(used.id)+'"'}]};
    if(b.phase==='vote')return {text:w.passes.length>2?'Implementation asked for one last pass. The team votes meanwhile; the Wonderer never votes.':'The team votes. The Wonderer never votes.',actions:open};
    const g=gateState(r);
    if(!g.ok)return {text:'Write the plan waits: '+g.reason.charAt(0).toLowerCase()+g.reason.slice(1)+' That is the team’s work, not yours.',actions:open};
    return {text:'Every lead is decided and back from research. Press Write the plan: one plan, listing every lead.',actions:[{action:'collab-brainstorm-synthesize',label:'Write the plan',attrs:'data-run="'+esc(r.id)+'"'}]};
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
    const r=current(c),tid=c.esc(c.thread.id);
    /* the one-line receipt in the ledger grammar (G-26): an earlier thread's entry; the passes have their own cards now */
    return S.pmxLedgerLine({key:'b13-entry:'+tid,cls:'b13-entry',kind:'wonderer',markHtml:wmark(16),kindWord:'Wonderer',title:'Wonderer’s leads',
      headline:r&&r.wonderer?(WG().countsText(r)||'Exploring')+' · the team decides each one':'Leads from other fields, decided by the team',
      actions:[{action:r?'b13-open':'b13-configure',label:r?'Open':'Set up BrainStorm',attrs:'data-run="'+c.esc(r?.id||'')+'"'}]});
  });
  E.slot('editorTabLabel',c=>c.editorId?.startsWith('wonderer:')?'Wonderer’s leads':c.editorId?.startsWith('wonder-source:')?'Wonderer · source':c.editorId?.startsWith('lens-effective:')?'What it would read':'');
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
  E.action('b13-source',(c,b)=>{const r=run(b.dataset.run),id=r&&r.wonderer&&r.wonderer.artifactIds?r.wonderer.artifactIds[b.dataset.lead==='speed'?1:0]:null;if(id)c.openEditor('wonder-source:'+id);return true;});
  E.action('b13-effective',c=>{c.openEditor('lens-effective:'+c.thread.id);return true;});
  E.action('b13-change-message',c=>{const s=session(),m=c.thread.messages.find(m=>m.id===s?.sourceId);if(m){m.body+=' Revision '+(++m.revision)+': preserve rank even when matching is case-insensitive.';L.engine.refresh(c.thread.id);refresh();}return true;});
  E.chainAction('reset-all',()=>{for(const t of clocks.values()){clearTimeout(t);clearInterval(t);}clocks.clear();sessions.clear();return false;});
  const G=window.PM56_REPAIR_DEMOS,previous=G.gallery;
  G.gallery=c=>'<section class="demo-section"><h3>Context Lens and Wonderer</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="b13-start" data-flow="'+id+'"><strong>'+c.esc(f.title)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+previous(c);
  window.PM56_WONDERER={admit,playCore,gateState,convergence:r=>{const g=gateState(r);return {ok:g.ok,unresolved:g.ids||[]};},convergenceState:r=>gateState(r),convergenceReason:r=>gateState(r).reason,sourceResult,researchResult};
  window.PM56_BATCH13={start,flows,snapshot:tid=>copy(session(tid)||null),currentRun:()=>current(E.ctx())};
})();
