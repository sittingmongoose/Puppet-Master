/* Gallery-only recorded examples. The deterministic fixture evaluates its actual
 * source to produce test evidence. Human-readable reviewer observations are
 * recorded examples, not generated model output. Normal product controls start,
 * inspect, export and convert. One bounded replay clock feeds the Review owner. */
(function(){
 'use strict';const E=window.PM56_EXT,C=window.PM56_COLLAB,P=window.PM56_REVIEW;
 const clone=x=>JSON.parse(JSON.stringify(x));let active=null,serial=0;const clocks=new Map(),sessions=new Map();
 const flows={single:{label:'Single Agent Review',summary:'One fresh reviewer reads a locked snapshot and writes a report.'},multi:{label:'Multi-Pass Review',summary:'Three reviewers check alone, compare notes, then you pick the To-Dos.'}};
 function checksum(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return 'demo-fnv1a-'+(h>>>0).toString(16).padStart(8,'0');}
 function fixture(kind){
  const source='function filterEntries(entries, query) {\n  const q = query.toLowerCase();\n  return entries.filter(e => e.label.toLowerCase().includes(q))'+(kind==='multi'?'.sort((a, b) => a.label.localeCompare(b.label))':'')+';\n}';
  // Only this literal developer-owned fixture is evaluated, never user input.
  const filter=Function('"use strict";'+source+'; return filterEntries;')();
  const entries=[{id:'z',label:'Zeta'},{id:'a',label:'Alpha'}],spaces=filter(clone(entries),'  alpha  ').map(x=>x.id),order=filter(clone(entries),'').map(x=>x.id);
  const constraints=['Ignore surrounding spaces in the query.','Preserve the supplied ranking of matching entries.','Review only; do not change the target.'];
  const tests='Fixture checks (actual output from the shown source)\n\nQuery: "  alpha  "\nExpected IDs: ["a"]\nActual IDs: '+JSON.stringify(spaces)+'\n\nQuery: ""\nExpected IDs: ["z","a"]\nActual IDs: '+JSON.stringify(order);
  const evidence=[{id:'source',label:'filterEntries.js · L2–3',content:source,note:'The file exactly as the reviewers read it. Nothing here was changed.'},
   {id:'tests',label:'Query and ordering checks',content:tests,note:'Computed locally from this exact fixture source; not a production test run.'},
   {id:'criteria',label:'Review criteria',content:constraints.map((x,i)=>(i+1)+'. '+x).join('\n'),note:'The acceptance criteria supplied with the frozen review target.'},
   {id:'performance',label:'Performance evidence',content:'No latency or workload measurements were supplied. No performance claim can be confirmed from this pack.',note:'An evidence gap is retained as uncertainty, not a failed reviewer.'}];
  const hash=checksum(JSON.stringify({source,constraints,evidence}));
  return {targetKind:'assistant_response',label:'Search filter · filterEntries.js',targetRefs:['fixture:filterEntries.js'],targetHashes:{primary:hash},
   frozenAt:null,userConstraintRefs:['criteria'],acceptanceRefs:['tests'],source,evidence,hashKind:'demo-only noncryptographic checksum',fixtureKind:kind};
 }
 /* IMPACT A1-01 / A3-03: the recorded target reaches PM56_REVIEW.admit only through a draft flagged recorded; the
    user field reviewTargetChoice gets the matching choice as prefill. The example chat holds the assistant's answer
    that wrote filterEntries.js, so "The last answer · 1 reply · N words" describes exactly what the reviewers read
    (the chat has no file changes, so "Your latest changes" would say there is nothing to review). */
 function draftTarget(kind){const d=C.draft();d.name=kind==='single'?'Search query review':'Search ranking review';d.purpose='Check matching and ranking without editing the source.';d.reviewTarget=fixture(kind);d.reviewTargetChoice='answer';if(C.markRecorded)C.markRecorded(d);}
 const answerText=kind=>'I wrote filterEntries.js. It lowercases the query and keeps the entries whose label contains it'+(kind==='multi'?', then sorts them by label.':'.');
 function start(kind){
  if(!flows[kind])return;const c=E.ctx();
  if(active?.runId){const r=C.run(active.runId);if(r?.status==='running'||r?.status==='paused'){const b=document.createElement('button');b.dataset.run=r.id;E.run('collab-cancel',b,new Event('click'));}stopClock(active.runId);}
  window.PM56_PLAN_DEMOS?.close?.();
  const tid='review-demo-'+kind+'-'+(++serial),base=clone(c.state.threads.find(t=>t.id==='query'));
  Object.assign(base,{id:tid,title:flows[kind].label+' · recorded example',status:'ready',pinned:false,archived:false,goalId:null,messages:[{id:tid+'-ask',role:'user',type:'text',body:'Write a filter for the search box that matches entry labels.'},{id:tid+'-answer',role:'assistant',type:'text',body:answerText(kind)},{id:tid+'-request',role:'user',type:'text',body:'Review the search filter. Show supporting evidence and leave the source unchanged.'}]});
  c.state.threads.push(base);Object.assign(c.state,{demoOpen:false,menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:''});
  c.state.capabilities.goal=false;c.state.activity.open=false;c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};
  window.PM56_RUNTIME.composer.destination=null;
  active={kind,threadId:tid,runId:null,stage:'configure',played:false,reportOpened:false,markdownSeen:false,evidenceSeen:false,todosSeen:false,errors:[],events:[]};sessions.set(tid,active);
  c.switchThread(tid);C.openConfigure('review');draftTarget(kind);
  // Initial scenario configuration; all subsequent edits use the normal shared pickers.
  const d=C.draft();d.config.strategy=kind==='single'?'single_agent':'multi_pass';C.normalizeReview(d);
  if(kind==='multi')d.rows.forEach(r=>{r.requestedModelId='sonnet46';});
  c.openDialog({type:'collab-configure'});c.renderApp();
 }
 function stopClock(id){const a=clocks.get(id);if(a){a.timers.forEach(clearTimeout);clocks.delete(id);}}
 function bound(){if(!active)return null;return active.runId?C.run(active.runId):C.runsForThread(active.threadId).find(r=>r.kind==='review'&&r.review?.protocolVersion);}
 function current(){const r=bound();if(r&&active&&!active.runId)active.runId=r.id;return r;}
 function observed(kind){
  const trim={id:'spaces',findingKey:'trim-query',category:'correctness',severity:'minor',claim:'Padded queries miss valid entries',evidenceRefs:['source','tests'],proposedRemediation:'Trim the query before matching',expectedOutcome:'The query "  alpha  " returns entry a.',};
  const order={id:'order',findingKey:'preserve-ranking',category:'correctness',severity:'minor',claim:'Matching entries lose their supplied ranking',evidenceRefs:['source','tests','criteria'],proposedRemediation:'Preserve input order when filtering',expectedOutcome:'An empty query retains [z, a] in the supplied order.'};
  const perf={id:'perf',findingKey:'pre-index-search',category:'performance',severity:'suggestion',claim:'Pre-indexing may help large lists',evidenceRefs:['performance'],proposedRemediation:'Measure list-search latency before adding an index',expectedOutcome:'A representative benchmark establishes whether indexing is needed.'};
  return kind==='single'?[[trim]]:[[trim],[{...clone(trim),id:'spacing-confirmed'},perf],[order]];
 }
 /* The recorded player: a list of timed steps against the run. Pause holds it where it is (the steps not yet delivered
    keep their remaining time) and Resume re-arms them under the run's new stop epoch, so the card never says "Running"
    while nothing will arrive. Cancel ends it; the guide then reads the run's status. */
 function play(runId){
  const r=runId?C.run(runId):current(),session=runId?sessions.get(r?.threadId):active;
  if(!playable(r,session))return;
  session.runId=r.id;session.played=true;session.stage='playing';
  const results=observed(session.kind),hash=()=>r.review.targetPack.targetHashes.primary,multi=r.participants.length>1,steps=[];
  r.review.passes.forEach((a,i)=>steps.push({at:1200+i*500,fn:ep=>P.submitPass(r.id,{attemptId:a.id,assignmentRevision:a.assignmentRevision,epoch:ep,targetHash:hash(),findings:clone(results[i%results.length])})}));
  steps.push({at:3000,fn:()=>P.normalize(r.id)});
  if(multi)steps.push({at:4200,fn:ep=>{
   for(const f of r.review.findings)for(let i=0;i<r.participants.length;i++){
    let disposition='confirmed',reason='The frozen source and fixture checks reproduce the mismatch.';
    if(f.findingKey==='preserve-ranking'&&i===1){disposition='uncertain';reason='Alphabetical ordering could be intentional; confirm that the supplied ranking is the required order.';}
    if(f.findingKey==='pre-index-search'){disposition=i===1?'rejected':'uncertain';reason=i===1?'An index is not justified by the supplied evidence.':'No representative latency measurements are in this target pack.';}
    const result=P.vote(r.id,r.participants[i].id,f.id,{epoch:ep,targetHash:hash(),disposition,confidence:disposition==='confirmed'?'high':'low',reason,evidenceRefs:f.evidenceRefs});if(!result.ok)return result;
   }return {ok:true};
  }});
  steps.push({at:multi?5400:4200,last:true,fn:()=>P.finalize(r.id,r.review.findings.map(f=>({findingId:f.id,disposition:f.findingKey==='pre-index-search'?'uncertain':'confirmed',reason:f.findingKey==='pre-index-search'?'Keep this as an open suggestion until a representative benchmark exists.':f.findingKey==='preserve-ranking'?'The supplied criterion explicitly requires the original ranking, and the fixture shows that sorting changes it.':'The exact source lowercases without trimming. The padded-query check returns no entries instead of a.'})))});
  const clock={runId:r.id,steps,timers:[],elapsed:0,armedAt:0,epoch:r.stopEpoch,held:false};clocks.set(r.id,clock);arm(clock);
  E.ctx().renderApp();
 }
 function playable(r,session){return !!(r&&session&&!(session.runId&&session.runId!==r.id)&&r.status==='running'&&r.review?.phase==='independent'&&!clocks.has(r.id)&&!session.played);}
 function arm(clock){
  const r=C.run(clock.runId);clock.timers.forEach(clearTimeout);clock.timers=[];clock.held=false;clock.epoch=r.stopEpoch;clock.armedAt=performance.now();
  clock.steps.filter(x=>!x.done).forEach(x=>clock.timers.push(setTimeout(()=>fire(clock,x),Math.max(0,x.at-clock.elapsed))));
 }
 function hold(clock){if(clock.held)return;clock.elapsed+=performance.now()-clock.armedAt;clock.timers.forEach(clearTimeout);clock.timers=[];clock.held=true;}
 function fire(clock,step){
  if(clocks.get(clock.runId)!==clock||step.done||clock.held)return;
  const r=C.run(clock.runId),session=r&&sessions.get(r.threadId);
  if(!r||!session){stopClock(clock.runId);return;}
  if(r.status==='paused'){hold(clock);E.ctx().renderApp();return;}
  if(r.status!=='running'){stopClock(r.id);E.ctx().renderApp();return;}
  if(r.stopEpoch!==clock.epoch)clock.epoch=r.stopEpoch;  // paused and resumed between two steps: go on under the new epoch
  step.done=true;
  try{const res=step.fn(clock.epoch);if(res&&!res.ok)throw Error(res.error);session.events.push({at:performance.now(),phase:r.review.phase});if(step.last){session.stage='inspect';stopClock(r.id);}}
  catch(e){session.errors.push(String(e.message||e));stopClock(r.id);}
  E.ctx().renderApp();
 }
 /* Pause and Resume are COLLAB's; the player follows them once COLLAB's handler has run (a refused Pause holds nothing) */
 E.chainAction('collab-pause',(c,b)=>{const id=b.dataset.run;queueMicrotask(()=>{const k=clocks.get(id),r=C.run(id);if(k&&r?.status==='paused')hold(k);});return false;});
 E.chainAction('collab-resume',(c,b)=>{const id=b.dataset.run;queueMicrotask(()=>{const k=clocks.get(id),r=C.run(id);if(k&&k.held&&r?.status==='running'){arm(k);c.renderApp();}});return false;});
 function finished(){const r=current();return !!(active&&r?.status==='completed'&&active.reportOpened&&active.markdownSeen&&active.evidenceSeen&&(active.kind==='single'||active.todosSeen));}
 /* The recorded example's guide (C27 pmxGuide): in the dock under the chat, or as the report's first row when a narrow
    window shows the report instead of the chat. Plain words only; the replay's error codes stay in data-failure. */
 /* The guide reads the run's status first, so it never offers a control that does nothing: Play only while the run
    is running and nobody has played it; Replay (a fresh example) once it is done, cancelled or stopped. */
 const ENDED={canceled:'cancelled',cancelled:'cancelled',failed:'stopped',limit:'stopped'};
 const PLAY_LABEL='Play the recording';
 function stage(){
  const r=current();
  if(active.errors.length)return {text:'The recorded example stopped. Replay starts it again from the beginning.',action:'replay'};
  if(!r)return {text:'Check the setup, then press Start Review.'};
  if(ENDED[r.status])return {text:ENDED[r.status]==='cancelled'?'This example was cancelled. Everything so far is kept.':'This example stopped. Everything so far is kept.',action:'replay'};
  if(r.status==='paused')return {text:'Paused. Resume it on its card to go on.'};
  if(r.status!=='completed'){
   if(playable(r,active))return {text:'Play the recorded reviewers. They read the locked snapshot on their own.',action:'play'};
   return {text:active.kind==='single'?'The reviewer is reading the locked snapshot.':'The reviewers are reading on their own, then they compare notes.'};
  }
  if(!active.reportOpened)return {text:'Open the report to read what they found.'};
  if(!active.evidenceSeen)return {text:'Open a proof link to see the exact version they read.'};
  if(!active.markdownSeen)return {text:'Switch the report to Plain text: it is what Export saves.'};
  if(active.kind==='multi'&&!active.todosSeen)return {text:'Tick the findings you want, create To-Dos, then open them.'};
  return {text:'All done. Your files were never changed.',action:'replay'};
 }
 /* The recorded example's guide (C27 pmxGuide): in the dock under the chat, or as the report's first row when a narrow
    window shows the report instead of the chat. Plain words only; the replay's error codes stay in data-failure.
    review-demo-batch3.css stacks the action under the step when the guide is narrow (FOUNDATION REQUEST 4). */
 function guide(c,inDialog=false,inEditor=false){
  if(!active||c.state.selectedThread!==active.threadId||!!c.state.dialog!==inDialog)return '';
  if(inDialog&&(C.draft()?.kind!=='review'||active.runId))return '';
  if(!inDialog&&(innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const st=stage(),S=window.PM56_SHELL;
  const acts=st.action?[{action:'review-demo-'+st.action,label:st.action==='replay'?'Replay':PLAY_LABEL}]:[];
  const failed=active.errors.length?' data-failure="'+c.esc(active.errors.join('; '))+'"':'';
  return S.pmxGuide({key:'review-demo-guide',cls:'review-demo-guide',placement:inEditor?'doc':'dock',step:c.esc(st.text),actions:acts,
   close:{action:'review-demo-close',label:'Close guide'},attrs:failed});
 }
 function note(action){E.chainAction(action,(c,b)=>{const r=current();if(r&&b.dataset.run===r.id){if(action==='review-open-report')active.reportOpened=true;if(action==='review-open-evidence')active.evidenceSeen=true;if(action==='review-report-view'&&b.dataset.view==='markdown')active.markdownSeen=true;if(action==='review-open-todos')active.todosSeen=true;}return false;});}
 ['review-open-report','review-open-evidence','review-report-view','review-open-todos'].forEach(note);
 E.slot('composerBelow',c=>guide(c));
 E.action('review-demo-start',(c,b)=>{start(b.dataset.flow);return true;});
 E.action('review-demo-play',()=>{play();return true;});
 E.action('review-demo-replay',()=>{if(active)start(active.kind);return true;});
 E.action('review-demo-close',()=>{current();active=null;E.ctx().renderApp();return true;});
 E.chainAction('reset-all',()=>{for(const id of clocks.keys())stopClock(id);sessions.clear();active=null;return false;});
 ['plan-demo-start','schedule-demo-start'].forEach(name=>E.chainAction(name,()=>{active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;
 G.gallery=c=>'<section class="demo-section"><h3>Guided Review workflows</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="review-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.summary)+'</small></button>').join('')+'</div></section>'+old(c);

 function controls(c,r){
  const session=sessions.get(r.threadId);
  if(!session||session===active||(session.runId&&session.runId!==r.id)||session.played||!['running','paused'].includes(r.status))return '';
  return '<button class="soft-button" data-action="review-example-play" data-run="'+c.esc(r.id)+'"'+(r.status==='paused'?' disabled title="Resume this run before playing the example"':'')+'>'+PLAY_LABEL+'</button>';
 }
 E.action('review-example-play',(c,b)=>{play(b.dataset.run);return true;});
 window.PM56_REVIEW_DEMOS={controls,start,play,fixture,guide,playLabel:PLAY_LABEL,editorGuide:id=>active&&active.runId===id?guide(E.ctx(),false,true):'',snapshot:()=>active?clone({...active,finished:finished(),runId:current()?.id||null}):null};
})();
