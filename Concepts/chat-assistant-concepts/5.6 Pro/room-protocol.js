/* B06 Chat Room concept slice. One CollaborativeRun and one shared message store.
   Recorded participant replies, never live model calls. Discussion is read-only;
   explicit selected-message promotion delegates to the existing Plan/To-Do owner. */
(function(){
 'use strict';
 const E=window.PM56_EXT,C=window.PM56_COLLAB,RT=window.PM56_RUNTIME;
 const clone=x=>JSON.parse(JSON.stringify(x)),fail=error=>({ok:false,error});
 const stable=x=>JSON.stringify(x),hash=x=>{let h=2166136261;for(const ch of stable(x)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return 'concept:'+((h>>>0).toString(16));};
 const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
 const run=id=>C.run(id),owns=id=>!!run(id)?.chatRoom?.protocolVersion;
 const view=new Map(),W=()=>window.PM56_ROOM||{};
 function preflight(d){
  if(!d?.roomInput)return fail('room_input_missing');
  if(d.reconfigureRunId)return fail('completed_example_requires_fresh_run');
  if(d.rows.length!==3||d.wonderer||d.grillMe)return fail('recorded_example_requires_three_core_participants');
  if(!['moderated','ask_everyone_once'].includes(d.config.turnPolicy))return fail('recorded_example_supports_moderated_or_ask_everyone_once');
  if(!Number.isInteger(+d.config.maxRounds)||+d.config.maxRounds<1||+d.config.maxRounds>2)return fail('recorded_example_has_one_or_two_rounds');
  if(!d.roomInput.topic||!Array.isArray(d.roomInput.rounds)||d.roomInput.rounds.length<+d.config.maxRounds)return fail('recorded_rounds_missing');
  return {ok:true};
 }
 function admit(r,d){
  r.chatRoom={protocolVersion:1,roundsSoFar:0,turnPolicy:d.config.turnPolicy,promotions:[],input:freeze(clone(d.roomInput)),
   sourceHash:hash(d.roomInput),definitionRevision:r.definitionRevision,round:null,summary:null,lastUserMessageId:null,pendingRecipientIds:null,deliveries:[],admittedRoster:r.participants.map(p=>({id:p.id,revision:p.assignmentRevision,attemptId:p.attempts.at(-1)?.attempt_id||null})),operationResults:{}};
  r.usage={costUsd:0,inputTokens:0,outputTokens:0};r.participants.forEach(p=>{p.status='waiting';p.current='Ready for discussion';p.outcome=null;});
 }
 function gate(r,x){
  if(!owns(r?.id))return 'room_missing';
  if(!x||x.epoch!==r.stopEpoch)return 'stale_epoch';
  if(x.sourceHash!==r.chatRoom.sourceHash)return 'source_changed';
  if(r.definitionRevision!==r.chatRoom.definitionRevision)return 'definition_changed';
  if(r.status!=='running')return 'room_not_running';
  if(r.chatRoom.admittedRoster.some(a=>{const p=r.participants.find(p=>p.id===a.id);return !p||p.assignmentRevision!==a.revision||(p.attempts.at(-1)?.attempt_id||null)!==a.attemptId||['failed','timed_out','replaced','canceled'].includes(p.outcome);}))return 'participant_assignment_changed';
  return null;
 }
 const envelope=id=>{const r=run(id);return r?{epoch:r.stopEpoch,sourceHash:r.chatRoom.sourceHash}:null;};
 function beginRound(id,x){
  const r=run(id),why=gate(r,x);if(why)return fail(why);const s=r.chatRoom;
  if(s.round&&!s.round.complete)return {ok:true,reused:true,round:s.round.number};
  const max=r.config.turnPolicy==='ask_everyone_once'?1:+r.config.maxRounds;
  if(s.roundsSoFar>=max)return fail('round_limit_reached');
  const addressed=s.pendingRecipientIds||r.participants.map(p=>p.id);s.pendingRecipientIds=null;
  s.round={number:s.roundsSoFar+1,participantIds:addressed.slice(),messages:[],complete:false,replyTo:s.lastUserMessageId};
  s.summary=null;(s.steering||[]).forEach(e=>{if(!e.readBy)e.speaking=null;});
  addressed.forEach(id=>{const p=r.participants.find(p=>p.id===id);p.status='waiting';p.current='Awaiting moderated turn';});
  return {ok:true,round:s.round.number};
 }
 function request(id,pid){const r=run(id),s=r?.chatRoom,p=r?.participants.find(p=>p.id===pid);if(!s?.round||s.round.complete||!p||!s.round.participantIds.includes(pid))return null;
  return {...envelope(id),round:s.round.number,participantId:pid,assignmentRevision:p.assignmentRevision,replyTo:s.round.replyTo,requestId:id+':'+s.round.number+':'+pid,steering:steeringFor(s,pid).map(e=>e.messageId)};}
 function submit(id,x){
  const r=run(id),why=gate(r,x);if(why)return fail(why);const s=r.chatRoom;
  const old=s.operationResults[x.requestId];if(old)return old.signature===stable(x)?{ok:true,reused:true,messageId:old.messageId}:fail('conflicting_reply');
  const round=s.round,p=r.participants.find(p=>p.id===x.participantId);
  if(!round||round.complete||x.round!==round.number||!p||!round.participantIds.includes(p.id))return fail('turn_not_admitted');
  if(x.assignmentRevision!==p.assignmentRevision||x.replyTo!==round.replyTo||x.requestId!==id+':'+round.number+':'+p.id)return fail('stale_turn');
  const next=round.participantIds.find(pid=>!round.messages.some(mid=>r.messages.find(m=>m.id===mid)?.senderId===pid));
  if(next!==p.id)return fail('moderator_order');
  if(typeof x.body!=='string'||!x.body.trim()||x.body.length>4000)return fail('invalid_reply');
  const m=C.appendMessage(id,{senderKind:'participant',senderId:p.id,senderName:p.role,messageType:'response',body:x.body,replyTo:x.replyTo});
  m.roomRound=round.number;m.assignmentRevision=p.assignmentRevision;
  /* E-18: this turn reads the steering notes sent since the last one (never the speaker who was mid-turn when it came) */
  const read=steeringFor(s,p.id);read.forEach(e=>{e.readBy=p.id;});if(read.length)m.readSteering=read.map(e=>e.messageId);
  (s.steering||[]).forEach(e=>{if(!e.readBy&&e.speaking===p.id)e.speaking=null;});
  freeze(m);round.messages.push(m.id);
  s.operationResults[x.requestId]={signature:stable(x),messageId:m.id};p.status='waiting';p.current='Turn delivered';
  if(round.messages.length===round.participantIds.length){round.complete=true;s.roundsSoFar=round.number;}
  /* E-18: like the main chat's queue at the end of a turn, the first queued message goes to the room when the round ends */
  if(round.complete)flushQueue(id);
  return {ok:true,messageId:m.id,roundComplete:round.complete};
 }
 function canSend(id,dest){const r=run(id);if(!owns(id))return fail('room_missing');if(r.status!=='running')return fail('room_ended_or_paused');if(r.chatRoom.round&&!r.chatRoom.round.complete)return fail('finish_current_round');if(r.chatRoom.pendingRecipientIds?.length)return fail('finish_pending_delivery');if(r.config.turnPolicy==='ask_everyone_once'&&r.chatRoom.roundsSoFar>=1||r.chatRoom.roundsSoFar>=+r.config.maxRounds)return fail('round_limit_reached');if(dest?.participantId&&!r.participants.some(p=>p.id===dest.participantId))return fail('participant_missing');return {ok:true};}
 function receiveUser(id,message,buffer,thread){
  if(message&&message.roomSteer)return steer(id,message,buffer&&buffer.destination,thread);
  const r=run(id),dest=buffer.destination,check=canSend(id,dest);if(!check.ok)return check;
  if(thread.id!==r.threadId)return fail('wrong_thread');
  const prior=r.messages.find(m=>m.id===message.id);if(prior)return prior.body===message.body?{ok:true,reused:true}:fail('conflicting_user_message');
  const ids=dest.participantId?[dest.participantId]:r.participants.map(p=>p.id);
  const ref=C.appendMessage(id,{id:message.id,senderKind:'user',senderName:'You',body:message.body,recipientIds:ids,createdAt:message.sentAt});
  Object.assign(message,ref);r.messages[r.messages.length-1]=message;
  r.chatRoom.summary=null;r.chatRoom.lastUserMessageId=message.id;r.chatRoom.pendingRecipientIds=ids;
  r.chatRoom.deliveries.push({messageId:message.id,recipientIds:ids.slice()});return {ok:true,messageId:message.id};
 }
 /* OWNER ANSWER E-18 (Jared, 2026-09-27): "It should work like the normal chat, it queues the message for the next
    round, and the user has the option to send it immediately to steer but not interrupt." A composer send to this
    room while a round is going is queued (chatRoom.queued, at most 2, the main chat's limit and words); when the
    round ends the first queued message goes to the room (the next round answers it, as a normal send does). Send now
    delivers it into the running round as steering: the speaker is not interrupted, and the next turn reads it
    (request().steering, the reply's readSteering). Canon canSend is unchanged: scheduled and captured deliveries
    keep their own rules. */
 const QMAX=2;let qseq=0;
 function queued(id){const r=run(id);if(!owns(id))return [];return r.chatRoom.queued||(r.chatRoom.queued=[]);}
 function steeringFor(s,pid){return (s.steering||[]).filter(e=>!e.readBy&&e.speaking!==pid&&(!e.recipientIds||e.recipientIds.includes(pid)));}
 function enqueue(id,text,dest){if(!owns(id))return fail('room_missing');const q=queued(id);if(q.length>=QMAX)return fail('queue_full');
  const e={id:'rq-'+(++qseq)+'-'+Date.now().toString(36),text:String(text||''),participantId:dest&&dest.participantId||null,destination:clone(dest||{}),at:new Date().toISOString()};q.push(e);return {ok:true,entry:e};}
 function steer(id,message,dest,thread){
  const r=run(id);if(!owns(id))return fail('room_missing');if(r.status!=='running')return fail('room_ended_or_paused');
  const s=r.chatRoom,round=s.round;if(!round||round.complete)return fail('room_not_running');
  if(thread&&thread.id!==r.threadId)return fail('wrong_thread');
  if(dest?.participantId&&!r.participants.some(p=>p.id===dest.participantId))return fail('participant_missing');
  const prior=r.messages.find(m=>m.id===message.id);if(prior)return prior.body===message.body?{ok:true,reused:true}:fail('conflicting_user_message');
  const ids=dest?.participantId?[dest.participantId]:r.participants.map(p=>p.id);
  const ref=C.appendMessage(id,{id:message.id,senderKind:'user',senderName:'You',body:message.body,recipientIds:ids,createdAt:message.sentAt||message.time});
  Object.assign(message,ref);r.messages[r.messages.length-1]=message;message.roomRound=round.number;message.roomSteer=true;
  const spoke=round.messages.map(mid=>r.messages.find(m=>m.id===mid)?.senderId),speaking=round.participantIds.find(pid=>!spoke.includes(pid))||null;
  (s.steering||(s.steering=[])).push({messageId:message.id,round:round.number,speaking,recipientIds:dest?.participantId?ids.slice():null,readBy:null});
  return {ok:true,messageId:message.id,steered:true};
 }
 /* what a queued message can do now: steer (a round is going), go (the room can take a message), or neither (why) */
 function queueState(id){const r=run(id);if(!owns(id))return {can:false,code:'room_missing'};const s=r.chatRoom;
  if(r.status==='running'&&s.round&&!s.round.complete)return {can:true,steer:true};const ok=canSend(id);return ok.ok?{can:true,steer:false}:{can:false,code:ok.error};}
 /* deliver one queued message the way the composer delivers a send: the user's message in the thread, then the
    commit hooks with the destination it was queued for (COLLAB's hook hands it to receiveUser and marks where it
    went). Nothing is lost: if the room does not take it, it goes back to its place in the queue. */
 function deliverQueued(id,eid){
  const r=run(id),q=queued(id),i=q.findIndex(e=>e.id===eid);if(i<0)return fail('queued_missing');
  const st=queueState(id);if(!st.can)return fail(st.code);
  const c=E.ctx(),t=c.state.threads.find(t=>t.id===r.threadId);if(!t)return fail('thread_missing');
  const e=q[i],msg={id:c.uid('user'),role:'user',type:'text',body:e.text,time:new Date().toISOString()};if(st.steer)msg.roomSteer=true;
  q.splice(i,1);t.messages.push(msg);t.updated='now';
  const buf={destination:clone(e.destination),attachments:[],text:''};
  (RT.composer.commitHooks||[]).forEach(h=>{try{h(c,t,msg,buf);}catch(err){console.error('PM56 room queue commitHook threw',err);}});
  if(!r.messages.some(m=>m.id===msg.id)){const k=t.messages.indexOf(msg);if(k>=0)t.messages.splice(k,1);q.splice(Math.min(i,q.length),0,e);return fail(st.steer?'room_not_running':'room_ended_or_paused');}
  return {ok:true,messageId:msg.id,steered:!!st.steer};
 }
 function flushQueue(id){try{const q=queued(id);if(q.length&&queueState(id).can&&!queueState(id).steer)return deliverQueued(id,q[0].id);}catch(err){console.error('PM56 room queue flush threw',err);}return null;}
 function summarize(id){
  const r=run(id);if(!owns(id)||r.status!=='running'||!r.chatRoom.round?.complete)return fail('round_incomplete');
  const s=r.chatRoom;if(s.summary&&s.summary.round===s.roundsSoFar)return {ok:true,reused:true,messageId:s.summary.messageId};
  // Recorded moderator input, not a live inference or a claim of measured performance.
  const body=s.input.summary;const m=C.appendMessage(id,{senderKind:'coordinator',senderId:'moderator:'+id,senderName:'Moderator',messageType:'response',body});m.roomConclusion=true;freeze(m);
  s.summary={round:s.roundsSoFar,messageId:m.id};return {ok:true,messageId:m.id};
 }
 function finish(id){const r=run(id);if(!owns(id))return fail('room_missing');if(r.status==='completed')return {ok:true,reused:true};if(r.status!=='running'||r.chatRoom.pendingRecipientIds||!r.chatRoom.summary||!r.chatRoom.round?.complete||r.chatRoom.summary.round!==r.chatRoom.roundsSoFar)return fail('current_summary_required');r.status='completed';r.completedAt=new Date().toISOString();r.stopEpoch++;r.participants.forEach(p=>{p.status='done';p.outcome='completed';p.current='Discussion complete';});return {ok:true};}
 function promotionRequest(id,mid,target){const r=run(id),m=r?.messages.find(m=>m.id===mid);return r&&m?{runId:id,messageId:mid,target,threadId:r.threadId,definitionRevision:r.definitionRevision,messageHash:hash({id:m.id,body:m.body,senderId:m.senderId})}:null;}
 function validatePromotion(x,target){
  const r=run(x?.runId);if(!owns(r?.id)||!['running','completed'].includes(r.status))return fail('room_unavailable');
  const m=r.messages.find(m=>m.id===x.messageId);if(!m||!['participant','coordinator'].includes(m.senderKind)||!m.body.trim())return fail('select_room_output');
  if(!['plan','todo'].includes(target)||x.target!==target)return fail('unsupported_promotion');
  if(r.threadId!==x.threadId||r.definitionRevision!==x.definitionRevision)return fail('stale_promotion');
  if(hash({id:m.id,body:m.body,senderId:m.senderId})!==x.messageHash)return fail('source_changed');
  if(!E.ctx().state.threads.some(t=>t.id===r.threadId))return fail('thread_missing');
  return {ok:true,run:r,message:m};
 }
 function promote(x){const check=validatePromotion(x,x?.target);if(!check.ok)return check;const r=check.run;
  const result=x.target==='todo'?window.PM56_TODOS.materializeFromRoom(x):window.PM56_PLANS.createFromRoom(x);if(!result.ok)return result;
  const key=x.target+':'+x.messageId;if(!r.chatRoom.promotions.some(p=>p.key===key))r.chatRoom.promotions.push({key,target:x.target,sourceMessageId:x.messageId,sourceParticipantId:check.message.senderId,messageHash:x.messageHash,id:result.todoId||result.planId,summary:check.message.body});return result;}
 function controls(c,r){return '<button class="soft-button" data-action="room-open-discussion" data-run="'+c.esc(r.id)+'">Open discussion</button>';}
 function inline(c,r){return '<p class="collab-sub">'+r.chatRoom.roundsSoFar+' round'+(r.chatRoom.roundsSoFar===1?'':'s')+' · '+r.participants.length+' helper'+(r.participants.length===1?'':'s')+(r.chatRoom.promotions.length?' · '+r.chatRoom.promotions.length+' promoted':'')+'</p>'+controls(c,r);}
 /* The room document is ROOM-B's one renderer (room-view.js: PM56_ROOM.viewDocument, the room: editor slots and
    Download transcript (.md)). The old fallback document that lived here is gone; documentHtml stays in the
    PM56_ROOM API (B.9 MUST-KEEP) and hands over to the view. */
 function documentHtml(c,id){const V=W().viewDocument;return typeof V==='function'&&owns(id)?V(c,id):'';}
 /* IMPACT A1-23: the recorded-example preflight runs only on a draft flagged recorded (PM56_COLLAB.isRecordedDraft);
    a wand-started Chat Room is never refused for not being a recording */
 const isRecorded=d=>!!(C.isRecordedDraft?C.isRecordedDraft(d):d&&d.roomInput);
 const sayNo=(c,title,code)=>{const t=window.PM56_SHELL&&window.PM56_SHELL.pmxRefusalText?window.PM56_SHELL.pmxRefusalText(code):null;c.toast(title,t?t.text:'Nothing changed.');};
 E.chainAction('collab-modal-commit',(c)=>{const d=C.draft();if(d?.kind!=='chat_room'||!isRecorded(d))return false;const ok=preflight(d);if(ok.ok)return false;const t=window.PM56_SHELL?.pmxRefusalText?.(ok.error);d.lastFailure={error:ok.error,message:t?t.text:'This recorded example needs exactly 3 helpers, no specialists, Moderator guides or One answer each, and 1 or 2 rounds.'};c.renderOverlays();return true;});
 E.chainAction('collab-room-next-round',(c,b)=>{if(!owns(b.dataset.run))return false;const x=beginRound(b.dataset.run,envelope(b.dataset.run));if(x.ok)document.dispatchEvent(new CustomEvent('pm56:room-round',{detail:{runId:b.dataset.run}}));else sayNo(c,'Round not started',x.error);c.renderApp();return true;});
 E.chainAction('collab-room-summarize',(c,b)=>{if(!owns(b.dataset.run))return false;const x=summarize(b.dataset.run);if(!x.ok)sayNo(c,'Summary not ready',x.error);c.renderApp();return true;});
 E.action('room-finish',(c,b)=>{const x=finish(b.dataset.run);if(!x.ok)sayNo(c,'Discussion not ended',x.error);c.renderApp();return true;});
 E.action('room-select-message',(c,b)=>{if(!owns(b.dataset.run))return true;view.set(b.dataset.run,{...view.get(b.dataset.run),selected:b.dataset.message});c.renderApp();return true;});
 E.chainAction('collab-open-panel',(c,b)=>{if(!owns(b.dataset.run)||b.classList.contains('ab-row'))return false;c.closeDialog();c.closeMenu();c.state.editorRevealed=true;c.openEditor('room:'+b.dataset.run);return true;});
 E.chainAction('collab-open-configure',(c,b)=>{const r=run(b.dataset.reconfigure);if(!owns(r?.id))return false;if(['running','paused'].includes(r.status)){c.toast('Keep the current discussion','End or cancel this discussion before setting up another one.');return true;}if(c.state.selectedThread!==r.threadId)c.switchThread(r.threadId);C.openConfigure('chat_room',r.id);const d=C.draft();d.reconfigureRunId=null;d.roomInput=clone(r.chatRoom.input);c.openDialog({type:'collab-configure'});return true;});
 E.action('room-open-discussion',(c,b)=>{if(!owns(b.dataset.run))return true;if(b.dataset.message)view.set(b.dataset.run,{selected:b.dataset.message});c.closeDialog();c.closeMenu();c.state.editorRevealed=true;c.openEditor('room:'+b.dataset.run);if(b.dataset.message)requestAnimationFrame(()=>document.querySelector('[data-room-message="'+CSS.escape(b.dataset.message)+'"]')?.scrollIntoView({block:'center'}));return true;});
 E.action('room-promote',(c,b)=>{const x=promotionRequest(b.dataset.run,b.dataset.message,b.dataset.target),res=x?promote(x):fail('select_room_output');if(!res.ok)sayNo(c,'Nothing created',res.error);c.renderApp();return true;});
 E.action('room-open-promotion',(c,b)=>{const r=run(b.dataset.run),p=r?.chatRoom.promotions.find(p=>p.key===b.dataset.key);if(!p)return true;if(p.target==='plan'){c.state.editorRevealed=true;c.openEditor('plan:'+p.id);}else{if(c.state.selectedThread!==r.threadId)c.switchThread(r.threadId);c.state.activity.pinned=true;c.state.activity.open=true;c.state.activity.domain='todo';c.state.activity.scope='focus';c.state.activity.selected={domain:'todos',id:p.id};c.renderApp();}return true;});
 E.chainAction('collab-room-promote',(c,b)=>{if(!owns(b.dataset.run))return false;const x=promote(promotionRequest(b.dataset.run,b.dataset.message,b.dataset.target));if(!x.ok)sayNo(c,'Nothing created',x.error);c.renderApp();return true;});
 function exportTranscript(id){const r=run(id);return owns(id)?JSON.stringify({kind:'chat_room',id:r.id,title:r.title,definitionRevision:r.definitionRevision,participants:r.participants.map(p=>({id:p.id,role:p.role,model:p.effectiveModelId,persona:p.effectivePersona})),messages:r.messages,promotions:r.chatRoom.promotions},null,2):null;}
 E.action('room-export',(c,b)=>{const text=exportTranscript(b.dataset.run);if(!text)return true;const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='chat-room.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);return true;});
 /* OWNER ANSWER E-18 (replaces the provisional A1-29 refusal): a send while a round is going is queued for the next
    round and the composer empties, exactly as the main chat queues a send while a reply is being written (the same
    limit of 2 and the same "Queue full" words); the queued rows sit above the composer (queueRows below) with Edit
    and Send now. Every other reason the room can't take a message keeps the words in the composer and prints the
    reason in the card's meta (never a toast only). Nothing says "waits" or "refused". */
 RT.composer.preSendHooks.unshift((c,t,raw)=>{const d=RT.composer.bufferFor(t.id).destination||RT.composer.destination;if(!d||!owns(d.refId))return false;const r=run(d.refId),ok=canSend(d.refId,d);if(ok.ok&&r.threadId===t.id)return false;
  if(ok.error==='finish_current_round'&&r.threadId===t.id){const x=enqueue(d.refId,raw,d);if(x.ok){refused.delete(d.refId);
   /* the words moved into the queue: the composer's durable buffer empties too (its destination stays the room) */
   const buf=RT.composer.bufferFor(t.id);buf.text='';buf.cursor_position=null;buf.revision=(buf.revision||0)+1;if(c.state.drafts)c.state.drafts[t.id]='';
   c.renderApp();return {claimed:true};}
   c.toast('Queue full','Send, edit, or cancel a queued message before adding another.');return {claimed:true,preserveComposer:true};}
  const code=ok.error||'wrong_thread';refused.set(d.refId,{code,at:roomMoment(r)});sayNo(c,'Not sent',code);c.renderApp();return {claimed:true,preserveComposer:true};});
 /* Send now (the main chat's queue-send-now): steers the running round, or goes to the room when it can take it */
 E.action('room-queue-send-now',(c,b)=>{const x=deliverQueued(b.dataset.run,b.dataset.id);if(!x.ok&&x.error!=='queued_missing')sayNo(c,'Not sent',x.error);c.renderApp();return true;});
 /* Edit (the main chat's queue-edit): the words go back into the composer, still addressed to the room while it runs */
 E.action('room-queue-edit',(c,b)=>{const r=run(b.dataset.run),q=queued(b.dataset.run),i=q.findIndex(e=>e.id===b.dataset.id);if(i<0)return true;const [e]=q.splice(i,1);
  if(r&&['running','paused'].includes(r.status)&&c.state.selectedThread===r.threadId&&e.destination&&e.destination.refId){const CS=RT.composer,buf=CS.bufferFor(r.threadId);CS.destination=clone(e.destination);buf.destination=CS.destination;buf.revision=(buf.revision||0)+1;}
  c.state.composer=e.text;c.renderApp();return true;});
 /* Remove (x on every queued row): the words are dropped; the "Queue full" toast's "cancel a queued message" */
 E.action('room-queue-discard',(c,b)=>{const q=queued(b.dataset.run),i=q.findIndex(e=>e.id===b.dataset.id);if(i>=0)q.splice(i,1);c.renderApp();return true;});
 /* 8.3 "Last round used, then a send": a message the room can no longer take can go to the assistant instead. It is
    sent the way the composer sends (the main chat's send, with its own queue while a reply is being written);
    words already in the composer are never overwritten. */
 E.action('room-queue-to-assistant',(c,b)=>{const r=run(b.dataset.run),q=queued(b.dataset.run),i=q.findIndex(e=>e.id===b.dataset.id);if(i<0||!r)return true;
  if(String(c.state.composer||'').trim()){c.toast('Not sent','Send or clear what’s in the message box first.');return true;}
  const [e]=q.splice(i,1);if(c.state.selectedThread!==r.threadId)c.switchThread(r.threadId);
  const CS=RT.composer,buf=CS.bufferFor(r.threadId);CS.destination=null;buf.destination=null;buf.revision=(buf.revision||0)+1;
  c.state.composer=e.text;c.renderApp();
  const send=document.querySelector('[data-action="send"]');if(send&&!send.disabled)send.click();return true;});
 /* a message the room can no longer take does not follow the chat forever: once the room has ended and you send
    anything else in this chat, its "Not sent" rows go */
 (RT.composer.commitHooks||(RT.composer.commitHooks=[])).push((c,t,msg,buf)=>{try{const d=buf&&buf.destination;if(d&&owns(d.refId))return;
  (C.runsForThread?C.runsForThread(t.id):[]).forEach(r=>{if(!owns(r.id)||['running','paused'].includes(r.status))return;const q=r.chatRoom.queued;if(q&&q.length)q.length=0;});}catch(err){console.error('PM56 room queue commitHook threw',err);}});
 E.chainAction('reset-all',()=>{view.clear();refused.clear();streamStart.clear();speakerOf.clear();return false;});
 /* =====================================================================
    PRESENTATION (ROOM-A; DESIGN-SPEC 8.3, 7, 5.5): PM56_ROOM.sheetParts(draft, ctx, generic) and
    PM56_ROOM.cardParts(run, ctx, face, generic). COLLAB draws the frame (KIND INTERFACE in COLLAB-NOTES); these
    functions only return parts built from the foundation's builders (PM56_SHELL.pmx*). The state machines
    above are unchanged except IMPACT A1-23 (the recording preflight runs on recorded drafts only) and
    A1-29 as the owner answered it (E-18: a mid-round send is queued for the next round; Send now steers).
    ===================================================================== */
 const SH=()=>window.PM56_SHELL,PMXo=()=>window.PM56_PMX||null;
 const escH=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const clampN=(v,lo,hi)=>Math.max(lo,Math.min(hi,Math.round(+v||lo)));
 const plural=(n,w)=>n+' '+w+(n===1?'':'s');
 const firstSentence=t=>{const s=String(t||'').replace(/\s+/g,' ').trim();return (s.split(/(?<=[.!?])\s/)[0]||s).trim();};
 const POLICY={moderated:'Moderator guides',round_robin:'Take turns',free_discussion:'Open discussion',ask_everyone_once:'One answer each'};
 function policyOption(v){const c=C.choices?C.choices():null,o=c&&c.turnPolicy&&c.turnPolicy.options.find(o=>o.value===v);return o||{value:v,label:POLICY[v]||POLICY.moderated,read:'the Moderator calls on whoever is most useful next'};}
 /* rounds a run can have: One answer each is always one round (beginRound caps it) */
 const maxRoundsOf=(policy,rounds)=>policy==='ask_everyone_once'?1:clampN(rounds||5,1,20);

 /* ---- the sheet's plate (8.3). 2026-10-07: one cast grammar for every collaboration kind, drawn by
    PM56_SHELL.pmxCastFit from COLLAB's one Chat Room description (PM56_COLLAB.sheet.castSpec.chat_room): the topic
    goes to the Moderator on the bar, the helpers hang under it on one baseline (no table, no rim ticks), the turn
    policy is one note line ("Moderator guides · up to 5 rounds"), the specialists' wing is drawn when they are on,
    and the strip names its seats beside their marks (40 tall: a 4-helper room at 1440 x 900 has 40-49 px, by
    theme). The seat hues are COLLAB's own, so the plate, the roster and the card agree. ---- */
 function roomPlate(d){
  const fn=C.sheet&&C.sheet.plateParts&&C.sheet.plateParts.chat_room;
  return typeof fn==='function'?fn(d):'';
 }

 /* ---- PM56_ROOM.sheetParts (KIND INTERFACE, COLLAB-NOTES): only the Chat Room's own parts; COLLAB keeps the
    hero, roster (with the pinned Moderator row), specialists shelf, Advanced rows and footer frame. ---- */
 function sheetParts(d,ctx,gen){
  if(!d||d.kind!=='chat_room'||d.autoMode)return null;
  const cfg=d.config||{},n=d.rows.length,pol=policyOption(cfg.turnPolicy||'moderated'),once=pol.value==='ask_everyone_once';
  const R=maxRoundsOf(pol.value,cfg.maxRounds),recorded=!!(C.isRecordedDraft&&C.isRecordedDraft(d));
  const P=PMXo(),ink=(k,t)=>P&&P.ink?P.ink(k,t):escH(t);
  const out={plate:roomPlate(d,gen)};
  /* 3. How should they talk? One answer each is always a single round; the helper says so rather than letting the
     stepper claim rounds that never run (the stepper and its input stay for the applier and the harnesses) */
  if(gen&&typeof gen.howHtml==='string'&&once)out.howHtml=gen.howHtml.replace('A round means everyone gets one turn. You can end early or add more.','One answer each is always one round.');
  out.promises=[
   {key:'pr-changes',glyph:'not',strong:'<span data-hover-key="room-promise" data-hover-tip="When it’s done, you choose what, if anything, becomes a To-Do, Plan or Goal.">Talking changes nothing.</span>',text:'You pick what, if anything, to keep.',part:'you'},
   {key:'pr-read',glyph:'lock',text:'Helpers can read your project and the web, never change it.',part:'permission'}];
  out.readback=once
   ?[{part:'team',html:'<b>'+ink('rb:room:n',plural(n,'helper'))+'</b> '},{part:'policy',html:'<b>'+ink('rb:room:pol','each answer once')+'</b>, '},{part:'moderator',html:'then <b>the Moderator</b> sums it up. Nothing changes unless you pick it.'}]
   :[{part:'team',html:'<b>'+ink('rb:room:n',plural(n,'helper'))+'</b> talk it through, '},{part:'policy',html:'<b>'+ink('rb:room:pol',pol.read)+'</b>, '},{part:'rounds',html:'for up to <b>'+ink('rb:room:r',plural(R,'round'))+'</b>. Nothing changes unless you pick it.'}];
  /* 8.3 estimate: replies = helpers x rounds; time and cost are ranges and say they are an estimate */
  const replies=n*R,lo=Math.max(1,Math.round(replies*0.27)),hi=Math.max(lo+2,Math.round(replies*0.67));
  out.estimate=recorded?{recorded:true}:{text:'About '+(replies===1?'1 reply':replies+' replies')+' · usually '+lo+'–'+hi+' min · roughly $'+(replies*0.027).toFixed(2)+'–$'+(replies*0.08).toFixed(2)+' · an estimate, not a promise'};
  /* the preview's first frame (A16): the card's top frame as it will be born */
  const stops=[];for(let i=1;i<=R;i++)stops.push('Round '+i);
  out.firstFrame=recorded
   ?{density:'starting',status:'yourmove',word:'Your move',reason:'start the first round.',stops,nowText:'<b>Round 1 of '+R+'</b> · not started'}
   :{density:'waiting',status:'waiting',word:'Waiting to start',reason:escH(C.waitingReason?C.waitingReason({kind:'chat_room'}):'Nothing runs by itself in this preview, so the Moderator hasn’t opened the first round yet.'),stops,nowText:'<b>Round 1 of '+R+'</b> · not started'};
  return out;
 }

 /* ---- PM56_ROOM.cardParts(run, ctx, face, generic) -> the Chat Room's parts of the one run card (7, 8.3), in the
    shape of COLLAB's KIND INTERFACE (card part, COLLAB-NOTES): every field returned replaces COLLAB's generic one.
    Returned: density (live while a round runs, attention with an accent decision between rounds, result when
    finished), sentence, decision, track, lanes, cluster, meta {parts, recorded}, more, result, receipt, dock,
    openAction, waitingNoun / progressNoun. COLLAB adds data-run to every action
    (G-19). The shared faces (waiting, paused, cancelled, stopped at your limit) stay COLLAB's (A3-04). */
 const WAIT_NOUN='the Moderator hasn’t opened the first round';
 const refused=new Map();
 /* the moment a refusal belongs to: it is shown until the round (or the room's state) moves on */
 const roomMoment=r=>{const s=r&&r.chatRoom;return s?[s.round?s.round.number:0,s.round&&s.round.complete?1:0,s.roundsSoFar,s.pendingRecipientIds?1:0,r.status].join(':'):'';};
 const HELP={ask:'Everyone gives an opening view.',next:'Each helper speaks once more.',sum:'The Moderator writes where everyone agrees, where they differ, and what’s still open.',end:'Locks the conversation. You can still promote messages.'};
 const tip=(key,text)=>'data-hover-key="room-act-'+key+'" data-hover-tip="'+escH(text)+'"';
 function personaOf(p){return String(p&&(p.effectivePersona||p.requestedPersona)||'Implementer');}
 function markFor(r,p,size,state,key){const i=r.participants.indexOf(p);return SH().pmxMark({key,role:personaOf(p),seat:(Math.max(0,i)%8)+1,size,state});}
 function refusalWords(code){const t=SH().pmxRefusalText?SH().pmxRefusalText(code):null;return t?t.text:'This room can’t take that right now.';}
 /* the facts every face reads: the protocol adapter's view of the record */
 function roomFacts(r){
  const s=r.chatRoom,pol=s.turnPolicy||r.config.turnPolicy||'moderated',max=maxRoundsOf(pol,r.config.maxRounds);
  const byId=id=>r.messages.find(m=>m.id===id);
  const round=s.round,inRound=!!(round&&!round.complete);
  const delivered=round?round.messages.map(byId).filter(Boolean):[];
  const pending=inRound?round.participantIds.filter(pid=>!delivered.some(m=>m.senderId===pid)):[];
  const pp=id=>r.participants.find(p=>p.id===id)||null;
  const said=r.messages.filter(m=>m.senderKind==='participant');
  const summary=s.summary?byId(s.summary.messageId):null;
  return {s,pol,max,round,inRound,delivered,speaker:pp(pending[0]),next:pp(pending[1]),said,replies:said.length,
   n:round?(inRound?round.number:s.roundsSoFar):1,summary,summarized:!!(s.summary&&round&&round.complete&&s.summary.round===s.roundsSoFar),
   lastUsed:s.roundsSoFar>=max,userWaiting:!!(s.pendingRecipientIds&&s.pendingRecipientIds.length),
   started:!!round||s.roundsSoFar>0,prov:C.provenance?C.provenance(r.id):'recorded'};
 }
 const repliesWord=n=>n===1?'1 reply':n+' replies';
 const STOPPED={paused:1,canceled:1,cancelled:1,failed:1};
 function trackOf(r,f){
  const stops=[],done=r.status==='completed',stopped=!!STOPPED[r.status];
  const cur=r.status==='failed'?'failed':r.status==='running'||r.status==='paused'?'now':'next';
  for(let i=1;i<=f.max;i++)stops.push({key:'pmx-stop:'+r.id+':'+(i-1),label:'Round '+i,state:i<=f.s.roundsSoFar?'done':f.inRound&&i===f.round.number?cur:done?'skipped':'next'});
  const nowText=done?'<b>Finished</b> · '+plural(f.s.roundsSoFar,'round')+' · '+repliesWord(f.replies)
   :!f.started?'<b>Round 1 of '+f.max+'</b> · not started'
   :stopped?'<b>Round '+f.n+' of '+f.max+'</b> · '+(r.status==='paused'?'paused':'stopped')+' after '+repliesWord(f.replies)
   :'<b>Round '+f.n+' of '+f.max+'</b>'+(f.inRound?' · '+repliesWord(f.replies)+' so far':' done · '+repliesWord(f.replies));
  return {stops,nowText};
 }
 /* the head cluster (C2): the Moderator first; the speaker's mark carries the working ring, the next one's the
    queued ring. Marks are keyed so the speaker marker can find them (identity keys only, 5.3). */
 function clusterOf(r,f){
  const S=SH(),done=r.status==='completed',live=r.status==='running';
  return [S.pmxMark({key:'cm:'+r.id+':mod',role:'moderator',size:18,state:done?'done':'idle'})].concat(r.participants.map(p=>
   markFor(r,p,18,done?'done':live&&f.speaker===p?'working':live&&f.next===p?'queued':'idle','cm:'+r.id+':'+p.id)));
 }
 function laneFor(r,p,o){const S=SH();return S.pmxLane(Object.assign({key:'pmx-lane:'+r.id+':'+p.id,action:'room-open-discussion',attrs:'data-run="'+escH(r.id)+'" data-participant="'+escH(p.id)+'"'+(o.message?' data-message="'+escH(o.message)+'"':''),mark:markFor(r,p,22,o.state||'idle'),name:escH(p.role)},o));}
 function moderatorLane(r,o){const S=SH();return S.pmxLane(Object.assign({key:'pmx-lane:'+r.id+':mod',action:'room-open-discussion',attrs:'data-run="'+escH(r.id)+'"'+(o.message?' data-message="'+escH(o.message)+'"':''),mark:S.pmxMark({role:'moderator',size:22,state:'idle'}),name:'Moderator'},o));}
 const quoteOf=m=>'<q>'+escH(firstSentence(m.body))+'</q>';
 /* the speaker's words (M4): the recorded player's own turn when it has one (PM56_ROOM_DEMOS.speaking: the text and
    pace the room document streams, so the card and the document keep step), else the recorded round's reply.
    streamStart remembers when each lane's words began, so a lane that is mounted again (a resize, history pinned or
    unpinned, a thread switch) shows the words already spoken at once and streams on from there: never blank, never
    replayed from the first word. */
 const STREAM_MS=70,streamStart=new Map();
 const nowMs=()=>{const K=window.PM56_CLOCK;return K&&K.now?K.now():performance.now();};
 function speakingWords(r,f){
  const D=window.PM56_ROOM_DEMOS,t=D&&D.speaking?D.speaking(r.id):null;
  if(t&&t.text&&f.speaker&&t.pid===f.speaker.id)return {text:String(t.text),ms:+t.msPerWord||STREAM_MS};
  if(f.prov!=='recorded'||!f.speaker)return null;
  const up=f.s.input&&f.s.input.rounds&&f.round?(f.s.input.rounds[f.round.number-1]||[]):[],w=up[r.participants.indexOf(f.speaker)];
  return w?{text:String(w),ms:STREAM_MS}:null;
 }
 function spokenSoFar(key,w){
  let st=streamStart.get(key);if(!st||st.text!==w.text){st={at:nowMs(),text:w.text,ms:w.ms};streamStart.set(key,st);}
  const words=w.text.split(/\s+/).filter(Boolean),P=PMXo();if(P&&P.reduced&&P.reduced())return words.join(' ');
  return words.slice(0,Math.max(1,Math.min(words.length,Math.floor((nowMs()-st.at)/st.ms)+1))).join(' ');
 }
 /* lanes (8.3): the conversation's shape, not everyone. While a round runs: the current speaker (their words
    streaming into the kept island), up next, and the previous turn folded to its first sentence. Between rounds:
    each speaker's line from the round that just ended, in the order they spoke; once the Moderator has summed it
    up, its headline leads and the helpers fold to their marks. A room that stopped mid-round (paused, cancelled,
    the Moderator stopped) says who spoke, who was speaking and who hadn't, in plain words. */
 function lanesOf(r,f){
  const S=SH(),out=[],live=r.status==='running';
  const wrap=more=>out.length?S.pmxLanes({key:'lanes:'+r.id,lanesHtml:out.join(''),more,runId:r.id,kind:'chat_room'}):'';
  const moreOf=n=>n>0?{count:n,text:'Show all',action:'room-open-discussion',attrs:'data-run="'+escH(r.id)+'"'}:null;
  if(live&&f.inRound&&f.speaker){
   /* the island's key carries the words' hash: a kept island never gets new children, so other words get a new island */
   const w=speakingWords(r,f),key='l2:'+r.id+':'+f.speaker.id+':quote:r'+f.round.number+(w?':'+hash(w.text).slice(8):'');
   out.push(laneFor(r,f.speaker,{state:'working',verb:'speaking',verbKey:'vb:'+f.speaker.id+':speaking:'+f.round.number,fresh:true,
    line2:w?'<q data-room-stream="'+escH(w.text)+'" data-ms="'+w.ms+'">'+escH(spokenSoFar(key,w))+'</q>':'answering now',line2Kind:w?'quote':'detail',keep:!!w,keepKey:key}));
   /* a steering note (E-18): a live reply reads it; a recorded reply was written beforehand and does not change */
   const note=f.next&&steeringFor(f.s,f.next.id).length;
   if(f.next)out.push(laneFor(r,f.next,{state:'queued',verb:'up next',verbKey:'vb:'+f.next.id+':next',line2:note?(f.prov==='recorded'?'your note is in the room':'reads your note on their turn'):'waiting for their turn',line2Kind:'detail'}));
   const prev=f.said[f.said.length-1],pp=prev&&r.participants.find(p=>p.id===prev.senderId);
   if(pp&&pp!==f.speaker&&pp!==f.next)out.push(laneFor(r,pp,{verb:'spoke in round '+prev.roomRound,verbKey:'vb:'+pp.id+':spoke:'+prev.id,message:prev.id,line2:quoteOf(prev),line2Kind:'quote'}));
   return wrap(null);
  }
  if(!f.started)return '';
  if(!live&&f.inRound){
   const how=r.status==='paused'?'when you paused':r.status==='failed'?'when the Moderator stopped':'when you cancelled';
   const order=f.round.participantIds.map(pid=>r.participants.find(p=>p.id===pid)).filter(Boolean);
   order.forEach(p=>{const m=f.delivered.find(m=>m.senderId===p.id);
    if(m)out.push(laneFor(r,p,{verb:'spoke in round '+m.roomRound,verbKey:'vb:'+p.id+':spoke:'+m.id,message:m.id,line2:quoteOf(m),line2Kind:'quote'}));
    else if(p===f.speaker)out.push(laneFor(r,p,{verb:'was speaking '+how,verbKey:'vb:'+p.id+':cut:'+f.round.number,line2:r.status==='paused'?'their reply isn’t finished yet':'their reply wasn’t finished',line2Kind:'detail'}));
    else out.push(laneFor(r,p,{verb:'hadn’t spoken yet',verbKey:'vb:'+p.id+':not:'+f.round.number,line2:r.status==='paused'?'speaks after you resume':'the round stopped before their turn',line2Kind:'detail'}));});
   if(out.length>3){const n=out.length-2;out.length=2;return wrap(moreOf(n));}
   return wrap(null);
  }
  if(live&&f.summarized&&f.summary){
   out.push(moderatorLane(r,{verb:'summed up round '+f.s.summary.round,verbKey:'vb:mod:sum:'+f.summary.id,message:f.summary.id,line2:quoteOf(f.summary),line2Kind:'quote'}));
   return wrap(moreOf(f.delivered.length));
  }
  f.delivered.forEach(m=>{const p=r.participants.find(p=>p.id===m.senderId);if(p)out.push(laneFor(r,p,{state:r.status==='completed'?'done':'idle',verb:'spoke in round '+m.roomRound,verbKey:'vb:'+p.id+':spoke:'+m.id,message:m.id,line2:quoteOf(m),line2Kind:'quote'}));});
  if(out.length>3){const n=out.length-2;out.length=2;return wrap(moreOf(n));}
  return wrap(null);
 }
 /* promotion (8.3, G-16): Promote to To-Do · Plan · Goal as three text buttons, Goal disabled with its printed
    reason, acting on the whole summary message until point-level promotion exists (D-11). Card-only class names
    (pmx-room-card-*): the room document has its own promotion block, and one name for both widened the card. */
 function madeRows(r,m){const S=SH();return r.chatRoom.promotions.filter(p=>p.sourceMessageId===m.id).map(p=>'<p class="pmx-room-card-made" data-k="room-made:'+escH(p.key)+'">'+S.pmxGlyph('check',13)+'<span><b>'+(p.target==='plan'?'Plan':'To-Do')+' created</b> from this summary</span><button type="button" class="text-button pmx-act" data-action="room-open-promotion" data-key="'+escH(p.key)+'" data-run="'+escH(r.id)+'">Open</button></p>').join('');}
 function promoteRow(r,m){
  const a=(t,l)=>'<button type="button" class="text-button pmx-act" data-action="room-promote" data-target="'+t+'" data-message="'+escH(m.id)+'" data-run="'+escH(r.id)+'">'+l+'</button>';
  return '<div class="pmx-room-card-promote" data-k="room-promote:'+escH(r.id)+'"><p class="pmx-room-card-promote-row"><span class="pmx-room-card-promote-label">Promote to</span>'+a('todo','To-Do')+a('plan','Plan')+
   '<button type="button" class="text-button pmx-act" data-action="room-promote" data-target="goal" data-run="'+escH(r.id)+'" disabled data-failure="unsupported_promotion">Goal</button></p>'+
   '<p class="pmx-room-card-help">Keeps a link back to this message. <span data-failure="unsupported_promotion">'+escH(refusalWords('unsupported_promotion'))+'</span></p>'+madeRows(r,m)+'</div>';
 }
 function promotionsWord(r){const P=r.chatRoom.promotions,c=t=>P.filter(p=>p.target===t).length;return [c('todo')?plural(c('todo'),'To-Do'):'',c('plan')?plural(c('plan'),'Plan'):''].filter(Boolean).join(', ');}
 function cardParts(r,ctx,face,generic){
  if(!r||r.kind!=='chat_room')return null;
  if(!owns(r.id))return {nouns:{waiting:WAIT_NOUN,progress:''},waitingNoun:WAIT_NOUN,progressNoun:'rounds'};/* seeds and wand rooms: COLLAB's faces */
  const S=SH(),T=S.PMX_COPY,f=roomFacts(r),pol=policyOption(f.pol),done=r.status==='completed';
  const P=PMXo(),viewing=!!(P&&P.viewOpen&&P.viewOpen(r.id));
  const out={waitingNoun:WAIT_NOUN,progressNoun:'rounds',openAction:'collab-open-panel',cluster:clusterOf(r,f),track:trackOf(r,f),recorded:f.prov==='recorded'};
  /* a send the room can't take keeps its words in the composer; a queued one (E-18) says where it stands. Either
     way the words get a line of their own on the card (queueLine), never a cut-off tail of the meta line */
  if(refused.has(r.id)&&(canSend(r.id).ok||r.status!=='running'||refused.get(r.id).at!==roomMoment(r)))refused.delete(r.id);
  out.meta={recorded:f.prov==='recorded',parts:r.status==='running'?[escH(pol.label),'you can sum up and end after any round']:[escH(pol.label)]};
  const endItem={action:'room-finish',label:'End discussion',disabled:!(f.summarized&&r.status==='running'),reason:f.summarized?'':refusalWords('current_summary_required'),attrs:tip('end',HELP.end)};
  const exportItem={action:'room-export',label:'Download transcript (.md)'};
  out.more=[endItem,exportItem];
  if(done){
   const m=f.summary||[...r.messages].reverse().find(m=>m.senderKind==='coordinator'),made=promotionsWord(r);
   const head=m?firstSentence(m.body).replace(/[.!]+$/,''):'The discussion ended';
   const rest=m?String(m.body).slice(firstSentence(m.body).length).trim():'';
   /* 7.12: while the room document is open beside the chat, promotion lives there; the card keeps what was made
      and says where the room is, and Open Panel is no longer the loud action (it would only show the same tab) */
   const beside='<p class="pmx-room-card-help" data-k="room-beside:'+escH(r.id)+'">Open beside the chat.</p>';
   const board=(rest?'<div class="pmx-room-card-summary" data-k="room-summary:'+escH(r.id)+'">'+(S.pmxMd?S.pmxMd(rest,{mode:'compact'}):'<p>'+escH(rest)+'</p>')+'</div>':'')+
    (m?(viewing?'<div class="pmx-room-card-promote" data-k="room-promote:'+escH(r.id)+'">'+beside+madeRows(r,m)+'</div>':promoteRow(r,m)):'');
   out.density='result';
   out.result={glyph:'check',headline:escH(head),sub:escH('Finished · '+plural(f.s.roundsSoFar,'round')+' · '+repliesWord(f.replies)+(made?' · '+made:'')),boardHtml:board,outputHtml:'',creditsHtml:''};
   if(viewing)out.actions=[{action:'collab-open-panel',label:'Open Panel',core:true}];
   /* receipt (8.3, G-19): "Finished · 2 rounds · 1 To-Do, 1 Plan". Under 520 px COLLAB's receipt hides its time
      slot and leaves the headline about 140 px, so there the rounds ride in the headline and the check glyph says
      "Finished" ("2 rounds · 1 To-Do"); from 520 px the headline reads "Finished · 1 To-Do" and the time slot
      "2 rounds" (pmx-room-card-fin / -rounds, room-protocol.css) */
   out.receipt={glyph:'check',headline:(made?'<span class="pmx-room-card-fin">Finished · </span><span class="pmx-room-card-rounds">'+escH(plural(f.s.roundsSoFar,'round'))+' · </span>'+escH(made):'Finished<span class="pmx-room-card-rounds"> · '+escH(plural(f.s.roundsSoFar,'round'))+'</span>'),time:escH(plural(f.s.roundsSoFar,'round')),cost:'',recorded:f.prov==='recorded'};
   out.sentence={status:'done',word:'Finished',reason:escH(head)+'.'};
   out.more=[exportItem];
   out.lanes='';
   return out;
  }
  out.lanes=lanesOf(r,f)+queueLine(r);
  if(r.status!=='running'){
   /* paused and cancelled keep COLLAB's shared sentence and actions (A3-04); the lanes and the track above are the
      room's own words. The Moderator stopping is the room's own case (7.6 G-31, IMPACT A1-28). */
   if(r.status==='failed'){
    const say='The Moderator stopped, so nobody is calling on speakers.';
    out.sentence={status:'failed',word:'Needs attention',reason:escH(say)};
    out.decision={tone:'warm',glyph:'warn',sentence:'<b>Needs attention</b> · '+escH(say),actions:[]};
    out.receipt={glyph:'warn',headline:'Needs attention · the Moderator stopped',time:escH(plural(f.s.roundsSoFar,'round')+' done'),cost:'',recorded:f.prov==='recorded'};
    out.more=[exportItem];
   }
   return out;
  }
  if(f.inRound){
   const sp=f.speaker?escH(f.speaker.role):'',nx=f.next?escH(f.next.role):'';
   out.density='live';out.decision=null;
   out.sentence={status:'running',word:escH(S.pmxFill(T.status.round,{n:f.n,m:f.max})),reason:sp?(sp+(f.round.replyTo?' is answering your message':' is speaking')+(nx?' · Up next: '+nx+'.':' · Then it’s your move.')):'The round is ending.'};
   out.dock={tone:'live',sentence:escH('Round '+f.n+' of '+f.max+(f.speaker?' · '+f.speaker.role+' is speaking':''))};
   return out;
  }
  /* between rounds: "your move", the accent decision (7.4), never a warm needs-you */
  const A={ask:{action:'collab-room-next-round',label:'Ask Everyone',primary:true,attrs:tip('ask',HELP.ask)},
   next:p=>({action:'collab-room-next-round',label:'Next Round',primary:p,soft:!p,attrs:tip('next',HELP.next)}),
   sum:p=>({action:'collab-room-summarize',label:'Summarize Now',primary:p,soft:!p,attrs:tip('sum',HELP.sum)}),
   end:p=>({action:'room-finish',label:'End discussion',primary:p,soft:!p,attrs:tip('end',HELP.end)})};
  let word,say,acts;
  if(!f.started&&!f.userWaiting){word='Your move';say='start the first round.';acts=[A.ask];}
  else if(f.userWaiting){word='Your message is with the room';say='start the next round so they can answer.';acts=f.lastUsed?[A.sum(true)]:[A.next(true)];}
  else if(!f.summarized&&!f.lastUsed){word='Round '+f.n+' done';say='Your move.';acts=[A.next(true),A.sum(false)];}
  else if(!f.summarized){word='Round '+f.n+' done';say='That was the last round: sum it up, then end the discussion.';acts=[A.sum(true)];}
  else if(!f.lastUsed){word='Round '+f.n+' is summed up';say='Your move: keep going, or end the discussion.';acts=[A.end(true),A.next(false)];}
  else{word='Summed up';say='Your move: end the discussion.';acts=[A.end(true)];}
  out.density='attention';
  out.sentence={status:'yourmove',word:escH(word),reason:escH(say)};
  /* 7.12 one control set: while the room document is open beside the chat its controls are the only ones, and the
     decision row says where they are */
  out.decision={tone:'accent',glyph:'ring-dot',sentence:'<b>'+escH(word)+'.</b> '+escH(viewing?T.oneControlSet.panel+'.':say.charAt(0).toUpperCase()+say.slice(1)),actions:viewing?[]:acts};
  out.dock={tone:'yourmove',sentence:escH(!f.started?'Your move · start the first round':'Round '+f.n+' of '+f.max+' is done · your move')};
  /* DON'T 31: a control on the card is never repeated in More */
  const onCard={};out.decision.actions.forEach(a=>{onCard[a.action]=1;});
  out.more=out.more.filter(x=>!onCard[x.action]);
  return out;
 }
 /* ---- E-18 queue, presentation: the card's queue line and the queued rows above the composer (the main chat's
    queue strip: the words, Edit, Send now, and a Remove; J-2 sizes). The rows carry pmx classes, so the chat
    surfaces lint them. */
 const HOLD_CODES=['finish_pending_delivery','finish_current_round'];
 /* the card's own line for the queue (and for a send the room can't take): its own row under the lanes, wrapping,
    in the attention tone when the words must be acted on now (the last round, or not sent) */
 function queueLine(r){
  const rf=refused.get(r.id);
  if(rf)return '<p class="pmx-room-card-queue" data-k="room-queue-line:'+escH(r.id)+'" data-tone="needs"><b data-failure="'+escH(rf.code)+'">'+escH(refusalWords(rf.code))+'</b></p>';
  const q=r.chatRoom.queued||[];if(!q.length)return '';const st=queueState(r.id),n=plural(q.length,'message'),s=r.chatRoom;let say,tone='';
  if(st.can&&st.steer){const last=r.config.turnPolicy==='ask_everyone_once'||s.round.number>=+r.config.maxRounds;say=last?n+' queued, but this is the last round: send it now or edit it.':n+' queued for the next round.';if(last)tone='needs';}
  else if(!st.can&&HOLD_CODES.includes(st.code))say=n+' queued · it goes when the next round ends.';
  else if(r.status==='paused')say=n+' queued · the room is paused.';
  else return '<p class="pmx-room-card-queue" data-k="room-queue-line:'+escH(r.id)+'" data-tone="needs"><b data-failure="'+escH(st.code||'room_ended_or_paused')+'">'+escH(n+' not sent · '+notSentWhy(st.code))+'</b></p>';
  return '<p class="pmx-room-card-queue" data-k="room-queue-line:'+escH(r.id)+'"'+(tone?' data-tone="'+tone+'"':'')+'>'+escH(say)+'</p>';
 }
 /* 8.3 "Last round used, then a send": the room has no way to add rounds, so the words say what can be done */
 function notSentWhy(code){return code==='round_limit_reached'?'this room used all its rounds. You can send it to the assistant instead.':refusalWords(code)+' You can send it to the assistant instead.';}
 function queueRows(c){
  const t=c&&c.thread;if(!t||!C.runsForThread)return '';const S=SH(),rows=[];
  const btn=(e,r,action,glyph,label,extra)=>'<button type="button" class="pmx-room-queue-btn" data-action="'+action+'" data-run="'+escH(r.id)+'" data-id="'+escH(e.id)+'" data-hover-key="'+action+'-'+escH(e.id)+'" data-hover-tip="'+escH(label)+'" aria-label="'+escH(label.split('|')[0])+'"'+(extra||'')+'>'+S.pmxGlyph(glyph,14)+'</button>';
  C.runsForThread(t.id).forEach(r=>{if(!owns(r.id))return;const q=r.chatRoom.queued||[];if(!q.length)return;const st=queueState(r.id),held=st.can||HOLD_CODES.includes(st.code)||r.status==='paused';
   const why=st.can?(st.steer?'Goes to the room when this round ends. Send now: the next speaker reads it, and nobody is interrupted.':'Goes to the room now.'):held?refusalWords(st.code):'Not sent: '+notSentWhy(st.code);
   q.forEach(e=>rows.push('<div class="pmx-room-queue-row" data-k="rq:'+escH(e.id)+'" data-run="'+escH(r.id)+'"'+(held?'':' data-state="not-sent"')+'>'+
    '<span class="pmx-room-queue-label">'+(held?'Queued':'Not sent')+'</span>'+
    '<span class="pmx-room-queue-text" data-hover-key="rq-text-'+escH(e.id)+'" data-hover-tip="'+escH('To the Chat Room · '+r.title+'|'+why)+'">'+escH(e.text)+'</span>'+
    '<span class="pmx-room-queue-acts">'+(held?'':'<button type="button" class="text-button pmx-room-queue-alt" data-action="room-queue-to-assistant" data-run="'+escH(r.id)+'" data-id="'+escH(e.id)+'">Send to the assistant instead</button>')+
    btn(e,r,'room-queue-edit','edit','Edit')+
    (held?btn(e,r,'room-queue-send-now','send',st.can?'Send now':'Send now|'+why,st.can?'':' disabled data-failure="'+escH(st.code||'')+'"'):'')+
    btn(e,r,'room-queue-discard','close','Remove')+'</span></div>'));});
  return rows.length?'<div class="pmx-room-queue" data-k="room-queue:'+escH(t.id)+'">'+rows.join('')+'</div>':'';
 }
 E.slot('composerBelow',c=>c&&c.position==='above'?queueRows(c):'');
 /* ---- motion on the card (5.5 M4, 8.3): the current speaker's words stream into the lane's kept island, and a
    marker travels from the finished speaker's mark to the next one's in the head cluster (320 move). Both are
    driven by real protocol events only (a new speaker), never by a loop; reduced motion shows the end state. */
 const speakerOf=new Map();
 function tokenMs(name,fallback){try{const v=getComputedStyle(document.body).getPropertyValue(name).trim();const n=parseFloat(v);return isFinite(n)?(/ms$/.test(v)?n:/s$/.test(v)?n*1000:n):fallback;}catch(e){return fallback;}}
 function travel(card,runId,from,to){
  const P=PMXo(),a=card.querySelector('[data-k="cm:'+runId+':'+from+'"]'),b=card.querySelector('[data-k="cm:'+runId+':'+to+'"]');
  if(!P||!a||!b||(P.reduced&&P.reduced()))return;
  const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();if(!ra.width||!rb.width)return;
  const el=document.createElement('i');el.className='pmx-room-marker';el.setAttribute('aria-hidden','true');
  el.style.left=Math.round(ra.left+ra.width/2-7)+'px';el.style.top=Math.round(ra.bottom+2)+'px';document.body.appendChild(el);
  const ease=(getComputedStyle(document.body).getPropertyValue('--pmx-ease-move')||'').trim()||'cubic-bezier(.65,0,.35,1)';
  const an=P.animate(el,[{transform:'translate(0,0)'},{transform:'translate('+Math.round(rb.left-ra.left)+'px,'+Math.round(rb.bottom-ra.bottom)+'px)'}],{duration:tokenMs('--pmx-t-move',320),easing:ease,fill:'forwards'});
  if(!an){el.remove();return;}an.onfinish=()=>el.remove();an.oncancel=()=>el.remove();
 }
 function afterApp(){
  /* every render hands every speaking island to the one pacer (PM56_PMX.stream keys by the island node, so the same
     island keeps streaming and a remounted one starts at the first start time, with the words already due) */
  const P=PMXo();
  document.querySelectorAll('.transcript .pmx-lane-l2 q[data-room-stream]').forEach(q=>{
   const island=q.parentElement,key=island&&island.getAttribute('data-k'),text=q.getAttribute('data-room-stream')||'';if(!island||!key||!text)return;
   const st=streamStart.get(key)||{at:nowMs(),ms:+q.getAttribute('data-ms')||STREAM_MS,text};if(!streamStart.has(key))streamStart.set(key,st);
   if(P&&P.stream)P.stream(island,text,{msPerWord:st.ms,startAt:st.at});else q.textContent=text;
  });
  document.querySelectorAll('.transcript .pmx-run[data-run-id][data-pmx-kind="chat_room"]').forEach(card=>{
   const id=card.getAttribute('data-run-id'),r=run(id);if(!owns(id))return;const f=roomFacts(r),cur=r.status==='running'&&f.speaker?f.speaker.id:null,prev=speakerOf.get(id);
   speakerOf.set(id,cur);if(prev&&cur&&prev!==cur)travel(card,id,prev,cur);
  });
 }
 if(PMXo()&&PMXo().after)PMXo().after((c,phase)=>{if(phase==='app')afterApp();});

 window.PM56_ROOM={owns,preflight,admit,envelope,beginRound,request,submit,canSend,receiveUser,summarize,finish,promotionRequest,validatePromotion,promote,inline,controls,documentHtml,exportTranscript,hash,
  sheetParts,cardParts,facts:id=>owns(id)?roomFacts(run(id)):null,waitingNoun:WAIT_NOUN,
  queued:id=>queued(id).map(e=>({id:e.id,text:e.text,participantId:e.participantId,at:e.at})),queueState,enqueue,steer,deliverQueued};
})();
