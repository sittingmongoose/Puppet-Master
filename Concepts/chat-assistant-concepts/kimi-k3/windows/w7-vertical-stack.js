/* ============================================================================
   Kimi K3 — W7 Vertical Stack (chat-window concept).

   Strict single column, never any side columns: kit header, lens banner,
   a pinnable Chats band (history; default collapsed), then goalSurface
   as a full-width band, then todoSurface as a full-width band, then the
   thread slot (flex 1), then the composer. Each work band snaps in/out via
   a k3-acc region: the band is present (accordion open) only when its data
   exists, and collapses away otherwise. This is the zero-width-pressure
   host -- the simplest layout.

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

  window.K3.registerWindow('w7', {
    meta: {
      id: 'w7',
      name: 'Vertical Stack',
      blurb: 'Strict single column: header, a pinnable Chats band, then Goal and Todo as full-width bands that snap in and out, then the transcript, then the composer. The simplest layout \u2014 no side columns ever.'
    },
    mount: function (hostEl, ctx) {
      var kit = window.K3WindowKit;
      var store = ctx.store;
      var data = ctx.data;
      var disposers = [];
      var currentTid = null;
      var goalNode = null;
      var todoNode = null;
      var historyEl = null;      // persistent kit.historyPanel element
      var unmounted = false;

      /* ---- skeleton ------------------------------------------------------ */
      var root = el('section', 'w7-root');
      root.setAttribute('data-k3-window', 'w7');

      var main = el('div', 'w7-main');

      var headerEl = kit.header(ctx);
      main.appendChild(headerEl);

      var lensHost = kit.lensBannerHost(ctx);
      main.appendChild(lensHost.element);

      // Chats band: pinnable history. The header (toggle + pin) is always
      // visible; only the body is a k3-acc region that collapses. Default
      // collapsed so it does not crowd the narrow column. The kit.historyPanel
      // element is created ONCE and kept mounted (hidden when collapsed) so its
      // state survives.
      var chatsBand = el('div', 'w7-band w7-band-chats');
      var chatsHead = el('div', 'w7-chats-head');
      var chatsToggle = el('button', 'w7-chats-toggle');
      chatsToggle.type = 'button';
      chatsToggle.setAttribute('aria-expanded', 'false');
      var chatsToggleText = el('span', 'w7-chats-toggle-text', 'Chats');
      var chatsToggleChev = el('span', 'w7-chats-toggle-chev');
      chatsToggleChev.appendChild(icon('chevron-down'));
      chatsToggle.appendChild(chatsToggleText);
      chatsToggle.appendChild(chatsToggleChev);
      var chatsPin = el('button', 'k3-icon-btn w7-chats-pin');
      chatsPin.type = 'button';
      chatsPin.setAttribute('aria-pressed', 'false');
      chatsPin.setAttribute('aria-label', 'Pin chats');
      chatsPin.title = 'Pin chats';
      chatsPin.setAttribute('data-testid', 'w7-history-pin');
      chatsPin.appendChild(icon('pin'));
      chatsHead.appendChild(chatsToggle);
      chatsHead.appendChild(chatsPin);
      // the collapsing region wraps only the body (header stays visible)
      var chatsAcc = el('div', 'k3-acc w7-chats-acc');
      var chatsBandIn = el('div', 'k3-acc-in');
      var chatsBandBody = el('div', 'w7-band-body w7-chats-body');
      chatsBandIn.appendChild(chatsBandBody);
      chatsAcc.appendChild(chatsBandIn);
      chatsBand.appendChild(chatsHead);
      chatsBand.appendChild(chatsAcc);
      main.appendChild(chatsBand);

      // create the persistent history element ONCE; it lives in chatsBandBody
      historyEl = kit.historyPanel(ctx);
      historyEl.classList.add('w7-chats-history');
      chatsBandBody.appendChild(historyEl);

      // ops band (k3-acc): compact operational conflicts — leads the stack
      var opsBand = el('div', 'k3-acc w7-band w7-band-ops');
      var opsBandIn = el('div', 'k3-acc-in');
      var opsBandBody = el('div', 'w7-band-body');
      opsBandIn.appendChild(opsBandBody);
      opsBand.appendChild(opsBandIn);
      main.appendChild(opsBand);

      // goal band (k3-acc): open only when a goal surface exists
      var goalBand = el('div', 'k3-acc w7-band w7-band-goal');
      var goalBandIn = el('div', 'k3-acc-in');
      var goalBandBody = el('div', 'w7-band-body');
      goalBandIn.appendChild(goalBandBody);
      goalBand.appendChild(goalBandIn);
      main.appendChild(goalBand);

      // todo band (k3-acc): open only when a todo surface exists
      var todoBand = el('div', 'k3-acc w7-band w7-band-todo');
      var todoBandIn = el('div', 'k3-acc-in');
      var todoBandBody = el('div', 'w7-band-body');
      todoBandBody.className = 'w7-band-body';
      todoBandIn.appendChild(todoBandBody);
      todoBand.appendChild(todoBandIn);
      main.appendChild(todoBand);

      // capacity + crew bands (k3-acc): forecast / crew roster
      var capBand = el('div', 'k3-acc w7-band w7-band-capacity');
      var capBandIn = el('div', 'k3-acc-in');
      var capBandBody = el('div', 'w7-band-body');
      capBandIn.appendChild(capBandBody);
      capBand.appendChild(capBandIn);
      main.appendChild(capBand);

      var crewBand = el('div', 'k3-acc w7-band w7-band-crew');
      var crewBandIn = el('div', 'k3-acc-in');
      var crewBandBody = el('div', 'w7-band-body');
      crewBandIn.appendChild(crewBandBody);
      crewBand.appendChild(crewBandIn);
      main.appendChild(crewBand);

      // Artifact bay: w7's zero-side-column answer to the artifact workspace —
      // a full-width in-flow snap band (the packet's "a stack" approach) between
      // the work bands and the transcript. Collapsible; capped so the
      // transcript keeps a 180px floor. Header (toggle) always visible when an
      // artifact is open; the shared surface node is reparented, never cloned.
      var artBay = el('div', 'w7-band w7-band-artbay');
      artBay.setAttribute('data-testid', 'w7-artbay');
      var artHead = el('div', 'w7-artbay-head');
      var artToggle = el('button', 'w7-artbay-toggle');
      artToggle.type = 'button';
      artToggle.setAttribute('aria-expanded', 'true');
      var artToggleText = el('span', 'w7-artbay-toggle-text', 'Artifact');
      var artToggleChev = el('span', 'w7-artbay-toggle-chev');
      artToggleChev.appendChild(icon('chevron-down'));
      artToggle.appendChild(artToggleText);
      artToggle.appendChild(artToggleChev);
      var artClose = el('button', 'k3-icon-btn w7-artbay-close');
      artClose.type = 'button';
      artClose.setAttribute('aria-label', 'Close artifact');
      artClose.title = 'Close artifact';
      artClose.appendChild(icon('close'));
      artHead.appendChild(artToggle);
      artHead.appendChild(artClose);
      var artAcc = el('div', 'k3-acc w7-artbay-acc is-open');
      var artAccIn = el('div', 'k3-acc-in');
      var artBody = el('div', 'w7-artbay-body');
      artAccIn.appendChild(artBody);
      artAcc.appendChild(artAccIn);
      artBay.appendChild(artHead);
      artBay.appendChild(artAcc);
      artBay.hidden = true;
      main.appendChild(artBay);
      var artSurface = window.K3ArtifactWS ? window.K3ArtifactWS.surface(ctx) : null;

      var threadSlot = el('div', 'w7-thread');
      threadSlot.setAttribute('data-k3-slot', 'thread');
      main.appendChild(threadSlot);

      var composerSlot = el('div', 'w7-composer');
      composerSlot.setAttribute('data-k3-slot', 'composer');
      main.appendChild(composerSlot);

      root.appendChild(main);
      hostEl.appendChild(root);

      /* ---- presence ------------------------------------------------------ */
      function hasGoal(tid) {
        var t = tid ? data.thread(tid) : null;
        return !!(t && t.activeGoal && !store.get('goalView.' + tid + '.cleared', false));
      }
      function hasTodo(tid) {
        var t = tid ? data.thread(tid) : null;
        return !!(t && t.todo && arr(t.todo.items).length);
      }
      function hasOps(tid) {
        if (!tid || !window.K3Work || !window.K3Work.opsSummary) return false;
        var s = window.K3Work.opsSummary(tid);
        return !!(s && arr(s.conflicts).filter(function (c) { return c.state !== 'resolved'; }).length);
      }
      function hasCapacity(tid) {
        var t = tid ? data.thread(tid) : null;
        return !!(t && t.capacityForecast);
      }
      function hasCrew(tid) {
        var t = tid ? data.thread(tid) : null;
        return !!(t && t.crew);
      }
      function artOpen() {
        return currentTid ? store.get('artifactWs.' + currentTid + '.open', false) === true : false;
      }

      /* ---- Chats band (history) ----------------------------------------- */
      // The Chats band is always in the DOM; its open + pin state persist per
      // thread. Default collapsed so the narrow column is not crowded.
      function chatsOpen() {
        return store.get('surfaceView.' + currentTid + '.w7ChatsOpen', false) === true;
      }
      function chatsPinned() {
        return store.get('surfaceView.' + currentTid + '.w7HistoryPinned', false) === true;
      }
      function paintChats() {
        var open = chatsOpen() || chatsPinned(); // pinned forces open
        chatsAcc.classList.toggle('is-open', open);
        chatsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        // the persistent history element stays mounted inside the k3-acc; the
        // grid 0fr collapse (overflow:hidden on .k3-acc-in) hides it without
        // destroying it, so state survives across collapse/expand.
        var pinned = chatsPinned();
        // the band gains a pinned class so CSS can cap its body height (so a
        // pinned Chats band can never starve the transcript below it).
        chatsBand.classList.toggle('is-pinned', pinned);
        chatsPin.setAttribute('aria-pressed', pinned ? 'true' : 'false');
        chatsPin.classList.toggle('is-pinned', pinned);
        chatsPin.setAttribute('aria-label', pinned ? 'Unpin chats' : 'Pin chats');
        chatsPin.title = pinned ? 'Unpin chats' : 'Pin chats';
        chatsPin.innerHTML = '';
        chatsPin.appendChild(icon(pinned ? 'pin-off' : 'pin'));
      }
      chatsToggle.addEventListener('click', function () {
        if (!currentTid) currentTid = store.get('activeThreadId', null);
        if (!currentTid) return; // never write surfaceView.null.*
        store.set('surfaceView.' + currentTid + '.w7ChatsOpen', !chatsOpen());
      });
      chatsPin.addEventListener('click', function () {
        if (!currentTid) currentTid = store.get('activeThreadId', null);
        if (!currentTid) return;
        store.set('surfaceView.' + currentTid + '.w7HistoryPinned', !chatsPinned());
      });

      /* ---- bands --------------------------------------------------------- */
      var opsNode = null, capNode = null, crewNode = null;
      function unmountBands() {
        [goalNode, todoNode, opsNode, capNode, crewNode].forEach(function (n) {
          if (n) { try { if (n.unmount) n.unmount(); } catch (e) { /* ignore */ } }
        });
        goalNode = null;
        todoNode = null;
        opsNode = null;
        capNode = null;
        crewNode = null;
        goalBandBody.innerHTML = '';
        todoBandBody.innerHTML = '';
        opsBandBody.innerHTML = '';
        capBandBody.innerHTML = '';
        crewBandBody.innerHTML = '';
      }

      function rebuild() {
        unmountBands();
        currentTid = store.get('activeThreadId', null);

        var o = hasOps(currentTid);
        if (o && kit.opsSurface) {
          opsNode = kit.opsSurface(ctx, currentTid);
          if (opsNode) opsBandBody.appendChild(opsNode);
        }
        opsBand.classList.toggle('is-open', !!(opsNode && o));

        var g = hasGoal(currentTid);
        if (g) {
          goalNode = kit.goalSurface(ctx, currentTid);
          if (goalNode) goalBandBody.appendChild(goalNode);
        }
        goalBand.classList.toggle('is-open', !!(goalNode && g));

        var t = hasTodo(currentTid);
        if (t) {
          todoNode = kit.todoSurface(ctx, currentTid);
          if (todoNode) todoBandBody.appendChild(todoNode);
        }
        todoBand.classList.toggle('is-open', !!(todoNode && t));

        var cp = hasCapacity(currentTid);
        if (cp && kit.capacitySurface) {
          capNode = kit.capacitySurface(ctx, currentTid);
          if (capNode) capBandBody.appendChild(capNode);
        }
        capBand.classList.toggle('is-open', !!(capNode && cp));

        var cw = hasCrew(currentTid);
        if (cw && kit.crewSurface) {
          crewNode = kit.crewSurface(ctx, currentTid);
          if (crewNode) crewBandBody.appendChild(crewNode);
        }
        crewBand.classList.toggle('is-open', !!(crewNode && cw));

        paintArtBay();
        paintChats();
      }

      function refresh() {
        if (unmounted) return;
        if (!currentTid) { rebuild(); return; }
        // rebuild only when a band's presence flips; otherwise the surfaces
        // are already live and self-updating.
        if (hasGoal(currentTid) !== !!goalNode ||
            hasTodo(currentTid) !== !!todoNode ||
            hasOps(currentTid) !== !!opsNode ||
            hasCapacity(currentTid) !== !!capNode ||
            hasCrew(currentTid) !== !!crewNode) rebuild();
      }

      /* ---- artifact bay ---------------------------------------------------- */
      function paintArtBay() {
        var open = artOpen();
        artBay.hidden = !open;
        if (!open || !artSurface) return;
        var t = data.thread(currentTid);
        var ws = store.get('artifactWs.' + currentTid, null);
        var active = ws && ws.activeId;
        var title = 'Artifact';
        if (t && active) {
          arr(t.artifacts).forEach(function (a) { if (a.id === active) title = a.title || a.id; });
        }
        artToggleText.textContent = title;
        var collapsed = store.get('surfaceView.' + currentTid + '.w7ArtBayCollapsed', false) === true;
        artAcc.classList.toggle('is-open', !collapsed);
        artToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        if (artSurface.parentNode !== artBody) artBody.appendChild(artSurface);
      }
      artToggle.addEventListener('click', function () {
        if (!currentTid) return;
        store.set('surfaceView.' + currentTid + '.w7ArtBayCollapsed',
          !(store.get('surfaceView.' + currentTid + '.w7ArtBayCollapsed', false)));
        paintArtBay(); // surfaceView subs feed paintChats only; repaint the bay directly
      });
      artClose.addEventListener('click', function () {
        if (currentTid && window.K3ArtifactWS) window.K3ArtifactWS.close(ctx, currentTid);
      });
      disposers.push(store.subscribe('artifactWs', paintArtBay));

      /* ---- wiring --------------------------------------------------------- */
      disposers.push(store.subscribe('activeThreadId', rebuild));
      disposers.push(store.subscribe('goalView', refresh));
      disposers.push(store.subscribe('surfaceView', paintChats)); // pin/open toggles
      function onData(evt) {
        if (!evt) return;
        if (evt.type === 'threads-changed' || evt.type === 'restarted' ||
            evt.type === 'message-added' || evt.type === 'questionnaire-resolved' ||
            evt.type === 'ops-conflict' || evt.type === 'capacity-changed' ||
            evt.type === 'crew-changed') refresh();
        else if (evt.type === 'artifact-ws-changed') paintArtBay();
      }
      ctx.on('data', onData);
      disposers.push(function () { ctx.off('data', onData); });

      /* ---- boot + teardown ------------------------------------------------ */
      rebuild();

      function unmount() {
        if (unmounted) return;
        unmounted = true;
        unmountBands();
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
