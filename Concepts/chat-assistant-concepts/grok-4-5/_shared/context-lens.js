/* Context Lens selection + Mute / Focus / Subcompact ops. */
(function () {
  'use strict';

  var MAX_APPLY = 25;
  /* Catalog: cmd.chat.compact_context. Packet candidate cmd.chat.context.compact_now is alias/conflict. */
  var CMD_COMPACT_CONTEXT = 'cmd.chat.compact_context';
  /* Provisional mapping until store ships a dedicated remover. */
  var CMD_CONTEXT_SOURCE_REMOVE = 'cmd.chat.context.source.remove';

  function requireThread(store, threadId) {
    return store && store.threads && store.threads[threadId];
  }

  function truncateSelection(ids) {
    var list = Array.isArray(ids) ? ids.slice() : [];
    var note = null;
    if (list.length > MAX_APPLY) {
      list = list.slice(0, MAX_APPLY);
      note = 'Selection capped at ' + MAX_APPLY + ' messages for this apply.';
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
    var ids = Array.isArray(t.lens.selectionIds) ? t.lens.selectionIds.slice() : [];
    var idx = ids.indexOf(messageId);
    if (idx >= 0) ids.splice(idx, 1);
    else ids.push(messageId);
    var cut = truncateSelection(ids);
    store.setLens(threadId, { selectionIds: cut.ids });
    return { lens: store.threads[threadId].lens, note: cut.note };
  }

  function applyMute(store, threadId) {
    var t = requireThread(store, threadId);
    if (!t) return null;
    var cut = truncateSelection(t.lens.selectionIds);
    store.applyLensMuteFocus(threadId, 'mute', cut.ids);
    return { lens: store.threads[threadId].lens, note: cut.note };
  }

  function applyFocus(store, threadId) {
    var t = requireThread(store, threadId);
    if (!t) return null;
    var cut = truncateSelection(t.lens.selectionIds);
    store.applyLensMuteFocus(threadId, 'focus', cut.ids);
    return { lens: store.threads[threadId].lens, note: cut.note };
  }

  function applySubcompact(store, threadId, summary) {
    var t = requireThread(store, threadId);
    if (!t) return null;
    var cut = truncateSelection(t.lens.selectionIds);
    if (!cut.ids.length) return { entry: null, note: 'Select messages to subcompact.' };
    var entry = store.applyLensSubcompact(threadId, cut.ids, summary);
    return { entry: entry, note: cut.note };
  }

  function turnOff(store, threadId) {
    var t = requireThread(store, threadId);
    if (!t) return null;
    store.turnOffLens(threadId);
    return store.threads[threadId].lens;
  }

  function ensureAdmitted(store, threadId) {
    var t = requireThread(store, threadId);
    if (!t) return [];
    var lens = t.lens || {};
    if (Array.isArray(lens.admittedSources)) {
      return lens.admittedSources.slice();
    }
    var msgs = Array.isArray(t.messages) ? t.messages : [];
    var defaults = msgs.slice(-8).map(function (m) {
      return {
        id: m.id,
        kind: 'message',
        label: (m.role || 'msg') + ' · ' + String(m.body || '').replace(/\s+/g, ' ').slice(0, 48)
      };
    });
    store.setLens(threadId, { admittedSources: defaults });
    return defaults;
  }

  /**
   * Remove an admitted excerpt from Context Lens.
   * Provisional command: cmd.chat.context.source.remove
   * Never deletes history — only lens admission.
   */
  function removeAdmittedSource(store, threadId, sourceId) {
    var t = requireThread(store, threadId);
    if (!t || !sourceId) return null;
    var admitted = ensureAdmitted(store, threadId);
    var next = admitted.filter(function (s) {
      return s && s.id !== sourceId;
    });
    var leftOut = Array.isArray(t.lens.leftOutSources) ? t.lens.leftOutSources.slice() : [];
    var removed = admitted.filter(function (s) {
      return s && s.id === sourceId;
    })[0];
    if (removed) leftOut.unshift(removed);
    store.setLens(threadId, {
      admittedSources: next,
      leftOutSources: leftOut.slice(0, 24),
      lastCommand: CMD_CONTEXT_SOURCE_REMOVE
    });
    if (store.session) {
      store.session.lastContextCommand = {
        id: CMD_CONTEXT_SOURCE_REMOVE,
        threadId: threadId,
        sourceId: sourceId,
        at: new Date().toISOString()
      };
    }
    if (typeof store._emit === 'function') store._emit();
    return { removed: removed || null, admitted: next, command: CMD_CONTEXT_SOURCE_REMOVE };
  }

  /**
   * Compact Now — catalog cmd.chat.compact_context.
   * Visible op state on session.compactNow; history is retained.
   */
  function compactNow(store, threadId) {
    var t = requireThread(store, threadId);
    if (!t || !store.session) return null;
    var admitted = ensureAdmitted(store, threadId);
    store.session.compactNow = {
      status: 'running',
      progress: 0.35,
      command: CMD_COMPACT_CONTEXT,
      threadId: threadId
    };
    if (typeof store._emit === 'function') store._emit();

    var includedLabels = admitted.slice(0, 8).map(function (s) {
      return s.label || s.id;
    });
    if (!includedLabels.length) {
      includedLabels = ['Goal summary', 'Latest 8 turns', 'Open Todos', 'Active questionnaire receipt'];
    }
    var leftOutLabels = [
      'Raw tool dumps',
      'Older search pages',
      'Duplicate diffs',
      'Browser console noise'
    ];

    function finish() {
      store.session.compactNow = {
        status: 'done',
        progress: 1,
        command: CMD_COMPACT_CONTEXT,
        threadId: threadId,
        included: includedLabels,
        leftOut: leftOutLabels,
        historyRetained: true
      };
      store.setLens(threadId, {
        lastCommand: CMD_COMPACT_CONTEXT,
        admittedSources: admitted.slice(0, 8),
        leftOutSources: leftOutLabels.map(function (label, i) {
          return { id: 'left-' + i, kind: 'receipt', label: label };
        })
      });
      if (typeof store._emit === 'function') store._emit();
      return store.session.compactNow;
    }

    /* Synchronous completion path for callers that do not await timers. */
    store.session.compactNow._finish = finish;
    setTimeout(function () {
      if (store.session && store.session.compactNow && store.session.compactNow.status === 'running') {
        finish();
      }
    }, 480);
    return store.session.compactNow;
  }

  function admitPassage(store, threadId, messageId, snippet) {
    var t = requireThread(store, threadId);
    if (!t || !messageId) return null;
    var admitted = ensureAdmitted(store, threadId);
    var exists = admitted.some(function (s) {
      return s && s.id === messageId;
    });
    if (!exists) {
      var msg = (t.messages || []).filter(function (m) {
        return m.id === messageId;
      })[0];
      admitted.unshift({
        id: messageId,
        kind: 'passage',
        label:
          snippet ||
          ((msg && msg.role) || 'msg') +
            ' · ' +
            String((msg && msg.body) || '').replace(/\s+/g, ' ').slice(0, 48)
      });
    }
    store.setLens(threadId, { admittedSources: admitted.slice(0, 32) });
    return admitted;
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
    var compact = (store.session && store.session.compactNow) || {};
    var included = [];
    var leftOut = [];
    var includedMeta = [];

    if (Array.isArray(compact.included) && compact.status === 'done') {
      included = compact.included.slice();
      leftOut = Array.isArray(compact.leftOut) ? compact.leftOut.slice() : [];
    } else if (Array.isArray(lens.admittedSources) && lens.admittedSources.length) {
      includedMeta = lens.admittedSources.slice();
      included = includedMeta.map(function (s) {
        return s.label || s.id;
      });
      leftOut = (lens.leftOutSources || []).map(function (s) {
        return s.label || s.id;
      });
    } else {
      var ids = Array.isArray(lens.selectionIds) ? lens.selectionIds : [];
      var msgs = Array.isArray(t.messages) ? t.messages : [];
      var mode = lens.mode || 'mute';
      msgs.forEach(function (m) {
        if (!m) return;
        var label = (m.role || 'msg') + ' · ' + String(m.body || '').replace(/\s+/g, ' ').slice(0, 48);
        var selected = ids.indexOf(m.id) >= 0;
        if (mode === 'focus') {
          if (ids.length === 0) return;
          if (selected) {
            included.push(label);
            includedMeta.push({ id: m.id, label: label });
          } else leftOut.push(label);
        } else if (mode === 'mute') {
          if (selected) leftOut.push(label);
          else {
            included.push(label);
            includedMeta.push({ id: m.id, label: label });
          }
        } else if (selected) {
          included.push(label);
          includedMeta.push({ id: m.id, label: label });
        }
      });
      if (mode === 'mute' && !ids.length) {
        includedMeta = msgs.slice(-8).map(function (m) {
          return {
            id: m.id,
            label: (m.role || 'msg') + ' · ' + String(m.body || '').replace(/\s+/g, ' ').slice(0, 48)
          };
        });
        included = includedMeta.map(function (s) {
          return s.label;
        });
        leftOut = [];
      }
    }

    function listIncluded(arrMeta, arrLabels, empty) {
      if (arrMeta && arrMeta.length) {
        return (
          arrMeta
            .slice(0, 8)
            .map(function (s) {
              return (
                '<li class="pm-lens-source" data-lens-source-id="' +
                esc(s.id) +
                '">' +
                '<span class="pm-lens-source-label">' +
                esc(s.label || s.id) +
                '</span>' +
                '<button type="button" class="pm-btn pm-btn-ghost pm-lens-remove" data-lens-action="remove-source" data-source-id="' +
                esc(s.id) +
                '" title="Remove from context" aria-label="Remove from context">Remove</button>' +
                '</li>'
              );
            })
            .join('') || '<li>' + esc(empty) + '</li>'
        );
      }
      var bits = (arrLabels || [])
        .slice(0, 8)
        .map(function (x) {
          return '<li>' + esc(x) + '</li>';
        })
        .join('');
      return bits || '<li>' + esc(empty) + '</li>';
    }

    function listPlain(arr, empty) {
      var bits = (arr || [])
        .slice(0, 8)
        .map(function (x) {
          return '<li>' + esc(x) + '</li>';
        })
        .join('');
      return bits || '<li>' + esc(empty) + '</li>';
    }

    var compactStatus = compact.status || 'idle';
    var compactBlock =
      '<div class="pm-lens-compact" data-lens-compact data-status="' +
      esc(compactStatus) +
      '">' +
      '<button type="button" class="pm-btn pm-btn-secondary" data-lens-action="compact-now" title="Compact context (cmd.chat.compact_context)">' +
      (compactStatus === 'running' ? 'Compacting…' : 'Compact Now') +
      '</button>' +
      (compactStatus === 'done'
        ? '<div class="pm-lens-compact-receipt" data-lens-compact-receipt>' +
          '<span class="pm-lens-kicker">Compact receipt</span>' +
          '<span class="pm-muted">History retained · ' +
          esc(compact.command || CMD_COMPACT_CONTEXT) +
          '</span></div>'
        : '') +
      '</div>';

    return (
      '<div class="pm-lens-breakdown" data-lens-breakdown>' +
      compactBlock +
      '<div class="pm-lens-included"><span class="pm-lens-kicker">Included</span><ul>' +
      listIncluded(includedMeta, included, 'Default recent context') +
      '</ul></div>' +
      '<div class="pm-lens-leftout"><span class="pm-lens-kicker">Left out</span><ul>' +
      listPlain(leftOut, 'Nothing excluded yet') +
      '</ul></div></div>'
    );
  }

  window.PMChatLens = {
    MAX_APPLY: MAX_APPLY,
    CMD_COMPACT_CONTEXT: CMD_COMPACT_CONTEXT,
    CMD_CONTEXT_SOURCE_REMOVE: CMD_CONTEXT_SOURCE_REMOVE,
    enterSelection: enterSelection,
    toggleSelect: toggleSelect,
    applyMute: applyMute,
    applyFocus: applyFocus,
    applySubcompact: applySubcompact,
    turnOff: turnOff,
    removeAdmittedSource: removeAdmittedSource,
    compactNow: compactNow,
    admitPassage: admitPassage,
    ensureAdmitted: ensureAdmitted,
    breakdownHtml: breakdownHtml
  };
})();
