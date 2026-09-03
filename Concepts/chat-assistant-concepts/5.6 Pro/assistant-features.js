/* assistant-features.js — feature module.  OWNER: Assistant redesign wave (2026-09-03) —
 * assistant-features agent.  Packet 01_IMPLEMENTATION_SPEC §2.1 (thread identity and
 * title), §2.4 (spellcheck — VERIFIED here, owned by composer-state.js), §16 (Teach,
 * Teacher, automatic memory, ELI5, Debug, Revert), §17 (Context Lens / Context-BSD —
 * VERIFIED here, owned by lens.js / context.js).  04_GUI_IMPACTS §16-17.  Requirement
 * docs: Teach_Teacher_memory_Debug_ELI5_Revert_and_Context_Lens.md (FEATURE-001..010),
 * Thread_title_and_spellcheck.md (TITLE-001..008).
 *
 * SIX CAPABILITIES THIS FILE OWNS
 * --------------------------------
 * 1. TEACH             durable user -> Puppet Master teaching. /teach + natural
 *                       language. Never touches state.persona.
 * 2. TEACHER            visibility for the BUILT-IN Teacher Persona (already in
 *                       app.js's Persona picker — see honesty note 1). Never
 *                       conflated with Teach.
 * 3. AUTOMATIC MEMORY   independent memory owner (run boundaries / milestones), its
 *                       own list and detail surface, demonstrably separate from Teach.
 * 4. ELI5               application default + per-thread override. Presentation only.
 * 5. REVERT LAST AGENT EDIT   whole-turn FileSafe manifest. Distinct from Rewind
 *                       (threadops.js). Preview -> confirm -> result, plus a negative
 *                       path.
 * 6. THREAD TITLE POLICY   Default resolver / None / explicit model. Manual rename
 *                       locks auto-title until Regenerate. No silent fallback.
 *
 * WHAT THIS FILE VERIFIES BUT DOES NOT OWN
 * ------------------------------------------
 * - Passive spellcheck (§2.4) is fully implemented in composer-state.js section 4
 *   (`applySpellcheck` / `scheduleSpellcheck`: the `spellcheck` attribute is
 *   re-asserted on the composer textarea after every patch via a rAF pass, no icon,
 *   no control, no provider call, no Usage record). Read it before assuming this file
 *   needs to add anything — it does not, and duplicating the attribute assertion would
 *   just race composer-state's own rAF pass. Native browser spellcheck has no way to
 *   exclude code spans/paths/URLs/hashes from inside a single plain <textarea> (that
 *   needs a contenteditable-with-spans architecture composer-state.js does not use),
 *   so TITLE-008's exclusion list is NOT implemented anywhere in this concept today.
 *   That gap is composer-state.js's to close if a future wave adds richer composer
 *   markup; it is reported here rather than silently left unmentioned.
 * - Context Lens (§17) is a standalone header control owned by lens.js, registered on
 *   `headerLeading`. This file does not register `headerLeading` and adds no Lens row
 *   to `wandRows` — verified by reading lens.js in full and grepping every wandRows
 *   registrant in the concept for the word "lens" (none found outside lens.js itself).
 *
 * WHAT THIS FILE IS HONEST ABOUT
 * ---------------------------------
 * 1. app.js already ships a wand row named "ELI5" (`renderWandMenu`, keyed off
 *    `state.capabilities.eli5`) with RETIRED one-shot "explain selected output" copy
 *    that 04_GUI_IMPACTS §16 explicitly supersedes ("It is not a one-shot 'simplify
 *    selected output only' replacement."). app.js is not this file's to edit, so that
 *    row is left in place — this file's report asks the integrator to delete it, the
 *    same way `restore-draft` was already deleted for composer-state.js — and its
 *    writes are chained (`set-eli5-cap`) into the real per-thread model below rather
 *    than silently ignored. A new, correctly labelled row is added through `wandRows`.
 * 2. Nothing here calls a real language model. "Title generation" is a deterministic,
 *    local, non-random text transform over a bounded safe excerpt — it is labelled as
 *    such in its own detail surface rather than dressed up as a live provider call.
 *    Route ELIGIBILITY (ready / expired / quota-exhausted / etc.) is 100% real: it
 *    reads the same `D.models[].status` field the Model picker itself reads, so an
 *    "unavailable model" demonstration is an existing, real fixture state, never an
 *    invented one.
 * 3. FileSafe currentness/rollback is simulated with a fixed, deterministic outcome
 *    per demo turn (never randomised), because a flaky revert demo is worse than a
 *    narrow one. Three turn kinds exist: eligible; ineligible-at-the-menu (no
 *    mutation to revert); and eligible-but-conflicted-at-confirm (the currentness
 *    check fails only once the user actually tries to revert). All three are
 *    reachable from one wand control (`af-revert-seed`), cycling in a fixed order.
 * 4. `threadRowStatus` is a REPLACE slot. history.js already supplies the built-in
 *    status indicator for 1 of its 8 preview-row variants and app.js's own dot fills
 *    the other 7; returning non-empty HTML here for "this thread has a title problem"
 *    would silently discard whichever of those is active, because `extReplace` only
 *    falls back to the built-in when EVERY registered slot fn returns ''. This file
 *    therefore declines `threadRowStatus` unconditionally (verified by reading
 *    history.js's registration in full) and surfaces per-thread title state through
 *    `threadMenu` (append, no such conflict) and the active thread's `headerExtras`
 *    chip instead. A judgment call, documented rather than silently made.
 * 5. A brand-new thread's title starts as the built-in `new-thread` action's literal
 *    'Untitled thread', not the packet's 'New chat' (§2.1.1). `new-thread` is a
 *    native if-chain branch in app.js's click handler, not an EXT action, and
 *    `extRunAfter` only ever fires for action names the native chain does NOT
 *    recognise — so there is no action hook that runs after it. This file normalises
 *    the title once, at render time, from the `headerExtras` slot: the same
 *    render-time-reconciler technique composer-state.js documents in its own header
 *    for the identical class of problem ("the concept has no switch-thread action").
 *    Never done by editing app.js.
 * 6. Automatic memory writes a small, unobtrusive transcript card (matching the
 *    existing goal-receipt / route-change convention) rather than nothing at all —
 *    "no constant pop-up" (04_GUI_IMPACTS §16) is read as "no modal/dialog
 *    interruption", not "invisible". It never toasts.
 * 7. Every fixture this file seeds carries `demo:true` and every simulated FileSafe /
 *    provider outcome says in its own copy that it is a concept simulation, per Hard
 *    Rule #3 and #5.
 *
 * RT.features IS OWNED HERE (never replaced wholesale — restored in place so
 * `window.PM56_FEATURES.state()` never goes stale). Actions are namespaced `af-`.
 * Slots used: dialog, wandRows, threadMenu, headerExtras, systemCardActions,
 * transcriptMessage (types af-investigation, af-revert-result, af-eli5-preview; every
 * other message type declines with ''), plus the message-overflow registry
 * transcript.js exposes at window.PM56_MSG_OVERFLOW.register(fn) (documented in
 * transcript.js's own header — this is the sanctioned way to add a per-message
 * operation without re-registering a second overflow button).
 */
