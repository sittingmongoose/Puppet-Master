/* B10 — whole-turn reversal for a bounded in-memory text workspace.
 * Private manifests are authority; PM56_FEATURES.revert is a compatibility
 * projection only. Exact contents, existence and per-path revision are checked
 * again at confirmation. A single synchronous Map swap publishes all inverses.
 * This is NOT native FileSafe, filesystem crash recovery or a merge engine.
 */
(function(){
 'use strict';
 const E=window.PM56_EXT,F=window.PM56_FEATURES,clone=x=>JSON.parse(JSON.stringify(x));
 const spaces=new Map(),turns=new Map(),previews=new Map(),disclosures=new Map();let seq=0,epoch=1;
 const uid=p=>'rv-'+p+'-'+epoch+'-'+(++seq),now=()=>new Date().toISOString(),fail=error=>({ok:false,error});
 const scope=()=>{const c=window.PM56_TEACH.context();return {...c,worktree:E.ctx().state.worktree};};
 const sameScope=(a,b)=>['projectId','userId','threadId','consumer','worktree'].every(k=>a[k]===b[k]);
 const permitted=r=>!!r&&r.epoch===epoch&&sameScope(r.scope,scope());
 const copyEntry=e=>e?{body:e.body,revision:e.revision}: {body:null,revision:0};
 const entry=(w,path)=>copyEntry(w.entries.get(path));
 const sameEntry=(a,b)=>a.body===b.body&&a.revision===b.revision;
 const validPath=p=>typeof p==='string'&&p.length>0&&p.length<=240&&!/[\\\x00-\x1f:]/.test(p)&&!p.startsWith('/')&&!p.split('/').some(x=>!x||x==='.'||x==='..'||x==='.git');
 const validBody=b=>b===null||(typeof b==='string'&&b.length<=100000);
 const get=id=>{const r=turns.get(id);return permitted(r)?clone(r):null;};
 function workspace(id){const w=spaces.get(id);return permitted(w)?{id:w.id,scope:clone(w.scope),revision:w.revision,files:[...w.entries].map(([path,e])=>({path,...clone(e)}))}:null;}
 function latest(workspaceId){return [...turns.values()].filter(r=>permitted(r)&&(!workspaceId||r.workspaceId===workspaceId)&&r.manifest.length).at(-1)||null;}
 function availability(id){const r=turns.get(id);if(!permitted(r))return {eligible:false,reason:'No current local edit manifest is attached to this turn.'};
  if(!r.manifest.length)return {eligible:false,reason:'This turn made no file changes.'};
  if(r.state==='reverted')return {eligible:false,reason:'This entire turn has already been reverted.'};
  if(r.state==='kept')return {eligible:false,reason:'Current files were explicitly kept. This attempt is closed.'};
  if(latest()?.id!==r.id)return {eligible:false,reason:'A newer agent edit exists in this thread. Review that turn first.'};
  return {eligible:true,reason:''};
 }
 function project(r){const a=availability(r.id);F.state().revert.manifests[r.id]={protocol:'local-revert-v1',turnId:r.id,eligible:a.eligible,reason:a.reason,state:r.state,files:r.manifest.map(f=>({path:f.path,kind:f.kind,stat:'',reverted:r.state==='reverted'}))};}
 function createWorkspace(files){if(scope().consumer!=='assistant'||!Array.isArray(files)||files.length>40)return fail('invalid_workspace');const entries=new Map();
  for(const f of files){if(!f||!validPath(f.path)||typeof f.body!=='string'||!validBody(f.body)||entries.has(f.path))return fail('invalid_file');entries.set(f.path,{body:f.body,revision:1});}
  const w={id:uid('workspace'),epoch,scope:clone(scope()),revision:1,entries};spaces.set(w.id,w);return {ok:true,id:w.id};
 }
 // Gallery/provider-adapter boundary: commits one actual local agent turn.
 // No flags accepting caller-provided success, conflicts or inverse snapshots.
 function applyTurn(workspaceId,changes,summary){const w=spaces.get(workspaceId);if(!permitted(w))return fail('workspace_scope');if(!Array.isArray(changes)||changes.length>30)return fail('invalid_changes');
  const seen=new Set(),manifest=[];
  for(const change of changes){if(!change||!validPath(change.path)||!validBody(change.body)||seen.has(change.path))return fail('invalid_change');seen.add(change.path);const before=entry(w,change.path);if(before.body===change.body)continue;
   manifest.push({path:change.path,kind:before.body===null?'created':change.body===null?'deleted':'modified',before,after:{body:change.body,revision:before.revision+1}});}
  const staged=new Map(w.entries);for(const f of manifest)staged.set(f.path,clone(f.after));
  const c=E.ctx(),r={id:uid('turn'),epoch,protocol:'local-revert-v1',scope:clone(scope()),workspaceId,state:'idle',revision:1,manifest,previewToken:null,attempts:[],createdAt:now(),summary:String(summary||'Updated the local example files.'),receipt:null};
  w.entries=staged;if(manifest.length)w.revision++;turns.set(r.id,r);for(const x of turns.values())if(permitted(x))project(x);
  c.appendMessage({id:r.id,role:'assistant',type:'text',body:r.summary,time:r.createdAt});
  c.appendMessage({id:uid('changes'),role:'system',type:'revert-turn',turnId:r.id,time:r.createdAt});
  return {ok:true,id:r.id,filesChanged:manifest.length};
 }
 function inspect(r){const w=spaces.get(r.workspaceId);if(!permitted(w))return [];
  return r.manifest.map(f=>{const current=entry(w,f.path);return {path:f.path,kind:f.kind,before:clone(f.before),expected:clone(f.after),current,match:sameEntry(current,f.after),reason:sameEntry(current,f.after)?null:current.body!==f.after.body?(current.body===null?'File is now absent.':f.after.body===null?'The deleted path was recreated.':'Contents changed after the agent turn.'):'Path revision changed after the agent turn.'};});}
 function preview(id){const r=turns.get(id),a=availability(id);if(!a.eligible)return fail(a.reason);const rows=inspect(r);if(rows.length!==r.manifest.length)return fail('workspace_scope');
  if(r.previewToken){const old=previews.get(r.previewToken);if(old)old.cancelled=true;}
  const token=uid('preview'),p={token,turnId:id,epoch,scope:clone(scope()),rows,createdAt:now(),cancelled:false,result:null};previews.set(token,p);r.previewToken=token;r.revision++;project(r);
  return {ok:true,token,turnId:id,rows:clone(rows),allCurrent:rows.every(x=>x.match)};
 }
 function cancelPreview(token){const p=previews.get(token);if(!permitted(p))return fail('preview_scope');if(p.result)return fail('preview_consumed');p.cancelled=true;const r=turns.get(p.turnId);if(r?.previewToken===token)r.previewToken=null;return {ok:true};}
 function finishAttempt(r,p,outcome,rows,extra={}){const receipt={id:uid('receipt'),commandId:'cmd.chat.revert',executionKind:'local_text_workspace',turnId:r.id,workspaceId:r.workspaceId,previewToken:p.token,outcome,at:now(),filesChanged:outcome==='reverted'?r.manifest.length:0,rows:clone(rows),...extra};
  r.attempts.push(receipt);r.receipt=receipt;r.previewToken=null;r.revision++;r.state=outcome==='reverted'?'reverted':outcome==='kept'?'kept':'conflict';project(r);p.result={ok:outcome==='reverted'||outcome==='kept',error:outcome==='conflict'?'target_changed':null,receipt:clone(receipt)};return clone(p.result);
 }
 function confirm(token){const p=previews.get(token);if(!permitted(p))return fail('preview_scope');if(p.cancelled)return fail('preview_cancelled');if(p.result)return {...clone(p.result),reused:true};
  const r=turns.get(p.turnId),a=availability(p.turnId);if(!a.eligible)return fail(a.reason);if(r.previewToken!==token)return fail('stale_preview');const w=spaces.get(r.workspaceId);if(!permitted(w))return fail('workspace_scope');
  const rows=inspect(r);if(rows.some(f=>!f.match))return finishAttempt(r,p,'conflict',rows);
  // Prepare all writes before publishing any. No asynchronous boundary between
  // final validation and publication; unrelated paths are copied from NOW.
  const staged=new Map(w.entries);for(const f of r.manifest)staged.set(f.path,{body:f.before.body,revision:entry(w,f.path).revision+1});
  for(const f of r.manifest)if(staged.get(f.path).body!==f.before.body)return fail('staging_verification_failed');
  w.entries=staged;w.revision++;
  return finishAttempt(r,p,'reverted',inspect(r),{verified:true,verification:'Every manifest path has its exact pre-turn text or absence.',workspaceRevision:w.revision});
 }
 function keep(id){const r=turns.get(id);if(!permitted(r))return fail('turn_scope');if(r.state!=='conflict')return fail('no_conflict_to_close');if(r.previewToken){const p=previews.get(r.previewToken);if(p)p.cancelled=true;}
  const p={token:uid('keep')};return finishAttempt(r,p,'kept',inspect(r),{verification:'User kept current files. No reversal performed.'});}
 // Canonical command identity, projected into this concept's local adapter.
 // Production command bus / FileSafe dispatch remains outside this HTML.
 function dispatch(request){if(!request||request.commandId!=='cmd.chat.revert')return fail('unsupported_command');
  if(request.operation==='preview')return preview(request.turnId);
  if(request.operation==='confirm')return confirm(request.previewToken);
  return fail('unsupported_operation');
 }
 function externalEdit(workspaceId,path,body){const w=spaces.get(workspaceId);if(!permitted(w))return fail('workspace_scope');if(!validPath(path)||!validBody(body))return fail('invalid_file');const before=entry(w,path);const staged=new Map(w.entries);staged.set(path,{body,revision:before.revision+1});w.entries=staged;w.revision++;return {ok:true,revision:before.revision+1};}
 function exportData(id){const r=turns.get(id);if(!permitted(r))return fail('turn_scope');return {kind:'local_whole_turn_revert',schemaVersion:1,nativeRuntime:false,persistence:'session_only',exportedAt:now(),turn:clone(r),currentFiles:inspect(r),workspace:workspace(r.workspaceId),notice:'Includes visible local example contents. Not a native FileSafe receipt.'};}
 function show(id){if(!get(id))return fail('turn_scope');const c=E.ctx();c.closeMenu();c.closeDialog();c.openEditor('revert:'+id);return {ok:true};}
 function emit(result){if(!result.receipt)return;const c=E.ctx();if(c.thread.messages.some(m=>m.id===result.receipt.id))return;c.appendMessage({id:result.receipt.id,role:'system',type:'revert-receipt',turnId:result.receipt.turnId,receiptId:result.receipt.id,time:result.receipt.at});}
 const button=(c,action,label,id,primary=false)=>'<button class="'+(primary?'primary-button':'soft-button')+'" data-action="'+action+'" data-value="'+c.esc(id)+'">'+label+'</button>';
 const opLabel={modified:'Restore earlier contents',created:'Remove agent-created file',deleted:'Restore deleted file'};
 function actions(c,id){const a=availability(id);return (a.eligible?button(c,'af-revert-preview','Revert Last Agent Edit',id):'<button class="soft-button" disabled title="'+c.esc(a.reason)+'">Revert Last Agent Edit</button>')+(get(id)?button(c,'revert-open','Inspect files',id):'');}
 function overflow(c,m){const r=get(m.id);if(!r&&!F.state().revert.manifests[m.id])return null;const a=availability(m.id);return [{id:'af-revert',label:'Revert Last Agent Edit',detail:a.eligible?r.manifest.length+' files · whole turn':a.reason,icon:'changes',action:a.eligible?'af-revert-preview':'',value:m.id,danger:true,disabled:!a.eligible,reason:a.reason}];}
 function wand(c){const r=latest(),a=availability(r?.id);return '<button class="menu-item af-wand-row"'+' data-action="af-revert-preview" data-value="'+c.esc(r?.id||'')+'"'+(a.eligible?'':' disabled')+' title="'+c.esc(a.reason)+'"><span class="menu-icon">'+c.icon('changes',13)+'</span><span class="menu-copy"><strong>Revert Last Agent Edit</strong><span>'+c.esc(a.eligible?r.manifest.length+' files · review before reverting':a.reason)+'</span></span></button>';}
 function details(c,key,title,body,open=false){return '<details data-revert-disclosure="'+c.esc(key)+'"'+((disclosures.has(key)?disclosures.get(key):open)?' open':'')+'><summary>'+title+'</summary>'+body+'</details>';}
 function content(c,label,value){return '<section class="revert-source"><small>'+label+'</small>'+(value===null?'<p class="revert-absent">File absent</p>':'<pre>'+c.esc(value)+'</pre>')+'</section>';}
 function fileRow(c,r,f,index){const current=entry(spaces.get(r.workspaceId),f.path),match=sameEntry(current,f.after),reverted=r.state==='reverted';const atRevert=r.attempts.find(x=>x.outcome==='reverted')?.rows.find(x=>x.path===f.path)?.current;const stillRestored=reverted&&atRevert&&sameEntry(current,atRevert);const label=reverted?(stillRestored?'Restored':'Changed after revert'):r.state==='kept'?'Kept':match?'Unchanged since turn':'Changed since turn';
  return details(c,r.id+':'+f.path,'<span class="revert-file-title"><span class="revert-kind">'+c.esc(f.kind)+'</span><strong>'+c.esc(f.path)+'</strong><span class="revert-file-state '+((reverted?!stillRestored:!match)?'revert-warning':'')+'">'+label+'</span></span>',
   '<p class="revert-inverse">'+opLabel[f.kind]+'. All files travel together.</p><div class="revert-sources">'+content(c,'Before agent turn',f.before.body)+content(c,'After agent turn',f.after.body)+content(c,'Current · revision '+current.revision,current.body)+'</div>',index===0);
 }
 function render(c,id){const r=get(id);if(!r)return '<article class="revert-document">This turn is unavailable in the current scope.</article>';const a=availability(id),rows=inspect(r),conflicts=rows.filter(x=>!x.match);const headline=r.state==='reverted'?'Whole turn restored':r.state==='kept'?'Your current files stay':r.state==='conflict'?'A later edit is protected':'Review one complete agent turn';
  return '<article class="revert-document" data-k="revert:'+c.esc(id)+'" data-turn-id="'+c.esc(id)+'"><div class="revert-eyebrow"><span>Revert · local workspace</span><span class="meta-pill">'+c.esc(r.state==='idle'?'Ready to review':r.state)+'</span></div><h2>'+headline+'</h2><p class="revert-lede">'+c.esc(r.state==='reverted'?'The receipt verifies every pre-turn state at reversal time. Current contents below may include later edits.':r.state==='kept'?'Nothing was overwritten. The original manifest and refused attempt remain in history.':r.state==='conflict'?'The confirmation check found a newer revision. Zero files were changed by the revert.':'Inspect every file before confirming. This changes files, not your conversation history.')+'</p>'+
   '<div class="revert-summary"><div><strong>'+r.manifest.length+'</strong><small>files in one turn</small></div><div><strong>'+r.manifest.filter(f=>f.kind==='modified').length+' / '+r.manifest.filter(f=>f.kind==='created').length+' / '+r.manifest.filter(f=>f.kind==='deleted').length+'</strong><small>modified / created / deleted</small></div><div><strong>'+ (r.receipt?r.receipt.filesChanged:'—')+'</strong><small>files changed by last decision</small></div></div>'+
   '<div class="revert-controls">'+(a.eligible?button(c,'af-revert-preview',r.state==='conflict'?'Check again':'Revert Last Agent Edit',id,true):'')+(r.state==='conflict'?button(c,'revert-keep','Keep current files',id):'')+button(c,'revert-export','Export record',id)+'</div>'+
   (r.state==='conflict'?'<section class="revert-callout"><strong>'+conflicts.length+' path'+(conflicts.length===1?'':'s')+' no longer match'+(conflicts.length===1?'es':'')+'</strong><p>'+c.esc(conflicts.map(f=>f.path).join(', '))+'</p><small>The matching files were left untouched too. There is no force or partial-revert action.</small></section>':'')+
   '<div class="revert-files">'+r.manifest.map((f,i)=>fileRow(c,r,f,i)).join('')+'</div>'+
   details(c,id+':history','Decision history · '+r.attempts.length,r.attempts.length?'<ol class="revert-history">'+r.attempts.map(x=>'<li><strong>'+c.esc(x.outcome==='reverted'?'Reverted and verified':x.outcome==='kept'?'Kept current files':'Revert refused')+'</strong><span>'+x.filesChanged+' files changed · '+c.esc(x.id)+'</span></li>').join('')+'</ol>':'<p>No reversal has been attempted.</p>')+
   '<small class="revert-boundary">Session-only text workspace. No repository files, Git history, provider calls, or native FileSafe operations.</small>'+(window.PM56_REVERT_DEMOS?.guide(c,true)||'')+'</article>';
 }
 function dialog(c){const d=c.state.dialog;if(d?.type!=='revert-confirm')return '';const r=get(d.turnId),p=previews.get(d.token);if(!r||!permitted(p)||p.cancelled)return '<div class="dialog"><div class="dialog-body">Preview no longer available.'+button(c,'close-dialog','Close','')+'</div></div>';const good=p.rows.every(f=>f.match);
  return '<div class="dialog revert-confirm" role="dialog" aria-modal="true" aria-label="Revert Last Agent Edit" style="width:600px;max-width:calc(100vw - 32px)"><div class="dialog-head"><div><small>Whole-turn reversal</small><h2>Revert Last Agent Edit?</h2></div><button class="icon-button" data-action="revert-cancel" data-value="'+c.esc(p.token)+'" aria-label="Cancel">'+c.icon('close',14)+'</button></div><div class="dialog-body"><p class="revert-lede">'+(good?r.manifest.length+' files will return to their exact pre-turn state. Your chat history stays.':'A newer edit prevents this whole-turn revert. All '+r.manifest.length+' files stay untouched.')+'</p><div class="revert-preview-files">'+p.rows.map(f=>'<div><span class="revert-preview-icon">'+c.icon(f.kind==='created'?'close':f.kind==='deleted'?'plus':'refresh',13)+'</span><span><strong>'+c.esc(f.path)+'</strong><small>'+opLabel[f.kind]+'</small></span><span class="revert-file-state '+(!f.match?'revert-warning':'')+'">'+(f.match?'Matches':'Changed')+'</span></div>').join('')+'</div><p class="revert-preview-note">'+c.icon('lock',13)+' '+(good?'Checked at preview. Every path is checked again when you confirm.':'A newer revision is already present. Revert is unavailable; current files will not be overwritten.')+'</p>'+(window.PM56_REVERT_DEMOS?.dialogGuide(c,r.id,good)||'')+'<div class="revert-controls">'+button(c,'revert-cancel','Cancel',p.token)+(good?button(c,'af-revert-confirm','Revert all '+r.manifest.length+' files',p.token,true):button(c,'revert-review-conflict','Review conflict',p.token,true))+'</div><small class="revert-boundary">Local example only · no host filesystem access</small></div></div>';
 }
 function previewAction(c,b){const out=dispatch({commandId:'cmd.chat.revert',operation:'preview',turnId:b.dataset.value});c.closeMenu();if(!out.ok){c.toast('Revert unavailable',out.error);return true;}c.openDialog({type:'revert-confirm',turnId:out.turnId,token:out.token});return true;}
 ['af-revert-preview','af-revert-retry'].forEach(a=>E.chainAction(a,previewAction));
 E.chainAction('af-revert-confirm',(c,b)=>{const out=dispatch({commandId:'cmd.chat.revert',operation:'confirm',previewToken:b.dataset.value});emit(out);c.closeDialog();if(out.receipt)show(out.receipt.turnId);else c.toast('No files changed',out.error);return true;});
 E.action('revert-review-conflict',(c,b)=>{const out=dispatch({commandId:'cmd.chat.revert',operation:'confirm',previewToken:b.dataset.value});emit(out);c.closeDialog();if(out.receipt)show(out.receipt.turnId);return true;});
 E.action('revert-cancel',(c,b)=>{cancelPreview(b.dataset.value);c.closeDialog();return true;});
 // Escape/backdrop and the generic close action must consume the same preview.
 E.chainAction('close-dialog',c=>{if(c.state.dialog?.type==='revert-confirm')cancelPreview(c.state.dialog.token);return false;});
 E.action('revert-keep',(c,b)=>{const out=keep(b.dataset.value);emit(out);if(out.ok)show(b.dataset.value);else c.toast('No files changed',out.error);return true;});
 E.action('revert-open',(c,b)=>{const out=show(b.dataset.value);if(!out.ok)c.toast('Turn unavailable',out.error);return true;});
 E.action('revert-export',(c,b)=>{const data=exportData(b.dataset.value);if(data.ok===false){c.toast('Export unavailable',data.error);return true;}let url;try{url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='revert-'+b.dataset.value+'.json';a.click();}catch(e){c.toast('Export unavailable',String(e.message));}finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),2000);}return true;});
 // Never let a historical scripted fixture mint new "FileSafe restored" proof.
 E.chainAction('af-revert-seed',c=>{c.closeMenu();c.toast('Use the guided Revert workflows','Demo Studio contains local files with exact manifests and real currentness checks.');return true;});
 E.slot('dialog',dialog);E.slot('editorTabLabel',c=>c.editorId?.startsWith('revert:')?'Revert · files':'');E.slot('editorDocument',c=>c.editorId?.startsWith('revert:')?render(c,c.editorId.slice(7)):'');
 E.slot('transcriptMessage',c=>{const m=c.m;if(!['revert-turn','revert-receipt'].includes(m?.type))return '';const r=get(m.turnId);if(!r)return '';const receipt=m.receiptId?r.attempts.find(x=>x.id===m.receiptId):null;const title=receipt?(receipt.outcome==='reverted'?'Whole turn reverted':receipt.outcome==='kept'?'Current files kept':'Revert refused'):'One agent turn · '+r.manifest.length+' changed files';
  return '<article class="system-card revert-card" data-k="'+c.esc(m.id)+'"><div class="system-card-head">'+c.icon(receipt?.outcome==='conflict'?'warning':'changes',15)+'<strong>'+title+'</strong><span class="meta-pill">'+(receipt?receipt.filesChanged+' files changed':'Exact manifest')+'</span></div><div class="system-card-body"><p>'+c.esc(receipt?(receipt.outcome==='reverted'?'All manifest files verified at their pre-turn contents. Conversation preserved.':receipt.outcome==='kept'?'You kept the later edit and the rest of the current workspace.':'A newer file revision was found. No files were reverted.'):'Modified, created, and deleted files are reviewed together. Local example only.')+'</p><div class="revert-controls">'+(receipt?button(c,'revert-open','Inspect record',r.id):actions(c,r.id))+'</div></div></article>';
 });
 document.addEventListener('toggle',e=>{const n=e.target;if(n.isConnected&&n.matches?.('details[data-revert-disclosure]'))disclosures.set(n.dataset.revertDisclosure,n.open);},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){const c=E.ctx();if(c.state.dialog?.type==='revert-confirm')cancelPreview(c.state.dialog.token);}},true);
 E.chainAction('reset-all',()=>{epoch++;spaces.clear();turns.clear();previews.clear();disclosures.clear();return false;});
 window.PM56_REVERT={dispatch,createWorkspace,applyTurn,get,workspace,availability,preview,cancelPreview,confirm,keep,exportData,show,actions,overflow,wand,latest:()=>{const r=latest();return r?clone(r):null;},owns:id=>turns.has(id),example:{edit:externalEdit}};
})();
