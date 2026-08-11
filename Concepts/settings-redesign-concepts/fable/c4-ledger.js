/* fable · Ledger — concept C4 controller.
   Thesis: object browser. Every setting is a record with provenance; the
   INSPECTOR is the interaction surface. Document rows are read-only records;
   selecting one loads it into the inspector where all editing happens
   (control, provenance chain, requested-vs-effective, reset, risk framing).
   The navigator is a query engine: persistent query bar + state chips that
   filter navigator and document simultaneously (dim, never reflow).
   Motion philosophy "Instantaneous": zero choreography. Jumps are forced to
   instant scrolls; emphasis is focus outlines and content replacement only.
   Slint notes appear inline where a web technique needs translation. */
(function () {
  'use strict';

  var store = window.PMState.init('c4-ledger');

  /* ================================================== small helpers ==== */

  function $(id) { return document.getElementById(id); }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function str(x) { return (typeof x === 'string') ? x : ''; }
  function D() { return store.data || {}; }
  function settings() { return D().settings || {}; }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) { return; }
        if (k === 'className') { el.className = v; }
        else if (k === 'text') { el.textContent = v; }
        else if (k === 'html') { el.innerHTML = v; }
        else if (k === 'onClick') { el.addEventListener('click', v); }
        else if (k === 'onKeydown') { el.addEventListener('keydown', v); }
        else if (k === 'onInput') { el.addEventListener('input', v); }
        else if (k === 'onChange') { el.addEventListener('change', v); }
        else if (k === 'onBlur') { el.addEventListener('blur', v); }
        else if (k === 'dataset') { Object.keys(v).forEach(function (d) { el.dataset[d] = v[d]; }); }
        else { el.setAttribute(k, v === true ? '' : String(v)); }
      });
    }
    for (var i = 2; i < arguments.length; i++) { appendChild(el, arguments[i]); }
    return el;
  }

  function appendChild(el, c) {
    if (c === null || c === undefined || c === false) { return; }
    if (Array.isArray(c)) { c.forEach(function (x) { appendChild(el, x); }); return; }
    if (typeof c === 'string') { el.appendChild(document.createTextNode(c)); return; }
    el.appendChild(c);
  }

  function ico(name, cls) {
    var i = document.createElement('i');
    i.setAttribute('data-ico', name);
    i.setAttribute('aria-hidden', 'true');
    if (cls) { i.className = cls; }
    try { i.innerHTML = window.PMIcons.get(name) || ''; } catch (e) { /* decorative */ }
    return i;
  }

  function chipEl(kind, label, title) {
    var s = h('span', { className: 'pm-chip-value', 'data-kind': kind, text: label });
    if (title) { s.title = title; }
    return s;
  }

  var TONE_ICONS = { attention: 'warning', setup: 'clipboard', recommended: 'sparkle', ok: 'check', muted: 'info' };
  function statusWordEl(tone, word) {
    return h('span', { className: 'pm-status-word', 'data-tone': tone }, ico(TONE_ICONS[tone] || 'info'), word);
  }

  function fmtTime(iso) {
    if (!iso) { return 'None recorded'; }
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) { return String(iso); }
      return d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch (e) { return String(iso); }
  }

  function fmtCtx(n) {
    if (typeof n !== 'number') { return String(n || 'Unknown'); }
    return (n >= 1000 ? Math.round(n / 1000) + 'k' : String(n)) + ' tokens';
  }

  function cap(s) { s = str(s); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* Humanizing maps — raw internal enums never reach visible copy. */
  var ISOLATION_LABELS = {
    'native-profile': 'Native named profile',
    'cli-home': 'Isolated CLI home',
    'auth-isolated': 'Auth-isolated profile with allowlisted preferences',
    'pm-managed': 'PM-managed credential',
    'credential-pool': 'API credential pool',
    'single-login': 'Single active login'
  };
  var AUTH_OWNER_LABELS = {
    'cli-profile': 'Sign-in owned by the CLI profile',
    'pm-direct-oauth': 'PM-direct sign-in',
    'api-key': 'API key in the system keychain',
    'server': 'Server connection',
    'none': 'No sign-in'
  };
  var EVIDENCE_LABELS = {
    'supported': 'Supported',
    'unsupported': 'Not supported',
    'likely': 'Likely',
    'unverified': 'Unverified',
    'temporarily-unavailable': 'Temporarily unavailable',
    'via-transformation': 'Via PM transformation',
    'via-other-route': 'Via another configured route'
  };
  var QUALIFIER_LABELS = {
    'rate-limited': 'Free — rate limited',
    'promotional': 'Free — promotional window',
    'account-required': 'Free — account required',
    'keyless': 'Free — keyless',
    'data-sharing': 'Free — may retain prompts',
    'subscription-included': 'Included with subscription',
    'temporarily-unavailable': 'Temporarily unavailable'
  };
  var QUALIFIER_EXPLAIN = {
    'rate-limited': 'No charge, but requests are throttled and queue behind paid traffic.',
    'promotional': 'Free for a limited promotional window; the provider may end it at any time.',
    'account-required': 'No charge, but the underlying service requires a registered account.',
    'keyless': 'Anonymous access with no key. Availability varies with load.',
    'data-sharing': 'No charge, but the provider may retain prompts to improve its service. Avoid private code.',
    'subscription-included': 'Covered by a subscription you already pay for.',
    'temporarily-unavailable': 'Normally free, but the route is not accepting requests right now.'
  };
  var WHATNEXT_LABELS = {
    'stop-wait': 'Pause new runs and wait for the reset',
    'extra-balance': 'Spend from the extra balance',
    'paid-after-plan': 'Continue on paid usage after the plan',
    'saved-reset': 'Save work and resume after the reset',
    'switch-account': 'Switch to another enabled account',
    'free-models': 'Use free routes in the meantime',
    'api-billing': 'Route to API billing',
    'ask': 'Ask me each time'
  };
  var PRESSURE_LABELS = { low: 'Low', none: 'None', high: 'High', exhausted: 'Exhausted', unknown: 'Unknown' };
  var MODALITY_LABELS = { 'text': 'Text', 'image-in': 'Image input', 'image-out': 'Image output', 'audio-in': 'Audio input', 'audio-out': 'Audio output', 'video': 'Video' };
  var GROUP_LABELS = {
    tool: 'Installed tools & signed-in apps',
    account: 'Connected accounts',
    api: 'API connections',
    server: 'Server connections',
    free: 'Free & community'
  };
  var LIFECYCLE_LABELS = { 'active': 'Active', 'update-available': 'Update available', 'failed': 'Failed to load', 'disabled': 'Disabled' };
  var RISK_LABELS = { low: 'Low risk', medium: 'Medium risk', high: 'High risk' };
  /* Shared account-health vocabulary — raw states never reach visible copy. */
  var HEALTH_LABELS = {
    'ready': 'Ready',
    'ok': 'Ready',
    'signed-out': 'Signed out',
    'auth-no-invoke': 'Signed in, cannot run models',
    'degraded': 'Degraded',
    'refreshing': 'Refreshing',
    'usage-exhausted': 'Included usage exhausted',
    'not-installed': 'Not installed'
  };

  function providerStatusInfo(p) {
    var readyAuth = { tool: 'Signed in', account: 'Signed in', api: 'Key configured', server: 'Connected', free: 'No sign-in needed' }[p.groupKind] || 'Signed in';
    switch (p.status) {
      case 'ready': return { auth: readyAuth, svc: 'Ready', tone: 'ok', word: 'Ready' };
      case 'not-installed': return { auth: 'Not installed', svc: 'Unavailable until the tool is installed', tone: 'muted', word: 'Not installed' };
      case 'signed-out': return { auth: 'Installed, signed out', svc: 'Unavailable until you sign in', tone: 'setup', word: 'Signed out' };
      case 'auth-no-invoke': return { auth: 'Signed in', svc: 'Cannot run models', tone: 'attention', word: 'Needs attention' };
      case 'degraded': return { auth: 'Signed in', svc: 'Degraded', tone: 'attention', word: 'Degraded' };
      case 'refreshing': return { auth: 'Signed in', svc: 'Refreshing catalog', tone: 'setup', word: 'Refreshing' };
      default: return { auth: 'Unknown', svc: 'Unknown', tone: 'muted', word: 'Unknown' };
    }
  }

  /* ============================================= taxonomy index ======== */

  var settingIndex = {};
  function buildIndex() {
    settingIndex = {};
    arr(D().taxonomy).forEach(function (dom) {
      arr(dom.subs).forEach(function (sub) {
        arr(sub.settingIds).forEach(function (sid) {
          settingIndex[sid] = { domainId: dom.id, subId: sub.id, domainTitle: dom.title, subTitle: sub.title, num: dom.num };
        });
      });
    });
  }
  function locate(sid) { return settingIndex[sid] || null; }
  function domainById(id) {
    var t = arr(D().taxonomy);
    for (var i = 0; i < t.length; i++) { if (t[i].id === id) { return t[i]; } }
    return null;
  }
  function providerById(id) {
    var list = arr(D().providers);
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { return list[i]; } }
    return null;
  }
  function modelByRef(ref) {
    var list = arr(D().providers);
    for (var i = 0; i < list.length; i++) {
      var ms = arr(list[i].models);
      for (var j = 0; j < ms.length; j++) { if (ms[j].id === ref) { return { provider: list[i], model: ms[j] }; } }
    }
    return null;
  }

  /* ==================================================== ui state ======= */

  var ui = {
    view: { kind: 'home' },
    selected: null,          // {kind, id, ...refs} — the record in the inspector
    query: '',
    chips: { managed: false, differs: false, unavailable: false, attention: false },
    sort: { col: 'label', dir: 1 },
    homeRows: 40,
    advOpen: {},             // subId -> bool (advanced & expert disclosure)
    diagOpen: {},            // domainId -> bool (diagnostics drawer)
    ctxLastTurnOpen: false,
    confirmedRisk: {},       // settingId -> bool (expert unlock, per session)
    navOpen: false,
    cmdFilter: '',           // commands manager: table filter text
    cmdOverrides: {},        // command label -> remapped keys (session only)
    cmdDisabled: {},         // custom command name -> bool (local state)
    accountLogsOpen: {}      // providerId/identity -> bool (inline logs)
  };

  var spyCtl = null;
  var spellHandles = [];

  var els = {
    root: $('lgRoot'), tree: $('lgTree'), doc: $('lgDoc'), insp: $('lgInspector'),
    query: $('lgQueryInput'), clear: $('lgQueryClear'), navBtn: $('lgNavBtn'),
    scrim: $('lgNavScrim'), elsewhere: $('lgElsewhere'), elsewhereList: $('lgElsewhereList')
  };

  /* ============================================ instantaneous jumps ==== */
  /* C4 forces every controlled jump to be instant: the reduced-motion
     attribute is set for the duration of the jump so PMSpy scrolls with
     behavior:auto. End state identical either way — that is the philosophy.
     Slint note: equivalent to setting a Flickable viewport-y directly. */

  function withInstantMotion(fn) {
    var html = document.documentElement;
    var prev = html.getAttribute('data-motion');
    html.setAttribute('data-motion', 'reduced');
    var restore = function () {
      if (prev) { html.setAttribute('data-motion', prev); }
      else { html.removeAttribute('data-motion'); }
    };
    var p;
    try { p = fn(); } catch (e) { restore(); return Promise.resolve(false); }
    return Promise.resolve(p).then(function (r) { restore(); return r; }, function () { restore(); return false; });
  }

  function jumpToSection(secId) {
    if (!spyCtl) { return Promise.resolve(false); }
    return withInstantMotion(function () { return spyCtl.jumpTo(secId, {}); });
  }

  /* ================================================== spellcheck ======= */

  function detachSpells() {
    spellHandles.forEach(function (hd) { try { hd.detach(); } catch (e) { /* ignore */ } });
    spellHandles = [];
  }
  function attachSpell(el) {
    try {
      if (window.PMSpell && window.PMSpell.attach) {
        var hd = window.PMSpell.attach(el, { store: store, projectDict: true });
        if (hd) { spellHandles.push(hd); }
      }
    } catch (e) { /* spellcheck optional */ }
  }

  /* ============================================== record selection ===== */

  function sameSelection(a, b) {
    return !!a && !!b && a.kind === b.kind && a.id === b.id;
  }

  function selectRecord(sel) {
    if (sameSelection(ui.selected, sel)) { return; }
    ui.selected = sel;
    markSelectedRows();
    renderInspector();
  }

  function deselect() {
    ui.selected = null;
    markSelectedRows();
    renderInspector();
  }

  function markSelectedRows() {
    var nodes = els.doc.querySelectorAll('[data-rec]');
    for (var i = 0; i < nodes.length; i++) {
      var on = !!ui.selected && nodes[i].getAttribute('data-rec') === ui.selected.kind + ':' + ui.selected.id;
      if (nodes[i].tagName === 'TR') { nodes[i].setAttribute('aria-selected', on ? 'true' : 'false'); }
      else { nodes[i].setAttribute('aria-pressed', on ? 'true' : 'false'); }
    }
    els.root.classList.toggle('insp-open', !!ui.selected);
  }

  /* ================================================ setting edits ====== */

  function currentValue(s) { return s.value !== undefined ? s.value : s['default']; }

  function setSettingValue(id, val) {
    var s = settings()[id];
    if (!s) { return; }
    s.value = val;
    s.valueSource = 'custom';
    afterSettingEdit(id);
  }

  function resetSetting(id) {
    var s = settings()[id];
    if (!s) { return; }
    try { s.value = JSON.parse(JSON.stringify(s['default'])); } catch (e) { s.value = s['default']; }
    s.valueSource = 'default';
    afterSettingEdit(id);
    window.PMState.receipt('Reset to default', '"' + str(s.label) + '" now follows its built-in default.');
  }

  function afterSettingEdit(id) {
    replaceSettingRow(id);
    if (ui.view.kind === 'home') { renderHomeTableBody(); }
    renderInspector();
    updateStatusbar();
  }

  function replaceSettingRow(id) {
    var old = els.doc.querySelector('[data-rec="setting:' + cssEscape(id) + '"]');
    if (old && old.tagName !== 'TR') {
      var s = settings()[id];
      if (s) {
        var fresh = settingRowEl(s);
        old.parentNode.replaceChild(fresh, old);
        applyFilterToRow(fresh);
        markSelectedRows();
      }
    }
  }

  function cssEscape(s) {
    try { return (window.CSS && window.CSS.escape) ? window.CSS.escape(s) : s.replace(/([^a-zA-Z0-9_-])/g, '\\$1'); }
    catch (e) { return s; }
  }

  /* ================================================= navigation ======== */

  var MANAGERS = [
    { id: 'providers', label: 'Providers & Models', icon: 'cloud', blurb: 'Accounts, connections, catalogs, routes, and roles.' },
    { id: 'context', label: 'Context & Instructions', icon: 'layers', blurb: 'What reaches the model each turn, and why.' },
    { id: 'tools', label: 'Skills, Plugins & Tools', icon: 'toolbox', blurb: 'The exposure funnel from installed to invoked.' },
    { id: 'commands', label: 'Commands & Shortcuts', icon: 'terminal', blurb: 'Every shortcut and custom command, with conflicts resolved in the open.' }
  ];
  function managerById(id) {
    for (var i = 0; i < MANAGERS.length; i++) { if (MANAGERS[i].id === id) { return MANAGERS[i]; } }
    return null;
  }

  var PROVIDER_SECTIONS = [
    { id: 'prov-tools', title: 'Installed tools & signed-in apps', kind: 'tool' },
    { id: 'prov-accounts', title: 'Connected accounts', kind: 'account' },
    { id: 'prov-api', title: 'API connections', kind: 'api' },
    { id: 'prov-servers', title: 'Server connections', kind: 'server' },
    { id: 'prov-free', title: 'Free & community', kind: 'free' },
    { id: 'prov-routes', title: 'Free routes & qualifiers' },
    { id: 'prov-roles', title: 'Role assignments' },
    { id: 'prov-usage', title: 'Usage snapshot' }
  ];
  var CONTEXT_SECTIONS = [
    { id: 'ctx-controls', title: 'Context controls' },
    { id: 'ctx-lastturn', title: 'Last turn: admitted & omitted' },
    { id: 'ctx-cache', title: 'Compaction & cache' },
    { id: 'ctx-instructions', title: 'Instruction files' },
    { id: 'ctx-persona', title: 'Persona & tool footprint' }
  ];
  var TOOLS_SECTIONS = [
    { id: 'ext-funnel', title: 'Exposure funnel' },
    { id: 'ext-tools', title: 'Tools' },
    { id: 'ext-skills', title: 'Skills' },
    { id: 'ext-plugins', title: 'Plugins' }
  ];
  var COMMANDS_SECTIONS = [
    { id: 'cmd-shortcuts', title: 'Shortcuts' },
    { id: 'cmd-custom', title: 'Custom commands' }
  ];

  function setView(view) {
    ui.view = view;
    ui.selected = null;
    ui.navOpen = false;
    els.root.classList.remove('nav-open');
    if (els.navBtn) { els.navBtn.setAttribute('aria-expanded', 'false'); }
    renderAll();
    els.doc.scrollTop = 0;
    updateStatusbar();
  }

  function openDomain(domainId) {
    if (ui.view.kind === 'domain' && ui.view.id === domainId) { return; }
    setView({ kind: 'domain', id: domainId });
  }

  function openManager(managerId) {
    if (ui.view.kind === 'manager' && ui.view.id === managerId) { return; }
    setView({ kind: 'manager', id: managerId });
  }

  /* Deep link: load the owner domain, expand the owning disclosure, jump,
     flash, and load the record into the inspector (the surface). */
  function revealSetting(sid) {
    var loc = locate(sid);
    var s = settings()[sid];
    if (!loc || !s) {
      window.PMState.receipt('Open setting', 'That record is not in the demo dataset.');
      return;
    }
    var ensure = [];
    if (ui.view.kind !== 'domain' || ui.view.id !== loc.domainId) {
      ensure.push(function () { setView({ kind: 'domain', id: loc.domainId }); });
    }
    if ((s.exposure === 'advanced' || s.exposure === 'expert') && !ui.advOpen[loc.subId]) {
      ensure.push(function () { ui.advOpen[loc.subId] = true; renderDoc(); });
    }
    if (s.exposure === 'diagnostic' && !ui.diagOpen[loc.domainId]) {
      ensure.push(function () { ui.diagOpen[loc.domainId] = true; renderDoc(); });
    }
    ensure.push(function () { selectRecord({ kind: 'setting', id: sid }); });
    var targetSec = s.exposure === 'diagnostic' ? 'lgsec-diag-' + loc.domainId : 'lgsec-' + loc.subId;
    withInstantMotion(function () {
      return window.PMSpy.reveal({ controller: spyCtl, ensure: ensure, targetId: targetSec });
    }).then(function () {
      var row = els.doc.querySelector('[data-rec="setting:' + cssEscape(sid) + '"]');
      if (row) { window.PMSpy.focusFlash(row); }
    });
  }

  function revealManagerRecord(managerId, secId, sel) {
    var ensure = [];
    if (ui.view.kind !== 'manager' || ui.view.id !== managerId) {
      ensure.push(function () { setView({ kind: 'manager', id: managerId }); });
    }
    if (sel) { ensure.push(function () { selectRecord(sel); }); }
    withInstantMotion(function () {
      return window.PMSpy.reveal({ controller: spyCtl, ensure: ensure, targetId: secId });
    }).then(function () {
      if (sel) {
        var row = els.doc.querySelector('[data-rec="' + sel.kind + ':' + cssEscape(sel.id) + '"]');
        if (row) { window.PMSpy.focusFlash(row); }
      }
    });
  }

  /* Search-result and notice-action routing. Managers this concept does not
     build return an honest simulated receipt — never a silent no-op. */
  var MANAGER_ROUTES = {
    'providers': function () { openManager('providers'); },
    'roles': function () { revealManagerRecord('providers', 'prov-roles', null); },
    'freeRoutes': function () { revealManagerRecord('providers', 'prov-routes', null); },
    'contextSources': function () { openManager('context'); },
    'commands': function () { openManager('commands'); },
    'skills': function () { revealManagerRecord('tools', 'ext-skills', null); },
    'plugins': function () { revealManagerRecord('tools', 'ext-plugins', null); },
    'tools': function () { revealManagerRecord('tools', 'ext-tools', null); },
    'lsp': function () {
      window.PMState.receipt('Open the Language servers manager',
        'Language servers are managed in fable · Atlas (Appendix D), where that surface is built in full; this concept links there rather than rebuilding it.');
    }
  };

  function routeManager(shortId, label) {
    var fn = MANAGER_ROUTES[shortId];
    if (fn) { fn(); return; }
    window.PMState.receipt('Open ' + (label || 'manager'),
      'This concept builds the Providers, Context, and Skills managers in full; the ' +
      (label || 'requested') + ' manager opens as its own surface in the finished product.');
  }

  function runAct(act, target) {
    target = target || {};
    switch (act) {
      case 'invoke-test':
        window.PMState.trigger('invoke-test', target.providerId || 'copilot');
        return;
      case 'reconnect':
        if (target.providerId) { window.PMState.trigger('reconnect', target.providerId); }
        else { window.PMState.receipt('Reconnect', 'Reconnection runs against the live server in the finished product.'); }
        return;
      case 'open-usage':
        window.PMState.receipt('Open the Usage page', 'Deep link to the Usage surface — simulated in this concept.');
        return;
      case 'cli-login':
        window.PMState.receipt('Open CLI sign-in', 'The CLI owns this sign-in; Puppet Master launches its login flow and verifies readiness. Simulated.');
        return;
      case 'open-logs':
        window.PMState.receipt('View logs', 'The log viewer opens as a diagnostic surface in the finished product.');
        return;
      case 'open-policy':
        openDomain('permissions');
        return;
      case 'open-manager':
      case 'open-provider':
        if (target.providerId) {
          var p = providerById(target.providerId);
          var sec = p ? sectionForProvider(p) : 'prov-tools';
          revealManagerRecord('providers', sec, p ? { kind: 'provider', id: p.id } : null);
        } else { openManager('providers'); }
        return;
      case 'open-free-route':
        revealManagerRecord('providers', 'prov-routes',
          target.freeRouteId ? { kind: 'freeRoute', id: target.freeRouteId } : null);
        return;
      case 'open-roles':
        revealManagerRecord('providers', 'prov-roles', null);
        return;
      case 'open-memory':
        routeManager('memory', 'Memory');
        return;
      case 'install-lsp':
        window.PMState.receipt('Install language server', 'Installation runs in the finished product; nothing was installed.');
        return;
      case 'switch-account':
        revealManagerRecord('providers', 'prov-tools', null);
        return;
      default:
        if (target.settingId) { revealSetting(target.settingId); return; }
        if (target.manager) { routeManager(target.manager, target.manager); return; }
        if (target.domain) { openDomain(target.domain); return; }
        window.PMState.receipt('Notice action', 'This action opens its own surface in the finished product.');
    }
  }

  function sectionForProvider(p) {
    for (var i = 0; i < PROVIDER_SECTIONS.length; i++) {
      if (PROVIDER_SECTIONS[i].kind === p.groupKind) { return PROVIDER_SECTIONS[i].id; }
    }
    return 'prov-tools';
  }

  function openTarget(target) {
    target = target || {};
    if (target.settingId) { revealSetting(target.settingId); return; }
    if (target.providerId) { runAct('open-provider', target); return; }
    if (target.freeRouteId) { runAct('open-free-route', target); return; }
    if (target.personaId) { routeManager('personas', 'Personas'); return; }
    if (target.manager) { routeManager(target.manager, target.manager); return; }
    if (target.domain) { openDomain(target.domain); return; }
  }

  /* ==================================================== navigator ====== */

  function renderNav() {
    var tree = els.tree;
    tree.innerHTML = '';

    tree.appendChild(h('div', { className: 'lg-tree-h', text: 'Overview' }));
    tree.appendChild(navItem({
      num: '', label: 'Home ledger', count: '',
      open: ui.view.kind === 'home',
      onClick: function () { setView({ kind: 'home' }); }
    }));

    tree.appendChild(h('div', { className: 'lg-tree-h', text: 'Domains' }));
    arr(D().taxonomy).forEach(function (dom) {
      var open = ui.view.kind === 'domain' && ui.view.id === dom.id;
      var count = 0;
      arr(dom.subs).forEach(function (sub) { count += arr(sub.settingIds).length; });
      tree.appendChild(navItem({
        num: dom.num, label: dom.title, count: String(count),
        open: open, domainId: dom.id,
        onClick: function () { openDomain(dom.id); }
      }));
      if (open) {
        var subs = h('div', { className: 'lg-tree-subs', role: 'list' });
        arr(dom.subs).forEach(function (sub, i) {
          subs.appendChild(h('button', {
            className: 'lg-tree-sub', type: 'button', role: 'listitem',
            'aria-current': 'false',
            dataset: { sec: 'lgsec-' + sub.id, subid: sub.id },
            onClick: function () { jumpToSection('lgsec-' + sub.id); }
          },
            h('span', { className: 'lg-marker' }),
            h('span', { className: 'lg-tree-label', text: sub.title }),
            h('span', { className: 'lg-tree-count', text: dom.num + '.' + (i + 1) })
          ));
        });
        if (domainDiagnostics(dom).length > 0) {
          subs.appendChild(h('button', {
            className: 'lg-tree-sub', type: 'button', role: 'listitem',
            'aria-current': 'false',
            dataset: { sec: 'lgsec-diag-' + dom.id },
            onClick: function () { jumpToSection('lgsec-diag-' + dom.id); }
          },
            h('span', { className: 'lg-marker' }),
            h('span', { className: 'lg-tree-label', text: 'Diagnostics' }),
            h('span', { className: 'lg-tree-count', text: 'dx' })
          ));
        }
        tree.appendChild(subs);
      }
    });

    tree.appendChild(h('div', { className: 'lg-tree-h', text: 'Managers' }));
    MANAGERS.forEach(function (m) {
      var open = ui.view.kind === 'manager' && ui.view.id === m.id;
      tree.appendChild(navItem({
        num: '', label: m.label, count: '',
        open: open, managerId: m.id,
        onClick: function () { openManager(m.id); }
      }));
      if (open) {
        var secs = managerSections(m.id);
        var subs = h('div', { className: 'lg-tree-subs', role: 'list' });
        secs.forEach(function (sec) {
          subs.appendChild(h('button', {
            className: 'lg-tree-sub', type: 'button', role: 'listitem',
            'aria-current': 'false',
            dataset: { sec: 'lgsec-' + sec.id },
            onClick: function () { jumpToSection('lgsec-' + sec.id); }
          },
            h('span', { className: 'lg-marker' }),
            h('span', { className: 'lg-tree-label', text: sec.title })
          ));
        });
        tree.appendChild(subs);
      }
    });
  }

  function navItem(opts) {
    var item = h('button', {
      className: 'lg-tree-item' + (opts.open ? ' is-open' : ''),
      type: 'button',
      'aria-expanded': opts.open ? 'true' : 'false',
      onClick: opts.onClick
    },
      h('span', { className: 'lg-tree-num', text: opts.num || '' }),
      h('span', { className: 'lg-tree-label', text: opts.label }),
      opts.count ? h('span', { className: 'lg-tree-count', text: opts.count }) : null
    );
    if (opts.domainId) { item.dataset.domain = opts.domainId; }
    if (opts.managerId) { item.dataset.manager = opts.managerId; }
    return item;
  }

  function managerSections(id) {
    if (id === 'providers') { return PROVIDER_SECTIONS; }
    if (id === 'context') {
      var cs = D().contextSources || {};
      if (cs.cacheStrategy) { return CONTEXT_SECTIONS; }
      return CONTEXT_SECTIONS.filter(function (s) { return s.id !== 'ctx-cache'; });
    }
    if (id === 'commands') { return COMMANDS_SECTIONS; }
    return TOOLS_SECTIONS;
  }

  function domainDiagnostics(dom) {
    var out = [];
    arr(dom.subs).forEach(function (sub) {
      arr(sub.settingIds).forEach(function (sid) {
        var s = settings()[sid];
        if (s && s.exposure === 'diagnostic') { out.push(s); }
      });
    });
    return out;
  }

  /* ================================================== scrollspy ======== */

  function attachSpy() {
    if (spyCtl) { spyCtl.dispose(); spyCtl = null; }
    var sections = els.doc.querySelectorAll('[data-lg-section]');
    if (sections.length === 0) { onSpyChange(null); return; }
    spyCtl = window.PMSpy.attach({
      scroller: els.doc,
      topOffset: 8,
      getSections: function () {
        return Array.prototype.slice.call(els.doc.querySelectorAll('[data-lg-section]'));
      },
      onChange: function (activeId) { onSpyChange(activeId); }
    });
    onSpyChange(spyCtl.state.activeId);
  }

  /* The position marker steps discretely — attribute swap, no transition. */
  function onSpyChange(activeId) {
    var subs = els.tree.querySelectorAll('.lg-tree-sub');
    for (var i = 0; i < subs.length; i++) {
      subs[i].setAttribute('aria-current', subs[i].dataset.sec === activeId ? 'true' : 'false');
    }
    if (!ui.selected) { renderInspector(); }
  }

  /* ==================================================== document ======= */

  function renderDoc() {
    detachSpells();
    els.doc.innerHTML = '';
    if (ui.view.kind === 'home') { renderHome(); }
    else if (ui.view.kind === 'domain') { renderDomain(ui.view.id); }
    else { renderManager(ui.view.id); }
    markSelectedRows();
    updateFilter();
    attachSpy();
  }

  function docHead(kicker, title, blurb) {
    return h('header', { className: 'lg-doc-head' },
      h('p', { className: 'lg-doc-kicker', text: kicker }),
      h('h1', { className: 'lg-doc-title', text: title }),
      blurb ? h('p', { className: 'lg-doc-blurb', text: blurb }) : null
    );
  }

  function sectionEl(id, num, title, count, blurb) {
    var sec = h('section', { className: 'lg-section', id: 'lgsec-' + id, dataset: { lgSection: '1' } },
      h('div', { className: 'lg-section-h' },
        num ? h('span', { className: 'lg-section-num', text: num }) : null,
        h('h2', { className: 'lg-section-title', text: title }),
        count ? h('span', { className: 'lg-section-count', text: count }) : null
      ),
      blurb ? h('p', { className: 'lg-section-blurb', text: blurb }) : null
    );
    return sec;
  }

  /* ------------------------------------------------------- setting rows */

  function settingRowEl(s) {
    var rs = window.PMState.resolveRowState(s);
    var marks = h('span', { className: 'lg-row-marks' });
    rs.flags.forEach(function (f) {
      var i = ico(f.icon);
      i.title = f.label;
      i.setAttribute('aria-label', f.label);
      i.removeAttribute('aria-hidden');
      marks.appendChild(i);
    });
    if (s.exposure === 'expert') {
      var w = ico('warning', 'is-warn');
      w.title = 'Expert setting — risky';
      w.setAttribute('aria-label', 'Expert setting — risky');
      w.removeAttribute('aria-hidden');
      marks.appendChild(w);
    }
    if (rs.valueKind === 'managed') { marks.appendChild(ico('lock')); }

    var end = h('span', { className: 'lg-row-end' });
    rs.chips.forEach(function (c) {
      if (c.kind === 'differs') { end.appendChild(chipEl('differs', c.label)); }
    });
    end.appendChild(chipEl(rs.valueKind, rs.valueLabel || rs.sourceLabel, rs.sourceLabel));

    var row = h('button', {
      className: 'lg-row' + (rs.editable ? '' : ' is-inert'),
      type: 'button',
      'aria-pressed': 'false',
      dataset: { rec: 'setting:' + s.id, sid: s.id },
      title: rs.sourceLabel,
      onClick: function () { selectRecord({ kind: 'setting', id: s.id }); }
    },
      h('span', { className: 'lg-row-label', text: s.label }),
      marks,
      end
    );
    return row;
  }

  /* -------------------------------------------------------------- home */

  function renderHome() {
    var doc = els.doc;
    var data = D();
    doc.appendChild(docHead('Settings · Overview', 'The settings ledger',
      'Every setting, notice, and manager as an inspectable record. Select any row to open it in the inspector — that is where editing happens.'));

    /* Notices ledger */
    var rank = { attention: 0, setup: 1, recommended: 2 };
    var notices = arr(data.notices).slice().sort(function (a, b) {
      var ra = (a.kind in rank) ? rank[a.kind] : 3;
      var rb = (b.kind in rank) ? rank[b.kind] : 3;
      return ra - rb;
    });
    var nHead = h('div', { className: 'lg-home-h' },
      h('h2', { text: 'Notices' }),
      h('span', { className: 'lg-home-note', text: notices.length === 0 ? '' : notices.length + ' open' })
    );
    doc.appendChild(nHead);
    if (notices.length === 0) {
      doc.appendChild(h('div', { className: 'lg-calm' }, ico('checkCircle'),
        'Nothing needs attention. Every connected route reports healthy, and no setup is waiting.'));
    } else {
      var ledger = h('div', { className: 'lg-notices', role: 'list' });
      notices.forEach(function (n) { ledger.appendChild(noticeEl(n)); });
      doc.appendChild(ledger);
    }

    /* Recents / continue */
    var recents = arr(data.recents);
    if (recents.length > 0) {
      doc.appendChild(h('div', { className: 'lg-home-h' }, h('h2', { text: 'Recent changes' }),
        h('span', { className: 'lg-home-note', text: 'Pick up where you left off' })));
      var rl = h('div', { className: 'lg-recents', role: 'list' });
      recents.forEach(function (r) {
        rl.appendChild(h('button', {
          className: 'lg-recent', type: 'button', role: 'listitem',
          onClick: function () { openTarget(r.target); }
        },
          h('span', { className: 'lg-recent-label', text: r.label }),
          h('span', { className: 'lg-recent-detail', text: r.detail }),
          h('span', { className: 'lg-recent-at', text: fmtTime(r.at) })
        ));
      });
      doc.appendChild(rl);
    }

    /* Destination index: places, not filters */
    doc.appendChild(h('div', { className: 'lg-home-h' }, h('h2', { text: 'Destinations' }),
      h('span', { className: 'lg-home-note', text: 'Domains and managers open as full workspaces' })));
    var idx = h('div', { className: 'lg-index', role: 'list' });
    arr(data.taxonomy).forEach(function (dom) {
      var count = 0, flagged = 0;
      arr(dom.subs).forEach(function (sub) {
        arr(sub.settingIds).forEach(function (sid) {
          var s = settings()[sid];
          if (!s) { return; }
          count++;
          var rs = window.PMState.resolveRowState(s);
          if (rs.statusTone === 'attention' || rs.valueKind === 'managed' || rs.exposure === 'unavailable') { flagged++; }
        });
      });
      idx.appendChild(h('button', {
        className: 'lg-index-row', type: 'button', role: 'listitem',
        dataset: { domain: dom.id },
        onClick: function () { openDomain(dom.id); }
      },
        h('span', { className: 'lg-index-num', text: dom.num }),
        h('span', { className: 'lg-index-ico' }, ico(dom.icon || 'gear')),
        h('span', { className: 'lg-index-main' },
          h('div', { className: 'lg-index-title', text: dom.title }),
          h('div', { className: 'lg-index-blurb', text: dom.blurb || '' })
        ),
        h('span', { className: 'lg-index-status', text: count + ' rec' + (flagged ? ' · ' + flagged + ' flagged' : '') }),
        h('span', { className: 'lg-index-open' }, 'Open', ico('arrowR'))
      ));
    });
    MANAGERS.forEach(function (m) {
      idx.appendChild(h('button', {
        className: 'lg-index-row', type: 'button', role: 'listitem',
        dataset: { manager: m.id },
        onClick: function () { openManager(m.id); }
      },
        h('span', { className: 'lg-index-num', text: 'M' }),
        h('span', { className: 'lg-index-ico' }, ico(m.icon)),
        h('span', { className: 'lg-index-main' },
          h('div', { className: 'lg-index-title', text: m.label }),
          h('div', { className: 'lg-index-blurb', text: m.blurb })
        ),
        h('span', { className: 'lg-index-status', text: 'Manager' }),
        h('span', { className: 'lg-index-open' }, 'Open', ico('arrowR'))
      ));
    });
    doc.appendChild(idx);

    /* All-records table */
    doc.appendChild(h('div', { className: 'lg-home-h' }, h('h2', { text: 'All records' }),
      h('span', { className: 'lg-home-note', text: 'Sortable. The query bar and state chips filter this table.' })));
    doc.appendChild(homeTableEl());
  }

  function noticeEl(n) {
    var rn = window.PMState.resolveNotice(n);
    var el = h('article', { className: 'lg-notice', 'data-kind': rn.tone, role: 'listitem' },
      h('h3', { className: 'lg-notice-headline', text: rn.headline }),
      statusWordEl(rn.tone, rn.statusWord),
      h('p', { className: 'lg-notice-consequence', text: rn.consequence }),
      h('div', { className: 'lg-notice-actions' },
        rn.primary && rn.primary.label ? h('button', {
          className: 'lg-btn' + (rn.tone === 'attention' ? ' is-primary' : ''), type: 'button',
          onClick: function () { runAct(rn.primary.act, n.target); }
        }, rn.primary.label) : null,
        rn.secondary && rn.secondary.label ? h('button', {
          className: 'lg-btn is-quiet', type: 'button',
          onClick: function () { runAct(rn.secondary.act, n.target); }
        }, rn.secondary.label) : null,
        h('button', {
          className: 'lg-btn is-quiet', type: 'button',
          onClick: function () { selectRecord({ kind: 'notice', id: n.id }); }
        }, 'Inspect')
      )
    );
    return el;
  }

  /* Home table: sortable, filterable; pages of rows (lazy materialization
     — Slint note: maps to a ListView over a sorted/filtered model). */

  var HOME_COLS = [
    { id: 'label', label: 'Setting' },
    { id: 'domain', label: 'Domain', cls: 'lg-th-domain' },
    { id: 'value', label: 'Value' },
    { id: 'source', label: 'Source', cls: 'lg-th-source' },
    { id: 'state', label: 'State' }
  ];

  function homeTableEl() {
    var wrap = h('div', { className: 'lg-tablewrap' });
    var table = h('table', { className: 'lg-table', id: 'lgHomeTable' });
    var thead = h('thead', null, h('tr', null, HOME_COLS.map(function (c) {
      var th = h('th', { scope: 'col', className: c.cls || '' });
      th.setAttribute('aria-sort', ui.sort.col === c.id ? (ui.sort.dir > 0 ? 'ascending' : 'descending') : 'none');
      var mark = h('span', { className: 'lg-sortmark' });
      if (ui.sort.col === c.id) { mark.appendChild(ico(ui.sort.dir > 0 ? 'chevU' : 'chevD')); }
      th.appendChild(h('button', {
        className: 'lg-th-btn', type: 'button',
        onClick: function () {
          if (ui.sort.col === c.id) { ui.sort.dir = -ui.sort.dir; }
          else { ui.sort = { col: c.id, dir: 1 }; }
          renderHomeTable();
        }
      },
        c.label,
        mark
      ));
      return th;
    })));
    table.appendChild(thead);
    table.appendChild(h('tbody', { id: 'lgHomeTbody' }));
    wrap.appendChild(table);
    wrap.appendChild(h('div', { className: 'lg-table-foot', id: 'lgHomeFoot' }));
    window.setTimeout(renderHomeTableBody, 0);
    return wrap;
  }

  function renderHomeTable() {
    var table = $('lgHomeTable');
    if (!table) { return; }
    var ths = table.querySelectorAll('th');
    for (var i = 0; i < ths.length; i++) {
      var c = HOME_COLS[i];
      ths[i].setAttribute('aria-sort', ui.sort.col === c.id ? (ui.sort.dir > 0 ? 'ascending' : 'descending') : 'none');
      var mark = ths[i].querySelector('.lg-sortmark');
      if (mark) {
        mark.innerHTML = '';
        if (ui.sort.col === c.id) { mark.appendChild(ico(ui.sort.dir > 0 ? 'chevU' : 'chevD')); }
      }
    }
    renderHomeTableBody();
  }

  var TONE_RANK = { attention: 0, setup: 1, recommended: 2, muted: 3, ok: 4 };
  var STATE_WORDS = { attention: 'Attention', setup: 'Setup', recommended: 'Suggestion', muted: 'Read-only', ok: 'OK' };

  function homeRowsData() {
    var q = ui.query.trim().toLowerCase();
    var hits = null;
    if (q) {
      hits = {};
      window.PMState.search(ui.query, D()).forEach(function (r) {
        if (r.kind === 'setting') { hits[r.id] = true; }
      });
    }
    var rows = [];
    Object.keys(settings()).forEach(function (sid) {
      var s = settings()[sid];
      var loc = locate(sid);
      var rs = window.PMState.resolveRowState(s);
      if (q && !hits[sid] && str(s.label).toLowerCase().indexOf(q) < 0) { return; }
      if (!chipsPass(s, rs)) { return; }
      rows.push({ s: s, rs: rs, loc: loc });
    });
    var col = ui.sort.col, dir = ui.sort.dir;
    rows.sort(function (a, b) {
      var av, bv;
      if (col === 'label') { av = str(a.s.label); bv = str(b.s.label); }
      else if (col === 'domain') { av = a.loc ? a.loc.domainTitle : ''; bv = b.loc ? b.loc.domainTitle : ''; }
      else if (col === 'value') { av = a.rs.valueLabel; bv = b.rs.valueLabel; }
      else if (col === 'source') { av = a.rs.sourceLabel; bv = b.rs.sourceLabel; }
      else { av = String(TONE_RANK[a.rs.statusTone]); bv = String(TONE_RANK[b.rs.statusTone]); }
      if (av === bv) { return str(a.s.label) < str(b.s.label) ? -1 : 1; }
      return (av < bv ? -1 : 1) * dir;
    });
    return rows;
  }

  function renderHomeTableBody() {
    var tbody = $('lgHomeTbody');
    var foot = $('lgHomeFoot');
    if (!tbody) { return; }
    var rows = homeRowsData();
    var shown = rows.slice(0, ui.homeRows);
    tbody.innerHTML = '';
    shown.forEach(function (r) {
      var tr = h('tr', {
        tabindex: '0',
        'aria-selected': 'false',
        dataset: { rec: 'setting:' + r.s.id },
        onClick: function () { selectRecord({ kind: 'setting', id: r.s.id }); },
        onKeydown: function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRecord({ kind: 'setting', id: r.s.id }); }
        }
      },
        h('td', { className: 'lg-td-label', text: r.s.label }),
        h('td', { className: 'lg-td-domain', text: r.loc ? r.loc.domainTitle : 'Unfiled' }),
        h('td', { className: 'lg-td-value', text: r.rs.valueLabel || '—' }),
        h('td', { className: 'lg-td-source', text: r.rs.sourceLabel }),
        h('td', { className: 'lg-td-state' },
          statusWordEl(r.rs.statusTone, STATE_WORDS[r.rs.statusTone] || 'OK'))
      );
      tbody.appendChild(tr);
    });
    if (foot) {
      foot.innerHTML = '';
      foot.appendChild(h('span', { text: shown.length + ' of ' + rows.length + ' records' }));
      if (rows.length > shown.length) {
        foot.appendChild(h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () { ui.homeRows += 60; renderHomeTableBody(); }
        }, 'Show more'));
      }
    }
    markSelectedRows();
  }

  /* ------------------------------------------------------ domain view */

  function renderDomain(domainId) {
    var dom = domainById(domainId);
    if (!dom) { els.doc.appendChild(docHead('Settings', 'Unknown domain', '')); return; }
    var doc = els.doc;
    doc.appendChild(docHead('Domain ' + dom.num + ' · Continuous document', dom.title, dom.blurb || ''));

    arr(dom.subs).forEach(function (sub, i) {
      var standard = [], advanced = [];
      arr(sub.settingIds).forEach(function (sid) {
        var s = settings()[sid];
        if (!s) { return; }
        if (s.exposure === 'diagnostic') { return; }
        if (s.exposure === 'advanced' || s.exposure === 'expert') { advanced.push(s); }
        else { standard.push(s); }
      });
      var sec = sectionEl(sub.id, dom.num + '.' + (i + 1), sub.title,
        (standard.length + advanced.length) + ' records', sub.blurb || '');
      standard.forEach(function (s) { sec.appendChild(settingRowEl(s)); });

      if (advanced.length > 0) {
        var open = !!ui.advOpen[sub.id];
        var hasExpert = advanced.some(function (s) { return s.exposure === 'expert'; });
        var disc = h('button', {
          className: 'lg-disclosure', type: 'button',
          'aria-expanded': open ? 'true' : 'false',
          onClick: function () {
            ui.advOpen[sub.id] = !ui.advOpen[sub.id];
            renderDoc();
            if (spyCtl) { spyCtl.refresh(); }
          }
        },
          ico(open ? 'chevD' : 'chevR'),
          'Advanced' + (hasExpert ? ' & expert' : '') + ' records (' + advanced.length + ')'
        );
        sec.appendChild(disc);
        if (open) {
          var drawer = h('div', { className: 'lg-drawer' });
          advanced.forEach(function (s) { drawer.appendChild(settingRowEl(s)); });
          if (hasExpert) {
            drawer.appendChild(h('p', { className: 'lg-drawer-note', text: 'Rows marked with a warning are expert settings. The inspector asks for explicit confirmation before it unlocks them.' }));
          }
          sec.appendChild(drawer);
        }
      }
      doc.appendChild(sec);
    });

    /* Diagnostics drawer: separate from ordinary exposure levels. */
    var diags = domainDiagnostics(dom);
    if (diags.length > 0) {
      var open = !!ui.diagOpen[dom.id];
      var sec = sectionEl('diag-' + dom.id, 'dx', 'Diagnostics', diags.length + ' records',
        'Read-mostly views for debugging. Kept in a drawer so they never read as everyday controls.');
      sec.appendChild(h('button', {
        className: 'lg-disclosure', type: 'button',
        'aria-expanded': open ? 'true' : 'false',
        onClick: function () {
          ui.diagOpen[dom.id] = !ui.diagOpen[dom.id];
          renderDoc();
          if (spyCtl) { spyCtl.refresh(); }
        }
      }, ico(open ? 'chevD' : 'chevR'), 'Open the diagnostics drawer'));
      if (open) {
        var drawer = h('div', { className: 'lg-drawer' });
        diags.forEach(function (s) { drawer.appendChild(settingRowEl(s)); });
        sec.appendChild(drawer);
      }
      doc.appendChild(sec);
    }
  }

  /* ------------------------------------------------- providers manager */

  function renderManager(managerId) {
    if (managerId === 'providers') { renderProvidersManager(); }
    else if (managerId === 'context') { renderContextManager(); }
    else if (managerId === 'commands') { renderCommandsManager(); }
    else { renderToolsManager(); }
  }

  function managerHeader(m, healthLine, addLabel, addAct) {
    return h('header', { className: 'lg-doc-head' },
      h('p', { className: 'lg-doc-kicker', text: 'Manager · Records & inspector' }),
      h('h1', { className: 'lg-doc-title', text: m.label }),
      h('p', { className: 'lg-doc-blurb', text: healthLine }),
      addLabel ? h('div', { className: 'lg-insp-actions' },
        h('button', { className: 'lg-btn', type: 'button', onClick: addAct }, ico('plus'), addLabel)
      ) : null
    );
  }

  function renderProvidersManager() {
    var doc = els.doc;
    var provs = arr(D().providers);
    var ready = provs.filter(function (p) { return p.status === 'ready'; }).length;
    var attention = provs.filter(function (p) { return p.status === 'auth-no-invoke' || p.status === 'degraded'; }).length;
    doc.appendChild(managerHeader(managerById('providers'),
      provs.length + ' connections · ' + ready + ' ready · ' + attention + ' need attention. Rows are records; select one to inspect and edit.',
      'Connect a provider',
      function () {
        window.PMState.receipt('Connect a provider',
          'The connection wizard walks through tool, account, API, and server routes in the finished product.');
      }));

    PROVIDER_SECTIONS.forEach(function (secDef) {
      if (secDef.kind) {
        var group = provs.filter(function (p) { return p.groupKind === secDef.kind; });
        if (group.length === 0) { return; }
        var sec = sectionEl(secDef.id, '', secDef.title, group.length + (group.length === 1 ? ' connection' : ' connections'), '');
        group.forEach(function (p) {
          sec.appendChild(providerRowEl(p));
          arr(p.models).forEach(function (m) { sec.appendChild(modelRowEl(p, m)); });
        });
        doc.appendChild(sec);
      } else if (secDef.id === 'prov-routes') {
        var routes = arr(D().freeRoutes);
        var sec2 = sectionEl(secDef.id, '', secDef.title, routes.length + ' routes',
          'No route is ever labeled plain "Free" — each carries its qualifier.');
        routes.forEach(function (fr) { sec2.appendChild(freeRouteRowEl(fr)); });
        doc.appendChild(sec2);
      } else if (secDef.id === 'prov-roles') {
        var roles = arr(D().roles);
        var sec3 = sectionEl(secDef.id, '', secDef.title, roles.length + ' roles',
          'Which route each responsibility uses. Planning conversations never silently downgrade.');
        roles.forEach(function (r) { sec3.appendChild(roleRowEl(r)); });
        doc.appendChild(sec3);
      } else if (secDef.id === 'prov-usage') {
        doc.appendChild(usageSectionEl(secDef));
      }
    });
  }

  function providerRowEl(p) {
    var info = providerStatusInfo(p);
    var end = h('span', { className: 'lg-row-end' },
      h('span', { className: 'lg-mono', text: info.auth + ' · ' + info.svc }),
      (info.tone === 'attention' || info.tone === 'setup')
        ? statusWordEl(info.tone, info.word) : null
    );
    var states = [];
    if (info.tone === 'attention') { states.push('attention'); }
    if (p.status === 'not-installed') { states.push('unavailable'); }
    return h('button', {
      className: 'lg-row', type: 'button', 'aria-pressed': 'false',
      dataset: { rec: 'provider:' + p.id, mlabel: (p.name + ' ' + p.family).toLowerCase(), states: states.join(' ') },
      onClick: function () { selectRecord({ kind: 'provider', id: p.id }); }
    },
      h('span', { className: 'lg-row-label', text: p.name }),
      h('span', { className: 'lg-row-sub', text: p.family || '' }),
      end
    );
  }

  function modelRowEl(p, m) {
    var marks = h('span', { className: 'lg-row-marks' });
    if (m.fav) {
      var f = ico('starFill', 'is-fav');
      f.title = 'Favorite';
      marks.appendChild(f);
    }
    if (m.hidden) { marks.appendChild(ico('eyeOff')); }
    var end = h('span', { className: 'lg-row-end' });
    if (m.requested && m.effectiveRoute) { end.appendChild(chipEl('differs', 'Effective differs')); }
    if (m.unavailableReason) { end.appendChild(chipEl('unavailable', 'Unavailable', m.unavailableReason)); }
    end.appendChild(h('span', { className: 'lg-mono', text: 'P' + (m.priority || '-') }));
    var states = [];
    if (m.unavailableReason) { states.push('unavailable'); }
    if (m.requested && m.effectiveRoute) { states.push('differs'); }
    return h('button', {
      className: 'lg-row is-sub' + (m.unavailableReason ? ' is-inert' : ''), type: 'button', 'aria-pressed': 'false',
      dataset: { rec: 'model:' + m.id, mlabel: (m.name + ' ' + (m.alias || '')).toLowerCase(), states: states.join(' ') },
      onClick: function () { selectRecord({ kind: 'model', id: m.id, providerId: p.id }); }
    },
      h('span', { className: 'lg-row-label', text: m.name }),
      m.alias ? h('span', { className: 'lg-row-sub', text: '“' + m.alias + '”' }) : null,
      marks,
      end
    );
  }

  function freeRouteRowEl(fr) {
    var hit = modelByRef(fr.modelRef);
    var name = hit ? hit.model.name : fr.modelRef;
    var under = providerById(fr.underlyingProviderId);
    return h('button', {
      className: 'lg-row', type: 'button', 'aria-pressed': 'false',
      dataset: { rec: 'freeRoute:' + fr.id, mlabel: (name + ' free').toLowerCase() },
      onClick: function () { selectRecord({ kind: 'freeRoute', id: fr.id }); }
    },
      h('span', { className: 'lg-row-label', text: name }),
      h('span', { className: 'lg-row-sub', text: under ? 'via ' + under.name : '' }),
      h('span', { className: 'lg-row-end' },
        chipEl(fr.qualifier === 'temporarily-unavailable' ? 'unavailable' : 'custom',
          QUALIFIER_LABELS[fr.qualifier] || 'Qualified route'))
    );
  }

  function roleRowEl(r) {
    var marks = h('span', { className: 'lg-row-marks' });
    if (r.lockedHigh) {
      var l = ico('lock');
      l.title = 'Locked to the high-quality route';
      marks.appendChild(l);
    }
    return h('button', {
      className: 'lg-row', type: 'button', 'aria-pressed': 'false',
      dataset: { rec: 'role:' + r.id, mlabel: r.label.toLowerCase() },
      onClick: function () { selectRecord({ kind: 'role', id: r.id }); }
    },
      h('span', { className: 'lg-row-label', text: r.label }),
      marks,
      h('span', { className: 'lg-row-end' },
        h('span', { className: 'lg-mono', text: r.assignedRoute }))
    );
  }

  function usageSectionEl(secDef) {
    var snap = D().usageSnapshot || {};
    var per = snap.perProvider || {};
    var sec = sectionEl(secDef.id, '', secDef.title, '', snap.note ||
      'Read-only snapshot; balances and forecasts live on the Usage page.');
    Object.keys(per).forEach(function (pid) {
      var p = providerById(pid);
      var u = per[pid] || {};
      sec.appendChild(h('div', { className: 'lg-row is-inert', tabindex: '0' },
        h('span', { className: 'lg-row-label', text: p ? p.name : pid }),
        h('span', { className: 'lg-row-sub', text: u.freshness || '' }),
        h('span', { className: 'lg-row-end' },
          h('span', { className: 'lg-mono', text: str(u.includedRemaining) }),
          chipEl(u.pressure === 'exhausted' ? 'unavailable' : 'default',
            'Pressure: ' + (PRESSURE_LABELS[u.pressure] || cap(str(u.pressure)) || 'Unknown')))
      ));
    });
    sec.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { runAct('open-usage'); }
      }, ico('gauge'), 'Open the Usage page')));
    return sec;
  }

  /* --------------------------------------------- context manager ------- */

  function renderContextManager() {
    var doc = els.doc;
    var cs = D().contextSources || {};
    var admitted = (cs.lastTurn && arr(cs.lastTurn.admitted)) || [];
    var omitted = (cs.lastTurn && arr(cs.lastTurn.omitted)) || [];
    var tokens = admitted.reduce(function (t, a) { return t + (a.tokens || 0); }, 0);
    doc.appendChild(managerHeader(managerById('context'),
      'Last turn admitted ' + admitted.length + ' sources (' + fmtCtx(tokens) + ') and omitted ' + omitted.length + '. Records below explain every decision.',
      'Add an instruction file',
      function () {
        window.PMState.receipt('Add an instruction file',
          'The finished product adds an AGENTS.md or scoped rules file to the chain.');
      }));

    /* Normal controls (ordinary settings, same record grammar) */
    var sec1 = sectionEl('ctx-controls', '', 'Context controls', '', 'Ordinary settings that shape what gets assembled. Select a row to edit in the inspector.');
    arr(cs.normalControls).forEach(function (sid) {
      var s = settings()[sid];
      if (s) { sec1.appendChild(settingRowEl(s)); }
    });
    doc.appendChild(sec1);

    /* Last turn: advanced view behind a disclosure */
    var sec2 = sectionEl('ctx-lastturn', '', 'Last turn: admitted & omitted', fmtCtx(tokens) + ' admitted',
      'The advanced provenance view: exactly what reached the model on the last turn, with reasons and token counts.');
    var open = ui.ctxLastTurnOpen;
    sec2.appendChild(h('button', {
      className: 'lg-disclosure', type: 'button', 'aria-expanded': open ? 'true' : 'false',
      onClick: function () { ui.ctxLastTurnOpen = !ui.ctxLastTurnOpen; renderDoc(); if (spyCtl) { spyCtl.refresh(); } }
    }, ico(open ? 'chevD' : 'chevR'), 'Show the last-turn breakdown (advanced)'));
    if (open) {
      var drawer = h('div', { className: 'lg-drawer' });
      admitted.forEach(function (a, i) {
        drawer.appendChild(h('button', {
          className: 'lg-row', type: 'button', 'aria-pressed': 'false',
          dataset: { rec: 'ctxAdmitted:' + i, mlabel: a.source.toLowerCase() },
          onClick: function () { selectRecord({ kind: 'ctxAdmitted', id: String(i) }); }
        },
          h('span', { className: 'lg-row-label', text: a.source }),
          h('span', { className: 'lg-row-end' },
            h('span', { className: 'lg-mono', text: fmtCtx(a.tokens) }),
            chipEl('default', 'Admitted', a.why))
        ));
      });
      omitted.forEach(function (o, i) {
        drawer.appendChild(h('button', {
          className: 'lg-row is-inert', type: 'button', 'aria-pressed': 'false',
          dataset: { rec: 'ctxOmitted:' + i, mlabel: o.source.toLowerCase() },
          onClick: function () { selectRecord({ kind: 'ctxOmitted', id: String(i) }); }
        },
          h('span', { className: 'lg-row-label', text: o.source }),
          h('span', { className: 'lg-row-end' }, chipEl('not-configured', 'Omitted', o.why))
        ));
      });
      drawer.appendChild(h('p', { className: 'lg-drawer-note', text: 'Omitted sources stay stored — omission is a per-turn decision, not deletion.' }));
      sec2.appendChild(drawer);
    }
    doc.appendChild(sec2);

    /* Compaction & cache: stable-prefix caching with hash provenance.
       Hashes are legitimate technical values here — rendered in the mono
       font as provenance data, consistent with the inspector thesis. */
    var cache = cs.cacheStrategy;
    if (cache && typeof cache === 'object') {
      var secC = sectionEl('ctx-cache', '', 'Compaction & cache', '',
        'How the assembled context is reused between turns. The hashes below are the provenance of the cached prefix.');
      secC.appendChild(kv([
        ['Strategy', str(cache.strategy) || 'Not reported'],
        ['Note', str(cache.note)],
        ['Prefix hash', str(cache.prefixHash), 'mono']
      ]));
      var hashes = arr(cache.sourceHashes);
      if (hashes.length > 0) {
        hashes.forEach(function (sh) {
          if (!sh) { return; }
          secC.appendChild(h('div', { className: 'lg-row is-inert', tabindex: '0' },
            h('span', { className: 'lg-row-label', text: str(sh.source) || 'Source' }),
            h('span', { className: 'lg-row-end' },
              h('span', { className: 'lg-mono', text: str(sh.hash) || 'No hash recorded' }))
          ));
        });
        secC.appendChild(h('p', { className: 'lg-drawer-note', text: 'When any source hash changes, the cached prefix is rebuilt on the next turn.' }));
      }
      doc.appendChild(secC);
    }

    /* Instruction files: AGENTS.md chain with precedence */
    var chain = arr(cs.agentsChain);
    var sec3 = sectionEl('ctx-instructions', '', 'Instruction files', chain.length + ' in the chain',
      'Files apply in precedence order; when they conflict, the later, more specific file wins.');
    chain.forEach(function (a, i) {
      sec3.appendChild(h('button', {
        className: 'lg-row', type: 'button', 'aria-pressed': 'false',
        dataset: { rec: 'ctxAgents:' + i, mlabel: a.path.toLowerCase() },
        onClick: function () { selectRecord({ kind: 'ctxAgents', id: String(i) }); }
      },
        h('span', { className: 'lg-row-label lg-mono', text: a.path }),
        h('span', { className: 'lg-row-end' }, chipEl('default', 'Precedence ' + a.precedence))
      ));
    });
    sec3.appendChild(h('button', {
      className: 'lg-row', type: 'button', 'aria-pressed': 'false',
      dataset: { rec: 'ctxDraft:draft', mlabel: 'thread instructions draft' },
      onClick: function () { selectRecord({ kind: 'ctxDraft', id: 'draft' }); }
    },
      h('span', { className: 'lg-row-label', text: 'Thread instructions draft' }),
      h('span', { className: 'lg-row-sub', text: 'Prose field · spellcheck demo' }),
      h('span', { className: 'lg-row-end' }, chipEl('custom', 'Draft'))
    ));
    doc.appendChild(sec3);

    /* Persona & tool footprint */
    var tvi = cs.toolsSelectedVsInstalled || {};
    var sec4 = sectionEl('ctx-persona', '', 'Persona & tool footprint', '',
      'What the active persona and tool selection cost in context.');
    sec4.appendChild(h('div', { className: 'lg-row is-inert', tabindex: '0' },
      h('span', { className: 'lg-row-label', text: 'Active persona footprint' }),
      h('span', { className: 'lg-row-end' }, h('span', { className: 'lg-mono', text: str(cs.personaFootprint) || 'None' }))
    ));
    sec4.appendChild(h('div', { className: 'lg-row is-inert', tabindex: '0' },
      h('span', { className: 'lg-row-label', text: 'Tool schemas in context' }),
      h('span', { className: 'lg-row-end' },
        h('span', { className: 'lg-mono', text: arr(tvi.selected).length + ' selected of ' + arr(tvi.installed).length + ' installed' }),
        chipEl('auto', 'Lazy exposure'))
    ));
    sec4.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { openManager('tools'); }
      }, ico('toolbox'), 'Open Skills, Plugins & Tools')));
    doc.appendChild(sec4);
  }

  /* ------------------------------------------------ tools manager ------ */

  function renderToolsManager() {
    var doc = els.doc;
    var tools = arr(D().tools);
    var skills = arr(D().skills);
    var plugins = arr(D().plugins);
    var failed = plugins.filter(function (p) { return p.lifecycle === 'failed'; }).length;
    doc.appendChild(managerHeader(managerById('tools'),
      tools.length + ' tools · ' + skills.length + ' skills · ' + plugins.length + ' plugins' +
      (failed ? ' · ' + failed + ' plugin failed to load' : '') + '. The funnel below shows why agents see so few of them.',
      'Install from catalog',
      function () {
        window.PMState.receipt('Install from catalog',
          'The catalog browser lists verified and community entries in the finished product.');
      }));

    /* Funnel */
    var stages = [
      { label: 'Installed', test: function (t) { return t.installed; } },
      { label: 'Enabled for project', test: function (t) { return t.installed && t.projectEnabled; } },
      { label: 'Available now', test: function (t) { return t.available; } },
      { label: 'Selected this turn', test: function (t) { return t.selectedThisTurn; } },
      { label: 'Invoked recently', test: function (t) { return t.invokedRecently; } }
    ];
    var sec1 = sectionEl('ext-funnel', '', 'Exposure funnel', tools.length + ' tools',
      'Installed does not mean exposed. Each stage narrows what an agent actually sees and uses.');
    var funnel = h('div', { className: 'lg-funnel' });
    var max = Math.max(1, tools.length);
    stages.forEach(function (st) {
      var n = tools.filter(st.test).length;
      funnel.appendChild(h('div', { className: 'lg-funnel-stage' },
        h('span', { className: 'lg-funnel-label', text: st.label }),
        h('span', { className: 'lg-funnel-bar-wrap' },
          h('span', { className: 'lg-funnel-bar', style: 'width:' + Math.round((n / max) * 100) + '%' })),
        h('span', { className: 'lg-funnel-count', text: String(n) })
      ));
    });
    sec1.appendChild(funnel);
    doc.appendChild(sec1);

    /* Tools */
    var sec2 = sectionEl('ext-tools', '', 'Tools', tools.length + ' records',
      'Risk and approval policy live on every record.');
    tools.forEach(function (t) {
      var states = [];
      if (!t.available) { states.push('unavailable'); }
      var end = h('span', { className: 'lg-row-end' },
        chipEl(t.risk === 'high' ? 'custom' : 'default', RISK_LABELS[t.risk] || 'Risk unknown'),
        t.available ? null : chipEl('unavailable', 'Unavailable')
      );
      sec2.appendChild(h('button', {
        className: 'lg-row' + (t.available ? '' : ' is-inert'), type: 'button', 'aria-pressed': 'false',
        dataset: { rec: 'tool:' + t.id, mlabel: t.name.toLowerCase(), states: states.join(' ') },
        onClick: function () { selectRecord({ kind: 'tool', id: t.id }); }
      },
        h('span', { className: 'lg-row-label', text: t.name }),
        t.selectedThisTurn ? h('span', { className: 'lg-row-sub', text: 'in context this turn' }) : null,
        end
      ));
    });
    doc.appendChild(sec2);

    /* Skills */
    var sec3 = sectionEl('ext-skills', '', 'Skills', skills.length + ' records',
      'Trust and scope are explicit; untrusted skills stay disabled until confirmed.');
    skills.forEach(function (sk) {
      sec3.appendChild(h('button', {
        className: 'lg-row', type: 'button', 'aria-pressed': 'false',
        dataset: { rec: 'skill:' + sk.id, mlabel: sk.name.toLowerCase() },
        onClick: function () { selectRecord({ kind: 'skill', id: sk.id }); }
      },
        h('span', { className: 'lg-row-label', text: sk.name }),
        h('span', { className: 'lg-row-sub', text: sk.source }),
        h('span', { className: 'lg-row-end' },
          sk.trusted ? chipEl('default', 'Trusted') : chipEl('not-configured', 'Not trusted'),
          chipEl(sk.enabled ? 'custom' : 'default', sk.enabled ? 'On' : 'Off'))
      ));
    });
    doc.appendChild(sec3);

    /* Plugins */
    var sec4 = sectionEl('ext-plugins', '', 'Plugins', plugins.length + ' records',
      'Lifecycle and failure states are records too — a crashed plugin explains itself.');
    plugins.forEach(function (pl) {
      var states = [];
      if (pl.lifecycle === 'failed') { states.push('attention'); }
      sec4.appendChild(h('button', {
        className: 'lg-row', type: 'button', 'aria-pressed': 'false',
        dataset: { rec: 'plugin:' + pl.id, mlabel: pl.name.toLowerCase(), states: states.join(' ') },
        onClick: function () { selectRecord({ kind: 'plugin', id: pl.id }); }
      },
        h('span', { className: 'lg-row-label', text: pl.name }),
        h('span', { className: 'lg-row-sub', text: pl.channel === 'canary' ? 'canary channel' : '' }),
        h('span', { className: 'lg-row-end' },
          pl.lifecycle === 'failed' ? statusWordEl('attention', 'Failed') : null,
          chipEl(pl.lifecycle === 'active' ? 'default' : (pl.lifecycle === 'update-available' ? 'recommended' : 'unavailable'),
            LIFECYCLE_LABELS[pl.lifecycle] || cap(pl.lifecycle)))
      ));
    });
    doc.appendChild(sec4);
  }

  /* --------------------------------------------- commands manager ------ */

  function commandsData() {
    var ci = D().commandsInfo || {};
    return {
      shortcuts: arr(ci.shortcuts),
      custom: arr(ci.customCommands),
      conflicts: arr(ci.conflicts)
    };
  }

  function shortcutLabel(sc, i) {
    return str(sc && sc.command) || 'Command ' + (i + 1);
  }

  function conflictFor(sc) {
    if (!sc) { return null; }
    var conflicts = commandsData().conflicts;
    for (var i = 0; i < conflicts.length; i++) {
      var c = conflicts[i];
      if (c && str(c.keys) === str(sc.keys) && arr(c.between).indexOf(str(sc.command)) >= 0) { return c; }
    }
    return null;
  }

  function effectiveKeys(sc, i) {
    return str(ui.cmdOverrides[shortcutLabel(sc, i)]) || str(sc && sc.keys) || 'Not bound';
  }

  function renderCommandsManager() {
    var doc = els.doc;
    var cd = commandsData();
    doc.appendChild(managerHeader(managerById('commands'),
      cd.shortcuts.length + ' shortcuts · ' + cd.custom.length + ' custom commands' +
      (cd.conflicts.length > 0 ? ' · ' + cd.conflicts.length + (cd.conflicts.length === 1 ? ' conflict resolved' : ' conflicts resolved') : '') +
      '. Rows are records; select one to remap or reset it in the inspector.',
      'Add custom command',
      function () {
        window.PMState.receipt('Add custom command',
          'The command editor names the command, the script it runs, and its scope in the finished product.');
      }));

    /* Shortcuts table: filterable; the conflict row carries its resolution. */
    var sec1 = sectionEl('cmd-shortcuts', '', 'Shortcuts', cd.shortcuts.length + ' records',
      'Filter by keys, command, or scope. Conflicting bindings are flagged on the row with how they were resolved.');
    sec1.appendChild(h('input', {
      className: 'lg-input lg-cmd-filter', type: 'search',
      value: ui.cmdFilter, placeholder: 'Filter shortcuts',
      'aria-label': 'Filter shortcuts by keys, command, or scope',
      onInput: function () { ui.cmdFilter = this.value; applyCmdFilter(); }
    }));
    var wrap = h('div', { className: 'lg-tablewrap' });
    var table = h('table', { className: 'lg-table lg-cmdtable' },
      h('thead', null, h('tr', null,
        h('th', { scope: 'col', text: 'Keys' }),
        h('th', { scope: 'col', text: 'Command' }),
        h('th', { scope: 'col', text: 'Scope' }))));
    var tbody = h('tbody', { id: 'lgCmdTbody' });
    cd.shortcuts.forEach(function (sc, i) {
      if (!sc) { return; }
      var cmd = shortcutLabel(sc, i);
      var conf = conflictFor(sc);
      var keysCell = h('td', { className: 'lg-td-keys' }, effectiveKeys(sc, i));
      if (ui.cmdOverrides[cmd]) { keysCell.appendChild(chipEl('custom', 'Remapped', 'Default: ' + str(sc.keys))); }
      var cmdCell = h('td', { className: 'lg-td-cmd' });
      if (conf) {
        var wi = ico('warning');
        wi.title = 'Conflicting binding — resolved below';
        cmdCell.appendChild(wi);
      }
      appendChild(cmdCell, cmd);
      tbody.appendChild(h('tr', {
        tabindex: '0', 'aria-selected': 'false',
        dataset: { rec: 'shortcut:' + cmd, cmdrow: String(i) },
        onClick: function () { selectRecord({ kind: 'shortcut', id: cmd }); },
        onKeydown: function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectRecord({ kind: 'shortcut', id: cmd }); }
        }
      },
        keysCell,
        cmdCell,
        h('td', { className: 'lg-td-scope', text: str(sc.scope) || 'Global' })
      ));
      if (conf) {
        var other = arr(conf.between).filter(function (x) { return x !== str(sc.command); })[0];
        var res = str(conf.resolution) || 'Resolved automatically';
        tbody.appendChild(h('tr', { className: 'lg-cmd-noterow', dataset: { cmdnote: String(i) } },
          h('td', { colspan: '3' }, ico('info'),
            (other ? 'Also bound to "' + other + '". ' : '') + res + (/[.!?]$/.test(res) ? '' : '.'))
        ));
      }
    });
    if (cd.shortcuts.length === 0) {
      tbody.appendChild(h('tr', { className: 'lg-cmd-noterow' },
        h('td', { colspan: '3', text: 'No shortcuts are on record in this dataset.' })));
    }
    table.appendChild(tbody);
    wrap.appendChild(table);
    sec1.appendChild(wrap);
    doc.appendChild(sec1);
    applyCmdFilter();

    /* Custom commands: enable/disable is local; add is a receipt. */
    var sec2 = sectionEl('cmd-custom', '', 'Custom commands', cd.custom.length + ' records',
      'Commands you have added yourself. Disabling one takes effect immediately and is easy to undo.');
    cd.custom.forEach(function (cc, i) {
      if (!cc) { return; }
      var name = str(cc.name) || 'Custom command ' + (i + 1);
      var off = !!ui.cmdDisabled[name];
      sec2.appendChild(h('button', {
        className: 'lg-row' + (off ? ' is-inert' : ''), type: 'button', 'aria-pressed': 'false',
        dataset: { rec: 'customCmd:' + name, mlabel: (name + ' ' + str(cc.runs)).toLowerCase() },
        onClick: function () { selectRecord({ kind: 'customCmd', id: name }); }
      },
        h('span', { className: 'lg-row-label lg-mono', text: name }),
        h('span', { className: 'lg-row-sub', text: str(cc.runs) }),
        h('span', { className: 'lg-row-end' },
          chipEl('default', str(cc.scope) || 'Project'),
          chipEl(off ? 'not-configured' : 'custom', off ? 'Off' : 'On'))
      ));
    });
    if (cd.custom.length === 0) {
      sec2.appendChild(h('p', { className: 'lg-drawer-note', text: 'No custom commands yet.' }));
    }
    sec2.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () {
          window.PMState.receipt('Add custom command',
            'The command editor names the command, the script it runs, and its scope in the finished product.');
        }
      }, ico('plus'), 'Add custom command')));
    doc.appendChild(sec2);
  }

  /* Filter dims rows in place — no reflow, matching the query-bar rule. */
  function applyCmdFilter() {
    var tbody = $('lgCmdTbody');
    if (!tbody) { return; }
    var q = str(ui.cmdFilter).trim().toLowerCase();
    var cd = commandsData();
    var rows = tbody.querySelectorAll('tr[data-cmdrow]');
    for (var i = 0; i < rows.length; i++) {
      var idx = parseInt(rows[i].dataset.cmdrow, 10);
      var sc = cd.shortcuts[idx] || {};
      var cmd = shortcutLabel(sc, idx);
      var hay = (str(sc.keys) + ' ' + str(ui.cmdOverrides[cmd]) + ' ' + cmd + ' ' + str(sc.scope)).toLowerCase();
      var dim = !!q && hay.indexOf(q) < 0;
      rows[i].classList.toggle('is-dim', dim);
      var note = tbody.querySelector('tr[data-cmdnote="' + idx + '"]');
      if (note) { note.classList.toggle('is-dim', dim); }
    }
  }

  function comboFromEvent(e) {
    var k = str(e.key);
    if (!k || k === 'Meta' || k === 'Control' || k === 'Alt' || k === 'Shift') { return null; }
    var parts = [];
    if (e.metaKey) { parts.push('Cmd'); }
    if (e.ctrlKey) { parts.push('Ctrl'); }
    if (e.altKey) { parts.push('Option'); }
    if (e.shiftKey) { parts.push('Shift'); }
    if (k === ' ') { k = 'Space'; }
    if (k.length === 1) { k = k.toUpperCase(); }
    parts.push(k);
    return parts.join('+');
  }

  /* ==================================================== inspector ====== */

  function inspHeader(kicker, title) {
    return [
      h('p', { className: 'lg-insp-kicker' },
        kicker,
        h('button', {
          className: 'lg-insp-close', type: 'button', title: 'Close inspector',
          onClick: function () { deselect(); }
        }, ico('close'), h('span', { className: 'pm-visually-hidden', text: 'Close inspector' }))
      ),
      h('h2', { className: 'lg-insp-title', text: title, tabindex: '-1', id: 'lgInspTitle' })
    ];
  }

  function block(title) {
    var b = h('div', { className: 'lg-insp-block' }, h('h3', { text: title }));
    for (var i = 1; i < arguments.length; i++) { appendChild(b, arguments[i]); }
    return b;
  }

  function kv(pairs) {
    var dl = h('dl', { className: 'lg-kv' });
    pairs.forEach(function (p) {
      if (!p || p[1] === undefined || p[1] === null || p[1] === '') { return; }
      dl.appendChild(h('dt', { text: p[0] }));
      var dd = h('dd', { className: p[2] === 'mono' ? 'lg-mono' : '' });
      appendChild(dd, p[1]);
      dl.appendChild(dd);
    });
    return dl;
  }

  var cmdCaptureStop = null; /* active shortcut-capture teardown, if any */

  function renderInspector() {
    detachSpells();
    if (cmdCaptureStop) { try { cmdCaptureStop(); } catch (e) { /* ignore */ } cmdCaptureStop = null; }
    var insp = els.insp;
    insp.innerHTML = '';
    var sel = ui.selected;
    els.root.classList.toggle('insp-open', !!sel);
    if (!sel) { renderInspectorSummary(); return; }
    var fns = {
      setting: inspectSetting, notice: inspectNotice, provider: inspectProvider,
      model: inspectModel, freeRoute: inspectFreeRoute, role: inspectRole,
      ctxAdmitted: inspectCtxAdmitted, ctxOmitted: inspectCtxOmitted,
      ctxAgents: inspectCtxAgents, ctxDraft: inspectCtxDraft,
      tool: inspectTool, skill: inspectSkill, plugin: inspectPlugin,
      shortcut: inspectShortcut, customCmd: inspectCustomCmd
    };
    var fn = fns[sel.kind];
    if (fn) { fn(sel); } else { renderInspectorSummary(); }
    if (isNarrow()) {
      var t = $('lgInspTitle');
      if (t) { try { t.focus(); } catch (e) { /* ignore */ } }
    }
  }

  function isNarrow() {
    var shell = $('pmShell');
    return !!shell && shell.classList.contains('is-narrow');
  }

  /* ------- summary (nothing selected): the ledger keeps talking -------- */

  function renderInspectorSummary() {
    var insp = els.insp;
    insp.innerHTML = '';
    if (ui.view.kind === 'home') {
      var all = Object.keys(settings());
      var counts = { managed: 0, differs: 0, unavailable: 0, attention: 0, advanced: 0, diagnostic: 0 };
      all.forEach(function (sid) {
        var s = settings()[sid];
        var rs = window.PMState.resolveRowState(s);
        if (rs.valueKind === 'managed') { counts.managed++; }
        if (rs.chips.some(function (c) { return c.kind === 'differs'; })) { counts.differs++; }
        if (rs.exposure === 'unavailable') { counts.unavailable++; }
        if (rs.statusTone === 'attention') { counts.attention++; }
        if (rs.exposure === 'advanced') { counts.advanced++; }
        if (rs.exposure === 'diagnostic') { counts.diagnostic++; }
      });
      appendChild(insp, [
        h('p', { className: 'lg-insp-kicker', text: 'Ledger summary' }),
        h('div', { className: 'lg-summary-count', text: String(all.length) }),
        h('p', { className: 'lg-insp-desc', text: 'settings on record across ' + arr(D().taxonomy).length + ' domains and ' + MANAGERS.length + ' managers. Select any row to inspect and edit it here.' }),
        h('div', { className: 'lg-summary-grid' },
          summaryCell('Managed', counts.managed),
          summaryCell('Differs from default', counts.differs),
          summaryCell('Unavailable', counts.unavailable),
          summaryCell('Attention', counts.attention),
          summaryCell('Advanced', counts.advanced),
          summaryCell('Diagnostic', counts.diagnostic)
        ),
        block('Notices', h('p', { className: 'lg-insp-desc', text: noticeSummaryText() }))
      ]);
      return;
    }
    if (ui.view.kind === 'domain') {
      var dom = domainById(ui.view.id);
      var activeId = spyCtl ? spyCtl.state.activeId : null;
      var sub = null, subNum = '';
      if (dom) {
        arr(dom.subs).forEach(function (sb, i) {
          if ('lgsec-' + sb.id === activeId) { sub = sb; subNum = dom.num + '.' + (i + 1); }
        });
      }
      if (!sub && dom) { sub = dom.subs[0]; subNum = dom.num + '.1'; }
      var stats = { count: 0, managed: 0, differs: 0, unavailable: 0, attention: 0, advanced: 0 };
      if (sub) {
        arr(sub.settingIds).forEach(function (sid) {
          var s = settings()[sid];
          if (!s) { return; }
          stats.count++;
          var rs = window.PMState.resolveRowState(s);
          if (rs.valueKind === 'managed') { stats.managed++; }
          if (rs.chips.some(function (c) { return c.kind === 'differs'; })) { stats.differs++; }
          if (rs.exposure === 'unavailable') { stats.unavailable++; }
          if (rs.statusTone === 'attention') { stats.attention++; }
          if (rs.exposure === 'advanced' || rs.exposure === 'expert') { stats.advanced++; }
        });
      }
      appendChild(insp, [
        h('p', { className: 'lg-insp-kicker', text: 'Position · ' + (dom ? dom.title : '') }),
        h('h2', { className: 'lg-insp-title', text: sub ? (subNum + ' ' + sub.title) : 'Document' }),
        sub && sub.blurb ? h('p', { className: 'lg-insp-desc', text: sub.blurb }) : null,
        h('div', { className: 'lg-summary-grid' },
          summaryCell('Records', stats.count),
          summaryCell('Managed', stats.managed),
          summaryCell('Differs', stats.differs),
          summaryCell('Unavailable', stats.unavailable),
          summaryCell('Attention', stats.attention),
          summaryCell('Advanced & expert', stats.advanced)
        ),
        h('p', { className: 'lg-note-line', text: 'The marker in the navigator steps as you scroll. Select a record to edit it here.' })
      ]);
      return;
    }
    /* manager summary */
    var m = managerById(ui.view.id);
    appendChild(insp, [
      h('p', { className: 'lg-insp-kicker', text: 'Manager summary' }),
      h('h2', { className: 'lg-insp-title', text: m ? m.label : 'Manager' }),
      h('p', { className: 'lg-insp-desc', text: m ? m.blurb : '' }),
      managerSummaryGrid(ui.view.id),
      h('p', { className: 'lg-note-line', text: 'Rows are records. Select one to inspect its full state and act on it here.' })
    ]);
  }

  function summaryCell(label, n) {
    return h('div', { className: 'lg-summary-cell' + (n === 0 ? ' is-zero' : '') },
      h('span', { className: 'lg-mono', text: String(n) }), label);
  }

  function noticeSummaryText() {
    var ns = arr(D().notices);
    if (ns.length === 0) { return 'None open. The ledger is calm.'; }
    var att = ns.filter(function (n) { return n.kind === 'attention'; }).length;
    var set = ns.filter(function (n) { return n.kind === 'setup'; }).length;
    var rec = ns.filter(function (n) { return n.kind === 'recommended'; }).length;
    var parts = [];
    if (att) { parts.push(att + ' need attention'); }
    if (set) { parts.push(set + ' setup'); }
    if (rec) { parts.push(rec + ' recommended'); }
    return parts.join(' · ') + '.';
  }

  function managerSummaryGrid(id) {
    if (id === 'providers') {
      var provs = arr(D().providers);
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Connections', provs.length),
        summaryCell('Ready', provs.filter(function (p) { return p.status === 'ready'; }).length),
        summaryCell('Need attention', provs.filter(function (p) { return p.status === 'auth-no-invoke' || p.status === 'degraded'; }).length),
        summaryCell('Signed out / missing', provs.filter(function (p) { return p.status === 'signed-out' || p.status === 'not-installed'; }).length),
        summaryCell('Free routes', arr(D().freeRoutes).length),
        summaryCell('Roles', arr(D().roles).length)
      );
    }
    if (id === 'context') {
      var cs = D().contextSources || {};
      var admitted = (cs.lastTurn && arr(cs.lastTurn.admitted)) || [];
      var omitted = (cs.lastTurn && arr(cs.lastTurn.omitted)) || [];
      var tk = admitted.reduce(function (t, a) { return t + (a.tokens || 0); }, 0);
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Admitted sources', admitted.length),
        summaryCell('Omitted sources', omitted.length),
        summaryCell('Instruction files', arr(cs.agentsChain).length),
        summaryCell('Tokens last turn', Math.round(tk / 100) / 10)
      );
    }
    if (id === 'commands') {
      var cd = commandsData();
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Shortcuts', cd.shortcuts.length),
        summaryCell('Custom commands', cd.custom.length),
        summaryCell('Conflicts resolved', cd.conflicts.length),
        summaryCell('Remapped this session', Object.keys(ui.cmdOverrides).length)
      );
    }
    var tools = arr(D().tools);
    return h('div', { className: 'lg-summary-grid' },
      summaryCell('Tools installed', tools.filter(function (t) { return t.installed; }).length),
      summaryCell('Selected this turn', tools.filter(function (t) { return t.selectedThisTurn; }).length),
      summaryCell('Skills', arr(D().skills).length),
      summaryCell('Plugins', arr(D().plugins).length)
    );
  }

  /* --------------------------- setting inspector (the editing surface) */

  function inspectSetting(sel) {
    var s = settings()[sel.id];
    if (!s) { renderInspectorSummary(); return; }
    var rs = window.PMState.resolveRowState(s);
    var loc = locate(s.id);
    var insp = els.insp;

    appendChild(insp, inspHeader('Setting record' + (loc ? ' · ' + loc.domainTitle + ' › ' + loc.subTitle : ''), s.label));
    if (rs.statusTone === 'attention' || rs.statusTone === 'setup') {
      insp.appendChild(h('p', null, statusWordEl(rs.statusTone, rs.statusTone === 'attention' ? 'Needs attention' : 'Setup')));
    }
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: s.desc || '' }));

    /* Expert risk framing: confirm before the control unlocks. The risk
       note stays visible after unlocking — unlocking removes the gate,
       never the warning. */
    var locked = false;
    if (s.exposure === 'expert') {
      locked = !ui.confirmedRisk[s.id];
      insp.appendChild(block('Caution',
        h('div', { className: 'lg-caution' },
          h('div', { className: 'lg-caution-head' }, ico('warning'), 'Expert setting'),
          h('p', { text: s.riskNote || 'Changing this can have serious consequences.' }),
          locked ? h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () { ui.confirmedRisk[s.id] = true; renderInspector(); }
          }, ico('unlock'), 'I understand the risk — unlock editing')
            : h('p', { className: 'lg-note-line', text: 'Editing is unlocked for this session. The risk above still applies.' })
        )));
    }
    if (rs.valueKind === 'managed') {
      insp.appendChild(block('Managed',
        h('div', { className: 'lg-managed-note' }, ico('lock'),
          h('span', null, s.managedReason || 'Managed by workspace policy. It cannot be changed here.'))));
    }
    if (rs.exposure === 'unavailable') {
      insp.appendChild(block('Why this is unavailable',
        h('div', { className: 'lg-unavail-note' }, ico('info'),
          h('span', null, s.unavailableReason || 'Not available in the current configuration.'))));
    }

    /* The control — all editing happens here. */
    var ctrl = h('div', { className: 'lg-control' + ((rs.editable && !locked) ? '' : ' is-disabled') });
    appendChild(ctrl, controlFor(s, rs, rs.editable && !locked));
    insp.appendChild(block('Value', ctrl));

    /* Requested vs effective */
    if (s.effective !== undefined && JSON.stringify(s.effective) !== JSON.stringify(s.value)) {
      insp.appendChild(block('Requested vs effective',
        h('div', { className: 'lg-diff' },
          h('div', { className: 'lg-diff-row' }, h('span', { className: 'lg-diff-key', text: 'Requested' }),
            h('span', { className: 'lg-diff-val', text: fmtVal(s, s.value) })),
          h('div', { className: 'lg-diff-row' }, h('span', { className: 'lg-diff-key', text: 'Effective' }),
            h('span', { className: 'lg-diff-val', text: fmtVal(s, s.effective) })),
          h('p', { className: 'lg-diff-why', text: s.effectiveReason || effectiveWhy(s) })
        )));
    }

    /* Provenance chain */
    insp.appendChild(block('Provenance', provenanceChainEl(s, rs)));

    /* Operational pairing for the concurrency ceiling */
    if (s.id === 'planning.goal.concurrency-ceiling') {
      var op = D().operational || {};
      insp.appendChild(block('Operational reality',
        kv([
          ['Configured ceiling', String(op.configuredCeiling || currentValue(s))],
          ['Sustainable now', String(op.sustainableNow || '')],
          ['Why', op.reason || '']
        ]),
        h('div', { className: 'lg-unavail-note', style: 'margin-top:8px' }, ico('warning'),
          h('span', null, op.waveWarning || ''))));
    }

    /* Flags, scope, record identity */
    var metaPairs = [];
    if (rs.flags.length > 0) {
      metaPairs.push(['Effects', rs.flags.map(function (f) { return f.label; }).join(' · ')]);
    }
    metaPairs.push(['Scope', arr(s.scope).map(cap).join(', ') || 'Global']);
    if (s.scopeNote) { metaPairs.push(['Scope note', s.scopeNote]); }
    metaPairs.push(['Source', rs.sourceLabel]);
    if (s.recommended !== undefined && rs.editable &&
        JSON.stringify(s.recommended) !== JSON.stringify(currentValue(s))) {
      metaPairs.push(['Recommended', fmtVal(s, s.recommended)]);
    }
    insp.appendChild(block('Record', kv(metaPairs.concat([
      ['Canonical id', s.id, 'mono'],
      ['Origin', s.src === 'inventory' ? 'Settings inventory (canonical)' : (s.src || 'Demo dataset')],
      ['Freshness', 'Resolved from the working store just now']
    ]))));

    /* Actions */
    var actions = h('div', { className: 'lg-insp-actions' });
    var isDefault = rs.valueKind === 'default';
    if (rs.editable) {
      actions.appendChild(h('button', {
        className: 'lg-btn', type: 'button', disabled: isDefault || locked,
        onClick: function () { resetSetting(s.id); }
      }, ico('history'), 'Reset to default'));
    }
    if (s.recommended !== undefined && rs.editable && !locked &&
        JSON.stringify(s.recommended) !== JSON.stringify(currentValue(s))) {
      actions.appendChild(h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { setSettingValue(s.id, s.recommended); }
      }, ico('sparkle'), 'Apply recommended'));
    }
    if (actions.childNodes.length > 0) { insp.appendChild(actions); }
  }

  function fmtVal(s, v) {
    /* Reuse the resolver's formatting by probing a shallow clone. */
    var probe = {};
    Object.keys(s).forEach(function (k) { probe[k] = s[k]; });
    probe.value = v;
    probe.valueSource = 'custom';
    probe.effective = undefined;
    var rs = window.PMState.resolveRowState(probe);
    return rs.valueLabel || String(v);
  }

  function effectiveWhy(s) {
    if (s.id.indexOf('concurrency') >= 0 || s.id.indexOf('max-parallel') >= 0) {
      return (D().operational && D().operational.reason) || 'Operational conditions cap the effective value right now.';
    }
    return 'A policy or provider condition changes the effective value right now.';
  }

  function provenanceChainEl(s, rs) {
    var chain = h('div', { className: 'lg-chain' });
    var src = s.valueSource || 'default';
    var scope = arr(s.scope);
    var layers = [];
    layers.push({
      name: 'Default', val: fmtVal(s, s['default']),
      note: 'Built into Puppet Master',
      active: src === 'default' || src === 'recommended'
    });
    var customLayer = scope.indexOf('thread') >= 0 ? 'Thread' : (scope.indexOf('project') >= 0 && scope.indexOf('global') < 0 ? 'Project' : 'Global');
    layers.push({
      name: 'Global',
      note: src === 'custom' && customLayer === 'Global' ? 'Set here by you' :
        (src === 'inherited' ? 'Sets the value this row inherits' : 'Not set'),
      val: (src === 'custom' && customLayer === 'Global') || src === 'inherited' ? rs.valueLabel : '',
      active: (src === 'custom' && customLayer === 'Global') || src === 'inherited'
    });
    layers.push({
      name: 'Project',
      note: src === 'custom' && customLayer === 'Project' ? 'Set here for this project' :
        (src === 'inherited' ? 'Inherits the global value' : (scope.indexOf('project') >= 0 ? 'Not set' : 'Does not apply')),
      val: src === 'custom' && customLayer === 'Project' ? rs.valueLabel : '',
      active: src === 'custom' && customLayer === 'Project'
    });
    layers.push({
      name: 'Thread',
      note: src === 'custom' && customLayer === 'Thread' ? 'Overridden for this conversation only' :
        (scope.indexOf('thread') >= 0 ? 'Not overridden' : 'Does not apply'),
      val: src === 'custom' && customLayer === 'Thread' ? rs.valueLabel : '',
      active: src === 'custom' && customLayer === 'Thread'
    });
    if (src === 'managed') {
      layers.push({ name: 'Policy', note: s.managedReason || 'Workspace policy overrides every layer', val: rs.valueLabel, active: true });
    }
    if (src === 'auto') {
      layers.push({ name: 'Runtime', note: 'Chosen automatically from the environment', val: rs.valueLabel, active: true });
    }
    if (src === 'not-configured') {
      layers.push({ name: 'Nowhere', note: 'No layer sets this value yet', val: '', active: true });
    }
    layers.forEach(function (l) {
      chain.appendChild(h('div', { className: 'lg-chain-layer' + (l.active ? ' is-active' : '') },
        h('span', { className: 'lg-chain-name', text: l.name }),
        h('span', { className: 'lg-chain-note', text: l.note }),
        l.val ? h('span', { className: 'lg-chain-val', text: l.val }) : null
      ));
    });
    return chain;
  }

  /* ------------------------------------------------ setting controls -- */

  function controlFor(s, rs, editable) {
    var type = s.type;
    var val = currentValue(s);
    if (type === 'toggle') {
      return h('button', {
        className: 'lg-toggle', type: 'button', role: 'switch',
        'aria-checked': val ? 'true' : 'false',
        disabled: !editable,
        onClick: function () { if (editable) { setSettingValue(s.id, !currentValue(s)); } }
      },
        h('span', { className: 'lg-toggle-track' }, h('span', { className: 'lg-toggle-knob' })),
        h('span', { className: 'lg-toggle-word', text: val ? 'On' : 'Off' })
      );
    }
    if (type === 'select') {
      var selEl = h('select', {
        className: 'lg-select', 'aria-label': s.label, disabled: !editable,
        onChange: function () { setSettingValue(s.id, castOption(s, this.value)); }
      });
      arr(s.options).forEach(function (o) {
        var value = (o && typeof o === 'object') ? (o.value !== undefined ? o.value : o.id) : o;
        var label = (o && typeof o === 'object') ? (o.label || String(value)) : String(o);
        var opt = h('option', { value: String(value), text: label });
        if (String(value) === String(val)) { opt.selected = true; }
        selEl.appendChild(opt);
      });
      return selEl;
    }
    if (type === 'radio') {
      var group = h('div', { className: 'lg-radio-group', role: 'radiogroup', 'aria-label': s.label });
      arr(s.options).forEach(function (o) {
        var value = (o && typeof o === 'object') ? (o.value !== undefined ? o.value : o.id) : o;
        var label = (o && typeof o === 'object') ? (o.label || String(value)) : String(o);
        group.appendChild(h('button', {
          className: 'lg-radio', type: 'button', role: 'radio',
          'aria-checked': String(value) === String(val) ? 'true' : 'false',
          disabled: !editable,
          onClick: function () { if (editable) { setSettingValue(s.id, value); } }
        },
          h('span', { className: 'lg-radio-dot' }),
          h('span', { text: label })
        ));
      });
      return group;
    }
    if (type === 'number') {
      return h('input', {
        className: 'lg-input', type: 'number', value: val === undefined || val === null ? '' : String(val),
        'aria-label': s.label, disabled: !editable,
        onChange: function () {
          var n = parseFloat(this.value);
          if (!isNaN(n)) { setSettingValue(s.id, n); }
        }
      });
    }
    if (type === 'slider') {
      var min = typeof s.min === 'number' ? s.min : (typeof val === 'number' && val <= 1 ? 0 : 0);
      var maxv = typeof s.max === 'number' ? s.max : (typeof val === 'number' && val <= 1 ? 1 : 100);
      var stepv = typeof s.step === 'number' ? s.step : (maxv <= 1 ? 0.05 : 1);
      var out = h('output', { text: String(val) });
      var range = h('input', {
        className: '', type: 'range', min: String(min), max: String(maxv), step: String(stepv),
        value: String(typeof val === 'number' ? val : min),
        'aria-label': s.label, disabled: !editable,
        onInput: function () { out.textContent = this.value; },
        onChange: function () { setSettingValue(s.id, parseFloat(this.value)); }
      });
      return h('div', { className: 'lg-slider-row' }, range, out);
    }
    if (type === 'text' || type === 'path') {
      var explicitBlank = rs.valueKind === 'auto' || rs.valueKind === 'inherited' || rs.valueKind === 'not-configured';
      return h('div', { className: 'lg-control' },
        explicitBlank ? chipEl(rs.valueKind, rs.valueLabel, 'Blank never means auto — this chip states it explicitly') : null,
        h('input', {
          className: 'lg-input', type: 'text',
          value: typeof val === 'string' ? val : '',
          placeholder: explicitBlank ? 'Type to set an explicit value' : '',
          'aria-label': s.label, disabled: !editable,
          onChange: function () { setSettingValue(s.id, this.value); }
        })
      );
    }
    if (type === 'action') {
      return h('button', {
        className: 'lg-btn', type: 'button', disabled: !editable,
        onClick: function () {
          window.PMState.receipt(s.label, 'This opens its own surface in the finished product.');
        }
      }, ico('external'), str(val) || 'Open');
    }
    if (type === 'list' || type === 'multiselect' || type === 'keyvalue') {
      var wrap = h('div', { className: 'lg-list-editor' });
      var items = [];
      if (type === 'keyvalue' && val && typeof val === 'object' && !Array.isArray(val)) {
        items = Object.keys(val).map(function (k) { return k + ' = ' + val[k]; });
      } else if (Array.isArray(val)) {
        items = val.map(String);
      }
      if (items.length === 0) {
        wrap.appendChild(chipEl(rs.valueKind, rs.valueLabel || 'No entries'));
      } else {
        items.forEach(function (it) { wrap.appendChild(h('div', { className: 'lg-list-item', text: it })); });
      }
      wrap.appendChild(h('button', {
        className: 'lg-btn', type: 'button', disabled: !editable,
        onClick: function () {
          window.PMState.receipt('Edit entries', 'The entry editor for "' + s.label + '" opens as its own surface in the finished product.');
        }
      }, ico('edit'), 'Edit entries'));
      return wrap;
    }
    return h('p', { className: 'lg-insp-desc', text: 'This record type renders read-only in the demo.' });
  }

  function castOption(s, raw) {
    var opts = arr(s.options);
    for (var i = 0; i < opts.length; i++) {
      var o = opts[i];
      var value = (o && typeof o === 'object') ? (o.value !== undefined ? o.value : o.id) : o;
      if (String(value) === raw) { return value; }
    }
    return raw;
  }

  /* ------------------------------------------------- notice inspector - */

  function inspectNotice(sel) {
    var n = arr(D().notices).filter(function (x) { return x.id === sel.id; })[0];
    if (!n) { renderInspectorSummary(); return; }
    var rn = window.PMState.resolveNotice(n);
    var insp = els.insp;
    appendChild(insp, inspHeader('Notice record', rn.headline));
    insp.appendChild(h('p', null, statusWordEl(rn.tone, rn.statusWord)));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: rn.consequence }));
    var actions = h('div', { className: 'lg-insp-actions' });
    if (rn.primary && rn.primary.label) {
      actions.appendChild(h('button', {
        className: 'lg-btn is-primary', type: 'button',
        onClick: function () { runAct(rn.primary.act, n.target); }
      }, rn.primary.label));
    }
    if (rn.secondary && rn.secondary.label) {
      actions.appendChild(h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () { runAct(rn.secondary.act, n.target); }
      }, rn.secondary.label));
    }
    insp.appendChild(actions);

    /* Spell-checked prose field #1: a note attached to the record. */
    var noteKey = 'note.' + n.id;
    var prose = h('div', {
      className: 'lg-prose', contenteditable: 'true', role: 'textbox',
      'aria-multiline': 'true', 'aria-label': 'Note to self about this notice'
    });
    var savedNote = store.get(noteKey);
    prose.textContent = typeof savedNote === 'string' && savedNote ? savedNote
      : 'Definately follow up on this before the demo.';
    prose.addEventListener('blur', function () { store.set(noteKey, prose.textContent || ''); });
    insp.appendChild(block('Note to self',
      prose,
      h('p', { className: 'lg-prose-hint', text: 'Spellcheck underlines suggestions and never replaces text on its own. Right-click or press Cmd+period on an underlined word.' })));
    attachSpell(prose);
  }

  /* ----------------------------------------------- provider inspector - */

  function inspectProvider(sel) {
    var p = providerById(sel.id);
    if (!p) { renderInspectorSummary(); return; }
    var info = providerStatusInfo(p);
    var insp = els.insp;
    appendChild(insp, inspHeader('Provider record · ' + (GROUP_LABELS[p.groupKind] || 'Connection'), p.name));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: p.statusNote || '' }));

    /* Two-step status: authenticated is not the same as ready. */
    insp.appendChild(block('Status',
      kv([
        ['Sign-in', info.auth],
        ['Service', info.svc]
      ]),
      (p.status === 'auth-no-invoke')
        ? h('div', { className: 'lg-unavail-note', style: 'margin-top:8px' }, ico('warning'),
          h('span', null, 'Authenticated is not the same as ready: sign-in succeeds, but model calls are rejected. Run the check below to re-test.'))
        : null,
      h('div', { className: 'lg-insp-actions' },
        (p.status === 'auth-no-invoke' || p.status === 'ready' || p.status === 'degraded')
          ? h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () { window.PMState.trigger('invoke-test', p.id); PMShellStatus('Running invocation test on ' + p.name + '…'); }
          }, ico('play'), 'Run invocation test') : null,
        (p.status === 'degraded' || p.status === 'auth-no-invoke')
          ? h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () { window.PMState.trigger('reconnect', p.id); }
          }, ico('plug'), 'Reconnect') : null,
        (p.status === 'signed-out')
          ? h('button', {
            className: 'lg-btn is-primary', type: 'button',
            onClick: function () { runAct('cli-login', { providerId: p.id }); }
          }, ico('key'), 'Open the CLI sign-in') : null,
        (p.status === 'not-installed')
          ? h('button', {
            className: 'lg-btn is-primary', type: 'button',
            onClick: function () {
              window.PMState.receipt('Install ' + p.name, 'Installation runs through the tool’s own installer in the finished product.');
            }
          }, ico('download'), 'Install') : null
      )
    ));

    /* The seven default answers */
    var ab = p.defaultAnswerBlock || {};
    insp.appendChild(block('At a glance',
      kv([
        ['Connected', ab.connected === true ? 'Yes' : (ab.connected === false ? 'No' : ab.connected)],
        ['Account in use', ab.accountInUse],
        ['Billing route', ab.billingRoute],
        ['Remaining', ab.remaining],
        ['When it runs out', ab.onExhaust],
        ['Models available', ab.modelsAvail],
        ['Attention', ab.attention === false ? 'Nothing needs attention' : ab.attention]
      ])));

    /* Sign-in ownership: CLI-owned OAuth vs PM-direct */
    if (p.oauthNote || arr(p.connections).length > 0) {
      var b = block('Sign-in ownership');
      if (p.oauthNote) { b.appendChild(h('p', { className: 'lg-insp-desc', text: p.oauthNote })); }
      arr(p.connections).forEach(function (c) {
        b.appendChild(kv([
          ['Route', c.route, 'mono'],
          ['Detail', c.note]
        ]));
      });
      insp.appendChild(b);
    }

    /* Accounts with full controls */
    if (arr(p.accounts).length > 0) {
      var accBlock = block('Accounts (' + p.accounts.length + ')');
      arr(p.accounts).forEach(function (a) { accBlock.appendChild(accountCardEl(p, a)); });
      if (p.accounts.length > 1) {
        accBlock.appendChild(h('p', { className: 'lg-note-line', text: 'Switching the account affects future simulated requests only — nothing already running moves.' }));
      }
      insp.appendChild(accBlock);
    }

    /* Catalog freshness, preserving last-known-good */
    var cat = p.catalog || {};
    var catState;
    if (cat.state === 'refreshing') { catState = 'Refreshing — existing rows stay usable'; }
    else if (cat.state === 'stale') { catState = 'Stale'; }
    else if (cat.state === 'quarantined') {
      catState = cat.lastKnownGood ? 'Quarantined — the last good catalog is still serving' : 'Quarantined';
    }
    else { catState = 'Fresh'; }
    var catBlock = block('Model catalog',
      kv([
        ['State', catState],
        ['Source', cat.sourceVersion],
        ['Last checked', fmtTime(cat.lastChecked)],
        ['Last activated', fmtTime(cat.lastActivated)]
      ]),
      cat.state === 'quarantined' ? h('div', { className: 'lg-unavail-note', style: 'margin-top:8px' }, ico('warning'),
        h('span', null, cat.quarantineReason || 'The latest catalog update failed validation, so the previous catalog keeps serving.')) : null);
    var mc = arr(cat.materialChanges);
    if (mc.length > 0) {
      catBlock.appendChild(h('p', { className: 'lg-cat-subhead', text: 'Material changes' }));
      var mcList = h('div', { className: 'lg-cat-log' });
      mc.forEach(function (c) {
        if (!c) { return; }
        mcList.appendChild(h('div', { className: 'lg-cat-log-item' },
          h('span', { className: 'lg-cat-log-at lg-mono', text: fmtTime(c.at) }),
          h('div', { className: 'lg-cat-log-main' },
            h('div', { text: str(c.what) || 'Catalog change' }),
            c.effect ? h('div', { className: 'lg-cat-log-effect', text: str(c.effect) }) : null)));
      });
      catBlock.appendChild(mcList);
    }
    var rh = arr(cat.removedHistory);
    if (rh.length > 0) {
      catBlock.appendChild(h('p', { className: 'lg-cat-subhead', text: 'Removals & pricing changes' }));
      var rhList = h('div', { className: 'lg-cat-log' });
      rh.forEach(function (r2) {
        if (!r2) { return; }
        var word = r2.change === 'no-longer-free' ? 'No longer free' : 'Removed';
        rhList.appendChild(h('div', { className: 'lg-cat-log-item' },
          h('span', { className: 'lg-cat-log-at lg-mono', text: fmtTime(r2.at) }),
          h('div', { className: 'lg-cat-log-main' },
            h('div', { text: (str(r2.model) || 'A listed model') + ' — ' + word }),
            r2.note ? h('div', { className: 'lg-cat-log-effect', text: str(r2.note) }) : null)));
      });
      catBlock.appendChild(rhList);
    }
    catBlock.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button', disabled: cat.state === 'refreshing',
        onClick: function () { window.PMState.trigger('catalog-refresh', p.id); renderInspector(); }
      }, ico('refresh'), cat.state === 'refreshing' ? 'Refreshing…' : 'Refresh catalog'),
      h('span', { className: 'lg-note-line', text: 'Last-known-good rows are kept while refreshing.' })));
    insp.appendChild(catBlock);

    /* What happens next — provider-specific options only */
    var wn = arr(p.whatNext);
    if (wn.length > 0) {
      var wnKey = 'wn.' + p.id;
      var chosen = str(store.get(wnKey)) || wn[0];
      var group = h('div', { className: 'lg-radio-group', role: 'radiogroup', 'aria-label': 'When included usage runs out' });
      wn.forEach(function (opt) {
        group.appendChild(h('button', {
          className: 'lg-radio', type: 'button', role: 'radio',
          'aria-checked': chosen === opt ? 'true' : 'false',
          onClick: function () {
            store.set(wnKey, opt);
            window.PMState.receipt('Continuation choice', '"' + (WHATNEXT_LABELS[opt] || opt) + '" will apply to future simulated requests on ' + p.name + '.');
            renderInspector();
          }
        },
          h('span', { className: 'lg-radio-dot' }),
          h('span', { text: WHATNEXT_LABELS[opt] || opt })
        ));
      });
      insp.appendChild(block('When included usage runs out',
        group,
        h('p', { className: 'lg-note-line', text: 'Only choices this provider actually supports are listed. There is no universal budget switch.' })));
    }

    /* Usage snapshot (read-only) */
    var snap = (D().usageSnapshot && D().usageSnapshot.perProvider) || {};
    var u = snap[p.id];
    if (u) {
      insp.appendChild(block('Usage snapshot (read-only)',
        kv([
          ['Included', u.includedRemaining],
          ['Extra', u.extra],
          ['Resets', fmtTime(u.resetAt)],
          ['Pressure', PRESSURE_LABELS[u.pressure] || cap(str(u.pressure))],
          ['Last use', fmtTime(u.lastUse)],
          ['Projection', u.projection],
          ['Freshness', u.freshness]
        ]),
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () { runAct('open-usage'); }
          }, ico('gauge'), 'Open the Usage page'))));
    }
  }

  function PMShellStatus(msg) {
    try { window.PMShell.status(msg); } catch (e) { /* ignore */ }
  }

  function accountCardEl(p, a) {
    var card = h('div', { className: 'lg-account' });
    var healthWord = HEALTH_LABELS[str(a.health)] || 'Unknown';
    var healthKind = 'not-configured';
    if (a.health === 'usage-exhausted') { healthKind = 'unavailable'; }
    else if (a.health === 'ready' || a.health === 'ok') { healthKind = 'default'; }
    var healthChip = chipEl(healthKind, healthWord);
    card.appendChild(h('div', { className: 'lg-account-head' },
      h('span', { className: 'lg-account-name', text: a.nickname || a.identity }),
      healthChip));
    card.appendChild(kv([
      ['Identity', a.identity, 'mono'],
      ['Sign-in', AUTH_OWNER_LABELS[a.authOwner] || 'Unknown'],
      ['Isolation', ISOLATION_LABELS[a.isolation] || 'Unknown'],
      ['Included', a.usage && a.usage.includedRemaining],
      ['Extra', a.usage && a.usage.extra],
      ['Resets', a.usage && fmtTime(a.usage.resetAt)],
      ['Pressure', a.usage && (PRESSURE_LABELS[a.usage.pressure] || cap(str(a.usage.pressure)))],
      ['Last use', a.usage && fmtTime(a.usage.lastUse)],
      ['Catalog refreshed', a.lastCatalogRefresh && fmtTime(a.lastCatalogRefresh)],
      ['Projection', a.projection]
    ]));

    /* Controls: nickname, enabled, priority, use-next, sticky */
    var nick = h('input', {
      className: 'lg-input', type: 'text', value: a.nickname || '',
      'aria-label': 'Nickname for ' + (a.identity || 'this account'),
      onChange: function () {
        a.nickname = this.value;
        window.PMState.receipt('Rename account', 'The nickname is display-only and saved locally.');
        renderInspector();
      }
    });
    card.appendChild(h('div', { className: 'lg-insp-block', style: 'margin-top:10px' },
      h('h3', { text: 'Nickname' }), nick));

    var controls = h('div', { className: 'lg-account-controls' });
    controls.appendChild(h('button', {
      className: 'lg-btn', type: 'button', role: 'switch', 'aria-checked': a.enabled ? 'true' : 'false',
      onClick: function () {
        a.enabled = !a.enabled;
        window.PMState.receipt(a.enabled ? 'Enable account' : 'Disable account',
          (a.nickname || a.identity) + (a.enabled ? ' is eligible for routing again.' : ' will be skipped by routing.'));
        renderInspector();
      }
    }, ico(a.enabled ? 'checkCircle' : 'pause'), a.enabled ? 'Enabled' : 'Disabled'));
    controls.appendChild(h('button', {
      className: 'lg-btn' + (a.useNext ? ' is-primary' : ''), type: 'button',
      'aria-pressed': a.useNext ? 'true' : 'false',
      onClick: function () {
        arr(p.accounts).forEach(function (x) { x.useNext = false; });
        a.useNext = true;
        window.PMState.receipt('Use for new requests',
          'Future simulated requests on ' + p.name + ' start on ' + (a.nickname || a.identity) + '. Running work is not moved.');
        renderInspector();
      }
    }, ico('arrowR'), a.useNext ? 'Next requests start here' : 'Use for new requests'));
    controls.appendChild(h('button', {
      className: 'lg-btn', type: 'button', 'aria-pressed': a.sticky ? 'true' : 'false',
      onClick: function () {
        a.sticky = !a.sticky;
        window.PMState.receipt('Sticky routing', a.sticky
          ? 'Threads that started on this account stay on it.'
          : 'Threads may fall through to other accounts when this one is busy.');
        renderInspector();
      }
    }, ico('pin'), a.sticky ? 'Sticky' : 'Not sticky'));

    var prio = h('select', { className: 'lg-select', style: 'width:auto', 'aria-label': 'Priority for ' + (a.nickname || a.identity) });
    for (var i = 1; i <= arr(p.accounts).length; i++) {
      var opt = h('option', { value: String(i), text: 'Priority ' + i });
      if (a.priority === i) { opt.selected = true; }
      prio.appendChild(opt);
    }
    prio.addEventListener('change', function () {
      a.priority = parseInt(prio.value, 10);
      window.PMState.receipt('Reorder accounts', (a.nickname || a.identity) + ' moves to priority ' + a.priority + ' for future fall-through.');
      renderInspector();
    });
    controls.appendChild(prio);
    card.appendChild(controls);

    /* Record actions: repair (receipt) and inline logs. */
    var logsKey = str(p.id) + '/' + str(a.identity || a.nickname || 'account');
    var logsOpen = !!ui.accountLogsOpen[logsKey];
    var recActions = h('div', { className: 'lg-insp-actions' });
    recActions.appendChild(h('button', {
      className: 'lg-btn', type: 'button',
      onClick: function () {
        window.PMState.receipt('Repair account',
          'Puppet Master re-checks the sign-in, refreshes credentials, and re-runs the readiness probe for ' +
          (a.nickname || a.identity || 'this account') + ' in the finished product.');
      }
    }, ico('wrench'), 'Repair'));
    recActions.appendChild(h('button', {
      className: 'lg-btn', type: 'button', 'aria-expanded': logsOpen ? 'true' : 'false',
      onClick: function () {
        ui.accountLogsOpen[logsKey] = !ui.accountLogsOpen[logsKey];
        renderInspector();
      }
    }, ico('history'), logsOpen ? 'Hide logs' : 'View logs'));
    card.appendChild(recActions);
    if (logsOpen) { card.appendChild(accountLogEl(p, a)); }
    return card;
  }

  /* Inline account log: built defensively from whatever the record carries. */
  function accountLogEl(p, a) {
    var lines = [];
    if (a.lastCatalogRefresh) { lines.push(fmtTime(a.lastCatalogRefresh) + '  Catalog refreshed for this account.'); }
    if (a.usage && a.usage.lastUse) { lines.push(fmtTime(a.usage.lastUse) + '  Request completed normally.'); }
    if (a.usage && a.usage.resetAt) { lines.push(fmtTime(a.usage.resetAt) + '  Included usage resets.'); }
    lines.push('Latest health check: ' + (HEALTH_LABELS[str(a.health)] || 'Unknown') + '.');
    var wrap = h('div', {
      className: 'lg-account-log', role: 'log',
      'aria-label': 'Recent log entries for ' + str(a.nickname || a.identity || 'this account')
    });
    if (lines.length === 0) {
      wrap.appendChild(h('div', { className: 'lg-account-log-line', text: 'No log entries recorded for this account.' }));
    } else {
      lines.forEach(function (ln) { wrap.appendChild(h('div', { className: 'lg-account-log-line', text: ln })); });
    }
    return wrap;
  }

  /* ------------------------------------------------- model inspector -- */

  function inspectModel(sel) {
    var p = providerById(sel.providerId);
    var m = null;
    if (p) { arr(p.models).forEach(function (x) { if (x.id === sel.id) { m = x; } }); }
    if (!m) { var hit = modelByRef(sel.id); if (hit) { p = hit.provider; m = hit.model; } }
    if (!m) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Model record · ' + (p ? p.name : ''), m.name));

    if (m.unavailableReason) {
      insp.appendChild(block('Why this is unavailable',
        h('div', { className: 'lg-unavail-note' }, ico('info'), h('span', null, m.unavailableReason))));
    }

    /* Requested vs effective route */
    if (m.requested && m.effectiveRoute) {
      insp.appendChild(block('Requested vs effective',
        h('div', { className: 'lg-diff' },
          h('div', { className: 'lg-diff-row' }, h('span', { className: 'lg-diff-key', text: 'Requested' }),
            h('span', { className: 'lg-diff-val', text: m.name })),
          h('div', { className: 'lg-diff-row' }, h('span', { className: 'lg-diff-key', text: 'Effective' }),
            h('span', { className: 'lg-diff-val', text: m.effectiveRoute })),
          h('p', { className: 'lg-diff-why', text: m.effectiveReason || 'Routing policy substitutes another route right now.' })
        )));
    }

    /* Controls: favorite, alias, priority, hide */
    var ctl = block('Controls');
    var rowBtns = h('div', { className: 'lg-insp-actions' });
    rowBtns.appendChild(h('button', {
      className: 'lg-btn', type: 'button', 'aria-pressed': m.fav ? 'true' : 'false',
      onClick: function () { m.fav = !m.fav; refreshManagerRowAndInspector(); }
    }, ico(m.fav ? 'starFill' : 'star'), m.fav ? 'Favorite' : 'Make favorite'));
    rowBtns.appendChild(h('button', {
      className: 'lg-btn', type: 'button', 'aria-pressed': m.hidden ? 'true' : 'false',
      onClick: function () { m.hidden = !m.hidden; refreshManagerRowAndInspector(); }
    }, ico(m.hidden ? 'eyeOff' : 'eye'), m.hidden ? 'Hidden from pickers' : 'Hide from pickers'));
    ctl.appendChild(rowBtns);
    ctl.appendChild(h('div', { className: 'lg-insp-block' }, h('h3', { text: 'Alias' }),
      h('input', {
        className: 'lg-input', type: 'text', value: m.alias || '',
        placeholder: 'Optional display alias',
        'aria-label': 'Alias for ' + m.name,
        onChange: function () { m.alias = this.value; refreshManagerRowAndInspector(); }
      })));
    var prioWrap = h('div', { className: 'lg-insp-block' }, h('h3', { text: 'Priority' }));
    var prio = h('select', { className: 'lg-select', 'aria-label': 'Priority for ' + m.name });
    var maxP = p ? Math.max(arr(p.models).length, m.priority || 1) : (m.priority || 1);
    for (var i = 1; i <= maxP; i++) {
      var opt = h('option', { value: String(i), text: 'Priority ' + i });
      if (m.priority === i) { opt.selected = true; }
      prio.appendChild(opt);
    }
    prio.addEventListener('change', function () {
      m.priority = parseInt(prio.value, 10);
      refreshManagerRowAndInspector();
    });
    prioWrap.appendChild(prio);
    ctl.appendChild(prioWrap);
    insp.appendChild(ctl);

    /* Performance: effort + Normal/Fast ONLY when the data says supported.
       The menu stays open through both choices. */
    var hasEffort = arr(m.effort).length > 0;
    var hasFast = m.fast === true;
    if (hasEffort || hasFast) {
      insp.appendChild(block('Performance', effortSpeedMenu(m, hasEffort, hasFast)));
    } else {
      insp.appendChild(block('Performance',
        h('p', { className: 'lg-insp-desc', text: 'This model runs at a single effort and speed, so no selector is shown.' })));
    }

    /* Capability evidence with source + timestamp */
    var ev = arr(m.evidence);
    if (ev.length > 0) {
      var table = h('table', { className: 'lg-evidence' },
        h('thead', null, h('tr', null,
          h('th', { text: 'Capability' }), h('th', { text: 'State' }), h('th', { text: 'Source' }), h('th', { text: 'When' }))),
        h('tbody', null, ev.map(function (e) {
          return h('tr', null,
            h('td', { text: MODALITY_LABELS[e.cap] || cap(str(e.cap).replace(/-/g, ' ')) }),
            h('td', { className: 'lg-ev-state', text: EVIDENCE_LABELS[e.state] || cap(str(e.state).replace(/-/g, ' ')) }),
            h('td', { className: 'lg-ev-src', text: e.source }),
            h('td', { className: 'lg-ev-at', text: fmtTime(e.at) }));
        })));
      insp.appendChild(block('Capability evidence', table));
    }

    insp.appendChild(block('Record', kv([
      ['Context window', typeof m.ctx === 'number' ? (Math.round(m.ctx / 1000) + 'k tokens') : m.ctx],
      ['Modalities', arr(m.modalities).map(function (x) { return MODALITY_LABELS[x] || cap(x); }).join(', ')],
      ['Tool support', cap(str(m.toolSupport)) || 'Unknown'],
      ['Catalog id', m.id, 'mono']
    ])));
  }

  function refreshManagerRowAndInspector() {
    if (ui.view.kind === 'manager') {
      var scroll = els.doc.scrollTop;
      renderDoc();
      els.doc.scrollTop = scroll;
    }
    renderInspector();
  }

  function effortSpeedMenu(m, hasEffort, hasFast) {
    var wrap = h('div', { className: 'lg-menu-wrap' });
    var summary = function () {
      var parts = [];
      if (hasEffort) { parts.push('Effort: ' + cap(m.effortChoice || 'medium')); }
      if (hasFast) { parts.push('Speed: ' + (m.speedChoice || 'Normal')); }
      return parts.join(' · ');
    };
    var btn = h('button', {
      className: 'lg-btn', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false'
    }, ico('bolt'), summary());
    var menu = h('div', { className: 'lg-menu', role: 'menu', hidden: true });

    function rebuildMenu() {
      menu.innerHTML = '';
      if (hasEffort) {
        menu.appendChild(h('div', { className: 'lg-menu-h', text: 'Effort' }));
        var eg = h('div', { role: 'group', 'aria-label': 'Effort' });
        arr(m.effort).forEach(function (lvl) {
          eg.appendChild(h('button', {
            className: 'lg-radio', type: 'button', role: 'menuitemradio',
            'aria-checked': (m.effortChoice || 'medium') === lvl ? 'true' : 'false',
            onClick: function () { m.effortChoice = lvl; rebuildMenu(); btn.childNodes[1].textContent = summary(); }
          }, h('span', { className: 'lg-radio-dot' }), h('span', { text: cap(lvl) })));
        });
        menu.appendChild(eg);
      }
      if (hasFast) {
        menu.appendChild(h('div', { className: 'lg-menu-h', text: 'Speed' }));
        var sg = h('div', { role: 'group', 'aria-label': 'Speed' });
        ['Normal', 'Fast'].forEach(function (sp) {
          sg.appendChild(h('button', {
            className: 'lg-radio', type: 'button', role: 'menuitemradio',
            'aria-checked': (m.speedChoice || 'Normal') === sp ? 'true' : 'false',
            onClick: function () { m.speedChoice = sp; rebuildMenu(); btn.childNodes[1].textContent = summary(); }
          }, h('span', { className: 'lg-radio-dot' }), h('span', { text: sp })));
        });
        menu.appendChild(sg);
      }
      menu.appendChild(h('button', {
        className: 'lg-btn lg-menu-done', type: 'button',
        onClick: function () { closeMenu(); }
      }, 'Done'));
    }

    function openMenu() {
      rebuildMenu();
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      var first = menu.querySelector('[role="menuitemradio"]');
      if (first) { first.focus(); }
      document.addEventListener('mousedown', onOutside, true);
    }
    function closeMenu() {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('mousedown', onOutside, true);
      btn.focus();
    }
    function onOutside(e) {
      if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        menu.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('mousedown', onOutside, true);
      }
    }
    btn.addEventListener('click', function () { if (menu.hidden) { openMenu(); } else { closeMenu(); } });
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeMenu(); }
    });
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    wrap.appendChild(h('p', { className: 'lg-note-line', text: 'Pick effort and speed in one visit — the menu stays open until Done.' }));
    return wrap;
  }

  /* --------------------------------------------- free route inspector - */

  function inspectFreeRoute(sel) {
    var fr = arr(D().freeRoutes).filter(function (x) { return x.id === sel.id; })[0];
    if (!fr) { renderInspectorSummary(); return; }
    var hit = modelByRef(fr.modelRef);
    var under = providerById(fr.underlyingProviderId);
    var insp = els.insp;
    appendChild(insp, inspHeader('Free route record', hit ? hit.model.name : fr.modelRef));
    insp.appendChild(h('p', null, chipEl(fr.qualifier === 'temporarily-unavailable' ? 'unavailable' : 'custom',
      QUALIFIER_LABELS[fr.qualifier] || 'Qualified route')));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: QUALIFIER_EXPLAIN[fr.qualifier] || '' }));
    insp.appendChild(block('Route', kv([
      ['Underlying connection', under ? under.name : fr.underlyingProviderId],
      ['Model reference', fr.modelRef, 'mono']
    ])));

    /* Stepped, PM-owned setup surface:
       data steps (account → credential → scopes) then verify → quota → return. */
    var steps = arr(fr.setupSteps).map(function (st) { return { title: st.title, body: st.body }; });
    steps.push({ title: 'Verify the connection', body: 'Puppet Master runs a safe readiness check against the route and reports the honest result.', verify: true });
    steps.push({ title: 'Quota caveats', body: QUALIFIER_EXPLAIN[fr.qualifier] || 'Free routes carry limits; PM reports them honestly rather than hiding them.', quota: true });
    var doneKey = 'fr.' + fr.id;
    var doneCount = parseInt(store.get(doneKey), 10);
    if (isNaN(doneCount)) { doneCount = 0; }
    var stepsEl = h('div', { className: 'lg-steps' });
    steps.forEach(function (st, i) {
      var stateCls = i < doneCount ? ' is-done' : (i === doneCount ? ' is-current' : '');
      var num = h('span', { className: 'lg-step-num' });
      if (i < doneCount) { num.appendChild(ico('check')); } else { num.textContent = String(i + 1); }
      var stepEl = h('div', { className: 'lg-step' + stateCls },
        num,
        h('div', { className: 'lg-step-main' },
          h('div', { className: 'lg-step-title', text: st.title }),
          h('p', { className: 'lg-step-body', text: st.body }),
          (i === doneCount) ? h('div', { className: 'lg-step-actions' },
            h('button', {
              className: 'lg-btn is-primary', type: 'button',
              onClick: function () {
                store.set(doneKey, String(doneCount + 1));
                window.PMState.receipt(st.verify ? 'Verify connection' : 'Setup step',
                  st.verify ? 'The readiness check passed in this simulation.' : '"' + st.title + '" recorded as done (simulated).');
                renderInspector();
              }
            }, st.verify ? 'Run the check (simulated)' : 'Mark done (simulated)')
          ) : null
        ));
      stepsEl.appendChild(stepEl);
    });
    var setupBlock = block('Setup (' + Math.min(doneCount, steps.length) + ' of ' + steps.length + ' complete)', stepsEl);
    if (doneCount >= steps.length) {
      setupBlock.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn is-primary', type: 'button',
          onClick: function () {
            var target = hit ? { kind: 'model', id: hit.model.id, providerId: hit.provider.id } : null;
            if (target) {
              revealManagerRecord('providers', sectionForProvider(hit.provider), target);
            } else { openManager('providers'); }
          }
        }, ico('arrowL'), 'Return to the model row'),
        h('button', {
          className: 'lg-btn is-quiet', type: 'button',
          onClick: function () { store.set(doneKey, '0'); renderInspector(); }
        }, 'Reset the walkthrough')));
    }
    insp.appendChild(setupBlock);
  }

  /* ---------------------------------------------------- role inspector  */

  function inspectRole(sel) {
    var r = arr(D().roles).filter(function (x) { return x.id === sel.id; })[0];
    if (!r) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Role record', r.label));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: r.note || '' }));
    insp.appendChild(block('Assignment', kv([
      ['Route', r.assignedRoute, 'mono'],
      ['Quality tier', r.quality === 'high' ? 'High' : 'Standard']
    ])));
    if (r.lockedHigh) {
      insp.appendChild(block('Locked',
        h('div', { className: 'lg-managed-note' }, ico('lock'),
          h('span', null, 'Locked to the high-quality route. Puppet Master never silently downgrades this conversation because usage is low; changing it requires an explicit, qualified override.')),
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () {
              window.PMState.receipt('Request qualified override',
                'The override dialog explains the quality consequences before any change in the finished product.');
            }
          }, ico('scales'), 'Request qualified override'))));
    } else {
      var routes = [];
      arr(D().providers).forEach(function (p) {
        arr(p.models).forEach(function (m) {
          if (!m.hidden && !m.unavailableReason) { routes.push(m.name + ' - ' + p.name); }
        });
      });
      var selEl = h('select', { className: 'lg-select', 'aria-label': 'Route for ' + r.label });
      routes.forEach(function (rt) {
        var opt = h('option', { value: rt, text: rt });
        if (r.assignedRoute.indexOf(rt.split(' - ')[0]) === 0) { opt.selected = true; }
        selEl.appendChild(opt);
      });
      selEl.addEventListener('change', function () {
        r.assignedRoute = selEl.value;
        window.PMState.receipt('Reassign role', r.label + ' now routes to ' + selEl.value + ' for future simulated requests.');
        refreshManagerRowAndInspector();
      });
      insp.appendChild(block('Change route', selEl,
        h('p', { className: 'lg-note-line', text: 'Applies to future requests; running work is not moved.' })));
    }
  }

  /* ----------------------------------------------- context inspectors - */

  function inspectCtxAdmitted(sel) {
    var cs = D().contextSources || {};
    var a = ((cs.lastTurn && arr(cs.lastTurn.admitted)) || [])[parseInt(sel.id, 10)];
    if (!a) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Context record · Admitted last turn', a.source));
    insp.appendChild(block('Why it was admitted', kv([
      ['Reason', a.why],
      ['Cost', fmtCtx(a.tokens)]
    ])));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'This is an observation record: it explains a per-turn decision and is not directly editable. Adjust the context controls to influence future turns.' }));
  }

  function inspectCtxOmitted(sel) {
    var cs = D().contextSources || {};
    var o = ((cs.lastTurn && arr(cs.lastTurn.omitted)) || [])[parseInt(sel.id, 10)];
    if (!o) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Context record · Omitted last turn', o.source));
    insp.appendChild(block('Why it was left out', kv([['Reason', o.why]])));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Omission is per turn, never deletion. The source stays stored and can be admitted on demand.' }));
  }

  function inspectCtxAgents(sel) {
    var cs = D().contextSources || {};
    var a = arr(cs.agentsChain)[parseInt(sel.id, 10)];
    if (!a) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Instruction file record', a.path.split('/').pop() || a.path));
    insp.appendChild(block('Chain position', kv([
      ['Path', a.path, 'mono'],
      ['Precedence', String(a.precedence)]
    ]),
      h('p', { className: 'lg-note-line', text: 'Files apply in order; when two conflict, the higher precedence number — the more specific file — wins.' })));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () {
          window.PMState.receipt('Open in editor', 'The file opens in the code editor in the finished product.');
        }
      }, ico('doc'), 'Open in editor')));
  }

  function inspectCtxDraft(sel) {
    void sel;
    var insp = els.insp;
    appendChild(insp, inspHeader('Draft record · This conversation', 'Thread instructions draft'));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: 'Applies to this conversation only. Spellcheck runs here; code spans, paths, and known names are skip regions and stay untouched.' }));

    /* Spell-checked prose field #2, seeded to demonstrate skip regions. */
    var draftKey = 'ctx.draft';
    var prose = h('div', {
      className: 'lg-prose', contenteditable: 'true', role: 'textbox',
      'aria-multiline': 'true', 'aria-label': 'Thread instructions draft'
    });
    var saved = store.get(draftKey);
    if (typeof saved === 'string' && saved) {
      prose.textContent = saved;
    } else {
      prose.innerHTML = 'Definately keep generated shards seperate from hand edits. Run ' +
        '<code>pm-shard-plans.py --check</code> before comitting, and never touch ' +
        'Plans/_shards/ or PMSTATE tokens by hand. Ask Claude to recieve the diff first.';
    }
    prose.addEventListener('blur', function () { store.set(draftKey, prose.textContent || ''); });
    insp.appendChild(block('Draft', prose,
      h('p', { className: 'lg-prose-hint', text: 'Underlined words offer suggestions on right-click or Cmd+period. The code span, the path, and the all-caps token are skipped by design.' })));
    attachSpell(prose);
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () {
          store.set('ctx.draft', prose.textContent || '');
          window.PMState.receipt('Save thread instructions', 'The draft would attach to this conversation in the finished product.');
        }
      }, ico('check'), 'Save draft')));
  }

  /* -------------------------------------------------- tools inspectors  */

  function inspectTool(sel) {
    var t = arr(D().tools).filter(function (x) { return x.id === sel.id; })[0];
    if (!t) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Tool record', t.name));
    var stages = [
      ['Installed', t.installed],
      ['Enabled for this project', t.projectEnabled],
      ['Available right now', t.available],
      ['Selected this turn', t.selectedThisTurn],
      ['Invoked recently', t.invokedRecently]
    ];
    var list = h('div', { className: 'lg-chain' });
    stages.forEach(function (st) {
      list.appendChild(h('div', { className: 'lg-chain-layer' + (st[1] ? ' is-active' : '') },
        h('span', { className: 'lg-chain-name', style: 'width:14ch', text: st[0] }),
        h('span', { className: 'lg-chain-note', text: st[1] ? 'Yes' : 'No' })
      ));
    });
    insp.appendChild(block('Funnel position', list));
    insp.appendChild(block('Policy', kv([
      ['Risk', RISK_LABELS[t.risk] || 'Unknown'],
      ['Approval', t.approval]
    ])));
    insp.appendChild(block('Controls',
      h('button', {
        className: 'lg-toggle', type: 'button', role: 'switch',
        'aria-checked': t.projectEnabled ? 'true' : 'false',
        onClick: function () {
          t.projectEnabled = !t.projectEnabled;
          if (!t.projectEnabled) { t.available = false; t.selectedThisTurn = false; }
          window.PMState.receipt(t.projectEnabled ? 'Enable tool for project' : 'Disable tool for project',
            t.name + (t.projectEnabled ? ' can be selected on future turns.' : ' will no longer be offered to agents in this project.'));
          refreshManagerRowAndInspector();
        }
      },
        h('span', { className: 'lg-toggle-track' }, h('span', { className: 'lg-toggle-knob' })),
        h('span', { className: 'lg-toggle-word', text: t.projectEnabled ? 'Enabled for this project' : 'Disabled for this project' })
      )));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () {
          window.PMState.receipt('View invocation log', 'The per-tool invocation log opens as a diagnostic surface in the finished product.');
        }
      }, ico('history'), 'View invocation log')));
  }

  function inspectSkill(sel) {
    var sk = arr(D().skills).filter(function (x) { return x.id === sel.id; })[0];
    if (!sk) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Skill record', sk.name));
    insp.appendChild(block('Provenance', kv([
      ['Source', sk.source],
      ['Permissions', sk.permissions],
      ['Scope', sk.scope === 'global' ? 'All projects' : 'This project']
    ])));
    if (!sk.trusted) {
      insp.appendChild(block('Trust',
        h('div', { className: 'lg-caution' },
          h('div', { className: 'lg-caution-head' }, ico('warning'), 'Not trusted yet'),
          h('p', { text: 'This skill requests: ' + sk.permissions + '. It stays disabled until you trust it explicitly.' }),
          h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () {
              sk.trusted = true;
              sk.enabled = true;
              window.PMState.receipt('Trust skill', sk.name + ' is trusted and enabled for this scope (simulated).');
              refreshManagerRowAndInspector();
            }
          }, ico('shield'), 'Trust and enable'))));
    } else {
      insp.appendChild(block('Controls',
        h('button', {
          className: 'lg-toggle', type: 'button', role: 'switch',
          'aria-checked': sk.enabled ? 'true' : 'false',
          onClick: function () {
            sk.enabled = !sk.enabled;
            refreshManagerRowAndInspector();
          }
        },
          h('span', { className: 'lg-toggle-track' }, h('span', { className: 'lg-toggle-knob' })),
          h('span', { className: 'lg-toggle-word', text: sk.enabled ? 'Enabled' : 'Disabled' })
        )));
    }
  }

  function inspectPlugin(sel) {
    var pl = arr(D().plugins).filter(function (x) { return x.id === sel.id; })[0];
    if (!pl) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Plugin record', pl.name));
    if (pl.failed) {
      insp.appendChild(block('Failure',
        h('div', { className: 'lg-caution' },
          h('div', { className: 'lg-caution-head' }, ico('warning'), 'Failed to load'),
          h('p', { text: pl.failed }))));
    }
    insp.appendChild(block('Lifecycle', kv([
      ['State', LIFECYCLE_LABELS[pl.lifecycle] || cap(pl.lifecycle)],
      ['Compatibility', pl.compat],
      ['Channel', pl.channel === 'canary' ? 'Canary (early builds)' : 'Stable'],
      ['Permissions', pl.permissions]
    ])));
    var actions = h('div', { className: 'lg-insp-actions' });
    if (pl.lifecycle === 'update-available') {
      actions.appendChild(h('button', {
        className: 'lg-btn is-primary', type: 'button',
        onClick: function () {
          window.PMState.receipt('Update plugin', pl.name + ' would update to the listed compatible version. Nothing was installed.');
        }
      }, ico('download'), 'Update'));
    }
    if (pl.lifecycle === 'failed') {
      actions.appendChild(h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () {
          window.PMState.receipt('Retry plugin load', pl.name + ' would be loaded once more with crash protection. Simulated.');
        }
      }, ico('refresh'), 'Retry load'));
    }
    actions.appendChild(h('button', {
      className: 'lg-btn is-quiet', type: 'button',
      onClick: function () {
        pl.lifecycle = pl.lifecycle === 'disabled' ? 'active' : 'disabled';
        window.PMState.receipt(pl.lifecycle === 'disabled' ? 'Disable plugin' : 'Enable plugin',
          pl.name + (pl.lifecycle === 'disabled' ? ' will not load next start.' : ' loads again next start.'));
        refreshManagerRowAndInspector();
      }
    }, pl.lifecycle === 'disabled' ? 'Enable' : 'Disable'));
    insp.appendChild(actions);
  }

  /* --------------------------------------------- commands inspectors -- */

  function inspectShortcut(sel) {
    var cd = commandsData();
    var sc = null, idx = -1;
    cd.shortcuts.forEach(function (x, i) {
      if (x && shortcutLabel(x, i) === sel.id) { sc = x; idx = i; }
    });
    if (!sc) { renderInspectorSummary(); return; }
    var cmd = shortcutLabel(sc, idx);
    var over = str(ui.cmdOverrides[cmd]);
    var insp = els.insp;
    appendChild(insp, inspHeader('Shortcut record · Commands & Shortcuts', cmd));
    insp.appendChild(block('Binding', kv([
      ['Keys', over || str(sc.keys) || 'Not bound', 'mono'],
      over ? ['Default keys', str(sc.keys), 'mono'] : null,
      ['Scope', str(sc.scope) || 'Global'],
      ['Source', over ? 'Remapped this session' : 'Built-in default']
    ])));

    var conf = conflictFor(sc);
    if (conf) {
      var other = arr(conf.between).filter(function (x) { return x !== str(sc.command); })[0];
      var res = str(conf.resolution) || 'Resolved automatically';
      insp.appendChild(block('Conflict',
        h('div', { className: 'lg-unavail-note' }, ico('warning'),
          h('span', null,
            (other ? 'The same keys are also bound to "' + other + '". ' : '') +
            res + (/[.!?]$/.test(res) ? '' : '.')))));
    }

    /* Remap: capture the next combination; Escape cancels. Session-only. */
    var remapBtn = h('button', { className: 'lg-btn', type: 'button' }, ico('edit'), 'Remap');
    function stopCapture() {
      document.removeEventListener('keydown', onCapture, true);
      if (remapBtn.childNodes[1]) { remapBtn.childNodes[1].textContent = 'Remap'; }
      cmdCaptureStop = null;
    }
    function onCapture(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); stopCapture(); return; }
      var combo = comboFromEvent(e);
      if (!combo) { return; }
      e.preventDefault();
      e.stopPropagation();
      stopCapture();
      ui.cmdOverrides[cmd] = combo;
      window.PMState.receipt('Remap shortcut', '"' + cmd + '" now responds to ' + combo + ' for this session. Saved keymaps persist and sync in the finished product.');
      refreshManagerRowAndInspector();
    }
    remapBtn.addEventListener('click', function () {
      if (cmdCaptureStop) { stopCapture(); return; }
      if (remapBtn.childNodes[1]) { remapBtn.childNodes[1].textContent = 'Press the new keys (Esc cancels)'; }
      document.addEventListener('keydown', onCapture, true);
      cmdCaptureStop = stopCapture;
    });
    insp.appendChild(block('Remap',
      h('div', { className: 'lg-insp-actions' },
        remapBtn,
        h('button', {
          className: 'lg-btn', type: 'button', disabled: !over,
          onClick: function () {
            delete ui.cmdOverrides[cmd];
            window.PMState.receipt('Reset shortcut', '"' + cmd + '" follows its built-in default keys again.');
            refreshManagerRowAndInspector();
          }
        }, ico('history'), 'Reset to default')),
      h('p', { className: 'lg-note-line', text: 'Remapping applies to this session only in the demo. Conflicting captures are flagged before they take effect in the finished product.' })));
  }

  function inspectCustomCmd(sel) {
    var cd = commandsData();
    var cc = null;
    cd.custom.forEach(function (x, i) {
      if (x && (str(x.name) || 'Custom command ' + (i + 1)) === sel.id) { cc = x; }
    });
    if (!cc) { renderInspectorSummary(); return; }
    var name = str(cc.name) || sel.id;
    var off = !!ui.cmdDisabled[name];
    var insp = els.insp;
    appendChild(insp, inspHeader('Custom command record · Commands & Shortcuts', name));
    insp.appendChild(block('Record', kv([
      ['Runs', str(cc.runs) || 'Nothing recorded', 'mono'],
      ['Scope', str(cc.scope) || 'Project'],
      ['State', off ? 'Disabled' : 'Enabled']
    ])));
    insp.appendChild(block('Controls',
      h('button', {
        className: 'lg-toggle', type: 'button', role: 'switch',
        'aria-checked': off ? 'false' : 'true',
        onClick: function () {
          ui.cmdDisabled[name] = !ui.cmdDisabled[name];
          window.PMState.receipt(ui.cmdDisabled[name] ? 'Disable custom command' : 'Enable custom command',
            name + (ui.cmdDisabled[name] ? ' no longer runs until you enable it again.' : ' is available again.'));
          refreshManagerRowAndInspector();
        }
      },
        h('span', { className: 'lg-toggle-track' }, h('span', { className: 'lg-toggle-knob' })),
        h('span', { className: 'lg-toggle-word', text: off ? 'Disabled' : 'Enabled' })
      )));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () {
          window.PMState.receipt('Edit custom command', 'The command editor opens with "' + name + '" loaded in the finished product.');
        }
      }, ico('edit'), 'Edit'),
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () {
          window.PMState.receipt('Remove custom command', 'Removal asks for confirmation and keeps an undo window in the finished product. Nothing was removed.');
        }
      }, ico('trash'), 'Remove')));
  }

  /* ============================================ query filter (dim) ===== */

  function anyChipActive() {
    return ui.chips.managed || ui.chips.differs || ui.chips.unavailable || ui.chips.attention;
  }

  function chipsPass(s, rs) {
    if (!anyChipActive()) { return true; }
    if (ui.chips.managed && rs.valueKind === 'managed') { return true; }
    if (ui.chips.differs && rs.chips.some(function (c) { return c.kind === 'differs'; })) { return true; }
    if (ui.chips.unavailable && rs.exposure === 'unavailable') { return true; }
    if (ui.chips.attention && rs.statusTone === 'attention') { return true; }
    return false;
  }

  function chipsPassStates(statesAttr) {
    if (!anyChipActive()) { return true; }
    var states = str(statesAttr).split(' ');
    if (ui.chips.attention && states.indexOf('attention') >= 0) { return true; }
    if (ui.chips.unavailable && states.indexOf('unavailable') >= 0) { return true; }
    if (ui.chips.differs && states.indexOf('differs') >= 0) { return true; }
    return false;
  }

  /* Dim, never reflow: filtering while reading cannot shift scroll offsets. */
  function updateFilter() {
    var q = ui.query.trim();
    var qLower = q.toLowerCase();
    if (els.clear) { els.clear.hidden = q.length === 0; }

    var results = q ? window.PMState.search(ui.query, D()) : [];
    var settingHits = {};
    var domainHits = {};
    var managerHits = {};
    results.forEach(function (r) {
      if (r.kind === 'setting') { settingHits[r.id] = true; }
      if (r.domainId) { domainHits[r.domainId] = true; }
      if (r.kind === 'manager') { managerHits[r.id.replace('manager.', '')] = true; }
    });

    /* document rows */
    var rows = els.doc.querySelectorAll('.lg-row[data-sid], .lg-row[data-mlabel]');
    for (var i = 0; i < rows.length; i++) { applyFilterToRow(rows[i], qLower, settingHits); }

    /* navigator dimming */
    var domItems = els.tree.querySelectorAll('.lg-tree-item[data-domain]');
    for (var d = 0; d < domItems.length; d++) {
      domItems[d].classList.toggle('is-dim', !!q && !domainHits[domItems[d].dataset.domain]);
    }
    var mgrItems = els.tree.querySelectorAll('.lg-tree-item[data-manager]');
    for (var g = 0; g < mgrItems.length; g++) {
      var mid = mgrItems[g].dataset.manager;
      var hit = !q || !!managerHits[mid] ||
        (mid === 'providers' && (managerHits.roles || managerHits.freeRoutes)) ||
        (mid === 'context' && managerHits.contextSources) ||
        (mid === 'tools' && (managerHits.skills || managerHits.plugins || managerHits.tools));
      mgrItems[g].classList.toggle('is-dim', !!q && !hit);
    }
    var subItems = els.tree.querySelectorAll('.lg-tree-sub[data-subid]');
    for (var sN = 0; sN < subItems.length; sN++) {
      var subId = subItems[sN].dataset.subid;
      var dim = false;
      if (q && ui.view.kind === 'domain') {
        var dom = domainById(ui.view.id);
        var sub = null;
        if (dom) { arr(dom.subs).forEach(function (sb) { if (sb.id === subId) { sub = sb; } }); }
        dim = !sub || !arr(sub.settingIds).some(function (sid) {
          var st = settings()[sid];
          return st && (settingHits[sid] || str(st.label).toLowerCase().indexOf(qLower) >= 0);
        });
      }
      subItems[sN].classList.toggle('is-dim', dim);
    }

    renderElsewhere(results);
    if (ui.view.kind === 'home') { renderHomeTableBody(); }
  }

  function applyFilterToRow(rowEl, qLower, settingHits) {
    if (qLower === undefined) {
      qLower = ui.query.trim().toLowerCase();
      settingHits = null;
      if (qLower) {
        settingHits = {};
        window.PMState.search(ui.query, D()).forEach(function (r) {
          if (r.kind === 'setting') { settingHits[r.id] = true; }
        });
      }
    }
    var dim = false;
    var sid = rowEl.dataset.sid;
    if (sid) {
      var s = settings()[sid];
      if (s) {
        var rs = window.PMState.resolveRowState(s);
        var qOk = !qLower || (settingHits && settingHits[sid]) || str(s.label).toLowerCase().indexOf(qLower) >= 0;
        dim = !(qOk && chipsPass(s, rs));
      }
    } else {
      var label = str(rowEl.dataset.mlabel);
      var qOk2 = !qLower || label.indexOf(qLower) >= 0;
      dim = !(qOk2 && chipsPassStates(rowEl.dataset.states));
    }
    rowEl.classList.toggle('is-dim', dim);
  }

  function renderElsewhere(results) {
    var panel = els.elsewhere;
    var list = els.elsewhereList;
    if (!panel || !list) { return; }
    var q = ui.query.trim();
    if (!q) { panel.hidden = true; list.innerHTML = ''; return; }

    var out = [];
    results.forEach(function (r) {
      if (out.length >= 8) { return; }
      if (r.kind === 'setting') {
        var loc = locate(r.id);
        var visible = ui.view.kind === 'domain' && loc && loc.domainId === ui.view.id;
        if (ui.view.kind === 'home') { visible = true; } /* table already shows it */
        if (!visible) { out.push(r); }
      } else {
        out.push(r);
      }
    });
    list.innerHTML = '';
    if (out.length === 0) { panel.hidden = true; return; }
    panel.hidden = false;
    var KIND_MARKS = { setting: 'set', manager: 'mgr', action: 'act' };
    out.forEach(function (r) {
      var expLabel = '';
      if (r.kind === 'setting' && r.exposure && r.exposure !== 'standard') {
        expLabel = { advanced: 'Advanced', expert: 'Expert', managed: 'Managed', diagnostic: 'Diagnostic', unavailable: 'Unavailable' }[r.exposure] || '';
      }
      list.appendChild(h('button', {
        className: 'lg-else-item', type: 'button', role: 'listitem',
        onClick: function () { activateResult(r); }
      },
        h('span', { className: 'lg-else-kind', text: KIND_MARKS[r.kind] || r.kind }),
        h('span', { className: 'lg-else-label', text: r.label }),
        expLabel ? h('span', { className: 'lg-else-exp', text: expLabel }) : null
      ));
    });
  }

  function activateResult(r) {
    if (r.kind === 'setting') { revealSetting(r.id); return; }
    if (r.kind === 'manager') { routeManager(r.id.replace('manager.', ''), r.label); return; }
    /* action results come from notices */
    var n = arr(D().notices).filter(function (x) { return x.id === r.id; })[0];
    if (n && n.primary) { runAct(n.primary.act, n.target); return; }
    if (r.domainId) { openDomain(r.domainId); }
  }

  /* ================================================== statusbar ======== */

  function updateStatusbar() {
    var right = $('pmStatusRight');
    var label;
    if (ui.view.kind === 'home') { label = 'Home ledger'; }
    else if (ui.view.kind === 'domain') {
      var dom = domainById(ui.view.id);
      label = dom ? dom.title : 'Domain';
    } else {
      var m = managerById(ui.view.id);
      label = m ? m.label : 'Manager';
    }
    PMShellStatus('Settings · ' + label);
    if (right) {
      var scn = str(store.get('scenario')) || 'baseline';
      right.textContent = Object.keys(settings()).length + ' records · scenario: ' + scn.replace(/-/g, ' ');
    }
  }

  /* ==================================================== render all ===== */

  function renderAll() {
    renderNav();
    renderDoc();
    renderInspector();
    updateStatusbar();
  }

  /* ==================================================== wiring ========= */

  function wire() {
    els.query.addEventListener('input', function () {
      ui.query = els.query.value;
      updateFilter();
    });
    els.query.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && els.query.value) {
        e.stopPropagation();
        els.query.value = '';
        ui.query = '';
        updateFilter();
      }
      if (e.key === 'Enter') {
        var first = els.elsewhereList.querySelector('.lg-else-item');
        if (first) { first.click(); }
      }
    });
    els.clear.addEventListener('click', function () {
      els.query.value = '';
      ui.query = '';
      updateFilter();
      els.query.focus();
    });

    ['Managed', 'Differs', 'Unavailable', 'Attention'].forEach(function (name) {
      var btn = $('lgChip' + name);
      if (!btn) { return; }
      btn.addEventListener('click', function () {
        var key = btn.dataset.chip;
        ui.chips[key] = !ui.chips[key];
        btn.setAttribute('aria-pressed', ui.chips[key] ? 'true' : 'false');
        updateFilter();
      });
    });

    if (els.navBtn) {
      els.navBtn.hidden = false; /* CSS hides it outside narrow mode */
      els.navBtn.addEventListener('click', function () {
        ui.navOpen = !ui.navOpen;
        els.root.classList.toggle('nav-open', ui.navOpen);
        els.navBtn.setAttribute('aria-expanded', ui.navOpen ? 'true' : 'false');
        if (ui.navOpen) {
          var first = els.tree.querySelector('button');
          if (first) { first.focus(); }
        }
      });
    }
    if (els.scrim) {
      els.scrim.addEventListener('mousedown', function () {
        ui.navOpen = false;
        els.root.classList.remove('nav-open');
        if (els.navBtn) { els.navBtn.setAttribute('aria-expanded', 'false'); }
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') { return; }
      if (ui.navOpen) {
        ui.navOpen = false;
        els.root.classList.remove('nav-open');
        if (els.navBtn) { els.navBtn.setAttribute('aria-expanded', 'false'); els.navBtn.focus(); }
        return;
      }
      if (ui.selected && isNarrow()) { deselect(); }
    });

    store.on('scenario', function () {
      buildIndex();
      ui.selected = null;
      ui.homeRows = 40;
      renderAll();
    });
    store.on('receipt', function (r) {
      try { window.PMShell.toast(r.message); } catch (e) { /* ignore */ }
    });
    store.on('provider', function () { onLiveDataChange(); });
    store.on('catalog', function () { onLiveDataChange(); });
  }

  function onLiveDataChange() {
    if (ui.view.kind === 'manager' && ui.view.id === 'providers') {
      var scroll = els.doc.scrollTop;
      renderDoc();
      els.doc.scrollTop = scroll;
    }
    if (ui.selected && (ui.selected.kind === 'provider' || ui.selected.kind === 'model')) {
      renderInspector();
    }
    if (ui.view.kind === 'home') {
      /* provider status feeds notices/destination summaries indirectly;
         a light statusbar update is enough for the demo */
      updateStatusbar();
    }
  }

  /* CSS keeps .lg-navbtn hidden outside narrow mode. */
  var navBtnStyle = document.createElement('style');
  navBtnStyle.textContent = '.pm-shell:not(.is-narrow) .lg-navbtn{display:none}';
  document.head.appendChild(navBtnStyle);

  /* ==================================================== boot =========== */

  window.PMShell.init({
    concept: 'c4-ledger',
    store: store,
    /* Three fixed columns need more room than the shared 900px default:
       collapse to drawer + bottom-sheet inspector while the middle document
       still has comfortable width. */
    narrowAt: 1120,
    onWidthChange: function () {
      /* narrow class is applied by the shell; inspector/nav CSS reacts.
         Keep the drawer closed state coherent when leaving narrow mode. */
      if (!isNarrow() && ui.navOpen) {
        ui.navOpen = false;
        els.root.classList.remove('nav-open');
        if (els.navBtn) { els.navBtn.setAttribute('aria-expanded', 'false'); }
      }
    }
  });
  window.PMState.mountStatesDrawer(store);

  buildIndex();
  wire();
  renderAll();
})();
