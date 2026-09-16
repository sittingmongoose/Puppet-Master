/* Batch18 gallery adapters. Local fixtures/clock observations only; all schedule,
 * Plan, To-Do and artifact mutations go through their existing owners. */
(function(){
'use strict';
const E=PM56_EXT,S=PM56_SCHED,C=PM56_COMPOSER_STATE,A=PM56_ARTIFACTS,P=PM56_PLANS,R=PM56_RUNTIME;
const sessions=new Map();let sequence=0;
const clone=x=>JSON.parse(JSON.stringify(x));
function current(){return sessions.get(E.ctx()?.thread.id);}
function record(r){if(!r)return null;return S.list().messages.filter(m=>m.thread_id===r.threadId).at(-1);}
function build(r){if(!r)return null;return S.list().builds.find(b=>b.thread_id===r.threadId&&b.binding_kind==='plan_content_v1');}
function source(r,version=1){return {artifact_id:r.id+':input',artifact_version:version,project_id:r.projectId,thread_id:r.threadId};}
function publish(r,version){return A.publish({...source(r,version),renderer_kind:'json',title:'Supplied values · V'+version,payload:{values:version===1?[3,7,11]:[999]}});}
function start(ctx,flow){
 if(!['messages','windows'].includes(flow))return;
 let t,r;
 if(flow==='windows'){
   PM56_B17_WORK.start('recovery');const w=PM56_B17_WORK.snapshot();ctx=E.ctx();t=ctx.thread;
   E._actions['b17-reconnect'](ctx,{dataset:{work:w.id}});
   t.title='One build, across two windows';r={id:'b18-window-'+(++sequence),flow,threadId:t.id,projectId:t.projectId,workId:w.id};
 }else{
   const n=++sequence;t=clone(ctx.state.threads.find(t=>t.id==='query'));Object.assign(t,{id:'batch18-message-'+n,title:'Send the version you scheduled',messages:[],projectId:'concept:b18:'+n,worktreeId:'concept:b18:'+n,archived:false,pinned:false,goalId:null,status:'ready'});ctx.state.threads.push(t);
   r={id:t.id,flow,threadId:t.id,projectId:t.projectId,outputs:[],publishedV2:false};
   Object.assign(ctx.state,{historyMode:'closed',menu:null,dialog:null,hover:null,editorTabs:[],activeEditor:null,editorRevealed:false,demoOpen:false});ctx.state.activity.open=false;
   ctx.switchThread(t.id);ctx=E.ctx();ctx.state.mode='Agent';ctx.state.composer='Add the values in the attached V1 document. Keep the scheduled input unchanged.';
   publish(r,1);const b=C.bufferFor(t.id);b.text=ctx.state.composer;b.attachments=[{id:r.id+':attachment',name:'values.json',kind:'file',state:'ready',snapshot_ref:source(r)}];
   R.composer.destination=null;b.destination=null;
   S.registerMessageReceiver(t.id,(message,receipt)=>{
     const exact=A.resolve(message.attachments[0].snapshot_ref),values=exact?.revision?.record.payload.values;
     if(!exact.ok||!Array.isArray(values)||values.some(x=>!Number.isSafeInteger(x)))return;
     const sum=values.reduce((a,b)=>a+b,0),ref={artifact_id:receipt.message_id+':result',artifact_version:1,project_id:r.projectId,thread_id:r.threadId};
     const out=A.publish({...ref,title:'Exact scheduled-input result',renderer_kind:'json',payload:{values,sum,input_ref:message.attachments[0].snapshot_ref,input_hash:message.attachments[0].content_hash,schedule_id:receipt.schedule_id,dispatched_message_id:message.id,local_calculation:true}});
     if(out.ok){r.outputs.push(ref);E.ctx().appendMessage({id:receipt.message_id+':answer',role:'assistant',type:'b18-result',ref,sum},E.ctx().state.threads.find(t=>t.id===r.threadId));}
   });
 }
 sessions.set(t.id,r);R.quota.waiting=false;ctx.renderApp();
}
function button(action,label,extra=''){return '<button class="soft-button" data-action="'+action+'" '+extra+'>'+label+'</button>';}
function artifactButton(ref,label){return button('open-artifact',label,'data-version="'+ref.artifact_version+'" data-ref="'+encodeURIComponent(JSON.stringify(ref))+'"');}
function controls(ctx,r){
 const m=record(r),b=build(r);let html='';
 if(r.flow==='messages')html=artifactButton(source(r),'Inspect supplied V1')+button('b18-source-v2',r.publishedV2?'V2 published':'Publish newer V2',r.publishedV2?'disabled':'')+
   (m?button('b18-message-due','Evaluate scheduled time')+button('b18-message-repeat','Replay delivery')+button('b18-toggle-input',r.missing?'Restore retained V1':'Disconnect retained V1'):'');
 else if(b){const at=b.clock_ms??Date.parse(b.next_occurrence_at||b.scheduled_at_utc),w=S.buildWindow(b,at);
   html=button('b18-window-open','Evaluate window opening')+button('b18-window-wind','Move to wind-down')+button('b18-window-close','Move to pause time')+button('b18-window-next','Next eligible window')+
     button('b18-quota','Simulate Usage '+(R.quota.waiting?'available':'unavailable'))+button('b18-consent','Allow Usage resume for this run')+
     button('b18-plan','Open Plan');
   html+='<div class="b18-clock-state"><span>Clock: '+ctx.esc(new Date(at).toISOString())+'</span><span>'+ctx.esc(b.held_reason||b.runPhase||'Waiting')+'</span></div>';
 }
 return html;
}
E.slot('composerBelow',ctx=>{
 const r=sessions.get(ctx.thread.id);if(!r)return '';const m=record(r),b=build(r);
 const hint=r.flow==='messages'?(!m?'Open the wand → Schedule Message. Nothing is scheduled by this preparation.':'Publish V2, then evaluate the scheduled time. The message still reads V1. Disconnect V1 to try a Held result.'):(!b?'Send the prepared Plan request, then use More → Build At. Do not Build Now.':'Let the first output finish, move to wind-down, then the next window. The original run and completed output must survive.');
 return '<section class="b18-guide" data-b18-flow="'+r.flow+'"><div class="b18-guide-title"><strong>Batch 18 · '+(r.flow==='messages'?'Exact scheduled messages':'Recurring execution windows')+'</strong><small>Explicit local clock · no background service</small></div><p>'+ctx.esc(hint)+'</p><details class="b18-clock" '+(r.clockOpen?'open':'')+'><summary>Local clock &amp; input controls</summary><div class="b18-controls">'+controls(ctx,r)+'</div>'+(r.last?'<p class="b18-decision" role="status">'+ctx.esc(r.last)+'</p>':'')+'</details></section>';
});
E.slot('transcriptMessage',ctx=>{const m=ctx.m||ctx.message;return m?.type==='b18-result'?'<article class="b18-result"><strong>Sum: '+ctx.esc(m.sum)+'</strong><p>Calculated from the exact scheduled attachment. This is a local calculation, not a provider response.</p>'+artifactButton(m.ref,'Inspect result and source identity')+'</article>':'';});
function outcome(r,out){r.last=out.ok?out.duplicate?'Original receipt returned; no duplicate delivery.':out.completed?'The existing run is complete. No new run was started.':out.resumed?'The same unfinished PlanRun resumed.':out.paused?'The original run paused at a safe boundary.':out.winding_down?'Wind-down: the bounded operation may finish, but no new work is admitted.':'Clock evaluated through the shared scheduler.':out.detail||out.error||'Refused';E.ctx().renderApp();}
document.addEventListener('toggle',event=>{const el=event.target;if(el.matches?.('.b18-clock')&&el.isConnected){const r=current();if(r)r.clockOpen=el.open;}},true);
E.action('b18-start',(ctx,b)=>{start(ctx,b.dataset.flow);return true;});
E.action('b18-source-v2',ctx=>{const r=current();if(!r||r.flow!=='messages')return;const out=publish(r,2);if(out.ok)r.publishedV2=true;outcome(r,out);});
E.action('b18-toggle-input',ctx=>{const r=current();if(!r)return;r.missing=!r.missing;const a=PM56_DATA.artifacts.find(a=>a.id===source(r).artifact_id);a.revisionAvailability={1:r.missing?'missing':'available'};r.last=r.missing?'V1 disconnected in this local fixture. No newer revision may replace it.':'The same V1 is available again.';ctx.renderApp();});
E.action('b18-message-due',ctx=>{const r=current(),m=r&&record(r);if(!m)return;const d=S.messageTicket(m.scheduled_dispatch_id,Date.parse(m.scheduled_at_utc));r.ticket=d.ticket;outcome(r,S.deliverMessage(d.ticket));});
E.action('b18-message-repeat',ctx=>{const r=current();if(r?.ticket)outcome(r,S.deliverMessage(r.ticket));});
function tick(ctx,kind){const r=current(),b=r&&build(r);if(!b)return;const at=b.clock_ms??Date.parse(b.next_occurrence_at||b.scheduled_at_utc),w=S.buildWindow(b,at);let next=at;
 if(kind==='wind')next=w.wind_down_at;else if(kind==='close')next=w.end;else if(kind==='next'){const start=PM56_SCHEDULE_TIME.parse('2000-01-01',b.local_start);next=PM56_SCHEDULE_TIME.next(b.timezone,b.days_of_week,start.h,start.mi,(w.end||at)+1);}
 if(!Number.isFinite(next)){outcome(r,{ok:false,error:'No matching boundary at this clock position.'});return;}
 outcome(r,S.windowTick(b.schedule_id,next,S.captureBuild(b.schedule_id)));
}
for(const [action,kind] of [['b18-window-open','open'],['b18-window-wind','wind'],['b18-window-close','close'],['b18-window-next','next']])E.action(action,ctx=>tick(ctx,kind));
E.action('b18-plan',ctx=>{const b=build(current());if(b)P.openDetails(ctx,b.target_id);});
E.action('b18-quota',ctx=>{const r=current(),b=r&&build(r);if(!b)return;R.quota.waiting=!R.quota.waiting;R.quota.resetSource='user supplied';R.quota.resetAt=null;outcome(r,S.windowTick(b.schedule_id,b.clock_ms,S.captureBuild(b.schedule_id)));});
E.action('b18-consent',ctx=>{const r=current(),b=r&&build(r);if(b)outcome(r,S.setPlanQuotaConsent(b.target_id,true));});
const gallery=PM56_REPAIR_DEMOS,prior=gallery.gallery;
gallery.gallery=ctx=>'<section class="demo-section"><h3>Scheduled messages &amp; windows · Batch 18</h3><div class="demo-section-body"><button class="demo-trigger" data-action="b18-start" data-flow="messages"><strong>Send the version you scheduled</strong><small>Freeze a message and V1 attachment. Hold when unavailable; never substitute V2.</small></button><button class="demo-trigger" data-action="b18-start" data-flow="windows"><strong>One build, across two windows</strong><small>Pause real local work at a safe boundary and resume the same run.</small></button></div></section>'+prior(ctx);
window.PM56_B18={start:flow=>start(E.ctx(),flow),snapshot:()=>{const r=current();return r?{...clone(r),message:record(r)?clone(record(r)):null,build:build(r)?clone(build(r)):null}:null;}};
})();
