/* PMXThreadOps — Opus 5
 *
 * The typed thread operations an authorized Assistant agent may perform across threads
 * (02_CONTEXT_HISTORY_THREADS_AND_BRANCHING.md:60-72) — list related threads, read a bounded
 * range, send a typed request, await a response, resume an inactive target, spawn a child or
 * sibling research thread, branch from a message or restore point — plus the branch/rewind
 * family (02_...:78-94) and the active-turn redirect (02_...:96-105).
 *
 * Everything in this file exists to make one sentence enforceable in code rather than promised
 * in prose: "No hidden shared context. No full-transcript copying. Add cycle and fan-out
 * protection." (02_...:76). Four consequences follow, and each is asserted by a Phase G probe.
 *
 * 1. THE ONLY WAYS OUT OF A THREAD ARE A SHELL AND A BOUNDED RANGE. `related()` returns
 *    `{id, title, state}` and nothing else. A cross-thread lister that hands back message arrays
 *    is precisely how one agent's curiosity becomes another thread's context blowout, and it is
 *    invisible while it happens because the caller never asked for a transcript. `readRange` is
 *    the single reader, and past MAX_RANGE it THROWS. Truncating instead would be worse than
 *    refusing: forty messages returned from a request for sixty reads exactly like a complete
 *    answer, so the caller summarizes a hole and never learns it had one.
 *
 * 2. CYCLE AND FAN-OUT REFUSALS ARE RECORDS, NOT DROPS. A refused request is still written into
 *    the source thread's list with `status:'refused_cycle'` / `'refused_fanout'` and a
 *    human-readable `reason`, because the failure mode the packet is guarding against is two
 *    threads waiting on each other forever — and a silently dropped request produces exactly the
 *    same wait with nothing on screen to explain it.
 *
 * 3. A BRANCH INHERITS REFERENCES, NEVER RAW MESSAGES (02_...:92). The record carries
 *    `branchedFrom` and `inheritedRefs`; the branch's own message window is a REFERENCE-SLICE of
 *    the source array (the same message objects, never copies) held in module state, resolvable
 *    only through `readRange`. It is deliberately not in the store: `store.snapshot()` deep-clones
 *    and JSON-serializes the whole state, so a branch that parked messages in its view slice would
 *    quietly copy the transcript into localStorage on the next persist — the copy the packet
 *    forbids, arriving by the back door.
 *
 * 4. A REWIND ALWAYS CREATES ITS RESTORE POINT FIRST. A rewind you cannot undo is data loss, and
 *    an undo offered only when the code remembers to offer it is not an undo. So `rewind` calls
 *    `createRestorePoint` before it touches `rewoundTo`, every time, and the point captures the
 *    PREVIOUS `rewoundTo` so `restore` puts the conversation back where it actually was.
 *
 * All durable state lives in `view[tid].threadOps`
 * (`{requests, spawned, branches, restorePoints, rewoundTo, redirect}`), which the store already
 * seeds from the fixture, and every mutation announces with `store.touchView('threadOps')`.
 * This module never touches the DOM.
 *
 * Contract: CONTRACT.md section 5 (store is the only source of truth for semantic state);
 * SERVICES.md "PMXThreadOps".
 */
