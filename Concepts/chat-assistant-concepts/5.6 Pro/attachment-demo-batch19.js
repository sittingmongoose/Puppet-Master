/* attachment-demo-batch19.js — Batch 19 gallery preparations. Local fixtures and
 * ordinary routes only; all attachment/artifact/composer/schedule mutations go
 * through their existing owners (admitViaCommand, att-* actions, schedulers). */
(function(){
'use strict';
const E=PM56_EXT,AT=PM56_ATTACHMENTS,B19=window.PM56_B19,C=PM56_COMPOSER_STATE,R=PM56_RUNTIME;
const sessions=new Map();let sequence=0;
const clone=x=>JSON.parse(JSON.stringify(x));
function current(){const c=E.ctx();return c&&sessions.get(c.thread.id);}
function freshThread(ctx,title){
  const t=clone(ctx.state.threads.find(t=>t.id==='query'));
  Object.assign(t,{id:'batch19-'+(++sequence),title,messages:[],projectId:'concept:b19:'+sequence,worktreeId:'concept:b19:'+sequence,archived:false,pinned:false,goalId:null,status:'ready'});
  ctx.state.threads.push(t);
  Object.assign(ctx.state,{historyMode:'closed',menu:null,dialog:null,hover:null,editorTabs:[],activeEditor:null,editorRevealed:false,demoOpen:false});
  ctx.state.activity.open=false;ctx.switchThread(t.id);ctx=E.ctx();return t;
}
function seedTray(tid,records){
  const b=C.bufferFor(tid);b.attachments=records;b.text='';
  const reg=(R.attachments&&R.attachments.registerRecord)||(()=>{});
  const pipe=(R.attachments&&R.attachments.startPipeline)||(()=>{});
  for(const rec of records){reg(rec);
    /* Prepared samples enter processing through the real pipeline — the same
       function the picker and Retry paths call. Deliberately-failed samples
       keep their failed state so Retry has something honest to redo. */
    if(rec.process_state!=='failed'&&rec.process_state!=='ready')pipe(tid,rec.id,rec.origin,rec.kind);}
  const c=E.ctx();c.state.composer='';c.renderApp();
}
function start(ctx,flow){
  if(!['intake','live','folder'].includes(flow))return;
  const t=freshThread(ctx,flow==='intake'?'Attach, retry and remove':flow==='live'?'Live references and drift':'Folders stay bounded');
  const r={id:t.id,flow,threadId:t.id,projectId:t.projectId,last:null};
  if(flow==='intake'){
    const okFile=new File(['alpha\nbeta\n'],'sample-notes.txt',{type:'text/plain'});
    const admitted=B19?B19.admitViaCommand({source:'picker',semantic_kind:'file',make:()=>AT.makeUploadedFromFile(okFile)}):{ok:false};
    const failed=AT.makeUploadedFromFile(new File(['x'],'legacy-project.pkg',{type:'application/octet-stream'}));
    failed.command='cmd.chat.attachment.add';failed.source_path='picker';failed.semantic_kind='file';
    failed.process_state='failed';failed.error='Unsupported package format — expanding it would run its own installer on the execution host, so extraction was refused before it started.';
    failed.filesafe={status:'blocked',note:'Blocked before scan: extraction would require running vendor-supplied installer code.'};
    failed.materialization=[{turn:'unsent',status:'blocked_by_policy',note:'Never materialized — extraction was refused.'}];
    const recs=admitted.ok?[admitted.record,failed]:[failed];
    seedTray(t.id,recs);
    r.hint='Two samples sit in the tray through the real intake path. Use Retry on the failed package, Remove on either chip, then Download on the ready file. Siblings and the composer text must survive both.';
  }else if(flow==='live'){
    const live=AT.makeProjectRefRecord('queries');
    live.command='cmd.chat.attachment.add';live.source_path='file_manager';live.semantic_kind='file';
    const frozen=AT.makeProjectRefRecord('migration');
    frozen.command='cmd.chat.add_file_reference';frozen.normalizes_to='cmd.chat.attachment.add';frozen.source_path='file_manager';frozen.semantic_kind='file';
    seedTray(t.id,[live,frozen]);
    r.hint='A live project reference and a frozen one, admitted through the file-only alias and the shared command. Open Details on each: exact captured hash, drift disclosure, per-turn captures after you send.';
  }else{
    const folder=AT.makeFolderRecord();
    folder.command='cmd.chat.attachment.add';folder.source_path='file_manager';folder.semantic_kind='folder';
    seedTray(t.id,[folder]);
    r.hint='One folder with a bounded manifest. Open Details for root identity, policies, exclusions and scope; record a materialization receipt; schedule the message and watch dispatch verify the frozen manifest hash.';
  }
  R.quota.waiting=false;sessions.set(t.id,r);E.ctx().renderApp();
}
function button(action,label,extra){return '<button class="soft-button" data-action="'+action+'" '+(extra||'')+'>'+label+'</button>';}
function outcome(r,out){r.last=out&&out.ok?(out.detail||out.note||'Done.'):(out&&(out.detail||out.error)||'Refused');E.ctx().renderApp();}
E.slot('composerBelow',ctx=>{
  const r=sessions.get(ctx.thread.id);if(!r)return '';
  let controls='';
  if(r.flow==='intake')controls=button('b19-open-picker','Open attach picker')+button('b19-retry-failed','Retry failed sample')+button('b19-download-first','Download first ready');
  else if(r.flow==='live')controls=button('b19-open-live-details','Open live Details')+button('b19-simulate-drift','Simulate working-tree change')+button('b19-download-stored','Download stored version');
  else controls=button('b19-open-folder-details','Open manifest Details')+button('b19-record-receipt','Record materialization receipt')+button('b19-freeze-folder','Freeze manifest for schedule');
  return '<section class="att-guide b19-guide" data-b19-flow="'+r.flow+'"><div class="b18-guide-title"><strong>Batch 19 · Attachments and bounded folders</strong><small>Explicit local fixtures · no background service</small></div><p>'+ctx.esc(r.hint||'')+'</p><div class="b18-controls">'+controls+'</div>'+(r.last?'<p class="b18-decision" role="status">'+ctx.esc(r.last)+'</p>':'')+'</section>';
});
function trayOf(ctx){return C.bufferFor(ctx.thread.id).attachments||[];}
E.action('b19-start',(ctx,b)=>{start(ctx,b.dataset.flow);return true;});
E.action('b19-open-picker',ctx=>{ctx.state.dialog={type:'att-source',threadId:ctx.thread.id};ctx.renderOverlays();return true;});
E.action('b19-retry-failed',ctx=>{const r=current(),a=trayOf(ctx).find(a=>a.process_state==='failed');if(!r||!a){if(r)outcome(r,{ok:false,error:'No failed sample in the tray.'});return true;}
  E._actions['att-retry'](ctx,{dataset:{thread:ctx.thread.id,att:a.id}});r.last='Retry re-runs the same record; siblings and composer text stay in place.';ctx.renderApp();return true;});
E.action('b19-download-first',ctx=>{const r=current(),a=trayOf(ctx).find(a=>a.process_state==='ready');if(!r||!a){if(r)outcome(r,{ok:false,error:'No ready sample in the tray.'});return true;}
  E._actions['att-download'](ctx,{dataset:{thread:ctx.thread.id,att:a.id}});return true;});
E.action('b19-open-live-details',ctx=>{const a=trayOf(ctx).find(a=>a.origin==='project_live_reference');if(!a)return true;
  ctx.state.dialog={type:'att-details',threadId:ctx.thread.id,messageId:null,attId:a.id,messageRole:null};ctx.renderOverlays();return true;});
E.action('b19-simulate-drift',ctx=>{const r=current(),a=trayOf(ctx).find(a=>a.origin==='project_live_reference');if(!r||!a)return true;
  a.live_drift=a.live_drift||{current_hash:'simulated-current-tree',current_label:'Simulated working tree',changed_at:new Date().toISOString(),note:'Simulated working-tree edit for this demo. The captured hash above is what the turn saw.'};
  r.last='Drift disclosed; captured hash unchanged.';ctx.renderApp();return true;});
E.action('b19-download-stored',ctx=>{const a=trayOf(ctx).find(a=>a.origin==='project_live_reference');if(!a)return true;
  E._actions['att-download'](ctx,{dataset:{thread:ctx.thread.id,att:a.id}});return true;});
E.action('b19-open-folder-details',ctx=>{const a=trayOf(ctx).find(x=>x.origin==='folder_manifest');if(!a)return true;
  ctx.state.dialog={type:'att-details',threadId:ctx.thread.id,messageId:null,attId:a.id,messageRole:null};ctx.renderOverlays();return true;});
E.action('b19-record-receipt',ctx=>{const r=current(),a=trayOf(ctx).find(x=>x.origin==='folder_manifest');if(!r||!a||!B19)return true;
  const shown=((a.folder_manifest||{}).shown||[]).map(f=>f.name||f.path);
  outcome(r,B19.materializeSelection(a,{turn:'demo',included:shown.slice(0,2),omitted:shown.slice(2)}));return true;});
E.action('b19-freeze-folder',ctx=>{const r=current(),a=trayOf(ctx).find(x=>x.origin==='folder_manifest');if(!r||!a)return true;
  outcome(r,AT.freezeFolderForSchedule(a));return true;});
const g=PM56_REPAIR_DEMOS,prior=g.gallery;
g.gallery=ctx=>'<section class="demo-section"><h3>Attachments &amp; bounded folders · Batch 19</h3><div class="demo-section-body">'+[['intake','Attach, retry and remove','Real intake, tracer, Retry and Remove that preserve siblings and text.'],['live','Live references and drift','Exact per-turn captures; changed-since disclosure without rewriting history.'],['folder','Folders stay bounded','Bounded manifests, separate receipts, frozen scheduled dispatch.']].map(([id,title,detail])=>'<button class="demo-trigger" data-action="b19-start" data-flow="'+id+'"><strong>'+title+'</strong><small>'+detail+'</small></button>').join('')+'</div></section>'+prior(ctx);
window.PM56_B19DEMO={start:flow=>start(E.ctx(),flow),snapshot:()=>{const r=current();return r?{...clone(r),tray:clone(trayOf(E.ctx()).map(a=>({id:a.id,name:a.name,origin:a.origin,command:a.command,source_path:a.source_path,process_state:a.process_state})))}:null;}};
})();
