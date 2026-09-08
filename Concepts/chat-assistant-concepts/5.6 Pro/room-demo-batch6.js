/* Explicit gallery-only recorded discussions. No live provider/research claims. */
(function(){
 'use strict';const E=window.PM56_EXT,C=window.PM56_COLLAB,W=window.PM56_ROOM,clone=x=>JSON.parse(JSON.stringify(x));let active=null,serial=0;const clocks=new Map();
 const flows={discussion:{label:'Discuss, then choose an action',detail:'Two moderated rounds; message the room; explicitly create one To-Do.'},plan:{label:'Turn a conclusion into a Plan',detail:'Ask each participant once; finish discussion; explicitly promote the conclusion.'}};
 const fixture=()=>({topic:'Make search easier to reach',summary:'Keep a visible Search button. Offer / as an optional shortcut and ignore editable inputs.',rounds:[
  ['Keep a visible Search button so the feature remains discoverable.','A / shortcut is useful for frequent users, but should stay optional.','Avoid triggering the shortcut while someone is typing in an input.'],
  ['Keep the Search button unchanged; the shortcut is an optional second route.','Remember the shortcut preference without removing the visible Search button.','Add tests that keep / literal inside editable text inputs.']
 ]});
 function current(){if(!active)return null;let r=active.runId?C.run(active.runId):C.runsForThread(active.threadId).find(r=>W.owns(r.id));if(r)active.runId=r.id;return r;}
 function configure(){if(!active)return;C.openConfigure('chat_room');const d=C.draft();d.name='Make search easier to reach';d.purpose='Discuss a visible entry and an optional shortcut.';d.rows=d.rows.slice(0,3);d.rows.forEach((r,i)=>r.role=['Product','Design','Engineering'][i]);d.config.participantCount=3;d.config.turnPolicy=active.kind==='plan'?'ask_everyone_once':'moderated';d.config.maxRounds=active.kind==='plan'?1:2;d.roomInput=fixture();d.wonderer=false;d.grillMe=false;E.ctx().openDialog({type:'collab-configure'});}
 function stop(id){const t=clocks.get(id);if(t)clearTimeout(t);clocks.delete(id);}
 function start(kind){if(!flows[kind])return;const c=E.ctx(),old=current();if(old){stop(old.id);if(['running','paused'].includes(old.status)){const b=document.createElement('button');b.dataset.run=old.id;E.run('collab-cancel',b,new Event('click'));}}
  const id='room-demo-'+kind+'-'+(++serial),t=clone(c.state.threads.find(t=>t.id==='plain')||c.state.threads[0]);Object.assign(t,{id,title:flows[kind].label+' · recorded example',goalId:null,status:'ready',pinned:false,archived:false,messages:[{id:id+'-seed',role:'user',type:'text',body:'Discuss how to make search easier to reach. Do not create work until I choose a message.'}]});c.state.threads.push(t);
  Object.assign(c.state,{mode:'Ask',demoOpen:false,menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:''});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};window.PM56_RUNTIME.composer.destination=null;active={kind,threadId:id,runId:null,events:[],errors:[]};c.switchThread(id);configure();
 }
 function play(id){const r=C.run(id);if(!W.owns(id)||clocks.has(id)||!r.chatRoom.round||r.chatRoom.round.complete)return;const owner=active,round=r.chatRoom.round;
  function next(){clocks.delete(id);if(!C.run(id)||C.run(id)!==r||r.status==='canceled'||r.status==='completed')return;if(r.status==='paused'){clocks.set(id,setTimeout(next,120));return;}
   const pid=round.participantIds.find(pid=>!round.messages.some(mid=>r.messages.find(m=>m.id===mid)?.senderId===pid));if(!pid)return;
   const slot=r.participants.findIndex(p=>p.id===pid),x=W.request(id,pid);if(!x)return;const result=W.submit(id,{...x,body:r.chatRoom.input.rounds[round.number-1][slot]});
   if(!result.ok){if(owner)owner.errors.push(result.error);return;}if(owner)owner.events.push({round:round.number,participantId:pid,messageId:result.messageId});E.ctx().renderApp();if(!round.complete)clocks.set(id,setTimeout(next,650));
  }clocks.set(id,setTimeout(next,650));
 }
 document.addEventListener('pm56:room-round',e=>play(e.detail.runId));
 function guide(c,inEditor=false){if(!active||c.state.selectedThread!==active.threadId||c.state.dialog)return '';const r=current();if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  let text=!r?'Configure three participants to begin.':!r.chatRoom.round?'Open the discussion and choose Ask Everyone.':!r.chatRoom.round.complete?'Each participant takes one turn. Discussion creates no work.':r.status==='completed'?'Select a message, then explicitly create a '+(active.kind==='plan'?'Plan.':'To-Do.'):!r.chatRoom.summary?(active.kind==='discussion'&&r.chatRoom.roundsSoFar===1?'Message the room, then choose Next Round.':'Choose Summarize Now, then finish discussion.'):'Finish discussion. Nothing is created automatically.';
  const ready=!!r?.chatRoom.promotions.length;if(ready)text='Open the promoted '+(active.kind==='plan'?'Plan':'To-Do')+'; its source remains in this discussion.';
  const ended=r&&['canceled','failed'].includes(r.status);if(ended)text='Discussion ended. Replay opens a fresh configuration.';
  return '<div class="room-demo-guide"><div><small>Recorded example · no provider calls</small><strong>'+c.esc(text)+'</strong></div><div>'+(!r?'<button class="soft-button" data-action="room-demo-configure">Configure</button>':'')+(ready||ended?'<button class="soft-button" data-action="room-demo-replay">Replay</button>':'')+'<button class="icon-button" data-action="room-demo-close" title="Close guide">'+c.icon('close',12)+'</button></div></div>';
 }
 E.slot('composerBelow',c=>guide(c));E.action('room-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('room-demo-configure',()=>{configure();return true;});E.action('room-demo-replay',()=>{if(active)start(active.kind);return true;});E.action('room-demo-close',()=>{active=null;E.ctx().renderApp();return true;});
 E.chainAction('reset-all',()=>{for(const id of clocks.keys())stop(id);active=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start'].forEach(n=>E.chainAction(n,()=>{active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Guided Chat Room workflows</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="room-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+old(c);
 window.PM56_ROOM_DEMOS={start,configure,fixture,play,snapshot:()=>active?clone({...active,runId:current()?.id||null}):null,editorGuide:id=>current()?.id===id?guide(E.ctx(),true):''};
})();
