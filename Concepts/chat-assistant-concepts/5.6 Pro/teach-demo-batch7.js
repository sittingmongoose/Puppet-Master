/* B07 gallery: Teach recorded examples (no AI is contacted). The guide is the shared pmxGuide (G-25, class
   teach-demo-guide and key teach-guide kept for the demo hooks); it hides while a dialog is open and moves into the
   Your rules document when the editor covers the chat (<= 1100 px). Every step has a forward action, so a person (or
   pm.mjs drive()) can walk it without hunting for a menu. Rules saved here are marked recorded (IMPACT A3-03).
   Each recorded rule carries its check (owner answer E-36): the reply to "Ask a question" passes version 1's check
   ("Followed 1 of your rules") and misses the longer rule's compare step ("Missed 1 of your rules" + Ask for a fix). */
(function(){
 'use strict';const E=window.PM56_EXT,T=window.PM56_TEACH,S=window.PM56_SHELL,clone=x=>JSON.parse(JSON.stringify(x));let current=null,seq=0;
 const rule='Before changing a generated file, edit its source and rebuild the output.';
 const corrected='Before changing a generated file, edit its source, rebuild, and compare the generated output.';
 const flows={capture:{label:'Save a rule from a message',detail:'Save the assistant’s advice as a rule, see a reply follow it, then see what your next message includes.',advice:rule},
  correct:{label:'Edit a rule, then turn it off',detail:'Teach a rule with /teach, save version 2, then turn it off. The old version never comes back.',advice:rule},
  missed:{label:'When a reply misses your rule',detail:'Save a rule, see a reply that leaves part of it out, then ask for a fix. Nothing is sent until you press Send.',advice:corrected}};
 /* the checks the recorded rules carry: plain word cues (no AI), compared with the finished reply */
 T.registerCheck(rule,{statement:'When a reply is about a generated file, it says to edit the source and rebuild.',about:['generat*'],need:[['source*'],['build*','rebuild*','regenerat*']]});
 T.registerCheck(corrected,{statement:'When a reply is about a generated file, it says to edit the source, rebuild, and compare the generated output.',about:['generat*'],need:[['source*'],['build*','rebuild*','regenerat*'],['compar*','diff*']]});
 function start(kind){if(!flows[kind])return;const c=E.ctx(),id='teach-demo-'+kind+'-'+(++seq),t=clone(c.state.threads.find(t=>t.id==='plain')||c.state.threads[0]),at=new Date().toISOString();
  Object.assign(t,{id,title:flows[kind].label+' · recorded example',goalId:null,status:'ready',pinned:false,archived:false,projectId:'concept:teach-example:'+seq,messages:[{id:id+'-request',role:'user',type:'text',body:'Help me keep generated files consistent with their source.',time:at},{id:id+'-guidance',role:'assistant',type:'text',body:flows[kind].advice,time:at}]});
  c.state.threads.push(t);Object.assign(c.state,{mode:'Ask',menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:''});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};window.PM56_RUNTIME.composer.destination=null;
  current={kind,threadId:id,sourceId:id+'-guidance',ids:[],asked:false,opened:false,fixed:false};c.switchThread(id);c.renderApp();
 }
 document.addEventListener('pm56:teach-committed',e=>{if(current&&e.detail.threadId===current.threadId){current.ids.push(e.detail.id);T.markRecorded(e.detail.id);}});
 const thread=()=>E.ctx().state.threads.find(t=>t.id===current?.threadId);
 function ask(){if(!current||current.asked)return;const c=E.ctx(),t=thread();if(!t)return;const at=new Date().toISOString();
  t.messages.push({id:current.threadId+'-ask',role:'user',type:'text',body:'The dashboard file looks out of date. What should I change?',time:at});
  const m={id:current.threadId+'-answer',role:'assistant',type:'text',body:'Change the source template, then run the build so the dashboard file is generated again. Editing the generated file directly would be overwritten.',time:at};
  t.messages.push(m);current.asked=true;
  /* the ordinary reply boundary: the reply takes a note, and each rule that rode along is checked against it */
  const M=window.PM56_AUTO_MEMORY,out=M?M.boundary(t,m):null;if(out&&out.id&&M.markRecorded)M.markRecorded(out.id);else T.noteReply(t,m);
  c.renderApp();}
 function step(){
  const latest=T.get(current.ids.at(-1)),td='data-thread="'+S.esc(current.threadId)+'"';
  if(current.kind==='capture'){
   if(!latest)return {step:'Step 1 of 3 · Save the assistant’s advice as a rule. Its message’s More menu has the same Save as a rule… .',actions:[{action:'teach-from-message',attrs:'data-value="'+S.esc(current.sourceId)+'" '+td,label:'Save it as a rule…'}]};
   if(!current.asked)return {step:'Step 2 of 3 · Ask something. The reply shows it followed your rule.',actions:[{action:'teach-demo-ask',label:'Ask a question'}]};
   if(!current.opened)return {step:'Step 3 of 3 · See your rules and what your next message will include.',actions:[{action:'teach-demo-rules',label:'Open your rules'}]};
   return {step:'Done · The rule rides along in this chat until you change it.',actions:[{action:'teach-demo-replay',label:'Replay'}]};
  }
  if(current.kind==='missed'){
   if(!latest)return {step:'Step 1 of 3 · Save the assistant’s advice as a rule. It asks for a compare step.',actions:[{action:'teach-from-message',attrs:'data-value="'+S.esc(current.sourceId)+'" '+td,label:'Save it as a rule…'}]};
   if(!current.asked)return {step:'Step 2 of 3 · Ask something. This reply leaves out the compare step.',actions:[{action:'teach-demo-ask',label:'Ask a question'}]};
   if(!current.fixed)return {step:'Step 3 of 3 · Under the reply: Missed 1 of your rules. Ask for a fix.',actions:[{action:'teach-ask-fix',attrs:'data-id="'+S.esc(current.threadId+'-answer')+'" '+td,label:'Ask for a fix'}]};
   return {step:'Done · Your request waits in the message box, not sent.',actions:[{action:'teach-demo-replay',label:'Replay'}]};
  }
  if(!latest)return {step:'Step 1 of 4 · Teach a rule the quick way: type /teach and the rule in the chat.',actions:[{action:'teach-demo-type',label:'Type it for me'}]};
  if(latest.version===1&&!latest.supersededBy&&!latest.revoked)return {step:'Step 2 of 4 · Edit the rule. The old wording stays in history.',actions:[{action:'teach-demo-edit',label:'Edit the rule…'}]};
  if(!latest.revoked)return {step:'Step 3 of 4 · Turn version 2 off. It stays in history, and version 1 doesn’t come back.',actions:[{action:'af-teach-revoke',attrs:'data-value="'+S.esc(latest.id)+'" '+td,label:'Turn it off…'}]};
  return {step:'Done · Both versions stay in history, unused.',actions:[{action:'teach-demo-rules',label:'Open your rules'},{action:'teach-demo-replay',label:'Replay'}]};
 }
 function guide(c,inEditor=false){if(!current||c.thread.id!==current.threadId||c.state.dialog)return '';if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  /* while the Turn off confirmation waits in the rule's row, the guide points at it instead of offering a second Turn off */
  const latest=T.get(current.ids.at(-1)),s=current.kind==='correct'&&latest&&!latest.revoked&&latest.version>1&&T.revoking?.(current.threadId)===latest.id?
   {step:'Step 4 of 4 · Press Turn off in the rule’s row to confirm, or Keep it.',actions:[]}:step();
  return S.pmxGuide({key:'teach-guide',cls:'teach-demo-guide',placement:inEditor?'doc':'dock',step:s.step,actions:s.actions,close:{action:'teach-demo-close',label:'Close guide'}});
 }
 E.slot('composerBelow',c=>guide(c));E.action('teach-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('teach-demo-replay',()=>{if(current)start(current.kind);return true;});E.action('teach-demo-close',()=>{current=null;E.ctx().renderApp();return true;});
 E.action('teach-demo-ask',()=>{ask();return true;});
 /* the guide advances once Ask for a fix has filled the message box (from the guide or from the reply's own button) */
 E.chainAction('teach-ask-fix',(c,b)=>{if(current&&b.dataset.id===current.threadId+'-answer')current.fixed=true;return false;});
 E.action('teach-demo-rules',c=>{if(!current)return true;const t=thread();if(t&&c.thread.id!==t.id)c.switchThread(t.id);T.show(null);T.showPreview?.(current.threadId,true);current.opened=true;E.ctx().renderApp();return true;});
 E.action('teach-demo-type',c=>{if(!current)return true;const t=thread();if(!t)return true;T.fromComposer(c,t,'/teach '+rule);return true;});
 E.action('teach-demo-edit',()=>{if(!current)return true;const r=T.get(current.ids.at(-1));if(r&&T.active(r))T.open({text:corrected,scope:r.scope==='global'?'user':r.scope,narrowOf:r.id});return true;});
 E.chainAction('reset-all',()=>{current=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start','room-demo-start'].forEach(a=>E.chainAction(a,()=>{current=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,prev=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Teach · recorded examples</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="teach-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+prev(c);
 window.PM56_TEACH_DEMOS={start,rule,corrected,snapshot:()=>current?clone(current):null,editorGuide:id=>current?.threadId===id?guide(E.ctx(),true):''};
})();
