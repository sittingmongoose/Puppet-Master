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
 const view=new Map();
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
  s.summary=null;
  addressed.forEach(id=>{const p=r.participants.find(p=>p.id===id);p.status='waiting';p.current='Awaiting moderated turn';});
  return {ok:true,round:s.round.number};
 }
 function request(id,pid){const r=run(id),s=r?.chatRoom,p=r?.participants.find(p=>p.id===pid);if(!s?.round||s.round.complete||!p||!s.round.participantIds.includes(pid))return null;
  return {...envelope(id),round:s.round.number,participantId:pid,assignmentRevision:p.assignmentRevision,replyTo:s.round.replyTo,requestId:id+':'+s.round.number+':'+pid};}
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
  m.roomRound=round.number;m.assignmentRevision=p.assignmentRevision;freeze(m);round.messages.push(m.id);
  s.operationResults[x.requestId]={signature:stable(x),messageId:m.id};p.status='waiting';p.current='Turn delivered';
  if(round.messages.length===round.participantIds.length){round.complete=true;s.roundsSoFar=round.number;}
  return {ok:true,messageId:m.id,roundComplete:round.complete};
 }
 function canSend(id,dest){const r=run(id);if(!owns(id))return fail('room_missing');if(r.status!=='running')return fail('room_ended_or_paused');if(r.chatRoom.round&&!r.chatRoom.round.complete)return fail('finish_current_round');if(r.config.turnPolicy==='ask_everyone_once'&&r.chatRoom.roundsSoFar>=1||r.chatRoom.roundsSoFar>=+r.config.maxRounds)return fail('round_limit_reached');if(dest?.participantId&&!r.participants.some(p=>p.id===dest.participantId))return fail('participant_missing');return {ok:true};}
 function receiveUser(id,message,buffer,thread){
  const r=run(id),dest=buffer.destination,check=canSend(id,dest);if(!check.ok)return check;
  if(thread.id!==r.threadId)return fail('wrong_thread');
  const prior=r.messages.find(m=>m.id===message.id);if(prior)return prior.body===message.body?{ok:true,reused:true}:fail('conflicting_user_message');
  const ids=dest.participantId?[dest.participantId]:r.participants.map(p=>p.id);
  const ref=C.appendMessage(id,{id:message.id,senderKind:'user',senderName:'You',body:message.body,recipientIds:ids,createdAt:message.sentAt});
  Object.assign(message,ref);r.messages[r.messages.length-1]=message;
  r.chatRoom.summary=null;r.chatRoom.lastUserMessageId=message.id;r.chatRoom.pendingRecipientIds=ids;
  r.chatRoom.deliveries.push({messageId:message.id,recipientIds:ids.slice()});return {ok:true,messageId:message.id};
 }
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
 function inline(c,r){return '<p class="collab-sub">'+r.chatRoom.roundsSoFar+' round'+(r.chatRoom.roundsSoFar===1?'':'s')+' · '+r.participants.length+' participants'+(r.chatRoom.promotions.length?' · '+r.chatRoom.promotions.length+' promoted':'')+'</p>'+controls(c,r);}
 const labels={moderated:'Moderated discussion',ask_everyone_once:'Ask everyone once'};
 function documentHtml(c,id){const r=run(id);if(!owns(id))return '';const s=r.chatRoom,v=view.get(id)||{},esc=c.esc,selected=r.messages.find(m=>m.id===v.selected);
  const messages=r.messages.filter(m=>m.senderKind!=='system').map(m=>'<section class="room-message '+(v.selected===m.id?'selected':'')+'" data-room-message="'+esc(m.id)+'"><header><button class="text-button" data-action="'+(m.senderKind==='participant'?'collab-open-participant':'room-select-message')+'" data-run="'+esc(id)+'" data-participant="'+esc(m.senderId||'')+'" data-message="'+esc(m.id)+'">'+esc(m.senderName)+'</button><small>'+esc(m.senderKind==='user'?'You':m.roomConclusion?'Conclusion':('Round '+m.roomRound))+'</small></header><p>'+esc(m.body)+'</p>'+(m.replyTo?'<small>Reply to your message</small>':'')+(['participant','coordinator'].includes(m.senderKind)?'<button class="text-button room-select" data-action="room-select-message" data-run="'+esc(id)+'" data-message="'+esc(m.id)+'">'+(v.selected===m.id?'Selected':'Select message')+'</button>':'')+'</section>').join('');
  const live=r.status==='running',pending=s.round&&!s.round.complete,max=r.config.turnPolicy==='ask_everyone_once'?1:+r.config.maxRounds;
  const actions=live?'<button class="soft-button" data-action="collab-room-next-round" data-run="'+esc(id)+'"'+(pending||s.roundsSoFar>=max?' disabled':'')+'>'+(s.roundsSoFar?'Next Round':'Ask Everyone')+'</button><button class="soft-button" data-action="collab-room-summarize" data-run="'+esc(id)+'"'+(!s.round?.complete?' disabled':'')+'>Summarize Now</button><button class="text-button" data-action="room-finish" data-run="'+esc(id)+'"'+(!s.summary?' disabled':'')+'>Finish discussion</button>':'';
  const promotion=selected&&['participant','coordinator'].includes(selected.senderKind)?'<section class="room-promotion"><strong>Selected message</strong><p>'+esc(selected.body)+'</p><div><button class="soft-button" data-action="room-promote" data-target="todo" data-run="'+esc(id)+'" data-message="'+esc(selected.id)+'">Create To-Do</button><button class="soft-button" data-action="room-promote" data-target="plan" data-run="'+esc(id)+'" data-message="'+esc(selected.id)+'">Create Plan</button></div></section>':'';
  const promoted=s.promotions.map(p=>'<button class="soft-button" data-action="room-open-promotion" data-run="'+esc(id)+'" data-key="'+esc(p.key)+'">Open '+(p.target==='plan'?'Plan':'To-Do')+'</button>').join('');
  return '<article class="editor-doc room-document" data-room-run="'+esc(id)+'">'+(window.PM56_ROOM_DEMOS?.editorGuide(id)||'')+'<div class="room-meta"><span>Chat Room · '+esc(r.status)+'</span><span>'+esc(labels[s.turnPolicy])+'</span></div><h1>'+esc(r.title)+'</h1><p>'+esc(r.purpose)+'</p><div class="room-controls">'+actions+(live?'<button class="text-button" data-action="collab-message" data-run="'+esc(id)+'">Message room</button>':'')+'<button class="text-button" data-action="room-export" data-run="'+esc(id)+'">Export transcript</button></div>'+messages+promotion+'<div class="room-controls">'+promoted+'</div><p class="room-provenance">Recorded discussion · no provider calls · promotion is explicit</p></article>';
 }
 E.chainAction('collab-modal-commit',(c)=>{const d=C.draft();if(d?.kind!=='chat_room'||!d.roomInput)return false;const ok=preflight(d);if(ok.ok)return false;d.lastFailure={error:ok.error,message:'Nothing started. Keep three participants and a supported recorded turn policy.'};c.renderOverlays();return true;});
 E.chainAction('collab-room-next-round',(c,b)=>{if(!owns(b.dataset.run))return false;const x=beginRound(b.dataset.run,envelope(b.dataset.run));if(x.ok)document.dispatchEvent(new CustomEvent('pm56:room-round',{detail:{runId:b.dataset.run}}));else c.toast('Round not started',x.error);c.renderApp();return true;});
 E.chainAction('collab-room-summarize',(c,b)=>{if(!owns(b.dataset.run))return false;const x=summarize(b.dataset.run);if(!x.ok)c.toast('Summary not ready',x.error);c.renderApp();return true;});
 E.action('room-finish',(c,b)=>{const x=finish(b.dataset.run);if(!x.ok)c.toast('Not ready',x.error);c.renderApp();return true;});
 E.action('room-select-message',(c,b)=>{if(!owns(b.dataset.run))return true;view.set(b.dataset.run,{...view.get(b.dataset.run),selected:b.dataset.message});c.renderApp();return true;});
 E.chainAction('collab-open-panel',(c,b)=>{if(!owns(b.dataset.run)||b.classList.contains('ab-row'))return false;c.closeDialog();c.closeMenu();c.state.editorRevealed=true;c.openEditor('room:'+b.dataset.run);return true;});
 E.chainAction('collab-open-configure',(c,b)=>{const r=run(b.dataset.reconfigure);if(!owns(r?.id))return false;if(['running','paused'].includes(r.status)){c.toast('Keep the current discussion','Finish or cancel before starting another configuration.');return true;}if(c.state.selectedThread!==r.threadId)c.switchThread(r.threadId);C.openConfigure('chat_room',r.id);const d=C.draft();d.reconfigureRunId=null;d.roomInput=clone(r.chatRoom.input);c.openDialog({type:'collab-configure'});return true;});
 E.action('room-open-discussion',(c,b)=>{if(!owns(b.dataset.run))return true;if(b.dataset.message)view.set(b.dataset.run,{selected:b.dataset.message});c.closeDialog();c.closeMenu();c.state.editorRevealed=true;c.openEditor('room:'+b.dataset.run);if(b.dataset.message)requestAnimationFrame(()=>document.querySelector('[data-room-message="'+CSS.escape(b.dataset.message)+'"]')?.scrollIntoView({block:'center'}));return true;});
 E.action('room-promote',(c,b)=>{const x=promotionRequest(b.dataset.run,b.dataset.message,b.dataset.target),res=promote(x);if(!res.ok)c.toast('Nothing created',res.error);c.renderApp();return true;});
 E.action('room-open-promotion',(c,b)=>{const r=run(b.dataset.run),p=r?.chatRoom.promotions.find(p=>p.key===b.dataset.key);if(!p)return true;if(p.target==='plan'){c.state.editorRevealed=true;c.openEditor('plan:'+p.id);}else{if(c.state.selectedThread!==r.threadId)c.switchThread(r.threadId);c.state.activity.pinned=true;c.state.activity.open=true;c.state.activity.domain='todo';c.state.activity.scope='focus';c.state.activity.selected={domain:'todos',id:p.id};c.renderApp();}return true;});
 E.chainAction('collab-room-promote',(c,b)=>{if(!owns(b.dataset.run))return false;const x=promote(promotionRequest(b.dataset.run,b.dataset.message,b.dataset.target));if(!x.ok)c.toast('Nothing created',x.error);c.renderApp();return true;});
 function exportTranscript(id){const r=run(id);return owns(id)?JSON.stringify({kind:'chat_room',id:r.id,title:r.title,definitionRevision:r.definitionRevision,participants:r.participants.map(p=>({id:p.id,role:p.role,model:p.effectiveModelId,persona:p.effectivePersona})),messages:r.messages,promotions:r.chatRoom.promotions},null,2):null;}
 E.action('room-export',(c,b)=>{const text=exportTranscript(b.dataset.run);if(!text)return true;const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='chat-room.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);return true;});
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('room:')?'Chat Room':'');E.slot('editorDocument',c=>c.editorId?.startsWith('room:')?documentHtml(c,c.editorId.slice(5)):'');
 RT.composer.preSendHooks.unshift((c,t,raw)=>{const d=RT.composer.bufferFor(t.id).destination||RT.composer.destination;if(!d||!owns(d.refId))return false;const ok=canSend(d.refId,d);if(ok.ok&&run(d.refId).threadId===t.id)return false;c.toast('Message retained',ok.error||'wrong_thread');return {claimed:true,preserveComposer:true};});
 E.chainAction('reset-all',()=>{view.clear();return false;});
 window.PM56_ROOM={owns,preflight,admit,envelope,beginRound,request,submit,canSend,receiveUser,summarize,finish,promotionRequest,validatePromotion,promote,inline,controls,documentHtml,exportTranscript,hash};
})();
