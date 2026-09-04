/* composer-state.js — feature module.  OWNER: Assistant-redesign wave (2026-09-03) —
 * composer state agent.  Covers FinalGUISpec §4 (Composer) and packet
 * 01_IMPLEMENTATION_SPEC §2.2 invisible persistence, §2.3 input history,
 * §2.4 passive spellcheck, §2.5 visual destination targeting, plus
 * 04_GUI_IMPACTS §5.3 destination state and §5.5 quota wait strip.
 *
 * THIS FILE OWNS THE SHARED COMPOSER CONTRACT
 * -------------------------------------------
 *   window.PM56_RUNTIME.composer = { buffers, destination, history, historyIndex }
 * plans.js, collaboration.js and browser-capture.js target the composer with
 *     RT.composer.destination = {kind,label,detail,refId,glyph}; ctx.renderApp();
 * and clear it with `RT.composer.destination = null` or by running the
 * `clear-destination` action.  They must NOT render their own ribbon; this
 * module renders `composerRibbon` and owns `clear-destination`.
 * build.py loads composer-state FIRST of the new module set for that reason.
 *
 * WHAT THIS FILE IS HONEST ABOUT
 * ------------------------------
 * 1. NO DRAFT UI.  §2.2 removes `Draft`, `Save Draft`, `Restore Draft`, draft
 *    history, badges and restore icons from the product.  Persistence here is
 *    invisible: text and attachments come back on thread switch and on reload
 *    with no banner, no toast and no control.  app.js's `restore-draft` button
 *    was deleted by the integrator; this module does not reintroduce it and
 *    does not read `state.draftHistory`.
 * 2. THE THREAD-SWITCH HOOK IS A RENDER-TIME RECONCILER, NOT AN ACTION CHAIN.
 *    The concept has no `switch-thread` action -- the button is
 *    `select-thread`, and six other paths (`new-thread`, `fork-thread`,
 *    `jump-search-result`, nineteen demo triggers, `reset-all`, boot) call the
 *    internal `switchThread()` directly, where no extension point exists.
 *    Chaining one action would silently miss all of them, so the restore runs
 *    from the `composerBelow` slot, which renderComposer evaluates on every
 *    render and BEFORE it interpolates `state.composer` into the textarea.
 *    `select-thread` is still chained, but only to FLUSH before the switch.
 * 3. THE DESTINATION GLYPH SITS AT THE RIBBON'S LEADING EDGE.  §2.5 asks for an
 *    illuminated destination glyph beside the capability glyphs inside the
 *    field.  `.composer-infield-l` has no extension slot and injecting a node
 *    there by hand would be deleted by the next pmPatch (it removes unmatched
 *    children).  The glyph is therefore rendered inside the ribbon, adjacent to
 *    the field, illuminated with the destination accent, and it is the control
 *    that opens the eligible-destination list -- the behaviour is intact, the
 *    position differs by one row.  Recorded here rather than left to be found.
 * 4. SPELLCHECK IS RE-ASSERTED AFTER EVERY PATCH.  pmSyncAttrs removes any
 *    attribute the template does not carry, and `spellcheck` is not in
 *    renderComposer's markup, so a one-shot set would be stripped on the next
 *    work tick.  A rAF pass after each render (plus focus/input) re-asserts it.
 *    Nothing else is done: no icon, no control, no provider call.
 * 5. THE QUOTA STRIP NEVER INVENTS A RESET TIME.  When `resetSource` is
 *    `unknown` the strip prints the word `unknown`, suppresses the countdown
 *    entirely, and offers a field for the user to supply one -- which then
 *    reads `user supplied`, not `provider reported`.
 *
 * EXTENSION POINTS OTHER MODULES MAY USE
 * --------------------------------------
 *   RT.composer.destinationProviders.push(fn)  -> fn(ctx) => [destination,…]
 *        contributes rows to the eligible-destination picker.
 *   RT.composer.historyBlockers.push(fn)       -> fn(ctx,threadId) => truthy
 *        vetoes Up/Down recall while that module has ambiguous pending state
 *        (browser-capture's region selection, for example).
 *   RT.composer.commitHooks.push(fn)           -> fn(ctx,thread,message,buffer)
 *        runs once, after a send has been admitted to the transcript and
 *        before the buffer is cleared.  attachments.js uses it to move tray
 *        attachments onto the message that was just sent.
 */
