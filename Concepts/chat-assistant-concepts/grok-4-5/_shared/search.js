/* Shared chat search helpers over ChatSemanticStore. */
(function () {
  'use strict';

  var HIGHLIGHT_MS = 2400;

  function run(store, query, scope) {
    var q = query == null ? '' : String(query);
    var sc = scope === 'all' ? 'all' : 'current';
    var results = store.searchMessages({ query: q, scope: sc });
    var selected = null;
    if (results.length) {
      selected = results[0].threadId + ':' + results[0].messageId;
    }
    /* Stash results on the live search object before emit (same ref). */
    if (store.search) store.search.results = results;
    store.setSearch({
      query: q,
      scope: sc,
      open: true,
      selectedResultId: selected
    });
    if (store.search) store.search.results = results;
    return results;
  }

  function jumpTo(store, threadId, messageId) {
    if (!store || !threadId || !messageId) return null;
    if (store.selectThread) store.selectThread(threadId);
    if (store.ensureMessageVisible) store.ensureMessageVisible(threadId, messageId);
    if (store.setSearch) {
      store.setSearch({
        selectedResultId: threadId + ':' + messageId,
        open: true
      });
    }
    var t = store.threads && store.threads[threadId];
    var msgs = t && Array.isArray(t.messages) ? t.messages : [];
    var hit = msgs.filter(function (m) {
      return m.id === messageId;
    })[0];
    return hit || { threadId: threadId, messageId: messageId };
  }

  function openConversation(store, threadId, messageId) {
    return jumpTo(store, threadId, messageId);
  }

  /** Only selected passages enter Lens — explicit admit. */
  function addPassageToContext(store, threadId, messageId, snippet) {
    if (!store || !threadId || !messageId) return null;
    if (window.PMChatLens && typeof window.PMChatLens.admitPassage === 'function') {
      return window.PMChatLens.admitPassage(store, threadId, messageId, snippet);
    }
    var t = store.threads && store.threads[threadId];
    if (!t || !store.setLens) return null;
    var admitted = Array.isArray(t.lens.admittedSources) ? t.lens.admittedSources.slice() : [];
    if (
      !admitted.some(function (s) {
        return s && s.id === messageId;
      })
    ) {
      admitted.unshift({
        id: messageId,
        kind: 'passage',
        label: snippet || messageId
      });
    }
    store.setLens(threadId, { admittedSources: admitted.slice(0, 32) });
    return admitted;
  }

  function branchFromPoint(store, threadId, messageId, opts) {
    if (!store || !threadId) return null;
    opts = opts || {};
    if (typeof store.branchThread === 'function') {
      return store.branchThread(threadId, {
        fromMessageId: messageId,
        modelId: opts.modelId,
        personaId: opts.personaId,
        label: opts.label || 'Branch from search'
      });
    }
    return null;
  }

  function copyLink(threadId, messageId) {
    var href =
      '#thread=' +
      encodeURIComponent(threadId || '') +
      '&message=' +
      encodeURIComponent(messageId || '');
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(href).catch(function () {});
    }
    return href;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function icon(name, cls) {
    if (typeof window.PMIcon === 'function') return window.PMIcon(name, cls || '');
    return '<span class="' + escapeHtml(cls || '') + '" data-icon="' + escapeHtml(name) + '"></span>';
  }

  function threadTitle(store, threadId) {
    var t = store && store.threads && store.threads[threadId];
    if (t && t.title) return String(t.title);
    return 'Conversation';
  }

  function lensBadgesForMessage(store, threadId, messageId) {
    var t = store && store.threads && store.threads[threadId];
    var lens = t && t.lens;
    if (!lens) return '';
    var badges = [];
    if (Array.isArray(lens.mutedIds) && lens.mutedIds.indexOf(messageId) >= 0) {
      badges.push('<span class="pm-search-lens-badge is-muted">Muted</span>');
    }
    if (Array.isArray(lens.focusedIds) && lens.focusedIds.indexOf(messageId) >= 0) {
      badges.push('<span class="pm-search-lens-badge is-focused">Focused</span>');
    }
    var subs = Array.isArray(lens.subcompacts) ? lens.subcompacts : [];
    for (var i = 0; i < subs.length; i++) {
      var src = subs[i] && subs[i].sourceIds;
      if (Array.isArray(src) && src.indexOf(messageId) >= 0) {
        badges.push('<span class="pm-search-lens-badge is-subcompact">Subcompacted</span>');
        break;
      }
    }
    if (Array.isArray(lens.admittedSources)) {
      for (var a = 0; a < lens.admittedSources.length; a++) {
        if (lens.admittedSources[a] && lens.admittedSources[a].id === messageId) {
          badges.push('<span class="pm-search-lens-badge is-admitted">In context</span>');
          break;
        }
      }
    }
    return badges.length ? '<span class="pm-search-lens-badges">' + badges.join('') + '</span>' : '';
  }

  function groupByThread(results) {
    var order = [];
    var map = {};
    (Array.isArray(results) ? results : []).forEach(function (r) {
      if (!r || !r.threadId) return;
      if (!map[r.threadId]) {
        map[r.threadId] = [];
        order.push(r.threadId);
      }
      map[r.threadId].push(r);
    });
    return order.map(function (tid) {
      return { threadId: tid, results: map[tid] };
    });
  }

  function resultActionsHtml(r) {
    var tid = escapeHtml(r.threadId);
    var mid = escapeHtml(r.messageId);
    return (
      '<div class="pm-search-result-actions" role="group" aria-label="Result actions">' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-search-action" data-search-action="open" data-thread-id="' +
      tid +
      '" data-message-id="' +
      mid +
      '">Open conversation</button>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-search-action" data-search-action="admit" data-thread-id="' +
      tid +
      '" data-message-id="' +
      mid +
      '" title="Add only this passage to Context Lens">Add passage to context</button>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-search-action" data-search-action="branch" data-thread-id="' +
      tid +
      '" data-message-id="' +
      mid +
      '">Branch from this point</button>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-search-action" data-search-action="copy-link" data-thread-id="' +
      tid +
      '" data-message-id="' +
      mid +
      '">Copy link</button>' +
      '</div>'
    );
  }

  /**
   * Results popup HTML. Scope controls live at the TOP of the panel.
   * Titles come from store.threads[id].title — never raw thread ids.
   */
  function renderResultsHtml(results, store, opts) {
    opts = opts || {};
    var list = Array.isArray(results) ? results : [];
    var scope = opts.scope === 'all' ? 'all' : 'current';
    var selectedId = opts.selectedResultId || (store && store.search && store.search.selectedResultId) || '';
    var query = opts.query != null ? opts.query : (store && store.search && store.search.query) || '';

    var scopes =
      '<div class="pm-search-scopes" role="tablist" aria-label="Search scope">' +
      '<button type="button" class="pm-search-scope' +
      (scope === 'current' ? ' is-active' : '') +
      '" role="tab" aria-selected="' +
      (scope === 'current' ? 'true' : 'false') +
      '" data-search-scope="current" title="Current thread">' +
      icon('scopeCurrent', 'pm-btn-icon') +
      '<span>Current thread</span></button>' +
      '<button type="button" class="pm-search-scope' +
      (scope === 'all' ? ' is-active' : '') +
      '" role="tab" aria-selected="' +
      (scope === 'all' ? 'true' : 'false') +
      '" data-search-scope="all" title="All threads">' +
      icon('scopeAll', 'pm-btn-icon') +
      '<span>All threads</span></button>' +
      '</div>';

    var head =
      '<div class="pm-search-panel-head">' +
      '<span class="pm-search-panel-title">Search</span>' +
      (query
        ? '<span class="pm-search-panel-query">' + escapeHtml(query) + '</span>'
        : '') +
      '<button type="button" class="pm-search-close" data-search-close aria-label="Close search">' +
      icon('x', 'pm-btn-icon') +
      '</button>' +
      '</div>';

    var body;
    if (!String(query || '').trim()) {
      body =
        '<div class="pm-search-empty">Type a query, then press Enter — or pick a scope above.</div>';
    } else if (!list.length) {
      body =
        '<div class="pm-search-empty">' +
        (scope === 'all' ? 'No matches across all threads.' : 'No matches in this thread.') +
        '</div>';
    } else {
      var groups = groupByThread(list);
      body =
        '<div class="pm-search-results pm-scroll" role="listbox">' +
        groups
          .map(function (g) {
            var title = threadTitle(store, g.threadId);
            return (
              '<section class="pm-search-group" data-thread-id="' +
              escapeHtml(g.threadId) +
              '">' +
              '<div class="pm-search-group-head">' +
              '<span class="pm-search-group-title">' +
              escapeHtml(title) +
              '</span>' +
              '<span class="pm-search-group-count">' +
              g.results.length +
              '</span>' +
              '</div>' +
              '<ul class="pm-search-group-list">' +
              g.results
                .map(function (r) {
                  var rid = r.threadId + ':' + r.messageId;
                  var sel = rid === selectedId;
                  return (
                    '<li class="pm-search-result' +
                    (sel ? ' is-selected' : '') +
                    '" role="option" aria-selected="' +
                    (sel ? 'true' : 'false') +
                    '" data-thread-id="' +
                    escapeHtml(r.threadId) +
                    '" data-message-id="' +
                    escapeHtml(r.messageId) +
                    '">' +
                    '<span class="pm-search-result-snippet">' +
                    escapeHtml(r.snippet || '') +
                    '</span>' +
                    lensBadgesForMessage(store, r.threadId, r.messageId) +
                    resultActionsHtml(r) +
                    '</li>'
                  );
                })
                .join('') +
              '</ul>' +
              '</section>'
            );
          })
          .join('') +
        '</div>';
    }

    return head + scopes + body;
  }

  /** Delegate search-action clicks; returns true if handled. */
  function handleAction(store, action, threadId, messageId, snippet, toast) {
    if (!action) return false;
    if (action === 'open') {
      openConversation(store, threadId, messageId);
      if (toast) toast('Opened conversation');
      return true;
    }
    if (action === 'admit') {
      addPassageToContext(store, threadId, messageId, snippet);
      if (toast) toast('Passage added to Context Lens');
      return true;
    }
    if (action === 'branch') {
      var nid = branchFromPoint(store, threadId, messageId);
      if (toast) toast(nid ? 'Branched · ' + nid : 'Branch unavailable');
      return true;
    }
    if (action === 'copy-link') {
      copyLink(threadId, messageId);
      if (toast) toast('Link copied');
      return true;
    }
    return false;
  }

  window.PMChatSearch = {
    run: run,
    jumpTo: jumpTo,
    openConversation: openConversation,
    addPassageToContext: addPassageToContext,
    branchFromPoint: branchFromPoint,
    copyLink: copyLink,
    handleAction: handleAction,
    renderResultsHtml: renderResultsHtml,
    groupByThread: groupByThread,
    threadTitle: threadTitle,
    HIGHLIGHT_MS: HIGHLIGHT_MS
  };
})();
