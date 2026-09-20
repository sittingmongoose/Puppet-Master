/* B20 verification: browser capture and currentness. Injected test driver, never
 * loaded by the app. Uses the real owners and real actions; live-DOM and
 * fixture mutations that stand in for page change are labeled INJECTION. */
window.B20_CASES={};
(()=>{
'use strict';const tests=B20_CASES,E=PM56_EXT,S=PM56_SCHED,A=PM56_ARTIFACTS,CS=PM56_COMPOSER_STATE,BC=window.PM56_BROWSER,COL=window.PM56_COLLAB;
const clone=x=>JSON.parse(JSON.stringify(x)),act=(name,data={})=>E.run(name,{dataset:data},new Event('click')),sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn){for(let i=0;i<150;i++){if(fn())return;await sleep(100);}throw Error('Timed out awaiting actual work');}
function fresh(){const c0=E.ctx(),t=clone(c0.state.threads.find(t=>t.id==='query'));Object.assign(t,{id:'b20-test',title:'Browser checks',projectId:'b20',worktreeId:'b20',archived:false,messages:[]});c0.state.threads.push(t);c0.switchThread(t.id);const c=E.ctx();c.state.model=PM56_DATA.models.find(m=>m.status==='ready').id;c.state.composer='';c.state.toast=[];c.state.dialog=null;const buf=CS.bufferFor(t.id);buf.text='';buf.attachments=[];buf.browser_context_refs=[];buf.destination=null;PM56_RUNTIME.composer.destination=null;PM56_RUNTIME.quota.waiting=false;S.restore();BC.restore();c.renderApp();return E.ctx();}
function users(c){return c.thread.messages.filter(m=>m.role==='user');}
function toasts(c){return (c.state.toast||[]).map(t=>t.title+' :: '+(t.detail||''));}
function openBrowser(){act('bc-open');const c=E.ctx();if(!c.state.dialog||c.state.dialog.type!=='bc-browser')throw Error('browser dialog did not open');return c;}
function armComponent(){if(BC.state().mode!=='component')act('bc-arm-component');}
function pick(c,id){act('bc-pick-el',{id});const p=BC.state().picked;if(!p||BC.state().pickedElId!==id)throw Error('pick failed for '+id);return p;}
function setPromptInstruction(text){const el=document.querySelector('[data-bc-input="prompt"]');if(!el)throw Error('prompt input missing');el.value=text;el.dispatchEvent(new Event('input',{bubbles:true}));}
function setMode(v){act('bc-set-component-mode',{value:v});}
function ordinarySend(c,text){c.state.composer=(c.state.composer?c.state.composer+'\n':'')+text;CS.bufferFor(c.thread.id).text=c.state.composer;c.renderApp();document.querySelector('[data-action="send"]').click();return E.ctx();}
function liveEl(id){return document.querySelector('[data-bc-id="'+id+'"]');}
/* INJECTION helpers: stand-ins for real page change against the live demo DOM.
 * Each is labeled at its call site; revalidation always reads the live DOM. */
function injReplace(id,component,html){const el=liveEl(id);el.setAttribute('data-bc-component',component);el.innerHTML=html;}
function injDriftSource(id,line){liveEl(id).setAttribute('data-bc-line',String(line));}
function injRemove(id){liveEl(id).remove();}
function injDuplicate(id){const el=liveEl(id),copy=el.cloneNode(true);el.parentElement.appendChild(copy);}
function injDestroySurface(){const s=document.querySelector('[data-bc-surface]');if(s)s.remove();}
function restoreSurface(){E.ctx().renderApp();}

/* identity_and_mapping: fingerprint mismatch refuses; no nearest-match. */
tests.fingerprint_mismatch_refuses=async ck=>{const c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-retry');
  ck('Capture carries a bounded fingerprint with a stated policy',!!rec.fingerprint&&!!rec.fingerprintPolicy);
  injReplace('el-retry','<RetryButton>','<span class="bc-el-text">Retry with new semantics</span>'); /* INJECTION: same tag/role/file, new identity */
  const rv=BC.revalidate(rec);
  ck('Same-tag/role/component/file with changed fingerprint is stale',rv.result==='stale_capture');
  ck('No nearest-match fallback; recapture route named',rv.recapture_action==='cmd.browser.component.pick'&&/fingerprint|identity/i.test(rv.reason+' '+(rv.detail||'')));
  restoreSurface();};
tests.same_file_source_drift_disclosed=async ck=>{const c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-retry'),origLine=rec.source.line;
  injDriftSource('el-retry',origLine+40); /* INJECTION: same file, invalidated line mapping */
  const rv=BC.revalidate(rec);
  ck('Same-file line drift refuses as source_mapping_changed',rv.result==='stale_capture'&&rv.reason==='source_mapping_changed');
  ck('Current source identity disclosed, stale line never presented exact',!!rv.current_source&&rv.current_source.line===origLine+40&&rv.current_source.file===rec.source.file);
  restoreSurface();};
tests.compatible_refresh_keeps_evidence=async ck=>{const c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-row-1'),before=clone(rec);
  act('bc-simulate-rerender');await until(()=>BC.state().lastRerenderNote);
  const rv=BC.revalidate(rec);
  ck('Compatible re-render refreshes and proceeds',rv.result==='refreshed');
  ck('Retained capture evidence is immutable',rec.session.generationAtCapture===before.session.generationAtCapture&&rec.boundedHtml===before.boundedHtml);
  ck('Refreshed dispatch context is separately recorded and current',!!rv.dispatched_context&&rv.dispatched_context.generation===BC.state().sessions.find(s=>s.id==='sess-ordinary').generation&&rv.dispatched_context.rect&&rv.dispatched_context.dom);
  restoreSurface();};
tests.mode_toggle_never_reads_as_page_change=async ck=>{let c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-row-1');
  act('bc-close');c=E.ctx();openBrowser();c=E.ctx(); /* reopen with pick mode off */
  const rv=BC.revalidate(rec);
  ck('Dialog close/reopen with mode off keeps the live capture current',rv.result==='current');
  restoreSurface();};
tests.recency_never_declares_fresh=async ck=>{const c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-retry');
  injReplace('el-retry','<RetryButton>','changed seconds after capture'); /* INJECTION: replaced node */
  const rv=BC.revalidate(rec);
  ck('Seconds-old but replaced node fails revalidation',rv.result==='stale_capture');
  restoreSurface();};
tests.zero_matches_refuse=async ck=>{const c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-row-2');
  injRemove('el-row-2'); /* INJECTION: target gone */
  const rv=BC.revalidate(rec);
  ck('Zero matches refuse as stale_capture',rv.result==='stale_capture'&&rv.reason==='zero_matches');};
tests.multiple_matches_refuse=async ck=>{const c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-filter-tenant');
  injDuplicate('el-filter-tenant'); /* INJECTION: ambiguous locator */
  const rv=BC.revalidate(rec);
  ck('Multiple matches refuse as stale_capture',rv.result==='stale_capture'&&rv.reason==='multiple_matches');};
tests.destroyed_frame_refuses=async ck=>{const c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-footnote');
  injDestroySurface(); /* INJECTION: destroyed frame with dialog open */
  const rv=BC.revalidate(rec);
  ck('Destroyed frame refuses as stale_capture',rv.result==='stale_capture'&&/destroyed/.test(rv.reason));};
tests.unknown_session_never_falls_back=async ck=>{let c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-retry');
  rec.session.id='sess-destroyed'; /* INJECTION: rec references a destroyed session */
  const rv=BC.revalidate(rec);
  ck('Destroyed recorded session refuses as session_gone',rv.result==='stale_capture'&&rv.reason==='session_gone');
  BC.state().picked=null;BC.state().viewingContextId=rec.id;BC.state().railTab='details';c.renderApp();c=E.ctx();
  const card=document.querySelector('[data-k="bc-context-card-'+rec.id+'"]');
  ck('Details shows the session as gone, not session-one generation',!!card&&/gone|unavailable|missing/i.test(card.textContent));
  restoreSurface();};

/* admission_paths: every ordinary route revalidates before admission. */
function addListRef(c,instruction){setMode('list');setPromptInstruction(instruction);act('bc-prompt-run');return CS.bufferFor(c.thread.id).browser_context_refs;}
tests.stale_list_blocks_ordinary_send=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-retry');addListRef(c,'Explain this retry');
  injReplace('el-retry','<RetryButton>','mutated after list add'); /* INJECTION */
  const n0=users(c).length,text='Send with one stale list item.';
  c=ordinarySend(c,text);
  ck('Stale list item holds the ordinary send with zero admissions',users(c).length===n0);
  ck('Composer text, cursor draft and destination survive the hold',c.state.composer.indexOf(text)>=0&&CS.bufferFor(c.thread.id).text===c.state.composer);
  const refs=CS.bufferFor(c.thread.id).browser_context_refs;
  ck('Stale item stays visible and individually marked',refs.length===1&&!!refs[0].stale&&/STALE/.test(c.state.composer));
  ck('Hold names the reason durably, not toast-only',c.thread.messages.some(m=>m.type==='bc-admission-hold'));
  restoreSurface();};
