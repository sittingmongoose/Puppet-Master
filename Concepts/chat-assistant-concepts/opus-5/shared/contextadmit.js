/* PMXContextAdmit — Opus 5
 *
 * The Context Lens ADMISSION RECEIPT, Compact Now, and prior-chat search.
 *
 * This module extends shared/lens.js and never replaces it. Lens owns selection shaping —
 * mute, focus, subcompact, turn off — which is about how the AGENT sees history. This module
 * owns the orthogonal question the packet actually asks in 02_...:16: "what was admitted into
 * the prompt, where did it come from, and what was left out and why". Those are two different
 * concerns over the same thread, so they are two modules over one view slice rather than one
 * module with two vocabularies.
 *
 * Three decisions are load-bearing.
 *
 * 1. THE RECEIPT IS DERIVED, NEVER STORED. `receipt()` recomputes from the real corpus every
 *    call — the thread's messages, its goal, its project, its persona, its attachments, and the
 *    provider-reported `runtime.contextUsed`/`contextLimit` on its last turn. A stored receipt
 *    would drift the moment a source was removed or a compaction ran, and a drifted receipt is
 *    worse than none: the whole point of an admission receipt is that it cannot lie. The only
 *    things persisted are the user's EDITS to admission (`context.removed`, `context.passages`)
 *    and the compaction record; everything visible is recomputed from those plus the corpus.
 *
 * 2. LABELS ARE COUNT-AND-KIND SUMMARIES, NEVER CONTENT. 02_...:39 forbids exposing raw
 *    secrets, full FileSafe policy, full system prompts, or giant internal registries. The
 *    structural defence is that no label or reason is ever interpolated from a message body,
 *    an attachment payload, a tool schema, or any policy text — a label is built from a KIND
 *    plus a COUNT ('Recent messages (last 12 turns)'), which cannot carry a credential because
 *    it never touches the material it describes. Free-form provenance stays limited to names
 *    the user already chose and can already see: a thread title, a message id, a file name.
 *    Phase G asserts no label matches /key|token|secret|password|BEGIN /i; that assertion
 *    passes by construction here, not by filtering after the fact.
 *
 * 3. COMPACTION CHANGES WHAT IS ADMITTED, NOT WHAT HAPPENED. `compactNow` never writes to
 *    `data.threads[*].messages` and never rewrites historical Usage (02_...:43). Canonical
 *    history and branch ancestry survive untouched; all that moves is the size of the window
 *    this thread admits, recorded as a receipt so the user can see the trade they made.
 *
 * Contract: CONTRACT.md section 5 (the store is the only source of truth for semantic state);
 * SERVICES.md "PMXContextAdmit". Long-running work returns an observable op id, per the shared
 * rule that there is exactly one progress system (SHARED_PROCESS_RULES.md).
 */
