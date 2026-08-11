/* ============================================================================
   Kimi K3 — W6 Icon Rail (chat-window concept).

   A 48px-wide LEFT mini-rail of icon buttons (Chats / Goal / Todo / Agents).
   Selecting an icon switches a ~200px side panel: Chats shows the kit
   historyPanel; Goal / Todo / Agents show the matching kit surface for the
   active thread. A pin toggle on the side header keeps the Chats panel
   visible even when another icon is selected (the surface stacks beneath
   the history). The thread slot takes the remaining width. Active icon =
   accent-soft + weight, never a left-side border. The active panel persists
   per thread in surfaceView.<tid>.w6Panel; the Chats pin persists in
   surfaceView.<tid>.w6HistoryPinned.

   Provides exactly one [data-k3-slot="thread"] and one
   [data-k3-slot="composer"]; the host fills them (THE ONE HARD RULE).
   ========================================================================== */
(function () {
  'use strict';

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function icon(name) { return window.K3Icons.get(name); }
  function arr(v) { return Array.isArray(v) ? v : []; }

  // rail buttons. kind -> { label, icon, panel }. 'chats' shows the kit
  // historyPanel; the rest surface a kit work-surface for the active thread.
  var RAIL_DEFS = [
    { kind: 'chats',  label: 'Chats',  icon: 'history',  panel: 'history' },
    { kind: 'goal',   label: 'Goal',   icon: 'goal',     panel: 'surface' },
    { kind: 'todo',   label: 'Todo',   icon: 'todo',     panel: 'surface' },
    { kind: 'agents', label: 'Agents', icon: 'subagent', panel: 'surface' }
  ];

  window.K3.registerWindow('w6', {
    meta: {
      id: 'w6',
      name: 'Icon Rail',
      blurb: 'A 48px left icon rail switches a 200px side panel between Chats, Goal, Todo, and Agents; the transcript takes the remaining width.'
    },
    mount: function (hostEl, ctx) {
      var kit = window.K3WindowKit;
      var store = ctx.store;
      var data = ctx.data;
      var disposers = [];
      var currentTid = null;
      var surfaceNode = null;     // live kit work-surface shown in the side panel
      var mountedKind = null;     // kind of the surfaceNode currently mounted
      var unmounted = false;

      // Narrow-width breakpoint: below this the 200px side panel would crush
      // the transcript, so it collapses away unless a panel is pinned/open.
      var NARROW = 720;
      var narrow = (ctx.env && ctx.env.width != null) ? ctx.env.width < NARROW : false;

      /* ---- skeleton ------------------------------------------------------ */
      var root = el('section', 'w6-root');
      root.setAttribute('data-k3-window', 'w6');

      var headerEl = kit.header(ctx);
      root.appendChild(headerEl);

      var lensHost = kit.lensBannerHost(ctx);
      root.appendChild(lensHost.element);

      var body = el('div', 'w6-body');

      // left: 48px icon rail
      var rail = el('nav', 'w6-rail');
      rail.setAttribute('aria-label', 'Panels');
      var railBtns = {};
      RAIL_DEFS.forEach(function (def) {
        var btn = el('button', 'w6-rail-btn');
        btn.type = 'button';
        btn.setAttribute('aria-label', def.label);
        btn.setAttribute('data-kind', def.kind);
        btn.title = def.label;
        var ic = el('span', 'w6-rail-btn-ic');
        ic.appendChild(icon(def.icon));
        btn.appendChild(ic);
        btn.appendChild(el('span', 'w6-rail-btn-label', def.label));
        btn.addEventListener('click', function () { setActivePanel(def.kind); });
        rail.appendChild(btn);
        railBtns[def.kind] = btn;
      });
      body.appendChild(rail);

      // middle: ~200px side panel (history or active surface)
      var side = el('aside', 'w6-side');
      side.setAttribute('aria-label', 'Panel');
      var sideHead = el('div', 'w6-side-head');
      var sideHeadLabel = el('span', 'w6-side-head-label', 'Chats');
      var chatsPin = el('button', 'k3-icon-btn w6-side-pin');
      chatsPin.type = 'button';
      chatsPin.setAttribute('aria-pressed', 'false');
      chatsPin.setAttribute('aria-label', 'Pin chats');
      chatsPin.title = 'Pin chats';
      chatsPin.setAttribute('data-testid', 'w6-history-pin');
      chatsPin.appendChild(icon('pin'));
      sideHead.appendChild(sideHeadLabel);
      sideHead.appendChild(chatsPin);
      var sideBody = el('div', 'w6-side-body k3-scroll');
      side.appendChild(sideHead);
      side.appendChild(sideBody);
      body.appendChild(side);

      // the historyPanel is persistent (its own listeners); it lives in the
      // side body and is shown/hidden via the `hidden` property when another
      // panel is active.
      var historyEl = kit.historyPanel(ctx);
      historyEl.classList.add('w6-side-history');
      sideBody.appendChild(historyEl);
      // surface host node sits beside history; populated on demand.
      var surfaceHost = el('div', 'w6-side-surface');
      surfaceHost.hidden = true;
      sideBody.appendChild(surfaceHost);

      // right: transcript column + composer
      var center = el('div', 'w6-center');
      var threadSlot = el('div', 'w6-thread');
      threadSlot.setAttribute('data-k3-slot', 'thread');
      center.appendChild(threadSlot);
      var composerSlot = el('div', 'w6-composer');
      composerSlot.setAttribute('data-k3-slot', 'composer');
      center.appendChild(composerSlot);
      body.appendChild(center);

      root.appendChild(body);
      hostEl.appendChild(root);

      /* ---- presence ------------------------------------------------------ */
      function presence(tid) {
        var t = tid ? data.thread(tid) : null;
        var p = { goal: false, todo: false, agents: 0 };
        if (!t) return p;
        if (t.activeGoal && !store.get('goalView.' + tid + '.cleared', false)) p.goal = true;
        var items = t.todo && arr(t.todo.items);
        if (items && items.length) p.todo = true;
        arr(t.subagentGroups).forEach(function (g) { p.agents += arr(g.agents).length; });
        return p;
      }

      /* ---- panel state --------------------------------------------------- */
      function activePanel() {
        return store.get('surfaceView.' + currentTid + '.w6Panel', 'chats');
      }
      // At narrow widths the side panel is hidden by default; a rail click
      // opens it temporarily (w6PanelOpen), and pinning history forces it open.
      function panelOpen() {
        return store.get('surfaceView.' + currentTid + '.w6PanelOpen', false) === true;
      }
      function setActivePanel(kind) {
        if (!currentTid) return;
        // clicking the already-active rail button toggles the panel open/closed
        // at narrow widths (temporary reveal); at wide widths the panel is
        // always shown so the toggle is a no-op there.
        if (narrow && activePanel() === kind) {
          store.set('surfaceView.' + currentTid + '.w6PanelOpen', !panelOpen());
          return;
        }
        store.set('surfaceView.' + currentTid + '.w6Panel', kind);
        if (narrow) store.set('surfaceView.' + currentTid + '.w6PanelOpen', true);
      }
      // whether the side panel is currently shown (reserves layout space)
      function sideVisible() {
        if (!narrow) return true;             // wide: always a column
        if (historyPinned()) return true;     // pinned history forces it open
        return panelOpen();                    // narrow + not pinned: only if opened
      }

      function buildSurface(kind, tid) {
        if (kind === 'goal') return kit.goalSurface(ctx, tid);
        if (kind === 'todo') return kit.todoSurface(ctx, tid);
        if (kind === 'agents') return kit.workChips(ctx, tid); // agents live in work chips
        return null;
      }

      function unmountSurface() {
        if (surfaceNode) {
          try { if (surfaceNode.unmount) surfaceNode.unmount(); } catch (e) { /* ignore */ }
        }
        surfaceNode = null;
        mountedKind = null;
        surfaceHost.innerHTML = '';
      }

      function historyPinned() {
        return store.get('surfaceView.' + currentTid + '.w6HistoryPinned', false) === true;
      }
      chatsPin.addEventListener('click', function () {
        if (!currentTid) currentTid = store.get('activeThreadId', null);
        var next = !historyPinned();
        store.set('surfaceView.' + currentTid + '.w6HistoryPinned', next);
        // pinning history also reveals + selects the chats panel so the pin is
        // immediately useful at narrow widths.
        if (next) {
          store.set('surfaceView.' + currentTid + '.w6Panel', 'chats');
          store.set('surfaceView.' + currentTid + '.w6PanelOpen', true);
        }
      });

      // render the side panel for the active kind. When the Chats pin is on,
      // the persistent historyPanel stays visible even if a work surface is
      // the active panel (the surface stacks beneath the history).
      function renderPanel() {
        var kind = activePanel();
        var pinned = historyPinned();
        var def = null;
        for (var i = 0; i < RAIL_DEFS.length; i++) {
          if (RAIL_DEFS[i].kind === kind) { def = RAIL_DEFS[i]; break; }
        }
        var headLabel = def ? def.label : 'Panel';
        sideHeadLabel.textContent = headLabel;

        // history visibility: shown when chats is active, OR whenever pinned
        var showHistory = (kind === 'chats') || pinned;
        historyEl.hidden = !showHistory;
        // pin button reflects state
        chatsPin.setAttribute('aria-pressed', pinned ? 'true' : 'false');
        chatsPin.classList.toggle('is-pinned', pinned);
        chatsPin.setAttribute('aria-label', pinned ? 'Unpin chats' : 'Pin chats');
        chatsPin.title = pinned ? 'Unpin chats' : 'Pin chats';
        chatsPin.innerHTML = '';
        chatsPin.appendChild(icon(pinned ? 'pin-off' : 'pin'));

        var isHistory = kind === 'chats';
        surfaceHost.hidden = isHistory;

        // lazily (re)build the surface only when the active kind changes
        if (!isHistory) {
          if (kind !== mountedKind) {
            unmountSurface();
            surfaceNode = buildSurface(kind, currentTid);
            if (surfaceNode) {
              mountedKind = kind;
              surfaceHost.appendChild(surfaceNode);
              surfaceHost.hidden = false;
            } else {
              // no data for this surface: show a quiet note
              surfaceHost.hidden = false;
              surfaceHost.appendChild(el('div', 'w6-side-empty',
                'No ' + headLabel.toLowerCase() + ' on this thread yet.'));
            }
          }
        } else {
          unmountSurface();
        }

        // active rail button styling
        RAIL_DEFS.forEach(function (d) {
          var on = d.kind === kind;
          railBtns[d.kind].setAttribute('aria-pressed', on ? 'true' : 'false');
        });

        // layout classes (narrow breakpoint + whether the side panel reserves
        // space) track panel/pin/width state.
        paintLayout();
      }

      function rebuild() {
        currentTid = store.get('activeThreadId', null);
        unmountSurface();
        renderPanel();
      }

      // apply layout classes that drive the CSS (narrow + side visibility).
      function paintLayout() {
        root.classList.toggle('is-narrow', narrow);
        root.classList.toggle('is-side-hidden', !sideVisible());
      }

      function refresh() {
        if (unmounted) return;
        if (!currentTid) { rebuild(); return; }
        // if a surface panel is active, its data may have changed — rebuild it
        // so counts/state stay live (surfaces are cheap; state is internal).
        var kind = activePanel();
        if (kind !== 'chats' && kind === mountedKind) {
          unmountSurface();
        }
        renderPanel();
      }

      /* ---- wiring --------------------------------------------------------- */
      disposers.push(store.subscribe('activeThreadId', rebuild));
      disposers.push(store.subscribe('surfaceView', renderPanel));
      disposers.push(store.subscribe('goalView', refresh));
      function onData(evt) {
        if (!evt) return;
        if (evt.type === 'threads-changed' || evt.type === 'restarted' ||
            evt.type === 'message-added' || evt.type === 'questionnaire-resolved') refresh();
      }
      ctx.on('data', onData);
      disposers.push(function () { ctx.off('data', onData); });
      // width changes flip the narrow breakpoint -> re-apply layout classes
      function onEnv() {
        var nowNarrow = (ctx.env && ctx.env.width != null) ? ctx.env.width < NARROW : false;
        if (nowNarrow === narrow) return;
        narrow = nowNarrow;
        paintLayout();
      }
      ctx.on('env', onEnv);
      disposers.push(function () { ctx.off('env', onEnv); });

      /* ---- boot + teardown ------------------------------------------------ */
      rebuild();

      function unmount() {
        if (unmounted) return;
        unmounted = true;
        unmountSurface();
        disposers.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
        disposers = [];
        try { if (headerEl.unmount) headerEl.unmount(); } catch (e) { /* ignore */ }
        try { lensHost.unmount(); } catch (e) { /* ignore */ }
        try { if (historyEl.unmount) historyEl.unmount(); } catch (e) { /* ignore */ }
        root.remove();
      }

      return { unmount: unmount };
    }
  });
})();
