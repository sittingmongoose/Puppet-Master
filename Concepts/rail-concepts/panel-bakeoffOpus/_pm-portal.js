/* PANEL BAKEOFF — portal plumbing
   =====================================================================
   Every Puppet Master menu component sits on this. It exists because the
   house menu (.pm6-tb-menu) is position:absolute, which is correct in a
   title bar and fatal inside .pm6-sp-content (overflow-y:auto). That is
   exactly why the two menus that live in the left panel today clip:

     .context-menu-mock  PMConcept7.html:4879  — child of the scrolling
        .file-tree, so showFileContextMenu (PM7:21922) carries a hard-coded
        Math.min(x, 180) as a workaround for the ~260px panel.
     .pm6-fm-rootdd      PMConcept7.html:14711 — also clipped, and it has no
        outside-click dismissal at all.

   place() merges the two placement implementations that are already correct
   in the app: the viewport clamp from openTermCtxMenu (PM7:18969) and the
   flip-on-overflow math from anchorPopoutAbove (PM7:38207).

   sprout() reproduces the house open/close spring verbatim — the six
   --pm6-sprout-* variables and the cubic-bezier(0.22,1.55,0.36,1) curve from
   setPopoutSprout (PM7:38105) / PM6_SPROUT (PM7:39305) — so new components
   move exactly like the rest of the app.

   THE THEMING TRAP: a portal is reparented to document.body, which is outside
   every themed stage. Theme tokens are bare [data-theme="x"] selectors, so a
   portal that does not carry the stage's data-theme renders with NO tokens at
   all. mount() copies the whole theme attribute set across. Do not skip it.

   Slint mapping: all of this becomes native PopupWindow (FinalGUISpec.md:28163).
   Slint has no built-in context menu, so a custom one is required regardless
   (F3-242, FinalGUISpec.md:17061). The portal/reposition machinery here is
   HTML scaffolding and is explicitly NOT ported.
   ===================================================================== */
