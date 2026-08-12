/* ============================================================================
   Kimi K3 — search kit (window.K3Search).

   ONE search bar, two scopes. data.js indexes every stored message (including
   collapsed and not-yet-loaded history), so results are canonical; the thread
   module owns load + scroll + flash on 'reveal-message'.

   Surface:
   - K3Search.attach(inputEl, ctx) -> {unmount}  (window-provided input)
   - K3Search.open(ctx, anchorEl)   -> {close, el} (icon-trigger popover input)

   Behavior:
   - 150ms debounce; empty query closes the popup.
   - Scope chips "Current Thread" / "All Threads" persist store.search.scope.
   - Selecting a result persists store.search, expands collapsed hits FIRST,
     switches threads when cross-thread (60ms tick), then emits
     K3 'reveal-message' {threadId, messageId}.
   - Each result row carries a trailing "more" menu: Open conversation
     (the default pick), Add passage to context (admits the passage to the
     Context Lens receipt via store 'lensReceipt.admitted'), Branch from
     this point (K3ThreadOps.branchFrom, then activates the branch), and
     Copy link ('thread-NN#message-id' to the clipboard).
   - Survives docked/pop-out remount: restores query from the store and
     re-emits a pending focusTarget younger than 5s after a 150ms tick.
   ========================================================================== */
