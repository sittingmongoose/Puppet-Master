/* Recorded examples for Revert Last Agent Edit (Demo Studio). All review, confirmation, conflict and
 * export actions run through PM56_REVERT; the guide cannot supply a successful result. The example's
 * workspace is marked provenance 'recorded' (IMPACT A3-03), so the "Demo: no real files are touched."
 * line shows on its sheet, files row and document, and never on a live change. The guides use the one
 * recorded-example look (pmxGuide, G-25): the dock line, a first row in the Revert document, and one
 * line in the sheet for the conflict example's "change a file yourself" control.
 * Playback (2026-10-22, Jared: recorded examples play on their own after Start): both examples play from Start through
 * PM56_RECPLAY, paced to read. The assistant makes its change by itself; your part is played on the product's own
 * control (Revert on the files row under its reply, lit first), and in the conflict example your own edit of
 * checkout.js is played as yours. Both stop where the product waits for you: Revert's confirm. The sheet's guide line
 * says what you are asked; after you answer, the result ends the example. The guides' only buttons are Replay and
 * Close. */
(function(){
 'use strict';const E=window.PM56_EXT,R=window.PM56_REVERT,S=window.PM56_SHELL,P=window.PM56_RECPLAY,copy=x=>JSON.parse(JSON.stringify(x));let active=null,seq=0;
 const flows={whole:{title:'Revert one whole change',detail:'The assistant edits a file, makes one and deletes one; revert puts all three back together.'},conflict:{title:'Your later edit is protected',detail:'Change a file after the assistant did; revert refuses and leaves every file as it is.'}};
 const baseline=[{path:'src/checkout.js',body:'// Display currency: USD\nexport const buttonLabel = "Pay now";\n'},{path:'src/legacy-label.js',body:'export const legacyLabel = "Pay now";\n'},{path:'notes/launch.txt',body:'User note: keep the launch checklist.\n'}];
 const changes=[{path:'src/checkout.js',body:'// Display currency: USD\nimport { buttonLabel } from "./checkout-label.js";\nexport { buttonLabel };\n'},{path:'src/checkout-label.js',body:'export const buttonLabel = "Continue";\n'},{path:'src/legacy-label.js',body:null}];
 function start(kind){if(!flows[kind])return;const c=E.ctx(),debug=window.PM56_DEBUG?.active();if(debug&&['running','attention_required'].includes(debug.status))window.PM56_DEBUG.cancel(debug.id);
  const id='revert-demo-'+kind+'-'+(++seq),t=copy(c.state.threads.find(x=>x.id==='plain')||c.state.threads[0]);Object.assign(t,{id,title:flows[kind].title+' · recorded example',projectId:'concept:revert:'+seq,pinned:false,archived:false,goalId:null,messages:[{id:id+'-user',role:'user',type:'text',body:'Extract the checkout button label into a shared file and remove the legacy helper.'}]});c.state.threads.push(t);
  Object.assign(c.state,{mode:'Agent',menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:'',demoOpen:false});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,started:false,completed:false,elapsed:0};window.PM56_RUNTIME.composer.destination=null;c.switchThread(id);
  const ws=R.createWorkspace(copy(baseline),{provenance:'recorded'});active={kind,threadId:id,workspaceId:ws.id,turnId:null,changed:false,opened:false};playback();c.renderApp();
 }
 function run(){if(!active||active.threadId!==E.ctx().thread.id||active.turnId)return;const out=R.applyTurn(active.workspaceId,copy(changes),'Moved the checkout button label into its own file, changed it to “Continue,” and removed the old helper. Three example files changed.');if(out.ok)active.turnId=out.id;E.ctx().renderApp();}
 /* the recording: next() names the next beat from the example's own state (PM56_RECPLAY) */
 const PACE={first:1400,look:3600,open:5600,change:3600};
 const sheetOn=c=>c.state.dialog?.type==='revert-confirm'&&c.state.dialog.turnId===active.turnId;
 function edit(){const c=E.ctx();if(!active||active.changed||!sheetOn(c))return false;const w=R.workspace(active.workspaceId),f=w.files.find(x=>x.path==='src/checkout.js');const out=R.example.edit(w.id,f.path,f.body.replace('currency: USD','currency: EUR'));if(out.ok)active.changed=true;c.renderOverlays();return !!out.ok;}
 function next(){const a=active;if(!a)return null;const c=E.ctx(),r=a.turnId?R.get(a.turnId):null;
  if(!r)return {id:'apply',wait:PACE.first,run:()=>{run();return true;}};
  if(['reverted','conflict','skipped','failed','recovery'].includes(r.state)||R.availability(r.id).code==='revert_not_latest')return null;
  if(sheetOn(c)){if(a.kind==='conflict'&&!a.changed)return {id:'change',dialog:'revert-confirm',wait:PACE.change,run:()=>edit()};return null;}
  /* the files row first, as a pointer resting on it would show it: what changed, file by file */
  if(!a.looked)return {id:'look',wait:PACE.look,run:()=>P.hover('.transcript .pmx-revert-row[data-turn-id="'+CSS.escape(r.id)+'"]').then(ok=>{if(ok)a.looked=true;return ok;})};
  if(!a.opened)return {id:'open',wait:PACE.open,run:()=>P.press('.transcript [data-action="af-revert-preview"][data-value="'+CSS.escape(r.id)+'"]').then(ok=>{if(ok)a.opened=true;return ok;})};
  return null;}
 let player=null;
 function playback(){if(player)player.stop();const s=active;player=P.play({key:'revert-demo',live:()=>active===s,threads:()=>[s.threadId],next,render:()=>{const c=E.ctx();c.renderApp();if(c.state.dialog)c.renderOverlays();},superseded:()=>{if(active===s)active=null;}});}
 function stop(){if(player){player.stop();player=null;}}
 /* the dock guide (composerBelow) or, when the editor covers the chat at narrow widths, the document's first row;
    it hides while any sheet is open */
 function guide(c,inEditor=false){if(!active||c.thread.id!==active.threadId||c.state.dialog)return '';if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';const r=active.turnId?R.get(active.turnId):null;
  const replay={action:'revert-demo-replay',label:'Replay'};
  let step,acts=[],end=false;
  if(player&&player.errors.length){step='This step couldn’t run, so the recording stopped here. Replay starts it again.';end=true;}
  else if(!r)step='The assistant is about to make its example change: it edits one file, makes one and deletes one.';
  else if(r.state==='reverted'){step='Done · All 3 files are back as they were. The chat and its record stay.';end=true;}
  else if(r.state==='conflict'){step='Done · Revert refused because checkout.js changed after the assistant’s edit. Nothing was touched.';end=true;}
  /* the guide follows the example's own state: a finished example, or a newer change after it, never points at a
     sheet that can only say no */
  else if(r.state==='skipped'){step='Done · Every file was already back as it was, so revert changed nothing. The chat and its record stay.';end=true;}
  else if(r.state==='failed'||r.state==='recovery'){step='Revert didn’t finish. Your files are exactly as they were before trying.';end=true;}
  else if(R.availability(r.id).code==='revert_not_latest'){step='A newer change came after the example, so only that one can be reverted now.';end=true;}
  else if(active.opened){step='Your move: Revert on the files row under the reply opens the confirm again. Nothing goes back until you confirm.';end=true;}
  else if(!active.looked)step='The assistant made its change. Next: the files row under its reply shows what changed.';
  else step=active.kind==='conflict'?'It edited checkout.js, made checkout-label.js and deleted legacy-label.js. Next: you open Revert from that row, then change checkout.js yourself before you confirm.':'It edited checkout.js, made checkout-label.js and deleted legacy-label.js. Next: you open Revert from that row. It puts all three back together.';
  const text=P.steady(active,step,end,()=>E.ctx().renderApp());if(end&&text===step)acts=[replay];
  return S.pmxGuide({key:inEditor?'revert-demo-guide:doc':'revert-demo-guide',cls:'revert-demo-guide',placement:inEditor?'doc':'dock',step:c.esc(text),actions:acts,next:player&&player.progress(),close:{action:'revert-demo-close',label:'Close guide'}});
 }
 /* one line under the sheet's lead: what you are asked. In the conflict example the recording first plays your own edit
    of checkout.js (no button: it happens by itself), then the confirm is yours. */
 function dialogGuide(c,id,matches){if(!active||active.threadId!==c.thread.id||active.turnId!==id)return '';
  /* after the edit the step names the next thing to press; the line keeps its height (revert-demo-batch10.css) */
  const r=R.get(id),n=r?r.manifest.length:0,go='Revert '+n+(n===1?' file':' files');
  const step=r&&r.state==='conflict'?'Done · Revert refused: checkout.js changed after the assistant’s edit, so nothing was touched.':active.kind==='conflict'&&!active.changed?'Next: you edit checkout.js yourself, after the assistant did.':active.kind==='conflict'?'Your move: you edited checkout.js. Now press '+go+'.':'Your move: press '+go+' to put them back, or Cancel.';
  return S.pmxGuide({key:'revert-demo-injection',cls:'revert-demo-injection',placement:'sheet',step,actions:[],next:player&&player.progress()});}
 E.slot('composerBelow',c=>guide(c));E.action('revert-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('revert-demo-apply',()=>{run();return true;});
 E.action('revert-demo-change',c=>{if(active&&active.threadId===c.thread.id&&!active.changed&&c.state.dialog?.type==='revert-confirm'&&c.state.dialog.turnId===active.turnId){const w=R.workspace(active.workspaceId),f=w.files.find(x=>x.path==='src/checkout.js');const out=R.example.edit(w.id,f.path,f.body.replace('currency: USD','currency: EUR'));if(out.ok)active.changed=true;}c.renderOverlays();
  /* the pressed control leaves with its step: focus goes to the sheet's safe default (Cancel), never to the warm primary */
  const a=document.activeElement;if(!a||a===document.body||!a.isConnected){const f=document.querySelector('#pmOverlayRoot .revert-confirm:not(.pmx-ghost) [data-pmx-autofocus]:not([disabled])');if(f)try{f.focus({preventScroll:true});}catch(e){}}return true;});
 E.action('revert-demo-replay',()=>{if(active)start(active.kind);return true;});E.action('revert-demo-close',c=>{stop();active=null;c.renderApp();return true;});
 E.chainAction('reset-all',()=>{stop();active=null;return false;});['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start','room-demo-start','teach-demo-start','memory-demo-start','debug-demo-start'].forEach(a=>E.chainAction(a,()=>{stop();active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Revert Last Agent Edit · recorded examples</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="revert-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.title)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+old(c);
 window.PM56_REVERT_DEMOS={start,guide,dialogGuide,snapshot:()=>active?copy(active):null};
})();
