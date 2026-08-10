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
      selectedResultId: selected
    });
    if (store.search) store.search.results = results;
    return results;
  }

  function jumpTo(store, threadId, messageId) {
    if (!store || !threadId || !messageId) return false;
    if (store.session && store.session.activeThreadKey !== threadId) {
      store.selectThread(threadId);
    }
    store.ensureMessageVisible(threadId, messageId);
    /* §14 — reveal collapsed / hidden match portion */
    var t = store.threads && store.threads[threadId];
    var msg =
      t && Array.isArray(t.messages)
        ? t.messages.filter(function (m) {
            return m && m.id === messageId;
          })[0]
        : null;
    if (msg && msg.collapsedByDefault && store.toggleMessageExpanded) {
      var ui = store.uiByThread && store.uiByThread[threadId];
      var already = ui && ui.expandedMessageIds && ui.expandedMessageIds[messageId];
      if (!already) store.toggleMessageExpanded(threadId, messageId);
    }
    var until = Date.now() + HIGHLIGHT_MS;
    store.setSearch({
      focusedTargetMessageId: messageId,
      selectedResultId: threadId + ':' + messageId,
      highlightUntil: until
    });
    store.setScrollAnchor(threadId, { messageId: messageId, offsetPx: 0 });
    return true;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function icon(name, cls) {
    if (typeof window.PMIcon === 'function') return window.PMIcon(name, cls || '') || '';
    return '';
  }

  function threadTitle(store, threadId) {
    var t =
      store && store.threads && threadId ? store.threads[threadId] : null;
    var title = t && t.title != null ? String(t.title).trim() : '';
    return title || 'Untitled chat';
  }

  function lensBadgesForMessage(store, threadId, messageId) {
    var t = store && store.threads && store.threads[threadId];
    var lens = t && t.lens;
    if (!lens || !messageId) return '';
    var badges = [];
    if (Array.isArray(lens.mutedIds) && lens.mutedIds.indexOf(messageId) >= 0) {
      badges.push('<span class="pm-search-lens-badge is-muted">Muted</span>');
    }
    if (Array.isArray(lens.focusedIds) && lens.focusedIds.indexOf(messageId) >= 0) {
      badges.push('<span class="pm-search-lens-badge is-focused">Focused</span>');
    }
    var subs = Array.isArray(lens.subcompacts) ? lens.subcompacts : [];
    for (var i = 0; i < subs.length; i++) {
      var src = (subs[i] && subs[i].sourceIds) || [];
      if (src.indexOf(messageId) >= 0) {
        badges.push('<span class="pm-search-lens-badge is-subcompact">Subcompacted</span>');
        break;
      }
    }
    return badges.length
      ? '<span class="pm-search-lens-badges">' + badges.join('') + '</span>'
      : '';
  }

  function groupByThread(results) {
    var order = [];
    var map = Object.create(null);
    (Array.isArray(results) ? results : []).forEach(function (r) {
      var tid = r.threadId;
      if (!map[tid]) {
        map[tid] = [];
        order.push(tid);
      }
      map[tid].push(r);
    });
    return order.map(function (tid) {
      return { threadId: tid, results: map[tid] };
    });
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

  window.PMChatSearch = {
    run: run,
    jumpTo: jumpTo,
    renderResultsHtml: renderResultsHtml,
    groupByThread: groupByThread,
    threadTitle: threadTitle
  };
})();
