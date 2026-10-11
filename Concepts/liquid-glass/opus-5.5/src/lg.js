/* Liquid Glass: the concept's behaviour (pm7-liquid-glass, Opus 5.5, 2026-10-11). See lg.css for the material.
 *
 * What it adds, only while the look is Glass and html[data-lg="on"]:
 *   plates   #lg-slab (the one live blur), #lg-paint (the painted frost), #lg-band (the frosted toolbar band),
 *            #lg-sidebar (the edge-to-edge sidebar), kept on the shell's own geometry by a ResizeObserver
 *   lenses   one .lg-lens per tab strip (page tabs, the rail's tab strips, the activity bar, Usage's navigation and
 *            range); it follows the chosen item with a liquid stretch and lenses the baked frost behind it
 *   light    the pointer is a light: --lg-mx/--lg-my on the surface under it; cards get a rim that catches it
 *   press    a gel squash and a glow from the press point that spills onto the neighbouring glass
 *   bloom    menus and popovers grow out of the control that opened them
 *   sweep    one soft band of light across the glass when Glass opens or the page changes
 *   recede   the glass dims while the window is not focused
 * Switches (attributes on <html>): data-lg on|off, data-lg-tier gpu|cpu (detected; ?lgtier= forces),
 * data-lg-clarity 0..4 (2 = default), data-lg-frost painted (the drag engine's carry frost), data-lg-rt, data-lg-hc.
 * URL: ?lg=off ?lgtier=cpu ?lgclarity=0..4 ?lgrt=1 ?lghc=1. Alt+Shift+L toggles. window.PM_LG is the test hook.
 */
