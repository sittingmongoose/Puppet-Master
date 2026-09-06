/* Scoped demonstration entry points. None are product commands or timers. */
(function(){
 'use strict';const E=window.PM56_EXT;
 const scenarios=[
  ['schedules-overview','Scheduling','Message overview','Needs attention, upcoming and history'],
  ['schedules-windows','Scheduling','Build windows','One-time and recurring windows'],
  ['schedule-new','Scheduled messages','New message','Detached message, time, route and missed policy'],
  ['schedule-edit','Scheduled messages','Edit existing message','Same record and revision on save'],
  ['schedule-once','Build scheduling','One-time build','Exact plan version and local start'],
  ['schedule-recurring','Build scheduling','Recurring build','Weekdays, overnight pause and resume'],
  ['schedule-stop','Automation safety','Manual-stop refusal','Automatic resume remains blocked'],
  ['schedule-race','Automation safety','Stop / dispatch race','Stale callback refused in the event log'],
  ['schedule-duplicate','Automation safety','Duplicate window event','One recorded occurrence, not two runs'],
  ['bsd-config','Back Seat Driver','Configure advisor','Model, persona, cadence, context and stages'],
  ['bsd-held','Back Seat Driver','Held advisor findings','Original findings and source generation'],
  ['crew-config','Collaboration','Crew lineup','Shared model and persona pickers'],
  ['crew-auto-config','Collaboration','Crew Auto lineup','Shared pickers within automatic criteria'],
  ['chat-room-config','Collaboration','Chat Room lineup','Participant-specific model and persona'],
  ['brainstorm-config','Collaboration','BrainStorm lineup','Planning roles and shared pickers'],
  ['review-config','Collaboration','Review lineup','Independent reviewer routing'],
  ['lens-focus','Context Lens','Focus messages','In-flow lens and immediate selection'],
  ['lens-subcompact','Context Lens','Subcompact preview','Explicit Apply with the transcript below'],
  ['plan-index','Plans','Analytics plan tab','One document with all plan controls'],
  ['plan-auth','Plans','Access-control plan tab','Another plan, independent tab and state'],
  ['record-provider','Transcript records','Provider selector change','File identity and recorded hunk at line 65'],
  ['record-provider-second','Transcript records','Provider selector follow-up','Same file, recorded hunk at line 227'],
  ['record-note','Transcript records','Work note','Unlinked note, not a fabricated artifact'],
  ['activity-todo','Activity','To-Do preview','Clickable bounded preview opens pinned details'],
  ['activity-changes','Activity','Changed-file preview','Clickable file opens its pinned record'],
  ['work-orbit','Working activity','Orbit sequence','Existing default component in view'],
  ['work-simple','Working activity','Step Rail Simple sequence','Existing simple component in view']
 ];
 function invoke(ctx,action,ds={}){const b=document.createElement('button');Object.assign(b.dataset,ds);E.run(action,b,new Event('click'));}
 function launch(ctx,id){
  if(!scenarios.some(r=>r[0]===id))return;
  ctx.closeMenu();ctx.closeDialog();ctx.state.hover=null;ctx.state.context.details=false;ctx.state.activity.open=false;
  if(id.startsWith('schedule')){
   window.PM56_SCHED.restore();ctx.switchThread('query');ctx=E.ctx();
   const rec=window.PM56_SCHED.list().messages.find(m=>m.state==='scheduled');const build=window.PM56_SCHED.list().builds.find(b=>b.state==='active'&&b.schedule_kind==='recurring_window');
   if(id==='schedule-new'){invoke(ctx,'sched-open-message');return;}
   if(id==='schedule-edit'){invoke(ctx,'sched-edit-message',{id:rec.scheduled_dispatch_id});return;}
   if(id==='schedule-once'){invoke(ctx,'sched-open-build-at',{planId:'ap-index',planVersion:String(window.PM56_PLANS.get('ap-index').version)});return;}
   if(id==='schedule-recurring'){invoke(ctx,'sched-edit-build',{id:build.schedule_id});return;}
   invoke(ctx,'sched-open-manage');
   if(id==='schedules-windows')invoke(ctx,'sched-manage-tab',{tab:'builds'});
   if(id==='schedule-stop'){invoke(ctx,'sched-simulate-stop');invoke(ctx,'sched-attempt-resume');invoke(ctx,'sched-manage-tab',{tab:'quota'});}
   if(id==='schedule-race'){invoke(ctx,'sched-race-demo');invoke(ctx,'sched-manage-tab',{tab:'events'});}
   if(id==='schedule-duplicate'){invoke(ctx,'sched-fire-duplicate',{id:build.schedule_id});invoke(ctx,'sched-manage-tab',{tab:'events'});}
   return;
  }
  if(id==='bsd-config'){invoke(ctx,'bsd-configure-stages');return;}
  if(id==='bsd-held'){ctx.switchThread('bsd');ctx.state.context.details=true;ctx.renderApp();return;}
  const kinds={'crew-config':'crew','crew-auto-config':'crew','chat-room-config':'chat_room','brainstorm-config':'brainstorm','review-config':'review'};
  if(kinds[id]){invoke(ctx,'collab-open-configure',{kind:kinds[id],auto:id==='crew-auto-config'?'1':'0'});return;}
  if(id.startsWith('lens-')){ctx.switchThread('query');invoke(ctx,'lens-open');invoke(ctx,'lens-mode',{value:id==='lens-focus'?'focus':'subcompact'});return;}
  if(id.startsWith('plan-')){invoke(ctx,'pd-info',{id:id==='plan-index'?'ap-index':'ap-auth',planId:id==='plan-index'?'ap-index':'ap-auth'});return;}
  if(id.startsWith('record-')){
   if(id==='record-note'){
    const t=ctx.state.threads.find(t=>t.messages.some(m=>m.type==='agent-work'&&window.PM56_RECORDS.reference(m).kind==='note'));
    if(t){ctx.switchThread(t.id);const m=t.messages.find(m=>m.type==='agent-work'&&window.PM56_RECORDS.reference(m).kind==='note');invoke(E.ctx(),'open-work-record',{id:m.id});}
   }else{ctx.switchThread('route');invoke(E.ctx(),'open-work-record',{id:id==='record-provider'?'route-04':'route-12'});}
   return;
  }
  if(id.startsWith('activity-')){ctx.switchThread('query');ctx.state.activity.pinned=true;ctx.state.hover={type:'activity',domain:id==='activity-todo'?'todo':'changes'};ctx.renderApp();return;}
  if(id.startsWith('work-')){window.PM56_DEMO.setVariant(2,id==='work-simple'?8:1);window.PM56_DEMO.trigger('Start complete work');requestAnimationFrame(()=>document.querySelector('.working-card')?.scrollIntoView({block:'center'}));}
 }
 E.action('repair-demo',(ctx,btn)=>{launch(ctx,btn.dataset.scenario);return true;});
 window.PM56_REPAIR_DEMOS={list:()=>scenarios.map(([id,feature,label,expected])=>({id,feature,label,expected})),launch:id=>launch(E.ctx(),id),gallery:ctx=>'<section class="demo-section polish-demo-section"><h3>Assistant refinements</h3><div class="demo-section-body">'+scenarios.map(([id,feature,label,expected])=>'<button class="demo-trigger" data-action="repair-demo" data-scenario="'+id+'" title="'+ctx.esc(expected)+'"><small>'+ctx.esc(feature)+'</small><strong>'+ctx.esc(label)+'</strong></button>').join('')+'</div></section>'};
})();
