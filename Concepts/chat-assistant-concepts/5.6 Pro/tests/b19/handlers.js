/* B19 verification: attachments and bounded folders. Injected test driver, never
 * loaded by the app. Uses the real owners; controlled injection is labeled. */
window.B19_CASES={};
(()=>{
'use strict';const tests=B19_CASES,E=PM56_EXT,S=PM56_SCHED,A=PM56_ARTIFACTS,AT=PM56_ATTACHMENTS,CS=PM56_COMPOSER_STATE,B19=window.PM56_B19;
const clone=x=>JSON.parse(JSON.stringify(x)),act=(name,data={})=>E.run(name,{dataset:data},new Event('click')),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<150;i++){if(fn())return;await sleep(100);}throw Error('Timed out awaiting actual work');}
function fresh(){const c=E.ctx(),t=clone(c.state.threads.find(t=>t.id==='query'));Object.assign(t,{id:'b19-test',title:'Attachment checks',projectId:'b19',worktreeId:'b19',archived:false,messages:[]});c.state.threads.push(t);c.switchThread(t.id);c.state.model=PM56_DATA.models.find(m=>m.status==='ready').id;c.state.composer=' Check these exact attachments. ';CS.bufferFor(t.id).text=c.state.composer;CS.bufferFor(t.id).attachments=[];CS.bufferFor(t.id).destination=null;PM56_RUNTIME.composer.destination=null;PM56_RUNTIME.quota.waiting=false;S.restore();return E.ctx();}
function draft(){const d=S.messageDraft();Object.assign(d,{date:'2027-05-10',time:'22:00',timezone:'America/New_York'});return d;}
const artifacts=()=>JSON.stringify(PM56_DATA.artifacts);
function file(bytes,name='binary.dat',relative){const f=new File([bytes],name,{type:'application/octet-stream'});if(relative)Object.defineProperty(f,'webkitRelativePath',{value:relative});return f;}
async function addFile(c,bytes,name){AT.admitFiles(c.thread.id,[file(bytes,name)]);await until(()=>CS.bufferFor(c.thread.id).attachments.every(a=>a.process_state==='ready'));return CS.bufferFor(c.thread.id).attachments.at(-1);}
function folder(c,files){const result=AT.admitFolder(c.thread.id,files);if(!result.ok)throw Error(result.error);return result.attachment;}
function dispatch(m){return S.dispatchMessageAt(m.scheduled_dispatch_id,Date.parse(m.scheduled_at_utc));}
function sendNow(c,text){c.state.composer=text||'Send with attachments.';CS.bufferFor(c.thread.id).text=c.state.composer;document.querySelector('[data-action="send"]').click();return c.thread.messages.at(-1);}
async function downloadBytes(c,rec){const seen={url:null},proto=HTMLElement.prototype,origClick=Object.getOwnPropertyDescriptor(proto,'click'),origRevoke=URL.revokeObjectURL;
  proto.click=function(){if(this.href&&this.href.startsWith('blob:'))seen.url=this.href;};URL.revokeObjectURL=()=>{};
  try{act('att-download',{thread:c.thread.id,message:'',att:rec.id});await until(()=>!!seen.url);
    return new Uint8Array(await (await fetch(seen.url)).arrayBuffer());
  }finally{Object.defineProperty(proto,'click',origClick);URL.revokeObjectURL=origRevoke;if(seen.url)origRevoke.call(URL,seen.url);}}

