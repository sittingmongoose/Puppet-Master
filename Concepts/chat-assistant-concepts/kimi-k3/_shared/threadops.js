/* ============================================================================
   Kimi K3 — thread operations controller (window.K3ThreadOps).

   Typed cross-thread collaboration + history surgery. No UI of its own —
   cards (threadRequestCard / branchCard / restorePointCard / rewoundMarker /
   redirectMarker) render in the thread kit; this module owns the records,
   invariants, and events.

   - sendRequest: typed, bounded thread request with CYCLE and FAN-OUT
     guards (no request loops, max 3 children per thread). The record lives
     on the TARGET thread; a pending card lands on the SOURCE transcript.
   - awaitRequest: deterministic demo resolution (K3Demo drives WHEN; this
     marks status/result refs and posts the answer note). Nothing in
     production resolves requests on a timer.
   - spawnThread / branchFrom: new threads carry lineage; branchFrom extends
     K3Data.branchThread (signature kept) and preserves attachments,
     citations, and compacted-state (lens applied) markers for covered
     messages. Workspace files are never mutated and raw messages are never
     cloned into a provider prompt.
   - createRestorePoint / rewindTo / restoreFrom: rewind is NON-destructive
     — a restore point is written first, later messages fold into a
     collapsed "rewound" region, and the restore link clears it.
   - redirect: mid-turn steering. The partial attempt is preserved with an
     'interrupted' marker, the correction lands as a 'redirected' user
     message, and the next assistant reply is tagged 'resumed' exactly once.
   ========================================================================== */
