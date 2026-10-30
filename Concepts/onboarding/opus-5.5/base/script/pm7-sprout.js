/* PM6_SPROUT: the menu sprout, the one owner every menu opens and closes through (ACD-439, DR-057, DR-058; Jared,
   L8 B 2026-10-30: one sprout owner for every menu). Its class contract is base/style/pm7-sprout.css.
   Callers: the title-bar menus (pm6-js-panels.js), the base chat's pickers and the worktree menu (pm6-js-chat.js,
   script-038.js), Settings' popouts (src/settings/kit.js), the NieR theme menu (kit.d/23-nier-theme-menu.js), the rail
   (PMR.menu), Usage (PMU.menu), Home (PMW.menu) and the 5.6 Pro chat's menus (app.js). The 5.6 Pro standalone page
   reads this file and pm7-sprout.css too, so no menu draws a sprout of its own.

     open(el, afterOpen, anchor, opts)  shows el (inline display: opts.display, else data-portal-display, else block;
                                        display: false leaves it to the surface), pins the corner nearest the anchor
                                        and adds is-open. anchor: an element, a rect ({ left, top, width, height } or
                                        right / bottom) or a point ({ x, y }).
     close(el, done)                    is-closing; done once the collapse has run (el is display:none by then)
     isOpen(el)
     aim(el, anchor)                    pins the corner again (a flyout whose row moved)
     resize(el, mutate)                 runs mutate and springs the height from the old box to the new one, with the
                                        size bounce (the search filter, an option count, a drill-in)
     bounce(el)                         the size bounce alone, for a surface that sets its new height itself
     keep(el)                           for a renderer that rewrites class and style (the 5.6 Pro chat's patch): call
                                        it before the rewrite; the function it returns puts the sprout's state back
     reduced()                          Reduce motion: Settings' switch (html[data-motion="reduced"]) or the system's

   Timing comes from the element's own computed transitions (the contract, a look's part such as NieR's slice, and
   Animation speed, which rescales them), never from a constant, so a close always waits for the collapse it started.
   A close that begins inside a resize drag (body.pm-resizing) lands at once: no menu moves in a drag. Reopening a
   closing menu cancels that close; a close called again on a closing menu finishes both callers together. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var OWN_CLASS = ['is-open', 'is-closing', 'is-size-bounce'];
  var OWN_VARS = ['--pm6-sprout-ox', '--pm6-sprout-oy', '--pm6-sprout-tx', '--pm6-sprout-ty', '--pm6-sprout-sx', '--pm6-sprout-sy'];
  var states = typeof WeakMap === 'function' ? new WeakMap() : null;
  var gen = 0;

  function reduced() { return !!(root && root.getAttribute('data-motion') === 'reduced') || !!(mq && mq.matches); }
  function held() { return !!(doc.body && doc.body.classList.contains('pm-resizing')); }
  function isOpen(el) { return !!(el && el.classList.contains('is-open') && !el.classList.contains('is-closing')); }
  function state(el) {
    var s = states ? states.get(el) : el._pm6Sprout;
    if (!s) { s = { g: 0, dones: [], bounceT: 0 }; if (states) states.set(el, s); else el._pm6Sprout = s; }
    return s;
  }
  function ms(v) { v = String(v || '').trim(); var n = parseFloat(v); return isFinite(n) ? (/ms$/.test(v) ? n : n * 1000) : 0; }
  /* when the element's running transitions on these properties end (ms from now), from its computed style */
  function endOf(el, props) {
    var cs = getComputedStyle(el);
    var names = cs.transitionProperty.split(','), durs = cs.transitionDuration.split(','), dels = cs.transitionDelay.split(',');
    var end = 0;
    for (var i = 0; i < names.length; i++) {
      var n = names[i].trim();
      if (n !== 'all' && props.indexOf(n) < 0) continue;
      var d = ms(durs[i % durs.length]);
      if (d > 0) end = Math.max(end, d + ms(dels[i % dels.length]));
    }
    return end;
  }
  /* the anchor as a viewport box */
  function boxOf(a) {
    if (!a) return null;
    if (typeof a.getBoundingClientRect === 'function') return a.isConnected === false ? null : a.getBoundingClientRect();
    if (typeof a.left === 'number' && typeof a.top === 'number') {
      return { left: a.left, top: a.top, width: typeof a.width === 'number' ? a.width : (a.right || a.left) - a.left,
        height: typeof a.height === 'number' ? a.height : (a.bottom || a.top) - a.top };
    }
    if (typeof a.x === 'number' && typeof a.y === 'number') return { left: a.x, top: a.y, width: 0, height: 0 };
    return null;
  }
  function edge(el) { return el.classList.contains('pm6-chat-effort-popout-portal') || el.classList.contains('pm-sprout-edge'); }

  /* Pin the open/close sprout to the corner (or, for a side flyout, the edge) nearest the trigger, so the box grows out
     of and collapses into its trigger, not a fixed origin. */
  function aim(el, anchor) {
    var ar = el ? boxOf(anchor) : null;
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
    if (anchor) aim(el, anchor);
    void el.offsetHeight;
    if (!closing) el.style.transition = prevT;
    el.classList.add('is-open');
    if (afterOpen) afterOpen();
  }

  function close(el, onDone) {
    if (!el) { if (onDone) onDone(); return; }
    if (!el.classList.contains('is-open') && !el.classList.contains('is-closing') && el.style.display === 'none') {
      if (onDone) onDone();
      return;
    }
    var s = state(el), g = s.g = ++gen;
    if (onDone) s.dones.push(onDone);
    var hold = held(), prevT = el.style.transition;
    if (hold) el.style.transition = 'none';
    el.classList.remove('is-open', 'is-size-bounce');
    el.classList.add('is-closing');
    var t = 0;
    function finish(ev) {
      if (ev && (ev.target !== el || (ev.propertyName !== 'opacity' && ev.propertyName !== 'transform'))) return;
      el.removeEventListener('transitionend', finish);
      clearTimeout(t);
      if (hold) el.style.transition = prevT;
      if (s.g !== g) return;                        /* reopened, or closed again: that call finishes it */
      el.classList.remove('is-closing');
      el.style.display = 'none';
      el.style.height = '';
      el.style.overflow = '';
      var list = s.dones; s.dones = [];
      for (var i = 0; i < list.length; i++) list[i]();
    }
    var end = hold ? 0 : endOf(el, ['opacity', 'transform']);
    if (end) el.addEventListener('transitionend', finish);
    /* cover the corner-collapse close (and a missed transitionend) */
    t = setTimeout(finish, end ? end + 34 : 0);
  }

  function resize(el, mutateFn) {
    if (!el) { if (mutateFn) mutateFn(); return; }
    if (reduced() || !isOpen(el)) {
      if (mutateFn) mutateFn();
      return;
    }
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
      el.style.height = '';
      el.style.overflow = '';
      el.classList.remove('is-size-bounce');
      el.removeEventListener('transitionend', clearH);
    }
    el.addEventListener('transitionend', clearH);
    /* cover the height spring and its overshoot settle */
    setTimeout(clearH, endOf(el, ['height']) + 120);
  }

  function bounce(el) {
    if (!el || !isOpen(el) || reduced()) return;
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
    bounce: bounce,
    keep: keep,
    reduced: reduced
  };
})();
