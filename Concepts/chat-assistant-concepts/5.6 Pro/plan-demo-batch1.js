/* Two bounded, gallery-only Regular Plan workflows. No provider or native commands.
 * Fixtures are initialized once; every subsequent step uses the existing visible
 * product control and checks owner state. No forced completion or fake clock.
 * Playback (2026-10-22, Jared: recorded examples play on their own after Start): both play from Start through
 * PM56_RECPLAY, paced to read; your part is pressed on the product's own controls, lit first (Open plan, More, Open
 * To-Dos, Stop and revise, the feedback typed and sent, Markdown). Build is the plan's approval, so it stays yours:
 * the example waits there and the guide says so, then goes on by itself once you press it. The guide is the one
 * recorded-example look (pmxGuide); its only buttons are Replay and Close. plan-demo-next stays as a QA hook. */
(function(){
 'use strict';
 const E=window.PM56_EXT,R=window.PM56_RECPLAY;
 let active=null,serial=0,player=null;
 const flows={
  complete:{label:'Build a small Plan',summary:'Approve → To-Dos → completed',steps:[
   ['Open the plan','Open plan','open'],
   ['Approve this version','Build','build'],
   ['Follow the two tasks','Open To-Dos','todos'],
   ['Tasks are running','Waiting for completion','wait']]},
  revise:{label:'Stop and revise',summary:'Stop → feedback → immutable V1',steps:[
   ['Open the plan','Open plan','open'],
   ['Start from the approved version','Build','build'],
   ['Stop before changing the plan','Stop and revise','stop'],
   ['Send the revision feedback','Send feedback','revise'],
   ['Inspect the new version','View Markdown','markdown']]}
 };
 const clone=v=>JSON.parse(JSON.stringify(v));
 function ctx(){return E.ctx();}
 function plan(){return active&&window.PM56_PLANS.get(active.planId);}
 function invoke(action,ds){
  const q='[data-action="'+action+'"]'+Object.entries(ds||{}).map(([k,v])=>'[data-'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+'="'+CSS.escape(String(v))+'"]').join('');
  const bs=[...document.querySelectorAll(q)].filter(b=>b.getClientRects().length&&!b.disabled);
  if(!bs.length)throw Error('Visible control unavailable: '+action);
  bs[0].scrollIntoView({block:'nearest',inline:'nearest'});bs[0].click();
 }
 function start(id){
  if(!flows[id])return;
  const c=ctx();
  const close=document.createElement('button');E.run('close-history',close,new Event('click'));
  // Replay ends only this demo's unfinished work, never another thread's work.
  if(active){const old=plan();if(old&&old.status==='building'){
    const b=document.createElement('button');b.dataset.id=old.plan_id;E.run('pd-cancel',b,new Event('click'));
  }}
  const n=++serial,tid='plan-demo-'+id+'-'+n,pid='plan-demo-'+id+'-'+n;
  const template=clone(window.PM56_PLANS.fixture()['ap-index']);
  const blocks=[{t:'heading',d:2,text:'Objective'},
   {t:'paragraph',text:'Keep the selected provider account stable when the model list refreshes.'},
   {t:'heading',d:2,text:'Steps'},
   {t:'plan_step',plan_step_id:'route',title:'Preserve account selection',text:'Resolve each row by provider and account.',depends_on:[],parallel_group_id:null,parent_step_id:null},
   {t:'plan_step',plan_step_id:'verify',title:'Check the refreshed list',text:'Confirm that the same account remains selected.',depends_on:['route'],parallel_group_id:null,parent_step_id:null}];
  Object.assign(template,{plan_id:pid,thread_id:tid,title:'Keep account selection stable',version:1,
   strategy:'Standard',backend:'direct',status:'ready',current:true,view:'rich',revisions:{1:blocks},
   revisionLog:[],sources:[{kind:'creation',ref:'msg:'+tid+'-request',note:'Guided demo request.'}],
   attachmentRefs:[],research:[],runHistory:[],approved:null,attention:null,wait:null,schedule:null,
   goalBinding:null,topology:null,planunits:[],unitsMaterialized:null,todosCreated:null});
  window.PM56_PLANS.all()[pid]=template;
  const base=clone(c.state.threads.find(t=>t.id==='query'));
  Object.assign(base,{id:tid,title:flows[id].label,pinned:false,archived:false,status:'ready',goalId:null,
   messages:[{id:tid+'-request',role:'user',type:'text',body:'Plan the account-selection fix, with a verification step.'},
    {id:tid+'-plan',role:'system',type:'plan-card-v2',planId:pid}]});
  c.state.threads.push(base);window.PM56_B16_WORK.attachAccountPlan(template,base);c.state.historyMode='closed';c.state.activity.open=false;
  c.state.editorTabs=[];c.state.activeEditor=null;c.state.editorRevealed=false;
  c.state.demoOpen=false;c.state.menu=null;c.state.dialog=null;c.state.hover=null;
  c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};
  c.state.capabilities.goal=false;c.state.composer='';window.PM56_RUNTIME.composer.destination=null;
  active={id,threadId:tid,planId:pid,step:0,initial:clone(template.revisions[1]),events:[],error:null};
  c.switchThread(tid);playback();c.renderApp();
 }
 /* the recording: next() names the next beat from the example's own state (PM56_RECPLAY) */
 const PACE={first:1100,build:0,more:4200,item:1400,close:1300,type:3600,send:700,view:4800};
 const FEEDBACK='Keep the selected account when favorites are reordered too.';
 const q=(action,id,extra)=>'[data-action="'+action+'"][data-id="'+CSS.escape(id)+'"]'+(extra||'');
 const moreOpen=id=>!!R.find(q('pd-more-actions',id,'[aria-expanded="true"]'));
 const record=(a,name)=>{const p=plan();a.events.push({step:name,at:performance.now(),status:p.status,version:p.version});a.error=null;};
 function next(){const a=active;if(!a)return null;const p=plan();if(!p)return null;const f=flows[a.id],step=f.steps[a.step],name=step&&step[2];
  if(!name)return null;
  const done=()=>{record(a,name);a.step++;};
  if(name==='open')return {id:'open',wait:PACE.first,run:()=>R.press(q('pd-open-version',p.plan_id)).then(ok=>{if(ok)done();return ok;})};
  /* Build approves this version: yours to press (the guide says so); the recording goes on once the plan is building */
  if(name==='build'){if(p.status==='building'){done();E.ctx().renderApp();}return null;}
  if(name==='todos'){
   if(a.todosOpened&&moreOpen(p.plan_id))return {id:'todos-close',wait:PACE.close,run:()=>R.press(q('pd-more-actions',p.plan_id)).then(ok=>{if(ok)done();return ok;})};
   if(a.todosOpened){done();return null;}
   if(R.find(q('pd-open-todos',p.plan_id)))return {id:'todos',wait:PACE.item,run:()=>R.press(q('pd-open-todos',p.plan_id)).then(ok=>{if(ok)a.todosOpened=true;return ok;})};
   return {id:'todos-more',wait:PACE.more,run:()=>R.press(q('pd-more-actions',p.plan_id))};}
  if(name==='stop'){
   /* stopped for revision: the run is paused (attention) and the message box writes to this plan */
   if(a.stopped||p.revisionStop){if(moreOpen(p.plan_id))return {id:'stop-close',wait:PACE.close,run:()=>R.press(q('pd-more-actions',p.plan_id)).then(ok=>{if(ok)done();return ok;})};done();return null;}
   if(R.find(q('pd-stop-revise',p.plan_id)))return {id:'stop',wait:PACE.item,run:()=>R.press(q('pd-stop-revise',p.plan_id)).then(ok=>{if(ok)a.stopped=true;return ok;})};
   return {id:'stop-more',wait:PACE.more,run:()=>R.press(q('pd-more-actions',p.plan_id))};}
  if(name==='revise'){
   if(p.version>=2){done();return null;}
   const box=R.find(R.COMPOSER);
   if(box&&box.value===FEEDBACK)return {id:'send',wait:PACE.send,run:()=>R.press('.composer [data-action="send"]')};
   if(innerWidth<=1100&&E.ctx().state.editorRevealed)return {id:'back-to-chat',wait:PACE.close,run:()=>R.press('[data-action="return-to-chat"]')};
   return {id:'type',wait:PACE.type,run:()=>R.type(FEEDBACK)};}
  /* at a narrow width the chat had the screen for the feedback: the plan opens again to show its Markdown */
  if(name==='markdown'&&!R.find(q('pd-view',p.plan_id,'[data-value="markdown"]'))&&!a.reopened)return {id:'reopen',wait:PACE.view,run:()=>R.press(q('pd-open-version',p.plan_id)).then(ok=>{if(ok)a.reopened=true;return ok;})};
  if(name==='markdown')return {id:'markdown',wait:a.reopened?PACE.close:PACE.view,run:()=>R.press(q('pd-view',p.plan_id,'[data-value="markdown"]')).then(ok=>{if(ok)done();return ok;})};
  return null;}
 function playback(){if(player)player.stop();const s=active;player=R.play({key:'plan-demo',live:()=>active===s,threads:()=>[s.threadId],next,render:()=>ctx().renderApp(),superseded:()=>{if(active===s)active=null;}});}
 function stop(){if(player){player.stop();player=null;}}
 async function advance(){
  if(!active||active.busy)return;const a=active,f=flows[a.id],step=f.steps[a.step];if(!step)return;
  const settle=()=>new Promise(resolve=>setTimeout(resolve,170));a.busy=true;
  try{
   const p=plan();const name=step[2];
   if(name==='open'){invoke('pd-open-version',{id:p.plan_id});}
   if(name==='build'){invoke('pd-build',{id:p.plan_id});if(p.status!=='building')throw Error('Build was not admitted');}
   if(name==='todos'){
    invoke('pd-more-actions',{id:p.plan_id});await settle();if(active!==a)return;invoke('pd-open-todos',{id:p.plan_id});await settle();if(active!==a)return;invoke('pd-more-actions',{id:p.plan_id});
   }
   if(name==='stop'){
    invoke('pd-more-actions',{id:p.plan_id});await settle();if(active!==a)return;invoke('pd-stop-revise',{id:p.plan_id});await settle();if(active!==a)return;invoke('pd-more-actions',{id:p.plan_id});
    if(p.status!=='ready'||window.PM56_RUNTIME.composer.destination?.refId!==p.plan_id)throw Error('Stop/revise boundary not reached');
   }
   if(name==='revise'){
    const field=document.querySelector('textarea[data-input="composer"]');if(!field)throw Error('Composer unavailable');
    field.value='Keep the selected account when favorites are reordered too.';
    field.dispatchEvent(new Event('input',{bubbles:true}));invoke('send');
    if(p.version!==2)throw Error('Revision did not create V2');
    if(JSON.stringify(p.revisions[1])!==JSON.stringify(a.initial))throw Error('V1 changed');
   }
   if(name==='markdown'){invoke('pd-view',{id:p.plan_id,value:'markdown'});}
   if(name==='wait')return;
   a.events.push({step:name,at:performance.now(),status:p.status,version:p.version});a.step++;a.error=null;a.busy=false;
   ctx().renderApp();
  }catch(err){a.busy=false;a.error=String(err.message||err);ctx().renderApp();}
 }
 function finished(){return active&&(active.id==='complete'?(active.step>=3&&plan()?.status==='completed'):active.step===flows[active.id].steps.length);}
 /* the guide: what is happening and what comes next; at Build, plainly what you are asked */
 function say(){const a=active,p=plan(),f=flows[a.id],s=f.steps[a.step],name=s&&s[2];
  if(player&&player.errors.length)return {text:'This step couldn’t run, so the recording stopped here. Replay starts it again.',done:true};
  if(finished())return {text:a.id==='complete'?'Done · Plan completed: 2 of 2 tasks. Version 1 stays exactly as you approved it.':'Done · Version 2 is ready, and version 1 is kept unchanged. Markdown shows the new version.',done:true};
  if(name==='open')return {text:'The assistant wrote a plan with two steps. Next: you open it to read it.'};
  if(name==='build')return {text:'Your move: Build approves version 1 and starts its two tasks. Press Build on the plan when you’re ready; the recording goes on from there.',done:true,yours:true};
  if(name==='todos')return {text:'Building version 1. Next: you open its To-Dos from the plan’s More menu to follow the two tasks.'};
  if(name==='wait')return {text:'The two tasks run one after the other. The plan completes when both are done.'};
  if(name==='stop')return {text:'Building version 1. Next: you stop it before changing the plan, from the plan’s More menu.'};
  if(name==='revise')return {text:'Stopped; the plan is ready for your feedback, and the message box now writes to it. Next: you type what to change and send it.'};
  if(name==='markdown')return {text:'Version 2 is written, and version 1 is kept unchanged. Next: you look at the new version as Markdown.'};
  return {text:''};}
 /* the dock line, or the plan document's first row when the document covers the chat (a narrow window) */
 function guideHtml(c,inEditor){
  if(!active||c.state.selectedThread!==active.threadId||c.state.dialog)return '';
  if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const s=say(),text=R.steady(active,s.text,!!s.done,()=>ctx().renderApp());if(!text)return '';
  return window.PM56_SHELL.pmxGuide({key:inEditor?'plan-demo-guide:doc':'plan-demo-guide',cls:'plan-demo-guide',placement:inEditor?'doc':'dock',caption:'Recorded example · '+c.esc(flows[active.id].label),step:c.esc(text),
   actions:finished()&&text===s.text?[{action:'plan-demo-replay',label:'Replay'}]:[],next:player&&player.progress(),close:{action:'plan-demo-close',label:'Close the example'},
   extra:active.error?'<p class="pmx-fine" role="status">'+c.esc(active.error)+'</p>':''});
 }
 E.slot('composerBelow',c=>guideHtml(c,false));
 E.action('plan-demo-start',(c,b)=>{start(b.dataset.flow);return true;});
 E.action('plan-demo-next',()=>{advance();return true;});
 E.action('plan-demo-replay',()=>{if(active)start(active.id);return true;});
 E.action('plan-demo-close',()=>{stop();active=null;ctx().renderApp();return true;});
 E.chainAction('reset-all',()=>{stop();active=null;return false;});
 const G=window.PM56_REPAIR_DEMOS;
 if(G){const old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Guided Plan workflows</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="plan-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.summary)+'</small></button>').join('')+'</div></section>'+old(c);}
 window.PM56_PLAN_DEMOS={start,editorGuide:id=>active&&active.planId===id?guideHtml(ctx(),true):'',snapshot:()=>active?clone({...active,finished:!!finished()}):null};
})();
