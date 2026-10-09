/* =====================================================================
   pmx-system.js -- window.PM56_PMX, the runtime of the wand-module redesign
   (DESIGN-SPEC sections 4.5, 4.6 and 5). Owner: F0.

   Loaded right after composer-state (build.py MODULES), so its composerBelow
   dock renders after the quota strip and before every demo guide.

   What lives here, and why it cannot live in a template:
   - after-render hooks: PM56_EXT.slot('afterRender') when app.js calls it,
     otherwise a MutationObserver on #pmRoot / #pmOverlayRoot, batched per
     animation frame.
   - exit ghosts: pmPatch removes a closed sheet synchronously, so its exit
     plays on the detached node itself, stripped of every hook and re-appended
     to <body>. The close is never delayed.
   - the Start hand-off (one preview clone flies to the new card), overlay
     FLIP for sheet rows, origin capture, hover-to-light, mirrors, autofocus,
     ink, throttle, word streams into data-pm-keep islands, the dock host and
     card visibility.
   - the foundation actions pmx-scrim, pmx-step, pmx-advanced, pmx-dock-show.

   Engine rules kept here: nothing writes class or style on a patched node.
   Transient state lives on #pmOverlayRoot (classList, data-pmx-focus and
   --pmx-* custom properties only), on <body>-level clones, or in
   data-pm-keep islands. Every JS timing reads PM56_CLOCK; a Web Animation
   duration is never scaled by PM56_CLOCK.ms() (the film tool slows the whole
   timeline through CDP already).
   IMPACT follow-ups (2026-09-27): every duration, delay and ease is read from
   the pmx-system.css tokens (A2-22; retro's x0.6 is a token override, A1-13);
   reduced motion is the instant end state (A1-03); the ghost strip keeps an
   allow-list of classes (A2-17); PARTS and SURFACES are the one vocabulary and
   the one surface list, and the CSS rules keyed on them are generated here
   (6.6, A2-18); a warm primary answers Ctrl/Cmd+Enter only when focused, and
   focus returns to where it belongs after a sheet leaves (A1-36); word streams
   use PM56_STREAM's pacing (A1-47).
   ===================================================================== */
