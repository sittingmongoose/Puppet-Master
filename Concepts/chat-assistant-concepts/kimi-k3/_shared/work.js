/* ============================================================================
   Kimi K3 — work controller (window.K3Work).

   Derived-state/demo controller for the packet's work layer:

   - Goal lifecycle: startGoal / pauseGoal / resumeGoal / updateGoal /
     stopGoal / replanGoal / completeGoal mutate data.thread(tid).activeGoal
     (status + canPause/canResume/canStop flags + progress), expand the
     goalView.<tid> store slice where relevant, and re-render through
     data.touchThread(tid, 'threads-changed'). completeGoal appends a
     completion receiptCard transcript record (worked != elapsed, both
     shown). replanGoal asks for the safe-boundary choice via K3UI.confirm,
     then appends a replan-flash note + a revision record.

   - Route-frozen rule: guardRouteChange(ctx, tid) — while a Goal is
     running, route/Persona/access changes must NOT silently retarget it.
     K3Route/K3Access call this lazily (window.K3Work) BEFORE applying a
     change; when it returns true the change must be aborted. The notice
     popover offers an explicit "Update Goal" action (calls updateGoal).

   - Capacity: capacityForecast(tid) -> thread.capacityForecast or null.

   - Crew: selectCrew(tid, templateId) builds thread.crew from a catalog
     template (2 concurrent + rest queued waves) and mirrors the selection
     into threadLocal.<tid>.crew (thread-local ONLY — never a project
     default). crew(tid) is the reader. Emits 'crew-changed'.

   - Ops: opsSummary(tid) derives operational-awareness state (port
     conflicts with a "Use <alt> instead?" action, worktree rows, Browser
     Program sessions, pressure, provider allowance/reset).
     applyPortAlternative(tid, conflict) records the resolution on
     thread.opsResolutions and emits 'ops-conflict'.

   Deterministic: fixed demo timestamp; ids from a session counter
   (prefixed 'k3w-'). No timers. css: none (uses global k3-btn chrome;
   popover content relies on popups.js defaults).
   ========================================================================== */
