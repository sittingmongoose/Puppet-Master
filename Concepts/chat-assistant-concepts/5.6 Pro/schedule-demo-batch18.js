/* Batch18 gallery adapters. Local fixtures/clock observations only; all schedule,
 * Plan, To-Do and artifact mutations go through their existing owners.
 * Playback (2026-10-22, Jared: recorded examples play on their own after Start): both examples play from Start through
 * PM56_RECPLAY, paced to read. Your part is pressed on the product's own controls, lit first (the wand, Scheduling,
 * Schedule Message, the date and time, Schedule, Done; Send, the plan, More, Build At…, the window's times, Done). The
 * world's part is narrated as it happens: the attached V1 opened to read, the source publishing V2, the retained V1 going
 * missing and coming back, and the demo clock reaching the scheduled time or a window's boundaries. The windows example
 * waits where the product waits for you: committing the window approves the plan's build. The guide narrates; its only
 * buttons are Replay and Close, and the demo clock and controls stay in a folded "Try it yourself" once it has ended.
 * PM56_B18.start() (Batch 18's crew example builds on it) never starts a recording. */
(function(){
'use strict';
const E=PM56_EXT,S=PM56_SCHED,C=PM56_COMPOSER_STATE,A=PM56_ARTIFACTS,P=PM56_PLANS,R=PM56_RUNTIME,RP=PM56_RECPLAY;
const sessions=new Map();let sequence=0;
const clone=x=>JSON.parse(JSON.stringify(x));
function current(){return sessions.get(E.ctx()?.thread.id);}
/* schedules outlive a reload (session storage) while example thread ids start again at 1, so an example only sees the
   schedules made after its own Start (r.known: the ids that existed then) */
function record(r){if(!r)return null;return S.list().messages.filter(m=>m.thread_id===r.threadId&&!(r.known||[]).includes(m.scheduled_dispatch_id)).at(-1);}
function build(r){if(!r)return null;return S.list().builds.find(b=>b.thread_id===r.threadId&&b.binding_kind==='plan_content_v1'&&!(r.known||[]).includes(b.schedule_id));}
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
 r.known=S.list().messages.map(m=>m.scheduled_dispatch_id).concat(S.list().builds.map(b=>b.schedule_id));
 sessions.set(t.id,r);R.quota.waiting=false;ctx.renderApp();
}
const PHASE_WORDS={idle:'Waiting',admitted:'Running',winding_down:'Wrapping up',paused_safe:'Paused at a safe point',completed:'Finished'};
function button(action,label,extra=''){return '<button type="button" class="text-button" data-action="'+action+'" '+extra+'>'+label+'</button>';}
function artifactButton(ref,label){return button('open-artifact',label,'data-version="'+ref.artifact_version+'" data-ref="'+encodeURIComponent(JSON.stringify(ref))+'"');}
function controls(ctx,r){
 const m=record(r),b=build(r);let html='';
 if(r.flow==='messages')html=artifactButton(source(r),'Inspect supplied V1')+button('b18-source-v2',r.publishedV2?'V2 published':'Publish newer V2',r.publishedV2?'disabled':'')+
   (m?button('b18-message-due','Evaluate scheduled time')+button('b18-message-repeat','Replay delivery')+button('b18-toggle-input',r.missing?'Restore retained V1':'Disconnect retained V1'):'');
 else if(b){const at=b.clock_ms??Date.parse(b.next_occurrence_at||b.scheduled_at_utc),w=S.buildWindow(b,at);
   html=button('b18-window-open','Evaluate window opening')+button('b18-window-wind','Move to wind-down')+button('b18-window-close','Move to pause time')+button('b18-window-next','Next eligible window')+
     button('b18-quota','Simulate Usage '+(R.quota.waiting?'available':'unavailable'))+button('b18-consent','Allow Usage resume for this run')+
     button('b18-plan','Open Plan');
   html+='<div class="b18-clock-state"><span>Demo clock: '+ctx.esc(PM56_SHELL.pmxTime.at(at,b.timezone))+'</span><span>'+ctx.esc(b.held_reason||PHASE_WORDS[b.runPhase]||'Waiting')+'</span></div>';
 }
 return html;
}
/* the recording (PM56_RECPLAY): next() names the next beat from the example's own state */
const PACE={first:1200,wand:4200,step:1300,field:1100,create:2000,done:4400,world:5200,clock:4600,send:1500,open:3600,more:2600,wind:5200,close:3600,next:4200};
const act=name=>{const b=document.createElement('button');E.run(name,b,new Event('click'));return true;};
const sheet=t=>E.ctx().state.dialog?.type===t,covered=()=>innerWidth<=1100&&E.ctx().state.editorRevealed;
const day=()=>new Date(Date.now()+86400000).toISOString().slice(0,10);
const toChat=id=>({id:'chat:'+id,wait:PACE.step,run:()=>RP.press('[data-action="return-to-chat"]')});
function nextMessages(r){const m=record(r);
 if(!r.inspected)return {id:'inspect',wait:PACE.first,run:()=>{const b=document.createElement('button');b.dataset.version='1';b.dataset.ref=encodeURIComponent(JSON.stringify(source(r)));E.run('open-artifact',b,new Event('click'));r.inspected=true;E.ctx().renderApp();return true;}};
 if(!m){
  if(sheet('sched-message')){const f=document.querySelector('[data-sched-input="msg-date"]'),t=document.querySelector('[data-sched-input="msg-time"]');
   if(f&&f.value!==day())return {id:'msg-date',dialog:true,wait:PACE.wand,run:()=>RP.choose('[data-sched-input="msg-date"]',day())};
   if(t&&t.value!=='09:00')return {id:'msg-time',dialog:true,wait:PACE.field,run:()=>RP.choose('[data-sched-input="msg-time"]','09:00')};
   return {id:'msg-create',dialog:true,wait:PACE.create,run:()=>RP.press('#pmOverlayRoot [data-action="sched-create-message"]')};}
  if(covered())return toChat('m0');
  return RP.viaWand('b18msg','schedule','[data-action="sched-open-message"]',{wait:PACE.wand,step:PACE.step});}
 if(sheet('sched-message'))return {id:'msg-done',dialog:true,wait:PACE.done,run:()=>RP.press('#pmOverlayRoot [data-action="sched-close-dialog"]')};
 if(!r.publishedV2)return {id:'v2',wait:PACE.world,run:()=>act('b18-source-v2')};
 if(m.state==='sent'||(r.outputs||[]).length)return null;
 if(!r.missing&&!r.heldSeen)return {id:'disconnect',wait:PACE.world,run:()=>act('b18-toggle-input')};
 if(r.missing&&m.state!=='held')return {id:'due-1',wait:PACE.clock,run:()=>{act('b18-message-due');r.heldSeen=true;return true;}};
 if(r.missing)return {id:'restore',wait:PACE.world,run:()=>act('b18-toggle-input')};
 return {id:'due-2',wait:PACE.clock,run:()=>act('b18-message-due')};}
function nextWindows(r){const w=PM56_B17_WORK.snapshot(),pid=w&&w.planId,b=build(r);
 if(!pid){if(covered())return toChat('w0');return {id:'send',wait:PACE.first,run:()=>RP.press('.composer [data-action="send"]')};}
 if(!b){
  /* the Crew example: Who builds it, A Crew, then Set up the Crew in its own sheet (nothing starts), then the window */
  if(r.crew&&E.ctx().state.dialog&&!sheet('sched-build-at')){
   const nm=document.querySelector('#pmOverlayRoot input[data-collab-input="name"]');
   if(nm&&nm.value!==CREW_NAME)return {id:'crew-name',dialog:true,wait:PACE.wand,run:()=>RP.type(CREW_NAME,{into:'#pmOverlayRoot input[data-collab-input="name"]',cps:30})};
   if(nm)return {id:'crew-use',dialog:true,wait:PACE.create,run:()=>RP.press('#pmOverlayRoot [data-action="collab-modal-commit"]')};
   return null;}
  if(r.crew&&sheet('sched-build-at')&&!crewSet()){
   const conf=RP.find('#pmOverlayRoot [data-action="sched-configure-crew"]');
   if(conf)return {id:'crew-setup',dialog:true,wait:PACE.more,run:()=>RP.press(conf)};
   if(RP.find('.overlay-menu [data-action="shared-choice-pick"][data-value="crew"]'))return {id:'crew-pick',dialog:true,menu:true,wait:PACE.step,run:()=>RP.press('.overlay-menu [data-action="shared-choice-pick"][data-value="crew"]')};
   return {id:'crew-who',dialog:true,wait:PACE.wand,run:()=>RP.press('#pmOverlayRoot [data-action="sched-pick-build-topology"]')};}
  if(sheet('sched-build-at')){const st=document.querySelector('[data-sched-input="build-start"]'),pa=document.querySelector('[data-sched-input="build-pause"]');
   if(st&&st.value!=='22:00')return {id:'build-start',dialog:true,wait:PACE.wand,run:()=>RP.choose('[data-sched-input="build-start"]','22:00')};
   if(pa&&pa.value!=='23:00')return {id:'build-pause',dialog:true,wait:PACE.field,run:()=>RP.choose('[data-sched-input="build-pause"]','23:00')};
   return null; /* committing the window approves the build: yours */}
  const at='[data-action="pd-build-at"][data-id="'+CSS.escape(pid)+'"]';
  if(RP.find(at))return {id:'build-at',wait:PACE.step,run:()=>RP.press(at)};
  const more='.editor-body [data-action="pd-more-actions"][data-id="'+CSS.escape(pid)+'"]';
  if(RP.find(more))return {id:'more',wait:PACE.more,run:()=>RP.press(more)};
  return {id:'open-plan',wait:PACE.open,run:()=>RP.press('[data-action="pd-info"][data-id="'+CSS.escape(pid)+'"], [data-action="pd-expand"][data-id="'+CSS.escape(pid)+'"]')};}
 if(sheet('sched-build-at'))return {id:'build-done',dialog:true,wait:PACE.done,run:()=>RP.press('#pmOverlayRoot [data-action="sched-close-dialog"]')};
 const p=P.get(pid);if(!p||p.status==='completed')return null;
 if(!b.plan_run_id)return {id:'open-window',wait:PACE.clock,run:()=>act('b18-window-open')};
 if(!w.outputs?.normalize&&!r.wound)return null; /* the first output is being worked out */
 if(!r.wound)return {id:'wind',wait:PACE.wind,run:()=>{act('b18-window-wind');r.wound=true;return true;}};
 if(!r.closedAt)return {id:'close',wait:PACE.close,run:()=>{act('b18-window-close');r.closedAt=1;return true;}};
 if(!r.resumed)return {id:'next',wait:PACE.next,run:()=>{act('b18-window-next');r.resumed=true;return true;}};
 return null;}
const CREW_NAME='Retained three-role Crew';
/* the Crew is set up once Build At offers "Change the Crew…" in place of "Set up the Crew…" */
const crewSet=()=>[...document.querySelectorAll('#pmOverlayRoot [data-action="sched-configure-crew"]')].some(b=>/Change/.test(b.textContent));
const players=new Map();
function playback(r){const old=players.get(r.threadId);if(old)old.stop();const pl=RP.play({key:'b18-demo',live:()=>sessions.get(r.threadId)===r&&!r.closed,threads:()=>[r.threadId],next:()=>r.flow==='messages'?nextMessages(r):nextWindows(r),render:()=>{const c=E.ctx();c.renderApp();if(c.state.dialog)c.renderOverlays();},superseded:()=>{}});players.set(r.threadId,pl);}
function say(ctx,r){const m=record(r),b=build(r),pl=players.get(r.threadId);
 if(pl&&pl.errors.length)return {text:'This step couldn’t run, so the recording stopped here. Replay starts it again.',done:true};
 if(r.flow==='messages'){
  if(!r.inspected)return {text:'A message is ready in the message box, with values.json V1 attached. Next: you look at what V1 holds.'};
  if(!m)return {text:sheet('sched-message')?'Schedule Message freezes this exact text and V1. Next: tomorrow at 9:00, then Schedule.':'V1 holds 3, 7 and 11. Next: you schedule the message from the wand: Scheduling, then Schedule Message.'};
  if(sheet('sched-message'))return {text:'Scheduled: the exact text and V1 are frozen. Next: Done.'};
  if(!r.publishedV2)return {text:'Scheduled for tomorrow at 9:00 with V1. Next: the source publishes a newer V2 before then.'};
  if(m.state==='sent'||(r.outputs||[]).length)return {text:'Done · Sent at its time with the exact V1 it froze: the sum is 21, not V2’s 999. Held while V1 was missing, never substituted.',done:true};
  if(!r.missing&&!r.heldSeen)return {text:'V2 is published (999). The schedule still points at V1. Next: the retained V1 goes missing.'};
  if(r.missing&&m.state!=='held')return {text:'V1 is missing now. Next: the clock reaches 9:00 tomorrow.'};
  if(r.missing)return {text:'Held: V1 is missing, so nothing was sent, and V2 was not used instead. Next: V1 comes back.'};
  return {text:'The same V1 is back. Next: the held message is delivered again.'};}
 const w=PM56_B17_WORK.snapshot(),p=w&&w.planId&&P.get(w.planId),who=r.crew?'the Crew':'the plan';
 if(!w||!w.planId)return {text:'A plan request is ready in the message box. Next: you send it.'};
 if(r.crew&&!b&&sheet('sched-build-at')&&!crewSet())return {text:document.querySelector('#pmOverlayRoot [data-action="sched-configure-crew"]')?'A Crew builds it. Next: set up the Crew. Nothing starts yet.':'Build At, not Build Now. Next: under Who builds it, choose A Crew.'};
 if(r.crew&&!b&&E.ctx().state.dialog&&!sheet('sched-build-at'))return {text:'Setting up the Crew: its name, then Use this Crew. Nothing starts until the window opens.'};
 if(!b){if(sheet('sched-build-at')){const st=document.querySelector('[data-sched-input="build-start"]'),pa=document.querySelector('[data-sched-input="build-pause"]');
   if(st&&pa&&st.value==='22:00'&&pa.value==='23:00')return {text:'Your move: the window is set, nightly 22:00 to 23:00. Pressing its Schedule approves '+(r.crew?'the Crew’s build of the plan':'the plan’s build')+' in that window; the recording goes on from there.',done:true,yours:true};
   return {text:r.crew?'The Crew is set, and nothing has started. Next: a nightly window from 22:00 to 23:00.':'Build At, not Build Now. Next: a nightly window from 22:00 to 23:00.'};}
  return {text:'The plan is ready. Next: you open it and choose Build At… from its More menu.'};}
 if(sheet('sched-build-at'))return {text:'Scheduled: the plan builds only inside its nightly window. Next: Done.'};
 if(p&&p.status==='completed')return {text:r.crew?'Done · The same Crew finished in the next window. Its first output was kept, and no second Crew or run started.':'Done · The same run finished in the next window. The first window’s completed output was kept, and nothing started over.',done:true};
 if(!b.plan_run_id)return {text:'Nothing runs before the window opens. Next: the clock reaches 22:00.'};
 if(!w.outputs?.normalize&&!r.wound)return {text:r.crew?'22:00: the window opened and admitted one Crew run and its three To-Dos. Its card is in the chat. The first output is being worked out.':'22:00: the window opened and admitted one run with three To-Dos. The first output is being worked out.'};
 if(!r.wound)return {text:'The first output is done. Next: the window winds down at a safe boundary.'};
 if(!r.closedAt)return {text:'Winding down: what is running may finish; nothing new starts. Next: 23:00, the window closes.'};
 if(!r.resumed)return {text:'Paused at a safe point; the completed output is kept. Next: the next night’s window opens.'};
 return {text:'The next window opened and the same run resumed. The rest of the work is running.'};}
function controlsTry(ctx,r){return '<details class="b18-clock" '+(r.clockOpen?'open':'')+'><summary>'+PM56_SHELL.pmxGlyph('chevron-down',13)+'<span>Try it yourself: demo clock and controls</span></summary><div class="b18-controls">'+controls(ctx,r)+'</div></details>';}
E.slot('composerBelow',ctx=>{
 const r=sessions.get(ctx.thread.id);if(!r||r.closed||ctx.state.dialog)return '';
 /* a session another example built on (Batch 18's crew example) keeps its own guide text and its controls */
 if(r.instruction){const title=r.guideTitle||'Recurring execution windows';
  return PM56_SHELL.pmxGuide({key:'b18-guide',cls:'b18-guide',attrs:'data-b18-flow="'+ctx.esc(r.flow)+'"',placement:'dock',caption:'Guided example · '+ctx.esc(title)+' · no AI cost',step:ctx.esc(r.instruction),
   extra:(r.extraHtml?r.extraHtml(ctx,r):'')+(r.last?'<p class="b18-decision" role="status">'+ctx.esc(r.last)+'</p>':''),next:r.player?r.player.progress():null,actions:r.actions||[],close:r.closeAction||null});}
 const s=say(ctx,r),text=RP.steady(r,s.text,!!s.done,()=>E.ctx().renderApp()),pl=players.get(r.threadId),end=s.done&&!s.yours&&text===s.text;
 return PM56_SHELL.pmxGuide({key:'b18-guide',cls:'b18-guide',attrs:'data-b18-flow="'+ctx.esc(r.flow)+'"',placement:'dock',caption:'Recorded example · no AI cost',step:ctx.esc(text),
  extra:(r.last?'<p class="b18-decision" role="status">'+ctx.esc(r.last)+'</p>':'')+(end?controlsTry(ctx,r):''),actions:s.done&&text===s.text?[{action:'b18-replay',label:'Replay'}]:[],next:pl?pl.progress():null,close:{action:'b18-close',label:'Close the example'}});
});
/* inside Build At (its own sheets ask PM56_SCHEDULE_DEMOS.dialogGuide for a guide line): this example's line, after any
   other example's, so the window's Schedule is named plainly as your move */
{const SD=window.PM56_SCHEDULE_DEMOS;if(SD){const prior=SD.dialogGuide;SD.dialogGuide=ctx=>{const own=prior?prior(ctx)||'':'',r=sessions.get(ctx.thread.id);if(!r||r.closed||r.instruction||r.flow!=='windows')return own;
 const s=say(ctx,r),text=RP.steady(r,s.text,!!s.done,()=>E.ctx().renderOverlays()),pl=players.get(r.threadId);
 return own+PM56_SHELL.pmxGuide({key:'b18-sheet-guide',cls:'b18-guide b18-sheet-guide',placement:'sheet',step:ctx.esc(text),next:pl?pl.progress():null});};}}
E.action('b18-replay',ctx=>{const r=current();if(r){r.closed=true;const pl=players.get(r.threadId);if(pl)pl.stop();if(r.crew){window.PM56_B18.startCrew();return true;}start(E.ctx(),r.flow);const n=current();if(n)playback(n);}return true;});
E.action('b18-close',ctx=>{const r=current();if(r){r.closed=true;const pl=players.get(r.threadId);if(pl)pl.stop();}ctx.renderApp();return true;});
E.chainAction('reset-all',()=>{for(const pl of players.values())pl.stop();players.clear();return false;});
E.slot('transcriptMessage',ctx=>{const m=ctx.m||ctx.message;return m?.type==='b18-result'?'<article class="b18-result"><strong>Sum: '+ctx.esc(m.sum)+'</strong><p>Calculated from the exact scheduled attachment. This is a local calculation, not a provider response.</p>'+artifactButton(m.ref,'Inspect result and source identity')+'</article>':'';});
function outcome(r,out){r.last=out.ok?out.duplicate?'Original receipt returned; no duplicate delivery.':out.completed?'The existing run is complete. No new run was started.':out.resumed?'The same unfinished PlanRun resumed.':out.paused?'The original run paused at a safe boundary.':out.winding_down?'Wind-down: the bounded operation may finish, but no new work is admitted.':'Clock evaluated through the shared scheduler.':out.detail||out.error||'Refused';E.ctx().renderApp();}
document.addEventListener('toggle',event=>{const el=event.target;if(el.matches?.('.b18-clock')&&el.isConnected){const r=current();if(r)r.clockOpen=el.open;}},true);
E.action('b18-start',(ctx,b)=>{start(ctx,b.dataset.flow);const r=current();if(r)playback(r);return true;});
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
window.PM56_B18={startCrew:()=>{start(E.ctx(),'windows');const r=current();if(r){r.crew=true;r.title='Schedule a frozen Crew';const t=E.ctx().thread;if(t)t.title='Schedule a frozen Crew';playback(r);E.ctx().renderApp();}return r;},stop:()=>{for(const pl of players.values())pl.stop();},setInstruction:(text,title)=>{const r=current();if(r){r.instruction=text;r.guideTitle=title;E.ctx().renderApp();}},start:flow=>start(E.ctx(),flow),snapshot:()=>{const r=current();return r?{...clone(r),message:record(r)?clone(record(r)):null,build:build(r)?clone(build(r)):null}:null;}};
})();
