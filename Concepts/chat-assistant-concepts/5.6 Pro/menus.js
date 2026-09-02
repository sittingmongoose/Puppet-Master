/* menus.js — feature module.  OWNER: Wave 3 — Menus agent (item 5: corner-origin sprout, height spring, worktree in the top bar)
 *
 * Load order (see build.py): data.js, motion.js, variants-*.js, then EVERY feature
 * module, then app.js.  Modules therefore run BEFORE the app boots, so anything
 * registered here is live on the very first render — no re-render, no flash.
 *
 * ======================================================================
 * WHAT THIS MODULE DOES
 * ----------------------------------------------------------------------
 *  A. Ports PMConcept7's corner-origin spring sprout onto every overlay menu
 *     (PMConcept7.html:15563-15717 for the CSS, :48218-48300 for the JS),
 *     including its asymmetric close and its list-resize height spring
 *     (`portalAnimateHeight`, PMConcept7.html:48179-48216).
 *  B. Moves the worktree selector into the chat header via `headerExtras`,
 *     with its visual state driven from D.operational.worktrees.
 *
 * WHY THERE IS A MutationObserver HERE
 * ----------------------------------------------------------------------
 * The three things the sprout needs — "a menu just appeared", "a menu just
 * disappeared", "the list just changed height" — all live inside app.js's
 * closure.  `renderOverlays()`, `openMenu()` and `closeMenu()` are private,
 * there is no menu lifecycle slot in PM56_EXT, and app.js is closed after
 * Wave 1.  The overlay layer's DOM is the one public surface that carries
 * all three signals, so this module reads them off #pmOverlayRoot.
 *
 * The ordering that makes it work, and which the whole file depends on:
 *
 *   renderOverlays()  ->  pmPatch(root, html)                    [sync]
 *                     ->  requestAnimationFrame(positionOverlays) [queued 1st]
 *   ... task ends ...
 *   microtask checkpoint -> MutationObserver callback  (sync() below)
 *                        -> requestAnimationFrame(afterPosition)  [queued 2nd]
 *   ... next frame ...   -> positionOverlays()   then   afterPosition()
 *
 * So sync() can neutralise the transform BEFORE positionOverlays measures the
 * box, and afterPosition() can read the origin positionOverlays just wrote.
 * That ordering is the entire reason the entrance is a transition rather than
 * an @keyframes — see the long comment at the top of menus.css.
 *
 * WHY STATE LIVES ON #pmOverlayRoot AND NOT ON THE MENU
 * ----------------------------------------------------------------------
 * `pmSyncAttrs` (app.js:955) rewrites the menu's `class` and `style`
 * attributes from the template on every render, so a class or a custom
 * property parked on the menu itself is erased within a frame.
 * #pmOverlayRoot is the patch *container*; pmPatch never touches its
 * attributes.  Everything transient and everything persistent therefore
 * lives there, and menus.css targets `[data-overlay="root-menu"]` /
 * `[data-overlay="sidecar"]` descendants — attributes that ARE in the
 * template and so survive.
 * ====================================================================== */
