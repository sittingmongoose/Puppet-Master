/* activity-panel.js — feature module.  OWNER: Wave 2 — Activity Panel agent (item 1: the eight Activity Detail concepts)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules therefore run BEFORE the app boots, so anything
 * registered here is live on the very first render — no re-render, no flash.
 *
 * WHAT THIS FILE FIXES
 * --------------------
 * `renderActivityPanel()` stamped `data-variant` on the panel and then rendered the
 * identical five-accordion body for all eight "concepts"; `renderActivitySection()`
 * took no variant argument at all.  The eight real structures had been designed in
 * styles.css (`.activity-concept-board`, `.activity-goal-tree`, `.activity-master-detail`,
 * `.activity-agent-board`, `.activity-ledger`, `.activity-live-feed`,
 * `.activity-dashboard`, `.ring-mini`) and never given an emitter.  This module is
 * the emitter, plus the three behavioural repairs that apply to all eight:
 *
 *   1. the domain filter genuinely filters (`state.activity.domain` + a scope toggle),
 *   2. Todo rows are clickable (they carried no data-action at all),
 *   3. every row records `state.activity.selected`, so the master/detail and board
 *      concepts have something to detail — while subagent / change / artifact rows
 *      keep the canonical `open-agent` / `open-change` / `open-artifact` vocabulary
 *      and let app.js's built-in handler do the opening (the registered handler
 *      returns false to decline, which is the documented "run before, then fall
 *      through" path).
 *
 * NOTHING here hand-writes a count.  Every number is derived from whatever is in
 * `PM56_DATA` at render time, so the Wave 2 Demo Data agent can grow `changes`
 * 3 -> 12, `subagents` 5 -> 14 and add `artifacts[].updatedAt` underneath this file
 * without a single edit.  Goal content is owned by the Wave 2 Goals agent and is
 * only ever obtained from the `goalSection` slot / `window.PM56_GOAL`.
 */
