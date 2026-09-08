/* B07 Teach: explicit user capture and immutable-content revision history.
 * Reuses PM56_FEATURES.state().teach.records, not a second memory store.
 * This is in-memory concept state, NOT redb persistence or live prompt dispatch.
 * Scope boundary follows assistant-chat-design §6: thread | project | user.
 * Legacy `global` is read as the old concept alias for `user`, never newly saved.
 */
(function(){
 'use strict';
 const E=window.PM56_EXT,F=window.PM56_FEATURES,clone=x=>JSON.parse(JSON.stringify(x));
 const scopes={thread:'This thread',project:'This project',user:'Every project'};
 let epoch=1,serial=0;const views=new Map(),receipts=new Map();
 const store=()=>F.state().teach,all=()=>store().records,get=id=>all().find(r=>r.id===id);
 const uid=p=>'teach-'+p+'-'+epoch+'-'+(++serial),now=()=>new Date().toISOString(),fail=error=>({ok:false,error});
 const active=r=>!!r&&!r.revoked&&!r.supersededBy;
 const scope=r=>r.scope==='global'?'user':r.scope;
 const stamp=r=>JSON.stringify([r?.id,r?.text,r?.scope,r?.projectId,r?.userId,r?.sourceThreadId,r?.version||1,r?.revoked,r?.supersededBy,r?.locked,r?.updatedAt]);
 function context(){const c=E.ctx();return {threadId:c.thread?.id,projectId:c.thread?.projectId||c.state.projectId||'concept:pm',userId:'concept:user',consumer:'assistant'};}
 const messages=id=>E.ctx().state.threads.find(t=>t.id===id)?.messages||[];
 function safeMessage(m){return !!m&&['user','assistant'].includes(m.role)&&m.type==='text'&&typeof m.body==='string'&&!m.internalOnly&&m.visibility!=='internal';}
 function sourceValid(s){if(!s||s.kind==='manual')return true;const m=messages(s.threadId).find(m=>m.id===s.messageId);return safeMessage(m)&&m.body.slice(s.start,s.end)===s.excerpt;}
 function sourceFor(seed,ctx){
  const tid=seed.sourceThreadId||ctx.threadId,mid=seed.sourceMessageId;
  if(!mid)return {kind:'manual',threadId:tid,excerpt:null};
  const m=messages(tid).find(m=>m.id===mid);if(!safeMessage(m))return null;
  const start=Number.isInteger(seed.start)?seed.start:0,end=Number.isInteger(seed.end)?seed.end:m.body.length;
  if(start<0||end<=start||end>m.body.length)return null;
  return {kind:m.role==='assistant'?'assistant_output':'user_statement',threadId:tid,messageId:mid,start,end,excerpt:m.body.slice(start,end)};
 }
 function open(seed={}){const c=E.ctx(),ctx=context(),old=seed.narrowOf?get(seed.narrowOf):null;
  if(seed.narrowOf&&!active(old))return fail('teaching_not_active');
  const source=sourceFor(seed,ctx);if(!source)return fail('source_unavailable');
  const d={id:uid('draft'),epoch,context:ctx,text:String(seed.text??''),scope:old?scope(old):(scopes[seed.scope]?seed.scope:'thread'),source,narrowOf:old?.id||null,expectedOld:old?stamp(old):null,allowUserScope:false,conflictChoice:null,error:null};
  store().pending=d;window.PM56_MSG_OVERFLOW?.close();c.closeMenu();c.openDialog({type:'af-teach'});c.renderApp();return {ok:true,draftId:d.id};
 }
 function applies(r,ctx){if(!active(r)||ctx.consumer!=='assistant')return false;const s=scope(r);
  if(s==='user')return (r.userId||'concept:user')===ctx.userId;
  if((r.projectId||'concept:pm')!==ctx.projectId)return false;
  return s==='project'||(s==='thread'&&r.sourceThreadId===ctx.threadId);
 }
 function preview(ctx=context()){
  const items=[],excluded=[];for(const r of visibleRecords(ctx)){
   let reason=r.supersededBy?'superseded':r.revoked?'revoked':ctx.consumer!=='assistant'?'not_assistant':!applies(r,ctx)?'outside_scope':null;
   if(reason)excluded.push({id:r.id,version:r.version||1,reason});else items.push({id:r.id,version:r.version||1,scope:scope(r),text:r.text});
  }return {kind:'concept_teach_context_preview',context:clone(ctx),items,excluded,payload:items.map(r=>r.text).join('\n'),providerDispatched:false};
 }
 const words=s=>new Set((String(s).toLowerCase().match(/[a-z0-9]{4,}/g)||[]));
 function related(d){const w=words(d.text);return all().filter(r=>active(r)&&r.id!==d.narrowOf&&scope(r)===d.scope&&(d.scope==='user'?(r.userId||'concept:user')===d.context.userId:(r.projectId||'concept:pm')===d.context.projectId)&& (d.scope!=='thread'||r.sourceThreadId===d.context.threadId)&&[...words(r.text)].filter(v=>w.has(v)).length>=3);}
 const secret=s=>/(api[_-]?key|secret|token|password|bearer)\s*[:=]\s*\S{4,}|sk-[a-z0-9]{10,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i.test(String(s));
 function request(){const d=store().pending;return d?clone({...d,related:related(d).map(r=>({id:r.id,stamp:stamp(r)}))}):null;}
 function commit(x){
  const d=store().pending;if(!x)return fail('draft_missing');
  const saved=receipts.get(x.id);if(saved)return saved.request===JSON.stringify(x)?{ok:true,id:saved.id,reused:true}:fail('conflicting_capture');
  if(x.epoch!==epoch||!d||x.id!==d.id||E.ctx().state.dialog?.type!=='af-teach')return fail('stale_draft');
  if(JSON.stringify(request())!==JSON.stringify(x))return fail('draft_changed');
  if(JSON.stringify(context())!==JSON.stringify(d.context))return fail('scope_context_changed');
  if(!scopes[d.scope])return fail('invalid_scope');
  const text=String(d.text).trim();if(!text||text.length>4000)return fail('text_required_and_bounded');
  if(secret(text)||secret(d.source.excerpt))return fail('credential_detected');
  if(!sourceValid(d.source))return fail('source_changed');
  if(d.scope==='user'&&!d.allowUserScope)return fail('confirm_nonconfidential_user_scope');
  let old=d.narrowOf?get(d.narrowOf):null;
  if(d.narrowOf&&(!active(old)||!applies(old,d.context)||stamp(old)!==d.expectedOld))return fail('stale_correction');
  const near=related(d);if(near.length&&!d.narrowOf){
   if(d.conflictChoice==='keep_both'){}else if(d.conflictChoice?.startsWith('replace:')){
    old=get(d.conflictChoice.slice(8));if(!near.includes(old)||!active(old))return fail('conflict_changed');
   }else return fail('resolve_related_teaching');
  }
  // A correction cannot silently broaden its predecessor's scope.
  if(old&&d.scope!==scope(old)&&!(scope(old)==='project'&&d.scope==='thread'))return fail('correction_cannot_widen_scope');
  const id=uid('record'),at=now(),r={id,memory_id:id,scope:d.scope,projectId:d.context.projectId,userId:d.context.userId,
   sourceThreadId:d.context.threadId,source_thread_id:d.context.threadId,sourceMessageId:d.source.messageId||null,author_message_id:d.source.messageId||null,
   text,normalized_fact:text,source:clone(d.source),version:old?(old.version||1)+1:1,rootId:old?(old.rootId||old.id):id,
   supersedes:old?.id||null,supersedes_memory_id:old?.id||null,supersededBy:null,revoked:false,revoked_at:null,locked:true,
   createdAt:at,captured_at:at,updatedAt:at,secretSafety:'local_pattern_screen_clear',demo:true,protocolVersion:1};
  if(old){old.supersededBy=id;old.revoked=true;old.updatedAt=at;}all().push(r);store().pending=null;receipts.set(x.id,{request:JSON.stringify(x),id});
  const c=E.ctx(),t=c.state.threads.find(t=>t.id===r.sourceThreadId);
  c.appendMessage({id:uid('receipt'),role:'system',type:'af-teach-receipt',title:old?'Teaching updated':'Teaching captured',detail:(scopes[r.scope]||r.scope)+' · v'+r.version+' · locked',memoryId:id,time:at},t);
  document.dispatchEvent(new CustomEvent('pm56:teach-committed',{detail:{id,threadId:r.sourceThreadId}}));return {ok:true,id,reused:false};
 }
 function correction(id){const r=get(id);if(!active(r))return fail('teaching_not_active');if(!applies(r,context()))return fail('outside_scope');return open({text:r.text,scope:scope(r),narrowOf:id});}
 function mutationRequest(id){const r=get(id);return r?{id,epoch,expected:stamp(r)}:null;}
 function revoke(x){const r=get(x?.id);if(!r)return fail('teaching_missing');if(x.epoch!==epoch||stamp(r)!==x.expected||!applies(r,context()))return fail('stale_teaching');if(!active(r))return fail('teaching_not_active');r.revoked=true;r.revoked_at=now();r.updatedAt=r.revoked_at;return {ok:true,id:r.id};}
 function lock(x){const r=get(x?.id);if(!r||x.epoch!==epoch||stamp(r)!==x.expected||!active(r)||!applies(r,context()))return fail('stale_teaching');r.locked=!r.locked;r.updatedAt=now();return {ok:true,id:r.id};}
 const errorText={credential_detected:'Remove the credential before saving.',source_changed:'The source changed. Select it again.',resolve_related_teaching:'Choose how to handle the related teaching.',stale_correction:'This teaching changed. Reopen its current version.',scope_context_changed:'The destination changed. Open a new capture.',confirm_nonconfidential_user_scope:'Confirm this is safe for other projects.',correction_cannot_widen_scope:'Create a separate teaching to broaden its scope.',draft_changed:'The draft changed. Review it before saving.',text_required_and_bounded:'Enter 1–4,000 characters.',invalid_scope:'Choose a supported scope.'};
 const explain=x=>errorText[x]||'The record changed. Reopen it and try again.';
 function conflictHtml(c,d){const rows=related(d);if(d.narrowOf||!rows.length)return '';return '<div class="teach-related"><strong>Related teaching</strong><small>Local word overlap — not a semantic verdict</small>'+rows.map(r=>'<p>'+c.esc(r.text)+'</p><button class="soft-button '+(d.conflictChoice==='replace:'+r.id?'selected':'')+'" data-action="teach-conflict" data-choice="replace:'+c.esc(r.id)+'">Replace this version</button>').join('')+'<button class="soft-button" data-action="teach-conflict" data-choice="keep_both">'+(d.conflictChoice==='keep_both'?'✓ ':'')+'Keep both</button></div>';}
 function dialog(c){const d=store().pending;if(!d)return '';const isCorrection=!!d.narrowOf,e=c.esc;
  return '<section class="dialog teach-dialog" role="dialog" aria-modal="true" aria-label="'+(isCorrection?'Correct teaching':'Teach Puppet Master')+'"><div class="drawer-head"><span class="event-icon">'+c.icon('sparkles',14)+'</span><strong>'+(isCorrection?'Correct teaching':'Teach Puppet Master')+'</strong><span class="spacer"></span><button class="icon-button" data-action="af-teach-cancel" aria-label="Close">'+c.icon('close',13)+'</button></div><div class="dialog-body"><label class="af-field-label" for="teach-body">Remember this</label><textarea id="teach-body" data-teach-input="text" rows="4" maxlength="4000">'+e(d.text)+'</textarea><label class="af-field-label">Applies to</label><div class="teach-scope-picker">'+Object.entries(scopes).map(([k,v])=>'<button class="soft-button '+(d.scope===k?'selected':'')+'" data-action="af-teach-set-scope" data-value="'+k+'" aria-pressed="'+(d.scope===k)+'">'+e(v)+'</button>').join('')+'</div>'+(d.scope==='user'?'<label class="teach-confirm"><input type="checkbox" data-teach-input="public"'+(d.allowUserScope?' checked':'')+'> This contains no project-confidential information.</label>':'')+'<div class="teach-source-line"><small>'+e(d.source.kind==='manual'?'Source: your explicit instruction':'Source: '+(d.source.kind==='assistant_output'?'selected assistant output':'your message'))+'</small><small>User-locked</small></div>'+(isCorrection?'<p class="teach-help">The previous version stays in history.</p>':'')+'<div id="teach-related">'+conflictHtml(c,d)+'</div><p id="teach-error" class="teach-error" role="status">'+e(d.error?explain(d.error):'')+'</p><details class="teach-safety"><summary>Capture details</summary><p>Local credential-pattern check only. This concept keeps teaching in this session; it does not save to a production memory store.</p>'+(d.source.excerpt?'<p class="teach-quote">'+e(d.source.excerpt)+'</p>':'')+'</details></div><footer class="teach-footer"><button class="soft-button" data-action="af-teach-cancel">Cancel</button><button class="primary-button" data-action="af-teach-capture">'+(isCorrection?'Save new version':'Capture teaching')+'</button></footer></section>';
 }
 function memoryRows(c){return visibleRecords(context()).slice().reverse().map(r=>'<div class="af-mem-row"><div class="af-mem-row-head"><strong>'+c.esc(status(r))+'</strong><span class="spacer"></span><small>'+c.esc(scopes[scope(r)]||r.scope)+' · v'+(r.version||1)+'</small></div><p class="af-mem-text">'+c.esc(r.text)+'</p><button class="text-button" data-action="teach-open" data-id="'+c.esc(r.id)+'">Details and history</button></div>').join('')||'<p>No teaching captured.</p>';}
 function status(r){return r.supersededBy?'Superseded':r.revoked?'Revoked':r.locked?'Active · locked':'Active';}
 function visibleRecords(ctx){return all().filter(r=>{const s=scope(r);if(s==='user')return (r.userId||'concept:user')===ctx.userId;if((r.projectId||'concept:pm')!==ctx.projectId)return false;return s==='project'||(s==='thread'&&r.sourceThreadId===ctx.threadId);});}
 function history(c,tid){const ctx={...context(),threadId:tid},v=views.get(tid)||{},records=visibleRecords(ctx),chosen=get(v.id),chain=chosen?records.filter(r=>(r.rootId||r.id)===(chosen.rootId||chosen.id)):records,upcoming=preview(ctx),e=c.esc;
  return '<article class="teach-document" data-k="teach-doc:'+e(tid)+'"><div class="room-meta"><span>Teach · session preview</span><span>'+upcoming.items.length+' eligible · '+records.length+(records.length===1?' version':' versions')+'</span></div><h2>Taught memory</h2><div class="room-controls"><button class="soft-button" data-action="af-teach-open">Teach something</button><button class="soft-button" data-action="teach-preview" data-thread="'+e(tid)+'">Preview next context</button><button class="soft-button" data-action="teach-export" data-thread="'+e(tid)+'">Export history</button>'+(chosen?'<button class="text-button" data-action="teach-open">All teaching</button>':'')+'</div>'+(v.preview?'<section class="teach-preview" data-k="teach-preview"><header><strong>Eligible for this Assistant thread</strong><small>Preview only · not dispatched</small></header>'+(upcoming.items.length?upcoming.items.map(r=>'<p data-included-teaching="'+e(r.id)+'">'+e(r.text)+' <small>v'+r.version+'</small></p>').join(''):'<p>No active teaching applies.</p>')+'</section>':'')+'<div class="teach-versions">'+chain.slice().reverse().map(r=>'<section class="teach-version" data-k="teach:'+e(r.id)+'" data-teaching="'+e(r.id)+'"><header><strong>'+e(status(r))+'</strong><small>'+e(scopes[scope(r)]||r.scope)+' · v'+(r.version||1)+'</small></header><p>'+e(r.text)+'</p><div class="teach-actions">'+(active(r)?'<button class="soft-button" data-action="teach-correct" data-id="'+e(r.id)+'">Correct</button><button class="text-button" data-action="af-teach-lock" data-value="'+e(r.id)+'">'+(r.locked?'Unlock':'Lock')+'</button><button class="text-button" data-action="af-teach-revoke" data-value="'+e(r.id)+'">Revoke</button>':'')+'<button class="text-button" data-action="teach-source" data-id="'+e(r.id)+'">Source</button></div><details><summary>Version details</summary><dl><dt>Captured</dt><dd>'+e(r.createdAt)+'</dd><dt>Replaces</dt><dd>'+e(r.supersedes?'v'+(get(r.supersedes)?.version||1):'None')+'</dd><dt>Future use</dt><dd>'+e(upcoming.items.some(x=>x.id===r.id)?'Eligible here':status(r)==='Superseded'?'Replaced by newer teaching':'Not included here')+'</dd></dl></details>'+(v.source===r.id?'<div class="teach-source"><strong>Capture source</strong><p>'+e(r.source?.excerpt||r.text)+'</p>'+(r.sourceMessageId&&messages(r.sourceThreadId).some(m=>m.id===r.sourceMessageId)?'<button class="text-button" data-action="teach-source-jump" data-id="'+e(r.id)+'">Open original message</button>':'<small>Explicit instruction; preserved with this revision.</small>')+'</div>':'')+(v.revoke?.id===r.id?'<div class="teach-revoke"><strong>Stop using this version?</strong><p>History remains. Older versions will not reactivate.</p><button class="soft-button" data-action="teach-revoke-cancel" data-thread="'+e(tid)+'">Keep active</button><button class="primary-button" data-action="teach-revoke-confirm" data-thread="'+e(tid)+'">Revoke teaching</button></div>':'')+'</section>').join('')+'</div><p class="teach-help">Teaching is not the Teacher Persona. No model request is made here.</p>'+ (window.PM56_TEACH_DEMOS?.editorGuide(tid)||'')+'</article>';
 }
 function show(id){const c=E.ctx(),r=get(id),tid=c.thread.id;if(r&&!visibleRecords(context()).includes(r))return fail('outside_scope');views.set(tid,{...views.get(tid),id:r?.id||null,revoke:null});c.closeDialog();c.closeMenu();c.state.editorRevealed=true;c.openEditor('teach:'+tid);return {ok:true};}
 function receiptActions(c,m){return '<button class="soft-button" data-action="teach-open" data-id="'+c.esc(m.memoryId)+'">Open teaching</button>';}
 function update(){const c=E.ctx(),d=store().pending;if(!d)return;const error=document.getElementById('teach-error');if(error)error.textContent=d.error?explain(d.error):'';const rel=document.getElementById('teach-related');if(rel)rel.innerHTML=conflictHtml(c,d);}
 E.chainAction('af-teach-open',()=>{open();return true;});E.chainAction('af-teach-narrow',(c,b)=>{correction(b.dataset.value);return true;});
 E.chainAction('af-teach-set-scope',(c,b)=>{const d=store().pending;if(d&&scopes[b.dataset.value]){d.scope=b.dataset.value;d.conflictChoice=null;d.error=null;c.renderOverlays();}return true;});
 E.chainAction('af-teach-cancel',c=>{store().pending=null;c.closeDialog();return true;});
 E.chainAction('af-teach-capture',c=>{const x=commit(request());if(!x.ok){if(store().pending)store().pending.error=x.error;update();}else{c.closeDialog();c.renderApp();}return true;});
 E.action('teach-conflict',(c,b)=>{if(store().pending){store().pending.conflictChoice=b.dataset.choice;store().pending.error=null;update();}return true;});
 E.action('teach-open',(c,b)=>{show(b.dataset.id);return true;});E.action('teach-correct',(c,b)=>{correction(b.dataset.id);return true;});
 E.chainAction('af-teach-lock',(c,b)=>{const x=lock(mutationRequest(b.dataset.value));if(!x.ok)c.toast('Teaching unchanged',explain(x.error));c.renderApp();return true;});
 E.chainAction('af-teach-revoke',(c,b)=>{show(b.dataset.value);const tid=c.thread.id;views.set(tid,{...views.get(tid),revoke:mutationRequest(b.dataset.value)});c.renderApp();return true;});
 E.action('teach-revoke-cancel',(c,b)=>{views.set(b.dataset.thread,{...views.get(b.dataset.thread),revoke:null});c.renderApp();return true;});
 E.action('teach-revoke-confirm',(c,b)=>{const v=views.get(b.dataset.thread),x=revoke(v?.revoke);views.set(b.dataset.thread,{...v,revoke:null});if(!x.ok)c.toast('Teaching unchanged',explain(x.error));c.renderApp();return true;});
 E.action('teach-preview',(c,b)=>{views.set(b.dataset.thread,{...views.get(b.dataset.thread),preview:!views.get(b.dataset.thread)?.preview});c.renderApp();return true;});
 E.action('teach-source',(c,b)=>{const tid=c.thread.id;views.set(tid,{...views.get(tid),source:views.get(tid)?.source===b.dataset.id?null:b.dataset.id});c.renderApp();return true;});
 E.action('teach-source-jump',(c,b)=>{const r=get(b.dataset.id);if(r?.sourceMessageId){c.switchThread(r.sourceThreadId);c.state.editorRevealed=false;c.renderApp();requestAnimationFrame(()=>document.querySelector('[data-message-id="'+CSS.escape(r.sourceMessageId)+'"]')?.scrollIntoView({block:'center'}));}return true;});
 function exportHistory(tid){return JSON.stringify({kind:'concept_taught_memory',threadId:tid,records:visibleRecords({...context(),threadId:tid}),preview:preview({...context(),threadId:tid})},null,2);}
 E.action('teach-export',(c,b)=>{const url=URL.createObjectURL(new Blob([exportHistory(b.dataset.thread)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='taught-memory.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);return true;});
 E.action('teach-from-message',(c,b)=>{const tid=b.dataset.thread||c.thread.id,m=messages(tid).find(m=>m.id===b.dataset.value);if(safeMessage(m))open({text:m.body,sourceThreadId:tid,sourceMessageId:m.id});return true;});
 document.addEventListener('input',e=>{const k=e.target.dataset?.teachInput,d=store().pending;if(!k||!d)return;if(k==='text'){d.text=e.target.value;d.conflictChoice=null;}if(k==='public')d.allowUserScope=e.target.checked;d.error=null;update();});
 E.slot('transcriptMessage',c=>{const m=c.m;if(m?.type!=='af-teach-receipt'||!m.memoryId)return '';return '<article class="event-card teach-receipt" data-k="teach-receipt:'+c.esc(m.id)+'" data-message-id="'+c.esc(m.id)+'"><span class="event-icon">'+c.icon('sparkles',13)+'</span><div class="event-copy"><strong>'+c.esc(m.title)+'</strong><p>'+c.esc(m.detail)+'</p></div><button class="soft-button" data-action="teach-open" data-id="'+c.esc(m.memoryId)+'">Open</button></article>';});
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('teach:')?'Taught memory':'');E.slot('editorDocument',c=>c.editorId?.startsWith('teach:')?history(c,c.editorId.slice(6)):'');
 window.PM56_MSG_OVERFLOW?.register((c,m)=>safeMessage(m)?[{id:'teach-selected-message',label:'Save as taught memory…',detail:'Review and confirm before capturing',icon:'sparkles',action:'teach-from-message',value:m.id}]:null);
 E.chainAction('close-dialog',()=>{if(E.ctx().state.dialog?.type==='af-teach')store().pending=null;return false;});
 // Explicit Teach uses normal composer input, without fabricating an assistant answer.
 const composer=window.PM56_RUNTIME.composer;
 composer.preSendHooks.unshift((c,t,raw)=>{
  const dest=composer.bufferFor(t.id).destination||composer.destination;
  if(dest&&dest.kind!=='assistant')return false;
  if(!/^\s*\/teach\b|^\s*(?:remember (?:this|that)|for (?:this repo|this project) always|please prefer)\b/i.test(raw))return false;
  const message={id:uid('instruction'),role:'user',type:'text',body:raw,time:now(),teachHandled:true};
  c.appendMessage(message,t);open({text:raw.replace(/^\s*\/teach\b\s*/i,''),scope:'thread',sourceThreadId:t.id,sourceMessageId:message.id});return {claimed:true};
 });
 E.chainAction('reset-all',()=>{epoch++;views.clear();receipts.clear();return false;});
 window.PM56_TEACH={open,request,commit,correction,mutationRequest,revoke,lock,context,applies,preview,related,get,all,active,dialog,memoryRows,show,receiptActions,exportHistory,status,sourceValid,visibleRecords};
})();
