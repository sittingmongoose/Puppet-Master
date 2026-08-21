/* concept-11-tabbed-organizer.js — fable · 11 Sheaf
   Rethemed Tabbed Organizer: top category tabs over layered sheets.

   Organization model (borrowed from the reference, fully rethemed):
     - one persistent row of grouped category tabs (9 tabs over the 12
       canonical categories; the mapping is documented on Home and below);
     - beneath the tabs, LAYERED SHEETS: navigating deeper lays a new sheet
       inside the same tabbed frame; a crumb-chip pile (Home › Category ›
       Page › Detail) is the location instrument and never disappears;
     - compact Home (search, attention, 12 category tiles, recent changes);
     - domain sheets with subgroup sub-tabs + a related-managers strip;
     - provider manager: roster, then a provider detail sheet with its own
       tab row; deep links land inside the same pile;
     - copy: source and categories in adjacent panes, then a confirm sheet.

   ZERO paper/folder/binder skeuomorphism — modern PM tabs, panels, tokens.
   All data via PM2.* (CONTRACT2). All navigation via PM2.route.go.
   Plain ES5-style IIFE, no build step, no emoji. Slint notes inline. */
(function () {
  'use strict';

  var store = null;
  var stage = null;
  var root = null;
  var els = {};                 /* frame element cache */

  /* ---------------- grouped tab map (complete, documented) ----------------
     9 tabs cover all 12 inventory categories; nothing disappears. Grouped
     tabs ('Memory & Planning', 'Collaboration', 'Media & Web') carry a
     category lens row on their sheet so both member categories stay first-
     class destinations with their own routes. */
  var TAB_GROUPS = [
    { id: 'tg.general',    label: 'General',           cats: ['general'] },
    { id: 'tg.ai',         label: 'AI & Models',       cats: ['ai'] },
    { id: 'tg.safety',     label: 'Safety',            cats: ['safety'] },
    { id: 'tg.code',       label: 'Code',              cats: ['code'] },
    { id: 'tg.mind',       label: 'Memory & Planning', cats: ['memory', 'planning'] },
    { id: 'tg.collab',     label: 'Collaboration',     cats: ['branching', 'personas'] },
    { id: 'tg.mediaweb',   label: 'Media & Web',       cats: ['media', 'web'] },
    { id: 'tg.extensions', label: 'Extensions',        cats: ['extensions'] },
    { id: 'tg.system',     label: 'System',            cats: ['system'] }
  ];

  function groupForCat(cat) {
    for (var i = 0; i < TAB_GROUPS.length; i++) {
      if (TAB_GROUPS[i].cats.indexOf(cat) >= 0) return TAB_GROUPS[i];
    }
    return null;
  }

  /* ---------------- ui state (explicit machine; Slint-portable) ------------ */

  var ui = {
    dest: { route: 'home' },      /* current parsed dest (mirror of route) */
    stack: [],                    /* crumb pile: [{key,label,dest}] */
    narrow: false,                /* stage < NARROW_AT */
    tight: false,                 /* stage < TIGHT_AT */
    domSub: {},                   /* cat -> active sub-tab id ('' = all) */
    advOpen: {},                  /* cat/sub -> advanced tier expanded */
    rowDrawer: null,              /* settingId whose details drawer is open */
    secOpen: {},                  /* manager section item disclosure keys */
    search: { q: '', open: false, res: null, active: -1 },
    all: { q: '', cat: '', type: '', tier: '', state: '', changed: '', scroll: 0 },
    copy: { step: 'pick', sourceId: null, cats: {}, preview: null,
            receipt: null, kind: '', openItems: {}, busy: false },
    ops: {},                      /* opId -> latest truthful op payload */
    opOrder: [],
    menu: null,                   /* open popup menu state */
    locateTimer: null,
    allCache: null,               /* resolved row list epoch cache */
    epoch: 0
  };

  var NARROW_AT = 1020;
  var TIGHT_AT = 840;

  /* ---------------- tiny helpers ---------------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function attr(s) { return esc(s).replace(/'/g, '&#39;'); }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object' && !Array.isArray(x)) ? x : {}; }
  function str(x) { return typeof x === 'string' ? x : ''; }
  function ico(name) { return '<i data-ico="' + attr(name) + '"></i>'; }
  function hydrate(node) {
    try { if (window.PMIcons && node) window.PMIcons.hydrate(node); } catch (e) { /* icons optional */ }
  }
  function util() { return window.PM2.util; }
  function fmtAgo(t) { try { return util().fmtAgo(t); } catch (e) { return ''; } }
  function fmtInt(n) { try { return util().fmtInt(n); } catch (e) { return String(n); } }

  function inventory() { return obj(window.PM2_INVENTORY); }
  function catById(id) {
    var cs = arr(inventory().categories);
    for (var i = 0; i < cs.length; i++) if (cs[i].id === id) return cs[i];
    return null;
  }
  /* Subgroups carry {id, title, desc}. Ordinary copy must never print the id
     ("visual"); it prints the title ("Visual Style"). Anything that shows a
     category/subgroup path goes through subTitle so the two can never drift. */
  function subById(cat, subId) {
    var c = catById(cat);
    if (!c || !subId) return null;
    var gs = arr(c.subgroups);
    for (var i = 0; i < gs.length; i++) if (gs[i].id === subId) return gs[i];
    return null;
  }
  function subTitle(cat, subId) {
    var g = subById(cat, subId);
    return g ? (g.title || g.id) : (subId || '');
  }
  function settingById(id) {
    if (!settingById._ix) {
      settingById._ix = {};
      arr(inventory().settings).forEach(function (s) { settingById._ix[s.id] = s; });
    }
    return settingById._ix[id] || null;
  }
  /* Legacy-graft mechanism, intentionally EMPTY: ids that exist only in the
     old rev-2 demo dataset (e.g. system.health.diagnostics-verbosity) are NOT
     part of this project's 828-row inventory, so deep links to them get the
     honest not-in-this-project surface instead of a fabricated row. */
  var EXTRA_ROWS = {};
  function extraRecord(id) {
    if (!EXTRA_ROWS[id]) return null;
    var rec = obj(obj(store.data).settings)[id];
    return rec && rec.id ? rec : null;
  }

  /* URL-applied scenarios/fixtures are persist:false, so the store keys can
     be stale — always prefer the live PM2.states view. (Rendering otherwise
     reads store.data flags, resolveRow states, and notices, never these.) */
  function scenario() {
    try {
      var S = window.PM2.states;
      if (S && typeof S.activeScenario === 'function') return str(S.activeScenario()) || 'baseline';
    } catch (e) { /* states optional */ }
    return str(store.get('scenario')) || 'baseline';
  }
  function fixtures() {
    try {
      var S = window.PM2.states;
      if (S && typeof S.activeFixtures === 'function') return arr(S.activeFixtures());
    } catch (e) { /* states optional */ }
    return arr(store.get('fixtures'));
  }
  function hasFx(id) { return fixtures().indexOf(id) >= 0; }

  function managers() { return window.PM2.managers; }
  function managerById(id) { return managers() && managers().get ? managers().get(id) : null; }

  function statusWord(tone, label) {
    return '<span class="pm-status-word" data-tone="' + attr(tone || 'muted') + '">' + esc(label || '') + '</span>';
  }
  function chipHtml(kind, label) {
    return '<span class="pm-chip-value" data-kind="' + attr(kind) + '">' + esc(label) + '</span>';
  }

  /* ---------------- route helpers (all navigation via PM2.route.go) -------- */

  function go(dest, opts) {
    try { return window.PM2.route.go(dest, opts); } catch (e) { return null; }
  }
  function destHash(dest) {
    try { return window.PM2.route.build(dest); } catch (e) { return '#/home'; }
  }

  function parentDest(dest) {
    var d = obj(dest);
    if (d.route === 'manager' && d.objectId) return { route: 'manager', managerId: d.managerId };
    if (d.route === 'manager') {
      var def = managerById(d.managerId);
      return def ? { route: 'dest', cat: def.cat } : { route: 'home' };
    }
    if (d.route === 'dest' && d.sub) return { route: 'dest', cat: d.cat };
    if (d.route === 'setting') {
      var s = settingById(d.settingId);
      var x = EXTRA_ROWS[d.settingId];
      if (s) return { route: 'dest', cat: s.cat };
      if (x) return { route: 'dest', cat: x.cat };
      return { route: 'home' };
    }
    return { route: 'home' };
  }

  function destLabel(dest) {
    var d = obj(dest);
    if (d.route === 'home') return 'Home';
    if (d.route === 'all') return 'All Settings';
    if (d.route === 'copy') return 'Copy Settings';
    if (d.route === 'search') return 'Search';
    if (d.route === 'dest') { var c = catById(d.cat); return c ? c.title : 'Settings'; }
    if (d.route === 'manager') { var m = managerById(d.managerId); return m ? m.title : 'Manager'; }
    if (d.route === 'setting') { var s = settingById(d.settingId); return s ? s.label : 'Setting'; }
    return 'Settings';
  }

  /* The crumb pile for the current dest — the sheet-stack instrument. */
  function buildStack(dest) {
    var d = obj(dest);
    var pile = [{ key: 'home', label: 'Home', dest: { route: 'home' } }];
    if (d.route === 'home') return pile;
    if (d.route === 'all') { pile.push({ key: 'all', label: 'All Settings', dest: { route: 'all' } }); return pile; }
    if (d.route === 'copy') {
      pile.push({ key: 'copy', label: 'Copy Settings', dest: { route: 'copy' } });
      if (ui.copy.step === 'preview') pile.push({ key: 'copy2', label: 'Preview & apply', dest: { route: 'copy' } });
      if (ui.copy.step === 'receipt') pile.push({ key: 'copy3', label: 'Receipt', dest: { route: 'copy' } });
      return pile;
    }
    if (d.route === 'search') {
      pile.push({ key: 'search', label: 'Search “' + (d.query || '') + '”', dest: { route: 'search', query: d.query } });
      return pile;
    }
    if (d.route === 'dest' || d.route === 'setting') {
      var cat = d.route === 'dest' ? d.cat
        : (settingById(d.settingId) ? settingById(d.settingId).cat
           : (EXTRA_ROWS[d.settingId] ? EXTRA_ROWS[d.settingId].cat : null));
      var c = catById(cat);
      if (c) pile.push({ key: 'cat.' + c.id, label: c.title, dest: { route: 'dest', cat: c.id } });
      return pile;
    }
    if (d.route === 'manager') {
      var def = managerById(d.managerId);
      if (def) {
        var c2 = catById(def.cat);
        if (c2) pile.push({ key: 'cat.' + c2.id, label: c2.title, dest: { route: 'dest', cat: c2.id } });
        pile.push({ key: 'mgr.' + def.id, label: def.title, dest: { route: 'manager', managerId: def.id } });
        if (d.objectId && def.id === 'm.providers') {
          var vm = safeModel(def);
          var page = vm && vm.pages ? vm.pages[d.objectId] : null;
          pile.push({ key: 'obj.' + d.objectId, label: page ? page.title : d.objectId,
                      dest: { route: 'manager', managerId: def.id, objectId: d.objectId } });
        }
      }
      return pile;
    }
    return pile;
  }

  function safeModel(def) {
    if (!def || typeof def.model !== 'function') return null;
    try { return def.model(store); } catch (e) { return null; }
  }
  function safeActions(def) {
    if (!def || typeof def.actions !== 'function') return [];
    try { return arr(def.actions(store)); } catch (e) { return []; }
  }

  /* ---------------- frame ---------------- */

  function buildFrame() {
    root = document.createElement('div');
    root.className = 'c11-root';
    root.innerHTML =
      '<div class="c11-bar">' +
        '<div class="c11-ident">' +
          '<span class="c11-proj">' + ico('layers') + '<b>Puppet Master</b></span>' +
          '<span class="c11-role">Project settings · changes apply to this project only</span>' +
        '</div>' +
        '<div class="c11-searchwrap" id="c11SearchWrap">' +
          '<span class="c11-search-ico">' + ico('search') + '</span>' +
          '<input id="c11Search" data-pm2-search-input class="c11-search" type="text" role="combobox" aria-expanded="false" ' +
            'aria-label="Search settings" autocomplete="off" spellcheck="false" ' +
            'placeholder="Search settings, managers, actions…">' +
          '<kbd class="c11-kbd">Ctrl K</kbd>' +
          '<div class="c11-drop" id="c11Drop" hidden></div>' +
        '</div>' +
        '<div class="c11-baracts">' +
          '<button type="button" class="c11-btn c11-btn-quiet" data-act="close-settings" title="Close Settings">' +
            ico('close') + '<span>Close Settings</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="c11-tabrow">' +
        '<div class="c11-tabs" id="c11Tabs" role="tablist" aria-label="Settings categories"></div>' +
        '<button type="button" class="c11-btn c11-more" id="c11More" data-act="tabs-more" ' +
          'aria-haspopup="menu" aria-expanded="false" title="All destinations">' + ico('more') + '<span>More</span></button>' +
      '</div>' +
      '<div class="c11-notice" id="c11Notice" hidden></div>' +
      '<div class="c11-refresh" id="c11Refresh" hidden></div>' +
      '<div class="c11-ops" id="c11Ops" hidden></div>' +
      '<div class="c11-crumbrow" id="c11CrumbRow">' +
        '<button type="button" class="c11-btn c11-back" id="c11Back" data-act="back" data-pm2-back>' + ico('undo') + '<span></span></button>' +
        '<nav class="c11-crumbs" id="c11Crumbs" aria-label="Sheet pile"></nav>' +
      '</div>' +
      '<div class="c11-sheaf" id="c11Sheaf"><div class="c11-sheet" id="c11Sheet" data-depth="1"></div></div>';
    stage.innerHTML = '';
    stage.appendChild(root);

    els.tabs = root.querySelector('#c11Tabs');
    els.more = root.querySelector('#c11More');
    els.notice = root.querySelector('#c11Notice');
    els.refresh = root.querySelector('#c11Refresh');
    els.ops = root.querySelector('#c11Ops');
    els.crumbRow = root.querySelector('#c11CrumbRow');
    els.back = root.querySelector('#c11Back');
    els.crumbs = root.querySelector('#c11Crumbs');
    els.sheaf = root.querySelector('#c11Sheaf');
    els.sheet = root.querySelector('#c11Sheet');
    els.search = root.querySelector('#c11Search');
    els.searchWrap = root.querySelector('#c11SearchWrap');
    els.drop = root.querySelector('#c11Drop');

    renderTabs();
    hydrate(root);
    wireFrame();
    watchWidth();
  }

  function renderTabs() {
    var activeGroup = activeGroupId();
    var html = '<button type="button" class="c11-tab c11-tab-home' + (activeGroup === 'home' ? ' is-active' : '') + '" ' +
      'role="tab" aria-selected="' + (activeGroup === 'home') + '" data-act="tab-home" title="Settings Home">' +
      ico('grid') + '<span>Home</span></button>';
    TAB_GROUPS.forEach(function (g) {
      var on = g.id === activeGroup;
      html += '<button type="button" class="c11-tab' + (on ? ' is-active' : '') + '" role="tab" ' +
        'aria-selected="' + on + '" data-act="tab-go" data-tabid="' + attr(g.id) + '">' +
        '<span>' + esc(g.label) + '</span></button>';
    });
    els.tabs.innerHTML = html;
    /* renderChrome() rewrites this strip on every route change, so the Home
       tab's leading icon has to be re-filled here. Without it the <i> kept its
       14px box and 6px gap but painted nothing — 20px of dead space that read
       as lopsided padding on the first tab only. */
    hydrate(els.tabs);
    fitTabs();
    /* keep the active tab visible in the scrollable strip */
    var active = els.tabs.querySelector('.c11-tab.is-active:not(.is-overflow)');
    if (active && typeof active.scrollIntoView === 'function') {
      try { active.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* older engines */ }
    }
    updateTabFades();
  }

  /* Whole tabs or none: a tab that would be sliced by the scroller's right edge
     is hidden instead (CSS .is-overflow) and stays reachable through the "More"
     menu, which already lists every destination. Fitting is measured against the
     ROW's free width — never against the strip's own box — so hiding a tab can
     never feed back into the measurement and oscillate. */
  function fitTabs() {
    if (!els.tabs) return;
    var strip = els.tabs;
    var kids = strip.querySelectorAll('.c11-tab');
    if (!kids.length) return;
    var i;
    for (i = 0; i < kids.length; i++) kids[i].classList.remove('is-overflow');

    var row = strip.parentNode;
    if (!row || !row.clientWidth) return;
    var rs = window.getComputedStyle(row);
    var rowGap = parseFloat(rs.columnGap) || 0;
    var avail = row.clientWidth - (parseFloat(rs.paddingLeft) || 0) - (parseFloat(rs.paddingRight) || 0);
    if (els.more && els.more.offsetWidth) avail -= els.more.offsetWidth + rowGap;
    if (!(avail > 0)) return;
    var gap = parseFloat(window.getComputedStyle(strip).columnGap) || 0;

    var widths = [], activeIx = 0;
    for (i = 0; i < kids.length; i++) {
      widths.push(kids[i].getBoundingClientRect().width);
      if (kids[i].classList.contains('is-active')) activeIx = i;
    }

    var keep = {}, used = 0, taken = 0;
    function take(ix) { used += widths[ix] + (taken ? gap : 0); keep[ix] = true; taken++; }
    take(0);                              /* Home is always a way back */
    if (activeIx !== 0) take(activeIx);   /* the active tab is never dropped */
    for (i = 1; i < kids.length; i++) {
      if (keep[i]) continue;
      if (used + widths[i] + gap > avail + 0.5) break;   /* keep the run contiguous */
      take(i);
    }
    for (i = 0; i < kids.length; i++) if (!keep[i]) kids[i].classList.add('is-overflow');
  }

  function activeGroupId() {
    var d = ui.dest;
    if (d.route === 'dest') { var g = groupForCat(d.cat); return g ? g.id : 'home'; }
    if (d.route === 'setting') {
      var s = settingById(d.settingId);
      var x = EXTRA_ROWS[d.settingId];
      var cat = s ? s.cat : (x ? x.cat : null);
      var g2 = groupForCat(cat); return g2 ? g2.id : 'home';
    }
    if (d.route === 'manager') {
      var def = managerById(d.managerId);
      var g3 = def ? groupForCat(def.cat) : null;
      return g3 ? g3.id : 'home';
    }
    return 'home'; /* home, all, copy, search live under the Home tab */
  }

  function updateTabFades() {
    if (!els.tabs) return;
    var elx = els.tabs;
    var can = elx.scrollWidth > elx.clientWidth + 2;
    var atStart = elx.scrollLeft <= 2;
    var atEnd = elx.scrollLeft + elx.clientWidth >= elx.scrollWidth - 2;
    var row = elx.parentNode;
    row.classList.toggle('has-fade-l', can && !atStart);
    row.classList.toggle('has-fade-r', can && !atEnd);
  }

  function renderCrumbs() {
    ui.stack = buildStack(ui.dest);
    /* On Home the pile is one rung deep, so the strip printed a lone "Home"
       chip immediately under the already-active "Home" tab — the same word
       twice, saying nothing the tab had not. The row is dropped there and
       returns the moment the pile is worth reading. */
    var lone = ui.stack.length < 2;
    els.crumbRow.hidden = lone;
    if (lone) {
      els.crumbs.innerHTML = '';
      els.back.hidden = true;
      els.sheet.setAttribute('data-depth', '1');
      return;
    }
    var html = '';
    ui.stack.forEach(function (lvl, i) {
      var top = i === ui.stack.length - 1;
      html += '<button type="button" class="c11-crumb' + (top ? ' is-top' : '') + '" data-act="crumb-go" ' +
        'data-idx="' + i + '"' + (top ? ' aria-current="page"' : '') + '>' + esc(lvl.label) + '</button>';
      if (!top) html += '<span class="c11-crumb-sep" aria-hidden="true">›</span>';
    });
    els.crumbs.innerHTML = html;
    var depth = ui.stack.length;
    els.sheet.setAttribute('data-depth', String(Math.min(depth, 4)));
    var parent = depth > 1 ? ui.stack[depth - 2] : null;
    els.back.hidden = !parent;
    if (parent) {
      els.back.querySelector('span').textContent = 'Back to ' + parent.label;
      hydrate(els.back);
    }
  }

  /* Sheet entry motion: the incoming sheet lifts slightly and settles.
     Purely decorative; never depends on transitionend (kill switches may
     remove transitions entirely). */
  function settleSheet() {
    var sheet = els.sheet;
    sheet.classList.remove('c11-enter');
    void sheet.offsetWidth; /* restart */
    sheet.classList.add('c11-enter');
    window.setTimeout(function () { sheet.classList.remove('c11-enter'); }, 380);
  }

  /* ---------------- banners / refresh strip / ops ---------------- */

  function renderNotice() {
    var d = obj(store.data);
    var banner = null;
    if (d.offline) {
      banner = { word: 'Offline', tone: 'attention',
        text: 'No network connection. Provider status, web search, and update checks are paused; cached values stay visible.',
        actLabel: 'Review web providers', dest: { route: 'dest', cat: 'web', sub: 'providers' } };
    } else if (obj(obj(d.storage).pressure).state === 'critical') {
      banner = { word: 'Storage', tone: 'attention',
        text: 'Storage is nearly full — ' + (obj(d.storage.pressure).freeGB || '?') + ' GB free. New artifact writes pause soon.',
        actLabel: 'Open storage', dest: { route: 'manager', managerId: 'm.storage' } };
    }
    if (!banner) { els.notice.hidden = true; els.notice.innerHTML = ''; return; }
    els.notice.hidden = false;
    els.notice.innerHTML = statusWord(banner.tone, banner.word) +
      '<span class="c11-notice-text">' + esc(banner.text) + '</span>' +
      '<button type="button" class="c11-btn c11-btn-small" data-act="notice-go" data-hash="' +
      attr(destHash(banner.dest)) + '">' + esc(banner.actLabel) + '</button>';
    hydrate(els.notice);
  }

  function renderRefresh() {
    var lc = obj(obj(store.data).loadingCached);
    if (lc.active) {
      els.refresh.hidden = false;
      els.refresh.innerHTML = '<span class="c11-spin" aria-hidden="true"></span>' +
        '<span>Refreshing — ' + esc(lc.note || 'cached values stay visible while fresh ones load.') + '</span>';
    } else {
      els.refresh.hidden = true;
      els.refresh.innerHTML = '';
    }
  }

  var OP_WORDS = {
    queued: 'Queued', running: 'Running', done: 'Done', failed: 'Failed',
    degraded: 'Finished with problems', retryable: 'Failed — can retry',
    canceled: 'Canceled', 'recovery-required': 'Needs recovery'
  };

  function noteOp(p) {
    if (!p || !p.opId) return;
    if (!ui.ops[p.opId]) ui.opOrder.push(p.opId);
    ui.ops[p.opId] = p;
    if (ui.opOrder.length > 6) { delete ui.ops[ui.opOrder.shift()]; }
    renderOps();
    var terminal = ['done', 'failed', 'degraded', 'retryable', 'canceled', 'recovery-required'].indexOf(p.status) >= 0;
    if (terminal) {
      window.setTimeout(function () {
        if (ui.ops[p.opId] && ui.ops[p.opId].status === p.status) {
          delete ui.ops[p.opId];
          var ix = ui.opOrder.indexOf(p.opId);
          if (ix >= 0) ui.opOrder.splice(ix, 1);
          renderOps();
        }
      }, 3200);
    }
  }

  function renderOps() {
    var ids = ui.opOrder.slice();
    if (!ids.length) { els.ops.hidden = true; els.ops.innerHTML = ''; return; }
    var html = '';
    ids.forEach(function (id) {
      var p = ui.ops[id];
      if (!p) return;
      var word = OP_WORDS[p.status] || p.status;
      var phase = p.phase ? ' · ' + p.phase : '';
      var prog = '';
      if (p.progressKind === 'determinate' && typeof p.completed === 'number' && typeof p.total === 'number' && p.total > 0) {
        var pct = Math.max(0, Math.min(100, Math.round(p.completed / p.total * 100)));
        prog = '<span class="c11-op-track" aria-hidden="true"><span class="c11-op-fill" style="width:' + pct + '%"></span></span>' +
          '<span class="c11-op-count">' + fmtInt(p.completed) + ' / ' + fmtInt(p.total) + '</span>';
      } else if (p.status === 'running' || p.status === 'queued') {
        prog = '<span class="c11-op-track is-indet" aria-hidden="true"><span class="c11-op-fill"></span></span>';
      }
      var tone = (p.status === 'failed' || p.status === 'recovery-required') ? 'attention'
        : (p.status === 'degraded' || p.status === 'retryable') ? 'setup'
        : (p.status === 'done') ? 'ok' : 'progress';
      html += '<div class="c11-op" data-tone="' + attr(tone) + '">' +
        '<span class="c11-op-name">' + esc(p.name) + (p.ref ? ' · ' + esc(p.ref) : '') + '</span>' +
        '<span class="c11-op-word">' + esc(word) + esc(phase) + '</span>' + prog + '</div>';
    });
    els.ops.hidden = html === '';
    els.ops.innerHTML = html;
  }

  /* ---------------- popup menus (PM family: layered, collision-flipped,
     Esc closes, focus returns to the invoker) ---------------- */

  function closeMenu(refocus) {
    if (!ui.menu) return;
    var m = ui.menu;
    ui.menu = null;
    if (m.el && m.el.parentNode) m.el.parentNode.removeChild(m.el);
    if (m.invoker && m.invoker.setAttribute) m.invoker.setAttribute('aria-expanded', 'false');
    if (refocus && m.invoker && m.invoker.focus) {
      try { m.invoker.focus(); } catch (e) { /* detached */ }
    }
  }

  function openMenu(invoker, items, opts) {
    closeMenu(false);
    var o = obj(opts);
    var menu = document.createElement('div');
    menu.className = 'c11-menu';
    menu.setAttribute('role', 'menu');
    var html = o.title ? '<div class="c11-menu-title">' + esc(o.title) + '</div>' : '';
    items.forEach(function (it, i) {
      if (it.separator) { html += '<div class="c11-menu-sep" role="separator"></div>'; return; }
      html += '<button type="button" class="c11-menu-item' + (it.checked ? ' is-checked' : '') +
        (it.disabled ? ' is-disabled' : '') + '" role="menuitem" data-mi="' + i + '"' +
        (it.disabled ? ' aria-disabled="true"' : '') + '>' +
        '<span class="c11-menu-check" aria-hidden="true">' + (it.checked ? ico('check') : '') + '</span>' +
        '<span class="c11-menu-label">' + esc(it.label) + '</span>' +
        (it.note ? '<span class="c11-menu-note">' + esc(it.note) + '</span>' : '') +
        '</button>';
    });
    menu.innerHTML = html;
    document.body.appendChild(menu);
    hydrate(menu);

    /* anchor beneath the invoker; flip near edges */
    var r = invoker.getBoundingClientRect();
    var mw = menu.offsetWidth, mh = menu.offsetHeight;
    var vw = window.innerWidth, vh = window.innerHeight;
    var left = Math.min(Math.max(8, r.left), vw - mw - 8);
    var top = r.bottom + 4;
    if (top + mh > vh - 8) top = Math.max(8, r.top - mh - 4);
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';

    ui.menu = { el: menu, invoker: invoker, items: items, onPick: o.onPick || null, active: -1 };
    if (invoker.setAttribute) invoker.setAttribute('aria-expanded', 'true');

    menu.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.c11-menu-item');
      if (!btn || btn.classList.contains('is-disabled')) return;
      pickMenu(Number(btn.getAttribute('data-mi')));
    });
    var first = menu.querySelector('.c11-menu-item:not(.is-disabled)');
    if (first) { try { first.focus(); } catch (e) { /* fine */ } }
  }

  function pickMenu(i) {
    if (!ui.menu) return;
    var m = ui.menu;
    var it = m.items[i];
    if (!it || it.disabled) return;
    var keep = false;
    if (m.onPick) { keep = m.onPick(it, i) === true; }
    if (!keep) closeMenu(true);
  }

  function menuKeydown(ev) {
    if (!ui.menu) return false;
    var menu = ui.menu.el;
    var btns = Array.prototype.slice.call(menu.querySelectorAll('.c11-menu-item:not(.is-disabled)'));
    var cur = btns.indexOf(document.activeElement);
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); closeMenu(true); return true; }
    if (ev.key === 'ArrowDown') { ev.preventDefault(); (btns[cur + 1] || btns[0]) && (btns[cur + 1] || btns[0]).focus(); return true; }
    if (ev.key === 'ArrowUp') { ev.preventDefault(); (btns[cur - 1] || btns[btns.length - 1]) && (btns[cur - 1] || btns[btns.length - 1]).focus(); return true; }
    if (ev.key === 'Home' && btns.length) { ev.preventDefault(); btns[0].focus(); return true; }
    if (ev.key === 'End' && btns.length) { ev.preventDefault(); btns[btns.length - 1].focus(); return true; }
    return false;
  }

  /* ---------------- calm locator ---------------- */

  function clearLocated() {
    if (ui.locateTimer) { window.clearTimeout(ui.locateTimer); ui.locateTimer = null; }
    Array.prototype.slice.call(root.querySelectorAll('.pm2-located')).forEach(function (n) {
      n.classList.remove('pm2-located');
    });
  }

  function landOn(el2) {
    if (!el2) return;
    clearLocated();
    if (!el2.hasAttribute('tabindex')) el2.setAttribute('tabindex', '-1');
    try { el2.scrollIntoView({ block: 'center' }); } catch (e) { try { el2.scrollIntoView(); } catch (e2) { /* fine */ } }
    try { el2.focus({ preventScroll: true }); } catch (e3) { try { el2.focus(); } catch (e4) { /* fine */ } }
    el2.classList.add('pm2-located');
    /* the highlight decays via CSS when motion is allowed; this removal is
       the single opacity step under reduced motion */
    ui.locateTimer = window.setTimeout(function () {
      el2.classList.remove('pm2-located');
      ui.locateTimer = null;
    }, 2400);
  }

  /* ---------------- width watcher ---------------- */

  function watchWidth() {
    function apply() {
      var w = stage.getBoundingClientRect().width;
      var narrow = w < NARROW_AT;
      var tight = w < TIGHT_AT;
      if (narrow !== ui.narrow || tight !== ui.tight) {
        ui.narrow = narrow;
        ui.tight = tight;
        root.classList.toggle('is-narrow', narrow);
        root.classList.toggle('is-tight', tight);
        renderSheet(false); /* pane composition changes; state is preserved in ui */
      } else {
        root.classList.toggle('is-narrow', narrow);
        root.classList.toggle('is-tight', tight);
      }
      fitTabs();
      updateTabFades();
    }
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { apply(); });
      ro.observe(stage);
    } else {
      window.addEventListener('resize', apply);
    }
    var w0 = stage.getBoundingClientRect().width;
    ui.narrow = w0 < NARROW_AT;
    ui.tight = w0 < TIGHT_AT;
    root.classList.toggle('is-narrow', ui.narrow);
    root.classList.toggle('is-tight', ui.tight);
  }

  /* ================================================================
     HOME — compact: search is in the bar; attention, 12 category tiles,
     recent changes, subordinate utilities.
     ================================================================ */

  function noticeActDest(n) {
    var act = str(obj(n.primary).act);
    var t = obj(n.target);
    var map = {
      'open-lifecycle': { route: 'manager', managerId: 'm.lifecycle' },
      'open-appearance': { route: 'manager', managerId: 'm.appearance' },
      'open-storage': { route: 'manager', managerId: 'm.storage' },
      'open-web': { route: 'dest', cat: 'web', sub: 'providers' },
      'open-usage': { route: 'dest', cat: 'ai', sub: 'usage' },
      'open-provider': { route: 'manager', managerId: 'm.providers' },
      'open-policy': { route: 'dest', cat: 'safety' }
    };
    if (map[act]) return map[act];
    if (act === 'open-changed' || act === 'open-validation') {
      if (t.settingId) return { route: 'setting', settingId: t.settingId };
    }
    if (t.settingId) return { route: 'setting', settingId: t.settingId };
    if (t.cat) return { route: 'dest', cat: t.cat, sub: t.sub || null };
    return null;
  }
  function noticeTrigger(n) {
    var act = str(obj(n.primary).act);
    var names = ['reconnect', 'cleanup-dry-run', 'index-rebuild', 'invoke-test'];
    return names.indexOf(act) >= 0 ? act : null;
  }

  function attentionEntries() {
    var out = [];
    /* Scenario- and fixture-driven notices (pm2-*) join the list; the ambient
       provider notices in the shared demo data already surface inside the
       providers manager, so Home stays a compact 2-4 item instrument. */
    arr(obj(store.data).notices).filter(function (n) {
      return n && str(n.id).indexOf('pm2-') === 0;
    }).forEach(function (n) {
      out.push({
        word: n.statusWord || 'Notice',
        tone: n.kind === 'attention' ? 'attention' : (n.kind === 'setup' ? 'setup' : 'ok'),
        headline: n.headline, consequence: n.consequence,
        dest: noticeActDest(n), trigger: noticeTrigger(n),
        actLabel: obj(n.primary).label || 'Open'
      });
    });
    store.attention().forEach(function (a) {
      out.push({ word: a.statusWord, tone: 'attention', headline: a.headline,
        consequence: a.consequence, dest: a.dest, trigger: null, actLabel: 'Open' });
    });
    var rb = obj(obj(store.data).restartBanner);
    if (rb.active) {
      out.push({ word: 'Restart', tone: 'setup',
        headline: 'A restart finishes ' + arr(rb.items).join(' and '),
        consequence: rb.reason || 'Everything else already applied.',
        dest: { route: 'dest', cat: 'general', sub: 'visual' }, trigger: null, actLabel: 'Review' });
    }
    return out.slice(0, 6);
  }

  function renderHome() {
    var counts = store.counts();
    var attn = attentionEntries();
    var recents = obj(store.data).firstRun ? [] : store.recents();
    var html = '<div class="c11-home">';

    /* attention — compact list */
    if (attn.length) {
      html += '<section class="c11-attn" aria-label="Needs attention"><h2>Needs attention</h2>';
      attn.forEach(function (a, i) {
        html += '<div class="c11-attn-item">' + statusWord(a.tone, a.word) +
          '<div class="c11-attn-main"><div class="c11-attn-head">' + esc(a.headline) + '</div>' +
          '<div class="c11-attn-why">' + esc(a.consequence) + '</div></div>' +
          '<button type="button" class="c11-btn c11-btn-small" data-act="attn-go" data-i="' + i + '">' +
          esc(a.actLabel) + '</button></div>';
      });
      html += '</section>';
    } else {
      html += '<section class="c11-attn is-calm" aria-label="Needs attention">' +
        '<h2>Needs attention</h2><div class="c11-empty">' +
        (obj(store.data).firstRun
          ? 'Nothing yet. Connect a provider under AI &amp; Models to start working.'
          : 'Nothing needs your attention right now.') + '</div></section>';
    }

    /* the 12 category tiles — dominant content */
    html += '<section class="c11-cats" aria-label="Settings categories"><h2>Categories' +
      /* The old wording ("9 tabs above group them") counted tabs the reader
         could not see: the strip drops whole tabs into the More menu as it
         narrows, so at 760 only two or three are on screen. The sentence now
         describes the grouping scheme and the guaranteed way to reach any
         category, both of which are true at every width. */
      '<span class="c11-h-note">' + fmtInt(counts.total) +
      ' settings across 12 categories · the tab strip groups them into 9, and More lists every one</span></h2>' +
      '<div class="c11-tilegrid">';
    arr(counts.byCategory).forEach(function (c) {
      var g = groupForCat(c.id);
      html += '<button type="button" class="c11-tile" data-act="tile-go" data-cat="' + attr(c.id) + '">' +
        '<span class="c11-tile-ico">' + ico(c.icon || 'gear') + '</span>' +
        '<span class="c11-tile-main"><span class="c11-tile-title">' + esc(c.title) + '</span></span>' +
        '<span class="c11-tile-meta">' + fmtInt(c.total) + (c.changed ? ' · ' + fmtInt(c.changed) + ' changed' : '') +
        (g && g.cats.length > 1 ? '<span class="c11-tile-tab">' + esc(g.label) + ' tab</span>' : '') +
        '</span>' +
        /* The description is a sibling of the title, not a child of it: sharing
           the title's flex column meant the nowrap count/tab column stole its
           measure, and the widest metas ("828 · 12 changed" + a tab pill) left
           it a ~148px ribbon that clamped mid-word. On its own full-width row
           it gets the whole card measure and the two lines finish the sentence. */
        (c.desc ? '<span class="c11-tile-desc">' + esc(c.desc) + '</span>' : '') +
        '</button>';
    });
    html += '</div></section>';

    /* recent changes + subordinate utilities */
    html += '<div class="c11-home-cols"><section class="c11-recent" aria-label="Recent changes"><h2>Recent changes</h2>';
    if (recents.length) {
      recents.slice(0, 6).forEach(function (r) {
        html += '<button type="button" class="c11-recent-item" data-act="recent-go" data-id="' + attr(r.settingId) + '">' +
          '<span class="c11-recent-label">' + esc(r.label) + '</span>' +
          '<span class="c11-recent-change">' + esc(r.fromLabel || '—') + ' → ' + esc(r.toLabel || '—') + '</span>' +
          '<span class="c11-recent-when">' + esc(fmtAgo(r.when)) + ' · ' + esc(r.by || 'You') +
          (r.note ? ' · ' + esc(r.note) : '') + '</span></button>';
      });
    } else {
      html += '<div class="c11-empty">No changes yet — this project is running on defaults.</div>';
    }
    html += '</section>';

    html += '<section class="c11-utils" aria-label="Utilities"><h2>Utilities</h2>' +
      '<button type="button" class="c11-util" data-act="util-all">' + ico('list') +
        '<span><b>All Settings</b><i>The complete searchable index — every one of the ' +
        fmtInt(counts.total) + ' settings.</i></span></button>' +
      '<button type="button" class="c11-util" data-act="util-copy">' + ico('copy') +
        '<span><b>Copy Settings</b><i>Bring values over from another project. One-time copy, never a link.</i></span></button>' +
      '<div class="c11-util-note">All settings here apply to the Puppet Master project only.</div>' +
      '</section></div>';

    html += '</div>';
    els.sheet.innerHTML = html;
    hydrate(els.sheet);
    els.sheet._attn = attn;
  }

  /* ================================================================
     DOMAIN SHEETS — subgroup sub-tabs, related-manager strip, rows.
     ================================================================ */

  function renderDomain(cat, focusSub) {
    var c = catById(cat);
    if (!c) { renderMissing('That category does not exist.'); return; }
    var group = groupForCat(cat);
    var counts = store.counts();
    var cc = null;
    arr(counts.byCategory).forEach(function (x) { if (x.id === cat) cc = x; });
    var activeSub = focusSub !== undefined && focusSub !== null ? focusSub : (ui.domSub[cat] || '');
    ui.domSub[cat] = activeSub;

    var html = '<div class="c11-domain" data-cat="' + attr(cat) + '">';

    /* category lens: grouped tabs keep both member categories first-class */
    if (group && group.cats.length > 1) {
      html += '<div class="c11-lens" role="tablist" aria-label="Categories in this tab">';
      group.cats.forEach(function (cid) {
        var lc = catById(cid);
        html += '<button type="button" class="c11-lens-btn' + (cid === cat ? ' is-active' : '') +
          '" role="tab" aria-selected="' + (cid === cat) + '" data-act="lens-go" data-cat="' + attr(cid) + '">' +
          esc(lc ? lc.title : cid) + '</button>';
      });
      html += '</div>';
    }

    html += '<header class="c11-dom-head"><span class="c11-dom-ico">' + ico(c.icon || 'gear') + '</span>' +
      '<div><h1>' + esc(c.title) + '</h1><p>' + esc(c.desc || '') + '</p></div>' +
      '<span class="c11-dom-counts">' + (cc ? fmtInt(cc.total) + ' settings' +
        (cc.changed ? ' · ' + fmtInt(cc.changed) + ' changed' : '') : '') + '</span></header>';

    /* related managers — navigation strip, not recommendations */
    var defs = managers().byCat(cat);
    if (defs.length) {
      var shown = defs.filter(function (d2) { return d2.status === 'demonstrated'; });
      var shells = defs.filter(function (d2) { return d2.status === 'deferred_named_owner'; });
      html += '<nav class="c11-mgr-strip" aria-label="Managers for ' + attr(c.title) + '">' +
        '<span class="c11-strip-label">Managers</span><div class="c11-strip-scroll">';
      shown.concat(shells).forEach(function (d2) {
        html += '<button type="button" class="c11-mgr-chip' +
          (d2.status === 'deferred_named_owner' ? ' is-reserved' : '') + '" data-act="mgr-go" ' +
          'data-manager="' + attr(d2.id) + '" title="' + attr(d2.blurb || d2.title) + '">' +
          ico(d2.icon || 'gear') + '<span>' + esc(d2.title) + '</span>' +
          (d2.status === 'deferred_named_owner' ? '<em>reserved</em>' : '') + '</button>';
      });
      html += '</div></nav>';
    }

    /* subgroup sub-tabs */
    html += '<div class="c11-subtabs" role="tablist" aria-label="Sections">' +
      '<button type="button" class="c11-subtab' + (activeSub === '' ? ' is-active' : '') +
      '" role="tab" aria-selected="' + (activeSub === '') + '" data-act="sub-go" data-sub="">All sections</button>';
    arr(c.subgroups).forEach(function (g2) {
      html += '<button type="button" class="c11-subtab' + (activeSub === g2.id ? ' is-active' : '') +
        '" role="tab" aria-selected="' + (activeSub === g2.id) + '" data-act="sub-go" data-sub="' + attr(g2.id) + '">' +
        esc(g2.title) + '</button>';
    });
    html += '</div>';

    /* sections */
    arr(c.subgroups).forEach(function (g2) {
      if (activeSub && activeSub !== g2.id) return;
      html += subgroupSectionHtml(cat, g2);
    });

    html += '</div>';
    els.sheet.innerHTML = html;
    hydrate(els.sheet);
  }

  function subgroupSectionHtml(cat, g2) {
    var rows = store.rowsFor(cat, g2.id) || [];
    var essential = [], advanced = [];
    rows.forEach(function (r) {
      if (!r) return;
      if (r.tier === 'advanced' && !r.changedFromDefault && r.state === 'normal') advanced.push(r);
      else essential.push(r);
    });
    /* keep visible groups ~4-8: overflow of untouched simple rows folds into
       the same disclosure as the advanced tier */
    if (essential.length > 9) {
      var keep = essential.slice(0, 8);
      advanced = essential.slice(8).concat(advanced);
      essential = keep;
    }
    var advKey = cat + '/' + g2.id;
    var open = !!ui.advOpen[advKey];
    var html = '<section class="c11-sec" data-section="' + attr(g2.id) + '">' +
      '<h2>' + esc(g2.title) + '</h2>' +
      (g2.desc ? '<p class="c11-sec-desc">' + esc(g2.desc) + '</p>' : '');
    essential.forEach(function (r) { html += rowHtml(r); });
    if (advanced.length) {
      html += '<button type="button" class="c11-adv-toggle" data-act="adv-toggle" data-key="' + attr(advKey) +
        '" aria-expanded="' + open + '">' + ico(open ? 'minus' : 'plus') +
        '<span>' + (open ? 'Hide' : 'Show') + ' ' + advanced.length + ' more (advanced &amp; unchanged)</span></button>';
      if (open) {
        html += '<div class="c11-adv-rows">';
        advanced.forEach(function (r) { html += rowHtml(r); });
        html += '</div>';
      }
    }
    /* grafted extra demo rows (legacy dataset) for this subgroup */
    Object.keys(EXTRA_ROWS).forEach(function (id) {
      var ph = EXTRA_ROWS[id];
      if (ph.cat === cat && ph.sub === g2.id) {
        var rec = extraRecord(id);
        if (rec) html += extraRowHtml(rec);
      }
    });
    html += '</section>';
    return html;
  }

  /* ---------------- ordinary setting rows ---------------- */

  function rowHtml(r) {
    var stateAttr = r.state && r.state !== 'normal' ? ' data-state="' + attr(r.state) + '"' : '';
    var html = '<div class="c11-row" data-setting-id="' + attr(r.id) + '" tabindex="-1"' + stateAttr + '>' +
      '<div class="c11-row-main"><div class="c11-row-label">' + esc(r.label);
    arr(r.badges).forEach(function (b) { html += ' <span class="c11-badge">' + esc(b) + '</span>'; });
    html += '</div><div class="c11-row-desc">' + esc(r.desc) + '</div>';
    if (r.stateNote) {
      var tone = r.state === 'error' ? 'attention' : (r.state === 'managed' ? 'muted' : 'setup');
      html += '<div class="c11-row-note" data-tone="' + attr(tone) + '">' + esc(r.stateNote) + '</div>';
    }
    html += '</div><div class="c11-row-side">' + controlHtml(r) +
      '<button type="button" class="c11-row-more" data-act="row-details" data-id="' + attr(r.id) +
      '" aria-expanded="' + (ui.rowDrawer === r.id) + '" title="Details">' + ico('info') + '</button></div>';
    if (ui.rowDrawer === r.id) html += rowDrawerHtml(r);
    html += '</div>';
    return html;
  }

  function controlHtml(r) {
    var t = r.control.type;
    var locked = r.state === 'managed' || r.state === 'unavailable';
    var dis = locked ? ' disabled' : '';
    if (t === 'toggle') {
      var on = r.value === true || r.value === 'on';
      return '<button type="button" class="c11-switch' + (on ? ' is-on' : '') + '" role="switch" aria-checked="' + on +
        '" data-act="row-toggle" data-id="' + attr(r.id) + '" aria-label="' + attr(r.label) + '"' + dis + '>' +
        '<span class="c11-switch-knob"></span></button>' + rowChips(r, true);
    }
    if (t === 'select' || t === 'radio') {
      return '<button type="button" class="c11-valbtn" data-act="row-select" data-id="' + attr(r.id) +
        '" aria-haspopup="menu" aria-expanded="false"' + dis + '>' +
        '<span>' + esc(r.valueLabel || 'Choose…') + '</span>' + ico('more') + '</button>' + rowChips(r, true);
    }
    if (t === 'multiselect') {
      return '<button type="button" class="c11-valbtn" data-act="row-multi" data-id="' + attr(r.id) +
        '" aria-haspopup="menu" aria-expanded="false"' + dis + '>' +
        '<span>' + esc(r.valueLabel || 'Choose…') + '</span>' + ico('more') + '</button>' + rowChips(r, true);
    }
    if (t === 'number') {
      var min = r.control.min != null ? ' min="' + r.control.min + '"' : '';
      var max = r.control.max != null ? ' max="' + r.control.max + '"' : '';
      return '<span class="c11-numwrap"><input type="number" class="c11-num" data-role="row-number" data-id="' + attr(r.id) +
        '" value="' + attr(r.value == null ? '' : r.value) + '"' + min + max + dis +
        ' aria-label="' + attr(r.label) + '"></span>' + changedMark(r) + rowChips(r, true);
    }
    if (t === 'slider') {
      var lo = r.control.min != null ? r.control.min : 0;
      var hi = r.control.max != null ? r.control.max : 100;
      var step = (hi - lo) <= 1 ? 0.05 : 1;
      if (typeof r.value !== 'number') {
        /* sliders that store display strings act like selects here */
        return '<span class="c11-valtext">' + esc(r.valueLabel || String(r.value == null ? '' : r.value)) + '</span>' + rowChips(r, true);
      }
      return '<span class="c11-sliderwrap"><input type="range" class="c11-slider" data-role="row-slider" data-id="' + attr(r.id) +
        '" value="' + attr(r.value) + '" min="' + lo + '" max="' + hi + '" step="' + step + '"' + dis +
        ' aria-label="' + attr(r.label) + '"><span class="c11-slider-val">' + esc(r.valueLabel) + '</span></span>' +
        changedMark(r) + rowChips(r, true);
    }
    if (t === 'text' || t === 'path') {
      return '<span class="c11-textwrap"><input type="text" class="c11-text" data-role="row-text" data-id="' + attr(r.id) +
        '" value="' + attr(r.value == null ? '' : r.value) + '"' + dis +
        ' aria-label="' + attr(r.label) + '" placeholder="Not set"></span>' + changedMark(r) + rowChips(r, true, true);
    }
    if (t === 'action') {
      return '<button type="button" class="c11-btn c11-btn-small" data-act="row-action" data-id="' + attr(r.id) + '"' + dis + '>' +
        esc(r.valueLabel || 'Open') + '</button>' + rowChips(r, false);
    }
    /* list / keyvalue: summary chip + details drawer holds the entries */
    return '<button type="button" class="c11-valbtn" data-act="row-details" data-id="' + attr(r.id) + '"' + dis + '>' +
      '<span>' + esc(r.valueLabel || 'View') + '</span>' + ico('eye') + '</button>' + rowChips(r, false);
  }

  /* Input-style controls show the value in the field itself; this small mark
     keeps changed-from-default visible without repeating the value. */
  function changedMark(r) {
    if (!r.changedFromDefault || r.state === 'managed' || r.state === 'unavailable') return '';
    return chipHtml('custom', 'Changed');
  }

  function rowChips(r, skipValue, skipNotSet) {
    var html = '';
    arr(r.chips).forEach(function (ch) {
      if (skipValue && (ch.kind === 'default' || ch.kind === 'custom')) return;
      if (skipNotSet && ch.kind === 'not-configured') return;
      html += chipHtml(ch.kind, ch.label);
    });
    return html ? '<span class="c11-chips">' + html + '</span>' : '';
  }

  function rowDrawerHtml(r) {
    var d = obj(r.detail);
    var html = '<div class="c11-row-drawer">';
    html += '<div class="c11-dr-line"><b>Current value</b><span>' + esc(r.valueLabel || 'Not set') + '</span></div>';
    if (r.recommended !== undefined) {
      html += '<div class="c11-dr-line"><b>Recommended</b><span>' + esc(String(r.recommended)) + '</span></div>';
    }
    if (r.stateNote) html += '<div class="c11-dr-line"><b>Why</b><span>' + esc(r.stateNote) + '</span></div>';
    if ((r.control.type === 'list' || r.control.type === 'keyvalue') && r.value != null) {
      html += '<div class="c11-dr-line"><b>Entries</b><span class="c11-dr-entries">';
      if (Array.isArray(r.value)) {
        html += r.value.length ? esc(r.value.map(function (v) { return typeof v === 'string' ? v : JSON.stringify(v); }).join(' · ')) : 'None';
      } else {
        var ks = Object.keys(obj(r.value));
        html += ks.length ? esc(ks.map(function (k) { return k + ' = ' + String(r.value[k]); }).join(' · ')) : 'None';
      }
      html += '</span></div><div class="c11-dr-line"><b>Editing</b><span>Collection editing belongs to the full product; this concept shows the current entries honestly and leaves them read-only.</span></div>';
    }
    if (d.legacyScopeNote) html += '<div class="c11-dr-line"><b>History</b><span>' + esc(d.legacyScopeNote) + '</span></div>';
    if (arr(d.related).length) {
      html += '<div class="c11-dr-line"><b>Related</b><span>' + esc(arr(d.related).join(' · ')) + '</span></div>';
    }
    html += '</div>';
    return html;
  }

  /* Extra (legacy-dataset) rows: honest concept-local rendering. */
  function extraRowHtml(rec) {
    var html = '<div class="c11-row" data-setting-id="' + attr(rec.id) + '" tabindex="-1">' +
      '<div class="c11-row-main"><div class="c11-row-label">' + esc(rec.label) + '</div>' +
      '<div class="c11-row-desc">' + esc(rec.desc || '') + '</div></div><div class="c11-row-side">';
    if (rec.type === 'select' && arr(rec.options).length) {
      html += '<button type="button" class="c11-valbtn" data-act="extra-select" data-id="' + attr(rec.id) +
        '" aria-haspopup="menu" aria-expanded="false"><span>' + esc(str(rec.value) || str(rec['default']) || 'Choose…') +
        '</span>' + ico('more') + '</button>';
    } else if (rec.type === 'action') {
      html += '<button type="button" class="c11-btn c11-btn-small" data-act="extra-action" data-id="' + attr(rec.id) + '">' +
        esc(str(rec.value) || 'Open') + '</button>';
    } else {
      html += '<span class="c11-valtext">' + esc(str(rec.value)) + '</span>';
    }
    html += '</div></div>';
    return html;
  }

  /* ---------------- value writes ---------------- */

  function setValue(id, v) {
    var res = store.setValue(id, v, { source: 'settings' });
    if (!res.ok) {
      showRowError(id, res.error);
      return false;
    }
    return true;
  }

  function showRowError(id, msg) {
    var row = els.sheet.querySelector('[data-setting-id="' + cssEscape(id) + '"]');
    if (!row) { toast(msg); return; }
    var old = row.querySelector('.c11-row-err');
    if (old) old.parentNode.removeChild(old);
    var div = document.createElement('div');
    div.className = 'c11-row-err';
    div.setAttribute('role', 'alert');
    div.textContent = msg;
    var main = row.querySelector('.c11-row-main');
    if (main) main.appendChild(div); else row.appendChild(div);
  }

  function cssEscape(s) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(s);
    return String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function toast(msg) {
    try { if (window.PMShell && window.PMShell.toast) window.PMShell.toast(msg); } catch (e) { /* quiet */ }
  }

  /* re-render the current sheet, preserving scroll and (best-effort) focus */
  function refreshSheet() {
    var scrollTop = stage.scrollTop;
    var focusId = null;
    var ael = document.activeElement;
    if (ael && els.sheet.contains(ael)) {
      var host = ael.closest ? ael.closest('[data-setting-id]') : null;
      if (host) focusId = host.getAttribute('data-setting-id');
    }
    renderSheet(false);
    stage.scrollTop = scrollTop;
    if (focusId) {
      var back = els.sheet.querySelector('[data-setting-id="' + cssEscape(focusId) + '"]');
      if (back) { try { back.focus({ preventScroll: true }); } catch (e) { /* fine */ } }
    }
  }

  /* ---------------- setting landing ---------------- */

  function openSettingDest(settingId, done) {
    var s = settingById(settingId);
    var x = EXTRA_ROWS[settingId];
    if (!s && !x) {
      renderMissing('“' + settingId + '” is not in this project’s settings. It may have been renamed or retired in a newer inventory — try the search box above, or browse All Settings to find its replacement.');
      if (done) done();
      return;
    }
    var cat = s ? s.cat : x.cat;
    var sub = s ? s.sub : x.sub;
    /* land inside the subgroup sub-tab so the row is definitely present */
    ui.domSub[cat] = sub;
    if (s && s.tier === 'advanced') {
      var row = store.resolveRow(settingId);
      if (row && !row.changedFromDefault && row.state === 'normal') ui.advOpen[cat + '/' + sub] = true;
      /* essential-overflow rows also live behind the disclosure; open it
         whenever the row is not among the first eight of its subgroup */
      var rowsAll = store.rowsFor(cat, sub) || [];
      for (var i = 0; i < rowsAll.length; i++) {
        if (rowsAll[i] && rowsAll[i].id === settingId && i >= 8) { ui.advOpen[cat + '/' + sub] = true; break; }
      }
    } else if (s) {
      var rows2 = store.rowsFor(cat, sub) || [];
      for (var j = 0; j < rows2.length; j++) {
        if (rows2[j] && rows2[j].id === settingId && j >= 8) { ui.advOpen[cat + '/' + sub] = true; break; }
      }
    }
    renderDomain(cat, sub);
    renderChrome();
    var target = els.sheet.querySelector('[data-setting-id="' + cssEscape(settingId) + '"]');
    landOn(target);
    if (done) done();
  }

  function renderMissing(msg) {
    els.sheet.innerHTML = '<div class="c11-missing">' +
      '<h1>Not here</h1><p>' + esc(msg) + '</p>' +
      '<div class="c11-missing-acts">' +
      '<button type="button" class="c11-btn" data-act="util-all">Browse All Settings</button>' +
      '<button type="button" class="c11-btn c11-btn-quiet" data-act="go-home" data-pm2-back>Back to Home</button></div></div>';
    hydrate(els.sheet);
  }

  /* ================================================================
     MANAGERS — lazy view models rendered as sheets in the pile.
     Generic section renderers cover every archetype; m.providers gets the
     roster + provider-detail-tab composition; deferred owner shells render
     an honest insertion page.
     ================================================================ */

  function renderManager(managerId, objectId, tab, sectionHint) {
    var def = managerById(managerId);
    if (!def) { renderMissing('No manager called “' + managerId + '” exists.'); return; }
    if (def.status === 'deferred_named_owner') { renderDeferredShell(def); return; }
    var vm = safeModel(def);
    if (!vm) { renderMissing('The ' + def.title + ' manager could not load its data.'); return; }
    if (def.id === 'm.providers') { renderProviders(def, vm, objectId, tab, sectionHint); return; }
    /* several shared defs address objects via dest.sectionId rather than the
       route objectId (m.sounds, m.notifications, ...) — either works here */
    renderGenericManager(def, vm, objectId || sectionHint);
  }

  function managerHeadHtml(def, vm, extra) {
    return '<header class="c11-mgr-head"><span class="c11-mgr-ico">' + ico(def.icon || 'gear') + '</span>' +
      '<div class="c11-mgr-headmain"><h1>' + esc(vm.title || def.title) + '</h1>' +
      '<p>' + esc(def.blurb || vm.blurb || '') + '</p>' +
      (vm.summary ? '<div class="c11-mgr-summary">' + esc(vm.summary) + '</div>' : '') + '</div>' +
      (extra || '') + actionsButtonHtml(def) + '</header>';
  }

  function actionsButtonHtml(def) {
    var acts = safeActions(def);
    if (!acts.length) return '';
    return '<button type="button" class="c11-btn" data-act="mgr-actions" data-manager-id="' + attr(def.id) +
      '" aria-haspopup="menu" aria-expanded="false">' + ico('bolt') + '<span>Actions</span></button>';
  }

  function openActionsMenu(invoker, def) {
    var acts = safeActions(def);
    var items = acts.map(function (a) {
      return { id: a.id, label: a.label, disabled: a.available === false,
        note: a.available === false ? (a.reason || 'Not available right now') : null, _run: a.run };
    });
    openMenu(invoker, items, {
      title: def.title + ' actions',
      onPick: function (it) {
        if (typeof it._run === 'function') {
          try { it._run(store); } catch (e) { toast('That action could not run.'); }
        }
      }
    });
  }

  function renderGenericManager(def, vm, objectId) {
    var html = '<div class="c11-mgr" data-manager-sheet="' + attr(def.id) + '">' + managerHeadHtml(def, vm);
    arr(vm.sections).forEach(function (sec) { html += sectionHtml(def, sec); });
    if (!arr(vm.sections).length) {
      html += '<div class="c11-empty">Nothing to manage here yet.</div>';
    }
    html += '</div>';
    els.sheet.innerHTML = html;
    hydrate(els.sheet);
    if (objectId) {
      var target = els.sheet.querySelector('[data-object-id="' + cssEscape(objectId) + '"]');
      if (target) {
        /* open its disclosure so the landing shows real content */
        var key = def.id + '/' + objectId;
        if (!ui.secOpen[key]) { ui.secOpen[key] = true; renderGenericManager(def, vm, null); target = els.sheet.querySelector('[data-object-id="' + cssEscape(objectId) + '"]'); }
        landOn(target);
      }
    }
  }

  /* ---------------- generic section renderers ---------------- */

  function sectionHtml(def, sec) {
    if (!sec) return '';
    var html = '<section class="c11-msec' + (sec.advanced ? ' is-advanced' : '') + '" data-section="' + attr(sec.id) + '">' +
      '<h2>' + esc(sec.title || '') + '</h2>' +
      (sec.note ? '<p class="c11-sec-desc">' + esc(sec.note) + '</p>' : '');
    if (sec.loading) {
      html += '<div class="c11-inline-refresh"><span class="c11-spin" aria-hidden="true"></span>' +
        esc(obj(sec.loading).note || 'Refreshing…') + '</div>';
    }
    var kind = sec.kind;
    if (kind === 'overview') html += overviewHtml(def, sec);
    else if (kind === 'form') html += formHtml(def, sec);
    else if (kind === 'roster') html += rosterHtml(def, sec);
    else if (kind === 'table') html += tableHtml(def, sec);
    else if (kind === 'steps') html += stepsHtml(def, sec);
    else if (kind === 'log') html += logHtml(def, sec);
    else if (kind === 'health') html += healthHtml(def, sec);
    else if (kind === 'preview') html += previewHtml(def, sec);
    else html += overviewHtml(def, sec);
    html += '</section>';
    return html;
  }

  function destBtn(dest, label) {
    if (!dest) return '';
    return '<button type="button" class="c11-jump" data-act="dest-go" data-hash="' + attr(destHash(dest)) + '" ' +
      'title="' + attr(label || 'Open') + '">' + ico('external') + '</button>';
  }

  function fieldLine(def, f) {
    var v = f.valueLabel != null ? f.valueLabel : (f.value == null ? '—' : String(f.value));
    var tone = f.tone ? statusWord(f.tone, '') : '';
    return '<div class="c11-line"' + (f.settingId ? ' data-setting-ref="' + attr(f.settingId) + '"' : '') + '>' +
      '<span class="c11-line-label">' + esc(f.label || '') + '</span>' +
      '<span class="c11-line-value">' + esc(v) + tone + '</span>' +
      (f.note ? '<span class="c11-line-note">' + esc(f.note) + '</span>' : '') +
      destBtn(f.dest, 'Open ' + (f.label || '')) + '</div>';
  }

  function overviewHtml(def, sec) {
    var list = arr(sec.items).length ? sec.items : arr(sec.rows);
    var html = '<div class="c11-lines">';
    if (sec.status) html += '<div class="c11-line"><span class="c11-line-label">Status</span><span class="c11-line-value">' +
      statusWord(sec.status.tone, sec.status.label) + '</span>' +
      (sec.status.note ? '<span class="c11-line-note">' + esc(sec.status.note) + '</span>' : '') + '</div>';
    arr(list).forEach(function (it) { html += fieldLine(def, it); });
    if (!arr(list).length && !sec.status) html += '<div class="c11-empty">Nothing here yet.</div>';
    html += '</div>';
    if (arr(sec.whatNext).length) {
      html += '<div class="c11-whatnext"><b>When included usage runs out</b><ol>';
      arr(sec.whatNext).forEach(function (s2) { html += '<li>' + esc(s2.label) + '</li>'; });
      html += '</ol></div>';
    }
    return html;
  }

  function formHtml(def, sec) {
    var html = '<div class="c11-lines">';
    arr(sec.fields).forEach(function (f) { html += fieldLine(def, f); });
    if (!arr(sec.fields).length) html += '<div class="c11-empty">Nothing here yet.</div>';
    html += '</div>';
    return html;
  }

  function rosterItemHtml(def, it) {
    var oid = str(it.id);
    var key = def.id + '/' + oid;
    var open = !!ui.secOpen[key];
    var st = obj(it.status);
    var flags = obj(it.flags);
    var html = '<div class="c11-ritem' + (flags.selected ? ' is-selected' : '') + '" data-object-id="' + attr(oid) + '" tabindex="-1">' +
      '<div class="c11-ritem-top">' +
      '<div class="c11-ritem-main"><span class="c11-ritem-label">' + esc(it.label || oid) + '</span>' +
      (it.sub ? '<span class="c11-ritem-sub">' + esc(it.sub) + '</span>' : '') + '</div>' +
      (st.label ? statusWord(st.tone, st.label) : '') +
      flagChips(flags) +
      (it.detail || st.note || it.shadowNote || it.manualOnlyReason || arr(it.actions).length
        ? '<button type="button" class="c11-row-more" data-act="ritem-toggle" data-key="' + attr(key) +
          '" aria-expanded="' + open + '" title="Detail">' + ico(open ? 'minus' : 'plus') + '</button>'
        : '') +
      (it.dest ? destBtn(it.dest, 'Open ' + (it.label || '')) : '') +
      '</div>';
    if (st.note) html += '<div class="c11-ritem-note">' + esc(st.note) + '</div>';
    if (it.shadowNote) html += '<div class="c11-ritem-note" data-tone="setup">' + esc(it.shadowNote) + '</div>';
    if (it.manualOnlyReason) html += '<div class="c11-ritem-note" data-tone="muted">' + esc(it.manualOnlyReason) + '</div>';
    if (open) {
      html += '<div class="c11-ritem-detail">';
      if (arr(it.actions).length) {
        html += '<div class="c11-ritem-acts">';
        arr(it.actions).forEach(function (a) {
          if (a && a.id && a.label && a.id !== 'details') {
            html += '<button type="button" class="c11-btn c11-btn-small" data-act="inst-act" data-instact="' +
              attr(a.id) + '" data-oid="' + attr(oid) + '">' + esc(a.label) + '</button>';
          }
        });
        html += '</div>';
      }
      html += kvDumpHtml(it.detail || it.meta) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function flagChips(flags) {
    var html = '';
    if (flags.selected) html += chipHtml('recommended', 'In use');
    if (flags.shadowed) html += chipHtml('differs', 'Shadowed');
    if (flags.manualOnly) html += chipHtml('managed', 'Manual only');
    if (flags.busy) html += chipHtml('auto', 'Working…');
    if (flags.favorite) html += chipHtml('recommended', 'Favorite');
    if (flags.hidden) html += chipHtml('not-configured', 'Hidden');
    return html;
  }

  /* Humanized key-value dump for detail disclosures: technical values are
     intentionally visible here (this is the advanced drawer). */
  function kvDumpHtml(d) {
    if (d == null) return '';
    var html = '<div class="c11-kv">';
    var wrote = false;
    Object.keys(obj(d)).forEach(function (k) {
      var v = d[k];
      if (v == null || k === 'dest') return;
      var shown;
      if (Array.isArray(v)) {
        if (!v.length) return;
        shown = v.map(function (x) {
          if (x == null) return '';
          if (typeof x === 'object') {
            return Object.keys(x).map(function (kk) { return kk + ': ' + String(x[kk]); }).join(', ');
          }
          return String(x);
        }).join(' · ');
      } else if (typeof v === 'object') {
        var pairs = Object.keys(v).filter(function (kk) { return v[kk] != null && typeof v[kk] !== 'object'; })
          .map(function (kk) { return kk + ': ' + String(v[kk]); });
        if (!pairs.length) return;
        shown = pairs.join(' · ');
      } else {
        shown = String(v);
      }
      if (shown === '') return;
      wrote = true;
      html += '<div class="c11-kv-line"><span>' + esc(humanKey(k)) + '</span><span>' + esc(shown) + '</span></div>';
    });
    html += '</div>';
    return wrote ? html : '';
  }

  function humanKey(k) {
    return String(k).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ')
      .toLowerCase().replace(/^./, function (c) { return c.toUpperCase(); });
  }

  function rosterHtml(def, sec) {
    var html = '';
    if (arr(sec.groups).length) {
      arr(sec.groups).forEach(function (g) {
        html += '<h3 class="c11-rgroup">' + esc(g.label || '') + '</h3>';
        arr(g.items).forEach(function (it) { html += rosterItemHtml(def, it); });
      });
    } else {
      arr(sec.items).forEach(function (it) { html += rosterItemHtml(def, it); });
      if (!arr(sec.items).length) {
        html += '<div class="c11-empty">' + esc(sec.emptyNote || 'Nothing here yet.') + '</div>';
      }
    }
    return html;
  }

  function tableHtml(def, sec) {
    /* Shape-tolerant: columns are strings OR {id,label}; rows live under
       sec.rows OR sec.items; cells are an array OR an object keyed by
       column id. (The shared managers use every combination.) */
    var cols = arr(sec.columns).map(function (c, i) {
      return (typeof c === 'string') ? { id: 'col' + i, label: c } : obj(c);
    });
    var rows = arr(sec.rows).length ? arr(sec.rows) : arr(sec.items);
    if (!rows.length) return '<div class="c11-empty">' + esc(sec.emptyNote || 'Nothing here yet.') + '</div>';
    function cellVal(r, c, ci) {
      if (Array.isArray(r.cells)) return r.cells[ci];
      if (r.cells && typeof r.cells === 'object') return r.cells[c.id];
      return ci === 0 ? (r.label || r.id) : null;
    }
    var html = '<div class="c11-tablewrap"><table class="c11-table"><thead><tr>';
    cols.forEach(function (c) { html += '<th>' + esc(c.label) + '</th>'; });
    html += '<th></th></tr></thead><tbody>';
    rows.forEach(function (r) {
      var key = def.id + '/' + r.id;
      var open = !!ui.secOpen[key];
      html += '<tr data-object-id="' + attr(r.id) + '" tabindex="-1">';
      cols.forEach(function (c, ci) {
        var v = cellVal(r, c, ci);
        if (ci === 0) {
          html += '<td><b>' + esc(v == null ? '—' : v) + '</b>' + flagChips(obj(r.flags)) +
            (r.note || r.stateNote ? '<div class="c11-td-note">' + esc(r.note || r.stateNote) + '</div>' : '') + '</td>';
        } else {
          html += '<td>' + esc(v == null ? '—' : v) + '</td>';
        }
      });
      html += '<td class="c11-td-acts">' +
        (r.detail ? '<button type="button" class="c11-row-more" data-act="ritem-toggle" data-key="' + attr(key) +
          '" aria-expanded="' + open + '" title="Detail">' + ico(open ? 'minus' : 'plus') + '</button>' : '') +
        (r.dest && r.dest.route === 'setting' ? destBtn(r.dest, 'Open setting') : '') +
        '</td></tr>';
      if (open && r.detail) {
        html += '<tr class="c11-tr-detail"><td colspan="' + (cols.length + 1) + '">' + kvDumpHtml(r.detail) +
          (r.routing && r.routing.differs ? '<div class="c11-ritem-note" data-tone="setup">Requested ' +
            esc(r.routing.requested || '') + ' currently routes to ' + esc(r.routing.effective || '') +
            (r.routing.why ? ' — ' + esc(r.routing.why) : '') + '</div>' : '') +
          '</td></tr>';
      }
    });
    html += '</tbody></table></div>';
    return html;
  }

  function stepsHtml(def, sec) {
    var html = '';
    if (sec.officialSource) {
      html += '<div class="c11-line"><span class="c11-line-label">Official source</span><span class="c11-line-value">' +
        esc(sec.officialSource) + '</span></div>';
    }
    if (sec.policyNote) html += '<div class="c11-callout">' + esc(sec.policyNote) + '</div>';
    if (arr(sec.hostChoices).length) {
      html += '<div class="c11-line"><span class="c11-line-label">Install for</span><span class="c11-line-value">' +
        '<span class="c11-hostchoices">';
      arr(sec.hostChoices).forEach(function (h, i) {
        html += '<label class="c11-hostchoice"><input type="radio" name="c11host-' + attr(sec.id) + '" value="' + attr(h.id) + '"' +
          (i === 0 ? ' checked' : '') + '><span>' + esc(h.label) + '</span></label>';
      });
      html += '</span></span></div>';
    }
    html += '<ol class="c11-steps">';
    arr(sec.steps).forEach(function (s2) {
      var label = s2.label || s2.title || '';
      var detail = s2.detail || s2.note || '';
      html += '<li><b>' + esc(label) + '</b>' + (detail ? '<span>' + esc(detail) + '</span>' : '') + '</li>';
    });
    html += '</ol>';
    return html;
  }

  function logHtml(def, sec) {
    var html = '';
    if (arr(sec.sources).length) {
      arr(sec.sources).forEach(function (s2) { html += rosterItemHtml(def, s2); });
    }
    if (arr(sec.items).length) {
      arr(sec.items).forEach(function (s2) { html += rosterItemHtml(def, s2); });
    }
    var entries = arr(sec.entries);
    var plain = arr(sec.log);
    if (entries.length) {
      html += '<div class="c11-log">';
      entries.slice(0, 30).forEach(function (e2) {
        html += '<div class="c11-log-line"' + (e2.tone ? ' data-tone="' + attr(e2.tone) + '"' : '') + '>' +
          (e2.at ? '<span class="c11-log-at">' + esc(String(e2.at)) + '</span>' : '') +
          '<span class="c11-log-what">' + esc(e2.label || '') +
          (e2.detail ? ' — ' + esc(e2.detail) : '') + '</span></div>';
      });
      html += '</div>';
    } else if (plain.length) {
      html += '<div class="c11-log">';
      plain.slice(0, 30).forEach(function (line) {
        html += '<div class="c11-log-line"><span class="c11-log-what">' + esc(String(line)) + '</span></div>';
      });
      html += '</div>';
    } else if (!arr(sec.sources).length && !arr(sec.items).length) {
      html += '<div class="c11-empty">' + esc(sec.emptyNote || 'Nothing recorded yet.') + '</div>';
    }
    return html;
  }

  function healthHtml(def, sec) {
    var list = arr(sec.checks).length ? sec.checks : arr(sec.items);
    if (!arr(list).length) return '<div class="c11-empty">' + esc(sec.emptyNote || 'Nothing to check yet.') + '</div>';
    var html = '<div class="c11-lines">';
    arr(list).forEach(function (c) {
      var tone = c.tone || (c.state === 'normal' || c.state === 'ok' ? 'ok' : (c.state === 'warning' ? 'setup' : (c.state ? 'attention' : 'muted')));
      var stateLabel = typeof c.state === 'string' && c.state !== 'normal' && c.state !== 'ok' && c.state !== 'warning'
        ? c.state : (tone === 'ok' ? 'OK' : tone === 'setup' ? 'Check' : 'Attention');
      html += '<div class="c11-line"><span class="c11-line-label">' + esc(c.label || '') + '</span>' +
        '<span class="c11-line-value">' + statusWord(tone, stateLabel) + '</span>' +
        (c.note ? '<span class="c11-line-note">' + esc(c.note) + '</span>' : '') +
        destBtn(c.dest, 'Open') + '</div>';
    });
    html += '</div>';
    return html;
  }

  function previewHtml(def, sec) {
    var html = '';
    if (sec.state) {
      html += '<div class="c11-line"><span class="c11-line-label">State</span><span class="c11-line-value">' +
        esc(sec.state === 'staged' ? 'Staged — waiting for review' :
            sec.state === 'rolled-back' ? 'Rolled back' :
            sec.state === 'applied' ? 'Applied' :
            sec.state === 'dormant' ? 'No import staged' :
            sec.state === 'never-run' ? 'Never run' :
            sec.state === 'complete' ? 'Complete' : String(sec.state)) + '</span></div>';
    }
    if (sec.summary) {
      html += '<div class="c11-line"><span class="c11-line-label">Summary</span><span class="c11-line-value">' +
        esc(String(sec.summary)) + '</span></div>';
    }
    if (arr(sec.skipped).length) {
      html += '<h3 class="c11-rgroup">Always skipped</h3>';
      arr(sec.skipped).forEach(function (sk) {
        var label = (sk && typeof sk === 'object') ? (sk.label || sk.path || sk.id || '') : String(sk);
        var why = (sk && typeof sk === 'object') ? (sk.reason || sk.note || '') : '';
        html += '<div class="c11-line"><span class="c11-line-label">' + esc(label) + '</span>' +
          (why ? '<span class="c11-line-note">' + esc(why) + '</span>' : '') + '</div>';
      });
    }
    if (sec.source) {
      html += '<div class="c11-line"><span class="c11-line-label">Source</span><span class="c11-line-value">' +
        esc(obj(sec.source).file || '') + '</span><span class="c11-line-note">' +
        esc(obj(sec.source).mode || '') + (obj(sec.source).createdOn ? ' · created ' + esc(sec.source.createdOn) : '') + '</span></div>';
    }
    if (sec.counts) {
      var cts = obj(sec.counts);
      html += '<div class="c11-countchips">';
      Object.keys(cts).forEach(function (k) {
        if (typeof cts[k] === 'number' && cts[k] > 0) html += chipHtml(k === 'conflict' ? 'differs' : 'custom', humanKey(k) + ': ' + cts[k]);
      });
      html += '</div>';
    }
    if (arr(sec.conflicts).length) {
      html += '<h3 class="c11-rgroup">Conflicts</h3>';
      arr(sec.conflicts).forEach(function (c) {
        html += '<div class="c11-line"><span class="c11-line-label">' + esc(c.settingId) + '</span>' +
          '<span class="c11-line-value">' + esc(String(c.local)) + ' here · ' + esc(String(c.incoming)) + ' incoming</span>' +
          (c.note ? '<span class="c11-line-note">' + esc(c.note) + '</span>' : '') + destBtn(c.dest, 'Open row') + '</div>';
      });
    }
    if (arr(sec.invalid).length) {
      html += '<h3 class="c11-rgroup">Invalid entries</h3>';
      arr(sec.invalid).forEach(function (v) {
        html += '<div class="c11-line"><span class="c11-line-label">' + esc(v.key) + '</span>' +
          '<span class="c11-line-note">' + esc(v.reason) + '</span></div>';
      });
    }
    if (arr(sec.legacyMigrated).length) {
      html += '<h3 class="c11-rgroup">Migrated legacy keys</h3>';
      arr(sec.legacyMigrated).forEach(function (m) {
        html += '<div class="c11-line"><span class="c11-line-label">' + esc(m.from) + '</span>' +
          '<span class="c11-line-value">→ ' + esc(m.to) + '</span>' +
          (m.note ? '<span class="c11-line-note">' + esc(m.note) + '</span>' : '') + '</div>';
      });
    }
    if (sec.restorePointId) {
      html += '<div class="c11-line"><span class="c11-line-label">Restore point</span><span class="c11-line-value">' +
        esc(sec.restorePointId) + '</span></div>';
    }
    if (sec.sample) {
      var sm = obj(sec.sample);
      html += '<div class="c11-diff"><div class="c11-diff-col"><b>Before</b><pre>' + esc(sm.before || '') + '</pre></div>' +
        '<div class="c11-diff-col"><b>After</b><pre>' + esc(sm.after || '') + '</pre></div></div>' +
        (sm.formatter ? '<div class="c11-line-note">' + esc(sm.formatter) + (sm.when ? ' · ' + esc(sm.when) : '') + '</div>' : '');
    }
    if (!html) html = '<div class="c11-empty">Nothing staged.</div>';
    return html;
  }

  /* ---------------- deferred owner shells ---------------- */

  function renderDeferredShell(def) {
    var vm = safeModel(def) || { sections: [] };
    var icx = obj(def.insertionContract);
    var html = '<div class="c11-mgr c11-shell" data-manager-sheet="' + attr(def.id) + '">' +
      '<header class="c11-mgr-head"><span class="c11-mgr-ico">' + ico(def.icon || 'gear') + '</span>' +
      '<div class="c11-mgr-headmain"><h1>' + esc(def.title) + '</h1><p>' + esc(def.blurb || '') + '</p>' +
      '<div class="c11-mgr-summary">' + chipHtml('managed', 'Reserved destination — read-only') + '</div></div></header>';
    html += '<section class="c11-msec" data-section="owner"><h2>Owner</h2><div class="c11-lines">' +
      '<div class="c11-line"><span class="c11-line-label">Owned by</span><span class="c11-line-value">' + esc(def.owner || '—') + '</span></div>' +
      '<div class="c11-line"><span class="c11-line-label">Deep link</span><span class="c11-line-value">' + esc(icx.deepLink || ('manager/' + def.id)) + '</span></div>' +
      '<div class="c11-line"><span class="c11-line-label">Reachable from</span><span class="c11-line-value">' + esc(arr(icx.reachableFrom).join(' · ') || 'System') + '</span></div>' +
      '<div class="c11-line"><span class="c11-line-label">Return contract</span><span class="c11-line-note">' + esc(icx.returnContract || '') + '</span></div>' +
      '</div></section>';
    arr(vm.sections).forEach(function (sec) { html += sectionHtml(def, sec); });
    html += '<div class="c11-callout">Honest status: this page has no backend in this concept. Nothing here pretends to run.</div></div>';
    els.sheet.innerHTML = html;
    hydrate(els.sheet);
  }

  /* ---------------- m.providers — roster + provider detail tabs ------------ */

  var PROVIDER_TAB_LABELS = {
    overview: 'Overview', accounts: 'Accounts', models: 'Models', limits: 'Usage & limits',
    routing: 'Routing', installs: 'Installations', setup: 'Set up', activity: 'Activity',
    advanced: 'Advanced', routes: 'Routes', catalog: 'Catalog', server: 'Server'
  };

  function renderProviders(def, vm, objectId, tab, sectionHint) {
    if (!objectId) { renderProvidersRoster(def, vm); return; }
    var page = obj(vm.pages)[objectId];
    if (!page) {
      renderProvidersRoster(def, vm);
      toast('No provider called "' + objectId + '" — showing the roster.');
      return;
    }
    var activeTab = tab && arr(page.tabs).indexOf(tab) >= 0 ? tab : arr(page.tabs)[0];
    var html = '<div class="c11-mgr c11-providers" data-manager-sheet="m.providers">';

    /* left roster (wide widths keep it visible; narrow pushes it behind Back) */
    html += '<aside class="c11-prov-roster" aria-label="Providers">';
    arr(vm.sections).forEach(function (sec) {
      if (sec.id !== 'connections') return;
      arr(sec.groups).forEach(function (g) {
        html += '<div class="c11-prosterhead">' + esc(g.label) + '</div>';
        arr(g.items).forEach(function (it) {
          var on = it.id === objectId;
          html += '<button type="button" class="c11-proster' + (on ? ' is-active' : '') + '" data-act="prov-open" ' +
            'data-object-id="' + attr(it.id) + '"' + (on ? ' aria-current="true"' : '') + '>' +
            '<span class="c11-proster-name">' + esc(it.label) + '</span>' +
            statusWord(obj(it.status).tone, obj(it.status).label) + '</button>';
        });
      });
    });
    html += '</aside>';

    /* detail sheet with its own tab row */
    html += '<div class="c11-prov-detail" data-object-id="' + attr(objectId) + '">' +
      '<header class="c11-prov-head"><h1>' + esc(page.title) + '</h1>' +
      (page.status ? statusWord(obj(page.status).tone, obj(page.status).label) : '') +
      actionsButtonHtml(def) + '</header>';
    if (obj(page.status).note) html += '<div class="c11-ritem-note">' + esc(page.status.note) + '</div>';
    html += '<div class="c11-ptabs" role="tablist" aria-label="' + attr(page.title) + ' pages">';
    arr(page.tabs).forEach(function (t) {
      var on = t === activeTab;
      html += '<button type="button" class="c11-ptab' + (on ? ' is-active' : '') + '" role="tab" aria-selected="' + on +
        '" data-act="ptab-go" data-tab="' + attr(t) + '" data-oid="' + attr(objectId) + '">' +
        esc(PROVIDER_TAB_LABELS[t] || t) + '</button>';
    });
    html += '</div><div class="c11-ptab-body" data-tab="' + attr(activeTab) + '">';
    var sec2 = obj(page.sections)[activeTab];
    if (sec2) html += sectionHtml(def, sec2);
    else html += '<div class="c11-empty">Nothing on this page.</div>';
    /* explicit setup affordance: user-triggered, official source only */
    if (activeTab === 'setup') {
      var setupAct = null;
      safeActions(def).forEach(function (a) {
        if (a.id === 'act.setup.cursor-cli' && /cursor/.test(objectId)) setupAct = a;
      });
      if (setupAct) {
        html += '<div class="c11-setup-cta"><button type="button" class="c11-btn c11-btn-primary" data-act="mgr-run" ' +
          'data-manager-id="m.providers" data-actid="' + attr(setupAct.id) + '">' + ico('download') +
          '<span>' + esc(setupAct.label) + '</span></button>' +
          '<span class="c11-line-note">Nothing installs until you choose this. Sign-in stays a separate step.</span></div>';
      }
    }
    html += '</div></div></div>';
    els.sheet.innerHTML = html;
    hydrate(els.sheet);

    if (sectionHint) {
      var t2 = els.sheet.querySelector('[data-object-id="' + cssEscape(sectionHint) + '"]');
      if (!t2) {
        /* roster/table entries inside the tab body carry the section ids */
        var all = els.sheet.querySelectorAll('.c11-ptab-body [data-object-id]');
        for (var i = 0; i < all.length; i++) {
          if (all[i].getAttribute('data-object-id') === sectionHint) { t2 = all[i]; break; }
        }
      }
      if (t2) landOn(t2);
    }
  }

  /* Every answer on a connection card is introduced by its own label. The
     shared model carries these three values as questions ("Which account will
     be used?", "Which models are available?", "What happens when included
     usage ends?"); printing the answers alone left lines like "None" /
     "None until installed" / "Not applicable" with nothing to attach them to.
     The short forms are the house wording every sibling concept already uses. */
  function provcardLine(label, value) {
    if (value === null || value === undefined || value === '') return '';
    return '<span class="c11-provcard-line"><b class="c11-provcard-key">' + esc(label) +
      ':</b> <span class="c11-provcard-val">' + esc(String(value)) + '</span></span>';
  }

  function renderProvidersRoster(def, vm) {
    var html = '<div class="c11-mgr" data-manager-sheet="m.providers">' + managerHeadHtml(def, vm);
    arr(vm.sections).forEach(function (sec) {
      if (sec.id === 'attention') {
        html += '<section class="c11-msec" data-section="attention"><h2>' + esc(sec.title) + '</h2><div class="c11-lines">';
        arr(sec.items).forEach(function (it) {
          /* The status-word treatment (weight + tone colour + underline) belongs
             to a one- or two-word status. The shared model puts a whole sentence
             in `value` here, so passing it through statusWord() produced five
             stacked bold underlined sentences that read as links but are inert.
             The word now comes from the item's own tone — the same tone-only
             fallback concept-08 uses for notices — and the sentence stays plain
             prose in the value slot. */
          var vRaw = it.value === true ? 'Needs attention'
            : (it.value === null || it.value === undefined ? '' : String(it.value));
          html += '<div class="c11-line"><span class="c11-line-label">' + esc(it.label) + '</span>' +
            statusWord(it.tone, it.tone === 'setup' ? 'Setup' : 'Attention') +
            '<span class="c11-line-value">' + esc(vRaw) + '</span>' +
            (it.note ? '<span class="c11-line-note">' + esc(it.note) + '</span>' : '') +
            destBtn(it.dest, 'Open ' + it.label) + '</div>';
        });
        html += '</div></section>';
        return;
      }
      if (sec.id !== 'connections') { html += sectionHtml(def, sec); return; }
      html += '<section class="c11-msec" data-section="connections"><h2>' + esc(sec.title) + '</h2>' +
        (sec.note ? '<p class="c11-sec-desc">' + esc(sec.note) + '</p>' : '');
      arr(sec.groups).forEach(function (g) {
        html += '<h3 class="c11-rgroup">' + esc(g.label) + '</h3><div class="c11-provgrid">';
        arr(g.items).forEach(function (it) {
          var a = obj(it.answers);
          html += '<button type="button" class="c11-provcard" data-act="prov-open" data-object-id="' + attr(it.id) + '">' +
            '<span class="c11-provcard-top"><b>' + esc(it.label) + '</b>' +
            statusWord(obj(it.status).tone, obj(it.status).label) + '</span>' +
            provcardLine('Account in use', a.accountInUse || 'No account applies') +
            provcardLine('Models available', a.modelsAvail) +
            provcardLine('When usage runs out', a.onExhaust) +
            (obj(it.status).note ? '<span class="c11-provcard-note">' + esc(it.status.note) + '</span>' : '') +
            '</button>';
        });
        html += '</div>';
      });
      html += '</section>';
    });
    html += '</div>';
    els.sheet.innerHTML = html;
    hydrate(els.sheet);
  }

  /* installation item actions → shared triggers where they exist, honest
     receipts where they do not */
  function runInstAction(actId, oid) {
    var S = window.PM2.states;
    var names = S && S.triggerNames ? S.triggerNames() : [];
    var map = { select: 'install-select', update: 'install-update', repair: 'install-repair' };
    var trig = map[actId];
    if (trig && names.indexOf(trig) >= 0) {
      try { S.trigger(trig, oid); return; } catch (e) { /* fall through */ }
    }
    if (actId === 'verify') {
      try { S.receipt('Verify checklist', 'Simulated verify pass for ' + oid + '. The real checklist re-runs version, invocation, auth, and routing checks.'); } catch (e2) { /* quiet */ }
      return;
    }
    if (actId === 'rollback') {
      try { S.trigger('install-repair', oid); return; } catch (e3) { /* fall through */ }
    }
    try { S.receipt('Action', 'Simulated ' + actId + ' for ' + oid + '. Nothing actually ran.'); } catch (e4) { /* quiet */ }
  }

  /* ================================================================
     ALL SETTINGS — faceted, VIRTUALIZED long-tail index (secondary
     utility here; never 828 live DOM rows).
     ================================================================ */

  var ALL_ROW_H = 58;
  var STATE_LABELS = {
    '': 'Any state', normal: 'Normal', managed: 'Managed', unavailable: 'Unavailable',
    'restart-required': 'Restart required', 'reconnect-required': 'Reconnect required',
    'changed-elsewhere': 'Changed elsewhere', error: 'Validation error'
  };
  /* The control-kind and tier facets are stored as internal enum values
     ('keyvalue', 'multiselect', 'advanced'). The menu and the button both read
     their words from here so no raw enum ever reaches the surface. */
  var TYPE_ORDER = ['toggle', 'select', 'radio', 'number', 'slider', 'text',
                    'path', 'list', 'multiselect', 'keyvalue', 'action'];
  var TYPE_LABELS = {
    toggle: 'Toggle', select: 'Dropdown', radio: 'Radio choice', number: 'Number',
    slider: 'Slider', text: 'Text', path: 'File path', list: 'List',
    multiselect: 'Multi-select', keyvalue: 'Key and value pairs', action: 'Action'
  };
  var TIER_LABELS = { simple: 'Simple', advanced: 'Advanced' };

  function allIndexRows() {
    if (ui.allCache && ui.allCache.epoch === ui.epoch) return ui.allCache.rows;
    var rows = [];
    arr(inventory().settings).forEach(function (s) {
      var r = store.resolveRow(s.id);
      if (!r) return;
      rows.push({ id: s.id, cat: s.cat, sub: s.sub, type: s.type, tier: s.tier,
        label: r.label, desc: r.desc, valueLabel: r.valueLabel, state: r.state,
        changed: r.changedFromDefault, chips: r.chips, stress: false,
        text: (r.label + ' ' + s.id + ' ' + r.desc + ' ' + arr(s.search).join(' ')).toLowerCase() });
    });
    var S = window.PM2.states;
    if (S && typeof S.stressActive === 'function' && S.stressActive() && typeof S.stressRecords === 'function') {
      arr(S.stressRecords()).forEach(function (z) {
        rows.push({ id: z.id, cat: z.cat, sub: '', type: 'stress', tier: 'advanced',
          label: z.label, desc: z.desc, valueLabel: 'Stress fixture', state: 'normal',
          changed: false, chips: [], stress: true,
          text: (z.label + ' ' + z.id + ' ' + arr(z.search).join(' ')).toLowerCase() });
      });
    }
    ui.allCache = { epoch: ui.epoch, rows: rows };
    return rows;
  }

  function allFiltered() {
    var f = ui.all;
    var q = f.q.trim().toLowerCase();
    var toks = q ? q.split(/\s+/) : [];
    return allIndexRows().filter(function (r) {
      if (f.cat && r.cat !== f.cat) return false;
      if (f.type && r.type !== f.type) return false;
      if (f.tier && r.tier !== f.tier) return false;
      if (f.state && r.state !== f.state) return false;
      if (f.changed === 'changed' && !r.changed) return false;
      if (f.changed === 'default' && r.changed) return false;
      for (var i = 0; i < toks.length; i++) {
        if (r.text.indexOf(toks[i]) < 0) return false;
      }
      return true;
    });
  }

  function facetBtn(act, label, active) {
    return '<button type="button" class="c11-facet' + (active ? ' is-set' : '') + '" data-act="' + attr(act) +
      '" aria-haspopup="menu" aria-expanded="false">' + esc(label) + ico('more') + '</button>';
  }

  function renderAll() {
    var f = ui.all;
    var rows = allFiltered();
    var catLabel = f.cat ? (catById(f.cat) ? catById(f.cat).title : f.cat) : 'Category';
    var html = '<div class="c11-all">' +
      '<header class="c11-dom-head"><span class="c11-dom-ico">' + ico('list') + '</span>' +
      '<div><h1>All Settings</h1><p>The complete long-tail index. Rows open in their home category so nothing loses its place.</p></div>' +
      '<span class="c11-dom-counts">' + fmtInt(rows.length) + ' of ' + fmtInt(allIndexRows().length) + '</span></header>' +
      '<div class="c11-all-tools">' +
      '<input type="text" class="c11-all-q" id="c11AllQ" value="' + attr(f.q) + '" placeholder="Filter this list…" aria-label="Filter All Settings">' +
      facetBtn('facet-cat', catLabel, !!f.cat) +
      facetBtn('facet-type', f.type ? ('Control: ' + (TYPE_LABELS[f.type] || f.type)) : 'Control', !!f.type) +
      facetBtn('facet-tier', f.tier ? ('Tier: ' + (TIER_LABELS[f.tier] || f.tier)) : 'Tier', !!f.tier) +
      facetBtn('facet-state', f.state ? STATE_LABELS[f.state] : 'State', !!f.state) +
      facetBtn('facet-changed', f.changed === 'changed' ? 'Changed from default' : f.changed === 'default' ? 'On defaults' : 'Changed?', !!f.changed) +
      ((f.cat || f.type || f.tier || f.state || f.changed || f.q)
        ? '<button type="button" class="c11-btn c11-btn-small" data-act="facet-clear">Clear</button>' : '') +
      '</div>' +
      '<div class="c11-all-list" id="c11AllList" tabindex="0" aria-label="Settings list">' +
        '<div class="c11-all-spacer" id="c11AllSpace"><div class="c11-all-window" id="c11AllWin"></div></div>' +
      '</div></div>';
    els.sheet.innerHTML = html;
    hydrate(els.sheet);
    els.allList = els.sheet.querySelector('#c11AllList');
    els.allSpace = els.sheet.querySelector('#c11AllSpace');
    els.allWin = els.sheet.querySelector('#c11AllWin');
    els.allList._rows = rows;
    els.allSpace.style.height = (rows.length * ALL_ROW_H) + 'px';
    els.allList.scrollTop = f.scroll || 0;
    els.allList.addEventListener('scroll', onAllScroll);
    paintAllWindow();

    /* paintAllWindow() sizes the row window from the list's clientHeight, and
       scroll was its only trigger. Now that the list is sized by the space the
       sheet has left (rather than by a fixed 60vh), every height change — window
       resize, the Assistant panel opening, the head wrapping at a new width —
       moves that height, and a window computed for the OLD height would leave a
       blank strip along the bottom of the list. The spacer lives inside the list
       and cannot feed back into its flex-sized height, so this cannot loop. */
    if (typeof window.ResizeObserver === 'function') {
      var lastH = els.allList.clientHeight;
      var pending = false;
      var listRo = new window.ResizeObserver(function () {
        if (!els.allList) return;
        var h = els.allList.clientHeight;
        if (h === lastH || pending) return;
        lastH = h;
        pending = true;
        window.requestAnimationFrame(function () { pending = false; paintAllWindow(); });
      });
      listRo.observe(els.allList);
    }
  }

  var allPaintQueued = false;
  function onAllScroll() {
    ui.all.scroll = els.allList.scrollTop;
    if (allPaintQueued) return;
    allPaintQueued = true;
    window.requestAnimationFrame(function () { allPaintQueued = false; paintAllWindow(); });
  }

  function paintAllWindow() {
    if (!els.allList || !els.allList._rows) return;
    var rows = els.allList._rows;
    var top = els.allList.scrollTop;
    var h = els.allList.clientHeight || 400;
    var first = Math.max(0, Math.floor(top / ALL_ROW_H) - 4);
    var last = Math.min(rows.length, Math.ceil((top + h) / ALL_ROW_H) + 4);
    var html = '';
    for (var i = first; i < last; i++) {
      var r = rows[i];
      var c = catById(r.cat);
      html += '<button type="button" class="c11-all-row' + (r.stress ? ' is-stress' : '') + '" style="top:' + (i * ALL_ROW_H) + 'px" ' +
        'data-act="all-open" data-setting-id="' + attr(r.id) + '"' + (r.stress ? ' data-stress="1"' : '') + '>' +
        '<span class="c11-all-main"><b>' + esc(r.label) + '</b><i>' +
        esc((c ? c.title : r.cat) + (r.sub ? ' › ' + subTitle(r.cat, r.sub) : '')) + '</i></span>' +
        '<span class="c11-all-side">' +
        (r.stress ? chipHtml('not-configured', 'Stress fixture')
          : ((r.changed ? chipHtml('custom', r.valueLabel || 'Custom') : chipHtml('default', r.valueLabel || 'Default')) +
             (r.state !== 'normal' ? chipHtml(r.state === 'managed' ? 'managed' : r.state === 'unavailable' ? 'unavailable' : 'differs', STATE_LABELS[r.state] || r.state) : ''))) +
        '</span></button>';
    }
    els.allWin.innerHTML = html;
  }

  function openFacetMenu(which, invoker) {
    var f = ui.all;
    var items = [];
    function opt(value, label, cur) { return { id: value, label: label, checked: cur === value }; }
    if (which === 'cat') {
      items.push(opt('', 'Any category', f.cat));
      arr(inventory().categories).forEach(function (c) { items.push(opt(c.id, c.title, f.cat)); });
    } else if (which === 'type') {
      items.push(opt('', 'Any control', f.type));
      TYPE_ORDER.forEach(function (t) { items.push(opt(t, TYPE_LABELS[t] || t, f.type)); });
    } else if (which === 'tier') {
      items = [opt('', 'Any tier', f.tier), opt('simple', TIER_LABELS.simple, f.tier),
               opt('advanced', TIER_LABELS.advanced, f.tier)];
    } else if (which === 'state') {
      Object.keys(STATE_LABELS).forEach(function (k) { items.push(opt(k, STATE_LABELS[k], f.state)); });
    } else if (which === 'changed') {
      items = [opt('', 'Either', f.changed), opt('changed', 'Changed from default', f.changed), opt('default', 'Still on the default', f.changed)];
    }
    openMenu(invoker, items, {
      onPick: function (it) {
        if (which === 'cat') f.cat = it.id;
        else if (which === 'type') f.type = it.id;
        else if (which === 'tier') f.tier = it.id;
        else if (which === 'state') f.state = it.id;
        else if (which === 'changed') f.changed = it.id;
        f.scroll = 0;
        renderAll();
      }
    });
  }

  /* ================================================================
     COPY SETTINGS — one-time transaction in adjacent panes, then a
     layered confirm sheet, then a receipt with working rollback.
     ================================================================ */

  function copySources() {
    try { return arr(window.PM2.copy.sources()); } catch (e) { return []; }
  }

  function renderCopy() {
    var c = ui.copy;
    if (c.step === 'preview' && c.preview) { renderCopyPreview(); return; }
    if (c.step === 'receipt' && c.receipt) { renderCopyReceipt(); return; }
    var sources = copySources();
    if (c.sourceId == null && sources.length) c.sourceId = null; /* explicit choice required */
    var selected = null;
    sources.forEach(function (s) { if (s.id === c.sourceId) selected = s; });

    var html = '<div class="c11-copy">' +
      '<header class="c11-dom-head"><span class="c11-dom-ico">' + ico('copy') + '</span>' +
      '<div><h1>Copy Settings from another project</h1>' +
      '<p>A one-time copy into Puppet Master. Nothing links, nothing syncs — after the copy the two projects are fully independent.</p></div></header>' +
      '<div class="c11-copy-panes">';

    /* left pane: source projects + their category counts */
    html += '<section class="c11-copy-src" aria-label="Source project"><h2>1 · Copy from</h2>';
    if (!sources.length) html += '<div class="c11-empty">No other projects found on this machine.</div>';
    sources.forEach(function (s) {
      var on = s.id === c.sourceId;
      html += '<div class="c11-src' + (on ? ' is-active' : '') + '">' +
        '<button type="button" class="c11-src-pick" data-act="copy-src" data-src="' + attr(s.id) + '" aria-pressed="' + on + '">' +
        '<span class="c11-src-radio" aria-hidden="true"></span>' +
        '<span class="c11-src-main"><b>' + esc(s.name) + '</b><i>Updated ' + esc(fmtAgo(s.lastUpdated)) +
        (s.legacy ? ' · legacy format — some values will not translate' : '') + '</i></span></button>';
      if (on) {
        html += '<div class="c11-src-cats">';
        arr(s.categorySummaries).forEach(function (cs) {
          html += chipHtml('default', cs.title + ' · ' + cs.count);
        });
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</section>';

    /* right pane: category choice + preview */
    html += '<section class="c11-copy-choose" aria-label="Categories to copy"><h2>2 · Choose categories</h2>';
    if (!selected) {
      /* The two panes sit side by side when there is room and stack when there
         is not, so the copy cannot name a direction — it names the step. */
      html += '<div class="c11-empty">Pick a source project in step 1. Its categories and counts appear here.</div>';
    } else {
      var picked = 0, total = 0;
      html += '<div class="c11-copy-cats">';
      arr(selected.categorySummaries).forEach(function (cs) {
        var on2 = c.cats[cs.cat] !== false; /* default: everything selected */
        if (on2) { picked += 1; total += cs.count; }
        html += '<label class="c11-copy-cat"><input type="checkbox" data-role="copy-cat" data-cat="' + attr(cs.cat) + '"' +
          (on2 ? ' checked' : '') + '><span class="c11-copy-cat-name">' + esc(cs.title) + '</span>' +
          '<span class="c11-copy-cat-n">' + fmtInt(cs.count) + '</span></label>';
      });
      html += '</div>' +
        '<div class="c11-copy-foot"><span>' + picked + ' of ' + arr(selected.categorySummaries).length +
        ' categories · ' + fmtInt(total) + ' values to compare</span>' +
        '<span class="c11-copy-footacts">' +
        '<button type="button" class="c11-btn c11-btn-small" data-act="copy-all-toggle">' +
          (picked === arr(selected.categorySummaries).length ? 'Select none' : 'Select all') + '</button>' +
        '<button type="button" class="c11-btn c11-btn-primary" data-act="copy-preview"' + (picked ? '' : ' disabled') + '>' +
          'Preview the copy</button></span></div>' +
        '<div class="c11-callout">' + esc(str(window.PM2.copy.credentialNote).split(':')[0]) +
        ' by reference only — never the secret material. The preview spells this out.</div>';
    }
    html += '</section></div></div>';
    els.sheet.innerHTML = html;
    hydrate(els.sheet);
  }

  var COPY_KIND_WORDS = { add: 'Adds', replace: 'Replaces', unchanged: 'Unchanged', unavailable: 'Unavailable', conflict: 'Conflicts' };
  var COPY_KIND_CHIP = { add: 'recommended', replace: 'custom', unchanged: 'default', unavailable: 'unavailable', conflict: 'differs' };

  function renderCopyPreview() {
    var c = ui.copy;
    var pv = c.preview;
    var counts = obj(pv.counts);
    var kinds = ['add', 'replace', 'unchanged', 'unavailable', 'conflict'];
    var html = '<div class="c11-copy">' +
      '<header class="c11-dom-head"><span class="c11-dom-ico">' + ico('copy') + '</span>' +
      '<div><h1>Preview — copy from ' + esc(pv.sourceName) + '</h1>' +
      '<p>Review before anything is written. A restore point is created first; the copy applies atomically and is verified afterward.</p></div></header>';

    html += '<div class="c11-countchips" role="tablist" aria-label="Filter by change kind">' +
      '<button type="button" class="c11-kindchip' + (c.kind === '' ? ' is-active' : '') + '" data-act="copy-kind" data-kind="">All · ' +
      fmtInt(arr(pv.items).length) + '</button>';
    kinds.forEach(function (k) {
      html += '<button type="button" class="c11-kindchip' + (c.kind === k ? ' is-active' : '') + '" data-act="copy-kind" data-kind="' + k + '">' +
        esc(COPY_KIND_WORDS[k]) + ' · ' + fmtInt(counts[k] || 0) + '</button>';
    });
    html += '</div>';

    /* per-category summary */
    html += '<div class="c11-copy-percat">';
    arr(pv.perCategory).forEach(function (pc) {
      var bits = [];
      kinds.forEach(function (k) { if (obj(pc.counts)[k]) bits.push(obj(pc.counts)[k] + ' ' + COPY_KIND_WORDS[k].toLowerCase()); });
      html += '<div class="c11-line"><span class="c11-line-label">' + esc(pc.title) + '</span>' +
        '<span class="c11-line-value">' + esc(bits.join(' · ') || 'nothing to change') + '</span></div>';
    });
    html += '</div>';

    /* items with inspection */
    var items = arr(pv.items).filter(function (it) { return !c.kind || it.kind === c.kind; });
    var CAP = 120;
    html += '<div class="c11-copy-items">';
    items.slice(0, CAP).forEach(function (it, i) {
      var open = !!c.openItems[it.settingId];
      var cc = catById(it.cat);
      html += '<div class="c11-citem" data-setting-id="' + attr(it.settingId) + '">' +
        '<button type="button" class="c11-citem-top" data-act="copy-item" data-id="' + attr(it.settingId) + '" aria-expanded="' + open + '">' +
        chipHtml(COPY_KIND_CHIP[it.kind] || 'default', COPY_KIND_WORDS[it.kind] || it.kind) +
        '<b>' + esc(it.label) + '</b><i>' + esc(cc ? cc.title : it.cat) + '</i>' + ico(open ? 'minus' : 'plus') + '</button>';
      if (open) {
        html += '<div class="c11-citem-body">';
        if (it.kind !== 'add') html += '<div class="c11-dr-line"><b>Here now</b><span>' + esc(prettyVal(it.current)) + '</span></div>';
        html += '<div class="c11-dr-line"><b>Incoming</b><span>' + esc(prettyVal(it.incoming)) + '</span></div>';
        if (it.note) html += '<div class="c11-dr-line"><b>Note</b><span>' + esc(it.note) + '</span></div>';
        if (it.kind === 'unavailable' || it.kind === 'conflict') {
          html += '<div class="c11-dr-line"><b>Applied?</b><span>No — this row is shown for honesty and will not be written.</span></div>';
        }
        html += '</div>';
      }
      html += '</div>';
    });
    if (items.length > CAP) {
      html += '<div class="c11-empty">…and ' + fmtInt(items.length - CAP) + ' more. Narrow with the kind filters above.</div>';
    }
    if (!items.length) html += '<div class="c11-empty">Nothing in this kind.</div>';
    html += '</div>';

    html += '<div class="c11-callout">' + esc(pv.credentialNote || '') + '</div>' +
      '<div class="c11-copy-apply"><span class="c11-line-note">Restore point first · atomic apply · verification · receipt with rollback. One time only — future changes in ' +
      esc(pv.sourceName) + ' never propagate here.</span>' +
      '<span class="c11-copy-footacts">' +
      '<button type="button" class="c11-btn" data-act="copy-back" data-pm2-back>Back to selection</button>' +
      '<button type="button" class="c11-btn c11-btn-primary" data-act="copy-apply"' + (c.busy ? ' disabled' : '') + '>' +
      (c.busy ? 'Applying…' : 'Create restore point and apply') + '</button></span></div></div>';
    els.sheet.innerHTML = html;
    hydrate(els.sheet);
  }

  function prettyVal(v) {
    if (v === undefined || v === null || v === '') return 'Not set';
    if (v === true) return 'On';
    if (v === false) return 'Off';
    if (Array.isArray(v)) return v.length + ' item(s): ' + v.map(function (x) { return typeof x === 'object' ? JSON.stringify(x) : String(x); }).join(', ').slice(0, 160);
    if (typeof v === 'object') return Object.keys(v).map(function (k) { return k + ' = ' + String(v[k]); }).join(', ').slice(0, 160) || 'Empty';
    return String(v);
  }

  function renderCopyReceipt() {
    var c = ui.copy;
    var r = c.receipt;
    var rolled = !!r.rolledBack;
    var html = '<div class="c11-copy"><header class="c11-dom-head"><span class="c11-dom-ico">' + ico(rolled ? 'undo' : 'check') + '</span>' +
      '<div><h1>' + (rolled ? 'Copy rolled back' : 'Copy complete') + '</h1>' +
      '<p>' + (rolled
        ? 'Every copied value was restored exactly from the restore point. The receipt records both directions.'
        : 'The copy applied atomically and the destination verified. This was a one-time transaction — the projects are independent again.') + '</p></div></header>' +
      '<div class="c11-lines c11-receipt">' +
      '<div class="c11-line"><span class="c11-line-label">Receipt</span><span class="c11-line-value">' + esc(r.receiptId || '—') + '</span></div>' +
      '<div class="c11-line"><span class="c11-line-label">Restore point</span><span class="c11-line-value">' + esc(r.restorePointId || '—') + '</span></div>' +
      '<div class="c11-line"><span class="c11-line-label">Values written</span><span class="c11-line-value">' + fmtInt(r.applied || 0) + '</span></div>' +
      '<div class="c11-line"><span class="c11-line-label">Verified</span><span class="c11-line-value">' +
        statusWord(rolled ? 'muted' : 'ok', rolled ? 'Superseded by rollback' : (r.verified ? 'Yes — destination matches the preview' : 'No')) + '</span></div>' +
      '</div>' +
      '<div class="c11-copy-apply"><span class="c11-line-note">' +
      (rolled ? 'Settings match the pre-copy snapshot again.' : 'Rollback restores every written value exactly from the restore point.') + '</span>' +
      '<span class="c11-copy-footacts">' +
      (rolled ? '' : '<button type="button" class="c11-btn" data-act="copy-rollback"' + (c.busy ? ' disabled' : '') + '>' +
        (c.busy ? 'Rolling back…' : 'Roll back this copy') + '</button>') +
      '<button type="button" class="c11-btn c11-btn-primary" data-act="go-home">Done</button></span></div></div>';
    els.sheet.innerHTML = html;
    hydrate(els.sheet);
  }

  function copyDoPreview() {
    var c = ui.copy;
    var sources = copySources();
    var selected = null;
    sources.forEach(function (s) { if (s.id === c.sourceId) selected = s; });
    if (!selected) return;
    var catIds = [];
    arr(selected.categorySummaries).forEach(function (cs) { if (c.cats[cs.cat] !== false) catIds.push(cs.cat); });
    try {
      var pv = window.PM2.copy.preview(c.sourceId, catIds);
      if (pv && pv.token) {
        c.preview = pv; c.step = 'preview'; c.kind = ''; c.openItems = {};
        renderSheet(true);
      } else {
        toast(pv && pv.error ? pv.error : 'Preview failed.');
      }
    } catch (e) { toast('Preview failed.'); }
  }

  function copyDoApply() {
    var c = ui.copy;
    if (!c.preview || c.busy) return;
    c.busy = true;
    renderCopyPreview();
    try {
      window.PM2.copy.apply(c.preview.token).then(function (res) {
        c.busy = false;
        if (res && res.receiptId) {
          c.receipt = res; c.step = 'receipt';
          renderSheet(true);
        } else {
          toast(res && res.error ? res.error : 'The copy did not apply.');
          renderCopyPreview();
        }
      }, function () { c.busy = false; toast('The copy did not apply.'); renderCopyPreview(); });
    } catch (e) { c.busy = false; toast('The copy did not apply.'); renderCopyPreview(); }
  }

  function copyDoRollback() {
    var c = ui.copy;
    if (!c.receipt || c.busy) return;
    c.busy = true;
    renderCopyReceipt();
    try {
      window.PM2.copy.rollback(c.receipt.receiptId).then(function (res) {
        c.busy = false;
        if (res && res.ok) { c.receipt.rolledBack = true; }
        renderSheet(true);
      }, function () { c.busy = false; renderCopyReceipt(); });
    } catch (e) { c.busy = false; renderCopyReceipt(); }
  }

  /* ================================================================
     UNIVERSAL SEARCH — persistent field; dropdown anchored beneath it.
     Routing is by rid/dest only; Back restores the query and results.
     ================================================================ */

  var KIND_WORDS = {
    setting: 'Setting', manager: 'Manager', object: 'Resource', action: 'Action',
    workflow: 'Workflow', diagnostic: 'Diagnostic', unavailable: 'Unavailable', help: 'Help'
  };

  var searchDebounce = null;

  function closeDrop() {
    ui.search.open = false;
    ui.search.active = -1;
    if (els.drop) { els.drop.hidden = true; els.drop.innerHTML = ''; }
    if (els.search) els.search.setAttribute('aria-expanded', 'false');
  }

  function flatResults() {
    var out = [];
    var res = ui.search.res;
    if (!res) return out;
    arr(res.groups).forEach(function (g) {
      arr(g.results).forEach(function (r) { out.push(r); });
    });
    return out;
  }

  function runSearch(q, recordRoute) {
    ui.search.q = q;
    if (!q.trim()) { closeDrop(); return; }
    var res;
    try { res = window.PM2.search.query(q, { limit: 30 }); }
    catch (e) { res = { query: q, total: 0, groups: [] }; }
    ui.search.res = res;
    ui.search.active = -1;
    renderDrop();
    if (recordRoute) {
      var onSearch = ui.dest.route === 'search';
      if (onSearch) ui.dest.query = q;
      go({ route: 'search', query: q }, { replace: onSearch, silent: true });
      if (!onSearch) ui.dest = { route: 'search', query: q };
      renderCrumbs();
    }
  }

  function availabilityText(a) {
    if (a == null) return '';
    if (typeof a === 'string') return a;
    return str(a.reason) || str(a.note) || str(a.label) || '';
  }

  function renderDrop() {
    var res = ui.search.res;
    if (!res) { closeDrop(); return; }
    ui.search.open = true;
    els.search.setAttribute('aria-expanded', 'true');
    var html = '';
    if (!res.total) {
      html = '<div class="c11-drop-empty"><b>No matches for “' + esc(res.query) + '”.</b>' +
        '<p>Check the spelling, try a broader word, or browse the whole index.</p>' +
        '<div class="c11-missing-acts"><button type="button" class="c11-btn c11-btn-small" data-act="util-all">Open All Settings</button>' +
        '<button type="button" class="c11-btn c11-btn-small c11-btn-quiet" data-act="go-home">Settings Home</button></div></div>';
    } else {
      var idx = 0;
      arr(res.groups).forEach(function (g) {
        html += '<div class="c11-drop-group">' + esc(g.label || g.kind) + '</div>';
        arr(g.results).forEach(function (r) {
          var av = availabilityText(r.availability);
          html += '<button type="button" class="c11-res" role="option" data-act="res-pick" data-rid="' + attr(r.rid) +
            '" data-ri="' + idx + '">' +
            '<span class="c11-res-top"><b>' + esc(r.label) + '</b>' +
            (r.sub ? '<i>' + esc(r.sub) + '</i>' : '') +
            '<span class="c11-res-kind">' + esc(KIND_WORDS[g.kind] || g.label || g.kind) + '</span></span>' +
            '<span class="c11-res-path">' + esc(arr(r.path).join(' › ')) + '</span>' +
            (av ? '<span class="c11-res-avail">' + esc(av) + '</span>' : '') +
            '</button>';
          idx += 1;
        });
      });
      html += '<div class="c11-drop-foot">' + fmtInt(res.total) + ' match' + (res.total === 1 ? '' : 'es') +
        (res.total > 30 ? ' · showing the 30 best' : '') + ' · Enter opens · Esc closes</div>';
    }
    els.drop.innerHTML = html;
    els.drop.hidden = false;
    hydrate(els.drop);
  }

  function moveActive(delta) {
    var flat = flatResults();
    if (!flat.length) return;
    var next = ui.search.active + delta;
    if (next < 0) next = flat.length - 1;
    if (next >= flat.length) next = 0;
    ui.search.active = next;
    var btns = els.drop.querySelectorAll('.c11-res');
    Array.prototype.slice.call(btns).forEach(function (b, i) {
      b.classList.toggle('is-active', i === next);
      if (i === next) {
        try { b.scrollIntoView({ block: 'nearest' }); } catch (e) { /* fine */ }
      }
    });
  }

  function pickResult(rid) {
    var r = null;
    try { r = window.PM2.search.resolveRid(rid); } catch (e) { r = null; }
    if (!r) {
      /* fall back to the rendered result list */
      flatResults().forEach(function (x) { if (x.rid === rid) r = x; });
    }
    closeDrop();
    if (!r || !r.dest) { toast('That result has no destination.'); return; }
    var av = availabilityText(r.availability);
    if (av) toast(av);
    var d = obj(r.dest);
    if (d.reason && !av) toast(d.reason);
    go({ route: d.route, cat: d.cat, sub: d.sub, managerId: d.managerId,
         objectId: d.objectId, tab: d.tab, settingId: d.settingId,
         query: d.query }, { params: { focus: rid } });
  }

  /* ================================================================
     OPEN — the concept router (PM2.route.bind target). Idempotent.
     ================================================================ */

  var pendingSection = null;

  function open(dest) {
    var d = obj(dest);
    var hadFocus = !!d.focus;
    closeMenu(false);
    if (d.route !== 'search') closeDrop();

    /* resolve a focus rid into the richer search dest (sectionId etc.) */
    pendingSection = null;
    var focusSetting = null;
    if (d.focus) {
      if (/^[a-z]:/.test(d.focus)) {
        var rr = null;
        try { rr = window.PM2.search.resolveRid(d.focus); } catch (e) { rr = null; }
        if (rr && rr.dest) {
          var rd = obj(rr.dest);
          if (rd.route === d.route || !d.route) {
            d = { route: rd.route, cat: rd.cat || d.cat, sub: rd.sub || d.sub,
                  managerId: rd.managerId || d.managerId, objectId: rd.objectId || d.objectId,
                  tab: rd.tab || d.tab, settingId: rd.settingId || d.settingId, query: d.query };
          }
          if (rd.sectionId) pendingSection = rd.sectionId;
          if (rd.settingId && d.route === 'dest') focusSetting = rd.settingId;
        }
      } else if (settingById(d.focus) || EXTRA_ROWS[d.focus]) {
        if (d.route === 'dest' || d.route === 'home') focusSetting = d.focus;
        else if (d.route === 'setting' && !d.settingId) d.settingId = d.focus;
      }
    }

    var wasCopy = ui.dest.route === 'copy';
    ui.dest = { route: d.route || 'home', cat: d.cat || null, sub: d.sub || null,
      managerId: d.managerId || null, objectId: d.objectId || null, tab: d.tab || null,
      settingId: d.settingId || null, query: d.query || null };

    if (ui.dest.route === 'copy' && !wasCopy) {
      ui.copy = { step: 'pick', sourceId: null, cats: {}, preview: null,
                  receipt: null, kind: '', openItems: {}, busy: false };
    }
    if (ui.dest.route === 'dest') ui.domSub[ui.dest.cat] = ui.dest.sub || '';

    stage.scrollTop = 0;

    if (ui.dest.route === 'setting') {
      openSettingDest(ui.dest.settingId);
      settleSheet();
      return null;
    }
    if (ui.dest.route === 'search') {
      var q = str(ui.dest.query);
      renderHome();
      renderChrome();
      if (els.search) els.search.value = q;
      runSearch(q, false);
      settleSheet();
      return null;
    }

    renderSheet(true);

    if (focusSetting) {
      var t = els.sheet.querySelector('[data-setting-id="' + cssEscape(focusSetting) + '"]');
      if (t) landOn(t);
    } else if (hadFocus && ui.dest.route === 'manager' && !root.querySelector('.pm2-located')) {
      /* focus-driven navigation with no finer target: land on the sheet head
         (manager page, or the provider detail head when a provider is open) */
      var t2 = null;
      if (ui.dest.objectId && els.sheet.querySelector('.c11-prov-detail')) {
        t2 = els.sheet.querySelector('.c11-prov-head h1');
      }
      if (!t2) t2 = els.sheet.querySelector('.c11-mgr-head h1') || els.sheet.querySelector('h1');
      if (t2) landOn(t2);
    }
    return null;
  }

  function renderSheet(withMotion) {
    closeMenu(false);
    var d = ui.dest;
    /* All Settings is the one route whose body is a bounded viewport rather than
       a document: its row list must end where the sheet ends, or its last row
       paints below the window. Fill mode bounds root -> sheaf -> sheet for that
       route and is cleared for every other one, so nothing else stops scrolling
       as a page. */
    root.classList.toggle('is-fill', d.route === 'all');
    if (d.route === 'all') renderAll();
    else if (d.route === 'copy') renderCopy();
    else if (d.route === 'dest') renderDomain(d.cat, d.sub || (ui.domSub[d.cat] || ''));
    else if (d.route === 'manager') { renderManager(d.managerId, d.objectId, d.tab, pendingSection); pendingSection = null; }
    else if (d.route === 'setting') {
      var s = settingById(d.settingId);
      var x = EXTRA_ROWS[d.settingId];
      if (s || x) renderDomain(s ? s.cat : x.cat, ui.domSub[s ? s.cat : x.cat] || '');
      else renderMissing('“' + d.settingId + '” is not in this project’s settings. It may have been renamed or retired — try the search box above, or browse All Settings.');
    }
    else if (d.route === 'search') { renderHome(); }
    else renderHome();
    renderChrome();
    if (withMotion) settleSheet();
  }

  function renderChrome() {
    renderTabs();
    renderCrumbs();
    renderNotice();
    renderRefresh();
  }

  /* ================================================================
     EVENTS
     ================================================================ */

  function wireFrame() {
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    root.addEventListener('input', onInput);
    root.addEventListener('keydown', onRootKeydown);
    els.tabs.addEventListener('scroll', updateTabFades, { passive: true });

    /* tab metrics move with the theme (each face has its own type) and again
       when the webfonts land, so the fit is re-measured on both */
    if (window.MutationObserver) {
      var mo = new MutationObserver(function () { fitTabs(); updateTabFades(); });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-density'] });
    }
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(function () { fitTabs(); updateTabFades(); });
    }

    document.addEventListener('mousedown', function (ev) {
      if (ui.menu && ui.menu.el && !ui.menu.el.contains(ev.target) &&
          ev.target !== ui.menu.invoker && !(ui.menu.invoker && ui.menu.invoker.contains && ui.menu.invoker.contains(ev.target))) {
        closeMenu(false);
      }
      if (ui.search.open && els.searchWrap && !els.searchWrap.contains(ev.target)) closeDrop();
    });
    document.addEventListener('keydown', onGlobalKeydown);

    els.search.addEventListener('focus', function () {
      if (els.search.value.trim() && ui.search.res) renderDrop();
    });
    els.search.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); if (!ui.search.open) runSearch(els.search.value, true); moveActive(1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); moveActive(-1); }
      else if (ev.key === 'Enter') {
        var flat = flatResults();
        var pickIx = ui.search.active >= 0 ? ui.search.active : 0;
        if (ui.search.open && flat[pickIx]) { ev.preventDefault(); pickResult(flat[pickIx].rid); }
      } else if (ev.key === 'Escape') {
        if (ui.search.open) { ev.preventDefault(); ev.stopPropagation(); closeDrop(); }
      }
    });
  }

  function onGlobalKeydown(ev) {
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'k' || ev.key === 'K')) {
      ev.preventDefault();
      try { els.search.focus(); els.search.select(); } catch (e) { /* fine */ }
      return;
    }
    if (menuKeydown(ev)) return;
    if (ev.key !== 'Escape') return;
    if (ev.defaultPrevented) return;
    /* escape ladder: popup › drawer › one level out › stop at Home */
    if (ui.menu) { closeMenu(true); return; }
    if (ui.search.open) { closeDrop(); return; }
    if (ui.rowDrawer) { ui.rowDrawer = null; refreshSheet(); return; }
    if (ui.dest.route === 'copy' && ui.copy.step === 'preview') { ui.copy.step = 'pick'; renderSheet(true); return; }
    var pile = buildStack(ui.dest);
    if (pile.length > 1) { go(pile[pile.length - 2].dest); return; }
    /* at Home: stop — never close Settings from Escape */
  }

  function onRootKeydown(ev) {
    /* roving arrows on tab rows */
    var tabHost = ev.target.closest ? ev.target.closest('[role="tablist"]') : null;
    if (tabHost && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) {
      var tabs2 = Array.prototype.slice.call(tabHost.querySelectorAll('[role="tab"]'));
      var cur = tabs2.indexOf(ev.target);
      if (cur >= 0) {
        ev.preventDefault();
        var next = ev.key === 'ArrowRight' ? (cur + 1) % tabs2.length : (cur - 1 + tabs2.length) % tabs2.length;
        try { tabs2[next].focus(); } catch (e) { /* fine */ }
      }
    }
    if (ev.key === 'Enter' && ev.target && ev.target.getAttribute) {
      var role = ev.target.getAttribute('data-role');
      if (role === 'row-number' || role === 'row-text') { commitInput(ev.target); }
    }
  }

  function onInput(ev) {
    var t = ev.target;
    if (t === els.search) {
      if (searchDebounce) window.clearTimeout(searchDebounce);
      var v = t.value;
      searchDebounce = window.setTimeout(function () { runSearch(v, true); }, 140);
      return;
    }
    if (t.id === 'c11AllQ') {
      ui.all.q = t.value;
      ui.all.scroll = 0;
      var rows = allFiltered();
      els.allList._rows = rows;
      els.allSpace.style.height = (rows.length * ALL_ROW_H) + 'px';
      els.allList.scrollTop = 0;
      paintAllWindow();
      var head = els.sheet.querySelector('.c11-dom-counts');
      if (head) head.textContent = fmtInt(rows.length) + ' of ' + fmtInt(allIndexRows().length);
      return;
    }
    if (t.classList && t.classList.contains('c11-slider')) {
      var wrap = t.parentNode;
      var out = wrap ? wrap.querySelector('.c11-slider-val') : null;
      if (out) out.textContent = String(t.value);
    }
  }

  function commitInput(t) {
    var id = t.getAttribute('data-id');
    var role = t.getAttribute('data-role');
    if (!id) return;
    if (role === 'row-number') {
      var n = t.value === '' ? NaN : Number(t.value);
      if (!isFinite(n)) { showRowError(id, 'Enter a number.'); return; }
      if (setValue(id, n)) refreshSheet();
    } else if (role === 'row-text') {
      if (setValue(id, t.value)) refreshSheet();
    } else if (role === 'row-slider') {
      var v = Number(t.value);
      if (setValue(id, v)) refreshSheet();
    }
  }

  function onChange(ev) {
    var t = ev.target;
    var role = t.getAttribute ? t.getAttribute('data-role') : null;
    if (role === 'row-number' || role === 'row-text' || role === 'row-slider') { commitInput(t); return; }
    if (role === 'copy-cat') {
      ui.copy.cats[t.getAttribute('data-cat')] = t.checked;
      renderCopy();
      return;
    }
  }

  function onClick(ev) {
    var btn = ev.target.closest ? ev.target.closest('[data-act]') : null;
    if (!btn || !root.contains(btn)) return;
    var act = btn.getAttribute('data-act');

    /* frame */
    if (act === 'tab-home' || act === 'go-home') { go({ route: 'home' }); return; }
    if (act === 'tab-go') {
      var g = null;
      TAB_GROUPS.forEach(function (x) { if (x.id === btn.getAttribute('data-tabid')) g = x; });
      if (g) {
        var cat = g.cats[0];
        if (g.cats.length > 1 && ui.dest.route === 'dest' && g.cats.indexOf(ui.dest.cat) >= 0) cat = ui.dest.cat;
        go({ route: 'dest', cat: cat });
      }
      return;
    }
    if (act === 'tabs-more') {
      var items = [{ id: '#/home', label: 'Home' }];
      arr(inventory().categories).forEach(function (c) {
        items.push({ id: destHash({ route: 'dest', cat: c.id }), label: c.title,
          note: (groupForCat(c.id) || {}).label, checked: ui.dest.route === 'dest' && ui.dest.cat === c.id });
      });
      items.push({ separator: true });
      items.push({ id: '#/all', label: 'All Settings' });
      items.push({ id: '#/copy', label: 'Copy Settings' });
      openMenu(btn, items, { title: 'All destinations', onPick: function (it) { go(it.id); } });
      return;
    }
    if (act === 'crumb-go') {
      var idx = Number(btn.getAttribute('data-idx'));
      var pile = ui.stack;
      if (!pile[idx] || idx === pile.length - 1) return;
      var lvl = pile[idx];
      if (ui.dest.route === 'copy' && lvl.key === 'copy') { ui.copy.step = 'pick'; renderSheet(true); return; }
      go(lvl.dest);
      return;
    }
    if (act === 'back') {
      var pile2 = ui.stack;
      if (pile2.length > 1) {
        var parent = pile2[pile2.length - 2];
        if (ui.dest.route === 'copy' && parent.key === 'copy') { ui.copy.step = ui.copy.step === 'receipt' ? 'preview' : 'pick'; renderSheet(true); return; }
        go(parent.dest);
      }
      return;
    }
    if (act === 'close-settings') {
      try { window.PM2.states.receipt('Close Settings', 'Returns to the Dashboard. This concept page has no app shell behind it, so nothing else changes.'); } catch (e) { toast('Simulated: Close Settings — returns to the Dashboard.'); }
      return;
    }
    if (act === 'notice-go' || act === 'dest-go') { go(btn.getAttribute('data-hash')); return; }

    /* home */
    if (act === 'attn-go') {
      var attn = els.sheet._attn || [];
      var a = attn[Number(btn.getAttribute('data-i'))];
      if (!a) return;
      if (a.trigger) { try { window.PM2.states.trigger(a.trigger); } catch (e2) { /* quiet */ } return; }
      if (a.dest) go(a.dest);
      return;
    }
    if (act === 'tile-go') { go({ route: 'dest', cat: btn.getAttribute('data-cat') }); return; }
    if (act === 'recent-go') { go({ route: 'setting', settingId: btn.getAttribute('data-id') }); return; }
    if (act === 'util-all') { closeDrop(); go({ route: 'all' }); return; }
    if (act === 'util-copy') { go({ route: 'copy' }); return; }

    /* domain */
    if (act === 'lens-go') { go({ route: 'dest', cat: btn.getAttribute('data-cat') }); return; }
    if (act === 'sub-go') {
      var sub = btn.getAttribute('data-sub');
      go({ route: 'dest', cat: ui.dest.cat, sub: sub || null });
      return;
    }
    if (act === 'mgr-go') { go({ route: 'manager', managerId: btn.getAttribute('data-manager') }); return; }
    if (act === 'adv-toggle') {
      var key = btn.getAttribute('data-key');
      ui.advOpen[key] = !ui.advOpen[key];
      refreshSheet();
      return;
    }

    /* rows */
    if (act === 'row-toggle') {
      var id0 = btn.getAttribute('data-id');
      var r0 = store.resolveRow(id0);
      if (r0 && setValue(id0, !(r0.value === true || r0.value === 'on'))) refreshSheet();
      return;
    }
    if (act === 'row-select') {
      var id1 = btn.getAttribute('data-id');
      var r1 = store.resolveRow(id1);
      if (!r1) return;
      openMenu(btn, arr(r1.control.options).map(function (o) {
        return { id: o, label: o, checked: o === r1.value };
      }), { title: r1.label, onPick: function (it) { if (setValue(id1, it.id)) refreshSheet(); } });
      return;
    }
    if (act === 'row-multi') {
      var id2 = btn.getAttribute('data-id');
      var r2 = store.resolveRow(id2);
      if (!r2) return;
      var cur = Array.isArray(r2.value) ? r2.value.slice() : [];
      openMenu(btn, arr(r2.control.options).map(function (o) {
        return { id: o, label: o, checked: cur.indexOf(o) >= 0 };
      }), { title: r2.label + ' — pick any', onPick: function (it, i2) {
        var ix = cur.indexOf(it.id);
        if (ix >= 0) cur.splice(ix, 1); else cur.push(it.id);
        setValue(id2, cur);
        it.checked = ix < 0;
        var b2 = ui.menu && ui.menu.el ? ui.menu.el.querySelector('[data-mi="' + i2 + '"]') : null;
        if (b2) {
          b2.classList.toggle('is-checked', it.checked);
          var ck = b2.querySelector('.c11-menu-check');
          if (ck) { ck.innerHTML = it.checked ? ico('check') : ''; hydrate(ck); }
        }
        return true; /* keep the menu open for more picks */
      } });
      return;
    }
    if (act === 'row-action') {
      var id3 = btn.getAttribute('data-id');
      var r3 = store.resolveRow(id3);
      try { window.PM2.states.receipt(r3 ? r3.label : 'Action', 'This opens in the full product. Nothing ran in this concept.'); } catch (e3) { /* quiet */ }
      return;
    }
    if (act === 'row-details') {
      var id4 = btn.getAttribute('data-id');
      ui.rowDrawer = ui.rowDrawer === id4 ? null : id4;
      refreshSheet();
      return;
    }
    if (act === 'extra-select') {
      var id5 = btn.getAttribute('data-id');
      var rec = extraRecord(id5);
      if (!rec) return;
      openMenu(btn, arr(rec.options).map(function (o) {
        return { id: o, label: o, checked: o === rec.value };
      }), { title: rec.label, onPick: function (it) {
        rec.value = it.id;
        try { window.PM2.states.receipt('Setting updated', rec.label + ' is now ' + it.id + '.'); } catch (e4) { /* quiet */ }
        refreshSheet();
      } });
      return;
    }
    if (act === 'extra-action') {
      var rec2 = extraRecord(btn.getAttribute('data-id'));
      try { window.PM2.states.receipt(rec2 ? rec2.label : 'Action', 'This opens in the full product. Nothing ran in this concept.'); } catch (e5) { /* quiet */ }
      return;
    }

    /* managers */
    if (act === 'mgr-actions') {
      var def0 = managerById(btn.getAttribute('data-manager-id') || ui.dest.managerId);
      if (def0) openActionsMenu(btn, def0);
      return;
    }
    if (act === 'mgr-run') {
      var def1 = managerById(btn.getAttribute('data-manager-id'));
      var actId = btn.getAttribute('data-actid');
      safeActions(def1).forEach(function (a) {
        if (a.id === actId && a.available !== false && typeof a.run === 'function') {
          try { a.run(store); } catch (e6) { toast('That action could not run.'); }
        }
      });
      return;
    }
    if (act === 'ritem-toggle') {
      var key2 = btn.getAttribute('data-key');
      ui.secOpen[key2] = !ui.secOpen[key2];
      refreshSheet();
      return;
    }
    if (act === 'inst-act') {
      runInstAction(btn.getAttribute('data-instact'), btn.getAttribute('data-oid'));
      return;
    }
    if (act === 'prov-open') {
      go({ route: 'manager', managerId: 'm.providers', objectId: btn.getAttribute('data-object-id'), tab: 'overview' });
      return;
    }
    if (act === 'ptab-go') {
      go({ route: 'manager', managerId: 'm.providers', objectId: btn.getAttribute('data-oid'), tab: btn.getAttribute('data-tab') });
      return;
    }

    /* all settings */
    if (act === 'facet-cat') { openFacetMenu('cat', btn); return; }
    if (act === 'facet-type') { openFacetMenu('type', btn); return; }
    if (act === 'facet-tier') { openFacetMenu('tier', btn); return; }
    if (act === 'facet-state') { openFacetMenu('state', btn); return; }
    if (act === 'facet-changed') { openFacetMenu('changed', btn); return; }
    if (act === 'facet-clear') {
      ui.all = { q: '', cat: '', type: '', tier: '', state: '', changed: '', scroll: 0 };
      renderAll();
      return;
    }
    if (act === 'all-open') {
      if (btn.getAttribute('data-stress') === '1') {
        toast('Stress fixture — a synthetic scale-test record, not a real setting.');
        return;
      }
      go({ route: 'setting', settingId: btn.getAttribute('data-setting-id') });
      return;
    }

    /* copy */
    if (act === 'copy-src') {
      ui.copy.sourceId = btn.getAttribute('data-src');
      ui.copy.cats = {};
      renderCopy();
      return;
    }
    if (act === 'copy-all-toggle') {
      var sources = copySources();
      var sel = null;
      sources.forEach(function (s) { if (s.id === ui.copy.sourceId) sel = s; });
      if (!sel) return;
      var allOn = true;
      arr(sel.categorySummaries).forEach(function (cs) { if (ui.copy.cats[cs.cat] === false) allOn = false; });
      arr(sel.categorySummaries).forEach(function (cs) { ui.copy.cats[cs.cat] = !allOn ? true : false; });
      renderCopy();
      return;
    }
    if (act === 'copy-preview') { copyDoPreview(); return; }
    if (act === 'copy-back') { ui.copy.step = 'pick'; renderSheet(true); return; }
    if (act === 'copy-kind') { ui.copy.kind = btn.getAttribute('data-kind'); renderCopyPreview(); return; }
    if (act === 'copy-item') {
      var cid = btn.getAttribute('data-id');
      ui.copy.openItems[cid] = !ui.copy.openItems[cid];
      renderCopyPreview();
      return;
    }
    if (act === 'copy-apply') { copyDoApply(); return; }
    if (act === 'copy-rollback') { copyDoRollback(); return; }

    /* search results */
    if (act === 'res-pick') { pickResult(btn.getAttribute('data-rid')); return; }
  }

  /* ================================================================
     STORE SUBSCRIPTIONS
     ================================================================ */

  function subscribe() {
    store.on('value', function (p) {
      ui.epoch += 1;
      ui.allCache = null;
      if (obj(p).source === 'copy-apply' || obj(p).source === 'copy-rollback') {
        /* the copy flow drives its own rendering */
        if (ui.dest.route !== 'copy') refreshSheet();
        return;
      }
      refreshSheet();
    });
    store.on('value-error', function (p) {
      if (p && p.id) showRowError(p.id, p.error);
    });
    store.on('scenario', function () {
      ui.epoch += 1; ui.allCache = null;
      renderSheet(false);
    });
    store.on('fixtures', function () {
      ui.epoch += 1; ui.allCache = null;
      renderSheet(false);
    });
    store.on('stress', function () {
      ui.epoch += 1; ui.allCache = null;
      if (ui.dest.route === 'all') renderSheet(false);
    });
    store.on('op', noteOp);
    store.on('receipt', function (p) { if (p && p.message) toast(p.message); });
    store.on('copy', function (p) {
      var ph = obj(p).phase;
      if (ph === 'rolled-back' && ui.copy.receipt && ui.dest.route === 'copy') {
        ui.copy.receipt.rolledBack = true;
      }
    });
    store.on('change', function (p) {
      /* scenario/fixtures writes without dedicated events (e.g. route-applied
         session state) still refresh the surfaces */
      var k = obj(p).key;
      if (k === 'scenario' || k === 'fixtures' || k === 'stress') {
        ui.epoch += 1; ui.allCache = null;
        renderSheet(false);
      }
    });
  }

  /* ================================================================
     BOOT
     ================================================================ */

  function boot() {
    stage = document.getElementById('pmStage');
    if (!stage) return;
    try { window.PMShell.init({ concept: 'c11-sheaf' }); } catch (e) { /* shell optional in harness */ }
    store = window.PM2.store.init('c11-sheaf');
    buildFrame();
    try { window.PM2.states.mountDrawer(store); } catch (e2) { /* drawer optional */ }
    subscribe();
    window.PM2.route.bind({ open: open });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