/* FOLDER-001..003: every live route converges on the one shared command. */
tests.command_convergence_all_routes=async ck=>{const c=fresh();
  const up=await addFile(c,'via-picker','picked.txt');
  AT.admitFiles(c.thread.id,[file('via-drop','dropped.txt')],'drag_drop');
  await until(()=>CS.bufferFor(c.thread.id).attachments.every(a=>a.process_state==='ready'));
  const drop=CS.bufferFor(c.thread.id).attachments.at(-1);
  const viaAlias=B19.addFileReference({make:()=>AT.makeProjectRefRecord('queries')});
  const viaFolder=AT.makeFolderRecord?B19.admitViaCommand({source:'file_manager',semantic_kind:'folder',make:()=>AT.makeFolderRecord()}):{ok:false};
  ck('Picker and drop carry the shared command identity',up.command==='cmd.chat.attachment.add'&&up.source_path==='picker'&&drop.command==='cmd.chat.attachment.add'&&drop.source_path==='drag_drop');
  ck('File alias normalizes a file to the shared command',viaAlias.ok&&viaAlias.record.normalizes_to==='cmd.chat.attachment.add');
  ck('Folder enters through the shared command, not a folder command',viaFolder.ok&&viaFolder.record.command==='cmd.chat.attachment.add'&&viaFolder.record.semantic_kind==='folder');
  const census=B19.commandCensus();
  ck('Census proves no folder-specific command, handler, event or store',census.ok&&census.commands.length===8&&!census.folder_specific_commands.length&&!census.folder_specific_stores.length);};
tests.alias_refuses_folder=ck=>{const before=artifacts(),out=B19.addFileReference({semantic_kind:'folder',make:()=>AT.makeFolderRecord()});
  ck('File-only alias refuses a folder with remediation',!out.ok&&out.error==='unsupported_semantic_kind'&&/cmd\.chat\.attachment\.add/.test(out.detail||'')&&artifacts()===before);};
tests.no_second_store=ck=>{ck('No folder store or second byte store exists',!window.PM56_FOLDER_STORE&&!(PM56_RUNTIME.folderAttachments&&PM56_RUNTIME.folderAttachments!==PM56_RUNTIME.attachments)&&!B19.commandCensus().folder_specific_stores.length);};

/* ATT-010 intake bounds refuse the whole selection before bytes are read. */
tests.intake_bounds_refuse_whole=ck=>{const c=fresh(),text=c.state.composer;
  const big=new File([new Uint8Array(17*1024*1024)],'huge.bin'),small=file('ok','ok.txt');
  AT.admitFiles(c.thread.id,[small,big]);
  ck('Oversize member refuses the whole selection',CS.bufferFor(c.thread.id).attachments.length===0&&c.state.composer===text);
  const many=[];for(let i=0;i<257;i++)many.push(file('x','f'+i+'.txt'));
  AT.admitFiles(c.thread.id,many);
  ck('257-file selection refused without partial intake',CS.bufferFor(c.thread.id).attachments.length===0&&c.state.composer===text);};

/* ATT-006 Retry/Remove preserve siblings and composer text. */
tests.retry_remove_preserve_siblings=async ck=>{const c=fresh(),text=c.state.composer;
  await addFile(c,'one','one.txt');await addFile(c,'two','two.txt');
  const buf=CS.bufferFor(c.thread.id),failed=AT.makeUploadedFromFile(file('x','broken.pkg'));
  failed.command='cmd.chat.attachment.add';failed.source_path='picker';failed.semantic_kind='file';
  failed.process_state='failed';failed.error='Unsupported package format — expanding it would run its own installer on the execution host, so extraction was refused before it started.';
  buf.attachments.push(failed);E.ctx().renderApp();
  const before=buf.attachments.map(a=>a.id).join(',');
  act('att-retry',{thread:c.thread.id,att:failed.id});
  await until(()=>CS.bufferFor(c.thread.id).attachments.every(a=>a.process_state==='ready'));
  ck('Retry preserves siblings and text',CS.bufferFor(c.thread.id).attachments.map(a=>a.id).join(',')===before&&c.state.composer===text&&CS.bufferFor(c.thread.id).text===text);
  act('att-remove',{thread:c.thread.id,att:CS.bufferFor(c.thread.id).attachments[1].id});
  const rest=CS.bufferFor(c.thread.id).attachments;
  ck('Remove drops only its record',rest.length===2&&rest[0].id===before.split(',')[0]&&rest[1].id===before.split(',')[2]&&c.state.composer===text);};