(function () {
  'use strict';

  var EXT = window.PM56_EXT;
  var overlayRoot = document.getElementById('pmOverlayRoot');
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(mq && mq.matches); }

  /* Kept in sync with menus.css.  The close is deliberately longer than the
     visible fade (opacity 45ms delayed 175ms) so the safety timer covers the
     whole 220ms transform collapse plus a frame. */
  var GHOST_MS = 260;
  var BOUNCE_MS = 400;
  /* 300ms transform + a frame: how long the entrance's placement is pinned. */
  var HOLD_MS = 340;

  /* ==================================================================
     A. Sprout controller
     ================================================================== */

  /* Two independent lanes.  Hovering a model row adds a sidecar without
     touching the root menu, so the sidecar has to open on its own clock. */
  var LANES = [
    { id: 'root', k: 'r', sel: '.overlay-menu[data-overlay="root-menu"]' },
    { id: 'side', k: 's', sel: '.overlay-menu[data-overlay="sidecar"]' }
  ];
  LANES.forEach(function (L) {
    L.el = null; L.sig = null; L.snap = null; L.opening = false;
    L.lastHeight = ''; L.ghost = null; L.ghostTimer = 0; L.holdTimer = 0;
  });

  /* Root identity: class + side + head title, so persona / mode / model stay
     distinct while a list is filtered. Sidecar identity is class + side only:
     hovering another model row changes the head title and must NOT re-sprout
     (ACD-440). */
  function signature(el) {
    var overlay = el.getAttribute('data-overlay') || '';
    var side = el.getAttribute('data-side') || '';
    if (overlay === 'sidecar') {
      return (el.getAttribute('class') || '') + '|' + side;
    }
    var head = el.querySelector('.menu-head strong');
    return (el.getAttribute('class') || '') + '|' + side + '|' +
           (head ? head.textContent.trim() : '');
  }

  function cls(add, name) {
    overlayRoot.classList[add ? 'add' : 'remove'](name);
  }

  var rafPending = false;
  function scheduleAfterPosition() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; afterPosition(); });
  }

  /* ---- microtask phase: runs BEFORE positionOverlays measures ---- */
  function sync() {
    var work = false;
    for (var i = 0; i < LANES.length; i++) {
      var L = LANES[i];
      var el = overlayRoot.querySelector(L.sel);

      if (!el) {
        if (L.el) { closeLane(L); }
        continue;
      }
      var sig = signature(el);
      /* Sidecar still present: treat as a content/height update even if
         pmPatch swapped the node. Re-sprouting on row hover parks the box
         at the pin origin and covers the root menu. */
      var sidecarLive = L.id === 'side' && L.el && el;
      if (sidecarLive) {
        L.el = el; L.sig = sig; L.opening = false;
        /* pmPatch rewrites the sidecar's style attribute from a template
           with no left/top, so one frame sits at 0,0. Put the last truthful
           placement back before paint. */
        if (L.snap) {
          el.style.left = L.snap.left + 'px';
          el.style.top = L.snap.top + 'px';
        }
        var sprouting = overlayRoot.classList.contains('pm56-s-hold') ||
                        overlayRoot.classList.contains('pm56-s-closed') ||
                        overlayRoot.classList.contains('pm56-s-nomo');
        if (!sprouting) cls(true, 'pm56-' + L.k + '-flat');
        work = true;
        continue;
      }
      if (el !== L.el || sig !== L.sig) {
        L.el = el; L.sig = sig; L.opening = true; L.lastHeight = el.style.height || '';
        /* Untransformed and invisible: positionOverlays must measure the real
           box, and the pre-position frame must not flash at the static origin. */
        cls(true, 'pm56-' + L.k + '-nomo');
        cls(true, 'pm56-' + L.k + '-hidden');
        cls(true, 'pm56-' + L.k + '-pin');
        /* One transient overlay at a time, and no ambiguity for anything that
           queries the document: a menu opening in this lane retires the
           previous one's ghost immediately rather than letting the two coexist
           for the remaining 260ms. */
        dropGhost(L);
        work = true;
      } else {
        L.opening = false;
        /* Not an open, but positionOverlays is about to measure again anyway.
           Flatten the transform for that measurement frame -- otherwise a
           toast, a hover card or a submenu landing inside the sprout's 300ms
           re-places the menu from a box that is at scale3d(.72,.48,1).
           Measured before this: a persona menu re-measured mid-sprout was
           placed overlapping its own trigger by 117px. The height/width spring
           is deliberately kept alive; the model search filter is one of these
           renders and its resize is the animation we want. */
        cls(true, 'pm56-' + L.k + '-flat');
        work = true;
      }
    }
    if (work) scheduleAfterPosition();
  }

  /* ---- rAF phase: runs AFTER positionOverlays has written left/top/origin ---- */
  function afterPosition() {
    for (var i = 0; i < LANES.length; i++) {
      var L = LANES[i];
      var el = overlayRoot.querySelector(L.sel);
      if (!el) { continue; }
      L.el = el;

      /* Drop the measurement pin FIRST, then force layout, then read. The
         inline left/top positionOverlays just wrote take over, and the rect
         below is the settled one -- which matters because the bottom anchor is
         derived from it. Reading it while still pinned parked the model picker
         at the top of the viewport instead of above its trigger. */
      cls(false, 'pm56-' + L.k + '-pin');
      cls(false, 'pm56-' + L.k + '-flat');
      void el.offsetWidth;
      /* Untransformed (opens) or at rest (updates), and now correctly placed. */
      var rect = el.getBoundingClientRect();

      if (L.id === 'root') {
        applyOrigin(el, rect, L.opening);
        heightBounce(L, el);
      }
      if (L.id === 'side') heightBounce(L, el);

      if (L.opening) {
        L.opening = false;
        if (reduced()) {
          cls(false, 'pm56-' + L.k + '-hidden');
          cls(false, 'pm56-' + L.k + '-nomo');
        } else {
          holdGeom(L, el, rect);
          /* Arm the closed geometry with transitions still off, force the
             browser to compute it, re-enable transitions, force again, then
             release.  Two reflows so the transition unambiguously starts from
             the closed value rather than racing the class removal. */
          cls(true, 'pm56-' + L.k + '-closed');
          cls(false, 'pm56-' + L.k + '-hidden');
          void el.offsetWidth;
          cls(false, 'pm56-' + L.k + '-nomo');
          void el.offsetWidth;
          cls(false, 'pm56-' + L.k + '-closed');
        }
      }
      snapshot(L, el, rect);
    }
  }

  /* Corner nearest the trigger.  positionOverlays already writes --origin-x
     (trigger centre X relative to the menu box) and --origin-y ('0px' when the
     menu opened downward, '100%' when it opened upward); menus.css uses those
     directly as transform-origin.  All that is left is which way the closed
     box is nudged, and — for the one picker whose height changes — which edge
     stays put while it resizes. */
  function applyOrigin(el, rect, opening) {
    var oy = (el.style.getPropertyValue('--origin-y') || '').trim();
    var fromBottom = oy === '100%' || oy === '';
    overlayRoot.setAttribute('data-pm56-sprout', fromBottom ? 'b' : 't');

    /* Bottom-anchor only the picker that actually resizes, and only when it
       opened upward.  A downward menu is already anchored on the edge it
       sprouted from. Recomputed on open (and on resize), never on a filter —
       pinning it is the whole point. */
    if (!opening) return;
    if (el.classList.contains('model-menu') && fromBottom) {
      overlayRoot.style.setProperty('--pm56-bottom',
        Math.round(window.innerHeight - rect.bottom) + 'px');
      overlayRoot.classList.add('pm56-anchor-bottom');
    } else {
      clearAnchor();
    }
  }
  /* Pin the placement derived from the one truthful measurement for as long as
     the entrance runs. Every positionOverlays inside that window would be
     measuring a transformed box, and some of those renders emit no mutations at
     all, so there is nothing to react to -- the only reliable answer is to stop
     listening to them for 340ms. */
  function holdGeom(L, el, rect) {
    if (!rect || rect.width < 8 || rect.height < 8) return;
    if (L.id === 'side' && rect.left < 16 && rect.top < 16) return;
    var pre = '--pm56-' + L.k + 'hold-';
    overlayRoot.style.setProperty(pre + 'left', rect.left.toFixed(2) + 'px');
    overlayRoot.style.setProperty(pre + 'top', rect.top.toFixed(2) + 'px');
    overlayRoot.style.setProperty(pre + 'ox', (el.style.getPropertyValue('--origin-x') || (L.id === 'root' ? '50%' : '100%')).trim());
    overlayRoot.style.setProperty(pre + 'oy', (el.style.getPropertyValue('--origin-y') || (L.id === 'root' ? '100%' : '28%')).trim());
    cls(true, 'pm56-' + L.k + '-hold');
    clearTimeout(L.holdTimer);
    L.holdTimer = setTimeout(function () { releaseHold(L); }, HOLD_MS);
  }
  /* Releasing the hold has to WRITE THE HELD VALUES BACK, not just stop masking
     them. Masking alone left the bogus inline `top` that a mid-sprout
     positionOverlays had written sitting underneath, so the menu jumped to it
     the moment the mask came off -- measured 559.8 for a 238.1px box, i.e. a
     placement derived from the sprout's 1.049 overshoot. The held values are
     the ones computed from the single truthful measurement, so they become the
     inline values until the next legitimate positionOverlays, which by then is
     measuring an untransformed box. */
  function releaseHold(L) {
    clearTimeout(L.holdTimer);
    L.holdTimer = 0;
    if (overlayRoot.classList.contains('pm56-' + L.k + '-hold')) {
      var el = overlayRoot.querySelector(L.sel);
      var pre = '--pm56-' + L.k + 'hold-';
      if (el) {
        var lft = overlayRoot.style.getPropertyValue(pre + 'left');
        var tp = overlayRoot.style.getPropertyValue(pre + 'top');
        var anchored = L.id === 'root' && overlayRoot.classList.contains('pm56-anchor-bottom');
        if (lft) el.style.left = lft;
        if (tp && !anchored) el.style.top = tp;
        var ox = overlayRoot.style.getPropertyValue(pre + 'ox');
        var oy = overlayRoot.style.getPropertyValue(pre + 'oy');
        if (ox) el.style.setProperty('--origin-x', ox);
        if (oy) el.style.setProperty('--origin-y', oy);
      }
    }
    cls(false, 'pm56-' + L.k + '-hold');
  }

  function clearAnchor() {
    overlayRoot.classList.remove('pm56-anchor-bottom');
    overlayRoot.style.removeProperty('--pm56-bottom');
  }

  /* PMConcept7's `portalAnimateHeight` measures, locks, mutates, measures and
     springs.  Here app.js has already written the target height inline
     (`height:${modelMenuHeight()}px`) and menus.css owns the height spring, so
     the only missing half is the stretch that sells the resize as elastic. */
  var bounceTimers = { r: 0, s: 0 };
  function heightBounce(L, el) {
    var h = String(el.offsetHeight);
    var changed = h !== L.lastHeight;
    L.lastHeight = h;
    if (!changed || L.opening || reduced()) return;
    var name = 'pm56-' + L.k + '-bounce';
    overlayRoot.classList.remove(name);
    void el.offsetWidth;
    overlayRoot.classList.add(name);
    clearTimeout(bounceTimers[L.k]);
    bounceTimers[L.k] = setTimeout(function () {
      overlayRoot.classList.remove(name);
    }, BOUNCE_MS);
  }

  /* ---- close: re-materialise the departing menu outside the patch root ---- */

  function snapshot(L, el, rect) {
    var cs = getComputedStyle(el);
    var inlineH = parseFloat(el.style.height);
    var height = isFinite(inlineH) ? inlineH : rect.height;
    var top = rect.top;
    /* A bottom-anchored menu's inline `top` is whatever positionOverlays last
       computed from a mid-transition box; the truthful value is derived from
       the pinned bottom edge instead. */
    if (L.id === 'root' && overlayRoot.classList.contains('pm56-anchor-bottom')) {
      var b = parseFloat(getComputedStyle(overlayRoot).getPropertyValue('--pm56-bottom'));
      if (isFinite(b)) top = window.innerHeight - b - height;
    }
    var scrolls = [];
    var all = el.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) if (all[i].scrollTop) scrolls.push([i, all[i].scrollTop]);
    L.snap = {
      html: el.outerHTML,
      left: rect.left, top: top, width: rect.width, height: height,
      scrolls: scrolls,
      vars: {
        '--pm56-tx': cs.getPropertyValue('--pm56-tx'),
        '--pm56-ty': cs.getPropertyValue('--pm56-ty'),
        '--pm56-sx': cs.getPropertyValue('--pm56-sx'),
        '--pm56-sy': cs.getPropertyValue('--pm56-sy')
      }
    };
  }

  function closeLane(L) {
    L.el = null; L.sig = null; L.opening = false; L.lastHeight = '';
    cls(false, 'pm56-' + L.k + '-nomo');
    cls(false, 'pm56-' + L.k + '-hidden');
    cls(false, 'pm56-' + L.k + '-pin');
    cls(false, 'pm56-' + L.k + '-flat');
    cls(false, 'pm56-' + L.k + '-closed');
    cls(false, 'pm56-' + L.k + '-bounce');
    releaseHold(L);
    if (L.id === 'root') {
      overlayRoot.classList.remove('pm56-r-bounce');
      clearAnchor();
      overlayRoot.removeAttribute('data-pm56-sprout');
    }
    spawnGhost(L);
  }

  function spawnGhost(L) {
    dropGhost(L);
    if (reduced() || !L.snap) return;
    var snap = L.snap;
    L.snap = null;
    var tpl = document.createElement('template');
    tpl.innerHTML = snap.html;
    var g = tpl.content.firstElementChild;
    if (!g) return;

    /* Strip every hook that makes the clone addressable BEFORE it enters the
       document. It is a picture of a menu that is leaving, not a menu: nothing
       should be able to find it, hover it, or count it.
       This is not hypothetical -- the shipped audit does
       `openRootMenu('mode') / Escape / openRootMenu('mode')` and its
       `[data-submenu="deep-plan"]` locator resolved to TWO elements, because
       the outgoing clone still carried the same data attributes as the new
       menu. Classes stay, because they are what makes the ghost look like the
       menu it is replacing. */
    stripHooks(g);
    var kids = g.querySelectorAll('*');
    for (var s = 0; s < kids.length; s++) stripHooks(kids[s]);

    g.classList.add('pm56-menu-ghost');
    g.setAttribute('data-pm56-ghost', L.id);
    g.setAttribute('aria-hidden', 'true');
    g.style.left = snap.left + 'px';
    g.style.top = snap.top + 'px';
    g.style.width = snap.width + 'px';
    g.style.height = snap.height + 'px';
    for (var k in snap.vars) if (snap.vars[k]) g.style.setProperty(k, snap.vars[k].trim());

    document.body.appendChild(g);
    if (snap.scrolls.length) {
      var all = g.querySelectorAll('*');
      for (var i = 0; i < snap.scrolls.length; i++) {
        var n = all[snap.scrolls[i][0]];
        if (n) n.scrollTop = snap.scrolls[i][1];
      }
    }
    void g.offsetWidth;
    g.classList.add('pm56-collapsing');

    L.ghost = g;
    g.addEventListener('transitionend', function (ev) {
      if (ev.target !== g) return;
      if (ev.propertyName !== 'transform') return;
      dropGhost(L);
    });
    L.ghostTimer = setTimeout(function () { dropGhost(L); }, GHOST_MS);
  }

  function stripHooks(n) {
    if (n.id) n.removeAttribute('id');
    var at = n.attributes;
    for (var i = at.length - 1; i >= 0; i--) {
      var nm = at[i].name;
      if (nm.indexOf('data-') === 0 || nm === 'name' || nm === 'title' ||
          nm === 'aria-label' || nm === 'role' || nm === 'tabindex') {
        n.removeAttribute(nm);
      }
    }
  }

  function dropGhost(L) {
    clearTimeout(L.ghostTimer);
    L.ghostTimer = 0;
    if (L.ghost) {
      if (L.ghost.parentNode) L.ghost.parentNode.removeChild(L.ghost);
      L.ghost = null;
    }
  }

  if (overlayRoot && window.MutationObserver) {
    new MutationObserver(sync).observe(overlayRoot, { childList: true, subtree: true });
  }

  /* A resize repositions the menu through app.js's own resize handler, but
     only when the patch produces a structural change — a pure reposition emits
     no mutation records, so the pinned bottom edge would keep a stale
     viewport height.  This module's listener registers first (modules load
     before app.js), so it releases the anchor, lets positionOverlays run in
     the next frame, and re-pins one frame after that. */
  window.addEventListener('resize', function () {
    LANES.forEach(dropGhost);
    if (!overlayRoot.classList.contains('pm56-anchor-bottom')) return;
    clearAnchor();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var el = overlayRoot.querySelector(LANES[0].sel);
        if (!el) return;
        applyOrigin(el, el.getBoundingClientRect(), true);
      });
    });
  });

  /* ==================================================================
     B. Worktree control in the top bar
     ================================================================== */

  /* Driven from D.operational.worktrees (data.js:1871), whose ids are exactly
     the four values app.js's worktree menu offers, rather than from the bare
     state.worktree string.  The fallback keeps the control honest if a
     worktree is selected that the fixture does not describe: it says so
     instead of inventing a clean state. */
  function worktreeRecord(ctx) {
    var list = (ctx.D.operational && ctx.D.operational.worktrees) || [];
    var cur = ctx.state.worktree;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === cur || list[i].label === cur) return list[i];
    }
    return { id: cur, label: cur, state: 'unknown', stateLabel: 'State not reported',
             dirtyFiles: 0, ahead: 0, behind: 0, conflicts: null, note: '' };
  }

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  function worktreeTitle(w) {
    var lines = ['Worktree · ' + w.label];
    lines.push(w.stateLabel || w.state);
    if (w.state === 'bound-conflict' && w.conflicts && w.conflicts.length) {
      lines.push(plural(w.conflicts.length, 'conflicting file') + ': ' + w.conflicts.join(', '));
    }
    if (w.dirtyFiles) lines.push(plural(w.dirtyFiles, 'uncommitted file'));
    if (w.ahead || w.behind) lines.push(w.ahead + ' ahead · ' + w.behind + ' behind');
    if (w.state === 'unbound') lines.push('No checkout yet. Selecting it creates the worktree first.');
    if (w.path) lines.push(w.path);
    return lines.join('\n');
  }

  if (EXT && EXT.slot) {
    EXT.slot('headerExtras', function (ctx) {
      var w = worktreeRecord(ctx);
      /* data-k is mandatory here: .chat-header survives the 2s work tick, and
         an unkeyed node would be re-mounted — and re-animated — twice a
         second.  data-menu-anchor="worktree" must be unique in the document;
         menus.css hides the composer's copy until app.js drops it. */
      return '<button class="icon-button worktree-button" data-k="wtbtn"' +
             ' data-action="open-menu" data-menu="worktree" data-menu-anchor="worktree"' +
             ' data-wt-state="' + ctx.esc(w.state) + '"' +
             ' aria-label="' + ctx.esc('Worktree ' + w.label + ' — ' + (w.stateLabel || w.state)) + '"' +
             ' data-hover-key="worktree" data-hover-tip="' + ctx.esc(worktreeTitle(w)) + '">' +
             ctx.icon('branch', 14) +
             '<i class="wt-dot" aria-hidden="true"></i>' +
             '</button>';
    });
  }

  /* Small read-only surface so a second agent's harness can assert this
     module's state without reaching into the closure. */
  window.PM56_MENUS = {
    version: 1,
    reduced: reduced,
    lanes: function () {
      return LANES.map(function (L) {
        return { id: L.id, open: !!L.el, sig: L.sig, ghost: !!L.ghost };
      });
    },
    anchored: function () { return overlayRoot.classList.contains('pm56-anchor-bottom'); },
    sprout: function () { return overlayRoot.getAttribute('data-pm56-sprout'); },
    worktree: worktreeRecord
  };
})();