(function () {
  'use strict';
  if (window.PM_LG) return;
  var root = document.documentElement;
  var q = new URLSearchParams(location.search);
  var MAG = 1.14;

  function isGlass() { return root.getAttribute('data-lg') === 'on' && /^glass/.test(root.getAttribute('data-theme') || ''); }
  function reduced() {
    return root.getAttribute('data-motion') === 'reduced' || root.getAttribute('data-reduced-motion') === '1' ||
      (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function el(tag, attrs) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); return e; }
  function visible(e) { if (!e || !e.isConnected) return false; var r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(e).visibility !== 'hidden'; }

  /* ---- switches ---------------------------------------------------------------------------------------------- */
  root.setAttribute('data-lg', q.get('lg') === 'off' ? 'off' : 'on');
  if (q.get('lgclarity')) root.setAttribute('data-lg-clarity', q.get('lgclarity'));
  if (q.get('lgrt') === '1') root.setAttribute('data-lg-rt', '');
  if (q.get('lghc') === '1') root.setAttribute('data-lg-hc', '');
  function detectTier() {
    try {
      var c = document.createElement('canvas'), g = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!g) return 'cpu';
      var x = g.getExtension('WEBGL_debug_renderer_info'), r = x ? String(g.getParameter(x.UNMASKED_RENDERER_WEBGL)) : '';
      var lose = g.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
      return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(r) ? 'cpu' : 'gpu';
    } catch (e) { return 'cpu'; }
  }
  var forcedTier = q.get('lgtier');
  root.setAttribute('data-lg-tier', forcedTier === 'cpu' || forcedTier === 'gpu' ? forcedTier : detectTier());
  /* a second opinion from frame time: a GPU that cannot hold 40 fps with the live blur takes the painted path */
  function frameCheck() {
    if (forcedTier || root.getAttribute('data-lg-tier') === 'cpu') return;
    var t = [], last = 0, n = 0;
    function f(ts) { if (last) t.push(ts - last); last = ts; if (++n < 40) requestAnimationFrame(f); else {
      t.sort(function (a, b) { return a - b; }); var med = t[t.length >> 1];
      root.setAttribute('data-lg-frame-ms', med.toFixed(1));
      if (med > 25 && isGlass()) root.setAttribute('data-lg-tier', 'cpu');
    } }
    requestAnimationFrame(f);
  }

  /* ---- plates ------------------------------------------------------------------------------------------------ */
  var slab, paint, band, side, sweep, shell;
  function ensurePlates() {
    shell = document.querySelector('.app-shell');
    if (!shell) return false;
    if (!slab || !slab.isConnected) {
      slab = el('div', { id: 'lg-slab', 'aria-hidden': 'true' }); paint = el('div', { id: 'lg-paint', 'aria-hidden': 'true' });
      var bg = document.getElementById('glass-bg');
      if (bg && bg.parentNode) { bg.parentNode.insertBefore(paint, bg.nextSibling); bg.parentNode.insertBefore(slab, bg.nextSibling); }
      else { document.body.insertBefore(paint, document.body.firstChild); document.body.insertBefore(slab, document.body.firstChild); }
    }
    if (!band || !band.isConnected) {
      band = el('div', { id: 'lg-band', class: 'lg-plate', 'aria-hidden': 'true' });
      side = el('div', { id: 'lg-sidebar', class: 'lg-plate', 'aria-hidden': 'true' });
      shell.insertBefore(side, shell.firstChild); shell.insertBefore(band, shell.firstChild);
    }
    if (!sweep || !sweep.isConnected) { sweep = el('div', { id: 'lg-sweep', 'aria-hidden': 'true' }); sweep.appendChild(el('i')); document.body.appendChild(sweep); }
    return true;
  }
  function layout() {
    if (!ensurePlates() || !isGlass()) return;
    var s = shell.getBoundingClientRect();
    var tb = document.querySelector('.title-bar'), sb = document.getElementById('pm7GlobalStatusBar');
    var lp = document.querySelector('.left-panel'), ab = document.getElementById('activityBar'), sp = document.getElementById('sidePanelSlot');
    var bandH = tb ? Math.round(tb.getBoundingClientRect().bottom - s.top + 3) : 52;
    band.style.cssText = 'left:0;top:0;right:0;height:' + bandH + 'px';
    var bottom = sb && visible(sb) ? Math.round(s.bottom - sb.getBoundingClientRect().top) : 0;
    var right = 0;
    if (sp && visible(sp)) right = sp.getBoundingClientRect().right;
    else if (ab && visible(ab)) right = ab.getBoundingClientRect().right;
    else if (lp) right = lp.getBoundingClientRect().right;
    right = Math.round(right - s.left + 4);
    side.style.cssText = 'left:0;top:' + bandH + 'px;bottom:' + bottom + 'px;width:' + right + 'px';
    var abw = ab && visible(ab) ? Math.round(ab.getBoundingClientRect().right - s.left + 4) : 0;
    side.style.setProperty('--lg-ab-w', (sp && visible(sp) ? abw : 0) + 'px');
    if (!(sp && visible(sp))) side.style.setProperty('--lg-ab-w', '-10px');
  }

  /* ---- lenses ------------------------------------------------------------------------------------------------ */
  var STRIPS = [
    { sel: 'nav.page-tabs', items: '.page-tab', inset: true },
    { sel: '#pmuRange', items: ':scope > button', inset: true },
    { sel: '#pmuNav', items: '.pmu-navbtn', solo: true },
    { sel: '#activityBar', items: '.icon[data-target]', solo: true, pick: currentRailIcon, box: function (i) { return i.querySelector('.symbol') || i; } },
    { sel: '#sidePanelSlot .pm-segtab', items: '.pm-segtab-item', inset: true, many: true },
  ];
  function currentRailIcon(strip) {
    var sp = document.getElementById('sidePanelSlot');
    if (!sp || !visible(sp)) return null;
    var v = sp.querySelector(':scope > .side-panel-view.active');
    var icon = v && strip.querySelector('.icon[data-target="' + v.id + '"]');
    strip.querySelectorAll('.icon[data-lg-current]').forEach(function (i) { if (i !== icon) i.removeAttribute('data-lg-current'); });
    if (icon) icon.setAttribute('data-lg-current', '');
    return icon;
  }
  var lenses = new Map();   /* strip -> { lens, rect } */
  function stripRect(strip, target) {
    var sr = strip.getBoundingClientRect(), r = target.getBoundingClientRect();
    return { x: r.left - sr.left - strip.clientLeft + strip.scrollLeft, y: r.top - sr.top - strip.clientTop + strip.scrollTop, w: r.width, h: r.height };
  }
  function lensImage(L) {   /* line the lensed frost up with the window, magnified about the lens's centre */
    var r = L.lens.getBoundingClientRect(); if (r.width < 1) return;
    var W = innerWidth, H = innerHeight, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var s = L.lens.style;
    s.setProperty('--lg-bw', (W * MAG).toFixed(1) + 'px'); s.setProperty('--lg-bh', (H * MAG).toFixed(1) + 'px');
    s.setProperty('--lg-bx', ((1 - MAG) * cx - r.left).toFixed(1) + 'px'); s.setProperty('--lg-by', ((1 - MAG) * cy - r.top).toFixed(1) + 'px');
  }
  function place(L, R) { var s = L.lens.style; s.left = R.x + 'px'; s.top = R.y + 'px'; s.width = R.w + 'px'; s.height = R.h + 'px'; L.rect = R; lensImage(L); }
  function liquid(L, A, B, vertical) {
    /* the leading edge runs ahead, the trailing edge follows, the body thins while stretched and wobbles once */
    if (L.anim) L.anim.cancel();
    var fwd = vertical ? B.y > A.y : B.x > A.x;
    function box(lead, trail, sq) {   /* lead/trail: 0..1 progress of the leading and trailing edges */
      var a0 = vertical ? A.y : A.x, a1 = a0 + (vertical ? A.h : A.w), b0 = vertical ? B.y : B.x, b1 = b0 + (vertical ? B.h : B.w);
      var lo, hi;
      if (fwd) { hi = a1 + (b1 - a1) * lead; lo = a0 + (b0 - a0) * trail; } else { lo = a0 + (b0 - a0) * lead; hi = a1 + (b1 - a1) * trail; }
      var cross0 = vertical ? A.x : A.y, crossS = vertical ? A.w : A.h, crossE = vertical ? B.w : B.h, crossB = vertical ? B.x : B.y;
      var cs = crossS + (crossE - crossS) * trail, cp = cross0 + (crossB - cross0) * trail;
      var thin = cs * (1 - sq), off = cp + (cs - thin) / 2;
      return vertical ? { left: off + 'px', width: thin + 'px', top: lo + 'px', height: (hi - lo) + 'px' }
                      : { top: off + 'px', height: thin + 'px', left: lo + 'px', width: (hi - lo) + 'px' };
    }
    var dist = Math.abs(vertical ? B.y - A.y : B.x - A.x), len = vertical ? A.h : A.w;
    var stretch = Math.min(0.16, 0.05 + dist / (len * 14));
    var frames = [
      Object.assign(box(0, 0, 0), { offset: 0 }),
      Object.assign(box(0.72, 0.18, stretch), { offset: 0.34 }),
      Object.assign(box(1.045, 0.80, stretch * 0.35), { offset: 0.62 }),
      Object.assign(box(0.99, 1.02, -0.04), { offset: 0.80 }),
      Object.assign(box(1, 1, 0), { offset: 1 }),
    ];
    var dur = Math.round(Math.min(620, 400 + dist * 0.55));
    place(L, B);
    L.anim = L.lens.animate(frames, { duration: dur, easing: 'cubic-bezier(.3,.7,.2,1)' });
    var t0 = performance.now();
    (function tick() { lensImage(L); if (performance.now() - t0 < dur + 20 && L.anim && L.anim.playState === 'running') requestAnimationFrame(tick); else lensImage(L); })();
    L.anim.onfinish = function () { L.anim = null; lensImage(L); };
  }
  function syncStrip(cfg, strip) {
    var L = lenses.get(strip);
    var target = cfg.pick ? cfg.pick(strip) : strip.querySelector(cfg.items + '.active');
    if (!L) {
      if (getComputedStyle(strip).position === 'static') strip.style.position = 'relative';
      var lens = el('i', { class: 'lg-lens', 'aria-hidden': 'true' }); if (cfg.solo) lens.setAttribute('data-lg-solo', '');
      strip.insertBefore(lens, strip.firstChild);
      L = { lens: lens, rect: null, anim: null }; lenses.set(strip, L);
    }
    if (!target || !visible(target) || !visible(strip)) { L.lens.style.opacity = '0'; L.rect = null; return; }
    var box = cfg.box ? cfg.box(target) : target;
    var R = stripRect(strip, box);
    L.lens.style.opacity = '';
    var prev = L.rect;
    if (!prev || reduced() || !isGlass()) {
      if (prev && reduced() && (prev.x !== R.x || prev.y !== R.y)) L.lens.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 120 });
      place(L, R); return;
    }
    if (Math.abs(prev.x - R.x) < 0.5 && Math.abs(prev.y - R.y) < 0.5 && Math.abs(prev.w - R.w) < 0.5 && Math.abs(prev.h - R.h) < 0.5) { lensImage(L); return; }
    var moved = Math.abs(prev.x - R.x) + Math.abs(prev.y - R.y);
    if (moved < 1) { place(L, R); return; }
    liquid(L, prev, R, Math.abs(prev.y - R.y) > Math.abs(prev.x - R.x));
  }
  var syncQueued = false;
  function rims() {   /* the edge ring on every card and on the chat column */
    document.querySelectorAll('.pmu-card, #chatPanel').forEach(function (c) {
      if (!c.querySelector(':scope > .lg-rim')) c.appendChild(el('i', { class: 'lg-rim', 'aria-hidden': 'true' }));
    });
  }
  function syncAll() {
    syncQueued = false;
    if (!isGlass()) return;
    layout();
    rims();
    STRIPS.forEach(function (cfg) {
      var list = cfg.many ? document.querySelectorAll(cfg.sel) : [document.querySelector(cfg.sel)];
      list.forEach(function (strip) { if (strip) syncStrip(cfg, strip); });
    });
  }
  function queueSync() { if (!syncQueued) { syncQueued = true; requestAnimationFrame(syncAll); } }

  /* ---- light ------------------------------------------------------------------------------------------------- */
  var LIT = '.pmu-card, #chatPanel, .pmu-ctlbtn, .pmu-iconbtn, #projectMenuBtn, #pm-home-more-btn, #themeSelect';
  var lastLit = null, ptr = null, ptrQueued = false;
  function setXY(e, x, y) { var r = e.getBoundingClientRect(); e.style.setProperty('--lg-mx', (x - r.left).toFixed(0) + 'px'); e.style.setProperty('--lg-my', (y - r.top).toFixed(0) + 'px'); }
  function onPtr() {
    ptrQueued = false; if (!ptr || !isGlass()) return;
    var x = ptr.x, y = ptr.y, t = ptr.t;
    var hit = t && t.closest ? t.closest(LIT) : null;
    if (hit !== lastLit) {
      if (lastLit) { lastLit.removeAttribute('data-lg-lit'); lastLit.style.removeProperty('--lg-mx'); lastLit.style.removeProperty('--lg-my'); }
      lastLit = hit;
      if (hit) hit.setAttribute('data-lg-lit', '');
    }
    /* on the CPU path only the controls and the lens follow the pointer: re-lighting the band, the sidebar or a whole
       card on every move repaints large areas, which the CPU cannot afford (tools/frametime.mjs) */
    var cpu = root.getAttribute('data-lg-tier') === 'cpu';
    if (hit && !(cpu && (hit.classList.contains('pmu-card') || hit.id === 'chatPanel'))) setXY(hit, x, y);
    if (!cpu) [band, side].forEach(function (p) { if (p && p.isConnected) setXY(p, x, y); });
    lenses.forEach(function (L, strip) { if (L.rect && strip.contains(t)) setXY(L.lens, x, y); else { L.lens.style.removeProperty('--lg-mx'); L.lens.style.removeProperty('--lg-my'); } });
  }
  document.addEventListener('pointermove', function (e) { ptr = { x: e.clientX, y: e.clientY, t: e.target }; if (!ptrQueued) { ptrQueued = true; requestAnimationFrame(onPtr); } }, { passive: true });
  document.addEventListener('pointerleave', function () { ptr = null; if (lastLit) lastLit.removeAttribute('data-lg-lit'); lastLit = null; }, { passive: true });

  /* ---- press ------------------------------------------------------------------------------------------------- */
  var PRESS = '.page-tab, #pmuRange > button, .pmu-navbtn, .pmu-ctlbtn, .pmu-iconbtn, #activityBar .icon, #sidePanelSlot .pm-segtab-item, ' +
    '#projectMenuBtn, #pm-home-more-btn, #themeSelect, .pmu-livebtn, .pmu-livechev, #sidePanelSlot .pm-minibtn, #sidePanelSlot .fm-tbtn';
  var lastPressed = null;
  document.addEventListener('pointerdown', function (e) {
    if (!isGlass() || e.button !== 0) return;
    var c = e.target.closest && e.target.closest(PRESS); if (!c) return;
    lastPressed = c;
    var r = c.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.6 + 40;
    if (!reduced()) c.setAttribute('data-lg-press', '');
    var g = el('i', { class: 'lg-glow', 'aria-hidden': 'true' }); document.body.appendChild(g);
    g.style.transform = 'translate(' + (e.clientX - 5) + 'px,' + (e.clientY - 5) + 'px)';
    var a = g.animate(reduced() ? [{ opacity: 0.7 }, { opacity: 0 }] : [
      { transform: 'translate(' + (e.clientX - 5) + 'px,' + (e.clientY - 5) + 'px) scale(1)', opacity: 0.95 },
      { transform: 'translate(' + (e.clientX - 5) + 'px,' + (e.clientY - 5) + 'px) scale(' + (size / 10).toFixed(1) + ')', opacity: 0 },
    ], { duration: reduced() ? 160 : 620, easing: 'cubic-bezier(.2,.7,.2,1)' });
    a.onfinish = function () { g.remove(); };
    function up() { c.removeAttribute('data-lg-press'); document.removeEventListener('pointerup', up, true); document.removeEventListener('pointercancel', up, true); }
    document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true);
  }, true);

  /* ---- bloom: menus grow out of their button ------------------------------------------------------------------- */
  function bloom(menu, anchor) {
    if (!isGlass() || !visible(menu) || menu.__lgBloom === menu.className + '|' + (anchor ? 1 : 0)) return;
    menu.__lgBloom = menu.className + '|' + (anchor ? 1 : 0);
    if (reduced()) { menu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 }); return; }
    var m = menu.getBoundingClientRect(), ox = m.width / 2, oy = 0;
    if (anchor) { var a = anchor.getBoundingClientRect(); ox = Math.max(0, Math.min(m.width, a.left + a.width / 2 - m.left)); oy = Math.max(-20, Math.min(m.height, a.top + a.height / 2 - m.top)); }
    var o = ox + 'px ' + oy + 'px';
    menu.animate([
      { transformOrigin: o, transform: 'scale(.46, .3)', opacity: 0, easing: 'cubic-bezier(.3,.9,.4,1)' },
      { transformOrigin: o, transform: 'scale(.74, .62)', opacity: 1, offset: 0.16, easing: 'cubic-bezier(.25,.8,.35,1)' },
      { transformOrigin: o, transform: 'scale(1.028, 1.04)', offset: 0.56, easing: 'cubic-bezier(.4,0,.4,1)' },
      { transformOrigin: o, transform: 'scale(.995, .992)', offset: 0.80, easing: 'cubic-bezier(.4,0,.4,1)' },
      { transformOrigin: o, transform: 'none', opacity: 1 },
    ], { duration: 480, easing: 'linear' });
    Array.prototype.slice.call(menu.children, 0, 24).forEach(function (k, i) {
      k.animate([{ opacity: 0, transform: 'translateY(-3px)' }, { opacity: 1, transform: 'none' }], { duration: 220, delay: 110 + i * 14, easing: 'ease-out', fill: 'backwards' });
    });
  }
  function scanMenus() {
    document.querySelectorAll('.pmu-pop.open').forEach(function (m) { bloom(m, document.querySelector('.pmu-menu-anchor-open')); });
    document.querySelectorAll('.pmr-menu-list, .pm6-chat-modellist').forEach(function (m) { if (visible(m)) bloom(m, lastPressed); else m.__lgBloom = null; });
    document.querySelectorAll('.pmu-pop:not(.open)').forEach(function (m) { m.__lgBloom = null; });
  }

  /* ---- sweep, recede ----------------------------------------------------------------------------------------- */
  function doSweep() {
    if (!isGlass() || reduced() || root.getAttribute('data-lg-tier') !== 'gpu' || !sweep) return;
    var b = sweep.firstChild;
    b.animate([{ transform: 'translateX(-120%) skewX(-12deg)', opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.7 }, { transform: 'translateX(380%) skewX(-12deg)', opacity: 0 }],
      { duration: 1250, easing: 'cubic-bezier(.45,.05,.3,1)' });
  }
  window.addEventListener('blur', function () { root.setAttribute('data-lg-inactive', ''); });
  window.addEventListener('focus', function () { root.removeAttribute('data-lg-inactive'); });

  /* ---- observers --------------------------------------------------------------------------------------------- */
  var lastTheme = root.getAttribute('data-theme'), lastPage = null, lastLg = root.getAttribute('data-lg');
  new MutationObserver(function (recs) {
    var theme = root.getAttribute('data-theme'), lg = root.getAttribute('data-lg');
    if (lg !== lastLg) { lastLg = lg; lenses.forEach(function (L) { L.rect = null; }); if (lg === 'on') setTimeout(doSweep, 80); }
    if (theme !== lastTheme) { var was = lastTheme; lastTheme = theme; lenses.forEach(function (L) { L.rect = null; }); if (/^glass/.test(theme) && !/^glass/.test(was || '')) setTimeout(doSweep, 120); }
    queueSync();
  }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-lg', 'data-lg-clarity', 'data-motion', 'data-reduced-motion'] });
  /* Strip and menu changes are handled in the observer itself (a microtask after the click's own work), so the lens
     starts moving and the menu starts blooming in the very next frame even when the click re-renders a whole board;
     anything else is batched to at most one pass per 120 ms. */
  var HOT = '.page-tab, #pmuRange > button, .pmu-navbtn, .pm-segtab-item, #activityBar .icon, .side-panel-view, .pmu-pop, .pmr-menu-list, .pm6-chat-modellist';
  var lazyTimer = 0;
  function lazySync() { if (!lazyTimer) lazyTimer = setTimeout(function () { lazyTimer = 0; queueSync(); }, 120); }
  var bodyObs = new MutationObserver(function (recs) {
    var hot = false, menus = false;
    for (var i = 0; i < recs.length && !hot; i++) {
      var t = recs[i].target;
      if (t.nodeType !== 1) continue;
      if (t.matches && t.matches(HOT)) { hot = true; menus = menus || /pmu-pop|menu|modellist/.test(String(t.className)); }
      else if (recs[i].addedNodes.length) {
        for (var j = 0; j < recs[i].addedNodes.length; j++) {
          var n = recs[i].addedNodes[j];
          if (n.nodeType === 1 && (n.matches(HOT) || (n.querySelector && n.querySelector('.pmr-menu-list, .pm6-chat-modellist')))) { hot = true; menus = true; break; }
        }
      }
    }
    var page = document.querySelector('.page-tabs .page-tab.active'); page = page && page.id;
    if (page !== lastPage) { if (lastPage) setTimeout(doSweep, 60); lastPage = page; }
    if (hot && isGlass()) { syncAll(); scanMenus(); } else lazySync();
  });
  function start() {
    ensurePlates();
    bodyObs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'aria-selected', 'hidden'] });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(queueSync);
      ['.app-shell', '.title-bar', '.left-panel', '#sidePanelSlot', '#activityBar', '#pm7GlobalStatusBar'].forEach(function (s) { var e = document.querySelector(s); if (e) ro.observe(e); });
    }
    window.addEventListener('resize', queueSync);
    demoControl();
    syncAll(); setTimeout(syncAll, 400); setTimeout(syncAll, 1500);
    setTimeout(frameCheck, 1200);
    if (isGlass()) setTimeout(doSweep, 600);
  }

  /* ---- the concept's own control (status bar) ---------------------------------------------------------------- */
  function demoControl() {
    var bar = document.getElementById('pm7GlobalStatusBar');
    if (!bar || document.getElementById('lg-demo-btn')) return;
    var groups = bar.querySelectorAll('.pm7-statusbar-group'), host = groups[groups.length - 1] || bar;
    var btn = el('button', { id: 'lg-demo-btn', class: 'pm7-statusitem', type: 'button', 'aria-haspopup': 'dialog', title: 'Liquid Glass concept (Alt+Shift+L turns it on or off)' });
    btn.textContent = 'Liquid Glass';
    host.insertBefore(btn, host.firstChild);
    var pop = el('div', { id: 'lg-demo-pop', role: 'dialog', 'aria-label': 'Liquid Glass concept' });
    function seg(name, attr, opts) {
      var row = el('div', { class: 'lg-row' }), lab = el('span'); lab.textContent = name; row.appendChild(lab);
      var s = el('div', { class: 'lg-seg', role: 'group', 'aria-label': name });
      opts.forEach(function (o) { var b = el('button', { type: 'button', 'data-v': o[0] }); b.textContent = o[1]; b.onclick = function () { o[2](); render(); }; s.appendChild(b); });
      row.appendChild(s); row.__opts = opts; row.__attr = attr; return row;
    }
    function attrSet(a, v) { return function () { if (v == null) root.removeAttribute(a); else root.setAttribute(a, v); }; }
    var rows = [
      seg('Liquid Glass', 'data-lg', [['on', 'On', attrSet('data-lg', 'on')], ['off', 'Today', attrSet('data-lg', 'off')]]),
      seg('Look', 'data-theme', [['glass-dark', 'Dark', function () { setLook('Glass Dark'); }], ['glass-light', 'Light', function () { setLook('Glass Light'); }]]),
      seg('Clarity', 'data-lg-clarity', [['0', 'Clear', attrSet('data-lg-clarity', '0')], ['1', '1', attrSet('data-lg-clarity', '1')], ['2', 'Balanced', attrSet('data-lg-clarity', null)], ['3', '3', attrSet('data-lg-clarity', '3')], ['4', 'Tinted', attrSet('data-lg-clarity', '4')]]),
      seg('Path', 'data-lg-tier', [['gpu', 'GPU blur', attrSet('data-lg-tier', 'gpu')], ['cpu', 'CPU paint', attrSet('data-lg-tier', 'cpu')]]),
      seg('Frost', 'data-lg-frost', [['live', 'Live', attrSet('data-lg-frost', null)], ['painted', 'Carry', attrSet('data-lg-frost', 'painted')]]),
      seg('Transparency', 'data-lg-rt', [['', 'Full', attrSet('data-lg-rt', null)], ['on', 'Reduced', attrSet('data-lg-rt', 'on')]]),
      seg('Contrast', 'data-lg-hc', [['', 'Normal', attrSet('data-lg-hc', null)], ['on', 'Increased', attrSet('data-lg-hc', 'on')]]),
      seg('Motion', 'data-motion', [['', 'Full', attrSet('data-motion', null)], ['reduced', 'Reduced', attrSet('data-motion', 'reduced')]]),
    ];
    var h = el('h3'); h.textContent = 'Liquid Glass concept'; pop.appendChild(h);
    var p = el('p'); p.textContent = 'Glass only. Compare with today, try the clarity slider, the CPU path and the accessibility modes.'; pop.appendChild(p);
    rows.forEach(function (r) { pop.appendChild(r); });
    var foot = el('div', { class: 'lg-foot' }); pop.appendChild(foot);
    document.body.appendChild(pop);
    function setLook(v) { try { window.PM12_KIMI.setSettingFromHost('general.visual.theme', v); } catch (e) { root.setAttribute('data-theme', v.toLowerCase().replace(' ', '-')); } }
    function render() {
      rows.forEach(function (r) {
        var cur = root.getAttribute(r.__attr); if (r.__attr === 'data-lg-clarity' && cur == null) cur = '2';
        if ((r.__attr === 'data-lg-rt' || r.__attr === 'data-lg-hc') && cur != null) cur = 'on';
        if (r.__attr === 'data-lg-frost' && cur == null) cur = 'live';
        r.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-v') || '') === (cur || ''))); });
      });
      foot.textContent = 'Path detected: ' + (root.getAttribute('data-lg-tier') || '?') + (root.getAttribute('data-lg-frame-ms') ? ' · median frame ' + root.getAttribute('data-lg-frame-ms') + ' ms' : '');
    }
    btn.onclick = function (e) { e.stopPropagation(); if (pop.hasAttribute('data-open')) pop.removeAttribute('data-open'); else { render(); pop.setAttribute('data-open', ''); bloom(pop, btn); } };
    document.addEventListener('pointerdown', function (e) { if (pop.hasAttribute('data-open') && !pop.contains(e.target) && e.target !== btn) pop.removeAttribute('data-open'); }, true);
    document.addEventListener('keydown', function (e) {
      if (e.altKey && e.shiftKey && (e.key === 'L' || e.key === 'l' || e.code === 'KeyL')) { root.setAttribute('data-lg', root.getAttribute('data-lg') === 'on' ? 'off' : 'on'); render(); e.preventDefault(); }
      if (e.key === 'Escape') pop.removeAttribute('data-open');
    });
  }

  window.PM_LG = {
    version: 'concept-2026-10-11',
    sync: syncAll,
    sweep: doSweep,
    set: function (o) { for (var k in o) { if (o[k] == null) root.removeAttribute(k); else root.setAttribute(k, o[k]); } syncAll(); },
    lenses: function () { var out = []; lenses.forEach(function (L, s) { out.push({ strip: s.id || s.className, rect: L.rect }); }); return out; },
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
