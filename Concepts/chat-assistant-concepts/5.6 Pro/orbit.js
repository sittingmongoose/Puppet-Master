/* orbit.js — feature module.  OWNER: Wave 4 — Orbit agent (item 12: clickable orbit, responsive radius, shared trail icon fix)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules therefore run BEFORE the app boots, so anything
 * registered here is live on the very first render — no re-render, no flash.
 *
 * WHAT THIS MODULE DOES
 *   1. Replaces working-animation take 1 (Orbit) through the `workingTake:1`
 *      render slot, so app.js is never reopened.
 *   2. Live model: the stage is ALWAYS open (dial left, panel visible). The
 *      ring starts empty and a node SPAWNS when its subject starts — duplicate
 *      subjects are expected, so nodes are keyed by instance uid, never by
 *      subject id. Clicking a node PINS the panel to that subject while the
 *      core keeps following the live step; clicking the core follows live
 *      again — the core NEVER collapses the card.
 *   3. Every stage carries the panel X. It collapses the card — live or
 *      completed — to a COMPACT STRIP of subject discs through a two-beat
 *      choreography (panel closes and the dial recenters, then the dial lifts
 *      up into the strip line); reopening a strip disc plays the same two
 *      beats in reverse (the dial drops down from the strip line, then slides
 *      left as the panel opens, pinned to the clicked subject). A LIVE strip
 *      keeps spawning discs and pulses the current one; a superseded card
 *      compacts itself through the same choreography.
 *   4. Rows stream: the panel reveals a subject's rows as the record's clock
 *      passes startAt+at, and `stream:true` rows word-stream through
 *      M.words() exactly like the shared chrome.
 *   5. Subjects can carry their own child agents (workRuns instance `agents`
 *      refs into D.subagents); with none, no agents section renders at all.
 *   6. Hover: nodes, satellites and strip discs use the app's instant
 *      hover-card (data-hover-tip / data-hover-key) — native title tooltips
 *      never survive the 500ms work tick.
 *   7. Keeps the live phase disc scrolled into view in the shared trail.
 *
 * DESIGN NOTES THAT MATTER IF YOU EDIT THIS
 *   - The markup reuses the ORIGINAL class names (.orbit-stage / .orbit-ring /
 *     .orbit-node / .orbit-core / .orbit-track / .orbit-caption); orbit.css
 *     supersedes the legacy styles.css rules instead of orphaning them.
 *   - Geometry is NOT in this file: radius derives from the dial's container
 *     size, density tiers ride the `data-orbit-tier` attribute stamped here.
 *   - UI state lives in this module's closure, keyed BY CARD (ctx.cardId),
 *     because one transcript can hold several Orbit cards at once. The
 *     choreography phases live there too (`anim`: e1 → open; c1 → c2 → strip),
 *     driven by per-card timers that re-render through the app's own
 *     renderApp (captured from ctx — never a private render path).
 *   - data-k rule: constant keys for the frame (orbit / orbdial / ring /
 *     core / orbpanel), instance-uid keys where a replay IS wanted
 *     (`opin:<uid>` replays the row cascade on a subject change,
 *     `orow:<uid>:<j>` materializes each row exactly once as it streams in).
 */