(function () {
  'use strict';
  if (window.PM56_PMX) return;
  var EXT = window.PM56_EXT;
  if (!EXT) return;
  var SHELL = window.PM56_SHELL || {};

  /* ---------------------------------------------------------------- basics */
  function clockNow() { var C = window.PM56_CLOCK; return C && C.now ? C.now() : performance.now(); }
  function realMs(ms) { var C = window.PM56_CLOCK; return C && C.ms ? C.ms(ms) : ms; }
  function ctx() { try { return EXT.ctx ? EXT.ctx() : null; } catch (e) { return null; } }
  var mqReduced = null;
  function reduced() {
    try { if (!mqReduced) mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) { }
    return !!((mqReduced && mqReduced.matches) || (document.body && document.body.classList.contains('pm56-reduced')));
  }
  function overlayRoot() { return document.getElementById('pmOverlayRoot'); }
  function appRoot() { return document.getElementById('pmRoot'); }
  function escHtml(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cssEsc(s) { return window.CSS && CSS.escape ? CSS.escape(String(s)) : String(s).replace(/["\\]/g, '\\$&'); }
  function hash(s) { return SHELL.pmxHash ? SHELL.pmxHash(s) : String(s).length.toString(36); }
  function warn(what, err) { try { console.error('PM56_PMX: ' + what, err); } catch (e) { } }

  /* ---------------------------------------------------------------- tokens (IMPACT A2-22)
     Every duration and ease pmx code uses is a pmx-system.css token, read here through getComputedStyle (cached per
     theme, because a theme block may override one: retro's x0.6, IMPACT A1-13). t('row') is --pmx-t-row in ms,
     wait('dock') is --pmx-wait-dock (a logic wait, never scaled), ease('out') is --pmx-ease-out. */
  var tokCache = { theme: null, v: Object.create(null) };
  function tokRaw(name) {
    var b = document.body; if (!b) return '';
    /* NieR Mode paints basic-* under html[data-o55-nier] with its own stepped eases (nier.css): part of the key */
    var th = (b.getAttribute('data-theme') || '') + (document.documentElement.hasAttribute('data-o55-nier') ? '+nier' : '');
    if (tokCache.theme !== th) { tokCache.theme = th; tokCache.v = Object.create(null); }
    if (!(name in tokCache.v)) { try { tokCache.v[name] = getComputedStyle(b).getPropertyValue(name).trim(); } catch (e) { return ''; } }
    return tokCache.v[name];
  }
  function msOf(v) { v = String(v || '').trim(); var n = parseFloat(v); if (!isFinite(n)) return 0; return /ms$/.test(v) ? n : /s$/.test(v) ? n * 1000 : n; }
  function t(name) { return msOf(tokRaw('--pmx-t-' + name)); }
  function wait(name) { return msOf(tokRaw('--pmx-wait-' + name)); }
  function ease(name) { return tokRaw('--pmx-ease-' + name) || 'linear'; }

  /* ---------------------------------------------------------------- the one vocabulary and the one surface list
     PARTS (6.6): every value a data-pmx-affects or data-pmx-part may carry; the hover-to-light rules below are
     generated from it and the runtime lights only these (pmx-verify lints any other value). SURFACES (IMPACT A2-18):
     the pmx transcript surfaces; app.js builds the pmx part of FOLLOW_HOSTS from it, pmx-verify imports it, and the
     7.14 Chat WOW coexistence rules are generated from it (each surface declares its own look as --pmx-own-* in
     pmx-system.css). */
  var PARTS = Object.freeze(['job', 'team', 'lead', 'assign', 'parallel', 'specialists', 'wonderer', 'grill', 'permission', 'auto', 'target', 'focus', 'count',
    'blind', 'rounds', 'research', 'questions', 'policy', 'moderator', 'mode', 'watch', 'catchup', 'quiet', 'stages', 'when', 'route', 'missed', 'reach',
    'voice', 'inherit', 'who', 'wind', 'days', 'you', 'meter', 'notes', 'rules']);
  var PART_SET = Object.create(null);
  PARTS.forEach(function (p) { PART_SET[p] = 1; });
  var SURFACES = Object.freeze(['pmx-run', 'pmx-receipt', 'pmx-note', 'pmx-files', 'pmx-bubble', 'pmx-divider']);
  var SURFACE_SELECTOR = SURFACES.map(function (c) { return '.' + c; }).join(', ');
  function generatedCss() {
    var out = ['/* generated by pmx-system.js from PM56_PMX.PARTS (6.6 hover-to-light) and PM56_PMX.SURFACES (7.14, IMPACT A2-18) */'];
    PARTS.forEach(function (p) {
      var f = '#pmOverlayRoot[data-pmx-focus~="' + p + '"] ', q = '[data-pmx-part~="' + p + '"]';
      out.push(f + '.pmx-plate ' + q + '{opacity:1;--pmx-line:var(--accent);--pmx-seat:var(--accent);--pmx-seat-fill:var(--pmx-seat-fill-accent);}');
      out.push(f + '.pmx-plate :is(path, circle, rect)' + q + '{stroke:var(--accent);}');
      out.push(['.pmx-p-lab', '.pmx-p-note', '.pmx-p-sub'].map(function (c) { return f + '.pmx-plate ' + q + ' ' + c; }).join(', ') + ', ' + f + '.pmx-plate text' + q + '{fill:var(--accent);color:var(--accent);}');
      out.push(f + '.pmx-readback ' + q + '{background-color:var(--pmx-wash);box-shadow:0 0 0 2px var(--pmx-wash);}');
    });
    var fam = '.transcript .transcript-inner > [data-family]';
    SURFACES.forEach(function (c) {
      out.push(fam + '.' + c + ', ' + fam + ' .' + c + '{display:var(--pmx-own-display,block);flex-direction:var(--pmx-own-dir,row);grid-template-columns:none;padding:var(--pmx-own-pad,0);' +
        'border:var(--pmx-own-edge,0);border-radius:var(--pmx-own-r,0);background:var(--pmx-own-bg,none);box-shadow:var(--pmx-own-shadow,none);-webkit-mask:none;mask:none;}');
    });
    /* a family wrapper whose job is to carry a surface is not a card; the needs family's halo never reaches one */
    out.push(fam + SURFACES.map(function (c) { return ':not(.' + c + ')'; }).join('') + ':has(' + SURFACES.map(function (c) { return '> .' + c; }).join(', ') + ')' +
      '{padding:0;border:0;border-radius:0;background:none;box-shadow:none;-webkit-mask:none;mask:none;}');
    out.push(SURFACES.map(function (c) { return '.transcript .transcript-inner > [data-family="needs"] .' + c; }).join(', ') + '{box-shadow:var(--pmx-own-shadow,none);}');
    /* G-35 (5.5) item 3: a pmx surface never plays the transcript's message entrance (styles.css message-arrive);
       a run card arrives only through M3, the others through their own entrance */
    out.push('.transcript-inner > .message:is(' + SURFACE_SELECTOR + '), .transcript-inner > .message:has(' + SURFACES.map(function (c) { return '> .' + c; }).join(', ') + '){animation:none;}');
    /* ...nor a Chat WOW family entrance (turn-stage.css `.transcript[data-variant="16"] .transcript-inner >
       [data-family="…"]` at (0,4,0), and the needs ring `[data-family="needs"].event-card` at (0,5,0)). Those reach
       roots that are not .message (article.sched-card.pmx-bubble slid in as a ticket; ledger receipts and notes took
       the 4 px ledger slide), so this rule is keyed on [data-family] at (0,5,0); injected after the stylesheet, it
       also wins the tie with the ring. */
    var famRoot = '.transcript[data-variant] .transcript-inner > [data-family]';
    out.push(famRoot + ':is(' + SURFACE_SELECTOR + '), ' + famRoot + ':has(> :is(' + SURFACE_SELECTOR + ')){animation:none;}');
    /* a surface's own root motion (pmx-system.css) comes back above that rule: the note's gutter slide and the M5
       breathe of a needs-you card (which the family rise had also been overriding) */
    out.push(famRoot + '.pmx-note{animation:pmx-slide-gutter var(--pmx-t-row) var(--pmx-ease-out) backwards;}');
    out.push(famRoot + '.pmx-run:is([data-tone="warm"], [data-density="attention"]:not([data-tone="accent"])){animation:pmx-breathe var(--pmx-t-breathe) var(--pmx-ease-breathe) 2;}');
    return out.join('\n');
  }
  (function injectGenerated() {
    try {
      var el = document.getElementById('pmx-generated');
      if (!el) { el = document.createElement('style'); el.id = 'pmx-generated'; el.setAttribute('data-pmx-generated', 'parts surfaces'); (document.head || document.documentElement).appendChild(el); }
      el.textContent = generatedCss();
    } catch (e) { warn('generated rules failed', e); }
  })();

  /* ---------------------------------------------------------------- timeline + film
     timeline.after(ms, fn) is the one timing helper for choreographed
     sequences: motion-time milliseconds on PM56_CLOCK. film.on() steps it by
     hand and seeks every document animation for frame-accurate QA. */
  var film = { active: false, now: 0, started: false, born: new Map(), queue: [] };
  var timeline = {
    after: function (ms, fn) {
      ms = Math.max(0, Number(ms) || 0);
      if (film.active) { var job = { due: film.now + ms, fn: fn }; film.queue.push(job); return { cancel: function () { job.fn = null; } }; }
      var id = setTimeout(function () { try { fn(); } catch (e) { warn('timeline job threw', e); } }, realMs(ms));
      return { cancel: function () { clearTimeout(id); } };
    },
    now: clockNow
  };
  function filmSync() {
    var list = document.getAnimations ? document.getAnimations() : [];
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (!film.born.has(a)) film.born.set(a, film.now - (film.started ? 0 : (a.currentTime || 0)));
      try { a.pause(); a.currentTime = Math.max(0, film.now - film.born.get(a)); } catch (e) { }
    }
  }
  var filmApi = {
    on: function () { film.active = true; film.now = 0; film.started = false; film.born = new Map(); filmSync(); film.started = true; return filmApi; },
    seek: function (t) {
      if (!film.active) filmApi.on();
      film.now = Math.max(film.now, Number(t) || 0);
      for (var guard = 0; guard < 500; guard++) {
        var due = null;
        for (var i = 0; i < film.queue.length; i++) if (film.queue[i].due <= film.now && (!due || film.queue[i].due < due.due)) due = film.queue[i];
        if (!due) break;
        film.queue.splice(film.queue.indexOf(due), 1);
        if (due.fn) { try { due.fn(); } catch (e) { warn('film job threw', e); } }
      }
      filmSync();
      return film.now;
    },
    sync: filmSync,
    off: function () {
      var jobs = film.queue.slice(); film.queue = []; film.active = false;
      jobs.forEach(function (j) { if (j.fn) timeline.after(Math.max(0, j.due - film.now), j.fn); });
      (document.getAnimations ? document.getAnimations() : []).forEach(function (a) { try { if (a.playState === 'paused') a.play(); } catch (e) { } });
      film.born = new Map();
    },
    get now() { return film.now; },
    get active() { return film.active; }
  };
  timeline.film = filmApi;

  /* ---------------------------------------------------------------- animate
     The only way pmx code starts WAAPI (PM56_MOTION.animate is this function too).
     IMPACT A1-03 (provisional pending owner decision E-25): under reduced motion
     it applies the end state at once and returns null, never a fade of any
     length. An animation that would hold its end (fill forwards or both) holds
     it from this frame through a zero-length animation, which is finished the
     moment it is created (a caller can still cancel it through getAnimations());
     any other one ends where the element's own CSS already is, so nothing is
     applied. Durations pass through untouched otherwise. */
  function lastFrame(keyframes) {
    if (Array.isArray(keyframes)) return keyframes.length ? keyframes[keyframes.length - 1] : null;
    if (!keyframes || typeof keyframes !== 'object') return null;
    var end = {};
    for (var prop in keyframes) { var v = keyframes[prop]; end[prop] = Array.isArray(v) ? v[v.length - 1] : v; }
    return end;
  }
  function animate(el, keyframes, opts) {
    if (!el || typeof el.animate !== 'function') return null;
    var o = {};
    if (typeof opts === 'number') o.duration = opts;
    else if (opts) for (var key in opts) if (key !== 'decorative') o[key] = opts[key];
    if (reduced()) {
      if (o.fill === 'forwards' || o.fill === 'both') {
        var last = lastFrame(keyframes), end = {};
        if (last) {
          for (var p in last) if (p !== 'offset' && p !== 'easing' && p !== 'composite') end[p] = last[p];
          try { el.animate([end, end], { duration: 0, fill: 'forwards' }); } catch (e) { }
        }
      }
      return null;
    }
    var a;
    try { a = el.animate(keyframes, o); } catch (e) { warn('animate failed', e); return null; }
    if (film.active) { film.born.set(a, film.now); try { a.pause(); a.currentTime = 0; } catch (e) { } }
    return a;
  }

  /* ---------------------------------------------------------------- after-render hooks */
  var afterFns = [], slotLive = false, depth = 0;
  function after(fn) {
    if (typeof fn !== 'function') return function () { };
    afterFns.push(fn);
    return function () { var i = afterFns.indexOf(fn); if (i >= 0) afterFns.splice(i, 1); };
  }
  /* phase: 'app' (end of renderApp), 'overlay' (after the overlay patch) or
     'scope' (app.js patchScope, the 500 ms work tick on a live card; info.scope is
     the patched node). A hook may render once more; deeper nesting is dropped. */
  var INTERNAL = { app: function (c) { internalApp(c); }, overlay: function (c) { internalOverlay(c); }, scope: function () { } };
  function dispatch(phase, c, info) {
    if (depth > 1) return;
    depth++;
    try {
      var cc = c || ctx();
      try { (INTERNAL[phase] || INTERNAL.app)(cc, info); } catch (e) { warn('internal ' + phase + ' hook threw', e); }
      for (var i = 0; i < afterFns.length; i++) { try { afterFns[i](cc, phase, info || { phase: phase }); } catch (e) { warn('after(' + phase + ') hook threw', e); } }
    } finally { depth--; }
  }
  /* app.js calls this slot as fn(ctx, info) at the end of renderApp() (phase
     'app'), after renderOverlays() (phase 'overlay', info.patched) and after
     patchScope() (phase 'scope'). From the first call on, the MutationObserver
     fallback below stands down. */
  EXT.slot('afterRender', function (c, info) {
    slotLive = true;
    var p = (info && info.phase) || (c && c.phase);
    dispatch(p === 'overlay' || p === 'scope' ? p : 'app', c, info);
    return '';
  });
  var pendingPhase = { app: false, overlay: false }, phaseRaf = 0;
  function schedulePhase(phase) {
    if (slotLive) return;
    pendingPhase[phase] = true;
    if (!phaseRaf) phaseRaf = requestAnimationFrame(function () {
      phaseRaf = 0;
      if (pendingPhase.app) { pendingPhase.app = false; dispatch('app'); }
      if (pendingPhase.overlay) { pendingPhase.overlay = false; dispatch('overlay'); }
    });
  }
  function insideKeep(node) {
    var el = node && (node.nodeType === 1 ? node : node.parentElement);
    return !!(el && el.closest && el.closest('[data-pm-keep]'));
  }

  /* ---------------------------------------------------------------- exit hints and ghosts (5.4) */
  var hint = null, lastExit = null;
  /* exitHint(kind, data): kind is cancel | save | start | swap; data.focus (an element, a selector or a function
     returning one) names where focus goes once the sheet has left (IMPACT A1-36; REVERT passes the files row) */
  function exitHint(kind, data) {
    kind = { cancel: 1, save: 1, start: 1, swap: 1 }[kind] ? kind : 'cancel';
    hint = { kind: kind, data: data || null, at: clockNow() };
  }
  function takeHint() {
    var h = hint; hint = null;
    if (!h || clockNow() - h.at > wait('hint')) return 'cancel';
    lastExit = h;
    return h.kind;
  }
  /* IMPACT A2-17: the ghost keeps only the classes its look needs -- pmx-*, the four button classes and the
     preserved trigger's shared-picker-* -- and drops every other class, so no harness selector, menu anchor or test
     class can match it, and adding a module never needs a foundation edit. */
  var KEEP_CLASS = /^(?:pmx-|shared-picker-)|^(?:primary-button|soft-button|text-button|icon-button)$/;
  /* data-* attributes the pmx look depends on (never a harness hook). */
  var KEEP_DATA = { 'data-layout': 1, 'data-state': 1, 'data-save': 1, 'data-reason': 1, 'data-size': 1, 'data-sil': 1, 'data-role': 1, 'data-mode': 1, 'data-on': 1, 'data-hatch': 1,
    'data-tone': 1, 'data-kind': 1, 'data-style': 1, 'data-aside': 1, 'data-advanced': 1, 'data-fluid': 1, 'data-placement': 1, 'data-status': 1, 'data-density': 1, 'data-sev': 1,
    'data-off': 1, 'data-count': 1, 'data-severity': 1, 'data-standin': 1, 'data-pmx-kind': 1, 'data-pmx-part': 1, 'data-pmx-preview': 1, 'data-pmx-fresh': 1 };
  var KEEP_ARIA = { 'aria-checked': 1, 'aria-pressed': 1, 'aria-selected': 1 };
  var DROP_ATTR = { id: 1, role: 1, tabindex: 1, name: 1, 'for': 1, href: 1, contenteditable: 1, autofocus: 1, title: 1 };
  /* Deep strip: after this nothing in the subtree matches a harness selector,
     a menu anchor, an action or a test class. pmx classes stay (the look). */
  function strip(root) {
    var all = [root];
    var list = root.querySelectorAll ? root.querySelectorAll('*') : [];
    for (var i = 0; i < list.length; i++) all.push(list[i]);
    for (var j = 0; j < all.length; j++) {
      var el = all[j];
      if (el.attributes) for (var a = el.attributes.length - 1; a >= 0; a--) {
        var n = el.attributes[a].name;
        if (DROP_ATTR[n] || (n.indexOf('data-') === 0 && !KEEP_DATA[n]) || (n.indexOf('aria-') === 0 && !KEEP_ARIA[n])) el.removeAttribute(n);
      }
      var cl = el.classList;
      if (cl && cl.length) {
        var drop = [];
        for (var c = 0; c < cl.length; c++) if (!KEEP_CLASS.test(cl[c])) drop.push(cl[c]);
        for (var d = 0; d < drop.length; d++) cl.remove(drop[d]);
      }
    }
    return root;
  }
  var rects = new WeakMap();
  function recordRects() {
    var root = overlayRoot(); if (!root) return;
    var kids = root.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (!el.classList.contains('pmx-sheet') && !el.classList.contains('pmx-scrim')) continue;
      var r = { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight };
      if (!r.width || !r.height) { var b = el.getBoundingClientRect(); r = { left: b.left, top: b.top, width: b.width, height: b.height }; }
      var prev = rects.get(el);
      rects.set(el, { rect: r, origin: prev ? prev.origin : null });
    }
  }
  function ghost(node, forcedKind) {
    var isSheet = node.classList.contains('pmx-sheet');
    var kind = forcedKind || (isSheet ? takeHint() : (hint && hint.kind === 'start' ? 'start' : 'cancel'));
    if (reduced()) return;
    var rec = rects.get(node);
    if (isSheet && !rec) return;
    try {
      strip(node);
      node.setAttribute('inert', '');
      node.setAttribute('aria-hidden', 'true');
      node.setAttribute('data-exit', kind);
      node.classList.add('pmx-ghost');
      if (isSheet) {
        var r = rec.rect, o = rec.origin;
        var ox = o ? Math.round(o.x - r.left) + 'px' : '50%', oy = o ? Math.round(o.y - r.top) + 'px' : '50%';
        node.style.setProperty('inset', 'auto');
        node.style.setProperty('position', 'fixed');
        node.style.setProperty('left', r.left + 'px');
        node.style.setProperty('top', r.top + 'px');
        node.style.setProperty('width', r.width + 'px');
        node.style.setProperty('height', r.height + 'px');
        node.style.setProperty('margin', '0');
        node.style.setProperty('max-height', 'none');
        node.style.setProperty('transform-origin', ox + ' ' + oy);
      }
      document.body.appendChild(node);
    } catch (e) { warn('ghost failed', e); try { node.remove(); } catch (e2) { } return; }
    var a = null, eIn = ease('in'), lin = ease('linear');
    if (!isSheet) a = animate(node, [{ opacity: 1 }, { opacity: 0 }], { duration: t('scrim-out'), easing: lin, fill: 'forwards' });
    else if (kind === 'save') a = animate(node, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: t('exit'), easing: eIn, fill: 'forwards' });
    else if (kind === 'swap') a = animate(node, [{ opacity: 1 }, { opacity: 0 }], { duration: t('swapdlg'), easing: lin, fill: 'forwards' });
    /* R-06: the start exit leaves as ONE object, surface and content together (the preview is hidden by CSS: its
       clone is the one in flight), so no hollow slab is ever on screen */
    else if (kind === 'start') a = animate(node, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.985)' }], { duration: t('exit-start'), easing: eIn, fill: 'forwards' });
    else a = animate(node, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.975)' }], { duration: t('exit'), easing: eIn, fill: 'forwards' });
    var gone = false;
    function drop() { if (gone) return; gone = true; if (node.parentNode) node.parentNode.removeChild(node); }
    if (a && a.finished) a.finished.then(drop, drop);
    else drop();
    timeline.after(t('ghost-max'), drop);
  }

  /* ---------------------------------------------------------------- sheet lifecycle */
  var currentSheet = null, settleJob = null, swapJob = null, lastPointerAt = -1e9, flipMem = new Map();
  var opener = null, lastPointerEl = null, lastFocusOutside = null;
  /* M2 (reference "motion fix found on the way"): the plate seats present when a sheet opened enter with M1;
     a seat created after the sheet settled walks on from the wing, once */
  var seatSeen = new WeakSet();
  /* IMPACT A1-36 (canon UCC-156 "return to initiating focus"): once a sheet has left, focus goes to the composer's
     message box after a committed Start, to the wand trigger after a save, and to the control that opened the sheet
     after Cancel, x, Escape or the scrim (the wand trigger when that control is gone). A lane may name its own
     target through exitHint(kind, {focus}). Focus never lands on <body>. */
  function focusable(el) {
    if (!el || !el.isConnected || el.disabled || el.closest('[inert], .pmx-ghost, .pmx-flight')) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function wandTrigger() { return document.querySelector('.composer [data-menu-anchor="wand"], [data-action="open-menu"][data-menu="wand"]'); }
  function composerBox() { return document.querySelector('textarea[data-input="composer"]'); }
  function resolveTarget(v) {
    try { if (typeof v === 'function') v = v(); } catch (e) { v = null; }
    if (typeof v === 'string') { try { v = document.querySelector(v); } catch (e) { v = null; } }
    return v && v.nodeType === 1 ? v : null;
  }
  function returnFocus(exit, from) {
    requestAnimationFrame(function () {
      if (document.querySelector('#pmOverlayRoot > .pmx-sheet')) return;
      var a = document.activeElement;
      if (a && a !== document.body && a.isConnected && !a.closest('.pmx-ghost')) return;
      var kind = exit ? exit.kind : 'cancel', data = exit && exit.data;
      var list = [data && data.focus != null ? resolveTarget(data.focus) : null];
      if (kind === 'start') list.push(composerBox());
      else if (kind === 'save') list.push(wandTrigger());
      else list.push(from);
      list.push(wandTrigger(), composerBox());
      for (var i = 0; i < list.length; i++) if (focusable(list[i])) { try { list[i].focus({ preventScroll: true }); } catch (e) { } if (document.activeElement === list[i]) return; }
    });
  }
  function readFrom(root) {
    var cs = root.style;
    var x = parseFloat(cs.getPropertyValue('--pmx-from-x')), y = parseFloat(cs.getPropertyValue('--pmx-from-y'));
    return isFinite(x) && isFinite(y) ? { x: x, y: y } : null;
  }
  function sheetOpened(node, swap) {
    var root = overlayRoot();
    currentSheet = node;
    if (clockNow() - lastPointerAt > wait('origin')) { root.style.removeProperty('--pmx-from-x'); root.style.removeProperty('--pmx-from-y'); }
    /* IMPACT A1-36: remember what opened the sheet (the control the reader pressed, else what had focus) */
    if (!swap) opener = (clockNow() - lastPointerAt <= wait('origin') && lastPointerEl && !lastPointerEl.closest('.pmx-sheet')) ? lastPointerEl : (lastFocusOutside || null);
    var from = readFrom(root);
    rects.set(node, { rect: { left: node.offsetLeft, top: node.offsetTop, width: node.offsetWidth, height: node.offsetHeight }, origin: from });
    if (swap) {
      root.classList.add('pmx-swapping');
      if (swapJob) swapJob.cancel();
      swapJob = timeline.after(t('swap-hold'), function () { root.classList.remove('pmx-swapping'); });
    }
    root.classList.remove('pmx-sheet-settled');
    if (settleJob) settleJob.cancel();
    settleJob = timeline.after(t('settle'), function () { if (currentSheet === node && node.isConnected) { root.classList.add('pmx-sheet-settled'); fitSheet(node); } });
    /* The overlay patch that inserted this sheet has already fitted it and recorded its seats (internalOverlay runs in
       the same task, before this observer callback), so this second pass waits until the first frame is painted
       (closing review, M1 film: a 44 ms first-frame gap on the Mac). A first layout can also use fallback font
       metrics, so the pass is worth keeping, just not ahead of the first frame. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { if (currentSheet === node && node.isConnected) { fitSheet(node); markSeats(node, false); } });
    });
    if (document.fonts && document.fonts.status !== 'loaded' && document.fonts.ready) document.fonts.ready.then(function () { if (currentSheet === node) fitSheet(node); });
    /* focus the hero once, caret at the end; a sheet with no autofocus field focuses its first control (closing, BSD:
       focus used to stay on <body>) */
    var f = node.querySelector('[data-pmx-autofocus]');
    if (!f || !focusable(f)) { var list = tabStops(node); f = list.filter(function (x) { return !x.classList.contains('pmx-close'); })[0] || list[0] || null; }
    if (f && !node.contains(document.activeElement)) {
      /* a programmatic focus is not the reader pointing at the job: no light */
      quietFocus = true;
      try { f.focus({ preventScroll: true }); var L = (f.value || '').length; if (f.setSelectionRange) f.setSelectionRange(L, L); } catch (e) { } finally { quietFocus = false; }
    }
  }
  function sheetClosed() {
    var root = overlayRoot();
    currentSheet = null;
    var from = opener; opener = null;
    var exit = lastExit; lastExit = null;
    returnFocus(exit, from);
    if (settleJob) { settleJob.cancel(); settleJob = null; }
    if (root) { root.classList.remove('pmx-sheet-settled'); root.removeAttribute('data-pmx-focus'); }
  }
  function onOverlayMutations(records) {
    var root = overlayRoot(); if (!root) return;
    var removed = [], addedSheet = null, other = false;
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      if (r.target === root) {
        for (var a = 0; a < r.removedNodes.length; a++) { var n = r.removedNodes[a]; if (n.nodeType === 1 && (n.classList.contains('pmx-sheet') || n.classList.contains('pmx-scrim'))) removed.push(n); }
        for (var b = 0; b < r.addedNodes.length; b++) { var m = r.addedNodes[b]; if (m.nodeType === 1 && m.classList.contains('pmx-sheet')) addedSheet = m; }
      }
      if (!insideKeep(r.target)) other = true;
    }
    var gone = removed.filter(function (n) { return !n.isConnected; });
    var swap = !!(addedSheet && addedSheet !== currentSheet && gone.some(function (n) { return n.classList.contains('pmx-sheet'); }));
    for (var g = 0; g < gone.length; g++) ghost(gone[g], swap && gone[g].classList.contains('pmx-sheet') ? 'swap' : null);
    if (addedSheet && addedSheet !== currentSheet && addedSheet.isConnected) sheetOpened(addedSheet, swap);
    /* the ghost re-appends the removed sheet to <body>, so "gone" means no longer inside #pmOverlayRoot */
    if (currentSheet && !root.contains(currentSheet)) {
      var live = root.querySelector(':scope > .pmx-sheet');
      if (live) sheetOpened(live, false); else sheetClosed();
    }
    if (other) schedulePhase('overlay');
  }

  /* ---------------------------------------------------------------- overlay FLIP (G-03)
     Sheet rows carrying data-pmx-flip slide to their new place after an overlay
     patch (the app's data-flip-move runs before the overlay patch and never on
     overlay-only renders). Layout values, so running transforms never skew it. */
  /* Position against the sheet by summing offsets along the offsetParent chain:
     layout values only (transforms never count), and the same answer whichever
     ancestor happens to be the offsetParent (a layout-contained .pmx-body is one). */
  function layoutPos(el, stop) {
    var x = 0, y = 0, n = el, guard = 0;
    while (n && n !== stop && guard++ < 40) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x, y: y };
  }
  function overlayFlip() {
    var root = overlayRoot(); if (!root) return;
    var sheet = root.querySelector(':scope > .pmx-sheet'); if (!sheet) { flipMem = new Map(); return; }
    var nodes = sheet.querySelectorAll('[data-pmx-flip][data-k]');
    var next = new Map(), still = !reduced();
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i], k = el.getAttribute('data-k');
      var lp = layoutPos(el, sheet);
      var p = { x: lp.x, y: lp.y, el: el };
      var prev = flipMem.get(k);
      if (still && prev && prev.el === el) {
        var dx = prev.x - p.x, dy = prev.y - p.y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) animate(el, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: t('flip'), easing: ease('move') });
      }
      next.set(k, p);
    }
    flipMem = next;
  }
  /* ---------------------------------------------------------------- J-2 plate yield and roster overflow
     A sheet's plate slot (.pmx-plate-fit, built by PM56_SHELL.pmxPlateFit) holds every mode it may show,
     richest first, each with its natural height in data-fit-h. After every overlay render the richest mode
     whose natural height fits the slot is marked (data-fit) and remembered per slot key, so the next template
     carries it (PM56_PMX.plateFit(key)) and a patch never flips it back. The slot's height comes from the
     column (flex basis 0), never from the drawing, so the choice is stable. A roster whose rows no longer fit
     scrolls inside its own region with the 14 px fade (6.3): the runtime marks it and unmarks only what it
     marked itself (a builder's own scroll flag stays). Nothing here animates. */
  var plateFitMem = {};
  /* one pass over the plate slots; true when a slot changed its mode */
  /* lean (closing): {slotKey: n} steps a slot n modes leaner than the richest that fits (fitSheet's yield loop);
     quiet: set the mode without the settled-sheet fade (fitSheet plays it once, for the mode it ends on) */
  function fitPlates(sheet, lean, quiet) {
    var changed = false, slots = sheet.querySelectorAll('.pmx-plate-fit');
    for (var i = 0; i < slots.length; i++) {
      var slot = slots[i], kids = slot.children, h = slot.clientHeight, w = slot.clientWidth, pick = null;
      if (!kids.length) continue;
      /* before the sheet settles, its entrance's rise inflates the column's scrollHeight and puts a scrollbar beside the
         slot for a moment; the slot's width is read without it, so the first mode is the one the settled sheet keeps */
      var scol = slot.closest('.pmx-col'), sroot = overlayRoot();
      if (scol && !(sroot && sroot.classList.contains('pmx-sheet-settled'))) {
        var ccs = getComputedStyle(scol);
        w += Math.max(0, scol.offsetWidth - scol.clientWidth - (parseFloat(ccs.borderLeftWidth) || 0) - (parseFloat(ccs.borderRightWidth) || 0));
      }
      /* a slot in a scrolling one-column body is not height-bound: only the width decides */
      if (getComputedStyle(slot).getPropertyValue('--pmx-fit-free').trim() === '1') h = Infinity;
      /* a mode fits when its drawing fits at scale 1: its natural height in the slot's height and its viewBox
         width in the slot's width (a drawing is never scaled down, review cycle 1); a caption always fits */
      /* 1 % of width is layout rounding, not a scale (Basic's 1.26fr main column is 575.4 px for a 576 drawing) */
      var fitsW = function (kid) { var svg = kid.querySelector(':scope > .pmx-plate-svg'), fw = svg && svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal.width : 0; return !fw || fw <= w * 1.01 + 0.5; };
      /* the slot's floor (2026-10-09, Jared: "it pushes the graph out of view"): the leanest drawing that fits the slot's
         width. The slot claims that height (--pmx-fit-min), so a roster's growing rows scroll in their own region before
         the drawing would give way, and the caption is left only for a slot no drawing fits the width of (past the
         limit). */
      var floorKid = null, floorH = Infinity;
      for (var f = 0; f < kids.length; f++) {
        var ffh = parseFloat(kids[f].getAttribute('data-fit-h'));
        if (kids[f].getAttribute('data-mode') !== 'caption' && isFinite(ffh) && ffh < floorH && fitsW(kids[f])) { floorKid = kids[f]; floorH = ffh; }
      }
      /* data-floor names the floor's mode for the verifiers (pmx-verify's no-scroll: a roster may scroll once its slot
         shows the floor) */
      var fm = floorKid ? floorKid.getAttribute('data-mode') || '' : '';
      if (fm) { if (slot.getAttribute('data-floor') !== fm) slot.setAttribute('data-floor', fm); } else if (slot.hasAttribute('data-floor')) slot.removeAttribute('data-floor');
      if (floorKid && h !== Infinity) {
        var want = Math.ceil(floorH) + 'px';
        if (slot.style.getPropertyValue('--pmx-fit-min') !== want) { slot.style.setProperty('--pmx-fit-min', want); h = slot.clientHeight; }
      }
      for (var j = 0; j < kids.length; j++) {
        var fh = parseFloat(kids[j].getAttribute('data-fit-h'));
        if (isFinite(fh) && fh <= h + 0.5 && fitsW(kids[j])) { pick = kids[j]; break; }
      }
      /* nothing fits at scale 1: the caption mode if the slot has one (a lane passes pmxPlateFit({caption})),
         else the leanest mode (the one case left where a drawing is scaled; a lane avoids it with a caption) */
      if (!pick && floorKid) pick = floorKid;
      if (!pick) { for (var c = 0; c < kids.length; c++) if (kids[c].getAttribute('data-mode') === 'caption') pick = kids[c]; }
      if (!pick) pick = kids[kids.length - 1];
      var lk = slot.getAttribute('data-k') || String(i);
      /* a yield step never lands on a mode too wide for the slot (a mode after the caption, pmxPlateFit tail): the
         drawing would be scaled down; the slot keeps the leanest step that fits */
      /* a yield step never lands past the floor: while a drawing fits the width, the steps run over the drawings that fit
         the slot (width and height) and stop at the leanest of them, never at the caption */
      if (lean && lean[lk]) {
        var at0 = Array.prototype.indexOf.call(kids, pick);
        if (floorKid) {
          var steps = lean[lk];
          for (var st = at0 + 1; st < kids.length && steps > 0; st++) {
            var sk = kids[st], sh = parseFloat(sk.getAttribute('data-fit-h'));
            if (sk.getAttribute('data-mode') !== 'caption' && fitsW(sk) && isFinite(sh) && sh <= h + 0.5) { pick = sk; steps--; }
          }
        } else { var to = Math.min(kids.length - 1, at0 + lean[lk]); while (to > at0 && !fitsW(kids[to]) && kids[to].getAttribute('data-mode') !== 'caption') to--; pick = kids[to]; }
      }
      /* data-pick: the one drawing shown, where a slot holds two of one mode (the cast's wrap at 576 and at 500) */
      for (var dp = 0; dp < kids.length; dp++) { if (kids[dp] === pick) { if (!pick.hasAttribute('data-pick')) pick.setAttribute('data-pick', ''); } else if (kids[dp].hasAttribute('data-pick')) kids[dp].removeAttribute('data-pick'); }
      var mode = pick.getAttribute('data-mode') || '', key = slot.getAttribute('data-k'), was = slot.getAttribute('data-fit');
      if (key) plateFitMem[key] = mode;
      if (was !== mode) {
        changed = true;
        slot.setAttribute('data-fit', mode);
        /* a later yield (rows added or removed on a settled sheet) fades the new drawing in over 180 ms; the drawing's
           own M1 entrance (CSS animations that start when it stops being display:none) is finished at once, so
           the plate never draws itself on a second time */
        var root = overlayRoot();
        if (!quiet && was && root && root.classList.contains('pmx-sheet-settled')) {
          var runs = pick.getAnimations ? pick.getAnimations({ subtree: true }) : [];
          for (var q = 0; q < runs.length; q++) { try { if (runs[q].effect && runs[q].effect.getTiming().iterations !== Infinity) runs[q].finish(); } catch (e) { } }
          if (!reduced()) animate(pick, [{ opacity: 0 }, { opacity: 1 }], { duration: t('row'), easing: ease('out') });
        }
      }
    }
    return changed;
  }
  /* columns and roster rows that still overflow scroll with the 14 px fade; the fade's own padding changes the
     layout, so marks are measured without it */
  function markOverflow(sheet) {
    /* 6.3 yield order (review cycle 1; lead ruling on spec conflict G: J-2's 60 px rows stay): the plate has
       already yielded to its floor (flex: the slot's floor is the height of its leanest drawing that fits its width,
       fitPlates) before a roster's
       rows can overflow; then the roster's column helpers drop (lean 1), then the rows' secondary fine lines
       (lean 2); only then do the rows scroll with the 14 px fade. Measured from the natural state every time. */
    var rows = sheet.querySelectorAll('.pmx-roster-rows');
    for (var r = 0; r < rows.length; r++) {
      var el = rows[r], mine = el.getAttribute('data-pmx-autoscroll') === '1', roster = el.closest('.pmx-roster');
      if (el.getAttribute('data-scroll') === '1' && !mine) continue;
      if (mine) { el.removeAttribute('data-scroll'); el.removeAttribute('data-pmx-autoscroll'); }
      if (roster && roster.hasAttribute('data-pmx-lean')) roster.removeAttribute('data-pmx-lean');
      if (!rowsOver(el)) continue;
      if (roster) {
        roster.setAttribute('data-pmx-lean', '1');
        if (rowsOver(el)) roster.setAttribute('data-pmx-lean', '2');
      }
      if (rowsOver(el)) { el.setAttribute('data-scroll', '1'); el.setAttribute('data-pmx-autoscroll', '1'); }
    }
    /* the Advanced page (A14, R-19, review cycle 2) has the same measured yield: the grid lives under the hero inside
       the fixed sheet and must not scroll in the common case (6.3.1), so its row helpers drop (lean 1), then each
       sentence keeps one line (lean 2); only then does it scroll, with the 14 px bottom fade. The runtime unmarks
       only what it marked. */
    var grids = sheet.querySelectorAll('.pmx-advgrid');
    for (var gi = 0; gi < grids.length; gi++) {
      var grid = grids[gi], gmine = grid.getAttribute('data-pmx-autoscroll') === '1';
      if (grid.hasAttribute('data-pmx-lean')) grid.removeAttribute('data-pmx-lean');
      if (gmine) { grid.removeAttribute('data-pmx-overflow'); grid.removeAttribute('data-pmx-autoscroll'); }
      if (!gridOver(grid)) continue;
      grid.setAttribute('data-pmx-lean', '1');
      if (gridOver(grid)) grid.setAttribute('data-pmx-lean', '2');
      if (gridOver(grid)) { grid.setAttribute('data-pmx-overflow', '1'); grid.setAttribute('data-pmx-autoscroll', '1'); }
    }
    /* then the columns (their overflow depends on what the rosters kept) */
    var rootEl = overlayRoot(), settledNow = !!(rootEl && rootEl.classList.contains('pmx-sheet-settled'));
    var cols = sheet.querySelectorAll('.pmx-col');
    for (var c = 0; c < cols.length; c++) {
      var col = cols[c], on = col.getAttribute('data-pmx-overflow') === '1';
      if (on) col.removeAttribute('data-pmx-overflow');
      /* a shrunk question's own overflow shows only in scrollHeight, which an entrance's rise inflates: it counts
         once the sheet has settled (the reference: measured after the sheet settles) */
      var over = rowsOver(col) || (settledNow && col.scrollHeight > col.clientHeight + 1);
      if (over && /auto|scroll/.test(getComputedStyle(col).overflowY)) col.setAttribute('data-pmx-overflow', '1');
    }
  }
  /* overflow from layout values only: an entrance's rise (a transform) adds to scrollHeight for its 180 ms, which
     used to mark a roster that fits as scrolling for the whole life of the sheet */
  function rowsOver(el) {
    var first = el.firstElementChild, last = el.lastElementChild;
    if (!first) return false;
    var cs = getComputedStyle(el);
    var inner = el.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
    var mt = parseFloat(getComputedStyle(first).marginTop) || 0, mb = parseFloat(getComputedStyle(last).marginBottom) || 0;
    return (last.offsetTop + last.offsetHeight + mb) - (first.offsetTop - mt) > inner + 1;
  }
  /* a grid's rows overflow its box (layout values: the lowest row's bottom against the content box; a grid of two
     columns ends with its tallest last row). A grid that flows with a scrolling one-column body is never bound. */
  function gridOver(el) {
    var kids = el.children, top = Infinity, bottom = -Infinity;
    if (!kids.length || !/auto|scroll|hidden/.test(getComputedStyle(el).overflowY)) return false;
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i], cs = getComputedStyle(c);
      if (cs.display === 'none') continue;
      top = Math.min(top, c.offsetTop - (parseFloat(cs.marginTop) || 0));
      bottom = Math.max(bottom, c.offsetTop + c.offsetHeight + (parseFloat(cs.marginBottom) || 0));
    }
    if (!isFinite(top)) return false;
    var gs = getComputedStyle(el);
    var inner = el.clientHeight - (parseFloat(gs.paddingTop) || 0) - (parseFloat(gs.paddingBottom) || 0);
    return bottom - top > inner + 1;
  }
  /* plates first, then the overflow marks, then the plates again when a mark moved the slot (at most twice) */
  /* closing (6.3 yield order; COLLAB FR 6/7): the plate yields before a roster's rows scroll. The richest mode that
     fits the slot's flex height can still leave the rows overflowing (the slot and the rows share the column), so
     while rows scroll and a plate can still go leaner, the plate steps down a mode and the marks are measured again.
     The fade for a mode change on a settled sheet plays once, for the mode the loop ends on. */
  function fitSheet(sheet) {
    if (!sheet || !sheet.isConnected) return;
    var slots = sheet.querySelectorAll('.pmx-plate-fit'), before = [];
    for (var i = 0; i < slots.length; i++) before.push(slots[i].getAttribute('data-fit'));
    var lean = {};
    fitPlates(sheet, lean, true); markOverflow(sheet);
    if (fitPlates(sheet, lean, true)) markOverflow(sheet);
    for (var step = 0; step < 4 && sheet.querySelector('.pmx-roster-rows[data-pmx-autoscroll="1"]'); step++) {
      var moved = false;
      for (var s = 0; s < slots.length; s++) {
        var sl = slots[s], k2 = sl.getAttribute('data-k') || String(s), cur = sl.querySelector(':scope > [data-mode="' + cssEsc(sl.getAttribute('data-fit') || '') + '"]');
        if (cur && cur.nextElementSibling) { lean[k2] = (lean[k2] || 0) + 1; moved = true; }
      }
      if (!moved) break;
      fitPlates(sheet, lean, true); markOverflow(sheet);
    }
    var root = overlayRoot();
    if (root && root.classList.contains('pmx-sheet-settled') && !reduced()) {
      for (var j = 0; j < slots.length; j++) {
        var now = slots[j].getAttribute('data-fit');
        if (before[j] && now !== before[j]) {
          var pk = slots[j].querySelector(':scope > [data-mode="' + cssEsc(now || '') + '"]'); if (!pk) continue;
          var runs = pk.getAnimations ? pk.getAnimations({ subtree: true }) : [];
          for (var q = 0; q < runs.length; q++) { try { if (runs[q].effect && runs[q].effect.getTiming().iterations !== Infinity) runs[q].finish(); } catch (e) { } }
          animate(pk, [{ opacity: 0 }, { opacity: 1 }], { duration: t('row'), easing: ease('out') });
        }
      }
    }
  }
  /* every seat is recorded once; after the sheet settled a new, visible seat walks on from 70 px to its right
     (t('walk') after t('at-walk'), the emphasised ease, fill backwards so its own CSS holds the end state) */
  function markSeats(sheet, walk) {
    var seats = sheet.querySelectorAll('.pmx-plate .pmx-p-seat');
    for (var i = 0; i < seats.length; i++) {
      var s = seats[i];
      if (seatSeen.has(s)) continue;
      seatSeen.add(s);
      if (!walk || !s.getClientRects().length) continue;
      animate(s, [{ opacity: 0, transform: 'translate(calc(var(--x) + 70px), var(--y))' }, { opacity: 1, transform: 'translate(var(--x), var(--y))' }],
        { duration: t('walk'), delay: t('at-walk'), easing: ease('emph'), fill: 'backwards' });
    }
  }
  function internalOverlay() {
    recordRects(); overlayFlip();
    var root = overlayRoot(), sheet = root && root.querySelector(':scope > .pmx-sheet');
    if (sheet) { fitSheet(sheet); markSeats(sheet, sheet === currentSheet && root.classList.contains('pmx-sheet-settled')); }
  }

  /* ---------------------------------------------------------------- origin capture
     The clicked wand row (or button) becomes the sheet's transform-origin,
     read before any closeMenu() because this listens in the capture phase. */
  function onPointerDown(e) {
    var t = e.target && e.target.closest ? e.target.closest('.menu-item, button, [data-action], [role="button"]') : null;
    if (!t || t.closest('.pmx-sheet')) return;
    var root = overlayRoot(); if (!root) return;
    var r = t.getBoundingClientRect();
    if (!r.width && !r.height) return;
    root.style.setProperty('--pmx-from-x', Math.round(r.left + r.width / 2) + 'px');
    root.style.setProperty('--pmx-from-y', Math.round(r.top + r.height / 2) + 'px');
    lastPointerAt = clockNow();
    lastPointerEl = t;
  }
  /* a keyboard activation (Enter or Space on a wand row) fires a click with no pointerdown before it: the row it
     activated is the origin too, so a sheet opened from the keyboard also grows from its row (review cycle 1).
     This is the one writer of --pmx-from-x/y; app.js's click-time copy can go (F0b). */
  function onClickCapture(e) { if (e.detail === 0) onPointerDown(e); }

  /* ---------------------------------------------------------------- hover-to-light (6.6) */
  var lightJob = null;
  var warnedParts = Object.create(null);
  /* only PARTS light anything (an unknown value logs once with console.info; pmx-verify lints it) */
  function partsOf(v) {
    return String(v || '').split(/\s+/).filter(function (p) {
      if (!p) return false;
      if (PART_SET[p]) return true;
      if (!warnedParts[p]) { warnedParts[p] = 1; try { console.info('PM56_PMX: "' + p + '" is not in PM56_PMX.PARTS'); } catch (e) { } }
      return false;
    }).join(' ');
  }
  function affectsOf(el) {
    var a = el && el.closest ? el.closest('[data-pmx-affects]') : null;
    if (!a || !a.closest('#pmOverlayRoot > .pmx-sheet')) return '';
    return partsOf(a.getAttribute('data-pmx-affects'));
  }
  /* closing (COLLAB FR 8): only the parts the sheet actually draws in its visible mode light; a hover whose parts
     are all absent (a plate mode that dropped them, a sheet with no read-back phrase for it) dims nothing, where it
     used to dim every part to 35 % and light none */
  function shownEl(el) {
    for (var p = el; p && p.nodeType === 1; p = p.parentElement) { if (p.classList && (p.classList.contains('pmx-plate') || p.classList.contains('pmx-readback'))) break; }
    var host = p && p.nodeType === 1 ? p : el;
    if (!host.getClientRects().length) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  }
  function drawnParts(v) {
    var sheet = currentSheet && currentSheet.isConnected ? currentSheet : document.querySelector('#pmOverlayRoot > .pmx-sheet');
    if (!sheet) return '';
    return String(v || '').split(' ').filter(function (p) {
      if (!p) return false;
      var els = sheet.querySelectorAll('.pmx-plate [data-pmx-part~="' + p + '"], .pmx-readback [data-pmx-part~="' + p + '"]');
      for (var i = 0; i < els.length; i++) if (shownEl(els[i])) return true;
      return false;
    }).join(' ');
  }
  function setLight(v) {
    var root = overlayRoot(); if (!root) return;
    if (lightJob) { lightJob.cancel(); lightJob = null; }
    v = drawnParts(v);
    if (v) { if (root.getAttribute('data-pmx-focus') !== v) root.setAttribute('data-pmx-focus', v); }
    else if (root.hasAttribute('data-pmx-focus')) root.removeAttribute('data-pmx-focus');
  }
  function clearLightSoon() {
    if (lightJob) lightJob.cancel();
    lightJob = timeline.after(wait('light'), function () { lightJob = null; var root = overlayRoot(); if (root) root.removeAttribute('data-pmx-focus'); });
  }
  var quietFocus = false;
  /* R-17: focus lights only from the keyboard. A focus the app moves itself (closeMenu handing focus back to a dropdown's
     trigger after a pick) is not :focus-visible and lights nothing (closing, BSD observation) */
  function onOver(e) {
    if (quietFocus) return;
    if (e.type === 'focusin') { try { if (e.target && e.target.matches && !e.target.matches(':focus-visible')) return; } catch (err) { } }
    var v = affectsOf(e.target); if (v) setLight(v);
  }
  function onOut(e) { if (!affectsOf(e.target)) return; if (!affectsOf(e.relatedTarget)) clearLightSoon(); }

  /* ---------------------------------------------------------------- mirrors
     A document input listener copies [data-pmx-source=K] values into
     [data-pmx-mirror=K] text nodes (data-pmx-derive="title" shortens to a card
     title). The field itself is never repainted per keystroke. */
  function deriveTitle(v) {
    var s = String(v || '').replace(/\s+/g, ' ').trim();
    s = s.split(/[.,;:!?](?:\s|$)/)[0] || s;   /* the first clause */
    var words = s.split(' '), out = '';
    for (var i = 0; i < words.length; i++) { var next = out ? out + ' ' + words[i] : words[i]; if (next.length > 40 || i >= 6) break; out = next; }
    out = out.replace(/[,.;:!?\-]+$/, '');
    return out ? out.charAt(0).toUpperCase() + out.slice(1) : '';
  }
  function onInput(e) {
    var t = e.target;
    var k = t && t.getAttribute ? t.getAttribute('data-pmx-source') : null;
    if (!k) return;
    var v = t.value;
    var mirrors = document.querySelectorAll('[data-pmx-mirror="' + cssEsc(k) + '"]');
    for (var i = 0; i < mirrors.length; i++) {
      var m = mirrors[i];
      var text = m.getAttribute('data-pmx-derive') === 'title' ? deriveTitle(v) : v;
      if (!text) text = m.getAttribute('data-pmx-empty') || '';
      if (m.textContent !== text) m.textContent = text;
    }
  }

  /* ---------------------------------------------------------------- keyboard (G-11)
     closing (REVERT FR 12, BSD): while a sheet is open and no dropdown is, Tab and Shift+Tab cycle through the sheet's
     own controls (they used to leave for <body> and the header chips behind the scrim); a pmxSwitch is one tab stop
     (its chosen word, or the first while unset) and the arrow keys move its choice, as a radio group does. */
  var TABBABLE = 'button, input:not([type="hidden"]), textarea, select, a[href], summary, [tabindex]';
  function tabStops(sheet) {
    var out = [], seenSwitch = new Set();
    var all = sheet.querySelectorAll(TABBABLE);
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.disabled || el.getAttribute('tabindex') === '-1' || el.closest('[inert], [aria-hidden="true"], .pmx-sr, [data-pmx-preview]')) continue;
      var sw = el.closest('.pmx-switch');
      if (sw && el.classList.contains('pmx-switch-opt')) {
        if (seenSwitch.has(sw)) continue;
        var chosen = sw.querySelector('.pmx-switch-opt[aria-checked="true"]') || sw.querySelector('.pmx-switch-opt');
        seenSwitch.add(sw); el = chosen || el;
      }
      if (!focusable(el) && !(el.matches('input[type="checkbox"]') && el.parentElement && focusable(el.parentElement))) continue;
      out.push(el);
    }
    return out;
  }
  function switchKey(e) {
    var opt = e.target && e.target.closest ? e.target.closest('.pmx-switch-opt') : null;
    if (!opt) return false;
    var dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return false;
    var sw = opt.closest('.pmx-switch'), opts = [].slice.call(sw.querySelectorAll('.pmx-switch-opt')).filter(function (x) { return !x.disabled; });
    var i = opts.indexOf(opt), next = opts[(i + dir + opts.length) % opts.length];
    if (!next || next === opt) return true;
    e.preventDefault();
    var val = next.getAttribute('data-value'), key = sw.getAttribute('data-k');
    next.click();
    requestAnimationFrame(function () {
      var host = (key && document.querySelector('#pmOverlayRoot .pmx-switch[data-k="' + cssEsc(key) + '"]')) || (sw.isConnected ? sw : null);
      var el = host && host.querySelector('.pmx-switch-opt[data-value="' + cssEsc(val) + '"]');
      if (el) { quietFocus = true; try { el.focus({ preventScroll: true }); } catch (err) { } finally { quietFocus = false; } }
    });
    return true;
  }
  function trapTab(e) {
    var sheet = document.querySelector('#pmOverlayRoot > .pmx-sheet'); if (!sheet) return;
    if (document.querySelector('#pmOverlayRoot > .overlay-menu')) return;
    var stops = tabStops(sheet); if (!stops.length) return;
    var a = document.activeElement, i = stops.indexOf(a);
    if (i < 0 && a && a.closest && a.closest('.pmx-switch') && sheet.contains(a)) i = stops.indexOf(a.closest('.pmx-switch').querySelector('.pmx-switch-opt[aria-checked="true"]') || a);
    var next = i < 0 ? (e.shiftKey ? stops[stops.length - 1] : stops[0]) : stops[(i + (e.shiftKey ? -1 : 1) + stops.length) % stops.length];
    e.preventDefault();
    try { next.focus(); } catch (err) { }
  }
  function onKeyDown(e) {
    if (e.defaultPrevented) return;
    if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) { trapTab(e); return; }
    if (/^Arrow/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey && switchKey(e)) return;
    if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey) || e.altKey || e.defaultPrevented) return;
    var sheet = document.querySelector('#pmOverlayRoot > .pmx-sheet'); if (!sheet) return;
    if (!sheet.contains(e.target) && e.target !== document.body) return;
    if (document.querySelector('#pmOverlayRoot > .overlay-menu')) return;
    var ps = sheet.querySelectorAll('.pmx-primary'), p = null;
    for (var i = 0; i < ps.length; i++) if (!ps[i].disabled) p = ps[i];
    if (!p) return;
    /* IMPACT A1-36: a warm (destructive) primary, such as "Revert 3 files", answers Ctrl/Cmd+Enter only when that
       button itself has focus, so a file change is never confirmed without the reader reaching the button */
    if (p.getAttribute('data-tone') === 'warm' && document.activeElement !== p) return;
    e.preventDefault(); e.stopPropagation();
    p.click();
  }

  /* ---------------------------------------------------------------- ink (M2, G-05)
     Word-level LCS against the last text for a key; changed words are wrapped
     whole (never split) in <mark class="pmx-ink">. The first call returns plain
     text; for 1,840 ms after a change the same marked html comes back for the
     same text, so repeated renders stay byte-identical. */
  function inkMs() { return t('ink-in') + t('ink-hold') + t('ink-dry'); }
  var inkMem = new Map();
  function inkWords(s) { return String(s).split(/(\s+)/).filter(function (x) { return x !== ''; }); }
  function diffMark(key, oldText, newText) {
    var a = inkWords(oldText).filter(function (w) { return !/^\s+$/.test(w); });
    var toks = inkWords(newText);
    var b = toks.filter(function (w) { return !/^\s+$/.test(w); });
    var n = a.length, m = b.length, i, j;
    var L = [];
    for (i = 0; i <= n; i++) { L.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var keep = new Array(m).fill(false);
    i = 0; j = 0;
    while (i < n && j < m) { if (a[i] === b[j]) { keep[j] = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
    var out = '', w = 0;
    for (var t = 0; t < toks.length; t++) {
      var tok = toks[t];
      if (/^\s+$/.test(tok)) { out += escHtml(tok); continue; }
      out += keep[w] ? escHtml(tok) : '<mark class="pmx-ink" data-k="ink:' + escHtml(key) + ':' + w + ':' + hash(tok) + '">' + escHtml(tok) + '</mark>';
      w++;
    }
    return out;
  }
  function ink(key, text) {
    key = String(key); text = text == null ? '' : String(text);
    var mem = inkMem.get(key), now = clockNow();
    if (!mem) { inkMem.set(key, { text: text, html: escHtml(text), at: -1e12 }); return escHtml(text); }
    if (mem.text === text) return now - mem.at < inkMs() ? mem.html : escHtml(text);
    mem.html = diffMark(key, mem.text, text); mem.text = text; mem.at = now;
    return mem.html;
  }

  /* ---------------------------------------------------------------- throttle (M4) */
  var thr = new Map();
  function throttle(key, value, ms) {
    ms = ms == null ? wait('verb') : ms;
    key = String(key);
    var now = clockNow(), rec = thr.get(key), v = value == null ? '' : value;
    if (!rec) { thr.set(key, { value: v, seq: 0, at: now, pending: undefined }); return { value: v, seq: 0 }; }
    if (String(v) === String(rec.value)) { rec.pending = undefined; return { value: rec.value, seq: rec.seq }; }
    if (now - rec.at >= ms) { rec.value = v; rec.seq++; rec.at = now; rec.pending = undefined; return { value: rec.value, seq: rec.seq }; }
    if (rec.pending === undefined) {
      var due = ms - (now - rec.at) + wait('slack');
      timeline.after(due, function () { if (thr.get(key) === rec && rec.pending !== undefined) requestRender(); });
    }
    rec.pending = v;
    return { value: rec.value, seq: rec.seq };
  }

  /* ---------------------------------------------------------------- stream (M4, IMPACT A1-47: one pacer)
     Words land in a data-pm-keep island (the same island with the same or an
     extended text keeps streaming; a new text restarts it; into the island's
     <q> when there is one), in DOM batches of --pmx-wait-batch, on PM56_CLOCK.
     Pacing is Chat WOW's: PM56_STREAM (turn-stream.js) paces reply words into
     its own transcript islands, but it cannot feed a data-pm-keep island inside
     a card (begin() owns a message record, its flow node and its caret), so the
     pmx stream reads its pacing instead: PM56_STREAM.pacing.interval(op, backlog)
     when turn-stream exports it, else the same constants read as tokens
     (--pmx-pace-*: 30 words a second, faster when words wait, a breath at clause
     and sentence ends). Text that is handed over at once is "arrived", so it is
     paced by the backlog rule; a feeder that appends words (provider deltas, the
     recorded demo clock) streams at the steady rate. o.msPerWord forces a fixed
     rate; o.cap words stream, then the rest lands at once. */
  var streams = new WeakMap(), liveStreams = new Set(), streamJob = null;
  function paceMs(word, backlog) {
    var S = window.PM56_STREAM, P = S && S.pacing;
    if (P && typeof P.interval === 'function') { try { var v = Number(P.interval({ t: 'w', text: word }, backlog)); if (isFinite(v) && v >= 0) return v; } catch (e) { } }
    var iv = msOf(tokRaw('--pmx-pace-base')) / (1 + backlog / (parseFloat(tokRaw('--pmx-pace-backlog')) || 1));
    if (/[.!?:]$/.test(word)) iv += Math.max(msOf(tokRaw('--pmx-pace-sentence-min')), msOf(tokRaw('--pmx-pace-sentence')) - backlog * msOf(tokRaw('--pmx-pace-sentence-step')));
    else if (/[,;]$/.test(word)) iv += Math.max(msOf(tokRaw('--pmx-pace-clause-min')), msOf(tokRaw('--pmx-pace-clause')) - backlog * msOf(tokRaw('--pmx-pace-clause-step')));
    return Math.max(msOf(tokRaw('--pmx-pace-floor')), iv);
  }
  function streamWrite(st) {
    var s = st.words.slice(0, st.shown).join(' ');
    if (st.target.textContent !== s) st.target.textContent = s;
  }
  function streamStep() {
    streamJob = null;
    var now = clockNow();
    liveStreams.forEach(function (st) {
      if (!st.island.isConnected) { liveStreams.delete(st); return; }
      var changed = false;
      while (st.shown < st.words.length && now >= st.nextAt) {
        if (st.shown >= st.cap) { st.shown = st.words.length; changed = true; break; }
        var w = st.words[st.shown++]; changed = true;
        st.nextAt += st.ms > 0 ? st.ms : paceMs(w, st.words.length - st.shown);
      }
      if (changed) streamWrite(st);
      if (st.shown >= st.words.length) liveStreams.delete(st);
    });
    if (liveStreams.size && !streamJob) streamJob = timeline.after(wait('batch'), streamStep);
  }
  function stream(island, text, o) {
    if (!island) return null;
    o = o || {};
    text = String(text == null ? '' : text);
    var st = streams.get(island);
    var target = island.querySelector ? (island.querySelector('q') || island) : island;
    if (!st || st.text !== text && text.indexOf(st.text) !== 0) {
      st = { island: island, target: target, text: text, words: [], shown: 0, nextAt: o.startAt != null ? Number(o.startAt) : clockNow(), ms: Number(o.msPerWord) || 0, cap: o.cap || 120 };
      streams.set(island, st);
    }
    st.target = target;
    st.text = text;
    st.words = text.split(/\s+/).filter(Boolean);
    if (reduced()) { st.shown = st.words.length; streamWrite(st); return st; }
    liveStreams.add(st);
    if (!streamJob) streamJob = timeline.after(0, streamStep);
    return st;
  }

  /* ---------------------------------------------------------------- visibility and the dock (C14/C15, G-10) */
  var vis = new Map(), io = null, ioRoot = null, observed = new WeakSet(), ignoreUntil = 0, recheckJob = null, lastDockH = -1, lastDockHtml = null, dockJob = null;
  var providers = [];
  function transcriptEl() { return document.querySelector('.assistant-pane .transcript, .transcript'); }
  function cardEl(runId) {
    var tr = transcriptEl(); if (!tr || runId == null) return null;
    return tr.querySelector('.pmx-run[data-run-id="' + cssEsc(runId) + '"]:not([data-pmx-preview])');
  }
  function ensureIO() {
    var tr = transcriptEl();
    if (!tr || typeof IntersectionObserver !== 'function') return null;
    if (io && ioRoot === tr) return io;
    if (io) io.disconnect();
    observed = new WeakSet(); ioRoot = tr;
    io = new IntersectionObserver(onIO, { root: tr, threshold: [0, 0.6, 0.98, 1] });
    return io;
  }
  function onIO() {
    var now = clockNow();
    if (now < ignoreUntil) {
      if (!recheckJob) recheckJob = timeline.after(ignoreUntil - now + wait('slack'), function () { recheckJob = null; recheck(); });
      return;
    }
    recheck();
  }
  /* Visibility is measured from rects (the observer only says when to look):
     a card counts as visible while >= 60 % of its head row is inside the
     transcript viewport; "fully visible" means the whole card is. */
  function measureAll() {
    var tr = transcriptEl(); if (!tr) return false;
    var tb = tr.getBoundingClientRect(), now = clockNow(), changed = false, seen = {};
    var cards = tr.querySelectorAll('.pmx-run[data-run-id]:not([data-pmx-preview])');
    var obs = ensureIO();
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i], id = card.getAttribute('data-run-id');
      seen[id] = 1;
      var head = card.querySelector(':scope > .pmx-run-head') || card;
      if (obs && !observed.has(card)) { observed.add(card); obs.observe(card); if (head !== card) obs.observe(head); }
      var hb = head.getBoundingClientRect(), cb = card.getBoundingClientRect();
      var hv = hb.height > 0 ? Math.max(0, Math.min(hb.bottom, tb.bottom) - Math.max(hb.top, tb.top)) / hb.height : 0;
      var headIn = hv >= 0.6 && cb.width > 0;
      var full = cb.height > 0 && cb.top >= tb.top - 1 && cb.bottom <= tb.bottom + 1;
      var v = vis.get(id);
      if (!v) { vis.set(id, { head: headIn, full: full, hiddenAt: headIn ? -1e12 : now }); changed = true; continue; }
      if (v.head !== headIn) { v.head = headIn; if (!headIn) v.hiddenAt = now; changed = true; }
      if (v.full !== full) { v.full = full; changed = true; }
    }
    vis.forEach(function (_, id) { if (!seen[id]) { vis.delete(id); changed = true; } });
    return changed;
  }
  /* A run with no measurement yet counts as visible, so a brand-new card never
     flashes a dock line on the render that creates it. */
  function visible(runId) {
    var v = vis.get(String(runId));
    if (!v) return true;
    if (v.head) return true;
    return clockNow() - v.hiddenAt < wait('dock');
  }
  function fullyVisible(runId) { var v = vis.get(String(runId)); return v ? v.full : true; }
  var TONE_RANK = { needs: 0, yourmove: 1, live: 2, comingup: 3 };
  function dockId(it) { return String(it.runId != null ? it.runId : (it.key != null ? it.key : '')); }
  function collectDock(c) {
    var all = [];
    for (var i = 0; i < providers.length; i++) {
      try { var r = providers[i](c); if (Array.isArray(r)) all = all.concat(r); } catch (e) { warn('dock provider threw', e); }
    }
    var shown = all.filter(function (it) {
      if (!it || !it.html) return false;
      if (it.runId == null) return true;
      if (it.tone === 'needs') return !fullyVisible(it.runId);
      return !visible(it.runId);
    });
    shown.forEach(function (it, idx) { it.__i = idx; });
    shown.sort(function (a, b) {
      var ra = typeof a.priority === 'number' ? a.priority : (TONE_RANK[a.tone] != null ? TONE_RANK[a.tone] : 2);
      var rb = typeof b.priority === 'number' ? b.priority : (TONE_RANK[b.tone] != null ? TONE_RANK[b.tone] : 2);
      /* closing review: equal rank and equal (or missing) `at` fall back to the run id / key, never to the order the
         providers happened to answer in, so the same chat shows its dock lines in the same order in every theme */
      return ra - rb || (b.at || 0) - (a.at || 0) || dockId(a).localeCompare(dockId(b)) || a.__i - b.__i;
    });
    return shown;
  }
  function dockHtml(c) {
    var shown = collectDock(c);
    if (!shown.length) return '';
    var more = shown.length > 3 ? 'and ' + (shown.length - 3) + ' more · Activity' : '';
    return SHELL.pmxDock ? SHELL.pmxDock(shown.slice(0, 3).map(function (it) { return it.html; }).join(''), more) : '';
  }
  EXT.slot('composerBelow', function (c) {
    if (!providers.length) { lastDockHtml = ''; return ''; }
    var html = dockHtml(c);
    lastDockHtml = html;
    return html;
  });
  function dockCheck() {
    if (!providers.length) return;
    var c = ctx(); if (!c) return;
    var html = dockHtml(c);
    if (lastDockHtml !== null && html !== lastDockHtml) requestRender();
    /* a card that just left view shows its dock line after 400 ms */
    var soonest = Infinity, now = clockNow();
    var hold = wait('dock');
    vis.forEach(function (v) { if (!v.head) { var left = hold - (now - v.hiddenAt); if (left > 0 && left < soonest) soonest = left; } });
    if (soonest < Infinity) {
      if (dockJob) dockJob.cancel();
      dockJob = timeline.after(soonest + wait('slack'), function () { dockJob = null; dockCheck(); });
    }
  }
  function recheck() { measureAll(); dockCheck(); }
  /* Never re-render from inside a render's after-hook: coalesce to one frame. */
  var renderRaf = 0;
  function requestRender() {
    if (renderRaf) return;
    renderRaf = requestAnimationFrame(function () { renderRaf = 0; var c = ctx(); if (c && c.renderApp) c.renderApp(); });
  }
  function dockHeightWatch() {
    var d = document.querySelector('.composer > .pmx-dock');
    var h = d ? d.offsetHeight : 0;
    if (h !== lastDockH) { if (lastDockH !== -1) ignoreUntil = clockNow() + wait('dock'); lastDockH = h; }
  }
  function reveal(runId) {
    var card = cardEl(runId); if (!card) return false;
    try { card.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' }); } catch (e) { card.scrollIntoView(); }
    /* one perimeter pulse in the precomputed --pmx-accent-pulse (IMPACT A1-15: no colour maths) */
    var pulse = tokRaw('--pmx-accent-pulse') || 'currentColor';
    var base = getComputedStyle(card).boxShadow;
    var ring = function (w, c) { return '0 0 0 ' + w + 'px ' + c; };
    var withBase = function (s) { return base && base !== 'none' ? base + ', ' + s : s; };
    animate(card, [{ boxShadow: withBase(ring(0, 'transparent')) }, { boxShadow: withBase(ring(3, pulse)), offset: 0.3 }, { boxShadow: withBase(ring(1, 'transparent')) }], { duration: t('pulse'), easing: ease('out'), decorative: true });
    return true;
  }

  /* ---------------------------------------------------------------- the Start hand-off (M3, G-01) */
  var flight = null, landQueue = [];
  function flightCancel() {
    if (flight && flight.clone && flight.clone.parentNode) flight.clone.parentNode.removeChild(flight.clone);
    if (flight && flight.expire) flight.expire.cancel();
    flight = null;
  }
  function streamBusy() {
    var S = window.PM56_STREAM;
    try { if (S && S.active && S.active().length) return true; } catch (e) { }
    return !!document.querySelector('.transcript [data-flight]');
  }
  var handoff = {
    /* Called by COLLAB from attachCardToThread(), while the sheet (and its
       .pmx-preview-card) is still in #pmOverlayRoot. Clones the preview in place
       and records whether the reader was at the bottom. */
    arm: function (o) {
      o = o || {};
      flightCancel();
      exitHint('start');
      var src = o.sourceEl || document.querySelector('#pmOverlayRoot > .pmx-sheet [data-pmx-flight-source]');
      var tr = transcriptEl();
      var atBottom = o.atBottom != null ? !!o.atBottom : !!(tr && tr.scrollHeight - tr.scrollTop - tr.clientHeight < 24);
      /* a hidden preview (R-20: below a 960 px window) has no box to fly from: the card fades in instead */
      if (!src || reduced() || !src.getClientRects().length) { flight = { none: true, atBottom: atBottom }; return flight; }
      /* layoutWidth (closing, MEMTEACH): lay the clone out at the destination width for the flight only */
      var r = src.getBoundingClientRect(), w = Number(o.layoutWidth) > 0 ? Number(o.layoutWidth) : (src.offsetWidth || 391);
      var clone = strip(src.cloneNode(true));
      clone.classList.add('pmx-flight');
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('inert', '');
      var s = r.width / w;
      clone.style.setProperty('width', w + 'px');
      clone.style.setProperty('transform', 'translate(' + r.left + 'px,' + r.top + 'px) scale(' + s + ')');
      document.body.appendChild(clone);
      flight = { clone: clone, rect: r, w: w, scale: s, atBottom: atBottom, at: clockNow() };
      flight.expire = timeline.after(wait('flight'), function () { if (flight && flight.clone === clone) flightCancel(); });
      return flight;
    },
    /* Queued to the next after('app') (the render that creates the card).
       opts.done() is COLLAB's "clear UI.arriving[runId] and renderApp()". */
    land: function (runId, opts) { landQueue.push({ runId: String(runId), opts: opts || {} }); if (!slotLive) schedulePhase('app'); },
    cancel: function () { flightCancel(); if (hint && hint.kind === 'start') hint = null; },
    get armed() { return !!(flight && !flight.none); }
  };
  function finishLanding(job) {
    var d = job.opts && job.opts.done;
    if (typeof d === 'function') { try { d(job.runId); } catch (e) { warn('handoff done() threw', e); } }
    try { document.dispatchEvent(new CustomEvent('pmx:landed', { detail: { runId: job.runId } })); } catch (e) { }
  }
  function fadeRowsBelow(card) {
    if (!card) return;
    var rows = [];
    var body = card.querySelector(':scope > .pmx-run-body'), foot = card.querySelector(':scope > .pmx-run-foot');
    if (body) for (var i = 0; i < body.children.length; i++) if (body.children[i].offsetTop - card.offsetTop >= 108 || body.children[i].getBoundingClientRect().top - card.getBoundingClientRect().top >= 108) rows.push(body.children[i]);
    if (foot) rows.push(foot);
    rows.forEach(function (el) { animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: t('face'), delay: t('land-at'), easing: ease('linear'), fill: 'backwards' }); });
  }
  function processLanding(job) {
    var card = cardEl(job.runId);
    var f = flight; flight = null;
    if (f && f.expire) f.expire.cancel();
    if (!card) { if (f && f.clone) f.clone.remove(); finishLanding(job); return; }
    if (!f || f.none || !f.clone || reduced()) {
      if (f && f.clone) f.clone.remove();
      finishLanding(job);
      var c2 = cardEl(job.runId) || card;
      animate(c2, [{ opacity: 0 }, { opacity: 1 }], { duration: t('face'), easing: ease('linear') });
      return;
    }
    var tr = card.closest('.transcript'), inner = tr && tr.querySelector('.transcript-inner');
    /* the chat makes room, only for a reader who was already at the bottom */
    var dy = 0;
    if (f.atBottom && tr) {
      var before = tr.scrollTop;
      try { tr.scrollTo({ top: tr.scrollHeight, behavior: 'instant' }); } catch (e) { tr.scrollTop = tr.scrollHeight; }
      dy = tr.scrollTop - before;
    }
    /* Closing FR 12 (design review M3): measure the card where it will rest, BEFORE the make-room glide starts.
       The glide's first frame holds .transcript-inner at translateY(+dy), so a rect read after it included +dy and
       the clone landed ~190 px below the card, over the composer. */
    var cr = card.getBoundingClientRect(), tb = tr ? tr.getBoundingClientRect() : cr;
    if (dy > 1 && inner && !streamBusy()) animate(inner, [{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: t('room'), easing: ease('emph') });
    var inView = cr.bottom > tb.top && cr.top < tb.bottom;
    var clone = f.clone, w = f.w, s0 = f.scale, x0 = f.rect.left, y0 = f.rect.top;
    if (Math.abs(cr.width - w) > 4) {
      /* lay the clone out at the card's own width so it lands on the card's
         own geometry (same builder, same container tiers) */
      clone.style.setProperty('width', cr.width + 'px');
      s0 = f.rect.width / cr.width; w = cr.width;
      clone.style.setProperty('transform', 'translate(' + x0 + 'px,' + y0 + 'px) scale(' + s0 + ')');
    }
    var x1, y1, s1, fadeOut = false;
    if (inView) { x1 = cr.left; y1 = cr.top; s1 = cr.width / w; }
    else {
      var dock = document.querySelector('.composer > .pmx-dock') || document.querySelector('.composer');
      var dr = dock ? dock.getBoundingClientRect() : { left: x0, top: y0, width: f.rect.width };
      x1 = dr.left; y1 = dr.top; s1 = Math.min(1, dr.width / w); fadeOut = true;
    }
    timeline.after(t('land-at'), function () {
      var kf = [{ transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(' + s0 + ')', opacity: 1 }];
      if (fadeOut) kf.push({ transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + ((y0 + y1) / 2) + 'px) scale(' + ((s0 + s1) / 2) + ')', opacity: 1, offset: 0.6 });
      kf.push({ transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(' + s1 + ')', opacity: fadeOut ? 0 : 1 });
      animate(clone, kf, { duration: t('flight'), easing: ease('emph'), fill: 'forwards' });
      var landed = false;
      function land() {
        if (landed) return; landed = true;
        finishLanding(job);
        if (clone.parentNode) clone.parentNode.removeChild(clone);
        fadeRowsBelow(cardEl(job.runId));
      }
      /* R-07: the landing is a timer (a flight's finished promise never resolves while film mode seeks it): at
         land-at + flight, in one task, clear arriving, render and remove the clone */
      timeline.after(t('flight'), land);
      timeline.after(t('land-max'), land);
    });
  }
  function internalApp() {
    dockHeightWatch();
    if (measureAll()) dockCheck();
    if (landQueue.length) { var q = landQueue; landQueue = []; q.forEach(processLanding); }
  }

  /* ---------------------------------------------------------------- pick (IMPACT A2-30: one picker call contract)
     pick(button, {title, current, options:[{value, label, description, group?, icon?, disabled?, reason?}], onChange})
     opens the preserved choice dropdown through PM56_PICKERS.openChoice (its look, sprout, height spring and ghost
     collapse are untouched, DON'T 12). description is the option's distinct line (C.5); a disabled option stays
     listed with its reason printed on that line and cannot be picked; group and icon travel with the option for
     the renderer. Each option list comes from one catalog per enum (A3-01), never a per-surface copy. The model and
     Persona pickers keep PM56_PICKERS.openModel / openPersona (their catalogs are the app's). */
  function pick(button, o) {
    var P = window.PM56_PICKERS; o = o || {};
    if (!P || typeof P.openChoice !== 'function' || !button) return false;
    var opts = (o.options || []).map(function (x) {
      var d = x.description || '';
      if (x.disabled) d = (d ? d + ' · ' : '') + (x.reason || 'Not available right now.');
      return { value: x.value, label: x.label, description: d, group: x.group, icon: x.icon, disabled: !!x.disabled, reason: x.reason };
    });
    P.openChoice(button, o.title || '', o.current, opts, function (v) {
      for (var i = 0; i < opts.length; i++) if (String(opts[i].value) === String(v) && opts[i].disabled) return;
      if (typeof o.onChange === 'function') o.onChange(v);
    });
    return true;
  }

  /* ---------------------------------------------------------------- viewOpen (G-13) */
  var viewResolvers = [];
  function viewOpen(runId) {
    var c = ctx(); if (!c || !c.state) return false;
    var st = c.state, active = st.activeEditor;
    if (!st.editorRevealed || !active || runId == null) return false;
    var id = String(runId);
    for (var i = 0; i < viewResolvers.length; i++) { try { var r = viewResolvers[i](id, active); if (r === true || r === false) return r; } catch (e) { } }
    return active === 'collab-run:' + id || active === 'room:' + id || String(active).split(':').slice(1).join(':') === id;
  }

  /* ---------------------------------------------------------------- sound (G-35) */
  var soundAt = {};
  function sound(ev) {
    if (ev !== 'needs' && ev !== 'complete') return false;
    var S = window.PM56_SOUND; if (!S || typeof S.play !== 'function') return false;
    var now = clockNow(); if (soundAt[ev] && now - soundAt[ev] < wait('sound')) return false;
    soundAt[ev] = now;
    try { return S.play(ev); } catch (e) { return false; }
  }

  /* ---------------------------------------------------------------- foundation actions (4.6) */
  EXT.action('pmx-scrim', function (c) {
    /* A click outside never cancels a sheet while a dropdown is open: close the
       menu only (with its preserved ghost collapse). Otherwise click the sheet's
       own close button, so the app's whole click path (close-dialog, every
       chain, the button's closeAttrs) runs exactly as for the x. */
    if (c && c.state && c.state.menu) { c.closeMenu(); return true; }
    var sheet = document.querySelector('#pmOverlayRoot > .pmx-sheet');
    var x = sheet && sheet.querySelector('.pmx-close');
    if (x) x.click();
    return true;
  });
  EXT.action('pmx-step', function (c, btn) {
    var box = btn && btn.closest('.pmx-stepper');
    var input = box && box.querySelector('.pmx-step-input');
    if (!input) return true;
    var min = input.min !== '' ? Number(input.min) : -Infinity, max = input.max !== '' ? Number(input.max) : Infinity;
    var cur = Number(input.value); if (!isFinite(cur)) cur = isFinite(min) ? min : 0;
    var next = Math.max(min, Math.min(max, cur + (Number(btn.getAttribute('data-delta')) || 0)));
    if (next === cur) return true;
    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  });
  EXT.action('pmx-advanced', function (c, btn) {
    if (!c || !c.state || !c.state.dialog) return true;
    c.state.dialog.pmxAdvanced = btn && btn.getAttribute('data-value') === '1';
    c.renderOverlays();
    return true;
  });
  EXT.action('pmx-dock-show', function (c, btn) {
    reveal(btn && btn.getAttribute('data-run'));
    return true;
  });
  EXT.chainAction('reset-all', function () {
    inkMem.clear(); thr.clear(); vis.clear(); landQueue = []; flightCancel(); hint = null; liveStreams.clear();
    var root = overlayRoot();
    if (root) { root.classList.remove('pmx-sheet-settled', 'pmx-swapping'); root.removeAttribute('data-pmx-focus'); }
    return false;
  });

  /* ---------------------------------------------------------------- boot */
  var booted = false;
  function boot() {
    if (booted) return;
    var root = overlayRoot(), app = appRoot();
    if (!root || !app) { requestAnimationFrame(boot); return; }
    booted = true;
    new MutationObserver(onOverlayMutations).observe(root, { childList: true, subtree: true });
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) if (!insideKeep(records[i].target)) { schedulePhase('app'); return; }
    }).observe(app, { childList: true, subtree: true });
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('click', onClickCapture, true);
    document.addEventListener('pointerover', onOver, true);
    document.addEventListener('pointerout', onOut, true);
    document.addEventListener('focusin', onOver, true);
    document.addEventListener('focusin', function (e) { var el = e.target; if (el && el.closest && !el.closest('.pmx-sheet, .pmx-ghost, .overlay-menu')) lastFocusOutside = el; }, true);
    document.addEventListener('focusout', onOut, true);
    document.addEventListener('input', onInput, false);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('resize', function () { schedulePhase('overlay'); schedulePhase('app'); });
    /* a face that arrives after the first layout (retro's IBM Plex Mono is fetched when a retro sheet first
       asks for it) changes every measure: fit the open sheet again */
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () { var s = currentSheet; if (s && s.isConnected) fitSheet(s); });
    var live = root.querySelector(':scope > .pmx-sheet');
    if (live) sheetOpened(live, false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.PM56_PMX = {
    version: 1,
    after: after,
    reduced: reduced,
    animate: animate,
    timeline: timeline,
    film: filmApi,
    exitHint: exitHint,
    handoff: handoff,
    ink: ink,
    hash: hash,
    throttle: throttle,
    stream: stream,
    dock: { provide: function (fn) { if (typeof fn === 'function') providers.push(fn); return function () { var i = providers.indexOf(fn); if (i >= 0) providers.splice(i, 1); }; } },
    visible: visible,
    fullyVisible: fullyVisible,
    reveal: reveal,
    viewOpen: viewOpen,
    registerView: function (fn) { if (typeof fn === 'function') viewResolvers.push(fn); },
    sound: sound,
    strip: strip,
    /* The one list of pmx transcript surfaces (IMPACT A2-18): the 7.14 rules are generated from it, app.js builds
       the pmx part of FOLLOW_HOSTS from it (SURFACE_SELECTOR is the same list as a selector), pmx-verify imports
       it. pmx-bubble is the class SCHED puts on its scheduled-message article. */
    SURFACES: SURFACES,
    SURFACE_SELECTOR: SURFACE_SELECTOR,
    /* The one hover-to-light vocabulary (6.6): the generated CSS rules and the runtime both read it. */
    PARTS: PARTS,
    /* token readers (IMPACT A2-22): modules read durations and eases through these, never a literal */
    t: t, wait: wait, ease: ease,
    pick: pick,
    /* J-2 plate yield: the mode a plate slot showed last time, for its next template (pmxPlateFit reads it) */
    plateFit: function (key) { return plateFitMem[key] || ''; },
    fitSheet: fitSheet,
    get sheet() { return currentSheet; },
    _debug: function () { return { slotLive: slotLive, vis: Array.from(vis.entries()), providers: providers.length, flight: !!flight, landQueue: landQueue.length, hint: hint, opener: opener }; }
  };
  /* One reduced-motion policy: PM56_MOTION.animate is PM56_PMX.animate. */
  if (window.PM56_MOTION) { try { window.PM56_MOTION.animate = animate; } catch (e) { } }
})();