tests.stale_chip_blocks_keyboard_send=async ck=>{let c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-retry');setMode('insert');act('bc-prompt-run');
  const token='['+(rec.component||'<'+rec.tag+'>')+(rec.name?' "'+rec.name+'"':'')+']';
  ck('Inserted chip token present, nothing sent',users(c).length===0&&c.state.composer.indexOf(token)>=0);
  injReplace('el-retry','<RetryButton>','mutated after insert'); /* INJECTION */
  const n0=users(c).length;c.state.composer+=' Via keyboard.';CS.bufferFor(c.thread.id).text=c.state.composer;c.renderApp();
  const ta=document.querySelector('textarea[data-input="composer"]');ta.focus();
  ta.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',ctrlKey:true,bubbles:true,cancelable:true}));
  c=E.ctx();
  ck('Keyboard send takes the same pre-admission veto',users(c).length===n0&&c.state.composer.indexOf(token)>=0);
  restoreSurface();};
tests.mixed_list_never_partially_sends=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-row-1');addListRef(c,'First stays valid');
  armComponent();pick(c,'el-retry');addListRef(c,'Second goes stale');
  injReplace('el-retry','<RetryButton>','mutated second'); /* INJECTION */
  const n0=users(c).length;c=ordinarySend(c,'Send two, one stale.');
  const refs=CS.bufferFor(c.thread.id).browser_context_refs;
  ck('Mixed list sends nothing without an explicit action',users(c).length===n0&&refs.length===2);
  ck('Valid sibling retained intact, stale sibling marked',!refs[0].stale&&!!refs[1].stale);
  act('bc-list-remove',{id:refs[1].id}); /* explicit removal, then the rest may go */
  c=ordinarySend(E.ctx(),'Send the valid remainder.');
  ck('Explicit removal unblocks the valid remainder',users(c).length===n0+1&&CS.bufferFor(c.thread.id).browser_context_refs.length===0);
  restoreSurface();};
tests.deleted_chip_token_drops_hidden_ref=async ck=>{let c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-retry');setMode('insert');act('bc-prompt-run');
  const before=CS.bufferFor(c.thread.id).browser_context_refs.length;
  const token='['+(rec.component||'<'+rec.tag+'>')+(rec.name?' "'+rec.name+'"':'')+']';
  c.state.composer=c.state.composer.replace(token,'');CS.bufferFor(c.thread.id).text=c.state.composer;
  c=ordinarySend(c,'Plain text after deleting the chip.');
  ck('Deleting the visible token drops its hidden ref before send',before===1&&CS.bufferFor(c.thread.id).browser_context_refs.length===0);
  ck('No stale hidden context rides the plain send',!users(c).at(-1).browserContextRefs);
  c=E.ctx();const n1=users(c).length;c.state.composer+=' more typing';
  ck('Ordinary typing never duplicates or misbinds refs',CS.bufferFor(c.thread.id).browser_context_refs.length===0&&users(c).length===n1);
  restoreSurface();};
tests.deferred_queue_send_revalidates=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-row-1');addListRef(c,'Queued behind work');
  injReplace('el-row-1','<QueryRow>','mutated while queued'); /* INJECTION */
  c.state.work={step:1,running:true,expanded:false,started:true,completed:false,elapsed:1,openPhase:null};c.renderApp();
  c.state.composer+='\nDeferred browser send.';CS.bufferFor(c.thread.id).text=c.state.composer;
  document.querySelector('[data-action="send"]').click();c=E.ctx(); /* enqueues behind running work */
  const q=c.state.sendQueue[c.thread.id]||[];
  ck('Send enqueues behind running work without admitting',q.length===1&&users(c).length===0);
  c.state.work.running=false;
  document.querySelector('[data-action="queue-send-now"]').click();c=E.ctx();
  ck('Deferred Send now revalidates and holds the stale ref',users(c).length===0&&(c.state.sendQueue[c.thread.id]||[]).length===0);
  ck('Held deferred text is preserved for recapture, not lost',/Deferred browser send/.test(c.state.composer));
  restoreSurface();};
tests.targeted_send_revalidates_before_routing=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-row-3');addListRef(c,'Targeted stale item');
  const run=COL.runs().find(r=>r.status==='running'&&!window.PM56_ROOM?.owns(r.id));
  if(!run)throw Error('no running non-room collaboration run in fixture');
  const dest={kind:'workflow',destinationKind:run.kind,refId:run.id,label:'T',detail:'d',glyph:'users'};
  PM56_RUNTIME.composer.destination=dest;CS.bufferFor(c.thread.id).destination=clone(dest);
  const runMsgs0=run.messages.length;
  injReplace('el-row-3','<QueryRow>','mutated targeted'); /* INJECTION */
  const n0=users(c).length;c=ordinarySend(c,'Targeted send with stale ref.');
  ck('Targeted stale send admits nothing anywhere',users(c).length===n0&&run.messages.length===runMsgs0);
  ck('Targeted hold preserves destination and draft',!!CS.bufferFor(c.thread.id).destination&&/Targeted send/.test(c.state.composer));
  restoreSurface();};

