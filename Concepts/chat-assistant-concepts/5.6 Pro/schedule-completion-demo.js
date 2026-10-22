/* Batch 18 continuation gallery. Inputs/clock controls are explicitly local
 * examples; all operational state remains with Scheduling, Collaboration,
 * Plan, To-Do, Composer and Artifact owners. No paid/provider execution.
 * Playback (2026-10-22, Jared: recorded examples play on their own after Start): all three play from Start through
 * PM56_RECPLAY, paced to read. The Crew example is Batch 18's windows example with A Crew under Who builds it
 * (PM56_B18.startCrew); it waits where committing the window approves the build. The discussion example starts with the
 * Chat Room's own setup sheet (its Start is yours, as every recorded room's is); then the room's card Message, the text
 * typed, the wand's Schedule Message, Pause and Resume on the card, and Open Panel are pressed on the product's own
 * controls, while the demo clock reaching the time is narrated. The folder example plays choosing a folder with the
 * labelled sample folder (a real folder needs your own file picker), schedules it, and narrates the world's part: the
 * folder changing on disk, one retained file going missing and coming back. The guide narrates; its only buttons are
 * Replay and Close, and the demo controls stay in a folded "Try it yourself" once it has ended. */
(function(){
'use strict';const E=PM56_EXT,S=PM56_SCHED,C=PM56_COLLAB,AT=PM56_ATTACHMENTS,CS=PM56_COMPOSER_STATE,A=PM56_ARTIFACTS,RP=PM56_RECPLAY;
const sessions=new Map(),clone=x=>JSON.parse(JSON.stringify(x));let serial=0;
const get=()=>sessions.get(E.ctx()?.thread.id),message=r=>S.list().messages.filter(m=>m.thread_id===r?.threadId&&!(r.known||[]).includes(m.scheduled_dispatch_id)).at(-1),room=r=>C.runsForThread(r?.threadId).find(x=>PM56_ROOM.owns(x.id));
const act=(name,data={})=>E.run(name,{dataset:data},new Event('click'));
function selected(version=1){const values=[['notes.txt',version===1?'# Snapshot note\r\nOriginal V1 — keep this line.\r\n<script>not executed<\/script>\r\n':'REPLACED V2 must not be used\n'],['data/numbers.bin',new Uint8Array(version===1?[0,1,2,13,10,127,128,254,255]:[99])],['empty.txt','']];return values.map(([path,bytes])=>{const f=new File([bytes],path.split('/').at(-1),{type:path.endsWith('.txt')?'text/plain':'application/octet-stream'});Object.defineProperty(f,'webkitRelativePath',{value:'Sample/'+path});return f;});}
function start(flow){
 if(flow==='crew'){PM56_B18.start('windows');PM56_B18.setInstruction('Send the prepared request. Open the Plan, then More, then Build At, and choose A Crew under Who builds it. Set up and schedule the Crew before evaluating the local clock.','Frozen Crew across two windows');return;}
 if(!['folder','room'].includes(flow))return;
 let ctx=E.ctx(),t;
 if(flow==='room'){
  PM56_ROOM_DEMOS.start('discussion');act('room-demo-close');ctx=E.ctx();t=ctx.thread;
 }else{
  const id='b18c-folder-'+(++serial);t=clone(ctx.state.threads.find(t=>t.id==='query'));Object.assign(t,{id,title:'Keep a folder unchanged',projectId:id,worktreeId:id,messages:[],archived:false,pinned:false,goalId:null,status:'ready'});ctx.state.threads.push(t);
  Object.assign(ctx.state,{historyMode:'closed',menu:null,dialog:null,hover:null,editorTabs:[],activeEditor:null,editorRevealed:false,demoOpen:false});ctx.state.activity.open=false;ctx.switchThread(id);ctx=E.ctx();ctx.state.composer='Read the exact folder snapshot, preserving the original bytes and member paths.';CS.bufferFor(id).text=ctx.state.composer;CS.bufferFor(id).attachments=[];CS.bufferFor(id).destination=null;PM56_RUNTIME.composer.destination=null;
  S.registerMessageReceiver(id,(msg,receipt)=>{
   const ref=msg.attachments[0]?.snapshot_ref;if(!ref)return;const result=AT.inspectScheduleSnapshot(ref);if(!result.ok)return;
   const reportRef={artifact_id:receipt.message_id+':readback',artifact_version:1,project_id:id,thread_id:id};
   const published=A.publish({...reportRef,title:'Exact retained input readback',renderer_kind:'json',payload:{source_ref:ref,...result,scheduled_message_id:receipt.schedule_id,message_id:msg.id,local_readback:true}});
   if(published.ok)E.ctx().appendMessage({id:receipt.message_id+':readback',role:'assistant',type:'text',body:'Read the exact retained snapshot: '+result.bytes+' bytes'+(result.count?' across '+result.count+' files':'')+'. This is a local integrity readback, not an AI response.',time:receipt.at},t);
  });
 }
 /* only the schedules made after this Start (schedules outlive a reload; example thread ids start again at 1) */
 const r={flow,threadId:t.id,note:null,ticket:null,sourceId:null,sourceVersion:1,missing:false,known:S.list().messages.map(m=>m.scheduled_dispatch_id)};sessions.set(t.id,r);PM56_RUNTIME.quota.waiting=false;ctx.renderApp();
}
function button(action,label,attrs=''){return '<button type="button" class="text-button" data-action="'+action+'" '+attrs+'>'+label+'</button>';}
function openRef(ref,label){return button('open-artifact',label,'data-version="'+ref.artifact_version+'" data-ref="'+encodeURIComponent(JSON.stringify(ref))+'"');}
/* the recording (PM56_RECPLAY): next() names the next beat from the example's own state */
const PACE={first:1400,msg:3200,type:2000,wand:3600,step:1300,field:1100,create:2000,done:4200,world:5200,clock:4600,pause:4200,panel:4400,hover:1800};
const ROOM_TEXT='Keep the visible Search button; review the optional shortcut.';
const day=()=>new Date(Date.now()+86400000).toISOString().slice(0,10);
const sheet=t=>E.ctx().state.dialog?.type===t,covered=()=>innerWidth<=1100&&E.ctx().state.editorRevealed;
const run1=name=>{const b=document.createElement('button');E.run(name,b,new Event('click'));return true;};
const toChat=id=>({id:'chat:'+id,wait:PACE.step,run:()=>RP.press('[data-action="return-to-chat"]')});
/* your part on the wand: Scheduling, Schedule Message, tomorrow at 9:00, Schedule, then Done */
function scheduleBeats(r,key){
 if(sheet('sched-message')){const m=message(r);if(m)return {id:key+':done',dialog:true,wait:PACE.done,run:()=>RP.press('#pmOverlayRoot [data-action="sched-close-dialog"]')};
  const f=document.querySelector('[data-sched-input="msg-date"]'),t=document.querySelector('[data-sched-input="msg-time"]');
  if(f&&f.value!==day())return {id:key+':date',dialog:true,wait:PACE.wand,run:()=>RP.choose('[data-sched-input="msg-date"]',day())};
  if(t&&t.value!=='09:00')return {id:key+':time',dialog:true,wait:PACE.field,run:()=>RP.choose('[data-sched-input="msg-time"]','09:00')};
  return {id:key+':create',dialog:true,wait:PACE.create,run:()=>RP.press('#pmOverlayRoot [data-action="sched-create-message"]')};}
 if(covered())return toChat(key);
 return RP.viaWand(key,'schedule','[data-action="sched-open-message"]',{wait:PACE.wand,step:PACE.step});}
/* a room takes a scheduled message only between its rounds (the product refuses one mid-round): the recording lets the
   room talk its rounds through first, then plays your part */
const talking=t=>!r_waits(t)&&t.status==='running';
const r_waits=t=>!!(window.PM56_ROOM&&window.PM56_ROOM.waitsFor&&window.PM56_ROOM.waitsFor(t));
function nextRoom(r){const target=room(r),m=message(r);if(!target)return null; /* the setup sheet's Start is yours */
 const card='.transcript [data-run-id="'+CSS.escape(target.id)+'"] ';
 if(!m&&!sheet('sched-message')&&talking(target))return null;
 if(!m||sheet('sched-message')){
  if(!sheet('sched-message')&&!m){const dest=PM56_RUNTIME.composer.destination,box=RP.find(RP.COMPOSER);
   if(!dest||dest.refId!==target.id)return {id:'room-message',wait:PACE.first+PACE.msg,run:()=>RP.press(card+'[data-action="collab-message"]').then(ok=>ok||(run1('b18c-target-room'),true))};
   if(box&&box.value!==ROOM_TEXT)return {id:'room-type',wait:PACE.type,run:()=>{const f=RP.find(RP.COMPOSER);if(f&&f.value&&f.value!==ROOM_TEXT){f.value='';f.dispatchEvent(new Event('input',{bubbles:true}));}return RP.type(ROOM_TEXT);}};}
  return scheduleBeats(r,'room-sched');}
 if(m.state==='sent')return r.panel||innerWidth<=1100?null:{id:'room-panel',wait:PACE.panel,run:()=>RP.press(card+'[data-action="collab-open-panel"]').then(ok=>{if(ok)r.panel=true;return ok;})};
 return r.dueRun?null:{id:'room-due',wait:PACE.clock,run:()=>{run1('b18c-message-due');r.dueRun=true;return true;}};}
function nextFolder(r){const m=message(r),buf=CS.bufferFor(r.threadId);
 if(!m&&!sheet('sched-message')&&!(buf.attachments||[]).length){if(covered())return toChat('f0');
  return {id:'folder-choose',wait:PACE.first,run:()=>RP.hover('.composer [data-action="attach"]').then(()=>RP.wait(PACE.hover)).then(()=>{run1('b18c-sample-folder');RP.rest();return true;})};}
 if(!m||sheet('sched-message'))return scheduleBeats(r,'folder-sched');
 if(m.state==='sent')return null;
 if(r.sourceVersion!==2&&r.sourceId)return {id:'folder-v2',wait:PACE.world,run:()=>run1('b18c-replace-source')};
 if(!r.missing&&!r.heldSeen)return {id:'folder-missing',wait:PACE.world,run:()=>run1('b18c-toggle-member')};
 if(r.missing&&m.state!=='held')return {id:'folder-due-1',wait:PACE.clock,run:()=>{run1('b18c-message-due');r.heldSeen=true;return true;}};
 if(r.missing)return {id:'folder-restore',wait:PACE.world,run:()=>run1('b18c-toggle-member')};
 return {id:'folder-due-2',wait:PACE.clock,run:()=>run1('b18c-message-due')};}
const players=new Map();
function playback(r){const old=players.get(r.threadId);if(old)old.stop();const pl=RP.play({key:'b18c-demo',live:()=>sessions.get(r.threadId)===r&&!r.closed,threads:()=>[r.threadId],next:()=>r.flow==='room'?nextRoom(r):nextFolder(r),
 render:()=>{const c=E.ctx();c.renderApp();if(c.state.dialog)c.renderOverlays();},superseded:()=>{}});players.set(r.threadId,pl);}
function say(ctx,r){const m=message(r),target=room(r),pl=players.get(r.threadId);
 if(pl&&pl.errors.length)return {text:'This step couldn’t run, so the recording stopped here. Replay starts it again.',done:true};
 if(r.flow==='folder'){const buf=CS.bufferFor(r.threadId);
  if(!m&&!(buf.attachments||[]).length)return {text:'A message to read a folder is ready. Next: you choose a folder; this example uses a labelled sample folder.'};
  if(!m)return {text:sheet('sched-message')?'Schedule Message keeps every selected file’s exact bytes. Next: tomorrow at 9:00, then Schedule.':'Three sample files are selected: notes.txt, numbers.bin and an empty file. Next: you schedule the message from the wand.'};
  if(sheet('sched-message'))return {text:'Scheduled: the folder’s exact bytes are retained. Next: Done.'};
  if(m.state==='sent')return {text:'Done · Delivered at its time with the exact original folder: every byte, three files, read back below. Held while one file was missing; the newer folder was never used.',done:true};
  if(r.sourceVersion!==2&&r.sourceId)return {text:'Scheduled for tomorrow at 9:00 with all three files kept. Next: the folder changes on disk before then.'};
  if(!r.missing&&!r.heldSeen)return {text:'The folder on disk changed; the scheduled message still holds its own copy. Next: one retained file goes missing.'};
  if(r.missing&&m.state!=='held')return {text:'One retained file is missing now. Next: the clock reaches 9:00 tomorrow.'};
  if(r.missing)return {text:'Held: one file is missing, so the whole message waits. Nothing newer was substituted. Next: the file comes back.'};
  return {text:'The same file is back. Next: the held message is delivered again.'};}
 if(!target)return {text:'Start the Chat Room on its setup sheet; the example plays from there.'};
 if(!m&&!sheet('sched-message')&&talking(target))return {text:'Round 1: the room talks it through. This room waits for you between rounds (its setup sheet says so), and a room takes a scheduled message between rounds. Next: once round 1 is done, you message it for later.'};
 if(!m&&!sheet('sched-message')){const dest=PM56_RUNTIME.composer.destination;
  if(!dest||dest.refId!==target.id)return {text:'Round 1 is done and the room waits between rounds. Next: you message the room from its card, to schedule something for later.'};
  const box=RP.find(RP.COMPOSER);
  return {text:box&&box.value===ROOM_TEXT?'The message box writes to the room, with the message ready. Next: you schedule it from the wand: Scheduling, then Schedule Message.':'The message box now writes to the room. Next: you type the message, then schedule it from the wand.'};}
 if(!m)return {text:'Schedule Message freezes this message for this exact room. Next: tomorrow at 9:00, then Schedule.'};
 if(sheet('sched-message'))return {text:'Scheduled for the room. Next: Done.'};
 if(m.state==='sent'&&!r.panel&&innerWidth>1100)return {text:'Delivered at its time: the same message is now in this chat and in the room’s own discussion. Next: you open the room’s panel to see it there.'};
 if(m.state==='sent')return {text:'Done · One scheduled message, in two places: this chat and the room’s discussion, ready for its next round. It went to this exact room and nowhere else.',done:true};
 if(m.state==='held')return {text:'Held: the room can’t take it right now, so the message waits instead of going anywhere else.',done:true};
 return {text:'Scheduled for this room, tomorrow at 9:00. Next: the clock reaches 9:00.'};}
function guide(ctx){const r=get();if(!r||r.closed||ctx.state.dialog)return '';const m=message(r),target=room(r),ref=m?.attachment_refs[0]?.snapshot_ref;
 let controls='';
 if(r.flow==='folder'){
  if(!m)controls=button('att-upload-folder','Choose a folder')+button('b18c-sample-folder','Load sample folder (fixture)');
  else controls=button('b18c-replace-source','Replace sample source with V2',r.sourceId?'':'disabled title="Only the sample fixture can be replaced here"')+button('b18c-toggle-member',r.missing?'Restore retained member':'Disconnect retained member')+openRef(ref,'Open retained snapshot');
 }else if(target)controls=button('b18c-target-room','Message this room')+button('b18c-target-participant','Message first participant')+button('collab-open-panel','Open discussion','data-run="'+ctx.esc(target.id)+'"');
 if(m)controls+=button('b18c-message-due','Evaluate scheduled time')+button('b18c-message-repeat','Replay delivery');
 const s=say(ctx,r),text=RP.steady(r,s.text,!!s.done,()=>E.ctx().renderApp()),pl=players.get(r.threadId),end=s.done&&text===s.text;
 /* the one pmx guide look (G-25); the demo controls only once the recording has ended, folded */
 return PM56_SHELL.pmxGuide({key:'b18c-guide',cls:'b18c-guide',attrs:'data-b18c-flow="'+ctx.esc(r.flow)+'"',placement:'dock',caption:'Recorded example · no AI cost',step:ctx.esc(text),
  extra:(r.note?'<p class="b18-decision" role="status">'+ctx.esc(r.note)+'</p>':'')+(end?'<details class="b18-clock b18c-try"><summary>'+PM56_SHELL.pmxGlyph('chevron-down',13)+'<span>Try it yourself: demo clock and controls</span></summary><div class="b18c-controls">'+controls+'</div></details>':''),
  actions:end?[{action:'b18c-replay',label:'Replay'}]:[],next:pl?pl.progress():null,close:{action:'b18c-close',label:'Close the example'}});
}
E.action('b18c-replay',ctx=>{const r=get();if(r){r.closed=true;const pl=players.get(r.threadId);if(pl)pl.stop();begin(r.flow);}return true;});
E.action('b18c-close',ctx=>{const r=get();if(r){r.closed=true;const pl=players.get(r.threadId);if(pl)pl.stop();}ctx.renderApp();return true;});
E.chainAction('reset-all',()=>{for(const pl of players.values())pl.stop();players.clear();return false;});
/* a Start from Demo Studio plays the example; PM56_B18C.start() (tests, other examples) never starts a recording */
function begin(flow){if(flow==='crew'){window.PM56_B18.startCrew();return;}start(flow);
 /* the recorded room waits between rounds (its sheet shows Pause between rounds on), so it can take the scheduled message */
 if(flow==='room'){const d=C.draft&&C.draft();if(d&&d.config){d.config.pauseBetweenRounds=true;E.ctx().renderOverlays();}}
 const r=get();if(r)playback(r);}
E.slot('composerBelow',guide);
function note(r,out){r.note=out.ok?out.duplicate?'Original message returned; nothing was delivered twice.':'Exact scheduled message delivered through its owner.':out.detail||out.error||'Unavailable';E.ctx().renderApp();}
E.action('b18c-start',(c,b)=>{begin(b.dataset.flow);return true;});
E.action('b18c-sample-folder',ctx=>{const r=get();if(!r||r.flow!=='folder'||message(r))return;const buf=CS.bufferFor(r.threadId);if(buf.attachments.length){r.note='Remove the current selection before loading a sample; existing attachments were preserved.';ctx.renderApp();return;}
 const out=AT.admitFolder(r.threadId,selected());if(out.ok){r.sourceId=out.attachment.id;r.note='Three locally generated sample Files selected. They are fixtures, not files read from your device.';}else r.note=out.error;ctx.renderApp();});
E.action('b18c-replace-source',ctx=>{const r=get(),source=r?.sourceId&&AT.findAttachment(ctx,r.threadId,null,r.sourceId);if(!source?._files)return;source._files=selected(2);r.sourceVersion=2;r.note='The sample selection now supplies V2 bytes. Its previously retained V1 snapshot is unchanged.';ctx.renderApp();});
E.action('b18c-toggle-member',ctx=>{const r=get(),m=message(r),ref=m?.attachment_refs[0]?.snapshot_ref;if(!ref)return;const root=A.resolve(ref);if(!root.ok){r.note=root.error;ctx.renderApp();return;}
 const member=root.revision.record.payload?.files?.[0]?.ref||ref,record=PM56_DATA.artifacts.find(x=>x.id===member.artifact_id);if(!record)return;r.missing=!r.missing;record.revisionAvailability={...(record.revisionAvailability||{}),[member.artifact_version]:r.missing?'missing':'available'};r.note=r.missing?'One exact retained member is unavailable. The whole message must hold.':'The exact retained member is available again; no newer bytes were substituted.';ctx.renderApp();});
E.action('b18c-message-due',ctx=>{const r=get(),m=message(r);if(!m)return;const decision=S.messageTicket(m.scheduled_dispatch_id,Date.parse(m.scheduled_at_utc));r.ticket=decision.ticket;note(r,S.deliverMessage(decision.ticket));});
E.action('b18c-message-repeat',ctx=>{const r=get();if(r?.ticket)note(r,S.deliverMessage(r.ticket));});
for(const [name,direct] of [['b18c-target-room',false],['b18c-target-participant',true]])E.action(name,ctx=>{const r=get(),target=room(r);if(!target)return;act('collab-message',{run:target.id,...(direct?{participant:target.participants[0].id}:{})});if(!ctx.state.composer){ctx.state.composer='Please retain this scheduled question in the same discussion.';CS.bufferFor(r.threadId).text=ctx.state.composer;}ctx.renderApp();});
const g=PM56_REPAIR_DEMOS,prior=g.gallery;g.gallery=ctx=>'<section class="demo-section"><h3>Batch 18 · Crew, discussions and selected files</h3><div class="demo-section-body">'+[['crew','Schedule a frozen Crew','Configure once, admit atomically, resume the same attributed work.'],['room','Send to the same discussion','One exact scheduled message, two transcript views, no fallback.'],['folder','Keep a folder unchanged','Retain all selected bytes; a missing member holds the whole message.']].map(([id,title,detail])=>'<button class="demo-trigger" data-action="b18c-start" data-flow="'+id+'"><strong>'+title+'</strong><small>'+detail+'</small></button>').join('')+'</div></section>'+prior(ctx);
window.PM56_B18C={start,snapshot:()=>{const r=get();return r?{...clone(r),message:message(r)?clone(message(r)):null,roomId:room(r)?.id||null}:null;}};
})();
