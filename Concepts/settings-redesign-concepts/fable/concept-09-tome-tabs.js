/* concept-09-tome-tabs.js — fable · 09 Chapters
   Rethemed Tome Tabs: the LAYOUT SYSTEM of the tome reference re-expressed
   entirely in current Puppet Master materials (pm-shell theme tokens, PM
   icons, PM menus, PM motion). No parchment, no brass, no ornament.

   Layout system borrowed (layout only):
     - persistent right-edge vertical chapter tab spine (Home + 12 chapters)
     - layered page depth: deeper navigation pushes a page layer; the
       previous layer stays visible as a slim named edge on the left
     - broad central reading canvas per layer
     - domain chapter pages + manager-local horizontal tab rows
     - roster + tabbed-detail manager composition
     - stepwise copy transaction (numbered steps as stacked sheets)

   Contract: fable/_shared2/CONTRACT2.md. All data via PM2.* shared modules;
   every visible surface here is concept-native (c09- prefix only).
   Slint notes inline. Plain script, no build step, no emoji. */
(function () {
  'use strict';

  var store = null;
  var stage = null;
  var rootEl = null;
  var layersEl = null;
  var spineEl = null;
  var spineWrapEl = null;
  var opsEl = null;

  var MOTION_MS = 320;       /* settle timer; never depends on transitionend */
  var LOCATE_MS = 1900;      /* pm2-located decay removal */

  /* Short quiet labels for the spine tabs (full titles live on the pages). */
  var SPINE_LABELS = {
    general: 'General', ai: 'AI Brains', safety: 'Safety', code: 'Code',
    memory: 'Memory', planning: 'Planning', branching: 'Branching',
    media: 'Media', web: 'Web', personas: 'Personas',
    extensions: 'Extensions', system: 'System'
  };

  var TAB_LABELS = {
    overview: 'Overview', accounts: 'Accounts', models: 'Models',
    limits: 'Usage & limits', routing: 'Routing', installs: 'Installations',
    setup: 'Set up', activity: 'Activity', advanced: 'Advanced',
    routes: 'Routes', catalog: 'Catalog', server: 'Server',
    members: 'Members', guards: 'Guards', workflow: 'Workflow'
  };

  /* ============================ ui state ============================
     Explicit state machines (Slint-portable): the layer stack, the search
     popover, the popup menu, and the copy transaction are plain data. */

  var ui = {
    layers: [],            /* [{key, kind, el, state, scrollTop, stale}] */
    narrow: false,
    search: { query: '', open: false, results: null, active: -1, ownerKey: null, restoreHash: null },
    menu: null,            /* {el, anchor, invoker, onClose} */
    advOpen: {},           /* 'cat/sub' -> true */
    detailsOpen: {},       /* drawer key -> true (rows, manager sections, cards) */
    detailStack: [],       /* open drawer ids, most recent last */
    copy: null,            /* copy transaction state, built on entry */
    all: { q: '', cat: '', type: '', tier: '', state: '', changed: false },
    ops: {},               /* opId -> payload */
    opOrder: [],
    receipts: []           /* transient receipt lines */
  };

  /* ============================ helpers ============================ */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function ico(name) { return '<i data-ico="' + esc(name) + '"></i>'; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object' && !Array.isArray(x)) ? x : {}; }
  function str(x) { return typeof x === 'string' ? x : ''; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function hydrate(el) {
    try { if (window.PMIcons && el) { window.PMIcons.hydrate(el); } } catch (e) { /* icons optional */ }
  }

  function div(cls, html) {
    var d = document.createElement('div');
    if (cls) { d.className = cls; }
    if (html != null) { d.innerHTML = html; }
    return d;
  }

  function fmtWhen(iso) {
    if (!iso) { return ''; }
    try {
      if (window.PM2 && window.PM2.util && window.PM2.util.fmtAgo) {
        var ago = window.PM2.util.fmtAgo(iso);
        if (ago) { return ago; }
      }
    } catch (e) { /* fall through */ }
    return String(iso).slice(0, 10);
  }
  function fmtInt(n) {
    try { return window.PM2.util.fmtInt(n); } catch (e) { return String(n); }
  }

  function inventory() { return obj(window.PM2_INVENTORY); }
  function categories() { return arr(inventory().categories); }
  function catById(id) {
    var cats = categories();
    for (var i = 0; i < cats.length; i++) { if (cats[i].id === id) { return cats[i]; } }
    return null;
  }
  function catNum(id) {
    var cats = categories();
    for (var i = 0; i < cats.length; i++) { if (cats[i].id === id) { return pad2(i + 1); } }
    return '';
  }
  function subTitle(cat, sub) {
    var c = catById(cat);
    if (!c) { return sub; }
    var subs = arr(c.subgroups);
    for (var i = 0; i < subs.length; i++) { if (subs[i].id === sub) { return subs[i].title; } }
    return sub;
  }
  var settingIndex = null;
  function settingById(id) {
    if (!settingIndex) {
      settingIndex = {};
      arr(inventory().settings).forEach(function (s) { settingIndex[s.id] = s; });
    }
    return settingIndex[id] || null;
  }

  function managerDef(id) {
    try { return window.PM2.managers.get(id); } catch (e) { return null; }
  }
  function managersByCat(cat) {
    try { return window.PM2.managers.byCat(cat); } catch (e) { return []; }
  }
  function statesApi() { return (window.PM2 && window.PM2.states) ? window.PM2.states : null; }

  function scenario() {
    /* URL-applied scenarios (no pin=1) never persist to the store key, so
       PM2.states is the authority; the store key is the fallback. */
    var S = statesApi();
    if (S && typeof S.activeScenario === 'function') {
      try {
        var a = S.activeScenario();
        if (a) { return str(a); }
      } catch (e) { /* fall through */ }
    }
    return str(store.get('scenario')) || 'baseline';
  }

  function receiptOut(label, detail) {
    var S = statesApi();
    if (S && typeof S.receipt === 'function') { return S.receipt(label, detail); }
    return null;
  }

  function goDest(dest, params) {
    try { window.PM2.route.go(dest, params ? { params: params } : undefined); }
    catch (e) { /* router optional in harness */ }
  }
  function goHash(hash, opts) {
    try { window.PM2.route.go(hash, opts); } catch (e) { /* ignore */ }
  }

  function tabLabel(tabId, section) {
    if (section && section.title && section.title.length <= 22) { return section.title; }
    if (TAB_LABELS[tabId]) { return TAB_LABELS[tabId]; }
    var s = String(tabId || '').replace(/[-_.]+/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ============================ route -> stack ============================ */

  function destCatOfManager(mid) {
    var def = managerDef(mid);
    return def ? def.cat : null;
  }

  /* Build the layer plan for a destination. Every plan starts at Home so the
     under-layer edges always tell the full location story. */
  function planFor(dest) {
    var kind = str(dest.route) || str(dest.kind) || 'home';
    var plan = [{ key: 'home', kind: 'home' }];
    if (kind === 'dest' && dest.cat && catById(dest.cat)) {
      plan.push({ key: 'dest/' + dest.cat, kind: 'dest', cat: dest.cat, sub: dest.sub || null });
    } else if (kind === 'setting') {
      var s = settingById(str(dest.settingId));
      var cat = s ? s.cat : str(dest.settingId).split('.')[0];
      if (!catById(cat)) { cat = null; }
      if (cat) {
        plan.push({ key: 'dest/' + cat, kind: 'dest', cat: cat, sub: s ? s.sub : null,
                    settingId: str(dest.settingId), missing: !s });
      }
    } else if (kind === 'manager' && dest.managerId && managerDef(dest.managerId)) {
      var mcat = destCatOfManager(dest.managerId);
      if (mcat && catById(mcat)) {
        plan.push({ key: 'dest/' + mcat, kind: 'dest', cat: mcat, sub: null });
      }
      plan.push({ key: 'manager/' + dest.managerId, kind: 'manager',
                  managerId: dest.managerId, objectId: dest.objectId || null,
                  tab: dest.tab || null });
    } else if (kind === 'all') {
      plan.push({ key: 'all', kind: 'all' });
    } else if (kind === 'copy') {
      plan.push({ key: 'copy', kind: 'copy' });
    } else if (kind === 'search') {
      /* search renders on Home with the query restored */
      plan[0].searchQuery = str(dest.query);
    } else if (kind === 'manager' || kind === 'dest' || kind === 'setting') {
      /* unknown target: stay on Home with an honest notice */
      plan[0].notice = 'That link pointed somewhere this Project does not have. Starting from Settings Home instead.';
    }
    return plan;
  }

  /* ============================ layer titles ============================ */

  /* entry may be a plan entry ({kind, cat, …}) or a live layer ({kind, state}) */
  function entryProp(entry, key) {
    if (entry[key] != null) { return entry[key]; }
    return entry.state ? entry.state[key] : null;
  }

  function layerTitle(entry) {
    if (entry.kind === 'home') { return 'Settings Home'; }
    if (entry.kind === 'dest') {
      var c = catById(entryProp(entry, 'cat'));
      return c ? c.title : 'Chapter';
    }
    if (entry.kind === 'manager') {
      var def = managerDef(entryProp(entry, 'managerId'));
      return def ? def.title : 'Manager';
    }
    if (entry.kind === 'all') { return 'All Settings'; }
    if (entry.kind === 'copy') { return 'Copy Settings'; }
    return 'Settings';
  }

  function layerRoute(entry) {
    if (entry.kind === 'dest') { return { route: 'dest', cat: entryProp(entry, 'cat') }; }
    if (entry.kind === 'manager') { return { route: 'manager', managerId: entryProp(entry, 'managerId') }; }
    if (entry.kind === 'all') { return { route: 'all' }; }
    if (entry.kind === 'copy') { return { route: 'copy' }; }
    return { route: 'home' };
  }

  /* ============================ spine ============================ */

  function buildSpine() {
    var html = '';
    html += '<button class="c09-tab c09-tab-home" data-chapter="home" aria-current="false">' +
      '<span class="c09-tab-ico">' + ico('grid') + '</span>' +
      '<span class="c09-tab-label">Home</span></button>';
    html += '<div class="c09-spine-rule" aria-hidden="true"></div>';
    categories().forEach(function (c, i) {
      html += '<button class="c09-tab" data-chapter="' + esc(c.id) + '" aria-current="false" ' +
        'title="' + esc(c.title) + '">' +
        '<span class="c09-tab-num">' + pad2(i + 1) + '</span>' +
        '<span class="c09-tab-ico">' + ico(c.icon || 'gear') + '</span>' +
        '<span class="c09-tab-label">' + esc(SPINE_LABELS[c.id] || c.title) + '</span>' +
        '</button>';
    });
    spineEl.innerHTML = html;
    hydrate(spineEl);

    spineEl.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.c09-tab');
      if (!btn) { return; }
      var ch = btn.getAttribute('data-chapter');
      if (ch === 'home') { goDest({ route: 'home' }); }
      else { goDest({ route: 'dest', cat: ch }); }
    });
    spineEl.addEventListener('scroll', updateSpineFade, { passive: true });
    updateSpineFade();

    spineEl.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowDown' && ev.key !== 'ArrowUp' &&
          ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight' &&
          ev.key !== 'Home' && ev.key !== 'End') { return; }
      var tabs = [].slice.call(spineEl.querySelectorAll('.c09-tab'));
      var idx = tabs.indexOf(document.activeElement);
      if (idx < 0) { return; }
      ev.preventDefault();
      var next = idx;
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') { next = Math.min(tabs.length - 1, idx + 1); }
      else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') { next = Math.max(0, idx - 1); }
      else if (ev.key === 'Home') { next = 0; }
      else if (ev.key === 'End') { next = tabs.length - 1; }
      tabs[next].focus();
    });
  }

  /* Narrow-strip continuation affordance: stamp has-left/has-right on the
     wrap while more tabs exist past that edge (CSS renders the edge fades on
     the non-scrolling wrap, so they stay pinned while the strip scrolls). */
  function updateSpineFade() {
    if (!spineWrapEl || !spineEl) { return; }
    var maxLeft = spineEl.scrollWidth - spineEl.clientWidth;
    var scrollable = ui.narrow && maxLeft > 1;
    spineWrapEl.classList.toggle('has-left', scrollable && spineEl.scrollLeft > 1);
    spineWrapEl.classList.toggle('has-right', scrollable && spineEl.scrollLeft < maxLeft - 1);
  }

  function updateSpine() {
    var active = 'home';
    var top = ui.layers.length ? ui.layers[ui.layers.length - 1] : null;
    if (top) {
      if (top.kind === 'dest') { active = top.state.cat; }
      else if (top.kind === 'manager') { active = destCatOfManager(top.state.managerId) || 'home'; }
    }
    var tabs = spineEl.querySelectorAll('.c09-tab');
    for (var i = 0; i < tabs.length; i++) {
      var is = tabs[i].getAttribute('data-chapter') === active;
      tabs[i].setAttribute('aria-current', is ? 'true' : 'false');
      tabs[i].classList.toggle('is-active', is);
    }
  }

  /* ============================ layer machinery ============================
     The stack renders as a flex row: every non-top layer collapses to a slim
     named edge strip on the left (the "previous pages" of the stack of
     sheets); the top layer fills the canvas. Push slides the new sheet in
     over a dimming under-layer; pop peels it off. Reduced motion swaps
     instantly - the edge strips still render, so location survives. */

  function makeLayerEl(entry, depth) {
    var el = document.createElement('section');
    el.className = 'c09-layer';
    el.setAttribute('data-depth', String(depth));
    el.setAttribute('data-layer-key', entry.key);
    el.innerHTML =
      '<button class="c09-layer-edge" type="button" data-pm2-back ' +
        'aria-label="Back to ' + esc(layerTitle(entry)) + '" tabindex="-1">' +
        '<span class="c09-layer-edge-label">' + esc(layerTitle(entry)) + '</span></button>' +
      '<div class="c09-layer-page"></div>';
    var edge = el.querySelector('.c09-layer-edge');
    edge.addEventListener('click', function () { goDest(layerRoute(entry)); });
    var page = el.querySelector('.c09-layer-page');
    page.addEventListener('scroll', function () {
      var L = findLayerByEl(el);
      if (L) { L.scrollTop = page.scrollTop; }
    }, { passive: true });
    return el;
  }

  function findLayerByEl(el) {
    for (var i = 0; i < ui.layers.length; i++) { if (ui.layers[i].el === el) { return ui.layers[i]; } }
    return null;
  }

  function pageOf(layer) { return layer.el.querySelector('.c09-layer-page'); }

  /* Fresh page node per render: innerHTML alone would leak the delegated
     listeners a previous render attached. */
  function freshPage(layer) {
    var old = layer.el.querySelector('.c09-layer-page');
    var page = document.createElement('div');
    page.className = 'c09-layer-page';
    if (old && old.parentNode) { old.parentNode.replaceChild(page, old); }
    else { layer.el.appendChild(page); }
    page.addEventListener('scroll', function () { layer.scrollTop = page.scrollTop; }, { passive: true });
    return page;
  }

  function applyStackClasses() {
    for (var i = 0; i < ui.layers.length; i++) {
      var L = ui.layers[i];
      var isTop = i === ui.layers.length - 1;
      var wasUnder = L.el.classList.contains('is-under');
      L.el.classList.toggle('is-top', isTop);
      L.el.classList.toggle('is-under', !isTop);
      L.el.setAttribute('data-depth', String(i));
      L.el.setAttribute('aria-hidden', isTop ? 'false' : 'true');
      var edge = L.el.querySelector('.c09-layer-edge');
      if (edge) { edge.tabIndex = isTop ? -1 : 0; }
      if (isTop && wasUnder) {
        /* peeled back: the kept page returns; restore its reading position */
        (function (layer) {
          window.requestAnimationFrame(function () {
            var page = pageOf(layer);
            if (page && layer.scrollTop) { page.scrollTop = layer.scrollTop; }
          });
        })(L);
      }
    }
    rootEl.classList.toggle('c09-deep', ui.layers.length > 1);
  }

  /* Render one layer's content by kind. */
  function renderLayerContent(layer) {
    var page = freshPage(layer);
    try {
      if (layer.kind === 'home') { renderHome(layer, page); }
      else if (layer.kind === 'dest') { renderDomain(layer, page); }
      else if (layer.kind === 'manager') { renderManager(layer, page); }
      else if (layer.kind === 'all') { renderAll(layer, page); }
      else if (layer.kind === 'copy') { renderCopy(layer, page); }
    } catch (e) {
      /* one broken layer must never break the whole stack */
      window.__c09lastError = String(e && e.stack || e);
      page.innerHTML = headHtml(layer) + '<div class="c09-body"><p class="c09-empty">' +
        ico('warning') + 'This page failed to render. Go back one layer and try again.</p></div>';
      wireHead(layer, page);
    }
    hydrate(page);
    layer.stale = false;
  }

  /* Reconcile the DOM stack against a plan. Returns the top layer. */
  function renderStack(plan) {
    var i;
    /* trim removed layers (pop) */
    var common = 0;
    while (common < plan.length && common < ui.layers.length &&
           ui.layers[common].key === plan[common].key) { common += 1; }

    var popped = ui.layers.slice(common);
    ui.layers = ui.layers.slice(0, common);
    for (i = 0; i < popped.length; i++) {
      (function (L, isTopmost) {
        if (isTopmost && !ui.narrow) {
          L.el.classList.add('is-leaving');
          L.el.classList.remove('is-under');
          window.setTimeout(function () {
            if (L.el && L.el.parentNode) { L.el.parentNode.removeChild(L.el); }
          }, MOTION_MS);
        } else if (L.el.parentNode) {
          L.el.parentNode.removeChild(L.el);
        }
      })(popped[i], i === popped.length - 1);
    }

    /* update state of retained layers */
    for (i = 0; i < common; i++) {
      var keep = ui.layers[i];
      var next = plan[i];
      var changed = JSON.stringify(pickState(keep.state)) !== JSON.stringify(pickState(next));
      keep.state = mergeState(keep.state, next);
      if (keep.stale || (changed && i === plan.length - 1)) {
        renderLayerContent(keep);
      }
    }

    /* push new layers */
    for (i = common; i < plan.length; i++) {
      var entry = plan[i];
      var el = makeLayerEl(entry, i);
      var layer = { key: entry.key, kind: entry.kind, el: el, state: mergeState({}, entry), scrollTop: 0, stale: false };
      layersEl.appendChild(el);
      ui.layers.push(layer);
      renderLayerContent(layer);
      if (i === plan.length - 1 && i >= common && ui.layers.length > 1) {
        el.classList.add('is-entering');
        layersEl.classList.add('c09-anim');
        (function (node) {
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () { node.classList.remove('is-entering'); });
          });
          /* settle pattern: fixed timer, never transitionend (reduced motion
             kills transitions but the class cleanup must still run) */
          window.setTimeout(function () {
            node.classList.remove('is-entering');
            layersEl.classList.remove('c09-anim');
          }, MOTION_MS + 60);
        })(el);
      }
    }

    applyStackClasses();
    updateSpine();
    statusCrumb();
    return ui.layers[ui.layers.length - 1] || null;
  }

  function pickState(s) {
    return { cat: s.cat || null, sub: s.sub || null, managerId: s.managerId || null,
             objectId: s.objectId || null, tab: s.tab || null };
  }
  function mergeState(base, entry) {
    var out = {};
    var k;
    for (k in base) { if (Object.prototype.hasOwnProperty.call(base, k)) { out[k] = base[k]; } }
    for (k in entry) {
      if (Object.prototype.hasOwnProperty.call(entry, k) && k !== 'key' && k !== 'kind') { out[k] = entry[k]; }
    }
    return out;
  }

  function markAllStale() {
    for (var i = 0; i < ui.layers.length; i++) { ui.layers[i].stale = true; }
  }

  var rebuildPending = null;
  function rebuildSoon() {
    if (rebuildPending) { return; }
    rebuildPending = window.requestAnimationFrame(function () {
      rebuildPending = null;
      markAllStale();
      var top = ui.layers.length ? ui.layers[ui.layers.length - 1] : null;
      if (top) {
        var keepScroll = top.scrollTop;
        renderLayerContent(top);
        var page = pageOf(top);
        if (page) { page.scrollTop = keepScroll; }
        top.stale = false;
      }
      updateSpine();
    });
  }

  function statusCrumb() {
    var parts = ['Settings'];
    for (var i = 1; i < ui.layers.length; i++) { parts.push(layerTitle(ui.layers[i])); }
    try { window.PMShell.status(parts.join(' / ')); } catch (e) { /* shell optional */ }
  }

  /* ============================ layer head ============================ */

  function breadcrumbHtml(layer) {
    var out = '<nav class="c09-crumbs" aria-label="Breadcrumb">';
    out += '<button class="c09-crumb" data-go="home">Settings</button>';
    if (layer.kind === 'dest') {
      out += '<span class="c09-crumb-sep">/</span><span class="c09-crumb is-here">' +
        esc(layerTitle(layer)) + '</span>';
    } else if (layer.kind === 'manager') {
      var cat = destCatOfManager(layer.state.managerId);
      var c = cat ? catById(cat) : null;
      if (c) {
        out += '<span class="c09-crumb-sep">/</span>' +
          '<button class="c09-crumb" data-go="dest" data-cat="' + esc(cat) + '">' + esc(c.title) + '</button>';
      }
      out += '<span class="c09-crumb-sep">/</span><span class="c09-crumb is-here">' +
        esc(layerTitle(layer)) + '</span>';
      var oid = layer.state.objectId;
      if (oid) {
        var pageTitle = managerObjectTitle(layer.state.managerId, oid);
        if (pageTitle) {
          out += '<span class="c09-crumb-sep">/</span><span class="c09-crumb is-here">' +
            esc(pageTitle) + '</span>';
        }
      }
    } else if (layer.kind === 'all' || layer.kind === 'copy') {
      out += '<span class="c09-crumb-sep">/</span><span class="c09-crumb is-here">' +
        esc(layerTitle(layer)) + '</span>';
    }
    out += '</nav>';
    return out;
  }

  function managerObjectTitle(mid, oid) {
    var def = managerDef(mid);
    if (!def || typeof def.model !== 'function') { return null; }
    try {
      var vm = def.model(store);
      if (vm && vm.pages && vm.pages[oid]) { return vm.pages[oid].title || oid; }
    } catch (e) { /* tolerate */ }
    return null;
  }

  function backTarget(layer) {
    var idx = -1;
    for (var i = 0; i < ui.layers.length; i++) { if (ui.layers[i] === layer) { idx = i; break; } }
    if (idx <= 0) { return null; }
    var under = ui.layers[idx - 1];
    return { label: layerTitle(under), route: layerRoute(under) };
  }

  function headHtml(layer, opts) {
    var o = obj(opts);
    var back = backTarget(layer);
    var h = '<header class="c09-head">';
    h += '<div class="c09-head-row">';
    if (back) {
      /* One label span (so the button's flex gap never lands mid-phrase) with
         the qualifier nested inside it, so the narrow head can drop
         ' to <chapter>' visually while the full label stays in the
         accessibility tree (see the is-narrow block in the stylesheet). */
      h += '<button class="c09-back" data-act="back" data-pm2-back>' + ico('undo') +
        '<span class="c09-back-label">Back' +
        '<span class="c09-back-to"> to ' + esc(back.label) + '</span></span></button>';
    }
    h += breadcrumbHtml(layer);
    h += '<span class="c09-head-flex"></span>';
    h += '<span class="c09-project" title="Changes here apply only to this project">' +
      ico('folder') + '<span>Puppet Master</span></span>';
    h += '<button class="c09-close" data-act="close">' + ico('close') +
      '<span>Close Settings</span></button>';
    h += '</div>';
    if (!o.noSearch) {
      h += '<div class="c09-head-search">' + searchFieldHtml(layer.key, false) + '</div>';
    }
    h += '</header>';
    return h;
  }

  function wireHead(layer, page) {
    var head = page.querySelector('.c09-head');
    if (!head) { return; }
    head.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-act],[data-go]');
      if (!t) { return; }
      var act = t.getAttribute('data-act');
      var go = t.getAttribute('data-go');
      if (act === 'back') {
        var back = backTarget(layer);
        if (back) { goDest(back.route); }
      } else if (act === 'close') {
        closeSettings();
      } else if (go === 'home') {
        goDest({ route: 'home' });
      } else if (go === 'dest') {
        goDest({ route: 'dest', cat: t.getAttribute('data-cat') });
      }
    });
    wireSearchField(layer, page);
  }

  function closeSettings() {
    receiptOut('Close Settings', 'Returns to the Dashboard. This concept page has no real app shell, so the return is simulated.');
    try { window.PMShell.status('Close Settings — returns to Dashboard (simulated)'); } catch (e) { /* ignore */ }
  }

  /* ============================ universal search ============================
     One field per layer head (large hero variant on Home). Typing opens a
     dropdown anchored directly beneath the field; the query rides in the
     route (#/search/<q>) so Back restores both the query and its results. */

  function searchFieldHtml(ownerKey, hero) {
    return '<div class="c09-search' + (hero ? ' c09-search-hero' : '') + '" data-owner="' + esc(ownerKey) + '">' +
      '<div class="c09-search-box">' + ico('search') +
      '<input type="text" data-pm2-search-input class="c09-search-input" role="combobox" aria-expanded="false" ' +
        'aria-autocomplete="list" autocomplete="off" spellcheck="false" ' +
        'placeholder="' + (hero ? 'Search all settings, managers, accounts, actions, and help' : 'Search settings') + '" ' +
        'aria-label="Search settings">' +
      '<kbd class="c09-search-kbd">Ctrl K</kbd></div>' +
      '<div class="c09-search-drop" role="listbox" aria-label="Search results" hidden></div>' +
      '</div>';
  }

  function activeSearchWrap() {
    var top = ui.layers.length ? ui.layers[ui.layers.length - 1] : null;
    if (!top) { return null; }
    return pageOf(top).querySelector('.c09-search');
  }

  function wireSearchField(layer, page) {
    var wraps = page.querySelectorAll('.c09-search');
    for (var i = 0; i < wraps.length; i++) {
      (function (wrap) {
        var input = wrap.querySelector('.c09-search-input');
        var drop = wrap.querySelector('.c09-search-drop');
        if (!input || input.__c09wired) { return; }
        input.__c09wired = true;

        var debounced = null;
        input.addEventListener('input', function () {
          if (debounced) { window.clearTimeout(debounced); }
          debounced = window.setTimeout(function () {
            searchType(wrap, input.value);
          }, 110);
        });
        input.addEventListener('focus', function () {
          if (str(input.value) && !ui.search.open) { searchType(wrap, input.value); }
        });
        input.addEventListener('keydown', function (ev) {
          if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
            if (!ui.search.open) { return; }
            ev.preventDefault();
            moveSearchActive(wrap, ev.key === 'ArrowDown' ? 1 : -1);
          } else if (ev.key === 'Enter') {
            if (!ui.search.open || !ui.search.results) { return; }
            ev.preventDefault();
            var flat = flatResults();
            var pick = ui.search.active >= 0 ? flat[ui.search.active] : flat[0];
            if (pick) { chooseResult(pick); }
          } else if (ev.key === 'Escape') {
            if (ui.search.open) {
              ev.preventDefault();
              ev.stopPropagation();
              closeSearch(wrap, true);
            }
          }
        });
        drop.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
        drop.addEventListener('click', function (ev) {
          var el = ev.target.closest('.c09-result');
          if (el) {
            var flat = flatResults();
            var idx = Number(el.getAttribute('data-idx'));
            if (flat[idx]) { chooseResult(flat[idx]); }
            return;
          }
          var open = ev.target.closest('[data-open-all]');
          if (open) { goDest({ route: 'all' }); }
        });
      })(wraps[i]);
    }
  }

  function flatResults() {
    var out = [];
    var r = ui.search.results;
    if (!r) { return out; }
    arr(r.groups).forEach(function (g) {
      arr(g.results).forEach(function (x) { out.push(x); });
    });
    return out;
  }

  function searchType(wrap, q) {
    q = str(q);
    ui.search.query = q;
    ui.search.ownerKey = wrap.getAttribute('data-owner');
    if (!q.trim()) {
      closeSearch(wrap, false);
      return;
    }
    if (ui.search.restoreHash == null) {
      var h = str(window.location.hash);
      ui.search.restoreHash = (h.indexOf('#/search') === 0) ? '#/home' : (h || '#/home');
    }
    var res = null;
    try { res = window.PM2.search.query(q, { limit: 40 }); } catch (e) { res = { query: q, total: 0, groups: [] }; }
    ui.search.results = res;
    ui.search.open = true;
    ui.search.active = -1;
    renderSearchDrop(wrap);
    goHash('#/search/' + encodeURIComponent(q), { replace: true, silent: true });
  }

  function closeSearch(wrap, restoreHash) {
    ui.search.open = false;
    ui.search.active = -1;
    var w = wrap || activeSearchWrap();
    if (w) {
      var drop = w.querySelector('.c09-search-drop');
      var input = w.querySelector('.c09-search-input');
      if (drop) { drop.hidden = true; }
      if (input) { input.setAttribute('aria-expanded', 'false'); }
    }
    if (restoreHash && ui.search.restoreHash) {
      goHash(ui.search.restoreHash, { replace: true, silent: true });
    }
    ui.search.restoreHash = null;
  }

  var KIND_ICONS = {
    setting: 'sliders', manager: 'layers', object: 'box', action: 'play',
    workflow: 'wrench', diagnostic: 'gauge', unavailable: 'warning', help: 'grad'
  };

  function renderSearchDrop(wrap) {
    var drop = wrap.querySelector('.c09-search-drop');
    var input = wrap.querySelector('.c09-search-input');
    if (!drop) { return; }
    var r = ui.search.results;
    var html = '';
    var idx = 0;
    if (!r || !r.total) {
      html += '<div class="c09-search-empty">' +
        '<p>No matches for &ldquo;' + esc(ui.search.query) + '&rdquo;.</p>' +
        '<p class="c09-dim">Check the spelling, try a broader word, or browse the complete index.</p>' +
        '<button class="c09-btn" data-open-all>' + ico('list') + 'Open All Settings</button></div>';
    } else {
      arr(r.groups).forEach(function (g) {
        html += '<div class="c09-result-group"><h4>' + esc(g.label || g.kind) + '</h4>';
        arr(g.results).forEach(function (x) {
          html += '<button class="c09-result" role="option" data-rid="' + esc(x.rid) + '" data-idx="' + idx + '"' +
            (idx === ui.search.active ? ' aria-selected="true"' : ' aria-selected="false"') + '>' +
            '<span class="c09-result-ico">' + ico(KIND_ICONS[x.kind] || 'doc') + '</span>' +
            '<span class="c09-result-main"><span class="c09-result-label">' + esc(x.label) + '</span>' +
            (x.sub ? '<span class="c09-result-sub">' + esc(x.sub) + '</span>' : '') +
            '<span class="c09-result-path">' + esc(arr(x.path).join(' › ')) + '</span>' +
            (x.availability ? '<span class="c09-result-avail">' + ico('info') + esc(x.availability) + '</span>' : '') +
            '</span>' +
            '<span class="c09-result-kind">' + esc(x.kind) + '</span>' +
            '</button>';
          idx += 1;
        });
        html += '</div>';
      });
      var shown = idx;
      html += '<div class="c09-search-foot">' + esc(String(r.total)) + ' result' + (r.total === 1 ? '' : 's') +
        (r.total > shown ? ' · showing the first ' + shown + ' — refine, or use All Settings' : '') +
        ' · Enter opens · Esc closes</div>';
    }
    drop.innerHTML = html;
    drop.hidden = false;
    if (input) { input.setAttribute('aria-expanded', 'true'); }
    hydrate(drop);
  }

  function moveSearchActive(wrap, delta) {
    var flat = flatResults();
    if (!flat.length) { return; }
    var next = ui.search.active + delta;
    if (next < 0) { next = flat.length - 1; }
    if (next >= flat.length) { next = 0; }
    ui.search.active = next;
    var drop = wrap.querySelector('.c09-search-drop');
    var els = drop.querySelectorAll('.c09-result');
    for (var i = 0; i < els.length; i++) {
      els[i].setAttribute('aria-selected', i === next ? 'true' : 'false');
      els[i].classList.toggle('is-active', i === next);
    }
    if (els[next]) {
      var r = els[next].getBoundingClientRect();
      var d = drop.getBoundingClientRect();
      if (r.bottom > d.bottom || r.top < d.top) {
        els[next].scrollIntoView({ block: 'nearest' });
      }
    }
  }

  function chooseResult(x) {
    ui.search.open = false;
    ui.search.restoreHash = null;
    var dest = obj(x.dest);
    goDest(dest, { focus: x.rid });
  }

  /* Restore a search surface from a #/search/<q> deep link. */
  function restoreSearch(query) {
    var top = ui.layers.length ? ui.layers[ui.layers.length - 1] : null;
    if (!top) { return; }
    var wrap = pageOf(top).querySelector('.c09-search');
    if (!wrap) { return; }
    var input = wrap.querySelector('.c09-search-input');
    ui.search.query = query;
    ui.search.restoreHash = '#/home';
    if (input) { input.value = query; }
    var res = null;
    try { res = window.PM2.search.query(query, { limit: 40 }); } catch (e) { res = { query: query, total: 0, groups: [] }; }
    ui.search.results = res;
    ui.search.open = true;
    ui.search.active = -1;
    renderSearchDrop(wrap);
    if (input) { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } }
  }

  /* ============================ Home layer ============================ */

  function bannerFor(sc) {
    if (sc === 'offline') {
      return { text: 'No network connection. Provider status, web search, and update checks are paused; the last known values stay visible.',
               label: 'View web providers', dest: { route: 'dest', cat: 'web', sub: 'providers' }, tone: 'attention' };
    }
    if (sc === 'usage-exhausted') {
      return { text: 'The Claude usage window is used up. New runs queue or fall back to the secondary route until the 6:00 PM reset.',
               label: 'Open usage settings', dest: { route: 'dest', cat: 'ai', sub: 'usage' }, tone: 'attention' };
    }
    if (sc === 'invocation-failed') {
      return { text: 'The last model invocation failed even though the provider looks reachable. Doctor has the honest trace.',
               label: 'Open Doctor', dest: { route: 'manager', managerId: 'm.doctor' }, tone: 'attention' };
    }
    return null;
  }

  var ATT_TONES = { 'Sign in': 'setup', 'Update': 'setup', 'Cleanup': 'attention', 'Setup': 'setup', 'Ready': 'ok' };

  /* store.attention() keys off the persisted scenario key; URL-applied
     scenarios bypass it, so align the list with the ACTIVE scenario here. */
  function normalizeAttention(att, sc) {
    if (sc === 'calm' || sc === 'first-run') { return []; }
    var items = att.slice();
    if (sc === 'usage-exhausted') {
      items = items.map(function (a) {
        if (a.id !== 'att.usage-window') { return a; }
        return { id: a.id, statusWord: 'Waiting',
          headline: 'Claude usage window is exhausted',
          consequence: 'New runs queue or fall back to the secondary route until the 6:00 PM reset.',
          dest: { route: 'dest', cat: 'ai', sub: 'usage' } };
      });
    }
    if (sc === 'offline') {
      var hasOffline = false;
      items.forEach(function (a) { if (a.id === 'att.offline') { hasOffline = true; } });
      if (!hasOffline) {
        items.unshift({ id: 'att.offline', statusWord: 'Offline',
          headline: 'No network connection detected',
          consequence: 'Provider status, web search, and update checks are paused until the connection returns.',
          dest: { route: 'dest', cat: 'web', sub: 'providers' } });
      }
      items = items.slice(0, 4);
    }
    return items;
  }

  function renderHome(layer, page) {
    var counts = null;
    try { counts = store.counts(); } catch (e) { counts = { total: 0, changed: 0, byCategory: [] }; }
    var sc = scenario();
    var att = [];
    try { att = normalizeAttention(store.attention(), sc); } catch (e) { att = []; }
    /* fixture overlays announce themselves through data.notices (pm2-fx-*);
       they belong in the attention list so the state is visible from Home */
    try {
      arr(store.data.notices).forEach(function (n) {
        if (!n || String(n.id).indexOf('pm2-fx-') !== 0) { return; }
        var t = obj(n.target);
        var dest = { route: 'home' };
        var act = obj(n.primary).act;
        if (act === 'open-lifecycle') { dest = { route: 'manager', managerId: 'm.lifecycle' }; }
        else if (t.settingId) { dest = { route: 'setting', settingId: t.settingId }; }
        else if (t.managerId) { dest = { route: 'manager', managerId: t.managerId }; }
        else if (t.cat) { dest = { route: 'dest', cat: t.cat, sub: t.sub || null }; }
        att.push({ id: n.id, statusWord: n.statusWord || 'Notice',
          headline: n.headline || '', consequence: n.consequence || '', dest: dest });
      });
    } catch (e) { /* notices optional */ }
    var recents = [];
    try { recents = store.recents(); } catch (e) { recents = []; }
    var firstRun = sc === 'first-run';
    var banner = bannerFor(sc);

    var h = headHtml(layer, { noSearch: true });

    h += '<div class="c09-body c09-home">';
    h += '<div class="c09-hero">' +
      '<h1 class="c09-hero-title">Settings</h1>' +
      '<p class="c09-hero-id">Project · <strong>Puppet Master</strong> — every change on these pages applies to this project only.</p>' +
      searchFieldHtml(layer.key, true) +
      '</div>';

    if (layer.state.notice) {
      h += '<p class="c09-notice">' + ico('info') + esc(layer.state.notice) + '</p>';
    }

    if (banner) {
      h += '<div class="c09-banner" data-tone="' + esc(banner.tone) + '">' + ico('warning') +
        '<span class="c09-banner-text">' + esc(banner.text) + '</span>' +
        '<button class="c09-btn c09-banner-btn" data-banner>' + esc(banner.label) + '</button></div>';
    }

    /* Needs attention — compact, honest, empty-state aware */
    h += '<section class="c09-attention" aria-label="Needs attention">';
    if (att.length) {
      h += '<h2 class="c09-sec-h">Needs attention</h2><div class="c09-att-list">';
      att.forEach(function (a, i) {
        var tone = ATT_TONES[a.statusWord] || 'attention';
        h += '<button class="c09-att-item" data-att="' + i + '">' +
          '<span class="pm-status-word" data-tone="' + esc(tone) + '">' + esc(a.statusWord) + '</span>' +
          '<span class="c09-att-main"><span class="c09-att-head">' + esc(a.headline) + '</span>' +
          '<span class="c09-att-why">' + esc(a.consequence) + '</span></span>' +
          '</button>';
      });
      h += '</div>';
    } else if (firstRun) {
      h += '<p class="c09-empty">' + ico('sparkle') +
        'You are starting fresh. Nothing needs attention yet — pick a chapter below, or copy settings from another project to skip the setup.</p>';
    } else {
      h += '<p class="c09-empty">' + ico('check') + 'Nothing needs attention right now.</p>';
    }
    h += '</section>';

    /* The twelve chapters — the dominant content */
    h += '<section class="c09-toc" aria-label="Settings chapters"><h2 class="c09-sec-h">Chapters</h2><div class="c09-toc-grid">';
    var byCat = {};
    arr(counts.byCategory).forEach(function (c) { byCat[c.id] = c; });
    categories().forEach(function (c, i) {
      var cc = byCat[c.id] || { total: 0, changed: 0 };
      var meta = fmtInt(cc.total) + ' settings';
      if (!firstRun && cc.changed) { meta += ' · ' + fmtInt(cc.changed) + ' changed'; }
      h += '<article class="c09-chap">' +
        '<button class="c09-chap-main" data-cat="' + esc(c.id) + '">' +
        '<span class="c09-chap-num">' + pad2(i + 1) + '</span>' +
        '<span class="c09-chap-ico">' + ico(c.icon || 'gear') + '</span>' +
        '<span class="c09-chap-text"><span class="c09-chap-title">' + esc(c.title) + '</span>' +
        '<span class="c09-chap-desc">' + esc(c.desc || '') + '</span>' +
        '<span class="c09-chap-meta">' + esc(meta) + '</span></span>' +
        '</button>' +
        '<div class="c09-chap-subs">' +
        arr(c.subgroups).map(function (g) {
          return '<button class="c09-sub-link" data-cat="' + esc(c.id) + '" data-sub="' + esc(g.id) + '">' +
            esc(g.title) + '</button>';
        }).join('') +
        '</div></article>';
    });
    h += '</div></section>';

    /* Secondary utilities — present, visually subordinate */
    h += '<section class="c09-utils" aria-label="Settings utilities">';
    h += '<button class="c09-util" data-go-all>' + ico('list') +
      '<span class="c09-util-text"><span class="c09-util-title">All Settings</span>' +
      '<span class="c09-util-sub">The complete index — ' + fmtInt(counts.total) + ' settings, filterable and searchable.</span></span></button>';
    h += '<button class="c09-util" data-go-copy>' + ico('copy') +
      '<span class="c09-util-text"><span class="c09-util-title">Copy Settings</span>' +
      '<span class="c09-util-sub">One-time copy from another project. Nothing stays linked.</span></span></button>';
    h += '<div class="c09-util c09-util-recents"><span class="c09-util-title">' + ico('history') + 'Recent changes</span>';
    if (firstRun || !recents.length) {
      h += '<p class="c09-dim">No changes yet — everything is at its defaults.</p>';
    } else {
      h += '<ul class="c09-recent-list">';
      recents.slice(0, 4).forEach(function (r) {
        h += '<li><button class="c09-recent" data-setting="' + esc(r.settingId) + '">' +
          '<span class="c09-recent-label">' + esc(r.label) + '</span>' +
          '<span class="c09-recent-to">' + esc(r.toLabel || '') + '</span>' +
          '<span class="c09-recent-when">' + esc(fmtWhen(r.when)) + '</span></button></li>';
      });
      h += '</ul>';
    }
    h += '</div></section>';

    h += '</div>';
    page.innerHTML = h;
    wireHead(layer, page);

    page.addEventListener('click', function (ev) {
      var t;
      t = ev.target.closest('.c09-chap-main');
      if (t) { goDest({ route: 'dest', cat: t.getAttribute('data-cat') }); return; }
      t = ev.target.closest('.c09-sub-link');
      if (t) { goDest({ route: 'dest', cat: t.getAttribute('data-cat'), sub: t.getAttribute('data-sub') }); return; }
      t = ev.target.closest('.c09-att-item');
      if (t) {
        var a = att[Number(t.getAttribute('data-att'))];
        if (a && a.dest) { goDest(a.dest); }
        return;
      }
      t = ev.target.closest('[data-banner]');
      if (t && banner) { goDest(banner.dest); return; }
      t = ev.target.closest('[data-go-all]');
      if (t) { goDest({ route: 'all' }); return; }
      t = ev.target.closest('[data-go-copy]');
      if (t) { goDest({ route: 'copy' }); return; }
      t = ev.target.closest('.c09-recent');
      if (t) { goDest({ route: 'setting', settingId: t.getAttribute('data-setting') }); return; }
    });
  }

  /* ============================ domain layer ============================ */

  function renderDomain(layer, page) {
    var cat = catById(layer.state.cat);
    if (!cat) {
      page.innerHTML = headHtml(layer) + '<div class="c09-body"><p class="c09-empty">' +
        ico('info') + 'This chapter does not exist. Use the spine on the right to pick one.</p></div>';
      wireHead(layer, page);
      return;
    }
    var rowsBySub = {};
    arr(cat.subgroups).forEach(function (g) {
      var rows = [];
      try { rows = store.rowsFor(cat.id, g.id); } catch (e) { rows = []; }
      rowsBySub[g.id] = rows;
    });
    var mgrs = managersByCat(cat.id);
    var counts = null;
    try { counts = store.counts(); } catch (e) { counts = { byCategory: [] }; }
    var cc = null;
    arr(counts.byCategory).forEach(function (x) { if (x.id === cat.id) { cc = x; } });

    var h = headHtml(layer);
    h += '<div class="c09-body c09-domain">';

    if (layer.state.missing && layer.state.settingId) {
      h += '<p class="c09-notice">' + ico('info') +
        'The link pointed at a setting this Project does not have (' +
        '<code>' + esc(layer.state.settingId) + '</code>). Showing its chapter instead.</p>';
    }

    h += '<div class="c09-chap-hero">' +
      '<span class="c09-chap-hero-num">' + esc(catNum(cat.id)) + '</span>' +
      '<div class="c09-chap-hero-text"><h1>' + esc(cat.title) + '</h1>' +
      '<p>' + esc(cat.desc || '') + '</p>' +
      (cc ? '<p class="c09-chap-hero-meta">' + fmtInt(cc.total) + ' settings · ' +
        fmtInt(cc.changed) + ' changed from default</p>' : '') +
      '</div></div>';

    /* section subnav: managers + subgroups */
    h += '<nav class="c09-subnav" aria-label="Sections in this chapter">';
    if (mgrs.length) { h += '<button class="c09-subnav-item" data-jump="managers">Managers</button>'; }
    arr(cat.subgroups).forEach(function (g) {
      h += '<button class="c09-subnav-item" data-jump="' + esc(g.id) + '">' + esc(g.title) + '</button>';
    });
    h += '</nav>';

    if (mgrs.length) {
      h += '<section class="c09-mgr-strip" data-section="managers"><h2 class="c09-sec-h">Managers in this chapter</h2><div class="c09-mgr-list">';
      mgrs.forEach(function (def) {
        var deferred = def.status === 'deferred_named_owner';
        h += '<button class="c09-mgr-dest" data-manager="' + esc(def.id) + '">' +
          '<span class="c09-mgr-ico">' + ico(def.icon || 'gear') + '</span>' +
          '<span class="c09-mgr-text"><span class="c09-mgr-title">' + esc(def.title) +
          (deferred ? ' <span class="pm-status-word" data-tone="muted">Owner module</span>' : '') +
          '</span><span class="c09-mgr-blurb">' + esc(def.blurb || '') + '</span></span>' +
          '<span class="c09-mgr-open">' + ico('external') + '</span></button>';
      });
      h += '</div></section>';
    }

    arr(cat.subgroups).forEach(function (g) {
      var rows = rowsBySub[g.id];
      var visible = [];
      var advanced = [];
      rows.forEach(function (r) {
        var rec = settingById(r.id);
        if (r.tier !== 'advanced' || (rec && rec.curated)) { visible.push(r); }
        else { advanced.push(r); }
      });
      var advKey = cat.id + '/' + g.id;
      h += '<section class="c09-subgroup" data-section="' + esc(g.id) + '">' +
        '<h2 class="c09-sec-h">' + esc(g.title) +
        '<span class="c09-sec-count">' + rows.length + '</span></h2>' +
        (g.desc ? '<p class="c09-sec-desc">' + esc(g.desc) + '</p>' : '');
      h += chunkRows(visible);
      if (advanced.length) {
        var open = !!ui.advOpen[advKey];
        h += '<button class="c09-adv-toggle" data-adv="' + esc(advKey) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
          '<span class="c09-caret' + (open ? ' is-open' : '') + '"></span>' +
          'Advanced settings <span class="c09-sec-count">' + advanced.length + '</span></button>';
        h += '<div class="c09-adv-body"' + (open ? '' : ' hidden') + ' data-adv-body="' + esc(advKey) + '">' +
          chunkRows(advanced) + '</div>';
      }
      h += '</section>';
    });

    h += '</div>';
    page.innerHTML = h;
    wireHead(layer, page);
    wireRows(layer, page);

    page.addEventListener('click', function (ev) {
      var t = ev.target.closest('.c09-subnav-item');
      if (t) {
        var sec = page.querySelector('[data-section="' + t.getAttribute('data-jump') + '"]');
        if (sec) { sec.scrollIntoView({ block: 'start', behavior: motionOK() ? 'smooth' : 'auto' }); }
        return;
      }
      t = ev.target.closest('.c09-mgr-dest');
      if (t) { goDest({ route: 'manager', managerId: t.getAttribute('data-manager') }); return; }
      t = ev.target.closest('.c09-adv-toggle');
      if (t) {
        var key = t.getAttribute('data-adv');
        var body = page.querySelector('[data-adv-body="' + key + '"]');
        var now = !ui.advOpen[key];
        ui.advOpen[key] = now;
        t.setAttribute('aria-expanded', now ? 'true' : 'false');
        var caret = t.querySelector('.c09-caret');
        if (caret) { caret.classList.toggle('is-open', now); }
        if (body) { body.hidden = !now; }
        return;
      }
    });
  }

  function motionOK() {
    var html = document.documentElement;
    if (html.getAttribute('data-motion') === 'reduced' || html.getAttribute('data-reduced-motion') === '1') { return false; }
    try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return false; } } catch (e) { /* ignore */ }
    return true;
  }

  /* Groups of at most seven rows before a visual break. */
  function chunkRows(rows) {
    if (!rows.length) { return ''; }
    var h = '';
    for (var i = 0; i < rows.length; i += 7) {
      h += '<div class="c09-row-group">';
      for (var j = i; j < Math.min(i + 7, rows.length); j++) { h += rowHtml(rows[j]); }
      h += '</div>';
    }
    return h;
  }

  /* ============================ setting rows ============================ */

  var STATE_TONES = {
    'managed': 'muted', 'unavailable': 'muted', 'error': 'attention',
    'restart-required': 'attention', 'reconnect-required': 'attention',
    'changed-elsewhere': 'attention'
  };
  var STATE_WORDS = {
    'managed': 'Managed', 'unavailable': 'Unavailable', 'error': 'Fix needed',
    'restart-required': 'Restart', 'reconnect-required': 'Reconnect',
    'changed-elsewhere': 'Changed elsewhere'
  };

  function rowHtml(row) {
    if (!row) { return ''; }
    var editable = row.state !== 'managed' && row.state !== 'unavailable';
    var h = '<article class="c09-row" data-setting-id="' + esc(row.id) + '" data-state="' + esc(row.state) + '" tabindex="-1">';
    h += '<div class="c09-row-line">';
    h += '<div class="c09-row-main">';
    h += '<div class="c09-row-title">' +
      (row.changedFromDefault ? '<span class="c09-mod-dot" role="img" aria-label="Changed from default"></span>' : '') +
      esc(row.label);
    arr(row.badges).forEach(function (b) { h += '<span class="c09-badge">' + esc(b) + '</span>'; });
    if (STATE_WORDS[row.state]) {
      h += '<span class="pm-status-word" data-tone="' + esc(STATE_TONES[row.state] || 'muted') + '">' +
        esc(STATE_WORDS[row.state]) + '</span>';
    }
    h += '</div>';
    h += '<p class="c09-row-desc">' + esc(row.desc || '') + '</p>';
    if (row.stateNote && row.state !== 'error') {
      h += '<p class="c09-row-note" data-tone="' + esc(STATE_TONES[row.state] || 'muted') + '">' +
        ico(row.state === 'managed' ? 'lock' : 'info') + esc(row.stateNote) + '</p>';
    }
    var liveError = (row.state === 'error' && row.stateNote) ? row.stateNote : '';
    h += '<p class="c09-row-error"' + (liveError ? '' : ' hidden') + '>' + esc(liveError) + '</p>';
    h += '</div>';
    h += '<div class="c09-row-side">' + controlHtml(row, editable) +
      '<button class="c09-row-more" data-more aria-expanded="' + (ui.detailsOpen[row.id] ? 'true' : 'false') + '" ' +
      'aria-label="Details for ' + esc(row.label) + '">' + ico('info') + '</button></div>';
    h += '</div>';
    h += '<div class="c09-row-drawer"' + (ui.detailsOpen[row.id] ? '' : ' hidden') + '>' + drawerHtml(row) + '</div>';
    h += '</article>';
    return h;
  }

  function controlHtml(row, editable) {
    var c = row.control || {};
    var type = c.type;
    if (!editable) {
      var kind = row.state === 'managed' ? 'managed' : 'unavailable';
      return '<span class="pm-chip-value" data-kind="' + kind + '">' +
        (kind === 'managed' ? ico('lock') : '') + esc(row.valueLabel || (kind === 'managed' ? 'Managed' : 'Unavailable')) + '</span>';
    }
    if (type === 'toggle') {
      var on = row.value === true || row.value === 'on';
      return '<button class="c09-switch" role="switch" aria-checked="' + (on ? 'true' : 'false') + '" data-ctl="toggle" ' +
        'aria-label="' + esc(row.label) + '"><span class="c09-switch-knob"></span></button>';
    }
    if (type === 'select' || type === 'radio') {
      return '<button class="c09-selbtn" data-ctl="select" aria-haspopup="menu" aria-expanded="false">' +
        '<span>' + esc(row.valueLabel || 'Choose') + '</span><span class="c09-caret"></span></button>';
    }
    if (type === 'multiselect') {
      return '<button class="c09-selbtn" data-ctl="multi" aria-haspopup="menu" aria-expanded="false">' +
        '<span>' + esc(row.valueLabel || '0 selected') + '</span><span class="c09-caret"></span></button>';
    }
    if (type === 'number') {
      return '<input class="c09-num" data-ctl="number" inputmode="numeric" value="' +
        esc(row.value == null ? '' : row.value) + '" aria-label="' + esc(row.label) + '">';
    }
    if (type === 'slider') {
      if (typeof c.min === 'number' && typeof c.max === 'number' && typeof row.value === 'number') {
        var step = (c.max - c.min) <= 2 ? 0.05 : 1;
        return '<span class="c09-sliderwrap"><input type="range" class="c09-slider" data-ctl="slider" min="' + c.min +
          '" max="' + c.max + '" step="' + step + '" value="' + esc(row.value) + '" aria-label="' + esc(row.label) + '">' +
          '<output class="c09-slider-out">' + esc(row.valueLabel || row.value) + '</output></span>';
      }
      return '<input class="c09-num" data-ctl="text" value="' + esc(row.value == null ? '' : row.value) +
        '" aria-label="' + esc(row.label) + '">';
    }
    if (type === 'text' || type === 'path') {
      return '<span class="c09-textwrap">' + (type === 'path' ? ico('folder') : '') +
        '<input class="c09-text" data-ctl="text" value="' + esc(row.value == null ? '' : row.value) +
        '" aria-label="' + esc(row.label) + '"></span>';
    }
    if (type === 'action') {
      return '<button class="c09-btn" data-ctl="action">' + esc(row.valueLabel || 'Open') + '</button>';
    }
    /* list / keyvalue: summary chip; contents live in the drawer */
    var chip = arr(row.chips)[0] || { kind: 'default', label: row.valueLabel || '—' };
    return '<span class="pm-chip-value" data-kind="' + esc(chip.kind) + '">' + esc(chip.label) + '</span>';
  }

  function drawerHtml(row) {
    var h = '<dl class="c09-kv">';
    var entry = (store.values || {})[row.id] || {};
    if (row.changedFromDefault) {
      h += '<dt>Why this value?</dt><dd>Changed by ' + esc(entry.by || 'You') +
        (entry.changedAt ? ' · ' + esc(fmtWhen(entry.changedAt)) : '') + '.</dd>';
    } else {
      h += '<dt>Why this value?</dt><dd>Puppet Master default for this project.</dd>';
    }
    if (row.recommended !== undefined) {
      var recLabel = String(row.recommended === true ? 'On' : row.recommended === false ? 'Off' : row.recommended);
      h += '<dt>Recommended</dt><dd>' + esc(recLabel);
      if (row.state !== 'managed' && row.state !== 'unavailable' &&
          JSON.stringify(row.value) !== JSON.stringify(row.recommended)) {
        h += ' <button class="c09-mini-btn" data-use-rec>Use recommended</button>';
      }
      h += '</dd>';
    }
    if (row.stateNote) {
      h += '<dt>' + (row.state === 'managed' ? 'Origin' : 'Status') + '</dt><dd>' + esc(row.stateNote) + '</dd>';
    }
    if ((row.control || {}).type === 'list' && Array.isArray(row.value) && row.value.length) {
      h += '<dt>Items</dt><dd>' + row.value.slice(0, 12).map(function (v) {
        return '<span class="c09-badge">' + esc(typeof v === 'string' ? v : JSON.stringify(v)) + '</span>';
      }).join(' ') + (row.value.length > 12 ? ' …' : '') + '</dd>';
    }
    if ((row.control || {}).type === 'keyvalue' && row.value && typeof row.value === 'object') {
      var keys = Object.keys(row.value).slice(0, 10);
      if (keys.length) {
        h += '<dt>Entries</dt><dd>' + keys.map(function (k) {
          return '<span class="c09-badge">' + esc(k) + ' = ' + esc(String(row.value[k])) + '</span>';
        }).join(' ') + '</dd>';
      }
    }
    var d = obj(row.detail);
    if (d.legacyScopeNote) { h += '<dt>History</dt><dd>' + esc(d.legacyScopeNote) + '</dd>'; }
    if (arr(d.related).length) {
      h += '<dt>Related</dt><dd>' + arr(d.related).slice(0, 6).map(function (r) {
        return '<span class="c09-badge">' + esc(r) + '</span>';
      }).join(' ') + '</dd>';
    }
    h += '<dt>ID</dt><dd><code class="c09-code">' + esc(row.id) + '</code></dd>';
    h += '</dl>';
    return h;
  }

  /* Event delegation for rows inside a layer page. */
  function wireRows(layer, page) {
    page.addEventListener('click', function (ev) {
      var rowEl = ev.target.closest('.c09-row');
      if (!rowEl) { return; }
      var id = rowEl.getAttribute('data-setting-id');
      var t;
      t = ev.target.closest('[data-more]');
      if (t) {
        var drawer = rowEl.querySelector('.c09-row-drawer');
        var open = !ui.detailsOpen[id];
        ui.detailsOpen[id] = open;
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (drawer) { drawer.hidden = !open; }
        if (open) { ui.detailStack.push('row:' + id); }
        else { removeFromDetailStack('row:' + id); }
        return;
      }
      t = ev.target.closest('[data-use-rec]');
      if (t) {
        var row = resolveRowSafe(id);
        if (row && row.recommended !== undefined) { commitValue(rowEl, id, row.recommended); }
        return;
      }
      t = ev.target.closest('[data-ctl="toggle"]');
      if (t) {
        var on = t.getAttribute('aria-checked') === 'true';
        commitValue(rowEl, id, !on);
        return;
      }
      t = ev.target.closest('[data-ctl="action"]');
      if (t) {
        var r2 = resolveRowSafe(id);
        receiptOut(r2 ? r2.label : id, 'Simulated action from the Settings concept page — nothing was executed.');
        return;
      }
      t = ev.target.closest('[data-ctl="select"]');
      if (t) { openSelectMenu(rowEl, id, t, false); return; }
      t = ev.target.closest('[data-ctl="multi"]');
      if (t) { openSelectMenu(rowEl, id, t, true); return; }
    });
    page.addEventListener('change', function (ev) {
      var rowEl = ev.target.closest('.c09-row');
      if (!rowEl) { return; }
      var id = rowEl.getAttribute('data-setting-id');
      var el = ev.target;
      if (el.matches('[data-ctl="number"]')) {
        var raw = String(el.value).trim();
        var num = raw === '' ? NaN : Number(raw);
        commitValue(rowEl, id, isNaN(num) ? raw : num);
      } else if (el.matches('[data-ctl="slider"]')) {
        commitValue(rowEl, id, Number(el.value));
      } else if (el.matches('[data-ctl="text"]')) {
        commitValue(rowEl, id, String(el.value));
      }
    });
    page.addEventListener('input', function (ev) {
      var el = ev.target;
      if (el.matches && el.matches('[data-ctl="slider"]')) {
        var out = el.parentNode.querySelector('.c09-slider-out');
        if (out) { out.textContent = el.value; }
      }
    });
    page.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && ev.target.matches &&
          (ev.target.matches('[data-ctl="number"]') || ev.target.matches('[data-ctl="text"]'))) {
        ev.target.blur();
      }
    });
  }

  function resolveRowSafe(id) {
    try { return store.resolveRow(id); } catch (e) { return null; }
  }

  function commitValue(rowEl, id, value) {
    var res = null;
    try { res = store.setValue(id, value, { source: 'c09-chapters' }); }
    catch (e) { res = { ok: false, error: 'That change could not be applied.' }; }
    if (res && !res.ok) {
      showRowError(rowEl, res.error || 'That value is not valid.');
    }
    /* success re-renders via the store 'value' event */
  }

  function showRowError(rowEl, msg) {
    if (!rowEl) { return; }
    var err = rowEl.querySelector('.c09-row-error');
    if (err) { err.textContent = msg; err.hidden = false; }
    rowEl.setAttribute('data-state', 'error');
  }

  function removeFromDetailStack(id) {
    var i = ui.detailStack.lastIndexOf(id);
    if (i >= 0) { ui.detailStack.splice(i, 1); }
  }

  function openSelectMenu(rowEl, id, invoker, multi) {
    var row = resolveRowSafe(id);
    if (!row) { return; }
    var options = arr((row.control || {}).options);
    var current = row.value;
    var items = options.map(function (o) {
      var checked = multi ? (Array.isArray(current) && current.indexOf(o) >= 0) : current === o;
      return { id: o, label: optionLabel(o), checked: checked, kind: multi ? 'check' : 'radio' };
    });
    openMenu(invoker, {
      items: items,
      onPick: function (optId, nowChecked) {
        if (multi) {
          var next = Array.isArray(current) ? current.slice() : [];
          var at = next.indexOf(optId);
          if (nowChecked && at < 0) { next.push(optId); }
          if (!nowChecked && at >= 0) { next.splice(at, 1); }
          current = next;
          commitValue(rowEl, id, next);
          return true; /* keep open */
        }
        commitValue(rowEl, id, optId);
        return false;
      }
    });
  }

  function optionLabel(v) {
    var s = String(v == null ? '' : v);
    if (/^[a-z0-9]+(?:[_-][a-z0-9]+)+$/.test(s)) {
      return s.replace(/[_-]+/g, ' ').replace(/(^|\s)([a-z])/g, function (m, sp, ch) { return sp + ch.toUpperCase(); });
    }
    if (/^[a-z]/.test(s) && s.indexOf(' ') < 0 && s.length <= 24) {
      /* single-word internal states read better capitalized in status words */
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    return s;
  }

  /* ============================ popup menu ============================
     PM family behavior: layered above content, collision-flipped near the
     viewport edges, Esc closes, focus returns to the invoker. */

  function openMenu(invoker, spec) {
    closeMenu();
    var el = document.createElement('div');
    el.className = 'c09-menu';
    el.setAttribute('role', 'menu');
    var html = '';
    arr(spec.items).forEach(function (it, i) {
      var isAction = it.kind === 'action';
      var role = it.kind === 'check' ? 'menuitemcheckbox' : (isAction ? 'menuitem' : 'menuitemradio');
      html += '<button class="c09-menu-item' + (it.sub ? ' has-sub' : '') + '" role="' + role + '" ' +
        (isAction ? '' : 'aria-checked="' + (it.checked ? 'true' : 'false') + '" ') +
        'data-opt="' + esc(it.id) + '" data-i="' + i + '"' +
        (it.disabled ? ' aria-disabled="true"' : '') + '>' +
        (isAction
          ? '<span class="c09-menu-ico">' + ico(it.ico || 'play') + '</span>'
          : '<span class="c09-menu-mark">' + ico('check') + '</span>') +
        '<span class="c09-menu-label">' + esc(it.label) +
        (it.sub ? '<span class="c09-menu-sub">' + esc(it.sub) + '</span>' : '') +
        '</span>' +
        (it.note ? '<span class="c09-menu-note">' + esc(it.note) + '</span>' : '') +
        '</button>';
    });
    el.innerHTML = html;
    document.body.appendChild(el);
    hydrate(el);

    /* position with collision handling */
    var r = invoker.getBoundingClientRect();
    var mw = Math.min(el.offsetWidth || 240, window.innerWidth - 16);
    var mh = el.offsetHeight;
    var left = Math.min(Math.max(8, r.left), window.innerWidth - mw - 8);
    var top = r.bottom + 4;
    if (top + mh > window.innerHeight - 8) {
      top = Math.max(8, r.top - mh - 4); /* flip upward near the bottom edge */
    }
    el.style.left = left + 'px';
    el.style.top = top + 'px';

    invoker.setAttribute('aria-expanded', 'true');

    function onPick(btn) {
      if (btn.getAttribute('aria-disabled') === 'true') { return; }
      var it = spec.items[Number(btn.getAttribute('data-i'))];
      var nowChecked = btn.getAttribute('aria-checked') !== 'true';
      var keepOpen = spec.onPick ? spec.onPick(it.id, nowChecked) : false;
      if (it.kind === 'check') { btn.setAttribute('aria-checked', nowChecked ? 'true' : 'false'); }
      if (!keepOpen) { closeMenu(true); }
    }
    el.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.c09-menu-item');
      if (btn) { onPick(btn); }
    });
    el.addEventListener('keydown', function (ev) {
      var itemsEls = [].slice.call(el.querySelectorAll('.c09-menu-item'));
      var idx = itemsEls.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown') { ev.preventDefault(); itemsEls[Math.min(itemsEls.length - 1, idx + 1)].focus(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); itemsEls[Math.max(0, idx - 1)].focus(); }
      else if (ev.key === 'Home') { ev.preventDefault(); itemsEls[0].focus(); }
      else if (ev.key === 'End') { ev.preventDefault(); itemsEls[itemsEls.length - 1].focus(); }
      else if (ev.key === 'Enter' || ev.key === ' ') {
        var btn = document.activeElement.closest('.c09-menu-item');
        if (btn) { ev.preventDefault(); onPick(btn); }
      }
    });

    var outside = function (ev) {
      if (!el.contains(ev.target) && ev.target !== invoker && !invoker.contains(ev.target)) { closeMenu(false); }
    };
    document.addEventListener('mousedown', outside, true);

    ui.menu = { el: el, invoker: invoker, outside: outside };
    var checked = el.querySelector('[aria-checked="true"]') || el.querySelector('.c09-menu-item');
    if (checked) { checked.focus(); }
  }

  function closeMenu(refocus) {
    if (!ui.menu) { return; }
    var m = ui.menu;
    ui.menu = null;
    document.removeEventListener('mousedown', m.outside, true);
    if (m.el.parentNode) { m.el.parentNode.removeChild(m.el); }
    if (m.invoker) {
      m.invoker.setAttribute('aria-expanded', 'false');
      if (refocus !== false) { try { m.invoker.focus(); } catch (e) { /* gone */ } }
    }
  }

  /* ============================ manager layer ============================
     Composition (the tome layout, rethemed): roster on the left, a tabbed
     detail page on the right with a manager-local horizontal tab row.
     Managers without object pages render as a sectioned document with a
     local section-tab row. Deferred owners render an honest insertion shell. */

  function renderManager(layer, page) {
    var def = managerDef(layer.state.managerId);
    if (!def) {
      page.innerHTML = headHtml(layer) + '<div class="c09-body"><p class="c09-empty">' + ico('info') +
        'That manager does not exist in this build. Pick a chapter from the spine instead.</p></div>';
      wireHead(layer, page);
      return;
    }
    var vm = null;
    try { vm = def.model(store); } catch (e) { vm = null; }
    var actions = [];
    if (def.status === 'demonstrated' && typeof def.actions === 'function') {
      try { actions = arr(def.actions(store)); } catch (e) { actions = []; }
    }

    var h = headHtml(layer);
    h += '<div class="c09-body c09-manager" data-manager-root="' + esc(def.id) + '">';

    h += '<div class="c09-mgr-hero">' +
      '<span class="c09-mgr-hero-ico">' + ico(def.icon || 'gear') + '</span>' +
      '<div class="c09-mgr-hero-text"><h1>' + esc(def.title) + '</h1>' +
      '<p>' + esc(def.blurb || '') + '</p></div>' +
      (def.status === 'deferred_named_owner'
        ? '<span class="pm-status-word" data-tone="muted">' + ico('clock') + 'Owner module pending</span>' : '') +
      '</div>';

    if (def.status === 'deferred_named_owner') {
      h += deferredShellHtml(def, vm);
      h += '</div>';
      page.innerHTML = h;
      wireHead(layer, page);
      hydrate(page);
      return;
    }

    var actionSplit = splitActions(def, actions);
    if (actions.length) {
      h += '<div class="c09-actions" role="group" aria-label="' + esc(def.title) + ' actions">';
      actionSplit.primary.forEach(function (a) {
        if (a.available) {
          h += '<button class="c09-btn c09-action" data-action-id="' + esc(a.id) + '">' +
            ico(a.ico || 'play') + esc(a.label) + '</button>';
        } else {
          h += '<span class="c09-action-off"><button class="c09-btn c09-action" data-action-id="' + esc(a.id) + '" disabled>' +
            ico(a.ico || 'play') + esc(a.label) + '</button>' +
            '<span class="c09-action-reason">' + esc(a.reason || 'Not available right now.') + '</span></span>';
        }
      });
      if (actionSplit.overflow.length) {
        h += '<button class="c09-btn c09-action-menu" data-action-menu ' +
          'aria-haspopup="menu" aria-expanded="false">' +
          ico('wrench') + 'Maintenance' +
          '<span class="c09-badge">' + actionSplit.overflow.length + '</span>' +
          '<span class="c09-caret" aria-hidden="true"></span></button>';
      }
      h += '</div>';
    }

    var pageVm = (vm && vm.pages && layer.state.objectId) ? vm.pages[layer.state.objectId] : null;
    var hasRoster = vm && vm.pages && Object.keys(vm.pages).length > 0;

    if (hasRoster && pageVm) {
      h += '<div class="c09-mgr-split">';
      h += rosterRailHtml(def, vm, layer.state.objectId);
      h += objectDetailHtml(def, layer.state.objectId, pageVm, layer.state.tab);
      h += '</div>';
    } else {
      h += documentModeHtml(def, vm);
    }

    h += '</div>';
    page.innerHTML = h;
    wireHead(layer, page);
    wireManager(layer, page, def, vm, actions, actionSplit.overflow);
    hydrate(page);
  }

  /* Which actions stay visible on a busy manager page. Everything else moves
     behind the Maintenance overflow (the concept's popup-menu device), so the
     page opens with its few high-value actions instead of a button wall. */
  var PRIMARY_ACTION_IDS = {
    'm.providers': ['act.provider-refresh', 'act.setup.cursor-cli']
  };

  function splitActions(def, actions) {
    var list = arr(actions);
    if (list.length <= 5) { return { primary: list, overflow: [] }; }
    var ids = PRIMARY_ACTION_IDS[def.id] || null;
    var primary = [];
    var overflow = [];
    list.forEach(function (a, i) {
      var keep = ids ? ids.indexOf(a.id) >= 0 : (i < 3);
      if (keep) { primary.push(a); } else { overflow.push(a); }
    });
    if (!primary.length) { return { primary: list, overflow: [] }; }
    return { primary: primary, overflow: overflow };
  }

  function deferredShellHtml(def, vm) {
    var ic = obj(def.insertionContract);
    var h = '<div class="c09-owner-shell">';
    h += '<div class="c09-owner-card">' +
      '<h2 class="c09-sec-h">Reserved for its owner module</h2>' +
      '<dl class="c09-kv">' +
      '<dt>Owner</dt><dd>' + esc(def.owner || 'Named owner module') + '</dd>' +
      (vm && vm.summary ? '<dt>Status</dt><dd>' + esc(vm.summary) + '</dd>' : '') +
      (ic.deepLink ? '<dt>Insertion point</dt><dd><code class="c09-code">' + esc(ic.deepLink) + '</code></dd>' : '') +
      (arr(ic.reachableFrom).length ? '<dt>Reachable from</dt><dd>' + arr(ic.reachableFrom).map(esc).join(' · ') + '</dd>' : '') +
      (ic.returnContract ? '<dt>Return contract</dt><dd>' + esc(ic.returnContract) + '</dd>' : '') +
      '</dl></div>';
    if (vm) {
      arr(vm.sections).forEach(function (sec) {
        h += '<section class="c09-msec" data-section="' + esc(sec.id) + '">' +
          '<h2 class="c09-sec-h">' + esc(sec.title || '') + '</h2>' +
          sectionBodyHtml(sec, { managerId: def.id, readOnly: true }) + '</section>';
      });
    }
    h += '</div>';
    return h;
  }

  function documentModeHtml(def, vm) {
    if (!vm) { return '<p class="c09-empty">' + ico('info') + 'Nothing to show yet.</p>'; }
    var secs = arr(vm.sections);
    var h = '';
    if (secs.length > 1) {
      /* Every section below is on this same page, so this row jumps, it does
         not switch panes. It is a nav with aria-current, not a tablist with a
         selected tab that echoed the heading right beneath it. */
      h += '<nav class="c09-jumpbar" aria-label="Jump to a section of ' + esc(def.title) + '">' +
        '<span class="c09-jumpbar-lead">Jump to</span>';
      secs.forEach(function (sec, i) {
        h += '<button class="c09-jump" data-jump-section="' + esc(sec.id) + '"' +
          (i === 0 ? ' aria-current="true"' : '') + '>' +
          esc(tabLabel(sec.id, sec)) + '</button>';
      });
      h += '</nav>';
    }
    secs.forEach(function (sec) {
      var advanced = sec.advanced === true;
      var openKey = 'msec:' + def.id + ':' + sec.id;
      h += '<section class="c09-msec' + (advanced ? ' c09-msec-adv' : '') + '" data-section="' + esc(sec.id) + '">';
      if (advanced) {
        var open = !!ui.detailsOpen[openKey];
        h += '<button class="c09-adv-toggle" data-msec-adv="' + esc(openKey) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
          '<span class="c09-caret' + (open ? ' is-open' : '') + '"></span>' + esc(sec.title || 'Advanced') + '</button>' +
          '<div class="c09-adv-body"' + (open ? '' : ' hidden') + ' data-msec-adv-body="' + esc(openKey) + '">' +
          sectionBodyHtml(sec, { managerId: def.id }) + '</div>';
      } else {
        h += '<h2 class="c09-sec-h">' + esc(sec.title || '') + '</h2>' +
          (sec.note ? '<p class="c09-sec-desc">' + esc(sec.note) + '</p>' : '') +
          sectionBodyHtml(sec, { managerId: def.id });
      }
      h += '</section>';
    });
    return h;
  }

  function rosterRailHtml(def, vm, activeId) {
    var h = '<aside class="c09-roster" aria-label="' + esc(def.title) + ' list">';
    arr(vm.sections).forEach(function (sec) {
      if (sec.kind !== 'roster') { return; }
      var groups = sec.groups ? arr(sec.groups) : [{ id: 'g0', label: null, items: arr(sec.items) }];
      groups.forEach(function (g) {
        if (g.label) { h += '<h3 class="c09-roster-h">' + esc(g.label) + '</h3>'; }
        arr(g.items).forEach(function (it) {
          var isActive = it.id === activeId;
          h += '<button class="c09-roster-item' + (isActive ? ' is-active' : '') + '" data-object-id="' + esc(it.id) + '"' +
            (isActive ? ' aria-current="true"' : '') + '>' +
            '<span class="c09-roster-label">' + esc(it.label) + '</span>' +
            (it.status ? '<span class="pm-status-word" data-tone="' + esc(it.status.tone || 'muted') + '">' +
              esc(it.status.label) + '</span>' : '') +
            '</button>';
        });
      });
    });
    h += '</aside>';
    return h;
  }

  function objectDetailHtml(def, objectId, pageVm, tab) {
    var tabs = arr(pageVm.tabs);
    var active = tab && tabs.indexOf(tab) >= 0 ? tab : tabs[0];
    var sec = obj(pageVm.sections)[active];
    var h = '<div class="c09-object" data-object-id="' + esc(objectId) + '">';
    h += '<div class="c09-object-head"><h2>' + esc(pageVm.title || objectId) + '</h2>' +
      (pageVm.status ? '<span class="pm-status-word" data-tone="' + esc(pageVm.status.tone || 'muted') + '">' +
        esc(pageVm.status.label) + '</span>' : '') + '</div>';
    if (pageVm.status && pageVm.status.note) {
      h += '<p class="c09-sec-desc">' + esc(pageVm.status.note) + '</p>';
    }
    h += '<div class="c09-mtabs" role="tablist" aria-label="' + esc(pageVm.title || objectId) + ' pages">';
    tabs.forEach(function (t) {
      h += '<button class="c09-mtab" role="tab" data-tab="' + esc(t) + '" aria-selected="' +
        (t === active ? 'true' : 'false') + '">' + esc(tabLabel(t, obj(pageVm.sections)[t])) + '</button>';
    });
    h += '</div>';
    h += '<div class="c09-object-body" data-active-tab="' + esc(active || '') + '">';
    if (sec) {
      h += (sec.note ? '<p class="c09-sec-desc">' + esc(sec.note) + '</p>' : '') +
        sectionBodyHtml(sec, { managerId: def.id, objectId: objectId, tab: active });
    } else {
      h += '<p class="c09-empty">' + ico('info') + 'Nothing on this page yet.</p>';
    }
    h += '</div></div>';
    return h;
  }

  /* ---------------- generic section body renderer ---------------- */

  function sectionBodyHtml(sec, ctx) {
    var kind = str(sec.kind);
    if (kind === 'overview') { return overviewHtml(sec, ctx); }
    if (kind === 'roster') { return rosterSectionHtml(sec, ctx); }
    if (kind === 'form') { return formHtml(sec, ctx); }
    if (kind === 'table') { return tableHtml(sec, ctx); }
    if (kind === 'steps') { return stepsHtml(sec, ctx); }
    if (kind === 'log') { return logHtml(sec, ctx); }
    if (kind === 'health') { return healthHtml(sec, ctx); }
    if (kind === 'preview') { return previewHtml(sec, ctx); }
    return overviewHtml(sec, ctx);
  }

  function toneWord(status) {
    if (!status) { return ''; }
    return '<span class="pm-status-word" data-tone="' + esc(status.tone || 'muted') + '">' + esc(status.label) + '</span>';
  }

  function overviewHtml(sec, ctx) {
    var items = arr(sec.items).length ? arr(sec.items) : arr(sec.rows);
    var h = '';
    if (sec.status) { h += '<p class="c09-ov-status">' + toneWord(sec.status) + (sec.status.note ? ' <span class="c09-dim">' + esc(sec.status.note) + '</span>' : '') + '</p>'; }
    h += '<dl class="c09-ov">';
    items.forEach(function (it) {
      h += '<div class="c09-ov-row' + (it.dest ? ' has-dest' : '') + '"' +
        (it.id ? ' data-object-id="' + esc(it.id) + '"' : '') +
        (it.dest ? ' data-dest="' + esc(JSON.stringify(it.dest)) + '" role="button" tabindex="0"' : '') + '>' +
        '<dt>' + esc(it.label || '') + '</dt>' +
        '<dd><span class="c09-ov-val' + (it.tone ? ' tone-' + esc(it.tone) : '') + '">' + esc(it.value == null ? '—' : String(it.value)) + '</span>' +
        (it.note ? '<span class="c09-ov-note">' + esc(it.note) + '</span>' : '') + '</dd></div>';
    });
    h += '</dl>';
    if (arr(sec.whatNext).length) {
      h += '<div class="c09-whatnext"><h4>When included usage runs out</h4><ol>';
      arr(sec.whatNext).forEach(function (s) { h += '<li>' + esc(s.label) + '</li>'; });
      h += '</ol></div>';
    }
    return h;
  }

  function rosterSectionHtml(sec, ctx) {
    var groups = sec.groups ? arr(sec.groups) : [{ id: 'g0', label: null, items: arr(sec.items) }];
    var h = '<div class="c09-cards">';
    groups.forEach(function (g) {
      if (g.label) { h += '<h3 class="c09-roster-h">' + esc(g.label) + '</h3>'; }
      arr(g.items).forEach(function (it) {
        var key = 'mi:' + (ctx.managerId || '') + ':' + it.id;
        var hasDetail = it.detail && Object.keys(obj(it.detail)).length;
        var open = !!ui.detailsOpen[key];
        h += '<div class="c09-card" data-object-id="' + esc(it.id) + '">';
        h += '<div class="c09-card-line">';
        if (it.dest) {
          h += '<button class="c09-card-main has-dest" data-dest="' + esc(JSON.stringify(it.dest)) + '">';
        } else {
          h += '<div class="c09-card-main">';
        }
        h += '<span class="c09-card-label">' + esc(it.label) + '</span>' +
          (it.sub ? '<span class="c09-card-sub">' + esc(it.sub) + '</span>' : '');
        h += it.dest ? '</button>' : '</div>';
        h += '<span class="c09-card-side">' + toneWord(it.status) +
          (hasDetail ? '<button class="c09-row-more" data-card-detail="' + esc(key) + '" aria-expanded="' + (open ? 'true' : 'false') + '" aria-label="Details for ' + esc(it.label) + '">' + ico('info') + '</button>' : '') +
          '</span>';
        h += '</div>';
        if (it.status && it.status.note) { h += '<p class="c09-card-note">' + esc(it.status.note) + '</p>'; }
        if (hasDetail) {
          h += '<div class="c09-row-drawer"' + (open ? '' : ' hidden') + ' data-card-body="' + esc(key) + '">' +
            kvHtml(it.detail) + (it.meta ? kvHtml(it.meta) : '') + '</div>';
        }
        h += '</div>';
      });
    });
    h += '</div>';
    return h;
  }

  function formHtml(sec, ctx) {
    var h = '<div class="c09-form">';
    arr(sec.fields).forEach(function (f) {
      var clickable = !!f.dest;
      h += '<div class="c09-field' + (clickable ? ' has-dest' : '') + '"' +
        (f.settingId ? ' data-setting-id="' + esc(f.settingId) + '"' : (f.id ? ' data-object-id="' + esc(f.id) + '"' : '')) +
        (clickable ? ' data-dest="' + esc(JSON.stringify(f.dest)) + '" role="button" tabindex="0"' : '') + '>' +
        '<span class="c09-field-label">' + esc(f.label || '') + '</span>' +
        '<span class="c09-field-val">' + esc(f.valueLabel == null ? (f.value == null ? '—' : String(f.value)) : String(f.valueLabel)) + '</span>' +
        (f.state && f.state !== 'normal' && STATE_WORDS[f.state]
          ? '<span class="pm-status-word" data-tone="' + esc(STATE_TONES[f.state] || 'muted') + '">' + esc(STATE_WORDS[f.state]) + '</span>' : '') +
        (clickable ? '<span class="c09-field-open">' + ico('external') + '</span>' : '') +
        (f.note ? '<span class="c09-field-note">' + esc(f.note) + '</span>' : '') +
        '</div>';
    });
    h += '</div>';
    return h;
  }

  function tableHtml(sec, ctx) {
    var cols = arr(sec.columns).map(function (c) {
      return (c && typeof c === 'object') ? { id: c.id, label: c.label } : { id: null, label: String(c) };
    });
    var rows = arr(sec.rows).length ? arr(sec.rows) : arr(sec.items);
    var h = '<div class="c09-table-scroll"><table class="c09-table"><thead><tr>';
    cols.forEach(function (c) { h += '<th>' + esc(c.label) + '</th>'; });
    h += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      var cells = r.cells;
      h += '<tr' + (r.id ? ' data-object-id="' + esc(r.id) + '"' : '') +
        (r.dest ? ' class="has-dest" data-dest="' + esc(JSON.stringify(r.dest)) + '" tabindex="0"' : '') + '>';
      if (Array.isArray(cells)) {
        cells.forEach(function (v) { h += '<td>' + esc(v == null ? '—' : String(v)) + '</td>'; });
      } else if (cells && typeof cells === 'object') {
        cols.forEach(function (c) {
          var v = c.id != null ? cells[c.id] : null;
          h += '<td>' + esc(v == null ? '—' : String(v)) + '</td>';
        });
      } else {
        h += '<td colspan="' + cols.length + '">' + esc(r.label || '') + '</td>';
      }
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  function stepsHtml(sec, ctx) {
    var h = '';
    if (sec.officialSource) {
      h += '<p class="c09-callout">' + ico('certificate') + '<span><strong>Official source only:</strong> ' +
        esc(sec.officialSource) + (sec.note ? ' — ' + esc(sec.note) : '') + '</span></p>';
    } else if (sec.note) {
      h += '<p class="c09-sec-desc">' + esc(sec.note) + '</p>';
    }
    if (arr(sec.hostChoices).length) {
      h += '<div class="c09-hosts"><h4>Install for</h4>';
      arr(sec.hostChoices).forEach(function (hc, i) {
        h += '<label class="c09-host"><input type="radio" name="c09-host-' + esc(sec.id) + '" value="' + esc(hc.id) + '"' +
          (i === 0 ? ' checked' : '') + '><span>' + esc(hc.label) + '</span></label>';
      });
      h += '</div>';
    }
    h += '<ol class="c09-steps">';
    arr(sec.steps).forEach(function (s) {
      var stepLabel = s.label || s.title || '';
      var stepDetail = s.detail || s.note || '';
      h += '<li><strong>' + esc(stepLabel) + '</strong>' +
        (stepDetail ? '<span class="c09-step-detail">' + esc(stepDetail) + '</span>' : '') + '</li>';
    });
    h += '</ol>';
    if (sec.policyNote) {
      h += '<p class="c09-callout c09-callout-quiet">' + ico('shield') + '<span>' + esc(sec.policyNote) + '</span></p>';
    }
    return h;
  }

  function logHtml(sec, ctx) {
    var h = '';
    if (sec.loading) {
      h += '<p class="c09-refresh">' + ico('refresh') + esc(obj(sec.loading).note || 'Refreshing — the last known entries stay visible.') + '</p>';
    }
    if (arr(sec.sources).length) {
      h += '<div class="c09-cards">';
      arr(sec.sources).forEach(function (s) {
        h += '<div class="c09-card" data-object-id="' + esc(s.id) + '"><div class="c09-card-line"><div class="c09-card-main">' +
          '<span class="c09-card-label">' + esc(s.label) + '</span>' +
          (s.sub ? '<span class="c09-card-sub">' + esc(s.sub) + '</span>' : '') + '</div>' +
          '<span class="c09-card-side">' + toneWord(s.status) + '</span></div></div>';
      });
      h += '</div>';
    }
    var entries = arr(sec.entries);
    if (entries.length) {
      h += '<ul class="c09-log">';
      entries.forEach(function (e) {
        h += '<li class="c09-log-row" data-tone="' + esc(e.tone || 'muted') + '">' +
          '<span class="c09-log-when">' + esc(fmtWhen(e.at) || str(e.at)) + '</span>' +
          '<span class="c09-log-main"><span>' + esc(e.label || '') + '</span>' +
          (e.detail ? '<span class="c09-log-detail">' + esc(e.detail) + '</span>' : '') + '</span></li>';
      });
      h += '</ul>';
    } else if (arr(sec.log).length) {
      h += '<ul class="c09-log">';
      arr(sec.log).forEach(function (line) {
        h += '<li class="c09-log-row" data-tone="muted"><span class="c09-log-main"><span>' + esc(line) + '</span></span></li>';
      });
      h += '</ul>';
    } else if (!arr(sec.sources).length) {
      h += '<p class="c09-empty">' + ico('history') + 'Nothing recorded yet.</p>';
    }
    return h;
  }

  function healthHtml(sec, ctx) {
    var checks = arr(sec.checks).length ? arr(sec.checks) : arr(sec.items);
    var h = '<div class="c09-health">';
    checks.forEach(function (c) {
      var tone = c.tone || (c.status ? c.status.tone : 'muted');
      var word = c.state || (c.status ? c.status.label : '');
      h += '<div class="c09-health-row"' + (c.id ? ' data-object-id="' + esc(c.id) + '"' : '') + '>' +
        '<span class="pm-status-word" data-tone="' + esc(tone || 'muted') + '">' + esc(word || '—') + '</span>' +
        '<span class="c09-health-main"><span>' + esc(c.label || '') + '</span>' +
        (c.note ? '<span class="c09-health-note">' + esc(c.note) + '</span>' : '') +
        (c.value != null ? '<span class="c09-health-note">' + esc(String(c.value)) + '</span>' : '') +
        '</span></div>';
    });
    h += '</div>';
    return h;
  }

  function previewHtml(sec, ctx) {
    /* Simple text capsule previews (personas). */
    if (sec.preview) {
      var p = obj(sec.preview);
      return '<figure class="c09-preview">' +
        '<blockquote>' + esc(p.text || '') + '</blockquote>' +
        (p.tokens ? '<figcaption>' + esc(p.tokens) + '</figcaption>' : '') +
        '</figure>';
    }
    /* Staged-transaction previews (settings lifecycle import). */
    var h = '';
    if (sec.state) {
      h += '<p class="c09-ov-status"><span class="pm-status-word" data-tone="' +
        (sec.state === 'staged' ? 'setup' : (sec.state === 'rolled-back' ? 'ok' : 'muted')) + '">' +
        esc(optionLabel(sec.state)) + '</span>' +
        (sec.note ? ' <span class="c09-dim">' + esc(sec.note) + '</span>' : '') + '</p>';
    }
    if (sec.source) { h += kvHtml(sec.source); }
    var counts = obj(sec.counts);
    var countKeys = Object.keys(counts);
    if (countKeys.length) {
      h += '<div class="c09-pv-counts">';
      countKeys.forEach(function (k) {
        h += '<span class="c09-pv-count" data-kind="' + esc(k) + '"><strong>' + esc(String(counts[k])) + '</strong> ' +
          esc(optionLabel(k)) + '</span>';
      });
      h += '</div>';
    }
    if (arr(sec.conflicts).length) {
      h += '<h4 class="c09-roster-h">Conflicts to decide</h4><div class="c09-cards">';
      arr(sec.conflicts).forEach(function (c) {
        h += '<div class="c09-card" data-object-id="' + esc(c.settingId) + '">' +
          '<div class="c09-card-line">' +
          (c.dest ? '<button class="c09-card-main has-dest" data-dest="' + esc(JSON.stringify(c.dest)) + '">' : '<div class="c09-card-main">') +
          '<span class="c09-card-label">' + esc(c.settingId) + '</span>' +
          '<span class="c09-card-sub">Here: ' + esc(String(c.local)) + ' · Incoming: ' + esc(String(c.incoming)) + '</span>' +
          (c.dest ? '</button>' : '</div>') +
          '<span class="c09-card-side"><span class="pm-status-word" data-tone="attention">Conflict</span></span>' +
          '</div>' + (c.note ? '<p class="c09-card-note">' + esc(c.note) + '</p>' : '') + '</div>';
      });
      h += '</div>';
    }
    if (arr(sec.invalid).length) {
      h += '<h4 class="c09-roster-h">Will be skipped</h4>';
      arr(sec.invalid).forEach(function (x) {
        h += '<p class="c09-card-note"><code class="c09-code">' + esc(x.key) + '</code> — ' + esc(x.reason || '') + '</p>';
      });
    }
    if (arr(sec.legacyMigrated).length) {
      h += '<h4 class="c09-roster-h">Migrated from older names</h4>';
      arr(sec.legacyMigrated).forEach(function (x) {
        h += '<p class="c09-card-note"><code class="c09-code">' + esc(x.from) + '</code> → <code class="c09-code">' +
          esc(x.to) + '</code>' + (x.note ? ' — ' + esc(x.note) : '') + '</p>';
      });
    }
    if (sec.restorePointId) {
      h += '<p class="c09-callout c09-callout-quiet">' + ico('disk') +
        '<span>Restore point <code class="c09-code">' + esc(sec.restorePointId) + '</code> is staged; nothing applies until the conflicts are decided.</span></p>';
    }
    return h || '<p class="c09-empty">' + ico('info') + 'Nothing staged right now.</p>';
  }

  /* Generic key/value drawer for roster item detail objects. Intentionally
     technical surface: raw values may appear here. */
  function kvHtml(data) {
    var d = obj(data);
    var keys = Object.keys(d);
    if (!keys.length) { return ''; }
    var h = '<dl class="c09-kv">';
    keys.forEach(function (k) {
      var v = d[k];
      if (v == null || v === '') { return; }
      var label = k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      var out;
      if (Array.isArray(v)) {
        out = v.slice(0, 8).map(function (x) {
          if (x && typeof x === 'object') { return esc(x.label || x.title || x.n || JSON.stringify(x).slice(0, 60)); }
          return esc(String(x));
        }).join(' · ');
      } else if (typeof v === 'object') {
        out = esc(JSON.stringify(v).slice(0, 120));
      } else if (v === true) { out = 'Yes'; }
      else if (v === false) { out = 'No'; }
      else { out = esc(String(v)); }
      h += '<dt>' + esc(label) + '</dt><dd>' + out + '</dd>';
    });
    h += '</dl>';
    return h;
  }

  /* ---------------- manager wiring ---------------- */

  function wireManager(layer, page, def, vm, actions, overflowActions) {
    page.addEventListener('click', function (ev) {
      var t;
      t = ev.target.closest('[data-action-menu]');
      if (t) {
        openActionMenu(t, overflowActions, actions);
        return;
      }
      t = ev.target.closest('[data-action-id]');
      if (t && !t.disabled) {
        runAction(actions, t.getAttribute('data-action-id'));
        return;
      }
      t = ev.target.closest('.c09-roster-item');
      if (t) {
        var oid = t.getAttribute('data-object-id');
        var first = (vm && vm.pages && vm.pages[oid]) ? arr(vm.pages[oid].tabs)[0] : null;
        goDest({ route: 'manager', managerId: def.id, objectId: oid, tab: first });
        return;
      }
      t = ev.target.closest('.c09-mtab[data-tab]');
      if (t) {
        /* tab switches replace the entry (scrollspy semantics): Back still
           returns one Settings level, not through every visited tab */
        try {
          window.PM2.route.go({ route: 'manager', managerId: def.id, objectId: layer.state.objectId,
                                tab: t.getAttribute('data-tab') }, { replace: true });
        } catch (e) { /* router optional */ }
        return;
      }
      t = ev.target.closest('.c09-jump[data-jump-section]');
      if (t) {
        var sel = t.getAttribute('data-jump-section');
        var sec = page.querySelector('[data-section="' + sel + '"]');
        var jumps = page.querySelectorAll('.c09-jump[data-jump-section]');
        for (var i = 0; i < jumps.length; i++) {
          if (jumps[i] === t) { jumps[i].setAttribute('aria-current', 'true'); }
          else { jumps[i].removeAttribute('aria-current'); }
        }
        if (sec) { sec.scrollIntoView({ block: 'start', behavior: motionOK() ? 'smooth' : 'auto' }); }
        return;
      }
      t = ev.target.closest('[data-msec-adv]');
      if (t) {
        var key = t.getAttribute('data-msec-adv');
        var body = page.querySelector('[data-msec-adv-body="' + key + '"]');
        var now = !ui.detailsOpen[key];
        ui.detailsOpen[key] = now;
        t.setAttribute('aria-expanded', now ? 'true' : 'false');
        var caret = t.querySelector('.c09-caret');
        if (caret) { caret.classList.toggle('is-open', now); }
        if (body) { body.hidden = !now; }
        if (now) { ui.detailStack.push(key); } else { removeFromDetailStack(key); }
        return;
      }
      t = ev.target.closest('[data-card-detail]');
      if (t) {
        var ckey = t.getAttribute('data-card-detail');
        var cbody = page.querySelector('[data-card-body="' + ckey + '"]');
        var copen = !ui.detailsOpen[ckey];
        ui.detailsOpen[ckey] = copen;
        t.setAttribute('aria-expanded', copen ? 'true' : 'false');
        if (cbody) { cbody.hidden = !copen; }
        if (copen) { ui.detailStack.push(ckey); } else { removeFromDetailStack(ckey); }
        return;
      }
      t = ev.target.closest('[data-dest]');
      if (t) { followDataDest(t); return; }
    });
    page.addEventListener('keydown', function (ev) {
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('[data-dest][role="button"],tr[data-dest]')) {
        ev.preventDefault();
        followDataDest(ev.target);
      }
    });
  }

  function followDataDest(el) {
    var raw = el.getAttribute('data-dest');
    if (!raw) { return; }
    var dest = null;
    try { dest = JSON.parse(raw); } catch (e) { dest = null; }
    if (!dest) { return; }
    var params = null;
    if (dest.sectionId) { params = { focus: dest.sectionId }; }
    goDest(dest, params);
  }

  /* The Maintenance overflow: secondary manager actions as a popup menu.
     Unavailable actions stay listed (honesty) with their reason bound to the
     item itself as a caption, never floating between unrelated actions. */
  function openActionMenu(invoker, overflowActions, allActions) {
    openMenu(invoker, {
      items: arr(overflowActions).map(function (a) {
        return {
          id: a.id, label: a.label, kind: 'action', ico: a.ico || 'play',
          disabled: !a.available,
          sub: a.available ? null : (a.reason || 'Not available right now.')
        };
      }),
      onPick: function (actionId) {
        runAction(allActions, actionId);
        return false;
      }
    });
  }

  /* Actions return truthful staged ops or honest simulated receipts. A bare
     op handle (created but not staged by the shared module) is driven here
     with an honest indeterminate queued -> running -> done sequence. */
  function runAction(actions, actionId) {
    var act = null;
    arr(actions).forEach(function (a) { if (a.id === actionId) { act = a; } });
    if (!act) { return; }
    if (!act.available) {
      receiptOut(act.label + ' — not attempted', act.reason || 'Not available right now.');
      return;
    }
    var res = null;
    try { res = act.run(store); } catch (e) { res = null; }
    if (res && typeof res.then === 'function') { return; }
    if (res && typeof res.queued === 'function' && typeof res.isTerminal === 'function' && !res.isTerminal()) {
      try {
        res.queued();
        res.running('working');
        var S = statesApi();
        var wait = (S && typeof S.delay === 'function') ? S.delay(700) : Promise.resolve();
        wait.then(function () { if (!res.isTerminal()) { res.done(); } });
      } catch (e) { /* op handle already terminal */ }
    }
  }

  /* ============================ All Settings ============================
     The complete long-tail index: faceted and WINDOWED (never 828 live
     rows). Secondary utility in this concept; reachable from Home and the
     route grammar. Slint note: the window maps to a ListView viewport. */

  var ALL_ROW_H = 56;
  var allStateCache = null;   /* settingId -> state (built on demand) */
  var allFilteredList = null; /* cached filtered list for the open layer */

  function stressActive() {
    var S = statesApi();
    if (S && typeof S.stressActive === 'function') { try { return !!S.stressActive(); } catch (e) { /* ignore */ } }
    return store.get('stress') === true;
  }

  function allStateOf(id) {
    if (!allStateCache) { allStateCache = {}; }
    if (allStateCache[id] === undefined) {
      var r = resolveRowSafe(id);
      allStateCache[id] = r ? r.state : 'normal';
    }
    return allStateCache[id];
  }

  function allFiltered() {
    var f = ui.all;
    var toks = str(f.q).toLowerCase().split(/\s+/).filter(Boolean);
    var out = [];
    arr(inventory().settings).forEach(function (s) {
      if (f.cat && s.cat !== f.cat) { return; }
      if (f.type && s.type !== f.type) { return; }
      if (f.tier && s.tier !== f.tier) { return; }
      if (f.changed) {
        var e = (store.values || {})[s.id];
        if (!e || !e.changedFromDefault) { return; }
      }
      if (f.state && allStateOf(s.id) !== f.state) { return; }
      if (toks.length) {
        var hay = (s.label + ' ' + (s.desc || '') + ' ' + arr(s.search).join(' ') + ' ' + s.id).toLowerCase();
        for (var i = 0; i < toks.length; i++) { if (hay.indexOf(toks[i]) < 0) { return; } }
      }
      out.push(s);
    });
    if (stressActive() && !f.changed && !f.state) {
      var S = statesApi();
      var recs = [];
      if (S && typeof S.stressRecords === 'function') { try { recs = arr(S.stressRecords()); } catch (e) { recs = []; } }
      recs.forEach(function (r) {
        if (f.cat && r.cat !== f.cat) { return; }
        if (f.type || f.tier) { return; }
        if (toks.length) {
          var hay = (r.label + ' ' + (r.desc || '') + ' ' + arr(r.search).join(' ')).toLowerCase();
          for (var i = 0; i < toks.length; i++) { if (hay.indexOf(toks[i]) < 0) { return; } }
        }
        out.push(r);
      });
    }
    return out;
  }

  function renderAll(layer, page) {
    var h = headHtml(layer);
    h += '<div class="c09-body c09-all">';
    h += '<div class="c09-chap-hero"><span class="c09-chap-hero-num">' + ico('list') + '</span>' +
      '<div class="c09-chap-hero-text"><h1>All Settings</h1>' +
      '<p>The complete index of every setting in this project. Filter it down, or search from any page.</p></div></div>';

    h += '<div class="c09-facets">';
    h += '<input class="c09-facet-q" type="text" value="' + esc(ui.all.q) + '" placeholder="Filter by name or purpose" aria-label="Filter settings">';
    h += '<select class="c09-facet" data-facet="cat" aria-label="Chapter"><option value="">Every chapter</option>';
    categories().forEach(function (c) {
      h += '<option value="' + esc(c.id) + '"' + (ui.all.cat === c.id ? ' selected' : '') + '>' + esc(c.title) + '</option>';
    });
    h += '</select>';
    h += '<select class="c09-facet" data-facet="type" aria-label="Control type"><option value="">Every type</option>';
    ['toggle', 'select', 'radio', 'number', 'slider', 'text', 'path', 'list', 'multiselect', 'keyvalue', 'action'].forEach(function (t) {
      h += '<option value="' + t + '"' + (ui.all.type === t ? ' selected' : '') + '>' + optionLabel(t) + '</option>';
    });
    h += '</select>';
    h += '<select class="c09-facet" data-facet="tier" aria-label="Tier"><option value="">Both tiers</option>' +
      '<option value="simple"' + (ui.all.tier === 'simple' ? ' selected' : '') + '>Simple</option>' +
      '<option value="advanced"' + (ui.all.tier === 'advanced' ? ' selected' : '') + '>Advanced</option></select>';
    h += '<select class="c09-facet" data-facet="state" aria-label="State"><option value="">Any state</option>';
    [['managed', 'Managed'], ['unavailable', 'Unavailable'], ['restart-required', 'Restart required'],
     ['reconnect-required', 'Reconnect required'], ['changed-elsewhere', 'Changed elsewhere'], ['error', 'Needs a fix']].forEach(function (p) {
      h += '<option value="' + p[0] + '"' + (ui.all.state === p[0] ? ' selected' : '') + '>' + p[1] + '</option>';
    });
    h += '</select>';
    h += '<label class="c09-facet-check"><input type="checkbox" data-facet="changed"' + (ui.all.changed ? ' checked' : '') + '> Changed only</label>';
    h += '</div>';
    h += '<p class="c09-all-count" aria-live="polite"></p>';
    h += '<div class="c09-all-viewport" tabindex="0" aria-label="Settings index">' +
      '<div class="c09-all-spacer-top"></div><div class="c09-all-rows"></div><div class="c09-all-spacer-bot"></div></div>';
    h += '</div>';
    page.innerHTML = h;
    wireHead(layer, page);

    var viewport = page.querySelector('.c09-all-viewport');
    var topSp = page.querySelector('.c09-all-spacer-top');
    var botSp = page.querySelector('.c09-all-spacer-bot');
    var rowsEl = page.querySelector('.c09-all-rows');
    var countEl = page.querySelector('.c09-all-count');

    allFilteredList = allFiltered();

    function paintCount() {
      var n = allFilteredList.length;
      var extra = stressActive() ? ' Stress fixture records are marked and never mix into the real inventory.' : '';
      countEl.textContent = fmtInt(n) + ' of ' + fmtInt(inventory().settingsCount || arr(inventory().settings).length) +
        ' settings' + (stressActive() ? ' (+ synthetic stress records)' : '') + '.' + extra;
    }

    var lastFirst = -1, lastCount = -1;
    function paintWindow(force) {
      var n = allFilteredList.length;
      var vh = viewport.clientHeight || 480;
      var first = Math.max(0, Math.floor(viewport.scrollTop / ALL_ROW_H) - 4);
      var count = Math.min(n - first, Math.ceil(vh / ALL_ROW_H) + 8);
      if (!force && first === lastFirst && count === lastCount) { return; }
      lastFirst = first; lastCount = count;
      topSp.style.height = (first * ALL_ROW_H) + 'px';
      botSp.style.height = (Math.max(0, n - first - count) * ALL_ROW_H) + 'px';
      var html = '';
      for (var i = first; i < first + count; i++) {
        var s = allFilteredList[i];
        if (!s) { break; }
        if (s.synthetic) {
          html += '<div class="c09-all-row is-stress" data-stress-id="' + esc(s.id) + '">' +
            '<span class="c09-all-label">' + esc(s.label) + '<span class="c09-badge c09-badge-stress">Stress fixture</span></span>' +
            '<span class="c09-all-path">' + esc((catById(s.cat) || {}).title || s.cat) + '</span>' +
            '<span class="c09-all-type">synthetic</span></div>';
          continue;
        }
        var st = ui.all.state ? ui.all.state : null;
        var entry = (store.values || {})[s.id];
        var changed = entry && entry.changedFromDefault;
        html += '<button class="c09-all-row" data-setting-id="' + esc(s.id) + '">' +
          '<span class="c09-all-label">' + (changed ? '<span class="c09-mod-dot" aria-hidden="true"></span>' : '') + esc(s.label) + '</span>' +
          '<span class="c09-all-path">' + esc((catById(s.cat) || {}).title || s.cat) + ' › ' + esc(subTitle(s.cat, s.sub)) + '</span>' +
          '<span class="c09-all-type">' + esc(s.type) + '</span>' +
          (st ? '<span class="pm-status-word" data-tone="' + esc(STATE_TONES[st] || 'muted') + '">' + esc(STATE_WORDS[st] || st) + '</span>' : '') +
          '</button>';
      }
      rowsEl.innerHTML = html;
    }

    paintCount();
    paintWindow(true);

    var scrollPending = false;
    viewport.addEventListener('scroll', function () {
      if (scrollPending) { return; }
      scrollPending = true;
      window.requestAnimationFrame(function () { scrollPending = false; paintWindow(false); });
    }, { passive: true });

    /* paintWindow sizes the row window from viewport.clientHeight, and scroll
       was its only trigger - so any height change (narrow/wide flip, window
       resize, the chat panel opening) left a window sized for the OLD height
       until the next scroll, showing blank sheet below the painted rows. Repaint
       whenever the viewport's own height actually changes. The spacers live
       inside the viewport and cannot feed back into its flex-sized height, so
       this cannot loop. */
    if (typeof window.ResizeObserver === 'function') {
      var lastVh = viewport.clientHeight;
      var vhPending = false;
      var vpRo = new window.ResizeObserver(function () {
        var vh = viewport.clientHeight;
        if (vh === lastVh || vhPending) { return; }
        lastVh = vh;
        vhPending = true;
        window.requestAnimationFrame(function () { vhPending = false; paintWindow(true); });
      });
      vpRo.observe(viewport);
    }

    var qDeb = null;
    page.querySelector('.c09-facet-q').addEventListener('input', function (ev) {
      var v = ev.target.value;
      if (qDeb) { window.clearTimeout(qDeb); }
      qDeb = window.setTimeout(function () {
        ui.all.q = v;
        allFilteredList = allFiltered();
        viewport.scrollTop = 0;
        paintCount();
        paintWindow(true);
      }, 120);
    });
    page.addEventListener('change', function (ev) {
      var f = ev.target.getAttribute && ev.target.getAttribute('data-facet');
      if (!f) { return; }
      if (f === 'changed') { ui.all.changed = !!ev.target.checked; }
      else { ui.all[f] = ev.target.value; }
      allFilteredList = allFiltered();
      viewport.scrollTop = 0;
      paintCount();
      paintWindow(true);
    });
    page.addEventListener('click', function (ev) {
      var t = ev.target.closest('.c09-all-row');
      if (!t) { return; }
      if (t.classList.contains('is-stress')) {
        receiptOut('Stress fixture record', 'Synthetic scale-test record — it is not a real setting and has no page.');
        return;
      }
      var id = t.getAttribute('data-setting-id');
      goDest({ route: 'setting', settingId: id }, { focus: 's:' + id });
    });
  }

  /* ============================ Copy Settings ============================
     One-time transaction as stacked step sheets: earlier steps collapse to
     slim named bars above the active sheet (the concept's layer metaphor,
     inside the transaction). Never a link, never a sync. */

  function copyState() {
    if (!ui.copy) {
      ui.copy = { step: 1, sourceId: null, catIds: [], preview: null, receipt: null,
                  applying: false, applyError: null, rolledBack: false, opPhase: null, inspect: {} };
    }
    return ui.copy;
  }

  var COPY_STEPS = ['Select source project', 'Choose categories', 'Review what will happen', 'Confirm, apply & verify'];

  function renderCopy(layer, page) {
    var cs = copyState();
    var sources = [];
    try { sources = arr(window.PM2.copy.sources()); } catch (e) { sources = []; }
    var src = null;
    sources.forEach(function (s) { if (s.id === cs.sourceId) { src = s; } });

    var h = headHtml(layer);
    h += '<div class="c09-body c09-copy">';
    h += '<div class="c09-chap-hero"><span class="c09-chap-hero-num">' + ico('copy') + '</span>' +
      '<div class="c09-chap-hero-text"><h1>Copy Settings From Another Project</h1>' +
      '<p>A one-time copy into <strong>Puppet Master</strong>. Values are copied once and then the two projects stay fully independent — nothing links, nothing syncs.</p></div></div>';

    for (var stepN = 1; stepN <= 4; stepN++) {
      var stateCls = stepN < cs.step ? 'is-done' : (stepN === cs.step ? 'is-active' : 'is-ahead');
      h += '<section class="c09-step ' + stateCls + '" data-step="' + stepN + '">';
      h += '<div class="c09-step-bar">' +
        '<span class="c09-step-num">' + stepN + '</span>' +
        '<span class="c09-step-title">' + COPY_STEPS[stepN - 1] + '</span>';
      if (stepN < cs.step) {
        h += '<span class="c09-step-sum">' + esc(copyStepSummary(stepN, cs, src)) + '</span>';
        if (!cs.receipt) { h += '<button class="c09-mini-btn" data-copy-edit="' + stepN + '">Change</button>'; }
      }
      h += '</div>';
      if (stepN === cs.step) { h += '<div class="c09-step-body">' + copyStepBody(stepN, cs, sources, src) + '</div>'; }
      h += '</section>';
    }
    h += '</div>';
    page.innerHTML = h;
    wireHead(layer, page);
    wireCopy(layer, page, sources);
    hydrate(page);
  }

  function copyStepSummary(stepN, cs, src) {
    if (stepN === 1) { return src ? src.name : ''; }
    if (stepN === 2) { return cs.catIds.length + (cs.catIds.length === 1 ? ' category' : ' categories'); }
    if (stepN === 3 && cs.preview) {
      var c = cs.preview.counts;
      return c.add + ' new · ' + c.replace + ' replaced · ' + c.conflict + ' conflicts';
    }
    return '';
  }

  function copyStepBody(stepN, cs, sources, src) {
    var h = '';
    if (stepN === 1) {
      h += '<div class="c09-copy-sources" role="radiogroup" aria-label="Source project">';
      sources.forEach(function (s) {
        var total = 0;
        arr(s.categorySummaries).forEach(function (c) { total += c.count; });
        h += '<button class="c09-source" role="radio" aria-checked="' + (s.id === cs.sourceId ? 'true' : 'false') +
          '" data-source="' + esc(s.id) + '">' +
          '<span class="c09-source-radio"></span>' +
          '<span class="c09-source-main"><span class="c09-source-name">' + esc(s.name) +
          (s.legacy ? ' <span class="c09-badge">Older format</span>' : '') + '</span>' +
          '<span class="c09-source-meta">Updated ' + esc(fmtWhen(s.lastUpdated) || s.lastUpdated) + ' · ' +
          arr(s.categorySummaries).length + ' categories · ' + fmtInt(total) + ' values</span>' +
          (s.legacy ? '<span class="c09-source-warn">Some values may not carry over; the preview marks them honestly.</span>' : '') +
          '</span></button>';
      });
      h += '</div><div class="c09-step-nav">' +
        '<button class="c09-btn c09-btn-primary" data-copy-next="2"' + (cs.sourceId ? '' : ' disabled') + '>Continue</button></div>';
    } else if (stepN === 2 && src) {
      h += '<p class="c09-sec-desc">Pick the categories to bring over. Counts are what the source project actually has.</p>';
      h += '<div class="c09-copy-cats">';
      arr(src.categorySummaries).forEach(function (c) {
        var on = cs.catIds.indexOf(c.cat) >= 0;
        h += '<label class="c09-copy-cat"><input type="checkbox" data-copy-cat="' + esc(c.cat) + '"' + (on ? ' checked' : '') + '>' +
          '<span>' + esc(c.title || c.cat) + '</span><span class="c09-copy-cat-n">' + fmtInt(c.count) + '</span></label>';
      });
      h += '</div>';
      h += '<div class="c09-step-nav"><button class="c09-btn" data-copy-back="1" data-pm2-back aria-label="Back to ' + COPY_STEPS[0] + '">Back</button>' +
        '<button class="c09-mini-btn" data-copy-allcats>' + (cs.catIds.length === arr(src.categorySummaries).length ? 'Clear all' : 'Select all') + '</button>' +
        '<button class="c09-btn c09-btn-primary" data-copy-preview' + (cs.catIds.length ? '' : ' disabled') + '>Preview the copy</button></div>';
    } else if (stepN === 3 && cs.preview) {
      var pv = cs.preview;
      h += '<div class="c09-pv-counts">';
      [['add', 'New', 'ok'], ['replace', 'Replaced', 'attention'], ['unchanged', 'Unchanged', 'muted'],
       ['unavailable', 'Unavailable', 'muted'], ['conflict', 'Conflicts', 'attention']].forEach(function (p) {
        h += '<span class="c09-pv-count" data-kind="' + p[0] + '"><strong>' + fmtInt(pv.counts[p[0]]) + '</strong> ' + p[1] + '</span>';
      });
      h += '</div>';
      h += '<div class="c09-table-scroll"><table class="c09-table"><thead><tr><th>Category</th><th>New</th><th>Replaced</th><th>Unchanged</th><th>Unavailable</th><th>Conflicts</th></tr></thead><tbody>';
      arr(pv.perCategory).forEach(function (c) {
        h += '<tr><td>' + esc(c.title || c.cat) + '</td><td>' + c.counts.add + '</td><td>' + c.counts.replace +
          '</td><td>' + c.counts.unchanged + '</td><td>' + c.counts.unavailable + '</td><td>' + c.counts.conflict + '</td></tr>';
      });
      h += '</tbody></table></div>';
      h += '<div class="c09-pv-items">';
      arr(pv.items).forEach(function (it, i) {
        var open = !!cs.inspect[i];
        h += '<div class="c09-pv-item" data-kind="' + esc(it.kind) + '">' +
          '<button class="c09-pv-item-line" data-copy-inspect="' + i + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
          '<span class="c09-pv-kind" data-kind="' + esc(it.kind) + '">' + esc(it.kind) + '</span>' +
          '<span class="c09-pv-label">' + esc(it.label) + '</span>' +
          '<span class="c09-pv-cat">' + esc((catById(it.cat) || {}).title || it.cat) + '</span>' +
          '<span class="c09-caret' + (open ? ' is-open' : '') + '"></span></button>' +
          '<div class="c09-pv-detail"' + (open ? '' : ' hidden') + '><dl class="c09-kv">' +
          (it.current != null ? '<dt>Current value</dt><dd>' + esc(String(it.current)) + '</dd>' : '') +
          (it.incoming != null ? '<dt>Incoming value</dt><dd>' + esc(String(it.incoming)) + '</dd>' : '') +
          (it.note ? '<dt>Note</dt><dd>' + esc(it.note) + '</dd>' : '') +
          '<dt>ID</dt><dd><code class="c09-code">' + esc(it.settingId) + '</code></dd>' +
          '</dl></div></div>';
      });
      h += '</div>';
      h += '<p class="c09-callout">' + ico('key') + '<span>' + esc(pv.credentialNote || '') + '</span></p>';
      h += '<p class="c09-callout c09-callout-quiet">' + ico('disk') +
        '<span>A restore point is created automatically before anything is written, so the whole copy can be rolled back in one step.</span></p>';
      h += '<div class="c09-step-nav"><button class="c09-btn" data-copy-back="2" data-pm2-back aria-label="Back to ' + COPY_STEPS[1] + '">Back</button>' +
        '<button class="c09-btn c09-btn-primary" data-copy-next="4">Continue to confirm</button></div>';
    } else if (stepN === 4 && cs.preview) {
      var pv2 = cs.preview;
      var writes = pv2.counts.add + pv2.counts.replace;
      if (cs.receipt && !cs.receipt.error) {
        h += '<div class="c09-receipt" data-rolled="' + (cs.rolledBack ? 'true' : 'false') + '">' +
          '<p class="c09-receipt-head">' + ico(cs.rolledBack ? 'undo' : 'check') +
          (cs.rolledBack ? 'Rolled back — your previous values are restored.' : 'Copy applied and verified.') + '</p>' +
          '<dl class="c09-kv">' +
          '<dt>Applied</dt><dd>' + fmtInt(cs.receipt.applied || 0) + ' values from ' + esc(pv2.sourceName || '') + '</dd>' +
          '<dt>Verified</dt><dd>' + (cs.receipt.verified ? 'Yes — every written value read back correctly.' : 'See note') + '</dd>' +
          '<dt>Receipt</dt><dd><code class="c09-code">' + esc(cs.receipt.receiptId || '') + '</code></dd>' +
          '<dt>Restore point</dt><dd><code class="c09-code">' + esc(cs.receipt.restorePointId || '') + '</code></dd>' +
          '</dl>' +
          '<div class="c09-step-nav">' +
          (cs.rolledBack ? '' : '<button class="c09-btn" data-copy-rollback>' + ico('undo') + 'Roll back this copy</button>') +
          '<button class="c09-btn c09-btn-primary" data-copy-done>Done</button>' +
          '<button class="c09-mini-btn" data-copy-restart>Start another copy</button></div>' +
          '</div>';
      } else {
        h += '<p class="c09-copy-confirm">Copy <strong>' + fmtInt(writes) + '</strong> value' + (writes === 1 ? '' : 's') +
          ' from <strong>' + esc(pv2.sourceName || '') + '</strong> into <strong>Puppet Master</strong>. ' +
          'The copy is atomic: restore point first, one write pass, then verification. Unavailable values and conflicts are skipped and stay listed on the review step.</p>';
        if (cs.applyError) { h += '<p class="c09-row-error">' + esc(cs.applyError) + '</p>'; }
        if (cs.applying) {
          var ph = cs.opPhase;
          var phase = ph && ph.phase ? optionLabel(ph.phase) : 'Starting';
          var pct = (ph && ph.progressKind === 'determinate' && ph.total > 0)
            ? Math.round((ph.completed / ph.total) * 100) : null;
          h += '<div class="c09-op c09-op-inline" data-status="' + esc(ph ? ph.status : 'queued') + '">' +
            '<span class="c09-op-name">Applying — ' + esc(phase) + '</span>' +
            '<span class="c09-op-track">' +
            (pct == null ? '<span class="c09-op-indet"></span>'
              : '<span class="c09-op-fill" style="width:' + pct + '%"></span>') +
            '</span>' + (pct != null ? '<span class="c09-op-pct">' + pct + '%</span>' : '') + '</div>';
        }
        h += '<div class="c09-step-nav"><button class="c09-btn" data-copy-back="3" data-pm2-back aria-label="Back to ' + COPY_STEPS[2] + '"' + (cs.applying ? ' disabled' : '') + '>Back</button>' +
          '<button class="c09-btn c09-btn-primary" data-copy-apply' + (cs.applying ? ' disabled' : '') + '>' +
          (cs.applying ? 'Applying…' : 'Create restore point & apply') + '</button></div>';
      }
    }
    return h;
  }

  function wireCopy(layer, page, sources) {
    var cs = copyState();
    function rerender() {
      if (topLayer() === layer) { renderLayerContent(layer); }
    }
    page.addEventListener('click', function (ev) {
      var t;
      t = ev.target.closest('[data-source]');
      if (t) { cs.sourceId = t.getAttribute('data-source'); cs.catIds = []; cs.preview = null; rerender(); return; }
      t = ev.target.closest('[data-copy-next]');
      if (t && !t.disabled) { cs.step = Number(t.getAttribute('data-copy-next')); rerender(); return; }
      t = ev.target.closest('[data-copy-back]');
      if (t && !t.disabled) { cs.step = Number(t.getAttribute('data-copy-back')); rerender(); return; }
      t = ev.target.closest('[data-copy-edit]');
      if (t) { cs.step = Number(t.getAttribute('data-copy-edit')); cs.receipt = null; rerender(); return; }
      t = ev.target.closest('[data-copy-allcats]');
      if (t) {
        var src = null;
        sources.forEach(function (s) { if (s.id === cs.sourceId) { src = s; } });
        if (src) {
          var all = arr(src.categorySummaries).map(function (c) { return c.cat; });
          cs.catIds = (cs.catIds.length === all.length) ? [] : all;
          rerender();
        }
        return;
      }
      t = ev.target.closest('[data-copy-preview]');
      if (t && !t.disabled) {
        try { cs.preview = window.PM2.copy.preview(cs.sourceId, cs.catIds.slice()); }
        catch (e) { cs.preview = null; }
        if (cs.preview) { cs.step = 3; cs.inspect = {}; }
        rerender();
        return;
      }
      t = ev.target.closest('[data-copy-inspect]');
      if (t) {
        var i = Number(t.getAttribute('data-copy-inspect'));
        cs.inspect[i] = !cs.inspect[i];
        var det = t.parentNode.querySelector('.c09-pv-detail');
        if (det) { det.hidden = !cs.inspect[i]; }
        t.setAttribute('aria-expanded', cs.inspect[i] ? 'true' : 'false');
        var caret = t.querySelector('.c09-caret');
        if (caret) { caret.classList.toggle('is-open', cs.inspect[i]); }
        return;
      }
      t = ev.target.closest('[data-copy-apply]');
      if (t && !t.disabled && cs.preview) {
        cs.applying = true;
        cs.applyError = null;
        rerender();
        try {
          window.PM2.copy.apply(cs.preview.token).then(function (r) {
            cs.applying = false;
            if (r && r.receiptId) { cs.receipt = r; }
            else { cs.applyError = (r && r.error) || 'The copy did not apply. Stage a fresh preview and try again.'; }
            rerender();
          });
        } catch (e) {
          cs.applying = false;
          cs.applyError = 'The copy did not apply.';
          rerender();
        }
        return;
      }
      t = ev.target.closest('[data-copy-rollback]');
      if (t && cs.receipt) {
        try {
          var rb = window.PM2.copy.rollback(cs.receipt.receiptId);
          Promise.resolve(rb).then(function () { cs.rolledBack = true; rerender(); });
        } catch (e) { cs.rolledBack = true; rerender(); }
        return;
      }
      t = ev.target.closest('[data-copy-done]');
      if (t) { goDest({ route: 'home' }); return; }
      t = ev.target.closest('[data-copy-restart]');
      if (t) { ui.copy = null; copyState(); rerender(); return; }
    });
    page.addEventListener('change', function (ev) {
      var cat = ev.target.getAttribute && ev.target.getAttribute('data-copy-cat');
      if (!cat) { return; }
      var at = cs.catIds.indexOf(cat);
      if (ev.target.checked && at < 0) { cs.catIds.push(cat); }
      if (!ev.target.checked && at >= 0) { cs.catIds.splice(at, 1); }
      var pvBtn = page.querySelector('[data-copy-preview]');
      if (pvBtn) { pvBtn.disabled = !cs.catIds.length; }
    });
  }

  function topLayer() { return ui.layers.length ? ui.layers[ui.layers.length - 1] : null; }

  /* ============================ landing & locator ============================ */

  var objectDestCache = {};
  function managerObjectDest(mid, oid) {
    if (!objectDestCache[mid]) {
      var def = managerDef(mid);
      var list = [];
      if (def && typeof def.objects === 'function') {
        try { list = arr(def.objects(store)); } catch (e) { list = []; }
      }
      var map = {};
      list.forEach(function (o) { map[o.id] = o; });
      objectDestCache[mid] = map;
    }
    return objectDestCache[mid][oid] || null;
  }

  function settingEl(page, id) {
    return page.querySelector('.c09-row[data-setting-id="' + id + '"], [data-setting-id="' + id + '"]');
  }

  function resolveFocusTarget(focus, dest, page) {
    var rest;
    if (focus.indexOf('s:') === 0) { return settingEl(page, focus.slice(2)); }
    if (focus.indexOf('m:') === 0) { return page.querySelector('.c09-mgr-hero') || page; }
    if (focus.indexOf('o:') === 0) {
      rest = focus.slice(2);
      var slash = rest.indexOf('/');
      var mid = slash >= 0 ? rest.slice(0, slash) : rest;
      var oid = slash >= 0 ? rest.slice(slash + 1) : null;
      var od = oid ? managerObjectDest(mid, oid) : null;
      var d = od ? obj(od.dest) : {};
      var el = null;
      if (d.sectionId) { el = page.querySelector('[data-object-id="' + d.sectionId + '"]'); }
      if (!el && oid) { el = page.querySelector('[data-object-id="' + oid + '"]'); }
      if (!el && d.objectId) { el = page.querySelector('[data-object-id="' + d.objectId + '"]'); }
      return el;
    }
    if (focus.indexOf('a:') === 0) {
      return page.querySelector('[data-action-id="' + focus.slice(2) + '"]');
    }
    if (/^[wduh]:/.test(focus)) {
      var el2 = null;
      if (dest.sectionId) { el2 = page.querySelector('[data-object-id="' + dest.sectionId + '"]'); }
      if (!el2 && dest.objectId) { el2 = page.querySelector('[data-object-id="' + dest.objectId + '"], .c09-object[data-object-id="' + dest.objectId + '"]'); }
      if (!el2 && dest.settingId) { el2 = settingEl(page, dest.settingId); }
      return el2 || page.querySelector('.c09-mgr-hero');
    }
    /* raw id: setting, object, or section */
    return settingEl(page, focus) ||
      page.querySelector('[data-object-id="' + focus + '"]') ||
      page.querySelector('[data-section="' + focus + '"]');
  }

  /* Reveal a target hidden inside a collapsed advanced container. */
  function revealTarget(page, el) {
    var host = el;
    while (host && host !== page) {
      if (host.hasAttribute && host.hidden) {
        host.hidden = false;
        var key = host.getAttribute('data-adv-body') || host.getAttribute('data-msec-adv-body') || host.getAttribute('data-card-body');
        if (key) {
          ui.advOpen[key] = true;
          ui.detailsOpen[key] = true;
          var toggle = page.querySelector('[data-adv="' + key + '"], [data-msec-adv="' + key + '"], [data-card-detail="' + key + '"]');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
            var caret = toggle.querySelector('.c09-caret');
            if (caret) { caret.classList.add('is-open'); }
          }
        }
      }
      host = host.parentNode;
    }
  }

  var locateTimer = null;
  function locate(el, page) {
    if (!el) { return; }
    revealTarget(page, el);
    if (!el.hasAttribute('tabindex')) { el.setAttribute('tabindex', '-1'); }
    var prev = page.querySelectorAll('.pm2-located');
    for (var i = 0; i < prev.length; i++) { prev[i].classList.remove('pm2-located', 'c09-located'); }
    el.scrollIntoView({ block: 'center', behavior: motionOK() ? 'smooth' : 'auto' });
    try { el.focus({ preventScroll: true }); } catch (e) { try { el.focus(); } catch (e2) { /* ignore */ } }
    el.classList.add('pm2-located', 'c09-located');
    if (locateTimer) { window.clearTimeout(locateTimer); }
    locateTimer = window.setTimeout(function () {
      el.classList.remove('pm2-located', 'c09-located');
    }, LOCATE_MS);
  }

  function performLanding(dest, top) {
    if (!top) { return; }
    var page = pageOf(top);
    if (!page) { return; }
    var kind = str(dest.route) || 'home';
    var focus = str(dest.focus);
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        var target = null;
        if (focus) { target = resolveFocusTarget(focus, dest, page); }
        if (!target && kind === 'setting' && dest.settingId) { target = settingEl(page, str(dest.settingId)); }
        if (!target && kind === 'dest' && dest.sub) {
          target = page.querySelector('[data-section="' + str(dest.sub) + '"]');
        }
        if (target) { locate(target, page); }
        else if (top.scrollTop) { page.scrollTop = top.scrollTop; }
      });
    });
  }

  /* ============================ open(dest) — the concept router ============================ */

  function open(dest) {
    dest = obj(dest);
    var kind = str(dest.route) || str(dest.kind) || 'home';
    closeMenu(false);
    var plan = planFor(dest);
    var top = renderStack(plan);
    if (kind === 'search') {
      restoreSearch(str(dest.query));
      return null;
    }
    if (ui.search.open) {
      ui.search.open = false;
      ui.search.restoreHash = null;
    }
    performLanding(dest, top);
    return null;
  }

  /* ============================ ops & receipts strip ============================ */

  var TERMINAL = { done: 1, failed: 1, degraded: 1, retryable: 1, canceled: 1, 'recovery-required': 1 };
  var OP_WORDS = { queued: 'Queued', running: 'Running', done: 'Done', failed: 'Failed',
    degraded: 'Finished with issues', retryable: 'Failed — retry available', canceled: 'Canceled',
    'recovery-required': 'Needs recovery' };

  function onOp(p) {
    if (!p || !p.opId) { return; }
    if (!ui.ops[p.opId]) { ui.opOrder.push(p.opId); }
    ui.ops[p.opId] = p;
    if (TERMINAL[p.status]) {
      (function (id) {
        window.setTimeout(function () {
          delete ui.ops[id];
          var at = ui.opOrder.indexOf(id);
          if (at >= 0) { ui.opOrder.splice(at, 1); }
          renderOps();
        }, 3600);
      })(p.opId);
    }
    renderOps();
    if (p.name === 'copy-apply' && ui.copy) {
      ui.copy.opPhase = p;
      var top = topLayer();
      if (top && top.kind === 'copy' && ui.copy.applying) { renderLayerContent(top); }
    }
  }

  function onReceipt(r) {
    if (!r || !r.message) { return; }
    var entry = { msg: r.message, id: 'r' + Date.now() + Math.random() };
    ui.receipts.push(entry);
    if (ui.receipts.length > 3) { ui.receipts.shift(); }
    renderOps();
    window.setTimeout(function () {
      var at = ui.receipts.indexOf(entry);
      if (at >= 0) { ui.receipts.splice(at, 1); renderOps(); }
    }, 5200);
  }

  function renderOps() {
    if (!opsEl) { return; }
    var h = '';
    ui.opOrder.forEach(function (id) {
      var p = ui.ops[id];
      if (!p) { return; }
      var pct = (p.progressKind === 'determinate' && p.total > 0)
        ? Math.round((p.completed / p.total) * 100) : null;
      h += '<div class="c09-op" data-status="' + esc(p.status) + '">' +
        '<span class="c09-op-name">' + esc(optionLabel(p.name)) +
        (p.phase ? ' — ' + esc(optionLabel(p.phase)) : '') +
        ' · ' + esc(OP_WORDS[p.status] || p.status) + '</span>' +
        (TERMINAL[p.status] ? '' :
          '<span class="c09-op-track">' + (pct == null ? '<span class="c09-op-indet"></span>'
            : '<span class="c09-op-fill" style="width:' + pct + '%"></span>') + '</span>') +
        (pct != null && !TERMINAL[p.status] ? '<span class="c09-op-pct">' + pct + '%</span>' : '') +
        '</div>';
    });
    ui.receipts.forEach(function (r) {
      h += '<div class="c09-receipt-line">' + ico('check') + '<span>' + esc(r.msg) + '</span></div>';
    });
    opsEl.innerHTML = h;
    opsEl.classList.toggle('has-items', h !== '');
    hydrate(opsEl);
  }

  /* ============================ store events ============================ */

  function resetCaches() {
    allStateCache = null;
    objectDestCache = {};
  }

  function onValue(p) {
    allStateCache = null;
    var top = topLayer();
    if (!top) { return; }
    var page = pageOf(top);
    if (top.kind === 'dest' && page) {
      var el = page.querySelector('.c09-row[data-setting-id="' + p.id + '"]');
      if (el) {
        var row = resolveRowSafe(p.id);
        if (row) {
          var tmp = document.createElement('div');
          tmp.innerHTML = rowHtml(row);
          var fresh = tmp.firstChild;
          el.parentNode.replaceChild(fresh, el);
          hydrate(fresh);
        }
        for (var i = 0; i < ui.layers.length - 1; i++) { ui.layers[i].stale = true; }
        return;
      }
    }
    rebuildSoon();
  }

  function onValueError(p) {
    var top = topLayer();
    if (!top) { return; }
    var page = pageOf(top);
    if (!page) { return; }
    var el = page.querySelector('.c09-row[data-setting-id="' + p.id + '"]');
    if (el) { showRowError(el, p.error || 'That value is not valid.'); }
  }

  function subscribe() {
    store.on('scenario', function () { resetCaches(); ui.copy = null; rebuildSoon(); });
    store.on('fixtures', function () { resetCaches(); rebuildSoon(); });
    store.on('stress', function () { resetCaches(); rebuildSoon(); });
    store.on('change', function (p) {
      if (p && (p.key === 'fixtures' || p.key === 'stress' || p.key === 'scenario')) {
        resetCaches();
        rebuildSoon();
      }
    });
    store.on('value', onValue);
    store.on('value-error', onValueError);
    store.on('op', onOp);
    store.on('receipt', onReceipt);
    store.on('copy', function (p) {
      if (p && (p.phase === 'applied' || p.phase === 'rolled-back')) {
        resetCaches();
        markAllStale();
        var top = topLayer();
        if (top && top.kind !== 'copy') { rebuildSoon(); }
      }
    });
  }

  /* ============================ keyboard & escape ladder ============================ */

  function closeTopDrawer() {
    var token = ui.detailStack.pop();
    if (!token) { return false; }
    var top = topLayer();
    var page = top ? pageOf(top) : null;
    if (token.indexOf('row:') === 0) {
      var sid = token.slice(4);
      ui.detailsOpen[sid] = false;
      if (page) {
        var rowEl = page.querySelector('.c09-row[data-setting-id="' + sid + '"]');
        if (rowEl) {
          var drawer = rowEl.querySelector('.c09-row-drawer');
          var btn = rowEl.querySelector('[data-more]');
          if (drawer) { drawer.hidden = true; }
          if (btn) { btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
        }
      }
      return true;
    }
    ui.detailsOpen[token] = false;
    if (page) {
      var body = page.querySelector('[data-msec-adv-body="' + token + '"], [data-card-body="' + token + '"]');
      if (body) { body.hidden = true; }
      var toggle = page.querySelector('[data-msec-adv="' + token + '"], [data-card-detail="' + token + '"]');
      if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    }
    return true;
  }

  function onKeydown(ev) {
    var mod = ev.ctrlKey || ev.metaKey;
    if (mod && (ev.key === 'k' || ev.key === 'K')) {
      ev.preventDefault();
      var wrap = activeSearchWrap();
      if (wrap) {
        var input = wrap.querySelector('.c09-search-input');
        if (input) { input.focus(); input.select(); }
      }
      return;
    }
    if (ev.key !== 'Escape') { return; }
    if (ui.menu) { closeMenu(true); return; }
    if (ui.search.open) { closeSearch(activeSearchWrap(), true); return; }
    if (ui.detailStack.length) { if (closeTopDrawer()) { return; } }
    var top = topLayer();
    if (top && top.kind === 'manager' && top.state.objectId) {
      goDest({ route: 'manager', managerId: top.state.managerId });
      return;
    }
    if (ui.layers.length > 1) {
      var under = ui.layers[ui.layers.length - 2];
      goDest(layerRoute(under));
    }
    /* at Home the ladder stops — Settings never closes unexpectedly */
  }

  /* ============================ narrow watcher ============================ */

  function watchWidth() {
    function apply() {
      var w = stage.clientWidth || window.innerWidth;
      var narrow = w < 860;
      if (narrow !== ui.narrow) {
        ui.narrow = narrow;
        rootEl.classList.toggle('is-narrow', narrow);
        /* Narrow is the only mode where the shell stage is the scroller, and
           the fixed States dot floats over its bottom-right corner. The
           stylesheet shortens that viewport off this class. */
        if (stage && stage.classList) { stage.classList.toggle('c09-stage-narrow', narrow); }
        applyStackClasses();
      }
      updateSpineFade();
    }
    if (typeof window.ResizeObserver === 'function') {
      var ro = new window.ResizeObserver(function () { apply(); });
      ro.observe(stage);
    } else {
      window.addEventListener('resize', apply);
    }
    apply();
  }

  /* ============================ boot ============================ */

  function boot() {
    stage = document.getElementById('pmStage');
    if (!stage) { return; }
    try { window.PMShell.init({ concept: 'c09-chapters' }); } catch (e) { /* shell optional */ }
    store = window.PM2.store.init('c09-chapters');

    rootEl = div('c09-root');
    rootEl.innerHTML =
      '<div class="c09-canvas"><div class="c09-layers" id="c09Layers"></div>' +
      '<div class="c09-ops" id="c09Ops" aria-live="polite"></div></div>' +
      '<div class="c09-spine-wrap" id="c09SpineWrap">' +
      '<nav class="c09-spine" id="c09Spine" aria-label="Settings chapters"></nav></div>';
    stage.appendChild(rootEl);
    layersEl = rootEl.querySelector('#c09Layers');
    spineWrapEl = rootEl.querySelector('#c09SpineWrap');
    spineEl = rootEl.querySelector('#c09Spine');
    opsEl = rootEl.querySelector('#c09Ops');

    buildSpine();
    subscribe();
    document.addEventListener('keydown', onKeydown);
    watchWidth();

    var S = statesApi();
    if (S && typeof S.mountDrawer === 'function') {
      try { S.mountDrawer(store); } catch (e) { /* drawer optional */ }
    }

    window.PM2.route.bind({ open: open });
  }

  boot();
})();