/* selection_races: epoch and revision fence late results. */
tests.selection_epoch_wired_to_transitions=async ck=>{const c=fresh();openBrowser();
  const e0=BC.selectionEpoch();armComponent();pick(c,'el-retry');
  const e1=BC.selectionEpoch();
  act('bc-prompt-cancel');const e2=BC.selectionEpoch();
  armComponent();pick(c,'el-row-1');addListRef(c,'x');
  const ref=CS.bufferFor(c.thread.id).browser_context_refs[0];
  act('bc-list-remove',{id:ref.id});const e3=BC.selectionEpoch();
  act('bc-switch-session',{id:'sess-auth'});const e4=BC.selectionEpoch();
  ck('Pick, cancel, remove and session switch each advance the epoch',e1>e0&&e2>e1&&e3>e2&&e4>e3);
  const late=BC.acceptLateResolution({epoch:e1,threadId:c.thread.id,bufferRevision:CS.revision(c.thread.id)});
  ck('Late result from a superseded epoch is discarded, not dispatched',!late.ok&&late.error==='stale_selection_epoch'&&late.dispatched===false);
  const cur=BC.acceptLateResolution({epoch:BC.selectionEpoch(),threadId:c.thread.id,bufferRevision:CS.revision(c.thread.id)});
  ck('Unchanged-epoch result still accepted',cur.ok&&cur.dispatched===true);
  restoreSurface();};
tests.composer_revision_fences_late_results=async ck=>{const c=fresh();openBrowser();armComponent();
  pick(c,'el-retry');
  const op={epoch:BC.selectionEpoch(),threadId:c.thread.id,bufferRevision:CS.revision(c.thread.id)};
  c.state.composer='edited after op start';CS.bufferFor(c.thread.id).text=c.state.composer;CS.bufferFor(c.thread.id).revision+=1;
  const late=BC.acceptLateResolution(op);
  ck('Composer edit after op start discards the late result',!late.ok&&late.error==='stale_buffer_revision'&&late.dispatched===false);
  restoreSurface();};

/* feedback_and_policy: truthful outcomes, enforced policy, protected exclusion. */
tests.no_success_after_stale_refusal=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-retry');setMode('send');setPromptInstruction('Keep this instruction');
  injReplace('el-retry','<RetryButton>','mutated before Send Now'); /* INJECTION */
  const n0=users(c).length;act('bc-prompt-run');c=E.ctx();
  ck('Stale Send Now admits nothing',users(c).length===n0);
  ck('No success toast after refusal',!toasts(c).some(t=>/^Component sent/.test(t)));
  ck('Selection and instruction preserved for recapture',!!BC.state().picked&&BC.state().promptInstruction==='Keep this instruction');
  restoreSurface();};
tests.policy_off_refuses_at_operation=async ck=>{let c=fresh();openBrowser();
  BC.state().policy.screenshots='off';
  const n0=BC.state().captures.length;
  act('bc-full-shot',{which:'visible'});c=E.ctx();
  ck('Policy Off refuses the capture operation',BC.state().captures.length===n0&&users(c).length===0);
  ck('Refusal is durable with the capability named',c.thread.messages.some(m=>/screenshot/i.test((m.title||'')+' '+(m.detail||''))&&/Off/.test(m.detail||''))&&BC.state().refusals.some(r=>r.capability==='screenshots'));
  act('bc-arm-component');
  const ok=liveEl('el-retry')?true:false;
  if(ok){pick(c,'el-retry');setMode('send');setPromptInstruction('x');act('bc-prompt-run');c=E.ctx();}
  ck('Component Send Now honors the same capability gate',BC.state().captures.length===n0);
  restoreSurface();};
tests.policy_ask_holds_for_explicit_allow=async ck=>{let c=fresh();openBrowser();
  BC.state().policy.screenshots='ask';
  const n0=BC.state().captures.length;
  act('bc-full-shot',{which:'visible'});c=E.ctx();
  ck('Policy Ask holds without capturing',BC.state().captures.length===n0&&!!BC.state().pendingAllow);
  ck('Hold offers an explicit allow-once control',!!document.querySelector('[data-action="bc-allow-once"]'));
  act('bc-allow-once');c=E.ctx();
  act('bc-full-shot',{which:'visible'});c=E.ctx();
  ck('Single explicit allow releases exactly one capture',BC.state().captures.length===n0+1&&!BC.state().pendingAllow);
  act('bc-full-shot',{which:'visible'});c=E.ctx();
  ck('Allow-once is consumed, not a blanket grant',BC.state().captures.length===n0+1&&!!BC.state().pendingAllow);
  restoreSurface();};
tests.protected_auth_excluded_everywhere=async ck=>{let c=fresh();openBrowser();
  act('bc-switch-session',{id:'sess-auth'});c=E.ctx();
  const caps0=BC.state().captures.length,ctx0=BC.state().contexts.length;
  act('bc-full-shot',{which:'visible'});
  act('bc-toggle-devtools');
  act('bc-arm-component');
  const authEls=document.querySelectorAll('[data-bc-surface="sess-auth"] [data-bc-el]').length;
  c=E.ctx();
  ck('Protected session renders no pickable elements',authEls===0);
  ck('Capture and DevTools refused with nothing produced',BC.state().captures.length===caps0&&BC.state().contexts.length===ctx0);
  ck('Refusals durable in transcript',c.thread.messages.some(m=>m.type==='bc-refused'));
  const dumped=JSON.stringify({caps:BC.state().captures,ctx:BC.state().contexts,ref:BC.state().refusals});
  ck('No credentials, cookies or storage persisted anywhere',dumped.replace(/sess-auth/g,'').indexOf('you@example')<0&&!/password|cookie|secret|storage/.test(dumped.toLowerCase()));
  restoreSurface();};
tests.permission_change_revalidated_at_commit=async ck=>{let c=fresh();openBrowser();
  act('bc-arm-region');c=E.ctx();
  const layer=document.querySelector('[data-bc-region]');if(!layer)throw Error('region layer missing');
  const r=layer.getBoundingClientRect(),x0=r.left+20,y0=r.top+20;
  layer.dispatchEvent(new MouseEvent('mousedown',{clientX:x0,clientY:y0,bubbles:true,cancelable:true}));
  c.state.permissions='Ask'; /* INJECTION: permission change mid-drag */
  document.dispatchEvent(new MouseEvent('mousemove',{clientX:x0+120,clientY:y0+80,bubbles:true,cancelable:true}));
  const n0=users(c).length;
  document.dispatchEvent(new MouseEvent('mouseup',{clientX:x0+120,clientY:y0+80,bubbles:true,cancelable:true}));
  c=E.ctx();
  ck('Permission change between prep and commit refuses the region send',users(c).length===n0);
  ck('Composer untouched by the refused drag',c.state.composer===''&&CS.bufferFor(c.thread.id).text==='');
  restoreSurface();};
