/* PMX Context Lens — Opus 5
 *
 * Mute, Focus, Subcompact, Turn Off. Mute and Focus apply immediately as the selection
 * changes; Subcompact requires an explicit Apply. Turn Off exits selection mode.
 *
 * The 25-message limit is PER APPLY OPERATION, not a thread-wide total. Multiple operations
 * accumulate, which is why `applied` is a list of operations rather than one flat set.
 *
 * Lens state is thread-local view shaping, never Assistant memory. It lives in the store so
 * it survives a docked/pop-out remount, and each thread keeps its own.
 */
(function (global) {
  'use strict';

  var MAX_PER_APPLY = 25;
  var store = null;

  function bind(s) { store = s; }
  /* Alias matching shared/questionnaire.js's wiring precedent, for callers that look for
   * attach(store, data) rather than bind(store). Lens has no canonical-data dependency, so
   * the second argument is accepted and ignored. */
  function attach(s) { bind(s); }

  function slice(threadId) {
    if (!store) return { mode: 'off', selection: [], applied: [] };
    var v = store.view(threadId);
    if (!v.lens) v.lens = { mode: 'off', selection: [], applied: [] };
    if (!v.lens.selection) v.lens.selection = [];
    if (!v.lens.applied) v.lens.applied = [];
    return v.lens;
  }

  function mode(threadId) { return slice(threadId).mode; }

  function setMode(threadId, m) {
    var l = slice(threadId);
    var prevMode = l.mode;
    l.mode = m;
    if (m === 'off') {
      l.selection = [];
    } else if (m !== prevMode) {
      /* A fresh mode never inherits a leftover selection from a DIFFERENT mode - that would
       * immediately mute/focus messages the user never selected under this mode. Re-entering
       * a mode that already has a live immediate operation (mute/focus) recovers that
       * operation's ids instead, so the user can keep adjusting what is already applied. */
      var existing = null;
      for (var i = 0; i < l.applied.length; i++) {
        if (l.applied[i].mode === m) { existing = l.applied[i]; break; }
      }
      l.selection = (existing && (m === 'mute' || m === 'focus')) ? existing.ids.slice() : [];
    }
    /* Mute and Focus take effect the moment the selection changes, so switching into one of
     * those modes with a (recovered) live selection re-applies it immediately. */
    if ((m === 'mute' || m === 'focus') && l.selection.length) applyImmediate(threadId, m);
    if (store) store.touchView('lens');
  }

  function toggleSelect(threadId, msgId) {
    var l = slice(threadId);
    var i = l.selection.indexOf(msgId);
    if (i >= 0) l.selection.splice(i, 1);
    else l.selection.push(msgId);
    if (l.mode === 'mute' || l.mode === 'focus') applyImmediate(threadId, l.mode);
    if (store) store.touchView('lens');
  }

  function selection(threadId) { return slice(threadId).selection.slice(); }

  function clear(threadId) {
    var l = slice(threadId);
    l.selection = [];
    if (store) store.touchView('lens');
  }

  function applyImmediate(threadId, m) {
    var l = slice(threadId);
    /* Immediate modes replace their own previous immediate operation rather than stacking,
     * so toggling a message off actually un-mutes it. */
    l.applied = l.applied.filter(function (op) { return op.mode !== m; });
    if (l.selection.length) {
      l.applied.push({ mode: m, ids: l.selection.slice(), at: Date.now() });
    }
  }

  function remainingBudget(threadId) {
    return Math.max(0, MAX_PER_APPLY - slice(threadId).selection.length);
  }

  /* Subcompact is the only mode that needs an explicit Apply, and the only one bounded
   * per operation. Over-selection is refused rather than silently truncated. */
  function apply(threadId) {
    var l = slice(threadId);
    if (l.mode !== 'subcompact') return { ok: false, reason: 'Subcompact is the only mode that needs Apply' };
    if (!l.selection.length) return { ok: false, reason: 'Nothing is selected' };
    if (l.selection.length > MAX_PER_APPLY) {
      return { ok: false, reason: 'One operation covers up to ' + MAX_PER_APPLY + ' messages', over: l.selection.length - MAX_PER_APPLY };
    }
    l.applied.push({
      mode: 'subcompact',
      ids: l.selection.slice(),
      at: Date.now(),
      summary: 'Summary of ' + l.selection.length + ' earlier messages'
    });
    l.selection = [];
    if (store) store.touchView('lens');
    return { ok: true };
  }

  /* A subcompact operation can be rehydrated - expanded back to its original messages for
   * inspection - without losing the fact that it is still, structurally, a subcompacted
   * range. stateOf() reports 'subcompacted' while collapsed to a summary and 'source' once
   * rehydrated, so a message id maps to exactly one of the four documented states. */
  function rehydrate(threadId, opId, on) {
    var l = slice(threadId);
    for (var i = 0; i < l.applied.length; i++) {
      if (l.applied[i].mode === 'subcompact' && l.applied[i].at === opId) {
        l.applied[i].rehydrated = !!on;
        if (store) store.touchView('lens');
        return true;
      }
    }
    return false;
  }

  function stateOf(threadId, msgId) {
    var l = slice(threadId);
    for (var i = l.applied.length - 1; i >= 0; i--) {
      var op = l.applied[i];
      if (op.ids.indexOf(msgId) === -1) continue;
      if (op.mode === 'subcompact') return op.rehydrated ? 'source' : 'subcompacted';
      return op.mode === 'mute' ? 'muted' : 'focused';
    }
    return null;
  }

  function isSelected(threadId, msgId) {
    return slice(threadId).selection.indexOf(msgId) >= 0;
  }

  /* The AGENT-side view. Deliberately different from what a human search sees: human search
   * always reads canonical stored history, this does not. */
  function effectiveHistory(threadId) {
    var data = global.PMXData.get();
    if (!data) return [];
    var msgs = data.messagesFor(threadId) || [];
    var l = slice(threadId);
    var out = [];
    var consumed = {};

    l.applied.forEach(function (op) {
      if (op.mode !== 'subcompact') return;
      op.ids.forEach(function (id) { consumed[id] = op; });
    });

    var emittedSummaries = {};
    for (var i = 0; i < msgs.length; i++) {
      var m = msgs[i];
      var st = stateOf(threadId, m.id);
      if (st === 'muted') continue;                     /* excluded entirely */
      if (st === 'subcompacted') {
        var op = consumed[m.id];
        var key = op.at + ':' + op.ids.length;
        if (emittedSummaries[key]) continue;
        emittedSummaries[key] = true;
        /* Replaced by a local summary that keeps rehydration handles back to canonical
         * source ids, so detail can be recovered without re-reading the whole range. */
        out.push({
          id: 'summary-' + op.at,
          role: 'system',
          body: op.summary,
          summaryOf: op.ids.slice(),
          rehydrate: op.ids.slice()
        });
        continue;
      }
      /* st === 'source': this operation was explicitly rehydrated, so the original message
       * reappears in full rather than the summary - still tagged so a renderer can show it
       * came back from a subcompacted range. */
      out.push({
        id: m.id, role: m.role, body: m.body,
        priority: st === 'focused' ? 'high' : 'normal',
        rehydratedFrom: st === 'source' ? (consumed[m.id] && consumed[m.id].at) : null
      });
    }

    out.sort(function (a, b) {
      return (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0);
    });
    return out;
  }

  global.PMXLens = {
    bind: bind,
    attach: attach,
    mode: mode,
    setMode: setMode,
    toggleSelect: toggleSelect,
    selection: selection,
    isSelected: isSelected,
    clear: clear,
    apply: apply,
    stateOf: stateOf,
    rehydrate: rehydrate,
    effectiveHistory: effectiveHistory,
    remainingBudget: remainingBudget,
    MAX_PER_APPLY: MAX_PER_APPLY
  };
})(window);
