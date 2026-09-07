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
 function control(action,data={}){
  const q='[data-action="'+action+'"]'+Object.entries(data).map(([k,v])=>'[data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+'="'+CSS.escape(String(v))+'"]').join('');
  const b=[...document.querySelectorAll(q)].find(b=>b.getClientRects().length&&!b.disabled);if(!b)throw Error('Visible control unavailable: '+action);b.scrollIntoView({block:'nearest'});b.click();
 }
 function raw(action,data={}){const b=document.createElement('button');Object.assign(b.dataset,data);E.run(action,b,new Event('click'));}
 function start(flow){
  if(!flows[flow])return;
  if(active){const old=plan(),b=schedule();if(old?.status==='building')raw('pd-cancel',{id:old.plan_id});if(b?.state==='active')raw('sched-cancel-build',{id:b.schedule_id});}
  window.PM56_PLAN_DEMOS.start('complete');const seed=window.PM56_PLAN_DEMOS.snapshot();raw('plan-demo-close');
  const c=ctx(),t=c.activeThread();t.title=flows[flow].label;
  active={flow,planId:seed.planId,threadId:seed.threadId,step:0,scheduleId:null,initial:clone(P.get(seed.planId).revisions[1]),events:[],error:null,preview:null};
  c.renderApp();
 }
 function field(name,value){const el=document.querySelector('[data-sched-input="'+name+'"]');if(!el)throw Error('Schedule field unavailable: '+name);el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));}
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
    if(!b)throw Error('Schedule was not committed');a.scheduleId=b.schedule_id;
    if(b.exact_target_hash!==P.hash(p.plan_id)||b.exact_target_version!==p.version)throw Error('Binding does not match the Plan');
   }
   if(kind==='close'){
    control('sched-close-dialog');await pause();if(active!==a)return;
    const b=document.querySelector('[data-action="pd-more-actions"][data-id="'+p.plan_id+'"][aria-expanded="true"]');if(b)b.click();
   }
   if(kind==='revise'){control('pd-revise',{id:p.plan_id});if(innerWidth<=1100)control('return-to-chat');}
   if(kind==='feedback'){
    const el=document.querySelector('textarea[data-input="composer"]');el.value='Also verify selection after favorites are reordered.';el.dispatchEvent(new Event('input',{bubbles:true}));control('send');
    if(p.version!==2||schedule().state!=='invalidated')throw Error('The V1 schedule was not invalidated');
   }
   if(kind==='review')control('sched-open-plan-record',{id:a.scheduleId});
   if(kind==='rebind'){
    control('sched-rebind-build',{id:a.scheduleId});if(schedule().exact_target_version!==2)throw Error('V2 was not bound');
   }
   if(kind==='cancel'){control('sched-cancel-build',{id:a.scheduleId});if(schedule().state!=='canceled')throw Error('Cancellation did not persist');}
   if(kind==='due'){
    const b=schedule();a.preview=S.dispatchBuildAt(b.schedule_id,Date.parse(b.scheduled_at_utc),b.revision);
    if(a.flow==='cancel'){
     if(a.preview.ok||p.status!=='ready'||p.approved)throw Error('Canceled schedule admitted work');
    }else if(!a.preview.ok||p.status!=='building')throw Error('Scheduled build was not admitted: '+a.preview.clause);
   }
   if(kind==='todos'){
    control('pd-more-actions',{id:p.plan_id});await pause();if(active!==a)return;control('pd-open-todos',{id:p.plan_id});await pause();if(active!==a)return;control('pd-more-actions',{id:p.plan_id});
   }
   a.events.push({step:kind,at:performance.now(),planVersion:p.version,planStatus:p.status,scheduleState:schedule()?.state});a.step++;a.error=null;
  }catch(err){a.error=String(err.message||err);}finally{a.busy=false;if(active===a)refreshGuide();}
 }
 function finished(){if(!active)return false;return active.flow==='due'?active.step>=7&&plan()?.status==='completed':active.step>=flows[active.flow].steps.length;}
 function guide(c,inDialog,inEditor=false){
  if(!active||c.state.selectedThread!==active.threadId)return '';
  if(!!c.state.dialog!==inDialog)return '';
  const covered=innerWidth<=1100&&c.state.editorRevealed;
  if(!inDialog&&covered!==inEditor)return '';
  const a=active,f=flows[a.flow],step=f.steps[a.step],done=finished(),wait=step?.[2]==='wait';
  const title=done?(a.flow==='due'?'V1 completed · one scheduled build':a.flow==='revise'?'V2 started · V1 unchanged':'Canceled · no build or To-Dos'):step?.[0]||'Inspect result';
  return '<div class="plan-demo-guide schedule-demo-guide" data-k="schedule-demo-guide"><div><small>Guided demo · '+c.esc(f.label)+(a.preview?' · Due time preview':'')+'</small><strong>'+c.esc(title)+'</strong></div><div class="plan-demo-controls"><button data-action="schedule-demo-'+(done?'replay':'next')+'"'+(!done&&(wait||a.busy)?' disabled':'')+'>'+c.esc(done?'Replay':step?.[1]||'Continue')+'</button><button class="plan-demo-close" data-action="schedule-demo-close" title="Close guide">'+c.icon('close',14)+'</button></div>'+(a.error?'<p role="status">'+c.esc(a.error)+'</p>':'')+'</div>';
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
 E.chainAction('reset-all',()=>{active=null;return false;});
 E.chainAction('plan-demo-start',()=>{active=null;return false;});
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;
 G.gallery=c=>'<section class="demo-section"><h3>Guided Plan scheduling</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="schedule-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.summary)+'</small></button>').join('')+'</div></section>'+old(c);
 window.PM56_SCHEDULE_DEMOS={start,snapshot:()=>active?clone({...active,finished:!!finished()}):null,dialogGuide:c=>guide(c,true),editorGuide:id=>active&&active.planId===id?guide(ctx(),false,true):''};
})();
