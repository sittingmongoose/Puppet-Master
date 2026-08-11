/* ============================================================================
   Kimi K3 — W5 Console Footer (chat-window concept).

   Standard kit header; thread slot; composer. ABOVE the composer sits a
   console status strip — a single line (goal status \u00b7 todo n/m \u00b7
   working summary) that expands UPWARD into a console panel holding a
   pinnable Chats section (kit historyPanel) and all the kit work surfaces
   (goal / todo / work chips). The strip stays pinned at the bottom of the
   footer; the panel (a k3-acc region) grows upward into the transcript area.
   Open state persists per thread in surfaceView.<tid>.w5ConsoleOpen; the
   Chats pin persists in surfaceView.<tid>.w5HistoryPinned (when pinned the
   console stays open on the Chats section).

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

  function humanizeGoalStatus(status) {
    var k = String(status || '').toLowerCase();
    if (k === 'running') return 'Running';
    if (k === 'paused') return 'Paused';
    if (k === 'blocked') return 'Blocked';
    if (k === 'stopped') return 'Stopped';
    if (k === 'completed' || k === 'complete') return 'Complete';
    if (k === 'replanning') return 'Replanning';
    return k ? k.charAt(0).toUpperCase() + k.slice(1) : 'Active';
  }

  window.K3.registerWindow('w5', {
    meta: {
      id: 'w5',
      name: 'Console Footer',
      blurb: 'A one-line console strip above the composer (goal \u00b7 todo \u00b7 work) expands upward into a full console panel holding every work surface.'
    },
    mount: function (hostEl, ctx) {
      var kit = window.K3WindowKit;
      var store = ctx.store;
      var data = ctx.data;
      var disposers = [];
      var surfaceNodes = [];
      var mountedSig = '';
      var currentTid = null;
      var unmounted = false;

      /* ---- skeleton ------------------------------------------------------ */
      var root = el('section', 'w5-root');
      root.setAttribute('data-k3-window', 'w5');

      var main = el('div', 'w5-main');

      var headerEl = kit.header(ctx);
      main.appendChild(headerEl);

      var lensHost = kit.lensBannerHost(ctx);
      main.appendChild(lensHost.element);

      var threadSlot = el('div', 'w5-thread');
      threadSlot.setAttribute('data-k3-slot', 'thread');
      main.appendChild(threadSlot);

      // console footer: panel (expands upward) sits above the strip. The
      // whole footer is a flex column with the strip pinned at the bottom;
      // the k3-acc panel grows upward into the thread area as it opens.
      var footer = el('div', 'w5-footer');
      footer.hidden = true;

      var consoleAcc = el('div', 'k3-acc w5-console-acc');
      var consoleAccIn = el('div', 'k3-acc-in');
      var consoleBody = el('div', 'w5-console-body k3-scroll');

      // Chats section (always present at the top of the console body). Has a
      // header with a pin toggle; the persistent kit.historyPanel lives inside.
      var chatsSection = el('section', 'w5-chats');
      var chatsHead = el('div', 'w5-chats-head');
      var chatsTitle = el('span', 'w5-chats-title', 'Chats');
      var chatsPin = el('button', 'k3-icon-btn w5-chats-pin');
      chatsPin.type = 'button';
      chatsPin.setAttribute('aria-pressed', 'false');
      chatsPin.setAttribute('aria-label', 'Pin chats');
      chatsPin.title = 'Pin chats';
      chatsPin.setAttribute('data-testid', 'w5-history-pin');
      chatsPin.appendChild(icon('pin'));
      chatsHead.appendChild(chatsTitle);
      chatsHead.appendChild(chatsPin);
      var historyEl = kit.historyPanel(ctx);
      historyEl.classList.add('w5-chats-history');
      chatsSection.appendChild(chatsHead);
      chatsSection.appendChild(historyEl);
      consoleBody.appendChild(chatsSection);

      consoleAccIn.appendChild(consoleBody);
      consoleAcc.appendChild(consoleAccIn);
      footer.appendChild(consoleAcc);

      var strip = el('button', 'w5-strip');
      strip.type = 'button';
      strip.setAttribute('aria-expanded', 'false');
      var stripIc = el('span', 'w5-strip-ic');
      stripIc.appendChild(icon('activity'));
      var stripSummary = el('span', 'w5-strip-summary');
      var stripChev = el('span', 'w5-strip-chev');
      stripChev.appendChild(icon('chevron-down'));
      strip.appendChild(stripIc);
      strip.appendChild(el('span', 'w5-strip-label', 'Console'));
      strip.appendChild(stripSummary);
      strip.appendChild(stripChev);
      footer.appendChild(strip);

      main.appendChild(footer);

      var composerSlot = el('div', 'w5-composer');
      composerSlot.setAttribute('data-k3-slot', 'composer');
      main.appendChild(composerSlot);

      root.appendChild(main);
      hostEl.appendChild(root);

      /* ---- presence + summary ------------------------------------------- */
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
      function summaryOf(p, tid) {
        var parts = [];
        if (p.goal) {
          var g = data.thread(tid) && data.thread(tid).activeGoal;
          parts.push('Goal: ' + humanizeGoalStatus(g.status));
        }
        if (p.todo) parts.push('Todo ' + p.todoDone + '/' + p.todoTotal);
        if (p.agents) parts.push(p.agents + (p.agents === 1 ? ' agent' : ' agents'));
        if (p.files) parts.push(p.files + (p.files === 1 ? ' file' : ' files'));
        return parts.join(' \u00b7 ');
      }

      /* ---- surfaces ------------------------------------------------------ */
      function unmountSurfaces() {
        surfaceNodes.forEach(function (n) {
          try { if (n && n.unmount) n.unmount(); } catch (e) { /* ignore */ }
          if (n && n.parentNode) n.parentNode.removeChild(n);
        });
        surfaceNodes = [];
        mountedSig = '';
      }

      function buildSurfaces(tid) {
        unmountSurfaces();
        var p = presence(tid);
        if (p.goal) {
          var g = kit.goalSurface(ctx, tid);
          if (g) surfaceNodes.push(g);
        }
        if (p.todo) {
          var td = kit.todoSurface(ctx, tid);
          if (td) surfaceNodes.push(td);
        }
        if (p.chips) {
          var c = kit.workChips(ctx, tid);
          if (c) surfaceNodes.push(c);
        }
        // work surfaces append AFTER the (always-present) chats section so the
        // persistent history element is never destroyed by a rebuild.
        surfaceNodes.forEach(function (n) { consoleBody.appendChild(n); });
        mountedSig = kindsOf(presence(tid));
      }

      function consoleOpen() {
        // pinned Chats forces the console open on the Chats section
        return store.get('surfaceView.' + currentTid + '.w5ConsoleOpen', false) === true ||
               store.get('surfaceView.' + currentTid + '.w5HistoryPinned', false) === true;
      }
      function historyPinned() {
        return store.get('surfaceView.' + currentTid + '.w5HistoryPinned', false) === true;
      }
      function paintPin() {
        var pinned = historyPinned();
        chatsPin.setAttribute('aria-pressed', pinned ? 'true' : 'false');
        chatsPin.classList.toggle('is-pinned', pinned);
        chatsPin.setAttribute('aria-label', pinned ? 'Unpin chats' : 'Pin chats');
        chatsPin.title = pinned ? 'Unpin chats' : 'Pin chats';
        chatsPin.innerHTML = '';
        chatsPin.appendChild(icon(pinned ? 'pin-off' : 'pin'));
      }
      chatsPin.addEventListener('click', function () {
        if (!currentTid) currentTid = store.get('activeThreadId', null);
        store.set('surfaceView.' + currentTid + '.w5HistoryPinned', !historyPinned());
      });

      function paint() {
        if (unmounted) return;
        var p = presence(currentTid);
        var hasWork = any(p);
        // the footer is always visible now (the Chats section is always present)
        footer.hidden = false;
        stripSummary.textContent = hasWork ? summaryOf(p, currentTid) : 'Chats';
        var open = consoleOpen();
        consoleAcc.classList.toggle('is-open', open);
        strip.setAttribute('aria-expanded', open ? 'true' : 'false');
        paintPin();
      }

      function rebuild() {
        currentTid = store.get('activeThreadId', null);
        buildSurfaces(currentTid);
        paint();
      }

      function refresh() {
        if (unmounted) return;
        if (!currentTid) { rebuild(); return; }
        var sig = kindsOf(presence(currentTid));
        if (sig !== mountedSig) buildSurfaces(currentTid);
        paint();
      }

      strip.addEventListener('click', function () {
        if (!currentTid) return;
        store.set('surfaceView.' + currentTid + '.w5ConsoleOpen', !consoleOpen());
      });

      /* ---- wiring --------------------------------------------------------- */
      disposers.push(store.subscribe('activeThreadId', rebuild));
      disposers.push(store.subscribe('surfaceView', paint));
      disposers.push(store.subscribe('goalView', refresh));
      function onData(evt) {
        if (!evt) return;
        if (evt.type === 'threads-changed' || evt.type === 'restarted' ||
            evt.type === 'message-added' || evt.type === 'questionnaire-resolved') refresh();
      }
      ctx.on('data', onData);
      disposers.push(function () { ctx.off('data', onData); });

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
