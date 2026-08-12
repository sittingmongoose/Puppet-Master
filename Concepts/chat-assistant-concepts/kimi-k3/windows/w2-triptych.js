/* ============================================================================
   Kimi K3 — W2 Triptych (chat-window concept, the width-pressure host).

   Three columns when there is room: a persistent history rail (left, ~170px,
   kit historyPanel), the transcript column, and a right-hand "inspector"
   column holding the work surfaces (ops conflicts lead, then capacity /
   crew / goal / todo / work chips). The inspector only exists at
   env.width >= 975; below that the SAME surface elements move (no rebuild —
   DOM state is carried) into a bottom drawer above the composer, toggled by
   a "Work" button (a k3-acc region, not an overlay). The flip happens live
   on 'env' changes; surfaces rebuild only when the active thread changes.

   Artifact workspace adapter (K3ArtifactWS, THE ONE shared surface —
   reparented, never cloned): at >= 975px the rail gains [Chats · Artifacts]
   tabs; the Artifacts tab hosts the surface and widens the rail 170 -> 300px
   (CSS .is-art, chat floor >= 420px at 975px total). Below 975px the surface
   rides the same move-the-node mechanics into the top of the Work drawer.
   Opening an artifact flips the tab / opens the drawer automatically; the
   Chats pane and history rail are otherwise untouched (tab/drawer switch
   only, per-thread keys w2RailTab / w2WorkOpen).

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

  function humanizeStatus(status) {
    var s = String(status || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Active';
  }

  window.K3.registerWindow('w2', {
    meta: {
      id: 'w2',
      name: 'Triptych',
      blurb: 'History rail, transcript, and a work inspector side by side; under 975px the inspector collapses into a Work drawer above the composer.'
    },
    mount: function (hostEl, ctx) {
      var kit = window.K3WindowKit;
      var store = ctx.store;
      var data = ctx.data;
      var disposers = [];
      var surfaceNodes = [];     // live kit elements (goal / todo / chips), moved between hosts
      var mountedKinds = '';     // signature of what surfaceNodes currently holds
      var currentTid = null;
      var wide = ctx.env.width >= BREAKPOINT;
      var unmounted = false;

      /* ---- skeleton ------------------------------------------------------ */
      var root = el('section', 'w2-root');
      root.setAttribute('data-k3-window', 'w2');

      // shared header chrome across the top of the whole window
      var headerEl = kit.header(ctx);
      root.appendChild(headerEl);

      // Context Lens banner (collapses to nothing while the lens is quiet)
      var lensHost = kit.lensBannerHost(ctx);
      root.appendChild(lensHost.element);

      var body = el('div', 'w2-body');

      // left: persistent history rail. Wide layout adds [Chats · Artifacts]
      // tabs; the Artifacts tab hosts the shared artifact workspace surface
      // and widens the rail (CSS .is-art). Narrow layout leaves the rail on
      // the Chats pane, untouched.
      var rail = el('aside', 'w2-rail');
      rail.setAttribute('aria-label', 'Chat history');

      function railTabBtn(label, iconName, tabId) {
        var b = el('button', 'w2-rail-tab');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('data-w2-tab', tabId);
        var ic = el('span', 'w2-rail-tab-ic');
        ic.appendChild(icon(iconName));
        b.appendChild(ic);
        b.appendChild(el('span', 'w2-rail-tab-label', label));
        return b;
      }
      var railTabs = el('div', 'w2-rail-tabs');
      railTabs.setAttribute('role', 'tablist');
      railTabs.setAttribute('aria-label', 'History rail view');
      railTabs.hidden = true;
      var tabChats = railTabBtn('Chats', 'history', 'chats');
      var tabArts = railTabBtn('Artifacts', 'artifact', 'artifacts');
      railTabs.appendChild(tabChats);
      railTabs.appendChild(tabArts);
      rail.appendChild(railTabs);

      var historyEl = kit.historyPanel(ctx);
      var railChats = el('div', 'w2-rail-pane w2-rail-chats');
      railChats.appendChild(historyEl);
      rail.appendChild(railChats);

      var railArts = el('div', 'w2-rail-pane w2-rail-art');
      railArts.hidden = true;
      rail.appendChild(railArts);
      body.appendChild(rail);

      // middle: transcript column + work drawer + composer
      var center = el('div', 'w2-center');
      var threadSlot = el('div', 'w2-thread');
      threadSlot.setAttribute('data-k3-slot', 'thread');
      center.appendChild(threadSlot);

      var workAcc = el('div', 'k3-acc w2-work-acc');
      var workAccIn = el('div', 'k3-acc-in');
      var workBody = el('div', 'w2-work-body k3-scroll');
      workAccIn.appendChild(workBody);
      workAcc.appendChild(workAccIn);
      center.appendChild(workAcc);

      var workBtn = el('button', 'w2-work-btn');
      workBtn.type = 'button';
      workBtn.setAttribute('aria-expanded', 'false');
      var workBtnIc = el('span', 'w2-work-btn-ic');
      workBtnIc.appendChild(icon('activity'));
      var workBtnLabel = el('span', 'w2-work-btn-label', 'Work');
      var workBtnSummary = el('span', 'w2-work-btn-summary');
      var workBtnChev = el('span', 'w2-work-btn-chev');
      workBtnChev.appendChild(icon('chevron-down'));
      workBtn.appendChild(workBtnIc);
      workBtn.appendChild(workBtnLabel);
      workBtn.appendChild(workBtnSummary);
      workBtn.appendChild(workBtnChev);
      center.appendChild(workBtn);

      var composerSlot = el('div', 'w2-composer');
      composerSlot.setAttribute('data-k3-slot', 'composer');
      center.appendChild(composerSlot);
      body.appendChild(center);

      // right: inspector column (wide layout only)
      var inspector = el('aside', 'w2-inspector');
      inspector.setAttribute('aria-label', 'Work inspector');
      var inspHead = el('div', 'w2-insp-head', 'Work');
      var inspBody = el('div', 'w2-insp-body k3-scroll');
      var inspNote = el('div', 'w2-note', 'No goal, task, or work data on this thread.');
      inspBody.appendChild(inspNote);
      inspector.appendChild(inspHead);
      inspector.appendChild(inspBody);
      body.appendChild(inspector);

      root.appendChild(body);
      hostEl.appendChild(root);

      // THE ONE shared artifact workspace surface — same node every call,
      // reparented between the rail Artifacts pane (wide) and the Work
      // drawer (narrow); never cloned.
      var artSurface = window.K3ArtifactWS ? window.K3ArtifactWS.surface(ctx) : null;

      /* ---- presence + summary -------------------------------------------- */
      function presence(tid) {
        var t = tid ? data.thread(tid) : null;
        var p = { goal: false, todo: false, chips: false, ops: false, capacity: false, crew: false, artifacts: 0, todoDone: 0, todoTotal: 0, agents: 0, files: 0 };
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
        p.artifacts = arr(t.artifacts).length;
        p.capacity = !!t.capacityForecast;
        p.crew = !!t.crew;
        var ops = window.K3Work && typeof window.K3Work.opsSummary === 'function' ? window.K3Work.opsSummary(tid) : null;
        p.ops = !!(ops && arr(ops.conflicts).some(function (c) { return c && c.state !== 'resolved'; }));
        return p;
      }
      function anyPresence(p) { return p.goal || p.todo || p.chips || p.ops || p.capacity || p.crew || p.artifacts > 0; }
      function kindsOf(p) {
        // artifact presence is NOT a rebuild kind: the artifact surface is a
        // persistent shared node, never rebuilt with the kit surfaces.
        return (p.ops ? 'ops,' : '') + (p.capacity ? 'cap,' : '') + (p.crew ? 'crew,' : '') +
               (p.goal ? 'goal,' : '') + (p.todo ? 'todo,' : '') + (p.chips ? 'chips' : '');
      }
      function summaryOf(p, tid) {
        var parts = [];
        if (p.ops) parts.push('Port conflict');
        if (p.goal) {
          var g = data.thread(tid).activeGoal;
          parts.push('Goal: ' + humanizeStatus(g.status));
        }
        if (p.todo) parts.push('Todo ' + p.todoDone + '/' + p.todoTotal);
        if (p.agents) parts.push(p.agents + (p.agents === 1 ? ' agent' : ' agents'));
        if (p.files) parts.push(p.files + (p.files === 1 ? ' file changed' : ' files changed'));
        if (p.artifacts) parts.push(p.artifacts + (p.artifacts === 1 ? ' artifact' : ' artifacts'));
        return parts.join(' · ');
      }

      /* ---- surfaces -------------------------------------------------------- */
      function unmountSurfaces() {
        surfaceNodes.forEach(function (n) {
          try { if (n && n.unmount) n.unmount(); } catch (e) { /* ignore */ }
          try { if (n && n.remove) n.remove(); } catch (e) { /* ignore */ }
        });
        surfaceNodes = [];
        mountedKinds = '';
        // remove any orphaned surface/yieldwrap nodes left in the hosts by
        // older builds (stale nodes caused duplicated surfaces). Keep the
        // "no work" note element intact.
        [inspBody, workBody].forEach(function (host) {
          if (!host) return;
          host.querySelectorAll('.k3w-kit-surface, .k3w-kit-chips, .k3w-kit-yieldwrap').forEach(function (orphan) {
            try { orphan.remove(); } catch (e) { /* ignore */ }
          });
        });
      }

      function surfaceHost() { return wide ? inspBody : workBody; }

      function buildSurfaces() {
        unmountSurfaces();
        var p = presence(currentTid);
        // operational awareness leads (packet: approvals/warnings lead), then
        // capacity / crew, then the pre-existing goal / todo / chips.
        if (p.ops && kit.opsSurface) {
          var o = kit.opsSurface(ctx, currentTid);
          if (o) surfaceNodes.push(o);
        }
        if (p.capacity && kit.capacitySurface) {
          var cp = kit.capacitySurface(ctx, currentTid);
          if (cp) surfaceNodes.push(cp);
        }
        if (p.crew && kit.crewSurface) {
          var cw = kit.crewSurface(ctx, currentTid);
          if (cw) surfaceNodes.push(cw);
        }
        if (p.goal) {
          var g = kit.goalSurface(ctx, currentTid);
          if (g) surfaceNodes.push(g);
        }
        if (p.todo) {
          var td = kit.todoSurface(ctx, currentTid);
          if (td) surfaceNodes.push(td);
        }
        if (p.chips) {
          var c = kit.workChips(ctx, currentTid);
          if (c) surfaceNodes.push(c);
        }
        mountedKinds = kindsOf(presence(currentTid));
        placeSurfaces();
      }

      // The shared artifact surface rides the same move-the-node mechanics:
      // wide -> the rail's Artifacts pane; narrow -> the top of the Work
      // drawer region. Reparented, never cloned.
      function placeArtSurface() {
        if (!artSurface) return;
        if (wide) {
          if (artSurface.parentNode !== railArts) railArts.appendChild(artSurface);
        } else if (artSurface.parentNode !== workBody || workBody.firstChild !== artSurface) {
          workBody.insertBefore(artSurface, workBody.firstChild);
        }
      }

      // Move the live surface elements into the active host and paint all
      // breakpoint-dependent chrome. Moving nodes keeps their DOM state.
      function placeSurfaces() {
        var host = surfaceHost();
        surfaceNodes.forEach(function (n) {
          if (n && n.parentNode !== host) host.appendChild(n);
        });
        placeArtSurface();
        paint();
      }

      function drawerOpen() {
        return store.get('surfaceView.' + currentTid + '.w2WorkOpen', false) === true;
      }
      function railTab() {
        if (!currentTid) return 'chats';
        return store.get('surfaceView.' + currentTid + '.w2RailTab', 'chats');
      }

      function paint() {
        if (unmounted) return;
        var p = presence(currentTid);
        var any = anyPresence(p);

        // inspector column: wide only; quiet empty note when nothing to show
        inspector.hidden = !wide;
        inspNote.hidden = any;
        inspHead.hidden = !any;

        // Work button + drawer: narrow only, and only when something would show
        var open = any && drawerOpen();
        workBtn.hidden = wide || !any;
        workBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        workBtnSummary.textContent = any ? summaryOf(p, currentTid) : '';
        workAcc.classList.toggle('is-open', !wide && open);
        if (wide) workAcc.classList.remove('is-open');

        // rail tabs + pane swap: wide only; narrow the rail stays on Chats
        // (history rail untouched — tab/drawer switch is the only change)
        var artTab = wide && railTab() === 'artifacts';
        railTabs.hidden = !wide;
        rail.classList.toggle('is-art', artTab);
        tabChats.setAttribute('aria-selected', artTab ? 'false' : 'true');
        tabArts.setAttribute('aria-selected', artTab ? 'true' : 'false');
        railChats.hidden = artTab;
        railArts.hidden = !artTab;
      }

      function rebuildAll() {
        currentTid = store.get('activeThreadId', null);
        buildSurfaces();
      }

      // Data events: presence flips (e.g. goal cleared, first activity lands)
      // trigger a rebuild; everything else just repaints the summary line.
      function refresh() {
        if (unmounted) return;
        var kinds = kindsOf(presence(currentTid));
        if (kinds !== mountedKinds) buildSurfaces();
        else paint();
      }

      workBtn.addEventListener('click', function () {
        if (!currentTid) return;
        store.set('surfaceView.' + currentTid + '.w2WorkOpen', !drawerOpen());
        paint();
      });

      tabChats.addEventListener('click', function () {
        if (!currentTid) return;
        store.set('surfaceView.' + currentTid + '.w2RailTab', 'chats');
        paint();
      });
      tabArts.addEventListener('click', function () {
        if (!currentTid) return;
        store.set('surfaceView.' + currentTid + '.w2RailTab', 'artifacts');
        paint();
      });

      // Opening an artifact flips the rail to the Artifacts tab (wide) or
      // opens the Work drawer (narrow) so the surface lands where the user is
      // looking. Close/status events just repaint; the surface self-renders.
      function onWsChanged(evt) {
        if (unmounted) return;
        if (evt.threadId && currentTid && evt.threadId !== currentTid) return;
        if (evt.open && currentTid) {
          if (wide) {
            if (railTab() !== 'artifacts') store.set('surfaceView.' + currentTid + '.w2RailTab', 'artifacts');
          } else if (!drawerOpen()) {
            store.set('surfaceView.' + currentTid + '.w2WorkOpen', true);
          }
        }
        paint();
      }

      /* ---- wiring ------------------------------------------------------------ */
      disposers.push(store.subscribe('activeThreadId', rebuildAll));
      disposers.push(store.subscribe('goalView', refresh));
      function onData(evt) {
        if (!evt) return;
        if (evt.type === 'threads-changed' || evt.type === 'restarted' ||
            evt.type === 'message-added' || evt.type === 'questionnaire-resolved' ||
            evt.type === 'ops-conflict' || evt.type === 'capacity-changed' ||
            evt.type === 'crew-changed') refresh();
        else if (evt.type === 'artifact-ws-changed') onWsChanged(evt);
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

      /* ---- boot + teardown --------------------------------------------------- */
      rebuildAll();

      function unmount() {
        if (unmounted) return;
        unmounted = true;
        unmountSurfaces();
        // release THE shared artifact surface so the next window can reparent
        // it (never destroyed — it outlives any single window mount)
        try { if (artSurface && root.contains(artSurface)) artSurface.remove(); } catch (e) { /* ignore */ }
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
