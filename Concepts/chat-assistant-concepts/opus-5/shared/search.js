/* PMX search — Opus 5
 *
 * There is exactly ONE Assistant Chat search bar. There is no second Context Lens search.
 *
 * Human-facing search operates on CANONICAL stored history regardless of Lens shaping, so
 * muted, focused, and subcompacted-source messages all remain findable. Results may disclose
 * that state, but selecting one never changes it. A hit inside a subcompacted range resolves
 * to canonical source history, and a summary is never returned as a competing duplicate of
 * the messages it summarises.
 *
 * The index is built over every stored message, including messages that are collapsed by
 * default and messages in unloaded older history. One thread stores 700 messages and renders
 * 50, so indexing the DOM would silently miss most of the corpus.
 */
(function (global) {
  'use strict';

  var MAX_RESULTS = 200;
  var SNIPPET_PAD = 46;

  var entries = [];
  var built = false;
  var store = null;

  function bind(s) { store = s; }
  /* Alias matching shared/questionnaire.js's attach(store, data) wiring precedent. Search
   * builds its index from an explicit index(data) call instead, so the second argument is
   * accepted and ignored here. */
  function attach(s) { bind(s); }

  function index(data) {
    entries = [];
    if (!data || !data.threads) { built = false; return 0; }
    for (var i = 0; i < data.threads.length; i++) {
      var t = data.threads[i];
      var msgs = t.messages || [];
      var visibleFrom = Math.max(0, msgs.length - (t.initialVisibleMessageCount || 50));
      for (var j = 0; j < msgs.length; j++) {
        var m = msgs[j];
        entries.push({
          threadId: t.id,
          threadTitle: t.title,
          messageId: m.id,
          role: m.role,
          sentAt: m.sentAt,
          body: m.body || '',
          lower: (m.body || '').toLowerCase(),
          collapsedByDefault: !!m.collapsedByDefault,
          /* Recorded at index time so a result can say the target is not currently
           * rendered and the renderer knows it must load a range before jumping. */
          unloaded: j < visibleFrom
        });
      }
    }
    built = true;
    return entries.length;
  }

  function snippetFor(e, at, needleLen) {
    var start = Math.max(0, at - SNIPPET_PAD);
    var end = Math.min(e.body.length, at + needleLen + SNIPPET_PAD);
    var s = e.body.slice(start, end).replace(/\s+/g, ' ');
    if (start > 0) s = '…' + s;
    if (end < e.body.length) s = s + '…';
    return {
      text: s,
      matchStart: (start > 0 ? 1 : 0) + (at - start),
      matchEnd: (start > 0 ? 1 : 0) + (at - start) + needleLen
    };
  }

  function query(text, opts) {
    opts = opts || {};
    var scope = opts.scope || 'current';
    var threadId = opts.threadId || (store ? store.get('session.activeThreadId') : null);
    var needle = String(text || '').trim().toLowerCase();
    if (!built || needle.length < 2) return [];

    var lens = global.PMXLens;
    var out = [];

    for (var i = 0; i < entries.length && out.length < MAX_RESULTS; i++) {
      var e = entries[i];
      if (scope === 'current' && e.threadId !== threadId) continue;

      var at = e.lower.indexOf(needle);
      if (at === -1) continue;

      /* Canonical history is what gets searched, but the result discloses the shaping so a
       * reader is not surprised that a muted, focused, or subcompacted message came back.
       * There is no separate synthesized "summary" record in this index at all - only
       * canonical source messages ever get indexed (index() reads data.threads[].messages
       * directly, never PMXLens.effectiveHistory()'s summary entries) - so a subcompacted
       * range's summary and its own sources can never both appear as duplicate results; a
       * hit always resolves to the canonical source message by construction. */
      var lensState = lens ? lens.stateOf(e.threadId, e.messageId) : null;

      var sn = snippetFor(e, at, needle.length);
      out.push({
        threadId: e.threadId,
        threadTitle: e.threadTitle,
        messageId: e.messageId,
        role: e.role,
        sentAt: e.sentAt,
        snippet: sn.text,
        matchStart: sn.matchStart,
        matchEnd: sn.matchEnd,
        insideCollapsed: e.collapsedByDefault,
        unloaded: e.unloaded,
        lensState: lensState
      });
    }

    return out;
  }

  function groupByThread(results) {
    var order = [], byThread = {};
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      if (!byThread[r.threadId]) {
        byThread[r.threadId] = { threadId: r.threadId, threadTitle: r.threadTitle, results: [] };
        order.push(r.threadId);
      }
      byThread[r.threadId].results.push(r);
    }
    return order.map(function (id) { return byThread[id]; });
  }

  /* The result popup uses the standard popup family, with the two scope controls at the top. */
  function openPopup(anchorEl, ctx) {
    var U = global.PMXUtil;
    var handle = null;
    var debounce = null;

    handle = ctx.services.popup.open({
      anchorEl: anchorEl,
      kind: 'panel',
      width: 340,
      build: function (host, api) {
        var scopes = U.el('div', { class: 'pmx-search-scopes' });
        var current = U.el('button', { class: 'pmx-search-scope', text: 'Current Thread' });
        var all = U.el('button', { class: 'pmx-search-scope', text: 'All Threads' });
        scopes.appendChild(current);
        scopes.appendChild(all);
        host.appendChild(scopes);

        var input = U.el('input', {
          class: 'pmx-popup-search', type: 'search',
          placeholder: 'Search this conversation', aria: { label: 'Search' }
        });
        host.appendChild(input);

        var list = U.el('div', { class: 'pmx-search-results pmx-scroll' });
        host.appendChild(list);

        function syncScopes() {
          var s = ctx.store.get('session.search.scope') || 'current';
          current.setAttribute('aria-pressed', s === 'current' ? 'true' : 'false');
          all.setAttribute('aria-pressed', s === 'all' ? 'true' : 'false');
          input.placeholder = s === 'all' ? 'Search every conversation' : 'Search this conversation';
        }

        function run() {
          var q = input.value;
          ctx.store.patch({ 'session.search.query': q });
          var scope = ctx.store.get('session.search.scope') || 'current';
          var results = query(q, { scope: scope });
          U.empty(list);

          if (!q || q.trim().length < 2) {
            list.appendChild(U.el('div', { class: 'pmx-pop-empty', text: 'Type at least two characters.' }));
            api.resize();
            return;
          }
          if (!results.length) {
            list.appendChild(U.el('div', { class: 'pmx-pop-empty', text: 'No matches in stored history.' }));
            api.resize();
            return;
          }

          var groups = scope === 'all' ? groupByThread(results)
            : [{ threadId: null, threadTitle: null, results: results }];

          groups.forEach(function (g) {
            if (g.threadTitle) {
              list.appendChild(U.el('div', { class: 'pmx-popup-group', text: g.threadTitle }));
            }
            g.results.forEach(function (r) {
              var row = U.el('button', { class: 'pmx-search-hit' });
              row.appendChild(U.el('div', { class: 'pmx-search-snip', text: r.snippet }));
              var tags = U.el('div', { class: 'pmx-search-tags' });
              tags.appendChild(U.el('span', { text: r.role === 'user' ? 'You' : 'Assistant' }));
              if (r.insideCollapsed) tags.appendChild(U.el('span', { text: 'inside collapsed text' }));
              if (r.unloaded) tags.appendChild(U.el('span', { text: 'older history' }));
              if (r.lensState) tags.appendChild(U.el('span', { text: global.PMXData.fmt.label(r.lensState) }));
              row.appendChild(tags);

              U.on(row, 'click', function () {
                /* Selecting a result never alters Lens state — it only navigates. */
                ctx.store.patch({
                  'session.search.selectedId': r.messageId,
                  'session.search.focusId': r.messageId
                });
                if (r.threadId !== ctx.store.get('session.activeThreadId')) {
                  ctx.store.set('session.activeThreadId', r.threadId);
                }
                api.close();
                /* Search owns no scroll container, so it asks the thread to do the navigating —
                 * ThreadInstance.scrollToMessage() is the contract's method for exactly this, and
                 * it also expands a collapsed message when the hit is inside one. The previous
                 * call reached for ctx.services.scroll, which is the PMXScroll module namespace
                 * and carries no jumpTo, so every result click threw inside this timeout and the
                 * jump silently never happened. */
                global.setTimeout(function () {
                  var thread = ctx.thread;
                  if (thread && typeof thread.scrollToMessage === 'function') {
                    thread.scrollToMessage(r.messageId, { highlight: true });
                  }
                }, 40);
              });
              list.appendChild(row);
            });
          });
          api.resize();
        }

        U.on(current, 'click', function () { ctx.store.set('session.search.scope', 'current'); syncScopes(); run(); });
        U.on(all, 'click', function () { ctx.store.set('session.search.scope', 'all'); syncScopes(); run(); });
        U.on(input, 'input', function () {
          if (debounce) clearTimeout(debounce);
          debounce = setTimeout(run, 120);
        });

        input.value = ctx.store.get('session.search.query') || '';
        syncScopes();
        run();
        setTimeout(function () { try { input.focus(); } catch (e) {} }, 30);
      }
    });
    return handle;
  }

  global.PMXSearch = {
    bind: bind,
    attach: attach,
    index: index,
    query: query,
    groupByThread: groupByThread,
    openPopup: openPopup,
    size: function () { return entries.length; },
    isBuilt: function () { return built; }
  };
})(window);
