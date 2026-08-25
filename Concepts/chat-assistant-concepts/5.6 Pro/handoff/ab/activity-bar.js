/* activity-bar.js — feature module.  OWNER: Wave 2 — Activity Bar agent (item 7: per-domain hover content, icon-lit indicators)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules therefore run BEFORE the app boots, so anything
 * registered here is live on the very first render — no re-render, no flash.
 *
 * WHAT THIS MODULE DOES
 * ---------------------
 * 1. Replaces the generic activity hover card with five genuinely different,
 *    fully derived per-domain cards (slot `activityHoverCard`).
 * 2. Retires the five `.state-mark` status dots and lights the domain ICON
 *    instead, from state derived off the collections rather than a literal.
 * 3. Puts the running diff total (+N −M) on the Changes button.
 *
 * HOW 2 AND 3 ARE POSSIBLE WITHOUT REOPENING app.js
 * -------------------------------------------------
 * `renderActivityBar()` (app.js:828) has no registry slot around it, and app.js
 * is closed after Wave 1 — so the bar's MARKUP cannot be changed from here.  It
 * does not have to be.  `renderApp()` already publishes layout state on elements
 * that `pmPatch` never touches (`--editor-w` on <html>, `data-theme` on <body>),
 * because pmPatch only ever reconciles `#pmRoot` and `#pmOverlayRoot`.  So the
 * root/body element is a render-safe side channel: this module publishes the
 * DERIVED indicator state there once per render, and activity-bar.css does the
 * painting from it.  Nothing here writes into the patched tree.
 *
 * The per-render hook is a side-effect-only `headerExtras` slot that returns ''
 * (extEach skips falsy slot output, so no markup is appended).  `headerExtras`
 * lives in renderChatHeader, which every renderApp() renders.
 *
 * Everything is gated on html[data-ab-ready], which only this file sets — if the
 * module ever fails to load, the stock `.state-mark` dots come back rather than
 * the bar losing its indicator entirely.
 */
