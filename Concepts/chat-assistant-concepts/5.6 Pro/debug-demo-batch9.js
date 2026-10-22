/* B09 gallery-only fixtures. Product actions perform every investigation step.
   Playback (2026-10-22, Jared: recorded examples play on their own after Start): both examples play from Start through
   PM56_RECPLAY, paced to read. Debug mode starts the investigation on the bound file, and each phase is pressed on the
   investigation's own control in its document (Capture baseline, Reproduce, Inspect diagnosis, Apply repair, Verify
   repair, Finish cleanup), lit first. In the drift example another edit lands on line-total.js before the repair (played
   as someone else's), so Apply repair finds the change and touches nothing; the investigation then waits on your decision,
   Rebind changed target, and plays on by itself once you press it. The guide is the one recorded-example look (pmxGuide);
   its only buttons are Replay and Close. */
(function(){
 'use strict';const E=window.PM56_EXT,D=window.PM56_DEBUG,R=window.PM56_RECPLAY,clone=x=>JSON.parse(JSON.stringify(x));let active=null,seq=0;
 const flows={repair:{title:'Reproduce, repair, and close',detail:'Find a zero-quantity bug, verify six cases, and remove the owned collector.'},drift:{title:'Protect a changed target',detail:'Catch another edit before patching; explicitly rebind without losing either history.'}};
 function start(kind){if(!flows[kind])return;const c=E.ctx(),old=D.active();if(old&&['running','attention_required'].includes(old.status))D.cancel(old.id);
  const id='debug-demo-'+kind+'-'+(++seq),t=clone(c.state.threads.find(t=>t.id==='plain')||c.state.threads[0]);Object.assign(t,{id,title:flows[kind].title+' · local example',projectId:'concept:debug:'+seq,pinned:false,archived:false,goalId:null,messages:[{id:id+'-user',role:'user',type:'text',body:'A zero quantity produces a nonzero total. Reproduce it, repair only the cause, and clean up.'}]});c.state.threads.push(t);
  Object.assign(c.state,{mode:'Debug',menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:'',demoOpen:false});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,started:false,completed:false,elapsed:0};window.PM56_RUNTIME.composer.destination=null;c.switchThread(id);
  const target=D.register({path:'examples/line-total.js',body:'// Display currency: USD\n'+D.buggy});active={kind,threadId:id,targetId:target.id,changed:false};playback();c.renderApp();}
 /* the recording: next() names the next beat from the investigation's own state (PM56_RECPLAY) */
 const PACE={first:1200,baseline:4200,reproduce:4000,analyze:5200,apply:5600,verify:4600,cleanup:5200,edit:4200,after:3000};
 const OPS={target_binding:'baseline',baseline_capture:'reproduce',reproduction:'analyze',analysis:'apply',repair:'verify',verification:'cleanup'};
 function edit(){if(!active||active.changed)return false;const s=D.source(active.targetId);D.example.edit(s.id,s.body.replace('currency: USD','currency: EUR'));active.changed=true;E.ctx().renderApp();return true;}
 function next(){const a=active;if(!a)return null;const inv=D.active();
  if(!inv)return {id:'start',wait:PACE.first,run:()=>{const b=document.createElement('button');E.run('af-debug-start',b,new Event('click'));return !!D.active();}};
  if(inv.status!=='running')return null;
  const op=OPS[inv.phase];if(!op)return null;
  /* the drift example: another edit lands before the repair is applied */
  if(a.kind==='drift'&&!a.changed&&op==='apply')return {id:'edit:'+inv.id,wait:PACE.edit,run:edit};
  const sel='.debug-document[data-investigation="'+CSS.escape(inv.id)+'"] [data-action="debug-'+op+'"]';
  return {id:op+':'+inv.id,wait:a.changed&&op==='apply'?PACE.after:PACE[op],run:()=>R.press(sel)};}
 let player=null;
 function playback(){if(player)player.stop();const s=active;player=R.play({key:'debug-demo',live:()=>active===s,threads:()=>[s.threadId],next,render:()=>E.ctx().renderApp(),superseded:()=>{if(active===s)active=null;}});}
 function stop(){if(player){player.stop();player=null;}}
 const SAY={target_binding:'Debug bound line-total.js. Next: capture a baseline, the frozen source and its six-case contract.',
  baseline_capture:'Baseline captured. Next: reproduce the bug with a temporary trace collector.',
  reproduction:'Reproduced: a zero quantity gives a nonzero total. Next: inspect the diagnosis.',
  analysis:'Diagnosis: the || fallback treats an explicit zero as missing. Next: apply the one-expression repair.',
  repair:'Repair applied: || became ??. Next: verify all six cases on the repaired file.',
  verification:'All six cases pass. Next: finish cleanup, removing the temporary collector.'};
 function say(){const a=active,inv=D.active();
  if(player&&player.errors.length)return {text:'This step couldn’t run, so the recording stopped here. Replay starts it again.',done:true};
  if(!inv)return {text:'You asked Debug to reproduce a zero-quantity bug and repair only its cause. Next: it binds the example file, line-total.js.'};
  if(inv.status==='resolved')return {text:'Done · Repair verified and cleanup complete. Zero stays zero, the other five cases still pass, and the collector is gone.',done:true};
  if(inv.status==='attention_required')return {text:'Your move: line-total.js changed after Debug bound it, so no patch was applied. Press Rebind changed target in the investigation to start again on the new source; both histories are kept.',done:true,yours:true};
  if(['cancelled','blocked','failed_cleanup'].includes(inv.status))return {text:'This investigation ended. Replay starts the example again.',done:true};
  if(a.kind==='drift'&&!inv.priorInvestigationId&&inv.phase==='analysis'&&!a.changed)return {text:'Diagnosis: the || fallback treats an explicit zero as missing. Next: someone else edits line-total.js before the repair lands.'};
  if(a.kind==='drift'&&!inv.priorInvestigationId&&inv.phase==='analysis')return {text:'Someone else changed line-total.js (USD became EUR). Next: Apply repair checks the file first.'};
  if(inv.priorInvestigationId&&inv.phase==='target_binding')return {text:'Rebound: a new investigation on the changed file; the first one keeps its history. Next: capture a fresh baseline.'};
  return {text:SAY[inv.phase]||''};}
 function guide(c,inEditor=false){if(!active||c.thread.id!==active.threadId||c.state.dialog)return '';if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const s=say(),text=R.steady(active,s.text,!!s.done,()=>E.ctx().renderApp());if(!text)return '';
  return window.PM56_SHELL.pmxGuide({key:inEditor?'debug-demo-guide:doc':'debug-demo-guide',cls:'debug-demo-guide',placement:inEditor?'doc':'dock',caption:'Recorded example · no provider calls',step:c.esc(text),
   actions:s.done&&text===s.text?[{action:'debug-demo-replay',label:'Replay'}]:[],next:player&&player.progress(),close:{action:'debug-demo-close',label:'Close the example'}});}
 E.slot('composerBelow',c=>guide(c));E.action('debug-demo-start',(c,b)=>{start(b.dataset.flow);return true;});
 E.action('debug-demo-change',c=>{if(active&&!active.changed){const s=D.source(active.targetId);D.example.edit(s.id,s.body.replace('currency: USD','currency: EUR'));active.changed=true;}c.renderApp();return true;});
 E.action('debug-demo-close',c=>{stop();active=null;c.renderApp();return true;});E.action('debug-demo-replay',()=>{if(active)start(active.kind);return true;});
 E.chainAction('reset-all',()=>{stop();active=null;return false;});['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start','room-demo-start','teach-demo-start','memory-demo-start'].forEach(a=>E.chainAction(a,()=>{stop();const inv=D.active();if(inv&&['running','attention_required'].includes(inv.status))D.cancel(inv.id);active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Guided Debug workflows</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="debug-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.title)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+old(c);
 window.PM56_DEBUG_DEMOS={start,guide,snapshot:()=>active?clone(active):null};
})();
