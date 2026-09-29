/* Revert Last Agent Edit (B10; redesigned 2026-09-27, DESIGN-SPEC 8.12 with 7.11, 8.15 and 9).
 * Whole-turn reversal for a bounded in-memory text workspace. Private manifests are authority;
 * PM56_FEATURES.revert is a compatibility projection only. Exact contents, existence and per-path
 * revision are checked again at confirmation, and a single synchronous Map swap publishes every
 * inverse. This is NOT native FileSafe, filesystem crash recovery or a merge engine. Revert is all
 * or none; it is not conversation Rewind (cmd.chat.rewind), and the chat itself never changes.
 *
 * Outcomes are canon's closed five (UCC:8589), kept in the record's data: restored_clean,
 * restore_skipped, restore_refused, restore_failed, restore_recovery_required. "Leave my files as
 * they are" (revert-keep) writes no record; it only dismisses the choice (IMPACT A1-33).
 *
 * Presentation, built from the PM56_SHELL pmx builders only:
 *  - under the reply (record revert-turn, family ledger): pmxFilesRow "Changed 3 files +5 −3 · Revert";
 *  - one ledger line per outcome (record revert-receipt, family ledger): pmxLedgerLine. Every record is
 *    appended; an outcome that directly follows its own files row folds into that row (one fact, one
 *    control set, 7.12) and draws no line of its own;
 *  - the confirm sheet (dialog revert-confirm {turnId, token}): pmxSheet compact 720 x 520 with the
 *    faces ready, blocked (a file already changed), back (every file is already as it was before:
 *    confirming records restore_skipped and writes nothing), refused (the confirm check found a later
 *    edit), done (the rewind; only on a durable restored_clean, IMPACT A1-35) and ineligible (no primary);
 *  - the Revert document (editor revert:{turnId}): pmxView, "What happened" and one diff viewer per
 *    file with the revert-view switch (view state, IMPACT A3-07).
 * Provenance (IMPACT A3-03): a workspace made by the recorded example is 'recorded'; only then does
 * "Demo: no real files are touched." appear.
 */
