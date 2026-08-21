/* concept-05-directory-take-1.js — fable · 05 Waypoint (A1 Directory / Take 1)
   Crisp, quiet, confident directory-first Settings.
   - Home: large search hero, one compact attention block, two-column grid of
     twelve destination cards, subdued utility footer.
   - Card-to-workspace expansion: the pressed card journeys into the domain
     header (one measured clone; reduced motion = instant). Everything else is
     a restrained directional slide.
   - Domain pages: destination rows (subgroups + managers); an in-stage left
     settings rail appears at domain level for cross-domain jumps.
   - Managers: integrated roster + detailed form workspace (list left, form
     right at wide widths; push at narrow).
   - Copy: focused review flow — centered transaction panel over a dimmed
     workspace with a step header.
   Consumes _shared2 (PM2.*) exactly as contracted in CONTRACT2.md. All
   navigation goes through PM2.route.go. Plain ES5-style JS, no build step.
   Slint notes inline where a technique is web-only. No emoji anywhere. */
(function () {
  'use strict';

  var CID = 'c05-waypoint';

  var store = null;
  var stage = null;
  var rootEl = null, topEl = null, railEl = null, mainEl = null,
      overlayEl = null, menuLayer = null, morphLayer = null;

  /* ---------------- state machines (explicit; Slint-portable) ----------- */

  /* Current surface. kind: home|dest|sub|manager|all|search|copy.
     copy keeps `under` = the surface the dim panel floats over. */
  var view = { kind: 'home' };

  var ui = {
    advOpen: {},          /* "cat/sub" -> true (advanced disclosure) */
    detailOpen: {},       /* row/detail drawer keys -> true */
    tableMore: {},        /* section key -> extra pages shown */
    attnMore: false,      /* attention list expanded */
    mgrPane: 'list',      /* narrow manager push: 'list' | 'detail' */
    hostPick: {},         /* setup-steps host choice per section key */
    rowError: null,       /* {id, msg} transient inline validation error */
    pendingFocus: null,   /* settingId whose control should regain focus */
    scrollMem: {},        /* route path -> scrollTop (restore on return) */
    all: { q: '', cat: '', type: '', tier: '', changed: '', state: '' },
    copy: null,           /* copy transaction state (built on entry) */
    lastOp: null,         /* latest op payload for the op strip */
    opHideTimer: 0,
    dropdown: { open: false, host: null, results: null, active: -1, query: '' }
  };

  var allCache = { epoch: -1, rows: null };
  var allEpoch = 0;
  var pendingMorph = null;   /* {cat, rect} captured on card press */
  var renderQueued = false;

  /* ---------------- tiny helpers ---------------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function ico(name) { return '<i data-ico="' + esc(name) + '"></i>'; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object') ? x : {}; }
  function byId(id) { return document.getElementById(id); }
  function fmtAgo(when) { return window.PM2.util.fmtAgo(when); }
  function fmtInt(n) { return window.PM2.util.fmtInt(n); }

  function motionOn() {
    var html = document.documentElement;
    if (html.getAttribute('data-motion') === 'reduced') return false;
    if (html.getAttribute('data-reduced-motion') === '1') return false;
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    } catch (e) { /* media queries optional */ }
    return true;
  }

  function scenario() { return String(store.get('scenario') || 'baseline'); }
  function fixtures() { return arr(store.get('fixtures')); }
  function hasFx(id) { return fixtures().indexOf(id) >= 0; }
  function firstRun() { return scenario() === 'first-run'; }

  /* ---------------- inventory indexes ---------------- */

  var invById = {}, catList = [], catById = {}, subTitleOf = {};

  function buildIndexes() {
    var inv = obj(window.PM2_INVENTORY);
    catList = arr(inv.categories);
    catList.forEach(function (c) {
      catById[c.id] = c;
      var m = {};
      arr(c.subgroups).forEach(function (g) { m[g.id] = g; });
      subTitleOf[c.id] = m;
    });
    arr(inv.settings).forEach(function (s) { invById[s.id] = s; });
  }
  function catTitle(cat) { return catById[cat] ? catById[cat].title : 'Settings'; }
  function subOf(cat, sub) { return (subTitleOf[cat] || {})[sub] || null; }
  function subTitle(cat, sub) { var g = subOf(cat, sub); return g ? g.title : (sub || ''); }

  function managerDef(id) { return window.PM2.managers.get(id); }

  /* ---------------- route helpers ---------------- */

  function destHome() { return { route: 'home' }; }

  function viewRouteObj(v) {
    if (v.kind === 'dest') return { route: 'dest', cat: v.cat };
    if (v.kind === 'sub') return { route: 'dest', cat: v.cat, sub: v.sub };
    if (v.kind === 'manager') return { route: 'manager', managerId: v.managerId, objectId: v.objectId || null, tab: v.tab || null };
    if (v.kind === 'all') return { route: 'all' };
    if (v.kind === 'search') return { route: 'search', query: v.query || '' };
    if (v.kind === 'copy') return { route: 'copy' };
    return { route: 'home' };
  }

  function routeKeyOf(v) {
    var r = viewRouteObj(v);
    return [r.route, r.cat, r.sub, r.managerId, r.objectId, r.tab, r.query]
      .filter(function (x) { return x != null && x !== ''; }).join('/');
  }

  function depthOf(v) {
    if (v.kind === 'home') return 0;
    if (v.kind === 'dest' || v.kind === 'all' || v.kind === 'search') return 1;
    if (v.kind === 'sub') return 2;
    if (v.kind === 'manager') return v.objectId ? 3 : 2;
    return 1;
  }

  /* One coherent level out (also the Esc ladder's outermost rung). */
  function parentOf(v) {
    if (v.kind === 'sub') return { route: 'dest', cat: v.cat };
    if (v.kind === 'dest') return destHome();
    if (v.kind === 'manager') {
      if (v.objectId) return { route: 'manager', managerId: v.managerId };
      var def = managerDef(v.managerId);
      return def ? { route: 'dest', cat: def.cat } : destHome();
    }
    if (v.kind === 'all' || v.kind === 'search') return destHome();
    if (v.kind === 'copy') return v.under ? viewRouteObj(v.under) : destHome();
    return null;
  }

  function parentName(v) {
    if (v.kind === 'sub') return catTitle(v.cat);
    if (v.kind === 'dest' || v.kind === 'all' || v.kind === 'search') return 'Settings Home';
    if (v.kind === 'manager') {
      if (v.objectId) { var d = managerDef(v.managerId); return d ? d.title : 'Manager'; }
      var def = managerDef(v.managerId);
      return def ? catTitle(def.cat) : 'Settings Home';
    }
    return 'Settings Home';
  }

  function go(dest, opts) { window.PM2.route.go(dest, opts); }

  /* ---------------- boot ---------------- */

  function boot() {
    stage = byId('pmStage');
    window.PMShell.init({ concept: CID, onWidthChange: updateLayout });
    store = window.PM2.store.init(CID);
    buildIndexes();
    try { window.PM2.states.mountDrawer(store); } catch (e) { /* drawer optional */ }

    buildRoot();

    /* Store subscriptions (page-level singletons; managers themselves hold
       no subscriptions — their view models are cached data invalidated by
       the registry, so leaving a manager tears nothing else down). */
    store.on('scenario', function (p) {
      /* Shared-module workaround: pm2-states applies URL scenarios with
         persist:false, so store.get('scenario'|'fixtures') would stay stale
         and store.attention() / fixture checks would answer for the wrong
         world. Mirror the active state into the session cache (no
         persistence — _setSession is the router's own ephemeral channel). */
      if (p && p.id && typeof store._setSession === 'function') {
        try {
          if (store.get('scenario') !== p.id) store._setSession('scenario', p.id);
          store._setSession('fixtures', arr(p.fixtures));
        } catch (e) { /* session mirror is best-effort */ }
      }
      allEpoch += 1; ui.attnMore = false; queueRender();
    });
    store.on('fixtures', function () { allEpoch += 1; queueRender(); });
    store.on('value', function () { allEpoch += 1; queueRender(); });
    store.on('stress', function () { allEpoch += 1; queueRender(); });
    store.on('copy', function () { queueRender(); });
    store.on('op', onOpEvent);
    store.on('receipt', function (r) {
      if (r && r.message) window.PMShell.toast(String(r.message).slice(0, 160));
    });

    window.addEventListener('resize', updateLayout);
    document.addEventListener('keydown', onGlobalKey, true);

    window.PM2.route.bind({ open: open });
  }

  /* ---------------- root scaffold ---------------- */

  function buildRoot() {
    stage.innerHTML =
      '<div class="c05" id="c05Root">' +
      '  <header class="c05-top" id="c05Top"></header>' +
      '  <div class="c05-body">' +
      '    <nav class="c05-rail" id="c05Rail" aria-label="Settings sections" hidden></nav>' +
      '    <div class="c05-main" id="c05Main"></div>' +
      '  </div>' +
      '  <div class="c05-overlay" id="c05Overlay" hidden></div>' +
      '  <div class="c05-menu-layer" id="c05MenuLayer"></div>' +
      '  <div class="c05-morph-layer" id="c05MorphLayer" aria-hidden="true"></div>' +
      '</div>';
    rootEl = byId('c05Root');
    topEl = byId('c05Top');
    railEl = byId('c05Rail');
    mainEl = byId('c05Main');
    overlayEl = byId('c05Overlay');
    menuLayer = byId('c05MenuLayer');
    morphLayer = byId('c05MorphLayer');

    rootEl.addEventListener('click', onRootClick);
    rootEl.addEventListener('change', onRootChange);
    rootEl.addEventListener('input', onRootInput);
    rootEl.addEventListener('keydown', onRootKey);
    updateLayout();
  }

  function updateLayout() {
    if (!rootEl || !stage) return;
    var w = stage.clientWidth || window.innerWidth;
    rootEl.classList.toggle('is-narrow', w < 920);
    rootEl.classList.toggle('is-tight', w >= 920 && w < 1200);
    /* Wide steps (audit fix — dead desert at 1700/2200/2500). Home used to be
       capped at 1080px with no breakpoint above 1200, so 34/49/56% of the pane
       was empty background while the destination grid stayed 2-up and half the
       twelve destinations sat below the fold. The first step deliberately
       starts at 1300 rather than at the 1080 cap: the 1208-wide stage a 1280
       window produces is the audited reference layout (2-up, 535px cards, 11%
       margin) and stays untouched, while the band that would otherwise stretch
       to 28% empty just under 1500 is picked up. */
    rootEl.classList.toggle('is-wide', w >= 1300 && w < 1960);
    rootEl.classList.toggle('is-ultra', w >= 1960);
    syncTopFit();
  }

  /* One fitting pass for the topbar, always measured from the fully
     untruncated state so the two clamps can never chase each other:
     clear the Back clamp, let the crumb trail fit itself, then hand the
     Back label whatever shortfall is genuinely left over. */
  function syncTopFit() {
    clearBackFit();
    syncCrumbTight();
    syncBackFit();
  }

  /* Crumbs hold their full text by default (min-width: max-content,
     flex-shrink 0), so nothing is ever sub-pixel-shaved into a spurious
     ellipsis. Only when the trail measurably overflows its box do we set
     .is-crumb-tight and hand out integer max-widths: the longest ancestor
     crumbs give up space first, the current page crumb only as a last
     resort. Always measured from the untruncated state, so no flapping. */
  function syncCrumbTight() {
    if (!rootEl || !topEl) return;
    var nav = topEl.querySelector('.c05-crumbs');
    rootEl.classList.remove('is-crumb-tight');
    if (!nav) return;
    nav.style.minWidth = '';
    var crumbEls = Array.prototype.slice.call(nav.querySelectorAll('.c05-crumb'));
    crumbEls.forEach(function (el) { el.style.maxWidth = ''; });
    var last = nav.lastElementChild;
    if (!crumbEls.length || !last) return;
    var navR = nav.getBoundingClientRect();
    if (navR.width < 1) return; /* hidden (narrow layouts) */
    /* Fractional measurements throughout: the engine's max-content for the
       trail under-measures its children by a couple of px (fractional
       advance accumulation), and integer scrollWidth rounding fabricates
       phantom overflow, so neither can be trusted here. */
    var need = last.getBoundingClientRect().right - navR.left + 1;
    if (need <= navR.width + 0.5) return; /* every crumb already fits */
    /* How much width the row can still surrender: leftover spacer plus
       whatever the topbar search field can shrink before its floor. */
    var spacer = topEl.querySelector('.c05-top-flex');
    var slack = spacer ? Math.max(0, spacer.getBoundingClientRect().width - 8) : 0;
    var search = topEl.querySelector('.c05-search-top');
    if (search) {
      var sMin = parseFloat(getComputedStyle(search).minWidth) || 0;
      slack += Math.max(0, search.getBoundingClientRect().width - sMin);
    }
    if (slack >= need - navR.width - 0.5) {
      /* the row can afford the full trail: pin the trail wide enough and
         let flex reclaim the difference from the spacer / search field */
      nav.style.minWidth = Math.ceil(need) + 'px';
      return;
    }
    /* genuinely tight: pin the trail at everything the row can give, then
       truncate the longest ancestors first; the current page crumb only
       gives space as a last resort */
    var avail = Math.floor(navR.width + slack);
    nav.style.minWidth = avail + 'px';
    rootEl.classList.add('is-crumb-tight');
    var over = need - avail + 1;
    var items = crumbEls.map(function (el) {
      return { el: el, w: el.getBoundingClientRect().width, here: el.classList.contains('is-here') };
    });
    var order = items.filter(function (it) { return !it.here; })
      .sort(function (a, b) { return b.w - a.w; })
      .concat(items.filter(function (it) { return it.here; }));
    order.forEach(function (it) {
      if (over <= 0) return;
      var floorW = it.here ? 72 : 44;
      var give = Math.min(over, Math.max(0, it.w - floorW));
      if (give > 0) {
        it.el.style.maxWidth = Math.floor(it.w - give) + 'px';
        over -= give;
      }
    });
  }

  function clearBackFit() {
    if (rootEl) rootEl.classList.remove('is-back-tight');
    if (!topEl) return;
    var label = topEl.querySelector('.c05-back-label');
    if (label) label.style.maxWidth = '';
  }

  /* The Back label ellipsizes only when the header has actually run out of
     room. At rest it holds the whole destination name (min-width:max-content),
     so "Back to AI Brains & Providers" renders in full wherever the space
     exists — including the narrow layouts, where the old fixed 120px clamp
     cut it short with ~180px of empty header beside it. The row's own
     yielders go first (the search field shrinks to its 170px floor and the
     flexible spacer collapses); if the last element still overhangs the
     content edge after that, take exactly the overhang from the label, never
     below a floor that keeps "Back to" plus the leading word readable. The
     button's title attribute carries the full text in that case. */
  function syncBackFit() {
    if (!rootEl || !topEl) return;
    var label = topEl.querySelector('.c05-back-label');
    var last = topEl.lastElementChild;
    if (!label || !last) return;
    var topR = topEl.getBoundingClientRect();
    if (topR.width < 1) return; /* not laid out yet */
    var padRight = parseFloat(getComputedStyle(topEl).paddingRight) || 0;
    /* Fractional measurement: the spacer's flex-grow pins the trailing
       element exactly on the content edge whenever the row fits, so any
       real overhang shows up here as a positive number. */
    var over = last.getBoundingClientRect().right - (topR.right - padRight);
    if (over <= 0.5) return; /* the full label fits — leave it alone */
    var w = label.getBoundingClientRect().width;
    var give = Math.min(over + 1, Math.max(0, w - 96));
    if (give <= 0.5) return; /* already at the floor; honest overflow beats a stub */
    rootEl.classList.add('is-back-tight');
    label.style.maxWidth = Math.floor(w - give) + 'px';
  }

  function queueRender() {
    if (renderQueued) return;
    renderQueued = true;
    window.requestAnimationFrame(function () {
      renderQueued = false;
      render(null);
    });
  }

  /* ---------------- open(dest): the concept router ---------------- */

  function open(dest) {
    var d = obj(dest);
    var kind = String(d.route || 'home');

    /* remember scroll for the surface we are leaving */
    if (mainEl && view && view.kind !== 'copy') {
      ui.scrollMem[routeKeyOf(view)] = mainEl.scrollTop;
    }

    var landing = null;
    if (d.focus) landing = landingFromFocus(d.focus);

    var prev = view;
    var next = null;

    if (kind === 'home') next = { kind: 'home' };
    else if (kind === 'all') next = { kind: 'all' };
    else if (kind === 'search') next = { kind: 'search', query: String(d.query || '') };
    else if (kind === 'copy') {
      var under = (prev && prev.kind !== 'copy') ? prev : (prev && prev.under) || { kind: 'home' };
      next = { kind: 'copy', under: under };
      if (!ui.copy) resetCopy();
    } else if (kind === 'dest') {
      var cat = d.cat && catById[d.cat] ? d.cat : null;
      if (!cat) next = { kind: 'home' };
      else if (d.sub && subOf(cat, d.sub)) next = { kind: 'sub', cat: cat, sub: d.sub };
      else next = { kind: 'dest', cat: cat };
    } else if (kind === 'setting') {
      var s = invById[d.settingId];
      if (s) {
        next = { kind: 'sub', cat: s.cat, sub: s.sub };
        landing = landing || { settingId: s.id };
      } else {
        /* unknown address: explain, never dead-end — closest matches shown.
           Try the whole phrase, then the leaf words, then single words. */
        var raw = String(d.settingId || '');
        var words = raw.replace(/[._-]+/g, ' ').trim();
        var leaf = raw.split('.').pop().replace(/[._-]+/g, ' ').trim();
        var tries = [words, leaf].concat(leaf.split(/\s+/).sort(function (a, b) { return b.length - a.length; }));
        var pick = words;
        for (var ti = 0; ti < tries.length; ti++) {
          var probeQ = tries[ti];
          if (!probeQ) continue;
          var probe = null;
          try { probe = window.PM2.search.query(probeQ, { limit: 1 }); } catch (e) { probe = null; }
          if (probe && probe.total > 0) { pick = probeQ; break; }
        }
        next = { kind: 'search', query: pick, missing: raw };
      }
    } else if (kind === 'manager') {
      var def = managerDef(d.managerId);
      if (def) {
        next = { kind: 'manager', managerId: def.id, objectId: d.objectId || null, tab: d.tab || null };
        if (d.sectionId) landing = landing || { itemId: d.sectionId };
        else if (d.objectId) {
          /* non-paged managers address objects as in-document items */
          var vm0 = def.model(store);
          if (!(vm0 && vm0.pages && vm0.pages[d.objectId])) {
            next.objectId = null;
            landing = landing || { itemId: d.objectId };
          }
        }
      } else next = { kind: 'home' };
    } else next = { kind: 'home' };

    /* advanced rows: open the disclosure before rendering the landing */
    if (landing && landing.settingId) {
      var rec = invById[landing.settingId];
      if (rec && rec.tier !== 'simple') ui.advOpen[rec.cat + '/' + rec.sub] = true;
      if (next.kind === 'sub' && rec) { next.cat = rec.cat; next.sub = rec.sub; }
    }

    var dir = 0;
    if (prev && next.kind !== 'copy' && prev.kind !== 'copy') {
      var dp = depthOf(next) - depthOf(prev);
      dir = dp > 0 ? 1 : (dp < 0 ? -1 : 0);
    }

    ui.mgrPane = (next.kind === 'manager' && next.objectId) ? 'detail' : 'list';
    ui.rowError = null;
    closeDropdown();
    closeMenu();

    view = next;
    render({ dir: dir, landing: landing, restoreScroll: !landing });
    window.PMShell.status(statusLine());
    return null;
  }

  function landingFromFocus(focus) {
    var f = String(focus || '');
    if (!f) return null;
    if (/^[smoawduh]:/.test(f)) {
      var r = null;
      try { r = window.PM2.search.resolveRid(f); } catch (e) { r = null; }
      if (r && r.dest) {
        var d = r.dest;
        var spec = { rid: f };
        if (r.availability) { spec.availability = r.availability; spec.label = r.label; }
        if (d.settingId) { spec.settingId = d.settingId; return spec; }
        if (d.sectionId) { spec.itemId = d.sectionId; return spec; }
        if (d.objectId) { spec.objectId = d.objectId; return spec; }
        if (d.managerId) { spec.managerId = d.managerId; return spec; }
        return spec.availability ? spec : null;
      }
      return null;
    }
    if (invById[f]) return { settingId: f };
    return { itemId: f };
  }

  function statusLine() {
    var parts = ['Settings'];
    if (view.kind === 'dest') parts.push(catTitle(view.cat));
    else if (view.kind === 'sub') { parts.push(catTitle(view.cat)); parts.push(subTitle(view.cat, view.sub)); }
    else if (view.kind === 'manager') {
      var def = managerDef(view.managerId);
      if (def) { parts.push(catTitle(def.cat)); parts.push(def.title); }
      if (view.objectId) parts.push(objectTitle() || view.objectId);
    }
    else if (view.kind === 'all') parts.push('All Settings');
    else if (view.kind === 'copy') parts.push('Copy Settings');
    else if (view.kind === 'search') parts.push('Search');
    return parts.join(' / ');
  }

  function objectTitle() {
    if (!(view.kind === 'manager' && view.objectId)) return null;
    var def = managerDef(view.managerId);
    if (!def) return null;
    var vm = def.model(store);
    var page = vm && vm.pages ? vm.pages[view.objectId] : null;
    return page ? page.title : null;
  }

  /* ---------------- render pipeline ---------------- */

  function render(opts) {
    var o = obj(opts);
    var keepScroll = !o.restoreScroll && !o.landing && !o.dir ? mainEl.scrollTop : null;
    renderTop();
    renderRail();

    var base = (view.kind === 'copy') ? view.under : view;
    var html = '';
    if (base.kind === 'home') html = homeHtml();
    else if (base.kind === 'dest') html = domainHtml(base.cat);
    else if (base.kind === 'sub') html = subHtml(base.cat, base.sub);
    else if (base.kind === 'manager') html = managerHtml(base.managerId, base.objectId, base.tab);
    else if (base.kind === 'all') html = allHtml();
    else if (base.kind === 'search') html = searchPageHtml(base.query, base.missing);

    mainEl.className = 'c05-main';
    if (o.dir === 1 && motionOn()) mainEl.classList.add('c05-enter-fwd');
    else if (o.dir === -1 && motionOn()) mainEl.classList.add('c05-enter-back');
    mainEl.innerHTML = html;

    renderOverlay();
    window.PMIcons.hydrate(rootEl);

    if (base.kind === 'all') mountAllViewport();
    if (base.kind === 'home') {
      var hero = byId('c05HeroSearch');
      if (hero) wireSearchField(hero, byId('c05HeroDrop'));
    }
    if (base.kind === 'search') {
      var spi = byId('c05SearchPageInput');
      if (spi) wireSearchField(spi, byId('c05SearchPageDrop'));
    }

    if (o.restoreScroll) {
      var mem = ui.scrollMem[routeKeyOf(view)];
      if (typeof mem === 'number') mainEl.scrollTop = mem;
      else mainEl.scrollTop = 0;
    } else if (keepScroll != null) {
      /* state-driven re-render: hold the reader's place */
      mainEl.scrollTop = keepScroll;
    }

    if (o.landing) performLanding(o.landing);
    runMorph();
    restorePendingFocus();
  }

  function restorePendingFocus() {
    if (!ui.pendingFocus) return;
    var id = ui.pendingFocus;
    ui.pendingFocus = null;
    var row = mainEl.querySelector('[data-setting-id="' + cssEsc(id) + '"]');
    if (!row) return;
    var ctl = row.querySelector('.c05-ctl button, .c05-ctl input, .c05-ctl select');
    if (ctl) ctl.focus({ preventScroll: true });
  }

  function cssEsc(s) {
    if (window.CSS && CSS.escape) return CSS.escape(String(s));
    return String(s).replace(/[^a-zA-Z0-9_.-]/g, '\\$&');
  }

  /* ---------------- calm locator (pm2-located) ---------------- */

  var locateTimers = [];
  function performLanding(spec) {
    var el = null;
    if (spec.settingId) el = mainEl.querySelector('[data-setting-id="' + cssEsc(spec.settingId) + '"]');
    if (!el && spec.itemId) {
      el = mainEl.querySelector('[data-section="' + cssEsc(spec.itemId) + '"]') ||
           mainEl.querySelector('[data-item-id="' + cssEsc(spec.itemId) + '"]') ||
           mainEl.querySelector('[data-object-id="' + cssEsc(spec.itemId) + '"]');
    }
    if (!el && spec.objectId) el = mainEl.querySelector('[data-object-id="' + cssEsc(spec.objectId) + '"]');
    if (!el && spec.managerId) el = mainEl.querySelector('[data-manager="' + cssEsc(spec.managerId) + '"]');
    if (!el && view.kind === 'all' && spec.settingId) { landAllRow(spec.settingId); return; }
    if (!el) {
      /* the addressed thing has no row of its own on this surface (e.g. an
         unavailable capability inside a reserved owner shell): land on the
         surface head so the reveal is still exact and visible */
      el = mainEl.querySelector('.c05-mgr-head') || mainEl.querySelector('.c05-sub-head') ||
           mainEl.querySelector('.c05-dom-head-card');
    }
    if (!el) return;

    /* availability reason travels with the focus rid: say it at the landing */
    if (spec.availability) {
      var note = document.createElement('div');
      note.className = 'c05-avail-note';
      note.setAttribute('data-avail-note', '1');
      note.innerHTML = '<span class="c05-avail-word">Not available</span><span>' +
        (spec.label ? '<strong>' + esc(spec.label) + '</strong> — ' : '') + esc(spec.availability) + '</span>';
      el.parentNode.insertBefore(note, el.nextSibling);
    }

    locateTimers.forEach(clearTimeout);
    locateTimers = [];
    var old = mainEl.querySelectorAll('.pm2-located');
    for (var i = 0; i < old.length; i++) {
      old[i].classList.remove('pm2-located', 'c05-located-fade');
    }

    try { el.scrollIntoView({ block: 'center', behavior: motionOn() ? 'smooth' : 'auto' }); }
    catch (e) { el.scrollIntoView(); }
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    el.classList.add('pm2-located');
    /* decay: add the fade class (transition collapses to a single opacity
       step under any reduced-motion kill switch), then drop both classes.
       Settle by timeout — never by transitionend (kill switches). */
    locateTimers.push(setTimeout(function () { el.classList.add('c05-located-fade'); }, 1600));
    locateTimers.push(setTimeout(function () {
      el.classList.remove('pm2-located', 'c05-located-fade');
    }, 2600));
  }

  /* ---------------- card transfer morph ---------------- */

  function runMorph() {
    if (!pendingMorph) return;
    var m = pendingMorph;
    pendingMorph = null;
    if (!motionOn()) return;
    if (!(view.kind === 'dest' && view.cat === m.cat)) return;
    var target = mainEl.querySelector('.c05-dom-head-card');
    if (!target) return;
    var tr = target.getBoundingClientRect();
    if (!tr.width) return;

    var clone = document.createElement('div');
    clone.className = 'c05-morph';
    clone.innerHTML = '<span class="c05-morph-ico">' + ico(m.icon) + '</span><span class="c05-morph-title">' + esc(m.title) + '</span>';
    clone.style.left = m.rect.left + 'px';
    clone.style.top = m.rect.top + 'px';
    clone.style.width = m.rect.width + 'px';
    clone.style.height = m.rect.height + 'px';
    morphLayer.appendChild(clone);
    window.PMIcons.hydrate(clone);
    target.classList.add('c05-morph-hold');

    /* force layout, then fly to the header rect */
    void clone.offsetWidth;
    clone.classList.add('c05-morph-fly');
    clone.style.left = tr.left + 'px';
    clone.style.top = tr.top + 'px';
    clone.style.width = tr.width + 'px';
    clone.style.height = tr.height + 'px';

    /* settle by timeout, never transitionend (reduced-motion kill switches) */
    setTimeout(function () {
      if (clone.parentNode) clone.parentNode.removeChild(clone);
      target.classList.remove('c05-morph-hold');
    }, 340);
  }

  /* ==================================================================== */
  /* TOP BAR + RAIL                                                        */
  /* ==================================================================== */

  function crumbSegs() {
    var segs = [{ label: 'Settings', dest: destHome() }];
    if (view.kind === 'dest') segs.push({ label: catTitle(view.cat), dest: null });
    else if (view.kind === 'sub') {
      segs.push({ label: catTitle(view.cat), dest: { route: 'dest', cat: view.cat } });
      segs.push({ label: subTitle(view.cat, view.sub), dest: null });
    } else if (view.kind === 'manager') {
      var def = managerDef(view.managerId);
      if (def) {
        segs.push({ label: catTitle(def.cat), dest: { route: 'dest', cat: def.cat } });
        if (view.objectId) {
          segs.push({ label: def.title, dest: { route: 'manager', managerId: def.id } });
          segs.push({ label: objectTitle() || 'Detail', dest: null });
        } else segs.push({ label: def.title, dest: null });
      }
    } else if (view.kind === 'all') segs.push({ label: 'All Settings', dest: null });
    else if (view.kind === 'search') segs.push({ label: 'Search', dest: null });
    else if (view.kind === 'copy') segs.push({ label: 'Copy Settings', dest: null });
    return segs;
  }

  function renderTop() {
    var v = (view.kind === 'copy') ? view : view;
    var isHome = v.kind === 'home';
    var h = '';
    if (!isHome) {
      var pv = (v.kind === 'copy') ? (v.under || { kind: 'home' }) : v;
      var back = parentOf(v.kind === 'copy' ? v : v);
      h += '<button type="button" class="c05-back" data-act="back" data-pm2-back title="Back to ' + esc(parentName(v)) + '">' +
        '<span class="c05-back-arrow" aria-hidden="true">&#8592;</span><span class="c05-back-label">Back to ' + esc(parentName(v)) + '</span></button>';
      h += '<nav class="c05-crumbs" aria-label="Breadcrumb">';
      crumbSegs().forEach(function (s, i) {
        if (i) h += '<span class="c05-crumb-sep" aria-hidden="true">&#8250;</span>';
        if (s.dest) h += '<button type="button" class="c05-crumb" data-act="crumb" data-crumb="' + i + '">' + esc(s.label) + '</button>';
        else h += '<span class="c05-crumb is-here" aria-current="page">' + esc(s.label) + '</span>';
      });
      h += '</nav>';
      void pv; void back;
    } else {
      h += '<span class="c05-wordmark">Settings</span>';
    }
    h += '<span class="c05-top-flex"></span>';
    if (!isHome && v.kind !== 'search') {
      h += '<div class="c05-search c05-search-top" id="c05TopSearchWrap">' +
        '<span class="c05-search-ico">' + ico('search') + '</span>' +
        '<input type="text" id="c05TopSearch" data-pm2-search-input class="c05-search-input" placeholder="Search settings" ' +
        'autocomplete="off" spellcheck="false" aria-label="Search all settings">' +
        '<span class="c05-kbd-hint">Ctrl K</span>' +
        '<div class="c05-drop" id="c05TopDrop" hidden></div></div>';
    }
    h += '<span class="c05-identity" title="Everything here applies to this project">' +
      '<span class="c05-identity-name">' + esc(store.data.project.name) + '</span>' +
      '<span class="c05-identity-role">' + esc(store.data.project.role) + '</span></span>';
    h += '<button type="button" class="c05-close" data-act="close-settings">' + ico('close') + '<span>Close Settings</span></button>';
    topEl.innerHTML = h;
    syncTopFit();

    var input = byId('c05TopSearch');
    if (input) wireSearchField(input, byId('c05TopDrop'));
  }

  function railVisible() {
    var v = (view.kind === 'copy') ? (view.under || { kind: 'home' }) : view;
    return v.kind === 'dest' || v.kind === 'sub' || v.kind === 'manager' || v.kind === 'all';
  }

  function renderRail() {
    if (!railVisible()) { railEl.hidden = true; railEl.innerHTML = ''; return; }
    var v = (view.kind === 'copy') ? (view.under || {}) : view;
    var activeCat = v.cat || null;
    if (v.kind === 'manager') {
      var def = managerDef(v.managerId);
      if (def) activeCat = def.cat;
    }
    var h = '<div class="c05-rail-head">Sections</div>';
    catList.forEach(function (c) {
      var cur = c.id === activeCat;
      h += '<button type="button" class="c05-rail-item' + (cur ? ' is-active' : '') + '" data-act="rail-cat" data-cat="' + esc(c.id) + '"' +
        (cur ? ' aria-current="true"' : '') + '>' + ico(c.icon) + '<span>' + esc(c.title) + '</span></button>';
    });
    h += '<div class="c05-rail-rule"></div>';
    h += '<button type="button" class="c05-rail-item' + (v.kind === 'all' ? ' is-active' : '') + '" data-act="rail-all">' + ico('list') + '<span>All Settings</span></button>';
    h += '<button type="button" class="c05-rail-item" data-act="rail-copy">' + ico('copy') + '<span>Copy Settings</span></button>';
    railEl.innerHTML = h;
    railEl.hidden = false;
  }

  /* ==================================================================== */
  /* HOME                                                                  */
  /* ==================================================================== */

  function pickBanner() {
    var notices = arr(store.data.notices);
    if (!notices.length) return null;
    var sc = scenario();
    /* Scenario-critical and fixture-staged notices earn the single banner;
       the synthetic notice pool (attention-heavy filler) never does. */
    var eligible = notices.filter(function (n) {
      return n && typeof n.id === 'string' &&
        (n.id.indexOf('pm2-scn-') === 0 || n.id.indexOf('pm2-fx-') === 0);
    });
    if (!eligible.length) return null;
    if (sc === 'baseline' || sc === 'calm') {
      /* only fixture-staged notices (e.g. import conflict) surface here */
      eligible = eligible.filter(function (n) { return n.id.indexOf('pm2-fx-') === 0; });
    }
    return eligible.length ? eligible[0] : null;
  }

  function noticeActDest(act, target) {
    var map = {
      'open-lifecycle': { route: 'manager', managerId: 'm.lifecycle' },
      'open-provider': { route: 'manager', managerId: 'm.providers' },
      'open-usage': { route: 'dest', cat: 'ai', sub: 'usage' },
      'open-policy': { route: 'dest', cat: 'safety' },
      'switch-account': { route: 'manager', managerId: 'm.providers' }
    };
    if (map[act]) return map[act];
    var t = obj(target);
    if (t.settingId) return { route: 'setting', settingId: t.settingId };
    if (t.cat) return { route: 'dest', cat: t.cat, sub: t.sub || null };
    return destHome();
  }

  function homeHtml() {
    var counts = store.counts();
    var attn = store.attention();
    var banner = pickBanner();
    var h = '<div class="c05-home">';

    h += '<div class="c05-home-head">' +
      '<div class="c05-home-kicker">' + esc(store.data.project.name) + ' &middot; Project settings</div>' +
      '<h1 class="c05-home-title">Settings</h1>' +
      '<p class="c05-home-sub">Everything here applies to this project. ' +
      fmtInt(counts.total) + ' settings across ' + catList.length + ' sections' +
      (counts.changed ? ' &middot; ' + fmtInt(counts.changed) + ' changed from default' : '') + '.</p></div>';

    /* search hero */
    h += '<div class="c05-search c05-search-hero" id="c05HeroWrap">' +
      '<span class="c05-search-ico">' + ico('search') + '</span>' +
      '<input type="text" id="c05HeroSearch" data-pm2-search-input class="c05-search-input" ' +
      'placeholder="Search settings, providers, models, tools&hellip;" autocomplete="off" spellcheck="false" ' +
      'aria-label="Search all settings">' +
      '<span class="c05-kbd-hint">Ctrl K</span>' +
      '<div class="c05-drop" id="c05HeroDrop" hidden></div></div>';

    /* single critical banner */
    if (banner) {
      h += '<div class="c05-banner" data-kind="' + esc(banner.kind || 'attention') + '">' +
        '<span class="c05-banner-word">' + esc(banner.statusWord || 'Notice') + '</span>' +
        '<span class="c05-banner-text"><strong>' + esc(banner.headline) + '</strong> ' + esc(banner.consequence || '') + '</span>';
      if (banner.primary) {
        h += '<button type="button" class="c05-banner-act" data-act="notice-act" data-notice-act="' + esc(banner.primary.act || '') + '">' +
          esc(banner.primary.label) + '</button>';
      }
      h += '</div>';
    }

    /* compact attention block */
    if (attn.length) {
      var shown = ui.attnMore ? attn : attn.slice(0, 4);
      h += '<section class="c05-attn" aria-label="Needs attention"><div class="c05-attn-head">Needs attention</div>';
      shown.forEach(function (a, i) {
        h += '<button type="button" class="c05-attn-row" data-act="attn" data-attn="' + i + '">' +
          '<span class="c05-attn-word">' + esc(a.statusWord) + '</span>' +
          '<span class="c05-attn-main"><span class="c05-attn-headline">' + esc(a.headline) + '</span>' +
          '<span class="c05-attn-why">' + esc(a.consequence) + '</span></span>' +
          '<span class="c05-go" aria-hidden="true">&#8250;</span></button>';
      });
      if (attn.length > 4 && !ui.attnMore) {
        h += '<button type="button" class="c05-attn-more" data-act="attn-more">Show ' + (attn.length - 4) + ' more</button>';
      }
      h += '</section>';
    } else if (firstRun()) {
      h += '<section class="c05-attn is-empty"><div class="c05-attn-head">Needs attention</div>' +
        '<div class="c05-empty-line">Nothing needs attention. Connect a provider below to start working.</div></section>';
    }

    /* the directory: 12 destination cards, two columns */
    h += '<section class="c05-grid" aria-label="Settings sections">';
    counts.byCategory.forEach(function (c) {
      var mgrs = window.PM2.managers.byCat(c.id);
      var facts = [fmtInt(c.total) + ' settings'];
      if (c.changed) facts.push(c.changed + ' changed');
      if (mgrs.length) facts.push(mgrs.length === 1 ? '1 workspace' : mgrs.length + ' workspaces');
      var subs = arr(catById[c.id] && catById[c.id].subgroups).map(function (g) { return g.title; }).join(' &middot; ');
      h += '<button type="button" class="c05-card" data-act="card" data-cat="' + esc(c.id) + '">' +
        '<span class="c05-card-ico">' + ico(c.icon) + '</span>' +
        '<span class="c05-card-body">' +
        '<span class="c05-card-title">' + esc(c.title) + '</span>' +
        '<span class="c05-card-desc">' + esc(c.desc) + '</span>' +
        '<span class="c05-card-facts">' + facts.join(' &middot; ') + '</span>' +
        '<span class="c05-card-subs">' + subs + '</span>' +
        '</span><span class="c05-go" aria-hidden="true">&#8250;</span></button>';
    });
    h += '</section>';

    /* subdued utility footer band */
    var recents = firstRun() ? [] : store.recents().slice(0, 3);
    h += '<section class="c05-foot" aria-label="Utilities">';
    h += '<div class="c05-foot-col"><button type="button" class="c05-foot-link" data-act="foot-all">' + ico('list') +
      '<span><span class="c05-foot-title">All Settings</span><span class="c05-foot-sub">Browse the complete index of ' +
      fmtInt(counts.total) + ' settings</span></span></button>' +
      '<button type="button" class="c05-foot-link" data-act="foot-copy">' + ico('copy') +
      '<span><span class="c05-foot-title">Copy Settings</span><span class="c05-foot-sub">One-time copy from another project</span></span></button></div>';
    h += '<div class="c05-foot-col c05-foot-recents"><div class="c05-foot-title">Recent changes</div>';
    if (!recents.length) {
      h += '<div class="c05-foot-sub">' + (firstRun() ? 'Nothing has been changed yet.' : 'No recent changes.') + '</div>';
    } else {
      recents.forEach(function (r) {
        h += '<button type="button" class="c05-recent" data-act="recent" data-setting="' + esc(r.settingId) + '">' +
          '<span class="c05-recent-label">' + esc(r.label) + '</span>' +
          '<span class="c05-recent-delta">' + esc(r.fromLabel || '—') + ' &#8594; ' + esc(r.toLabel || '—') + '</span>' +
          '<span class="c05-recent-when">' + esc(fmtAgo(r.when)) + (r.note ? ' &middot; ' + esc(r.note) : '') + '</span></button>';
      });
    }
    h += '</div></section>';

    h += '</div>';
    return h;
  }

  /* ==================================================================== */
  /* DOMAIN OVERVIEW (dest/<cat>)                                          */
  /* ==================================================================== */

  function domainHtml(cat) {
    var c = catById[cat];
    var counts = store.counts();
    var cc = null;
    counts.byCategory.forEach(function (x) { if (x.id === cat) cc = x; });
    var h = '<div class="c05-page">';

    h += '<header class="c05-dom-head"><div class="c05-dom-head-card">' +
      '<span class="c05-dom-ico">' + ico(c.icon) + '</span>' +
      '<div class="c05-dom-head-text"><h1 class="c05-dom-title">' + esc(c.title) + '</h1>' +
      '<p class="c05-dom-desc">' + esc(c.desc) + '</p></div></div>' +
      '<div class="c05-dom-facts">' + fmtInt(cc.total) + ' settings' +
      (cc.changed ? ' &middot; ' + cc.changed + ' changed from default' : '') +
      ' &middot; ' + cc.simple + ' everyday &middot; ' + cc.advanced + ' advanced</div></header>';

    /* destination rows: subgroups */
    h += '<section class="c05-dest-list" aria-label="Pages">';
    arr(c.subgroups).forEach(function (g) {
      var rows = store.rowsFor(cat, g.id);
      var names = rows.slice(0, 3).map(function (r) { return r.label; }).join(', ');
      var changed = rows.filter(function (r) { return r.changedFromDefault; }).length;
      h += '<button type="button" class="c05-dest-row" data-act="sub" data-cat="' + esc(cat) + '" data-sub="' + esc(g.id) + '">' +
        '<span class="c05-dest-main"><span class="c05-dest-title">' + esc(g.title) + '</span>' +
        '<span class="c05-dest-desc">' + esc(g.desc) + '</span>' +
        '<span class="c05-dest-sample">' + esc(names) + (rows.length > 3 ? '&hellip;' : '') + '</span></span>' +
        '<span class="c05-dest-facts">' + rows.length + ' settings' + (changed ? ' &middot; ' + changed + ' changed' : '') + '</span>' +
        '<span class="c05-go" aria-hidden="true">&#8250;</span></button>';
    });
    h += '</section>';

    /* manager destinations */
    var mgrs = window.PM2.managers.byCat(cat);
    if (mgrs.length) {
      h += '<section class="c05-dest-list" aria-label="Workspaces"><div class="c05-sec-head">Workspaces</div>';
      mgrs.forEach(function (def) {
        var deferred = def.status === 'deferred_named_owner';
        h += '<button type="button" class="c05-dest-row is-mgr" data-act="mgr" data-manager="' + esc(def.id) + '">' +
          '<span class="c05-dest-ico">' + ico(def.icon) + '</span>' +
          '<span class="c05-dest-main"><span class="c05-dest-title">' + esc(def.title) +
          (deferred ? ' <span class="c05-tag">Reserved</span>' : '') + '</span>' +
          '<span class="c05-dest-desc">' + esc(def.blurb) + '</span></span>' +
          '<span class="c05-go" aria-hidden="true">&#8250;</span></button>';
      });
      h += '</section>';
    }

    h += '</div>';
    return h;
  }

  /* ==================================================================== */
  /* SUBGROUP WORKSPACE (dest/<cat>/<sub>)                                 */
  /* ==================================================================== */

  function subHtml(cat, sub) {
    var g = subOf(cat, sub);
    var rows = store.rowsFor(cat, sub);
    var curated = rows.filter(function (r) { return invById[r.id] && invById[r.id].curated; });
    var curatedIds = {};
    curated.forEach(function (r) { curatedIds[r.id] = true; });
    var simple = rows.filter(function (r) { return !curatedIds[r.id] && r.tier === 'simple'; });
    var advanced = rows.filter(function (r) { return !curatedIds[r.id] && r.tier !== 'simple'; });
    var advKey = cat + '/' + sub;

    var h = '<div class="c05-page">';
    h += '<header class="c05-sub-head"><h1 class="c05-sub-title">' + esc(g.title) + '</h1>' +
      '<p class="c05-sub-desc">' + esc(g.desc) + '</p>' +
      '<div class="c05-sub-facts">' + rows.length + ' settings in ' + esc(catTitle(cat)) + '</div></header>';

    function group(list, label) {
      if (!list.length) return '';
      var out = '<section class="c05-rows" aria-label="' + esc(label) + '"><div class="c05-sec-head">' + esc(label) + '</div>';
      list.forEach(function (r, i) {
        /* a hairline break every 8 rows keeps visible groups digestible */
        if (i > 0 && i % 8 === 0) out += '<div class="c05-row-break" aria-hidden="true"></div>';
        out += rowHtml(r);
      });
      out += '</section>';
      return out;
    }

    h += group(curated, 'Essentials');
    h += group(simple, curated.length ? 'Everyday settings' : 'Settings');

    if (advanced.length) {
      var openAdv = !!ui.advOpen[advKey];
      /* a collapsed fold must not hide row states: summarize them on the fold */
      var advErrors = advanced.filter(function (r) { return r.state === 'error'; }).length;
      var advPending = advanced.filter(function (r) { return r.state !== 'normal' && r.state !== 'error'; }).length;
      var foldFlags = '';
      if (advErrors) {
        foldFlags += '<span class="c05-fold-flag" data-tone="error">' +
          (advErrors === 1 ? '1 validation error inside' : advErrors + ' validation errors inside') + '</span>';
      }
      if (advPending) {
        foldFlags += '<span class="c05-fold-flag" data-tone="attention">' +
          (advPending === 1 ? '1 row needs review' : advPending + ' rows need review') + '</span>';
      }
      h += '<section class="c05-adv-sec">' +
        '<button type="button" class="c05-adv-toggle" data-act="adv" data-key="' + esc(advKey) + '" aria-expanded="' + openAdv + '">' +
        '<span class="c05-adv-caret' + (openAdv ? ' is-open' : '') + '" aria-hidden="true">&#8250;</span>' +
        'Advanced (' + advanced.length + ')' + foldFlags + '</button>';
      if (openAdv) {
        h += '<div class="c05-rows">';
        advanced.forEach(function (r, i) {
          if (i > 0 && i % 8 === 0) h += '<div class="c05-row-break" aria-hidden="true"></div>';
          h += rowHtml(r);
        });
        h += '</div>';
      }
      h += '</section>';
    }

    /* related workspaces for this domain keep managers one step away */
    var mgrs = window.PM2.managers.byCat(cat);
    if (mgrs.length) {
      h += '<section class="c05-rel"><div class="c05-sec-head">Workspaces in ' + esc(catTitle(cat)) + '</div><div class="c05-rel-row">';
      mgrs.forEach(function (def) {
        h += '<button type="button" class="c05-rel-link" data-act="mgr" data-manager="' + esc(def.id) + '">' +
          ico(def.icon) + '<span>' + esc(def.title) + '</span></button>';
      });
      h += '</div></section>';
    }

    h += '</div>';
    return h;
  }

  /* ---------------- setting rows ---------------- */

  function chipHtml(chip) {
    return '<span class="pm-chip-value" data-kind="' + esc(chip.kind) + '">' + esc(chip.label) + '</span>';
  }

  function rowHtml(row, opts) {
    var o = obj(opts);
    var stateCls = row.state !== 'normal' ? ' is-' + row.state : '';
    var h = '<div class="c05-row' + stateCls + '" data-setting-id="' + esc(row.id) + '">';
    h += '<div class="c05-row-line">';
    h += '<div class="c05-row-main"><span class="c05-row-label">' + esc(row.label) + '</span>';
    arr(row.badges).forEach(function (b) { h += '<span class="c05-tag">' + esc(humanKey(b)) + '</span>'; });
    h += '<span class="c05-row-desc">' + esc(row.desc) + '</span></div>';
    h += '<div class="c05-row-side">';
    arr(row.chips).forEach(function (c) {
      if (c.kind === 'custom' || c.kind === 'default') return; /* the control shows the value */
      h += chipHtml(c);
    });
    h += '<span class="c05-ctl">' + controlHtml(row) + '</span>';
    h += '</div></div>';

    if (row.stateNote) {
      h += '<div class="c05-row-note" data-tone="' + esc(row.state) + '">' + esc(row.stateNote) + '</div>';
    }
    if (ui.rowError && ui.rowError.id === row.id) {
      h += '<div class="c05-row-note" data-tone="error">' + esc(ui.rowError.msg) + '</div>';
    }
    if (row.changedFromDefault && row.state === 'normal') {
      h += '<div class="c05-row-changed">Changed from default</div>';
    }

    var dKey = 'row/' + row.id;
    var open = !!ui.detailOpen[dKey];
    h += '<button type="button" class="c05-row-details" data-act="row-details" data-key="' + esc(dKey) + '" aria-expanded="' + open + '">Details</button>';
    if (open) {
      h += '<div class="c05-row-drawer"><p>' + esc(row.detail.legacyScopeNote) + '</p>';
      if (arr(row.detail.related).length) {
        h += '<p class="c05-drawer-line"><span class="c05-drawer-k">Related</span> ' + esc(row.detail.related.join(', ')) + '</p>';
      }
      if (arr(row.detail.searchTerms).length) {
        h += '<p class="c05-drawer-line"><span class="c05-drawer-k">Also found as</span> ' + esc(row.detail.searchTerms.join(', ')) + '</p>';
      }
      if (row.recommended !== undefined) {
        h += '<p class="c05-drawer-line"><span class="c05-drawer-k">Recommended</span> ' + esc(String(row.recommended)) + '</p>';
      }
      /* value collections are inspectable here (list/keyvalue/multiselect) */
      if (row.control.type === 'list' && arr(row.value).length) {
        h += '<ul class="c05-drawer-list">';
        arr(row.value).slice(0, 12).forEach(function (it) {
          h += '<li>' + esc(typeof it === 'object' ? JSON.stringify(it) : String(it)) + '</li>';
        });
        if (arr(row.value).length > 12) h += '<li>&hellip; ' + (row.value.length - 12) + ' more</li>';
        h += '</ul>';
      }
      if (row.control.type === 'keyvalue' && row.value && typeof row.value === 'object') {
        h += '<ul class="c05-drawer-list">';
        Object.keys(row.value).slice(0, 12).forEach(function (k) {
          h += '<li><span class="c05-drawer-k">' + esc(k) + '</span> ' + esc(String(row.value[k])) + '</li>';
        });
        h += '</ul>';
      }
      h += '</div>';
    }
    h += '</div>';
    void o;
    return h;
  }

  function controlHtml(row) {
    var c = row.control;
    var disabled = row.state === 'managed' || row.state === 'unavailable';
    var dis = disabled ? ' disabled' : '';
    var id = esc(row.id);

    if (c.type === 'toggle') {
      var on = row.value === true || row.value === 'on';
      return '<button type="button" class="c05-switch' + (on ? ' is-on' : '') + '" role="switch" aria-checked="' + on +
        '" data-act="toggle" data-setting="' + id + '"' + dis + ' aria-label="' + esc(row.label) + '">' +
        '<span class="c05-switch-knob"></span></button>';
    }
    if (c.type === 'select' || c.type === 'radio') {
      return '<button type="button" class="c05-select" data-act="select" data-setting="' + id + '"' + dis +
        ' aria-haspopup="menu" aria-label="' + esc(row.label) + '">' +
        '<span>' + esc(humanOption(row.valueLabel) || 'Choose') + '</span><span class="c05-select-caret" aria-hidden="true">&#8964;</span></button>';
    }
    if (c.type === 'multiselect') {
      return '<button type="button" class="c05-select" data-act="multi" data-setting="' + id + '"' + dis +
        ' aria-haspopup="menu" aria-label="' + esc(row.label) + '">' +
        '<span>' + esc(row.valueLabel || 'Choose') + '</span><span class="c05-select-caret" aria-hidden="true">&#8964;</span></button>';
    }
    if (c.type === 'number') {
      var attrs = (c.min != null ? ' min="' + c.min + '"' : '') + (c.max != null ? ' max="' + c.max + '"' : '');
      return '<input type="number" class="c05-num" data-act="num" data-setting="' + id + '" value="' +
        esc(row.value == null ? '' : row.value) + '"' + attrs + dis + ' aria-label="' + esc(row.label) + '">';
    }
    if (c.type === 'slider') {
      if (typeof row.value === 'number' && c.min != null && c.max != null) {
        var step = (c.max - c.min) <= 1 ? 0.05 : 1;
        return '<span class="c05-slider-wrap"><input type="range" class="c05-slider" data-act="slider" data-setting="' + id +
          '" min="' + c.min + '" max="' + c.max + '" step="' + step + '" value="' + esc(row.value) + '"' + dis +
          ' aria-label="' + esc(row.label) + '"><span class="c05-slider-val" data-slider-val="' + id + '">' + esc(row.valueLabel) + '</span></span>';
      }
      /* string-valued sliders (e.g. "model default") stay a choice control */
      return '<button type="button" class="c05-select" data-act="text-edit" data-setting="' + id + '"' + dis + '>' +
        '<span>' + esc(row.valueLabel || 'Set') + '</span></button>';
    }
    if (c.type === 'text' || c.type === 'path') {
      return '<input type="text" class="c05-text" data-act="text" data-setting="' + id + '" value="' + esc(row.value == null ? '' : row.value) + '"' +
        dis + ' aria-label="' + esc(row.label) + '"' + (c.type === 'path' ? ' spellcheck="false"' : '') + '>';
    }
    if (c.type === 'action') {
      return '<button type="button" class="c05-btn" data-act="row-action" data-setting="' + id + '"' + dis + '>' +
        esc(row.valueLabel || 'Open') + '</button>';
    }
    /* list / keyvalue: value summary + inspection through Details */
    return '<span class="c05-ctl-ro">' + esc(row.valueLabel || '—') + '</span>';
  }

  /* ==================================================================== */
  /* MANAGERS                                                              */
  /* ==================================================================== */

  function managerHtml(managerId, objectId, tab) {
    var def = managerDef(managerId);
    if (!def) return '<div class="c05-page"><p>Unknown workspace.</p></div>';
    var vm = def.model(store);
    var deferred = def.status === 'deferred_named_owner';
    var hasPages = vm && vm.pages && Object.keys(vm.pages).length > 0;
    var narrow = rootEl.classList.contains('is-narrow');
    var showList = !narrow || ui.mgrPane === 'list';
    var showDetail = !narrow || ui.mgrPane === 'detail';

    var h = '<div class="c05-mgr' + (narrow ? ' is-push' : '') + '" data-manager-root="' + esc(def.id) + '">';

    /* ---- left: roster / section nav + actions ---- */
    if (showList) {
      h += '<aside class="c05-mgr-list" aria-label="' + esc(def.title) + ' navigation">';
      h += '<div class="c05-mgr-list-head">' + ico(def.icon) + '<div><div class="c05-mgr-name">' + esc(def.title) + '</div>' +
        '<div class="c05-mgr-blurb">' + esc(def.blurb || (vm && vm.summary) || '') + '</div></div></div>';
      if (deferred) {
        h += '<div class="c05-mgr-deferred">Reserved destination &middot; read-only</div>';
      }
      if (hasPages) {
        h += managerRosterNav(vm, def, objectId);
      } else {
        h += managerSectionNav(vm, def);
      }
      h += managerActionsHtml(def);
      h += '</aside>';
    }

    /* ---- right: detail ---- */
    if (showDetail) {
      h += '<div class="c05-mgr-detail" id="c05MgrDetail">';
      h += '<div class="c05-opstrip" id="c05OpStrip"' + (ui.lastOp ? '' : ' hidden') + '>' + (ui.lastOp ? opStripHtml(ui.lastOp) : '') + '</div>';
      if (narrow) {
        h += '<button type="button" class="c05-mgr-backlist" data-act="mgr-list" data-pm2-back aria-label="Back to ' + esc(def.title) + '">' +
          '<span aria-hidden="true">&#8592;</span> ' + esc(def.title) + '</button>';
      }
      if (hasPages && objectId && vm.pages[objectId]) {
        h += objectPageHtml(vm, def, objectId, tab);
      } else if (hasPages) {
        h += managerFrontHtml(vm, def);
      } else {
        h += managerDocHtml(vm, def);
      }
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  function managerRosterNav(vm, def, objectId) {
    var h = '';
    arr(vm.sections).forEach(function (sec) {
      if (sec.kind !== 'roster') return;
      var groups = arr(sec.groups).length ? sec.groups : [{ id: sec.id, label: sec.title, items: arr(sec.items) }];
      groups.forEach(function (g) {
        if (!arr(g.items).length) return;
        h += '<div class="c05-mgr-group">' + esc(g.label || '') + '</div>';
        arr(g.items).forEach(function (item) {
          var oid = item.dest && item.dest.objectId ? item.dest.objectId : item.id;
          var active = oid === objectId;
          h += '<button type="button" class="c05-mgr-obj' + (active ? ' is-active' : '') + '" data-act="mgr-obj" ' +
            'data-manager="' + esc(def.id) + '" data-object-id="' + esc(oid) + '"' + (active ? ' aria-current="true"' : '') + '>' +
            '<span class="c05-mgr-obj-main"><span class="c05-mgr-obj-label">' + esc(item.label) + '</span>' +
            (item.sub ? '<span class="c05-mgr-obj-sub">' + esc(item.sub) + '</span>' : '') + '</span>' +
            (item.status ? '<span class="c05-dot" data-tone="' + esc(item.status.tone || 'muted') + '" title="' + esc(item.status.label || '') + '"></span>' : '') +
            '</button>';
        });
      });
    });
    if (!h) h = '<div class="c05-empty-line">Nothing here yet.</div>';
    return h;
  }

  function managerSectionNav(vm, def) {
    var h = '<div class="c05-mgr-group">Sections</div>';
    var any = false;
    arr(vm && vm.sections).forEach(function (sec) {
      any = true;
      h += '<button type="button" class="c05-mgr-obj" data-act="mgr-sec" data-sec="' + esc(sec.id) + '" data-manager="' + esc(def.id) + '">' +
        '<span class="c05-mgr-obj-main"><span class="c05-mgr-obj-label">' + esc(sec.title || sec.id) + '</span>' +
        (sec.advanced ? '<span class="c05-mgr-obj-sub">Advanced</span>' : '') + '</span></button>';
    });
    if (!any) h += '<div class="c05-empty-line">Nothing here yet.</div>';
    return h;
  }

  function managerActionsHtml(def) {
    var actions = [];
    try { actions = arr(def.actions && def.actions(store)); } catch (e) { actions = []; }
    if (!actions.length) return '';
    var h = '<div class="c05-mgr-group">Actions</div><div class="c05-mgr-actions">';
    actions.forEach(function (a, i) {
      h += '<button type="button" class="c05-btn c05-act-btn" data-act="mgr-action" data-manager="' + esc(def.id) +
        '" data-action-idx="' + i + '"' + (a.available === false ? ' disabled' : '') + '>' +
        (a.ico ? ico(a.ico) : '') + '<span>' + esc(a.label) + '</span></button>';
      if (a.available === false && a.reason) {
        h += '<div class="c05-act-reason">' + esc(a.reason) + '</div>';
      }
    });
    h += '</div>';
    return h;
  }

  function managerFrontHtml(vm, def) {
    var h = '<header class="c05-mgr-head"><h1>' + esc(vm.title || def.title) + '</h1>' +
      '<p class="c05-dom-desc">' + esc(vm.blurb || def.blurb || '') + '</p></header>';
    arr(vm.sections).forEach(function (sec) {
      if (sec.kind === 'roster') {
        /* the roster lives in the left pane; the front page keeps a compact
           overview so wide layouts stay composed */
        h += sectionShellHtml(sec, rosterSectionBody(sec, def, { compact: true }), def);
      } else {
        h += sectionHtml(sec, def);
      }
    });
    return h;
  }

  function managerDocHtml(vm, def) {
    var h = '<header class="c05-mgr-head"><h1>' + esc(vm.title || def.title) + '</h1>';
    if (vm.summary) h += '<p class="c05-dom-desc">' + esc(vm.summary) + '</p>';
    if (vm.readOnly) h += '<div class="c05-mgr-deferred is-inline">Read-only &middot; owner: ' + esc(def.owner || 'named owner module') + '</div>';
    h += '</header>';
    if (def.status === 'deferred_named_owner' && def.insertionContract) {
      var icx = def.insertionContract;
      h += '<section class="c05-sec" data-section="insertion-contract"><div class="c05-sec-head">Insertion contract</div>' +
        '<div class="c05-kv"><span class="c05-kv-k">Owner</span><span class="c05-kv-v">' + esc(def.owner || '') + '</span></div>' +
        '<div class="c05-kv"><span class="c05-kv-k">Deep link</span><span class="c05-kv-v">' + esc(icx.deepLink || '') + '</span></div>' +
        '<div class="c05-kv"><span class="c05-kv-k">Reachable from</span><span class="c05-kv-v">' + esc(arr(icx.reachableFrom).join(' · ')) + '</span></div>' +
        '<p class="c05-note">' + esc(icx.returnContract || '') + '</p></section>';
    }
    arr(vm.sections).forEach(function (sec) { h += sectionHtml(sec, def); });
    if (!arr(vm.sections).length) h += '<div class="c05-empty-line">Nothing to show yet.</div>';
    return h;
  }

  function objectPageHtml(vm, def, objectId, tab) {
    var page = vm.pages[objectId];
    var tabs = arr(page.tabs);
    var activeTab = tab && tabs.indexOf(tab) >= 0 ? tab : (tabs[0] || null);
    var h = '<header class="c05-mgr-head" data-object-id="' + esc(objectId) + '"><h1>' + esc(page.title) + '</h1>';
    if (page.status) {
      h += '<span class="c05-status" data-tone="' + esc(page.status.tone || 'muted') + '">' + esc(page.status.label || '') + '</span>';
    }
    h += '</header>';
    if (page.status && page.status.note) h += '<p class="c05-note">' + esc(page.status.note) + '</p>';

    if (tabs.length > 1) {
      h += '<div class="c05-tabs" role="tablist">';
      tabs.forEach(function (t) {
        var sec = page.sections[t];
        var label = sec && sec.title ? sec.title : (t.charAt(0).toUpperCase() + t.slice(1));
        h += '<button type="button" class="c05-tab' + (t === activeTab ? ' is-active' : '') + '" role="tab" ' +
          'aria-selected="' + (t === activeTab) + '" data-act="mgr-tab" data-tab="' + esc(t) + '" ' +
          'data-manager="' + esc(def.id) + '" data-object="' + esc(objectId) + '">' + esc(label) + '</button>';
      });
      h += '</div>';
    }

    var sec = activeTab ? page.sections[activeTab] : null;
    if (sec) h += sectionHtml(sec, def, { hideTitle: tabs.length > 1 });
    else h += '<div class="c05-empty-line">Nothing to show on this page.</div>';
    return h;
  }

  /* ---------------- generic section renderers ---------------- */

  function sectionShellHtml(sec, body, def, opts) {
    var o = obj(opts);
    var h = '<section class="c05-sec" data-section="' + esc(sec.id) + '">';
    if (!o.hideTitle && sec.title) h += '<div class="c05-sec-head">' + esc(sec.title) + '</div>';
    if (sec.note) h += '<p class="c05-note">' + esc(sec.note) + '</p>';
    if (sec.loading) h += '<div class="c05-refresh-line">' + ico('refresh') + '<span>' + esc(sec.loading.note || 'Refreshing…') + '</span></div>';
    h += body;
    h += '</section>';
    void def;
    return h;
  }

  function sectionHtml(sec, def, opts) {
    var o = obj(opts);
    var body = '';
    var kind = sec.kind;
    if (kind === 'overview') body = overviewBody(sec);
    else if (kind === 'roster') body = rosterSectionBody(sec, def, {});
    else if (kind === 'form') body = formBody(sec);
    else if (kind === 'table') body = tableBody(sec, def);
    else if (kind === 'steps') body = stepsBody(sec, def);
    else if (kind === 'log') body = logBody(sec);
    else if (kind === 'health') body = healthBody(sec);
    else if (kind === 'preview') body = previewBody(sec);
    else body = genericBody(sec);

    if (sec.advanced && !o.hideTitle) {
      var key = 'sec/' + (def ? def.id : '') + '/' + sec.id;
      var open = !!ui.detailOpen[key];
      var wrap = '<section class="c05-sec" data-section="' + esc(sec.id) + '">' +
        '<button type="button" class="c05-adv-toggle" data-act="drawer" data-key="' + esc(key) + '" aria-expanded="' + open + '">' +
        '<span class="c05-adv-caret' + (open ? ' is-open' : '') + '" aria-hidden="true">&#8250;</span>' + esc(sec.title || 'Advanced') + '</button>';
      if (open) {
        if (sec.note) wrap += '<p class="c05-note">' + esc(sec.note) + '</p>';
        wrap += body;
      }
      wrap += '</section>';
      return wrap;
    }
    return sectionShellHtml(sec, body, def, o);
  }

  function toneWord(tone) {
    return tone === 'ok' ? 'ok' : tone === 'attention' ? 'attention' : tone === 'setup' ? 'setup' : tone === 'progress' ? 'progress' : 'muted';
  }

  function overviewBody(sec) {
    var items = arr(sec.items).length ? sec.items : arr(sec.rows);
    var h = '<div class="c05-kv-list">';
    if (!items.length) h += '<div class="c05-empty-line">Nothing here yet.</div>';
    items.forEach(function (it) {
      h += '<div class="c05-kv" data-item-id="' + esc(it.id) + '"' + (it.tone ? ' data-tone="' + esc(it.tone) + '"' : '') + '>' +
        '<span class="c05-kv-k">' + esc(it.label) + '</span>' +
        '<span class="c05-kv-v">' + esc(it.valueLabel != null ? it.valueLabel : (it.value != null ? it.value : '—')) +
        (it.dest ? ' <button type="button" class="c05-jump" data-act="jump" data-dest="' + destAttr(it.dest) + '">Open</button>' : '') +
        '</span>' +
        (it.note ? '<span class="c05-kv-note">' + esc(it.note) + '</span>' : '') +
        '</div>';
    });
    h += '</div>';
    if (arr(sec.whatNext).length) {
      h += '<div class="c05-whatnext"><div class="c05-whatnext-head">When included usage runs out</div><ol>';
      sec.whatNext.forEach(function (s) { h += '<li>' + esc(s.label) + '</li>'; });
      h += '</ol></div>';
    }
    return h;
  }

  function rosterSectionBody(sec, def, opts) {
    var o = obj(opts);
    var groups = arr(sec.groups).length ? sec.groups : [{ id: sec.id, label: null, items: arr(sec.items) }];
    var h = '';
    var here = viewRouteObj(view);
    groups.forEach(function (g) {
      if (g.label) h += '<div class="c05-roster-group">' + esc(g.label) + '</div>';
      if (!arr(g.items).length) { h += '<div class="c05-empty-line">Nothing here yet.</div>'; return; }
      var items = o.compact ? g.items.slice(0, 6) : g.items;
      items.forEach(function (item) { h += rosterItemHtml(item, def, here); });
      if (o.compact && g.items.length > items.length) {
        h += '<div class="c05-note">' + (g.items.length - items.length) + ' more in the list on the left.</div>';
      }
    });
    return h;
  }

  function destAttr(dest) {
    return esc(JSON.stringify(dest || {}));
  }

  function sameSpot(dest) {
    var d = obj(dest);
    if (d.route !== 'manager') return false;
    return view.kind === 'manager' && d.managerId === view.managerId &&
      (d.objectId || null) === (view.objectId || null) &&
      (d.tab || null) === (view.tab || null);
  }

  function rosterItemHtml(item, def, here) {
    void here;
    var clickable = item.dest && !sameSpot(item.dest);
    var flags = obj(item.flags);
    var h = '<div class="c05-roster-item" data-item-id="' + esc(item.id) + '">';
    h += '<div class="c05-roster-line">';
    h += '<span class="c05-roster-main"><span class="c05-roster-label">' + esc(item.label) + '</span>' +
      (item.sub ? '<span class="c05-roster-sub">' + esc(item.sub) + '</span>' : '') + '</span>';
    if (flags.selected) h += '<span class="c05-tag is-on">In use</span>';
    if (flags.shadowed) h += '<span class="c05-tag">Shadowed</span>';
    if (flags.manualOnly) h += '<span class="c05-tag">Manual only</span>';
    if (item.status && item.status.label) {
      h += '<span class="c05-status" data-tone="' + toneWord(item.status.tone) + '">' + esc(item.status.label) + '</span>';
    }
    if (clickable) {
      h += '<button type="button" class="c05-jump" data-act="jump" data-dest="' + destAttr(item.dest) + '">Open</button>';
    }
    h += '</div>';
    if (item.status && item.status.note) h += '<div class="c05-roster-note">' + esc(item.status.note) + '</div>';
    if (item.shadowNote) h += '<div class="c05-roster-note">' + esc(item.shadowNote) + '</div>';
    if (item.manualOnlyReason) h += '<div class="c05-roster-note">' + esc(item.manualOnlyReason) + '</div>';

    if (item.detail || item.meta || item.answers) {
      var key = 'it/' + (def ? def.id : '') + '/' + item.id;
      var open = !!ui.detailOpen[key];
      h += '<button type="button" class="c05-row-details" data-act="drawer" data-key="' + esc(key) + '" aria-expanded="' + open + '">Details</button>';
      if (open) h += '<div class="c05-row-drawer">' + detailDump(item) + '</div>';
    }
    h += '</div>';
    return h;
  }

  function detailDump(item) {
    var h = '';
    function kv(k, v) {
      if (v == null || v === '') return '';
      if (Array.isArray(v)) {
        if (!v.length) return '';
        if (typeof v[0] === 'object') {
          var lis = v.slice(0, 8).map(function (x) {
            return '<li>' + esc(Object.keys(obj(x)).map(function (kk) { return kk + ': ' + String(x[kk]); }).join(' · ')) + '</li>';
          }).join('');
          return '<p class="c05-drawer-line"><span class="c05-drawer-k">' + esc(k) + '</span></p><ul class="c05-drawer-list">' + lis + '</ul>';
        }
        return '<p class="c05-drawer-line"><span class="c05-drawer-k">' + esc(k) + '</span> ' + esc(v.join(', ')) + '</p>';
      }
      if (typeof v === 'object') {
        return '<p class="c05-drawer-line"><span class="c05-drawer-k">' + esc(k) + '</span> ' +
          esc(Object.keys(v).map(function (kk) { return kk + ': ' + String(v[kk]); }).join(' · ')) + '</p>';
      }
      return '<p class="c05-drawer-line"><span class="c05-drawer-k">' + esc(k) + '</span> ' + esc(String(v)) + '</p>';
    }
    var d = obj(item.detail);
    Object.keys(d).forEach(function (k) { h += kv(humanKey(k), d[k]); });
    var m = obj(item.meta);
    Object.keys(m).forEach(function (k) { h += kv(humanKey(k), m[k]); });
    var a = obj(item.answers);
    Object.keys(a).forEach(function (k) { h += kv(humanKey(k), a[k]); });
    return h || '<p class="c05-drawer-line">No further detail.</p>';
  }

  function humanKey(k) {
    return String(k).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ')
      .replace(/^./, function (ch) { return ch.toUpperCase(); });
  }

  /* enum-ish option values render as words, never raw tokens (mirrors the
     store's own valueLabel treatment, plus single-word lowercase values) */
  function humanOption(v) {
    var s = String(v == null ? '' : v);
    if (/^[a-z0-9]+(?:[_-][a-z0-9]+)+$/.test(s)) {
      return s.replace(/[_-]+/g, ' ').replace(/(^|\s)([a-z])/g, function (m, sp, ch) {
        return sp + ch.toUpperCase();
      });
    }
    if (/^[a-z][a-z0-9]*$/.test(s)) return s.charAt(0).toUpperCase() + s.slice(1);
    return s;
  }

  function formBody(sec) {
    var h = '<div class="c05-form">';
    if (!arr(sec.fields).length) h += '<div class="c05-empty-line">Nothing here yet.</div>';
    arr(sec.fields).forEach(function (f) {
      if (f.settingId && invById[f.settingId]) {
        var row = store.resolveRow(f.settingId);
        if (row) { h += rowHtml(row); return; }
      }
      h += '<div class="c05-kv" data-item-id="' + esc(f.id) + '">' +
        '<span class="c05-kv-k">' + esc(f.label) + '</span>' +
        '<span class="c05-kv-v">' + esc(f.valueLabel != null ? f.valueLabel : '—') +
        (f.dest ? ' <button type="button" class="c05-jump" data-act="jump" data-dest="' + destAttr(f.dest) + '">Open</button>' : '') + '</span>' +
        (f.note ? '<span class="c05-kv-note">' + esc(f.note) + '</span>' : '') + '</div>';
    });
    h += '</div>';
    return h;
  }

  function colId(c) { return typeof c === 'string' ? c : c.id; }
  function colLabel(c) { return typeof c === 'string' ? c : (c.label || c.id); }

  function tableBody(sec, def) {
    var cols = arr(sec.columns);
    var rows = arr(sec.rows);
    var key = 'tbl/' + (def ? def.id : '') + '/' + sec.id;
    var pages = (ui.tableMore[key] || 0) + 1;
    var cap = 40 * pages;
    var shown = rows.slice(0, cap);
    var h = '<div class="c05-scroll-x"><table class="c05-table"><thead><tr>';
    cols.forEach(function (c) { h += '<th>' + esc(colLabel(c)) + '</th>'; });
    h += '</tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="' + (cols.length || 1) + '" class="c05-empty-line">Nothing here yet.</td></tr>';
    shown.forEach(function (r) {
      h += '<tr data-item-id="' + esc(r.id) + '">';
      cols.forEach(function (c, i) {
        var cid = colId(c);
        var val = r.cells ? r.cells[cid] : r[cid];
        if (val == null) val = '—';
        h += '<td>' + esc(String(val)) + (i === 0 && r.dest && !sameSpot(r.dest)
          ? ' <button type="button" class="c05-jump" data-act="jump" data-dest="' + destAttr(r.dest) + '">Open</button>' : '') + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    if (rows.length > cap) {
      h += '<button type="button" class="c05-more" data-act="table-more" data-key="' + esc(key) + '">Show ' +
        Math.min(40, rows.length - cap) + ' more of ' + rows.length + '</button>';
    }
    return h;
  }

  function stepsBody(sec, def) {
    var h = '';
    if (sec.officialSource) {
      h += '<div class="c05-kv"><span class="c05-kv-k">Official source</span><span class="c05-kv-v">' + esc(sec.officialSource) + '</span></div>';
    }
    if (sec.policyNote) h += '<p class="c05-note">' + esc(sec.policyNote) + '</p>';
    if (arr(sec.hostChoices).length) {
      var key = 'host/' + (def ? def.id : '') + '/' + sec.id;
      var pick = ui.hostPick[key] || sec.hostChoices[0].id;
      h += '<div class="c05-host-pick"><div class="c05-roster-group">Install for</div>';
      sec.hostChoices.forEach(function (c) {
        h += '<label class="c05-radio"><input type="radio" name="' + esc(key) + '" value="' + esc(c.id) + '" data-act="host-pick" data-key="' + esc(key) + '"' +
          (c.id === pick ? ' checked' : '') + '><span>' + esc(c.label) + '</span></label>';
      });
      h += '</div>';
    }
    h += '<ol class="c05-steps">';
    arr(sec.steps).forEach(function (s) {
      h += '<li><span class="c05-step-label">' + esc(s.label) + '</span>' +
        (s.detail ? '<span class="c05-step-detail">' + esc(s.detail) + '</span>' : '') + '</li>';
    });
    h += '</ol>';
    return h;
  }

  function logBody(sec) {
    var h = '';
    if (arr(sec.sources).length) {
      h += '<div class="c05-roster-group">Sources</div>';
      sec.sources.forEach(function (s) {
        h += '<div class="c05-roster-item" data-item-id="' + esc(s.id) + '"><div class="c05-roster-line">' +
          '<span class="c05-roster-main"><span class="c05-roster-label">' + esc(s.label) + '</span>' +
          (s.sub ? '<span class="c05-roster-sub">' + esc(s.sub) + '</span>' : '') + '</span>' +
          (s.status ? '<span class="c05-status" data-tone="' + toneWord(s.status.tone) + '">' + esc(s.status.label) + '</span>' : '') +
          '</div></div>';
      });
    }
    var entries = arr(sec.entries);
    h += '<div class="c05-log">';
    if (!entries.length) h += '<div class="c05-empty-line">No activity recorded yet.</div>';
    entries.slice(0, 40).forEach(function (e) {
      h += '<div class="c05-log-row" data-tone="' + toneWord(e.tone) + '">' +
        '<span class="c05-log-at">' + esc(e.at || '') + '</span>' +
        '<span class="c05-log-main">' + esc(e.label) +
        (e.detail ? '<span class="c05-log-detail">' + esc(e.detail) + '</span>' : '') + '</span></div>';
    });
    h += '</div>';
    return h;
  }

  function healthBody(sec) {
    var h = '<div class="c05-health">';
    var checks = arr(sec.checks).length ? sec.checks : arr(sec.items);
    if (!checks.length) h += '<div class="c05-empty-line">No checks to show.</div>';
    checks.forEach(function (c) {
      h += '<div class="c05-health-row" data-item-id="' + esc(c.id || '') + '">' +
        '<span class="c05-dot" data-tone="' + toneWord(c.tone || (c.status && c.status.tone)) + '"></span>' +
        '<span class="c05-roster-main"><span class="c05-roster-label">' + esc(c.label) + '</span>' +
        '<span class="c05-roster-sub">' + esc(c.state != null ? c.state : (c.status && c.status.label) || '') + '</span></span>' +
        (c.dest ? '<button type="button" class="c05-jump" data-act="jump" data-dest="' + destAttr(c.dest) + '">Open</button>' : '') +
        '</div>';
      if (c.note) h += '<div class="c05-roster-note">' + esc(c.note) + '</div>';
    });
    h += '</div>';
    return h;
  }

  function previewBody(sec) {
    var h = '';
    if (sec.text) h += '<pre class="c05-pre">' + esc(sec.text) + '</pre>';
    if (arr(sec.items).length) h += overviewBody({ items: sec.items });
    if (arr(sec.fields).length) h += formBody(sec);
    if (arr(sec.entries).length) h += logBody(sec);
    if (arr(sec.rows).length && arr(sec.columns).length) h += tableBody(sec, null);
    if (!h) h = genericBody(sec);
    return h;
  }

  function genericBody(sec) {
    var skip = { id: 1, kind: 1, title: 1, note: 1, advanced: 1, loading: 1 };
    var h = '<div class="c05-kv-list">';
    var any = false;
    Object.keys(obj(sec)).forEach(function (k) {
      if (skip[k]) return;
      var v = sec[k];
      if (v == null) return;
      any = true;
      if (typeof v === 'object') {
        h += '<div class="c05-kv"><span class="c05-kv-k">' + esc(humanKey(k)) + '</span><span class="c05-kv-v">' +
          esc(Array.isArray(v) ? v.length + ' entries' : Object.keys(v).map(function (kk) { return kk + ': ' + String(v[kk]); }).join(' · ')) +
          '</span></div>';
      } else {
        h += '<div class="c05-kv"><span class="c05-kv-k">' + esc(humanKey(k)) + '</span><span class="c05-kv-v">' + esc(String(v)) + '</span></div>';
      }
    });
    if (!any) h += '<div class="c05-empty-line">Nothing to show.</div>';
    h += '</div>';
    return h;
  }

  /* ---------------- op strip (truthful staged ops) ---------------- */

  function humanOpName(name) {
    return humanKey(String(name || 'operation')).toLowerCase()
      .replace(/^./, function (c) { return c.toUpperCase(); });
  }

  function opStripHtml(p) {
    var tone = p.status === 'done' ? 'ok'
      : (p.status === 'failed' || p.status === 'recovery-required') ? 'attention'
      : (p.status === 'degraded' || p.status === 'retryable') ? 'attention'
      : 'progress';
    var h = '<div class="c05-op" data-tone="' + tone + '">' +
      '<span class="c05-dot" data-tone="' + tone + '"></span>' +
      '<span class="c05-op-name">' + esc(humanOpName(p.name)) + (p.ref ? ' &middot; ' + esc(p.ref) : '') + '</span>' +
      '<span class="c05-op-phase">' + esc(p.status) + (p.phase ? ' &middot; ' + esc(String(p.phase).replace(/-/g, ' ')) : '') + '</span>';
    if (p.progressKind === 'determinate' && typeof p.completed === 'number' && typeof p.total === 'number' && p.total > 0) {
      var pct = Math.round(100 * p.completed / p.total);
      h += '<span class="c05-op-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + p.total + '" aria-valuenow="' + p.completed + '">' +
        '<span class="c05-op-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="c05-op-count">' + p.completed + ' / ' + p.total + '</span>';
    }
    h += '</div>';
    return h;
  }

  var TERMINAL_OPS = { done: 1, failed: 1, degraded: 1, retryable: 1, canceled: 1, 'recovery-required': 1 };

  function onOpEvent(p) {
    if (!p) return;
    ui.lastOp = p;
    var strip = byId('c05OpStrip');
    if (strip) {
      strip.hidden = false;
      strip.innerHTML = opStripHtml(p);
      window.PMIcons.hydrate(strip);
    }
    if (view.kind === 'copy' && String(p.name).indexOf('copy') === 0) {
      var cs = byId('c05CopyOp');
      if (cs) { cs.hidden = false; cs.innerHTML = opStripHtml(p); }
    }
    if (TERMINAL_OPS[p.status]) {
      clearTimeout(ui.opHideTimer);
      ui.opHideTimer = setTimeout(function () {
        var s2 = byId('c05OpStrip');
        if (s2 && ui.lastOp && TERMINAL_OPS[ui.lastOp.status]) { s2.hidden = true; ui.lastOp = null; }
      }, 5000);
    }
  }

  /* ==================================================================== */
  /* ALL SETTINGS (faceted, virtualized)                                   */
  /* ==================================================================== */

  var ALL_ROW_H = 52;

  function buildAllRows() {
    if (allCache.rows && allCache.epoch === allEpoch) return allCache.rows;
    var out = [];
    arr(obj(window.PM2_INVENTORY).settings).forEach(function (s) {
      var row = store.resolveRow(s.id);
      if (!row) return;
      out.push({
        id: s.id, label: row.label, desc: row.desc, cat: s.cat, sub: s.sub,
        type: s.type, tier: s.tier, changed: row.changedFromDefault,
        state: row.state, valueLabel: row.valueLabel,
        chipKind: row.chips.length ? row.chips[0].kind : 'default',
        chipLabel: row.chips.length ? row.chips[0].label : row.valueLabel,
        search: arr(s.search).join(' ').toLowerCase(),
        synthetic: false
      });
    });
    var stressOn = false;
    try { stressOn = window.PM2.states.stressActive(); } catch (e) { stressOn = store.get('stress') === true; }
    if (stressOn) {
      var recs = [];
      try { recs = arr(window.PM2.states.stressRecords()); } catch (e2) { recs = []; }
      recs.forEach(function (r) {
        out.push({
          id: r.id, label: r.label, desc: r.desc, cat: r.cat || 'system', sub: '',
          type: 'text', tier: 'advanced', changed: false, state: 'normal',
          valueLabel: '—', chipKind: 'not-configured', chipLabel: 'Stress fixture',
          search: arr(r.search).join(' ').toLowerCase(), synthetic: true
        });
      });
    }
    allCache = { epoch: allEpoch, rows: out };
    return out;
  }

  function filteredAllRows() {
    var f = ui.all;
    var q = f.q.trim().toLowerCase();
    return buildAllRows().filter(function (r) {
      if (f.cat && r.cat !== f.cat) return false;
      if (f.type && r.type !== f.type) return false;
      if (f.tier && r.tier !== f.tier) return false;
      if (f.changed === 'changed' && !r.changed) return false;
      if (f.changed === 'default' && r.changed) return false;
      if (f.state && r.state !== f.state) return false;
      if (q && r.label.toLowerCase().indexOf(q) < 0 && r.search.indexOf(q) < 0 &&
          r.id.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }

  var TYPE_OPTIONS = ['select', 'toggle', 'slider', 'number', 'action', 'radio', 'list', 'multiselect', 'keyvalue', 'text', 'path'];
  var STATE_OPTIONS = ['normal', 'managed', 'unavailable', 'restart-required', 'reconnect-required', 'changed-elsewhere', 'error'];

  function allHtml() {
    var rows = filteredAllRows();
    var total = buildAllRows().length;
    var f = ui.all;
    function opt(v, label, cur) {
      return '<option value="' + esc(v) + '"' + (cur === v ? ' selected' : '') + '>' + esc(label) + '</option>';
    }
    var h = '<div class="c05-page c05-all">';
    h += '<header class="c05-sub-head"><h1 class="c05-sub-title">All Settings</h1>' +
      '<p class="c05-sub-desc">The complete long-tail index. Every setting in the project, filterable by section, kind, and state.</p></header>';

    h += '<div class="c05-all-facets">' +
      '<input type="text" class="c05-text c05-all-q" id="c05AllQ" placeholder="Filter by name" value="' + esc(f.q) + '" aria-label="Filter settings">' +
      '<select class="c05-facet" data-facet="cat" aria-label="Section">' + opt('', 'All sections', f.cat) +
      catList.map(function (c) { return opt(c.id, c.title, f.cat); }).join('') + '</select>' +
      '<select class="c05-facet" data-facet="type" aria-label="Control kind">' + opt('', 'Any control', f.type) +
      TYPE_OPTIONS.map(function (t) { return opt(t, humanKey(t), f.type); }).join('') + '</select>' +
      '<select class="c05-facet" data-facet="tier" aria-label="Tier">' + opt('', 'Any tier', f.tier) +
      opt('simple', 'Everyday', f.tier) + opt('advanced', 'Advanced', f.tier) + '</select>' +
      '<select class="c05-facet" data-facet="changed" aria-label="Changed">' + opt('', 'Any value', f.changed) +
      opt('changed', 'Changed from default', f.changed) + opt('default', 'At default', f.changed) + '</select>' +
      '<select class="c05-facet" data-facet="state" aria-label="State">' + opt('', 'Any state', f.state) +
      STATE_OPTIONS.map(function (s) { return opt(s, humanKey(s), f.state); }).join('') + '</select>' +
      '<span class="c05-all-count">' + fmtInt(rows.length) + ' of ' + fmtInt(total) + '</span></div>';

    h += '<div class="c05-all-viewport" id="c05AllViewport" tabindex="0" aria-label="Settings index">' +
      '<div class="c05-all-canvas" id="c05AllCanvas" style="height:' + (rows.length * ALL_ROW_H) + 'px"></div></div>';
    h += '</div>';
    return h;
  }

  var allViewportBound = null;
  var allViewportRo = null;
  var allViewportRoH = -1;
  var allViewportRoPending = false;
  function mountAllViewport() {
    var vp = byId('c05AllViewport');
    if (!vp) return;
    allViewportBound = vp;
    vp.addEventListener('scroll', renderAllWindow);
    renderAllWindow();

    /* renderAllWindow() sizes the row window from vp.clientHeight, and scroll
       was its only trigger - so a viewport that GREW without a width change
       (window resize, the chat dock closing) kept the window computed for the
       SHORTER viewport and left blank sheet below the last painted row. A
       width flip re-renders the whole page and repaints the window as a side
       effect, which is exactly what masked the height-only case. Repaint
       whenever the viewport's own height really changes. The canvas lives
       inside the viewport and is sized from the row count alone, so it cannot
       feed back into the flex-sized viewport height - this cannot loop. */
    if (allViewportRo) {
      try { allViewportRo.disconnect(); } catch (e) { /* observer already gone */ }
      allViewportRo = null;
    }
    if (typeof window.ResizeObserver === 'function') {
      allViewportRoH = vp.clientHeight;
      allViewportRoPending = false;
      try {
        allViewportRo = new window.ResizeObserver(function () {
          var h = vp.clientHeight;
          if (h === allViewportRoH) return;
          allViewportRoH = h;
          if (allViewportRoPending) return;
          allViewportRoPending = true;
          window.requestAnimationFrame(function () {
            allViewportRoPending = false;
            /* renderAllWindow re-reads scrollTop AND clientHeight, so the row
               count is recomputed for the CURRENT band, never reused. */
            if (byId('c05AllViewport') === vp) renderAllWindow();
          });
        });
        allViewportRo.observe(vp);
      } catch (e) { allViewportRo = null; }
    }
  }

  function renderAllWindow() {
    var vp = byId('c05AllViewport');
    var canvas = byId('c05AllCanvas');
    if (!vp || !canvas) return;
    var rows = filteredAllRows();
    canvas.style.height = (rows.length * ALL_ROW_H) + 'px';
    var first = Math.max(0, Math.floor(vp.scrollTop / ALL_ROW_H) - 6);
    var last = Math.min(rows.length, Math.ceil((vp.scrollTop + vp.clientHeight) / ALL_ROW_H) + 6);
    var h = '';
    for (var i = first; i < last; i++) {
      var r = rows[i];
      var pathTxt = catTitle(r.cat) + (r.sub ? ' › ' + subTitle(r.cat, r.sub) : '');
      h += '<div class="c05-all-row' + (r.synthetic ? ' is-synthetic' : '') + '" style="top:' + (i * ALL_ROW_H) + 'px" ' +
        'data-setting-id="' + esc(r.id) + '" title="' + esc(r.desc) + '">' +
        (r.synthetic
          ? '<span class="c05-all-main"><span class="c05-all-label">' + esc(r.label) + '</span>' +
            '<span class="c05-all-path">' + esc(pathTxt) + '</span></span>' +
            '<span class="c05-tag">Stress fixture</span>'
          : '<button type="button" class="c05-all-main" data-act="all-open" data-setting="' + esc(r.id) + '">' +
            '<span class="c05-all-label">' + esc(r.label) + '</span>' +
            '<span class="c05-all-path">' + esc(pathTxt) + '</span></button>' +
            '<span class="c05-all-meta">' + esc(humanKey(r.type)) + (r.tier !== 'simple' ? ' &middot; advanced' : '') + '</span>' +
            '<span class="pm-chip-value" data-kind="' + esc(r.state === 'managed' ? 'managed' : r.state === 'unavailable' ? 'unavailable' : r.chipKind) + '">' +
            esc(r.chipLabel || '—') + '</span>') +
        '</div>';
    }
    canvas.innerHTML = h;
  }

  function landAllRow(settingId) {
    var rows = filteredAllRows();
    var idx = -1;
    rows.forEach(function (r, i) { if (r.id === settingId) idx = i; });
    if (idx < 0) return;
    var vp = byId('c05AllViewport');
    if (!vp) return;
    vp.scrollTop = Math.max(0, idx * ALL_ROW_H - vp.clientHeight / 2);
    renderAllWindow();
    performLanding({ settingId: settingId });
  }

  /* ==================================================================== */
  /* SEARCH (hero, topbar, dropdown, results page)                          */
  /* ==================================================================== */

  var KIND_ICONS = {
    setting: 'sliders', manager: 'grid', object: 'box', action: 'bolt',
    workflow: 'wrench', diagnostic: 'gauge', unavailable: 'warning', help: 'grad'
  };

  function wireSearchField(input, dropEl) {
    input.addEventListener('input', function () {
      ui.dropdown.query = input.value;
      updateDropdown(input, dropEl);
    });
    input.addEventListener('focus', function () {
      if (input.value.trim()) updateDropdown(input, dropEl);
    });
    input.addEventListener('keydown', function (ev) {
      onSearchKey(ev, input, dropEl);
    });
  }

  function updateDropdown(input, dropEl) {
    var q = input.value.trim();
    if (!q) { closeDropdown(); return; }
    var res = window.PM2.search.query(q, { limit: 30 });
    ui.dropdown = { open: true, host: dropEl, results: res, active: -1, query: q };
    dropEl.innerHTML = dropdownHtml(res);
    dropEl.hidden = false;
    /* keep the dropdown inside the viewport (bounded height) */
    var r = input.getBoundingClientRect();
    var room = Math.max(160, window.innerHeight - r.bottom - 28);
    dropEl.style.maxHeight = Math.min(440, room) + 'px';
    window.PMIcons.hydrate(dropEl);
  }

  function flatResults(res) {
    var flat = [];
    arr(res && res.groups).forEach(function (g) {
      arr(g.results).forEach(function (r) { flat.push(r); });
    });
    return flat;
  }

  function dropdownHtml(res) {
    if (!res.total) {
      return '<div class="c05-drop-empty"><strong>No matches for &ldquo;' + esc(res.query) + '&rdquo;.</strong>' +
        '<span>Check the spelling, try a different word, or browse the complete index.</span>' +
        '<button type="button" class="c05-btn" data-act="foot-all">Open All Settings</button></div>';
    }
    var h = '';
    var idx = 0;
    arr(res.groups).forEach(function (g) {
      h += '<div class="c05-drop-group">' + esc(g.label) + '</div>';
      arr(g.results).forEach(function (r) {
        h += '<button type="button" class="c05-result" data-rid="' + esc(r.rid) + '" data-ridx="' + idx + '" data-act="pick-result">' +
          '<span class="c05-result-ico">' + ico(KIND_ICONS[r.kind] || 'doc') + '</span>' +
          '<span class="c05-result-main"><span class="c05-result-label">' + esc(r.label) +
          (r.sub ? ' <span class="c05-result-sub">' + esc(r.sub) + '</span>' : '') + '</span>' +
          '<span class="c05-result-path">' + esc(arr(r.path).join(' › ')) + '</span>' +
          (r.availability ? '<span class="c05-result-avail">' + esc(r.availability) + '</span>' : '') +
          '</span></button>';
        idx += 1;
      });
    });
    h += '<div class="c05-drop-tail">' + res.total + ' results &middot; Enter opens the full list</div>';
    return h;
  }

  function onSearchKey(ev, input, dropEl) {
    var dd = ui.dropdown;
    if (ev.key === 'Escape') {
      if (dd.open) { closeDropdown(); ev.stopPropagation(); ev.preventDefault(); }
      return;
    }
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      if (!dd.open || !dd.results) return;
      ev.preventDefault();
      var flat = flatResults(dd.results);
      if (!flat.length) return;
      dd.active = ev.key === 'ArrowDown'
        ? Math.min(flat.length - 1, dd.active + 1)
        : Math.max(0, dd.active - 1);
      var els = dropEl.querySelectorAll('.c05-result');
      for (var i = 0; i < els.length; i++) els[i].classList.toggle('is-active', i === dd.active);
      if (els[dd.active]) {
        try { els[dd.active].scrollIntoView({ block: 'nearest' }); } catch (e) { /* fine */ }
      }
      return;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (dd.open && dd.results && dd.active >= 0) {
        var flat2 = flatResults(dd.results);
        if (flat2[dd.active]) { chooseResult(flat2[dd.active], dd.query); return; }
      }
      var q = input.value.trim();
      if (q) { closeDropdown(); go({ kind: 'search', query: q }); }
    }
  }

  function chooseResult(r, query) {
    closeDropdown();
    var q = String(query || '').trim();
    /* record the query as a real history entry so Back restores the search
       surface with its query AND its result list */
    var onSearchPage = view.kind === 'search' && view.query === q;
    if (q && !onSearchPage) {
      window.PM2.route.go({ kind: 'search', query: q }, { silent: true });
    }
    go(destOf(r), { params: { focus: r.rid } });
  }

  function destOf(r) {
    var d = obj(r.dest);
    var out = { kind: d.route || 'home' };
    if (d.cat) out.cat = d.cat;
    if (d.sub) out.sub = d.sub;
    if (d.managerId) out.managerId = d.managerId;
    if (d.objectId) out.objectId = d.objectId;
    if (d.tab) out.tab = d.tab;
    if (d.settingId) out.settingId = d.settingId;
    if (d.query) out.query = d.query;
    return out;
  }

  function closeDropdown() {
    if (ui.dropdown.host) {
      ui.dropdown.host.hidden = true;
      ui.dropdown.host.innerHTML = '';
    }
    ui.dropdown = { open: false, host: null, results: null, active: -1, query: ui.dropdown.query };
  }

  function searchPageHtml(query, missing) {
    var q = String(query || '');
    var res = q ? window.PM2.search.query(q, { limit: 60 }) : { query: '', total: 0, groups: [] };
    var h = '<div class="c05-page c05-search-page">';
    h += '<header class="c05-sub-head"><h1 class="c05-sub-title">Search</h1></header>';
    if (missing) {
      h += '<div class="c05-banner" data-kind="setup"><span class="c05-banner-word">Not found</span>' +
        '<span class="c05-banner-text"><strong>No setting lives at that address.</strong> ' +
        'The link pointed at <span class="c05-mono">' + esc(missing) + '</span>, which is not in this project&rsquo;s inventory. The closest matches are below.</span></div>';
    }
    h += '<div class="c05-search c05-search-hero"><span class="c05-search-ico">' + ico('search') + '</span>' +
      '<input type="text" id="c05SearchPageInput" data-pm2-search-input class="c05-search-input" value="' + esc(q) + '" ' +
      'placeholder="Search settings, providers, models, tools&hellip;" autocomplete="off" spellcheck="false" aria-label="Search all settings">' +
      '<div class="c05-drop" id="c05SearchPageDrop" hidden></div></div>';

    if (!q) {
      h += '<div class="c05-empty-line">Type to search all ' + fmtInt(store.counts().total) + ' settings, workspaces, and managed objects.</div>';
    } else if (!res.total) {
      h += '<div class="c05-drop-empty is-page"><strong>No matches for &ldquo;' + esc(q) + '&rdquo;.</strong>' +
        '<span>Nothing in settings, workspaces, objects, or help matches that. Check the spelling or browse the index.</span>' +
        '<button type="button" class="c05-btn" data-act="foot-all">Open All Settings</button></div>';
    } else {
      h += '<div class="c05-search-results">';
      arr(res.groups).forEach(function (g) {
        h += '<div class="c05-drop-group">' + esc(g.label) + ' <span class="c05-count">' + g.results.length + '</span></div>';
        arr(g.results).forEach(function (r) {
          h += '<button type="button" class="c05-result" data-rid="' + esc(r.rid) + '" data-act="pick-result-page">' +
            '<span class="c05-result-ico">' + ico(KIND_ICONS[r.kind] || 'doc') + '</span>' +
            '<span class="c05-result-main"><span class="c05-result-label">' + esc(r.label) +
            (r.sub ? ' <span class="c05-result-sub">' + esc(r.sub) + '</span>' : '') + '</span>' +
            '<span class="c05-result-path">' + esc(arr(r.path).join(' › ')) + '</span>' +
            (r.availability ? '<span class="c05-result-avail">' + esc(r.availability) + '</span>' : '') +
            '</span></button>';
        });
      });
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  /* ==================================================================== */
  /* COPY SETTINGS (focused review flow over dimmed workspace)             */
  /* ==================================================================== */

  function resetCopy() {
    ui.copy = { step: 1, sourceId: null, cats: {}, preview: null, applying: false,
                result: null, rolledBack: false, itemPages: 1 };
  }

  function renderOverlay() {
    if (view.kind !== 'copy') {
      overlayEl.hidden = true;
      overlayEl.innerHTML = '';
      return;
    }
    if (!ui.copy) resetCopy();
    overlayEl.hidden = false;
    overlayEl.innerHTML = '<div class="c05-dim" data-act="copy-cancel"></div>' +
      '<div class="c05-panel" role="dialog" aria-modal="true" aria-label="Copy settings from another project">' +
      copyPanelHtml() + '</div>';
    window.PMIcons.hydrate(overlayEl);
  }

  var COPY_STEPS = ['Source', 'Categories', 'Review', 'Apply & verify'];

  function copyPanelHtml() {
    var c = ui.copy;
    var stepIdx = c.result ? 4 : c.step;
    var h = '<div class="c05-panel-head"><div class="c05-panel-title">Copy Settings From Another Project</div>' +
      '<button type="button" class="c05-x" data-act="copy-cancel" aria-label="Close">' + ico('close') + '</button></div>';
    h += '<div class="c05-stepper">';
    COPY_STEPS.forEach(function (s, i) {
      var n = i + 1;
      var cls = n < stepIdx ? 'is-done' : (n === stepIdx ? 'is-here' : '');
      h += '<span class="c05-step ' + cls + '"><span class="c05-step-n">' + n + '</span> ' + esc(s) + '</span>';
    });
    h += '</div>';
    h += '<p class="c05-panel-note">A one-time transaction into <strong>' + esc(store.data.project.name) +
      '</strong>. Nothing stays linked; the two projects remain independent afterward.</p>';
    h += '<div class="c05-panel-body">';

    if (c.result) h += copyReceiptHtml();
    else if (c.step === 1) h += copyStep1Html();
    else if (c.step === 2) h += copyStep2Html();
    else if (c.step === 3) h += copyStep3Html();
    else if (c.step === 4) h += copyStep4Html();

    h += '</div>';
    h += '<div class="c05-opstrip" id="c05CopyOp" hidden></div>';
    h += '<div class="c05-panel-foot">';
    if (c.result) {
      h += '<span class="c05-top-flex"></span><button type="button" class="c05-btn is-primary" data-act="copy-done">Done</button>';
    } else {
      if (c.step > 1) h += '<button type="button" class="c05-btn" data-act="copy-back" data-pm2-back aria-label="Back to previous step"' + (c.applying ? ' disabled' : '') + '>Back</button>';
      h += '<span class="c05-top-flex"></span>';
      h += '<button type="button" class="c05-btn" data-act="copy-cancel"' + (c.applying ? ' disabled' : '') + '>Cancel</button>';
      if (c.step === 1) {
        h += '<button type="button" class="c05-btn is-primary" data-act="copy-next"' + (c.sourceId ? '' : ' disabled') + '>Continue</button>';
      } else if (c.step === 2) {
        var picked = Object.keys(c.cats).filter(function (k) { return c.cats[k]; }).length;
        h += '<button type="button" class="c05-btn is-primary" data-act="copy-preview"' + (picked ? '' : ' disabled') + '>Preview</button>';
      } else if (c.step === 3) {
        h += '<button type="button" class="c05-btn is-primary" data-act="copy-to-apply">Continue</button>';
      } else if (c.step === 4) {
        h += '<button type="button" class="c05-btn is-primary" data-act="copy-apply"' + (c.applying ? ' disabled' : '') + '>' +
          (c.applying ? 'Applying&hellip;' : 'Create restore point &amp; apply') + '</button>';
      }
    }
    h += '</div>';
    return h;
  }

  function copyStep1Html() {
    var sources = window.PM2.copy.sources();
    var c = ui.copy;
    var h = '<div class="c05-copy-sources">';
    sources.forEach(function (s) {
      var summary = arr(s.categorySummaries).map(function (x) { return x.title + ' (' + x.count + ')'; }).join(' &middot; ');
      h += '<label class="c05-copy-source' + (c.sourceId === s.id ? ' is-picked' : '') + '">' +
        '<input type="radio" name="c05src" value="' + esc(s.id) + '" data-act="copy-source"' + (c.sourceId === s.id ? ' checked' : '') + '>' +
        '<span class="c05-copy-source-main"><span class="c05-copy-source-name">' + esc(s.name) +
        (s.legacy ? ' <span class="c05-tag">Legacy format</span>' : '') + '</span>' +
        '<span class="c05-copy-source-sub">Updated ' + esc(fmtWhen(s.lastUpdated)) + '</span>' +
        '<span class="c05-copy-source-cats">' + summary + '</span></span></label>';
    });
    h += '</div>';
    return h;
  }

  function copyStep2Html() {
    var c = ui.copy;
    var sources = window.PM2.copy.sources();
    var src = null;
    sources.forEach(function (s) { if (s.id === c.sourceId) src = s; });
    if (!src) return '<div class="c05-empty-line">Pick a source project first.</div>';
    var h = '<div class="c05-copy-choose"><div class="c05-copy-choose-head">What should be copied from ' + esc(src.name) + '?' +
      '<span class="c05-top-flex"></span>' +
      '<button type="button" class="c05-mini" data-act="copy-cats-all">All</button>' +
      '<button type="button" class="c05-mini" data-act="copy-cats-none">None</button></div>';
    arr(src.categorySummaries).forEach(function (x) {
      var on = !!c.cats[x.cat];
      h += '<label class="c05-check"><input type="checkbox" value="' + esc(x.cat) + '" data-act="copy-cat"' + (on ? ' checked' : '') + '>' +
        '<span>' + esc(x.title) + '</span><span class="c05-count">' + x.count + ' values</span></label>';
    });
    h += '</div>';
    return h;
  }

  function copyStep3Html() {
    var c = ui.copy;
    if (!c.preview) return '<div class="c05-empty-line">No preview staged.</div>';
    var p = c.preview;
    var h = '<div class="c05-copy-counts">';
    [['add', 'To add'], ['replace', 'To replace'], ['unchanged', 'Unchanged'], ['unavailable', 'Unavailable'], ['conflict', 'Conflicts']].forEach(function (pair) {
      h += '<span class="c05-copy-count" data-kind="' + pair[0] + '"><strong>' + p.counts[pair[0]] + '</strong> ' + pair[1] + '</span>';
    });
    h += '</div>';

    h += '<div class="c05-scroll-x"><table class="c05-table"><thead><tr><th>Category</th><th>Add</th><th>Replace</th><th>Unchanged</th><th>Unavailable</th><th>Conflict</th></tr></thead><tbody>';
    arr(p.perCategory).forEach(function (pc) {
      h += '<tr><td>' + esc(pc.title) + '</td><td>' + pc.counts.add + '</td><td>' + pc.counts.replace + '</td><td>' +
        pc.counts.unchanged + '</td><td>' + pc.counts.unavailable + '</td><td>' + pc.counts.conflict + '</td></tr>';
    });
    h += '</tbody></table></div>';

    var cap = 30 * (c.itemPages || 1);
    var items = arr(p.items);
    h += '<div class="c05-copy-items">';
    items.slice(0, cap).forEach(function (it) {
      h += '<div class="c05-copy-item" data-kind="' + esc(it.kind) + '">' +
        '<span class="c05-copy-item-kind">' + esc(it.kind) + '</span>' +
        '<span class="c05-copy-item-main"><span class="c05-copy-item-label">' + esc(it.label) + '</span>' +
        '<span class="c05-copy-item-delta">' +
        (it.kind === 'add' ? 'Will become ' + esc(fmtVal(it.incoming))
          : it.kind === 'replace' ? esc(fmtVal(it.current)) + ' &#8594; ' + esc(fmtVal(it.incoming))
          : it.kind === 'unchanged' ? 'Stays ' + esc(fmtVal(it.current))
          : esc(fmtVal(it.incoming))) + '</span>' +
        (it.note ? '<span class="c05-copy-item-note">' + esc(it.note) + '</span>' : '') +
        '</span><span class="c05-copy-item-cat">' + esc(catTitle(it.cat)) + '</span></div>';
    });
    if (items.length > cap) {
      h += '<button type="button" class="c05-more" data-act="copy-items-more">Show ' + Math.min(30, items.length - cap) + ' more of ' + items.length + '</button>';
    }
    h += '</div>';

    h += '<div class="c05-cred-note">' + ico('key') + '<span>' + esc(p.credentialNote) + '</span></div>';
    return h;
  }

  function copyStep4Html() {
    var c = ui.copy;
    var p = c.preview;
    var writes = p ? p.counts.add + p.counts.replace : 0;
    var h = '<div class="c05-copy-apply">' +
      '<p><strong>' + writes + ' value(s)</strong> will be written into ' + esc(store.data.project.name) + ' in one atomic pass.</p>' +
      '<ol class="c05-steps">' +
      '<li><span class="c05-step-label">Create a restore point</span><span class="c05-step-detail">Exact snapshots of every value the transaction touches, taken before anything changes.</span></li>' +
      '<li><span class="c05-step-label">Apply atomically</span><span class="c05-step-detail">All values in one pass; the project is never half-written.</span></li>' +
      '<li><span class="c05-step-label">Verify</span><span class="c05-step-detail">Every written value is read back. A mismatch restores the restore point automatically.</span></li>' +
      '</ol>' +
      '<p class="c05-note">Unchanged, unavailable, and conflicting values are never written. This is a one-time copy — future changes in the source do not propagate.</p></div>';
    return h;
  }

  function copyReceiptHtml() {
    var c = ui.copy;
    var r = c.result;
    if (!r.ok) {
      return '<div class="c05-copy-receipt" data-tone="attention"><div class="c05-receipt-head">' + ico('warning') +
        '<strong>Not applied</strong></div><p>' + esc(r.error || 'The transaction did not complete.') + '</p></div>';
    }
    var h = '<div class="c05-copy-receipt" data-tone="ok"><div class="c05-receipt-head">' + ico('check') +
      '<strong>' + (c.rolledBack ? 'Rolled back' : 'Copied and verified') + '</strong></div>';
    h += '<div class="c05-kv"><span class="c05-kv-k">Receipt</span><span class="c05-kv-v">' + esc(r.receiptId) + '</span></div>';
    h += '<div class="c05-kv"><span class="c05-kv-k">Restore point</span><span class="c05-kv-v">' + esc(r.restorePointId) + '</span></div>';
    h += '<div class="c05-kv"><span class="c05-kv-k">Applied</span><span class="c05-kv-v">' + r.applied + ' value(s), verified by read-back</span></div>';
    if (r.skipped) {
      h += '<div class="c05-kv"><span class="c05-kv-k">Not applied</span><span class="c05-kv-v">' + r.skipped.unchanged +
        ' unchanged &middot; ' + r.skipped.unavailable + ' unavailable &middot; ' + r.skipped.conflict + ' conflicts</span></div>';
    }
    if (c.rolledBack) {
      h += '<p class="c05-note">The restore point has been applied. Every copied value is back to its previous state; the receipt above records the round trip.</p>';
    } else {
      h += '<button type="button" class="c05-btn" data-act="copy-rollback">' + ico('undo') + '<span>Roll back this copy</span></button>';
    }
    h += '</div>';
    return h;
  }

  function fmtWhen(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function fmtVal(v) {
    if (v == null) return '—';
    if (typeof v === 'boolean') return v ? 'On' : 'Off';
    if (Array.isArray(v)) return v.length + ' items';
    if (typeof v === 'object') return Object.keys(v).length + ' entries';
    var s = String(v);
    return s.length > 42 ? s.slice(0, 41) + '…' : s;
  }

  /* ==================================================================== */
  /* POPUP MENUS (PM family behavior)                                      */
  /* ==================================================================== */

  var menuState = null; /* {invoker, el, onPick, multi, settingId} */

  function openMenu(invoker, options, opts) {
    closeMenu();
    var o = obj(opts);
    var el = document.createElement('div');
    el.className = 'c05-menu';
    el.setAttribute('role', 'menu');
    var h = '';
    options.forEach(function (op, i) {
      h += '<button type="button" class="c05-menu-item" role="' + (o.multi ? 'menuitemcheckbox' : 'menuitemradio') + '" ' +
        'aria-checked="' + !!op.selected + '" data-mi="' + i + '">' +
        '<span class="c05-menu-check">' + (op.selected ? ico('check') : '') + '</span>' +
        '<span>' + esc(op.label) + '</span></button>';
    });
    el.innerHTML = h;
    menuLayer.appendChild(el);
    window.PMIcons.hydrate(el);

    /* position with collision flip near edges (fixed layer) */
    var r = invoker.getBoundingClientRect();
    var mw = Math.max(el.offsetWidth, r.width);
    var left = Math.min(r.left, window.innerWidth - mw - 8);
    var top = r.bottom + 4;
    if (top + el.offsetHeight > window.innerHeight - 8) {
      top = Math.max(8, r.top - el.offsetHeight - 4); /* flip above */
    }
    el.style.left = Math.max(8, left) + 'px';
    el.style.top = top + 'px';

    menuState = { invoker: invoker, el: el, options: options, onPick: o.onPick, multi: !!o.multi };
    var first = el.querySelector('[aria-checked="true"]') || el.querySelector('.c05-menu-item');
    if (first) first.focus();

    el.addEventListener('click', function (ev) {
      var b = ev.target.closest('.c05-menu-item');
      if (!b) return;
      var i = Number(b.getAttribute('data-mi'));
      if (menuState && menuState.onPick) menuState.onPick(options[i], i);
      if (!o.multi) closeMenu(true);
      else {
        options[i].selected = !options[i].selected;
        b.setAttribute('aria-checked', String(options[i].selected));
        b.querySelector('.c05-menu-check').innerHTML = options[i].selected ? window.PMIcons.get('check') : '';
      }
    });
    el.addEventListener('keydown', function (ev) {
      var items = el.querySelectorAll('.c05-menu-item');
      var cur = -1;
      for (var i = 0; i < items.length; i++) if (items[i] === document.activeElement) cur = i;
      if (ev.key === 'ArrowDown') { ev.preventDefault(); (items[Math.min(items.length - 1, cur + 1)] || items[0]).focus(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); (items[Math.max(0, cur - 1)] || items[0]).focus(); }
      else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); closeMenu(true); }
      else if (ev.key === 'Tab') { closeMenu(false); }
    });
    setTimeout(function () {
      document.addEventListener('mousedown', onMenuOutside, true);
    }, 0);
  }

  function onMenuOutside(ev) {
    if (menuState && !menuState.el.contains(ev.target) && ev.target !== menuState.invoker) closeMenu(false);
  }

  function closeMenu(refocus) {
    document.removeEventListener('mousedown', onMenuOutside, true);
    if (!menuState) return;
    var inv = menuState.invoker;
    if (menuState.el.parentNode) menuState.el.parentNode.removeChild(menuState.el);
    menuState = null;
    if (refocus && inv && document.contains(inv)) inv.focus();
  }

  /* ==================================================================== */
  /* EVENT WIRING                                                          */
  /* ==================================================================== */

  function onRootClick(ev) {
    /* clicking outside an open dropdown closes it (Esc also closes) */
    if (ui.dropdown.open && ui.dropdown.host) {
      var wrap = ui.dropdown.host.parentNode;
      if (wrap && !wrap.contains(ev.target)) closeDropdown();
    }
    var t = ev.target.closest('[data-act]');
    if (!t || t.disabled) return;
    var act = t.getAttribute('data-act');

    /* ---- navigation ---- */
    if (act === 'back' || act === 'crumb') {
      if (act === 'crumb') {
        var segs = crumbSegs();
        var seg = segs[Number(t.getAttribute('data-crumb'))];
        if (seg && seg.dest) go(seg.dest);
        return;
      }
      var p = parentOf(view);
      if (p) go(p);
      return;
    }
    if (act === 'close-settings') {
      var rc = window.PM2.states.receipt('Close Settings', 'Returns to the Dashboard. In this concept page the Settings surface stays open.');
      void rc;
      return;
    }
    if (act === 'card') {
      var catId = t.getAttribute('data-cat');
      var c = catById[catId];
      if (c && motionOn()) {
        var rect = t.getBoundingClientRect();
        pendingMorph = { cat: catId, rect: rect, icon: c.icon, title: c.title };
      }
      go({ kind: 'dest', cat: catId });
      return;
    }
    if (act === 'sub') { go({ kind: 'dest', cat: t.getAttribute('data-cat'), sub: t.getAttribute('data-sub') }); return; }
    if (act === 'mgr') { go({ kind: 'manager', managerId: t.getAttribute('data-manager') }); return; }
    if (act === 'rail-cat') { go({ kind: 'dest', cat: t.getAttribute('data-cat') }); return; }
    if (act === 'rail-all' || act === 'foot-all') { go({ kind: 'all' }); return; }
    if (act === 'rail-copy' || act === 'foot-copy') { go({ kind: 'copy' }); return; }
    if (act === 'recent' || act === 'all-open') {
      go({ kind: 'setting', settingId: t.getAttribute('data-setting') });
      return;
    }
    if (act === 'attn') {
      var a = store.attention()[Number(t.getAttribute('data-attn'))];
      if (a && a.dest) go(destOf({ dest: a.dest }));
      return;
    }
    if (act === 'attn-more') { ui.attnMore = true; render(null); return; }
    if (act === 'notice-act') {
      var nact = t.getAttribute('data-notice-act');
      var names = [];
      try { names = window.PM2.states.triggerNames(); } catch (e) { names = []; }
      if (names.indexOf(nact) >= 0) { window.PM2.states.trigger(nact); return; }
      var banner = pickBanner();
      go(destOf({ dest: noticeActDest(nact, banner && banner.target) }));
      return;
    }
    if (act === 'jump') {
      var dest = null;
      try { dest = JSON.parse(t.getAttribute('data-dest')); } catch (e) { dest = null; }
      if (dest) {
        var jopts = dest.sectionId ? { params: { focus: dest.sectionId } } : undefined;
        go(destOf({ dest: dest }), jopts);
      }
      return;
    }

    /* ---- disclosures ---- */
    if (act === 'adv') {
      var key = t.getAttribute('data-key');
      ui.advOpen[key] = !ui.advOpen[key];
      render(null);
      return;
    }
    if (act === 'row-details' || act === 'drawer') {
      var dk = t.getAttribute('data-key');
      ui.detailOpen[dk] = !ui.detailOpen[dk];
      render(null);
      return;
    }
    if (act === 'table-more') {
      var tk = t.getAttribute('data-key');
      ui.tableMore[tk] = (ui.tableMore[tk] || 0) + 1;
      render(null);
      return;
    }

    /* ---- manager navigation ---- */
    if (act === 'mgr-obj') {
      go({ kind: 'manager', managerId: t.getAttribute('data-manager'), objectId: t.getAttribute('data-object-id') });
      return;
    }
    if (act === 'mgr-tab') {
      go({ kind: 'manager', managerId: t.getAttribute('data-manager'), objectId: t.getAttribute('data-object'), tab: t.getAttribute('data-tab') });
      return;
    }
    if (act === 'mgr-sec') {
      var sid = t.getAttribute('data-sec');
      var target = mainEl.querySelector('[data-section="' + cssEsc(sid) + '"]');
      if (target) {
        try { target.scrollIntoView({ block: 'start', behavior: motionOn() ? 'smooth' : 'auto' }); } catch (e) { target.scrollIntoView(); }
      }
      if (rootEl.classList.contains('is-narrow')) { ui.mgrPane = 'detail'; render(null); }
      return;
    }
    if (act === 'mgr-list') { ui.mgrPane = 'list'; render(null); return; }
    if (act === 'mgr-action') {
      var def = managerDef(t.getAttribute('data-manager'));
      if (!def) return;
      var actions = arr(def.actions && def.actions(store));
      var a2 = actions[Number(t.getAttribute('data-action-idx'))];
      if (a2 && typeof a2.run === 'function') {
        var res = a2.run(store);
        if (res && res.simulated && res.message) { /* receipt event already toasts */ }
      }
      return;
    }

    /* ---- row controls ---- */
    if (act === 'toggle') {
      var id = t.getAttribute('data-setting');
      var row = store.resolveRow(id);
      if (!row) return;
      commitValue(id, !(row.value === true || row.value === 'on'));
      return;
    }
    if (act === 'select') {
      var sid2 = t.getAttribute('data-setting');
      var row2 = store.resolveRow(sid2);
      if (!row2) return;
      openMenu(t, arr(row2.control.options).map(function (op) {
        return { id: op, label: humanOption(op), selected: op === row2.value };
      }), { onPick: function (op) { commitValue(sid2, op.id); } });
      return;
    }
    if (act === 'multi') {
      var sid3 = t.getAttribute('data-setting');
      var row3 = store.resolveRow(sid3);
      if (!row3) return;
      var cur = arr(row3.value).slice();
      openMenu(t, arr(row3.control.options).map(function (op) {
        return { id: op, label: humanOption(op), selected: cur.indexOf(op) >= 0 };
      }), {
        multi: true,
        onPick: function (op) {
          var i = cur.indexOf(op.id);
          if (i >= 0) cur.splice(i, 1); else cur.push(op.id);
          commitValue(sid3, cur.slice(), { keepMenu: true });
        }
      });
      return;
    }
    if (act === 'row-action') {
      var sid4 = t.getAttribute('data-setting');
      var row4 = store.resolveRow(sid4);
      if (row4) {
        window.PM2.states.receipt(row4.label, 'This action opens its own flow in the full product. Simulated here — nothing ran.');
      }
      return;
    }
    if (act === 'text-edit') {
      var sid5 = t.getAttribute('data-setting');
      var row5 = store.resolveRow(sid5);
      if (!row5) return;
      /* string-valued slider: offer the recommended/default plus free entry */
      var opts5 = [];
      if (row5.recommended !== undefined) opts5.push({ id: String(row5.recommended), label: String(row5.recommended), selected: String(row5.recommended) === String(row5.value) });
      var dflt = invById[sid5] ? invById[sid5]['default'] : null;
      if (dflt != null && String(dflt) !== String(row5.recommended)) opts5.push({ id: String(dflt), label: String(dflt), selected: String(dflt) === String(row5.value) });
      if (!opts5.length) opts5.push({ id: String(row5.value || ''), label: String(row5.value || 'current'), selected: true });
      openMenu(t, opts5, { onPick: function (op) { commitValue(sid5, op.id); } });
      return;
    }

    /* ---- search ---- */
    if (act === 'pick-result' || act === 'pick-result-page') {
      var rid = t.getAttribute('data-rid');
      var r = null;
      try { r = window.PM2.search.resolveRid(rid); } catch (e) { r = null; }
      if (!r) return;
      var q = act === 'pick-result' ? ui.dropdown.query : (view.kind === 'search' ? view.query : '');
      if (act === 'pick-result-page') { go(destOf(r), { params: { focus: r.rid } }); return; }
      chooseResult(r, q);
      return;
    }

    /* ---- copy flow ---- */
    if (act === 'copy-cancel') { if (!ui.copy || !ui.copy.applying) leaveCopy(); return; }
    if (act === 'copy-done') { ui.copy = null; leaveCopy(); return; }
    if (act === 'copy-back') { if (ui.copy.step > 1) { ui.copy.step -= 1; renderOverlay(); } return; }
    if (act === 'copy-next') { if (ui.copy.sourceId) { ui.copy.step = 2; renderOverlay(); } return; }
    if (act === 'copy-cats-all' || act === 'copy-cats-none') {
      var srcs = window.PM2.copy.sources();
      var src = null;
      srcs.forEach(function (s) { if (s.id === ui.copy.sourceId) src = s; });
      ui.copy.cats = {};
      if (src && act === 'copy-cats-all') {
        arr(src.categorySummaries).forEach(function (x) { ui.copy.cats[x.cat] = true; });
      }
      renderOverlay();
      return;
    }
    if (act === 'copy-preview') {
      var catIds = Object.keys(ui.copy.cats).filter(function (k) { return ui.copy.cats[k]; });
      ui.copy.preview = window.PM2.copy.preview(ui.copy.sourceId, catIds);
      ui.copy.itemPages = 1;
      ui.copy.step = 3;
      renderOverlay();
      return;
    }
    if (act === 'copy-items-more') { ui.copy.itemPages += 1; renderOverlay(); return; }
    if (act === 'copy-to-apply') { ui.copy.step = 4; renderOverlay(); return; }
    if (act === 'copy-apply') {
      if (!ui.copy.preview || ui.copy.applying) return;
      ui.copy.applying = true;
      renderOverlay();
      window.PM2.copy.apply(ui.copy.preview.token).then(function (res) {
        ui.copy.applying = false;
        ui.copy.result = res;
        renderOverlay();
      });
      return;
    }
    if (act === 'copy-rollback') {
      Promise.resolve(window.PM2.copy.rollback(ui.copy.result.receiptId)).then(function (rres) {
        if (rres && rres.ok) { ui.copy.rolledBack = true; renderOverlay(); }
      });
      return;
    }
  }

  function leaveCopy() {
    var under = view.under || { kind: 'home' };
    go(viewRouteObj(under));
  }

  function commitValue(id, value, opts) {
    var o = obj(opts);
    var res = store.setValue(id, value, { source: 'settings' });
    if (!res.ok) {
      ui.rowError = { id: id, msg: res.error };
    } else {
      ui.rowError = null;
    }
    ui.pendingFocus = id;
    if (!o.keepMenu) closeMenu(false);
    /* store 'value' event queues the re-render; error path re-renders here */
    if (!res.ok) queueRender();
  }

  function onRootChange(ev) {
    var t = ev.target;
    var act = t.getAttribute && t.getAttribute('data-act');
    if (act === 'num') {
      var v = t.value === '' ? NaN : Number(t.value);
      commitValue(t.getAttribute('data-setting'), isNaN(v) ? t.value : v);
      return;
    }
    if (act === 'text') { commitValue(t.getAttribute('data-setting'), t.value); return; }
    if (act === 'slider') {
      commitValue(t.getAttribute('data-setting'), Number(t.value));
      return;
    }
    if (act === 'host-pick') { ui.hostPick[t.getAttribute('data-key')] = t.value; return; }
    if (act === 'copy-source') { ui.copy.sourceId = t.value; renderOverlay(); return; }
    if (act === 'copy-cat') { ui.copy.cats[t.value] = t.checked; renderOverlay(); return; }
    if (t.classList && t.classList.contains('c05-facet')) {
      ui.all[t.getAttribute('data-facet')] = t.value;
      render(null);
      return;
    }
  }

  function onRootInput(ev) {
    var t = ev.target;
    if (t.id === 'c05AllQ') {
      ui.all.q = t.value;
      /* live-filter the virtual window only; the facet bar keeps focus */
      var rows = filteredAllRows();
      var count = mainEl.querySelector('.c05-all-count');
      if (count) count.textContent = fmtInt(rows.length) + ' of ' + fmtInt(buildAllRows().length);
      renderAllWindow();
      return;
    }
    if (t.classList && t.classList.contains('c05-slider')) {
      var lab = mainEl.querySelector('[data-slider-val="' + cssEsc(t.getAttribute('data-setting')) + '"]');
      if (lab) lab.textContent = t.value;
    }
  }

  function onRootKey(ev) {
    /* search inputs carry their own key handling via wireSearchField */
    void ev;
  }

  function onGlobalKey(ev) {
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'k' || ev.key === 'K')) {
      ev.preventDefault();
      if (view.kind === 'copy') { leaveCopy(); }
      var target = byId('c05HeroSearch') || byId('c05TopSearch') || byId('c05SearchPageInput');
      if (target) { target.focus(); target.select(); }
      return;
    }
    if (ev.key !== 'Escape') return;
    /* Escape ladder: popup -> drawer/dropdown -> one level out -> stop at Home */
    if (menuState) { closeMenu(true); ev.preventDefault(); return; }
    if (ui.dropdown.open) { closeDropdown(); ev.preventDefault(); return; }
    if (view.kind === 'copy') { if (!ui.copy || !ui.copy.applying) leaveCopy(); ev.preventDefault(); return; }
    if (view.kind === 'home') return;
    var p = parentOf(view);
    if (p) { go(p); ev.preventDefault(); }
  }

  /* ---------------- start ---------------- */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
