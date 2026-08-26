/* Puppet Master Settings Concept 12 — shared interactive prototype.
   One semantic inventory, two spatial presentations. No network calls and no
   production-side effects: all setup, test, upload, and repair actions are
   deterministic concept simulations. */
(function () {
  'use strict';

  var DATA = window.PM_SETTINGS_V3_DATA || {};
  var INVENTORY = window.PM2_INVENTORY || { categories: [], settings: [] };
  var root = null;
  var variant = 'fable';
  var previousRouteKey = '';
  var audioContext = null;
  var toastTimer = null;
  var menuEl = null;
  var modalEl = null;
  var searchEl = null;
  var scrollCleanup = null;
  var returnBodyOnly = false;
  var bodyWorkspaceId = null;
  var bodyWorkspace = null;
  var domainSectionMap = {};

  var state = {
    home: false,
    domain: 'general',
    workspace: 'ordinary',
    selectedManager: null,
    selectedProvider: 'claude-code',
    providerTab: 'overview',
    selectedFreeRoute: 'hf',
    selectedSound: 'pm-soft-chime',
    detailsSetting: null,
    showAllDetails: false,
    expandedSections: {},
    values: {},
    highlightedSetting: null,
    activeSection: null,
    color: 'dark',
    reducedMotion: false,
    testing: {},
    routeOrders: {},
    checks: {},
    soundPlaying: null
  };

  var icons = {
    sparkles:'<path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1L6.5 8.5l4.1-1.4z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    brain:'<path d="M9.5 5.5A3.5 3.5 0 0 0 6 9v1a3 3 0 0 0-1 5.8A3.5 3.5 0 0 0 8.5 20H10V4H9.5z"/><path d="M14.5 5.5A3.5 3.5 0 0 1 18 9v1a3 3 0 0 1 1 5.8 3.5 3.5 0 0 1-3.5 4.2H14V4h.5z"/><path d="M7 11h3M14 9h3M14 15h3"/>',
    terminal:'<path d="m5 7 4 4-4 4M11 17h8"/><rect x="3" y="4" width="18" height="16" rx="2"/>',
    memory:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m12 0h4M2 15h4m12 0h4"/>',
    branch:'<circle cx="6" cy="5" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="8" cy="19" r="2"/><path d="M6 7v4a4 4 0 0 0 4 4h2a6 6 0 0 0 6-6M8 17v-6"/>',
    folder:'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    shield:'<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-5"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.2L10 21h4l.5-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5A7 7 0 0 0 19 12z"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
    palette:'<path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6H12a1.5 1.5 0 0 1 0-3h1.8A7.2 7.2 0 0 0 21 7.2 4.2 4.2 0 0 0 16.8 3z"/><circle cx="7.5" cy="10" r="1"/><circle cx="9" cy="6.5" r="1"/><circle cx="14" cy="6.5" r="1"/>',
    bell:'<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    volume:'<path d="M5 10h3l4-4v12l-4-4H5z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    window:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8h18M7 6h.01M10 6h.01"/>',
    spell:'<path d="M5 18 11 4h2l6 14M8 12h8"/><path d="m16 19 2 2 4-5"/>',
    book:'<path d="M4 5a3 3 0 0 1 3-2h5v16H7a3 3 0 0 0-3 2z"/><path d="M20 5a3 3 0 0 0-3-2h-5v16h5a3 3 0 0 1 3 2z"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    eye:'<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    gauge:'<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 13 4-4M7 17h10"/>',
    file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    code:'<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
    wand:'<path d="m4 20 11-11M13 5l1-2 1 2 2 1-2 1-1 2-1-2-2-1zM18 12l.8-1.5.7 1.5 1.5.7-1.5.8-.7 1.5-.8-1.5-1.5-.8z"/>',
    command:'<path d="M9 6a3 3 0 1 0-3 3h3zM15 6a3 3 0 1 1 3 3h-3zM9 15H6a3 3 0 1 0 3 3zM15 15h3a3 3 0 1 1-3 3zM9 9h6v6H9z"/>',
    server:'<rect x="4" y="3" width="16" height="7" rx="2"/><rect x="4" y="14" width="16" height="7" rx="2"/><path d="M8 6h.01M8 17h.01M12 6h4M12 17h4"/>',
    puzzle:'<path d="M8 3h5v4a2 2 0 1 0 4 0V3h4v7h-4a2 2 0 1 0 0 4h4v7h-7v-4a2 2 0 1 0-4 0v4H3v-7h4a2 2 0 1 0 0-4H3V3z"/>',
    tool:'<path d="M14.5 6.5a4 4 0 0 0-5.6 4.7L4 16.1V20h3.9l4.9-4.9a4 4 0 0 0 4.7-5.6L14 13l-3-3z"/>',
    flask:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 16h9"/>',
    database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    archive:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M3 5h18V2H3zM9 10h6"/>',
    cycle:'<path d="M20 7h-5V2M4 17h5v5"/><path d="M18.4 17A8 8 0 0 1 5 7l2-2M5.6 7A8 8 0 0 1 19 17l-2 2"/>',
    history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    box:'<path d="m4 7 8-4 8 4-8 4z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/>',
    bolt:'<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.3 3 14.7 0 18M12 3c-3 3.3-3 14.7 0 18"/>',
    broom:'<path d="m14 4 6 6M13 5l2-2 6 6-2 2zM4 20c5 0 9-2 12-7l-5-5C6 11 4 15 4 20z"/>',
    film:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 19h16"/>',
    link:'<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/>',
    route:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h2a4 4 0 0 0 4-4v-4a4 4 0 0 1 4-4"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>',
    chevronDown:'<path d="m6 9 6 6 6-6"/>',
    arrowLeft:'<path d="m15 18-6-6 6-6"/>',
    arrowRight:'<path d="m9 18 6-6-6-6"/>',
    arrowUp:'<path d="m6 15 6-6 6 6"/>',
    arrowDown:'<path d="m6 9 6 6 6-6"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    play:'<path d="m8 5 11 7-11 7z"/>',
    test:'<path d="m8 3 8 9-8 9z"/>',
    refresh:'<path d="M20 11a8 8 0 1 0 1 4M20 4v7h-7"/>',
    sliders:'<path d="M4 6h8M16 6h4M4 12h3M11 12h9M4 18h10M18 18h2"/><circle cx="14" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
    moon:'<path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="2"/><path d="m3 17 5-5 4 4 3-3 6 6"/>',
    mic:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
    wave:'<path d="M3 12h2l2-6 3 12 3-9 2 4 2-7 2 6h2"/>'
  };

  function icon(name, cls) {
    return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" aria-hidden="true">' + (icons[name] || icons.gear) + '</svg>';
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];
    });
  }
  function arr(value) { return Array.isArray(value) ? value : []; }
  function byId(list, id) { return arr(list).find(function (x) { return x.id === id; }) || null; }
  function domainById(id) { return byId(DATA.domains, id) || DATA.domains[0]; }
  function workspaceById(domain, id) { return byId(domain.workspaces, id) || domain.workspaces[0]; }
  function managerById(id) { return byId(DATA.managers, id); }
  function providerById(id) { return byId(DATA.providers, id) || DATA.providers[0]; }
  function freeRouteById(id) { return byId(DATA.freeRoutes, id) || DATA.freeRoutes[0]; }
  function titleCase(value) { return String(value || '').replace(/[-_.]/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();}); }
  function unique(list) { return list.filter(function (v,i,a) { return a.indexOf(v) === i; }); }
  function storageGet(key) { try { return window.localStorage ? window.localStorage.getItem(key) : null; } catch (error) { return null; } }
  function storageSet(key, value) { try { if (window.localStorage) window.localStorage.setItem(key, value); } catch (error) { /* preview may run in an opaque origin */ } }
  function toneFor(value) {
    value = String(value || '').toLowerCase();
    if (value.indexOf('active') >= 0 || value.indexOf('ready') >= 0 || value.indexOf('connected') >= 0 || value.indexOf('success') >= 0 || value.indexOf('healthy') >= 0 || value.indexOf('clean') >= 0) return 'ok';
    if (value.indexOf('running') >= 0 || value.indexOf('refresh') >= 0 || value.indexOf('progress') >= 0) return 'progress';
    if (value.indexOf('error') >= 0 || value.indexOf('failed') >= 0 || value.indexOf('blocked') >= 0) return 'error';
    if (value.indexOf('not') >= 0 || value.indexOf('missing') >= 0 || value.indexOf('warning') >= 0 || value.indexOf('repair') >= 0 || value.indexOf('required') >= 0) return 'warning';
    return 'muted';
  }
  function statusMarkup(label, tone) { return '<span class="pm3-status ' + esc(tone || toneFor(label)) + '">' + esc(label) + '</span>'; }
  function button(label, opts) {
    opts = opts || {};
    return '<button type="button" class="' + esc(opts.className || 'pm3-secondary-btn') + '"' + (opts.attrs ? ' ' + opts.attrs : '') + '>' + (opts.icon ? icon(opts.icon) : '') + esc(label) + '</button>';
  }

  function settingDomain(setting) {
    var cat = setting.cat;
    if (cat === 'general') return 'general';
    if (cat === 'ai' || cat === 'web' || cat === 'media') return 'ai';
    if (cat === 'code' || cat === 'extensions') return 'code';
    if (cat === 'memory' || cat === 'planning' || cat === 'personas') return 'memory';
    if (cat === 'branching') return 'source';
    if (cat === 'safety') return 'safety';
    return 'system';
  }

  var categoryMap = {};
  arr(INVENTORY.categories).forEach(function (cat) { categoryMap[cat.id] = cat; });
  var settingMap = {};
  arr(INVENTORY.settings).forEach(function (setting) {
    settingMap[setting.id] = setting;
    if (state.values[setting.id] === undefined) state.values[setting.id] = setting.default;
  });

  function sectionTitle(setting) {
    var cat = categoryMap[setting.cat] || {};
    var sub = arr(cat.subgroups).find(function (x) { return x.id === setting.sub; });
    return sub ? sub.title : titleCase(setting.sub || setting.cat);
  }
  function sectionDescription(setting) {
    var cat = categoryMap[setting.cat] || {};
    var sub = arr(cat.subgroups).find(function (x) { return x.id === setting.sub; });
    return sub ? sub.desc : (cat.desc || 'Related settings and behavior.');
  }
  function settingsForDomain(domainId) {
    return arr(INVENTORY.settings).filter(function (s) { return settingDomain(s) === domainId; });
  }
  function settingsForManager(manager) {
    if (!manager) return [];
    var prefixes = arr(manager.prefixes);
    var exact = arr(manager.settingIds);
    var list = arr(INVENTORY.settings).filter(function (s) {
      if (exact.indexOf(s.id) >= 0) return true;
      return prefixes.some(function (p) { return s.id.indexOf(p) === 0; });
    });
    return unique(list.map(function(s){return s.id;})).map(function(id){return settingMap[id];});
  }

  function findWorkspaceForManager(managerId) {
    var found = null;
    arr(DATA.domains).some(function (d) {
      return arr(d.workspaces).some(function (w) {
        if (arr(w.managers).indexOf(managerId) >= 0) { found = { domain:d, workspace:w }; return true; }
        return false;
      });
    });
    return found;
  }

  function routeKey() {
    return [state.home ? 'home' : state.domain, state.workspace, state.selectedManager || '', state.selectedProvider || '', state.providerTab || ''].join('|');
  }

  function currentDomain() { return domainById(state.domain); }
  function currentWorkspace() { return bodyWorkspace || workspaceById(currentDomain(), state.workspace); }

  function visibleDomainWorkspaces(domain) {
    return arr((domain || currentDomain()).workspaces).filter(function (w) { return !w.searchOnly; });
  }

  function defaultWorkspaceForDomain(domainId) {
    var d = domainById(domainId);
    return d.workspaces[0].id;
  }

  function setRoute(domainId, workspaceId, options) {
    options = options || {};
    state.home = false;
    state.domain = domainId || state.domain;
    state.workspace = workspaceId || defaultWorkspaceForDomain(state.domain);
    state.selectedManager = options.managerId || null;
    if (options.providerId) state.selectedProvider = options.providerId;
    if (options.providerTab) state.providerTab = options.providerTab;
    state.detailsSetting = options.settingId || null;
    state.highlightedSetting = options.settingId || null;
    state.activeSection = options.sectionId || null;
    state.showAllDetails = false;
    syncHash();
    render(true);
  }

  function syncHash() {
    var parts = state.home ? ['home'] : [state.domain, state.workspace];
    if (state.selectedManager) parts.push('manager=' + encodeURIComponent(state.selectedManager));
    if (state.selectedProvider && state.workspace === 'providers') parts.push('provider=' + encodeURIComponent(state.selectedProvider));
    if (state.providerTab && state.workspace === 'providers') parts.push('tab=' + encodeURIComponent(state.providerTab));
    if (state.detailsSetting) parts.push('setting=' + encodeURIComponent(state.detailsSetting));
    var next = '#/' + parts.join('/');
    if (location.hash !== next) history.replaceState(null,'',next);
  }

  function readHash() {
    var hash = location.hash.replace(/^#\/?/,'');
    if (!hash) return;
    var parts = hash.split('/').filter(Boolean);
    if (parts[0] === 'home') { state.home = true; return; }
    if (byId(DATA.domains, parts[0])) {
      state.home = false; state.domain = parts[0];
      var d = domainById(state.domain);
      if (parts[1] && byId(d.workspaces, parts[1])) state.workspace = parts[1];
    }
    parts.slice(2).forEach(function (part) {
      var p = part.split('=');
      if (p[0] === 'manager') state.selectedManager = decodeURIComponent(p.slice(1).join('='));
      if (p[0] === 'provider') state.selectedProvider = decodeURIComponent(p.slice(1).join('='));
      if (p[0] === 'tab') state.providerTab = decodeURIComponent(p.slice(1).join('='));
      if (p[0] === 'setting') state.detailsSetting = decodeURIComponent(p.slice(1).join('='));
    });
  }

  function renderTopbar() {
    var d = currentDomain();
    var w = currentWorkspace();
    var crumb = state.home ? 'Settings Home' : d.label + ' / ' + w.label;
    return '<header class="pm3-topbar">' +
      '<button type="button" class="pm3-back" data-back title="Back">' + icon('arrowLeft') + '<span class="pm3-visually-hidden">Back</span></button>' +
      '<div class="pm3-brand"><span class="pm3-brand-mark">' + icon('sparkles') + '</span><span>Puppet Master</span></div>' +
      '<span class="pm3-concept-badge">' + (variant === 'fable' ? 'fable · Concept 12' : 'kimi-k3 · Concept 12') + '</span>' +
      '<div class="pm3-crumbs"><span class="pm3-crumb">Settings</span><span class="pm3-crumb-sep">›</span><span class="pm3-crumb is-current">' + esc(crumb) + '</span></div>' +
      '<span class="pm3-top-spacer"></span>' +
      '<button type="button" class="pm3-project-pill" data-project-menu>Puppet Master</button>' +
      '<button type="button" class="pm3-icon-btn" data-color-toggle title="Toggle light or dark appearance">' + icon(state.color === 'dark' ? 'moon' : 'sun') + '<span class="pm3-visually-hidden">Toggle color mode</span></button>' +
      '<button type="button" class="pm3-icon-btn" data-motion-toggle title="Toggle reduced motion">' + icon('wave') + '<span class="pm3-visually-hidden">Toggle reduced motion</span></button>' +
      '<button type="button" class="pm3-top-action" data-global-actions>' + icon('more') + 'Actions</button>' +
      '<button type="button" class="pm3-icon-btn pm3-close" data-close title="Close Settings">' + icon('close') + '<span class="pm3-visually-hidden">Close Settings</span></button>' +
    '</header>';
  }

  function renderEssentialSideCards() {
    return '<div class="pm3-side-label">Essential setup</div>' +
      '<div class="pm3-side-card">' +
        '<button type="button" class="pm3-side-link" data-route="ai|providers">' + icon('brain') + '<span class="pm3-domain-copy"><strong>AI Providers</strong><small>8 active · 3 need attention</small></span>' + icon('chevron') + '</button>' +
        '<button type="button" class="pm3-side-link" data-route="source|source-control">' + icon('branch') + '<span class="pm3-domain-copy"><strong>Source Control</strong><small>GitHub connected · Git + Jujutsu ready</small></span>' + icon('chevron') + '</button>' +
        '<button type="button" class="pm3-side-link" data-route="system|data">' + icon('archive') + '<span class="pm3-domain-copy"><strong>Backups</strong><small>Not configured</small></span>' + icon('chevron') + '</button>' +
      '</div>' +
      '<div class="pm3-side-label">Settings health</div>' +
      '<div class="pm3-side-card"><div class="pm3-side-health">3 items need attention</div><div class="pm3-side-card-note">Provider sign-in, entitlement, and backup setup need review.</div><button type="button" data-nav-home>View overview</button></div>';
  }

  function renderSidebar() {
    var domainLinks = '';
    if (variant === 'kimi') {
      domainLinks = '<div class="pm3-side-label">Chapters</div>' + arr(DATA.domains).map(function (d) {
        return '<button type="button" class="pm3-domain-link ' + (!state.home && state.domain === d.id ? 'is-active' : '') + '" data-domain="' + esc(d.id) + '">' +
          icon(d.icon) + '<span class="pm3-domain-copy"><strong>' + esc(d.label) + '</strong><small>' + esc(d.description) + '</small></span></button>';
      }).join('');
    }
    return '<aside class="pm3-sidebar">' +
      '<div class="pm3-sidebar-head"><h1 class="pm3-sidebar-title">Settings</h1><div class="pm3-sidebar-project">Project: Puppet Master</div></div>' +
      '<div class="pm3-search-wrap"><label class="pm3-search">' + icon('search') + '<input data-global-search autocomplete="off" placeholder="Search settings, providers, actions…" aria-label="Search Settings"><span class="pm3-keycap">⌘ K</span></label></div>' +
      '<div class="pm3-side-scroll">' +
        '<button type="button" class="pm3-side-link ' + (state.home ? 'is-active' : '') + '" data-nav-home>' + icon('home') + '<span>Settings Home</span></button>' +
        domainLinks +
        renderEssentialSideCards() +
      '</div>' +
    '</aside>';
  }

  function renderDomainTabs() {
    return '<nav class="pm3-domain-tabs" aria-label="Settings domains">' + arr(DATA.domains).map(function (d) {
      return '<button type="button" class="pm3-domain-tab ' + (!state.home && state.domain === d.id ? 'is-active' : '') + '" data-domain="' + esc(d.id) + '">' + esc(d.label) + '</button>';
    }).join('') + '</nav>';
  }

  function renderWorkspaceBar() {
    if (state.home) return '';
    var d = currentDomain();
    var w = currentWorkspace();
    var tabs = arr(d.workspaces).filter(function(item){return !item.searchOnly;}).map(function (item) {
      return '<button type="button" class="pm3-workspace-tab ' + (item.id === w.id ? 'is-active' : '') + '" data-workspace="' + esc(item.id) + '">' + esc(item.label) + '</button>';
    }).join('');
    var tools = '<div class="pm3-workspace-tools"><button type="button" class="pm3-icon-btn" data-page-options title="Page options">' + icon('sliders') + '</button></div>';
    return '<div class="pm3-workspace-bar">' +
      '<div class="pm3-workspace-tabs">' + tabs + '</div>' +
      '<div class="pm3-workspace-copy"><h2 class="pm3-workspace-title">' + esc(w.title) + '</h2><p class="pm3-workspace-description">' + esc(w.description) + '</p></div>' +
      tools + '</div>';
  }

  function renderStatusbar() {
    return '<footer class="pm3-statusbar"><span class="ok">✓</span><span>Shared inventory: ' + esc(INVENTORY.settingsCount || arr(INVENTORY.settings).length) + ' settings · ' + esc(arr(DATA.managers).length) + ' manager families</span><span class="spacer"></span><span>Project: Puppet Master</span><span>' + (variant === 'fable' ? 'Tabbed Organizer' : 'Tome Chapters') + '</span></footer>';
  }

  function renderHome() {
    return '<div class="pm3-view pm3-scroll"><main class="pm3-home">' +
      '<div class="pm3-home-kicker">Project settings</div><h1>Find anything. Configure the essentials first.</h1>' +
      '<p class="pm3-home-lede">Search by setting, provider, action, problem, or plain-language task. Related resources stay together, and every long page keeps your current section visible while you scroll.</p>' +
      '<label class="pm3-hero-search">' + icon('search') + '<input data-hero-search autocomplete="off" placeholder="Search settings, providers, accounts, actions, or describe what you need…" aria-label="Search all Settings"><span class="pm3-keycap">⌘ K</span></label>' +
      '<section class="pm3-home-section"><div class="pm3-home-section-head"><div><h2>Essential setup</h2><p>The two places nearly every project needs immediately.</p></div></div>' +
      '<div class="pm3-essential-grid">' +
        '<button type="button" class="pm3-essential-card" data-route="ai|providers"><span class="pm3-essential-icon">' + icon('brain') + '</span><span class="pm3-essential-copy"><strong>AI Providers</strong><span>8 active · 3 need attention · Free Models nested</span></span>' + icon('chevron') + '</button>' +
        '<button type="button" class="pm3-essential-card" data-route="source|source-control"><span class="pm3-essential-icon">' + icon('branch') + '</span><span class="pm3-essential-copy"><strong>Source Control</strong><span>GitHub connected · Git + Jujutsu ready</span></span>' + icon('chevron') + '</button>' +
      '</div></section>' +
      '<section class="pm3-home-section"><div class="pm3-home-section-head"><div><h2>Needs attention</h2><p>Only actionable problems appear here.</p></div></div><div class="pm3-attention">' +
        '<div class="pm3-attention-row">' + icon('bell') + '<div><strong>MiniMax and Antigravity need sign-in.</strong><span>Installed providers cannot be invoked yet.</span></div><button data-route="ai|providers">Review</button></div>' +
        '<div class="pm3-attention-row">' + icon('archive') + '<div><strong>Backups have not been configured.</strong><span>Create a verified project and settings backup.</span></div><button data-route="system|data">Set up</button></div>' +
        '<div class="pm3-attention-row">' + icon('branch') + '<div><strong>Git LFS is missing on Windows WSL.</strong><span>Projects using LFS may fail there.</span></div><button data-route="source|source-control">Repair</button></div>' +
      '</div></section>' +
      '<section class="pm3-home-section"><div class="pm3-home-section-head"><div><h2>Browse by domain</h2><p>Eight predictable places instead of dozens of look-alike destinations.</p></div></div><div class="pm3-domain-grid">' +
        arr(DATA.domains).map(function (d) { return '<button type="button" class="pm3-domain-card" data-domain="' + esc(d.id) + '"><span class="pm3-domain-card-icon">' + icon(d.icon) + '</span><strong>' + esc(d.label) + '</strong><span>' + esc(d.description) + '</span></button>'; }).join('') +
      '</div></section>' +
    '</main></div>';
  }

  function displayValue(value) {
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'None';
    if (value === true) return 'On';
    if (value === false) return 'Off';
    if (value == null || value === '') return 'Not set';
    return String(value);
  }

  function whyChange(setting) {
    var label = setting.label.toLowerCase();
    if (setting.type === 'toggle') return 'Turn this on when you want the behavior for this project; turn it off when predictability or lower resource use matters more.';
    if (setting.type === 'select' || setting.type === 'radio') return 'Choose the option that best matches this project. The recommended choice is safest for most users, while the other choices trade convenience, performance, privacy, or control.';
    if (setting.type === 'number' || setting.type === 'slider') return 'Raise or lower this when the current balance feels too aggressive or too conservative. Puppet Master validates supported ranges before applying the change.';
    if (setting.type === 'path') return 'Change this only when automatic detection cannot find the correct location. The path is checked before it becomes effective.';
    if (setting.type === 'list') return 'Reorder the items to put the most important choices first without typing or memorizing internal identifiers.';
    if (setting.type === 'action') return 'Use this action to perform the described maintenance or recovery step. Puppet Master previews destructive effects and asks before committing them.';
    if (label.indexOf('retention') >= 0) return 'Increase retention when auditability and recovery matter more than disk use. Lower values are rejected when they would violate an owner minimum.';
    return 'Change this when the project needs behavior different from the recommended default. The current value remains visible alongside its scope and source.';
  }

  function consequenceText(setting) {
    var bits = [];
    var badges = arr(setting.badges).map(String);
    if (badges.indexOf('restart') >= 0) bits.push('Requires an application restart before the effective value changes.');
    if (setting.type === 'path') bits.push('An invalid location is rejected immediately; the last working value remains active.');
    if (setting.type === 'action') bits.push('The action produces a receipt and never runs merely by opening this explanation.');
    if (setting.id.indexOf('cost') >= 0 || setting.id.indexOf('budget') >= 0 || setting.id.indexOf('overage') >= 0) bits.push('This can affect paid usage. Cost consequences are shown before a paid route is used.');
    if (setting.id.indexOf('permission') >= 0 || setting.cat === 'safety') bits.push('This can change what agents are allowed to do. Effective policy and the winning rule remain inspectable.');
    if (!bits.length) bits.push('Applies to future interactions in this project. Existing running work keeps its current effective configuration unless the setting explicitly supports live updates.');
    return bits;
  }

  function relatedSettings(setting) {
    return arr(INVENTORY.settings).filter(function (s) { return s.id !== setting.id && s.cat === setting.cat && s.sub === setting.sub; }).slice(0, 4);
  }

  function renderSettingDetails(setting, inspector) {
    var related = relatedSettings(setting);
    var content = '<div class="pm3-detail-block"><h4>What this does</h4><p>' + esc(setting.desc) + '</p></div>' +
      '<div class="pm3-detail-block"><h4>Why you might change it</h4><p>' + esc(whyChange(setting)) + '</p></div>' +
      '<div class="pm3-detail-block"><h4>Default and current value</h4><p>Default: <strong>' + esc(displayValue(setting.default)) + '</strong><br>Current: <strong>' + esc(displayValue(state.values[setting.id])) + '</strong></p></div>' +
      '<div class="pm3-detail-block"><h4>Applies to</h4><p>This project. Changes do not silently overwrite settings in other projects. Copying settings creates an independent copy.</p></div>' +
      '<div class="pm3-detail-block"><h4>Consequences and dependencies</h4><ul>' + consequenceText(setting).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="pm3-detail-block"><h4>Related settings</h4><div class="pm3-related">' + related.map(function (s) { return '<button type="button" data-related-setting="' + esc(s.id) + '">' + esc(s.label) + '</button>'; }).join('') + '</div></div>' +
      '<div class="pm3-detail-block"><h4>Technical details</h4><p class="pm3-technical">' + esc(setting.id) + ' · ' + esc(setting.type) + ' · tier ' + esc(setting.tier || 'standard') + '</p></div>';
    if (inspector) {
      return '<div class="pm3-inspector-kicker">Setting explanation</div><h3>' + esc(setting.label) + '</h3><p style="color:var(--pm3-muted);margin:0;font-size:10px">Rich help stays available without interrupting your place in the settings list.</p>' + content;
    }
    return '<div class="pm3-setting-detail"><div class="pm3-detail-grid">' + content + '</div></div>';
  }

  function renderSettingControl(setting) {
    var value = state.values[setting.id];
    var attrs = 'data-setting-id="' + esc(setting.id) + '"';
    if (setting.type === 'toggle') {
      return '<button type="button" class="pm3-toggle" aria-pressed="' + (value ? 'true' : 'false') + '" ' + attrs + ' data-toggle-setting><span class="pm3-visually-hidden">Toggle ' + esc(setting.label) + '</span></button>';
    }
    if (setting.type === 'select') {
      return '<select class="pm3-control-select" ' + attrs + ' data-setting-select aria-label="' + esc(setting.label) + '">' + arr(setting.options).map(function (opt) { return '<option' + (String(opt) === String(value) ? ' selected' : '') + '>' + esc(opt) + '</option>'; }).join('') + '</select>';
    }
    if (setting.type === 'radio') {
      var options = arr(setting.options);
      if (options.length <= 4 && options.length > 0) {
        return '<div class="pm3-segmented" role="group" aria-label="' + esc(setting.label) + '">' + options.map(function (opt) { return '<button type="button" class="' + (String(opt) === String(value) ? 'is-active' : '') + '" data-radio-setting="' + esc(setting.id) + '" data-value="' + esc(opt) + '">' + esc(opt) + '</button>'; }).join('') + '</div>';
      }
      return '<select class="pm3-control-select" ' + attrs + ' data-setting-select>' + options.map(function (opt) { return '<option' + (String(opt) === String(value) ? ' selected' : '') + '>' + esc(opt) + '</option>'; }).join('') + '</select>';
    }
    if (setting.type === 'slider') {
      var num = Number(value); if (!isFinite(num)) num = Number(setting.default) || 50;
      return '<label class="pm3-range"><input type="range" min="0" max="100" value="' + esc(num) + '" ' + attrs + ' data-setting-range><output>' + esc(num) + '%</output></label>';
    }
    if (setting.type === 'number') {
      return '<input class="pm3-control-number" type="number" value="' + esc(value) + '" ' + attrs + ' data-setting-input aria-label="' + esc(setting.label) + '">';
    }
    if (setting.type === 'path') {
      return '<div class="pm3-control-path"><span title="' + esc(displayValue(value)) + '">' + esc(displayValue(value)) + '</span><button type="button" data-browse-path="' + esc(setting.id) + '">Browse</button></div>';
    }
    if (setting.type === 'list') {
      return '<button type="button" class="pm3-list-control" data-reorder-setting="' + esc(setting.id) + '">' + icon('layers') + '<span>Reorder ' + esc(Array.isArray(value) && value.length > 1 ? value.length + ' items' : 'items') + '</span></button>';
    }
    if (setting.type === 'keyvalue' || setting.type === 'multiselect') {
      var count = Array.isArray(value) ? value.length : (value && typeof value === 'object' ? Object.keys(value).length : 0);
      return '<button type="button" class="pm3-list-control" data-manage-setting="' + esc(setting.id) + '">' + icon('sliders') + '<span>Manage' + (count ? ' · ' + count : '') + '</span></button>';
    }
    if (setting.type === 'action') {
      var label = setting.id === 'general.startup.reset-home-layout' ? 'Restore Default Layout' : (String(setting.default || '').length < 30 ? String(setting.default || setting.label) : setting.label);
      return button(label, { className:'pm3-action-btn', icon: setting.id.indexOf('reset') >= 0 || setting.id.indexOf('restore') >= 0 ? 'refresh' : 'bolt', attrs:'data-setting-action="' + esc(setting.id) + '"' });
    }
    return '<input class="pm3-control-text" type="text" value="' + esc(value) + '" ' + attrs + ' data-setting-input aria-label="' + esc(setting.label) + '">';
  }

  function renderSetting(setting) {
    var open = state.showAllDetails || state.detailsSetting === setting.id;
    var highlighted = state.highlightedSetting === setting.id;
    return '<div class="pm3-setting ' + (highlighted ? 'is-highlighted ' : '') + '" id="setting-' + esc(setting.id.replace(/[^a-zA-Z0-9_-]/g,'-')) + '" data-setting-row="' + esc(setting.id) + '">' +
      '<div class="pm3-setting-row"><div class="pm3-setting-copy"><div class="pm3-setting-label">' + esc(setting.label) + '</div><div class="pm3-setting-short">' + esc(setting.desc) + '</div></div>' +
      '<div class="pm3-setting-control">' + renderSettingControl(setting) + '</div>' +
      '<button type="button" class="pm3-details-btn" aria-expanded="' + (open ? 'true' : 'false') + '" data-setting-details="' + esc(setting.id) + '">Details</button></div>' +
      (open ? renderSettingDetails(setting, false) : '') +
    '</div>';
  }

  function ordinarySections(domainId, manager) {
    var settings = manager ? settingsForManager(manager) : settingsForDomain(domainId);
    var groups = {};
    settings.forEach(function (setting) {
      var key = setting.cat + '.' + setting.sub;
      if (!groups[key]) groups[key] = { id:key, title:sectionTitle(setting), description:sectionDescription(setting), settings:[] };
      groups[key].settings.push(setting);
    });
    return Object.keys(groups).map(function (key) {
      var g = groups[key];
      g.settings.sort(function (a,b) { return (b.curated ? 1 : 0) - (a.curated ? 1 : 0) || a.label.localeCompare(b.label); });
      return g;
    });
  }

  function renderOrdinarySection(section) {
    var featured = section.settings.filter(function (s) { return s.curated; });
    section.settings.forEach(function (s) { if (featured.length < 7 && featured.indexOf(s) < 0) featured.push(s); });
    var extra = section.settings.filter(function (s) { return featured.indexOf(s) < 0; });
    var sid = bodyWorkspaceId ? (bodyWorkspaceId + ':' + section.id) : section.id;
    var expanded = !!state.expandedSections[sid] || !!state.highlightedSetting && extra.some(function (s) { return s.id === state.highlightedSetting; });
    return '<section class="pm3-section" id="section-' + esc(sid.replace(/[^a-zA-Z0-9_:-]/g,'-')) + '" data-section-id="' + esc(sid) + '">' +
      '<div class="pm3-section-head"><div class="pm3-section-head-copy"><h2>' + esc(section.title) + '</h2><p>' + esc(section.description) + '</p></div><span class="pm3-section-count">' + esc(section.settings.length) + ' settings</span></div>' +
      '<div class="pm3-settings-card">' + featured.map(renderSetting).join('') + '</div>' +
      (extra.length ? '<div class="pm3-more ' + (expanded ? 'is-open' : '') + '"><button type="button" class="pm3-more-btn" data-more-section="' + esc(sid) + '"><span class="pm3-more-icon">' + icon('sliders') + '</span><span class="pm3-more-copy"><strong>Additional controls</strong><span>' + esc(extra.length) + ' shared-inventory settings · explained on demand</span></span><span class="pm3-more-count">' + esc(extra.length) + '</span>' + icon('chevron') + '</button>' + (expanded ? '<div class="pm3-more-body">' + extra.map(renderSetting).join('') + '</div>' : '') + '</div>' : '') +
    '</section>';
  }

  function renderSettingInspector() {
    var setting = state.detailsSetting ? settingMap[state.detailsSetting] : null;
    if (!setting) return '';
    return '<aside class="pm3-setting-inspector">' +
      '<button type="button" class="pm3-icon-btn pm3-inspector-close" data-inspector-close title="Close explanation">' + icon('close') + '<span class="pm3-visually-hidden">Close explanation</span></button>' +
      renderSettingDetails(setting, true) +
    '</aside>';
  }

  function ordinaryPayload(domainId, manager) {
    var sections = ordinarySections(domainId, manager);
    if (!sections.length) {
      return {
        sections: [],
        html: '<div class="pm3-panel-card"><h3>No ordinary settings are owned here</h3><p>This destination is managed through its resource-specific workspace instead of a flat list.</p></div>'
      };
    }
    return {
      sections: sections.map(function (s) {
        return { id: (bodyWorkspaceId ? bodyWorkspaceId + ':' : '') + s.id, label: s.title };
      }),
      html: sections.map(renderOrdinarySection).join('')
    };
  }

  function renderOrdinary(manager) {
    if (returnBodyOnly) return ordinaryPayload(state.domain, manager);
    var sections = ordinarySections(state.domain, manager);
    if (!sections.length) {
      return '<div class="pm3-view pm3-scroll"><div class="pm3-manager-page"><div class="pm3-panel-card"><h3>No ordinary settings are owned here</h3><p>This destination is managed through its resource-specific workspace instead of a flat list.</p></div></div></div>';
    }
    var active = state.activeSection || sections[0].id;
    var hasInspector = variant === 'kimi' && !!state.detailsSetting;
    return '<div class="pm3-view pm3-document-layout ' + (hasInspector ? 'has-inspector' : '') + '">' +
      '<aside class="pm3-page-index"><div class="pm3-page-index-card"><div class="pm3-page-index-title">On this page</div>' + sections.map(function (s) { return '<button type="button" class="pm3-index-link ' + (s.id === active ? 'is-active' : '') + '" data-index-target="' + esc(s.id) + '">' + esc(s.title) + '</button>'; }).join('') + '</div></aside>' +
      '<div class="pm3-scroll" data-scroll-root><main class="pm3-document">' + sections.map(renderOrdinarySection).join('') + '</main></div>' +
      (hasInspector ? renderSettingInspector() : '') +
    '</div>';
  }

  function providerTabs(provider) {
    if (provider.id === 'free-models') return [
      ['overview','Overview'],['routes','Enabled Routes'],['models','Available Models'],['routing','Routing & Priority'],['limits','Limits & Resets'],['settings','Settings'],['diagnostics','Diagnostics']
    ];
    return [['overview','Overview'],['accounts','Accounts'],['models','Models & Plans'],['usage','Usage & Limits'],['routing','Routing & Fallback'],['installation','Installation'],['diagnostics','Diagnostics']];
  }

  function renderProviderRosterItem(provider) {
    return '<button type="button" class="pm3-roster-item ' + (state.selectedProvider === provider.id ? 'is-active' : '') + '" data-provider="' + esc(provider.id) + '">' +
      '<span class="pm3-avatar">' + esc(provider.initials) + '</span><span class="pm3-roster-copy"><strong>' + esc(provider.name) + '</strong><span>' + esc(provider.status) + '</span></span><span class="pm3-dot ' + esc(provider.tone) + '"></span></button>';
  }

  function renderProviderInspector(provider) {
    var selectedRoute = freeRouteById(state.selectedFreeRoute);
    if (provider.id === 'free-models') {
      return '<aside class="pm3-inspector"><div class="pm3-inspector-head"><h3>Route details</h3></div><div class="pm3-inspector-scroll">' +
        '<div style="display:flex;gap:9px;align-items:center;margin-bottom:10px"><span class="pm3-avatar">' + esc(selectedRoute.initials) + '</span><div><strong style="font-size:11px">' + esc(selectedRoute.name) + '</strong><div style="color:var(--pm3-muted);font-size:9px;margin-top:2px">Nested under Free Models</div></div></div>' +
        '<div class="pm3-kv"><span>Status</span><span>' + statusMarkup(selectedRoute.enabled ? 'Active' : 'Available', selectedRoute.enabled ? 'ok' : 'muted') + '</span></div>' +
        '<div class="pm3-kv"><span>Models available</span><span>' + esc(selectedRoute.models) + '</span></div>' +
        '<div class="pm3-kv"><span>Next reset</span><span>' + esc(selectedRoute.reset) + '</span></div>' +
        '<div class="pm3-kv"><span>Rate limit</span><span>' + esc(selectedRoute.limit) + '</span></div>' +
        '<div class="pm3-kv"><span>Daily limit</span><span>' + esc(selectedRoute.daily) + '</span></div>' +
        '<div class="pm3-kv"><span>Account</span><span>' + esc(selectedRoute.account) + '</span></div>' +
        '<div class="pm3-kv"><span>Authentication</span><span>' + esc(selectedRoute.auth) + '</span></div>' +
        '<h4 style="font-size:10px;margin:16px 0 5px">Capabilities</h4><div class="pm3-capabilities">' + selectedRoute.capabilities.map(function(c){return '<span>'+esc(c)+'</span>';}).join('') + '</div>' +
        '<div class="pm3-inspector-actions">' +
          (selectedRoute.enabled ? button('Test this route',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="free-'+esc(selectedRoute.id)+'"'}) + button('View models',{className:'pm3-secondary-btn',icon:'eye',attrs:'data-provider-tab-link="models"'}) + button('Edit route settings',{className:'pm3-secondary-btn',icon:'sliders',attrs:'data-provider-tab-link="settings"'}) + button('Disable route',{className:'pm3-danger-btn',icon:'close',attrs:'data-disable-free="'+esc(selectedRoute.id)+'"'}) : button('Enable this route',{className:'pm3-primary-btn',icon:'plus',attrs:'data-enable-free="'+esc(selectedRoute.id)+'"'})) +
        '</div></div></aside>';
    }
    return '<aside class="pm3-inspector"><div class="pm3-inspector-head"><h3>Connection details</h3></div><div class="pm3-inspector-scroll">' +
      '<div class="pm3-kv"><span>Status</span><span>' + statusMarkup(provider.status, provider.tone) + '</span></div>' +
      '<div class="pm3-kv"><span>Account</span><span>' + esc(provider.account) + '</span></div>' +
      '<div class="pm3-kv"><span>Product</span><span>' + esc(provider.product) + '</span></div>' +
      '<div class="pm3-kv"><span>Install</span><span>' + esc(provider.install) + '</span></div>' +
      '<div class="pm3-kv"><span>Authentication</span><span>' + esc(provider.auth) + '</span></div>' +
      '<div class="pm3-kv"><span>Next reset</span><span>' + esc(provider.reset) + '</span></div>' +
      '<h4 style="font-size:10px;margin:16px 0 5px">Capabilities</h4><div class="pm3-capabilities">' + provider.capabilities.map(function(c){return '<span>'+esc(c)+'</span>';}).join('') + '</div>' +
      '<div class="pm3-inspector-actions">' + button('Test connection',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="provider-'+esc(provider.id)+'"'}) + button('Manage accounts',{className:'pm3-secondary-btn',icon:'users',attrs:'data-provider-tab-link="accounts"'}) + button('Refresh models',{className:'pm3-secondary-btn',icon:'refresh',attrs:'data-provider-tab-link="models"'}) + (provider.state === 'active' ? button('Reconnect',{className:'pm3-secondary-btn',icon:'link',attrs:'data-sim-action="Reconnect '+esc(provider.name)+'"'}) : button(provider.state === 'not-installed' ? 'Install' : 'Sign in',{className:'pm3-primary-btn',icon:provider.state === 'not-installed'?'download':'link',attrs:'data-sim-action="Set up '+esc(provider.name)+'"'})) + '</div>' +
      '</div></aside>';
  }

  function providerOverview(provider) {
    return (provider.tone === 'warning' || provider.id === 'claude-code' ? '<div class="pm3-alert">' + icon('bell') + '<div><strong>Needs attention</strong><span>' + esc(provider.note) + '</span></div></div>' : '') +
      '<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Connection status</div><div class="pm3-stat-value">' + esc(provider.state === 'active' ? provider.status : provider.status.split(' · ')[0]) + '</div><div class="pm3-stat-note">Authentication and invocation are checked separately.</div></div>' +
      '<div class="pm3-stat"><div class="pm3-stat-label">Models available</div><div class="pm3-stat-value">' + esc(provider.models.length) + '</div><div class="pm3-stat-note">' + esc(provider.models.slice(0,3).join(', ') || 'Available after setup') + '</div></div>' +
      '<div class="pm3-stat"><div class="pm3-stat-label">Account in use</div><div class="pm3-stat-value">' + esc(provider.account) + '</div><div class="pm3-stat-note">' + esc(provider.product) + '</div></div></div>' +
      '<div class="pm3-panel-card"><h3>When usage runs out</h3><p>' + esc(provider.note) + '</p><div class="pm3-inline-actions">' + button('Manage limits & fallback',{className:'pm3-secondary-btn',icon:'route',attrs:'data-provider-tab-link="routing"'}) + button('View usage',{className:'pm3-secondary-btn',icon:'gauge',attrs:'data-provider-tab-link="usage"'}) + '</div></div>';
  }

  function providerAccounts(provider) {
    var accounts = provider.id === 'claude-code' ? [
      {name:'Playtr Team',kind:'Claude CLI',status:'Active',priority:1,usage:'32% used · resets 4:00 PM'},
      {name:'Personal Max',kind:'Claude CLI',status:'Exhausted until 4:00 PM',priority:2,usage:'100% used'},
      {name:'Work Claude',kind:'Claude CLI',status:'Active',priority:3,usage:'8% used'}
    ] : [
      {name:provider.account,kind:provider.auth,status:provider.state==='active'?'Active':'Needs setup',priority:1,usage:provider.reset},
      {name:'Secondary account',kind:'Optional',status:'Not configured',priority:2,usage:'Add when needed'}
    ];
    return '<div class="pm3-panel-card"><div class="pm3-panel-card-head"><h3>Accounts</h3><div class="pm3-actions-right">' + button('Add account',{className:'pm3-primary-btn',icon:'plus',attrs:'data-sim-action="Add account"'}) + '</div></div><p>Accounts remain distinct resources with independent health, usage windows, products, and priority.</p></div>' +
      '<table class="pm3-data-table"><thead><tr><th>Account</th><th>Sign-in method</th><th>Status</th><th>Priority</th><th></th></tr></thead><tbody>' + accounts.map(function(a,i){return '<tr><td><strong>'+esc(a.name)+'</strong><div style="color:var(--pm3-muted);font-size:9px">'+esc(a.usage)+'</div></td><td>'+esc(a.kind)+'</td><td>'+statusMarkup(a.status)+'</td><td>#'+esc(a.priority)+'</td><td>'+button('Manage',{className:'pm3-secondary-btn',attrs:'data-sim-action="Manage '+esc(a.name)+'"'})+'</td></tr>';}).join('') + '</tbody></table>' +
      '<div class="pm3-panel-card" style="margin-top:9px"><h3>Account priority & switching</h3><p>When an account reaches its limit, Puppet Master tries the next eligible account. It skips signed-out, cooling-down, inactive, or incompatible accounts and asks before crossing into different billing terms.</p><div class="pm3-inline-actions">' + button('Reorder accounts',{className:'pm3-secondary-btn',icon:'layers',attrs:'data-reorder-provider-accounts'}) + button('View switching rules',{className:'pm3-secondary-btn',icon:'eye',attrs:'data-sim-action="Explain account switching"'}) + '</div></div>';
  }

  function providerModels(provider) {
    var models = provider.models.length ? provider.models : ['Models appear after installation and sign-in'];
    return '<div class="pm3-panel-card"><div class="pm3-panel-card-head"><h3>Models & products</h3><div class="pm3-actions-right">' + button('Refresh catalog',{className:'pm3-secondary-btn',icon:'refresh',attrs:'data-test-action="catalog-'+esc(provider.id)+'"'}) + '</div></div><p>Catalog availability, entitlement, and invocation readiness are tracked separately so a listed model is never mistaken for a usable one.</p></div>' +
      '<table class="pm3-data-table"><thead><tr><th>Model</th><th>Product</th><th>Eligibility</th><th>Default roles</th><th></th></tr></thead><tbody>' + models.map(function(m,i){return '<tr><td><strong>'+esc(m)+'</strong></td><td>'+esc(provider.product)+'</td><td>'+statusMarkup(provider.state==='active'?'Ready':'Setup required',provider.state==='active'?'ok':'warning')+'</td><td>'+(i===0?'Planning, difficult code':'Fast tasks, fallback')+'</td><td>'+button('Configure',{className:'pm3-secondary-btn',attrs:'data-sim-action="Configure '+esc(m)+'"'})+'</td></tr>';}).join('') + '</tbody></table>';
  }

  function providerUsage(provider) {
    return '<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Included usage</div><div class="pm3-stat-value">72%</div><div class="pm3-progress"><span style="width:72%"></span></div><div class="pm3-stat-note">18.2M / 25M tokens</div></div><div class="pm3-stat"><div class="pm3-stat-label">Next reset</div><div class="pm3-stat-value" style="font-size:15px">'+esc(provider.reset)+'</div><div class="pm3-stat-note">Provider-reported reset time</div></div><div class="pm3-stat"><div class="pm3-stat-label">Paid usage</div><div class="pm3-stat-value">Off</div><div class="pm3-stat-note">Ask before overage</div></div></div>' +
      '<div class="pm3-panel-card"><h3>Limits, resets, and allowance authority</h3><p>Usage windows come from the provider or product plan. Puppet Master never merges separate quota pools merely because they share one account name.</p><div class="pm3-inline-actions">' + button('Open Usage page',{className:'pm3-secondary-btn',icon:'gauge',attrs:'data-sim-action="Open provider usage"'}) + button('Configure alerts',{className:'pm3-secondary-btn',icon:'bell',attrs:'data-sim-action="Configure provider alerts"'}) + '</div></div>';
  }

  function providerRouting(provider) {
    return '<div class="pm3-panel-card"><h3>Routing & fallback</h3><p>Choose where this provider participates. Role eligibility, account priority, model capability, health, included usage, cost, and privacy all contribute to the effective route.</p></div>' +
      '<div class="pm3-priority-list">' + ['Planning and complex reasoning','Code implementation','GUI and image work','Fast utility tasks'].map(function(label,i){return '<div class="pm3-priority-row"><span class="pm3-priority-num">'+(i+1)+'</span><span class="pm3-priority-copy"><strong>'+esc(label)+'</strong><span>'+(i===0?'Primary: '+esc(provider.name):'Eligible when capability and policy match')+'</span></span><select class="pm3-control-select"><option>'+(i===0?'Primary':'Enabled')+'</option><option>Fallback only</option><option>Disabled</option></select></div>';}).join('') + '</div>' +
      '<div class="pm3-panel-card" style="margin-top:9px"><h3>Billing boundary</h3><p>Included usage falls through to another included account first. Crossing into paid API usage requires the configured approval unless the user explicitly enabled automatic paid overage.</p></div>';
  }

  function providerInstallation(provider) {
    return '<div class="pm3-panel-card"><div class="pm3-panel-card-head"><h3>Installation & updates</h3><div class="pm3-actions-right">' + button(provider.state==='not-installed'?'Install':'Check for update',{className:provider.state==='not-installed'?'pm3-primary-btn':'pm3-secondary-btn',icon:'download',attrs:'data-test-action="install-'+esc(provider.id)+'"'}) + '</div></div><p>Provider CLIs are never silently bundled. Puppet Master installs only from the official provider after an explicit user action, then records the installation method and verifies invocation.</p></div>' +
      '<div class="pm3-kv"><span>Current state</span><span>'+esc(provider.install)+'</span></div><div class="pm3-kv"><span>Update source</span><span>Official provider</span></div><div class="pm3-kv"><span>Target environment</span><span>This Mac</span></div><div class="pm3-kv"><span>Last verification</span><span>2 minutes ago</span></div><div class="pm3-kv"><span>Auto-update</span><span>Follow install method</span></div>';
  }

  function providerDiagnostics(provider) {
    return '<div class="pm3-panel-card"><div class="pm3-panel-card-head"><h3>Connection checks</h3><div class="pm3-actions-right">' + button('Run all checks',{className:'pm3-primary-btn',icon:'test',attrs:'data-test-action="diagnostics-'+esc(provider.id)+'"'}) + '</div></div><p>Installation, authentication, entitlement, catalog validity, and a real model invocation are tested independently.</p></div>' +
      '<table class="pm3-data-table"><thead><tr><th>Check</th><th>Result</th><th>Last run</th><th></th></tr></thead><tbody>' +
      [['Installation detected',provider.state==='not-installed'?'Not installed':'Pass'],['Authentication',provider.auth],['Product entitlement',provider.state==='active'?'Pass':'Needs attention'],['Catalog validation',provider.models.length?'Pass':'Waiting for setup'],['Model invocation',provider.state==='active'?'Pass':'Not run']].map(function(r){return '<tr><td>'+esc(r[0])+'</td><td>'+statusMarkup(r[1])+'</td><td>2m ago</td><td>'+button('Details',{className:'pm3-secondary-btn',attrs:'data-sim-action="Inspect '+esc(r[0])+'"'})+'</td></tr>';}).join('') + '</tbody></table>';
  }

  function freeModelsContent(tab) {
    var enabled = DATA.freeRoutes.filter(function(r){return r.enabled;});
    var totalModels = enabled.reduce(function(n,r){return n+r.models;},0);
    if (tab === 'overview') {
      return '<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Status</div><div class="pm3-stat-value" style="color:var(--pm3-green)">Active</div><div class="pm3-stat-note">'+enabled.length+' routes enabled</div></div><div class="pm3-stat"><div class="pm3-stat-label">Models available</div><div class="pm3-stat-value">'+totalModels+'</div><div class="pm3-stat-note">Across all enabled routes</div></div><div class="pm3-stat"><div class="pm3-stat-label">Next reset</div><div class="pm3-stat-value" style="font-size:16px">In 5h 32m</div><div class="pm3-stat-note">First reset: Hugging Face</div></div></div>' +
        '<div class="pm3-panel-card"><h3>One Settings provider, honest operational identity</h3><p>Free Models consolidates setup to keep the provider roster readable. Enabled routes remain nested here. In the chat model picker, Usage, routing traces, and receipts, Puppet Master shows the actual provider that served the model.</p><div class="pm3-inline-actions">'+button('Manage enabled routes',{className:'pm3-secondary-btn',icon:'layers',attrs:'data-provider-tab-link="routes"'})+button('Adjust route priority',{className:'pm3-secondary-btn',icon:'route',attrs:'data-provider-tab-link="routing"'})+'</div></div>';
    }
    if (tab === 'routes') {
      return '<div class="pm3-panel-card"><div class="pm3-panel-card-head"><h3>Enabled routes</h3><div class="pm3-actions-right">'+button('Add free route',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="free-route-catalog"'})+'</div></div><p>Only enabled routes receive provider-specific controls. Disabled candidates stay in the catalog and never clutter the main provider roster.</p></div>' +
        '<div class="pm3-priority-list">'+DATA.freeRoutes.map(function(r){return '<button type="button" class="pm3-priority-row" data-free-route="'+esc(r.id)+'" style="width:100%;text-align:left;color:inherit"><span class="pm3-avatar">'+esc(r.initials)+'</span><span class="pm3-priority-copy"><strong>'+esc(r.name)+'</strong><span>'+(r.enabled?esc(r.models+' models · '+r.auth):'Available · enable before configuring')+'</span></span>'+statusMarkup(r.enabled?'Active':'Not enabled',r.enabled?'ok':'muted')+'</button>';}).join('')+'</div>';
    }
    if (tab === 'models') {
      var rows=[]; enabled.forEach(function(r){for(var i=0;i<Math.min(3,r.models);i++) rows.push({name:(i===0?'Recommended ':i===1?'Fast ':'Specialist ')+r.name.replace(/ (Inference API|Free Models|Free Tier|Free Inference|Free Developer Route)/,''),route:r.name,cap:r.capabilities.join(', ')});});
      return '<div class="pm3-panel-card"><h3>Available free models</h3><p>Models are grouped operationally by their actual route while remaining configured under one Free Models Settings provider.</p></div><table class="pm3-data-table"><thead><tr><th>Model</th><th>Route provider</th><th>Capabilities</th><th>Status</th><th></th></tr></thead><tbody>'+rows.slice(0,18).map(function(r){return '<tr><td><strong>'+esc(r.name)+'</strong></td><td>'+esc(r.route)+'</td><td>'+esc(r.cap)+'</td><td>'+statusMarkup('Available','ok')+'</td><td>'+button('Configure',{className:'pm3-secondary-btn',attrs:'data-sim-action="Configure free model"'})+'</td></tr>';}).join('')+'</tbody></table>';
    }
    if (tab === 'routing') {
      return '<div class="pm3-panel-card"><h3>Free route priority</h3><p>Drag or use the explicit arrow controls to choose the route order. Unavailable, exhausted, signed-out, or incompatible routes are skipped automatically.</p></div><div class="pm3-priority-list">'+enabled.sort(function(a,b){return a.priority-b.priority;}).map(function(r,i){return '<div class="pm3-priority-row"><span class="pm3-grip">⠿</span><span class="pm3-priority-num">'+(i+1)+'</span><span class="pm3-priority-copy"><strong>'+esc(r.name)+'</strong><span>'+esc(r.models)+' models · '+esc(r.reset)+'</span></span><span class="pm3-move-buttons"><button data-move-free="'+esc(r.id)+'" data-direction="up" title="Move up">'+icon('arrowUp')+'</button><button data-move-free="'+esc(r.id)+'" data-direction="down" title="Move down">'+icon('arrowDown')+'</button></span></div>';}).join('')+'</div>';
    }
    if (tab === 'limits') {
      return '<div class="pm3-card-grid-2">'+enabled.map(function(r){return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-avatar">'+esc(r.initials)+'</span><div><h3>'+esc(r.name)+'</h3><span>'+esc(r.account)+'</span></div>'+statusMarkup(r.reset,'ok')+'</div><div class="pm3-kv"><span>Rate limit</span><span>'+esc(r.limit)+'</span></div><div class="pm3-kv"><span>Daily limit</span><span>'+esc(r.daily)+'</span></div><div class="pm3-kv"><span>Models</span><span>'+esc(r.models)+'</span></div></div>';}).join('')+'</div>';
    }
    if (tab === 'settings') {
      var r=freeRouteById(state.selectedFreeRoute);
      if(!r.enabled) return '<div class="pm3-panel-card"><h3>'+esc(r.name)+' is not enabled</h3><p>Enable this route before route-specific authentication, model, limits, and privacy controls appear.</p><div class="pm3-inline-actions">'+button('Enable route',{className:'pm3-primary-btn',icon:'plus',attrs:'data-enable-free="'+esc(r.id)+'"'})+'</div></div>';
      return '<div class="pm3-panel-card"><h3>'+esc(r.name)+' settings</h3><p>These controls appear only because the route is enabled. They remain nested under Free Models and never create another top-level provider tab.</p></div>' +
        '<div class="pm3-settings-card">'+[
          {id:'free.'+r.id+'.active',label:'Route active',desc:'Keep this configured route eligible for free-model selection.',type:'toggle',default:true},
          {id:'free.'+r.id+'.account',label:'Account',desc:'The account or token used for this route.',type:'action',default:'Manage account'},
          {id:'free.'+r.id+'.privacy',label:'Privacy preference',desc:'Prefer models and endpoints that match this project privacy policy.',type:'select',options:['Match project policy','Strict','Allow provider defaults'],default:'Match project policy'},
          {id:'free.'+r.id+'.fallback',label:'Use as fallback',desc:'Allow this route when higher-priority free routes are unavailable.',type:'toggle',default:true}
        ].map(function(s){if(state.values[s.id]===undefined)state.values[s.id]=s.default;return renderSetting(s);}).join('')+'</div>';
    }
    return providerDiagnostics({id:'free-models',state:'active',auth:'6 routes active',models:['96 models']});
  }

  function renderProviderContent(provider) {
    if (provider.id === 'free-models') return freeModelsContent(state.providerTab);
    if (state.providerTab === 'accounts') return providerAccounts(provider);
    if (state.providerTab === 'models') return providerModels(provider);
    if (state.providerTab === 'usage') return providerUsage(provider);
    if (state.providerTab === 'routing') return providerRouting(provider);
    if (state.providerTab === 'installation') return providerInstallation(provider);
    if (state.providerTab === 'diagnostics') return providerDiagnostics(provider);
    return providerOverview(provider);
  }

  function renderProviders() {
    var provider = providerById(state.selectedProvider);
    var tabs = providerTabs(provider);
    if (!tabs.some(function(t){return t[0]===state.providerTab;})) state.providerTab='overview';
    var sid = (bodyWorkspaceId || 'providers') + ':main';
    var layout = '<div class="pm3-resource-layout' + (returnBodyOnly ? ' is-embedded' : '') + '">' +
      '<aside class="pm3-roster"><div class="pm3-roster-head"><h3>AI Providers</h3>'+button('Set up',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="provider-setup"'})+'</div><div class="pm3-roster-list">'+DATA.providers.map(renderProviderRosterItem).join('')+'</div></aside>' +
      '<section class="pm3-resource-main"><div class="pm3-resource-head"><span class="pm3-avatar">'+esc(provider.initials)+'</span><div class="pm3-resource-title"><h2>'+esc(provider.name)+'</h2><p>'+esc(provider.status)+(provider.id==='free-models'?' · one Settings provider':'')+'</p></div><div class="pm3-resource-actions">'+button(state.testing['provider-'+provider.id]?'Testing…':'Test',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="provider-'+esc(provider.id)+'"'})+button('Actions',{className:'pm3-primary-btn',icon:'more',attrs:'data-provider-actions'})+'</div></div>' +
      '<nav class="pm3-subtabs">'+tabs.map(function(t){return '<button type="button" class="pm3-subtab '+(state.providerTab===t[0]?'is-active':'')+'" data-provider-tab="'+esc(t[0])+'">'+esc(t[1])+'</button>';}).join('')+'</nav>' +
      '<div class="pm3-resource-scroll"' + (returnBodyOnly ? '' : ' data-scroll-root') + '>'+renderProviderContent(provider)+'</div></section>' + renderProviderInspector(provider) + '</div>';
    if (returnBodyOnly) {
      return {
        sections: [{ id: sid, label: 'Providers & Accounts' }],
        html: '<section class="pm3-section" id="section-' + esc(sid.replace(/[^a-zA-Z0-9_:-]/g, '-')) + '" data-section-id="' + esc(sid) + '">' + layout + '</section>'
      };
    }
    return '<div class="pm3-view pm3-resource-wrap">' + layout + '</div>';
  }

  function renderWorkbenchNav(sections) {
    var active = state.activeSection || sections[0].id;
    return '<aside class="pm3-page-index"><div class="pm3-page-index-card"><div class="pm3-page-index-title">On this page</div>' +
      sections.map(function(s){return '<button type="button" class="pm3-index-link '+(active===s.id?'is-active':'')+'" data-index-target="'+esc(s.id)+'">'+esc(s.label)+'</button>';}).join('') +
    '</div></aside>';
  }

  function renderLongWorkbench(sections, content) {
    if (returnBodyOnly) {
      return {
        sections: arr(sections).map(function (s) {
          return { id: (bodyWorkspaceId ? bodyWorkspaceId + ':' : '') + s.id, label: s.label || s.title };
        }),
        html: content
      };
    }
    return '<div class="pm3-view pm3-workbench">'+renderWorkbenchNav(sections)+'<div class="pm3-workbench-main" data-scroll-root><div class="pm3-workbench-inner">'+content+'</div></div></div>';
  }

  function sectionWrap(id, title, description, content, actions) {
    var sid = bodyWorkspaceId ? (bodyWorkspaceId + ':' + id) : id;
    return '<section class="pm3-section" id="section-'+esc(String(sid).replace(/[^a-zA-Z0-9_:-]/g,'-'))+'" data-section-id="'+esc(sid)+'"><div class="pm3-bespoke-head"><div><h2>'+esc(title)+'</h2><p>'+esc(description)+'</p></div>'+(actions?'<div class="pm3-actions-right">'+actions+'</div>':'')+'</div>'+content+'</section>';
  }

  function renderWeb() {
    var sections=[
      {id:'overview',label:'Overview',icon:'globe'}, {id:'capabilities',label:'Capability routing',icon:'route'},
      {id:'priority',label:'Provider priority',icon:'layers'}, {id:'test-lab',label:'Test Lab',icon:'flask'},
      {id:'policy',label:'Limits, privacy & caches',icon:'shield'}, {id:'diagnostics',label:'Diagnostics',icon:'gauge'}
    ];
    var overview = sectionWrap('overview','Overview','One capability model shared with AI Providers. This page chooses routes; it never recreates provider credentials.',
      '<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Capabilities ready</div><div class="pm3-stat-value">6 / 6</div><div class="pm3-stat-note">Search, fetch, crawl, browser, map, extract</div></div><div class="pm3-stat"><div class="pm3-stat-label">Configured providers</div><div class="pm3-stat-value">5</div><div class="pm3-stat-note">Claude Code and Codex included</div></div><div class="pm3-stat"><div class="pm3-stat-label">Recent tests</div><div class="pm3-stat-value">12</div><div class="pm3-stat-note">11 passed · 1 needs sign-in</div></div></div><div class="pm3-panel-card"><h3>How setup ownership works</h3><p>Installation, authentication, accounts, and model catalogs remain owned by Providers & Accounts. Web & Research projects compatible capabilities, sets per-capability priority, and links directly to repair when a route is unavailable.</p></div>');
    var capabilityCards = '<div class="pm3-card-grid-3">'+DATA.webCapabilities.map(function(c){return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon(c.id==='browser'?'globe':c.id==='search'?'search':c.id==='fetch'?'download':'route')+'</span><div><h3>'+esc(c.name)+'</h3><span>'+esc(c.description)+'</span></div>'+statusMarkup(c.routes[0].indexOf('not configured')>=0?'Setup needed':'Ready')+'</div><div class="pm3-kv"><span>Primary</span><span>'+esc(c.routes[0])+'</span></div><div class="pm3-kv"><span>Fallbacks</span><span>'+esc(c.routes.slice(1).join(' → '))+'</span></div><div class="pm3-inline-actions">'+button('Configure route',{className:'pm3-secondary-btn',icon:'sliders',attrs:'data-sim-action="Configure '+esc(c.name)+' route"'})+button('Test',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="web-'+esc(c.id)+'"'})+'</div></div>';}).join('')+'</div>';
    var capabilities = sectionWrap('capabilities','Capability routing','Choose a primary and ordered fallbacks independently for each web capability.',capabilityCards);
    var priority = sectionWrap('priority','Provider priority','Reorder providers per capability. Disabled or unhealthy routes are skipped without losing their configured place.',
      '<div class="pm3-card-grid-2">'+DATA.webCapabilities.slice(0,4).map(function(c){var order=state.routeOrders['web-'+c.id]||c.routes.slice();return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon('route')+'</span><div><h3>'+esc(c.name)+' priority</h3><span>Effective order for this project</span></div></div><div class="pm3-priority-list">'+order.map(function(r,i){return '<div class="pm3-priority-row"><span class="pm3-grip">⠿</span><span class="pm3-priority-num">'+(i+1)+'</span><span class="pm3-priority-copy"><strong>'+esc(r)+'</strong><span>'+(r.indexOf('not configured')>=0?'Setup required':'Available')+'</span></span>'+statusMarkup(r.indexOf('not configured')>=0?'Setup':'Ready')+'<span class="pm3-move-buttons"><button data-move-web="'+esc(c.id)+'" data-route-index="'+i+'" data-direction="up">'+icon('arrowUp')+'</button><button data-move-web="'+esc(c.id)+'" data-route-index="'+i+'" data-direction="down">'+icon('arrowDown')+'</button></span></div>';}).join('')+'</div></div>';}).join('')+'</div>');
    var tests = sectionWrap('test-lab','Test Lab','Run the exact capability with a safe sample, then inspect the provider used, duration, normalized output, and errors.',
      '<div class="pm3-panel-card"><div class="pm3-form-grid"><div class="pm3-field"><label>Capability</label><select><option>Search</option><option>Fetch</option><option>Crawl</option><option>Browser</option><option>Map</option><option>Extract</option></select></div><div class="pm3-field"><label>Provider route</label><select><option>Use configured priority</option><option>Claude Code</option><option>OpenAI Codex</option><option>Built-in Browser</option></select></div><div class="pm3-field" style="grid-column:1/-1"><label>Test input</label><input value="Search for the latest Slint migration guidance"></div></div><div class="pm3-inline-actions">'+button('Run test',{className:'pm3-primary-btn',icon:'test',attrs:'data-test-action="web-test-lab"'})+button('Clear result',{className:'pm3-secondary-btn',attrs:'data-sim-action="Clear web test result"'})+'</div></div>'+
      '<div class="pm3-panel-card"><h3>Last result</h3><div class="pm3-kv"><span>Route used</span><span>Claude Code · Web Search</span></div><div class="pm3-kv"><span>Duration</span><span>1.8 s</span></div><div class="pm3-kv"><span>Result</span><span>'+statusMarkup('Passed','ok')+'</span></div><p style="margin-top:8px">Search returned current primary-source documentation. No proxy, certificate, or credit guard was triggered.</p></div>');
    var policySettings = arr(INVENTORY.settings).filter(function(s){return s.cat==='web' && (s.sub==='fetch'||s.sub==='index');}).slice(0,12);
    var policy = sectionWrap('policy','Limits, privacy & caches','Timeouts, page and crawl limits, cost guards, proxy and certificate policy, caching, and session retention.', '<div class="pm3-settings-card">'+policySettings.map(renderSetting).join('')+'</div>');
    var diagnostics = sectionWrap('diagnostics','Diagnostics','See capability readiness without conflating provider sign-in, account entitlement, route policy, and invocation health.',
      '<table class="pm3-data-table"><thead><tr><th>Capability</th><th>Primary route</th><th>Setup</th><th>Invocation</th><th></th></tr></thead><tbody>'+DATA.webCapabilities.map(function(c){return '<tr><td><strong>'+esc(c.name)+'</strong></td><td>'+esc(c.routes[0])+'</td><td>'+statusMarkup(c.routes[0].indexOf('not configured')>=0?'Needs setup':'Ready')+'</td><td>'+statusMarkup('Passed','ok')+'</td><td>'+button('Inspect',{className:'pm3-secondary-btn',attrs:'data-sim-action="Inspect '+esc(c.name)+' diagnostics"'})+'</td></tr>';}).join('')+'</tbody></table>');
    return renderLongWorkbench(sections,overview+capabilities+priority+tests+policy+diagnostics);
  }

  function renderMedia() {
    var sections=[{id:'overview',label:'Overview',icon:'film'},{id:'routes',label:'Capability routes',icon:'route'},{id:'providers-models',label:'Providers & models',icon:'brain'},{id:'output',label:'Output & storage',icon:'folder'},{id:'test-lab',label:'Test Lab',icon:'flask'},{id:'diagnostics',label:'Diagnostics',icon:'gauge'}];
    var overview=sectionWrap('overview','Overview','Configure capabilities rather than another disconnected provider catalog.',
      '<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Routes ready</div><div class="pm3-stat-value">4 / 7</div><div class="pm3-stat-note">Three direct Gemini routes need an API key</div></div><div class="pm3-stat"><div class="pm3-stat-label">Providers projected</div><div class="pm3-stat-value">5</div><div class="pm3-stat-note">Shared with Providers & Accounts</div></div><div class="pm3-stat"><div class="pm3-stat-label">Default output</div><div class="pm3-stat-value" style="font-size:15px">Project artifacts</div><div class="pm3-stat-note">Files remain linked to the originating run</div></div></div>');
    var routes=sectionWrap('routes','Capability routes','Choose primary, fallback, output location, quality, and privacy for each media capability.',
      '<div class="pm3-card-grid-2">'+DATA.mediaCapabilities.map(function(c){return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon(c.icon)+'</span><div><h3>'+esc(c.name)+'</h3><span>'+esc(c.output)+'</span></div>'+statusMarkup(c.status)+'</div><div class="pm3-kv"><span>Primary</span><span>'+esc(c.primary)+'</span></div><div class="pm3-kv"><span>Fallback</span><span>'+esc(c.fallback)+'</span></div><div class="pm3-inline-actions">'+button('Configure route',{className:'pm3-secondary-btn',icon:'sliders',attrs:'data-sim-action="Configure '+esc(c.name)+'"'})+button('Test',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="media-'+esc(c.id)+'"'})+'</div></div>';}).join('')+'</div>');
    var pm=sectionWrap('providers-models','Providers & models','Only providers that advertise the required media capability appear. Setup stays owned by Providers & Accounts.',
      '<table class="pm3-data-table"><thead><tr><th>Provider</th><th>Capabilities</th><th>Account</th><th>Readiness</th><th></th></tr></thead><tbody>'+DATA.providers.filter(function(p){return p.capabilities.some(function(c){return ['Vision','Image','Video','Speech'].indexOf(c)>=0;});}).map(function(p){return '<tr><td><strong>'+esc(p.name)+'</strong></td><td>'+esc(p.capabilities.filter(function(c){return ['Vision','Image','Video','Speech'].indexOf(c)>=0;}).join(', '))+'</td><td>'+esc(p.account)+'</td><td>'+statusMarkup(p.status,p.tone)+'</td><td>'+button('Open provider',{className:'pm3-secondary-btn',attrs:'data-open-provider="'+esc(p.id)+'"'})+'</td></tr>';}).join('')+'</tbody></table>');
    var outputSettings=arr(INVENTORY.settings).filter(function(s){return s.cat==='media' && s.sub==='io';}).slice(0,14);
    var output=sectionWrap('output','Output formats, storage & naming','Choose output destinations and formats with pickers and structured selectors instead of opaque strings.', '<div class="pm3-settings-card">'+outputSettings.map(renderSetting).join('')+'</div>');
    var test=sectionWrap('test-lab','Test Lab','Run a safe sample with the selected route and inspect the exact provider, model, output, metadata, timing, and error detail.',
      '<div class="pm3-panel-card"><div class="pm3-form-grid"><div class="pm3-field"><label>Capability</label><select><option>Image generation</option><option>Image understanding</option><option>Speech input & transcription</option><option>Text-to-speech</option></select></div><div class="pm3-field"><label>Route</label><select><option>Use configured route</option><option>OpenAI Codex · GPT Image</option><option>Gemini Direct</option></select></div><div class="pm3-field" style="grid-column:1/-1"><label>Test prompt or file</label><textarea>Generate a clean settings icon on a transparent background.</textarea></div></div><div class="pm3-inline-actions">'+button('Run media test',{className:'pm3-primary-btn',icon:'test',attrs:'data-test-action="media-test-lab"'})+button('Choose input file',{className:'pm3-secondary-btn',icon:'folder',attrs:'data-sim-action="Choose media test input"'})+'</div></div>');
    var diagnostics=sectionWrap('diagnostics','Diagnostics','Separate provider setup, model entitlement, capability support, output permissions, and real generation health.',
      '<table class="pm3-data-table"><thead><tr><th>Route</th><th>Provider setup</th><th>Capability</th><th>Last test</th><th></th></tr></thead><tbody>'+DATA.mediaCapabilities.map(function(c){return '<tr><td>'+esc(c.name)+'</td><td>'+statusMarkup(c.status==='Ready'?'Ready':'Setup needed')+'</td><td>'+statusMarkup('Supported','ok')+'</td><td>'+esc(c.status==='Ready'?'Passed 12m ago':'Not run')+'</td><td>'+button('Inspect',{className:'pm3-secondary-btn',attrs:'data-sim-action="Inspect '+esc(c.name)+' diagnostics"'})+'</td></tr>';}).join('')+'</tbody></table>');
    return renderLongWorkbench(sections,overview+routes+pm+output+test+diagnostics);
  }

  function renderBSD() {
    var custom=[
      {id:'bsd.mode',label:'Advisor mode',desc:'Off stops observation, Auto advises when useful without blocking the primary run, and On keeps the advisor visibly engaged.',type:'radio',options:['Off','Auto','On'],default:'Auto',cat:'ai',sub:'oversight',tier:'simple'},
      {id:'bsd.glow',label:'Show advisor presence in Auto',desc:'Gently glows the Back Seat Driver icon while Auto is actively observing or preparing advice.',type:'toggle',default:true,cat:'ai',sub:'oversight',tier:'simple'},
      {id:'bsd.scope',label:'Observation scope',desc:'Choose which run evidence the advisor may inspect before offering guidance.',type:'multiselect',default:['Goal status','To-Dos','Diffs','Tests'],cat:'ai',sub:'oversight',tier:'simple'},
      {id:'bsd.intervention',label:'Intervention threshold',desc:'Controls how confident the advisor must be before interrupting with a visible recommendation.',type:'slider',default:68,cat:'ai',sub:'oversight',tier:'simple'},
      {id:'bsd.notifications',label:'Notify when advice is ready',desc:'Routes completed advisor guidance through Notifications & Sounds using the selected event mapping.',type:'toggle',default:true,cat:'ai',sub:'oversight',tier:'simple'},
      {id:'bsd.never-block',label:'Never block primary work',desc:'Keeps the advisor asynchronous; failure, timeout, or disagreement can never stop the main agent.',type:'toggle',default:true,cat:'ai',sub:'oversight',tier:'simple'}
    ]; custom.forEach(function(s){if(state.values[s.id]===undefined)state.values[s.id]=s.default;});
    var sections=[{id:'mode',label:'Mode & presence',icon:'eye'},{id:'scope',label:'Observation & evidence',icon:'layers'},{id:'intervention',label:'Advice behavior',icon:'bell'},{id:'health',label:'Health & diagnostics',icon:'gauge'}];
    var mode=sectionWrap('mode','Mode & presence','The simple Off / Auto / On choice remains prominent, with Auto as the default.', '<div class="pm3-settings-card">'+custom.slice(0,2).map(renderSetting).join('')+'</div>');
    var scope=sectionWrap('scope','Observation & evidence','Give the advisor enough context to help without silently broadening its access.', '<div class="pm3-settings-card">'+custom.slice(2,3).map(renderSetting).join('')+'</div><div class="pm3-panel-card" style="margin-top:9px"><h3>Current effective scope</h3><div class="pm3-capabilities"><span>Goal status</span><span>To-Dos</span><span>Subagents</span><span>Diffs</span><span>Test results</span><span>Context health</span></div><p style="margin-top:9px">Secrets, protected files, and provider credentials remain redacted before evidence reaches the advisor.</p></div>');
    var behavior=sectionWrap('intervention','Advice behavior','Control how eagerly advice appears and how it reaches you while preserving non-blocking operation.', '<div class="pm3-settings-card">'+custom.slice(3).map(renderSetting).join('')+'</div>');
    var health=sectionWrap('health','Health & diagnostics','The advisor is optional. Its errors are visible but cannot become a primary-run blocker.', '<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Status</div><div class="pm3-stat-value" style="color:var(--pm3-green)">Healthy</div><div class="pm3-stat-note">Observing in Auto</div></div><div class="pm3-stat"><div class="pm3-stat-label">Recent advice</div><div class="pm3-stat-value">4</div><div class="pm3-stat-note">2 accepted · 2 dismissed</div></div><div class="pm3-stat"><div class="pm3-stat-label">Primary blocks</div><div class="pm3-stat-value">0</div><div class="pm3-stat-note">Cannot block by contract</div></div></div><div class="pm3-inline-actions">'+button('Run health check',{className:'pm3-primary-btn',icon:'test',attrs:'data-test-action="bsd-health"'})+button('View recent advice',{className:'pm3-secondary-btn',icon:'history',attrs:'data-sim-action="Open advisor history"'})+'</div>');
    return renderLongWorkbench(sections,mode+scope+behavior+health);
  }

  function waveform() {
    var hs=[7,13,19,10,22,16,8,18,24,12,20,9,15,23,11,17,8,14];
    return '<span class="pm3-waveform">'+hs.map(function(h,i){return '<i style="--h:'+h+'px;--n:'+i+'"></i>';}).join('')+'</span>';
  }

  function renderNotifications() {
    var sections=[
      {id:'overview',label:'Overview',icon:'bell'}, {id:'destinations',label:'Destinations',icon:'route'},
      {id:'agents-events',label:'Agents & event routing',icon:'users'}, {id:'sounds',label:'Sounds & PeonPing',icon:'volume'},
      {id:'quiet-hours',label:'Quiet hours & focus',icon:'moon'}, {id:'testing-history',label:'Testing & history',icon:'flask'}
    ];
    var overviewSettings=[
      {id:'notify.master',label:'Master notification state',desc:'Turn all project notifications on, quiet, or off without deleting routes, agents, or mappings.',type:'radio',options:['On','Quiet','Off'],default:'On',cat:'general',sub:'notify',tier:'simple'},
      {id:'notify.system',label:'Use system notifications',desc:'Show supported notifications through the operating system notification center.',type:'toggle',default:true,cat:'general',sub:'notify',tier:'simple'},
      {id:'notify.badge',label:'Notification badge in dock / taskbar',desc:'Show the unread event count on the Puppet Master application icon.',type:'toggle',default:true,cat:'general',sub:'notify',tier:'simple'},
      {id:'notify.sounds',label:'Play sounds',desc:'Play the sound assigned to each event while respecting quiet hours and urgent-event policy.',type:'toggle',default:true,cat:'general',sub:'notify',tier:'simple'},
      {id:'notify.volume',label:'Default sound volume',desc:'Set the master preview and notification sound volume. Per-event mappings can adjust it further.',type:'slider',default:70,cat:'general',sub:'notify',tier:'simple'}
    ]; overviewSettings.forEach(function(s){if(state.values[s.id]===undefined)state.values[s.id]=s.default;});
    var overview=sectionWrap('overview','Overview','One manager controls where notifications go and which sounds play—without a second disconnected Sound Library destination.',
      '<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Delivery health</div><div class="pm3-stat-value" style="color:var(--pm3-green)">Healthy</div><div class="pm3-stat-note">4 active destinations</div></div><div class="pm3-stat"><div class="pm3-stat-label">Notification agents</div><div class="pm3-stat-value">3</div><div class="pm3-stat-note">Goal, Build, and Provider Watch</div></div><div class="pm3-stat"><div class="pm3-stat-label">Sound mappings</div><div class="pm3-stat-value">8</div><div class="pm3-stat-note">2 from PeonPing pack</div></div></div><div class="pm3-settings-card">'+overviewSettings.map(renderSetting).join('')+'</div>');
    var destinations=sectionWrap('destinations','Destinations','Connect, test, disable, repair, and remove each destination from one roster.',
      '<div class="pm3-card-grid-2">'+DATA.notificationDestinations.map(function(d){return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon(d.id==='system'?'window':d.id==='in-app'?'bell':'route')+'</span><div><h3>'+esc(d.name)+'</h3><span>'+esc(d.detail)+'</span></div>'+statusMarkup(d.status,d.state==='active'?'ok':'warning')+'</div><div class="pm3-inline-actions">'+(d.state==='active'?button('Send test',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="notify-'+esc(d.id)+'"'})+button('Configure',{className:'pm3-secondary-btn',icon:'sliders',attrs:'data-sim-action="Configure '+esc(d.name)+'"'}):button('Set up',{className:'pm3-primary-btn',icon:'plus',attrs:'data-sim-action="Set up '+esc(d.name)+'"'}))+'</div></div>';}).join('')+'</div>', button('Add destination',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="notification-destination"'}));
    var eventRows=[
      ['Goal completed',true,true,true,false],['Approval needed',true,true,true,true],['Agent blocked',true,true,true,true],['Provider limit reached',true,false,true,false],['Build failed',true,true,true,true],['Update available',true,false,false,false]
    ];
    var agents=sectionWrap('agents-events','Notification agents & event routing','Notification agents group related events, apply escalation, and route to destinations. Every mapping remains testable.',
      '<div class="pm3-card-grid-3"><div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-avatar">GA</span><div><h3>Goal Agent</h3><span>Goal, approval, blocker, and completion events</span></div>'+statusMarkup('Active','ok')+'</div><div class="pm3-inline-actions">'+button('Configure',{className:'pm3-secondary-btn',attrs:'data-sim-action="Configure Goal Agent"'})+'</div></div><div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-avatar">BA</span><div><h3>Build Agent</h3><span>Build, test, audit, and deployment events</span></div>'+statusMarkup('Active','ok')+'</div><div class="pm3-inline-actions">'+button('Configure',{className:'pm3-secondary-btn',attrs:'data-sim-action="Configure Build Agent"'})+'</div></div><div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-avatar">PW</span><div><h3>Provider Watch</h3><span>Limits, resets, sign-in, and invocation health</span></div>'+statusMarkup('Active','ok')+'</div><div class="pm3-inline-actions">'+button('Configure',{className:'pm3-secondary-btn',attrs:'data-sim-action="Configure Provider Watch"'})+'</div></div></div>'+
      '<div class="pm3-panel-card" style="margin-top:9px"><div class="pm3-panel-card-head"><h3>Event-to-destination map</h3><div class="pm3-actions-right">'+button('Add event rule',{className:'pm3-primary-btn',icon:'plus',attrs:'data-sim-action="Add notification event rule"'})+'</div></div><div class="pm3-event-matrix"><div class="pm3-event-cell">Event</div><div class="pm3-event-cell">In app</div><div class="pm3-event-cell">System</div><div class="pm3-event-cell">Discord</div><div class="pm3-event-cell">Urgent</div>'+eventRows.map(function(r,ri){return '<div class="pm3-event-cell"><strong>'+esc(r[0])+'</strong></div>'+r.slice(1).map(function(v,ci){var key='event-'+ri+'-'+ci;if(state.checks[key]===undefined)state.checks[key]=v;return '<div class="pm3-event-cell"><button type="button" class="pm3-check" aria-pressed="'+(state.checks[key]?'true':'false')+'" data-check="'+esc(key)+'">'+icon('check')+'</button></div>';}).join('');}).join('')+'</div></div>');
    var sounds=sectionWrap('sounds','Sounds, mappings & PeonPing','Upload, play, validate, rename, replace, export, delete, and assign sounds. Imported PeonPing packs remain visibly identified.',
      '<div class="pm3-card-grid-2"><div class="pm3-panel-card"><div class="pm3-panel-card-head"><h3>Sound Library</h3><div class="pm3-actions-right">'+button('Upload sound',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="sound-upload"'})+'</div></div>'+DATA.sounds.map(function(s){return '<div class="pm3-sound-row '+(state.soundPlaying===s.id?'is-playing':'')+'"><button type="button" class="pm3-play" data-play-sound="'+esc(s.id)+'" title="Play '+esc(s.name)+'">'+icon(state.soundPlaying===s.id?'volume':'play')+'</button><span class="pm3-sound-copy"><strong>'+esc(s.name)+'</strong><span>'+esc(s.source)+' · '+esc(s.duration)+(s.assigned.length?' · '+esc(s.assigned.join(', ')):' · Unassigned')+'</span></span>'+waveform()+button('Manage',{className:'pm3-secondary-btn',attrs:'data-sim-action="Manage '+esc(s.name)+'"'})+'</div>';}).join('')+'</div>'+
      '<div><div class="pm3-panel-card"><div class="pm3-panel-card-head"><h3>PeonPing / OpenPeon packs</h3><div class="pm3-actions-right">'+button('Import pack',{className:'pm3-primary-btn',icon:'download',attrs:'data-modal-open="peon-pack"'})+'</div></div><p>Import a compatible pack with format, provenance, license, duplicate, and file validation before any sound becomes available.</p><div class="pm3-kv"><span>PeonPing Essentials</span><span>'+statusMarkup('Installed · 12 sounds','ok')+'</span></div><div class="pm3-kv"><span>Last validation</span><span>Passed 3 days ago</span></div><div class="pm3-inline-actions">'+button('Preview pack',{className:'pm3-secondary-btn',icon:'play',attrs:'data-sim-action="Preview PeonPing pack"'})+button('Export pack',{className:'pm3-secondary-btn',icon:'download',attrs:'data-sim-action="Export PeonPing pack"'})+'</div></div><div class="pm3-panel-card"><h3>Event sound assignments</h3>'+['Goal completed','Approval needed','Agent blocked','Provider limit reached','Build completed'].map(function(e,i){return '<div class="pm3-kv"><span>'+esc(e)+'</span><span><select class="pm3-control-select"><option>'+esc(DATA.sounds[i%DATA.sounds.length].name)+'</option><option>None</option>'+DATA.sounds.map(function(s){return '<option>'+esc(s.name)+'</option>';}).join('')+'</select></span></div>';}).join('')+'<div class="pm3-inline-actions">'+button('Test exact mapping',{className:'pm3-primary-btn',icon:'test',attrs:'data-test-action="sound-mapping"'})+'</div></div></div></div>');
    var quietSettings=[
      {id:'notify.quiet.enabled',label:'Quiet hours',desc:'Suppress non-urgent sounds and external delivery during a schedule while keeping events in the in-app inbox.',type:'toggle',default:true,cat:'general',sub:'quiet',tier:'simple'},
      {id:'notify.quiet.schedule',label:'Schedule',desc:'Choose the quiet-hours start and end using a structured schedule picker.',type:'action',default:'10:00 PM – 7:00 AM',cat:'general',sub:'quiet',tier:'simple'},
      {id:'notify.quiet.urgent',label:'Allow urgent events',desc:'Approval, blocked, security, and build-failure events can bypass quiet hours when explicitly marked urgent.',type:'toggle',default:true,cat:'general',sub:'quiet',tier:'simple'},
      {id:'notify.quiet.focus',label:'Follow system focus mode',desc:'Respect the operating system focus state in addition to the project schedule.',type:'toggle',default:true,cat:'general',sub:'quiet',tier:'simple'}
    ]; quietSettings.forEach(function(s){if(state.values[s.id]===undefined)state.values[s.id]=s.default;});
    var quiet=sectionWrap('quiet-hours','Quiet hours & focus','Schedules, project behavior, urgent-event exceptions, and system focus mode are configured together.', '<div class="pm3-settings-card">'+quietSettings.map(renderSetting).join('')+'</div>');
    var testing=sectionWrap('testing-history','Testing & delivery history','Test the exact event, agent, destination, and sound combination, then inspect delivery attempts and failures.',
      '<div class="pm3-panel-card"><div class="pm3-form-grid"><div class="pm3-field"><label>Event</label><select><option>Goal completed</option><option>Approval needed</option><option>Agent blocked</option><option>Provider limit reached</option></select></div><div class="pm3-field"><label>Notification agent</label><select><option>Goal Agent</option><option>Build Agent</option><option>Provider Watch</option></select></div><div class="pm3-field"><label>Destination</label><select><option>Discord</option><option>System notifications</option><option>In-app inbox</option></select></div><div class="pm3-field"><label>Sound</label><select>'+DATA.sounds.map(function(s){return '<option>'+esc(s.name)+'</option>';}).join('')+'</select></div></div><div class="pm3-inline-actions">'+button('Send full test',{className:'pm3-primary-btn',icon:'test',attrs:'data-test-action="notification-full"'})+button('Preview sound only',{className:'pm3-secondary-btn',icon:'play',attrs:'data-play-sound="pm-soft-chime"'})+'</div></div>'+
      '<table class="pm3-data-table"><thead><tr><th>When</th><th>Event</th><th>Route</th><th>Result</th><th></th></tr></thead><tbody><tr><td>2m ago</td><td>Goal completed</td><td>Goal Agent → Discord</td><td>'+statusMarkup('Delivered','ok')+'</td><td>'+button('Receipt',{className:'pm3-secondary-btn',attrs:'data-sim-action="Open delivery receipt"'})+'</td></tr><tr><td>18m ago</td><td>Provider limit reached</td><td>Provider Watch → System</td><td>'+statusMarkup('Delivered','ok')+'</td><td>'+button('Receipt',{className:'pm3-secondary-btn',attrs:'data-sim-action="Open delivery receipt"'})+'</td></tr><tr><td>Yesterday</td><td>Build failed</td><td>Build Agent → Slack</td><td>'+statusMarkup('Not configured','warning')+'</td><td>'+button('Repair',{className:'pm3-secondary-btn',attrs:'data-sim-action="Repair Slack destination"'})+'</td></tr></tbody></table>');
    return renderLongWorkbench(sections,overview+destinations+agents+sounds+quiet+testing);
  }

  function renderSourceControl() {
    var sections=[
      {id:'overview',label:'Overview',icon:'branch'},{id:'local-tools',label:'Git, Jujutsu & LFS',icon:'terminal'},
      {id:'forges',label:'Hosted connections',icon:'globe'},{id:'repositories',label:'Repository & remotes',icon:'folder'},
      {id:'worktrees',label:'Worktrees',icon:'layers'},{id:'policies',label:'Branch & push policy',icon:'shield'},
      {id:'actions',label:'GitHub Actions',icon:'bolt'},{id:'ssh-lfs',label:'SSH, LFS & recovery',icon:'lock'}
    ];
    var overview=sectionWrap('overview','Source Control','A first-class domain for local tools, hosted forges, repositories, worktrees, automation, and safety policy.',
      '<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Repository</div><div class="pm3-stat-value" style="font-size:16px">Puppet-Master</div><div class="pm3-stat-note">GitHub · main · synced</div></div><div class="pm3-stat"><div class="pm3-stat-label">Local tools</div><div class="pm3-stat-value">2 ready</div><div class="pm3-stat-note">Git + Jujutsu · LFS needs one repair</div></div><div class="pm3-stat"><div class="pm3-stat-label">Active worktrees</div><div class="pm3-stat-value">3</div><div class="pm3-stat-note">One Goal run · one Auditor</div></div></div><div class="pm3-panel-card"><h3>Repository status</h3><div class="pm3-kv"><span>Remote</span><span>GitHub · sittingmongoose/Puppet-Master</span></div><div class="pm3-kv"><span>Current branch</span><span>concept/settings-12</span></div><div class="pm3-kv"><span>Changes</span><span>7 modified · 5 new</span></div><div class="pm3-kv"><span>Default source-control engine</span><span>Jujutsu with Git interoperability</span></div></div>');
    var local=sectionWrap('local-tools','Git, Jujutsu & Git LFS','Install, update, repair, verify, and choose local source-control tools per execution environment.',
      '<div class="pm3-card-grid-3">'+DATA.sourceControl.localTools.map(function(t){return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon(t.id==='jujutsu'?'cycle':'branch')+'</span><div><h3>'+esc(t.name)+'</h3><span>'+esc(t.install)+' · '+esc(t.version)+'</span></div>'+statusMarkup(t.status,t.state==='active'?'ok':'warning')+'</div><div class="pm3-kv"><span>Available on</span><span>'+esc(t.hosts.join(', '))+'</span></div><div class="pm3-inline-actions">'+button('Verify',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="scm-'+esc(t.id)+'"'})+button(t.state==='active'?'Update':'Repair',{className:t.state==='active'?'pm3-secondary-btn':'pm3-primary-btn',icon:t.state==='active'?'download':'refresh',attrs:'data-sim-action="'+(t.state==='active'?'Update ':'Repair ')+esc(t.name)+'"'})+'</div></div>';}).join('')+'</div>'+
      '<div class="pm3-panel-card" style="margin-top:9px"><h3>Default tool & interoperability</h3><div class="pm3-kv"><span>Default source-control engine</span><span><select class="pm3-control-select"><option>Jujutsu</option><option>Git</option></select></span></div><div class="pm3-kv"><span>Git compatibility</span><span>'+statusMarkup('Enabled','ok')+'</span></div><div class="pm3-kv"><span>Commit signing</span><span>SSH key · enabled</span></div></div>');
    var forges=sectionWrap('forges','Hosted forge connections','Connect, reconnect, test, revoke, and remove hosted services. GitHub is visible immediately and remains distinct from local Git installation.',
      '<div class="pm3-card-grid-2">'+DATA.sourceControl.forges.map(function(f){return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-avatar">'+esc(f.name.split(' ').map(function(x){return x[0];}).join('').slice(0,2))+'</span><div><h3>'+esc(f.name)+'</h3><span>'+esc(f.account)+'</span></div>'+statusMarkup(f.status,f.state==='active'?'ok':'warning')+'</div><div class="pm3-kv"><span>Scopes</span><span>'+esc(f.scopes)+'</span></div><div class="pm3-kv"><span>Repositories found</span><span>'+esc(f.repositories)+'</span></div><div class="pm3-inline-actions">'+(f.state==='active'?button('Test connection',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="forge-'+esc(f.id)+'"'})+button('Manage accounts',{className:'pm3-secondary-btn',icon:'users',attrs:'data-sim-action="Manage '+esc(f.name)+' accounts"'}):button('Connect',{className:'pm3-primary-btn',icon:'link',attrs:'data-sim-action="Connect '+esc(f.name)+'"'}))+'</div></div>';}).join('')+'</div>',button('Add connection',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="forge-connect"'}));
    var repositories=sectionWrap('repositories','Repository & remotes','Inspect repository identity, hosted remotes, import/export paths, default branch, and sync state.',
      '<div class="pm3-panel-card"><div class="pm3-panel-card-head"><h3>Puppet-Master</h3><div class="pm3-actions-right">'+button('Open repository',{className:'pm3-secondary-btn',icon:'folder',attrs:'data-sim-action="Open repository"'})+button('Add remote',{className:'pm3-primary-btn',icon:'plus',attrs:'data-sim-action="Add remote"'})+'</div></div><div class="pm3-kv"><span>Path</span><span>/mnt/Cursor/Puppet Master</span></div><div class="pm3-kv"><span>Primary remote</span><span>origin · GitHub</span></div><div class="pm3-kv"><span>Default branch</span><span>main</span></div><div class="pm3-kv"><span>Working-copy engine</span><span>Jujutsu</span></div><div class="pm3-kv"><span>Remote state</span><span>'+statusMarkup('Synced','ok')+'</span></div></div>'+
      '<table class="pm3-data-table"><thead><tr><th>Remote</th><th>Service</th><th>Fetch</th><th>Push</th><th>Status</th><th></th></tr></thead><tbody><tr><td><strong>origin</strong></td><td>GitHub</td><td>git@github.com:sittingmongoose/Puppet-Master.git</td><td>Same</td><td>'+statusMarkup('Ready','ok')+'</td><td>'+button('Edit',{className:'pm3-secondary-btn',attrs:'data-sim-action="Edit origin remote"'})+'</td></tr><tr><td><strong>backup</strong></td><td>Home Git</td><td>ssh://home/Puppet-Master.git</td><td>Same</td><td>'+statusMarkup('Ready','ok')+'</td><td>'+button('Edit',{className:'pm3-secondary-btn',attrs:'data-sim-action="Edit backup remote"'})+'</td></tr></tbody></table>');
    var worktrees=sectionWrap('worktrees','Worktrees','Create, inspect, lease, transfer, preserve, and clean worktrees without losing uncommitted patches.',
      '<table class="pm3-data-table"><thead><tr><th>Worktree</th><th>Branch / change</th><th>Owner</th><th>Path</th><th>State</th><th></th></tr></thead><tbody>'+DATA.sourceControl.worktrees.map(function(w){return '<tr><td><strong>'+esc(w.name)+'</strong><div style="font-size:9px;color:var(--pm3-muted)">'+esc(w.age)+'</div></td><td>'+esc(w.branch)+'</td><td>'+esc(w.owner)+'</td><td>'+esc(w.path)+'</td><td>'+statusMarkup(w.state)+'</td><td>'+button('Manage',{className:'pm3-secondary-btn',attrs:'data-sim-action="Manage '+esc(w.name)+' worktree"'})+'</td></tr>';}).join('')+'</tbody></table>',button('Create worktree',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="worktree-create"'}));
    var policySettings=[
      {id:'scm.test-before-merge',label:'Require tests before merge',desc:'Blocks a merge until the selected validation surfaces pass or an explicit override receipt is approved.',type:'toggle',default:true,cat:'branching',sub:'policy',tier:'simple'},
      {id:'scm.push-policy',label:'Push policy',desc:'Choose whether successful goals may push automatically, prepare a push for review, or never push.',type:'radio',options:['Prepare for review','Auto after gates','Never'],default:'Prepare for review',cat:'branching',sub:'policy',tier:'simple'},
      {id:'scm.force-push',label:'Force-push protection',desc:'Prevents non-fast-forward pushes unless the branch policy and a separate approval permit it.',type:'toggle',default:true,cat:'branching',sub:'policy',tier:'simple'},
      {id:'scm.protected-branches',label:'Protected branches',desc:'Manage exact branch patterns and the rules applied to them using a structured list.',type:'list',default:['main','release/*'],cat:'branching',sub:'policy',tier:'simple'},
      {id:'scm.cleanup',label:'Automatic worktree cleanup',desc:'Removes only safe, released worktrees after preserving patches and producing a cleanup receipt.',type:'radio',options:['After approval','Auto when safe','Off'],default:'After approval',cat:'branching',sub:'policy',tier:'simple'}
    ]; policySettings.forEach(function(s){if(state.values[s.id]===undefined)state.values[s.id]=s.default;});
    var policies=sectionWrap('policies','Branch, merge & push policy','Configure high-impact operations with explicit controls and effective-state explanations.', '<div class="pm3-settings-card">'+policySettings.map(renderSetting).join('')+'</div>');
    var actions=sectionWrap('actions','GitHub Actions','Connect workflows, pin important checks, inspect readiness and recent runs, open logs, and trigger authorized workflows.',
      '<div class="pm3-panel-card"><div class="pm3-panel-card-head"><h3>GitHub Actions connection</h3><div class="pm3-actions-right">'+button('Refresh workflows',{className:'pm3-secondary-btn',icon:'refresh',attrs:'data-test-action="actions-refresh"'})+'</div></div><div class="pm3-kv"><span>Account</span><span>sittingmongoose</span></div><div class="pm3-kv"><span>Workflow scope</span><span>repo + workflow</span></div><div class="pm3-kv"><span>Readiness</span><span>'+statusMarkup('Ready','ok')+'</span></div></div>'+
      '<table class="pm3-data-table"><thead><tr><th>Workflow</th><th>Branch</th><th>Last run</th><th>Status</th><th></th></tr></thead><tbody>'+DATA.sourceControl.workflows.map(function(w){return '<tr><td><strong>'+esc(w.name)+'</strong></td><td>'+esc(w.branch)+'</td><td>'+esc(w.last)+'</td><td>'+statusMarkup(w.state)+'</td><td>'+button(w.state==='running'?'Watch':'Open',{className:'pm3-secondary-btn',attrs:'data-sim-action="Open '+esc(w.name)+' workflow"'})+'</td></tr>';}).join('')+'</tbody></table>');
    var ssh=sectionWrap('ssh-lfs','SSH, LFS & recovery','Manage credentials, signing, large-file support, recovery, reflog behavior, and safe repair without exposing secrets.',
      '<div class="pm3-card-grid-2"><div class="pm3-panel-card"><h3>SSH keys & signing</h3><div class="pm3-kv"><span>GitHub authentication</span><span>'+statusMarkup('SSH verified','ok')+'</span></div><div class="pm3-kv"><span>Commit signing</span><span>'+statusMarkup('Enabled','ok')+'</span></div><div class="pm3-kv"><span>Key</span><span>SHA256:8f…2a · redacted</span></div><div class="pm3-inline-actions">'+button('Test SSH',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="ssh-test"'})+button('Manage keys',{className:'pm3-secondary-btn',icon:'lock',attrs:'data-sim-action="Manage SSH keys"'})+'</div></div><div class="pm3-panel-card"><h3>Git LFS</h3><div class="pm3-kv"><span>This Mac</span><span>'+statusMarkup('Ready','ok')+'</span></div><div class="pm3-kv"><span>Home TrueNAS</span><span>'+statusMarkup('Ready','ok')+'</span></div><div class="pm3-kv"><span>Windows WSL</span><span>'+statusMarkup('Missing','warning')+'</span></div><div class="pm3-inline-actions">'+button('Repair WSL install',{className:'pm3-primary-btn',icon:'refresh',attrs:'data-sim-action="Repair Git LFS on Windows WSL"'})+'</div></div></div>'+
      '<div class="pm3-panel-card" style="margin-top:9px"><h3>Recovery</h3><p>Before destructive cleanup, Puppet Master preserves uncommitted patches, records the current revision or change ID, and keeps reflog or Jujutsu operation-log recovery available.</p><div class="pm3-inline-actions">'+button('Inspect recovery points',{className:'pm3-secondary-btn',icon:'history',attrs:'data-sim-action="Inspect source-control recovery points"'})+button('Run integrity check',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="scm-integrity"'})+'</div></div>');
    return renderLongWorkbench(sections,overview+local+forges+repositories+worktrees+policies+actions+ssh);
  }

  function toolTable(items, columns, actionLabel) {
    return '<table class="pm3-data-table"><thead><tr>'+columns.map(function(c){return '<th>'+esc(c.label)+'</th>';}).join('')+'<th></th></tr></thead><tbody>'+items.map(function(item){return '<tr>'+columns.map(function(c){var val=item[c.key];if(c.status)return '<td>'+statusMarkup(val)+'</td>';return '<td>'+(c.strong?'<strong>'+esc(val)+'</strong>':esc(val))+'</td>';}).join('')+'<td>'+button(actionLabel||'Manage',{className:'pm3-secondary-btn',attrs:'data-sim-action="Manage '+esc(item.name)+'"'})+'</td></tr>';}).join('')+'</tbody></table>';
  }

  function renderToolchain() {
    var sections=[
      {id:'lsp',label:'Language Servers',icon:'code'},{id:'formatters',label:'Formatters',icon:'wand'},
      {id:'commands',label:'Commands & Shortcuts',icon:'command'},{id:'mcp',label:'MCP Servers',icon:'server'},
      {id:'skills',label:'Skills',icon:'sparkles'},{id:'plugins',label:'Plugins',icon:'puzzle'},{id:'tools',label:'Agent Tools',icon:'tool'}
    ];
    var lsp=sectionWrap('lsp','Language Servers','Map languages, install per host, activate, restart, inspect logs, and test a real document.',
      toolTable(DATA.toolchain.lsp,[{label:'Server',key:'name',strong:true},{label:'Language',key:'language'},{label:'Host',key:'host'},{label:'Version',key:'version'},{label:'State',key:'state',status:true}],'Open'),
      button('Add language server',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="lsp-add"'})+button('Restart all',{className:'pm3-secondary-btn',icon:'refresh',attrs:'data-test-action="lsp-restart-all"'}));
    var fmt=sectionWrap('formatters','Formatters','Choose per-language defaults and ordered fallback, verify executable readiness, and preview the exact change.',
      '<div class="pm3-card-grid-2">'+DATA.toolchain.formatters.map(function(f){return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon('wand')+'</span><div><h3>'+esc(f.name)+'</h3><span>'+esc(f.language)+'</span></div>'+statusMarkup(f.state,'ok')+'</div><div class="pm3-kv"><span>Priority</span><span>#'+esc(f.priority)+'</span></div><div class="pm3-kv"><span>Behavior</span><span>'+esc(f.detail)+'</span></div><div class="pm3-inline-actions">'+button('Preview',{className:'pm3-secondary-btn',icon:'eye',attrs:'data-sim-action="Preview '+esc(f.name)+' format"'})+button('Test',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="formatter-'+esc(f.id)+'"'})+'</div></div>';}).join('')+'</div>',
      button('Add formatter',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="formatter-add"'}));
    var commands=sectionWrap('commands','Commands & Shortcuts','Search the command catalog, record a shortcut, resolve conflicts, reset individual bindings, and import or export mappings.',
      toolTable(DATA.toolchain.commands,[{label:'Command',key:'name',strong:true},{label:'Shortcut',key:'shortcut'},{label:'State',key:'state',status:true},{label:'Detail',key:'detail'}],'Edit')+
      '<div class="pm3-panel-card" style="margin-top:9px"><div class="pm3-panel-card-head"><h3>Shortcut recorder</h3><div class="pm3-actions-right">'+button('Record shortcut',{className:'pm3-primary-btn',icon:'command',attrs:'data-record-shortcut'})+'</div></div><p>Press a key combination after starting the recorder. Puppet Master shows exact conflicts and offers reassignment rather than saving an ambiguous string.</p><div class="pm3-inline-actions">'+button('Import mappings',{className:'pm3-secondary-btn',icon:'download',attrs:'data-sim-action="Import shortcut mappings"'})+button('Export mappings',{className:'pm3-secondary-btn',icon:'download',attrs:'data-sim-action="Export shortcut mappings"'})+'</div></div>',
      button('Create command',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="command-add"'}));
    var mcp=sectionWrap('mcp','MCP Servers','Add server transport, command or URL, environment, authentication, exposed tools, permissions, tests, and logs.',
      toolTable(DATA.toolchain.mcp,[{label:'Server',key:'name',strong:true},{label:'Transport',key:'transport'},{label:'Tools',key:'tools'},{label:'State',key:'state',status:true},{label:'Detail',key:'detail'}],'Inspect')+
      '<div class="pm3-panel-card" style="margin-top:9px"><h3>Effective permissions</h3><p>MCP tool permissions are projected through Permissions & FileSafe. Adding a server never silently grants its tools access to the project.</p><div class="pm3-inline-actions">'+button('Simulate tool access',{className:'pm3-secondary-btn',icon:'shield',attrs:'data-sim-action="Simulate MCP permission"'})+button('View server logs',{className:'pm3-secondary-btn',icon:'file',attrs:'data-sim-action="Open MCP logs"'})+'</div></div>',
      button('Add MCP server',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="mcp-add"'}));
    var skills=sectionWrap('skills','Skills','Install or import, enable, scope, check requirements, update, remove, and test each skill.',
      '<div class="pm3-card-grid-3">'+DATA.toolchain.skills.map(function(s){return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon('sparkles')+'</span><div><h3>'+esc(s.name)+'</h3><span>'+esc(s.scope)+'</span></div>'+statusMarkup(s.state,'ok')+'</div><p>'+esc(s.detail)+'</p><div class="pm3-inline-actions">'+button('Test',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="skill-'+esc(s.id)+'"'})+button('Manage',{className:'pm3-secondary-btn',attrs:'data-sim-action="Manage '+esc(s.name)+'"'})+'</div></div>';}).join('')+'</div>',
      button('Install or import skill',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="skill-add"'}));
    var plugins=sectionWrap('plugins','Plugins','Connect external apps, review permissions, enable or disable, update, diagnose compatibility, and uninstall.',
      '<div class="pm3-card-grid-3">'+DATA.toolchain.plugins.map(function(p){return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon('puzzle')+'</span><div><h3>'+esc(p.name)+'</h3><span>'+esc(p.permissions)+'</span></div>'+statusMarkup(p.state,p.state==='active'?'ok':'muted')+'</div><p>'+esc(p.detail)+'</p><div class="pm3-inline-actions">'+button(p.state==='active'?'Manage':'Connect',{className:p.state==='active'?'pm3-secondary-btn':'pm3-primary-btn',icon:p.state==='active'?'sliders':'link',attrs:'data-sim-action="'+(p.state==='active'?'Manage ':'Connect ')+esc(p.name)+'"'})+'</div></div>';}).join('')+'</div>',
      button('Find plugins',{className:'pm3-primary-btn',icon:'search',attrs:'data-sim-action="Find plugins"'}));
    var tools=sectionWrap('tools','Agent Tools','See capability, permission policy, availability, priority, test state, and the provider, plugin, or MCP server that owns each tool.',
      toolTable(DATA.toolchain.tools,[{label:'Tool',key:'name',strong:true},{label:'Owner',key:'owner'},{label:'State',key:'state',status:true},{label:'Capability',key:'detail'}],'Configure')+
      '<div class="pm3-panel-card" style="margin-top:9px"><h3>Shared capability ownership</h3><p>Web, Media, Providers, Plugins, and MCP servers all project through one tool and capability registry. A tool is configured once at its owner and referenced everywhere else.</p></div>');
    return renderLongWorkbench(sections,lsp+fmt+commands+mcp+skills+plugins+tools);
  }

  function renderPermissions() {
    var sections=[
      {id:'overview',label:'Overview',icon:'shield'},{id:'profiles',label:'Permission profiles',icon:'layers'},
      {id:'tools',label:'Tool permissions',icon:'tool'},{id:'filesafe',label:'FileSafe boundaries',icon:'lock'},
      {id:'approvals',label:'Approvals & runaway guard',icon:'bell'},{id:'simulation',label:'Policy simulation',icon:'flask'},
      {id:'effective',label:'Effective policy',icon:'eye'}
    ];
    var overview=sectionWrap('overview','Permissions & FileSafe','Configure safety around tasks rather than decoding a wall of raw rules.',
      '<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Active profile</div><div class="pm3-stat-value" style="font-size:16px">Balanced</div><div class="pm3-stat-note">Project profile · 3 overrides</div></div><div class="pm3-stat"><div class="pm3-stat-label">Protected paths</div><div class="pm3-stat-value">14</div><div class="pm3-stat-note">Secrets, governance, and system files</div></div><div class="pm3-stat"><div class="pm3-stat-label">Recent approvals</div><div class="pm3-stat-value">6</div><div class="pm3-stat-note">5 approved · 1 denied</div></div></div><div class="pm3-panel-card"><h3>Current behavior</h3><p>Normal project edits and safe tests run automatically. External directories, destructive commands, secret access, paid overage, force pushes, and permission expansion require explicit authority.</p></div>');
    var profiles=sectionWrap('profiles','Permission profiles','Choose a clear starting point, then inspect project-specific differences without losing the effective result.',
      '<div class="pm3-card-grid-3"><div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon('shield')+'</span><div><h3>Balanced</h3><span>Recommended default</span></div>'+statusMarkup('Active','ok')+'</div><p>Automatically handles ordinary project work and tests. Asks for external, destructive, privileged, or paid operations.</p><div class="pm3-inline-actions">'+button('Review profile',{className:'pm3-secondary-btn',attrs:'data-sim-action="Review Balanced profile"'})+'</div></div><div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon('lock')+'</span><div><h3>Conservative</h3><span>More approval gates</span></div>'+statusMarkup('Available','muted')+'</div><p>Asks before commands, network writes, new tools, or broader filesystem access.</p><div class="pm3-inline-actions">'+button('Use profile',{className:'pm3-secondary-btn',attrs:'data-sim-action="Use Conservative profile"'})+'</div></div><div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon('bolt')+'</span><div><h3>Hands-off</h3><span>Maximum approved autonomy</span></div>'+statusMarkup('Available','muted')+'</div><p>Runs more tasks automatically while retaining non-bypassable protected-path and destructive-operation boundaries.</p><div class="pm3-inline-actions">'+button('Use profile',{className:'pm3-secondary-btn',attrs:'data-sim-action="Use Hands-off profile"'})+'</div></div></div>');
    var toolRows=[
      ['Terminal commands','Allow inside project','Ask for destructive or external'],['Built-in Browser','Allow read and interaction','Ask before account or paid action'],['Git & Jujutsu','Allow ordinary operations','Ask before force push or protected branch'],['MCP tools','Per-server policy','FileSafe still applies'],['Media generation','Allow configured routes','Ask before paid overage'],['Package installation','Ask','Official source and rollback required']
    ];
    var tools=sectionWrap('tools','Tool permissions','Set capability policy with structured choices. Raw command and tool identifiers remain available only in advanced details.',
      '<table class="pm3-data-table"><thead><tr><th>Capability</th><th>Policy</th><th>Boundary</th><th></th></tr></thead><tbody>'+toolRows.map(function(r){return '<tr><td><strong>'+esc(r[0])+'</strong></td><td><select class="pm3-control-select"><option>'+esc(r[1])+'</option><option>Ask every time</option><option>Block</option></select></td><td>'+esc(r[2])+'</td><td>'+button('Details',{className:'pm3-secondary-btn',attrs:'data-sim-action="Explain '+esc(r[0])+' permission"'})+'</td></tr>';}).join('')+'</tbody></table>');
    var filesafe=sectionWrap('filesafe','FileSafe boundaries','Manage protected and allowed paths with a structured ordered list, scope, reason, and test—not an unvalidated path string.',
      '<div class="pm3-panel-card"><div class="pm3-panel-card-head"><h3>Protected boundaries</h3><div class="pm3-actions-right">'+button('Add boundary',{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="filesafe-add"'})+'</div></div><p>Rules are evaluated in order. The winning rule and source remain visible in the effective policy view.</p></div><table class="pm3-data-table"><thead><tr><th>Path or pattern</th><th>Scope</th><th>Effect</th><th>Reason</th><th></th></tr></thead><tbody><tr><td><strong>Plans/Spec_Lock.json</strong></td><td>Project</td><td>'+statusMarkup('Protected','warning')+'</td><td>Governance seal</td><td>'+button('Inspect',{className:'pm3-secondary-btn',attrs:'data-sim-action="Inspect Spec Lock FileSafe rule"'})+'</td></tr><tr><td><strong>.env*</strong></td><td>Project</td><td>'+statusMarkup('Read redacted','warning')+'</td><td>Secrets</td><td>'+button('Inspect',{className:'pm3-secondary-btn',attrs:'data-sim-action="Inspect secret rule"'})+'</td></tr><tr><td><strong>/mnt/Cursor/Puppet Master/**</strong></td><td>Project root</td><td>'+statusMarkup('Allowed','ok')+'</td><td>Normal project work</td><td>'+button('Inspect',{className:'pm3-secondary-btn',attrs:'data-sim-action="Inspect project rule"'})+'</td></tr><tr><td><strong>Outside project root</strong></td><td>System</td><td>'+statusMarkup('Ask','warning')+'</td><td>External directory boundary</td><td>'+button('Inspect',{className:'pm3-secondary-btn',attrs:'data-sim-action="Inspect external rule"'})+'</td></tr></tbody></table>');
    var approvalSettings=[
      {id:'perm.destructive',label:'Destructive command approval',desc:'Ask before commands that delete, overwrite, reset, force, or otherwise risk unrecoverable project state.',type:'toggle',default:true,cat:'safety',sub:'approvals',tier:'simple'},
      {id:'perm.external',label:'External directory approval',desc:'Ask before reading or writing outside the project and explicitly trusted locations.',type:'toggle',default:true,cat:'safety',sub:'approvals',tier:'simple'},
      {id:'perm.paid',label:'Paid usage approval',desc:'Ask before crossing from included or free usage into a paid provider route.',type:'toggle',default:true,cat:'safety',sub:'approvals',tier:'simple'},
      {id:'perm.loop',label:'Stuck-loop guard',desc:'Pause a run after repeated equivalent failures and show the evidence instead of spending indefinitely.',type:'number',default:4,cat:'safety',sub:'approvals',tier:'simple'},
      {id:'perm.timeout',label:'Approval timeout behavior',desc:'Choose what happens when a requested approval receives no response.',type:'radio',options:['Pause safely','Deny','Use profile default'],default:'Pause safely',cat:'safety',sub:'approvals',tier:'simple'}
    ]; approvalSettings.forEach(function(s){if(state.values[s.id]===undefined)state.values[s.id]=s.default;});
    var approvals=sectionWrap('approvals','Approvals & runaway guard','High-impact actions pause with reason, proposed effect, recovery information, and the rule that required approval.', '<div class="pm3-settings-card">'+approvalSettings.map(renderSetting).join('')+'</div>');
    var simulation=sectionWrap('simulation','Policy simulation','Ask a plain-language question or provide an exact action to see the effective result before a run performs it.',
      '<div class="pm3-panel-card"><div class="pm3-form-grid"><div class="pm3-field" style="grid-column:1/-1"><label>Action to simulate</label><input value="Run git push --force-with-lease origin concept/settings-12"></div><div class="pm3-field"><label>Agent</label><select><option>Implementation agent</option><option>Auditor</option><option>Back Seat Driver</option></select></div><div class="pm3-field"><label>Environment</label><select><option>Home TrueNAS</option><option>This Mac</option><option>Windows WSL</option></select></div></div><div class="pm3-inline-actions">'+button('Simulate policy',{className:'pm3-primary-btn',icon:'test',attrs:'data-test-action="permission-sim"'})+'</div></div><div class="pm3-alert">'+icon('shield')+'<div><strong>Approval required</strong><span>Force-push protection matched. The branch is not protected, but the operation requires a separate approval and recovery receipt.</span></div></div>');
    var effective=sectionWrap('effective','Effective policy','Understand the final answer, winning rule, inherited profile, overrides, and why a value is active.',
      '<table class="pm3-data-table"><thead><tr><th>Area</th><th>Requested</th><th>Effective</th><th>Source</th><th></th></tr></thead><tbody><tr><td>Normal project edits</td><td>Allow</td><td>'+statusMarkup('Allow','ok')+'</td><td>Balanced profile</td><td>'+button('Trace',{className:'pm3-secondary-btn',attrs:'data-sim-action="Trace edit permission"'})+'</td></tr><tr><td>Force push</td><td>Allow with lease</td><td>'+statusMarkup('Ask','warning')+'</td><td>Project override</td><td>'+button('Trace',{className:'pm3-secondary-btn',attrs:'data-sim-action="Trace force push permission"'})+'</td></tr><tr><td>Spec Lock edit</td><td>Allow</td><td>'+statusMarkup('Block','error')+'</td><td>Non-bypassable FileSafe rule</td><td>'+button('Trace',{className:'pm3-secondary-btn',attrs:'data-sim-action="Trace Spec Lock permission"'})+'</td></tr><tr><td>Paid API overage</td><td>Automatic</td><td>'+statusMarkup('Ask','warning')+'</td><td>Project billing boundary</td><td>'+button('Trace',{className:'pm3-secondary-btn',attrs:'data-sim-action="Trace paid usage permission"'})+'</td></tr></tbody></table>');
    return renderLongWorkbench(sections,overview+profiles+tools+filesafe+approvals+simulation+effective);
  }

  function renderDoctor() {
    var sections=[{id:'summary',label:'Health summary',icon:'gauge'},{id:'checks',label:'All checks',icon:'test'},{id:'events',label:'Recent events',icon:'history'},{id:'maintenance',label:'Maintenance',icon:'tool'}];
    var checks=[
      ['AI provider connections','3 need attention','warning','MiniMax, Antigravity, and Copilot require setup or repair.','ai|providers'],
      ['Source control','Git + Jujutsu ready','ok','Git LFS needs repair only on Windows WSL.','source|source-control'],
      ['FileSafe boundaries','Healthy','ok','Protected and allowed paths validate cleanly.','safety|permissions'],
      ['Storage','72% free','ok','No pressure or legal-hold conflict.','system|data'],
      ['Backups','Not configured','warning','Project and settings backups need a destination.','system|data'],
      ['Project search index','Fresh','ok','Last updated 4 minutes ago.','code|editor-runtime'],
      ['Servers & hosts','3 connected','ok','Home TrueNAS, This Mac, and Windows WSL.','system|servers'],
      ['Back Seat Driver','Healthy','ok','Auto observation is non-blocking.','ai|bsd']
    ];
    var summary=sectionWrap('summary','System Health','One honest picture projected from the owning managers. Doctor does not duplicate setup controls.',
      '<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Overall status</div><div class="pm3-stat-value" style="color:var(--pm3-amber);font-size:16px">3 need attention</div><div class="pm3-stat-note">No critical blocker</div></div><div class="pm3-stat"><div class="pm3-stat-label">Checks passed</div><div class="pm3-stat-value">21 / 24</div><div class="pm3-stat-note">Last run 2 minutes ago</div></div><div class="pm3-stat"><div class="pm3-stat-label">Automatic repairs</div><div class="pm3-stat-value">2</div><div class="pm3-stat-note">Both verified and receipted</div></div></div>',button('Run health checks',{className:'pm3-primary-btn',icon:'test',attrs:'data-test-action="doctor-all"'}));
    var all=sectionWrap('checks','All checks','Each result links back to the owner that can actually configure or repair it.',
      '<div class="pm3-priority-list">'+checks.map(function(c){var rt=c[4].split('|');return '<div class="pm3-priority-row"><span class="pm3-route-icon" style="width:28px;height:28px">'+icon(c[2]==='ok'?'check':'bell')+'</span><span class="pm3-priority-copy"><strong>'+esc(c[0])+'</strong><span>'+esc(c[3])+'</span></span>'+statusMarkup(c[1],c[2])+' '+button(c[2]==='ok'?'Open':'Repair',{className:'pm3-secondary-btn',attrs:'data-route="'+esc(c[4])+'"'})+'</div>';}).join('')+'</div>');
    var events=sectionWrap('events','Recent events','Installation, update, recovery, verification, and health events remain inspectable with receipts.',
      '<table class="pm3-data-table"><thead><tr><th>When</th><th>Event</th><th>Owner</th><th>Result</th><th></th></tr></thead><tbody><tr><td>2m ago</td><td>Health checks completed</td><td>Doctor</td><td>'+statusMarkup('21 passed · 3 attention','warning')+'</td><td>'+button('Receipt',{className:'pm3-secondary-btn',attrs:'data-sim-action="Open Doctor receipt"'})+'</td></tr><tr><td>18m ago</td><td>Claude model catalog refreshed</td><td>AI Providers</td><td>'+statusMarkup('Verified','ok')+'</td><td>'+button('Receipt',{className:'pm3-secondary-btn',attrs:'data-sim-action="Open catalog receipt"'})+'</td></tr><tr><td>1h ago</td><td>Project index rebuilt</td><td>Project Search Index</td><td>'+statusMarkup('Verified','ok')+'</td><td>'+button('Receipt',{className:'pm3-secondary-btn',attrs:'data-sim-action="Open index receipt"'})+'</td></tr><tr><td>Yesterday</td><td>Git LFS check</td><td>Source Control</td><td>'+statusMarkup('WSL missing','warning')+'</td><td>'+button('Repair',{className:'pm3-secondary-btn',attrs:'data-route="source|source-control"'})+'</td></tr></tbody></table>');
    var maintenance=sectionWrap('maintenance','Maintenance','Run bounded maintenance through the owner, with preview, verification, and rollback rather than one generic “fix everything” button.',
      '<div class="pm3-card-grid-3"><div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon('search')+'</span><div><h3>Rebuild project index</h3><span>Current index is healthy</span></div></div><div class="pm3-inline-actions">'+button('Rebuild',{className:'pm3-secondary-btn',attrs:'data-test-action="rebuild-index"'})+'</div></div><div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon('broom')+'</span><div><h3>Preview cleanup</h3><span>3.2 GB currently reclaimable</span></div></div><div class="pm3-inline-actions">'+button('Preview',{className:'pm3-secondary-btn',attrs:'data-sim-action="Preview workspace cleanup"'})+'</div></div><div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon('refresh')+'</span><div><h3>Rescan installations</h3><span>Providers, tools, and environments</span></div></div><div class="pm3-inline-actions">'+button('Rescan',{className:'pm3-secondary-btn',attrs:'data-test-action="rescan-installs"'})+'</div></div></div>');
    return renderLongWorkbench(sections,summary+all+events+maintenance);
  }

  function managerFixture(manager) {
    var common = {
      primaryAction: 'Add ' + manager.title.replace(/s$/,''),
      secondaryAction: 'Run check',
      status: 'Healthy',
      tone: 'ok',
      items: []
    };
    var fixtures = {
      'm.context': {primaryAction:'Preview assembled context',secondaryAction:'Inspect sources',status:'78% window available',tone:'ok',items:[
        ['Current window','42,180 / 196,000 tokens','Live run context including instructions, project files, tools, memory, and conversation.'],
        ['Source composition','Project 46% · Thread 24% · Memory 18% · Tools 12%','Inspect every source and its inclusion reason.'],
        ['Compaction policy','Automatic · preserve goals and exact instructions','Preview what is retained before compacting.']
      ]},
      'm.memory': {primaryAction:'Add memory',secondaryAction:'Run retrieval test',status:'1,248 memories · healthy',tone:'ok',items:[
        ['Project memory','816 records','Project-scoped decisions, preferences, constraints, and durable facts.'],
        ['Personal memory','392 records','User-level preferences available across projects when permitted.'],
        ['Quarantine','40 pending review','Potentially stale or conflicting memories held out of retrieval.']
      ]},
      'm.personas': {primaryAction:'Create persona',secondaryAction:'Import persona',status:'14 enabled',tone:'ok',items:[
        ['Planning Architect','Built in · Enabled','Plans, PRDs, architecture, source-lineage, and acceptance design.'],
        ['UI Film Director','Project · Enabled','Visual hierarchy, motion choreography, responsive layout, and polish.'],
        ['Security Reviewer','Built in · Enabled','Threat modeling, permissions, secrets, data flow, and abuse cases.']
      ]},
      'm.goal': {primaryAction:'Create goal template',secondaryAction:'Inspect active goals',status:'3 running · 1 paused',tone:'progress',items:[
        ['Hands-off default','Enabled','Goals continue through bounded phases and stop only for typed blockers.'],
        ['Checkpoint cadence','Every phase and 20 work units','Persists cursor, evidence, diffs, receipts, and last known good state.'],
        ['Verification requirement','Required before completion','A goal cannot certify while tests, evidence, or acceptance checks remain open.']
      ]},
      'm.crew': {primaryAction:'Create crew',secondaryAction:'Simulate assignment',status:'6 crews · healthy',tone:'ok',items:[
        ['UI implementation crew','4 roles','Lead implementer, visual auditor, motion reviewer, accessibility reviewer.'],
        ['Plan compilation crew','3 roles','Compiler, source-lineage reviewer, fidelity auditor.'],
        ['Provider doctor crew','3 roles','Installation, authentication, and invocation specialists.']
      ]},
      'm.testing': {primaryAction:'Run visible test',secondaryAction:'Open test history',status:'Auto · show when possible',tone:'ok',items:[
        ['Built-in browser testing','Enabled','Navigation, clicks, form entry, assertions, screenshots, console, and network evidence.'],
        ['Native preview testing','Automatic','Uses supported previews, hot reload, simulators, devices, windows, traces, screenshots, and logs.'],
        ['Fallback evidence','Required','Streams, snapshots, videos, timelines, and logs remain available when embedding is impossible.']
      ]},
      'm.history': {primaryAction:'Open history',secondaryAction:'Export selected',status:'1,842 sessions indexed',tone:'ok',items:[
        ['Pinned project history','18 sessions','Important threads remain immediately available and are never obscured by transient overlays.'],
        ['Goal handoffs','32 resumable points','Pause on one machine and resume on another with durable cursor state.'],
        ['Rewind points','147 snapshots','Preview and restore conversational or goal state without deleting newer history.']
      ]},
      'm.artifacts': {primaryAction:'Import artifact',secondaryAction:'Open artifact browser',status:'286 artifacts · 12.4 GB',tone:'ok',items:[
        ['Build outputs','84 artifacts','Compiled packages, installers, release notes, checksums, and provenance.'],
        ['Visual evidence','126 artifacts','Images, recordings, timelines, screenshots, and inspection annotations.'],
        ['Generated documents','76 artifacts','Plans, reports, exports, manifests, and structured datasets.']
      ]},
      'm.hosting': {primaryAction:'Add project location',secondaryAction:'Inspect ownership',status:'NAS-hosted · healthy',tone:'ok',items:[
        ['Project home','TrueNAS · /mnt/Cursor/Puppet Master','Canonical project files live on the NAS-mounted dataset.'],
        ['Default execution','Home TrueNAS','Execution stays close to project files unless a task requires another platform.'],
        ['Client access','This Mac · Windows desktop','Two clients are currently connected to the project host.']
      ]},
      'm.remote': {primaryAction:'Add access method',secondaryAction:'Test all connections',status:'3 methods ready',tone:'ok',items:[
        ['Local network','Ready','Direct LAN access with trusted-device policy and certificate pinning.'],
        ['SSH','Ready','Key-based access with host verification, bounded roots, and command receipts.'],
        ['VPN','Ready','Tailscale path available for trusted remote clients.']
      ]},
      'm.projectSync': {primaryAction:'Plan project move',secondaryAction:'View receipts',status:'No active move',tone:'muted',items:[
        ['Preflight','Required','Compare source and destination capabilities, free space, ownership, and exclusions.'],
        ['Transfer','Resumable','Pause-safe copy with hashes, progress, conflict reporting, and source preservation.'],
        ['Cutover','Explicit','Verify destination before changing project home; retain rollback until accepted.']
      ]},
      'm.storage': {primaryAction:'Inspect storage',secondaryAction:'Recalculate retention',status:'72% free',tone:'ok',items:[
        ['Project artifacts','12.4 GB','Retained by artifact policy with two legal holds.'],
        ['History and receipts','8.1 GB','Compacted incrementally while preserving pinned and governed evidence.'],
        ['Model and web caches','5.7 GB','Reclaimable according to pressure and recency policy.']
      ]},
      'm.backup': {primaryAction:'Configure backup',secondaryAction:'Preview restore',status:'Needs configuration',tone:'warning',items:[
        ['Project backup','Not configured','Choose destination, encryption, schedule, verification, retention, and failure notifications.'],
        ['Settings backup','Local snapshot only','Includes global, project, provider metadata, layouts, and preferences without exposing secrets.'],
        ['Restore test','Never run','Schedule bounded verification to prove backups are actually recoverable.']
      ]},
      'm.lifecycle': {primaryAction:'Import settings',secondaryAction:'Export settings',status:'Schema current',tone:'ok',items:[
        ['Import pipeline','Preview required','Validate schema, ownership, conflicts, unavailable providers, and secret references before apply.'],
        ['Migration history','7 successful','Every migration has source hash, transformed output, receipt, and rollback point.'],
        ['Copy from project','10 categories','Copy selected categories, then allow the destination project to diverge.']
      ]},
      'm.cleanup': {primaryAction:'Preview cleanup',secondaryAction:'Review holds',status:'3.2 GB reclaimable',tone:'ok',items:[
        ['Safe caches','1.8 GB','Recreatable caches with no active leases or legal holds.'],
        ['Expired test evidence','930 MB','Evidence outside configured retention and not referenced by governed results.'],
        ['Abandoned worktrees','480 MB','Clean, unleased worktrees with preserved patches and receipts.']
      ]},
      'm.serverBackup': {primaryAction:'Add backup destination',secondaryAction:'Test recovery plan',status:'One destination healthy',tone:'ok',items:[
        ['TrueNAS snapshots','Healthy','Hourly snapshots, daily retention, encrypted replication, and verification receipts.'],
        ['Off-site backup','Needs setup','No off-site destination protects against site-wide loss yet.'],
        ['Bare-metal recovery','Draft','Recovery media and host reconstruction checklist require a test.']
      ]},
      'm.deployment': {primaryAction:'Install Puppet Master',secondaryAction:'Verify installations',status:'4 installations',tone:'ok',items:[
        ['macOS native','Current','Apple Silicon desktop application and server capabilities.'],
        ['Windows native + WSL','Current','Windows client/server with optional WSL execution backend.'],
        ['Linux / Docker','Current','Standalone server and container deployment for TrueNAS and Unraid.']
      ]},
      'm.serverClaim': {primaryAction:'Claim server',secondaryAction:'View claim history',status:'All servers claimed',tone:'ok',items:[
        ['Home TrueNAS','Claimed by Jared','Trusted server host · certificate verified · recovery code stored.'],
        ['Windows workstation','Claimed by Jared','Execution host with WSL backend and local GPU access.'],
        ['This Mac','Claimed by Jared','Client and optional execution host.']
      ]},
      'm.servers': {primaryAction:'Add server',secondaryAction:'Run capability scan',status:'3 connected',tone:'ok',items:[
        ['Home TrueNAS','Server + execution host','Linux workloads, Docker, project files, browser, and background goals.'],
        ['Windows workstation','Execution host','Windows and WSL workloads, local GPU, desktop testing, and browsers.'],
        ['This Mac','Client + execution host','macOS workloads, previews, application testing, and local assistance.']
      ]},
      'm.appUpdates': {primaryAction:'Check for updates',secondaryAction:'View update history',status:'Automatic updates on',tone:'ok',items:[
        ['Current version','0.8.0-concept','Installed from GitHub release with verified provenance.'],
        ['Update channel','Stable','Checks on open, hourly, and manually; downloads are staged before restart.'],
        ['Rollback','Available','The previous verified version is retained until migration health is confirmed.']
      ]},
      'm.files': {primaryAction:'Open file preferences',secondaryAction:'Restore editor layout',status:'Project editor ready',tone:'ok',items:[
        ['Autosave','After 1 second','Dirty buffers are preserved through restart and goal handoff.'],
        ['Tab behavior','Preview off · pin on edit','Stable tabs with animated switching and reordering.'],
        ['External changes','Ask on conflict','Show a diff when disk and editor content diverge.']
      ]},
      'm.terminal': {primaryAction:'Add terminal profile',secondaryAction:'Open terminal test',status:'4 profiles ready',tone:'ok',items:[
        ['Project shell','zsh · Home TrueNAS','Starts in the project root with project environment and receipts enabled.'],
        ['Windows WSL','Ubuntu 26.04','Uses the optional WSL execution backend for Linux tasks.'],
        ['Safe command history','Enabled','Secrets are redacted and destructive commands keep approval context.']
      ]},
      'm.containers': {primaryAction:'Add runtime',secondaryAction:'Run environment check',status:'Docker ready · Podman available',tone:'ok',items:[
        ['Docker','Connected','Home TrueNAS · registry login healthy · automatic updates enabled.'],
        ['Podman','Available','Not selected as the default container engine.'],
        ['Kubernetes','Not configured','Enable only when a project needs cluster execution or deployment.']
      ]},
      'm.searchIndex': {primaryAction:'Rebuild index',secondaryAction:'Test query',status:'Fresh · 183,492 symbols',tone:'ok',items:[
        ['Code index','Fresh','Rust, Slint, TypeScript, JavaScript, Python, Markdown, and configuration files.'],
        ['Private paths','Excluded','Secrets, credentials, ignored directories, and user-defined exclusions are not indexed.'],
        ['Incremental updates','Enabled','Changed files refresh without rebuilding the whole project index.']
      ]},
      'm.dry': {primaryAction:'Run duplication audit',secondaryAction:'Open ownership map',status:'Shared systems healthy',tone:'ok',items:[
        ['Settings inventory','828 canonical entries','Both concepts consume the same IDs, descriptions, controls, defaults, and relationships.'],
        ['Provider capability registry','Shared','Providers, Web, Media, Chat, Usage, and diagnostics project the same capabilities.'],
        ['Command and event IDs','Shared','Interactive surfaces use stable identifiers rather than concept-local copies.']
      ]},
      'm.appearance': {primaryAction:'Preview appearance',secondaryAction:'Import theme',status:'Dark Purple · comfortable',tone:'ok',items:[
        ['Theme','Dark Purple','Project-level theme using Inter and a restrained high-contrast hierarchy.'],
        ['Density','Comfortable','Readable rows with compact metadata and room for progressive disclosure.'],
        ['Motion','Full','Smooth transitions with reduced-motion support and no flash during first paint.']
      ]},
      'm.desktop': {primaryAction:'Edit layout',secondaryAction:'Restore default layout',status:'Custom layout saved',tone:'ok',items:[
        ['Window restore','Enabled','Restore window bounds, panel state, selected project, and active surface.'],
        ['Activity bar','Custom order','Reorder with a structured list rather than editing a string field.'],
        ['Home layout','Custom','Restore through a confirmed action with a clear description of what changes.']
      ]},
      'm.spellcheck': {primaryAction:'Add dictionary',secondaryAction:'Test spellcheck',status:'English (US) active',tone:'ok',items:[
        ['Languages','English (US)','Additional project dictionaries can be enabled independently.'],
        ['Project dictionary','142 terms','Provider names, model names, command IDs, and domain terminology.'],
        ['Code-aware exclusions','Enabled','Avoid flagging identifiers, paths, hashes, code spans, and generated content.']
      ]},
      'm.teacher': {primaryAction:'Open Teacher Assistant',secondaryAction:'Restart tour',status:'Contextual help on',tone:'ok',items:[
        ['Contextual explanations','On demand','Detailed guidance is available without permanently filling the interface.'],
        ['Demo Teacher Assistant','Available','A built-in project demonstrates goals, providers, testing, and artifacts.'],
        ['Tour behavior','Resume where left off','Skip, close, and resume remain distinct actions.']
      ]},
      'm.onboarding': {primaryAction:'Preview onboarding',secondaryAction:'Reset onboarding state',status:'Completed · resumable',tone:'ok',items:[
        ['Provider setup','Completed','Includes supported providers, free models, sign-in, plans, and invocation checks.'],
        ['Project setup','Completed','Add or import a project, choose storage, and configure source control.'],
        ['Guided tour','Partially complete','Resume at Goal Mode and live testing.']
      ]}
    };
    return Object.assign(common, fixtures[manager.id] || {});
  }

  function renderManagerSettingsBlock(manager, limit) {
    var settings = settingsForManager(manager);
    if (!settings.length) return '<div class="pm3-panel-card"><h3>Owned controls</h3><p>This manager is resource-driven. Its canonical controls appear in the resource inspector and task flows above rather than duplicated in a generic setting list.</p></div>';
    settings.sort(function(a,b){return (b.curated?1:0)-(a.curated?1:0)||a.label.localeCompare(b.label);});
    var shown=settings.slice(0,limit || 8), remaining=settings.length-shown.length;
    return '<div class="pm3-settings-card">'+shown.map(renderSetting).join('')+'</div>'+(remaining>0?'<div class="pm3-more is-open"><div class="pm3-more-btn" style="cursor:default"><span class="pm3-more-icon">'+icon('layers')+'</span><span class="pm3-more-copy"><strong>Shared inventory coverage</strong><span>'+esc(remaining)+' additional controls remain searchable and available in the full domain settings view.</span></span><span class="pm3-more-count">'+esc(settings.length)+'</span></div></div>':'');
  }

  function renderFixtureCards(manager, fixture) {
    var cards=arr(fixture.items).map(function(item,index){
      return '<div class="pm3-route-card"><div class="pm3-route-head"><span class="pm3-route-icon">'+icon(manager.icon)+'</span><div><h3>'+esc(item[0])+'</h3><span>'+esc(item[1])+'</span></div>'+statusMarkup(index===0?fixture.status:'Configured',index===0?fixture.tone:'ok')+'</div><p>'+esc(item[2])+'</p><div class="pm3-inline-actions">'+button(manager.archetype==='workflow'?'Open step':'Manage',{className:'pm3-secondary-btn',icon:manager.archetype==='health'?'gauge':'sliders',attrs:'data-sim-action="Manage '+esc(item[0])+'"'})+button('Test',{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="manager-'+esc(manager.id)+'-'+index+'"'})+'</div></div>';
    }).join('');
    return '<div class="pm3-card-grid-3">'+cards+'</div>';
  }

  function renderWorkflowTimeline(manager) {
    var steps = manager.id==='m.backup' ? ['Choose destination','Set encryption and schedule','Run verified backup','Preview and test restore'] :
      manager.id==='m.projectSync' ? ['Preflight source and destination','Preview copy and conflicts','Transfer with resumable hashes','Verify, cut over, retain rollback'] :
      manager.id==='m.cleanup' ? ['Scan reclaimable data','Apply holds and exclusions','Review dry-run plan','Execute, verify, and retain receipt'] :
      manager.id==='m.deployment' ? ['Choose build and host','Verify prerequisites','Install from trusted source','Run health and rollback checks'] :
      manager.id==='m.onboarding' ? ['Connect providers','Add or import project','Configure source control','Learn goals and live testing'] :
      ['Define behavior','Preview effective configuration','Apply bounded changes','Verify result and preserve receipt'];
    return '<div class="pm3-priority-list">'+steps.map(function(step,index){return '<div class="pm3-priority-row"><span class="pm3-priority-num">'+(index+1)+'</span><span class="pm3-priority-copy"><strong>'+esc(step)+'</strong><span>'+(index===0?'Ready to configure':index===1?'Preview before changing anything':index===2?'Runs with progress and pause support':'Produces validation and rollback evidence')+'</span></span>'+statusMarkup(index<1?'Ready':index===1?'Next':'Pending',index<1?'ok':index===1?'progress':'muted')+' '+button(index===1?'Preview':'Open',{className:'pm3-secondary-btn',attrs:'data-sim-action="'+esc(step)+'"'})+'</div>';}).join('')+'</div>';
  }

  function renderManagerSection(manager) {
    var fixture=managerFixture(manager);
    var actions=button(fixture.secondaryAction,{className:'pm3-secondary-btn',icon:'test',attrs:'data-test-action="manager-'+esc(manager.id)+'"'})+button(fixture.primaryAction,{className:'pm3-primary-btn',icon:'plus',attrs:'data-modal-open="generic-resource" data-modal-manager="'+esc(manager.id)+'"'});
    var content='<div class="pm3-bespoke-head"><span class="pm3-manager-hero-icon">'+icon(manager.icon)+'</span><div><h2>'+esc(manager.title)+'</h2><p>'+esc(manager.summary)+'</p></div><span style="margin-left:auto">'+statusMarkup(fixture.status,fixture.tone)+'</span></div>';
    if(manager.archetype==='workflow') content+=renderWorkflowTimeline(manager);
    else if(manager.archetype==='policy') content+='<div class="pm3-alert">'+icon('shield')+'<div><strong>Effective behavior is explained, not hidden</strong><span>Every policy exposes the winning rule, scope, inheritance, consequence, and a simulation or test path.</span></div></div>'+renderFixtureCards(manager,fixture);
    else if(manager.archetype==='health') content+='<div class="pm3-stat-grid"><div class="pm3-stat"><div class="pm3-stat-label">Current state</div><div class="pm3-stat-value" style="font-size:16px">'+esc(fixture.status)+'</div><div class="pm3-stat-note">Projected from owning resources</div></div><div class="pm3-stat"><div class="pm3-stat-label">Checks</div><div class="pm3-stat-value">8 / 8</div><div class="pm3-stat-note">No hidden failures</div></div><div class="pm3-stat"><div class="pm3-stat-label">Last verified</div><div class="pm3-stat-value" style="font-size:16px">2 minutes ago</div><div class="pm3-stat-note">Receipts retained</div></div></div>'+renderFixtureCards(manager,fixture);
    else content+=renderFixtureCards(manager,fixture);
    content+='<div style="margin-top:12px">'+renderManagerSettingsBlock(manager,7)+'</div>';
    return sectionWrap(manager.id,manager.title,manager.summary,content,actions);
  }

  function renderManagerGroup() {
    var workspace=currentWorkspace();
    var managers=arr(workspace.managers).map(managerById).filter(Boolean);
    if(!managers.length) return renderOrdinary();
    var sections=managers.map(function(m){return {id:m.id,label:m.title,icon:m.icon};});
    return renderLongWorkbench(sections,managers.map(renderManagerSection).join(''));
  }

  function workspacePayload(workspace) {
    var prevReturn = returnBodyOnly;
    var prevId = bodyWorkspaceId;
    var prevWs = bodyWorkspace;
    returnBodyOnly = true;
    bodyWorkspaceId = workspace.id;
    bodyWorkspace = workspace;
    try {
      var result;
      switch (workspace.kind) {
        case 'ordinary': result = renderOrdinary(); break;
        case 'providers': result = renderProviders(); break;
        case 'web': result = renderWeb(); break;
        case 'media': result = renderMedia(); break;
        case 'bsd': result = renderBSD(); break;
        case 'notifications': result = renderNotifications(); break;
        case 'source-control': result = renderSourceControl(); break;
        case 'toolchain': result = renderToolchain(); break;
        case 'permissions': result = renderPermissions(); break;
        case 'doctor': result = renderDoctor(); break;
        case 'manager-group': result = renderManagerGroup(); break;
        default: result = renderManagerGroup(); break;
      }
      if (result && typeof result === 'object' && result.html !== undefined) return result;
      return {
        sections: [{ id: workspace.id + ':main', label: workspace.label }],
        html: String(result || '')
      };
    } finally {
      returnBodyOnly = prevReturn;
      bodyWorkspaceId = prevId;
      bodyWorkspace = prevWs;
    }
  }

  function renderPageIndexCard(workspaces, activeWsId, activeSection) {
    var groups = arr(workspaces).map(function (w) {
      var sections = domainSectionMap[w.id] || [];
      return '<button type="button" class="pm3-page-index-title' + (w.id === activeWsId ? ' is-current' : '') + '" data-workspace="' + esc(w.id) + '">' + esc(w.label) + '</button>' +
        sections.map(function (s) {
          return '<button type="button" class="pm3-index-link ' + (s.id === activeSection ? 'is-active' : '') + '" data-index-target="' + esc(s.id) + '">' + esc(s.label) + '</button>';
        }).join('');
    }).join('');
    return '<aside class="pm3-page-index"><div class="pm3-page-index-card" data-page-index-links>' + groups + '</div></aside>';
  }

  function syncWorkspaceChrome(wsId) {
    var ws = workspaceById(currentDomain(), wsId);
    root.querySelectorAll('[data-workspace]').forEach(function (btn) {
      var match = btn.getAttribute('data-workspace') === wsId;
      if (btn.classList.contains('pm3-workspace-tab')) btn.classList.toggle('is-active', match);
      if (btn.classList.contains('pm3-page-index-title')) btn.classList.toggle('is-current', match);
    });
    var barTitle = root.querySelector('.pm3-workspace-title');
    var barDesc = root.querySelector('.pm3-workspace-description');
    if (ws && barTitle) barTitle.textContent = ws.title || ws.label;
    if (ws && barDesc) barDesc.textContent = ws.description || '';
  }

  function updatePageIndexForWorkspace(wsId) {
    syncWorkspaceChrome(wsId);
  }

  function jumpToWorkspace(wsId, behavior) {
    state.workspace = wsId;
    var sections = domainSectionMap[wsId] || [];
    if (sections[0]) state.activeSection = sections[0].id;
    syncHash();
    syncWorkspaceChrome(wsId);
    root.querySelectorAll('[data-index-target]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-index-target') === state.activeSection);
    });
    var block = root.querySelector('[data-workspace-block="' + cssEscape(wsId) + '"]');
    if (block) {
      block.scrollIntoView({
        block: 'start',
        behavior: behavior || (state.reducedMotion ? 'auto' : 'smooth')
      });
    }
  }

  function renderDomainContinuous() {
    var domain = currentDomain();
    var workspaces = visibleDomainWorkspaces(domain);
    domainSectionMap = {};
    var blocks = workspaces.map(function (w) {
      var payload = workspacePayload(w);
      domainSectionMap[w.id] = payload.sections || [];
      var fullBleed = w.kind === 'providers' ? ' is-full-bleed' : '';
      return '<section class="pm3-workspace-block' + fullBleed + '" id="workspace-' + esc(w.id) + '" data-workspace-block="' + esc(w.id) + '">' +
        '<header class="pm3-workspace-separator"><h2>' + esc(w.label) + '</h2>' +
        (w.description ? '<p>' + esc(w.description) + '</p>' : '') +
        '</header><div class="pm3-workspace-block-body">' + payload.html + '</div></section>';
    }).join('');
    var activeWs = state.workspace;
    if (!domainSectionMap[activeWs] && workspaces[0]) activeWs = workspaces[0].id;
    var sections = domainSectionMap[activeWs] || [];
    var activeSection = state.activeSection;
    if (!activeSection || !sections.some(function (s) { return s.id === activeSection; })) {
      activeSection = sections[0] && sections[0].id;
    }
    var hasInspector = variant === 'kimi' && !!state.detailsSetting;
    return '<div class="pm3-view pm3-document-layout ' + (hasInspector ? 'has-inspector' : '') + '">' +
      renderPageIndexCard(workspaces, activeWs, activeSection) +
      '<div class="pm3-scroll" data-scroll-root><main class="pm3-document">' + blocks + '</main></div>' +
      (hasInspector ? renderSettingInspector() : '') +
    '</div>';
  }

  function renderCurrentView() {
    if (state.home) return renderHome();
    return renderDomainContinuous();
  }

  function closeFloating() {
    if(menuEl&&menuEl.parentNode) menuEl.parentNode.removeChild(menuEl);
    if(searchEl&&searchEl.parentNode) searchEl.parentNode.removeChild(searchEl);
    menuEl=null; searchEl=null;
  }

  function render(preserveScroll) {
    if(!root) return;
    var oldScroll=root.querySelector('[data-scroll-root]');
    var oldTop=preserveScroll&&oldScroll?oldScroll.scrollTop:0;
    var oldKey=previousRouteKey;
    var shouldPreserve=!!(preserveScroll&&oldScroll);
    closeFloating();
    document.documentElement.setAttribute('data-motion',state.reducedMotion?'reduced':'full');
    document.documentElement.setAttribute('data-color',state.color);
    document.body.setAttribute('data-variant',variant);
    root.innerHTML='<div class="pm3-app">'+renderTopbar()+'<div class="pm3-main">'+renderSidebar()+'<section class="pm3-content">'+renderDomainTabs()+renderWorkspaceBar()+'<div class="pm3-viewport">'+renderCurrentView()+'</div></section></div>'+renderStatusbar()+'</div>';
    previousRouteKey=routeKey();
    var sameRoute=oldKey===previousRouteKey;
    var nextScroll=root.querySelector('[data-scroll-root]');
    // Restore instantly before paint. Avoid CSS scroll-behavior:smooth here — it
    // animates from 0 and makes every in-place click flash to the top.
    if(nextScroll&&shouldPreserve&&sameRoute){
      nextScroll.style.scrollBehavior='auto';
      nextScroll.scrollTop=oldTop;
    }
    setupScrollSpy();
    requestAnimationFrame(function(){
      if(nextScroll&&shouldPreserve&&sameRoute){
        nextScroll.style.scrollBehavior='auto';
        nextScroll.scrollTop=oldTop;
        nextScroll.style.scrollBehavior='';
        return; // do not scrollIntoView on in-place updates
      }
      var oldParts=String(oldKey||'').split('|');
      var newParts=String(previousRouteKey||'').split('|');
      var sameDomainView=!state.home&&oldParts[0]&&oldParts[0]===newParts[0]&&oldParts[0]!=='home';
      var workspaceChanged=oldParts[1]!==newParts[1];
      var target=null;
      if(state.highlightedSetting) target=root.querySelector('[data-setting-row="'+cssEscape(state.highlightedSetting)+'"]');
      if(!target&&state.selectedManager){
        target=root.querySelector('[data-section-id="'+cssEscape(state.workspace+':'+state.selectedManager)+'"]')
          || root.querySelector('[data-section-id="'+cssEscape(state.selectedManager)+'"]');
      }
      if(target){
        target.scrollIntoView({block:state.highlightedSetting?'center':'start',behavior:'auto'});
        if(state.highlightedSetting) setTimeout(function(){state.highlightedSetting=null;},1300);
        return;
      }
      // Soft in-domain remounts (provider tab, etc.) keep scroll position.
      if(nextScroll&&shouldPreserve&&sameDomainView&&!workspaceChanged){
        nextScroll.style.scrollBehavior='auto';
        nextScroll.scrollTop=oldTop;
        nextScroll.style.scrollBehavior='';
        return;
      }
      if(!state.home&&state.workspace){
        var block=root.querySelector('[data-workspace-block="'+cssEscape(state.workspace)+'"]');
        if(block) block.scrollIntoView({block:'start',behavior:'auto'});
      }
    });
  }

  function cssEscape(value) {
    if(window.CSS&&window.CSS.escape) return window.CSS.escape(String(value));
    return String(value).replace(/(["\\.#:[\]()=])/g,'\\$1');
  }

  function setupScrollSpy() {
    if(scrollCleanup){scrollCleanup();scrollCleanup=null;}
    var scroller=root.querySelector('[data-scroll-root]');
    if(!scroller) return;
    var blocks=Array.prototype.slice.call(scroller.querySelectorAll('[data-workspace-block]'));
    var update=function(){
      var threshold=scroller.getBoundingClientRect().top+96;
      var activeBlock=null;
      if(blocks.length){
        activeBlock=blocks[0].getAttribute('data-workspace-block');
        blocks.forEach(function(block){
          if(block.getBoundingClientRect().top<=threshold) activeBlock=block.getAttribute('data-workspace-block');
        });
      }
      if(activeBlock&&activeBlock!==state.workspace){
        state.workspace=activeBlock;
        syncHash();
        syncWorkspaceChrome(activeBlock);
      }
      var blockEl=activeBlock?scroller.querySelector('[data-workspace-block="'+cssEscape(activeBlock)+'"]'):null;
      var localSections=blockEl
        ? Array.prototype.slice.call(blockEl.querySelectorAll('[data-section-id]'))
        : Array.prototype.slice.call(scroller.querySelectorAll('[data-section-id]'));
      if(!localSections.length) return;
      var active=localSections[0].getAttribute('data-section-id');
      localSections.forEach(function(section){
        if(section.getBoundingClientRect().top<=threshold) active=section.getAttribute('data-section-id');
      });
      if(active!==state.activeSection){
        state.activeSection=active;
        root.querySelectorAll('[data-index-target]').forEach(function(btn){
          btn.classList.toggle('is-active',btn.getAttribute('data-index-target')===active);
        });
      }
    };
    var ticking=false;
    var onScroll=function(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;update();});};
    scroller.addEventListener('scroll',onScroll,{passive:true});
    update();
    scrollCleanup=function(){scroller.removeEventListener('scroll',onScroll);};
  }

  function searchRouteForSetting(setting) {
    var d=settingDomain(setting), workspace=defaultWorkspaceForDomain(d);
    if(d==='ai') workspace='ordinary-ai';
    if(d==='code') workspace='editor-runtime';
    if(d==='source') workspace='ordinary-source';
    if(d==='safety') workspace='permissions';
    if(d==='memory') workspace='ordinary-memory';
    if(d==='projects') workspace='ordinary-projects';
    if(d==='system') workspace='ordinary-system';
    return {domain:d,workspace:workspace};
  }

  function buildSearchIndex() {
    var results=[];
    arr(INVENTORY.settings).forEach(function(setting){var route=searchRouteForSetting(setting);results.push({type:'setting',id:setting.id,title:setting.label,description:setting.desc,path:domainById(route.domain).label+' › '+workspaceById(domainById(route.domain),route.workspace).label,domain:route.domain,workspace:route.workspace,keywords:[setting.id,setting.cat,setting.sub,setting.tier,displayValue(setting.default)].join(' ')});});
    arr(DATA.managers).forEach(function(manager){var loc=findWorkspaceForManager(manager.id);if(loc)results.push({type:'manager',id:manager.id,title:manager.title,description:manager.summary,path:loc.domain.label+' › '+loc.workspace.label,domain:loc.domain.id,workspace:loc.workspace.id,keywords:manager.archetype+' '+arr(manager.prefixes).join(' ')});});
    arr(DATA.providers).forEach(function(provider){results.push({type:'provider',id:provider.id,title:provider.name,description:provider.status+' · '+provider.note,path:'AI & Providers › Providers & Accounts',domain:'ai',workspace:'providers',keywords:[provider.product,provider.auth,provider.install,provider.capabilities.join(' '),provider.models.join(' ')].join(' ')});});
    arr(DATA.freeRoutes).forEach(function(route){results.push({type:'free-route',id:route.id,title:route.name,description:(route.enabled?'Enabled':'Available to enable')+' · '+route.models+' models',path:'AI & Providers › Free Models › Routes',domain:'ai',workspace:'providers',keywords:[route.account,route.auth,route.capabilities.join(' ')].join(' ')});});
    arr(DATA.domains).forEach(function(domain){arr(domain.workspaces).forEach(function(workspace){results.push({type:'workspace',id:domain.id+'|'+workspace.id,title:workspace.title,description:workspace.description,path:domain.label,domain:domain.id,workspace:workspace.id,keywords:arr(workspace.managers).join(' ')});});});
    [
      ['Set up Claude Code','Open provider installation and account setup','ai','providers','claude-code'],
      ['Change completion sound','Open event sound mappings and the sound library','general','notifications',''],
      ['Restore home layout','Open structured desktop and window settings','general','ordinary','general.startup.reset-home-layout'],
      ['Connect GitHub','Open hosted forge connections in Source Control','source','source-control','m.sourceControl'],
      ['Configure web search priority','Open Web & Research capability routing','ai','web',''],
      ['Back up Puppet Master','Open project and settings backup setup','system','data','m.backup']
    ].forEach(function(a){results.push({type:'action',id:a[4],title:a[0],description:a[1],path:domainById(a[2]).label+' › '+workspaceById(domainById(a[2]),a[3]).label,domain:a[2],workspace:a[3],keywords:a.join(' ')});});
    return results;
  }

  function openSearch(input) {
    closeFloating();
    var query=String(input.value||'').trim().toLowerCase();
    var terms=query.split(/\s+/).filter(Boolean);
    var index=buildSearchIndex();
    var matches=index.map(function(item){var hay=(item.title+' '+item.description+' '+item.path+' '+item.keywords).toLowerCase();var score=terms.reduce(function(n,t){return n+(item.title.toLowerCase().indexOf(t)>=0?8:0)+(item.path.toLowerCase().indexOf(t)>=0?3:0)+(hay.indexOf(t)>=0?1:-20);},0);return {item:item,score:score};}).filter(function(x){return !terms.length||x.score>=terms.length;}).sort(function(a,b){return b.score-a.score||a.item.title.localeCompare(b.item.title);}).slice(0,24);
    var rect=input.closest('.pm3-search,.pm3-hero-search').getBoundingClientRect();
    searchEl=document.createElement('div');
    searchEl.className='pm3-search-results';
    searchEl.style.position='fixed';searchEl.style.left=Math.max(12,rect.left)+'px';searchEl.style.top=(rect.bottom+6)+'px';searchEl.style.width=Math.min(Math.max(rect.width,420),window.innerWidth-24)+'px';searchEl.style.zIndex='240';
    searchEl.innerHTML=matches.length?'<div class="pm3-search-group">'+(query?'Best matches':'Common destinations')+'</div>'+matches.map(function(x){var i=x.item;return '<button type="button" class="pm3-search-result" data-search-result="'+esc(i.type)+'" data-search-id="'+esc(i.id)+'" data-search-domain="'+esc(i.domain)+'" data-search-workspace="'+esc(i.workspace)+'"><span class="pm3-search-result-main"><span class="pm3-search-result-title">'+esc(i.title)+'</span><span>'+esc(i.description)+'</span></span><span class="pm3-search-result-path">'+esc(i.path)+'</span></button>';}).join(''):'<div class="pm3-search-empty"><strong>No matching setting yet</strong><span>Try a task such as “connect GitHub,” “completion sound,” “web priority,” or an exact setting ID.</span></div>';
    document.body.appendChild(searchEl);
  }

  function selectSearchResult(buttonEl) {
    var type=buttonEl.getAttribute('data-search-result'),id=buttonEl.getAttribute('data-search-id'),domain=buttonEl.getAttribute('data-search-domain'),workspace=buttonEl.getAttribute('data-search-workspace');
    closeFloating();
    if(type==='setting'){setRoute(domain,workspace,{settingId:id});return;}
    if(type==='provider'){setRoute('ai','providers',{providerId:id});return;}
    if(type==='free-route'){state.selectedFreeRoute=id;setRoute('ai','providers',{providerId:'free-models',providerTab:'routes'});return;}
    if(type==='manager'){setRoute(domain,workspace,{managerId:id});return;}
    if(type==='action'&&id){if(id.indexOf('m.')===0)setRoute(domain,workspace,{managerId:id});else if(byId(DATA.providers,id))setRoute(domain,workspace,{providerId:id});else setRoute(domain,workspace,{settingId:id});return;}
    setRoute(domain,workspace,{});
  }

  function openMenu(anchor, items) {
    closeFloating();
    var rect=anchor.getBoundingClientRect();
    menuEl=document.createElement('div');menuEl.className='pm3-menu';
    menuEl.innerHTML=items.map(function(item){return '<button type="button" class="'+(item.danger?'danger':'')+'" data-menu-command="'+esc(item.command)+'">'+icon(item.icon||'bolt')+'<span>'+esc(item.label)+'</span></button>';}).join('');
    document.body.appendChild(menuEl);
    var width=menuEl.offsetWidth;
    menuEl.style.left=Math.min(window.innerWidth-width-12,Math.max(12,rect.right-width))+'px';menuEl.style.top=Math.min(window.innerHeight-menuEl.offsetHeight-12,rect.bottom+6)+'px';
  }

  function pageMoreSectionIds() {
    if(!root) return [];
    return Array.prototype.map.call(root.querySelectorAll('[data-more-section]'),function(btn){return btn.getAttribute('data-more-section');}).filter(Boolean);
  }

  function pageOptionsItems() {
    var moreIds=pageMoreSectionIds();
    var advancedOpen=moreIds.length>0&&moreIds.every(function(id){return !!state.expandedSections[id];});
    return [
      {label:state.showAllDetails?'Collapse explanations':'Show all explanations',icon:'eye',command:'show-all'},
      {label:advancedOpen?'Collapse advanced controls':'Show advanced controls',icon:'sliders',command:'advanced'},
      {label:'Reset this section',icon:'refresh',command:'reset-section'},
      {label:'Copy deep link',icon:'link',command:'copy-link'}
    ];
  }

  function toggleShowAllExplanations() {
    state.showAllDetails=!state.showAllDetails;
    state.detailsSetting=null;
    render(true);
    showToast(state.showAllDetails?'Explanations expanded':'Explanations collapsed',state.showAllDetails?'Every setting on this page shows its detailed help.':'Detailed help is hidden until you open Details on a setting.');
  }

  function toggleAdvancedControls() {
    var ids=pageMoreSectionIds();
    if(!ids.length&&currentWorkspace().kind==='ordinary'){
      ordinarySections(state.domain).forEach(function(section){
        var featured=section.settings.filter(function(s){return s.curated;});
        section.settings.forEach(function(s){if(featured.length<7&&featured.indexOf(s)<0)featured.push(s);});
        if(section.settings.some(function(s){return featured.indexOf(s)<0;})) ids.push(section.id);
      });
      ids=unique(ids);
    }
    if(!ids.length){
      showToast('No additional controls','This page does not have collapsed advanced controls.');
      return;
    }
    var allOpen=ids.every(function(id){return !!state.expandedSections[id];});
    ids.forEach(function(id){state.expandedSections[id]=!allOpen;});
    render(true);
    showToast(allOpen?'Advanced controls collapsed':'Advanced controls shown',allOpen?'Additional inventory controls are hidden again.':'Additional shared-inventory controls are expanded on this page.');
  }

  function resetCurrentPageSettings() {
    var seen={};
    var count=0;
    function resetId(id){
      if(!id||seen[id])return;
      seen[id]=true;
      var setting=settingMap[id];
      if(!setting||!Object.prototype.hasOwnProperty.call(setting,'default'))return;
      state.values[id]=Array.isArray(setting.default)?setting.default.slice():setting.default;
      count++;
    }
    if(root){
      root.querySelectorAll('[data-setting-row],[data-setting-id]').forEach(function(el){
        resetId(el.getAttribute('data-setting-row')||el.getAttribute('data-setting-id'));
      });
    }
    if(currentWorkspace().kind==='ordinary'){
      settingsForDomain(state.domain).forEach(function(setting){resetId(setting.id);});
    }
    render(true);
    if(count) showToast('Section reset',count+' setting'+(count===1?'':'s')+' restored to defaults for this page.');
    else showToast('Nothing to reset','No editable inventory settings with defaults were found on this page.','warning');
  }

  function showToast(title,message,tone) {
    var old=document.querySelector('.pm3-toast');if(old)old.remove();clearTimeout(toastTimer);
    var toast=document.createElement('div');toast.className='pm3-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');toast.innerHTML=icon(tone==='warning'?'bell':'check')+'<div><strong>'+esc(title)+'</strong><span>'+esc(message||'The concept state has been updated.')+'</span></div>';document.body.appendChild(toast);
    toastTimer=setTimeout(function(){if(toast.parentNode)toast.remove();},3200);
  }

  function modalSpec(type, managerId) {
    var manager=managerById(managerId);
    var specs={
      'provider-setup':['Set up a provider','Choose a supported connection, then Puppet Master will guide installation, sign-in, account verification, model discovery, and an invocation test.','<div class="pm3-form-grid"><div class="pm3-field"><label>Provider</label><select><option>Claude Code</option><option>OpenAI Codex</option><option>Cursor</option><option>Kimi For Coding</option><option>Qwen Coding Plan</option><option>Z.AI GLM Coding Plan</option></select></div><div class="pm3-field"><label>Install on</label><select><option>This Mac</option><option>Home TrueNAS</option><option>Windows WSL</option></select></div><div class="pm3-field" style="grid-column:1/-1"><label>Setup behavior</label><select><option>Install, open official sign-in, verify, and test</option><option>Connect an existing installation</option></select><small>No provider CLI is silently bundled or installed.</small></div></div>','Start setup'],
      'free-route-catalog':['Enable a Free Model route','Disabled free routes are listed here. Provider-specific controls appear inside Free Models only after a route is enabled.','<div class="pm3-priority-list">'+arr(DATA.freeRoutes).filter(function(r){return !r.enabled;}).map(function(r){return '<div class="pm3-priority-row"><span class="pm3-avatar">'+esc(r.initials)+'</span><span class="pm3-priority-copy"><strong>'+esc(r.name)+'</strong><span>'+esc(r.models)+' models · '+esc(r.limit)+' · '+esc(r.capabilities.join(', '))+'</span></span>'+button('Enable',{className:'pm3-primary-btn',attrs:'data-enable-free="'+esc(r.id)+'"'})+'</div>';}).join('')+'</div>','Done'],
      'notification-destination':['Add notification destination','Connect a supported destination, test delivery, and then assign events or notification agents.','<div class="pm3-form-grid"><div class="pm3-field"><label>Destination</label><select><option>Slack</option><option>Discord</option><option>ntfy</option><option>Pushover</option><option>Telegram</option><option>Custom webhook</option></select></div><div class="pm3-field"><label>Display name</label><input value="Build Room"></div><div class="pm3-field" style="grid-column:1/-1"><label>Endpoint, topic, channel, or token</label><input placeholder="Shown redacted after save"><small>Secrets are stored in the configured secret store, never in project files.</small></div></div>','Connect & test'],
      'sound-upload':['Upload a sound','Import an audio file, validate it, preview volume, and assign it to events.','<div class="pm3-form-grid"><div class="pm3-field" style="grid-column:1/-1"><label>Audio file</label><input type="file" data-sound-file accept="audio/*"><small>Concept simulation accepts the filename; no file is transmitted.</small></div><div class="pm3-field"><label>Display name</label><input data-sound-name placeholder="My sound"></div><div class="pm3-field"><label>Preview volume</label><input type="range" value="70"></div></div>','Add to library'],
      'peon-pack':['Import PeonPing pack','Validate a PeonPing/OpenPeon-compatible sound pack, inspect provenance and license, preview its sounds, then import.','<div class="pm3-alert">'+icon('volume')+'<div><strong>PeonPing compatible</strong><span>2 existing PeonPing sounds are active. Imported sounds remain grouped by pack and expose update, repair, export, and removal actions.</span></div></div><div class="pm3-form-grid"><div class="pm3-field" style="grid-column:1/-1"><label>Pack archive</label><input type="file" accept=".zip,.json"></div><div class="pm3-field"><label>Conflict behavior</label><select><option>Keep both and rename</option><option>Replace matching pack</option><option>Skip duplicates</option></select></div><div class="pm3-field"><label>Import mappings</label><select><option>Preview before applying</option><option>Sounds only</option></select></div></div>','Validate pack'],
      'forge-connect':['Connect a hosted forge','Hosted services are separate from local Git or Jujutsu installations. Connect an account, inspect scopes, test, and discover repositories.','<div class="pm3-form-grid"><div class="pm3-field"><label>Service</label><select><option>GitHub</option><option>GitLab</option><option>Bitbucket</option><option>Azure DevOps</option><option>Cursor Origin</option></select></div><div class="pm3-field"><label>Account label</label><input value="Work"></div><div class="pm3-field" style="grid-column:1/-1"><label>Authentication</label><select><option>Open official browser sign-in</option><option>Use an existing token from secret store</option></select></div></div>','Connect & verify'],
      'worktree-create':['Create a worktree','Choose a branch or revision, destination, owner, lease, and cleanup policy before creation.','<div class="pm3-form-grid"><div class="pm3-field"><label>Name</label><input value="feature-worktree"></div><div class="pm3-field"><label>Branch / bookmark</label><input value="feature/new-work"></div><div class="pm3-field" style="grid-column:1/-1"><label>Path</label><input value="/mnt/Cursor/worktrees/feature-new-work"></div><div class="pm3-field"><label>Owner</label><select><option>Current Goal</option><option>You</option><option>Auditor</option></select></div><div class="pm3-field"><label>Cleanup</label><select><option>Ask after Goal completes</option><option>Keep until manual removal</option></select></div></div>','Create worktree'],
      'lsp-add':['Add language server','Map a language to an installation and host, verify the executable, then test with a representative document.','<div class="pm3-form-grid"><div class="pm3-field"><label>Language</label><input placeholder="Language"></div><div class="pm3-field"><label>Server</label><input placeholder="Executable or package"></div><div class="pm3-field"><label>Host</label><select><option>Home TrueNAS</option><option>This Mac</option><option>Windows WSL</option></select></div><div class="pm3-field"><label>Install source</label><select><option>Official package</option><option>Existing executable</option></select></div></div>','Install & test'],
      'formatter-add':['Add formatter','Choose a language, install or locate the formatter, then preview and test output before setting priority.','<div class="pm3-form-grid"><div class="pm3-field"><label>Language</label><input></div><div class="pm3-field"><label>Formatter</label><input></div><div class="pm3-field"><label>Priority</label><input type="number" value="1"></div><div class="pm3-field"><label>Format on save</label><select><option>On</option><option>Off</option></select></div></div>','Add & test'],
      'command-add':['Add command or shortcut','Register a command, record a shortcut, detect conflicts, and define context.','<div class="pm3-form-grid"><div class="pm3-field"><label>Command</label><input placeholder="Search commands"></div><div class="pm3-field"><label>Shortcut</label><input value="Press keys…"></div><div class="pm3-field" style="grid-column:1/-1"><label>When</label><input placeholder="Context expression"></div></div>','Save shortcut'],
      'mcp-add':['Add MCP server','Configure transport, command or URL, environment, authentication, exposed tools, permissions, testing, and logs.','<div class="pm3-form-grid"><div class="pm3-field"><label>Name</label><input></div><div class="pm3-field"><label>Transport</label><select><option>stdio</option><option>HTTP</option><option>SSE</option></select></div><div class="pm3-field" style="grid-column:1/-1"><label>Command or URL</label><input></div><div class="pm3-field"><label>Authentication</label><select><option>None</option><option>Secret store</option><option>OAuth</option></select></div><div class="pm3-field"><label>Permission profile</label><select><option>Ask for new tools</option><option>Read-only</option></select></div></div>','Add & test'],
      'skill-add':['Install or import a skill','Inspect source, requirements, scope, permissions, compatibility, updates, and a bounded test before enabling.','<div class="pm3-form-grid"><div class="pm3-field"><label>Source</label><select><option>Built-in catalog</option><option>Git repository</option><option>Local folder</option></select></div><div class="pm3-field"><label>Scope</label><select><option>Project</option><option>Global</option></select></div><div class="pm3-field" style="grid-column:1/-1"><label>Package or URL</label><input></div></div>','Inspect & install'],
      'filesafe-add':['Add FileSafe rule','Create an ordered allow, ask, or block rule with a concrete path picker, scope, reason, and simulation.','<div class="pm3-form-grid"><div class="pm3-field" style="grid-column:1/-1"><label>Path</label><input value="/mnt/Cursor/Puppet Master/"></div><div class="pm3-field"><label>Decision</label><select><option>Allow</option><option>Ask</option><option>Block</option></select></div><div class="pm3-field"><label>Scope</label><select><option>Project</option><option>Global</option></select></div><div class="pm3-field" style="grid-column:1/-1"><label>Reason shown to agents</label><textarea></textarea></div></div>','Add & simulate'],
      'reorder':['Reorder items','Drag rows or use explicit Move Up and Move Down controls. Keyboard and screen-reader users receive the same capability.','<div class="pm3-priority-list"><div class="pm3-priority-row"><span class="pm3-grip">⋮⋮</span><span class="pm3-priority-num">1</span><span class="pm3-priority-copy"><strong>Files</strong><span>Visible in the activity bar</span></span><span class="pm3-move-buttons"><button type="button">↑</button><button type="button">↓</button></span></div><div class="pm3-priority-row"><span class="pm3-grip">⋮⋮</span><span class="pm3-priority-num">2</span><span class="pm3-priority-copy"><strong>Search</strong><span>Visible in the activity bar</span></span><span class="pm3-move-buttons"><button type="button">↑</button><button type="button">↓</button></span></div><div class="pm3-priority-row"><span class="pm3-grip">⋮⋮</span><span class="pm3-priority-num">3</span><span class="pm3-priority-copy"><strong>Source Control</strong><span>Visible in the activity bar</span></span><span class="pm3-move-buttons"><button type="button">↑</button><button type="button">↓</button></span></div></div>','Save order'],
      'generic-resource':[manager?'Add to '+manager.title:'Add resource',manager?manager.summary:'Create or connect a managed resource.','<div class="pm3-form-grid"><div class="pm3-field"><label>Name</label><input placeholder="Display name"></div><div class="pm3-field"><label>Scope</label><select><option>Project</option><option>Global</option><option>Execution host</option></select></div><div class="pm3-field" style="grid-column:1/-1"><label>Configuration</label><textarea placeholder="The final manager uses structured controls appropriate to this resource."></textarea></div></div>','Add & verify']
    };
    return specs[type]||specs['generic-resource'];
  }

  function openModal(type, managerId) {
    closeFloating();
    var spec=modalSpec(type,managerId);
    var scrim=document.createElement('div');scrim.className='pm3-scrim';scrim.setAttribute('data-modal-close','');
    modalEl=document.createElement('div');modalEl.className='pm3-modal';modalEl.setAttribute('role','dialog');modalEl.setAttribute('aria-modal','true');modalEl.innerHTML='<div class="pm3-modal-head"><div><h2>'+esc(spec[0])+'</h2><p>'+esc(spec[1])+'</p></div><button type="button" class="pm3-icon-btn" data-modal-close>'+icon('close')+'</button></div><div class="pm3-modal-body">'+spec[2]+'</div><div class="pm3-modal-footer">'+button('Cancel',{className:'pm3-secondary-btn',attrs:'data-modal-close'})+button(spec[3],{className:'pm3-primary-btn',icon:'check',attrs:'data-modal-confirm="'+esc(type)+'" data-modal-manager="'+esc(managerId||'')+'"'})+'</div>';
    document.body.appendChild(scrim);document.body.appendChild(modalEl);modalEl.querySelector('input,select,button')&&modalEl.querySelector('input,select,button').focus();
  }

  function closeModal() {
    document.querySelectorAll('.pm3-scrim,.pm3-modal').forEach(function(el){el.remove();});modalEl=null;
  }

  function runTest(key,label) {
    state.testing[key]=true;render(true);
    setTimeout(function(){delete state.testing[key];render(true);showToast(label||'Check passed','The concept simulated the operation, captured a receipt, and returned a healthy result.');},850);
  }

  function playSound(soundId) {
    var sound=byId(DATA.sounds,soundId);if(!sound)return;
    state.soundPlaying=soundId;render(true);
    try{
      audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();
      var osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=sound.frequency||660;gain.gain.setValueAtTime(.0001,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.12,audioContext.currentTime+.02);gain.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.6);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+.62);
    }catch(error){showToast('Preview unavailable','This browser blocked audio until a user gesture or does not expose Web Audio.','warning');}
    setTimeout(function(){state.soundPlaying=null;render(true);},720);
  }

  function handleClick(event) {
    var el=event.target.closest('button,[data-route],[data-index-target]');if(!el)return;
    if(el.hasAttribute('data-nav-home')){state.home=true;state.selectedManager=null;syncHash();render();return;}
    if(el.hasAttribute('data-domain')){var d=el.getAttribute('data-domain');setRoute(d,defaultWorkspaceForDomain(d));return;}
    if(el.hasAttribute('data-workspace')){
      var wsId=el.getAttribute('data-workspace');
      if(!state.home&&state.domain&&root.querySelector('[data-workspace-block="'+cssEscape(wsId)+'"]')){
        jumpToWorkspace(wsId);
        return;
      }
      setRoute(state.domain,wsId);
      return;
    }
    if(el.hasAttribute('data-toggle-setting')){var toggleId=el.getAttribute('data-setting-id');state.values[toggleId]=!state.values[toggleId];render(true);return;}
    if(el.hasAttribute('data-radio-setting')){var radioId=el.getAttribute('data-radio-setting');state.values[radioId]=el.getAttribute('data-value');render(true);showToast('Setting updated',settingMap[radioId]?settingMap[radioId].label+' is now '+displayValue(state.values[radioId])+'.':'The value was saved.');return;}
    if(el.hasAttribute('data-related-setting')){var relatedId=el.getAttribute('data-related-setting'),related=settingMap[relatedId];if(related){var sr=searchRouteForSetting(related);setRoute(sr.domain,sr.workspace,{settingId:relatedId});}return;}
    if(el.hasAttribute('data-route')){var r=el.getAttribute('data-route').split('|');setRoute(r[0],r[1]);return;}
    if(el.hasAttribute('data-index-target')){var s=root.querySelector('[data-section-id="'+cssEscape(el.getAttribute('data-index-target'))+'"]');if(s)s.scrollIntoView({block:'start',behavior:state.reducedMotion?'auto':'smooth'});return;}
    if(el.hasAttribute('data-inspector-close')){state.detailsSetting=null;render(true);return;}
    if(el.hasAttribute('data-setting-details')){var id=el.getAttribute('data-setting-details');state.detailsSetting=state.detailsSetting===id&&!state.showAllDetails?null:id;render(true);return;}
    if(el.hasAttribute('data-show-all')){toggleShowAllExplanations();return;}
    if(el.hasAttribute('data-more-section')){var sec=el.getAttribute('data-more-section');state.expandedSections[sec]=!state.expandedSections[sec];render(true);return;}
    if(el.hasAttribute('data-setting-toggle')){var sid=el.getAttribute('data-setting-toggle');state.values[sid]=!state.values[sid];render(true);return;}
    if(el.hasAttribute('data-setting-action')){var actionId=el.getAttribute('data-setting-action');if(actionId==='general.startup.reset-home-layout'){openModal('generic-resource');showToast('Restore is previewed first','The production action would explain affected panels and request confirmation.');}else showToast('Action completed',settingMap[actionId]?settingMap[actionId].label:'The setting action ran.');return;}
    if(el.hasAttribute('data-reorder-setting')){openModal('reorder');return;}
    if(el.hasAttribute('data-manage-setting')){openModal('generic-resource');return;}
    if(el.hasAttribute('data-browse-path')){openModal('generic-resource');return;}
    if(el.hasAttribute('data-provider')){state.selectedProvider=el.getAttribute('data-provider');state.providerTab='overview';syncHash();render(true);return;}
    if(el.hasAttribute('data-provider-tab')){state.providerTab=el.getAttribute('data-provider-tab');syncHash();render(true);return;}
    if(el.hasAttribute('data-provider-tab-link')){state.providerTab=el.getAttribute('data-provider-tab-link');render(true);return;}
    if(el.hasAttribute('data-free-route')){state.selectedFreeRoute=el.getAttribute('data-free-route');render(true);return;}
    if(el.hasAttribute('data-enable-free')){var fr=freeRouteById(el.getAttribute('data-enable-free'));fr.enabled=true;fr.state='active';state.selectedFreeRoute=fr.id;closeModal();render(true);showToast('Free route enabled',fr.name+' now has nested controls inside Free Models.');return;}
    if(el.hasAttribute('data-disable-free')){var dr=freeRouteById(el.getAttribute('data-disable-free'));dr.enabled=false;dr.state='available';render(true);showToast('Free route disabled',dr.name+' remains available in the Free Models catalog.','warning');return;}
    if(el.hasAttribute('data-route-move')){var direction=Number(el.getAttribute('data-route-move')),routeId=el.getAttribute('data-route-id'),list=DATA.freeRoutes.slice().sort(function(a,b){return a.priority-b.priority;}),idx=list.findIndex(function(x){return x.id===routeId;}),swap=idx+direction;if(idx>=0&&swap>=0&&swap<list.length){var p=list[idx].priority;list[idx].priority=list[swap].priority;list[swap].priority=p;render(true);showToast('Priority updated',list[idx].name+' moved '+(direction<0?'up':'down')+'.');}return;}
    if(el.hasAttribute('data-play-sound')){playSound(el.getAttribute('data-play-sound'));return;}
    if(el.hasAttribute('data-sound-play')){playSound(el.getAttribute('data-sound-play'));return;}
    if(el.hasAttribute('data-open-provider')){setRoute('ai','providers',{providerId:el.getAttribute('data-open-provider')});return;}
    if(el.hasAttribute('data-reorder-provider-accounts')){openModal('reorder');return;}
    if(el.hasAttribute('data-record-shortcut')){showToast('Shortcut recorder ready','Press a key combination. The production control will detect conflicts before saving.');return;}
    if(el.hasAttribute('data-move-free')){var freeId=el.getAttribute('data-move-free'),dir=el.getAttribute('data-direction')==='up'?-1:1,freeList=DATA.freeRoutes.filter(function(r){return r.enabled;}).sort(function(a,b){return a.priority-b.priority;}),freeIndex=freeList.findIndex(function(r){return r.id===freeId;}),freeSwap=freeIndex+dir;if(freeIndex>=0&&freeSwap>=0&&freeSwap<freeList.length){var freeP=freeList[freeIndex].priority;freeList[freeIndex].priority=freeList[freeSwap].priority;freeList[freeSwap].priority=freeP;render(true);showToast('Priority updated',freeList[freeIndex].name+' moved '+(dir<0?'up':'down')+'.');}return;}
    if(el.hasAttribute('data-move-web')){var capabilityId=el.getAttribute('data-move-web'),routeIndex=Number(el.getAttribute('data-route-index')),routeDir=el.getAttribute('data-direction')==='up'?-1:1,cap=byId(DATA.webCapabilities,capabilityId);if(cap){var orderKey='web-'+capabilityId,order=state.routeOrders[orderKey]||cap.routes.slice(),other=routeIndex+routeDir;if(other>=0&&other<order.length){var moved=order.splice(routeIndex,1)[0];order.splice(other,0,moved);state.routeOrders[orderKey]=order;render(true);showToast('Provider priority updated',moved+' moved '+(routeDir<0?'up':'down')+' for '+cap.name+'.');}}return;}
    if(el.hasAttribute('data-test-action')){var key=el.getAttribute('data-test-action');runTest(key,el.textContent.trim()+' passed');return;}
    if(el.hasAttribute('data-sim-action')){showToast(el.getAttribute('data-sim-action'),'The concept completed this bounded interaction and retained an inspectable receipt.');return;}
    if(el.hasAttribute('data-modal-open')){openModal(el.getAttribute('data-modal-open'),el.getAttribute('data-modal-manager'));return;}
    if(el.hasAttribute('data-modal-close')){closeModal();return;}
    if(el.hasAttribute('data-modal-confirm')){var type=el.getAttribute('data-modal-confirm');if(type==='sound-upload'){var file=document.querySelector('[data-sound-file]'),name=document.querySelector('[data-sound-name]');var label=(name&&name.value)||(file&&file.files&&file.files[0]?file.files[0].name.replace(/\.[^.]+$/,''):'Uploaded Sound');DATA.sounds.push({id:'custom-'+Date.now(),name:label,source:'Uploaded',duration:'0:02',assigned:[],frequency:740});}closeModal();render(true);showToast('Saved',type==='sound-upload'?'The sound was added to the concept library.':'The setup flow completed successfully.');return;}
    if(el.hasAttribute('data-check')){var checkKey=el.getAttribute('data-check');state.checks[checkKey]=!state.checks[checkKey];el.setAttribute('aria-pressed',state.checks[checkKey]?'true':'false');return;}
    if(el.hasAttribute('data-check-toggle')){var ck=el.getAttribute('data-check-toggle');state.checks[ck]=!state.checks[ck];el.setAttribute('aria-pressed',state.checks[ck]?'true':'false');return;}
    if(el.hasAttribute('data-page-options')){openMenu(el,pageOptionsItems());return;}
    if(el.hasAttribute('data-global-actions')){openMenu(el,[{label:'Copy settings from project',icon:'layers',command:'copy'},{label:'Import or export settings',icon:'download',command:'lifecycle'},{label:'Run Settings Doctor',icon:'gauge',command:'doctor'},{label:'Restore defaults…',icon:'refresh',command:'restore',danger:true}]);return;}
    if(el.hasAttribute('data-page-actions')){openMenu(el,pageOptionsItems());return;}
    if(el.hasAttribute('data-provider-actions')){var provider=providerById(state.selectedProvider);openMenu(el,[{label:'Test connection and invocation',icon:'test',command:'provider-test'},{label:'Refresh models and plan',icon:'refresh',command:'provider-refresh'},{label:'View setup receipt',icon:'file',command:'provider-receipt'},{label:provider.state==='active'?'Disable provider':'Start setup',icon:provider.state==='active'?'close':'plus',command:'provider-toggle',danger:provider.state==='active'}]);return;}
    if(el.hasAttribute('data-project-menu')){openMenu(el,[{label:'Puppet Master · Project settings',icon:'folder',command:'project'},{label:'Copy from another project',icon:'layers',command:'copy'},{label:'Global settings',icon:'globe',command:'global'}]);return;}
    if(el.hasAttribute('data-color-toggle')){state.color=state.color==='dark'?'light':'dark';storageSet('pm-settings-v3-color',state.color);render(true);return;}
    if(el.hasAttribute('data-motion-toggle')){state.reducedMotion=!state.reducedMotion;storageSet('pm-settings-v3-motion',state.reducedMotion?'reduced':'full');render(true);showToast(state.reducedMotion?'Reduced motion enabled':'Full motion enabled','Transitions update immediately.');return;}
    if(el.hasAttribute('data-close')){showToast('Settings concept remains open','In Puppet Master this control returns to the previous surface.');return;}
    if(el.hasAttribute('data-back')){state.home=true;syncHash();render();return;}
  }

  function handleDocumentClick(event) {
    if(event.target.closest('.pm3-scrim')){closeModal();return;}
    if(event.target.closest('.pm3-modal button')){handleClick(event);return;}
    var result=event.target.closest('[data-search-result]');if(result){selectSearchResult(result);return;}
    var command=event.target.closest('[data-menu-command]');if(command){var c=command.getAttribute('data-menu-command');closeFloating();if(c==='show-all'){toggleShowAllExplanations();return;}if(c==='advanced'){toggleAdvancedControls();return;}if(c==='reset-section'){resetCurrentPageSettings();return;}if(c==='doctor')setRoute('system','health');else if(c==='lifecycle')setRoute('system','data',{managerId:'m.lifecycle'});else if(c==='provider-test')runTest('provider-'+state.selectedProvider,'Provider checks passed');else if(c==='provider-refresh')runTest('provider-refresh','Catalog refreshed');else if(c==='provider-toggle')showToast('Provider state previewed','The production flow would verify dependencies and ask before disabling active routes.','warning');else if(c==='copy-link'){navigator.clipboard&&navigator.clipboard.writeText(location.href);showToast('Deep link copied','The current destination and selected resource are encoded in the URL.');}else if(c==='restore')showToast('Restore defaults requires confirmation','No settings were changed by this concept simulation.','warning');else showToast('Action opened',titleCase(c));return;}
    if(menuEl&&!event.target.closest('.pm3-menu')&&!event.target.closest('[data-global-actions],[data-page-actions],[data-page-options],[data-provider-actions],[data-project-menu]')){menuEl.remove();menuEl=null;}
    if(searchEl&&!event.target.closest('.pm3-search-results')&&!event.target.closest('[data-global-search],[data-hero-search]')){searchEl.remove();searchEl=null;}
  }

  function handleInput(event) {
    var target=event.target;
    if(target.matches('[data-global-search],[data-hero-search]')){openSearch(target);return;}
    if(target.matches('[data-setting-input]')){var inputId=target.getAttribute('data-setting-id');state.values[inputId]=target.type==='number'?Number(target.value):target.value;return;}
    if(target.matches('[data-setting-range]')){var rangeId=target.getAttribute('data-setting-id');state.values[rangeId]=Number(target.value);var out=target.parentNode.querySelector('output');if(out)out.textContent=target.value+'%';return;}
  }

  function handleChange(event) {
    var target=event.target;
    if(target.matches('[data-setting-select],[data-setting-input],[data-setting-range]')){
      var id=target.getAttribute('data-setting-id');
      state.values[id]=target.type==='number'||target.type==='range'?Number(target.value):target.value;
      showToast('Setting updated',settingMap[id]?settingMap[id].label+' is now '+displayValue(state.values[id])+'.':'The value was saved.');
    }
  }

  function handleKeydown(event) {
    if((event.metaKey||event.ctrlKey)&&String(event.key).toLowerCase()==='k'){event.preventDefault();var input=root.querySelector('[data-global-search]');if(input){input.focus();openSearch(input);}return;}
    if(event.key==='Escape'){closeFloating();closeModal();}
  }

  function mount(options) {
    options=options||{};variant=options.variant==='kimi'?'kimi':'fable';root=typeof options.root==='string'?document.querySelector(options.root):(options.root||document.getElementById('pm-settings-concept12'));
    if(!root) throw new Error('Puppet Master Settings Concept 12 root was not found.');
    state.color=storageGet('pm-settings-v3-color')||'dark';state.reducedMotion=storageGet('pm-settings-v3-motion')==='reduced';
    if(!location.hash)state.home=true;else readHash();
    root.addEventListener('click',handleClick);root.addEventListener('input',handleInput);root.addEventListener('change',handleChange);document.addEventListener('click',handleDocumentClick);document.addEventListener('keydown',handleKeydown);
    window.addEventListener('hashchange',function(){readHash();render();});
    render();
  }

  window.PMSettingsConcept12={mount:mount,version:'3.0.12-concept12'};
})();
