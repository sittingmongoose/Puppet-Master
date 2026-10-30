/* PM6_SPROUT: the menu sprout, the one owner every menu opens and closes through (ACD-439, DR-057, DR-058, DR-079;
   Jared, L8 B 2026-10-30: one sprout owner for every menu). Its class contract is base/style/pm7-sprout.css.
   Callers: the title-bar menus and search pop (pm6-js-panels.js), the base chat's pickers and the worktree menu
   (pm6-js-chat.js, script-038.js), the side panels' menus and the File Manager's context menu (PMMenu,
   pm6-js-cozy-shelves.js), Settings' popouts (src/settings/kit.js), the NieR theme menu (kit.d/23-nier-theme-menu.js),
   the notification inbox (src/js/19-notify.js), the rail (PMR.menu), Usage (PMU.menu), Home (PMW.menu) and the 5.6 Pro
   chat's menus (app.js). The 5.6 Pro standalone page reads this file and pm7-sprout.css too, so no menu draws a sprout
   of its own.

     open(el, afterOpen, anchor, opts)  shows el and adds is-open. Display: opts.display, else data-portal-display,
                                        else block; display: false leaves it to the surface (and clears a display:none
                                        this owner left). anchor: an element, a rect ({ left, top, width, height } or
                                        right / bottom) or a point ({ x, y }); a hidden element counts as none.
                                        The corner the box grows from (its origin, closed nudge and closed scale):
                                          opts.origin 'corner'   (default) the corner nearest the anchor, snapped
                                          opts.origin 'trigger'  the anchor's centre across the edge facing it (Home,
                                                                 Usage, the chat's menus, the inbox)
                                          opts.origin { ox, oy, tx, ty, sx, sy }  the surface's own values
                                          no anchor and no origin object: the surface's CSS values stand
                                        opts.shown holds the entrance until frames come on time (PM_START_ON_SHOWN)
     close(el, done, opts)              is-closing; done once the whole collapse has run (its last transition), with
                                        el display:none by then; opts.instant lands it at once
     isOpen(el)
     aim(el, anchor, origin)            pins the corner again (a flyout whose row moved)
     resize(el, mutate)                 runs mutate and springs the height from the old box to the new one, with the
                                        size bounce (the search filter, an option count, a drill-in, a list that grew)
     morph(el, from, to, opts)          for a surface that places itself (Home's plate): the box moves from one geometry
                                        to another ({ left, top, width, height }, px). A height-only change is the
                                        contract's height spring with the size bounce (resize's motion, and none where a
                                        look has no height spring); a change of width or place (a level drilled into)
                                        takes opts.shape { duration, easing }, the surface's own level timing. Returns
                                        the Animation, or null when nothing moves
     bounce(el)                         the size bounce alone, for a surface that sets its new height itself
     keep(el)                           for a renderer that rewrites class and style (the 5.6 Pro chat's patch): call
                                        it before the rewrite; the function it returns puts the sprout's state back
     reduced()                          Reduce motion: Settings' switch (html[data-motion="reduced"]) or the system's

   Timing comes from the element's own running transitions (the contract, a look's part such as NieR's slice, and
   Animation speed, which rescales their durations and delays), never from a constant: a close finishes when the last
   of them has ended, so the collapse always runs to its end, with a bounded fallback for a transition that never
   reports. A close that begins inside a resize drag (body.pm-resizing) lands at once, and the contract holds every
   consumer still while a drag is under way. Reopening a closing menu cancels that close; a close called again on a
   closing menu finishes both callers together. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var OWN_CLASS = ['is-open', 'is-closing', 'is-size-bounce'];
  var OWN_VARS = ['--pm6-sprout-ox', '--pm6-sprout-oy', '--pm6-sprout-tx', '--pm6-sprout-ty', '--pm6-sprout-sx', '--pm6-sprout-sy'];
  var CLOSING = { opacity: 1, transform: 1, scale: 1, translate: 1, visibility: 1 };
  var states = typeof WeakMap === 'function' ? new WeakMap() : null;
  var gen = 0;

  function reduced() { return !!(root && root.getAttribute('data-motion') === 'reduced') || !!(mq && mq.matches); }
  function held() { return !!(doc.body && doc.body.classList.contains('pm-resizing')); }
  function isOpen(el) { return !!(el && el.classList.contains('is-open') && !el.classList.contains('is-closing')); }
  function state(el) {
    var s = states ? states.get(el) : el._pm6Sprout;
    if (!s) { s = { g: 0, dones: [], bounceT: 0, hg: 0 }; if (states) states.set(el, s); else el._pm6Sprout = s; }
    return s;
  }
  function ms(v) { v = String(v || '').trim(); var n = parseFloat(v); return isFinite(n) ? (/ms$/.test(v) ? n : n * 1000) : 0; }
  /* when the element's transitions on these properties end (ms from now), from its computed style */
  function endOf(el, props) {
    var cs = getComputedStyle(el);
    var names = cs.transitionProperty.split(','), durs = cs.transitionDuration.split(','), dels = cs.transitionDelay.split(',');
    var end = 0;
    for (var i = 0; i < names.length; i++) {
      var n = names[i].trim();
      if (n !== 'all' && !props[n]) continue;
      var d = ms(durs[i % durs.length]), l = ms(dels[i % dels.length]);
      if (d > 0 || l > 0) end = Math.max(end, d + l);
    }
    return end;
  }
  /* the anchor as a viewport box; an element that is not drawn (hidden, display:none) is no anchor */
  function boxOf(a) {
    if (!a) return null;
    if (typeof a.getBoundingClientRect === 'function') {
      if (a.isConnected === false) return null;
      var r = a.getBoundingClientRect();
      return r.width || r.height ? r : null;
    }
    if (typeof a.left === 'number' && typeof a.top === 'number') {
      return { left: a.left, top: a.top, width: typeof a.width === 'number' ? a.width : (a.right || a.left) - a.left,
        height: typeof a.height === 'number' ? a.height : (a.bottom || a.top) - a.top };
    }
    if (typeof a.x === 'number' && typeof a.y === 'number') return { left: a.x, top: a.y, width: 0, height: 0 };
    return null;
  }
  function edge(el) { return el.classList.contains('pm6-chat-effort-popout-portal') || el.classList.contains('pm-sprout-edge'); }
  function put(el, o) {
    var keys = ['ox', 'oy', 'tx', 'ty', 'sx', 'sy'];
    for (var i = 0; i < keys.length; i++) if (o[keys[i]] != null) el.style.setProperty('--pm6-sprout-' + keys[i], String(o[keys[i]]));
  }

  /* Pin the open/close sprout to where the box grows from: by default the corner (or, for a side flyout, the edge)
     nearest the trigger, so the box grows out of and collapses into its trigger, not a fixed origin. */
  function aim(el, anchor, origin) {
    if (!el) return;
    if (origin && typeof origin === 'object') {
      put(el, origin);
      if (origin.mark) el.setAttribute('data-sprout', origin.mark);
      return;
    }
    var ar = boxOf(anchor);
    if (!ar) return;
    /* neutralize closed-state scale so we measure the real layout box */
    var prevTf = el.style.transform;
    el.style.transform = 'none';
    void el.offsetWidth;
    var pr = el.getBoundingClientRect();
    el.style.transform = prevTf;
    if (!pr.width || !pr.height) return;
    var ax = ar.left + ar.width / 2;
    var ay = ar.top + ar.height / 2;
    if (origin === 'trigger' && !edge(el)) {
      /* the trigger's centre across the edge that faces it (Home, Usage, the chat's menus, the inbox) */
      var below = ay <= (pr.top + pr.bottom) / 2;
      var tox = Math.max(18, Math.min(pr.width - 18, ax - pr.left));
      put(el, { ox: Math.round(tox * 100) / 100 + 'px', oy: below ? '0%' : '100%', tx: '0px', ty: below ? '-10px' : '10px', sx: '0.72', sy: '0.48' });
      el.setAttribute('data-sprout', (below ? 't' : 'b') + (tox < pr.width / 2 ? 'l' : 'r'));
      return;
    }
    if (edge(el)) {
      /* effort / side flyouts: sprout from the edge facing the parent row */
      var fromLeft = ((pr.left + pr.right) / 2) >= ax;
      var yPct = ((ay - pr.top) / pr.height) * 100;
      yPct = Math.max(10, Math.min(90, yPct));
      el.style.setProperty('--pm6-sprout-ox', fromLeft ? '0%' : '100%');
      el.style.setProperty('--pm6-sprout-oy', yPct.toFixed(1) + '%');
      el.style.setProperty('--pm6-sprout-tx', fromLeft ? '-10px' : '10px');
      el.style.setProperty('--pm6-sprout-ty', '0px');
      el.style.setProperty('--pm6-sprout-sx', '0.48');
      el.style.setProperty('--pm6-sprout-sy', '0.72');
      el.setAttribute('data-sprout', fromLeft ? 'l' : 'r');
      return;
    }
    /* vertical popouts: snap to the corner nearest the trigger center */
    var ox = ((ax - pr.left) / pr.width) * 100;
    var oy = ((ay - pr.top) / pr.height) * 100;
    var snapX = ox < 50 ? 12 : 88;
    var snapY = oy < 50 ? 8 : 100;
    if (ay >= pr.bottom - 2) snapY = 100;
    else if (ay <= pr.top + 2) snapY = 0;
    if (ax <= pr.left + 2) snapX = 8;
    else if (ax >= pr.right - 2) snapX = 92;
    var fromBottom = snapY >= 50;
    var fromLeftC = snapX < 50;
    el.style.setProperty('--pm6-sprout-ox', snapX + '%');
    el.style.setProperty('--pm6-sprout-oy', snapY + '%');
    el.style.setProperty('--pm6-sprout-tx', '0px');
    el.style.setProperty('--pm6-sprout-ty', fromBottom ? '10px' : '-10px');
    el.style.setProperty('--pm6-sprout-sx', '0.72');
    el.style.setProperty('--pm6-sprout-sy', '0.48');
    el.setAttribute('data-sprout', (fromBottom ? 'b' : 't') + (fromLeftC ? 'l' : 'r'));
  }

  function open(el, afterOpen, anchor, opts) {
    if (!el) return;
    opts = opts || {};
    var s = state(el);
    s.g = ++gen;
    s.dones = [];                                   /* a close still running is cancelled, and its callback with it */
    var closing = el.classList.contains('is-closing');
    el.classList.remove('is-closing');
    /* A box already drawn closed (a surface that measured it in place, or a renderer that inserted it) takes its new
       corner with transitions off, so the entrance starts from that corner and not from where the old values were
       heading. A closing box reverses from wherever it has got to. */
    var prevT = el.style.transition;
    if (!closing) el.style.transition = 'none';
    if (opts.display !== false) el.style.display = opts.display || el.getAttribute('data-portal-display') || 'block';
    else if (el.style.display === 'none') el.style.display = '';
    if (anchor || (opts.origin && typeof opts.origin === 'object')) aim(el, anchor, opts.origin);
    void el.offsetHeight;
    if (!closing) el.style.transition = prevT;
    el.classList.add('is-open');
    /* opts.shown: a surface whose first frame is long (the inbox: its list built and, in Glass, its blur rastered) has
       its entrance held at the start until frames come on time (PM_START_ON_SHOWN, src/js/11-motion-start.js), so the
       sprout plays where it is seen instead of running out behind that frame */
    if (opts.shown && typeof window.PM_START_ON_SHOWN === 'function') {
      window.PM_START_ON_SHOWN(function () {
        return el.classList.contains('is-open') ? el.getAnimations().filter(function (a) { return !!a.transitionProperty; }) : [];
      }, { start: 'commit' });
    }
    if (afterOpen) afterOpen();
  }

  function close(el, onDone, opts) {
    if (!el) { if (onDone) onDone(); return; }
    opts = opts || {};
    if (!el.classList.contains('is-open') && !el.classList.contains('is-closing') && el.style.display === 'none') {
      if (onDone) onDone();
      return;
    }
    var s = state(el), g = s.g = ++gen;
    if (onDone) s.dones.push(onDone);
    var still = opts.instant || held(), prevT = el.style.transition;
    if (still) el.style.transition = 'none';
    el.classList.remove('is-open', 'is-size-bounce');
    el.classList.add('is-closing');
    var t = 0, ended = false;
    function finish() {
      if (ended) return;
      ended = true;
      clearTimeout(t);
      if (still) el.style.transition = prevT;
      if (s.g !== g) return;                        /* reopened, or closed again: that call finishes it */
      el.classList.remove('is-closing');
      el.style.display = 'none';
      el.style.height = '';
      el.style.overflow = '';
      var list = s.dones; s.dones = [];
      for (var i = 0; i < list.length; i++) list[i]();
    }
    if (still) { finish(); return; }
    /* the collapse is every transition the closing state started on the box (its scale, fade, late fade and the
       visibility deadline): the close ends when the last of them has, whatever Animation speed or a look made of them */
    var runs = typeof el.getAnimations === 'function' ? el.getAnimations().filter(function (a) {
      return a.transitionProperty && CLOSING[a.transitionProperty];
    }) : [];
    if (!runs.length) { t = setTimeout(finish, 0); return; }
    var left = runs.length;
    function one() { if (--left <= 0) finish(); }
    for (var i = 0; i < runs.length; i++) runs[i].finished.then(one, one);
    /* bounded fallback: a transition that never reports */
    t = setTimeout(finish, Math.min(2000, endOf(el, CLOSING) + 50));
  }

  function resize(el, mutateFn) {
    if (!el) { if (mutateFn) mutateFn(); return; }
    if (reduced() || held() || !isOpen(el)) {
      if (mutateFn) mutateFn();
      return;
    }
    var s = state(el), hg = ++s.hg;
    var startH = el.getBoundingClientRect().height;
    el.style.height = startH + 'px';
    el.style.overflow = 'hidden';
    if (mutateFn) mutateFn();
    el.style.height = 'auto';
    var endH = el.getBoundingClientRect().height; /* respects max-height */
    if (Math.abs(endH - startH) < 0.5) {
      el.style.height = '';
      el.style.overflow = '';
      return;
    }
    el.style.height = startH + 'px';
    void el.offsetHeight;
    /* CSS height spring (y>1) overshoots past endH then settles: the search bounce */
    el.style.height = endH + 'px';
    el.classList.remove('is-size-bounce');
    void el.offsetWidth;
    el.classList.add('is-size-bounce');
    var finished = false;
    function clearH(ev) {
      if (finished) return;
      if (ev && ev.target !== el) return;
      if (ev && ev.propertyName && ev.propertyName !== 'height') return;
      finished = true;
      el.removeEventListener('transitionend', clearH);
      if (s.hg !== hg) return;                      /* a later resize owns the height now */
      el.style.height = '';
      el.style.overflow = '';
      el.classList.remove('is-size-bounce');
    }
    el.addEventListener('transitionend', clearH);
    /* cover the height spring and its overshoot settle */
    setTimeout(clearH, endOf(el, { height: 1 }) + 120);
  }

  function morph(el, a, b, opts) {
    if (!el || !a || !b || reduced() || held() || !isOpen(el) || typeof el.animate !== 'function') return null;
    opts = opts || {};
    var k0 = {}, k1 = {}, moved = false, shape = false, props = ['height', 'width', 'left', 'top'];
    for (var i = 0; i < props.length; i++) {
      var p = props[i];
      if (Math.abs(a[p] - b[p]) > 2) { k0[p] = a[p] + 'px'; k1[p] = b[p] + 'px'; moved = true; if (p !== 'height' && p !== 'top') shape = true; }
    }
    if (!moved) return null;
    if (shape && opts.shape) return el.animate([k0, k1], { duration: opts.shape.duration || 220, easing: opts.shape.easing || 'ease' });
    /* the height spring, as resize's: where the look's contract has none (NieR's Slice part) the box just takes its size */
    if (!endOf(el, { height: 1 })) return null;
    var anim = el.animate([k0, k1], { duration: 340, easing: 'cubic-bezier(0.22, 1.72, 0.36, 1)' });
    bounce(el);
    return anim;
  }

  function bounce(el) {
    if (!el || !isOpen(el) || reduced() || held()) return;
    var s = state(el);
    el.classList.remove('is-size-bounce');
    void el.offsetWidth;
    el.classList.add('is-size-bounce');
    clearTimeout(s.bounceT);
    s.bounceT = setTimeout(function () { el.classList.remove('is-size-bounce'); }, (edge(el) ? 420 : 380) + 40);
  }

  function keep(el) {
    var cls = [], vars = [], i;
    for (i = 0; i < OWN_CLASS.length; i++) if (el.classList.contains(OWN_CLASS[i])) cls.push(OWN_CLASS[i]);
    for (i = 0; i < OWN_VARS.length; i++) { var v = el.style.getPropertyValue(OWN_VARS[i]); if (v) vars.push([OWN_VARS[i], v]); }
    var disp = el.style.display, mark = el.getAttribute('data-sprout');
    return function () {
      for (var j = 0; j < cls.length; j++) el.classList.add(cls[j]);
      for (var k = 0; k < vars.length; k++) el.style.setProperty(vars[k][0], vars[k][1]);
      if (disp) el.style.display = disp;
      if (mark != null) el.setAttribute('data-sprout', mark);
    };
  }

  window.PM6_SPROUT = {
    open: open,
    close: close,
    isOpen: isOpen,
    aim: aim,
    resize: resize,
    morph: morph,
    bounce: bounce,
    keep: keep,
    reduced: reduced
  };
})();
