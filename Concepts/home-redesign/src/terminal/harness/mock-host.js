/* Terminal harness: a mock of the panels host (window.PM_HOME), written against Concepts/home-redesign/CONTRACT.md v1
   (with the same-day additive changes: onResize({ w, h, final }), ui.* view-state actions, cmd.panel_tab.rename).
   It implements what a tab kind sees: the registry (section 3), the per-tab api (4), the shared header row (5), open()
   routing (6), the "+" menu and the empty-panel launcher (7), commands with logs (8), the host keyboard map (9), looks
   (10), the settings model (12) and the overlay root (14). The terminal codes against this exactly as it will against
   the real engine, so plugging into the panels thread's engine changes nothing in src/terminal/js.

   Not modelled (not needed by a terminal): tab drag reorder and drag-to-split, the narrow-centre switcher (D4), pinned
   tabs, locked and collapsed panels, named layouts, the MRU switcher, the hover thread's engine (a stand-in hover tag
   is drawn here). The harness toolbar (looks, sizes, layouts, demos) is wired at the end of this file.

   Harness-only; never inlined by the home layer. Plain ES2020, no libraries, no network. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------------------------------------------------------------ */
  var doc = document, root = doc.documentElement;
  function el(tag, cls, attrs) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); }
    return e;
  }
  function txt(tag, cls, text) { var e = el(tag, cls); e.textContent = text == null ? '' : String(text); return e; }
  function now() { return Date.now(); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function trimLog(arr) { if (arr.length > 200) arr.splice(0, arr.length - 200); }
  function safe(fn, what) {
    try { return fn(); } catch (e) { console.error('[pm-home] ' + what + ' failed', e); return undefined; }
  }
  function emitter() {
    var map = new Map();
    return {
      on: function (ev, fn) {
        if (!map.has(ev)) map.set(ev, new Set());
        map.get(ev).add(fn);
        return function () { var s = map.get(ev); if (s) s.delete(fn); };
      },
      emit: function (ev, a, b, c) {
        var s = map.get(ev); if (!s) return;
        Array.from(s).forEach(function (fn) { safe(function () { fn(a, b, c); }, 'listener for ' + ev); });
      }
    };
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Icons: 16 px viewBox, 1.6 stroke, round caps (PM_HOME.icons)
     ------------------------------------------------------------------------------------------------------------------ */
  var ICON_PATHS = {
    search: '<circle cx="7" cy="7" r="4.5"/><path d="M10.4 10.4 14 14"/>',
    split: '<rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M8 3v10"/>',
    splitRight: '<rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M8 3v10"/>',
    'split-down': '<rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M2 8h12"/>',
    maximize: '<path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"/>',
    restore: '<path d="M6 2.5V6H2.5M10 2.5V6h3.5M10 13.5V10h3.5M6 13.5V10H2.5"/>',
    more: '<circle cx="8" cy="3.5" r="1.15" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="1.15" fill="currentColor" stroke="none"/><circle cx="8" cy="12.5" r="1.15" fill="currentColor" stroke="none"/>',
    terminal: '<rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/><path d="M4.5 6l2.5 2-2.5 2M8.5 10.5h3"/>',
    close: '<path d="M4 4l8 8M12 4l-8 8"/>',
    plus: '<path d="M8 3v10M3 8h10"/>',
    check: '<path d="M3.5 8.5l3 3 6-7"/>',
    chevron: '<path d="M6 3.5 10.5 8 6 12.5"/>',
    branch: '<circle cx="5" cy="3.5" r="1.5"/><circle cx="5" cy="12.5" r="1.5"/><circle cx="11" cy="5" r="1.5"/><path d="M5 5v6M11 6.5c0 3-6 2.2-6 4.5"/>',
    git: '<circle cx="5" cy="3.5" r="1.5"/><circle cx="5" cy="12.5" r="1.5"/><circle cx="11" cy="5" r="1.5"/><path d="M5 5v6M11 6.5c0 3-6 2.2-6 4.5"/>',
    clock: '<circle cx="8" cy="8" r="5.6"/><path d="M8 5v3.2l2.1 1.4"/>',
    file: '<path d="M4 1.8h5.4L12.2 4.6v9.6H4z"/><path d="M9.4 1.8v2.8h2.8"/>',
    folder: '<path d="M1.8 4.2v8.3h12.4V5.6H7.6L6.2 4.2z"/>',
    'new-panel': '<rect x="1.8" y="3" width="12.4" height="10" rx="1.5"/><path d="M9.5 3v10"/>',
    reopen: '<path d="M3.2 7.2A5 5 0 1 1 4.6 11.6"/><path d="M2.6 3.6v3.8h3.8"/>',
    copy: '<rect x="5" y="5" width="8.5" height="8.5" rx="1.2"/><path d="M11 5V3.2a.7.7 0 0 0-.7-.7H3.2a.7.7 0 0 0-.7.7v7.1a.7.7 0 0 0 .7.7H5"/>',
    box: '<path d="M8 1.8l5.6 3v6.4L8 14.2l-5.6-3V4.8z"/><path d="M2.4 4.8 8 7.8l5.6-3M8 7.8v6.4"/>',
    busy: '<path d="M2 8h2.5l1.5-4 3 8 1.5-4H14"/>'
  };
  function iconSvg(name, extraCls) {
    if (!name) return '';
    if (/^\s*<svg/i.test(name)) return name;
    var p = ICON_PATHS[name] || ICON_PATHS.box;
    return '<svg class="pmw-ico' + (extraCls ? ' ' + extraCls : '') + '" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }
  function iconEl(name, cls) { var s = el('span', cls || 'pmw-icon'); s.innerHTML = iconSvg(name); return s; }

  /* ------------------------------------------------------------------------------------------------------------------
     Host state
     ------------------------------------------------------------------------------------------------------------------ */
  var bus = emitter();
  var kinds = new Map();          /* kind id -> def */
  var prefixOwner = new Map();    /* prefix -> kind id */
  var tabs = new Map();           /* tab id -> Tab */
  var panels = [];                /* Panel, in tree order after each render */
  var tree = null;                /* { t: 'leaf', panel } | { t: 'split', dir: 'row'|'col', kids: [], sizes: [] } */
  var maximized = null;           /* Panel | null (a flag outside the tree, D1) */
  var focusedTab = null;          /* Tab whose body holds focus */
  var focusPanel = null;          /* last-focused Panel */
  var focusClock = 0;
  var panelSeq = 0, bufferSeq = 0;
  var closedStack = [];           /* reopen closed */
  var booted = false;
  var sizing = { mode: 'fill', w: 720, h: 240 };   /* the harness's panel size preset (body size in fixed mode) */
  var settling = false, settleTimer = 0;
  var command_log = [], receipt_log = [], event_log = [];
  var centre = null, overlay = null, live = null;
  var STORE_PANELS = 'pm.home.panels:v1:harness';
  var STORE_SETTINGS = 'pm.home.settings:v1';
  var STORE_HARNESS = 'pmx.harness:v1';

  /* the contract's id table (section 2), so kindOf() answers for kinds this mock does not register */
  var PREFIX_TABLE = [
    ['file:', 'editor'], ['buffer:', 'editor'], ['terminal:', 'terminal'], ['browser:', 'browser'], ['link:', 'browser'],
    ['dashboard:', 'dashboard'], ['plan:', 'plan'], ['plan-query', 'plan'], ['deep-discovery:', 'plan'],
    ['teach:', 'document'], ['memory:', 'document'], ['revert:', 'document'], ['debug:', 'document'],
    ['lens-source:', 'document'], ['lens-effective:', 'document'], ['wonderer:', 'document'], ['wonder-source:', 'document'],
    ['doc:', 'document'], ['artifact:', 'artifact'], ['collab-run:', 'run'], ['crew-work:', 'run'], ['review:', 'run'],
    ['room:', 'run'], ['brainstorm:', 'run'], ['review-evidence:', 'run'], ['brainstorm-evidence:', 'run'],
    ['thread-', 'transcript'], ['context:', 'context'], ['search:', 'record'], ['mcp:', 'record'], ['app:', 'record'],
    ['work-record:', 'record'], ['output:', 'output'], ['problems', 'problems'], ['ports', 'ports'],
    ['debug-console:', 'debug-console']
  ];
  var DOC_KINDS = { editor: 1, plan: 1, document: 1, artifact: 1, run: 1, transcript: 1, context: 1, record: 1, render: 1, stub: 1 };

  /* ------------------------------------------------------------------------------------------------------------------
     Settings model (section 12)
     ------------------------------------------------------------------------------------------------------------------ */
  var settings = (function () {
    var schema = {}, defaults = {}, values = {}, ev = emitter();
    try { values = JSON.parse(localStorage.getItem(STORE_SETTINGS) || '{}') || {}; } catch (e) { values = {}; }
    function persist() { try { localStorage.setItem(STORE_SETTINGS, JSON.stringify(values)); } catch (e) { /* storage full or blocked */ } }
    function validate(key, value) {
      var s = schema[key]; if (!s || value == null) return true;
      if (s.enum && s.enum.indexOf(value) < 0) return false;
      if (s.type === 'number' && (typeof value !== 'number' || !isFinite(value))) return false;
      if (s.type === 'number' && s.min != null && value < s.min) return false;
      if (s.type === 'number' && s.max != null && value > s.max) return false;
      if (s.type === 'boolean' && typeof value !== 'boolean') return false;
      if (s.type === 'string' && typeof value !== 'string') return false;
      return true;
    }
    var api = {
      register: function (ns, sch, defs) {
        sch = sch || {}; defs = defs || {};
        var pre = ns ? ns + '.' : '';
        Object.keys(sch).forEach(function (k) { var full = k.indexOf(pre) === 0 ? k : pre + k; schema[full] = sch[k]; });
        Object.keys(defs).forEach(function (k) { var full = k.indexOf(pre) === 0 ? k : pre + k; defaults[full] = defs[k]; });
        return api;
      },
      get: function (key) {
        if (Object.prototype.hasOwnProperty.call(values, key)) return values[key];
        return Object.prototype.hasOwnProperty.call(defaults, key) ? defaults[key] : undefined;
      },
      set: function (key, value) {
        if (!validate(key, value)) { console.warn('[pm-home] settings: rejected ' + key, value); return false; }
        var old = api.get(key);
        if (value === undefined || (Object.prototype.hasOwnProperty.call(defaults, key) && JSON.stringify(defaults[key]) === JSON.stringify(value))) delete values[key];
        else values[key] = value;
        persist();
        var nv = api.get(key);
        if (JSON.stringify(old) !== JSON.stringify(nv)) { ev.emit(key, nv, old, key); ev.emit('*', key, nv, old); }
        return true;
      },
      on: function (key, fn) {
        if (key === '*') return ev.on('*', fn);
        return ev.on(key, function (v, old) { fn(v, old, key); });
      },
      defaults: function () { return Object.assign({}, defaults); },
      schema: function () { return Object.assign({}, schema); },
      reset: function (key) { return api.set(key, undefined); }
    };
    api.register('', {
      'panels.layout.named': { type: 'object' }, 'panels.tabs.preview': { type: 'boolean' },
      'panels.plus.default': { type: 'string', enum: ['menu'] }, 'panels.tabs.sizing': { type: 'string', enum: ['shrink', 'scroll'] },
      'editor.font.family': { type: 'string' }, 'editor.font.size': { type: 'number', min: 8, max: 32 },
      'editor.minimap': { type: 'boolean' }, 'editor.stickyScroll': { type: 'boolean' }, 'chat.width': { type: 'number' }
    }, {
      'panels.layout.named': null, 'panels.tabs.preview': true, 'panels.plus.default': 'menu', 'panels.tabs.sizing': 'shrink',
      'editor.font.family': null, 'editor.font.size': 13, 'editor.minimap': true, 'editor.stickyScroll': true, 'chat.width': null
    });
    return api;
  })();

  /* ------------------------------------------------------------------------------------------------------------------
     Looks (section 10): read from the page, never stored by the host
     ------------------------------------------------------------------------------------------------------------------ */
  var mqReduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function look() {
    var t = (root.getAttribute('data-theme') || 'basic-dark').split('-');
    return {
      family: t[0] || 'basic', mode: t[1] === 'light' ? 'light' : 'dark',
      nier: root.getAttribute('data-o55-nier') === 'on',
      reduced: root.getAttribute('data-motion') === 'reduced' || !!(mqReduced && mqReduced.matches)
    };
  }
  var lastLookSig = '';
  function lookChanged() {
    var l = look(), sig = JSON.stringify(l);
    if (sig === lastLookSig) return;
    lastLookSig = sig;
    bus.emit('look', l);
    tabs.forEach(function (t) {
      if (!t.inst) return;
      if (t.inst.onLook) safe(function () { t.inst.onLook(l); }, t.kind + ' onLook');
      t.ev.emit('look', l);
    });
    logEvent('look', l);
  }
  new MutationObserver(function () { Promise.resolve().then(lookChanged); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-o55-nier', 'data-o55-nier-parts', 'data-motion'] });
  if (mqReduced && mqReduced.addEventListener) mqReduced.addEventListener('change', lookChanged);

  /* ------------------------------------------------------------------------------------------------------------------
     Logs and commands (section 8)
     ------------------------------------------------------------------------------------------------------------------ */
  function logEvent(name, data) { event_log.push({ t: now(), name: name, data: data }); trimLog(event_log); }
  function layoutChanged(reason) {
    logEvent('workspace.layout_changed', { reason: reason });
    bus.emit('layout', { reason: reason });
    scheduleSave();
  }
  var COMMANDS = {
    'cmd.panel_tab.open': function (a) { return open(a || {}); },
    'cmd.terminal.open': function (a) { return open(Object.assign({ kind: 'terminal' }, a || {})); },
    'cmd.file.open': function (a) { return open(Object.assign({ kind: 'editor' }, a || {})); },
    'ui.panel_tab.activate': function (a) { var t = tabs.get(a && a.tabId); if (!t) return { ok: false, reason: 'unknown-tab' }; activateTab(t, { focus: !!a.focus, user: true }); return { ok: true }; },
    'cmd.panel_tab.close': function (a) { var t = tabs.get(a && a.tabId); if (!t) return { ok: false, reason: 'unknown-tab' }; return closeTab(t); },
    'cmd.editor.close_tab': function (a) { return COMMANDS['cmd.panel_tab.close'](a); },
    'cmd.panel_tab.keep': function (a) { var t = tabs.get(a && a.tabId); if (!t) return { ok: false, reason: 'unknown-tab' }; keepTab(t); return { ok: true }; },
    'cmd.panel_tab.rename': function (a) { var t = tabs.get(a && a.tabId); if (!t) return { ok: false, reason: 'unknown-tab' }; t.userLabel = a.label ? String(a.label) : null; paintTab(t); return { ok: true }; },
    'cmd.panel_tab.reopen_closed': function () { return reopenClosed(); },
    'cmd.workspace_layout.split': function (a) {
      var p = panelById(a && a.panelId) || focusPanel; if (!p) return { ok: false, reason: 'no-panel' };
      return splitWith(p, a.direction || 'right', a.spec || usualSpec(p));
    },
    'ui.workspace_layout.maximize': function (a) { setMaximized(a && a.panelId ? panelById(a.panelId) : null); return { ok: true }; },
    'cmd.workspace_layout.close_panel': function (a) { var p = panelById(a && a.panelId); if (!p) return { ok: false, reason: 'no-panel' }; return closePanel(p); },
    'cmd.workspace_layout.reset': function () { resetLayout(); return { ok: true }; }
  };
  function command(id, args) {
    command_log.push({ t: now(), id: id, args: args }); trimLog(command_log);
    var fn = COMMANDS[id];
    var res = fn ? fn(args) : { ok: false, reason: 'unknown-command' };
    var after = function (r) {
      if (id.indexOf('cmd.') === 0) { receipt_log.push({ t: now(), id: id, ok: !!(r && r.ok !== false), result: r }); trimLog(receipt_log); }
      return r;
    };
    return res && typeof res.then === 'function' ? res.then(after) : after(res);
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Registry (section 3)
     ------------------------------------------------------------------------------------------------------------------ */
  function registerKind(id, def) {
    if (!id || !def || typeof def.mount !== 'function') throw new Error('registerKind: ' + id + ' needs a mount function');
    if (kinds.has(id)) throw new Error('registerKind: kind ' + id + ' is already registered');
    (def.prefixes || []).forEach(function (p) {
      if (prefixOwner.has(p) && prefixOwner.get(p) !== id) throw new Error('registerKind: prefix ' + p + ' is claimed by ' + prefixOwner.get(p) + ' and ' + id);
    });
    (def.prefixes || []).forEach(function (p) { prefixOwner.set(p, id); });
    def.id = id;
    kinds.set(id, def);
    logEvent('kind.registered', { kind: id });
    if (booted) paintAllLaunchers();
    return true;
  }
  function kindOf(tabId) {
    if (!tabId) return null;
    var best = null, bestLen = -1;
    prefixOwner.forEach(function (k, p) { if (tabId.indexOf(p) === 0 && p.length > bestLen) { best = k; bestLen = p.length; } });
    if (best) return best;
    PREFIX_TABLE.forEach(function (r) { if (tabId.indexOf(r[0]) === 0 && r[0].length > bestLen) { best = r[1]; bestLen = r[0].length; } });
    return best;
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Panels and the split tree
     ------------------------------------------------------------------------------------------------------------------ */
  function Panel() {
    var p = this;
    this.id = 'p' + (++panelSeq);
    this.tabs = []; this.active = null; this.preview = null; this.focusTs = 0;
    this.el = el('section', 'pmw-panel', { 'data-pmw-panel': '' });
    this.el.setAttribute('aria-label', 'Panel');
    this.strip = el('div', 'pmw-strip');
    this.tabsEl = el('div', 'pmw-tabs', { role: 'tablist', 'aria-label': 'Tabs', 'aria-orientation': 'horizontal' });
    this.overflowBtn = txt('button', 'pmw-sbtn pmw-overflow', '+0');
    this.overflowBtn.type = 'button'; this.overflowBtn.hidden = true;
    this.overflowBtn.setAttribute('aria-haspopup', 'menu'); this.overflowBtn.setAttribute('aria-expanded', 'false');
    this.plusBtn = el('button', 'pmw-sbtn pmw-plus', { type: 'button', 'aria-label': 'Open a tab or panel', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'data-pmw-tag': 'Open a tab or panel', 'data-pmw-tag-key': 'Ctrl+Shift+Space' });
    this.plusBtn.innerHTML = iconSvg('plus');
    this.menuBtn = el('button', 'pmw-sbtn pmw-pmenu', { type: 'button', 'aria-label': 'Panel menu', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'data-pmw-tag': 'Panel menu' });
    this.menuBtn.innerHTML = iconSvg('more');
    this.strip.appendChild(this.tabsEl); this.strip.appendChild(this.overflowBtn); this.strip.appendChild(this.plusBtn);
    this.strip.appendChild(this.menuBtn);
    this.bodies = el('div', 'pmw-bodies');
    this.launch = el('div', 'pmw-launch'); this.launch.hidden = true;
    this.bodies.appendChild(this.launch);
    this.el.appendChild(this.strip); this.el.appendChild(this.bodies);
    this.plusBtn.addEventListener('click', function (e) { openPlusMenu(p, p.plusBtn, { alt: e.altKey }); });
    this.overflowBtn.addEventListener('click', function () { openOverflowMenu(p); });
    this.menuBtn.addEventListener('click', function () { openPanelMenu(p, p.menuBtn); });
    this.el.addEventListener('pointerdown', function () { touchPanel(p); }, true);
    this.tabsEl.addEventListener('keydown', function (e) { stripKey(p, e); });
    this.strip.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && maximized) { e.preventDefault(); setMaximized(null); }
    });
    stripObserver.observe(this.strip);
  }
  function panelById(id) { for (var i = 0; i < panels.length; i++) if (panels[i].id === id) return panels[i]; return null; }
  function touchPanel(p) { if (!p) return; p.focusTs = ++focusClock; if (focusPanel !== p) { focusPanel = p; bus.emit('focus', { panelId: p.id }); } }

  function leaf(p) { return { t: 'leaf', panel: p }; }
  function walk(node, fn, parent) {
    if (!node) return;
    fn(node, parent);
    if (node.t === 'split') node.kids.forEach(function (k) { walk(k, fn, node); });
  }
  function findLeaf(p) {
    var hit = null;
    walk(tree, function (n, parent) { if (n.t === 'leaf' && n.panel === p) hit = { node: n, parent: parent }; });
    return hit;
  }
  function splitPanel(p, dir) {
    var np = new Panel();
    var f = findLeaf(p), want = dir === 'down' ? 'col' : 'row';
    var nl = leaf(np);
    if (!f) {
      tree = tree ? { t: 'split', dir: want, kids: [tree, nl], sizes: [1, 1] } : nl;
      renderLayout();
      return np;
    }
    if (f.parent && f.parent.dir === want) {
      var i = f.parent.kids.indexOf(f.node), half = f.parent.sizes[i] / 2;
      f.parent.kids.splice(i + 1, 0, nl); f.parent.sizes[i] = half; f.parent.sizes.splice(i + 1, 0, half);
    } else {
      var split = { t: 'split', dir: want, kids: [f.node, nl], sizes: [1, 1] };
      if (!f.parent) tree = split;
      else { var j = f.parent.kids.indexOf(f.node); f.parent.kids[j] = split; }
    }
    renderLayout();
    return np;
  }
  function removePanelFromTree(p) {
    var f = findLeaf(p); if (!f) return;
    if (!f.parent) { tree = null; return; }
    var par = f.parent, i = par.kids.indexOf(f.node), freed = par.sizes[i];
    par.kids.splice(i, 1); par.sizes.splice(i, 1);
    if (par.kids.length) { var k = Math.min(i, par.kids.length - 1); par.sizes[k] += freed; }
    if (par.kids.length === 1) {
      var only = par.kids[0], gp = null;
      walk(tree, function (n, parent) { if (n === par) gp = parent; });
      if (!gp) tree = only; else gp.kids[gp.kids.indexOf(par)] = only;
    }
  }

  /* render the tree into the centre; panel elements are moved, never rebuilt, so mounted bodies keep their state */
  function renderLayout() {
    if (!centre) return;
    var hadFocus = doc.activeElement && centre.contains(doc.activeElement) ? doc.activeElement : null;
    var order = [];
    function build(node) {
      if (node.t === 'leaf') { order.push(node.panel); node.panel.el.style.flex = ''; return node.panel.el; }
      var box = el('div', 'pmw-split', { 'data-dir': node.dir });
      node.kids.forEach(function (k, i) {
        if (i > 0) box.appendChild(makeDivider(node, i - 1));
        var child = build(k);
        child.style.flex = node.sizes[i] + ' 1 0px';
        box.appendChild(child);
      });
      return box;
    }
    var rootBox = el('div', 'pmw-root');
    if (tree) { var b = build(tree); b.style.flex = '1 1 auto'; rootBox.appendChild(b); }
    var oldRoot = centre.querySelector(':scope > .pmw-root');
    if (oldRoot) centre.replaceChild(rootBox, oldRoot); else centre.appendChild(rootBox);
    panels = order;
    if (maximized && panels.indexOf(maximized) < 0) maximized = null;
    panels.forEach(function (p) { p.el.classList.toggle('pmw-maxed', p === maximized); });
    centre.classList.toggle('pmw-has-max', !!maximized);
    if (hadFocus && doc.contains(hadFocus)) hadFocus.focus({ preventScroll: true });
    refreshVisibility();
    panels.forEach(fitStrip);
    reportLayout();
  }
  function makeDivider(node, i) {
    var d = el('div', 'pmw-divider', { role: 'separator', 'aria-orientation': node.dir === 'row' ? 'vertical' : 'horizontal', 'aria-label': 'Resize panels', 'data-pmh': 'off' });
    d.addEventListener('pointerdown', function (e) {
      if (centre.classList.contains('pmw-fixed') || e.button !== 0) return;
      e.preventDefault();
      var box = d.parentNode, a = d.previousElementSibling, b = d.nextElementSibling;
      var horiz = node.dir === 'row';
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      var total = horiz ? ra.width + rb.width : ra.height + rb.height;
      var start = horiz ? e.clientX : e.clientY, sizeA = horiz ? ra.width : ra.height;
      var sum = node.sizes[i] + node.sizes[i + 1];
      d.setPointerCapture(e.pointerId); d.classList.add('pmw-dragging');
      doc.body.classList.add('pm-resizing'); doc.body.classList.toggle('pmw-rows', !horiz);
      beginSettle();
      function move(ev) {
        var pos = horiz ? ev.clientX : ev.clientY;
        var na = clamp(sizeA + pos - start, 140, total - 140);
        node.sizes[i] = sum * na / total; node.sizes[i + 1] = sum - node.sizes[i];
        a.style.flex = node.sizes[i] + ' 1 0px'; b.style.flex = node.sizes[i + 1] + ' 1 0px';
      }
      function up() {
        d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up); d.removeEventListener('pointercancel', up);
        d.classList.remove('pmw-dragging'); doc.body.classList.remove('pm-resizing', 'pmw-rows');
        endSettle();
        command_log.push({ t: now(), id: 'cmd.workspace_layout.resize_surface', args: { sizes: node.sizes.slice() } });
        receipt_log.push({ t: now(), id: 'cmd.workspace_layout.resize_surface', ok: true });
        layoutChanged('resize');
      }
      d.addEventListener('pointermove', move); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
    });
    return d;
  }
  function reportLayout() { bus.emit('panels', panels.map(function (p) { return p.id; })); }

  /* ------------------------------------------------------------------------------------------------------------------
     Tabs
     ------------------------------------------------------------------------------------------------------------------ */
  var tabSeq = 0;
  function Tab(id, def, state) {
    var t = this;
    this.id = id; this.kind = def.id; this.def = def; this.state = state || {};
    this.panel = null; this.inst = null; this.mounted = false; this.visible = false; this.focused = false;
    this.label = this.state.label || this.state.title || def.label || def.id; this.title = ''; this.icon = def.icon || 'box';
    this.userLabel = null;
    this.marks = { exitCode: null, agent: null, attention: false, dirty: false, busy: false };
    this.preview = false; this.ev = emitter(); this.subs = []; this.last = null; this.tagSeq = ++tabSeq;
    var domId = 'pmw-t' + this.tagSeq;
    this.tabEl = el('div', 'pmw-tab', { role: 'tab', id: domId + '-tab', 'aria-selected': 'false', tabindex: '-1', 'aria-controls': domId + '-body' });
    this.agentEl = el('span', 'pmw-tab-agent'); this.agentEl.hidden = true;
    this.iconEl = el('span', 'pmw-tab-icon');
    this.labelEl = el('span', 'pmw-tab-label');
    this.exitEl = el('span', 'pmw-tab-exit'); this.exitEl.hidden = true;
    this.busyEl = el('span', 'pmw-tab-busy'); this.busyEl.innerHTML = iconSvg('busy'); this.busyEl.hidden = true;
    this.attEl = el('span', 'pmw-tab-att'); this.attEl.hidden = true;
    this.closeEl = el('span', 'pmw-tab-close', { 'aria-hidden': 'true' });
    this.closeEl.innerHTML = iconSvg('close') + '<span class="pmw-tab-dot"></span>';
    [this.agentEl, this.iconEl, this.labelEl, this.exitEl, this.busyEl, this.attEl, this.closeEl].forEach(function (c) { t.tabEl.appendChild(c); });
    this.body = el('div', 'pmw-body', { role: 'tabpanel', id: domId + '-body', 'aria-labelledby': domId + '-tab', 'data-pmw-tab': '' });
    this.body.hidden = true;
    this.tabEl.addEventListener('mousedown', function (e) { if (e.button === 1) e.preventDefault(); });
    this.tabEl.addEventListener('click', function (e) {
      if (e.target.closest('.pmw-tab-close')) { closeTab(t); return; }
      activateTab(t, { focus: true, user: true });
    });
    this.tabEl.addEventListener('auxclick', function (e) { if (e.button === 1) { e.preventDefault(); closeTab(t); } });
    this.tabEl.addEventListener('dblclick', function () { if (t.preview) keepTab(t); });
    this.tabEl.addEventListener('contextmenu', function (e) { e.preventDefault(); openTabMenu(t, { x: e.clientX, y: e.clientY }); });
    this.tabEl.addEventListener('focus', function () { touchPanel(t.panel); });
    paintTab(this);
    resizeObserver.observe(this.body);
  }
  function paintTab(t) {
    var label = t.userLabel || t.label || t.def.label;
    t.labelEl.textContent = label;
    t.iconEl.innerHTML = iconSvg(t.icon);
    t.agentEl.hidden = !t.marks.agent;
    t.attEl.hidden = !t.marks.attention;
    t.busyEl.hidden = !t.marks.busy;
    var code = t.marks.exitCode;
    t.exitEl.hidden = !(typeof code === 'number' && code !== 0);
    if (!t.exitEl.hidden) t.exitEl.innerHTML = iconSvg('close') + '<span>' + String(code) + '</span>';
    t.tabEl.classList.toggle('pmw-dirty', !!t.marks.dirty);
    t.tabEl.classList.toggle('pmw-preview', !!t.preview);
    var tag = t.title || label;
    if (t.marks.agent) tag += '\n' + t.marks.agent + ' is driving this tab';
    if (typeof code === 'number' && code !== 0) tag += '\nLast command failed (exit ' + code + ')';
    if (t.marks.attention) tag += '\nSomething new since you last looked';
    t.tabEl.setAttribute('data-pmw-tag', tag);
    var aria = label + (t.marks.agent ? ', ' + t.marks.agent + ' driving' : '') + (typeof code === 'number' && code !== 0 ? ', exit ' + code : '') +
      (t.marks.busy ? ', running' : '') + (t.marks.attention ? ', new activity' : '') + (t.marks.dirty ? ', unsaved' : '') + (t.preview ? ', preview' : '');
    t.tabEl.setAttribute('aria-label', aria);
    if (t.panel) fitStripSoon(t.panel);
  }
  function addTabToPanel(t, p, index) {
    t.panel = p;
    if (index == null || index < 0 || index > p.tabs.length) p.tabs.push(t); else p.tabs.splice(index, 0, t);
    var next = p.tabs[p.tabs.indexOf(t) + 1];
    p.tabsEl.insertBefore(t.tabEl, next ? next.tabEl : null);
    p.bodies.appendChild(t.body);
    p.launch.hidden = true;
    fitStripSoon(p);
  }
  function keepTab(t) { if (!t.preview) return; t.preview = false; if (t.panel && t.panel.preview === t) t.panel.preview = null; paintTab(t); }

  function activateTab(t, opts) {
    opts = opts || {};
    var p = t.panel; if (!p) return;
    var changed = p.active !== t;
    if (changed) {
      if (p.active) { p.active.tabEl.setAttribute('aria-selected', 'false'); p.active.tabEl.tabIndex = -1; p.active.body.hidden = true; }
      p.active = t;
      t.tabEl.setAttribute('aria-selected', 'true'); t.tabEl.tabIndex = 0; t.body.hidden = false;
      bus.emit('activate', { tabId: t.id, panelId: p.id, kind: t.kind, reason: opts.reason || (opts.user ? 'user' : 'open') });
    }
    if (opts.user && t.marks.attention) { t.marks.attention = false; paintTab(t); }
    if (maximized && maximized !== p && opts.user) setMaximized(null);
    refreshVisibility();
    fitStrip(p);
    if (opts.focus) { touchPanel(p); focusTab(t); }
    if (changed) scheduleSave();
  }
  function focusTab(t) {
    if (!t.mounted) return;
    if (t.inst && t.inst.focus) safe(function () { t.inst.focus(); }, t.kind + ' focus');
    else { if (!t.body.hasAttribute('tabindex')) t.body.tabIndex = -1; t.body.focus({ preventScroll: true }); }
  }

  function makeApi(t) {
    var api = {
      id: t.id, kind: t.kind,
      update: function (patch) {
        if (!patch || !tabs.has(t.id)) return;
        if ('label' in patch && patch.label != null) t.label = String(patch.label);
        if ('title' in patch) t.title = patch.title == null ? '' : String(patch.title);
        if ('icon' in patch && patch.icon) t.icon = patch.icon;
        ['exitCode', 'agent', 'attention', 'dirty', 'busy'].forEach(function (k) { if (k in patch) t.marks[k] = patch[k] == null ? (k === 'exitCode' || k === 'agent' ? null : false) : patch[k]; });
        if (patch.attention && t.visible && t.focused) t.marks.attention = false;
        paintTab(t);
      },
      size: function () { return { w: t.body.clientWidth, h: t.body.clientHeight }; },
      isVisible: function () { return t.visible; },
      isFocused: function () { return !!(doc.activeElement && t.body.contains(doc.activeElement)); },
      activate: function (o) { activateTab(t, { focus: !!(o && o.focus), user: true }); },
      close: function () { return closeTab(t); },
      split: function (direction, spec) { return splitWith(t.panel, direction || 'auto', spec || { kind: t.kind }, t); },
      toggleMaximize: function () { setMaximized(maximized === t.panel ? null : t.panel); return maximized === t.panel; },
      isMaximized: function () { return !!t.panel && maximized === t.panel; },
      open: function (spec) { return open(spec, { source: t.panel, opener: t }); },
      menu: function (items, anchor) { return openMenu(items, anchor); },
      announce: function (text) { announce(text); },
      command: function (id, args) { return command(id, args); },
      settings: null,
      look: look,
      on: function (ev, fn) {
        var off = ev === 'settings' ? settings.on('*', fn) : t.ev.on(ev, fn);
        t.subs.push(off); return off;
      },
      headerRow: function (spec) { return headerRow(spec, api); },
      icons: PM_HOME_ICONS
    };
    api.settings = {
      get: settings.get, set: settings.set, defaults: settings.defaults, schema: settings.schema, register: settings.register,
      on: function (key, fn) { var off = settings.on(key, fn); t.subs.push(off); return off; }
    };
    return api;
  }

  function mountTab(t) {
    if (t.mounted) return;
    t.mounted = true;
    t.api = makeApi(t);
    var state = t.state;
    var inst = safe(function () { return t.def.mount(t.body, state, t.api); }, t.kind + ' mount');
    t.inst = inst || {};
    logEvent('mount', { tabId: t.id, kind: t.kind });
    requestAnimationFrame(function () { sendResize(t, true); });
  }
  function refreshVisibility() {
    tabs.forEach(function (t) {
      var p = t.panel;
      var vis = !!p && p.active === t && (!maximized || maximized === p) && panels.indexOf(p) >= 0;
      if (vis === t.visible) return;
      t.visible = vis;
      if (vis) {
        if (!t.mounted) mountTab(t);
        if (t.inst && t.inst.onShow) safe(function () { t.inst.onShow(); }, t.kind + ' onShow');
        requestAnimationFrame(function () { sendResize(t, !settling); });
      } else if (t.mounted && t.inst && t.inst.onHide) safe(function () { t.inst.onHide(); }, t.kind + ' onHide');
    });
    panels.forEach(function (p) {
      p.launch.hidden = p.tabs.length > 0;
      if (!p.tabs.length && p.launchSig !== kinds.size) paintLauncher(p);
    });
  }

  /* onResize: ResizeObserver, batched to one call per animation frame; final is false while a divider drag or a
     window resize is still moving the body and true on the last call */
  var pendingResize = new Set(), resizeFrame = 0;
  var resizeObserver = new ResizeObserver(function (entries) {
    entries.forEach(function (en) { var t = tabByBody(en.target); if (t) pendingResize.add(t); });
    if (!resizeFrame) resizeFrame = requestAnimationFrame(flushResize);
  });
  function tabByBody(b) { var hit = null; tabs.forEach(function (t) { if (t.body === b) hit = t; }); return hit; }
  function flushResize() {
    resizeFrame = 0;
    var list = Array.from(pendingResize); pendingResize.clear();
    list.forEach(function (t) { sendResize(t, !settling); });
    bus.emit('sizes');
  }
  function sendResize(t, final) {
    if (!t.mounted || !t.visible || !t.inst || !tabs.has(t.id)) return;
    var w = t.body.clientWidth, h = t.body.clientHeight;
    if (!w || !h) return;
    if (t.last && t.last.w === w && t.last.h === h && (t.last.final || !final)) return;
    t.last = { w: w, h: h, final: final };
    if (t.inst.onResize) safe(function () { t.inst.onResize({ w: w, h: h, final: final }); }, t.kind + ' onResize');
  }
  function beginSettle() { settling = true; clearTimeout(settleTimer); }
  function endSettle(delay) {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () {
      settling = false;
      requestAnimationFrame(function () { tabs.forEach(function (t) { sendResize(t, true); }); });
    }, delay || 0);
  }
  window.addEventListener('resize', function () { beginSettle(); endSettle(160); });

  /* ------------------------------------------------------------------------------------------------------------------
     Focus (onFocus / onBlur, last-focused panel)
     ------------------------------------------------------------------------------------------------------------------ */
  doc.addEventListener('focusin', function (e) {
    var body = e.target.closest ? e.target.closest('.pmw-body') : null;
    var t = body ? tabByBody(body) : null;
    if (t !== focusedTab) {
      var old = focusedTab; focusedTab = t;
      if (old) { old.focused = false; if (old.inst && old.inst.onBlur) safe(function () { old.inst.onBlur(); }, old.kind + ' onBlur'); }
      if (t) {
        t.focused = true;
        if (t.marks.attention) { t.marks.attention = false; paintTab(t); }
        if (t.inst && t.inst.onFocus) safe(function () { t.inst.onFocus(); }, t.kind + ' onFocus');
      }
      bus.emit('tabfocus', t ? t.id : null);
    }
    var pe = e.target.closest ? e.target.closest('.pmw-panel') : null;
    if (pe) panels.forEach(function (p) { if (p.el === pe) touchPanel(p); });
  });

  /* ------------------------------------------------------------------------------------------------------------------
     The strip: fit, overflow "+N", keyboard (ARIA tabs)
     ------------------------------------------------------------------------------------------------------------------ */
  var stripObserver = new ResizeObserver(function (entries) {
    entries.forEach(function (en) { panels.forEach(function (p) { if (p.strip === en.target) fitStripSoon(p); }); });
  });
  var fitQueue = new Set(), fitFrame = 0;
  function fitStripSoon(p) { fitQueue.add(p); if (!fitFrame) fitFrame = requestAnimationFrame(function () { fitFrame = 0; var l = Array.from(fitQueue); fitQueue.clear(); l.forEach(fitStrip); }); }
  function fitStrip(p) {
    if (!p.strip.isConnected) return;
    p.tabs.forEach(function (t) { t.tabEl.hidden = false; });
    p.overflowBtn.hidden = true;
    p.strip.classList.remove('pmw-tight');
    p.hiddenTabs = [];
    var box = p.tabsEl;
    function over() { return box.scrollWidth > box.clientWidth + 1; }
    if (!over()) return;
    p.strip.classList.add('pmw-tight');
    if (!over()) return;
    p.overflowBtn.hidden = false;
    p.overflowBtn.textContent = '+9';
    for (var i = p.tabs.length - 1; i >= 0 && over(); i--) {
      var t = p.tabs[i];
      if (t === p.active) continue;
      t.tabEl.hidden = true; p.hiddenTabs.unshift(t);
    }
    p.overflowBtn.hidden = !p.hiddenTabs.length;
    p.overflowBtn.textContent = '+' + p.hiddenTabs.length;
    p.overflowBtn.setAttribute('aria-label', p.hiddenTabs.length + ' more tabs');
  }
  function stripKey(p, e) {
    var vis = p.tabs.filter(function (t) { return !t.tabEl.hidden; });
    var cur = vis.indexOf(p.active), go = null;
    if (e.key === 'ArrowRight') go = vis[(cur + 1) % vis.length];
    else if (e.key === 'ArrowLeft') go = vis[(cur - 1 + vis.length) % vis.length];
    else if (e.key === 'Home') go = vis[0];
    else if (e.key === 'End') go = vis[vis.length - 1];
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (p.active) focusTab(p.active); return; }
    else if (e.key === 'Delete') { e.preventDefault(); if (p.active) closeTab(p.active); return; }
    else if (e.key === 'F10' && e.shiftKey || e.key === 'ContextMenu') { e.preventDefault(); if (p.active) openTabMenu(p.active, p.active.tabEl); return; }
    if (go) { e.preventDefault(); activateTab(go, { user: true }); go.tabEl.focus(); }
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Opening (section 6)
     ------------------------------------------------------------------------------------------------------------------ */
  function hostFields(spec) {
    var s = Object.assign({}, spec);
    ['where', 'mode', 'by', 'background', 'focus'].forEach(function (k) { delete s[k]; });
    return s;
  }
  function panelHoldsOnly(p, pred) { return p.tabs.length > 0 && p.tabs.every(function (t) { return pred(t); }); }
  function isDocPanel(p) {
    if (!p.tabs.length) return true;
    return !panelHoldsOnly(p, function (t) { return t.def.dedicated; });
  }
  function byRecency(list) { return list.slice().sort(function (a, b) { return b.focusTs - a.focusTs; }); }
  function autoPanel(def, source) {
    var ordered = byRecency(panels);
    if (def.dedicated) {
      var hold = ordered.filter(function (p) { return p.tabs.some(function (t) { return t.kind === def.id; }); });
      if (hold.length) return hold[0];
    }
    var docs = ordered.filter(isDocPanel);
    if (docs.length) return docs[0];
    return newPanelByFit(source || ordered[0]);
  }
  function minOf(p, extraDef) {
    var m = { w: 0, h: 0 };
    p.tabs.concat(extraDef ? [{ def: extraDef }] : []).forEach(function (t) {
      var mm = t.def.min || {}; m.w = Math.max(m.w, mm.w || 0); m.h = Math.max(m.h, mm.h || 0);
    });
    return m;
  }
  function stripH() { return panels.length ? panels[0].strip.offsetHeight || 34 : 34; }
  function newPanelByFit(source) {
    source = source || focusPanel || panels[0];
    if (!source) return splitPanel(null, 'right');
    var r = source.el.getBoundingClientRect();
    if (centre.classList.contains('pmw-fixed')) return splitPanel(source, 'right');
    if (r.width / 2 - 3 >= 280) return splitPanel(source, 'right');
    if ((r.height - 3) / 2 - stripH() >= 120) return splitPanel(source, 'down');
    var largest = panels.slice().sort(function (a, b) {
      var ra = a.el.getBoundingClientRect(), rb = b.el.getBoundingClientRect(); return rb.width * rb.height - ra.width * ra.height;
    })[0] || source;
    var rl = largest.el.getBoundingClientRect();
    return splitPanel(largest, rl.width >= rl.height * 1.6 ? 'right' : 'down');
  }
  function placeFor(def, spec, ctx) {
    var where = spec.where || 'auto', source = ctx.source || focusPanel || panels[0];
    if (where === 'tab') return source || autoPanel(def, source);
    if (where === 'panel') return newPanelByFit(source);
    if (where === 'right' || where === 'down') return source ? splitPanel(source, where) : newPanelByFit(null);
    if (where !== 'auto') { var p = panelById(where); if (p) return p; }
    return autoPanel(def, source);
  }
  function open(spec, ctx) {
    spec = Object.assign({}, spec || {}); ctx = ctx || {};
    if (spec.kind === 'file') spec.kind = 'editor';
    if (!spec.kind && spec.path) spec.kind = 'editor';
    if (!spec.kind && spec.id) spec.kind = kindOf(spec.id);
    if (!spec.kind && spec.text != null) spec.kind = 'editor';
    var def = kinds.get(spec.kind);
    if (!def) { announce('Nothing here opens that kind of tab yet.'); return { ok: false, reason: 'unknown-kind', kind: spec.kind || null }; }
    var by = spec.by || 'user', agent = /^agent:/.test(by) ? by.slice(6) : null;
    var background = !!agent || !!spec.background;
    var id = spec.id || (def.idFor ? def.idFor(spec) : null) || (def.id + ':' + (++bufferSeq));
    var existing = tabs.get(id);
    if (existing) {
      if (existing.inst && existing.inst._pmwReveal) safe(function () { existing.inst._pmwReveal(spec); }, 'reveal');
      if (agent) {
        if (!existing.visible || !existing.focused) { existing.marks.attention = true; paintTab(existing); }
        announce(agent + ' updated ' + (existing.userLabel || existing.label) + '.');
      } else {
        if (existing.panel && existing.panel.hiddenTabs && existing.panel.hiddenTabs.indexOf(existing) >= 0) {
          var hp = existing.panel; hp.tabs.splice(hp.tabs.indexOf(existing), 1); hp.tabs.unshift(existing); hp.tabsEl.insertBefore(existing.tabEl, hp.tabsEl.firstChild);
        }
        activateTab(existing, { focus: !background && spec.focus !== false, user: true, reason: 'reveal' });
      }
      return { ok: true, tabId: id, panelId: existing.panel ? existing.panel.id : null, created: false };
    }
    var p = placeFor(def, spec, ctx);
    var t = new Tab(id, def, hostFields(spec));
    t.by = by;
    if (spec.title) t.title = String(spec.title);
    tabs.set(id, t);
    /* preview tabs (files, D7) */
    if (spec.mode === 'preview' && def.id === 'editor' && spec.path) {
      t.preview = true;
      if (p.preview && p.preview !== t && tabs.has(p.preview.id)) closeTab(p.preview, { force: true });
      p.preview = t;
    }
    var idx = p.active ? p.tabs.indexOf(p.active) + 1 : -1;
    addTabToPanel(t, p, idx);
    if (agent) {
      t.marks.attention = true; t.marks.agent = null; paintTab(t);
      if (!p.active) activateTab(t, { focus: false });
      announce(agent + ' opened ' + (t.label || def.label) + ' in the background.');
    } else if (background) {
      t.marks.attention = true; paintTab(t);
      if (!p.active) activateTab(t, { focus: false });
    } else {
      activateTab(t, { focus: spec.focus !== false, user: true, reason: 'open' });
    }
    if (def.eager && !t.mounted) mountTab(t);
    var res = { ok: true, tabId: id, panelId: p.id, created: true };
    logEvent('open', { tabId: id, panelId: p.id, kind: def.id, created: true, by: by });
    bus.emit('open', { tabId: id, panelId: p.id, kind: def.id, created: true, by: by });
    layoutChanged('open');
    return res;
  }
  function splitWith(p, direction, spec, fromTab) {
    var def = kinds.get(spec.kind || (fromTab && fromTab.kind)); if (!def) return { ok: false, reason: 'unknown-kind' };
    var dir = direction;
    if (dir === 'auto') {
      var r = p.el.getBoundingClientRect(), m = minOf(p, def);
      var wNeed = Math.max(m.w, 120), hNeed = Math.max(m.h, 60);
      if ((r.width - 6) / 2 >= wNeed) dir = 'right';
      else if ((r.height - 6) / 2 - stripH() >= hNeed) dir = 'down';
      else dir = 'tab';
    }
    if (dir === 'tab') return open(Object.assign({}, spec, { where: p.id }), { source: p });
    var np = splitPanel(p, dir === 'down' ? 'down' : 'right');
    return open(Object.assign({}, spec, { where: np.id }), { source: p });
  }
  function usualSpec(p) {
    var kind = null;
    if (p && p.tabs.length) {
      var ded = p.tabs.every(function (t) { return t.def.dedicated && t.kind === p.tabs[0].kind; });
      kind = ded ? p.tabs[0].kind : (p.active ? p.active.kind : null);
    }
    var def = kind ? kinds.get(kind) : null;
    if (def && def.plus && def.plus.spec) return Object.assign({}, def.plus.spec(null));
    if (def) return { kind: def.id };
    return { kind: 'editor', text: '', title: 'Untitled' };
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Closing
     ------------------------------------------------------------------------------------------------------------------ */
  function closeTab(t, opts) {
    opts = opts || {};
    if (!tabs.has(t.id) || t.closing) return { ok: false, reason: 'gone' };
    var go = function (ok) {
      if (!ok) { t.closing = false; return { ok: false, reason: 'kept' }; }
      reallyClose(t); return { ok: true, tabId: t.id };
    };
    t.closing = true;
    if (!opts.force && t.mounted && t.inst && t.inst.canClose) {
      if (!t.visible) activateTab(t, { user: true });
      var r = safe(function () { return t.inst.canClose(); }, t.kind + ' canClose');
      if (r && typeof r.then === 'function') return r.then(function (v) { return go(v !== false); }, function () { return go(false); });
      return go(r !== false);
    }
    return go(true);
  }
  function reallyClose(t) {
    var p = t.panel, wasActive = p && p.active === t, hadFocus = t.body.contains(doc.activeElement);
    var saved = { id: t.id, kind: t.kind, state: t.mounted && t.inst && t.inst.serialize ? safe(function () { return t.inst.serialize(); }, 'serialize') : t.state, label: t.label };
    closedStack.push(saved); if (closedStack.length > 20) closedStack.shift();
    if (t.visible && t.inst && t.inst.onHide) safe(function () { t.inst.onHide(); }, t.kind + ' onHide');
    if (t.mounted && t.inst && t.inst.unmount) safe(function () { t.inst.unmount(); }, t.kind + ' unmount');
    t.subs.forEach(function (off) { safe(off, 'unsubscribe'); }); t.subs = [];
    resizeObserver.unobserve(t.body);
    tabs.delete(t.id);
    if (focusedTab === t) focusedTab = null;
    if (p) {
      var i = p.tabs.indexOf(t);
      p.tabs.splice(i, 1);
      if (p.preview === t) p.preview = null;
      t.tabEl.remove(); t.body.remove();
      if (wasActive) {
        p.active = null;
        var next = p.tabs[i] || p.tabs[i - 1];
        if (next) activateTab(next, { focus: hadFocus, user: true, reason: 'close' });
      }
      if (!p.tabs.length && panels.length > 1) { removePanelFromTree(p); renderLayout(); var lp = byRecency(panels)[0]; if (lp && hadFocus && lp.active) activateTab(lp.active, { focus: true, user: true }); }
      else { refreshVisibility(); fitStripSoon(p); }
    }
    bus.emit('close', { tabId: t.id, panelId: p ? p.id : null, kind: t.kind, reason: 'close' });
    logEvent('close', { tabId: t.id });
    layoutChanged('close');
  }
  function reopenClosed() {
    var s = closedStack.pop(); if (!s) { announce('No closed tab to reopen.'); return { ok: false, reason: 'none' }; }
    var spec = Object.assign({ kind: s.kind }, s.state || {});
    if (s.kind === 'editor') spec.id = s.id;
    return open(spec);
  }
  function closePanel(p) {
    var list = p.tabs.slice(), results = [];
    var chain = list.reduce(function (acc, t) {
      return acc.then(function () { return Promise.resolve(closeTab(t)).then(function (r) { results.push(r); }); });
    }, Promise.resolve());
    return chain.then(function () {
      if (!p.tabs.length && panels.length > 1 && panels.indexOf(p) >= 0) { removePanelFromTree(p); renderLayout(); layoutChanged('close_panel'); }
      return { ok: !p.tabs.length };
    });
  }
  function setMaximized(p) {
    if (p === maximized) return;
    maximized = p || null;
    command_log.push({ t: now(), id: 'ui.workspace_layout.maximize', args: { panelId: maximized ? maximized.id : null } });
    panels.forEach(function (x) { x.el.classList.toggle('pmw-maxed', x === maximized); });
    centre.classList.toggle('pmw-has-max', !!maximized);
    if (maximized) centre.scrollTo(0, 0);
    refreshVisibility();
    panels.forEach(fitStripSoon);
    announce(maximized ? 'Panel maximized. Press Escape in the tab strip or Ctrl+K M to restore.' : 'Panel restored.');
    bus.emit('maximize', { panelId: maximized ? maximized.id : null });
    scheduleSave();
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Announcements (polite live region)
     ------------------------------------------------------------------------------------------------------------------ */
  var announceTimer = 0;
  function announce(text) {
    if (!live) return;
    text = String(text || '');
    live.textContent = '';
    clearTimeout(announceTimer);
    announceTimer = setTimeout(function () { live.textContent = text; }, 40);
    logEvent('announce', { text: text });
    bus.emit('announce', text);
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Hover tags (stand-in for the hover thread's engine): [data-pmw-tag] + optional [data-pmw-tag-key]
     ------------------------------------------------------------------------------------------------------------------ */
  var tagEl = null, tagTimer = 0, tagFor = null;
  function showTag(target) {
    var text = target.getAttribute('data-pmw-tag'); if (!text) return;
    if (target.classList.contains('pmw-hbtn')) {
      var lab = target.querySelector('.pmw-hbtn-label');
      if (lab && getComputedStyle(lab).display !== 'none') return;   /* the label is showing; no tag needed */
    }
    if (!tagEl) { tagEl = el('div', 'pmw-tag', { role: 'tooltip' }); overlay.appendChild(tagEl); }
    tagEl.textContent = '';
    text.split('\n').forEach(function (line, i) { if (i) tagEl.appendChild(el('br')); tagEl.appendChild(doc.createTextNode(line)); });
    var key = target.getAttribute('data-pmw-tag-key');
    if (key) tagEl.appendChild(txt('span', 'pmw-tag-key', key));
    tagEl.hidden = false;
    var r = target.getBoundingClientRect(), tr = tagEl.getBoundingClientRect();
    var x = clamp(r.left + r.width / 2 - tr.width / 2, 4, innerWidth - tr.width - 4);
    var y = r.bottom + 6; if (y + tr.height > innerHeight - 4) y = r.top - tr.height - 6;
    tagEl.style.left = x + 'px'; tagEl.style.top = y + 'px';
  }
  function hideTag() { clearTimeout(tagTimer); tagFor = null; if (tagEl) tagEl.hidden = true; }
  doc.addEventListener('pointerover', function (e) {
    var t = e.target.closest ? e.target.closest('[data-pmw-tag]') : null;
    if (t === tagFor) return;
    hideTag();
    if (!t || doc.body.classList.contains('pm-resizing')) return;
    tagFor = t; tagTimer = setTimeout(function () { if (tagFor === t && t.isConnected) showTag(t); }, 450);
  });
  doc.addEventListener('pointerdown', hideTag, true);
  doc.addEventListener('focusin', function (e) {
    hideTag();
    var t = e.target; if (t && t.matches && t.matches(':focus-visible') && t.hasAttribute('data-pmw-tag')) { tagFor = t; showTag(t); }
  });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTag(); }, true);

  /* ------------------------------------------------------------------------------------------------------------------
     Menus (api.menu): the picker look, keyboard navigable, in #pmw-overlay
     ------------------------------------------------------------------------------------------------------------------ */
  var menuStack = [];   /* open menus, innermost last */
  /* a menu opened by pointer focuses its container (arrows then start at the first row); by keyboard, its first row */
  var lastInputPointer = false;
  doc.addEventListener('pointerdown', function () { lastInputPointer = true; }, true);
  doc.addEventListener('keydown', function () { lastInputPointer = false; }, true);
  function anchorRect(anchor) {
    if (!anchor) return { left: innerWidth / 2, right: innerWidth / 2, top: innerHeight / 3, bottom: innerHeight / 3 };
    if (anchor.getBoundingClientRect) return anchor.getBoundingClientRect();
    if (anchor.clientX != null) return { left: anchor.clientX, right: anchor.clientX, top: anchor.clientY, bottom: anchor.clientY };
    if (anchor.x != null) return { left: anchor.x, right: anchor.x + (anchor.w || 0), top: anchor.y, bottom: anchor.y + (anchor.h || 0) };
    return { left: 0, right: 0, top: 0, bottom: 0 };
  }
  function placeMenu(m, rect, side) {
    var mr = m.getBoundingClientRect(), W = innerWidth, H = innerHeight, x, y;
    if (side) {
      x = rect.right + 2; if (x + mr.width > W - 4) x = rect.left - mr.width - 2;
      y = rect.top - 5; if (y + mr.height > H - 4) y = H - mr.height - 4;
    } else {
      x = rect.left; if (x + mr.width > W - 4) x = Math.max(4, rect.right - mr.width);
      y = rect.bottom + 4; if (y + mr.height > H - 4) y = Math.max(4, rect.top - mr.height - 4);
    }
    m.style.left = clamp(x, 4, Math.max(4, W - mr.width - 4)) + 'px';
    m.style.top = clamp(y, 4, Math.max(4, H - mr.height - 4)) + 'px';
  }
  function closeMenusFrom(level, restore) {
    while (menuStack.length > level) {
      var m = menuStack.pop();
      m.el.remove();
      if (m.anchorEl && m.anchorEl.getAttribute && m.anchorEl.hasAttribute('aria-expanded')) m.anchorEl.setAttribute('aria-expanded', 'false');
      if (m.onClose) safe(m.onClose, 'menu onClose');
      if (restore && menuStack.length === level && m.returnFocus && m.returnFocus.isConnected) m.returnFocus.focus({ preventScroll: true });
    }
  }
  function closeAllMenus(restore) { closeMenusFrom(0, restore); }
  doc.addEventListener('pointerdown', function (e) {
    if (!menuStack.length) return;
    for (var i = 0; i < menuStack.length; i++) {
      if (menuStack[i].el.contains(e.target)) { closeMenusFrom(i + 1, false); return; }
    }
    var anc = menuStack[0].anchorEl;
    closeAllMenus(false);
    if (anc && anc.contains && anc.contains(e.target)) { e.stopPropagation(); swallowClick = anc; }
  }, true);
  var swallowClick = null;
  doc.addEventListener('click', function (e) { if (swallowClick && swallowClick.contains(e.target)) { e.stopPropagation(); e.preventDefault(); } swallowClick = null; }, true);
  window.addEventListener('blur', function () { closeAllMenus(false); hideTag(); });
  window.addEventListener('resize', function () { closeAllMenus(false); });

  function normItems(items) {
    if (typeof items === 'function') items = items();
    return (items || []).filter(function (x) { return x != null && x !== false; });
  }
  function openMenu(items, anchor, opts) {
    opts = opts || {};
    var level = opts.level || 0;
    if (!level) closeAllMenus(false); else closeMenusFrom(level, false);
    items = normItems(items);
    var m = el('div', 'pmw-menu', { role: 'menu', tabindex: '-1' });
    if (opts.label) m.setAttribute('aria-label', opts.label);
    var anchorEl = anchor && anchor.nodeType === 1 ? anchor : null;
    var hasChecks = items.some(function (it) { return it && typeof it === 'object' && it.checked != null; });
    var hasIcons = items.some(function (it) { return it && typeof it === 'object' && it.icon; });
    var rows = [];
    items.forEach(function (it) {
      if (it === '-' || it.type === 'separator') { m.appendChild(el('div', 'pmw-msep', { role: 'separator' })); return; }
      if (it.type === 'heading') { m.appendChild(txt('div', 'pmw-mhead', it.label)); return; }
      var row = el('div', 'pmw-mrow pmw-cur', { role: it.checked != null ? 'menuitemcheckbox' : 'menuitem', tabindex: '-1' });
      if (it.checked != null) { row.setAttribute('aria-checked', it.checked ? 'true' : 'false'); if (it.checked) row.classList.add('pmw-chosen'); }
      if (it.disabled) row.setAttribute('aria-disabled', 'true');
      if (it.danger) row.classList.add('pmw-danger');
      if (it.sub) { row.setAttribute('aria-haspopup', 'menu'); row.setAttribute('aria-expanded', 'false'); }
      if (hasChecks || hasIcons) {
        var slot = el('span', 'pmw-mrow-slot');
        slot.innerHTML = it.checked ? iconSvg('check') : (it.icon ? iconSvg(it.icon) : '');
        row.appendChild(slot);
      }
      row.appendChild(txt('span', 'pmw-mrow-label', it.label));
      if (it.detail) row.appendChild(txt('span', 'pmw-mrow-detail', it.detail));
      if (it.shortcut) row.appendChild(txt('span', 'pmw-mrow-key', it.shortcut));
      if (it.sub) { var sv = el('span', 'pmw-mrow-sub'); sv.innerHTML = iconSvg('chevron'); row.appendChild(sv); }
      var aria = it.label + (it.detail ? ', ' + it.detail : '');
      row.setAttribute('aria-label', aria);
      if (it.shortcut) row.setAttribute('aria-keyshortcuts', it.shortcut);
      row._item = it;
      rows.push(row);
      m.appendChild(row);
      row.addEventListener('pointerenter', function () {
        setCur(rows.indexOf(row), true);
        if (it.sub && !it.disabled) hoverSub(row); else if (menuStack.length > level + 1) closeMenusFrom(level + 1, false);
      });
      row.addEventListener('click', function (e) { e.stopPropagation(); choose(row, e); });
    });
    if (!rows.length) { m.appendChild(txt('div', 'pmw-pempty', opts.empty || 'Nothing to show')); }
    overlay.appendChild(m);
    var rec = { el: m, anchorEl: anchorEl, returnFocus: opts.returnFocus || anchorEl || (doc.activeElement !== doc.body ? doc.activeElement : null), onClose: opts.onClose, level: level };
    menuStack.push(rec);
    if (anchorEl && anchorEl.hasAttribute('aria-expanded')) anchorEl.setAttribute('aria-expanded', 'true');
    placeMenu(m, anchorRect(anchor), !!opts.side);
    var cur = -1, subTimer = 0;
    function enabled(i) { return rows[i] && rows[i].getAttribute('aria-disabled') !== 'true'; }
    function setCur(i, fromPointer) {
      rows.forEach(function (r) { r.classList.remove('pmw-on'); });
      cur = i;
      if (rows[i]) { rows[i].classList.add('pmw-on'); rows[i].focus({ preventScroll: !!fromPointer }); if (!fromPointer) rows[i].scrollIntoView({ block: 'nearest' }); }
    }
    function step(d) {
      if (!rows.length) return;
      var i = cur;
      for (var n = 0; n < rows.length; n++) { i = (i + d + rows.length) % rows.length; if (enabled(i)) { setCur(i); return; } }
    }
    function hoverSub(row) { clearTimeout(subTimer); subTimer = setTimeout(function () { if (row.isConnected && rows[cur] === row) openSub(row, false); }, 160); }
    function openSub(row, focusFirst) {
      var it = row._item;
      row.setAttribute('aria-expanded', 'true');
      openMenu(it.sub, row, { level: level + 1, side: true, returnFocus: row, focusFirst: focusFirst, onClose: function () { row.setAttribute('aria-expanded', 'false'); } });
    }
    function choose(row, e) {
      var it = row._item;
      if (!it || it.disabled) return;
      if (it.sub) { openSub(row, true); return; }
      closeAllMenus(true);
      if (it.run) safe(function () { it.run(it, e); }, 'menu item ' + (it.id || it.label));
      if (opts.onChoose) safe(function () { opts.onChoose(it, e); }, 'menu choose');
    }
    m.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowDown') { e.preventDefault(); step(1); }
      else if (k === 'ArrowUp') { e.preventDefault(); step(-1); }
      else if (k === 'Home') { e.preventDefault(); cur = -1; step(1); }
      else if (k === 'End') { e.preventDefault(); cur = rows.length; step(-1); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); if (rows[cur]) choose(rows[cur], e); }
      else if (k === 'ArrowRight') { e.preventDefault(); if (rows[cur] && rows[cur]._item.sub && enabled(cur)) openSub(rows[cur], true); }
      else if (k === 'ArrowLeft' && level > 0) { e.preventDefault(); closeMenusFrom(level, true); }
      else if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); closeMenusFrom(level, true); }
      else if (k === 'Tab') { e.preventDefault(); closeAllMenus(true); }
      else if (k.length === 1 && /\S/.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        var lk = k.toLowerCase();
        for (var n = 1; n <= rows.length; n++) {
          var i = (cur + n) % rows.length;
          if (enabled(i) && String(rows[i]._item.label || '').toLowerCase().indexOf(lk) === 0) { setCur(i); break; }
        }
      }
      e.stopPropagation();
    });
    var focusFirst = opts.focusFirst != null ? opts.focusFirst : !lastInputPointer;
    if (focusFirst) { cur = -1; step(1); if (cur < 0) m.focus({ preventScroll: true }); }
    else m.focus({ preventScroll: true });
    return { el: m, close: function () { closeMenusFrom(level, false); } };
  }

  /* ------------------------------------------------------------------------------------------------------------------
     The "+" menu and the empty-panel launcher (section 7)
     ------------------------------------------------------------------------------------------------------------------ */
  function plusRows() {
    var list = [];
    kinds.forEach(function (def) { if (def.plus) list.push(def); });
    list.sort(function (a, b) { return (a.plus.order || 100) - (b.plus.order || 100); });
    return list;
  }
  function openFromPlus(p, def, subId, asPanel) {
    var spec = def.plus.spec ? def.plus.spec(subId) : { kind: def.id };
    spec = Object.assign({ kind: def.id }, spec, { where: asPanel ? 'panel' : p.id, by: 'user' });
    return open(spec, { source: p });
  }
  /* builds the row list (rows of { el, cells: [focusable], filterText }) into container; used by both surfaces */
  function buildPlusList(container, p, onDone, isLauncher) {
    var cells = [];
    plusRows().forEach(function (def) {
      var label = def.plus.label || def.label || def.id;
      var row = el('div', 'pmw-prow');
      var body = el('div', 'pmw-mrow pmw-cur', { role: 'menuitem', tabindex: '-1', 'aria-label': label + ' (new tab here)' });
      var slot = el('span', 'pmw-mrow-slot'); slot.innerHTML = iconSvg(def.icon || 'box'); body.appendChild(slot);
      body.appendChild(txt('span', 'pmw-mrow-label', label));
      if (def.plus.shortcut) { body.appendChild(txt('span', 'pmw-mrow-key', def.plus.shortcut)); body.setAttribute('aria-keyshortcuts', def.plus.shortcut); }
      var np = el('div', 'pmw-pnew', { role: 'menuitem', tabindex: '-1', 'aria-label': label + ' in a new panel', 'data-pmw-tag': 'Open in a new panel', 'data-pmw-tag-key': 'Alt+Enter' });
      np.innerHTML = iconSvg('new-panel');
      row.appendChild(body); row.appendChild(np);
      container.appendChild(row);
      var go = function (asPanel) { onDone(); openFromPlus(p, def, null, asPanel); };
      body.addEventListener('click', function (e) { go(e.altKey); });
      np.addEventListener('click', function () { go(true); });
      var rowCells = [{ el: body, run: go, filter: label, row: row }, { el: np, run: function () { go(true); }, filter: label, row: row, isNew: true }];
      cells.push(rowCells[0]); cells.push(rowCells[1]);
      var subs = def.plus.sub ? safe(function () { return def.plus.sub(); }, def.id + ' plus.sub') : null;
      if (subs && subs.length) {
        var sr = el('div', 'pmw-psub');
        subs.forEach(function (s) {
          var si = txt('span', 'pmw-psub-item', s.label);
          si.setAttribute('role', 'menuitem'); si.tabIndex = -1;
          si.setAttribute('aria-label', label + ': ' + s.label + (s.detail ? ', ' + s.detail : ''));
          if (s.detail) { si.setAttribute('data-pmw-tag', s.detail); }
          var goSub = function (asPanel) { onDone(); openFromPlus(p, def, s.id, asPanel); };
          si.addEventListener('click', function (e) { goSub(e.altKey); });
          sr.appendChild(si);
          cells.push({ el: si, run: goSub, filter: label + ' ' + s.label + ' ' + (s.detail || ''), row: sr, sub: true });
        });
        container.appendChild(sr);
        row._sub = sr;
      }
    });
    if (!cells.length) container.appendChild(txt('div', 'pmw-pempty', 'No tab kinds are registered yet.'));
    if (!isLauncher) {
      container.appendChild(el('div', 'pmw-msep', { role: 'separator' }));
      var extra = [
        { label: 'Split right', key: 'Ctrl+\\', icon: 'split', run: function () { splitWith(p, 'right', usualSpec(p)); } },
        { label: 'Split down', key: 'Ctrl+K Ctrl+\\', icon: 'split-down', run: function () { splitWith(p, 'down', usualSpec(p)); } },
        { label: 'Reopen closed tab', key: 'Ctrl+Shift+T', icon: 'reopen', disabled: !closedStack.length, run: reopenClosed }
      ];
      extra.forEach(function (x) {
        var r = el('div', 'pmw-mrow pmw-cur', { role: 'menuitem', tabindex: '-1', 'aria-label': x.label });
        if (x.disabled) r.setAttribute('aria-disabled', 'true');
        var slot = el('span', 'pmw-mrow-slot'); slot.innerHTML = iconSvg(x.icon); r.appendChild(slot);
        r.appendChild(txt('span', 'pmw-mrow-label', x.label)); r.appendChild(txt('span', 'pmw-mrow-key', x.key));
        container.appendChild(r);
        var run = function () { if (x.disabled) return; onDone(); x.run(); };
        r.addEventListener('click', run);
        cells.push({ el: r, run: run, filter: x.label, row: r, fixed: true, disabled: x.disabled });
      });
    }
    return cells;
  }
  function wireCells(scope, cells, filterInput) {
    var cur = -1;
    function visible(c) { return !c.el.closest('[hidden]') && c.el.offsetParent !== null && !c.disabled; }
    function setCur(i) {
      cells.forEach(function (c) { c.el.classList.remove('pmw-on'); });
      cur = i; var c = cells[i];
      if (c) { c.el.classList.add('pmw-on'); c.el.focus({ preventScroll: true }); c.el.scrollIntoView({ block: 'nearest' }); }
    }
    function stepRow(d) {
      /* up/down moves between rows' first cells and sub items; right/left moves within a row */
      var i = cur;
      for (var n = 0; n < cells.length; n++) {
        i += d; if (i < 0 || i >= cells.length) { if (filterInput && d < 0) { cur = -1; cells.forEach(function (c) { c.el.classList.remove('pmw-on'); }); filterInput.focus(); return; } i = d > 0 ? 0 : cells.length - 1; }
        if (visible(cells[i]) && !cells[i].isNew) { setCur(i); return; }
      }
    }
    cells.forEach(function (c, i) { c.el.addEventListener('pointerenter', function () { if (visible(c)) setCur(i); }); });
    scope.addEventListener('keydown', function (e) {
      var k = e.key;
      if (e.target === filterInput) {
        if (k === 'ArrowDown') { e.preventDefault(); cur = -1; stepRow(1); }
        else if (k === 'Enter') { e.preventDefault(); var f = cells.filter(visible)[0]; if (f) f.run(e.altKey); }
        return;
      }
      if (k === 'ArrowDown') { e.preventDefault(); stepRow(1); }
      else if (k === 'ArrowUp') { e.preventDefault(); stepRow(-1); }
      else if (k === 'ArrowRight') { e.preventDefault(); if (cells[cur + 1] && (cells[cur + 1].row === cells[cur].row || cells[cur].sub) && visible(cells[cur + 1])) setCur(cur + 1); }
      else if (k === 'ArrowLeft') { e.preventDefault(); if (cur > 0 && (cells[cur - 1].row === cells[cur].row || cells[cur].sub && cells[cur - 1].sub) && visible(cells[cur - 1])) setCur(cur - 1); }
      else if (k === 'Home') { e.preventDefault(); cur = -1; stepRow(1); }
      else if (k === 'End') { e.preventDefault(); cur = cells.length; stepRow(-1); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); if (cells[cur]) cells[cur].run(e.altKey || cells[cur].isNew); }
      else if (filterInput && k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { filterInput.focus(); }
    });
    return { first: function () { cur = -1; stepRow(1); } };
  }
  function openPlusMenu(p, anchor, opts) {
    opts = opts || {};
    closeAllMenus(false);
    var m = el('div', 'pmw-menu pmw-plusmenu', { role: 'menu', tabindex: '-1', 'aria-label': 'Open a tab or panel' });
    var f = el('label', 'pmw-pfilter'); f.innerHTML = iconSvg('search');
    var input = el('input', '', { type: 'text', placeholder: 'Open anything: kinds, files, URLs', 'aria-label': 'Filter', autocomplete: 'off', spellcheck: 'false' });
    f.appendChild(input); m.appendChild(f);
    var done = function () { closeAllMenus(false); };
    var list = el('div', 'pmw-plist'); m.appendChild(list);
    var cells = buildPlusList(list, p, done, false);
    overlay.appendChild(m);
    var rec = { el: m, anchorEl: anchor && anchor.nodeType === 1 ? anchor : null, returnFocus: anchor && anchor.nodeType === 1 ? anchor : (p.active ? p.active.tabEl : null), level: 0 };
    menuStack.push(rec);
    if (rec.anchorEl) rec.anchorEl.setAttribute('aria-expanded', 'true');
    placeMenu(m, anchorRect(anchor), false);
    var nav = wireCells(m, cells, input);
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      list.querySelectorAll('.pmw-prow, .pmw-psub, .pmw-psub-item, .pmw-msep, :scope > .pmw-mrow').forEach(function (n) { n.hidden = false; });
      if (!q) return;
      cells.forEach(function (c) {
        var hit = c.filter.toLowerCase().indexOf(q) >= 0;
        if (c.sub) c.el.hidden = !hit;
        else if (!c.isNew) c.row.hidden = !hit;
      });
      list.querySelectorAll('.pmw-psub').forEach(function (s) {
        var any = Array.from(s.children).some(function (c) { return !c.hidden; });
        s.hidden = !any;
        var prev = s.previousElementSibling; if (any && prev && prev.hidden) prev.hidden = false;
      });
      list.querySelectorAll('.pmw-msep').forEach(function (s) { s.hidden = true; });
    });
    m.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeAllMenus(true); }
      else if (e.key === 'Tab') { e.preventDefault(); closeAllMenus(true); }
    });
    if (opts.keyboard) nav.first(); else input.focus();
    return { el: m, close: done };
  }
  function paintLauncher(p) {
    p.launch.textContent = '';
    var wrap = el('div', 'pmw-launch-list', { role: 'menu', 'aria-label': 'Open in this panel' });
    wrap.appendChild(txt('div', 'pmw-launch-head', 'Open in this panel'));
    var cells = buildPlusList(wrap, p, function () {}, true);
    p.launch.appendChild(wrap);
    if (cells[0]) cells[0].el.tabIndex = 0;
    wireCells(wrap, cells, null);
    p.launchSig = kinds.size;
  }
  function paintAllLaunchers() { panels.forEach(function (p) { if (!p.tabs.length) paintLauncher(p); }); }

  function openOverflowMenu(p) {
    var groups = {};
    (p.hiddenTabs || []).forEach(function (t) { var g = t.def.group || t.def.label || t.kind; (groups[g] = groups[g] || []).push(t); });
    var items = [];
    Object.keys(groups).forEach(function (g, i) {
      if (i) items.push('-');
      items.push({ type: 'heading', label: g });
      groups[g].forEach(function (t) {
        items.push({ id: t.id, label: t.userLabel || t.label, icon: t.icon, detail: t.marks.agent ? t.marks.agent + ' driving' : '', run: function () {
          p.tabs.splice(p.tabs.indexOf(t), 1); p.tabs.unshift(t); p.tabsEl.insertBefore(t.tabEl, p.tabsEl.firstChild);
          activateTab(t, { focus: true, user: true });
        } });
      });
    });
    openMenu(items, p.overflowBtn, { label: 'Hidden tabs' });
  }
  function openPanelMenu(p, anchor) {
    var isMax = maximized === p;
    openMenu([
      { id: 'split-right', label: 'Split right', icon: 'split', shortcut: 'Ctrl+\\', run: function () { splitWith(p, 'right', usualSpec(p)); } },
      { id: 'split-down', label: 'Split down', icon: 'split-down', shortcut: 'Ctrl+K Ctrl+\\', run: function () { splitWith(p, 'down', usualSpec(p)); } },
      { id: 'max', label: isMax ? 'Restore' : 'Maximize', icon: isMax ? 'restore' : 'maximize', shortcut: 'Ctrl+K M', run: function () { setMaximized(isMax ? null : p); } },
      '-',
      { id: 'close-panel', label: 'Close panel', icon: 'close', danger: true, disabled: panels.length < 2 && !p.tabs.length, run: function () { closePanel(p); } }
    ], anchor, { label: 'Panel menu' });
  }
  function openTabMenu(t, anchor) {
    var p = t.panel, isMax = maximized === p;
    openMenu([
      { id: 'close', label: 'Close', icon: 'close', shortcut: 'Ctrl+W', run: function () { closeTab(t); } },
      { id: 'close-others', label: 'Close others', disabled: p.tabs.length < 2, run: function () { p.tabs.slice().forEach(function (x) { if (x !== t) closeTab(x); }); } },
      t.preview ? { id: 'keep', label: 'Keep open', run: function () { keepTab(t); } } : null,
      '-',
      { id: 'max', label: isMax ? 'Restore' : 'Maximize', icon: isMax ? 'restore' : 'maximize', shortcut: 'Ctrl+K M', run: function () { setMaximized(isMax ? null : p); } }
    ], anchor, { label: 'Tab menu', returnFocus: t.tabEl });
  }

  /* ------------------------------------------------------------------------------------------------------------------
     The shared header row (section 5)
     ------------------------------------------------------------------------------------------------------------------ */
  var hrowObserver = new ResizeObserver(function (entries) { entries.forEach(function (en) { if (en.target._pmwFit) en.target._pmwFit(); }); });
  function headerRow(spec, api) {
    spec = spec || {};
    var row = el('div', 'pmw-hrow');
    var left = el('div', 'pmw-hrow-left');
    var acts = el('div', 'pmw-hrow-actions', { role: 'toolbar', 'aria-label': 'Tab actions' });
    row.appendChild(left); row.appendChild(acts);
    var leftItems = [], actions = [];
    function paintLeft() {
      left.textContent = '';
      leftItems.forEach(function (it) {
        if (!it) return;
        var f = el(it.run ? 'button' : 'span', 'pmw-hfact' + (it.mono ? ' pmw-hfact-mono' : ''));
        if (it.run) { f.type = 'button'; f.addEventListener('click', function (e) { it.run(e); }); }
        if (it.id) f.setAttribute('data-pmw-fact', it.id);
        f._item = it;
        if (it.icon) f.insertAdjacentHTML('beforeend', iconSvg(it.icon));
        /* a mono fact is a path: it ellipsizes at its start, so the folder name stays readable */
        f.appendChild(txt('span', 'pmw-hfact-text', it.mono ? '\u200E' + it.text + '\u200E' : it.text));
        if (it.detail) f.appendChild(txt('span', 'pmw-hfact-detail', it.detail));
        if (it.title) f.setAttribute('data-pmw-tag', it.title + ': ' + it.text + (it.detail ? ' (' + it.detail + ')' : ''));
        left.appendChild(f);
      });
      fitLeft();
    }
    /* facts never shrink to a stub: when the row is tight, whole facts hide (lowest priority first; by default the
       last one), and only the first fact ellipsizes. Optional item.priority: higher stays longer. */
    function fitLeft() {
      var facts = Array.prototype.slice.call(left.children);
      if (facts.length < 2 || !row.isConnected) return;
      facts.forEach(function (f) { f.hidden = false; });
      var firstText = facts[0].querySelector('.pmw-hfact-text');
      function tight() {
        if (left.scrollWidth > left.clientWidth + 1) return true;
        return !!firstText && firstText.clientWidth + 1 < Math.min(firstText.scrollWidth, 150);
      }
      if (!left.clientWidth || !tight()) return;
      var order = facts.slice(1).map(function (f, i) { var it = f._item || {}; return { f: f, p: it.priority != null ? it.priority : -(i + 1) }; })
        .sort(function (a, b) { return a.p - b.p; });
      for (var k = 0; k < order.length && tight(); k++) order[k].f.hidden = true;
    }
    row._pmwFit = fitLeft;
    hrowObserver.observe(row);
    function paintActions() {
      acts.textContent = '';
      actions.forEach(function (a) {
        if (!a) return;
        var b = el('button', 'pmw-hbtn', { type: 'button', 'data-pmh': 'icon', 'data-pmw-action': a.id, 'aria-label': a.label });
        if (a.icon === 'more' || a.iconOnly) b.classList.add('pmw-hbtn-icononly');
        if (a.icon) b.insertAdjacentHTML('beforeend', iconSvg(a.icon));
        b.appendChild(txt('span', 'pmw-hbtn-label', a.label));
        b.setAttribute('data-pmw-tag', a.label);
        if (a.shortcut) { b.setAttribute('data-pmw-tag-key', a.shortcut); b.setAttribute('aria-keyshortcuts', a.shortcut); }
        if (a.disabled) b.disabled = true;
        if (a.pressed != null) b.setAttribute('aria-pressed', a.pressed ? 'true' : 'false');
        if (a.menu) { b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', 'false'); }
        b.addEventListener('click', function (e) {
          if (a.menu) { var items = typeof a.menu === 'function' ? a.menu() : a.menu; openMenu(items, b, { label: a.label }); return; }
          if (a.run) a.run(e);
        });
        a._el = b;
        acts.appendChild(b);
      });
    }
    leftItems = (spec.left || []).slice(); actions = (spec.actions || []).map(function (a) { return Object.assign({}, a); });
    paintLeft(); paintActions();
    return {
      el: row,
      set: function (patch) {
        patch = patch || {};
        if (patch.left) { leftItems = patch.left.slice(); paintLeft(); }
        if (patch.actions) { actions = patch.actions.map(function (a) { return Object.assign({}, a); }); paintActions(); }
      },
      setAction: function (id, patch) {
        var a = actions.filter(function (x) { return x && x.id === id; })[0]; if (!a) return;
        var hadFocus = a._el && doc.activeElement === a._el;
        Object.assign(a, patch || {}); paintActions();
        if (hadFocus && a._el) a._el.focus({ preventScroll: true });
      }
    };
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Keyboard (section 9): the host map runs only when the focused tab's wantsKey(e) returns false
     ------------------------------------------------------------------------------------------------------------------ */
  var chord = null, chordTimer = 0;
  function hostAction(e) {
    var ctrl = e.ctrlKey || e.metaKey, k = e.key, code = e.code;
    if (chord) {
      if (k === 'Control' || k === 'Shift' || k === 'Alt' || k === 'Meta') return null;
      if (!e.shiftKey && (k === 'm' || k === 'M')) return 'maximize';
      if (ctrl && (k === '\\' || code === 'Backslash')) return 'split-down';
      if (/^[1-9]$/.test(k) && !ctrl) return 'focus-panel-' + k;
      if (k === 'ArrowRight' || k === 'ArrowDown') return 'focus-next-panel';
      if (k === 'ArrowLeft' || k === 'ArrowUp') return 'focus-prev-panel';
      return 'chord-cancel';
    }
    if (!ctrl || e.altKey) return null;
    if (!e.shiftKey && (k === 't' || k === 'T')) return 'new-tab';
    if (e.shiftKey && (k === 't' || k === 'T')) return 'reopen';
    if (!e.shiftKey && (k === 'w' || k === 'W')) return 'close';
    if (e.shiftKey && (code === 'Backquote' || k === '~' || k === '`')) return 'new-terminal';
    if (e.shiftKey && (code === 'Space' || k === ' ')) return 'plus';
    if (!e.shiftKey && k === 'PageDown') return 'next-tab';
    if (!e.shiftKey && k === 'PageUp') return 'prev-tab';
    if (!e.shiftKey && (k === '\\' || code === 'Backslash')) return 'split-right';
    if (!e.shiftKey && (k === 'k' || k === 'K')) return 'chord';
    if (!e.shiftKey && /^[1-9]$/.test(k)) return 'tab-' + k;
    return null;
  }
  window.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || !centre) return;
    var a = doc.activeElement;
    var inCentre = a && (centre.contains(a) || a === doc.body);
    var inMenu = a && overlay && overlay.contains(a);
    if (!inCentre || inMenu) { if (chord && !inMenu) cancelChord(); return; }
    var act = hostAction(e);
    if (!act) return;
    var body = a.closest ? a.closest('.pmw-body') : null, t = body ? tabByBody(body) : null;
    if (t && t.inst && t.inst.wantsKey && act !== 'chord-cancel') {
      var keep = safe(function () { return t.inst.wantsKey(e); }, t.kind + ' wantsKey');
      if (keep === true) { if (chord) cancelChord(); return; }
    }
    if (act === 'chord-cancel') { cancelChord(); return; }
    e.preventDefault(); e.stopPropagation();
    runHostAction(act, t ? t.panel : focusPanel);
  }, true);
  function cancelChord() { chord = null; clearTimeout(chordTimer); bus.emit('chord', null); }
  function runHostAction(act, p) {
    p = p || focusPanel || panels[0];
    if (act === 'chord') { chord = { at: now() }; clearTimeout(chordTimer); chordTimer = setTimeout(cancelChord, 1500); bus.emit('chord', 'Ctrl+K'); return; }
    if (chord) cancelChord();
    if (!p) return;
    var vis = p.tabs.filter(function (x) { return !x.tabEl.hidden; }), i = vis.indexOf(p.active);
    switch (act) {
      case 'new-tab': open(Object.assign({}, usualSpec(p), { where: p.id }), { source: p }); break;
      case 'reopen': reopenClosed(); break;
      case 'close': if (p.active) closeTab(p.active); break;
      case 'new-terminal':
        if (kinds.has('terminal')) { var td = kinds.get('terminal'); open(Object.assign({ kind: 'terminal' }, td.plus && td.plus.spec ? td.plus.spec(null) : {}), { source: p }); }
        else announce('The terminal is not loaded.');
        break;
      case 'plus': openPlusMenu(p, p.plusBtn, { keyboard: true }); break;
      case 'next-tab': if (vis.length) activateTab(vis[(i + 1) % vis.length], { focus: true, user: true }); break;
      case 'prev-tab': if (vis.length) activateTab(vis[(i - 1 + vis.length) % vis.length], { focus: true, user: true }); break;
      case 'split-right': splitWith(p, 'right', usualSpec(p)); break;
      case 'split-down': splitWith(p, 'down', usualSpec(p)); break;
      case 'maximize': setMaximized(maximized === p ? null : p); if (p.active) focusTab(p.active); break;
      case 'focus-next-panel': case 'focus-prev-panel': {
        var j = panels.indexOf(p) + (act === 'focus-next-panel' ? 1 : -1);
        var q = panels[(j + panels.length) % panels.length]; if (q && q.active) activateTab(q.active, { focus: true, user: true }); break;
      }
      default:
        if (/^tab-/.test(act)) { var n = +act.slice(4), tt = n === 9 ? vis[vis.length - 1] : vis[n - 1]; if (tt) activateTab(tt, { focus: true, user: true }); }
        else if (/^focus-panel-/.test(act)) { var pp = panels[+act.slice(12) - 1]; if (pp && pp.active) activateTab(pp.active, { focus: true, user: true }); }
    }
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Persistence (pm.home.panels:v1:<project>): tree, tabs (serialize()), active tabs, maximize
     ------------------------------------------------------------------------------------------------------------------ */
  var saveTimer = 0;
  function scheduleSave() { if (!booted) return; clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }
  function serializeTab(t) {
    var st = t.state;
    if (t.mounted && t.inst && t.inst.serialize) {
      st = safe(function () { return t.inst.serialize(); }, t.kind + ' serialize') || {};
      var n = JSON.stringify(st).length;
      if (n > 16384) console.warn('[pm-home] ' + t.kind + ' serialize() returned ' + n + ' bytes; the contract limit is 16 KB');
    }
    return { id: t.id, kind: t.kind, state: st, label: t.label, title: t.title, userLabel: t.userLabel };
  }
  function save() {
    if (!tree) return;
    function ser(node) {
      if (node.t === 'leaf') {
        var p = node.panel;
        return { t: 'leaf', tabs: p.tabs.map(serializeTab), active: p.tabs.indexOf(p.active), focusTs: p.focusTs, max: maximized === p };
      }
      return { t: 'split', dir: node.dir, sizes: node.sizes.slice(), kids: node.kids.map(ser) };
    }
    try { localStorage.setItem(STORE_PANELS, JSON.stringify({ v: 1, tree: ser(tree) })); } catch (e) { console.warn('[pm-home] layout not saved', e); }
  }
  window.addEventListener('pagehide', save);
  function restore() {
    var data = null;
    try { data = JSON.parse(localStorage.getItem(STORE_PANELS) || 'null'); } catch (e) { data = null; }
    if (!data || data.v !== 1 || !data.tree) return false;
    var maxP = null, restoredTabs = 0;
    function build(n) {
      if (n.t === 'leaf') {
        var p = new Panel(); p.focusTs = n.focusTs || 0; focusClock = Math.max(focusClock, p.focusTs);
        (n.tabs || []).forEach(function (s) {
          var def = kinds.get(s.kind); if (!def || tabs.has(s.id)) return;
          var t = new Tab(s.id, def, s.state || {});
          if (s.label) t.label = s.label; if (s.title) t.title = s.title; t.userLabel = s.userLabel || null;
          tabs.set(t.id, t); addTabToPanel(t, p); paintTab(t); restoredTabs++;
        });
        var a = p.tabs[n.active] || p.tabs[0];
        if (a) { p.active = a; a.tabEl.setAttribute('aria-selected', 'true'); a.tabEl.tabIndex = 0; a.body.hidden = false; }
        if (n.max) maxP = p;
        return leaf(p);
      }
      var kids = (n.kids || []).map(build);
      return { t: 'split', dir: n.dir === 'col' ? 'col' : 'row', kids: kids, sizes: (n.sizes && n.sizes.length === kids.length) ? n.sizes.slice() : kids.map(function () { return 1; }) };
    }
    tree = build(data.tree);
    if (!restoredTabs) { tree = null; return false; }
    renderLayout();
    /* panels emptied by unregistered kinds go away */
    panels.slice().forEach(function (p) { if (!p.tabs.length && panels.length > 1) removePanelFromTree(p); });
    renderLayout();
    if (maxP && panels.indexOf(maxP) >= 0) setMaximized(maxP);
    focusPanel = byRecency(panels)[0] || panels[0];
    return true;
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Layout presets and reset (harness)
     ------------------------------------------------------------------------------------------------------------------ */
  function defaultSpec() {
    if (kinds.has('terminal')) return { kind: 'terminal' };
    if (kinds.has('stub')) return { kind: 'stub' };
    return null;
  }
  function applyPreset(name) {
    var want = name === 'one' ? 1 : name === 'two' ? 2 : 4;
    var list = panels.slice();
    while (list.length > want) {
      var extra = list.pop(), dest = list[list.length - 1];
      extra.tabs.slice().forEach(function (t) { extra.tabs.splice(extra.tabs.indexOf(t), 1); addTabToPanel(t, dest); });
      if (!dest.active && dest.tabs[0]) activateTab(dest.tabs[0], {});
      if (maximized === extra) maximized = null;
    }
    var fresh = [];
    while (list.length < want) { var np = new Panel(); list.push(np); fresh.push(np); }
    if (want === 1) tree = leaf(list[0]);
    else if (want === 2) tree = { t: 'split', dir: 'row', kids: [leaf(list[0]), leaf(list[1])], sizes: [1, 1] };
    else tree = { t: 'split', dir: 'col', sizes: [1, 1], kids: [
      { t: 'split', dir: 'row', kids: [leaf(list[0]), leaf(list[1])], sizes: [1, 1] },
      { t: 'split', dir: 'row', kids: [leaf(list[2]), leaf(list[3])], sizes: [1, 1] }] };
    maximized = null;
    renderLayout();
    var spec = defaultSpec();
    if (spec) fresh.forEach(function (p) { open(Object.assign({}, spec, { where: p.id, focus: false }), { source: p }); });
    layoutChanged('preset');
  }
  function resetLayout() {
    Array.from(tabs.values()).forEach(function (t) { closeTab(t, { force: true }); });
    tree = null; panels = []; maximized = null;
    var p = new Panel(); tree = leaf(p); renderLayout(); focusPanel = p;
    var spec = defaultSpec(); if (spec) open(spec, { source: p });
  }

  /* ------------------------------------------------------------------------------------------------------------------
     Harness-only kinds: the mock Editor (file: and buffer:) and a generic render kind for openEditor(render)
     ------------------------------------------------------------------------------------------------------------------ */
  var recentFiles = ['src/router.rs', 'src/media/import.rs', 'Cargo.toml'];
  function fakeSource(path, n) {
    var lines = [];
    var ext = (path.split('.').pop() || '').toLowerCase();
    var cm = ext === 'toml' || ext === 'py' || ext === 'sh' ? '# ' : '// ';
    lines.push(cm + path + ' (mock editor: the panels thread draws the real one)');
    for (var i = 2; i <= Math.max(n + 30, 60); i++) {
      if (i === n) lines.push('    let item = media::import(&state, req).await?;   ' + cm + 'the line that was opened');
      else if (i % 9 === 0) lines.push('');
      else if (i % 7 === 0) lines.push('    ' + cm + 'line ' + i);
      else lines.push('    let v' + i + ' = step(' + i + ');');
    }
    return lines;
  }
  function registerHarnessKinds() {
    registerKind('editor', {
      label: 'Editor', group: 'Editors', icon: 'file', prefixes: ['file:', 'buffer:'], min: { w: 280, h: 120 },
      idFor: function (spec) { return spec.path ? 'file:' + spec.path : 'buffer:' + (++bufferSeq); },
      plus: { order: 30, label: 'File\u2026', shortcut: 'Ctrl+P',
        sub: function () { return recentFiles.map(function (f) { return { id: f, label: f.split('/').pop(), detail: f, icon: 'file' }; }); },
        spec: function (subId) { return subId ? { kind: 'editor', path: subId } : { kind: 'editor', text: '', title: 'Untitled' }; } },
      mount: function (host, state, api) {
        var box = el('div', 'pmw-ed'); host.appendChild(box);
        var row = api.headerRow({ left: [], actions: [
          { id: 'max', label: 'Maximize', icon: 'maximize', shortcut: 'Ctrl+K M', run: function () { var m = api.toggleMaximize(); row.setAction('max', { label: m ? 'Restore' : 'Maximize', icon: m ? 'restore' : 'maximize' }); } },
          { id: 'more', label: 'More', icon: 'more', menu: function () { return [
            { id: 'copy', label: 'Copy all', icon: 'copy', run: function () { try { navigator.clipboard.writeText(text()); } catch (e) { /* no clipboard */ } api.announce('Copied.'); } },
            '-', { id: 'close', label: 'Close', icon: 'close', shortcut: 'Ctrl+W', run: function () { api.close(); } }]; } }
        ] });
        box.appendChild(row.el);
        var code = el('div', 'pmw-ed-code', { tabindex: '0', 'aria-label': 'Read-only text', role: 'document' }); box.appendChild(code);
        var s = Object.assign({}, state);
        function text() { return s.path ? fakeSource(s.path, s.line || 1).join('\n') : String(s.text || ''); }
        function paint() {
          var lines = s.path ? fakeSource(s.path, s.line || 1) : String(s.text || '').split('\n');
          var here = s.line || 0;
          code.textContent = '';
          lines.forEach(function (l, i) {
            var ln = el('div', 'pmw-ed-line' + (i + 1 === here ? ' pmw-ed-here' : ''));
            ln.appendChild(txt('span', 'pmw-ed-num', i + 1));
            var tx = txt('span', '', l);
            if (i + 1 === here && s.col) {
              var c = Math.max(0, s.col - 1); tx.textContent = l.slice(0, c);
              tx.appendChild(el('span', 'pmw-ed-caret')); tx.appendChild(doc.createTextNode(l.slice(c)));
            }
            ln.appendChild(tx); code.appendChild(ln);
          });
          var label = s.path ? s.path.split('/').pop() : (s.title || 'Untitled');
          api.update({ label: label, title: s.path ? s.path + (s.line ? ':' + s.line + (s.col ? ':' + s.col : '') : '') : (s.title || 'Text buffer') });
          row.set({ left: s.path
            ? [{ id: 'path', text: s.path, mono: true, title: 'File' }, { id: 'pos', text: s.line ? 'Ln ' + s.line + (s.col ? ', Col ' + s.col : '') : 'Top', title: 'Position' }]
            : [{ id: 'name', text: s.title || 'Untitled', title: 'Buffer' }, { id: 'n', text: lines.length + (lines.length === 1 ? ' line' : ' lines') }, { id: 'ro', text: 'Read-only' }] });
          var hl = code.querySelector('.pmw-ed-here');
          if (hl) requestAnimationFrame(function () { code.scrollTop = Math.max(0, hl.offsetTop - code.clientHeight / 3); });
        }
        paint();
        return {
          serialize: function () { var o = { path: s.path || null, line: s.line || null, col: s.col || null, title: s.title || null }; if (!s.path) o.text = String(s.text || '').slice(0, 8000); return o; },
          focus: function () { code.focus({ preventScroll: true }); },
          _pmwReveal: function (spec) { if (spec.line) { s.line = spec.line; s.col = spec.col || null; paint(); } }
        };
      }
    });
    registerKind('render', {
      label: 'View', group: 'Views', icon: 'file', prefixes: [], min: { w: 240, h: 120 },
      idFor: function (spec) { return spec.id || 'doc:' + (++bufferSeq); },
      mount: function (host, state, api) {
        var box = el('div', 'pmw-render'); host.appendChild(box);
        var r = renderers.get(api.id);
        function draw() { box.textContent = ''; if (r && r.render) safe(function () { r.render(box, { id: api.id, api: api }); }, 'openEditor render'); }
        draw(); r && (r.redraw = draw);
        return { serialize: function () { return {}; } };
      }
    });
  }
  var renderers = new Map();

  /* ------------------------------------------------------------------------------------------------------------------
     Public API (window.PM_HOME)
     ------------------------------------------------------------------------------------------------------------------ */
  var PM_HOME_ICONS = Object.freeze(Object.keys(ICON_PATHS).reduce(function (o, k) { o[k] = iconSvg(k); return o; }, {}));
  var PM_HOME = {
    version: 1,
    mock: true,
    icons: PM_HOME_ICONS,
    registerKind: registerKind,
    kindOf: kindOf,
    kinds: function () { return Array.from(kinds.keys()); },
    open: function (spec) { return open(spec); },
    openFile: function (path, o) { return open(Object.assign({ kind: 'editor', path: path }, o || {})); },
    reveal: function (id) { var t = tabs.get(id); if (!t) return { ok: false, reason: 'unknown-tab' }; activateTab(t, { focus: true, user: true, reason: 'reveal' }); return { ok: true, tabId: id, panelId: t.panel.id, created: false }; },
    openEditor: function (id, o) {
      o = o || {};
      var kind = o.kind || kindOf(id);
      if (!kinds.has(kind)) kind = 'render';
      if (o.render) renderers.set(id, { render: o.render });
      var res = open({ kind: kind, id: id, by: o.by || 'user', title: typeof o.title === 'string' ? o.title : undefined, label: typeof o.label === 'function' ? o.label(id) : o.label });
      var t = tabs.get(id); if (t && o.label) { t.label = typeof o.label === 'function' ? o.label(id) : String(o.label); paintTab(t); }
      if (t && o.icon) { t.icon = o.icon; paintTab(t); }
      return res.ok ? id : null;
    },
    refresh: function (id) { var r = renderers.get(id); if (r && r.redraw) r.redraw(); },
    update: function (id, patch) { var t = tabs.get(id); if (t && t.api) t.api.update(patch); else if (t) { if (patch && patch.label) t.label = patch.label; paintTab(t); } },
    close: function (id) { var t = tabs.get(id); return t ? closeTab(t) : { ok: false, reason: 'unknown-tab' }; },
    active: function () { var p = focusPanel; return p && p.active ? { tabId: p.active.id, panelId: p.id, kind: p.active.kind } : null; },
    activeIn: function (panelId) { var p = panelById(panelId); return p && p.active ? { tabId: p.active.id, panelId: p.id, kind: p.active.kind } : null; },
    tabs: function () { return Array.from(tabs.values()).map(function (t) { return { id: t.id, kind: t.kind, panelId: t.panel && t.panel.id, label: t.userLabel || t.label, mounted: t.mounted, visible: t.visible, marks: Object.assign({}, t.marks) }; }); },
    panels: function () { return panels.map(function (p) { return { id: p.id, tabs: p.tabs.map(function (t) { return t.id; }), active: p.active && p.active.id, maximized: maximized === p }; }); },
    on: function (ev, fn) { return bus.on(ev, fn); },
    look: look,
    settings: settings,
    command: command,
    announce: announce,
    menu: function (items, anchor) { return openMenu(items, anchor); },
    headerRow: function (spec) { return headerRow(spec, null); },
    command_log: command_log, receipt_log: receipt_log, event_log: event_log,
    boot: boot
  };
  window.PM_HOME = PM_HOME;
  /* engine internals for tests (the real engine publishes window.PMW the same way) */
  window.PMW = { tabs: tabs, panels: function () { return panels; }, tree: function () { return tree; }, focusedTab: function () { return focusedTab; }, setMaximized: setMaximized, applyPreset: applyPreset, resetLayout: resetLayout, open: open, splitWith: splitWith };
  registerHarnessKinds();

  /* ------------------------------------------------------------------------------------------------------------------
     Boot and the harness toolbar
     ------------------------------------------------------------------------------------------------------------------ */
  var harness = { look: 'friendly', mode: 'dark', nier: false, reduced: !!(mqReduced && mqReduced.matches), layout: 'one' };
  function loadHarness() {
    try { var h = JSON.parse(localStorage.getItem(STORE_HARNESS) || 'null'); if (h) { Object.assign(harness, h.harness || {}); Object.assign(sizing, h.sizing || {}); } } catch (e) { /* ignore */ }
  }
  function saveHarness() { try { localStorage.setItem(STORE_HARNESS, JSON.stringify({ harness: harness, sizing: sizing })); } catch (e) { /* ignore */ } }
  function paintLook() {
    var fam = harness.nier ? 'basic' : harness.look;
    root.setAttribute('data-theme', fam + '-' + harness.mode);
    if (harness.nier) { root.setAttribute('data-o55-nier', 'on'); root.setAttribute('data-o55-nier-parts', 'square cursor headers ground brackets icons'); }
    else { root.removeAttribute('data-o55-nier'); root.removeAttribute('data-o55-nier-parts'); }
    if (harness.reduced) root.setAttribute('data-motion', 'reduced'); else root.removeAttribute('data-motion');
  }
  function paintSizing() {
    if (!centre) return;
    var fixed = sizing.mode === 'fixed';
    centre.classList.toggle('pmw-fixed', fixed);
    centre.style.setProperty('--pmx-w', sizing.w + 'px');
    centre.style.setProperty('--pmx-h', sizing.h + 'px');
  }
  function wireToolbar() {
    var bar = doc.getElementById('pmx-bar'); if (!bar) return;
    function pressed(sel, test) { bar.querySelectorAll(sel).forEach(function (b) { b.setAttribute('aria-pressed', test(b) ? 'true' : 'false'); }); }
    function paintBar() {
      pressed('[data-pmx-look]', function (b) { return b.getAttribute('data-pmx-look') === harness.look; });
      bar.querySelectorAll('[data-pmx-look]').forEach(function (b) { b.disabled = harness.nier; b.title = harness.nier ? 'NieR Mode paints Basic; turn it off to change the look' : ''; });
      pressed('[data-pmx-mode]', function (b) { return b.getAttribute('data-pmx-mode') === harness.mode; });
      pressed('[data-pmx-toggle="nier"]', function () { return harness.nier; });
      pressed('[data-pmx-toggle="reduced"]', function () { return harness.reduced; });
      pressed('[data-pmx-w]', function (b) { return sizing.mode === 'fixed' && +b.getAttribute('data-pmx-w') === sizing.w; });
      pressed('[data-pmx-h]', function (b) { return sizing.mode === 'fixed' && +b.getAttribute('data-pmx-h') === sizing.h; });
      pressed('[data-pmx-fill]', function () { return sizing.mode === 'fill'; });
      pressed('[data-pmx-layout]', function (b) { return b.getAttribute('data-pmx-layout') === harness.layout; });
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-pmx-look')) harness.look = b.getAttribute('data-pmx-look');
      else if (b.hasAttribute('data-pmx-mode')) harness.mode = b.getAttribute('data-pmx-mode');
      else if (b.getAttribute('data-pmx-toggle') === 'nier') harness.nier = !harness.nier;
      else if (b.getAttribute('data-pmx-toggle') === 'reduced') harness.reduced = !harness.reduced;
      else if (b.hasAttribute('data-pmx-w')) { sizing.mode = 'fixed'; sizing.w = +b.getAttribute('data-pmx-w'); }
      else if (b.hasAttribute('data-pmx-h')) { sizing.mode = 'fixed'; sizing.h = +b.getAttribute('data-pmx-h'); }
      else if (b.hasAttribute('data-pmx-fill')) sizing.mode = 'fill';
      else if (b.hasAttribute('data-pmx-layout')) { harness.layout = b.getAttribute('data-pmx-layout'); applyPreset(harness.layout); }
      else if (b.hasAttribute('data-pmx-demos')) {
        var demos = Array.isArray(window.PMT_HARNESS_DEMOS) ? window.PMT_HARNESS_DEMOS : [];
        var items = demos.length ? demos.map(function (d, i) { return d === '-' ? '-' : { id: 'demo-' + i, label: d.label, detail: d.detail, run: function () { safe(function () { return d.run(PM_HOME); }, 'demo ' + d.label); } }; })
          : [{ id: 'none', label: 'No demos registered yet', detail: 'window.PMT_HARNESS_DEMOS', disabled: true }];
        openMenu(items, b, { label: 'Demos' });
        return;
      }
      else if (b.hasAttribute('data-pmx-reset')) { try { localStorage.removeItem(STORE_PANELS); } catch (x) { /* ignore */ } resetLayout(); harness.layout = 'one'; }
      else return;
      paintLook(); paintSizing(); paintBar(); saveHarness();
    });
    paintBar();
    var sizeOut = doc.getElementById('pmx-size'), said = doc.getElementById('pmx-said');
    function paintSize() {
      if (!sizeOut) return;
      var p = focusPanel && panels.indexOf(focusPanel) >= 0 ? focusPanel : panels[0];
      var t = p && p.active;
      sizeOut.textContent = t ? t.body.clientWidth + ' x ' + t.body.clientHeight : '-';
    }
    bus.on('sizes', paintSize); bus.on('focus', paintSize); bus.on('activate', paintSize); bus.on('panels', paintSize);
    bus.on('announce', function (text) { if (said) { said.textContent = text; said.title = text; } });
    bus.on('chord', function (c) { if (said && c) said.textContent = 'Ctrl+K pressed; waiting for the second key'; });
    setTimeout(paintSize, 50);
  }
  function boot() {
    if (booted) return;
    centre = doc.getElementById('pm-home-centre');
    overlay = doc.getElementById('pmw-overlay');
    if (!centre) { centre = el('div', '', { id: 'pm-home-centre' }); doc.body.appendChild(centre); }
    if (!overlay) { overlay = el('div', '', { id: 'pmw-overlay' }); doc.body.appendChild(overlay); }
    live = el('div', 'pmw-live', { 'aria-live': 'polite', role: 'status' }); overlay.appendChild(live);
    loadHarness(); paintLook(); paintSizing();
    lastLookSig = JSON.stringify(look());
    wireToolbar();
    booted = true;
    if (!restore()) {
      var p = new Panel(); tree = leaf(p); renderLayout(); focusPanel = p; touchPanel(p);
      var spec = defaultSpec();
      if (spec) open(spec, { source: p });
      if (harness.layout !== 'one') applyPreset(harness.layout);
    }
    refreshVisibility();
    logEvent('boot', { kinds: Array.from(kinds.keys()) });
  }
})();
