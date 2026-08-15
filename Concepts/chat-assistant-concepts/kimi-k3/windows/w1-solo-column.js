/* ============================================================================
   Kimi K3 — W1 Solo Column (chat-window concept, the reference window).

   One vertical column: a top bar (history-drawer toggle + shared kit header),
   the Context Lens banner host, an expandable status strip (Goal / Todo /
   work-chip summaries expanding into the real kit surfaces via k3-acc), the
   thread slot (flex 1), and the composer slot. Thread history lives in an
   absolute left overlay drawer (slide-in transform + scrim + Esc,
   display:none while closed). A pin toggle on the drawer header keeps the
   drawer open alongside the chat with no scrim and no outside-click/Esc close
   (pin persists per thread in surfaceView.<tid>.w1HistoryPinned). Nothing
   side-by-side with the transcript by default — this is the minimum-width-first
   host.

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

  window.K3.registerWindow('w1', {
    meta: {
      id: 'w1',
      name: 'Solo Column',
      blurb: 'One centered conversation column; history in an overlay drawer; Goal, Todo, and work summaries in an expandable status strip.'
    },
    mount: function (hostEl, ctx) {
      var kit = window.K3WindowKit;
      var store = ctx.store;
      var data = ctx.data;
      var disposers = [];
      var surfaceNodes = [];
      var currentTid = null;
      var drawerOpen = false;
      var drawerHideTimer = null;
      var unmounted = false;

      /* ---- skeleton ------------------------------------------------------ */
      var root = el('section', 'w1-root');
      root.setAttribute('data-k3-window', 'w1');

      var main = el('div', 'w1-main');

      // top bar: drawer toggle + shared header chrome
      var topbar = el('div', 'w1-topbar');
      var drawerBtn = el('button', 'w1-drawer-btn k3-icon-btn');
      drawerBtn.type = 'button';
      drawerBtn.setAttribute('aria-label', 'Open chat history');
      drawerBtn.setAttribute('aria-expanded', 'false');
      drawerBtn.title = 'Chats';
      drawerBtn.appendChild(icon('menu'));
      var headerEl = kit.header(ctx);
      topbar.appendChild(drawerBtn);
      topbar.appendChild(headerEl);
      main.appendChild(topbar);

      // Context Lens banner (collapses to nothing while the lens is quiet)
      var lensHost = kit.lensBannerHost(ctx);
      main.appendChild(lensHost.element);

      // expandable status strip (Goal / Todo / work summaries -> real surfaces)
      var status = el('div', 'w1-status');
      status.hidden = true;
      var statusHead = el('button', 'w1-status-head');
      statusHead.type = 'button';
      statusHead.setAttribute('aria-expanded', 'false');
      var statusSummary = el('span', 'w1-status-summary');
      var statusChev = el('span', 'w1-status-chev');
      statusChev.appendChild(icon('chevron-down'));
      statusHead.appendChild(statusSummary);
      statusHead.appendChild(statusChev);
      var statusAcc = el('div', 'k3-acc w1-status-acc');
      var statusAccIn = el('div', 'k3-acc-in');
      var statusBody = el('div', 'w1-status-body');
      statusAccIn.appendChild(statusBody);
      statusAcc.appendChild(statusAccIn);
      status.appendChild(statusHead);
      status.appendChild(statusAcc);
      main.appendChild(status);

      // the two slots (filled by the host)
      var threadSlot = el('div', 'w1-thread');
      threadSlot.setAttribute('data-k3-slot', 'thread');
      main.appendChild(threadSlot);
      var composerSlot = el('div', 'w1-composer');
      composerSlot.setAttribute('data-k3-slot', 'composer');
      main.appendChild(composerSlot);

      root.appendChild(main);

      // history drawer + scrim (overlay; display:none while closed)
      var scrim = el('div', 'w1-scrim');
      var drawer = el('aside', 'w1-drawer');
      drawer.setAttribute('aria-label', 'Chat history');
      // drawer header bar: a pin toggle that, when pressed, keeps the drawer
      // open alongside the chat (no scrim, ignores outside-click/Esc close).
      var drawerHead = el('div', 'w1-drawer-head');
      // dock tabs [Chats · Artifacts] — one dock, tab-switched; the active
      // tab persists per thread in surfaceView.<tid>.w1DockTab.
      var dockTabs = el('div', 'w1-dock-tabs');
      dockTabs.setAttribute('role', 'tablist');
      dockTabs.setAttribute('aria-label', 'Dock content');
      var chatsTabBtn = el('button', 'w1-dock-tab');
      chatsTabBtn.type = 'button';
      chatsTabBtn.setAttribute('role', 'tab');
      chatsTabBtn.setAttribute('data-kind', 'chats');
      chatsTabBtn.setAttribute('data-testid', 'w1-dock-tab-chats');
      var chatsTabIc = el('span', 'w1-dock-tab-ic');
      chatsTabIc.appendChild(icon('history'));
      chatsTabBtn.appendChild(chatsTabIc);
      chatsTabBtn.appendChild(el('span', 'w1-dock-tab-label', 'Chats'));
      var artsTabBtn = el('button', 'w1-dock-tab');
      artsTabBtn.type = 'button';
      artsTabBtn.setAttribute('role', 'tab');
      artsTabBtn.setAttribute('data-kind', 'artifacts');
      artsTabBtn.setAttribute('data-testid', 'w1-dock-tab-artifacts');
      var artsTabIc = el('span', 'w1-dock-tab-ic');
      artsTabIc.appendChild(icon('artifact'));
      artsTabBtn.appendChild(artsTabIc);
      artsTabBtn.appendChild(el('span', 'w1-dock-tab-label', 'Artifacts'));
      dockTabs.appendChild(chatsTabBtn);
      dockTabs.appendChild(artsTabBtn);
      var drawerPin = el('button', 'k3-icon-btn w1-drawer-pin');
      drawerPin.type = 'button';
      drawerPin.setAttribute('aria-pressed', 'false');
      drawerPin.setAttribute('aria-label', 'Pin chat history');
      drawerPin.title = 'Pin chat history';
      drawerPin.setAttribute('data-testid', 'w1-history-pin');
      drawerPin.appendChild(icon('pin'));
      drawerHead.appendChild(dockTabs);
      drawerHead.appendChild(drawerPin);
      // one dock, two panes: Chats (history panel) and Artifacts (the shared
      // artifact workspace surface, reparented here — never cloned).
      var chatsPane = el('div', 'w1-dock-pane w1-dock-chats');
      var historyEl = kit.historyPanel(ctx);
      chatsPane.appendChild(historyEl);
      var artsPane = el('div', 'w1-dock-pane w1-dock-artifacts');
      var artifactSurfaceEl = window.K3ArtifactWS ? window.K3ArtifactWS.surface(ctx) : null;
      if (artifactSurfaceEl) artsPane.appendChild(artifactSurfaceEl);
      drawer.appendChild(drawerHead);
      drawer.appendChild(chatsPane);
      drawer.appendChild(artsPane);
      root.appendChild(scrim);
      root.appendChild(drawer);

      hostEl.appendChild(root);

      /* ---- status strip --------------------------------------------------- */
      function surfacesPresent(tid) {
        var t = tid ? data.thread(tid) : null;
        if (!t) return null;
        var parts = [];
        // ops conflicts lead the summary (packet: operational awareness first)
        var opsCount = 0;
        if (window.K3Work && window.K3Work.opsSummary) {
          var opsSum = window.K3Work.opsSummary(tid);
          opsCount = opsSum ? arr(opsSum.conflicts).length : 0;
        }
        if (opsCount) parts.push(opsCount + (opsCount === 1 ? ' ops conflict' : ' ops conflicts'));
        var goal = t.activeGoal;
        if (goal && !store.get('goalView.' + tid + '.cleared', false)) {
          parts.push('Goal: ' + humanizeGoalStatus(goal.status));
        }
        var todo = t.todo;
        if (todo && arr(todo.items).length) {
          var total = todo.items.length;
          var done = todo.items.filter(function (i) { return String(i.state).toLowerCase() === 'complete'; }).length;
          parts.push('Todo ' + done + '/' + total);
        }
        var agents = 0;
        arr(t.subagentGroups).forEach(function (g) { agents += arr(g.agents).length; });
        if (agents) parts.push(agents + (agents === 1 ? ' agent' : ' agents'));
        var files = 0;
        arr(t.diffGroups).forEach(function (g) { files += arr(g.files).length; });
        if (files) parts.push(files + (files === 1 ? ' file changed' : ' files changed'));
        if (t.capacityForecast) parts.push('Capacity forecast');
        if (t.crew) {
          var crewN = arr(t.crew.members).length;
          parts.push('Crew' + (crewN ? ' · ' + crewN + (crewN === 1 ? ' role' : ' roles') : ''));
        }
        return parts.length ? parts.join(' · ') : null;
      }

      function statusOpen() {
        return store.get('surfaceView.' + currentTid + '.w1StatusOpen', false) === true;
      }
      function paintStatus() {
        var open = statusOpen();
        statusAcc.classList.toggle('is-open', open);
        statusHead.setAttribute('aria-expanded', open ? 'true' : 'false');
      }

      function unmountSurfaces() {
        surfaceNodes.forEach(function (n) {
          try { if (n && n.unmount) n.unmount(); } catch (e) { /* ignore */ }
        });
        surfaceNodes = [];
        statusBody.innerHTML = '';
      }

      function rebuildStatus() {
        unmountSurfaces();
        currentTid = store.get('activeThreadId', null);
        var summary = surfacesPresent(currentTid);
        if (!summary) {
          status.hidden = true;
          return;
        }
        status.hidden = false;
        statusSummary.textContent = summary;
        // ops/approval conflicts lead; goal/todo follow; capacity/crew after;
        // work chips last (packet: operational awareness first).
        var nodes = [
          kit.opsSurface ? kit.opsSurface(ctx, currentTid) : null,
          kit.goalSurface(ctx, currentTid),
          kit.todoSurface(ctx, currentTid),
          kit.capacitySurface ? kit.capacitySurface(ctx, currentTid) : null,
          kit.crewSurface ? kit.crewSurface(ctx, currentTid) : null,
          kit.workChips(ctx, currentTid)
        ];
        nodes.forEach(function (n) {
          if (n) {
            surfaceNodes.push(n);
            statusBody.appendChild(n);
          }
        });
        paintStatus();
      }

      function refreshSummary() {
        if (unmounted) return;
        var summary = surfacesPresent(currentTid);
        if (!summary) status.hidden = true;
        else {
          status.hidden = false;
          statusSummary.textContent = summary;
        }
      }

      statusHead.addEventListener('click', function () {
        if (!currentTid) return;
        store.set('surfaceView.' + currentTid + '.w1StatusOpen', !statusOpen());
      });

      disposers.push(store.subscribe('activeThreadId', rebuildStatus));
      disposers.push(store.subscribe('surfaceView', function () {
        paintStatus();
        // pin turned on -> ensure the drawer opens; pin repaint reacts too
        if (drawerPinned() && !drawerOpen) openDrawer();
        else paintPin();
      }));
      disposers.push(store.subscribe('goalView', refreshSummary));
      function onData(evt) {
        if (!evt) return;
        if (evt.type === 'threads-changed' || evt.type === 'restarted') refreshSummary();
      }
      ctx.on('data', onData);
      disposers.push(function () { ctx.off('data', onData); });

      /* ---- history drawer -------------------------------------------------- */
      function drawerPinned() {
        return store.get('surfaceView.' + currentTid + '.w1HistoryPinned', false) === true;
      }
      function paintPin() {
        var pinned = drawerPinned();
        drawerPin.setAttribute('aria-pressed', pinned ? 'true' : 'false');
        drawerPin.classList.toggle('is-pinned', pinned);
        drawerPin.setAttribute('aria-label', pinned ? 'Unpin chat history' : 'Pin chat history');
        drawerPin.title = pinned ? 'Unpin chat history' : 'Pin chat history';
        drawerPin.innerHTML = '';
        drawerPin.appendChild(icon(pinned ? 'pin-off' : 'pin'));
        drawer.classList.toggle('is-pinned', pinned);
        // the root class reserves a left gutter on .w1-main so the pinned
        // drawer is a side column (transcript beside it), not an overlay.
        root.classList.toggle('is-drawer-pinned', pinned);
        // when pinned, hide the scrim entirely so the chat behind is interactive
        if (pinned) {
          scrim.classList.remove('is-open');
          scrim.style.display = 'none';
        }
      }
      drawerPin.addEventListener('click', function () {
        if (!currentTid) currentTid = store.get('activeThreadId', null);
        store.set('surfaceView.' + currentTid + '.w1HistoryPinned', !drawerPinned());
      });

      function onKeyCapture(e) {
        if (e.key === 'Escape' && drawerOpen && !drawerPinned()) {
          e.stopPropagation(); // an open menu's own capture Esc runs first
          closeDrawer();
        }
      }
      function openDrawer() {
        if (drawerOpen) return;
        drawerOpen = true;
        clearTimeout(drawerHideTimer);
        drawer.style.display = '';
        var pinned = drawerPinned();
        // scrim only shows when NOT pinned (pinned = no scrim, chat interactive)
        scrim.style.display = pinned ? 'none' : '';
        drawerBtn.setAttribute('aria-expanded', 'true');
        drawerBtn.setAttribute('aria-label', 'Close chat history');
        requestAnimationFrame(function () {
          drawer.classList.add('is-open');
          if (!pinned) scrim.classList.add('is-open');
        });
        document.addEventListener('keydown', onKeyCapture, true);
        paintPin();
      }
      function closeDrawer() {
        if (!drawerOpen) return;
        // a pinned drawer ignores outside-click/Esc close
        if (drawerPinned()) return;
        drawerOpen = false;
        document.removeEventListener('keydown', onKeyCapture, true);
        drawer.classList.remove('is-open');
        scrim.classList.remove('is-open');
        drawerBtn.setAttribute('aria-expanded', 'false');
        drawerBtn.setAttribute('aria-label', 'Open chat history');
        // display:none is the resting state; hide once the slide-out lands
        drawerHideTimer = setTimeout(function () {
          if (!drawerOpen) {
            drawer.style.display = 'none';
            scrim.style.display = 'none';
          }
        }, window.K3.motionReduced() ? 0 : 260);
      }
      drawerBtn.addEventListener('click', function () {
        if (drawerOpen) closeDrawer(); else openDrawer();
      });
      // outside-click closes only when not pinned
      scrim.addEventListener('click', function () { if (!drawerPinned()) closeDrawer(); });

      /* ---- dock tabs [Chats · Artifacts] ------------------------------------ */
      function dockTab() {
        if (!currentTid) return 'chats';
        return store.get('surfaceView.' + currentTid + '.w1DockTab', 'chats');
      }
      function paintDockTabs() {
        var tab = dockTab();
        [chatsTabBtn, artsTabBtn].forEach(function (b) {
          var on = b.getAttribute('data-kind') === tab;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        chatsPane.hidden = tab !== 'chats';
        artsPane.hidden = tab !== 'artifacts';
      }
      chatsTabBtn.addEventListener('click', function () {
        if (!currentTid) currentTid = store.get('activeThreadId', null);
        if (currentTid) store.set('surfaceView.' + currentTid + '.w1DockTab', 'chats');
      });
      artsTabBtn.addEventListener('click', function () {
        if (!currentTid) currentTid = store.get('activeThreadId', null);
        if (currentTid) store.set('surfaceView.' + currentTid + '.w1DockTab', 'artifacts');
      });
      disposers.push(store.subscribe('surfaceView', paintDockTabs));
      // artifact opened anywhere -> the dock pins open on the Artifacts tab
      function onArtifactWs(evt) {
        if (!evt || evt.type !== 'artifact-ws-changed') return;
        var tid = evt.threadId || currentTid;
        var ws = tid ? store.get('artifactWs.' + tid, null) : null;
        if (ws && ws.open) {
          if (tid && currentTid !== tid) return; // other thread's artifact
          store.set('surfaceView.' + tid + '.w1DockTab', 'artifacts');
          if (!drawerPinned()) store.set('surfaceView.' + tid + '.w1HistoryPinned', true);
          openDrawer();
          paintDockTabs();
        }
      }
      ctx.on('data', onArtifactWs);
      disposers.push(function () { ctx.off('data', onArtifactWs); });
      paintDockTabs();

      /* ---- boot + teardown --------------------------------------------------- */
      drawer.style.display = 'none';
      scrim.style.display = 'none';
      rebuildStatus();
      // restore a persisted pin across remounts (docked<->pop-out round-trip):
      // the subscribe handler only fires on CHANGES, so boot must re-apply.
      if (!currentTid) currentTid = store.get('activeThreadId', null);
      if (drawerPinned()) openDrawer();

      function unmount() {
        if (unmounted) return;
        unmounted = true;
        clearTimeout(drawerHideTimer);
        document.removeEventListener('keydown', onKeyCapture, true);
        unmountSurfaces();
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