/* ATT-003/004 tracer during processing, preview for ready images. */
tests.tracer_and_preview=async ck=>{const c=fresh();
  AT.admitFiles(c.thread.id,[file('processing','slow.txt')]);
  const tracerVisible=()=>{const t=document.querySelector('.att-tray .att-tracer');return t&&getComputedStyle(t).opacity!=='0';};
  ck('Top-edge tracer renders while processing',tracerVisible());
  await until(()=>CS.bufferFor(c.thread.id).attachments.every(a=>a.process_state==='ready'));
  await until(()=>!tracerVisible()); /* 220ms CSS fade after the ready re-render */
  ck('Tracer clears at ready',!tracerVisible());
  const png=new File([new Uint8Array([137,80,78,71,13,10,26,10])],'dot.png',{type:'image/png'});
  AT.admitFiles(c.thread.id,[png]);
  await until(()=>CS.bufferFor(c.thread.id).attachments.every(a=>a.process_state==='ready'));
  const img=CS.bufferFor(c.thread.id).attachments.at(-1);
  document.querySelector('.att-tray .att-thumb[data-k="att-thumb:'+img.id+'"] .att-thumb-body').click();
  ck('Body click opens image preview',E.ctx().state.dialog&&E.ctx().state.dialog.type==='att-preview');
  act('close-dialog');};

/* ATT-007 per-turn captures; ATT-008 disclosure; ATT-009 exact downloads. */
tests.live_capture_per_turn=ck=>{const rec=AT.makeProjectRefRecord('queries');
  const one=B19.freezeReferenceForTurn(rec,'turn-1'),two=B19.freezeReferenceForTurn(rec,'turn-2'),replay=B19.freezeReferenceForTurn(rec,'turn-2');
  ck('Each turn keeps its exact hash',one.ok&&two.ok&&rec.captured_turns.length===2&&rec.captured_turns[0].captured_hash===rec.hash);
  ck('Same-turn replay appends nothing',replay.replayed&&rec.captured_turns.length===2);
  ck('Non-reference origins cannot capture',!B19.freezeReferenceForTurn(AT.makeFolderRecord(),'t').ok);};
tests.changed_since_disclosure_and_stored_download=async ck=>{const c=fresh();
  const rec=AT.makeProjectRefRecord('queries');rec.command='cmd.chat.attachment.add';rec.source_path='file_manager';rec.semantic_kind='file';
  (PM56_RUNTIME.attachments||{registerRecord(){}}).registerRecord&&PM56_RUNTIME.attachments.registerRecord(rec);
  CS.bufferFor(c.thread.id).attachments.push(rec);E.ctx().renderApp();
  rec.live_drift={current_hash:'edited-in-tree',current_label:'Working tree',changed_at:new Date().toISOString(),note:'Edited after capture.'};
  E.ctx().renderApp();
  const wantHash=rec.hash;
  ck('Drift badge discloses without rewriting history',!!document.querySelector('.att-tray .att-chip-stale')&&/^[0-9a-f]{12}$/.test(wantHash));
  const bytes=await downloadBytes(c,rec),text=new TextDecoder().decode(bytes);
  ck('Drifted reference still downloads the stored version',text.includes('Exact stored hash: '+wantHash)&&text.includes('not the current working-tree content')&&/edited-in-tree/.test(text));};
tests.exact_download_bytes=async ck=>{const c=fresh(),payload=new Uint8Array([0,1,13,10,255,128,60,115,99,114,105,112,116,62]);
  const rec=await addFile(c,payload,'original.bin');
  ck('Uploaded bytes round-trip exactly',JSON.stringify([...await downloadBytes(c,rec)])===JSON.stringify([...payload]));};

/* ATT-011 Details completeness; permission/currentness honesty. */
tests.details_completeness=ck=>{const c=fresh(),rec=AT.makeProjectRefRecord('queries');
  rec.command='cmd.chat.attachment.add';rec.source_path='file_manager';rec.semantic_kind='file';
  PM56_RUNTIME.attachments.registerRecord(rec);CS.bufferFor(c.thread.id).attachments.push(rec);
  act('att-details',{thread:c.thread.id,message:'',att:rec.id});
  const html=document.querySelector('.att-details-dialog').innerHTML;
  for(const needle of ['Producer','Version','Hash','Live-reference drift','Retention','Export / download history','Context materialization','Request deletion','Save to Project','Reveal in Project'])
    ck('Details shows '+needle,html.includes(needle));
  const disabled=[...document.querySelectorAll('.att-details-dialog .soft-button[disabled]')].map(b=>b.textContent);
  ck('Unsupported File Manager effects disabled with reasons',disabled.includes('Reveal in Project')&&disabled.includes('Save to Project'));
  act('close-dialog');};

