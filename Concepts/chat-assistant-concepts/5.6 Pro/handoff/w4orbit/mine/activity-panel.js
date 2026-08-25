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

  var DOMAINS = ['goal', 'todo', 'subagents', 'changes', 'artifacts'];
  var LABELS = { goal: 'Goal', todo: 'Todo', subagents: 'Subagents', changes: 'Changes', artifacts: 'Artifacts' };
  var ICONS = { goal: 'goal', todo: 'todo', subagents: 'users', changes: 'changes', artifacts: 'artifact' };

  /* ---------------------------------------------------------------- state
     Extra keys hang off state.activity.  globalReset() replaces `state`
     wholesale from DEFAULT, which does not carry them, so every accessor
     below has to tolerate `undefined` — that is the reset path, not a bug. */
  function act(ctx) { return ctx.state.activity || (ctx.state.activity = {}); }
  /* Two controls, two jobs — which is why `focus-activity` reading as decorative
     was a real defect and not a matter of taste:
       the Chat Activity Bar's `open-activity` OPENS the whole detail with one
       domain emphasised (scope 'all');
       the panel's own filter row `focus-activity` NARROWS to one domain
       (scope 'focus'), and re-clicking it widens back out. */
  function scopeOf(ctx) { return act(ctx).scope === 'focus' ? 'focus' : 'all'; }
  function focusOf(ctx) {
    var d = act(ctx).domain;
    return DOMAINS.indexOf(d) >= 0 ? d : 'goal';
  }
  function visibleDomains(ctx) {
    if (scopeOf(ctx) === 'focus') return [focusOf(ctx)];
    return DOMAINS.slice();
  }
  /* Focused-first ordering, for the concepts where movement reads as ranking
     rather than as the list jumping about (boards, feeds, ledgers). */
  function rankedDomains(ctx) {
    var f = focusOf(ctx);
    if (scopeOf(ctx) === 'focus') return [f];
    return [f].concat(DOMAINS.filter(function (d) { return d !== f; }));
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
    var api = goalApi(), p = api && api.progress && api.progress();
    if (p && typeof p.total === 'number') return p;
    var g = ctx.activityDefs().goal, m = /^(\d+)\/(\d+)$/.exec(String(g.count || ''));
    return m
      ? { completed: Number(m[1]), total: Number(m[2]), open: Math.max(0, Number(m[2]) - Number(m[1])) }
      : { completed: 0, total: 0, open: 0 };
  }
  function goalSummaryLine(ctx) {
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
     collection it is drawing.  tone is the vocabulary the CSS understands:
     working | blocked | waiting | done | pending | changed. */
  var TODO_DONE = ['done', 'completed'];
  var TODO_RUN = ['doing', 'in_progress', 'running', 'working'];
  var TODO_OPEN = ['next', 'pending', 'queued'];

  function todoTone(s) {
    if (TODO_DONE.indexOf(s) >= 0) return 'done';
    if (TODO_RUN.indexOf(s) >= 0) return 'working';
    if (s === 'blocked') return 'blocked';
    if (s === 'skipped') return 'waiting';
    return 'pending';
  }
  function agentTone(s) {
    if (s === 'working') return 'working';
    if (s === 'blocked' || s === 'failed') return 'blocked';
    if (s === 'waiting') return 'waiting';
    if (s === 'complete' || s === 'completed') return 'done';
    return 'pending';
  }
  function artifactTone(s) {
    if (s === 'error') return 'blocked';
    if (s === 'loading') return 'working';
    if (s === 'stale') return 'waiting';
    return 'done';
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
    var list = (ctx.D.artifacts || []).slice();
    var dated = list.filter(function (a) { return a.updatedAt; });
    if (!dated.length) return list;              /* keep fixture order; never invent one */
    return list.sort(function (a, b) {
      var av = a.updatedAt || '', bv = b.updatedAt || '';
      if (av && bv) return String(bv).localeCompare(String(av));
      return av ? -1 : bv ? 1 : 0;
    });
  }

  function items(ctx, domain) {
    var D = ctx.D;
    if (domain === 'goal') {
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
      return (D.todos || []).map(function (t) {
        var tone = todoTone(t.status);
        var ph = phaseLabel(ctx, t.goalPhaseId);
        return {
          domain: 'todo', id: t.id, title: t.label, sub: [t.source, ph, t.blocker].filter(Boolean).join(' · '),
          right: titleCase(t.status), tone: tone,
          /* the ledger's Detail cell is ~90px: keep it to one short fact, the
             phase join is already on the row's sub-line and in the detail card */
          ledger: t.source || (ph ? ph : '—'),
          /* no synthetic progress: a todo has a status, not a percentage, and
             inventing 55% for "in progress" is the same class of fake as a
             hand-written count */
          progress: null,
          state: titleCase(t.status), action: 'open-todo',
          attrs: ' data-id="' + esc(ctx, t.id) + '"',
          stamp: t.updatedAt || null, raw: t
        };
      });
    }
    if (domain === 'subagents') {
      return (D.subagents || []).map(function (a) {
        var counts = a.counts && typeof a.counts === 'object'
          ? Object.keys(a.counts).map(function (k) { return a.counts[k] + ' ' + k; }).join(' · ') : '';
        return {
          domain: 'subagents', id: a.id, title: a.name, sub: [a.current, a.blocker].filter(Boolean).join(' · '),
          right: titleCase(a.status) + (a.elapsed ? ' · ' + a.elapsed : ''),
          ledger: a.elapsed || '—',
          tone: agentTone(a.status),
          /* real fixture value or nothing -- a 0% bar on an agent that simply has
             no progress field would read as "no progress made" */
          progress: a.progress == null ? null : Number(a.progress) || 0,
          state: titleCase(a.status), action: 'open-agent',
          attrs: ' data-id="' + esc(ctx, a.id) + '"',
          initials: String(a.name || '?').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2),
          group: a.group || a.parent || 'Unassigned', meta: counts, raw: a
        };
      });
    }
    if (domain === 'changes') {
      var list = D.changes || [];
      var maxChurn = list.reduce(function (m, c) { return Math.max(m, (Number(c.add) || 0) + (Number(c.del) || 0)); }, 0);
      return list.map(function (c) {
        var churn = (Number(c.add) || 0) + (Number(c.del) || 0);
        return {
          domain: 'changes', id: c.id || c.path, title: c.path, sub: c.summary,
          right: '+' + (Number(c.add) || 0) + ' −' + (Number(c.del) || 0),
          ledger: '+' + (Number(c.add) || 0) + ' −' + (Number(c.del) || 0),
          tone: 'changed', progress: pct(churn, maxChurn),
          state: titleCase(c.status || 'modified'), action: 'open-change',
          attrs: ' data-path="' + esc(ctx, c.path) + '" data-id="' + esc(ctx, c.id || c.path) + '"',
          line: c.line || 1, meta: (Array.isArray(c.hunks) ? c.hunks.length : 0) + ' hunks', raw: c
        };
      });
    }
    return sortedArtifacts(ctx).map(function (a) {
      return {
        domain: 'artifacts', id: a.id, title: a.title, sub: a.summary,
        right: titleCase(a.status), tone: artifactTone(a.status),
        ledger: 'v' + (a.version == null ? '?' : a.version) + (a.updated ? ' · ' + a.updated : ''),
        progress: null,
        state: titleCase(a.status), action: 'open-artifact',
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
    var all = scopeOf(ctx) === 'all', f = focusOf(ctx);
    var hidden = DOMAINS.length - 1;
    return '<div class="pmap-scope" data-k="pmap-scope">' +
      '<span class="pmap-scope-icon">' + ctx.icon('filter', 11) + '</span>' +
      '<span class="pmap-scope-text">' + (all
        ? 'All ' + DOMAINS.length + ' domains'
        : 'Showing ' + esc(ctx, LABELS[f]) + ' only · ' + hidden + ' hidden') + '</span>' +
      '<button class="pmap-scope-btn" data-action="activity-scope" data-value="' + (all ? 'focus' : 'all') + '">' +
      (all ? 'Focus ' + esc(ctx, LABELS[f]) : 'Show all') + '</button></div>';
  }
  /* The five-way jump used by the concepts that hide the other domains. */
  function domainChips(ctx, cls) {
    var f = focusOf(ctx);
    return '<div class="pmap-chips ' + (cls || '') + '" data-k="pmap-chips">' + DOMAINS.map(function (id) {
      return '<button class="pmap-chip' + (id === f ? ' is-on' : '') + '" data-action="focus-activity" data-domain="' + id + '" title="Focus ' + esc(ctx, LABELS[id]) + '">' +
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
      body = kv(ctx, 'Status', titleCase(r.status)) + kv(ctx, 'Source', r.source) +
        kv(ctx, 'Goal phase', phaseLabel(ctx, r.goalPhaseId) || (r.goalPhaseId ? r.goalPhaseId : 'Not stamped')) +
        kv(ctx, 'Blocker', r.blocker) + kv(ctx, 'Updated', r.updatedAt ? relTime(ctx, r.updatedAt, '') + ' ago' : null);
    } else if (domain === 'subagents') {
      body = kv(ctx, 'Status', titleCase(r.status)) + kv(ctx, 'Model', r.model) +
        kv(ctx, 'Route', r.route) + kv(ctx, 'Parent', r.parent) +
        kv(ctx, 'Elapsed', r.elapsed) + kv(ctx, 'Progress', (Number(r.progress) || 0) + '%') +
        (it.meta ? kv(ctx, 'Work', it.meta) : '') + kv(ctx, 'Blocker', r.blocker);
    } else if (domain === 'changes') {
      body = kv(ctx, 'Status', titleCase(r.status || 'modified')) +
        kv(ctx, 'Range', 'from line ' + (r.line || 1)) +
        kv(ctx, 'Delta', '+' + (Number(r.add) || 0) + ' −' + (Number(r.del) || 0)) +
        kv(ctx, 'Language', r.language) + kv(ctx, 'Renamed from', r.oldPath) +
        renderHunks(ctx, r);
    } else {
      body = kv(ctx, 'Kind', r.kind) + kv(ctx, 'Version', r.version) +
        kv(ctx, 'Status', titleCase(r.status)) +
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
        (focused ? '<span class="meta-pill pmap-focus-pill">' + ctx.icon('filter', 9) + ' Focused</span>' : '') +
        '<span class="meta-pill">' + esc(ctx, d.count) + '</span>' + ctx.icon(open ? 'up' : 'down', 11) + '</button>' + body + '</section>';
    }).join('');
    return '<div class="pmap pmap-accordion" data-k="pmap:0">' + scopeStrip(ctx) + out +
      (scopeOf(ctx) === 'focus' ? domainChips(ctx, 'pmap-chips-foot') : '') + '</div>';
  }

  /* A row shared by the concepts that want a list but not an accordion. */
  function compactRow(ctx, it, extraCls) {
    var on = isSelected(ctx, it.domain, it.id);
    return '<button class="pmap-row' + (on ? ' is-selected' : '') + (extraCls ? ' ' + extraCls : '') +
      '" data-k="pmap-r:' + esc(ctx, it.domain + ':' + it.id) + '" data-action="' + it.action +
      '" data-domain="' + it.domain + '"' + it.attrs + '>' +
      '<span class="pmap-row-mark">' + toneDot(it.tone, it.tone === 'working') + '</span>' +
      '<span class="copy"><strong>' + esc(ctx, it.title) + '</strong><span>' + esc(ctx, it.sub) + '</span></span>' +
      '<span class="right">' + esc(ctx, it.right) + '</span></button>' +
      (on ? detailCard(ctx, it.domain, it.id) : '');
  }
  function domainList(ctx, id) {
    if (id === 'goal') return goalBody(ctx);
    var list = items(ctx, id);
    if (!list.length) return emptyNote(ctx, 'No ' + LABELS[id].toLowerCase() + ' records in this fixture.');
    return list.map(function (it) { return compactRow(ctx, it); }).join('');
  }

  /* =======================================================================
     CONCEPT 1 — Status Board.  A tile grid over `.activity-concept-board`:
     five status tiles, count-first, each with a settled-share meter, and one
     detail strip underneath for whichever tile is focused.  No accordion, no
     per-row disclosure — the tiles ARE the navigation.
     ===================================================================== */
  /* Every proportion drawn anywhere in this file states what it measures.  A
     bar or a ring with no caption is the same fake as a hand-written count. */
  var MEASURE_CAPTION = {
    goal: 'phases completed', todo: 'todos completed', subagents: 'agents finished',
    changes: 'additions of churn', artifacts: 'artifacts ready'
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
      var list = ctx.D.changes || [];
      var add = list.reduce(function (a, c) { return a + (Number(c.add) || 0); }, 0);
      var del = list.reduce(function (a, c) { return a + (Number(c.del) || 0); }, 0);
      return pct(add, add + del);
    }
    return settledShare(ctx, id);
  }
  function conceptStatusBoard(ctx) {
    var f = focusOf(ctx), ranked = rankedDomains(ctx);
    var tiles = ranked.map(function (id) {
      var d = ctx.activityDefs()[id], tone = domainTone(ctx, id);
      var t = tone === 'idle' ? 'pending' : tone;
      return '<button class="pmap-tile' + (id === f ? ' is-focus' : '') + '" data-k="pmap-tile:' + id +
        '" data-action="focus-activity" data-domain="' + id + '" title="Focus ' + esc(ctx, d.label) + '">' +
        '<label>' + ctx.icon(d.icon, 10) + '<span>' + esc(ctx, d.label) + '</span></label>' +
        '<strong>' + esc(ctx, d.count) + '</strong>' +
        '<span class="pmap-tile-sum">' + esc(ctx, d.summary) + '</span>' +
        '<i class="pmap-meter"><b style="width:' + measureValue(ctx, id) + '%"></b></i>' +
        '<em class="pmap-tile-foot">' + toneDot(t, t === 'working') +
        '<span>' + measureValue(ctx, id) + '% ' + esc(ctx, MEASURE_CAPTION[id]) + '</span></em>' +
        '<em class="pmap-tile-foot pmap-tile-detail"><span>' + esc(ctx, d.detail) + '</span></em>' +
        '</button>';
    }).join('');
    return '<div class="pmap pmap-statusboard" data-k="pmap:1">' + scopeStrip(ctx) +
      '<div class="activity-concept-board">' + tiles + '</div>' +
      '<div class="pmap-board-detail" data-k="pmap-board-detail">' +
      '<div class="pmap-sub-head">' + ctx.icon(ICONS[f], 11) + '<strong>' + esc(ctx, LABELS[f]) +
      '</strong><span class="spacer"></span><span class="meta-pill">' + esc(ctx, countOf(ctx, f)) + '</span></div>' +
      domainList(ctx, f) + '</div></div>';
  }

  /* =======================================================================
     CONCEPT 2 — Goal Tree.  `.activity-goal-tree` / `.tree-root` / `.tree-child`
     given the hierarchy they were designed for: the goal is the root, each
     domain is a collapsible branch, each record is a leaf.  Interaction is
     disclosure by branch, which nothing else here does.
     ===================================================================== */
  function conceptGoalTree(ctx) {
    var f = focusOf(ctx), open = branches(ctx);
    var branchIds = scopeOf(ctx) === 'focus' ? [f] : DOMAINS.slice();
    var g = ctx.activityDefs().goal, gp = goalProgress(ctx);
    var body = branchIds.map(function (id) {
      var d = ctx.activityDefs()[id], isOpen = open.indexOf(id) >= 0;
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
    return '<div class="pmap pmap-treewrap" data-k="pmap:2">' + scopeStrip(ctx) +
      '<div class="activity-goal-tree">' +
      '<button class="tree-root" data-action="open-goal" data-k="pmap-treeroot">' + ctx.icon('goal', 11) +
      '<span class="pmap-tree-label">' + esc(ctx, g.summary) + '</span>' +
      '<b>' + (gp.total ? gp.completed + '/' + gp.total : esc(ctx, g.count)) + '</b></button>' +
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
    var rail = '<button class="pmap-md-btn' + (all ? ' active' : '') + '" data-k="pmap-md:all" data-action="activity-scope" data-value="all" title="Show every domain">' +
      ctx.icon('collapse', 11) + '<span>All</span></button>' +
      DOMAINS.map(function (id) {
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
      ? DOMAINS.map(function (id) { return LABELS[id] + ' ' + countOf(ctx, id); }).join(' · ')
      : ctx.activityDefs()[f].detail;
    var list = all
      ? DOMAINS.map(function (id) {
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
      return '<button class="pmap-cell' + (id === f ? ' is-focus' : '') + '" data-k="pmap-cell:' + id +
        '" data-action="focus-activity" data-domain="' + id + '" title="Focus ' + esc(ctx, d.label) + '">' +
        ring(ctx, measureValue(ctx, id), tone === 'idle' ? 'pending' : tone) +
        '<b>' + esc(ctx, d.label) + '</b>' +
        '<em class="pmap-cell-cap">' + esc(ctx, d.count) + ' \u00b7 ' + esc(ctx, MEASURE_CAPTION[id]) + '</em></button>';
    }).join('');
    var agents = ctx.D.subagents || [], changes = ctx.D.changes || [], todos = ctx.D.todos || [];
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

  /* Opening a domain from the Chat Activity Bar means "open the detail with this
     domain in front" — the whole panel, one domain emphasised — rather than
     landing in whatever scope the panel was last left in.  Narrowing is the
     filter row's job (focus-activity).  Declines afterwards so app.js still
     owns the open/expand/hover-clear part. */
  EXT.action('open-activity', function (ctx, btn) {
    if (!btn || DOMAINS.indexOf(btn.dataset.domain) < 0) return false;
    var a = act(ctx);
    a.scope = 'all';
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
    if (!d || DOMAINS.indexOf(d) < 0) return false;
    if (a.domain === d && scopeOf(ctx) === 'focus') { a.scope = 'all'; }
    else { a.domain = d; a.scope = 'focus'; }
    if (Array.isArray(a.expanded) && a.expanded.indexOf(d) < 0) a.expanded.push(d);
    if (!Array.isArray(a.branches)) a.branches = [];
    if (a.branches.indexOf(d) < 0) a.branches.push(d);
    if (a.selected && a.selected.domain !== d) a.selected = null;
    ctx.renderApp();
    return true;
  });
})();