(function () {
  'use strict';

  var READ_RANGE_CAP = 50;
  var FANOUT_CAP = 3;
  var reqSeq = 0;
  var rpSeq = 0;
  var pendingResume = {}; // threadId -> one-shot 'resumed' tag listener

  function data() { return window.K3Data; }
  function store() { return window.K3Store; }
  function nowIso() { return new Date().toISOString(); }
  function touch(tid, op) {
    var d = data();
    if (d && typeof d.touchThread === 'function') d.touchThread(tid, 'thread-op');
  }
  function append(tid, fields) {
    var d = data();
    return d ? d.appendRecord(tid, fields) : null;
  }

  // Every typed request across every thread: [{owner, req}].
  function allRequests() {
    var d = data();
    var out = [];
    if (!d) return out;
    d.listThreads().forEach(function (t) {
      d.threadRequests(t.id).forEach(function (r) { out.push({ owner: t.id, req: r }); });
    });
    return out;
  }
  function findRequest(requestId) {
    var all = allRequests();
    for (var i = 0; i < all.length; i++) {
      if (all[i].req.id === requestId) return all[i];
    }
    return null;
  }

  // Cycle check: follow OUTGOING requests starting at `target`; if the chain
  // reaches `source`, adding source -> target would close a loop.
  function chainReaches(target, source) {
    var all = allRequests();
    var node = target;
    var visited = {};
    var guard = 0;
    while (node && guard < 64) {
      guard += 1;
      if (node === source) return true;
      if (visited[node]) return false;
      visited[node] = true;
      var next = null;
      for (var i = 0; i < all.length; i++) {
        if (all[i].req.sourceThread === node) { next = all[i].req.targetThread; break; }
      }
      node = next;
    }
    return false;
  }

  var K3ThreadOps = {
    // Full-body search across all threads (wraps K3Data.search).
    searchThreads: function (query) {
      var d = data();
      return d ? d.search(query, { scope: 'all' }) : { results: [], grouped: {} };
    },

    // Bounded read of another thread's messages (indexes, capped at 50).
    readRange: function (threadId, from, to) {
      var d = data();
      var msgs = d ? d.messages(threadId) : [];
      var lo = Math.max(0, from | 0);
      var hi = (to == null ? msgs.length : Math.min(msgs.length, to | 0));
      if (hi - lo > READ_RANGE_CAP) hi = lo + READ_RANGE_CAP;
      if (hi < lo) hi = lo;
      return msgs.slice(lo, hi);
    },

    // Typed thread request: source asks target for a bounded task.
    sendRequest: function (opts) {
      opts = opts || {};
      var d = data();
      var source = opts.source, target = opts.target;
      var srcT = d && d.thread(source);
      var tgtT = d && d.thread(target);
      if (!srcT || !tgtT) {
        return { error: 'not-found', reason: 'Source or target thread does not exist.' };
      }
      if (source === target || chainReaches(target, source)) {
        return { error: 'cycle', reason: 'That request would close a request loop — ' + (tgtT.title || target) + ' is already part of this thread\u2019s request chain.' };
      }
      var children = allRequests().filter(function (h) { return h.req.sourceThread === source; });
      if (children.length >= FANOUT_CAP) {
        return { error: 'fanout', reason: (srcT.title || source) + ' already has ' + FANOUT_CAP + ' open thread requests — wait for one to resolve before fanning out further.' };
      }
      var rec = {
        id: 'tr-' + (++reqSeq),
        sourceThread: source,
        targetThread: target,
        sender: 'You',
        boundedTask: String(opts.task || ''),
        evidenceRefs: (opts.refs || []).slice(),
        scope: opts.scope || 'read',
        budget: opts.budget || null,
        createdAt: nowIso(),
        status: 'pending',
        resultRefs: []
      };
      if (!Array.isArray(tgtT.threadRequests)) tgtT.threadRequests = [];
      tgtT.threadRequests.push(rec);
      touch(target);
      append(source, {
        threadRequestCard: {
          id: rec.id,
          sourceThread: source,
          targetThread: target,
          targetTitle: tgtT.title || target,
          task: rec.boundedTask,
          refs: rec.evidenceRefs.slice(),
          scope: rec.scope,
          budget: rec.budget,
          status: 'pending',
          resultRefs: []
        }
      });
      return rec;
    },

    // Demo resolution: K3Demo decides WHEN a request answers; this performs
    // the deterministic resolution (status, result refs, source note, event).
    awaitRequest: function (requestId) {
      var hit = findRequest(requestId);
      if (!hit) return null;
      var d = data();
      var req = hit.req;
      var srcT = d.thread(req.sourceThread);
      var tgtT = d.thread(req.targetThread);
      req.status = 'answered';
      req.respondedAt = nowIso();
      if (!req.resultRefs.length) {
        req.resultRefs = [{
          kind: 'excerpt',
          threadId: req.targetThread,
          note: 'Bounded answer from ' + (tgtT ? (tgtT.title || req.targetThread) : req.targetThread)
        }];
      }
      // Flip the pending card on the source transcript, then append the note.
      if (srcT) {
        (srcT.messages || []).forEach(function (m) {
          if (m.threadRequestCard && m.threadRequestCard.id === requestId) {
            m.threadRequestCard.status = 'answered';
            m.threadRequestCard.resultRefs = req.resultRefs.slice();
          }
        });
        append(req.sourceThread, {
          body: '',
          threadRequestCard: {
            id: req.id,
            sourceThread: req.sourceThread,
            targetThread: req.targetThread,
            targetTitle: tgtT ? (tgtT.title || req.targetThread) : req.targetThread,
            task: req.boundedTask,
            refs: req.evidenceRefs.slice(),
            scope: req.scope,
            budget: req.budget,
            status: 'answered',
            resultRefs: req.resultRefs.slice(),
            note: 'Answered — ' + req.boundedTask
          }
        });
        touch(req.sourceThread);
      }
      touch(req.targetThread);
      return req;
    },

    // Bring a paused target thread back to idle, with a receipt note.
    resumeThread: function (id) {
      var d = data();
      var t = d && d.thread(id);
      if (!t) return null;
      if (t.threadState === 'paused') t.threadState = 'idle';
      append(id, {
        body: '',
        receiptCard: {
          kind: 'thread-resumed',
          title: 'Thread resumed',
          summary: 'Work in this thread continues.'
        }
      });
      touch(id);
      return t;
    },

    // New child/sibling thread with lineage. The record lists ONLY the
    // selected refs — no hidden context travels with the spawn.
    spawnThread: function (opts) {
      opts = opts || {};
      var d = data();
      var fromThreadId = opts.fromThreadId;
      var src = d && d.thread(fromThreadId);
      if (!src) return null;
      var kind = opts.kind === 'sibling' ? 'sibling' : 'child';
      var task = String(opts.task || '');
      var refs = (opts.refs || []).slice();
      var nt = d.createThread((kind === 'sibling' ? 'Sibling: ' : 'Child: ') + (task || src.title || fromThreadId));
      var msgs = d.messages(fromThreadId);
      var last = msgs[msgs.length - 1];
      nt.lineage = {
        sourceThreadId: fromThreadId,
        atMessageId: last ? last.id : null,
        kind: kind
      };
      append(fromThreadId, {
        branchCard: {
          kind: 'spawn',
          lineageKind: kind,
          threadId: nt.id,
          title: nt.title,
          task: task,
          refs: refs
        }
      });
      touch(fromThreadId);
      return nt;
    },

    // Branch from a message. Extends K3Data.branchThread (its signature is
    // unchanged — this wraps it), then patches the new thread: lineage, a
    // title suffix for model/persona variants, thread-local overrides, and
    // preserved compacted-state (lens applied) markers remapped onto the
    // cloned message ids. Attachments and citations ride the deep clone.
    // NEVER mutates workspace files or clones raw messages into a prompt.
    branchFrom: function (threadId, atMessageId, opts) {
      opts = opts || {};
      var d = data();
      var src = d && d.thread(threadId);
      if (!src) return null;
      var srcMsgs = d.messages(threadId);
      var at = -1;
      for (var i = 0; i < srcMsgs.length; i++) {
        if (srcMsgs[i].id === atMessageId) { at = i; break; }
      }
      var coverCount = (at < 0 ? srcMsgs.length - 1 : at) + 1;

      var nt = d.branchThread(threadId, atMessageId);
      if (!nt) return null;

      if (opts.model) nt.title = (src.title || threadId) + ' \u00b7 ' + opts.model;
      else if (opts.persona) nt.title = (src.title || threadId) + ' \u00b7 ' + opts.persona;
      nt.lineage = { sourceThreadId: threadId, atMessageId: atMessageId || null, kind: 'branch' };

      // Variant overrides live thread-locally; the source thread is untouched.
      var patch = {};
      if (opts.model && String(opts.model).indexOf('/') > 0) patch.route = String(opts.model);
      if (opts.persona) patch.persona = String(opts.persona);
      if (Object.keys(patch).length) d.setThreadLocal(nt.id, patch);

      // Preserve compacted-state markers: branchThread clones the covered
      // prefix in order, so old id -> new id is positional. Remap the lens
      // applied slice (mute/focus/subcompact) onto the branch.
      var s = store();
      if (s && typeof d.lensState === 'function') {
        var newMsgs = d.messages(nt.id);
        var idMap = {};
        for (var j = 0; j < coverCount && j < newMsgs.length; j++) {
          idMap[srcMsgs[j].id] = newMsgs[j].id;
        }
        var applied = (d.lensState(threadId) || {}).applied || {};
        var remap = function (ids) {
          return (ids || []).filter(function (id) { return !!idMap[id]; }).map(function (id) { return idMap[id]; });
        };
        var subcompacted = (applied.subcompacted || []).map(function (entry) {
          return { ids: remap(entry.ids), summary: entry.summary };
        }).filter(function (entry) { return entry.ids.length > 0; });
        s.set('lens.' + nt.id, {
          mode: 'off',
          selecting: false,
          selectedIds: [],
          applied: {
            muted: remap(applied.muted),
            focused: remap(applied.focused),
            subcompacted: subcompacted
          }
        });
      }

      append(threadId, {
        branchCard: {
          kind: opts.model ? 'branch-model' : (opts.persona ? 'branch-persona' : 'branch'),
          threadId: nt.id,
          title: nt.title,
          atMessageId: atMessageId || null,
          model: opts.model || null,
          persona: opts.persona || null
        }
      });
      touch(threadId);
      return nt;
    },

    // Immutable restore point: record on the thread + transcript card.
    createRestorePoint: function (threadId, label) {
      var d = data();
      var t = d && d.thread(threadId);
      if (!t) return null;
      if (!Array.isArray(t.restorePoints)) t.restorePoints = [];
      var msgs = d.messages(threadId);
      var last = msgs[msgs.length - 1];
      var seq = ++rpSeq;
      var rp = {
        id: 'rp-' + seq,
        label: label || ('Restore point ' + seq),
        atMessageId: last ? last.id : null,
        messageCount: msgs.length,
        createdAt: nowIso(),
        immutable: true
      };
      t.restorePoints.push(rp);
      append(threadId, {
        restorePointCard: {
          id: rp.id,
          label: rp.label,
          atMessageId: rp.atMessageId,
          messageCount: rp.messageCount
        }
      });
      touch(threadId);
      return rp;
    },

    // Non-destructive rewind: restore point first, then everything after the
    // target message folds into a collapsed "rewound" region with a restore
    // link. Messages are never deleted.
    rewindTo: function (threadId, messageId) {
      var d = data();
      var t = d && d.thread(threadId);
      if (!t) return null;
      var rp = K3ThreadOps.createRestorePoint(threadId, 'Before rewind');
      if (!rp) return null;
      var msgs = d.messages(threadId);
      var idx = -1;
      for (var i = 0; i < msgs.length; i++) {
        if (msgs[i].id === messageId) { idx = i; break; }
      }
      if (idx < 0) return { error: 'not-found', restorePoint: rp };
      var count = 0;
      for (var j = idx + 1; j < msgs.length; j++) {
        var m = msgs[j];
        if (m.restorePointCard || m.rewoundMarker) continue; // surgery artifacts stay visible
        if (!m.rewound) {
          m.rewound = true;
          m.rewoundBy = rp.id;
          count++;
        }
      }
      append(threadId, {
        rewoundMarker: {
          kind: 'rewound',
          count: count,
          restorePointId: rp.id,
          atMessageId: messageId
        }
      });
      touch(threadId);
      return { restorePoint: rp, count: count };
    },

    // Restore link: clear the rewound region created by a restore point.
    restoreFrom: function (threadId, restorePointId) {
      var d = data();
      var t = d && d.thread(threadId);
      if (!t) return false;
      d.messages(threadId).forEach(function (m) {
        if (m.rewound && (!restorePointId || m.rewoundBy === restorePointId)) {
          delete m.rewound;
          delete m.rewoundBy;
        }
      });
      touch(threadId);
      return true;
    },

    // Active-turn redirect. Preserves the partial attempt ('interrupted'),
    // appends the correction ('redirected'), and tags the next assistant
    // reply 'resumed' exactly once. Inactive thread -> plain send.
    redirect: function (threadId, text) {
      var d = data();
      if (!d) return null;
      if (!d.isActive(threadId)) {
        return d.send(threadId, text);
      }
      d.stop(threadId); // keeps the partial attempt as a stopped result
      var msgs = d.messages(threadId);
      for (var i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs[i].redirectMarker = { state: 'interrupted', note: 'Interrupted — redirected by you' };
          break;
        }
      }
      // One-shot 'resumed' tag on the next assistant message in this thread.
      if (window.K3 && typeof window.K3.on === 'function') {
        if (pendingResume[threadId]) {
          window.K3.off('data', pendingResume[threadId]);
          delete pendingResume[threadId];
        }
        var onData = function (evt) {
          if (!evt || evt.type !== 'message-added' || evt.threadId !== threadId) return;
          var m = evt.message;
          if (!m || m.role !== 'assistant' || m.redirectMarker) return;
          m.redirectMarker = { state: 'resumed', note: 'Resumed with your correction' };
          window.K3.off('data', onData);
          if (pendingResume[threadId] === onData) delete pendingResume[threadId];
          d.touchThread(threadId);
        };
        pendingResume[threadId] = onData;
        window.K3.on('data', onData);
      }
      var um = d.send(threadId, text);
      if (um) um.redirectMarker = { state: 'redirected', note: 'Redirected the active turn' };
      touch(threadId);
      return um;
    }
  };

  window.K3ThreadOps = K3ThreadOps;
})();
