/* B08 gallery-only verified boundary and locked-teaching workflows (recorded examples: no AI is contacted).
   The guide is the shared pmxGuide (G-25, class memory-demo-guide kept for the demo hooks); it hides while a
   dialog is open. The verified flow's final reply carries the memory tick ("Verified: label checks pass (3/3)");
   the locked flow ends with the one memory line the chat ever shows, a suggested change to a locked rule. */
(function(){
 'use strict';const E=window.PM56_EXT,M=window.PM56_AUTO_MEMORY,T=window.PM56_TEACH,S=window.PM56_SHELL,clone=x=>JSON.parse(JSON.stringify(x));let active=null,seq=0;
 const rule='Edit the source, rebuild generated output, and compare it before publishing.';
 const corrected='Edit the source, rebuild generated output, compare it, and run the label-order checks before publishing.';
 const flows={verified:{title:'A note a test proves',detail:'Run three checks, finish the reply, then change the file and watch the note go out of date.'},locked:{title:'Your rule stays yours',detail:'A note suggests changing a locked rule. Nothing changes until you decide.'}};
 function start(kind){if(!flows[kind])return;const c=E.ctx(),id='memory-demo-'+kind+'-'+(++seq),t=clone(c.state.threads.find(t=>t.id==='plain')||c.state.threads[0]);Object.assign(t,{id,title:flows[kind].title+' · recorded example',projectId:'concept:memory:'+seq,pinned:false,archived:false,goalId:null,messages:[{id:id+'-user',role:'user',type:'text',body:kind==='verified'?'Check that labels sort correctly, and only remember what the tests prove.':rule},{id:id+'-assistant',role:'assistant',type:'text',body:kind==='verified'?'This example runs three small label-sorting checks. They prove those three cases and nothing more.':'Save this as a rule first. An automatic note can’t replace a rule you locked.'}]});c.state.threads.push(t);Object.assign(c.state,{mode:'Ask',menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:''});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,started:false,completed:false,elapsed:0};window.PM56_RUNTIME.composer.destination=null;active={kind,threadId:id,runId:null,sourceId:null,gistId:null,teachingId:null,invalidated:false};c.switchThread(id);c.renderApp();}
 function invoke(action,ds={}){const b=document.createElement('button');Object.assign(b.dataset,ds);return E.run(action,b,new Event('click'));}
 function checks(){if(!active||active.runId)return;const s=M.source({path:'label-order.config.json',body:JSON.stringify({trim:true,caseSensitive:false})});active.sourceId=s.id;const r=M.begin({sourceId:s.id});active.runId=r.id;const out=M.execute(r.id);if(!out.ok)throw Error(out.error);const c=E.ctx();c.thread.messages.push({id:active.threadId+'-checks',role:'system',type:'info',title:'Label-sorting checks · '+out.evidence.passed+' of '+out.evidence.total+' passed',detail:'Recorded example: three sample label lists.'});c.renderApp();}
 function end(){if(!active||active.gistId)return;const c=E.ctx();if(active.kind==='locked'&&!active.runId){const t=T.preview().items[0];if(!t)return;c.state.composer='';active.teachingId=t.id;active.runId=M.begin({teachingId:t.id,proposal:'Skip comparing generated output before publishing.'}).id;}
  if(!active.runId)return;const out=M.finish(active.runId);if(!out.ok)throw Error(out.error);active.gistId=out.id;M.markRecorded(out.id);
  const mid=active.threadId+'-end';
  c.thread.messages.push({id:mid,role:'assistant',type:'text',body:active.kind==='verified'?'All three label-sorting checks pass. I’ll remember only what they proved.':'I noticed a possible change to your rule. It waits for you in Memory, and your rule hasn’t changed.'});
  if(active.kind==='verified')M.link(mid,out.id);
  else c.thread.messages.push({id:active.threadId+'-proposal',role:'system',type:'af-memory-proposal',gistId:out.id,ruleText:rule,time:new Date().toISOString()});
  c.renderApp();}
 function step(){
  const t=T.preview().items,see={action:'memory-open',attrs:'data-id="'+S.esc(active.gistId||'')+'"',label:'See the note'};
  if(active.kind==='verified'){
   if(!active.runId)return {step:'Step 1 of 3 · Run three small label-sorting checks.',actions:[{action:'memory-demo-checks',label:'Run the checks'}]};
   if(!active.gistId)return {step:'Step 2 of 3 · Finish the reply. Only what the checks proved is remembered.',actions:[{action:'memory-demo-finish',label:'Finish the reply'}]};
   if(!active.invalidated)return {step:'Step 3 of 3 · The note is verified. Change the file to watch it go out of date, with no noise in the chat.',actions:[{action:'memory-demo-change',label:'Change the file'},see]};
   return {step:'Done · The note quietly left your next message.',actions:[see,{action:'memory-demo-replay',label:'Replay'}]};
  }
  if(!t.length&&!active.teachingId)return {step:'Step 1 of 2 · Save the rule first, so an automatic note can’t replace it.',actions:[{action:'memory-demo-teach',label:'Save the rule…'}]};
  if(!active.gistId)return {step:'Step 2 of 2 · Finish the reply. Its note suggests changing your rule.',actions:[{action:'memory-demo-finish',label:'Finish the reply'}]};
  return {step:'Done · The suggestion waits for you in Memory.',actions:[{action:'af-memory-open',attrs:'data-id="'+S.esc(active.gistId)+'"',label:'Review'},{action:'memory-demo-replay',label:'Replay'}]};
 }
 function guide(c,inEditor=false){if(!active||c.thread.id!==active.threadId||c.state.dialog)return '';if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const s=step();return S.pmxGuide({key:'memory-guide',cls:'memory-demo-guide',placement:inEditor?'doc':'dock',step:s.step,actions:s.actions,close:{action:'memory-demo-close',label:'Close guide'}});}
 E.slot('composerBelow',c=>guide(c));
 E.action('memory-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('memory-demo-checks',()=>{checks();return true;});E.action('memory-demo-finish',()=>{end();return true;});
 E.action('memory-demo-change',()=>{if(active){M.invalidate(active.sourceId,JSON.stringify({trim:false,caseSensitive:false}));active.invalidated=true;E.ctx().renderApp();}return true;});
 E.action('memory-demo-teach',()=>{T.open({text:rule,scope:'project',sourceMessageId:active.threadId+'-user'});return true;});
 E.action('memory-demo-replay',()=>{if(active)start(active.kind);return true;});E.action('memory-demo-close',()=>{active=null;E.ctx().renderApp();return true;});
 /* a rule saved inside this recorded example is a recorded record too (IMPACT A3-03) */
 document.addEventListener('pm56:teach-committed',e=>{if(active&&e.detail.threadId===active.threadId)T.markRecorded?.(e.detail.id);});
 E.chainAction('reset-all',()=>{active=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start','room-demo-start','teach-demo-start'].forEach(a=>E.chainAction(a,()=>{active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,prev=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Memory · recorded examples</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="memory-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.title)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+prev(c);
 window.PM56_MEMORY_DEMOS={start,checks,end,guide,rule,corrected,snapshot:()=>active?clone(active):null};
})();