(function () {
  'use strict';

  const DEBOUNCE_MS = 150;
  const CROSS_THREAD_TICK_MS = 60;
  const REMOUNT_REVEAL_MS = 150;
  const REMOUNT_REVEAL_AGE_MS = 5000;

  function activeThreadId(ctx) { return ctx.store.get('activeThreadId', null); }
  function currentScope(ctx) { return ctx.store.get('search.scope', 'current') || 'current'; }

  function roleLabel(role) { return role === 'user' ? 'You' : 'Assistant'; }

  function lensChipLabel(state) {
    if (state === 'muted') return 'Muted';
    if (state === 'focused') return 'Focused';
    if (state === 'subcompacted') return 'Subcompacted';
    return null;
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function chip(text, accent) {
    return el('span', 'k3s2-chip' + (accent ? ' k3s2-chip-accent' : ''), text);
  }

  // Append snippet text with every (case-insensitive) query hit in <mark>.
  function appendSnippet(parent, snippet, query) {
    const text = String(snippet || '');
    const q = String(query || '').trim().toLowerCase();
    if (!q) { parent.textContent = text; return; }
    const lower = text.toLowerCase();
    let i = 0;
    let at = lower.indexOf(q);
    while (at >= 0) {
      if (at > i) parent.appendChild(document.createTextNode(text.slice(i, at)));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(at, at + q.length);
      parent.appendChild(mark);
      i = at + q.length;
      at = lower.indexOf(q, i);
    }
    if (i < text.length) parent.appendChild(document.createTextNode(text.slice(i)));
  }

  // Source message ids folded into a subcompact summary hit (body === summary).
  function subcompactSourceIds(ctx, result) {
    const msg = ctx.data.message(result.messageId);
    if (!msg) return [];
    const body = String(msg.body || '');
    const applied = ctx.data.lensState(result.threadId).applied.subcompacted || [];
    for (let i = 0; i < applied.length; i++) {
      if (applied[i].summary && applied[i].summary === body) return (applied[i].ids || []).slice();
    }
    return [];
  }

  // Per-render message index cache (threadId -> {messageId -> position}).
  function makeIndexCache(ctx) {
    const cache = {};
    return function (threadId) {
      if (!cache[threadId]) {
        cache[threadId] = {};
        ctx.data.messages(threadId).forEach((m, i) => { cache[threadId][m.id] = i; });
      }
      return cache[threadId];
    };
  }

  function isOlderHistory(indexOf, ctx, result) {
    const win = ctx.data.visibleWindow(result.threadId);
    const idx = indexOf(result.threadId)[result.messageId];
    return idx != null && idx < win.total - win.initialCount;
  }

  // --- result-row actions ---------------------------------------------------------
  // Admits the passage to the Context Lens receipt (store lensReceipt.admitted).
  function addPassageToContext(ctx, result) {
    const admitted = (ctx.store.get('lensReceipt.admitted', []) || []).slice();
    const snippet = String(result.snippet || '').trim();
    admitted.push({
      threadId: result.threadId,
      messageId: result.messageId,
      snippet: snippet.length > 140 ? snippet.slice(0, 140).trim() + '...' : snippet,
      provenance: 'Prior-chat search',
      size: '~' + Math.max(1, Math.round(snippet.length / 4)) + ' tokens'
    });
    ctx.store.set('lensReceipt.admitted', admitted);
    ctx.emit('data', { type: 'lens-changed', threadId: result.threadId });
  }

  function branchFromResult(ctx, result) {
    if (!(window.K3ThreadOps && typeof window.K3ThreadOps.branchFrom === 'function')) return;
    const branch = window.K3ThreadOps.branchFrom(result.threadId, result.messageId, {});
    if (branch && branch.id) ctx.store.set('activeThreadId', branch.id);
  }

  function copyResultLink(result) {
    const link = result.threadId + '#' + result.messageId;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(link).catch(() => legacyCopy(link));
      return;
    }
    legacyCopy(link);
  }

  function legacyCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }

  function openResultMenu(ctx, result, anchor, onPick) {
    ctx.ui.menu(anchor, [
      { label: 'Open conversation', icon: 'external', action: () => onPick(result) },
      {
        label: 'Add passage to context',
        icon: 'lens',
        testid: 'k3-search-admit',
        action: () => addPassageToContext(ctx, result)
      },
      {
        label: 'Branch from this point',
        icon: 'branch',
        testid: 'k3-search-branch',
        action: () => branchFromResult(ctx, result)
      },
      { type: 'separator' },
      { label: 'Copy link', icon: 'copy', action: () => copyResultLink(result) }
    ]);
  }

  function buildResultRow(ctx, result, query, indexOf, onPick) {
    const row = el('button', 'k3s2-result');
    row.type = 'button';
    row.setAttribute('data-testid', 'k3-search-result');

    const top = el('span', 'k3s2-result-top');
    top.appendChild(el('span', 'k3s2-role', roleLabel(result.role)));
    const lensLabel = lensChipLabel(result.lensState);
    if (lensLabel) top.appendChild(chip(lensLabel, true));
    if (result.isSubcompactSummary) top.appendChild(chip('Summary', true));
    if (isOlderHistory(indexOf, ctx, result)) top.appendChild(chip('Older history', false));
    if (result.inCollapsedRegion) top.appendChild(chip('Collapsed', false));

    const moreBtn = el('span', 'k3-icon-btn k3s2-result-more');
    moreBtn.setAttribute('role', 'button');
    moreBtn.setAttribute('tabindex', '0');
    moreBtn.setAttribute('data-testid', 'k3-search-result-more');
    moreBtn.setAttribute('aria-label', 'Result actions');
    moreBtn.title = 'Result actions';
    moreBtn.appendChild(window.K3Icons.get('more'));
    const openMenu = (e) => {
      e.stopPropagation(); // never triggers the row pick
      e.preventDefault();
      openResultMenu(ctx, result, moreBtn, onPick);
    };
    moreBtn.addEventListener('click', openMenu);
    moreBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openMenu(e);
    });
    top.appendChild(moreBtn);
    row.appendChild(top);

    const snippet = el('span', 'k3s2-snippet');
    appendSnippet(snippet, result.snippet, query);
    row.appendChild(snippet);

    row.addEventListener('click', () => onPick(result));
    return row;
  }

  // Renders scope chips + results into container. hooks: {onPick, afterRender}.
  function renderPanel(container, ctx, query, hooks) {
    container.innerHTML = '';
    const scope = currentScope(ctx);
    const tid = activeThreadId(ctx);

    const scopes = el('div', 'k3s2-scopes');
    [
      { id: 'current', label: 'Current Thread', testid: 'k3-search-scope-current' },
      { id: 'all', label: 'All Threads', testid: 'k3-search-scope-all' }
    ].forEach((s) => {
      const b = el('button', 'k3s2-scope' + (scope === s.id ? ' is-selected' : ''), s.label);
      b.type = 'button';
      b.setAttribute('data-testid', s.testid);
      b.setAttribute('aria-pressed', scope === s.id ? 'true' : 'false');
      b.addEventListener('click', () => {
        if (currentScope(ctx) === s.id) return;
        ctx.store.set('search.scope', s.id);
        renderPanel(container, ctx, query, hooks);
        if (hooks.afterRender) hooks.afterRender();
      });
      scopes.appendChild(b);
    });
    container.appendChild(scopes);

    const list = el('div', 'k3s2-results k3-scroll');
    list.setAttribute('data-testid', 'k3-search-results');
    container.appendChild(list);

    const found = ctx.data.search(query, scope === 'current' ? { scope: scope, threadId: tid } : { scope: scope });
    const results = found.results || [];
    if (results.length === 0) {
      list.appendChild(el('div', 'k3s2-empty', 'No matches'));
      return;
    }

    const indexOf = makeIndexCache(ctx);
    let _ri = 0;
    list.classList.add('k3-stagger');
    const addRow = (host, result) => {
      const row = buildResultRow(ctx, result, query, indexOf, hooks.onPick);
      row.style.setProperty('--k3-i', Math.min(_ri++, 8));
      host.appendChild(row);
    };

    if (scope === 'current') {
      results.forEach((r) => addRow(list, r));
      return;
    }

    // scope=all: group by thread, active thread's group first.
    const byThread = {};
    const order = [];
    results.forEach((r) => {
      if (!byThread[r.threadId]) { byThread[r.threadId] = []; order.push(r.threadId); }
      byThread[r.threadId].push(r);
    });
    if (tid && byThread[tid]) {
      order.splice(order.indexOf(tid), 1);
      order.unshift(tid);
    }

    order.forEach((threadId) => {
      const rows = byThread[threadId];
      const head = el('div', 'k3s2-group-header');
      head.appendChild(el('span', 'k3s2-group-title', rows[0].threadTitle));
      head.appendChild(el('span', 'k3s2-count', String(rows.length)));
      list.appendChild(head);

      // Nest subcompact sources under their summary hit so the group never
      // shows summary and sources as unrelated duplicates.
      const childIds = {};
      const childrenOf = {};
      rows.filter((r) => r.isSubcompactSummary).forEach((s) => {
        const ids = subcompactSourceIds(ctx, s);
        childrenOf[s.messageId] = rows.filter((r) => ids.indexOf(r.messageId) >= 0);
        ids.forEach((id) => { childIds[id] = true; });
      });

      rows.forEach((r) => {
        if (childIds[r.messageId]) return;
        addRow(list, r);
        const kids = childrenOf[r.messageId];
        if (kids && kids.length) {
          const nest = el('div', 'k3s2-children');
          kids.forEach((k) => addRow(nest, k));
          list.appendChild(nest);
        }
      });
    });
  }

  // Selection contract: persist -> expand collapsed FIRST -> switch thread ->
  // reveal. The thread module owns load + scroll + flash.
  function pickResult(ctx, result, query, trackTimer) {
    ctx.store.patch('search', {
      query: query,
      scope: currentScope(ctx),
      selectedResult: { messageId: result.messageId },
      focusTarget: { messageId: result.messageId, at: Date.now() }
    });
    if (result.inCollapsedRegion) {
      ctx.store.set('expandedMessages.' + result.messageId, true);
    }
    const reveal = { threadId: result.threadId, messageId: result.messageId };
    if (result.threadId !== activeThreadId(ctx)) {
      ctx.store.set('activeThreadId', result.threadId);
      const t = setTimeout(() => ctx.emit('reveal-message', reveal), CROSS_THREAD_TICK_MS);
      if (trackTimer) trackTimer(t);
    } else {
      ctx.emit('reveal-message', reveal);
    }
  }

  function findThreadOf(ctx, messageId) {
    const threads = ctx.data.listThreads();
    for (let i = 0; i < threads.length; i++) {
      const msgs = ctx.data.messages(threads[i].id);
      for (let j = 0; j < msgs.length; j++) if (msgs[j].id === messageId) return threads[i].id;
    }
    return null;
  }

  const K3Search = {
    attach(inputEl, ctx) {
      inputEl.setAttribute('data-testid', 'k3-search-input');
      let debounce = null;
      let popup = null;
      const timers = [];
      const track = (t) => timers.push(t);

      const savedQuery = ctx.store.get('search.query', '');
      if (savedQuery) inputEl.value = savedQuery;

      // Post-remount re-jump: a fresh focusTarget means the user picked a
      // result just before the docked/pop-out swap.
      const ft = ctx.store.get('search.focusTarget', null);
      if (ft && ft.messageId && typeof ft.at === 'number' && Date.now() - ft.at < REMOUNT_REVEAL_AGE_MS) {
        track(setTimeout(() => {
          const tid = findThreadOf(ctx, ft.messageId) || activeThreadId(ctx);
          if (tid) ctx.emit('reveal-message', { threadId: tid, messageId: ft.messageId });
        }, REMOUNT_REVEAL_MS));
      }

      function popupLive() {
        return popup && popup.el.isConnected && popup.el.classList.contains('is-open');
      }
      function closePopup() {
        if (popup) { popup.close(); popup = null; }
      }

      function run() {
        const q = inputEl.value;
        ctx.store.patch('search', { query: q });
        if (!q.trim()) { closePopup(); return; }
        const hooks = {
          onPick: (result) => { pickResult(ctx, result, q, track); closePopup(); },
          afterRender: () => { if (popupLive()) ctx.ui.springResize(popup.el); }
        };
        if (popupLive()) {
          renderPanel(popup.el.querySelector('.k3s2-panel') || popup.el, ctx, q, hooks);
          ctx.ui.springResize(popup.el);
        } else {
          const panel = el('div', 'k3s2-panel');
          popup = ctx.ui.popover(inputEl, panel, { className: 'k3s2-pop' });
          renderPanel(panel, ctx, q, hooks);
        }
      }

      function onInput() {
        clearTimeout(debounce);
        debounce = setTimeout(run, DEBOUNCE_MS);
      }
      inputEl.addEventListener('input', onInput);

      return {
        unmount() {
          clearTimeout(debounce);
          timers.forEach(clearTimeout);
          closePopup();
          inputEl.removeEventListener('input', onInput);
          inputEl.removeAttribute('data-testid');
        }
      };
    },

    // Icon-trigger variant: popover carrying its own input + results.
    open(ctx, anchorEl) {
      const wrap = el('div', 'k3s2-panel');
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'k3-input k3s2-open-input';
      input.placeholder = 'Search messages';
      input.setAttribute('spellcheck', 'false');
      input.setAttribute('data-testid', 'k3-search-input');
      input.value = ctx.store.get('search.query', '') || '';
      const resultsBox = el('div', 'k3s2-open-results');
      wrap.appendChild(input);
      wrap.appendChild(resultsBox);

      const rec = ctx.ui.popover(anchorEl, wrap, { className: 'k3s2-pop' });
      let debounce = null;

      function run() {
        const q = input.value;
        ctx.store.patch('search', { query: q });
        if (!q.trim()) { resultsBox.innerHTML = ''; return; }
        renderPanel(resultsBox, ctx, q, {
          onPick: (result) => { pickResult(ctx, result, q, null); rec.close(); },
          afterRender: () => ctx.ui.springResize(rec.el)
        });
      }
      input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(run, DEBOUNCE_MS);
      });
      if (input.value.trim()) run();
      setTimeout(() => input.focus(), ctx.ui.reduced() ? 0 : 60);

      return { close: () => rec.close(), el: rec.el };
    }
  };

  window.K3Search = K3Search;
})();
