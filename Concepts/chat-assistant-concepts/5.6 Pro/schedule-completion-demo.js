/* Batch 18 continuation gallery. Inputs/clock controls are explicitly local
 * examples; all operational state remains with Scheduling, Collaboration,
 * Plan, To-Do, Composer and Artifact owners. No paid/provider execution. */
(function(){
'use strict';const E=PM56_EXT,S=PM56_SCHED,C=PM56_COLLAB,AT=PM56_ATTACHMENTS,CS=PM56_COMPOSER_STATE,A=PM56_ARTIFACTS;
const sessions=new Map(),clone=x=>JSON.parse(JSON.stringify(x));let serial=0;
const get=()=>sessions.get(E.ctx()?.thread.id),message=r=>S.list().messages.filter(m=>m.thread_id===r?.threadId).at(-1),room=r=>C.runsForThread(r?.threadId).find(x=>PM56_ROOM.owns(x.id));
const act=(name,data={})=>E.run(name,{dataset:data},new Event('click'));
function selected(version=1){const values=[['notes.txt',version===1?'# Snapshot note\r\nOriginal V1 — keep this line.\r\n<script>not executed<\/script>\r\n':'REPLACED V2 must not be used\n'],['data/numbers.bin',new Uint8Array(version===1?[0,1,2,13,10,127,128,254,255]:[99])],['empty.txt','']];return values.map(([path,bytes])=>{const f=new File([bytes],path.split('/').at(-1),{type:path.endsWith('.txt')?'text/plain':'application/octet-stream'});Object.defineProperty(f,'webkitRelativePath',{value:'Sample/'+path});return f;});}
function start(flow){
 if(flow==='crew'){PM56_B18.start('windows');PM56_B18.setInstruction('Send the prepared request. Open the Plan, then More → Build At → Build with Crew. Configure and schedule the roster before evaluating the local clock.','Frozen Crew across two windows');return;}
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
 const r={flow,threadId:t.id,note:null,ticket:null,sourceId:null,sourceVersion:1,missing:false};sessions.set(t.id,r);PM56_RUNTIME.quota.waiting=false;ctx.renderApp();
}
function button(action,label,attrs=''){return '<button class="soft-button" data-action="'+action+'" '+attrs+'>'+label+'</button>';}
function openRef(ref,label){return button('open-artifact',label,'data-version="'+ref.artifact_version+'" data-ref="'+encodeURIComponent(JSON.stringify(ref))+'"');}
function guide(ctx){const r=get();if(!r)return '';const m=message(r),target=room(r),ref=m?.attachment_refs[0]?.snapshot_ref;
 let controls='',hint='';
 if(r.flow==='folder'){
  hint=!m?'Choose a folder from your device, or load the labelled sample. Open the wand → Schedule Message.':'The schedule retains every selected member. Replace the sample source or disconnect one retained member, then evaluate the local clock.';
  if(!m)controls=button('att-upload-folder','Choose a folder')+button('b18c-sample-folder','Load sample folder (fixture)');
  else controls=button('b18c-replace-source','Replace sample source with V2',r.sourceId?'':'disabled title="Only the sample fixture can be replaced here"')+button('b18c-toggle-member',r.missing?'Restore retained member':'Disconnect retained member')+openRef(ref,'Open retained snapshot');
 }else{
  hint=!target?'Finish the shared Chat Room configuration. Nothing is scheduled yet.':!m?'Message the room or a participant, then use the wand → Schedule Message.':'Deliver at the explicit local time. Open the discussion to see the same message identity; its recorded participants do not make provider calls.';
  if(target)controls=button('b18c-target-room','Message this room')+button('b18c-target-participant','Message first participant')+button('collab-open-panel','Open discussion','data-run="'+ctx.esc(target.id)+'"');
 }
 if(m)controls+=button('b18c-message-due','Evaluate scheduled time')+button('b18c-message-repeat','Replay delivery');
 return '<section class="b18c-guide"><div class="b18-guide-title"><strong>Batch 18 · '+(r.flow==='folder'?'Selected folder snapshots':'Exact collaborative delivery')+'</strong><small>Session-local example · no background timer</small></div><p>'+ctx.esc(hint)+'</p><div class="b18c-controls">'+controls+'</div>'+(r.note?'<p class="b18-decision" role="status">'+ctx.esc(r.note)+'</p>':'')+'</section>';
}
E.slot('composerBelow',guide);
function note(r,out){r.note=out.ok?out.duplicate?'Original message returned; nothing was delivered twice.':'Exact scheduled message delivered through its owner.':out.detail||out.error||'Unavailable';E.ctx().renderApp();}
E.action('b18c-start',(c,b)=>{start(b.dataset.flow);return true;});
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
