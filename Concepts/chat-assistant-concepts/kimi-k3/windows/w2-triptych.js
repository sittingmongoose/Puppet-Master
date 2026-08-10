/* ============================================================================
   Kimi K3 — W2 Triptych (chat-window concept, the width-pressure host).

   Three columns when there is room: a persistent history rail (left, ~170px,
   kit historyPanel), the transcript column, and a right-hand "inspector"
   column holding the work surfaces (goal / todo / work chips). The inspector
   only exists at env.width >= 975; below that the SAME surface elements move
   (no rebuild — DOM state is carried) into a bottom drawer above the
   composer, toggled by a "Work" button (a k3-acc region, not an overlay).
   The flip happens live on 'env' changes; surfaces rebuild only when the
   active thread changes.

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

      // left: persistent history rail
      var rail = el('aside', 'w2-rail');
      rail.setAttribute('aria-label', 'Chat history');
      var historyEl = kit.historyPanel(ctx);
      rail.appendChild(historyEl);
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

      /* ---- presence + summary -------------------------------------------- */
      function presence(tid) {
        var t = tid ? data.thread(tid) : null;
        var p = { goal: false, todo: false, chips: false, todoDone: 0, todoTotal: 0, agents: 0, files: 0 };
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
      function anyPresence(p) { return p.goal || p.todo || p.chips; }
      function kindsOf(p) {
        return (p.goal ? 'goal,' : '') + (p.todo ? 'todo,' : '') + (p.chips ? 'chips' : '');
      }
      function summaryOf(p, tid) {
        var parts = [];
        if (p.goal) {
          var g = data.thread(tid).activeGoal;
          parts.push('Goal: ' + humanizeStatus(g.status));
        }
        if (p.todo) parts.push('Todo ' + p.todoDone + '/' + p.todoTotal);
        if (p.agents) parts.push(p.agents + (p.agents === 1 ? ' agent' : ' agents'));
        if (p.files) parts.push(p.files + (p.files === 1 ? ' file changed' : ' files changed'));
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

      // Move the live surface elements into the active host and paint all
      // breakpoint-dependent chrome. Moving nodes keeps their DOM state.
      function placeSurfaces() {
        var host = surfaceHost();
        surfaceNodes.forEach(function (n) {
          if (n && n.parentNode !== host) host.appendChild(n);
        });
        paint();
      }

      function drawerOpen() {
        return store.get('surfaceView.' + currentTid + '.w2WorkOpen', false) === true;
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

      /* ---- wiring ------------------------------------------------------------ */
      disposers.push(store.subscribe('activeThreadId', rebuildAll));
      disposers.push(store.subscribe('goalView', refresh));
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

      /* ---- boot + teardown --------------------------------------------------- */
      rebuildAll();

      function unmount() {
        if (unmounted) return;
        unmounted = true;
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