tests.capture_modes_send_isolated_payloads=async ck=>{let c=fresh();
  c.state.composer='Draft stays.';CS.bufferFor(c.thread.id).text='Draft stays.';
  openBrowser();
  act('bc-full-shot',{which:'visible'});c=E.ctx();
  act('bc-full-shot',{which:'page'});c=E.ctx();
  const msgs=users(c);
  ck('Visible and page shots each append their own isolated message',msgs.length===2&&msgs.every(m=>m.isolatedSubmission&&m.type==='bc-capture'));
  ck('Composer draft byte-identical after isolated sends',c.state.composer==='Draft stays.'&&CS.bufferFor(c.thread.id).text==='Draft stays.');
  ck('Last-mode preference recorded without a storage throw',(()=>{act('bc-arm-component');pick(c,'el-retry');setMode('insert');try{localStorage.setItem('pm56-b20-probe','1');localStorage.removeItem('pm56-b20-probe');const v=localStorage.getItem('pm56-bc-component-mode.v1');BC.restore();return v==='insert'&&BC.state().componentMode==='insert';}catch(e){window.__b20notes=(window.__b20notes||[]).concat('localStorage opaque-origin; persistence covered in browser.py file-origin leg');return BC.state().componentMode==='insert';}})());
  restoreSurface();};

/* isolated_and_scheduled: exact destination routing, frozen snapshots. */
tests.isolated_send_routes_to_exact_run=async ck=>{let c=fresh();openBrowser();armComponent();
  const run=COL.runs().find(r=>r.status==='running'&&!window.PM56_ROOM?.owns(r.id));
  if(!run)throw Error('no running non-room collaboration run in fixture');
  const part=run.participants[0];
  const dest={kind:'participant',destinationKind:run.kind,refId:run.id,participantId:part.id,label:'T',detail:'d',glyph:'users'};
  PM56_RUNTIME.composer.destination=clone(dest);CS.bufferFor(c.thread.id).destination=clone(dest);
  const runMsgs0=run.messages.length;
  pick(c,'el-retry');setMode('send');setPromptInstruction('Route me exactly');
  act('bc-prompt-run');c=E.ctx();
  ck('Component Send Now appends its isolated thread message',users(c).length===1&&users(c)[0].isolatedSubmission);
  ck('Exact run receives the reference addressed to the participant',run.messages.length===runMsgs0+1&&(run.messages.at(-1).recipientIds||[]).indexOf(part.id)>=0);
  restoreSurface();};
tests.ended_destination_refuses_without_redirect=async ck=>{let c=fresh();openBrowser();armComponent();
  const run=COL.runs().find(r=>r.status==='running'&&!window.PM56_ROOM?.owns(r.id));
  if(!run)throw Error('no running non-room collaboration run in fixture');
  run.status='completed'; /* INJECTION: end the destination mid-test */
  const dest={kind:'workflow',destinationKind:run.kind,refId:run.id,label:'T',detail:'d',glyph:'users'};
  PM56_RUNTIME.composer.destination=clone(dest);CS.bufferFor(c.thread.id).destination=clone(dest);
  c.state.composer='Draft survives.';CS.bufferFor(c.thread.id).text='Draft survives.';
  pick(c,'el-retry');setMode('send');setPromptInstruction('x');
  const n0=users(c).length;act('bc-prompt-run');c=E.ctx();
  ck('Ended destination refuses the isolated send',users(c).length===n0);
  ck('No silent redirect to Assistant',!users(c).some(m=>m.destinationLabel==='Assistant'&&m.isolatedSubmission)||users(c).length===n0);
  ck('Draft and destination choice preserved on refusal',c.state.composer==='Draft survives.'&&!!CS.bufferFor(c.thread.id).destination);
  run.status='running';restoreSurface();};
function schedDraft(){const d=S.messageDraft();Object.assign(d,{date:'2027-05-10',time:'22:00',timezone:'America/New_York'});return d;}
tests.schedule_refuses_live_refs_without_freeze=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-row-1');addListRef(c,'Live ref cannot schedule');
  act('bc-close');c=E.ctx();
  c.state.composer='Schedule me with a live ref.';CS.bufferFor(c.thread.id).text=c.state.composer;
  const msgs0=S.list().messages.length;
  const out=S.saveMessage(schedDraft());
  ck('Live browser refs refuse scheduling with a stated reason',!out.ok&&out.error==='live_browser_context_not_schedulable'&&S.list().messages.length===msgs0);
  ck('Refused schedule keeps the composer intact',/Schedule me with a live ref/.test(c.state.composer)&&CS.bufferFor(c.thread.id).browser_context_refs.length===1);
  act('sched-open-message');c=E.ctx();act('sched-create-message');c=E.ctx();
  const ferr=document.querySelector('.sched-form-error');
  ck('Refusal surfaces on the ordinary schedule form',!!ferr&&/Freeze browser context/.test(ferr.textContent));
  restoreSurface();};
tests.frozen_snapshot_schedules_and_dispatches_retained=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-row-1');addListRef(c,'Freeze me');
  const refs0=CS.bufferFor(c.thread.id).browser_context_refs.length;
  act('bc-freeze-snapshots');c=E.ctx();
  const buf=CS.bufferFor(c.thread.id);
  ck('Freeze converts every live ref to a retained attachment',refs0===1&&buf.browser_context_refs.length===0&&buf.attachments.length===1&&!!buf.attachments[0].snapshot_ref);
  const snap=buf.attachments[0],resolved=A.resolve(snap.snapshot_ref,{document:true});
  ck('Frozen bytes live in the shared artifact owner with immutable identity',resolved.ok&&resolved.revision.record.renderer_kind==='browser_snapshot'&&!!resolved.revision.record.payload.frozen_dom);
  act('bc-close');c=E.ctx();
  c.state.composer='Dispatch the retained browser snapshot.';CS.bufferFor(c.thread.id).text=c.state.composer;
  const saved=S.saveMessage(schedDraft());
  ck('Frozen schedule commits through the shared scheduler',saved.ok&&saved.record.attachment_refs.length===1);
  const rec=saved.record;
  const frozenDom=resolved.revision.record.payload.frozen_dom;
  openBrowser(); /* change the live page after commit */
  injReplace('el-row-1','<QueryRow>','live page moved on'); /* INJECTION */
  const out=S.dispatchMessageAt(rec.scheduled_dispatch_id,Date.parse(rec.scheduled_at_utc));c=E.ctx();
  ck('Dispatch delivers the retained snapshot, never a live re-resolve',out.ok&&JSON.stringify(out).indexOf('live page moved on')<0);
  const delivered=c.thread.messages.find(m=>m.id===out.message_id);
  ck('Delivered message pins the exact retained revision',!!delivered&&JSON.stringify(delivered).indexOf(snap.snapshot_ref.artifact_id)>=0);
  ck('Retained DOM bytes equal the frozen copy',frozenDom===A.resolve(snap.snapshot_ref,{document:true}).revision.record.payload.frozen_dom);
  restoreSurface();};
