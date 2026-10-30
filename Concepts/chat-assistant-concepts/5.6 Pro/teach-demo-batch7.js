/* B07 gallery: Teach recorded examples (no AI is contacted). The guide is the shared pmxGuide (G-25, class
   teach-demo-guide and key teach-guide kept for the demo hooks); it hides while a dialog is open and moves into the
   Your rules document when the editor covers the chat (<= 1100 px). Every step has a forward action, so a person (or
   pm.mjs drive()) can walk it without hunting for a menu. Rules saved here are marked recorded (IMPACT A3-03).
   Each recorded rule carries its check (owner answer E-36): the reply to "Ask a question" passes version 1's check
   ("Followed 1 of your rules") and misses the longer rule's compare step ("Missed 1 of your rules" + Ask for a fix).
   Playback (2026-10-22, Jared: recorded examples play on their own after Start): each example plays from Start through
   PM56_RECPLAY, paced to read. Your part is played on the product's own controls, lit first: a message's More menu and
   Save as a rule…, Save rule, typing /teach or a question in the message box and Send, View on a rule's receipt, Edit,
   the new wording typed into Teach, and Ask for a fix. A rule's reply tick is shown as if the pointer rested on it. The
   examples end where the product waits for you: the missed example's request waits in the message box for your Send
   (Send gets a reply that keeps the compare step, checked against your rule like any other), and the edit example
   stops at Turn off's confirm in the rule's row. The guide narrates; its only buttons are Replay
   and Close. */
