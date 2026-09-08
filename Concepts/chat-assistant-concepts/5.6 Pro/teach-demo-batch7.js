/* B07 gallery: user-confirmed capture, then correction/revocation. No provider simulation. */
(function(){
 'use strict';const E=window.PM56_EXT,T=window.PM56_TEACH,clone=x=>JSON.parse(JSON.stringify(x));let current=null,seq=0;
 const rule='Before changing a generated file, edit its source and rebuild the output.';
 const corrected='Before changing a generated file, edit its source, rebuild, and compare the generated output.';
 const flows={capture:{label:'Capture deliberate guidance',detail:'Select a message, confirm project scope, and inspect the next-context preview.'},correct:{label:'Correct without erasing history',detail:'Teach a rule, save a replacement version, then revoke it without reviving the old one.'}};
 function start(kind){if(!flows[kind])return;const c=E.ctx(),id='teach-demo-'+kind+'-'+(++seq),t=clone(c.state.threads.find(t=>t.id==='plain')||c.state.threads[0]);
  Object.assign(t,{id,title:flows[kind].label+' · local example',goalId:null,status:'ready',pinned:false,archived:false,projectId:'concept:teach-example:'+seq,messages:[{id:id+'-request',role:'user',type:'text',body:'Help me keep generated files consistent with their source.'},{id:id+'-guidance',role:'assistant',type:'text',body:rule}]});
  c.state.threads.push(t);Object.assign(c.state,{mode:'Ask',menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:''});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,expanded:false,started:false,completed:false,elapsed:0,openPhase:null};window.PM56_RUNTIME.composer.destination=null;current={kind,threadId:id,sourceId:id+'-guidance',ids:[]};c.switchThread(id);c.renderApp();
 }
 document.addEventListener('pm56:teach-committed',e=>{if(current&&e.detail.threadId===current.threadId)current.ids.push(e.detail.id);});
 function guide(c,inEditor=false){if(!current||c.thread.id!==current.threadId||c.state.dialog)return '';if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';
  const latest=T.get(current.ids.at(-1)),done=current.kind==='capture'?!!latest:!!latest?.revoked&&!latest.supersededBy;
  let text=!latest?(current.kind==='capture'?'Open the message’s More menu → Save as taught memory.':'Send /teach with a rule, then confirm capture.'):(current.kind==='capture'?'Open teaching and preview next context.':latest.version===1?'Open teaching → Correct; save a new version.':latest.revoked?'Both versions remain in history; neither is used.':'Preview v2, then explicitly revoke it.');
  return '<div class="teach-demo-guide" data-k="teach-guide"><div><small>Local example · no model calls</small><strong>'+c.esc(text)+'</strong></div><div>'+(done?'<button class="soft-button" data-action="teach-demo-replay">Replay</button>':'')+'<button class="icon-button" data-action="teach-demo-close" title="Close guide">'+c.icon('close',12)+'</button></div></div>';
 }
 E.slot('composerBelow',c=>guide(c));E.action('teach-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('teach-demo-replay',()=>{if(current)start(current.kind);return true;});E.action('teach-demo-close',()=>{current=null;E.ctx().renderApp();return true;});
 E.chainAction('reset-all',()=>{current=null;return false;});
 ['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start','room-demo-start'].forEach(a=>E.chainAction(a,()=>{current=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,prev=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Guided Teach workflows</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="teach-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.label)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+prev(c);
 window.PM56_TEACH_DEMOS={start,rule,corrected,snapshot:()=>current?clone(current):null,editorGuide:id=>current?.threadId===id?guide(E.ctx(),true):''};
})();
