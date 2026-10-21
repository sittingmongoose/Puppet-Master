/* Two recorded Crew examples. Result payloads are computed from frozen local
 * inputs, not forced completion flags. No network/model/native execution.
 * Presentation (DESIGN-SPEC 4.3 C27 pmxGuide, 7.7, 8.1, 8.2, 9.5): the guide is the one "recorded example" look in
 * the dock and as the run view's first row (doc); the recorded sheets carry no guide line (their foot already says
 * "Recorded example · no AI cost", and the line cost the Crew sheet its plate: CREW-B-NOTES); its copy has no engine words; the recorded draft is flagged through
 * PM56_COLLAB.markRecorded (IMPACT A3-03); Crew Auto's try-it evaluation prints the same verdict words as the Crew
 * Auto sheet's "How it would decide", and a declined request leaves no card (CREW-04).
 * Playback (2026-10-21, Jared: "I thought it would be automated"): the recording plays on its own from Start, paced so
 * each step stays on screen long enough to read, and stops only where the real product waits for you (the end). The
 * guide narrates what is happening and what comes next; it never asks for a click to go on. Crew Auto's example sends
 * its three requests by itself once its rules are saved. Pause, Cancel and Open Panel on the card work as in the
 * product while it plays. */
(function(){
 'use strict';const E=window.PM56_EXT,C=window.PM56_COLLAB,W=window.PM56_CREW,clone=x=>JSON.parse(JSON.stringify(x));let active=null,serial=0;const clocks=new Map(),sessions=new Map();
 const S=()=>window.PM56_SHELL,ms=v=>window.PM56_CLOCK&&window.PM56_CLOCK.ms?window.PM56_CLOCK.ms(v):v;
 /* the pace: how long each moment stays on screen before the next step (motion time, PM56_CLOCK). The first step
    lands well inside 2 s, so a started card never sits at "Starting". */
 const RESUME=1500,PACE={first:900,claim:6500,deliver:5000,join:6000,finalize:4500,request:2200,nextRequest:5200};
 const flows={delegation:{label:'Delegate and verify',detail:'A Crew splits a job into parts and checks each one'},auto:{label:'Crew Auto knows when to help',detail:'Small requests stay with one assistant; a big job that splits gets a Crew'}};
 function fixture(){const i={taskSet:'collection-csv-v1',label:'Prepare a collection export',objective:'Export two collection records without losing order, commas, or quotes.',rows:[{id:'z',title:'  Night, Sky '},{id:'a',title:' The "Arrival"  '}],requirements:['Trim outer title whitespace.','Preserve identifiers and input order.','Quote CSV cells containing commas, quotes or line breaks.'],capacity:{maxConcurrent:2,maxMembers:4},provenance:'Frozen local example inputs; capacity is a supplied concept fixture, not a production orchestrator probe.'};i.sourceHash=W.sourceHash(i);return i;}
 function current(){if(!active)return null;const r=active.runId?C.run(active.runId):C.runsForThread(active.threadId).find(r=>W.owns(r.id));if(r)active.runId=r.id;return r;}
 function configure(auto=false){const c=E.ctx();C.openConfigure('crew',null,auto);const d=C.draft();d.name=auto?'Export assistance':'Prepare a collection export';d.purpose=fixture().objective;d.config.parallelism=3;d.config.coordinator='parent_assistant';d.config.assignmentStrategy='explicit_static';d.config.autoMinIndependent='2';d.config.autoComplexity='high';d.rows.forEach((r,i)=>r.role=['Data mapper','CSV specialist','Integrator'][i]||r.role);
  /* IMPACT A3-03: the recorded example flags its own draft; a wand-started Crew never carries the flag */
  if(!auto){d.crewInput=fixture();d.requestKey=active.threadId+':explicit';d.threadId=active.threadId;if(C.markRecorded)C.markRecorded(d);}c.openDialog({type:'collab-configure'});c.renderApp();}
 function stopClock(id){const x=clocks.get(id);if(x){clearTimeout(x.timer);clocks.delete(id);}}
 /* E-02: Crew Auto is on by default for the project. The auto example starts from "off" to show the setup, so it keeps
    the project's own Crew Auto definition aside and puts it back when the example closes, replays or gives way to
    another example, unless the example saved new rules (then those are the project's rules). */
 let autoStash=null;
 function autoFields(){const d=C.definitions().crew;return {autoEnabled:d.autoEnabled,autoConfigured:d.autoConfigured,autoPolicy:d.autoPolicy===undefined?undefined:clone(d.autoPolicy)};}
 function restoreAuto(){if(!autoStash)return;const d=C.definitions().crew,saved=!!d.autoPolicy;if(!saved){d.autoEnabled=autoStash.autoEnabled;d.autoConfigured=autoStash.autoConfigured;if(autoStash.autoPolicy===undefined)delete d.autoPolicy;else d.autoPolicy=clone(autoStash.autoPolicy);}autoStash=null;}
 function start(kind){if(!flows[kind])return;restoreAuto();const c=E.ctx(),old=current();if(old&&['running','paused'].includes(old.status)){const b=document.createElement('button');b.dataset.run=old.id;E.run('collab-cancel',b,new Event('click'));}if(old)stopClock(old.id);
  const tid='crew-demo-'+kind+'-'+(++serial),base=clone(c.state.threads.find(t=>t.id==='query'));Object.assign(base,{id:tid,title:flows[kind].label+' · recorded example',status:'ready',pinned:false,archived:false,goalId:null,messages:[{id:tid+'-request',role:'user',type:'text',body:kind==='auto'?'Use a Crew only when the work benefits from it. If I ask for one assistant, keep it to one.':fixture().objective}]});c.state.threads.push(base);
  Object.assign(c.state,{mode:'Agent',demoOpen:false,menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:''});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};window.PM56_RUNTIME.composer.destination=null;
  active={kind,threadId:tid,runId:null,played:false,opened:false,exported:false,sourceSeen:false,evaluations:[],events:[],errors:[]};sessions.set(tid,active);c.switchThread(tid);
  if(kind==='auto'){autoStash=autoFields();const d=C.definitions().crew;d.autoEnabled=false;d.autoConfigured=false;delete d.autoPolicy;}configure(kind==='auto');
 }
 /* the three requests the Crew Auto example tries: only their size and the explicit one-assistant choice reach
    PM56_CREW.evaluate; the words are what the guide shows */
 const REQUESTS={simple:{text:'Fix the typo in the README',complexity:'low'},single:{text:'Add CSV export, but keep it to one assistant',complexity:'high'},parallel:{text:'Add CSV export with tests and a docs note',complexity:'high'}};
 function request(which){const q=REQUESTS[which]||REQUESTS.parallel;return {id:active.threadId+':'+which,threadId:active.threadId,input:fixture(),memberCount:3,complexity:q.complexity,explicitSingle:which==='single'};}
 function evaluate(which){if(!active||active.kind!=='auto')return;const r=W.evaluate(request(which));active.evaluations.push({which,result:clone(r)});if(r.admitted)active.runId=r.runId;if(!r.ok)active.errors.push(r.error);E.ctx().renderApp();return r;}
 /* Crew Auto's recording: once its rules are saved it sends the three requests itself, one at a time, each verdict on
    screen long enough to read; the big job brings the Crew in, which then plays like the delegation example */
 const ASKS=['simple','single','parallel'];
 function autoSequence(){const session=active;if(!session||session.kind!=='auto'||session.asking)return;session.asking=true;
  const step=()=>{if(active!==session||!C.definitions().crew.autoPolicy)return;const done=new Set(session.evaluations.map(e=>e.which)),next=ASKS.find(w=>!done.has(w));if(!next)return;
   const res=evaluate(next);if(res&&res.admitted){if(active===session)play(res.runId);return;}
   if(next!=='parallel')session.askTimer=setTimeout(step,ms(PACE.nextRequest));};
  session.askTimer=setTimeout(step,ms(PACE.request));E.ctx().renderApp();}
 function stopAsking(session){if(session&&session.askTimer){clearTimeout(session.askTimer);session.askTimer=0;}}
 function play(runId){const r=runId?C.run(runId):current(),session=runId?sessions.get(r?.threadId):active;if(!r||!session||(session.runId&&session.runId!==r.id)||r.status!=='running'||clocks.has(r.id)||session.played)return;session.runId=r.id;const envelope=()=>({epoch:r.stopEpoch,sourceHash:r.crew.input.sourceHash});session.played=true;const clock={timer:null,index:0};clocks.set(r.id,clock);
  /* each step waits the time the moment before it needs on screen: two parts claimed at once read longest */
  const claim=id=>()=>W.claim(r.id,id,envelope()),deliver=id=>()=>W.deliver(r.id,id,W.payload(r.id,id)),st=(run,wait)=>({run,wait});
  const steps=r.crew.effectiveConcurrency>1?[st(()=>{const a=claim('normalize')();return a.ok?claim('quoting')():a;},PACE.first),st(deliver('normalize'),PACE.claim),st(deliver('quoting'),PACE.deliver)]
   :[st(claim('normalize'),PACE.first),st(deliver('normalize'),PACE.claim),st(claim('quoting'),PACE.deliver),st(deliver('quoting'),PACE.claim)];
  steps.push(st(claim('export'),PACE.deliver),st(deliver('export'),PACE.join),st(()=>W.finalize(r.id,envelope()),PACE.finalize));
  /* Pause holds the recording where it is; after Resume the next step waits a beat (RESUME), never lands at once */
  function next(){if(clocks.get(r.id)!==clock)return;if(r.status==='paused'){clock.paused=true;clock.timer=setTimeout(next,ms(100));return;}if(r.status!=='running'){stopClock(r.id);return;}
   if(clock.paused){clock.paused=false;clock.timer=setTimeout(next,ms(RESUME));return;}
   try{const result=steps[clock.index++].run();if(!result.ok)throw Error(result.error);session.events.push({step:clock.index,at:performance.now(),states:r.crew.assignments.map(a=>a.status)});}catch(e){session.errors.push(e.message||String(e));stopClock(r.id);E.ctx().renderApp();return;}
   E.ctx().renderApp();if(clock.index<steps.length)clock.timer=setTimeout(next,ms(steps[clock.index].wait));else stopClock(r.id);
  }clock.timer=setTimeout(next,ms(steps[0].wait));E.ctx().renderApp();
 }
 /* the example ends where the product does: the run finished (opening its panel or the CSV is yours to do, never a step) */
 function done(){const r=current();return r?.status==='completed';}
 /* 9.3 "Crew protocol fences when surfaced": the sentence, never the code (the code stays in data-failure) */
 const FENCE={stale_epoch:'crew_fence_changed',different_source:'crew_fence_changed',definition_changed:'crew_fence_changed',parent_context_changed:'crew_fence_changed',stale_participant_attempt:'crew_fence_changed',run_not_running:'crew_fence_changed',dependencies_pending:'crew_fence_waiting',dependencies_pending_or_stale:'crew_fence_waiting',concurrency_full:'crew_fence_waiting',output_contract_unsatisfied:'crew_fence_mismatch',conflicting_result:'crew_fence_mismatch',evidence_missing:'crew_fence_mismatch'};
 function failureText(code){const t=S().pmxRefusalText(FENCE[code]||code,{part:'the part before it'});return (t&&t.text?t.text:'This step couldn’t run, so the recording stopped here.')+' Replay starts it again.';}
 /* Crew Auto's verdicts, in the words of 8.2 "How it would decide" */
 const VERDICT={complexity_below_threshold:'One assistant is enough: small request.',explicit_single_agent:'One assistant is enough: you asked for one assistant.',insufficient_independent_work:'One assistant is enough: this can’t be split up.',member_cap:'One assistant is enough: the team is bigger than Crew Auto allows.',parent_mode_disallows_execution:'One assistant is enough: this chat isn’t in Agent mode.',auto_not_enabled:'Crew Auto is off, so it decided nothing.'};
 function verdictLine(c,last){
  const q=REQUESTS[last.which]||REQUESTS.parallel,res=last.result||{},admitted=!!res.admitted,code=res.reason||res.error||(admitted?'admitted':'');
  const say=admitted?'Crew brought in: big job with 2 parts that can run at once.':(VERDICT[res.reason]||'Crew Auto couldn’t decide this one.');
  return '<p class="crew-demo-evaluation" data-decision="'+c.esc(code)+'">'+S().pmxGlyph(admitted?'check':'minus',14)+'<span><span class="crew-demo-q">“'+c.esc(q.text)+'”</span> '+c.esc(say)+(admitted?'':' <span class="crew-demo-fine">No Crew started · nothing spent</span>')+'</span></p>';
 }
 function guide(c,inDialog=false,inEditor=false){
  /* the recorded sheets carry no guide line (C27 'sheet' placement retired here, CREW-B-NOTES: at 1440x900 the line
     cost the Crew sheet its plate, and pmxGuide's sheet spacing is under J-2); the foot says it is a recording */
  if(inDialog||!active||c.state.selectedThread!==active.threadId||!!c.state.dialog)return '';const r=current();if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  /* the run view counts as opened however it was reached (Open Panel on the card, a lane, the guide) */
  if(r&&c.state.editorRevealed&&c.state.activeEditor==='crew-work:'+r.id)active.opened=true;
  const policy=C.definitions().crew.autoPolicy,evals=active.evaluations,ended=r&&['canceled','failed'].includes(r.status),id=r?c.esc(r.id):'';let step='',acts=[],extra='',failure='';
  /* one control per purpose (7.12): Open Panel lives on the card right above the guide, so the guide points at it */
  if(active.kind==='delegation'&&!r){step='No Crew yet. Set up the recorded Crew to begin.';acts=[{action:'crew-demo-configure',label:'Set up the Crew'}];}
  else if(active.kind==='auto'&&!policy){step='Crew Auto is off. Set when it may call the Crew. Then the recording sends it three requests.';acts=[{action:'crew-demo-configure',label:'Set up Crew Auto'}];}
  else if(active.kind==='auto'&&!r){const n=evals.length;
   step=!n?'Crew Auto is on. The recording sends a small request first.':n===1?'Next: a big job, but the request asks for one assistant. Your choice always wins.':'Last: a big job that splits into parts.';}
  else if(r&&r.status==='running'&&!begun(r))step=r.crew.admissionKind==='auto'?'Starting. Crew Auto brought in a Crew; the Coordinator hands out its 2 parts next.':'Starting. The Coordinator is reading the job and splitting it into parts.';
  else if(r?.status==='running')step=runningStep(r);
  else if(r?.status==='paused')step='Paused. Resume it from the card’s More menu to go on.';
  else if(r?.status==='completed')step='Done. The checked CSV is ready, and your collection didn’t change. Open Panel on the card shows how each part was checked.';
  if(ended)step='This run ended. Replay starts a fresh setup.';
  if(active.errors.length){failure=active.errors[0];step=failureText(failure);}
  if(done()||ended||active.errors.length)acts=[{action:'crew-demo-replay',label:'Replay'}];
  /* each verdict stays under the guide until the next request lands; the one that brought the Crew in stays with it */
  const last=evals.at(-1);if(last&&(!r||active.kind==='auto'))extra=verdictLine(c,last);
  return S().pmxGuide({key:'crew-demo-guide',cls:'crew-demo-guide',placement:inEditor?'doc':'dock',attrs:failure?'data-failure="'+c.esc(failure)+'"':'',step:c.esc(step),extra,actions:acts,close:{action:'crew-demo-close',label:'Close the example'}});
 }
 /* the running step follows the run's progress (never "two parts run at once" while only the Integrator works) */
 function runningStep(r){const A=r.crew.assignments||[],free=A.filter(a=>!(a.dependsOn||[]).length),joins=A.filter(a=>(a.dependsOn||[]).length);
  if(joins.some(a=>a.status==='done'))return 'The file is put together and checked. The Coordinator signs it off next.';
  if(joins.some(a=>a.status==='running'))return 'The Integrator is putting the checked parts together into one CSV.';
  if(free.length&&free.every(a=>a.status==='done'))return 'Every part is checked against its “done when”. Putting them together is next.';
  if(free.some(a=>a.status==='done'))return 'One part is checked. The other is still working; putting them together waits for both.';
  return r.crew.effectiveConcurrency===1?'One part at a time. Putting it together waits for checked parts.':'Two parts run at once. Putting them together waits until both are checked.';}
 // Run another Crew receives a fresh guide after successful admission.
 // This observes an existing run; it creates no run, result, or provider effect.
 document.addEventListener('pm56:crew-example-admitted',e=>{const r=C.run(e.detail?.runId);if(!r||!W.owns(r.id))return;
  if(e.detail?.rerun){active={kind:'delegation',threadId:r.threadId,runId:r.id,played:false,opened:false,exported:false,sourceSeen:false,evaluations:[],events:[],errors:[]};sessions.set(r.threadId,active);}
  /* a recorded Crew plays from Start: no "Watch the Crew work" between Start and the work */
  /* (Crew Auto's own admission is played by autoSequence, right away) */
  const session=sessions.get(r.threadId);if(session&&session.kind!=='auto'&&!session.played&&(!session.runId||session.runId===r.id))setTimeout(()=>play(r.id),0);});
 E.chainAction('crew-open-work',(c,b)=>{if(current()?.id===b.dataset.run)active.opened=true;return false;});
 E.chainAction('crew-export-result',(c,b)=>{if(current()?.id===b.dataset.run&&current().crew.summary)active.exported=true;return false;});
 document.addEventListener('toggle',e=>{if(active&&e.target.matches?.('.crew-work-source')&&e.target.open)active.sourceSeen=true;},true);
 /* Crew Auto's rules saved (its own sheet, or the wand's while this example is open): the recording sends its requests */
 E.chainAction('collab-modal-commit',()=>{const s=active,d=C.draft();if(s&&s.kind==='auto'&&d&&d.autoMode)setTimeout(()=>{if(active===s&&C.definitions().crew.autoPolicy)autoSequence();},0);return false;});
 /* crew-demo-play and crew-demo-evaluate stay as QA hooks (pmx-surfaces); the guide never shows them */
 E.slot('composerBelow',c=>guide(c));E.action('crew-demo-start',(c,b)=>{stopAsking(active);start(b.dataset.flow);return true;});E.action('crew-demo-configure',()=>{configure(active?.kind==='auto');return true;});E.action('crew-demo-evaluate',(c,b)=>{evaluate(b.dataset.case);return true;});E.action('crew-demo-play',()=>{play();return true;});E.action('crew-demo-replay',()=>{if(active){stopAsking(active);start(active.kind);}return true;});E.action('crew-demo-close',()=>{current();stopAsking(active);restoreAuto();active=null;E.ctx().renderApp();return true;});
 E.chainAction('reset-all',()=>{for(const id of clocks.keys())stopClock(id);stopAsking(active);sessions.clear();active=null;autoStash=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','room-demo-start','wg-demo-start','b13-start'].forEach(n=>E.chainAction(n,()=>{stopAsking(active);restoreAuto();active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Guided Crew workflows</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="crew-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+old(c);

 /* "Play the recording" (8.1 G-26) is retired (2026-10-21): every recorded Crew plays from Start, so the card and the
    run view offer no control to start it. controls() stays for the callers that ask. */
 function controls(){return '';}
 /* playable(runId): true while this recorded run can still be played in place (a recorded example's session, not
    played yet, still running, and no part handed out yet: a run whose parts were already claimed is past the point a
    recording could start from); the frame's card and view offer "Play the recording" only then (7.7 G-32) */
 function begun(r){return (r.crew?.assignments||[]).some(a=>a.attempt||a.status!=='pending');}
 function playable(runId){const r=C.run(runId);if(!r||!W.owns(r.id))return false;const session=sessions.get(r.threadId);return !!(session&&!session.played&&(!session.runId||session.runId===r.id)&&r.status==='running'&&!clocks.has(r.id)&&!begun(r));}
 E.action('crew-example-play',(c,b)=>{play(b.dataset.run);return true;});
 window.PM56_CREW_DEMOS={controls,playable,start,play,evaluate,fixture,request,guide,editorGuide:id=>current()?.id===id?guide(E.ctx(),false,true):'',snapshot:()=>active?clone({...active,runId:current()?.id||null,finished:done()}):null};
})();
