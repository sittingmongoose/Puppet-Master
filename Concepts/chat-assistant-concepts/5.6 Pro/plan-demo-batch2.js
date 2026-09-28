/* Batch 2, gallery only. The clock preview is explicit; no background schedule
 * or native provider is simulated. All configuration/mutations use the visible
 * product controls, and a due-time preview calls the scheduler's owner seam. */
(function(){
 'use strict';
 const E=window.PM56_EXT,S=window.PM56_SCHED,P=window.PM56_PLANS;
 let active=null;
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
  active={flow,planId:seed.planId,threadId:seed.threadId,step:0,scheduleId:null,initial:clone(P.get(seed.planId).revisions[1]),events:[],error:null,preview:null,known:S.list().builds.map(b=>b.schedule_id)};
  c.renderApp();
 }
 function field(name,value){const el=document.querySelector('[data-sched-input="'+name+'"]');if(!el)throw Error('Build At isn’t open, so its time can’t be set. Press the step before this one first.');el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));}
 async function next(){
  const a=active;if(!a||a.busy)return;const step=flows[a.flow].steps[a.step];if(!step||step[2]==='wait')return;
  a.busy=true;const pause=()=>new Promise(r=>setTimeout(r,160));
  try{
   const p=plan(),kind=step[2];
   if(kind==='open')control('pd-info',{id:p.plan_id});
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
    }else if(!a.preview.ok||p.status!=='building')throw Error('The build didn’t start. '+(S.refusalText?S.refusalText(a.preview):'It couldn’t start, so nothing changed.'));
   }
   if(kind==='todos'){
    control('pd-more-actions',{id:p.plan_id});await pause();if(active!==a)return;control('pd-open-todos',{id:p.plan_id});await pause();if(active!==a)return;control('pd-more-actions',{id:p.plan_id});
   }
   a.events.push({step:kind,at:performance.now(),planVersion:p.version,planStatus:p.status,scheduleState:schedule()?.state});a.step++;a.error=null;
  }catch(err){a.error=String(err.message||err);}finally{a.busy=false;if(active===a)refreshGuide();}
 }
 /* the guide follows the reader's own click: a schedule for this Plan committed with the sheet's own primary (not
    the guide's "Schedule build") moves the guide past its save step, so Done never strands the flow */
 function follow(a){
  if(!a||a.busy||a.scheduleId)return;const k=flows[a.flow].steps.map(s=>s[2]),at=k.indexOf('save');if(at<0||a.step>at)return;
  const p=plan(),b=p&&S.list().builds.find(b=>b.target_id===p.plan_id&&b.state==='active'&&!a.known.includes(b.schedule_id));
  if(!b||b.exact_target_version!==p.version)return;
  a.scheduleId=b.schedule_id;a.events.push({step:'save',at:performance.now(),planVersion:p.version,planStatus:p.status,scheduleState:b.state,by:'reader'});a.step=at+1;a.error=null;
 }
 function finished(){if(!active)return false;return active.flow==='due'?active.step>=7&&plan()?.status==='completed':active.step>=flows[active.flow].steps.length;}
 /* The guide is the one pmx guide look (G-25): a sheet line inside Build At and the manager, a dock line in the
    chat, a document line beside the Plan. No engine words and no batch numbers; the step is what to do next. */
 function guide(c,inDialog,inEditor=false){
  if(!active||c.state.selectedThread!==active.threadId)return '';
  if(!!c.state.dialog!==inDialog)return '';
  const covered=innerWidth<=1100&&c.state.editorRevealed;
  if(!inDialog&&covered!==inEditor)return '';
  follow(active);
  const a=active,f=flows[a.flow],step=f.steps[a.step],done=finished(),wait=step?.[2]==='wait';
  const nightly=schedule()?.schedule_kind==='recurring_window';
  const title=done?(a.flow==='due'?(nightly?'Built V1 in its first nightly slot.':'Built V1 once, on schedule.'):a.flow==='revise'?'V2 is building. The V1 schedule was never used.':'Canceled. Nothing was built and no To-Dos were made.'):(step?.[0]||'See the result')+(a.preview?' · the due time was previewed':'');
  const SH=window.PM56_SHELL,btn=done?{action:'schedule-demo-replay',label:'Replay'}:{action:'schedule-demo-next',label:c.esc(step?.[1]||'Continue'),attrs:(wait||a.busy)?'disabled':''};
  return SH.pmxGuide({key:'schedule-demo-guide',cls:'schedule-demo-guide',placement:inDialog?'sheet':inEditor?'doc':'dock',caption:'Guided example · '+c.esc(f.label),
   step:c.esc(title),actions:[btn],close:{action:'schedule-demo-close',label:'Close the guide'},
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
 E.action('schedule-demo-next',()=>{next();return true;});
 E.action('schedule-demo-replay',()=>{if(active)start(active.flow);return true;});
 E.action('schedule-demo-close',()=>{active=null;ctx().renderApp();return true;});
 /* closing a Scheduling sheet re-renders only the overlays: scheduling.js calls afterClose() from sched-close-dialog,
    and the guide comes back to the chat (or the Plan) once the sheet has gone (its exit keeps the dialog state for a
    moment), whoever closed it (the reader's Done included) */
 function afterClose(){if(!active)return;let n=0;const back=()=>{if(!active)return;if(ctx().state.dialog&&++n<40){setTimeout(back,50);return;}if(!ctx().state.dialog)refreshGuide();};setTimeout(back,50);}
 E.chainAction('reset-all',()=>{active=null;return false;});
 E.chainAction('plan-demo-start',()=>{active=null;return false;});
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;
 G.gallery=c=>'<section class="demo-section"><h3>Guided Plan scheduling</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="schedule-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.summary)+'</small></button>').join('')+'</div></section>'+old(c);
 window.PM56_SCHEDULE_DEMOS={start,snapshot:()=>active?clone({...active,finished:!!finished()}):null,dialogGuide:c=>guide(c,true),editorGuide:id=>active&&active.planId===id?guide(ctx(),false,true):'',afterClose};
})();