(function (global) {
  'use strict';

  var store = null, data = null;
  var seq = 0;

  /* Research threads may nest three levels below a root thread. Past that a lineage stops being
   * a plan and becomes a tree nobody can hold in their head, and the honest alternative — send a
   * typed request to a thread that already exists — is always available. */
  var MAX_DEPTH = 3;

  /* Open children of one thread, counted per family. Requests and spawns are counted separately
   * on purpose: they consume different budgets (a request blocks on someone else answering, a
   * spawn blocks on capacity), and a shared counter would make a fixture that seeds one spawned
   * child silently lower the request limit to three. */
  var MAX_FANOUT = 4;

  /* The bounded reader's ceiling, in messages. */
  var MAX_RANGE = 40;

  /* 02_...:74 fixes the request record; these are its `status` union. `queued` is a request whose
   * target is not awake yet — `resume()` promotes it — and the two `refused_*` values are
   * terminal records rather than error returns. */
  var REQUEST_STATUSES = [
    'queued', 'sent', 'awaiting', 'answered', 'declined', 'timeout',
    'refused_cycle', 'refused_fanout'
  ];
  var OPEN_REQUEST = { queued: true, sent: true, awaiting: true };

  /* A spawned child still consuming a slot. `complete` and the refusals are settled. */
  var OPEN_SPAWN = { spawned: true, running: true };

  /* Thread states that cannot receive a request until someone resumes the thread. The fixture's
   * other states (`running`, `blocked`, `awaiting question`) are all awake — they are busy, which
   * is a queue at the target, not a closed door. */
  var INACTIVE_THREAD = { idle: true, paused: true };

  /* 02_...:102 names the three states a redirect must be able to show. */
  var REDIRECT_PHASES = ['interrupted', 'redirected', 'resumed'];

  /* A redirect is a sequence, not an instant: the old attempt stops, the new instruction is
   * dispatched, the turn carries on. These are the two beats between those three states. Short
   * enough that the composer never feels stuck, long enough that all three are actually seen. */
  var REDIRECT_MS = 260;
  var RESUME_MS = 900;

  /* A request with no stated budget still has one. An await that no one bounded is the cycle
   * problem again, wearing a different hat. */
  var DEFAULT_BUDGET = { turns: 2, seconds: 120 };

  /* Branch thread id -> reference-slice of the SOURCE messages array. Module state, never the
   * store — see decision 3 in the header. */
  var branchMessages = {};

  /* Request id -> observable op id, and request id -> budget timer. Kept beside the records
   * rather than on them so the record shape stays exactly the one 02_...:74 specifies. */
  var awaitOps = {};
  var awaitTimers = {};

  function bind(s, d) {
    store = s || null;
    data = d || null;
    return api;
  }

  /* ---- small helpers ------------------------------------------------------------------- */

  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function nowIso() { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); }
  function nextId(prefix) { seq += 1; return prefix + '-' + seq; }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function announce() { if (store && typeof store.touchView === 'function') store.touchView('threadOps'); }

  function threadRecord(id) {
    if (!id || !data || typeof data.threadById !== 'function') return null;
    try { return data.threadById(id) || null; } catch (e) { return null; }
  }

  function titleOf(id) {
    var t = threadRecord(id);
    if (t && t.title) return t.title;
    var derived = derivedShell(id);
    return (derived && derived.title) || String(id);
  }

  /* The per-thread slice, with every key present. Repairs a slice written before a key existed
   * rather than assuming the store's default, so a rehydrated snapshot cannot crash a caller. */
  function ops(threadId) {
    if (!store || !threadId) return null;
    var v = store.view(threadId);
    if (!v.threadOps) v.threadOps = {};
    var o = v.threadOps;
    if (!o.requests) o.requests = [];
    if (!o.spawned) o.spawned = [];
    if (!o.branches) o.branches = [];
    if (!o.restorePoints) o.restorePoints = [];
    if (!has(o, 'rewoundTo')) o.rewoundTo = null;
    if (!has(o, 'redirect')) o.redirect = null;
    return o;
  }

  /* Walks every slice that can hold a record: the views that already exist, plus the fixture
   * threads that AUTHOR thread operations and whose view has therefore not been seeded yet.
   * Deliberately not every thread in the corpus — touching `store.view()` creates a slice, and a
   * lookup that materializes eighteen empty views on every call would grow the snapshot for
   * nothing. */
  function eachOps(fn) {
    if (!store) return;
    var ids = [], seen = {}, k, i;
    if (typeof store.state === 'function') {
      var views = (store.state() && store.state().view) || {};
      for (k in views) { if (has(views, k) && !seen[k]) { seen[k] = true; ids.push(k); } }
    }
    var list = (data && data.threads) || [];
    for (i = 0; i < list.length; i++) {
      if (list[i].threadOps && !seen[list[i].id]) { seen[list[i].id] = true; ids.push(list[i].id); }
    }
    for (i = 0; i < ids.length; i++) {
      var o = ops(ids[i]);
      if (o && fn(ids[i], o) === false) return;
    }
  }

  /* ---- related threads ------------------------------------------------------------------ */

  function shell(id, title, state) {
    /* Exactly three keys. Anything more here is the beginning of a transcript. */
    return { id: id, title: title || String(id), state: state || 'idle' };
  }

  /* A thread this session created (branch or spawn) has no fixture record, so its shell is
   * rebuilt from the lineage record that made it. */
  function derivedShell(id) {
    var found = null;
    eachOps(function (tid, o) {
      var i;
      for (i = 0; i < o.spawned.length; i++) {
        if (o.spawned[i].threadId === id) {
          found = shell(id, o.spawned[i].title, o.spawned[i].status === 'running' ? 'running' : 'idle');
          return false;
        }
      }
      for (i = 0; i < o.branches.length; i++) {
        if (o.branches[i].threadId === id) {
          found = shell(id, o.branches[i].title, 'idle');
          return false;
        }
      }
      return true;
    });
    return found;
  }

  function related(threadId) {
    if (!store || !threadId) return [];
    var self = threadRecord(threadId);
    var out = [], seen = {}, i;
    seen[threadId] = true;

    function push(s) {
      if (!s || !s.id || seen[s.id]) return;
      seen[s.id] = true;
      out.push(s);
    }
    function pushThread(id) {
      var t = threadRecord(id);
      if (t) push(shell(t.id, t.title, t.threadState));
      else push(derivedShell(id));
    }

    /* Lineage first: what this thread produced, and who it is actually talking to. Ordering is
     * a product decision, not an accident — the threads a user can act on outrank the rest of
     * the project. */
    var o = ops(threadId);
    if (o) {
      for (i = 0; i < o.spawned.length; i++) {
        if (o.spawned[i].threadId) push(shell(o.spawned[i].threadId, o.spawned[i].title,
          o.spawned[i].status === 'running' ? 'running' : 'idle'));
      }
      for (i = 0; i < o.branches.length; i++) push(shell(o.branches[i].threadId, o.branches[i].title, 'idle'));
      for (i = 0; i < o.requests.length; i++) pushThread(o.requests[i].targetThreadId);
    }

    /* Then anyone holding an open request aimed at this thread. Being asked a question is a
     * relation, and it is the one a reader most needs to see. */
    eachOps(function (tid, slice) {
      if (tid === threadId) return true;
      for (var j = 0; j < slice.requests.length; j++) {
        if (slice.requests[j].targetThreadId === threadId && OPEN_REQUEST[slice.requests[j].status]) {
          pushThread(tid);
          break;
        }
      }
      return true;
    });

    /* Then the rest of the project. A thread with no fixture record has no project, so it gets
     * lineage only rather than the whole corpus. */
    if (self) {
      var list = (data && data.threads) || [];
      for (i = 0; i < list.length; i++) {
        var t = list[i];
        if (t.deleted || t.id === threadId) continue;
        if (t.project !== self.project) continue;
        push(shell(t.id, t.title, t.threadState));
      }
    }
    return out;
  }

  /* ---- bounded reading ------------------------------------------------------------------- */

  function messagesOf(threadId) {
    if (branchMessages[threadId]) return branchMessages[threadId];
    if (data && typeof data.messagesFor === 'function') {
      try { return data.messagesFor(threadId) || []; } catch (e) { /* fall through */ }
    }
    var t = threadRecord(threadId);
    return (t && t.messages) || [];
  }

  function indexOfMessage(msgs, messageId) {
    if (!messageId) return -1;
    for (var i = 0; i < msgs.length; i++) if (msgs[i].id === messageId) return i;
    return -1;
  }

  /* Inclusive range. Throws above MAX_RANGE — see decision 1. The check runs against the ASK,
   * before the data is consulted, so an over-wide read of an empty or unknown thread is refused
   * for the same reason it would be refused anywhere else. */
  function readRange(threadId, fromIdx, toIdx) {
    var from = Math.max(0, Math.floor(Number(fromIdx) || 0));
    var to = (toIdx == null || isNaN(Number(toIdx))) ? (from + MAX_RANGE - 1) : Math.floor(Number(toIdx));
    var want = to - from + 1;
    if (want > MAX_RANGE) {
      throw new Error('PMXThreadOps.readRange: ' + want + ' messages requested from ' + threadId +
        '; the bounded reader stops at ' + MAX_RANGE +
        '. Read a narrower range, or send a typed request instead of the transcript.');
    }
    if (want <= 0) return [];
    var msgs = messagesOf(threadId);
    var out = [];
    for (var i = from; i <= to && i < msgs.length; i++) {
      var m = msgs[i];
      /* A reading projection, not the live message object: a cross-thread reader has no business
       * holding a handle it could mutate, and the runtime block it does not need is the bulk of
       * the record. */
      out.push({ id: m.id, threadId: m.threadId || threadId, role: m.role, body: m.body, sentAt: m.sentAt });
    }
    return out;
  }

  /* ---- typed requests -------------------------------------------------------------------- */

  /* 02_...:74 verbatim, plus `reason`. The reason is not decoration: every refusal and every
   * queue in this family has to be able to say why in one human-readable line. */
  function makeRequest(spec, status, reason) {
    var s = spec || {};
    var at = nowIso();
    var budget = s.budget || {};
    return {
      id: nextId('req'),
      sourceThreadId: s.sourceThreadId || null,
      targetThreadId: s.targetThreadId || null,
      sender: s.sender || 'Assistant',
      task: s.task || '',
      evidenceRefs: (s.evidenceRefs || []).slice(),
      scope: s.scope || 'This thread only',
      budget: {
        turns: budget.turns != null ? budget.turns : DEFAULT_BUDGET.turns,
        seconds: budget.seconds != null ? budget.seconds : DEFAULT_BUDGET.seconds
      },
      createdAt: at,
      updatedAt: at,
      status: status,
      resultRefs: [],
      reason: reason || null
    };
  }

  function fileRequest(threadId, rec) {
    var o = ops(threadId);
    if (o) o.requests.push(rec);
    announce();
    return rec;
  }

  function openRequestsOf(threadId) {
    var o = ops(threadId), out = [];
    if (!o) return out;
    for (var i = 0; i < o.requests.length; i++) {
      if (OPEN_REQUEST[o.requests[i].status]) out.push(o.requests[i]);
    }
    return out;
  }

  /* Records are owned by the SENDING thread, so "does the target already hold an open request
   * back to me" is a question about the target's own outbound list. One owner per record means
   * there is never a mirror to keep in sync, and never two copies disagreeing about a status. */
  function openRequestBackTo(targetId, sourceId) {
    var open = openRequestsOf(targetId);
    for (var i = 0; i < open.length; i++) if (open[i].targetThreadId === sourceId) return open[i];
    return null;
  }

  function request(spec) {
    var s = spec || {};
    var source = s.sourceThreadId, target = s.targetThreadId;

    if (!source || !target) {
      return makeRequest(s, 'declined', 'A request needs both a source thread and a target thread.');
    }
    if (!store) {
      return makeRequest(s, 'declined', 'Thread operations are unavailable until the workspace finishes loading.');
    }
    if (source === target) {
      return fileRequest(source, makeRequest(s, 'refused_cycle',
        'A thread cannot send a request to itself.'));
    }

    var back = openRequestBackTo(target, source);
    if (back) {
      return fileRequest(source, makeRequest(s, 'refused_cycle',
        titleOf(target) + ' already has an open request back to ' + titleOf(source) +
        '. Answer or cancel that one before sending a request the other way.'));
    }

    var open = openRequestsOf(source);
    if (open.length >= MAX_FANOUT) {
      return fileRequest(source, makeRequest(s, 'refused_fanout',
        titleOf(source) + ' already has ' + open.length + ' open requests, which is the limit of ' +
        MAX_FANOUT + '. Answer or cancel one before sending another.'));
    }

    var t = threadRecord(target);
    var asleep = !!(t && INACTIVE_THREAD[t.threadState]);
    return fileRequest(source, makeRequest(s, asleep ? 'queued' : 'sent',
      asleep ? titleOf(target) + ' is not active. The request waits until that thread is resumed.' : null));
  }

  function findRequest(reqId) {
    var found = null;
    if (!reqId) return null;
    eachOps(function (tid, o) {
      for (var i = 0; i < o.requests.length; i++) {
        if (o.requests[i].id === reqId) { found = { threadId: tid, rec: o.requests[i] }; return false; }
      }
      return true;
    });
    return found;
  }

  function clearBudget(reqId) {
    if (!awaitTimers[reqId]) return;
    if (typeof global.clearTimeout === 'function') global.clearTimeout(awaitTimers[reqId]);
    delete awaitTimers[reqId];
  }

  /* The budget is the reason an await cannot hang forever. It fails the observable op rather
   * than resolving it, because a timeout is not an answer. */
  function scheduleBudget(rec) {
    var secs = Number(rec.budget && rec.budget.seconds);
    if (!secs || secs <= 0 || awaitTimers[rec.id]) return;
    if (typeof global.setTimeout !== 'function') return;
    awaitTimers[rec.id] = global.setTimeout(function () {
      delete awaitTimers[rec.id];
      if (rec.status !== 'awaiting') return;
      rec.status = 'timeout';
      rec.updatedAt = nowIso();
      rec.reason = 'The ' + secs + ' second budget elapsed before ' + titleOf(rec.targetThreadId) + ' answered.';
      var O = global.PMXObservable, opId = awaitOps[rec.id];
      if (O && opId && typeof O.fail === 'function') O.fail(opId, rec.reason);
      delete awaitOps[rec.id];
      announce();
    }, secs * 1000);
  }

  function awaitRequest(reqId) {
    var found = findRequest(reqId);
    if (!found) return null;
    var rec = found.rec;
    /* A settled request is not awaitable. Returning null rather than minting a second op keeps
     * "one op per await" true, which is what lets a renderer bind a pulse to `data-pmx-op`. */
    if (!OPEN_REQUEST[rec.status]) return null;

    rec.status = 'awaiting';
    rec.updatedAt = nowIso();

    var opId = awaitOps[rec.id] || null;
    var O = global.PMXObservable;
    if (!opId && O && typeof O.start === 'function') {
      var op = O.start({
        id: 'op-' + rec.id,
        kind: 'request',
        label: 'Awaiting ' + titleOf(rec.targetThreadId),
        determinate: false
      });
      opId = (op && op.id) || null;
      if (opId) awaitOps[rec.id] = opId;
    }
    scheduleBudget(rec);
    announce();
    return opId;
  }

  /* `resultRefs === false` declines; anything else answers. Both are terminal, both finish the
   * op — the await really did end — and the record says which happened. */
  function respond(reqId, resultRefs) {
    var found = findRequest(reqId);
    if (!found) return false;
    var rec = found.rec;
    if (!OPEN_REQUEST[rec.status]) return false;

    clearBudget(rec.id);
    var declined = (resultRefs === false);
    rec.status = declined ? 'declined' : 'answered';
    rec.resultRefs = declined ? [] : (resultRefs ? [].concat(resultRefs) : []);
    rec.updatedAt = nowIso();
    rec.reason = declined ? titleOf(rec.targetThreadId) + ' declined the request.' : null;

    var O = global.PMXObservable, opId = awaitOps[rec.id];
    if (O && opId && typeof O.finish === 'function') {
      O.finish(opId, { status: rec.status, resultRefs: rec.resultRefs.length });
    }
    delete awaitOps[rec.id];
    announce();
    return true;
  }

  /* Resuming an inactive target is what turns a `queued` request into a `sent` one. Both halves
   * happen here so a caller cannot wake a thread and leave its inbox frozen. */
  function resume(threadId) {
    if (!store || !threadId) return false;
    var changed = false;

    var t = threadRecord(threadId);
    if (t && t.threadState === 'paused') { t.threadState = 'idle'; changed = true; }

    eachOps(function (tid, o) {
      for (var i = 0; i < o.requests.length; i++) {
        var r = o.requests[i];
        if (r.targetThreadId === threadId && r.status === 'queued') {
          r.status = 'sent';
          r.reason = null;
          r.updatedAt = nowIso();
          changed = true;
        }
      }
      return true;
    });

    if (changed) announce();
    return changed;
  }

  /* ---- spawning -------------------------------------------------------------------------- */

  /* Depth comes from the spawn record that created the thread, not from a walk up the chain: the
   * record already knows, and a walk is a place for a cycle to hide. A fixture thread is depth 0. */
  function depthOf(threadId) {
    var depth = 0;
    eachOps(function (tid, o) {
      for (var i = 0; i < o.spawned.length; i++) {
        if (o.spawned[i].threadId === threadId) { depth = o.spawned[i].depth || 0; return false; }
      }
      return true;
    });
    return depth;
  }

  function openSpawnOf(threadId) {
    var o = ops(threadId), out = [];
    if (!o) return out;
    for (var i = 0; i < o.spawned.length; i++) if (OPEN_SPAWN[o.spawned[i].status]) out.push(o.spawned[i]);
    return out;
  }

  function titleFromTask(task, relation) {
    var t = String(task || '').replace(/\s+/g, ' ').trim();
    if (!t) return relation === 'sibling' ? 'Sibling thread' : 'Research thread';
    if (t.length <= 48) return t;
    return t.slice(0, 47) + '…';
  }

  function spawn(specIn) {
    var s = specIn || {};
    var parent = s.parentThreadId;
    var relation = (s.relation === 'sibling') ? 'sibling' : 'child';
    var at = nowIso();

    function rec(status, reason) {
      return {
        id: nextId('spawn'),
        parentThreadId: parent || null,
        threadId: null,
        title: titleFromTask(s.task, relation),
        relation: relation,
        task: s.task || '',
        depth: 0,
        createdAt: at,
        updatedAt: at,
        status: status,
        reason: reason || null
      };
    }

    if (!store || !parent) {
      return rec('declined', 'A spawned thread needs a parent thread.');
    }

    /* A sibling sits beside the thread it was spawned from; a child sits one level below it. */
    var parentDepth = depthOf(parent);
    var depth = relation === 'sibling' ? parentDepth : parentDepth + 1;

    if (depth > MAX_DEPTH) {
      var refusedDepth = rec('refused_depth',
        'Research threads nest ' + MAX_DEPTH + ' levels deep and this one would be level ' + depth +
        '. Send a typed request to an existing thread instead.');
      refusedDepth.depth = depth;
      ops(parent).spawned.push(refusedDepth);
      announce();
      return refusedDepth;
    }

    var open = openSpawnOf(parent);
    if (open.length >= MAX_FANOUT) {
      var refusedFanout = rec('refused_fanout',
        titleOf(parent) + ' already has ' + open.length + ' open research threads, which is the limit of ' +
        MAX_FANOUT + '. Close one before spawning another.');
      refusedFanout.depth = depth;
      ops(parent).spawned.push(refusedFanout);
      announce();
      return refusedFanout;
    }

    var out = rec('spawned', null);
    out.depth = depth;
    out.threadId = nextId('thread-spawn');
    ops(parent).spawned.push(out);
    announce();
    return out;
  }

  /* ---- branching ------------------------------------------------------------------------- */

  function dedupeRefs(refs) {
    var seen = {}, out = [];
    for (var i = 0; i < refs.length; i++) {
      var key = refs[i].kind + ':' + refs[i].id;
      if (seen[key]) continue;
      seen[key] = true;
      out.push(refs[i]);
    }
    return out;
  }

  /* What a branch inherits: pointers to attachments, citations, the selected compacted state and
   * the source's artifacts. References, so the branch can resolve them from the one copy that
   * already exists — 02_...:92 requires the branch to preserve them and forbids cloning the raw
   * material into a new provider prompt, and those two are only compatible if this list holds
   * addresses rather than content. */
  function inheritedRefsFor(threadId, msgs, throughIdx) {
    var refs = [], i, j;
    if (!store) return refs;
    var v = store.view(threadId);

    var atts = v.attachments || [];
    for (i = 0; i < atts.length; i++) {
      refs.push({ kind: 'attachment', id: atts[i].id || atts[i].name, label: atts[i].name || atts[i].id || '' });
    }

    var compact = v.context && v.context.compact;
    if (compact) {
      refs.push({ kind: 'compacted_state', id: compact.summaryRef || 'compact', label: 'Compacted context' });
    }

    var t = threadRecord(threadId);
    var arts = (t && t.artifacts) || [];
    for (i = 0; i < arts.length; i++) {
      refs.push({ kind: 'artifact', id: arts[i].id, label: arts[i].title || arts[i].name || arts[i].id || '' });
    }

    for (i = 0; i <= throughIdx && i < msgs.length; i++) {
      var cites = msgs[i].citations || (msgs[i].runtime && msgs[i].runtime.citations) || [];
      for (j = 0; j < cites.length; j++) {
        var c = cites[j];
        if (c == null) continue;
        if (typeof c === 'string') { refs.push({ kind: 'citation', id: c, label: c }); continue; }
        refs.push({ kind: 'citation', id: c.id || c.ref || c.url || '', label: c.label || c.title || c.url || '' });
      }
    }
    return dedupeRefs(refs);
  }

  /* Reopening questionnaire history is a SIBLING branch (02_...:94): the original answers stay
   * answered where they were answered, and the copy starts clean so a different set can be given
   * without rewriting history. */
  function copyQuestionnaire(sourceThreadId, newThreadId, questionnaireId) {
    /* The questionnaire slice is seeded from the fixture by PMXQuestionnaire on first touch, not
     * by the store. Asking that service for the thread's queue is how this module materializes
     * the slice without reimplementing the seeding — a second seeder here would be the "no second
     * system" rule broken in miniature, and it would drift the moment the record shape changes. */
    var Q = global.PMXQuestionnaire;
    if (Q && typeof Q.queueFor === 'function') { try { Q.queueFor(sourceThreadId); } catch (e) { /* unbound */ } }
    var srcSlice = store.view(sourceThreadId).questionnaire;
    if (!srcSlice) return null;

    var pools = [srcSlice.queue || [], srcSlice.history || []], found = null, i, j;
    for (i = 0; i < pools.length && !found; i++) {
      for (j = 0; j < pools[i].length; j++) {
        if (pools[i][j] && pools[i][j].id === questionnaireId) { found = pools[i][j]; break; }
      }
    }
    if (!found) return null;

    /* A structural clone, so a field the questionnaire service adds later still travels. Only the
     * four lifecycle fields and the per-question answers are overwritten. */
    var copy = clone(found);
    copy.id = nextId('q');
    copy.status = 'queued';
    copy.currentQuestionIndex = 0;
    copy.resolvedAt = null;
    copy.createdAt = nowIso();
    copy.branchedFromQuestionnaireId = found.id;
    var qs = copy.questions || [];
    for (i = 0; i < qs.length; i++) { delete qs[i].selected; delete qs[i].draft; }

    var target = store.view(newThreadId).questionnaire;
    if (!target) target = { queue: [], history: [], skipped: {} };
    if (!target.queue) target.queue = [];
    if (!target.history) target.history = [];
    if (!target.skipped) target.skipped = {};
    target.queue.push(copy);
    store.setView(newThreadId, 'questionnaire', target);
    return copy;
  }

  function branch(specIn) {
    var s = specIn || {};
    var srcId = s.threadId;
    if (!store || !srcId) return null;

    var src = threadRecord(srcId);
    var msgs = messagesOf(srcId);
    if (!src && !msgs.length && !branchMessages[srcId]) return null;

    var reason = null;
    var idx = msgs.length - 1;
    if (s.messageId) {
      var at = indexOfMessage(msgs, s.messageId);
      if (at >= 0) idx = at;
      else reason = 'That message is no longer in this thread, so the branch was taken from the latest message.';
    }
    var messageId = (idx >= 0 && msgs[idx]) ? msgs[idx].id : (s.messageId || null);

    var fromQ = s.fromQuestionnaireId || null;
    var newTid = nextId('thread-branch');
    var createdAt = nowIso();

    var rec = {
      id: nextId('branch'),
      threadId: newTid,
      sourceThreadId: srcId,
      title: (src ? src.title : titleOf(srcId)) + (fromQ ? ' — answered differently' : ' — branch'),
      /* A questionnaire reopen is a sibling; every other branch hangs off the message it names. */
      relation: fromQ ? 'sibling' : 'branch',
      branchedFrom: { threadId: srcId, messageId: messageId },
      inheritedRefs: inheritedRefsFor(srcId, msgs, idx),
      withModel: s.withModel || null,
      withPersona: s.withPersona || null,
      fromQuestionnaireId: fromQ,
      questionnaireId: null,
      provenance: {
        branchedAt: createdAt,
        branchedBy: s.sender || 'You',
        sourceTitle: src ? src.title : String(srcId),
        throughMessageIndex: idx,
        messageCount: Math.max(0, idx + 1)
      },
      createdAt: createdAt,
      reason: reason
    };

    /* The reference-slice: the SAME message objects the source holds, in a new array. No copy of
     * a body exists anywhere after this line, and the slice lives outside the store so a persist
     * cannot turn it into one. `readRange(newTid, …)` is the only door to it. */
    branchMessages[newTid] = msgs.slice(0, Math.max(0, idx + 1));

    if (fromQ) {
      var copied = copyQuestionnaire(srcId, newTid, fromQ);
      if (copied) rec.questionnaireId = copied.id;
      else rec.reason = 'That questionnaire is no longer in this thread, so the branch starts without it.';
    }

    ops(srcId).branches.push(rec);
    announce();
    return rec;
  }

  /* ---- restore points, rewind, restore --------------------------------------------------- */

  function createRestorePoint(threadId, messageId) {
    var o = ops(threadId);
    if (!o) return null;
    var msgs = messagesOf(threadId);
    var idx = indexOfMessage(msgs, messageId);
    if (idx < 0) idx = msgs.length - 1;
    var rec = {
      id: nextId('rp'),
      threadId: threadId,
      messageId: messageId || (msgs[idx] ? msgs[idx].id : null),
      messageIndex: idx,
      at: nowIso(),
      label: 'Restore point at message ' + (idx + 1),
      /* What `restore` puts back. Capturing the state BEFORE the change is the whole difference
       * between an undo and a second, differently wrong, jump. */
      previousRewoundTo: o.rewoundTo,
      restoredAt: null
    };
    o.restorePoints.push(rec);
    announce();
    return rec;
  }

  /* Conversation-only, matching the canonical `cmd.chat.rewind`: history is marked, never
   * deleted, and the restore point is minted first so the mark can always be lifted. */
  function rewind(threadId, messageId) {
    var o = ops(threadId);
    if (!o) return { ok: false, restorePointId: null };
    var point = createRestorePoint(threadId, messageId);
    o.rewoundTo = messageId || (point ? point.messageId : null);
    announce();
    return { ok: true, restorePointId: point ? point.id : null };
  }

  function findRestorePoint(rpId) {
    var found = null;
    if (!rpId) return null;
    eachOps(function (tid, o) {
      for (var i = 0; i < o.restorePoints.length; i++) {
        if (o.restorePoints[i].id === rpId) { found = { threadId: tid, rec: o.restorePoints[i] }; return false; }
      }
      return true;
    });
    return found;
  }

  function restore(restorePointId) {
    var found = findRestorePoint(restorePointId);
    if (!found) {
      return { ok: false, threadId: null, messageId: null, reason: 'That restore point no longer exists.' };
    }
    var o = ops(found.threadId);
    o.rewoundTo = found.rec.previousRewoundTo || null;
    found.rec.restoredAt = nowIso();
    announce();
    return { ok: true, threadId: found.threadId, messageId: found.rec.messageId, reason: null };
  }

  /* ---- active-turn redirect --------------------------------------------------------------- */

  function advancePhase(threadId, rec, phase) {
    var o = ops(threadId);
    /* A later redirect supersedes this one; its timers must not walk over the newer record. */
    if (!o || o.redirect !== rec) return;
    if (rec.phase === phase) return;
    rec.phase = phase;
    rec.updatedAt = nowIso();
    rec.phases.push({ phase: phase, at: rec.updatedAt });
    announce();
  }

  function later(fn, ms) {
    if (typeof global.setTimeout !== 'function') { fn(); return; }
    global.setTimeout(fn, ms);
  }

  /* A correction typed during generation steers the turn in flight. The original attempt and its
   * partial output are preserved on the record, the three visible phases are walked in order, and
   * the new provider attempt is linked by id so the thread renders it AS a redirect rather than
   * as an unrelated ordinary message (02_...:98-105). */
  function redirect(threadId, text) {
    var o = ops(threadId);
    if (!o) return null;

    var R = global.PMXRuntime;
    var active = !!(R && typeof R.isActive === 'function' && R.isActive(threadId));
    var live = (active && typeof R.liveStatus === 'function') ? R.liveStatus(threadId) : null;

    var msgs = messagesOf(threadId);
    var anchor = msgs.length ? msgs[msgs.length - 1] : null;
    /* The partial output has to be read BEFORE the attempt is stopped; afterwards the run is gone
     * and the only honest answer would be an empty string. */
    var partialBody = live ? String(live.text || '') : '';
    var workedSeconds = live ? (live.workedSeconds || 0) : 0;

    if (active && typeof R.stop === 'function') {
      R.stop(threadId);
      msgs = messagesOf(threadId);
      var tail = msgs.length ? msgs[msgs.length - 1] : null;
      if (tail && tail.stopped) anchor = tail;
    }

    var at = nowIso();
    var phase = active ? 'interrupted' : 'redirected';
    var rec = {
      id: nextId('redirect'),
      threadId: threadId,
      text: String(text == null ? '' : text),
      phase: phase,
      phases: [{ phase: phase, at: at }],
      interrupted: active,
      originalAttempt: { messageId: anchor ? anchor.id : null, partialBody: partialBody },
      workedSeconds: workedSeconds,
      attemptMessageId: null,
      createdAt: at,
      updatedAt: at
    };
    o.redirect = rec;
    announce();

    /* "Create a new provider attempt when required" (02_...:103). The runtime owns turns, so the
     * redirect asks it for one rather than growing a second turn machine here. */
    if (R && typeof R.send === 'function' && rec.text) {
      var m = R.send(threadId, rec.text);
      if (m) rec.attemptMessageId = m.id;
    }

    if (phase === 'interrupted') {
      later(function () { advancePhase(threadId, rec, 'redirected'); }, REDIRECT_MS);
    }
    later(function () { advancePhase(threadId, rec, 'resumed'); }, RESUME_MS);
    return rec;
  }

  /* ---- api --------------------------------------------------------------------------------- */

  var api = {
    bind: bind,
    related: related,
    readRange: readRange,
    request: request,
    awaitRequest: awaitRequest,
    respond: respond,
    resume: resume,
    spawn: spawn,
    branch: branch,
    rewind: rewind,
    createRestorePoint: createRestorePoint,
    restore: restore,
    redirect: redirect,
    REQUEST_STATUSES: REQUEST_STATUSES,
    REDIRECT_PHASES: REDIRECT_PHASES,
    MAX_DEPTH: MAX_DEPTH,
    MAX_FANOUT: MAX_FANOUT,
    MAX_RANGE: MAX_RANGE
  };

  global.PMXThreadOps = api;
})(window);
