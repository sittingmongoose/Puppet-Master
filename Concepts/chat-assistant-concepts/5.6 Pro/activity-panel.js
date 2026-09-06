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
  var DOMAINS = ['goal', 'todo', 'subagents', 'crew', 'changes', 'artifacts'];
  var LABELS = { goal: 'Goal', todo: 'Todo', subagents: 'Subagents', crew: 'Crew', changes: 'Changes', artifacts: 'Artifacts' };
  var ICONS = { goal: 'goal', todo: 'todo', subagents: 'users', crew: 'users', changes: 'changes', artifacts: 'artifact' };

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
    if (api && api.render && api.render.compact) {
      try { return sealed(api.render.compact(ctx)); } catch (e) { /* fall through */ }
    }
    return '';
  }
  function goalActions(ctx) {
    return '<div class="plan-actions" data-k="pmap-goal-actions">' +
      '<button class="soft-button" data-action="open-goal">View Goal</button>' +
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
      return (sc.subagents || []).map(function (a) {
        var counts = a.counts && typeof a.counts === 'object'
          ? Object.keys(a.counts).map(function (k) { return a.counts[k] + ' ' + k; }).join(' · ') : '';
        var sm = statusMeta(a.status, agentTone(a.status));
        return {
          domain: 'subagents', id: a.id, title: a.name,
          sub: [a.model, a.blocker || a.current].filter(Boolean).join(' · '),
          right: sm.label + (a.elapsed ? ' · ' + a.elapsed : ''),
          elapsed: a.elapsed || '',
          ledger: a.elapsed || '—',
          tone: sm.tone,
          progress: a.progress == null ? null : Number(a.progress) || 0,
          state: sm.label, action: 'open-agent',
          attrs: ' data-id="' + esc(ctx, a.id) + '"',
          initials: String(a.name || '?').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2),
          group: a.group || a.parent || 'Unassigned', meta: counts, raw: a
        };
      });
    }
    if (domain === 'crew') {
      return (sc.crew || []).map(function (a) {
        var sm = statusMeta(a.status, agentTone(a.status));
        return {
          domain: 'crew', id: a.id, title: a.name, sub: a.current || '',
          right: sm.label, ledger: sm.label,
          tone: sm.tone, progress: null,
          state: sm.label, action: 'open-crew',
          attrs: ' data-id="' + esc(ctx, a.id) + '"',
          initials: String(a.name || '?').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2),
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
        ctx.icon(ICONS[id], 11) + '<span>' + esc(ctx, LABELS[id]) + '</span><b>' + esc(ctx, countOf(ctx, id)) + '</b></button>';
    }).join('') + '</div>';
  }
  function emptyNote(ctx, text) {
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
  function detailCard(ctx, domain, id) {
    if (domain === 'goal') return '<div class="pmap-detail" data-k="pmap-detail:goal">' + goalBody(ctx) + '</div>';
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
      body = kv(ctx, 'Status', statusMeta(r.status, agentTone(r.status)).label) + kv(ctx, 'Model', r.model) +
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
        ? '<button class="soft-button" data-action="open-agent" data-id="' + esc(ctx, r.id) + '">' + ctx.icon('eye', 12) + ' Open child thread</button>'
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
            '<span class="pmap-row-mark">' + toneDot(it.tone, it.tone === 'working') + '</span>' +
            '<span class="copy"><strong>' + esc(ctx, it.title) + '</strong><span>' + esc(ctx, it.sub) + '</span></span>' +
            '<span class="right">' + esc(ctx, it.right) + '</span></button>' +
            (on ? detailCard(ctx, id, it.id) : '');
        }).join('') || emptyNote(ctx, 'No ' + LABELS[id].toLowerCase() + ' records in this fixture.')) + '</div>';
      }
      return '<section class="activity-section pmap-section' + (focused ? ' is-focus' : '') + '" data-domain-section="' + id + '" data-k="pmap-sec:' + id + '">' +
        '<button class="activity-section-head" data-action="toggle-activity-section" data-domain="' + id + '">' +
        '<span class="event-icon" style="width:24px;height:24px">' + ctx.icon(d.icon, 12) + '</span>' +
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
      '<span class="pmap-row-mark">' + toneDot(it.tone, it.tone === 'working') + '</span>' +
      '<span class="copy"><strong>' + esc(ctx, it.title) + '</strong><span>' + esc(ctx, it.sub) + '</span></span>' +
      '<span class="right">' + right + '</span></button>' +
      (on ? detailCard(ctx, it.domain, it.id) : '');
  }
  function agentRow(ctx, it) {
    var on = isSelected(ctx, it.domain, it.id);
    return '<button class="pmap-row pmap-agent-row' + (on ? ' is-selected' : '') +
      '" data-k="pmap-r:' + esc(ctx, it.domain + ':' + it.id) + '" data-action="' + it.action +
      '" data-domain="' + it.domain + '" data-state="' + it.tone + '"' + it.attrs + '>' +
      '<span class="copy"><strong>' + esc(ctx, it.title) + '</strong>' +
      (it.sub ? '<span>' + esc(ctx, it.sub) + '</span>' : '') + '</span>' +
      '<span class="right"><b>' + esc(ctx, it.state) + '</b>' +
      (it.elapsed ? '<i>' + esc(ctx, it.elapsed) + '</i>' : '') + '</span></button>' +
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
      '<span class="pmap-tile-head"><span class="pmap-tile-ident">' + ctx.icon(d.icon, 14) + '<span>' +
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
      var head = '<div class="pmap-focus-head"><span class="pmap-focus-ident">' + ctx.icon(ICONS[f], 15) + '<strong>' +
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
      (f === 'goal' ? '<button class="pmap-route-action" data-action="open-goal"><span>View Goal</span>' + ctx.icon('chevron', 11) + '</button>' : '') +
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
        ctx.icon(d.icon, 11) + '<span class="pmap-tree-label">' + esc(ctx, d.label) + '</span>' +
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
      ? '<button class="tree-root" data-action="open-goal" data-k="pmap-treeroot">' + ctx.icon('goal', 11) +
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
          ctx.icon(d.icon, 11) + '<span>' + esc(ctx, d.label) + '</span></button>';
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
          '<div class="pmap-sub-head">' + ctx.icon(d.icon, 11) + '<strong>' + esc(ctx, d.label) +
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
  var LANES = [
    { tone: 'working', label: 'Working', icon: 'lightning' },
    { tone: 'blocked', label: 'Stalled', icon: 'lock' },
    { tone: 'waiting', label: 'Waiting', icon: 'pause' },
    { tone: 'changed', label: 'Changed', icon: 'changes' },
    { tone: 'pending', label: 'Queued', icon: 'todo' },
    { tone: 'done', label: 'Settled', icon: 'check' }
  ];
  function boardCard(ctx, it) {
    var on = isSelected(ctx, it.domain, it.id);
    var face = it.initials
      ? '<span class="pmap-av">' + esc(ctx, it.initials) + '</span>'
      : '<span class="pmap-av pmap-av-glyph">' + ctx.icon(ICONS[it.domain], 12) + '</span>';
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
        '<div class="pmap-lane-head">' + toneDot(lane.tone, lane.tone === 'working') +
        ctx.icon(lane.icon, 10) + '<strong>' + lane.label + '</strong><span class="spacer"></span>' +
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
      '<div class="pmap-sub-head">' + ctx.icon(ICONS[f], 11) + '<strong>' + esc(ctx, LABELS[f]) +
      '</strong><span class="spacer"></span><span class="meta-pill">' + esc(ctx, countOf(ctx, f)) + '</span></div>' +
      domainList(ctx, f) + '</div></div>';
  }

  /* ---------------------------------------------------------------- router */
  var CONCEPTS = [conceptAccordion, conceptStatusBoard, conceptGoalTree,
    conceptMasterDetail, conceptAgentBoard, conceptLedger, conceptLiveFeed, conceptDashboard];

  EXT.slot('activityPanelBody', function (ctx) {
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

  void 'activity-summary-card pmap-focus-pill pmap-chips-foot';
})();
