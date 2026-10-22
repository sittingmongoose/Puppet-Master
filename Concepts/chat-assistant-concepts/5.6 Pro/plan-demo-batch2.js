/* Batch 2, gallery only. The clock preview is explicit; no background schedule
 * or native provider is simulated. All configuration/mutations use the visible
 * product controls, and a due-time preview calls the scheduler's owner seam.
 * Playback (2026-10-22, Jared: recorded examples play on their own after Start): every example plays from Start through
 * PM56_RECPLAY, paced to read, pressing the product's own controls (lit first): Open plan, More, Build At…, One time,
 * the date and the start time, Done, Revise, the feedback typed and sent, Review, Cancel schedule, To-Dos. Schedule build
 * approves the exact version to build later, so it is yours, as a plan's Build is: each example waits there, and goes on
 * by itself after you press it. The due time is the demo clock reaching the slot (the scheduler's own seam, narrated). The
 * revise example also waits where the schedule waits on your decision: a newer version stopped the V1 schedule, and Use
 * V2 is yours. The guide narrates
 * what is happening and what comes next (dock, sheet or document line); its only buttons are Replay and Close.
 * schedule-demo-next stays as a QA hook. */
(function(){
 'use strict';
 const E=window.PM56_EXT,S=window.PM56_SCHED,P=window.PM56_PLANS,R=window.PM56_RECPLAY;
 let active=null,player=null;
 const common=[['Open the plan','Open plan','open'],['Choose when to build','Build At…','at'],['Set a one-time schedule','Set time','time'],['Save this exact version','Schedule build','save']];
 const flows={
  due:{label:'Schedule and build',summary:'Bind V1 → preview due time → complete',steps:[...common,['Inspect the saved binding','Return to plan','close'],['Preview the scheduled time','Preview due time','due'],['Follow the build','Open To-Dos','todos'],['Tasks are running','Waiting for completion','wait']]},
  revise:{label:'Revise a scheduled Plan',summary:'Schedule V1 → revise → explicitly use V2',steps:[...common,['Return to the document','Return to plan','close'],['Change the planned scope','Revise','revise'],['Create a new version','Send feedback','feedback'],['Inspect the outdated binding','Review schedule','review'],['Choose the new version explicitly','Use V2','rebind'],['Inspect the updated binding','Return to plan','close'],['Preview the new scheduled build','Preview due time','due']]},
  cancel:{label:'Cancel a scheduled build',summary:'Schedule → cancel → prove no dispatch',steps:[...common,['Cancel this schedule only','Cancel schedule','cancel'],['Keep the canceled record','Return to plan','close'],['Preview its original due time','Preview due time','due']]}
 };
 const clone=x=>JSON.parse(JSON.stringify(x));
 function ctx(){return E.ctx();}function plan(){return active&&P.get(active.planId);}function schedule(){return active&&S.list().builds.find(b=>b.schedule_id===active.scheduleId);}
 function query(action,data={}){return '[data-action="'+action+'"]'+Object.entries(data).map(([k,v])=>'[data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+'="'+CSS.escape(String(v))+'"]').join('');}
 function visible(action,data={}){return [...document.querySelectorAll(query(action,data))].some(b=>b.getClientRects().length&&!b.disabled&&!b.closest('.pmx-ghost'));}
 function control(action,data={}){
  const b=[...document.querySelectorAll(query(action,data))].find(b=>b.getClientRects().length&&!b.disabled&&!b.closest('.pmx-ghost'));if(!b)throw Error('That control isn’t on screen right now. Close what’s open, then press the step again.');b.scrollIntoView({block:'nearest'});b.click();
 }
 function raw(action,data={}){const b=document.createElement('button');Object.assign(b.dataset,data);E.run(action,b,new Event('click'));}
 function start(flow){
  if(!flows[flow])return;
  if(active){const old=plan(),b=schedule();if(old?.status==='building')raw('pd-cancel',{id:old.plan_id});if(b?.state==='active')raw('sched-cancel-build',{id:b.schedule_id});}
  window.PM56_PLAN_DEMOS.start('complete');const seed=window.PM56_PLAN_DEMOS.snapshot();raw('plan-demo-close');
  const c=ctx(),t=c.activeThread();t.title=flows[flow].label;
  active={flow,planId:seed.planId,threadId:seed.threadId,step:0,sub:0,scheduleId:null,initial:clone(P.get(seed.planId).revisions[1]),events:[],error:null,preview:null,known:S.list().builds.map(b=>b.schedule_id)};
  playback();c.renderApp();
 }
 /* the recording: each step of the flow is a few presses on the product's own controls (PM56_RECPLAY); next() names
    the next one from the example's own state. A step's checks are the ones next() always made. */
 const FEEDBACK='Also verify selection after favorites are reordered.';
 const PACE={first:1100,more:3600,item:1300,kind:2600,field:1100,save:2200,done:4200,due:4800,revise:3200,type:1600,send:700,review:4600,cancel:3800,todos:3600};
 const tomorrow=()=>new Date(Date.now()+86400000).toISOString().slice(0,10);
 function finishStep(a,kind){const p=plan();a.events.push({step:kind,at:performance.now(),planVersion:p.version,planStatus:p.status,scheduleState:schedule()?.state});a.step++;a.sub=0;a.error=null;}
 function subs(a,kind){const p=plan(),pid=p.plan_id,more=query('pd-more-actions',{id:pid}),sid=a.scheduleId;
  const press=(sel,wait,o)=>Object.assign({wait,run:()=>R.press(sel)},o||{});
  if(kind==='open')return [press(query('pd-open-version',{id:pid}),PACE.first)];
  if(kind==='at')return [Object.assign(press(more,PACE.more),{skip:()=>!!document.querySelector('.polish-plan-more')||visible('pd-build-at',{id:pid})}),press(query('pd-build-at',{id:pid}),PACE.item)];
  if(kind==='time')return [press('#pmOverlayRoot '+query('sched-set-build-kind',{value:'one_time'}),PACE.kind,{dialog:true}),
   {wait:PACE.field,dialog:true,run:()=>R.choose('[data-sched-input="build-date"]',tomorrow())},
   {wait:PACE.field,dialog:true,run:()=>R.choose('[data-sched-input="build-time"]','10:00').then(ok=>{if(ok){const z=document.querySelector('[data-sched-input="build-tz"]');if(z){z.value='America/New_York';z.dispatchEvent(new Event('change',{bubbles:true}));}}return ok;})}];
  /* Schedule build approves this exact version for a later build: yours to press (follow() sees it and moves on) */
  if(kind==='save')return [];
  if(kind==='close')return [Object.assign(press('#pmOverlayRoot '+query('sched-close-dialog'),PACE.done,{dialog:true}),{skip:()=>!visible('sched-close-dialog')}),
   Object.assign(press(more+'[aria-expanded="true"]',PACE.item),{skip:()=>!document.querySelector(more+'[aria-expanded="true"]')})];
  if(kind==='revise')return [press(query('pd-revise',{id:pid}),PACE.revise),Object.assign(press('[data-action="return-to-chat"]',PACE.item),{skip:()=>!(innerWidth<=1100&&E.ctx().state.editorRevealed)})];
  if(kind==='feedback')return [{wait:PACE.type,run:()=>R.type(FEEDBACK)},{wait:PACE.send,run:()=>R.press('.composer [data-action="send"]').then(ok=>{if(ok&&(p.version!==2||schedule().state!=='invalidated'))throw Error('The V1 schedule didn’t stop for the new version.');return ok;})}];
  if(kind==='review')return [press(query('sched-open-plan-record',{id:sid}),PACE.review,{dialog:true})];
  if(kind==='cancel')return [Object.assign(press(query('sched-open-plan-record',{id:sid}),PACE.review,{dialog:true}),{skip:()=>visible('sched-cancel-build',{id:sid})}),
   {wait:PACE.cancel,dialog:true,run:()=>R.press(query('sched-cancel-build',{id:sid})).then(ok=>{if(ok&&schedule().state!=='canceled')throw Error('The schedule wasn’t canceled.');return ok;})}];
  if(kind==='due')return [{wait:PACE.due,run:()=>{due(a);return true;}}];
  if(kind==='todos')return [press(more,PACE.todos),press(query('pd-open-todos',{id:pid}),PACE.item),press(more,PACE.item)];
  return [];}
 /* the due time: the demo clock reaches the schedule's own slot (a one-time slot's instant, or a nightly slot's next start) */
 function due(a){const p=plan(),b=schedule(),at=b.schedule_kind==='one_time'?Date.parse(b.scheduled_at_utc):Date.parse(b.next_occurrence_at||'');
  a.preview=S.dispatchBuildAt(b.schedule_id,at,b.revision);
  if(a.flow==='cancel'){if(a.preview.ok||p.status!=='ready'||p.approved)throw Error('The canceled schedule started work. It should not have.');}
  else if(!a.preview.ok||p.status!=='building')throw Error('The build didn’t start. '+(S.refusalText?S.refusalText(a.preview):window.PM56_SHELL.PMX_COPY.refusal.fallback));}
 function next(){const a=active;if(!a)return null;follow(a);const f=flows[a.flow],step=f.steps[a.step],kind=step&&step[2];if(!kind||kind==='wait')return null;
  /* Use V2 is yours: the schedule stopped for the newer version and waits on your decision */
  if(kind==='rebind'){if(schedule()?.exact_target_version===2){finishStep(a,kind);}return null;}
  if(kind==='save')return null;
  const list=subs(a,kind);
  while(a.sub<list.length&&list[a.sub].skip&&list[a.sub].skip())a.sub++;
  if(a.sub>=list.length){finishStep(a,kind);return null;}
  const b=list[a.sub],id=kind+':'+a.step+':'+a.sub;
  return {id,wait:b.wait,dialog:b.dialog,menu:b.menu,run:()=>Promise.resolve(b.run()).then(ok=>{if(ok!==false&&active===a&&a.step<f.steps.length&&f.steps[a.step][2]===kind){a.sub++;if(a.sub>=list.length)finishStep(a,kind);}return ok;},e=>{a.error=String(e.message||e);throw e;})};}
 function playback(){if(player)player.stop();const s=active;player=R.play({key:'schedule-demo',live:()=>active===s,threads:()=>[s.threadId],next,render:()=>refreshGuide(),superseded:()=>{if(active===s)active=null;}});}
 function stop(){if(player){player.stop();player=null;}}
 function field(name,value){const el=document.querySelector('[data-sched-input="'+name+'"]');if(!el)throw Error('Build At isn’t open, so its time can’t be set. Press the step before this one first.');el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));}
 /* qaNext: the old one-step-per-press walk, kept as the schedule-demo-next QA hook (the guide never shows it) */
 async function qaNext(){
  const a=active;if(!a||a.busy)return;const step=flows[a.flow].steps[a.step];if(!step||step[2]==='wait')return;
  a.busy=true;const pause=()=>new Promise(r=>setTimeout(r,160));
  try{
   const p=plan(),kind=step[2];
   if(kind==='open')control('pd-open-version',{id:p.plan_id});
   if(kind==='at'){
    if(!document.querySelector('.polish-plan-more')){control('pd-more-actions',{id:p.plan_id});await pause();}
    control('pd-build-at',{id:p.plan_id});
   }
   if(kind==='time'){
    control('sched-set-build-kind',{value:'one_time'});await pause();if(active!==a)return;
    const date=new Date(Date.now()+86400000).toISOString().slice(0,10);
    field('build-date',date);field('build-time','10:00');field('build-tz','America/New_York');
   }
   if(kind==='save'){
    control('sched-create-build');const b=S.list().builds.find(b=>b.target_id===p.plan_id);
    if(!b)throw Error('Nothing was scheduled. Press the step again.');a.scheduleId=b.schedule_id;
    if(b.exact_target_hash!==P.hash(p.plan_id)||b.exact_target_version!==p.version)throw Error('The schedule doesn’t match this version of the plan.');
   }
   if(kind==='close'){
    if(visible('sched-close-dialog')){control('sched-close-dialog');await pause();if(active!==a)return;}  /* the reader may have closed it already */
    const b=document.querySelector('[data-action="pd-more-actions"][data-id="'+p.plan_id+'"][aria-expanded="true"]');if(b)b.click();
   }
   if(kind==='revise'){control('pd-revise',{id:p.plan_id});if(innerWidth<=1100)control('return-to-chat');}
   if(kind==='feedback'){
    const el=document.querySelector('textarea[data-input="composer"]');el.value='Also verify selection after favorites are reordered.';el.dispatchEvent(new Event('input',{bubbles:true}));control('send');
    if(p.version!==2||schedule().state!=='invalidated')throw Error('The V1 schedule didn’t stop for the new version.');
   }
   if(kind==='review')control('sched-open-plan-record',{id:a.scheduleId});
   if(kind==='rebind'){
    control('sched-rebind-build',{id:a.scheduleId});if(schedule().exact_target_version!==2)throw Error('The schedule is still set to V1.');
   }
   if(kind==='cancel'){
    /* Build At now confirms in place; the schedule's own Cancel lives in Scheduled, one visible click away */
    if(!visible('sched-cancel-build',{id:a.scheduleId})){control('sched-open-plan-record',{id:a.scheduleId});await pause();if(active!==a)return;}
    control('sched-cancel-build',{id:a.scheduleId});if(schedule().state!=='canceled')throw Error('The schedule wasn’t canceled.');}
   if(kind==='due'){
    /* the due time is the schedule's own: a one-time slot's instant, or a nightly slot's next start (the reader may
       have committed the sheet's own primary, which is the nightly default) */
    const b=schedule(),at=b.schedule_kind==='one_time'?Date.parse(b.scheduled_at_utc):Date.parse(b.next_occurrence_at||'');
    a.preview=S.dispatchBuildAt(b.schedule_id,at,b.revision);
    if(a.flow==='cancel'){
     if(a.preview.ok||p.status!=='ready'||p.approved)throw Error('The canceled schedule started work. It should not have.');
    }else if(!a.preview.ok||p.status!=='building')throw Error('The build didn’t start. '+(S.refusalText?S.refusalText(a.preview):window.PM56_SHELL.PMX_COPY.refusal.fallback));
   }
   if(kind==='todos'){
    control('pd-more-actions',{id:p.plan_id});await pause();if(active!==a)return;control('pd-open-todos',{id:p.plan_id});await pause();if(active!==a)return;control('pd-more-actions',{id:p.plan_id});
   }
   a.events.push({step:kind,at:performance.now(),planVersion:p.version,planStatus:p.status,scheduleState:schedule()?.state});a.step++;a.sub=0;a.error=null;
  }catch(err){a.error=String(err.message||err);}finally{a.busy=false;if(active===a)refreshGuide();}
 }
 /* the guide follows the reader's own click: a schedule for this Plan committed with the sheet's own primary (not
    the guide's "Schedule build") moves the guide past its save step, so Done never strands the flow */
 function follow(a){
  if(!a||a.busy||a.scheduleId)return;const k=flows[a.flow].steps.map(s=>s[2]),at=k.indexOf('save');if(at<0||a.step>at)return;
  const p=plan(),b=p&&S.list().builds.find(b=>b.target_id===p.plan_id&&b.state==='active'&&!a.known.includes(b.schedule_id));
  if(!b||b.exact_target_version!==p.version)return;
  a.scheduleId=b.schedule_id;a.events.push({step:'save',at:performance.now(),planVersion:p.version,planStatus:p.status,scheduleState:b.state,by:'reader'});a.step=at+1;a.sub=0;a.error=null;
 }
 function finished(){if(!active)return false;return active.flow==='due'?active.step>=7&&plan()?.status==='completed':active.step>=flows[active.flow].steps.length;}
 /* The guide is the one pmx guide look (G-25): a sheet line inside Build At and the manager, a dock line in the
    chat, a document line beside the Plan. No engine words and no batch numbers; the step is what to do next. */
 /* what is happening and what comes next, for each step of each flow; at Use V2, plainly what you are asked */
 const SAY={open:'The assistant wrote a plan. Next: you open it, then schedule its build for later instead of building now.',
  at:'Next: Build At…, from the plan’s More menu, sets a time to build this exact version.',
  time:'Build At opens. Next: you choose One time, tomorrow at 10:00.',
  save:'Your move: Schedule build approves this exact version, V1, to build tomorrow at 10:00. Press it when you’re ready; the recording goes on from there.',
  close:'Scheduled: V1 builds tomorrow at 10:00, exactly as it is now. Next: back to the plan.',
  revise:'Scheduled for V1. Next: you revise the plan before the slot comes.',
  feedback:'Revising: the message box writes to this plan now. Next: you type what to change and send it.',
  review:'Version 2 is written, so the V1 schedule stopped instead of building something you never approved. Next: you open it in Scheduled.',
  cancel:'Scheduled for V1. Next: you cancel this one schedule in Scheduled; the plan itself stays.',
  todos:'The slot came: V1 is building, on schedule. Next: its To-Dos, from the plan’s More menu.',
  wait:'The two tasks run. The plan completes when both are done.'};
 function say(){const a=active,f=flows[a.flow],step=f.steps[a.step],kind=step&&step[2];
  if(player&&player.errors.length)return {text:'This step couldn’t run, so the recording stopped here. Replay starts it again.',done:true};
  if(finished()){const nightly=schedule()?.schedule_kind==='recurring_window';return {text:a.flow==='due'?(nightly?'Done · Built V1 in its first nightly slot.':'Done · Built V1 once, on schedule, and both tasks completed.'):a.flow==='revise'?'Done · V2 is building in its slot. The V1 schedule was never used.':'Done · Canceled. When its time came, nothing was built and no To-Dos were made.',done:true};}
  if(kind==='save')return {text:SAY.save,done:true,yours:true};
  if(kind==='rebind')return {text:'Your move: the schedule stopped for version 2 and waits for you. Press Use V2 to build the new version in the same slot, or Cancel schedule.',done:true,yours:true};
  if(kind==='close'&&a.flow==='revise'&&a.step>6)return {text:'Bound to V2. Next: back to the plan, then the slot comes.'};
  if(kind==='due')return {text:a.flow==='cancel'?'Canceled. Next: the clock reaches the original time, and nothing should build.':a.flow==='revise'?'Next: the clock reaches the slot, and V2 builds.':'Next: the clock reaches tomorrow at 10:00, and the schedule builds V1.'};
  if(kind==='close'&&a.flow==='cancel')return {text:'Canceled: this schedule will never dispatch, and its record is kept. Next: back to the plan.'};
  return {text:SAY[kind]||''};}
 /* The guide is the one pmx guide look (G-25): a sheet line inside Build At and the manager, a dock line in the
    chat, a document line beside the Plan. No engine words and no batch numbers. */
 function guide(c,inDialog,inEditor=false){
  if(!active||c.state.selectedThread!==active.threadId)return '';
  if(!!c.state.dialog!==inDialog)return '';
  const covered=innerWidth<=1100&&c.state.editorRevealed;
  if(!inDialog&&covered!==inEditor)return '';
  follow(active);
  const a=active,f=flows[a.flow],s=say(),text=R.steady(a,s.text,!!s.done,()=>refreshGuide());if(!text)return '';
  const SH=window.PM56_SHELL;
  return SH.pmxGuide({key:'schedule-demo-guide',cls:'schedule-demo-guide',placement:inDialog?'sheet':inEditor?'doc':'dock',caption:'Recorded example · '+c.esc(f.label),
   step:c.esc(text),actions:s.done&&text===s.text&&!inDialog?[{action:'schedule-demo-replay',label:'Replay'}]:[],next:player&&player.progress(),close:inDialog?null:{action:'schedule-demo-close',label:'Close the example'},
   extra:a.error?'<p class="pmx-fine schedule-demo-error" role="status">'+c.esc(a.error)+'</p>':''});
 }
 // Product controls already rendered their owned surfaces. Updating the guide
 // must not remount the entire app and restart unrelated transitions.
 function refreshGuide(){
  const c=ctx(),inDialog=!!c.state.dialog,inEditor=!inDialog&&innerWidth<=1100&&c.state.editorRevealed;
  const html=guide(c,inDialog,inEditor),nodes=[...document.querySelectorAll('.schedule-demo-guide')];
  const node=nodes.find(n=>!!n.closest('.sched-dialog')===inDialog);
  nodes.filter(n=>n!==node).forEach(n=>n.remove());
  if(node&&html)node.outerHTML=html;else c.renderApp();
 }
 E.slot('composerBelow',c=>guide(c,false));
 E.action('schedule-demo-start',(c,b)=>{start(b.dataset.flow);return true;});
 E.action('schedule-demo-next',()=>{qaNext();return true;});
 E.action('schedule-demo-replay',()=>{if(active)start(active.flow);return true;});
 E.action('schedule-demo-close',()=>{stop();active=null;ctx().renderApp();return true;});
 /* closing a Scheduling sheet re-renders only the overlays: scheduling.js calls afterClose() from sched-close-dialog,
    and the guide comes back to the chat (or the Plan) once the sheet has gone (its exit keeps the dialog state for a
    moment), whoever closed it (the reader's Done included) */
 function afterClose(){if(!active)return;let n=0;const back=()=>{if(!active)return;if(ctx().state.dialog&&++n<40){setTimeout(back,50);return;}if(!ctx().state.dialog)refreshGuide();};setTimeout(back,50);}
 E.chainAction('reset-all',()=>{stop();active=null;return false;});
 E.chainAction('plan-demo-start',()=>{stop();active=null;return false;});
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;
 G.gallery=c=>'<section class="demo-section"><h3>Guided Plan scheduling</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="schedule-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.summary)+'</small></button>').join('')+'</div></section>'+old(c);
 window.PM56_SCHEDULE_DEMOS={start,snapshot:()=>active?clone({...active,finished:!!finished()}):null,dialogGuide:c=>guide(c,true),editorGuide:id=>active&&active.planId===id?guide(ctx(),false,true):'',afterClose};
})();
