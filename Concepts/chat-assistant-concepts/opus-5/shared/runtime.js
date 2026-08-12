/* PMX runtime — Opus 5, the fake send engine.
 *
 * It never interprets the user's text. The typed message is appended exactly as entered, a
 * prewritten working sequence plays, and the thread's next assigned scripted reply is
 * inserted. Stop interrupts the sequence and records a stopped result instead.
 *
 * The composer button is ONE control with two states. Pressing Send while an agent is
 * working sends new text through steering; it is never interpreted as Stop.
 */
(function (global) {
  'use strict';

  var TICK_MS = 250;

  var store = null;
  var runs = {};          /* threadId -> run */
  var tickSubs = [];
  var timer = null;

  function bind(s) { store = s; }
  function data() { return global.PMXData.get(); }
  function nowIso() { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); }

  /* One shared interval for every thread, never one per thread. */
  function ensureTimer() {
    if (timer) return;
    timer = global.setInterval(function () {
      var any = false;
      for (var tid in runs) { if (runs[tid]) { any = true; advance(tid); } }
      var subs = tickSubs.slice();
      for (var i = 0; i < subs.length; i++) { try { subs[i](); } catch (e) {} }
      if (!any) { global.clearInterval(timer); timer = null; }
    }, TICK_MS);
  }

  function onTick(fn) {
    tickSubs.push(fn);
    return function () { var i = tickSubs.indexOf(fn); if (i >= 0) tickSubs.splice(i, 1); };
  }

  function isActive(threadId) { return !!runs[threadId]; }

  function liveStatus(threadId) {
    var run = runs[threadId];
    if (!run) return null;
    return {
      text: run.steps[run.stepIndex] || run.steps[run.steps.length - 1] || 'Working',
      workedSeconds: Math.max(0, Math.round((Date.now() - run.startedAt) / 1000)),
      stepIndex: run.stepIndex,
      stepCount: run.steps.length
    };
  }

  /* The whole state machine, in one place, so no caller can reinvent it differently. */
  function composerButtonState(threadId, draftText) {
    var active = isActive(threadId);
    if (!active) return 'send';
    var typed = !!(draftText && String(draftText).trim().length);
    return typed ? 'send' : 'stop';
  }

  function appendMessage(threadId, msg) {
    var t = data() && data().threadById(threadId);
    if (!t) return null;
    t.messages.push(msg);
    t.storedCount = t.messages.length;
    t.lastActivityAt = msg.sentAt;
    return msg;
  }

  function runtimeBlockFrom(reply, role) {
    var r = (reply && reply.runtime) || {};
    return {
      provider: r.provider || 'Anthropic',
      model: r.model || 'Opus 5',
      persona: r.persona || 'Product designer',
      mode: r.mode || 'Agent',
      effort: r.effort || 'High',
      workedSeconds: r.workedSeconds != null ? r.workedSeconds : 6,
      totalElapsedSeconds: r.totalElapsedSeconds != null ? r.totalElapsedSeconds : (r.workedSeconds || 6),
      tokenCount: r.tokenCount || 1200,
      contextUsed: r.contextUsed || 8000,
      contextLimit: r.contextLimit || 128000,
      estimatedCost: r.estimatedCost != null ? r.estimatedCost : 0.01,
      startedAt: nowIso(),
      describesTurn: role === 'user' ? 'launched' : undefined
    };
  }

  function send(threadId, text) {
    var d = data();
    if (!d) return null;
    var t = d.threadById(threadId);
    if (!t) return null;

    var cursor = t.scriptedReplyCursor || 0;
    var reply = d.scriptedReply(threadId, cursor);

    var userMsg = {
      id: 't-live-' + Date.now() + '-u',
      role: 'user',
      /* Appended exactly as entered. No trimming, no interpretation. */
      body: String(text),
      sentAt: nowIso(),
      runtime: runtimeBlockFrom(reply, 'user'),
      eligibleForEdit: true,
      collapsedByDefault: false
    };
    appendMessage(threadId, userMsg);

    /* Only the newest user message stays editable. */
    for (var i = t.messages.length - 2; i >= 0; i--) {
      if (t.messages[i].role === 'user') { t.messages[i].eligibleForEdit = false; break; }
    }

    if (!reply) { if (store) store.touchView('messages'); return userMsg; }

    var steps = (reply.workingSummarySequence || ['Working']).slice();
    var durations = (reply.stepDurationsMs || []).slice();

    runs[threadId] = {
      replyId: reply.id,
      steps: steps,
      durations: durations,
      stepIndex: 0,
      stepStartedAt: Date.now(),
      startedAt: Date.now(),
      stopped: false,
      /* A live run IS observable work, so it registers with ObservableWork rather than being a
       * private timer nobody else can see. This is what makes an indefinite status animation
       * legal: the spinner on a working thread carries `data-pmx-op` set to this id, and the
       * motion contract can prove a real operation backs it. Without the op the same spinner is
       * an unfalsifiable claim that something is happening. */
      opId: 'run-' + threadId
    };
    startRunOp(threadId, steps);
    ensureTimer();
    if (store) store.touchView('messages');
    return userMsg;
  }

  /* One op per live run. `determinate` because a scripted reply knows its own step count, which
   * lets a renderer show real progress instead of an indefinite pulse wherever it has room. */
  function startRunOp(threadId, steps) {
    var obs = global.PMXObservable;
    if (!obs || !obs.start) return null;
    return obs.start({
      id: 'run-' + threadId,
      kind: 'run',
      label: steps && steps.length ? steps[0] : 'Working',
      determinate: !!(steps && steps.length),
      total: steps ? steps.length : 0
    });
  }

  function stepRunOp(threadId, index, label) {
    var obs = global.PMXObservable;
    if (obs && obs.step) obs.step('run-' + threadId, index, label);
  }

  function endRunOp(threadId, receipt, failed) {
    var obs = global.PMXObservable;
    if (!obs) return;
    if (failed) { if (obs.cancel) obs.cancel('run-' + threadId); return; }
    if (obs.finish) obs.finish('run-' + threadId, receipt || null);
  }

  function advance(threadId) {
    var run = runs[threadId];
    if (!run) return;
    var dur = run.durations[run.stepIndex] != null ? run.durations[run.stepIndex] : 700;
    if (Date.now() - run.stepStartedAt < dur) return;

    run.stepIndex += 1;
    run.stepStartedAt = Date.now();
    if (run.stepIndex < run.steps.length) return;

    finish(threadId);
  }

  function finish(threadId) {
    var run = runs[threadId];
    if (!run) return;
    var d = data();
    var t = d && d.threadById(threadId);
    var reply = null;
    if (d) {
      var all = d.scriptedReplies || [];
      for (var i = 0; i < all.length; i++) if (all[i].id === run.replyId) { reply = all[i]; break; }
    }
    var worked = Math.max(1, Math.round((Date.now() - run.startedAt) / 1000));

    if (reply) {
      var rt = runtimeBlockFrom(reply, 'assistant');
      rt.workedSeconds = worked;
      rt.totalElapsedSeconds = worked;
      rt.terminalAt = nowIso();
      rt.terminalReason = 'completed';
      appendMessage(threadId, {
        id: 't-live-' + Date.now() + '-a',
        role: 'assistant',
        body: reply.body,
        sentAt: nowIso(),
        runtime: rt,
        eligibleForEdit: false,
        collapsedByDefault: false
      });
    }
    if (t) t.scriptedReplyCursor = (t.scriptedReplyCursor || 0) + 1;

    /* The op finishes with a receipt, so the worked duration survives the run that produced it —
     * a completed operation with no receipt leaves nothing durable behind. */
    endRunOp(threadId, { workedSeconds: worked, line: 'Worked for ' + worked + 's' }, false);

    runs[threadId] = null;
    delete runs[threadId];
    if (store) store.touchView('messages');
  }

  /* Stop ends the sequence, records a stopped result, keeps the accumulated worked time,
   * and does NOT insert the prewritten completed response for that attempt. */
  function stop(threadId) {
    var run = runs[threadId];
    if (!run) return false;
    /* Cancelled, not completed: the user stopped it, and a receipt that said "complete" would be
     * the same lie the old artifact trigger told. */
    endRunOp(threadId, null, true);
    var d = data();
    var t = d && d.threadById(threadId);
    var reply = null;
    if (d) {
      var all = d.scriptedReplies || [];
      for (var i = 0; i < all.length; i++) if (all[i].id === run.replyId) { reply = all[i]; break; }
    }
    var worked = Math.max(1, Math.round((Date.now() - run.startedAt) / 1000));

    var rt = runtimeBlockFrom(reply, 'assistant');
    rt.workedSeconds = worked;
    rt.totalElapsedSeconds = worked;
    rt.terminalAt = nowIso();
    rt.terminalReason = 'stopped';

    appendMessage(threadId, {
      id: 't-live-' + Date.now() + '-s',
      role: 'assistant',
      body: (reply && reply.stopResultBody) || 'The response was stopped before it completed.',
      sentAt: nowIso(),
      runtime: rt,
      eligibleForEdit: false,
      collapsedByDefault: false,
      stopped: true
    });

    if (t) t.scriptedReplyCursor = (t.scriptedReplyCursor || 0) + 1;
    runs[threadId] = null;
    delete runs[threadId];
    if (store) store.touchView('messages');
    return true;
  }

  function reset() {
    for (var tid in runs) delete runs[tid];
    if (timer) { global.clearInterval(timer); timer = null; }
  }

  global.PMXRuntime = {
    bind: bind,
    send: send,
    stop: stop,
    isActive: isActive,
    liveStatus: liveStatus,
    composerButtonState: composerButtonState,
    onTick: onTick,
    reset: reset,
    TICK_MS: TICK_MS
  };
})(window);
