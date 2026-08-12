/* ============================================================================
   Kimi K3 — W3 Dock Tabs (chat-window concept).

   Standard kit header at top; thread slot fills the body; composer at the
   bottom. ABOVE the composer sits a tabbed dock: a pinnable Chats tab
   (kit historyPanel) in the first position, followed by one tab per work
   surface that currently has data (Goal / Todo / Agents / Diff / Activity /
   Ops / Capacity / Crew), each carrying a live count badge (e.g. "Todo 3/5",
   "Agents 2", "4 files", Ops = unresolved conflicts, Capacity = waves,
   Crew = running). Ops leads the packet-surface cluster. Selecting a tab
   reveals that surface in the pane. Tabs use surface backgrounds; the
   active tab = accent-soft + weight, never a left border. The open tab
   persists per thread in surfaceView.<tid>.w3Tab; the Chats pin persists
   in surfaceView.<tid>.w3HistoryPinned (when pinned the Chats tab is
   locked active and work-surface tabs cannot switch it away).

   Packet additions: the BSD token variant mirrors its detail into a slim
   strip at the bottom of the dock (K3BSD.detailHost, follows the active
   thread). The shared artifact workspace (K3ArtifactWS — ONE shared node,
   reparented never cloned) opens as a 280px left flex-sibling column
   (.w3-art-col) at >= 975px; below 975px the same node moves into a new
   "Artifacts" dock tab (auto-activated on open unless Chats is pinned).
   The Chats tab and its pin are unaffected by artifact state; no overlays.

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

  // tab definitions: kind, label, icon, presence predicate + badge text.
  var TAB_DEFS = [
    {
      kind: 'goal', label: 'Goal', icon: 'goal',
      present: function (p) { return p.goal; },
      badge: function (p, tid, data) {
        var g = data.thread(tid) && data.thread(tid).activeGoal;
        return g ? humanizeGoalStatus(g.status) : '';
      }
    },
    {
      kind: 'todo', label: 'Todo', icon: 'todo',
      present: function (p) { return p.todo; },
      badge: function (p) { return p.todoDone + '/' + p.todoTotal; }
    },
    {
      kind: 'agents', label: 'Agents', icon: 'subagent',
      present: function (p) { return p.agents > 0; },
      badge: function (p) { return String(p.agents); }
    },
    {
      kind: 'diff', label: 'Diff', icon: 'diff',
      present: function (p) { return p.files > 0; },
      badge: function (p) { return p.files + (p.files === 1 ? ' file' : ' files'); }
    },
    {
      kind: 'activity', label: 'Activity', icon: 'activity',
      present: function (p) { return p.activity; },
      badge: function (p) { return p.activity ? '' : ''; }
    },
    // packet surfaces — Ops leads this cluster (operational awareness is
    // the most urgent), then Capacity, then Crew.
    {
      kind: 'ops', label: 'Ops', icon: 'port',
      present: function (p) { return p.ops > 0; },
      badge: function (p) { return String(p.ops); }
    },
    {
      kind: 'capacity', label: 'Capacity', icon: 'capacity',
      present: function (p) { return p.capacity; },
      badge: function (p) {
        return p.capacityWaves > 0
          ? p.capacityWaves + (p.capacityWaves === 1 ? ' wave' : ' waves')
          : '';
      }
    },
    {
      kind: 'crew', label: 'Crew', icon: 'crew',
      present: function (p) { return p.crew; },
      badge: function (p) { return p.crewRunning > 0 ? String(p.crewRunning) : ''; }
    },
    // narrow-width artifact fallback: present only while the workspace is
    // open and the window is below the left-column breakpoint.
    {
      kind: 'artifacts', label: 'Artifacts', icon: 'artifact',
      present: function (p) { return p.artOpen && p.artifacts > 0; },
      badge: function (p) { return String(p.artifacts); }
    }
  ];

  window.K3.registerWindow('w3', {
    meta: {
      id: 'w3',
      name: 'Dock Tabs',
      blurb: 'A tabbed dock above the composer surfaces Goal, Todo, Agents, Diff, and Activity — only the tabs with data, each with a live count.'
    },
    mount: function (hostEl, ctx) {
      var kit = window.K3WindowKit;
      var store = ctx.store;
      var data = ctx.data;
      var disposers = [];
      var currentTid = null;
      var surfaceNode = null;     // the single live kit element shown in the pane
      var mountedKind = null;     // kind of surfaceNode currently mounted
      var historyEl = null;       // persistent kit.historyPanel element
      var artNode = null;         // THE shared K3ArtifactWS surface (reparent, never clone)
      var bsdHost = null;         // K3BSD.detailHost strip (token variant mirror)
      var wideMode = false;       // root width >= 975px: artifact renders as a left column
      var unmounted = false;

      /* ---- skeleton ------------------------------------------------------ */
      var root = el('section', 'w3-root');
      root.setAttribute('data-k3-window', 'w3');

      // artifact workspace column: a left flex sibling of the main column,
      // shown only at >= 975px while the workspace is open for the active
      // thread (below that the same node moves into the Artifacts dock tab).
      var artCol = el('div', 'w3-art-col');
      artCol.setAttribute('data-testid', 'w3-art-col');
      artCol.hidden = true;
      root.appendChild(artCol);

      var main = el('div', 'w3-main');

      var headerEl = kit.header(ctx);
      main.appendChild(headerEl);

      var lensHost = kit.lensBannerHost(ctx);
      main.appendChild(lensHost.element);

      // thread slot (flex 1)
      var threadSlot = el('div', 'w3-thread');
      threadSlot.setAttribute('data-k3-slot', 'thread');
      main.appendChild(threadSlot);

      // dock: tab strip + pane (above the composer)
      var dock = el('div', 'w3-dock');
      var tabs = el('div', 'w3-tabs');
      tabs.setAttribute('role', 'tablist');
      tabs.setAttribute('aria-label', 'Chats and work surfaces');
      var pane = el('div', 'w3-pane');
      pane.setAttribute('role', 'tabpanel');
      var paneBody = el('div', 'w3-pane-body k3-scroll');
      pane.appendChild(paneBody);
      dock.appendChild(tabs);
      dock.appendChild(pane);

      // BSD token variant: the selector-row token stays compact; its full
      // detail is mirrored into this slim strip at the bottom of the dock.
      // threadId null = the host follows the active thread itself.
      if (window.K3BSD && typeof window.K3BSD.detailHost === 'function') {
        bsdHost = window.K3BSD.detailHost(ctx, null);
        bsdHost.classList.add('w3-bsd-host');
        dock.appendChild(bsdHost);
      }
      main.appendChild(dock);

      // create the persistent history element ONCE; it lives in paneBody
      // (shown/hidden via `hidden` depending on whether Chats is active).
      historyEl = kit.historyPanel(ctx);
      historyEl.classList.add('w3-pane-history');
      historyEl.hidden = true;
      paneBody.appendChild(historyEl);

      // THE shared artifact surface: created once, lives in paneBody below
      // the breakpoint (Artifacts dock tab); reparented into .w3-art-col at
      // >= 975px. Never cloned, never unmounted by tab swaps.
      artNode = window.K3ArtifactWS ? window.K3ArtifactWS.surface(ctx) : null;
      if (artNode) {
        artNode.hidden = true;
        paneBody.appendChild(artNode);
      }
      wideMode = ctx.env.width >= 975;

      // composer slot
      var composerSlot = el('div', 'w3-composer');
      composerSlot.setAttribute('data-k3-slot', 'composer');
      main.appendChild(composerSlot);

      root.appendChild(main);
      hostEl.appendChild(root);

      /* ---- presence (goal/todo/agents/diff/activity) --------------------- */
      function presence(tid) {
        var t = tid ? data.thread(tid) : null;
        var p = { goal: false, todo: false, agents: 0, files: 0, activity: false,
                  todoDone: 0, todoTotal: 0, ops: 0, capacity: false, capacityWaves: 0,
                  crew: false, crewRunning: 0, artifacts: 0, artOpen: false };
        if (!t) return p;
        if (t.activeGoal && !store.get('goalView.' + tid + '.cleared', false)) p.goal = true;
        var items = t.todo && arr(t.todo.items);
        if (items && items.length) {
          p.todo = true;
          p.todoTotal = items.length;
          p.todoDone = items.filter(function (i) { return String(i.state).toLowerCase() === 'complete'; }).length;
        }
        arr(t.subagentGroups).forEach(function (g) { p.agents += arr(g.agents).length; });
        arr(t.diffGroups).forEach(function (g) { p.files += arr(g.files).length; });
        p.activity = arr(t.messages).some(function (m) { return !!m.activityGroup; });
        if (window.K3Work && window.K3Work.opsSummary) {
          var s = window.K3Work.opsSummary(tid);
          p.ops = s ? arr(s.conflicts).filter(function (c) { return c.state !== 'resolved'; }).length : 0;
        }
        p.capacity = !!t.capacityForecast;
        p.capacityWaves = t.capacityForecast ? (t.capacityForecast.waves || 0) : 0;
        p.crew = !!t.crew;
        p.crewRunning = t.crew
          ? arr(t.crew.members).filter(function (m) { return String(m.status) !== 'queued'; }).length
          : 0;
        p.artifacts = arr(t.artifacts).length;
        p.artOpen = !wideMode && store.get('artifactWs.' + tid + '.open', false) === true;
        return p;
      }

      // count of threads that need attention (questionnaire pending OR
      // blocked/paused/awaiting-question). Drives the Chats tab badge + dot.
      function attentionCount() {
        var n = 0;
        try {
          data.listThreads().forEach(function (t) {
            if (t && t.archived) return;
            var st = String(t && t.threadState || '').toLowerCase().replace(/[\s_]+/g, '-');
            if ((t.questionnairePending | 0) > 0 ||
                st === 'blocked' || st === 'paused' || st === 'awaiting-question') {
              n++;
            }
          });
        } catch (e) { /* ignore */ }
        return n;
      }

      /* ---- Chats pin ----------------------------------------------------- */
      function historyPinned() {
        return store.get('surfaceView.' + currentTid + '.w3HistoryPinned', false) === true;
      }

      /* ---- surface management -------------------------------------------- */
      function unmountSurface() {
        if (surfaceNode) {
          try { if (surfaceNode.unmount) surfaceNode.unmount(); } catch (e) { /* ignore */ }
          if (surfaceNode.parentNode) surfaceNode.parentNode.removeChild(surfaceNode);
        }
        surfaceNode = null;
        mountedKind = null;
        // NOTE: do NOT clear paneBody.innerHTML — the persistent history
        // element lives in paneBody and must survive work-surface swaps.
      }

      function buildSurface(kind, tid) {
        if (kind === 'goal') return kit.goalSurface(ctx, tid);
        if (kind === 'todo') return kit.todoSurface(ctx, tid);
        if (kind === 'ops') return kit.opsSurface ? kit.opsSurface(ctx, tid) : null;
        if (kind === 'capacity') return kit.capacitySurface ? kit.capacitySurface(ctx, tid) : null;
        if (kind === 'crew') return kit.crewSurface ? kit.crewSurface(ctx, tid) : null;
        if (kind === 'agents' || kind === 'diff' || kind === 'activity') {
          // Agents / Diff / Activity all live in the work-chips surface; we
          // surface that one element for any of these tabs. Its chips already
          // cover all three.
          return kit.workChips(ctx, tid);
        }
        return null;
      }

      // Work-surface tabs whose data is present, in canonical order (excludes
      // the always-present Chats tab, which is rendered separately first).
      function availableKinds(tid) {
        var p = presence(tid);
        return TAB_DEFS.filter(function (d) { return d.present(p); }).map(function (d) { return d.kind; });
      }

      // The active kind is 'chats' OR a work kind. When the Chats pin is on,
      // the active pane is locked to 'chats' (work tabs cannot switch it).
      function activeTab(tid) {
        if (historyPinned()) return 'chats';
        var avail = availableKinds(tid);
        var stored = store.get('surfaceView.' + tid + '.w3Tab', null);
        if (stored === 'chats') return 'chats';
        if (stored && avail.indexOf(stored) !== -1) return stored;
        // default: show Chats (history) first so the dock always has content;
        // fall back to the first work tab only if the user previously had one.
        return avail.length && stored ? avail[0] : 'chats';
      }
      function setActiveTab(tid, kind) {
        if (!tid) return;
        // pin locks the pane to Chats: a work-tab click is ignored while pinned
        if (historyPinned() && kind !== 'chats') return;
        store.set('surfaceView.' + tid + '.w3Tab', kind);
      }

      /* ---- render: tabs + pane ------------------------------------------- */
      function renderTabs(tid) {
        tabs.innerHTML = '';
        var active = activeTab(tid);
        var attn = attentionCount();

        // Chats tab (always present, first position). Carries a pin toggle;
        // badge = attention count; a small live dot if any thread needs it.
        var chatsTab = el('div', 'w3-tab w3-tab-chats');
        chatsTab.setAttribute('data-kind', 'chats');
        var chatsBtn = el('button', 'w3-tab-main');
        chatsBtn.type = 'button';
        chatsBtn.setAttribute('role', 'tab');
        chatsBtn.setAttribute('aria-selected', (active === 'chats') ? 'true' : 'false');
        chatsBtn.tabIndex = (active === 'chats') ? 0 : -1;
        var chatsIc = el('span', 'w3-tab-ic');
        chatsIc.appendChild(icon('history'));
        if (attn > 0) {
          var dot = el('span', 'w3-chats-dot');
          dot.setAttribute('aria-hidden', 'true');
          chatsIc.appendChild(dot);
        }
        chatsBtn.appendChild(chatsIc);
        chatsBtn.appendChild(el('span', 'w3-tab-label', 'Chats'));
        if (attn > 0) {
          chatsBtn.appendChild(el('span', 'w3-tab-badge', String(attn)));
        }
        chatsBtn.addEventListener('click', function () { setActiveTab(tid, 'chats'); });
        chatsTab.appendChild(chatsBtn);
        // pin toggle button inside the Chats tab
        var pinBtn = el('button', 'k3-icon-btn w3-tab-pin');
        pinBtn.type = 'button';
        var pinned = historyPinned();
        pinBtn.setAttribute('aria-pressed', pinned ? 'true' : 'false');
        pinBtn.setAttribute('aria-label', pinned ? 'Unpin chats' : 'Pin chats');
        pinBtn.title = pinned ? 'Unpin chats' : 'Pin chats';
        pinBtn.setAttribute('data-testid', 'w3-history-pin');
        pinBtn.classList.toggle('is-pinned', pinned);
        pinBtn.appendChild(icon(pinned ? 'pin-off' : 'pin'));
        pinBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (!currentTid) currentTid = store.get('activeThreadId', null);
          if (!currentTid) return; // never write surfaceView.null.*
          store.set('surfaceView.' + currentTid + '.w3HistoryPinned', !historyPinned());
        });
        chatsTab.appendChild(pinBtn);
        tabs.appendChild(chatsTab);

        TAB_DEFS.forEach(function (def) {
          var p = presence(tid);
          if (!def.present(p)) return;
          var tab = el('button', 'w3-tab');
          tab.type = 'button';
          tab.setAttribute('role', 'tab');
          tab.setAttribute('data-kind', def.kind);
          tab.setAttribute('aria-selected', (def.kind === active) ? 'true' : 'false');
          tab.tabIndex = (def.kind === active) ? 0 : -1;
          var ic = el('span', 'w3-tab-ic');
          ic.appendChild(icon(def.icon));
          tab.appendChild(ic);
          tab.appendChild(el('span', 'w3-tab-label', def.label));
          var badgeText = def.badge(p, tid, data);
          if (badgeText) {
            tab.appendChild(el('span', 'w3-tab-badge', badgeText));
          }
          tab.addEventListener('click', function () {
            setActiveTab(tid, def.kind);
          });
          tabs.appendChild(tab);
        });
      }

      function renderPane(tid) {
        var active = activeTab(tid);

        // history visibility: shown iff Chats is the active pane. The element
        // stays mounted (just hidden) so its state survives tab switches.
        var isChats = active === 'chats';
        var isArt = active === 'artifacts';
        historyEl.hidden = !isChats;
        // the shared artifact surface behaves like the history element when it
        // rides the pane (narrow): hidden unless its tab is active
        if (artNode && artNode.parentNode === paneBody) artNode.hidden = !isArt;

        if (isChats || isArt) {
          // hide any work surface under the chats/artifacts pane
          if (surfaceNode) surfaceNode.hidden = true;
        } else {
          // (Re)mount the work surface only when the active kind changes; this
          // keeps DOM state (e.g. expanded sections) stable across badge repaints.
          if (surfaceNode) surfaceNode.hidden = false;
          if (active !== mountedKind) {
            unmountSurface();
            if (active) {
              surfaceNode = buildSurface(active, tid);
              if (surfaceNode) {
                mountedKind = active;
                paneBody.appendChild(surfaceNode);
              }
            }
          }
        }

        // mark the active tab visually (covers store-driven repaints too)
        Array.prototype.forEach.call(tabs.querySelectorAll('.w3-tab'), function (tab) {
          var on = tab.getAttribute('data-kind') === active;
          var btn = tab.matches('.w3-tab-chats') ? tab.querySelector('.w3-tab-main') : tab;
          if (btn) {
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
            btn.tabIndex = on ? 0 : -1;
          }
        });

        // after a tab render, refresh the overflow fade cues and bring the
        // active tab into view so it is never silently off-screen.
        if (typeof paintOverflow === 'function') {
          requestAnimationFrame(function () { scrollActiveIntoView(); });
        }
      }

      function rebuild() {
        unmountSurface();
        currentTid = store.get('activeThreadId', null);
        // the dock is always shown now (Chats tab is always present)
        dock.hidden = false;
        renderTabs(currentTid);
        renderPane(currentTid);
      }

      function refresh() {
        if (unmounted) return;
        if (!currentTid) { rebuild(); return; }
        renderTabs(currentTid);
        renderPane(currentTid);
      }

      /* ---- tab-strip overflow cues --------------------------------------- */
      // Toggle edge fade gradients + keep the active tab scrolled into view so
      // every tab is reachable even when the strip overflows at narrow widths.
      function paintOverflow() {
        if (unmounted) return;
        var sw = tabs.scrollWidth, cw = tabs.clientWidth, sl = tabs.scrollLeft;
        var overflows = sw > cw + 1;
        dock.classList.toggle('is-overflow-right', overflows && sl + cw < sw - 1);
        dock.classList.toggle('is-overflow-left', overflows && sl > 1);
      }
      function scrollActiveIntoView() {
        var active = tabs.querySelector('.w3-tab[aria-selected="true"], .w3-tab-chats .w3-tab-main[aria-selected="true"]');
        if (active && typeof active.scrollIntoView === 'function') {
          active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
        paintOverflow();
      }
      tabs.addEventListener('scroll', paintOverflow, { passive: true });

      /* ---- artifact column / pane placement ------------------------------- */
      function placeArt() {
        if (!artNode) return;
        var open = currentTid ? store.get('artifactWs.' + currentTid + '.open', false) === true : false;
        if (wideMode) {
          artCol.hidden = !open;
          root.classList.toggle('is-art-open', open);
          if (open && artNode.parentNode !== artCol) artCol.appendChild(artNode);
          artNode.hidden = !open;
        } else {
          artCol.hidden = true;
          root.classList.remove('is-art-open');
          if (artNode.parentNode !== paneBody) {
            artNode.hidden = true;
            paneBody.appendChild(artNode);
          }
        }
      }
      function onEnv(env) {
        var now = (env ? env.width : ctx.env.width) >= 975;
        if (now === wideMode) return;
        wideMode = now;
        placeArt();
        refresh();
      }
      ctx.on('env', onEnv);
      disposers.push(function () { ctx.off('env', onEnv); });

      /* ---- wiring --------------------------------------------------------- */
      disposers.push(store.subscribe('activeThreadId', rebuild));
      disposers.push(store.subscribe('surfaceView', refresh));
      disposers.push(store.subscribe('goalView', refresh));
      disposers.push(store.subscribe('artifactWs', function () { placeArt(); refresh(); }));
      function onData(evt) {
        if (!evt) return;
        if (evt.type === 'artifact-ws-changed') {
          placeArt();
          // narrow: opening an artifact switches the dock to the Artifacts tab
          if (!wideMode && currentTid &&
              store.get('artifactWs.' + currentTid + '.open', false) === true &&
              activeTab(currentTid) !== 'artifacts' && !historyPinned()) {
            store.set('surfaceView.' + currentTid + '.w3Tab', 'artifacts');
          }
          refresh();
          return;
        }
        if (evt.type === 'threads-changed' || evt.type === 'restarted' ||
            evt.type === 'message-added' || evt.type === 'questionnaire-resolved' ||
            evt.type === 'ops-conflict' || evt.type === 'capacity-changed' ||
            evt.type === 'crew-changed') refresh();
      }
      ctx.on('data', onData);
      disposers.push(function () { ctx.off('data', onData); });

      /* ---- boot + teardown ------------------------------------------------ */
      rebuild();
      placeArt();
      // keep the overflow fade cues live across host resizes (e.g. 520px) and
      // tab mutations; ResizeObserver is widely supported and degrades quietly.
      if (typeof ResizeObserver === 'function') {
        var ro = new ResizeObserver(function () { paintOverflow(); });
        ro.observe(tabs);
        disposers.push(function () { try { ro.disconnect(); } catch (e) { /* ignore */ } });
      }

      function unmount() {
        if (unmounted) return;
        unmounted = true;
        unmountSurface();
        try { if (bsdHost && bsdHost.unmount) bsdHost.unmount(); } catch (e) { /* ignore */ }
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