(function () {
  'use strict';

  var FIXED_AT = '2026-08-08T15:10:00Z'; // deterministic demo clock
  var idSeq = 0;

  function nextId(kind) { idSeq += 1; return 'k3w-' + kind + '-' + idSeq; }
  function data() { return window.K3Data; }
  function store() { return window.K3Store; }
  function emit(evt) {
    if (window.K3 && typeof window.K3.emit === 'function') window.K3.emit('data', evt);
  }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function threadOf(tid) { return data().thread(tid); }
  function goalOf(tid) {
    var t = threadOf(tid);
    return t && t.activeGoal ? t.activeGoal : null;
  }
  function touch(tid, type) { data().touchThread(tid, type || 'threads-changed'); }

  function fmtSeconds(s) {
    s = Math.max(0, Math.round(Number(s) || 0));
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m > 0 ? (m + 'm ' + sec + 's') : (sec + 's');
  }

  function expandGoalView(tid) {
    var cur = store().get('goalView.' + tid, null) || {};
    if (cur.expanded !== true) {
      cur.expanded = true;
      store().set('goalView.' + tid, cur);
    }
  }

  // Canonical flag table: status drives which goal actions are offered.
  function setFlags(goal, status) {
    goal.status = status;
    goal.canPause = status === 'running';
    goal.canResume = status === 'paused' || status === 'blocked';
    goal.canStop = status === 'running' || status === 'paused';
    goal.canEdit = status === 'running' || status === 'paused' || status === 'blocked';
    goal.canClear = status !== 'running';
  }

  var K3Work = {
    // --- Goal lifecycle -------------------------------------------------------
    startGoal: function (tid, fields) {
      var t = threadOf(tid);
      if (!t) return null;
      var existing = t.activeGoal;
      if (existing && existing.status === 'running') return existing;
      var goal = Object.assign({
        id: nextId('goal'),
        title: 'Untitled Goal',
        objective: '',
        phase: 'Discovery',
        workedSeconds: 0,
        totalElapsedSeconds: 0,
        expanded: false,
        replanCount: 0,
        progress: { done: 0, total: 0 }
      }, fields || {});
      setFlags(goal, 'running');
      t.activeGoal = goal;
      expandGoalView(tid);
      data().appendRecord(tid, {
        body: 'Goal started: "' + goal.title + '". Route is frozen for the Goal — retarget it explicitly if the model or access profile changes.'
      });
      touch(tid);
      return goal;
    },

    pauseGoal: function (tid) {
      var goal = goalOf(tid);
      if (!goal || goal.status !== 'running') return goal;
      setFlags(goal, 'paused');
      touch(tid);
      return goal;
    },

    resumeGoal: function (tid) {
      var goal = goalOf(tid);
      if (!goal || (goal.status !== 'paused' && goal.status !== 'blocked')) return goal;
      delete goal.blockedCause;
      setFlags(goal, 'running');
      touch(tid);
      return goal;
    },

    updateGoal: function (tid, patch) {
      var goal = goalOf(tid);
      if (!goal) return null;
      patch = patch || {};
      ['title', 'objective', 'phase'].forEach(function (k) {
        if (typeof patch[k] === 'string' && patch[k]) goal[k] = patch[k];
      });
      if (patch.progress && typeof patch.progress === 'object') {
        goal.progress = Object.assign({}, goal.progress, patch.progress);
      }
      if (typeof patch.note === 'string' && patch.note) {
        data().appendRecord(tid, { body: 'Goal updated — ' + patch.note });
      }
      touch(tid);
      return goal;
    },

    stopGoal: function (tid) {
      var goal = goalOf(tid);
      if (!goal || goal.status === 'stopped' || goal.status === 'complete') return goal;
      setFlags(goal, 'stopped');
      data().appendRecord(tid, {
        body: 'Goal stopped — worked ' + fmtSeconds(goal.workedSeconds) +
          ' across ' + fmtSeconds(goal.totalElapsedSeconds) + ' elapsed. State is preserved and can be cleared or resumed as a new Goal.'
      });
      touch(tid);
      return goal;
    },

    // Replan rewrites the remaining plan INSIDE the current safe boundary —
    // confirmed explicitly, never silently.
    replanGoal: function (tid, note) {
      var goal = goalOf(tid);
      if (!goal) return Promise.resolve(null);
      var ui = window.K3UI;
      var proceed = ui && typeof ui.confirm === 'function'
        ? ui.confirm({
            title: 'Replan this Goal?',
            body: 'Replanning rewrites the remaining plan inside the current safe boundary. Completed work, approvals, artifacts, and the canonical history are preserved.',
            confirmLabel: 'Replan within safe boundary',
            cancelLabel: 'Cancel'
          })
        : Promise.resolve(false);
      return proceed.then(function (ok) {
        if (!ok) return null;
        var t = threadOf(tid);
        goal.replanCount = (goal.replanCount || 0) + 1;
        t.goalRevisions = arr(t.goalRevisions);
        var revision = {
          revision: goal.replanCount,
          note: note || 'Replanned within the safe boundary',
          at: FIXED_AT
        };
        t.goalRevisions.push(revision);
        var gv = store().get('goalView.' + tid, null) || {};
        gv.replanFlash = true;
        store().set('goalView.' + tid, gv);
        data().appendRecord(tid, {
          body: 'Goal replanned — revision ' + goal.replanCount + '. ' + revision.note,
          replanFlash: { revision: goal.replanCount }
        });
        touch(tid);
        return goal;
      });
    },

    completeGoal: function (tid) {
      var t = threadOf(tid);
      var goal = goalOf(tid);
      if (!t || !goal) return null;
      setFlags(goal, 'complete');
      if (goal.progress && typeof goal.progress.total === 'number') {
        goal.progress.done = goal.progress.total;
      }
      var artifacts = arr(t.artifacts);
      var evidenceCount = arr(t.messages).filter(function (m) { return !!m.activityGroup; }).length;
      data().appendRecord(tid, {
        receiptCard: {
          id: nextId('receipt'),
          kind: 'goal-complete',
          title: 'Goal complete — ' + goal.title,
          lines: [
            { label: 'Objective', value: goal.objective || goal.title },
            { label: 'Phase', value: goal.phase || '—' },
            { label: 'Evidence', value: evidenceCount + ' activity records in canonical history' },
            { label: 'Artifacts', value: artifacts.length + (artifacts.length === 1 ? ' artifact' : ' artifacts') + (artifacts[0] ? ' — first: ' + artifacts[0].title : '') },
            { label: 'Worked', value: fmtSeconds(goal.workedSeconds) },
            { label: 'Elapsed', value: fmtSeconds(goal.totalElapsedSeconds) }
          ]
        }
      });
      touch(tid);
      return goal;
    },

    // --- route-frozen rule ------------------------------------------------------
    // Called lazily by K3Route/K3Access BEFORE applying a route/access/persona
    // change. Returns true when a running Goal froze the route — the caller
    // MUST abort the change. NEVER retargets silently.
    guardRouteChange: function (ctx, tid) {
      var goal = goalOf(tid);
      if (!goal || goal.status !== 'running') return false;
      var ui = (ctx && ctx.ui) || window.K3UI;
      if (!ui || typeof ui.popover !== 'function') return true; // guarded, no UI to explain
      var anchor = (ctx && ctx.anchor) ||
        document.querySelector('[data-testid="k3r-route"]') ||
        document.querySelector('[data-testid="k3w-kit-model"]') ||
        document.body;
      var content = document.createElement('div');
      var text = document.createElement('div');
      text.className = 'k3-pop-note';
      text.textContent = 'Goal route is frozen — update the Goal to retarget.';
      var row = document.createElement('div');
      row.className = 'k3-pop-row';
      var update = document.createElement('button');
      update.type = 'button';
      update.className = 'k3-btn';
      update.textContent = 'Update Goal…';
      var keep = document.createElement('button');
      keep.type = 'button';
      keep.className = 'k3-btn k3-btn-ghost';
      keep.textContent = 'Keep current route';
      row.appendChild(update);
      row.appendChild(keep);
      content.appendChild(text);
      content.appendChild(row);
      var pop = ui.popover(anchor, content, {});
      keep.addEventListener('click', function () { pop.close(); });
      update.addEventListener('click', function () {
        pop.close();
        K3Work.updateGoal(tid, { note: 'Route retarget requested — confirm the new route in the Goal before it applies.' });
      });
      return true;
    },

    // --- capacity ----------------------------------------------------------------
    capacityForecast: function (tid) {
      var t = threadOf(tid);
      return t && t.capacityForecast ? t.capacityForecast : null;
    },

    // --- crew (thread-local only) -------------------------------------------------
    selectCrew: function (tid, templateId) {
      var t = threadOf(tid);
      if (!t) return null;
      var templates = data().crewTemplates();
      var template = null;
      templates.forEach(function (tp) { if (tp.id === templateId) template = tp; });
      if (!template) template = templates[0] || { id: 'crew-ad-hoc', label: 'Ad-hoc crew', roles: ['Researcher', 'Implementer'], reserveReason: 'Keeps the verification reserve available' };
      var routePool = [
        'anthropic/work/claude-sonnet-4.5',
        'openai/work/gpt-5.2',
        'google/personal/gemini-3-pro',
        'xai/work/grok-4.5'
      ];
      var roles = arr(template.roles);
      var members = roles.map(function (role, i) {
        return {
          role: role,
          route: routePool[i % routePool.length],
          status: i < 2 ? 'running' : 'queued',
          workedSeconds: 0
        };
      });
      var crew = {
        templateId: template.id,
        templateLabel: template.label || template.id,
        members: members,
        waves: {
          concurrent: Math.min(2, members.length),
          queued: Math.max(0, members.length - 2),
          total: Math.max(1, Math.ceil(members.length / 2))
        },
        reserveReason: template.reserveReason || null
      };
      t.crew = crew;
      // thread-local ONLY: never written to routeDefaults / selectors.
      data().setThreadLocal(tid, { crew: { templateId: crew.templateId, label: crew.templateLabel } });
      touch(tid, 'crew-changed');
      return crew;
    },

    crew: function (tid) {
      var t = threadOf(tid);
      return t && t.crew ? t.crew : null;
    },

    // --- operational awareness ------------------------------------------------------
    opsSummary: function (tid) {
      var t = threadOf(tid);
      var leases = data().portLeases();
      var resolutions = (t && t.opsResolutions) || {};
      var free = null;
      leases.forEach(function (l) { if (l.state === 'free' && free == null) free = l.port; });
      var conflicts = [];
      leases.forEach(function (l) {
        if (l.state !== 'leased') return;
        var res = resolutions['port-' + l.port];
        if (res && res.state === 'resolved') return;
        conflicts.push({
          kind: 'port',
          port: l.port,
          owner: l.owner,
          ownerLabel: l.ownerLabel,
          threadId: l.threadId,
          alternative: free,
          action: free != null ? 'Use ' + free + ' instead?' : null
        });
      });
      return {
        conflicts: conflicts,
        worktrees: data().worktrees(),
        sessions: arr(t && t.browserSessions),
        pressure: { cpu: 'nominal', memory: 'nominal' },
        allowance: { reserve: '2 lanes', reset: '2026-08-09T00:00:00Z' },
        resolutions: resolutions
      };
    },

    applyPortAlternative: function (tid, conflict) {
      var t = threadOf(tid);
      if (!t || !conflict || conflict.kind !== 'port') return null;
      t.opsResolutions = t.opsResolutions || {};
      var resolution = {
        kind: 'port',
        port: conflict.port,
        state: 'resolved',
        chosen: conflict.alternative != null ? conflict.alternative : null,
        at: FIXED_AT
      };
      t.opsResolutions['port-' + conflict.port] = resolution;
      touch(tid, 'ops-conflict');
      return resolution;
    }
  };

  window.K3Work = K3Work;
})();