(function(){
 'use strict';const E=window.PM56_EXT,T=window.PM56_TEACH,S=window.PM56_SHELL,R=window.PM56_RECPLAY,clone=x=>JSON.parse(JSON.stringify(x));let current=null,seq=0;
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
  current={kind,threadId:id,sourceId:id+'-guidance',ids:[],asked:false,opened:false,fixed:false,resent:false,previewed:false};c.switchThread(id);playback();c.renderApp();
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
 /* your Send of the fix request (the missed example's last move): the reply keeps the compare step and is checked at the
    same reply boundary, so its receipt reads Followed 1 of your rules */
 function resend(raw){const c=E.ctx(),t=thread();if(!t)return;const at=new Date().toISOString();
  t.messages.push({id:current.threadId+'-fix-request',role:'user',type:'text',body:raw,time:at});
  const m={id:current.threadId+'-fixed',role:'assistant',type:'text',body:'You’re right, I left out the compare step. Change the source template, run the build so the dashboard file is generated again, then compare the generated output with the previous version to confirm only what you meant changed. Editing the generated file directly would be overwritten.',time:at};
  t.messages.push(m);current.resent=true;
  const M=window.PM56_AUTO_MEMORY,out=M?M.boundary(t,m):null;if(out&&out.id&&M.markRecorded)M.markRecorded(out.id);else T.noteReply(t,m);
  c.renderApp();}
 /* the recording: next() names the next beat from the example's own state (PM56_RECPLAY) */
 const QUESTION='The dashboard file looks out of date. What should I change?';
 const PACE={first:1000,entry:1700,save:4600,typeAsk:4800,send:700,hover:2600,view:6200,previewed:3200,fix:5600,typeTeach:1000,edit:3600,typeEdit:2400,saveEdit:1800,revoke:5200};
 const msg=id=>'.message[data-message-id="'+CSS.escape(id)+'"]',chromeOf=id=>msg(id)+' .message-chrome',sheet=()=>E.ctx().state.dialog?.type==='af-teach';
 const SAVE='#pmOverlayRoot .pmx-teach-sheet [data-action="af-teach-capture"]',SEND='.composer [data-action="send"]',BOX=R.COMPOSER;
 const composerHas=t=>{const f=document.querySelector(BOX);return !!f&&f.value===t;};
 /* your part, from a message: its More menu, Save as a rule…, then Save rule on the sheet that opens */
 function saveFrom(mid){
  if(sheet())return {id:'save:'+mid,dialog:'af-teach',wait:PACE.save,run:()=>R.press(SAVE)};
  if(document.querySelector(msg(mid)+' .pm-msg-overflow'))return {id:'entry:'+mid,wait:PACE.entry,run:()=>R.press(msg(mid)+' .pm-msg-overflow [data-action="teach-from-message"]')};
  return {id:'more:'+mid,wait:PACE.first,run:()=>R.press(msg(mid)+' [data-action="message-overflow"]',{reveal:chromeOf(mid)})};}
 /* your part: type the question and press Send (the example's own send hook answers it, below) */
 function askBeat(){
  if(composerHas(QUESTION))return {id:'send-ask',wait:PACE.send,run:()=>R.press(SEND)};
  return {id:'type-ask',wait:PACE.typeAsk,run:()=>R.type(QUESTION)};}
 const answerId=()=>current.threadId+'-answer';
 function next(){const a=current;if(!a)return null;const latest=T.get(a.ids.at(-1));
  if(a.kind==='capture'||a.kind==='missed'){
   if(!latest)return saveFrom(a.sourceId);
   if(!a.asked)return askBeat();
   if(a.kind==='capture'){
    if(!a.hovered)return {id:'hover',wait:PACE.hover,run:()=>R.hover(msg(answerId())+' .pmx-teach-tick',{reveal:chromeOf(answerId())}).then(ok=>{if(ok)a.hovered=true;return ok;})};
    if(!a.opened)return {id:'view',wait:PACE.view,run:()=>R.press('.transcript .pmx-teach-receipt [data-action="teach-open"][data-id="'+CSS.escape(latest.id)+'"]')};
    if(!a.previewed)return {id:'preview',wait:PACE.previewed,run:()=>R.press('.pmx-view [data-action="teach-preview"][aria-pressed="false"], [data-action="teach-preview"][aria-pressed="false"]').then(ok=>{if(ok)a.previewed=true;return ok;})};
    return null;}
   if(!a.fixed)return {id:'fix',wait:PACE.fix,run:()=>R.press(msg(answerId())+' [data-action="teach-ask-fix"]',{reveal:chromeOf(answerId())})};
   return null;}
  /* edit, then turn off: /teach typed and sent, Save rule, View on its receipt, Edit, the new wording, Save as version 2,
     then Turn off, whose confirm is yours */
  if(!latest){
   if(sheet())return {id:'save-teach',dialog:'af-teach',wait:PACE.save,run:()=>R.press(SAVE)};
   if(composerHas('/teach '+rule))return {id:'send-teach',wait:PACE.send,run:()=>R.press(SEND)};
   return {id:'type-teach',wait:PACE.typeTeach,run:()=>R.type('/teach '+rule)};}
  if(latest.version===1&&!latest.supersededBy&&!latest.revoked){
   if(sheet()){const f=document.getElementById('teach-body');
    if(f&&f.value!==corrected)return {id:'type-edit',dialog:'af-teach',wait:PACE.typeEdit,run:()=>R.type(corrected,{into:'#teach-body',from:'Before changing a generated file, edit its source'.length,cps:30})};
    return {id:'save-edit',dialog:'af-teach',wait:PACE.saveEdit,run:()=>R.press(SAVE)};}
   if(R.find('[data-action="teach-correct"][data-id="'+CSS.escape(latest.id)+'"]'))return {id:'edit',wait:PACE.edit,run:()=>R.press('[data-action="teach-correct"][data-id="'+CSS.escape(latest.id)+'"]')};
   return {id:'view-1',wait:PACE.view,run:()=>R.press('.transcript .pmx-teach-receipt [data-action="teach-open"][data-id="'+CSS.escape(latest.id)+'"]')};}
  if(!latest.revoked&&T.revoking?.(a.threadId)!==latest.id)return {id:'revoke',wait:PACE.revoke,run:()=>R.press('[data-action="af-teach-revoke"][data-value="'+CSS.escape(latest.id)+'"]')};
  return null;}
 let player=null;
 function playback(){if(player)player.stop();const s=current;player=R.play({key:'teach-demo',live:()=>current===s,threads:()=>[s.threadId],next,render:()=>E.ctx().renderApp(),superseded:()=>{if(current===s)current=null;}});}
 function stop(){if(player){player.stop();player=null;}}
 /* the example answers its own question when you send it, whoever types it: the reply boundary as before */
 window.PM56_RUNTIME.composer.preSendHooks.push((c,t,raw)=>{if(!current||t.id!==current.threadId||current.asked||raw.trim()!==QUESTION)return false;ask();return {claimed:true};});
 window.PM56_RUNTIME.composer.preSendHooks.push((c,t,raw)=>{const text=raw.trim();if(!current||current.kind!=='missed'||t.id!==current.threadId||!current.fixed||current.resent||!/missed|fix/i.test(text))return false;resend(text);return {claimed:true};});
 function step(){
  const a=current,latest=T.get(a.ids.at(-1)),up=player&&player.upcoming();
  if(player&&player.errors.length)return {step:'This step couldn’t run, so the recording stopped here. Replay starts it again.',done:true};
  if(a.kind==='capture'||a.kind==='missed'){
   if(!latest){if(up&&/^entry/.test(up.id))return {step:'Save as a rule… is in the message’s More menu. It opens Teach with the assistant’s words.'};
    return {step:a.kind==='missed'?'The assistant’s advice asks for a compare step. Next: you save it as a rule from the message’s More menu.':'The assistant gave good advice. Next: you save it as a rule from the message’s More menu.'};}
   if(!a.asked)return {step:'Saved: the rule now rides along in this chat. Next: you ask a question, and the reply is checked against your rule.'};
   if(a.kind==='capture'){
    if(!a.opened)return {step:'Under the reply: Followed 1 of your rules. The reply said to edit the source and rebuild. Next: you open your rules from the rule’s receipt.'};
    if(!a.previewed)return {step:'Your rules open beside the chat. Next: see what your next message will include.'};
    return {step:'Done · Your next message includes the rule. It rides along in this chat until you change it.',done:true};}
   if(!a.fixed)return {step:'Under the reply: Missed 1 of your rules. It left out the compare step. Next: you press Ask for a fix.'};
   if(!a.resent)return {step:'Your move: the request to fix the reply waits in the message box. Nothing is sent until you press Send.',done:true,yours:true};
   return {step:'Done · The new reply keeps the compare step. Under it: Followed 1 of your rules.',done:true};}
  if(!latest){if(up&&up.id==='send-teach')return {step:'Typed /teach and the rule. Next: Send opens Teach with it.'};
   return {step:'Teach a rule the quick way: type /teach and the rule in the message box.'};}
  if(latest.version===1&&!latest.supersededBy&&!latest.revoked){
   if(sheet())return {step:''};
   if(up&&up.id==='edit')return {step:'Your rules show version 1. Next: Edit it. The old wording stays in history.'};
   return {step:'Saved as version 1. Next: you open your rules from the rule’s receipt.'};}
  if(!latest.revoked&&T.revoking?.(a.threadId)===latest.id)return {step:'Your move: press Turn off in the rule’s row to turn version 2 off, or Keep it. Version 1 doesn’t come back either way.',done:true,yours:true};
  if(!latest.revoked)return {step:'Version 2 is saved; version 1 stays in history. Next: you turn version 2 off.'};
  return {step:'Done · Both versions stay in history, unused.',done:true};
 }
 function guide(c,inEditor=false){if(!current||c.thread.id!==current.threadId||c.state.dialog)return '';if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const s=step(),text=R.steady(current,s.step,!!s.done,()=>E.ctx().renderApp());if(!text)return '';
  return S.pmxGuide({key:'teach-guide',cls:'teach-demo-guide',placement:inEditor?'doc':'dock',step:text,actions:s.done&&text===s.step?[{action:'teach-demo-replay',label:'Replay'}]:[],next:player&&player.progress(),close:{action:'teach-demo-close',label:'Close guide'}});
 }
 E.slot('composerBelow',c=>guide(c));E.action('teach-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('teach-demo-replay',()=>{if(current)start(current.kind);return true;});E.action('teach-demo-close',()=>{stop();current=null;E.ctx().renderApp();return true;});
 E.action('teach-demo-ask',()=>{ask();return true;});
 /* the guide advances once Ask for a fix has filled the message box (from the guide or from the reply's own button) */
 E.chainAction('teach-ask-fix',(c,b)=>{if(current&&b.dataset.id===current.threadId+'-answer')current.fixed=true;return false;});
 E.action('teach-demo-rules',c=>{if(!current)return true;const t=thread();if(t&&c.thread.id!==t.id)c.switchThread(t.id);T.show(null);T.showPreview?.(current.threadId,true);current.opened=true;current.previewed=true;E.ctx().renderApp();return true;});
 /* your rules opened from the rule's receipt (View) count as opening them */
 E.chainAction('teach-open',(c,b)=>{if(current&&c.thread.id===current.threadId)current.opened=true;return false;});
 E.action('teach-demo-type',c=>{if(!current)return true;const t=thread();if(!t)return true;T.fromComposer(c,t,'/teach '+rule);return true;});
 E.action('teach-demo-edit',()=>{if(!current)return true;const r=T.get(current.ids.at(-1));if(r&&T.active(r))T.open({text:corrected,scope:r.scope==='global'?'user':r.scope,narrowOf:r.id});return true;});
 E.chainAction('reset-all',()=>{stop();current=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start','room-demo-start'].forEach(a=>E.chainAction(a,()=>{stop();current=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,prev=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Teach · recorded examples</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="teach-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+prev(c);
 window.PM56_TEACH_DEMOS={start,rule,corrected,snapshot:()=>current?clone(current):null,editorGuide:id=>current?.threadId===id?guide(E.ctx(),true):''};
})();
