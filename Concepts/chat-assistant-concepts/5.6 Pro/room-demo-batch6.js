/* Chat Room recorded examples (Demo Studio). Pre-written replies, never live AI. The guide is the one
   recorded-example look (pmxGuide, 4.3 G-25): in the dock under the composer, or as the first row of the room
   document. It narrates what is happening and what comes next; the run's own controls stay on the card and in the
   room document (one control set, 7.12).
   Playback (2026-10-21, Jared: "keeps asking me to click Next Round ... I thought it would be automated"; then his
   decision that a Chat Room runs its rounds by itself): the room itself opens round 1 at Start and starts each next
   round (room-protocol.js, AUTOMATIC ROUNDS); this file supplies the recorded replies, each streamed and then held on
   screen long enough to read. Both examples play every round with no click after Start and stop where a real room
   waits: "This room used all its rounds" (the discussion: Summarize Now, End discussion, then a promotion; the plan:
   everyone answered once and the Moderator summed it up, so you promote the summary). The examples keep Pause between
   rounds off; the discussion's guide says once that you can turn it on. */
(function(){
 'use strict';const E=window.PM56_EXT,C=window.PM56_COLLAB,W=window.PM56_ROOM,S=window.PM56_SHELL,clone=x=>JSON.parse(JSON.stringify(x));let active=null,serial=0;const clocks=new Map(),turns=new Map();
 const flows={discussion:{label:'Talk it through, then keep one idea',detail:'Two rounds with the Moderator guiding. You can message the room, then promote one message to a To-Do.',target:'todo'},
  plan:{label:'Turn the conclusion into a Plan',detail:'Everyone answers once, the Moderator sums up, and you promote the summary to a Plan.',target:'plan'}};
 const fixture=()=>({topic:'Make search easier to reach',summary:'Keep a visible Search button. Offer / as an optional shortcut and ignore editable inputs.',rounds:[
  ['Keep a visible Search button so the feature remains discoverable.','A / shortcut is useful for frequent users, but should stay optional.','Avoid triggering the shortcut while someone is typing in an input.'],
  ['Keep the Search button unchanged; the shortcut is an optional second route.','Remember the shortcut preference without removing the visible Search button.','Add tests that keep / literal inside editable text inputs.']
 ]});
 /* pacing of the recorded turns: the words stream at MS_WORD a word (as before), the whole reply then stays on screen
    for HOLD so it can be read, then it lands and the next helper speaks */
 const MS_WORD=70,HOLD=3600,ms=v=>{const K=window.PM56_CLOCK;return K&&K.ms?K.ms(v):v;};
 function current(){if(!active)return null;let r=active.runId?C.run(active.runId):C.runsForThread(active.threadId).find(r=>W.owns(r.id));if(r)active.runId=r.id;return r;}
 function configure(){if(!active)return;C.openConfigure('chat_room');const d=C.draft();d.name='Make search easier to reach';d.nameEdited=true;d.purpose='How should people reach search: a visible button, a keyboard shortcut, or both?';d.rows=d.rows.slice(0,3);d.rows.forEach((r,i)=>{r.role=['Product','Design','Engineering'][i];r.persona=['Product Manager','Architect','Implementer'][i];});d.config.participantCount=3;d.config.turnPolicy=active.kind==='plan'?'ask_everyone_once':'moderated';d.config.maxRounds=active.kind==='plan'?1:2;d.roomInput=fixture();d.wonderer=false;d.grillMe=false;if(C.markRecorded)C.markRecorded(d);E.ctx().openDialog({type:'collab-configure'});}
 function stop(id){const t=clocks.get(id);if(t)clearTimeout(t);clocks.delete(id);turns.delete(id);}
 function start(kind){if(!flows[kind])return;const c=E.ctx(),old=current();if(old){stop(old.id);if(['running','paused'].includes(old.status)){const b=document.createElement('button');b.dataset.run=old.id;E.run('collab-cancel',b,new Event('click'));}}
  const id='room-demo-'+kind+'-'+(++serial),t=clone(c.state.threads.find(t=>t.id==='plain')||c.state.threads[0]);Object.assign(t,{id,title:flows[kind].label+' · recorded example',goalId:null,status:'ready',pinned:false,archived:false,messages:[{id:id+'-seed',role:'user',type:'text',body:'Talk through how to make search easier to reach. Don’t create any work until I pick something.'}]});c.state.threads.push(t);
  Object.assign(c.state,{mode:'Ask',demoOpen:false,menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:''});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};window.PM56_RUNTIME.composer.destination=null;active={kind,threadId:id,runId:null,events:[],errors:[]};c.switchThread(id);configure();
 }
 /* freeze(id) is a QA hook: it holds the recorded clock mid-turn so a lint can read the speaking face (pmx-verify) */
 /* the recorded turn in progress: who is speaking and the words they will say (the room document streams them) */
 function nextTurn(r){const round=r.chatRoom.round;if(!round||round.complete)return null;const pid=round.participantIds.find(pid=>!round.messages.some(mid=>r.messages.find(m=>m.id===mid)?.senderId===pid));if(!pid)return null;const slot=r.participants.findIndex(p=>p.id===pid);return {pid,slot,text:(r.chatRoom.input.rounds[round.number-1]||[])[slot]||''};}
 function play(id){const r=C.run(id);if(!W.owns(id)||clocks.has(id)||!r.chatRoom.round||r.chatRoom.round.complete)return;const owner=active,round=r.chatRoom.round;
  /* a paused room (Pause holds at the turn boundary) arms no speaker until it is resumed */
  function arm(){if(r.status==='paused'){turns.delete(id);clocks.set(id,setTimeout(()=>{clocks.delete(id);arm();},ms(150)));return;}if(r.status!=='running'){turns.delete(id);return;}
   const t=nextTurn(r);if(!t){turns.delete(id);return;}turns.set(id,{pid:t.pid,text:t.text,msPerWord:MS_WORD});const words=t.text.split(/\s+/).filter(Boolean).length;clocks.set(id,setTimeout(next,ms(words*MS_WORD+HOLD)));}
  /* Pause holds the turn; after Resume the reply stays on screen a beat before it lands */
  let held=false;
  function next(){clocks.delete(id);if(!C.run(id)||C.run(id)!==r||r.status==='canceled'||r.status==='completed'){turns.delete(id);return;}if(r.status==='paused'){held=true;clocks.set(id,setTimeout(next,ms(120)));return;}
   if(held){held=false;clocks.set(id,setTimeout(next,ms(1500)));return;}
   const t=nextTurn(r);if(!t){turns.delete(id);return;}const x=W.request(id,t.pid);if(!x){turns.delete(id);return;}const result=W.submit(id,{...x,body:t.text});
   if(!result.ok){turns.delete(id);if(owner)owner.errors.push(result.error);E.ctx().renderApp();return;}if(owner)owner.events.push({round:round.number,participantId:t.pid,messageId:result.messageId});
   if(!round.complete)arm();else turns.delete(id);E.ctx().renderApp();
  }
  arm();E.ctx().renderApp();
 }
 document.addEventListener('pm56:room-round',e=>play(e.detail.runId));
 /* what is happening and what comes next, in plain words. Where the room waits for you, the guide says so and names
    the control on the card; it never takes the step for you. */
 function step(r){
  const target=flows[active.kind].target,word=target==='plan'?'Plan':'To-Do';
  if(!r)return {text:'Set up the room: three helpers, the Moderator guides, and '+(active.kind==='plan'?'one round.':'two rounds.')+' Press Start and the recording plays.',act:{action:'room-demo-configure',label:'Set up the room'}};
  if(['canceled','failed'].includes(r.status))return {text:'This discussion ended. Replay starts a fresh one.',replay:true};
  const s=r.chatRoom,done=r.status==='completed',max=r.config.turnPolicy==='ask_everyone_once'?1:+r.config.maxRounds;
  if(s.promotions.length)return {text:'Your '+word+' is ready. It keeps a link back to the message it came from.',replay:true};
  if(done)return {text:'The discussion ended, and nothing was created. If you want a '+word+', promote the summary.',replay:true};
  if(r.status==='paused')return {text:'Paused. Resume it from the card’s More menu: the rounds go on from there.'};
  if(s.pausing)return {text:'Pausing: the helper speaking now finishes first, then the room holds.'};
  if(!s.round)return {text:'The room is starting. Round 1 opens in a moment.'};
  const why=W.waitsFor?W.waitsFor(r):null,n=s.roundsSoFar,summed=!!(s.summary&&s.summary.round===s.roundsSoFar);
  if(!s.round.complete){const base='Round '+s.round.number+' of '+max+'. Each helper speaks once, in turn, and reads what came before.';
   /* the discussion says once that the rounds can wait for you (the switch stays off in the example) */
   return {text:active.kind==='discussion'&&s.round.number===1?base+' The rounds run one after another; to have the room wait for you after each one, turn on Pause between rounds on the card.':base+' Talking changes nothing in your project.'};}
  if(!why)return {text:s.after||(max===1&&!summed)?'Round '+n+' is done. The Moderator is summing it up.':'Round '+n+' is done. Round '+(n+1)+' starts by itself in a moment.'};
  if(why==='between'||why==='message')return {text:'Round '+n+' is done. Pause between rounds is on, so the room waits for you: press Next Round for round '+(n+1)+', or Summarize Now.'};
  if(why==='summed')return {text:'The Moderator summed it up. Your move: End discussion, or Next Round to keep going.'};
  if(max===1)return {text:'Everyone answered once and the Moderator summed it up. Your move: promote the summary to a '+word+'. Nothing was created until you do.'};
  if(!summed)return {text:'That was the last round, so the room waits for you now: Summarize Now has the Moderator sum it up; End discussion ends it.'};
  return {text:'The Moderator summed it up. Press End discussion when you are done. Nothing becomes a To-Do or Plan by itself.'};
 }
 function guide(c,inEditor=false){if(!active||c.state.selectedThread!==active.threadId||c.state.dialog)return '';const r=current();if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const st=step(r),acts=[];if(st.act)acts.push({action:st.act.action,label:st.act.label});if(st.replay)acts.push({action:'room-demo-replay',label:'Replay'});
  return S.pmxGuide({key:inEditor?'room-demo-guide:doc':'room-demo-guide',cls:'room-demo-guide'+(acts.length>1?' room-demo-guide-stack':''),placement:inEditor?'doc':'dock',step:c.esc(st.text),actions:acts,close:{action:'room-demo-close',label:'Close guide'}});
 }
 E.slot('composerBelow',c=>guide(c));E.action('room-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('room-demo-configure',()=>{configure();return true;});E.action('room-demo-replay',()=>{if(active)start(active.kind);return true;});E.action('room-demo-close',()=>{active=null;E.ctx().renderApp();return true;});
 /* room-demo-step stays as a QA hook: it presses the control the room waits on, as you would (the guide never shows it) */
 function waitsOn(r){const why=r&&W.waitsFor?W.waitsFor(r):null;if(!why)return null;const s=r.chatRoom;
  if(why==='between'||why==='message')return 'collab-room-next-round';return s.summary&&s.summary.round===s.roundsSoFar?'room-finish':'collab-room-summarize';}
 E.action('room-demo-step',(c)=>{if(!active)return true;const r=current(),a=waitsOn(r);if(!a)return true;const b=document.createElement('button');b.dataset.action=a;b.dataset.run=r.id;E.run(a,b,new Event('click'));c.renderApp();return true;});
 E.chainAction('reset-all',()=>{for(const id of [...clocks.keys()])stop(id);turns.clear();active=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start','wg-demo-start','b13-start'].forEach(n=>E.chainAction(n,()=>{active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Chat Room recorded examples</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="room-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+old(c);
 window.PM56_ROOM_DEMOS={start,configure,fixture,play,pace:{msPerWord:MS_WORD,hold:HOLD},speaking:id=>turns.get(id)||null,freeze:id=>{const t=clocks.get(id);if(t)clearTimeout(t);clocks.set(id,0);},snapshot:()=>active?clone({...active,runId:current()?.id||null}):null,editorGuide:id=>current()?.id===id?guide(E.ctx(),true):''};
})();
