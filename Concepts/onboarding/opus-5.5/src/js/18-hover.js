/* PMH: the merged hover engine for PMConcept7 (2026-10-09; Jared's items 10 and 11). It replaces the PM8 magnet and
   spotlight (pm6-js-globals, turned off by build.py's 'pmh: pm8 engine off' patch) for every hoverable card, row,
   tile and icon, the new Usage cards included. The look lives in src/css/22-hover.css; this file only measures and
   writes state, so a design is shipped by editing CSS tokens and rules, not this file.

   Targets (the outermost match of SEL; a target inside another target resolves to the outer box)
     the PM8 set, every .pm-sheen, the Usage .pmu-card (not the band, nor while it is pending, leaving, lifted,
     resized, settling after a drop, morphing or flying), and any element with [data-pmh] (an opt-in for future
     panels; its value names the kind: card | row | tile | icon, empty = card; data-pmh="off" takes an element out of
     the set). Tabs, text surfaces (inputs, editors, terminals) and resize dividers are never targets, and a pointer on a
     [data-pm-hover-exempt] surface inside a target (the home terminal's input and text) hovers nothing; a target that
     carries the attribute itself, or sits inside an exempt container, still hovers.
   Kinds: every target gets data-pmh-kind="card|row|tile|icon" once for its lifetime, ahead of time at idle (a few per
     idle callback, after load, after a look change and after a frame met a new target), so CSS and tokens can differ
     per kind and no hover frame writes it; a frame stamps only a target that appeared since.
   CSS contract (written only on the hovered target and its lit neighbours, only on a visible change)
     class .pmh-on    the hovered target              class .pmh-near  a neighbour inside the bleed (i > 0)
     class .pmh-out   for --pmh-out-ms after the pointer left the target, then removed
     class .pmh-mv    while the magnet holds a translate (CSS keeps `translate` out of the target's transitions)
     style translate  the magnet offset; the standalone property, never `transform`
     --pmh-i          intensity 0..1, continuous: 0 at --pmh-bleed px outside a box, --pmh-edge at its edge, 1 at
                      --pmh-ramp px inside (registered inherits:false in 22-hover.css; pseudo-elements take it with
                      an explicit `inherit`)
     --pmh-x/-y       pointer in the box, px   --pmh-px/-py the same in %   --pmh-dx/-dy offset from the centre -1..1
                      (which of them are written: --pmh-pos bits 1 = px, 2 = %, 4 = d)
   Proxies (fixed, made on first use, each with data-pmh-family = basic|friendly|glass|retro|nier and data-pmh-kind)
     #pmh-glow        holds two <i> layers that take turns, so one fades out where it was while the next fades in.
                      A layer sits at the hovered target's REST rect (it never follows the magnet), is clipped to the
                      target's visible part inside scroll containers (slack --pmh-glow-reach px on open sides), takes
                      the target's border-radius, and gets .pmh-glow-on: CSS pre-paints its shadow and animates only
                      its opacity.
     #pmh-frame       one overlay with four <i> corners, over the target's rest rect (or following the magnet with
                      --pmh-frame-follow: 1), travelling between targets on a spring or in discrete steps
                      (--pmh-frame-hz > 0); .pmh-frame-on while shown, .pmh-frame-travel while it moves.
   Tokens: read from #pmh-probe (one <i data-pmh-kind> per kind, so family rows on <html> and kind rows both apply) at
     the first frame and at the frame after a change of data-theme, data-motion, data-o55-nier, data-o55-nier-parts or
     data-pmh-soft (never inside the observer itself). Names and defaults: TOKENS below.
   Rests: body.pm-resizing / pm-ab-dragging / pmu-pointer-op / pm7u-pointer-op, html[data-pmu-moment] and a Usage
     board with [data-op] drop the hover and let the magnet settle to 0; a held pointer button keeps the state but
     calms the magnet to 0 and freezes the field. The next pointer move after a rest resumes.
   Reduced Motion (O55.motion.reduced(): the Settings switch or the system setting): no magnet, no frame travel, no
     pointer-following field; the hovered target gets --pmh-i: 1 and its classes at once.
   Software-rendered (O55.motion.softwareRendered(), asked off the main thread): html[data-pmh-soft], so CSS can drop
     its expensive layers and turn the field off (tokens are re-read).
   Cost rules: one hook on window.PM7_PMOVE (no pointermove listener of its own, canon F3-446); rects (with each
     proxy target's radius, clipping ancestors and visible part) are read after a frame, when style and layout are
     clean, and an enter inside a scope whose rects are known reads nothing at all, so its :hover restyle and the
     engine's writes share the frame's one recalc; a target never measured (a new scope) gets its classes in its first
     frame and its light, plate, magnet and reticle one frame later, once the read after that frame has measured it; a
     frame reads rects itself only after a scroll around the scope, a resize, an element added or removed inside the
     scope, a gesture rest or a look change (a known box may have moved); every
     frame reads first, then writes; the proxies are made at idle and keep their layers; the rAF loop stops as soon as no
     spring, travel or pointer change is pending, so a pointer resting on a card stops it once the spring has settled,
     and nothing runs at idle.
   Test API: window.PMH = { sel, kinds, state(), retoken(), stats(), resolve(el), kindOf(el) }; stats().enters counts
     how enters met their rects (cached = read nothing in the frame). ?pmh=off leaves the
     engine out (for A/B measurements). */
