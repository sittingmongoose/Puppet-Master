/* Two bounded, gallery-only Regular Plan workflows. No provider or native commands.
 * Fixtures are initialized once; every subsequent step uses the existing visible
 * product control and checks owner state. No forced completion or fake clock. */
(function(){
 'use strict';
 const E=window.PM56_EXT;
 let active=null,serial=0;
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
  c.state.threads.push(base);c.state.historyMode='closed';c.state.activity.open=false;
  c.state.editorTabs=[];c.state.activeEditor=null;c.state.editorRevealed=false;
  c.state.demoOpen=false;c.state.menu=null;c.state.dialog=null;c.state.hover=null;
  c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};
  c.state.capabilities.goal=false;c.state.composer='';window.PM56_RUNTIME.composer.destination=null;
  active={id,threadId:tid,planId:pid,step:0,initial:clone(blocks),events:[],error:null};
  c.switchThread(tid);c.renderApp();
 }
 async function advance(){
  if(!active||active.busy)return;const a=active,f=flows[a.id],step=f.steps[a.step];if(!step)return;
  const settle=()=>new Promise(resolve=>setTimeout(resolve,170));a.busy=true;
  try{
   const p=plan();const name=step[2];
   if(name==='open'){invoke('pd-info',{id:p.plan_id});}
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
 E.slot('composerBelow',c=>{
  if(!active||c.state.selectedThread!==active.threadId)return '';
  const a=active,f=flows[a.id],done=finished(),s=f.steps[a.step],wait=s&&s[2]==='wait';
  const title=done?(a.id==='complete'?'Plan completed · 2 of 2 tasks':'V2 ready · V1 preserved'):(s?s[0]:'Review result');
  return '<div class="plan-demo-guide" data-k="plan-demo-guide"><div><small>Guided demo · '+c.esc(f.label)+'</small><strong>'+c.esc(title)+'</strong></div><div class="plan-demo-controls">'+
   (done?'<button data-action="plan-demo-replay">Replay</button>':'<button data-action="plan-demo-next"'+(wait||a.busy?' disabled':'')+'>'+c.esc(s?s[1]:'Continue')+'</button>')+
   '<button class="plan-demo-close" data-action="plan-demo-close" title="Close guide">'+c.icon('close',14)+'</button></div>'+
   (a.error?'<p role="status">'+c.esc(a.error)+'</p>':'')+'</div>';
 });
 E.action('plan-demo-start',(c,b)=>{start(b.dataset.flow);return true;});
 E.action('plan-demo-next',()=>{advance();return true;});
 E.action('plan-demo-replay',()=>{if(active)start(active.id);return true;});
 E.action('plan-demo-close',()=>{active=null;ctx().renderApp();return true;});
 E.chainAction('reset-all',()=>{active=null;return false;});
 const G=window.PM56_REPAIR_DEMOS;
 if(G){const old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Guided Plan workflows</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="plan-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.summary)+'</small></button>').join('')+'</div></section>'+old(c);}
 window.PM56_PLAN_DEMOS={start,snapshot:()=>active?clone({...active,finished:!!finished()}):null};
})();
