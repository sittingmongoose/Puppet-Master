/* orbit.js — feature module.  OWNER: Wave 4 — Orbit agent (item 12: clickable orbit, responsive radius, shared trail icon fix)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules therefore run BEFORE the app boots, so anything
 * registered here is live on the very first render — no re-render, no flash.
 *
 * WHAT THIS MODULE DOES
 *   1. Replaces working-animation take 1 (Orbit) through the `workingTake:1`
 *      render slot, so app.js is never reopened.
 *   2. Adds three actions: orbit-open-phase / orbit-toggle / orbit-collapse.
 *   3. Declares take 1 as owning its own child-agent rendering, which suppresses
 *      app.js's shared `renderLiveAgentInline()` list underneath it (that list
 *      hardcodes the count "2" and `slice(0,2)` against a 14-record fixture).
 *   4. Keeps the live phase disc scrolled into view in the shared trail, which
 *      orbit.css just turned from a clipping box into a scrolling one.
 *
 * DESIGN NOTES THAT MATTER IF YOU EDIT THIS
 *   - The markup reuses the ORIGINAL class names (.orbit-stage / .orbit-ring /
 *     .orbit-node / .orbit-core / .orbit-track / .orbit-caption). That is
 *     deliberate: inventing new names would orphan six selector blocks in
 *     styles.css, which is the exact defect class this whole plan exists to
 *     fight. orbit.css supersedes those rules instead.
 *   - Geometry is NOT in this file. The radius is derived in CSS from the dial's
 *     own container size (`50cqi - node/2`), because the binding constraint is
 *     the user-resizable editor split, which no viewport media query can see.
 *   - Selection lives in this module's closure, not in app.js's `state`. The
 *     app's state object is closure-private and a module may not add to it; a
 *     module-local `sel` is the same idiom Wave 3 Menus used for its overlay
 *     state, and it survives every pmPatch because pmPatch never reads it.
 *   - data-k rule: the working card survives the 2s work tick, so every node
 *     here carries a key. Constant keys for the frame (orbit / orbdial / ring /
 *     core / orbpanel), subject keys where a replay IS wanted (`opin:<stepId>`
 *     replays the row cascade when the focused phase changes).
 */