tests.missing_retained_bytes_hold_without_fetch=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-footnote');addListRef(c,'Hold me');
  act('bc-freeze-snapshots');c=E.ctx();
  const buf0=CS.bufferFor(c.thread.id);
  ck('Freeze produces a retained attachment first',buf0.attachments.length===1&&!!buf0.attachments[0].snapshot_ref);
  const snap=buf0.attachments[0];
  act('bc-close');c=E.ctx();
  c.state.composer='Schedule then lose the bytes.';CS.bufferFor(c.thread.id).text=c.state.composer;
  const saved=S.saveMessage(schedDraft());
  ck('Frozen schedule commits before the loss leg',saved.ok);
  const rec=saved.record;
  const art=PM56_DATA.artifacts.find(x=>x.id===snap.snapshot_ref.artifact_id);
  art.revisionAvailability={[snap.snapshot_ref.artifact_version]:'missing'}; /* INJECTION: retained bytes disconnected */
  const held=S.dispatchMessageAt(rec.scheduled_dispatch_id,Date.parse(rec.scheduled_at_utc));
  ck('Missing retained bytes hold or fail naming the ref',(!held.ok||held.held)&&/missing|snapshot|attachment|retained/i.test(held.error+' '+(held.detail||'')));
  art.revisionAvailability={[snap.snapshot_ref.artifact_version]:'available'};
  const sent=S.dispatchMessageAt(rec.scheduled_dispatch_id,Date.parse(rec.scheduled_at_utc));
  ck('Exact original snapshot delivers after restore',!!sent.ok);
  restoreSurface();};
tests.recapture_reuses_the_picker=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-retry');addListRef(c,'Original instruction kept');
  const ref=CS.bufferFor(c.thread.id).browser_context_refs[0];
  injReplace('el-retry','<RetryButton>','mutated for recapture'); /* INJECTION */
  c=ordinarySend(c,'Hold with one stale item.');
  ck('Send holds on the stale item',users(c).length===0);
  act('bc-recapture-ref',{id:ref.id});c=E.ctx();
  ck('Recapture reopens the same picker, no new command',BC.recaptureCommand()==='cmd.browser.component.pick'&&BC.state().mode==='component');
  ck('Instruction and position preserved for recapture',BC.state().promptInstruction==='Original instruction kept');
  pick(c,'el-retry');setMode('list');act('bc-prompt-run');c=E.ctx();
  const refs2=CS.bufferFor(c.thread.id).browser_context_refs;
  ck('Re-pick through the same flow replaces the stale ref',refs2.length===1&&!refs2[0].stale&&refs2[0].instruction==='Original instruction kept');
  c=ordinarySend(c,'Send after recapture.');
  ck('Recaptured list sends exactly its identity',users(c).length===1);
  restoreSurface();};
/* B20-R01: recorded locator ambiguity resolves even with the surface unmounted. */
tests.r01_closed_recorded_ambiguity_holds=async ck=>{let c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-filter-tenant');addListRef(c,'Explain the selected tenant filter.');
  act('bc-simulate-duplicate');c=E.ctx();
  ck('Duplicating the locator advances the recorded page generation',BC.state().sessions.find(s=>s.id==='sess-ordinary').generation>rec.session.generationAtCapture);
  const openRv=BC.revalidate(rec);
  ck('Open duplicate resolves multiple_matches',openRv.result==='stale_capture'&&openRv.reason==='multiple_matches');
  act('bc-close');c=E.ctx();
  const closedRv=BC.revalidate(rec);
  ck('Closed duplicate resolves recorded ambiguity, never current',closedRv.result==='stale_capture'&&closedRv.reason==='multiple_matches');
  const n0=users(c).length;
  c=ordinarySend(c,'Review this filter.');
  ck('Ordinary send with a closed ambiguous ref is held',users(c).length===n0);
  ck('Draft preserved on the ambiguity hold',/Review this filter/.test(c.state.composer));
  restoreSurface();};
/* B20-R01: the recorded replacement binds only captures taken before it. */
tests.r01_recapture_after_recorded_replace_sends=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-retry');addListRef(c,'Replace then recapture');
  const ref=CS.bufferFor(c.thread.id).browser_context_refs[0];
  act('bc-simulate-replace');c=E.ctx();
  ck('Recorded replacement stales the old capture',BC.revalidate(BC.state().contexts[BC.state().contexts.length-1]).result==='stale_capture');
  c=ordinarySend(c,'Hold me.');
  ck('Send holds on the replaced target',users(c).length===0);
  act('bc-recapture-ref',{id:ref.id});c=E.ctx();
  pick(c,'el-retry');setMode('list');act('bc-prompt-run');c=E.ctx();
  const refs=CS.bufferFor(c.thread.id).browser_context_refs;
  ck('Recapture takes a fresh identity on the replaced page',refs.length===1&&!refs[0].stale);
  c=ordinarySend(c,'Send after recorded replace.');
  ck('Post-replacement capture sends exactly once',users(c).length===1);
  restoreSurface();};
/* B20-R02: validators run before every effect-claiming hook (/goal and Plan revision). */
tests.r02_goal_send_validates_first=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-retry');addListRef(c,'Inspect the selected retry button.');
  act('bc-simulate-replace');c=E.ctx();
  ck('Replace leaves a stale identity',BC.revalidate(BC.state().contexts[BC.state().contexts.length-1]).result==='stale_capture');
  act('bc-close');c=E.ctx();
  const n0=users(c).length;
  c.state.composer='/goal Inspect the selected component.\n'+c.state.composer;CS.bufferFor(c.thread.id).text=c.state.composer;c.renderApp();
  document.querySelector('[data-action="send"]').click();c=E.ctx();
  ck('Stale /goal submission is held with zero admissions',users(c).length===n0);
  ck('No Goal object is created by the held submission',window.PM56_GOAL.get()===null);
  ck('/goal draft preserved for fix-and-resend',c.state.composer.indexOf('/goal')>=0);
  restoreSurface();};
