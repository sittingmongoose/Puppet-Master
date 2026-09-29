/* Recorded examples for Revert Last Agent Edit (Demo Studio). All review, confirmation, conflict and
 * export actions run through PM56_REVERT; the guide cannot supply a successful result. The example's
 * workspace is marked provenance 'recorded' (IMPACT A3-03), so the "Demo: no real files are touched."
 * line shows on its sheet, files row and document, and never on a live change. The guides use the one
 * recorded-example look (pmxGuide, G-25): the dock line, a first row in the Revert document, and one
 * line in the sheet for the conflict example's "change a file yourself" control. */
(function(){
 'use strict';const E=window.PM56_EXT,R=window.PM56_REVERT,S=window.PM56_SHELL,copy=x=>JSON.parse(JSON.stringify(x));let active=null,seq=0;
 const flows={whole:{title:'Revert one whole change',detail:'The assistant edits a file, makes one and deletes one; revert puts all three back together.'},conflict:{title:'Your later edit is protected',detail:'Change a file after the assistant did; revert refuses and leaves every file as it is.'}};
 const baseline=[{path:'src/checkout.js',body:'// Display currency: USD\nexport const buttonLabel = "Pay now";\n'},{path:'src/legacy-label.js',body:'export const legacyLabel = "Pay now";\n'},{path:'notes/launch.txt',body:'User note: keep the launch checklist.\n'}];
 const changes=[{path:'src/checkout.js',body:'// Display currency: USD\nimport { buttonLabel } from "./checkout-label.js";\nexport { buttonLabel };\n'},{path:'src/checkout-label.js',body:'export const buttonLabel = "Continue";\n'},{path:'src/legacy-label.js',body:null}];
 function start(kind){if(!flows[kind])return;const c=E.ctx(),debug=window.PM56_DEBUG?.active();if(debug&&['running','attention_required'].includes(debug.status))window.PM56_DEBUG.cancel(debug.id);
  const id='revert-demo-'+kind+'-'+(++seq),t=copy(c.state.threads.find(x=>x.id==='plain')||c.state.threads[0]);Object.assign(t,{id,title:flows[kind].title+' · recorded example',projectId:'concept:revert:'+seq,pinned:false,archived:false,goalId:null,messages:[{id:id+'-user',role:'user',type:'text',body:'Extract the checkout button label into a shared file and remove the legacy helper.'}]});c.state.threads.push(t);
  Object.assign(c.state,{mode:'Agent',menu:null,dialog:null,hover:null,historyMode:'closed',editorTabs:[],activeEditor:null,editorRevealed:false,composer:'',demoOpen:false});c.state.activity.open=false;c.state.capabilities.goal=false;c.state.work={step:0,running:false,started:false,completed:false,elapsed:0};window.PM56_RUNTIME.composer.destination=null;c.switchThread(id);
  const ws=R.createWorkspace(copy(baseline),{provenance:'recorded'});active={kind,threadId:id,workspaceId:ws.id,turnId:null,changed:false};c.renderApp();
 }
 function run(){if(!active||active.threadId!==E.ctx().thread.id||active.turnId)return;const out=R.applyTurn(active.workspaceId,copy(changes),'Moved the checkout button label into its own file, changed it to “Continue,” and removed the old helper. Three example files changed.');if(out.ok)active.turnId=out.id;E.ctx().renderApp();}
 /* the dock guide (composerBelow) or, when the editor covers the chat at narrow widths, the document's first row;
    it hides while any sheet is open */
 function guide(c,inEditor=false){if(!active||c.thread.id!==active.threadId||c.state.dialog)return '';if((innerWidth<=1100&&c.state.editorRevealed)!==inEditor)return '';const r=active.turnId?R.get(active.turnId):null;
  /* one short action per step keeps the shared guide readable in a narrow chat; "See what happened" is on the
     outcome line in the chat itself */
  const tid=r?'data-value="'+c.esc(r.id)+'"':'',open={action:'af-revert-preview',attrs:tid,label:'Open Revert'},replay={action:'revert-demo-replay',label:'Replay'};
  let step,acts;
  if(!r){step='Let the assistant make its example change: it edits one file, makes one and deletes one.';acts=[{action:'revert-demo-apply',label:'Make the change'}];}
  else if(r.state==='reverted'){step='All 3 files are back as they were. The chat and its record stay.';acts=[replay];}
  else if(r.state==='conflict'){step='Revert refused because checkout.js changed after the assistant’s edit. Nothing was touched.';acts=[replay];}
  /* the guide follows the example's own state: a finished example, or a newer change after it, never points at a
     sheet that can only say no */
  else if(r.state==='skipped'){step='Every file was already back as it was, so revert changed nothing. The chat and its record stay.';acts=[replay];}
  else if(r.state==='failed'||r.state==='recovery'){step='Revert didn’t finish. Your files are exactly as they were before trying.';acts=[replay];}
  else if(R.availability(r.id).code==='revert_not_latest'){step='A newer change came after the example, so only that one can be reverted now.';acts=[replay];}
  else if(active.kind==='conflict'){step=active.changed?'You changed checkout.js after the assistant. Revert will refuse and touch nothing.':'Open Revert, then change checkout.js yourself before you confirm.';acts=[open];}
  else{step='The assistant changed 3 files. Revert puts all of them back together.';acts=[open];}
  return S.pmxGuide({key:inEditor?'revert-demo-guide:doc':'revert-demo-guide',cls:'revert-demo-guide',placement:inEditor?'doc':'dock',step:c.esc(step),actions:acts,close:{action:'revert-demo-close',label:'Close guide'}});
 }
 /* one line under the sheet's lead, only in the conflict example: the control that plays the reader's own edit */
 function dialogGuide(c,id,matches){if(!active||active.kind!=='conflict'||active.threadId!==c.thread.id||active.turnId!==id)return '';
  /* after the edit the step names the next thing to press; the line keeps its height (revert-demo-batch10.css) */
  const r=R.get(id),n=r?r.manifest.length:0,go='Revert '+n+(n===1?' file':' files');
  return S.pmxGuide({key:'revert-demo-injection',cls:'revert-demo-injection',placement:'sheet',step:active.changed?'You edited checkout.js after this check. Now press '+go+'.':'Edit a file yourself before you revert.',actions:active.changed?[]:[{action:'revert-demo-change',label:'Change checkout.js'}]});}
 E.slot('composerBelow',c=>guide(c));E.action('revert-demo-start',(c,b)=>{start(b.dataset.flow);return true;});E.action('revert-demo-apply',()=>{run();return true;});
 E.action('revert-demo-change',c=>{if(active&&active.threadId===c.thread.id&&!active.changed&&c.state.dialog?.type==='revert-confirm'&&c.state.dialog.turnId===active.turnId){const w=R.workspace(active.workspaceId),f=w.files.find(x=>x.path==='src/checkout.js');const out=R.example.edit(w.id,f.path,f.body.replace('currency: USD','currency: EUR'));if(out.ok)active.changed=true;}c.renderOverlays();
  /* the pressed control leaves with its step: focus goes to the sheet's safe default (Cancel), never to the warm primary */
  const a=document.activeElement;if(!a||a===document.body||!a.isConnected){const f=document.querySelector('#pmOverlayRoot .revert-confirm:not(.pmx-ghost) [data-pmx-autofocus]:not([disabled])');if(f)try{f.focus({preventScroll:true});}catch(e){}}return true;});
 E.action('revert-demo-replay',()=>{if(active)start(active.kind);return true;});E.action('revert-demo-close',c=>{active=null;c.renderApp();return true;});
 E.chainAction('reset-all',()=>{active=null;return false;});['plan-demo-start','schedule-demo-start','review-demo-start','brainstorm-demo-start','crew-demo-start','room-demo-start','teach-demo-start','memory-demo-start','debug-demo-start'].forEach(a=>E.chainAction(a,()=>{active=null;return false;}));
 const G=window.PM56_REPAIR_DEMOS,old=G.gallery;G.gallery=c=>'<section class="demo-section"><h3>Revert Last Agent Edit · recorded examples</h3><div class="demo-section-body">'+Object.entries(flows).map(([id,f])=>'<button class="demo-trigger" data-action="revert-demo-start" data-flow="'+id+'"><strong>'+c.esc(f.title)+'</strong><small>'+c.esc(f.detail)+'</small></button>').join('')+'</div></section>'+old(c);
 window.PM56_REVERT_DEMOS={start,guide,dialogGuide,snapshot:()=>active?copy(active):null};
})();