(function () {
  'use strict';

  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;

  /* ---- module state -------------------------------------------------
     `sel` is the index of the phase the user opened, or null for the
     collapsed (circle-centred) resting state. */
  var sel = null;
  var lastTake = null;
  /* Continuous rotation. `-i * seg` alone would sweep the long way round
     whenever the focus wraps (13 -> 0 travels 13 segments backwards), so the
     rotation is accumulated and each move takes the shorter arc. Only ever
     updated when the focused index actually changes, so a plain re-render
     never nudges the ring. */
  var rotDeg = 0, rotIdx = null;
  /* The phase the PANEL is describing. It is not the same thing as the focused
     phase: while collapsing, the panel must keep the content the user was
     reading so it can shrink away, instead of blanking and leaving an empty box
     to collapse behind it. Filmed: without this the collapse cut the content on
     frame 1 and then spent ~280ms shrinking an empty rectangle. */
  var lastPanelIdx = 0;

  function rotationFor(i, n) {
    if (rotIdx === i) return rotDeg;
    var seg = 360 / n;
    var target = -i * seg;
    var delta = ((target - rotDeg) % 360 + 540) % 360 - 180;
    rotDeg = rotDeg + delta;
    rotIdx = i;
    return rotDeg;
  }

  function clampSel(total) {
    if (sel == null) return null;
    if (!(sel >= 0 && sel < total)) { sel = null; return null; }
    return sel;
  }

  /* ---- the take ------------------------------------------------------ */
  EXT.slot('workingTake:1', function (c) {
    var esc = c.esc, icon = c.icon, D = c.D, state = c.state;
    var w = c.ctx;                    // makeWorkCtx: step, pct, steps, index, running, completed…
    var steps = w.steps, total = steps.length;
    var seg = 360 / total;

    /* Reset the module's selection when the family switches away and back, so
       take 1 is never re-entered mid-inspection with a stale open phase. */
    if (lastTake !== 1) { sel = null; lastTake = 1; }

    var s = clampSel(total);
    var open = s != null;
    var fi = open ? s : w.index;      // focused index: what the core and panel describe
    var f = steps[fi] || w.step;
    var rot = rotationFor(fi, total);
    var pct = w.pct;

    /* ---- nodes ------------------------------------------------------ */
    var nodes = steps.map(function (sx, i) {
      var cls = 'orbit-node';
      if (w.completed || i < w.index) cls += ' done';
      if (i === w.index) cls += ' live';
      if (i === fi) cls += ' focus';
      if (open && i === s) cls += ' open';
      var st = i < w.index ? 'completed' : i === w.index ? (w.completed ? 'completed' : 'in progress') : 'pending';
      /* data-step-kind re-scopes motion.css's --pm-step per node, so the ring
         paints its real phase spectrum instead of one flat accent. */
      return '<button type="button" class="' + cls + '" data-k="node:' + esc(sx.id) + '"'
        + ' data-step-kind="' + esc(sx.kind) + '"'
        + ' data-action="orbit-open-phase" data-value="' + i + '"'
        + ' style="--angle:' + (i * seg).toFixed(4) + 'deg"'
        + ' aria-expanded="' + (open && i === s ? 'true' : 'false') + '"'
        + ' title="' + esc(sx.label) + ' — ' + esc(sx.verb) + ' (' + st + ')"'
        + ' aria-label="Step ' + (i + 1) + ' of ' + total + ': ' + esc(sx.label) + ', ' + st + '">'
        + icon(sx.icon, 13) + '<i class="orbit-node-pip"></i></button>';
    }).join('');

    /* ---- subagent satellites ---------------------------------------- */
    var agents = agentsForRun(c);
    var sats = '';
    if (f.kind === 'agents' && agents.length) {
      var n = Math.min(agents.length, 5);
      sats = agents.slice(0, n).map(function (a, i) {
        var ang = -52 + (i * (104 / Math.max(1, n - 1)));
        return '<button type="button" class="orbit-sat ' + tone(a.status) + '" data-k="sat:' + esc(a.id) + '"'
          + ' data-action="open-agent" data-id="' + esc(a.id) + '"'
          + ' style="--angle:' + ang.toFixed(2) + 'deg;--sat-i:' + i + '"'
          + ' title="' + esc(a.name) + ' — ' + esc(statusLabel(c, a.status)) + '. Opens the child agent thread."'
          + ' aria-label="Open child agent ' + esc(a.name) + '">'
          + '<span class="orbit-sat-mark">' + esc(initials(a.name)) + '</span></button>';
      }).join('');
    }

    /* ---- core ------------------------------------------------------- */
    var coreTitle = open
      ? 'Collapse back to the circle'
      : 'Open the current phase detail';
    var core = '<button type="button" class="orbit-core' + (w.completed ? ' done' : '') + '"'
      + ' data-k="core" data-action="orbit-toggle" aria-expanded="' + (open ? 'true' : 'false') + '"'
      + ' title="' + esc(coreTitle) + '">'
      + '<span class="orbit-core-icon" data-k="coreicon:' + esc(f.id) + '">' + icon(w.completed && !open ? 'check' : f.icon, 22) + '</span>'
      /* CONSTANT key on purpose. A subject key here remounted the label on every
         phase change, and styles.css gives `.orbit-core strong` a
         `pm-materialize` entrance from opacity 0 — the contact sheet showed the
         core going completely blank for ~40ms in the middle of the ring's
         rotation, which reads as a glitch rather than as a handover. The icon
         keeps its subject key and still pops; the word simply swaps. */
      + '<strong data-k="corelabel">' + esc(f.label) + '</strong>'
      + '<span class="orbit-core-pct work-detail" data-k="corepct">' + pct + '%</span>'
      + '</button>';

    /* ---- panel ------------------------------------------------------
       Keyed on the PANEL's phase, which only advances while open. Collapsed,
       the key does not change, so pmPatch patches instead of remounting and the
       content survives the collapse to be clipped away. */
    if (open) lastPanelIdx = s;
    var pi = open ? s : Math.min(lastPanelIdx, total - 1);
    var pf = steps[pi] || f;
    var panel = '<div class="orbit-panel" data-k="orbpanel" role="region" aria-label="Phase detail"'
      + (open ? '' : ' aria-hidden="true"') + '>'
      + '<div class="orbit-panel-in" data-k="opin:' + esc(pf.id) + '">'
      + renderPanel(c, pf, pi, total)
      + '</div></div>';

    return '<div class="orbit-stage' + (open ? ' is-open' : '') + '" data-k="orbit"'
      + ' data-orbit-open="' + (open ? '1' : '0') + '" data-orbit-focus="' + esc(f.id) + '"'
      /* The card's own data-step-kind tracks the LIVE step. Re-declaring it here
         on the focused phase means the dial, the core and the panel all take the
         colour of the phase being read, while the card head keeps the live one. */
      + ' data-step-kind="' + esc(f.kind) + '"'
      + ' style="--seg:' + seg.toFixed(4) + 'deg;--orbit-rot:' + rot.toFixed(3) + 'deg;--orbit-pct:' + pct + '">'
      /* .orbit-stage is the CONTAINER; .orbit-layout is the grid it sizes.
         They have to be two elements: an element is never its own container,
         so a @container rule that selects the container itself never matches.
         variants-a.css:24 documents the same trap for take 8's rail. */
      + '<div class="orbit-layout" data-k="orblayout">'
      + '<div class="orbit-dial" data-k="orbdial">'
      + '<i class="orbit-track" data-k="orbtrack"></i>'
      + '<i class="orbit-arc" data-k="orbarc"></i>'
      + '<div class="orbit-ring" data-k="ring">' + nodes + sats + '</div>'
      + core
      + '</div>'
      + panel
      + '</div></div>'
      /* The caption carries the phase LABEL as well as the prose. The core disc
         ellipsises a long label to stay inside its circle, so the full name has
         to be legible somewhere while collapsed. */
      + (open ? '' : '<div class="orbit-caption work-detail" data-k="cap:' + esc(f.id) + '">'
        + '<b class="orbit-caption-label">' + esc(f.label) + '</b> · ' + esc(f.detail) + '</div>')
      + (w.completed ? w.workReceipt() : '');
  });

  /* ---- panel body ---------------------------------------------------- */
  function renderPanel(c, f, fi, total) {
    var esc = c.esc, icon = c.icon, D = c.D, w = c.ctx;
    var state = c.state;
    var done = fi < w.index || w.completed;
    var live = fi === w.index && !w.completed;
    var chip = done ? ['ok', 'Completed'] : live ? [w.running ? 'run' : 'idle', w.running ? 'In progress' : 'Paused'] : ['idle', 'Pending'];

    var rows = (D.phaseRows[f.kind] && D.phaseRows[f.kind][f.id])
      || (f.evidence || []).slice(0, 3).map(function (t) { return { text: t }; });

    var rowHtml = rows.map(function (r, j) {
      var meta = r.add != null
        ? '<span class="wa-meta"><b class="wa-add">+' + r.add + '</b>' + (r.del != null ? ' <b class="wa-del">−' + r.del + '</b>' : '') + '</span>'
        : r.tag ? '<span class="wa-meta"><b class="wa-tag">' + esc(r.tag) + '</b></span>' : '';
      return '<span class="wa-row pm-materialize" data-k="orow:' + esc(f.id) + ':' + j + '" style="--pm-stagger:' + j + '">'
        + '<span class="wa-rowtext">' + esc(r.text) + '</span>' + meta + '</span>';
    }).join('');

    /* Child agents. Rendered for the delegation phase in the panel as well as
       on the ring, because the ring satellites are withdrawn on a narrow
       container (they would collide with the core) and the affordance must
       survive that. */
    var agentsHtml = '';
    if (f.kind === 'agents') {
      var list = agentsForRun(c);
      agentsHtml = '<div class="orbit-agents" data-k="oagents">'
        + '<div class="orbit-agents-head"><span>Child agents</span><span class="count">' + list.length + '</span></div>'
        + (list.length ? list.map(function (a) {
          return '<button type="button" class="orbit-agent" data-k="oa:' + esc(a.id) + '"'
            + ' data-action="open-agent" data-id="' + esc(a.id) + '"'
            + ' title="Open the ' + esc(a.name) + ' child agent thread">'
            + '<span class="orbit-agent-avatar">' + esc(initials(a.name)) + '</span>'
            + '<span class="orbit-agent-copy"><strong>' + esc(a.name) + '</strong>'
            + '<span>' + esc(a.current || a.blocker || '—') + '</span></span>'
            + '<span class="orbit-agent-state ' + tone(a.status) + '">' + esc(statusLabel(c, a.status)) + '</span>'
            + '</button>';
        }).join('') : '<p class="orbit-empty">No child agents ran in this thread.</p>')
        + '</div>';
    }

    /* Inspecting a phase deliberately does NOT scrub the run — the ring keeps
       turning and the core keeps reporting. When the inspected phase is not
       the live one, this offers the scrub explicitly, through app.js's own
       existing `inspect-work-step` action. */
    var jump = (fi !== w.index)
      ? '<button type="button" class="soft-button orbit-jump" data-k="ojump" data-action="inspect-work-step" data-value="' + fi + '">'
      + icon('step', 12) + ' Move the run to this step</button>'
      : '';

    return '<div class="orbit-panel-head">'
      + '<span class="orbit-step-no">Step ' + (fi + 1) + ' of ' + total + '</span>'
      + '<span class="orbit-chip ' + chip[0] + '">' + chip[1] + '</span>'
      + '<span class="wa-spacer"></span>'
      + '<button type="button" class="orbit-close" data-k="oclose" data-action="orbit-collapse"'
      + ' title="Collapse to the circle" aria-label="Collapse phase detail">' + icon('close', 12) + '</button>'
      + '</div>'
      + '<strong class="orbit-panel-title">' + esc(f.verb) + '</strong>'
      + '<p class="orbit-panel-detail">' + esc(f.detail) + '</p>'
      + '<div class="orbit-rows pm-rows">' + rowHtml + '</div>'
      + agentsHtml
      + jump;
  }

  /* ---- helpers ------------------------------------------------------- */
  function agentsForRun(c) {
    /* Strictly this thread's children. The first version fell back to
       `all.slice(0,4)` when a thread had none, which quietly attributed another
       thread's agents to this one — and it also made the honest empty state
       (`.orbit-empty`) unreachable, which the orphan gate caught. An empty
       delegation phase is a true statement about that thread; borrowed rows are
       not. */
    var all = (c.D && c.D.subagents) || [];
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
  EXT.action('orbit-open-phase', function (ctx, btn) {
    var i = Number(btn.dataset.value);
    sel = (sel === i) ? null : i;
    ctx.renderApp();
    return true;
  });
  EXT.action('orbit-toggle', function (ctx) {
    sel = (sel == null) ? ctx.state.work.step : null;
    ctx.renderApp();
    return true;
  });
  EXT.action('orbit-collapse', function (ctx) {
    sel = null;
    ctx.renderApp();
    return true;
  });
  /* Declining (returning false) lets app.js's own branch run afterwards — the
     documented override contract. These only clear the inspection so the
     lifecycle buttons never leave a stale phase open. */
  ['reset-working', 'start-working', 'complete-working'].forEach(function (a) {
    EXT.action(a, function () { sel = null; return false; });
  });

  /* Take 1 renders its own child agents (ring satellites + panel rows), so it
     must not also get app.js's shared inline list appended underneath.
     takeOwnsAgents() reads this flag off PM56_WORKING; a non-function value is
     safe because renderWorkingVariant only calls the entry when it IS a
     function, and the render slot above wins before that check anyway. */
  window.PM56_WORKING = window.PM56_WORKING || {};
  if (typeof window.PM56_WORKING[1] !== 'function') window.PM56_WORKING[1] = {};
  window.PM56_WORKING[1].ownsAgents = true;

  /* ---- shared trail: keep the live disc in view -----------------------
     orbit.css turns `.wa-track` from `overflow:hidden` (which silently
     amputated the trail — measured 143px of content in a 141px box at the
     DEFAULT 1440 layout) into a scroller. A scroller whose live item has
     scrolled out of view is only half a fix, so the current disc is nudged
     back into view after each render.
     scrollIntoView / scrollLeft mutate no attributes and add no nodes, so
     this cannot re-trigger its own observer. */
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
