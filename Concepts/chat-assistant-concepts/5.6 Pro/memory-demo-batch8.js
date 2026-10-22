/* B08 gallery-only verified boundary and locked-teaching workflows (recorded examples: no AI is contacted).
   The guide is the shared pmxGuide (G-25, class memory-demo-guide kept for the demo hooks); it hides while a
   dialog is open. The verified flow's final reply carries the memory tick ("Verified: label checks pass (3/3)");
   the locked flow ends with the one memory line the chat ever shows, a suggested change to a locked rule.
   Playback (2026-10-22, Jared: recorded examples play on their own after Start): both examples play from Start through
   PM56_RECPLAY, paced so each moment stays on screen long enough to read. The checks run and the reply finishes by
   themselves; your part is played on the product's own controls (your message's More menu, Save as a rule…, Save rule)
   and the file change is played as yours. The locked example ends where the product waits for you: the suggestion's
   Review in the chat. The guide narrates what is happening and what comes next; its only buttons are Replay and Close. */
(function(){
 'use strict';const E=window.PM56_EXT,M=window.PM56_AUTO_MEMORY,T=window.PM56_TEACH,S=window.PM56_SHELL,R=window.PM56_RECPLAY,clone=x=>JSON.parse(JSON.stringify(x));let active=null,seq=0;
 const rule='Edit the source, rebuild generated output, and compare it before publishing.';
 const corrected='Edit the source, rebuild generated output, compare it, and run the label-order checks before publishing.';
 const flows={verified:{title:'A note a test proves',detail:'Run three checks, finish the reply, then change the file and watch the note go out of date.'},locked:{title:'Your rule stays yours',detail:'A note suggests changing a locked rule. Nothing changes until you decide.'}};
 function start(kind){if(!flows[kind])return;const c=E.ctx(),id='memory-demo-'+kind+'-'+(++seq),t=clone(c.state.threads.find(t=>t.id==='plain')||c.state.threads[0]);Object.assign(t,{id,title:flows[kind].title+' · recorded example',projectId:'concept:memory:'+seq,pinned:false,archived:false,goalId:null,messages:[{id:id+'-user',role:'user',type:'text',body:kind==='verified'?'Check that labels sort correctly, and only remember what the tests prove.':rule},{id:id+'-assistant',role:'assistant',type:'text',body:kind==='verified'?'This example runs three small label-sorting checks. They prove those three cases and nothing more.':'Save this as a rule first. An automatic note can’t replace a rule you locked.'}]});c.state.threads.push(t);Object.assign(c.state,{mode:'Ask',menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:''});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,started:false,completed:false,elapsed:0};window.PM56_RUNTIME.composer.destination=null;active={kind,threadId:id,runId:null,sourceId:null,gistId:null,teachingId:null,invalidated:false,running:false};c.switchThread(id);playback();c.renderApp();}
 function invoke(action,ds={}){const b=document.createElement('button');Object.assign(b.dataset,ds);return E.run(action,b,new Event('click'));}
 /* the checks' line in the chat: "running" first, then their result in the same line */
 function line(title){const c=E.ctx(),id=active.threadId+'-checks',m=c.thread.messages.find(m=>m.id===id);if(m){m.title=title;return;}c.thread.messages.push({id,role:'system',type:'info',title,detail:'Recorded example: three sample label lists.'});}
 function begin(){if(!active||active.runId||active.running)return;active.running=true;line('Label-sorting checks · running 3 checks…');E.ctx().renderApp();}
 function checks(){if(!active||active.runId)return;const s=M.source({path:'label-order.config.json',body:JSON.stringify({trim:true,caseSensitive:false})});active.sourceId=s.id;const r=M.begin({sourceId:s.id});active.runId=r.id;const out=M.execute(r.id);if(!out.ok)throw Error(out.error);active.running=false;line('Label-sorting checks · '+out.evidence.passed+' of '+out.evidence.total+' passed');E.ctx().renderApp();}
 function change(){if(active&&active.sourceId&&!active.invalidated){M.invalidate(active.sourceId,JSON.stringify({trim:false,caseSensitive:false}));active.invalidated=true;E.ctx().renderApp();}}
 function end(){if(!active||active.gistId)return;const c=E.ctx();if(active.kind==='locked'&&!active.runId){const t=T.preview().items[0];if(!t)return;c.state.composer='';active.teachingId=t.id;active.runId=M.begin({teachingId:t.id,proposal:'Skip comparing generated output before publishing.'}).id;}
  if(!active.runId)return;const out=M.finish(active.runId);if(!out.ok)throw Error(out.error);active.gistId=out.id;M.markRecorded(out.id);
  const mid=active.threadId+'-end';
  c.thread.messages.push({id:mid,role:'assistant',type:'text',body:active.kind==='verified'?'All three label-sorting checks pass. I’ll remember only what they proved.':'I noticed a possible change to your rule. It waits for you in Memory, and your rule hasn’t changed.'});
  if(active.kind==='verified')M.link(mid,out.id);
  else c.thread.messages.push({id:active.threadId+'-proposal',role:'system',type:'af-memory-proposal',gistId:out.id,ruleText:rule,time:new Date().toISOString()});
  c.renderApp();}
 /* the recording: next() names the next beat from the example's own state (PM56_RECPLAY), or nothing while it waits
    for you or has ended. Your part is pressed on the product's own control, lit first. */
 const PACE={first:1000,checks:2800,finish:6000,change:6500,more:1100,entry:1700,save:5200,locked:6200};
 const userMsg=()=>active.threadId+'-user',sheet=()=>E.ctx().state.dialog?.type==='af-teach';
 const moreOpen=()=>!!document.querySelector('.message[data-message-id="'+CSS.escape(userMsg())+'"] .pm-msg-overflow');
 const chrome=()=>'.message[data-message-id="'+CSS.escape(userMsg())+'"] .message-chrome';
 function next(){const a=active;if(!a)return null;
  if(a.kind==='verified'){
   if(!a.runId&&!a.running)return {id:'begin',wait:PACE.first,run:()=>{begin();return true;}};
   if(!a.runId)return {id:'checks',wait:PACE.checks,run:()=>{checks();return true;}};
   if(!a.gistId)return {id:'finish',wait:PACE.finish,run:()=>{end();return true;}};
   if(!a.invalidated)return {id:'change',wait:PACE.change,run:()=>{change();return true;}};
   return null;}
  if(!T.preview().items.length&&!a.teachingId){
   /* your part: your message's More menu, Save as a rule…, then Save rule on the sheet that opens */
   if(sheet())return {id:'save',dialog:'af-teach',wait:PACE.save,run:()=>R.press('#pmOverlayRoot .pmx-teach-sheet [data-action="af-teach-capture"]')};
   if(moreOpen())return {id:'entry',wait:PACE.entry,run:()=>R.press('.message[data-message-id="'+CSS.escape(userMsg())+'"] .pm-msg-overflow [data-action="teach-from-message"]')};
   return {id:'more',wait:PACE.more,run:()=>R.press('.message[data-message-id="'+CSS.escape(userMsg())+'"] [data-action="message-overflow"]',{reveal:chrome()})};}
  if(!a.gistId)return {id:'finish',wait:PACE.locked,run:()=>{end();return true;}};
  return null;}
 let player=null;
 function playback(){if(player)player.stop();const s=active;player=R.play({key:'memory-demo',live:()=>active===s,threads:()=>[s.threadId],next,render:()=>E.ctx().renderApp(),superseded:()=>{if(active===s)active=null;}});}
 function stop(){if(player){player.stop();player=null;}}
 function step(){
  const a=active,u=R.find('.message[data-message-id="'+CSS.escape(userMsg())+'"]');
  if(player&&player.errors.length)return {step:'This step couldn’t run, so the recording stopped here. Replay starts it again.',done:true};
  if(a.kind==='verified'){
   if(!a.runId&&!a.running)return {step:'The assistant is about to run three small label-sorting checks. It will remember only what they prove.'};
   if(!a.runId)return {step:'Running the three label-sorting checks on three sample label lists.'};
   if(!a.gistId)return {step:'All three checks passed. Next: the assistant finishes its reply and keeps a note of only what they proved.'};
   if(!a.invalidated)return {step:'The reply’s tick says Verified: label checks pass (3/3). Next: you change label-order.config.json, the file the checks read.'};
   return {step:'Done · You changed the file, so the note is out of date. It quietly left your next message, with no noise in the chat. The wand’s Memory shows it.',done:true};
  }
  if(!T.preview().items.length&&!a.teachingId){
   if(moreOpen())return {step:'Save as a rule… is in your message’s More menu. It opens Teach with your words.'};
   return {step:'Your message is a rule you want kept. Next: you save it as a rule from its More menu, so an automatic note can’t replace it.'};
  }
  if(!a.gistId)return {step:'Saved and locked. Next: the assistant finishes its reply, and its note suggests changing your rule.'};
  return {step:'Your move: the suggestion waits for you. Review on its line in the chat opens it in Memory; your rule hasn’t changed.',done:true,yours:true};
 }
 function guide(c,inEditor=false){if(!active||c.thread.id!==active.threadId||c.state.dialog)return '';if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const s=step(),text=R.steady(active,s.step,!!s.done,()=>E.ctx().renderApp());
  return S.pmxGuide({key:'memory-guide',cls:'memory-demo-guide',placement:inEditor?'doc':'dock',step:text,actions:s.done&&text===s.step?[{action:'memory-demo-replay',label:'Replay'}]:[],next:player&&player.progress(),close:{action:'memory-demo-close',label:'Close guide'}});}
 E.slot('composerBelow',c=>guide(c));
 /* memory-demo-checks/-finish/-change/-teach stay as QA hooks (pmx-surfaces); the guide never shows them */
 E.action('memory-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('memory-demo-checks',()=>{if(active&&!active.runId){begin();checks();}return true;});E.action('memory-demo-finish',()=>{end();return true;});
 E.action('memory-demo-change',()=>{change();return true;});
 E.action('memory-demo-teach',()=>{T.open({text:rule,scope:'project',sourceMessageId:active.threadId+'-user'});return true;});
 E.action('memory-demo-replay',()=>{if(active)start(active.kind);return true;});E.action('memory-demo-close',()=>{stop();active=null;E.ctx().renderApp();return true;});
 /* a rule saved inside this recorded example is a recorded record too (IMPACT A3-03) */
 document.addEventListener('pm56:teach-committed',e=>{if(active&&e.detail.threadId===active.threadId)T.markRecorded?.(e.detail.id);});
 E.chainAction('reset-all',()=>{stop();active=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start','room-demo-start','teach-demo-start'].forEach(a=>E.chainAction(a,()=>{stop();active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,prev=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Memory · recorded examples</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="memory-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.title)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+prev(c);
 window.PM56_MEMORY_DEMOS={start,checks,end,guide,rule,corrected,snapshot:()=>active?clone(active):null};
})();