/* ATT-010/FOLDER-004 bounded folder manifest. */
tests.folder_bounded_manifest=ck=>{const c=fresh();
  const rec=folder(c,[file('z\r\n','z.txt','Project/z.txt'),file('a\n','a.txt','Project/nested/a.txt')]);
  const m=rec.folder_manifest;
  ck('Exact root identity and bounded entries',m.root_identity==='Project'&&m.totalFiles===2&&m.shown.length===2&&!m.truncated);
  ck('Entries, hash, exclusion and scope policies stated',!!m.entries_policy&&!!m.hash_policy&&m.exclusions.length>0&&/read-only/.test(m.permissions));
  ck('Manifest is data, never a recursive dump',m.shown.every(e=>typeof e.name==='string'&&typeof e.size==='number'&&!e.bytes));
  ck('Command identity stamped',rec.command==='cmd.chat.attachment.add'&&rec.semantic_kind==='folder');};

/* FOLDER-006 folder drift; FOLDER-008 separate receipt identity. */
tests.folder_drift_preserves_history=ck=>{const c=fresh();
  const rec=folder(c,[file('v1','a.txt','Docs/a.txt')]);
  const frozenManifest=JSON.stringify(rec.folder_manifest);
  const out=B19.checkFolderDrift(rec,{manifest_hash:'changed-tree',label:'Current folder',note:'Edited after the message.'});
  ck('Changed folder disclosed with both identities',out.ok&&out.changed&&rec.folder_drift.captured_manifest_hash!=='changed-tree');
  ck('Captured manifest and history untouched',JSON.stringify(rec.folder_manifest)===frozenManifest);
  const same=B19.checkFolderDrift(rec,{manifest_hash:rec.folder_manifest.root_identity});
  ck('Unchanged folder clears disclosure',same.ok&&!same.changed&&rec.folder_drift===null);};
tests.materialization_receipt_separate_identity=ck=>{const c=fresh();
  const rec=folder(c,[file('a','a.txt','Docs/a.txt'),file('b','b.txt','Docs/b.txt')]);
  const before=JSON.stringify({m:rec.folder_manifest,h:rec.hash});
  const out=B19.materializeSelection(rec,{turn:'turn-9',included:['Docs/a.txt'],omitted:['Docs/b.txt']});
  ck('Receipt carries its own identity',out.ok&&/^mat-/.test(out.receipt.receipt_id)&&out.receipt.attachment_id===rec.id);
  ck('Included/omitted recorded; manifest and hash untouched',out.receipt.included.join()==='Docs/a.txt'&&out.receipt.omitted.join()==='Docs/b.txt'&&JSON.stringify({m:rec.folder_manifest,h:rec.hash})===before);};

/* FOLDER-005 + SMSG-007: scheduled refs freeze; dispatch never substitutes. */
tests.schedule_live_ref_freeze_exact=async ck=>{const c=fresh();
  const rec=AT.makeProjectRefRecord('queries');rec.command='cmd.chat.attachment.add';rec.source_path='file_manager';rec.semantic_kind='file';
  PM56_RUNTIME.attachments.registerRecord(rec);CS.bufferFor(c.thread.id).attachments.push(rec);
  const out=await S.saveMessageWithSnapshots(draft());
  ck('Live reference schedule commits a frozen capture',out.ok);
  const frozen=out.record.attachment_refs[0],rev=A.resolve(frozen.snapshot_ref,{document:true}).revision;
  ck('Capture freezes the exact hash without bytes',rev.record.renderer_kind==='reference_capture'&&rev.record.payload.captured_hash===rec.hash&&frozen.content_hash===rec.hash);
  const delivered=dispatch(out.record);
  ck('Dispatch delivers the frozen capture',delivered.ok);
  ck('Dispatched message carries the frozen identity',c.thread.messages.at(-1).attachments[0].content_hash===rec.hash);};