(function () {
  'use strict';

  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;

  /* ---- module state ---------------------------------------------------
     Per-card UI, keyed by the card's message id (ctx.cardId):
       pin      index the panel is pinned to, or null = follow live
       rotDeg/rotIdx  shortest-arc rotation accumulator (per card)
       compact  null = follow rec.supersededBy; true/false = user override
       anim     choreography phase: 'e1' (dial drop, panel closed),
                'c1' (panel closing), 'c2' (dial lifting) — null = settled
       shown    what the previous render produced ('stage'|'strip'), so a
                newly-superseded card can start the collapse choreography */
  var UI = {};
  var lastTake = null;
  var lastRender = null;
  function uiFor(id) {
    return UI[id] || (UI[id] = { pin: null, rotDeg: 0, rotIdx: null, compact: null, anim: null, shown: null });
  }

  /* ---- per-card choreography timers ----------------------------------- */
  var TIMERS = {};
  function killTimers(id) { (TIMERS[id] || []).forEach(clearTimeout); TIMERS[id] = []; }
  function later(id, ms, fn) { (TIMERS[id] = TIMERS[id] || []).push(setTimeout(fn, ms)); }
  function clearAllTimers() { for (var k in TIMERS) killTimers(k); }
  function rerender() { if (lastRender) lastRender(); }
  function reduced() { var M = window.PM56_MOTION; return !!(M && M.reduced && M.reduced()); }

  /* COLLAPSE: C1 the grid closes (420ms — panel folds, dial recenters),
     C2 the dial lifts up into the strip line (240ms), then the strip mounts.
     `finalCompact` true = the user asked (X); null = supersededBy drives. */
  function beginCollapse(id, ui, finalCompact) {
    killTimers(id);
    if (reduced()) {
      ui.anim = null; ui.pin = null; ui.shown = 'strip';
      if (finalCompact != null) ui.compact = finalCompact;
      return;
    }
    ui.anim = 'c1';
    if (finalCompact != null) ui.pendingCompact = finalCompact;
    later(id, 430, function () { ui.anim = 'c2'; rerender(); });
    later(id, 690, function () {
      ui.anim = null; ui.pin = null;
      /* Mark the landing state BEFORE the render: the auto-collapse detector
         keys on shown==='stage', and without this the finished choreography
         read as "newly superseded while open" and restarted itself forever
         (measured: the strip never mounted, `lift` looping every ~700ms). */
      ui.shown = 'strip';
      if (ui.pendingCompact != null) { ui.compact = ui.pendingCompact; delete ui.pendingCompact; }
      rerender();
    });
  }

  /* EXPAND: E1 the dial drops down from the strip line (240ms, panel still
     closed — today's resting pose), then the ordinary open transition slides
     it left and unfolds the panel onto the clicked subject. */
  function beginExpand(id, ui, pinIdx) {
    killTimers(id);
    ui.compact = false;
    ui.pin = pinIdx != null ? pinIdx : null;
    if (reduced()) { ui.anim = null; return; }
    ui.anim = 'e1';
    later(id, 440, function () { ui.anim = null; rerender(); });
  }

  /* Continuous rotation: accumulated per card, shortest arc per move. */
  function rotationFor(ui, i, n) {
    var seg = 360 / Math.max(1, n);
    var key = i + '/' + n;
    if (ui.rotIdx === key) return ui.rotDeg;
    var target = -i * seg;
    var delta = ((target - ui.rotDeg) % 360 + 540) % 360 - 180;
    ui.rotDeg = ui.rotDeg + delta;
    ui.rotIdx = key;
    return ui.rotDeg;
  }

  /* ---- the take ------------------------------------------------------ */
  EXT.slot('workingTake:1', function (c) {
    var w = c.ctx;
    var rec = w.rec || c.state.work;
    lastRender = c.renderApp;

    /* Reset ALL per-card ui when the family switches away and back. */
    if (lastTake !== 1) { UI = {}; clearAllTimers(); lastTake = 1; }
    var ui = uiFor(w.cardId);

    var wantStrip = ui.compact != null ? ui.compact : !!rec.supersededBy;

    /* A card that was showing its stage and is now superseded collapses
       through the choreography rather than snapping to the strip. */
    if (wantStrip && ui.anim == null && ui.shown === 'stage' && !reduced()) {
      beginCollapse(w.cardId, ui, null);
    }

    if (ui.anim != null) { ui.shown = 'stage'; return renderStage(c, ui); }
    if (wantStrip) { ui.shown = 'strip'; return renderStrip(c, ui); }
    ui.shown = 'stage';
    return renderStage(c, ui);
  });

  /* ---- hover tip helpers ---------------------------------------------- */
  function tipAttrs(esc, cardId, key, title, body) {
    return ' data-hover-key="' + esc(cardId + ':' + key) + '"'
      + ' data-hover-tip="' + esc(title + '\n' + body) + '"';
  }

  /* ---- full stage ----------------------------------------------------- */
  function renderStage(c, ui) {
    var esc = c.esc, icon = c.icon, w = c.ctx;
    var rec = w.rec || c.state.work;
    var steps = w.steps;

    var spawned = rec.completed ? steps.slice() : steps.filter(function (s) { return s.startAt <= w.clock + 1e-6; });
    if (!spawned.length) spawned = steps.slice(0, 1);
    var n = spawned.length, seg = 360 / n;

    var liveIdx = Math.min(w.index, n - 1);
    var pin = (ui.pin != null && ui.pin >= 0 && ui.pin < n) ? ui.pin : null;
    var panelIdx = pin != null ? pin : liveIdx;
    var live = steps[liveIdx];        // what the CORE and the head caption describe
    var pf = steps[panelIdx];         // what the PANEL describes
    var open = ui.anim == null;       // posed (closed) during every choreography phase
    var animAttr = ui.anim === 'e1' ? 'drop' : ui.anim === 'c2' ? 'lift' : null;
    var rot = rotationFor(ui, panelIdx, n);
    var tier = n >= 22 ? 'xl' : n >= 13 ? 'lg' : '';

    /* ---- nodes ------------------------------------------------------ */
    var nodes = spawned.map(function (sx, i) {
      var cls = 'orbit-node';
      if (rec.completed || i < liveIdx) cls += ' done';
      if (i === liveIdx && !rec.completed) cls += ' live';
      if (i === panelIdx) cls += ' focus';
      if (i === panelIdx && pin != null) cls += ' open';
      var st = i < liveIdx ? 'completed' : i === liveIdx ? (rec.completed ? 'completed' : 'in progress') : 'pending';
      var statBit = sx.stat ? sx.label + ' · ' + sx.stat : sx.label;
      return '<button type="button" class="' + cls + '" data-k="node:' + esc(sx.uid) + '"'
        + ' data-step-kind="' + esc(sx.kind) + '"'
        + ' data-action="orbit-open-phase" data-value="' + i + '"'
        + ' style="--angle:' + (i * seg).toFixed(4) + 'deg;--node-i:' + Math.min(i, 8) + '"'
        + ' aria-pressed="' + (i === panelIdx && pin != null ? 'true' : 'false') + '"'
        + tipAttrs(esc, w.cardId, sx.uid, statBit, sx.verb + ' (' + st + ')')
        + ' aria-label="Subject ' + (i + 1) + ' of ' + n + ': ' + esc(sx.label) + ', ' + st + (sx.stat ? ', ' + esc(sx.stat) : '') + '">'
        + icon(sx.icon, 13) + '<i class="orbit-node-pip"></i></button>';
    }).join('');

    /* ---- subagent satellites (follow the PANEL subject) -------------- */
    var agents = agentsFor(c, pf);
    var sats = '';
    if (pf.kind === 'agents' && agents.length) {
      var an = Math.min(agents.length, 5);
      sats = agents.slice(0, an).map(function (a, i) {
        var ang = -52 + (i * (104 / Math.max(1, an - 1)));
        return '<button type="button" class="orbit-sat ' + tone(a.status) + '" data-k="sat:' + esc(a.id) + '"'
          + ' data-action="open-agent" data-id="' + esc(a.id) + '"'
          + ' style="--angle:' + ang.toFixed(2) + 'deg;--sat-i:' + i + '"'
          + tipAttrs(esc, w.cardId, 'sat-' + a.id, a.name, statusLabel(c, a.status) + ' — opens the child agent thread')
          + ' aria-label="Open child agent ' + esc(a.name) + '">'
          + '<span class="orbit-sat-mark">' + esc(initials(a.name)) + '</span></button>';
      }).join('');
    }

    /* ---- core: ALWAYS the live subject; NEVER a collapse control ----- */
    var coreTitle = pin != null ? 'Follow the live step again' : 'Following the live step';
    var core = '<button type="button" class="orbit-core' + (rec.completed ? ' done' : '') + '"'
      + ' data-k="core" data-action="orbit-toggle" aria-pressed="' + (pin == null ? 'true' : 'false') + '"'
      + tipAttrs(esc, w.cardId, 'core', coreTitle, pin != null ? 'Return focus to the live subject' : 'The dial follows the live subject')
      + '>'
      + '<span class="orbit-core-icon" data-k="coreicon:' + esc(live.uid) + '">' + icon(rec.completed ? 'check' : live.icon, 22) + '</span>'
      /* CONSTANT key on purpose: a subject key here remounted the label on
         every handover and the pm-materialize entrance blanked the core for
         ~40ms mid-rotation. */
      + '<strong data-k="corelabel">' + esc(live.label) + '</strong>'
      + '</button>';

    var panel = '<div class="orbit-panel" data-k="orbpanel" role="region" aria-label="Subject detail"'
      + (open ? '' : ' aria-hidden="true"') + '>'
      + '<div class="orbit-panel-in" data-k="opin:' + esc(pf.uid) + '">'
      + renderPanel(c, ui, pf, panelIdx, n)
      + '</div></div>';

    return '<div class="orbit-stage' + (open ? ' is-open' : '') + '" data-k="orbit"'
      + ' data-orbit-open="' + (open ? '1' : '0') + '" data-orbit-focus="' + esc(pf.uid) + '"'
      + (animAttr ? ' data-orbit-anim="' + animAttr + '"' : '')
      + (tier ? ' data-orbit-tier="' + tier + '"' : '')
      + ' data-step-kind="' + esc(pf.kind) + '"'
      + ' style="--seg:' + seg.toFixed(4) + 'deg;--orbit-rot:' + rot.toFixed(3) + 'deg">'
      + '<div class="orbit-layout" data-k="orblayout">'
      + '<div class="orbit-dial" data-k="orbdial">'
      + '<i class="orbit-track" data-k="orbtrack"></i>'
      + '<div class="orbit-ring" data-k="ring">' + nodes + sats + '</div>'
      + core
      + '</div>'
      + panel
      + '</div></div>';
  }

  /* ---- panel body ---------------------------------------------------- */
  function renderPanel(c, ui, pf, pi, spawnedCount) {
    var esc = c.esc, icon = c.icon, w = c.ctx, M = w.M;
    var rec = w.rec || c.state.work;
    var done = pi < w.index || rec.completed;
    var liveHere = pi === w.index && !rec.completed;
    var chip = done ? ['ok', 'Completed'] : liveHere ? [w.running ? 'run' : 'idle', w.running ? 'In progress' : 'Paused'] : ['idle', 'Pending'];

    var rows = pf.rows || [];
    var visible = rec.completed ? rows : rows.filter(function (r) { return w.rowVisible(pf, r); });
    var word = 0;
    var rowHtml = visible.map(function (r, j) {
      var body;
      if (r.stream) {
        body = '<span class="wa-prose pm-stream">' + M.words(r.text, word) + '</span>';
        word += M.wordCount(r.text);
      } else {
        body = '<span class="wa-rowtext">' + esc(r.text) + '</span>';
      }
      var meta = r.add != null
        ? '<span class="wa-meta"><b class="wa-add">+' + r.add + '</b>' + (r.del != null ? ' <b class="wa-del">−' + r.del + '</b>' : '') + '</span>'
        : r.url ? '<span class="wa-meta"><b class="wa-tag">' + esc(r.url) + '</b></span>'
        : r.tag ? '<span class="wa-meta"><b class="wa-tag">' + esc(r.tag) + '</b></span>' : '';
      var wrap = w.shellRowWrap;
      if (wrap) return wrap(w.cardId, pf, r, j, body + meta, 'orow:' + esc(pf.uid) + ':' + j, 'wa-row', Math.min(j, 6));
      return '<span class="wa-row pm-materialize" data-k="orow:' + esc(pf.uid) + ':' + j + '" style="--pm-stagger:' + Math.min(j, 6) + '">'
        + body + meta + '</span>';
    }).join('');

    /* Child agents — only when this subject actually has some. */
    var agentsHtml = '';
    if (pf.kind === 'agents') {
      var list = agentsFor(c, pf);
      if (list.length) {
        agentsHtml = '<div class="orbit-agents" data-k="oagents">'
          + '<div class="orbit-agents-head"><span>Child agents</span><span class="count">' + list.length + '</span></div>'
          + list.map(function (a) {
            return '<button type="button" class="orbit-agent" data-k="oa:' + esc(a.id) + '"'
              + ' data-action="open-agent" data-id="' + esc(a.id) + '"'
              + tipAttrs(esc, w.cardId, 'oa-' + a.id, a.name, 'Open the child agent thread')
              + '>'
              + '<span class="orbit-agent-avatar">' + esc(initials(a.name)) + '</span>'
              + '<span class="orbit-agent-copy"><strong>' + esc(a.name) + '</strong>'
              + '<span>' + esc(a.current || a.blocker || '—') + '</span></span>'
              + '<span class="orbit-agent-state ' + tone(a.status) + '">' + esc(statusLabel(c, a.status)) + '</span>'
              + '</button>';
          }).join('')
          + '</div>';
      }
    }

    var jump = (pi !== w.index && !rec.completed)
      ? '<button type="button" class="soft-button orbit-jump" data-k="ojump" data-action="inspect-work-step" data-value="' + pi + '">'
      + icon('step', 12) + ' Move the run to this step</button>'
      : '';

    /* The X collapses ANY stage — live or completed — to the strip. */
    var close = '<button type="button" class="orbit-close" data-k="oclose" data-action="orbit-collapse"'
      + tipAttrs(esc, w.cardId, 'oclose', 'Collapse to the summary', 'Pack this work activity into its compact strip')
      + ' aria-label="Collapse to the compact summary">' + icon('close', 12) + '</button>';

    return '<div class="orbit-panel-head">'
      + '<span class="orbit-step-no">Subject ' + (pi + 1) + (rec.completed ? ' of ' + w.total : ' · ' + spawnedCount + ' so far') + '</span>'
      + '<span class="orbit-chip ' + chip[0] + '">' + chip[1] + '</span>'
      + '<span class="wa-spacer"></span>'
      + close
      + '</div>'
      + '<strong class="orbit-panel-title">' + esc(pf.verb) + '</strong>'
      + '<p class="orbit-panel-detail">' + esc(pf.detail) + '</p>'
      + '<div class="orbit-rows pm-rows">' + rowHtml + '</div>'
      + agentsHtml
      + jump;
  }

  /* ---- compact strip --------------------------------------------------
     A LIVE record keeps spawning discs here and pulses the current one; a
     completed record shows every subject plus the receipt chips (minus the
     elapsed chip — the card head already prints the time). */
  function renderStrip(c, ui) {
    var esc = c.esc, icon = c.icon, w = c.ctx, M = w.M;
    var rec = w.rec || c.state.work;
    var steps = w.steps;
    var spawned = rec.completed ? steps.slice() : steps.filter(function (s) { return s.startAt <= w.clock + 1e-6; });
    if (!spawned.length) spawned = steps.slice(0, 1);
    var liveIdx = Math.min(w.index, spawned.length - 1);

    var discs = spawned.map(function (sx, i) {
      var cur = !rec.completed && i === liveIdx;
      var cls = 'pm-rail-item wa-disc orbit-strip-item ' + (cur ? 'current' : 'done');
      var st = i < liveIdx ? 'completed' : cur ? 'in progress' : 'completed';
      var statBit = sx.stat ? sx.label + ' · ' + sx.stat : sx.label;
      return '<button type="button" class="' + cls + '" data-k="sd:' + esc(sx.uid) + '"'
        + ' data-step-kind="' + esc(sx.kind) + '"'
        + ' data-action="orbit-reopen" data-value="' + i + '"'
        + tipAttrs(esc, w.cardId, 'sd-' + sx.uid, statBit, sx.verb + ' (' + st + ') — reopen this subject')
        + ' aria-label="Reopen ' + esc(sx.label) + '">'
        + icon(sx.icon, 11) + '</button>';
    }).join('');

    return '<div class="orbit-strip" data-k="strip">'
      + '<span class="pm-rail wa-track orbit-strip-rail" data-k="striprail">' + discs + '</span>'
      + '<span class="wa-label"><b class="wa-verb" data-k="stripn">' + M.roll(spawned.length) + (spawned.length === 1 ? ' subject' : ' subjects') + '</b></span>'
      + '<button type="button" class="orbit-strip-chev" data-k="stripchev" data-action="orbit-reopen"'
      + tipAttrs(esc, w.cardId, 'stripchev', 'Expand this work activity', 'Reopen the stage for the current subject')
      + ' aria-label="Expand this work activity">' + icon('down', 12) + '</button>'
      + '</div>'
      + (rec.completed ? '<div class="orbit-strip-receipt" data-k="stripr">' + w.workReceipt({ elapsed: false }) + '</div>' : '');
  }

  /* ---- head caption: the live subject, left of the elapsed time ------- */
  EXT.slot('workingHeadCaption', function (c) {
    if (c.state.variants[2] !== 1) return '';
    var rec = c.rec, ctx = c.ctx;
    if (!rec || !ctx) return '';
    /* A completed card's head already says "Completed" — repeating the final
       subject there read as "Completed work Complete". Live cards (stage OR
       strip) keep the running caption. */
    if (rec.completed) return '';
    var f = ctx.step;
    return '<span class="orbit-caption work-detail" data-k="cap:' + c.esc(f.uid || f.id) + '">'
      + '<b class="orbit-caption-label">' + c.esc(f.label) + '</b> · ' + c.esc(f.detail) + '</span>';
  });

  /* ---- helpers ------------------------------------------------------- */
  function cardBits(ctx, btn) {
    var card = btn && btn.closest ? btn.closest('.working-card') : null;
    if (!card) return null;
    var wid = card.dataset.card;
    var rec = (wid && wid !== 'primary' && ctx.state.works && ctx.state.works[wid]) || ctx.state.work;
    return { card: card, ui: uiFor(card.dataset.cardUi || 'work'), rec: rec, uiId: card.dataset.cardUi || 'work' };
  }
  /* A subject that carries its own `agents` refs (workRuns instances) wins;
     otherwise the thread's own children. No agents — no section, no sats. */
  function agentsFor(c, pf) {
    var all = (c.D && c.D.subagents) || [];
    if (pf && pf.agents && pf.agents.length) {
      return pf.agents.map(function (a) {
        var base = null;
        for (var i = 0; i < all.length; i++) if (all[i].id === a.ref) { base = all[i]; break; }
        var out = {}; var k;
        if (base) for (k in base) out[k] = base[k];
        else { out.id = a.ref || 'agent'; out.name = a.ref || 'Agent'; }
        for (k in a) if (k !== 'ref') out[k] = a[k];
        return out;
      });
    }
    var tid = c.state.selectedThread;
    return all.filter(function (a) { return a.parentThreadId === tid; });
  }
  function statusLabel(c, v) {
    var map = (c.D && c.D.labels && c.D.labels.subagentStatus) || null;
    return (map && map[v]) || v || '—';
  }
  function tone(status) {
    if (status === 'complete') return 'ok';
    if (status === 'working' || status === 'retrying') return 'run';
    if (status === 'blocked' || status === 'failed') return 'bad';
    if (status === 'fallback') return 'warn';
    return 'idle';
  }
  function initials(name) {
    return String(name || '?').split(/\s+/).map(function (x) { return x[0] || ''; }).join('').slice(0, 2).toUpperCase();
  }

  /* ---- actions ------------------------------------------------------- */
  /* Node click PINS (no toggle: clicking the pinned node again is a no-op
     re-pin, never a collapse). */
  EXT.action('orbit-open-phase', function (ctx, btn) {
    var b = cardBits(ctx, btn); if (!b) return false;
    if (b.ui.anim != null) return true;           // mid-choreography: ignore
    b.ui.pin = Number(btn.dataset.value);
    ctx.renderApp();
    return true;
  });
  /* Core click: follow live again. It NEVER collapses the card. */
  EXT.action('orbit-toggle', function (ctx, btn) {
    var b = cardBits(ctx, btn); if (!b) return false;
    if (b.ui.anim != null) return true;
    b.ui.pin = null;
    ctx.renderApp();
    return true;
  });
  /* The panel X: collapse this card — live or completed — to its strip. */
  EXT.action('orbit-collapse', function (ctx, btn) {
    var b = cardBits(ctx, btn); if (!b) return false;
    if (b.ui.anim != null) return true;
    beginCollapse(b.uiId, b.ui, true);
    ctx.renderApp();
    return true;
  });
  /* Strip disc: reopen this card pinned to the clicked subject, dial-drop
     first, then the ordinary open transition. */
  EXT.action('orbit-reopen', function (ctx, btn) {
    var b = cardBits(ctx, btn); if (!b) return false;
    if (b.ui.anim != null) return true;
    var v = btn.dataset.value;
    beginExpand(b.uiId, b.ui, (v == null || v === '') ? null : Number(v));
    ctx.renderApp();
    return true;
  });
  /* Declining (returning false) lets app.js's own branch run afterwards.
     ONLY reset clears the card's ui: play/complete must respect the reader's
     pin and collapse — pressing play on a collapsed live card used to pop it
     back open, which reads as the app fighting the reader. */
  EXT.action('reset-working', function (ctx, btn) {
    var card = btn && btn.closest ? btn.closest('.working-card') : null;
    if (card) {
      var id = card.dataset.cardUi;
      var ui = UI[id];
      if (ui) { ui.pin = null; ui.compact = null; ui.anim = null; delete ui.pendingCompact; }
      killTimers(id);
    }
    return false;
  });

  /* Take 1 renders its own child agents (ring satellites + panel rows), so it
     must not also get app.js's shared inline list appended underneath. */
  window.PM56_WORKING = window.PM56_WORKING || {};
  if (typeof window.PM56_WORKING[1] !== 'function') window.PM56_WORKING[1] = {};
  window.PM56_WORKING[1].ownsAgents = true;

  /* ---- shared trail: keep the live disc in view ----------------------- */
  var pending = false;
  function syncTrails() {
    pending = false;
    var tracks = document.querySelectorAll('.wa-track');
    for (var i = 0; i < tracks.length; i++) {
      var t = tracks[i];
      if (t.scrollWidth <= t.clientWidth + 1) continue;
      var d = t.querySelector('.wa-disc.current') || t.querySelector('.wa-disc:last-child');
      if (!d) continue;
      var lo = d.offsetLeft - 8, hi = d.offsetLeft + d.offsetWidth + 8;
      if (lo < t.scrollLeft) t.scrollLeft = lo;
      else if (hi > t.scrollLeft + t.clientWidth) t.scrollLeft = hi - t.clientWidth;
    }
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(syncTrails); } }

  function boot() {
    var root = document.getElementById('pmRoot');
    if (!root) { requestAnimationFrame(boot); return; }
    try {
      new MutationObserver(schedule).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    } catch (e) { /* observer is a convenience, never a requirement */ }
    schedule();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
