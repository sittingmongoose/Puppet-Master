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
 function choices(c,name,current,rows,tid){return '<div class="eli5-choices" role="radiogroup" aria-label="'+c.esc(name)+'">'+rows.map(([v,label,detail])=>'<button class="eli5-choice" role="radio" aria-checked="'+(current===v)+'" data-action="eli5-set" data-scope="'+name+'" data-thread="'+c.esc(tid)+'" data-value="'+(v===null?'inherit':v?'on':'off')+'"><span class="eli5-radio">'+(current===v?c.icon('check',12):'')+'</span><span><strong>'+c.esc(label)+'</strong>'+(detail?'<small>'+c.esc(detail)+'</small>':'')+'</span></button>').join('')+'</div>';}
 function dialog(c){const d=c.state.dialog;if(d?.type!=='eli5-style')return '';const r=resolve(d.threadId),stale=!r.ok||r.threadId!==c.thread.id||r.projectId!==d.projectId;
  if(stale)return '<section class="dialog eli5-dialog"><div class="dialog-head"><h2>Conversation changed</h2></div><div class="dialog-body"><p>Open explanation preferences from the current conversation.</p><button class="soft-button" data-action="close-dialog">Close</button></div></section>';
  return '<section class="dialog eli5-dialog" role="dialog" aria-modal="true" aria-label="Explanation style"><div class="dialog-head"><div><small>ELI5</small><h2>Explanation style</h2></div><button class="icon-button" data-action="close-dialog" aria-label="Close">'+c.icon('close',13)+'</button></div><div class="dialog-body"><p class="eli5-lede">For future replies in this conversation.</p>'+choices(c,'conversation',r.override,[[null,'Use default',valueName(r.inherited)+' · '+(r.projectDefault===null?'application':'project')],[true,'On','Plain language, without changing technical details.'],[false,'Off','Standard explanations.']],r.threadId)+
   '<details data-k="eli5-defaults" class="eli5-defaults"'+(d.defaultsOpen?' open':'')+'><summary>Application & project defaults</summary><h3>Application</h3>'+choices(c,'application',r.appDefault,[[false,'Off',''],[true,'On','']],r.threadId)+'<h3>This project</h3>'+choices(c,'project',r.projectDefault,[[null,'Use application default',valueName(r.appDefault)],[true,'On',''],[false,'Off','']],r.threadId)+'</details><p class="eli5-boundary">Session-only concept preferences. Existing answers and work products stay unchanged.</p></div><footer class="eli5-footer"><span>'+valueName(r.effective)+' · '+(r.source==='conversation'?'conversation override':r.source+' default')+'</span><button class="primary-button" data-action="close-dialog">Done</button></footer></section>';
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
 document.addEventListener('toggle',event=>{const c=E.ctx();if(event.target.isConnected&&event.target.matches?.('.eli5-defaults')&&c.state.dialog?.type==='eli5-style')c.state.dialog.defaultsOpen=event.target.open;},true);
 E.slot('dialog',dialog);
 E.chainAction('demo-trigger',(c,b)=>{if(b.dataset.trigger==='ELI5 receipt'){window.PM56_ELI5_DEMOS?.start('override');return true;}return false;});
 window.PM56_ELI5={resolve,setThread,setProject,setApplication,wand,open,project,
  snapshot:()=>copy(state())};
})();