tests.schedule_folder_freeze_and_missing_hold=async ck=>{const c=fresh();
  folder(c,[file('keep','a.txt','Project/a.txt')]);
  const out=await S.saveMessageWithSnapshots(draft());
  ck('Folder schedule binds the frozen manifest hash',out.ok&&!!out.record.attachment_refs[0].folder_manifest_hash);
  const root=A.resolve(out.record.attachment_refs[0].snapshot_ref).revision.record;
  const child=PM56_DATA.artifacts.find(x=>x.id===root.payload.files[0].ref.artifact_id);
  child.revisionAvailability={1:'missing'};
  const result=dispatch(out.record);
  ck('Missing member holds the whole dispatch',result.held&&!c.thread.messages.some(m=>m.viaSchedule));
  ck('Hold names the retained ref, never a replacement',String(result.error).includes('retained_file'));};
tests.open_retained_snapshot_in_editor=async ck=>{const c=fresh();
  await addFile(c,'editor-bytes','open-me.txt');
  const out=await S.saveMessageWithSnapshots(draft());
  ck('Schedule commits',out.ok);
  const delivered=dispatch(out.record);
  ck('Dispatch delivers',delivered.ok);
  const msg=c.thread.messages.find(m=>m.id===delivered.message_id),att=msg.attachments[0];
  act('att-open',{thread:c.thread.id,message:msg.id,att:att.id});
  ck('Retained snapshot opens in the shared editor',!!document.querySelector('.editor-body')&&document.querySelector('.editor-body').innerHTML.includes('open-me.txt')) ;};
tests.schedule_blocked_ref_refuses=async ck=>{const c=fresh();
  const rec=AT.makeProjectRefRecord('queries');rec.command='cmd.chat.attachment.add';rec.source_path='file_manager';rec.semantic_kind='file';rec.filesafe={status:'blocked'};
  PM56_RUNTIME.attachments.registerRecord(rec);CS.bufferFor(c.thread.id).attachments.push(rec);
  const before=artifacts(),out=await S.saveMessageWithSnapshots(draft());
  ck('Blocked owner refuses the schedule with inputs intact',out.error==='attachment_owner_blocked'&&artifacts()===before&&!!c.state.composer);};

/* ATT-012 per-dispatch rows; ATT-013 reference-safe retention. */
tests.dispatch_rows_per_turn_and_history_truth=async ck=>{const c=fresh();
  const rec=await addFile(c,'one','one.txt');
  sendNow(c,'First turn with the file.');
  const first=c.thread.messages.filter(m=>m.role==='user').at(-1).attachments[0];
  ck('First dispatch records its own row',first.materialization.some(r=>r.status==='materialized'));
  sendNow(c,'Second turn, same thread.');
  ck('History rows accumulate per dispatch',first.materialization.length>=1&&first.materialization.every(r=>r.turn&&r.status));};
tests.deletion_refused_when_referenced=async ck=>{const c=fresh();
  const rec=await addFile(c,'shared','shared.txt');
  const out=await S.saveMessageWithSnapshots(draft());
  ck('Schedule commits',out.ok);
  const frozen=out.record.attachment_refs[0];
  const refused=B19.requestDeletion(frozen,{kind:'message',id:'x'});
  ck('Purge refused while a schedule references the revision',!refused.ok&&/still references/.test(refused.detail||''));
  const local=B19.requestDeletion({id:'tray-only'},null);
  ck('Unretained tray record holds nothing to purge',local.ok&&local.local_only);};

/* F-084 save_to_project is an explicit delegation, never a silent write. */
tests.save_to_project_explicit=ck=>{const rec=AT.makeProjectRefRecord('queries');
  const noPath=B19.saveToProject(rec,{});
  ck('Missing path is its own refusal',!noPath.ok&&noPath.error==='save_path_required'&&noPath.request.delegates_to==='FileSafe project write guard');
  const unwired=B19.saveToProject(rec,{path:'project:/Inbox/q.txt',threadId:'t',messageId:'m'});
  ck('Unwired FileSafe returns the exact unsent request',!unwired.ok&&unwired.error==='filesafe_not_wired'&&unwired.request.target_path==='project:/Inbox/q.txt'&&unwired.request.lineage.message_id==='m');};