(function (global) {
  'use strict';

  /* How many turns are admitted verbatim before older ones are represented by a summary, and
   * how far Compact Now pulls that window in. Two constants rather than a ratio because the
   * receipt has to state a concrete number of turns to the user. */
  var RECENT_WINDOW = 12;
  var COMPACT_WINDOW = 6;

  /* A summary is not free. Charging it keeps `before`/`after` honest: compaction trades a large
   * verbatim span for a small summary, it does not reduce cost to zero. */
  var SUMMARY_TOKENS = 40;

  /* Characters per token. A concept-side estimate, not a tokenizer — it exists so pressure moves
   * truthfully in response to admission edits, while the BASELINE stays the provider-reported
   * `contextUsed` rather than anything this module invents. */
  var CHARS_PER_TOKEN = 4;

  /* Passage excerpt half-width, in characters, around a prior-chat match. */
  var PASSAGE_RADIUS = 90;
  var MAX_PRIOR_HITS = 20;

  /* The tool families this workspace can admit schemas for. PM-native browser vocabulary only
   * (reference/BROWSER_TERMINOLOGY_FINAL_CORRECTION.md). This is a NAME list, deliberately not a
   * schema list — the receipt reports how many schemas were left out, and must never become the
   * "giant internal registry" dump that 02_...:39 rules out. */
  var TOOL_CATALOG = [
    'Read files', 'Repository search', 'Web search', 'Web fetch',
    'Browser Action', 'Browser Program', 'Expert Browser Program', 'BrowserPage', 'TestCapture',
    'Screen captures', 'Logs', 'Diagnostics', 'Static analysis', 'Sandboxed tests',
    'Edit files', 'Apply patch', 'Run commands', 'Subagents', 'Artifacts', 'Questions',
    'Worktrees', 'Restore points'
  ];

  /* Words too common to signal topical relevance between two threads. */
  var STOPWORDS = {
    the: 1, and: 1, for: 1, with: 1, that: 1, this: 1, from: 1, into: 1, then: 1, than: 1,
    when: 1, what: 1, some: 1, more: 1, been: 1, they: 1, them: 1, have: 1, will: 1, your: 1,
    about: 1, chat: 1, thread: 1
  };

  var store = null;
  var data = null;
  var seq = 0;

  /* bind tolerates a second call: boot binds once before the corpus resolves and again after. */
  function bind(s, d) {
    store = s || null;
    data = d || null;
    return api;
  }

  /* ---- small helpers ----------------------------------------------------------------------- */

  function nowIso() { return new Date().toISOString(); }

  function threadOf(threadId) {
    if (!data || !threadId || typeof data.threadById !== 'function') return null;
    return data.threadById(threadId) || null;
  }

  function messagesOf(t) { return (t && t.messages) || []; }

  function tokensForChars(chars) {
    return Math.max(0, Math.round(chars / CHARS_PER_TOKEN));
  }

  /* The `context` view slice is seeded by the store as { removed: [], compact: null }. The
   * admitted-passage list is created lazily here rather than added to the store's defaultView:
   * this module is its only reader and its only writer, and widening a shared default for one
   * service's private list is how a store shape rots. */
  function ctxSlice(threadId) {
    if (!store || !threadId) return { removed: [], compact: null, passages: [] };
    var v = store.view(threadId);
    if (!v.context) v.context = { removed: [], compact: null };
    if (!v.context.removed) v.context.removed = [];
    if (!v.context.passages) v.context.passages = [];
    return v.context;
  }

  function announce() { if (store && typeof store.touchView === 'function') store.touchView('context'); }

  function isRemoved(threadId, id) {
    return ctxSlice(threadId).removed.indexOf(id) >= 0;
  }

  /* The last turn's runtime carries the provider's own reported figures. Falling back to the
   * store's per-thread runtime keeps an empty or synthetic thread from reporting a fake zero. */
  function runtimeOf(threadId, t) {
    var msgs = messagesOf(t);
    for (var i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i] && msgs[i].runtime) return msgs[i].runtime;
    }
    return {};
  }

  function personaOf(threadId, t) {
    var rt = runtimeOf(threadId, t);
    if (store && typeof store.runtime === 'function') {
      var p = store.runtime(threadId, 'persona');
      if (p) return p;
    }
    return rt.persona || '';
  }

  /* Attachments live in the view (the store seeds them from the fixture). PMXAttach normalises
   * bare {name,mime,bytes} specs into resolution records on first read, so both shapes appear
   * here depending on whether that service has run yet. */
  function attachmentsOf(threadId) {
    if (!store || !threadId) return [];
    var v = store.view(threadId);
    return (v && v.attachments) || [];
  }

  function mimeKind(mime) {
    var m = String(mime || '');
    if (m.indexOf('video/') === 0) return 'video';
    if (m.indexOf('audio/') === 0) return 'audio';
    if (m.indexOf('image/') === 0) return 'image';
    if (m.indexOf('text/') === 0) return 'text';
    if (m.indexOf('pdf') >= 0) return 'document';
    if (m.indexOf('zip') >= 0 || m.indexOf('compressed') >= 0) return 'archive';
    if (m.indexOf('sheet') >= 0 || m.indexOf('excel') >= 0 || m.indexOf('csv') >= 0) return 'spreadsheet';
    return 'file';
  }

  function attachmentId(a, i) {
    return 'adm-att-' + ((a && a.id) || (a && a.name) || ('n' + i));
  }

  function passageId(p) {
    return 'adm-ex-' + p.threadId + '-' + p.messageId;
  }

  /* ---- window and token accounting ---------------------------------------------------------- */

  function windowSize(threadId, t) {
    var stored = messagesOf(t).length;
    var compacted = !!ctxSlice(threadId).compact;
    return Math.min(stored, compacted ? COMPACT_WINDOW : RECENT_WINDOW);
  }

  /* Verbatim cost of the last `n` turns, measured off the real bodies in the corpus. */
  function windowTokens(t, n) {
    var msgs = messagesOf(t);
    var start = Math.max(0, msgs.length - n);
    var chars = 0;
    for (var i = start; i < msgs.length; i++) chars += (msgs[i] && msgs[i].body ? msgs[i].body.length : 0);
    return tokensForChars(chars);
  }

  /* What a single removable row costs, so dropping it visibly moves the pressure bar. Only
   * removable rows need an estimate: the non-removable ones can never leave the receipt. */
  function passageTokens(p) { return tokensForChars((p && p.passage ? p.passage.length : 0)); }

  function attachmentTokens(a) {
    /* A representation, not the payload: a transcript or a page-image set is a small fraction of
     * the source bytes, so byte size is a ceiling rather than the figure itself. */
    var bytes = Number(a && a.bytes) || 0;
    return Math.max(120, Math.min(4000, Math.round(bytes / 8192)));
  }

  /* Savings realised by pulling the verbatim window from RECENT_WINDOW back to COMPACT_WINDOW.
   * Never negative: on a short thread there is nothing to compact and the receipt says so. */
  function compactionSavings(t) {
    var full = windowTokens(t, RECENT_WINDOW);
    var tight = windowTokens(t, COMPACT_WINDOW);
    return Math.max(0, full - tight - SUMMARY_TOKENS);
  }

  /* Pressure starts at the provider's own reported use and is reduced by the admission edits the
   * user has since made. Recomputing the total from scratch would replace a real measurement with
   * this module's estimate; subtracting deltas keeps the real number in charge. */
  function pressureOf(threadId, t) {
    var rt = runtimeOf(threadId, t);
    var limit = Number(rt.contextLimit) || 128000;
    var base = Number(rt.contextUsed);
    if (!isFinite(base) || base <= 0) base = windowTokens(t, RECENT_WINDOW);

    var used = base;
    if (ctxSlice(threadId).compact) used -= compactionSavings(t);

    /* Anything the user removed is no longer being sent. */
    var cx = ctxSlice(threadId);
    var i;
    for (i = 0; i < cx.passages.length; i++) {
      if (isRemoved(threadId, passageId(cx.passages[i]))) used -= passageTokens(cx.passages[i]);
    }
    var atts = attachmentsOf(threadId);
    for (i = 0; i < atts.length; i++) {
      if (isRemoved(threadId, attachmentId(atts[i], i))) used -= attachmentTokens(atts[i]);
    }
    /* Admitted passages are additional material this thread did not originally send. */
    for (i = 0; i < cx.passages.length; i++) {
      if (!isRemoved(threadId, passageId(cx.passages[i]))) used += passageTokens(cx.passages[i]);
    }

    used = Math.max(0, Math.min(limit, Math.round(used)));
    return { used: used, limit: limit, ratio: limit > 0 ? Math.max(0, Math.min(1, used / limit)) : 0 };
  }

  /* ---- cache state --------------------------------------------------------------------------- */

  /* Three states, each earned. `restarting` while a compaction for this thread is genuinely in
   * flight; `cold` once one has run, because rewriting the admitted window invalidates the prompt
   * prefix the provider was caching — that is the same cache_loss consequence the route-warning
   * ladder names; `warm` only when this thread has real turns behind it and nothing has reset it. */
  function cacheState(threadId, t) {
    var O = global.PMXObservable;
    if (O && typeof O.byKind === 'function') {
      var live = O.byKind('compact');
      for (var i = 0; i < live.length; i++) {
        var op = live[i];
        if (op && op.threadId === threadId && (op.state === 'running' || op.state === 'queued')) return 'restarting';
      }
    }
    if (ctxSlice(threadId).compact) return 'cold';
    return messagesOf(t).length > 0 ? 'warm' : 'cold';
  }

  /* ---- tool selection -------------------------------------------------------------------------- */

  /* Which tool families this thread actually exercised, read off real corpus signals rather than
   * declared anywhere. The unused remainder is what the receipt reports as left out. */
  function selectedTools(t) {
    var sel = ['Read files', 'Repository search'];
    function add(name) { if (sel.indexOf(name) < 0) sel.push(name); }
    if (t.diffGroups && t.diffGroups.length) { add('Edit files'); add('Apply patch'); }
    if (t.subagentGroups && t.subagentGroups.length) add('Subagents');
    if (t.artifacts && t.artifacts.length) add('Artifacts');
    if (t.questionnaires && t.questionnaires.length) add('Questions');
    if (t.browserSessions && t.browserSessions.length) { add('Browser Action'); add('BrowserPage'); }
    if (t.activeGoal) add('Run commands');

    /* When an access profile is in force it can only NARROW the admitted set — a tool the mode
     * forbids was never sent, so it must not appear as admitted. */
    var A = global.PMXAccess;
    if (A && store && typeof A.toolsFor === 'function' && typeof store.runtime === 'function') {
      var allowed = A.toolsFor(store.runtime(t.id, 'mode'));
      if (allowed && allowed.length) {
        var narrowed = [];
        for (var i = 0; i < sel.length; i++) if (allowed.indexOf(sel[i]) >= 0) narrowed.push(sel[i]);
        /* Only narrow when the profile actually recognises this vocabulary, so an unrelated
         * tool-name list cannot silently empty the row. */
        if (narrowed.length) sel = narrowed;
      }
    }
    return sel;
  }

  /* ---- relevance, for the "left out" counts ------------------------------------------------- */

  function terms(text) {
    var out = {};
    var words = String(text || '').toLowerCase().split(/[^a-z0-9]+/);
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.length >= 4 && !STOPWORDS[w]) out[w] = 1;
    }
    return out;
  }

  function objectiveTerms(t) {
    var g = t.activeGoal || {};
    return terms((g.title || g.label || '') + ' ' + (t.title || ''));
  }

  function shares(termsA, text) {
    var b = terms(text);
    for (var k in b) if (Object.prototype.hasOwnProperty.call(b, k) && termsA[k]) return true;
    return false;
  }

  /* Counts for the two "left out" rows that describe material OUTSIDE this thread. Both are
   * measured against the real corpus so the numbers move when the fixture does. */
  function outsideCounts(t) {
    var objective = objectiveTerms(t);
    var logs = 0, memories = 0;
    var all = (data && data.threads) || [];
    for (var i = 0; i < all.length; i++) {
      var other = all[i];
      if (!other || other.id === t.id || other.deleted) continue;
      /* Run and tool output belonging to other threads: real groups, not a guess. */
      logs += ((other.subagentGroups && other.subagentGroups.length) || 0) +
              ((other.diffGroups && other.diffGroups.length) || 0) +
              ((other.browserSessions && other.browserSessions.length) || 0);
      if (!shares(objective, other.title)) memories++;
    }
    return { logs: logs, memories: memories };
  }

  /* ---- the receipt ---------------------------------------------------------------------------- */

  function included(threadId, t) {
    var rows = [];
    var cx = ctxSlice(threadId);

    function push(id, kind, label, provenance, removable) {
      if (cx.removed.indexOf(id) >= 0) return;
      rows.push({ id: id, kind: kind, label: label, provenance: provenance, removable: !!removable });
    }

    if (t.activeGoal) {
      push('adm-objective', 'objective', 'Current objective', 'Goal Runtime · this thread', false);
    }

    var win = windowSize(threadId, t);
    if (win > 0) {
      push('adm-recent', 'recent_messages', 'Recent messages (last ' + win + ' turns)',
        'This thread · ' + messagesOf(t).length + ' stored', false);
    }

    if (t.project && t.project !== 'Personal project') {
      push('adm-project', 'project_instructions', 'Scoped project instructions',
        'Project · ' + t.project, false);
    }

    var persona = personaOf(threadId, t);
    if (persona) {
      push('adm-persona', 'persona_capsule', 'Persona capsule', 'Persona · ' + persona, false);
    }

    var tools = selectedTools(t);
    if (tools.length) {
      push('adm-tools', 'tools', 'Selected tools (' + tools.length + ')',
        'Admitted for this thread', false);
    }

    /* One row per excerpt, not one row per count: 02_...:37 requires the user to inspect
     * provenance and remove AN admitted excerpt, which is only possible if each is addressable. */
    var i;
    for (i = 0; i < cx.passages.length; i++) {
      var p = cx.passages[i];
      push(passageId(p), 'prior_thread_excerpt', 'Prior-thread excerpt',
        p.threadTitle + ' · ' + p.messageId, true);
    }

    var atts = attachmentsOf(threadId);
    for (i = 0; i < atts.length; i++) {
      var a = atts[i];
      push(attachmentId(a, i), 'attachment_representation',
        'Attachment representation (' + mimeKind(a.mime) + ')',
        'Attachment · ' + (a.name || 'unnamed'), true);
    }

    return rows;
  }

  function omitted(threadId, t) {
    var rows = [];
    function push(id, kind, label, reason) {
      rows.push({ id: id, kind: kind, label: label, reason: reason });
    }

    var stored = messagesOf(t).length;
    var summarized = Math.max(0, stored - windowSize(threadId, t));
    if (summarized > 0) {
      push('omt-older', 'older_messages_summarized',
        'Older messages represented by summary (' + summarized + ')',
        'Outside the admitted window; ancestry preserved.');
    }

    var unused = TOOL_CATALOG.length - selectedTools(t).length;
    if (unused > 0) {
      push('omt-tools', 'unused_tool_schemas', 'Unused tool schemas (' + unused + ')',
        'Not selected for this thread.');
    }

    var counts = outsideCounts(t);
    if (counts.logs > 0) {
      push('omt-logs', 'unrelated_logs', 'Unrelated logs (' + counts.logs + ')',
        'Produced by other threads and worktrees.');
    }
    if (counts.memories > 0) {
      push('omt-memories', 'low_relevance_memories',
        'Memories below relevance threshold (' + counts.memories + ')',
        'Relevance to the current objective is below the admission threshold.');
    }

    /* Deliberately NO row for sources the user removed by hand. The omitted-kind list is closed
     * to exactly four kinds and none of them means "you withdrew this", so reporting a removed
     * excerpt as, say, a memory below the relevance threshold would state a reason that is not
     * the real one. A receipt that invents a rationale is the failure mode this module exists to
     * avoid; the removal is already truthfully visible, because the row leaves `included` and the
     * pressure figure drops by exactly what that source cost.
     */

    return rows;
  }

  /* receipt(threadId) -> { pressure, cache, included[], omitted[] } */
  function receipt(threadId) {
    var t = threadOf(threadId);
    if (!t) {
      return {
        pressure: { used: 0, limit: 0, ratio: 0 },
        cache: { state: 'cold' },
        included: [],
        omitted: []
      };
    }
    var inc = included(threadId, t);
    return {
      pressure: pressureOf(threadId, t),
      cache: { state: cacheState(threadId, t) },
      included: inc,
      omitted: omitted(threadId, t)
    };
  }

  /* removeAdmitted(threadId, id) -> boolean
   *
   * Only rows marked removable can go. The objective, the recent window, the project
   * instructions, the persona capsule and the selected tools are what makes the assistant able
   * to answer at all; offering a control that silently refuses, or one that guts the prompt,
   * would both be worse than not offering it. Refusal is reported, never silent. */
  function removeAdmitted(threadId, id) {
    var t = threadOf(threadId);
    if (!t || !id) return false;
    var rows = included(threadId, t);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === id) {
        if (!rows[i].removable) return false;
        ctxSlice(threadId).removed.push(id);
        announce();
        return true;
      }
    }
    return false;
  }

  /* compactNow(threadId) -> observable op id (string)
   *
   * Returns the op id rather than a receipt so the caller can render a real operation state; the
   * receipt is durable afterwards through compactReceipt(). The transitions run inside this call
   * so the resulting state is deterministic for a scripted probe — subscribers still observe
   * every step, because PMXObservable announces each one as it happens rather than at the end.
   *
   * It does NOT touch data.threads[*].messages and does NOT rewrite historical Usage: canonical
   * history and branch ancestry are preserved (02_...:43). All that changes is how much of that
   * history this thread ADMITS on the next turn. */
  function compactNow(threadId) {
    var t = threadOf(threadId);
    var O = global.PMXObservable;
    if (!t || !O || typeof O.start !== 'function') return null;

    var cx = ctxSlice(threadId);
    var before = pressureOf(threadId, t).used;

    seq += 1;
    var opId = 'compact-' + threadId + '-' + seq;
    var op = O.start({ id: opId, kind: 'compact', label: 'Compacting context', determinate: true, total: 3 });
    /* Tag the op with its thread so cacheState can tell an in-flight compaction of THIS thread
     * from one running elsewhere; PMXObservable keeps unknown fields on the record untouched. */
    if (op) op.threadId = threadId;

    O.step(opId, 1, 'Selecting older turns');
    O.step(opId, 2, 'Writing summary');

    var summaryRef = 'ctxsum-' + threadId + '-' + seq;
    cx.compact = {
      at: nowIso(),
      before: before,
      after: 0,
      preservedAncestry: true,
      summaryRef: summaryRef
    };
    /* Measured AFTER the window narrows, so `after` reports the real new figure rather than a
     * prediction made before the change. */
    cx.compact.after = pressureOf(threadId, t).used;

    O.step(opId, 3, 'Compacted context');
    O.finish(opId, {
      kind: 'compact',
      threadId: threadId,
      before: cx.compact.before,
      after: cx.compact.after,
      preservedAncestry: true,
      summaryRef: summaryRef
    });

    announce();
    return opId;
  }

  /* compactReceipt(threadId) -> record | null. Null means this thread has never been compacted,
   * which is a different statement from "compacted and saved nothing". */
  function compactReceipt(threadId) {
    if (!store || !threadOf(threadId)) return null;
    return ctxSlice(threadId).compact || null;
  }

  /* ---- prior chats ------------------------------------------------------------------------- */

  function excerpt(body, at) {
    var text = String(body || '');
    var from = Math.max(0, at - PASSAGE_RADIUS);
    var to = Math.min(text.length, at + PASSAGE_RADIUS);
    /* Snap to word boundaries so a passage never begins or ends mid-word. */
    if (from > 0) {
      var s = text.indexOf(' ', from);
      if (s >= 0 && s < at) from = s + 1;
    }
    if (to < text.length) {
      var e = text.lastIndexOf(' ', to);
      if (e > at) to = e;
    }
    var cut = text.slice(from, to).replace(/\s+/g, ' ');
    if (from > 0) cut = '…' + cut;
    if (to < text.length) cut = cut + '…';
    return cut;
  }

  /* priorChats(query) -> hit[]
   *
   * Searches the OTHER threads in the project corpus — the current conversation is already in
   * front of the user, so returning it as a "prior chat" would be noise. Each hit carries a
   * trimmed passage, never a whole message body: the result list is a place to choose from, and
   * 02_...:58 only lets the SELECTED passage enter context. */
  function priorChats(query) {
    var q = String(query || '').trim();
    if (!q || !data || !data.threads) return [];
    var activeId = store && typeof store.get === 'function' ? store.get('session.activeThreadId') : null;
    var needle = q.toLowerCase();
    var hits = [];

    for (var i = 0; i < data.threads.length; i++) {
      var t = data.threads[i];
      if (!t || t.id === activeId || t.deleted) continue;
      var msgs = messagesOf(t);
      for (var m = 0; m < msgs.length; m++) {
        var msg = msgs[m];
        var body = msg && msg.body ? String(msg.body) : '';
        var at = body.toLowerCase().indexOf(needle);
        if (at < 0) continue;
        hits.push({
          threadId: t.id,
          threadTitle: t.title || t.id,
          messageId: msg.id,
          passage: excerpt(body, at),
          at: msg.sentAt
        });
        if (hits.length >= MAX_PRIOR_HITS) return hits;
      }
    }
    return hits;
  }

  /* addPassage(threadId, hit) -> boolean
   *
   * Admits ONE passage as a prior_thread_excerpt, attributed to the thread and message it came
   * from. It never admits the source conversation: the stored record holds the excerpt text the
   * user saw and the two ids that prove where it came from, so the provenance line in the
   * receipt is verifiable rather than decorative. Idempotent per (thread, message) so a second
   * click on the same result cannot double-charge the context budget. */
  function addPassage(threadId, hit) {
    if (!store || !hit || !threadOf(threadId)) return false;
    if (!hit.threadId || !hit.messageId) return false;

    var cx = ctxSlice(threadId);
    var id = passageId(hit);
    for (var i = 0; i < cx.passages.length; i++) {
      if (passageId(cx.passages[i]) === id) return false;
    }
    /* A previously removed excerpt that is added back should reappear, so clear its tombstone. */
    var r = cx.removed.indexOf(id);
    if (r >= 0) cx.removed.splice(r, 1);

    cx.passages.push({
      threadId: hit.threadId,
      threadTitle: hit.threadTitle || hit.threadId,
      messageId: hit.messageId,
      passage: String(hit.passage || ''),
      at: hit.at || null
    });
    announce();
    return true;
  }

  var api = {
    bind: bind,
    receipt: receipt,
    removeAdmitted: removeAdmitted,
    compactNow: compactNow,
    compactReceipt: compactReceipt,
    priorChats: priorChats,
    addPassage: addPassage
  };

  global.PMXContextAdmit = api;
})(window);