(function(){
 'use strict';
 const E=window.PM56_EXT,F=window.PM56_FEATURES,S=window.PM56_SHELL,esc=S.esc,clone=x=>JSON.parse(JSON.stringify(x));
 const PMX=()=>window.PM56_PMX||null,COPY=S.PMX_COPY||{};
 const cssq=v=>window.CSS&&CSS.escape?CSS.escape(String(v)):String(v).replace(/["\\]/g,'\\$&');
 const spaces=new Map(),turns=new Map(),previews=new Map(),disclosures=new Map();let seq=0,epoch=1;
 /* view state only (never a record): the Revert document's file focus and diff modes, and the refused
    outcomes whose Retry the reader dismissed with "Leave my files as they are" */
 const views=new Map(),dismissed=new Set();let scrollTo=null;
 const uid=p=>'rv-'+p+'-'+epoch+'-'+(++seq),now=()=>new Date().toISOString(),fail=(error,reason)=>({ok:false,error,reason:reason||error});
 const scope=()=>{const c=window.PM56_TEACH.context();return {...c,worktree:E.ctx().state.worktree};};
 const sameScope=(a,b)=>['projectId','userId','threadId','consumer','worktree'].every(k=>a[k]===b[k]);
 const permitted=r=>!!r&&r.epoch===epoch&&sameScope(r.scope,scope());
 const copyEntry=e=>e?{body:e.body,revision:e.revision}: {body:null,revision:0};
 const entry=(w,path)=>copyEntry(w.entries.get(path));
 const sameEntry=(a,b)=>a.body===b.body&&a.revision===b.revision;
 const validPath=p=>typeof p==='string'&&p.length>0&&p.length<=240&&!/[\\\x00-\x1f:]/.test(p)&&!p.startsWith('/')&&!p.split('/').some(x=>!x||x==='.'||x==='..'||x==='.git');
 const validBody=b=>b===null||(typeof b==='string'&&b.length<=100000);
 const get=id=>{const r=turns.get(id);return permitted(r)?clone(r):null;};
 /* read-only access for the render paths (the files row, the lines, the sheet, the document): the live record, never
    mutated there, so a long chat does not deep-clone every turn's file bodies on each render. get() stays the public copy */
 const own=id=>{const r=turns.get(id);return permitted(r)?r:null;};
 /* every manifest path already holds its pre-turn text or absence: confirm records restore_skipped */
 const allBack=rows=>rows.length>0&&rows.every(f=>f.current.body===f.before.body);

 /* ------------------------------------------------------------ line diff (the counts and the diff viewers) */
 function lines(b){if(b==null||b==='')return [];const a=String(b).split('\n');if(a[a.length-1]==='')a.pop();return a;}
 function lineDiff(a,b){
  const x=lines(a),y=lines(b);let i=0,j=0;
  while(i<x.length&&i<y.length&&x[i]===y[i])i++;
  while(j<x.length-i&&j<y.length-i&&x[x.length-1-j]===y[y.length-1-j])j++;
  const xm=x.slice(i,x.length-j),ym=y.slice(i,y.length-j),mid=[];
  if(xm.length&&ym.length&&xm.length*ym.length<=250000){
   const n=xm.length,m=ym.length,L=[];for(let p=0;p<=n;p++)L.push(new Uint16Array(m+1));
   for(let p=n-1;p>=0;p--)for(let q=m-1;q>=0;q--)L[p][q]=xm[p]===ym[q]?L[p+1][q+1]+1:Math.max(L[p+1][q],L[p][q+1]);
   let p=0,q=0;
   while(p<n&&q<m){if(xm[p]===ym[q]){mid.push({op:'same',text:xm[p]});p++;q++;}else if(L[p+1][q]>=L[p][q+1])mid.push({op:'del',text:xm[p++]});else mid.push({op:'add',text:ym[q++]});}
   while(p<n)mid.push({op:'del',text:xm[p++]});while(q<m)mid.push({op:'add',text:ym[q++]});
  }else{xm.forEach(t=>mid.push({op:'del',text:t}));ym.forEach(t=>mid.push({op:'add',text:t}));}
  const ops=x.slice(0,i).map(t=>({op:'same',text:t})).concat(mid,x.slice(x.length-j).map(t=>({op:'same',text:t})));
  return {ops,add:ops.filter(o=>o.op==='add').length,del:ops.filter(o=>o.op==='del').length};
 }

 /* ------------------------------------------------------------ protocol */
 function workspace(id){const w=spaces.get(id);return permitted(w)?{id:w.id,scope:clone(w.scope),revision:w.revision,provenance:w.provenance,files:[...w.entries].map(([path,e])=>({path,...clone(e)}))}:null;}
 function latest(workspaceId){return [...turns.values()].filter(r=>permitted(r)&&(!workspaceId||r.workspaceId===workspaceId)&&r.manifest.length).at(-1)||null;}
 /* the 9.3 availability sentences come from the one refusal map (pmxRefusalText, IMPACT A2-14) */
 const refusal=(code,variant)=>{const t=S.pmxRefusalText?S.pmxRefusalText(code,{variant}):null;return t?t.text:'Nothing to revert yet.';};
 function availability(id){const r=turns.get(id);
  if(!permitted(r)||!r.manifest.length)return {eligible:false,code:'no_eligible_mutating_turn',reason:refusal('no_eligible_mutating_turn')};
  if(r.state==='reverted')return {eligible:false,code:'revert_done',reason:refusal('no_eligible_mutating_turn','done')};
  if(r.state==='skipped')return {eligible:false,code:'restore_skipped',reason:'Already back to before: nothing to revert.'};
  /* a change that needs recovery offers Recover (disabled in this preview), never a second Revert */
  if(r.state==='recovery')return {eligible:false,code:'restore_recovery_required',reason:'This change needs recovery before it can be reverted.'};
  if(latest()?.id!==r.id)return {eligible:false,code:'revert_not_latest',reason:refusal('no_eligible_mutating_turn','not-latest')};
  return {eligible:true,code:'',reason:''};
 }
 function project(r){const a=availability(r.id);F.state().revert.manifests[r.id]={protocol:'local-revert-v1',turnId:r.id,eligible:a.eligible,reason:a.reason,state:r.state,provenance:r.provenance,files:r.manifest.map(f=>({path:f.path,kind:f.kind,stat:'+'+f.add+' −'+f.del,reverted:r.state==='reverted'}))};}
 /* opts.provenance 'recorded' marks the recorded example's workspace (IMPACT A3-03); everything else is live */
 function createWorkspace(files,opts){if(scope().consumer!=='assistant'||!Array.isArray(files)||files.length>40)return fail('invalid_workspace');const entries=new Map();
  for(const f of files){if(!f||!validPath(f.path)||typeof f.body!=='string'||!validBody(f.body)||entries.has(f.path))return fail('invalid_file');entries.set(f.path,{body:f.body,revision:1});}
  const w={id:uid('workspace'),epoch,scope:clone(scope()),revision:1,entries,provenance:opts&&opts.provenance==='recorded'?'recorded':'live'};spaces.set(w.id,w);return {ok:true,id:w.id};
 }
 // Gallery/provider-adapter boundary: commits one actual local agent turn.
 // No flags accepting caller-provided success, conflicts or inverse snapshots.
 function applyTurn(workspaceId,changes,summary){const w=spaces.get(workspaceId);if(!permitted(w))return fail('workspace_scope');if(!Array.isArray(changes)||changes.length>30)return fail('invalid_changes');
  const seen=new Set(),manifest=[];
  for(const change of changes){if(!change||!validPath(change.path)||!validBody(change.body)||seen.has(change.path))return fail('invalid_change');seen.add(change.path);const before=entry(w,change.path);if(before.body===change.body)continue;
   const d=lineDiff(before.body,change.body);
   manifest.push({path:change.path,kind:before.body===null?'created':change.body===null?'deleted':'modified',before,after:{body:change.body,revision:before.revision+1},add:d.add,del:d.del});}
  const staged=new Map(w.entries);for(const f of manifest)staged.set(f.path,{body:f.after.body,revision:f.after.revision});
  const c=E.ctx(),r={id:uid('turn'),epoch,protocol:'local-revert-v1',scope:clone(scope()),workspaceId,provenance:w.provenance,state:'idle',revision:1,manifest,previewToken:null,attempts:[],createdAt:now(),summary:String(summary||'Updated the local example files.'),receipt:null};
  w.entries=staged;if(manifest.length)w.revision++;turns.set(r.id,r);for(const x of turns.values())if(permitted(x))project(x);
  c.appendMessage({id:r.id,role:'assistant',type:'text',body:r.summary,time:r.createdAt});
  /* always appended (B.13, the audit trail); a turn that changed nothing draws no row (filesRow) */
  c.appendMessage({id:uid('changes'),role:'system',type:'revert-turn',turnId:r.id,time:r.createdAt});
  return {ok:true,id:r.id,filesChanged:manifest.length};
 }
 function inspect(r){const w=spaces.get(r.workspaceId);if(!permitted(w))return [];
  return r.manifest.map(f=>{const current=entry(w,f.path),match=sameEntry(current,f.after);return {path:f.path,kind:f.kind,before:clone(f.before),expected:clone(f.after),current,match,reason:match?null:current.body!==f.after.body?(current.body===null?'File is now absent.':f.after.body===null?'The deleted path was recreated.':'Contents changed after the agent turn.'):'Path revision changed after the agent turn.'};});}
 function preview(id){const r=turns.get(id),a=availability(id);if(!a.eligible)return fail(a.code,a.reason);const rows=inspect(r);if(rows.length!==r.manifest.length)return fail('workspace_scope','This change is no longer available.');
  if(r.previewToken){const old=previews.get(r.previewToken);if(old)old.cancelled=true;}
  const token=uid('preview'),p={token,turnId:id,epoch,scope:clone(scope()),rows,createdAt:now(),cancelled:false,result:null};previews.set(token,p);r.previewToken=token;r.revision++;project(r);
  return {ok:true,token,turnId:id,rows:clone(rows),allCurrent:rows.every(x=>x.match),allBack:allBack(rows)};
 }
 function cancelPreview(token){const p=previews.get(token);if(!permitted(p))return fail('preview_scope');if(p.result)return fail('preview_consumed');p.cancelled=true;const r=turns.get(p.turnId);if(r?.previewToken===token)r.previewToken=null;return {ok:true};}
 const STATE_OF={restored_clean:'reverted',restore_skipped:'skipped',restore_refused:'conflict',restore_failed:'failed',restore_recovery_required:'recovery'};
 function finishAttempt(r,p,outcome,rows,extra={}){const receipt={id:uid('receipt'),commandId:'cmd.chat.revert',executionKind:'local_text_workspace',turnId:r.id,workspaceId:r.workspaceId,previewToken:p.token,provenance:r.provenance,outcome,at:now(),filesChanged:outcome==='restored_clean'?r.manifest.length:0,rows:clone(rows),...extra};
  r.attempts.push(receipt);r.receipt=receipt;r.previewToken=null;r.revision++;r.state=STATE_OF[outcome]||r.state;project(r);
  p.result={ok:outcome==='restored_clean'||outcome==='restore_skipped',error:outcome==='restore_refused'?(receipt.reason||'target_changed'):outcome==='restore_failed'?(receipt.reason||'restore_failed'):null,receipt:clone(receipt)};return clone(p.result);
 }
 function confirm(token){const p=previews.get(token);if(!permitted(p))return fail('preview_scope');if(p.cancelled)return fail('preview_cancelled');if(p.result)return {...clone(p.result),reused:true};
  const r=turns.get(p.turnId),a=availability(p.turnId);if(!a.eligible)return fail(a.code,a.reason);if(r.previewToken!==token)return fail('stale_preview');const w=spaces.get(r.workspaceId);if(!permitted(w))return fail('workspace_scope');
  const rows=inspect(r);
  // Already back to before everywhere: nothing to write (restore_skipped, zero mutation).
  if(allBack(rows))return finishAttempt(r,p,'restore_skipped',rows,{verification:'Every manifest path already holds its pre-turn text or absence.'});
  // A later edit (the user's editor, a formatter, another agent): refused before any write.
  if(rows.some(f=>!f.match))return finishAttempt(r,p,'restore_refused',rows,{reason:'target_changed',changedPaths:rows.filter(f=>!f.match).map(f=>f.path)});
  // Prepare all writes before publishing any. No asynchronous boundary between
  // final validation and publication; unrelated paths are copied from NOW.
  const staged=new Map(w.entries);for(const f of r.manifest)staged.set(f.path,{body:f.before.body,revision:entry(w,f.path).revision+1});
  for(const f of r.manifest)if(staged.get(f.path).body!==f.before.body)return finishAttempt(r,p,'restore_failed',rows,{reason:'staging_verification_failed',verification:'Nothing was written; every file is as it was before trying.'});
  w.entries=staged;w.revision++;
  return finishAttempt(r,p,'restored_clean',inspect(r),{verified:true,verification:'Every manifest path has its exact pre-turn text or absence.',workspaceRevision:w.revision});
 }
 /* "Leave my files as they are" (IMPACT A1-33): no outcome record, no file change. It closes any open
    preview and dismisses the refused outcome's Retry. The closed five stay the only outcomes. */
 function keep(id){const r=turns.get(id);if(!permitted(r))return fail('turn_scope');const x=r.attempts.at(-1);if(!x||x.outcome!=='restore_refused')return fail('no_refusal_to_close');
  if(r.previewToken){const p=previews.get(r.previewToken);if(p&&!p.result)p.cancelled=true;r.previewToken=null;}
  dismissed.add(x.id);return {ok:true,dismissed:true,receiptId:x.id};}
 /* a refused outcome whose choice is still open: its line offers Retry, and "Leave my files as they are"
    is offered wherever the choice can be made (the refused and blocked faces, the Revert document) */
 const refusalOpen=r=>{const x=r&&r.attempts.at(-1);return !!x&&x.outcome==='restore_refused'&&!dismissed.has(x.id);};
 /* the latest attempt's line offers Retry: the files row then offers no Revert of its own (7.12) */
 const retryOpen=(r,a)=>{const x=r&&r.attempts.at(-1);return !!x&&a.eligible&&(x.outcome==='restore_refused'||x.outcome==='restore_failed')&&!dismissed.has(x.id);};
 // Canonical command identity, projected into this concept's local adapter.
 // Production command bus / FileSafe dispatch remains outside this HTML.
 function dispatch(request){if(!request||request.commandId!=='cmd.chat.revert')return fail('unsupported_command');
  if(request.operation==='preview')return preview(request.turnId);
  if(request.operation==='confirm')return confirm(request.previewToken);
  return fail('unsupported_operation');
 }
 function externalEdit(workspaceId,path,body){const w=spaces.get(workspaceId);if(!permitted(w))return fail('workspace_scope');if(!validPath(path)||!validBody(body))return fail('invalid_file');const before=entry(w,path);const staged=new Map(w.entries);staged.set(path,{body,revision:before.revision+1});w.entries=staged;w.revision++;return {ok:true,revision:before.revision+1};}
 function exportData(id){const r=turns.get(id);if(!permitted(r))return fail('turn_scope');return {kind:'local_whole_turn_revert',schemaVersion:2,nativeRuntime:false,persistence:'session_only',provenance:r.provenance,exportedAt:now(),turn:clone(r),currentFiles:inspect(r),workspace:workspace(r.workspaceId),notice:'Includes visible local example contents. Not a native FileSafe receipt.'};}
 function show(id){if(!own(id))return fail('turn_scope');const c=E.ctx();c.closeMenu();c.closeDialog();c.openEditor('revert:'+id);return {ok:true};}
 function emit(result){if(!result.receipt)return;const c=E.ctx();if(c.thread.messages.some(m=>m.id===result.receipt.id))return;c.appendMessage({id:result.receipt.id,role:'system',type:'revert-receipt',turnId:result.receipt.turnId,receiptId:result.receipt.id,time:result.receipt.at});}
 function viewOf(id){let v=views.get(id);if(!v){v={focus:null,modes:{}};views.set(id,v);}return v;}
 /* "See what's blocking it" only looks (IMPACT A1-33): the document opens at that file, showing Now */
 function lookAt(id,path){const v=viewOf(id);if(path){v.focus=path;v.modes[path]='now';scrollTo={id,path};}return {focus:v.focus,modes:{...v.modes}};}

 /* ------------------------------------------------------------ words (plain text; every caller escapes once) */
 const plural=(n,one,many)=>n+' '+(n===1?one:(many||one+'s'));
 const base=p=>String(p).split('/').pop();
 const VERB={modified:'Put back the old version',created:'Delete the file it made',deleted:'Bring back the file it deleted'};
 const BACK_VERB={modified:'Already back to the old version',created:'The file it made is already gone',deleted:'The file it deleted is already back'};
 const GLYPH={modified:'rewind',created:'trash',deleted:'file'};
 const DID={modified:'Edited',created:'Made',deleted:'Deleted'};
 const DID_GLYPH={modified:'file-edit',created:'file',deleted:'trash'};
 const PROV=()=>(COPY.provenance&&COPY.provenance.revert)||'Demo: no real files are touched.';
 const RECORDED=()=>(COPY.cost&&COPY.cost.recorded)||'Recorded example · no AI cost';
 const WORD=k=>(COPY.revert&&COPY.revert[k])||{reverted:'Reverted',refused:'Refused',alreadyBack:'Already back to before',unfinished:'Didn’t finish',recovery:'Needs recovery'}[k];
 const clock=iso=>S.pmxTime?S.pmxTime.at(iso,null,{day:false}):'';
 function totals(r){const t={n:r.manifest.length,add:0,del:0,m:0,c:0,d:0};for(const f of r.manifest){t.add+=f.add;t.del+=f.del;t[f.kind==='modified'?'m':f.kind==='created'?'c':'d']++;}return t;}
 /* "edited 1 file, made 1 and deleted 1" */
 function didWords(r){const t=totals(r),bits=[['edited',t.m],['made',t.c],['deleted',t.d]].filter(b=>b[1]).map((b,i)=>b[0]+' '+(i?b[1]:plural(b[1],'file')));
  return bits.length>1?bits.slice(0,-1).join(', ')+' and '+bits.at(-1):bits[0]||'changed nothing';}
 /* the file names a refusal names: "checkout.js", "checkout.js and notes.txt", "checkout.js and 2 more files" */
 function whoChanged(paths){const n=paths.map(base);return n.length<2?(n[0]||'A file'):n.length===2?n[0]+' and '+n[1]:n[0]+' and '+plural(n.length-1,'more file');}
 /* own count classes: inside a sheet .pmx-add is also the specialist Add control (module-shell.css), which boxes it.
    Only the sides that changed print ("+1", "−1", "+2 −1"); `was` keeps the sides of the figures a roll replaces */
 function counts(add,del,extra,was){const w=was||{add,del},a=w.add>0||!w.del,d=w.del>0||!w.add;
  return '<span class="'+(extra?'pmx-revert-counts '+extra:'pmx-revert-counts')+'">'+(a?'<i class="pmx-revert-plus">+'+add+'</i>':'')+(a&&d?' ':'')+(d?'<i class="pmx-revert-minus">−'+del+'</i>':'')+'</span>';}
 const LN={add:'pmx-revert-ln pmx-revert-ln-add',del:'pmx-revert-ln pmx-revert-ln-del',same:'pmx-revert-ln'};
 const GUT={add:'<i class="pmx-revert-plus">+</i>',del:'<i class="pmx-revert-minus">−</i>',same:'<i> </i>'};
 const line=o=>'<span class="'+LN[o.op]+'">'+GUT[o.op]+esc(o.text)+'</span>';
 /* a diff with two lines of context around each change; a longer unchanged run folds into one quiet line */
 function diffLines(ops){const keep=ops.map(()=>false);ops.forEach((o,i)=>{if(o.op!=='same')for(let k=Math.max(0,i-2);k<=Math.min(ops.length-1,i+2);k++)keep[k]=true;});
  const out=[];let gap=0;const flush=()=>{if(gap){out.push('<span class="pmx-revert-ln pmx-revert-ln-gap">'+plural(gap,'unchanged line')+'</span>');gap=0;}};
  ops.forEach((o,i)=>{if(keep[i]||ops.length<=6){flush();out.push(line(o));}else gap++;});flush();return out.join('');}
 /* "See what happened", or "Open" where the line or row is narrow (revert-protocol.css) */
 const SEE='<span class="pmx-revert-see-long">See what happened</span><span class="pmx-revert-see-short">Open</span>';

 /* ------------------------------------------------------------ builder gaps (FOUNDATION REQUESTS 2 and 3), guarded */
 const warned=new Set();
 const once=(what,why)=>{if(warned.has(what))return;warned.add(what);try{console.warn('[revert] '+what+': '+why+'; drawn with REVERT’s own minimal markup');}catch(e){}};
 /* no primary (8.12 "Ineligible ... there is no primary"): pmxFoot always draws one, so it is taken out */
 const PRIMARY_RE=/<button type="button" class="primary-button pmx-primary"[^>]*>[\s\S]*?<\/button>/;
 function footNoPrimary(o){const html=S.pmxFoot({...o,primary:{}}),out=html.replace(PRIMARY_RE,'');if(out!==html)return out;
  once('pmxFoot','its primary could not be removed');const c=o.cancel||{};
  return '<footer class="mdl-foot pmx-foot" data-save="0"><div class="pmx-foot-say">'+(o.readback||'')+'</div>'+(o.extra||'')+'<button type="button" class="soft-button pmx-cancel" data-action="'+esc(c.action||'close-dialog')+'" '+(c.attrs||'')+'>'+(c.label||'Cancel')+'</button></footer>';}
 /* the files row in another state ("Reverted · 3 files put back"): pmxFilesRow only says "Changed ...", so its
    glyph and words are swapped for `lead`; every other part stays the builder's */
 const LEAD_RE=/<svg[\s\S]*?<\/svg><span>Changed[\s\S]*?<i class="pmx-del">[^<]*<\/i>/;
 function stateRow(o,lead){const html=S.pmxFilesRow(o),out=html.replace(LEAD_RE,lead);if(out!==html)return out;
  once('pmxFilesRow','its "Changed" words could not be replaced');const r=o.revert;
  return '<p class="pmx-files '+esc(o.cls||'')+'" data-k="'+esc(o.key)+'" '+(o.attrs||'')+'>'+lead+(r?'<span class="pmx-sep"> · </span><button type="button" class="text-button" data-action="'+esc(r.action)+'" '+(r.attrs||'')+'>'+(r.label||'Revert')+'</button>':'')+'</p>';}
 /* the chat row's figures print only the sides that changed ("+4", not "+4 −0"); exact strings, so a changed
    builder only leaves the zero printed (FOUNDATION REQUEST 6) */
 /* the older-change reason follows the counts after the same " · " the eligible row puts before Revert; exact string, so
    a changed builder only loses the separator (FOUNDATION REQUEST 10) */
 const reasonSep=html=>html.replace('<span class="pmx-reason">','<span class="pmx-sep"> · </span><span class="pmx-reason">');
 /* the row's words: "Changed " leaves a narrow row ("3 files +3 −2 · Revert") and past that the words end in an ellipsis
    (revert-protocol.css); exact string, so a changed builder only loses the narrow step */
 const words=html=>html.replace('<span>Changed ','<span class="pmx-revert-words"><span class="pmx-revert-changed">Changed </span>');
 const oneSide=(html,t)=>t.add&&!t.del?html.replace(' <i class="pmx-del">−0</i>',''):!t.add&&t.del?html.replace('<i class="pmx-add">+0</i> ',''):html;
 /* a record that draws nothing: keyed, no height, and out of the turn spine (its own empty data-turn-pos wins
    over the stamp, so turn-stage.js never measures it). Not a pmx surface, so no pmx- class (IMPACT A2-18). */
 const nothing=(key,attrs)=>'<i class="revert-record-quiet" data-k="'+esc(key)+'" data-turn-pos="" hidden'+(attrs||'')+'></i>';

 /* ------------------------------------------------------------ the confirm sheet (8.12) */
 const TITLE='Revert the assistant’s last changes?',LEAD='Your chat stays as it is. Only these files change: all of them together, or none.';
 const STATE_WORD={ready:'Ready to revert',held:'Not changed',back:'Nothing to do'};
 const TECH='<span class="pmx-revert-techline">Technical details: <code>cmd.chat.revert</code></span>';
 /* Cancel is where focus starts: the safe default of a destructive confirm (6.7) */
 const AF=' data-pmx-autofocus';
 /* dflt: on a list of three files or fewer the first row's mini diff starts open, so the reader sees exactly what goes
    back before pressing the primary and the fixed sheet's height is used (design review cycle 2) */
 function sheetRow(r,f,st,i,token,dflt){
  const mf=r.manifest.find(m=>m.path===f.path)||{add:0,del:0,kind:f.kind,before:{body:null},after:{body:null}};
  /* a row changed since discloses the later edit, under its own key (a reader's choice for one never opens the other) */
  const later=st==='changed',key=r.id+':'+f.path+(later?':later':'')+':sheet',open=disclosures.has(key)?disclosures.get(key):!!dflt;
  /* the rewind: the counters roll to 0 (the old figures ride up and out) */
  const cnt=st==='done'
   ?'<span class="pmx-revert-roll" data-k="rvn:'+esc(f.path)+':0"><span class="pmx-revert-odo">'+counts(mf.add,mf.del,'pmx-revert-was')+counts(0,0,'',mf)+'</span></span>'
   :counts(mf.add,mf.del);
  const right=st==='changed'
   ?'<button type="button" class="text-button pmx-revert-block" data-action="revert-review-conflict" data-value="'+esc(token)+'" data-path="'+esc(f.path)+'">See what’s blocking it</button>'
   :st==='done'||st==='past'&&r.state==='reverted'?'<span class="pmx-revert-state">'+S.pmxGlyph('check',14,'pmx-revert-check')+'<span class="pmx-revert-put">Put back</span></span>'
   :st==='past'?''
   :'<span class="pmx-revert-state">'+STATE_WORD[st]+'</span>';
  const verb=st==='changed'?'<b>You changed this since</b>':st==='back'?BACK_VERB[f.kind]:st==='past'?DID[f.kind]+' by the assistant':VERB[f.kind];
  /* a row changed since shows that later edit (the assistant's edit -> now), the one thing revert protects; the other
     rows show the assistant's change. The Revert document keeps both ("See what's blocking it") */
  const show=later?['Show what changed since','Hide what changed since']:['Show the change','Hide the change'];
  const ops=(later?lineDiff((f.expected||mf.after).body,f.current?f.current.body:null):lineDiff(mf.before.body,mf.after.body)).ops.filter(o=>o.op!=='same'),more=ops.length-3;
  return '<details class="pmx-revert-file" data-k="rvf:'+esc(f.path)+'" data-state="'+st+'" data-kind="'+esc(f.kind)+'" data-revert-disclosure="'+esc(key)+'" style="--i:'+Math.min(i,5)+'"'+(dflt?' data-revert-default="1"':'')+(open?' open':'')+'>'+
   /* read-only rows (a change that can't be reverted) show what the assistant did, not the revert action */
   '<summary class="pmx-revert-sum"><span class="pmx-revert-glyph">'+S.pmxGlyph((st==='past'?DID_GLYPH:GLYPH)[f.kind]||'file',16)+'</span>'+
    '<span class="pmx-revert-copy"><span class="pmx-revert-l1"><code class="pmx-revert-path">'+esc(f.path)+'</code>'+cnt+'</span>'+
     '<span class="pmx-revert-l2"><span class="pmx-revert-verb">'+verb+'</span><span class="pmx-revert-show">'+S.pmxGlyph('chevron-down',12)+'<span class="pmx-revert-show-a">'+show[0]+'</span><span class="pmx-revert-show-b">'+show[1]+'</span></span></span></span>'+
    right+'</summary>'+
   '<pre class="pmx-revert-mini"'+(later?' data-later="1"':'')+'>'+(ops.length?'':'<span class="pmx-revert-ln pmx-revert-ln-gap">'+(later&&f.current&&f.current.body===null?'The file isn’t there now.':'No line changes, only the file’s record.')+'</span>')+ops.slice(0,3).map(line).join('')+(more>0?'<span class="pmx-revert-ln pmx-revert-ln-gap">'+plural(more,'more changed line')+' in the Revert document</span>':'')+'</pre></details>';
 }
 /* the file list: past five files it is sized to show a part of the next row, so more rows visibly wait below
    (data-many, from the template); the fade while it overflows is the #pmOverlayRoot flag markList() keeps */
 const fileList=(r,rows,st,token,roomy)=>'<div class="pmx-revert-files" data-k="rv-files"'+(rows.length>5?' data-many="1"':'')+'>'+rows.map((f,i)=>sheetRow(r,f,st(f),i,token,roomy!==false&&i===0&&rows.length<=3)).join('')+'</div>';
 /* Ineligible (8.12): the title states the situation once, and there is no primary. A change that exists shows
    its files (read-only) and "See what happened". */
 const NONE_TITLE={revert_done:'Already reverted',restore_skipped:'Already back to before',restore_recovery_required:'Needs recovery',revert_not_latest:'Only the latest change can be reverted',no_eligible_mutating_turn:'Nothing to revert yet'};
 const NONE_LEAD='Revert puts back every file the latest reply changed, or none.';
 function ineligibleSheet(c,d,r){
  const a=r?availability(r.id):null,code=(a&&!a.eligible&&a.code)||d.code||'',reason=d.reason||(a&&a.reason)||refusal('no_eligible_mutating_turn');
  const title=NONE_TITLE[code]||(r?'Nothing to revert':NONE_TITLE.no_eligible_mutating_turn),lead=NONE_TITLE[code]||!r?NONE_LEAD:reason;
  const tid=r?'data-value="'+esc(r.id)+'"':'';
  const body='<div class="pmx-revert-body" data-face="ineligible">'+(r&&r.manifest.length
   ?S.pmxQuestion({key:'rv-q-past',title:'What this change did',meta:esc(plural(r.manifest.length,'file'))})+fileList(r,r.manifest,()=>'past','')
   :S.pmxQuestion({key:'rv-q-none',title:'When revert is available',helper:'When the assistant changes files in this chat, Revert appears under its reply. It puts back every file that reply changed, all together.'}))+'</div>';
  const see=r?'<button type="button" class="text-button pmx-revert-see" data-action="revert-open" '+tid+'>See what happened</button>':'';
  /* the canon name stays visible on this face too (principle 10): what Revert Last Agent Edit did, or why not */
  const x=r&&r.attempts.at(-1),at=x?clock(x.at):'',these=r?(r.manifest.length===1?'this file':'these '+plural(r.manifest.length,'file')):'';
  const said=code==='revert_done'?'put '+these+' back'+(at?' at '+at:'')+'.':code==='restore_skipped'?'found '+these+' already back'+(at?' at '+at:'')+'.':code==='revert_not_latest'?'reverts only the latest change that edited files.':code==='restore_recovery_required'?'needs this change recovered first.':'works on the latest reply that changed files.';
  const readback=S.pmxReadback({key:'rv-rb-none',parts:[{html:'<b>Revert Last Agent Edit</b> '+esc(said)}]});
  return S.pmxSheet({type:'revert-confirm',kind:'revert',size:'compact',height:520,cls:'revert-confirm',closeAction:'revert-cancel',closeAttrs:'data-value=""',title:esc(title),lead:esc(lead),ariaLabel:'Revert Last Agent Edit',
   attrs:r?'data-turn-id="'+esc(r.id)+'"':'',body,foot:footNoPrimary({readback,extra:see,cancel:{action:'revert-cancel',attrs:'data-value=""'+AF,label:'Close'}})});
 }
 function faceOf(p,o){if(!o)return allBack(p.rows)?'back':p.rows.every(f=>f.match)?'ready':'blocked';
  return o==='restored_clean'?'done':o==='restore_skipped'?'back':o==='restore_refused'?'refused':'failed';}
 function dialog(c){const d=c.state.dialog;if(d?.type!=='revert-confirm')return '';
  const r=d.turnId?own(d.turnId):null,p=d.token?previews.get(d.token):null;
  if(!r||!p||!permitted(p)||(p.cancelled&&!p.result))return ineligibleSheet(c,d,r);
  const x=p.result&&p.result.receipt,o=x&&x.outcome,face=faceOf(p,o);
  const rows=x?x.rows:p.rows,changed=rows.filter(f=>!f.match).map(f=>f.path);
  const st=f=>face==='ready'||face==='done'||face==='back'?face:face==='failed'?'held':(f.match?'held':'changed');
  const n=r.manifest.length,files=plural(n,'file'),tok='data-value="'+esc(p.token)+'"',tid='data-value="'+esc(r.id)+'"';
  const fine=r.provenance==='recorded'?S.pmxEstimate({text:PROV()}):'';
  /* each face's primary has its own identity (data-k): the pressed "Revert 3 files" leaves and "Leave my files as
     they are" enters as a new button, never a warm button re-coloured in place */
  const P=(k,o)=>({...o,attrs:(o.attrs||'')+' data-k="rv-p-'+k+'"'});
  let foot;
  if(face==='ready')foot=S.pmxFoot({readback:S.pmxReadback({key:'rv-rb',parts:[{html:'<b>Revert Last Agent Edit</b> puts back '+(n===1?'1 file.':files+' together, or none.')}]}),estimate:fine,
   cancel:{action:'revert-cancel',attrs:tok+AF},primary:P('go',{action:'af-revert-confirm',attrs:tok,label:'Revert '+files,tone:'warm'})});
  else if(face==='blocked')foot=S.pmxFoot({refusal:S.pmxRefusal({code:'target_changed',strong:'Can’t revert yet:',text:esc(whoChanged(changed))+' changed after the assistant’s edit, and revert puts back every file or none.'}),
   /* after a refusal (Retry) the choice to keep the later edit is still open, so it takes Cancel's place */
   cancel:refusalOpen(r)?{action:'revert-keep',attrs:tid+AF,label:'Leave my files as they are'}:{action:'revert-cancel',attrs:tok+AF},
   primary:P('go',{action:'af-revert-confirm',attrs:tok,label:'Revert '+files,tone:'warm',disabled:true})});
  /* the safe choice is the primary: after a conflict most people keep the edit they made on purpose */
  else if(face==='refused')foot=S.pmxFoot({refusal:S.pmxRefusal({code:x.reason||'target_changed',strong:'Couldn’t revert:',text:esc(whoChanged(changed))+' changed after the assistant’s edit. Nothing was touched.'}),
   cancel:{action:'af-revert-retry',attrs:tid,label:'Retry'},primary:P('keep',{action:'revert-keep',attrs:tid+' data-revert-arm="1"',label:'Leave my files as they are'})});
  else if(face==='failed')foot=S.pmxFoot({refusal:S.pmxRefusal({code:x.reason||'restore_failed',strong:'Didn’t finish:',text:'your files are exactly as they were before trying.'}),
   cancel:{action:'revert-cancel',attrs:tok,label:'Close'},primary:P('retry',{action:'af-revert-retry',attrs:tid+' data-revert-arm="1"',label:'Retry'})});
  /* every file is already as it was: confirming writes nothing and records restore_skipped */
  else if(face==='back')foot=S.pmxFoot({readback:S.pmxReadback({key:'rv-rb-back',parts:[{html:'<b>'+WORD('alreadyBack')+':</b> nothing to revert.'}]}),estimate:fine,
   cancel:{action:'revert-cancel',attrs:tok+(x?'':AF),label:x?'Close':'Cancel'},primary:P('back',{action:'af-revert-confirm',attrs:tok,label:'Done',disabled:!!x})});
  else foot=S.pmxFoot({readback:S.pmxReadback({key:'rv-rb-done',parts:[{html:'<b>'+WORD('reverted')+':</b> '+files+' put back.'}]}),estimate:fine,
   cancel:{action:'revert-cancel',attrs:tok,label:'Close'},primary:P('go',{action:'af-revert-confirm',attrs:tok,label:WORD('reverted'),tone:'warm',disabled:true})});
  /* the conflict example's guide line takes the room the first row's open mini diff would need */
  const guide=face==='ready'?(window.PM56_REVERT_DEMOS?.dialogGuide(c,r.id,true)||''):'';
  /* the blocked face says what would make revert possible, in the reader's terms */
  const help=face==='blocked'?'To revert, put '+esc(whoChanged(changed))+' back the way the assistant left it, or leave your files as they are.':'';
  const body='<div class="pmx-revert-body" data-face="'+face+'">'+
   S.pmxQuestion({key:'rv-q',title:'What goes back',meta:esc(files)+(n>1?' · all or none':''),helper:help})+fileList(r,rows,st,p.token,!guide)+
   /* the promise, and the one Technical details line naming the primary's command (8.15, IMPACT A1-53) */
   (face==='ready'||face==='done'?S.pmxPromises(S.pmxPromise({key:'rv-check',glyph:'clock',text:face==='done'?'Checked once more right before reverting.':'We’ll check once more right before reverting.',extra:TECH})):'<p class="pmx-fine pmx-revert-tech">'+TECH+'</p>')+'</div>';
  return S.pmxSheet({type:'revert-confirm',kind:'revert',size:'compact',height:520,cls:'revert-confirm',closeAction:'revert-cancel',closeAttrs:tok,title:TITLE,lead:LEAD,ariaLabel:'Revert Last Agent Edit',
   attrs:'data-turn-id="'+esc(r.id)+'"',guide,body,foot});
 }

 /* ------------------------------------------------------------ in chat (7.11): the files row and the outcome lines */
 const FOLD={restored_clean:1,restore_skipped:1};
 const msgs=c=>(c.t||c.thread||{}).messages||[];
 /* the outcome that directly follows its own files row and is the change's final word folds into that row */
 function foldsInto(c,m){const list=msgs(c),i=list.indexOf(m),prev=i>0?list[i-1]:null;if(!prev||prev.type!=='revert-turn'||prev.turnId!==m.turnId)return false;
  const r=turns.get(m.turnId),x=r&&r.attempts.at(-1);return !!x&&x.id===m.receiptId&&!!FOLD[x.outcome];}
 function foldedAfter(c,m){const list=msgs(c),i=list.indexOf(m),next=i>=0?list[i+1]:null;return !!next&&next.type==='revert-receipt'&&next.turnId===m.turnId&&foldsInto(c,next);}
 /* the older-change reason: the full sentence on a wide row, a shorter one where it would wrap (revert-protocol.css) */
 const WHY_SHORT={revert_not_latest:['Only the latest change can be reverted.','Not the latest change','Not the latest']};
 const why=a=>{const s=WHY_SHORT[a.code];return s?'<span class="pmx-revert-why-l">'+esc(a.reason)+'</span><span class="pmx-revert-why-m">'+esc(s[0])+'</span><span class="pmx-revert-why-s">'+esc(s[1])+'</span><span class="pmx-revert-why-xs">'+esc(s[2])+'</span>':esc(a.reason);};
 function filesRow(c,m){const r=own(m.turnId);if(!r)return '';
  /* 7.5 / 8.12: the row sits only under a reply that changed files; the record stays as the audit trail (B.13) */
  if(!r.manifest.length)return nothing(m.id);
  const a=availability(r.id),t=totals(r),tid='data-value="'+esc(r.id)+'"';
  const tip=r.provenance==='recorded'?' data-hover-key="rvfiles:'+esc(r.id)+'" data-hover-tip="'+esc(PROV())+'"':'';
  const o={key:m.id,cls:'pmx-revert-row',attrs:'data-turn-id="'+esc(r.id)+'" tabindex="-1"'+tip,count:t.n,add:t.add,del:t.del};
  const see=foldedAfter(c,m)?{action:'revert-open',attrs:tid,label:SEE}:null;
  if(r.state==='reverted')return stateRow({...o,revert:see},S.pmxGlyph('check',13,'pmx-revert-check')+'<span class="pmx-revert-did"><b>'+WORD('reverted')+'</b> · '+esc(plural(t.n,'file'))+' put back</span>');
  /* " · nothing to revert" leaves a narrow row first, then "See what happened" reads "Open" (revert-protocol.css) */
  if(r.state==='skipped')return stateRow({...o,revert:see},S.pmxGlyph('check',13,'pmx-revert-tone-quiet')+'<span class="pmx-revert-did"><b>'+WORD('alreadyBack')+'</b><span class="pmx-revert-did-more"> · nothing to revert</span></span>');
  if(a.eligible){if(!retryOpen(r,a))o.revert={action:'af-revert-preview',attrs:tid};}else o.reason=why(a);
  return reasonSep(words(oneSide(S.pmxFilesRow(o),t)));
 }
 const TONE={ok:'pmx-revert-tone-ok',warn:'pmx-revert-tone-warn',bad:'pmx-revert-tone-bad',quiet:'pmx-revert-tone-quiet'};
 /* The headline keeps the outcome word and the file name at every width, and drops words from the end as the
    line narrows: .pmx-revert-hl-l shows only on a wide line, .pmx-revert-hl-m leaves the narrowest (S) line.
    The full sentence is the headline's hover card, after "Recorded example · no AI cost" on a recorded example. */
 const L=s=>'<span class="pmx-revert-hl-l">'+s+'</span>',M=s=>'<span class="pmx-revert-hl-m">'+s+'</span>';
 function receiptLine(c,m){const r=own(m.turnId);if(!r)return '';const x=r.attempts.find(a=>a.id===m.receiptId);if(!x)return '';
  /* folded into the files row just above ("Reverted · 3 files put back · See what happened"): no second line */
  if(foldsInto(c,m))return nothing(m.id,' data-outcome="'+esc(x.outcome)+'"');
  const t=totals(r),a=availability(r.id),tid='data-value="'+esc(r.id)+'"',see={action:'revert-open',attrs:tid,label:SEE};
  const retry=a.eligible&&r.attempts.at(-1)?.id===x.id&&!dismissed.has(x.id)?{action:'af-revert-retry',attrs:tid,label:'Retry'}:null;
  let glyph,headline,actions,tip='';
  if(x.outcome==='restored_clean'){glyph=S.pmxGlyph('check',14,TONE.ok);tip=outcomeSentence(r,x);headline='<b>'+WORD('reverted')+'</b><span class="pmx-revert-hl-cnt">: '+esc(plural(t.n,'file'))+M(' restored')+'</span>';actions=[see];}
  else if(x.outcome==='restore_skipped'){glyph=S.pmxGlyph('check',14,TONE.quiet);tip=WORD('alreadyBack')+': nothing to revert.';headline='<b>'+(esc(WORD('alreadyBack')).replace(/ to before$/,M(' to before')))+'</b>'+L(': nothing to revert');actions=[see];}
  /* a refusal names its reason at every width: "Couldn't revert: checkout.js changed" (and, while its Retry is open
     on a wide line, ". Nothing was touched."), or where it is narrow "Not reverted: checkout.js changed" and on the
     narrowest line "Not reverted · checkout.js" (never "block", DON'T 22 / 9.4): never a bare file
     name after "Couldn't revert", which would read as a partial result (A1-35, DON'T 16) */
  else if(x.outcome==='restore_refused'&&x.reason==='target_changed'){const who='<span class="pmx-revert-who">'+esc(whoChanged(x.changedPaths||[]))+'</span>';glyph=S.pmxGlyph('warn',14,TONE.warn);
   tip='Couldn’t revert: '+whoChanged(x.changedPaths||[])+' changed after the assistant’s edit. Nothing was touched.';
   headline='<span class="pmx-revert-hl-full"><b>Couldn’t revert:</b> '+who+' changed'+(retry?L('. Nothing was touched.'):'')+'</span><span class="pmx-revert-hl-short"><b>Not reverted</b>'+M(': '+who+' changed')+'<span class="pmx-revert-hl-s"> · '+who+'</span></span>';actions=[retry||see];}
  else if(x.outcome==='restore_refused'){glyph=S.pmxGlyph('warn',14,TONE.warn);tip=WORD('refused')+': nothing changed ('+(x.reason||'refused')+').';headline='<b>'+WORD('refused')+'</b>'+M(': nothing changed')+L(' ('+esc(x.reason||'refused')+')');actions=[retry||see];}
  else if(x.outcome==='restore_failed'){glyph=S.pmxGlyph('warn',14,TONE.bad);tip='Didn’t finish: your files are exactly as they were before trying.';headline='<b>'+WORD('unfinished')+'</b><span class="pmx-revert-hl-nl">'+M(': nothing changed')+'</span>'+L(': your files are exactly as they were before trying');actions=[retry||see];}
  /* restore_recovery_required: the runtime recovery command comes from allowed_action_ids, and this concept has
     none, so Recover is disabled and its reason is printed in the headline */
  else{const no=refusal('command_not_registered');glyph=S.pmxGlyph('warn',14,TONE.warn);tip=WORD('recovery')+'. Recover: '+no;headline='<b>'+WORD('recovery')+'</b>'+L(' · '+esc(no.charAt(0).toLowerCase()+no.slice(1).replace(/\.$/,'')));actions=[{label:'Recover',disabled:true,attrs:'data-failure="command_not_registered"'},see];}
  const time=clock(x.at);
  if(tip)headline='<span data-hover-key="rvtip:'+esc(x.id)+'" data-hover-tip="'+esc([r.provenance==='recorded'?RECORDED():'',tip+(time?' · '+time:'')].filter(Boolean).join('\n'))+'">'+headline+'</span>';
  return S.pmxLedgerLine({key:m.id,cls:'pmx-revert-line',kind:'revert',kindWord:'Revert',title:'Revert Last Agent Edit',attrs:'data-turn-id="'+esc(r.id)+'" data-outcome="'+esc(x.outcome)+'"'+(x.reason?' data-failure="'+esc(x.reason)+'"':''),
   glyph,headline,time,recorded:r.provenance==='recorded',actions:actions.filter(Boolean)});
 }

 /* ------------------------------------------------------------ the Revert document (revert:{turnId}) */
 const NOW_WORD={'as-left':'As the assistant left it',changed:'Changed since',back:'Put back',moved:'Changed after revert'};
 function nowState(r,f,cur){if(r.state==='reverted'){const at=r.attempts.find(x=>x.outcome==='restored_clean')?.rows.find(x=>x.path===f.path)?.current;return at&&sameEntry(cur,at)?'back':'moved';}return sameEntry(cur,f.after)?'as-left':'changed';}
 const MODES=[{value:'agent',label:'What the assistant changed'},{value:'revert',label:'What revert put back'},{value:'now',label:'Now'}];
 function docFile(r,f,v){const w=spaces.get(r.workspaceId),cur=w?entry(w,f.path):{body:null,revision:0},ns=nowState(r,f,cur);
  const mode=v.modes[f.path]||(r.state==='reverted'?'revert':ns==='changed'?'now':'agent');
  let d,cap;
  if(mode==='agent'){d=lineDiff(f.before.body,f.after.body);cap=f.kind==='created'?'The assistant made this file.':f.kind==='deleted'?'The assistant deleted this file.':'What the assistant changed, line by line.';}
  else if(mode==='revert'){d=lineDiff(f.after.body,f.before.body);cap=r.state==='reverted'?'What revert put back.':'Revert hasn’t run. This is what it would put back.';}
  else{d=lineDiff(f.after.body,cur.body);cap=ns==='back'?'Now it is back to how it was before the assistant’s change.':ns==='as-left'?'Unchanged since the assistant’s edit.':cur.body===null?'The file isn’t there now.':'What changed after the assistant’s edit.';}
  return '<section class="pmx-revert-dfile" data-k="rvd:'+esc(r.id)+':'+esc(f.path)+'" data-revert-file="'+esc(f.path)+'" data-state="'+ns+'"'+(v.focus===f.path?' data-focus="1"':'')+'>'+
   '<header class="pmx-revert-sum pmx-revert-dhead"><span class="pmx-revert-glyph">'+S.pmxGlyph(DID_GLYPH[f.kind]||'file',16)+'</span>'+
    '<span class="pmx-revert-copy"><span class="pmx-revert-l1"><code class="pmx-revert-path">'+esc(f.path)+'</code>'+counts(f.add,f.del)+'</span><span class="pmx-revert-l2"><span class="pmx-revert-verb">'+DID[f.kind]+' by the assistant</span></span></span>'+
    '<span class="pmx-revert-state">'+NOW_WORD[ns]+'</span></header>'+
   S.pmxSwitch({key:'rvsw:'+r.id+':'+f.path,size:'small',cls:'pmx-revert-switch',label:'Show for '+base(f.path),current:mode,action:'revert-view',
    options:MODES.map(m=>({value:m.value,label:m.label,attrs:'data-turn="'+esc(r.id)+'" data-path="'+esc(f.path)+'"'}))})+
   '<p class="pmx-fine pmx-revert-cap">'+cap+'</p>'+(d.ops.length?'<pre class="pmx-revert-diff">'+diffLines(d.ops)+'</pre>':'')+'</section>';
 }
 /* one outcome as a sentence (plain text) */
 function outcomeSentence(r,x){const n=plural(x.rows.length||r.manifest.length,'file');
  if(x.outcome==='restored_clean')return WORD('reverted')+': '+n+' put back, and each one checked.';
  if(x.outcome==='restore_skipped')return WORD('alreadyBack')+': nothing to revert.';
  if(x.outcome==='restore_refused'&&x.reason==='target_changed')return 'Couldn’t revert: '+whoChanged(x.changedPaths||[])+' changed after the assistant’s edit. Nothing was touched.';
  if(x.outcome==='restore_refused')return WORD('refused')+': nothing changed ('+(x.reason||'refused')+').';
  if(x.outcome==='restore_failed')return 'Didn’t finish: your files are exactly as they were before trying.';
  return WORD('recovery')+'.';}
 const OUT_GLYPH={restored_clean:'check',restore_skipped:'check',restore_refused:'warn',restore_failed:'warn',restore_recovery_required:'warn'};
 const OUT_TONE={restored_clean:TONE.ok,restore_skipped:TONE.quiet,restore_failed:TONE.bad};
 function render(c,id){const r=own(id);
  if(!r)return S.pmxView({key:'revert:'+id,cls:'revert-document',kind:'revert',kindWord:'Revert Last Agent Edit',title:'This change is no longer here',statusHtml:'Its chat was reset, so there is nothing to revert or show.'});
  const v=viewOf(id),a=availability(id),t=totals(r),x=r.attempts.at(-1),w=spaces.get(r.workspaceId);
  const later=r.state!=='reverted'&&w?r.manifest.filter(f=>!sameEntry(entry(w,f.path),f.after)).map(f=>f.path):[];
  /* plain text, escaped once below */
  const title=r.state==='reverted'?WORD('reverted')+': '+plural(t.n,'file')+' put back':r.state==='skipped'?WORD('alreadyBack'):r.state==='conflict'?'Couldn’t revert: '+whoChanged(x?.changedPaths||later)+' changed':(r.state==='failed'||r.state==='recovery')&&x?outcomeSentence(r,x).replace(/\.$/,''):plural(t.n,'file')+' the assistant changed';
  const status='The assistant '+esc(didWords(r))+'.'+(r.state==='reverted'?' Revert put all of them back.':r.state==='conflict'?' Nothing was touched.':'');
  const tid='data-value="'+esc(id)+'"';
  /* while a refusal's choice is open: Retry, and "Leave my files as they are" (it writes no record) */
  const items=(a.eligible?[r.state==='conflict'||r.state==='failed'?{action:'af-revert-retry',attrs:tid,label:'Retry',tone:'soft'}:{action:'af-revert-preview',attrs:tid,label:'Revert '+plural(t.n,'file')+'…',tone:'soft'}]:[])
   .concat(refusalOpen(r)?[{action:'revert-keep',attrs:tid,label:'Leave my files as they are'}]:[])
   .concat([{action:'revert-export',attrs:tid,label:'Download record (.json)'}]);
  const acts=S.pmxActions({key:'rv-acts:'+id,items});
  const entries=[{key:'rvt:'+id+':turn',mid:id+':turn',markHtml:S.pmxGlyph('file-edit',16,'pmx-revert-tlg'),who:'The assistant',when:esc(clock(r.createdAt)),bodyHtml:'It '+esc(didWords(r))+'.'}]
   .concat(r.attempts.map(y=>({key:'rvt:'+y.id,mid:y.id,markHtml:S.pmxGlyph(OUT_GLYPH[y.outcome]||'warn',16,'pmx-revert-tlg '+(OUT_TONE[y.outcome]||TONE.warn)),who:'Revert',when:esc(clock(y.at)),bodyHtml:esc(outcomeSentence(r,y))})))
   .concat(later.length?[{key:'rvt:'+id+':later',mid:id+':later',markHtml:S.pmxGlyph('edit',16,'pmx-revert-tlg'),who:'Your files',when:'',bodyHtml:esc(whoChanged(later))+' changed after the assistant’s edit.'}]:[]);
  const techKey=id+':tech',techOpen=disclosures.has(techKey)?disclosures.get(techKey):false;
  const main=(window.PM56_REVERT_DEMOS?.guide(c,true)||'')+
   S.pmxViewSection({key:'rv-happened',title:'What happened',body:S.pmxTimeline({key:'rv-tl:'+id,entries})})+
   S.pmxViewSection({key:'rv-files-doc',title:'Files',meta:esc(plural(t.n,'file'))+' · '+counts(t.add,t.del),body:r.manifest.map(f=>docFile(r,f,v)).join('')})+
   '<details class="pmx-revert-more" data-revert-disclosure="'+esc(techKey)+'"'+(techOpen?' open':'')+'><summary class="pmx-revert-more-sum">'+S.pmxGlyph('chevron-right',12)+'<span>Technical details</span></summary><p class="pmx-fine">Revert Last Agent Edit runs <code>cmd.chat.revert</code> on this change. It checks every file again right before it changes anything, and puts back all of them or none. Turn <code>'+esc(id)+'</code> · '+plural(r.attempts.length,'attempt')+(w?' · workspace revision '+w.revision:'')+'.</p></details>'+
   (r.provenance==='recorded'?'<p class="pmx-fine pmx-revert-prov">'+esc(PROV())+'</p>':'');
  return S.pmxView({key:'revert:'+id,cls:'revert-document',kind:'revert',kindWord:'Revert Last Agent Edit',title:esc(title),statusHtml:status,actionsHtml:acts,mainHtml:main,attrs:'data-turn-id="'+esc(id)+'"'});
 }

 /* ------------------------------------------------------------ entry projections (wand row, message More, legacy card actions) */
 function actions(c,id){const a=availability(id),r=own(id);
  return (a.eligible?'<button type="button" class="soft-button" data-action="af-revert-preview" data-value="'+esc(id)+'">Revert'+(r?' '+plural(r.manifest.length,'file'):'')+'…</button>':'<span class="pmx-reason">'+esc(a.reason)+'</span>')+
   (r?'<button type="button" class="text-button" data-action="revert-open" data-value="'+esc(id)+'">See what happened</button>':'');}
 function overflow(c,m){const r=own(m.id);if(!r&&!F.state().revert.manifests[m.id])return null;const a=availability(m.id);
  return [{id:'af-revert',label:'Revert Last Agent Edit',detail:a.eligible&&r?plural(r.manifest.length,'file')+' · all together, or none':a.reason,icon:'restore',action:a.eligible?'af-revert-preview':'',value:m.id,danger:false,disabled:!a.eligible,reason:a.reason}];}
 const WAND_HELP='Put back every file the assistant’s last change touched, all together.';
 /* the row carries Revert's own mark, the one the sheet head, the lines and the document use (B2 kind identity) */
 function wand(c){const r=latest(),a=availability(r?.id);
  return '<button class="menu-item af-wand-row" data-action="af-revert-preview" data-value="'+c.esc(r?.id||'')+'"'+(a.eligible?'':' disabled')+' title="'+c.esc(a.eligible?WAND_HELP:a.reason)+'"><span class="menu-icon">'+S.pmxKindMark('revert',13)+'</span><span class="menu-copy"><strong>Revert Last Agent Edit</strong><span>'+c.esc(a.eligible?WAND_HELP:a.reason)+'</span></span></button>';}

 /* ------------------------------------------------------------ actions */
 const filesRowOf=id=>()=>document.querySelector('.transcript .pmx-files[data-turn-id="'+cssq(id)+'"]');
 function previewAction(c,b){const id=b.dataset.value,out=dispatch({commandId:'cmd.chat.revert',operation:'preview',turnId:id});
  /* the message's More panel (transcript.js) is not a menu: it closes through its own public API */
  c.closeMenu();try{window.PM56_MSG_OVERFLOW?.close?.();}catch(e){}
  /* an ineligible turn opens the sheet with its reason and no primary (8.12), never a toast. openDialog paints only
     the overlays; the app render takes down what must not stay under the sheet (the More panel, the Revert guide) */
  c.openDialog(out.ok?{type:'revert-confirm',turnId:out.turnId,token:out.token}:{type:'revert-confirm',turnId:id||null,token:null,reason:out.reason,code:out.error});c.renderApp();return true;}
 ['af-revert-preview','af-revert-retry'].forEach(a=>E.chainAction(a,previewAction));
 /* After a durable result (restored_clean, or restore_skipped) focus goes to the files row under the reply, however
    the sheet leaves: the rewind's own exit, Close, x, Escape or the scrim (6.7, IMPACT A1-36). Returns true then. */
 function leaveToRow(token){const x=token&&previews.get(token)?.result?.receipt;if(!x||!FOLD[x.outcome])return false;const P=PMX();if(P)P.exitHint('save',{focus:filesRowOf(x.turnId)});return true;}
 /* The rewind (8.12, IMPACT A1-35) plays only on a durable restored_clean: the sheet shows its done face, the
    rows turn back, their counters roll to 0 and a check is revealed; then the sheet leaves with the save exit
    and focus goes to the files row under the reply (6.7, IMPACT A1-36). Reduced motion: at once. */
 function closeWhenDone(c,token,turnId,n){const P=PMX(),go=()=>{const d=c.state.dialog;if(d?.type!=='revert-confirm'||d.token!==token)return;leaveToRow(token);c.closeDialog();c.renderApp();};
  if(!P||P.reduced()||!n)return go();P.timeline.after(P.t('move')+Math.min(n-1,5)*P.t('cascade')+P.t('flip')+P.t('fade'),go);}
 E.chainAction('af-revert-confirm',(c,b)=>{const token=b.dataset.value,p=previews.get(token);
  const out=dispatch({commandId:'cmd.chat.revert',operation:'confirm',previewToken:token});emit(out);
  const x=out.receipt;
  /* a stale or cancelled check never confirms: a fresh check opens instead (no toast-only result) */
  if(!x){if(p)previewAction(c,{dataset:{value:p.turnId}});else c.closeDialog();return true;}
  c.renderOverlays();
  if(FOLD[x.outcome])closeWhenDone(c,token,x.turnId,x.outcome==='restored_clean'?(turns.get(x.turnId)?.manifest.length||1):0);
  /* the refused and failed faces' primary is a new button: focus moves to it, never to <body> */
  else{const f=document.querySelector('#pmOverlayRoot .revert-confirm .pmx-foot .pmx-primary');if(f&&!f.disabled)try{f.focus({preventScroll:true});}catch(e){}}
  return true;});
 /* "See what's blocking it" only looks (IMPACT A1-33): it opens the Revert document at that file; it never
    confirms anything. */
 E.action('revert-review-conflict',(c,b)=>{const p=previews.get(b.dataset.value),id=p?.turnId||c.state.dialog?.turnId;if(!id){c.closeDialog();return true;}
  if(p&&!p.result)cancelPreview(p.token);const path=b.dataset.path||'';lookAt(id,path);
  const P=PMX();if(P&&path)P.exitHint('cancel',{focus:()=>document.querySelector('.pmx-view [data-revert-file="'+cssq(path)+'"] .pmx-switch-opt[aria-checked="true"]')});
  show(id);return true;});
 /* closeDialog repaints only the overlays; the app render brings back what hid while the sheet was open (guides) */
 E.action('revert-cancel',(c,b)=>{const t=b.dataset.value;if(t&&!leaveToRow(t))cancelPreview(t);c.closeDialog();c.renderApp();return true;});
 // Escape/backdrop and the generic close action must consume the same preview.
 E.chainAction('close-dialog',c=>{const d=c.state.dialog;if(d?.type==='revert-confirm'&&d.token&&!leaveToRow(d.token))cancelPreview(d.token);return false;});
 /* Leave my files as they are: no record, no file change; the sheet closes and the refusal's Retry goes. From
    the Revert document the button leaves with the choice, so focus moves to the document's first action. */
 E.action('revert-keep',(c,b)=>{const id=b.dataset.value;keep(id);if(c.state.dialog?.type==='revert-confirm'){c.closeDialog();c.renderApp();return true;}
  c.renderApp();const a=document.activeElement;if(!a||a===document.body||!a.isConnected){const f=document.querySelector('.pmx-view[data-turn-id="'+cssq(id)+'"] .pmx-view-acts button:not([disabled])');if(f)try{f.focus({preventScroll:true});}catch(e){}}return true;});
 E.action('revert-open',(c,b)=>{const out=show(b.dataset.value);if(!out.ok)c.toast('This change is no longer here','Its chat was reset.');return true;});
 /* IMPACT A3-07: view state, registered once; its value lives in this module's map */
 E.action('revert-view',(c,b)=>{const id=b.dataset.turn,path=b.dataset.path,v=b.dataset.value;if(id&&path&&['agent','revert','now'].includes(v)){viewOf(id).modes[path]=v;c.renderApp();}return true;});
 E.action('revert-export',(c,b)=>{const data=exportData(b.dataset.value);if(data.ok===false){c.toast('Download unavailable','This change is no longer here.');return true;}let url;try{url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='revert-'+b.dataset.value+'.json';a.click();}catch(e){c.toast('Download unavailable',String(e.message));}finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),2000);}return true;});
 // Never let a historical scripted fixture mint new "FileSafe restored" proof.
 E.chainAction('af-revert-seed',c=>{c.closeMenu();c.toast('Use the guided Revert examples','Demo Studio has recorded examples with exact file lists and real checks.');return true;});

 /* ------------------------------------------------------------ slots */
 E.slot('dialog',dialog);
 E.slot('editorTabLabel',c=>c.editorId?.startsWith('revert:')?'Revert · files':'');
 E.slot('editorDocument',c=>c.editorId?.startsWith('revert:')?render(c,c.editorId.slice(7)):'');
 /* 7.14: the files row and every outcome line are one-line ledger items, never a deliverable sheet */
 E.slot('transcriptFamily',c=>{const t=c.m?.type;return t==='revert-turn'||t==='revert-receipt'?'ledger':'';});
 E.slot('transcriptMessage',c=>{const m=c.m;if(m?.type==='revert-turn')return filesRow(c,m);if(m?.type==='revert-receipt')return receiptLine(c,m);return '';});
 /* the document opened at a file: bring that file into view once, after the render that drew it */
 const P0=PMX();if(P0)P0.after((c,phase)=>{if(phase!=='app'||!scrollTo)return;const s=scrollTo,el=document.querySelector('.pmx-view[data-turn-id="'+cssq(s.id)+'"] [data-revert-file="'+cssq(s.path)+'"]');if(!el)return;scrollTo=null;try{el.scrollIntoView({block:'nearest'});}catch(e){}});
 /* the sheet's file list scrolls with the 14 px fade (6.3) only while it overflows. The flag lives on
    #pmOverlayRoot, which no template patches (the list node itself stays exactly as its template drew it);
    measured after each overlay render and when a row opens or closes its mini diff (no render happens then). */
 const flag=(root,name,v)=>{if(v!==root.hasAttribute(name)){if(v)root.setAttribute(name,'1');else root.removeAttribute(name);}};
 function markList(){const root=document.getElementById('pmOverlayRoot');if(!root)return;const l=root.querySelector('.revert-confirm:not(.pmx-ghost) .pmx-revert-files'),on=root.hasAttribute('data-revert-list-over');
  if(!l){flag(root,'data-revert-list-over',false);flag(root,'data-revert-list-top',false);return;}
  const pad=on?parseFloat(getComputedStyle(l).paddingBottom)||0:0,over=l.scrollHeight-pad>l.clientHeight+1;flag(root,'data-revert-list-over',over);flag(root,'data-revert-list-top',over&&l.scrollTop>0);}
 if(P0)P0.after((c,phase)=>{if(phase==='overlay')markList();});
 document.addEventListener('toggle',e=>{const n=e.target;if(!n.isConnected||!n.matches?.('details[data-revert-disclosure]'))return;const k=n.dataset.revertDisclosure,was=disclosures.has(k)?disclosures.get(k):n.hasAttribute('data-revert-default');disclosures.set(k,n.open);
  /* a row drawn open by default fires toggle too: only a reader's own change brings the row into view */
  if(n.closest('.pmx-revert-files')){markList();if(n.open&&was!==n.open)try{n.scrollIntoView({block:'nearest'});}catch(err){}}},true);
 /* a row's entrance rise (3 px) counts as overflow while it runs: measure again once each row has landed */
 document.addEventListener('animationend',e=>{const n=e.target;if(n&&n.nodeType===1&&n.matches('#pmOverlayRoot .revert-confirm .pmx-revert-file'))markList();},true);
 /* the list's top fade follows its scroll position (no render happens on scroll) */
 document.addEventListener('scroll',e=>{const n=e.target;if(n&&n.nodeType===1&&n.matches('#pmOverlayRoot .revert-confirm .pmx-revert-files'))markList();},true);
 /* the second click of a double-click on "Revert 3 files" (click count 2 or more) lands on the face that replaced it:
    it never presses that face's new primary ("Leave my files as they are", or Retry). A JS guard, so it holds at any
    motion setting; the first click of any press still works. Focus stays where the press put it (never moved here). */
 window.addEventListener('click',e=>{if(!(e.detail>1))return;const b=e.target&&e.target.closest?.('#pmOverlayRoot .revert-confirm .pmx-primary[data-revert-arm]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();},true);
 E.chainAction('reset-all',()=>{epoch++;spaces.clear();turns.clear();previews.clear();disclosures.clear();views.clear();dismissed.clear();scrollTo=null;return false;});
 window.PM56_REVERT={dispatch,createWorkspace,applyTurn,get,workspace,availability,preview,cancelPreview,confirm,keep,exportData,show,actions,overflow,wand,lookAt,
  provenance:id=>{const r=turns.get(id);return permitted(r)?r.provenance:null;},
  latest:()=>{const r=latest();return r?clone(r):null;},owns:id=>turns.has(id),example:{edit:externalEdit}};
})();
