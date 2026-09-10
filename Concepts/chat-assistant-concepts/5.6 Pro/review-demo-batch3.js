/* Gallery-only recorded examples. The deterministic fixture evaluates its actual
 * source to produce test evidence. Human-readable reviewer observations are
 * recorded examples, not generated model output. Normal product controls start,
 * inspect, export and convert. One bounded replay clock feeds the Review owner. */
(function(){
 'use strict';const E=window.PM56_EXT,C=window.PM56_COLLAB,P=window.PM56_REVIEW;
 const clone=x=>JSON.parse(JSON.stringify(x));let active=null,serial=0;const clocks=new Map(),sessions=new Map();
 const flows={single:{label:'Single Agent Review',summary:'One reviewer → evidence → read-only report'},multi:{label:'Multi-Pass Review',summary:'Three independent passes → dissent → selected To-Dos'}};
 function checksum(text){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return 'demo-fnv1a-'+(h>>>0).toString(16).padStart(8,'0');}
 function fixture(kind){
  const source='function filterEntries(entries, query) {\n  const q = query.toLowerCase();\n  return entries.filter(e => e.label.toLowerCase().includes(q))'+(kind==='multi'?'.sort((a, b) => a.label.localeCompare(b.label))':'')+';\n}';
  // Only this literal developer-owned fixture is evaluated, never user input.
  const filter=Function('"use strict";'+source+'; return filterEntries;')();
  const entries=[{id:'z',label:'Zeta'},{id:'a',label:'Alpha'}],spaces=filter(clone(entries),'  alpha  ').map(x=>x.id),order=filter(clone(entries),'').map(x=>x.id);
  const constraints=['Ignore surrounding spaces in the query.','Preserve the supplied ranking of matching entries.','Review only; do not change the target.'];
  const tests='Fixture checks (actual output from the shown source)\n\nQuery: "  alpha  "\nExpected IDs: ["a"]\nActual IDs: '+JSON.stringify(spaces)+'\n\nQuery: ""\nExpected IDs: ["z","a"]\nActual IDs: '+JSON.stringify(order);
  const evidence=[{id:'source',label:'filterEntries.js · L2–3',content:source,note:'Immutable source snapshot from this recorded example.'},
   {id:'tests',label:'Query and ordering checks',content:tests,note:'Computed locally from this exact fixture source; not a production test run.'},
   {id:'criteria',label:'Review criteria',content:constraints.map((x,i)=>(i+1)+'. '+x).join('\n'),note:'The acceptance criteria supplied with the frozen review target.'},
   {id:'performance',label:'Performance evidence',content:'No latency or workload measurements were supplied. No performance claim can be confirmed from this pack.',note:'An evidence gap is retained as uncertainty, not a failed reviewer.'}];
  const hash=checksum(JSON.stringify({source,constraints,evidence}));
  return {targetKind:'diff',label:'Search filter · filterEntries.js',targetRefs:['fixture:filterEntries.js'],targetHashes:{primary:hash},
   frozenAt:null,userConstraintRefs:['criteria'],acceptanceRefs:['tests'],source,evidence,hashKind:'demo-only noncryptographic checksum',fixtureKind:kind};
 }
 function draftTarget(kind){const d=C.draft();d.name=kind==='single'?'Search query review':'Search ranking review';d.purpose='Check matching and ranking without editing the source.';d.reviewTarget=fixture(kind);}
 function start(kind){
  if(!flows[kind])return;const c=E.ctx();
  if(active?.runId){const r=C.run(active.runId);if(r?.status==='running'||r?.status==='paused'){const b=document.createElement('button');b.dataset.run=r.id;E.run('collab-cancel',b,new Event('click'));}stopClock(active.runId);}
  window.PM56_PLAN_DEMOS?.close?.();
  const tid='review-demo-'+kind+'-'+(++serial),base=clone(c.state.threads.find(t=>t.id==='query'));
  Object.assign(base,{id:tid,title:flows[kind].label+' · recorded example',status:'ready',pinned:false,archived:false,goalId:null,messages:[{id:tid+'-request',role:'user',type:'text',body:'Review the search filter. Show supporting evidence and leave the source unchanged.'}]});
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
 function play(runId){
  const r=runId?C.run(runId):current(),session=runId?sessions.get(r?.threadId):active;
  if(!r||!session||(session.runId&&session.runId!==r.id)||r.status!=='running'||clocks.has(r.id)||session.played)return;
  session.runId=r.id;session.played=true;session.stage='playing';const clock={timers:[],runId:r.id};clocks.set(r.id,clock);
  const expected=r.stopEpoch,results=observed(session.kind);
  function after(ms,fn){clock.timers.push(setTimeout(()=>{
   if(clocks.get(r.id)!==clock)return;
   if(r.status!=='running'||r.stopEpoch!==expected){stopClock(r.id);session.errors.push('Replay stopped at a changed lifecycle boundary');E.ctx().renderApp();return;}
   try{const res=fn();if(res&&!res.ok)throw Error(res.error);session.events.push({at:performance.now(),phase:r.review.phase});}
   catch(e){session.errors.push(String(e.message||e));stopClock(r.id);}
   E.ctx().renderApp();
  },ms));}
  r.review.passes.forEach((a,i)=>after(1200+i*500,()=>P.submitPass(r.id,{attemptId:a.id,assignmentRevision:a.assignmentRevision,epoch:expected,targetHash:r.review.targetPack.targetHashes.primary,findings:clone(results[i%results.length])})));
  after(3000,()=>P.normalize(r.id));
  if(r.participants.length>1)after(4200,()=>{
   for(const f of r.review.findings)for(let i=0;i<r.participants.length;i++){
    let disposition='confirmed',reason='The frozen source and fixture checks reproduce the mismatch.';
    if(f.findingKey==='preserve-ranking'&&i===1){disposition='uncertain';reason='Alphabetical ordering could be intentional; confirm that the supplied ranking is the required order.';}
    if(f.findingKey==='pre-index-search'){disposition=i===1?'rejected':'uncertain';reason=i===1?'An index is not justified by the supplied evidence.':'No representative latency measurements are in this target pack.';}
    const result=P.vote(r.id,r.participants[i].id,f.id,{epoch:expected,targetHash:r.review.targetPack.targetHashes.primary,disposition,confidence:disposition==='confirmed'?'high':'low',reason,evidenceRefs:f.evidenceRefs});if(!result.ok)return result;
   }return {ok:true};
  });
  after(r.participants.length>1?5400:4200,()=>{
   const result=P.finalize(r.id,r.review.findings.map(f=>({findingId:f.id,disposition:f.findingKey==='pre-index-search'?'uncertain':'confirmed',reason:f.findingKey==='pre-index-search'?'Keep this as an open suggestion until a representative benchmark exists.':f.findingKey==='preserve-ranking'?'The supplied criterion explicitly requires the original ranking, and the fixture shows that sorting changes it.':'The exact source lowercases without trimming. The padded-query check returns no entries instead of a.'})));
   if(result.ok){session.stage='inspect';stopClock(r.id);}return result;
  });
  E.ctx().renderApp();
 }
 function finished(){const r=current();return !!(active&&r?.status==='completed'&&active.reportOpened&&active.markdownSeen&&active.evidenceSeen&&(active.kind==='single'||active.todosSeen));}
 function guide(c,inDialog=false,inEditor=false){
  if(!active||c.state.selectedThread!==active.threadId||!!c.state.dialog!==inDialog)return '';
  if(inDialog&&(C.draft()?.kind!=='review'||active.runId))return '';
  if(!inDialog&&(innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const r=current(),done=finished();
  let text=!r?'Configure the reviewers, then Start Review.':!active.played?'Play the recorded passes against the frozen target.':r.status!=='completed'?'Independent passes → findings → report.':!active.reportOpened?'Open the report to inspect the findings.':!active.evidenceSeen?'Open a cited evidence item.':!active.markdownSeen?'Switch the report to Markdown.':active.kind==='multi'&&!active.todosSeen?'Select confirmed findings, create To-Dos, then open them.':'Workflow complete. The target is unchanged.';
  if(active.errors.length)text='Recorded playback stopped. Replay starts a fresh example.';
  const action=(done||active.errors.length)?'replay':r&&!active.played?'play':null;
  return '<div class="review-demo-guide" data-k="review-demo-guide"><div><small>Recorded example · no provider calls</small><strong>'+c.esc(text)+'</strong></div><div class="review-demo-controls">'+(action?'<button class="soft-button" data-action="review-demo-'+action+'">'+(done?'Replay':'Play recorded passes')+'</button>':'')+'<button class="icon-button" data-action="review-demo-close" title="Close guide">'+c.icon('close',12)+'</button></div>'+(active.errors.length?'<p role="status">'+c.esc(active.errors.join('; '))+'</p>':'')+'</div>';
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
  return '<button class="soft-button" data-action="review-example-play" data-run="'+c.esc(r.id)+'"'+(r.status==='paused'?' disabled title="Resume this run before playing the example"':'')+'>Play recorded passes</button>';
 }
 E.action('review-example-play',(c,b)=>{play(b.dataset.run);return true;});
 window.PM56_REVIEW_DEMOS={controls,start,play,fixture,guide,editorGuide:id=>active&&active.runId===id?guide(E.ctx(),false,true):'',snapshot:()=>active?clone({...active,finished:finished(),runId:current()?.id||null}):null};
})();
