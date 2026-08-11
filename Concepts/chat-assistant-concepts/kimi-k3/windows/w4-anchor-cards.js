/* ============================================================================
   Kimi K3 — W4 Anchor Cards (chat-window concept).

   Standard kit header; thread slot; composer. Work surfaces render as
   floating cards anchored to the transcript's right edge when the chat is
   wide (env.width >= 975) — absolute-positioned in a right gutter that
   overlays the thread's right margin. A pinnable Chats anchor card (kit
   historyPanel) lives alongside the work cards in the gutter. At narrower
   widths the SAME surface elements — plus the Chats card — collapse into a
   single row above the composer, with no rebuild (DOM state travels between
   hosts on the live 'env' flip). The Chats pin persists per thread in
   surfaceView.<tid>.w4HistoryPinned.

   Provides exactly one [data-k3-slot="thread"] and one
   [data-k3-slot="composer"]; the host fills them (THE ONE HARD RULE).
   ========================================================================== */
(function () {
  'use strict';

  var BREAKPOINT = 975;

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { return window.K3Icons.get(name); }
  function arr(v) { return Array.isArray(v) ? v : []; }

  window.K3.registerWindow('w4', {
    meta: {
      id: 'w4',
      name: 'Anchor Cards',
      blurb: 'Work surfaces float as cards anchored to the transcript\u2019s right edge when there is room; under 975px they collapse to a work-chips row.'
    },
    mount: function (hostEl, ctx) {
      var kit = window.K3WindowKit;
      var store = ctx.store;
      var data = ctx.data;
      var disposers = [];
      var surfaceNodes = [];     // live kit elements (goal / todo / chips)
      var mountedSig = '';       // signature of what surfaceNodes holds
      var currentTid = null;
      var wide = ctx.env.width >= BREAKPOINT;
      var unmounted = false;

      /* ---- skeleton ------------------------------------------------------ */
      var root = el('section', 'w4-root');
      root.setAttribute('data-k3-window', 'w4');

      var headerEl = kit.header(ctx);
      root.appendChild(headerEl);

      var lensHost = kit.lensBannerHost(ctx);
      root.appendChild(lensHost.element);

      // create the persistent history element ONCE; it lives inside a
      // pinnable Chats card that travels between the gutter (wide) and the
      // chips host (narrow) on the breakpoint flip.
      var historyEl = kit.historyPanel(ctx);
      var historyCard = el('section', 'w4-card w4-chats-card');
      historyCard.setAttribute('data-testid', 'w4-chats-card');
      var historyHead = el('div', 'w4-chats-head');
      var historyTitle = el('span', 'w4-chats-title', 'Chats');
      var historyPin = el('button', 'k3-icon-btn w4-chats-pin');
      historyPin.type = 'button';
      historyPin.setAttribute('aria-pressed', 'false');
      historyPin.setAttribute('aria-label', 'Pin chats');
      historyPin.title = 'Pin chats';
      historyPin.setAttribute('data-testid', 'w4-history-pin');
      historyPin.appendChild(icon('pin'));
      historyHead.appendChild(historyTitle);
      historyHead.appendChild(historyPin);
      historyEl.classList.add('w4-chats-history');
      historyCard.appendChild(historyHead);
      historyCard.appendChild(historyEl);

      // body: the transcript column owns the layout; the anchor gutter is an
      // absolute right-edge overlay that floats over the thread's right
      // margin (it does NOT steal width from the transcript). The chips row
      // is a normal-flow strip above the composer, narrow layout only.
      var body = el('div', 'w4-body');

      // transcript area is the positioned container for the anchor gutter
      var transcriptArea = el('div', 'w4-transcript-area');
      var threadSlot = el('div', 'w4-thread');
      threadSlot.setAttribute('data-k3-slot', 'thread');
      transcriptArea.appendChild(threadSlot);

      // anchor gutter (wide layout): absolutely-positioned floating cards
      var gutter = el('aside', 'w4-gutter');
      gutter.setAttribute('aria-label', 'Work cards');
      var gutterHead = el('div', 'w4-gutter-head', 'Work');
      var gutterBody = el('div', 'w4-gutter-body k3-scroll');
      gutter.appendChild(gutterHead);
      gutter.appendChild(gutterBody);
      transcriptArea.appendChild(gutter);

      body.appendChild(transcriptArea);

      // chips row (narrow layout): collapses all surfaces into one row
      var chipsHost = el('div', 'w4-chips');
      chipsHost.hidden = true;
      body.appendChild(chipsHost);

      var composerSlot = el('div', 'w4-composer');
      composerSlot.setAttribute('data-k3-slot', 'composer');
      body.appendChild(composerSlot);

      root.appendChild(body);
      hostEl.appendChild(root);

      /* ---- presence ------------------------------------------------------ */
      function presence(tid) {
        var t = tid ? data.thread(tid) : null;
        var p = { goal: false, todo: false, chips: false, todoDone: 0, todoTotal: 0,
                  agents: 0, files: 0 };
        if (!t) return p;
        if (t.activeGoal && !store.get('goalView.' + tid + '.cleared', false)) p.goal = true;
        var items = t.todo && arr(t.todo.items);
        if (items && items.length) {
          p.todo = true;
          p.todoTotal = items.length;
          p.todoDone = items.filter(function (i) { return String(i.state).toLowerCase() === 'complete'; }).length;
        }
        var hasActivity = arr(t.messages).some(function (m) { return !!m.activityGroup; });
        arr(t.subagentGroups).forEach(function (g) { p.agents += arr(g.agents).length; });
        arr(t.diffGroups).forEach(function (g) { p.files += arr(g.files).length; });
        p.chips = p.agents > 0 || p.files > 0 || hasActivity;
        return p;
      }
      function any(p) { return p.goal || p.todo || p.chips; }
      function kindsOf(p) {
        return (p.goal ? 'g,' : '') + (p.todo ? 't,' : '') + (p.chips ? 'c' : '');
      }

      /* ---- surfaces ------------------------------------------------------ */
      function unmountSurfaces() {
        surfaceNodes.forEach(function (n) {
          try { if (n && n.unmount) n.unmount(); } catch (e) { /* ignore */ }
          try { if (n && n.remove) n.remove(); } catch (e) { /* ignore */ }
        });
        surfaceNodes = [];
        mountedSig = '';
        // remove any orphaned surface/yieldwrap nodes left by older builds
        [gutterBody, chipsHost].forEach(function (host) {
          if (!host) return;
          host.querySelectorAll('.k3w-kit-surface, .k3w-kit-chips, .k3w-kit-yieldwrap').forEach(function (orphan) {
            try { orphan.remove(); } catch (e) { /* ignore */ }
          });
        });
      }

      function buildSurfaces(tid) {
        unmountSurfaces();
        var p = presence(tid);
        if (p.goal) {
          var g = kit.goalSurface(ctx, tid);
          if (g) { g.classList.add('w4-card'); surfaceNodes.push(g); }
        }
        if (p.todo) {
          var td = kit.todoSurface(ctx, tid);
          if (td) { td.classList.add('w4-card'); surfaceNodes.push(td); }
        }
        if (p.chips) {
          var c = kit.workChips(ctx, tid);
          if (c) { c.classList.add('w4-card', 'w4-card-chips'); surfaceNodes.push(c); }
        }
        mountedSig = kindsOf(presence(tid));
        placeSurfaces();
      }

      // Move the live surface elements (and the always-present history card)
      // into the active host without rebuilding (preserves DOM state across the
      // breakpoint flip). The history card sits FIRST in the host so it leads.
      function placeSurfaces() {
        var host = wide ? gutterBody : chipsHost;
        if (historyCard.parentNode !== host) host.insertBefore(historyCard, host.firstChild);
        surfaceNodes.forEach(function (n) {
          if (n && n.parentNode !== host) host.appendChild(n);
        });
        paint();
      }

      // The Chats anchor card is always present, so the host (gutter/chips) is
      // visible whenever the history card is in the DOM. Pinned state forces
      // the host visible even when there is no other work.
      function historyPinned() {
        return store.get('surfaceView.' + currentTid + '.w4HistoryPinned', false) === true;
      }
      function paintPin() {
        var pinned = historyPinned();
        historyPin.setAttribute('aria-pressed', pinned ? 'true' : 'false');
        historyPin.classList.toggle('is-pinned', pinned);
        historyPin.setAttribute('aria-label', pinned ? 'Unpin chats' : 'Pin chats');
        historyPin.title = pinned ? 'Unpin chats' : 'Pin chats';
        historyPin.innerHTML = '';
        historyPin.appendChild(icon(pinned ? 'pin-off' : 'pin'));
        historyCard.classList.toggle('is-pinned', pinned);
      }
      historyPin.addEventListener('click', function () {
        if (!currentTid) currentTid = store.get('activeThreadId', null);
        store.set('surfaceView.' + currentTid + '.w4HistoryPinned', !historyPinned());
      });

      function paint() {
        if (unmounted) return;
        var p = presence(currentTid);
        var hasWork = any(p);
        // the host shows when there is work OR the history card is pinned
        // (the history card itself is always present, so a pinned card keeps
        // the host open even with no work surfaces).
        var showHost = hasWork || historyPinned();

        // anchor gutter: wide + (work or pinned)
        gutter.hidden = !(wide && showHost);
        gutterHead.hidden = !hasWork;

        // chips row: narrow + (work or pinned)
        chipsHost.hidden = !(showHost) || wide;

        paintPin();
      }

      function rebuild() {
        currentTid = store.get('activeThreadId', null);
        buildSurfaces(currentTid);
      }

      function refresh() {
        if (unmounted) return;
        if (!currentTid) { rebuild(); return; }
        var sig = kindsOf(presence(currentTid));
        if (sig !== mountedSig) buildSurfaces(currentTid);
        else paint();
      }

      /* ---- wiring --------------------------------------------------------- */
      disposers.push(store.subscribe('activeThreadId', rebuild));
      disposers.push(store.subscribe('goalView', refresh));
      disposers.push(store.subscribe('surfaceView', paint)); // pin toggle repaints
      function onData(evt) {
        if (!evt) return;
        if (evt.type === 'threads-changed' || evt.type === 'restarted' ||
            evt.type === 'message-added' || evt.type === 'questionnaire-resolved') refresh();
      }
      ctx.on('data', onData);
      disposers.push(function () { ctx.off('data', onData); });

      function onEnv() {
        var nowWide = ctx.env.width >= BREAKPOINT;
        if (nowWide === wide) return;
        wide = nowWide;
        placeSurfaces(); // same elements, new host — state untouched
      }
      ctx.on('env', onEnv);
      disposers.push(function () { ctx.off('env', onEnv); });

      /* ---- boot + teardown ------------------------------------------------ */
      rebuild();

      function unmount() {
        if (unmounted) return;
        unmounted = true;
        unmountSurfaces();
        try { if (historyEl && historyEl.unmount) historyEl.unmount(); } catch (e) { /* ignore */ }
        disposers.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
        disposers = [];
        try { if (headerEl.unmount) headerEl.unmount(); } catch (e) { /* ignore */ }
        try { lensHost.unmount(); } catch (e) { /* ignore */ }
        root.remove();
      }

      return { unmount: unmount };
    }
  });
})();