/* Thread isolation; hover chrome clickable between adjacent messages. */
tests.thread_switch_preserves_trays=async ck=>{const c=fresh();
  await addFile(c,'a-tray','a.txt');
  const other=clone(c.state.threads.find(t=>t.id==='query'));Object.assign(other,{id:'b19-other',title:'Other',projectId:'b19o',worktreeId:'b19o',archived:false,messages:[]});
  c.state.threads.push(other);c.switchThread('b19-other');
  ck('Other thread starts with an empty tray',CS.bufferFor('b19-other').attachments.length===0);
  c.switchThread('b19-test');
  ck('Original tray survives the round trip',CS.bufferFor('b19-test').attachments.length===1);};
tests.hover_chrome_clickable_adjacent=async ck=>{const c=fresh();
  const one=await addFile(c,'m1','m1.txt');sendNow(c,'First message.');
  const two=await addFile(c,'m2','m2.txt');sendNow(c,'Second message.');
  const thumbs=[...document.querySelectorAll('.message .att-msg-thumb')];
  ck('Two adjacent message thumbs rendered',thumbs.length>=2);
  /* Focus the thumb body (the keyboard/hover anchor); a visibility:hidden
     chrome button itself can never take focus, by platform design. */
  thumbs[1].querySelector('.att-msg-thumb-body').focus();
  await sleep(400);
  const btn=thumbs[1].querySelector('.att-thumb-chrome .att-chrome-btn');
  ck('Chrome reveals on thumb focus',getComputedStyle(btn.closest('.att-thumb-chrome')).visibility==='visible');
  const r=btn.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  ck('Hovered chrome button is the hit target, not its neighbor',hit&&(hit===btn||btn.contains(hit)));};

/* ATT-001/002/004/005/011 layout, origin vocabulary and hover-chrome truth. */
tests.layout_origins_and_chrome_truth=async ck=>{const c=fresh();
  const rec=await addFile(c,'chrome-probe','probe.txt');
  const tray=document.querySelector('.att-tray'),field=document.querySelector('.composer-field'),attach=document.querySelector('.composer-infield-l [data-action="attach"]'),send=document.querySelector('[data-action="send"]');
  ck('Tray renders above the text entry',(tray.compareDocumentPosition(field)&Node.DOCUMENT_POSITION_FOLLOWING)!==0);
  ck('Attach control lives bottom-left inside the text entry',!!attach&&field.contains(attach)&&(attach.compareDocumentPosition(send)&Node.DOCUMENT_POSITION_FOLLOWING)!==0);
  const origins=Object.keys(AT.ORIGINS||{});
  for(const o of ['uploaded_snapshot','project_live_reference','project_frozen_snapshot','generated_artifact','external_live_reference','clipboard','browser_capture','source_control_object','folder_manifest'])ck('Origin distinguished: '+o,origins.includes(o));
  const thumb=document.querySelector('.att-tray .att-thumb[data-k="att-thumb:'+rec.id+'"]'),x=thumb.querySelector('.att-thumb-x'),xcs=getComputedStyle(x);
  ck('Remove X sits top-right of the thumbnail',xcs.top==='4px'&&xcs.right==='4px');
  const chrome=thumb.querySelector('.att-thumb-chrome'),ccs=getComputedStyle(chrome);
  ck('Chrome hides until hover or focus',ccs.visibility==='hidden'&&ccs.opacity==='0');
  ck('Chrome carries name, source, size and state',chrome.innerHTML.includes('probe.txt')&&chrome.innerHTML.includes('Uploaded')&&chrome.innerHTML.includes('12 B')&&chrome.querySelector('.att-chrome-state')!==null);
  ck('Chrome offers Open, Download and Details',chrome.querySelector('[data-action="att-open"]')!==null&&chrome.querySelector('[data-action="att-download"]')!==null&&chrome.querySelector('[data-action="att-details"]')!==null);
  act('att-details',{thread:c.thread.id,message:'',att:rec.id});
  const text=document.querySelector('.att-details-dialog').textContent;
  for(const needle of ['Related message','Trust & freshness','FileSafe & redaction','application/octet-stream'])ck('Details shows '+needle,text.includes(needle));
  act('close-dialog');};
})();