tests.r02_plan_revision_validates_first=async ck=>{let c=fresh();openBrowser();armComponent();
  const P=window.PM56_PLANS,W=window.PM56_B17_WORK;
  W.start('documents');document.querySelector('[data-action="send"]').click();c=E.ctx();
  const p=P.get(W.snapshot().planId);
  E._actions['pd-revise'](E.ctx(),{dataset:{id:p.plan_id}});c=E.ctx();
  ck('Revision destination armed',PM56_RUNTIME.composer.destination&&PM56_RUNTIME.composer.destination.kind==='plan-revision');
  openBrowser();armComponent();c=E.ctx();
  pick(c,'el-retry');addListRef(c,'Stale ref blocks revision');
  act('bc-simulate-replace');c=E.ctx();
  act('bc-close');c=E.ctx();
  const v0=p.version,n0=users(c).length;
  c.state.composer=c.state.composer+'\nRevise with a stale browser ref.';CS.bufferFor(c.thread.id).text=c.state.composer;c.renderApp();
  document.querySelector('[data-action="send"]').click();c=E.ctx();
  ck('Stale revision submission is held with zero admissions',users(c).length===n0);
  ck('Plan version unchanged by the held revision',p.version===v0);
  ck('Revision instructions and destination preserved',c.state.composer.indexOf('Revise with a stale browser ref')>=0&&PM56_RUNTIME.composer.destination.kind==='plan-revision');
  restoreSurface();};
/* B20-R03: DOM/component policy enforced at component dispatch, freeze and ordinary sends. */
tests.r03_dom_policy_guards_component_dispatch=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-retry');setMode('send');setPromptInstruction('x');
  for(let i=0;i<4&&BC.state().policy.dom!=='off';i++)act('bc-cycle-policy',{id:'dom'});
  ck('DOM policy is Off while screenshots stay On',BC.state().policy.dom==='off'&&BC.state().policy.screenshots==='on');
  const n0=users(c).length,caps0=BC.state().captures.length;
  act('bc-prompt-run');c=E.ctx();
  ck('Component Send Now refuses with DOM Off',users(c).length===n0&&BC.state().captures.length===caps0);
  ck('Refusal names the DOM capability durably',BC.state().refusals.some(r=>r.capability==='dom'));
  BC.state().policy.dom='on';
  pick(c,'el-retry');addListRef(c,'List leg under DOM policy');
  for(let i=0;i<4&&BC.state().policy.dom!=='off';i++)act('bc-cycle-policy',{id:'dom'});
  c=ordinarySend(c,'Ordinary send with DOM Off.');
  ck('Ordinary send with refs holds while DOM is Off',users(c).length===n0);
  act('bc-freeze-snapshots');c=E.ctx();
  ck('Freeze refuses while DOM is Off',CS.bufferFor(c.thread.id).attachments.length===0&&CS.bufferFor(c.thread.id).browser_context_refs.length===1);
  BC.state().policy.dom='on';
  pick(c,'el-row-1');setMode('send');setPromptInstruction('ask leg');
  for(let i=0;i<4&&BC.state().policy.dom!=='ask';i++)act('bc-cycle-policy',{id:'dom'});
  act('bc-prompt-run');c=E.ctx();
  ck('DOM Ask holds Send Now for an explicit allow',users(c).length===n0&&!!BC.state().pendingAllow);
  c.state.permissions='Ask'; /* INJECTION: permission change while held */
  act('bc-allow-once');c=E.ctx();
  ck('Permission change expires the held approval',!BC.state().allowOnce&&toasts(c).some(t=>/expired/i.test(t)));
  c.state.permissions='always';
  act('bc-prompt-run');c=E.ctx();
  act('bc-allow-once');c=E.ctx();
  act('bc-prompt-run');c=E.ctx();
  ck('Fresh allow releases exactly one component send',users(c).length===n0+1);
  restoreSurface();};
/* B20-R04: isolated sends bind the refreshed dispatch context they validated. */
tests.r04_refreshed_context_bound_to_isolated_send=async ck=>{let c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-row-1'),captured=clone(rec);
  act('bc-simulate-rerender');await until(()=>BC.state().lastRerenderNote);
  const rv=BC.revalidate(rec);
  ck('Re-render refreshes to generation 2',rv.result==='refreshed'&&rv.current_generation===2&&!!rv.dispatched_context);
  setMode('send');setPromptInstruction('Send the refreshed row.');
  act('bc-prompt-run');c=E.ctx();
  const msg=users(c).at(-1),bound=msg&&msg.browserDispatchedContexts&&msg.browserDispatchedContexts[rec.id];
  ck('Isolated send admits the refreshed component',!!msg);
  ck('Message binds the full refreshed context, not just an old id',!!bound&&bound.generation===2&&bound.rect&&bound.rect.y===rv.dispatched_context.rect.y&&!!bound.dom&&!!bound.style&&!!bound.source);
  const stored=BC.state().contexts.find(x=>x.id===rec.id);
  ck('Original captured evidence stays unchanged',stored.session.generationAtCapture===captured.session.generationAtCapture&&stored.boundedHtml===captured.boundedHtml&&!('dispatched_context' in stored));
  restoreSurface();};
/* B20-R05: list projection keeps visible/hidden correspondence across edit/reorder/remove/recapture. */
tests.r05_list_projection_correspondence=async ck=>{let c=fresh();
  c.state.composer='My notes stay.';CS.bufferFor(c.thread.id).text='My notes stay.';
  openBrowser();armComponent();
  pick(c,'el-retry');addListRef(c,'First instruction');
  pick(c,'el-row-1');addListRef(c,'Second instruction');
  let refs=CS.bufferFor(c.thread.id).browser_context_refs;
  const blocks=()=>(c.state.composer.match(/Referenced components:/g)||[]).length;
  ck('Two refs project as one block beside user text',refs.length===2&&blocks()===1&&/My notes stay/.test(c.state.composer));
  const firstId=refs[0].id,secondId=refs[1].id;
  const input=document.querySelector('[data-bc-input="list-instr"][data-id="'+firstId+'"]');
  input.value='NEW instruction';input.dispatchEvent(new Event('change',{bubbles:true}));c=E.ctx();
  refs=CS.bufferFor(c.thread.id).browser_context_refs;
  ck('Edit replaces the instruction without duplicating the block',blocks()===1&&!/First instruction/.test(c.state.composer)&&/NEW instruction/.test(c.state.composer));
  ck('Edit preserves siblings, refs and user text',refs.length===2&&refs[0].instruction==='NEW instruction'&&/Second instruction/.test(c.state.composer)&&/My notes stay/.test(c.state.composer));
  act('bc-list-move',{id:secondId,dir:'-1'});c=E.ctx();
  refs=CS.bufferFor(c.thread.id).browser_context_refs;
  ck('Reorder swaps rows in one block',blocks()===1&&c.state.composer.indexOf('Second instruction')<c.state.composer.indexOf('NEW instruction')&&refs[0].id===secondId&&refs[0].number===1&&refs[1].number===2);
  act('bc-list-remove',{id:firstId});c=E.ctx();
  refs=CS.bufferFor(c.thread.id).browser_context_refs;
  ck('Remove drops exactly one row and ref',blocks()===1&&!/NEW instruction/.test(c.state.composer)&&/Second instruction/.test(c.state.composer)&&refs.length===1&&/My notes stay/.test(c.state.composer));
  injReplace('el-row-1','<QueryRow>','mutated for recapture'); /* INJECTION */
  c=ordinarySend(c,'Hold me.');
  ck('Send holds on the stale survivor',users(c).length===0);
  const survivor=CS.bufferFor(c.thread.id).browser_context_refs[0];
  act('bc-recapture-ref',{id:survivor.id});c=E.ctx();
  pick(c,'el-row-1');setMode('list');act('bc-prompt-run');c=E.ctx();
  refs=CS.bufferFor(c.thread.id).browser_context_refs;
  ck('Recapture replaces identity, keeps instruction, one block',refs.length===1&&!refs[0].stale&&refs[0].instruction==='Second instruction'&&blocks()===1);
  c=ordinarySend(c,'Send after recapture.');
  ck('Recaptured list admits exactly one projected block',users(c).length===1&&(users(c)[0].body.match(/Referenced components:/g)||[]).length===1);
  restoreSurface();};