(function (global) {
  'use strict';

  var PM = global.PM || (global.PM = {});
  var GAP = 6;          // gap between anchor and popup
  var EDGE = 8;         // minimum distance from the viewport edge
  var THEME_ATTRS = ['data-theme', 'data-glass-bg', 'data-density', 'data-motion', 'data-pm-fixes'];

  /* ------------------------------------------------------------- portal */
  var portal = {};

  /** Reparent el to document.body, inheriting the theme of the stage it came
   *  from. Stamps data-pm-portal so the fit checker's R2 rule knows this
   *  element is SUPPOSED to escape the panel's content box. */
  portal.mount = function (el, fromEl) {
    if (el.__pmPortalHome) return el;
    el.__pmPortalHome = { parent: el.parentNode, next: el.nextSibling };
    var stage = (fromEl || el).closest ? (fromEl || el).closest('.pm-stage') : null;
    if (stage) {
      THEME_ATTRS.forEach(function (a) {
        var v = stage.getAttribute(a);
        if (v != null) el.setAttribute(a, v);
      });
      el.__pmStage = stage;
    }
    el.setAttribute('data-pm-portal', '');
    el.style.position = 'fixed';
    document.body.appendChild(el);
    return el;
  };

  portal.unmount = function (el) {
    var home = el.__pmPortalHome;
    if (!home) return el;
    if (home.parent) home.parent.insertBefore(el, home.next);
    else el.remove();
    delete el.__pmPortalHome;
    delete el.__pmStage;
    el.removeAttribute('data-pm-portal');
    THEME_ATTRS.forEach(function (a) { el.removeAttribute(a); });
    el.style.position = '';
    return el;
  };

  /** Position el against an anchor element or a {x,y} point.
   *  opts: { prefer:'below'|'above'|'right'|'left'|'point', gap, matchWidth, minWidth }
   *  Always clamps to the viewport: a 240px panel cannot contain a useful
   *  menu, so escaping the panel is the whole point — escaping the WINDOW is
   *  not. Returns the resolved {left, top, flipped}. */
  portal.place = function (el, anchor, opts) {
    opts = opts || {};
    var gap = opts.gap == null ? GAP : opts.gap;
    var prev = el.style.visibility;
    el.style.visibility = 'hidden';
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.maxHeight = '';

    var isPoint = anchor && anchor.x != null && anchor.y != null;
    var r = isPoint
      ? { left: anchor.x, right: anchor.x, top: anchor.y, bottom: anchor.y, width: 0, height: 0 }
      : anchor.getBoundingClientRect();

    if (opts.matchWidth && !isPoint) {
      el.style.width = Math.max(r.width, opts.minWidth || 0) + 'px';
    } else if (opts.minWidth) {
      el.style.minWidth = opts.minWidth + 'px';
    }

    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;

    /* Height first: the available band decides whether we flip, and the
       popup's own scroller must be sized before we measure width. */
    var below = vh - r.bottom - gap - EDGE;
    var above = r.top - gap - EDGE;
    var w = el.offsetWidth, h = el.offsetHeight;
    var prefer = opts.prefer || 'below';
    var flipped = false;
    var left, top;

    if (prefer === 'right' || prefer === 'left') {
      var wantRight = prefer === 'right';
      left = wantRight ? r.right + gap : r.left - w - gap;
      if (wantRight && left + w > vw - EDGE) { left = r.left - w - gap; flipped = true; }
      if (!wantRight && left < EDGE) { left = r.right + gap; flipped = true; }
      top = r.top;
    } else {
      left = isPoint ? r.left : r.left;
      var goAbove = (prefer === 'above');
      if (!goAbove && h > below && above > below) { goAbove = true; flipped = true; }
      if (goAbove && h > above && below >= above) { goAbove = false; flipped = true; }
      var band = goAbove ? above : below;
      if (h > band) el.style.maxHeight = Math.max(120, band) + 'px';
      h = el.offsetHeight;
      top = goAbove ? r.top - h - gap : r.bottom + gap;
    }

    /* The openTermCtxMenu clamp (PM7:18985) in both axes. */
    if (left + w > vw - EDGE) left = vw - w - EDGE;
    if (left < EDGE) left = EDGE;
    if (top + h > vh - EDGE) top = Math.max(EDGE, vh - h - EDGE);
    if (top < EDGE) top = EDGE;

    el.style.left = Math.round(left) + 'px';
    el.style.top = Math.round(top) + 'px';
    el.style.visibility = prev || '';
    return { left: left, top: top, flipped: flipped };
  };

  /** Dismissal that is stricter than the app's. openTermCtxMenu listens only
   *  to a bubbling click, so it survives a right-click elsewhere. This covers
   *  capture-phase pointerdown outside, Escape, ancestor scroll, window blur,
   *  and resize. Returns a detach function. */
  portal.dismissOn = function (el, onDismiss) {
    function outside(e) {
      if (el.contains(e.target)) return;
      if (el.__pmAnchor && el.__pmAnchor.contains && el.__pmAnchor.contains(e.target)) return;
      fire('outside');
    }
    function key(e) {
      if (e.key === 'Escape') { e.stopPropagation(); fire('escape'); }
    }
    function away() { fire('scroll'); }
    function fire(why) { detach(); onDismiss(why); }
    function detach() {
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('keydown', key, true);
      window.removeEventListener('blur', away);
      window.removeEventListener('resize', away);
      document.removeEventListener('scroll', away, true);
    }
    /* next tick, so the click that opened it does not immediately close it */
    setTimeout(function () {
      document.addEventListener('pointerdown', outside, true);
      document.addEventListener('keydown', key, true);
      window.addEventListener('blur', away);
      window.addEventListener('resize', away);
      document.addEventListener('scroll', away, true);
    }, 0);
    return detach;
  };

  /* -------------------------------------------------------------- sprout
     Verbatim contract with the app: six CSS variables + the same spring. */
  var sprout = {};

  sprout.set = function (el, anchorEl) {
    var ox = '50%', oy = '0%', tx = '0px', ty = '-8px', sx = 0.72, sy = 0.48;
    if (anchorEl && anchorEl.getBoundingClientRect) {
      var a = anchorEl.getBoundingClientRect();
      var m = el.getBoundingClientRect();
      if (m.width) {
        var cx = ((a.left + a.width / 2) - m.left) / m.width;
        ox = Math.max(0, Math.min(1, cx)) * 100 + '%';
      }
      oy = (a.top < m.top) ? '0%' : '100%';
      ty = (a.top < m.top) ? '-8px' : '8px';
    }
    el.style.setProperty('--pm6-sprout-ox', ox);
    el.style.setProperty('--pm6-sprout-oy', oy);
    el.style.setProperty('--pm6-sprout-tx', tx);
    el.style.setProperty('--pm6-sprout-ty', ty);
    el.style.setProperty('--pm6-sprout-sx', sx);
    el.style.setProperty('--pm6-sprout-sy', sy);
  };

  sprout.open = function (el, anchorEl) {
    el.classList.remove('is-closing');
    sprout.set(el, anchorEl);
    /* force a frame so the transition actually runs from the collapsed state */
    void el.offsetWidth;
    el.classList.add('is-open');
  };

  sprout.close = function (el, done) {
    if (!el.classList.contains('is-open')) { if (done) done(); return; }
    el.classList.remove('is-open');
    el.classList.add('is-closing');
    var fired = false;
    function end() {
      if (fired) return;
      fired = true;
      el.classList.remove('is-closing');
      el.removeEventListener('transitionend', end);
      if (done) done();
    }
    el.addEventListener('transitionend', end);
    setTimeout(end, 320);   /* safety: reduced-motion kills the transition */
  };

  /* ---------------------------------------------------------------- a11y */
  var a11y = {};

  a11y.focusables = function (root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])'),
      function (n) { return !n.hasAttribute('disabled') && n.offsetParent !== null; });
  };

  a11y.trapFocus = function (root) {
    function key(e) {
      if (e.key !== 'Tab') return;
      var f = a11y.focusables(root);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    root.addEventListener('keydown', key);
    return function () { root.removeEventListener('keydown', key); };
  };

  /** Roving focus over a list. Items matching `sel` get arrow/Home/End/
   *  type-ahead, per FinalGUISpec section 13.3: every list, table and tree
   *  supports Up/Down, Enter, Escape, Home/End, and type-ahead. */
  a11y.roving = function (root, sel, opts) {
    opts = opts || {};
    var buf = '', bufAt = 0;
    function items() {
      return Array.prototype.filter.call(root.querySelectorAll(sel), function (n) {
        return n.getAttribute('aria-hidden') !== 'true' && n.offsetParent !== null;
      });
    }
    function move(list, from, delta) {
      if (!list.length) return;
      var i = from < 0 ? (delta > 0 ? 0 : list.length - 1) : from + delta;
      if (i < 0) i = list.length - 1;
      if (i >= list.length) i = 0;
      focus(list[i]);
    }
    function focus(node) {
      if (!node) return;
      if (opts.activeDescendant) {
        items().forEach(function (n) { n.classList.remove('is-active'); });
        node.classList.add('is-active');
        node.id = node.id || ('pm-opt-' + Math.round(performance.now() * 1000) % 1e9);
        opts.activeDescendant.setAttribute('aria-activedescendant', node.id);
        if (node.scrollIntoView) node.scrollIntoView({ block: 'nearest' });
      } else {
        node.focus();
      }
    }
    root.addEventListener('keydown', function (e) {
      var list = items();
      var cur = opts.activeDescendant
        ? list.indexOf(root.querySelector(sel + '.is-active'))
        : list.indexOf(document.activeElement);
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); move(list, cur, 1); break;
        case 'ArrowUp':   e.preventDefault(); move(list, cur, -1); break;
        case 'Home':      e.preventDefault(); focus(list[0]); break;
        case 'End':       e.preventDefault(); focus(list[list.length - 1]); break;
        case 'PageDown':  e.preventDefault(); focus(list[Math.min(list.length - 1, (cur < 0 ? 0 : cur) + 10)]); break;
        case 'PageUp':    e.preventDefault(); focus(list[Math.max(0, (cur < 0 ? 0 : cur) - 10)]); break;
        default:
          if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
            var now = Date.now();
            buf = (now - bufAt < 500) ? buf + e.key : e.key;
            bufAt = now;
            var q = buf.toLowerCase();
            for (var i = 0; i < list.length; i++) {
              var t = (list[i].textContent || '').trim().toLowerCase();
              if (t.indexOf(q) === 0) { focus(list[i]); break; }
            }
          }
      }
    });
    return { items: items, focus: focus };
  };

  PM.portal = portal;
  PM.sprout = sprout;
  PM.a11y = a11y;
})(window);
