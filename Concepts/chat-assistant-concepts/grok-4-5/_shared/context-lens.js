/* Context Lens selection + Mute / Focus / Subcompact ops. */
(function () {
  'use strict';

  var MAX_APPLY = 25;

  function requireThread(store, threadId) {
    return store && store.threads && store.threads[threadId];
  }

  function truncateSelection(ids) {
    var list = Array.isArray(ids) ? ids.slice() : [];
    var note = null;
    if (list.length > MAX_APPLY) {
      note =
        'Selection truncated to ' +
        MAX_APPLY +
        ' messages (had ' +
        list.length +
        ').';
      list = list.slice(0, MAX_APPLY);
    }
    return { ids: list, note: note, truncated: !!note };
  }

  function enterSelection(store, threadId) {
    var t = requireThread(store, threadId);
    if (!t) return null;
    store.setLens(threadId, {
      mode: t.lens && t.lens.mode && t.lens.mode !== 'off' ? t.lens.mode : 'mute',
      selectionIds: (t.lens && t.lens.selectionIds) || []
    });
    return store.threads[threadId].lens;
  }

  function toggleSelect(store, threadId, messageId) {
    var t = requireThread(store, threadId);
    if (!t || !messageId) return null;
    var lens = t.lens || { selectionIds: [] };
    var ids = Array.isArray(lens.selectionIds) ? lens.selectionIds.slice() : [];
    var idx = ids.indexOf(messageId);
    if (idx === -1) ids.push(messageId);
    else ids.splice(idx, 1);
    var mode = lens.mode && lens.mode !== 'off' ? lens.mode : 'mute';
    store.setLens(threadId, { mode: mode, selectionIds: ids });
    return store.threads[threadId].lens;
  }

  function applyMute(store, threadId) {
    var t = requireThread(store, threadId);
    if (!t) return { ok: false };
    var cut = truncateSelection(t.lens && t.lens.selectionIds);
    store.applyLensMuteFocus(threadId, 'mute', cut.ids);
    return { ok: true, ids: cut.ids, note: cut.note, truncated: cut.truncated };
  }

  function applyFocus(store, threadId) {
    var t = requireThread(store, threadId);
    if (!t) return { ok: false };
    var cut = truncateSelection(t.lens && t.lens.selectionIds);
    store.applyLensMuteFocus(threadId, 'focus', cut.ids);
    return { ok: true, ids: cut.ids, note: cut.note, truncated: cut.truncated };
  }

  function applySubcompact(store, threadId, summary) {
    var t = requireThread(store, threadId);
    if (!t) return { ok: false };
    var cut = truncateSelection(t.lens && t.lens.selectionIds);
    if (!cut.ids.length) return { ok: false, reason: 'empty', note: cut.note };
    var entry = store.applyLensSubcompact(threadId, cut.ids, summary);
    return {
      ok: !!entry,
      entry: entry,
      ids: cut.ids,
      note: cut.note,
      truncated: cut.truncated
    };
  }

  function turnOff(store, threadId) {
    if (!requireThread(store, threadId)) return null;
    store.turnOffLens(threadId);
    return store.threads[threadId].lens;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function breakdownHtml(store, threadId) {
    var t = requireThread(store, threadId);
    if (!t) return '';
    var lens = t.lens || {};
    var ids = Array.isArray(lens.selectionIds) ? lens.selectionIds : [];
    var msgs = Array.isArray(t.messages) ? t.messages : [];
    var included = [];
    var leftOut = [];
    var mode = lens.mode || 'mute';

    msgs.forEach(function (m) {
      if (!m) return;
      var label = (m.role || 'msg') + ' · ' + String(m.body || '').replace(/\s+/g, ' ').slice(0, 48);
      var selected = ids.indexOf(m.id) >= 0;
      if (mode === 'focus') {
        if (ids.length === 0) return;
        if (selected) included.push(label);
        else leftOut.push(label);
      } else if (mode === 'mute') {
        if (selected) leftOut.push(label);
        else included.push(label);
      } else {
        if (selected) included.push(label);
      }
    });

    if (mode === 'mute' && !ids.length) {
      included = msgs.slice(-8).map(function (m) {
        return (m.role || 'msg') + ' · ' + String(m.body || '').replace(/\s+/g, ' ').slice(0, 48);
      });
      leftOut = [];
    }

    function list(arr, empty) {
      var bits = (arr || [])
        .slice(0, 8)
        .map(function (x) {
          return '<li>' + esc(x) + '</li>';
        })
        .join('');
      return bits || '<li>' + esc(empty) + '</li>';
    }

    return (
      '<div class="pm-lens-breakdown" data-lens-breakdown>' +
      '<div class="pm-lens-included"><span class="pm-lens-kicker">Included</span><ul>' +
      list(included, 'Default recent context') +
      '</ul></div>' +
      '<div class="pm-lens-leftout"><span class="pm-lens-kicker">Left out</span><ul>' +
      list(leftOut, 'Nothing excluded yet') +
      '</ul></div></div>'
    );
  }

  window.PMChatLens = {
    MAX_APPLY: MAX_APPLY,
    enterSelection: enterSelection,
    toggleSelect: toggleSelect,
    applyMute: applyMute,
    applyFocus: applyFocus,
    applySubcompact: applySubcompact,
    turnOff: turnOff,
    breakdownHtml: breakdownHtml
  };
})();