(function(){
  'use strict';
  var D = window.PM56_DATA; if(!D) return;
  var EXT = window.PM56_EXT; if(!EXT || !EXT.slot) return;
  var RT = window.PM56_RUNTIME = window.PM56_RUNTIME || {};
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  /* =====================================================================
     0. SHARED HELPERS
     ===================================================================== */
  function nowIso(){ return new Date().toISOString(); }
  function ctxNow(){ return (EXT && typeof EXT.ctx==='function') ? EXT.ctx() : null; }
  function afUid(prefix){ return 'af-'+(prefix||'id')+'-'+Math.random().toString(36).slice(2,9)+'-'+Date.now().toString(36); }
  function clockOf(iso){
    if(!iso) return '';
    var d=new Date(iso); if(isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'});
  }
  function dayOf(iso){
    if(!iso) return '';
    var d=new Date(iso); if(isNaN(d.getTime())) return '';
    return d.toLocaleDateString([], {month:'short', day:'numeric'});
  }
  function findThread(ctx, id){
    var list=(ctx && ctx.state && ctx.state.threads)||[];
    for(var i=0;i<list.length;i++){ if(list[i].id===id) return list[i]; }
    return null;
  }
  function userMessageCount(thread){
    if(!thread || !thread.messages) return 0;
    var n=0;
    for(var i=0;i<thread.messages.length;i++){ if(thread.messages[i].role==='user') n++; }
    return n;
  }
  function lastUserMessage(thread){
    if(!thread || !thread.messages) return null;
    for(var i=thread.messages.length-1;i>=0;i--){ if(thread.messages[i].role==='user') return thread.messages[i]; }
    return null;
  }
  /* Small, honest secret screen. Not a real DLP pass — it exists so the Teach demo
     path can genuinely refuse to persist something that looks like a credential
     rather than only claiming it checked. */
  var SECRET_RX = /(api[_-]?key|secret|token|password|bearer)\s*[:=]\s*\S{4,}|sk-[a-z0-9]{10,}/i;
  function screenForSecrets(text){ return SECRET_RX.test(String(text||'')) ? 'flagged' : 'clear'; }
  /* Bounded safe excerpt only — never a whole message, never attachment bodies.
     TITLE-004 / packet §2.1.6. */
  function safeExcerpt(text, max){
    text=String(text||'').replace(/\s+/g,' ').trim();
    max = max||100;
    if(text.length<=max) return text;
    return text.slice(0, max-1).replace(/\s+\S*$/,'')+'…';
  }
  function truncateWords(text, n){
    var words=String(text||'').trim().split(/\s+/).filter(function(w){ return !!w; });
    if(words.length<=n) return words.join(' ');
    return words.slice(0,n).join(' ')+'…';
  }
  /* Shared dialog chrome so every af- dialog looks and behaves the same way the
     product's other dialogs do (compact/bsd/rename in app.js, cs-destinations in
     composer-state.js). */
  function dialogShell(ctx, opts){
    var icon=ctx.icon, e=ctx.esc;
    var w=opts.width||560;
    return '<section class="dialog af-dialog" style="width:min('+w+'px,calc(100vw - 20px))" role="dialog" aria-modal="true" aria-label="'+e(opts.label||opts.title)+'">'+
      '<div class="drawer-head"><span class="event-icon">'+icon(opts.icon||'info',13)+'</span>'+
      '<strong>'+e(opts.title)+'</strong>'+
      (opts.pill?'<span class="meta-pill">'+e(opts.pill)+'</span>':'')+
      '<span class="spacer"></span>'+
      '<button class="icon-button" data-action="close-dialog" aria-label="Close">'+icon('close',13)+'</button></div>'+
      '<div class="dialog-body af-dialog-body">'+opts.body+'</div>'+
    '</section>';
  }
  function emptyState(icon, text){
    return '<div class="af-empty">'+icon+'<p>'+text+'</p></div>';
  }

  /* =====================================================================
     1. FIXTURE — RT.features
     ---------------------------------------------------------------------
     One namespace, six sub-records, restored IN PLACE (never reassigned) so any
     reference this module or a harness holds — including
     window.PM56_FEATURES.state() — stays valid across a reset.
     ===================================================================== */
  function buildFixture(){
    return {
      demo:true,
      teach:{
        records:[
          { id:'af-teach-seed-1',
            text:'Always run the query-perf benchmark suite before closing a performance Plan revision, and record the p95 delta in the Plan evidence section.',
            scope:'project', sourceThreadId:'query', sourceMessageId:null,
            secretSafety:'clear', supersedes:null, supersededBy:null, revoked:false, locked:true,
            createdAt:'2026-08-24T09:12:00Z', updatedAt:'2026-08-24T09:12:00Z' }
        ],
        pending:null,
        nextSeq:2
      },
      memory:{
        auto:[
          { id:'af-auto-seed-1', trigger:'run_boundary', threadId:'query',
            summary:'Run boundary on Query Performance: index rewrite landed; benchmark evidence still pending.',
            verification:'verified', blocked:false, blockedByRecordId:null, at:'2026-08-27T11:44:00Z' }
        ],
        nextSeq:2,
        simIndex:0
      },
      eli5:{ appDefault:false, perThread:{} },
      revert:{ manifests:{}, seedIndex:0 },
      debug:{ investigations:{}, active:{} },
      title:{ policy:'default', locks:{}, attempts:{}, normalizedThreads:{}, pending:{} }
    };
  }
  RT.features = RT.features || buildFixture();
  var F = RT.features;

  /* Local view state only — never fixture truth. F.teach.pending already
     serves as the Teach capture draft and state.dialog.type already answers
     "is Settings open", so neither is duplicated here. */
  var ui = {
    memoryOpenSection:'taught',
    debugTab:{},
    importError:{}
  };

  function restoreFixture(){
    var fresh = buildFixture();
    for(var k in RT.features){ if(Object.prototype.hasOwnProperty.call(RT.features,k)) delete RT.features[k]; }
    for(var k2 in fresh){ RT.features[k2] = fresh[k2]; }
    F = RT.features;
    ui.memoryOpenSection='taught'; ui.debugTab={}; ui.importError={};
  }

  /* =====================================================================
     2. TEACH  (FEATURE-001, FEATURE-004) — packet §16.1
     ---------------------------------------------------------------------
     Durable user -> Puppet Master teaching. Reached by /teach and by natural
     language. Captures scope, source refs, a secret-safety result, and
     conflicts/supersession. Never writes state.persona.
     ===================================================================== */
  var TEACH_TRIGGER_RX = /^\s*\/teach\b|remember this|keep this as memory|for this project always/i;
  var TEACH_SCOPES = [['thread','This thread only'],['project','This project'],['global','Every project']];

  function activeTeachRecords(){
    return F.teach.records.filter(function(r){ return !r.revoked; });
  }
  function teachRecordById(id){
    for(var i=0;i<F.teach.records.length;i++){ if(F.teach.records[i].id===id) return F.teach.records[i]; }
    return null;
  }
  /* Very small keyword-overlap heuristic — three significant (4+ letter) words in
     common, same scope, record not revoked. Good enough to make FEATURE-004
     genuinely demonstrable without pretending to be real semantic matching. */
  function significantWords(text){
    return String(text||'').toLowerCase().match(/[a-z0-9]{4,}/g) || [];
  }
  /* excludeId skips the record being narrowed so a Narrow action never reports
     "conflicts with itself" — every OTHER active record in the same scope is
     still checked, so narrowing into a genuine second conflict still shows one. */
  function findConflict(text, scope, excludeId){
    var words=significantWords(text);
    var recs=activeTeachRecords();
    for(var i=0;i<recs.length;i++){
      var r=recs[i]; if(r.scope!==scope || r.id===excludeId) continue;
      var rw=significantWords(r.text), hits=0;
      for(var j=0;j<words.length;j++){ if(rw.indexOf(words[j])>=0) hits++; }
      if(hits>=2) return r;
    }
    return null;
  }
  function openTeachCapture(ctx, seed){
    var text=(seed&&seed.text)||'';
    var narrowOf=(seed&&seed.narrowOf)||null;
    F.teach.pending = {
      text:text, scope:(seed&&seed.scope)||'thread',
      sourceThreadId:(seed&&seed.sourceThreadId)||ctx.thread.id,
      sourceMessageId:(seed&&seed.sourceMessageId)||null,
      narrowOf:narrowOf,
      secretSafety:screenForSecrets(text),
      conflictWith:null
    };
    var c=findConflict(text, F.teach.pending.scope, narrowOf);
    F.teach.pending.conflictWith = c ? c.id : null;
    /* A modal dialog stacked on top of a still-open wand menu is a real
       overlay-order bug (backdrop click-through, focus trap conflicts) —
       close the menu first, the same way goals.js's goal-open-editor does. */
    if(ctx.closeMenu) ctx.closeMenu();
    ctx.openDialog({ type:'af-teach' });
  }

  EXT.action('af-teach-open', function(ctx){
    openTeachCapture(ctx, { text:'', scope:'thread' });
    return true;
  });
  EXT.action('af-teach-narrow', function(ctx, btn){
    var r=teachRecordById(btn.dataset.value); if(!r) return true;
    openTeachCapture(ctx, { text:r.text, scope:r.scope, sourceThreadId:r.sourceThreadId, narrowOf:r.id });
    return true;
  });
  EXT.action('af-teach-set-scope', function(ctx, btn){
    if(!F.teach.pending) return true;
    F.teach.pending.scope = btn.dataset.value;
    F.teach.pending.conflictWith = (findConflict(F.teach.pending.text, F.teach.pending.scope, F.teach.pending.narrowOf)||{}).id || null;
    ctx.renderOverlays();
    return true;
  });
  EXT.action('af-teach-cancel', function(ctx){
    F.teach.pending = null;
    ctx.closeDialog();
    return true;
  });
  EXT.action('af-teach-capture', function(ctx){
    var p=F.teach.pending; if(!p) return true;
    var text=String(p.text||'').trim();
    if(!text){ ctx.toast('Nothing to teach','Type what Puppet Master should remember first.'); return true; }
    var safety=screenForSecrets(text);
    if(safety==='flagged'){
      ctx.toast('Not captured','This looks like it includes a credential or secret. Remove it before teaching Puppet Master — taught memory is never a place to store secrets.');
      return true;
    }
    /* Recomputed fresh against the FINAL text rather than trusting p.conflictWith,
       which is only refreshed on dialog-open and on an explicit scope change — a
       user who types straight past a conflict without touching scope must still
       get a correct supersession decision, not a stale null. */
    var liveConflictId = p.narrowOf ? null : ((findConflict(text, p.scope, p.narrowOf)||{}).id || null);
    var rec={
      id:afUid('teach'), text:text, scope:p.scope,
      sourceThreadId:p.sourceThreadId, sourceMessageId:p.sourceMessageId,
      secretSafety:safety, supersedes:null, supersededBy:null, revoked:false, locked:false,
      createdAt:nowIso(), updatedAt:nowIso()
    };
    if(p.narrowOf){
      var old=teachRecordById(p.narrowOf);
      if(old){ old.revoked=true; old.supersededBy=rec.id; old.updatedAt=nowIso(); rec.supersedes=old.id; }
    } else if(liveConflictId){
      var conflict=teachRecordById(liveConflictId);
      if(conflict){ conflict.revoked=true; conflict.supersededBy=rec.id; conflict.updatedAt=nowIso(); rec.supersedes=conflict.id; }
    }
    F.teach.records.push(rec);
    F.teach.pending=null;
    ctx.closeDialog();
    ctx.addReceipt('af-teach-receipt','Taught Puppet Master', truncateWords(text,16)+' · scope: '+scopeLabel(rec.scope)+(rec.supersedes?' · supersedes an earlier record':''));
    ctx.toast('Memory captured','Durable record '+rec.id+' saved. Lock it from the Memory panel so automatic memory cannot silently override it.');
    return true;
  });
  EXT.action('af-teach-lock', function(ctx, btn){
    var r=teachRecordById(btn.dataset.value); if(!r) return true;
    r.locked=!r.locked; r.updatedAt=nowIso();
    ctx.renderOverlays();
    ctx.toast(r.locked?'Memory locked':'Memory unlocked', r.locked?'Automatic memory can no longer silently touch this record.':'Automatic memory may write over this record again.');
    return true;
  });
  EXT.action('af-teach-revoke', function(ctx, btn){
    var r=teachRecordById(btn.dataset.value); if(!r) return true;
    r.revoked=true; r.locked=false; r.updatedAt=nowIso();
    ctx.renderOverlays();
    ctx.toast('Memory revoked','This record no longer applies. It stays visible in history for audit.');
    return true;
  });

  function scopeLabel(s){ for(var i=0;i<TEACH_SCOPES.length;i++){ if(TEACH_SCOPES[i][0]===s) return TEACH_SCOPES[i][1]; } return s; }

  /* Shared by the initial render AND the live input-listener patch below, so
     the two can never draw two different conflict verdicts for the same text. */
  function renderConflictZone(ctx, conflict){
    var icon=ctx.icon, e=ctx.esc;
    if(!conflict) return '';
    return '<div class="af-conflict-card"><div class="af-conflict-head">'+icon('warning',13)+'<strong>Overlaps an existing record</strong></div>'+
      '<p class="af-conflict-existing">“'+e(conflict.text)+'”'+(conflict.locked?' <span class="af-lock-note">('+icon('lock',10)+' locked)</span>':'')+'</p>'+
      '<p class="af-note">Capturing will mark that record superseded and keep it in history. It is not silently discarded.</p></div>';
  }
  function renderTeachDialog(ctx){
    var icon=ctx.icon, e=ctx.esc;
    var p=F.teach.pending; if(!p) return '';
    var liveConflictId=(findConflict(p.text, p.scope, p.narrowOf)||{}).id||null;
    p.conflictWith = liveConflictId;
    var conflict = liveConflictId ? teachRecordById(liveConflictId) : null;
    var narrowOf = p.narrowOf ? teachRecordById(p.narrowOf) : null;
    var safety = screenForSecrets(p.text);
    var body =
      '<p class="af-note">'+(narrowOf?'Narrowing an existing record. Capturing replaces it and keeps the old one in history as superseded.':'This is a durable record. Nothing is written until you press Capture.')+'</p>'+
      '<label class="af-field-label" for="af-teach-text">What should Puppet Master remember</label>'+
      '<textarea class="af-teach-input" id="af-teach-text" data-af-input="teach-text" rows="4" placeholder="e.g. Always confirm the rollback path before applying a forward migration.">'+e(p.text)+'</textarea>'+
      '<div class="af-teach-scopes" role="radiogroup" aria-label="Scope">'+TEACH_SCOPES.map(function(s){
        return '<button class="af-chip-choice'+(p.scope===s[0]?' active':'')+'" role="radio" aria-checked="'+(p.scope===s[0])+'" data-action="af-teach-set-scope" data-value="'+s[0]+'">'+e(s[1])+'</button>';
      }).join('')+'</div>'+
      '<div class="af-safety-row af-safety-'+safety+'">'+icon(safety==='clear'?'check-circle':'warning',13)+
        '<span>'+(safety==='clear'?'No secrets or credentials detected in this text.':'Looks like it includes a credential or secret — capture will be refused.')+'</span></div>'+
      '<div id="af-teach-conflict-zone">'+renderConflictZone(ctx, conflict)+'</div>'+
      '<div class="plan-actions"><button class="soft-button" data-action="af-teach-cancel">Cancel</button>'+
      '<button class="primary-button" data-action="af-teach-capture">'+icon('check',12)+' Capture memory</button></div>';
    return dialogShell(ctx, { icon:'sparkles', title:narrowOf?'Narrow taught memory':'Teach Puppet Master', pill:'/teach', body:body, width:520 });
  }

  /* =====================================================================
     3. TEACHER — packet §16.2 (FEATURE-002)
     ---------------------------------------------------------------------
     Teacher is a built-in Persona (app.js's renderWandMenu -> Persona menu
     already lists it: 'Explanations, tours, and approachable guidance'; picking
     it runs the native `set-persona` action and writes state.persona='Teacher').
     This file does not re-register Persona selection — that would collide with
     a native action app.js already owns end-to-end. What it owns is making the
     DISTINCTION from Teach visible: a quiet inline marker wherever Teacher is
     the active Persona, and an explicit "this is not the same as Teach" note in
     the Memory panel (section 4) and the Teach dialog above.
     ===================================================================== */
  function teacherActive(ctx){ return ctx.state.persona === 'Teacher'; }

  EXT.slot('headerExtras', function(ctx){
    reconcileOnRender(ctx);
    var icon=ctx.icon, e=ctx.esc;
    var bits=[];
    if(teacherActive(ctx)){
      bits.push('<span class="af-chip af-chip-teacher" title="Teacher Persona is explaining Puppet Master this thread. It is a Persona, not a memory action — it never calls /teach or writes a taught record.">'+
        icon('users',12)+'<b>Teacher</b></span>');
    }
    bits.push(renderTitleHeaderChip(ctx));
    return bits.join('');
  });

  /* =====================================================================
     4. AUTOMATIC MEMORY  (FEATURE-003, FEATURE-004)
     ---------------------------------------------------------------------
     Independent of Teach. Fires at run boundaries / milestones via
     RT.composer.commitHooks (every 6th admitted user turn in a thread — a
     stand-in for "milestone"), plus a manual demo trigger so a reviewer does
     not have to send six messages to see it. Checked against locked Teach
     records before it is allowed to "write" — FEATURE-004 in a single
     deterministic, inspectable function rather than only described.
     ===================================================================== */
  /* Index 0 deliberately overlaps the seeded LOCKED taught record's keywords
     (query / perf / benchmark / suite), so the very first "Simulate a
     checkpoint" click demonstrates FEATURE-004's deferral — the more
     important, less obvious case — rather than burying it a few clicks in.
     The rest cycle through ordinary, unblocked events for contrast. */
  var AUTO_SUMMARIES = [
    'Run boundary reached: query-perf benchmark suite mentioned again in this thread.',
    'Run boundary reached: composer buffer flushed and the last admitted turn was recorded as durable history.',
    'Milestone: a Plan revision was reviewed in this thread; capturing the decision context for later recall.',
    'Milestone: a new provider route was selected; capturing the reason for later recall.'
  ];

  function checkAutoMemoryAgainstLocks(summary, threadId){
    var words=significantWords(summary);
    var recs=F.teach.records.filter(function(r){ return r.locked && !r.revoked; });
    for(var i=0;i<recs.length;i++){
      var rw=significantWords(recs[i].text), hits=0;
      for(var j=0;j<words.length;j++){ if(rw.indexOf(words[j])>=0) hits++; }
      if(hits>=2) return recs[i];
    }
    return null;
  }
  function createAutoMemoryEvent(ctx, threadId, summaryOverride){
    var idx = F.memory.simIndex % AUTO_SUMMARIES.length;
    var summary = summaryOverride || AUTO_SUMMARIES[idx];
    F.memory.simIndex++;
    var blocker = checkAutoMemoryAgainstLocks(summary, threadId);
    /* Derived from the summary's own wording, not array position — self
       describing, so reordering AUTO_SUMMARIES can never desync the badge
       from the text again (see the fix that caught this). */
    var trigger = /^Milestone/.test(summary) ? 'milestone' : 'run_boundary';
    var ev = {
      id:afUid('auto'), trigger:trigger, threadId:threadId,
      summary:summary, verification: blocker?'deferred':'unverified',
      blocked: !!blocker, blockedByRecordId: blocker?blocker.id:null, at:nowIso()
    };
    F.memory.auto.push(ev);
    var th=findThread(ctx, threadId);
    if(th){
      if(blocker){
        ctx.appendMessage({ id:afUid('automem'), role:'system', type:'af-auto-memory',
          title:'Automatic memory deferred', detail:'"'+truncateWords(summary,12)+'" overlaps a locked taught record ('+blocker.id+') and was not written over it.', eventId:ev.id, time:nowIso() }, th);
      } else {
        ctx.appendMessage({ id:afUid('automem'), role:'system', type:'af-auto-memory',
          title:'Automatic memory checkpoint', detail:truncateWords(summary,14), eventId:ev.id, time:nowIso() }, th);
      }
    }
    return ev;
  }

  EXT.action('af-memory-open', function(ctx){
    if(ctx.closeMenu) ctx.closeMenu();
    ctx.openDialog({ type:'af-memory' });
    return true;
  });
  EXT.action('af-memory-section', function(ctx, btn){
    ui.memoryOpenSection = btn.dataset.value;
    ctx.renderOverlays();
    return true;
  });
  EXT.action('af-memory-simulate', function(ctx){
    var ev=createAutoMemoryEvent(ctx, ctx.thread.id, null);
    ctx.toast(ev.blocked?'Automatic memory deferred':'Automatic memory recorded', ev.blocked?'A locked taught record took priority. See Memory for detail.':'Verification status: unverified until reviewed.');
    return true;
  });
  EXT.action('af-memory-verify', function(ctx, btn){
    var id=btn.dataset.value;
    for(var i=0;i<F.memory.auto.length;i++){
      if(F.memory.auto[i].id===id){ F.memory.auto[i].verification='verified'; break; }
    }
    ctx.renderOverlays();
    return true;
  });

  /* system-card fallback rendering (renderEventMessage's map does not know
     'af-auto-memory' or 'af-file-mutation', so it falls back to the generic
     info icon + m.title + m.detail — perfectly readable, no card of its own
     needed). This slot only supplies the extra "View memory detail" /
     "Revert" buttons those generic cards do not have built in. */
  EXT.slot('systemCardActions', function(ctx){
    var m=ctx.message; if(!m) return '';
    var icon=ctx.icon;
    if(m.type==='af-auto-memory'){
      return '<button class="soft-button" data-action="af-memory-open">'+icon('eye',12)+' Memory detail</button>';
    }
    if(m.type==='af-teach-receipt'){
      return '<button class="soft-button" data-action="af-memory-open">'+icon('eye',12)+' View taught memory</button>';
    }
    if(m.type==='af-file-mutation'){
      var rec=F.revert.manifests[m.turnMessageId];
      if(!rec) return '';
      return rec.eligible
        ? '<button class="soft-button" data-action="af-revert-preview" data-value="'+ctx.esc(m.turnMessageId)+'">'+icon('changes',12)+' Revert Last Agent Edit</button>'
        : '<button class="soft-button" disabled title="'+ctx.esc(rec.reason)+'">'+icon('changes',12)+' Revert Last Agent Edit</button>';
    }
    return '';
  });

  function renderMemoryDialog(ctx){
    var icon=ctx.icon, e=ctx.esc;
    var taught=F.teach.records.slice().reverse();
    var auto=F.memory.auto.slice().reverse();
    var tabs='<div class="af-tabs" role="tablist">'+
      '<button class="af-tab'+(ui.memoryOpenSection==='taught'?' active':'')+'" role="tab" data-action="af-memory-section" data-value="taught">Taught by you · '+taught.filter(function(r){return !r.revoked;}).length+'</button>'+
      '<button class="af-tab'+(ui.memoryOpenSection==='auto'?' active':'')+'" role="tab" data-action="af-memory-section" data-value="auto">Automatic · '+auto.length+'</button>'+
      '</div>';
    var body='';
    if(ui.memoryOpenSection==='taught'){
      body = taught.length ? taught.map(function(r){
        return '<div class="af-mem-row'+(r.revoked?' is-revoked':'')+'">'+
          '<div class="af-mem-row-head">'+
            (r.locked?'<span class="af-lock-badge">'+icon('lock',11)+' Locked</span>':'')+
            '<span class="af-scope-badge">'+e(scopeLabel(r.scope))+'</span>'+
            (r.revoked?'<span class="af-revoked-badge">Revoked</span>':'')+
            '<span class="spacer"></span><span class="af-mem-time">'+e(dayOf(r.updatedAt))+' '+e(clockOf(r.updatedAt))+'</span>'+
          '</div>'+
          '<p class="af-mem-text">'+e(r.text)+'</p>'+
          '<div class="af-mem-meta">Source: '+e(r.sourceThreadId||'manual capture')+' · secret screen: '+e(r.secretSafety)+(r.supersedes?' · supersedes '+e(r.supersedes):'')+(r.supersededBy?' · superseded by '+e(r.supersededBy):'')+'</div>'+
          (r.revoked?'':'<div class="af-mem-actions">'+
            '<button class="text-button" data-action="af-teach-lock" data-value="'+e(r.id)+'">'+icon(r.locked?'unpin':'lock',11)+' '+(r.locked?'Unlock':'Lock')+'</button>'+
            '<button class="text-button" data-action="af-teach-narrow" data-value="'+e(r.id)+'">'+icon('edit',11)+' Narrow</button>'+
            '<button class="text-button af-danger-text" data-action="af-teach-revoke" data-value="'+e(r.id)+'">'+icon('close',11)+' Revoke</button>'+
          '</div>')+
        '</div>';
      }).join('') : emptyState(icon('sparkles',20),'Nothing taught yet. Use /teach, natural language such as “remember this…”, or the wand.');
    } else {
      body = (auto.length ? auto.map(function(ev){
        return '<div class="af-mem-row'+(ev.blocked?' is-blocked':'')+'">'+
          '<div class="af-mem-row-head"><span class="af-trigger-badge">'+e(ev.trigger==='run_boundary'?'Run boundary':'Milestone')+'</span>'+
          '<span class="af-verify-badge af-verify-'+e(ev.verification)+'">'+e(ev.verification)+'</span>'+
          '<span class="spacer"></span><span class="af-mem-time">'+e(dayOf(ev.at))+' '+e(clockOf(ev.at))+'</span></div>'+
          '<p class="af-mem-text">'+e(ev.summary)+'</p>'+
          (ev.blocked?'<div class="af-mem-meta af-danger-text">Deferred: overlaps locked taught record '+e(ev.blockedByRecordId)+'.</div>'
            :'<div class="af-mem-meta">Thread: '+e(ev.threadId)+'</div>')+
          (ev.verification==='unverified'?'<div class="af-mem-actions"><button class="text-button" data-action="af-memory-verify" data-value="'+e(ev.id)+'">'+icon('check',11)+' Mark verified</button></div>':'')+
        '</div>';
      }).join('') : emptyState(icon('brain',20),'No automatic memory yet.')) +
      '<div class="af-mem-foot"><button class="soft-button" data-action="af-memory-simulate">'+icon('refresh',12)+' Simulate a checkpoint</button></div>';
    }
    var note='<p class="af-note">Taught memory and automatic memory are two different owners on purpose (packet §16.1/§16.3). Automatic memory can never silently overwrite a locked taught record — a deferred event above shows exactly why when that happens.</p>';
    return dialogShell(ctx, { icon:'brain', title:'Memory', pill:(taught.length+auto.length)+' records', body: note+tabs+'<div class="af-mem-list">'+body+'</div>', width:560 });
  }

  EXT.slot('dialog', function(ctx){
    var dlg=ctx.state.dialog; if(!dlg) return '';
    if(dlg.type==='af-teach') return renderTeachDialog(ctx);
    if(dlg.type==='af-memory') return renderMemoryDialog(ctx);
    return '';
  });

  document.addEventListener('input', function(e){
    var t=e.target; if(!t || !t.getAttribute) return;
    if(t.getAttribute('data-af-input')==='teach-text' && F.teach.pending){
      /* No full re-render on every keystroke — a patch mid-keystroke fights the
         caret (the lesson goals.js and composer-state.js both record). Surgical
         DOM updates only: the safety row and the conflict zone. */
      F.teach.pending.text = t.value;
      var safety=screenForSecrets(t.value);
      var row=document.querySelector('.af-safety-row');
      if(row){
        row.className='af-safety-row af-safety-'+safety;
        var span=row.querySelector('span');
        if(span) span.textContent = safety==='clear' ? 'No secrets or credentials detected in this text.' : 'Looks like it includes a credential or secret — capture will be refused.';
      }
      var zone=document.getElementById('af-teach-conflict-zone');
      var c=ctxNow();
      if(zone && c){
        var liveId=(findConflict(F.teach.pending.text, F.teach.pending.scope, F.teach.pending.narrowOf)||{}).id||null;
        F.teach.pending.conflictWith=liveId;
        zone.innerHTML=renderConflictZone(c, liveId?teachRecordById(liveId):null);
      }
    }
  });

  /* Forward references. Sections 6 (ELI5) and 8 (title policy) below assign
     these two module-level vars — a plain closure variable rather than a field
     on RT.features, so a fixture restore (which deletes and repopulates
     RT.features from buildFixture()) can never wipe the wiring. */
  var reconcileImpl = null;
  var titleChipImpl = null;
  function reconcileOnRender(ctx){ if(reconcileImpl) reconcileImpl(ctx); }
  function renderTitleHeaderChip(ctx){ return titleChipImpl ? titleChipImpl(ctx) : ''; }

  /* =====================================================================
     5. ELI5 — packet §16.4 (FEATURE-005, FEATURE-006)
     ---------------------------------------------------------------------
     Independent conversation override + an application default. NOT a
     Persona, NOT a mode — nothing below reads or writes state.persona or
     state.mode. Presentation only: no action in this section ever mutates
     D.artifacts, a message body, a Plan, evidence, or an identifier — the
     one thing it does write to a transcript is the paired preview card
     (af-eli5-demo), and that card renders the SAME fact twice to make
     "presentation only" a visible, checkable claim rather than a promise.
     ===================================================================== */
  function eli5Effective(threadId){
    if(Object.prototype.hasOwnProperty.call(F.eli5.perThread, threadId)) return F.eli5.perThread[threadId];
    return F.eli5.appDefault;
  }
  function eli5HasOverride(threadId){
    return Object.prototype.hasOwnProperty.call(F.eli5.perThread, threadId);
  }
  function eli5Reconcile(ctx){
    ctx.state.capabilities.eli5 = eli5Effective(ctx.thread.id);
  }

  EXT.action('af-eli5-toggle', function(ctx){
    var tid=ctx.thread.id;
    F.eli5.perThread[tid] = !eli5Effective(tid);
    ctx.state.capabilities.eli5 = F.eli5.perThread[tid];
    ctx.renderApp();
    return true;
  });
  EXT.action('af-eli5-reset', function(ctx){
    var tid=ctx.thread.id;
    delete F.eli5.perThread[tid];
    ctx.state.capabilities.eli5 = F.eli5.appDefault;
    ctx.renderApp();
    ctx.toast('Reverted to app default','This thread no longer carries its own ELI5 override.');
    return true;
  });
  EXT.action('af-eli5-demo', function(ctx){
    var th=ctx.thread;
    ctx.appendMessage({ id:afUid('eli5prev'), role:'system', type:'af-eli5-preview',
      code:'CREATE INDEX CONCURRENTLY ix_events_tenant_created\n  ON events (tenant_id, created_at DESC);',
      standard:'Adding a composite index on (tenant_id, created_at DESC) lets the planner satisfy the tenant-scoped recency scan with an index-only range read instead of a filtered sequential scan.',
      simple:'In simple terms: this creates a shortcut that lets the database jump straight to one tenant’s newest rows instead of checking almost every row.',
      time:nowIso() }, th);
    ctx.toast('ELI5 preview added','Same code, same fact — two explanations. The code block is byte-identical in both.');
    return true;
  });
  /* Captures writes made through app.js's own pre-existing "ELI5" wand row
     (state.capabilities.eli5, action set-eli5-cap) into the real per-thread
     model, so using that stale control does not silently diverge from this
     one. Runs BEFORE the native handler and declines — the same technique
     composer-state.js documents for select-thread. See honesty note 1. */
  EXT.chainAction('set-eli5-cap', function(ctx, btn){
    F.eli5.perThread[ctx.thread.id] = (btn.dataset.value==='On');
    return false;
  });

  function eli5WandRows(ctx){
    var icon=ctx.icon;
    var tid=ctx.thread.id;
    var eff=eli5Effective(tid), override=eli5HasOverride(tid);
    var out='<button class="menu-item af-wand-row" data-action="af-eli5-toggle" role="checkbox" aria-checked="'+eff+'">'+
      '<span class="menu-icon">'+icon('sparkles',13)+'</span>'+
      '<span class="menu-copy"><strong>ELI5 (this conversation)</strong>'+
      '<span>Explain simply, presentation only · independent of Persona and mode'+(override?'':' · app default')+'</span></span>'+
      '<span class="af-checkbox'+(eff?' checked':'')+'">'+(eff?icon('check',11):'')+'</span>'+
      '</button>';
    if(override){
      out+='<button class="menu-item af-wand-subrow" data-action="af-eli5-reset">'+
        '<span class="menu-icon"></span><span class="menu-copy"><span>Reset to app default ('+(F.eli5.appDefault?'On':'Off')+')</span></span></button>';
    }
    out+='<button class="menu-item af-wand-subrow" data-action="af-eli5-demo">'+
      '<span class="menu-icon"></span><span class="menu-copy"><span>Preview ELI5 phrasing (same fact, two explanations)</span></span></button>';
    return out;
  }

  /* =====================================================================
     6. REVERT LAST AGENT EDIT — packet §16.6 (FEATURE-009)
     ---------------------------------------------------------------------
     Whole-turn FileSafe mutation manifest, distinct from Rewind (threadops.js
     — conversation-only, non-destructive fold/restore). Revert targets FILES;
     Rewind targets the CONVERSATION. Three deterministic demo turn kinds
     reachable from one wand control, cycling in order: eligible; ineligible
     (nothing to revert); eligible but refused at confirm (currentness
     conflict). No partial multi-file success in any path. See honesty note 3.
     ===================================================================== */
  var REVERT_SEED_SCENARIOS = ['ok','ineligible','conflict'];

  function seedRevertTurn(ctx){
    var kind = REVERT_SEED_SCENARIOS[F.revert.seedIndex % REVERT_SEED_SCENARIOS.length];
    F.revert.seedIndex++;
    var th=ctx.thread;
    var msgId=afUid('agentturn');
    var bodyText, manifest;
    if(kind==='ok'){
      bodyText='Rewrote the tenant-scoped query planner to use the composite index and updated the two call sites that assumed the old row order.';
      manifest={ turnId:msgId, eligible:true, reason:'', state:'idle', failReasonAtConfirm:null,
        files:[
          { path:'src/query/planner.rs', kind:'modified', stat:'+42 -11' },
          { path:'src/query/executor.rs', kind:'modified', stat:'+9 -3' },
          { path:'tests/query_planner_test.rs', kind:'created', stat:'+58' }
        ] };
    } else if(kind==='ineligible'){
      bodyText='Answered a question about the index design. No files were changed for this turn.';
      manifest={ turnId:msgId, eligible:false, reason:'This turn made no file changes — there is nothing for FileSafe to revert.', state:'idle', failReasonAtConfirm:null, files:[] };
    } else {
      bodyText='Added a rollback gate to the migration runner and regenerated the schema snapshot.';
      manifest={ turnId:msgId, eligible:true, reason:'', state:'idle',
        failReasonAtConfirm:'schema_snapshot.json was modified again after this turn by a later change. Whole-turn revert refuses rather than applying to only 1 of 2 files.',
        files:[
          { path:'migrations/runner.rs', kind:'modified', stat:'+21 -4' },
          { path:'schema_snapshot.json', kind:'modified', stat:'+3 -3' }
        ] };
    }
    ctx.appendMessage({ id:msgId, role:'assistant', type:'text', body:bodyText, time:nowIso() }, th);
    F.revert.manifests[msgId]=manifest;
    ctx.appendMessage({ id:afUid('filemut'), role:'system', type:'af-file-mutation',
      title: manifest.eligible ? (manifest.files.length+' file'+(manifest.files.length===1?'':'s')+' changed this turn') : 'No files changed this turn',
      detail: manifest.eligible ? manifest.files.map(function(f){ return f.path; }).join(', ') : manifest.reason,
      turnMessageId: msgId, time:nowIso() }, th);
    return { kind:kind, msgId:msgId };
  }

  function appendRevertResult(ctx, rec, ok){
    ctx.appendMessage({ id:afUid('revertresult'), role:'system', type:'af-revert-result',
      ok:ok, turnId:rec.turnId, files:rec.files.slice(), reason: ok?'':rec.failReasonAtConfirm, time:nowIso() }, ctx.thread);
  }

  EXT.action('af-revert-seed', function(ctx){
    /* The menu must close BEFORE the new card renders. With it open, a real
       mouse click on the freshly-rendered "Revert Last Agent Edit" button
       landed on the wand menu's own row sitting above it -- observed, not
       theorised. */
    ctx.closeMenu && ctx.closeMenu();
    var r=seedRevertTurn(ctx);
    ctx.toast('Demo turn added','Scenario: '+r.kind+'. Open the new card below the turn, or its message "More" menu.');
    return true;
  });
  EXT.action('af-revert-preview', function(ctx, btn){
    var id=btn.dataset.value; var rec=F.revert.manifests[id];
    if(!rec || !rec.eligible) return true;
    rec.state='previewing';
    ctx.openDialog({ type:'af-revert', turnId:id });
    return true;
  });
  EXT.action('af-revert-confirm', function(ctx, btn){
    var id=btn.dataset.value; var rec=F.revert.manifests[id]; if(!rec) return true;
    if(rec.failReasonAtConfirm){
      rec.state='failed';
      appendRevertResult(ctx, rec, false);
      ctx.closeDialog();
      ctx.toast('Revert refused','FileSafe currentness check failed. Zero files were touched.');
      return true;
    }
    rec.state='confirmed';
    for(var i=0;i<rec.files.length;i++){ rec.files[i].reverted=true; }
    appendRevertResult(ctx, rec, true);
    ctx.closeDialog();
    ctx.toast('Reverted', rec.files.length+' file'+(rec.files.length===1?'':'s')+' restored to the pre-turn state.');
    return true;
  });
  EXT.action('af-revert-retry', function(ctx, btn){
    var id=btn.dataset.value; var rec=F.revert.manifests[id]; if(!rec) return true;
    /* Deterministic, never randomised — see honesty note 3. */
    appendRevertResult(ctx, rec, false);
    ctx.toast('Still refused','The conflicting file has not changed since the last check in this demo. A real conflict is resolved by re-running the turn or explicitly accepting the newer file.');
    return true;
  });

  function renderRevertDialog(ctx){
    var icon=ctx.icon, e=ctx.esc;
    var dlg=ctx.state.dialog; var rec=F.revert.manifests[dlg.turnId]; if(!rec) return '';
    var rows=rec.files.map(function(f){
      return '<div class="af-manifest-row"><span class="af-manifest-kind af-kind-'+e(f.kind)+'">'+e(f.kind)+'</span><span class="af-manifest-path">'+e(f.path)+'</span><span class="af-manifest-stat">'+e(f.stat)+'</span></div>';
    }).join('');
    var body='<p class="af-note">FileSafe restores every file in this manifest to its exact pre-turn state, all at once. There is no partial success — either every file reverts or none do.</p>'+
      '<div class="af-manifest-table">'+rows+'</div>'+
      (rec.failReasonAtConfirm ? '<p class="af-note af-danger-text">'+icon('warning',12)+' This demo turn is seeded to fail its currentness check on confirm, so the negative path is reachable on demand. Nothing is touched until you press Confirm.</p>' : '')+
      '<div class="plan-actions"><button class="soft-button" data-action="close-dialog">Cancel</button>'+
      '<button class="primary-button af-danger-btn" data-action="af-revert-confirm" data-value="'+e(dlg.turnId)+'">'+icon('changes',12)+' Revert this turn</button></div>';
    return dialogShell(ctx, { icon:'changes', title:'Revert Last Agent Edit', pill:rec.files.length+' file'+(rec.files.length===1?'':'s'), body:body, width:520 });
  }

  function renderRevertResultCard(ctx, m){
    var icon=ctx.icon, e=ctx.esc;
    var rows=(m.files||[]).map(function(f){
      return '<div class="af-manifest-row"><span class="af-manifest-kind af-kind-'+e(f.kind)+'">'+e(f.kind)+'</span><span class="af-manifest-path">'+e(f.path)+'</span>'+
        (m.ok?'<span class="af-manifest-reverted">'+icon('check',11)+' reverted</span>':'<span class="af-manifest-untouched">untouched</span>')+'</div>';
    }).join('');
    return '<article class="event-card af-card '+(m.ok?'':'warning')+'" data-message-id="'+e(m.id||'')+'">'+
      '<span class="event-icon">'+icon(m.ok?'check-circle':'warning',14)+'</span>'+
      '<div class="event-copy"><strong>'+(m.ok?'Reverted last agent edit':'Revert refused')+'</strong>'+
      '<p>'+(m.ok?'FileSafe restored every file in the manifest to its pre-turn state.':e(m.reason))+'</p>'+
      '<div class="af-manifest-table af-manifest-compact">'+rows+'</div>'+
      (m.ok?'':'<div class="plan-actions"><button class="soft-button" data-action="af-revert-retry" data-value="'+e(m.turnId)+'">'+icon('refresh',12)+' Try again</button></div>')+
      '</div></article>';
  }

  function revertWandRow(ctx){
    var icon=ctx.icon;
    return '<button class="menu-item af-wand-row" data-action="af-revert-seed">'+
      '<span class="menu-icon">'+icon('changes',13)+'</span>'+
      '<span class="menu-copy"><strong>Simulate an agent file edit</strong><span>Adds a demo turn for Revert Last Agent Edit · cycles eligible / ineligible / conflicted</span></span></button>';
  }

  /* =====================================================================
     7. DEBUG / INVESTIGATION CONTEXT — packet §16.5 (FEATURE-007, FEATURE-008)
     ---------------------------------------------------------------------
     Debug's PRIMARY-MODE status is menus.js/app.js's (state.mode — untouched
     here beyond setting it the same way deliverSend's own built-in `/debug`
     branch already does). This section owns the CONTENT: a full eight-phase
     Investigation Context with target binding, baseline, instrumentation,
     reproduction, analysis, repair, verification and cleanup; browser /
     terminal / DAP evidence with redaction (irreversible) and revocation
     (reversible); one deterministic failed-cleanup -> Recover example; and
     bundle export/import.
     ===================================================================== */
  var DEBUG_PHASES = [
    {key:'target', label:'Target binding'},
    {key:'baseline', label:'Baseline capture'},
    {key:'instrumentation', label:'Instrumentation'},
    {key:'reproduction', label:'Reproduction'},
    {key:'analysis', label:'Analysis'},
    {key:'repair', label:'Repair'},
    {key:'verification', label:'Verification'},
    {key:'cleanup', label:'Cleanup'}
  ];

  function evidenceItem(label){ return { id:afUid('ev'), label:label, at:nowIso(), redacted:false, redactedAt:null, revoked:false }; }
  function findEvidence(inv, kind, id){
    var list=(inv.evidence&&inv.evidence[kind])||[];
    for(var i=0;i<list.length;i++){ if(list[i].id===id) return list[i]; }
    return null;
  }
  function guessTargetLabel(th){ return (th && th.title) ? th.title : 'this thread'; }

  function startInvestigation(ctx){
    var th=ctx.thread;
    var inv={
      id:afUid('inv'), threadId:th.id, target:{ kind:'component', label:guessTargetLabel(th) },
      phaseIndex:0, status:'in_progress', attentionReason:null, cleanupAttempts:0,
      evidence:{ browser:[evidenceItem('Bound target: '+guessTargetLabel(th)+'. Currentness hash captured for the bound files.')], terminal:[], dap:[] },
      bundleExportedAt:null, imported:false, createdAt:nowIso(), updatedAt:nowIso()
    };
    F.debug.investigations[inv.id]=inv;
    F.debug.active[th.id]=inv.id;
    if(ctx.state.mode!=='Debug') ctx.state.mode='Debug';
    ctx.appendMessage({ id:afUid('invcard'), role:'system', type:'af-investigation', investigationId:inv.id, time:nowIso() }, th);
    return inv;
  }

  function advanceInvestigation(inv){
    if(inv.status!=='in_progress') return;
    var next=inv.phaseIndex+1;
    if(next>=DEBUG_PHASES.length) return;
    inv.phaseIndex=next;
    inv.updatedAt=nowIso();
    var key=DEBUG_PHASES[next].key;
    if(key==='baseline') inv.evidence.browser.push(evidenceItem('Captured a baseline screenshot of the affected surface before instrumentation.'));
    else if(key==='instrumentation') inv.evidence.terminal.push(evidenceItem('Attached a temporary logging hook to the target execution path.'));
    else if(key==='reproduction') inv.evidence.terminal.push(evidenceItem('Reproduced the reported behaviour 3/3 runs against the bound target.'));
    else if(key==='analysis') inv.evidence.dap.push(evidenceItem('Breakpoint evidence: the faulty path is confirmed taken; the intended fast path is not selected.'));
    else if(key==='repair') inv.evidence.terminal.push(evidenceItem('Applied a targeted repair to the bound files.'));
    else if(key==='verification') inv.evidence.terminal.push(evidenceItem('Reran the reproduction case: behaviour now matches the intended result, 3/3 runs.'));
    else if(key==='cleanup'){
      if(inv.cleanupAttempts===0){
        inv.cleanupAttempts=1;
        inv.status='attention_required';
        inv.attentionReason='The temporary instrumentation hook could not be removed automatically: a bound file changed after instrumentation was attached, so the automatic removal patch no longer applies cleanly.';
        inv.evidence.terminal.push(evidenceItem('Automatic cleanup failed: instrumentation hook still attached.'));
      } else {
        inv.status='complete';
        inv.evidence.terminal.push(evidenceItem('Cleanup complete: instrumentation hook removed, temporary logs discarded.'));
      }
    }
  }
  function recoverInvestigation(inv){
    if(inv.status!=='attention_required') return;
    inv.cleanupAttempts+=1;
    inv.status='complete';
    inv.attentionReason=null;
    inv.updatedAt=nowIso();
    inv.evidence.terminal.push(evidenceItem('Recovery: reconciled the bound file by hand, then removed the instrumentation hook and discarded temporary logs.'));
  }

  EXT.action('af-debug-start', function(ctx){
    ctx.closeMenu && ctx.closeMenu();   /* same reason as af-revert-seed above */
    var inv=startInvestigation(ctx);
    ctx.renderApp();
    ctx.toast('Investigation Context started','Target bound to '+inv.target.label+'. Advance through all eight phases from the card or the wand.');
    return true;
  });
  EXT.action('af-debug-advance', function(ctx, btn){
    var inv=F.debug.investigations[btn.dataset.value]; if(!inv) return true;
    advanceInvestigation(inv);
    ctx.renderApp();
    if(inv.status==='attention_required') ctx.toast('Cleanup needs attention', inv.attentionReason);
    return true;
  });
  EXT.action('af-debug-recover', function(ctx, btn){
    var inv=F.debug.investigations[btn.dataset.value]; if(!inv) return true;
    recoverInvestigation(inv);
    ctx.renderApp();
    ctx.toast('Recovered','Cleanup completed on the second attempt. The investigation is complete.');
    return true;
  });
  EXT.action('af-debug-redact', function(ctx, btn){
    var inv=F.debug.investigations[btn.dataset.value]; if(!inv) return true;
    var it=findEvidence(inv, btn.dataset.kind, btn.dataset.evidence); if(!it) return true;
    it.redacted=true; it.redactedAt=nowIso();
    ctx.renderApp();
    return true;
  });
  EXT.action('af-debug-revoke', function(ctx, btn){
    var inv=F.debug.investigations[btn.dataset.value]; if(!inv) return true;
    var it=findEvidence(inv, btn.dataset.kind, btn.dataset.evidence); if(!it) return true;
    it.revoked=!it.revoked;
    ctx.renderApp();
    return true;
  });
  EXT.action('af-debug-tab', function(ctx, btn){
    ui.debugTab[btn.dataset.value]=btn.dataset.kind;
    ctx.renderApp();
    return true;
  });

  function buildBundle(inv){
    function pack(list){
      return (list||[]).filter(function(it){ return !it.revoked; }).map(function(it){
        return { id:it.id, at:it.at, redacted:!!it.redacted, label: it.redacted ? '[redacted]' : it.label };
      });
    }
    return {
      demo:true, exportedAt:nowIso(), investigationId:inv.id, target:inv.target, status:inv.status,
      phaseIndex:inv.phaseIndex, phases:DEBUG_PHASES.map(function(p){ return p.key; }),
      evidence:{ browser:pack(inv.evidence.browser), terminal:pack(inv.evidence.terminal), dap:pack(inv.evidence.dap) }
    };
  }
  function downloadJson(payload, filename){
    try{
      var blob=new Blob([JSON.stringify(payload,null,2)], { type:'application/json' });
      var url=URL.createObjectURL(blob);
      var link=document.createElement('a');
      link.href=url; link.download=filename; link.style.display='none';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
      return true;
    }catch(err){ return false; }
  }
  EXT.action('af-debug-export-bundle', function(ctx, btn){
    var inv=F.debug.investigations[btn.dataset.value]; if(!inv) return true;
    var ok=downloadJson(buildBundle(inv), 'pm56-investigation-'+inv.id+'.json');
    if(ok){ inv.bundleExportedAt=nowIso(); ctx.renderApp(); ctx.toast('Bundle exported','Redacted evidence excluded its content; revoked evidence excluded entirely.'); }
    else ctx.toast('Export unavailable','This browser blocked the download.');
    return true;
  });
  /* Real FileReader + JSON.parse, real validation, an honest inline error on a
     malformed file rather than a fake success (Hard Rule #3). */
  document.addEventListener('change', function(e){
    var t=e.target; if(!t || !t.getAttribute) return;
    var invKey=t.getAttribute('data-af-import'); if(!invKey) return;
    var file=t.files && t.files[0];
    if(!file) return;
    var reader=new FileReader();
    reader.onload=function(){
      var ctx=ctxNow(); if(!ctx) return;
      var parsed=null;
      try{ parsed=JSON.parse(String(reader.result)); }catch(err){ parsed=null; }
      if(!parsed || !parsed.target || !Array.isArray(parsed.phases)){
        ui.importError[invKey]='That file is not a Puppet Master investigation bundle (missing target/phases).';
        ctx.renderApp();
        return;
      }
      var inv={
        id:afUid('inv'), threadId:ctx.thread.id, target:parsed.target,
        phaseIndex:DEBUG_PHASES.length-1,
        status: parsed.status==='complete' ? 'complete' : 'attention_required',
        attentionReason: parsed.status==='complete' ? null : 'Imported bundle was not marked complete by its source.',
        cleanupAttempts:1,
        evidence:{
          browser:(parsed.evidence && parsed.evidence.browser) || [],
          terminal:(parsed.evidence && parsed.evidence.terminal) || [],
          dap:(parsed.evidence && parsed.evidence.dap) || []
        },
        bundleExportedAt:null, imported:true, createdAt:nowIso(), updatedAt:nowIso()
      };
      F.debug.investigations[inv.id]=inv;
      F.debug.active[ctx.thread.id]=inv.id;
      delete ui.importError[invKey];
      ctx.appendMessage({ id:afUid('invcard'), role:'system', type:'af-investigation', investigationId:inv.id, time:nowIso() }, ctx.thread);
      ctx.renderApp();
      ctx.toast('Bundle imported','Investigation '+inv.id+' created from the imported bundle.');
    };
    reader.onerror=function(){
      var ctx=ctxNow(); if(ctx){ ui.importError[invKey]='Could not read that file.'; ctx.renderApp(); }
    };
    reader.readAsText(file);
    t.value='';
  });

  function renderInvestigationCard(ctx, m){
    var icon=ctx.icon, e=ctx.esc;
    var inv=F.debug.investigations[m.investigationId];
    if(!inv){
      return '<article class="event-card"><span class="event-icon">'+icon('flask',14)+'</span><div class="event-copy"><strong>Investigation Context</strong><p>This investigation was cleared by Reset.</p></div></article>';
    }
    var tab=ui.debugTab[inv.id]||'terminal';
    var phasesHtml=DEBUG_PHASES.map(function(p,i){
      var state = i<inv.phaseIndex ? 'done' : (i===inv.phaseIndex ? (inv.status==='attention_required'&&i===DEBUG_PHASES.length-1?'blocked':'active') : 'pending');
      return '<li class="af-phase af-phase-'+state+'" title="'+e(p.label)+'"><span class="af-phase-dot">'+(state==='done'?icon('check',10):(i+1))+'</span><span class="af-phase-label">'+e(p.label)+'</span></li>';
    }).join('');
    var evTabs='<div class="af-tabs af-evidence-tabs" role="tablist">'+['browser','terminal','dap'].map(function(k){
      var n=(inv.evidence[k]||[]).length;
      return '<button class="af-tab'+(tab===k?' active':'')+'" role="tab" data-action="af-debug-tab" data-value="'+e(inv.id)+'" data-kind="'+k+'">'+k.toUpperCase()+' · '+n+'</button>';
    }).join('')+'</div>';
    var items=inv.evidence[tab]||[];
    var evList = items.length ? items.map(function(it){
      return '<div class="af-evidence-item'+(it.revoked?' is-revoked':'')+(it.redacted?' is-redacted':'')+'">'+
        '<p>'+(it.redacted?'[redacted]':e(it.label))+'</p>'+
        '<div class="af-evidence-actions"><span class="af-mem-time">'+e(clockOf(it.at))+'</span>'+
        (it.redacted?'':'<button class="text-button" data-action="af-debug-redact" data-value="'+e(inv.id)+'" data-kind="'+tab+'" data-evidence="'+e(it.id)+'">'+icon('eyeoff',10)+' Redact</button>')+
        '<button class="text-button" data-action="af-debug-revoke" data-value="'+e(inv.id)+'" data-kind="'+tab+'" data-evidence="'+e(it.id)+'">'+icon('close',10)+' '+(it.revoked?'Unrevoke':'Revoke')+'</button>'+
        '</div></div>';
    }).join('') : '<p class="af-note">No '+tab+' evidence yet.</p>';
    var lifecycle;
    if(inv.status==='attention_required'){
      lifecycle='<div class="af-attention-card">'+icon('warning',13)+'<div><strong>Cleanup needs attention</strong><p>'+e(inv.attentionReason)+'</p></div></div>'+
        '<div class="plan-actions"><button class="primary-button" data-action="af-debug-recover" data-value="'+e(inv.id)+'">'+icon('refresh',12)+' Recover</button></div>';
    } else if(inv.status==='complete'){
      var importId='af-import-'+inv.id;
      lifecycle='<div class="af-complete-card">'+icon('check-circle',13)+'<div><strong>Investigation complete</strong><p>All eight phases finished'+(inv.cleanupAttempts>1?' after one cleanup recovery.':'.')+(inv.imported?' Imported from a bundle.':'')+'</p></div></div>'+
        '<div class="plan-actions"><button class="soft-button" data-action="af-debug-export-bundle" data-value="'+e(inv.id)+'">'+icon('download',12)+' Export bundle</button>'+
        '<label class="soft-button af-file-label" for="'+importId+'" tabindex="0">'+icon('code',12)+' Import bundle</label>'+
        '<input type="file" id="'+importId+'" class="af-visually-hidden" accept="application/json" data-af-import="'+e(inv.id)+'"></div>'+
        (inv.bundleExportedAt?'<p class="af-note">Last exported '+e(dayOf(inv.bundleExportedAt))+' '+e(clockOf(inv.bundleExportedAt))+'.</p>':'')+
        (ui.importError[importId]?'<p class="af-note af-danger-text">'+e(ui.importError[importId])+'</p>':'');
    } else {
      var nextLabel = DEBUG_PHASES[inv.phaseIndex+1] ? DEBUG_PHASES[inv.phaseIndex+1].label : 'Cleanup';
      lifecycle='<div class="plan-actions"><button class="primary-button" data-action="af-debug-advance" data-value="'+e(inv.id)+'">'+icon('play',12)+' Advance: '+e(nextLabel)+'</button></div>';
    }
    return '<article class="system-card af-investigation-card" data-k="af-inv:'+e(inv.id)+'"><div class="system-card-head">'+
      '<span class="event-icon">'+icon('flask',14)+'</span><div><span class="title">Investigation Context</span><span class="sub"> · '+e(inv.target.label)+'</span></div>'+
      '<span class="spacer"></span><span class="meta-pill">'+e(inv.status==='attention_required'?'Attention required':inv.status==='complete'?'Complete':'Phase '+(inv.phaseIndex+1)+'/8')+'</span></div>'+
      '<div class="system-card-body"><ul class="af-phase-list">'+phasesHtml+'</ul>'+evTabs+'<div class="af-evidence-list">'+evList+'</div>'+lifecycle+'</div></article>';
  }

  function debugWandRow(ctx){
    var icon=ctx.icon, e=ctx.esc;
    var invId=F.debug.active[ctx.thread.id];
    var inv=invId?F.debug.investigations[invId]:null;
    if(!inv || inv.status==='complete'){
      return '<button class="menu-item af-wand-row" data-action="af-debug-start">'+
        '<span class="menu-icon">'+icon('flask',13)+'</span>'+
        '<span class="menu-copy"><strong>Start Investigation Context</strong><span>'+(inv?'Previous investigation complete · start another':'Target, baseline, instrumentation, reproduction, analysis, repair, verification, cleanup')+'</span></span></button>';
    }
    var label = inv.status==='attention_required' ? 'Cleanup needs attention · Recover' : 'Advance · phase '+(inv.phaseIndex+1)+'/8';
    var action = inv.status==='attention_required' ? 'af-debug-recover' : 'af-debug-advance';
    return '<button class="menu-item af-wand-row" data-action="'+action+'" data-value="'+e(inv.id)+'">'+
      '<span class="menu-icon">'+icon('flask',13)+'</span>'+
      '<span class="menu-copy"><strong>Investigation Context</strong><span>'+e(label)+'</span></span></button>';
  }

  /* =====================================================================
     8. THREAD TITLE POLICY — packet §2.1 (TITLE-001..006)
     ---------------------------------------------------------------------
     Default resolver / None / explicit available model. Manual rename locks
     auto-title until an explicit Regenerate. No silent fallback when an
     explicit model is unavailable — route eligibility reads the SAME
     D.models[].status the Model picker itself reads (see honesty note 2).
     ===================================================================== */
  function readyModels(){ return (D.models||[]).filter(function(m){ return m.status==='ready'; }); }
  function modelById(id){
    for(var i=0;i<(D.models||[]).length;i++){ if(D.models[i].id===id) return D.models[i]; }
    return null;
  }
  /* Deterministic scorer approximating "eligible local/included, low Usage
     pressure, low latency" (§2.1 default-resolver bullets) from the fields
     this fixture actually carries: ready status is required; `fast:true` is
     the fixture's own low-latency signal; context size is a light proxy for
     a lighter/cheaper route among fast+ready candidates; id is the final,
     fully deterministic tiebreak. The fixture has no local/included field to
     read, so that half of the wording is approximated, not literally
     modelled — recorded here, not left for a reviewer to have to discover. */
  function resolveDefaultTitleModel(){
    var pool=readyModels(); if(!pool.length) return null;
    pool=pool.slice().sort(function(a,b){
      var fa=a.fast?0:1, fb=b.fast?0:1; if(fa!==fb) return fa-fb;
      var ca=a.context||0, cb=b.context||0; if(ca!==cb) return ca-cb;
      return a.id<b.id?-1:(a.id>b.id?1:0);
    });
    return pool[0];
  }
  function resolveTitleRoute(){
    if(F.title.policy==='none') return { ok:false, skip:true, reason:'Title policy is None.' };
    if(F.title.policy==='default'){
      var m=resolveDefaultTitleModel();
      return m ? { ok:true, model:m } : { ok:false, reason:'No configured route is currently ready.' };
    }
    var id=F.title.policy.indexOf('model:')===0 ? F.title.policy.slice(6) : '';
    var m2=modelById(id);
    if(!m2) return { ok:false, reason:'The configured model ('+id+') is no longer in the roster.' };
    if(m2.status!=='ready') return { ok:false, reason:(m2.name||id)+' · '+(m2.account||m2.provider||'')+' — '+(m2.statusDetail||m2.statusLabel||m2.status) };
    return { ok:true, model:m2 };
  }
  function firstUserMessageWithText(thread){
    if(!thread || !thread.messages) return null;
    for(var i=0;i<thread.messages.length;i++){
      var m=thread.messages[i];
      if(m.role==='user' && typeof m.body==='string' && m.body.trim()) return m;
    }
    return null;
  }
  /* TITLE-004: a bounded safe excerpt plus safe attachment LABELS only —
     never a whole message, never an attachment body, never a secret. */
  function buildTitleInput(thread){
    var m=firstUserMessageWithText(thread);
    var labels=[];
    if(m && Array.isArray(m.attachments)){
      for(var i=0;i<m.attachments.length;i++){
        var a=m.attachments[i], label=a && (a.name||a.label||a.filename);
        if(label) labels.push(String(label));
      }
    }
    return { excerpt: m?safeExcerpt(m.body,100):'', attachmentLabels:labels };
  }
  /* A deterministic, local, non-random text transform — NOT a real provider
     call. See honesty note 2: this is disclosed in the Settings dialog and
     in the title attempt log rather than presented as a live generation. */
  function simulateTitleText(inputText){
    var t=truncateWords(inputText,6).replace(/[.,;:!?…]+$/,'');
    if(!t) return '';
    return t.charAt(0).toUpperCase()+t.slice(1);
  }
  function logAttempt(threadId, entry){
    F.title.attempts[threadId]=F.title.attempts[threadId]||[];
    F.title.attempts[threadId].push(entry);
    if(F.title.attempts[threadId].length>12) F.title.attempts[threadId].shift();
  }
  /* Repaint AFTER the current render finishes. Anything reachable from a
     commitHook must use this rather than calling renderApp() directly. */
  var deferArmed=false;
  function deferRender(){
    if(deferArmed) return;
    deferArmed=true;
    setTimeout(function(){ deferArmed=false; var c=ctxNow(); if(c) c.renderApp(); }, 0);
  }
  function attemptTitleGeneration(ctx, thread, opts){
    opts=opts||{};
    var route=resolveTitleRoute();
    if(route.skip){ logAttempt(thread.id, { at:nowIso(), policy:F.title.policy, outcome:'skipped_none' }); return; }
    if(!route.ok){
      /* TITLE-003: no silent fallback. Title stays exactly what it was. */
      logAttempt(thread.id, { at:nowIso(), policy:F.title.policy, outcome:'unavailable', reason:route.reason });
      /* DEFERRED, not synchronous. This runs from a commitHook, and that hook
         is invoked by composer-state.js's reconcile() during the composerBelow
         slot -- i.e. from inside a render that has not finished. A nested
         renderApp() here is overwritten by the outer pass as it completes, so
         the state was right and the "Title unavailable" chip never survived to
         the screen. One turn of the event loop puts the repaint after the
         render that is already running. */
      deferRender();
      return;
    }
    var input=buildTitleInput(thread);
    var titleText=simulateTitleText(input.excerpt || (input.attachmentLabels[0]||''));
    if(!titleText){
      logAttempt(thread.id, { at:nowIso(), policy:F.title.policy, outcome:'no_input', reason:'No safe excerpt is available yet.' });
      return;
    }
    var routeLabel=route.model.name+' · '+(route.model.account||route.model.provider||'');
    F.title.pending[thread.id]=true;
    logAttempt(thread.id, { at:nowIso(), policy:F.title.policy, outcome:'pending', route:routeLabel, titleText:titleText });
    var delay = opts.delayMs!=null ? opts.delayMs : (380+Math.floor(Math.random()*260));
    setTimeout(function(){
      var c=ctxNow(); if(!c) return;
      delete F.title.pending[thread.id];
      var th=findThread(c, thread.id); if(!th){ c.renderApp(); return; }
      if(F.title.locks[thread.id]){
        /* TITLE-006: a manual rename that happened while this was in flight
           always wins. The generated text is discarded, not applied. */
        logAttempt(thread.id, { at:nowIso(), policy:F.title.policy, outcome:'skipped_locked', reason:'A manual rename happened before this generation resolved.' });
        c.renderApp();
        return;
      }
      th.title=titleText;
      logAttempt(thread.id, { at:nowIso(), policy:F.title.policy, outcome:'generated', titleText:titleText, route:routeLabel });
      c.renderApp();
    }, delay);
  }
  var titleRenderScheduled=false;
  /* Normalises a brand-new thread's built-in default title ('Untitled
     thread', from app.js's native new-thread branch) to the packet's
     'New chat' (§2.1.1). Runs at render time — see honesty note 5 for why
     there is no action hook to do this instead. One-time per thread id. */
  function titleReconcile(ctx){
    var t=ctx.thread; if(!t) return;
    if(t.title==='Untitled thread' && (!t.messages||!t.messages.length) && !F.title.normalizedThreads[t.id]){
      F.title.normalizedThreads[t.id]=true;
      t.title='New chat';
      if(!titleRenderScheduled){
        titleRenderScheduled=true;
        requestAnimationFrame(function(){ titleRenderScheduled=false; var c=ctxNow(); if(c) c.renderApp(); });
      }
    }
  }
  function policyDescription(p){
    if(p==='default') return 'New threads will title using the deterministic default resolver.';
    if(p==='none') return 'New threads stay "New chat" until manually renamed.';
    var id=p.indexOf('model:')===0?p.slice(6):''; var m=modelById(id);
    if(!m) return 'That model is not in the current roster.';
    return m.status==='ready' ? 'New threads will title using '+m.name+' · '+(m.account||m.provider)+'.'
      : m.name+' · '+(m.account||m.provider)+' is currently unavailable: '+(m.statusDetail||m.statusLabel||m.status)+'. No silent fallback — titles stay "New chat" until this changes.';
  }

  EXT.chainAction('save-thread-name', function(ctx){
    var tid=ctx.state.dialog && ctx.state.dialog.threadId;
    if(tid) F.title.locks[tid]=true;
    return false;
  });
  EXT.action('af-title-regenerate', function(ctx, btn){
    var t=findThread(ctx, btn.dataset.value); if(!t) return true;
    if(F.title.policy==='none'){ ctx.toast('Nothing to generate','Title policy is set to None.'); return true; }
    delete F.title.locks[t.id];
    attemptTitleGeneration(ctx, t, { delayMs:260 });
    ctx.renderApp();
    ctx.toast('Regenerating title','Using the configured title policy. This clears the manual-rename lock.');
    return true;
  });
  EXT.action('af-settings-open', function(ctx){
    if(ctx.closeMenu) ctx.closeMenu();
    ctx.openDialog({ type:'af-settings' });
    return true;
  });
  EXT.action('af-title-set-policy', function(ctx, btn){
    F.title.policy=btn.dataset.value;
    ctx.renderOverlays();
    ctx.toast('Title policy updated', policyDescription(F.title.policy));
    return true;
  });
  EXT.action('af-title-race-demo', function(ctx){
    var t=ctx.thread;
    delete F.title.locks[t.id];
    t.title='New chat';
    attemptTitleGeneration(ctx, t, { delayMs:900 });
    setTimeout(function(){
      var c=ctxNow(); if(!c) return;
      var th=findThread(c, t.id); if(!th) return;
      th.title='Renamed while generating';
      F.title.locks[th.id]=true;
      logAttempt(th.id, { at:nowIso(), policy:F.title.policy, outcome:'manual_rename_race', reason:'Renamed by the user while a generation was in flight.' });
      c.renderApp();
    }, 250);
    ctx.renderApp();
    ctx.toast('Race demo started','A generation is in flight (~900ms). In ~250ms this thread is manually renamed while it runs — watch the late generation get discarded instead of overwriting your rename.');
    return true;
  });

  EXT.slot('threadMenu', function(ctx){
    var icon=ctx.icon, e=ctx.esc;
    var t=ctx.thread; if(!t) return '';
    var locked=!!F.title.locks[t.id], pending=!!F.title.pending[t.id];
    var attempts=F.title.attempts[t.id]||[];
    var last=attempts.length?attempts[attempts.length-1]:null;
    var statusText;
    if(pending) statusText='Generating…';
    else if(locked) statusText='Locked by manual rename';
    else if(F.title.policy==='none') statusText='Policy: None';
    else if(last && last.outcome==='unavailable') statusText='Unavailable — '+last.reason;
    else if(last && last.outcome==='skipped_locked') statusText='Late generation discarded (manual rename won)';
    else if(last && last.outcome==='generated') statusText='Auto · '+last.route;
    else statusText='Policy: '+(F.title.policy==='default'?'Default resolver':F.title.policy);
    var canRegen=F.title.policy!=='none';
    return '<div class="af-menu-divider"></div>'+
      '<div class="af-menu-note">'+icon('document',12)+'<span>Title: '+e(statusText)+'</span></div>'+
      '<button class="menu-item" data-action="af-title-regenerate" data-value="'+e(t.id)+'"'+(canRegen?'':' disabled')+'>'+
      '<span class="menu-icon">'+icon('refresh',13)+'</span><span class="menu-copy"><strong>Regenerate title</strong><span>'+(canRegen?'Clears the manual-rename lock':'Title policy is set to None')+'</span></span></button>';
  });

  function modelPickerRows(ctx){
    var icon=ctx.icon, e=ctx.esc;
    var current=F.title.policy.indexOf('model:')===0?F.title.policy.slice(6):null;
    return (D.models||[]).map(function(m){
      var active=current===m.id, ready=m.status==='ready';
      return '<button class="menu-item'+(active?' active':'')+'" data-action="af-title-set-policy" data-value="model:'+e(m.id)+'">'+
        '<span class="menu-copy"><strong>'+e(m.name)+'</strong><span>'+e(m.account||m.provider)+(ready?'':' — Unavailable: '+e(m.statusDetail||m.statusLabel||m.status))+'</span></span>'+
        (active?'<span class="check">'+icon('check',12)+'</span>':'')+'</button>';
    }).join('');
  }
  function renderSettingsDialog(ctx){
    var icon=ctx.icon, e=ctx.esc;
    var tid=ctx.thread.id;
    var attempts=(F.title.attempts[tid]||[]).slice(-3).reverse();
    var body='<h3 class="af-settings-h3">ELI5 default</h3>'+
      '<label class="af-toggle-row"><input type="checkbox" data-af-input="eli5-default"'+(F.eli5.appDefault?' checked':'')+'>'+
      '<span>Explain simply by default in new conversations</span></label>'+
      '<p class="af-note">Any thread can still set its own override from the wand.</p>'+
      '<h3 class="af-settings-h3">Thread titles</h3>'+
      '<div class="af-policy-rows af-scroll-rows">'+
      '<button class="menu-item'+(F.title.policy==='default'?' active':'')+'" data-action="af-title-set-policy" data-value="default"><span class="menu-copy"><strong>Default resolver</strong><span>Deterministic: ready + fast route, smallest context, then id</span></span>'+(F.title.policy==='default'?'<span class="check">'+icon('check',12)+'</span>':'')+'</button>'+
      '<button class="menu-item'+(F.title.policy==='none'?' active':'')+'" data-action="af-title-set-policy" data-value="none"><span class="menu-copy"><strong>None</strong><span>Stays "New chat" until you rename it</span></span>'+(F.title.policy==='none'?'<span class="check">'+icon('check',12)+'</span>':'')+'</button>'+
      modelPickerRows(ctx)+
      '</div>'+
      '<p class="af-note">'+e(policyDescription(F.title.policy))+'</p>'+
      '<h3 class="af-settings-h3">Demonstrations · this thread</h3>'+
      '<div class="plan-actions"><button class="soft-button" data-action="af-title-regenerate" data-value="'+e(tid)+'">'+icon('refresh',12)+' Regenerate this title</button>'+
      '<button class="soft-button" data-action="af-title-race-demo">'+icon('warning',12)+' Late-generation race</button></div>'+
      (attempts.length?'<div class="af-attempt-log">'+attempts.map(function(a){
        return '<div class="af-attempt-row"><span class="af-attempt-outcome af-outcome-'+e(a.outcome)+'">'+e(a.outcome)+'</span><span>'+e(a.reason||a.titleText||'')+'</span><span class="af-mem-time">'+e(clockOf(a.at))+'</span></div>';
      }).join('')+'</div>':'');
    return dialogShell(ctx, { icon:'settings', title:'Assistant defaults', body:body, width:560 });
  }

  document.addEventListener('change', function(e){
    var t=e.target; if(!t || !t.getAttribute) return;
    if(t.getAttribute('data-af-input')==='eli5-default'){
      F.eli5.appDefault=!!t.checked;
      var c=ctxNow(); if(c){ eli5Reconcile(c); c.renderApp(); }
    }
  });

  /* =====================================================================
     9. WIRING — commit hooks, consolidated dialog/transcript/wand slots,
        reconciler assembly, reset-all chain
     ===================================================================== */
  function teachCommitHook(ctx, thread, message){
    if(!message || message.role!=='user' || typeof message.body!=='string') return;
    if(!TEACH_TRIGGER_RX.test(message.body)) return;
    var text=message.body.replace(/^\s*\/teach\b\s*/i,'').trim();
    if(!text) return;
    openTeachCapture(ctx, { text:text, scope:'thread', sourceThreadId:thread.id, sourceMessageId:message.id });
  }
  function memoryCommitHook(ctx, thread){
    var n=userMessageCount(thread);
    if(n>0 && n%6===0) createAutoMemoryEvent(ctx, thread.id, null);
  }
  function titleCommitHook(ctx, thread){
    if(F.title.locks[thread.id]) return;
    if(thread.title!=='New chat' && thread.title!=='Untitled thread') return;
    if(userMessageCount(thread)!==1) return;
    attemptTitleGeneration(ctx, thread, {});
  }
  if(RT.composer && RT.composer.commitHooks && RT.composer.commitHooks.push){
    RT.composer.commitHooks.push(function(ctx, thread, message){
      try{ teachCommitHook(ctx, thread, message); }catch(err){ console.error('PM56 assistant-features teachCommitHook threw', err); }
      try{ memoryCommitHook(ctx, thread, message); }catch(err){ console.error('PM56 assistant-features memoryCommitHook threw', err); }
      try{ titleCommitHook(ctx, thread, message); }catch(err){ console.error('PM56 assistant-features titleCommitHook threw', err); }
    });
  }

  function renderEli5PreviewCard(ctx, m){
    var icon=ctx.icon, e=ctx.esc;
    return '<article class="system-card af-eli5-card"><div class="system-card-head">'+
      '<span class="event-icon">'+icon('sparkles',14)+'</span><div><span class="title">ELI5 preview</span><span class="sub"> · same fact, two explanations</span></div></div>'+
      '<div class="system-card-body">'+
      '<div class="af-eli5-pair"><div class="af-eli5-col"><label>Standard</label><p>'+e(m.standard)+'</p></div>'+
      '<div class="af-eli5-col af-eli5-simple"><label>'+icon('sparkles',11)+' ELI5</label><p>'+e(m.simple)+'</p></div></div>'+
      '<label class="af-field-label">Code (byte-identical either way)</label>'+
      '<pre class="af-code-block"><code>'+e(m.code)+'</code></pre>'+
      '<p class="af-note">ELI5 changes explanation style only. Nothing here — including this code block — differs between the two columns.</p>'+
      '</div></article>';
  }

  EXT.slot('dialog', function(ctx){
    var dlg=ctx.state.dialog; if(!dlg) return '';
    if(dlg.type==='af-revert') return renderRevertDialog(ctx);
    if(dlg.type==='af-settings') return renderSettingsDialog(ctx);
    return '';
  });

  EXT.slot('wandRows', function(ctx){
    var icon=ctx.icon;
    return eli5WandRows(ctx) + revertWandRow(ctx) + debugWandRow(ctx) +
      '<button class="menu-item af-wand-row" data-action="af-memory-open"><span class="menu-icon">'+icon('brain',13)+'</span>'+
      '<span class="menu-copy"><strong>Memory</strong><span>Taught (lock-aware) and automatic — two owners, one panel</span></span></button>'+
      '<button class="menu-item af-wand-row" data-action="af-teach-open"><span class="menu-icon">'+icon('sparkles',13)+'</span>'+
      '<span class="menu-copy"><strong>Teach Puppet Master…</strong><span>Durable memory capture · /teach or natural language. Not the Teacher Persona.</span></span></button>'+
      '<button class="menu-item af-wand-row" data-action="af-settings-open"><span class="menu-icon">'+icon('settings',13)+'</span>'+
      '<span class="menu-copy"><strong>Assistant defaults…</strong><span>ELI5 default and thread-title policy</span></span></button>';
  });

  /* transcriptMessage extra is {m,t} — NOT {message:m} like messageOverflow /
     systemCardActions. Every type this file does not own declines with ''. */
  EXT.slot('transcriptMessage', function(ctx){
    var m=ctx.m; if(!m) return '';
    if(m.type==='af-investigation') return renderInvestigationCard(ctx, m);
    if(m.type==='af-revert-result') return renderRevertResultCard(ctx, m);
    if(m.type==='af-eli5-preview') return renderEli5PreviewCard(ctx, m);
    return '';
  });

  /* transcript.js's own per-message operations registry — the sanctioned way
     to add a "More" row without rendering a second overflow button (see
     transcript.js's header comment, section "overflow row"). */
  if(window.PM56_MSG_OVERFLOW && window.PM56_MSG_OVERFLOW.register){
    window.PM56_MSG_OVERFLOW.register(function(ctx, m){
      if(m.role!=='assistant') return null;
      var rec=F.revert.manifests[m.id]; if(!rec) return null;
      return [{
        id:'af-revert', label:'Revert Last Agent Edit',
        detail: rec.eligible ? (rec.files.length+' file'+(rec.files.length===1?'':'s')+' changed this turn') : rec.reason,
        icon:'changes', action: rec.eligible ? 'af-revert-preview' : '', value:m.id,
        danger:true, disabled: !rec.eligible, reason: rec.eligible ? '' : rec.reason
      }];
    });
  }

  reconcileImpl = function(ctx){ eli5Reconcile(ctx); titleReconcile(ctx); };
  titleChipImpl = function(ctx){
    var icon=ctx.icon, e=ctx.esc, th=ctx.thread; if(!th) return '';
    var locked=!!F.title.locks[th.id], pending=!!F.title.pending[th.id];
    var attempts=F.title.attempts[th.id]||[];
    var last=attempts.length?attempts[attempts.length-1]:null;
    if(pending) return '<button class="af-chip af-chip-pending" data-action="af-settings-open" title="Generating a title using the configured route…">'+icon('refresh',12)+'<b>Titling…</b></button>';
    if(locked) return '<button class="af-chip af-chip-locked" data-action="af-settings-open" title="Manually renamed. Auto-title is locked until Regenerate title (thread menu).">'+icon('lock',12)+'<b>Title locked</b></button>';
    if(last && last.outcome==='unavailable') return '<button class="af-chip af-chip-warn" data-action="af-settings-open" title="'+e('Title route unavailable: '+last.reason)+'">'+icon('warning',12)+'<b>Title unavailable</b></button>';
    return '';
  };

  EXT.chainAction('reset-all', function(){
    restoreFixture();
    return false;
  });

  window.PM56_FEATURES = {
    restore: restoreFixture,
    fixture: function(){ return buildFixture(); },
    state: function(){ return RT.features; }
  };
})();