(function () {
  'use strict';
  try { pmh(); } catch (err) { try { console.warn('[pmh] hover engine not started:', err); } catch (_) {} }

  function pmh() {
    var root = document.documentElement;
    if (/(?:^|[?&])pmh=off(?:&|$)/.test(location.search)) { window.PMH = { off: true }; return; }

    /* ---- targets and kinds ---- */
    var KINDS = {
      icon: '.activity-bar .icon,.pm-term-icon-btn,.pm6-dash-iconbtn,.browser-action-btn',
      tile: '.pm6-dash-catalog-item,.pm6-orch-ctl,.pm6-orch-pc-stat,.pm6-orch-hist-state',
      row: '.pm6-sp-row,.pm6-art-row,.pm6-search-hit',
      card: '.pm6-dash-card,.pm6-proj-card,.project-card-bento,.pm6-wiz-choice-card,.pm6-wiz-attach-card,' +
        '.pm6-wiz-disc-card,.pm6-wiz-topic-card,.pm6-orch-widget,.pm6-chat-card,.pm6-usage-acct-status,.pmu-card,.pm7u-card'
    };
    var KIND_ORDER = ['icon', 'tile', 'row', 'card'];
    var SEL = '[data-pmh],.pm-sheen,' + KIND_ORDER.map(function (k) { return KINDS[k]; }).join(',');
    var BOUNDARY = '[role="tab"],.page-tab,[class*="resizer"],[class*="-divider"],.xterm,textarea,input,select,' +
      '[contenteditable=""],[contenteditable="true"]';
    /* [data-pm-hover-exempt] marks surfaces that must not hover (the home terminal's input and text) and, in the page's
       hover-tag controller, containers and plates whose tags are off. PMH honours it only where it sits INSIDE the
       target under the pointer (a text surface in a card): a target that carries it itself, or sits inside an
       exempt container (a focus landmark, the Usage board), still hovers. */
    var EXEMPT = '[data-pm-hover-exempt]';
    /* Usage plates: the whole head is a move handle and seven resize zones sit 4 px outside the edge, so the magnet
       stays off there (light and glow only); a plate is not a target while the board runs an operation on it, nor
       while it settles into its slot after a drop (a transform animation: a rect read then is not where it lands). */
    var PMU_SKIP = '[data-head="band"],[data-pending],[data-leaving],[data-lifted],[data-resizing],[data-settling],[data-morphing]';
    var NOMAG = '.pmu-card,[data-pmh-mag="0"]';
    var REST_BODY = ['pm-resizing', 'pm-ab-dragging', 'pmu-pointer-op', 'pm7u-pointer-op', 'pmw-dragging'];   /* pmw-dragging: home panels' tab or panel drag */

    var TOKENS = [
      /* magnet: max px, fraction of min(w,h), kind gain, spring, quantum (px, 0 = smooth), write cadence (Hz, 0 = every frame) */
      ['mag', '--pmh-mag', 3], ['magK', '--pmh-mag-k', 0.03], ['gain', '--pmh-mag-gain', 1],
      ['stiff', '--pmh-stiff', 220], ['damp', '--pmh-damp', 28], ['step', '--pmh-step', 0], ['hz', '--pmh-hz', 0],
      /* field: on/off, neighbours on/off, bleed px, edge intensity, ramp px, which positions to write */
      ['field', '--pmh-field', 1], ['near', '--pmh-near', 1], ['bleed', '--pmh-bleed', 10], ['edge', '--pmh-edge', 0.45],
      ['ramp', '--pmh-ramp', 16], ['pos', '--pmh-pos', 7],
      ['outMs', '--pmh-out-ms', 240],
      /* glow proxy */
      ['glow', '--pmh-glow', 0], ['glowReach', '--pmh-glow-reach', 40],
      /* frame proxy: on/off, follow the magnet, stepped cadence (Hz) and the share of the way each step covers,
         spring, how long the frame may be hidden and still travel (ms), clip slack */
      ['frame', '--pmh-frame', 0], ['follow', '--pmh-frame-follow', 0], ['fhz', '--pmh-frame-hz', 0],
      ['fk', '--pmh-frame-k', 0.5], ['fstiff', '--pmh-frame-stiff', 520], ['fdamp', '--pmh-frame-damp', 44],
      ['fsnap', '--pmh-frame-snap-ms', 180], ['freach', '--pmh-frame-reach', 12],
      /* proxies on whole device pixels (0 = off): edges rounded the way Blink snaps the target's own border box, so a
         1 px line drawn on a proxy lands on the target's border instead of smearing over two half-intensity pixels at
         a fractional rect (NieR's hairline brackets) */
      ['snap', '--pmh-snap', 0],
      /* edge hold, px (0 = off): over no other target and within this band around the hovered box's edge, the hover
         stays. A look that moves its box on hover (Retro's 2 px raise) would otherwise toggle while a slow pointer
         crosses the strip the box moved off; deep inside a box it never holds, so an overlay still occludes */
      ['hold', '--pmh-hold', 0]
    ];

    var T = {}, probe = null, tokensDirty = true, tokenFrame = 0;
    var stats = { frames: 0, rects: 0, writes: 0, scopes: 0, tokenReads: 0, lastFrameMs: 0, maxFrameMs: 0, errors: 0, slow: [], totalMs: 0, enters: { cached: 0, deferred: 0, noRect: 0, old: 0, dirty: 0 }, hist: { lt1: 0, lt2: 0, lt4: 0, lt8: 0, ge8: 0 } };
    var phase = { tokens: false, scope: false, rects: 0 };   /* what the current frame did, for stats.slow */
    var raf = window.requestAnimationFrame.bind(window);
    var M = window.O55 && window.O55.motion;
    var reduceMq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    function isReduced() {
      if (M && typeof M.reduced === 'function') { try { return !!M.reduced(); } catch (_) {} }
      return root.getAttribute('data-motion') === 'reduced' || !!(reduceMq && reduceMq.matches);
    }
    function family() {
      if (root.hasAttribute('data-o55-nier')) return 'nier';
      var f = (root.getAttribute('data-theme') || 'basic-dark').split('-')[0];
      return /^(basic|friendly|glass|retro)$/.test(f) ? f : 'basic';
    }

    var kindCache = new WeakMap();
    function kindOf(el) {
      var k = kindCache.get(el);
      if (k) return k;
      var v = el.getAttribute('data-pmh');
      if (v && KINDS[v]) k = v;
      else {
        k = 'card';
        for (var i = 0; i < KIND_ORDER.length; i++) { if (el.matches(KINDS[KIND_ORDER[i]])) { k = KIND_ORDER[i]; break; } }
      }
      kindCache.set(el, k);
      if (el.getAttribute('data-pmh-kind') !== k) kindQueue.push(el);   /* written in the frame's write phase */
      return k;
    }
    var kindQueue = [];
    function flushKinds() {
      for (var i = 0; i < kindQueue.length; i++) {
        var el = kindQueue[i], k = kindCache.get(el);
        if (k && el.getAttribute('data-pmh-kind') !== k) { el.setAttribute('data-pmh-kind', k); stats.writes++; }
      }
      kindQueue.length = 0;
    }
    function valid(el) {
      var v = el.getAttribute('data-pmh');
      if (v === 'off' || v === 'none') return false;
      if (el.matches(BOUNDARY)) return false;
      if (el.classList.contains('pmu-card') &&
          (el.matches(PMU_SKIP) || el._pmuLeaving || el.closest('.pmu-ghostboard,#pmuFlight,.pmu-board[data-op]'))) return false;
      return true;
    }
    function resolve(start) {
      var t = start && start.closest ? start.closest(SEL) : null, best = null;
      while (t) {
        if (valid(t)) best = t;
        var p = t.parentElement;
        t = p ? p.closest(SEL) : null;
      }
      var ex = best && start.closest(EXEMPT);
      if (ex && ex !== best && best.contains(ex)) return null;   /* the pointer is on an exempt surface inside the target */
      return best;
    }

    /* ---- per-element state ---- */
    var ST = new WeakMap();
    function st(el) {
      var s = ST.get(el);
      if (!s) {
        s = { el: el, kind: kindOf(el), nomag: el.matches(NOMAG), x: 0, y: 0, vx: 0, vy: 0, wx: 0, wy: 0, acc: 0,
          fi: 0, fx: NaN, fy: NaN, near: false, mv: false, outTimer: 0, radius: null, clippers: null, vis: null, box: null };
        ST.set(el, s);
      }
      return s;
    }

    /* ---- pointer state (written by the hook, applied by the frame) ---- */
    var px = 0, py = 0, have = false, buttons = 0, hit = null, want = null, moved = false;
    var lastHitEl = null, lastHitT = null, lastHitAt = 0;
    var hover = null, springs = new Set(), lit = new Set();
    var running = false, lastT = 0, wasRest = false, bodyRest = false, visCache = null;

    function gestureRest() {
      var b = document.body;
      if (b) for (var i = 0; i < REST_BODY.length; i++) { if (b.classList.contains(REST_BODY[i])) return true; }
      if (root.hasAttribute('data-pmu-moment')) return true;
      return !!(hit && hit.closest && hit.closest('.pmu-board[data-op]'));
    }

    function onMove(e) {
      if (e.pointerType === 'touch') return;
      px = e.clientX; py = e.clientY; have = true; buttons = e.buttons | 0; hit = e.target;
      var now = e.timeStamp || performance.now();
      if (e.target === lastHitEl && now - lastHitAt < 400) want = lastHitT;
      else { want = resolve(e.target); lastHitEl = e.target; lastHitT = want; lastHitAt = now; }
      moved = true;
      start();
    }
    function onLeave(e) {
      if (e.relatedTarget) return;
      have = false; hit = null; want = null; lastHitEl = null; moved = true;
      start();
    }

    /* ---- scope: the targets the field may light, with cached rects ---- */
    /* rectsDirty: the scope's rects must be read; geomDirty: boxes may have moved since they were read (scroll, resize,
       elements added or removed in the scope, a gesture, a look change), so a known rect may be wrong */
    var scopeEl = null, scopeScan = null, scopeMode = '', cands = [], scopeDirty = true, rectsDirty = true, geomDirty = false, rectsAt = 0, mo = null;
    var CAP = 160;
    /* The outermost valid targets of a querySelectorAll list (document order): a match inside the last kept target is
       nested and belongs to it. No target sits above the container (in hover mode the container is above the resolved,
       outermost target; in gap mode the pointer's element resolved to none), so the whole parent chain of every match
       is never walked again (it was a closest(SEL) per level per candidate, 2-6 ms per scope). */
    function outermostIn(list, c) {
      var out = [], outer = null;
      for (var i = 0; i < list.length && out.length < CAP; i++) {
        var el = list[i];
        if (outer && outer.contains(el)) continue;   /* nested: the outer box owns it */
        if (valid(el)) { out.push(el); outer = el; }
      }
      return out;
    }
    function hasEl(list) { for (var i = 0; i < list.length; i++) if (list[i].nodeType === 1) return true; return false; }
    function buildScope(anchor, gap) {
      var c, found, scan = null;
      if (gap) { c = anchor; scan = c; found = c && c.querySelectorAll ? outermostIn(c.querySelectorAll(SEL), c) : []; }
      else {
        /* climb from the hovered box until its neighbours are in view (at most four levels, never to <body>) */
        c = anchor.parentElement; found = [anchor];
        for (var lv = 0; c && c !== document.body && lv < 4; lv++) {
          found = outermostIn(c.querySelectorAll(SEL), c); scan = c;
          if (found.length >= 4) break;
          var up = c.parentElement;
          if (!up || up === document.body || up === root) break;
          c = up;
        }
        if (found.indexOf(anchor) < 0) found.push(anchor);
      }
      stats.scopes++; phase.scope = true;
      var prev = new Map();
      for (var i = 0; i < cands.length; i++) prev.set(cands[i].el, cands[i]);
      cands = found.map(function (el) { return prev.get(el) || { el: el, kind: kindOf(el), l: 0, t: 0, w: 0, h: 0 }; });
      if (scopeEl !== c) {
        scopeEl = c;
        if (mo) mo.disconnect();
        if (c && typeof MutationObserver === 'function') {
          /* only elements added or removed count: a live widget that rewrites its text (the dashboard's counters, a
             few times a second) cannot add a target, and a box its new text moves is caught by the read after the
             next frame */
          mo = mo || new MutationObserver(function (ms) {
            for (var i = 0; i < ms.length; i++) {
              if (hasEl(ms[i].addedNodes) || hasEl(ms[i].removedNodes)) { scopeDirty = rectsDirty = geomDirty = true; if (proxyShown()) start(); return; }
            }
          });
          mo.observe(c, { childList: true, subtree: true });
        }
      }
      scopeMode = gap ? 'gap' : 'hover'; scopeScan = scan;
      scopeDirty = false; rectsDirty = true;
      for (var j = 0; j < cands.length; j++) if (!cands[j].el.hasAttribute('data-pmh-kind')) { stampSoon(); break; }
    }
    /* the translate a box shows on top of its rest position: the magnet's (written by this engine), else a hover form's
       own (Retro's raise on .pmh-on / .pmh-out), read from the computed style only for those two states */
    function shiftOf(el, s) {
      if (s && (s.wx || s.wy)) return [s.wx, s.wy];
      if (!el.classList.contains('pmh-on') && !el.classList.contains('pmh-out')) return null;
      var tr = getComputedStyle(el).translate;
      if (!tr || tr === 'none') return null;
      var p = tr.split(' '), x = parseFloat(p[0]) || 0, y = parseFloat(p[1]) || 0;
      return x || y ? [x, y] : null;
    }
    /* returns whether any rest rect moved by half a pixel or more */
    function readRects() {
      var changed = false;
      for (var i = 0; i < cands.length; i++) {
        var c = cands[i], r = c.el.getBoundingClientRect(), s = ST.get(c.el), d = shiftOf(c.el, s), dx = d ? d[0] : 0, dy = d ? d[1] : 0;
        stats.rects++;
        /* the rest rect: the rendered rect less the translate on top of it */
        var l = r.left - dx, t = r.top - dy;
        if (Math.abs(l - c.l) >= 0.5 || Math.abs(t - c.t) >= 0.5 || Math.abs(r.width - c.w) >= 0.5 || Math.abs(r.height - c.h) >= 0.5) changed = true;
        c.l = l; c.t = t; c.w = r.width; c.h = r.height;
        if (s && s.box) {   /* the proxies' box (an activity icon's .symbol) */
          var b = s.box.getBoundingClientRect(); stats.rects++;
          s.boxR = { l: b.left - dx, t: b.top - dy, w: b.width, h: b.height };
        }
      }
      rectsDirty = geomDirty = false; rectsAt = performance.now();
      return changed;
    }
    /* What a frame would otherwise read on enter (rects, the target's radius, its clipping ancestors and their rects) is
       read after the frame instead, when style and layout are clean and a read costs no recalc: from a message posted in
       the frame, which runs after its rendering. Then the next enter inside this scope reads nothing, so its :hover
       restyle and the engine's class writes share one recalc instead of a forced one plus another. If a rect or the
       visible part moved, the next frame applies it. */
    var post = typeof MessageChannel === 'function' ? new MessageChannel() : null, postWanted = false;
    function afterFrameSoon() {
      if (postWanted) return;
      postWanted = true;
      if (post) post.port2.postMessage(0); else setTimeout(afterFrame, 0);
    }
    function afterFrame() {
      postWanted = false;
      if (!cands.length || gestureRest()) return;
      var changed = readRects(), memo = new Map();
      for (var i = 0; i < cands.length; i++) {
        var s = st(cands[i].el);
        if (proxyWanted(s.kind)) { prefetch(s); s.vis = visibleRect(s, memo); }
      }
      if (hover && hover.isConnected) {
        var hs = ST.get(hover), v = hs && hs.vis;
        if (v && (!visCache || v.l !== visCache.l || v.t !== visCache.t || v.r !== visCache.r || v.b !== visCache.b)) { visCache = v; changed = true; }
      }
      if (changed && (hover || lit.size)) { moved = true; start(); }
    }
    if (post) post.port1.onmessage = afterFrame;
    /* what the proxies need of a target, read once: its box, radius and clipping ancestors */
    function prefetch(s) {
      if (s.kind === 'icon' && s.box === null) s.box = s.el.matches('.activity-bar .icon') ? s.el.querySelector('.symbol') || false : false;
      if (!proxyWanted(s.kind)) return;
      if (s.radius === null) s.radius = getComputedStyle(s.box || s.el).borderRadius || '';
      if (!s.clippers) s.clippers = clippersOf(s.el);
    }
    function candOf(el) { for (var i = 0; i < cands.length; i++) if (cands[i].el === el) return cands[i]; return null; }

    /* ---- tokens ---- */
    function ensureProbe() {
      if (probe || !document.body) return;
      probe = document.createElement('div');
      probe.id = 'pmh-probe'; probe.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < KIND_ORDER.length; i++) {
        var p = document.createElement('i'); p.setAttribute('data-pmh-kind', KIND_ORDER[i]); probe.appendChild(p);
      }
      document.body.appendChild(probe);
    }
    function readTokens() {
      ensureProbe();
      if (!probe) return;
      stats.tokenReads++; phase.tokens = true;
      var kids = probe.children;
      for (var i = 0; i < kids.length; i++) {
        var cs = getComputedStyle(kids[i]), o = {};
        for (var j = 0; j < TOKENS.length; j++) {
          var v = parseFloat(cs.getPropertyValue(TOKENS[j][1]));
          o[TOKENS[j][0]] = isNaN(v) ? TOKENS[j][2] : v;
        }
        T[kids[i].getAttribute('data-pmh-kind')] = o;
      }
      tokensDirty = false;
      var fam = family();
      if (glowEl) glowEl.setAttribute('data-pmh-family', fam);
      if (frameEl) frameEl.setAttribute('data-pmh-family', fam);
    }
    function tk(kind) { return T[kind] || T.card; }
    function retokenNextFrame() {
      tokensDirty = true; rectsDirty = geomDirty = true;   /* a look change can change every box's size */
      if (tokenFrame) return;
      tokenFrame = raf(function retokenFrame() {
        tokenFrame = 0;
        if (tokensDirty) readTokens();
        if (isReduced()) snapMagnets();
        stampSoon(300);
        if (hover || springs.size || lit.size) { moved = true; start(); }
      });
    }

    /* ---- the loop ---- */
    function start() { if (!running) { running = true; lastT = performance.now(); raf(tick); } }

    function tick(now) {
      var t0 = performance.now();
      phase.tokens = phase.scope = false; phase.rects = stats.rects;
      try { frame(now); } catch (err) {
        stats.errors++;
        if (stats.errors < 4) { try { console.warn('[pmh] frame failed:', err); } catch (_) {} }
        running = false; return;
      }
      var ms = performance.now() - t0;
      stats.frames++; stats.lastFrameMs = Math.round(ms * 1000) / 1000; stats.totalMs += ms;
      stats.hist[ms < 1 ? 'lt1' : ms < 2 ? 'lt2' : ms < 4 ? 'lt4' : ms < 8 ? 'lt8' : 'ge8']++;
      if (ms > stats.maxFrameMs) stats.maxFrameMs = stats.lastFrameMs;
      /* the last few frames over 4 ms, with what they did (a token read or a rect read flushes style the page had
         left dirty, so that cost is the page's pending style, met early in the frame) */
      if (ms > 4) {
        stats.slow.push({ ms: stats.lastFrameMs, tokens: phase.tokens, scope: phase.scope, rects: stats.rects - phase.rects, cands: cands.length });
        if (stats.slow.length > 6) stats.slow.shift();
      }
    }

    function frame(now) {
      var dt = Math.min(1 / 30, Math.max(1 / 240, (now - lastT) / 1000 || 1 / 60));
      lastT = now;
      var reduced = isReduced(), rest = gestureRest(), calm = !rest && buttons !== 0;
      var wasMoved = moved; moved = false;

      /* READ ------------------------------------------------------------ */
      if (tokensDirty) readTokens();
      var next = rest || !have ? null : (calm ? hover : want);
      if (!next && hover && have && !rest && hover.isConnected && inHoldBand(hover)) next = hover;
      if (next && !next.isConnected) next = null;
      var enter = next !== hover;
      if (next) {
        if (enter || scopeDirty || scopeMode !== 'hover' || !candOf(next)) {
          /* the scope already holds the target (the gap scope of its container, or a neighbour's scope): keep it */
          if (!scopeDirty && candOf(next) && scopeEl && scopeEl.contains(next)) scopeMode = 'hover';
          else buildScope(next, false);
        }
      } else if (have && !rest && hit && hit.isConnected && (scopeDirty || scopeMode !== 'gap' || scopeScan !== hit) && !calm) {
        if (!scopeDirty && scopeScan === hit) scopeMode = 'gap';   /* the gap of the container the hover scope scanned: the same list */
        else if (!scopeDirty && scopeScan && scopeScan.contains(hit) && cands.length < CAP) {
          /* a gap inside the scanned container (the grid between two cards): its targets are the list's own subset, with
             their rects (the scope element and its observer stay) */
          cands = cands.filter(function (c) { return hit.contains(c.el); });
          scopeScan = hit; scopeMode = 'gap';
        } else buildScope(hit, true);
      }
      var cached = false, defer = false;
      if (next && enter) {
        var ns = st(next), nc = candOf(next);
        /* rects read within the last five seconds (and again after every frame that runs) are used as they are: an
           enter reads nothing, and the read after this frame corrects a box that moved without a scroll, resize or DOM
           change in the scope (each of those marks the rects dirty, and a dirty rect is read in the frame as before) */
        cached = !rectsDirty && !!nc && nc.w > 0 && now - rectsAt < 5000 && (ns.kind !== 'icon' || ns.box !== null) &&
          (!proxyWanted(ns.kind) || (ns.radius !== null && !!ns.clippers && !!ns.vis));
        /* a target never measured (a new scope) while nothing moved: this frame writes its classes only and the read after
           the frame measures it, so this frame's :hover restyle is not forced early and then repeated; the light, plate,
           magnet and reticle start on the next frame. A box that may have moved (geomDirty) is read here, as before. */
        if (!cached) {
          defer = !geomDirty && (!nc || !nc.w);
          if (!defer) { prefetch(ns); rectsDirty = true; }
        }
        /* test API: how enters met their rects (cached = read nothing in the frame) */
        stats.enters[cached ? 'cached' : defer ? 'deferred' : !nc || !nc.w ? 'noRect' : now - rectsAt >= 5000 ? 'old' : 'dirty']++;
      }
      var reread = rectsDirty && !defer;
      if (reread) readRects();
      var hc = next ? candOf(next) : null;
      if (hc && !hc.w) hc = null;   /* not measured yet: no magnet, light or proxy until it is */
      /* the visible part (clipping ancestors' rects) is read with the rects, never on its own in a frame */
      var nst = next ? st(next) : null;
      if (!next || !hc || !proxyWanted(nst.kind)) visCache = null;
      else if (reread || !nst.vis) visCache = nst.vis = visibleRect(nst);
      else if (enter || !visCache) visCache = nst.vis;
      var vis = visCache;

      /* WRITE ----------------------------------------------------------- */
      if (kindQueue.length) flushKinds();
      if (enter) swapHover(hover, next, reduced);
      hover = next;
      if (hover && (wasMoved || enter) && !st(hover).nomag) springs.add(st(hover));
      if (calm && hover) springs.add(st(hover));
      if (rest) { if (lit.size) clearField(); }
      else if (!calm && (wasMoved || enter || rest !== wasRest)) field(reduced);
      wasRest = rest;
      magnets(dt, reduced, calm);
      glowUpdate(hc, vis);
      var travelling = frameUpdate(hc, vis, dt, reduced, now);

      if (cached || defer || reread || enter || (wasMoved && now - rectsAt > 1000)) afterFrameSoon();
      if (springs.size || travelling || moved) raf(tick); else running = false;
    }

    function inHoldBand(el) {
      var s = ST.get(el), h = s ? tk(s.kind).hold : 0, c = h > 0 ? candOf(el) : null;
      if (!c || !c.w) return false;
      return px >= c.l - h && px <= c.l + c.w + h && py >= c.t - h && py <= c.t + c.h + h &&
        !(px > c.l + h && px < c.l + c.w - h && py > c.t + h && py < c.t + c.h - h);
    }
    function swapHover(prev, next, reduced) {
      if (prev && prev.isConnected) {
        var ps = st(prev);
        prev.classList.remove('pmh-on'); stats.writes++;
        var out = tk(ps.kind).outMs;
        if (!reduced && out > 0) {
          prev.classList.add('pmh-out');
          clearTimeout(ps.outTimer);
          ps.outTimer = setTimeout(function () { ps.outTimer = 0; prev.classList.remove('pmh-out'); }, out);
        }
        springs.add(ps);
      }
      if (next) {
        var s = st(next);
        if (s.outTimer) { clearTimeout(s.outTimer); s.outTimer = 0; next.classList.remove('pmh-out'); }
        next.classList.add('pmh-on'); stats.writes++;
      }
    }

    /* ---- field ---- */
    function setI(s, i) {
      if (Math.abs(i - s.fi) >= 0.01 || (i === 0 && s.fi !== 0)) {
        if (i === 0) s.el.style.removeProperty('--pmh-i'); else s.el.style.setProperty('--pmh-i', i.toFixed(2));
        s.fi = i; stats.writes++;
      }
    }
    function setPos(s, c, x, y, mask) {
      if (Math.abs(x - s.fx) < 0.5 && Math.abs(y - s.fy) < 0.5) return;
      var es = s.el.style;
      if (mask & 1) { es.setProperty('--pmh-x', x.toFixed(1) + 'px'); es.setProperty('--pmh-y', y.toFixed(1) + 'px'); }
      if (mask & 2) {
        es.setProperty('--pmh-px', Math.min(100, Math.max(0, x / c.w * 100)).toFixed(1) + '%');
        es.setProperty('--pmh-py', Math.min(100, Math.max(0, y / c.h * 100)).toFixed(1) + '%');
      }
      if (mask & 4) {
        es.setProperty('--pmh-dx', Math.max(-1, Math.min(1, (x - c.w / 2) / (c.w / 2))).toFixed(3));
        es.setProperty('--pmh-dy', Math.max(-1, Math.min(1, (y - c.h / 2) / (c.h / 2))).toFixed(3));
      }
      s.fx = x; s.fy = y; stats.writes++;
    }
    function unlight(s) {
      var es = s.el.style;
      if (s.fi !== 0 || !isNaN(s.fx)) {
        ['--pmh-i', '--pmh-x', '--pmh-y', '--pmh-px', '--pmh-py', '--pmh-dx', '--pmh-dy'].forEach(function (n) { es.removeProperty(n); });
        stats.writes++;
      }
      s.fi = 0; s.fx = s.fy = NaN;
      if (s.near) { s.el.classList.remove('pmh-near'); s.near = false; stats.writes++; }
    }
    function clearField() { lit.forEach(unlight); lit.clear(); }
    function field(reduced) {
      var now = new Set();
      if (have) {
        for (var k = 0; k < cands.length; k++) {
          var c = cands[k];
          if (!c.w || !c.h) continue;
          var tok = tk(c.kind);
          if (!tok.field) continue;
          var isHover = c.el === hover;
          if (reduced && !isHover) continue;
          var s0 = ST.get(c.el), ox = s0 ? s0.wx : 0, oy = s0 ? s0.wy : 0;
          var l = c.l + ox, t = c.t + oy, r = l + c.w, b = t + c.h, i;
          if (isHover) {
            if (reduced) i = 1;
            else {
              var depth = Math.min(px - l, r - px, py - t, b - py);
              i = tok.edge + (1 - tok.edge) * Math.min(1, Math.max(0, depth) / Math.max(1, tok.ramp));
            }
          } else {
            if (!tok.near || tok.bleed <= 0) continue;
            if (px < l - tok.bleed || px > r + tok.bleed || py < t - tok.bleed || py > b + tok.bleed) continue;
            var dx = Math.max(l - px, 0, px - r), dy = Math.max(t - py, 0, py - b), d = Math.sqrt(dx * dx + dy * dy);
            i = d >= tok.bleed ? 0 : tok.edge * (tok.bleed - d) / tok.bleed;
          }
          if (i <= 0.004) continue;
          var s = st(c.el);
          now.add(s);
          setI(s, i);
          if (!reduced && tok.pos) setPos(s, c, px - l, py - t, tok.pos);
          var nearNow = !isHover;
          if (nearNow !== s.near) { s.el.classList.toggle('pmh-near', nearNow); s.near = nearNow; stats.writes++; }
        }
      }
      lit.forEach(function (s) { if (!now.has(s)) unlight(s); });
      lit = now;
    }

    /* ---- magnet ---- */
    function snapMagnets() {
      springs.forEach(function (s) {
        s.x = s.y = s.vx = s.vy = 0;
        if (s.wx || s.wy) { s.el.style.translate = ''; s.wx = s.wy = 0; stats.writes++; }
        if (s.mv) { s.el.classList.remove('pmh-mv'); s.mv = false; }
      });
      springs.clear();
    }
    function magnets(dt, reduced, calm) {
      springs.forEach(function (s) {
        var tok = tk(s.kind), tx = 0, ty = 0;
        if (s.el === hover && have && !reduced && !calm && !s.nomag && s.el.isConnected) {
          var c = candOf(s.el);
          if (c && c.w && c.h) {
            var m = Math.min(tok.mag, Math.min(c.w, c.h) * tok.magK) * tok.gain;
            if (m > 0) {
              tx = Math.max(-1, Math.min(1, (px - (c.l + c.w / 2)) / (c.w / 2))) * m;
              ty = Math.max(-1, Math.min(1, (py - (c.t + c.h / 2)) / (c.h / 2))) * m;
            }
          }
        }
        if (reduced) { s.x = tx; s.y = ty; s.vx = s.vy = 0; }
        else {
          s.vx += (tok.stiff * (tx - s.x) - tok.damp * s.vx) * dt;
          s.vy += (tok.stiff * (ty - s.y) - tok.damp * s.vy) * dt;
          s.x += s.vx * dt; s.y += s.vy * dt;
        }
        var settled = Math.abs(tx - s.x) < 0.05 && Math.abs(ty - s.y) < 0.05 && Math.abs(s.vx) < 0.5 && Math.abs(s.vy) < 0.5;
        if (settled) { s.x = tx; s.y = ty; s.vx = s.vy = 0; }
        var writeNow = true;
        if (tok.hz > 0 && !settled) { s.acc += dt; if (s.acc < 1 / tok.hz) writeNow = false; else s.acc = 0; }
        if (writeNow) {
          var q = tok.step > 0 ? tok.step : 0.05;
          var wx = Math.round(s.x / q) * q, wy = Math.round(s.y / q) * q;
          if (wx !== s.wx || wy !== s.wy) {
            if (!s.mv && (wx || wy)) { s.el.classList.add('pmh-mv'); s.mv = true; }
            s.el.style.translate = (wx || wy) ? wx.toFixed(2) + 'px ' + wy.toFixed(2) + 'px' : '';
            s.wx = wx; s.wy = wy; stats.writes++;
          }
        }
        if (settled) {
          if (!tx && !ty) {
            if (s.wx || s.wy) { s.el.style.translate = ''; s.wx = s.wy = 0; stats.writes++; }
            if (s.mv) { s.el.classList.remove('pmh-mv'); s.mv = false; stats.writes++; }
          }
          springs.delete(s);
        }
      });
    }

    /* ---- proxies ---- */
    var glowEl = null, GL = [], glowCur = -1, glowLastOff = 1;
    var frameEl = null, FR = { on: false, x: 0, y: 0, w: 0, h: 0, vx: 0, vy: 0, vw: 0, vh: 0, acc: 0, offAt: -1e9, travel: false, clip: '', host: null };
    function proxyWanted(kind) { var t = tk(kind); return !!(t.glow || t.frame); }
    function proxyShown() { return !!(glowCur >= 0 || FR.on); }
    var clipMemo = new WeakMap();   /* ancestor -> 1 clips, 2 clips and is fixed, 3 is fixed, 0 neither (siblings share them) */
    function clippersOf(el) {
      var out = [];
      for (var a = el.parentElement; a && a !== document.body && a !== root; a = a.parentElement) {
        var m = clipMemo.get(a);
        if (m === undefined) {
          var cs = getComputedStyle(a), clips = /(hidden|auto|scroll|clip)/.test(cs.overflowX + cs.overflowY), fx = cs.position === 'fixed';
          m = (clips ? 1 : 0) + (fx ? 2 : 0); clipMemo.set(a, m);
        }
        if (m & 1) out.push(a);
        if (m & 2) break;
      }
      return out;
    }
    function visibleRect(s, memo) {
      var v = { l: -1e9, t: -1e9, r: 1e9, b: 1e9 };
      var list = s.clippers || [];
      for (var i = 0; i < list.length; i++) {
        var r = memo && memo.get(list[i]);
        if (!r) { r = list[i].getBoundingClientRect(); stats.rects++; if (memo) memo.set(list[i], r); }
        if (r.left > v.l) v.l = r.left; if (r.top > v.t) v.t = r.top;
        if (r.right < v.r) v.r = r.right; if (r.bottom < v.b) v.b = r.bottom;
      }
      return v;
    }
    function boxFor(c) {
      var s = ST.get(c.el);
      return s && s.boxR ? s.boxR : { l: c.l, t: c.t, w: c.w, h: c.h };
    }
    function clipFor(b, v, reach) {
      if (!v) return '';
      if (v.r <= v.l || v.b <= v.t || v.r <= b.l - reach || v.l >= b.l + b.w + reach || v.b <= b.t - reach || v.t >= b.t + b.h + reach) return 'hide';
      var it = Math.max(-reach, v.t - b.t), ir = Math.max(-reach, b.l + b.w - v.r), ib = Math.max(-reach, b.t + b.h - v.b), il = Math.max(-reach, v.l - b.l);
      if (it === -reach && ir === -reach && ib === -reach && il === -reach) return '';
      return 'inset(' + it.toFixed(0) + 'px ' + ir.toFixed(0) + 'px ' + ib.toFixed(0) + 'px ' + il.toFixed(0) + 'px)';
    }
    function placeBox(el, memo, b, radius, clip, snap) {
      var es = el.style;
      if (snap) {
        var d = window.devicePixelRatio || 1, sl = Math.round(b.l * d) / d, sr = Math.round(b.t * d) / d;
        b = { l: sl, t: sr, w: Math.round((b.l + b.w) * d) / d - sl, h: Math.round((b.t + b.h) * d) / d - sr };
      }
      var tr = 'translate(' + b.l.toFixed(1) + 'px,' + b.t.toFixed(1) + 'px)';
      if (memo.tr !== tr) { es.transform = tr; memo.tr = tr; stats.writes++; }
      var w = Math.round(b.w * 2) / 2, h = Math.round(b.h * 2) / 2;
      if (memo.w !== w) { es.width = w + 'px'; memo.w = w; stats.writes++; }
      if (memo.h !== h) { es.height = h + 'px'; memo.h = h; stats.writes++; }
      if (radius !== undefined && memo.radius !== radius) { es.borderRadius = radius; memo.radius = radius; stats.writes++; }
      if (memo.clip !== clip) { es.clipPath = clip; memo.clip = clip; stats.writes++; }
    }
    function ensureGlow() {
      if (glowEl || !document.body) return glowEl;
      glowEl = document.createElement('div');
      glowEl.id = 'pmh-glow'; glowEl.setAttribute('aria-hidden', 'true');
      glowEl.setAttribute('data-pmh-family', family()); glowEl.setAttribute('data-pmh-kind', 'card');
      for (var i = 0; i < 2; i++) {
        var l = document.createElement('i'); l.setAttribute('data-pmh-kind', 'card'); glowEl.appendChild(l);
        GL.push({ el: l, host: null, on: false, memo: {} });
      }
      document.body.appendChild(glowEl);
      return glowEl;
    }
    function glowOn(L, on) { if (L.on !== on) { L.el.classList.toggle('pmh-glow-on', on); L.on = on; stats.writes++; } }
    function glowUpdate(hc, vis) {
      var s = hover ? st(hover) : null, tok = s ? tk(s.kind) : null;
      var target = s && tok.glow && hc ? hover : null;
      var cur = glowCur >= 0 ? GL[glowCur] : null;
      if (cur && cur.host !== target) {
        /* the old layer fades out where it is (its host is kept, so a quick return re-lights the same layer) */
        glowOn(cur, false); glowLastOff = glowCur; glowCur = -1; cur = null;
      }
      if (!target || !ensureGlow()) return;
      if (!cur) {
        glowCur = GL[0].host === target ? 0 : GL[1].host === target ? 1 : 1 - glowLastOff;
        cur = GL[glowCur]; cur.host = target;
        if (cur.el.getAttribute('data-pmh-kind') !== s.kind) { cur.el.setAttribute('data-pmh-kind', s.kind); glowEl.setAttribute('data-pmh-kind', s.kind); }
      }
      var b = boxFor(hc), clip = clipFor(b, vis, tok.glowReach);
      placeBox(cur.el, cur.memo, b, s.radius, clip === 'hide' ? '' : clip, tok.snap);
      glowOn(cur, clip !== 'hide');
    }
    function ensureFrame() {
      if (frameEl || !document.body) return frameEl;
      frameEl = document.createElement('div');
      frameEl.id = 'pmh-frame'; frameEl.setAttribute('aria-hidden', 'true');
      frameEl.setAttribute('data-pmh-family', family()); frameEl.setAttribute('data-pmh-kind', 'card');
      for (var i = 0; i < 4; i++) frameEl.appendChild(document.createElement('i'));
      document.body.appendChild(frameEl);
      return frameEl;
    }
    var frameMemo = {};
    /* one discrete step of the way (whole pixels, at least one), landing exactly once it is within 1.5 px */
    function stepTo(cur, goal, k) {
      var d = goal - cur;
      if (Math.abs(d) < 1.5) return goal;
      var m = Math.round(d * k);
      return cur + (Math.abs(m) >= 1 ? m : (d > 0 ? 1 : -1));
    }
    function frameUpdate(hc, vis, dt, reduced, now) {
      var s = hover ? st(hover) : null, tok = s ? tk(s.kind) : null;
      var target = s && tok.frame && hc ? hover : null;
      if (!target) {
        if (FR.on) { frameEl.classList.remove('pmh-frame-on', 'pmh-frame-travel'); FR.on = false; FR.travel = false; FR.offAt = now; FR.host = null; stats.writes++; }
        return false;
      }
      ensureFrame();
      if (!frameEl) return false;
      var b = boxFor(hc), gx = b.l + (tok.follow ? s.wx : 0), gy = b.t + (tok.follow ? s.wy : 0), gw = b.w, gh = b.h;
      if (FR.host !== target) {
        if (frameEl.getAttribute('data-pmh-kind') !== s.kind) frameEl.setAttribute('data-pmh-kind', s.kind);
        FR.host = target;
      }
      var snap = reduced || !FR.on && now - FR.offAt > tok.fsnap;
      if (!FR.on) { FR.on = true; frameEl.classList.add('pmh-frame-on'); stats.writes++; }
      if (snap) { FR.x = gx; FR.y = gy; FR.w = gw; FR.h = gh; FR.vx = FR.vy = FR.vw = FR.vh = 0; }
      else if (tok.fhz > 0) {
        FR.acc += dt;
        if (FR.acc >= 1 / tok.fhz) {
          FR.acc = 0;
          var k = Math.max(0.05, Math.min(1, tok.fk));
          FR.x = stepTo(FR.x, gx, k); FR.y = stepTo(FR.y, gy, k); FR.w = stepTo(FR.w, gw, k); FR.h = stepTo(FR.h, gh, k);
        }
      } else {
        var ks = tok.fstiff, kd = tok.fdamp;
        FR.vx += (ks * (gx - FR.x) - kd * FR.vx) * dt; FR.vy += (ks * (gy - FR.y) - kd * FR.vy) * dt;
        FR.vw += (ks * (gw - FR.w) - kd * FR.vw) * dt; FR.vh += (ks * (gh - FR.h) - kd * FR.vh) * dt;
        FR.x += FR.vx * dt; FR.y += FR.vy * dt; FR.w += FR.vw * dt; FR.h += FR.vh * dt;
        if (Math.abs(gx - FR.x) < 0.3 && Math.abs(gy - FR.y) < 0.3 && Math.abs(gw - FR.w) < 0.3 && Math.abs(gh - FR.h) < 0.3 &&
            Math.abs(FR.vx) + Math.abs(FR.vy) + Math.abs(FR.vw) + Math.abs(FR.vh) < 2) {
          FR.x = gx; FR.y = gy; FR.w = gw; FR.h = gh; FR.vx = FR.vy = FR.vw = FR.vh = 0;
        }
      }
      var travel = FR.x !== gx || FR.y !== gy || FR.w !== gw || FR.h !== gh;
      if (travel !== FR.travel) { frameEl.classList.toggle('pmh-frame-travel', travel); FR.travel = travel; stats.writes++; }
      var clip = clipFor({ l: gx, t: gy, w: gw, h: gh }, vis, tok.freach);
      placeBox(frameEl, frameMemo, { l: FR.x, t: FR.y, w: FR.w, h: FR.h }, s.radius, clip === 'hide' ? 'inset(50%)' : (travel ? '' : clip), tok.snap);
      return travel;
    }

    /* ---- listeners ---- */
    var PM = window.PM7_PMOVE;
    if (!PM || typeof PM.push !== 'function') {
      /* the shared dispatcher (pm6-js-globals, kept by build.py's patch) is missing: make it, once */
      PM = window.PM7_PMOVE = [];
      document.addEventListener('pointermove', function (e) {
        var hooks = window.PM7_PMOVE;
        for (var i = 0; i < hooks.length; i++) { try { hooks[i](e); } catch (err) {} }
      });
    }
    PM.push(onMove);
    document.addEventListener('pointerout', onLeave);
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      buttons = e.buttons | 0 || 1;
      if (hover) { springs.add(st(hover)); start(); }
    }, { capture: true, passive: true });
    document.addEventListener('pointerup', function (e) { buttons = e.buttons | 0; }, { capture: true, passive: true });
    window.addEventListener('scroll', function (e) {
      /* only a scroller around the scope moves its boxes (the demo chat stream scrolls on its own all the time) */
      var t = e.target;
      if (scopeEl && t && t !== document && t !== root && t !== document.body && !(t.contains && t.contains(scopeEl))) return;
      rectsDirty = geomDirty = true;   /* also with nothing lit: the cached rects of the scope are stale now */
      if (!hover && !lit.size && !proxyShown()) return;
      moved = true; start();
    }, { capture: true, passive: true });
    window.addEventListener('resize', function () {
      scopeDirty = rectsDirty = geomDirty = true;
      clipMemo = new WeakMap();
      cands.forEach(function (c) { var s = ST.get(c.el); if (s) s.clippers = null; });
      if (hover || lit.size) { moved = true; start(); }
    }, { passive: true });
    if (typeof MutationObserver === 'function') {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          if (muts[i].attributeName === 'data-pmu-moment') { if (hover || springs.size) { moved = true; start(); } }
          else { retokenNextFrame(); return; }
        }
      }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-motion', 'data-o55-nier', 'data-o55-nier-parts', 'data-pmh-soft', 'data-pmu-moment'] });
      if (document.body) {
        new MutationObserver(function () {
          var r = gestureRest();
          if (r !== bodyRest) { bodyRest = r; rectsDirty = geomDirty = true; }   /* a resize or drag gesture moves boxes */
          if (r !== wasRest && (hover || springs.size || lit.size)) { moved = true; start(); }
        }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
      }
    }
    if (reduceMq) {
      var mqChange = function () { retokenNextFrame(); };
      if (reduceMq.addEventListener) reduceMq.addEventListener('change', mqChange); else if (reduceMq.addListener) reduceMq.addListener(mqChange);
    }

    /* Ahead of time, at idle: every outermost target gets its data-pmh-kind (and the kind cache its value), a few per idle
       callback so the restyle a kind attribute brings (the per-kind pseudo-element appears) is spread over idle frames
       instead of landing in the first hover frame near a box; and the proxies the look uses are made, so their layers
       exist before the first hover. Again after a look change and whenever a frame meets a target not stamped yet (new
       DOM). */
    var stampTimer = 0, stampList = null, stampAt = 0, stampOuter = null;
    function stampSoon(ms) {
      if (stampTimer || stampList) return;
      stampTimer = setTimeout(function () { stampTimer = 0; idle(stampRun); }, ms || 700);
    }
    function stampRun(dl) {
      if (!document.body) return;
      if (!stampList) {
        if (tokensDirty) readTokens();
        var g = false, f = false;
        for (var k in T) { if (T[k].glow) g = true; if (T[k].frame) f = true; }
        if (g) ensureGlow();
        if (f) ensureFrame();
        stampList = document.querySelectorAll(SEL); stampAt = 0; stampOuter = null;
      }
      var n = 0, t0 = performance.now();
      while (stampAt < stampList.length) {
        var el = stampList[stampAt++];
        if (stampOuter && stampOuter.contains(el)) continue;
        if (!el.isConnected || !valid(el)) continue;
        stampOuter = el;
        if (el.hasAttribute('data-pmh-kind')) continue;
        var kd = kindOf(el);
        el.setAttribute('data-pmh-kind', kd); stats.writes++; stats.stamped = (stats.stamped || 0) + 1;
        if (++n >= 12 || performance.now() - t0 > 4 || (dl && dl.timeRemaining && dl.timeRemaining() < 2)) break;
      }
      for (var q = kindQueue.length - 1; q >= 0; q--) if (kindQueue[q].hasAttribute('data-pmh-kind')) kindQueue.splice(q, 1);
      if (stampAt < stampList.length) idle(stampRun); else stampList = null;
    }

    /* software rendering: asked twice, late and off the main thread (the worker answers within a few seconds; where no
       worker can ask, the main-thread probe would cost about 210 ms, so it is not asked at all) */
    function askSoft() {
      try {
        if (!M || typeof M.softwareRendered !== 'function' || typeof Worker !== 'function' || typeof OffscreenCanvas !== 'function') return;
        var soft = !!M.softwareRendered();
        if (soft !== root.hasAttribute('data-pmh-soft')) { if (soft) root.setAttribute('data-pmh-soft', ''); else root.removeAttribute('data-pmh-soft'); }
      } catch (_) {}
    }
    var idle = window.requestIdleCallback ? function (fn) { window.requestIdleCallback(fn, { timeout: 1500 }); } : function (fn) { setTimeout(fn, 0); };
    stampSoon(1200);
    setTimeout(function () { idle(askSoft); }, 2500);
    setTimeout(function () { idle(askSoft); }, 6500);

    /* ---- test API ---- */
    function desc(el) {
      if (!el) return null;
      return { tag: el.tagName.toLowerCase(), id: el.id || '', cls: String(el.className || '').slice(0, 80), kind: kindOf(el) };
    }
    window.PMH = {
      sel: SEL,
      kinds: JSON.parse(JSON.stringify(KINDS)),
      resolve: resolve,
      kindOf: function (el) { return el ? kindOf(el) : null; },
      retoken: function () { readTokens(); return JSON.parse(JSON.stringify(T)); },
      stats: function () { var o = {}; for (var k in stats) o[k] = stats[k]; o.slow = stats.slow.slice(); o.hist = Object.assign({}, stats.hist); o.enters = Object.assign({}, stats.enters); o.totalMs = Math.round(stats.totalMs * 100) / 100; o.running = running; o.springs = springs.size; o.lit = lit.size; return o; },
      state: function () {
        var hs = hover ? ST.get(hover) : null;
        return {
          hover: desc(hover), translate: hs ? [hs.wx, hs.wy] : null, intensity: hs ? hs.fi : 0,
          near: Array.from(lit).filter(function (s) { return s.near; }).map(function (s) { return desc(s.el); }),
          running: running, springs: springs.size, scope: { mode: scopeMode, size: cands.length },
          rest: gestureRest(), calm: buttons !== 0, reduced: isReduced(), soft: root.hasAttribute('data-pmh-soft'),
          family: family(), glow: glowCur >= 0 && GL[glowCur].on, frame: FR.on, travelling: FR.travel, tokens: T
        };
      }
    };
  }
})();
