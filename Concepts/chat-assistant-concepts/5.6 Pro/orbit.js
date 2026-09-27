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
    return UI[id] || (UI[id] = { pin: null, rotDeg: 0, rotIdx: null, compact: null, anim: null, shown: null, born: {} });
  }

  /* ---- per-card choreography timers ----------------------------------- */
  var TIMERS = {};
  function killTimers(id) { (TIMERS[id] || []).forEach(clearTimeout); TIMERS[id] = []; }
  function later(id, ms, fn) { (TIMERS[id] = TIMERS[id] || []).push(setTimeout(fn, ms)); }
  function clearAllTimers() { for (var k in TIMERS) killTimers(k); }
  function rerender() { if (lastRender) lastRender(); }
  function reduced() { var M = window.PM56_MOTION; return !!(M && M.reduced && M.reduced()); }
  function motionNow() { var K = window.PM56_CLOCK; return K && K.now ? K.now() : performance.now(); }

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
    later(id, 430, function () { ui.anim = 'c2'; rerender(); shrinkStage(id); });
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

  /* C2 as one move: while the dial lifts into the strip line, the stage's
     height closes toward the strip's, instead of the dial fading out of a box
     that keeps its size until the strip mounts (a dead, empty frame). The
     strip's mount FLIP then only settles the last few pixels. */
  var STRIP_H = 64;
  function shrinkStage(id) {
    var node = document.querySelector('[data-hover-key^="' + (window.CSS && CSS.escape ? CSS.escape(id) : id) + ':"]');
    var stage = node && node.closest('.orbit-stage');
    if (!stage || !stage.animate) return;
    var h = stage.getBoundingClientRect().height;
    if (h <= STRIP_H + 4) return;
    stage.animate([{ height: h + 'px', overflow: 'hidden' }, { height: STRIP_H + 'px', overflow: 'hidden' }],
      { duration: 250, easing: 'cubic-bezier(.3, .7, .2, 1)', fill: 'forwards' });
  }

  /* EXPAND: E1 the dial drops down from the strip line (240ms, panel still
     closed — today's resting pose), then the ordinary open transition slides
     it left and unfolds the panel onto the clicked subject. */
  function beginExpand(id, ui, pinIdx) {
    killTimers(id);
    ui.compact = false;
    ui.pin = pinIdx != null ? pinIdx : null;
    if (pinIdx == null) ui.pinUid = null;
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
  /* ---- display list (Chat WOW M4) --------------------------------------
     What the ring shows. Several subjects can be live at once and a subject
     can fail or wait for the reader (ctx.liveSet / ctx.statusOf). Long runs
     stay legible: past CLUSTER_AT spawned subjects, adjacent subjects of the
     same kind merge into one cluster node with a count ("Read x12"); past
     FOLD_AT nodes, the oldest fold into one "Earlier" node. Each item keeps its
     member instance indexes, so the panel can list every member's rows. */
  var CLUSTER_AT = 16, FOLD_AT = 30;
  function displayItems(w, rec) {
    var steps = w.steps, out = [], i;
    var live = w.liveSet ? w.liveSet() : null;
    if (!live) { live = new Set(); if (!rec.completed) live.add(w.index); }
    for (i = 0; i < steps.length; i++) if (rec.completed || steps[i].startAt <= w.clock + 1e-6) out.push({ idx: [i], uid: steps[i].uid, kind: steps[i].kind, inst: steps[i] });
    if (!out.length) out.push({ idx: [0], uid: steps[0].uid, kind: steps[0].kind, inst: steps[0] });
    if (out.length > CLUSTER_AT) {
      var merged = [];
      out.forEach(function (it) {
        var last = merged[merged.length - 1];
        if (last && last.kind === it.kind) { last.idx.push(it.idx[0]); last.cluster = true; }
        else merged.push(it);
      });
      out = merged;
    }
    if (out.length > FOLD_AT) {
      var keep = out.slice(out.length - (FOLD_AT - 1)), folded = out.slice(0, out.length - (FOLD_AT - 1)), all = [];
      folded.forEach(function (f) { all = all.concat(f.idx); });
      out = [{ idx: all, uid: 'earlier:' + steps[all[0]].uid, kind: 'earlier', inst: steps[all[0]], earlier: true, cluster: true }].concat(keep);
    }
    out.forEach(function (it) {
      it.count = it.idx.length;
      it.live = !rec.completed && it.idx.some(function (k) { return live.has(k); });
      it.status = null;
      it.idx.forEach(function (k) { var st = w.statusOf ? w.statusOf(steps[k]) : null; if (st) it.status = st; });
      it.hasFocus = it.idx.indexOf(w.index) >= 0;
      it.done = rec.completed || (!it.live && it.idx.every(function (k) { return k < w.index || (!live.has(k) && steps[k].startAt + (steps[k].dur != null ? steps[k].dur : 2) <= w.clock + 1e-6); }));
    });
    return out;
  }
  function itemIcon(it) { return it.earlier ? 'history' : it.inst.icon; }
  function itemLabel(it) { return it.earlier ? 'Earlier' : it.inst.label; }

  /* ---- full stage ----------------------------------------------------- */
  function renderStage(c, ui) {
    var esc = c.esc, icon = c.icon, w = c.ctx;
    var rec = w.rec || c.state.work;
    var steps = w.steps;
    var items = displayItems(w, rec);
    var n = items.length, seg = 360 / n;
    ui.list = items.map(function (it) { return it.uid; });

    var liveI = 0;
    items.forEach(function (it, i) { if (it.hasFocus) liveI = i; });
    var pinI = null;
    if (ui.pinUid != null) { var at = ui.list.indexOf(ui.pinUid); if (at >= 0) pinI = at; }
    else if (ui.pin != null && ui.pin >= 0 && ui.pin < n) pinI = ui.pin;
    var panelI = pinI != null ? pinI : liveI;
    var live = steps[Math.min(w.index, steps.length - 1)];   // what the CORE and the head caption describe
    var pItem = items[panelI];
    var open = ui.anim == null;
    var animAttr = ui.anim === 'e1' ? 'drop' : ui.anim === 'c2' ? 'lift' : null;
    var rot = rotationFor(ui, panelI, n);
    var tier = n >= 22 ? 'xl' : n >= 13 ? 'lg' : '';
    var liveCount = items.filter(function (it) { return it.live; }).length;
    var waiting = items.some(function (it) { return it.live && it.status === 'waiting'; });

    /* ---- nodes ------------------------------------------------------ */
    /* A node keeps its entrance animation only while it can still be playing
       (360ms + up to 320ms stagger). Once settled it drops the animation:
       a finished animation whose keyframes read var() is re-resolved on every
       restyle, and every spawn restyles the whole ring (re-space + turn). */
    var tNow = motionNow(), born = ui.born || (ui.born = {});
    var nodes = items.map(function (it, i) {
      var sx = it.inst;
      var cls = 'orbit-node';
      if (born[it.uid] == null) born[it.uid] = tNow;
      var settled = tNow - born[it.uid] > 900;
      if (it.done) cls += ' done';
      if (it.live) cls += ' live';
      if (it.status === 'failed') cls += ' failed';
      if (it.status === 'waiting') cls += ' waiting';
      if (it.cluster) cls += it.earlier ? ' cluster earlier' : ' cluster';
      if (i === panelI) cls += ' focus';
      if (i === panelI && pinI != null) cls += ' open';
      var st = it.status === 'failed' ? 'failed' : it.status === 'waiting' ? 'waiting for you' : it.done ? 'completed' : it.live ? 'in progress' : 'pending';
      var label = itemLabel(it) + (it.count > 1 ? ' ×' + it.count : '');
      var statBit = it.count > 1 ? label : (sx.stat ? sx.label + ' · ' + sx.stat : sx.label);
      return '<button type="button" class="' + cls + '" data-k="node:' + esc(it.uid) + '"'
        + ' data-step-kind="' + esc(it.earlier ? sx.kind : it.kind) + '"'
        + ' data-action="orbit-open-phase" data-value="' + i + '"'
        + ' style="--angle:' + (i * seg).toFixed(4) + 'deg;--node-i:' + Math.min(i, 8) + '"'
        + (settled ? ' data-settled' : '')
        + ' aria-pressed="' + (i === panelI && pinI != null ? 'true' : 'false') + '"'
        + tipAttrs(esc, w.cardId, it.uid, statBit, (it.count > 1 ? it.count + ' subjects' : sx.verb) + ' (' + st + ')')
        + ' aria-label="' + esc(label) + ', ' + st + '">'
        + icon(itemIcon(it), 13) + '<i class="orbit-node-pip"></i>'
        + (it.count > 1 ? '<b class="orbit-node-count">' + (it.earlier ? it.count : '×' + it.count) + '</b>' : '')
        + (it.status === 'failed' ? '<i class="orbit-node-flag">' + icon('close', 8) + '</i>' : it.status === 'waiting' ? '<i class="orbit-node-flag">' + icon('pause', 8) + '</i>' : '')
        + '</button>';
    }).join('');

    /* ---- subagent satellites (follow the PANEL subject) -------------- */
    var pf = pItem.inst;
    var agents = pItem.count === 1 ? agentsFor(c, pf) : [];
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
    var coreTitle = pinI != null ? 'Follow the live step again' : 'Following the live step';
    var core = '<button type="button" class="orbit-core' + (rec.completed ? ' done' : '') + (waiting ? ' waiting' : '') + '"'
      + ' data-k="core" data-action="orbit-toggle" aria-pressed="' + (pinI == null ? 'true' : 'false') + '"'
      + tipAttrs(esc, w.cardId, 'core', coreTitle, pinI != null ? 'Return focus to the live subject' : 'The dial follows the live subject')
      + '>'
      + '<span class="orbit-core-icon" data-k="coreicon:' + esc(live.uid) + '">' + icon(rec.completed ? 'check' : waiting ? 'pause' : live.icon, 22) + '</span>'
      /* CONSTANT key on purpose: a subject key here remounted the label on
         every handover and the pm-materialize entrance blanked the core for
         ~40ms mid-rotation. */
      + '<strong data-k="corelabel">' + esc(waiting ? 'Waiting for you' : live.label) + '</strong>'
      + (liveCount > 1 && !rec.completed ? '<em class="orbit-core-more" data-k="coremore">+' + (liveCount - 1) + '</em>' : '')
      + '</button>';

    var panel = '<div class="orbit-panel" data-k="orbpanel" role="region" aria-label="Subject detail"'
      + (open ? '' : ' aria-hidden="true"') + '>'
      + '<div class="orbit-panel-in" data-k="opin:' + esc(pItem.uid) + '">'
      + renderPanel(c, ui, pItem, panelI, n)
      + '</div></div>';

    return '<div class="orbit-stage' + (open ? ' is-open' : '') + '" data-k="orbit"'
      + ' data-orbit-open="' + (open ? '1' : '0') + '" data-orbit-focus="' + esc(pItem.uid) + '"'
      + (animAttr ? ' data-orbit-anim="' + animAttr + '"' : '')
      + (tier ? ' data-orbit-tier="' + tier + '"' : '')
      + ' data-step-kind="' + esc(pf.kind) + '"'
      + '>'
      + '<div class="orbit-layout" data-k="orblayout">'
      + '<div class="orbit-dial" data-k="orbdial">'
      + '<i class="orbit-track" data-k="orbtrack"></i>'
      /* the turn lives on the ring, its only reader: on the stage it made every
         element of the card restyle each time the dial turned */
      + '<div class="orbit-ring" data-k="ring" style="--seg:' + seg.toFixed(4) + 'deg;--orbit-rot:' + rot.toFixed(3) + 'deg">' + nodes + sats + '</div>'
      + core
      + '</div>'
      + panel
      + '</div>'
      + narrationLine(c, ui)
      + '</div>';
  }

  /* ---- narration (Chat WOW M4) ------------------------------------------
     Short lines the assistant writes between bursts of tool calls. While the
     latest line is newer than every started subject it is the turn's leading
     edge: it streams in as prose at the foot of the card. When the next subject
     starts, the same line tucks up into the head caption (a FLIP from where it
     was written), so short narration never splits the card. */
  function narrState(c) {
    var w = c.ctx, rec = w.rec || c.state.work;
    var list = w.narration ? w.narration() : [];
    if (!list.length || rec.completed) return null;
    var cur = -1;
    for (var i = 0; i < list.length; i++) if (list[i].at <= w.clock + 1e-6) cur = i;
    if (cur < 0) return null;
    var latestStart = 0;
    w.steps.forEach(function (s) { if (s.startAt <= w.clock + 1e-6) latestStart = Math.max(latestStart, s.startAt); });
    return { i: cur, text: list[cur].text, leading: list[cur].at > latestStart };
  }
  function narrationLine(c, ui) {
    var ns = narrState(c);
    if (!ns || !ns.leading) return '';
    var M = c.ctx.M;
    return '<div class="orbit-narration" data-k="onarr:' + ns.i + '"><span class="orbit-narration-mark"></span><span class="wa-prose pm-stream">' + M.words(ns.text) + '</span></div>';
  }
  /* ---- panel body ---------------------------------------------------- */
  function renderPanel(c, ui, item, pi, spawnedCount) {
    var esc = c.esc, icon = c.icon, w = c.ctx, M = w.M;
    var rec = w.rec || c.state.work;
    var pf = item.inst;
    var chip = item.status === 'failed' ? ['bad', 'Failed'] : item.status === 'waiting' ? ['warn', 'Waiting for you']
      : item.done ? ['ok', 'Completed'] : item.live ? [w.running ? 'run' : 'idle', w.running ? 'In progress' : 'Paused'] : ['idle', 'Pending'];
    var word = 0;
    function rowsFor(inst) {
      var rows = inst.rows || [];
      var visible = rec.completed ? rows : rows.filter(function (r) { return w.rowVisible(inst, r); });
      return visible.map(function (r, j) { return rowHtml(inst, r, j); }).join('');
    }
    if (item.count > 1) {
      /* a cluster lists every member (the newest eight), each with its rows */
      var members = item.idx.slice(-8).map(function (k) { return w.steps[k]; });
      var body = members.map(function (m) {
        return '<span class="orbit-member" data-k="omem:' + esc(m.uid) + '"><b>' + esc(m.label) + '</b>' + (m.stat ? ' · ' + esc(m.stat) : '') + '</span>' + rowsFor(m);
      }).join('');
      var closeC = '<button type="button" class="orbit-close" data-k="oclose" data-action="orbit-collapse"'
        + tipAttrs(esc, w.cardId, 'oclose', 'Collapse to the summary', 'Pack this work activity into its compact strip')
        + ' aria-label="Collapse to the compact summary">' + icon('close', 12) + '</button>';
      return '<div class="orbit-panel-head">'
        + '<span class="orbit-step-no">' + (item.earlier ? 'Earlier' : 'Subjects ' + (item.idx[0] + 1) + '–' + (item.idx[item.idx.length - 1] + 1)) + ' · ' + item.count + '</span>'
        + '<span class="orbit-chip ' + chip[0] + '">' + chip[1] + '</span>'
        + '<span class="wa-spacer"></span>' + closeC + '</div>'
        + '<strong class="orbit-panel-title">' + esc(item.earlier ? 'Earlier in this run' : pf.verb + ' ×' + item.count) + '</strong>'
        + '<p class="orbit-panel-detail">' + esc(item.earlier ? item.count + ' subjects folded to keep the ring legible.' : item.count + ' ' + pf.label.toLowerCase() + ' subjects in a row, grouped.') + '</p>'
        + '<div class="orbit-rows pm-rows">' + body + '</div>';
    }
    var html = rowsFor(pf);
    function rowHtml(inst, r, j) {
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
      if (wrap) return wrap(w.cardId, inst, r, j, body + meta, 'orow:' + esc(inst.uid) + ':' + j, 'wa-row', Math.min(j, 6));
      return '<span class="wa-row pm-materialize" data-k="orow:' + esc(inst.uid) + ':' + j + '" style="--pm-stagger:' + Math.min(j, 6) + '">'
        + body + meta + '</span>';
    }

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

    var inst0 = item.idx[0];
    var jump = (inst0 !== w.index && !rec.completed && !item.live)
      ? '<button type="button" class="soft-button orbit-jump" data-k="ojump" data-action="inspect-work-step" data-value="' + inst0 + '">'
      + icon('step', 12) + ' Move the run to this step</button>'
      : '';

    /* The X collapses ANY stage — live or completed — to the strip. */
    var close = '<button type="button" class="orbit-close" data-k="oclose" data-action="orbit-collapse"'
      + tipAttrs(esc, w.cardId, 'oclose', 'Collapse to the summary', 'Pack this work activity into its compact strip')
      + ' aria-label="Collapse to the compact summary">' + icon('close', 12) + '</button>';

    return '<div class="orbit-panel-head">'
      + '<span class="orbit-step-no">Subject ' + (inst0 + 1) + (rec.completed ? ' of ' + w.total : ' · ' + spawnedCount + ' so far') + '</span>'
      + '<span class="orbit-chip ' + chip[0] + '">' + chip[1] + '</span>'
      + '<span class="wa-spacer"></span>'
      + close
      + '</div>'
      + '<strong class="orbit-panel-title">' + esc(pf.verb) + '</strong>'
      + '<p class="orbit-panel-detail">' + esc(pf.detail) + '</p>'
      + '<div class="orbit-rows pm-rows">' + html + '</div>'
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
    var items = displayItems(w, rec);
    ui.list = items.map(function (it) { return it.uid; });
    var subjects = 0; items.forEach(function (it) { subjects += it.count; });

    var discs = items.map(function (it, i) {
      var sx = it.inst, cur = it.live;
      var cls = 'pm-rail-item wa-disc orbit-strip-item ' + (cur ? 'current' : 'done') + (it.cluster ? ' cluster' : '') + (it.status === 'failed' ? ' failed' : it.status === 'waiting' ? ' waiting' : '');
      var st = it.status === 'failed' ? 'failed' : it.status === 'waiting' ? 'waiting for you' : cur ? 'in progress' : 'completed';
      var label = itemLabel(it) + (it.count > 1 ? ' ×' + it.count : '');
      var statBit = it.count > 1 ? label : (sx.stat ? sx.label + ' · ' + sx.stat : sx.label);
      return '<button type="button" class="' + cls + '" data-k="sd:' + esc(it.uid) + '"'
        + ' data-step-kind="' + esc(sx.kind) + '"'
        + ' data-action="orbit-reopen" data-value="' + i + '"'
        + tipAttrs(esc, w.cardId, 'sd-' + it.uid, statBit, (it.count > 1 ? it.count + ' subjects' : sx.verb) + ' (' + st + ') — reopen this subject')
        + ' aria-label="Reopen ' + esc(label) + '">'
        + icon(itemIcon(it), 11) + (it.count > 1 ? '<b class="orbit-node-count">' + it.count + '</b>' : '') + '</button>';
    }).join('');

    return '<div class="orbit-strip" data-k="strip">'
      + '<span class="pm-rail wa-track orbit-strip-rail" data-k="striprail">' + discs + '</span>'
      + '<span class="wa-label"><b class="wa-verb" data-k="stripn">' + M.roll(subjects) + (subjects === 1 ? ' subject' : ' subjects') + '</b></span>'
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
    var ns = narrState(c);
    if (ns && !ns.leading) {
      /* the narration line has been overtaken by a new subject: it lives in the
         caption now. If it was on screen at the foot of the card a moment ago,
         fly it up from there (measured now, before the patch moves it). */
      var ui = uiFor(ctx.cardId);
      if (ui.narrTucked !== ns.i) {
        var from = document.querySelector('.working-card[data-card-ui="' + CSS.escape(ctx.cardId) + '"] .orbit-narration');
        if (from && !reduced()) {
          var fr = from.getBoundingClientRect();
          var key = 'narr:' + ns.i, card = ctx.cardId;
          requestAnimationFrame(function () { tuck(card, key, fr); });
        }
        ui.narrTucked = ns.i;
      }
      return '<span class="orbit-caption work-detail orbit-narr-cap" data-k="narr:' + ns.i + '"><i>' + c.esc(ns.text) + '</i></span>';
    }
    var f = ctx.step;
    return '<span class="orbit-caption work-detail" data-k="cap:' + c.esc(f.uid || f.id) + '">'
      + '<b class="orbit-caption-label">' + c.esc(f.label) + '</b> · ' + c.esc(f.detail) + '</span>';
  });
  /* The tuck: the caption starts where the line was written (translated and
     scaled from the foot of the card) and settles into the head. */
  function tuck(cardId, key, fr) {
    var cap = document.querySelector('.working-card[data-card-ui="' + CSS.escape(cardId) + '"] [data-k="' + key + '"]');
    if (!cap || !cap.animate) return;
    var cr = cap.getBoundingClientRect();
    var dx = fr.left - cr.left, dy = fr.top - cr.top;
    var voice = (document.querySelector('.transcript') || {}).getAttribute ? document.querySelector('.transcript').getAttribute('data-voice') : 'basic';
    var ease = voice === 'friendly' ? 'cubic-bezier(.34,1.4,.64,1)' : voice === 'retro' ? 'steps(5,end)' : 'cubic-bezier(.17,.84,.29,.99)';
    var ms = window.PM56_CLOCK ? window.PM56_CLOCK.ms(380) : 380;
    cap.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1.06)', opacity: 0.9 }, { transform: 'none', opacity: 1 }], { duration: ms, easing: ease });
  }

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
    var v = Number(btn.dataset.value);
    b.ui.pin = v; b.ui.pinUid = (b.ui.list && b.ui.list[v]) || null;
    ctx.renderApp();
    return true;
  });
  /* Core click: follow live again. It NEVER collapses the card. */
  EXT.action('orbit-toggle', function (ctx, btn) {
    var b = cardBits(ctx, btn); if (!b) return false;
    if (b.ui.anim != null) return true;
    b.ui.pin = null; b.ui.pinUid = null;
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
    var vi = (v == null || v === '') ? null : Number(v);
    beginExpand(b.uiId, b.ui, vi);
    b.ui.pinUid = vi == null ? null : ((b.ui.list && b.ui.list[vi]) || null);
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
      if (ui) { ui.pin = null; ui.pinUid = null; ui.compact = null; ui.anim = null; ui.narrTucked = null; delete ui.pendingCompact; }
      killTimers(id);
    }
    return false;
  });

  /* Chat WOW M4: the turn's answer has started -- fold this card into its strip
     through the ordinary collapse choreography, so the answer rises into the
     room it frees. Called by turn-stream.js; the reader can reopen it. */
  window.PM56_ORBIT = {
    /* shared with Step Rail (variants-a.js W[8]) so both styles group, flag and
       narrate a run the same way */
    items: function (w, rec) { return displayItems(w, rec); },
    narration: function (c) { return narrState(c); },
    compact: function (cardId) {
      var ui = uiFor(cardId);
      if (ui.compact === true || ui.shown === 'strip') { ui.compact = true; return false; }
      if (lastTake !== 1) { ui.compact = true; return false; }
      beginCollapse(cardId, ui, true);
      if (lastRender) lastRender();
      return true;
    }
  };

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