/* B20-R06: frozen snapshot export is valid UTF-8 JSON of the retained bytes. */
tests.r06_snapshot_export_valid_utf8=async ck=>{let c=fresh();openBrowser();armComponent();
  async function downloadBytes(sref){let blob=null;const orig=URL.createObjectURL;URL.createObjectURL=function(b){blob=b;return orig.call(this,b);};
    try{E._actions['ar-download'](E.ctx(),{dataset:{ref:encodeURIComponent(JSON.stringify(sref))}});}finally{URL.createObjectURL=orig;}
    if(!blob)throw Error('No download Blob created');return new Uint8Array(await blob.arrayBuffer());}
  function strictJson(bytes){let err=null,parsed=null;try{parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch(e){err=String(e);}return {err,parsed};}
  const instruction='Café 中文 🐧 — keep this exact text';
  pick(c,'el-retry');addListRef(c,instruction);
  act('bc-freeze-snapshots');c=E.ctx();
  const buf=CS.bufferFor(c.thread.id);
  ck('Freeze produced one retained attachment',buf.attachments.length===1&&!!buf.attachments[0].snapshot_ref);
  const sref=buf.attachments[0].snapshot_ref,rev=A.resolve(sref,{document:true}).revision.record;
  const frozen=strictJson(await downloadBytes(sref));
  ck('Frozen download is strict UTF-8 JSON through the shared owner',frozen.err===null&&!!frozen.parsed);
  ck('Decoded instruction preserves every code point',frozen.parsed&&frozen.parsed.snapshot&&frozen.parsed.snapshot.payload.instruction===instruction);
  ck('Decoded payload equals the retained bytes, no live re-read',frozen.parsed&&JSON.stringify(frozen.parsed.snapshot.payload)===JSON.stringify(rev.payload));
  const scope=window.PM56_GOAL.scope(c.thread.id),crlf='line one\r\nline two 中文 🐧';
  const pub=A.publish({artifact_id:'test-crlf-snapshot',artifact_version:1,project_id:scope.projectId,thread_id:scope.threadId,renderer_kind:'browser_snapshot',title:'CRLF probe',payload:{schema:'pm.concept.browser_snapshot.v1',instruction:crlf}});
  ck('CRLF-bearing snapshot publishes through the shared owner',pub.ok);
  const back=strictJson(await downloadBytes({artifact_id:'test-crlf-snapshot',artifact_version:1,project_id:scope.projectId,thread_id:scope.threadId}));
  ck('CRLF and astral content survive the exact download',back.err===null&&back.parsed.snapshot.payload.instruction===crlf);
  restoreSurface();};
/* B20-R07: multi-reference freeze is atomic with clean retry. */
tests.r07_failed_freeze_rolls_back=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-row-1');addListRef(c,'First');
  pick(c,'el-retry');addListRef(c,'Second');
  const before=new Set(PM56_DATA.artifacts.map(x=>x.id)),publish=A.publish;let calls=0;
  A.publish=function(q){if(++calls===2)return {ok:false,error:'test_injected_publish_failure'};return publish(q);}; /* INJECTION: second publish fails once */
  try{act('bc-freeze-snapshots');}finally{A.publish=publish;}
  c=E.ctx();
  ck('Failed freeze leaves zero partial artifacts',PM56_DATA.artifacts.filter(x=>!before.has(x.id)).length===0);
  ck('Refs and composer preserved, nothing attached',CS.bufferFor(c.thread.id).browser_context_refs.length===2&&CS.bufferFor(c.thread.id).attachments.length===0);
  ck('Feedback reports the rollback truthfully',toasts(c).some(t=>/rolled back/i.test(t)));
  act('bc-freeze-snapshots');c=E.ctx();
  ck('Unchanged retry freezes both refs cleanly',CS.bufferFor(c.thread.id).attachments.length===2&&CS.bufferFor(c.thread.id).browser_context_refs.length===0);
  restoreSurface();};
/* B20-R3-F1: a directly observed live-DOM ambiguity never becomes current just
 * because the surface unmounted. */
tests.r3_f1_unmounted_observed_ambiguity_holds=async ck=>{let c=fresh();openBrowser();armComponent();
  const rec=pick(c,'el-row-1');addListRef(c,'Inspect the row');
  injDuplicate('el-row-1'); /* INJECTION: ambiguous locator in the live DOM */
  const mounted=BC.revalidate(rec);
  ck('Mounted duplicate observes multiple_matches',mounted.result==='stale_capture'&&mounted.reason==='multiple_matches');
  act('bc-close');c=E.ctx();
  const closed=BC.revalidate(rec);
  ck('Closed recheck keeps the observed failure, never current',closed.result==='stale_capture'&&closed.identity_match!==true);
  ck('Closed hold names an actionable recapture route',closed.recapture_action==='cmd.browser.component.pick');
  const n0=users(c).length;
  c=ordinarySend(c,'Review this row.');
  ck('Ordinary send with the closed ambiguous ref is held',users(c).length===n0);
  ck('Held draft preserved for fix-and-resend',/Review this row/.test(c.state.composer));
  restoreSurface();};
/* B20-R3-F1 positive leg: clean closed-session sends still work. */
tests.r3_f1_clean_closed_send_admits=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-retry');addListRef(c,'Clean closed send');
  act('bc-close');c=E.ctx();
  c=ordinarySend(c,'Send with a clean closed ref.');
  ck('Clean closed-session send admits exactly once',users(c).length===1);
  restoreSurface();};
/* B20-R3-F2: one Send Now operation resolves its full Ask capability set;
 * single-use scope and policy fencing are preserved. */
