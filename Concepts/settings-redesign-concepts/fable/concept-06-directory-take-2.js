/* concept-06-directory-take-2.js — fable · 06 Longform
   A1 Directory / Take 2: an editorial, list-led, single-column Settings system.
   - Home: large typographically-integrated search over twelve full-width
     destination rows; one compact attention block; quiet inline utilities.
   - A narrow, stable, text-led domain rail persists from Home through every
     depth; at narrow widths it collapses to a topbar crumb selector and the
     whole surface becomes a single-pane push stack.
   - Managers: compact rosters whose selection slides a restrained detail
     sheet into the reading column (in-flow, pushing content, never overlay).
   - Copy: a quiet focused dialog. All Settings: faceted, virtualized index.
   - Motion: fade-and-rise in reading order only. No decorative movement.
   Consumes _shared/_shared2 APIs exactly as contracted (CONTRACT2.md).
   Routing goes through PM2.route for every navigation. No emoji. */
(function () {
  'use strict';

  var CID = 'concept-06-directory-take-2';
  var store = null;
  var stage = null;
  var els = {};          /* root, rail, topbar, scroll, article, drops */
  var menuState = null;  /* open popup menu {el, invoker, onClose} */

  /* ============================ ui state ============================
     Explicit state machines (Slint-portable): the route is the primary
     state; everything here is presentation state keyed by stable ids. */
  var ui = {
    view: { kind: 'home' },       /* mirrors the current parsed dest */
    narrow: false,
    folds: {},                    /* foldKey -> true (open) */
    rowDetail: {},                /* settingId -> true */
    rowError: {},                 /* settingId -> message (validation) */
    search: { query: '', res: null, active: -1, open: false, anchor: 'home' },
    all: { q: '', cat: '', type: '', tier: '', changed: '', state: '', top: 0 },
    copy: { step: 'source', sourceId: null, cats: {}, preview: null,
            result: null, rolledBack: false, inspect: {}, opNote: null },
    lastOp: null,                 /* latest op payload (truthful staged) */
    located: null
  };

  /* ============================ helpers ============================ */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object' && !Array.isArray(x)) ? x : {}; }
  function str(x) { return typeof x === 'string' ? x : ''; }
  function attrJson(o) { return esc(JSON.stringify(o)); }
  function inv() { return obj(window.PM2_INVENTORY); }
  function util() { return window.PM2.util; }
  function managers() { return window.PM2.managers; }

  var invById = null;
  function invRecord(id) {
    if (!invById) {
      invById = {};
      arr(inv().settings).forEach(function (s) { invById[s.id] = s; });
    }
    return invById[id] || null;
  }
  function catById(id) {
    var cats = arr(inv().categories);
    for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return cats[i];
    return null;
  }
  function subOf(cat, subId) {
    var c = catById(cat);
    if (!c) return null;
    for (var i = 0; i < arr(c.subgroups).length; i++) if (c.subgroups[i].id === subId) return c.subgroups[i];
    return null;
  }
  function scenario() { return str(store.get('scenario')) || 'baseline'; }
  function fixtures() { return arr(store.get('fixtures')); }
  function hasFx(id) { return fixtures().indexOf(id) >= 0; }
  function reducedMotion() {
    var de = document.documentElement;
    if (de.getAttribute('data-motion') === 'reduced' || de.getAttribute('data-reduced-motion') === '1') return true;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function fmtWhen(iso) {
    if (!iso) return '';
    try { return util().fmtAgo(iso); } catch (e) { return String(iso); }
  }
  function goDest(dest, params) {
    window.PM2.route.go(dest, params ? { params: params } : undefined);
  }

  /* stagger counter for the fade-and-rise entrance (reading order) */
  function mkRise() {
    var i = 0;
    return function () {
      var n = Math.min(i, 9); i += 1;
      return ' c06-rise" style="--c06-i:' + n + ';';
    };
  }

  /* ============================ boot ============================ */

  function boot() {
    window.PMShell.init({
      concept: CID,
      onWidthChange: function () { syncNarrow(); }
    });
    store = window.PM2.store.init(CID);
    stage = document.getElementById('pmStage');
    buildFrame();
    try { window.PM2.states.mountDrawer(store); } catch (e) { /* drawer optional */ }
    bindStoreEvents();
    bindGlobalKeys();
    syncNarrow();
    window.PM2.route.bind({ open: open });
  }

  function buildFrame() {
    stage.innerHTML =
      '<div class="c06 c06-root" id="c06Root" data-view="home">' +
        '<nav class="c06-rail" id="c06Rail" aria-label="Settings domains"></nav>' +
        '<div class="c06-main">' +
          '<div class="c06-topbar" id="c06Topbar"></div>' +
          '<div class="c06-scroll" id="c06Scroll"><div class="c06-article" id="c06Article"></div></div>' +
        '</div>' +
      '</div>';
    els.root = document.getElementById('c06Root');
    els.rail = document.getElementById('c06Rail');
    els.topbar = document.getElementById('c06Topbar');
    els.scroll = document.getElementById('c06Scroll');
    els.article = document.getElementById('c06Article');
    els.root.addEventListener('click', onRootClick);
    els.root.addEventListener('keydown', onRootKeydown);
    els.scroll.addEventListener('scroll', onIndexScroll);
    els.root.addEventListener('change', function (ev) {
      var cb = ev.target.closest ? ev.target.closest('[data-copycat]') : null;
      if (cb) ui.copy.cats[cb.getAttribute('data-copycat')] = cb.checked;
      if (cb && ui.view.kind === 'copy') renderCopy();
    });
    if (window.ResizeObserver) {
      try { new ResizeObserver(function () { syncNarrow(); }).observe(stage); }
      catch (e) { /* width sync falls back to PMShell onWidthChange */ }
    }
  }

  function syncNarrow() {
    if (!els.root || !stage) return;
    var w = stage.getBoundingClientRect().width;
    var narrow = w > 0 && w < 880;
    if (narrow !== ui.narrow) {
      ui.narrow = narrow;
      els.root.classList.toggle('c06-narrow', narrow);
      renderTopbar();
    }
  }

  /* ============================ store events ============================ */

  var rerenderTimer = 0;
  function queueRerender() {
    if (rerenderTimer) return;
    rerenderTimer = window.setTimeout(function () {
      rerenderTimer = 0;
      renderCurrent({ preserveScroll: true });
    }, 24);
  }

  function bindStoreEvents() {
    store.on('scenario', queueRerender);
    store.on('fixtures', queueRerender);
    store.on('stress', queueRerender);
    store.on('value', function (p) {
      /* keep rail counts + view honest; preserve reading position */
      queueRerender();
      if (p && !p.batch) renderRail();
    });
    store.on('copy', queueRerender);
    store.on('change', function (p) {
      if (p && (p.key === 'scenario' || p.key === 'fixtures' || p.key === 'stress')) queueRerender();
    });
    store.on('receipt', function (r) {
      if (r && r.message) window.PMShell.toast(r.message);
    });
    store.on('op', function (payload) {
      ui.lastOp = payload;
      updateOpLines(payload);
    });
    store.on('value-error', function (p) {
      if (!p) return;
      ui.rowError[p.id] = p.error;
      var line = els.article.querySelector('[data-errline="' + cssEscape(p.id) + '"]');
      if (line) { line.textContent = p.error; line.hidden = false; }
    });
  }

  function cssEscape(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  /* Truthful op line: phase + determinate progress only with a real
     denominator. Updates every [data-opline] container in place. */
  function opLineHtml(p) {
    if (!p) return '';
    var bits = '<strong>' + esc(p.name) + (p.ref ? ' · ' + esc(p.ref) : '') + '</strong> — ' + esc(p.status);
    if (p.phase) bits += ' (' + esc(p.phase) + ')';
    if (p.progressKind === 'determinate' && typeof p.completed === 'number' && typeof p.total === 'number') {
      bits += ' · ' + p.completed + ' of ' + p.total;
    }
    if (p.reason) bits += ' · ' + esc(p.reason);
    return bits;
  }
  function updateOpLines(payload) {
    var lines = els.article.querySelectorAll('[data-opline]');
    for (var i = 0; i < lines.length; i++) {
      lines[i].hidden = false;
      lines[i].setAttribute('data-status', payload.status);
      lines[i].innerHTML = opLineHtml(payload);
    }
    if (ui.view.kind === 'copy') updateCopyOp(payload);
  }

  /* ============================ router: open(dest) ============================ */

  function open(dest) {
    closeMenu();
    closeDropdown();
    var d = obj(dest);
    var kind = str(d.route) || 'home';
    ui.view = { kind: kind, cat: d.cat || null, sub: d.sub || null,
                managerId: d.managerId || null, objectId: d.objectId || null,
                tab: d.tab || null, settingId: d.settingId || null,
                query: d.query || null, focus: d.focus || null };

    if (kind === 'setting') {
      var rec = invRecord(d.settingId);
      if (rec) { ui.view.cat = rec.cat; ui.view.sub = rec.sub; }
      else {
        /* Shared-data gap workaround: the canonical deep-link probe
           system.health.diagnostics-verbosity lives in the _shared ext
           dataset but not in the 828-row PM2_INVENTORY. Serve such ids
           honestly as read-only extension rows on their domain page. */
        var ext = obj(store.data.settings)[d.settingId];
        if (ext) {
          var parts = String(d.settingId).split('.');
          ui.view.cat = parts[0];
          ui.view.sub = parts[1] || null;
          ui.view.extSetting = d.settingId;
        }
      }
    }
    renderCurrent({});
    return applyLanding(d);
  }

  function renderCurrent(opts) {
    var o = obj(opts);
    var top = o.preserveScroll ? els.scroll.scrollTop : 0;
    var v = ui.view;
    els.root.setAttribute('data-view', v.kind);
    renderRail();
    renderTopbar();
    if (v.kind === 'dest' && v.cat) renderDest(v.cat, v.sub);
    else if (v.kind === 'setting' && v.cat) renderDest(v.cat, v.sub);
    else if (v.kind === 'manager' && v.managerId) renderManager(v.managerId, v.objectId, v.tab);
    else if (v.kind === 'all') renderAll();
    else if (v.kind === 'copy') renderCopy();
    else renderHome();
    if (o.preserveScroll) els.scroll.scrollTop = top;
    else els.scroll.scrollTop = 0;
    try { window.PMIcons.hydrate(els.article); } catch (e) { /* decorative */ }
  }

  /* Landing sequence: expand folds -> scroll -> focus -> calm locator. */
  function applyLanding(d) {
    var target = null;
    var focusRid = d.focus || null;

    if (focusRid && window.PM2.search && window.PM2.search.resolveRid) {
      var res = window.PM2.search.resolveRid(focusRid);
      if (res && res.dest) {
        var rd = res.dest;
        if (rd.sectionId) target = findByItemId(rd.sectionId);
        if (!target && rd.settingId) target = findSettingRow(rd.settingId);
        if (!target && rd.objectId) target = findObject(rd.objectId);
      }
      if (!target) {
        var plain = focusRid.replace(/^s:/, '');
        target = findSettingRow(plain) || findByItemId(plain);
      }
    }
    if (!target && d.route === 'setting' && d.settingId) target = findSettingRow(d.settingId);
    if (!target && d.route === 'manager') {
      if (d.sectionId) target = findByItemId(d.sectionId);
      if (!target && d.objectId) target = findObject(d.objectId);
    }
    if (!target && d.route === 'search') {
      openSearchSurface(d.query || '');
      return null;
    }
    if (target) landOn(target);
    return null;
  }

  function findSettingRow(id) {
    var el = els.article.querySelector('[data-setting-id="' + cssEscape(id) + '"]');
    if (el) revealInFolds(el);
    return el;
  }
  function findByItemId(id) {
    var el = els.article.querySelector('[data-item-id="' + cssEscape(id) + '"]') ||
             els.article.querySelector('[data-section="' + cssEscape(id) + '"]');
    if (el) revealInFolds(el);
    return el;
  }
  function findObject(id) {
    return els.article.querySelector('[data-object-id="' + cssEscape(id) + '"]');
  }
  function revealInFolds(el) {
    var p = el.parentElement;
    while (p && p !== els.article) {
      if (p.classList && p.classList.contains('c06-fold-body') && p.hidden) {
        p.hidden = false;
        var key = p.getAttribute('data-fold-body');
        if (key) ui.folds[key] = true;
        var btn = p.parentElement && p.parentElement.querySelector('.c06-fold-btn');
        if (btn) {
          btn.setAttribute('aria-expanded', 'true');
          var mark = btn.querySelector('.c06-fold-mark');
          if (mark) mark.textContent = '−';
        }
      }
      p = p.parentElement;
    }
  }

  var locateTimer = 0;
  function landOn(el) {
    if (!el) return;
    try { el.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' }); }
    catch (e) { el.scrollIntoView(); }
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (e) { try { el.focus(); } catch (e2) { /* ok */ } }
    if (ui.located && ui.located !== el) {
      ui.located.classList.remove('pm2-located', 'c06-located-hold');
    }
    ui.located = el;
    el.classList.add('pm2-located');
    if (reducedMotion()) el.classList.add('c06-located-hold');
    if (locateTimer) window.clearTimeout(locateTimer);
    locateTimer = window.setTimeout(function () {
      el.classList.remove('pm2-located', 'c06-located-hold');
      if (ui.located === el) ui.located = null;
    }, 2100);
  }

  /* ============================ rail ============================ */

  function renderRail() {
    var counts = store.counts();
    var v = ui.view;
    var activeCat = v.cat || (v.kind === 'manager' ? mgrCat(v.managerId) : null);
    var h = '';
    h += '<div class="c06-rail-title">Settings</div>';
    h += '<div class="c06-rail-project">' + esc(store.data.project.name) + ' · Project</div>';
    h += '<div class="c06-rail-nav">';
    h += '<button type="button" class="c06-rail-link" data-act="goto" data-goto="' +
         attrJson({ route: 'home' }) + '"' + (v.kind === 'home' ? ' aria-current="true"' : '') + '>Home</button>';
    arr(counts.byCategory).forEach(function (c) {
      h += '<button type="button" class="c06-rail-link" data-act="goto" data-goto="' +
           attrJson({ route: 'dest', cat: c.id }) + '"' +
           (activeCat === c.id ? ' aria-current="true"' : '') + '>' +
           '<span>' + esc(c.title) + '</span>' +
           '<span class="c06-rail-count">' + c.total + '</span></button>';
    });
    h += '</div>';
    h += '<div class="c06-rail-rule"></div>';
    h += '<div class="c06-rail-foot">';
    h += '<button type="button" class="c06-rail-util" data-act="goto" data-goto="' + attrJson({ route: 'all' }) + '">All Settings</button>';
    h += '<button type="button" class="c06-rail-util" data-act="goto" data-goto="' + attrJson({ route: 'copy' }) + '">Copy Settings…</button>';
    h += '</div>';
    els.rail.innerHTML = h;
  }

  function mgrCat(id) {
    var def = id ? managers().get(id) : null;
    return def ? def.cat : null;
  }

  /* ============================ topbar ============================ */

  function crumbTrail() {
    var v = ui.view;
    var trail = [{ label: 'Settings', dest: { route: 'home' } }];
    function pushCat(catId) {
      var c = catById(catId);
      if (c) trail.push({ label: c.title, dest: { route: 'dest', cat: catId } });
    }
    if (v.kind === 'dest' || v.kind === 'setting') {
      if (v.cat) pushCat(v.cat);
      if (v.sub) {
        var sg = subOf(v.cat, v.sub);
        if (sg) trail.push({ label: sg.title, dest: { route: 'dest', cat: v.cat, sub: v.sub } });
      }
      if (v.kind === 'setting' && v.settingId) {
        var rec = invRecord(v.settingId);
        if (rec) trail.push({ label: rec.label, dest: { route: 'setting', settingId: v.settingId } });
      }
    } else if (v.kind === 'manager') {
      var def = managers().get(v.managerId);
      if (def) {
        pushCat(def.cat);
        trail.push({ label: def.title, dest: { route: 'manager', managerId: def.id } });
        if (v.objectId) {
          trail.push({ label: objectLabel(def, v.objectId),
                       dest: { route: 'manager', managerId: def.id, objectId: v.objectId } });
          if (v.tab) trail.push({ label: tabLabel(v.tab),
                                  dest: { route: 'manager', managerId: def.id, objectId: v.objectId, tab: v.tab } });
        }
      }
    } else if (v.kind === 'all') trail.push({ label: 'All Settings', dest: { route: 'all' } });
    else if (v.kind === 'copy') trail.push({ label: 'Copy Settings', dest: { route: 'copy' } });
    else if (v.kind === 'search') trail.push({ label: 'Search', dest: { route: 'home' } });
    return trail;
  }

  function objectLabel(def, objectId) {
    try {
      var vm = def.model(store);
      if (vm && vm.pages && vm.pages[objectId]) return vm.pages[objectId].title;
    } catch (e) { /* fall through */ }
    try {
      var objs = def.objects ? def.objects(store) : [];
      for (var i = 0; i < objs.length; i++) if (objs[i].id === objectId) return objs[i].label;
    } catch (e2) { /* fall through */ }
    return objectId;
  }
  function tabLabel(tab) {
    var words = { overview: 'Overview', accounts: 'Accounts', models: 'Models', limits: 'Limits',
      routing: 'Routing', installs: 'Installation', setup: 'Setup', activity: 'Activity',
      advanced: 'Advanced', server: 'Server', routes: 'Routes', catalog: 'Catalog' };
    return words[tab] || (tab.charAt(0).toUpperCase() + tab.slice(1));
  }

  function parentOf(view) {
    var v = view || ui.view;
    if (v.kind === 'manager' && v.objectId && v.tab) return { dest: { route: 'manager', managerId: v.managerId, objectId: v.objectId }, label: objectLabel(managers().get(v.managerId) || {}, v.objectId) };
    if (v.kind === 'manager' && v.objectId) return { dest: { route: 'manager', managerId: v.managerId }, label: (managers().get(v.managerId) || {}).title || 'Manager' };
    if (v.kind === 'manager') {
      var c = catById(mgrCat(v.managerId));
      return c ? { dest: { route: 'dest', cat: c.id }, label: c.title } : { dest: { route: 'home' }, label: 'Settings Home' };
    }
    if ((v.kind === 'dest' || v.kind === 'setting') && v.sub) {
      var cc = catById(v.cat);
      return { dest: { route: 'dest', cat: v.cat }, label: cc ? cc.title : 'Domain' };
    }
    if (v.kind === 'dest' || v.kind === 'setting' || v.kind === 'all' || v.kind === 'copy' || v.kind === 'search') {
      return { dest: { route: 'home' }, label: 'Settings Home' };
    }
    return null;
  }

  function renderTopbar() {
    if (!els.topbar) return;
    var v = ui.view;
    var trail = crumbTrail();
    var parent = parentOf(v);
    var h = '';
    if (parent && v.kind !== 'home') {
      h += '<button type="button" class="c06-back" data-act="goto" data-goto="' + attrJson(parent.dest) +
           '" title="Back to ' + esc(parent.label) + '">‹ ' + esc(parent.label) + '</button>';
    }
    /* narrow crumb selector replaces the rail */
    h += '<div class="c06-crumbsel"><button type="button" class="c06-crumbsel-btn" data-act="crumbsel" aria-haspopup="menu">' +
         esc(trail[trail.length - 1].label) + '</button></div>';
    h += '<nav class="c06-crumbs" aria-label="Breadcrumb">';
    trail.forEach(function (t, i) {
      if (i > 0) h += '<span class="c06-crumb-sep">›</span>';
      var isLast = i === trail.length - 1;
      h += '<button type="button" class="c06-crumb" data-act="goto" data-goto="' + attrJson(t.dest) + '"' +
           (isLast ? ' aria-current="page"' : '') + '>' + esc(t.label) + '</button>';
    });
    h += '</nav>';
    h += '<span class="c06-top-spacer"></span>';
    if (hasFx('fx.loading-cached')) {
      h += '<span class="c06-refresh-note" role="status">Refreshing — showing cached values</span>';
    }
    h += '<div class="c06-topsearch"><input type="text" id="c06TopSearch" placeholder="Search settings…" ' +
         'aria-label="Search settings" autocomplete="off" spellcheck="false">' +
         '<div class="c06-drop" id="c06DropTop" hidden></div></div>';
    h += '<button type="button" class="c06-close" data-act="close-settings">Close Settings</button>';
    els.topbar.innerHTML = h;
    wireSearchInput(document.getElementById('c06TopSearch'), 'top');
  }

  /* ============================ Home ============================ */

  function renderHome() {
    var rise = mkRise();
    var counts = store.counts();
    var attn = store.attention();
    var notices = arr(store.data.notices);
    var sc = scenario();
    var h = '';

    h += '<header class="' + rise() + '">' +
         '<p class="c06-kicker">Puppet Master · Project · ' + esc(store.data.project.role) + '</p>' +
         '<h1 class="c06-h1">Settings</h1>' +
         '<p class="c06-lede">Everything this project does — how it looks, what its AI may touch, ' +
         'and where the work runs — reads top to bottom from here.</p>' +
         '<hr class="c06-rule-strong"></header>';

    h += '<div class="c06-home-search' + rise() + '">' +
         '<input type="text" id="c06HomeSearch" placeholder="Search settings, providers, models, tools…" ' +
         'aria-label="Search settings" autocomplete="off" spellcheck="false">' +
         '<div class="c06-drop" id="c06DropHome" hidden></div></div>' +
         '<p class="c06-search-hint">Type to search everything — settings, managers, accounts, actions, ' +
         'help. <kbd>Ctrl</kbd>+<kbd>K</kbd> from anywhere.</p>';

    /* at most ONE critical banner, only when the active scenario warrants
       one (scenario mutations push their notice to the front; baseline and
       calm keep Home banner-free — the attention list carries the rest) */
    if (notices.length && sc !== 'baseline' && sc !== 'calm') {
      var n = notices[0];
      h += '<div class="c06-banner' + rise() + '" role="status">' +
           '<span class="pm-status-word" data-tone="' + (n.kind === 'attention' ? 'attention' : 'setup') + '">' + esc(n.statusWord || 'Notice') + '</span>' +
           '<div class="c06-banner-head">' + esc(n.headline) + '</div>' +
           '<p class="c06-banner-body">' + esc(n.consequence || '') + '</p>' +
           (n.target ? '<button type="button" class="c06-banner-act" data-act="goto" data-goto="' +
             attrJson({ route: 'dest', cat: n.target.cat, sub: n.target.sub || null }) + '">' +
             esc((n.primary && n.primary.label) || 'Review') + '</button>' : '') +
           '</div>';
    }

    /* compact attention list (2-4 baseline) */
    h += '<section class="c06-attn c06-section' + rise() + '">';
    h += '<div class="c06-headrule"><h2 class="c06-h2">Needs attention' +
         (attn.length ? ' <span class="c06-count">' + attn.length + '</span>' : '') + '</h2></div>';
    if (!attn.length) {
      h += '<div class="c06-empty">' + (sc === 'first-run'
        ? '<strong>Nothing is set up yet.</strong> Connect an AI provider first — the rest of Settings can wait until you need it.'
        : '<strong>All quiet.</strong> Nothing needs your attention right now.') + '</div>';
    } else {
      attn.slice(0, 6).forEach(function (a) {
        h += '<button type="button" class="c06-attn-item' + rise() + '" data-act="goto" data-goto="' + attrJson(a.dest) + '">' +
             '<span class="c06-attn-line"><span class="pm-status-word" data-tone="attention">' + esc(a.statusWord) + '</span>' +
             '<span class="c06-attn-head">' + esc(a.headline) + '</span></span>' +
             '<span class="c06-attn-why">' + esc(a.consequence) + '</span></button>';
      });
    }
    h += '</section>';

    /* the twelve destinations: dominant content */
    h += '<section class="c06-dests c06-section">';
    h += '<div class="c06-headrule"><h2 class="c06-h2">Browse Settings <span class="c06-count">' +
         counts.total + ' settings in 12 domains</span></h2></div>';
    arr(counts.byCategory).forEach(function (c, i) {
      var mgrs = managers().byCat(c.id);
      var facts = c.total + ' settings';
      if (mgrs.length) facts += ' · ' + mgrs.length + (mgrs.length === 1 ? ' manager' : ' managers');
      if (c.changed) facts += ' · ' + c.changed + ' changed';
      h += '<button type="button" class="c06-dest' + rise() + '" data-act="goto" data-goto="' +
           attrJson({ route: 'dest', cat: c.id }) + '">' +
           '<span class="c06-dest-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
           '<span class="c06-dest-title">' + esc(c.title) + '</span>' +
           '<span class="c06-dest-count">' + esc(facts) + '</span>' +
           '<span class="c06-dest-desc">' + esc(c.desc) + '</span></button>';
    });
    h += '</section>';

    /* secondary utilities: quiet inline links + recent changes */
    var recents = sc === 'first-run' ? [] : store.recents();
    h += '<section class="c06-utils c06-section">';
    h += '<div class="c06-utils-line">' +
         '<button type="button" class="c06-util-link" data-act="goto" data-goto="' + attrJson({ route: 'all' }) + '">All Settings — the complete index (' + counts.total + ')</button>' +
         '<span class="c06-util-dot">·</span>' +
         '<button type="button" class="c06-util-link" data-act="goto" data-goto="' + attrJson({ route: 'copy' }) + '">Copy settings from another project</button>' +
         '</div>';
    if (!recents.length) {
      h += '<p class="c06-factline">No changes yet — every setting is at its default.</p>';
    } else {
      h += '<ul class="c06-recents">';
      recents.slice(0, 5).forEach(function (r) {
        h += '<li><button type="button" class="c06-recent-link" data-act="goto" data-goto="' +
             attrJson({ route: 'setting', settingId: r.settingId }) + '"><strong>' + esc(r.label) + '</strong> — ' +
             esc(r.fromLabel || 'unset') + ' → ' + esc(r.toLabel) + ' · ' + esc(fmtWhen(r.when)) +
             (r.note ? ' · ' + esc(r.note) : '') + '</button></li>';
      });
      h += '</ul>';
    }
    h += '</section>';

    els.article.innerHTML = h;
    wireSearchInput(document.getElementById('c06HomeSearch'), 'home');
    window.PMShell.status('Settings Home — ' + counts.total + ' settings · ' + counts.changed + ' changed');
  }

  /* search surface = Home with the query prefilled and the dropdown open */
  function openSearchSurface(query) {
    if (ui.view.kind !== 'search') return;
    var input = document.getElementById('c06HomeSearch');
    if (!input) return;
    input.value = query;
    ui.search.query = query;
    ui.search.anchor = 'home';
    runSearch(query, 'home');
    try { input.focus({ preventScroll: true }); } catch (e) { /* ok */ }
  }

  /* ============================ universal search ============================ */

  var searchDebounce = 0;
  function wireSearchInput(input, anchor) {
    if (!input) return;
    if (anchor === 'home' && ui.search.query && (ui.view.kind === 'search')) input.value = ui.search.query;
    input.addEventListener('input', function () {
      var q = input.value;
      if (searchDebounce) window.clearTimeout(searchDebounce);
      searchDebounce = window.setTimeout(function () {
        searchDebounce = 0;
        onSearchTyped(q, anchor);
      }, 110);
    });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        if (dropOpen()) { closeDropdown(); }
        else { input.blur(); }
        return;
      }
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        if (!dropOpen()) return;
        ev.preventDefault();
        moveActive(ev.key === 'ArrowDown' ? 1 : -1);
        return;
      }
      if (ev.key === 'Enter') {
        if (!dropOpen()) return;
        ev.preventDefault();
        var btns = activeDrop().querySelectorAll('.c06-result');
        var idx = ui.search.active >= 0 ? ui.search.active : 0;
        if (btns[idx]) btns[idx].click();
      }
    });
  }

  function onSearchTyped(q, anchor) {
    ui.search.anchor = anchor;
    var trimmed = str(q).trim();
    if (!trimmed) {
      ui.search.query = '';
      closeDropdown();
      return;
    }
    var wasSearchRoute = ui.view.kind === 'search';
    ui.search.query = q;
    runSearch(q, anchor);
    /* search state rides in the route: first keystroke pushes one entry,
       further typing replaces it, so Back restores query AND results. */
    window.PM2.route.go({ route: 'search', query: trimmed }, { silent: true, replace: wasSearchRoute });
    ui.view.kind = 'search';
    ui.view.query = trimmed;
  }

  function activeDrop() {
    return ui.search.anchor === 'home'
      ? document.getElementById('c06DropHome')
      : document.getElementById('c06DropTop');
  }
  function dropOpen() {
    var d = activeDrop();
    return !!(d && !d.hidden);
  }
  function closeDropdown() {
    ['c06DropHome', 'c06DropTop'].forEach(function (id) {
      var d = document.getElementById(id);
      if (d) d.hidden = true;
    });
    ui.search.open = false;
    ui.search.active = -1;
  }

  function runSearch(q, anchor) {
    ui.search.anchor = anchor || ui.search.anchor;
    var out = window.PM2.search.query(q, { limit: 40 });
    ui.search.res = out;
    ui.search.active = -1;
    var drop = activeDrop();
    if (!drop) return;
    var other = ui.search.anchor === 'home' ? document.getElementById('c06DropTop') : document.getElementById('c06DropHome');
    if (other) other.hidden = true;
    drop.innerHTML = dropHtml(out);
    drop.hidden = false;
    ui.search.open = true;
  }

  function dropHtml(out) {
    if (!out || !out.total) {
      return '<div class="c06-drop-empty"><strong>No matches for “' + esc(out ? out.query : '') + '”.</strong>' +
        '<p>Nothing in settings, managers, accounts, actions, or help mentions it. ' +
        'Try a different word — “notifications”, “theme”, “API key” — or browse the twelve domains below; ' +
        'every setting is reachable from Home.</p></div>';
    }
    var h = '<div class="c06-drop-meta">' + out.total + (out.total === 1 ? ' result' : ' results') +
            ' for “' + esc(out.query) + '”</div>';
    arr(out.groups).forEach(function (g) {
      h += '<div class="c06-drop-group"><div class="c06-drop-group-head">' + esc(g.label) + '</div>';
      arr(g.results).forEach(function (r) {
        h += '<button type="button" class="c06-result" data-rid="' + esc(r.rid) + '" data-act="result" ' +
             'data-goto="' + attrJson(r.dest) + '">' +
             '<span class="c06-result-top"><span class="c06-result-label">' + esc(r.label) + '</span>' +
             (r.sub ? '<span class="c06-result-sub">' + esc(r.sub) + '</span>' : '') + '</span>' +
             '<span class="c06-result-path">' + esc(arr(r.path).join(' › ')) + '</span>' +
             (r.availability ? '<span class="c06-result-avail">' + esc(str(r.availability)) + '</span>' : '') +
             '</button>';
      });
      h += '</div>';
    });
    return h;
  }

  function moveActive(delta) {
    var drop = activeDrop();
    if (!drop) return;
    var btns = drop.querySelectorAll('.c06-result');
    if (!btns.length) return;
    var next = ui.search.active + delta;
    if (next < 0) next = btns.length - 1;
    if (next >= btns.length) next = 0;
    for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('is-active', i === next);
    ui.search.active = next;
    btns[next].scrollIntoView({ block: 'nearest' });
  }

  /* ============================ domain pages ============================ */

  function renderDest(catId, subId) {
    var rise = mkRise();
    var c = catById(catId);
    if (!c) { renderHome(); return; }
    var counts = store.counts();
    var cc = null;
    arr(counts.byCategory).forEach(function (x) { if (x.id === catId) cc = x; });
    var mgrs = managers().byCat(catId);
    var demonstrated = mgrs.filter(function (m) { return m.status === 'demonstrated'; });
    var deferred = mgrs.filter(function (m) { return m.status === 'deferred_named_owner'; });

    var h = '';
    h += '<header class="' + rise() + '">' +
         '<p class="c06-kicker">Settings · ' + esc(store.data.project.name) + '</p>' +
         '<h1 class="c06-h1">' + esc(c.title) + '</h1>' +
         '<p class="c06-lede">' + esc(c.desc) + '</p>' +
         '<p class="c06-factline">' + (cc ? cc.total + ' settings · ' + cc.changed + ' changed from default' : '') + '</p>' +
         '<hr class="c06-rule-strong"></header>';

    if (demonstrated.length || deferred.length) {
      h += '<section class="c06-managers c06-section' + '">' +
           '<div class="c06-headrule"><h2 class="c06-h2">In this domain <span class="c06-count">' +
           (demonstrated.length + deferred.length) + (demonstrated.length + deferred.length === 1 ? ' manager' : ' managers') + '</span></h2></div>';
      demonstrated.forEach(function (m) {
        h += '<button type="button" class="c06-manager-row' + rise() + '" data-manager="' + esc(m.id) + '" data-act="goto" data-goto="' +
             attrJson({ route: 'manager', managerId: m.id }) + '">' +
             '<span class="c06-manager-title">' + esc(m.title) + '</span>' +
             '<span class="c06-manager-blurb">' + esc(m.blurb || '') + '</span></button>';
      });
      if (deferred.length) {
        h += '<div class="c06-group-head">Reserved destinations — owner modules</div>';
        deferred.forEach(function (m) {
          h += '<button type="button" class="c06-manager-row" data-manager="' + esc(m.id) + '" data-act="goto" data-goto="' +
               attrJson({ route: 'manager', managerId: m.id }) + '">' +
               '<span class="c06-manager-title">' + esc(m.title) + '</span>' +
               '<span class="c06-manager-blurb">' + esc(m.blurb || '') + '</span>' +
               '<span class="c06-manager-kind">read-only shell</span></button>';
        });
      }
      h += '</section>';
    }

    arr(c.subgroups).forEach(function (sg) {
      h += subgroupHtml(catId, sg, rise);
    });

    els.article.innerHTML = h;
    window.PMShell.status(c.title + ' — ' + (cc ? cc.total : '') + ' settings');
    wireRowInputs();

    if (subId) {
      var sec = els.article.querySelector('[data-section="' + cssEscape(subId) + '"]');
      if (sec) {
        try { sec.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (e) { sec.scrollIntoView(); }
      }
    }
  }

  /* Groups of ~4-8 rows before the next device: essentials run first, the
     rest of the simple tier behind a "More" fold, advanced behind its own. */
  function subgroupHtml(catId, sg, rise) {
    var rows = store.rowsFor(catId, sg.id);
    var normal = rows.filter(function (r) { return r.tier !== 'advanced'; });
    var advanced = rows.filter(function (r) { return r.tier === 'advanced'; });
    var lead = normal.slice(0, 7);
    var more = normal.slice(7);
    var moreKey = catId + '/' + sg.id + '/more';
    var advKey = catId + '/' + sg.id + '/adv';

    var h = '<section class="c06-sub c06-section" data-section="' + esc(sg.id) + '">';
    h += '<div class="c06-headrule"><h2 class="c06-h2">' + esc(sg.title) +
         ' <span class="c06-count">' + rows.length + '</span></h2></div>';
    if (sg.desc) h += '<p class="c06-sub-desc">' + esc(sg.desc) + '</p>';
    lead.forEach(function (r) { h += rowHtml(r, rise ? rise() : ''); });
    if (more.length) h += foldHtml(moreKey, 'More ' + sg.title.toLowerCase(), more.length,
      more.map(function (r) { return rowHtml(r, ''); }).join(''));
    if (advanced.length) h += foldHtml(advKey, 'Advanced', advanced.length,
      advanced.map(function (r) { return rowHtml(r, ''); }).join(''));
    /* read-only extension-dataset row (deep-link probe workaround) */
    if (ui.view.extSetting) {
      var ext = obj(store.data.settings)[ui.view.extSetting];
      if (ext && ui.view.extSetting.indexOf(catId + '.' + sg.id + '.') === 0) {
        h += rowHtml({
          id: ext.id, label: ext.label, desc: ext.desc,
          control: { type: 'ext' }, value: ext.value,
          valueLabel: String(ext.value == null ? '—' : ext.value),
          changedFromDefault: ext.valueSource === 'custom',
          badges: [], chips: [],
          state: 'normal', tier: 'simple',
          stateNote: 'Served by the shared demo extension dataset, outside the 828-row inventory. Shown read-only here.',
          detail: { legacyScopeNote: 'Extension dataset record.', related: [], searchTerms: arr(ext.search) }
        }, '');
      }
    }
    h += '</section>';
    return h;
  }

  function foldHtml(key, label, count, bodyHtml) {
    var isOpen = !!ui.folds[key];
    return '<div class="c06-fold">' +
      '<button type="button" class="c06-fold-btn" data-act="fold" data-fold="' + esc(key) + '" aria-expanded="' + isOpen + '">' +
      '<span class="c06-fold-mark">' + (isOpen ? '−' : '+') + '</span>' +
      '<span>' + esc(label) + '</span>' +
      '<span class="c06-fold-count">' + count + (count === 1 ? ' setting' : ' settings') + '</span></button>' +
      '<div class="c06-fold-body" data-fold-body="' + esc(key) + '"' + (isOpen ? '' : ' hidden') + '>' + bodyHtml + '</div>' +
      '</div>';
  }

  /* ---------------- inventory rows ---------------- */

  function rowHtml(r, riseAttr) {
    var h = '<div class="c06-row' + (riseAttr || '') + '" data-setting-id="' + esc(r.id) + '" tabindex="-1">';
    h += '<div class="c06-row-title">' + esc(r.label) + '</div>';
    h += '<div class="c06-row-desc">' + esc(r.desc) + '</div>';
    var showsValue = !!VALUE_CONTROLS[r.control.type] && r.state !== 'managed' && r.state !== 'unavailable';
    h += '<div class="c06-row-side">' + controlHtml(r) +
         '<div class="c06-row-chips">' + chipsHtml(r, showsValue) + '</div></div>';
    if (r.stateNote) {
      h += '<div class="c06-row-note"' + (r.state === 'error' ? ' data-tone="error"' : '') + '>' + esc(r.stateNote) + '</div>';
    }
    var err = ui.rowError[r.id];
    h += '<div class="c06-error-line" role="alert" data-errline="' + esc(r.id) + '"' + (err ? '' : ' hidden') + '>' + esc(err || '') + '</div>';
    h += '<div class="c06-row-foot"><button type="button" class="c06-quiet-link" data-act="row-detail" data-id="' +
         esc(r.id) + '">' + (ui.rowDetail[r.id] ? 'Hide details' : 'Details') + '</button></div>';
    if (ui.rowDetail[r.id]) h += rowDetailHtml(r);
    h += '</div>';
    return h;
  }

  /* controlShowsValue: the inline control already displays the value, so a
     'default' chip would just repeat it and a 'custom' chip compresses to
     the one-word signal. Index rows (no control) keep the full chip. */
  function chipsHtml(r, controlShowsValue) {
    return arr(r.chips).map(function (ch) {
      if (controlShowsValue && ch.kind === 'default') return '';
      var label = (controlShowsValue && ch.kind === 'custom') ? 'Changed' : ch.label;
      return '<span class="pm-chip-value" data-kind="' + esc(ch.kind) + '">' + esc(label) + '</span>';
    }).join('');
  }
  var VALUE_CONTROLS = { toggle: 1, select: 1, radio: 1, multiselect: 1, number: 1, slider: 1, text: 1, path: 1, action: 1 };

  function rowDetailHtml(r) {
    var h = '<div class="c06-row-detail"><dl>';
    h += '<dt>Why this value?</dt><dd>' +
         (r.changedFromDefault ? 'You changed it in this project.' : 'This is the shipped default.') +
         (r.recommended !== undefined ? ' Recommended: ' + esc(String(r.recommended)) + '.' : '') + '</dd>';
    if (r.state !== 'normal' && r.stateNote) h += '<dt>Current state</dt><dd>' + esc(r.stateNote) + '</dd>';
    h += '<dt>Scope</dt><dd>' + esc(r.detail.legacyScopeNote) + '</dd>';
    if (arr(r.detail.related).length) {
      h += '<dt>Related</dt><dd>' + esc(r.detail.related.join(' · ')) + '</dd>';
    }
    var v = r.value;
    if (Array.isArray(v) && v.length) {
      h += '<dt>Current entries</dt><dd><ul>' + v.slice(0, 12).map(function (x) {
        return '<li>' + esc(typeof x === 'object' ? JSON.stringify(x) : String(x)) + '</li>';
      }).join('') + (v.length > 12 ? '<li>… and ' + (v.length - 12) + ' more</li>' : '') + '</ul></dd>';
    } else if (v && typeof v === 'object') {
      var keys = Object.keys(v);
      h += '<dt>Current entries</dt><dd><ul>' + keys.slice(0, 12).map(function (k) {
        return '<li>' + esc(k) + ' — ' + esc(String(v[k])) + '</li>';
      }).join('') + (keys.length > 12 ? '<li>… and ' + (keys.length - 12) + ' more</li>' : '') + '</ul></dd>';
    }
    h += '</dl></div>';
    return h;
  }

  function controlHtml(r) {
    var t = r.control.type;
    var locked = r.state === 'managed' || r.state === 'unavailable';
    var dis = locked ? ' disabled' : '';
    if (t === 'toggle') {
      return '<button type="button" class="c06-toggle" role="switch" aria-checked="' + (r.value === true) +
             '" aria-label="' + esc(r.label) + '" data-act="toggle" data-id="' + esc(r.id) + '"' + dis + '></button>';
    }
    if (t === 'select' || t === 'radio') {
      return '<button type="button" class="c06-selectbtn" data-act="select" data-id="' + esc(r.id) +
             '" aria-haspopup="menu" aria-label="' + esc(r.label) + '"' + dis + '>' +
             esc(r.valueLabel || 'Choose…') + '</button>';
    }
    if (t === 'multiselect') {
      return '<button type="button" class="c06-selectbtn" data-act="multiselect" data-id="' + esc(r.id) +
             '" aria-haspopup="menu" aria-label="' + esc(r.label) + '"' + dis + '>' +
             esc(r.valueLabel || 'Choose…') + '</button>';
    }
    if (t === 'number' || (t === 'slider' && typeof r.value !== 'number')) {
      return '<input class="c06-input" type="text" inputmode="numeric" value="' + esc(r.valueLabel) +
             '" data-input-id="' + esc(r.id) + '" data-input-kind="number" aria-label="' + esc(r.label) + '"' + dis + '>';
    }
    if (t === 'slider') {
      var min = (r.control.min != null) ? r.control.min : 0;
      var max = (r.control.max != null) ? r.control.max : 100;
      var stepAttr = (max - min) <= 1 ? ' step="0.05"' : ' step="1"';
      return '<input class="c06-range" type="range" min="' + min + '" max="' + max + '"' + stepAttr +
             ' value="' + esc(String(r.value)) + '" data-input-id="' + esc(r.id) +
             '" data-input-kind="slider" aria-label="' + esc(r.label) + '"' + dis + '>';
    }
    if (t === 'text' || t === 'path') {
      return '<input class="c06-input is-wide" type="text" value="' + esc(r.value == null ? '' : String(r.value)) +
             '" data-input-id="' + esc(r.id) + '" data-input-kind="text" aria-label="' + esc(r.label) + '"' + dis + '>';
    }
    if (t === 'action') {
      return '<button type="button" class="c06-actbtn" data-act="setting-action" data-id="' + esc(r.id) + '"' + dis + '>' +
             esc(r.valueLabel || 'Open') + '</button>';
    }
    /* list / keyvalue: summary only; entries live in Details (read-only) */
    return '<span class="pm-chip-value" data-kind="' + (r.changedFromDefault ? 'custom' : 'default') + '">' +
           esc(r.valueLabel || '—') + '</span>';
  }

  function wireRowInputs() {
    var inputs = els.article.querySelectorAll('[data-input-id]');
    for (var i = 0; i < inputs.length; i++) wireOneInput(inputs[i]);
  }
  function wireOneInput(input) {
    var id = input.getAttribute('data-input-id');
    var kind = input.getAttribute('data-input-kind');
    function commit() {
      var raw = input.value;
      var val;
      if (kind === 'number' || kind === 'slider') {
        var n = Number(String(raw).replace(/,/g, ''));
        val = isFinite(n) && String(raw).trim() !== '' ? n : raw;
      } else val = raw;
      var res = store.setValue(id, val, { source: 'settings' });
      if (res.ok) {
        delete ui.rowError[id];
        input.removeAttribute('data-invalid');
      } else {
        input.setAttribute('data-invalid', '1');
      }
    }
    if (kind === 'slider') {
      input.addEventListener('change', commit);
    } else {
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
        if (ev.key === 'Escape') {
          ev.stopPropagation();
          var row = store.resolveRow(id);
          input.value = row ? (kind === 'text' ? (row.value == null ? '' : String(row.value)) : row.valueLabel) : '';
          input.removeAttribute('data-invalid');
          var line = els.article.querySelector('[data-errline="' + cssEscape(id) + '"]');
          if (line) line.hidden = true;
          delete ui.rowError[id];
        }
      });
      input.addEventListener('blur', function () {
        var row = store.resolveRow(id);
        var current = row ? (kind === 'text' ? (row.value == null ? '' : String(row.value)) : row.valueLabel) : '';
        if (input.value !== current) commit();
      });
    }
  }

  /* ============================ popup menu (PM family) ============================ */

  function openMenu(invoker, items, opts) {
    closeMenu();
    var o = obj(opts);
    var menu = document.createElement('div');
    menu.className = 'c06-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = items.map(function (it, i) {
      return '<button type="button" class="c06-menu-item" role="menuitemradio" aria-checked="' + !!it.checked +
        '" data-mi="' + i + '"><span>' + esc(it.label) + '</span>' +
        (it.sub ? '<span class="c06-result-sub">' + esc(it.sub) + '</span>' : '') +
        '<span class="c06-menu-mark"><i data-ico="check"></i></span></button>';
    }).join('');
    document.body.appendChild(menu);
    try { window.PMIcons.hydrate(menu); } catch (e) { /* decorative */ }

    /* anchor + collision flip near edges */
    var r = invoker.getBoundingClientRect();
    var mw = menu.offsetWidth, mh = menu.offsetHeight;
    var left = Math.min(r.left, window.innerWidth - mw - 8);
    var top = r.bottom + 4;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
    menu.style.left = Math.max(8, left) + 'px';
    menu.style.top = top + 'px';

    function close(refocus) {
      if (menu.parentNode) menu.parentNode.removeChild(menu);
      document.removeEventListener('mousedown', outside, true);
      menuState = null;
      if (refocus) { try { invoker.focus(); } catch (e) { /* ok */ } }
    }
    function outside(ev) {
      if (!menu.contains(ev.target)) close(false);
    }
    document.addEventListener('mousedown', outside, true);
    menu.addEventListener('keydown', function (ev) {
      var btns = menu.querySelectorAll('.c06-menu-item');
      var cur = -1;
      for (var i = 0; i < btns.length; i++) if (btns[i] === document.activeElement) cur = i;
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); close(true); }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); btns[(cur + 1) % btns.length].focus(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); btns[cur <= 0 ? btns.length - 1 : cur - 1].focus(); }
    });
    menu.addEventListener('click', function (ev) {
      var b = ev.target.closest('.c06-menu-item');
      if (!b) return;
      var idx = Number(b.getAttribute('data-mi'));
      var item = items[idx];
      if (o.multi) {
        item.checked = !item.checked;
        b.setAttribute('aria-checked', String(item.checked));
        if (o.onToggle) o.onToggle(item, items);
      } else {
        close(true);
        if (o.onPick) o.onPick(item);
      }
    });
    var first = menu.querySelector('[aria-checked="true"]') || menu.querySelector('.c06-menu-item');
    if (first) first.focus();
    menuState = { el: menu, close: close };
  }
  function closeMenu() {
    if (menuState) menuState.close(false);
  }

  /* ============================ managers ============================ */

  function renderManager(id, objectId, tab) {
    var rise = mkRise();
    var def = managers().get(id);
    if (!def) { renderHome(); return; }
    var c = catById(def.cat);
    var h = '';

    if (def.status === 'deferred_named_owner') {
      h += managerShellHtml(def, rise);
      els.article.innerHTML = h;
      window.PMShell.status(def.title + ' — reserved destination');
      return;
    }

    var vm = null;
    try { vm = def.model(store); } catch (e) { vm = null; }
    if (!vm) {
      els.article.innerHTML = '<header><h1 class="c06-h1">' + esc(def.title) + '</h1>' +
        '<p class="c06-lede">This manager could not build its view model.</p></header>';
      return;
    }

    h += '<header class="' + rise() + '">' +
         '<p class="c06-kicker">' + esc(c ? c.title : 'Settings') + ' · ' + esc(store.data.project.name) + '</p>' +
         '<h1 class="c06-h1">' + esc(vm.title || def.title) + '</h1>' +
         '<p class="c06-lede">' + esc(vm.blurb || def.blurb || '') + '</p>' +
         '<hr class="c06-rule-strong"></header>';

    /* actions: quiet inline links with honest availability */
    var actions = [];
    try { actions = def.actions ? def.actions(store) : []; } catch (e) { actions = []; }
    if (actions.length) {
      h += '<div class="c06-actions' + rise() + '">';
      actions.forEach(function (a) {
        if (a.available === false) {
          h += '<span><button type="button" class="c06-action-link" disabled>' + esc(a.label) + '</button>' +
               (a.reason ? ' <span class="c06-action-reason">' + esc(a.reason) + '</span>' : '') + '</span>';
        } else {
          h += '<button type="button" class="c06-action-link" data-act="mgr-action" data-mgr="' + esc(def.id) +
               '" data-action-id="' + esc(a.id) + '">' + esc(a.label) + '</button>';
        }
      });
      h += '</div>';
      h += '<div class="c06-opline" data-opline hidden></div>';
    }

    /* in-flow detail sheet for a selected object with a real page */
    var page = (vm.pages && objectId) ? vm.pages[objectId] : null;
    if (page) {
      h += sheetHtml(def, vm, objectId, page, tab);
    }

    arr(vm.sections).forEach(function (sec) {
      h += sectionHtml(sec, { managerId: def.id, selectedObject: page ? null : objectId, rise: rise });
    });

    els.article.innerHTML = h;
    wireRowInputs();
    window.PMShell.status(vm.title || def.title);
  }

  function managerShellHtml(def, rise) {
    var vm = null;
    try { vm = def.model(store); } catch (e) { vm = null; }
    var ic = obj(def.insertionContract);
    var h = '<header class="' + rise() + '">' +
      '<p class="c06-kicker">Reserved destination · ' + esc(store.data.project.name) + '</p>' +
      '<h1 class="c06-h1">' + esc(def.title) + '</h1>' +
      '<p class="c06-lede">' + esc(def.blurb || '') + '</p>' +
      '<hr class="c06-rule-strong"></header>';
    h += '<div class="c06-shell-note' + rise() + '">' +
      '<strong>Read-only insertion shell.</strong> ' + esc(vm && vm.summary ? vm.summary : 'The owner module inserts here.') +
      '<dl><dt>Canonical owner</dt><dd>' + esc(def.owner || '—') + '</dd>' +
      '<dt>Deep link</dt><dd>' + esc(ic.deepLink || ('manager/' + def.id)) + '</dd>' +
      (arr(ic.reachableFrom).length ? '<dt>Reachable from</dt><dd>' + esc(ic.reachableFrom.join(' · ')) + '</dd>' : '') +
      '<dt>Return contract</dt><dd>' + esc(ic.returnContract || '—') + '</dd></dl></div>';
    if (vm) {
      arr(vm.sections).forEach(function (sec) {
        h += sectionHtml(sec, { managerId: def.id, rise: rise });
      });
    }
    return h;
  }

  /* restrained detail sheet, in-flow (pushes the roster down) */
  function sheetHtml(def, vm, objectId, page, tab) {
    var tabs = arr(page.tabs);
    var active = tab && tabs.indexOf(tab) >= 0 ? tab : (tabs[0] || null);
    var h = '<div class="c06-sheet" data-object-id="' + esc(objectId) + '" tabindex="-1">';
    h += '<div class="c06-sheet-head"><span class="c06-sheet-title">' + esc(page.title) + '</span>';
    if (page.status) {
      h += '<span class="pm-status-word" data-tone="' + esc(page.status.tone || 'ok') + '">' + esc(page.status.label) + '</span>';
    }
    h += '<button type="button" class="c06-sheet-close" data-act="goto" data-goto="' +
         attrJson({ route: 'manager', managerId: def.id }) + '" aria-label="Close detail">Close ×</button></div>';
    if (tabs.length > 1) {
      h += '<div class="c06-tabs" role="tablist">';
      tabs.forEach(function (t) {
        h += '<button type="button" class="c06-tab" role="tab" data-tab="' + esc(t) + '" aria-selected="' + (t === active) +
             '" data-act="goto" data-goto="' + attrJson({ route: 'manager', managerId: def.id, objectId: objectId, tab: t }) + '">' +
             esc(tabLabel(t)) + '</button>';
      });
      h += '</div>';
    }
    var sec = page.sections ? page.sections[active] : null;
    if (sec) h += sectionHtml(sec, { managerId: def.id, inSheet: true });
    h += '</div>';
    return h;
  }

  /* ---------------- generic section renderer ----------------
     Tolerant of every view-model shape the shared registry produces:
     overview / roster / form / table / steps / log / health / preview
     plus unknown kinds via the fallback line renderer. */

  function sectionHtml(sec, ctx) {
    if (!sec) return '';
    var c = obj(ctx);
    var riseAttr = c.rise ? c.rise() : '';
    var h = '<section class="c06-section' + riseAttr + '" data-section="' + esc(sec.id || '') + '">';
    if (sec.title) {
      h += '<div class="c06-headrule"><h3 class="c06-h3">' + esc(sec.title) +
           (sec.advanced ? ' <span class="c06-count">advanced</span>' : '') + '</h3></div>';
    }
    if (sec.note) h += '<p class="c06-section-note">' + esc(sec.note) + '</p>';
    if (sec.loading && sec.loading.note) h += '<p class="c06-section-note" role="status"><em>' + esc(sec.loading.note) + '</em></p>';

    var kind = str(sec.kind);
    if (kind === 'table') h += tableHtml(sec);
    else if (kind === 'steps') h += stepsHtml(sec);
    else if (kind === 'log') h += logHtml(sec);
    else if (kind === 'preview') h += previewHtml(sec);
    else h += linesHtml(sec, c);

    if (arr(sec.whatNext).length) {
      h += '<p class="c06-section-note"><strong>When included usage ends, in order:</strong></p><ol class="c06-steps">';
      arr(sec.whatNext).forEach(function (s) {
        h += '<li><span class="c06-step-label">' + esc(s.label) + '</span></li>';
      });
      h += '</ol>';
    }
    if (sec.boundary && sec.boundary.label) {
      h += '<p class="c06-section-note">Sign-in ownership: ' + esc(sec.boundary.label) + '</p>';
    }
    if (sec.emptyNote && !arr(sec.items).length && !arr(sec.rows).length && !arr(sec.entries).length) {
      h += '<div class="c06-empty">' + esc(sec.emptyNote) + '</div>';
    }
    h += '</section>';
    return h;
  }

  function linesHtml(sec, ctx) {
    var h = '';
    var groups = arr(sec.groups);
    if (groups.length) {
      groups.forEach(function (g) {
        h += '<div class="c06-group-head">' + esc(g.label || '') + '</div>';
        arr(g.items).forEach(function (it) { h += entryHtml(it, ctx); });
      });
      return h;
    }
    var fields = arr(sec.fields);
    if (fields.length) {
      h += '<div class="c06-kv">';
      fields.forEach(function (f) { h += kvLineHtml(f); });
      h += '</div>';
      return h;
    }
    var list = arr(sec.items).length ? arr(sec.items) : arr(sec.rows);
    if (list.length) {
      /* rows/items: entry treatment when they look like resources, kv otherwise */
      var resourceLike = list.some(function (it) { return it && (it.status || it.state || it.sub || it.kind); });
      if (resourceLike && sec.kind !== 'overview') {
        list.forEach(function (it) { h += entryHtml(it, ctx); });
      } else {
        h += '<div class="c06-kv">';
        list.forEach(function (it) { h += kvLineHtml(it); });
        h += '</div>';
      }
    }
    arr(sec.sources).forEach(function (s) { h += entryHtml(s, ctx); });
    if (sec.hashes && arr(sec.hashes.rows).length) {
      h += '<div class="c06-mono">' + arr(sec.hashes.rows).map(function (r) {
        var cells = obj(r.cells);
        return esc((cells.source || '') + '  ' + (cells.hash || ''));
      }).join('\n') + '</div>';
    }
    return h;
  }

  function toneOf(it) {
    if (it.status && it.status.tone) return it.status.tone;
    var st = str(it.state);
    if (st === 'error' || st === 'unavailable') return 'attention';
    if (st === 'warning') return 'setup';
    return 'ok';
  }
  function statusWordOf(it) {
    if (it.status && it.status.label) return it.status.label;
    var st = str(it.state);
    if (st && st !== 'normal') return st.replace(/-/g, ' ');
    return '';
  }

  function entryHtml(it, ctx) {
    if (!it) return '';
    var c = obj(ctx);
    var click = !!it.dest;
    var selected = c.selectedObject && it.id === c.selectedObject;
    var word = statusWordOf(it);
    var h = '<div class="c06-entry' + (click ? ' is-click' : '') + (selected ? ' is-selected' : '') +
            '" data-object-id="' + esc(it.id || '') + '" data-item-id="' + esc(it.id || '') + '"' +
            (click ? ' data-act="goto" data-goto="' + attrJson(it.dest) + '" role="button" tabindex="0"' : ' tabindex="-1"') + '>';
    h += '<div class="c06-entry-line"><span class="c06-entry-title">' + esc(it.label || it.id || '') + '</span>';
    if (it.sub) h += '<span class="c06-entry-sub">' + esc(str(it.sub)) + '</span>';
    if (word) h += '<span class="pm-status-word" data-tone="' + esc(toneOf(it)) + '">' + esc(word) + '</span>';
    h += '</div>';
    var note = (it.status && it.status.note) || it.note || null;
    if (note) h += '<div class="c06-entry-note">' + esc(str(note)) + '</div>';
    if (it.shadowNote) h += '<div class="c06-entry-note"><em>' + esc(it.shadowNote) + '</em></div>';
    if (it.manualOnlyReason) h += '<div class="c06-entry-note"><em>' + esc(it.manualOnlyReason) + '</em></div>';
    if (selected) h += entryDetailHtml(it);
    h += '</div>';
    return h;
  }

  /* restrained in-flow detail for a selected roster item without a page */
  function entryDetailHtml(it) {
    var h = '<div class="c06-row-detail"><dl>';
    var meta = obj(it.meta);
    Object.keys(meta).forEach(function (k) {
      var v = meta[k];
      if (v == null) return;
      h += '<dt>' + esc(humanKey(k)) + '</dt><dd>' + esc(scalar(v)) + '</dd>';
    });
    var det = obj(it.detail);
    Object.keys(det).forEach(function (k) {
      var v = det[k];
      if (v == null) return;
      h += '<dt>' + esc(humanKey(k)) + '</dt><dd>' + esc(scalar(v)) + '</dd>';
    });
    h += '</dl></div>';
    return h;
  }
  function humanKey(k) {
    return String(k).replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ')
      .toLowerCase().replace(/^./, function (m) { return m.toUpperCase(); });
  }
  function scalar(v) {
    if (v == null) return '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    if (Array.isArray(v)) {
      return v.slice(0, 6).map(function (x) { return typeof x === 'object' ? JSON.stringify(x) : String(x); }).join(' · ') +
        (v.length > 6 ? ' · …' : '');
    }
    if (typeof v === 'object') {
      try { return JSON.stringify(v).slice(0, 220); } catch (e) { return '[object]'; }
    }
    return String(v);
  }

  function kvLineHtml(f) {
    if (!f) return '';
    var val = f.valueLabel != null ? f.valueLabel : (f.value != null ? scalar(f.value) : '—');
    var h = '<div class="c06-kv-line" data-item-id="' + esc(f.id || '') + '"' +
            (f.settingId ? ' data-setting-id="' + esc(f.settingId) + '"' : '') + ' tabindex="-1">';
    if (f.dest) {
      h += '<button type="button" class="c06-kv-link c06-kv-label" data-act="goto" data-goto="' + attrJson(f.dest) + '">' +
           esc(f.label || f.id || '') + '</button>';
    } else {
      h += '<span class="c06-kv-label">' + esc(f.label || f.id || '') + '</span>';
    }
    h += '<span class="c06-kv-value">' + esc(str(val) || scalar(val)) + '</span>';
    var note = f.note || null;
    if (note) h += '<span class="c06-kv-note">' + esc(str(note)) + '</span>';
    h += '</div>';
    return h;
  }

  function tableHtml(sec) {
    var cols = arr(sec.columns).map(function (col) {
      return typeof col === 'string' ? { id: null, label: col } : col;
    });
    var rows = arr(sec.rows).length ? arr(sec.rows) : arr(sec.items);
    if (!rows.length) return sec.emptyNote ? '<div class="c06-empty">' + esc(sec.emptyNote) + '</div>' : '';
    var h = '<div class="c06-tablewrap"><table class="c06-table">';
    if (cols.length) {
      h += '<thead><tr>' + cols.map(function (col) { return '<th>' + esc(col.label || '') + '</th>'; }).join('') + '</tr></thead>';
    }
    h += '<tbody>';
    rows.forEach(function (r) {
      var click = !!r.dest;
      h += '<tr' + (click ? ' class="is-click" data-act="goto" data-goto="' + attrJson(r.dest) + '" tabindex="0"' : '') +
           ' data-item-id="' + esc(r.id || '') + '">';
      var cells = r.cells;
      if (Array.isArray(cells)) {
        cells.forEach(function (cv) { h += '<td>' + esc(scalar(cv)) + '</td>'; });
      } else if (cells && typeof cells === 'object') {
        if (cols.length && cols[0].id) {
          cols.forEach(function (col) { h += '<td>' + esc(scalar(cells[col.id])) + '</td>'; });
        } else {
          Object.keys(cells).forEach(function (k) { h += '<td>' + esc(scalar(cells[k])) + '</td>'; });
        }
      } else {
        h += '<td>' + esc(r.label || r.id || '') + '</td>';
      }
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  function stepsHtml(sec) {
    var h = '';
    if (sec.officialSource) {
      h += '<p class="c06-section-note"><strong>Official source:</strong> ' + esc(sec.officialSource) + '</p>';
    }
    if (sec.policyNote) h += '<p class="c06-section-note">' + esc(sec.policyNote) + '</p>';
    if (arr(sec.hostChoices).length) {
      h += '<p class="c06-section-note">Host / environment: ' + arr(sec.hostChoices).map(function (hc) {
        return esc(hc.label);
      }).join(' · ') + '</p>';
    }
    h += '<ol class="c06-steps">';
    arr(sec.steps).forEach(function (s) {
      var label = s.label || s.title || '';
      var detail = s.detail || s.note || '';
      h += '<li><span class="c06-step-label">' + esc(label) + '</span>' +
           (detail ? '<span class="c06-step-detail">' + esc(str(detail)) + '</span>' : '') + '</li>';
    });
    h += '</ol>';
    return h;
  }

  function logHtml(sec) {
    var entries = arr(sec.entries).length ? arr(sec.entries) : arr(sec.log);
    var h = '';
    arr(sec.sources).forEach(function (s) { h += entryHtml(s, {}); });
    if (!entries.length && !arr(sec.sources).length) {
      return sec.emptyNote ? '<div class="c06-empty">' + esc(sec.emptyNote) + '</div>' : '';
    }
    h += '<ul class="c06-log">';
    entries.forEach(function (e) {
      h += '<li><span class="c06-log-at">' + esc(fmtWhen(e.at || e.when) || str(e.at || e.when)) + '</span>' +
           '<span class="c06-log-what">' + esc(e.label || e.what || '') + '</span>' +
           (e.detail ? '<span class="c06-log-detail">' + esc(str(e.detail)) + '</span>' : '') + '</li>';
    });
    h += '</ul>';
    return h;
  }

  function previewHtml(sec) {
    var h = '';
    if (sec.state) h += '<p class="c06-factline">State: ' + esc(str(sec.state)) + '</p>';
    if (sec.summary) h += '<p class="c06-section-note">' + esc(str(sec.summary)) + '</p>';
    if (sec.source) {
      h += '<div class="c06-kv">' +
        kvLineHtml({ id: 'pv.file', label: 'Source file', value: sec.source.file }) +
        kvLineHtml({ id: 'pv.created', label: 'Created', value: sec.source.createdOn }) +
        kvLineHtml({ id: 'pv.mode', label: 'Mode', value: sec.source.mode }) + '</div>';
    }
    if (sec.counts) {
      var counts = obj(sec.counts);
      h += '<div class="c06-copy-counts">' + Object.keys(counts).map(function (k) {
        return '<span><b>' + esc(String(counts[k])) + '</b>' + esc(humanKey(k)) + '</span>';
      }).join('') + '</div>';
    }
    if (arr(sec.conflicts).length) {
      h += '<div class="c06-group-head">Conflicts</div>';
      arr(sec.conflicts).forEach(function (cf) {
        h += kvLineHtml({ id: 'cf.' + cf.settingId, label: cf.settingId, dest: cf.dest,
          value: 'here: ' + scalar(cf.local) + ' · incoming: ' + scalar(cf.incoming), note: cf.note });
      });
    }
    if (arr(sec.invalid).length) {
      h += '<div class="c06-group-head">Invalid entries</div>';
      arr(sec.invalid).forEach(function (iv) {
        h += kvLineHtml({ id: 'iv.' + iv.key, label: iv.key, value: iv.reason });
      });
    }
    if (arr(sec.legacyMigrated).length) {
      h += '<div class="c06-group-head">Legacy keys migrated</div>';
      arr(sec.legacyMigrated).forEach(function (lm) {
        h += kvLineHtml({ id: 'lm.' + lm.from, label: lm.from, value: '→ ' + lm.to, note: lm.note });
      });
    }
    if (arr(sec.skipped).length) {
      h += '<div class="c06-group-head">Skipped</div>';
      arr(sec.skipped).forEach(function (sk) {
        h += kvLineHtml({ id: 'sk.' + sk.ref, label: sk.ref, value: sk.reason, dest: sk.dest });
      });
    }
    if (sec.sample) {
      h += '<div class="c06-group-head">' + esc(sec.sample.formatter || 'Sample') +
           (sec.sample.when ? ' · ' + esc(sec.sample.when) : '') + '</div>' +
           '<div class="c06-mono">' + esc('before  ' + sec.sample.before) + '</div>' +
           '<div class="c06-mono">' + esc('after   ' + sec.sample.after) + '</div>';
    }
    if (sec.restorePointId) {
      h += '<p class="c06-factline">Restore point: ' + esc(sec.restorePointId) + '</p>';
    }
    return h;
  }

  /* ============================ All Settings (virtualized) ============================ */

  var ROWH = 62;
  var allList = null;   /* filtered flat list cache */

  function renderAll() {
    var rise = mkRise();
    var counts = store.counts();
    var stressOn = false;
    try { stressOn = window.PM2.states.stressActive(); } catch (e) { stressOn = false; }
    var h = '';
    h += '<header class="' + rise() + '">' +
         '<p class="c06-kicker">Settings · ' + esc(store.data.project.name) + '</p>' +
         '<h1 class="c06-h1">All Settings</h1>' +
         '<p class="c06-lede">The complete long-tail index — every one of the ' + counts.total +
         ' settings, filterable by domain, kind, tier, and state.</p>' +
         '<hr class="c06-rule-strong"></header>';

    h += '<div class="c06-facets' + rise() + '">';
    h += '<input class="c06-input" type="text" id="c06AllQ" placeholder="Filter by name…" value="' + esc(ui.all.q) + '" aria-label="Filter settings">';
    h += facetBtn('cat', 'Domain', ui.all.cat ? (catById(ui.all.cat) || {}).title : 'All domains');
    h += facetBtn('type', 'Kind', ui.all.type || 'All kinds');
    h += facetBtn('tier', 'Tier', ui.all.tier || 'All tiers');
    h += facetBtn('changed', 'Changed', ui.all.changed === 'changed' ? 'Changed only' : 'Any value');
    h += facetBtn('state', 'State', ui.all.state || 'Any state');
    h += '</div>';
    h += '<p class="c06-facet-note" id="c06AllCount"></p>';
    if (stressOn) {
      h += '<p class="c06-facet-note">Stress overlay active: 2,000 synthetic records are listed and clearly marked “Stress fixture”. They are not real settings.</p>';
    }
    h += '<div class="c06-index" id="c06Index" data-allow-hscroll></div>';
    els.article.innerHTML = h;

    var q = document.getElementById('c06AllQ');
    var deb = 0;
    q.addEventListener('input', function () {
      if (deb) window.clearTimeout(deb);
      deb = window.setTimeout(function () {
        ui.all.q = q.value;
        allList = null;
        drawIndex();
      }, 120);
    });
    allList = null;
    drawIndex();
    window.PMShell.status('All Settings — complete index');
  }

  function facetBtn(key, label, valueLabel) {
    return '<button type="button" class="c06-selectbtn" data-act="facet" data-facet="' + key + '" aria-haspopup="menu">' +
      esc(label) + ': ' + esc(valueLabel) + '</button>';
  }

  function buildAllList() {
    if (allList) return allList;
    var qTokens = str(ui.all.q).toLowerCase().split(/\s+/).filter(Boolean);
    var rowStates = obj(store.data.rowStates);
    var list = [];
    arr(inv().settings).forEach(function (s) {
      if (ui.all.cat && s.cat !== ui.all.cat) return;
      if (ui.all.type && s.type !== ui.all.type) return;
      if (ui.all.tier && s.tier !== ui.all.tier) return;
      if (ui.all.changed === 'changed') {
        var entry = store.values[s.id];
        if (!entry || !entry.changedFromDefault) return;
      }
      if (ui.all.state) {
        var rs = rowStates[s.id];
        if (!rs || rs.state !== ui.all.state) return;
      }
      if (qTokens.length) {
        var hay = (s.label + ' ' + s.id + ' ' + arr(s.search).join(' ')).toLowerCase();
        for (var i = 0; i < qTokens.length; i++) if (hay.indexOf(qTokens[i]) < 0) return;
      }
      list.push({ id: s.id, label: s.label, cat: s.cat, sub: s.sub, type: s.type, stress: false });
    });
    var stressOn = false;
    try { stressOn = window.PM2.states.stressActive(); } catch (e) { stressOn = false; }
    if (stressOn && !ui.all.cat && !ui.all.type && !ui.all.tier && !ui.all.changed && !ui.all.state) {
      var recs = [];
      try { recs = window.PM2.states.stressRecords(); } catch (e) { recs = []; }
      arr(recs).forEach(function (r) {
        if (qTokens.length) {
          var hay2 = (r.label + ' ' + r.id + ' ' + arr(r.search).join(' ')).toLowerCase();
          for (var i = 0; i < qTokens.length; i++) if (hay2.indexOf(qTokens[i]) < 0) return;
        }
        list.push({ id: r.id, label: r.label, cat: r.cat || 'zz-stress', sub: '', type: 'stress', stress: true });
      });
    }
    allList = list;
    return list;
  }

  function onIndexScroll() {
    if (ui.view.kind === 'all') drawIndex(true);
  }

  function drawIndex(fromScroll) {
    var host = document.getElementById('c06Index');
    if (!host) return;
    var list = buildAllList();
    var countEl = document.getElementById('c06AllCount');
    if (countEl) {
      countEl.textContent = 'Showing ' + list.length + ' of ' + (arr(inv().settings).length) + ' settings' +
        (list.length !== arr(inv().settings).length ? ' (filtered)' : '') + '.';
    }
    if (!list.length) {
      host.innerHTML = '<div class="c06-empty"><strong>No settings match these filters.</strong> Loosen a filter or clear the name field.</div>';
      return;
    }
    var total = list.length * ROWH;
    var hostTop = host.getBoundingClientRect().top - els.scroll.getBoundingClientRect().top + els.scroll.scrollTop;
    var viewTop = Math.max(0, els.scroll.scrollTop - hostTop);
    var viewH = els.scroll.clientHeight;
    var start = Math.max(0, Math.floor(viewTop / ROWH) - 6);
    var end = Math.min(list.length, Math.ceil((viewTop + viewH) / ROWH) + 6);
    var h = '<div style="height:' + (start * ROWH) + 'px"></div>';
    for (var i = start; i < end; i++) {
      var it = list[i];
      if (it.stress) {
        h += '<div class="c06-index-row" data-setting-id="' + esc(it.id) + '" tabindex="-1">' +
             '<div class="c06-index-main"><div class="c06-index-label">' + esc(it.label) + '</div>' +
             '<div class="c06-index-path">' + esc(it.id) + '</div></div>' +
             '<div class="c06-index-side"><span class="c06-index-stress">Stress fixture</span></div></div>';
        continue;
      }
      var row = store.resolveRow(it.id);
      var cat = catById(it.cat);
      var sg = subOf(it.cat, it.sub);
      h += '<div class="c06-index-row" data-setting-id="' + esc(it.id) + '" data-act="goto" data-goto="' +
           attrJson({ route: 'setting', settingId: it.id }) + '" role="link" tabindex="0">' +
           '<div class="c06-index-main"><div class="c06-index-label">' + esc(it.label) + '</div>' +
           '<div class="c06-index-path">' + esc((cat ? cat.title : it.cat) + ' › ' + (sg ? sg.title : it.sub)) + '</div></div>' +
           '<div class="c06-index-side">' + (row ? chipsHtml(row) : '') + '</div></div>';
    }
    h += '<div style="height:' + Math.max(0, total - end * ROWH) + 'px"></div>';
    host.innerHTML = h;
  }

  function openFacetMenu(invoker, key) {
    var items = [];
    function mk(value, label) {
      return { label: label, value: value, checked: ui.all[key] === value };
    }
    if (key === 'cat') {
      items.push(mk('', 'All domains'));
      arr(inv().categories).forEach(function (c) { items.push(mk(c.id, c.title)); });
    } else if (key === 'type') {
      items.push(mk('', 'All kinds'));
      ['select', 'toggle', 'slider', 'number', 'action', 'radio', 'list', 'multiselect', 'keyvalue', 'text', 'path']
        .forEach(function (t) { items.push(mk(t, t)); });
    } else if (key === 'tier') {
      items = [mk('', 'All tiers'), mk('simple', 'simple'), mk('advanced', 'advanced')];
    } else if (key === 'changed') {
      items = [mk('', 'Any value'), mk('changed', 'Changed only')];
    } else if (key === 'state') {
      items = [mk('', 'Any state'), mk('managed', 'managed'), mk('unavailable', 'unavailable'),
        mk('restart-required', 'restart-required'), mk('reconnect-required', 'reconnect-required'),
        mk('changed-elsewhere', 'changed-elsewhere'), mk('error', 'error')];
    }
    openMenu(invoker, items, {
      onPick: function (it) {
        ui.all[key] = it.value;
        allList = null;
        renderAll();
      }
    });
  }

  /* ============================ Copy Settings (quiet dialog) ============================ */

  var COPY_STEPS = [
    { id: 'source', label: '1 · Source' },
    { id: 'categories', label: '2 · Choose' },
    { id: 'preview', label: '3 · Preview' },
    { id: 'apply', label: '4 · Apply & verify' }
  ];

  function renderCopy() {
    var rise = mkRise();
    var cp = ui.copy;
    var h = '';
    h += '<header class="' + rise() + '">' +
         '<p class="c06-kicker">Settings · one-time transaction</p>' +
         '<h1 class="c06-h1">Copy Settings From Another Project</h1>' +
         '<p class="c06-lede">Bring another project’s choices into ' + esc(store.data.project.name) +
         ' once. Nothing stays linked — after the copy, the two projects are fully independent.</p>' +
         '<hr class="c06-rule-strong"></header>';

    h += '<div class="c06-copy' + rise() + '">';
    var stepIdx = { source: 0, categories: 1, preview: 2, applying: 3, receipt: 3 }[cp.step] || 0;
    h += '<div class="c06-copy-steps">' + COPY_STEPS.map(function (s, i) {
      return '<span class="' + (i === stepIdx ? 'is-here' : '') + '">' + esc(s.label) + '</span>';
    }).join('') + '</div>';
    h += '<div class="c06-copy-body">';

    if (cp.step === 'source') h += copySourceHtml();
    else if (cp.step === 'categories') h += copyCategoriesHtml();
    else if (cp.step === 'preview') h += copyPreviewHtml();
    else if (cp.step === 'applying') h += copyApplyingHtml();
    else if (cp.step === 'receipt') h += copyReceiptHtml();

    h += '</div></div>';
    els.article.innerHTML = h;
    window.PMShell.status('Copy Settings — ' + cp.step);
  }

  function copySourceHtml() {
    var sources = window.PM2.copy.sources();
    var h = '<p class="c06-section-note">Choose the project to copy from. Only compatible values come across.</p>';
    sources.forEach(function (s) {
      var sum = arr(s.categorySummaries).map(function (c) { return c.title + ' (' + c.count + ')'; }).join(' · ');
      h += '<button type="button" class="c06-src' + (ui.copy.sourceId === s.id ? ' is-selected' : '') +
           '" data-act="copy-source" data-id="' + esc(s.id) + '">' +
           '<span class="c06-src-name">' + esc(s.name) + (s.legacy ? ' <span class="c06-manager-kind">legacy format</span>' : '') + '</span>' +
           '<span class="c06-src-when">updated ' + esc(fmtWhen(s.lastUpdated)) + '</span>' +
           '<span class="c06-src-sum">' + esc(sum) + '</span></button>';
    });
    return h;
  }

  function copyCategoriesHtml() {
    var sources = window.PM2.copy.sources();
    var src = null;
    sources.forEach(function (s) { if (s.id === ui.copy.sourceId) src = s; });
    if (!src) return '<div class="c06-empty">Pick a source project first.</div>';
    var anyChecked = false;
    var h = '<p class="c06-section-note">Copying from <strong>' + esc(src.name) + '</strong>. ' +
            'Pick the areas to bring across — counts show how many values each area carries.</p>';
    arr(src.categorySummaries).forEach(function (c) {
      var on = ui.copy.cats[c.cat] !== false;
      if (on) anyChecked = true;
      h += '<label class="c06-cat-check"><input type="checkbox" data-copycat="' + esc(c.cat) + '"' + (on ? ' checked' : '') + '>' +
           '<span>' + esc(c.title) + '</span><span class="c06-cat-n">' + c.count + (c.count === 1 ? ' value' : ' values') + '</span></label>';
    });
    h += '<div class="c06-copy-foot">' +
         '<button type="button" class="c06-btn" data-act="copy-step" data-step="source">Back</button>' +
         '<button type="button" class="c06-btn is-primary" data-act="copy-preview"' + (anyChecked ? '' : ' disabled') + '>Preview the copy</button>' +
         '</div>';
    return h;
  }

  function copyPreviewHtml() {
    var pv = ui.copy.preview;
    if (!pv || !pv.token) return '<div class="c06-empty">The preview expired. Go back one step and stage it again.</div>';
    var c = pv.counts;
    var h = '<p class="c06-section-note">From <strong>' + esc(pv.sourceName || '') + '</strong> — reviewed before anything changes:</p>';
    h += '<div class="c06-copy-counts">' +
         '<span><b>' + c.add + '</b>added</span>' +
         '<span><b>' + c.replace + '</b>replaced</span>' +
         '<span><b>' + c.unchanged + '</b>already match</span>' +
         '<span><b>' + c.unavailable + '</b>unavailable</span>' +
         '<span><b>' + c.conflict + '</b>conflicts</span></div>';
    h += '<p class="c06-facet-note">' + arr(pv.perCategory).map(function (pc) {
      var t = pc.counts;
      return esc(pc.title) + ' (' + (t.add + t.replace) + ' will apply)';
    }).join(' · ') + '</p>';
    h += '<div class="c06-copy-note">' + esc(pv.credentialNote) + '</div>';
    h += '<div class="c06-copy-items">';
    arr(pv.items).forEach(function (it, i) {
      var open = !!ui.copy.inspect[i];
      h += '<div class="c06-copy-item" data-kind="' + esc(it.kind) + '" data-act="copy-inspect" data-idx="' + i + '" tabindex="0" role="button">' +
           '<span class="c06-copy-kind">' + esc(it.kind) + '</span>' +
           '<span class="c06-copy-item-label">' + esc(it.label) + '</span>';
      if (open) {
        h += '<span class="c06-copy-item-diff">' +
             (it.kind !== 'add' ? 'here now: ' + esc(scalar(it.current)) + ' · ' : '') +
             'incoming: ' + esc(scalar(it.incoming)) +
             (it.note ? ' — ' + esc(it.note) : '') + '</span>';
      }
      h += '</div>';
    });
    h += '</div>';
    h += '<p class="c06-section-note">Applying first writes a restore point, then applies everything at once, then verifies the result. ' +
         'Unavailable and conflicting values are never applied. One rollback undoes the whole transaction.</p>';
    h += '<div class="c06-copy-foot">' +
         '<button type="button" class="c06-btn" data-act="copy-step" data-step="categories">Back</button>' +
         '<button type="button" class="c06-btn is-primary" data-act="copy-apply">Create restore point &amp; apply</button>' +
         '</div>';
    return h;
  }

  function copyApplyingHtml() {
    return '<p class="c06-section-note">Applying the copy — each stage reports honestly.</p>' +
           '<div class="c06-opline" data-copyop>' + (ui.copy.opNote || 'Queued…') + '</div>';
  }
  function updateCopyOp(payload) {
    if (payload.name !== 'copy-apply' && payload.name !== 'copy-rollback') return;
    ui.copy.opNote = opLineHtml(payload);
    var el = els.article.querySelector('[data-copyop]');
    if (el) { el.innerHTML = ui.copy.opNote; el.setAttribute('data-status', payload.status); }
  }

  function copyReceiptHtml() {
    var res = ui.copy.result;
    if (!res) return '<div class="c06-empty">No transaction recorded.</div>';
    var h = '';
    if (!res.ok) {
      h += '<div class="c06-receipt"><strong>Nothing changed.</strong>' +
           '<p>' + esc(res.error || 'Verification failed, so the restore point was applied automatically.') + '</p></div>';
      h += '<div class="c06-copy-foot"><button type="button" class="c06-btn" data-act="copy-step" data-step="preview">Back to the preview</button></div>';
      return h;
    }
    h += '<div class="c06-receipt"><strong>Copied and verified.</strong>' +
         '<p>' + res.applied + ' value(s) applied atomically and read back correctly. Restore point <strong>' +
         esc(res.restorePointId) + '</strong> · receipt <strong>' + esc(res.receiptId) + '</strong>.</p>' +
         '<p>The two projects are now independent — future changes in the source never travel here.</p>' +
         (ui.copy.rolledBack ? '<p><strong>Rolled back.</strong> Every copied value was restored exactly from the restore point.</p>' : '') +
         '</div>';
    h += '<div class="c06-copy-foot">' +
         (ui.copy.rolledBack ? '' :
           '<button type="button" class="c06-btn" data-act="copy-rollback" data-receipt="' + esc(res.receiptId) + '">Roll back this copy</button>') +
         '<button type="button" class="c06-btn" data-act="copy-step" data-step="source">Start another copy</button>' +
         '<button type="button" class="c06-btn is-primary" data-act="goto" data-goto="' + attrJson({ route: 'home' }) + '">Done — back to Home</button>' +
         '</div>';
    return h;
  }

  /* ============================ click + key handling ============================ */

  function onRootClick(ev) {
    var t = ev.target.closest('[data-act]');
    if (!t || !els.root.contains(t)) return;
    var act = t.getAttribute('data-act');

    if (act === 'goto') {
      ev.preventDefault();
      var dest = JSON.parse(t.getAttribute('data-goto'));
      goDest(dest);
      return;
    }
    if (act === 'result') {
      ev.preventDefault();
      var rd = JSON.parse(t.getAttribute('data-goto'));
      var rid = t.getAttribute('data-rid');
      closeDropdown();
      goDest(rd, { focus: rid });
      return;
    }
    if (act === 'close-settings') {
      window.PM2.states.receipt('Close Settings',
        'Returns to the Dashboard — the surface that opened Settings. Simulated here: this concept page has no app shell behind it.');
      return;
    }
    if (act === 'fold') {
      var key = t.getAttribute('data-fold');
      ui.folds[key] = !ui.folds[key];
      var body = els.article.querySelector('[data-fold-body="' + cssEscape(key) + '"]');
      if (body) body.hidden = !ui.folds[key];
      t.setAttribute('aria-expanded', String(!!ui.folds[key]));
      var mark = t.querySelector('.c06-fold-mark');
      if (mark) mark.textContent = ui.folds[key] ? '−' : '+';
      return;
    }
    if (act === 'row-detail') {
      var id = t.getAttribute('data-id');
      ui.rowDetail[id] = !ui.rowDetail[id];
      renderCurrent({ preserveScroll: true });
      return;
    }
    if (act === 'toggle') {
      var tid = t.getAttribute('data-id');
      var row = store.resolveRow(tid);
      if (row) {
        var tres = store.setValue(tid, !(row.value === true), { source: 'settings' });
        /* flip immediately; the debounced re-render confirms from the store */
        if (tres.ok) t.setAttribute('aria-checked', String(tres.value === true));
      }
      return;
    }
    if (act === 'select') {
      var sid = t.getAttribute('data-id');
      var srow = store.resolveRow(sid);
      if (!srow) return;
      openMenu(t, arr(srow.control.options).map(function (opt) {
        return { label: opt, value: opt, checked: srow.value === opt };
      }), { onPick: function (it) { store.setValue(sid, it.value, { source: 'settings' }); } });
      return;
    }
    if (act === 'multiselect') {
      var mid = t.getAttribute('data-id');
      var mrow = store.resolveRow(mid);
      if (!mrow) return;
      var current = arr(mrow.value);
      openMenu(t, arr(mrow.control.options).map(function (opt) {
        return { label: opt, value: opt, checked: current.indexOf(opt) >= 0 };
      }), {
        multi: true,
        onToggle: function (item, items) {
          var next = items.filter(function (x) { return x.checked; }).map(function (x) { return x.value; });
          store.setValue(mid, next, { source: 'settings' });
        }
      });
      return;
    }
    if (act === 'setting-action') {
      var aid = t.getAttribute('data-id');
      var arow = store.resolveRow(aid);
      window.PM2.states.receipt(arow ? arow.label : 'Action',
        'Simulated: this opens its own surface in the real app. Nothing actually ran.');
      return;
    }
    if (act === 'mgr-action') {
      var mgrId = t.getAttribute('data-mgr');
      var actionId = t.getAttribute('data-action-id');
      var def = managers().get(mgrId);
      if (!def) return;
      var actionsList = [];
      try { actionsList = def.actions(store); } catch (e) { actionsList = []; }
      for (var i = 0; i < actionsList.length; i++) {
        if (actionsList[i].id === actionId) {
          try { actionsList[i].run(store); } catch (e2) { /* honest ops report themselves */ }
          break;
        }
      }
      return;
    }
    if (act === 'facet') {
      openFacetMenu(t, t.getAttribute('data-facet'));
      return;
    }
    if (act === 'crumbsel') {
      openCrumbMenu(t);
      return;
    }
    if (act === 'copy-source') {
      ui.copy.sourceId = t.getAttribute('data-id');
      ui.copy.cats = {};
      ui.copy.step = 'categories';
      renderCopy();
      return;
    }
    if (act === 'copy-step') {
      ui.copy.step = t.getAttribute('data-step');
      renderCopy();
      return;
    }
    if (act === 'copy-preview') {
      var srcs = window.PM2.copy.sources();
      var chosen = [];
      srcs.forEach(function (s) {
        if (s.id !== ui.copy.sourceId) return;
        arr(s.categorySummaries).forEach(function (cc) {
          if (ui.copy.cats[cc.cat] !== false) chosen.push(cc.cat);
        });
      });
      ui.copy.preview = window.PM2.copy.preview(ui.copy.sourceId, chosen);
      ui.copy.inspect = {};
      ui.copy.step = 'preview';
      renderCopy();
      return;
    }
    if (act === 'copy-inspect') {
      var idx = t.getAttribute('data-idx');
      ui.copy.inspect[idx] = !ui.copy.inspect[idx];
      renderCopy();
      return;
    }
    if (act === 'copy-apply') {
      ui.copy.step = 'applying';
      ui.copy.opNote = null;
      renderCopy();
      window.PM2.copy.apply(ui.copy.preview.token).then(function (res) {
        ui.copy.result = res;
        ui.copy.rolledBack = false;
        ui.copy.step = 'receipt';
        if (ui.view.kind === 'copy') renderCopy();
      });
      return;
    }
    if (act === 'copy-rollback') {
      var rcpt = t.getAttribute('data-receipt');
      window.PM2.copy.rollback(rcpt).then(function (res) {
        if (res.ok) ui.copy.rolledBack = true;
        if (ui.view.kind === 'copy') renderCopy();
      });
      return;
    }
  }

  function onRootKeydown(ev) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      var t = ev.target;
      if (t && t.matches && t.matches('[role="button"][data-act], [role="link"][data-act], tr.is-click[data-act]')) {
        ev.preventDefault();
        t.click();
      }
    }
  }

  function openCrumbMenu(invoker) {
    var counts = store.counts();
    var items = [{ label: 'Home', value: { route: 'home' }, checked: ui.view.kind === 'home' }];
    arr(counts.byCategory).forEach(function (c) {
      items.push({ label: c.title, value: { route: 'dest', cat: c.id }, checked: ui.view.cat === c.id });
    });
    items.push({ label: 'All Settings', value: { route: 'all' }, checked: ui.view.kind === 'all' });
    items.push({ label: 'Copy Settings…', value: { route: 'copy' }, checked: ui.view.kind === 'copy' });
    openMenu(invoker, items, { onPick: function (it) { goDest(it.value); } });
  }

  /* ============================ global keys ============================ */

  function bindGlobalKeys() {
    document.addEventListener('keydown', function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'k' || ev.key === 'K')) {
        ev.preventDefault();
        var input = ui.view.kind === 'home' || ui.view.kind === 'search'
          ? document.getElementById('c06HomeSearch')
          : document.getElementById('c06TopSearch');
        if (!input) input = document.getElementById('c06TopSearch') || document.getElementById('c06HomeSearch');
        if (input) { input.focus(); input.select(); }
        return;
      }
      if (ev.key !== 'Escape') return;
      /* Escape ladder: popup -> dropdown -> detail -> one level out -> Home stop */
      if (menuState) { closeMenu(); return; }
      if (dropOpen()) { closeDropdown(); return; }
      var v = ui.view;
      if (v.kind === 'manager' && v.objectId) {
        goDest({ route: 'manager', managerId: v.managerId });
        return;
      }
      var openDetailIds = Object.keys(ui.rowDetail).filter(function (k) { return ui.rowDetail[k]; });
      if (openDetailIds.length && (v.kind === 'dest' || v.kind === 'setting')) {
        ui.rowDetail = {};
        renderCurrent({ preserveScroll: true });
        return;
      }
      var parent = parentOf(v);
      if (parent && v.kind !== 'home') goDest(parent.dest);
      /* at Home: stop — never close Settings from Escape */
    });
  }

  /* ============================ start ============================ */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