(function () {
  'use strict';
  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;

  var DOMAINS = ['goal', 'todo', 'subagents', 'changes', 'artifacts'];
  var ROWS = 5;                 /* every list in every card caps here, then "+N more" */

  /* ---------------------------------------------------------------- utils */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function list(v) { return Array.isArray(v) ? v : []; }
  function count(arr, fn) { var n = 0; for (var i = 0; i < arr.length; i++) if (fn(arr[i])) n++; return n; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function compact(n) {
    n = num(n);
    if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 ? 1 : 0) + 'K';
    return String(n);
  }
  /* Fixtures carry both a display string (`updated:'2m ago'`) and, once the Demo
     Data agent lands it, a sortable ISO `updatedAt`. Never invent a clock from
     Date.now(): the whole point of the ISO fields is a deterministic baseline. */
  function whenLabel(a) {
    if (a.updated) return a.updated;
    var iso = a.updatedAt || a.createdAt;
    if (!iso) return '';
    var m = /T(\d{2}:\d{2})/.exec(String(iso));
    return m ? m[1] : String(iso).slice(0, 10);
  }
  /* "5 most recent": ISO descending, and every record WITHOUT a date sorts after
     every record with one, keeping its original order among its peers. A stable
     partition beats a comparator that silently reorders undated rows. */
  function byRecency(arr) {
    var dated = [], undated = [];
    for (var i = 0; i < arr.length; i++) (arr[i] && arr[i].updatedAt ? dated : undated).push(arr[i]);
    dated.sort(function (a, b) { return String(b.updatedAt).localeCompare(String(a.updatedAt)); });
    return dated.concat(undated);
  }
  /* Rank-then-slice, so a five-row preview shows the rows that matter rather
     than whatever happens to sit at the head of the fixture array. */
  function ranked(arr, order, key) {
    return arr.slice().sort(function (a, b) {
      var ia = order.indexOf(key(a)), ib = order.indexOf(key(b));
      return (ia < 0 ? order.length : ia) - (ib < 0 ? order.length : ib);
    });
  }
  function overflow(total, shown) {
    return total > shown
      ? '<div class="ab-more" data-k="ab-more">+' + (total - shown) + ' more</div>'
      : '';
  }
  function empty(text) { return '<div class="ab-empty" data-k="ab-empty">' + esc(text) + '</div>'; }

  /* ------------------------------------------------- derived indicator tone
     Six tones, ranked. app.js's activityDefs() publishes a four-value `tone`
     for exactly this purpose; this refines it in two places rather than
     re-authoring it, and BOTH refinements are still derived from the
     collections — no literal anywhere:
       - a recoverable artifact render error and a subagent waiting on input
         are `attention` (amber), not `blocked` (red). Painting an artifact
         renderer error the same red as a policy-blocked schema change makes
         the red meaningless, which is the same failure the static dots had.
       - a dirty working tree is `changed` (steady accent-2), not `working`.
         Files that have been edited are a fact, not an activity.               */
  var TONES = ['blocked', 'attention', 'working', 'changed', 'done', 'idle'];
  var TONE_INK = {
    blocked: 'var(--danger)', attention: 'var(--warning)', working: 'var(--accent)',
    changed: 'var(--accent-2)', done: 'var(--positive)', idle: 'var(--subtle)'
  };
  var TONE_ANIM = {
    blocked: 'ab-alert 1900ms steps(1,end) infinite',
    attention: 'ab-breathe 3200ms ease-in-out infinite',
    working: 'ab-breathe 2200ms ease-in-out infinite',
    changed: 'none', done: 'none', idle: 'none'
  };
  /* Written as `var(--danger)` etc rather than a resolved colour, and set on
     <body>, so a theme swap needs no re-sync — see setVar's note below. */
  function glow(token, px, pct) {
    return 'drop-shadow(0 0 ' + px + 'px color-mix(in srgb, var(' + token + ') ' + pct + '%, transparent))';
  }
  var TONE_SHADOW = {
    blocked: glow('--danger', 5, 62), attention: glow('--warning', 5, 58),
    working: glow('--accent', 5, 60), changed: glow('--accent-2', 4, 44),
    done: 'none', idle: 'none'
  };
  /* A FOURTH channel, and it is not decoration. Two themes make colour alone
     ambiguous: retro-light has --accent #19734c against --positive #16734c,
     and retro-dark has #60f39a against #74ffb0 — working and done are the same
     green. Motion separates them normally, but not under prefers-reduced-
     motion, so weight and glow have to carry it too. stroke-width set in CSS
     overrides the presentation attribute icon() writes, and it inherits from
     the <svg> to the paths, so one property does it. */
  var TONE_STROKE = {
    blocked: '2.2', attention: '2.1', working: '2.1',
    changed: '1.8', done: '1.5', idle: '1.4'
  };

  /* ---------------------------------------------------- status vocabulary
     ONE table, consulted by every card, so a status the Demo Data agent adds
     never has to be added in five places. This wave exists because five
     hand-written literals drifted; a hand-written status list would drift the
     same way. Anything not listed still renders — humanised label, idle tone,
     generic glyph — and still appears in the footer histogram, so a card can
     never silently under-report its own collection.
     Live proof this matters: the fixture already carries `queued`, `retrying`,
     `fallback`, `verifying` and `replanned`, none of which are in
     FIXTURE_SCHEMA's enums. */
  var STATUS = {
    blocked: { label: 'Blocked', tone: 'blocked', icon: 'lock' },
    failed: { label: 'Failed', tone: 'blocked', icon: 'warning' },
    error: { label: 'Error', tone: 'blocked', icon: 'warning' },
    deleted: { label: 'Deleted', tone: 'blocked', icon: 'minus' },
    retrying: { label: 'Retrying', tone: 'attention', icon: 'refresh' },
    fallback: { label: 'Fallback route', tone: 'attention', icon: 'branch' },
    replanned: { label: 'Replanned', tone: 'attention', icon: 'refresh' },
    stale: { label: 'Stale', tone: 'attention', icon: 'history' },
    waiting: { label: 'Waiting', tone: 'attention', icon: 'pause' },
    renamed: { label: 'Renamed', tone: 'attention', icon: 'fork' },
    in_progress: { label: 'Active', tone: 'working', icon: 'play' },
    doing: { label: 'Active', tone: 'working', icon: 'play' },
    running: { label: 'Active', tone: 'working', icon: 'play' },
    working: { label: 'Working', tone: 'working', icon: 'play' },
    verifying: { label: 'Verifying', tone: 'working', icon: 'flask' },
    loading: { label: 'Loading', tone: 'working', icon: 'refresh' },
    modified: { label: 'Modified', tone: 'changed', icon: 'file-edit' },
    pending: { label: 'Pending', tone: 'idle', icon: 'todo' },
    next: { label: 'Queued', tone: 'idle', icon: 'todo' },
    queued: { label: 'Queued', tone: 'idle', icon: 'todo' },
    completed: { label: 'Done', tone: 'done', icon: 'check' },
    done: { label: 'Done', tone: 'done', icon: 'check' },
    complete: { label: 'Complete', tone: 'done', icon: 'check' },
    ready: { label: 'Ready', tone: 'done', icon: 'check' },
    added: { label: 'Added', tone: 'done', icon: 'plus' },
    skipped: { label: 'Skipped', tone: 'muted', icon: 'minus' }
  };
  /* Most-urgent first. A five-row preview of fourteen agents must show the
     stalled ones, not the first five ids in the array. */
  var RANK = ['blocked', 'failed', 'error', 'retrying', 'fallback', 'stale', 'waiting',
    'in_progress', 'doing', 'running', 'working', 'verifying', 'loading', 'replanned',
    'deleted', 'renamed', 'modified', 'added',
    'pending', 'next', 'queued', 'completed', 'done', 'complete', 'ready', 'skipped'];
  function humanize(s) {
    s = String(s || '').replace(/[_-]+/g, ' ').trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown';
  }
  function st(status) {
    return STATUS[status] || { label: humanize(status), tone: 'idle', icon: 'todo' };
  }
  function rankOf(status) { var i = RANK.indexOf(status); return i < 0 ? RANK.length : i; }
  function byRank(arr) {
    return arr.slice().sort(function (a, b) { return rankOf(a.status) - rankOf(b.status); });
  }
  /* Histogram over EVERY status present, in rank order — so the footer always
     sums to the collection size. The first version listed four hand-picked
     buckets and reported 10 of 14 agents. */
  function histogram(arr) {
    var m = Object.create(null);
    arr.forEach(function (x) { var k = x && x.status ? x.status : 'unknown'; m[k] = (m[k] || 0) + 1; });
    return Object.keys(m)
      .sort(function (a, b) { return rankOf(a) - rankOf(b); })
      .map(function (k) { return m[k] + ' ' + st(k).label.toLowerCase(); })
      .join(' · ');
  }
  var TONE_PRIORITY = ['blocked', 'attention', 'working', 'changed', 'done', 'idle', 'muted'];
  function worstTone(arr) {
    var best = 'idle';
    arr.forEach(function (x) {
      var t = st(x && x.status).tone;
      if (TONE_PRIORITY.indexOf(t) < TONE_PRIORITY.indexOf(best)) best = t;
    });
    return best === 'muted' ? 'idle' : best;
  }

  function goalApi() { return window.PM56_GOAL || null; }

  function barTone(id, ctx) {
    var D = ctx.D, defs = ctx.activityDefs();
    if (id === 'goal') {
      /* The Goals agent owns goal state. Prefer its tone, then app.js's derived
         one; never compute it here. `paused` has no icon vocabulary of its own
         — a paused goal is not working and is not a problem. */
      var api = goalApi();
      var s = api && api.summary && api.summary();
      var t = (s && s.tone) || (defs.goal && defs.goal.tone);
      if (t === 'paused') return 'idle';
      /* summary().tone reports `blocked` for budget_limited too. Budget
         exhaustion is a stop, not a fault, and it is emphatically not
         completion — amber, not red. (Wave 2 Goals confirmed the distinction
         lives on summary().status, not on tone.) */
      var gstatus = (s && s.status) || (api && api.get && api.get() && api.get().status) ||
        (ctx.D.goal && ctx.D.goal.status);
      if (gstatus === 'budget_limited') return 'attention';
      if (gstatus === 'stopped' || gstatus === 'cleared') return 'idle';
      return TONES.indexOf(t) >= 0 ? t : 'idle';
    }
    /* A dirty working tree is a fact, not an activity: steady `changed`, never
       a pulse, whatever the individual file statuses are. */
    if (id === 'changes') return list(D.changes).length ? 'changed' : 'idle';
    if (id === 'artifacts') {
      /* A recoverable renderer error is `attention`, never `blocked`. Painting
         it the same red as a policy-blocked schema change is what made the old
         status lights meaningless. */
      var t2 = worstTone(list(D.artifacts));
      return t2 === 'blocked' ? 'attention' : t2;
    }
    return worstTone(list(id === 'todo' ? D.todos : D.subagents));
  }

  function diffTotals(ctx) {
    var ch = list(ctx.D.changes), add = 0, del = 0;
    for (var i = 0; i < ch.length; i++) { add += num(ch[i].add); del += num(ch[i].del); }
    return { add: add, del: del, files: ch.length };
  }

  /* ------------------------------------------------------- the render hook
     Publishes derived state onto <html> / <body>. Both survive pmPatch, which
     only reconciles #pmRoot and #pmOverlayRoot. Guarded writes so a 2s work
     tick that changes nothing also mutates nothing. */
  function setAttr(el, name, value) {
    if (el.getAttribute(name) !== value) el.setAttribute(name, value);
  }
  function setVar(el, name, value) {
    if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
  }
  function syncIndicators(ctx) {
    var root = document.documentElement, body = document.body;
    if (!root || !body) return;
    for (var i = 0; i < DOMAINS.length; i++) {
      var id = DOMAINS[i], tone = barTone(id, ctx);
      setAttr(root, 'data-ab-' + id, tone);
      /* The ink is written as `var(--danger)` rather than a resolved colour so
         a theme swap needs no re-sync. It is set on <body> — NOT <html> —
         because the theme tokens are declared on body[data-theme], and a
         custom property's var() is substituted on the element that declares
         it. On <html> the token would not resolve. */
      setVar(body, '--ab-ink-' + id, TONE_INK[tone] || TONE_INK.idle);
      setVar(body, '--ab-anim-' + id, TONE_ANIM[tone] || 'none');
      setVar(body, '--ab-shadow-' + id, TONE_SHADOW[tone] || 'none');
      setVar(body, '--ab-stroke-' + id, TONE_STROKE[tone] || '1.8');
    }
    var t = diffTotals(ctx);
    /* CSS `content` needs a quoted string; these are the ONLY two numbers this
       module puts on screen through CSS, and both come straight off the
       collection sum. */
    setVar(body, '--ab-add', '"+' + t.add + '"');
    setVar(body, '--ab-del', '"−' + t.del + '"');
    setAttr(root, 'data-ab-ready', '1');
  }

  EXT.slot('headerExtras', function (ctx) { syncIndicators(ctx); return ''; });

  /* ============================================================ hover cards */

  function head(ctx, id, def, meta) {
    var tone = barTone(id, ctx);
    return '<div class="ab-head" data-k="ab-head">' +
      '<span class="ab-head-icon" data-tone="' + tone + '">' + ctx.icon(def.icon, 13) + '</span>' +
      '<strong>' + esc(def.label) + '</strong>' +
      '<span class="ab-head-meta">' + esc(meta) + '</span>' +
      '</div>';
  }
  function foot(text) {
    return text ? '<div class="ab-foot" data-k="ab-foot">' + esc(text) + '</div>' : '';
  }
  function row(opts) {
    var tag = opts.action ? 'button' : 'div';
    var attrs = ' class="ab-row" data-k="' + esc(opts.k) + '" data-state="' + esc(opts.state || 'idle') + '"';
    if (opts.action) attrs += ' type="button" data-action="' + esc(opts.action) + '"' + (opts.attrs || '');
    if (opts.title) attrs += ' title="' + esc(opts.title) + '"';
    return '<' + tag + attrs + '>' +
      (opts.lead || '') +
      '<span class="ab-row-copy"><b>' + esc(opts.main) + '</b>' +
      (opts.sub ? '<i>' + esc(opts.sub) + '</i>' : '') + '</span>' +
      (opts.right || '') +
      '</' + tag + '>';
  }
  function glyph(ctx, name, tone) {
    return '<span class="ab-glyph" data-tone="' + esc(tone) + '">' + ctx.icon(name, 11) + '</span>';
  }

  /* ------------------------------------------------------------------ goal
     Authored by the Wave 2 Goals agent, not here. PM56_GOAL.render.compact()
     is the coordinated block (see DATA_HANDOFF.md); PM56_GOAL.summary() is the
     fallback composition, and app.js's derived goalSummary() is the last
     resort so the card still says something true with no goal fixture at all. */
  function goalCard(ctx, def) {
    var api = goalApi(), body = '';
    if (api && api.render && typeof api.render.compact === 'function') {
      try { body = api.render.compact(ctx) || ''; } catch (e) { body = ''; }
    }
    if (!body && api && api.summary) {
      var s = api.summary(), g = api.get && api.get();
      body = '<p class="ab-objective" data-k="ab-obj">' + esc((g && (g.title || g.objective)) || def.summary) + '</p>' +
        '<div class="ab-goal-lines" data-k="ab-goal-lines">' +
        (s.phaseLine ? '<span>' + esc(s.phaseLine) + '</span>' : '') +
        (s.counter ? '<span>' + esc(s.counter) + '</span>' : '') +
        (s.budgetLine ? '<span>' + esc(s.budgetLine) + '</span>' : '') +
        '</div>';
    }
    if (!body) {
      /* No goal module loaded. app.js's goalSummary() still gives real
         phase counts (from D.goal when it exists, from its one clearly
         labelled fallback when it does not) — so render the progression as
         pips rather than as "phase 2 of 4" prose. */
      var parts = String(def.count || '').split('/');
      var done = num(parts[0]), total = num(parts[1]);
      var pips = '';
      for (var i = 0; i < total; i++) {
        pips += '<i data-state="' + (i < done ? 'completed' : i === done ? 'in_progress' : 'pending') +
          '" title="Phase ' + (i + 1) + '"></i>';
      }
      body = '<p class="ab-objective" data-k="ab-obj">' + esc(def.summary) + '</p>' +
        (total ? '<div class="ab-pips" data-k="ab-pips">' + pips + '</div>' : '') +
        '<div class="ab-goal-lines" data-k="ab-goal-lines"><span>' +
        esc(done + ' of ' + total + ' phases complete') + '</span></div>';
    }
    return head(ctx, 'goal', def, def.count) + '<div class="ab-body" data-k="ab-body">' + body + '</div>';
  }

  /* ------------------------------------------------------------------ todo */
  var DONE_TODO = ['done', 'completed'];
  function todoCard(ctx, def) {
    var todos = list(ctx.D.todos);
    var done = count(todos, function (x) { return DONE_TODO.indexOf(x.status) >= 0; });
    var shown = byRank(todos).slice(0, ROWS);
    var body = shown.length ? shown.map(function (x) {
      var s = st(x.status);
      return row({
        k: 'todo:' + (x.id || x.label), state: s.tone,
        lead: glyph(ctx, s.icon, s.tone),
        main: x.label,
        sub: [x.source, x.blocker].filter(Boolean).join(' · '),
        right: '<span class="ab-row-right"><b data-tone="' + s.tone + '">' + esc(s.label) + '</b></span>',
        title: (x.label || '') + (x.blocker ? ' — ' + x.blocker : '')
      });
    }).join('') : empty('No todos recorded for this thread.');
    return head(ctx, 'todo', def, todos.length ? done + '/' + todos.length + ' done' : '0') +
      '<div class="ab-body" data-k="ab-body">' + body + overflow(todos.length, shown.length) + '</div>' +
      foot(histogram(todos));
  }

  /* ------------------------------------------------------------- subagents */
  function initials(name) {
    return String(name || '?').split(/\s+/).map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
  }
  function agentCard(ctx, def) {
    var agents = list(ctx.D.subagents);
    var shown = byRank(agents).slice(0, ROWS);
    var body = shown.length ? shown.map(function (a) {
      var s = st(a.status);
      return row({
        k: 'agent:' + a.id, state: s.tone, action: 'open-agent',
        attrs: ' data-id="' + esc(a.id) + '"',
        lead: '<span class="ab-avatar" data-tone="' + s.tone + '">' + esc(initials(a.name)) + '</span>',
        main: a.name + (a.model ? ' · ' + a.model : ''),
        sub: a.blocker || a.current || '',
        right: '<span class="ab-row-right"><b data-tone="' + s.tone + '">' + esc(s.label) + '</b>' +
          (a.elapsed ? '<i>' + esc(a.elapsed) + '</i>' : '') + '</span>',
        title: 'Open ' + (a.name || 'agent')
      });
    }).join('') : empty('No child agents on this thread.');
    return head(ctx, 'subagents', def, agents.length + ' total') +
      '<div class="ab-body" data-k="ab-body">' + body + overflow(agents.length, shown.length) + '</div>' +
      foot(histogram(agents));
  }

  /* --------------------------------------------------------------- changes */
  function splitPath(p) {
    var s = String(p || ''), i = s.lastIndexOf('/');
    return { dir: i < 0 ? '' : s.slice(0, i + 1), file: i < 0 ? s : s.slice(i + 1) };
  }
  function changeCard(ctx, def) {
    var changes = list(ctx.D.changes), t = diffTotals(ctx);
    /* Biggest diffs first — a five-row preview of a twelve-file change set
       should show the files that moved the most, not the first five ids. */
    var shown = changes.slice().sort(function (a, b) {
      return (num(b.add) + num(b.del)) - (num(a.add) + num(a.del));
    }).slice(0, ROWS);
    var body = shown.length ? shown.map(function (c) {
      var sp = splitPath(c.path), s = st(c.status || 'modified');
      return row({
        k: 'change:' + (c.id || c.path), state: s.tone, action: 'open-change',
        attrs: ' data-path="' + esc(c.path) + '"',
        lead: glyph(ctx, s.icon, s.tone),
        main: sp.file + (c.line ? ':' + c.line : ''),
        sub: sp.dir || c.summary || '',
        right: '<span class="ab-row-right ab-diff"><b>+' + num(c.add) + '</b><i>−' + num(c.del) + '</i></span>',
        title: (c.path || '') + (c.summary ? ' — ' + c.summary : '')
      });
    }).join('') : empty('No file changes in this worktree.');
    return head(ctx, 'changes', def, changes.length ? '+' + t.add + ' −' + t.del : '0 files') +
      '<div class="ab-body" data-k="ab-body">' + body + overflow(changes.length, shown.length) + '</div>' +
      foot(changes.length ? plural(changes.length, 'file', 'files') + ' · ' + histogram(changes) : '');
  }

  /* ------------------------------------------------------------- artifacts */
  var ART_ICON = {
    image: 'image', mermaid: 'code', chart: 'chart', dashboard: 'chart',
    plan: 'document', document: 'document', evidence: 'flask', data: 'terminal',
    architecture: 'globe', quiz: 'todo', periodic: 'artifact', flowchart: 'fork'
  };
  function artifactCard(ctx, def) {
    var arts = list(ctx.D.artifacts);
    var shown = byRecency(arts).slice(0, ROWS);
    var body = shown.length ? shown.map(function (a) {
      var s = st(a.status);
      return row({
        k: 'art:' + a.id, state: s.tone, action: 'open-artifact',
        attrs: ' data-id="' + esc(a.id) + '" data-artifact-id="' + esc(a.id) + '"',
        lead: glyph(ctx, ART_ICON[a.kind] || 'artifact', s.tone),
        main: a.title,
        sub: [a.kind, a.version ? 'v' + a.version : ''].filter(Boolean).join(' · '),
        right: '<span class="ab-row-right"><b>' + esc(whenLabel(a)) + '</b>' +
          (a.status && a.status !== 'ready' ? '<i data-tone="' + s.tone + '">' + esc(s.label) + '</i>' : '') + '</span>',
        title: 'Open ' + (a.title || 'artifact')
      });
    }).join('') : empty('Nothing rendered yet on this thread.');
    return head(ctx, 'artifacts', def, arts.length ? shown.length + ' of ' + arts.length : '0') +
      '<div class="ab-body" data-k="ab-body">' + body + '</div>' +
      foot(histogram(arts));
  }

  var CARDS = {
    goal: goalCard, todo: todoCard, subagents: agentCard,
    changes: changeCard, artifacts: artifactCard
  };

  EXT.slot('activityHoverCard', function (ctx) {
    var id = ctx.domain, def = ctx.def || (ctx.activityDefs() || {})[id];
    var build = CARDS[id];
    if (!def || !build) return '';
    /* data-k on the card itself: #pmOverlayRoot is reconciled positionally for
       unkeyed nodes, so an unkeyed hover card can be matched against a toast
       stack (both plain divs) on the 2s work tick. Keyed, it is matched by
       identity and simply patched in place — no entrance replay. */
    return '<div class="hover-card ab-card" data-overlay="hover" data-k="ab-card" ' +
      'data-domain="' + esc(id) + '" data-tone="' + barTone(id, ctx) + '" role="tooltip">' +
      build(ctx, def) + '</div>';
  });

  /* ------------------------------------------------------- keep-open repair
     app.js opens the card on pointerover of [data-hover-domain] and closes it
     on pointerout of the SAME element after a 160ms debounce that is cancelled
     while `.hover-card:hover` matches (app.js:1594-1600). That is what lets a
     row inside the card be clicked — but it also means that once the pointer
     has moved INTO the card, nothing is left to close it: the only close path
     is a pointerout on the bar button the pointer already left. The stock card
     had nothing to hover so this rarely showed; five clickable rows make it a
     card that never goes away.

     Symmetric closer, deliberately 180ms > app.js's 160ms so the two debounces
     cannot race, and using the same `:hover` re-check so crossing the 8px gap
     back to the button does not close it. */
  var leaveTimer = null;
  document.addEventListener('pointerout', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var card = t.closest('.hover-card');
    if (!card) return;
    if (e.relatedTarget && card.contains(e.relatedTarget)) return;
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(function () {
      if (document.querySelector('.hover-card:hover, [data-hover-domain]:hover')) return;
      var ext = window.PM56_EXT;
      if (!ext || typeof ext.ctx !== 'function') return;
      var ctx = ext.ctx();
      if (ctx && ctx.state && ctx.state.hover) { ctx.state.hover = null; ctx.renderOverlays(); }
    }, 180);
  });
})();
