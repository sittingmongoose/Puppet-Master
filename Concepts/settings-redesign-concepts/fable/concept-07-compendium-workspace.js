/* concept-07-compendium-workspace.js — fable · 07 Compendium
   A2 Compendium Workspace / Take 1 (bakeoff packet 2026-08-18).
   THE answer to thousands of settings: a persistent workspace rail
   (Home, All Settings, the 12 areas), a first-class faceted + virtualized
   All Settings compendium, information-forward domain pages with overview
   strips and curated key settings, integrated list/detail managers, and a
   copy transaction whose preview is the showpiece.
   Motion is minimal and utilitarian: pane crossfades only; the calm
   landing highlight originates at the row and decays once.
   Consumes _shared2 (PM2.*) exactly as CONTRACT2 specifies. Plain ES5-ish
   JS, no build step, no emoji. Slint notes inline where a technique is
   web-only. */
(function () {
  'use strict';

  var store = null;
  var stage = null;
  var root = null;          /* .c07-root */
  var contentEl = null;     /* .c07-content scroller */

  /* ============================ ui state ============================
     Explicit state machines (Slint-portable): route mirror, nav drawer,
     facet state, menu state, copy transaction state. No DOM-derived
     semantics — the DOM is always a projection of this object. */
  var ui = {
    narrow: false,
    navOpen: false,                    /* narrow: rail as one-pane push */
    view: { kind: 'home' },
    locate: null,                      /* pending {settingId|focus, explain} */
    explain: null,                     /* settingId with open About panel */
    advOpen: {},                       /* 'cat/sub' -> true (advanced tier) */
    moreOpen: {},                      /* 'cat/sub' -> true (rest of simple) */
    detailOpen: {},                    /* rowId -> details drawer open */
    mgrItemOpen: {},                   /* manager item id -> detail open */
    secOpen: {},                       /* managerId/sectionId -> advanced section open */
    rowError: {},                      /* settingId -> live validation message */
    notice: null,                      /* one-shot notice for the current view */
    search: { q: '', open: false, res: null, active: -1, anchor: null },
    all: {
      q: '',
      cat: null, type: null, tier: null, state: null, kind: null,
      changed: false,
      sort: 'inventory',
      filtersOpen: false
    },
    copy: { step: 1, sourceId: null, cats: {}, preview: null, applying: false,
            receipt: null, rolledBack: false, openItems: {} },
    ops: {},                           /* opKey -> last op payload */
    opsOrder: []
  };

  /* ============================ helpers ============================ */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function attr(o) { return esc(JSON.stringify(o)); }
  function ico(name) { return '<i data-ico="' + esc(name) + '"></i>'; }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object') ? x : {}; }
  function fmtInt(n) { return window.PM2.util.fmtInt(n); }
  function fmtAgo(w) { return window.PM2.util.fmtAgo(w); }

  function fmtWhen(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    try {
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch (e) { return String(iso); }
  }

  function inv() { return obj(window.PM2_INVENTORY); }
  function cats() { return arr(inv().categories); }
  function catById(id) {
    var c = cats();
    for (var i = 0; i < c.length; i++) if (c[i].id === id) return c[i];
    return null;
  }
  function subById(cat, subId) {
    var c = catById(cat);
    if (!c) return null;
    var subs = arr(c.subgroups);
    for (var i = 0; i < subs.length; i++) if (subs[i].id === subId) return subs[i];
    return null;
  }
  var invIndex = null;
  function invRow(id) {
    if (!invIndex) {
      invIndex = {};
      arr(inv().settings).forEach(function (s) { invIndex[s.id] = s; });
    }
    return invIndex[id] || null;
  }
  /* Active scenario/fixtures: URL-applied state is ephemeral (persist:false),
     so PM2.states is the authority; the store key is the fallback. */
  function scenario() {
    var S = window.PM2.states;
    if (S && typeof S.activeScenario === 'function') {
      try { return String(S.activeScenario() || 'baseline'); } catch (e) { /* fall through */ }
    }
    return String(store.get('scenario') || 'baseline');
  }
  function fixtures() {
    var S = window.PM2.states;
    if (S && typeof S.activeFixtures === 'function') {
      try { return arr(S.activeFixtures()); } catch (e) { /* fall through */ }
    }
    return arr(store.get('fixtures'));
  }
  function hasFx(id) { return fixtures().indexOf(id) >= 0; }
  function mgrs() { return window.PM2.managers; }

  function valueText(v) {
    if (v === undefined || v === null || v === '') return '—';
    if (v === true) return 'On';
    if (v === false) return 'Off';
    if (Array.isArray(v)) return v.length === 1 ? '1 item' : v.length + ' items';
    if (typeof v === 'object') {
      var k = Object.keys(v).length;
      return k === 1 ? '1 entry' : k + ' entries';
    }
    return String(v);
  }

  /* ============================ navigation ============================ */

  function nav(dest, params) {
    var d = obj(dest);
    var p = obj(params);
    if (d.sectionId && !p.focus) { p.focus = d.sectionId; }
    window.PM2.route.go(d, { params: p });
  }
  function navHash(dest, opts) { window.PM2.route.go(dest, opts || {}); }

  function catCrumb(catId) {
    var c = catById(catId);
    return c ? c.title : 'Settings';
  }

  function parentDest(view) {
    var v = view || ui.view;
    if (v.kind === 'home') return null;
    if (v.kind === 'dest' && v.sub) return { route: 'dest', cat: v.cat };
    if (v.kind === 'manager') {
      var def = mgrs().get(v.managerId);
      if (v.objectId) return { route: 'manager', managerId: v.managerId };
      if (def && def.cat) return { route: 'dest', cat: def.cat };
      return { route: 'home' };
    }
    return { route: 'home' };
  }
  function backLabel(view) {
    var p = parentDest(view);
    if (!p) return null;
    if (p.route === 'home') return 'Settings Home';
    if (p.route === 'dest') return catCrumb(p.cat);
    if (p.route === 'manager') {
      var def = mgrs().get(p.managerId);
      return def ? def.title : 'Manager';
    }
    return 'Settings Home';
  }

  /* The concept router: pm2-route calls this for every navigation.
     Idempotent — it recomputes ui.view from the dest and re-renders. */
  function open(dest) {
    var d = obj(dest);
    var kind = String(d.route || 'home');
    closeMenu(false);
    ui.search.open = false;
    ui.notice = null;
    ui.locate = null;
    ui.explain = null;
    ui.navOpen = false;
    pruneFinishedOps();

    if (kind === 'setting') {
      var row = invRow(d.settingId);
      if (row) {
        ui.view = { kind: 'dest', cat: row.cat, sub: row.sub };
        ui.locate = { settingId: row.id };
        ui.explain = row.id;
        ensureRowReachable(row);
      } else {
        var prefix = String(d.settingId || '').split('.')[0];
        if (prefix.indexOf('zz-stress') === 0) {
          ui.view = { kind: 'all' };
          ui.notice = 'That link points at a synthetic stress-fixture record. Stress records are scale-test data, not real settings — they appear in this index only while stress mode is on.';
        } else if (catById(prefix)) {
          ui.view = { kind: 'dest', cat: prefix, sub: null };
          ui.notice = 'The setting "' + String(d.settingId) + '" is not part of this demo inventory. Showing ' + catCrumb(prefix) + ' instead — nothing was changed.';
        } else {
          ui.view = { kind: 'home' };
          ui.notice = 'That settings link does not match anything in this demo inventory. Search below, or browse by area.';
        }
      }
    } else if (kind === 'dest') {
      if (!catById(d.cat)) {
        ui.view = { kind: 'home' };
        ui.notice = 'That area does not exist. Browse the areas below.';
      } else {
        var sub = d.sub && subById(d.cat, d.sub) ? d.sub : null;
        ui.view = { kind: 'dest', cat: d.cat, sub: sub };
        if (sub) ui.locate = { sectionSub: sub };
      }
    } else if (kind === 'manager') {
      var def = mgrs().get(d.managerId);
      if (!def) {
        ui.view = { kind: 'home' };
        ui.notice = 'That manager is not part of this demo. Browse the areas below, or search for what you were after.';
      } else {
        ui.view = { kind: 'manager', managerId: d.managerId, objectId: d.objectId || null, tab: d.tab || null };
        if (d.focus || d.sectionId) ui.locate = { focus: d.focus || d.sectionId };
      }
    } else if (kind === 'all') {
      ui.view = { kind: 'all' };
      if (d.focus) ui.locate = { focus: d.focus };
    } else if (kind === 'copy') {
      ui.view = { kind: 'copy' };
    } else if (kind === 'search') {
      ui.view = { kind: 'search', query: String(d.query || '') };
      ui.search.q = String(d.query || '');
    } else {
      ui.view = { kind: 'home' };
      if (d.focus) ui.locate = { focus: d.focus };
    }
    render();
    performLocate();
    return null;
  }

  /* Make sure a landing row will actually be in the DOM: open the simple
     overflow and/or advanced disclosure for its subgroup. */
  function ensureRowReachable(row) {
    var key = row.cat + '/' + row.sub;
    var rows = store.rowsFor(row.cat, row.sub);
    var visible = [];
    rows.forEach(function (r) {
      var rec = invRow(r.id);
      if (rec && (rec.curated || rec.tier === 'simple')) visible.push(r.id);
    });
    var idx = visible.indexOf(row.id);
    if (idx === -1) ui.advOpen[key] = true;               /* advanced tier */
    else if (visible.length > 9 && idx >= 7) ui.moreOpen[key] = true;
  }

  /* ============================ locate ============================ */

  var locateTimer = 0;
  function clearLocated() {
    var prev = stage.querySelectorAll('.pm2-located');
    for (var i = 0; i < prev.length; i++) {
      prev[i].classList.remove('pm2-located');
      prev[i].classList.remove('c07-locate');
    }
  }

  function performLocate() {
    if (!ui.locate) return;
    var want = ui.locate;
    ui.locate = null;
    var el = null;
    if (want.settingId) {
      el = contentEl && contentEl.querySelector('[data-setting-id="' + cssEsc(want.settingId) + '"]');
    } else if (want.sectionSub) {
      el = contentEl && contentEl.querySelector('[data-section="' + cssEsc(want.sectionSub) + '"]');
      if (el) { scrollToEl(el, 'start'); return; }
    } else if (want.focus) {
      el = findByFocus(String(want.focus));
    }
    if (!el) return;
    clearLocated();
    el.classList.add('pm2-located');
    el.classList.add('c07-locate');
    scrollToEl(el, 'center');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (e) { try { el.focus(); } catch (e2) { /* ok */ } }
    /* The tint decays via CSS (single run; reduced motion = one static
       step). The class itself stays until the next navigation so the
       harness can observe the landing element. */
    if (locateTimer) { clearTimeout(locateTimer); locateTimer = 0; }
  }

  function findByFocus(focus) {
    var id = focus;
    if (/^[smoawduh]:/.test(id)) {
      var kind = id.charAt(0);
      var rest = id.slice(2);
      if (kind === 's') return contentEl.querySelector('[data-setting-id="' + cssEsc(rest) + '"]');
      if (kind === 'm') {
        return contentEl.querySelector('[data-manager="' + cssEsc(rest) + '"]') ||
               contentEl.querySelector('.c07-mgrhead');
      }
      if (kind === 'o' || kind === 'u' || kind === 'd') {
        /* Managed-object-shaped focus ids ("<kind>:<managerId>/<objectId>"):
           resolve via the objectId segment; u:/d: results locate exactly
           like o: instead of silently shadowing the deep-link fallback. */
        var parts = rest.split('/');
        /* bare ids ("u:env.x") have no manager segment — use the whole id */
        var childId = parts.length > 1 ? parts.slice(1).join('/') : rest;
        return contentEl.querySelector('[data-object-id="' + cssEsc(childId) + '"]') ||
               contentEl.querySelector('[data-object-id="' + cssEsc(rest) + '"]') ||
               contentEl.querySelector('[data-item-id="' + cssEsc(childId) + '"]') ||
               /* deepest the data allows: land on the open detail section */
               contentEl.querySelector('.c07-mgr-detail [data-section]') ||
               contentEl.querySelector('.c07-mgrhead');
      }
      id = rest;
    }
    return contentEl.querySelector('[data-setting-id="' + cssEsc(id) + '"]') ||
           contentEl.querySelector('[data-object-id="' + cssEsc(id) + '"]') ||
           contentEl.querySelector('[data-section="' + cssEsc(id) + '"]') ||
           contentEl.querySelector('[data-item-id="' + cssEsc(id) + '"]') ||
           document.getElementById(id);
  }

  function scrollToEl(el, block) {
    try { el.scrollIntoView({ block: block || 'center' }); }
    catch (e) { el.scrollIntoView(); }
  }

  function cssEsc(s) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(s));
    return String(s).replace(/["\\#.:>~[\]()]/g, '\\$&');
  }

  /* ============================ skeleton ============================ */

  function buildSkeleton() {
    stage.innerHTML =
      '<div class="c07-root" id="c07Root">' +
        '<nav class="c07-rail" id="c07Rail" aria-label="Settings workspace"></nav>' +
        '<div class="c07-main">' +
          '<div class="c07-topbar" id="c07Topbar"></div>' +
          '<div class="c07-content" id="c07Content"></div>' +
        '</div>' +
      '</div>';
    root = document.getElementById('c07Root');
    contentEl = document.getElementById('c07Content');
    root.addEventListener('click', onRootClick);
    document.addEventListener('keydown', onKeydown);
    watchWidth();
  }

  /* ============================ rail ============================ */

  function railHtml() {
    var counts = store.counts();
    var v = ui.view;
    var h = '';
    h += '<div class="c07-rail-label">Workspace</div>';
    h += railItem('home', 'Home', 'grid', v.kind === 'home', null);
    h += railItem('all', 'All Settings', 'list', v.kind === 'all',
      '<span class="c07-rail-count">' + fmtInt(counts.total) + '</span>');
    h += railItem('copy', 'Copy Settings', 'copy', v.kind === 'copy', null);
    /* "Settings by area", not bare "Areas": these counts are store.counts(),
       i.e. settings + actions, and they sum to the 828 on the All Settings row
       above. The AREA facet on the compendium counts RECORDS (managers and
       diagnostics too) against the same twelve labels, so both columns now say
       which scope they are counting instead of quietly disagreeing. */
    h += '<div class="c07-rail-label">Settings by area</div>';
    counts.byCategory.forEach(function (c) {
      var active = (v.kind === 'dest' && v.cat === c.id) ||
        (v.kind === 'manager' && (mgrs().get(v.managerId) || {}).cat === c.id);
      h += '<button type="button" class="c07-rail-item' + (active ? ' is-active' : '') + '" ' +
        'data-act="nav" data-dest="' + attr({ route: 'dest', cat: c.id }) + '" ' +
        (active ? 'aria-current="page" ' : '') + '>' +
        ico(c.icon || 'gear') + '<span>' + esc(c.title) + '</span>' +
        '<span class="c07-rail-count">' + fmtInt(c.total) + '</span></button>';
    });
    h += '<div class="c07-rail-foot">Project: Puppet Master<br>Role: ' +
      esc(obj(store.data.project).role || 'Project Admin') + '</div>';
    return h;
  }
  function railItem(route, label, icon, active, extra) {
    return '<button type="button" class="c07-rail-item' + (active ? ' is-active' : '') + '" ' +
      'data-act="nav" data-dest="' + attr({ route: route }) + '"' +
      (active ? ' aria-current="page"' : '') + '>' +
      ico(icon) + '<span>' + esc(label) + '</span>' + (extra || '') + '</button>';
  }

  /* ============================ topbar ============================ */

  function topbarHtml() {
    var v = ui.view;
    var h = '';
    h += '<button type="button" class="c07-btn c07-btn-quiet c07-navbtn" data-act="toggle-nav" aria-expanded="' + (ui.navOpen ? 'true' : 'false') + '">' + ico('rail') + 'Browse</button>';
    var back = backLabel(v);
    if (back) {
      h += '<button type="button" class="c07-btn c07-btn-quiet" data-act="back" data-pm2-back title="Back one Settings level">' +
        ico('undo') + '<span class="c07-back-name">Back to ' + esc(back) + '</span></button>';
    }
    h += '<div class="c07-crumbs">' + crumbsHtml(v) + '</div>';
    if (hasFx('fx.loading-cached')) {
      h += '<span class="c07-refresh-pill" title="A refresh is running; cached values stay visible meanwhile.">' +
        ico('refresh') + 'Refreshing — showing cached values</span>';
    }
    h += '<span class="c07-project-chip">Project: Puppet Master</span>';
    if (v.kind !== 'home') {
      h += '<div class="c07-searchwrap" id="c07TopSearch">' + searchFieldHtml('top') + '</div>';
    } else {
      h += '<span style="margin-left:auto"></span>';
    }
    h += '<button type="button" class="c07-btn c07-btn-quiet" data-act="close-settings" title="Close Settings">' +
      ico('close') + 'Close Settings</button>';
    return h;
  }

  function crumbsHtml(v) {
    var parts = [];
    function link(label, dest) {
      return '<button type="button" class="c07-crumb" data-act="nav" data-dest="' + attr(dest) + '">' + esc(label) + '</button>';
    }
    function here(label) { return '<span class="c07-crumb is-here">' + esc(label) + '</span>'; }
    var sep = '<span class="c07-crumb-sep">/</span>';
    if (v.kind === 'home') {
      parts.push(here('Settings'));
    } else {
      parts.push(link('Settings', { route: 'home' }));
      if (v.kind === 'all') parts.push(here('All Settings'));
      else if (v.kind === 'copy') parts.push(here('Copy Settings'));
      else if (v.kind === 'search') parts.push(here('Search'));
      else if (v.kind === 'dest') {
        if (v.sub) {
          parts.push(link(catCrumb(v.cat), { route: 'dest', cat: v.cat }));
          parts.push(here((subById(v.cat, v.sub) || {}).title || v.sub));
        } else {
          parts.push(here(catCrumb(v.cat)));
        }
      } else if (v.kind === 'manager') {
        var def = mgrs().get(v.managerId) || {};
        if (def.cat && catById(def.cat)) parts.push(link(catCrumb(def.cat), { route: 'dest', cat: def.cat }));
        if (v.objectId) {
          parts.push(link(def.title || v.managerId, { route: 'manager', managerId: v.managerId }));
          parts.push(here(objectLabel(v.managerId, v.objectId)));
        } else {
          parts.push(here(def.title || v.managerId));
        }
      }
    }
    return parts.join(sep);
  }

  function objectLabel(managerId, objectId) {
    var def = mgrs().get(managerId);
    if (def) {
      try {
        var vm = def.model(store);
        if (vm && vm.pages && vm.pages[objectId] && vm.pages[objectId].title) return vm.pages[objectId].title;
      } catch (e) { /* fall through */ }
      try {
        var objs = arr(def.objects(store));
        for (var i = 0; i < objs.length; i++) if (objs[i].id === objectId) return objs[i].label;
      } catch (e2) { /* fall through */ }
    }
    return objectId;
  }

  /* ============================ universal search ============================ */

  function searchFieldHtml(anchor) {
    var placeholder = anchor === 'hero'
      ? 'Search all settings, managers, and actions'
      : 'Search settings';
    return '<div class="c07-search">' + ico('search') +
      '<input type="text" data-pm2-search-input data-search-anchor="' + esc(anchor) + '" placeholder="' + esc(placeholder) + '" ' +
      'value="' + esc(ui.search.anchor === anchor ? ui.search.q : (ui.view.kind === 'search' ? ui.search.q : '')) + '" ' +
      'aria-label="Search settings" autocomplete="off" spellcheck="false">' +
      '<kbd>Ctrl K</kbd></div>' +
      '<div class="c07-dropdown" data-dd-anchor="' + esc(anchor) + '" hidden></div>';
  }

  function wireSearchFields() {
    var inputs = stage.querySelectorAll('input[data-search-anchor]');
    for (var i = 0; i < inputs.length; i++) wireSearchInput(inputs[i]);
  }

  function wireSearchInput(input) {
    var anchor = input.getAttribute('data-search-anchor');
    input.addEventListener('input', function () {
      ui.search.q = input.value;
      ui.search.anchor = anchor;
      runDropdownSearch(anchor);
    });
    input.addEventListener('focus', function () {
      ui.search.anchor = anchor;
      if (input.value.trim()) runDropdownSearch(anchor);
    });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        if (!ui.search.open) { runDropdownSearch(anchor); return; }
        ev.preventDefault();
        moveDropdownActive(ev.key === 'ArrowDown' ? 1 : -1, anchor);
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        var items = ddItems(anchor);
        if (ui.search.open && ui.search.active >= 0 && items[ui.search.active]) {
          items[ui.search.active].click();
        } else if (input.value.trim()) {
          closeDropdown();
          navHash({ route: 'search', query: input.value.trim() });
        }
      } else if (ev.key === 'Escape') {
        if (ui.search.open) {
          ev.stopPropagation();
          ev.preventDefault();
          closeDropdown();
        }
      }
    });
  }

  var searchSeq = 0;
  function runDropdownSearch(anchor) {
    var q = ui.search.q.trim();
    var seq = ++searchSeq;               /* latest-request-wins */
    if (!q) { closeDropdown(); return; }
    var res = window.PM2.search.query(q, { limit: 24 });
    if (seq !== searchSeq) return;
    ui.search.res = res;
    ui.search.open = true;
    ui.search.active = -1;
    renderDropdown(anchor);
  }

  function ddContainer(anchor) {
    return stage.querySelector('.c07-dropdown[data-dd-anchor="' + anchor + '"]');
  }
  function ddItems(anchor) {
    var dd = ddContainer(anchor || ui.search.anchor);
    return dd ? dd.querySelectorAll('.c07-dd-item') : [];
  }

  function renderDropdown(anchor) {
    var dd = ddContainer(anchor);
    if (!dd) return;
    var res = ui.search.res;
    var h = '';
    if (!res || !res.total) {
      h += '<div class="c07-dd-empty"><strong>No matches for "' + esc(ui.search.q.trim()) + '"</strong>' +
        '<span class="c07-note">Nothing in settings, managers, actions, or help matches. ' +
        'Try a different word — search also understands close misspellings — or browse the areas in the left rail.</span></div>';
    } else {
      res.groups.forEach(function (g) {
        h += '<div class="c07-dd-group">' + esc(g.label) + '</div>';
        g.results.forEach(function (r) {
          h += ddItemHtml(r);
        });
      });
      h += '<div class="c07-dd-foot">' + fmtInt(res.total) + ' result' + (res.total === 1 ? '' : 's') +
        ' — Enter opens the full results page</div>';
    }
    dd.innerHTML = h;
    dd.hidden = false;
    window.PMIcons.hydrate(dd);
  }

  function ddItemHtml(r) {
    var path = arr(r.path).join(' › ');
    var h = '<button type="button" class="c07-dd-item" data-act="pick-result" data-rid="' + esc(r.rid) + '" ' +
      'data-dest="' + attr(r.dest) + '">';
    h += '<span class="c07-dd-line1"><span class="c07-dd-label">' + esc(r.label) + '</span>' +
      '<span class="c07-dd-kind">' + esc(kindWord(r.kind)) + '</span>' +
      (r.sub ? '<span class="c07-dd-kind">' + esc(r.sub) + '</span>' : '') + '</span>';
    h += '<span class="c07-dd-path">' + esc(path) + '</span>';
    if (r.availability) h += '<span class="c07-dd-avail">' + esc(r.availability) + '</span>';
    h += '</button>';
    return h;
  }

  function kindWord(kind) {
    var words = { setting: 'Setting', manager: 'Manager', object: 'Object', action: 'Action',
      workflow: 'Setup', diagnostic: 'Status', unavailable: 'Unavailable', help: 'Help' };
    return words[kind] || kind;
  }

  function moveDropdownActive(delta, anchor) {
    var items = ddItems(anchor);
    if (!items.length) return;
    var next = ui.search.active + delta;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    if (ui.search.active >= 0 && items[ui.search.active]) items[ui.search.active].classList.remove('is-active');
    ui.search.active = next;
    items[next].classList.add('is-active');
    try { items[next].scrollIntoView({ block: 'nearest' }); } catch (e) { /* ok */ }
  }

  function closeDropdown() {
    ui.search.open = false;
    ui.search.active = -1;
    var dds = stage.querySelectorAll('.c07-dropdown');
    for (var i = 0; i < dds.length; i++) dds[i].hidden = true;
  }

  /* Selecting a result: record the query as a real history entry first so
     Back restores the query AND its results, then route by dest (never by
     index or label). */
  function pickResult(rid, dest) {
    var q = ui.search.q.trim();
    closeDropdown();
    if (q && ui.view.kind !== 'search') {
      window.PM2.route.go({ route: 'search', query: q }, { silent: true });
    }
    var d = obj(dest);
    var params = {};
    if (d.route === 'setting') { /* landing sequence handled by open() */ }
    else if (d.sectionId) params.focus = d.sectionId;
    else if (rid && /^[moawduh]:/.test(rid)) params.focus = rid; /* every non-setting kind lands + locates */
    nav(d, params);
  }

  /* ============================ search results page ============================ */

  function searchPageHtml() {
    var q = ui.view.query || '';
    var res = q ? window.PM2.search.query(q, { limit: 60 }) : null;
    var h = '<div class="c07-pane">';
    h += '<p class="c07-kicker">Universal search</p>';
    h += '<h1 class="c07-h1">Search results</h1>';
    h += '<div class="c07-searchwrap c07-searchpage-field" id="c07PageSearch">' + searchFieldHtml('page') + '</div>';
    if (!q) {
      h += '<p class="c07-lede">Type above to search all ' + fmtInt(store.counts().total) +
        ' settings, every manager, managed objects, actions, setup workflows, and help.</p>';
    } else if (!res || !res.total) {
      h += '<div class="c07-notice">' + ico('info') + '<div><strong>No matches for "' + esc(q) + '".</strong> ' +
        'Nothing in settings, managers, actions, setup workflows, diagnostics, or help matches that. ' +
        'Search understands close misspellings, so a typo is usually fine — this one just is not close to anything. ' +
        'Browse the areas in the left rail, or open <button type="button" class="c07-crumb" data-act="nav" data-dest="' +
        attr({ route: 'all' }) + '" style="display:inline"><u>All Settings</u></button> to scan the complete index.</div></div>';
    } else {
      h += '<p class="c07-lede">' + fmtInt(res.total) + ' result' + (res.total === 1 ? '' : 's') + ' for "' + esc(q) + '".' +
        (res.query !== q ? '' : '') + '</p><div style="height:10px"></div>';
      res.groups.forEach(function (g) {
        h += '<div class="c07-sr-group"><div class="c07-section-head"><h2 class="c07-h2">' + esc(g.label) +
          '</h2><span class="c07-section-count">' + g.results.length + '</span></div>';
        g.results.forEach(function (r) {
          h += '<button type="button" class="c07-sr-row" data-act="pick-result" data-rid="' + esc(r.rid) + '" data-dest="' + attr(r.dest) + '">' +
            '<span class="c07-dd-line1"><span class="c07-dd-label">' + esc(r.label) + '</span>' +
            '<span class="c07-dd-kind">' + esc(kindWord(r.kind)) + '</span>' +
            (r.sub ? '<span class="c07-dd-kind">' + esc(r.sub) + '</span>' : '') + '</span>' +
            '<span class="c07-dd-path">' + esc(arr(r.path).join(' › ')) + '</span>' +
            (r.availability ? '<span class="c07-dd-avail">' + esc(r.availability) + '</span>' : '') +
            '</button>';
        });
        h += '</div>';
      });
    }
    h += '</div>';
    return h;
  }

  /* ============================ home ============================ */

  function homeHtml() {
    var counts = store.counts();
    var scen = scenario();
    var h = '<div class="c07-pane">';

    h += '<div class="c07-home-head">';
    h += '<p class="c07-kicker">Puppet Master · Project Settings</p>';
    h += '<h1 class="c07-h1">Welcome to Project Settings</h1>';
    h += '<p class="c07-lede">Search or browse to configure how Puppet Master works in this project. ' +
      'Everything here applies to the <strong>Puppet Master</strong> project only.</p>';
    h += '</div>';

    h += '<div class="c07-searchwrap c07-hero-search" id="c07HeroSearch">' + searchFieldHtml('hero') + '</div>';

    var banner = criticalBanner();
    if (banner) h += banner;

    if (ui.notice) h += '<div class="c07-notice">' + ico('info') + '<div>' + esc(ui.notice) + '</div></div>';

    /* needs attention — compact list (store list + fixture-overlay notices) */
    var attn = store.attention();
    arr(store.data.notices).forEach(function (n) {
      if (!n || String(n.id).indexOf('pm2-fx-') !== 0) return;
      var dest = n.target && n.target.settingId ? { route: 'setting', settingId: n.target.settingId }
        : (n.target && n.target.cat ? { route: 'dest', cat: n.target.cat, sub: n.target.sub || null } : { route: 'home' });
      attn.push({
        id: n.id,
        statusWord: n.statusWord === 'Needs attention' ? 'Attention' : (n.statusWord || 'Notice'),
        headline: n.headline, consequence: n.consequence, dest: dest
      });
    });
    if (attn.length > 6) attn = attn.slice(0, 6);
    h += '<div class="c07-attn"><div class="c07-section-head"><h2 class="c07-h2">Needs attention</h2>' +
      '<span class="c07-section-count">' + attn.length + '</span></div>';
    if (!attn.length) {
      h += '<div class="c07-attn-empty">' + (scen === 'first-run'
        ? 'Nothing yet — this is a fresh project running on its defaults. Browse an area below to make it yours.'
        : 'Nothing needs attention right now.') + '</div>';
    } else {
      attn.forEach(function (a) {
        h += '<button type="button" class="c07-attn-item" data-act="nav" data-dest="' + attr(a.dest) + '">' +
          '<span class="c07-attn-word"><span class="pm-status-word" data-tone="' +
          (a.statusWord === 'Watch' || a.statusWord === 'Waiting' ? 'setup' : 'attention') + '">' + esc(a.statusWord) + '</span></span>' +
          '<span class="c07-attn-body"><strong>' + esc(a.headline) + '</strong><span>' + esc(a.consequence) + '</span></span>' +
          '</button>';
      });
    }
    h += '</div>';

    /* the 12 areas — dominant content */
    h += '<div class="c07-section-head"><h2 class="c07-h2">Browse by area</h2>' +
      '<span class="c07-section-count">' + counts.byCategory.length + ' areas · ' + fmtInt(counts.total) + ' settings</span></div>';
    h += '<div class="c07-cat-grid">';
    counts.byCategory.forEach(function (c) {
      h += '<button type="button" class="c07-cat-card" data-act="nav" data-dest="' + attr({ route: 'dest', cat: c.id }) + '">' +
        ico(c.icon || 'gear') +
        '<span class="c07-cat-body"><span class="c07-cat-name">' + esc(c.title) + '</span>' +
        '<span class="c07-cat-desc">' + esc(c.desc || '') + '</span>' +
        '<span class="c07-cat-meta">' + fmtInt(c.total) + ' settings' +
        (c.changed ? ' · ' + c.changed + ' changed' : '') + '</span></span></button>';
    });
    h += '</div>';

    /* secondary utilities */
    h += '<div class="c07-home-utils">';
    h += '<button type="button" class="c07-util" data-act="nav" data-dest="' + attr({ route: 'all' }) + '">' + ico('list') +
      '<span style="min-width:0"><strong>All Settings</strong><span>The complete searchable compendium — ' +
      fmtInt(counts.total) + ' settings, faceted and sortable.</span></span></button>';
    h += '<button type="button" class="c07-util" data-act="nav" data-dest="' + attr({ route: 'copy' }) + '">' + ico('copy') +
      '<span style="min-width:0"><strong>Copy Settings From Another Project</strong><span>A one-time reviewed transaction. ' +
      'Projects stay independent afterward.</span></span></button>';
    h += '</div>';

    /* recently changed */
    var recents = scen === 'first-run' ? [] : store.recents().slice(0, 6);
    h += '<div class="c07-recents"><div class="c07-section-head"><h2 class="c07-h2">Recently changed</h2>' +
      '<span class="c07-section-count">' + recents.length + '</span></div>';
    if (!recents.length) {
      h += '<div class="c07-attn-empty">' + (scen === 'first-run'
        ? 'No changes yet. Once you change a setting it shows up here for quick return.'
        : 'No recent changes recorded.') + '</div>';
    } else {
      recents.forEach(function (r) {
        h += '<button type="button" class="c07-recent-row" data-act="nav" data-dest="' +
          attr({ route: 'setting', settingId: r.settingId }) + '">' +
          '<span class="c07-recent-label">' + esc(r.label) + '</span>' +
          '<span class="c07-recent-change">' + esc(r.fromLabel || '—') + ' → ' + esc(r.toLabel || '—') +
          (r.note ? ' · ' + esc(r.note) : '') + '</span>' +
          '<span class="c07-recent-when">' + esc(fmtAgo(r.when)) + '</span></button>';
      });
    }
    h += '</div>';

    h += '</div>';
    return h;
  }

  function criticalBanner() {
    var scen = scenario();
    if (scen === 'offline') {
      return '<div class="c07-banner">' + ico('warning') + '<div><strong>No network connection detected.</strong>' +
        '<span>Provider status, web search, and update checks are paused. Cached values stay visible; everything resumes when the connection returns.</span></div></div>';
    }
    if (scen === 'usage-exhausted') {
      return '<div class="c07-banner">' + ico('hourglass') + '<div><strong>The Claude included-usage window is exhausted.</strong>' +
        '<span>New runs queue or fall back to the secondary route until the 6:00 PM reset. Review usage behavior under AI Brains &amp; Providers.</span></div></div>';
    }
    if (scen === 'invocation-failed') {
      return '<div class="c07-banner">' + ico('warning') + '<div><strong>A provider invocation failed on the last run.</strong>' +
        '<span>The affected route is flagged in the AI Providers manager with its diagnostics. Runs on other routes are unaffected.</span></div></div>';
    }
    if (hasFx('fx.doom-loop-tripped')) {
      return '<div class="c07-banner">' + ico('shield') + '<div><strong>A run is paused by the doom-loop guard.</strong>' +
        '<span>The same denied operation was retried three times; the run is waiting for you under Permissions &amp; Safety.</span></div></div>';
    }
    return null;
  }

  /* ============================ domain pages ============================ */

  function domainHtml(catId) {
    var c = catById(catId);
    var counts = store.counts();
    var cCount = null;
    counts.byCategory.forEach(function (x) { if (x.id === catId) cCount = x; });
    var managers = mgrs().byCat(catId);
    var h = '<div class="c07-pane">';

    if (ui.notice) h += '<div class="c07-notice">' + ico('info') + '<div>' + esc(ui.notice) + '</div></div>';

    h += '<div class="c07-domain-head">';
    h += '<p class="c07-kicker">Area · ' + esc(String(cCount ? fmtInt(cCount.total) : '')) + ' settings</p>';
    h += '<h1 class="c07-h1">' + esc(c.title) + '</h1>';
    h += '<p class="c07-lede">' + esc(c.desc || '') + '</p>';
    h += '</div>';

    /* overview strip: key facts from curated + headline rows */
    var facts = domainFacts(catId);
    if (facts.length) {
      h += '<div class="c07-facts">';
      facts.forEach(function (f) {
        h += '<button type="button" class="c07-fact" data-act="fact" data-id="' + esc(f.id) + '">' +
          '<span class="c07-fact-k">' + esc(f.k) + '</span>' +
          '<span class="c07-fact-v">' + esc(f.v) + '</span>' +
          '<span class="c07-fact-s">' + esc(f.s) + '</span></button>';
      });
      h += '</div>';
    }

    /* key settings: curated rows of the whole category */
    var curatedRows = [];
    arr(inv().settings).forEach(function (s) {
      if (s.cat === catId && s.curated) curatedRows.push(store.resolveRow(s.id));
    });
    if (curatedRows.length) {
      h += '<div class="c07-section"><div class="c07-section-head"><h2 class="c07-h2">Key settings</h2>' +
        '<span class="c07-section-count">' + curatedRows.length + '</span></div>';
      curatedRows.forEach(function (r) { h += rowHtml(r, 'key'); });
      h += '</div>';
    }

    /* full subgroup sections */
    arr(c.subgroups).forEach(function (g) {
      h += subgroupHtml(catId, g);
    });

    /* related managers */
    if (managers.length) {
      h += '<div class="c07-section"><div class="c07-section-head"><h2 class="c07-h2">Related managers</h2>' +
        '<span class="c07-section-count">' + managers.length + '</span></div>' +
        '<div class="c07-mgr-panel">';
      managers.forEach(function (def) {
        h += managerLinkHtml(def);
      });
      h += '</div></div>';
    }

    h += '</div>';
    return h;
  }

  function managerLinkHtml(def) {
    var deferred = def.status === 'deferred_named_owner';
    return '<button type="button" class="c07-mgr-link" data-act="nav" data-manager="' + esc(def.id) + '" ' +
      'data-dest="' + attr({ route: 'manager', managerId: def.id }) + '">' +
      ico(def.icon || 'gear') +
      '<span style="min-width:0"><span class="c07-mgr-name">' + esc(def.title) + '</span>' +
      '<span class="c07-mgr-blurb">' + esc(def.blurb || '') + '</span></span>' +
      (deferred ? '<span class="c07-mgr-flag">Owner module reserved</span>' : '') +
      '<span class="c07-mgr-go">' + ico('external') + '</span></button>';
  }

  function domainFacts(catId) {
    var facts = [];
    arr(inv().settings).forEach(function (s) {
      if (s.cat !== catId || !s.curated || facts.length >= 4) return;
      var r = store.resolveRow(s.id);
      if (!r || r.control.type === 'action') return;
      facts.push({
        id: r.id, k: r.label,
        v: r.valueLabel || '—',
        s: r.state !== 'normal' ? stateWord(r.state) : (r.changedFromDefault ? 'Changed from default' : 'Default')
      });
    });
    if (facts.length < 4) {
      var counts = store.counts();
      counts.byCategory.forEach(function (x) {
        if (x.id !== catId) return;
        facts.push({ id: '', k: 'Changed here', v: String(x.changed), s: 'of ' + fmtInt(x.total) + ' settings' });
      });
    }
    return facts;
  }

  function stateWord(state) {
    var words = {
      managed: 'Managed by workspace policy',
      unavailable: 'Unavailable right now',
      'restart-required': 'Waiting for restart',
      'reconnect-required': 'Reconnect required',
      'changed-elsewhere': 'Changed elsewhere',
      error: 'Needs a valid value'
    };
    return words[state] || state;
  }

  /* States a collapsed disclosure must not silently swallow. Errors force
     the tier open; the rest annotate the toggle so nothing urgent hides. */
  var ATTENTION_STATES = { 'error': 1, 'restart-required': 1, 'reconnect-required': 1, 'changed-elsewhere': 1 };
  function attentionIn(list) {
    var n = 0, err = false;
    list.forEach(function (r) {
      if (ATTENTION_STATES[r.state]) { n += 1; if (r.state === 'error') err = true; }
    });
    return { n: n, err: err };
  }
  function attentionNote(a) {
    if (!a.n) return '';
    return '<span class="c07-adv-attn">' + a.n + ' need' + (a.n === 1 ? 's' : '') + ' attention</span>';
  }

  function subgroupHtml(catId, g) {
    var key = catId + '/' + g.id;
    var rows = store.rowsFor(catId, g.id);
    var visible = [];
    var advanced = [];
    rows.forEach(function (r) {
      var rec = invRow(r.id);
      if (rec && (rec.curated || rec.tier === 'simple')) visible.push(r);
      else advanced.push(r);
    });
    /* a live validation error must never sit behind a closed disclosure */
    if (!ui.advOpen[key] && attentionIn(advanced).err) ui.advOpen[key] = true;
    var h = '<div class="c07-section" data-section="' + esc(g.id) + '">';
    h += '<div class="c07-section-head"><h2 class="c07-h2">' + esc(g.title) + '</h2>' +
      '<span class="c07-section-count">' + rows.length + ' settings</span></div>';
    if (g.desc) h += '<p class="c07-lede c07-section-desc">' + esc(g.desc) + '</p>';

    var firstRun = visible;
    var overflow = [];
    if (visible.length > 9 && !ui.moreOpen[key]) {
      firstRun = visible.slice(0, 7);
      overflow = visible.slice(7);
    } else if (visible.length > 9) {
      firstRun = visible.slice(0, 7);
      overflow = visible.slice(7);
    }
    firstRun.forEach(function (r) { h += rowHtml(r); });

    if (overflow.length) {
      if (ui.moreOpen[key]) {
        h += '<div class="c07-section-head" style="margin-top:10px"><h2 class="c07-h2" style="font-size:var(--fs-sm)">More everyday settings</h2>' +
          '<span class="c07-section-count">' + overflow.length + '</span></div>';
        overflow.forEach(function (r) { h += rowHtml(r); });
        h += '<button type="button" class="c07-adv-toggle" data-act="more" data-key="' + esc(key) + '" aria-expanded="true">' +
          ico('minus') + 'Show fewer settings in ' + esc(g.title) + '</button>';
      } else {
        h += '<button type="button" class="c07-adv-toggle" data-act="more" data-key="' + esc(key) + '" aria-expanded="false">' +
          ico('plus') + 'Show ' + overflow.length + ' more in ' + esc(g.title) +
          attentionNote(attentionIn(overflow)) + '</button>';
      }
    }

    if (advanced.length) {
      if (ui.advOpen[key]) {
        h += '<div class="c07-section-head" style="margin-top:10px"><h2 class="c07-h2" style="font-size:var(--fs-sm)">Advanced</h2>' +
          '<span class="c07-section-count">' + advanced.length + '</span></div>';
        advanced.forEach(function (r) { h += rowHtml(r); });
        h += '<button type="button" class="c07-adv-toggle" data-act="adv" data-key="' + esc(key) + '" aria-expanded="true">' +
          ico('minus') + 'Hide advanced settings</button>';
      } else {
        h += '<button type="button" class="c07-adv-toggle" data-act="adv" data-key="' + esc(key) + '" aria-expanded="false">' +
          ico('plus') + 'Show ' + advanced.length + ' advanced setting' + (advanced.length === 1 ? '' : 's') +
          attentionNote(attentionIn(advanced)) + '</button>';
      }
    }
    h += '</div>';
    return h;
  }

  /* ============================ inventory row ============================ */

  function rowHtml(r, variant) {
    if (!r) return '';
    var h = '<div class="c07-row" data-setting-id="' + esc(r.id) + '" data-state="' + esc(r.state) + '"' +
      (variant === 'key' ? ' data-variant="key"' : '') + '>';
    h += '<div class="c07-row-main">';
    h += '<div class="c07-row-title"><span class="c07-row-label">' + esc(r.label) + '</span>';
    arr(r.badges).forEach(function (b) {
      h += '<span class="c07-row-badge">' + esc(badgeWord(b)) + '</span>';
    });
    if (variant === 'key') {
      var rec = invRow(r.id);
      if (rec) h += '<span class="c07-row-badge">' + esc((subById(rec.cat, rec.sub) || {}).title || '') + '</span>';
    }
    h += '</div>';
    h += '<div class="c07-row-desc">' + esc(r.desc) + '</div>';
    var err = ui.rowError[r.id];
    if (err) {
      h += '<div class="c07-row-note is-error">' + ico('warning') + '<span>' + esc(err) + '</span></div>';
    } else if (r.stateNote) {
      h += '<div class="c07-row-note' + (r.state === 'error' ? ' is-error' : ' is-warn') + '">' +
        ico(noteIcon(r.state)) + '<span>' + esc(r.stateNote) + '</span></div>';
    }
    h += '</div>';
    h += '<div class="c07-row-side">' + controlHtml(r) +
      '<button type="button" class="c07-row-details-btn" data-act="row-details" data-id="' + esc(r.id) + '" aria-expanded="' +
      (ui.detailOpen[r.id] ? 'true' : 'false') + '">Details</button></div>';
    if (ui.explain === r.id) h += explainHtml(r);
    else if (ui.detailOpen[r.id]) h += rowDrawerHtml(r);
    h += '</div>';
    return h;
  }

  function badgeWord(b) {
    if (b === 'restart') return 'Restart applies it';
    if (b === 'new') return 'New';
    if (b === 'adjudication') return 'Under review';
    return b;
  }
  function noteIcon(state) {
    if (state === 'error') return 'warning';
    if (state === 'restart-required') return 'refresh';
    if (state === 'reconnect-required') return 'plug';
    if (state === 'managed') return 'lock';
    if (state === 'unavailable') return 'info';
    if (state === 'changed-elsewhere') return 'history';
    return 'info';
  }

  function controlHtml(r) {
    var t = r.control.type;
    var locked = r.state === 'managed' || r.state === 'unavailable';
    /* Read-only rows keep their value visible as a state chip instead of a
       dead control; the origin lives in the state note and Details. */
    if (locked) return chipHtml(r);
    var dis = '';
    if (t === 'toggle') {
      return '<button type="button" class="c07-toggle" role="switch" aria-checked="' + (r.value === true || r.value === 'on' ? 'true' : 'false') + '"' +
        ' data-ctl="toggle" data-id="' + esc(r.id) + '" aria-label="' + esc(r.label) + '"' + dis + '></button>';
    }
    if (t === 'select' || t === 'radio') {
      return '<button type="button" class="c07-selbtn" data-ctl="select" data-id="' + esc(r.id) + '"' + dis +
        ' aria-haspopup="menu" aria-label="' + esc(r.label) + '">' +
        '<span class="c07-selbtn-val">' + esc(r.valueLabel || 'Choose') + '</span>' + ico('sliders') + '</button>';
    }
    if (t === 'number') {
      var min = r.control.min != null ? ' min="' + r.control.min + '"' : '';
      var max = r.control.max != null ? ' max="' + r.control.max + '"' : '';
      return '<input type="number" class="c07-input" data-ctl="number" data-id="' + esc(r.id) + '" value="' +
        esc(typeof r.value === 'number' ? r.value : (r.value == null ? '' : r.value)) + '"' + min + max + dis +
        ' aria-label="' + esc(r.label) + '"' + (ui.rowError[r.id] ? ' aria-invalid="true"' : '') + '>';
    }
    if (t === 'slider') {
      if (typeof r.value === 'number' && r.control.min != null) {
        var step = (r.control.max - r.control.min) <= 1 ? 0.05 : 1;
        return '<input type="range" class="c07-range" data-ctl="range" data-id="' + esc(r.id) + '" value="' + r.value +
          '" min="' + r.control.min + '" max="' + r.control.max + '" step="' + step + '"' + dis +
          ' aria-label="' + esc(r.label) + '"><span class="c07-range-val" data-range-val="' + esc(r.id) + '">' + esc(String(r.value)) + '</span>';
      }
      return '<button type="button" class="c07-selbtn" data-ctl="slider-text" data-id="' + esc(r.id) + '"' + dis + '>' +
        '<span class="c07-selbtn-val">' + esc(r.valueLabel || '—') + '</span>' + ico('sliders') + '</button>';
    }
    if (t === 'text' || t === 'path') {
      return '<input type="text" class="c07-input c07-input-text" data-ctl="text" data-id="' + esc(r.id) + '" value="' +
        esc(r.value == null ? '' : String(r.value)) + '"' + dis + ' aria-label="' + esc(r.label) + '"' +
        (ui.rowError[r.id] ? ' aria-invalid="true"' : '') + '>';
    }
    if (t === 'action') {
      return '<button type="button" class="c07-btn" data-ctl="action" data-id="' + esc(r.id) + '"' + dis + '>' +
        esc(String(r.valueLabel || 'Open').replace(/…$/, '')) + '</button>';
    }
    /* list / multiselect / keyvalue: value summary chip; contents in Details */
    return chipHtml(r) ;
  }

  function chipHtml(r) {
    var chip = arr(r.chips)[0];
    if (!chip) return '';
    return '<span class="pm-chip-value" data-kind="' + esc(chip.kind) + '">' + esc(chip.label) + '</span>';
  }

  function rowDrawerHtml(r) {
    var rec = invRow(r.id) || {};
    var h = '<div class="c07-row-drawer">';
    h += '<button type="button" class="c07-btn c07-btn-quiet c07-drawer-close" data-act="row-details" data-id="' + esc(r.id) + '">Close</button>';
    h += '<h4>Details</h4>';
    h += '<div>' + esc(r.desc) + '</div>';
    h += '<dl class="c07-drawer-grid">';
    h += '<div><dt>Current value</dt><dd>' + esc(r.valueLabel || valueText(r.value)) + '</dd></div>';
    h += '<div><dt>Default</dt><dd>' + esc(valueText(rec['default'])) + '</dd></div>';
    if (r.recommended !== undefined) h += '<div><dt>Recommended</dt><dd>' + esc(valueText(r.recommended)) + '</dd></div>';
    h += '<div><dt>Kind</dt><dd>' + esc(typeWord(r.control.type)) + (r.tier === 'advanced' ? ' · Advanced' : '') + '</dd></div>';
    if (r.state !== 'normal') h += '<div><dt>State</dt><dd>' + esc(stateWord(r.state)) + '</dd></div>';
    h += '</dl>';
    if ((r.control.type === 'list' || r.control.type === 'multiselect') && Array.isArray(r.value) && r.value.length) {
      h += '<h4>Current entries</h4><div>' + r.value.slice(0, 12).map(function (x) {
        return '<code>' + esc(typeof x === 'object' ? JSON.stringify(x) : String(x)) + '</code>';
      }).join(' · ') + (r.value.length > 12 ? ' · and ' + (r.value.length - 12) + ' more' : '') + '</div>';
    }
    if (r.control.type === 'keyvalue' && r.value && typeof r.value === 'object') {
      var keys = Object.keys(r.value);
      if (keys.length) {
        h += '<h4>Current entries</h4><div>' + keys.slice(0, 10).map(function (k) {
          return '<code>' + esc(k) + '</code>';
        }).join(' · ') + (keys.length > 10 ? ' · and ' + (keys.length - 10) + ' more' : '') + '</div>';
      }
    }
    if (r.stateNote) h += '<div style="margin-top:6px"><strong>Why:</strong> ' + esc(r.stateNote) + '</div>';
    h += '<div style="margin-top:6px">' + esc(r.detail.legacyScopeNote) + '</div>';
    if (arr(r.detail.related).length) {
      h += '<div style="margin-top:6px"><strong>Related:</strong> ' + r.detail.related.map(esc).join(' · ') + '</div>';
    }
    h += '</div>';
    return h;
  }

  function typeWord(t) {
    var words = { select: 'Choice', toggle: 'On / off', slider: 'Slider', number: 'Number',
      action: 'Action', radio: 'Choice', list: 'List', multiselect: 'Multiple choice',
      keyvalue: 'Name-value pairs', text: 'Text', path: 'File path' };
    return words[t] || t;
  }

  /* the compendium's landing signature: About this setting, in context */
  function explainHtml(r) {
    var rec = invRow(r.id) || {};
    var related = relatedManagers(r.id);
    var h = '<div class="c07-row-drawer" data-explain="' + esc(r.id) + '">';
    h += '<button type="button" class="c07-btn c07-btn-quiet c07-drawer-close" data-act="explain-close">Close</button>';
    h += '<h4>About this setting</h4>';
    h += '<div>' + esc(r.desc) + '</div>';
    h += '<dl class="c07-drawer-grid">';
    h += '<div><dt>Current value</dt><dd>' + esc(r.valueLabel || valueText(r.value)) + '</dd></div>';
    h += '<div><dt>Default</dt><dd>' + esc(valueText(rec['default'])) + '</dd></div>';
    h += '<div><dt>Changed from default</dt><dd>' + (r.changedFromDefault ? 'Yes' : 'No') + '</dd></div>';
    h += '<div><dt>Kind</dt><dd>' + esc(typeWord(r.control.type)) + (r.tier === 'advanced' ? ' · Advanced' : '') + '</dd></div>';
    h += '</dl>';
    if (r.stateNote) h += '<div><strong>' + esc(stateWord(r.state)) + ':</strong> ' + esc(r.stateNote) + '</div>';
    if (related.length) {
      h += '<div class="c07-drawer-links"><span class="c07-note" style="align-self:center">Related managers:</span>';
      related.forEach(function (def) {
        h += '<button type="button" class="c07-btn" data-act="nav" data-manager="' + esc(def.id) + '" data-dest="' +
          attr({ route: 'manager', managerId: def.id }) + '">' + esc(def.title) + '</button>';
      });
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  function relatedManagers(settingId) {
    var out = [];
    mgrs().all().forEach(function (def) {
      var prefixes = arr(def.settingPrefixes);
      for (var i = 0; i < prefixes.length; i++) {
        if (settingId.indexOf(prefixes[i]) === 0) { out.push(def); return; }
      }
    });
    return out.slice(0, 3);
  }

  /* ============================ control wiring ============================ */

  function wireControls() {
    var i;
    var toggles = contentEl.querySelectorAll('[data-ctl="toggle"]');
    for (i = 0; i < toggles.length; i++) wireToggle(toggles[i]);
    var selects = contentEl.querySelectorAll('[data-ctl="select"]');
    for (i = 0; i < selects.length; i++) wireSelect(selects[i]);
    var sliderTexts = contentEl.querySelectorAll('[data-ctl="slider-text"]');
    for (i = 0; i < sliderTexts.length; i++) wireSliderText(sliderTexts[i]);
    var numbers = contentEl.querySelectorAll('[data-ctl="number"]');
    for (i = 0; i < numbers.length; i++) wireCommitInput(numbers[i], true);
    var texts = contentEl.querySelectorAll('[data-ctl="text"]');
    for (i = 0; i < texts.length; i++) wireCommitInput(texts[i], false);
    var ranges = contentEl.querySelectorAll('[data-ctl="range"]');
    for (i = 0; i < ranges.length; i++) wireRange(ranges[i]);
    var actions = contentEl.querySelectorAll('[data-ctl="action"]');
    for (i = 0; i < actions.length; i++) wireActionRow(actions[i]);
  }

  function wireToggle(el) {
    el.addEventListener('click', function () {
      if (el.disabled) return;
      var id = el.getAttribute('data-id');
      var on = el.getAttribute('aria-checked') === 'true';
      commitValue(id, !on);
    });
  }

  function wireSelect(el) {
    el.addEventListener('click', function () {
      if (el.disabled) return;
      var id = el.getAttribute('data-id');
      var r = store.resolveRow(id);
      if (!r) return;
      openMenu(el, arr(r.control.options).map(function (o) {
        return { id: o, label: prettyOption(o), checked: o === r.value };
      }), function (picked) { commitValue(id, picked); });
    });
  }

  function wireSliderText(el) {
    el.addEventListener('click', function () {
      if (el.disabled) return;
      var id = el.getAttribute('data-id');
      var r = store.resolveRow(id);
      if (!r) return;
      /* String-valued sliders in the inventory carry display values; offer
         the current value plus honest common alternatives from search terms
         is guesswork, so we keep it read-only with a note instead. */
      openMenu(el, [{ id: '__keep', label: (r.valueLabel || 'Current value') + ' (current)', checked: true }],
        function () { /* nothing to change */ },
        'This value is tuned from its own manager; the row keeps the stored display value.');
    });
  }

  function prettyOption(o) {
    var v = String(o == null ? '' : o);
    if (/^[a-z0-9]+(?:[_-][a-z0-9]+)+$/.test(v)) {
      return v.replace(/[_-]+/g, ' ').replace(/(^|\s)([a-z])/g, function (m, sp, ch) { return sp + ch.toUpperCase(); });
    }
    return v;
  }

  function wireCommitInput(el, numeric) {
    var id = el.getAttribute('data-id');
    function commit() {
      if (el.disabled) return;
      var raw = el.value;
      var v = raw;
      if (numeric) {
        if (raw === '') { return; }
        v = Number(raw);
      }
      var cur = store.getValue(id);
      if (v === cur) return;
      var res = commitValue(id, v);
      if (res && !res.ok) {
        el.setAttribute('aria-invalid', 'true');
        try { el.focus(); } catch (e) { /* ok */ }
      }
    }
    el.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
    });
    el.addEventListener('blur', commit);
  }

  function wireRange(el) {
    var id = el.getAttribute('data-id');
    var out = contentEl.querySelector('[data-range-val="' + cssEsc(id) + '"]');
    el.addEventListener('input', function () {
      if (out) out.textContent = el.value;
    });
    el.addEventListener('change', function () {
      if (el.disabled) return;
      commitValue(id, Number(el.value));
    });
  }

  function wireActionRow(el) {
    el.addEventListener('click', function () {
      if (el.disabled) return;
      var id = el.getAttribute('data-id');
      var r = store.resolveRow(id);
      var label = r ? r.label : id;
      /* Honest: this demo stages no real run for inventory action rows. */
      window.PM2.states.receipt(label, 'This action is simulated in the concept demo. Nothing was executed.');
    });
  }

  function commitValue(id, v) {
    var res = store.setValue(id, v, { source: 'settings' });
    if (!res.ok) {
      ui.rowError[id] = res.error;
      refreshRow(id);
      return res;
    }
    delete ui.rowError[id];
    refreshRow(id);
    return res;
  }

  /* Replace every rendered instance of one row in place (no focus theft). */
  function refreshRow(id) {
    var els = contentEl.querySelectorAll('.c07-row[data-setting-id="' + cssEsc(id) + '"]');
    if (!els.length) { scheduleRender(); return; }
    var r = store.resolveRow(id);
    for (var i = 0; i < els.length; i++) {
      var wrap = document.createElement('div');
      wrap.innerHTML = rowHtml(r, els[i].getAttribute('data-variant') === 'key' ? 'key' : undefined);
      var fresh = wrap.firstChild;
      els[i].parentNode.replaceChild(fresh, els[i]);
      window.PMIcons.hydrate(fresh);
      wireFreshRow(fresh);
    }
  }
  function wireFreshRow(rowEl) {
    var sel = rowEl.querySelectorAll('[data-ctl]');
    for (var i = 0; i < sel.length; i++) {
      var el = sel[i];
      var kind = el.getAttribute('data-ctl');
      if (kind === 'toggle') wireToggle(el);
      else if (kind === 'select') wireSelect(el);
      else if (kind === 'slider-text') wireSliderText(el);
      else if (kind === 'number') wireCommitInput(el, true);
      else if (kind === 'text') wireCommitInput(el, false);
      else if (kind === 'range') wireRange(el);
      else if (kind === 'action') wireActionRow(el);
    }
  }

  /* ============================ popup menu ============================ */

  var menuState = null; /* {el, invoker, onPick} */

  function openMenu(invoker, items, onPick, note) {
    closeMenu(false);
    var el = document.createElement('div');
    el.className = 'c07-menu';
    el.setAttribute('role', 'menu');
    var h = '';
    if (note) h += '<div class="c07-dd-foot" style="border-top:0;padding-top:4px">' + esc(note) + '</div>';
    items.forEach(function (it, i) {
      h += '<button type="button" class="c07-menu-item" role="menuitemradio" aria-checked="' + (it.checked ? 'true' : 'false') + '" data-mi="' + i + '">' +
        '<span>' + esc(it.label) + '</span><span class="c07-menu-check">' + ico('check') + '</span></button>';
    });
    el.innerHTML = h;
    document.body.appendChild(el);
    window.PMIcons.hydrate(el);

    /* collision-flipped placement near edges */
    var r = invoker.getBoundingClientRect();
    var mw = Math.min(el.offsetWidth, window.innerWidth - 16);
    var mh = el.offsetHeight;
    var left = Math.min(r.left, window.innerWidth - mw - 8);
    var top = r.bottom + 4;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4);
    el.style.left = Math.max(8, left) + 'px';
    el.style.top = top + 'px';

    menuState = { el: el, invoker: invoker, onPick: onPick, items: items, active: -1 };
    el.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-mi]');
      if (!btn) return;
      var it = items[Number(btn.getAttribute('data-mi'))];
      closeMenu(true);
      if (it && onPick) onPick(it.id);
    });
    el.addEventListener('keydown', menuKeydown);
    document.addEventListener('mousedown', menuOutside, true);
    var first = el.querySelector('[aria-checked="true"]') || el.querySelector('.c07-menu-item');
    if (first) { first.setAttribute('tabindex', '0'); try { first.focus(); } catch (e) { /* ok */ } }
  }

  function menuKeydown(ev) {
    if (!menuState) return;
    var items = menuState.el.querySelectorAll('.c07-menu-item');
    var idx = -1;
    for (var i = 0; i < items.length; i++) if (items[i] === document.activeElement) idx = i;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      var next = idx + (ev.key === 'ArrowDown' ? 1 : -1);
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;
      items[next].setAttribute('tabindex', '0');
      try { items[next].focus(); } catch (e) { /* ok */ }
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      ev.stopPropagation();
      closeMenu(true);
    } else if (ev.key === 'Tab') {
      closeMenu(false);
    }
  }

  function menuOutside(ev) {
    if (menuState && !menuState.el.contains(ev.target) && ev.target !== menuState.invoker) closeMenu(false);
  }

  function closeMenu(refocus) {
    if (!menuState) return;
    var inv2 = menuState.invoker;
    try { menuState.el.parentNode.removeChild(menuState.el); } catch (e) { /* ok */ }
    document.removeEventListener('mousedown', menuOutside, true);
    menuState = null;
    if (refocus && inv2) { try { inv2.focus(); } catch (e) { /* ok */ } }
  }

  /* ============================ all settings compendium ============================ */

  var ROW_H = 64;
  var allIndex = null;          /* full candidate list (bounded, rebuilt on events) */
  var allFiltered = null;       /* current filter result */
  var vScrollRaf = 0;

  function invalidateAllIndex() { allIndex = null; allFiltered = null; }

  function buildAllIndex() {
    if (allIndex) return allIndex;
    var out = [];
    arr(inv().settings).forEach(function (s) {
      out.push({
        entry: 'row', id: s.id, kind: s.type === 'action' ? 'action' : 'setting',
        label: s.label, desc: s.desc, cat: s.cat, sub: s.sub,
        type: s.type, tier: s.tier,
        path: catCrumb(s.cat) + ' › ' + ((subById(s.cat, s.sub) || {}).title || s.sub)
      });
    });
    mgrs().all().forEach(function (def) {
      out.push({
        entry: 'manager', id: def.id,
        kind: (def.archetype === 'health' || def.archetype === 'diagnostic') ? 'diagnostic' : 'manager',
        label: def.title, desc: def.blurb || '', cat: def.cat, sub: null,
        type: 'manager', tier: 'simple',
        deferred: def.status === 'deferred_named_owner',
        path: (catById(def.cat) ? catCrumb(def.cat) : 'System & Advanced') + ' › Managers'
      });
    });
    var S = window.PM2.states;
    if (S && S.stressActive && S.stressActive()) {
      arr(S.stressRecords()).forEach(function (r) {
        out.push({
          entry: 'stress', id: r.id, kind: 'setting',
          label: r.label, desc: r.desc, cat: r.cat, sub: null,
          type: 'stress', tier: 'simple', stress: true,
          path: 'Stress fixture › scale test data'
        });
      });
    }
    allIndex = out;
    return out;
  }

  var KIND_FILTERS = [
    { id: 'setting', label: 'Settings' },
    { id: 'action', label: 'Actions' },
    { id: 'manager', label: 'Managers' },
    { id: 'diagnostic', label: 'Diagnostics' }
  ];
  var STATE_FILTERS = [
    { id: 'managed', label: 'Managed' },
    { id: 'unavailable', label: 'Unavailable' },
    { id: 'restart-required', label: 'Restart required' },
    { id: 'reconnect-required', label: 'Reconnect required' },
    { id: 'changed-elsewhere', label: 'Changed elsewhere' },
    { id: 'error', label: 'Needs a valid value' }
  ];
  var TYPE_FILTERS = [
    { id: 'toggle', label: 'On / off' }, { id: 'select', label: 'Choice' },
    { id: 'radio', label: 'Choice (radio)' }, { id: 'number', label: 'Number' },
    { id: 'slider', label: 'Slider' }, { id: 'text', label: 'Text' },
    { id: 'path', label: 'File path' }, { id: 'list', label: 'List' },
    { id: 'multiselect', label: 'Multiple choice' }, { id: 'keyvalue', label: 'Name-value pairs' },
    { id: 'action', label: 'Action' }
  ];

  function rowState(entryItem) {
    if (entryItem.entry !== 'row') return 'normal';
    var rs = obj(store.data.rowStates)[entryItem.id];
    return rs && rs.state ? rs.state : 'normal';
  }
  function rowChanged(entryItem) {
    if (entryItem.entry !== 'row') return false;
    var e = store.values[entryItem.id];
    return !!(e && e.changedFromDefault);
  }

  function filterAll() {
    var f = ui.all;
    var list = buildAllIndex();
    var q = f.q.trim().toLowerCase();
    var tokens = q ? q.split(/\s+/) : [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (f.kind && it.kind !== f.kind) continue;
      if (f.cat && it.cat !== f.cat) continue;
      if (f.type && it.type !== f.type) continue;
      if (f.tier && it.tier !== f.tier) continue;
      if (f.changed && !rowChanged(it)) continue;
      if (f.state && rowState(it) !== f.state) continue;
      if (tokens.length) {
        var hay = (it.label + ' ' + it.id + ' ' + it.desc + ' ' + it.path).toLowerCase();
        var ok = true;
        for (var t = 0; t < tokens.length; t++) {
          if (hay.indexOf(tokens[t]) === -1) { ok = false; break; }
        }
        if (!ok) continue;
      }
      out.push(it);
    }
    if (f.sort === 'az') {
      out = out.slice().sort(function (a, b) { return a.label < b.label ? -1 : (a.label > b.label ? 1 : 0); });
    } else if (f.sort === 'changed') {
      out = out.slice().sort(function (a, b) {
        var ca = rowChanged(a) ? 0 : 1, cb = rowChanged(b) ? 0 : 1;
        if (ca !== cb) return ca - cb;
        return a.label < b.label ? -1 : 1;
      });
    }
    allFiltered = out;
    return out;
  }

  function facetCounts() {
    var list = buildAllIndex();
    var byCat = {}, byKind = {}, byTier = {}, byState = {}, changed = 0;
    list.forEach(function (it) {
      byKind[it.kind] = (byKind[it.kind] || 0) + 1;
      if (it.cat) byCat[it.cat] = (byCat[it.cat] || 0) + 1;
      byTier[it.tier] = (byTier[it.tier] || 0) + 1;
      if (rowChanged(it)) changed += 1;
      var st = rowState(it);
      if (st !== 'normal') byState[st] = (byState[st] || 0) + 1;
    });
    return { byCat: byCat, byKind: byKind, byTier: byTier, byState: byState, changed: changed };
  }

  function allHtml() {
    var f = ui.all;
    var filtered = filterAll();
    var fc = facetCounts();
    var stressActive = window.PM2.states.stressActive && window.PM2.states.stressActive();
    var anyFacet = f.cat || f.type || f.tier || f.state || f.kind || f.changed || f.q.trim();

    var h = '<div class="c07-pane c07-pane-wide">';
    if (ui.notice) h += '<div class="c07-notice">' + ico('info') + '<div>' + esc(ui.notice) + '</div></div>';
    h += '<p class="c07-kicker">The compendium</p>';
    h += '<h1 class="c07-h1">All Settings</h1>';
    h += '<p class="c07-lede">The complete, searchable index of everything this project can configure — every setting, action, and manager in one place.' +
      (stressActive ? ' <strong>Stress mode is on:</strong> 2,000 clearly-labeled synthetic records are mixed in as a scale test.' : '') + '</p>';
    h += '<div style="height:14px"></div>';

    h += '<div class="c07-all">';

    /* facet column */
    h += '<div class="c07-facets' + (f.filtersOpen ? ' is-open' : '') + '" id="c07Facets">';
    h += facetGroup('Record kind', 'kind', KIND_FILTERS.map(function (k) {
      return { id: k.id, label: k.label, n: fc.byKind[k.id] || 0 };
    }), f.kind);
    h += facetGroup('Area', 'cat', cats().map(function (c) {
      return { id: c.id, label: c.title, n: fc.byCat[c.id] || 0 };
    }), f.cat, 'Records in this index, managers included — the rail counts settings only.');
    h += facetGroup('Setting type', 'type', TYPE_FILTERS.map(function (t) {
      return { id: t.id, label: t.label, n: null };
    }), f.type);
    h += facetGroup('Tier', 'tier', [
      { id: 'simple', label: 'Everyday', n: fc.byTier.simple || 0 },
      { id: 'advanced', label: 'Advanced', n: fc.byTier.advanced || 0 }
    ], f.tier);
    h += facetGroup('State', 'state', STATE_FILTERS.map(function (s) {
      return { id: s.id, label: s.label, n: fc.byState[s.id] || 0 };
    }), f.state);
    h += '</div>';

    /* main list */
    h += '<div class="c07-all-main">';
    h += '<div class="c07-all-tools">';
    h += '<button type="button" class="c07-btn c07-filtersbtn" data-act="toggle-filters" aria-expanded="' + (f.filtersOpen ? 'true' : 'false') + '">' + ico('filter') + 'Filters</button>';
    h += '<div class="c07-searchwrap"><div class="c07-search">' + ico('search') +
      '<input type="text" id="c07AllQ" placeholder="Filter this index" value="' + esc(f.q) + '" aria-label="Filter all settings" autocomplete="off" spellcheck="false"></div></div>';
    h += '<div class="c07-chips">';
    h += '<button type="button" class="c07-chip" data-act="chip-changed" aria-pressed="' + (f.changed ? 'true' : 'false') + '">Changed from default <span class="c07-chip-n">' + fc.changed + '</span></button>';
    h += '<button type="button" class="c07-chip" data-act="chip-tier" aria-pressed="' + (f.tier === 'advanced' ? 'true' : 'false') + '">Advanced</button>';
    h += '<button type="button" class="c07-chip" data-act="chip-kind" data-kind="manager" aria-pressed="' + (f.kind === 'manager' ? 'true' : 'false') + '">Managers <span class="c07-chip-n">' + (fc.byKind.manager || 0) + '</span></button>';
    h += '<button type="button" class="c07-chip" data-act="chip-kind" data-kind="action" aria-pressed="' + (f.kind === 'action' ? 'true' : 'false') + '">Actions <span class="c07-chip-n">' + (fc.byKind.action || 0) + '</span></button>';
    h += '<button type="button" class="c07-chip" data-act="chip-kind" data-kind="diagnostic" aria-pressed="' + (f.kind === 'diagnostic' ? 'true' : 'false') + '">Diagnostics <span class="c07-chip-n">' + (fc.byKind.diagnostic || 0) + '</span></button>';
    h += '</div>';
    h += '<button type="button" class="c07-btn c07-btn-quiet" data-act="sort" style="margin-left:auto">' + ico('sliders') + 'Sort: ' + esc(sortLabel(f.sort)) + '</button>';
    h += '</div>';

    h += '<div class="c07-all-count"><strong>' + fmtInt(filtered.length) + '</strong> of ' + fmtInt(buildAllIndex().length) + ' records' +
      (anyFacet ? ' <button type="button" class="c07-clear-facets" data-act="clear-facets">Clear filters</button>' : '') +
      (stressActive ? ' <span>· includes 2,000 synthetic stress-fixture rows</span>' : '') + '</div>';

    if (!filtered.length) {
      h += '<div class="c07-vlist"><div class="c07-vempty"><strong>Nothing matches these filters.</strong>' +
        '<span class="c07-note">Loosen a facet, or clear the filters to see the whole compendium again. No settings were hidden or removed — this is only a view.</span></div></div>';
    } else {
      h += '<div class="c07-vlist" id="c07VList" style="height:' + vlistHeight() + 'px">' +
        '<div style="height:100%;overflow-y:auto;overflow-x:hidden" class="c07-content" id="c07VScroll" tabindex="0" aria-label="All settings list">' +
        '<div class="c07-vspacer" id="c07VSpacer" style="height:' + (filtered.length * ROW_H) + 'px">' +
        '<div class="c07-vwin" id="c07VWin"></div>' +
        '</div></div></div>';
    }
    h += '</div>';   /* all-main */
    h += '</div>';   /* all */
    h += '</div>';
    return h;
  }

  function vlistHeight() {
    var avail = (contentEl ? contentEl.clientHeight : 600) - 230;
    return Math.max(320, avail);
  }

  function sortLabel(s) {
    return s === 'az' ? 'A to Z' : (s === 'changed' ? 'Changed first' : 'Inventory order');
  }

  function facetGroup(title, group, items, active, note) {
    var h = '<div class="c07-facet-group"><h4>' + esc(title) + '</h4>';
    if (note) h += '<p class="c07-facet-note">' + esc(note) + '</p>';
    items.forEach(function (it) {
      if (it.n === 0 && group === 'state') return;
      h += '<button type="button" class="c07-facet" data-act="facet" data-group="' + esc(group) + '" data-val="' + esc(it.id) + '" ' +
        'aria-pressed="' + (active === it.id ? 'true' : 'false') + '">' +
        '<span>' + esc(it.label) + '</span>' +
        (it.n != null ? '<span class="c07-facet-n">' + fmtInt(it.n) + '</span>' : '') + '</button>';
    });
    h += '</div>';
    return h;
  }

  function wireVirtualList() {
    var scroller = document.getElementById('c07VScroll');
    if (!scroller) return;
    scroller.addEventListener('scroll', function () {
      if (vScrollRaf) return;
      vScrollRaf = requestAnimationFrame(function () {
        vScrollRaf = 0;
        renderVWindow();
      });
    });
    renderVWindow();
  }

  function renderVWindow() {
    var scroller = document.getElementById('c07VScroll');
    var win = document.getElementById('c07VWin');
    if (!scroller || !win || !allFiltered) return;
    var top = scroller.scrollTop;
    var height = scroller.clientHeight;
    var first = Math.max(0, Math.floor(top / ROW_H) - 6);
    var last = Math.min(allFiltered.length, Math.ceil((top + height) / ROW_H) + 6);
    var h = '';
    for (var i = first; i < last; i++) h += vRowHtml(allFiltered[i]);
    win.style.transform = 'translateY(' + (first * ROW_H) + 'px)';
    win.innerHTML = h;
    window.PMIcons.hydrate(win);
  }

  function vRowHtml(it) {
    var dest, hooks = '';
    if (it.entry === 'manager') {
      dest = { route: 'manager', managerId: it.id };
      hooks = 'data-manager="' + esc(it.id) + '"';
    } else if (it.entry === 'stress') {
      dest = { route: 'all' };
      hooks = 'data-setting-id="' + esc(it.id) + '"';
    } else {
      dest = { route: 'setting', settingId: it.id };
      hooks = 'data-setting-id="' + esc(it.id) + '"';
    }
    var side = '';
    if (it.entry === 'row') {
      var e = store.values[it.id] || {};
      var st = rowState(it);
      if (st !== 'normal') side += '<span class="pm-chip-value" data-kind="' + esc(st === 'managed' ? 'managed' : (st === 'unavailable' ? 'unavailable' : 'differs')) + '">' + esc(stateWord(st)) + '</span>';
      else if (it.type === 'action') side += '<span class="c07-vrow-kind">Action</span>';
      else if (e.changedFromDefault) side += '<span class="pm-chip-value" data-kind="custom">' + esc(shortVal(it.id)) + '</span>';
      else side += '<span class="pm-chip-value" data-kind="default">' + esc(shortVal(it.id)) + '</span>';
    } else if (it.entry === 'manager') {
      side += '<span class="c07-vrow-kind">' + (it.deferred ? 'Owner module reserved' : 'Manager') + '</span>';
    } else {
      side += '<span class="c07-vrow-kind">Stress fixture</span>';
    }
    return '<div class="c07-vrow' + (it.stress ? ' is-stress' : '') + '" role="button" tabindex="0" ' + hooks +
      ' data-act="nav" data-dest="' + attr(dest) + '">' +
      '<div style="min-width:0"><div class="c07-vrow-top"><span class="c07-vrow-label">' + esc(it.label) + '</span>' +
      '<span class="c07-vrow-path">' + esc(it.path) + '</span></div>' +
      '<div class="c07-vrow-desc">' + esc(it.desc) + '</div></div>' +
      '<div class="c07-vrow-side">' + side + '</div></div>';
  }

  function shortVal(id) {
    var r = store.resolveRow(id);
    var s = r ? (r.valueLabel || '—') : '—';
    return s.length > 26 ? s.slice(0, 25) + '…' : s;
  }

  /* ============================ managers ============================ */

  function managerHtml(managerId, objectId, tab) {
    var def = mgrs().get(managerId);
    var vm = null;
    try { vm = def.model(store); } catch (e) { vm = null; }
    var deferred = def.status === 'deferred_named_owner';
    var h = '<div class="c07-pane c07-pane-wide">';

    if (ui.notice) h += '<div class="c07-notice">' + ico('info') + '<div>' + esc(ui.notice) + '</div></div>';

    h += '<div class="c07-mgrhead" data-manager="' + esc(def.id) + '">';
    h += '<p class="c07-kicker">' + esc(archetypeWord(def.archetype)) + (def.cat && catById(def.cat) ? ' · ' + esc(catCrumb(def.cat)) : '') + '</p>';
    h += '<h1 class="c07-h1">' + esc(def.title) + '</h1>';
    h += '<p class="c07-lede">' + esc(def.blurb || '') + '</p>';
    if (vm && vm.summary) h += '<p class="c07-lede" style="margin-top:6px">' + esc(vm.summary) + '</p>';

    if (!deferred && !objectId) {
      var actions = [];
      try { actions = arr(def.actions(store)); } catch (e) { actions = []; }
      if (actions.length) {
        /* Buttons stay one contiguous wrapping group; unavailable-action
           reasons render AFTER the group as indented footnotes prefixed with
           the owning action's label (linked via aria-describedby), so a tall
           caption can never split the toolbar or orphan trailing buttons. */
        var reasons = [];
        h += '<div class="c07-actions">';
        actions.forEach(function (a) {
          var reasonId = null;
          if (a.available === false && a.reason) {
            reasonId = 'c07ActReason-' + String(a.id).replace(/[^A-Za-z0-9_-]/g, '-');
            reasons.push({ id: reasonId, label: a.label, reason: a.reason });
          }
          h += '<button type="button" class="c07-btn" data-act="mgr-action" data-action-id="' + esc(a.id) + '"' +
            (a.available === false ? ' disabled' : '') +
            (reasonId ? ' aria-describedby="' + esc(reasonId) + '"' : '') +
            '>' + (a.ico ? ico(a.ico) : '') + esc(a.label) + '</button>';
        });
        h += '</div>';
        if (reasons.length) {
          h += '<div class="c07-action-reasons">';
          reasons.forEach(function (r) {
            h += '<p class="c07-action-reason" id="' + esc(r.id) + '"><strong>' + esc(r.label) + '</strong> — ' + esc(r.reason) + '</p>';
          });
          h += '</div>';
        }
      }
    }
    h += opsHtml();
    h += '</div>';

    if (deferred) {
      h += ownerPanelHtml(def);
    }

    if (!vm) {
      h += '<div class="c07-notice">' + ico('info') + '<div>This manager could not build its view right now. Its data may be unavailable in the current scenario.</div></div>';
      h += '</div>';
      return h;
    }

    if (vm.pages && Object.keys(vm.pages).length) {
      h += managerListDetailHtml(def, vm, objectId, tab);
    } else {
      if (objectId) {
        /* object without a dedicated page: reveal it inside the sections */
        ui.locate = ui.locate || { focus: objectId };
      }
      h += sectionsHtml(def, vm.sections, managerId);
    }
    h += '</div>';
    return h;
  }

  function archetypeWord(a) {
    var words = {
      'preference-doc': 'Preferences', 'roster-detail': 'Roster & detail',
      'catalog': 'Catalog', 'setup-sequence': 'Setup', 'health': 'Health',
      'diagnostic': 'Diagnostics', 'transaction': 'Transaction'
    };
    return words[a] || 'Manager';
  }

  function ownerPanelHtml(def) {
    var icont = obj(def.insertionContract);
    var h = '<div class="c07-owner-panel">';
    h += '<h3>Reserved for its owner module</h3>';
    h += '<dl class="c07-kv">';
    h += '<dt>Canonical owner</dt><dd>' + esc(def.owner || '—') + '</dd>';
    h += '<dt>Status</dt><dd>Read-only insertion shell. Nothing here is editable, and no action is faked.</dd>';
    if (icont.deepLink) h += '<dt>Deep link</dt><dd><code>' + esc(icont.deepLink) + '</code></dd>';
    if (arr(icont.reachableFrom).length) h += '<dt>Reachable from</dt><dd>' + icont.reachableFrom.map(esc).join(' · ') + '</dd>';
    if (icont.returnContract) h += '<dt>Return contract</dt><dd>' + esc(icont.returnContract) + '</dd>';
    h += '</dl></div>';
    return h;
  }

  /* list/detail composition for managers with object pages (providers). */
  function managerListDetailHtml(def, vm, objectId, tab) {
    var h = '<div class="c07-mgr-body">';
    /* object list from roster sections (grouped when groups exist) */
    h += '<div class="c07-objlist' + (objectId ? ' is-detail' : '') + '">';
    var listed = {};
    arr(vm.sections).forEach(function (sec) {
      if (sec.kind !== 'roster') return;
      var groups = sec.groups ? arr(sec.groups) : [{ id: sec.id, label: null, items: arr(sec.items) }];
      groups.forEach(function (g) {
        if (g.label) h += '<div class="c07-obj-grouplabel">' + esc(g.label) + '</div>';
        arr(g.items).forEach(function (it) {
          var oid = obj(it.dest).objectId || it.id;
          if (listed[oid]) return;
          listed[oid] = true;
          h += objButtonHtml(def, it, oid, oid === objectId);
        });
      });
    });
    Object.keys(vm.pages).forEach(function (pid) {
      if (listed[pid]) return;
      listed[pid] = true;
      h += objButtonHtml(def, { label: vm.pages[pid].title || pid }, pid, pid === objectId);
    });
    h += '</div>';

    h += '<div class="c07-mgr-detail">';
    if (objectId && vm.pages[objectId]) {
      var page = vm.pages[objectId];
      var tabs = arr(page.tabs);
      var activeTab = tab && tabs.indexOf(tab) >= 0 ? tab : tabs[0];
      h += '<div class="c07-section-head" style="border-bottom:0;margin-bottom:2px"><h2 class="c07-h2">' + esc(page.title) + '</h2>' +
        (page.status ? statusWordHtml(page.status) : '') + '</div>';
      if (tabs.length > 1) {
        h += '<div class="c07-tabs" role="tablist">';
        tabs.forEach(function (t) {
          h += '<button type="button" class="c07-tab" role="tab" data-tab="' + esc(t) + '" data-act="mgr-tab" aria-selected="' + (t === activeTab ? 'true' : 'false') + '">' +
            esc(tabWord(t, page.sections[t])) + '</button>';
        });
        h += '</div>';
      }
      var sec = page.sections[activeTab];
      if (sec) h += sectionHtml(def, sec, def.id + '/' + objectId);
    } else {
      if (objectId) {
        h += '<div class="c07-notice">' + ico('info') + '<div>No entry named "' + esc(objectId) +
          '" exists in ' + esc(def.title) + ' right now. Showing the full overview instead — pick an entry from the list.</div></div>';
      }
      h += sectionsHtml(def, vm.sections, def.id);
    }
    h += '</div></div>';
    return h;
  }

  function objButtonHtml(def, it, oid, active) {
    var st = it.status ? it.status : null;
    return '<button type="button" class="c07-obj' + (active ? ' is-active' : '') + '" data-object-id="' + esc(oid) + '" ' +
      'data-act="nav" data-dest="' + attr({ route: 'manager', managerId: def.id, objectId: oid }) + '"' +
      (active ? ' aria-current="true"' : '') + '>' +
      '<span class="c07-obj-name"><span>' + esc(it.label) + '</span>' +
      (st ? statusWordHtml(st) : '') + '</span>' +
      (it.sub ? '<span class="c07-obj-sub">' + esc(it.sub) + '</span>' : '') +
      '</button>';
  }

  function statusWordHtml(st) {
    var tone = st.tone === 'ok' ? 'ok' : (st.tone === 'attention' ? 'attention' : (st.tone === 'setup' ? 'setup' : 'muted'));
    return '<span class="pm-status-word" data-tone="' + esc(tone) + '">' + esc(st.label) + '</span>';
  }

  function tabWord(t, sec) {
    if (sec && sec.title) return sec.title;
    var words = { overview: 'Overview', accounts: 'Accounts', models: 'Models', limits: 'Limits',
      routing: 'Routing', installs: 'Installation', setup: 'Set up', activity: 'Activity',
      advanced: 'Advanced', server: 'Server', routes: 'Routes', catalog: 'Catalog' };
    return words[t] || t;
  }

  /* A pending locate that targets an advanced (collapsed) section must open
     it before render, or the landing element never exists in the DOM. */
  function locateWantsSection(secId) {
    var want = ui.locate;
    if (!want) return false;
    var f = want.sectionSub || want.focus;
    if (!f) return false;
    f = String(f);
    if (/^[smoawduh]:/.test(f)) {
      var rest = f.slice(2);
      var parts = rest.split('/');
      f = parts.length > 1 ? parts.slice(1).join('/') : rest;
    }
    return f === String(secId);
  }

  function sectionsHtml(def, sections, scope) {
    var h = '';
    arr(sections).forEach(function (sec) {
      if (sec.advanced) {
        var key = scope + '/' + sec.id;
        if (!ui.secOpen[key] && locateWantsSection(sec.id)) ui.secOpen[key] = true;
        if (!ui.secOpen[key]) {
          h += '<button type="button" class="c07-adv-toggle" data-act="sec-open" data-key="' + esc(key) + '" aria-expanded="false">' +
            ico('plus') + esc(sec.title || 'Advanced') + '</button><div style="height:10px"></div>';
          return;
        }
      }
      h += sectionHtml(def, sec, scope);
    });
    return h;
  }

  function sectionHtml(def, sec, scope) {
    var h = '<div class="c07-block" data-section="' + esc(sec.id) + '">';
    if (sec.title) h += '<h3>' + esc(sec.title) + (sec.status ? ' ' + statusWordHtml(sec.status) : '') + '</h3>';
    if (sec.note) h += '<p class="c07-note">' + esc(sec.note) + '</p>';
    if (sec.loading) h += '<p class="c07-note">' + ico('refresh') + ' ' + esc(sec.loading.note || 'Refreshing…') + '</p>';

    var kind = sec.kind;
    if (kind === 'overview' || kind === 'form') h += itemListHtml(def, arr(sec.items).concat(arr(sec.rows)).concat(arr(sec.fields)), scope, sec);
    else if (kind === 'roster') h += rosterHtml(def, sec, scope);
    else if (kind === 'table') h += tableHtml(def, sec);
    else if (kind === 'steps') h += stepsHtml(def, sec);
    else if (kind === 'log') h += logHtml(def, sec, scope);
    else if (kind === 'health') h += healthHtml(sec);
    else if (kind === 'preview') h += previewHtml(def, sec, scope);
    else h += itemListHtml(def, arr(sec.items).concat(arr(sec.rows)).concat(arr(sec.fields)), scope, sec);

    if (arr(sec.whatNext).length) {
      h += '<h3 style="margin-top:10px;font-size:var(--fs-sm)">When included usage runs out</h3><ol class="c07-steps">';
      sec.whatNext.forEach(function (s) { h += '<li><span>' + esc(s.label) + '</span></li>'; });
      h += '</ol>';
    }
    if (sec.advanced) {
      h += '<button type="button" class="c07-adv-toggle" data-act="sec-close" data-key="' + esc(scope + '/' + sec.id) + '" aria-expanded="true">' +
        ico('minus') + 'Hide ' + esc(sec.title || 'advanced') + '</button>';
    }
    h += '</div>';
    return h;
  }

  function itemListHtml(def, items, scope, sec) {
    var h = '';
    if (!items.length) {
      h += '<p class="c07-note">Nothing to show here right now.</p>';
      return h;
    }
    items.forEach(function (it) {
      h += itemHtml(def, it, scope);
    });
    if (sec && sec.boundary && sec.boundary.label) {
      h += '<p class="c07-note" style="margin-top:6px">Sign-in ownership: ' + esc(sec.boundary.label) + '</p>';
    }
    return h;
  }

  function itemHtml(def, it, scope) {
    if (!it) return '';
    var key = scope + '/' + it.id;
    var open = !!ui.mgrItemOpen[key];
    var val = it.valueLabel != null ? it.valueLabel : (it.value != null ? valueText(it.value) : null);
    var hasDetail = it.detail && Object.keys(obj(it.detail)).length;
    var h = '<div class="c07-item" data-item-id="' + esc(it.id) + '"' +
      (it.settingId ? ' data-setting-id="' + esc(it.settingId) + '"' : '') + '>';
    /* name · lede · status travel together as one head group, so an over-long
       lede wraps INSIDE the group (tight row-gap, still obviously the name's
       sentence) instead of being pushed onto its own flex line and stranding
       the name — and the side keeps its baseline on the name's line. */
    h += '<span class="c07-item-head">';
    h += '<span class="c07-item-label">' + esc(it.label) + '</span>';
    if (it.sub) h += '<span class="c07-item-sub">' + esc(it.sub) + '</span>';
    if (val != null) h += '<span class="c07-item-val">' + esc(String(val)) + '</span>';
    if (it.status) h += statusWordHtml(it.status);
    h += '</span>';
    h += '<span class="c07-item-side">';
    if (it.flags) h += flagsHtml(it.flags);
    if (hasDetail) {
      h += '<button type="button" class="c07-item-open" data-act="mgr-item" data-key="' + esc(key) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
        (open ? 'Hide details' : 'Details') + '</button>';
    }
    if (it.dest) {
      h += '<button type="button" class="c07-item-open" data-act="nav" data-dest="' + attr(it.dest) + '" title="Open">' + ico('external') + '</button>';
    }
    h += '</span>';
    if (it.note) h += '<span class="c07-item-note">' + esc(String(it.note)) + '</span>';
    if (it.shadowNote) h += '<span class="c07-item-note">' + esc(String(it.shadowNote)) + '</span>';
    if (it.manualOnlyReason) h += '<span class="c07-item-note">' + esc(String(it.manualOnlyReason)) + '</span>';
    if (open && hasDetail) h += detailDumpHtml(it.detail);
    h += '</div>';
    return h;
  }

  function flagsHtml(flags) {
    var f = obj(flags);
    var out = '';
    if (f.selected) out += '<span class="pm-chip-value" data-kind="recommended">In use</span>';
    if (f.shadowed) out += '<span class="pm-chip-value" data-kind="differs">Shadowed</span>';
    if (f.manualOnly) out += '<span class="pm-chip-value" data-kind="managed">Manual only</span>';
    if (f.favorite) out += '<span class="pm-chip-value" data-kind="recommended">Favorite</span>';
    if (f.hidden) out += '<span class="pm-chip-value" data-kind="not-configured">Hidden</span>';
    if (f.busy) out += '<span class="pm-chip-value" data-kind="auto">Working…</span>';
    return out;
  }

  /* Intentionally technical detail drawer: readable key/value projection. */
  function detailDumpHtml(detail) {
    var h = '<div class="c07-row-drawer" style="flex-basis:100%"><dl class="c07-drawer-grid">';
    var d = obj(detail);
    Object.keys(d).forEach(function (k) {
      var v = d[k];
      if (v == null || v === '') return;
      var shown;
      if (Array.isArray(v)) {
        if (!v.length) return;
        shown = v.map(function (x) { return typeof x === 'object' ? summarizeObj(x) : String(x); }).join(' · ');
      } else if (typeof v === 'object') {
        shown = summarizeObj(v);
      } else {
        shown = String(v);
      }
      h += '<div><dt>' + esc(humanKey(k)) + '</dt><dd>' + esc(shown.length > 400 ? shown.slice(0, 399) + '…' : shown) + '</dd></div>';
    });
    h += '</dl></div>';
    return h;
  }

  function summarizeObj(o) {
    var parts = [];
    Object.keys(obj(o)).forEach(function (k) {
      var v = o[k];
      if (v == null || typeof v === 'object') return;
      parts.push(humanKey(k) + ': ' + String(v));
    });
    if (!parts.length) { try { return JSON.stringify(o).slice(0, 200); } catch (e) { return '—'; } }
    return parts.join(', ');
  }

  function humanKey(k) {
    return String(k).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
      .replace(/^./, function (c) { return c.toUpperCase(); });
  }

  function rosterHtml(def, sec, scope) {
    var h = '';
    var groups = sec.groups ? arr(sec.groups) : [{ id: sec.id, label: null, items: arr(sec.items) }];
    groups.forEach(function (g) {
      if (g.label) h += '<div class="c07-obj-grouplabel">' + esc(g.label) + '</div>';
      arr(g.items).forEach(function (it) {
        h += itemHtml(def, it, scope);
      });
    });
    if (sec.boundary && sec.boundary.label) {
      h += '<p class="c07-note" style="margin-top:6px">Sign-in ownership: ' + esc(sec.boundary.label) + '</p>';
    }
    return h;
  }

  function tableHtml(def, sec) {
    var cols = arr(sec.columns);
    var h = '<div class="c07-scroll-x"><table class="c07-table"><thead><tr>';
    cols.forEach(function (c) { h += '<th>' + esc(c.label) + '</th>'; });
    h += '</tr></thead><tbody>';
    arr(sec.rows).forEach(function (row) {
      var cells = obj(row.cells);
      var link = row.dest ? ' class="is-link" data-act="nav" data-dest="' + attr(row.dest) + '"' : '';
      h += '<tr' + link + (row.id ? ' data-item-id="' + esc(row.id) + '"' : '') + '>';
      cols.forEach(function (c, i) {
        var v = cells[c.id];
        h += '<td>' + esc(v == null ? '—' : String(v)) + (i === 0 && row.flags ? ' ' + flagsHtml(row.flags) : '') + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  function stepsHtml(def, sec) {
    var h = '';
    if (sec.officialSource) {
      h += '<p class="c07-note"><strong>Official source:</strong> ' + esc(sec.officialSource) + '</p>';
    }
    if (sec.policyNote) h += '<p class="c07-note">' + esc(sec.policyNote) + '</p>';
    if (arr(sec.hostChoices).length) {
      h += '<p class="c07-note" style="margin-top:8px"><strong>Host / environment for this setup:</strong></p>';
      sec.hostChoices.forEach(function (c, i) {
        h += '<label class="c07-copy-cat"><input type="radio" name="c07host"' + (i === 0 ? ' checked' : '') + '> ' + esc(c.label) + '</label>';
      });
    }
    h += '<ol class="c07-steps">';
    arr(sec.steps).forEach(function (s) {
      /* shared step shapes: providers use {label, detail}; lifecycle and
         cleanup use {title, note}. Render both honestly. */
      var main = s.label || s.title || '';
      var sub = s.detail || s.note || '';
      h += '<li><span><strong>' + esc(main) + '</strong>' +
        (sub ? '<span class="c07-note">' + esc(sub) + '</span>' : '') + '</span></li>';
    });
    h += '</ol>';
    return h;
  }

  function logHtml(def, sec, scope) {
    var h = '';
    if (arr(sec.sources).length) {
      sec.sources.forEach(function (s) { h += itemHtml(def, s, scope); });
      h += '<div style="height:8px"></div>';
    }
    var entries = arr(sec.entries);
    if (!entries.length) h += '<p class="c07-note">No entries recorded.</p>';
    else {
      h += '<div class="c07-log">';
      entries.slice(0, 30).forEach(function (e) {
        h += '<div class="c07-log-entry" data-tone="' + esc(e.tone || 'muted') + '">' +
          '<span class="c07-log-when">' + esc(fmtWhen(e.at) || '—') + '</span>' +
          '<span class="c07-log-what">' + esc(e.label) +
          (e.detail ? '<span class="c07-note">' + esc(String(e.detail)) + '</span>' : '') + '</span></div>';
      });
      if (entries.length > 30) h += '<p class="c07-note">Showing the 30 most recent of ' + entries.length + ' entries.</p>';
      h += '</div>';
    }
    return h;
  }

  function healthHtml(sec) {
    var h = '';
    arr(sec.checks).forEach(function (c) {
      h += '<div class="c07-check" data-item-id="' + esc(c.id || '') + '">' +
        '<span class="c07-check-label">' + esc(c.label) + '</span>' +
        '<span class="pm-status-word" data-tone="' + esc(c.tone === 'ok' ? 'ok' : (c.tone === 'attention' ? 'attention' : 'muted')) + '">' +
        esc(c.state || '') + '</span>' +
        (c.note ? '<span class="c07-note">' + esc(String(c.note)) + '</span>' : '') + '</div>';
    });
    return h;
  }

  /* Bespoke preview sections (lifecycle import, formatter test, cleanup
     dry run): render every recognizable field honestly, nothing invented. */
  function previewHtml(def, sec, scope) {
    var h = '';
    if (sec.state) h += '<p class="c07-note">State: ' + esc(prettyOption(String(sec.state))) + '</p>';
    if (sec.summary) h += '<p class="c07-note">' + esc(String(sec.summary)) + '</p>';
    if (sec.source) {
      h += '<dl class="c07-kv">';
      Object.keys(obj(sec.source)).forEach(function (k) {
        h += '<dt>' + esc(humanKey(k)) + '</dt><dd>' + esc(String(sec.source[k])) + '</dd>';
      });
      h += '</dl>';
    }
    if (sec.counts) {
      h += '<div class="c07-counts">';
      Object.keys(sec.counts).forEach(function (k) {
        h += '<div class="c07-count" data-kind="' + esc(k) + '"><span class="c07-count-v">' + esc(String(sec.counts[k])) + '</span>' +
          '<span class="c07-count-k">' + esc(humanKey(k)) + '</span></div>';
      });
      h += '</div>';
    }
    arr(sec.conflicts).forEach(function (c) {
      /* human label first; the raw id only when the row is unknown */
      var rec = c.settingId ? invRow(c.settingId) : null;
      h += '<div class="c07-item"><span class="c07-item-head"><span class="c07-item-label">' + esc(rec ? rec.label : (c.settingId || '')) + '</span>' +
        '<span class="c07-item-val">' + esc(valueText(c.local)) + ' here · ' + esc(valueText(c.incoming)) + ' incoming</span></span>' +
        (c.dest ? '<span class="c07-item-side"><button type="button" class="c07-item-open" data-act="nav" data-dest="' + attr(c.dest) + '">' + ico('external') + '</button></span>' : '') +
        (c.note ? '<span class="c07-item-note">' + esc(String(c.note)) + '</span>' : '') + '</div>';
    });
    arr(sec.invalid).forEach(function (x) {
      h += '<div class="c07-item"><span class="c07-item-label">' + esc(x.key) + '</span>' +
        '<span class="c07-item-note">' + esc(x.reason || 'Invalid entry') + '</span></div>';
    });
    arr(sec.legacyMigrated).forEach(function (m) {
      h += '<div class="c07-item"><span class="c07-item-label">' + esc(m.from) + ' → ' + esc(m.to) + '</span>' +
        (m.note ? '<span class="c07-item-note">' + esc(m.note) + '</span>' : '') + '</div>';
    });
    arr(sec.skipped).forEach(function (s) {
      h += '<div class="c07-item"><span class="c07-item-label">' + esc(s.ref || '') + '</span>' +
        '<span class="c07-item-note">' + esc(s.reason || '') + '</span></div>';
    });
    if (sec.sample) {
      h += '<div class="c07-scroll-x"><pre class="c07-diff-pre">Before:\n' + esc(String(sec.sample.before || '')) +
        '\n\nAfter:\n' + esc(String(sec.sample.after || '')) + '</pre></div>';
      if (sec.sample.when) h += '<p class="c07-note">Tested ' + esc(String(sec.sample.when)) + '</p>';
    }
    if (!h) h = '<p class="c07-note">Nothing staged right now.</p>';
    return h;
  }

  /* ============================ ops (truthful staged work) ============================ */

  function opKey(p) { return p.name + (p.ref ? ':' + p.ref : ''); }

  /* On navigation, finished-clean ops stop following the user around.
     Unresolved outcomes (failed / degraded / retryable / recovery-required)
     stay visible wherever they land next. */
  function pruneFinishedOps() {
    if (!ui.opsOrder.length) return;
    ui.opsOrder = ui.opsOrder.filter(function (k) {
      var p = ui.ops[k];
      var settled = p && (p.status === 'done' || p.status === 'canceled');
      if (settled) delete ui.ops[k];
      return !settled;
    });
  }

  function opsHtml() {
    if (!ui.opsOrder.length) return '<div class="c07-ops" id="c07Ops"></div>';
    var h = '<div class="c07-ops" id="c07Ops">';
    ui.opsOrder.slice(-3).forEach(function (k) {
      h += opLineHtml(ui.ops[k]);
    });
    h += '</div>';
    return h;
  }

  function opLineHtml(p) {
    if (!p) return '';
    var h = '<div class="c07-op" data-status="' + esc(p.status) + '">';
    h += '<span class="c07-op-name">' + esc(opWord(p.name)) + (p.ref ? ' · ' + esc(String(p.ref)) : '') + '</span>';
    h += '<span class="c07-op-phase">' + esc(p.status) + (p.phase ? ' — ' + esc(p.phase) : '') + '</span>';
    if (p.progressKind === 'determinate' && typeof p.completed === 'number' && typeof p.total === 'number' && p.total > 0) {
      var pct = Math.round(100 * p.completed / p.total);
      h += '<span class="c07-op-bar"><span style="width:' + pct + '%"></span></span>' +
        '<span class="c07-op-phase">' + p.completed + ' / ' + p.total + '</span>';
    }
    h += '</div>';
    return h;
  }

  function opWord(name) {
    return prettyOption(String(name || 'operation'));
  }

  function refreshOps() {
    var el = document.getElementById('c07Ops');
    if (!el) return;
    var h = '';
    ui.opsOrder.slice(-3).forEach(function (k) { h += opLineHtml(ui.ops[k]); });
    el.innerHTML = h;
  }

  function runManagerAction(def, actionId) {
    var actions = [];
    try { actions = arr(def.actions(store)); } catch (e) { actions = []; }
    for (var i = 0; i < actions.length; i++) {
      if (actions[i].id !== actionId) continue;
      var a = actions[i];
      if (a.available === false) {
        window.PM2.states.receipt(a.label + ' — not attempted', a.reason || 'This action is not available right now.');
        return;
      }
      try { a.run(store); } catch (e2) {
        window.PM2.states.receipt(a.label + ' — failed to start', 'The action handler reported an error.');
      }
      return;
    }
  }

  /* ============================ copy flow ============================ */

  function copyHtml() {
    var c = ui.copy;
    var h = '<div class="c07-pane">';
    h += '<p class="c07-kicker">One-time transaction</p>';
    h += '<h1 class="c07-h1">Copy Settings From Another Project</h1>';
    h += '<p class="c07-lede">A reviewed, one-time copy. Nothing stays linked: once applied, this project and the source keep evolving independently.</p>';

    var steps = ['Select source', 'Choose categories', 'Review & preview', 'Apply & receipt'];
    h += '<div class="c07-copy-steps">';
    steps.forEach(function (label, i) {
      var n = i + 1;
      var cls = n === c.step ? ' is-current' : (n < c.step ? ' is-done' : '');
      if (i) h += '<span class="c07-copy-step-sep">—</span>';
      h += '<span class="c07-copy-step' + cls + '"><span class="c07-step-n">' + (n < c.step ? '' : n) +
        (n < c.step ? ico('check') : '') + '</span>' + esc(label) + '</span>';
    });
    h += '</div>';

    if (c.error) {
      h += '<div class="c07-notice">' + ico('warning') + '<div><strong>That did not run.</strong> ' +
        esc(c.error) + '</div></div>';
    }

    if (c.step === 1) h += copyStep1Html();
    else if (c.step === 2) h += copyStep2Html();
    else if (c.step === 3) h += copyStep3Html();
    else h += copyStep4Html();

    h += '</div>';
    return h;
  }

  function copyStep1Html() {
    var sources = window.PM2.copy.sources();
    var h = '<div class="c07-section-head"><h2 class="c07-h2">Where should the settings come from?</h2></div><div style="height:8px"></div>';
    sources.forEach(function (s) {
      var total = 0;
      arr(s.categorySummaries).forEach(function (cs) { total += cs.count; });
      h += '<button type="button" class="c07-source' + (ui.copy.sourceId === s.id ? ' is-active' : '') + '" data-act="copy-source" data-id="' + esc(s.id) + '">' +
        '<span class="c07-source-name">' + esc(s.name) +
        (s.legacy ? '<span class="c07-mgr-flag">Legacy export</span>' : '') + '</span>' +
        '<span class="c07-source-meta">' + fmtInt(total) + ' settings · updated ' + esc(fmtWhen(s.lastUpdated)) + '</span>' +
        '<span class="c07-source-cats">' + arr(s.categorySummaries).map(function (cs) {
          return esc(cs.title) + ' (' + cs.count + ')';
        }).join(' · ') + '</span></button>';
    });
    h += '<div class="c07-copy-nav">' +
      '<button type="button" class="c07-btn c07-btn-primary" data-act="copy-next"' + (ui.copy.sourceId ? '' : ' disabled') + '>Choose categories</button>' +
      '<button type="button" class="c07-btn c07-btn-quiet" data-act="nav" data-dest="' + attr({ route: 'home' }) + '">Cancel</button>' +
      '<span class="c07-note">A legacy source is included on purpose: it produces unavailable values and conflicts so you can see how the preview treats them.</span>' +
      '</div>';
    return h;
  }

  function selectedSource() {
    var sources = window.PM2.copy.sources();
    for (var i = 0; i < sources.length; i++) if (sources[i].id === ui.copy.sourceId) return sources[i];
    return null;
  }

  function copyStep2Html() {
    var s = selectedSource();
    if (!s) { ui.copy.step = 1; return copyStep1Html(); }
    var picked = ui.copy.cats;
    var anyPicked = Object.keys(picked).some(function (k) { return picked[k]; });
    var h = '<div class="c07-section-head"><h2 class="c07-h2">Which areas should come over from ' + esc(s.name) + '?</h2></div>' +
      '<p class="c07-lede c07-section-desc">Only areas where the source actually diverges are listed. Everything else is already identical or untouched.</p>';
    h += '<div class="c07-block" style="max-width:640px">';
    s.categorySummaries.forEach(function (cs) {
      h += '<label class="c07-copy-cat"><input type="checkbox" data-act-check="copy-cat" data-id="' + esc(cs.cat) + '"' +
        (picked[cs.cat] ? ' checked' : '') + '><span>' + esc(cs.title) + '</span>' +
        '<span class="c07-copy-cat-n">' + cs.count + ' settings</span></label>';
    });
    h += '</div>';
    h += '<div class="c07-copy-nav">' +
      '<button type="button" class="c07-btn" data-act="copy-all-cats">Select all</button>' +
      '<button type="button" class="c07-btn c07-btn-primary" data-act="copy-preview"' + (anyPicked ? '' : ' disabled') + '>Review changes</button>' +
      '<button type="button" class="c07-btn c07-btn-quiet" data-act="copy-back">Back</button>' +
      '</div>';
    return h;
  }

  function copyStep3Html() {
    var p = ui.copy.preview;
    if (!p) { ui.copy.step = 2; return copyStep2Html(); }
    var applyCount = p.counts.add + p.counts.replace;
    var h = '<div class="c07-section-head"><h2 class="c07-h2">Review before anything changes</h2></div>';
    h += '<p class="c07-lede c07-section-desc">We compared ' + fmtInt(p.items.length) + ' diverging settings from <strong>' +
      esc(p.sourceName) + '</strong> against this project. Only additions and replacements are ever applied; unavailable and conflicting rows stay untouched.</p>';

    h += '<div class="c07-counts">';
    h += countTile(p.counts.add, 'Will be added', 'add');
    h += countTile(p.counts.replace, 'Will be replaced', 'replace');
    h += countTile(p.counts.unchanged, 'Already the same', 'unchanged');
    h += countTile(p.counts.unavailable, 'Unavailable here', 'unavailable');
    h += countTile(p.counts.conflict, 'Conflicts — not applied', 'conflict');
    h += '</div>';

    /* per-category breakdown */
    h += '<div class="c07-block"><h3>By area</h3><div class="c07-scroll-x"><table class="c07-table"><thead><tr>' +
      '<th>Area</th><th>Add</th><th>Replace</th><th>Same</th><th>Unavailable</th><th>Conflict</th></tr></thead><tbody>';
    p.perCategory.forEach(function (pc) {
      h += '<tr><td>' + esc(pc.title) + '</td><td>' + pc.counts.add + '</td><td>' + pc.counts.replace + '</td>' +
        '<td>' + pc.counts.unchanged + '</td><td>' + pc.counts.unavailable + '</td><td>' + pc.counts.conflict + '</td></tr>';
    });
    h += '</tbody></table></div></div>';

    /* detailed diff rows */
    h += '<div class="c07-block"><h3>Every change, item by item</h3>' +
      '<p class="c07-note">Open a row for the full story. Current value → incoming value.</p>';
    p.items.forEach(function (it, i) {
      var open = !!ui.copy.openItems[i];
      h += '<div class="c07-diff-row" data-setting-id="' + esc(it.settingId) + '">';
      h += '<button type="button" class="c07-diff-head" data-act="copy-item" data-i="' + i + '" data-kind="' + esc(it.kind) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
        '<span class="c07-diff-caret">' + ico(open ? 'minus' : 'plus') + '</span>' +
        '<span class="c07-diff-label">' + esc(it.label || it.settingId) + '</span>' +
        '<span class="c07-diff-kind">' + esc(diffKindWord(it.kind)) + '</span>' +
        '<span class="c07-diff-cur">' + esc(it.kind === 'add' ? '(not set)' : valueText(it.current)) + '</span>' +
        '<span class="c07-diff-arrow">→</span>' +
        '<span class="c07-diff-in">' + esc(valueText(it.incoming)) + '</span>' +
        '</button>';
      if (open) {
        h += '<div class="c07-diff-detail">';
        h += '<dl class="c07-drawer-grid">';
        h += '<div><dt>Setting</dt><dd>' + esc(it.label || '') + ' <code>' + esc(it.settingId) + '</code></dd></div>';
        h += '<div><dt>Current value here</dt><dd>' + esc(it.kind === 'add' ? 'Not set — uses the default' : valueText(it.current)) + '</dd></div>';
        h += '<div><dt>Incoming from ' + esc(p.sourceName) + '</dt><dd>' + esc(valueText(it.incoming)) + '</dd></div>';
        h += '<div><dt>What the transaction does</dt><dd>' + esc(diffKindStory(it.kind)) + '</dd></div>';
        h += '</dl>';
        if (it.note) h += '<div><strong>Note:</strong> ' + esc(it.note) + '</div>';
        h += '</div>';
      }
      h += '</div>';
    });
    h += '</div>';

    h += '<div class="c07-cred-note">' + ico('key') + '<span>' + esc(p.credentialNote) + '</span></div>';

    h += '<div class="c07-copy-nav">' +
      '<button type="button" class="c07-btn c07-btn-primary" data-act="copy-apply"' + (applyCount && !ui.copy.applying ? '' : ' disabled') + '>' +
      (ui.copy.applying ? 'Applying…' : 'Create restore point and apply ' + applyCount + ' change' + (applyCount === 1 ? '' : 's')) + '</button>' +
      '<button type="button" class="c07-btn c07-btn-quiet" data-act="copy-back"' + (ui.copy.applying ? ' disabled' : '') + '>Back</button>' +
      '<span class="c07-note">Apply is atomic: a restore point is created first, all values change together, and the result is verified before the receipt is written.</span>' +
      '</div>';
    h += opsHtml();
    return h;
  }

  function countTile(n, label, kind) {
    return '<div class="c07-count" data-kind="' + esc(kind) + '"><span class="c07-count-v">' + fmtInt(n) + '</span>' +
      '<span class="c07-count-k">' + esc(label) + '</span></div>';
  }
  function diffKindWord(k) {
    return { add: 'Add', replace: 'Replace', unchanged: 'Same', unavailable: 'Unavailable', conflict: 'Conflict' }[k] || k;
  }
  function diffKindStory(k) {
    if (k === 'add') return 'Writes the incoming value. This row currently follows its default.';
    if (k === 'replace') return 'Replaces the value you set here with the incoming one. The restore point can undo it.';
    if (k === 'unchanged') return 'Nothing — both projects already agree.';
    if (k === 'unavailable') return 'Skipped. The incoming value references something this project does not have.';
    return 'Skipped. Both projects changed this row since they diverged, so it needs an explicit decision — nothing is applied.';
  }

  function copyStep4Html() {
    var r = ui.copy.receipt;
    var h = '';
    if (!r) {
      h += '<div class="c07-notice">' + ico('info') + '<div>No transaction has been applied in this session yet.</div></div>';
      h += '<div class="c07-copy-nav"><button type="button" class="c07-btn" data-act="copy-restart">Start over</button></div>';
      return h;
    }
    h += '<div class="c07-section-head"><h2 class="c07-h2">' + (ui.copy.rolledBack ? 'Rolled back' : 'Applied and verified') + '</h2></div>';
    h += '<div class="c07-block" style="max-width:720px"><dl class="c07-kv">';
    h += '<dt>Receipt</dt><dd><code>' + esc(r.receiptId) + '</code></dd>';
    h += '<dt>Restore point</dt><dd><code>' + esc(r.restorePointId) + '</code></dd>';
    h += '<dt>Applied</dt><dd>' + fmtInt(r.applied) + ' value' + (r.applied === 1 ? '' : 's') + ', atomically, then read back and verified.</dd>';
    if (r.skipped) {
      h += '<dt>Not applied</dt><dd>' + r.skipped.unchanged + ' already matched · ' + r.skipped.unavailable +
        ' unavailable · ' + r.skipped.conflict + ' conflicted</dd>';
    }
    h += '<dt>Independence</dt><dd>The source project and this one are not linked. Future changes on either side stay on that side.</dd>';
    h += '</dl></div>';
    if (ui.copy.rolledBack) {
      h += '<div class="c07-notice">' + ico('undo') + '<div><strong>Rollback complete.</strong> Every copied value was restored exactly from the restore point. The receipt records both directions.</div></div>';
    }
    h += '<div class="c07-copy-nav">';
    if (!ui.copy.rolledBack) {
      h += '<button type="button" class="c07-btn" data-act="copy-rollback">' + ico('undo') + 'Roll back this copy</button>';
    }
    h += '<button type="button" class="c07-btn c07-btn-quiet" data-act="nav" data-dest="' + attr({ route: 'home' }) + '">Done</button>';
    h += '<button type="button" class="c07-btn c07-btn-quiet" data-act="copy-restart">Copy from another project</button>';
    h += '</div>';
    h += opsHtml();
    return h;
  }

  function copyRunPreview() {
    var picked = Object.keys(ui.copy.cats).filter(function (k) { return ui.copy.cats[k]; });
    var p = window.PM2.copy.preview(ui.copy.sourceId, picked);
    if (p && !p.error) {
      ui.copy.preview = p;
      ui.copy.openItems = {};
      ui.copy.error = null;
      ui.copy.step = 3;
    } else {
      ui.copy.error = (p && p.error) ? String(p.error) : 'The preview could not be built.';
    }
    render();
  }

  function copyRunApply() {
    if (!ui.copy.preview || ui.copy.applying) return;
    ui.copy.applying = true;
    render();
    window.PM2.copy.apply(ui.copy.preview.token).then(function (res) {
      ui.copy.applying = false;
      if (res && res.ok) {
        ui.copy.receipt = res;
        ui.copy.rolledBack = false;
        ui.copy.error = null;
        ui.copy.step = 4;
      } else {
        /* honest failure surface: say why, nothing was changed */
        ui.copy.error = (res && res.error) ? String(res.error) : 'The copy could not be applied. Nothing was changed.';
      }
      if (ui.view.kind === 'copy') render();
    });
  }

  function copyRunRollback() {
    if (!ui.copy.receipt) return;
    window.PM2.copy.rollback(ui.copy.receipt.receiptId).then(function (res) {
      if (res && res.ok) { ui.copy.rolledBack = true; ui.copy.error = null; }
      else ui.copy.error = (res && res.error) ? String(res.error) : 'The rollback could not run.';
      if (ui.view.kind === 'copy') render();
    });
  }

  /* ============================ render dispatch ============================ */

  var renderRaf = 0;
  function scheduleRender() {
    if (renderRaf) return;
    renderRaf = requestAnimationFrame(function () {
      renderRaf = 0;
      render();
    });
  }

  function render() {
    if (!root) return;
    var rail = document.getElementById('c07Rail');
    var topbar = document.getElementById('c07Topbar');
    rail.innerHTML = railHtml();
    topbar.innerHTML = topbarHtml();
    var v = ui.view;
    var h = '';
    if (v.kind === 'home') h = homeHtml();
    else if (v.kind === 'dest') h = domainHtml(v.cat);
    else if (v.kind === 'all') h = allHtml();
    else if (v.kind === 'copy') h = copyHtml();
    else if (v.kind === 'search') h = searchPageHtml();
    else if (v.kind === 'manager') h = managerHtml(v.managerId, v.objectId, v.tab);
    else h = homeHtml();
    contentEl.innerHTML = h;
    contentEl.scrollTop = 0;
    window.PMIcons.hydrate(root);
    wireSearchFields();
    wireControls();
    if (v.kind === 'all') {
      wireVirtualList();
      wireAllInput();
    }
    root.classList.toggle('nav-open', ui.navOpen);
  }

  function wireAllInput() {
    var input = document.getElementById('c07AllQ');
    if (!input) return;
    var deb = window.PM2.util.debounce(function () {
      ui.all.q = input.value;
      refreshAllList();
    }, 120);
    input.addEventListener('input', deb);
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && input.value) {
        ev.stopPropagation();
        input.value = '';
        ui.all.q = '';
        refreshAllList();
      }
    });
  }

  /* Re-render just the All Settings pane without stealing the filter
     field's focus. */
  function refreshAllList() {
    if (ui.view.kind !== 'all') return;
    var active = document.activeElement === document.getElementById('c07AllQ');
    var selStart = active ? document.getElementById('c07AllQ').selectionStart : 0;
    render();
    if (active) {
      var input = document.getElementById('c07AllQ');
      if (input) {
        try { input.focus(); input.setSelectionRange(selStart, selStart); } catch (e) { /* ok */ }
      }
    }
  }

  /* ============================ event delegation ============================ */

  function onRootClick(ev) {
    var actEl = ev.target.closest('[data-act]');
    if (!actEl || !root.contains(actEl)) {
      if (!ev.target.closest('.c07-searchwrap')) closeDropdown();
      return;
    }
    var act = actEl.getAttribute('data-act');
    if (act !== 'pick-result' && !ev.target.closest('.c07-searchwrap')) closeDropdown();

    if (act === 'nav') {
      var dest = JSON.parse(actEl.getAttribute('data-dest'));
      nav(dest);
    } else if (act === 'pick-result') {
      pickResult(actEl.getAttribute('data-rid'), JSON.parse(actEl.getAttribute('data-dest')));
    } else if (act === 'back') {
      var p = parentDest();
      if (p) nav(p);
    } else if (act === 'close-settings') {
      window.PM2.states.receipt('Close Settings', 'Returns to the Dashboard. In this concept demo there is no app shell behind Settings, so nothing else changes.');
    } else if (act === 'toggle-nav') {
      ui.navOpen = !ui.navOpen;
      root.classList.toggle('nav-open', ui.navOpen);
      actEl.setAttribute('aria-expanded', ui.navOpen ? 'true' : 'false');
    } else if (act === 'toggle-filters') {
      ui.all.filtersOpen = !ui.all.filtersOpen;
      var fac = document.getElementById('c07Facets');
      if (fac) fac.classList.toggle('is-open', ui.all.filtersOpen);
      actEl.setAttribute('aria-expanded', ui.all.filtersOpen ? 'true' : 'false');
    } else if (act === 'fact') {
      var fid = actEl.getAttribute('data-id');
      if (fid) {
        var row = invRow(fid);
        if (row) {
          ensureRowReachable(row);
          ui.locate = { settingId: fid };
          render();
          performLocate();
        }
      }
    } else if (act === 'adv' || act === 'more') {
      var key = actEl.getAttribute('data-key');
      var bag = act === 'adv' ? ui.advOpen : ui.moreOpen;
      bag[key] = !bag[key];
      var keep = contentEl.scrollTop;
      render();
      contentEl.scrollTop = keep;
    } else if (act === 'row-details') {
      var rid = actEl.getAttribute('data-id');
      ui.detailOpen[rid] = !ui.detailOpen[rid];
      if (ui.explain === rid) ui.explain = null;
      refreshRow(rid);
    } else if (act === 'explain-close') {
      var exId = ui.explain;
      ui.explain = null;
      if (exId) refreshRow(exId);
    } else if (act === 'facet') {
      var group = actEl.getAttribute('data-group');
      var val = actEl.getAttribute('data-val');
      ui.all[group] = ui.all[group] === val ? null : val;
      refreshAllList();
    } else if (act === 'chip-changed') {
      ui.all.changed = !ui.all.changed;
      refreshAllList();
    } else if (act === 'chip-tier') {
      ui.all.tier = ui.all.tier === 'advanced' ? null : 'advanced';
      refreshAllList();
    } else if (act === 'chip-kind') {
      var kk = actEl.getAttribute('data-kind');
      ui.all.kind = ui.all.kind === kk ? null : kk;
      refreshAllList();
    } else if (act === 'clear-facets') {
      ui.all = { q: '', cat: null, type: null, tier: null, state: null, kind: null,
        changed: false, sort: ui.all.sort, filtersOpen: ui.all.filtersOpen };
      refreshAllList();
    } else if (act === 'sort') {
      openMenu(actEl, [
        { id: 'inventory', label: 'Inventory order', checked: ui.all.sort === 'inventory' },
        { id: 'az', label: 'A to Z', checked: ui.all.sort === 'az' },
        { id: 'changed', label: 'Changed first', checked: ui.all.sort === 'changed' }
      ], function (picked) {
        ui.all.sort = picked;
        refreshAllList();
      });
    } else if (act === 'sec-open' || act === 'sec-close') {
      var sk = actEl.getAttribute('data-key');
      ui.secOpen[sk] = act === 'sec-open';
      var keep2 = contentEl.scrollTop;
      render();
      contentEl.scrollTop = keep2;
    } else if (act === 'mgr-item') {
      var mk = actEl.getAttribute('data-key');
      ui.mgrItemOpen[mk] = !ui.mgrItemOpen[mk];
      var keep3 = contentEl.scrollTop;
      render();
      contentEl.scrollTop = keep3;
    } else if (act === 'mgr-tab') {
      var t = actEl.getAttribute('data-tab');
      nav({ route: 'manager', managerId: ui.view.managerId, objectId: ui.view.objectId, tab: t });
    } else if (act === 'mgr-action') {
      var def = mgrs().get(ui.view.managerId);
      if (def) runManagerAction(def, actEl.getAttribute('data-action-id'));
    } else if (act === 'copy-source') {
      ui.copy.sourceId = actEl.getAttribute('data-id');
      ui.copy.cats = {};
      ui.copy.preview = null;
      render();
    } else if (act === 'copy-next') {
      if (ui.copy.sourceId) { ui.copy.step = 2; render(); }
    } else if (act === 'copy-back') {
      if (ui.copy.step > 1 && !ui.copy.applying) { ui.copy.step -= 1; render(); }
    } else if (act === 'copy-all-cats') {
      var src = selectedSource();
      if (src) {
        src.categorySummaries.forEach(function (cs) { ui.copy.cats[cs.cat] = true; });
        render();
      }
    } else if (act === 'copy-preview') {
      copyRunPreview();
    } else if (act === 'copy-item') {
      var i = Number(actEl.getAttribute('data-i'));
      ui.copy.openItems[i] = !ui.copy.openItems[i];
      var keep4 = contentEl.scrollTop;
      render();
      contentEl.scrollTop = keep4;
    } else if (act === 'copy-apply') {
      copyRunApply();
    } else if (act === 'copy-rollback') {
      copyRunRollback();
    } else if (act === 'copy-restart') {
      ui.copy = { step: 1, sourceId: null, cats: {}, preview: null, applying: false,
        receipt: ui.copy.receipt, rolledBack: ui.copy.rolledBack, openItems: {} };
      render();
    }
  }

  /* checkbox change (copy categories) */
  function onRootChange(ev) {
    var el = ev.target.closest('[data-act-check="copy-cat"]');
    if (!el) return;
    ui.copy.cats[el.getAttribute('data-id')] = el.checked;
    var btn = contentEl.querySelector('[data-act="copy-preview"]');
    if (btn) {
      var any = Object.keys(ui.copy.cats).some(function (k) { return ui.copy.cats[k]; });
      if (any) btn.removeAttribute('disabled'); else btn.setAttribute('disabled', '');
    }
  }

  /* ============================ escape ladder + keyboard ============================ */

  function onKeydown(ev) {
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'k' || ev.key === 'K')) {
      ev.preventDefault();
      var field = stage.querySelector('#c07TopSearch input, #c07HeroSearch input, #c07PageSearch input');
      if (field) { try { field.focus(); field.select(); } catch (e) { /* ok */ } }
      return;
    }
    if (ev.key !== 'Escape') return;
    /* 1. popup menu */
    if (menuState) { closeMenu(true); return; }
    /* 2. search dropdown */
    if (ui.search.open) { closeDropdown(); return; }
    /* 3. narrow drawers */
    if (ui.navOpen) { ui.navOpen = false; root.classList.remove('nav-open'); return; }
    if (ui.all.filtersOpen && ui.view.kind === 'all') {
      ui.all.filtersOpen = false;
      var fac = document.getElementById('c07Facets');
      if (fac) fac.classList.remove('is-open');
      return;
    }
    /* 4. explanation panel / row drawers */
    if (ui.explain) {
      var exId = ui.explain;
      ui.explain = null;
      refreshRow(exId);
      return;
    }
    var openRows = Object.keys(ui.detailOpen).filter(function (k) { return ui.detailOpen[k]; });
    if (openRows.length) {
      ui.detailOpen = {};
      openRows.forEach(refreshRow);
      return;
    }
    var openItems = Object.keys(ui.mgrItemOpen).filter(function (k) { return ui.mgrItemOpen[k]; });
    if (openItems.length) { ui.mgrItemOpen = {}; render(); return; }
    /* 5. one Settings level out; stop at Home */
    var p = parentDest();
    if (p) nav(p);
  }

  /* Enter/Space on virtual rows (role=button divs) */
  function onRootKeydownForRows(ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var el = ev.target.closest('.c07-vrow[data-act="nav"]');
    if (!el) return;
    ev.preventDefault();
    nav(JSON.parse(el.getAttribute('data-dest')));
  }

  /* ============================ width watcher ============================ */

  function watchWidth() {
    function apply() {
      var w = stage.clientWidth || window.innerWidth;
      var narrow = w < 940;
      if (narrow !== ui.narrow) {
        ui.narrow = narrow;
        if (!narrow) ui.navOpen = false;
        root.classList.toggle('is-narrow', narrow);
        root.classList.toggle('nav-open', ui.navOpen);
      }
    }
    if (typeof ResizeObserver === 'function') {
      var ro = new ResizeObserver(apply);
      ro.observe(stage);
    } else {
      window.addEventListener('resize', apply);
    }
    apply();
  }

  /* ============================ store subscriptions ============================ */

  function subscribe() {
    store.on('scenario', function (p) {
      /* Workaround for a shared-module gap: applyScenario/setFixtures with
         persist:false never reach store.get('scenario'|'fixtures'), so
         store.attention() and the row-state fallback would read stale
         state. Mirror the active state into the store's session layer
         (never persisted) so every shared read agrees. */
      if (p && typeof store._setSession === 'function') {
        try {
          if (p.id && store.get('scenario') !== p.id) store._setSession('scenario', p.id);
          if (Array.isArray(p.fixtures)) store._setSession('fixtures', p.fixtures.slice());
        } catch (e) { /* session mirror is best-effort */ }
      }
      invalidateAllIndex();
      scheduleRender();
    });
    store.on('stress', function () {
      invalidateAllIndex();
      if (ui.view.kind === 'all' || ui.view.kind === 'search') scheduleRender();
    });
    store.on('value', function (p) {
      invalidateAllIndex();
      if (p && p.batch) { scheduleRender(); return; }
      if (ui.view.kind === 'all') { refreshAllList(); return; }
      if (p && p.id && p.source !== 'settings') refreshRow(p.id);
      if (ui.view.kind === 'home') scheduleRender();
    });
    store.on('op', function (p) {
      var k = opKey(p);
      if (!ui.ops[k]) ui.opsOrder.push(k);
      ui.ops[k] = p;
      if (ui.opsOrder.length > 12) {
        var drop = ui.opsOrder.shift();
        delete ui.ops[drop];
      }
      refreshOps();
    });
    store.on('receipt', function (p) {
      if (p && p.message) window.PMShell.toast(p.message);
    });
    store.on('copy', function (p) {
      if (ui.view.kind !== 'copy' || !p) return;
      /* Drawer-triggered copy ops (import-preview etc.) re-render the flow */
      if (p.phase === 'rolled-back' && ui.copy.receipt && p.receiptId === ui.copy.receipt.receiptId) {
        ui.copy.rolledBack = true;
        scheduleRender();
      }
    });
  }

  /* ============================ boot ============================ */

  function boot() {
    stage = document.getElementById('pmStage');
    store = window.PM2.store.init('c07-compendium');
    window.PMShell.init({ concept: 'c07-compendium', store: store });
    buildSkeleton();
    root.addEventListener('change', onRootChange);
    root.addEventListener('keydown', onRootKeydownForRows);
    subscribe();
    try { window.PM2.states.mountDrawer(store); } catch (e) { /* drawer optional */ }
    window.PM2.route.bind({ open: open });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