(function () {
  'use strict';

  var D = window.PM56_DATA;
  if (!D) return;
  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;

  /* =====================================================================
     0. THE SHARED CONTRACT
     ===================================================================== */
  var RT = window.PM56_RUNTIME = window.PM56_RUNTIME || {};
  RT.composer = RT.composer || { buffers: {}, destination: null, history: {}, historyIndex: {} };

  var C = RT.composer;
  /* Defensive: a module that loaded first may have created a partial object. */
  C.buffers = C.buffers || {};
  C.history = C.history || {};
  C.historyIndex = C.historyIndex || {};
  if (!('destination' in C)) C.destination = null;
  C.destinationProviders = C.destinationProviders || [];
  C.historyBlockers = C.historyBlockers || [];
  C.commitHooks = C.commitHooks || [];
  /* Pre-send claim hooks. app.js's deliverSend consults these BEFORE the user
     message is admitted, so a module can hold a submission rather than let it
     reach the provider. See MODAL-012. */
  C.preSendHooks = C.preSendHooks || [];
  C.version = 1;

  /* =====================================================================
     1. STORAGE — same shape as app.js's savePrefs / safeStorage
     ---------------------------------------------------------------------
     safeStorage is a const inside app.js's IIFE and is not on ctx, so the
     pattern is reproduced rather than imported: every access is wrapped, a
     blocked or full localStorage degrades to in-memory persistence instead
     of throwing through a keystroke handler.
     ===================================================================== */
  var STORE_KEY = 'pm56-composer-buffers.v1';
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { } }
  };

  var PENDING_STATES = { selected: 1, resolving: 1, uploading: 1, scanning: 1, extracting: 1 };

  function nowIso() { return new Date().toISOString(); }

  function emptyBuffer(tid) {
    /* pm.chat.composer_buffer.v1, reduced to what a concept can honestly hold.
       Field names follow the packet so a reader can line the two up. */
    return {
      thread_id: tid,
      text: '',
      attachments: [],
      browser_context_refs: [],
      destination: null,
      cursor_position: null,
      /* MODAL-011/012. A Deep Plan BrainStorm chosen BEFORE submission, and a
         natural-language BrainStorm request held before provider dispatch,
         both live here with the text they belong to -- not in the modal, and
         not as a started run. The buffer already survived thread switches and
         reload, so putting the configuration beside the text is what makes
         "restores config with text" true rather than asserted, and what makes
         Cancel able to return the request intact.
           workflow_config : the validated pre-send configuration
           held_request    : the natural-language request being held
         Both are null for an ordinary message. */
      workflow_config: null,
      held_request: null,
      revision: 0,
      updated_at: null
    };
  }

  function bufferFor(tid) {
    if (!tid) tid = '__none__';
    if (!C.buffers[tid]) C.buffers[tid] = emptyBuffer(tid);
    var b = C.buffers[tid];
    if (!Array.isArray(b.attachments)) b.attachments = [];
    if (!Array.isArray(b.browser_context_refs)) b.browser_context_refs = [];
    if (typeof b.text !== 'string') b.text = '';
    return b;
  }
  C.bufferFor = bufferFor;

  function isEmptyBuffer(b) {
    return !b || (!b.text && !(b.attachments && b.attachments.length) && !b.destination);
  }

  function persist() {
    var out = {};
    var any = false;
    for (var k in C.buffers) {
      var b = C.buffers[k];
      if (isEmptyBuffer(b)) continue;
      out[k] = b;
      any = true;
    }
    if (!any) { store.del(STORE_KEY); return; }
    try {
      store.set(STORE_KEY, JSON.stringify({ v: 1, savedAt: nowIso(), buffers: out }));
    } catch (err) {
      /* A circular or oversized attachment record must not kill the keystroke
         path; the in-memory buffer still works for this session. */
      console.info('PM56 composer-state: buffers not persisted this tick', err);
    }
  }
  C.persist = persist;

  var persistTimer = null;
  function schedulePersist() {
    /* §2.2 "persist with short debounce while typing". */
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(function () { persistTimer = null; persist(); }, 180);
  }
  C.touch = schedulePersist;

  function flush() {
    if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
    persist();
  }
  C.flush = flush;

  (function loadBuffers() {
    var raw = store.get(STORE_KEY);
    if (!raw) return;
    var parsed = null;
    try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
    if (!parsed || !parsed.buffers) return;
    for (var k in parsed.buffers) {
      var b = parsed.buffers[k];
      if (!b || typeof b !== 'object') continue;
      var fresh = emptyBuffer(k);
      fresh.text = typeof b.text === 'string' ? b.text : '';
      fresh.attachments = Array.isArray(b.attachments) ? b.attachments : [];
      fresh.browser_context_refs = Array.isArray(b.browser_context_refs) ? b.browser_context_refs : [];
      fresh.destination = b.destination || null;
      fresh.cursor_position = typeof b.cursor_position === 'number' ? b.cursor_position : null;
      fresh.revision = typeof b.revision === 'number' ? b.revision : 0;
      fresh.updated_at = b.updated_at || null;
      C.buffers[k] = fresh;
    }
  })();

  /* =====================================================================
     2. FIXTURES
     ===================================================================== */

  /* 2a. Eligible destinations.  plans.js / collaboration.js / browser-capture.js
     set RT.composer.destination directly; these rows only exist so the ribbon
     and its picker are reachable when this module is read on its own, and so a
     reviewer can see every destination_kind in 02_RUNTIME §2.2. */
  D.composerDestinations = D.composerDestinations || {
    demo: true,
    source: 'composer-state.js',
    note: 'Demo destinations. Live rows come from the collaboration and plan modules through RT.composer.destinationProviders.',
    items: [
      { id: 'bs-provider-arch', kind: 'workflow', destinationKind: 'brainstorm',
        label: 'BrainStorm · Provider Architecture', detail: '4 participants',
        refId: 'bs-1', glyph: 'users' },
      { id: 'bs-provider-arch:ana', kind: 'participant', destinationKind: 'brainstorm',
        label: 'Provider Architecture → Ana Ruiz', detail: 'direct to participant',
        refId: 'bs-1', participantId: 'p-ana', glyph: 'users' },
      { id: 'crew-query-perf', kind: 'workflow', destinationKind: 'crew',
        label: 'Crew · Query Performance', detail: '3 agents · coordinator',
        refId: 'crew-1', glyph: 'users' },
      { id: 'review-0043', kind: 'workflow', destinationKind: 'review',
        label: 'Review · Migration 0043', detail: '2 reviewers · frozen',
        refId: 'rev-1', glyph: 'eye' },
      { id: 'room-release', kind: 'workflow', destinationKind: 'chat_room',
        label: 'Chat Room · Release War Room', detail: '6 present',
        refId: 'room-1', glyph: 'brain' },
      { id: 'plan-query-revise', kind: 'plan-revise', destinationKind: 'plan_revision',
        label: 'Revising Plan · V5', detail: 'feedback to the revision agent',
        refId: 'plan-query', glyph: 'document' },
      { id: 'components-migration', kind: 'component-list', destinationKind: 'assistant',
        label: 'Component list · Migration 0043', detail: '7 components selected',
        refId: 'cl-1', glyph: 'code' }
    ]
  };

  /* 2b. Quota wait.  Four reset-time sources, all reachable from the wand menu,
     because the honest one (`unknown`) is the one a mock normally hides. */
  var QUOTA_SOURCES = ['provider reported', 'locally inferred', 'user supplied', 'unknown'];

  D.quotaWait = D.quotaWait || {
    demo: true,
    source: 'composer-state.js',
    sources: QUOTA_SOURCES.slice(),
    fixture: {
      waiting: false,
      reason: 'Usage exhausted',
      scope: 'Anthropic work account',
      resetAt: '10:00 PM',
      resetInMinutes: 192,
      resetSource: 'provider reported',
      resumeAutomatically: false,
      userResetInput: ''
    }
  };

  RT.quota = RT.quota || JSON.parse(JSON.stringify(D.quotaWait.fixture));

  /* =====================================================================
     3. SMALL HELPERS
     ===================================================================== */
  function ctxNow() {
    /* app.js publishes extCtx as EXT.ctx once it boots.  state is reassigned
       wholesale by reset-all, so never cache the returned object. */
    return (EXT && typeof EXT.ctx === 'function') ? EXT.ctx() : null;
  }
  function threadById(ctx, id) {
    var list = (ctx && ctx.state && ctx.state.threads) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function composerEl() { return document.querySelector('textarea[data-input="composer"]'); }

  function destAccentVar(kind) {
    /* Never a literal colour: every destination reuses an existing theme token. */
    if (kind === 'plan-revise') return 'warning';
    if (kind === 'participant') return 'positive';
    if (kind === 'component-list') return 'accent';
    return 'accent-2';
  }

  function splitDetail(detail) {
    /* §5.3 "participant cluster may collapse to workflow icon + count".
       `4 participants` -> short `4`; anything else has no short form. */
    var m = /^\s*(\d[\d,]*)\s+\S/.exec(String(detail || ''));
    return m ? m[1] : '';
  }

  /* =====================================================================
     4. SPELLCHECK (§2.4) — passive, native, re-asserted after each patch
     ===================================================================== */
  var spellPass = null;
  function applySpellcheck() {
    var ta = composerEl();
    if (ta && ta.getAttribute('spellcheck') !== 'true') ta.setAttribute('spellcheck', 'true');
  }
  function scheduleSpellcheck() {
    if (spellPass) return;
    spellPass = requestAnimationFrame(function () { spellPass = null; applySpellcheck(); });
  }

  /* =====================================================================
     5. INPUT HISTORY (§2.3)
     ===================================================================== */
  function sentHistory(ctx, tid) {
    var th = threadById(ctx, tid);
    var out = [];
    if (th && th.messages) {
      for (var i = 0; i < th.messages.length; i++) {
        var m = th.messages[i];
        if (m.role !== 'user') continue;
        if (m.type && m.type !== 'text') continue;
        if (typeof m.body !== 'string' || !m.body.trim()) continue;
        out.push(m.body);
      }
    }
    C.history[tid] = out;
    return out;
  }
  C.sentHistory = sentHistory;

  function recallBlocked(ctx, tid) {
    /* §2.3 "no pending attachment/browser selection would create ambiguity". */
    var buf = bufferFor(tid);
    for (var i = 0; i < buf.attachments.length; i++) {
      if (PENDING_STATES[buf.attachments[i] && buf.attachments[i].process_state]) return 'attachment';
    }
    for (var j = 0; j < C.historyBlockers.length; j++) {
      try { if (C.historyBlockers[j](ctx, tid)) return 'module'; }
      catch (err) { console.error('PM56 composer historyBlocker threw', err); }
    }
    return '';
  }

  function setComposerText(ctx, tid, text) {
    ctx.state.composer = text;
    if (ctx.state.drafts) ctx.state.drafts[tid] = text;
    var buf = bufferFor(tid);
    buf.text = text;
    buf.revision += 1;
    buf.updated_at = nowIso();
    schedulePersist();
    var ta = composerEl();
    if (ta) {
      ta.value = text;
      try { ta.setSelectionRange(text.length, text.length); } catch (e) { }
    }
    /* Send<->Stop morphs off state.composer, so a render is owed.  pmPatch
       skips `value` on the focused element, so the caret set above survives. */
    ctx.renderApp();
    var after = composerEl();
    if (after && after.value !== text) {
      after.value = text;
      try { after.setSelectionRange(text.length, text.length); } catch (e) { }
    }
    scheduleSpellcheck();
  }

  function stepHistory(ctx, dir) {
    var tid = ctx.state.selectedThread;
    var list = sentHistory(ctx, tid);
    if (!list.length) return false;
    var idx = C.historyIndex[tid];
    if (dir < 0) {                                   /* ArrowUp — older */
      if (idx == null) idx = list.length - 1;
      else if (idx > 0) idx -= 1;
      else return true;                              /* already oldest; swallow */
    } else {                                         /* ArrowDown — newer */
      if (idx == null) return false;                 /* not traversing: normal key */
      idx += 1;
      if (idx >= list.length) {
        C.historyIndex[tid] = null;
        setComposerText(ctx, tid, '');               /* restores the original empty buffer */
        return true;
      }
    }
    C.historyIndex[tid] = idx;
    setComposerText(ctx, tid, list[idx]);
    return true;
  }

  /* =====================================================================
     6. RECONCILER — restore on thread change, commit on send
     ===================================================================== */
  var lastThread = null;
  var lastMsgCount = -1;
  var reRenderArmed = false;

  function commitBuffer(ctx, th) {
    var buf = bufferFor(th.id);
    if (isEmptyBuffer(buf)) return;
    var msg = null;
    for (var i = th.messages.length - 1; i >= 0; i--) {
      if (th.messages[i].role === 'user') { msg = th.messages[i]; break; }
    }
    for (var h = 0; h < C.commitHooks.length; h++) {
      try { C.commitHooks[h](ctx, th, msg, buf); }
      catch (err) { console.error('PM56 composer commitHook threw', err); }
    }
    /* §2.2 "sending clears the buffer only after message and attachment
       admission commits" — which is exactly the point this runs. */
    buf.text = '';
    buf.attachments = [];
    buf.cursor_position = null;
    buf.revision += 1;
    buf.updated_at = nowIso();
    C.historyIndex[th.id] = null;
    flush();
  }

  var committing = false;   /* see the re-entrancy guard in reconcile() */
  function reconcile(ctx) {
    var tid = ctx.state.selectedThread;
    var th = threadById(ctx, tid);
    var n = (th && th.messages) ? th.messages.length : 0;

    if (tid !== lastThread) {
      var buf = bufferFor(tid);
      var changed = false;
      if (buf.text && !ctx.state.composer) {
        ctx.state.composer = buf.text;
        if (ctx.state.drafts) ctx.state.drafts[tid] = buf.text;
        changed = true;
      } else {
        buf.text = ctx.state.composer || buf.text || '';
      }
      C.destination = buf.destination || null;
      C.historyIndex[tid] = null;
      lastThread = tid;
      lastMsgCount = n;
      schedulePersist();
      if (changed && !reRenderArmed) {
        /* sendButtonHtml() ran before this slot, so the Send/Stop morph on the
           restore frame was computed from the pre-restore text.  One extra
           frame settles it; lastThread is already updated so this cannot loop. */
        reRenderArmed = true;
        requestAnimationFrame(function () {
          reRenderArmed = false;
          var c = ctxNow();
          if (c) c.renderApp();
        });
      }
      return;
    }

    if (n !== lastMsgCount) {
      var grew = lastMsgCount >= 0 && n > lastMsgCount;
      var emptied = !ctx.state.composer;
      lastMsgCount = n;
      /* Catches every send path at once: the Send button, Cmd/Ctrl+Enter, and
         the follow-up queue's Send now — none of which share an action id. */
      /* RE-ENTRANCY GUARD. This reconciler infers "a send happened" from the
         message count growing while the composer is empty, which is what lets
         it catch the Send button, Cmd/Ctrl+Enter and the queue's Send-now
         without sharing an action id. But a commitHook is allowed to append a
         transcript message of its own -- assistant-features.js writes an
         automatic-memory checkpoint on every sixth user turn -- and that append
         calls renderApp, which runs this slot again, which sees the count grow
         again and commits again: unbounded mutual recursion that wedged the
         renderer with no error and no console output. Committing is not
         re-entrant, so say so. */
      /* ISOLATED SUBMISSIONS. A Full/Region screenshot and a component Send
         Now append their OWN user message and must never consume the composer
         (BROWSER-002, BSTALE-008). This reconciler infers "a send happened"
         from the count growing while the composer field is empty -- true for
         the Send button, Cmd/Ctrl+Enter and the queue -- but an isolated
         capture also grows the count, and a buffer holding ATTACHMENTS with no
         text looks "empty" to that test. The result was that attaching a file
         and then taking a screenshot silently discarded the attachment. A
         message that declares itself isolated is not a composer send. */
      var newest = null;
      if (th && th.messages) {
        for (var mi = th.messages.length - 1; mi >= 0; mi--) {
          if (th.messages[mi].role === 'user') { newest = th.messages[mi]; break; }
        }
      }
      var isolated = !!(newest && newest.isolatedSubmission);
      if (grew && emptied && th && !committing && !isolated) {
        committing = true;
        try { commitBuffer(ctx, th); }
        finally {
          committing = false;
          /* Absorb anything the hooks appended, so the next real send is still
             detected as growth rather than being swallowed by this catch-up. */
          lastMsgCount = (th.messages ? th.messages.length : n);
        }
      }
    }
  }

  /* =====================================================================
     7. RENDER — destination ribbon (§2.5 / GUI §5.3)
     ===================================================================== */
  function renderRibbon(ctx) {
    var d = C.destination;
    if (!d) return '';
    var esc = ctx.esc, icon = ctx.icon;
    var kind = d.kind || 'workflow';
    var label = d.label || 'Destination';
    var detail = d.detail || '';
    var short = splitDetail(detail);
    var glyph = d.glyph || 'users';
    var lead = (kind === 'plan-revise') ? '' : 'To:';

    return '<div class="cs-ribbon" data-k="cs-ribbon" data-kind="' + esc(kind) + '"' +
      ' style="--cs-dest:var(--' + destAccentVar(kind) + ')" role="group" aria-label="Message destination">' +
      '<button class="cs-ribbon-main" data-action="cs-open-destinations"' +
      ' data-hover-key="cs-dest" data-hover-tip="' + esc(label + (detail ? ' · ' + detail : '') + ' — open eligible destinations') + '"' +
      ' aria-label="' + esc('Destination: ' + label + '. Open eligible destinations.') + '">' +
      '<span class="cs-ribbon-glyph">' + icon(glyph, 13) + '</span>' +
      '<span class="cs-ribbon-copy">' +
      (lead ? '<span class="cs-ribbon-lead">' + lead + '</span> ' : '') +
      '<b>' + esc(label) + '</b>' +
      (detail ? '<span class="cs-ribbon-detail"> · ' + esc(detail) + '</span>' : '') +
      (short ? '<span class="cs-ribbon-detail-short"> · ' + esc(short) + '</span>' : '') +
      '</span></button>' +
      '<button class="cs-ribbon-close" data-action="clear-destination"' +
      ' data-hover-key="cs-dest-clear" data-hover-tip="Return to Assistant. The text you have typed is kept."' +
      ' aria-label="Clear destination and return to Assistant">' + icon('close', 12) + '</button>' +
      '</div>';
  }

  /* =====================================================================
     8. RENDER — quota wait strip (GUI §5.5)
     ===================================================================== */
  function quotaResetPhrase(q) {
    if (q.resetSource === 'unknown') return 'resets <b>unknown</b>';
    var when = esc0(q.resetAt || 'unknown');
    if (!q.resetAt) return 'resets <b>unknown</b>';
    var approx = q.resetSource === 'locally inferred' ? '~' : '';
    return 'resets <b>' + approx + when + '</b>';
  }
  var _esc = null;
  function esc0(s) { return _esc ? _esc(s) : String(s); }

  function countdown(q) {
    /* Never a confident countdown against an unknown reset time. */
    if (q.resetSource === 'unknown') return '';
    var mins = Number(q.resetInMinutes);
    if (!isFinite(mins) || mins <= 0) return '';
    var h = Math.floor(mins / 60), m = mins % 60;
    var body = (h ? h + 'h ' : '') + m + 'm';
    return (q.resetSource === 'locally inferred' ? '~' : 'in ') + body;
  }

  function renderQuota(ctx) {
    var q = RT.quota;
    if (!q || !q.waiting) return '';
    _esc = ctx.esc;
    var esc = ctx.esc, icon = ctx.icon;
    var unknown = q.resetSource === 'unknown';
    var cd = countdown(q);

    var supply = unknown
      ? '<span class="cs-quota-supply" data-k="cs-quota-supply">' +
        '<input class="cs-quota-input" data-cs-input="quota-reset" type="text" spellcheck="false"' +
        ' placeholder="Supply a reset time" value="' + esc(q.userResetInput || '') + '"' +
        ' aria-label="Supply the reset time yourself">' +
        '<button class="cs-quota-set" data-action="cs-quota-set-reset"' +
        ' data-hover-key="cs-quota-set" data-hover-tip="Record this as a user-supplied reset time. It will not be labelled provider reported.">Set</button>' +
        '</span>'
      : '';

    return '<div class="cs-quota" data-k="cs-quota" role="status" aria-live="polite">' +
      '<span class="cs-quota-icon">' + icon('warning', 13) + '</span>' +
      '<span class="cs-quota-copy">' +
      '<b class="cs-quota-state">Paused</b>' +
      '<span class="cs-quota-sep"> · </span>' + esc(q.reason || 'Provider wait') +
      (q.scope ? '<span class="cs-quota-scope"> · ' + esc(q.scope) + '</span>' : '') +
      '<span class="cs-quota-sep"> · </span>' + quotaResetPhrase(q) +
      (cd ? '<span class="cs-quota-cd"> ' + esc(cd) + '</span>' : '') +
      '<span class="cs-quota-src' + (unknown ? ' is-unknown' : '') + '"> (' + esc(q.resetSource) + ')</span>' +
      '</span>' +
      supply +
      '<label class="cs-quota-resume" data-k="cs-quota-resume">' +
      '<input type="checkbox" data-cs-input="quota-resume"' + (q.resumeAutomatically ? ' checked' : '') + '>' +
      '<span>Resume automatically</span></label>' +
      '<button class="cs-quota-close" data-action="cs-quota-dismiss"' +
      ' data-hover-key="cs-quota-close" data-hover-tip="Clear the wait in this demo. A real wait clears when the provider window resets."' +
      ' aria-label="Clear the provider wait">' + icon('close', 12) + '</button>' +
      '</div>';
  }

  /* =====================================================================
     9. RENDER — eligible-destination picker (dialog slot)
     ===================================================================== */
  function destinationRows(ctx) {
    var rows = (D.composerDestinations && D.composerDestinations.items) ? D.composerDestinations.items.slice() : [];
    for (var i = 0; i < C.destinationProviders.length; i++) {
      try {
        var got = C.destinationProviders[i](ctx);
        if (Array.isArray(got)) rows = got.concat(rows);
      } catch (err) { console.error('PM56 composer destinationProvider threw', err); }
    }
    return rows;
  }

  function renderDestinationDialog(ctx) {
    var esc = ctx.esc, icon = ctx.icon;
    var rows = destinationRows(ctx);
    var cur = C.destination;
    var body = rows.map(function (r) {
      var on = cur && (cur.refId === r.refId) && (cur.kind === r.kind) &&
        ((cur.participantId || null) === (r.participantId || null));
      return '<button class="cs-dest-row' + (on ? ' is-current' : '') + '" data-action="cs-pick-destination"' +
        ' data-id="' + esc(r.id) + '" style="--cs-dest:var(--' + destAccentVar(r.kind) + ')">' +
        '<span class="cs-dest-glyph">' + icon(r.glyph || 'users', 14) + '</span>' +
        '<span class="cs-dest-copy"><strong>' + esc(r.label) + '</strong>' +
        '<span>' + esc(r.detail || '') + ' · ' + esc(r.destinationKind || r.kind) + '</span></span>' +
        (on ? '<span class="cs-dest-check">' + icon('check', 13) + '</span>' : '') +
        '</button>';
    }).join('');

    return '<section class="dialog cs-dest-dialog" style="width:min(560px,calc(100vw - 20px))" role="dialog" aria-modal="true" aria-label="Eligible destinations">' +
      '<div class="drawer-head"><span class="event-icon">' + icon('send', 13) + '</span>' +
      '<strong>Send this message to</strong>' +
      '<span class="meta-pill">' + rows.length + ' eligible</span><span class="spacer"></span>' +
      '<button class="icon-button" data-action="close-dialog" aria-label="Close">' + icon('close', 13) + '</button></div>' +
      '<div class="dialog-body">' +
      '<button class="cs-dest-row' + (cur ? '' : ' is-current') + '" data-action="cs-pick-destination" data-id="__assistant__" style="--cs-dest:var(--accent)">' +
      '<span class="cs-dest-glyph">' + icon('sparkles', 14) + '</span>' +
      '<span class="cs-dest-copy"><strong>Assistant</strong><span>The ordinary thread agent · assistant</span></span>' +
      (cur ? '' : '<span class="cs-dest-check">' + icon('check', 13) + '</span>') +
      '</button>' +
      body +
      '<p class="cs-dest-note">Only one destination is selected at a time. Closing the ribbon returns to Assistant and keeps whatever you have typed.' +
      (D.composerDestinations && D.composerDestinations.demo ? ' These rows are composer-state demo fixtures; the plan and collaboration modules contribute live rows through <code>RT.composer.destinationProviders</code>.' : '') +
      '</p></div></section>';
  }

  /* =====================================================================
     10. SLOT REGISTRATION
     ===================================================================== */
  EXT.slot('composerBelow', function (ctx) {
    /* Runs first inside renderComposer's template, and before the textarea's
       value is interpolated — see honesty note 2. */
    try { reconcile(ctx); } catch (err) { console.error('PM56 composer reconcile threw', err); }
    scheduleSpellcheck();
    return renderQuota(ctx);
  });

  EXT.slot('composerRibbon', function (ctx) {
    scheduleSpellcheck();
    return renderRibbon(ctx);
  });

  EXT.slot('dialog', function (ctx) {
    var dlg = ctx.state.dialog;
    if (!dlg || dlg.type !== 'cs-destinations') return '';
    return renderDestinationDialog(ctx);
  });

  EXT.slot('wandRows', function (ctx) {
    /* The only way a reviewer can reach the quota strip without a provider.
       Menus are torn down and rebuilt, so no data-k is owed here. */
    var q = RT.quota, icon = ctx.icon, esc = ctx.esc;
    return '<button class="menu-item" data-action="cs-quota-demo">' +
      '<span class="menu-icon">' + icon('warning', 13) + '</span>' +
      '<span class="menu-copy"><strong>Provider quota wait</strong>' +
      '<span>' + (q.waiting ? 'Strip is showing above the composer' : 'Show the in-flow wait strip') + '</span></span>' +
      '<span class="shortcut">' + (q.waiting ? 'On' : 'Off') + '</span></button>' +
      '<button class="menu-item" data-action="cs-quota-source">' +
      '<span class="menu-icon">' + icon('info', 13) + '</span>' +
      '<span class="menu-copy"><strong>Reset-time source</strong>' +
      '<span>Cycle provider reported / locally inferred / user supplied / unknown</span></span>' +
      '<span class="shortcut">' + esc(q.resetSource) + '</span></button>';
  });

  /* =====================================================================
     11. ACTIONS
     ===================================================================== */

  /* Registered under the exact name three other modules reference. */
  EXT.action('clear-destination', function (ctx) {
    C.destination = null;
    var buf = bufferFor(ctx.state.selectedThread);
    buf.destination = null;
    buf.revision += 1;
    buf.updated_at = nowIso();
    flush();
    ctx.renderApp();
    return true;
  });

  EXT.action('cs-open-destinations', function (ctx) {
    ctx.openDialog({ type: 'cs-destinations' });
    return true;
  });

  EXT.action('cs-pick-destination', function (ctx, btn) {
    var id = btn.dataset.id;
    if (id === '__assistant__') {
      C.destination = null;
    } else {
      var rows = destinationRows(ctx), hit = null;
      for (var i = 0; i < rows.length; i++) if (rows[i].id === id) { hit = rows[i]; break; }
      if (!hit) return true;
      C.destination = {
        kind: hit.kind, label: hit.label, detail: hit.detail,
        refId: hit.refId, glyph: hit.glyph,
        destinationKind: hit.destinationKind || null,
        participantId: hit.participantId || null
      };
    }
    var buf = bufferFor(ctx.state.selectedThread);
    buf.destination = C.destination;
    buf.revision += 1;
    buf.updated_at = nowIso();
    flush();
    ctx.closeDialog();
    ctx.renderApp();
    return true;
  });

  EXT.action('cs-quota-demo', function (ctx) {
    RT.quota.waiting = !RT.quota.waiting;
    ctx.renderApp();
    ctx.renderOverlays();
    return true;
  });

  EXT.action('cs-quota-source', function (ctx) {
    var i = QUOTA_SOURCES.indexOf(RT.quota.resetSource);
    RT.quota.resetSource = QUOTA_SOURCES[(i + 1) % QUOTA_SOURCES.length];
    if (RT.quota.resetSource === 'unknown') {
      /* Honest: an unknown source has no reset time behind it. */
      RT.quota.resetAt = '';
      RT.quota.resetInMinutes = null;
    } else if (!RT.quota.resetAt) {
      RT.quota.resetAt = D.quotaWait.fixture.resetAt;
      RT.quota.resetInMinutes = D.quotaWait.fixture.resetInMinutes;
    }
    ctx.renderApp();
    ctx.renderOverlays();
    return true;
  });

  EXT.action('cs-quota-set-reset', function (ctx) {
    var raw = String(RT.quota.userResetInput || '').trim();
    if (!raw) {
      ctx.toast('No time supplied', 'Type the time the provider window reopens, then press Set. Nothing is guessed for you.');
      return true;
    }
    RT.quota.resetAt = raw;
    RT.quota.resetSource = 'user supplied';
    RT.quota.resetInMinutes = null;   /* a typed wall clock is not a countdown */
    ctx.renderApp();
    return true;
  });

  EXT.action('cs-quota-dismiss', function (ctx) {
    RT.quota.waiting = false;
    ctx.renderApp();
    return true;
  });

  /* Flush before app.js's switchThread() overwrites state.composer.
     chainAction: this deliberately extends an existing action and declines,
     so `PM56_EXT.collisions.length === 0` stays true. */
  EXT.chainAction('select-thread', function (ctx) {
    var tid = ctx.state.selectedThread;
    var buf = bufferFor(tid);
    buf.text = ctx.state.composer || '';
    buf.destination = C.destination || null;
    var ta = composerEl();
    buf.cursor_position = ta ? ta.selectionStart : null;
    buf.updated_at = nowIso();
    flush();
    return false;
  });

  /* The Demo Studio already has a 'Provider quota' trigger. Light the strip
     from it too, then decline so the built-in receipt still runs. */
  EXT.chainAction('demo-trigger', function (ctx, btn) {
    if (btn && btn.dataset && btn.dataset.trigger === 'Provider quota') {
      RT.quota.waiting = true;
      RT.quota.resetSource = 'provider reported';
      RT.quota.resetAt = D.quotaWait.fixture.resetAt;
      RT.quota.resetInMinutes = D.quotaWait.fixture.resetInMinutes;
    }
    return false;
  });

  EXT.chainAction('reset-all', function () {
    C.buffers = {};
    C.history = {};
    C.historyIndex = {};
    C.destination = null;
    RT.quota = JSON.parse(JSON.stringify(D.quotaWait.fixture));
    lastThread = null;
    lastMsgCount = -1;
    store.del(STORE_KEY);
    return false;
  });

  /* =====================================================================
     12. LISTENERS
     ---------------------------------------------------------------------
     Own delegated listeners rather than app.js's `data-input` chain, which
     has no extension hook.  These are registered while this module loads,
     which is BEFORE app.js registers its own, so they observe first.
     Deliberately no re-render on `input`: a patch mid-keystroke fights the
     caret (the lesson goals.js records).
     ===================================================================== */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;

    if (t.getAttribute('data-input') === 'composer') {
      var ctx = ctxNow(); if (!ctx) return;
      var tid = ctx.state.selectedThread;
      var buf = bufferFor(tid);
      buf.text = t.value;
      buf.cursor_position = t.selectionStart;
      buf.revision += 1;
      buf.updated_at = nowIso();
      C.historyIndex[tid] = null;      /* §2.3 typing exits traversal */
      schedulePersist();
      applySpellcheck();
      return;
    }

    var k = t.getAttribute('data-cs-input');
    if (k === 'quota-reset') { RT.quota.userResetInput = t.value; return; }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    if (t.getAttribute('data-cs-input') !== 'quota-resume') return;
    RT.quota.resumeAutomatically = !!t.checked;
    var ctx = ctxNow(); if (ctx) ctx.renderApp();
  });

  document.addEventListener('keydown', function (e) {
    /* The composer textarea only — every other field keeps native arrows. */
    var t = e.target;
    if (!t || !t.matches || !t.matches('textarea[data-input="composer"]')) return;
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    if (e.isComposing || e.keyCode === 229) return;             /* IME active */
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

    var ctx = ctxNow(); if (!ctx) return;
    var tid = ctx.state.selectedThread;
    var traversing = C.historyIndex[tid] != null;
    /* §2.3: with text present, arrows must behave normally. */
    if (t.value !== '' && !traversing) return;
    if (recallBlocked(ctx, tid)) return;

    if (stepHistory(ctx, e.key === 'ArrowUp' ? -1 : 1)) e.preventDefault();
  });

  /* §2.2 flush on suspension / navigation that destroys the composer. */
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });

  /* =====================================================================
     13. PUBLIC SURFACE (harnesses assert against this, not the DOM)
     ===================================================================== */
  window.PM56_COMPOSER_STATE = {
    version: 1,
    runtime: C,
    quota: function () { return RT.quota; },
    quotaSources: QUOTA_SOURCES.slice(),
    storageKey: STORE_KEY,
    bufferFor: bufferFor,
    sentHistory: sentHistory,
    recallBlocked: recallBlocked,
    persist: flush,
    pendingStates: Object.keys(PENDING_STATES),
    /* Additive Correction v4 (BSTALE-012, MODAL-012). The buffer revision is
       the fence a late browser resolution is checked against, and setBuffer is
       how a cancelled BrainStorm returns its held request intact. */
    revision: function (threadId) { var b = bufferFor(threadId); return b ? (b.revision || 0) : null; },
    /* MODAL-011: store a validated pre-send workflow configuration WITH the
       text. Nothing starts; the workflow runs only when the request is sent. */
    setWorkflowConfig: function (threadId, config) {
      var b = bufferFor(threadId); if (!b) return null;
      b.workflow_config = config ? JSON.parse(JSON.stringify(config)) : null;
      b.revision = (b.revision || 0) + 1; b.updated_at = new Date().toISOString();
      persist();
      return JSON.parse(JSON.stringify(b.workflow_config || null));
    },
    workflowConfig: function (threadId) {
      var b = bufferFor(threadId); return b && b.workflow_config ? JSON.parse(JSON.stringify(b.workflow_config)) : null;
    },
    /* MODAL-012: hold a natural-language workflow request BEFORE any provider
       dispatch, then either release it on Start or restore it intact on
       Cancel. `restoreHeldRequest` puts the exact text and attachments back
       and clears the hold, so a cancelled request never runs with defaults. */
    holdRequest: function (threadId, request) {
      var b = bufferFor(threadId); if (!b) return null;
      b.held_request = { text: String((request && request.text) || b.text || ''),
                         attachments: (request && request.attachments) ? request.attachments.slice() : (b.attachments || []).slice(),
                         kind: (request && request.kind) || 'brainstorm',
                         held_at: new Date().toISOString(), dispatched: false };
      b.revision = (b.revision || 0) + 1; b.updated_at = b.held_request.held_at;
      persist();
      return JSON.parse(JSON.stringify(b.held_request));
    },
    heldRequest: function (threadId) {
      var b = bufferFor(threadId); return b && b.held_request ? JSON.parse(JSON.stringify(b.held_request)) : null;
    },
    restoreHeldRequest: function (threadId) {
      var b = bufferFor(threadId); if (!b || !b.held_request) return null;
      var h = b.held_request;
      b.text = h.text; b.attachments = (h.attachments || []).slice();
      b.held_request = null; b.workflow_config = null;
      b.revision = (b.revision || 0) + 1; b.updated_at = new Date().toISOString();
      persist();
      return { restored: true, text: b.text, attachments: b.attachments.length };
    },
    setBuffer: function (threadId, text, attachments) {
      var b = bufferFor(threadId); if (!b) return null;
      b.text = String(text == null ? '' : text);
      if (attachments) b.attachments = attachments.slice();
      b.revision = (b.revision || 0) + 1;
      flush();
      return b;
    }
  };
})();
