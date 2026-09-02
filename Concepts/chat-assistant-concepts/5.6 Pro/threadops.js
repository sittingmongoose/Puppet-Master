/* threadops.js — feature module.  OWNER: Wave 4 — Thread Ops (item 13).
 *
 * ITEM 13 — the missing thread and message operations.
 *
 * What was wrong
 * --------------
 * `renderThreadMenu` offered four rows (Pin / Rename / Fork / Archive, or
 * Restore / Fork when archived) and the message action row had no overflow at
 * all, so there was nowhere for a per-message operation to live. Eleven
 * operations were missing outright, and three of the four rows that existed
 * were wrong:
 *
 *   - `fork-thread` deep-cloned the whole thread with no `atMessageId` and no
 *     lineage while calling itself "Create a child branch with lineage". That
 *     is a DUPLICATE. ACD-447 requires a branch to carry explicit lineage over
 *     a selected message or restore point; the packet forbids cloning every
 *     raw message into a branch prompt. Canonical label: "Duplicate thread".
 *   - `archive-thread` flipped a boolean. ACD-443 makes Archive the ONE menu
 *     action that dispatches a cataloged command (`cmd.chat.archive`) — of
 *     Duplicate / Archive / Pop out / Close it is the only one — and it needs
 *     a receipt and an active-run guard.
 *   - "Restore thread" was Unarchive. The word collides with restore-point
 *     vocabulary, which the Plans forbid treating as interchangeable, so the
 *     row is now "Unarchive thread".
 *
 * The four rules this module is built around
 * ------------------------------------------
 * 1. NO MINTED COMMAND IDs. Every id in `CMD` below was read out of
 *    `Plans/assistant-chat-design.md`. Duplicate / Copy link / Pop out /
 *    Cycle layout / Close are deliberately NOT commands (ACD-443), so they
 *    dispatch nothing and say so.
 * 2. A `toast()` THAT MUTATES NOTHING IS THE FAILURE MODE. Every enabled row
 *    in this module changes a record: a thread, a message list, a restore
 *    point, a worktree binding, a context projection, or the clipboard.
 * 3. WHERE THERE IS NO DATA PATH, THE ROW IS DISABLED WITH A TRUTHFUL REASON —
 *    the honest-gap pattern `../qwen-3-8` and `../5-6-sol` use. Never a lying
 *    toast. Every disabled row's reason names the specific record that is
 *    missing, not a generic "not supported".
 * 4. REWIND IS NON-DESTRUCTIVE (kimi-k3/_shared/threadops.js:329-405). A
 *    restore point is written FIRST, the later turns fold into a collapsed
 *    restorable region, and nothing is ever deleted. `restoreRewind()` puts
 *    every folded turn back in its original position.
 *
 * Why the fold moves messages into this module instead of hiding them in CSS
 * -------------------------------------------------------------------------
 * The first design marked the rewound turns and collapsed them with a sibling
 * `:has()` rule. It cannot work here: `messageAffordance` only renders for
 * `type === 'text'` (app.js:513), so a working card, plan card or event card
 * inside the rewound region has no element this module can mark, and CSS has
 * no "until" combinator to bound the region from the anchor. Bounding it with
 * a forward-looking `:has(~ ...)` needs `:has()` inside `:has()`, which the
 * selector spec forbids. So the region is spliced out of `thread.messages` and
 * held verbatim in `store[tid].rewinds[]`, and the fold card lists what it is
 * holding. Nothing is deleted; "Restore N turns" splices them back at the
 * exact index they came from.
 *
 * data-k: overlays (menus, dialogs) are torn down and rebuilt every render, so
 * they need no key. The ONE thing this module emits inside a surface that
 * survives the 2s work tick is the rewind-anchor marker in `messageAffordance`,
 * and it carries a constant key.
 *
 * What this module does NOT add, deliberately
 * -------------------------------------------
 *   Resend            — superseded, `"resend": false`.
 *   Message-level Stop— belongs to the composer.
 *   Message delete    — `cmd.chat.delete_message` is retired from the catalog.
 *   A headerExtras registrant — that row is CLOSED (three registrants already).
 */
