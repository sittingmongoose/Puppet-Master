/* B11. One resolver over the existing Assistant ELI5 preference store.
 * Session-only concept preferences; no native Settings, persistence or provider claims.
 * Changes affect future request snapshots, not historical answers or work products. */
(function(){
 'use strict';
 const E=window.PM56_EXT,RT=window.PM56_RUNTIME,has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const copy=x=>JSON.parse(JSON.stringify(x));
 function state(){const f=RT.features.eli5;f.perThread=f.perThread||{};f.projectDefaults=f.projectDefaults||{};return f;}
 function thread(id){return E.ctx().state.threads.find(t=>t.id===id)||null;}
 function project(t){return String(t.projectId||t.project_id||'concept:default-project');}
 function valid(v){return v===true||v===false||v===null;}
 function resolve(id){
  const t=thread(id);if(!t)return {ok:false,error:'unknown_thread'};
  const s=state(),pid=project(t),override=has(s.perThread,id)?s.perThread[id]:null;
  const pd=has(s.projectDefaults,pid)?s.projectDefaults[pid]:null;
  const app=s.appDefault===true, inherited=pd===null?app:pd;
  return {ok:true,threadId:id,projectId:pid,override,projectDefault:pd,appDefault:app,
   inherited,effective:override===null?inherited:override,
   source:override!==null?'conversation':pd!==null?'project':'application',persistence:'session_only'};
 }
 function setThread(id,value){if(!valid(value))return {ok:false,error:'invalid_value'};if(!thread(id))return {ok:false,error:'unknown_thread'};const s=state();if(value===null)delete s.perThread[id];else s.perThread[id]=value;return resolve(id);}
 function setProject(pid,value){if(!pid||!valid(value))return {ok:false,error:'invalid_value'};if(!E.ctx().state.threads.some(t=>project(t)===pid))return {ok:false,error:'unknown_project'};const s=state();if(value===null)delete s.projectDefaults[pid];else s.projectDefaults[pid]=value;return {ok:true};}
 function setApplication(value){if(typeof value!=='boolean')return {ok:false,error:'invalid_value'};state().appDefault=value;return {ok:true};}
 function open(c){const r=resolve(c.thread.id);c.closeMenu();c.openDialog({type:'eli5-style',threadId:r.threadId,projectId:r.projectId});}
 const valueName=v=>v?'On':'Off';
 function wand(c){const r=resolve(c.thread.id);return '<button class="menu-item af-wand-row" data-action="eli5-open"><span class="menu-icon">'+c.icon('sparkles',13)+'</span><span class="menu-copy"><strong>ELI5 explanations</strong><span>'+valueName(r.effective)+' · '+(r.source==='conversation'?'this conversation':r.source+' default')+'</span></span><span class="menu-right">'+c.icon('chevronRight',11)+'</span></button>';}
 function choices(c,name,current,rows,tid){const S=window.PM56_SHELL;return '<div class="eli5-choices" role="radiogroup" aria-label="'+c.esc(name)+'">'+rows.map(([v,label,detail])=>S.choice({value:v===null?'inherit':v?'on':'off',label:c.esc(label),detail:detail?c.esc(detail):'',active:current===v,action:'eli5-set',extra:' data-scope="'+c.esc(name)+'" data-thread="'+c.esc(tid)+'"'})).join('')+'</div>';}
 function dialog(c){const d=c.state.dialog;if(d?.type!=='eli5-style')return '';const S=window.PM56_SHELL,r=resolve(d.threadId),stale=!r.ok||r.threadId!==c.thread.id||r.projectId!==d.projectId;
  if(stale)return S.dialog({iconHtml:c.icon('warning',15),title:'Conversation changed',width:560,body:S.note('Open explanation preferences from the current conversation.'),foot:S.foot('','<button class="soft-button" data-action="close-dialog">Close</button>')});
  return S.dialog({iconHtml:c.icon('sparkles',15),title:'Explanation style',sub:'ELI5 restates the answer in plain language beside the technical one. Presentation only — code, Plans and work products are byte-identical either way.',pill:c.esc(valueName(r.effective)),width:560,
   body:S.section({iconHtml:c.icon('chat',12),label:'This conversation',body:choices(c,'conversation',r.override,[[null,'Use default',valueName(r.inherited)+' · '+(r.projectDefault===null?'application':'project')],[true,'On','Plain language, without changing technical details.'],[false,'Off','Standard explanations.']],r.threadId)})+
    S.disclosure('eli5-defaults',c.esc('Application & project defaults'),'<div class="mdl-field"><span>Application</span>'+choices(c,'application',r.appDefault,[[false,'Off',''],[true,'On','']],r.threadId)+'</div><div class="mdl-field"><span>This project</span>'+choices(c,'project',r.projectDefault,[[null,'Use application default',valueName(r.appDefault)],[true,'On',''],[false,'Off','']],r.threadId)+'</div>',d.defaultsOpen,'eli5-defaults'),
   foot:S.foot(S.note('Session-only concept preferences. Existing answers and work products stay unchanged.'),'<button class="soft-button" data-action="close-dialog">Close</button>')});
 }
 E.action('eli5-open',c=>{open(c);return true;});
 E.action('eli5-set',(c,b)=>{
  const d=c.state.dialog;if(d?.type!=='eli5-style'||d.threadId!==c.thread.id||b.dataset.thread!==d.threadId||project(c.thread)!==d.projectId)return true;
  if(!['inherit','on','off'].includes(b.dataset.value))return true;
  const value=b.dataset.value==='inherit'?null:b.dataset.value==='on';
  if(b.dataset.scope==='conversation')setThread(d.threadId,value);
  else if(b.dataset.scope==='project')setProject(d.projectId,value);
  else if(b.dataset.scope==='application')setApplication(value);
  c.renderApp();return true;
 });
 document.addEventListener('toggle',event=>{const c=E.ctx();if(event.target.isConnected&&event.target.matches?.('.eli5-defaults,[data-k="eli5-defaults"]')&&c.state.dialog?.type==='eli5-style')c.state.dialog.defaultsOpen=event.target.open;},true);
 E.slot('dialog',dialog);
 E.chainAction('demo-trigger',(c,b)=>{if(b.dataset.trigger==='ELI5 receipt'){window.PM56_ELI5_DEMOS?.start('override');return true;}return false;});
 window.PM56_ELI5={resolve,setThread,setProject,setApplication,wand,open,project,
  snapshot:()=>copy(state())};
})();
