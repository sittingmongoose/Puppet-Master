/* Gallery-only BrainStorm stories. Model observations are supplied recordings;
 * option capabilities and example query results are calculated from local inputs.
 * Every round uses validated protocol ingress. The final Plan uses its owner. */
(function(){
 'use strict';
 const E=window.PM56_EXT,C=window.PM56_COLLAB,B=window.PM56_BRAINSTORM,P=window.PM56_PLANS;
 const clone=x=>JSON.parse(JSON.stringify(x));let active=null,serial=0;const clocks=new Map();
 const flows={synthesis:{label:'Explore and synthesize',summary:'Independent ideas → debate → one Deep Plan'},constraint:{label:'A constraint outweighs the vote',summary:'Popular option rejected → dissent retained → offline Plan'}};
 const hash=x=>{let h=2166136261;for(const c of JSON.stringify(x)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return 'demo:'+((h>>>0).toString(16)).padStart(8,'0');};
 function fixture(kind){
  const rows=[{id:'z',label:'Zeta Alpha'},{id:'a',label:'Alpha'}],query=' alpha ';
  const local=rows.filter(row=>row.label.toLowerCase().includes(query.trim().toLowerCase()));
  const source='const rows = [{id:"z",label:"Zeta Alpha"},{id:"a",label:"Alpha"}];\nconst query = " alpha ";\nconst result = rows.filter(r => r.label.toLowerCase().includes(query.trim().toLowerCase()));';
  const checks='Local filter result: '+JSON.stringify(local.map(r=>r.id))+'\nExpected ranking: ["z","a"]\nRanking preserved: '+(JSON.stringify(local.map(r=>r.id))==='["z","a"]')+'\nThis local test does not measure device latency or execute a Worker.';
  const constraints=[{id:'offline',text:'Search must work without sending collection contents to a server.',field:'networkRequired',expected:false,hard:true},{id:'ranking',text:'Search must preserve the supplied result ranking.',field:'rankingPreserved',expected:true,hard:true}];
  const evidence=[{id:'requirements',label:'Accepted brief',content:constraints.map(c=>c.text).join('\n')+'\nKeep typing usable during searches.\nDo not claim a speed improvement until measured.',provenance:'User requirements supplied for this fictional example.'},
   {id:'query',label:'Local query check',content:source+'\n\n'+checks,provenance:'Result calculated by this concept from the shown local input; not a native benchmark.'},
   {id:'capabilities',label:'Option capabilities',content:'Local filter: no network dependency; preserves input order.\nSnapshot worker: local message transport; preserves input order in the proposed algorithm. Worker execution not measured here.\nHosted index: requires collection upload and a network request by design.\nA hosted route therefore fails the offline constraint.',provenance:'Frozen candidate definitions supplied for this recorded design exercise, not a discovered service capability.'},
   {id:'latency',label:'Unmeasured trade-offs',content:'No device benchmark was supplied. Worker startup, snapshot copies and large-list latency remain to be measured. Hosted indexing can cover undownloaded collections, but requires network access.',provenance:'Explicit uncertainty. No fabricated timings.'}];
  const input={label:kind==='constraint'?'Offline collection search':'Responsive local search',objective:kind==='constraint'?'Search a downloaded collection offline without uploading its contents.':'Keep typing responsive while searching a locally ranked collection.',constraints,evidence,
   answers:[{id:'answer-offline',question:'May collection contents leave this device?',answer:'No.'},{id:'answer-ranking',question:'Should matching results retain their existing ranking?',answer:'Yes.'}],
   scopeNotes:'Compatibility: retain existing query and ranking semantics. Migration: no persisted schema change. Security: no collection upload. Operations: cancel obsolete requests and reject stale results. Rollback: retain the local filter. Cross-system impact: composer input and result rendering only. Device performance remains unmeasured.'};
  input.sourceHash=hash(input);return input;
 }
 function option(key){const shared={assumptions:['A downloaded collection snapshot is available.'],validation:['Padded-query matching and result order match the local fixture.'],rollback:['Keep the existing local filter behind an explicit feature switch.'],evidenceRefs:['requirements','query','capabilities','latency']};
  if(key==='local')return {...shared,optionKey:key,title:'Local filter',approach:'Filter the in-memory list without a worker or network call.',benefits:['Minimal coordination and straightforward rollback.'],costs:['Filtering occupies the UI thread.'],risks:['Large lists may delay input; no measured threshold exists.'],facts:{networkRequired:false,rankingPreserved:true}};
  if(key==='hosted')return {...shared,optionKey:key,title:'Hosted search index',approach:'Upload the collection to a hosted index and query it over the network.',benefits:['Can search collections that have not been downloaded.'],costs:['Network and hosted-service dependency.'],risks:['Contradicts the no-upload/offline constraint.'],facts:{networkRequired:true,rankingPreserved:true}};
  return {...shared,optionKey:'worker',title:'Snapshot worker search',approach:'Search a local snapshot in a worker; accept only the newest query result.',benefits:['Separates query processing from UI input handling.'],costs:['Worker setup and snapshot transfer overhead.'],risks:['Old responses need request identities; performance must be measured.'],facts:{networkRequired:false,rankingPreserved:true}};
 }
 function current(){if(!active)return null;const r=active.runId?C.run(active.runId):C.runsForThread(active.threadId).find(r=>r.brainstorm?.protocolVersion);if(r)active.runId=r.id;return r;}
 function stopClock(id){const clock=clocks.get(id);if(clock){clearTimeout(clock.timer);clocks.delete(id);}}
 function start(kind){
  if(!flows[kind])return;const c=E.ctx(),old=current();
  if(old&&['running','paused'].includes(old.status)){const b=document.createElement('button');b.dataset.run=old.id;E.run('collab-cancel',b,new Event('click'));}if(old)stopClock(old.id);
  const tid='brainstorm-demo-'+kind+'-'+(++serial),base=clone(c.state.threads.find(t=>t.id==='query'));
  Object.assign(base,{id:tid,title:flows[kind].label+' · recorded example',status:'ready',pinned:false,archived:false,goalId:null,messages:[{id:tid+'-request',role:'user',type:'text',body:fixture(kind).objective+' Collection contents must stay on the device.'}]});c.state.threads.push(base);
  Object.assign(c.state,{demoOpen:false,menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:''});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};window.PM56_RUNTIME.composer.destination=null;
  active={kind,threadId:tid,runId:null,played:false,resultsOpened:false,evidenceSeen:false,dissentSeen:false,planOpened:false,markdownSeen:false,errors:[],events:[]};C.openConfigure('brainstorm');const d=C.draft(),input=fixture(kind);d.name=input.label;d.purpose=input.objective;d.brainstormInput=input;
  // Prepare the final dialog before switching: switchThread already renders
  // the app and overlays. Do not render the old page and this modal twice.
  c.state.dialog={type:'collab-configure'};c.switchThread(tid);
 }
 function expected(r,kind){
  const b=r.brainstorm,a=b.attempts,options=a.map((p,i)=>kind==='constraint'?(i===0?'worker':'hosted'):(i===1?'local':'worker'));
  const proposals=a.map((p,i)=>({...option(options[i]),id:'proposal-'+p.id}));
  const votes=a.map((p,i)=>({proposalId:options[i],position:'support',confidence:options[i]==='hosted'?'medium':'high',evidenceRefs:options[i]==='worker'?['query','capabilities']:['latency','requirements'],reason:options[i]==='hosted'?(i===1?'A hosted index covers undownloaded collections; keep that limitation visible in the local-only plan.':i===2?'I prefer central indexing for shared collections, but it cannot satisfy the offline rule.':'Hosted indexing could simplify cross-device updates; it remains ineligible under the current constraint.'):options[i]==='local'?'Prefer a local filter until a device benchmark justifies worker setup.':'A local snapshot keeps collection contents on-device and can preserve result order.'}));
  const steps=[{id:'snapshot',title:'Define the local snapshot',text:'Bind collection and query identities without uploading content.',dependsOn:[],acceptance:'The snapshot contains only local collection data and preserves input rank.'},{id:'query',title:'Implement latest-query filtering',text:'Apply the local algorithm in the worker and discard responses for obsolete queries.',dependsOn:['snapshot'],acceptance:'Padded queries return [z, a]; older query results cannot replace a newer result.'},{id:'measure',title:'Verify behavior and measure latency',text:'Compare local and worker paths on target devices before enabling the feature.',dependsOn:['query'],acceptance:'Record device timings and a rollback test; do not claim an improvement without measurement.'}];
  return {proposals,votes,steps};
 }
 function play(){
  const r=current();if(!r||r.status!=='running'||clocks.has(r.id)||active.played)return;
  if(r.participants.length!==r.brainstorm.attempts.length){active.errors.push('This recorded example contains core participants only. Optional specialist workflows need their own recordings.');E.ctx().renderApp();return;}
  const session=active,records=expected(r,session.kind),a=r.brainstorm.attempts,clock={timer:null,index:0};session.played=true;clocks.set(r.id,clock);
  const x=()=>({epoch:r.stopEpoch,sourceHash:r.brainstorm.input.sourceHash});
  const actions=a.map((attempt,i)=>()=>B.submitProposal(r.id,{...x(),attemptId:attempt.id,assignmentRevision:attempt.assignmentRevision,proposal:clone(records.proposals[i])}));
  actions.push(()=>B.normalize(r.id,x()));
  for(let round=1;round<=r.config.debateRounds;round++)actions.push(()=>B.debate(r.id,{...x(),round,messages:[{participantId:a[0].participantId,body:round===1?'Separate input handling from query work, but preserve result order and request identity.':'Measure startup and transfer costs before choosing a default cutoff.',evidenceRefs:['query','latency']},{participantId:a[1].participantId,body:session.kind==='constraint'?'The hosted alternative requires uploads. A higher vote count cannot override that constraint.':'A simple local path remains the rollback. No latency benefit has been demonstrated yet.',evidenceRefs:['requirements','capabilities']}]}));
  actions.push(()=>B.recordEvidence(r.id,{...x(),checks:r.brainstorm.proposals.map(q=>({proposalId:q.id,evidenceRefs:q.evidenceRefs,summary:q.facts.networkRequired?'Network dependency conflicts with the offline constraint.':'Local query behavior is consistent with the frozen requirement; speed remains unmeasured.'}))}));
  actions.push(()=>{for(let i=0;i<a.length;i++){const result=B.vote(r.id,a[i].participantId,{...x(),...clone(records.votes[i])});if(!result.ok)return result;}return {ok:true};});
  actions.push(()=>B.decide(r.id,{...x(),selectedProposalId:'worker',reason:session.kind==='constraint'?'Choose the local snapshot path. The hosted option has more recorded support but violates the no-upload requirement. Preserve those preferences as dissent, not permission to ignore the constraint.':'Choose the snapshot worker, retain the simple local fallback, and make device measurements an acceptance step rather than claiming an unmeasured speedup.',steps:records.steps}));
  function next(){if(clocks.get(r.id)!==clock)return;if(r.status==='paused'){clock.timer=setTimeout(next,120);return;}if(r.status!=='running'){stopClock(r.id);return;}
   try{const res=actions[clock.index++]();if(!res.ok)throw Error(res.error);session.events.push({phase:r.brainstorm.phase,at:performance.now()});}
   catch(e){session.errors.push(String(e.message||e));stopClock(r.id);E.ctx().renderApp();return;}
   E.ctx().renderApp();if(clock.index<actions.length)clock.timer=setTimeout(next,450);else stopClock(r.id);
  }
  clock.timer=setTimeout(next,800);E.ctx().renderApp();
 }
 function finished(){const r=current();return !!(r?.brainstorm?.synthesis&&active.resultsOpened&&active.evidenceSeen&&active.dissentSeen&&active.planOpened&&active.markdownSeen);}
 function guide(c,inDialog=false,inEditor=false){
  if(!active||c.state.selectedThread!==active.threadId||!!c.state.dialog!==inDialog)return '';const r=current();
  if(inDialog&&(C.draft()?.kind!=='brainstorm'||r))return '';
  if(!inDialog&&(innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const done=finished(),b=r?.brainstorm,ended=r&&['canceled','failed'].includes(r.status);
  let text=!r?'Configure the core roles, then Start BrainStorm.':!active.played?'Play the recorded exploration.':!b.decision?'Independent proposals → debate → evidence → votes.':!active.resultsOpened?'Open the exploration to inspect alternatives.':!active.dissentSeen?'Expand Dissent retained.':!active.evidenceSeen?'Open one cited source.':!b.synthesis?'Synthesize the recommended Deep Plan.':!active.markdownSeen?'Inspect the Plan in Markdown.':'Deep Plan ready. No build has started.';
  if(r?.status==='paused')text='Paused. Resume through the workflow controls.';
  if(ended)text='Recorded run ended. Replay starts a fresh configuration.';
  if(active.errors.length)text=active.errors[0];
  return '<div class="bs-demo-guide" data-k="bs-demo-guide"><div><small>Recorded example · no provider calls</small><strong>'+c.esc(text)+'</strong></div><div class="bs-demo-controls">'+(done||ended||active.errors.length?'<button class="soft-button" data-action="brainstorm-demo-replay">Replay</button>':r&&!active.played?'<button class="soft-button" data-action="brainstorm-demo-play">Play exploration</button>':'')+'<button class="icon-button" data-action="brainstorm-demo-close" title="Close guide">'+c.icon('close',12)+'</button></div></div>';
 }
 ['brainstorm-open-results','brainstorm-open-evidence','brainstorm-open-plan','collab-brainstorm-synthesize'].forEach(name=>E.chainAction(name,(c,b)=>{const r=current();if(r&&b.dataset.run===r.id){if(name==='brainstorm-open-results')active.resultsOpened=true;if(name==='brainstorm-open-evidence')active.evidenceSeen=true;if(name==='brainstorm-open-plan'||name==='collab-brainstorm-synthesize')active.planOpened=true;}return false;}));
 E.chainAction('pd-view',(c,b)=>{const r=current();if(r?.brainstorm.synthesis?.planId===b.dataset.id&&b.dataset.value==='markdown')active.markdownSeen=true;return false;});
 document.addEventListener('toggle',e=>{
  if(!active||!e.target.matches?.('[data-bs-section="dissent"]')||!e.target.open)return;
  active.dissentSeen=true;
  // Refresh only the guide. A whole-app render would collapse the user's open
  // disclosure and move the scroll position while they are reading dissent.
  const html=guide(E.ctx(),false,innerWidth<=1100&&E.ctx().state.editorRevealed);
  if(html){const t=document.createElement('template');t.innerHTML=html;document.querySelectorAll('.bs-demo-guide').forEach(n=>{if(n.getClientRects().length)n.replaceWith(t.content.firstElementChild.cloneNode(true));});}
 },true);
 E.slot('composerBelow',c=>guide(c));
 E.action('brainstorm-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('brainstorm-demo-play',()=>{play();return true;});E.action('brainstorm-demo-replay',()=>{if(active)start(active.kind);return true;});E.action('brainstorm-demo-close',()=>{active=null;E.ctx().renderApp();return true;});
 E.chainAction('reset-all',()=>{for(const id of clocks.keys())stopClock(id);active=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start'].forEach(name=>E.chainAction(name,()=>{active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Guided BrainStorm workflows</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="brainstorm-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.summary)+'</small></button>').join('')+'</div></section>'+old(c);
 window.PM56_BRAINSTORM_DEMOS={start,play,fixture,expected,guide,editorGuide:id=>active&&active.runId===id?guide(E.ctx(),false,true):'',planGuide:id=>current()?.brainstorm.synthesis?.planId===id?guide(E.ctx(),false,true):'',snapshot:()=>active?clone({...active,runId:current()?.id||null,finished:finished()}):null};
})();
