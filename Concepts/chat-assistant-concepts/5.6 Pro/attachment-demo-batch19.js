/* attachment-demo-batch19.js — Batch 19 gallery preparations. Local fixtures and
 * ordinary routes only; all attachment/artifact/composer/schedule mutations go
 * through their existing owners (admitViaCommand, att-* actions, schedulers). */
(function(){
'use strict';
const E=PM56_EXT,AT=PM56_ATTACHMENTS,B19=window.PM56_B19,C=PM56_COMPOSER_STATE,R=PM56_RUNTIME;
const sessions=new Map();let sequence=0;
const clone=x=>JSON.parse(JSON.stringify(x));
const RP=window.PM56_RECPLAY,players=new Map();
function stopPlayback(tid){players.get(tid)?.stop();players.delete(tid);}
function playback(ctx){const r=current();if(!r)return;stopPlayback(r.threadId);r.guide=true;r.say=null;r.play={step:0,done:false};
 const c=()=>E.ctx(),tray=()=>C.bufferFor(r.threadId).attachments||[],msgs=()=>c().thread.messages.filter(m=>m.role==='user'),press=(sel,o)=>()=>RP.press(sel,o);
 const chip=a=>'.att-tray .att-thumb[data-k="att-thumb:'+CSS.escape(a?.id||'missing')+'"]';
 const chrome=a=>chip(a)+' .att-thumb-chrome',ctl=(a,action)=>chip(a)+' [data-action="'+action+'"]';
 const live=()=>tray().find(a=>a.origin==='project_live_reference'),folder=()=>tray().find(a=>a.origin==='folder_manifest');
 r.sampleIds=tray().map(a=>a.id);r.failedId=tray().find(a=>a.process_state==='failed')?.id;
 const request=r.flow==='intake'?'Keep this composer text through retry and removal.':r.flow==='live'?'Pin this exact live reference.':'Try to schedule bytes that were never selected.';
 // Keyboard focus is the product's own hover anchor. The polished sent
 // chrome uses display:none at rest, so visibility alone cannot reveal it.
 const sentDetails=()=>{const m=msgs().at(-1),msg='.message[data-message-id="'+CSS.escape(m.id)+'"]',sel=msg+' .att-msg-thumb',body=sel+' .att-msg-thumb-body';return RP.hover(body).then(ok=>{if(!ok)return false;RP.find(body).focus({preventScroll:true});return RP.wait(400).then(()=>RP.press(sel+' [data-action="att-details"]',{reveal:sel+' .att-thumb-chrome'}));});};
 const details=(get,say)=>({say,wait:4500,skip:()=>c().state.dialog?.type==='att-details',run:()=>{const a=get();return RP.press(ctl(a,'att-details'),{reveal:chrome(a)});}});
 const close={say:'Read the captured identity and its disclosures. Next: return to the message.',wait:5000,dialog:'att-details',skip:()=>!c().state.dialog,run:press('.att-details-dialog [data-action="close-dialog"]')};
 const list=[{say:'The samples use the ordinary attachment tray. Next: type the message while the files are checked.',wait:900,skip:()=>c().state.composer===request,run:()=>RP.type(request)}];
 if(r.flow==='intake'){
  const failed=()=>tray().find(a=>a.id===r.failedId);
  list.push({say:'One package failed, and its sibling is retained. Next: use Retry on the failed chip.',wait:4500,skip:()=>!failed()||failed().process_state!=='failed',run:()=>RP.press(ctl(failed(),'att-retry'),{reveal:chrome(failed())})},
   {say:'Retry checks the same record again and preserves the message. Next: wait for processing.',until:()=>tray().every(a=>a.process_state==='ready')},
   {say:'Both records are ready, and the message survived. Next: remove only the retried package.',wait:4500,skip:()=>!failed(),run:()=>RP.press(ctl(failed(),'att-remove'),{reveal:chip(failed())+' .att-thumb-x'})},
   {say:'The sibling and message remain. Download saves the ready file’s exact bytes; this recording leaves it for you. Next: send.',wait:5000,run:()=>{const a=tray()[0];return RP.hover(ctl(a,'att-download'),{reveal:chrome(a)});}},
   {say:'Only the ready notes file accompanies this message. Next: press Send.',wait:5000,skip:()=>msgs().length>0,run:press('.composer [data-action="send"]')},
   {say:'The sent file has its own materialization record. Next: add a second sample from the attachment picker.',wait:5000,skip:()=>c().state.dialog?.type==='att-source',run:press('.composer [data-action="attach"]')},
   {say:'The picker uses the same intake owner. Next: choose the prepared project README.',wait:4500,dialog:'att-source',skip:()=>tray().some(a=>!r.sampleIds.includes(a.id)),run:press('[data-action="att-pick-project"][data-key="readme"]')},
   {say:'The new sample belongs to a separate message. Next: type that message.',wait:4500,skip:()=>c().state.composer==='Second adjacent message.',run:()=>RP.type('Second adjacent message.')},
   {say:'The new attachment is checked through the same path. Next: send the second message.',wait:1200,skip:()=>msgs().length>=2,run:()=>tray().every(a=>a.process_state==='ready')?RP.press('.composer [data-action="send"]'):false},
   {say:'Each adjacent message keeps its own attachment. Next: open Details on the second one.',wait:5000,run:sentDetails},close);
 }else if(r.flow==='live'){
  list.push(details(live,'A live reference captures an exact hash. Next: inspect its Details.'),close,
   details(()=>tray().find(a=>a.origin==='project_frozen_snapshot'),'The frozen sibling retains its own identity. Next: inspect its Details.'),{...close},
   {say:'The captured version stays in history. Next: an example working-tree edit changes the live file.',wait:4500,skip:()=>!!live()?.live_drift,run:()=>{E._actions['b19-simulate-drift'](c(),{dataset:{}});return true;}},
   {say:'Changed since capture is disclosed on the chip. Download saves the stored version, with drift disclosed. Next: send this capture.',wait:5000,run:()=>RP.hover(ctl(live(),'att-download'),{reveal:chrome(live())})},
   {say:'The message pins what this turn saw. Next: press Send to record its per-turn capture.',wait:5000,skip:()=>msgs().length>0,run:press('.composer [data-action="send"]')},
   {say:'The sent reference records the captured hash for this turn. Next: inspect the sent chip.',wait:5000,run:sentDetails}, {...close});
 }else{
  list.push(details(folder,'The folder is a bounded manifest. Next: read its root, exclusions and read scope.'),close,
   {say:'The manifest is separate from what a turn materializes. Next: record an example materialization receipt.',wait:4500,skip:()=>!!folder()?.receipts?.length,run:()=>{E._actions['b19-record-receipt'](c(),{dataset:{}});return true;}},
   {say:'The receipt records included and omitted entries. Next: open Schedule Message from the wand.',wand:true},
   {say:'Schedule Message freezes selected inputs. Next: choose its date.',wait:4500,dialog:'sched-message',skip:()=>document.querySelector('[data-sched-input="msg-date"]')?.value==='2027-05-10',run:()=>RP.choose('[data-sched-input="msg-date"]','2027-05-10')},
   {say:'The date is set. Next: choose 22:00 for this example.',wait:1200,dialog:'sched-message',skip:()=>document.querySelector('[data-sched-input="msg-time"]')?.value==='22:00',run:()=>RP.choose('[data-sched-input="msg-time"]','22:00')},
   {say:'The time zone is part of the schedule. Next: open the zone picker.',wait:1200,dialog:'sched-message',skip:()=>!!RP.find('.overlay-menu [data-action="shared-choice-pick"]'),run:press('[data-action="sched-pick-msg-tz"]')},
   {say:'Choose the example’s time zone. Next: select New York.',wait:1200,dialog:'sched-message',menu:true,skip:()=>document.querySelector('[data-sched-input="msg-tz"]')?.value==='America/New_York'&&!c().state.menu,run:press('.overlay-menu [data-action="shared-choice-pick"][data-value="America/New_York"]')},
   {say:'The folder fixture has a manifest, without selected bytes. Next: Schedule checks whether it can freeze them.',wait:4500,dialog:'sched-message',skip:()=>!!document.querySelector('.sched-form-error')?.textContent.includes('needs selected bytes'),run:press('[data-action="sched-create-message"]')},
   {say:'Scheduling refuses the missing selected bytes and preserves the message. Next: return to the tray.',wait:5500,dialog:'sched-message',skip:()=>!c().state.dialog,run:press('[data-action="sched-close-dialog"]')});
 }
 list.push({say:r.flow==='folder'?'The refusal preserves the bounded manifest, receipt and message. Choose a real folder to schedule its bytes. Next: finish.':'The captured identities and per-turn records stay intact. Next: finish.',wait:4500,run:()=>true});
 function follow(){while(r.play.step<list.length){const b=list[r.play.step];if(b.until?b.until():b.skip&&b.skip())r.play.step++;else break;}if(r.play.step===list.length)r.play.done=true;}
 r.play.say=()=>{follow();return r.play.done?({intake:'Done · Retry and Remove preserved the sibling and message. Both sent messages keep their own attachment records.',live:'Done · The working-tree edit did not rewrite the captured hash. The sent turn keeps its exact reference and drift disclosure.',folder:'Done · Scheduling refused a manifest without selected bytes. The folder, materialization receipt and unsent message are preserved.'}[r.flow]):list[r.play.step].say;};
 const pl=RP.play({key:'b19',live:()=>sessions.get(r.threadId)===r&&r.guide,threads:()=>[r.threadId],next:()=>{follow();const i=r.play.step,b=list[i];if(!b||b.until)return null;
  const beat=b.wand?RP.viaWand('b19:'+i,'schedule','[data-action="sched-open-message"]',{wait:4500}):{id:'b19:'+i,wait:b.wait,dialog:b.dialog,menu:b.menu,run:b.run};if(!beat)return null;
  const run=beat.run;return {...beat,run:()=>Promise.resolve(run()).then(ok=>{if(ok!==false&&r.play.step===i&&(!b.wand||beat.id.endsWith(':row')))r.play.step++;return ok;})};},render:()=>c().renderApp(),superseded:()=>{r.guide=false;}});players.set(r.threadId,pl);
}
function button(action,label,extra){return '<button class="soft-button" data-action="'+action+'" '+(extra||'')+'>'+label+'</button>';}
function guide(ctx,doc=false){const r=sessions.get(ctx.thread.id);if(!r||r.guide===false||ctx.state.dialog||doc!==(innerWidth<=1100&&ctx.state.editorRevealed))return '';const pl=players.get(r.threadId),failed=!!pl?.errors.length,text=failed?'The recording stopped because a control was unavailable. Replay starts it again.':r.play?r.play.say():r.hint;
 /* a harness that drives the journey by hand (PM56_RECPLAY_HOLD: tests/b19) keeps the lab's own controls */
 const lab=window.PM56_RECPLAY_HOLD?'<div class="b18-controls">'+(r.flow==='intake'?button('b19-open-picker','Open attach picker')+button('b19-retry-failed','Retry failed sample')+button('b19-download-first','Download first ready'):r.flow==='live'?button('b19-open-live-details','Open live Details')+button('b19-simulate-drift','Simulate working-tree change')+button('b19-download-stored','Download stored version'):button('b19-open-folder-details','Open manifest Details')+button('b19-record-receipt','Record materialization receipt')+button('b19-freeze-folder','Freeze manifest for schedule'))+'</div>'+(r.last?'<p class="b18-decision" role="status">'+ctx.esc(r.last)+'</p>':''):'';
 return PM56_SHELL.pmxGuide({key:'b19-guide',cls:'att-guide b19-guide',placement:doc?'doc':'dock',step:ctx.esc(RP.steady(r,text,/^Done/.test(text),()=>E.ctx().renderApp())),extra:lab,actions:r.play?.done||failed?[{action:'b19-replay',label:'Replay'}]:[],next:pl&&pl.progress(),close:{action:'b19-close',label:'Close guide'}});}
E._slots.editorDocument.unshift(ctx=>{const g=guide(ctx,true);if(!g)return '';
 // Plans use app.js's fallback instead of an editorDocument registrant.
 // Include that renderer so a guide alone cannot claim the whole document.
 if(ctx.editorId?.startsWith('plan:'))return g+PM56_PLANS.editorBody(ctx.editorId);
 return ctx.editorId?.startsWith('b19-work:')||window.PM56_ARTIFACTS?.fromRoute(ctx.editorId)?g:'';
});
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
function outcome(r,out){r.last=out&&out.ok?(out.detail||out.note||'Done.'):(out&&(out.detail||out.error)||'Refused');E.ctx().renderApp();}
E.slot('composerBelow',ctx=>guide(ctx));
function trayOf(ctx){return C.bufferFor(ctx.thread.id).attachments||[];}
E.action('b19-start',(ctx,b)=>{start(ctx,b.dataset.flow);playback(E.ctx());E.ctx().renderApp();return true;});
E.action('b19-replay',ctx=>{const r=current();if(r){stopPlayback(r.threadId);r.guide=false;start(ctx,r.flow);playback(E.ctx());E.ctx().renderApp();}return true;});
E.action('b19-close',ctx=>{const r=current();if(r){stopPlayback(r.threadId);r.guide=false;}ctx.renderApp();return true;});
E.chainAction('reset-all',()=>{for(const tid of players.keys())stopPlayback(tid);for(const r of sessions.values())r.guide=false;return false;});
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