tests.r3_f2_dual_ask_send_now_sends=async ck=>{let c=fresh();openBrowser();armComponent();
  function setPolicy(id,v){for(let i=0;i<4&&BC.state().policy[id]!==v;i++)act('bc-cycle-policy',{id});if(BC.state().policy[id]!==v)throw Error('policy select failed');}
  pick(c,'el-retry');setMode('send');setPromptInstruction('dual-ask send');
  setPolicy('dom','ask');setPolicy('screenshots','ask');
  const n0=users(c).length;
  for(let i=0;i<5&&users(E.ctx()).length===n0;i++){act('bc-prompt-run');c=E.ctx();if(users(c).length>n0)break;act('bc-allow-once');c=E.ctx();}
  ck('Dual-Ask Send Now sends exactly once after explicit allows',users(c).length===n0+1);
  ck('Policies stay Ask; nothing silently switched On',BC.state().policy.dom==='ask'&&BC.state().policy.screenshots==='ask');
  armComponent();
  act('bc-pick-el',{id:'el-retry'});c=E.ctx(); /* held: Select Component is DOM-gated under Ask */
  act('bc-allow-once');c=E.ctx();
  pick(c,'el-retry');setMode('send');setPromptInstruction('second send needs a fresh allow');
  act('bc-prompt-run');c=E.ctx();
  ck('The dual grant was single-use, not a blanket approval',users(c).length===n0+1&&!!BC.state().pendingAllow);
  restoreSurface();};
/* B20-R3-F2 freeze leg: dual-Ask freeze retains after explicit allows. */
tests.r3_f2_dual_ask_freeze_retains=async ck=>{let c=fresh();openBrowser();armComponent();
  function setPolicy(id,v){for(let i=0;i<4&&BC.state().policy[id]!==v;i++)act('bc-cycle-policy',{id});if(BC.state().policy[id]!==v)throw Error('policy select failed');}
  pick(c,'el-retry');addListRef(c,'Freeze under dual Ask');
  setPolicy('dom','ask');setPolicy('screenshots','ask');
  for(let i=0;i<5&&CS.bufferFor(c.thread.id).attachments.length===0;i++){act('bc-freeze-snapshots');c=E.ctx();if(CS.bufferFor(c.thread.id).attachments.length)break;act('bc-allow-once');c=E.ctx();}
  ck('Dual-Ask freeze retains the snapshot after explicit allows',CS.bufferFor(c.thread.id).attachments.length===1);
  ck('Freeze policies stay Ask as well',BC.state().policy.dom==='ask'&&BC.state().policy.screenshots==='ask');
  restoreSurface();};
function r3_enqueue(c,text){c.state.work={step:1,running:true,expanded:false,started:true,completed:false,elapsed:1,openPhase:null};c.renderApp();
  c.state.composer+='\n'+text;CS.bufferFor(c.thread.id).text=c.state.composer;
  document.querySelector('[data-action="send"]').click();return E.ctx();}
function r3_retained(c,text){const q=c.state.sendQueue[c.thread.id]||[];return (c.state.composer+'\n'+q.map(x=>x.text).join('\n')).indexOf(text)>=0;}
function r3_setPolicy(id,v){for(let i=0;i<4&&BC.state().policy[id]!==v;i++)act('bc-cycle-policy',{id});if(BC.state().policy[id]!==v)throw Error('policy select failed');}
/* B20-R3-F3 Off leg: a deferred policy refusal keeps the input visible. */
tests.r3_f3_deferred_off_hold_preserves=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-row-1');addListRef(c,'Inspect this row');
  c=r3_enqueue(c,'DEFERRED_OFF_MUST_SURVIVE');
  ck('Off leg enqueues behind running work',(c.state.sendQueue[c.thread.id]||[]).length===1&&users(c).length===0);
  c.state.work.running=false;
  r3_setPolicy('dom','off');
  document.querySelector('[data-action="queue-send-now"]').click();c=E.ctx();
  ck('The DOM-Off veto actually ran',BC.state().refusals.some(r=>r.capability==='dom'));
  ck('DOM-Off deferred refusal sends nothing',users(c).length===0);
  ck('DOM-Off deferred input stays visible in queue or composer',r3_retained(c,'DEFERRED_OFF_MUST_SURVIVE'));
  restoreSurface();};
/* B20-R3-F3 Ask leg: a deferred hold waits for, then honors, an explicit allow. */
tests.r3_f3_deferred_ask_hold_preserves=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-row-1');addListRef(c,'Inspect this row');
  c=r3_enqueue(c,'DEFERRED_ASK_MUST_SURVIVE');
  c.state.work.running=false;
  r3_setPolicy('dom','ask');
  document.querySelector('[data-action="queue-send-now"]').click();c=E.ctx();
  ck('The DOM-Ask hold is actually pending',!!BC.state().pendingAllow);
  ck('DOM-Ask deferred hold sends nothing without an allow',users(c).length===0);
  ck('DOM-Ask deferred input stays visible in queue or composer',r3_retained(c,'DEFERRED_ASK_MUST_SURVIVE'));
  act('bc-allow-once');c=E.ctx();
  document.querySelector('[data-action="queue-send-now"]').click();c=E.ctx();
  ck('Allowed deferred send admits exactly once',users(c).length===1);
  restoreSurface();};
/* B20-R3-F3 exception leg: a validator exception keeps the input visible. */
tests.r3_f3_deferred_exception_preserves=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-row-1');addListRef(c,'Inspect this row');
  c=r3_enqueue(c,'DEFERRED_EXCEPTION_MUST_SURVIVE');
  c.state.work.running=false;
  const vs=PM56_RUNTIME.composer.preSendValidators,injected=()=>{throw Error('test_injected_validator_error');};
  vs.unshift(injected); /* INJECTION: one throwing validator, removed right after */
  try{document.querySelector('[data-action="queue-send-now"]').click();c=E.ctx();}finally{vs.splice(vs.indexOf(injected),1);}
  ck('The validator exception path actually ran',c.thread.messages.some(m=>m.type==='send-held'));
  ck('Validator exception sends nothing',users(c).length===0);
  ck('Exception-held input stays visible in queue or composer',r3_retained(c,'DEFERRED_EXCEPTION_MUST_SURVIVE'));
  restoreSurface();};
/* B20-R3-F3 automatic leg: the work-completion flush preserves a held input. */
tests.r3_f3_deferred_autoflush_preserves=async ck=>{let c=fresh();openBrowser();armComponent();
  pick(c,'el-row-1');addListRef(c,'Inspect this row');
  c=r3_enqueue(c,'DEFERRED_AUTOFLUSH_MUST_SURVIVE');
  r3_setPolicy('dom','off');
  document.querySelector('[data-action="open-demo"]').click();c=E.ctx();
  document.querySelector('[data-trigger="Complete work"]').click();c=E.ctx(); /* ordinary controls: work completes, automatic flush runs */
  ck('Automatic flush ran into the DOM-Off veto',BC.state().refusals.some(r=>r.capability==='dom'));
  ck('Automatic flush under DOM-Off sends nothing',users(c).length===0);
  ck('Auto-flushed input stays visible in queue or composer',r3_retained(c,'DEFERRED_AUTOFLUSH_MUST_SURVIVE'));
  restoreSurface();};
})();