(function () {
  'use strict';

  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;

  /* ---------------------------------------------------------------- ids ---
     Canonical command ids, read from Plans/assistant-chat-design.md. Nothing
     here is invented: an operation with no cataloged command dispatches none
     and its receipt says "no cataloged command" rather than naming a plausible
     id that does not exist. */
  var CMD = {
    archive: 'cmd.chat.archive',
    pin: 'cmd.chat.pin',
    rename: 'cmd.chat.rename',
    del: 'cmd.chat.delete',
    exportThread: 'cmd.chat.export',
    search: 'cmd.chat.search',
    createRestorePoint: 'cmd.chat.create_restore_point',
    rewind: 'cmd.chat.rewind',
    branchFromRestore: 'cmd.chat.branch_from_restore',
    deleteRestorePoint: 'cmd.chat.delete_restore_point',
    retryMessage: 'cmd.chat.retry_message',
    request: 'cmd.thread.request',
    await_: 'cmd.thread.await',
    spawn: 'cmd.thread.spawn',
    outbox: 'cmd.thread.outbox'
  };

  var dispatched = [];
  function dispatch(cmd, tid) {
    dispatched.push({ command: cmd, threadId: tid || null, at: new Date().toISOString() });
    return cmd;
  }

  /* ------------------------------------------------------------- store ---
     Thread-local and module-private. It is NOT put on `state`, because
     `globalReset()` REASSIGNS `state` (app.js:1456) and a module holding a
     reference would go stale; the reset hook below clears this store instead. */
  var store = Object.create(null);
  function slice(tid) {
    return store[tid] || (store[tid] = { restorePoints: [], rewinds: [], requests: [], passages: [] });
  }
  var seq = 0;
  function nid(prefix) { seq += 1; return 'tops-' + prefix + '-' + seq; }

  /* The two fixture collections this module writes through to, snapshotted at
     load so Reset can put them back. `D.models`/`D.artifacts` already have this
     treatment inside app.js (FIXTURE0); these two do not, and a delete that
     unbinds a worktree has to be undoable by Reset like everything else. */
  var FIXTURE0 = null;
  function snapshotFixture() {
    var D = window.PM56_DATA;
    if (!D || FIXTURE0) return;
    FIXTURE0 = {
      worktrees: JSON.parse(JSON.stringify((D.operational && D.operational.worktrees) || [])),
      contextByThread: JSON.parse(JSON.stringify(D.contextByThread || {}))
    };
  }
  snapshotFixture();

  /* ------------------------------------------------------------ glyphs ---
     app.js's icon set has no trash, link, passage or outbox glyph. Inline SVG
     only — this project forbids emoji glyphs outright. */
  var GLYPH = {
    trash: '<path d="M4 7h16M10 4h4"/><path d="M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"/><path d="M10 11v6M14 11v6"/>',
    link: '<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.2-1.2"/>',
    passage: '<path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5"/><path d="M8 13h7M8 17h4"/>',
    outbox: '<path d="M3 14v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5"/><path d="M7 14h3l1 2h2l1-2h3"/><path d="M12 3v8M8.5 7.5 12 11l3.5-3.5"/>'
  };
  function svg(name, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (GLYPH[name] || '') + '</svg>';
  }
  function gi(ctx, o, size) {
    return o.glyph ? svg(o.glyph, size || 13) : ctx.icon(o.icon || 'info', size || 13);
  }

  /* -------------------------------------------------------- small utils --- */
  function threadById(ctx, id) {
    var list = ctx.state.threads || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function msgIndexIn(t, id) {
    var ms = (t && t.messages) || [];
    for (var i = 0; i < ms.length; i++) if (ms[i].id === id) return i;
    return -1;
  }
  function lbl(ctx, map, v) {
    var m = ctx.D && ctx.D.labels && ctx.D.labels[map];
    return (m && m[v]) || v;
  }
  function clockOf(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function snippet(m, n) {
    var s = (m && (m.body || m.title || m.detail || '')) || '';
    s = String(s).replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }
  function turnLabel(t, m) {
    var i = msgIndexIn(t, m.id);
    return i < 0 ? 'this turn' : 'turn ' + (i + 1);
  }

  /* Receipts. `addReceipt()` in app.js always appends to the ACTIVE thread, so
     archiving a thread you are not looking at would file its receipt in the
     wrong transcript. This one names the thread it writes to. */
  function receipt(ctx, thread, type, title, detail, extra) {
    var now = new Date().toISOString();
    var msg = {
      id: nid(type),
      role: 'system',
      type: type,
      title: title,
      detail: detail,
      time: now,
      sentAt: now
    };
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) msg[k] = extra[k];
    ctx.appendMessage(msg, thread);
    return msg;
  }
  function cmdNote(cmd) { return cmd ? ' Dispatched ' + cmd + '.' : ' No cataloged command: this is a surface affordance (ACD-443).'; }

  /* -------------------------------------------------------- worktrees ---
     Driven entirely by `D.operational.worktrees`, which ships all four bind
     states with a `threadId` back-reference. Nothing about the delete dialog's
     worktree wording is a literal. */
  function worktreeFor(ctx, t) {
    var list = (ctx.D.operational && ctx.D.operational.worktrees) || [];
    var byId = null, byThread = null;
    for (var i = 0; i < list.length; i++) {
      if (t.worktree && list[i].id === t.worktree) byId = list[i];
      if (list[i].threadId === t.id) byThread = list[i];
    }
    return byId || byThread || null;
  }
  function worktreeState(ctx, w) {
    if (!w) return null;
    var bound = String(w.state || '').indexOf('bound') === 0;
    return {
      rec: w,
      bound: bound,
      hasCheckout: bound && !!w.path,
      dirty: (w.dirtyFiles || 0) > 0 || (w.conflicts && w.conflicts.length > 0),
      dirtyFiles: w.dirtyFiles || 0,
      conflicts: w.conflicts || [],
      label: w.label || w.id,
      stateLabel: lbl(ctx, 'worktreeState', w.state) || w.stateLabel || w.state
    };
  }

  /* ====================================================================== */
  /*  OPERATIONS                                                            */
  /* ====================================================================== */

  /* --- Duplicate (the corrected `fork-thread`) --------------------------
     A duplicate is NOT a branch: it copies the conversation and carries no
     lineage and no message anchor, which is exactly why it may not be called
     one. ACD-443 lists Duplicate among the affordances with no command. */
  function duplicateThread(ctx, src) {
    var copy = ctx.clone(src);
    copy.id = nid('dup');
    copy.title = src.title + ' · Copy';
    copy.pinned = false;
    copy.archived = false;
    copy.unread = 0;
    copy.updated = 'now';
    copy.summary = 'Duplicate of ' + src.title;
    copy.worktree = null;          /* a copy does not inherit a worktree binding */
    copy.lineage = null;           /* stated absence: a duplicate has no lineage */
    ctx.state.threads.unshift(copy);
    if (window.PM56_CTX && window.PM56_CTX.seedThread) window.PM56_CTX.seedThread(copy.id, src.id, 'duplicate');
    ctx.switchThread(copy.id);
    receipt(ctx, copy, 'threadops-duplicate', 'Thread duplicated',
      'Copied ' + plural(copy.messages.length, 'turn', 'turns') + ' from “' + src.title +
      '”. This is a copy, not a branch: it carries no lineage and no message anchor.' + cmdNote(null));
    return copy;
  }

  /* --- Branch (the operation `fork-thread` pretended to be) -------------
     ACD-447: explicit lineage over a SELECTED MESSAGE, a new model or Persona
     only through a requested/effective resolution, and the original branch is
     never mutated apart from its own lineage card. Cloned message ids are kept
     rather than remapped, so a thread-local overlay keyed by message id (the
     Context Lens store) still recognises the covered prefix on the branch —
     the same preservation kimi-k3 does explicitly. */
  function resolveModel(ctx, modelId) {
    var models = ctx.D.models || [];
    var requested = null;
    for (var i = 0; i < models.length; i++) if (models[i].id === modelId) requested = models[i];
    if (!requested) return null;
    var effective = requested;
    var degraded = requested.status && requested.status !== 'ready';
    if (degraded) {
      var cur = ctx.selectedModel();
      effective = (cur && cur.status === 'ready') ? cur : requested;
    }
    return {
      requested: requested,
      effective: effective,
      degraded: degraded && effective !== requested,
      reason: degraded ? lbl(ctx, 'modelStatus', requested.status) : null
    };
  }

  function branchThread(ctx, src, atMessageId, opts) {
    opts = opts || {};
    var at = atMessageId ? msgIndexIn(src, atMessageId) : src.messages.length - 1;
    if (at < 0) at = src.messages.length - 1;
    var anchor = src.messages[at] || null;

    var suffix = ' · Branch';
    var route = null;
    if (opts.modelId) {
      route = resolveModel(ctx, opts.modelId);
      if (route) suffix = ' · ' + route.effective.name;
    } else if (opts.persona) {
      suffix = ' · ' + opts.persona;
    }

    var nt = {
      id: nid('branch'),
      title: src.title + suffix,
      status: 'idle',
      pinned: false,
      archived: false,
      unread: 0,
      updated: 'now',
      model: route ? route.effective.name : src.model,
      summary: 'Branched from ' + src.title + ' at turn ' + (at + 1),
      worktree: null,
      messages: ctx.clone(src.messages.slice(0, at + 1)),
      lineage: {
        kind: opts.persona ? 'branch-persona' : (opts.modelId ? 'branch-model' : 'branch'),
        sourceThreadId: src.id,
        sourceTitle: src.title,
        atMessageId: anchor ? anchor.id : null,
        atTurn: at + 1,
        coveredTurns: at + 1,
        requested: { model: route ? route.requested.name : null, persona: opts.persona || null },
        effective: { model: route ? route.effective.name : null, persona: opts.persona || null },
        createdAt: new Date().toISOString()
      }
    };
    ctx.state.threads.unshift(nt);
    if (window.PM56_CTX && window.PM56_CTX.seedThread) window.PM56_CTX.seedThread(nt.id, src.id, 'branch');

    var detail = 'A branch of ' + plural(at + 1, 'turn', 'turns') + ' was created from ' +
      (anchor ? turnLabel(src, anchor) : 'the latest turn') + '. The original thread is unchanged.';
    if (route) {
      detail += ' Requested model ' + route.requested.name +
        (route.degraded ? '; effective ' + route.effective.name + ' because the requested route is ' + route.reason + '.' : '; effective the same.');
    }
    if (opts.persona) detail += ' Persona ' + opts.persona + ' applies to the branch only.';
    detail += cmdNote(opts.command || null);

    /* The lineage card lands on the SOURCE transcript (kimi-k3 does the same):
       that is what makes the branch discoverable from where it was taken. */
    receipt(ctx, src, 'threadops-branch', 'Branched from ' + (anchor ? turnLabel(src, anchor) : 'the latest turn'), detail, {
      branchThreadId: nt.id, branchTitle: nt.title
    });
    ctx.switchThread(nt.id);
    return nt;
  }

  /* --- Restore points --------------------------------------------------- */
  function createRestorePoint(ctx, t, atMessage, label) {
    var s = slice(t.id);
    var at = atMessage ? msgIndexIn(t, atMessage.id) : t.messages.length - 1;
    if (at < 0) at = t.messages.length - 1;
    var rp = {
      id: nid('rp'),
      label: label || ('Restore point ' + (s.restorePoints.length + 1)),
      threadId: t.id,
      atMessageId: t.messages[at] ? t.messages[at].id : null,
      atTurn: at + 1,
      messageCount: at + 1,
      createdAt: new Date().toISOString(),
      immutable: true,
      deleted: false,
      /* Immutable means immutable: the covered prefix is captured here, so a
         later edit to the live thread cannot rewrite what the point restores. */
      snapshot: ctx.clone(t.messages.slice(0, at + 1))
    };
    s.restorePoints.push(rp);
    dispatch(CMD.createRestorePoint, t.id);
    receipt(ctx, t, 'threadops-restore-point', 'Restore point created',
      rp.label + ' is anchored at turn ' + rp.atTurn + ' and covers ' +
      plural(rp.messageCount, 'turn', 'turns') + '. It is immutable.' + cmdNote(CMD.createRestorePoint),
      { restorePointId: rp.id });
    return rp;
  }

  function findRestorePoint(id) {
    for (var tid in store) {
      var rps = store[tid].restorePoints;
      for (var i = 0; i < rps.length; i++) if (rps[i].id === id) return rps[i];
    }
    return null;
  }

  function deleteRestorePoint(ctx, rp) {
    var t = threadById(ctx, rp.threadId);
    rp.deleted = true;
    rp.deletedAt = new Date().toISOString();
    dispatch(CMD.deleteRestorePoint, rp.threadId);
    if (t) {
      receipt(ctx, t, 'threadops-restore-deleted', 'Restore point deleted',
        rp.label + ' (turn ' + rp.atTurn + ') was removed. The turns it covered are untouched and still in this thread.' +
        cmdNote(CMD.deleteRestorePoint));
    }
    return rp;
  }

  function branchFromRestore(ctx, rp) {
    var src = threadById(ctx, rp.threadId);
    if (!src) return null;
    var nt = {
      id: nid('rpbranch'),
      title: src.title + ' · ' + rp.label,
      status: 'idle', pinned: false, archived: false, unread: 0, updated: 'now',
      model: src.model,
      summary: 'Branched from ' + rp.label + ' of ' + src.title,
      worktree: null,
      /* The SNAPSHOT, not the live prefix: that is what an immutable restore
         point is for. */
      messages: ctx.clone(rp.snapshot),
      lineage: {
        kind: 'branch-from-restore',
        sourceThreadId: src.id,
        sourceTitle: src.title,
        restorePointId: rp.id,
        restorePointLabel: rp.label,
        atMessageId: rp.atMessageId,
        atTurn: rp.atTurn,
        coveredTurns: rp.messageCount,
        createdAt: new Date().toISOString()
      }
    };
    ctx.state.threads.unshift(nt);
    if (window.PM56_CTX && window.PM56_CTX.seedThread) window.PM56_CTX.seedThread(nt.id, src.id, 'branch-from-restore');
    dispatch(CMD.branchFromRestore, src.id);
    receipt(ctx, src, 'threadops-branch', 'Branched from ' + rp.label,
      plural(rp.messageCount, 'turn', 'turns') + ' were restored into a sibling branch from the immutable snapshot taken at turn ' +
      rp.atTurn + '. This thread is unchanged and the restore point is still available.' + cmdNote(CMD.branchFromRestore),
      { branchThreadId: nt.id, branchTitle: nt.title });
    ctx.switchThread(nt.id);
    return nt;
  }

  /* --- Rewind (non-destructive) ---------------------------------------- */
  function rewindTo(ctx, t, m) {
    var at = msgIndexIn(t, m.id);
    if (at < 0 || at >= t.messages.length - 1) return null;

    /* Restore point FIRST. If this throws, nothing has been folded yet. */
    var rp = createRestorePoint(ctx, t, m, 'Before rewind to turn ' + (at + 1));

    /* Everything after the anchor is captured verbatim BEFORE the restore
       point card and the fold card are appended, so those two stay visible. */
    var folded = t.messages.splice(at + 1, t.messages.length - (at + 1));
    /* The restore-point card was appended by createRestorePoint and is now
       inside `folded`; pull it back out so the audit trail stays on screen. */
    var keep = [];
    folded = folded.filter(function (x) {
      if (x.type === 'threadops-restore-point' && x.restorePointId === rp.id) { keep.push(x); return false; }
      return true;
    });
    for (var i = 0; i < keep.length; i++) t.messages.push(keep[i]);

    var rec = {
      id: nid('rw'),
      threadId: t.id,
      restorePointId: rp.id,
      atMessageId: m.id,
      atTurn: at + 1,
      atIndex: at + 1,
      createdAt: new Date().toISOString(),
      restored: false,
      messages: folded
    };
    slice(t.id).rewinds.push(rec);
    dispatch(CMD.rewind, t.id);
    receipt(ctx, t, 'threadops-rewind', 'Rewound to turn ' + rec.atTurn,
      plural(folded.length, 'later turn is', 'later turns are') + ' folded into a restorable region. Nothing was deleted: ' +
      rp.label + ' was written first and Restore puts every folded turn back where it was.' + cmdNote(CMD.rewind),
      { rewindId: rec.id, restorePointId: rp.id });
    return rec;
  }

  function findRewind(id) {
    for (var tid in store) {
      var rw = store[tid].rewinds;
      for (var i = 0; i < rw.length; i++) if (rw[i].id === id) return rw[i];
    }
    return null;
  }

  function restoreRewind(ctx, rec) {
    var t = threadById(ctx, rec.threadId);
    if (!t || rec.restored) return null;
    var at = msgIndexIn(t, rec.atMessageId);
    var insertAt = at < 0 ? t.messages.length : at + 1;
    var args = [insertAt, 0].concat(rec.messages);
    Array.prototype.splice.apply(t.messages, args);
    var n = rec.messages.length;
    rec.restored = true;
    rec.restoredAt = new Date().toISOString();
    rec.messages = [];
    /* Mutate the fold card in place rather than appending a second card: one
       record of the fold, in one state, is what makes the trail readable. */
    for (var i = 0; i < t.messages.length; i++) {
      var x = t.messages[i];
      if (x.type === 'threadops-rewind' && x.rewindId === rec.id) {
        x.title = 'Rewind to turn ' + rec.atTurn + ' restored';
        x.detail = plural(n, 'folded turn was', 'folded turns were') + ' returned to their original position. ' +
          'The restore point written before the rewind is still available.';
      }
    }
    ctx.renderApp();
    return n;
  }

  /* --- Archive / Unarchive / Pin / Rename ------------------------------ */
  function activeRunIn(t) {
    /* `!active_run_in_thread`: the guard the plan asks for. `working` and
       `recovering` are the two thread states that mean a run owns the thread. */
    return t.status === 'working' || t.status === 'recovering';
  }
  function archiveThread(ctx, t) {
    if (activeRunIn(t)) {
      /* NOT a toast: a refusal is recorded on the thread it refers to, which is
         a real mutation and a real audit trail. */
      receipt(ctx, t, 'threadops-refused', 'Archive refused',
        'A run is active in this thread (' + ctx.statusLabel(t.status) + '). ' +
        'Archiving is blocked while a run owns the thread; stop or complete the run first.' + cmdNote(null));
      ctx.state.menu = null;
      ctx.renderApp();
      return false;
    }
    t.archived = true;
    t.pinned = false;
    t.updated = 'now';
    dispatch(CMD.archive, t.id);
    receipt(ctx, t, 'threadops-archive', 'Thread archived',
      '“' + t.title + '” is hidden from the active groups and stays searchable.' + cmdNote(CMD.archive));
    ctx.state.menu = null;
    ctx.renderApp();
    return true;
  }
  function unarchiveThread(ctx, t) {
    t.archived = false;
    t.updated = 'now';
    dispatch(CMD.archive, t.id);
    receipt(ctx, t, 'threadops-archive', 'Thread unarchived',
      '“' + t.title + '” is back in Recent. This is the archive flag, not a restore point.' + cmdNote(CMD.archive));
    ctx.state.menu = null;
    ctx.renderApp();
    return true;
  }

  /* --- Export ----------------------------------------------------------- */
  var lastExport = null;
  function exportThread(ctx, t) {
    var s = slice(t.id);
    var payload = {
      exportedAt: new Date().toISOString(),
      format: 'pm56-thread-export/1',
      thread: {
        id: t.id, title: t.title, status: t.status, archived: !!t.archived, pinned: !!t.pinned,
        model: t.model, worktree: t.worktree || null, summary: t.summary,
        lineage: t.lineage || null, messageCount: t.messages.length
      },
      messages: t.messages.map(function (m) {
        return {
          id: m.id, role: m.role, type: m.type, sentAt: m.sentAt || m.time || null,
          body: m.body || null, title: m.title || null, detail: m.detail || null,
          runtime: m.runtime || null
        };
      }),
      restorePoints: s.restorePoints.map(function (r) {
        return { id: r.id, label: r.label, atMessageId: r.atMessageId, atTurn: r.atTurn, messageCount: r.messageCount, createdAt: r.createdAt, deleted: !!r.deleted };
      }),
      foldedRegions: s.rewinds.map(function (r) {
        return { id: r.id, atMessageId: r.atMessageId, atTurn: r.atTurn, restored: !!r.restored, foldedTurns: r.messages.length };
      })
    };
    var name = 'pm56-thread-' + t.id + '.json';
    var text = JSON.stringify(payload, null, 2);
    var url = null;
    try {
      var blob = new Blob([text], { type: 'application/json' });
      url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url; link.download = name; link.style.display = 'none';
      document.body.appendChild(link); link.click(); link.remove();
      lastExport = { name: name, bytes: text.length, threadId: t.id, at: new Date().toISOString() };
      dispatch(CMD.exportThread, t.id);
      receipt(ctx, t, 'threadops-export', 'Thread exported',
        name + ' · ' + plural(payload.messages.length, 'turn', 'turns') + ' · ' + text.length +
        ' bytes, including restore points and folded regions.' + cmdNote(CMD.exportThread));
      return true;
    } catch (err) {
      /* No success receipt on a failure path. The concept already had one lying
         export ("Redacted context exported" that exported nothing); this one
         says what actually happened. */
      ctx.toast('Export unavailable', 'This browser blocked the download, so nothing was written. The thread is unchanged.');
      return false;
    } finally {
      if (url) setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }
  }

  /* --- Delete ----------------------------------------------------------- */
  function deleteThread(ctx, t, mode) {
    var list = ctx.state.threads;
    var idx = list.indexOf(t);
    if (idx < 0) return false;
    if (list.length <= 1) return false;

    var w = worktreeState(ctx, worktreeFor(ctx, t));
    var wnote = 'No worktree was bound to this thread.';
    if (w) {
      if (mode === 'remove' && w.hasCheckout) {
        w.rec.state = 'unbound';
        w.rec.stateLabel = lbl(ctx, 'worktreeState', 'unbound');
        w.rec.path = null;
        w.rec.threadId = null;
        w.rec.dirtyFiles = 0;
        if (w.rec.conflicts) w.rec.conflicts = [];
        wnote = 'Worktree ' + w.label + ' was removed; the branch remains with no checkout.';
      } else {
        if (w.rec.threadId === t.id) w.rec.threadId = null;
        wnote = 'Worktree ' + w.label + ' was kept' + (w.dirty ? ' with its ' + plural(w.dirtyFiles, 'uncommitted file', 'uncommitted files') : '') + ' and is no longer bound to a thread.';
      }
    }

    var title = t.title, count = t.messages.length;
    list.splice(idx, 1);
    delete store[t.id];
    ctx.state.dialog = null;
    dispatch(CMD.del, t.id);
    var next = list[Math.min(idx, list.length - 1)];
    ctx.switchThread(next.id);
    receipt(ctx, next, 'threadops-delete', 'Thread deleted',
      '“' + title + '” and its ' + plural(count, 'turn', 'turns') + ' were deleted. ' + wnote + cmdNote(CMD.del));
    return true;
  }

  /* --- Add passage to context ------------------------------------------
     Real, and only where the fixture can carry it: `D.contextByThread` has a
     record for five threads. For a thread with no record, `context.js` falls
     back to the GLOBAL `D.contextSources`, so writing there would change every
     recordless thread's projection at once. That is why the row is disabled
     with that exact reason instead of quietly mutating the wrong record. */
  function passageRecord(ctx, t) {
    var by = ctx.D.contextByThread || {};
    var rec = by[t.id];
    if (!rec || !Array.isArray(rec.sources) || !rec.window || !rec.window.limit) return null;
    return rec;
  }
  function rebalance(rec) {
    var used = 0, i;
    for (i = 0; i < rec.sources.length; i++) used += rec.sources[i].tokens || 0;
    rec.window.used = used;
    rec.window.available = rec.window.limit - used;
    rec.window.pct = Math.round(used / rec.window.limit * 1000) / 10;
    for (i = 0; i < rec.sources.length; i++) {
      rec.sources[i].pct = used ? Math.round((rec.sources[i].tokens || 0) / used * 100) : 0;
    }
  }
  function addPassage(ctx, t, m) {
    var rec = passageRecord(ctx, t);
    if (!rec) return null;
    var text = snippet(m, 4000);
    var tokens = Math.max(1, Math.round(text.length / 4));
    var src = null;
    for (var i = 0; i < rec.sources.length; i++) if (rec.sources[i].id === 'pinned-passages') src = rec.sources[i];
    if (!src) {
      src = { id: 'pinned-passages', family: 'Pinned passages', colour: 'var(--accent-2)', tokens: 0, pct: 0, supersededTokens: 0, detail: '' };
      rec.sources.push(src);
    }
    src.tokens += tokens;
    var s = slice(t.id);
    s.passages.push({ id: nid('psg'), messageId: m.id, tokens: tokens, turn: msgIndexIn(t, m.id) + 1, text: snippet(m, 180) });
    src.detail = plural(s.passages.filter(function (p) { return !p.removed; }).length, 'passage', 'passages') + ' pinned from this thread.';
    rebalance(rec);
    receipt(ctx, t, 'threadops-passage', 'Passage added to context',
      'About ' + tokens + ' tokens from ' + turnLabel(t, m) + ' are now a pinned context source. The window reads ' +
      rec.window.pct + '% used.' + cmdNote(null),
      { passageId: s.passages[s.passages.length - 1].id });
    return s.passages[s.passages.length - 1];
  }
  function removePassage(ctx, tid, pid) {
    var t = threadById(ctx, tid);
    var rec = t && passageRecord(ctx, t);
    var s = slice(tid), p = null, i;
    for (i = 0; i < s.passages.length; i++) if (s.passages[i].id === pid) p = s.passages[i];
    if (!p || p.removed || !rec) return false;
    p.removed = true;
    for (i = 0; i < rec.sources.length; i++) {
      if (rec.sources[i].id === 'pinned-passages') {
        rec.sources[i].tokens = Math.max(0, rec.sources[i].tokens - p.tokens);
        rec.sources[i].detail = plural(s.passages.filter(function (x) { return !x.removed; }).length, 'passage', 'passages') + ' pinned from this thread.';
      }
    }
    rebalance(rec);
    for (i = 0; i < t.messages.length; i++) {
      if (t.messages[i].passageId === pid) {
        t.messages[i].title = 'Passage removed from context';
        t.messages[i].detail = 'About ' + p.tokens + ' tokens from turn ' + p.turn + ' are no longer a pinned context source. The window reads ' + rec.window.pct + '% used.';
      }
    }
    ctx.renderApp();
    return true;
  }

  /* --- Retry ------------------------------------------------------------
     `runtime.terminal` is the turn's own record. Retry never rewrites it:
     ACD-447 forbids recreating provider state by transcript rewriting, so the
     failed turn keeps its terminal and the retry lands as a NEW turn. */
  function retryEligibility(ctx, m) {
    if (!m || m.role !== 'assistant' || m.type !== 'text') return { ok: false, reason: 'Retry applies to an assistant turn.' };
    var rt = m.runtime;
    if (!rt || !rt.terminal) return { ok: false, reason: 'This turn carries no runtime record, so there is no terminal state to retry from.' };
    var label = lbl(ctx, 'terminal', rt.terminal);
    if (rt.terminal === 'error') {
      return { ok: true, reason: rt.error ? label + ' · ' + rt.error : label + ' · no reason was reported.' };
    }
    if (rt.terminal === 'stopped') return { ok: true, reason: label + ' · run it again from the same prompt.' };
    /* The mapped label goes on screen verbatim. Lowercasing it mid-sentence
       would turn "Stopped by user" into prose and stop it being the label. */
    return { ok: false, reason: 'This turn is recorded as “' + label + '”. Retry is offered on a turn that ended in error or was stopped by the user.' };
  }
  function retryMessage(ctx, t, m) {
    var el = retryEligibility(ctx, m);
    if (!el.ok) return false;
    var rt = m.runtime;
    var now = new Date();
    var again = {
      id: nid('retry'),
      role: 'assistant',
      type: 'text',
      body: 'Retried the turn recorded as “' + lbl(ctx, 'terminal', rt.terminal) +
        '”. The original attempt is preserved above with its terminal state; this is a new turn on the same prompt.',
      time: now.toISOString(),
      sentAt: now.toISOString(),
      retryOf: m.id,
      runtime: (function () {
        var c = ctx.clone(rt);
        c.terminal = 'complete';
        delete c.error;
        c.startedAt = now.toISOString();
        c.completedAt = now.toISOString();
        return c;
      })()
    };
    dispatch(CMD.retryMessage, t.id);
    receipt(ctx, t, 'threadops-retry', 'Retrying ' + turnLabel(t, m),
      el.reason + ' The failed turn keeps its terminal state; the retry is a new turn.' + cmdNote(CMD.retryMessage));
    ctx.appendMessage(again, t);
    return true;
  }

  /* --- Cross-thread requests ------------------------------------------- */
  var FANOUT_CAP = 3;
  function allRequests() {
    var out = [];
    for (var tid in store) {
      var rs = store[tid].requests;
      for (var i = 0; i < rs.length; i++) out.push(rs[i]);
    }
    return out;
  }
  function openRequestsFrom(tid) {
    return allRequests().filter(function (r) { return r.sourceThread === tid && r.status === 'pending'; });
  }
  function chainReaches(target, source) {
    var all = allRequests(), node = target, seen = {}, guard = 0;
    while (node && guard < 64) {
      guard += 1;
      if (node === source) return true;
      if (seen[node]) return false;
      seen[node] = true;
      var next = null;
      for (var i = 0; i < all.length; i++) if (all[i].sourceThread === node && all[i].status === 'pending') { next = all[i].targetThread; break; }
      node = next;
    }
    return false;
  }
  function requestReason(ctx, src, target) {
    if (src.id === target.id) return 'A thread cannot request from itself.';
    if (chainReaches(target.id, src.id)) return '“' + target.title + '” is already part of this thread’s request chain; that would close a loop.';
    return null;
  }
  function sendRequest(ctx, src, target, task) {
    var rec = {
      id: nid('req'),
      sourceThread: src.id, sourceTitle: src.title,
      targetThread: target.id, targetTitle: target.title,
      task: task || 'Summarise the decisions in this thread that affect ' + src.title + '.',
      scope: 'read',
      status: 'pending',
      attempts: 1,
      createdAt: new Date().toISOString()
    };
    slice(target.id).requests.push(rec);
    dispatch(CMD.request, src.id);
    receipt(ctx, src, 'threadops-request', 'Requested from “' + target.title + '”',
      rec.task + ' Scope: bounded read. The record lives on the target thread; this card tracks it.' + cmdNote(CMD.request),
      { requestId: rec.id });
    return rec;
  }
  function findRequest(id) {
    var all = allRequests();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function awaitRequest(ctx, rec) {
    if (!rec || rec.status !== 'pending') return false;
    rec.status = 'answered';
    rec.respondedAt = new Date().toISOString();
    rec.result = 'Bounded answer from “' + rec.targetTitle + '”: the referenced decisions and their evidence, with no raw transcript copied across.';
    var src = threadById(ctx, rec.sourceThread);
    dispatch(CMD.await_, rec.sourceThread);
    if (src) {
      for (var i = 0; i < src.messages.length; i++) {
        if (src.messages[i].requestId === rec.id) {
          src.messages[i].title = 'Answered by “' + rec.targetTitle + '”';
          src.messages[i].detail = rec.result;
        }
      }
      ctx.renderApp();
    }
    return true;
  }
  function cancelRequest(ctx, rec) {
    if (!rec || rec.status !== 'pending') return false;
    rec.status = 'cancelled';
    rec.cancelledAt = new Date().toISOString();
    var src = threadById(ctx, rec.sourceThread);
    dispatch(CMD.outbox, rec.sourceThread);
    if (src) {
      for (var i = 0; i < src.messages.length; i++) {
        if (src.messages[i].requestId === rec.id) {
          src.messages[i].title = 'Request cancelled';
          src.messages[i].detail = 'The bounded request to “' + rec.targetTitle + '” was withdrawn before it was answered.';
        }
      }
      ctx.renderApp();
    }
    return true;
  }
  function retryRequest(ctx, rec) {
    if (!rec || rec.status !== 'pending') return false;
    rec.attempts += 1;
    rec.retriedAt = new Date().toISOString();
    var src = threadById(ctx, rec.sourceThread);
    dispatch(CMD.outbox, rec.sourceThread);
    if (src) {
      for (var i = 0; i < src.messages.length; i++) {
        if (src.messages[i].requestId === rec.id) {
          src.messages[i].detail = rec.task + ' Attempt ' + rec.attempts + ', still pending on “' + rec.targetTitle + '”.';
        }
      }
      ctx.renderApp();
    }
    return true;
  }
  function spawnThread(ctx, src) {
    var last = src.messages[src.messages.length - 1] || null;
    var nt = {
      id: nid('spawn'),
      title: 'Related to ' + src.title,
      status: 'idle', pinned: false, archived: false, unread: 0, updated: 'now',
      model: src.model,
      summary: 'Sibling thread spawned from ' + src.title,
      worktree: null,
      /* A spawn starts empty on purpose: it carries lineage and a stated task,
         NOT a copy of the parent's turns. Cloning raw messages into a related
         thread is the thing the packet forbids. */
      messages: [],
      lineage: {
        kind: 'spawn',
        sourceThreadId: src.id,
        sourceTitle: src.title,
        atMessageId: last ? last.id : null,
        atTurn: src.messages.length,
        coveredTurns: 0,
        createdAt: new Date().toISOString()
      }
    };
    ctx.state.threads.unshift(nt);
    if (window.PM56_CTX && window.PM56_CTX.seedThread) window.PM56_CTX.seedThread(nt.id, src.id, 'spawn');
    dispatch(CMD.spawn, src.id);
    receipt(ctx, src, 'threadops-spawn', 'Spawned a related thread',
      '“' + nt.title + '” carries lineage back to ' + (last ? turnLabel(src, last) : 'this thread') +
      ' and starts empty: no raw turn was copied into it.' + cmdNote(CMD.spawn),
      { spawnThreadId: nt.id });
    ctx.switchThread(nt.id);
    return nt;
  }

  /* ====================================================================== */
  /*  ROW RENDERING                                                         */
  /* ====================================================================== */

  function menuRow(ctx, o) {
    var esc = ctx.esc;
    var dis = !!o.disabled;
    var body = dis ? (o.reason || 'Not available here.') : (o.detail || '');
    return '<button class="menu-item pm-tops-row' + (o.danger ? ' is-danger' : '') + (dis ? ' is-disabled' : '') + '"' +
      (dis ? ' disabled aria-disabled="true"' : ' data-action="' + esc(o.action) + '"' +
        (o.id != null ? ' data-id="' + esc(o.id) + '"' : '') +
        (o.value != null ? ' data-value="' + esc(o.value) + '"' : '')) +
      ' title="' + esc(dis ? (o.reason || '') : (o.detail || o.label)) + '">' +
      '<span class="menu-icon">' + gi(ctx, o, 13) + '</span>' +
      '<span class="menu-copy"><strong>' + esc(o.label) + '</strong><span>' + esc(body) + '</span></span>' +
      /* A "0" chip is noise: the row's own subtitle already says the list is
         empty, and a badge reading zero reads as a badge that failed. */
      (o.count ? '<span class="pm-tops-count">' + esc(String(o.count)) + '</span>' : '') +
      '</button>';
  }

  function threadRows(ctx, t) {
    var s = slice(t.id);
    var rows = [];
    var live = s.restorePoints.filter(function (r) { return !r.deleted; }).length;
    var pending = openRequestsFrom(t.id).length;
    var last = ctx.state.threads.length <= 1;

    if (t.archived) {
      rows.push(menuRow(ctx, {
        label: 'Unarchive thread', icon: 'restore', action: 'unarchive-thread', id: t.id,
        detail: 'Return it to Recent. This is the archive flag, not a restore point.'
      }));
    }
    rows.push(menuRow(ctx, {
      label: 'Duplicate thread', icon: 'copy', action: 'duplicate-thread', id: t.id,
      detail: 'Copy this conversation into a new thread. No lineage and no anchor: a copy is not a branch.'
    }));
    rows.push(menuRow(ctx, {
      label: 'Export thread', icon: 'download', action: 'export-thread', id: t.id,
      detail: 'Write ' + plural(t.messages.length, 'turn', 'turns') + ', restore points and folded regions to a JSON file.'
    }));
    rows.push(menuRow(ctx, {
      label: 'Restore points', glyph: null, icon: 'history', action: 'open-restore-points', id: t.id, count: live,
      detail: live ? plural(live, 'immutable point', 'immutable points') + ' · branch from one or delete it.'
        : 'None yet. Create one from a turn’s More menu, or from here at the latest turn.'
    }));
    rows.push('<div class="menu-divider"></div><div class="menu-section-label">Related threads</div>');
    rows.push(menuRow(ctx, {
      label: 'Spawn related thread', icon: 'branch', action: 'spawn-related-thread', id: t.id,
      detail: 'A sibling with lineage back to this thread and no copied turns.'
    }));
    rows.push(menuRow(ctx, pending >= FANOUT_CAP ? {
      label: 'Request from another thread', icon: 'users', disabled: true,
      reason: 'This thread already has ' + FANOUT_CAP + ' open requests. Await or cancel one before fanning out further.'
    } : {
      label: 'Request from another thread', icon: 'users', action: 'open-thread-request', id: t.id,
      detail: 'A bounded, typed read of another thread. Loops and fan-out past ' + FANOUT_CAP + ' are refused.'
    }));
    rows.push(menuRow(ctx, pending ? {
      label: 'Await response', icon: 'refresh', action: 'await-oldest-request', id: t.id, count: pending,
      detail: 'Resolve the oldest of ' + plural(pending, 'open request', 'open requests') + '.'
    } : {
      label: 'Await response', icon: 'refresh', disabled: true,
      reason: 'Nothing to await: this thread has no open request.'
    }));
    rows.push(menuRow(ctx, {
      label: 'Outbox', glyph: 'outbox', action: 'open-thread-outbox', id: t.id, count: pending,
      detail: pending ? 'Retry or cancel ' + plural(pending, 'queued request', 'queued requests') + '.'
        : 'Empty. Queued cross-thread requests appear here with retry and cancel.'
    }));
    rows.push('<div class="menu-divider"></div>');
    rows.push(menuRow(ctx, {
      label: 'Copy link', glyph: 'link', action: 'copy-thread-link', id: t.id,
      detail: 'Copy a deep link to this thread. Not a cataloged command.'
    }));
    if (!t.archived) {
      /* The one menu action the Plans require to dispatch a cataloged command
         (ACD-443). app.js rendered it unconditionally enabled, so the
         `!active_run_in_thread` guard could only be discovered by clicking it;
         here the guard is on screen before the click. */
      rows.push(menuRow(ctx, activeRunIn(t) ? {
        label: 'Archive', icon: 'archive', disabled: true,
        reason: 'A run is active in this thread (' + ctx.statusLabel(t.status) + '). Archiving is blocked while a run owns the thread.'
      } : {
        label: 'Archive', icon: 'archive', action: 'archive-thread', id: t.id,
        detail: 'Hide from active groups, keep searchable. Dispatches ' + CMD.archive + '.'
      }));
    }
    rows.push(menuRow(ctx, last ? {
      label: 'Delete thread', glyph: 'trash', disabled: true, danger: true,
      reason: 'This is the only thread left. Deleting it would leave the concept with no conversation to render.'
    } : {
      label: 'Delete thread', glyph: 'trash', action: 'delete-thread', id: t.id, danger: true,
      detail: 'Delete the thread and choose what happens to its worktree.'
    }));
    return '<div class="pm-tops-rows">' + rows.join('') + '</div>';
  }

  /* ====================================================================== */
  /*  MESSAGE OVERFLOW  (registered into Wave 3 Transcript's disclosure)     */
  /* ====================================================================== */

  function overflowItems(ctx, m) {
    var t = ctx.thread || ctx.activeThread();
    if (!t || !m || m.type !== 'text') return [];
    /* This module's own receipt and fold cards are system cards, not turns. */
    if (m.role === 'system') return [];

    var s = slice(t.id);
    var idx = msgIndexIn(t, m.id);
    var isLast = idx === t.messages.length - 1;
    var rpHere = null;
    for (var i = 0; i < s.restorePoints.length; i++) {
      if (!s.restorePoints[i].deleted && s.restorePoints[i].atMessageId === m.id) rpHere = s.restorePoints[i];
    }
    var items = [];

    items.push({
      id: 'branch', label: 'Branch from here', icon: 'branch', action: 'branch-from-message', value: m.id,
      detail: 'A new thread carrying the first ' + plural(idx + 1, 'turn', 'turns') + ' and explicit lineage to this one.'
    });
    items.push({
      id: 'branch-model', label: 'Branch with another model', icon: 'brain', action: 'open-branch-model', value: m.id,
      detail: 'Same anchor, a new requested route. The effective route is resolved and recorded.'
    });
    items.push({
      id: 'branch-persona', label: 'Branch with another Persona', icon: 'users', action: 'open-branch-persona', value: m.id,
      detail: 'Same anchor, a Persona that applies to the branch only.'
    });
    items.push(rpHere ? {
      id: 'rp', label: 'Create restore point', icon: 'restore', disabled: true,
      reason: rpHere.label + ' already covers this turn. Restore points are immutable, so a second one here would say the same thing.'
    } : {
      id: 'rp', label: 'Create restore point', icon: 'restore', action: 'create-restore-point', value: m.id,
      detail: 'An immutable snapshot of the first ' + plural(idx + 1, 'turn', 'turns') + '. Dispatches ' + CMD.createRestorePoint + '.'
    });
    items.push(isLast ? {
      id: 'rewind', label: 'Rewind to here', icon: 'history', disabled: true,
      reason: 'This is the last turn in the thread, so there is nothing after it to fold.'
    } : {
      id: 'rewind', label: 'Rewind to here', icon: 'history', action: 'rewind-to-message', value: m.id,
      detail: 'Writes a restore point first, then folds the ' + plural(t.messages.length - idx - 1, 'later turn', 'later turns') + ' into a restorable region. Nothing is deleted.'
    });

    var rec = passageRecord(ctx, t);
    /* Transcript's overflow registry renders `it.icon` through app.js's icon
       set and has no `glyph` channel, so a module glyph name silently falls
       back to the `more` ellipsis. Overflow rows therefore name icons app.js
       actually ships; the thread menu, which this module renders itself, keeps
       the custom glyphs. Caught by looking at a screenshot: two rows were
       wearing an ellipsis. */
    items.push(rec ? {
      id: 'passage', label: 'Add passage to context', icon: 'document', action: 'add-passage', value: m.id,
      detail: 'Pin this turn as a context source. The window percentage moves by roughly ' + Math.max(1, Math.round(snippet(m, 4000).length / 4)) + ' tokens.'
    } : {
      id: 'passage', label: 'Add passage to context', icon: 'document', disabled: true,
      reason: 'No per-thread context projection is recorded for “' + t.title + '”, and the shared projection is read by every thread without one.'
    });
    items.push({
      id: 'link', label: 'Copy link', icon: 'attach', action: 'copy-message-link', value: m.id,
      detail: 'Copy a deep link anchored on this turn.'
    });

    if (m.role === 'assistant') {
      var el = retryEligibility(ctx, m);
      items.push(el.ok ? {
        id: 'retry', label: 'Retry message', icon: 'refresh', action: 'retry-message', value: m.id,
        detail: el.reason
      } : {
        id: 'retry', label: 'Retry message', icon: 'refresh', disabled: true, reason: el.reason
      });
    }
    return items;
  }

  /* ====================================================================== */
  /*  DIALOGS                                                               */
  /* ====================================================================== */

  var PERSONAS = ['Product Manager', 'Architect', 'Implementer', 'Reviewer', 'Teacher'];

  function scrim() { return '<div class="pm-tops-scrim" data-action="close-dialog" aria-hidden="true"></div>'; }

  function dialogShell(ctx, o) {
    var esc = ctx.esc;
    return scrim() +
      '<section class="dialog pm-tops-dialog' + (o.danger ? ' is-danger' : '') + '"' +
      ' role="' + (o.danger ? 'alertdialog' : 'dialog') + '" aria-modal="true" aria-labelledby="pm-tops-title"' +
      ' style="width:min(' + (o.width || 520) + 'px,calc(100vw - 20px))">' +
      '<div class="drawer-head">' +
      '<span class="event-icon' + (o.danger ? ' pm-tops-danger-icon' : '') + '">' + gi(ctx, o, 13) + '</span>' +
      '<strong id="pm-tops-title">' + esc(o.title) + '</strong>' +
      (o.pill ? '<span class="meta-pill">' + esc(o.pill) + '</span>' : '') +
      '<span class="spacer"></span>' +
      '<button class="icon-button" data-action="close-dialog" title="Cancel">' + ctx.icon('close', 13) + '</button>' +
      '</div><div class="dialog-body">' + o.body + '</div></section>';
  }

  /* --- the destructive confirm ----------------------------------------
     Locked copy: title `Delete thread?`, buttons `Delete and keep worktree` /
     `Delete and remove worktree` (with `(has changes)` when dirty) / `Cancel`
     (default focus), worktree cleanup in the SAME dialog, and NO undo promise
     anywhere — neither "you can undo this" nor "this cannot be undone", since
     Reset does restore the fixture and the second sentence would be false. */
  function deleteDialog(ctx, d) {
    var esc = ctx.esc;
    var t = threadById(ctx, d.threadId);
    if (!t) return '';
    var w = worktreeState(ctx, worktreeFor(ctx, t));

    var facts = '<dl class="pm-tops-facts">' +
      '<div><dt>Thread</dt><dd>' + esc(t.title) + '</dd></div>' +
      '<div><dt>Turns</dt><dd>' + t.messages.length + '</dd></div>' +
      '<div><dt>Status</dt><dd>' + esc(ctx.statusLabel(t.status)) + '</dd></div>' +
      '</dl>';

    var wt;
    if (w) {
      wt = '<div class="pm-tops-wt' + (w.dirty ? ' is-dirty' : '') + '">' +
        '<div class="pm-tops-wt-head">' + ctx.icon('changes', 13) + '<strong>' + esc(w.label) + '</strong>' +
        '<span class="meta-pill">' + esc(w.stateLabel) + '</span></div>' +
        '<dl class="pm-tops-facts">' +
        '<div><dt>Path</dt><dd>' + esc(w.rec.path || 'No checkout') + '</dd></div>' +
        '<div><dt>Uncommitted</dt><dd>' + (w.dirtyFiles ? plural(w.dirtyFiles, 'file', 'files') : 'None') + '</dd></div>' +
        (w.conflicts.length ? '<div><dt>Conflicts</dt><dd>' + esc(w.conflicts.join(', ')) + '</dd></div>' : '') +
        '<div><dt>Ahead / behind</dt><dd>' + (w.rec.ahead || 0) + ' / ' + (w.rec.behind || 0) + '</dd></div>' +
        '</dl></div>';
    } else {
      wt = '<div class="pm-tops-wt is-none"><div class="pm-tops-wt-head">' + ctx.icon('changes', 13) +
        '<strong>No worktree bound</strong></div><p>This thread is not bound to a worktree, so nothing is removed either way.</p></div>';
    }

    /* Both worktree buttons are always present, because the copy is locked.
       The one that cannot act is disabled and says which record makes it
       impossible — the honest-gap pattern, applied inside the dialog. */
    var removeLabel = 'Delete and remove worktree' + (w && w.dirty ? ' (has changes)' : '');
    var removeBtn;
    if (!w) {
      removeBtn = '<button class="soft-button pm-tops-danger-btn is-disabled" disabled aria-disabled="true"' +
        ' title="This thread is not bound to a worktree.">' + esc(removeLabel) + '</button>';
    } else if (!w.hasCheckout) {
      removeBtn = '<button class="soft-button pm-tops-danger-btn is-disabled" disabled aria-disabled="true"' +
        ' title="' + esc(w.label + ' has no checkout to remove.') + '">' + esc(removeLabel) + '</button>';
    } else {
      removeBtn = '<button class="soft-button pm-tops-danger-btn" data-action="confirm-delete-thread" data-id="' + esc(t.id) + '" data-value="remove"' +
        ' title="' + esc('Delete the thread and remove ' + w.rec.path + '.') + '">' + esc(removeLabel) + '</button>';
    }

    var body = facts + wt +
      (!w || w.hasCheckout ? '' : '<p class="pm-tops-note">' + esc(w.label + ' has no checkout, so there is nothing on disk to remove.') + '</p>') +
      '<div class="decision-actions pm-tops-del-actions">' +
      '<button class="soft-button pm-tops-danger-btn" data-action="confirm-delete-thread" data-id="' + esc(t.id) + '" data-value="keep"' +
      ' title="Delete the thread and leave the worktree in place.">Delete and keep worktree</button>' +
      removeBtn +
      '<button class="primary-button" data-action="close-dialog" data-pm-autofocus="1">Cancel</button>' +
      '</div>';

    return dialogShell(ctx, { title: 'Delete thread?', icon: 'warning', danger: true, width: 540, body: body });
  }

  function restoreDialog(ctx, d) {
    var esc = ctx.esc;
    var t = threadById(ctx, d.threadId);
    if (!t) return '';
    var s = slice(t.id);
    var live = s.restorePoints.filter(function (r) { return !r.deleted; });
    var body = '<p class="pm-tops-lead">Immutable snapshots of “' + esc(t.title) + '”. Branching from one uses the snapshot, not the live thread.</p>';
    if (!live.length) {
      body += '<div class="pm-tops-empty"><strong>No restore points yet</strong>' +
        '<span>Create one here at the latest turn, or from any turn’s More menu.</span></div>';
    } else {
      body += '<div class="pm-tops-list">' + live.map(function (r) {
        return '<div class="pm-tops-item"><div class="pm-tops-item-copy"><strong>' + esc(r.label) + '</strong>' +
          '<span>Turn ' + r.atTurn + ' · covers ' + plural(r.messageCount, 'turn', 'turns') + ' · ' + esc(clockOf(r.createdAt)) + '</span></div>' +
          '<div class="pm-tops-item-actions">' +
          '<button class="soft-button" data-action="branch-from-restore" data-value="' + esc(r.id) + '" title="' + esc('Create a sibling branch from ' + r.label + '. Dispatches ' + CMD.branchFromRestore + '.') + '">Branch from restore</button>' +
          '<button class="text-button danger" data-action="delete-restore-point" data-value="' + esc(r.id) + '" title="' + esc('Remove ' + r.label + '. Dispatches ' + CMD.deleteRestorePoint + '.') + '">Delete restore point</button>' +
          '</div></div>';
      }).join('') + '</div>';
    }
    body += '<div class="decision-actions">' +
      '<button class="soft-button" data-action="create-restore-point" data-id="' + esc(t.id) + '" title="' + esc('Snapshot the thread at its latest turn. Dispatches ' + CMD.createRestorePoint + '.') + '">Create restore point</button>' +
      '<button class="primary-button" data-action="close-dialog" data-pm-autofocus="1">Done</button></div>';
    return dialogShell(ctx, { title: 'Restore points', icon: 'history', width: 560, pill: live.length + ' live', body: body });
  }

  function requestDialog(ctx, d) {
    var esc = ctx.esc;
    var src = threadById(ctx, d.threadId);
    if (!src) return '';
    var targets = ctx.state.threads.filter(function (x) { return x.id !== src.id; }).slice(0, 12);
    var body = '<p class="pm-tops-lead">A bounded, typed read of another thread. Nothing is copied across: the answer comes back as a reference.</p>' +
      '<div class="pm-tops-list">' + targets.map(function (x) {
        var why = requestReason(ctx, src, x);
        if (why) {
          return '<div class="pm-tops-item is-disabled"><div class="pm-tops-item-copy"><strong>' + esc(x.title) + '</strong>' +
            '<span>' + esc(why) + '</span></div></div>';
        }
        return '<button class="pm-tops-item is-button" data-action="send-thread-request" data-id="' + esc(src.id) + '" data-value="' + esc(x.id) + '"' +
          ' title="' + esc('Send a bounded read request to ' + x.title + '. Dispatches ' + CMD.request + '.') + '">' +
          '<div class="pm-tops-item-copy"><strong>' + esc(x.title) + '</strong>' +
          '<span>' + esc(ctx.statusLabel(x.status)) + ' · ' + plural(x.messages.length, 'turn', 'turns') + ' · ' + esc(x.summary || '') + '</span></div>' +
          ctx.icon('send', 13) + '</button>';
      }).join('') + '</div>' +
      '<div class="decision-actions"><button class="primary-button" data-action="close-dialog" data-pm-autofocus="1">Cancel</button></div>';
    return dialogShell(ctx, { title: 'Request from another thread', icon: 'users', width: 560, body: body });
  }

  function outboxDialog(ctx, d) {
    var esc = ctx.esc;
    var t = threadById(ctx, d.threadId);
    if (!t) return '';
    var mine = allRequests().filter(function (r) { return r.sourceThread === t.id; });
    var body = '<p class="pm-tops-lead">Cross-thread requests sent from “' + esc(t.title) + '”.</p>';
    if (!mine.length) {
      body += '<div class="pm-tops-empty"><strong>Outbox is empty</strong><span>Requests sent from this thread appear here with retry and cancel.</span></div>';
    } else {
      body += '<div class="pm-tops-list">' + mine.map(function (r) {
        var acts = r.status === 'pending'
          ? '<button class="soft-button" data-action="retry-thread-request" data-value="' + esc(r.id) + '" title="' + esc('Re-send the request. Dispatches ' + CMD.outbox + '.') + '">Retry</button>' +
            '<button class="text-button danger" data-action="cancel-thread-request" data-value="' + esc(r.id) + '" title="' + esc('Withdraw the request. Dispatches ' + CMD.outbox + '.') + '">Cancel</button>'
          : '<span class="meta-pill">' + esc(r.status === 'answered' ? 'Answered' : 'Cancelled') + '</span>';
        return '<div class="pm-tops-item"><div class="pm-tops-item-copy"><strong>' + esc(r.targetTitle) + '</strong>' +
          '<span>' + esc(r.task) + '</span>' +
          '<span>Attempt ' + r.attempts + ' · ' + esc(clockOf(r.createdAt)) + '</span></div>' +
          '<div class="pm-tops-item-actions">' + acts + '</div></div>';
      }).join('') + '</div>';
    }
    body += '<div class="decision-actions"><button class="primary-button" data-action="close-dialog" data-pm-autofocus="1">Done</button></div>';
    return dialogShell(ctx, { title: 'Outbox', glyph: 'outbox', width: 560, pill: mine.filter(function (r) { return r.status === 'pending'; }).length + ' pending', body: body });
  }

  function branchRouteDialog(ctx, d) {
    var esc = ctx.esc;
    var t = threadById(ctx, d.threadId) || ctx.activeThread();
    if (!t) return '';
    var m = null;
    for (var i = 0; i < t.messages.length; i++) if (t.messages[i].id === d.messageId) m = t.messages[i];
    var turn = m ? turnLabel(t, m) : 'the latest turn';
    var body, title, ic;

    if (d.kind === 'persona') {
      title = 'Branch with another Persona';
      ic = 'users';
      body = '<p class="pm-tops-lead">The branch is anchored at ' + esc(turn) + '. The Persona applies to the branch only; this thread keeps ' + esc(ctx.state.persona) + '.</p>' +
        '<div class="pm-tops-list">' + PERSONAS.map(function (p) {
          return '<button class="pm-tops-item is-button" data-action="branch-with-persona" data-id="' + esc(d.messageId) + '" data-value="' + esc(p) + '">' +
            '<div class="pm-tops-item-copy"><strong>' + esc(p) + '</strong>' +
            '<span>' + (p === ctx.state.persona ? 'Current Persona in this thread' : 'Requested for the branch only') + '</span></div>' +
            ctx.icon('branch', 13) + '</button>';
        }).join('') + '</div>';
    } else {
      title = 'Branch with another model';
      ic = 'brain';
      var models = (ctx.D.models || []).slice(0, 14);
      body = '<p class="pm-tops-lead">The branch is anchored at ' + esc(turn) + '. A requested route that is not ready resolves to an effective route, and the branch records both.</p>' +
        '<div class="pm-tops-list">' + models.map(function (mo) {
          var ready = mo.status === 'ready';
          return '<button class="pm-tops-item is-button" data-action="branch-with-model" data-id="' + esc(d.messageId) + '" data-value="' + esc(mo.id) + '">' +
            '<div class="pm-tops-item-copy"><strong>' + esc(mo.name) + '</strong>' +
            '<span>' + esc(mo.provider + ' · ' + mo.account) + '</span>' +
            '<span>' + esc(ready ? 'Requested and effective route match.' : 'Requested route is ' + lbl(ctx, 'modelStatus', mo.status) + '; the branch records the effective fallback.') + '</span></div>' +
            ctx.icon(ready ? 'branch' : 'warning', 13) + '</button>';
        }).join('') + '</div>';
    }
    body += '<div class="decision-actions"><button class="primary-button" data-action="close-dialog" data-pm-autofocus="1">Cancel</button></div>';
    return dialogShell(ctx, { title: title, icon: ic, width: 560, body: body });
  }

  /* ====================================================================== */
  /*  SYSTEM CARD ACTIONS  (buttons on this module's own receipt cards)      */
  /* ====================================================================== */

  function cardActions(ctx, m) {
    var esc = ctx.esc;
    if (!m || !m.type || String(m.type).indexOf('threadops-') !== 0) return '';

    if (m.type === 'threadops-restore-point') {
      var rp = findRestorePoint(m.restorePointId);
      if (!rp) return '';
      if (rp.deleted) {
        return '<span class="pm-tops-card-note" data-kind="restore-point">Deleted · the turns it covered are still in this thread.</span>';
      }
      return '<span class="pm-tops-card" data-kind="restore-point">' +
        '<button class="soft-button" data-action="branch-from-restore" data-value="' + esc(rp.id) + '">' + ctx.icon('branch', 12) + ' Branch from restore</button>' +
        '<button class="text-button danger" data-action="delete-restore-point" data-value="' + esc(rp.id) + '">Delete restore point</button>' +
        '</span>';
    }

    if (m.type === 'threadops-rewind') {
      var rw = findRewind(m.rewindId);
      if (!rw) return '';
      if (rw.restored) return '<span class="pm-tops-card-note" data-kind="rewind">Restored · every folded turn is back in place.</span>';
      var listed = rw.messages.slice(0, 6).map(function (x, i) {
        return '<li><span class="pm-tops-fold-role">' + esc(x.role === 'user' ? 'You' : x.role === 'assistant' ? 'Assistant' : 'System') + '</span>' +
          '<span class="pm-tops-fold-text">' + esc(snippet(x, 96) || ('[' + x.type + ']')) + '</span></li>';
      }).join('');
      var more = rw.messages.length > 6 ? '<li class="pm-tops-fold-more">and ' + (rw.messages.length - 6) + ' more</li>' : '';
      return '<span class="pm-tops-card" data-kind="rewind">' +
        '<ul class="pm-tops-fold">' + listed + more + '</ul>' +
        '<button class="soft-button" data-action="restore-rewind" data-value="' + esc(rw.id) + '">' + ctx.icon('restore', 12) + ' Restore ' + plural(rw.messages.length, 'turn', 'turns') + '</button>' +
        '</span>';
    }

    if (m.type === 'threadops-request') {
      var rq = findRequest(m.requestId);
      if (!rq) return '';
      if (rq.status !== 'pending') return '<span class="pm-tops-card-note" data-kind="request">' + esc(rq.status === 'answered' ? 'Answered' : 'Cancelled') + '</span>';
      return '<span class="pm-tops-card" data-kind="request">' +
        '<button class="soft-button" data-action="await-thread-request" data-value="' + esc(rq.id) + '">' + ctx.icon('refresh', 12) + ' Await response</button>' +
        '<button class="text-button" data-action="retry-thread-request" data-value="' + esc(rq.id) + '">Retry</button>' +
        '<button class="text-button danger" data-action="cancel-thread-request" data-value="' + esc(rq.id) + '">Cancel</button>' +
        '</span>';
    }

    if (m.type === 'threadops-passage') {
      var t = ctx.activeThread();
      var s = t ? slice(t.id) : null;
      var p = null;
      if (s) for (var i = 0; i < s.passages.length; i++) if (s.passages[i].id === m.passageId) p = s.passages[i];
      if (!p) return '';
      if (p.removed) return '<span class="pm-tops-card-note" data-kind="passage">Removed from the context projection.</span>';
      return '<span class="pm-tops-card" data-kind="passage">' +
        '<button class="text-button danger" data-action="remove-passage" data-id="' + esc(t.id) + '" data-value="' + esc(p.id) + '">Remove passage</button>' +
        '</span>';
    }

    if (m.type === 'threadops-branch' && m.branchThreadId) {
      return '<span class="pm-tops-card" data-kind="branch">' +
        '<button class="soft-button" data-action="select-thread" data-id="' + esc(m.branchThreadId) + '">' + ctx.icon('branch', 12) + ' Open ' + esc(m.branchTitle || 'branch') + '</button></span>';
    }
    if (m.type === 'threadops-spawn' && m.spawnThreadId) {
      return '<span class="pm-tops-card" data-kind="spawn">' +
        '<button class="soft-button" data-action="select-thread" data-id="' + esc(m.spawnThreadId) + '">' + ctx.icon('branch', 12) + ' Open related thread</button></span>';
    }
    return '';
  }

  /* ====================================================================== */
  /*  THREAD SEARCH — scope selector                                        */
  /* ====================================================================== */

  var lastSearch = null;
  function searchMenu(ctx) {
    var esc = ctx.esc, icon = ctx.icon;
    var menu = ctx.state.menu || {};
    var q = menu.query || '';
    var scope = menu.scope === 'all' ? 'all' : 'current';    /* Current Thread is the default */
    var cur = ctx.activeThread();
    var pool = scope === 'all' ? ctx.state.threads : (cur ? [cur] : []);
    var lq = q.toLowerCase();
    var results = [];
    if (q) {
      for (var i = 0; i < pool.length && results.length < 24; i++) {
        var t = pool[i];
        for (var j = 0; j < t.messages.length && results.length < 24; j++) {
          var m = t.messages[j];
          var hay = ((m.body || '') + ' ' + (m.title || '') + ' ' + (m.detail || '')).toLowerCase();
          if (hay.indexOf(lq) >= 0) results.push({ thread: t, msg: m, turn: j + 1 });
        }
      }
    }
    if (q && q !== lastSearch) { lastSearch = q; dispatch(CMD.search, cur ? cur.id : null); }

    var head = '<div class="menu-head"><strong>Search threads</strong><span class="spacer"></span>' +
      '<span class="chat-meta">' + (q ? plural(results.length, 'match', 'matches') : (scope === 'all' ? ctx.state.threads.length + ' threads' : '1 thread')) + '</span></div>';

    var scopeRow = '<div class="pm-tops-scope" role="group" aria-label="Search scope">' +
      [['current', 'Current Thread', cur ? cur.title : ''], ['all', 'All Threads', ctx.state.threads.length + ' threads including archived']]
        .map(function (o) {
          return '<button class="pm-tops-scope-btn' + (scope === o[0] ? ' active' : '') + '" data-action="set-thread-search-scope" data-value="' + o[0] + '"' +
            ' aria-pressed="' + (scope === o[0] ? 'true' : 'false') + '" title="' + esc(o[2]) + '">' + esc(o[1]) + '</button>';
        }).join('') + '</div>';

    var search = '<div class="menu-search"><label class="input-wrap">' + icon('search', 12) +
      '<input data-input="thread-global-search" value="' + esc(q) + '" placeholder="' +
      (scope === 'all' ? 'Search every thread…' : 'Search this thread…') + '"></label></div>';

    var body;
    if (!q) {
      body = '<div class="pm-tops-hint">' + esc(scope === 'all'
        ? 'Searching every thread, active and archived.'
        : 'Searching “' + (cur ? cur.title : '') + '” only. Switch to All Threads to widen it.') + '</div>';
    } else if (!results.length) {
      body = '<div class="pm-tops-hint">No turn matches “' + esc(q) + '” in ' + (scope === 'all' ? 'any thread' : 'this thread') + '.</div>';
    } else {
      body = results.map(function (r) {
        return '<div class="pm-tops-result">' +
          '<button class="menu-item" data-action="jump-search-result" data-thread="' + esc(r.thread.id) + '" data-message="' + esc(r.msg.id) + '"' +
          ' title="' + esc('Open turn ' + r.turn + ' of ' + r.thread.title) + '">' +
          '<span class="menu-icon">' + icon('search', 12) + '</span>' +
          '<span class="menu-copy"><strong>' + esc(r.thread.title) + ' · turn ' + r.turn + '</strong>' +
          '<span>' + esc(snippet(r.msg, 110)) + '</span></span></button>' +
          '<button class="icon-button pm-tops-result-op" data-action="copy-message-link" data-thread="' + esc(r.thread.id) + '" data-value="' + esc(r.msg.id) + '" title="Copy a link to this turn">' + svg('link', 12) + '</button>' +
          '<button class="icon-button pm-tops-result-op" data-action="add-passage" data-thread="' + esc(r.thread.id) + '" data-value="' + esc(r.msg.id) + '" title="Add this passage to the context">' + svg('passage', 12) + '</button>' +
          '</div>';
      }).join('');
    }
    return head + scopeRow + search + '<div class="pm-tops-results">' + body + '</div>';
  }

  /* ====================================================================== */
  /*  WIRING                                                                */
  /* ====================================================================== */

  EXT.slot('threadMenu', function (ctx) {
    return ctx.thread ? threadRows(ctx, ctx.thread) : '';
  });

  EXT.slot('systemCardActions', function (ctx) {
    return ctx.message ? cardActions(ctx, ctx.message) : '';
  });

  EXT.slot('threadSearchMenu', function (ctx) { return searchMenu(ctx); });

  EXT.slot('dialog', function (ctx) {
    var d = ctx.state.dialog;
    if (!d) return '';
    if (d.type === 'threadops-delete') return deleteDialog(ctx, d);
    if (d.type === 'threadops-restore') return restoreDialog(ctx, d);
    if (d.type === 'threadops-request') return requestDialog(ctx, d);
    if (d.type === 'threadops-outbox') return outboxDialog(ctx, d);
    if (d.type === 'threadops-branch-route') return branchRouteDialog(ctx, d);
    return '';
  });

  /* The one thing this module renders inside the transcript: a marker on the
     turn a live fold is anchored to. Constant data-k, because `.message`
     survives the 2s work tick. */
  EXT.slot('messageAffordance', function (ctx) {
    var m = ctx.message, t = ctx.activeThread();
    if (!m || !t) return '';
    var s = store[t.id];
    if (!s) return '';
    for (var i = 0; i < s.rewinds.length; i++) {
      if (!s.rewinds[i].restored && s.rewinds[i].atMessageId === m.id) {
        return '<span class="pm-tops-anchor" data-k="pm-tops-anchor" aria-hidden="true"></span>';
      }
    }
    return '';
  });

  if (window.PM56_MSG_OVERFLOW && window.PM56_MSG_OVERFLOW.register) {
    window.PM56_MSG_OVERFLOW.register(function (ctx, m) { return overflowItems(ctx, m); });
  }

  /* ------------------------------------------------------------ actions --- */
  function focusSoon() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var el = document.querySelector('.pm-tops-dialog [data-pm-autofocus]');
        if (el && typeof el.focus === 'function') el.focus();
      });
    });
  }
  function openTopsDialog(ctx, d) {
    ctx.closeMenu();
    ctx.state.dialog = d;
    ctx.renderOverlays();
    focusSoon();
    return true;
  }

  function A(name, fn) { EXT.action(name, fn); }
  /* `chainAction` = I am DELIBERATELY extending a handler another module owns
     and I will return false to fall through. It is not recorded in
     `PM56_EXT.collisions`, which is reserved for UNDECLARED duplicates -- so
     `collisions.length === 0` stays a true invariant a harness can gate on.
     The fallback keeps the module loadable against an older registry. */
  function CH(name, fn) { (EXT.chainAction ? EXT.chainAction : EXT.action).call(EXT, name, fn); }

  A('duplicate-thread', function (ctx, btn) {
    var t = threadById(ctx, btn.dataset.id); if (!t) return true;
    ctx.closeMenu(); duplicateThread(ctx, t); return true;
  });
  A('export-thread', function (ctx, btn) {
    var t = threadById(ctx, btn.dataset.id); if (!t) return true;
    ctx.closeMenu(); exportThread(ctx, t); return true;
  });
  A('archive-thread', function (ctx, btn) {
    var t = threadById(ctx, btn.dataset.id); if (!t) return true;
    archiveThread(ctx, t); return true;
  });
  A('unarchive-thread', function (ctx, btn) {
    var t = threadById(ctx, btn.dataset.id); if (!t) return true;
    unarchiveThread(ctx, t); return true;
  });
  /* Pin and Rename keep app.js's rows and dialogs; only the missing receipt is
     added here, so the two surfaces cannot disagree about what happened.
     SHARED ACTION -- read before editing. `history.js` also registers
     `toggle-thread-pin`: it owns the pin FLIP animation and the menu close.
     `PM56_EXT.action` chains later-first, so THIS runs first and MUST return
     `false` to let History's run. It therefore must NOT toggle `t.pinned`
     itself -- History does that, and toggling here would flip it twice for a
     net no-op. The receipt is written for the state the thread is ABOUT to be
     in, which is the only state this handler can know. */
  CH('toggle-thread-pin', function (ctx, btn) {
    var t = threadById(ctx, btn.dataset.id); if (!t) return false;
    var willPin = !t.pinned;
    dispatch(CMD.pin, t.id);
    receipt(ctx, t, 'threadops-pin', willPin ? 'Thread pinned' : 'Thread unpinned',
      '“' + t.title + '” ' + (willPin ? 'is kept at the top of the history.' : 'moved back to Recent.') + cmdNote(CMD.pin));
    return false;   /* fall through to history.js, which owns the toggle + FLIP */
  });
  A('save-thread-name', function (ctx) {
    var d = ctx.state.dialog; if (!d || d.type !== 'rename') return false;
    var t = threadById(ctx, d.threadId); if (!t) return false;
    var was = t.title;
    var next = String(d.value || '').trim() || t.title;
    t.title = next;
    ctx.state.dialog = null;
    dispatch(CMD.rename, t.id);
    if (next !== was) {
      receipt(ctx, t, 'threadops-rename', 'Thread renamed',
        '“' + was + '” is now “' + next + '”.' + cmdNote(CMD.rename));
    } else { ctx.renderApp(); }
    return true;
  });

  A('open-restore-points', function (ctx, btn) {
    return openTopsDialog(ctx, { type: 'threadops-restore', threadId: btn.dataset.id });
  });
  A('open-thread-request', function (ctx, btn) {
    return openTopsDialog(ctx, { type: 'threadops-request', threadId: btn.dataset.id });
  });
  A('open-thread-outbox', function (ctx, btn) {
    dispatch(CMD.outbox, btn.dataset.id);
    return openTopsDialog(ctx, { type: 'threadops-outbox', threadId: btn.dataset.id });
  });
  A('open-branch-model', function (ctx, btn) {
    var t = ctx.activeThread();
    return openTopsDialog(ctx, { type: 'threadops-branch-route', kind: 'model', threadId: t.id, messageId: btn.dataset.value });
  });
  A('open-branch-persona', function (ctx, btn) {
    var t = ctx.activeThread();
    return openTopsDialog(ctx, { type: 'threadops-branch-route', kind: 'persona', threadId: t.id, messageId: btn.dataset.value });
  });
  A('delete-thread', function (ctx, btn) {
    return openTopsDialog(ctx, { type: 'threadops-delete', threadId: btn.dataset.id });
  });
  A('confirm-delete-thread', function (ctx, btn) {
    var t = threadById(ctx, btn.dataset.id); if (!t) return true;
    deleteThread(ctx, t, btn.dataset.value);
    return true;
  });

  A('create-restore-point', function (ctx, btn) {
    var mid = btn.dataset.value, tid = btn.dataset.id;
    var t = tid ? threadById(ctx, tid) : ctx.activeThread();
    if (!t) return true;
    var m = null;
    if (mid) for (var i = 0; i < t.messages.length; i++) if (t.messages[i].id === mid) m = t.messages[i];
    createRestorePoint(ctx, t, m, null);
    if (ctx.state.dialog && ctx.state.dialog.type === 'threadops-restore') { ctx.renderOverlays(); focusSoon(); }
    return true;
  });
  A('branch-from-restore', function (ctx, btn) {
    var rp = findRestorePoint(btn.dataset.value); if (!rp || rp.deleted) return true;
    ctx.state.dialog = null;
    branchFromRestore(ctx, rp);
    return true;
  });
  A('delete-restore-point', function (ctx, btn) {
    var rp = findRestorePoint(btn.dataset.value); if (!rp || rp.deleted) return true;
    deleteRestorePoint(ctx, rp);
    if (ctx.state.dialog && ctx.state.dialog.type === 'threadops-restore') { ctx.renderOverlays(); focusSoon(); }
    return true;
  });
  A('rewind-to-message', function (ctx, btn) {
    var t = ctx.activeThread(); if (!t) return true;
    var m = null;
    for (var i = 0; i < t.messages.length; i++) if (t.messages[i].id === btn.dataset.value) m = t.messages[i];
    if (m) rewindTo(ctx, t, m);
    return true;
  });
  A('restore-rewind', function (ctx, btn) {
    var rec = findRewind(btn.dataset.value);
    if (rec) restoreRewind(ctx, rec);
    return true;
  });
  A('branch-from-message', function (ctx, btn) {
    var t = ctx.activeThread(); if (!t) return true;
    branchThread(ctx, t, btn.dataset.value, {});
    return true;
  });
  A('branch-with-model', function (ctx, btn) {
    var t = ctx.activeThread(); if (!t) return true;
    ctx.state.dialog = null;
    branchThread(ctx, t, btn.dataset.id, { modelId: btn.dataset.value });
    return true;
  });
  A('branch-with-persona', function (ctx, btn) {
    var t = ctx.activeThread(); if (!t) return true;
    ctx.state.dialog = null;
    branchThread(ctx, t, btn.dataset.id, { persona: btn.dataset.value });
    return true;
  });
  A('retry-message', function (ctx, btn) {
    var t = ctx.activeThread(); if (!t) return true;
    for (var i = 0; i < t.messages.length; i++) {
      if (t.messages[i].id === btn.dataset.value) { retryMessage(ctx, t, t.messages[i]); break; }
    }
    return true;
  });
  A('add-passage', function (ctx, btn) {
    var t = btn.dataset.thread ? threadById(ctx, btn.dataset.thread) : ctx.activeThread();
    if (!t) return true;
    var m = null;
    for (var i = 0; i < t.messages.length; i++) if (t.messages[i].id === btn.dataset.value) m = t.messages[i];
    if (!m) return true;
    if (!passageRecord(ctx, t)) {
      ctx.toast('No context projection', 'No per-thread projection is recorded for “' + t.title + '”, so nothing was added.');
      return true;
    }
    if (btn.dataset.thread) ctx.closeMenu();
    addPassage(ctx, t, m);
    return true;
  });
  A('remove-passage', function (ctx, btn) {
    removePassage(ctx, btn.dataset.id, btn.dataset.value);
    return true;
  });
  A('copy-thread-link', function (ctx, btn) {
    var t = threadById(ctx, btn.dataset.id); if (!t) return true;
    ctx.closeMenu();
    ctx.copyText('pm://chat/thread/' + t.id, 'Thread link copied', 'pm://chat/thread/' + t.id + ' · not a cataloged command, a surface affordance.');
    return true;
  });
  A('copy-message-link', function (ctx, btn) {
    var tid = btn.dataset.thread || (ctx.activeThread() && ctx.activeThread().id);
    var link = 'pm://chat/thread/' + tid + '#' + btn.dataset.value;
    if (btn.dataset.thread) ctx.closeMenu();
    ctx.copyText(link, 'Turn link copied', link);
    return true;
  });
  A('spawn-related-thread', function (ctx, btn) {
    var t = threadById(ctx, btn.dataset.id); if (!t) return true;
    ctx.closeMenu(); spawnThread(ctx, t); return true;
  });
  A('send-thread-request', function (ctx, btn) {
    var src = threadById(ctx, btn.dataset.id), tgt = threadById(ctx, btn.dataset.value);
    if (!src || !tgt || requestReason(ctx, src, tgt)) return true;
    ctx.state.dialog = null;
    sendRequest(ctx, src, tgt, null);
    return true;
  });
  A('await-oldest-request', function (ctx, btn) {
    var open = openRequestsFrom(btn.dataset.id);
    ctx.state.menu = null;
    if (open.length) awaitRequest(ctx, open[0]);
    return true;
  });
  A('await-thread-request', function (ctx, btn) { awaitRequest(ctx, findRequest(btn.dataset.value)); return true; });
  A('retry-thread-request', function (ctx, btn) {
    retryRequest(ctx, findRequest(btn.dataset.value));
    if (ctx.state.dialog && ctx.state.dialog.type === 'threadops-outbox') { ctx.renderOverlays(); focusSoon(); }
    return true;
  });
  A('cancel-thread-request', function (ctx, btn) {
    cancelRequest(ctx, findRequest(btn.dataset.value));
    if (ctx.state.dialog && ctx.state.dialog.type === 'threadops-outbox') { ctx.renderOverlays(); focusSoon(); }
    return true;
  });
  A('set-thread-search-scope', function (ctx, btn) {
    if (!ctx.state.menu) return true;
    ctx.state.menu.scope = btn.dataset.value === 'all' ? 'all' : 'current';
    dispatch(CMD.search, ctx.activeThread() ? ctx.activeThread().id : null);
    ctx.renderOverlays();
    return true;
  });
  A('jump-search-result', function (ctx, btn) {
    var tid = btn.dataset.thread, mid = btn.dataset.message;
    var t = threadById(ctx, tid);
    var menu = ctx.state.menu || {};
    var q = menu.query || '';
    var scope = menu.scope === 'all' ? 'All Threads' : 'Current Thread';
    ctx.state.menu = null;
    if (!t) { ctx.renderApp(); return true; }
    dispatch(CMD.search, tid);
    var turn = msgIndexIn(t, mid) + 1;
    ctx.switchThread(tid);
    receipt(ctx, t, 'threadops-search', 'Opened from search',
      '“' + q + '” · ' + scope + ' → ' + t.title + ' turn ' + turn + '.' + cmdNote(CMD.search));
    setTimeout(function () {
      var el = document.querySelector('[data-message-id="' + (window.CSS && CSS.escape ? CSS.escape(mid) : mid) + '"]');
      if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.classList.add('pm-tops-jumped'); }
    }, 60);
    return true;
  });

  /* Reset has to put this module's records AND the two fixture collections it
     writes through to back.
     SHARED ACTION -- `goals.js` also registers `reset-all` (its
     `restoreFixture()`). Returning `false` is load-bearing twice over: it falls
     through to Goals' handler, which in turn falls through to app.js's own
     `globalReset()`. A Reset that stops here would leave both the goal fixture
     and the concept un-reset. */
  CH('reset-all', function () {
    var D = window.PM56_DATA;
    store = Object.create(null);
    dispatched = [];
    lastExport = null;
    lastSearch = null;
    if (D && FIXTURE0) {
      if (D.operational) D.operational.worktrees = JSON.parse(JSON.stringify(FIXTURE0.worktrees));
      D.contextByThread = JSON.parse(JSON.stringify(FIXTURE0.contextByThread));
    }
    return false;
  });

  /* A modal has to trap Tab, or the first Tab lands on the app behind it. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var dlg = document.querySelector('.pm-tops-dialog');
    if (!dlg) return;
    var f = dlg.querySelectorAll('button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------------------------------------------------------------- api ---
     Exposed so the harness asserts against the same source of truth the
     renderer uses instead of re-deriving it. Each entry builds its own ctx
     through `PM56_EXT.ctx()` rather than caching one, because `globalReset()`
     reassigns `state` and a cached ctx would answer for a dead object. */
  function C(extra) { return (EXT.ctx || function () { return {}; })(extra || {}); }
  function messageIn(t, id) {
    for (var i = 0; t && i < t.messages.length; i++) if (t.messages[i].id === id) return t.messages[i];
    return null;
  }
  window.PM56_THREADOPS = {
    version: 1,
    CMD: CMD,
    dispatched: function () { return dispatched.slice(); },
    lastCommand: function () { return dispatched.length ? dispatched[dispatched.length - 1].command : null; },
    commandsFor: function (cmd) { return dispatched.filter(function (x) { return x.command === cmd; }); },
    storeFor: function (tid) { return slice(tid); },
    restorePoints: function (tid) { return slice(tid).restorePoints.slice(); },
    rewinds: function (tid) { return slice(tid).rewinds.slice(); },
    requests: function () { return allRequests(); },
    passages: function (tid) { return slice(tid).passages.slice(); },
    lastExport: function () { return lastExport; },
    /* `overflowFor(messageId)` — the rows a turn actually offers, with the
       reason string each disabled row shows. The harness checks the reason,
       not only the disabled flag: a correctly-disabled row with an empty or
       generic reason is still a row that tells the reader nothing. */
    overflowFor: function (messageId) {
      var ctx = C();
      var t = ctx.activeThread();
      var m = messageIn(t, messageId);
      return m ? overflowItems(ctx, m) : [];
    },
    retryFor: function (messageId) {
      var ctx = C();
      return retryEligibility(ctx, messageIn(ctx.activeThread(), messageId));
    },
    threadRowsFor: function (threadId) {
      var ctx = C();
      var t = threadById(ctx, threadId);
      return t ? threadRows(ctx, t) : '';
    },
    worktreeFor: function (threadId) {
      var ctx = C();
      var t = threadById(ctx, threadId);
      return t ? worktreeState(ctx, worktreeFor(ctx, t)) : null;
    }
  };
})();
