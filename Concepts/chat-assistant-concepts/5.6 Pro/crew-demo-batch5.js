/* Two bounded gallery examples. Result payloads are computed from frozen local
 * inputs, not forced completion flags. No network/model/native execution. */
(function(){
 'use strict';const E=window.PM56_EXT,C=window.PM56_COLLAB,W=window.PM56_CREW,clone=x=>JSON.parse(JSON.stringify(x));let active=null,serial=0;const clocks=new Map(),sessions=new Map();
 const flows={delegation:{label:'Delegate and verify',detail:'Parallel assignments → verified CSV result'},auto:{label:'Crew Auto knows when to help',detail:'Small and single-agent requests stay single → independent work gets a Crew'}};
 function fixture(){const i={taskSet:'collection-csv-v1',label:'Prepare a collection export',objective:'Export two collection records without losing order, commas, or quotes.',rows:[{id:'z',title:'  Night, Sky '},{id:'a',title:' The "Arrival"  '}],requirements:['Trim outer title whitespace.','Preserve identifiers and input order.','Quote CSV cells containing commas, quotes or line breaks.'],capacity:{maxConcurrent:2,maxMembers:4},provenance:'Frozen local example inputs; capacity is a supplied concept fixture, not a production orchestrator probe.'};i.sourceHash=W.sourceHash(i);return i;}
 function current(){if(!active)return null;const r=active.runId?C.run(active.runId):C.runsForThread(active.threadId).find(r=>W.owns(r.id));if(r)active.runId=r.id;return r;}
 function configure(auto=false){const c=E.ctx();C.openConfigure('crew',null,auto);const d=C.draft();d.name=auto?'Export assistance':'Prepare a collection export';d.purpose=fixture().objective;d.config.parallelism=3;d.config.coordinator='parent_assistant';d.config.assignmentStrategy='explicit_static';d.config.autoMinIndependent='2';d.config.autoComplexity='high';d.rows.forEach((r,i)=>r.role=['Data mapper','CSV specialist','Integrator'][i]||r.role);
  if(!auto){d.crewInput=fixture();d.requestKey=active.threadId+':explicit';d.threadId=active.threadId;}c.openDialog({type:'collab-configure'});c.renderApp();}
 function stopClock(id){const x=clocks.get(id);if(x){clearTimeout(x.timer);clocks.delete(id);}}
 function start(kind){if(!flows[kind])return;const c=E.ctx(),old=current();if(old&&['running','paused'].includes(old.status)){const b=document.createElement('button');b.dataset.run=old.id;E.run('collab-cancel',b,new Event('click'));}if(old)stopClock(old.id);
  const tid='crew-demo-'+kind+'-'+(++serial),base=clone(c.state.threads.find(t=>t.id==='query'));Object.assign(base,{id:tid,title:flows[kind].label+' · local example',status:'ready',pinned:false,archived:false,goalId:null,messages:[{id:tid+'-request',role:'user',type:'text',body:kind==='auto'?'Use a Crew only when the work benefits from delegation. Respect a request to keep one agent.':fixture().objective}]});c.state.threads.push(base);
  Object.assign(c.state,{mode:'Agent',demoOpen:false,menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:''});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};window.PM56_RUNTIME.composer.destination=null;
  active={kind,threadId:tid,runId:null,played:false,opened:false,exported:false,sourceSeen:false,evaluations:[],events:[],errors:[]};sessions.set(tid,active);c.switchThread(tid);
  if(kind==='auto'){const d=C.definitions().crew;d.autoEnabled=false;d.autoConfigured=false;delete d.autoPolicy;}configure(kind==='auto');
 }
 function request(which){const base={id:active.threadId+':'+which,threadId:active.threadId,input:fixture(),memberCount:3,complexity:which==='simple'?'low':'high',explicitSingle:which==='single'};return base;}
 function evaluate(which){if(!active||active.kind!=='auto')return;const r=W.evaluate(request(which));active.evaluations.push({which,result:clone(r)});if(r.admitted)active.runId=r.runId;if(!r.ok)active.errors.push(r.error);E.ctx().renderApp();return r;}
 function play(runId){const r=runId?C.run(runId):current(),session=runId?sessions.get(r?.threadId):active;if(!r||!session||(session.runId&&session.runId!==r.id)||r.status!=='running'||clocks.has(r.id)||session.played)return;session.runId=r.id;const sourceHash=r.crew.input.sourceHash,envelope=()=>({epoch:r.stopEpoch,sourceHash});session.played=true;const clock={timer:null,index:0};clocks.set(r.id,clock);
  const claim=id=>()=>W.claim(r.id,id,envelope()),deliver=id=>()=>W.deliver(r.id,id,W.payload(r.id,id));
  const steps=r.crew.effectiveConcurrency>1?[()=>{const a=claim('normalize')();return a.ok?claim('quoting')():a;},deliver('normalize'),deliver('quoting')]:[claim('normalize'),deliver('normalize'),claim('quoting'),deliver('quoting')];
  steps.push(claim('export'),deliver('export'),()=>W.finalize(r.id,envelope()));
  function next(){if(clocks.get(r.id)!==clock)return;if(r.status==='paused'){clock.timer=setTimeout(next,100);return;}if(r.status!=='running'){stopClock(r.id);return;}
   try{const result=steps[clock.index++]();if(!result.ok)throw Error(result.error);session.events.push({step:clock.index,at:performance.now(),states:r.crew.assignments.map(a=>a.status)});}catch(e){session.errors.push(e.message||String(e));stopClock(r.id);E.ctx().renderApp();return;}
   E.ctx().renderApp();if(clock.index<steps.length)clock.timer=setTimeout(next,650);else stopClock(r.id);
  }clock.timer=setTimeout(next,750);E.ctx().renderApp();
 }
 function done(){const r=current();return !!(r?.status==='completed'&&active.opened&&active.sourceSeen&&active.exported);}
 function guide(c,inDialog=false,inEditor=false){if(!active||c.state.selectedThread!==active.threadId||!!c.state.dialog!==inDialog)return '';const r=current();if(inDialog&&(C.draft()?.kind!=='crew'||r))return '';if(!inDialog&&(innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const policy=C.definitions().crew.autoPolicy,evals=active.evaluations;let text='',button='';const ended=r&&['canceled','failed'].includes(r.status);
  if(inDialog)text=active.kind==='auto'?'Save the roster and criteria. This does not start a Crew.':'Configure three roles, then start the Crew.';
  else if(active.kind==='delegation'&&!r){text='No Crew started. Configure the three roles.';button='<button class="soft-button" data-action="crew-demo-configure">Configure Crew</button>';}
  else if(active.kind==='auto'&&!policy){text='Crew Auto is off. Configure it before evaluating requests.';button='<button class="soft-button" data-action="crew-demo-configure">Configure Crew Auto</button>';}
  else if(active.kind==='auto'&&!r){const next=!evals.some(e=>e.which==='simple')?'simple':!evals.some(e=>e.which==='single')?'single':'parallel';text=next==='simple'?'Try a small request. One agent is enough.':next==='single'?'An explicit single-agent choice takes priority.':'Independent work can now use the committed Crew.';button='<button class="soft-button" data-action="crew-demo-evaluate" data-case="'+next+'">'+({simple:'Try small request',single:'Try explicit single agent',parallel:'Evaluate parallel work'}[next])+'</button>';}
  else if(r&&!active.played){text='Open the assignments, then run the local example.';button='<button class="soft-button" data-action="crew-demo-play">Run local work</button>';}
  else if(r?.status==='running')text=r.crew.effectiveConcurrency===1?'One task at a time; integration waits for verified results.':'Independent tasks run together; integration waits for verified results.';
  else if(r?.status==='paused')text='Paused. Resume using the Crew controls.';
  else if(r?.status==='completed')text=!active.sourceSeen?'Inspect Frozen input and activity.':!active.exported?'Export the verified CSV result.':'Verified export ready. The source collection is unchanged.';
  if(ended)text='Run ended. Replay creates a fresh configuration.';if(active.errors.length)text=active.errors[0];if(done()||ended||active.errors.length)button='<button class="soft-button" data-action="crew-demo-replay">Replay</button>';
  const last=evals.at(-1),reasonLabels={complexity_below_threshold:'Keep one agent · small request',explicit_single_agent:'Keep one agent · explicit choice',insufficient_independent_work:'Keep one agent · not enough independent work',auto_not_enabled:'Crew Auto is off'};
  const result=last&&!r?'<div class="crew-demo-evaluation" data-decision="'+c.esc(last.result.reason||'admitted')+'">'+c.icon('check',12)+' '+c.esc(reasonLabels[last.result.reason]||last.result.error||'Crew admitted')+'<small>No Crew or Usage created</small></div>':'';
  return '<div class="crew-demo-guide" data-k="crew-demo-guide"><div><small>Local example · no provider calls</small><strong>'+c.esc(text)+'</strong>'+result+'</div><div class="crew-demo-controls">'+button+'<button class="icon-button" data-action="crew-demo-close" title="Close guide">'+c.icon('close',12)+'</button></div></div>';
 }
 // Explicit Run another Crew receives a fresh guide after successful admission.
 // This observes an existing run; it creates no run, result, or provider effect.
 document.addEventListener('pm56:crew-example-admitted',e=>{const r=C.run(e.detail?.runId);if(!e.detail?.rerun||!r||!W.owns(r.id))return;active={kind:'delegation',threadId:r.threadId,runId:r.id,played:false,opened:false,exported:false,sourceSeen:false,evaluations:[],events:[],errors:[]};sessions.set(r.threadId,active);});
 E.chainAction('crew-open-work',(c,b)=>{if(current()?.id===b.dataset.run)active.opened=true;return false;});
 E.chainAction('crew-export-result',(c,b)=>{if(current()?.id===b.dataset.run&&current().crew.summary)active.exported=true;return false;});
 document.addEventListener('toggle',e=>{if(!active||!e.target.matches?.('.crew-work-source')||!e.target.open)return;active.sourceSeen=true;const html=guide(E.ctx(),false,innerWidth<=1100&&E.ctx().state.editorRevealed);if(html){const t=document.createElement('template');t.innerHTML=html;document.querySelectorAll('.crew-demo-guide').forEach(n=>{if(n.getClientRects().length)n.replaceWith(t.content.firstElementChild.cloneNode(true));});}},true);
 E.slot('composerBelow',c=>guide(c));E.action('crew-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('crew-demo-configure',()=>{configure(active?.kind==='auto');return true;});E.action('crew-demo-evaluate',(c,b)=>{evaluate(b.dataset.case);return true;});E.action('crew-demo-play',()=>{play();return true;});E.action('crew-demo-replay',()=>{if(active)start(active.kind);return true;});E.action('crew-demo-close',()=>{current();active=null;E.ctx().renderApp();return true;});
 E.chainAction('reset-all',()=>{for(const id of clocks.keys())stopClock(id);sessions.clear();active=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start'].forEach(n=>E.chainAction(n,()=>{active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Guided Crew workflows</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="crew-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+old(c);

 function controls(c,r){
  const session=sessions.get(r.threadId);
  if(!session||session===active||(session.runId&&session.runId!==r.id)||session.played||!['running','paused'].includes(r.status))return '';
  return '<button class="soft-button" data-action="crew-example-play" data-run="'+c.esc(r.id)+'"'+(r.status==='paused'?' disabled title="Resume this run before playing the example"':'')+'>Run local work</button>';
 }
 E.action('crew-example-play',(c,b)=>{play(b.dataset.run);return true;});
 window.PM56_CREW_DEMOS={controls,start,play,evaluate,fixture,request,guide,editorGuide:id=>current()?.id===id?guide(E.ctx(),false,true):'',snapshot:()=>active?clone({...active,runId:current()?.id||null,finished:done()}):null};
})();