(function () {
  'use strict';
  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;

  /* Assistant-redesign wave: 'todo' stays here. Dropping it removed the To-Do
     tile from all eight Activity Detail concepts (6 domain tiles became 5).
     The duplication it was meant to prevent is handled upstream instead:
     app.js's activityScope() now derives `todos` from window.PM56_TODOS, so the
     tiles and counts below read the OWNER's data, and todos.js's own panel body
     renders only in focused 'todo' scope. */
  var DOMAINS = ['goal', 'todo', 'subagents', 'processes', 'crew', 'changes', 'artifacts'];
  var LABELS = { goal: 'Goal', todo: 'Todo', subagents: 'Subagents', processes: 'Processes', crew: 'Crew', changes: 'Changes', artifacts: 'Artifacts' };
  /* Neon icons (step 3B): the collaborative domains draw their kind marks (one glyph per concept), and every domain
     glyph in a head, chip, rail, branch or section is lit in its domain's tone (lit(), below): the tone ink with its
     core halo, steady. Nothing here loops; a glyph inside a button plays its act once on hover, like every lit glyph. */
  var ICONS = { goal: 'goal', todo: 'todo', subagents: 'users', processes: 'processes', crew: 'kind-crew', brainstorm: 'kind-brainstorm', review: 'kind-review', chat_room: 'kind-chat_room', changes: 'changes', artifacts: 'artifact' };
  /* X1: the lit robot is the Subagents category mark at this size (A11); each agent is still Pip. The robot comes
     from the shared glyph registry when it is loaded (PMConcept7); the standalone chat keeps its people glyph */
  function iconOf(d) {
    if (d === 'subagents' && window.PM56_NEON && window.PM56_NEON.has && window.PM56_NEON.has('robot')) return 'robot';
    return ICONS[d];
  }
  /* a tone (this panel's or the shared vocabulary's) -> the neon tone class that lights a glyph */
  var NX_TONE = { blocked: 'blocked', attention: 'attention', waiting: 'attention', working: 'working', changed: 'changed', done: 'done', idle: 'idle', pending: 'idle', muted: 'paused', paused: 'paused' };
  function lit(tone) { return 'nx-t-' + (NX_TONE[tone] || 'idle'); }

  /* ---------------------------------------------------------------- state
     Extra keys hang off state.activity.  globalReset() replaces `state`
     wholesale from DEFAULT, which does not carry them, so every accessor
     below has to tolerate `undefined` — that is the reset path, not a bug. */
  function act(ctx) { return ctx.state.activity || (ctx.state.activity = {}); }
  function coll(ctx) {
    if (ctx.activityScope) return ctx.activityScope();
    return {
      todos: ctx.D.todos || [],
      subagents: ctx.D.subagents || [],
      crew: [],
      changes: ctx.D.changes || [],
      artifacts: ctx.D.artifacts || [],
      hasGoal: !!(ctx.activityDefs() || {}).goal,
      hasAttachedGoal: !!(ctx.activityDefs() || {}).goal && !!(ctx.activityDefs().goal.attached !== false),
      hasSubagents: (ctx.D.subagents || []).length > 0,
      hasCrew: false,
      live: null
    };
  }
  function liveDomains(ctx) {
    var defs = ctx.activityDefs() || {};
    return DOMAINS.filter(function (d) { return !!defs[d]; });
  }
  /* Two controls, two jobs:
       the Chat Activity Bar's `open-activity` OPENS the detail focused on
       that one domain (scope 'focus');
       Show all / the filter row can widen back to every *live* domain. */
  function scopeOf(ctx) { return act(ctx).scope === 'focus' ? 'focus' : 'all'; }
  function focusOf(ctx) {
    var live = liveDomains(ctx);
    var d = act(ctx).domain;
    if (live.indexOf(d) >= 0) return d;
    return live[0] || 'goal';
  }
  function visibleDomains(ctx) {
    var live = liveDomains(ctx);
    if (scopeOf(ctx) === 'focus') {
      var f = focusOf(ctx);
      return live.indexOf(f) >= 0 ? [f] : live.slice(0, 1);
    }
    return live;
  }
  /* Focused-first ordering, for the concepts where movement reads as ranking
     rather than as the list jumping about (boards, feeds, ledgers). */
  function rankedDomains(ctx) {
    var live = liveDomains(ctx), f = focusOf(ctx);
    if (scopeOf(ctx) === 'focus') return live.indexOf(f) >= 0 ? [f] : live.slice(0, 1);
    return [f].concat(live.filter(function (d) { return d !== f; }));
  }
  function selected(ctx) { return act(ctx).selected || null; }
  function isSelected(ctx, domain, id) {
    var s = selected(ctx);
    return !!(s && s.domain === domain && s.id === id);
  }
  function openRows(ctx) {
    var a = act(ctx);
    if (!Array.isArray(a.openRows)) a.openRows = [];
    return a.openRows;
  }
  function branches(ctx) {
    var a = act(ctx);
    if (!Array.isArray(a.branches)) a.branches = [focusOf(ctx)];
    return a.branches;
  }

  /* ------------------------------------------------------------- formatting */
  function esc(ctx, v) { return ctx.esc(v == null ? '' : v); }
  function pct(n, d) { return d > 0 ? Math.max(0, Math.min(100, Math.round((n / d) * 100))) : 0; }
  function titleCase(s) { return String(s || '').replace(/_/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }); }
  function statusMeta(status, fallbackTone) {
    var shared = window.PM56_ACTIVITY_STATUS;
    if (shared && typeof shared.get === 'function') return shared.get(status);
    return { label: titleCase(status || 'queued'), tone: fallbackTone || 'idle', icon: 'todo' };
  }
  function toneLabel(tone) {
    var shared = window.PM56_ACTIVITY_STATUS;
    if (shared && typeof shared.toneLabel === 'function') return shared.toneLabel(tone);
    return {
      blocked: 'Blocked', attention: 'Needs attention', working: 'Working',
      changed: 'Changed', done: 'Settled', idle: 'Queued', muted: 'Inactive'
    }[tone] || titleCase(tone);
  }
  function splitPath(path) {
    var value = String(path || ''), slash = value.lastIndexOf('/');
    return { dir: slash < 0 ? '' : value.slice(0, slash + 1), file: slash < 0 ? value : value.slice(slash + 1) };
  }

  /* Relative label from a fixed ISO string.  The fixtures are deterministic on
     purpose (a stable screenshot baseline is impossible otherwise), so "now" is
     the newest timestamp present rather than Date.now(). */
  function isoTime(v) {
    var t = v ? Date.parse(v) : NaN;
    return isFinite(t) ? t : null;
  }
  function newestStamp(ctx) {
    var max = null;
    (ctx.D.artifacts || []).concat(ctx.D.todos || [], ctx.D.changes || []).forEach(function (x) {
      var t = isoTime(x && (x.updatedAt || x.createdAt));
      if (t != null && (max == null || t > max)) max = t;
    });
    return max;
  }
  function relTime(ctx, iso, fallback) {
    var t = isoTime(iso);
    if (t == null) return fallback == null ? '' : String(fallback);
    var now = newestStamp(ctx);
    if (now == null) return fallback == null ? '' : String(fallback);
    var s = Math.max(0, Math.round((now - t) / 1000));
    if (s < 60) return s + 's';
    if (s < 3600) return Math.round(s / 60) + 'm';
    if (s < 86400) return Math.round(s / 3600) + 'h';
    return Math.round(s / 86400) + 'd';
  }

  /* --------------------------------------------------------------- the goal
     Goal content belongs to the Wave 2 Goals agent.  Three ways in, in order of
     preference; all three degrade to app.js's own derived summary. */
  function goalApi() { return window.PM56_GOAL || null; }
  function goalProgress(ctx) {
    if (!coll(ctx).hasAttachedGoal) {
      var stub = ctx.activityDefs().goal, m0 = /^(\d+)\/(\d+)$/.exec(String(stub && stub.count || ''));
      return m0
        ? { completed: Number(m0[1]), total: Number(m0[2]), open: Math.max(0, Number(m0[2]) - Number(m0[1])) }
        : { completed: 0, total: 0, open: 0 };
    }
    var api = goalApi(), p = api && api.progress && api.progress();
    if (p && typeof p.total === 'number') return p;
    var g = ctx.activityDefs().goal, m = /^(\d+)\/(\d+)$/.exec(String(g.count || ''));
    return m
      ? { completed: Number(m[1]), total: Number(m[2]), open: Math.max(0, Number(m[2]) - Number(m[1])) }
      : { completed: 0, total: 0, open: 0 };
  }
  function goalSummaryLine(ctx) {
    if (!coll(ctx).hasAttachedGoal) {
      var stub = ctx.activityDefs().goal;
      return (stub && (stub.detail || stub.summary)) || 'Goal Mode is on';
    }
    var api = goalApi(), s = api && api.summary && api.summary();
    if (s) return [s.statusLabel, s.phaseLine, s.counter].filter(Boolean).join(' · ');
    var g = ctx.activityDefs().goal;
    return g.detail || titleCase(g.summary);
  }
  /* A full goal BODY.  The registered slot wins; then the Goals module's own
     renderer; then a derived one-liner + the lifecycle row, which is chrome, not
     authored goal content. */
  /* A slot is foreign markup.  goals.js currently returns one unclosed <div>
     (11 opens / 10 closes as of this writing), and an unclosed tag inside a
     single pmPatch parse does not stay local — it swallows every following
     sibling, including `.panel-resize`, because the whole app is parsed as one
     fragment.  Round-tripping through a <template> lets the HTML parser close
     whatever the slot left open, so a defect in one module cannot dismantle
     another module's layout.  Reported to Wave 2 — Goals; the guard stays
     regardless, because "a slot may return imperfect HTML" is a permanent
     property of an open registry. */
  function sealed(html) {
    if (!html || html.indexOf('<') < 0) return html || '';
    try {
      var t = document.createElement('template');
      t.innerHTML = html;
      return t.innerHTML;
    } catch (e) { return html; }
  }
  function goalBody(ctx) {
    if (!coll(ctx).hasAttachedGoal) {
      var stub = ctx.activityDefs().goal || {};
      return '<div class="activity-line" data-k="pmap-goal-cap"><span class="status-dot working"></span><div class="copy"><strong>' +
        esc(ctx, stub.summary || 'Goal Mode is on') + '</strong><span>' +
        esc(ctx, stub.detail || 'No durable goal on this thread yet.') +
        '</span></div><span class="right">' + esc(ctx, stub.count || '—') + '</span></div>';
    }
    var slot = ctx.extRender('goalSection', {});
    if (slot) return sealed(slot);
    var api = goalApi();
    if (api && api.render && api.render.section) {
      try { return sealed(api.render.section(ctx)); } catch (e) { /* fall through */ }
    }
    var g = ctx.activityDefs().goal;
    return '<div class="activity-line" data-k="pmap-goal-fallback"><span class="status-dot ' +
      (g.tone === 'blocked' ? 'blocked' : 'working') + '"></span><div class="copy"><strong>' +
      esc(ctx, g.summary) + '</strong><span>' + esc(ctx, goalSummaryLine(ctx)) + '</span></div>' +
      '<span class="right">' + esc(ctx, g.count) + '</span></div>' + goalActions(ctx);
  }
  function goalCompact(ctx) {
    var api = goalApi();
    var render = api && api.render;
    var fn = render && (render.panel || render.compact);
    if (fn) {
      try { return sealed(fn(ctx)); } catch (e) { /* fall through */ }
    }
    return '';
  }
  function goalActions(ctx) {
    return '<div class="plan-actions" data-k="pmap-goal-actions">' +
      '<button class="soft-button" data-action="edit-goal">Edit</button>' +
      '<button class="soft-button" data-action="pause-goal">Pause</button>' +
      '<button class="soft-button" data-action="resume-goal">Resume</button>' +
      '<button class="soft-button" data-action="stop-goal">Stop</button>' +
      '<button class="text-button danger" data-action="clear-goal">Clear</button></div>';
  }

  /* ------------------------------------------------------- the item model
     ONE derived shape for every domain, so a concept never has to know which
     collection it is drawing. The shared status vocabulary is exported by
     activity-bar.js and used by both surfaces:
     blocked | attention | working | changed | done | idle | muted. */
  var TODO_DONE = ['done', 'completed'];
  var TODO_RUN = ['doing', 'in_progress', 'running', 'working'];
  var TODO_OPEN = ['next', 'pending', 'queued'];

  function todoTone(s) {
    return statusMeta(s, TODO_DONE.indexOf(s) >= 0 ? 'done' : TODO_RUN.indexOf(s) >= 0 ? 'working' : 'idle').tone;
  }
  function agentTone(s) {
    return statusMeta(s, s === 'working' ? 'working' : s === 'blocked' || s === 'failed' ? 'blocked' : 'idle').tone;
  }
  function artifactTone(s) {
    return statusMeta(s, s === 'loading' ? 'working' : s === 'error' || s === 'stale' ? 'attention' : 'done').tone;
  }

  function phaseLabel(ctx, id) {
    if (!id) return '';
    var api = goalApi();
    if (!api) return '';
    var n = api.phaseNumber && api.phaseNumber(id);
    /* Wave2-Goals split the goal into `phases[]` (the plan, exactly six) and
       `retiredPhases[]` (what a replan removed, kept as the audit trail).  A todo
       stamped with a retired phase must still resolve, or the label silently
       disappears at exactly the moment the divergence is worth seeing. */
    var g = api.get && api.get();
    var pool = g ? (Array.isArray(g.phases) ? g.phases : []).concat(Array.isArray(g.retiredPhases) ? g.retiredPhases : []) : [];
    var p = pool.filter(function (x) { return x.id === id; })[0];
    if (!p) return '';
    return (n ? 'Phase ' + n + ' · ' : '') + p.title;
  }

  function sortedArtifacts(ctx) {
    var list = (coll(ctx).artifacts || []).slice();
    var dated = list.filter(function (a) { return a.updatedAt; });
    if (!dated.length) return list;              /* keep fixture order; never invent one */
    return list.sort(function (a, b) {
      var av = a.updatedAt || '', bv = b.updatedAt || '';
      if (av && bv) return String(bv).localeCompare(String(av));
      return av ? -1 : bv ? 1 : 0;
    });
  }

  function items(ctx, domain) {
    var sc = coll(ctx);
    if (domain === 'goal') {
      if (!(ctx.activityDefs() || {}).goal) return [];
      var g = ctx.activityDefs().goal, gp = goalProgress(ctx);
      return [{
        domain: 'goal', id: 'goal', title: g.summary, sub: goalSummaryLine(ctx),
        right: gp.total ? gp.completed + '/' + gp.total : String(g.count || '—'),
        ledger: gp.total ? gp.completed + '/' + gp.total + ' phases' : String(g.count || ''),
        tone: g.tone === 'blocked' ? 'blocked' : g.tone === 'done' ? 'done' : g.tone === 'working' ? 'working' : 'pending',
        progress: pct(gp.completed, gp.total), state: titleCase(g.detail.split(' · ')[0] || 'active'),
        action: 'open-goal', attrs: '', raw: null
      }];
    }
    if (domain === 'todo') {
      return (sc.todos || []).map(function (t) {
        var sm = statusMeta(t.status, todoTone(t.status)), tone = sm.tone;
        var ph = phaseLabel(ctx, t.goalPhaseId);
        return {
          domain: 'todo', id: t.id, title: t.label, sub: [t.source, ph, t.blocker].filter(Boolean).join(' · '),
          right: sm.label, tone: tone,
          /* the ledger's Detail cell is ~90px: keep it to one short fact, the
             phase join is already on the row's sub-line and in the detail card */
          ledger: t.source || (ph ? ph : '—'),
          /* no synthetic progress: a todo has a status, not a percentage, and
             inventing 55% for "in progress" is the same class of fake as a
             hand-written count */
          progress: null,
          state: sm.label, action: 'open-todo',
          attrs: ' data-id="' + esc(ctx, t.id) + '"',
          stamp: t.updatedAt || null, raw: t
        };
      });
    }
    if (domain === 'subagents') {
      /* hosted, each record is a PM_WORK agent (app.js workSubagents, F3-2): its word, tone and ticking time are the
         projection's, the ones the rail, Home's board and the status bar's panel show for it */
      var WK = window.PM_WORK;
      return (sc.subagents || []).map(function (a) {
        var counts = a.counts && typeof a.counts === 'object'
          ? Object.keys(a.counts).map(function (k) { return a.counts[k] + ' ' + k; }).join(' · ') : '';
        var sm = statusMeta(a.status, agentTone(a.status)), w = a.work && WK ? a.work : null;
        var word = w ? WK.word(w) : sm.label, tone = w ? WK.tone(w) : sm.tone;
        return {
          domain: 'subagents', id: a.id, title: a.name,
          sub: [a.model, a.blocker || a.current].filter(Boolean).join(' · '),
          subHtml: (a.model ? '<u class="agent-model">' + esc(ctx, a.model) + '</u>' : '') +
            ((a.blocker || a.current) ? (a.model ? ' · ' : '') + esc(ctx, a.blocker || a.current) : ''),
          right: word + (a.elapsed ? ' · ' + a.elapsed : ''),
          elapsed: a.elapsed || '', timeId: w ? w.id : null,
          ledger: a.elapsed || '—',
          tone: tone,
          progress: a.progress == null ? null : Number(a.progress) || 0,
          state: word, action: 'open-agent',
          attrs: ' data-id="' + esc(ctx, a.id) + '"',
          /* a subagent's face is its puppet mark (app.js agentPuppet, the Crew members' size), never initials */
          mark: ctx.agentPuppet ? ctx.agentPuppet('pmap-agent-mark', a, 18) : '',
          group: a.group || a.parent || 'Unassigned', meta: counts, raw: a
        };
      });
    }
    if (domain === 'processes') {
      var W = window.PM_WORK;
      if (!W) return [];
      return W.sort(sc.processes || []).map(function (p) {
        var o = W.owner(p), t = W.tone(p);
        return {
          domain: 'processes', id: p.id, title: p.title,
          sub: W.needsYou(p) && p.ask ? p.ask : [o ? o.title : '', p.kind === 'scheduled' ? p.detail : p.command].filter(Boolean).join(' · '),
          right: W.word(p), tone: t === 'attention' ? 'attention' : t,
          ledger: W.time(p), progress: p.progress && W.isLive(p) ? pct(p.progress.done, p.progress.total) : null,
          state: W.word(p), elapsed: W.time(p), action: 'open-process',
          attrs: ' data-id="' + esc(ctx, p.id) + '"', group: o ? o.title : 'This thread', raw: p
        };
      });
    }
    if (domain === 'crew') {
      var seatIn = {};
      return (sc.crew || []).concat(window.PM56_CREW?.activityMembers(ctx)||[]).map(function (a) {
        var sm = statusMeta(a.status, agentTone(a.status));
        /* a Crew member's face is its cast mark (silhouette x hue, the card's head cluster), never initials */
        var runKey = a.crewRunId || a.runId || '';
        seatIn[runKey] = (seatIn[runKey] || 0) + 1;
        var SH = window.PM56_SHELL;
        var mark = SH && SH.pmxMark ? SH.pmxMark({ role: a.effectivePersona || a.requestedPersona || a.persona || 'Implementer', seat: ((seatIn[runKey] - 1) % 8) + 1, size: 18, state: a.status === 'working' ? 'working' : a.status === 'done' ? 'done' : 'idle' }) : '';
        return {
          domain: 'crew', id: a.id, title: a.name, sub: a.current || '',
          right: sm.label, ledger: sm.label,
          tone: sm.tone, progress: null,
          state: sm.label, action: 'open-crew',
          attrs: ' data-id="' + esc(ctx, a.id) + '"',
          mark: mark,
          group: 'Crew', raw: a
        };
      });
    }
    if (domain === 'changes') {
      var list = sc.changes || [];
      var maxChurn = list.reduce(function (m, c) { return Math.max(m, (Number(c.add) || 0) + (Number(c.del) || 0)); }, 0);
      return list.map(function (c) {
        var churn = (Number(c.add) || 0) + (Number(c.del) || 0);
        var sp = splitPath(c.path), sm = statusMeta(c.status || 'modified', 'changed');
        var addN = Number(c.add) || 0, delN = Number(c.del) || 0;
        return {
          domain: 'changes', id: c.id || c.path, title: sp.file, sub: [sp.dir, c.summary].filter(Boolean).join(' · '),
          right: '+' + addN + ' −' + delN,
          rightHtml: churnPair(addN, delN),
          ledger: '+' + addN + ' −' + delN,
          tone: sm.tone, progress: pct(churn, maxChurn),
          state: sm.label, action: 'open-change',
          attrs: ' data-path="' + esc(ctx, c.path) + '" data-id="' + esc(ctx, c.id || c.path) + '"',
          line: c.line || 1, meta: (Array.isArray(c.hunks) ? c.hunks.length : 0) + ' hunks', raw: c
        };
      });
    }
    return sortedArtifacts(ctx).map(function (a) {
      var sm = statusMeta(a.status, artifactTone(a.status));
      return {
        domain: 'artifacts', id: a.id, title: a.title, sub: a.summary,
        right: sm.label, tone: sm.tone,
        ledger: 'v' + (a.version == null ? '?' : a.version) + (a.updated ? ' · ' + a.updated : ''),
        progress: null,
        state: sm.label, action: 'open-artifact',
        attrs: ' data-id="' + esc(ctx, a.id) + '" data-artifact-id="' + esc(ctx, a.id) + '"',
        kind: a.kind, version: a.version, stamp: a.updatedAt || null,
        display: a.updated || relTime(ctx, a.updatedAt, ''), raw: a
      };
    });
  }

  function countOf(ctx, domain) {
    if (domain === 'goal') { var gp = goalProgress(ctx); return gp.total ? gp.completed + '/' + gp.total : '—'; }
    if (domain === 'processes') { var d = (ctx.activityDefs() || {}).processes; return d ? d.count : '0'; }
    return String(items(ctx, domain).length);
  }
  function domainTone(ctx, domain) {
    var d = ctx.activityDefs()[domain];
    return (d && d.tone) || 'idle';
  }

  /* -------------------------------------------------------- shared fragments */
  function toneDot(tone, loop) {
    return '<i class="pmap-dot pmap-tone-' + tone + '"' + (loop ? ' data-pmap-loop' : '') + '></i>';
  }
  function scopeStrip(ctx) {
    var live = liveDomains(ctx);
    if (live.length <= 1) return '';
    var all = scopeOf(ctx) === 'all', f = focusOf(ctx);
    var hidden = live.length - 1;
    return '<div class="pmap-scope" data-k="pmap-scope">' +
      '<span class="pmap-scope-icon">' + ctx.icon('filter', 11) + '</span>' +
      '<span class="pmap-scope-text">' + (all
        ? 'All ' + live.length + ' domains'
        : 'Showing ' + esc(ctx, LABELS[f]) + ' only · ' + hidden + ' hidden') + '</span>' +
      '<button class="pmap-scope-btn" data-action="activity-scope" data-value="' + (all ? 'focus' : 'all') +
      '" aria-label="' + (all ? 'Focus ' + esc(ctx, LABELS[f]) : 'Show all activity domains') + '">' +
      (all ? 'Focus ' + esc(ctx, LABELS[f]) : 'Show all') + '</button></div>';
  }
  /* The jump used by the concepts that hide the other domains. */
  function domainChips(ctx, cls) {
    var f = focusOf(ctx);
    return '<div class="pmap-chips ' + (cls || '') + '" data-k="pmap-chips">' + liveDomains(ctx).map(function (id) {
      var on = scopeOf(ctx) === 'focus' && id === f;
      return '<button class="pmap-chip' + (on ? ' is-on' : '') + '" data-action="focus-activity" data-domain="' + id +
        '" aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="Focus ' + esc(ctx, LABELS[id]) + '">' +
        ctx.icon(iconOf(id), 11, lit(domainTone(ctx, id))) + '<span>' + esc(ctx, LABELS[id]) + '</span><b>' + esc(ctx, countOf(ctx, id)) + '</b></button>';
    }).join('') + '</div>';
  }
  function emptyNote(ctx, text) {
    /* W4 (lane chatpip): the one empty-list line, a sleeping Pip where the info glyph was (PM56_SHELL.pmxEmpty) */
    var S = window.PM56_SHELL;
    if (S && S.pmxEmpty && window.PMLogo) return S.pmxEmpty({ tag: 'div', cls: 'pmap-empty', key: 'pmap-empty', text: '<span>' + esc(ctx, text) + '</span>' });
    return '<div class="pmap-empty" data-k="pmap-empty">' + ctx.icon('info', 12) + '<span>' + esc(ctx, text) + '</span></div>';
  }

  /* ------------------------------------------------------------ diff hunks
     Line numbers come from the fixture and are never computed here — computing
     them is what produced the fabricated diff this wave is replacing. */
  function renderHunks(ctx, c) {
    if (!c) return '';
    if (!Array.isArray(c.hunks) || !c.hunks.length) {
      return '<div class="pmap-nodiff">' + ctx.icon('info', 11) +
        '<span>No diff content in this fixture — +' + (Number(c.add) || 0) + ' −' + (Number(c.del) || 0) +
        ' recorded on ' + esc(ctx, c.path) + '.</span></div>';
    }
    return '<div class="pmap-diff">' + c.hunks.map(function (h) {
      var lines = Array.isArray(h.lines) ? h.lines : [];
      return '<div class="pmap-hunk-head">' + esc(ctx, h.header || '@@') + '</div>' + lines.map(function (l) {
        var kind = l.kind === 'add' || l.kind === 'del' || l.kind === 'meta' ? l.kind : 'ctx';
        return '<div class="pmap-dl pmap-dl-' + kind + '"><span class="pmap-ln">' +
          (l.old == null ? '' : l.old) + '</span><span class="pmap-ln">' +
          (l.new == null ? '' : l.new) + '</span><span class="pmap-sig">' +
          (kind === 'add' ? '+' : kind === 'del' ? '−' : kind === 'meta' ? '\\' : ' ') +
          '</span><code>' + esc(ctx, l.text) + '</code></div>';
      }).join('');
    }).join('') + '</div>';
  }

  /* ------------------------------------------------------------ detail card
     Shown wherever a concept has room for the selected item.  Every field is
     read defensively; a field the fixture has not grown yet is simply absent
     rather than rendered as a blank or a zero. */
  function kv(ctx, label, value) {
    if (value == null || value === '') return '';
    return '<div class="pmap-kv"><label>' + esc(ctx, label) + '</label><span>' + esc(ctx, value) + '</span></div>';
  }
  function kvHtml(ctx, label, html) {
    if (html == null || html === '') return '';
    return '<div class="pmap-kv"><label>' + esc(ctx, label) + '</label><span>' + html + '</span></div>';
  }
  function detailCard(ctx, domain, id) {
    if (domain === 'goal') return '<div class="pmap-detail" data-k="pmap-detail:goal">' + goalBody(ctx) + '</div>';
    /* a process's detail is the one detail block every surface shows (48-work.js, PM7_WORK_UI.detail) */
    if (domain === 'processes') {
      var W = window.PM_WORK, UI = window.PM7_WORK_UI, pr = W && W.item(id);
      return pr && UI ? '<div class="pmap-detail pmap-proc-detail" data-k="pmap-detail:processes:' + esc(ctx, id) + '">' + UI.detail(pr) + '</div>' : '';
    }
    var list = items(ctx, domain);
    var it = list.filter(function (x) { return x.id === id; })[0];
    if (!it) return '';
    var r = it.raw || {}, body = '';
    if (domain === 'todo') {
      body = kv(ctx, 'Status', statusMeta(r.status, todoTone(r.status)).label) + kv(ctx, 'Source', r.source) +
        kv(ctx, 'Goal phase', phaseLabel(ctx, r.goalPhaseId) || (r.goalPhaseId ? r.goalPhaseId : 'Not stamped')) +
        kv(ctx, 'Blocker', r.blocker) + kv(ctx, 'Updated', r.updatedAt ? relTime(ctx, r.updatedAt, '') + ' ago' : null);
    } else if (domain === 'subagents') {
      var route = r.route && typeof r.route === 'object' ? (r.route.label || [r.route.provider, r.route.account, r.route.model].filter(Boolean).join(' · ')) : r.route;
      body = kv(ctx, 'Status', it.state) +
        (r.model ? kvHtml(ctx, 'Model', '<u class="agent-model">' + esc(ctx, r.model) + '</u>') : '') +
        kv(ctx, 'Route', route) + kv(ctx, 'Parent', r.parent) +
        kv(ctx, 'Elapsed', r.elapsed) + kv(ctx, 'Progress', (Number(r.progress) || 0) + '%') +
        (it.meta ? kv(ctx, 'Work', it.meta) : '') + kv(ctx, 'Blocker', r.blocker);
    } else if (domain === 'crew') {
      body = kv(ctx, 'Role', r.name) + kv(ctx, 'Status', statusMeta(r.status, agentTone(r.status)).label) +
        kv(ctx, 'Current', r.current);
    } else if (domain === 'changes') {
      body = kv(ctx, 'Status', statusMeta(r.status || 'modified', 'changed').label) +
        kv(ctx, 'Path', r.path) +
        kv(ctx, 'Range', 'from line ' + (r.line || 1)) +
        kv(ctx, 'Delta', '+' + (Number(r.add) || 0) + ' −' + (Number(r.del) || 0)) +
        kv(ctx, 'Language', r.language) + kv(ctx, 'Renamed from', r.oldPath) +
        renderHunks(ctx, r);
    } else {
      body = kv(ctx, 'Kind', r.kind) + kv(ctx, 'Version', r.version) +
        kv(ctx, 'Status', statusMeta(r.status, artifactTone(r.status)).label) +
        kv(ctx, 'Updated', r.updatedAt ? relTime(ctx, r.updatedAt, '') + ' ago' : r.updated) +
        kv(ctx, 'Thread', r.threadId) + kv(ctx, 'Error', r.error && (r.error.reason || r.error));
    }
    var open = domain === 'changes'
      ? '<button class="soft-button" data-action="open-change" data-path="' + esc(ctx, r.path) + '">' + ctx.icon('file-edit', 12) + ' Open at line ' + (r.line || 1) + '</button>'
      : domain === 'subagents'
        ? '<button class="soft-button" data-action="open-agent" data-id="' + esc(ctx, r.id) + '">' + ctx.icon('eye', 12) + ' Open live transcript</button>'
        : domain === 'artifacts'
          ? '<button class="soft-button" data-action="open-artifact" data-id="' + esc(ctx, r.id) + '" data-artifact-id="' + esc(ctx, r.id) + '">' + ctx.icon('expand', 12) + ' Open artifact</button>'
          : '';
    return '<div class="pmap-detail" data-k="pmap-detail:' + esc(ctx, domain + ':' + id) + '">' +
      '<div class="pmap-detail-head">' + toneDot(it.tone) + '<strong>' + esc(ctx, it.title) + '</strong>' +
      '<button class="icon-button pmap-detail-close" data-action="activity-deselect" title="Clear selection">' + ctx.icon('close', 11) + '</button></div>' +
      (it.sub ? '<p class="pmap-detail-sub">' + esc(ctx, it.sub) + '</p>' : '') +
      '<div class="pmap-kvs">' + body + '</div>' +
      (open ? '<div class="pmap-detail-actions">' + open + '</div>' : '') + '</div>';
  }

  /* =======================================================================
     CONCEPT 0 — Accordion Inspector  (the baseline: five collapsible
     sections).  Kept as the reference shape, but the sections it renders now
     obey the domain filter, and its rows are all selectable.
     ===================================================================== */
  function conceptAccordion(ctx) {
    var vis = visibleDomains(ctx), f = focusOf(ctx);
    var exp = Array.isArray(act(ctx).expanded) ? act(ctx).expanded : DOMAINS;
    var out = vis.map(function (id) {
      var d = ctx.activityDefs()[id], focused = id === f;
      if (!d) return '';
      /* the focused domain is always open — that is what "focus" has to mean
         visibly, and it is the pixel difference between two bar clicks */
      var open = focused || exp.indexOf(id) >= 0;
      var body = '';
      if (open) {
        body = '<div class="activity-section-body">' + (id === 'goal' ? goalBody(ctx) : items(ctx, id).map(function (it) {
          var on = isSelected(ctx, id, it.id);
          return '<button class="activity-line pmap-row' + (on ? ' is-selected' : '') + '" data-k="pmap-a:' + esc(ctx, id + ':' + it.id) + '" data-action="' + it.action + '" data-domain="' + id + '"' + it.attrs + '>' +
            '<span class="pmap-row-mark">' + (it.mark || toneDot(it.tone, it.tone === 'working')) + '</span>' +
            '<span class="copy"><strong>' + esc(ctx, it.title) + '</strong><span>' + esc(ctx, it.sub) + '</span></span>' +
            '<span class="right">' + esc(ctx, it.right) + '</span></button>' +
            (on ? detailCard(ctx, id, it.id) : '');
        }).join('') || emptyNote(ctx, 'No ' + LABELS[id].toLowerCase() + ' records in this fixture.')) + '</div>';
      }
      return '<section class="activity-section pmap-section' + (focused ? ' is-focus' : '') + '" data-domain-section="' + id + '" data-k="pmap-sec:' + id + '">' +
        '<button class="activity-section-head" data-action="toggle-activity-section" data-domain="' + id + '">' +
        '<span class="event-icon" style="width:24px;height:24px">' + ctx.icon(d.icon, 12, lit(domainTone(ctx, id))) + '</span>' +
        '<strong>' + esc(ctx, d.label) + '</strong>' +
        '<span class="pmap-head-sub">' + esc(ctx, d.summary) + '</span><span class="spacer"></span>' +
        '<span class="meta-pill">' + esc(ctx, d.count) + '</span>' + ctx.icon(open ? 'up' : 'down', 11) + '</button>' + body + '</section>';
    }).join('');
    return '<div class="pmap pmap-accordion" data-k="pmap:0">' + scopeStrip(ctx) + out +
      '</div>';
  }

  /* A row shared by the concepts that want a list but not an accordion. */
  function compactRow(ctx, it, extraCls) {
    var on = isSelected(ctx, it.domain, it.id);
    var right = it.rightHtml != null ? it.rightHtml : esc(ctx, it.right);
    return '<button class="pmap-row' + (on ? ' is-selected' : '') + (extraCls ? ' ' + extraCls : '') +
      '" data-k="pmap-r:' + esc(ctx, it.domain + ':' + it.id) + '" data-action="' + it.action +
      '" data-domain="' + it.domain + '"' + it.attrs + '>' +
      /* an agent row (Crew's members, and Subagents in the all-domains list) draws its Pip like every agent row
         (SSYS-056, Muse M3); other rows keep their dot */
      '<span class="pmap-row-mark">' + (it.mark || toneDot(it.tone, it.tone === 'working')) + '</span>' +
      '<span class="copy"><strong>' + esc(ctx, it.title) + '</strong><span>' + esc(ctx, it.sub) + '</span></span>' +
      '<span class="right">' + right + '</span></button>' +
      (on ? detailCard(ctx, it.domain, it.id) : '');
  }
  function agentRow(ctx, it) {
    var on = isSelected(ctx, it.domain, it.id);
    return '<button class="pmap-row pmap-agent-row' + (on ? ' is-selected' : '') +
      '" data-k="pmap-r:' + esc(ctx, it.domain + ':' + it.id) + '" data-action="' + it.action +
      '" data-domain="' + it.domain + '" data-state="' + it.tone + '"' + it.attrs + '>' +
      (it.mark || '') +
      '<span class="copy"><strong>' + esc(ctx, it.title) + '</strong>' +
      (it.sub ? '<span>' + (it.subHtml || esc(ctx, it.sub)) + '</span>' : '') + '</span>' +
      '<span class="right"><b>' + esc(ctx, it.state) + '</b>' +
      (it.elapsed ? '<i' + (it.timeId ? ' data-work-time="' + esc(ctx, it.timeId) + '"' : '') + '>' + esc(ctx, it.elapsed) + '</i>' : '') + '</span></button>' +
      (on ? detailCard(ctx, it.domain, it.id) : '');
  }
  function domainList(ctx, id) {
    if (id === 'goal') return goalBody(ctx);
    var list = items(ctx, id);
    if (!list.length) return emptyNote(ctx, 'No ' + LABELS[id].toLowerCase() + ' records in this fixture.');
    if (id === 'subagents') return list.map(function (it) { return agentRow(ctx, it); }).join('');
    return list.map(function (it) { return compactRow(ctx, it); }).join('');
  }

  /* =======================================================================
     CONCEPT 1 — Status Board. All scope is a bounded thread overview; focus
     scope is one domain summary plus its real records. The two modes are
     intentionally different structures so Show all cannot update copy while
     leaving the same one-domain body behind.
     ===================================================================== */
  /* Every proportion drawn anywhere in this file states what it measures.  A
     bar or a ring with no caption is the same fake as a hand-written count. */
  var MEASURE_CAPTION = {
    goal: 'phases completed', todo: 'todos completed', subagents: 'agents finished',
    crew: 'crew members ready', changes: 'additions of churn', artifacts: 'artifacts ready'
  };
  function settledShare(ctx, id) {
    if (id === 'goal') { var g = goalProgress(ctx); return pct(g.completed, g.total); }
    var list = items(ctx, id);
    return pct(list.filter(function (x) { return x.tone === 'done'; }).length, list.length);
  }
  function measureValue(ctx, id) {
    if (id === 'changes') {
      /* "settled" is meaningless for a changed file, so the changes measure is
         the additive share of total churn -- derived, never invented */
      var list = coll(ctx).changes || [];
      var add = list.reduce(function (a, c) { return a + (Number(c.add) || 0); }, 0);
      var del = list.reduce(function (a, c) { return a + (Number(c.del) || 0); }, 0);
      return pct(add, add + del);
    }
    return settledShare(ctx, id);
  }
  function toneCount(list, tones) {
    return list.filter(function (it) { return tones.indexOf(it.tone) >= 0; }).length;
  }
  function fact(label, value, tone) { return { label: label, value: String(value), tone: tone || '' }; }
  function churnPair(add, del) {
    return '<span class="pmap-churn"><b>+' + add + '</b><i>−' + del + '</i></span>';
  }
  function factCells(ctx, facts) {
    return facts.map(function (entry) {
      var tone = entry.tone === 'add' || entry.tone === 'del' ? ' class="is-' + entry.tone + '"' : '';
      return '<span><small>' + esc(ctx, entry.label) + '</small><b' + tone + '>' + esc(ctx, entry.value) + '</b></span>';
    }).join('');
  }
  function domainPresentation(ctx, id) {
    var list = items(ctx, id), facts = [], meter = null;
    if (id === 'goal' || id === 'subagents' || id === 'artifacts') {
      return { list: list, facts: [], meter: null };
    } else if (id === 'todo') {
      facts = [fact('Active', toneCount(list, ['working'])), fact('Blocked', toneCount(list, ['blocked']))];
      if (list.length) meter = { value: settledShare(ctx, id), label: 'Todos completed' };
    } else if (id === 'processes') {
      facts = [fact('Running', toneCount(list, ['working'])), fact('Needs input', list.filter(function (it) { return window.PM_WORK && window.PM_WORK.needsYou(it.raw); }).length)];
    } else if (id === 'crew') {
      facts = [fact('Working', toneCount(list, ['working'])), fact('Waiting', toneCount(list, ['attention', 'idle']))];
      if (list.length) meter = { value: settledShare(ctx, id), label: 'Crew members ready' };
    } else if (id === 'changes') {
      var changes = coll(ctx).changes || [];
      var add = changes.reduce(function (sum, change) { return sum + (Number(change.add) || 0); }, 0);
      var del = changes.reduce(function (sum, change) { return sum + (Number(change.del) || 0); }, 0);
      facts = [fact('Added', '+' + add, 'add'), fact('Deleted', '−' + del, 'del')];
      meter = { split: true, add: add, del: del, label: 'Change mix' };
    }
    return { list: list, facts: facts.slice(0, 2), meter: meter };
  }
  function meterMarkup(ctx, meter) {
    if (!meter) return '';
    if (meter.split) {
      var total = meter.add + meter.del;
      var addShare = total ? pct(meter.add, total) : 0;
      return '<div class="pmap-measure" aria-label="' + esc(ctx, meter.label + ': +' + meter.add + ' additions and −' + meter.del + ' deletions') + '">' +
        '<span class="pmap-measure-label"><span>' + esc(ctx, meter.label) + '</span>' + churnPair(meter.add, meter.del) + '</span>' +
        '<span class="pmap-meter pmap-meter-split"><b class="is-add" style="width:' + addShare + '%"></b><b class="is-del" style="width:' + (100 - addShare) + '%"></b></span></div>';
    }
    return '<div class="pmap-measure" aria-label="' + esc(ctx, meter.label + ': ' + meter.value + ' percent') + '">' +
      '<span class="pmap-measure-label"><span>' + esc(ctx, meter.label) + '</span><b>' + meter.value + '%</b></span>' +
      '<span class="pmap-meter"><b style="width:' + meter.value + '%"></b></span></div>';
  }
  function domainState(ctx, id) {
    var tone = domainTone(ctx, id);
    return { tone: tone, label: toneLabel(tone) };
  }
  function boardTile(ctx, id) {
    var d = ctx.activityDefs()[id], p = domainPresentation(ctx, id), state = domainState(ctx, id);
    var slim = id === 'goal' || id === 'subagents' || id === 'artifacts';
    var facts = (slim || !p.facts.length) ? '' : '<span class="pmap-tile-facts">' + factCells(ctx, p.facts) + '</span>';
    var footStatus = slim ? '' : '<span>' + toneDot(state.tone, state.tone === 'working') + esc(ctx, state.label) + '</span>';
    return '<button class="pmap-tile' + (slim ? ' is-slim' : '') + '" data-k="pmap-tile:' + id + '" data-action="focus-activity" data-domain="' + id +
      '" data-tone="' + state.tone + '" aria-label="View ' + esc(ctx, d.label) + ' activity details">' +
      '<span class="pmap-tile-head"><span class="pmap-tile-ident">' + ctx.icon(d.icon, 14, lit(state.tone)) + '<span>' +
      esc(ctx, d.label) + '</span></span><strong>' + esc(ctx, d.count) + '</strong></span>' +
      '<span class="pmap-tile-sum">' + esc(ctx, d.summary) + '</span>' +
      facts + meterMarkup(ctx, slim ? null : p.meter) +
      '<span class="pmap-tile-foot">' + footStatus +
      '<span>View details ' + ctx.icon('chevron', 11) + '</span></span></button>';
  }
  function conceptStatusBoard(ctx) {
    var live = liveDomains(ctx), f = focusOf(ctx), d = ctx.activityDefs()[f] || {};
    if (scopeOf(ctx) === 'all') {
      return '<div class="pmap pmap-statusboard is-overview" data-k="pmap:1">' +
        '<div class="pmap-overview-head" data-k="pmap-overview-head"><strong>Thread activity</strong></div>' +
        '<div class="activity-concept-board" data-k="pmap-board">' + live.map(function (id) { return boardTile(ctx, id); }).join('') + '</div></div>';
    }
    var p = domainPresentation(ctx, f), state = domainState(ctx, f);
    var records = f === 'goal'
      ? (goalCompact(ctx) || emptyNote(ctx, goalSummaryLine(ctx)))
      : domainList(ctx, f);
    var summary = '';
    if (f !== 'goal') {
      var head = '<div class="pmap-focus-head"><span class="pmap-focus-ident">' + ctx.icon(iconOf(f), 15, lit(state.tone)) + '<strong>' +
        esc(ctx, LABELS[f]) + '</strong></span><span class="pmap-focus-count">' + esc(ctx, d.count || countOf(ctx, f)) + '</span></div>';
      if (f === 'artifacts') {
        summary = '<section class="pmap-focus-summary" data-k="pmap-focus-summary:' + f + '" data-tone="' + state.tone + '">' +
          head + '</section>';
      } else if (f === 'subagents') {
        summary = '<section class="pmap-focus-summary" data-k="pmap-focus-summary:' + f + '" data-tone="' + state.tone + '">' +
          head + '<p>' + esc(ctx, d.summary || d.detail) + '</p></section>';
      } else {
        summary = '<section class="pmap-focus-summary" data-k="pmap-focus-summary:' + f + '" data-tone="' + state.tone + '">' +
          head + '<p>' + esc(ctx, d.summary || d.detail) + '</p><div class="pmap-focus-facts">' + factCells(ctx, p.facts) + '</div>' + meterMarkup(ctx, p.meter) +
          '<div class="pmap-focus-state">' + toneDot(state.tone, state.tone === 'working') + '<span>' + esc(ctx, state.label) + '</span></div></section>';
      }
    }
    return '<div class="pmap pmap-statusboard is-focused" data-k="pmap:1">' + scopeStrip(ctx) + summary +
      '<section class="pmap-records" data-k="pmap-records:' + f + '"><div class="pmap-records-head"><strong>' +
      (f === 'goal' ? 'Goal progress' : 'Recent records') + '</strong><span>' +
      (f === 'goal' ? esc(ctx, d.detail || '') : p.list.length + ' total') + '</span></div>' + records +
      '</section></div>';
  }

  /* =======================================================================
     CONCEPT 2 — Goal Tree.  `.activity-goal-tree` / `.tree-root` / `.tree-child`
     given the hierarchy they were designed for: the goal is the root, each
     domain is a collapsible branch, each record is a leaf.  Interaction is
     disclosure by branch, which nothing else here does.
     ===================================================================== */
  function conceptGoalTree(ctx) {
    var f = focusOf(ctx), open = branches(ctx);
    var live = liveDomains(ctx);
    var branchIds = scopeOf(ctx) === 'focus' ? (live.indexOf(f) >= 0 ? [f] : live.slice(0, 1)) : live.slice();
    var defs = ctx.activityDefs() || {};
    var g = defs.goal;
    var gp = goalProgress(ctx);
    var body = branchIds.map(function (id) {
      var d = defs[id], isOpen = open.indexOf(id) >= 0;
      if (!d) return '';
      var head = '<button class="tree-child tree-branch' + (id === f ? ' is-focus' : '') +
        '" data-k="pmap-b:' + id + '" data-action="activity-branch" data-domain="' + id + '">' +
        '<span class="pmap-twisty">' + ctx.icon(isOpen ? 'down' : 'chevron', 10) + '</span>' +
        ctx.icon(d.icon, 11, lit(domainTone(ctx, id))) + '<span class="pmap-tree-label">' + esc(ctx, d.label) + '</span>' +
        '<b>' + esc(ctx, d.count) + '</b></button>';
      if (!isOpen) return head;
      if (id === 'goal') {
        var compact = goalCompact(ctx);
        return head + '<div class="tree-leafbox" data-k="pmap-goalleaf">' +
          (compact || '<span class="pmap-tree-note">' + esc(ctx, goalSummaryLine(ctx)) + '</span>') + '</div>';
      }
      var list = items(ctx, id);
      if (!list.length) return head + '<span class="pmap-tree-note">Nothing recorded.</span>';
      return head + list.map(function (it) {
        return '<button class="tree-child tree-leaf' + (isSelected(ctx, id, it.id) ? ' is-selected' : '') +
          '" data-k="pmap-l:' + esc(ctx, id + ':' + it.id) + '" data-action="' + it.action +
          '" data-domain="' + id + '"' + it.attrs + '>' + toneDot(it.tone, it.tone === 'working') +
          '<span class="pmap-tree-label">' + esc(ctx, it.title) + '</span><b>' + esc(ctx, it.right) + '</b></button>';
      }).join('');
    }).join('');
    var sel = selected(ctx);
    var root = g
      ? '<button class="tree-root" data-action="open-goal" data-k="pmap-treeroot">' + ctx.icon('goal', 11, lit(domainTone(ctx, 'goal'))) +
        '<span class="pmap-tree-label">' + esc(ctx, g.summary) + '</span>' +
        '<b>' + (gp.total ? gp.completed + '/' + gp.total : esc(ctx, g.count)) + '</b></button>'
      : '';
    return '<div class="pmap pmap-treewrap" data-k="pmap:2">' + scopeStrip(ctx) +
      '<div class="activity-goal-tree">' + root +
      body + '</div>' +
      (sel && sel.domain !== 'goal' ? detailCard(ctx, sel.domain, sel.id) : '') + '</div>';
  }

  /* =======================================================================
     CONCEPT 3 — Split Master/Detail.  `.activity-master-detail`: a persistent
     domain rail on the left, one pane on the right.  This is the concept where
     the filter is the whole interaction — the rail's "All" entry is the only
     way to see more than one domain at a time, so a mis-wired filter would be
     immediately obvious rather than invisible.
     ===================================================================== */
  function conceptMasterDetail(ctx) {
    var f = focusOf(ctx), all = scopeOf(ctx) === 'all';
    var live = liveDomains(ctx);
    var rail = (live.length > 1
      ? '<button class="pmap-md-btn' + (all ? ' active' : '') + '" data-k="pmap-md:all" data-action="activity-scope" data-value="all" title="Show every domain">' +
        ctx.icon('collapse', 11) + '<span>All</span></button>'
      : '') +
      live.map(function (id) {
        var d = ctx.activityDefs()[id];
        return '<button class="pmap-md-btn' + (!all && id === f ? ' active' : '') + '" data-k="pmap-md:' + id +
          '" data-action="focus-activity" data-domain="' + id + '" title="' + esc(ctx, d.label) + ' · ' + esc(ctx, d.count) + '">' +
          ctx.icon(d.icon, 11, lit(domainTone(ctx, id))) + '<span>' + esc(ctx, d.label) + '</span></button>';
      }).join('');
    /* The `.detail` box is used for exactly the shape styles.css:366 describes —
       one bold line plus one muted line.  The record list lives underneath it at
       full panel width, because a 96px rail plus a list inside a 240px-minimum
       panel is not a readable split. */
    var headTitle = all ? 'All domains' : LABELS[f];
    var headSub = all
      ? live.map(function (id) { return LABELS[id] + ' ' + countOf(ctx, id); }).join(' · ')
      : (ctx.activityDefs()[f] && ctx.activityDefs()[f].detail) || '';
    var list = all
      ? live.map(function (id) {
        var d = ctx.activityDefs()[id];
        return '<div class="pmap-md-group" data-k="pmap-mdg:' + id + '">' +
          '<div class="pmap-sub-head">' + ctx.icon(d.icon, 11, lit(domainTone(ctx, id))) + '<strong>' + esc(ctx, d.label) +
          '</strong><span class="spacer"></span><span class="meta-pill">' + esc(ctx, d.count) + '</span></div>' +
          domainList(ctx, id) + '</div>';
      }).join('')
      : '<div class="pmap-md-group" data-k="pmap-mdg:' + f + '">' + domainList(ctx, f) + '</div>';
    return '<div class="pmap pmap-mdwrap" data-k="pmap:3">' +
      '<div class="activity-master-detail">' +
      '<div class="master" data-k="pmap-master">' + rail + '</div>' +
      '<div class="detail" data-k="pmap-detailbox"><strong>' + esc(ctx, headTitle) + '</strong>' +
      '<span>' + esc(ctx, headSub) + '</span></div></div>' +
      '<div class="pmap-md-list" data-k="pmap-mdlist">' + list + '</div></div>';
  }

  /* =======================================================================
     CONCEPT 4 — Agent Board.  `.activity-agent-board` as a set of status
     lanes: every record in the panel, from any domain, sorted into
     Working / Stalled / Waiting / Queued / Settled and drawn as a progress
     card.  It answers "what is moving right now" rather than "what is where",
     which is the one question the accordion cannot answer at a glance.
     "Blocked" reads as **stalled** in the copy, per the goal handoff's rule.
     ===================================================================== */
  /* Lane marks are the shared status set (neon icons step 3B): the working mark, the blocked lock, the hourglass of
     waiting on something, the dashed ring of queued, the done check; Changed keeps the changes glyph. Each is drawn
     bare and lit in its lane's tone — static, so the lane head carries no loop (the mark replaces the tone dot). */
  var LANES = [
    { tone: 'working', label: 'Working', icon: 'st-working' },
    { tone: 'blocked', label: 'Stalled', icon: 'st-blocked' },
    { tone: 'waiting', label: 'Waiting', icon: 'st-waiting-dep' },
    { tone: 'changed', label: 'Changed', icon: 'changes' },
    { tone: 'pending', label: 'Queued', icon: 'st-pending' },
    { tone: 'done', label: 'Settled', icon: 'st-complete' }
  ];
  function boardCard(ctx, it) {
    var on = isSelected(ctx, it.domain, it.id);
    var face = it.mark ? '<span class="pmap-av pmap-av-glyph">' + it.mark + '</span>'
      : '<span class="pmap-av pmap-av-glyph">' + ctx.icon(iconOf(it.domain), 12) + '</span>';
    return '<button class="pmap-card' + (on ? ' is-selected' : '') + '" data-k="pmap-c:' + esc(ctx, it.domain + ':' + it.id) +
      '" data-action="' + it.action + '" data-domain="' + it.domain + '"' + it.attrs + '>' + face +
      '<strong>' + esc(ctx, it.title) + '</strong>' +
      '<span class="pmap-card-sub">' + esc(ctx, it.sub || LABELS[it.domain]) + '</span>' +
      (it.progress == null ? '' : '<span class="agent-progress"><b style="width:' + Math.max(0, Math.min(100, Number(it.progress) || 0)) + '%"></b></span>') +
      '<span class="pmap-card-foot"><span class="pmap-card-dom">' + esc(ctx, LABELS[it.domain]) + '</span>' +
      '<span class="pmap-card-right">' + esc(ctx, it.right) + '</span></span></button>';
  }
  function conceptAgentBoard(ctx) {
    var vis = visibleDomains(ctx);
    var pool = [];
    vis.forEach(function (id) { pool = pool.concat(items(ctx, id)); });
    var sel = selected(ctx);
    var lanes = LANES.map(function (lane) {
      var cards = pool.filter(function (it) { return it.tone === lane.tone; });
      if (!cards.length) return '';
      return '<section class="pmap-lane" data-k="pmap-lane:' + lane.tone + '">' +
        '<div class="pmap-lane-head">' + ctx.icon(lane.icon, 12, lit(lane.tone)) +
        '<strong>' + lane.label + '</strong><span class="spacer"></span>' +
        '<b>' + cards.length + '</b></div>' +
        '<div class="activity-agent-board">' + cards.map(function (it) { return boardCard(ctx, it); }).join('') + '</div>' +
        '</section>';
    }).join('');
    return '<div class="pmap pmap-boardlanes" data-k="pmap:4">' + scopeStrip(ctx) +
      (lanes || emptyNote(ctx, 'Nothing to show for this domain.')) +
      (sel ? detailCard(ctx, sel.domain, sel.id) : '') + '</div>';
  }

  /* =======================================================================
     CONCEPT 5 — File Ledger.  `.activity-ledger`: a dense monospace table with
     a header row, one line per record, no cards at all.  Its own interaction
     is inline expansion: a changed-file row opens the REAL unified diff from
     `changes[].hunks` in place.  (app.js's `renderFileEditor()` still
     fabricates eighteen lines and prints the same CREATE INDEX for every path;
     that function is inside the file nobody may reopen after Wave 1, so the
     honest diff lives here instead.)
     ===================================================================== */
  function conceptLedger(ctx) {
    var vis = visibleDomains(ctx), open = openRows(ctx);
    var rows = [];
    vis.forEach(function (id) {
      items(ctx, id).forEach(function (it) {
        var key = it.domain + ':' + it.id;
        var isOpen = open.indexOf(key) >= 0;
        var expandable = it.domain === 'changes';
        rows.push('<button class="pmap-ledger-row' + (isSelected(ctx, it.domain, it.id) ? ' is-selected' : '') +
          '" data-k="pmap-lg:' + esc(ctx, key) + '" data-action="' + (expandable ? 'activity-diff' : it.action) +
          '" data-domain="' + it.domain + '" data-key="' + esc(ctx, key) + '"' + it.attrs + '>' +
          '<span class="pmap-lg-dom">' + toneDot(it.tone, it.tone === 'working') +
          '<span>' + esc(ctx, LABELS[it.domain]) + '</span></span>' +
          '<span class="pmap-lg-state">' + esc(ctx, it.state) + '</span>' +
          '<span class="pmap-lg-rec">' + esc(ctx, it.title) + '</span>' +
          '<span class="pmap-lg-delta">' + esc(ctx, it.ledger == null ? it.right : it.ledger) +
          (expandable ? '<i class="pmap-lg-twist">' + ctx.icon(isOpen ? 'up' : 'down', 9) + '</i>' : '') + '</span>' +
          '</button>');
        if (expandable && isOpen) {
          rows.push('<div class="pmap-lg-diff" data-k="pmap-lgd:' + esc(ctx, key) + '">' +
            renderHunks(ctx, it.raw) +
            '<div class="pmap-detail-actions"><button class="soft-button" data-action="open-change" data-domain="changes" data-path="' +
            esc(ctx, it.raw.path) + '">' + ctx.icon('file-edit', 12) + ' Open at line ' + (it.raw.line || 1) + '</button></div></div>');
        } else if (!expandable && isSelected(ctx, it.domain, it.id)) {
          /* a ledger row that selects but shows nothing would be the same dead
             affordance the Todo rows had before this wave */
          rows.push('<div class="pmap-lg-diff" data-k="pmap-lgs:' + esc(ctx, key) + '">' +
            detailCard(ctx, it.domain, it.id) + '</div>');
        }
      });
    });
    return '<div class="pmap pmap-ledgerwrap" data-k="pmap:5">' + scopeStrip(ctx) +
      '<div class="activity-ledger">' +
      '<div class="pmap-ledger-head"><span class="pmap-lg-dom"><span>Domain</span></span>' +
      '<span class="pmap-lg-state">State</span><span class="pmap-lg-rec">Record</span>' +
      '<span class="pmap-lg-delta">Detail</span></div>' +
      (rows.join('') || '<div class="pmap-lg-none">Nothing recorded for this scope.</div>') +
      '</div></div>';
  }

  /* =======================================================================
     CONCEPT 6 — Live Work Feed.  `.activity-live-feed`: one vertical rail, a
     dot per event, newest at the top, with a live head node that names what is
     moving right now.  Reading order is time, not category — the only concept
     here where the five domains are interleaved rather than grouped.
     ===================================================================== */
  function conceptLiveFeed(ctx) {
    var vis = visibleDomains(ctx);
    var feed = [];
    vis.forEach(function (id) { feed = feed.concat(items(ctx, id)); });
    /* Stamped records sort by their fixed ISO time; unstamped ones keep fixture
       order behind them.  No synthetic clock — an invented timestamp is exactly
       the class of fake this wave is removing. */
    var stamped = feed.filter(function (x) { return isoTime(x.stamp) != null; });
    var plain = feed.filter(function (x) { return isoTime(x.stamp) == null; });
    stamped.sort(function (a, b) { return isoTime(b.stamp) - isoTime(a.stamp); });
    var ordered = stamped.concat(plain);
    var live = ordered.filter(function (x) { return x.tone === 'working'; })[0] ||
      ordered.filter(function (x) { return x.tone === 'blocked'; })[0] || ordered[0];
    var head = live
      ? '<span class="pmap-feed-head" data-k="pmap-feedhead"><i data-pmap-loop></i>' +
        '<b>now</b>' + esc(ctx, live.title) + ' — ' + esc(ctx, live.sub || live.state) + '</span>'
      : '';
    var body = ordered.map(function (it) {
      var when = it.stamp ? relTime(ctx, it.stamp, '') : (it.display || it.state);
      return '<button class="pmap-feed-row' + (isSelected(ctx, it.domain, it.id) ? ' is-selected' : '') +
        '" data-k="pmap-f:' + esc(ctx, it.domain + ':' + it.id) + '" data-action="' + it.action +
        '" data-domain="' + it.domain + '"' + it.attrs + '>' +
        '<i class="pmap-tone-' + it.tone + '"' + (it.tone === 'working' ? ' data-pmap-loop' : '') + '></i>' +
        '<b>' + esc(ctx, when) + '</b>' +
        '<span class="pmap-feed-title">' + esc(ctx, it.title) + '</span>' +
        '<span class="pmap-feed-sub">' + esc(ctx, LABELS[it.domain]) + ' · ' + esc(ctx, it.sub || it.state) + '</span>' +
        '</button>';
    }).join('');
    var sel = selected(ctx);
    return '<div class="pmap pmap-feedwrap" data-k="pmap:6">' + scopeStrip(ctx) +
      '<div class="activity-live-feed">' + head + (body || '<span>Nothing recorded for this scope.</span>') + '</div>' +
      (sel ? detailCard(ctx, sel.domain, sel.id) : '') + '</div>';
  }

  /* =======================================================================
     CONCEPT 7 — Overview Dashboard.  `.activity-dashboard` + `.ring-mini`:
     five SVG donuts, numbers first, each with a caption that states what its
     arc actually measures — because a ring whose meaning is unstated is the
     same fake as a hand-written count.  Below it, headline figures derived
     from the collections, then the focused domain's records.
     ===================================================================== */
  function ring(ctx, value, tone) {
    var stroke = tone === 'blocked' ? 'var(--danger)' : tone === 'waiting' ? 'var(--warning)'
      : tone === 'done' ? 'var(--positive)' : 'var(--accent)';
    return '<span class="ring-mini"><svg viewBox="0 0 36 36" width="38" height="38" aria-hidden="true">' +
      '<circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--surface-4)" stroke-width="3.2"/>' +
      '<circle class="pmap-ring-arc" cx="18" cy="18" r="15.915" fill="none" stroke="' + stroke +
      '" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="' + value + ' 100" transform="rotate(-90 18 18)"/>' +
      '</svg><em>' + value + '%</em></span>';
  }
  function conceptDashboard(ctx) {
    var f = focusOf(ctx), ranked = rankedDomains(ctx);
    var cells = ranked.map(function (id) {
      var d = ctx.activityDefs()[id], tone = domainTone(ctx, id);
      if (!d) return '';
      return '<button class="pmap-cell' + (id === f ? ' is-focus' : '') + '" data-k="pmap-cell:' + id +
        '" data-action="focus-activity" data-domain="' + id + '" title="Focus ' + esc(ctx, d.label) + '">' +
        ring(ctx, measureValue(ctx, id), tone === 'idle' ? 'pending' : tone) +
        '<b>' + esc(ctx, d.label) + '</b>' +
        '<em class="pmap-cell-cap">' + esc(ctx, d.count) + ' \u00b7 ' + esc(ctx, MEASURE_CAPTION[id]) + '</em></button>';
    }).join('');
    var sc = coll(ctx);
    var agents = sc.subagents || [], changes = sc.changes || [], todos = sc.todos || [];
    var add = changes.reduce(function (s, c) { return s + (Number(c.add) || 0); }, 0);
    var del = changes.reduce(function (s, c) { return s + (Number(c.del) || 0); }, 0);
    var gp = goalProgress(ctx);
    var metrics = [
      ['Churn', '+' + add + ' −' + del, changes.length + ' files'],
      ['Agents working', String(agents.filter(function (a) { return a.status === 'working'; }).length), agents.length + ' total'],
      ['Stalled', String(agents.filter(function (a) { return a.status === 'blocked'; }).length +
        todos.filter(function (t) { return t.status === 'blocked'; }).length), 'agents + todos'],
      ['Goal open', String(gp.open == null ? '—' : gp.open), gp.total ? 'of ' + gp.total + ' phases' : 'no goal']
    ].map(function (m) {
      return '<div class="pmap-metric" data-k="pmap-metric:' + esc(ctx, m[0]) + '"><label>' + esc(ctx, m[0]) +
        '</label><strong>' + esc(ctx, m[1]) + '</strong><span>' + esc(ctx, m[2]) + '</span></div>';
    }).join('');
    return '<div class="pmap pmap-dash" data-k="pmap:7">' + scopeStrip(ctx) +
      '<div class="activity-dashboard">' + cells + '</div>' +
      '<div class="pmap-metrics" data-k="pmap-metrics">' + metrics + '</div>' +
      '<div class="pmap-dash-focus" data-k="pmap-dashfocus">' +
      '<div class="pmap-sub-head">' + ctx.icon(iconOf(f), 11, lit(domainTone(ctx, f))) + '<strong>' + esc(ctx, LABELS[f]) +
      '</strong><span class="spacer"></span><span class="meta-pill">' + esc(ctx, countOf(ctx, f)) + '</span></div>' +
      domainList(ctx, f) + '</div></div>';
  }

  /* =======================================================================
     PROCESSES (W6: D2, D3, D8, D13) — the focused view of what this thread's
     agent and its subagents started, read from the one work projection
     (PM_WORK). By state: Needs input, Running, Scheduled, Finished this
     session. By owner when many subagents run (D3's fallback). A row opens
     the shared detail block in place; the foot says what composer Stop does
     and holds Stop all in this thread (the shared Stop list, 48-work.js).
     Words are the build's copy (O55 work.*). Every variant shows it alike.
     ===================================================================== */
  var BY_OWNER_AT = 3;
  function wt(k, v) { return window.O55 && typeof window.O55.t === 'function' ? window.O55.t('work.' + k, v) : k; }
  function since(t) {
    var s = Math.max(0, Math.round((Date.now() - (t || Date.now())) / 1000));
    if (s < 60) return s + 's';
    var m = Math.floor(s / 60);
    return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
  }
  function procMark(W, p) {
    var N = window.PM56_NEON;
    return N && typeof N.status === 'function' ? N.status(W.key(p), 12, 'nx-still') : toneDot(W.tone(p));
  }
  function procRow(ctx, W, p, byOwner) {
    var on = isSelected(ctx, 'processes', p.id), t = W.tone(p), o = W.owner(p);
    var sub = W.needsYou(p) && p.ask ? '<b class="pmap-askline">' + esc(ctx, p.ask) + '</b>' :
      (o && !byOwner ? '<u class="agent-model">' + esc(ctx, o.title) + '</u> · ' : '') +
      esc(ctx, p.kind === 'scheduled' ? p.detail : (p.command || p.detail || '')) +
      (p.ports && p.ports.length && W.isLive(p) ? ' · <span class="pmap-mono">:' + p.ports.join(', :') + '</span>' : '') +
      (p.progress && W.isLive(p) ? ' · ' + esc(ctx, p.progress.done + '/' + p.progress.total + ' ' + p.progress.unit) : '');
    return '<div class="pmap-proc' + (on ? ' is-open' : '') + '" data-k="pmap-proc:' + esc(ctx, p.id) + '">' +
      '<button class="pmap-row pmap-proc-row" data-action="open-process" data-domain="processes" data-id="' + esc(ctx, p.id) + '" data-state="' + t + '" aria-expanded="' + on + '">' +
      '<span class="pmap-proc-lead">' + procMark(W, p) + '</span>' +
      '<span class="copy"><strong>' + esc(ctx, p.title) + '</strong><span>' + sub + '</span></span>' +
      '<span class="right"><b data-tone="' + t + '">' + esc(ctx, W.word(p)) + '</b><i data-work-time="' + esc(ctx, p.id) + '">' + esc(ctx, W.time(p)) + '</i></span></button>' +
      (on && window.PM7_WORK_UI ? window.PM7_WORK_UI.detail(p) : '') + '</div>';
  }
  function procSection(ctx, W, key, title, list, extra, byOwner) {
    if (!list.length) return '';
    return '<section class="pmap-records pmap-proc-sec" data-k="pmap-proc-sec:' + key + '"><div class="pmap-records-head"><strong>' + title + '</strong><span>' +
      (extra || list.length) + '</span></div>' + list.map(function (p) { return procRow(ctx, W, p, byOwner); }).join('') + '</section>';
  }
  function processesView(ctx) {
    var W = window.PM_WORK, d = (ctx.activityDefs() || {}).processes;
    if (!W || !d) return emptyNote(ctx, wt('chat.empty'));
    var tid = ctx.state.selectedThread, all = W.sort(coll(ctx).processes || []);
    var needs = all.filter(W.needsYou), live = all.filter(function (p) { return W.isLive(p) && !W.needsYou(p); });
    var sched = all.filter(function (p) { return p.kind === 'scheduled' && p.state === 'pending' && !p.stopping; });
    var done = all.filter(W.isDone), failed = done.filter(function (p) { return p.state === 'failed'; }).length, lost = done.filter(function (p) { return p.state === 'warning'; }).length;
    var feed = W.feed ? W.feed() : null;
    var sum = [];
    if (live.length + needs.length) sum.push(wt('chat.summaryRunning', { n: live.length + needs.length }));
    if (needs.length) sum.push(wt(needs.length === 1 ? 'chat.summaryNeeds' : 'chat.summaryNeedsMany', { n: needs.length }));
    if (sched.length) sum.push(wt('chat.summaryScheduled', { n: sched.length }));
    if (done.length) { var why = [failed ? wt('chat.summaryFailed', { n: failed }) : '', lost ? wt('chat.summaryLost', { n: lost }) : ''].filter(Boolean).join(', '); sum.push(why ? wt('chat.summaryWhy', { n: done.length, why: why }) : wt('chat.summaryFinished', { n: done.length })); }
    var h = '<div class="pmap pmap-statusboard is-focused pmap-procs" data-k="pmap:procs">' +
      '<section class="pmap-focus-summary" data-k="pmap-proc-sum" data-tone="' + d.tone + '"><div class="pmap-focus-head"><span class="pmap-focus-ident">' + ctx.icon('processes', 13, lit(d.tone)) +
      '<strong>' + esc(ctx, wt('chat.label')) + '</strong></span><span class="pmap-focus-count">' + esc(ctx, d.count) + '</span></div><p>' + esc(ctx, sum.join(' · ') || wt('chat.summaryNone')) + '</p></section>';
    if (feed && feed.restarted) h += '<div class="pmap-proc-strip" data-k="pmap-proc-restart" data-tone="attention">' + procMark(W, { state: 'warning' }) + '<span>' + esc(ctx, wt('strip.restarted', { ago: since(feed.restarted.at), n: feed.restarted.lost || 0 })) + '</span></div>';
    if (feed && feed.state === 'stale') h += '<div class="pmap-proc-strip" data-k="pmap-proc-stale" data-tone="attention">' + procMark(W, { state: 'offline' }) + '<span>' + esc(ctx, wt('strip.stale', { ago: since(feed.at) })) + '</span></div>';
    if (!all.length) h += emptyNote(ctx, wt('chat.empty'));
    var owners = {};
    live.forEach(function (p) { if (p.owner) owners[p.owner] = 1; });
    if (Object.keys(owners).length >= BY_OWNER_AT) {
      /* D3's fallback: many subagents run, so each one's processes sit under it (this thread's agent first) */
      h += procSection(ctx, W, 'input', wt('sec.input'), needs);
      var order = [null].concat(Object.keys(owners));
      order.forEach(function (oid) {
        var list = live.filter(function (p) { return (p.owner || null) === oid; });
        if (!list.length) return;
        var ag = oid ? W.item(oid) : null;
        h += procSection(ctx, W, 'owner:' + (oid || 'self'), esc(ctx, ag ? ag.title : wt('sec.byOwnerThis')),
          list, ag ? '<b data-tone="' + W.tone(ag) + '">' + esc(ctx, W.word(ag)) + '</b>' : String(list.length), true);
      });
      h += procSection(ctx, W, 'scheduled', wt('sec.scheduled'), sched);
    } else {
      h += procSection(ctx, W, 'input', wt('sec.input'), needs) + procSection(ctx, W, 'running', wt('sec.running'), live) + procSection(ctx, W, 'scheduled', wt('sec.scheduled'), sched);
    }
    if (done.length) h += procSection(ctx, W, 'finished', wt('sec.finished'), done, '<button type="button" class="pmap-link" data-action="proc-clear">' + esc(ctx, wt('act.clear')) + '</button>');
    var n = W.stopTargets ? W.stopTargets({ scope: 'thread', thread: tid }).filter(function (id) { var x = W.item(id); return x && x.kind !== 'agent'; }).length : 0;
    h += '</div><div class="pmap-proc-foot" data-k="pmap-proc-foot"><span>' + esc(ctx, wt('chat.foot')) + '</span>' +
      '<button type="button" class="soft-button danger pmap-proc-stopall" data-action="proc-stop-all"' + (n ? '' : ' disabled') + '>' + esc(ctx, n ? wt('chat.stopAllN', { n: n }) : wt('chat.stopAll')) + '</button></div>';
    return h;
  }
  /* a process row (in this view, Show all or the hover card) opens Activity Detail at it, its detail block open */
  EXT.action('open-process', function (ctx, btn) {
    var id = btn && btn.dataset.id; if (!id) return true;
    var a = act(ctx), fromCard = !!(btn.closest && btn.closest('.ab-card'));
    if (fromCard) { a.open = true; a.domain = 'processes'; a.scope = 'focus'; a.selected = { domain: 'processes', id: id }; ctx.state.hover = null; }
    else select(ctx, 'processes', id);
    if (Array.isArray(a.expanded) && a.expanded.indexOf('processes') < 0) a.expanded.push('processes');
    ctx.renderApp();
    return true;
  });
  EXT.action('proc-stop-all', function (ctx) {
    var t = (ctx.state.threads || []).filter(function (x) { return x.id === ctx.state.selectedThread; })[0];
    if (window.PM7_WORK_UI) window.PM7_WORK_UI.confirmThread(ctx.state.selectedThread, t ? t.title : '');
    return true;
  });
  /* G6: clearing hides finished rows from this thread's view only; no record is deleted */
  EXT.action('proc-clear', function (ctx) {
    var tid = ctx.state.selectedThread;
    if (window.PM_WORK) window.PM_WORK.clearFinished('thread:' + tid, function (x) { return x.thread === tid; });
    return true;
  });

  /* ---------------------------------------------------------------- router */
  var CONCEPTS = [conceptAccordion, conceptStatusBoard, conceptGoalTree,
    conceptMasterDetail, conceptAgentBoard, conceptLedger, conceptLiveFeed, conceptDashboard];

  EXT.slot('activityPanelBody', function (ctx) {
    if (ctx.domain === 'processes' && ctx.state.activity.scope === 'focus') return processesView(ctx);
    if(ctx.domain==='crew'&&ctx.state.activity.scope==='focus'&&window.PM56_CREW?.activityRuns(ctx).length)return window.PM56_CREW.activityBody(ctx);
    if(ctx.domain === 'todo' && window.PM56_TODOS) return '';
    if(['brainstorm','review','chat_room'].includes(ctx.domain)&&ctx.state.activity.scope==='focus')return '';
    var v = Number(ctx.state.variants && ctx.state.variants[4]) || 0;
    if (v < 0 || v >= CONCEPTS.length) v = 0;
    try { return CONCEPTS[v](ctx); }
    catch (err) { console.error('activity-panel concept ' + v + ' threw', err); return ''; }
  });

  /* ---------------------------------------------------------------- actions */
  function select(ctx, domain, id) {
    var a = act(ctx);
    a.selected = (a.selected && a.selected.domain === domain && a.selected.id === id) ? null : { domain: domain, id: id };
  }

  /* Returning false DECLINES, so app.js's own if-chain still runs.  That is how
     the canonical open-agent / open-change / open-artifact behaviour is kept
     byte-identical everywhere else in the app while the panel additionally
     records what was picked. */
  ['open-agent', 'open-change', 'open-artifact'].forEach(function (name) {
    var domain = name === 'open-agent' ? 'subagents' : name === 'open-change' ? 'changes' : 'artifacts';
    EXT.action(name, function (ctx, btn) {
      if (btn && btn.dataset && btn.dataset.domain === domain) select(ctx, domain, btn.dataset.id);
      return false;
    });
  });

  /* Todo rows had no data-action at all.  There is no editor destination for a
     todo, so instead of opening a lying editor tab this reveals the real record
     — status, source, the goal phase it was stamped with, its blocker. */
  EXT.action('open-todo', function (ctx, btn) {
    select(ctx, 'todo', btn.dataset.id);
    var a = act(ctx);
    if (Array.isArray(a.expanded) && a.expanded.indexOf('todo') < 0) a.expanded.push('todo');
    ctx.renderApp();
    return true;
  });
  EXT.action('open-crew', function (ctx, btn) {
    select(ctx, 'crew', btn.dataset.id);
    var a = act(ctx);
    if (Array.isArray(a.expanded) && a.expanded.indexOf('crew') < 0) a.expanded.push('crew');
    ctx.renderApp();
    return true;
  });

  EXT.action('activity-deselect', function (ctx) { act(ctx).selected = null; ctx.renderApp(); return true; });

  /* Concept 5's inline diff.  Selecting the row as well means the change is
     also detailed in whichever other concept the user switches to next. */
  EXT.action('activity-diff', function (ctx, btn) {
    var key = btn && btn.dataset.key;
    if (!key) return false;
    var list = openRows(ctx), i = list.indexOf(key);
    if (i >= 0) list.splice(i, 1); else list.push(key);
    act(ctx).selected = i >= 0 ? null : { domain: 'changes', id: btn.dataset.id };
    ctx.renderApp();
    return true;
  });

  /* Concept 2's branch disclosure.  focus-activity and open-activity both push
     the domain they select into this set, so focusing a domain always leaves
     its branch open — "focused but hidden" is the contradiction this wave
     exists to remove — while the twisty itself stays a plain toggle. */
  EXT.action('activity-branch', function (ctx, btn) {
    var d = btn && btn.dataset.domain;
    if (!d) return false;
    var list = branches(ctx), i = list.indexOf(d);
    if (i >= 0) list.splice(i, 1); else list.push(d);
    ctx.renderApp();
    return true;
  });

  /* Opening a domain from the Chat Activity Bar focuses that domain only.
     Show all (or re-clicking the already-focused filter chip) widens back
     out. Declines afterwards so app.js still owns open/expand/hover-clear. */
  EXT.action('open-activity', function (ctx, btn) {
    if (!btn || liveDomains(ctx).indexOf(btn.dataset.domain) < 0) return false;
    var a = act(ctx);
    a.scope = 'focus';
    a.domain = btn.dataset.domain;
    if (a.selected && a.selected.domain !== btn.dataset.domain) a.selected = null;
    if (!Array.isArray(a.branches)) a.branches = [];
    if (a.branches.indexOf(btn.dataset.domain) < 0) a.branches.push(btn.dataset.domain);
    return false;
  });

  EXT.action('activity-scope', function (ctx, btn) {
    act(ctx).scope = btn && btn.dataset.value === 'all' ? 'all' : 'focus';
    ctx.renderApp();
    return true;
  });

  /* The filter was decorative: focus-activity set state.activity.domain and the
     panel rendered all five sections regardless.  It now really focuses, and
     re-clicking the focused domain widens back out to all five. */
  EXT.action('focus-activity', function (ctx, btn) {
    var a = act(ctx), d = btn && btn.dataset.domain;
    if (!d || liveDomains(ctx).indexOf(d) < 0) return false;
    if (a.domain === d && scopeOf(ctx) === 'focus') { a.scope = liveDomains(ctx).length > 1 ? 'all' : 'focus'; }
    else { a.domain = d; a.scope = 'focus'; }
    if (Array.isArray(a.expanded) && a.expanded.indexOf(d) < 0) a.expanded.push(d);
    if (!Array.isArray(a.branches)) a.branches = [];
    if (a.branches.indexOf(d) < 0) a.branches.push(d);
    if (a.selected && a.selected.domain !== d) a.selected = null;
    ctx.renderApp();
    return true;
  });

  /* CC5 / ACD-476: the composer dock reads the one work projection too. What waits on you in this thread (a process's
     prompt, a subagent's question) is a needs line with Review; each live process is a live line with its time; the
     next scheduled run is a coming-up line. They carry no runId (they are not transcript cards), so they always show;
     the app's PM_WORK subscription re-renders the dock on a change and the tick patcher moves its times. */
  /* Q13 (Jared, QA round 2, 2026-10-30: "should not stay in view unless there is one that needs user input. They should
     stay for 60 seconds and then disappear. The user can see them in the activity bar and activity panel."): a running
     process's line, and the next scheduled run's, shows for 60 s from when it first shows in this thread's dock, then
     leaves; a line that needs the person stays until it is answered. One timer redraws the chat when the next one is due. */
  var DOCK_MS = 60000, dockSeen = {}, dockTimer = 0;
  /* keyed by the run, not only the item: a process that starts again (a restart, a scenario that starts its work over)
     is new work and shows for its 60 s again */
  function dockKey(tid, it) { return tid + '|' + it.id + '|' + (it.startedAt || it.at || 0); }
  function dockFresh(tid, it, now) {
    var k = dockKey(tid, it);
    if (!dockSeen[k]) dockSeen[k] = now;
    return now - dockSeen[k] < DOCK_MS;
  }
  function dockExpiry(ctx, tid, list, now) {
    var due = Infinity;
    list.forEach(function (it) { var t = dockSeen[dockKey(tid, it)]; if (t) due = Math.min(due, t + DOCK_MS - now); });
    clearTimeout(dockTimer); dockTimer = 0;
    if (due < Infinity && typeof ctx.renderApp === 'function') dockTimer = setTimeout(function () { dockTimer = 0; ctx.renderApp(); }, Math.max(0, due) + 30);
  }
  function workDock(ctx) {
    var W = window.PM_WORK, S = window.PM56_SHELL, out = [];
    if (!W || !S || !S.pmxDockLine || !ctx || !ctx.state) return out;
    var tid = ctx.state.selectedThread, now = Date.now(), timed = [];
    var mine = W.items({ thread: tid, kind: ['process', 'agent', 'scheduled'], view: 'thread:' + tid });
    var mark = function (it) { return ctx.icon(it.kind === 'agent' ? 'robot' : it.kind === 'scheduled' ? 'clock' : 'processes', 16); };
    var line = function (it, tone, sentence, time, label) {
      var d = it.kind === 'agent' ? 'subagents' : 'processes';
      return { key: 'work:' + it.id, tone: tone, at: it.startedAt || 0, html: S.pmxDockLine({ key: 'pmx-dock:work:' + it.id, tone: tone, markHtml: mark(it),
        kindWord: esc(ctx, wt(it.kind === 'agent' ? 'dock.agent' : it.kind === 'scheduled' ? 'dock.scheduled' : 'dock.process')), sentence: sentence,
        time: time ? '<span data-work-time="' + esc(ctx, it.id) + '">' + esc(ctx, time) + '</span>' : '',
        action: { action: 'work-dock-review', attrs: 'data-id="' + esc(ctx, it.id) + '" data-domain="' + d + '"', label: label } }) };
    };
    W.sort(mine.filter(W.needsYou)).forEach(function (it) {
      out.push(line(it, 'needs', esc(ctx, it.title) + ' · ' + esc(ctx, it.ask || W.word(it)), '', wt('dock.review')));
    });
    W.sort(mine.filter(function (it) { return it.kind === 'process' && W.isLive(it) && !W.needsYou(it); })).forEach(function (it) {
      if (!dockFresh(tid, it, now)) return;
      timed.push(it);
      out.push(line(it, 'live', esc(ctx, it.title), W.time(it), wt('dock.show')));
    });
    var next = W.sort(mine.filter(function (it) { return it.kind === 'scheduled' && it.state === 'pending'; }))[0];
    if (next && dockFresh(tid, next, now)) { timed.push(next); out.push(line(next, 'comingup', esc(ctx, next.title), W.time(next), wt('dock.show'))); }
    dockExpiry(ctx, tid, timed, now);
    return out;
  }
  var dockOn = false;
  function provideDock() {
    if (dockOn || !(window.PM56_PMX && window.PM56_PMX.dock)) return;
    dockOn = true;
    window.PM56_PMX.dock.provide(workDock);
  }
  provideDock();
  if (!dockOn) document.addEventListener('DOMContentLoaded', provideDock, { once: true });
  /* a dock line's Review / Show: Activity Detail at that item (a subagent found by its title: the chat's records) */
  EXT.action('work-dock-review', function (ctx, btn) {
    var id = btn && btn.dataset.id, d = btn && btn.dataset.domain, W = window.PM_WORK, it = W && id ? W.item(id) : null;
    if (!it || !window.PM56_DEMO) return true;
    window.PM56_DEMO.openActivity(d, d === 'subagents' ? { title: it.title } : it.id);
    return true;
  });

  void 'activity-summary-card pmap-focus-pill pmap-chips-foot';
})();
