/* concept-10-command-suite.js — fable · 10 Conductor
   A keyboard-first command workspace over the shared PM2 world:
   - persistent numbered command index (the 12 categories + utilities);
   - multi-pane left-to-right drill-down: index → category → rows/manager
     → inline editor beneath its context row (never a modal);
   - persistent path bar + status strip so location is always explicit;
   - compact legible data tables; honest status words;
   - universal search with a dropdown anchored beneath the field;
   - transactional copy flow as four advancing panels;
   - virtualized All Settings compendium.
   RETHEME: no terminal skin anywhere. PM theme tokens, proportional type,
   human product language. Mono only inside technical detail drawers.
   Slint notes inline. No emoji. */
(function () {
  'use strict';

  var store = null;
  var stage = null;
  var root = null;      /* .c10 */
  var elTop = null, elBody = null, elFoot = null;

  var INV = window.PM2_INVENTORY || { categories: [], settings: [] };

  /* ============================ ui state ============================
     One explicit state machine: view (route projection) + surface state.
     Slint: a struct on a state bus; render() is a pure projection of it. */
  var ui = {
    view: { kind: 'home' },   /* home | dest | manager | all | copy  (+query, settingId) */
    mode: 3,                  /* 1 = one pane, 2 = index + one, 3 = full strip */
    editorOpen: null,         /* settingId whose editor is open beneath its row */
    editorErr: null,          /* {id, msg} last inline validation failure */
    detailOpen: {},           /* editor detail drawers: settingId -> true */
    advOpen: {},              /* cat/sub -> advanced tier disclosed */
    morePages: {},            /* listKey -> extra pages materialized */
    roOpen: {},               /* managerId:itemId -> roster detail open */
    secOpen: {},              /* managerId:secId -> advanced section open */
    setupHost: {},            /* providerId -> chosen host index */
    scroll: {},               /* paneKey -> scrollTop (restored on render) */
    pendingFocus: null,       /* focus=<rid|id> waiting for landing */
    search: { q: '', open: false, res: null, cursor: 0, anchor: null },
    all: { q: '', cat: '', type: '', tier: '', state: '', changed: false },
    allIndex: null,           /* cached long-tail index rows */
    allFiltered: null,
    copy: { stage: 0, sourceId: null, cats: {}, preview: null, confirm: '',
            applying: false, op: null, receipt: null, error: null,
            inspect: {}, kindFilter: null },
    ops: [],                  /* bounded recent op payloads (newest first) */
    lastStatus: null,         /* footer status line text */
    renderQueued: false
  };

  /* ============================ helpers ============================ */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function ico(name) { return '<i data-ico="' + name + '"></i>'; }

  /* Vendor-prefixed model slugs are the one inventory value the shared
     formatter leaves raw ("anthropic/claude-opus-4"), while Recent changes
     and the compendium show the human name. Humanize every surface; the raw
     string stays available in the row's Details drawer. */
  var MODEL_NAMES = {
    'anthropic/claude-sonnet-4': 'Claude Sonnet 4',
    'anthropic/claude-opus-4': 'Claude Opus 4',
    'openai/gpt-5': 'GPT-5',
    'gemini/gemini-2.5-pro': 'Gemini 2.5 Pro'
  };
  /* Control kinds. The inventory stores widget enums ('select', 'toggle',
     'keyvalue', 'multiselect'); those are implementation words, not names a
     settings user has for anything. Audit 2026-08-21 round-4 finding 6: the
     All Settings TYPE column printed them raw down every row while the very
     next cell in the same row humanised the tier enum ('everyday' /
     'advanced') — one standard applied twice, inconsistently. All Settings is
     a first-class destination in the command index (828 records) with plain
     user prose in its header, not an intentionally-technical drawer, so the
     packet's drawer exception does not cover it. The column and its own facet
     filter now read the human name (the filter's option VALUES stay the raw
     enum, so nothing about the filtering changes), and the raw enum stays
     available where the packet does allow it: the row's Details drawer. */
  var TYPE_LABELS = {
    toggle: 'Toggle', select: 'Dropdown', radio: 'Radio choice', number: 'Number',
    slider: 'Slider', text: 'Text', path: 'File path', list: 'List',
    multiselect: 'Multi-select', keyvalue: 'Key/value pairs', action: 'Action'
  };
  function typeLabel(t) { return TYPE_LABELS[t] || String(t == null ? '' : t); }

  var ACRONYMS = { gpt: 'GPT', ai: 'AI', api: 'API', gpu: 'GPU', cpu: 'CPU', llm: 'LLM' };
  function humanValue(v) {
    var s = String(v == null ? '' : v);
    if (MODEL_NAMES[s]) return MODEL_NAMES[s];
    if (s.indexOf('/') === -1 || /\s/.test(s)) return s;
    var tail = s.slice(s.lastIndexOf('/') + 1);
    if (!/^[a-z0-9][a-z0-9.\-_]*$/.test(tail)) return s;
    return tail.split(/[-_]+/).map(function (w) {
      if (ACRONYMS[w]) return ACRONYMS[w];
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function obj(x) { return (x && typeof x === 'object' && !Array.isArray(x)) ? x : {}; }
  function U() { return window.PM2.util || {}; }
  function fmtAgo(w) { return (U().fmtAgo ? U().fmtAgo(w) : String(w || '')); }
  function fmtInt(n) { return (U().fmtInt ? U().fmtInt(n) : String(n)); }

  function reducedMotion() {
    var de = document.documentElement;
    if (de.getAttribute('data-motion') === 'reduced') return true;
    if (de.getAttribute('data-reduced-motion') === '1') return true;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  function scenario() { return String(store.get('scenario') || 'baseline'); }
  function hasFx(id) {
    var fx = store.get('fixtures');
    return Array.isArray(fx) && fx.indexOf(id) >= 0;
  }

  var catById = {};
  var subTitleIx = {};
  var settingIx = {};
  arr(INV.categories).forEach(function (c) {
    catById[c.id] = c;
    var m = {};
    arr(c.subgroups).forEach(function (g) { m[g.id] = g; });
    subTitleIx[c.id] = m;
  });
  arr(INV.settings).forEach(function (s) { settingIx[s.id] = s; });

  function catTitle(id) { return catById[id] ? catById[id].title : 'Settings'; }
  function catIcon(id) { return catById[id] ? (catById[id].icon || 'gear') : 'gear'; }
  function subTitle(cat, sub) {
    var g = (subTitleIx[cat] || {})[sub];
    return g ? g.title : (sub || '');
  }
  function subDesc(cat, sub) {
    var g = (subTitleIx[cat] || {})[sub];
    return g ? (g.desc || '') : '';
  }

  function managers() { return window.PM2.managers; }
  function mgrDef(id) { return managers() && managers().get ? managers().get(id) : null; }

  /* data-go plumbing: destinations ride encoded in the attribute so one
     delegated click handler routes everything by dest object, never by
     position or label. */
  function goAttr(dest, params) {
    var payload = { d: dest };
    if (params) payload.p = params;
    return ' data-go="' + encodeURIComponent(JSON.stringify(payload)) + '"';
  }

  function navDest(dest, params) {
    var d = obj(dest);
    var p = obj(params);
    var kind = String(d.route || d.kind || 'home');
    var target = { kind: kind };
    if (kind === 'dest') { target.cat = d.cat || null; target.sub = d.sub || null; }
    else if (kind === 'manager') {
      target.managerId = d.managerId || null;
      target.objectId = d.objectId || null;
      target.tab = d.tab || null;
    }
    else if (kind === 'setting') { target.settingId = d.settingId || null; }
    else if (kind === 'search') { target.query = d.query || ''; }
    var routeParams = {};
    if (d.sectionId && !p.focus) routeParams.focus = d.sectionId;
    if (p.focus) routeParams.focus = p.focus;
    window.PM2.route.go(target, { params: routeParams });
  }

  /* ============================ open (router) ============================ */

  function open(dest) {
    var d = obj(dest);
    var kind = String(d.route || 'home');
    closeSearchDrop();
    ui.editorErr = null;
    ui.pendingFocus = d.focus || null;

    if (kind === 'setting' && d.settingId) {
      var rec = settingIx[d.settingId];
      if (rec) {
        ui.view = { kind: 'dest', cat: rec.cat, sub: rec.sub, settingId: d.settingId };
        ui.editorOpen = d.settingId;
      } else {
        /* stress/synthetic or unknown id: honest fallback to All Settings */
        ui.view = { kind: 'all', missing: d.settingId };
        ui.editorOpen = null;
      }
    } else if (kind === 'dest') {
      ui.view = { kind: 'dest', cat: d.cat || arr(INV.categories)[0].id, sub: d.sub || null };
      if (!catById[ui.view.cat]) ui.view = { kind: 'home' };
      ui.editorOpen = null;
    } else if (kind === 'manager') {
      var def = mgrDef(d.managerId);
      if (def) {
        ui.view = { kind: 'manager', managerId: d.managerId, objectId: d.objectId || null, tab: d.tab || null };
      } else {
        ui.view = { kind: 'home' };
      }
      ui.editorOpen = null;
    } else if (kind === 'all') {
      ui.view = { kind: 'all' };
      ui.editorOpen = null;
    } else if (kind === 'copy') {
      ui.view = { kind: 'copy' };
      ui.editorOpen = null;
    } else if (kind === 'search') {
      ui.view = { kind: 'home', query: String(d.query || '') };
      ui.editorOpen = null;
    } else {
      ui.view = { kind: 'home' };
      ui.editorOpen = null;
    }

    render();
    landing();
    return null;
  }

  /* Landing: scroll the exact target into view, focus it, mark it with the
     calm pm2-located treatment. Runs after render. */
  function landing() {
    var target = null;
    if (ui.view.settingId) {
      ensureRowVisible(ui.view.settingId);
      target = root.querySelector('[data-setting-id="' + cssEsc(ui.view.settingId) + '"]');
    }
    var f = ui.pendingFocus;
    if (f) {
      if (f.indexOf(':') > 0 && window.PM2.search && window.PM2.search.resolveRid) {
        var r = window.PM2.search.resolveRid(f);
        if (r && r.dest) {
          if (r.dest.settingId) {
            ensureRowVisible(r.dest.settingId);
            target = root.querySelector('[data-setting-id="' + cssEsc(r.dest.settingId) + '"]') || target;
          } else if (r.dest.sectionId) { f = r.dest.sectionId; }
        }
      }
      if (!target) {
        target = root.querySelector('.c10-mgr-main [data-object-id="' + cssEsc(f) + '"]') ||
                 root.querySelector('[data-object-id="' + cssEsc(f) + '"]') ||
                 root.querySelector('[data-section="' + cssEsc(f) + '"]') ||
                 root.querySelector('[data-setting-id="' + cssEsc(f) + '"]');
      }
    }
    /* Fallback anchors: the exact landing target of a deep link is the
       deepest surface the dest names (object page, tab section, manager
       headline, or the content pane title). */
    if (!target && ui.view.kind === 'manager') {
      var isObjectPage = !!root.querySelector('.c10-mgr-main .c10-tabs');
      if (ui.view.objectId && !isObjectPage) {
        target = root.querySelector('.c10-mgr-main [data-object-id="' + cssEsc(ui.view.objectId) + '"]') ||
                 root.querySelector('[data-object-id="' + cssEsc(ui.view.objectId) + '"]');
      }
      if (!target && ui.view.tab) target = root.querySelector('.c10-mgr-main [data-section]');
      if (!target && (ui.pendingFocus || ui.view.objectId)) target = root.querySelector('.c10-mgr-h1');
    } else if (!target && ui.pendingFocus && ui.view.kind !== 'home') {
      var panes = root.querySelectorAll('.c10-pane:not(.c10-pane-index) .c10-pane-title');
      if (panes.length) target = panes[panes.length - 1];
    }
    if (target) locate(target);
    if (ui.view.query != null) {
      /* #/search/<q>: restore the query AND its result list */
      var input = bigSearchInput() || miniSearchInput();
      if (input) {
        input.value = ui.view.query;
        runSearch(ui.view.query, input === bigSearchInput() ? 'big' : 'mini', true);
        try { input.focus(); } catch (e) { /* focus best-effort */ }
      }
    }
  }

  function cssEsc(s) {
    if (window.CSS && CSS.escape) return CSS.escape(String(s));
    return String(s).replace(/["\\#.:>~[\]()]/g, '\\$&');
  }

  var locateTimer = null;
  function locate(el) {
    var prev = root.querySelector('.pm2-located');
    if (prev) prev.classList.remove('pm2-located');
    if (locateTimer) { clearTimeout(locateTimer); locateTimer = null; }
    el.classList.add('pm2-located');
    try { el.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' }); }
    catch (e) { try { el.scrollIntoView(); } catch (e2) { /* ok */ } }
    if (!el.hasAttribute('tabindex') && el.tabIndex < 0) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (e3) { /* ok */ }
    locateTimer = setTimeout(function () {
      el.classList.remove('pm2-located');
      locateTimer = null;
    }, 2400);
  }

  /* Make sure a row renders: disclose its advanced group / extra pages. */
  function ensureRowVisible(settingId) {
    var rec = settingIx[settingId];
    if (!rec) return;
    var key = rec.cat + '/' + rec.sub;
    if (rec.tier !== 'simple' && !rec.curated) {
      if (!ui.advOpen[key]) { ui.advOpen[key] = true; }
    }
    /* raise paging until the row is inside the materialized window */
    var guard = 0;
    while (guard < 20) {
      guard += 1;
      render();
      if (root.querySelector('[data-setting-id="' + cssEsc(settingId) + '"]')) return;
      ui.morePages[key + '/simple'] = (ui.morePages[key + '/simple'] || 0) + 1;
      ui.morePages[key + '/adv'] = (ui.morePages[key + '/adv'] || 0) + 1;
    }
  }

  /* ============================ retreat / escape ============================ */

  function paneParentName() {
    var v = ui.view;
    if (v.kind === 'dest' && (v.sub || v.settingId)) return catTitle(v.cat);
    if (v.kind === 'dest') return 'Settings Home';
    if (v.kind === 'manager') {
      var def = mgrDef(v.managerId);
      if (v.objectId) return def ? def.title : 'Manager';
      return def ? catTitle(def.cat) : 'Settings Home';
    }
    return 'Settings Home';
  }

  function retreat() {
    var v = ui.view;
    if (ui.search.open) { closeSearchDrop(); return; }
    if (v.kind === 'dest' && ui.editorOpen) {
      window.PM2.route.go({ kind: 'dest', cat: v.cat, sub: v.sub });
      return;
    }
    if (v.kind === 'dest' && v.sub) { window.PM2.route.go({ kind: 'dest', cat: v.cat }); return; }
    if (v.kind === 'dest') { window.PM2.route.go({ kind: 'home' }); return; }
    if (v.kind === 'manager' && (v.objectId || v.tab)) {
      window.PM2.route.go({ kind: 'manager', managerId: v.managerId });
      return;
    }
    if (v.kind === 'manager') {
      var def = mgrDef(v.managerId);
      window.PM2.route.go(def ? { kind: 'dest', cat: def.cat } : { kind: 'home' });
      return;
    }
    if (v.kind === 'all' || v.kind === 'copy') { window.PM2.route.go({ kind: 'home' }); return; }
    /* home: the ladder stops here */
  }

  function escapeLadder() {
    if (ui.search.open) { closeSearchDrop(); return; }
    if (ui.editorOpen) { retreat(); return; }
    var openDetail = root.querySelector('.c10-ro-detail');
    if (openDetail) {
      /* close the most recent roster detail drawer */
      var keys = Object.keys(ui.roOpen);
      if (keys.length) { delete ui.roOpen[keys[keys.length - 1]]; render(); return; }
    }
    retreat();
  }

  /* ============================ render root ============================ */

  function computeMode() {
    var w = stage ? stage.clientWidth : 1280;
    if (w < 900) return 1;
    if (w < 1150) return 2;
    return 3;
  }

  /* The whole width vocabulary of the root element, as one string.
     is-tight: the top bar has to carry Back + crumbs + search + project +
     Close in one row. Below ~1400px of stage the Back control drops to its
     short label so the breadcrumb trail stays whole in every theme face.
     is-wide / is-ultra: above ~1560 and ~2000 of stage the three-pane strip
     stops being able to spend the extra width, and a fixed content column
     centred in a 2000px pane is a desert with a rail pinned to its left. At
     these two steps the panes widen, the content columns widen with them, and
     Home / the domain overview recompose into two columns so the width
     carries content instead of emptiness.
     Audit 2026-08-21 round-4 findings 4/5: this used to live inline in
     render(), so the classes were only ever recomputed when render() ran, and
     the width watcher below only ran render() when the MODE changed (900 /
     1150). Crossing 1400, 1560 or 2000 changed nothing, so a page booted at
     1280 and resized to 2500 kept `is-mode3 is-tight` and every one of the
     wide rules stayed inert — and the converse stranded `is-wide is-ultra` on
     a 900px column. The string is computed here and applied by BOTH render()
     and the watcher. */
  function rootClass() {
    var w = stage ? stage.clientWidth : 1280;
    var mode = w < 900 ? 1 : (w < 1150 ? 2 : 3);
    var wide = w >= 2000 ? ' is-wide is-ultra' : (w >= 1560 ? ' is-wide' : '');
    return 'c10 is-mode' + mode + (w < 1400 ? ' is-tight' : '') + wide;
  }

  /* Cheap width sync: the is-tight / is-wide / is-ultra steps are pure CSS, so
     when only they change the class is swapped in place and no re-render (and
     no scroll/focus churn) is needed. A mode change does restructure the pane
     strip, so that still goes through render(). */
  function syncWidthClass() {
    if (!root) return false;
    var cls = rootClass();
    if (root.className !== cls) { root.className = cls; return true; }
    return false;
  }

  function renderSoon() {
    if (ui.renderQueued) return;
    ui.renderQueued = true;
    requestAnimationFrame(function () {
      ui.renderQueued = false;
      render();
    });
  }

  var lastPaneKeys = '';

  function render() {
    if (!root) return;
    ui.mode = computeMode();
    root.className = rootClass();
    var focusFid = document.activeElement && document.activeElement.getAttribute
      ? document.activeElement.getAttribute('data-fid') : null;

    captureScrolls();
    renderTop();
    renderBody();
    renderFoot();
    if (window.PMIcons && window.PMIcons.hydrate) window.PMIcons.hydrate(root);
    restoreScrolls();
    if (focusFid) {
      var back = root.querySelector('[data-fid="' + cssEsc(focusFid) + '"]');
      if (back) { try { back.focus({ preventScroll: true }); } catch (e) { /* ok */ } }
    }
  }

  function captureScrolls() {
    var panes = root.querySelectorAll('[data-panekey]');
    for (var i = 0; i < panes.length; i++) {
      ui.scroll[panes[i].getAttribute('data-panekey')] = panes[i].scrollTop;
    }
  }
  function restoreScrolls() {
    var panes = root.querySelectorAll('[data-panekey]');
    for (var i = 0; i < panes.length; i++) {
      var k = panes[i].getAttribute('data-panekey');
      if (ui.scroll[k]) panes[i].scrollTop = ui.scroll[k];
    }
  }

  /* ============================ top command bar ============================ */

  function crumbBtn(label, dest, here) {
    if (here) return '<span class="c10-crumb is-here">' + esc(label) + '</span>';
    return '<button type="button" class="c10-crumb"' + goAttr(dest) + '>' + esc(label) + '</button>';
  }
  function crumbsHtml() {
    var v = ui.view;
    var parts = [];
    var sep = crumbSepChar();
    parts.push(crumbBtn('Settings', { route: 'home' }, v.kind === 'home'));
    if (v.kind === 'dest') {
      parts.push(sep);
      parts.push(crumbBtn(catTitle(v.cat), { route: 'dest', cat: v.cat }, !v.sub && !v.settingId));
      if (v.sub) {
        parts.push(sep);
        parts.push(crumbBtn(subTitle(v.cat, v.sub), { route: 'dest', cat: v.cat, sub: v.sub }, !v.settingId));
      }
      if (v.settingId && settingIx[v.settingId]) {
        parts.push(sep);
        parts.push('<span class="c10-crumb is-here">' + esc(settingIx[v.settingId].label) + '</span>');
      }
    } else if (v.kind === 'manager') {
      var def = mgrDef(v.managerId);
      if (def) {
        parts.push(sep);
        parts.push(crumbBtn(catTitle(def.cat), { route: 'dest', cat: def.cat }, false));
        parts.push(sep);
        parts.push(crumbBtn(def.title, { route: 'manager', managerId: def.id }, !v.objectId));
        if (v.objectId) {
          var vm = def.model(store);
          var page = obj(vm.pages)[v.objectId];
          parts.push(sep);
          parts.push('<span class="c10-crumb is-here">' + esc(page ? page.title : v.objectId) + '</span>');
        }
      }
    } else if (v.kind === 'all') {
      parts.push(sep);
      parts.push('<span class="c10-crumb is-here">All Settings</span>');
    } else if (v.kind === 'copy') {
      parts.push(sep);
      parts.push('<span class="c10-crumb is-here">Copy Settings</span>');
    }
    return parts.join('');
  }
  function crumbSepChar() {
    return '<span class="c10-crumb-sep" aria-hidden="true">\u203A</span>';
  }

  /* One Settings level outward \u2014 the same ladder the Left/Backspace retreat uses.
     Rendered in the top bar for the two- and three-pane widths, where no pane
     head carries a Back; at one-pane width the pane head owns the single Back
     (CSS hides this one) so the control never appears twice on one surface. */
  function backTarget() {
    var v = ui.view;
    if (v.kind === 'home') return null;
    if (v.kind === 'dest') {
      if (v.settingId && v.sub) return { label: subTitle(v.cat, v.sub), dest: { route: 'dest', cat: v.cat, sub: v.sub } };
      if (v.sub) return { label: catTitle(v.cat), dest: { route: 'dest', cat: v.cat } };
      if (v.cat) return { label: 'Settings Home', dest: { route: 'home' } };
      return { label: 'Settings Home', dest: { route: 'home' } };
    }
    if (v.kind === 'manager') {
      var def = mgrDef(v.managerId);
      if (def && v.objectId) return { label: def.title, dest: { route: 'manager', managerId: def.id } };
      if (def) return { label: catTitle(def.cat), dest: { route: 'dest', cat: def.cat } };
      return { label: 'Settings Home', dest: { route: 'home' } };
    }
    return { label: 'Settings Home', dest: { route: 'home' } };
  }
  function topBackHtml() {
    var t = backTarget();
    if (!t) return '';
    return '<button type="button" class="c10-back c10-back-top" data-pm2-back' + goAttr(t.dest) +
      ' aria-label="Back to ' + esc(t.label) + '">' + ico('undo') +
      '<span class="c10-back-full">Back to ' + esc(t.label) + '</span>' +
      '<span class="c10-back-short" aria-hidden="true">Back</span></button>';
  }

  function renderTop() {
    var proj = obj(store.data.project);
    var showMini = ui.view.kind !== 'home';
    elTop.innerHTML =
      topBackHtml() +
      '<nav class="c10-crumbs" aria-label="Settings path">' + crumbsHtml() + '</nav>' +
      (showMini
        ? '<div class="c10-minisearch c10-search-wrap">' + ico('search') +
          '<input type="text" id="c10MiniSearch" data-pm2-search-input data-fid="minisearch" placeholder="' +
          (ui.mode === 1 ? 'Search settings…' : 'Search settings, managers, actions…') + '" ' +
          'autocomplete="off" spellcheck="false" aria-label="Search settings">' +
          '<div class="c10-drop-slot"></div></div>'
        : '') +
      '<span class="c10-project" title="Every change here applies to this project only.">' + ico('pin') +
      '<strong>' + esc(proj.name || 'Puppet Master') + '</strong>' +
      '<span class="c10-project-role">' + esc(proj.role || '') + '</span></span>' +
      '<button type="button" class="c10-close" data-act="close-settings">' + ico('close') + 'Close Settings</button>';
  }

  /* ============================ body / pane strip ============================ */

  function paneShell(key, cls, headHtml, bodyHtml, anim, fixed) {
    return '<section class="c10-pane ' + cls + (anim ? ' ' + anim : '') + '" data-pane="' + esc(key) + '">' +
      (headHtml || '') +
      '<div class="c10-pane-body c10-scroll' + (fixed ? ' is-fixed' : '') + '" data-panekey="' + esc(key) + '">' + bodyHtml + '</div>' +
      '</section>';
  }

  function paneHead(eyebrow, title, count, sub, backLabel, backDest) {
    var h = '<header class="c10-pane-head">';
    if (backLabel) {
      h += '<div class="c10-backrow"><button type="button" class="c10-back" data-pm2-back' + goAttr(backDest) + '>' +
        ico('undo') + 'Back to ' + esc(backLabel) + '</button></div>';
    }
    h += '<div class="c10-eyebrow">' + esc(eyebrow) + '</div>';
    /* The title is its own span rather than a bare text node so the header can
       treat the name and the count as two atoms: audit 2026-08-21 round-4
       finding 10 — as a bare text node the name was an anonymous flex item
       that wrapped independently of the count, so the basic faces rendered
       'AI Brains &' / 'Providers' beside '112' / 'settings' on four mismatched
       baselines. See .c10-pane-title in the stylesheet. */
    h += '<div class="c10-pane-title"><span class="c10-pane-title-t">' + esc(title) + '</span>' +
      (count != null ? '<span class="c10-count">' + esc(count) + '</span>' : '') + '</div>';
    if (sub) h += '<div class="c10-pane-sub">' + esc(sub) + '</div>';
    h += '</header>';
    return h;
  }

  function renderBody() {
    var v = ui.view;
    var panes = [];
    var key = v.kind + ':' + (v.cat || '') + ':' + (v.sub || '') + ':' + (v.managerId || '') + ':' + (v.objectId || '') + ':' + (v.tab || '');
    var entering = key !== lastPaneKeys;
    lastPaneKeys = key;
    var anim = entering && !reducedMotion() ? 'c10-pane-enter' : '';

    if (ui.mode === 1) {
      panes.push(modeOnePane(anim));
    } else {
      if (v.kind === 'home') {
        panes.push(indexPane());
        panes.push(homePane(anim, false));
      } else if (v.kind === 'dest') {
        panes.push(indexPane());
        if (ui.mode === 3) panes.push(catPane(v.cat, anim));
        if (v.sub) panes.push(rowsPane(v.cat, v.sub, anim, ui.mode === 2));
        else if (ui.mode === 2) panes.push(catPane(v.cat, anim, true, true));
        else panes.push(catOverviewPane(v.cat, anim));
      } else if (v.kind === 'manager') {
        panes.push(indexPane());
        var def = mgrDef(v.managerId);
        /* object pages reclaim the domain pane's width for their detail */
        if (ui.mode === 3 && def && !v.objectId) panes.push(catPane(def.cat, '', false));
        panes.push(managerPane(v, anim, ui.mode === 2));
      } else if (v.kind === 'all') {
        panes.push(indexPane());
        /* two-pane width has no top Back (see topBackHtml), so these two
           utility panes carry their own, exactly like every other surface */
        panes.push(allPane(anim, ui.mode === 2));
      } else if (v.kind === 'copy') {
        panes.push(indexPane());
        panes.push(copyPane(anim, false, ui.mode === 2));
      }
    }
    elBody.innerHTML = panes.join('');
    afterBodyRender();
  }

  function modeOnePane(anim) {
    var v = ui.view;
    if (v.kind === 'home') return homePane(anim, true);
    if (v.kind === 'dest' && v.sub) return rowsPane(v.cat, v.sub, anim, true);
    if (v.kind === 'dest') return catPane(v.cat, anim, true, true);
    if (v.kind === 'manager') return managerPane(v, anim, true);
    if (v.kind === 'all') return allPane(anim, true);
    if (v.kind === 'copy') return copyPane(anim, true);
    return homePane(anim, true);
  }

  function afterBodyRender() {
    if (ui.view.kind === 'all') bindAllList();
  }

  /* ============================ command index ============================ */

  function indexPane() {
    var counts = store.counts();
    var byCat = {};
    arr(counts.byCategory).forEach(function (c) { byCat[c.id] = c; });
    var h = '';
    h += '<div class="c10-ix-group"><div class="c10-ix-label">Command index</div>';
    arr(INV.categories).forEach(function (c, i) {
      var cc = byCat[c.id] || { total: 0, changed: 0 };
      var active = (ui.view.kind === 'dest' && ui.view.cat === c.id) ||
        (ui.view.kind === 'manager' && mgrDef(ui.view.managerId) && mgrDef(ui.view.managerId).cat === c.id);
      h += '<button type="button" class="c10-ix-item' + (active ? ' is-active' : '') + '" data-fid="ix-' + esc(c.id) + '"' +
        goAttr({ route: 'dest', cat: c.id }) + '>' +
        '<span class="c10-ix-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
        ico(c.icon || 'gear') +
        '<span class="c10-ix-title">' + esc(c.title) + '</span>' +
        '<span class="c10-ix-meta">' + fmtInt(cc.total) +
        (cc.changed ? ' · <span class="is-changed">' + fmtInt(cc.changed) + '</span>' : '') + '</span>' +
        '</button>';
    });
    h += '</div>';
    h += '<div class="c10-ix-group c10-ix-util"><div class="c10-ix-label">Utilities</div>';
    h += '<button type="button" class="c10-ix-item' + (ui.view.kind === 'all' ? ' is-active' : '') + '" data-fid="ix-all"' +
      goAttr({ route: 'all' }) + '>' +
      '<span class="c10-ix-num">13</span>' + ico('list') +
      '<span class="c10-ix-title">All Settings</span>' +
      '<span class="c10-ix-meta">' + fmtInt(counts.total) + '</span></button>';
    h += '<button type="button" class="c10-ix-item' + (ui.view.kind === 'copy' ? ' is-active' : '') + '" data-fid="ix-copy"' +
      goAttr({ route: 'copy' }) + '>' +
      '<span class="c10-ix-num">14</span>' + ico('copy') +
      '<span class="c10-ix-title">Copy Settings</span>' +
      '<span class="c10-ix-meta">one-time</span></button>';
    h += '</div>';
    var head = paneHead('Conductor', 'Settings', fmtInt(counts.total) + ' settings',
      null, null, null);
    return paneShell('index', 'c10-pane-index', head, h, '');
  }

  /* ============================ home workspace ============================ */

  function noticeList() {
    /* Compact by contract: store.attention() (2-4 baseline, more when the
       scenario is heavy) plus fixture-pushed notices (pm2-fx-*) so every
       fixture state is visibly represented. The wider seeded demo notices
       live in their owning managers, not on Home. */
    var items = arr(store.attention()).slice();
    var seen = {};
    items.forEach(function (n) { seen[n.headline] = true; });
    arr(store.data.notices).forEach(function (n) {
      if (!n || seen[n.headline]) return;
      if (String(n.id || '').indexOf('pm2-fx-') !== 0) return;
      seen[n.headline] = true;
      var dest = null;
      var t = obj(n.target);
      if (t.settingId) dest = { route: 'setting', settingId: t.settingId };
      else if (t.cat) dest = { route: 'dest', cat: t.cat, sub: t.sub || null };
      items.push({ id: n.id, statusWord: n.statusWord || 'Note', headline: n.headline,
        consequence: n.consequence, dest: dest || { route: 'home' } });
    });
    return items;
  }

  function bannerHtml() {
    var sc = scenario();
    if (sc === 'offline') {
      return '<div class="c10-banner">' + ico('warning') + '<div class="c10-banner-text">' +
        '<strong>No network connection</strong>' +
        '<span>Provider status, web search, and update checks are paused. Cached values stay visible and everything local keeps working.</span>' +
        '</div></div>';
    }
    var rb = obj(store.data.restartBanner);
    if (rb.active) {
      return '<div class="c10-banner">' + ico('warning') + '<div class="c10-banner-text">' +
        '<strong>Restart needed to finish applying changes</strong>' +
        '<span>' + esc(rb.reason || 'Some changes wait for a restart.') + '</span>' +
        '</div></div>';
    }
    return '';
  }

  function wordTone(w) {
    var k = String(w || '').toLowerCase();
    if (k === 'failed' || k === 'error') return 't-error';
    if (k === 'offline' || k === 'watch' || k === 'restart' || k === 'check' || k === 'waiting' || k === 'needs attention' || k === 'cleanup') return 't-attention';
    if (k === 'sign in' || k === 'setup' || k === 'update') return 't-setup';
    if (k === 'done') return 't-ok';
    return 't-muted';
  }

  function homePane(anim, embedIndex) {
    var proj = obj(store.data.project);
    var sc = scenario();
    var counts = store.counts();
    var h = '<div class="c10-home">';

    h += '<div class="c10-home-head"><h1 class="c10-home-title">Settings</h1>' +
      '<p class="c10-home-context">Project — <strong>' + esc(proj.name || 'Puppet Master') + '</strong>' +
      (proj.role ? ' · ' + esc(proj.role) : '') +
      ' · every change applies to this project only.</p></div>';

    h += '<div class="c10-bigsearch c10-search-wrap">' + ico('search') +
      '<input type="text" id="c10BigSearch" data-pm2-search-input data-fid="bigsearch" placeholder="Search all ' + fmtInt(counts.total) + ' settings, managers, and actions…" ' +
      'autocomplete="off" spellcheck="false" aria-label="Search settings">' +
      '<span class="c10-kbd-hint"><kbd class="c10-kbd">Ctrl</kbd><kbd class="c10-kbd">K</kbd></span>' +
      '<div class="c10-drop-slot"></div></div>';

    h += bannerHtml();

    if (obj(store.data.loadingCached).active) {
      h += '<span class="c10-refresh-note">' + ico('refresh') +
        esc(obj(store.data.loadingCached).note || 'Cached values shown while a refresh runs.') + '</span>';
    }

    /* attention */
    h += '<div class="c10-home-sec is-attention"><div class="c10-sec-label">Needs attention<span class="c10-rule"></span></div>';
    var notices = noticeList();
    if (!notices.length) {
      if (sc === 'first-run') {
        h += '<div class="c10-empty"><strong>Fresh workspace — nothing needs attention.</strong> ' +
          'A good first pass: open <strong>AI Brains &amp; Providers</strong> to connect a provider, ' +
          'pick a look in <strong>General &amp; Appearance</strong>, then review <strong>Permissions &amp; Safety</strong>. ' +
          'Everything you change applies to this project only.</div>';
      } else {
        h += '<div class="c10-empty">Nothing needs attention right now. Changes and health results will surface here.</div>';
      }
    } else {
      notices.forEach(function (n) {
        h += '<button type="button" class="c10-att-row"' + goAttr(n.dest) + '>' +
          '<span class="c10-word c10-att-word ' + wordTone(n.statusWord) + '">' + esc(n.statusWord) + '</span>' +
          '<span class="c10-att-main"><span class="c10-att-head">' + esc(n.headline) + '</span>' +
          '<span class="c10-att-why">' + esc(n.consequence || '') + '</span></span>' +
          '<span class="c10-att-go">Open ' + ico('external') + '</span></button>';
      });
    }
    h += '</div>';

    if (embedIndex) {
      /* one-pane widths: the command index lives inline so the 12
         destinations stay the dominant content of Home */
      h += '<div class="c10-home-sec is-index"><div class="c10-sec-label">Command index<span class="c10-rule"></span></div>';
      var byCat = {};
      arr(counts.byCategory).forEach(function (c) { byCat[c.id] = c; });
      arr(INV.categories).forEach(function (c, i) {
        var cc = byCat[c.id] || { total: 0, changed: 0 };
        h += '<button type="button" class="c10-ix-item"' + goAttr({ route: 'dest', cat: c.id }) + '>' +
          '<span class="c10-ix-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' + ico(c.icon || 'gear') +
          '<span class="c10-ix-title">' + esc(c.title) + '</span>' +
          '<span class="c10-ix-meta">' + fmtInt(cc.total) +
          (cc.changed ? ' · <span class="is-changed">' + fmtInt(cc.changed) + '</span>' : '') + '</span></button>';
      });
      h += '</div>';
    }

    /* recently accessed */
    h += '<div class="c10-home-sec is-recent"><div class="c10-sec-label">Recent changes<span class="c10-rule"></span></div>';
    var recents = sc === 'first-run' ? [] : arr(store.recents()).slice(0, 6);
    if (!recents.length) {
      h += '<div class="c10-empty">No changes in this project yet. Recent edits will list here with what changed and when.</div>';
    } else {
      h += '<div class="c10-recent">';
      recents.forEach(function (r) {
        h += '<button type="button" class="c10-recent-row"' + goAttr({ route: 'setting', settingId: r.settingId }) + '>' +
          '<span class="c10-recent-what">' + esc(r.label) + '</span>' +
          '<span class="c10-recent-change">' + esc(r.fromLabel || '—') + ' \u2192 ' + esc(r.toLabel || '—') +
          (r.note ? ' · ' + esc(r.note) : '') + '</span>' +
          '<span class="c10-recent-when">' + esc(fmtAgo(r.when)) + '</span></button>';
      });
      h += '</div>';
    }
    h += '</div>';

    /* secondary utilities */
    h += '<div class="c10-home-sec is-utils"><div class="c10-sec-label">Utilities<span class="c10-rule"></span></div>' +
      '<div class="c10-util-row">' +
      '<button type="button" class="c10-util"' + goAttr({ route: 'all' }) + '>' + ico('list') + 'All Settings · ' + fmtInt(counts.total) + '</button>' +
      '<button type="button" class="c10-util"' + goAttr({ route: 'copy' }) + '>' + ico('copy') + 'Copy Settings from another project</button>' +
      '</div></div>';

    h += '</div>';
    /* Home carries its own masthead; no pane head on top of it */
    return paneShell('home', 'c10-pane-flex', '', h, anim);
  }

  /* ============================ category pane ============================ */

  function catPane(cat, anim, withBack, inlineOverview) {
    var c = catById[cat];
    if (!c) return paneShell('cat', 'c10-pane-cat', '', '<div class="c10-empty">Unknown category.</div>', anim);
    var counts = store.counts();
    var cc = null;
    arr(counts.byCategory).forEach(function (x) { if (x.id === cat) cc = x; });
    var h = '';

    if (inlineOverview) {
      /* One-pane width has no second pane to hold the overview, so the domain
         summary rides inline here instead of vanishing: same blurb, same
         counts, same key-settings table the wide layout shows. */
      h += '<div class="c10-ov is-inline">';
      h += '<p class="c10-ov-blurb">' + esc(c.desc || '') + '</p>';
      if (cc) {
        h += '<div class="c10-ov-stats">' +
          '<span><strong>' + fmtInt(cc.total) + '</strong> settings</span>' +
          '<span><strong>' + fmtInt(cc.changed) + '</strong> changed from default</span>' +
          '<span><strong>' + fmtInt(cc.simple) + '</strong> everyday · <strong>' + fmtInt(cc.advanced) + '</strong> advanced</span>' +
          '</div>';
      }
      h += '</div>';
    } else {
      h += '<div class="c10-sec-label">Overview<span class="c10-rule"></span></div>';
      h += '<button type="button" class="c10-item' + (!ui.view.sub && ui.view.kind === 'dest' && ui.view.cat === cat ? ' is-active' : '') + '" data-fid="cat-ov"' +
        goAttr({ route: 'dest', cat: cat }) + '>' +
        '<span class="c10-item-main"><span class="c10-item-title">' + esc(c.title) + ' overview</span>' +
        '<span class="c10-item-sub">Managers, sections, and key settings</span></span>' +
        '<span class="c10-item-meta"></span><span class="c10-chev">' + ico('external') + '</span></button>';
    }

    h += '<div class="c10-sec-label">Sections<span class="c10-rule"></span></div>';
    arr(c.subgroups).forEach(function (g) {
      var total = 0;
      if (cc) arr(cc.subgroups).forEach(function (s) { if (s.id === g.id) total = s.total; });
      var active = ui.view.kind === 'dest' && ui.view.cat === cat && ui.view.sub === g.id;
      h += '<button type="button" class="c10-item' + (active ? ' is-active' : '') + '" data-fid="sub-' + esc(g.id) + '"' +
        goAttr({ route: 'dest', cat: cat, sub: g.id }) + '>' +
        '<span class="c10-item-main"><span class="c10-item-title">' + esc(g.title) + '</span>' +
        '<span class="c10-item-sub">' + esc(g.desc || '') + '</span></span>' +
        '<span class="c10-item-meta">' + fmtInt(total) + '</span>' +
        '<span class="c10-chev">' + ico('external') + '</span></button>';
    });

    var defs = managers() && managers().byCat ? managers().byCat(cat) : [];
    var demonstrated = defs.filter(function (d) { return d.status === 'demonstrated'; });
    var deferred = defs.filter(function (d) { return d.status === 'deferred_named_owner'; });
    if (demonstrated.length) {
      h += '<div class="c10-sec-label">Managers<span class="c10-rule"></span></div>';
      demonstrated.forEach(function (d) {
        var active = ui.view.kind === 'manager' && ui.view.managerId === d.id;
        h += '<button type="button" class="c10-item' + (active ? ' is-active' : '') + '" data-manager="' + esc(d.id) + '" data-fid="mgr-' + esc(d.id) + '"' +
          goAttr({ route: 'manager', managerId: d.id }) + '>' +
          '<span class="c10-item-main"><span class="c10-item-title">' + esc(d.title) + '</span>' +
          '<span class="c10-item-sub">' + esc(d.blurb || '') + '</span></span>' +
          '<span class="c10-item-meta"></span><span class="c10-chev">' + ico('external') + '</span></button>';
      });
    }
    if (deferred.length) {
      h += '<div class="c10-sec-label">Reserved destinations<span class="c10-rule"></span></div>';
      deferred.forEach(function (d) {
        var active = ui.view.kind === 'manager' && ui.view.managerId === d.id;
        h += '<button type="button" class="c10-item' + (active ? ' is-active' : '') + '" data-manager="' + esc(d.id) + '"' +
          goAttr({ route: 'manager', managerId: d.id }) + '>' +
          '<span class="c10-item-main"><span class="c10-item-title">' + esc(d.title) + '</span>' +
          '<span class="c10-item-sub">Owner module · read-only shell</span></span>' +
          '<span class="c10-item-meta"></span><span class="c10-chev">' + ico('external') + '</span></button>';
      });
    }

    if (inlineOverview) {
      var curatedN = arr(INV.settings).filter(function (s) { return s.cat === cat && s.curated; }).slice(0, 8);
      if (curatedN.length) {
        h += '<div class="c10-sec-label">Key settings<span class="c10-rule"></span></div>';
        h += '<div class="c10-rows">' + theadHtml();
        curatedN.forEach(function (s) { h += rowHtml(store.resolveRow(s.id)); });
        h += '</div>';
      }
    }

    var head = paneHead('Domain', c.title, cc ? fmtInt(cc.total) + ' settings' : null, null,
      withBack ? 'Settings Home' : null, { route: 'home' });
    return paneShell('cat:' + cat, ui.mode === 3 ? 'c10-pane-cat' : 'c10-pane-flex', head, h, anim);
  }

  /* ============================ category overview pane ==================== */

  function catOverviewPane(cat, anim) {
    var c = catById[cat];
    var counts = store.counts();
    var cc = null;
    arr(counts.byCategory).forEach(function (x) { if (x.id === cat) cc = x; });
    var h = '<div class="c10-ov">';
    h += '<p class="c10-ov-blurb">' + esc(c.desc || '') + '</p>';
    if (cc) {
      h += '<div class="c10-ov-stats">' +
        '<span><strong>' + fmtInt(cc.total) + '</strong> settings</span>' +
        '<span><strong>' + fmtInt(cc.changed) + '</strong> changed from default</span>' +
        '<span><strong>' + fmtInt(cc.simple) + '</strong> everyday · <strong>' + fmtInt(cc.advanced) + '</strong> advanced</span>' +
        '</div>';
    }

    var defs = managers() && managers().byCat ? managers().byCat(cat) : [];
    if (defs.length) {
      h += '<div class="c10-sec-label">Managers<span class="c10-rule"></span></div>';
      /* the wrapper is what lets the wide layout lay these cards out two-up
         instead of stretching one card across 1400px of pane */
      h += '<div class="c10-ovlist">';
      defs.forEach(function (d) {
        h += '<button type="button" class="c10-mgr-row" data-manager="' + esc(d.id) + '"' +
          goAttr({ route: 'manager', managerId: d.id }) + '>' +
          ico(d.icon || 'gear') +
          '<span class="c10-mgr-text"><span class="c10-mgr-title">' + esc(d.title) + '</span>' +
          '<div class="c10-mgr-sub">' + esc(d.blurb || '') + '</div></span>' +
          '<span class="c10-word ' + (d.status === 'deferred_named_owner' ? 't-muted' : 't-ok') + '">' +
          (d.status === 'deferred_named_owner' ? 'Reserved' : 'Ready') + '</span>' +
          '<span class="c10-chev">' + ico('external') + '</span></button>';
      });
      h += '</div>';
    }

    h += '<div class="c10-sec-label">Sections<span class="c10-rule"></span></div>';
    h += '<div class="c10-ovlist">';
    arr(c.subgroups).forEach(function (g) {
      var total = 0;
      if (cc) arr(cc.subgroups).forEach(function (s) { if (s.id === g.id) total = s.total; });
      h += '<button type="button" class="c10-mgr-row"' + goAttr({ route: 'dest', cat: cat, sub: g.id }) + '>' +
        ico('folder') +
        '<span class="c10-mgr-text"><span class="c10-mgr-title">' + esc(g.title) + '</span>' +
        '<div class="c10-mgr-sub">' + esc(g.desc || '') + '</div></span>' +
        '<span class="c10-item-meta">' + fmtInt(total) + '</span>' +
        '<span class="c10-chev">' + ico('external') + '</span></button>';
    });
    h += '</div>';

    /* key settings: the curated rows of this domain */
    var curated = arr(INV.settings).filter(function (s) { return s.cat === cat && s.curated; }).slice(0, 8);
    if (curated.length) {
      h += '<div class="c10-sec-label">Key settings<span class="c10-rule"></span></div>';
      h += '<div class="c10-rows is-embedded">' + theadHtml();
      curated.forEach(function (s) { h += rowHtml(store.resolveRow(s.id)); });
      h += '</div>';
    }
    h += '</div>';
    var head = paneHead('Domain overview', c.title, cc ? fmtInt(cc.total) + ' settings' : null,
      null, ui.mode === 1 ? 'Settings Home' : null, { route: 'home' });
    return paneShell('ov:' + cat, 'c10-pane-flex', head, h, anim);
  }

  /* ============================ rows pane + editor ======================== */

  function theadHtml() {
    return '<div class="c10-thead"><span>Setting</span><span>Value</span><span style="text-align:right">State</span></div>';
  }

  function stateWord(row) {
    var map = {
      'managed': ['Managed', 't-muted'],
      'unavailable': ['Unavailable', 't-muted'],
      'restart-required': ['Restart needed', 't-attention'],
      'reconnect-required': ['Reconnect', 't-attention'],
      'changed-elsewhere': ['Changed elsewhere', 't-attention'],
      'error': ['Error', 't-error']
    };
    var m = map[row.state];
    if (!m) return '<span class="c10-word t-muted">\u2014</span>';
    return '<span class="c10-word ' + m[1] + '">' + esc(m[0]) + '</span>';
  }

  function rowHtml(row) {
    if (!row) return '';
    var chip = arr(row.chips)[0];
    var chipHtml = chip
      ? '<span class="pm-chip-value" data-kind="' + esc(chip.kind) + '">' + esc(humanValue(chip.label || '')) + '</span>'
      : '<span class="v-unset">Not set</span>';
    var isOpen = ui.editorOpen === row.id;
    var badges = '';
    if (row.tier !== 'simple') badges += '<span class="c10-flag">Advanced</span>';
    var h = '<button type="button" class="c10-row' + (isOpen ? ' is-open' : '') + '" data-setting-id="' + esc(row.id) + '" data-fid="row-' + esc(row.id) + '"' +
      ' data-act="row-open:' + esc(row.id) + '" aria-expanded="' + (isOpen ? 'true' : 'false') + '">' +
      '<span class="c10-row-name">' + esc(row.label) + badges + '</span>' +
      '<span class="c10-row-value">' + chipHtml + '</span>' +
      '<span class="c10-row-state">' + stateWord(row) + '</span>' +
      '</button>';
    if (isOpen) h += editorHtml(row);
    return h;
  }

  var PAGE = 24;

  function rowGroupHtml(rows, listKey, label) {
    if (!rows.length) return '';
    var shown = PAGE + (ui.morePages[listKey] || 0) * PAGE;
    var slice = rows.slice(0, shown);
    var h = '<div class="c10-sec-label">' + esc(label) + '<span class="c10-rule"></span><span>' + fmtInt(rows.length) + '</span></div>';
    h += theadHtml();
    slice.forEach(function (r) { h += rowHtml(r); });
    if (rows.length > shown) {
      h += '<button type="button" class="c10-more" data-act="more:' + esc(listKey) + '">Show ' +
        fmtInt(Math.min(PAGE, rows.length - shown)) + ' more of ' + fmtInt(rows.length) + '</button>';
    }
    return h;
  }

  function rowsPane(cat, sub, anim, withBack) {
    var rows = store.rowsFor(cat, sub);
    var key = cat + '/' + sub;
    var curated = [], simple = [], advanced = [];
    rows.forEach(function (r) {
      var rec = settingIx[r.id] || {};
      if (rec.curated) curated.push(r);
      else if (r.tier === 'simple') simple.push(r);
      else advanced.push(r);
    });
    var h = '<div class="c10-rows">';
    if (curated.length) h += rowGroupHtml(curated, key + '/cur', 'Key settings');
    if (simple.length) h += rowGroupHtml(simple, key + '/simple', 'Everyday');
    if (advanced.length) {
      /* A row in an attention-worthy state must never hide behind a closed
         fold — auto-disclose and say why on the toggle. */
      var attn = advanced.filter(function (r) {
        return r.state === 'error' || r.state === 'restart-required' ||
               r.state === 'reconnect-required' || r.state === 'changed-elsewhere';
      });
      if (attn.length && ui.advOpen[key] === undefined) ui.advOpen[key] = true;
      var open = !!ui.advOpen[key];
      h += '<button type="button" class="c10-advbar" data-act="adv:' + esc(key) + '" aria-expanded="' + open + '">' +
        ico(open ? 'minus' : 'plus') + 'Advanced · ' + fmtInt(advanced.length) + ' settings' +
        (attn.length ? '<span class="c10-word t-error">' + fmtInt(attn.length) + (attn.length === 1 ? ' needs attention' : ' need attention') + '</span>' : '') +
        '<span class="c10-rule"></span></button>';
      if (open) h += rowGroupHtml(advanced, key + '/adv', 'Advanced');
    }
    h += '</div>';
    var head = paneHead('Section', subTitle(cat, sub), fmtInt(rows.length) + ' settings',
      subDesc(cat, sub), withBack ? catTitle(cat) : null, { route: 'dest', cat: cat });
    return paneShell('rows:' + key, 'c10-pane-flex', head, h, anim);
  }

  /* ---------------- the exact editor, beneath its context row ------------ */

  function editorHtml(row) {
    var rec = settingIx[row.id] || {};
    var locked = row.state === 'managed' || row.state === 'unavailable';
    var h = '<div class="c10-editor" data-editor="' + esc(row.id) + '">';
    h += '<div class="c10-editor-head"><span class="c10-editor-title">' + esc(row.label) + '</span>' +
      '<button type="button" class="c10-editor-close" data-act="row-close">' + ico('close') + 'Close</button></div>';
    h += '<p class="c10-editor-desc">' + esc(row.desc || '') + '</p>';
    h += '<div class="c10-editor-path">Settings \u203A ' + esc(catTitle(rec.cat)) + ' \u203A ' + esc(subTitle(rec.cat, rec.sub)) + '</div>';

    if (row.stateNote) {
      var toneCls = row.state === 'error' ? 't-error'
        : row.state === 'managed' ? 't-managed'
        : (row.state === 'unavailable' ? '' : 't-attention');
      var noteIcon = row.state === 'error' ? 'warning'
        : row.state === 'managed' ? 'lock'
        : row.state === 'unavailable' ? 'info' : 'warning';
      h += '<div class="c10-statenote ' + toneCls + '">' + ico(noteIcon) + '<span>' + esc(row.stateNote) + '</span></div>';
    }

    h += controlHtml(row, locked);

    if (ui.editorErr && ui.editorErr.id === row.id) {
      h += '<div class="c10-err">' + esc(ui.editorErr.msg) + '</div>';
    }

    h += '<div class="c10-editor-actions">';
    if (row.changedFromDefault && !locked && row.control.type !== 'action') {
      h += '<button type="button" class="c10-btn" data-act="ed-reset:' + esc(row.id) + '">' + ico('undo') + 'Reset to default</button>';
    }
    if (row.recommended !== undefined && !locked && row.control.type !== 'action') {
      h += '<span class="c10-ctl-note">Recommended: ' + esc(humanValue(row.recommended)) + '</span>';
    }
    h += '</div>';

    /* intentionally-technical detail drawer (mono allowed here only) */
    var dOpen = !!ui.detailOpen[row.id];
    h += '<div class="c10-detail"><button type="button" class="c10-detail-toggle" data-act="ed-detail:' + esc(row.id) + '" aria-expanded="' + dOpen + '">' +
      ico(dOpen ? 'minus' : 'plus') + 'Details &amp; why this value</button>';
    if (dOpen) {
      h += '<div class="c10-detail-body"><dl class="c10-kv">';
      h += '<dt>Setting id</dt><dd><span class="c10-mono">' + esc(row.id) + '</span></dd>';
      /* the one place the packet allows the raw control enum to show */
      if (obj(row.control).type) {
        h += '<dt>Control</dt><dd>' + esc(typeLabel(obj(row.control).type)) +
          ' <span class="c10-mono">' + esc(obj(row.control).type) + '</span></dd>';
      }
      if (typeof row.value === 'string' && humanValue(row.value) !== row.value) {
        h += '<dt>Stored value</dt><dd><span class="c10-mono">' + esc(row.value) + '</span></dd>';
      }
      h += '<dt>Scope</dt><dd>' + esc(obj(row.detail).legacyScopeNote || '') + '</dd>';
      if (row.changedFromDefault) {
        var entry = obj(store.values[row.id]);
        h += '<dt>Changed</dt><dd>' + esc(entry.changedAt ? fmtAgo(entry.changedAt) : 'in this project') + ' by ' + esc(entry.by || 'You') + '</dd>';
      }
      var rel = arr(obj(row.detail).related);
      if (rel.length) h += '<dt>Related</dt><dd>' + esc(rel.join(', ')) + '</dd>';
      var terms = arr(obj(row.detail).searchTerms);
      if (terms.length) h += '<dt>Search terms</dt><dd><span class="c10-mono">' + esc(terms.join(', ')) + '</span></dd>';
      h += '</dl></div>';
    }
    h += '</div></div>';
    return h;
  }

  function controlHtml(row, locked) {
    var c = obj(row.control);
    var t = c.type;
    var id = row.id;
    var dis = locked ? ' disabled' : '';
    var h = '<div class="c10-ctl">';

    if (t === 'toggle') {
      var on = row.value === true || row.value === 'on';
      h += '<div class="c10-seg" role="group" aria-label="' + esc(row.label) + '">' +
        '<button type="button"' + dis + ' class="' + (on ? 'is-on' : '') + '" data-fid="ed-on" data-act="ed-set:' + esc(id) + ':true">On</button>' +
        '<button type="button"' + dis + ' class="' + (!on ? 'is-on' : '') + '" data-fid="ed-off" data-act="ed-set:' + esc(id) + ':false">Off</button></div>';
    } else if (t === 'select' || t === 'radio') {
      h += '<div class="c10-opts" role="radiogroup" aria-label="' + esc(row.label) + '">';
      arr(c.options).forEach(function (o, i) {
        var val = (o && typeof o === 'object') ? (o.value !== undefined ? o.value : o.id) : o;
        var lab = humanValue((o && typeof o === 'object') ? (o.label || String(val)) : String(o));
        var on = String(row.value) === String(val);
        h += '<button type="button" role="radio" aria-checked="' + on + '"' + (locked ? ' aria-disabled="true"' : '') +
          ' class="c10-opt' + (on ? ' is-on' : '') + '" data-fid="ed-opt-' + i + '"' +
          (locked ? '' : ' data-act="ed-setopt:' + esc(id) + ':' + i + '"') + '>' +
          '<span class="c10-dot"></span><span>' + esc(lab) + '</span>' +
          (row.recommended !== undefined && String(row.recommended) === String(val)
            ? '<span class="c10-opt-tag">Recommended</span>' : '<span></span>') +
          '</button>';
      });
      h += '</div>';
    } else if (t === 'multiselect') {
      var cur = arr(row.value);
      h += '<div class="c10-opts" aria-label="' + esc(row.label) + '">';
      arr(c.options).forEach(function (o, i) {
        var on = cur.indexOf(o) >= 0;
        h += '<button type="button" aria-pressed="' + on + '"' + (locked ? ' aria-disabled="true"' : '') +
          ' class="c10-opt' + (on ? ' is-on' : '') + '" data-fid="ed-opt-' + i + '"' +
          (locked ? '' : ' data-act="ed-multi:' + esc(id) + ':' + i + '"') + '>' +
          '<span class="c10-box"></span><span>' + esc(String(o)) + '</span><span></span></button>';
      });
      h += '</div>';
    } else if (t === 'slider') {
      var isNum = typeof row.value === 'number';
      if (isNum) {
        var min = (c.min != null ? c.min : 0), max = (c.max != null ? c.max : 100);
        var step = (max - min) <= 1 ? 0.05 : 1;
        h += '<div class="c10-num-wrap">' +
          '<input type="range" class="c10-range"' + dis + ' min="' + min + '" max="' + max + '" step="' + step + '" value="' + esc(String(row.value)) + '" data-slider="' + esc(id) + '" data-fid="ed-range" aria-label="' + esc(row.label) + '">' +
          '<span class="c10-ctl-note" data-slider-out="' + esc(id) + '">' + esc(row.valueLabel || String(row.value)) + '</span></div>';
      } else {
        h += '<div class="c10-num-wrap"><input type="text" class="c10-input" ' + dis + ' value="' + esc(String(row.value == null ? '' : row.value)) + '" data-fid="ed-text" id="c10EdInput" aria-label="' + esc(row.label) + '">' +
          '<button type="button" class="c10-btn is-primary"' + dis + ' data-act="ed-applytext:' + esc(id) + '">Apply</button></div>';
      }
    } else if (t === 'number') {
      h += '<div class="c10-num-wrap"><input type="number" class="c10-input' + (ui.editorErr && ui.editorErr.id === id ? ' has-error' : '') + '"' + dis +
        (c.min != null ? ' min="' + c.min + '"' : '') + (c.max != null ? ' max="' + c.max + '"' : '') +
        ' value="' + esc(String(row.value == null ? '' : row.value)) + '" id="c10EdInput" data-fid="ed-num" aria-label="' + esc(row.label) + '">' +
        '<button type="button" class="c10-btn is-primary"' + dis + ' data-act="ed-applynum:' + esc(id) + '">Apply</button>' +
        (c.min != null ? '<span class="c10-ctl-note">' + fmtInt(c.min) + ' \u2013 ' + fmtInt(c.max) + '</span>' : '') +
        '</div>';
    } else if (t === 'text' || t === 'path') {
      h += '<div class="c10-num-wrap"><input type="text" class="c10-input is-wide' + (ui.editorErr && ui.editorErr.id === id ? ' has-error' : '') + '"' + dis +
        ' value="' + esc(String(row.value == null ? '' : row.value)) + '" id="c10EdInput" data-fid="ed-text" aria-label="' + esc(row.label) + '"' +
        (t === 'path' ? ' placeholder="A folder or file path"' : '') + '>' +
        '<button type="button" class="c10-btn is-primary"' + dis + ' data-act="ed-applytext:' + esc(id) + '">Apply</button></div>';
    } else if (t === 'action') {
      h += '<button type="button" class="c10-btn is-primary"' + dis + ' data-act="ed-action:' + esc(id) + '">' +
        ico('play') + esc(row.valueLabel || 'Run') + '</button>' +
      '<span class="c10-ctl-note" style="margin-left:8px">Runs now and reports honestly.</span>';
    } else if (t === 'list' || t === 'keyvalue') {
      h += '<div class="c10-ctl-note">' + esc(row.valueLabel || 'Empty') + '. This collection is managed in its own surface; the entries below are the current value.</div>';
      var v = row.value;
      if (Array.isArray(v) && v.length) {
        h += '<dl class="c10-kv" style="margin-top:6px">';
        v.slice(0, 8).forEach(function (item, i) {
          h += '<dt>' + (i + 1) + '</dt><dd>' + esc(typeof item === 'object' ? JSON.stringify(item) : String(item)) + '</dd>';
        });
        if (v.length > 8) h += '<dt></dt><dd>and ' + fmtInt(v.length - 8) + ' more…</dd>';
        h += '</dl>';
      } else if (v && typeof v === 'object') {
        var ks = Object.keys(v);
        if (ks.length) {
          h += '<dl class="c10-kv" style="margin-top:6px">';
          ks.slice(0, 8).forEach(function (k) {
            h += '<dt>' + esc(k) + '</dt><dd>' + esc(String(v[k])) + '</dd>';
          });
          h += '</dl>';
        }
      }
    } else {
      h += '<div class="c10-ctl-note">' + esc(row.valueLabel || '') + '</div>';
    }
    h += '</div>';
    return h;
  }

  /* ============================ manager workspace ========================= */

  function tone2cls(t) {
    return t === 'ok' ? 't-ok' : t === 'attention' ? 't-attention' : t === 'setup' ? 't-setup'
      : t === 'progress' ? 't-progress' : 't-muted';
  }

  function jumpBtn(dest, label) {
    if (!dest) return '';
    return '<button type="button" class="c10-qa-jump"' + goAttr(dest) + '>' + esc(label || 'Open') + '</button>';
  }

  function qaRows(items) {
    var h = '<div class="c10-qa">';
    arr(items).forEach(function (it) {
      if (!it) return;
      var val = it.valueLabel != null ? it.valueLabel : (it.value != null ? valStr(it.value) : '\u2014');
      h += '<div class="c10-qa-row"><div class="c10-qa-q">' + esc(it.label || '') + '</div>' +
        '<div class="c10-qa-a' + (it.tone === 'muted' ? ' t-muted' : '') + '"' + (it.settingId ? ' data-setting-id="' + esc(it.settingId) + '"' : '') +
        (it.id ? ' data-object-id="' + esc(it.id) + '"' : '') + '>' +
        esc(String(val)) +
        (it.dest ? jumpBtn(it.dest, it.settingId ? 'Edit' : 'Open') : '') +
        (it.note ? '<span class="c10-qa-note">' + esc(it.note) + '</span>' : '') +
        '</div></div>';
    });
    h += '</div>';
    return h;
  }

  function whatNextHtml(steps) {
    if (!arr(steps).length) return '';
    var h = '<div class="c10-sec-note" style="margin-top:8px"><strong>When included usage ends:</strong></div><div class="c10-steps">';
    arr(steps).forEach(function (s) {
      h += '<div class="c10-step"><span class="c10-step-n">' + esc(String(s.n)) + '</span>' +
        '<span class="c10-step-t">' + esc(s.label) + '</span></div>';
    });
    h += '</div>';
    return h;
  }

  function rosterItemHtml(item, managerId) {
    if (!item) return '';
    var key = managerId + ':' + item.id;
    var openD = !!ui.roOpen[key];
    var st = obj(item.status);
    var flags = obj(item.flags);
    var h = '<div class="c10-ro-item" data-object-id="' + esc(item.id) + '">';
    var top = '<span><span class="c10-ro-label">' + esc(item.label || item.id);
    if (flags.selected) top += '<span class="c10-ro-flag is-selected">In use</span>';
    if (flags.shadowed) top += '<span class="c10-ro-flag">Shadowed</span>';
    if (flags.manualOnly) top += '<span class="c10-ro-flag">Manual only</span>';
    if (flags.favorite) top += '<span class="c10-ro-flag">Favorite</span>';
    top += '</span>' + (item.sub ? '<div class="c10-ro-sub">' + esc(item.sub) + '</div>' : '') + '</span>';
    top += '<span class="c10-word ' + tone2cls(st.tone) + '">' + esc(st.label || '') + '</span>';

    if (item.dest) {
      h += '<button type="button" class="c10-ro-top"' + goAttr(item.dest) + '>' + top + '</button>';
    } else {
      h += '<div class="c10-ro-top">' + top + '</div>';
    }
    if (st.note) h += '<div class="c10-ro-note">' + esc(st.note) + '</div>';
    if (item.shadowNote) h += '<div class="c10-ro-note">' + esc(item.shadowNote) + '</div>';
    if (item.manualOnlyReason) h += '<div class="c10-ro-note">' + esc(item.manualOnlyReason) + '</div>';
    if (item.note && !st.note) h += '<div class="c10-ro-note">' + esc(item.note) + '</div>';

    var acts = arr(item.actions);
    if (acts.length || item.detail) {
      h += '<div class="c10-ro-actions">';
      acts.forEach(function (a) {
        if (!a || a.id === 'details') return;
        h += '<button type="button" class="c10-btn" data-act="inst:' + esc(managerId) + ':' + esc(item.id) + ':' + esc(a.id) + '">' + esc(a.label) + '</button>';
      });
      if (item.detail) {
        h += '<button type="button" class="c10-btn" data-act="ro-detail:' + esc(key) + '" aria-expanded="' + openD + '">' +
          (openD ? 'Hide detail' : 'Detail') + '</button>';
      }
      h += '</div>';
    }
    if (openD && item.detail) {
      h += '<div class="c10-ro-detail"><dl class="c10-kv">';
      var d = obj(item.detail);
      Object.keys(d).forEach(function (k) {
        var val = d[k];
        if (val == null) return;
        var label = k.replace(/([A-Z])/g, ' $1').replace(/^./, function (m) { return m.toUpperCase(); });
        if (Array.isArray(val)) {
          if (!val.length) return;
          var strs = val.map(function (x) {
            if (x && typeof x === 'object') {
              return Object.keys(x).map(function (kk) { return kk + ': ' + String(x[kk]); }).join(' · ');
            }
            return String(x);
          });
          h += '<dt>' + esc(label) + '</dt><dd>' + esc(strs.slice(0, 6).join('  |  ')) +
            (strs.length > 6 ? ' … and ' + (strs.length - 6) + ' more' : '') + '</dd>';
        } else if (typeof val === 'object') {
          h += '<dt>' + esc(label) + '</dt><dd><span class="c10-mono">' + esc(JSON.stringify(val)) + '</span></dd>';
        } else {
          h += '<dt>' + esc(label) + '</dt><dd>' + esc(String(val)) + '</dd>';
        }
      });
      h += '</dl></div>';
    }
    h += '</div>';
    return h;
  }

  function tableHtml(sec) {
    var cols = arr(sec.columns);
    if (!cols.length && arr(sec.rows).length) {
      /* derive columns from the first row's cells */
      var first = obj(arr(sec.rows)[0].cells);
      cols = Object.keys(first).map(function (k) { return { id: k, label: k.replace(/^./, function (m) { return m.toUpperCase(); }) }; });
    }
    var h = '<div class="c10-mtable"><div class="c10-mtable-scroll c10-scroll"><table><thead><tr>';
    cols.forEach(function (c) { h += '<th>' + esc(c.label) + '</th>'; });
    h += '</tr></thead><tbody>';
    arr(sec.rows).forEach(function (r) {
      var cells = obj(r.cells);
      h += '<tr' + (r.dest ? ' class="is-clickable" tabindex="0"' + goAttr(r.dest) : '') +
        (r.id ? ' data-object-id="' + esc(r.id) + '"' : '') + '>';
      cols.forEach(function (c) {
        h += '<td>' + esc(String(cells[c.id] == null ? '\u2014' : cells[c.id])) + '</td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table></div></div>';
    return h;
  }

  function stepsHtml(sec, managerId) {
    var h = '';
    if (sec.officialSource) {
      h += '<div class="c10-sec-note"><strong>Official source:</strong> ' + esc(sec.officialSource) + '</div>';
    }
    if (sec.policyNote) h += '<div class="c10-sec-note">' + esc(sec.policyNote) + '</div>';
    var choices = arr(sec.hostChoices);
    if (choices.length) {
      var chosen = ui.setupHost[managerId + ':' + sec.id] || 0;
      h += '<div class="c10-sec-note" style="margin-bottom:4px"><strong>Install to exactly:</strong></div><div class="c10-opts" style="margin-bottom:8px">';
      choices.forEach(function (ch, i) {
        h += '<button type="button" class="c10-opt' + (i === chosen ? ' is-on' : '') + '" role="radio" aria-checked="' + (i === chosen) + '"' +
          ' data-act="setup-host:' + esc(managerId) + ':' + esc(sec.id) + ':' + i + '">' +
          '<span class="c10-dot"></span><span>' + esc(ch.label) + '</span><span></span></button>';
      });
      h += '</div>';
    }
    h += '<div class="c10-steps">';
    arr(sec.steps).forEach(function (s) {
      h += '<div class="c10-step"><span class="c10-step-n">' + esc(String(s.n || '')) + '</span>' +
        '<span><span class="c10-step-t">' + esc(s.label || s.title || '') + '</span>' +
        (s.detail ? '<div class="c10-step-d">' + esc(s.detail) + '</div>' : '') + '</span></div>';
    });
    h += '</div>';
    return h;
  }

  function logHtml(sec) {
    var h = '';
    if (arr(sec.sources).length) {
      arr(sec.sources).forEach(function (s) { h += rosterItemHtml(s, sec.id); });
    }
    if (obj(sec.loading).state) {
      h += '<div class="c10-sec-note"><span class="c10-refresh-note">' + ico('refresh') + esc(obj(sec.loading).note || 'Refreshing…') + '</span></div>';
    }
    var entries = arr(sec.entries);
    if (!entries.length && !arr(sec.sources).length) {
      h += '<div class="c10-empty">Nothing recorded yet.</div>';
    }
    entries.slice(0, 30).forEach(function (e) {
      h += '<div class="c10-log-row"><span class="c10-log-when">' + esc(e.at ? fmtAgo(e.at) : '') + '</span>' +
        '<span class="c10-log-what"><strong>' + esc(e.label || '') + '</strong>' +
        (e.detail ? ' — ' + esc(e.detail) : '') + '</span></div>';
    });
    return h;
  }

  function healthHtml(sec) {
    var h = '';
    arr(sec.checks).forEach(function (c) {
      var inner = '<span><span class="c10-check-label">' + esc(c.label) + '</span>' +
        (c.note ? '<div class="c10-check-note">' + esc(c.note) + '</div>' : '') + '</span>' +
        '<span class="c10-word ' + tone2cls(c.tone) + '">' + esc(c.state || '') + '</span>';
      if (c.dest) {
        h += '<button type="button" class="c10-check" data-object-id="' + esc(c.id) + '"' + goAttr(c.dest) + '>' + inner + '</button>';
      } else {
        h += '<div class="c10-check" data-object-id="' + esc(c.id) + '">' + inner + '</div>';
      }
    });
    return h;
  }

  function rosterHtml(sec, managerId) {
    var h = '';
    if (arr(sec.groups).length) {
      arr(sec.groups).forEach(function (g) {
        h += '<div class="c10-sec-label">' + esc(g.label || '') + '<span class="c10-rule"></span></div>';
        arr(g.items).forEach(function (it) { h += rosterItemHtml(it, managerId); });
      });
    } else {
      arr(sec.items).forEach(function (it) { h += rosterItemHtml(it, managerId); });
    }
    return h;
  }

  function sectionHtml(sec, managerId) {
    if (!sec) return '';
    var h = '<div class="c10-sec" data-section="' + esc(sec.id) + '">';
    h += '<div class="c10-sec-head"><span class="c10-sec-title">' + esc(sec.title || '') + '</span>';
    if (obj(sec.status).label) {
      h += '<span class="c10-word ' + tone2cls(obj(sec.status).tone) + '">' + esc(obj(sec.status).label) + '</span>';
    }
    h += '</div>';
    if (sec.note) h += '<p class="c10-sec-note">' + esc(sec.note) + '</p>';

    var kind = sec.kind;
    if (kind === 'overview') {
      h += qaRows(arr(sec.items).length ? sec.items : sec.rows);
      h += whatNextHtml(sec.whatNext);
    } else if (kind === 'roster') {
      h += rosterHtml(sec, managerId);
    } else if (kind === 'form') {
      h += qaRows(sec.fields);
    } else if (kind === 'table') {
      h += tableHtml(sec);
    } else if (kind === 'steps') {
      h += stepsHtml(sec, managerId);
    } else if (kind === 'log') {
      h += logHtml(sec);
    } else if (kind === 'health') {
      h += healthHtml(sec);
    } else if (kind === 'preview' && (sec.counts || arr(sec.conflicts).length)) {
      /* Staged-import preview: {state, source, counts, conflicts[], invalid,
         legacyMigrated, restorePointId} — not items/rows, so the generic
         projection below cannot see it. */
      var pv = obj(sec);
      var src = obj(pv.source);
      var counts = obj(pv.counts);
      if (src.file) {
        h += '<p class="c10-sec-note">Staged file ' + esc(src.file) +
          (src.createdOn ? ' from ' + esc(src.createdOn) : '') +
          (src.mode ? ' · ' + esc(src.mode) : '') +
          (pv.state ? ' · ' + esc(String(pv.state)) : '') + '</p>';
      }
      h += qaRows([
        counts.add != null ? { label: 'Will be added', valueLabel: String(counts.add) } : null,
        counts.change != null ? { label: 'Will change', valueLabel: String(counts.change) } : null,
        counts.conflict != null ? { label: 'Conflicts', valueLabel: String(counts.conflict), note: counts.conflict ? 'Held out of an apply until resolved' : null } : null,
        counts.invalid != null ? { label: 'Invalid entries', valueLabel: String(counts.invalid) } : null,
        counts.legacyMigrated != null ? { label: 'Migrated from legacy keys', valueLabel: String(counts.legacyMigrated) } : null
      ]);
      if (arr(pv.conflicts).length) {
        h += tableHtml({
          columns: [
            { id: 'setting', label: 'Conflicting setting' },
            { id: 'local', label: 'This project' },
            { id: 'incoming', label: 'Incoming' },
            { id: 'note', label: 'Why' }
          ],
          rows: arr(pv.conflicts).map(function (c) {
            var rec = settingIx[c.settingId];
            return { id: c.settingId, dest: c.dest, cells: {
              setting: rec ? rec.label : c.settingId,
              local: c.local != null ? c.local : '—',
              incoming: c.incoming != null ? c.incoming : '—',
              note: c.note || 'Both sides changed this value.'
            } };
          })
        });
        if (pv.restorePointId) h += '<p class="c10-sec-note">Restore point ' + esc(pv.restorePointId) + ' covers a full rollback.</p>';
      }
    } else {
      /* preview + anything future: best-effort generic projection */
      if (arr(sec.items).length) h += qaRows(sec.items);
      else if (arr(sec.rows).length && obj(arr(sec.rows)[0]).cells) h += tableHtml(sec);
      else if (arr(sec.rows).length) h += qaRows(sec.rows);
      else if (arr(sec.fields).length) h += qaRows(sec.fields);
      else if (arr(sec.entries).length) h += logHtml(sec);
      else if (arr(sec.checks).length) h += healthHtml(sec);
    }
    h += '</div>';
    return h;
  }

  function sectionsBlock(sections, managerId) {
    var h = '';
    var advanced = [];
    arr(sections).forEach(function (sec) {
      if (sec && sec.advanced) { advanced.push(sec); return; }
      h += sectionHtml(sec, managerId);
    });
    advanced.forEach(function (sec) {
      var key = managerId + ':' + sec.id;
      var openA = !!ui.secOpen[key];
      h += '<button type="button" class="c10-advbar" data-act="sec-adv:' + esc(key) + '" aria-expanded="' + openA + '">' +
        ico(openA ? 'minus' : 'plus') + esc(sec.title || 'Advanced') + '<span class="c10-rule"></span></button>';
      if (openA) h += sectionHtml(sec, managerId);
    });
    return h;
  }

  function actionsStrip(def) {
    var acts = [];
    try { acts = arr(def.actions(store)); } catch (e) { acts = []; }
    if (!acts.length) return '';
    var h = '<div class="c10-actions-strip">';
    var reasons = '';
    acts.forEach(function (a) {
      if (!a || !a.id) return;
      if (a.available === false) {
        h += '<button type="button" class="c10-btn" aria-disabled="true" title="' + esc(a.reason || 'Not available right now.') + '"' +
          ' data-act="mgr-action-blocked:' + esc(def.id) + ':' + esc(a.id) + '">' +
          (a.ico ? ico(a.ico) : '') + esc(a.label) + '</button>';
        reasons += '<div class="c10-sec-note">' + esc(a.label) + ' — ' + esc(a.reason || 'not available right now.') + '</div>';
      } else {
        h += '<button type="button" class="c10-btn" data-act="mgr-action:' + esc(def.id) + ':' + esc(a.id) + '">' +
          (a.ico ? ico(a.ico) : '') + esc(a.label) + '</button>';
      }
    });
    h += '</div>' + reasons;
    return h;
  }

  function managerNavHtml(def, vm, v) {
    var h = '';
    h += '<div class="c10-ix-label" style="padding:6px 16px 4px">' + esc(def.title) + '</div>';
    h += '<button type="button" class="c10-item' + (!v.objectId ? ' is-active' : '') + '" data-manager="' + esc(def.id) + '"' +
      goAttr({ route: 'manager', managerId: def.id }) + '>' +
      '<span class="c10-item-main"><span class="c10-item-title">Overview</span></span>' +
      '<span class="c10-item-meta"></span><span class="c10-chev">' + ico('external') + '</span></button>';
    var pages = obj(vm.pages);
    var keys = Object.keys(pages);
    if (keys.length) {
      /* Audit 2026-08-21 round-4 finding 7: at one-pane width the roster is
         height-capped and showed 4 of 9 objects with nothing saying so. The
         label now carries the total, so the list states its own size whether
         or not the reader scrolls it. */
      h += '<div class="c10-sec-label">Objects<span class="c10-rule"></span>' +
        '<span class="c10-sec-count">' + fmtInt(keys.length) + '</span></div>';
      keys.forEach(function (k) {
        var p = pages[k];
        var st = obj(p.status);
        h += '<button type="button" class="c10-item' + (v.objectId === k ? ' is-active' : '') + '" data-object-id="' + esc(k) + '"' +
          goAttr({ route: 'manager', managerId: def.id, objectId: k, tab: arr(p.tabs)[0] || null }) + '>' +
          '<span class="c10-item-main"><span class="c10-item-title">' + esc(p.title || k) + '</span></span>' +
          '<span class="c10-item-meta"><span class="c10-word ' + tone2cls(st.tone) + '">' + esc(st.label || '') + '</span></span>' +
          '<span class="c10-chev">' + ico('external') + '</span></button>';
      });
    } else {
      var secs = arr(vm.sections);
      if (secs.length > 2 && !v.objectId) {
        h += '<div class="c10-sec-label">Sections<span class="c10-rule"></span></div>';
        secs.forEach(function (s) {
          h += '<button type="button" class="c10-item" data-act="sec-jump:' + esc(def.id) + ':' + esc(s.id) + '">' +
            '<span class="c10-item-main"><span class="c10-item-title">' + esc(s.title || s.id) + '</span></span>' +
            '<span class="c10-item-meta">' + (s.advanced ? 'advanced' : '') + '</span>' +
            '<span class="c10-chev">' + ico('external') + '</span></button>';
        });
      }
    }
    return h;
  }

  function managerPane(v, anim, withBack) {
    var def = mgrDef(v.managerId);
    if (!def) return paneShell('mgr', 'c10-pane-flex', '', '<div class="c10-empty">Unknown manager.</div>', anim);
    var vm = null;
    try { vm = def.model(store); } catch (e) { vm = null; }
    if (!vm) {
      return paneShell('mgr:' + def.id, 'c10-pane-flex',
        paneHead('Manager', def.title, null, null, withBack ? paneParentName() : null, { route: 'dest', cat: def.cat }),
        '<div class="c10-empty">This manager could not load its view model.</div>', anim);
    }
    var deferred = def.status === 'deferred_named_owner';
    var pages = obj(vm.pages);
    var page = v.objectId ? pages[v.objectId] : null;

    var main = '<div class="c10-mgr-main-inner">';
    main += '<div class="c10-mgr-head"><h2 class="c10-mgr-h1">' + esc(page ? page.title : (vm.title || def.title));
    if (page && obj(page.status).label) {
      main += '<span class="c10-word ' + tone2cls(obj(page.status).tone) + '">' + esc(obj(page.status).label) + '</span>';
    }
    if (vm.readOnly || deferred) main += '<span class="c10-ro-tag">Read-only</span>';
    main += '</h2>';
    if (!page) main += '<p class="c10-mgr-blurb">' + esc(vm.blurb || def.blurb || '') + '</p>';
    main += '</div>';

    if (deferred) {
      var ic = obj(def.insertionContract);
      main += '<div class="c10-owner-box"><strong>Reserved for its owner module.</strong> ' +
        esc(vm.summary || '') +
        '<div style="margin-top:6px"><strong>Owner:</strong> ' + esc(def.owner || 'named owner') + '</div>' +
        (ic.returnContract ? '<div style="margin-top:4px">' + esc(ic.returnContract) + '</div>' : '') +
        (ic.deepLink ? '<span class="c10-mono">' + esc(ic.deepLink) + '</span>' : '') +
        '</div>';
    } else if (vm.summary) {
      main += '<p class="c10-mgr-blurb">' + esc(vm.summary) + '</p>';
    }

    if (obj(store.data.loadingCached).active && !page) {
      main += '<span class="c10-refresh-note">' + ico('refresh') +
        esc(obj(store.data.loadingCached).note || 'Cached values shown while a refresh runs.') + '</span>';
    }

    if (!page && !deferred) main += actionsStrip(def);

    if (page) {
      /* object page with tabs */
      var tabs = arr(page.tabs);
      var activeTab = v.tab && tabs.indexOf(v.tab) >= 0 ? v.tab : tabs[0];
      main += '<div class="c10-tabs" role="tablist">';
      tabs.forEach(function (t) {
        var sec = obj(page.sections)[t];
        var label = sec && sec.title ? sec.title : t.replace(/^./, function (m) { return m.toUpperCase(); });
        main += '<button type="button" role="tab" aria-selected="' + (t === activeTab) + '" class="c10-tab' + (t === activeTab ? ' is-active' : '') + '" data-tab="' + esc(t) + '"' +
          goAttr({ route: 'manager', managerId: def.id, objectId: v.objectId, tab: t }) + '>' + esc(label) + '</button>';
      });
      main += '</div>';
      main += sectionHtml(obj(page.sections)[activeTab], def.id);
    } else {
      main += sectionsBlock(vm.sections, def.id);
    }
    main += '</div>';

    var body =
      '<div class="c10-mgr">' +
      '<nav class="c10-mgr-nav c10-scroll" data-panekey="mgrnav:' + esc(def.id) + '" aria-label="' + esc(def.title) + ' navigation">' +
      managerNavHtml(def, vm, v) + '</nav>' +
      '<div class="c10-mgr-main c10-scroll" data-panekey="mgrmain:' + esc(def.id) + ':' + esc(v.objectId || '') + ':' + esc(v.tab || '') + '">' + main + '</div>' +
      '</div>';

    var head = paneHead('Manager', def.title, null, null,
      withBack ? paneParentName() : null,
      v.objectId ? { route: 'manager', managerId: def.id } : { route: 'dest', cat: def.cat });

    /* manager pane hosts its own two internal columns (roster/detail):
       the strip's multi-pane geometry continues inside the workspace */
    return '<section class="c10-pane c10-pane-flex' + (anim ? ' ' + anim : '') + '" data-pane="mgr">' +
      head + body + '</section>';
  }

  /* ============================ All Settings (virtualized) ================ */

  /* Virtual-list row height. One-pane width stacks the location under the
     setting name so the VALUE column survives the narrow layout, which costs
     one extra text line; the spacer maths has to follow the CSS. */
  var ROWH = 34;
  var ROWH_NARROW = 46;
  function rowH() { return ui.mode === 1 ? ROWH_NARROW : ROWH; }

  function buildAllIndex() {
    if (ui.allIndex) return ui.allIndex;
    var out = [];
    arr(INV.settings).forEach(function (s) {
      var row = store.resolveRow(s.id);
      if (!row) return;
      out.push({
        id: s.id, label: row.label, cat: s.cat, sub: s.sub, type: s.type,
        tier: s.tier, changed: row.changedFromDefault, state: row.state,
        valueLabel: row.valueLabel || '', stress: false,
        hay: (row.label + ' ' + s.id + ' ' + arr(s.search).join(' ')).toLowerCase()
      });
    });
    var S = window.PM2.states;
    if (S && S.stressActive && S.stressActive() && S.stressRecords) {
      arr(S.stressRecords()).forEach(function (r) {
        out.push({
          id: r.id, label: r.label || r.id, cat: r.cat || 'system', sub: 'stress',
          type: r.type || 'text', tier: 'advanced', changed: false, state: 'normal',
          valueLabel: '\u2014', stress: true,
          hay: ((r.label || '') + ' ' + r.id + ' ' + arr(r.search).join(' ')).toLowerCase()
        });
      });
    }
    ui.allIndex = out;
    return out;
  }

  function filterAll() {
    var ix = buildAllIndex();
    var f = ui.all;
    var q = f.q.trim().toLowerCase();
    var toks = q ? q.split(/\s+/) : [];
    var out = ix.filter(function (r) {
      if (f.cat && r.cat !== f.cat) return false;
      if (f.type && r.type !== f.type) return false;
      if (f.tier && r.tier !== f.tier) return false;
      if (f.state && r.state !== f.state) return false;
      if (f.changed && !r.changed) return false;
      for (var i = 0; i < toks.length; i++) {
        if (r.hay.indexOf(toks[i]) < 0) return false;
      }
      return true;
    });
    ui.allFiltered = out;
    return out;
  }

  function allPane(anim, withBack) {
    var rows = filterAll();
    var f = ui.all;
    var typeOpts = ['select', 'toggle', 'number', 'slider', 'radio', 'text', 'path', 'list', 'multiselect', 'keyvalue', 'action'];
    var stateOpts = ['normal', 'managed', 'unavailable', 'restart-required', 'reconnect-required', 'changed-elsewhere', 'error'];
    var h = '<div class="c10-all">';
    if (ui.view.missing) {
      h += '<div class="c10-copy-intro">The link pointed at <span class="c10-mono">' + esc(ui.view.missing) +
        '</span>, which is not in this project’s inventory. Here is the complete index instead — filter or search to find the nearest match.</div>';
    }
    h += '<div class="c10-facets">' +
      '<input type="text" class="c10-input" id="c10AllQ" data-fid="allq" placeholder="Filter this list…" value="' + esc(f.q) + '" aria-label="Filter All Settings" style="width:180px">' +
      '<label class="c10-facet">Category <select id="c10AllCat"><option value="">All</option>' +
      arr(INV.categories).map(function (c) {
        return '<option value="' + esc(c.id) + '"' + (f.cat === c.id ? ' selected' : '') + '>' + esc(c.title) + '</option>';
      }).join('') + '</select></label>' +
      '<label class="c10-facet">Type <select id="c10AllType"><option value="">All</option>' +
      typeOpts.map(function (t) { return '<option value="' + t + '"' + (f.type === t ? ' selected' : '') + '>' + esc(typeLabel(t)) + '</option>'; }).join('') +
      '</select></label>' +
      '<label class="c10-facet">Tier <select id="c10AllTier"><option value="">All</option>' +
      '<option value="simple"' + (f.tier === 'simple' ? ' selected' : '') + '>Everyday</option>' +
      '<option value="advanced"' + (f.tier === 'advanced' ? ' selected' : '') + '>Advanced</option></select></label>' +
      '<label class="c10-facet">State <select id="c10AllState"><option value="">All</option>' +
      stateOpts.map(function (s) { return '<option value="' + s + '"' + (f.state === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
      '</select></label>' +
      '<button type="button" class="c10-facet-check' + (f.changed ? ' is-on' : '') + '" data-act="all-changed" aria-pressed="' + f.changed + '">Changed from default</button>' +
      '<span class="c10-all-count">' + fmtInt(rows.length) + ' of ' + fmtInt(buildAllIndex().length) + '</span>' +
      '</div>';
    h += '<div class="c10-vhead"><span>Setting</span><span>Location</span><span>Type</span><span>Tier</span><span>Value</span></div>';
    h += '<div class="c10-vlist c10-scroll" id="c10VList" data-panekey="all"><div id="c10VSpacerTop"></div><div id="c10VRows"></div><div id="c10VSpacerBot"></div></div>';
    h += '</div>';
    var head = paneHead('Compendium', 'All Settings', fmtInt(buildAllIndex().length) + ' records',
      'The complete long-tail index. Rows open in their home section.',
      withBack ? 'Settings Home' : null, { route: 'home' });
    return paneShell('all', 'c10-pane-flex', head, h, anim, true);
  }

  /* Windowed rendering: only ~2 viewports of rows exist in the DOM.
     Slint: ListView over a filtered model handles this natively. */
  function bindAllList() {
    var list = document.getElementById('c10VList');
    if (!list) return;
    var render = function () { renderAllWindow(); };
    list.addEventListener('scroll', function () { requestAnimationFrame(render); });
    renderAllWindow();
  }

  function renderAllWindow() {
    var list = document.getElementById('c10VList');
    var rowsEl = document.getElementById('c10VRows');
    var top = document.getElementById('c10VSpacerTop');
    var bot = document.getElementById('c10VSpacerBot');
    if (!list || !rowsEl) return;
    var rows = ui.allFiltered || filterAll();
    var vh = list.clientHeight || 600;
    var rh = rowH();
    var start = Math.max(0, Math.floor(list.scrollTop / rh) - 8);
    var count = Math.ceil(vh / rh) + 16;
    var end = Math.min(rows.length, start + count);
    top.style.height = (start * rh) + 'px';
    bot.style.height = ((rows.length - end) * rh) + 'px';
    var h = '';
    for (var i = start; i < end; i++) {
      var r = rows[i];
      h += '<button type="button" class="c10-vrow' + (r.stress ? ' is-stress' : '') + '" data-setting-id="' + esc(r.id) + '"' +
        (r.stress ? ' data-act="stress-row"' : goAttr({ route: 'setting', settingId: r.id })) + '>' +
        '<span class="c10-vname">' + esc(r.label) + (r.stress ? '<span class="c10-stress-tag">Stress fixture</span>' : '') + '</span>' +
        '<span class="c10-vpath">' + esc(catTitle(r.cat)) + (r.stress ? ' \u203A Stress overlay' : ' \u203A ' + esc(subTitle(r.cat, r.sub))) + '</span>' +
        '<span class="c10-vtype">' + esc(typeLabel(r.type)) + '</span>' +
        '<span class="c10-vtype">' + esc(r.tier === 'simple' ? 'Everyday' : 'Advanced') + '</span>' +
        '<span class="' + (r.changed ? 'c10-vname' : 'c10-vval') + '">' + esc(humanValue(r.valueLabel) || '\u2014') + '</span>' +
        '</button>';
    }
    rowsEl.innerHTML = h;
    if (window.PMIcons && window.PMIcons.hydrate) window.PMIcons.hydrate(rowsEl);
  }

  /* ============================ copy transaction ========================= */

  function copyPane(anim, narrowMode, withBack) {
    var c = ui.copy;
    var narrow = !!narrowMode || ui.mode === 1;
    var layout = narrow ? 'is-narrow'
      : ((stage && stage.clientWidth >= 1560 && ui.mode === 3) ? 'is-grid4' : 'is-grid2');
    var sources = [];
    try { sources = arr(window.PM2.copy.sources()); } catch (e) { sources = []; }
    var h = '<div class="c10-copy">';
    h += '<div class="c10-copy-intro"><strong>Copy Settings from another project</strong> — a one-time transaction: ' +
      'pick a source, choose categories, preview every change, then apply atomically with a restore point. ' +
      'The two projects stay fully independent afterward; nothing links or syncs.</div>';

    var rb = obj(obj(store.data.settingsLifecycle).rollbackJustCompleted);
    if (rb.receiptId && hasFx('fx.rollback-complete')) {
      h += '<div class="c10-copy-intro">' + ico('check') + ' A previous settings rollback completed: ' + esc(rb.detail || '') +
        ' <span class="c10-mono">' + esc(rb.receiptId) + '</span></div>';
    }

    h += '<div class="c10-copy-strip ' + layout + '">';
    h += copyStage1(sources, narrow);
    h += copyStage2(sources, narrow);
    h += copyStage3(narrow);
    h += copyStage4(narrow);
    h += '</div></div>';
    var head = paneHead('Transaction', 'Copy Settings', null,
      null, (narrow || withBack) ? 'Settings Home' : null, { route: 'home' });
    return paneShell('copy', 'c10-pane-flex', head, h, anim, true);
  }

  function stageShell(n, title, state, inner, narrow, hint) {
    var cls = 'c10-stagep' + (state.active ? ' is-active' : '') + (state.done ? ' is-done' : '') + (!state.reached && !state.active ? ' is-locked' : '');
    var head = '<div class="c10-stagep-head"><span class="c10-stagep-n">' + n + '</span>' +
      '<span class="c10-stagep-t">' + esc(title) + '</span></div>';
    if (narrow && !state.active) {
      /* narrow: only the active stage carries its controls, but every stage
         still says what it will do — a numbered header over an empty band
         explains nothing. */
      var jump = state.done ? ' role="button" tabindex="0" data-act="copy-stage:' + (n - 1) + '"' : '';
      return '<div class="' + cls + '"><div' + jump + ' class="c10-stagep-head" style="cursor:' + (state.done ? 'pointer' : 'default') + '">' +
        '<span class="c10-stagep-n">' + n + '</span><span class="c10-stagep-t">' + esc(title) + '</span></div>' +
        (hint ? '<div class="c10-stagep-body is-collapsed"><div class="c10-locked-note">' + esc(hint) + '</div></div>' : '') +
        '</div>';
    }
    return '<div class="' + cls + '">' + head + '<div class="c10-stagep-body c10-scroll" data-panekey="copy' + n + '">' + inner + '</div></div>';
  }

  function copyStage1(sources, narrow) {
    var c = ui.copy;
    /* Audit 2026-08-21 round-4 finding 8: this sentence used to be appended
       AFTER the five source cards, and in the four-column strip at 1280 the
       stage body is a fixed-height box the cards very nearly fill — so the
       sentence was sliced through its baseline by the box's bottom edge, its
       descenders gone, with the panel divider immediately under the cut. It
       reads as a rule about what the list below offers, so it belongs above
       the list: first in the box it can never be the thing that is clipped,
       and what scrolls instead is the card list, which is honest scrolling.
       (The card metrics below were also trimmed so the five cards fit the box
       outright in every theme.) */
    var inner = '<div class="c10-locked-note" style="margin-bottom:8px">' +
      'Only values the source changed from its defaults are offered.</div>';
    sources.forEach(function (s) {
      inner += '<button type="button" class="c10-src' + (c.sourceId === s.id ? ' is-active' : '') + '" data-act="copy-src:' + esc(s.id) + '">' +
        '<span class="c10-src-name">' + esc(s.name) + (s.legacy ? '<span class="c10-legacy-tag">Legacy export</span>' : '') + '</span>' +
        '<div class="c10-src-meta">Updated ' + esc(fmtAgo(s.lastUpdated)) + ' · ' +
        arr(s.categorySummaries).reduce(function (a, x) { return a + x.count; }, 0) + ' divergent values in ' +
        arr(s.categorySummaries).length + ' categories</div></button>';
    });
    return stageShell(1, 'Select source', { active: c.stage === 0, done: c.stage > 0, reached: true }, inner, narrow,
      c.stage > 0 ? 'Source chosen. Tap this step to pick a different project.'
                  : 'Only values the source changed from its defaults are offered.');
  }

  function copyStage2(sources, narrow) {
    var c = ui.copy;
    var st = { active: c.stage === 1, done: c.stage > 1, reached: c.stage >= 1 };
    var inner = '';
    if (!st.reached) {
      inner = '<div class="c10-locked-note">Choose a source project first.</div>';
    } else {
      var src = null;
      sources.forEach(function (s) { if (s.id === c.sourceId) src = s; });
      var cats = src ? arr(src.categorySummaries) : [];
      inner += '<div class="c10-editor-actions" style="margin:0 0 8px">' +
        '<button type="button" class="c10-btn" data-act="copy-cats-all">Select all</button>' +
        '<button type="button" class="c10-btn" data-act="copy-cats-none">Clear</button></div>';
      cats.forEach(function (cs) {
        var on = !!c.cats[cs.cat];
        inner += '<button type="button" class="c10-catpick' + (on ? ' is-on' : '') + '" aria-pressed="' + on + '" data-act="copy-cat:' + esc(cs.cat) + '">' +
          '<span class="c10-box"></span><span>' + esc(cs.title || catTitle(cs.cat)) + '</span>' +
          '<span class="c10-catn">' + fmtInt(cs.count) + '</span></button>';
      });
      var chosen = Object.keys(c.cats).filter(function (k) { return c.cats[k]; }).length;
      inner += '<div class="c10-editor-actions" style="margin-top:10px">' +
        '<button type="button" class="c10-btn is-primary"' + (chosen ? '' : ' aria-disabled="true"') + ' data-act="copy-preview">' +
        'Preview changes</button>' +
        '<span class="c10-ctl-note">' + chosen + ' of ' + cats.length + ' categories</span></div>';
    }
    return stageShell(2, 'Choose categories', st, inner, narrow,
      !st.reached ? 'Choose a source project first.'
                  : 'Categories chosen. Tap this step to change the selection.');
  }

  var KINDS = ['add', 'replace', 'unchanged', 'unavailable', 'conflict'];
  var KIND_WORD = { add: 'New here', replace: 'Replaces', unchanged: 'Same', unavailable: 'Unavailable', conflict: 'Conflict' };

  function copyStage3(narrow) {
    var c = ui.copy;
    var st = { active: c.stage === 2, done: c.stage > 2, reached: c.stage >= 2 };
    var inner = '';
    if (!st.reached || !c.preview) {
      inner = '<div class="c10-locked-note">The preview appears once categories are chosen. It lists every addition, replacement, unchanged value, unavailable value, and conflict before anything is applied.</div>';
    } else {
      var p = c.preview;
      inner += '<div class="c10-counts">';
      KINDS.forEach(function (k) {
        var n = obj(p.counts)[k] || 0;
        var on = c.kindFilter === k;
        inner += '<button type="button" class="c10-countchip k-' + k + (on ? ' is-on' : '') + '" data-act="copy-kind:' + k + '" aria-pressed="' + on + '">' +
          '<strong>' + n + '</strong>' + esc(KIND_WORD[k]) + '</button>';
      });
      inner += '</div>';
      var items = arr(p.items).filter(function (it) { return !c.kindFilter || it.kind === c.kindFilter; });
      items.forEach(function (it, i) {
        var key = it.settingId + ':' + i;
        var openI = !!c.inspect[key];
        inner += '<div class="c10-citem">' +
          '<button type="button" class="c10-citem-top" data-act="copy-inspect:' + esc(key) + '" aria-expanded="' + openI + '">' +
          '<span class="c10-citem-kind k-' + esc(it.kind) + '">' + esc(KIND_WORD[it.kind] || it.kind) + '</span>' +
          '<span class="c10-citem-label">' + esc(it.label) + '</span>' +
          '<span class="c10-citem-cat">' + esc(catTitle(it.cat)) + '</span></button>';
        if (openI) {
          inner += '<div class="c10-citem-body"><dl class="c10-diff">';
          if (it.kind !== 'add') {
            inner += '<dt>Current</dt><dd>' + esc(valStr(it.current)) + '</dd>';
          }
          inner += '<dt>Incoming</dt><dd class="is-incoming">' + esc(valStr(it.incoming)) + '</dd>';
          inner += '</dl>';
          if (it.note) inner += '<div class="c10-citem-note">' + esc(it.note) + '</div>';
          if (it.kind === 'unavailable' || it.kind === 'conflict') {
            inner += '<div class="c10-citem-note">This row will <strong>not</strong> be applied by the transaction.</div>';
          }
          inner += '</div>';
        }
        inner += '</div>';
      });
      inner += '<div class="c10-cred-note">' + esc(p.credentialNote || '') + '</div>';
      inner += '<div class="c10-editor-actions" style="margin-top:10px">' +
        '<button type="button" class="c10-btn is-primary" data-act="copy-tostage:3">Continue to confirm</button></div>';
    }
    return stageShell(3, 'Preview changes', st, inner, narrow,
      (!st.reached || !c.preview)
        ? 'The preview appears once categories are chosen. It lists every addition, replacement, unchanged value, unavailable value, and conflict before anything is applied.'
        : 'Preview ready. Tap this step to re-read every change.');
  }

  function valStr(v) {
    if (v == null) return '\u2014';
    if (typeof v === 'object') { try { return JSON.stringify(v); } catch (e) { return String(v); } }
    return String(v);
  }

  function copyStage4(narrow) {
    var c = ui.copy;
    var st = { active: c.stage === 3, done: !!c.receipt, reached: c.stage >= 3 };
    var inner = '';
    if (!st.reached || !c.preview) {
      inner = '<div class="c10-locked-note">Confirming creates a restore point, applies the copy atomically, verifies the result, and hands back a receipt with a working rollback.</div>';
    } else if (c.receipt) {
      inner += '<div class="c10-receipt"><div class="c10-receipt-title">' + ico('check') +
        (c.rolledBack ? 'Copy rolled back' : 'Copy applied and verified') + '</div>' +
        '<div class="c10-receipt-line">' + fmtInt(c.receipt.applied) + ' value(s) ' + (c.rolledBack ? 'were restored exactly from the restore point.' : 'applied atomically from ' + esc(c.preview.sourceName || 'the source') + '.') + '</div>' +
        '<div class="c10-receipt-line">Skipped: ' + obj(c.receipt.skipped).unchanged + ' already matched · ' +
        obj(c.receipt.skipped).unavailable + ' unavailable · ' + obj(c.receipt.skipped).conflict + ' conflicted.</div>' +
        '<div class="c10-receipt-line">Receipt <span class="c10-mono">' + esc(c.receipt.receiptId) + '</span> · restore point <span class="c10-mono">' + esc(c.receipt.restorePointId) + '</span></div>' +
        '<div class="c10-receipt-line">The source and this project remain independent. Future source changes never propagate.</div>' +
        '</div>';
      inner += '<div class="c10-editor-actions" style="margin-top:10px">';
      if (!c.rolledBack) {
        inner += '<button type="button" class="c10-btn" data-act="copy-rollback">' + ico('undo') + 'Roll back this copy</button>';
      }
      inner += '<button type="button" class="c10-btn" data-act="copy-restart">Start another copy</button></div>';
    } else {
      var p = c.preview;
      var applying = c.applying;
      inner += '<div class="c10-confirm-box">';
      inner += '<div class="c10-confirm-line">Applies <strong>' + fmtInt(obj(p.counts).add + obj(p.counts).replace) +
        ' value(s)</strong> from <strong>' + esc(p.sourceName || '') + '</strong> to Puppet Master. ' +
        obj(p.counts).unavailable + ' unavailable and ' + obj(p.counts).conflict + ' conflicted value(s) stay untouched.</div>';
      inner += '<div class="c10-confirm-line">A restore point is created first; apply is atomic and verified; the receipt can undo the whole transaction. This is a one-time copy — nothing stays linked.</div>';
      if (c.error) inner += '<div class="c10-err">' + esc(c.error) + '</div>';
      if (applying && c.op) {
        var o = c.op;
        var pct = (o.progressKind === 'determinate' && o.total) ? Math.round(100 * o.completed / o.total) : null;
        inner += '<div class="c10-op-line">' + ico('hourglass') + '<span>' + esc(o.phase || o.status || 'working') + '</span>' +
          (pct != null ? '<span class="c10-meter"><span style="width:' + pct + '%"></span></span><span>' + o.completed + ' / ' + o.total + '</span>'
                       : '<span class="c10-meter"><span style="width:100%;opacity:.35"></span></span>') +
          '</div>';
      }
      if (!applying) {
        inner += '<label class="c10-facet" style="gap:8px">Type <strong>COPY</strong> to confirm ' +
          '<input type="text" class="c10-input" id="c10CopyConfirm" data-fid="copyconfirm" value="' + esc(c.confirm) + '" autocomplete="off" spellcheck="false" style="width:110px"></label>';
        var armed = c.confirm.trim().toUpperCase() === 'COPY';
        inner += '<div class="c10-editor-actions">' +
          '<button type="button" class="c10-btn is-primary"' + (armed ? '' : ' aria-disabled="true"') + ' data-act="copy-apply">' +
          ico('check') + 'Apply the copy</button>' +
          '<button type="button" class="c10-btn" data-act="copy-stage:2">Back to preview</button></div>';
      }
      inner += '</div>';
    }
    return stageShell(4, 'Confirm & receipt', st, inner, narrow,
      c.receipt ? 'Copy complete. Tap this step to re-read the receipt or roll it back.'
                : 'Confirming creates a restore point, applies the copy atomically, verifies the result, and hands back a receipt with a working rollback.');
  }

  /* ============================ footer strip ============================ */

  function renderFoot() {
    var sc = scenario();
    var hints =
      '<span><kbd class="c10-kbd">\u2191\u2193</kbd> move</span>' +
      '<span><kbd class="c10-kbd">Enter</kbd> open</span>' +
      '<span><kbd class="c10-kbd">\u2190</kbd> back</span>' +
      '<span><kbd class="c10-kbd">Ctrl</kbd><kbd class="c10-kbd">K</kbd> search</span>' +
      '<span><kbd class="c10-kbd">Esc</kbd> close / back</span>';
    var status = '';
    var op = ui.ops[0];
    if (op && !isTerminalOp(op)) {
      status = ico('hourglass') + esc(opLine(op));
    } else if (ui.lastStatus) {
      status = ico('info') + esc(ui.lastStatus);
    } else if (op) {
      status = ico('check') + esc(opLine(op));
    }
    if (sc !== 'baseline') {
      status += (status ? ' · ' : '') + 'Scenario: ' + esc(sc);
    }
    elFoot.innerHTML = '<div class="c10-hints">' + hints + '</div>' +
      '<span class="c10-foot-status">' + status + '</span>';
  }

  function isTerminalOp(o) {
    return ['done', 'failed', 'degraded', 'retryable', 'canceled', 'recovery-required'].indexOf(o.status) >= 0;
  }
  function opLine(o) {
    var s = o.name + ' \u2014 ' + o.status;
    if (o.phase) s += ' (' + o.phase + (o.progressKind === 'determinate' ? ' ' + o.completed + '/' + o.total : '') + ')';
    return s;
  }

  /* ============================ universal search ========================= */

  function bigSearchInput() { return document.getElementById('c10BigSearch'); }
  function miniSearchInput() { return document.getElementById('c10MiniSearch'); }
  function activeSearchInput() {
    return ui.search.anchor === 'mini' ? miniSearchInput() : bigSearchInput();
  }

  function runSearch(q, anchor, keepFocusIndex) {
    ui.search.q = q;
    ui.search.anchor = anchor;
    var trimmed = q.trim();
    if (!trimmed) { closeSearchDrop(); return; }
    var res = null;
    try { res = window.PM2.search.query(trimmed, { limit: 40 }); } catch (e) { res = { query: trimmed, total: 0, groups: [] }; }
    ui.search.res = res;
    ui.search.open = true;
    if (!keepFocusIndex) ui.search.cursor = 0;
    renderSearchDrop();
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

  var KIND_SHORT = {
    setting: 'Setting', manager: 'Manager', object: 'Object', action: 'Action',
    workflow: 'Workflow', diagnostic: 'Status', unavailable: 'Unavailable', help: 'Guide'
  };

  function renderSearchDrop() {
    var input = activeSearchInput();
    if (!input) return;
    var slot = input.parentElement.querySelector('.c10-drop-slot');
    if (!slot) return;
    if (!ui.search.open) { slot.innerHTML = ''; return; }
    var res = ui.search.res;
    var flat = flatResults();
    var h = '<div class="c10-drop c10-scroll" role="listbox" aria-label="Search results">';
    if (!flat.length) {
      h += '<div class="c10-drop-none"><strong>No matches for \u201C' + esc(res.query) + '\u201D.</strong> ' +
        'Nothing in this project\u2019s settings, managers, objects, or guides matches. ' +
        'Try a task word like \u201Csign in\u201D, a provider name, or open <button type="button" class="c10-qa-jump"' + goAttr({ route: 'all' }) + '>All Settings</button> to browse the complete index.</div>';
    } else {
      var idx = 0;
      arr(res.groups).forEach(function (g) {
        h += '<div class="c10-drop-group">' + esc(g.label) + '</div>';
        arr(g.results).forEach(function (r) {
          var cur = idx === ui.search.cursor;
          h += '<button type="button" class="c10-res' + (cur ? ' is-cursor' : '') + '" role="option" aria-selected="' + cur + '"' +
            ' data-rid="' + esc(r.rid) + '" data-ridx="' + idx + '">' +
            '<span class="c10-res-top"><span class="c10-res-label">' + esc(r.label) + '</span>' +
            '<span class="c10-res-kind">' + esc(KIND_SHORT[r.kind] || r.kind) + '</span></span>' +
            (r.sub && r.kind !== 'setting' ? '<div class="c10-res-sub">' + esc(r.sub) + '</div>' : '') +
            '<div class="c10-res-path">' + esc(arr(r.path).join(' \u203A ')) + '</div>' +
            (r.availability ? '<div class="c10-res-avail">' + esc(r.availability) + '</div>' : '') +
            '</button>';
          idx += 1;
        });
      });
      h += '<div class="c10-drop-foot"><span>' + fmtInt(res.total) + ' matches</span>' +
        '<span><kbd class="c10-kbd">\u2191\u2193</kbd> choose</span><span><kbd class="c10-kbd">Enter</kbd> open</span><span><kbd class="c10-kbd">Esc</kbd> close</span></div>';
    }
    h += '</div>';
    slot.innerHTML = h;
    if (window.PMIcons && window.PMIcons.hydrate) window.PMIcons.hydrate(slot);
    var curEl = slot.querySelector('.c10-res.is-cursor');
    if (curEl && curEl.scrollIntoView) {
      try { curEl.scrollIntoView({ block: 'nearest' }); } catch (e) { /* ok */ }
    }
  }

  function closeSearchDrop() {
    ui.search.open = false;
    ui.search.res = null;
    var slots = root ? root.querySelectorAll('.c10-drop-slot') : [];
    for (var i = 0; i < slots.length; i++) slots[i].innerHTML = '';
  }

  function selectResult(rid) {
    var flat = flatResults();
    var chosen = null;
    flat.forEach(function (r) { if (r.rid === rid) chosen = r; });
    if (!chosen) return;
    var q = ui.search.q.trim();
    closeSearchDrop();
    /* Slip a silent #/search/<q> history entry beneath the destination so
       Back restores the query AND its deterministic result list. */
    var cur = window.PM2.route.current();
    if (!(cur.route.kind === 'search' && cur.route.query === q)) {
      window.PM2.route.go({ kind: 'search', query: q }, { silent: true });
    }
    navDest(chosen.dest, { focus: chosen.dest.sectionId || chosen.rid });
  }

  function searchKeydown(e, anchor) {
    var flat = flatResults();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!ui.search.open) { runSearch(e.target.value, anchor); return; }
      ui.search.cursor = Math.min(flat.length - 1, ui.search.cursor + 1);
      renderSearchDrop();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      ui.search.cursor = Math.max(0, ui.search.cursor - 1);
      renderSearchDrop();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (ui.search.open && flat.length) {
        var r = flat[Math.max(0, Math.min(flat.length - 1, ui.search.cursor))];
        selectResult(r.rid);
      } else if (e.target.value.trim()) {
        runSearch(e.target.value, anchor);
      }
    } else if (e.key === 'Escape') {
      if (ui.search.open) { e.preventDefault(); e.stopPropagation(); closeSearchDrop(); }
    }
  }

  /* ============================ actions dispatch ========================= */

  function act(action, el) {
    var parts = action.split(':');
    var op = parts[0];

    if (op === 'close-settings') {
      var r = window.PM2.states.receipt('Close Settings', 'Returns to the Dashboard. In this concept page the Settings surface stays open.');
      if (window.PMShell && window.PMShell.toast) window.PMShell.toast(r.message);
      return;
    }
    if (op === 'row-open') {
      var sid = parts.slice(1).join(':');
      if (ui.editorOpen === sid) {
        window.PM2.route.go({ kind: 'dest', cat: ui.view.cat, sub: ui.view.sub });
      } else {
        window.PM2.route.go({ kind: 'setting', settingId: sid });
      }
      return;
    }
    if (op === 'row-close') {
      retreat();
      return;
    }
    if (op === 'adv') {
      var key = parts.slice(1).join(':');
      ui.advOpen[key] = !ui.advOpen[key];
      render();
      return;
    }
    if (op === 'more') {
      var mkey = parts.slice(1).join(':');
      ui.morePages[mkey] = (ui.morePages[mkey] || 0) + 1;
      render();
      return;
    }
    if (op === 'ed-set') {
      applyValue(parts[1], parts[2] === 'true');
      return;
    }
    if (op === 'ed-setopt') {
      var row0 = store.resolveRow(parts[1]);
      var optList = arr(obj(row0.control).options);
      var o = optList[Number(parts[2])];
      var val = (o && typeof o === 'object') ? (o.value !== undefined ? o.value : o.id) : o;
      applyValue(parts[1], val);
      return;
    }
    if (op === 'ed-multi') {
      var rowM = store.resolveRow(parts[1]);
      var optsM = arr(obj(rowM.control).options);
      var pick = optsM[Number(parts[2])];
      var curM = arr(rowM.value).slice();
      var at = curM.indexOf(pick);
      if (at >= 0) curM.splice(at, 1); else curM.push(pick);
      applyValue(parts[1], curM);
      return;
    }
    if (op === 'ed-applynum') {
      var inp = document.getElementById('c10EdInput');
      if (!inp) return;
      var num = inp.value === '' ? NaN : Number(inp.value);
      applyValue(parts[1], isFinite(num) ? num : inp.value);
      return;
    }
    if (op === 'ed-applytext') {
      var inp2 = document.getElementById('c10EdInput');
      if (!inp2) return;
      applyValue(parts[1], inp2.value);
      return;
    }
    if (op === 'ed-reset') {
      var rec = settingIx[parts[1]];
      if (rec) applyValue(parts[1], rec['default'] === undefined ? null : rec['default']);
      return;
    }
    if (op === 'ed-action') {
      var recA = settingIx[parts[1]];
      var rr = window.PM2.states.receipt((recA ? recA.label : parts[1]),
        'Simulated run. In the product this opens or executes the tool this row describes.');
      if (window.PMShell && window.PMShell.toast) window.PMShell.toast(rr.message);
      return;
    }
    if (op === 'ed-detail') {
      var did = parts.slice(1).join(':');
      ui.detailOpen[did] = !ui.detailOpen[did];
      render();
      return;
    }
    if (op === 'ro-detail') {
      var rkey = parts.slice(1).join(':');
      ui.roOpen[rkey] = !ui.roOpen[rkey];
      render();
      return;
    }
    if (op === 'sec-adv') {
      var skey = parts.slice(1).join(':');
      ui.secOpen[skey] = !ui.secOpen[skey];
      render();
      return;
    }
    if (op === 'sec-jump') {
      var mid = parts[1];
      var secId = parts.slice(2).join(':');
      var elSec = root.querySelector('[data-section="' + cssEsc(secId) + '"]');
      if (!elSec) {
        ui.secOpen[mid + ':' + secId] = true;
        render();
        elSec = root.querySelector('[data-section="' + cssEsc(secId) + '"]');
      }
      if (elSec) locate(elSec);
      return;
    }
    if (op === 'setup-host') {
      ui.setupHost[parts[1] + ':' + parts[2]] = Number(parts[3]) || 0;
      render();
      return;
    }
    if (op === 'mgr-action') {
      runManagerAction(parts[1], parts.slice(2).join(':'));
      return;
    }
    if (op === 'mgr-action-blocked') {
      var defB = mgrDef(parts[1]);
      var actsB = [];
      try { actsB = arr(defB.actions(store)); } catch (e) { actsB = []; }
      var aid = parts.slice(2).join(':');
      var found = null;
      actsB.forEach(function (a) { if (a.id === aid) found = a; });
      var msg = found && found.reason ? found.reason : 'Not available right now.';
      if (window.PMShell && window.PMShell.toast) window.PMShell.toast(found ? (found.label + ' — ' + msg) : msg);
      return;
    }
    if (op === 'inst') {
      instAction(parts[1], parts[2], parts.slice(3).join(':'));
      return;
    }
    if (op === 'all-changed') {
      ui.all.changed = !ui.all.changed;
      render();
      return;
    }
    if (op === 'stress-row') {
      if (window.PMShell && window.PMShell.toast) {
        window.PMShell.toast('Simulated: Stress fixture — a synthetic scale-test record, not a real setting.');
      }
      return;
    }
    if (op === 'copy-src') {
      ui.copy.sourceId = parts.slice(1).join(':');
      ui.copy.stage = 1;
      ui.copy.cats = {};
      var srcs = arr(window.PM2.copy.sources());
      srcs.forEach(function (s) {
        if (s.id === ui.copy.sourceId) {
          arr(s.categorySummaries).forEach(function (cs) { ui.copy.cats[cs.cat] = true; });
        }
      });
      ui.copy.preview = null; ui.copy.receipt = null; ui.copy.error = null;
      ui.copy.confirm = ''; ui.copy.rolledBack = false; ui.copy.kindFilter = null;
      render();
      return;
    }
    if (op === 'copy-cat') {
      var cid = parts.slice(1).join(':');
      ui.copy.cats[cid] = !ui.copy.cats[cid];
      ui.copy.preview = null;
      if (ui.copy.stage > 1) ui.copy.stage = 1;
      render();
      return;
    }
    if (op === 'copy-cats-all' || op === 'copy-cats-none') {
      var srcs2 = arr(window.PM2.copy.sources());
      srcs2.forEach(function (s) {
        if (s.id === ui.copy.sourceId) {
          arr(s.categorySummaries).forEach(function (cs) { ui.copy.cats[cs.cat] = (op === 'copy-cats-all'); });
        }
      });
      ui.copy.preview = null;
      if (ui.copy.stage > 1) ui.copy.stage = 1;
      render();
      return;
    }
    if (op === 'copy-preview') {
      var catIds = Object.keys(ui.copy.cats).filter(function (k) { return ui.copy.cats[k]; });
      if (!catIds.length) return;
      ui.copy.preview = window.PM2.copy.preview(ui.copy.sourceId, catIds);
      ui.copy.stage = 2;
      ui.copy.inspect = {};
      render();
      return;
    }
    if (op === 'copy-kind') {
      ui.copy.kindFilter = ui.copy.kindFilter === parts[1] ? null : parts[1];
      render();
      return;
    }
    if (op === 'copy-inspect') {
      var ik = parts.slice(1).join(':');
      ui.copy.inspect[ik] = !ui.copy.inspect[ik];
      render();
      return;
    }
    if (op === 'copy-tostage') {
      ui.copy.stage = Number(parts[1]) || 0;
      render();
      return;
    }
    if (op === 'copy-stage') {
      ui.copy.stage = Number(parts[1]) || 0;
      render();
      return;
    }
    if (op === 'copy-apply') {
      if (ui.copy.confirm.trim().toUpperCase() !== 'COPY') return;
      copyApply();
      return;
    }
    if (op === 'copy-rollback') {
      copyRollback();
      return;
    }
    if (op === 'copy-restart') {
      ui.copy = { stage: 0, sourceId: null, cats: {}, preview: null, confirm: '',
        applying: false, op: null, receipt: null, error: null, inspect: {}, kindFilter: null };
      render();
      return;
    }
  }

  function applyValue(id, value) {
    var res = store.setValue(id, value, { source: 'conductor' });
    if (!res.ok) {
      ui.editorErr = { id: id, msg: res.error || 'That value was not accepted.' };
    } else {
      ui.editorErr = null;
    }
    ui.allIndex = null;
    render();
  }

  function runManagerAction(managerId, actionId) {
    var def = mgrDef(managerId);
    if (!def) return;
    var acts = [];
    try { acts = arr(def.actions(store)); } catch (e) { acts = []; }
    var found = null;
    acts.forEach(function (a) { if (a && a.id === actionId) found = a; });
    if (!found || typeof found.run !== 'function') return;
    try { found.run(store); } catch (e2) { /* op errors surface via events */ }
  }

  var INST_TRIGGER = { select: 'install-select', update: 'install-update', repair: 'install-repair' };

  function instAction(managerId, itemId, actionId) {
    var S = window.PM2.states;
    var trig = INST_TRIGGER[actionId];
    if (trig && S && typeof S.trigger === 'function') {
      try { S.trigger(trig, itemId); return; } catch (e) { /* fall through */ }
    }
    var labels = { verify: 'Verify installation', rollback: 'Roll back installation', select: 'Use this installation' };
    var r = window.PM2.states.receipt(labels[actionId] || actionId,
      'Simulated for ' + itemId + '. The staged operation and its verify checklist run in the product.');
    if (window.PMShell && window.PMShell.toast) window.PMShell.toast(r.message);
  }

  function copyApply() {
    var c = ui.copy;
    if (!c.preview || !c.preview.token) return;
    c.applying = true;
    c.error = null;
    render();
    window.PM2.copy.apply(c.preview.token).then(function (res) {
      c.applying = false;
      if (res && res.ok) {
        c.receipt = res;
        c.rolledBack = false;
      } else {
        c.error = (res && res.error) || 'The copy did not apply.';
      }
      ui.allIndex = null;
      render();
    });
  }

  function copyRollback() {
    var c = ui.copy;
    if (!c.receipt) return;
    c.applying = true;
    render();
    window.PM2.copy.rollback(c.receipt.receiptId).then(function (res) {
      c.applying = false;
      if (res && res.ok) c.rolledBack = true;
      else c.error = (res && res.error) || null;
      ui.allIndex = null;
      render();
    });
  }

  /* ============================ keyboard system ========================= */

  function isTypingTarget(el) {
    if (!el) return false;
    var t = el.tagName;
    return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || el.isContentEditable;
  }

  function navItems(pane) {
    var sel = 'button.c10-ix-item, button.c10-item, button.c10-row, button.c10-att-row, ' +
      'button.c10-recent-row, button.c10-mgr-row, button.c10-ro-top, button.c10-check, ' +
      'button.c10-src, button.c10-catpick, button.c10-vrow, button.c10-citem-top, button.c10-tab';
    return Array.prototype.slice.call(pane.querySelectorAll(sel))
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function moveFocus(delta) {
    var active = document.activeElement;
    var pane = active && active.closest ? (active.closest('.c10-pane-body') || active.closest('.c10-mgr-nav') || active.closest('.c10-mgr-main') || active.closest('.c10-stagep-body') || active.closest('.c10-vlist')) : null;
    if (!pane) {
      pane = root.querySelector('.c10-pane:not(.c10-pane-index) .c10-pane-body') || root.querySelector('.c10-pane-body');
      if (!pane) return;
      var first = navItems(pane)[0];
      if (first) first.focus();
      return;
    }
    var items = navItems(pane);
    if (!items.length) return;
    var i = items.indexOf(active);
    var next = i < 0 ? (delta > 0 ? 0 : items.length - 1) : Math.max(0, Math.min(items.length - 1, i + delta));
    items[next].focus();
    try { items[next].scrollIntoView({ block: 'nearest' }); } catch (e) { /* ok */ }
  }

  function onKeydown(e) {
    var mod = e.ctrlKey || e.metaKey;
    if (mod && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      var input = bigSearchInput() || miniSearchInput();
      if (input) { input.focus(); input.select(); }
      return;
    }
    /* keep the workspace keys away from the shared drawer / shell chrome */
    var within = root && (e.target === document.body || e.target === document.documentElement ||
      (root.contains && root.contains(e.target)));
    if (!within) return;
    var target = e.target;
    if (isTypingTarget(target)) {
      if (target.id === 'c10BigSearch') { searchKeydown(e, 'big'); return; }
      if (target.id === 'c10MiniSearch') { searchKeydown(e, 'mini'); return; }
      if (e.key === 'Escape') { target.blur(); }
      if (e.key === 'Enter' && target.id === 'c10EdInput') {
        var applyBtn = target.parentElement ? target.parentElement.querySelector('[data-act^="ed-apply"]') : null;
        if (applyBtn) { e.preventDefault(); applyBtn.click(); }
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1); return; }
    if (e.key === 'ArrowRight') {
      var el = document.activeElement;
      if (el && el.getAttribute && (el.getAttribute('data-go') || el.getAttribute('data-act'))) {
        e.preventDefault();
        el.click();
      }
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'Backspace') { e.preventDefault(); retreat(); return; }
    if (e.key === 'Escape') { escapeLadder(); return; }
  }

  /* ============================ events wiring ============================ */

  function onClick(e) {
    /* deepest handler wins: walk up from the click target and act on the
       first node that declares a behavior (search result, action, or dest) */
    var node = e.target;
    while (node && node !== root) {
      if (node.getAttribute) {
        var rid = node.getAttribute('data-rid');
        if (rid && node.closest('.c10-drop')) { selectResult(rid); return; }
        var action = node.getAttribute('data-act');
        if (action) { act(action, node); return; }
        var go = node.getAttribute('data-go');
        if (go) {
          var payload = null;
          try { payload = JSON.parse(decodeURIComponent(go)); } catch (err) { payload = null; }
          if (payload && payload.d) navDest(payload.d, payload.p);
          return;
        }
      }
      node = node.parentNode;
    }
    /* click outside closes the search dropdown (menu convention) */
    if (ui.search.open && e.target.closest && !e.target.closest('.c10-search-wrap')) closeSearchDrop();
  }

  function onInput(e) {
    var t = e.target;
    if (t.id === 'c10BigSearch') { debouncedSearch(t.value, 'big'); return; }
    if (t.id === 'c10MiniSearch') { debouncedSearch(t.value, 'mini'); return; }
    if (t.id === 'c10AllQ') { ui.all.q = t.value; refreshAllOnly(); return; }
    if (t.id === 'c10CopyConfirm') { ui.copy.confirm = t.value; refreshCopyArm(t); return; }
    if (t.getAttribute && t.getAttribute('data-slider')) {
      var id = t.getAttribute('data-slider');
      var out = root.querySelector('[data-slider-out="' + cssEsc(id) + '"]');
      if (out) out.textContent = t.value;
    }
  }

  function onChange(e) {
    var t = e.target;
    if (t.id === 'c10AllCat') { ui.all.cat = t.value; refreshAllOnly(); return; }
    if (t.id === 'c10AllType') { ui.all.type = t.value; refreshAllOnly(); return; }
    if (t.id === 'c10AllTier') { ui.all.tier = t.value; refreshAllOnly(); return; }
    if (t.id === 'c10AllState') { ui.all.state = t.value; refreshAllOnly(); return; }
    if (t.getAttribute && t.getAttribute('data-slider')) {
      var id = t.getAttribute('data-slider');
      var num = Number(t.value);
      applyValue(id, isFinite(num) ? num : t.value);
    }
  }

  /* facet changes refresh only the list window + count (no full render) */
  function refreshAllOnly() {
    filterAll();
    var count = root.querySelector('.c10-all-count');
    if (count) count.textContent = fmtInt(arr(ui.allFiltered).length) + ' of ' + fmtInt(buildAllIndex().length);
    var list = document.getElementById('c10VList');
    if (list) list.scrollTop = 0;
    renderAllWindow();
  }

  function refreshCopyArm(input) {
    var btn = root.querySelector('[data-act="copy-apply"]');
    if (!btn) return;
    if (ui.copy.confirm.trim().toUpperCase() === 'COPY') btn.removeAttribute('aria-disabled');
    else btn.setAttribute('aria-disabled', 'true');
  }

  var searchTimer = null;
  function debouncedSearch(q, anchor) {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      searchTimer = null;
      runSearch(q, anchor);
    }, 120);
  }

  function subscribe() {
    store.on('value', function () {
      ui.allIndex = null;
      renderSoon();
    });
    store.on('scenario', function () {
      ui.allIndex = null;
      renderSoon();
    });
    store.on('fixtures', function () {
      ui.allIndex = null;
      renderSoon();
    });
    store.on('change', function (p) {
      if (p && (p.key === 'scenario' || p.key === 'fixtures' || p.key === 'stress')) {
        ui.allIndex = null;
        renderSoon();
      }
    });
    store.on('op', function (payload) {
      if (!payload) return;
      /* bounded op feed, newest first */
      var replaced = false;
      for (var i = 0; i < ui.ops.length; i++) {
        if (ui.ops[i].opId === payload.opId) { ui.ops[i] = payload; replaced = true; break; }
      }
      if (!replaced) ui.ops.unshift(payload);
      if (ui.ops.length > 12) ui.ops.length = 12;
      if (payload.name === 'copy-apply' || payload.name === 'copy-rollback') {
        ui.copy.op = payload;
        if (ui.view.kind === 'copy') { renderSoon(); return; }
      }
      renderFoot();
      if (window.PMIcons && window.PMIcons.hydrate) window.PMIcons.hydrate(elFoot);
    });
    store.on('receipt', function (r) {
      if (!r) return;
      ui.lastStatus = String(r.message || '').replace(/^Simulated: /, '');
      if (window.PMShell && window.PMShell.toast) window.PMShell.toast(r.message);
      renderFoot();
      if (window.PMIcons && window.PMIcons.hydrate) window.PMIcons.hydrate(elFoot);
    });
    store.on('copy', function () {
      if (ui.view.kind === 'copy') renderSoon();
    });
  }

  /* ============================ boot ============================ */

  function boot() {
    stage = document.getElementById('pmStage');
    if (!stage) return;

    if (window.PMShell && window.PMShell.init) {
      window.PMShell.init({ concept: 'concept-10-command-suite' });
    }
    store = window.PM2.store.init('c10-conductor');

    stage.innerHTML =
      '<div class="c10 is-mode3" id="c10Root">' +
      '<div class="c10-top" id="c10Top"></div>' +
      '<div class="c10-body" id="c10Body"></div>' +
      '<div class="c10-foot" id="c10Foot"></div>' +
      '</div>';
    root = document.getElementById('c10Root');
    elTop = document.getElementById('c10Top');
    elBody = document.getElementById('c10Body');
    elFoot = document.getElementById('c10Foot');

    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange);
    document.addEventListener('keydown', onKeydown);

    /* width watcher: explicit mode machine, no CSS-media-derived semantics.
       It watches the FULL width vocabulary, not just the pane-count mode — a
       mode change restructures the pane strip and needs a render, while the
       tight / wide / ultra steps are pure CSS and only need the class swapped.
       (Watching the mode alone is what left every wide rule inert; see the
       rootClass() note above.) */
    function onStageResize() {
      var m = computeMode();
      if (m !== ui.mode) { renderSoon(); return; }
      syncWidthClass();
    }
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(onStageResize);
      ro.observe(stage);
    } else {
      window.addEventListener('resize', onStageResize);
    }

    subscribe();

    if (window.PM2.states && window.PM2.states.mountDrawer) {
      window.PM2.states.mountDrawer(store);
    }

    window.PM2.route.bind({ open: open });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
