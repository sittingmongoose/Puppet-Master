/* B11 gallery fixtures. Supplied reply variants demonstrate the real preference
 * resolver at message admission. Not live generation or semantic rewriting.
 * PREFS (DESIGN-SPEC 8.13 G-26, 4.3 G-25): the guide is the one recorded-example look (pmxGuide, placed in
 * the dock); the example answer reads like any reply, with the "Simple explanation" tick and the recorded
 * tick in its meta row; the evidence page is a pmxView, "Your code, unchanged". Two demo chats are named
 * Chat A and Chat B everywhere (thread titles, the guide, the evidence tabs). Every action here is demo
 * (8.15 rule 2): none of them is a command. */
(function(){
 'use strict';const E=window.PM56_EXT,P=window.PM56_ELI5,copy=x=>JSON.parse(JSON.stringify(x));let active=null,seq=0;
 const flows={override:{title:'Simple answers in one chat',detail:'Turn ELI5 on for one chat and compare it with a chat that stays standard.'},inherit:{title:'Back to your usual setting',detail:'Undo one chat’s own choice so it follows its project again.'}};
 const code='const limit = options.maxRetries ?? 3;';
 const questions=['Explain the retry limit.','What does the zero limit do?'];
 const variants=[{standard:'The nullish-coalescing expression preserves an explicitly supplied maxRetries value, including zero, and falls back to 3 only for null or undefined.',simple:'Use the retry limit you provide—even 0. When the value is null or missing, use 3 instead.',simplest:'You pick how many times to try again, and that number is kept, even 0. Pick nothing, and it tries 3 times.'},
  {standard:'An explicit maxRetries value of 0 is not nullish, so the expression evaluates to 0 rather than the fallback value of 3.',simple:'A limit of 0 stays 0. This expression does not replace it with 3.',simplest:'Zero means no second tries at all. It does not quietly turn into 3.'}];
 function snap(){return active?copy(active):null;}
 function S(){return window.PM56_SHELL;}
 function chatName(c,tid){if(active&&active.threads.includes(tid))return tid===active.threads[0]?'Chat A':'Chat B';const t=c.state.threads.find(x=>x.id===tid);return t?t.title:'this chat';}
 const Q='<q>'+questions[0]+'</q>';
 /* one plain step per state: which chat this is, what it does now, and what to try next */
 function step(c){
  const r=P.resolve(c.thread.id),a=c.thread.id===active.threads[0],name='<b>'+(a?'Chat A':'Chat B')+'</b> · ',now=r.effective?'Simple':'Standard';
  if(active.kind==='override'){
   if(!a)return name+(r.effective?'Explains things simply too. ':'Follows your usual setting, so it stays Standard. ')+'Ask '+Q+' to compare.';
   if(r.source!=='conversation')return name+'Open ELI5 and choose Simple for this chat, then ask '+Q;
   return name+(r.override?'Now explains things simply. Ask '+Q+' and compare with Chat B.':'Set to Standard here. Choose Simple in ELI5 to see the difference.');
  }
  if(!a)return name+'Follows this project, so it is '+now+'. Ask '+Q;
  if(r.override===false)return name+'Set to Standard in this chat. Open ELI5 and pick Follow my usual setting.';
  if(r.override===null)return name+'Follows this project again, so it is '+now+'. Ask '+Q;
  return name+'Set to Simple here. Follow my usual setting would use this project’s choice.';
 }
 function guide(c){
  if(!active||!active.threads.includes(c.thread.id))return '';
  const a=c.thread.id===active.threads[0],other=active.threads.find(id=>id!==c.thread.id);
  return S().pmxGuide({key:'eli5-demo-guide',cls:'eli5-demo-guide',placement:'dock',step:step(c),
   actions:[{action:'eli5-open',label:'Open ELI5'},{action:'eli5-demo-switch',attrs:'data-thread="'+c.esc(other)+'"',label:a?'Compare with Chat B':'Back to Chat A'}],
   close:{action:'eli5-demo-close',label:'Close the example'}});
 }
 function start(kind){if(!flows[kind])return;const c=E.ctx(),n=++seq,pid='concept:eli5:'+n,ids=['eli5-'+n+'-primary','eli5-'+n+'-sibling'];
  const planId='eli5-plan-'+n,artifactId='eli5-artifact-'+n;
  const blocks=[{t:'heading',d:2,text:'Retry limit'},{t:'paragraph',text:'Preserve an explicit zero limit. Use 3 only when the input is null or undefined.'},{t:'plan_step',plan_step_id:'verify-zero',title:'Verify explicit zero',text:'Check 0, null and undefined without changing the expression.',depends_on:[],parallel_group_id:null,parent_step_id:null}];
  const plan=copy(window.PM56_PLANS.fixture()['ap-index']);Object.assign(plan,{plan_id:planId,thread_id:ids[0],title:'Preserve the retry limit',version:1,strategy:'Standard',backend:'direct',status:'ready',current:true,view:'rich',revisions:{1:blocks},revisionLog:[],sources:[{kind:'creation',ref:'msg:'+ids[0]+'-original',note:'Recorded example.'}],attachmentRefs:[],research:[],runHistory:[],approved:null,attention:null,wait:null,schedule:null,goalBinding:null,topology:null,planunits:[],unitsMaterialized:null,todosCreated:null});window.PM56_PLANS.all()[planId]=plan;
  const artifact={id:artifactId,threadId:ids[0],projectId:pid,title:'Retry expression',name:'retry-limit.js',kind:'code',type:'code',language:'javascript',version:1,status:'ready',updated:'Recorded example',summary:'Preserve an explicit zero retry limit.',sourceMessageId:ids[0]+'-original',content:code,body:code,code,readOnly:true};c.D.artifacts.push(artifact);
  ids.forEach((id,i)=>{const t=copy(c.state.threads.find(t=>t.id==='plain')||c.state.threads[0]);Object.assign(t,{id,projectId:pid,title:i?'Retry limit · Chat B':'Retry limit · Chat A',pinned:false,archived:false,goalId:null,eli5Example:{kind,artifactId,planId,code},messages:[{id:id+'-original',role:'assistant',type:'text',body:'Recorded example: the retry limit keeps an explicit 0 and uses 3 only when nothing was given. The plan and the code below stay exactly the same whichever way answers are explained.'},...(i?[]:[{id:id+'-plan',role:'system',type:'plan-card-v2',planId}])]});c.state.threads.push(t);});
  P.setProject(pid,kind==='inherit');if(kind==='inherit')P.setThread(ids[0],false);
  // The default is set through the real owner, never by replacing its store.
  // A private example project avoids altering preferences in existing projects.
  active={kind,threads:ids,projectId:pid,planId,artifactId,questions:copy(questions),code,initialPlan:copy(plan),initialArtifact:copy(artifact)};
  Object.assign(c.state,{mode:'Ask',menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,demoOpen:false,composer:''});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,started:false,completed:false,elapsed:0};window.PM56_RUNTIME.composer.destination=null;c.switchThread(ids[0]);c.openEditor('eli5-evidence:'+ids[0]);
 }
 /* Explain this reply simply (owner answer E-11, eli5-preferences.js): the recorded answers carry their own simpler
    wording, one step simpler than the answer shown; any other reply gets the resolver's stand-in */
 function simpler(m){if(!m||m.type!=='eli5-example-answer')return null;const v=variants.find(x=>x.standard===m.body||x.simple===m.body);if(!v)return null;return m.body===v.standard?v.simple:v.simplest;}
 function reply(t,raw,preference,requestId){if(!t.eli5Example)return null;const at=questions.indexOf(raw);if(at<0)return null;const v=variants[at];return {id:E.ctx().uid('eli5-answer'),role:'assistant',type:'eli5-example-answer',body:preference.effective?v.simple:v.standard,code:t.eli5Example.code,artifactId:t.eli5Example.artifactId,planId:t.eli5Example.planId,sourceMessageId:requestId,explanationPreference:copy(preference),time:new Date().toISOString(),recordedExample:true};}
 /* The example answer reads like any reply: the role line, one answer (simple or standard, never both), the
    code, and "See your code (unchanged)". Its meta row carries the ticks; the change-point divider comes from
    PM56_ELI5's messageAffordance, like on any reply. */
 E.slot('transcriptMessage',c=>{const m=c.m;if(m?.type!=='eli5-example-answer')return '';const more=c.extRender('messageOverflow',{message:m}),panel=c.extRender('messageOverflowPanel',{message:m});const opened=window.PM56_MSG_OVERFLOW?.isOpen(m.id);
  return '<article class="message message-assistant eli5-answer" data-k="message:'+c.esc(m.id)+'" data-message-id="'+c.esc(m.id)+'">'+c.extRender('messageAffordance',{message:m})+
   '<div class="message-surface"><div class="message-role">'+c.icon('sparkles',12)+' Assistant</div><div class="message-body eli5-answer-body"><p>'+c.esc(m.body)+'</p><pre><code>'+c.esc(m.code)+'</code></pre></div>'+
   '<button type="button" class="text-button eli5-answer-see" data-action="eli5-demo-evidence" data-thread="'+c.esc(c.thread.id)+'">'+S().pmxGlyph('code',13)+'<span>See your code (unchanged)</span></button></div>'+
   '<div class="message-chrome'+(opened?' is-overflow-open':'')+'">'+c.extRender('messageMeta',{message:m})+'<div class="message-actions"><button class="text-button icon-only" data-action="copy-message" data-id="'+c.esc(m.id)+'" aria-label="Copy reply">'+c.icon('copy',13)+'<span>Copy</span></button>'+more+'</div>'+panel+'</div></article>';});
 E.slot('messageMeta',c=>{const m=c.message;if(!m||!(m.type==='eli5-example-answer'||m.eli5ExplainsId)||!m.recordedExample)return '';return S().pmxTick({key:'eli5-rec:'+m.id,cls:'eli5-answer-rec',glyph:'play-ring',text:'Recorded example · no AI cost'});});
 function textButton(c,action,attr,value,label){return '<button type="button" class="text-button" data-action="'+action+'"'+(attr?' '+attr+'="'+c.esc(value)+'"':'')+'>'+label+'</button>';}
 function evidence(c){const t=c.thread,f=t.eli5Example;if(!f)return '';const plan=window.PM56_PLANS.get(f.planId),a=c.D.artifacts.find(x=>x.id===f.artifactId);if(!a)return '';
  const table=S().pmxMd('| Input | What it gives |\n|---|---|\n| `0` | `0` |\n| `null` | `3` |\n| `undefined` | `3` |',{mode:'full'});
  return S().pmxView({key:'eli5-evidence:'+t.id,cls:'eli5-evidence',kind:'eli5',kindWord:'ELI5 · '+c.esc(chatName(c,t.id)),title:'Your code, unchanged',
   statusHtml:'The same code and plan, whichever way answers are explained. <span class="eli5-evidence-rec">Recorded example · no AI cost</span>',
   actionsHtml:textButton(c,'open-artifact','data-id',f.artifactId,'Open the code file')+textButton(c,'eli5-demo-plan','data-id',f.planId,'Open the plan')+(active&&active.threads.includes(t.id)?textButton(c,'eli5-demo-replay','','','Start over'):''),
   mainHtml:S().pmxViewSection({key:'eli5-ev-code',title:'The code',meta:c.esc(a.name||'retry-limit.js'),body:'<pre class="pmx-code"><code>'+c.esc(a.content)+'</code></pre>'})+
    S().pmxViewSection({key:'eli5-ev-results',title:'Observed results',meta:'What this code gives for each input',body:table})+
    '<p class="pmx-fine eli5-evidence-tech">Technical details · artifact '+c.esc(f.artifactId)+' · plan '+c.esc(f.planId)+', version '+c.esc(plan?plan.version:1)+'</p>'});}
 /* An evidence tab of the other chat: it says whose page it is and offers the way back, never a dead end. */
 function away(c,tid){const name=chatName(c,tid),known=!!(active&&active.threads.includes(tid));
  return S().pmxView({key:'eli5-evidence-away',cls:'eli5-evidence',kind:'eli5',kindWord:'ELI5 · '+c.esc(name),title:'Your code, unchanged',
   statusHtml:'This page belongs to '+c.esc(name)+'. Go back to it to see its code.',actionsHtml:known?textButton(c,'eli5-demo-switch','data-thread',tid,'Go to '+c.esc(name)):''});}
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('eli5-evidence:')?chatName(c,c.editorId.slice(14))+' · your code':'');
 E.slot('editorDocument',c=>{if(!c.editorId?.startsWith('eli5-evidence:'))return '';const tid=c.editorId.slice(14);return tid===c.thread.id?evidence(c):away(c,tid);});
 E.slot('composerBelow',guide);
 E.action('eli5-demo-start',(c,b)=>{start(b.dataset.flow);return true;});
 E.action('eli5-demo-switch',(c,b)=>{const target=b.dataset.thread;if(active&&active.threads.includes(target)){c.switchThread(target);c.openEditor('eli5-evidence:'+target);}return true;});
 E.action('eli5-demo-evidence',(c,b)=>{if(c.thread.eli5Example&&b.dataset.thread===c.thread.id)c.openEditor('eli5-evidence:'+c.thread.id);return true;});
 E.action('eli5-demo-plan',(c,b)=>{if(c.thread.eli5Example?.planId===b.dataset.id)c.openEditor('plan:'+b.dataset.id);return true;});
 E.action('eli5-demo-replay',()=>{if(active)start(active.kind);return true;});E.action('eli5-demo-close',c=>{active=null;c.renderApp();return true;});
 E.chainAction('reset-all',()=>{active=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start','room-demo-start','teach-demo-start','memory-demo-start','debug-demo-start','revert-demo-start'].forEach(a=>E.chainAction(a,()=>{active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Guided ELI5 examples</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="eli5-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.title)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+old(c);
 window.PM56_ELI5_DEMOS={start,snapshot:snap,reply,simpler,questions:()=>copy(questions)};
})();
