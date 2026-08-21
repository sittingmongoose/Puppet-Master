/* concept-08-directory-take-3.js — fable · 08 Beacon (A1 Directory / Take 3)
   Bright, spacious Puppet Master Settings directory. Home = search +
   attention + seven LARGE domain cards (documented grouping of the 12
   inventory categories — nothing disappears). Domain pages = unmistakable
   manager destination blocks + subgroup-sectioned inventory rows. Provider
   manager = summary-first status cards + explicit honest quick actions +
   tabs. Full-width copy transaction. Universal search everywhere.
   Consumes _shared2 (PM2.*) exactly as contracted; renders its own markup
   (c08- prefix only). Motion: gentle scale/fade. No emoji. Slint notes:
   route/menu/drawer state is explicit data in `ui`; lists over 40 rows are
   windowed; no DOM-geometry-derived semantics. */
(function () {
  'use strict';

  var CONCEPT = 'c08-beacon';

  var store = null;
  var stage = null;
  var els = { root: null, bar: null, page: null, ops: null, toasts: null };

  /* ------------------------------------------------------------------ */
  /* small helpers                                                       */
  /* ------------------------------------------------------------------ */

  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object') ? x : {}; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function ico(name) { return '<i data-ico="' + esc(name) + '"></i>'; }
  function hydrate(node) { try { window.PMIcons.hydrate(node || els.root); } catch (e) { /* icons optional */ } }
  function fmtAgo(when) { try { return window.PM2.util.fmtAgo(when); } catch (e) { return ''; } }
  /* Dates far in the past keep their year (fmtAgo drops it). */
  function fmtWhen(when) {
    var t = Date.parse(when);
    if (!isFinite(t)) return String(when || '');
    var d = new Date(t);
    if (d.getUTCFullYear() !== 2026) {
      var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
    }
    return fmtAgo(when);
  }
  function fmtInt(n) { try { return window.PM2.util.fmtInt(n); } catch (e) { return String(n); } }
  function debounce(fn, ms) { return window.PM2.util.debounce(fn, ms); }

  function goHash(dest, params) {
    /* Serialized route for data-go attributes — always built from a dest
       object via the shared grammar, never from labels or positions. */
    try { return window.PM2.route.build(dest, params || null); } catch (e) { return '#/home'; }
  }
  function nav(dest, params) { window.PM2.route.go(dest, params ? { params: params } : undefined); }

  function scenario() {
    /* URL-applied scenarios (no pin=1) are never persisted to the store key,
       so the states module is the authority when it is loaded. */
    var S = window.PM2.states;
    if (S && typeof S.activeScenario === 'function') {
      try { return String(S.activeScenario() || 'baseline'); } catch (e) { /* fall through */ }
    }
    return String(store.get('scenario') || 'baseline');
  }
  function fixtures() { return arr(store.get('fixtures')); }
  function hasFx(id) { return fixtures().indexOf(id) >= 0; }

  function fmtVal(v) {
    if (v === null || v === undefined || v === '') return '—';
    if (v === true) return 'On';
    if (v === false) return 'Off';
    if (Array.isArray(v)) return v.length + (v.length === 1 ? ' item' : ' items');
    if (typeof v === 'object') {
      try {
        var s = JSON.stringify(v);
        return s.length > 60 ? s.slice(0, 57) + '…' : s;
      } catch (e) { return 'Complex value'; }
    }
    var out = String(v);
    return out.length > 80 ? out.slice(0, 77) + '…' : out;
  }

  /* ------------------------------------------------------------------ */
  /* inventory index + the seven-card grouping (documented mapping)      */
  /* ------------------------------------------------------------------ */

  var INV = { byId: {}, cats: [], catById: {} };

  function buildInvIndex() {
    var inv = obj(window.PM2_INVENTORY);
    INV.cats = arr(inv.categories);
    INV.cats.forEach(function (c) { INV.catById[c.id] = c; });
    arr(inv.settings).forEach(function (s) { INV.byId[s.id] = s; });
  }
  function catTitle(cat) { var c = INV.catById[cat]; return c ? c.title : 'Settings'; }
  function subTitle(cat, sub) {
    var c = INV.catById[cat];
    if (!c) return sub || '';
    var g = arr(c.subgroups).filter(function (x) { return x.id === sub; })[0];
    return g ? g.title : (sub || '');
  }

  /* The Beacon grouping: 12 inventory categories -> 7 large cards.
     COMPLETE mapping — every category appears on exactly one card and
     stays reachable at #/dest/<cat>. This table IS the documentation the
     packet requires; it is mirrored in the concept's impact register. */
  var CARDS = [
    { id: 'card.everyday', icon: 'palette', title: 'Everyday & Appearance',
      purpose: 'How Puppet Master looks, sounds, starts, and greets you day to day.',
      cats: ['general'] },
    { id: 'card.ai', icon: 'brain', title: 'Providers & AI',
      purpose: 'Your AI accounts and models, what they cost, and what happens when included usage runs out.',
      cats: ['ai'] },
    { id: 'card.safety', icon: 'shield', title: 'Safety',
      purpose: 'What the AI may do on its own — and the moments where it must ask you first.',
      cats: ['safety'] },
    { id: 'card.code', icon: 'terminal', title: 'Code & Collaboration',
      purpose: 'Terminal, editor, execution, worktrees, and how multiple agents work one repository.',
      cats: ['code', 'branching'] },
    { id: 'card.mind', icon: 'puzzle', title: 'Planning & Memory',
      purpose: 'How projects get planned and verified, what the AI remembers, and the cast of Personas.',
      cats: ['planning', 'memory', 'personas'] },
    { id: 'card.reach', icon: 'globe', title: 'Web & Media',
      purpose: 'How the AI reads the web, searches this project, and turns work into media.',
      cats: ['web', 'media'] },
    { id: 'card.system', icon: 'gear', title: 'Extensions & System',
      purpose: 'Add-on abilities, health checks, storage, backups, and the power-user switches.',
      cats: ['extensions', 'system'] }
  ];

  /* ------------------------------------------------------------------ */
  /* ui state (explicit machine; Slint-portable)                         */
  /* ------------------------------------------------------------------ */

  var ui = {
    view: { kind: 'home' },
    advOpen: {},           /* "<cat>/<sub>" -> true */
    rowDetails: {},        /* settingId -> true */
    itemDetails: {},       /* manager item id -> true */
    sectOpen: {},          /* managerId/sectionId -> true (advanced sections) */
    hostPick: {},          /* providerId -> chosen host choice id */
    search: { query: '', res: null, open: false, hot: -1, ridMap: {} },
    all: { q: '', cat: '', type: '', tier: '', changed: false, state: '', first: 0 },
    copy: { step: 'source', sourceId: null, cats: {}, preview: null, receipt: null, busy: false, failed: null, rolledBack: false },
    recentsOpen: false,
    ops: {},
    menu: null,            /* {anchor, items, onPick, current} while a popup menu is open */
    locateTimer: 0,
    searchBlurTimer: 0     /* pending polite dropdown close; cancelled by any navigation */
  };

  var KIND_WORDS = {
    setting: 'Setting', manager: 'Manager', object: 'Managed object',
    action: 'Action', workflow: 'Setup & repair', diagnostic: 'Diagnostic',
    unavailable: 'Not available', help: 'Help'
  };

  var TAB_LABELS = {
    overview: 'Overview', accounts: 'Accounts', models: 'Models',
    limits: 'Usage & limits', routing: 'Routing', installs: 'Installation',
    setup: 'Set up', activity: 'Activity', advanced: 'Advanced',
    routes: 'Routes', catalog: 'Catalog', server: 'Server'
  };
  function tabLabel(id) {
    if (TAB_LABELS[id]) return TAB_LABELS[id];
    var s = String(id || '').replace(/[-_.]+/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ------------------------------------------------------------------ */
  /* view helpers                                                        */
  /* ------------------------------------------------------------------ */

  function viewFromDest(dest) {
    var d = obj(dest);
    var r = String(d.route || 'home');
    if (r === 'dest') return { kind: 'dest', cat: d.cat || 'general', sub: d.sub || null };
    if (r === 'manager') return { kind: 'manager', managerId: d.managerId || null, objectId: d.objectId || null, tab: d.tab || null, sectionId: d.sectionId || null };
    if (r === 'setting') {
      var rec = INV.byId[d.settingId];
      if (!rec) return { kind: 'missing-setting', settingId: d.settingId || null };
      return { kind: 'setting', settingId: d.settingId, cat: rec.cat, sub: rec.sub };
    }
    if (r === 'search') return { kind: 'search', query: String(d.query || '') };
    if (r === 'all') return { kind: 'all' };
    if (r === 'copy') return { kind: 'copy' };
    return { kind: 'home' };
  }

  function parentOf(view) {
    var v = obj(view);
    if (v.kind === 'home') return null;
    if (v.kind === 'manager' && v.managerId) {
      var def = window.PM2.managers.get(v.managerId);
      if (v.objectId && v.tab && v.tab !== 'overview') {
        return { dest: { route: 'manager', managerId: v.managerId, objectId: v.objectId }, label: def ? def.title : 'Manager' };
      }
      if (v.objectId) {
        return { dest: { route: 'manager', managerId: v.managerId }, label: def ? def.title : 'Manager' };
      }
      if (def && def.cat) return { dest: { route: 'dest', cat: def.cat }, label: catTitle(def.cat) };
      return { dest: { route: 'home' }, label: 'Settings Home' };
    }
    if (v.kind === 'setting') return { dest: { route: 'dest', cat: v.cat }, label: catTitle(v.cat) };
    if (v.kind === 'dest') {
      if (v.sub) return { dest: { route: 'dest', cat: v.cat }, label: catTitle(v.cat) };
      return { dest: { route: 'home' }, label: 'Settings Home' };
    }
    return { dest: { route: 'home' }, label: 'Settings Home' };
  }

  function crumbsFor(view) {
    var v = obj(view);
    var parts = [{ label: 'Settings', dest: { route: 'home' } }];
    if (v.kind === 'dest' || v.kind === 'setting') {
      parts.push({ label: catTitle(v.cat), dest: { route: 'dest', cat: v.cat } });
      if (v.kind === 'setting' && v.settingId) {
        var rec = INV.byId[v.settingId];
        parts.push({ label: rec ? rec.label : v.settingId, here: true });
      } else if (v.sub) {
        parts.push({ label: subTitle(v.cat, v.sub), here: true });
      }
    } else if (v.kind === 'manager' && v.managerId) {
      var def = window.PM2.managers.get(v.managerId);
      if (def && def.cat) parts.push({ label: catTitle(def.cat), dest: { route: 'dest', cat: def.cat } });
      parts.push({ label: def ? def.title : 'Manager', dest: { route: 'manager', managerId: v.managerId } });
      if (v.objectId) {
        var vm = def && def.status === 'demonstrated' ? def.model(store) : null;
        var pg = vm && vm.pages ? vm.pages[v.objectId] : null;
        parts.push({ label: pg ? pg.title : v.objectId, here: true });
      }
    } else if (v.kind === 'missing-setting') parts.push({ label: 'Not found', here: true });
    else if (v.kind === 'all') parts.push({ label: 'All Settings', here: true });
    else if (v.kind === 'copy') parts.push({ label: 'Copy from another project', here: true });
    else if (v.kind === 'search') parts.push({ label: 'Search', here: true });
    if (!parts[parts.length - 1].here) parts[parts.length - 1].here = true;
    return parts;
  }

  /* ------------------------------------------------------------------ */
  /* router entry — PM2.route.bind({open}) calls this for every link     */
  /* ------------------------------------------------------------------ */

  function openDest(dest) {
    closeMenu();
    /* A navigation decides the dropdown state on its own; no timer scheduled
       against the previous surface may fire after this point. */
    cancelSearchBlur();
    var d = obj(dest);
    ui.view = viewFromDest(d);
    if (ui.view.kind === 'search') {
      ui.search.query = ui.view.query;
      ui.search.open = ui.view.query.length > 0;
      if (ui.search.open) runSearch(ui.view.query);
    } else {
      ui.search.open = false;
    }
    if (ui.view.kind === 'copy' && ui.copy.step === 'receipt' && !ui.copy.receipt) ui.copy.step = 'source';
    render();
    return new Promise(function (resolve) {
      window.requestAnimationFrame(function () {
        try { locate(d); } catch (e) { /* locator errors stay local */ }
        resolve(null);
      });
    });
  }

  /* Deep-link landing: scroll the exact element, focus it, mark it with
     the calm decaying pm2-located treatment. The URL route grammar carries
     manager/object/tab but NOT sectionId, so a focus rid is resolved back
     through the search index to recover the full destination. */
  function locate(dest) {
    var d = obj(dest);
    var target = null;
    var focus = String(d.focus || '');

    function q(sel) { return els.page ? els.page.querySelector(sel) : null; }
    function byObjOrSection(id) {
      if (!id) return null;
      return q('[data-object-id="' + cssEsc(id) + '"]') || q('[data-section="' + cssEsc(id) + '"]');
    }

    /* Recover the search result's full dest from the rid. */
    var rdest = null;
    if (focus && focus.indexOf(':') > 0) {
      try {
        var rr = window.PM2.search.resolveRid(focus);
        if (rr) rdest = obj(rr.dest);
      } catch (e) { rdest = null; }
    }
    rdest = rdest || {};

    var settingId = d.settingId || rdest.settingId ||
      (focus.indexOf('s:') === 0 ? focus.slice(2) : null) ||
      (focus && focus.indexOf(':') < 0 ? focus : null);

    /* 1. exact inventory row (auto-open the advanced disclosure if needed) */
    if (settingId) {
      target = q('[data-setting-id="' + cssEsc(settingId) + '"]');
      if (!target) {
        var rec = INV.byId[settingId];
        if (rec) {
          ui.advOpen[rec.cat + '/' + rec.sub] = true;
          render();
          target = q('[data-setting-id="' + cssEsc(settingId) + '"]');
        }
      }
    }
    /* 2. exact section item (accounts row, installation, model, credential) */
    if (!target) target = byObjOrSection(rdest.sectionId || d.sectionId);
    /* 3. rid tail (o:/u:/d: object ids, h: topic ids) */
    if (!target && /^[oud]:/.test(focus)) {
      target = byObjOrSection(focus.slice(2).split('/').slice(1).join('/'));
    }
    if (!target && focus.indexOf('h:') === 0) target = byObjOrSection(focus.slice(2));
    /* 4. the managed object itself */
    if (!target) target = byObjOrSection(rdest.objectId && rdest.objectId !== d.objectId ? rdest.objectId : null);
    if (!target && d.objectId && ui.view.kind === 'manager' && !(ui.view.tab)) {
      target = q('[data-object-id="' + cssEsc(d.objectId) + '"]');
    }
    /* 5. a domain subgroup */
    if (!target && d.sub && ui.view.kind === 'dest') target = q('[data-section="sub.' + cssEsc(d.sub) + '"]');
    /* 6. manager fallbacks: the active tab's section, then the header —
       a manager-level result still gets a real landing element. */
    if (!target && ui.view.kind === 'manager' && (focus || d.objectId || d.tab)) {
      var tabId = d.tab || rdest.tab;
      if (tabId) target = q('[data-section="' + cssEsc(tabId) + '"]');
      if (!target) target = q('.c08-mgr-head');
    }
    if (!target) {
      if (d.reason) toast('Not available right now — ' + d.reason);
      return;
    }

    target.scrollIntoView({ block: 'center' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    try { target.focus({ preventScroll: true }); } catch (e) { /* focus best-effort */ }
    target.classList.add('c08-locatable');
    target.classList.add('pm2-located');
    if (ui.locateTimer) clearTimeout(ui.locateTimer);
    ui.locateTimer = setTimeout(function () {
      target.classList.remove('pm2-located');
    }, 1900);
    if (d.reason) toast(String(d.reason));
  }

  function cssEsc(s) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(s));
    return String(s).replace(/["\\\]\[]/g, '\\$&');
  }

  /* ------------------------------------------------------------------ */
  /* rendering root                                                      */
  /* ------------------------------------------------------------------ */

  function render() {
    if (!els.page) return;
    var keepScroll = stage ? stage.scrollTop : 0;
    var v = ui.view;
    renderBar();
    var html = '';
    if (v.kind === 'home' || v.kind === 'search') html = homeHtml();
    else if (v.kind === 'dest' || v.kind === 'setting') html = domainHtml(v.cat);
    else if (v.kind === 'missing-setting') html = missingSettingHtml(v.settingId);
    else if (v.kind === 'manager') html = managerHtml(v);
    else if (v.kind === 'all') html = allHtml();
    else if (v.kind === 'copy') html = copyHtml();
    els.page.innerHTML = '<div class="c08-enter">' + html + '</div>';
    hydrate(els.page);
    if (v.kind === 'home' || v.kind === 'search') {
      restoreSearchField();
    }
    if (v.kind === 'all') { bindAllScroll(); renderAllWindow(); }
    if (v.kind === 'manager' || v.kind === 'dest' || v.kind === 'setting') {
      /* same-surface re-renders keep place */
      if (stage && keepScroll && v.kind !== 'setting') stage.scrollTop = keepScroll;
    }
  }

  function renderBar() {
    if (!els.bar) return;
    var v = ui.view;
    if (v.kind === 'home') { els.bar.hidden = true; els.bar.innerHTML = ''; return; }
    /* The search surface keeps the beacon bar too (packet 03 location
       contract: Back to <named location> on every destination) — but its
       search field IS the hero right below, so the bar omits its own. */
    var isSearch = v.kind === 'search';
    els.bar.hidden = false;
    var parent = parentOf(v);
    var crumbs = crumbsFor(v);
    var ch = crumbs.map(function (c, i) {
      var span = c.here
        ? '<span class="c08-crumb-here">' + esc(c.label) + '</span>'
        : '<a href="' + esc(goHash(c.dest)) + '">' + esc(c.label) + '</a>';
      return (i ? '<span class="c08-crumb-sep">/</span>' : '') + span;
    }).join('');
    els.bar.innerHTML =
      '<div class="c08-measure"><div class="c08-bar-inner">' +
        (parent
          ? '<button type="button" class="c08-bar-back" data-pm2-back data-act="go" data-go="' + esc(goHash(parent.dest)) + '"' +
              ' aria-label="Back to ' + esc(parent.label) + '">' +
              ico('arrowL') + '<span>' + esc(parent.label) + '</span></button>'
          : '') +
        '<nav class="c08-crumbs" aria-label="Breadcrumb">' + ch + '</nav>' +
        '<span class="c08-bar-spacer"></span>' +
        (isSearch ? '' : searchHtml('bar')) +
        '<button type="button" class="c08-close" data-act="close-settings">' + ico('close') + '<span>Close Settings</span></button>' +
      '</div></div>';
    hydrate(els.bar);
    restoreSearchField();
  }

  /* ------------------------------------------------------------------ */
  /* universal search                                                    */
  /* ------------------------------------------------------------------ */

  function searchHtml(where) {
    return '<div class="c08-search-wrap" data-search="' + where + '">' +
      '<i class="c08-search-ico" data-ico="search"></i>' +
      '<input class="c08-search-input" data-pm2-search-input type="text" role="combobox" aria-expanded="' + (ui.search.open ? 'true' : 'false') + '"' +
        ' aria-label="Search settings" autocomplete="off" spellcheck="false"' +
        ' placeholder="Search settings, managers, providers, help…" value="' + esc(ui.search.query) + '">' +
      '<span class="c08-search-kbd"><kbd>Ctrl</kbd><kbd>K</kbd></span>' +
      '<div class="c08-drop-anchor"></div>' +
    '</div>';
  }

  function activeSearchWrap() {
    var where = (ui.view.kind === 'home' || ui.view.kind === 'search') ? 'hero' : 'bar';
    var scope = where === 'hero' ? els.page : els.bar;
    return scope ? scope.querySelector('.c08-search-wrap[data-search="' + where + '"]') : null;
  }

  /* Drops a pending polite-close so it can never fire against a surface that
     has since been replaced (see the focusout binding). */
  function cancelSearchBlur() {
    if (ui.searchBlurTimer) { clearTimeout(ui.searchBlurTimer); ui.searchBlurTimer = 0; }
  }

  function restoreSearchField() {
    var wrap = activeSearchWrap();
    if (!wrap) return;
    var input = wrap.querySelector('.c08-search-input');
    if (input && input.value !== ui.search.query) input.value = ui.search.query;
    if (ui.search.open) renderDrop();
  }

  function runSearch(q) {
    ui.search.query = q;
    var out = null;
    try { out = window.PM2.search.query(q, { limit: 24 }); } catch (e) { out = { query: q, total: 0, groups: [] }; }
    ui.search.res = out;
    ui.search.hot = -1;
    ui.search.ridMap = {};
    arr(out.groups).forEach(function (g) {
      arr(g.results).forEach(function (r) { ui.search.ridMap[r.rid] = r; });
    });
  }

  function flatResults() {
    var flat = [];
    if (!ui.search.res) return flat;
    arr(ui.search.res.groups).forEach(function (g) {
      arr(g.results).forEach(function (r) { flat.push(r); });
    });
    return flat;
  }

  function renderDrop() {
    var wrap = activeSearchWrap();
    if (!wrap) return;
    var host = wrap.querySelector('.c08-drop-anchor');
    if (!host) return;
    if (!ui.search.open || !ui.search.query) { host.innerHTML = ''; return; }
    var res = ui.search.res || { total: 0, groups: [] };
    var html = '<div class="c08-drop" role="listbox">';
    if (!res.total) {
      html += '<div class="c08-drop-empty"><strong>No matches for “' + esc(ui.search.query) + '”</strong>' +
        '<p>Nothing in this project’s settings, managers, or guides matches. Try a different word, or browse instead.</p>' +
        '<div class="c08-drop-links">' +
          '<button type="button" class="c08-btn" data-act="go" data-go="' + esc(goHash({ route: 'all' })) + '">' + ico('list') + 'Browse all 828 settings</button>' +
          '<button type="button" class="c08-btn c08-btn-quiet" data-act="go" data-go="' + esc(goHash({ route: 'home' })) + '">Settings Home</button>' +
        '</div></div>';
    } else {
      var shown = flatResults().length;
      html += '<div class="c08-drop-head"><span>' +
        (res.total > shown ? 'Top ' + shown + ' of ' + res.total + ' matches — keep typing to narrow' : shown + (shown === 1 ? ' match' : ' matches')) +
        '</span><span>Enter opens · Esc closes</span></div>';
      var flatIndex = 0;
      arr(res.groups).forEach(function (g) {
        html += '<div class="c08-drop-group">' + esc(g.label) + '</div>';
        arr(g.results).forEach(function (r) {
          var hot = flatIndex === ui.search.hot;
          html += '<button type="button" class="c08-result' + (hot ? ' is-hot' : '') + '" role="option" data-rid="' + esc(r.rid) + '" data-act="result">' +
            '<span class="c08-result-top"><span class="c08-result-label">' + esc(r.label) + '</span>' +
            '<span class="c08-result-kind">' + esc(KIND_WORDS[r.kind] || r.kind) + '</span></span>' +
            '<span class="c08-result-path">' + esc(arr(r.path).join('  /  ')) + '</span>' +
            (r.sub ? '<span class="c08-result-sub">' + esc(r.sub) + '</span>' : '') +
            (r.availability ? '<span class="c08-result-avail">' + esc(r.availability) + '</span>' : '') +
          '</button>';
          flatIndex++;
        });
      });
    }
    html += '</div>';
    host.innerHTML = html;
    hydrate(host);
  }

  function syncSearchRoute() {
    var h = goHash({ route: 'search', query: ui.search.query });
    var cur = window.PM2.route.current();
    if (cur.route.kind === 'search') {
      window.PM2.route.go({ route: 'search', query: ui.search.query }, { replace: true, silent: true });
    } else {
      window.PM2.route.go(h, { silent: true });
    }
  }

  function chooseResult(rid) {
    var r = ui.search.ridMap[rid];
    if (!r) return;
    ui.search.open = false;
    syncSearchRoute();
    nav(r.dest, { focus: r.rid });
  }

  /* ------------------------------------------------------------------ */
  /* Home                                                                */
  /* ------------------------------------------------------------------ */

  /* At most ONE critical banner, only in scenarios that warrant one.
     Returns {html, noticeId} so the attention list can skip the same item. */
  function bannerInfo() {
    var scn = scenario();
    var warranted = { 'offline': 1, 'usage-exhausted': 1, 'invocation-failed': 1, 'first-run': 1 };
    if (!warranted[scn]) return { html: '', noticeId: null };
    var notice = null;
    /* Prefer the scenario's own pushed notice (unshifted to the front). */
    arr(store.data.notices).some(function (n) {
      if (n && String(n.id).indexOf('pm2-scn') === 0) { notice = n; return true; }
      return false;
    });
    if (!notice) {
      arr(store.data.notices).some(function (n) {
        if (n && (n.kind === 'attention' || n.kind === 'setup')) { notice = n; return true; }
        return false;
      });
    }
    var head, body, dest, noticeId = null;
    if (notice) {
      head = notice.headline; body = notice.consequence;
      dest = noticeDest(notice);
      noticeId = notice.id;
    } else if (scn === 'offline') {
      head = 'No network connection detected';
      body = 'Provider status, web search, and update checks are paused. Cached values stay visible and everything resumes with the connection.';
      dest = { route: 'dest', cat: 'web' };
    } else {
      return { html: '', noticeId: null };
    }
    var html = '<div class="c08-banner" role="status">' + ico(scn === 'first-run' ? 'sparkle' : 'warning') +
      '<div class="c08-banner-text"><strong>' + esc(head) + '</strong><span>' + esc(body) + '</span></div>' +
      '<button type="button" class="c08-btn" data-act="go" data-go="' + esc(goHash(dest)) + '">Open</button></div>';
    return { html: html, noticeId: noticeId };
  }

  /* Map a scenario notice target (v1 or v2 vocabulary) onto a route dest. */
  function noticeDest(n) {
    var t = obj(obj(n).target);
    if (t.cat) return { route: 'dest', cat: t.cat, sub: t.sub || null };
    if (t.settingId) return { route: 'setting', settingId: t.settingId };
    if (t.providerId) return { route: 'manager', managerId: 'm.providers', objectId: t.providerId };
    if (t.manager === 'providers') return { route: 'manager', managerId: 'm.providers' };
    return { route: 'dest', cat: 'ai' };
  }

  /* The compact attention list. store.attention() is curated but reads only
     the PERSISTED scenario key; when a URL applied the scenario ephemerally
     the mutated data.notices are the honest source instead. */
  function attentionItems() {
    var scn = scenario();
    if (scn === 'calm' || scn === 'first-run') return [];
    if (scn === String(store.get('scenario') || 'baseline')) return store.attention();
    var out = [];
    arr(store.data.notices).forEach(function (n) {
      if (!n || !n.headline) return;
      out.push({
        id: n.id, statusWord: n.statusWord || (n.kind === 'setup' ? 'Setup' : 'Attention'),
        headline: n.headline, consequence: n.consequence || '',
        dest: noticeDest(n)
      });
    });
    return out.slice(0, scn === 'attention-heavy' || scn === 'invocation-failed' ? 8 : 4);
  }

  function attnHtml(skipNoticeId) {
    var items = attentionItems().filter(function (it) {
      return !skipNoticeId || it.id !== skipNoticeId;
    });
    if (!items.length) {
      if (scenario() === 'first-run') {
        return '<div class="c08-attn"><div class="c08-attn-head">' + ico('checkCircle') + 'Needs attention</div>' +
          '<div class="c08-attn-clear">Nothing yet. Once providers and tools are set up, anything that needs a decision appears here — quietly.</div></div>';
      }
      return '<div class="c08-attn"><div class="c08-attn-head">' + ico('checkCircle') + 'Needs attention</div>' +
        '<div class="c08-attn-clear">All clear. Nothing needs a decision right now.</div></div>';
    }
    var strong = { 'Failed': 1, 'Offline': 1, 'Waiting': 1 };
    var rows = items.map(function (it) {
      return '<button type="button" class="c08-attn-item" data-act="go" data-go="' + esc(goHash(it.dest)) + '">' +
        '<span class="c08-attn-word"><span class="pm-status-word" data-tone="' + (strong[it.statusWord] ? 'attention' : 'setup') + '">' + esc(it.statusWord) + '</span></span>' +
        '<span class="c08-attn-body"><span class="c08-attn-headline">' + esc(it.headline) + '</span>' +
        '<span class="c08-attn-why">' + esc(it.consequence) + '</span></span>' + ico('chevR') + '</button>';
    }).join('');
    return '<section class="c08-attn" aria-label="Needs attention">' +
      '<div class="c08-attn-head">' + ico('warning') + 'Needs attention</div>' + rows + '</section>';
  }

  function cardHtml(card, counts) {
    var byCat = {};
    arr(counts.byCategory).forEach(function (c) { byCat[c.id] = c; });
    var single = card.cats.length === 1;
    var head =
      '<div class="c08-card-head">' +
        '<span class="c08-card-plate">' + ico(card.icon) + '</span>' +
        '<div class="c08-card-title-wrap"><h2 class="c08-card-title">' + esc(card.title) + '</h2>' +
        '<p class="c08-card-purpose">' + esc(card.purpose) + '</p></div>' +
      '</div>';
    var list = '';
    if (single) {
      var cat = card.cats[0];
      var cc = byCat[cat] || { total: 0, changed: 0, subgroups: [] };
      list += '<button type="button" class="c08-card-link" data-act="go" data-go="' + esc(goHash({ route: 'dest', cat: cat })) + '">' +
        '<span class="c08-card-link-label">' + esc(catTitle(cat)) +
        '<span class="c08-card-link-hint">Everything in this area' + (cc.changed ? ' · ' + cc.changed + ' changed from default' : '') + '</span></span>' +
        '<span class="c08-card-count">' + cc.total + ' settings</span>' + ico('chevR') + '</button>';
      arr(cc.subgroups).forEach(function (g) {
        list += '<button type="button" class="c08-card-link" data-act="go" data-go="' + esc(goHash({ route: 'dest', cat: cat, sub: g.id })) + '">' +
          '<span class="c08-card-link-label">' + esc(g.title) + '</span>' +
          '<span class="c08-card-count">' + g.total + '</span>' + ico('chevR') + '</button>';
      });
    } else {
      card.cats.forEach(function (cat) {
        var cc = byCat[cat] || { total: 0, changed: 0 };
        var c = INV.catById[cat] || {};
        list += '<button type="button" class="c08-card-link" data-act="go" data-go="' + esc(goHash({ route: 'dest', cat: cat })) + '">' +
          '<span class="c08-card-link-label">' + esc(catTitle(cat)) +
          '<span class="c08-card-link-hint">' + esc(c.desc || '') + '</span></span>' +
          '<span class="c08-card-count">' + cc.total + ' settings</span>' + ico('chevR') + '</button>';
      });
    }
    return '<article class="c08-card">' + head + '<div class="c08-card-list">' + list + '</div></article>';
  }

  function homeHtml() {
    var counts = store.counts();
    var proj = obj(store.data.project);
    var firstRun = scenario() === 'first-run';
    var recents = firstRun ? [] : store.recents();
    var banner = bannerInfo();
    var html = '<div class="c08-home c08-measure">' +
      '<header class="c08-mast"><div class="c08-mast-text">' +
        '<h1 class="c08-title">Settings</h1>' +
        '<div class="c08-project">' + ico('folder') +
          '<span>Project</span><span class="c08-project-name">' + esc(proj.name || 'Puppet Master') + '</span>' +
          '<span class="c08-project-role">· ' + esc(proj.role || '') + '</span>' +
          '<span class="c08-project-role">· every change here applies to this project only</span>' +
        '</div></div>' +
        (ui.view.kind === 'search'
          ? '' /* the beacon bar above already carries Close on the search surface */
          : '<button type="button" class="c08-close" data-act="close-settings">' + ico('close') + '<span>Close Settings</span></button>') +
      '</header>' +
      '<div class="c08-hero">' + searchHtml('hero') + '</div>' +
      banner.html +
      attnHtml(banner.noticeId) +
      '<section class="c08-cards" aria-label="Settings areas">' +
        CARDS.map(function (c) { return cardHtml(c, counts); }).join('') +
      '</section>' +
      '<div class="c08-utils">' +
        '<button type="button" class="c08-util" data-act="go" data-go="' + esc(goHash({ route: 'all' })) + '">' + ico('list') + 'All Settings</button>' +
        '<button type="button" class="c08-util" data-act="go" data-go="' + esc(goHash({ route: 'copy' })) + '">' + ico('copy') + 'Copy from another project</button>' +
        '<button type="button" class="c08-util" data-act="toggle-recents" aria-expanded="' + (ui.recentsOpen ? 'true' : 'false') + '">' + ico('history') + 'Recent changes</button>' +
        '<span class="c08-util-note">' + counts.total + ' settings · ' + counts.changed + ' changed from default</span>' +
      '</div>';
    if (ui.recentsOpen) {
      if (!recents.length) {
        html += '<div class="c08-recents"><div class="c08-attn-clear">' +
          (firstRun ? 'No changes yet — this project still runs on defaults. Anything you change shows up here with its before and after.'
                    : 'No recent changes.') + '</div></div>';
      } else {
        html += '<div class="c08-recents">' + recents.slice(0, 6).map(function (r) {
          return '<button type="button" class="c08-recent" data-act="go" data-go="' + esc(goHash({ route: 'setting', settingId: r.settingId })) + '">' +
            '<span class="c08-recent-when">' + esc(fmtAgo(r.when)) + '</span>' +
            '<span class="c08-recent-what"><strong>' + esc(r.label) + '</strong> ' +
            '<span class="c08-recent-vals">' + esc(r.fromLabel || '—') + ' → ' + esc(r.toLabel || '—') + (r.note ? ' · ' + r.note : '') + '</span></span>' +
          '</button>';
        }).join('') + '</div>';
      }
    }
    html += '</div>';
    return html;
  }

  /* ------------------------------------------------------------------ */
  /* Domain pages                                                        */
  /* ------------------------------------------------------------------ */

  function chipHtml(chip) {
    return '<span class="pm-chip-value" data-kind="' + esc(chip.kind) + '">' + esc(chip.label) + '</span>';
  }

  function controlHtml(row) {
    var t = row.control.type;
    var disabled = row.state === 'managed' || row.state === 'unavailable';
    if (t === 'toggle') {
      return '<button type="button" class="c08-switch" role="switch" aria-checked="' + (row.value === true || row.value === 'on' ? 'true' : 'false') + '"' +
        (disabled ? ' disabled' : '') + ' data-act="toggle" data-id="' + esc(row.id) + '" aria-label="' + esc(row.label) + '"></button>';
    }
    if (t === 'select' || t === 'radio') {
      return '<button type="button" class="c08-select"' + (disabled ? ' disabled' : '') + ' data-act="menu" data-id="' + esc(row.id) + '" aria-haspopup="menu">' +
        '<span class="c08-select-value">' + esc(row.valueLabel || 'Choose…') + '</span>' + ico('chevD') + '</button>';
    }
    if (t === 'multiselect') {
      return '<button type="button" class="c08-select"' + (disabled ? ' disabled' : '') + ' data-act="multi" data-id="' + esc(row.id) + '" aria-haspopup="menu">' +
        '<span class="c08-select-value">' + esc(row.valueLabel || 'Choose…') + '</span>' + ico('chevD') + '</button>';
    }
    if (t === 'number') {
      var min = row.control.min != null ? ' min="' + row.control.min + '"' : '';
      var max = row.control.max != null ? ' max="' + row.control.max + '"' : '';
      return '<input class="c08-input" type="number" inputmode="numeric"' + min + max +
        ' value="' + esc(typeof row.value === 'number' ? row.value : '') + '"' + (disabled ? ' disabled' : '') +
        ' data-act="num" data-id="' + esc(row.id) + '" aria-label="' + esc(row.label) + '">';
    }
    if (t === 'slider') {
      if (typeof row.value === 'number' && row.control.min != null) {
        var step = (row.control.max - row.control.min) <= 1 ? 0.05 : 1;
        return '<span class="c08-range"><input type="range" min="' + row.control.min + '" max="' + row.control.max + '" step="' + step + '"' +
          ' value="' + row.value + '"' + (disabled ? ' disabled' : '') + ' data-act="range" data-id="' + esc(row.id) + '" aria-label="' + esc(row.label) + '">' +
          '<span class="c08-range-val">' + esc(row.valueLabel) + '</span></span>';
      }
      return '<button type="button" class="c08-select"' + (disabled ? ' disabled' : '') + ' data-act="menu" data-id="' + esc(row.id) + '" aria-haspopup="menu">' +
        '<span class="c08-select-value">' + esc(row.valueLabel || 'Adjust…') + '</span>' + ico('chevD') + '</button>';
    }
    if (t === 'text' || t === 'path') {
      return '<input class="c08-input c08-input-wide" type="text" value="' + esc(typeof row.value === 'string' ? row.value : '') + '"' +
        (disabled ? ' disabled' : '') + ' data-act="text" data-id="' + esc(row.id) + '" aria-label="' + esc(row.label) + '"' +
        (t === 'path' ? ' spellcheck="false"' : '') + '>';
    }
    if (t === 'action') {
      return '<button type="button" class="c08-btn"' + (disabled ? ' disabled' : '') + ' data-act="row-action" data-id="' + esc(row.id) + '">' +
        esc(row.valueLabel || 'Open') + '</button>';
    }
    /* list / keyvalue: honest read-only summary; contents in Details */
    return '<button type="button" class="c08-detail-btn" data-act="row-details" data-id="' + esc(row.id) + '">View items</button>';
  }

  var STATE_ICON = {
    'managed': 'lock', 'unavailable': 'eyeOff', 'restart-required': 'refresh',
    'reconnect-required': 'plug', 'changed-elsewhere': 'warning', 'error': 'warning'
  };

  var ECHOING_CONTROLS = { toggle: 1, select: 1, radio: 1, number: 1, slider: 1, text: 1, path: 1, multiselect: 1 };

  function rowHtml(row) {
    var badges = arr(row.badges).map(function (b) {
      return '<span class="c08-result-kind">' + esc(b) + '</span>';
    }).join('');
    /* An interactive control already shows the value — repeat it as a chip
       only when the chip carries extra meaning (managed, unavailable,
       differs, recommended, not-configured). */
    var chips = arr(row.chips).filter(function (c) {
      if (!ECHOING_CONTROLS[row.control.type]) return true;
      return c.kind !== 'custom' && c.kind !== 'default';
    }).map(chipHtml).join('');
    var stateLine = '';
    if (row.stateNote) {
      stateLine = '<div class="c08-row-state">' + ico(STATE_ICON[row.state] || 'info') + '<span>' + esc(row.stateNote) + '</span></div>';
    }
    var details = '';
    if (ui.rowDetails[row.id]) {
      var d = obj(row.detail);
      var rel = arr(d.related);
      var raw = INV.byId[row.id];
      details = '<dl class="c08-row-details">' +
        '<div><dt>Applies to</dt><dd>' + esc(d.legacyScopeNote || 'This project only.') + '</dd></div>' +
        (row.recommended !== undefined ? '<div><dt>Recommended</dt><dd>' + esc(fmtVal(row.recommended)) + '</dd></div>' : '') +
        (rel.length ? '<div><dt>Related</dt><dd>' + esc(rel.join(' · ')) + '</dd></div>' : '') +
        ((row.control.type === 'list' || row.control.type === 'keyvalue') && row.value != null
          ? '<div><dt>Current items</dt><dd>' + esc(JSON.stringify(row.value).slice(0, 400)) + '</dd></div>' : '') +
        (raw ? '<div><dt>Setting id</dt><dd>' + esc(raw.id) + '</dd></div>' : '') +
        '</dl>';
    }
    return '<div class="c08-row" data-setting-id="' + esc(row.id) + '" data-state="' + esc(row.state) + '">' +
      '<div class="c08-row-main">' +
        '<div class="c08-row-text"><div class="c08-row-label">' + esc(row.label) + badges + '</div>' +
        '<div class="c08-row-desc">' + esc(row.desc) + '</div></div>' +
        '<div class="c08-row-side">' + chips + controlHtml(row) +
          '<button type="button" class="c08-detail-btn" data-act="row-details" data-id="' + esc(row.id) + '" aria-expanded="' + (ui.rowDetails[row.id] ? 'true' : 'false') + '">Details</button>' +
        '</div>' +
      '</div>' + stateLine + details + '</div>';
  }

  function mgrBlockHtml(def) {
    var deferred = def.status === 'deferred_named_owner';
    return '<button type="button" class="c08-mgr-block" data-manager="' + esc(def.id) + '" data-act="go" data-go="' + esc(goHash({ route: 'manager', managerId: def.id })) + '">' +
      '<span class="c08-card-plate">' + ico(def.icon || 'gear') + '</span>' +
      '<span class="c08-mgr-block-text"><span class="c08-mgr-block-title">' + esc(def.title) + '</span>' +
      '<span class="c08-mgr-block-blurb">' + esc(def.blurb || '') + '</span>' +
      '<span class="c08-mgr-block-word">' + (deferred ? 'Reserved · named owner' : 'Manager') + '</span></span>' +
    '</button>';
  }

  /* Honest surface for a deep link whose setting id is not in this
     project's inventory (stale bookmark, older export, other version). */
  function missingSettingHtml(settingId) {
    return '<div class="c08-measure"><div class="c08-empty" style="margin-top:48px;max-width:720px">' +
      '<strong>That setting is not in this project&rsquo;s settings</strong>' +
      'The link points at a setting Puppet Master does not have here. It may come from an older export, a different version, or a renamed setting &mdash; nothing was changed by following it.' +
      '<dl class="c08-row-details" style="margin-top:12px;border-top:0;padding:10px 0 0"><div><dt>Linked id</dt><dd>' + esc(settingId || '(empty)') + '</dd></div></dl>' +
      '<div class="c08-drop-links">' +
        '<button type="button" class="c08-btn" data-act="go" data-go="' + esc(goHash({ route: 'all' })) + '">' + ico('list') + 'Browse all 828 settings</button>' +
        '<button type="button" class="c08-btn c08-btn-quiet" data-act="go" data-go="' + esc(goHash({ route: 'home' })) + '">Settings Home</button>' +
      '</div></div></div>';
  }

  function domainHtml(cat) {
    var c = INV.catById[cat];
    if (!c) {
      return '<div class="c08-measure"><div class="c08-empty" style="margin-top:40px"><strong>That area does not exist</strong>' +
        'The link points at a Settings area this project does not have. Head back to the directory.' +
        '<div class="c08-drop-links"><button type="button" class="c08-btn" data-act="go" data-go="' + esc(goHash({ route: 'home' })) + '">Settings Home</button></div></div></div>';
    }
    var counts = store.counts();
    var cc = arr(counts.byCategory).filter(function (x) { return x.id === cat; })[0] || { total: 0, changed: 0, simple: 0, advanced: 0 };
    var defs = window.PM2.managers.byCat(cat);
    var demonstrated = defs.filter(function (d) { return d.status === 'demonstrated'; });
    var deferred = defs.filter(function (d) { return d.status === 'deferred_named_owner'; });

    var html = '<div class="c08-measure"><header class="c08-domain-head">' +
      '<span class="c08-card-plate">' + ico(c.icon || 'gear') + '</span>' +
      '<div class="c08-domain-text"><h1 class="c08-domain-title">' + esc(c.title) + '</h1>' +
      '<p class="c08-domain-desc">' + esc(c.desc || '') + '</p>' +
      '<div class="c08-domain-counts"><span>' + cc.total + ' settings</span><span>' + cc.simple + ' everyday · ' + cc.advanced + ' advanced</span>' +
      (cc.changed ? '<span>' + cc.changed + ' changed from default</span>' : '<span>everything at defaults</span>') +
      (hasFx('fx.loading-cached') ? '<span class="c08-refresh-note">' + ico('refresh') + 'Refreshing — cached values shown</span>' : '') +
      '</div></div></header>';

    if (demonstrated.length || deferred.length) {
      html += '<section class="c08-sect" aria-label="Managers"><div class="c08-sect-head"><h2 class="c08-sect-title">Managers</h2>' +
        '<span class="c08-sect-sub">Bigger destinations that own the moving parts of ' + esc(c.title) + '</span></div>' +
        '<div class="c08-mgr-blocks">' + demonstrated.map(mgrBlockHtml).join('') + '</div>';
      if (deferred.length) {
        html += '<div class="c08-sect-head" style="margin-top:20px"><h2 class="c08-sect-title" style="font-size:var(--fs-md)">Reserved destinations</h2>' +
          '<span class="c08-sect-sub">Named owner modules that insert here later — reachable, honest, read-only</span></div>' +
          '<div class="c08-mgr-blocks">' + deferred.map(mgrBlockHtml).join('') + '</div>';
      }
      html += '</section>';
    }

    arr(c.subgroups).forEach(function (g) {
      var rows = store.rowsFor(cat, g.id);
      var visible = [];
      var advanced = [];
      rows.forEach(function (r) {
        var raw = INV.byId[r.id];
        if ((raw && raw.curated) || r.tier === 'simple') visible.push(r); else advanced.push(r);
      });
      if (!visible.length && advanced.length) { visible = advanced.slice(0, 4); advanced = advanced.slice(4); }
      var key = cat + '/' + g.id;
      var open = !!ui.advOpen[key];
      html += '<section class="c08-sect" data-section="sub.' + esc(g.id) + '" aria-label="' + esc(g.title) + '">' +
        '<div class="c08-sect-head"><h2 class="c08-sect-title">' + esc(g.title) + '</h2>' +
        '<span class="c08-sect-sub">' + rows.length + ' settings</span></div>' +
        (g.desc ? '<p class="c08-sect-desc">' + esc(g.desc) + '</p>' : '') +
        '<div class="c08-rows">' + visible.map(rowHtml).join('');
      if (advanced.length) {
        html += '<button type="button" class="c08-adv-toggle" data-act="toggle-adv" data-key="' + esc(key) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
          ico('chevR') + (open ? 'Hide' : 'Show') + ' ' + advanced.length + ' advanced setting' + (advanced.length === 1 ? '' : 's') + '</button>';
        if (open) html += advanced.map(rowHtml).join('');
      }
      html += '</div></section>';
    });

    html += '</div>';
    return html;
  }

  /* ------------------------------------------------------------------ */
  /* Manager surfaces                                                    */
  /* ------------------------------------------------------------------ */

  function toneWord(status) {
    var st = obj(status);
    if (!st.label) return '';
    return '<span class="pm-status-word" data-tone="' + esc(st.tone || 'muted') + '">' + esc(st.label) + '</span>';
  }

  function statCardHtml(item) {
    var it = obj(item);
    var label = it.label || '';
    var value = it.valueLabel != null ? it.valueLabel : (it.value != null ? fmtVal(it.value) : '—');
    var open = it.dest ? ' role="link" tabindex="0" data-act="go" data-go="' + esc(goHash(it.dest)) + '"' : '';
    return '<div class="c08-stat" data-tone="' + esc(it.tone || '') + '"' + open + (it.id ? ' data-object-id="' + esc(it.id) + '"' : '') + '>' +
      '<div class="c08-stat-k">' + esc(label) + '</div>' +
      '<div class="c08-stat-v">' + esc(String(value)) + '</div>' +
      (it.status ? toneWord(it.status) : '') +
      (it.note ? '<div class="c08-stat-note">' + esc(it.note) + '</div>' : '') +
    '</div>';
  }

  function ladderHtml(steps) {
    if (!arr(steps).length) return '';
    return '<div class="c08-ladder"><div class="c08-ladder-cap">When included usage runs out, in order</div>' + steps.map(function (s) {
      return '<div class="c08-ladder-step"><span class="c08-ladder-n">' + s.n + '.</span><span>' + esc(s.label) + '</span></div>';
    }).join('') + '</div>';
  }

  function sameSurfaceDest(dest) {
    var d = obj(dest);
    var v = ui.view;
    return v.kind === 'manager' && d.route === 'manager' &&
      d.managerId === v.managerId &&
      (d.objectId || null) === (v.objectId || null) &&
      (!d.tab || d.tab === (v.tab || null) || (!v.tab && d.tab));
  }

  function itemHtml(managerId, item) {
    var it = obj(item);
    var flags = obj(it.flags);
    var flagHtml = '';
    if (flags.selected) flagHtml += '<span class="c08-item-flag" data-flag="selected">In use</span>';
    if (flags.shadowed) flagHtml += '<span class="c08-item-flag" data-flag="shadowed">Shadowed</span>';
    if (flags.manualOnly) flagHtml += '<span class="c08-item-flag">Manual only</span>';
    var actions = '';
    var hasDetailsAction = false;
    arr(it.actions).forEach(function (a) {
      if (a.id === 'details') hasDetailsAction = true;
      actions += '<button type="button" class="c08-btn c08-btn-quiet" data-act="item-action" data-item="' + esc(it.id) + '" data-item-act="' + esc(a.id) + '">' + esc(a.label) + '</button>';
    });
    var detailOpen = !!ui.itemDetails[managerId + '/' + it.id];
    var detail = '';
    if (detailOpen && it.detail) {
      detail = '<dl class="c08-row-details">' + Object.keys(obj(it.detail)).map(function (k) {
        var v = it.detail[k];
        if (v == null || (Array.isArray(v) && !v.length)) return '';
        return '<div><dt>' + esc(k.replace(/([A-Z])/g, ' $1')) + '</dt><dd>' + esc(typeof v === 'object' ? JSON.stringify(v).slice(0, 320) : String(v)) + '</dd></div>';
      }).join('') + '</dl>';
    }
    var clickable = it.dest && !arr(it.actions).length;
    return '<div class="c08-item' + (clickable ? ' is-click' : '') + '" data-object-id="' + esc(it.id) + '"' +
      (clickable ? ' data-act="go" data-go="' + esc(goHash(it.dest)) + '" tabindex="0" role="link"' : '') + '>' +
      '<div class="c08-item-body"><div class="c08-item-label">' + esc(it.label) + flagHtml + '</div>' +
      (it.sub ? '<div class="c08-item-sub">' + esc(it.sub) + '</div>' : '') +
      (it.shadowNote ? '<div class="c08-item-note">' + esc(it.shadowNote) + '</div>' : '') +
      (it.manualOnlyReason ? '<div class="c08-item-note">' + esc(it.manualOnlyReason) + '</div>' : '') +
      (it.note && !it.sub ? '<div class="c08-item-note">' + esc(it.note) + '</div>' : '') +
      (obj(it.status).note ? '<div class="c08-item-note">' + esc(it.status.note) + '</div>' : '') +
      detail +
      '</div>' +
      '<div class="c08-item-side">' + (it.status ? toneWord(it.status) : '') +
        '<div class="c08-item-actions">' + actions +
        (it.detail && !hasDetailsAction ? '<button type="button" class="c08-detail-btn" data-act="item-details" data-key="' + esc(managerId + '/' + it.id) + '">' + (detailOpen ? 'Hide detail' : 'Detail') + '</button>' : '') +
        (it.dest && arr(it.actions).length && !sameSurfaceDest(it.dest) ? '<button type="button" class="c08-btn c08-btn-quiet" data-act="go" data-go="' + esc(goHash(it.dest)) + '">Open</button>' : '') +
        '</div>' +
      '</div></div>';
  }

  function fieldRowHtml(f) {
    var fd = obj(f);
    var chips = fd.state && fd.state !== 'normal'
      ? '<span class="pm-chip-value" data-kind="' + (fd.state === 'managed' ? 'managed' : 'unavailable') + '">' + esc(fd.valueLabel || '—') + '</span>'
      : '<span class="pm-chip-value" data-kind="custom">' + esc(fd.valueLabel != null && fd.valueLabel !== '' ? fd.valueLabel : '—') + '</span>';
    return '<div class="c08-row"' + (fd.settingId ? ' data-setting-id="' + esc(fd.settingId) + '"' : '') + '>' +
      '<div class="c08-row-main"><div class="c08-row-text">' +
      '<div class="c08-row-label">' + esc(fd.label) + '</div>' +
      (fd.note ? '<div class="c08-row-desc">' + esc(fd.note) + '</div>' : '') + '</div>' +
      '<div class="c08-row-side">' + chips +
      (fd.dest ? '<button type="button" class="c08-detail-btn" data-act="go" data-go="' + esc(goHash(fd.dest)) + '">Open</button>' : '') +
      '</div></div></div>';
  }

  function tableHtml(sec) {
    var cols = arr(sec.columns);
    var head = cols.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('');
    var body = arr(sec.rows).map(function (r) {
      var cells = cols.map(function (c) {
        return '<td>' + esc(obj(r.cells)[c.id] != null ? r.cells[c.id] : '—') + '</td>';
      }).join('');
      var open = r.dest ? ' data-object-id="' + esc(r.id) + '" data-act="go" data-go="' + esc(goHash(r.dest)) + '" tabindex="0"' : (r.id ? ' data-object-id="' + esc(r.id) + '"' : '');
      return '<tr' + open + '>' + cells + '</tr>';
    }).join('');
    return '<div class="c08-tablewrap"><table class="c08-table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function stepsHtml(sec) {
    var html = '';
    if (sec.officialSource) {
      html += '<div class="c08-cred-note">' + ico('shield') + '<span><strong>Official source only.</strong> ' +
        esc(sec.sourceNote || ('Installed from ' + sec.officialSource + '. Nothing is bundled or pre-seeded; sign-in is a separate step.')) +
        (sec.policyNote ? ' ' + esc(sec.policyNote) : '') + '</span></div>';
    }
    if (arr(sec.hostChoices).length) {
      var mgrId = ui.view.managerId || '';
      var objId = ui.view.objectId || '';
      var pick = ui.hostPick[objId] || sec.hostChoices[0].id;
      html += '<div class="c08-sect-head" style="margin-top:16px"><h3 class="c08-sect-title" style="font-size:var(--fs-md)">Where to install</h3>' +
        '<span class="c08-sect-sub">the exact host and environment; nothing installs anywhere else</span></div>' +
        '<div class="c08-items">' + sec.hostChoices.map(function (h) {
          return '<button type="button" class="c08-item is-click" style="align-items:center" aria-pressed="' + (h.id === pick ? 'true' : 'false') + '"' +
            ' data-act="host-pick" data-obj="' + esc(objId) + '" data-host="' + esc(h.id) + '">' +
            '<span class="c08-cat-tile-box">' + ico('check') + '</span>' +
            '<span class="c08-item-body"><span class="c08-item-label">' + esc(h.label) + '</span></span>' +
            (h.id === pick ? '<span class="c08-item-flag" data-flag="selected">Selected</span>' : '') +
          '</button>';
        }).join('') + '</div>';
      void mgrId;
    }
    html += '<div class="c08-steps">' + arr(sec.steps).map(function (s) {
      return '<div class="c08-step"><span class="c08-step-n">' + s.n + '</span>' +
        '<div class="c08-step-body"><strong>' + esc(s.label) + '</strong>' + (s.detail ? '<p>' + esc(s.detail) + '</p>' : '') + '</div></div>';
    }).join('') + '</div>';
    return html;
  }

  function logHtml(sec) {
    var html = '';
    if (sec.loading) {
      html += '<div style="margin-top:12px"><span class="c08-refresh-note">' + ico('refresh') + esc(obj(sec.loading).note || 'Refreshing…') + '</span></div>';
    }
    if (arr(sec.sources).length) {
      html += '<div class="c08-items">' + sec.sources.map(function (s) { return itemHtml(ui.view.managerId || 'm', s); }).join('') + '</div>';
    }
    var entries = arr(sec.entries);
    if (entries.length) {
      html += '<div class="c08-log">' + entries.slice(0, 24).map(function (e) {
        return '<div class="c08-log-entry"><span class="c08-log-when">' + esc(e.at ? fmtAgo(e.at) || e.at : '') + '</span>' +
          '<span class="c08-log-what">' + esc(e.label) +
          (e.detail ? '<span class="c08-log-detail">' + esc(e.detail) + '</span>' : '') + '</span>' +
          (e.tone && e.tone !== 'muted' ? '<span class="pm-status-word" data-tone="' + esc(e.tone) + '">' + (e.tone === 'ok' ? 'OK' : 'Check') + '</span>' : '') +
        '</div>';
      }).join('') + '</div>';
    } else if (!arr(sec.sources).length && !sec.loading) {
      html += '<div class="c08-empty" style="margin-top:12px"><strong>Nothing here yet</strong>Events show up as they happen.</div>';
    }
    return html;
  }

  function healthHtml(sec) {
    return '<div class="c08-checks">' + arr(sec.checks).map(function (c) {
      return '<button type="button" class="c08-check" data-object-id="' + esc(c.id) + '"' +
        (c.dest ? ' data-act="go" data-go="' + esc(goHash(c.dest)) + '"' : '') + '>' +
        '<span class="c08-check-label">' + esc(c.label) + '</span>' +
        toneWord({ label: c.state, tone: c.tone === 'progress' ? 'muted' : c.tone }) +
        (c.note ? '<span class="c08-check-note">' + esc(c.note) + '</span>' : '') +
      '</button>';
    }).join('') + '</div>';
  }

  function rosterHtml(sec, managerId) {
    if (arr(sec.groups).length) {
      return sec.groups.map(function (g) {
        return '<div class="c08-prov-group"><h3 class="c08-prov-group-title">' + esc(g.label) + '</h3>' +
          '<div class="c08-prov-grid">' + arr(g.items).map(function (p) {
            var ans = obj(p.answers);
            return '<button type="button" class="c08-prov-card" data-object-id="' + esc(p.id) + '" data-act="go" data-go="' + esc(goHash(p.dest)) + '">' +
              '<span class="c08-prov-card-top"><span class="c08-prov-card-name">' + esc(p.label) + '</span>' + toneWord(p.status) + '</span>' +
              (p.sub ? '<span class="c08-prov-card-sub">' + esc(p.sub) + '</span>' : '') +
              (ans.modelsAvail ? '<span class="c08-prov-card-note">' + esc(ans.modelsAvail) + '</span>' : '') +
              (obj(p.status).note ? '<span class="c08-prov-card-note">' + esc(p.status.note) + '</span>' : '') +
            '</button>';
          }).join('') + '</div></div>';
      }).join('');
    }
    return '<div class="c08-items">' + arr(sec.items).map(function (it) { return itemHtml(managerId, it); }).join('') + '</div>';
  }

  function sectionHtml(sec, managerId) {
    var s = obj(sec);
    var body = '';
    var kind = s.kind || 'overview';
    if (kind === 'roster') body = rosterHtml(s, managerId);
    else if (kind === 'form') body = '<div class="c08-rows" style="margin-top:14px">' + arr(s.fields).map(fieldRowHtml).join('') + '</div>';
    else if (kind === 'table') body = tableHtml(s);
    else if (kind === 'steps') body = stepsHtml(s);
    else if (kind === 'log') body = logHtml(s);
    else if (kind === 'health') body = healthHtml(s);
    else if (kind === 'preview' && (s.counts || arr(s.conflicts).length)) body = importPreviewHtml(s);
    else {
      /* overview + preview + any future kind: items/rows as status cards,
         fields as form rows, entries as a log */
      var items = arr(s.items).length ? s.items : arr(s.rows);
      if (items.length) body = '<div class="c08-statgrid">' + items.map(statCardHtml).join('') + '</div>';
      if (arr(s.fields).length) body += '<div class="c08-rows" style="margin-top:14px">' + s.fields.map(fieldRowHtml).join('') + '</div>';
      if (arr(s.entries).length) body += logHtml({ entries: s.entries });
      if (arr(s.checks).length) body += healthHtml(s);
      if (arr(s.steps).length) body += stepsHtml(s);
      if (!body) body = '<div class="c08-empty" style="margin-top:12px"><strong>Nothing to show</strong>This section has no content in the current state.</div>';
    }
    body += ladderHtml(s.whatNext);

    var head = '<div class="c08-sect-head"><h2 class="c08-sect-title">' + esc(s.title || '') + '</h2></div>' +
      (s.note ? '<p class="c08-sect-desc">' + esc(s.note) + '</p>' : '');

    if (s.advanced) {
      var key = managerId + '/' + s.id;
      var open = !!ui.sectOpen[key];
      return '<section class="c08-sect" data-section="' + esc(s.id) + '">' +
        '<div class="c08-rows"><button type="button" class="c08-adv-toggle" data-act="toggle-sect" data-key="' + esc(key) + '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
        ico('chevR') + esc(s.title || 'Advanced') + '</button></div>' +
        (open ? head.replace('<h2 class="c08-sect-title">', '<h2 class="c08-sect-title" style="margin-top:14px">') + body : '') +
      '</section>';
    }
    return '<section class="c08-sect" data-section="' + esc(s.id) + '">' + head + body + '</section>';
  }

  /* The Settings Lifecycle staged-import preview: shared modules emit it as
     {state, source, counts:{add,change,conflict,invalid,legacyMigrated},
      conflicts[], invalid, legacyMigrated, restorePointId, note} rather than
     items/rows, so the generic fallback cannot render it. */
  function importPreviewHtml(s) {
    var src = obj(s.source);
    var counts = obj(s.counts);
    var html = '';
    if (src.file) {
      html += '<p class="c08-sect-desc">Staged file <strong>' + esc(src.file) + '</strong>' +
        (src.createdOn ? ' from ' + esc(src.createdOn) : '') +
        (src.mode ? ' · ' + esc(src.mode) : '') +
        (s.state ? ' · ' + esc(String(s.state)) : '') + '.</p>';
    }
    var cards = [
      { label: 'Will be added', value: counts.add },
      { label: 'Will change', value: counts.change },
      { label: 'Conflicts', value: counts.conflict, tone: counts.conflict ? 'attention' : '' },
      { label: 'Invalid entries', value: counts.invalid, tone: counts.invalid ? 'attention' : '' },
      { label: 'Migrated from legacy keys', value: counts.legacyMigrated }
    ].filter(function (c) { return c.value != null; });
    if (cards.length) {
      html += '<div class="c08-statgrid">' + cards.map(function (c) {
        return statCardHtml({ label: c.label, valueLabel: String(c.value), tone: c.tone || '' });
      }).join('') + '</div>';
    }
    var conflicts = arr(s.conflicts);
    if (conflicts.length) {
      html += tableHtml({
        columns: [
          { id: 'setting', label: 'Conflicting setting' },
          { id: 'local', label: 'This project' },
          { id: 'incoming', label: 'Incoming' },
          { id: 'note', label: 'Why it conflicts' }
        ],
        rows: conflicts.map(function (c) {
          var rec = INV.byId[c.settingId];
          return {
            id: c.settingId,
            dest: c.dest,
            cells: {
              setting: rec ? rec.label : c.settingId,
              local: c.local != null ? c.local : '—',
              incoming: c.incoming != null ? c.incoming : '—',
              note: c.note || 'Both sides changed this value.'
            }
          };
        })
      });
      html += '<p class="c08-sect-desc">Conflicts are kept out of an apply until you choose a side; the restore point' +
        (s.restorePointId ? ' (' + esc(s.restorePointId) + ')' : '') + ' covers a full rollback.</p>';
    }
    if (s.note) html += '<p class="c08-sect-desc">' + esc(s.note) + '</p>';
    return html || '<div class="c08-empty" style="margin-top:12px"><strong>Nothing staged</strong>No import preview is waiting right now.</div>';
  }

  function actionsRowHtml(def) {
    var acts = [];
    try { acts = arr(def.actions(store)); } catch (e) { acts = []; }
    if (!acts.length) return '';
    var html = '<div class="c08-actions"><span class="c08-actions-label">Actions</span>';
    acts.forEach(function (a) {
      if (a.available === false) {
        /* The disabled button and its reason are one block (see
           .c08-action-unavail): as bare siblings of the wrapping flex row a
           wrap could strand the sentence beside unrelated enabled buttons. */
        html += '<span class="c08-action-unavail">' +
          '<button type="button" class="c08-btn" disabled title="' + esc(a.reason || 'Not available right now.') + '">' +
          (a.ico ? ico(a.ico) : '') + esc(a.label) + '</button>' +
          '<span class="c08-action-reason">' + esc(a.reason || '') + '</span></span>';
      } else {
        html += '<button type="button" class="c08-btn" data-act="mgr-action" data-actid="' + esc(a.id) + '">' +
          (a.ico ? ico(a.ico) : '') + esc(a.label) + '</button>';
      }
    });
    return html + '</div>';
  }

  function providerQuickActions(pageObj, providerId) {
    var tabs = arr(pageObj.tabs);
    var html = '<div class="c08-actions"><span class="c08-actions-label">Quick actions</span>';
    if (tabs.indexOf('setup') >= 0) {
      html += '<button type="button" class="c08-btn c08-btn-primary" data-act="go" data-go="' + esc(goHash({ route: 'manager', managerId: 'm.providers', objectId: providerId, tab: 'setup' })) + '">' + ico('download') + 'Set up</button>';
    }
    if (tabs.indexOf('accounts') >= 0) {
      html += '<button type="button" class="c08-btn" data-act="trigger" data-trigger="reconnect" data-ref="' + esc(providerId) + '">' + ico('user') + 'Sign in / reconnect</button>';
    }
    html += '<button type="button" class="c08-btn" data-act="trigger" data-trigger="provider-refresh" data-ref="' + esc(providerId) + '">' + ico('refresh') + 'Refresh status</button>';
    if (tabs.indexOf('installs') >= 0) {
      html += '<button type="button" class="c08-btn" data-act="trigger" data-trigger="install-scan" data-ref="' + esc(providerId) + '">' + ico('search') + 'Check for updates</button>';
      /* Repair appears only when an installation truly offers repair. */
      var installs = obj(obj(pageObj.sections).installs);
      arr(installs.items).some(function (it) {
        var repairable = arr(it.actions).some(function (a) { return a.id === 'repair'; });
        if (repairable) {
          html += '<button type="button" class="c08-btn" data-act="trigger" data-trigger="install-repair" data-ref="' + esc(String(it.id).replace(/^inst\./, '')) + '">' + ico('wrench') + 'Repair</button>';
          return true;
        }
        return false;
      });
    }
    return html + '</div>';
  }

  function managerHtml(v) {
    var def = window.PM2.managers.get(v.managerId);
    if (!def) {
      return '<div class="c08-measure"><div class="c08-empty" style="margin-top:40px"><strong>Unknown manager</strong>' +
        'No manager with that name exists in this project. The directory below has every real destination.' +
        '<div class="c08-drop-links"><button type="button" class="c08-btn" data-act="go" data-go="' + esc(goHash({ route: 'home' })) + '">Settings Home</button></div></div></div>';
    }
    var deferred = def.status === 'deferred_named_owner';
    var vm = null;
    try { vm = def.model(store); } catch (e) { vm = null; }
    vm = obj(vm);

    var html = '<div class="c08-measure">';
    var pageObj = (vm.pages && v.objectId) ? vm.pages[v.objectId] : null;

    /* header */
    var title = pageObj ? pageObj.title : (vm.title || def.title);
    var status = pageObj ? pageObj.status : vm.status;
    html += '<header class="c08-mgr-head">' +
      '<span class="c08-card-plate">' + ico(def.icon || 'gear') + '</span>' +
      '<div class="c08-mgr-head-text"><h1 class="c08-mgr-title">' + esc(title) + (status ? toneWord(status) : '') +
      (vm.readOnly ? '<span class="c08-item-flag">Read-only</span>' : '') + '</h1>' +
      '<p class="c08-mgr-blurb">' + esc(pageObj ? (def.blurb || '') : (vm.blurb || def.blurb || '')) + '</p>';
    if (deferred) {
      var ic = obj(def.insertionContract);
      html += '<div class="c08-mgr-ownernote"><strong>Reserved destination.</strong> ' +
        esc(vm.summary || 'The owner module has not landed yet.') +
        '<br><strong>Owner:</strong> ' + esc(def.owner || 'named owner') +
        (ic.returnContract ? '<br><strong>Insertion contract:</strong> ' + esc(ic.returnContract) : '') + '</div>';
    }
    html += '</div></header>';

    if (!pageObj && !deferred) html += actionsRowHtml(def);

    if (pageObj) {
      if (v.managerId === 'm.providers') html += providerQuickActions(pageObj, v.objectId);
      var active = v.tab && pageObj.sections[v.tab] ? v.tab : pageObj.tabs[0];
      html += '<div class="c08-tabs" role="tablist">' + arr(pageObj.tabs).map(function (t) {
        return '<button type="button" class="c08-tab" role="tab" data-tab="' + esc(t) + '" aria-selected="' + (t === active ? 'true' : 'false') + '"' +
          ' data-act="go" data-go="' + esc(goHash({ route: 'manager', managerId: v.managerId, objectId: v.objectId, tab: t })) + '">' + esc(tabLabel(t)) + '</button>';
      }).join('') + '</div>';
      var sec = pageObj.sections[active];
      if (sec) html += sectionHtml(sec, v.managerId);
    } else {
      arr(vm.sections).forEach(function (sec) {
        html += sectionHtml(sec, v.managerId);
      });
      if (!arr(vm.sections).length) {
        html += '<div class="c08-empty" style="margin-top:24px"><strong>Nothing configured yet</strong>This manager has no content in the current state.</div>';
      }
    }
    html += '</div>';
    return html;
  }

  /* ------------------------------------------------------------------ */
  /* All Settings — faceted, virtualized                                 */
  /* ------------------------------------------------------------------ */

  var ALL_ROW_H = 58;
  var allFiltered = null;

  function allCompute() {
    var f = ui.all;
    var q = f.q.trim().toLowerCase();
    var out = [];
    arr(obj(window.PM2_INVENTORY).settings).forEach(function (s) {
      if (f.cat && s.cat !== f.cat) return;
      if (f.type && s.type !== f.type) return;
      if (f.tier && s.tier !== f.tier) return;
      var entry = store.values[s.id];
      if (f.changed && !(entry && entry.changedFromDefault)) return;
      if (q) {
        var hay = (s.label + ' ' + arr(s.search).join(' ') + ' ' + s.id).toLowerCase();
        if (hay.indexOf(q) < 0) return;
      }
      out.push({ id: s.id, stress: false });
    });
    if (f.state) {
      out = out.filter(function (x) {
        var row = store.resolveRow(x.id);
        return row && row.state === f.state;
      });
    }
    /* stress overlay records — clearly marked, never masquerading */
    var S = window.PM2.states;
    if (S && typeof S.stressActive === 'function' && S.stressActive() && !f.state) {
      arr(S.stressRecords()).forEach(function (r) {
        if (f.cat && r.cat !== f.cat) return;
        if (f.tier || f.type || f.changed) return;
        if (q) {
          var hay = (String(r.label) + ' ' + arr(r.search).join(' ')).toLowerCase();
          if (hay.indexOf(q) < 0) return;
        }
        out.push({ id: r.id, stress: true, rec: r });
      });
    }
    allFiltered = out;
    return out;
  }

  function facetBtn(act, label, current) {
    return '<button type="button" class="c08-select" data-act="' + act + '" aria-haspopup="menu">' +
      '<span class="c08-select-value">' + esc(label + (current ? ': ' + current : ': Any')) + '</span>' + ico('chevD') + '</button>';
  }

  function allHtml() {
    var list = allCompute();
    var f = ui.all;
    var stressOn = list.some(function (x) { return x.stress; });
    return '<div class="c08-measure">' +
      '<header class="c08-domain-head"><span class="c08-card-plate">' + ico('list') + '</span>' +
      '<div class="c08-domain-text"><h1 class="c08-domain-title">All Settings</h1>' +
      '<p class="c08-domain-desc">The complete long-tail index — every setting in this project, filterable and searchable. Browsing by area on the Home directory is usually friendlier; this is the exhaustive view.</p></div></header>' +
      '<div class="c08-all-facets">' +
        '<input class="c08-input" style="width:220px" type="text" placeholder="Filter by name…" value="' + esc(f.q) + '" data-act="all-q" aria-label="Filter settings">' +
        facetBtn('all-cat', 'Area', f.cat ? catTitle(f.cat) : '') +
        facetBtn('all-type', 'Type', f.type) +
        facetBtn('all-tier', 'Tier', f.tier) +
        facetBtn('all-state', 'State', f.state) +
        '<button type="button" class="c08-util" data-act="all-changed" aria-pressed="' + (f.changed ? 'true' : 'false') + '"' +
          (f.changed ? ' style="background:var(--accent-soft);color:var(--text-primary)"' : '') + '>' + ico('edit') + 'Changed only</button>' +
        '<span class="c08-all-count">' + list.length + (list.length === 1 ? ' setting' : ' settings') + (stressOn ? ' · includes stress fixtures' : '') + '</span>' +
      '</div>' +
      (list.length
        ? '<div class="c08-all-list" id="c08AllList"><div id="c08AllTop"></div><div id="c08AllRows"></div><div id="c08AllBot"></div></div>'
        : '<div class="c08-empty" style="margin-top:16px"><strong>No settings match those filters</strong>Loosen a filter, or clear the name filter, and the index fills back in.</div>') +
    '</div>';
  }

  function allRowHtml(x) {
    if (x.stress) {
      var r = x.rec;
      return '<button type="button" class="c08-all-row" data-act="stress-note">' +
        '<span class="c08-all-row-text"><span class="c08-all-row-label">' + esc(r.label) + '<span class="c08-stress-mark">Stress fixture</span></span>' +
        '<span class="c08-all-row-path">' + esc(catTitle(r.cat)) + ' · synthetic scale-test record</span></span>' +
      '</button>';
    }
    var row = store.resolveRow(x.id);
    if (!row) return '';
    var s = INV.byId[x.id];
    var chips = arr(row.chips).slice(0, 1).map(chipHtml).join('');
    var stateWord = row.state !== 'normal'
      ? '<span class="pm-status-word" data-tone="' + (row.state === 'error' ? 'attention' : (row.state === 'managed' ? 'muted' : 'setup')) + '">' + esc(row.state.replace(/-/g, ' ')) + '</span>' : '';
    return '<button type="button" class="c08-all-row" data-setting-id="' + esc(row.id) + '" data-act="go" data-go="' + esc(goHash({ route: 'setting', settingId: row.id })) + '">' +
      '<span class="c08-all-row-text"><span class="c08-all-row-label">' + esc(row.label) +
      (row.tier === 'advanced' ? '<span class="c08-result-kind">Advanced</span>' : '') + '</span>' +
      '<span class="c08-all-row-path">' + esc(catTitle(s.cat)) + ' / ' + esc(subTitle(s.cat, s.sub)) + '</span></span>' +
      '<span class="c08-all-row-side">' + stateWord + chips + '</span>' +
    '</button>';
  }

  var allScrollBound = false;
  function bindAllScroll() {
    if (allScrollBound || !stage) return;
    allScrollBound = true;
    var pending = false;
    stage.addEventListener('scroll', function () {
      if (ui.view.kind !== 'all' || pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        renderAllWindow();
      });
    }, { passive: true });
  }

  function renderAllWindow() {
    var listEl = document.getElementById('c08AllList');
    if (!listEl || !allFiltered) return;
    var top = document.getElementById('c08AllTop');
    var rowsEl = document.getElementById('c08AllRows');
    var bot = document.getElementById('c08AllBot');
    var total = allFiltered.length;
    var stageRect = stage.getBoundingClientRect();
    var listRect = listEl.getBoundingClientRect();
    var offset = (stageRect.top - listRect.top);
    var first = Math.max(0, Math.floor(offset / ALL_ROW_H) - 6);
    var count = Math.min(total - first, Math.ceil(stage.clientHeight / ALL_ROW_H) + 12);
    if (count < 0) count = 0;
    top.style.height = (first * ALL_ROW_H) + 'px';
    bot.style.height = (Math.max(0, total - first - count) * ALL_ROW_H) + 'px';
    var html = '';
    for (var i = first; i < first + count; i++) html += allRowHtml(allFiltered[i]);
    rowsEl.innerHTML = html;
    hydrate(rowsEl);
  }

  /* ------------------------------------------------------------------ */
  /* Copy Settings From Another Project — full-width flow                */
  /* ------------------------------------------------------------------ */

  function copyStepsHtml(step) {
    var steps = [
      { id: 'source', n: 1, label: 'Choose source' },
      { id: 'cats', n: 2, label: 'Pick categories' },
      { id: 'preview', n: 3, label: 'Review changes' },
      { id: 'receipt', n: 4, label: 'Apply & receipt' }
    ];
    var order = { source: 0, cats: 1, preview: 2, receipt: 3 };
    return '<div class="c08-copy-steps">' + steps.map(function (s, i) {
      var state = order[step] === i ? 'active' : (order[step] > i ? 'done' : 'todo');
      /* The connector is emitted INSIDE the cell of the step it leads into, so
         it can never be left behind at a wrap boundary; below 1000px the
         stylesheet drops connectors altogether (see .c08-copy-step-sep). */
      return '<span class="c08-copy-step-cell">' +
        (i ? '<span class="c08-copy-step-sep" aria-hidden="true">' + ico('chevR') + '</span>' : '') +
        '<span class="c08-copy-step" data-state="' + state + '"><span class="c08-step-n">' +
        (state === 'done' ? ico('check') : s.n) + '</span>' + esc(s.label) + '</span>' +
      '</span>';
    }).join('') + '</div>';
  }

  function copyHtml() {
    var c = ui.copy;
    var html = '<div class="c08-measure">' +
      '<header class="c08-domain-head"><span class="c08-card-plate">' + ico('copy') + '</span>' +
      '<div class="c08-domain-text"><h1 class="c08-domain-title">Copy settings from another project</h1>' +
      '<p class="c08-domain-desc">A one-time copy. Values come across once, with a restore point and a receipt — the two projects stay completely independent afterward. Nothing links, nothing syncs.</p></div></header>' +
      copyStepsHtml(c.step);

    if (c.step === 'source') {
      var sources = window.PM2.copy.sources();
      html += '<div class="c08-src-grid">' + sources.map(function (s) {
        var cats = arr(s.categorySummaries).map(function (x) { return x.title + ' ' + x.count; }).join(' · ');
        return '<button type="button" class="c08-src" aria-pressed="' + (c.sourceId === s.id ? 'true' : 'false') + '" data-act="copy-src" data-src="' + esc(s.id) + '">' +
          '<span class="c08-src-name">' + esc(s.name) + (s.legacy ? ' <span class="c08-item-flag">Legacy export</span>' : '') + '</span>' +
          '<span class="c08-src-when">Last updated ' + esc(fmtWhen(s.lastUpdated)) + '</span>' +
          '<span class="c08-src-cats">' + esc(cats) + '</span>' +
        '</button>';
      }).join('') + '</div>' +
      '<div class="c08-copy-bar"><span class="c08-copy-bar-note">Pick the project whose settings you want to bring here. Only its changed values come across — defaults stay defaults.</span>' +
        '<button type="button" class="c08-btn c08-btn-quiet" data-act="go" data-go="' + esc(goHash({ route: 'home' })) + '">Cancel</button>' +
        '<button type="button" class="c08-btn c08-btn-primary" data-act="copy-to-cats"' + (c.sourceId ? '' : ' disabled') + '>Continue</button></div>';
    } else if (c.step === 'cats') {
      var src = window.PM2.copy.sources().filter(function (s) { return s.id === c.sourceId; })[0];
      if (!src) { ui.copy.step = 'source'; return copyHtml(); }
      var picked = 0;
      var tiles = arr(src.categorySummaries).map(function (x) {
        var on = c.cats[x.cat] !== false;
        if (on) picked++;
        return '<button type="button" class="c08-cat-tile" aria-pressed="' + (on ? 'true' : 'false') + '" data-act="copy-cat" data-cat="' + esc(x.cat) + '">' +
          '<span class="c08-cat-tile-box">' + ico('check') + '</span>' +
          '<span class="c08-cat-tile-label">' + esc(x.title) + '</span>' +
          '<span class="c08-cat-tile-count">' + x.count + (x.count === 1 ? ' value' : ' values') + '</span>' +
        '</button>';
      }).join('');
      html += '<div class="c08-sect-head" style="margin-top:22px"><h2 class="c08-sect-title">What to copy from ' + esc(src.name) + '</h2>' +
        '<span class="c08-sect-sub">' + picked + ' of ' + src.categorySummaries.length + ' categories selected</span>' +
        '<button type="button" class="c08-detail-btn" data-act="copy-all-cats">Select all</button>' +
        '<button type="button" class="c08-detail-btn" data-act="copy-no-cats">Select none</button></div>' +
        '<div class="c08-cat-tiles">' + tiles + '</div>' +
        '<div class="c08-copy-bar"><span class="c08-copy-bar-note">Whole categories only at this step — the preview shows every individual value before anything applies.</span>' +
          '<button type="button" class="c08-btn c08-btn-quiet" data-pm2-back data-act="copy-back-src">Back</button>' +
          '<button type="button" class="c08-btn c08-btn-primary" data-act="copy-to-preview"' + (picked ? '' : ' disabled') + '>Preview changes</button></div>';
    } else if (c.step === 'preview') {
      var p = c.preview;
      if (!p) { ui.copy.step = 'cats'; return copyHtml(); }
      var counts = obj(p.counts);
      html += '<div class="c08-copy-summary">' +
        '<span class="c08-copy-pill"><strong>' + counts.add + '</strong><span>added</span></span>' +
        '<span class="c08-copy-pill"><strong>' + counts.replace + '</strong><span>replaced</span></span>' +
        '<span class="c08-copy-pill"><strong>' + counts.unchanged + '</strong><span>already match</span></span>' +
        '<span class="c08-copy-pill"><strong>' + counts.unavailable + '</strong><span>unavailable here</span></span>' +
        '<span class="c08-copy-pill"><strong>' + counts.conflict + '</strong><span>conflicts — kept yours</span></span>' +
      '</div>' +
      '<div class="c08-cred-note">' + ico('key') + '<span>' + esc(p.credentialNote) + '</span></div>' +
      '<div class="c08-tablewrap"><table class="c08-table"><thead><tr>' +
        '<th>Change</th><th>Setting</th><th>Currently here</th><th>From ' + esc(p.sourceName) + '</th><th>Note</th>' +
      '</tr></thead><tbody>' +
      arr(p.items).map(function (it) {
        return '<tr data-setting-id="' + esc(it.settingId) + '">' +
          '<td><span class="c08-kindword" data-kind="' + esc(it.kind) + '">' +
            ({ add: 'Add', replace: 'Replace', unchanged: 'Same', unavailable: 'Unavailable', conflict: 'Conflict' }[it.kind] || it.kind) + '</span></td>' +
          '<td><strong>' + esc(it.label) + '</strong><br><span style="color:var(--text-muted);font-size:var(--fs-2xs)">' + esc(catTitle(it.cat)) + '</span></td>' +
          '<td>' + esc(it.kind === 'add' ? '— (default)' : fmtVal(it.current)) + '</td>' +
          '<td>' + esc(fmtVal(it.incoming)) + '</td>' +
          '<td style="color:var(--text-secondary);font-size:var(--fs-xs)">' + esc(it.note || '') + '</td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>' +
      '<div class="c08-copy-bar"><span class="c08-copy-bar-note">' +
        'Applying creates restore point first, then writes ' + (counts.add + counts.replace) + ' value' + ((counts.add + counts.replace) === 1 ? '' : 's') + ' atomically and verifies each one. Unavailable and conflicting values are never applied.</span>' +
        '<button type="button" class="c08-btn c08-btn-quiet" data-pm2-back data-act="copy-back-cats">Back</button>' +
        '<button type="button" class="c08-btn c08-btn-primary" data-act="copy-apply"' + (c.busy ? ' disabled' : '') + '>' +
        (c.busy ? 'Applying…' : 'Create restore point & apply') + '</button></div>';
      if (c.failed) {
        html += '<div class="c08-banner" role="alert">' + ico('warning') + '<div class="c08-banner-text"><strong>Copy did not apply</strong><span>' + esc(c.failed) + '</span></div></div>';
      }
    } else if (c.step === 'receipt') {
      var r = obj(c.receipt);
      html += '<div class="c08-receipt"><h3>' + ico(c.rolledBack ? 'undo' : 'checkCircle') +
        (c.rolledBack ? 'Copy rolled back' : 'Settings copied and verified') + '</h3>' +
        (c.rolledBack
          ? '<p>All ' + r.applied + ' copied values were restored exactly from restore point ' + esc(r.restorePointId) + '. The receipt records both directions. The two projects remain independent.</p>'
          : '<p>' + r.applied + ' value' + (r.applied === 1 ? '' : 's') + ' from ' + esc(obj(c.preview).sourceName || 'the source project') +
            ' applied atomically and read back correctly. ' +
            obj(r.skipped).unchanged + ' already matched, ' + obj(r.skipped).unavailable + ' unavailable and ' + obj(r.skipped).conflict +
            ' conflicting value' + (obj(r.skipped).conflict === 1 ? '' : 's') + ' were left untouched. This was a one-time copy — future changes in the source will not follow.</p>') +
        '<div class="c08-receipt-meta"><span>Receipt ' + esc(r.receiptId || '') + '</span><span>Restore point ' + esc(r.restorePointId || '') + '</span></div>' +
        '<div class="c08-drop-links" style="margin-top:14px">' +
          (!c.rolledBack ? '<button type="button" class="c08-btn" data-act="copy-rollback">' + ico('undo') + 'Roll back this copy</button>' : '') +
          '<button type="button" class="c08-btn c08-btn-quiet" data-act="copy-restart">Copy from another project</button>' +
          '<button type="button" class="c08-btn c08-btn-quiet" data-act="go" data-go="' + esc(goHash({ route: 'home' })) + '">Back to Settings Home</button>' +
        '</div></div>';
    }
    html += '</div>';
    return html;
  }

  function copyDoPreview() {
    var cats = [];
    var src = window.PM2.copy.sources().filter(function (s) { return s.id === ui.copy.sourceId; })[0];
    if (!src) return;
    arr(src.categorySummaries).forEach(function (x) {
      if (ui.copy.cats[x.cat] !== false) cats.push(x.cat);
    });
    ui.copy.preview = window.PM2.copy.preview(ui.copy.sourceId, cats);
    ui.copy.failed = null;
    ui.copy.step = 'preview';
    render();
  }

  function copyDoApply() {
    if (!ui.copy.preview || ui.copy.busy) return;
    ui.copy.busy = true;
    ui.copy.failed = null;
    render();
    window.PM2.copy.apply(ui.copy.preview.token).then(function (res) {
      ui.copy.busy = false;
      var r = obj(res);
      if (r.ok) {
        ui.copy.receipt = r;
        ui.copy.rolledBack = false;
        ui.copy.step = 'receipt';
      } else {
        ui.copy.failed = r.error || 'The transaction did not apply. Nothing changed.';
      }
      if (ui.view.kind === 'copy') render();
    });
  }

  function copyDoRollback() {
    var r = obj(ui.copy.receipt);
    if (!r.receiptId) return;
    window.PM2.copy.rollback(r.receiptId).then(function (res) {
      if (obj(res).ok) ui.copy.rolledBack = true;
      if (ui.view.kind === 'copy') render();
    });
  }

  /* ------------------------------------------------------------------ */
  /* popup menus (PM family: layered, collision-flipped, Esc closes)     */
  /* ------------------------------------------------------------------ */

  function closeMenu(refocus) {
    if (!ui.menu) return;
    var m = ui.menu;
    ui.menu = null;
    if (m.el && m.el.parentNode) m.el.parentNode.removeChild(m.el);
    document.removeEventListener('mousedown', m.outside, true);
    if (refocus && m.anchor && m.anchor.focus) { try { m.anchor.focus(); } catch (e) { /* gone */ } }
  }

  function openMenu(anchor, items, current, onPick, multi) {
    closeMenu();
    var el = document.createElement('div');
    el.className = 'c08-menu';
    el.setAttribute('role', 'menu');
    el.innerHTML = items.map(function (it) {
      var isCur = multi ? arr(current).indexOf(it.value) >= 0 : it.value === current;
      return '<button type="button" class="c08-menu-item' + (isCur ? ' is-current' : '') + '" role="menuitem" data-val="' + esc(it.value) + '">' +
        ico('check') + '<span>' + esc(it.label) + '</span></button>';
    }).join('');
    document.body.appendChild(el);
    hydrate(el);
    var r = anchor.getBoundingClientRect();
    var mw = Math.min(320, Math.max(200, r.width));
    el.style.minWidth = mw + 'px';
    el.style.position = 'fixed';
    var mh = el.offsetHeight;
    var below = window.innerHeight - r.bottom;
    var topPos = (below < mh + 12 && r.top > mh + 12) ? (r.top - mh - 6) : (r.bottom + 6);
    el.style.top = Math.max(8, topPos) + 'px';
    el.style.left = Math.min(Math.max(8, r.left), window.innerWidth - mw - 12) + 'px';

    function outside(ev) {
      if (!el.contains(ev.target) && ev.target !== anchor) closeMenu();
    }
    document.addEventListener('mousedown', outside, true);
    ui.menu = { el: el, anchor: anchor, outside: outside, multi: !!multi, onPick: onPick };

    el.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.c08-menu-item');
      if (!btn) return;
      var v = btn.getAttribute('data-val');
      if (multi) {
        onPick(v);
        btn.classList.toggle('is-current');
      } else {
        closeMenu(true);
        onPick(v);
      }
    });
    el.addEventListener('keydown', function (ev) {
      var btns = Array.prototype.slice.call(el.querySelectorAll('.c08-menu-item'));
      var idx = btns.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown') { ev.preventDefault(); (btns[idx + 1] || btns[0]).focus(); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); (btns[idx - 1] || btns[btns.length - 1]).focus(); }
      else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); closeMenu(true); }
    });
    var first = el.querySelector('.is-current') || el.querySelector('.c08-menu-item');
    if (first) first.focus();
  }

  /* ------------------------------------------------------------------ */
  /* ops + toasts (truthful staged operations, simulated receipts)       */
  /* ------------------------------------------------------------------ */

  function renderOps() {
    if (!els.ops) return;
    var ids = Object.keys(ui.ops);
    if (!ids.length) { els.ops.innerHTML = ''; return; }
    els.ops.innerHTML = '<div class="c08-measure">' + ids.map(function (id) {
      var p = ui.ops[id];
      var det = p.progressKind === 'determinate';
      var pct = det && p.total ? Math.round((p.completed / p.total) * 100) : 0;
      var terminal = { done: 'Done', failed: 'Failed', degraded: 'Degraded', retryable: 'Retry available', canceled: 'Canceled', 'recovery-required': 'Recovery required' }[p.status];
      return '<div class="c08-op"><span class="c08-op-name">' + esc(p.name) + '</span>' +
        (p.ref ? '<span class="c08-op-phase">' + esc(p.ref) + '</span>' : '') +
        (p.phase && !terminal ? '<span class="c08-op-phase">' + esc(String(p.phase).replace(/-/g, ' ')) + '</span>' : '') +
        '<span class="c08-op-track"><span class="c08-op-fill' + (det ? '' : ' is-indet') + '"' + (det ? ' style="width:' + pct + '%"' : '') + '></span></span>' +
        '<span class="c08-op-status">' + esc(terminal || (p.status === 'queued' ? 'Queued' : (det ? p.completed + ' of ' + p.total : 'Working…'))) + '</span>' +
      '</div>';
    }).join('') + '</div>';
  }

  function onOp(p) {
    if (!p || !p.opId) return;
    ui.ops[p.opId] = p;
    renderOps();
    var terminal = { done: 1, failed: 1, degraded: 1, retryable: 1, canceled: 1, 'recovery-required': 1 };
    if (terminal[p.status]) {
      setTimeout(function () {
        delete ui.ops[p.opId];
        renderOps();
      }, 1800);
    }
  }

  var toastSeq = 0;
  function toast(message) {
    if (!els.toasts) return;
    var id = 'c08t' + (++toastSeq);
    var el = document.createElement('div');
    el.className = 'c08-toast';
    el.id = id;
    el.textContent = String(message);
    els.toasts.appendChild(el);
    while (els.toasts.children.length > 3) els.toasts.removeChild(els.toasts.firstChild);
    setTimeout(function () { el.classList.add('is-fading'); }, 3200);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 4000);
  }

  /* ------------------------------------------------------------------ */
  /* actions dispatch (event delegation on the stage)                    */
  /* ------------------------------------------------------------------ */

  function runManagerAction(actid) {
    var def = window.PM2.managers.get(ui.view.managerId);
    if (!def) return;
    var acts = [];
    try { acts = arr(def.actions(store)); } catch (e) { return; }
    var act = acts.filter(function (a) { return a.id === actid; })[0];
    if (!act) return;
    var r = null;
    try { r = act.run(store); } catch (e) { toast('The action failed to start.'); return; }
    Promise.resolve(r).then(function () {
      if (ui.view.kind === 'manager') { window.PM2.managers.invalidate(ui.view.managerId); render(); }
    });
  }

  function runTrigger(name, ref) {
    var S = window.PM2.states;
    if (!S || typeof S.trigger !== 'function') return;
    var r = null;
    try { r = S.trigger(name, ref || null); } catch (e) { r = null; }
    Promise.resolve(r).then(function () {
      if (ui.view.kind === 'manager') { window.PM2.managers.invalidate(ui.view.managerId); render(); }
    });
  }

  var INSTALL_TRIGGER = { select: 'install-select', update: 'install-update', rollback: 'install-repair', repair: 'install-repair' };

  function runItemAction(itemId, actId) {
    if (actId === 'details') {
      var key = ui.view.managerId + '/' + itemId;
      ui.itemDetails[key] = !ui.itemDetails[key];
      render();
      return;
    }
    var trig = INSTALL_TRIGGER[actId];
    var ref = itemId.indexOf('inst.') === 0 ? itemId : itemId;
    if (trig) { runTrigger(trig, ref); return; }
    if (actId === 'verify') {
      window.PM2.states.receipt('Verify checklist', 'The full verify checklist runs against ' + itemId + ' — command resolution, version echo, a no-op invocation, and sign-in state. Results land in Activity.');
      return;
    }
    window.PM2.states.receipt(actId, 'This control records the intent honestly; its owner flow performs the real work.');
  }

  function onAct(act, btn, ev) {
    var id = btn.getAttribute('data-id');
    switch (act) {
      case 'go': {
        var h = btn.getAttribute('data-go');
        if (h) window.PM2.route.go(h);
        break;
      }
      case 'back': break; /* handled by data-go on the same button */
      case 'close-settings':
        window.PM2.states.receipt('Close Settings', 'Returns to the Dashboard — the surface that opened Settings. In the real app this restores the previous workspace exactly.');
        break;
      case 'toggle-recents':
        ui.recentsOpen = !ui.recentsOpen;
        render();
        break;
      case 'toggle-adv': {
        var key = btn.getAttribute('data-key');
        ui.advOpen[key] = !ui.advOpen[key];
        render();
        break;
      }
      case 'toggle-sect': {
        var k2 = btn.getAttribute('data-key');
        ui.sectOpen[k2] = !ui.sectOpen[k2];
        render();
        break;
      }
      case 'row-details':
        ui.rowDetails[id] = !ui.rowDetails[id];
        render();
        break;
      case 'item-details': {
        var k3 = btn.getAttribute('data-key');
        ui.itemDetails[k3] = !ui.itemDetails[k3];
        render();
        break;
      }
      case 'toggle': {
        var cur = store.getValue(id);
        store.setValue(id, !(cur === true || cur === 'on'));
        break;
      }
      case 'menu': {
        var row = store.resolveRow(id);
        if (!row) break;
        var opts = arr(row.control.options).map(function (o) { return { value: o, label: o }; });
        if (!opts.length) break;
        openMenu(btn, opts, row.value, function (v) { store.setValue(id, v); });
        break;
      }
      case 'multi': {
        var row2 = store.resolveRow(id);
        if (!row2) break;
        var opts2 = arr(row2.control.options).map(function (o) { return { value: o, label: o }; });
        openMenu(btn, opts2, arr(row2.value), function (v) {
          var cur2 = arr(store.getValue(id)).slice();
          var ix = cur2.indexOf(v);
          if (ix >= 0) cur2.splice(ix, 1); else cur2.push(v);
          store.setValue(id, cur2);
        }, true);
        break;
      }
      case 'row-action': {
        var row3 = store.resolveRow(id);
        window.PM2.states.receipt(row3 ? row3.label : 'Action',
          'Simulated: this button runs its owner flow in the real app. Nothing was changed here.');
        break;
      }
      case 'mgr-action':
        runManagerAction(btn.getAttribute('data-actid'));
        break;
      case 'trigger':
        runTrigger(btn.getAttribute('data-trigger'), btn.getAttribute('data-ref'));
        break;
      case 'item-action':
        runItemAction(btn.getAttribute('data-item'), btn.getAttribute('data-item-act'));
        break;
      case 'host-pick':
        ui.hostPick[btn.getAttribute('data-obj')] = btn.getAttribute('data-host');
        render();
        break;
      case 'stress-note':
        toast('Stress fixture — a synthetic scale-test record from the stress overlay, not a real setting.');
        break;
      case 'all-changed':
        ui.all.changed = !ui.all.changed;
        render();
        break;
      case 'all-cat':
        openMenu(btn, [{ value: '', label: 'Any area' }].concat(INV.cats.map(function (c) { return { value: c.id, label: c.title }; })),
          ui.all.cat, function (v) { ui.all.cat = v; render(); });
        break;
      case 'all-type':
        openMenu(btn, [{ value: '', label: 'Any type' }].concat(['toggle', 'select', 'number', 'slider', 'text', 'path', 'list', 'multiselect', 'keyvalue', 'radio', 'action'].map(function (t) { return { value: t, label: t }; })),
          ui.all.type, function (v) { ui.all.type = v; render(); });
        break;
      case 'all-tier':
        openMenu(btn, [{ value: '', label: 'Any tier' }, { value: 'simple', label: 'Everyday' }, { value: 'advanced', label: 'Advanced' }],
          ui.all.tier, function (v) { ui.all.tier = v; render(); });
        break;
      case 'all-state':
        openMenu(btn, [{ value: '', label: 'Any state' }, { value: 'managed', label: 'Managed' }, { value: 'unavailable', label: 'Unavailable' },
          { value: 'restart-required', label: 'Restart required' }, { value: 'reconnect-required', label: 'Reconnect required' },
          { value: 'changed-elsewhere', label: 'Changed elsewhere' }, { value: 'error', label: 'Error' }],
          ui.all.state, function (v) { ui.all.state = v; render(); });
        break;
      case 'copy-src':
        ui.copy.sourceId = btn.getAttribute('data-src');
        ui.copy.cats = {};
        render();
        break;
      case 'copy-to-cats':
        if (ui.copy.sourceId) { ui.copy.step = 'cats'; render(); }
        break;
      case 'copy-back-src':
        ui.copy.step = 'source';
        render();
        break;
      case 'copy-cat': {
        var cat = btn.getAttribute('data-cat');
        ui.copy.cats[cat] = ui.copy.cats[cat] === false;
        render();
        break;
      }
      case 'copy-all-cats':
        ui.copy.cats = {};
        render();
        break;
      case 'copy-no-cats': {
        var src = window.PM2.copy.sources().filter(function (s) { return s.id === ui.copy.sourceId; })[0];
        if (src) arr(src.categorySummaries).forEach(function (x) { ui.copy.cats[x.cat] = false; });
        render();
        break;
      }
      case 'copy-to-preview':
        copyDoPreview();
        break;
      case 'copy-back-cats':
        ui.copy.step = 'cats';
        render();
        break;
      case 'copy-apply':
        copyDoApply();
        break;
      case 'copy-rollback':
        copyDoRollback();
        break;
      case 'copy-restart':
        ui.copy = { step: 'source', sourceId: null, cats: {}, preview: null, receipt: null, busy: false, failed: null, rolledBack: false };
        render();
        break;
      case 'result':
        chooseResult(btn.getAttribute('data-rid'));
        break;
      default: break;
    }
    void ev;
  }

  /* ------------------------------------------------------------------ */
  /* events                                                              */
  /* ------------------------------------------------------------------ */

  function bindEvents() {
    els.root.addEventListener('click', function (ev) {
      var a = ev.target.closest('a[href^="#/"]');
      if (a) {
        ev.preventDefault();
        window.PM2.route.go(a.getAttribute('href'));
        return;
      }
      var btn = ev.target.closest('[data-act]');
      if (!btn || !els.root.contains(btn)) return;
      /* nested [data-act]: prefer the innermost */
      onAct(btn.getAttribute('data-act'), btn, ev);
    });

    els.root.addEventListener('keydown', function (ev) {
      var t = ev.target;
      /* Enter/Space activates role=link stat cards and rows */
      if ((ev.key === 'Enter' || ev.key === ' ') && t.getAttribute && t.getAttribute('role') === 'link' && t.getAttribute('data-go')) {
        ev.preventDefault();
        window.PM2.route.go(t.getAttribute('data-go'));
        return;
      }
      if (t.classList && t.classList.contains('c08-search-input')) {
        handleSearchKeys(ev, t);
        return;
      }
      if (ev.key === 'Enter' && t.getAttribute) {
        var act = t.getAttribute('data-act');
        if (act === 'num') applyNumber(t);
        else if (act === 'text') applyText(t);
        else if (act === 'all-q') { ui.all.q = t.value; render(); }
      }
    });

    els.root.addEventListener('input', function (ev) {
      var t = ev.target;
      if (t.classList && t.classList.contains('c08-search-input')) {
        onSearchInput(t.value);
        return;
      }
      var act = t.getAttribute ? t.getAttribute('data-act') : null;
      if (act === 'all-q') debouncedAllQ(t.value);
    });

    els.root.addEventListener('change', function (ev) {
      var t = ev.target;
      var act = t.getAttribute ? t.getAttribute('data-act') : null;
      if (act === 'num') applyNumber(t);
      else if (act === 'text') applyText(t);
      else if (act === 'range') {
        var v = Number(t.value);
        store.setValue(t.getAttribute('data-id'), v);
      }
    });

    /* focusout closes the dropdown politely (unless focus moved inside).
       The wait exists so a click that lands INSIDE the dropdown is not treated
       as leaving it — but the timer must never outlive the surface it was
       scheduled on. Picking a result moves focus out AND navigates, and Back
       can re-open the search surface within the wait; a stale timer then closed
       the freshly restored dropdown (the intermittent
       route-*-back-restores failure). It is now cancellable, cancelled by
       cancelSearchBlur() on every navigation, and refuses to act on a wrap that
       is no longer the live one. */
    els.root.addEventListener('focusout', function (ev) {
      var wrap = ev.target.closest ? ev.target.closest('.c08-search-wrap') : null;
      if (!wrap) return;
      cancelSearchBlur();
      ui.searchBlurTimer = setTimeout(function () {
        ui.searchBlurTimer = 0;
        if (!document.contains(wrap)) return;          /* re-rendered since */
        if (wrap !== activeSearchWrap()) return;       /* not the live wrap */
        var active = document.activeElement;
        if (ui.search.open && !wrap.contains(active)) {
          ui.search.open = false;
          renderDrop();
        }
      }, 120);
    });

    document.addEventListener('keydown', function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && String(ev.key).toLowerCase() === 'k') {
        ev.preventDefault();
        focusSearch();
        return;
      }
      if (ev.key === 'Escape') handleEscape(ev);
    });
  }

  var debouncedAllQ = null;

  function applyNumber(input) {
    var id = input.getAttribute('data-id');
    var raw = input.value;
    var v = raw === '' ? NaN : Number(raw);
    var res = store.setValue(id, isNaN(v) ? raw : v);
    if (!res.ok) showFieldError(input, res.error);
  }
  function applyText(input) {
    var id = input.getAttribute('data-id');
    var res = store.setValue(id, input.value);
    if (!res.ok) showFieldError(input, res.error);
  }
  function showFieldError(input, message) {
    var side = input.closest('.c08-row-side');
    if (!side) { toast(message); return; }
    var old = side.querySelector('.c08-field-error');
    if (old) old.remove();
    var span = document.createElement('span');
    span.className = 'c08-field-error';
    span.setAttribute('role', 'alert');
    span.textContent = message;
    side.appendChild(span);
  }

  function focusSearch() {
    var wrap = activeSearchWrap();
    if (!wrap) {
      nav({ route: 'home' });
      window.requestAnimationFrame(function () {
        var w2 = activeSearchWrap();
        var i2 = w2 && w2.querySelector('.c08-search-input');
        if (i2) i2.focus();
      });
      return;
    }
    var input = wrap.querySelector('.c08-search-input');
    if (input) { input.focus(); input.select(); }
  }

  function onSearchInput(value) {
    ui.search.query = value;
    if (!value) {
      ui.search.open = false;
      ui.search.res = null;
      renderDrop();
      return;
    }
    runSearch(value);
    ui.search.open = true;
    renderDrop();
    syncSearchRoute();
  }

  function handleSearchKeys(ev, input) {
    var flat = flatResults();
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      if (!ui.search.open && ui.search.query) { ui.search.open = true; runSearch(ui.search.query); }
      ui.search.hot = Math.min(flat.length - 1, ui.search.hot + 1);
      renderDrop();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      ui.search.hot = Math.max(0, ui.search.hot - 1);
      renderDrop();
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      var pick = flat[ui.search.hot >= 0 ? ui.search.hot : 0];
      if (pick) chooseResult(pick.rid);
    } else if (ev.key === 'Escape') {
      if (ui.search.open) {
        ev.preventDefault();
        ev.stopPropagation();
        ui.search.open = false;
        renderDrop();
      } else if (input.value) {
        ev.preventDefault();
        ev.stopPropagation();
        input.value = '';
        ui.search.query = '';
      }
    }
  }

  function handleEscape(ev) {
    if (ui.menu) { closeMenu(true); ev.preventDefault(); return; }
    if (ui.search.open) { ui.search.open = false; renderDrop(); ev.preventDefault(); return; }
    var v = ui.view;
    if (v.kind === 'home') return;
    var parent = parentOf(v);
    if (parent) {
      ev.preventDefault();
      nav(parent.dest);
    }
  }

  /* ------------------------------------------------------------------ */
  /* store subscriptions                                                 */
  /* ------------------------------------------------------------------ */

  function subscribe() {
    var rerender = debounce(function () {
      if (ui.view.kind === 'all') allFiltered = null;
      render();
    }, 40);
    store.on('value', function () { rerender(); });
    store.on('scenario', function () { rerender(); });
    store.on('fixtures', function () { rerender(); });
    store.on('stress', function () { rerender(); });
    store.on('copy', function () { if (ui.view.kind === 'copy') rerender(); });
    store.on('change', function (p) {
      if (p && (p.key === 'scenario' || p.key === 'fixtures' || p.key === 'stress')) rerender();
    });
    store.on('op', onOp);
    store.on('receipt', function (r) { if (r && r.message) toast(r.message); });
    store.on('value-error', function () { /* inline errors are shown at the control */ });
    store.on('provider', function () {
      if (ui.view.kind === 'manager' && ui.view.managerId === 'm.providers') {
        window.PM2.managers.invalidate('m.providers');
        rerender();
      }
    });
    store.on('mcp', function () {
      if (ui.view.kind === 'manager' && ui.view.managerId === 'm.mcp') {
        window.PM2.managers.invalidate('m.mcp');
        rerender();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* boot                                                                */
  /* ------------------------------------------------------------------ */

  function boot() {
    stage = document.getElementById('pmStage');
    if (!stage) return;

    window.PMShell.init({ concept: CONCEPT });
    store = window.PM2.store.init(CONCEPT);
    buildInvIndex();
    debouncedAllQ = debounce(function (v) { ui.all.q = v; render(); }, 180);

    stage.innerHTML =
      '<div class="c08-root" id="c08Root">' +
        '<div class="c08-bar" id="c08Bar" hidden></div>' +
        '<div class="c08-page" id="c08Page"></div>' +
        '<div class="c08-ops" id="c08Ops" aria-live="polite"></div>' +
      '</div>' +
      '<div class="c08-toasts" id="c08Toasts" aria-live="polite"></div>';
    els.root = document.getElementById('c08Root');
    els.bar = document.getElementById('c08Bar');
    els.page = document.getElementById('c08Page');
    els.ops = document.getElementById('c08Ops');
    els.toasts = document.getElementById('c08Toasts');
    /* Toasts are position:fixed and centred on the viewport. The stage now
       carries a mask (the States-dot safe band, see the concept CSS) and a
       masked element becomes the containing block for fixed descendants, so
       the host has to live outside it or the toasts would shift up-right and
       fade at the scroll edge. Re-parenting is visually a no-op otherwise. */
    document.body.appendChild(els.toasts);

    bindEvents();
    subscribe();
    try { window.PM2.states.mountDrawer(store); } catch (e) { /* drawer optional */ }

    window.PM2.route.bind({ open: openDest });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
