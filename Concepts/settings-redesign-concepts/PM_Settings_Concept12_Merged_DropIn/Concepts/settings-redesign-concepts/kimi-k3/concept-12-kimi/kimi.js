(() => {
  'use strict';

  const D = window.PM12_DATA;
  const root = document.getElementById('pm-settings-root');
  const STORAGE_KEY = 'pm-settings-kimi-concept12-v4';
  const actionCallbacks = new Map();
  let actionSeq = 0;
  let scrollCleanup = null;
  let tooltipTimer = null;
  let tooltipEl = null;
  let soundTimer = null;
  let searchEl = null;
  let searchInputEl = null;
  let embedMode = false;
  let domainSectionMap = {};
  let pendingScroll = null;
  let softRemount = false;
  let preservedScrollTop = null;
  let detailHideTimer = null;
  let detailInspectorVisible = false;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  const escAttr = escapeHtml;
  const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);
  const slug = (s = '') => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const nowLabel = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const defaultState = {
    home: true,
    domain: 'general',
    workspace: 'app-input',
    activeSection: {},
    detailSetting: null,
    settings: {},
    changed: {},
    selectedProvider: 'claude-code',
    providerTab: 'overview',
    selectedFreeRoute: 'free-openrouter',
    selectedWebRoute: 'search',
    selectedMediaRoute: 'image-generation',
    toolTab: 'lsps',
    selectedTool: { lsps: 'rust-analyzer', formatters: 'prettier', mcps: 'github-mcp', commands: 'goal-new', skills: 'frontend-polish', plugins: 'github', agentTools: 'browser' },
    testingTab: 'profiles',
    selectedTestProfile: 'thorough',
    selectedDebugProfile: 'native',
    memoryTab: 'memories',
    memoryFilter: 'All',
    selectedMemory: 'm1',
    goalTab: 'templates',
    selectedGoalTemplate: 'implementation',
    selectedGoal: 'g1',
    personaTab: 'personas',
    personaFilter: 'All',
    personaQuery: '',
    selectedPersona: 'puppet-master',
    selectedCrew: 'default',
    sourceTab: 'connections',
    notificationTab: 'overview',
    selectedSound: 'peon-ready',
    soundPlaying: null,
    eventChecks: {},
    selectedDestination: 'in-app',
    selectedNotificationAgent: 'completion',
    permissionTab: 'profiles',
    selectedPermissionProfile: 'hands-off',
    backupTab: 'overview',
    projectSyncTab: 'overview',
    projectHistoryTab: 'history',
    doctorRunning: false,
    doctorLastRun: 'Not run in this demo session',
    bsd: clone(D.bsd),
    freeRoutes: clone(D.freeRoutes),
    providers: clone(D.providers),
    webRoutes: clone(D.webRoutes),
    mediaRoutes: clone(D.mediaRoutes),
    toolchain: clone(D.toolchain),
    testProfiles: clone(D.testProfiles),
    debugProfiles: clone(D.debugProfiles),
    memories: clone(D.memories),
    goalTemplates: clone(D.goalTemplates),
    activeGoals: clone(D.activeGoals),
    personas: clone(D.personas),
    crews: clone(D.crews),
    notifications: clone(D.notifications),
    permissionProfiles: clone(D.permissionProfiles),
    permissionRules: clone(D.permissionRules),
    fileSafePaths: clone(D.fileSafePaths),
    backup: clone(D.backupState),
    sourceControl: clone(D.sourceControl),
    railOpen: false,
    resourceRosterOpen: false
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return mergeState(clone(defaultState), saved);
    } catch (_) {
      return clone(defaultState);
    }
  }

  function mergeState(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    const merge = (target, source) => {
      for (const [key, val] of Object.entries(source)) {
        if (val && typeof val === 'object' && !Array.isArray(val) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          merge(target[key], val);
        } else if (val !== undefined) target[key] = val;
      }
      return target;
    };
    return merge(base, saved);
  }

  let state = loadState();

  function saveState() {
    searchIndexDirty = true;
    const copy = clone(state);
    delete copy.home;
    delete copy.railOpen;
    delete copy.resourceRosterOpen;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(copy)); } catch (_) {}
  }

  const iconPaths = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-7h5v7"/>',
    brain: '<path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v1a3.5 3.5 0 0 0 0 7v.5A3.5 3.5 0 0 0 9.5 20"/><path d="M14.5 4.5A3.5 3.5 0 0 1 18 8v1a3.5 3.5 0 0 1 0 7v.5a3.5 3.5 0 0 1-3.5 3.5"/><path d="M12 4v16M8 9h4m4 6h-4"/>',
    code: '<path d="m8 9-4 3 4 3m8-6 4 3-4 3M14 5l-4 14"/>',
    memory: '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3"/>',
    branch: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="8" cy="19" r="2"/><path d="M6 7v4a6 6 0 0 0 6 6h4M8 17V9a3 3 0 0 1 3-3h5"/>',
    folder: '<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"/>',
    shield: '<path d="M12 3 4.5 6v5.4c0 4.6 3.1 7.9 7.5 9.6 4.4-1.7 7.5-5 7.5-9.6V6z"/><path d="m8.7 12 2.1 2.1 4.6-4.6"/>',
    system: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    alert: '<path d="M12 3 2.8 20h18.4z"/><path d="M12 9v4m0 3h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6H5V6h6"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    pause: '<path d="M8 5h3v14H8zM14 5h3v14h-3z"/>',
    refresh: '<path d="M20 6v6h-6M4 18v-6h6"/><path d="M6.5 8.5A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 11.5-2.5"/>',
    test: '<path d="M9 3h6M10 3v5l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 17l-5-9V3"/><path d="M8 15h8"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 20h16"/>',
    network: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="m7.5 7.5 3.2 8m5.8-8-3.2 8M8 6h8"/>',
    browser: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15"/>',
    brackets: '<path d="M8 4H5v16h3m8-16h3v16h-3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 20"/>',
    eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/>',
    volume: '<path d="M5 10H2v4h3l4 4V6zM14 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/>',
    wave: '<path d="M3 12h2l2-6 4 12 3-9 3 6 2-3h2"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h4M9 13h6m-6 4h6"/>',
    grip: '<circle cx="9" cy="7" r="1"/><circle cx="15" cy="7" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="17" r="1"/><circle cx="15" cy="17" r="1"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    pin: '<path d="m9 4 6 6M8 9l-4 6 5 1 1 5 6-4M14 5l5 5"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8m-3 3 2 2m-5 1 2 2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0m0-5a5 5 0 0 1 6 5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    archive: '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M3 3h18v4H3zM9 11h6"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
    save: '<path d="M5 3h12l3 3v15H4V4a1 1 0 0 1 1-1Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A7 7 0 0 0 15 6l-.3-2.5h-4L10.4 6A7 7 0 0 0 8 7.1l-2.4-1-2 3.4L5.6 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1A7 7 0 0 0 10.4 18l.3 2.5h4L15 18a7 7 0 0 0 1.6-1.1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
    route: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h4a4 4 0 0 1 4 4v4a4 4 0 0 0 4 4M7 6l3-3M7 6l3 3"/>',
    terminal: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m7 9 3 3-3 3m6 0h4"/>',
    rocket: '<path d="M14 4c3-2 6-1 6-1s1 3-1 6l-5 5-4-4zM9 11l-4 1-2 4 5 1m5-3 1 5-4 2-1-4"/><circle cx="16" cy="7" r="1"/>',
    restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    arrowRight: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    sliders: '<path d="M4 7h10M18 7h2M14 5v4M4 17h4M12 17h8M8 15v4M4 12h6M14 12h6M10 10v4"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.7 5.2"/><path d="M14 11a5 5 0 0 0-7.07 0L4.8 13.12a5 5 0 0 0 7.07 7.07L13.3 18.8"/>'
  };

  function icon(name, cls = '') {
    const path = iconPaths[name] || iconPaths.settings;
    return `<span class="icon ${cls}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg></span>`;
  }

  function registerAction(fn) {
    const id = `cb-${++actionSeq}`;
    actionCallbacks.set(id, fn);
    return id;
  }

  function getDomain(id = state.domain) { return D.domains.find(d => d.id === id) || D.domains[0]; }
  function getWorkspace(domain = getDomain(), id = state.workspace) { return domain.workspaces.find(w => w.id === id) || domain.workspaces[0]; }

  function statusClass(status = '') {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('ready') || s.includes('healthy') || s.includes('pass') || s.includes('verified')) return 'active';
    if (s.includes('attention') || s.includes('setup') || s.includes('warning') || s.includes('sign in') || s.includes('retry')) return 'attention';
    if (s.includes('error') || s.includes('fail') || s.includes('blocked') || s.includes('deny')) return 'error';
    if (s.includes('running') || s.includes('refresh')) return 'running';
    return slug(status);
  }

  function renderStatus(status, label = status) {
    return `<span class="badge ${statusClass(status) === 'active' ? 'green' : statusClass(status) === 'attention' ? 'amber' : statusClass(status) === 'error' ? 'red' : ''}"><span class="status-dot ${statusClass(status)}"></span>${escapeHtml(label)}</span>`;
  }

  function cssEscape(value) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(String(value));
    return String(value).replace(/(["\\.#:[\]()=])/g, '\\$1');
  }

  function navigate(domainId, workspaceId, options = {}) {
    const domain = getDomain(domainId);
    const workspace = domain.workspaces.find(w => w.id === workspaceId) || domain.workspaces[0];
    const sameDomainView = !state.home && state.domain === domain.id && !!root.querySelector('[data-workspace-block]');
    const hadDetail = !!state.detailSetting;
    state.home = false;
    state.domain = domain.id;
    state.workspace = workspace.id;
    if (Object.prototype.hasOwnProperty.call(options, 'detailSetting')) state.detailSetting = options.detailSetting;
    else state.detailSetting = null;
    state.railOpen = false;
    state.resourceRosterOpen = false;
    if (options.section) state.activeSection[workspace.id] = options.section;
    saveState();

    const needsRemount = !sameDomainView || hadDetail || !!state.detailSetting;
    if (!needsRemount) {
      updateHash();
      jumpToWorkspace(workspace.id, options.section ? 'auto' : undefined);
      if (options.section) scrollToSection(options.section, true);
      return;
    }

    pendingScroll = { workspace: workspace.id, section: options.section || null };
    renderApp();
  }

  function goHome() {
    state.home = true;
    state.detailSetting = null;
    state.railOpen = false;
    pendingScroll = null;
    renderApp();
  }

  function renderApp(options = {}) {
    if (scrollCleanup) { scrollCleanup(); scrollCleanup = null; }
    document.removeEventListener('keydown', onDetailEsc, true);
    clearTimeout(detailHideTimer);
    detailInspectorVisible = false;
    closeSearch();
    document.querySelectorAll('.popover').forEach(el => el.remove());
    softRemount = !!options.soft && !state.home;
    if (softRemount) {
      const scroller = document.getElementById('settings-document');
      preservedScrollTop = scroller ? scroller.scrollTop : null;
      pendingScroll = null;
    } else {
      preservedScrollTop = null;
    }
    const domain = getDomain();
    const workspace = getWorkspace(domain);
    root.innerHTML = `
      <div class="pm-shell ${state.railOpen ? 'rail-open' : ''}">
        ${renderDomainRail(domain)}
        <section class="workspace-shell">
          ${renderTopbar(domain, workspace)}
          ${state.home ? '<div></div>' : renderWorkspaceTabs(domain, workspace)}
          <div class="workspace-stage" id="workspace-stage">
            ${state.home ? renderHome() : renderDomainContinuous(domain)}
          </div>
        </section>
      </div>
      <div class="toast-stack" id="toast-stack"></div>`;
    root.classList.add('is-ready');
    requestAnimationFrame(afterRender);
    updateHash();
  }

  function renderDomainRail(activeDomain) {
    const domains = D.domains.map(domain => `
      <button type="button" class="domain-link ${!state.home && activeDomain.id === domain.id ? 'active' : ''}" data-action="navigate-domain" data-domain="${domain.id}">
        ${icon(domain.icon)}<span class="domain-copy"><strong>${escapeHtml(domain.label)}</strong><small>${escapeHtml(domain.summary)}</small></span>
      </button>`).join('');
    return `<aside class="domain-rail" aria-label="Settings domains">
      <div class="rail-head">
        <h1 class="rail-title">Settings</h1>
        <div class="rail-project">Project: Puppet Master</div>
      </div>
      <div class="rail-search-wrap">
        <label class="rail-search">${icon('search')}<input data-global-search autocomplete="off" spellcheck="false" placeholder="Search settings, providers, actions…" aria-label="Search Settings"/><span class="kbd">⌘ K</span></label>
      </div>
      <div class="rail-scroll">
        <button type="button" class="side-link ${state.home ? 'active' : ''}" data-action="home">${icon('home')}<span>Settings Home</span></button>
        <div class="rail-heading">Chapters</div>
        <nav class="domain-list">${domains}</nav>
        <div class="rail-heading">Essential setup</div>
        <div class="side-card">
          <button type="button" class="side-link" data-action="navigate" data-domain="ai" data-workspace="providers">${icon('brain')}<span class="domain-copy"><strong>AI Providers</strong><small>6 active · 3 need attention</small></span>${icon('chevron')}</button>
          <button type="button" class="side-link" data-action="navigate" data-domain="source" data-workspace="source-manager">${icon('branch')}<span class="domain-copy"><strong>Source Control</strong><small>GitHub connected · Git + Jujutsu ready</small></span>${icon('chevron')}</button>
          <button type="button" class="side-link" data-action="navigate" data-domain="system" data-workspace="backup">${icon('archive')}<span class="domain-copy"><strong>Backups</strong><small>Last verified today</small></span>${icon('chevron')}</button>
        </div>
        <div class="rail-heading">Settings health</div>
        <div class="side-card">
          <div class="side-health">3 items need attention</div>
          <div class="side-card-note">Provider sign-in, entitlement, and backup setup need review.</div>
          <button type="button" class="rail-health-btn" data-action="home">View overview</button>
        </div>
      </div>
    </aside>`;
  }

  function renderTopbar(domain, workspace) {
    const workspaceLabel = state.home ? 'Home' : workspace.label;
    return `<header class="topbar">
      <button class="mobile-menu" data-action="toggle-rail" aria-label="Open Settings navigation">${icon('menu')}</button>
      <div class="breadcrumb">
        <span class="breadcrumb-domain">${state.home ? 'Settings' : escapeHtml(domain.label)}</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-workspace">${escapeHtml(workspaceLabel)}</span>
      </div>
      <div class="topbar-spacer"></div>
    </header>`;
  }

  function renderChromeActions(extra = '') {
    return `<div class="page-actions">
      ${extra || ''}
      <button class="project-pill" data-action="project-menu">${icon('folder')} Puppet Master ${icon('down')}</button>
      <button class="icon-btn page-options-btn" data-action="page-options" title="Page options" aria-label="Page options">${icon('sliders')}</button>
    </div>`;
  }

  function renderWorkspaceTabs(domain, activeWorkspace) {
    return `<nav class="workspace-tabs" aria-label="${escAttr(domain.label)} workspaces">${domain.workspaces.map(workspace => `
      <button type="button" class="workspace-tab ${workspace.id === activeWorkspace.id ? 'active' : ''}" data-action="jump-workspace" data-workspace="${escAttr(workspace.id)}">${escapeHtml(workspace.label)}</button>`).join('')}</nav>`;
  }

  function workspaceMeta(workspace, domain) {
    if (workspace.type === 'settings') {
      const description = domain.id === 'projects'
        ? 'Every project-level setting in one continuous, searchable page. Values can inherit, copy then diverge, or remain independent.'
        : domain.id === 'system'
          ? 'Expert behavior and deliberate recovery actions. Provider, source-control, and MCP configuration remain in their owning managers.'
          : 'Ordinary settings stay aligned and scannable; rich explanations open on demand without navigating away.';
      return { title: workspace.label, description };
    }
    return { title: workspace.label, description: domain.summary };
  }

  function findSettingInDomain(id, domain) {
    if (!id) return null;
    for (const workspace of domain.workspaces) {
      if (workspace.type !== 'settings') continue;
      const found = findSetting(id, workspace);
      if (found) return { ...found, workspace };
    }
    return null;
  }

  function renderWorkspaceBody(workspace, domain) {
    embedMode = true;
    try {
      return renderWorkspace(workspace, domain);
    } finally {
      embedMode = false;
    }
  }

  function renderPageIndexCard(workspaces, activeWsId, activeSection) {
    const groups = workspaces.map(w => {
      const sections = domainSectionMap[w.id] || [];
      return `<button type="button" class="page-index-title ${w.id === activeWsId ? 'is-current' : ''}" data-action="jump-workspace" data-workspace="${escAttr(w.id)}">${escapeHtml(w.label)}</button>` +
        sections.map(s => `<button type="button" class="index-link ${s.id === activeSection ? 'is-active' : ''}" data-action="scroll-section" data-section="${escAttr(s.id)}" data-workspace="${escAttr(w.id)}">${escapeHtml(s.label)}</button>`).join('');
    }).join('');
    return `<aside class="page-index" aria-label="On this page"><div class="page-index-card" data-page-index-links>${groups}</div></aside>`;
  }

  function renderDomainContinuous(domain) {
    domainSectionMap = {};
    const workspaces = domain.workspaces;
    const blocks = workspaces.map(w => {
      let sections = [];
      let body = '';
      const fullBleed = w.type !== 'settings';
      if (w.type === 'settings') {
        sections = (w.sections || []).map(s => ({ id: s.id, label: s.label }));
        body = (w.sections || []).map((section, index) => renderSettingsSection(section, w, index)).join('');
      } else {
        const sid = `${w.id}:main`;
        sections = [{ id: sid, label: w.label }];
        body = `<div class="manager-section" data-section-id="${escAttr(sid)}" id="section-${escAttr(sid)}">${renderWorkspaceBody(w, domain)}</div>`;
      }
      domainSectionMap[w.id] = sections;
      const meta = workspaceMeta(w, domain);
      return `<section class="workspace-block ${fullBleed ? 'is-full-bleed' : ''}" id="workspace-${escAttr(w.id)}" data-workspace-block="${escAttr(w.id)}">
        <header class="workspace-separator"><h2>${escapeHtml(meta.title)}</h2><p>${escapeHtml(meta.description)}</p></header>
        <div class="workspace-block-body">${body}</div>
      </section>`;
    }).join('');

    let activeWs = state.workspace;
    if (!domainSectionMap[activeWs] && workspaces[0]) activeWs = workspaces[0].id;
    const sections = domainSectionMap[activeWs] || [];
    let activeSection = state.activeSection[activeWs];
    if (!activeSection || !sections.some(s => s.id === activeSection)) activeSection = sections[0]?.id;
    if (activeSection) state.activeSection[activeWs] = activeSection;

    const detail = findSettingInDomain(state.detailSetting, domain);
    return `<div class="document-layout ${detail ? 'inspector-open' : ''}${softRemount ? ' is-soft-remount' : ' page-enter'}">
      ${renderPageIndexCard(workspaces, activeWs, activeSection)}
      <div class="document-main">
        <div class="document-toolbar">${renderChromeActions()}</div>
        <div class="document-scroll" id="settings-document" data-scroll-root>
          <main class="domain-document">${blocks}<div class="settings-end-space" aria-hidden="true"></div></main>
        </div>
      </div>
      <div class="detail-scrim" data-action="close-details" style="display:none"></div>
      <aside class="detail-inspector" aria-label="Setting explanation" aria-hidden="true" style="display:none"></aside>
    </div>`;
  }

  function renderHome() {
    return `<div class="home-page page-enter">
      <section class="home-hero">
        <div class="home-eyebrow">Project settings</div>
        <h1 class="home-title">Find anything. Configure the essentials first.</h1>
        <p class="home-lede">Search by setting name, provider, resource, action, problem, or plain-language task. Detailed explanations stay available without turning every page into a wall of text.</p>
        <label class="hero-search">${icon('search')}<input data-hero-search autocomplete="off" spellcheck="false" placeholder="Search settings, providers, accounts, actions, or describe what you need…" aria-label="Search all Settings"/><span class="kbd">⌘ K</span></label>
      </section>
      <section class="home-grid">
        <div class="home-panel">
          <div class="home-panel-header"><span class="home-panel-title">Essential setup</span><span class="home-panel-meta">Frequent destinations</span></div>
          <button class="setup-row" data-action="navigate" data-domain="ai" data-workspace="providers"><span class="setup-icon">${icon('brain')}</span><span class="setup-copy"><span class="setup-label">AI Providers</span><span class="setup-meta">6 active · 3 need attention · configure accounts and exact models</span></span>${icon('chevron')}</button>
          <button class="setup-row" data-action="navigate" data-domain="source" data-workspace="source-manager"><span class="setup-icon">${icon('branch')}</span><span class="setup-copy"><span class="setup-label">Source Control</span><span class="setup-meta">GitHub connected · Git and Jujutsu ready</span></span>${icon('chevron')}</button>
          <button class="setup-row" data-action="navigate" data-domain="system" data-workspace="backup"><span class="setup-icon">${icon('archive')}</span><span class="setup-copy"><span class="setup-label">Backup & Restore</span><span class="setup-meta">Last backup verified today · 2 schedules enabled</span></span>${icon('chevron')}</button>
        </div>
        <div class="home-panel">
          <div class="home-panel-header"><span class="home-panel-title">Needs attention</span><span class="home-panel-meta">3 actionable items</span></div>
          <button class="attention-row" data-action="select-provider" data-provider="github-copilot"><span class="status-dot attention"></span><span class="setup-copy"><span class="setup-label">GitHub Copilot cannot invoke</span><span class="setup-meta">Authentication is valid, but the account has no active seat.</span></span>${icon('chevron')}</button>
          <button class="attention-row" data-action="select-provider" data-provider="antigravity"><span class="status-dot attention"></span><span class="setup-copy"><span class="setup-label">Google Antigravity needs sign-in</span><span class="setup-meta">Reconnect the detected CLI to refresh its model catalog.</span></span>${icon('chevron')}</button>
          <button class="attention-row" data-action="navigate" data-domain="general" data-workspace="notifications"><span class="status-dot attention"></span><span class="setup-copy"><span class="setup-label">Phone notification test failed</span><span class="setup-meta">The ntfy destination timed out and is retrying.</span></span>${icon('chevron')}</button>
        </div>
      </section>
      <section class="domain-directory">${D.domains.map(domain => `
        <button class="domain-card" data-action="navigate-domain" data-domain="${domain.id}">
          <span class="domain-card-icon">${icon(domain.icon)}</span>
          <div class="domain-card-label">${escapeHtml(domain.label)}</div>
          <div class="domain-card-desc">${escapeHtml(domain.summary)}</div>
        </button>`).join('')}</section>
    </div>`;
  }

  function renderWorkspace(workspace, domain) {
    const map = {
      settings: () => renderSettingsWorkspace(workspace, domain),
      providers: renderProviders,
      webRoutes: renderWebRoutes,
      mediaRoutes: renderMediaRoutes,
      bsd: renderBSD,
      toolchain: renderToolchain,
      testing: renderTesting,
      memory: renderMemory,
      goals: renderGoals,
      personas: renderPersonas,
      owners: renderOwners,
      sourceControl: renderSourceControl,
      notifications: renderNotifications,
      projectSync: renderProjectSync,
      projectHistory: renderProjectHistory,
      permissions: renderPermissions,
      settingsTransfer: renderSettingsTransfer,
      backup: renderBackup,
      doctor: renderDoctor,
      servers: renderServers,
      updates: renderUpdates
    };
    return (map[workspace.type] || (() => renderUnknown(workspace)))();
  }

  function renderSettingsWorkspace(workspace, domain) {
    const sections = workspace.sections || [];
    if (embedMode) {
      return sections.map((section, index) => renderSettingsSection(section, workspace, index)).join('');
    }
    const active = state.activeSection[workspace.id] || sections[0]?.id;
    const detail = findSetting(state.detailSetting, workspace);
    const meta = workspaceMeta(workspace, domain);
    return `<div class="settings-layout ${detail ? 'with-detail' : ''} page-enter">
      ${renderLocalNav(workspace, sections, active)}
      <div class="settings-document" id="settings-document">
        <header class="settings-doc-header">
          <div class="settings-doc-top">
            <div class="page-header-lead">
              <div class="page-heading"><h1 class="page-title">${escapeHtml(meta.title)}</h1><p class="page-description">${escapeHtml(meta.description)}</p></div>
            </div>
            ${renderChromeActions()}
          </div>
        </header>
        ${sections.map((section, index) => renderSettingsSection(section, workspace, index)).join('')}
        <div class="settings-end-space" aria-hidden="true"></div>
      </div>
      ${detail ? renderDetailInspector(detail.setting, detail.section, workspace) : ''}
    </div>`;
  }

  function renderLocalNav(workspace, sections, active) {
    return renderPageIndexCard([workspace], workspace.id, active);
  }

  function renderSettingsSection(section, workspace, index) {
    return `<section class="settings-section" id="section-${section.id}" data-section-id="${section.id}">
      <div class="section-heading-row"><div class="section-heading-copy"><div class="section-kicker">${escapeHtml(section.eyebrow || `Section ${index + 1}`)}</div><h2 class="section-title">${escapeHtml(section.label)}</h2><p class="section-description">${escapeHtml(section.description || '')}</p></div><button class="btn small" data-action="section-details" data-section="${section.id}" data-workspace="${workspace.id}">${icon('info')} Section guide</button></div>
      <div class="setting-list">${section.settings.map(setting => renderSettingRow(setting, section, workspace)).join('')}</div>
    </section>`;
  }

  function renderSettingRow(setting, section, workspace) {
    const current = settingValue(setting);
    const changed = !!state.changed[setting.id];
    return `<div class="setting-row ${changed ? 'is-changed' : ''}" id="setting-${setting.id}">
      <div class="setting-copy"><div class="setting-label">${escapeHtml(setting.label)}${changed ? '<span class="badge purple">Changed</span>' : ''}</div><div class="setting-description">${escapeHtml(setting.description)}</div></div>
      <div class="setting-control">${renderControl(setting, current)}</div>
      <button type="button" class="btn details-btn" aria-expanded="${state.detailSetting === setting.id ? 'true' : 'false'}" data-action="setting-details" data-setting="${setting.id}" data-workspace="${workspace.id}" data-section="${section.id}" data-tooltip="Open the full explanation without leaving this page">Details</button>
    </div>`;
  }

  function settingValue(setting) {
    return Object.prototype.hasOwnProperty.call(state.settings, setting.id) ? state.settings[setting.id] : setting.value;
  }

  function renderControl(setting, value) {
    const data = `data-setting="${escAttr(setting.id)}"`;
    if (setting.control === 'toggle') return `<button class="toggle ${value ? 'on' : ''}" data-action="toggle-setting" ${data} aria-pressed="${!!value}" aria-label="${escAttr(setting.label)}"></button>`;
    if (setting.control === 'select') return `<select class="select-control" data-action="change-setting" ${data}>${(setting.options || []).map(o => `<option ${o === value ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}</select>`;
    if (setting.control === 'segmented') return `<div class="segmented">${(setting.options || []).map(o => `<button class="${o === value ? 'active' : ''}" data-action="set-setting" ${data} data-value="${escAttr(o)}">${escapeHtml(o)}</button>`).join('')}</div>`;
    if (setting.control === 'stepper') return `<div class="stepper"><button data-action="step-setting" ${data} data-step="-1">−</button><span class="stepper-value">${escapeHtml(value)} ${escapeHtml(setting.unit || '')}</span><button data-action="step-setting" ${data} data-step="1">+</button></div>`;
    if (setting.control === 'swatches') {
      const colors = { Violet:'#8b5cf6', Cyan:'#39bfe6', Rose:'#e96a9d', Amber:'#e9aa52', Emerald:'#43c78b' };
      return `<div class="swatches">${(setting.options || []).map(o => `<button class="swatch ${o === value ? 'active' : ''}" style="background:${colors[o] || '#888'}" data-action="set-setting" ${data} data-value="${escAttr(o)}" data-tooltip="${escAttr(o)}"></button>`).join('')}</div>`;
    }
    if (setting.control === 'multiselect') return `<div class="chip-select">${(setting.options || []).map(o => `<button class="${Array.isArray(value) && value.includes(o) ? 'active' : ''}" data-action="toggle-multi-setting" ${data} data-value="${escAttr(o)}">${escapeHtml(o)}</button>`).join('')}</div>`;
    if (setting.control === 'reorder') return `<div class="reorder-control">${(value || []).map((item, index) => `<div class="reorder-item"><span class="grip">${icon('grip')}</span><span>${escapeHtml(item)}</span><span class="move-buttons"><button data-action="move-setting-item" ${data} data-index="${index}" data-direction="-1" aria-label="Move ${escAttr(item)} up">↑</button><button data-action="move-setting-item" ${data} data-index="${index}" data-direction="1" aria-label="Move ${escAttr(item)} down">↓</button></span></div>`).join('')}</div>`;
    if (setting.control === 'text') return `<input class="text-control" value="${escAttr(value)}" data-action="input-setting" ${data} />`;
    if (setting.control === 'textarea') return `<textarea class="text-control" data-action="input-setting" ${data}>${escapeHtml(value)}</textarea>`;
    if (setting.control === 'resource') return `<button class="btn" data-action="open-resource-setting" ${data}>${escapeHtml(value)} ${icon('chevron')}</button>`;
    if (setting.control === 'action') return `<button class="btn primary" data-action="run-setting-action" ${data}>${escapeHtml(value)} ${icon('arrowRight')}</button>`;
    return `<span>${escapeHtml(value)}</span>`;
  }

  function findSetting(id, workspace) {
    if (!id || !workspace?.sections) return null;
    for (const section of workspace.sections) {
      const setting = section.settings.find(s => s.id === id);
      if (setting) return { setting, section };
    }
    return null;
  }

  function findSettingGlobal(id) {
    for (const domain of D.domains) {
      for (const workspace of domain.workspaces) {
        if (workspace.type !== 'settings') continue;
        const found = findSetting(id, workspace);
        if (found) return { ...found, workspace, domain };
      }
    }
    return null;
  }

  function renderDetailInspectorBody(setting, section, workspace) {
    const d = setting.detail || {};
    return `<div class="detail-head"><div class="detail-head-copy"><div class="detail-title">${escapeHtml(setting.label)}</div><div class="detail-status">${escapeHtml(section.label)} · ${state.changed[setting.id] ? 'Changed in this project' : 'Using the current configured value'}</div></div><button type="button" class="icon-btn" data-action="close-details" aria-label="Close explanation">${icon('close')}</button></div>
      <div class="detail-body">
        ${detailBlock('What this does', d.what)}
        ${detailBlock('Why you might change it', d.why)}
        ${d.example ? `<div class="detail-block"><div class="detail-block-title">Example</div><p class="detail-example">${escapeHtml(d.example)}</p></div>` : ''}
        ${detailBlock('Applies to', d.applies)}
        ${d.notes ? detailBlock('Important details', d.notes) : ''}
        ${d.related?.length ? `<div class="detail-block"><div class="detail-block-title">Related settings</div><div class="related-links">${d.related.map(r => `<button type="button" data-action="search-related" data-query="${escAttr(r)}">${escapeHtml(r)}</button>`).join('')}</div></div>` : ''}
        <div class="detail-block"><button type="button" class="btn" data-action="reset-setting" data-setting="${setting.id}">${icon('restore')} Reset to default</button></div>
      </div>`;
  }

  function renderDetailInspector(setting, section, workspace) {
    return `<aside class="detail-inspector" aria-label="Setting explanation">${renderDetailInspectorBody(setting, section, workspace)}</aside>`;
  }

  function detailBlock(title, text) { return text ? `<div class="detail-block"><div class="detail-block-title">${escapeHtml(title)}</div><p>${escapeHtml(text)}</p></div>` : ''; }

  function motionReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function detailMotionMs(closing = false) {
    if (motionReduced()) return 0;
    return closing ? 260 : 340;
  }

  function syncDetailButtonStates() {
    root.querySelectorAll('.details-btn').forEach((btn) => {
      const open = btn.dataset.setting === state.detailSetting;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    getDetailNodes().layout?.classList.toggle('inspector-open', !!state.detailSetting);
  }

  function populateDetailInspector() {
    const found = findSettingInDomain(state.detailSetting, getDomain());
    const { inspector } = getDetailNodes();
    if (!found || !inspector) return false;
    inspector.innerHTML = renderDetailInspectorBody(found.setting, found.section, found.workspace);
    return true;
  }

  function openDetailSetting(settingId, workspaceId, sectionId) {
    const found = findSettingGlobal(settingId);
    if (!found) return;
    const alreadyOpen = detailInspectorVisible;
    state.detailSetting = settingId;
    if (workspaceId) state.workspace = workspaceId;
    saveState();
    updateHash();
    if (!populateDetailInspector()) return;
    syncDetailButtonStates();
    if (!alreadyOpen) openDetailInspector();
  }

  function getDetailNodes() {
    const layout = root.querySelector('.document-layout');
    if (!layout) return {};
    return {
      layout,
      scrim: layout.querySelector('.detail-scrim'),
      inspector: layout.querySelector('.detail-inspector'),
    };
  }

  function onDetailEsc(e) {
    if (e.key !== 'Escape') return;
    e.stopPropagation();
    closeDetailSetting();
  }

  function onDetailOpenSettled(e) {
    const { inspector } = getDetailNodes();
    if (!inspector || e.target !== inspector || e.propertyName !== 'transform') return;
    inspector.removeEventListener('transitionend', onDetailOpenSettled);
    if (detailInspectorVisible) inspector.classList.add('is-settled');
  }

  function openDetailInspector() {
    if (detailInspectorVisible) return;
    const { scrim, inspector } = getDetailNodes();
    if (!inspector) return;
    clearTimeout(detailHideTimer);
    detailInspectorVisible = true;
    inspector.classList.remove('is-closing', 'is-settled', 'is-open');
    scrim?.classList.remove('is-open');
    inspector.style.display = '';
    if (scrim) scrim.style.display = '';
    inspector.setAttribute('aria-hidden', 'false');
    // Force layout so translate3d(102%) is the real transition start (W1 pattern)
    void inspector.offsetWidth;
    document.removeEventListener('keydown', onDetailEsc, true);
    inspector.removeEventListener('transitionend', onDetailOpenSettled);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!detailInspectorVisible) return;
        scrim?.classList.add('is-open');
        inspector.classList.add('is-open');
        if (motionReduced()) inspector.classList.add('is-settled');
        else inspector.addEventListener('transitionend', onDetailOpenSettled);
      });
    });
    document.addEventListener('keydown', onDetailEsc, true);
  }

  function closeDetailInspector(onDone) {
    const { scrim, inspector } = getDetailNodes();
    if (!detailInspectorVisible && !inspector?.classList.contains('is-open')) {
      onDone?.();
      return;
    }
    detailInspectorVisible = false;
    document.removeEventListener('keydown', onDetailEsc, true);
    inspector?.removeEventListener('transitionend', onDetailOpenSettled);
    if (inspector) {
      inspector.classList.remove('is-settled');
      inspector.classList.add('is-closing');
      // Re-apply transform so close can animate from rest (is-settled had transform:none)
      void inspector.offsetWidth;
      scrim?.classList.remove('is-open');
      inspector.classList.remove('is-open');
      inspector.setAttribute('aria-hidden', 'true');
    } else {
      scrim?.classList.remove('is-open');
    }
    clearTimeout(detailHideTimer);
    detailHideTimer = setTimeout(() => {
      if (detailInspectorVisible) return;
      if (scrim) scrim.style.display = 'none';
      if (inspector) {
        inspector.style.display = 'none';
        inspector.classList.remove('is-closing');
      }
      onDone?.();
    }, detailMotionMs(true));
  }

  function closeDetailSetting() {
    if (!state.detailSetting && !detailInspectorVisible) return;
    state.detailSetting = null;
    saveState();
    updateHash();
    closeDetailInspector(() => {
      const { inspector } = getDetailNodes();
      if (inspector) inspector.innerHTML = '';
      syncDetailButtonStates();
    });
  }

  let revealObserver = null;
  function armSectionReveal() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nodes = document.querySelectorAll('.section-block, .settings-section, .manager-section');
    if (!nodes.length) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          entry.target.classList.remove('will-reveal');
          revealObserver.unobserve(entry.target);
        }
      }, { threshold: 0.08 });
    } else {
      revealObserver.disconnect();
    }
    for (const node of nodes) {
      if (node.classList.contains('is-revealed')) continue;
      node.classList.add('section-block', 'will-reveal');
      revealObserver.observe(node);
    }
  }

  function afterRender() {
    diagnostics.renderCount += 1;
    const restoreTop = softRemount ? preservedScrollTop : null;
    softRemount = false;
    preservedScrollTop = null;
    if (!state.home) {
      const scroller = document.getElementById('settings-document');
      const end = scroller?.querySelector('.settings-end-space');
      const sections = scroller ? [...scroller.querySelectorAll('[data-section-id]')] : [];
      if (scroller && end && sections.length) {
        const last = sections[sections.length - 1];
        const required = Math.max(140, scroller.clientHeight - Math.min(last.offsetHeight, scroller.clientHeight * .62) + 48);
        end.style.height = `${required}px`;
      }
      setupScrollSpy();
      if (pendingScroll && restoreTop == null) {
        const target = pendingScroll;
        pendingScroll = null;
        jumpToWorkspace(target.workspace, 'auto');
        if (target.section) scrollToSection(target.section, false);
      } else {
        pendingScroll = null;
        syncWorkspaceChrome(state.workspace);
        const wanted = state.activeSection[state.workspace];
        if (wanted) setActiveLocalSection(state.workspace, wanted, false);
      }
      if (restoreTop != null && scroller) {
        const apply = () => {
          scroller.style.scrollBehavior = 'auto';
          scroller.scrollTop = restoreTop;
        };
        apply();
        requestAnimationFrame(() => {
          apply();
          requestAnimationFrame(() => {
            apply();
            scroller.style.scrollBehavior = '';
          });
        });
      }
      if (state.detailSetting && !detailInspectorVisible) {
        populateDetailInspector();
        syncDetailButtonStates();
        requestAnimationFrame(() => openDetailInspector());
      }
    }
    const focusTarget = document.querySelector('[data-autofocus]');
    if (focusTarget) {
      try { focusTarget.focus({ preventScroll: true }); }
      catch { focusTarget.focus(); }
    }
    armSectionReveal();
  }

  function syncWorkspaceChrome(wsId) {
    root.querySelectorAll('[data-action="jump-workspace"]').forEach(btn => {
      const on = btn.dataset.workspace === wsId;
      btn.classList.toggle('is-current', on);
      if (btn.classList.contains('workspace-tab')) btn.classList.toggle('active', on);
    });
    const crumb = root.querySelector('.breadcrumb-workspace');
    const ws = getWorkspace(getDomain(), wsId);
    if (crumb && ws) crumb.textContent = ws.label;
  }

  function scrollOffsetWithin(scroller, el) {
    return el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  }

  function jumpToWorkspace(wsId, behavior) {
    state.workspace = wsId;
    const sections = domainSectionMap[wsId] || [];
    if (sections[0] && !state.activeSection[wsId]) state.activeSection[wsId] = sections[0].id;
    syncWorkspaceChrome(wsId);
    updateHash();
    const scroller = document.getElementById('settings-document');
    const block = root.querySelector(`[data-workspace-block="${cssEscape(wsId)}"]`);
    if (scroller && block) {
      scroller.scrollTo({
        top: Math.max(0, scrollOffsetWithin(scroller, block) - 8),
        behavior: behavior || (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')
      });
    }
    if (state.activeSection[wsId]) setActiveLocalSection(wsId, state.activeSection[wsId], false);
  }

  function setupScrollSpy() {
    const scroller = document.getElementById('settings-document');
    if (!scroller) return;
    let raf = null;
    const update = () => {
      raf = null;
      const blocks = [...scroller.querySelectorAll('[data-workspace-block]')];
      if (!blocks.length) return;
      const threshold = scroller.getBoundingClientRect().top + 96;
      let activeBlock = blocks[0].getAttribute('data-workspace-block');
      for (const block of blocks) {
        if (block.getBoundingClientRect().top <= threshold) activeBlock = block.getAttribute('data-workspace-block');
      }
      if (activeBlock && activeBlock !== state.workspace) {
        state.workspace = activeBlock;
        syncWorkspaceChrome(activeBlock);
        updateHash();
      }
      const blockEl = activeBlock ? scroller.querySelector(`[data-workspace-block="${cssEscape(activeBlock)}"]`) : null;
      const localSections = blockEl
        ? [...blockEl.querySelectorAll('[data-section-id]')]
        : [...scroller.querySelectorAll('[data-section-id]')];
      if (!localSections.length) return;
      let active = localSections[0].getAttribute('data-section-id');
      const max = scroller.scrollHeight - scroller.clientHeight;
      if (max > 0 && scroller.scrollTop >= max - 6) {
        active = localSections[localSections.length - 1].getAttribute('data-section-id');
      } else {
        for (const section of localSections) {
          if (section.getBoundingClientRect().top <= threshold) active = section.getAttribute('data-section-id');
        }
      }
      setActiveLocalSection(activeBlock || state.workspace, active, false);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    update();
    scrollCleanup = () => { scroller.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }

  function setActiveLocalSection(workspaceId, sectionId, persist = true) {
    if (!sectionId) return;
    if (workspaceId) state.activeSection[workspaceId] = sectionId;
    root.querySelectorAll('.index-link').forEach(link => {
      link.classList.toggle('is-active', link.dataset.section === sectionId);
    });
    if (persist) saveState();
  }

  function scrollToSection(sectionId, smooth = true) {
    const scroller = document.getElementById('settings-document');
    const section = document.getElementById(`section-${sectionId}`) || scroller?.querySelector(`[data-section-id="${cssEscape(sectionId)}"]`);
    if (!scroller || !section) return;
    const block = section.closest('[data-workspace-block]');
    const workspaceId = block?.getAttribute('data-workspace-block') || state.workspace;
    if (workspaceId && workspaceId !== state.workspace) {
      state.workspace = workspaceId;
      syncWorkspaceChrome(workspaceId);
    }
    setActiveLocalSection(workspaceId, sectionId);
    updateHash();
    scroller.scrollTo({
      top: Math.max(0, scrollOffsetWithin(scroller, section) - 12),
      behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto'
    });
  }

  function updateHash() {
    const hash = state.home ? '#/home' : `#/${state.domain}/${state.workspace}${state.activeSection[state.workspace] ? `/${state.activeSection[state.workspace]}` : ''}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  function readHash() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!parts.length || parts[0] === 'home') return;
    const domain = D.domains.find(d => d.id === parts[0]);
    const workspace = domain?.workspaces.find(w => w.id === parts[1]);
    if (domain && workspace) {
      state.home = false; state.domain = domain.id; state.workspace = workspace.id;
      if (parts[2]) state.activeSection[workspace.id] = parts[2];
    }
  }

  function showToast(title, message = '', type = 'success', duration = 3400) {
    let stack = document.getElementById('toast-stack');
    if (!stack) { stack = document.createElement('div'); stack.id = 'toast-stack'; stack.className = 'toast-stack'; document.body.append(stack); }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const ic = type === 'success' ? 'check' : type === 'warning' ? 'alert' : type === 'error' ? 'close' : 'info';
    toast.innerHTML = `${icon(ic)}<div class="toast-copy"><div class="toast-title">${escapeHtml(title)}</div>${message ? `<div class="toast-message">${escapeHtml(message)}</div>` : ''}</div>`;
    stack.append(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(18px)'; setTimeout(() => toast.remove(), 220); }, duration);
  }

  function closeSearch() {
    if (searchInputEl) {
      searchInputEl.removeEventListener('keydown', onSearchInputKey);
      searchInputEl = null;
    }
    if (searchEl) {
      searchEl.remove();
      searchEl = null;
    }
  }

  function closeOverlay() {
    closeSearch();
    document.querySelectorAll('.popover').forEach(el => el.remove());
    document.querySelectorAll('.overlay').forEach(el => el.remove());
    const drawers = [...document.querySelectorAll('.drawer-wrap')];
    if (!drawers.length) return;
    drawers.forEach(wrap => closeDrawerWrap(wrap));
  }

  function closeDrawerWrap(wrap, onDone) {
    if (!wrap || !wrap.isConnected) {
      onDone?.();
      return;
    }
    if (wrap.dataset.closing === '1') return;
    wrap.dataset.closing = '1';
    const drawer = wrap.querySelector('.drawer');
    wrap.classList.remove('is-settled');
    wrap.classList.add('is-closing');
    void wrap.offsetWidth;
    wrap.classList.remove('is-open');
    const finish = () => {
      wrap.removeEventListener('transitionend', onEnd);
      wrap.remove();
      onDone?.();
    };
    const onEnd = (e) => {
      if (e.target !== drawer && e.target !== wrap) return;
      if (e.propertyName !== 'transform' && e.propertyName !== 'opacity') return;
      finish();
    };
    if (motionReduced()) {
      finish();
      return;
    }
    wrap.addEventListener('transitionend', onEnd);
    setTimeout(finish, 280);
  }

  function openDrawer({ title, subtitle = '', body = '', primaryLabel = '', onPrimary = null }) {
    closeOverlay();
    const wrap = document.createElement('div');
    wrap.className = 'drawer-wrap';
    wrap.innerHTML = `<aside class="drawer" role="dialog" aria-modal="true" aria-label="${escAttr(title)}">
      <div class="dialog-head"><div class="dialog-head-copy"><div class="dialog-title">${escapeHtml(title)}</div>${subtitle ? `<div class="dialog-sub">${escapeHtml(subtitle)}</div>` : ''}</div><button class="icon-btn" data-action="close-overlay" aria-label="Close">${icon('close')}</button></div>
      <div class="drawer-body">${body}</div>
      <div class="drawer-footer"><button class="btn" data-action="close-overlay">Close</button>${onPrimary ? `<button class="btn primary" data-callback="${registerAction(() => { const result = onPrimary(wrap); if (result !== false && wrap.isConnected) closeDrawerWrap(wrap); })}">${escapeHtml(primaryLabel || 'Apply')}</button>` : ''}</div>
    </aside>`;
    const drawer = wrap.querySelector('.drawer');
    const onEsc = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      closeDrawerWrap(wrap);
    };
    wrap.addEventListener('mousedown', e => { if (e.target === wrap) closeDrawerWrap(wrap); });
    document.body.append(wrap);
    void wrap.offsetWidth;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!wrap.isConnected) return;
        wrap.classList.add('is-open');
        if (motionReduced()) wrap.classList.add('is-settled');
        else {
          const onSettled = (e) => {
            if (e.target !== drawer || e.propertyName !== 'transform') return;
            drawer.removeEventListener('transitionend', onSettled);
            if (wrap.isConnected && wrap.classList.contains('is-open')) wrap.classList.add('is-settled');
          };
          drawer.addEventListener('transitionend', onSettled);
        }
        wrap.querySelector('button')?.focus();
      });
    });
    document.addEventListener('keydown', onEsc, true);
    const obs = new MutationObserver(() => {
      if (wrap.isConnected) return;
      document.removeEventListener('keydown', onEsc, true);
      obs.disconnect();
    });
    obs.observe(document.body, { childList: true });
    return wrap;
  }

  function focusSettingsSearch() {
    const input = root.querySelector('[data-global-search]');
    if (!input) return null;
    input.focus();
    openSearch(input);
    return input;
  }

  const SEARCH_MAX_RESULTS = 40;
  const BEST_MATCH_MIN_HIT = 6;
  let searchIndexCache = null;
  let searchIndexDirty = true;

  function scalarValueText(value) {
    if (value === null || value === undefined || typeof value === 'object') return '';
    return String(value);
  }

  function stringValuesOf(obj) {
    return Object.entries(obj || {}).flatMap(([key, value]) => {
      if (typeof value === 'string') return [value];
      if (Array.isArray(value)) return value.filter(item => typeof item === 'string');
      if (value && typeof value === 'object') return stringValuesOf(value);
      void key;
      return [];
    });
  }

  function buildSearchIndex() {
    if (!searchIndexDirty && searchIndexCache) return searchIndexCache;
    const results = [];
    const push = entry => {
      entry.hay = `${entry.title} ${entry.description || ''} ${entry.path} ${(entry.extraTerms || []).join(' ')} ${entry.hayExtra || ''}`.toLowerCase();
      delete entry.hayExtra;
      results.push(entry);
    };
    const resource = o => push({
      type: o.kind,
      group: o.group || 'managers',
      payload: Object.assign({ kind: o.kind }, o.payload),
      id: o.id,
      title: o.title,
      description: o.description || '',
      path: o.path,
      extraTerms: o.terms || [],
      hayExtra: o.hayExtra || ''
    });

    // Generic pass: every domain › workspace › section › setting, plain and reference-backed.
    for (const domain of D.domains) {
      for (const workspace of domain.workspaces) {
        push({
          type: 'workspace',
          group: 'managers',
          payload: { kind: 'workspace', domain: domain.id, workspace: workspace.id },
          id: `${domain.id}|${workspace.id}`,
          title: workspace.label,
          description: workspace.type === 'settings' ? (workspaceMeta(workspace, domain).description) : (domain.summary || ''),
          path: domain.label,
          extraTerms: [workspace.type || '', workspace.id, domain.summary || '']
        });
        if (workspace.type !== 'settings') continue;
        for (const section of workspace.sections || []) {
          for (const s of section.settings || []) {
            const d = s.detail || {};
            push({
              type: 'setting',
              group: 'settings',
              payload: { kind: 'setting', domain: domain.id, workspace: workspace.id, section: section.id, id: s.id },
              id: s.id,
              title: s.label,
              description: s.description || '',
              path: `${domain.label} › ${workspace.label} › ${section.label}`,
              extraTerms: [...(s.searchTerms || []), s.id],
              hayExtra: `${domain.id}.${workspace.id}.${section.id}.${s.label} ${s.id} ${s.control || ''} ${scalarValueText(settingValue(s))} ${(s.options || []).join(' ')} ${d.what || ''} ${d.why || ''} ${(d.related || []).join(' ')}`
            });
          }
        }
      }
    }

    // Providers & accounts
    for (const provider of state.providers || []) {
      resource({
        kind: 'provider',
        payload: { id: provider.id },
        id: provider.id,
        title: provider.name,
        description: `${provider.statusLabel || ''} · ${provider.product || provider.kind || ''}`,
        path: 'AI & Providers › Providers & Accounts',
        terms: [provider.kind, provider.product, provider.statusLabel, ...(provider.accounts || []).map(a => a.nickname)].filter(Boolean),
        hayExtra: provider.name
      });
    }

    // Provider model endpoints
    for (const provider of state.providers || []) {
      for (const model of provider.models || []) {
        resource({
          kind: 'provider-model',
          payload: { providerId: provider.id, id: model.id },
          id: `${provider.id}:${model.id}`,
          title: model.name,
          description: `${model.plan || ''} · ${model.context || ''} · ${provider.name}`,
          path: `AI & Providers › Providers & Accounts › ${provider.name} models`,
          terms: [...(model.caps || []), model.plan, model.health].filter(Boolean)
        });
      }
    }
    // Free routes — real fields only: provider, signIn, models, limit, terms
    for (const route of state.freeRoutes || []) {
      resource({
        kind: 'free-route',
        payload: { id: route.id },
        id: route.id,
        title: route.name,
        description: `${route.enabled ? 'Enabled' : 'Available to enable'} · ${(route.models || []).length || route.modelCount || ''} models`,
        path: 'AI & Providers › Free Models › Routes',
        terms: [route.provider, route.signIn, ...(route.models || []), route.limit, route.terms].filter(Boolean)
      });
    }

    // Web routes
    for (const route of state.webRoutes || []) {
      resource({
        kind: 'web-route',
        payload: { id: route.id },
        id: route.id,
        title: `${route.name} route`,
        description: route.description || '',
        path: 'AI & Providers › Web & Research',
        terms: [route.description, route.primary?.provider, route.primary?.model].filter(Boolean),
        hayExtra: stringValuesOf(route).join(' ')
      });
    }

    // Media routes
    for (const route of state.mediaRoutes || []) {
      resource({
        kind: 'media-route',
        payload: { id: route.id },
        id: route.id,
        title: `${route.name} route`,
        description: `Output endpoint · ${route.primary?.provider || 'Not configured'} · ${route.primary?.model || ''}`,
        path: 'AI & Providers › Media & Output',
        terms: [route.primary?.provider, route.primary?.model].filter(Boolean),
        hayExtra: stringValuesOf(route.output).join(' ')
      });
    }

    // Toolchain resources: lsps, formatters, mcps, commands, skills, plugins, agentTools
    for (const toolKind of ['lsps', 'formatters', 'mcps', 'commands', 'skills', 'plugins', 'agentTools']) {
      for (const item of state.toolchain?.[toolKind] || []) {
        resource({
          kind: 'tool',
          payload: { toolKind, id: item.id },
          id: item.id,
          title: item.name,
          description: cap(toolKind),
          path: 'Code & Tools › Toolchain & Extensions',
          terms: [item.language, item.source, item.category, item.transport, item.owner, ...(item.languages || [])].filter(Boolean),
          hayExtra: stringValuesOf(item).join(' ')
        });
      }
    }

    // Testing & debug profiles
    for (const profile of state.testProfiles || []) {
      resource({
        kind: 'test-profile',
        payload: { id: profile.id },
        id: profile.id,
        title: profile.name,
        description: profile.description || '',
        path: 'Code & Tools › Testing & Debug',
        terms: [profile.trigger, ...(profile.stages || [])].filter(Boolean)
      });
    }
    for (const profile of state.debugProfiles || []) {
      resource({
        kind: 'debug-profile',
        payload: { id: profile.id },
        id: profile.id,
        title: profile.name,
        description: profile.description || '',
        path: 'Code & Tools › Testing & Debug · Debug Profiles',
        terms: stringValuesOf(profile).slice(0, 8)
      });
    }

    // Memories
    for (const memory of state.memories || []) {
      resource({
        kind: 'memory',
        payload: { id: memory.id },
        id: memory.id,
        title: memory.title,
        description: memory.text || '',
        path: 'Memory & Automation › Context & Memory',
        terms: [memory.store, memory.type, memory.source, memory.confidence].filter(Boolean)
      });
    }

    // Goals: templates + active goals
    for (const template of state.goalTemplates || []) {
      resource({
        kind: 'goal-template',
        payload: { id: template.id },
        id: template.id,
        title: template.name,
        description: template.description || '',
        path: 'Memory & Automation › Goals & Automation',
        terms: [template.persona, template.route, ...(template.phases || [])].filter(Boolean)
      });
    }
    for (const goal of state.activeGoals || []) {
      resource({
        kind: 'active-goal',
        payload: { id: goal.id },
        id: goal.id,
        title: goal.name,
        description: `${goal.state || ''} · phase ${goal.phase || ''} · ${goal.progress ?? ''}%`,
        path: 'Memory & Automation › Goals & Automation · Active',
        terms: [goal.state, goal.phase, goal.route, goal.persona].filter(Boolean)
      });
    }

    // Personas & crews
    for (const persona of state.personas || []) {
      resource({
        kind: 'persona',
        payload: { id: persona.id },
        id: persona.id,
        title: persona.name,
        description: persona.description || '',
        path: 'Memory & Automation › Personas & Crews',
        terms: [persona.group, persona.tone, persona.route, ...(persona.tools || [])].filter(Boolean)
      });
    }
    for (const crew of state.crews || []) {
      resource({
        kind: 'crew',
        payload: { id: crew.id },
        id: crew.id,
        title: crew.name,
        description: `${(crew.members || []).length} members · Lead ${crew.lead || ''}`,
        path: 'Memory & Automation › Personas & Crews · Crews',
        terms: [...(crew.members || []), crew.lead, crew.route].filter(Boolean)
      });
    }

    // Source control: tools, forges, repositories, worktrees, actions
    for (const tool of state.sourceControl?.tools || []) {
      resource({
        kind: 'source-tool',
        payload: { id: tool.id },
        id: tool.id,
        title: tool.name,
        description: `${tool.kind || 'Local tool'} · ${tool.version || ''}`,
        path: 'Source Control › Git & Jujutsu',
        terms: [tool.host, tool.source, tool.status].filter(Boolean)
      });
    }
    for (const forge of state.sourceControl?.forges || []) {
      resource({
        kind: 'forge',
        payload: { id: forge.id },
        id: forge.id,
        title: forge.name,
        description: forge.status === 'not-connected' ? 'Not connected' : `${forge.accounts || 0} account(s) · ${forge.defaultAccount || ''}`,
        path: 'Source Control › Hosted Forges',
        terms: [...(forge.scopes || []), forge.ssh].filter(Boolean),
        hayExtra: forge.name
      });
    }
    for (const repo of state.sourceControl?.repositories || []) {
      resource({
        kind: 'repository',
        payload: { id: repo.name },
        id: slug(repo.name),
        title: repo.name,
        description: `${repo.forge || ''} · ${repo.branch || ''} · ${repo.state || ''}`,
        path: 'Source Control › Repositories',
        terms: [repo.remote, repo.protection].filter(Boolean),
        hayExtra: repo.name
      });
    }
    for (const tree of state.sourceControl?.worktrees || []) {
      resource({
        kind: 'worktree',
        payload: { id: tree.name },
        id: slug(tree.name),
        title: tree.name,
        description: `${tree.branch || ''} · ${tree.state || ''} · ${tree.owner || ''}`,
        path: 'Source Control › Worktrees',
        terms: [tree.path, tree.lease].filter(Boolean),
        hayExtra: tree.name
      });
    }
    for (const actionItem of state.sourceControl?.actions || []) {
      resource({
        kind: 'workflow-action',
        payload: { id: slug(actionItem.name) },
        id: slug(actionItem.name),
        title: actionItem.name,
        description: `${actionItem.workflow || ''} · ${actionItem.trigger || ''} · ${cap(actionItem.status || '')}`,
        path: 'Source Control › GitHub Actions',
        terms: [actionItem.workflow, actionItem.trigger].filter(Boolean),
        hayExtra: actionItem.name
      });
    }

    // Permissions: profiles, ordered rules, FileSafe paths
    for (const profile of state.permissionProfiles || []) {
      resource({
        kind: 'permission-profile',
        payload: { id: profile.id },
        id: profile.id,
        title: profile.name,
        description: profile.description || '',
        path: 'Safety & Permissions › Profiles',
        terms: [profile.scope, profile.status].filter(Boolean)
      });
    }
    for (const rule of state.permissionRules || []) {
      resource({
        kind: 'permission-rule',
        payload: { id: slug(rule.action) },
        id: slug(rule.action),
        title: rule.action,
        description: rule.condition || '',
        path: 'Safety & Permissions › Ordered Rules',
        terms: [rule.decision, rule.source].filter(Boolean),
        hayExtra: rule.action
      });
    }
    for (const safePath of state.fileSafePaths || []) {
      resource({
        kind: 'filesafe-path',
        payload: { id: slug(safePath.path) },
        id: slug(safePath.path),
        title: safePath.path,
        description: `${safePath.access || ''} · ${safePath.inheritance || ''}`,
        path: 'Safety & Permissions › FileSafe',
        terms: [safePath.access, safePath.inheritance, safePath.status].filter(Boolean),
        hayExtra: safePath.path
      });
    }

    // Backup destinations & schedules
    for (const destination of state.backup?.destinations || []) {
      resource({
        kind: 'backup-destination',
        group: 'destinations',
        payload: { id: destination.id },
        id: destination.id,
        title: destination.name,
        description: `${destination.type || ''} · verified ${destination.lastVerified || 'never'}`,
        path: 'System › Data, Backup & Retention',
        terms: [destination.type, destination.path, destination.encryption].filter(Boolean)
      });
    }
    for (const schedule of state.backup?.schedules || []) {
      resource({
        kind: 'backup-schedule',
        payload: { id: schedule.id },
        id: schedule.id,
        title: schedule.name,
        description: `${schedule.when || ''} · ${schedule.retention || ''}`,
        path: 'System › Data, Backup & Retention · Schedules',
        terms: [schedule.when, schedule.destination, schedule.retention].filter(Boolean)
      });
    }

    // Notifications: destinations, agents, events, sounds
    for (const destination of state.notifications?.destinations || []) {
      resource({
        kind: 'notification-destination',
        group: 'destinations',
        payload: { id: destination.id },
        id: destination.id,
        title: destination.name,
        description: `${destination.type || ''} · ${destination.address || ''}`,
        path: 'General › Notifications & Sounds',
        terms: [destination.type, destination.address, destination.status].filter(Boolean)
      });
    }
    for (const agent of state.notifications?.agents || []) {
      resource({
        kind: 'notification-agent',
        payload: { id: agent.id },
        id: agent.id,
        title: agent.name,
        description: `Escalation: ${agent.escalation || 'None'}`,
        path: 'General › Notifications & Sounds · Agents',
        terms: [...(agent.events || []), ...(agent.destinations || [])].filter(Boolean)
      });
    }
    for (const eventItem of state.notifications?.events || []) {
      resource({
        kind: 'notification-event',
        payload: { id: slug(eventItem.name) },
        id: slug(eventItem.name),
        title: eventItem.name,
        description: `${eventItem.enabled ? 'Enabled' : 'Muted'} · sound ${eventItem.sound || 'None'}`,
        path: 'General › Notifications & Sounds · Events & Routing',
        terms: [eventItem.sound, eventItem.priority, ...(eventItem.destinations || [])].filter(Boolean),
        hayExtra: eventItem.name
      });
    }
    for (const sound of state.notifications?.sounds || []) {
      resource({
        kind: 'sound',
        payload: { id: sound.id },
        id: sound.id,
        title: sound.name,
        description: `${sound.format || ''} · ${sound.duration || ''} · volume ${sound.volume ?? '?'}%`,
        path: 'General › Notifications & Sounds · Sounds',
        terms: [sound.source, sound.format].filter(Boolean),
        hayExtra: sound.name
      });
    }

    // Project sync & history
    for (const client of state.projectSync?.clients || []) {
      resource({
        kind: 'sync-client',
        payload: { id: client.id },
        id: client.id,
        title: client.name,
        description: `${client.platform || ''} · ${client.role || ''} · ${client.lastSync || ''}`,
        path: 'Projects & Sync › Clients & Continuity',
        terms: [client.platform, client.status, client.role].filter(Boolean)
      });
    }
    for (const remote of state.projectSync?.remotes || []) {
      resource({
        kind: 'sync-location',
        payload: { id: remote.id },
        id: remote.id,
        title: remote.name,
        description: `${remote.type || ''} · ${remote.address || ''}`,
        path: 'Projects & Sync › Remote Projects',
        terms: [remote.type, remote.address, remote.status].filter(Boolean)
      });
    }
    for (const session of state.projectHistory?.sessions || []) {
      resource({
        kind: 'history-session',
        payload: { id: session.id },
        id: session.id,
        title: session.title,
        description: `${session.device || ''} · ${session.state || ''} · ${session.artifacts ?? 0} artifacts`,
        path: 'Projects & Sync › History & Artifacts',
        terms: [session.device, session.state].filter(Boolean)
      });
    }
    for (const artifact of state.projectHistory?.artifacts || []) {
      resource({
        kind: 'artifact',
        payload: { id: artifact.id },
        id: artifact.id,
        title: artifact.name,
        description: `${artifact.type || ''} · ${artifact.size || ''} · ${artifact.retention || ''}`,
        path: 'Projects & Sync › History & Artifacts · Artifacts',
        terms: [artifact.type, artifact.owner].filter(Boolean)
      });
    }

    // Quick actions (curated shortcuts)
    [
      ['Set up Claude Code', 'Open provider installation and account setup', 'ai', 'providers', 'claude-code'],
      ['Change completion sound', 'Open event sound mappings and the sound library', 'general', 'notifications', ''],
      ['Restore home layout', 'Open structured desktop and window settings', 'general', 'app-input', 'restore-defaults'],
      ['Connect GitHub', 'Open hosted forge connections in Source Control', 'source', 'source-manager', ''],
      ['Configure web search priority', 'Open Web & Research capability routing', 'ai', 'web', ''],
      ['Back up Puppet Master', 'Open project and settings backup setup', 'system', 'backup', '']
    ].forEach(([title, description, domain, workspace, id]) => {
      const d = getDomain(domain);
      const w = d.workspaces.find(x => x.id === workspace);
      resource({
        kind: 'quick-action',
        payload: { id, domain, workspace },
        id,
        title,
        description,
        path: `${d.label} › ${w?.label || workspace}`,
        terms: [domain, workspace]
      });
    });

    searchIndexCache = results;
    searchIndexDirty = false;
    return results;
  }

  function scoreSearchEntry(item, terms) {
    let score = 0;
    let minHit = Infinity;
    const title = item.title.toLowerCase();
    const path = item.path.toLowerCase();
    const extraTerms = item.extraTerms || [];
    for (const term of terms) {
      const inTitle = title.includes(term);
      const inExtra = extraTerms.some(value => String(value || '').toLowerCase().includes(term));
      const inPath = path.includes(term);
      const inHay = item.hay.includes(term);
      score += (inTitle ? 8 : 0) + (inExtra ? 6 : 0) + (inPath ? 3 : 0) + (inHay ? 1 : -20);
      const hit = inTitle ? 8 : inExtra ? 6 : inPath ? 3 : inHay ? 1 : -20;
      if (hit > 0) minHit = Math.min(minHit, hit);
    }
    return { score, best: terms.length > 0 && Number.isFinite(minHit) && minHit >= BEST_MATCH_MIN_HIT };
  }

  function highlightSearchText(text, terms) {
    const raw = String(text ?? '');
    if (!terms.length) return escapeHtml(raw);
    const pattern = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!pattern) return escapeHtml(raw);
    const re = new RegExp(`(${pattern})`, 'gi');
    let out = '';
    let last = 0;
    for (const match of raw.matchAll(re)) {
      out += escapeHtml(raw.slice(last, match.index)) + '<mark>' + escapeHtml(match[0]) + '</mark>';
      last = match.index + match[0].length;
    }
    return out + escapeHtml(raw.slice(last));
  }

  function openSearch(input) {
    if (!input || input.nodeType !== 1) return;
    closeSearch();
    document.querySelectorAll('.popover').forEach(el => el.remove());
    const query = String(input.value || '').trim().toLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    const index = buildSearchIndex();
    const scored = index
      .map(item => ({ item, ...scoreSearchEntry(item, terms) }))
      .filter(entry => !terms.length || entry.score >= terms.length)
      .sort((a, b) => b.score - a.score || (b.best ? 1 : 0) - (a.best ? 1 : 0) || a.item.title.localeCompare(b.item.title))
      .slice(0, SEARCH_MAX_RESULTS);

    const groups = [
      ['best', 'Best matches'],
      ['settings', 'Settings'],
      ['managers', 'Managers & resources'],
      ['destinations', 'Destinations']
    ];
    const renderRow = ({ item, best }) => {
      const payload = escAttr(JSON.stringify(item.payload || { kind: 'workspace', domain: item.domain, workspace: item.workspace }));
      return `<button type="button" class="search-result" data-search-result="${escAttr(item.type)}" data-search-payload="${payload}">` +
        `<span class="search-result-main"><span class="search-result-title">${highlightSearchText(item.title, terms)}</span><span>${highlightSearchText(item.description || '', terms)}</span></span>` +
        `<span class="search-result-path">${escapeHtml(item.path)}${best ? ' · top match' : ''}</span></button>`;
    };
    const body = groups
      .map(([key, label]) => {
        const rows = scored.filter(entry => key === 'best' ? entry.best : (!entry.best && entry.item.group === key));
        if (!rows.length) return '';
        return `<div class="search-group">${query ? label : (key === 'best' ? 'Common destinations' : label)}</div>${rows.map(renderRow).join('')}`;
      })
      .join('');
    const rect = (input.closest('.rail-search, .hero-search, .pm3-search, .pm3-hero-search') || input).getBoundingClientRect();
    searchEl = document.createElement('div');
    searchEl.className = 'search-results';
    searchEl.style.position = 'fixed';
    searchEl.style.left = `${Math.max(12, rect.left)}px`;
    searchEl.style.top = `${rect.bottom + 6}px`;
    searchEl.style.width = `${Math.min(Math.max(rect.width, 420), window.innerWidth - 24)}px`;
    searchEl.style.zIndex = '240';
    searchEl.innerHTML = body ||
      `<div class="search-empty"><strong>No matching setting yet</strong><span>Try a task such as “connect GitHub,” “completion sound,” “web priority,” or an exact setting ID.</span></div>`;
    document.body.append(searchEl);
    searchInputEl = input;
    input.addEventListener('keydown', onSearchInputKey);
  }

  function onSearchInputKey(event) {
    if (!searchEl) return;
    if (event.key === 'Escape') { closeSearch(); return; }
    const rows = [...searchEl.querySelectorAll('.search-result')];
    if (!rows.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const current = rows.findIndex(row => row.classList.contains('is-active'));
      const next = event.key === 'ArrowDown'
        ? (current < 0 ? 0 : (current + 1) % rows.length)
        : (current < 0 ? rows.length - 1 : (current - 1 + rows.length) % rows.length);
      setActiveSearchRow(rows, next);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = rows.find(row => row.classList.contains('is-active')) || rows[0];
      target.click();
    }
  }

  function setActiveSearchRow(rows, index) {
    rows.forEach((row, i) => row.classList.toggle('is-active', i === index));
    rows[index]?.scrollIntoView({ block: 'nearest' });
  }


  function selectSearchResult(buttonEl) {
    let p = {};
    try { p = JSON.parse(buttonEl.getAttribute('data-search-payload') || '{}'); } catch (_) { p = {}; }
    closeSearch();
    applySearchSelection(p);
  }

  function applySearchSelection(p) {
    switch (p.kind) {
      case 'setting':
        navigate(p.domain, p.workspace, { section: p.section || null, detailSetting: p.id || null });
        flashSearchHit(p.id);
        return;
      case 'provider':
        state.selectedProvider = p.id || 'claude-code';
        state.providerTab = 'overview';
        navigate('ai', 'providers');
        return;
      case 'free-route':
        state.selectedProvider = 'free-models';
        state.selectedFreeRoute = p.id;
        state.providerTab = 'routes';
        navigate('ai', 'providers');
        return;
      case 'provider-model':
        state.selectedProvider = p.providerId || 'claude-code';
        state.providerTab = 'models';
        navigate('ai', 'providers');
        return;
      case 'web-route':
        state.selectedWebRoute = p.id;
        state.webRouteTab = 'route';
        navigate('ai', 'web');
        return;
      case 'media-route':
        state.selectedMediaRoute = p.id;
        state.mediaRouteTab = 'route';
        navigate('ai', 'media');
        return;
      case 'tool':
        state.toolTab = p.toolKind;
        if (state.selectedTool && typeof state.selectedTool === 'object') state.selectedTool[p.toolKind] = p.id;
        else state.selectedTool = { [p.toolKind]: p.id };
        navigate('code', 'toolchain');
        return;
      case 'test-profile':
        state.testingTab = 'profiles';
        state.selectedTestProfile = p.id;
        navigate('code', 'testing');
        return;
      case 'debug-profile':
        state.testingTab = 'debug';
        state.selectedDebugProfile = p.id;
        navigate('code', 'testing');
        return;
      case 'memory':
        state.memoryTab = 'memories';
        state.memoryFilter = 'All';
        state.selectedMemory = p.id;
        navigate('memory', 'context-memory');
        return;
      case 'goal-template':
        state.goalTab = 'templates';
        state.selectedGoalTemplate = p.id;
        navigate('memory', 'goals');
        return;
      case 'active-goal':
        state.goalTab = 'active';
        state.selectedGoal = p.id;
        navigate('memory', 'goals');
        return;
      case 'persona':
        state.personaTab = 'personas';
        state.personaFilter = 'All';
        state.personaQuery = '';
        state.selectedPersona = p.id;
        navigate('memory', 'personas');
        return;
      case 'crew':
        state.personaTab = 'crews';
        state.selectedCrew = p.id;
        navigate('memory', 'personas');
        return;
      case 'source-tool':
        state.sourceTab = 'tools';
        state.selectedSourceTool = p.id;
        navigate('source', 'source-manager');
        return;
      case 'forge':
        state.sourceTab = 'connections';
        state.selectedForge = p.id;
        navigate('source', 'source-manager');
        return;
      case 'repository':
        state.sourceTab = 'repositories';
        state.selectedRepository = p.id;
        navigate('source', 'source-manager');
        return;
      case 'worktree':
        state.sourceTab = 'worktrees';
        state.selectedWorktree = p.id;
        navigate('source', 'source-manager');
        return;
      case 'workflow-action':
        state.sourceTab = 'actions';
        navigate('source', 'source-manager');
        return;
      case 'permission-profile':
        state.permissionTab = 'profiles';
        state.selectedPermissionProfile = p.id;
        navigate('safety', 'permissions');
        return;
      case 'permission-rule':
        state.permissionTab = 'rules';
        navigate('safety', 'permissions');
        return;
      case 'filesafe-path':
        state.permissionTab = 'filesafe';
        navigate('safety', 'permissions');
        return;
      case 'backup-destination':
        state.backupTab = 'destinations';
        navigate('system', 'backup');
        return;
      case 'backup-schedule':
        state.backupTab = 'schedules';
        navigate('system', 'backup');
        return;
      case 'notification-destination':
        state.notificationTab = 'destinations';
        state.selectedDestination = p.id;
        navigate('general', 'notifications');
        return;
      case 'notification-agent':
        state.notificationTab = 'agents';
        state.selectedNotificationAgent = p.id;
        navigate('general', 'notifications');
        return;
      case 'notification-event':
        state.notificationTab = 'events';
        navigate('general', 'notifications');
        return;
      case 'sound':
        state.notificationTab = 'sounds';
        state.selectedSound = p.id;
        navigate('general', 'notifications');
        return;
      case 'sync-client':
        state.projectSyncTab = 'clients';
        navigate('projects', 'project-sync');
        return;
      case 'sync-location':
        state.projectSyncTab = 'remote';
        navigate('projects', 'project-sync');
        return;
      case 'history-session':
        state.projectHistoryTab = 'sessions';
        navigate('projects', 'project-history');
        return;
      case 'artifact':
        state.projectHistoryTab = 'artifacts';
        navigate('projects', 'project-history');
        return;
      case 'quick-action': {
        const id = p.id || '';
        if (id && state.providers.some(provider => provider.id === id)) {
          state.selectedProvider = id;
          state.providerTab = 'overview';
          navigate(p.domain, p.workspace);
          return;
        }
        navigate(p.domain, p.workspace, { detailSetting: id.includes('.') || id.includes('-') ? id : null });
        return;
      }
      default:
        navigate(p.domain, p.workspace, { section: p.section || undefined });
    }
  }

  function flashSearchHit(settingId) {
    window.setTimeout(() => {
      const targets = [document.getElementById(`setting-${settingId}`), root.querySelector('.detail-inspector')];
      for (const target of targets) {
        if (!target) continue;
        target.classList.add('is-flash');
        window.setTimeout(() => target.classList.remove('is-flash'), 1000);
      }
    }, 0);
  }
  function openDialog({ title, subtitle = '', body = '', saveLabel = 'Save changes', cancelLabel = 'Cancel', wide = false, onSave = null, onOpen = null }) {
    closeOverlay();
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `<section class="dialog ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${escAttr(title)}">
      <div class="dialog-head"><div class="dialog-head-copy"><div class="dialog-title">${escapeHtml(title)}</div>${subtitle ? `<div class="dialog-sub">${escapeHtml(subtitle)}</div>` : ''}</div><button class="icon-btn" data-action="close-overlay" aria-label="Close">${icon('close')}</button></div>
      <form class="dialog-form"><div class="dialog-body">${body}</div><div class="dialog-footer"><button type="button" class="btn" data-action="close-overlay">${escapeHtml(cancelLabel)}</button>${onSave ? `<button type="submit" class="btn primary">${escapeHtml(saveLabel)}</button>` : ''}</div></form>
    </section>`;
    document.body.append(overlay);
    overlay.addEventListener('mousedown', e => { if (e.target === overlay) closeOverlay(); });
    const form = overlay.querySelector('form');
    if (onSave) form.addEventListener('submit', e => { e.preventDefault(); const data = Object.fromEntries(new FormData(form).entries()); const result = onSave(data, form); if (result !== false && overlay.isConnected) overlay.remove(); });
    requestAnimationFrame(() => { const target = overlay.querySelector('[data-autofocus], input, select, textarea, button'); if (target) target.focus(); if (onOpen) onOpen(overlay); });
    return overlay;
  }

  function formField(label, name, value = '', options = {}) {
    const full = options.full ? ' full' : '';
    const help = options.help ? `<div class="form-help">${escapeHtml(options.help)}</div>` : '';
    let control;
    if (options.type === 'select') control = `<select class="form-select" name="${escAttr(name)}">${(options.choices || []).map(choice => `<option ${String(choice) === String(value) ? 'selected' : ''}>${escapeHtml(choice)}</option>`).join('')}</select>`;
    else if (options.type === 'textarea') control = `<textarea class="form-textarea" name="${escAttr(name)}">${escapeHtml(value)}</textarea>`;
    else if (options.type === 'checkbox') return `<label class="check-row${full}"><input type="checkbox" name="${escAttr(name)}" ${value ? 'checked' : ''}/><span><strong>${escapeHtml(label)}</strong>${options.help ? `<br><span class="form-help">${escapeHtml(options.help)}</span>` : ''}</span></label>`;
    else control = `<input class="form-input" type="${escAttr(options.type || 'text')}" name="${escAttr(name)}" value="${escAttr(value)}" ${options.placeholder ? `placeholder="${escAttr(options.placeholder)}"` : ''} ${options.autofocus ? 'data-autofocus' : ''}/>`;
    return `<label class="form-field${full}"><span class="form-label">${escapeHtml(label)}</span>${control}${help}</label>`;
  }

  function showAllDetails(workspace) {
    const sections = workspace.sections || [];
    const body = sections.map(section => `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">${escapeHtml(section.label)}</div><div class="panel-subtitle">${escapeHtml(section.description || '')}</div></div></div>${section.settings.map(s => `<button class="setup-row" data-callback="${registerAction(() => { closeOverlay(); openDetailSetting(s.id, workspace.id, section.id); })}"><span class="setup-copy"><span class="setup-label">${escapeHtml(s.label)}</span><span class="setup-meta">${escapeHtml(s.detail?.what || s.description)}</span></span>${icon('chevron')}</button>`).join('')}</section>`).join('');
    openDrawer({ title: `${workspace.label} explanations`, subtitle: 'Browse the full behavior inventory. Selecting one returns to the exact setting and opens its explanation.', body });
  }

  function renderUnknown(workspace) {
    return `<div class="empty-state page-enter"><div><div class="empty-icon">${icon('settings')}</div><div class="empty-title">${escapeHtml(workspace.label)}</div><div class="empty-copy">This workspace has no renderer. That is a concept defect rather than a hidden option.</div></div></div>`;
  }

  function pageHeader(iconName, title, description, actions = '') {
    if (embedMode) {
      return actions ? `<div class="embedded-page-actions">${actions}</div>` : '';
    }
    return `<header class="page-header"><div class="page-header-lead"><div class="page-heading"><h1 class="page-title">${escapeHtml(title)}</h1><p class="page-description">${escapeHtml(description)}</p></div></div>${renderChromeActions(actions)}</header>`;
  }

  function managerTabs(items, active, action) {
    return `<nav class="manager-tabs">${items.map(item => `<button class="manager-tab ${item.id === active ? 'active' : ''}" data-action="${action}" data-tab="${item.id}">${escapeHtml(item.label)}</button>`).join('')}</nav>`;
  }

  function renderProviders() {
    const provider = state.providers.find(p => p.id === state.selectedProvider) || state.providers[0];
    const providerActions = `<button class="btn" data-action="test-provider" data-provider="${provider.id}">${icon('test')}<span class="btn-label">Test connection</span></button>${provider.signedIn ? `<button class="btn" data-action="reconnect-provider" data-provider="${provider.id}">${icon('refresh')}<span class="btn-label">Reconnect</span></button>` : ''}<button class="btn primary" data-action="provider-menu" data-provider="${provider.id}">${icon('rocket')}<span class="btn-label">Manage</span>${icon('down')}</button>`;
    return `<div class="manager-page page-enter">
      ${pageHeader('brain', 'AI Providers', 'Install, connect, and manage every supported AI connection. Accounts and provider health live here; capabilities are assigned to exact models in routing workspaces.', `<button class="btn primary" data-action="add-provider">${icon('plus')} Set up provider</button>`)}
      <div class="manager-body ${state.resourceRosterOpen ? 'roster-open' : ''}">
        <div class="split-manager">
          <aside class="resource-roster">
            <div class="roster-head"><div class="roster-title">Providers (${state.providers.length})</div><button class="icon-btn" data-action="add-provider" data-tooltip="Set up provider">${icon('plus')}</button></div>
            <div class="roster-search"><input placeholder="Filter providers…" data-action="filter-roster" data-roster="providers"/></div>
            <div class="roster-list" id="provider-roster">${state.providers.map(p => providerRosterRow(p, provider.id)).join('')}</div>
          </aside>
          <section class="resource-detail">
            <div class="resource-head">
              <button class="icon-btn mobile-menu" style="display:${window.innerWidth <= 720 ? 'inline-grid' : 'none'}" data-action="toggle-resource-roster">${icon('menu')}</button>
              <div class="resource-avatar">${escapeHtml(provider.name.split(/\s+/).map(w => w[0]).join('').slice(0,2))}</div>
              <div class="resource-head-main"><div class="resource-name-line"><div class="resource-name">${escapeHtml(provider.name)}</div>${renderStatus(provider.status, provider.statusLabel)}</div><div class="resource-sub">${escapeHtml(provider.kind)} · ${escapeHtml(provider.product || '')}</div></div>
              <div class="resource-actions">${providerActions}</div>
            </div>
            ${managerTabs(provider.id === 'free-models' ? [
              {id:'overview',label:'Overview'}, {id:'routes',label:'Enabled Routes'}, {id:'models',label:'Models'}, {id:'routing',label:'Routing & Priority'}, {id:'limits',label:'Limits & Resets'}, {id:'diagnostics',label:'Diagnostics'}
            ] : [
              {id:'overview',label:'Overview'}, {id:'accounts',label:'Accounts'}, {id:'models',label:'Models & Plans'}, {id:'routing',label:'Routing & Fallback'}, {id:'installation',label:'Installation'}, {id:'diagnostics',label:'Diagnostics'}
            ], state.providerTab, 'provider-tab')}
            <div class="resource-content">${provider.id === 'free-models' ? renderFreeModels(provider) : renderProviderTab(provider)}</div>
          </section>
        </div>
      </div>
    </div>`;
  }

  function providerRosterRow(provider, activeId) {
    return `<button class="resource-row ${provider.id === activeId ? 'active' : ''}" data-action="select-provider" data-provider="${provider.id}" data-filter-text="${escAttr(`${provider.name} ${provider.kind} ${provider.statusLabel}`.toLowerCase())}">
      <span class="resource-avatar">${escapeHtml(provider.name.split(/\s+/).map(w => w[0]).join('').slice(0,2))}</span>
      <span class="resource-row-copy"><span class="resource-row-name">${escapeHtml(provider.name)}</span><span class="resource-row-meta">${escapeHtml(provider.statusLabel)}</span></span>
      <span class="status-dot ${statusClass(provider.status)}"></span>
    </button>`;
  }

  function renderProviderTab(provider) {
    const tab = state.providerTab;
    if (tab === 'accounts') return renderProviderAccounts(provider);
    if (tab === 'models') return renderProviderModels(provider);
    if (tab === 'routing') return renderProviderRouting(provider);
    if (tab === 'installation') return renderProviderInstallation(provider);
    if (tab === 'diagnostics') return renderProviderDiagnostics(provider);
    return renderProviderOverview(provider);
  }

  function renderProviderOverview(provider) {
    const activeAccounts = provider.accounts.filter(a => a.active).length;
    const readyModels = provider.models.filter(m => m.enabled && m.health === 'Ready').length;
    return `<div class="card-grid four">
      <article class="stat-card"><div class="stat-label">Connection state</div><div class="stat-value">${provider.status === 'active' ? 'Ready' : provider.installed ? 'Needs attention' : 'Not installed'}</div><div class="stat-note">Authentication and invocation are checked separately.</div></article>
      <article class="stat-card"><div class="stat-label">Active accounts</div><div class="stat-value">${activeAccounts}</div><div class="stat-note">${provider.defaultAccount ? `Default: ${escapeHtml(provider.accounts.find(a => a.id === provider.defaultAccount)?.nickname || provider.defaultAccount)}` : 'No default account'}</div></article>
      <article class="stat-card"><div class="stat-label">Ready models</div><div class="stat-value">${readyModels}</div><div class="stat-note">Capabilities belong to each model endpoint.</div></article>
      <article class="stat-card"><div class="stat-label">Product / plan</div><div class="stat-value" style="font-size:13px">${escapeHtml(provider.product)}</div><div class="stat-note">Detected independently from sign-in.</div></article>
    </div>
    ${provider.status !== 'active' ? `<div class="alert-strip">${icon('alert')}<div><strong>${escapeHtml(provider.statusLabel)}</strong><br>${escapeHtml(provider.diagnostics[provider.diagnostics.length - 1] || 'Complete setup before routing work here.')}</div></div>` : ''}
    <div class="card-grid two" style="margin-top:10px">
      <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Readiness</div><div class="panel-subtitle">Installation, authentication, entitlement, catalog, and invocation remain distinct.</div></div></div>
        <div class="info-grid">
          ${infoRow('Installed', provider.installed ? 'Yes' : 'No')}
          ${infoRow('Signed in', provider.signedIn ? 'Yes' : 'No')}
          ${infoRow('Default account', provider.accounts.find(a => a.id === provider.defaultAccount)?.nickname || 'None')}
          ${infoRow('Models detected', String(provider.models.length))}
          ${infoRow('Installation source', provider.installSource)}
          ${infoRow('Catalog state', provider.signedIn ? 'Current or refreshable' : 'Last known / unavailable')}
        </div>
      </section>
      <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Quick actions</div><div class="panel-subtitle">Each action changes or validates real provider fixture state.</div></div></div>
        <div style="display:grid;gap:7px">
          ${provider.installed ? `<button class="btn" data-action="provider-tab-jump" data-tab="accounts">${icon('users')} Manage accounts</button><button class="btn" data-action="provider-tab-jump" data-tab="models">${icon('brain')} Review exact models</button><button class="btn" data-action="provider-tab-jump" data-tab="routing">${icon('route')} Configure routing & fallback</button>` : `<button class="btn primary" data-action="install-provider" data-provider="${provider.id}">${icon('download')} Install from official provider</button>`}
          <button class="btn" data-action="refresh-models" data-provider="${provider.id}">${icon('refresh')} Refresh model catalog</button>
        </div>
      </section>
    </div>
    <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Important distinction</div><div class="panel-subtitle">Provider-level state does not imply every model has every capability.</div></div><button class="btn small" data-action="provider-tab-jump" data-tab="models">Inspect model capabilities</button></div>
      <div class="alert-strip info">${icon('info')}<div>Vision, browser use, image generation, tool use, and long-context support are attached to individual model endpoints. Web & Research, Media & Output, Back Seat Driver, and Chat routing select those exact endpoints.</div></div>
    </section>`;
  }

  function renderProviderAccounts(provider) {
    if (!provider.installed) return emptyManager('Provider not installed', 'Install the official provider integration before adding or signing into accounts.', 'Install provider', 'install-provider', {provider:provider.id});
    return `<section class="panel-card">
      <div class="panel-title-row"><div><div class="panel-title">Accounts</div><div class="panel-subtitle">Add, reconnect, rename, prioritize, deactivate, test, and remove accounts independently.</div></div><button class="btn primary" data-action="add-provider-account" data-provider="${provider.id}">${icon('plus')} Add account</button></div>
      ${provider.accounts.length ? `<table class="data-table"><thead><tr><th>Account</th><th>Sign-in</th><th>Health & usage</th><th>Priority</th><th></th></tr></thead><tbody>${provider.accounts.map((account,index) => `<tr><td><div class="table-primary">${escapeHtml(account.nickname)} ${account.default ? '<span class="badge purple">Default</span>' : ''}</div><div class="table-secondary">${escapeHtml(account.identity)} · ${account.active ? 'Active' : 'Inactive'}</div></td><td>${escapeHtml(account.method)}</td><td><div>${renderStatus(account.health, account.health)}</div><div class="table-secondary">${escapeHtml(account.usage)}</div></td><td><div class="table-actions"><button class="btn small" data-action="move-account" data-provider="${provider.id}" data-account="${account.id}" data-direction="-1" ${index === 0 ? 'disabled' : ''}>↑</button><button class="btn small" data-action="move-account" data-provider="${provider.id}" data-account="${account.id}" data-direction="1" ${index === provider.accounts.length - 1 ? 'disabled' : ''}>↓</button></div></td><td><div class="table-actions"><button class="btn small" data-action="test-account" data-provider="${provider.id}" data-account="${account.id}">${icon('test')} Test</button><button class="icon-btn" data-action="account-menu" data-provider="${provider.id}" data-account="${account.id}">${icon('more')}</button></div></td></tr>`).join('')}</tbody></table>` : `<div class="empty-state"><div><div class="empty-icon">${icon('user')}</div><div class="empty-title">No account is connected</div><div class="empty-copy">Add an account using only the sign-in methods this provider actually supports.</div><div class="empty-actions"><button class="btn primary" data-action="add-provider-account" data-provider="${provider.id}">Add account</button></div></div></div>`}
    </section>
    <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Account-switch behavior</div><div class="panel-subtitle">Used when the selected account is unavailable, cooling down, or out of included usage.</div></div><button class="btn" data-action="edit-account-behavior" data-provider="${provider.id}">${icon('edit')} Edit behavior</button></div>
      <div class="info-grid">${infoRow('Priority', provider.routing.accountOrder.map(id => provider.accounts.find(a=>a.id===id)?.nickname || id).join(' → ') || 'No accounts')}${infoRow('When exhausted', provider.routing.exhaustion)}${infoRow('Paid overage', provider.routing.paidOverage ? 'Allowed within guard' : 'Off')}${infoRow('Inactive accounts', 'Saved, but skipped for routing')}</div>
    </section>`;
  }

  function renderProviderModels(provider) {
    return `<section class="panel-card">
      <div class="panel-title-row"><div><div class="panel-title">Models & products</div><div class="panel-subtitle">Model-specific capabilities, availability, plan source, context, and routing eligibility.</div></div><button class="btn" data-action="refresh-models" data-provider="${provider.id}">${icon('refresh')} Refresh catalog</button></div>
      ${provider.models.length ? `<table class="data-table"><thead><tr><th>Model endpoint</th><th>Capabilities</th><th>Plan</th><th>Context</th><th>Enabled</th><th></th></tr></thead><tbody>${provider.models.map(model => `<tr><td><div class="table-primary">${escapeHtml(model.name)}</div><div class="table-secondary">${escapeHtml(model.health)}</div></td><td><div class="cap-list">${model.caps.map(c => `<span class="cap">${escapeHtml(c)}</span>`).join('')}</div></td><td>${escapeHtml(model.plan)}</td><td>${escapeHtml(model.context)}</td><td><button class="toggle ${model.enabled ? 'on' : ''}" data-action="toggle-model" data-provider="${provider.id}" data-model="${model.id}" aria-label="Enable ${escAttr(model.name)}"></button></td><td><button class="btn small" data-action="edit-model" data-provider="${provider.id}" data-model="${model.id}">${icon('edit')} Configure</button></td></tr>`).join('')}</tbody></table>` : `<div class="empty-state"><div><div class="empty-icon">${icon('brain')}</div><div class="empty-title">No model catalog is available</div><div class="empty-copy">Complete installation and sign-in, then refresh. A last-known catalog is clearly marked and never treated as ready.</div><div class="empty-actions"><button class="btn primary" data-action="refresh-models" data-provider="${provider.id}">Refresh catalog</button></div></div></div>`}
    </section>
    <div class="alert-strip info">${icon('info')}<div>Capabilities are stored on these exact model endpoints. A provider connection by itself is not marked “vision,” “browser,” or “image generation.” Route managers can only choose models that declare the required capability and are currently eligible.</div></div>`;
  }

  function renderProviderRouting(provider) {
    const defaultModel = provider.models.find(m => m.id === provider.routing.defaultModel);
    return `<div class="card-grid two">
      <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Default model</div><div class="panel-subtitle">Used when a task selects this provider but does not choose an exact endpoint.</div></div><button class="btn" data-action="edit-provider-default-model" data-provider="${provider.id}">${icon('edit')} Change</button></div>
        <div class="route-primary"><div class="route-primary-label">Current endpoint</div><div class="route-primary-value">${escapeHtml(defaultModel?.name || 'Not configured')}</div><div class="route-line">${defaultModel ? escapeHtml(defaultModel.caps.join(' · ')) : 'Choose an enabled model'}</div></div>
      </section>
      <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Usage boundary</div><div class="panel-subtitle">Controls what happens when included usage or credits are unavailable.</div></div><button class="btn" data-action="edit-account-behavior" data-provider="${provider.id}">${icon('edit')} Edit</button></div>
        <div class="info-grid">${infoRow('Exhaustion behavior', provider.routing.exhaustion)}${infoRow('Paid overage', provider.routing.paidOverage ? 'Allowed' : 'Off')}</div>
      </section>
    </div>
    <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Account priority</div><div class="panel-subtitle">The first eligible active account is selected. Health, cooldown, and reset state remain visible.</div></div></div>
      <div class="workflow-list">${provider.routing.accountOrder.map((id,index) => { const account=provider.accounts.find(a=>a.id===id); return `<div class="workflow-step"><div class="workflow-number">${index+1}</div><div class="workflow-copy"><div class="workflow-title">${escapeHtml(account?.nickname || id)}</div><div class="workflow-desc">${escapeHtml(account?.health || 'Unknown')} · ${escapeHtml(account?.usage || '')}</div></div><div class="workflow-status"><span class="status-dot ${statusClass(account?.health || '')}"></span>${account?.active ? 'Eligible' : 'Inactive'}</div><div><button class="btn small" data-action="move-account" data-provider="${provider.id}" data-account="${id}" data-direction="-1" ${index===0?'disabled':''}>↑</button> <button class="btn small" data-action="move-account" data-provider="${provider.id}" data-account="${id}" data-direction="1" ${index===provider.routing.accountOrder.length-1?'disabled':''}>↓</button></div></div>`; }).join('') || '<div class="empty-copy">Add an account before configuring priority.</div>'}</div>
    </section>
    <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Provider route test</div><div class="panel-subtitle">Verifies account selection, exact model eligibility, invocation, and usage-boundary behavior.</div></div><button class="btn primary" data-action="test-provider-route" data-provider="${provider.id}">${icon('test')} Run route test</button></div></section>`;
  }

  function renderProviderInstallation(provider) {
    return `<div class="card-grid two">
      <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Installation</div><div class="panel-subtitle">Puppet Master detects provider software but installs it only after an explicit action.</div></div></div>
        <div class="info-grid">${infoRow('Installed', provider.installed ? 'Yes' : 'No')}${infoRow('Version', provider.version)}${infoRow('Source', provider.installSource)}${infoRow('Host', 'Current execution host')}</div>
        <div style="display:flex;gap:7px;margin-top:13px;flex-wrap:wrap">${provider.installed ? `<button class="btn" data-action="check-provider-update" data-provider="${provider.id}">${icon('refresh')} Check for update</button><button class="btn" data-action="repair-provider" data-provider="${provider.id}">${icon('test')} Repair / verify</button><button class="btn danger" data-action="uninstall-provider" data-provider="${provider.id}">${icon('trash')} Uninstall</button>` : `<button class="btn primary" data-action="install-provider" data-provider="${provider.id}">${icon('download')} Install from official provider</button>`}</div>
      </section>
      <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Authentication</div><div class="panel-subtitle">Installation, sign-in, entitlement, and invocation are checked independently.</div></div></div>
        <div class="info-grid">${infoRow('Signed in', provider.signedIn ? 'Yes' : 'No')}${infoRow('Method', provider.accounts[0]?.method || 'Provider-supported method')}${infoRow('Entitlement', provider.product)}${infoRow('Invocation', provider.status === 'active' ? 'Last test passed' : 'Not ready')}</div>
        <div style="display:flex;gap:7px;margin-top:13px;flex-wrap:wrap"><button class="btn primary" data-action="reconnect-provider" data-provider="${provider.id}">${icon('key')} ${provider.signedIn ? 'Reconnect' : 'Sign in'}</button><button class="btn" data-action="test-provider" data-provider="${provider.id}">${icon('test')} Check connection</button></div>
      </section>
    </div>
    <div class="alert-strip info">${icon('info')}<div>Provider CLIs are never silently bundled or installed. This concept opens an explicit setup preview, names the official source, shows the target host, and requires confirmation before simulation.</div></div>`;
  }

  function renderProviderDiagnostics(provider) {
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Connection checks</div><div class="panel-subtitle">Each result explains which layer passed or failed.</div></div><button class="btn primary" data-action="test-provider" data-provider="${provider.id}">${icon('test')} Run all checks</button></div>
      <div class="workflow-list">${[
        ['Installation detected', provider.installed ? 'ready' : 'blocked', provider.installed ? provider.version : 'Install required'],
        ['Authentication valid', provider.signedIn ? 'ready' : 'blocked', provider.signedIn ? 'Provider session or key accepted' : 'Sign-in required'],
        ['Product / plan usable', provider.status === 'active' ? 'ready' : 'attention', provider.product],
        ['Model catalog available', provider.models.length ? 'ready' : 'attention', `${provider.models.length} entries`],
        ['Model invocation', provider.status === 'active' ? 'ready' : 'attention', provider.status === 'active' ? 'Last call succeeded' : provider.statusLabel]
      ].map((row,index) => `<div class="workflow-step"><div class="workflow-number">${index+1}</div><div class="workflow-copy"><div class="workflow-title">${escapeHtml(row[0])}</div><div class="workflow-desc">${escapeHtml(row[2])}</div></div><div class="workflow-status"><span class="status-dot ${row[1]}"></span>${row[1] === 'ready' ? 'Passed' : row[1] === 'blocked' ? 'Blocked' : 'Attention'}</div><button class="btn small" data-action="open-diagnostic-detail" data-provider="${provider.id}" data-index="${index}">Details</button></div>`).join('')}</div>
    </section>
    <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Recent diagnostic notes</div><div class="panel-subtitle">Safe summaries; credentials and raw tokens are never shown.</div></div><button class="btn" data-action="export-provider-diagnostics" data-provider="${provider.id}">${icon('download')} Export redacted report</button></div>${provider.diagnostics.map(note => `<div class="alert-strip ${note.toLowerCase().includes('passed') || note.toLowerCase().includes('healthy') ? 'success' : 'info'}">${icon('info')}<div>${escapeHtml(note)}</div></div>`).join('')}</section>`;
  }

  function renderFreeModels(provider) {
    const tab = state.providerTab;
    const route = state.freeRoutes.find(r => r.id === state.selectedFreeRoute) || state.freeRoutes[0];
    if (tab === 'routes') return renderFreeRoutes(route);
    if (tab === 'models') return renderFreeModelCatalog();
    if (tab === 'routing') return renderFreeRouting();
    if (tab === 'limits') return renderFreeLimits();
    if (tab === 'diagnostics') return renderFreeDiagnostics();
    const enabled = state.freeRoutes.filter(r=>r.enabled);
    return `<div class="card-grid four">
      <article class="stat-card"><div class="stat-label">Collection state</div><div class="stat-value">Active</div><div class="stat-note">One Settings provider contains all free routes.</div></article>
      <article class="stat-card"><div class="stat-label">Enabled routes</div><div class="stat-value">${enabled.length}</div><div class="stat-note">Disabled routes expose only an Enable action.</div></article>
      <article class="stat-card"><div class="stat-label">Models available</div><div class="stat-value">${enabled.reduce((n,r)=>n+r.models.length,0)}</div><div class="stat-note">Operational screens show the actual underlying provider.</div></article>
      <article class="stat-card"><div class="stat-label">Billing boundary</div><div class="stat-value" style="font-size:13px">Free only</div><div class="stat-note">No paid fallback without a separate route.</div></article>
    </div>
    <div class="alert-strip info">${icon('info')}<div>Free Models owns no shared credential store. Each enabled nested route keeps its provider-specific sign-in, limits, terms, availability, and diagnostics here. It never creates another top-level Settings provider row.</div></div>
    <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Route readiness</div><div class="panel-subtitle">Enable new providers deliberately; only enabled routes reveal configuration controls.</div></div><button class="btn primary" data-action="provider-tab-jump" data-tab="routes">Manage routes</button></div>
      <div class="workflow-list">${state.freeRoutes.map((r,index) => `<div class="workflow-step"><div class="workflow-number">${index+1}</div><div class="workflow-copy"><div class="workflow-title">${escapeHtml(r.name)}</div><div class="workflow-desc">${escapeHtml(r.signIn)} · ${escapeHtml(r.limit)}</div></div><div class="workflow-status"><span class="status-dot ${statusClass(r.status)}"></span>${r.enabled ? cap(r.status) : 'Disabled'}</div><button class="btn small" data-action="select-free-route" data-route="${r.id}" data-open-tab="routes">${r.enabled ? 'Open' : 'Enable'}</button></div>`).join('')}</div>
    </section>`;
  }

  function renderFreeRoutes(selected) {
    return `<div class="library-grid">
      <section class="library-list"><div class="roster-head"><div class="roster-title">Nested free routes</div><button class="icon-btn" data-action="discover-free-route">${icon('plus')}</button></div><div class="library-list-scroll">${state.freeRoutes.map(route => `<button class="library-item ${route.id === selected.id ? 'active' : ''}" data-action="select-free-route" data-route="${route.id}"><span class="resource-avatar">${escapeHtml(route.provider.slice(0,2).toUpperCase())}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(route.name)}</span><span class="library-item-desc">${route.enabled ? escapeHtml(`${route.status} · ${route.models.length} models`) : 'Disabled · enable to configure'}</span></span><span class="status-dot ${statusClass(route.status)}"></span></button>`).join('')}</div></section>
      <section class="library-detail">${selected.enabled ? renderEnabledFreeRoute(selected) : renderDisabledFreeRoute(selected)}</section>
    </div>`;
  }

  function renderDisabledFreeRoute(route) {
    return `<div class="empty-state"><div><div class="empty-icon">${icon('brain')}</div><div class="empty-title">${escapeHtml(route.name)} is not enabled</div><div class="empty-copy">Review its provider, terms, privacy, sign-in requirements, and expected limits before creating provider-specific controls inside Free Models.</div><div class="panel-card" style="margin-top:15px;text-align:left"><div class="info-grid">${infoRow('Underlying provider', route.provider)}${infoRow('Sign-in', route.signIn)}${infoRow('Limits', route.limit)}${infoRow('Terms', route.terms)}</div></div><div class="empty-actions"><button class="btn primary" data-action="enable-free-route" data-route="${route.id}">${icon('plus')} Review and enable</button></div></div></div>`;
  }

  function renderEnabledFreeRoute(route) {
    return `<div class="resource-head" style="margin:-16px -16px 15px;border-radius:10px 10px 0 0"><div class="resource-avatar">${escapeHtml(route.provider.slice(0,2).toUpperCase())}</div><div class="resource-head-main"><div class="resource-name-line"><div class="resource-name">${escapeHtml(route.name)}</div>${renderStatus(route.status, cap(route.status))}</div><div class="resource-sub">Nested inside Free Models · Priority ${route.priority ?? 'Not set'}</div></div><div class="resource-actions"><button class="btn" data-action="test-free-route" data-route="${route.id}">${icon('test')} Test</button><button class="btn" data-action="edit-free-route" data-route="${route.id}">${icon('edit')} Configure</button></div></div>
      <div class="card-grid three"><article class="stat-card"><div class="stat-label">Models</div><div class="stat-value">${route.models.length}</div><div class="stat-note">${escapeHtml(route.models.join(', ') || 'Refresh after sign-in')}</div></article><article class="stat-card"><div class="stat-label">Sign-in</div><div class="stat-value" style="font-size:12px">${escapeHtml(route.signIn)}</div><div class="stat-note">Credential remains owned by its provider.</div></article><article class="stat-card"><div class="stat-label">Availability</div><div class="stat-value" style="font-size:13px">${escapeHtml(route.limit)}</div><div class="stat-note">Free availability can change.</div></article></div>
      <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Route controls</div><div class="panel-subtitle">These controls exist only because the nested provider is enabled.</div></div></div><div class="info-grid">${infoRow('Priority', String(route.priority))}${infoRow('Provider', route.provider)}${infoRow('Terms', route.terms)}${infoRow('Operational identity', `${route.provider} appears by name in model picker and Usage`)}</div><div style="display:flex;gap:7px;margin-top:13px;flex-wrap:wrap"><button class="btn" data-action="reconnect-free-route" data-route="${route.id}">${icon('key')} Reconnect</button><button class="btn" data-action="refresh-free-route" data-route="${route.id}">${icon('refresh')} Refresh models</button><button class="btn danger" data-action="disable-free-route" data-route="${route.id}">${icon('trash')} Disable route</button></div></section>`;
  }

  function renderFreeModelCatalog() {
    const enabled = state.freeRoutes.filter(r=>r.enabled);
    const rows = enabled.flatMap(route => route.models.map((model,index)=>({route,model,id:`${route.id}-${index}`})));
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Free model catalog</div><div class="panel-subtitle">Models stay grouped in Settings, while operational screens attribute the actual provider route.</div></div><button class="btn" data-action="refresh-all-free-models">${icon('refresh')} Refresh all</button></div><table class="data-table"><thead><tr><th>Model</th><th>Underlying provider</th><th>Route health</th><th>Limits</th><th></th></tr></thead><tbody>${rows.map(row=>`<tr><td><div class="table-primary">${escapeHtml(row.model)}</div><div class="table-secondary">Free Models collection</div></td><td>${escapeHtml(row.route.provider)}</td><td>${renderStatus(row.route.status,cap(row.route.status))}</td><td>${escapeHtml(row.route.limit)}</td><td><button class="btn small" data-action="select-free-route" data-route="${row.route.id}" data-open-tab="routes">Open route</button></td></tr>`).join('')}</tbody></table></section>`;
  }

  function renderFreeRouting() {
    const enabled = state.freeRoutes.filter(r=>r.enabled).sort((a,b)=>(a.priority||99)-(b.priority||99));
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Free route priority</div><div class="panel-subtitle">The first eligible route with a compatible model is used. Reordering affects only the Free Models collection.</div></div><button class="btn primary" data-action="test-free-fallback">${icon('test')} Test fallback chain</button></div><div class="workflow-list">${enabled.map((r,index)=>`<div class="workflow-step"><div class="workflow-number">${index+1}</div><div class="workflow-copy"><div class="workflow-title">${escapeHtml(r.name)}</div><div class="workflow-desc">${escapeHtml(r.models.join(', '))} · ${escapeHtml(r.limit)}</div></div><div class="workflow-status"><span class="status-dot ${statusClass(r.status)}"></span>${cap(r.status)}</div><div><button class="btn small" data-action="move-free-route" data-route="${r.id}" data-direction="-1" ${index===0?'disabled':''}>↑</button> <button class="btn small" data-action="move-free-route" data-route="${r.id}" data-direction="1" ${index===enabled.length-1?'disabled':''}>↓</button></div></div>`).join('')}</div></section><div class="alert-strip info">${icon('info')}<div>Free Models never falls through to paid usage. A separate named AI route can include Free Models and paid providers if the user explicitly configures that behavior.</div></div>`;
  }

  function renderFreeLimits() {
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Limits & reset information</div><div class="panel-subtitle">Each nested route reports its own authority, cadence, availability, and confidence.</div></div><button class="btn" data-action="refresh-free-limits">${icon('refresh')} Refresh</button></div><table class="data-table"><thead><tr><th>Route</th><th>Authority</th><th>Current limit</th><th>State</th><th></th></tr></thead><tbody>${state.freeRoutes.filter(r=>r.enabled).map(r=>`<tr><td><div class="table-primary">${escapeHtml(r.name)}</div><div class="table-secondary">${escapeHtml(r.provider)}</div></td><td>Provider reported</td><td>${escapeHtml(r.limit)}</td><td>${renderStatus(r.status,cap(r.status))}</td><td><button class="btn small" data-action="select-free-route" data-route="${r.id}" data-open-tab="routes">Details</button></td></tr>`).join('')}</tbody></table></section>`;
  }

  function renderFreeDiagnostics() {
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Nested route diagnostics</div><div class="panel-subtitle">Checks setup, authentication, model refresh, eligibility, and a no-cost invocation where supported.</div></div><button class="btn primary" data-action="test-all-free-routes">${icon('test')} Test enabled routes</button></div><div class="workflow-list">${state.freeRoutes.filter(r=>r.enabled).map((r,index)=>`<div class="workflow-step"><div class="workflow-number">${index+1}</div><div class="workflow-copy"><div class="workflow-title">${escapeHtml(r.name)}</div><div class="workflow-desc">${escapeHtml(r.signIn)} · ${escapeHtml(r.models.length ? `${r.models.length} models` : 'No models available')}</div></div><div class="workflow-status"><span class="status-dot ${statusClass(r.status)}"></span>${cap(r.status)}</div><button class="btn small" data-action="test-free-route" data-route="${r.id}">Test</button></div>`).join('')}</div></section>`;
  }

  function infoRow(key, value) { return `<div class="info-row"><span class="info-key">${escapeHtml(key)}</span><span class="info-value">${escapeHtml(value ?? '—')}</span></div>`; }

  function emptyManager(title, copy, actionLabel = '', action = '', data = {}) {
    return `<div class="empty-state"><div><div class="empty-icon">${icon('settings')}</div><div class="empty-title">${escapeHtml(title)}</div><div class="empty-copy">${escapeHtml(copy)}</div>${actionLabel ? `<div class="empty-actions"><button class="btn primary" data-action="${action}" ${Object.entries(data).map(([k,v])=>`data-${k}="${escAttr(v)}"`).join(' ')}>${escapeHtml(actionLabel)}</button></div>` : ''}</div></div>`;
  }

  function renderWebRoutes() {
    const route = state.webRoutes.find(r => r.id === state.selectedWebRoute) || state.webRoutes[0];
    return `<div class="manager-page page-enter">
      ${pageHeader('browser', 'Web & Research', 'Configure the exact tool or model endpoint used for Search, Fetch, Crawl, Browser, Map, and Extract. Provider installation and accounts remain owned by Providers.', `<button class="btn" data-action="test-all-web-routes">${icon('test')} Test all routes</button><button class="btn primary" data-action="web-route-wizard">${icon('route')} Route assistant</button>`)}
      <div class="manager-body"><div class="split-manager">
        <aside class="resource-roster"><div class="roster-head"><div class="roster-title">Capabilities</div></div><div class="roster-search"><input placeholder="Filter capabilities…" data-action="filter-roster" data-roster="web-routes"/></div><div class="roster-list" id="web-route-roster">${state.webRoutes.map(r => `<button class="resource-row ${r.id===route.id?'active':''}" data-action="select-web-route" data-route="${r.id}" data-filter-text="${escAttr(`${r.name} ${r.description} ${r.primary.provider} ${r.primary.model}`.toLowerCase())}"><span class="resource-avatar">${icon(r.icon)}</span><span class="resource-row-copy"><span class="resource-row-name">${escapeHtml(r.name)}</span><span class="resource-row-meta">${escapeHtml(r.primary.provider)} · ${escapeHtml(r.primary.model)}</span></span><span class="status-dot ${statusClass(r.status)}"></span></button>`).join('')}</div></aside>
        <section class="resource-detail"><div class="resource-head"><button class="icon-btn mobile-menu" style="display:${window.innerWidth<=720?'inline-grid':'none'}" data-action="toggle-resource-roster">${icon('menu')}</button><div class="resource-avatar">${icon(route.icon)}</div><div class="resource-head-main"><div class="resource-name-line"><div class="resource-name">${escapeHtml(route.name)} route</div>${renderStatus(route.status, route.status==='ready'?'Ready':'Needs setup')}</div><div class="resource-sub">${escapeHtml(route.description)}</div></div><div class="resource-actions"><button class="btn" data-action="test-web-route" data-route="${route.id}">${icon('test')}<span class="btn-label">Test route</span></button><button class="btn primary" data-action="edit-web-route" data-route="${route.id}">${icon('edit')}<span class="btn-label">Configure</span></button></div></div>
          ${managerTabs([{id:'route',label:'Route'}, {id:'fallbacks',label:'Fallbacks & Priority'}, {id:'policy',label:'Limits & Policy'}, {id:'test',label:'Test Lab'}, {id:'diagnostics',label:'Diagnostics'}], state.webRouteTab || 'route', 'web-route-tab')}
          <div class="resource-content">${renderWebRouteTab(route)}</div>
        </section>
      </div></div>
    </div>`;
  }

  function renderWebRouteTab(route) {
    const tab = state.webRouteTab || 'route';
    if (tab === 'fallbacks') return renderRouteFallbacks(route, 'web');
    if (tab === 'policy') return renderRoutePolicy(route, 'web');
    if (tab === 'test') return renderRouteTestLab(route, 'web');
    if (tab === 'diagnostics') return renderRouteDiagnostics(route, 'web');
    const modelSpecific = route.primary.type === 'model';
    return `<div class="card-grid three">
      <article class="stat-card"><div class="stat-label">Primary route type</div><div class="stat-value" style="font-size:13px">${modelSpecific ? 'Model endpoint' : 'Deterministic tool'}</div><div class="stat-note">${modelSpecific ? 'Provider + exact model + account' : 'No AI model required for the core operation'}</div></article>
      <article class="stat-card"><div class="stat-label">Fallbacks</div><div class="stat-value">${route.fallbacks.length}</div><div class="stat-note">Ordered and checked for current eligibility.</div></article>
      <article class="stat-card"><div class="stat-label">Current health</div><div class="stat-value" style="font-size:13px">${route.status==='ready'?'Ready':'Setup needed'}</div><div class="stat-note">Last route test used fixture state.</div></article>
    </div>
    <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Primary endpoint</div><div class="panel-subtitle">The route selects an exact model only when the capability needs model reasoning.</div></div><button class="btn" data-action="edit-web-route" data-route="${route.id}">${icon('edit')} Change endpoint</button></div>
      <div class="route-primary"><div class="route-primary-label">${modelSpecific?'Model endpoint':'Built-in tool'}</div><div class="route-primary-value">${escapeHtml(route.primary.provider)} · ${escapeHtml(route.primary.model)}</div><div class="route-line">${escapeHtml(route.primary.account)} · ${escapeHtml(route.primary.mode || '')}</div></div>
      ${modelSpecific ? `<div class="alert-strip info">${icon('info')}<div>This selection is validated against the exact model’s declared capabilities and account eligibility. Choosing a provider alone is not enough.</div></div>` : `<div class="alert-strip success">${icon('check')}<div>${escapeHtml(route.name)} begins with a deterministic Puppet Master tool. A model may still be used later for interpretation or fallback, but the tool itself has no provider account.</div></div>`}
    </section>
    <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Setup path</div><div class="panel-subtitle">Every step opens and can be changed or tested.</div></div></div>
      <div class="workflow-list">
        ${workflowStep(1,'Choose the capability endpoint',`${route.primary.provider} · ${route.primary.model}`,'Ready','edit-web-route',{route:route.id})}
        ${workflowStep(2,'Confirm account and availability',route.primary.account || 'No account required',modelSpecific?'Ready':'Not required','open-web-account',{route:route.id})}
        ${workflowStep(3,'Order fallbacks',`${route.fallbacks.length} configured`,route.fallbacks.length?'Ready':'Optional','web-route-tab-jump',{tab:'fallbacks'})}
        ${workflowStep(4,'Set privacy, limits, and cache policy',`${Object.keys(route.policy).length} explicit values`,'Ready','web-route-tab-jump',{tab:'policy'})}
        ${workflowStep(5,'Run an end-to-end route test','Shows endpoint, duration, output, and failure detail','Next','web-route-tab-jump',{tab:'test'})}
      </div>
    </section>`;
  }

  function renderRouteFallbacks(route, kind) {
    const editAction = kind === 'web' ? 'edit-web-fallbacks' : 'edit-media-fallbacks';
    const testAction = kind === 'web' ? 'test-web-fallback-chain' : 'test-media-fallback-chain';
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Fallback priority</div><div class="panel-subtitle">Routes are tried in order only when compatible, enabled, authenticated, within policy, and currently available.</div></div><button class="btn primary" data-action="${editAction}" data-route="${route.id}">${icon('edit')} Edit chain</button></div>
      <div class="workflow-list">
        ${workflowStep(1, `${route.primary.provider} · ${route.primary.model}`, `${route.primary.account || 'No account'} · Primary`, 'Ready', kind==='web'?'edit-web-route':'edit-media-route', {route:route.id})}
        ${(route.fallbacks || []).map((fallback,index)=>workflowStep(index+2,`${fallback.provider} · ${fallback.model}`,`${fallback.account || 'No account'} · ${fallback.enabled===false?'Disabled':'Eligible'}`,fallback.enabled===false?'Disabled':'Ready', editAction,{route:route.id})).join('')}
        ${workflowStep((route.fallbacks||[]).length+2,'No eligible route','Stop, ask, or return a typed capability error','Boundary', editAction,{route:route.id})}
      </div>
      <div style="display:flex;gap:7px;margin-top:12px"><button class="btn" data-action="${testAction}" data-route="${route.id}">${icon('test')} Simulate primary failure</button><button class="btn" data-action="add-route-fallback" data-kind="${kind}" data-route="${route.id}">${icon('plus')} Add fallback</button></div>
    </section>`;
  }

  function renderRoutePolicy(route, kind) {
    const rows = Object.entries(route.policy || route.output || {});
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Capability policy</div><div class="panel-subtitle">Limits are explicit and capability-specific instead of buried in provider setup.</div></div><button class="btn primary" data-action="edit-route-policy" data-kind="${kind}" data-route="${route.id}">${icon('edit')} Edit policy</button></div><div class="info-grid">${rows.map(([key,value])=>infoRow(key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()), String(value))).join('')}</div></section>
    <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Effective configuration preview</div><div class="panel-subtitle">Preview exactly what will run before applying a change.</div></div><button class="btn" data-action="preview-route-config" data-kind="${kind}" data-route="${route.id}">${icon('eye')} Preview effective route</button></div>
      <div class="prompt-box">Capability: ${escapeHtml(route.name)}\nPrimary: ${escapeHtml(route.primary.provider)} / ${escapeHtml(route.primary.model)}\nFallbacks: ${(route.fallbacks||[]).map(f=>escapeHtml(`${f.provider}/${f.model}`)).join(' → ') || 'None'}\nPolicy keys: ${rows.map(([k])=>escapeHtml(k)).join(', ')}</div>
    </section>`;
  }

  function renderRouteTestLab(route, kind) {
    const testAction = kind === 'web' ? 'run-web-test-lab' : 'run-media-test-lab';
    const inputLabel = kind === 'web' ? 'Test request' : 'Test input or prompt';
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Test input</div><div class="panel-subtitle">No production data is sent in this concept; the result simulates the configured route.</div></div></div><label class="form-field"><span class="form-label">${inputLabel}</span><textarea class="form-textarea" id="route-test-input">${kind==='web' ? `Find the primary documentation for ${route.name.toLowerCase()} and explain the route used.` : `Create a small test for ${route.name.toLowerCase()} using the configured output defaults.`}</textarea></label><div style="display:flex;gap:7px;margin-top:10px"><button class="btn primary" data-action="${testAction}" data-route="${route.id}">${icon('play')} Run test</button><button class="btn" data-action="route-test-menu" data-kind="${kind}" data-route="${route.id}">${icon('more')} Test options</button></div></section>
      <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Last result</div><div class="panel-subtitle">Endpoint attribution stays visible.</div></div></div><div class="alert-strip success">${icon('check')}<div><strong>Ready to test</strong><br>The next result will show the exact tool/model, account, fallback decisions, duration, policy checks, and any typed error.</div></div><div class="info-grid" style="margin-top:12px">${infoRow('Expected primary',`${route.primary.provider} · ${route.primary.model}`)}${infoRow('Account',route.primary.account || 'None')}${infoRow('Fallbacks',String((route.fallbacks||[]).length))}${infoRow('Evidence','Compact route receipt')}</div></section></div>`;
  }

  function renderRouteDiagnostics(route, kind) {
    const actions = kind==='web' ? 'test-web-route' : 'test-media-route';
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Route diagnostics</div><div class="panel-subtitle">Checks capability compatibility, provider/account readiness, policy, tool availability, and a representative invocation.</div></div><button class="btn primary" data-action="${actions}" data-route="${route.id}">${icon('test')} Run checks</button></div><div class="workflow-list">
      ${workflowStep(1,'Capability match',`${route.primary.model} declares or provides ${route.name}`,'Passed','open-route-diagnostic',{kind,route:route.id,index:0})}
      ${workflowStep(2,'Provider and account health',`${route.primary.provider} · ${route.primary.account || 'No account required'}`,'Passed','open-route-diagnostic',{kind,route:route.id,index:1})}
      ${workflowStep(3,'Policy validation',`${Object.keys(route.policy||route.output||{}).length} values validated`,'Passed','open-route-diagnostic',{kind,route:route.id,index:2})}
      ${workflowStep(4,'Representative invocation','Not run in this session','Next','open-route-diagnostic',{kind,route:route.id,index:3})}
    </div></section>`;
  }

  function workflowStep(number,title,desc,status,action,data={}) {
    const cls = statusClass(status);
    return `<div class="workflow-step"><div class="workflow-number">${number}</div><div class="workflow-copy"><div class="workflow-title">${escapeHtml(title)}</div><div class="workflow-desc">${escapeHtml(desc)}</div></div><div class="workflow-status"><span class="status-dot ${cls}"></span>${escapeHtml(status)}</div><button class="btn small" data-action="${action}" ${Object.entries(data).map(([k,v])=>`data-${k}="${escAttr(v)}"`).join(' ')}>${status==='Next'?'Open':status==='Optional'?'Configure':'Details'}</button></div>`;
  }

  function renderMediaRoutes() {
    const route = state.mediaRoutes.find(r => r.id === state.selectedMediaRoute) || state.mediaRoutes[0];
    return `<div class="manager-page page-enter">
      ${pageHeader('image', 'Media & Output', 'Choose exact model endpoints and deterministic renderers for images, vision, speech, audio, video, and document output. Output storage, quality, privacy, and tests are configured per capability.', `<button class="btn" data-action="test-all-media-routes">${icon('test')} Test ready routes</button><button class="btn primary" data-action="media-route-wizard">${icon('route')} Configure capability</button>`)}
      <div class="manager-body"><div class="split-manager">
        <aside class="resource-roster"><div class="roster-head"><div class="roster-title">Media capabilities</div></div><div class="roster-search"><input placeholder="Filter capabilities…" data-action="filter-roster" data-roster="media-routes"/></div><div class="roster-list" id="media-route-roster">${state.mediaRoutes.map(r => `<button class="resource-row ${r.id===route.id?'active':''}" data-action="select-media-route" data-route="${r.id}" data-filter-text="${escAttr(`${r.name} ${r.primary.provider} ${r.primary.model}`.toLowerCase())}"><span class="resource-avatar">${icon(r.icon)}</span><span class="resource-row-copy"><span class="resource-row-name">${escapeHtml(r.name)}</span><span class="resource-row-meta">${escapeHtml(r.primary.provider)} · ${escapeHtml(r.primary.model)}</span></span><span class="status-dot ${statusClass(r.status)}"></span></button>`).join('')}</div></aside>
        <section class="resource-detail"><div class="resource-head"><button class="icon-btn mobile-menu" style="display:${window.innerWidth<=720?'inline-grid':'none'}" data-action="toggle-resource-roster">${icon('menu')}</button><div class="resource-avatar">${icon(route.icon)}</div><div class="resource-head-main"><div class="resource-name-line"><div class="resource-name">${escapeHtml(route.name)}</div>${renderStatus(route.status,route.status==='ready'?'Ready':'Needs setup')}</div><div class="resource-sub">${escapeHtml(route.primary.provider)} · ${escapeHtml(route.primary.model)}</div></div><div class="resource-actions"><button class="btn" data-action="test-media-route" data-route="${route.id}">${icon('test')}<span class="btn-label">Test</span></button><button class="btn primary" data-action="edit-media-route" data-route="${route.id}">${icon('edit')}<span class="btn-label">Configure</span></button></div></div>
          ${managerTabs([{id:'route',label:'Route'}, {id:'fallbacks',label:'Fallbacks'}, {id:'policy',label:'Output & Storage'}, {id:'test',label:'Test Lab'}, {id:'diagnostics',label:'Diagnostics'}], state.mediaRouteTab || 'route', 'media-route-tab')}
          <div class="resource-content">${renderMediaRouteTab(route)}</div>
        </section>
      </div></div>
    </div>`;
  }

  function renderMediaRouteTab(route) {
    const tab = state.mediaRouteTab || 'route';
    if (tab==='fallbacks') return renderRouteFallbacks(route,'media');
    if (tab==='policy') return renderRoutePolicy(route,'media');
    if (tab==='test') return renderRouteTestLab(route,'media');
    if (tab==='diagnostics') return renderRouteDiagnostics(route,'media');
    const configured = route.primary.provider !== 'Not configured';
    return `<div class="card-grid three"><article class="stat-card"><div class="stat-label">Configuration</div><div class="stat-value" style="font-size:14px">${configured?'Ready':'Incomplete'}</div><div class="stat-note">${configured?'Exact endpoint selected':'Choose a supported model endpoint'}</div></article><article class="stat-card"><div class="stat-label">Fallbacks</div><div class="stat-value">${route.fallbacks.length}</div><div class="stat-note">Ordered by compatibility and availability.</div></article><article class="stat-card"><div class="stat-label">Output destination</div><div class="stat-value" style="font-size:12px">${escapeHtml(route.output.destination || 'Managed by capability')}</div><div class="stat-note">Never overwrites without policy approval.</div></article></div>
      <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Exact endpoint</div><div class="panel-subtitle">Only compatible models from configured providers are offered.</div></div><button class="btn primary" data-action="edit-media-route" data-route="${route.id}">${icon('edit')} ${configured?'Change endpoint':'Set up route'}</button></div><div class="route-primary"><div class="route-primary-label">${route.primary.provider==='Built-in'?'Deterministic renderer':'Model endpoint'}</div><div class="route-primary-value">${escapeHtml(route.primary.provider)} · ${escapeHtml(route.primary.model)}</div><div class="route-line">Account: ${escapeHtml(route.primary.account || 'None')}</div></div>${!configured?`<div class="alert-strip">${icon('alert')}<div>No model is assigned. Open Configure to choose a provider, exact compatible model, account, fallback, format, quality, storage destination, and privacy behavior.</div></div>`:''}</section>
      <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Output behavior</div><div class="panel-subtitle">Capability-specific values remain visible and testable.</div></div><button class="btn" data-action="edit-route-policy" data-kind="media" data-route="${route.id}">${icon('edit')} Edit output</button></div><div class="info-grid">${Object.entries(route.output).map(([k,v])=>infoRow(k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()),String(v))).join('')}</div></section>`;
  }

  function renderBSD() {
    const b = state.bsd;
    const provider = state.providers.find(p=>p.name===b.provider);
    const models = provider?.models.filter(m=>m.enabled) || [];
    const fallbackProvider = state.providers.find(p=>p.name===b.fallbackProvider);
    return `<div class="manager-page page-enter">
      ${pageHeader('eye', 'Back Seat Driver', 'Configure the advisor’s exact provider, model, account, fallback, intervention sensitivity, and usage boundary. Auto remains the recommended default.', `<button class="btn" data-action="test-bsd-route">${icon('test')} Test advisor route</button><button class="btn primary" data-action="preview-bsd">${icon('eye')} Preview intervention</button>`)}
      <div class="manager-body"><div class="manager-scroll">
        <div class="card-grid three"><article class="stat-card"><div class="stat-label">Mode</div><div class="stat-value">${escapeHtml(b.mode)}</div><div class="stat-note">Off · Auto · On</div></article><article class="stat-card"><div class="stat-label">Primary advisor</div><div class="stat-value" style="font-size:12px">${escapeHtml(b.provider)} · ${escapeHtml(b.model)}</div><div class="stat-note">Account: ${escapeHtml(b.account)}</div></article><article class="stat-card"><div class="stat-label">Fallback</div><div class="stat-value" style="font-size:12px">${escapeHtml(b.fallbackProvider)} · ${escapeHtml(b.fallbackModel)}</div><div class="stat-note">Used only when primary is ineligible.</div></article></div>
        <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Advisor mode</div><div class="panel-subtitle">Auto observes when additional review is likely to help; On keeps the advisor present; Off disables it.</div></div></div><div class="segmented">${['Off','Auto','On'].map(mode=>`<button class="${mode===b.mode?'active':''}" data-action="set-bsd-field" data-field="mode" data-value="${mode}">${mode}</button>`).join('')}</div></section>
        <div class="card-grid two" style="margin-top:10px">
          <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Primary provider & model</div><div class="panel-subtitle">The model endpoint must be enabled and eligible on the selected account.</div></div><button class="btn" data-action="open-provider-from-bsd" data-provider-name="${escAttr(b.provider)}">Open provider</button></div>
            <div class="form-grid">
              ${inlineSelect('Provider','bsd-provider',b.provider,state.providers.filter(p=>p.status==='active'&&p.id!=='free-models').map(p=>p.name),'change-bsd-provider')}
              ${inlineSelect('Exact model','bsd-model',b.model,models.map(m=>m.name),'change-bsd-field','model')}
              ${inlineSelect('Account','bsd-account',b.account,provider?.accounts.filter(a=>a.active).map(a=>a.nickname) || [],'change-bsd-field','account')}
              ${inlineSelect('Intervention sensitivity','bsd-sensitivity',b.sensitivity,['Quiet','Balanced','Proactive'],'change-bsd-field','sensitivity')}
            </div>
          </section>
          <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Fallback route</div><div class="panel-subtitle">A separately configured model endpoint; never an ambiguous provider-wide fallback.</div></div></div>
            <div class="form-grid">${inlineSelect('Fallback provider','bsd-fallback-provider',b.fallbackProvider,state.providers.filter(p=>p.status==='active'&&p.id!=='free-models').map(p=>p.name),'change-bsd-fallback-provider')}${inlineSelect('Fallback model','bsd-fallback-model',b.fallbackModel,(fallbackProvider?.models||[]).filter(m=>m.enabled).map(m=>m.name),'change-bsd-field','fallbackModel')}</div>
          </section>
        </div>
        <div class="card-grid two" style="margin-top:10px"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Usage & interruption</div><div class="panel-subtitle">Control cost boundaries and when advice may interrupt work.</div></div><button class="btn" data-action="edit-bsd-policy">${icon('edit')} Edit policy</button></div><div class="info-grid">${infoRow('Usage boundary',b.usageBoundary)}${infoRow('Intervention policy',b.intervention)}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Observed contexts</div><div class="panel-subtitle">Auto mode watches these situations and remains quiet otherwise.</div></div><button class="btn" data-action="edit-bsd-contexts">${icon('edit')} Choose contexts</button></div><div class="cap-list">${b.contexts.map(c=>`<span class="cap">${escapeHtml(c)}</span>`).join('')}</div></section></div>
        <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Effective advisor route</div><div class="panel-subtitle">This preview makes the route’s exact identity and boundary obvious.</div></div><button class="btn primary" data-action="test-bsd-route">${icon('test')} Run route test</button></div><div class="prompt-box">Mode: ${escapeHtml(b.mode)}\nPrimary: ${escapeHtml(b.provider)} / ${escapeHtml(b.model)} / ${escapeHtml(b.account)}\nFallback: ${escapeHtml(b.fallbackProvider)} / ${escapeHtml(b.fallbackModel)}\nUsage: ${escapeHtml(b.usageBoundary)}\nIntervention: ${escapeHtml(b.intervention)}</div></section>
      </div></div>
    </div>`;
  }

  function inlineSelect(label,id,value,choices,action,field='') {
    return `<label class="form-field"><span class="form-label">${escapeHtml(label)}</span><select class="form-select" id="${escAttr(id)}" data-action="${action}" ${field?`data-field="${field}"`:''}>${(choices.length?choices:[value]).map(c=>`<option ${c===value?'selected':''}>${escapeHtml(c)}</option>`).join('')}</select></label>`;
  }

  function renderToolchain() {
    const tabs = [
      {id:'lsps',label:'Language Servers'}, {id:'formatters',label:'Formatters'}, {id:'mcps',label:'MCP Servers'},
      {id:'commands',label:'Commands & Shortcuts'}, {id:'skills',label:'Skills'}, {id:'plugins',label:'Plugins'}, {id:'agentTools',label:'Agent Tools'}
    ];
    const collection = state.toolchain[state.toolTab] || [];
    const selectedId = state.selectedTool[state.toolTab] || collection[0]?.id;
    const selected = collection.find(x=>x.id===selectedId) || collection[0];
    return `<div class="manager-page page-enter">
      ${pageHeader('code','Toolchain & Extensions','Language servers, formatters, MCP servers, commands, skills, plugins, and agent tools live together, but each has controls designed for its actual configuration model.', `<button class="btn" data-action="toolchain-discover">${icon('search')} Discover project tools</button><button class="btn primary" data-action="add-tool-resource" data-kind="${state.toolTab}">${icon('plus')} Add ${escapeHtml(toolSingular(state.toolTab))}</button>`)}
      ${managerTabs(tabs,state.toolTab,'tool-tab')}
      <div class="manager-body"><div class="split-manager">
        <aside class="resource-roster"><div class="roster-head"><div class="roster-title">${escapeHtml(tabs.find(t=>t.id===state.toolTab)?.label || '')} (${collection.length})</div><button class="icon-btn" data-action="add-tool-resource" data-kind="${state.toolTab}">${icon('plus')}</button></div><div class="roster-search"><input placeholder="Filter ${escapeHtml(tabs.find(t=>t.id===state.toolTab)?.label.toLowerCase() || 'resources')}…" data-action="filter-roster" data-roster="toolchain"/></div><div class="roster-list" id="toolchain-roster">${collection.map(item=>toolRosterRow(item,selected?.id)).join('')}</div></aside>
        <section class="resource-detail">${selected ? renderToolDetail(selected,state.toolTab) : emptyManager('No resources configured','Add or discover a project resource to configure it.',`Add ${toolSingular(state.toolTab)}`,'add-tool-resource',{kind:state.toolTab})}</section>
      </div></div>
    </div>`;
  }

  function toolSingular(kind) {
    return ({lsps:'language server',formatters:'formatter',mcps:'MCP server',commands:'command',skills:'skill',plugins:'plugin',agentTools:'agent tool'})[kind] || 'resource';
  }

  function toolRosterRow(item,activeId) {
    const name=item.name || item.command;
    const meta = item.language || item.transport || item.category || item.source || item.owner || item.status;
    return `<button class="resource-row ${item.id===activeId?'active':''}" data-action="select-tool-resource" data-kind="${state.toolTab}" data-id="${item.id}" data-filter-text="${escAttr(`${name} ${meta} ${item.status}`.toLowerCase())}"><span class="resource-avatar">${icon(state.toolTab==='lsps'?'code':state.toolTab==='formatters'?'file':state.toolTab==='mcps'?'network':state.toolTab==='commands'?'terminal':state.toolTab==='skills'?'rocket':state.toolTab==='plugins'?'settings':'test')}</span><span class="resource-row-copy"><span class="resource-row-name">${escapeHtml(name)}</span><span class="resource-row-meta">${escapeHtml(String(meta || ''))}</span></span><span class="status-dot ${statusClass(item.status || (item.enabled?'ready':'disabled'))}"></span></button>`;
  }

  function renderToolDetail(item,kind) {
    const title = item.name || item.command;
    return `<div class="resource-head"><button class="icon-btn mobile-menu" style="display:${window.innerWidth<=720?'inline-grid':'none'}" data-action="toggle-resource-roster">${icon('menu')}</button><div class="resource-avatar">${icon(kind==='lsps'?'code':kind==='formatters'?'file':kind==='mcps'?'network':kind==='commands'?'terminal':kind==='skills'?'rocket':kind==='plugins'?'settings':'test')}</div><div class="resource-head-main"><div class="resource-name-line"><div class="resource-name">${escapeHtml(title)}</div>${renderStatus(item.status || (item.enabled?'ready':'disabled'),cap(item.status || (item.enabled?'enabled':'disabled')))}</div><div class="resource-sub">${escapeHtml(toolDetailSubtitle(item,kind))}</div></div><div class="resource-actions"><button class="btn" data-action="test-tool-resource" data-kind="${kind}" data-id="${item.id}">${icon('test')}<span class="btn-label">Test</span></button><button class="btn primary" data-action="edit-tool-resource" data-kind="${kind}" data-id="${item.id}">${icon('edit')}<span class="btn-label">Edit</span></button><button class="icon-btn" data-action="tool-resource-menu" data-kind="${kind}" data-id="${item.id}">${icon('more')}</button></div></div>
      ${managerTabs(toolDetailTabs(kind), state.toolDetailTab?.[kind] || 'overview','tool-detail-tab')}
      <div class="resource-content">${renderToolDetailTab(item,kind)}</div>`;
  }

  function toolDetailSubtitle(item,kind) {
    if(kind==='lsps') return `${item.language} · ${item.source} · ${item.scope}`;
    if(kind==='formatters') return `${item.languages.join(', ')} · ${item.source}`;
    if(kind==='mcps') return `${item.transport==='stdio'?'Local stdio process':'Remote Streamable HTTP'} · ${item.scope}`;
    if(kind==='commands') return `${item.category} · ${item.command}`;
    if(kind==='skills') return `${item.source} · ${item.scope}`;
    if(kind==='plugins') return `${item.version} · ${item.update}`;
    return `${item.owner} · Priority ${item.priority}`;
  }

  function toolDetailTabs(kind) {
    if(kind==='lsps') return [{id:'overview',label:'Overview'},{id:'launch',label:'Launch & Languages'},{id:'settings',label:'Initialization'},{id:'logs',label:'Status & Logs'}];
    if(kind==='formatters') return [{id:'overview',label:'Overview'},{id:'execution',label:'Execution'},{id:'behavior',label:'Save & Paste'},{id:'preview',label:'Preview & Test'}];
    if(kind==='mcps') return [{id:'overview',label:'Overview'},{id:'connection',label:'Connection'},{id:'tools',label:'Tools & Permissions'},{id:'logs',label:'Test & Logs'}];
    return [{id:'overview',label:'Overview'},{id:'settings',label:'Configuration'},{id:'diagnostics',label:'Diagnostics'}];
  }

  function renderToolDetailTab(item,kind) {
    const tab=state.toolDetailTab?.[kind] || 'overview';
    if(kind==='lsps') return renderLSPDetail(item,tab);
    if(kind==='formatters') return renderFormatterDetail(item,tab);
    if(kind==='mcps') return renderMCPDetail(item,tab);
    if(kind==='commands') return renderCommandDetail(item,tab);
    if(kind==='skills') return renderSkillDetail(item,tab);
    if(kind==='plugins') return renderPluginDetail(item,tab);
    return renderAgentToolDetail(item,tab);
  }

  function renderLSPDetail(item,tab) {
    if(tab==='launch') return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Language and launch mapping</div><div class="panel-subtitle">A language server is normally a local executable or workspace package launched as a process—not an unexplained URL.</div></div><button class="btn primary" data-action="edit-tool-resource" data-kind="lsps" data-id="${item.id}">${icon('edit')} Edit launch</button></div><div class="info-grid">${infoRow('Language',item.language)}${infoRow('Discovery source',item.source)}${infoRow('Command',item.command)}${infoRow('Arguments',item.args.join(' ')||'None')}${infoRow('Root markers',item.rootMarkers.join(', '))}${infoRow('Scope',item.scope)}</div></section><div class="alert-strip info">${icon('info')}<div>Add Language Server offers Auto-detect, Workspace package, Managed tool, System executable, or Custom command. TCP/remote transports are available only when a particular LSP integration explicitly supports them.</div></div>`;
    if(tab==='settings') return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Initialization options</div><div class="panel-subtitle">Structured workspace settings and server initialization data.</div></div><button class="btn" data-action="edit-lsp-initialization" data-id="${item.id}">${icon('edit')} Edit options</button></div><div class="prompt-box">{\n  "diagnostics": "workspace",\n  "completion": true,\n  "inlayHints": "project default",\n  "workspaceFolders": true\n}</div><div class="alert-strip info">${icon('info')}<div>Raw JSON is an expert editor with validation and a generated preview. Common options use structured controls first.</div></div></section>`;
    if(tab==='logs') return renderToolLogs(item,'Language server handshake, initialize response, diagnostics, and restart history.');
    return `<div class="card-grid three"><article class="stat-card"><div class="stat-label">Status</div><div class="stat-value" style="font-size:14px">${cap(item.status)}</div><div class="stat-note">Last test: ${escapeHtml(item.lastTest)}</div></article><article class="stat-card"><div class="stat-label">Language</div><div class="stat-value" style="font-size:13px">${escapeHtml(item.language)}</div><div class="stat-note">Mapped by language and root markers.</div></article><article class="stat-card"><div class="stat-label">Launch source</div><div class="stat-value" style="font-size:12px">${escapeHtml(item.source)}</div><div class="stat-note">Executable readiness is tested on the execution host.</div></article></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Effective launch</div><div class="panel-subtitle">Exactly what Puppet Master starts for this project.</div></div><button class="btn" data-action="edit-tool-resource" data-kind="lsps" data-id="${item.id}">${icon('edit')} Edit</button></div><div class="prompt-box">${escapeHtml(item.command)} ${escapeHtml(item.args.join(' '))}\nRoot markers: ${escapeHtml(item.rootMarkers.join(', '))}\nScope: ${escapeHtml(item.scope)}</div><div style="display:flex;gap:7px;margin-top:10px"><button class="btn primary" data-action="test-tool-resource" data-kind="lsps" data-id="${item.id}">${icon('test')} Test handshake</button><button class="btn" data-action="restart-tool-resource" data-kind="lsps" data-id="${item.id}">${icon('refresh')} Restart server</button></div></section>`;
  }

  function renderFormatterDetail(item,tab) {
    if(tab==='execution') return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Formatter execution</div><div class="panel-subtitle">Select a workspace package, managed tool, system executable, or custom command with validated placeholders.</div></div><button class="btn primary" data-action="edit-tool-resource" data-kind="formatters" data-id="${item.id}">${icon('edit')} Edit execution</button></div><div class="info-grid">${infoRow('Source',item.source)}${infoRow('Executable',item.executable)}${infoRow('Arguments',item.args.join(' ')||'None')}${infoRow('Configuration',item.config)}${infoRow('Ignore file',item.ignore)}${infoRow('Languages',item.languages.join(', '))}</div></section><div class="alert-strip info">${icon('info')}<div>Add Formatter can detect project packages and toolchains, install a managed tool after approval, select a system executable, or define a custom command. It never asks for an ambiguous “server” value.</div></div>`;
    if(tab==='behavior') return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Save and paste behavior</div><div class="panel-subtitle">Configure when this formatter runs and what happens when it fails.</div></div><button class="btn" data-action="edit-formatter-behavior" data-id="${item.id}">${icon('edit')} Edit behavior</button></div><div class="info-grid">${infoRow('Format on save',item.onSave?'On':'Off')}${infoRow('Format on paste',item.onPaste?'On':'Off')}${infoRow('Changed lines only',item.changedLines?'On':'Off')}${infoRow('Failure behavior','Keep edits and show actionable error')}</div></section>`;
    if(tab==='preview') return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Input preview</div><div class="panel-subtitle">A representative file is formatted without saving.</div></div></div><textarea class="form-textarea" id="formatter-preview-input">function example( value ){ return {value:value} }</textarea><div style="margin-top:9px"><button class="btn primary" data-action="preview-formatter" data-id="${item.id}">${icon('play')} Format preview</button></div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Output preview</div><div class="panel-subtitle">Diff, exit code, duration, and executable remain visible.</div></div></div><div class="prompt-box" id="formatter-preview-output">Run preview to validate ${escapeHtml(item.name)} without changing a file.</div></section></div>`;
    return `<div class="card-grid three"><article class="stat-card"><div class="stat-label">Status</div><div class="stat-value" style="font-size:14px">${cap(item.status)}</div><div class="stat-note">Executable and config validated.</div></article><article class="stat-card"><div class="stat-label">Languages</div><div class="stat-value">${item.languages.length}</div><div class="stat-note">${escapeHtml(item.languages.join(', '))}</div></article><article class="stat-card"><div class="stat-label">Format on save</div><div class="stat-value" style="font-size:14px">${item.onSave?'On':'Off'}</div><div class="stat-note">Failure preserves the original buffer.</div></article></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Effective command</div><div class="panel-subtitle">Executable, arguments, configuration, language mapping, and behavior are edited together.</div></div><button class="btn" data-action="edit-tool-resource" data-kind="formatters" data-id="${item.id}">${icon('edit')} Edit formatter</button></div><div class="prompt-box">${escapeHtml(item.executable)} ${escapeHtml(item.args.join(' '))}\nConfig: ${escapeHtml(item.config)}\nIgnore: ${escapeHtml(item.ignore)}</div><div style="display:flex;gap:7px;margin-top:10px"><button class="btn primary" data-action="test-tool-resource" data-kind="formatters" data-id="${item.id}">${icon('test')} Validate formatter</button><button class="btn" data-action="tool-detail-tab-jump" data-kind="formatters" data-tab="preview">Open preview</button></div></section>`;
  }

  function renderMCPDetail(item,tab) {
    const transportName=item.transport==='stdio'?'Local stdio process':'Remote Streamable HTTP endpoint';
    if(tab==='connection') return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">${escapeHtml(transportName)}</div><div class="panel-subtitle">Transport-specific fields replace the previous unclear “Server” setting.</div></div><button class="btn primary" data-action="edit-tool-resource" data-kind="mcps" data-id="${item.id}">${icon('edit')} Edit connection</button></div>${item.transport==='stdio'?`<div class="info-grid">${infoRow('Command',item.command)}${infoRow('Arguments',item.args.join(' ')||'None')}${infoRow('Environment',item.env.join(', ')||'None')}${infoRow('Working directory','Project root')}</div><div class="alert-strip info">${icon('terminal')}<div>Puppet Master launches a local child process and communicates over standard input/output. “Server” does not mean a web address here.</div></div>`:`<div class="info-grid">${infoRow('URL',item.url)}${infoRow('Headers',item.headers.join(', ')||'None')}${infoRow('Authentication','Credential-store reference')}${infoRow('Session behavior','Reconnect with bounded retry')}</div><div class="alert-strip info">${icon('network')}<div>Puppet Master connects to a remote Streamable HTTP endpoint. Headers and secrets are managed separately and redacted from logs.</div></div>`}</section>`;
    if(tab==='tools') return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Exposed tools & permissions</div><div class="panel-subtitle">Review discovered tools before agents can call them.</div></div><button class="btn" data-action="manage-mcp-tools" data-id="${item.id}">${icon('shield')} Manage permissions</button></div><div class="card-grid three"><article class="stat-card"><div class="stat-label">Tools discovered</div><div class="stat-value">${item.tools}</div><div class="stat-note">After last successful handshake.</div></article><article class="stat-card"><div class="stat-label">Permission policy</div><div class="stat-value" style="font-size:12px">${escapeHtml(item.permissions)}</div><div class="stat-note">Per-tool overrides available.</div></article><article class="stat-card"><div class="stat-label">Scope</div><div class="stat-value" style="font-size:14px">${escapeHtml(item.scope)}</div><div class="stat-note">Controls which projects can use it.</div></article></div><div class="alert-strip info">${icon('info')}<div>Tool descriptions, input schemas, risk level, owner, approval rule, and recent calls are inspectable in the permission manager.</div></div></section>`;
    if(tab==='logs') return renderToolLogs(item,'Transport startup, handshake, tool discovery, permission decisions, retries, and redacted errors.');
    return `<div class="card-grid three"><article class="stat-card"><div class="stat-label">Transport</div><div class="stat-value" style="font-size:13px">${item.transport==='stdio'?'stdio':'Streamable HTTP'}</div><div class="stat-note">${escapeHtml(transportName)}</div></article><article class="stat-card"><div class="stat-label">Tools</div><div class="stat-value">${item.tools}</div><div class="stat-note">Discovered and permission-filtered.</div></article><article class="stat-card"><div class="stat-label">Status</div><div class="stat-value" style="font-size:14px">${cap(item.status)}</div><div class="stat-note">Test connection for current detail.</div></article></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Connection summary</div><div class="panel-subtitle">Local process and remote HTTP setup are never conflated.</div></div><button class="btn" data-action="edit-tool-resource" data-kind="mcps" data-id="${item.id}">${icon('edit')} Edit MCP server</button></div><div class="prompt-box">Transport: ${escapeHtml(transportName)}\n${item.transport==='stdio'?`Command: ${escapeHtml(item.command)} ${escapeHtml(item.args.join(' '))}\nEnvironment: ${escapeHtml(item.env.join(', ')||'None')}`:`URL: ${escapeHtml(item.url)}\nHeaders: ${escapeHtml(item.headers.join(', ')||'None')}`}\nPermissions: ${escapeHtml(item.permissions)}</div><div style="display:flex;gap:7px;margin-top:10px"><button class="btn primary" data-action="test-tool-resource" data-kind="mcps" data-id="${item.id}">${icon('test')} Test connection</button><button class="btn" data-action="refresh-mcp-tools" data-id="${item.id}">${icon('refresh')} Refresh tools</button></div></section>`;
  }

  function renderToolLogs(item,copy) {
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Status & logs</div><div class="panel-subtitle">${escapeHtml(copy)}</div></div><button class="btn" data-action="export-tool-logs" data-id="${item.id}">${icon('download')} Export redacted logs</button></div><div class="prompt-box">[${nowLabel()}] Configuration loaded\n[${nowLabel()}] Process / connection available\n[${nowLabel()}] Capability handshake ${item.status==='ready'?'completed':'requires attention'}\n[${nowLabel()}] Secrets redacted from this view</div><div style="display:flex;gap:7px;margin-top:10px"><button class="btn primary" data-action="test-tool-resource" data-kind="${state.toolTab}" data-id="${item.id}">${icon('test')} Run test</button><button class="btn" data-action="clear-tool-logs" data-id="${item.id}">Clear view</button></div></section>`;
  }

  function renderCommandDetail(item,tab) {
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Command registration</div><div class="panel-subtitle">Searchable command catalog with shortcut capture and conflict detection.</div></div><button class="btn primary" data-action="edit-tool-resource" data-kind="commands" data-id="${item.id}">${icon('edit')} Edit command</button></div><div class="info-grid">${infoRow('Command',item.command)}${infoRow('Category',item.category)}${infoRow('Shortcut',item.shortcut||'None')}${infoRow('Enabled',item.enabled?'Yes':'No')}</div><div style="display:flex;gap:7px;margin-top:12px"><button class="btn" data-action="record-shortcut" data-id="${item.id}">${icon('key')} Record shortcut</button><button class="btn" data-action="run-command-demo" data-id="${item.id}">${icon('play')} Run demo</button><button class="btn" data-action="check-shortcut-conflicts" data-id="${item.id}">Check conflicts</button></div></section>`;
  }

  function renderSkillDetail(item,tab) {
    return `<div class="card-grid three"><article class="stat-card"><div class="stat-label">Status</div><div class="stat-value" style="font-size:14px">${cap(item.status)}</div><div class="stat-note">Scope: ${escapeHtml(item.scope)}</div></article><article class="stat-card"><div class="stat-label">Version</div><div class="stat-value" style="font-size:14px">${escapeHtml(item.version)}</div><div class="stat-note">Source: ${escapeHtml(item.source)}</div></article><article class="stat-card"><div class="stat-label">Requirements</div><div class="stat-value" style="font-size:11px">${escapeHtml(item.requirements)}</div><div class="stat-note">Validated before use.</div></article></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Skill management</div><div class="panel-subtitle">Install or import, enable, scope, inspect requirements, update, test, and remove.</div></div><button class="btn primary" data-action="edit-tool-resource" data-kind="skills" data-id="${item.id}">${icon('edit')} Configure skill</button></div><div style="display:flex;gap:7px;flex-wrap:wrap"><button class="btn" data-action="test-tool-resource" data-kind="skills" data-id="${item.id}">${icon('test')} Test requirements</button><button class="btn" data-action="update-skill" data-id="${item.id}">${icon('refresh')} Check update</button><button class="btn danger" data-action="remove-tool-resource" data-kind="skills" data-id="${item.id}">${icon('trash')} Remove</button></div></section>`;
  }

  function renderPluginDetail(item,tab) {
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Plugin management</div><div class="panel-subtitle">Permissions, connection state, compatibility, updates, diagnostics, and removal remain explicit.</div></div><button class="btn primary" data-action="edit-tool-resource" data-kind="plugins" data-id="${item.id}">${icon('edit')} Configure plugin</button></div><div class="info-grid">${infoRow('Status',cap(item.status))}${infoRow('Version',item.version)}${infoRow('Update',item.update)}${infoRow('Permissions',item.permissions.join(', '))}</div><div style="display:flex;gap:7px;margin-top:12px;flex-wrap:wrap"><button class="btn" data-action="test-tool-resource" data-kind="plugins" data-id="${item.id}">${icon('test')} Test plugin</button><button class="btn" data-action="manage-plugin-permissions" data-id="${item.id}">${icon('shield')} Permissions</button><button class="btn danger" data-action="remove-tool-resource" data-kind="plugins" data-id="${item.id}">${icon('trash')} Uninstall</button></div></section>`;
  }

  function renderAgentToolDetail(item,tab) {
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Agent tool projection</div><div class="panel-subtitle">This tool is owned by ${escapeHtml(item.owner)} and projected here for availability, priority, permission, and testing.</div></div><button class="btn primary" data-action="edit-tool-resource" data-kind="agentTools" data-id="${item.id}">${icon('edit')} Configure projection</button></div><div class="info-grid">${infoRow('Owner',item.owner)}${infoRow('Status',cap(item.status))}${infoRow('Permission',item.permission)}${infoRow('Priority',String(item.priority))}</div><div style="display:flex;gap:7px;margin-top:12px"><button class="btn" data-action="test-tool-resource" data-kind="agentTools" data-id="${item.id}">${icon('test')} Test tool</button><button class="btn" data-action="open-tool-owner" data-owner="${escAttr(item.owner)}">Open owner</button></div></section>`;
  }

  function renderTesting() {
    const tabs=[{id:'profiles',label:'Test Profiles'},{id:'triggers',label:'Triggers & Gates'},{id:'browser',label:'Browser & Visual'},{id:'native',label:'Native & Runtime'},{id:'debug',label:'Debug Profiles'},{id:'evidence',label:'Evidence & History'}];
    return `<div class="manager-page page-enter">${pageHeader('test','Testing & Debug','Configure what gets tested, when it runs, how browsers and native applications are inspected, which debugger launches, and what evidence is retained.',`<button class="btn" data-action="run-test-profile" data-profile="${state.selectedTestProfile}">${icon('play')} Run selected profile</button><button class="btn primary" data-action="add-test-profile">${icon('plus')} New test profile</button>`)}${managerTabs(tabs,state.testingTab,'testing-tab')}<div class="manager-body"><div class="manager-scroll">${renderTestingTab()}</div></div></div>`;
  }

  function renderTestingTab() {
    const tab=state.testingTab;
    if(tab==='triggers') return renderTestTriggers();
    if(tab==='browser') return renderBrowserTesting();
    if(tab==='native') return renderNativeTesting();
    if(tab==='debug') return renderDebugProfiles();
    if(tab==='evidence') return renderTestEvidence();
    const profile=state.testProfiles.find(p=>p.id===state.selectedTestProfile)||state.testProfiles[0];
    return `<div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Profiles (${state.testProfiles.length})</div><button class="icon-btn" data-action="add-test-profile">${icon('plus')}</button></div><div class="library-list-scroll">${state.testProfiles.map(p=>`<button class="library-item ${p.id===profile.id?'active':''}" data-action="select-test-profile" data-profile="${p.id}"><span class="resource-avatar">${icon('test')}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(p.name)} ${p.status==='default'?'<span class="badge purple">Default</span>':''}</span><span class="library-item-desc">${escapeHtml(p.description)}</span></span><span class="status-dot ready"></span></button>`).join('')}</div></section><section class="library-detail"><div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(profile.name)}</div><div class="panel-subtitle">${escapeHtml(profile.description)}</div></div><button class="btn primary" data-action="edit-test-profile" data-profile="${profile.id}">${icon('edit')} Edit profile</button></div><div class="info-grid">${infoRow('Trigger',profile.trigger)}${infoRow('Browser',profile.browser)}${infoRow('Native',profile.native)}${infoRow('Evidence',profile.evidence)}</div><div class="section-kicker" style="margin-top:18px">Ordered stages</div><div class="workflow-list" style="margin-top:8px">${profile.stages.map((stage,index)=>workflowStep(index+1,stage,index===0?'Runs first':'Runs after the previous stage','Ready','edit-test-stage',{profile:profile.id,index})).join('')}</div><div style="display:flex;gap:7px;margin-top:13px"><button class="btn primary" data-action="run-test-profile" data-profile="${profile.id}">${icon('play')} Run profile</button><button class="btn" data-action="preview-test-plan" data-profile="${profile.id}">${icon('eye')} Preview effective plan</button></div></section></div>`;
  }

  function renderTestTriggers() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Automatic triggers</div><div class="panel-subtitle">Select the minimum profile for each development moment.</div></div><button class="btn" data-action="edit-test-triggers">${icon('edit')} Edit triggers</button></div><table class="data-table"><thead><tr><th>Trigger</th><th>Profile</th><th>Blocking</th></tr></thead><tbody><tr><td>After meaningful edits</td><td>Fast feedback</td><td>No</td></tr><tr><td>Before Goal completion</td><td>Thorough verification</td><td>Yes</td></tr><tr><td>Before merge / delivery</td><td>Thorough verification</td><td>Yes</td></tr><tr><td>Release Goal</td><td>Release candidate</td><td>Yes</td></tr></tbody></table></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Failure and retry policy</div><div class="panel-subtitle">Flaky tests, automatic repair attempts, timeouts, and escalation.</div></div><button class="btn" data-action="edit-failure-policy">${icon('edit')} Edit policy</button></div><div class="info-grid">${infoRow('Retry failing test','Once after clean setup')}${infoRow('Flaky classification','3 inconsistent outcomes')}${infoRow('Automatic repair','Only safe, local changes')}${infoRow('Timeout escalation','Show process and captured output')}${infoRow('Blocked dependency install','Ask with exact package and source')}${infoRow('Completion gate','All required stages pass')}</div></section></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Verification gate simulator</div><div class="panel-subtitle">See which tests a hypothetical change would require before changing anything.</div></div><button class="btn primary" data-action="simulate-test-gate">${icon('test')} Simulate change</button></div></section>`;
  }

  function renderBrowserTesting() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Browser interaction testing</div><div class="panel-subtitle">Launch, viewport matrix, keyboard, menus, dialogs, hover, console, and network failures.</div></div><button class="btn" data-action="edit-browser-testing">${icon('edit')} Configure</button></div><div class="info-grid">${infoRow('Browser','Built-in Chromium')}${infoRow('Desktop viewport','1440 × 1000')}${infoRow('Narrow viewport','900 × 900')}${infoRow('Mobile viewport','390 × 844')}${infoRow('Console errors','Fail required checks')}${infoRow('Reduced motion','Run dedicated pass')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Visual & motion inspection</div><div class="panel-subtitle">Check appearance over time, not only the final screenshot.</div></div><button class="btn" data-action="edit-visual-testing">${icon('edit')} Configure</button></div><div class="info-grid">${infoRow('First-paint flash','Detect')}${infoRow('Blank frames','Detect')}${infoRow('Frozen transitions','Detect')}${infoRow('Frame stepping','On recorded flows')}${infoRow('Layout clipping','Desktop + narrow')}${infoRow('Hover state review','Required')}</div></section></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Browser workflow catalog</div><div class="panel-subtitle">Every workflow is openable and editable; no decorative numbered banners.</div></div><button class="btn primary" data-action="manage-browser-workflows">${icon('plus')} Manage workflows</button></div><div class="workflow-list">${workflowStep(1,'Settings navigation & scrollspy','All domains, workspaces, final short-page sections','Ready','open-browser-workflow',{id:'navigation'})}${workflowStep(2,'Complex manager controls','Add, edit, test, reorder, disable, remove, and diagnostics','Ready','open-browser-workflow',{id:'managers'})}${workflowStep(3,'Menus, dialogs, hover & motion','Open/close continuity, focus, no flashes','Ready','open-browser-workflow',{id:'motion'})}${workflowStep(4,'Responsive layouts','Desktop, compact, and mobile navigation','Ready','open-browser-workflow',{id:'responsive'})}</div></section>`;
  }

  function renderNativeTesting() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Native application checks</div><div class="panel-subtitle">Build, launch, window state, rendering backend, file integration, and shutdown.</div></div><button class="btn" data-action="edit-native-testing">${icon('edit')} Configure</button></div><div class="info-grid">${infoRow('Build target','Current platform')}${infoRow('Launch timeout','60 seconds')}${infoRow('Window appears','Required')}${infoRow('Renderer errors','Fail')}${infoRow('File round-trip','Temporary fixture')}${infoRow('Clean shutdown','Required')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Runtime and service tests</div><div class="panel-subtitle">Daemon, WebSocket, host connection, task cancellation, and recovery.</div></div><button class="btn" data-action="edit-runtime-testing">${icon('edit')} Configure</button></div><div class="info-grid">${infoRow('Daemon health','Required')}${infoRow('Reconnect test','Enabled')}${infoRow('Task cancellation','Graceful then bounded kill')}${infoRow('Pause/resume','Verify state receipt')}${infoRow('Secret redaction','Required')}${infoRow('Resource limits','Profile-specific')}</div></section></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Run native smoke</div><div class="panel-subtitle">The concept simulates a real task receipt and exposes each stage.</div></div><button class="btn primary" data-action="run-native-smoke">${icon('play')} Run smoke</button></div></section>`;
  }

  function renderDebugProfiles() {
    const selected=state.debugProfiles.find(p=>p.id===state.selectedDebugProfile)||state.debugProfiles[0];
    return `<div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Debug profiles (${state.debugProfiles.length})</div><button class="icon-btn" data-action="add-debug-profile">${icon('plus')}</button></div><div class="library-list-scroll">${state.debugProfiles.map(p=>`<button class="library-item ${p.id===selected.id?'active':''}" data-action="select-debug-profile" data-profile="${p.id}"><span class="resource-avatar">${icon('test')}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(p.name)}</span><span class="library-item-desc">${escapeHtml(p.adapter)} · ${escapeHtml(p.program)}</span></span><span class="status-dot ${statusClass(p.status)}"></span></button>`).join('')}</div></section><section class="library-detail"><div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(selected.name)}</div><div class="panel-subtitle">${escapeHtml(selected.adapter)}</div></div><button class="btn primary" data-action="edit-debug-profile" data-profile="${selected.id}">${icon('edit')} Edit profile</button></div><div class="info-grid">${infoRow('Program',selected.program)}${infoRow('Arguments',selected.args||'None')}${infoRow('Environment',selected.env)}${infoRow('Working directory',selected.cwd)}${infoRow('Status',cap(selected.status))}</div><div style="display:flex;gap:7px;margin-top:13px"><button class="btn primary" data-action="launch-debug-profile" data-profile="${selected.id}">${icon('play')} Start debugging</button><button class="btn" data-action="test-debug-profile" data-profile="${selected.id}">${icon('test')} Validate launch</button></div></section></div>`;
  }

  function renderTestEvidence() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Evidence capture</div><div class="panel-subtitle">Retain useful receipts without flooding the repository or exposing secrets.</div></div><button class="btn" data-action="edit-evidence-policy">${icon('edit')} Edit policy</button></div><div class="info-grid">${infoRow('Passing logs','Summary only')}${infoRow('Failure logs','Full redacted output')}${infoRow('Screenshots','On failure and visual checkpoints')}${infoRow('Video','Only when a workflow requires motion review')}${infoRow('Retention','90 days')}${infoRow('Secrets','Redact before persistence')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Recent runs</div><div class="panel-subtitle">Open the complete stage receipt or compare runs.</div></div><button class="btn" data-action="open-test-history">View all history</button></div><div class="workflow-list">${workflowStep(1,'Thorough verification','Passed · 18 stages · 4m 12s','Passed','open-test-run',{id:'run-1'})}${workflowStep(2,'Fast feedback','Passed · 3 stages · 22s','Passed','open-test-run',{id:'run-2'})}${workflowStep(3,'Browser interaction QA','Attention · one retry · 2m 41s','Attention','open-test-run',{id:'run-3'})}</div></section></div>`;
  }

  function renderMemory() {
    const tabs=[{id:'overview',label:'Overview'},{id:'memories',label:'Memory Library'},{id:'retrieval',label:'Retrieval & Conflicts'},{id:'retention',label:'Retention & Privacy'},{id:'coverage',label:'Sources & Coverage'}];
    return `<div class="manager-page page-enter">${pageHeader('memory','Context & Memory','Inspect what enters the current context, browse and manage durable memories, test retrieval, resolve conflicts, and control retention and privacy.',`<button class="btn" data-action="test-memory-retrieval">${icon('test')} Test retrieval</button><button class="btn primary" data-action="add-memory">${icon('plus')} Add memory</button>`)}${managerTabs(tabs,state.memoryTab,'memory-tab')}<div class="manager-body"><div class="manager-scroll">${renderMemoryTab()}</div></div></div>`;
  }

  function renderMemoryTab() {
    if(state.memoryTab==='memories') return renderMemoryLibrary();
    if(state.memoryTab==='retrieval') return renderMemoryRetrieval();
    if(state.memoryTab==='retention') return renderMemoryRetention();
    if(state.memoryTab==='coverage') return renderMemoryCoverage();
    return `<div class="card-grid four"><article class="stat-card"><div class="stat-label">Current context window</div><div class="stat-value">68%</div><div class="stat-note">118k of 174k tokens loaded.</div></article><article class="stat-card"><div class="stat-label">Durable memories</div><div class="stat-value">${state.memories.filter(m=>m.store!=='Thread').length}</div><div class="stat-note">Project and user stores.</div></article><article class="stat-card"><div class="stat-label">Thread memories</div><div class="stat-value">${state.memories.filter(m=>m.store==='Thread').length}</div><div class="stat-note">Expire with thread policy.</div></article><article class="stat-card"><div class="stat-label">Retrieval health</div><div class="stat-value" style="font-size:14px">Healthy</div><div class="stat-note">Last probe returned expected records.</div></article></div>
      <div class="card-grid two" style="margin-top:10px"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Current context composition</div><div class="panel-subtitle">Every source is inspectable and can be compacted or excluded where policy permits.</div></div><button class="btn" data-action="open-context-composition">${icon('eye')} Inspect context</button></div><div class="info-grid">${infoRow('System & project instructions','18%')}${infoRow('Conversation','29%')}${infoRow('Files & tool results','31%')}${infoRow('Retrieved memories','8%')}${infoRow('Cached reusable context','14%')}${infoRow('Cache hit','72%')}</div><div class="progress" style="margin-top:12px"><span style="width:68%"></span></div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Memory stores</div><div class="panel-subtitle">Stores differ by scope, owner, retention, and access.</div></div><button class="btn" data-action="manage-memory-stores">${icon('settings')} Manage stores</button></div><div class="workflow-list">${workflowStep(1,'Project memory','Shared rules, decisions, and durable project context','Ready','open-memory-store',{store:'Project'})}${workflowStep(2,'User memory','Long-lived preferences and cross-project defaults','Ready','open-memory-store',{store:'User'})}${workflowStep(3,'Thread memory','Current working state with shorter retention','Ready','open-memory-store',{store:'Thread'})}${workflowStep(4,'Goal receipt context','Verified phases, decisions, and artifacts','Ready','open-memory-store',{store:'Goal'})}</div></section></div>
      <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Management actions</div><div class="panel-subtitle">All previously decorative options now open complete controls.</div></div></div><div class="route-grid"><button class="route-card" data-action="open-memory-library"><div class="route-card-head"><span class="route-icon">${icon('database')}</span><span class="route-name">Browse and edit memories</span>${icon('chevron')}</div><div class="route-desc">Search, inspect sources, pin, correct, move stores, export, forget, or delete.</div></button><button class="route-card" data-action="test-memory-retrieval"><div class="route-card-head"><span class="route-icon">${icon('test')}</span><span class="route-name">Test retrieval</span>${icon('chevron')}</div><div class="route-desc">Enter a question and inspect ranking, store, confidence, source, and exclusions.</div></button><button class="route-card" data-action="open-memory-retention"><div class="route-card-head"><span class="route-icon">${icon('clock')}</span><span class="route-name">Retention and forgetting</span>${icon('chevron')}</div><div class="route-desc">Set decay, expiration, conflict policy, and protected memories.</div></button><button class="route-card" data-action="open-memory-coverage"><div class="route-card-head"><span class="route-icon">${icon('eye')}</span><span class="route-name">Shared inventory coverage</span>${icon('chevron')}</div><div class="route-desc">Review which sources and manager-owned records can contribute to context and memory.</div></button></div></section>`;
  }

  function renderMemoryLibrary() {
    const selected=state.memories.find(m=>m.id===state.selectedMemory)||state.memories[0];
    const filter=state.memoryFilter;
    const items=state.memories.filter(m=>filter==='All'||m.store===filter||m.type===filter);
    return `<div class="filter-row"><input class="search-field" placeholder="Search memories, sources, or text…" data-action="filter-memory-list"/>${['All','Project','User','Thread','Rule','Decision'].map(f=>`<button class="filter-chip ${filter===f?'active':''}" data-action="set-memory-filter" data-filter="${f}">${f}</button>`).join('')}<button class="btn primary" data-action="add-memory">${icon('plus')} Add memory</button></div><div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Memories (${items.length})</div></div><div class="library-list-scroll" id="memory-list">${items.map(m=>`<button class="library-item ${m.id===selected?.id?'active':''}" data-action="select-memory" data-memory="${m.id}" data-filter-text="${escAttr(`${m.title} ${m.store} ${m.type} ${m.source} ${m.text}`.toLowerCase())}"><span class="resource-avatar">${icon(m.pinned?'pin':'memory')}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(m.title)} ${m.pinned?'<span class="badge purple">Pinned</span>':''}</span><span class="library-item-desc">${escapeHtml(`${m.store} · ${m.type} · ${m.text}`)}</span></span></button>`).join('')}</div></section><section class="library-detail">${selected?renderMemoryDetail(selected):emptyManager('No memory selected','Choose a memory to inspect it.')}</section></div>`;
  }

  function renderMemoryDetail(memory) {
    return `<div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(memory.title)}</div><div class="panel-subtitle">${escapeHtml(memory.store)} · ${escapeHtml(memory.type)} · ${escapeHtml(memory.confidence)}</div></div><button class="btn primary" data-action="edit-memory" data-memory="${memory.id}">${icon('edit')} Edit</button><button class="icon-btn" data-action="memory-menu" data-memory="${memory.id}">${icon('more')}</button></div><div class="prompt-box">${escapeHtml(memory.text)}</div><div class="info-grid" style="margin-top:15px">${infoRow('Store',memory.store)}${infoRow('Type',memory.type)}${infoRow('Source',memory.source)}${infoRow('Updated',memory.updated)}${infoRow('Confidence',memory.confidence)}${infoRow('Pinned',memory.pinned?'Yes':'No')}</div><div style="display:flex;gap:7px;margin-top:15px;flex-wrap:wrap"><button class="btn" data-action="toggle-memory-pin" data-memory="${memory.id}">${icon('pin')} ${memory.pinned?'Unpin':'Pin'}</button><button class="btn" data-action="move-memory" data-memory="${memory.id}">${icon('route')} Move store</button><button class="btn" data-action="view-memory-source" data-memory="${memory.id}">${icon('external')} View source</button><button class="btn danger" data-action="forget-memory" data-memory="${memory.id}">${icon('trash')} Forget</button></div>`;
  }

  function renderMemoryRetrieval() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Retrieval test</div><div class="panel-subtitle">Enter a question and see exactly which records would be loaded and why.</div></div></div><label class="form-field"><span class="form-label">Question or context need</span><textarea class="form-textarea" id="memory-retrieval-query">What are the project’s rules for provider CLI installation and visual concept authority?</textarea></label><div style="display:flex;gap:7px;margin-top:10px"><button class="btn primary" data-action="run-memory-retrieval">${icon('test')} Run retrieval</button><button class="btn" data-action="edit-retrieval-policy">${icon('settings')} Retrieval policy</button></div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Expected inspection output</div><div class="panel-subtitle">Results include rank, store, source, confidence, match reason, token cost, and exclusions.</div></div></div><div class="workflow-list">${workflowStep(1,'Provider CLI installation rule','Project · explicit decision · high confidence','Expected','select-memory',{memory:'m2'})}${workflowStep(2,'Repository authority order','Project · user instruction · high confidence','Expected','select-memory',{memory:'m1'})}${workflowStep(3,'Preferred UI motion','User · explicit preference · medium relevance','Possible','select-memory',{memory:'m3'})}</div></section></div>
      <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Conflict handling</div><div class="panel-subtitle">New explicit instructions outrank inferred or stale records; conflicts remain visible until resolved.</div></div><button class="btn" data-action="manage-memory-conflicts">${icon('edit')} Review conflicts</button></div><div class="info-grid">${infoRow('Authority order','Explicit user → current project → confirmed decision → inferred preference')}${infoRow('Stale record behavior','Exclude and request review')}${infoRow('Conflicting explicit records','Show both and require resolution')}${infoRow('Working tool paths','Never promote automatically')}</div></section>`;
  }

  function renderMemoryRetention() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Retention by store</div><div class="panel-subtitle">Different memory scopes can expire, decay, or remain protected.</div></div><button class="btn primary" data-action="edit-memory-retention">${icon('edit')} Edit retention</button></div><table class="data-table"><thead><tr><th>Store</th><th>Default retention</th><th>Decay</th><th>Protected</th></tr></thead><tbody><tr><td>Project</td><td>Until project removal</td><td>Review stale observations</td><td>Pinned rules and decisions</td></tr><tr><td>User</td><td>Indefinite until forgotten</td><td>Preferences may be reconfirmed</td><td>Explicit saved memories</td></tr><tr><td>Thread</td><td>90 days after inactivity</td><td>Working paths expire quickly</td><td>None by default</td></tr><tr><td>Goal receipt</td><td>Project history policy</td><td>No semantic decay</td><td>Verified decisions</td></tr></tbody></table></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Privacy & access</div><div class="panel-subtitle">Control who can read, write, export, and delete each store.</div></div><button class="btn" data-action="edit-memory-privacy">${icon('shield')} Edit access</button></div><div class="info-grid">${infoRow('Secrets','Never stored as memory text')}${infoRow('Sensitive user data','Explicit save only')}${infoRow('Subagent access','Task-scoped projection')}${infoRow('Exports','Preview and redact')}${infoRow('Deletion','Receipt + optional backup')}${infoRow('Provider transfer','Only context sent for that task')}</div></section></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Forget and cleanup</div><div class="panel-subtitle">Review candidates before deleting; preserve explicit user memories unless selected.</div></div><button class="btn" data-action="review-memory-cleanup">${icon('trash')} Review 4 candidates</button></div></section>`;
  }

  function renderMemoryCoverage() {
    const groups=[
      ['Instructions & governance','System instructions, project instructions, selected policies','Read-only projection','Healthy'],
      ['Conversations & Goals','Current thread, selected prior threads, Goal receipts','Scope and retention controlled','Healthy'],
      ['Files & repository','Open files, search results, diffs, Plans, source control state','On-demand context','Healthy'],
      ['Tool results','Browser, terminal, tests, diagnostics, provider and source-control managers','Session-scoped unless promoted','Healthy'],
      ['Durable memories','Project and user memory stores','Explicitly managed','Healthy'],
      ['Settings inventory','Setting descriptions, effective values, owning managers','Shared canonical projection','Healthy']
    ];
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Shared inventory coverage</div><div class="panel-subtitle">This is a functioning source audit, not a non-clickable “additional options” banner.</div></div><button class="btn primary" data-action="run-memory-coverage-audit">${icon('test')} Run coverage audit</button></div><div class="workflow-list">${groups.map((g,i)=>workflowStep(i+1,g[0],`${g[1]} · ${g[2]}`,g[3],'open-coverage-source',{source:slug(g[0])})).join('')}</div></section><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Source inclusion policy</div><div class="panel-subtitle">Inspect defaults and open a structured editor.</div></div><button class="btn" data-action="edit-memory-sources">${icon('edit')} Edit source policy</button></div><div class="info-grid">${infoRow('Automatic inclusion','Current thread, explicit project instructions, active Goal')}${infoRow('On-demand retrieval','Prior threads, files, memories, manager state')}${infoRow('Always excluded','Credential values, raw secret files, unrelated personal data')}${infoRow('Large source handling','Summarize with source pointer and token budget')}</div></section>`;
  }

  function renderGoals() {
    const tabs=[{id:'templates',label:'Templates'},{id:'active',label:'Active Goals'},{id:'defaults',label:'Defaults & Routing'},{id:'phases',label:'Phases & Checkpoints'},{id:'recovery',label:'Pause, Resume & Recovery'},{id:'verification',label:'Verification & Evidence'}];
    return `<div class="manager-page page-enter">${pageHeader('rocket','Goals & Automation','Define reusable Goal templates, provider and persona defaults, phases, checkpoints, subagent behavior, pause/resume, recovery, verification, and evidence.',`<button class="btn" data-action="preview-goal-flow">${icon('eye')} Preview Goal flow</button><button class="btn primary" data-action="create-goal-template">${icon('plus')} New template</button>`)}${managerTabs(tabs,state.goalTab,'goal-tab')}<div class="manager-body"><div class="manager-scroll">${renderGoalTab()}</div></div></div>`;
  }

  function renderGoalTab() {
    if(state.goalTab==='active') return renderActiveGoals();
    if(state.goalTab==='defaults') return renderGoalDefaults();
    if(state.goalTab==='phases') return renderGoalPhases();
    if(state.goalTab==='recovery') return renderGoalRecovery();
    if(state.goalTab==='verification') return renderGoalVerification();
    const selected=state.goalTemplates.find(t=>t.id===state.selectedGoalTemplate)||state.goalTemplates[0];
    return `<div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Goal templates (${state.goalTemplates.length})</div><button class="icon-btn" data-action="create-goal-template">${icon('plus')}</button></div><div class="library-list-scroll">${state.goalTemplates.map(t=>`<button class="library-item ${t.id===selected.id?'active':''}" data-action="select-goal-template" data-template="${t.id}"><span class="resource-avatar">${icon('rocket')}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(t.name)}</span><span class="library-item-desc">${escapeHtml(t.description)}</span></span></button>`).join('')}</div></section><section class="library-detail"><div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(selected.name)}</div><div class="panel-subtitle">${escapeHtml(selected.description)}</div></div><button class="btn primary" data-action="edit-goal-template" data-template="${selected.id}">${icon('edit')} Edit template</button><button class="icon-btn" data-action="goal-template-menu" data-template="${selected.id}">${icon('more')}</button></div><div class="info-grid">${infoRow('Persona',selected.persona)}${infoRow('AI route',selected.route)}${infoRow('Subagents',selected.subagents)}${infoRow('Verification',selected.verification)}${infoRow('Checkpoints',selected.checkpoints.join(', '))}${infoRow('Evidence',selected.evidence)}</div><div class="section-kicker" style="margin-top:18px">Phases</div><div class="workflow-list" style="margin-top:8px">${selected.phases.map((phase,index)=>workflowStep(index+1,phase,index===0?'Goal begins here':'Receives a structured handoff from the previous phase','Ready','edit-goal-phase',{template:selected.id,index})).join('')}</div><div style="display:flex;gap:7px;margin-top:13px"><button class="btn primary" data-action="start-goal-from-template" data-template="${selected.id}">${icon('play')} Start Goal</button><button class="btn" data-action="preview-goal-template" data-template="${selected.id}">${icon('eye')} Preview effective Goal</button><button class="btn" data-action="duplicate-goal-template" data-template="${selected.id}">${icon('copy')} Duplicate</button></div></section></div>`;
  }

  function renderActiveGoals() {
    const selected=state.activeGoals.find(g=>g.id===state.selectedGoal)||state.activeGoals[0];
    return `<div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Active and resumable Goals</div><button class="icon-btn" data-action="start-new-goal">${icon('plus')}</button></div><div class="library-list-scroll">${state.activeGoals.map(g=>`<button class="library-item ${g.id===selected.id?'active':''}" data-action="select-active-goal" data-goal="${g.id}"><span class="resource-avatar">${g.progress}%</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(g.name)}</span><span class="library-item-desc">${escapeHtml(`${g.state} · ${g.phase} · ${g.route}`)}</span></span><span class="status-dot ${statusClass(g.state)}"></span></button>`).join('')}</div></section><section class="library-detail"><div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(selected.name)}</div><div class="panel-subtitle">${escapeHtml(selected.state)} · Phase ${escapeHtml(selected.phase)} · Updated ${escapeHtml(selected.updated)}</div></div>${renderStatus(selected.state,selected.state)}</div><div class="progress"><span style="width:${selected.progress}%"></span></div><div class="info-grid" style="margin-top:15px">${infoRow('Progress',`${selected.progress}%`)}${infoRow('Current phase',selected.phase)}${infoRow('AI route',selected.route)}${infoRow('Persona',selected.persona)}${infoRow('Checkpoint',selected.checkpoint)}${infoRow('Continuity','Can resume on another connected client')}</div><div style="display:flex;gap:7px;margin-top:15px;flex-wrap:wrap">${selected.state==='Paused'?`<button class="btn primary" data-action="resume-goal" data-goal="${selected.id}">${icon('play')} Resume</button>`:`<button class="btn" data-action="pause-goal" data-goal="${selected.id}">${icon('pause')} Pause</button>`}<button class="btn" data-action="open-goal-details" data-goal="${selected.id}">${icon('eye')} Goal details</button><button class="btn" data-action="edit-goal-route" data-goal="${selected.id}">${icon('route')} Change future route</button><button class="btn danger" data-action="stop-goal" data-goal="${selected.id}">${icon('close')} Stop</button></div></section></div>`;
  }

  function renderGoalDefaults() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Default intelligence</div><div class="panel-subtitle">New Goals inherit these values unless the template or user overrides them.</div></div><button class="btn primary" data-action="edit-goal-defaults">${icon('edit')} Edit defaults</button></div><div class="info-grid">${infoRow('Planning persona','Planning Compiler')}${infoRow('Implementation persona','Puppet Master')}${infoRow('Audit persona','Repository Auditor')}${infoRow('Primary route','Balanced coding route')}${infoRow('Hard frontend route','Visual coding route')}${infoRow('Research route','Research route')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Subagent policy</div><div class="panel-subtitle">Parallelize by workload and ownership without losing parent context.</div></div><button class="btn" data-action="edit-subagent-policy">${icon('edit')} Edit policy</button></div><div class="info-grid">${infoRow('Automatic threshold','Large or multi-owner work')}${infoRow('Maximum concurrent','4 by default')}${infoRow('Child Goal visibility','First-class in parent')}${infoRow('Handoff','Task receipt + bounded context')}${infoRow('Independent audit','Required for thorough profile')}${infoRow('Failure behavior','Retry, reroute, or surface blocker')}</div></section></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Effective route preview</div><div class="panel-subtitle">Choose a hypothetical Goal type and see all inherited values.</div></div><button class="btn primary" data-action="preview-goal-routing">${icon('eye')} Preview routing</button></div></section>`;
  }

  function renderGoalPhases() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Phase library</div><div class="panel-subtitle">Reusable phases with entry criteria, output contracts, and completion gates.</div></div><button class="btn primary" data-action="manage-goal-phases">${icon('edit')} Manage phases</button></div><div class="workflow-list">${workflowStep(1,'Understand','Freeze inputs, authority, constraints, and acceptance','Ready','open-goal-phase',{phase:'understand'})}${workflowStep(2,'Plan','Decompose work, owners, dependencies, risks, and verification','Ready','open-goal-phase',{phase:'plan'})}${workflowStep(3,'Build','Execute tasks with bounded subagent handoffs','Ready','open-goal-phase',{phase:'build'})}${workflowStep(4,'Verify','Run required tests and independent review','Ready','open-goal-phase',{phase:'verify'})}${workflowStep(5,'Deliver','Package clean artifacts and report honest status','Ready','open-goal-phase',{phase:'deliver'})}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Checkpoint rules</div><div class="panel-subtitle">Pause only for true boundaries, not routine reversible choices.</div></div><button class="btn" data-action="edit-goal-checkpoints">${icon('edit')} Edit checkpoints</button></div><div class="info-grid">${infoRow('Irreversible action','Always ask')}${infoRow('External side effect','Preview and ask')}${infoRow('Paid overage','Follow route boundary')}${infoRow('Authority conflict','Pause with evidence')}${infoRow('Routine implementation','Continue autonomously')}${infoRow('Verification failure','Repair within bounds, then surface')}</div></section></div>`;
  }

  function renderGoalRecovery() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Pause and resume</div><div class="panel-subtitle">Persist current phase, To-Dos, subagents, open diffs, context pointers, and next action.</div></div><button class="btn" data-action="edit-goal-continuity">${icon('edit')} Edit policy</button></div><div class="info-grid">${infoRow('Manual pause','Immediate safe checkpoint')}${infoRow('Provider interruption','Persist then reroute or wait')}${infoRow('Client handoff','Resume from connected machine')}${infoRow('Thread continuity','Preserve chat and Goal panel')}${infoRow('Open processes','Record; do not pretend they survive')}${infoRow('Secrets','Reference only, never serialize')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Failure recovery</div><div class="panel-subtitle">Bound retries and preserve evidence before changing approach.</div></div><button class="btn" data-action="edit-goal-recovery">${icon('edit')} Edit recovery</button></div><div class="info-grid">${infoRow('Transient provider failure','Retry then fallback route')}${infoRow('Tool failure','Diagnose, repair within permissions')}${infoRow('Test failure','Inspect evidence and attempt targeted repair')}${infoRow('Repeated loop','Doom-loop guard pauses')}${infoRow('Corrupt workspace','Preserve patch and create clean worktree')}${infoRow('Unrecoverable blocker','Report exact required decision')}</div></section></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Recovery simulator</div><div class="panel-subtitle">Open a scenario and inspect every persisted field and decision.</div></div><button class="btn primary" data-action="simulate-goal-recovery">${icon('test')} Simulate interruption</button></div></section>`;
  }

  function renderGoalVerification() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Completion gate</div><div class="panel-subtitle">A Goal is not complete until acceptance, verification, artifacts, and unresolved risks are reconciled.</div></div><button class="btn" data-action="edit-goal-verification">${icon('edit')} Edit gate</button></div><div class="workflow-list">${workflowStep(1,'Acceptance coverage','Every requirement maps to implementation or an honest blocker','Ready','open-goal-verification',{id:'acceptance'})}${workflowStep(2,'Automated testing','Selected Testing & Debug profile passes','Ready','open-goal-verification',{id:'tests'})}${workflowStep(3,'Visual inspection','Required for GUI-related work','Ready','open-goal-verification',{id:'visual'})}${workflowStep(4,'Independent audit','Auditor verifies claims and repairs omissions','Ready','open-goal-verification',{id:'audit'})}${workflowStep(5,'Clean delivery','Expected files exist; package excludes development debris','Ready','open-goal-verification',{id:'delivery'})}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Evidence receipt</div><div class="panel-subtitle">Retain enough to support completion without dumping every intermediate file.</div></div><button class="btn" data-action="edit-goal-evidence">${icon('edit')} Edit evidence</button></div><div class="info-grid">${infoRow('Plan and decisions','Compact structured receipt')}${infoRow('Tests','Summary + failing detail')}${infoRow('Visual QA','Required findings; media only when requested')}${infoRow('Artifacts','Hashes and expected paths')}${infoRow('Secrets','Redacted before persistence')}${infoRow('Retention','Project policy')}</div></section></div>`;
  }

  function renderPersonas() {
    const tabs=[{id:'personas',label:'Persona Library'},{id:'crews',label:'Crews'},{id:'defaults',label:'Assignment & Defaults'},{id:'testing',label:'Preview & Test'}];
    return `<div class="manager-page page-enter">${pageHeader('users','Personas & Crews','Browse one scalable library of Core, Bundled, and Custom personas; create and manage custom personas; assemble crews; assign exact model routes and tool permissions.',`<button class="btn" data-action="import-persona">${icon('upload')} Import</button><button class="btn primary" data-action="create-persona">${icon('plus')} Create persona</button>`)}${managerTabs(tabs,state.personaTab,'persona-tab')}<div class="manager-body"><div class="manager-scroll">${renderPersonaTab()}</div></div></div>`;
  }

  function renderPersonaTab() {
    if(state.personaTab==='crews') return renderCrews();
    if(state.personaTab==='defaults') return renderPersonaDefaults();
    if(state.personaTab==='testing') return renderPersonaTesting();
    const selected=state.personas.find(p=>p.id===state.selectedPersona)||state.personas[0];
    const q=state.personaQuery.toLowerCase();
    const items=state.personas.filter(p=>(state.personaFilter==='All'||p.group===state.personaFilter)&&(!q||`${p.name} ${p.description} ${p.tone} ${p.tools.join(' ')}`.toLowerCase().includes(q)));
    return `<div class="filter-row"><input class="search-field" placeholder="Search ${state.personas.length} personas by name, role, tool, or route…" value="${escAttr(state.personaQuery)}" data-action="persona-search"/>${['All','Core','Bundled','Custom'].map(f=>`<button class="filter-chip ${state.personaFilter===f?'active':''}" data-action="set-persona-filter" data-filter="${f}">${f}</button>`).join('')}<button class="btn primary" data-action="create-persona">${icon('plus')} Create</button></div><div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Unified library (${items.length})</div></div><div class="library-list-scroll">${items.map(p=>`<button class="library-item ${p.id===selected.id?'active':''}" data-action="select-persona" data-persona="${p.id}"><span class="resource-avatar">${p.name.split(/\s+/).map(w=>w[0]).join('').slice(0,2)}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(p.name)} ${p.locked?'<span class="badge">Core</span>':p.group==='Custom'?'<span class="badge purple">Custom</span>':''}</span><span class="library-item-desc">${escapeHtml(p.description)}</span></span></button>`).join('')}</div></section><section class="library-detail">${renderPersonaDetail(selected)}</section></div>`;
  }

  function renderPersonaDetail(persona) {
    return `<div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(persona.name)}</div><div class="panel-subtitle">${escapeHtml(persona.group)} · ${persona.locked?'Built-in definition; defaults can be overridden':'Editable persona'}</div></div>${persona.locked?'<span class="badge">Core</span>':`<button class="btn primary" data-action="edit-persona" data-persona="${persona.id}">${icon('edit')} Edit</button>`}<button class="icon-btn" data-action="persona-menu" data-persona="${persona.id}">${icon('more')}</button></div><p class="section-description" style="font-size:10px">${escapeHtml(persona.description)}</p><div class="info-grid" style="margin-top:15px">${infoRow('Tone',persona.tone)}${infoRow('Model route',persona.route)}${infoRow('Crews',persona.crews.join(', ')||'None')}${infoRow('Tool access',persona.tools.join(', '))}</div><div class="detail-block" style="margin-top:17px"><div class="detail-block-title">Persona instruction</div><div class="prompt-box">${escapeHtml(persona.prompt)}</div></div><div style="display:flex;gap:7px;flex-wrap:wrap"><button class="btn primary" data-action="preview-persona" data-persona="${persona.id}">${icon('play')} Preview response</button><button class="btn" data-action="duplicate-persona" data-persona="${persona.id}">${icon('copy')} Duplicate</button><button class="btn" data-action="assign-persona-crew" data-persona="${persona.id}">${icon('users')} Assign to crew</button>${!persona.locked?`<button class="btn danger" data-action="delete-persona" data-persona="${persona.id}">${icon('trash')} Delete</button>`:''}</div>`;
  }

  function renderCrews() {
    const selected=state.crews.find(c=>c.id===state.selectedCrew)||state.crews[0];
    return `<div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Crews (${state.crews.length})</div><button class="icon-btn" data-action="create-crew">${icon('plus')}</button></div><div class="library-list-scroll">${state.crews.map(c=>`<button class="library-item ${c.id===selected.id?'active':''}" data-action="select-crew" data-crew="${c.id}"><span class="resource-avatar">${icon('users')}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(c.name)}</span><span class="library-item-desc">${escapeHtml(`${c.members.length} members · Lead ${c.lead}`)}</span></span></button>`).join('')}</div></section><section class="library-detail"><div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(selected.name)}</div><div class="panel-subtitle">Lead: ${escapeHtml(selected.lead)} · Concurrency ${selected.concurrency}</div></div><button class="btn primary" data-action="edit-crew" data-crew="${selected.id}">${icon('edit')} Edit crew</button><button class="icon-btn" data-action="crew-menu" data-crew="${selected.id}">${icon('more')}</button></div><div class="info-grid">${infoRow('Members',selected.members.join(', '))}${infoRow('Lead',selected.lead)}${infoRow('Model routing',selected.route)}${infoRow('Handoff contract',selected.handoff)}${infoRow('Maximum concurrency',String(selected.concurrency))}</div><div class="section-kicker" style="margin-top:18px">Members</div><div class="workflow-list" style="margin-top:8px">${selected.members.map((name,index)=>workflowStep(index+1,name,index===0?'Crew lead':'Specialist member','Ready','open-crew-member',{crew:selected.id,name})).join('')}</div><div style="display:flex;gap:7px;margin-top:13px"><button class="btn primary" data-action="test-crew" data-crew="${selected.id}">${icon('test')} Test handoff</button><button class="btn" data-action="add-crew-member" data-crew="${selected.id}">${icon('plus')} Add member</button></div></section></div>`;
  }

  function renderPersonaDefaults() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Default assignments</div><div class="panel-subtitle">Choose which persona starts each work type; threads and Goals can override.</div></div><button class="btn primary" data-action="edit-persona-defaults">${icon('edit')} Edit assignments</button></div><div class="info-grid">${infoRow('Assistant Chat','Puppet Master')}${infoRow('Planning','Planning Compiler')}${infoRow('Implementation','Puppet Master')}${infoRow('GUI-related work','Frontend Craft')}${infoRow('Independent audit','Repository Auditor')}${infoRow('Research','Research Lead')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Route and tool inheritance</div><div class="panel-subtitle">Persona defaults remain projections of configured providers, routes, permissions, and tools.</div></div><button class="btn" data-action="edit-persona-inheritance">${icon('edit')} Edit inheritance</button></div><div class="info-grid">${infoRow('Model route','Persona → project → application')}${infoRow('Tool permissions','Persona cannot exceed active permission profile')}${infoRow('Provider failures','Follow named route fallback')}${infoRow('Crew overrides','Task receipt can choose specialist route')}</div></section></div>`;
  }

  function renderPersonaTesting() {
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Persona preview</div><div class="panel-subtitle">Compare tone, approach, route, and tool plan without starting a real task.</div></div></div><label class="form-field"><span class="form-label">Test prompt</span><textarea class="form-textarea" id="persona-test-prompt">Explain how you would audit the Settings managers for missing controls and motion defects.</textarea></label><div style="display:flex;gap:7px;margin-top:10px"><button class="btn primary" data-action="run-persona-test" data-persona="${state.selectedPersona}">${icon('play')} Preview selected persona</button><button class="btn" data-action="compare-personas">Compare personas</button></div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Validation checks</div><div class="panel-subtitle">Detect unusable routes, unavailable tools, invalid crew references, and conflicting instructions.</div></div><button class="btn" data-action="validate-personas">${icon('test')} Validate all</button></div><div class="workflow-list">${workflowStep(1,'Model routes','All persona routes resolve to configured exact endpoints','Passed','open-persona-validation',{id:'routes'})}${workflowStep(2,'Tool permissions','No persona exceeds Safety & Permissions','Passed','open-persona-validation',{id:'permissions'})}${workflowStep(3,'Crew membership','Every member exists in the unified library','Passed','open-persona-validation',{id:'crews'})}${workflowStep(4,'Custom prompt safety','No unresolved template variables or hidden secrets','Passed','open-persona-validation',{id:'prompts'})}</div></section></div>`;
  }

  function renderOwners() {
    const owners=[['AI provider accounts','Providers & Accounts','ai','providers'],['Web and media capability routes','AI & Providers route managers','ai','web'],['MCP server connections','Toolchain & Extensions','code','toolchain'],['Memories','Context & Memory','memory','context-memory'],['Personas and crews','Personas & Crews','memory','personas'],['Source-control accounts','Source Control','source','source-manager'],['Notification sounds','Notifications & Sounds','general','notifications'],['Backups','Data, Backup & Retention','system','backup']];
    return `<div class="manager-page page-enter">${pageHeader('route','Single Owners','Read-only architecture projection showing where shared resources are configured once and where other workspaces only reference them.')}<div class="manager-body"><div class="manager-scroll"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Canonical resource ownership</div><div class="panel-subtitle">Open the actual manager rather than editing a duplicate projection.</div></div><button class="btn" data-action="audit-single-owners">${icon('test')} Audit ownership</button></div><table class="data-table"><thead><tr><th>Shared resource</th><th>Canonical manager</th><th>Other surfaces</th><th></th></tr></thead><tbody>${owners.map(o=>`<tr><td><div class="table-primary">${escapeHtml(o[0])}</div></td><td>${escapeHtml(o[1])}</td><td>Referenced through shared inventory</td><td><button class="btn small" data-action="navigate" data-domain="${o[2]}" data-workspace="${o[3]}">Open owner</button></td></tr>`).join('')}</tbody></table></section><div class="alert-strip info">${icon('info')}<div>This page intentionally does not contain editable MCP, provider, sound, memory, or source-control settings. Those belong to their canonical managers.</div></div></div></div></div>`;
  }

  /* ----- completed managers and durable concept state ------------------- */
  function humanize(value=''){return String(value).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
  function ensureStateShape(){
    const defaults={
      webRouteTab:'route',mediaRouteTab:'route',toolDetailTab:{},settingsTransferTab:'copy',updatesTab:'overview',
      selectedSourceTool:'git',selectedForge:'github',selectedRepository:'Puppet-Master',selectedWorktree:'settings-concept',
      transferCategories:['AI providers & accounts','Model routing','Source control','Notifications & sounds','Permissions','Testing profiles'],
      projectSync:{serverHost:'Home TrueNAS',executionHost:'Windows WSL',location:'/mnt/Cursor/Puppet Master',fileAuthority:'Server host',syncMode:'Continuous metadata + on-demand artifacts',conflictPolicy:'Preserve both, pause affected work, and show a three-way comparison',clients:[{id:'mac',name:'MacBook Air',platform:'macOS',status:'online',role:'Client + execution host',lastSync:'Now'},{id:'windows',name:'Windows Workstation',platform:'Windows 11 + WSL2',status:'online',role:'Client + execution host',lastSync:'Now'},{id:'web',name:'Browser session',platform:'Web',status:'online',role:'Client',lastSync:'24s ago'}],remotes:[{id:'nas',name:'TrueNAS project files',type:'Mounted storage',address:'/mnt/Cursor/Puppet Master',status:'ready'},{id:'ssh',name:'Ubuntu VM',type:'SSH remote',address:'ubuntu@192.168.50.200',status:'ready'},{id:'github',name:'GitHub origin',type:'Hosted repository',address:'sittingmongoose/Puppet-Master',status:'ready'}],continuity:{goals:true,chats:true,terminals:false,unsavedEditors:true,activeDebug:false}},
      projectHistory:{sessions:[{id:'sess-1',title:'Settings manager rebuild',device:'Windows Workstation',updated:'Now',state:'Active',artifacts:14},{id:'sess-2',title:'Provider route audit',device:'MacBook Air',updated:'Yesterday',state:'Paused',artifacts:8},{id:'sess-3',title:'Governance review',device:'Browser session',updated:'3 days ago',state:'Complete',artifacts:21}],artifacts:[{id:'art-1',name:'Concept 12 Kimi drop-in',type:'Archive',owner:'Settings rebuild',size:'342 KB',retention:'Keep'},{id:'art-2',name:'Provider route receipt',type:'JSON receipt',owner:'Provider audit',size:'18 KB',retention:'1 year'},{id:'art-3',name:'Visual QA recording',type:'Video',owner:'Settings rebuild',size:'48 MB',retention:'90 days'}]},
      pendingApprovals:[{id:'ap-1',action:'Install official provider CLI',requester:'Provider setup',risk:'External install',status:'Waiting'},{id:'ap-2',action:'Send test notification to Discord',requester:'Notification agent',risk:'External message',status:'Waiting'}],
      settingsTransferHistory:[{time:'Today · 9:18 AM',action:'Copied from Settings Lab',categories:6,result:'Applied with preview'},{time:'Yesterday',action:'Exported project settings',categories:10,result:'Encrypted archive'}],
      doctorChecks:[{id:'providers',name:'Provider readiness',detail:'Install, authentication, entitlement, catalog, and invocation',status:'ready'},{id:'source',name:'Source control',detail:'Git, Jujutsu, GitHub, SSH, and LFS',status:'ready'},{id:'toolchain',name:'Toolchain & extensions',detail:'LSP, formatter, MCP, skills, plugins, and commands',status:'attention'},{id:'storage',name:'Storage & backup',detail:'Writable paths, retention, encryption, and latest verification',status:'ready'},{id:'sync',name:'Project continuity',detail:'Server, clients, execution host, and project sync',status:'ready'}],
      updates:{automatic:true,channel:'Stable',source:'GitHub Releases',checkInterval:'On open and hourly',currentVersion:'0.8.0-dev',availableVersion:'0.8.1',lastCheck:'7 minutes ago',history:[{version:'0.8.0-dev',installed:'Aug 23',result:'Current',notes:'Settings concept integration'},{version:'0.7.9',installed:'Aug 18',result:'Rolled forward',notes:'Provider detection improvements'},{version:'0.7.8',installed:'Aug 12',result:'Available for rollback',notes:'Project continuity baseline'}]}
    };
    for(const [k,v] of Object.entries(defaults))if(state[k]===undefined||state[k]===null)state[k]=clone(v);
    if(!state.settings||typeof state.settings!=='object'||Array.isArray(state.settings))state.settings={};
    if(!state.changed||typeof state.changed!=='object'||Array.isArray(state.changed))state.changed={};
    if(!state.activeSection||typeof state.activeSection!=='object'||Array.isArray(state.activeSection))state.activeSection={};
    for(const domain of D.domains)for(const workspace of domain.workspaces){
      if(workspace.type!=='settings'||!workspace.reference)continue;
      for(const section of workspace.sections||[])for(const s of section.settings||[]){
        if(state.settings[s.id]===undefined&&s.value!==undefined){
          state.settings[s.id]=typeof s.value==='object'&&s.value!==null?clone(s.value):s.value;
        }
      }
    }
    if(!Array.isArray(state.providers))state.providers=clone(D.providers);if(!Array.isArray(state.freeRoutes))state.freeRoutes=clone(D.freeRoutes);if(!Array.isArray(state.webRoutes))state.webRoutes=clone(D.webRoutes);if(!Array.isArray(state.mediaRoutes))state.mediaRoutes=clone(D.mediaRoutes);
    if(!state.notifications?.destinations)state.notifications=clone(D.notifications);if(!state.sourceControl?.tools)state.sourceControl=clone(D.sourceControl);if(!state.backup?.destinations)state.backup=clone(D.backupState);
  }

  function renderSourceControl(){const tabs=[['overview','Overview'],['tools','Git & Jujutsu'],['connections','Hosted Forges'],['repositories','Repositories'],['worktrees','Worktrees'],['policies','Policies & Recovery'],['actions','GitHub Actions'],['diagnostics','Diagnostics']].map(([id,label])=>({id,label}));return `<div class="manager-page page-enter">${pageHeader('branch','Source Control','Install and verify local source-control tools, connect GitHub and other supported forges, manage repositories and worktrees, configure safety policy, and inspect CI workflows.',`<button class="btn" data-action="test-source-control">${icon('test')} Test all</button><button class="btn primary" data-action="connect-forge">${icon('plus')} Connect forge</button>`)}${managerTabs(tabs,state.sourceTab,'source-tab')}<div class="manager-body"><div class="manager-scroll">${renderSourceControlTab()}</div></div></div>`;}
  function renderSourceControlTab(){if(state.sourceTab==='tools')return renderSourceTools();if(state.sourceTab==='connections')return renderSourceForges();if(state.sourceTab==='repositories')return renderRepositories();if(state.sourceTab==='worktrees')return renderWorktrees();if(state.sourceTab==='policies')return renderSourcePolicies();if(state.sourceTab==='actions')return renderSourceActions();if(state.sourceTab==='diagnostics')return renderSourceDiagnostics();const gh=state.sourceControl.forges.find(f=>f.id==='github');return `<div class="card-grid four"><article class="stat-card"><div class="stat-label">Default local tool</div><div class="stat-value" style="font-size:14px">${escapeHtml(state.sourceControl.tools.find(t=>t.default)?.name||'None')}</div><div class="stat-note">Managed per host and environment.</div></article><article class="stat-card"><div class="stat-label">GitHub</div><div class="stat-value" style="font-size:14px">${gh?.status==='active'?'Connected':'Needs setup'}</div><div class="stat-note">${escapeHtml(gh?.defaultAccount||'No account')}</div></article><article class="stat-card"><div class="stat-label">Repositories</div><div class="stat-value">${state.sourceControl.repositories.length}</div><div class="stat-note">${state.sourceControl.repositories.filter(r=>r.state!=='Clean').length} with changes</div></article><article class="stat-card"><div class="stat-label">Worktrees</div><div class="stat-value">${state.sourceControl.worktrees.length}</div><div class="stat-note">Ownership and leases tracked</div></article></div><div class="card-grid two" style="margin-top:10px"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Local source-control readiness</div><div class="panel-subtitle">Installation, version, host, update, and verification controls.</div></div><button class="btn" data-action="source-tab" data-tab="tools">Manage tools</button></div><div class="workflow-list">${state.sourceControl.tools.map((t,i)=>workflowStep(i+1,t.name,`${t.version} · ${t.host} · ${t.source}`,cap(t.status),'select-source-tool',{id:t.id})).join('')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Hosted connections</div><div class="panel-subtitle">Accounts and scopes—not fake local installation controls.</div></div><button class="btn" data-action="source-tab" data-tab="connections">Manage connections</button></div><div class="workflow-list">${state.sourceControl.forges.map((f,i)=>workflowStep(i+1,f.name,f.status==='active'?`${f.defaultAccount} · ${f.scopes.join(', ')}`:'Not connected',f.status==='active'?'Ready':'Setup','select-forge',{id:f.id})).join('')}</div></section></div>`;}
  function renderSourceTools(){const selected=state.sourceControl.tools.find(t=>t.id===state.selectedSourceTool)||state.sourceControl.tools[0];return `<div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Local tools (${state.sourceControl.tools.length})</div><button class="icon-btn" data-action="add-source-tool">${icon('plus')}</button></div><div class="library-list-scroll">${state.sourceControl.tools.map(t=>`<button class="library-item ${t.id===selected.id?'active':''}" data-action="select-source-tool" data-id="${t.id}"><span class="resource-avatar">${icon('branch')}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(t.name)} ${t.default?'<span class="badge purple">Default</span>':''}</span><span class="library-item-desc">${escapeHtml(`${t.version} · ${t.host} · ${t.source}`)}</span></span><span class="status-dot ${statusClass(t.status)}"></span></button>`).join('')}</div></section><section class="library-detail"><div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(selected.name)}</div><div class="panel-subtitle">${escapeHtml(selected.kind)} · ${escapeHtml(selected.host)}</div></div><button class="btn primary" data-action="edit-source-tool" data-id="${selected.id}">${icon('edit')} Configure</button><button class="icon-btn" data-action="source-tool-menu" data-id="${selected.id}">${icon('more')}</button></div><div class="info-grid">${infoRow('Version',selected.version)}${infoRow('Installation source',selected.source)}${infoRow('Host',selected.host)}${infoRow('Readiness',cap(selected.status))}${infoRow('Default tool',selected.default?'Yes':'No')}${infoRow('Update policy','Follow installation method')}</div><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:14px"><button class="btn primary" data-action="test-source-tool" data-id="${selected.id}">${icon('test')} Verify executable</button><button class="btn" data-action="update-source-tool" data-id="${selected.id}">${icon('refresh')} Check update</button><button class="btn" data-action="set-default-source-tool" data-id="${selected.id}">${icon('check')} Make default</button></div></section></div>`;}
  function renderSourceForges(){const selected=state.sourceControl.forges.find(f=>f.id===state.selectedForge)||state.sourceControl.forges[0];return `<div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Hosted forges (${state.sourceControl.forges.length})</div><button class="icon-btn" data-action="connect-forge">${icon('plus')}</button></div><div class="library-list-scroll">${state.sourceControl.forges.map(f=>`<button class="library-item ${f.id===selected.id?'active':''}" data-action="select-forge" data-id="${f.id}"><span class="resource-avatar">${f.name.slice(0,2).toUpperCase()}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(f.name)}</span><span class="library-item-desc">${f.status==='active'?escapeHtml(`${f.accounts} account · ${f.scopes.join(', ')}`):'Not connected'}</span></span><span class="status-dot ${f.status==='active'?'active':'disabled'}"></span></button>`).join('')}</div></section><section class="library-detail"><div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(selected.name)}</div><div class="panel-subtitle">${selected.status==='active'?`${selected.accounts} connected account(s)`:'No account connected'}</div></div><button class="btn primary" data-action="${selected.status==='active'?'edit-forge':'connect-forge'}" data-id="${selected.id}">${icon(selected.status==='active'?'edit':'plus')} ${selected.status==='active'?'Manage':'Connect'}</button><button class="icon-btn" data-action="forge-menu" data-id="${selected.id}">${icon('more')}</button></div><div class="info-grid">${infoRow('Status',selected.status==='active'?'Connected':'Not connected')}${infoRow('Default account',selected.defaultAccount)}${infoRow('Scopes',selected.scopes.join(', ')||'None')}${infoRow('SSH',selected.ssh)}${infoRow('Last test',selected.lastTest)}${infoRow('Repository discovery',selected.status==='active'?'Available':'Connect first')}</div><div style="display:flex;gap:7px;margin-top:14px;flex-wrap:wrap"><button class="btn primary" data-action="test-forge" data-id="${selected.id}">${icon('test')} Test connection</button><button class="btn" data-action="discover-repositories" data-id="${selected.id}">${icon('search')} Discover repositories</button></div></section></div>`;}
  function renderRepositories(){return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Repositories</div><div class="panel-subtitle">Import, initialize, inspect remotes, set defaults, and create worktrees.</div></div><button class="btn" data-action="edit-repository-defaults">${icon('settings')} Defaults</button><button class="btn primary" data-action="import-repository">${icon('plus')} Import</button></div><table class="data-table"><thead><tr><th>Repository</th><th>Forge</th><th>Branch</th><th>State</th><th>Protection</th><th></th></tr></thead><tbody>${state.sourceControl.repositories.map(r=>`<tr><td><div class="table-primary">${escapeHtml(r.name)}</div><div class="table-secondary">${escapeHtml(r.remote)}</div></td><td>${escapeHtml(r.forge)}</td><td>${escapeHtml(r.branch)}</td><td>${renderStatus(r.state==='Clean'?'ready':'attention',r.state)}</td><td>${escapeHtml(r.protection)}</td><td><button class="btn small" data-action="open-repository" data-name="${escAttr(r.name)}">Open</button><button class="icon-btn" data-action="repository-menu" data-name="${escAttr(r.name)}">${icon('more')}</button></td></tr>`).join('')}</tbody></table><button class="btn" style="margin-top:12px" data-action="initialize-repository">${icon('branch')} Initialize current folder</button><button class="btn" style="margin-top:12px" data-action="test-repository-remotes">${icon('test')} Test remotes</button></section>`;}
  function renderWorktrees(){return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Managed worktrees</div><div class="panel-subtitle">Branches/revisions, owners, leases, dirty state, recovery, and cleanup.</div></div><button class="btn primary" data-action="create-worktree">${icon('plus')} Create worktree</button></div><table class="data-table"><thead><tr><th>Name</th><th>Branch</th><th>Owner</th><th>State</th><th>Lease</th><th></th></tr></thead><tbody>${state.sourceControl.worktrees.map(w=>`<tr><td><div class="table-primary">${escapeHtml(w.name)}</div><div class="table-secondary">${escapeHtml(w.path)}</div></td><td>${escapeHtml(w.branch)}</td><td>${escapeHtml(w.owner)}</td><td>${renderStatus(w.state==='Clean'?'ready':'attention',w.state)}</td><td>${escapeHtml(w.lease)}</td><td><button class="btn small" data-action="open-worktree" data-name="${escAttr(w.name)}">Open</button><button class="icon-btn" data-action="worktree-menu" data-name="${escAttr(w.name)}">${icon('more')}</button></td></tr>`).join('')}</tbody></table></section>`;}
  function renderSourcePolicies(){return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Branch and push safety</div><div class="panel-subtitle">Protected branches, test-before-merge, force-push, and remote policy.</div></div><button class="btn primary" data-action="edit-source-policies">${icon('edit')} Edit policy</button></div><div class="info-grid">${infoRow('Protected branches','main, release/*')}${infoRow('Tests before merge','Required')}${infoRow('Force push','Denied on protected branches')}${infoRow('Push credentials','Owning forge account')}${infoRow('Uncommitted changes','Preserve before destructive operations')}${infoRow('Jujutsu interop','Colocated repository supported')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Recovery</div><div class="panel-subtitle">Reflog/revisions, patch preservation, stale worktrees, and rollback receipts.</div></div><button class="btn" data-action="test-source-recovery">${icon('test')} Test recovery</button></div><div class="workflow-list">${workflowStep(1,'Preserve uncommitted patch','Before cleanup or destructive transition','Ready','open-source-policy',{id:'patch'})}${workflowStep(2,'Reflog / revision recovery','Verify recoverable history','Ready','open-source-policy',{id:'reflog'})}${workflowStep(3,'Worktree ownership','Never clean active agent work','Ready','open-source-policy',{id:'ownership'})}${workflowStep(4,'Operation simulator','Preview effective policy first','Ready','simulate-source-operation',{id:'simulator'})}</div></section></div>`;}
  function renderSourceActions(){return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">GitHub Actions</div><div class="panel-subtitle">Pinned workflows, readiness, inputs, recent runs, logs, and guarded dispatch.</div></div><button class="btn" data-action="refresh-workflows">${icon('refresh')} Refresh</button></div><table class="data-table"><thead><tr><th>Workflow</th><th>File</th><th>Trigger</th><th>Status</th><th>Last run</th><th></th></tr></thead><tbody>${state.sourceControl.actions.map(a=>`<tr><td><div class="table-primary">${escapeHtml(a.name)} ${a.pinned?'<span class="badge purple">Pinned</span>':''}</div></td><td>${escapeHtml(a.workflow)}</td><td>${escapeHtml(a.trigger)}</td><td>${renderStatus(a.status==='passing'?'ready':a.status==='not-run'?'attention':a.status,a.status)}</td><td>${escapeHtml(a.lastRun)}</td><td><button class="btn small" data-action="run-workflow" data-name="${escAttr(a.name)}">Run</button><button class="icon-btn" data-action="workflow-menu" data-name="${escAttr(a.name)}">${icon('more')}</button></td></tr>`).join('')}</tbody></table></section>`;}
  function renderSourceDiagnostics(){return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Source-control diagnostics</div><div class="panel-subtitle">Local tools, forge auth/scopes, SSH, remotes, worktrees, policies, and workflows.</div></div><button class="btn primary" data-action="run-source-diagnostics">${icon('test')} Run diagnostics</button></div><div class="workflow-list">${['Local executables per host','Forge accounts and scopes','SSH and remote transport','Repository state','Worktree ownership and leases','CI workflow readiness'].map((x,i)=>workflowStep(i+1,x,'Current fixture status','Ready','open-source-diagnostic',{id:slug(x)})).join('')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Redacted report</div><div class="panel-subtitle">Export evidence without tokens, private keys, or unredacted remote credentials.</div></div><button class="btn" data-action="export-source-diagnostics">${icon('download')} Export</button></div><div class="info-grid">${infoRow('Git','Ready')}${infoRow('Jujutsu','Ready')}${infoRow('GitHub','Connected')}${infoRow('SSH','Healthy')}${infoRow('Git LFS','Ready')}${infoRow('Open blockers','0')}</div></section></div>`;}

  function renderNotifications(){const tabs=[['overview','Overview'],['destinations','Destinations'],['agents','Notification Agents'],['events','Events & Routing'],['sounds','Sounds & PeonPing'],['quiet','Quiet Hours'],['testing','Testing & History']].map(([id,label])=>({id,label}));return `<div class="manager-page page-enter">${pageHeader('bell','Notifications & Sounds','Configure events, destinations, notification agents, escalation, quiet hours, uploaded sounds, PeonPing packs, assignments, testing, and delivery history.',`<button class="btn" data-action="send-test-notification">${icon('test')} Test exact route</button><button class="btn primary" data-action="add-notification-destination">${icon('plus')} Add destination</button>`)}${managerTabs(tabs,state.notificationTab,'notification-tab')}<div class="manager-body"><div class="manager-scroll">${renderNotificationTab()}</div></div></div>`;}
  function renderNotificationTab(){if(state.notificationTab==='destinations')return renderNotificationDestinations();if(state.notificationTab==='agents')return renderNotificationAgents();if(state.notificationTab==='events')return renderNotificationEvents();if(state.notificationTab==='sounds')return renderNotificationSounds();if(state.notificationTab==='quiet')return renderNotificationQuiet();if(state.notificationTab==='testing')return renderNotificationTesting();return `<div class="card-grid four"><article class="stat-card"><div class="stat-label">Destinations</div><div class="stat-value">${state.notifications.destinations.length}</div><div class="stat-note">${state.notifications.destinations.filter(d=>d.status==='active').length} active</div></article><article class="stat-card"><div class="stat-label">Notification agents</div><div class="stat-value">${state.notifications.agents.length}</div><div class="stat-note">Event groups and escalation</div></article><article class="stat-card"><div class="stat-label">Sounds</div><div class="stat-value">${state.notifications.sounds.length}</div><div class="stat-note">Built-in, uploaded, and packs</div></article><article class="stat-card"><div class="stat-label">Quiet hours</div><div class="stat-value" style="font-size:13px">${state.notifications.quiet.enabled?'On':'Off'}</div><div class="stat-note">${escapeHtml(`${state.notifications.quiet.start}–${state.notifications.quiet.end}`)}</div></article></div><div class="card-grid two" style="margin-top:10px"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Active notification routes</div><div class="panel-subtitle">Events resolve through agents to destinations and optional sounds.</div></div><button class="btn" data-action="notification-tab" data-tab="events">Manage routing</button></div><div class="workflow-list">${state.notifications.events.slice(0,5).map((e,i)=>workflowStep(i+1,e.name,`${e.destinations.join(', ')} · ${e.sound}`,e.enabled?'Ready':'Off','edit-notification-event',{index:i})).join('')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Sound and destination readiness</div><div class="panel-subtitle">Play, upload, assign, test, and inspect delivery evidence.</div></div><button class="btn" data-action="notification-tab" data-tab="sounds">Open library</button></div><div class="info-grid">${infoRow('PeonPing pack',state.notifications.packs[0]?.status||'Not imported')}${infoRow('Custom uploads',String(state.notifications.sounds.filter(s=>s.source==='Custom upload').length))}${infoRow('Phone alerts',state.notifications.destinations.find(d=>d.id==='ntfy')?.status||'Not configured')}${infoRow('Last delivery',state.notifications.history[0]?.result||'None')}${infoRow('Urgent override',state.notifications.quiet.urgentOverride?'On':'Off')}${infoRow('Unassigned events',String(state.notifications.events.filter(e=>e.sound==='None').length))}</div></section></div>`;}
  function renderNotificationDestinations() {
    const destinations = state.notifications.destinations;
    const history = state.notifications.history || [];
    const iconFor = (d) => d.id === 'system' ? 'system' : d.id === 'discord' ? 'network' : d.id === 'ntfy' ? 'bell' : d.id === 'in-app' ? 'bell' : 'route';
    return `<div class="panel-title-row" style="margin-bottom:8px"><div><div class="panel-title">Destinations</div><div class="panel-subtitle">Connect, test, disable, repair, and remove each destination from one roster.</div></div><button class="btn primary" data-action="add-notification-destination">${icon('plus')} Add destination</button></div>
      <div class="route-card-grid">${destinations.map(d => {
        const active = d.status === 'active';
        return `<div class="route-card">
          <div class="route-card-head"><span class="route-card-icon">${icon(iconFor(d))}</span><div class="route-card-copy"><strong>${escapeHtml(d.name)}</strong><span>${escapeHtml(d.address || d.type)}</span></div>${renderStatus(d.status, cap(d.status))}</div>
          <div class="route-card-actions">${active
            ? `<button class="btn small" data-action="test-notification-destination" data-id="${d.id}">${icon('test')} Send test</button><button class="btn small" data-action="edit-notification-destination" data-id="${d.id}">${icon('sliders')} Configure</button><button class="btn small" data-action="view-notification-destination-history" data-id="${d.id}">${icon('history')} History</button>`
            : `<button class="btn small primary" data-action="edit-notification-destination" data-id="${d.id}">${icon('plus')} Set up</button>`}</div>
        </div>`;
      }).join('')}</div>
      <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Delivery history</div><div class="panel-subtitle">Recent deliveries across all destinations. Open receipts or filter by destination from each card.</div></div><button class="btn" data-action="export-notification-history">${icon('download')} Export</button></div>
      <table class="data-table"><thead><tr><th>Time</th><th>Event</th><th>Destination</th><th>Result</th><th>Latency</th><th></th></tr></thead><tbody>${history.length ? history.map((h, i) => `<tr><td>${escapeHtml(h.time)}</td><td>${escapeHtml(h.event)}</td><td>${escapeHtml(h.destination)}</td><td>${renderStatus(h.result === 'Delivered' ? 'ready' : 'attention', h.result)}</td><td>${escapeHtml(h.latency || '—')}</td><td><button class="btn small" data-action="open-notification-receipt" data-index="${i}">Open</button><button class="btn small" data-action="view-notification-destination-history" data-id="${escAttr(destinations.find(d => d.name === h.destination)?.id || '')}">Filter</button></td></tr>`).join('') : `<tr><td colspan="6"><span class="section-description">No delivery yet. Run a test to create a receipt.</span></td></tr>`}</tbody></table></section>`;
  }
    function renderNotificationAgents(){const selected=state.notifications.agents.find(a=>a.id===state.selectedNotificationAgent)||state.notifications.agents[0];return `<div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Notification agents (${state.notifications.agents.length})</div><button class="icon-btn" data-action="add-notification-agent">${icon('plus')}</button></div><div class="library-list-scroll">${state.notifications.agents.map(a=>`<button class="library-item ${a.id===selected.id?'active':''}" data-action="select-notification-agent" data-id="${a.id}"><span class="resource-avatar">${icon('users')}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(a.name)}</span><span class="library-item-desc">${escapeHtml(`${a.events.length} events · ${a.destinations.join(', ')}`)}</span></span><span class="status-dot ${statusClass(a.status)}"></span></button>`).join('')}</div></section><section class="library-detail"><div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(selected.name)}</div><div class="panel-subtitle">${escapeHtml(selected.status)} · ${selected.events.length} events</div></div><button class="btn primary" data-action="edit-notification-agent" data-id="${selected.id}">${icon('edit')} Configure</button><button class="icon-btn" data-action="notification-agent-menu" data-id="${selected.id}">${icon('more')}</button></div><div class="info-grid">${infoRow('Events',selected.events.join(', '))}${infoRow('Destinations',selected.destinations.join(', '))}${infoRow('Escalation',selected.escalation)}${infoRow('Status',cap(selected.status))}${infoRow('Quiet hours','Inherited with urgent override')}${infoRow('Delivery receipts','Retained')}</div><div style="display:flex;gap:7px;margin-top:14px"><button class="btn primary" data-action="test-notification-agent" data-id="${selected.id}">${icon('test')} Test agent</button><button class="btn" data-action="duplicate-notification-agent" data-id="${selected.id}">${icon('copy')} Duplicate</button></div></section></div>`;}
  function renderNotificationEvents() {
    if (!state.eventChecks) state.eventChecks = {};
    const matrixCols = ['In app', 'System', 'Discord', 'Urgent'];
    const seedFor = (event, col) => {
      if (col === 'Urgent') return /urgent/i.test(event.priority || '');
      if (col === 'In app') return event.destinations.some(d => /in-app|in app/i.test(d));
      if (col === 'System') return event.destinations.some(d => /system/i.test(d));
      if (col === 'Discord') return event.destinations.some(d => /discord/i.test(d));
      return false;
    };
    const header = ['Event', ...matrixCols].map(label => `<div class="event-cell">${escapeHtml(label)}</div>`).join('');
    const rows = state.notifications.events.map((e, ri) => {
      const nameCell = `<div class="event-cell"><strong>${escapeHtml(e.name)}</strong></div>`;
      const checks = matrixCols.map((col, ci) => {
        const key = `event-${ri}-${ci}`;
        if (state.eventChecks[key] === undefined) state.eventChecks[key] = seedFor(e, col);
        const on = !!state.eventChecks[key];
        return `<div class="event-cell"><button type="button" class="matrix-check" aria-pressed="${on}" data-action="toggle-event-matrix" data-key="${escAttr(key)}">${icon('check')}</button></div>`;
      }).join('');
      return nameCell + checks;
    }).join('');
    return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Events and routing</div><div class="panel-subtitle">Enable, prioritize, route, assign sound, and test every event.</div></div><button class="btn primary" data-action="add-notification-event">${icon('plus')} Add event</button></div>
      <table class="data-table"><thead><tr><th>Event</th><th>Priority</th><th>Destinations</th><th>Sound</th><th>Enabled</th><th></th></tr></thead><tbody>${state.notifications.events.map((e,i)=>`<tr><td><div class="table-primary">${escapeHtml(e.name)}</div></td><td>${escapeHtml(e.priority)}</td><td>${escapeHtml(e.destinations.join(', '))}</td><td>${escapeHtml(e.sound)}</td><td><button class="toggle ${e.enabled?'on':''}" data-action="toggle-notification-event" data-index="${i}"></button></td><td><button class="btn small" data-action="test-notification-event" data-index="${i}">Test</button><button class="btn small" data-action="edit-notification-event" data-index="${i}">Edit</button></td></tr>`).join('')}</tbody></table></section>
      <section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Event-to-destination map</div><div class="panel-subtitle">Toggle where each event may deliver and whether it is treated as urgent.</div></div><button class="btn primary" data-action="add-notification-event">${icon('plus')} Add event rule</button></div>
      <div class="event-matrix">${header}${rows}</div></section>`;
  }
    function renderNotificationSounds() {
    const sounds = state.notifications.sounds;
    const packs = state.notifications.packs || [];
    const waveform = () => {
      const hs = [7,13,19,10,22,16,8,18,24,12,20,9,15,23,11,17,8,14];
      return `<span class="sound-waveform">${hs.map((h,i)=>`<i style="--h:${h}px;--n:${i}"></i>`).join('')}</span>`;
    };
    const assignedFor = (s) => state.notifications.events.filter(e => e.sound === s.name).map(e => e.name);
    const libraryRows = sounds.map(s => {
      const assigned = assignedFor(s);
      const meta = `${s.source} · ${s.duration}${assigned.length ? ' · ' + assigned.join(', ') : ' · Unassigned'}`;
      const playing = state.soundPlaying === s.id;
      return `<div class="sound-row ${playing ? 'is-playing' : ''}" data-sound-row="${escAttr(s.id)}">
        <button type="button" class="sound-play ${playing ? 'is-playing' : ''}" data-action="play-sound" data-id="${escAttr(s.id)}" title="Play ${escAttr(s.name)}">${icon(playing ? 'volume' : 'play')}</button>
        <span class="sound-copy"><strong>${escapeHtml(s.name)}</strong><span>${escapeHtml(meta)}</span></span>
        ${waveform()}
        <button class="btn small" data-action="sound-menu" data-id="${escAttr(s.id)}">${icon('sliders')} Manage</button>
      </div>`;
    }).join('');
    const pack = packs[0];
    const assignmentRows = state.notifications.events.slice(0, 5).map((e, i) => {
      const options = ['None', ...sounds.map(s => s.name)].map(name => `<option ${name === e.sound ? 'selected' : ''}>${escapeHtml(name)}</option>`).join('');
      return `<div class="kv-row"><span>${escapeHtml(e.name)}</span><span><select class="select-control" data-action="set-event-sound" data-index="${i}">${options}</select></span></div>`;
    }).join('');
    return `<div class="sound-layout">
      <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Sound Library</div><div class="panel-subtitle">Upload, play, validate, rename, replace, export, delete, and assign sounds.</div></div><button class="btn primary" data-action="upload-sound">${icon('plus')} Upload sound</button></div>${libraryRows}</section>
      <div>
        <section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">PeonPing / OpenPeon packs</div><div class="panel-subtitle">Import with format, provenance, license, and duplicate validation.</div></div><button class="btn primary" data-action="import-peonping-pack">${icon('download')} Import pack</button></div>
          <p class="section-description" style="margin:0 0 8px">Compatible packs remain visibly identified before any sound becomes available.</p>
          <div class="kv-row"><span>${escapeHtml(pack?.name || 'No pack imported')}</span><span>${pack ? renderStatus(pack.status, `${cap(pack.status)} · ${pack.sounds} sounds`) : '—'}</span></div>
          <div class="kv-row"><span>Last validation</span><span>${escapeHtml(pack ? 'Passed' : 'Not run')}</span></div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px"><button class="btn" data-action="preview-sound-pack" data-id="${pack?.id || ''}">${icon('play')} Preview pack</button><button class="btn" data-action="export-sound-pack" data-id="${pack?.id || ''}">${icon('download')} Export pack</button></div>
        </section>
        <section class="panel-card" style="margin-top:10px"><div class="panel-title">Event sound assignments</div>${assignmentRows}<div style="margin-top:10px"><button class="btn primary" data-action="test-sound-mapping">${icon('test')} Test exact mapping</button></div></section>
      </div>
    </div>`;
  }
    function renderNotificationQuiet(){const q=state.notifications.quiet;return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Quiet hours</div><div class="panel-subtitle">Schedules, weekend behavior, urgent override, and project exceptions.</div></div><button class="btn primary" data-action="edit-quiet-hours">${icon('edit')} Configure</button></div><div class="info-grid">${infoRow('Enabled',q.enabled?'Yes':'No')}${infoRow('Start',q.start)}${infoRow('End',q.end)}${infoRow('Weekends',q.weekends)}${infoRow('Urgent override',q.urgentOverride?'On':'Off')}${infoRow('Current state','Outside quiet hours')}</div><button class="btn" style="margin-top:12px" data-action="preview-quiet-hours">${icon('eye')} Preview effective schedule</button></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Escalation</div><div class="panel-subtitle">Retry, repeat, alternate destination, and unresolved-approval behavior.</div></div><button class="btn" data-action="edit-notification-escalation">${icon('edit')} Edit escalation</button></div><div class="workflow-list">${state.notifications.agents.map((a,i)=>workflowStep(i+1,a.name,a.escalation,'Ready','edit-notification-agent',{id:a.id})).join('')}</div></section></div>`;}
  function renderNotificationTesting(){return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Exact route test</div><div class="panel-subtitle">Choose event, agent, destination, priority, and sound in one bounded test.</div></div><button class="btn primary" data-action="send-test-notification">${icon('test')} Configure test</button></div><div class="workflow-list">${workflowStep(1,'Resolve event mapping','Enabled state, priority, and sound','Ready','open-notification-test-step',{id:'event'})}${workflowStep(2,'Apply agent policy','Destination and escalation','Ready','open-notification-test-step',{id:'agent'})}${workflowStep(3,'Apply quiet hours','Urgent override if eligible','Ready','open-notification-test-step',{id:'quiet'})}${workflowStep(4,'Deliver and record','Latency, result, retries, receipt','Ready','open-notification-test-step',{id:'delivery'})}</div><button class="btn" style="margin-top:12px" data-action="run-notification-diagnostics">${icon('test')} Run diagnostics</button></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Delivery history</div><div class="panel-subtitle">Open receipts and inspect failures without exposing secret destination values.</div></div><button class="btn" data-action="export-notification-history">${icon('download')} Export</button></div><table class="data-table"><thead><tr><th>Time</th><th>Event</th><th>Destination</th><th>Result</th><th></th></tr></thead><tbody>${state.notifications.history.map((h,i)=>`<tr><td>${escapeHtml(h.time)}</td><td>${escapeHtml(h.event)}</td><td>${escapeHtml(h.destination)}</td><td>${renderStatus(h.result==='Delivered'?'ready':'attention',h.result)}</td><td><button class="btn small" data-action="open-notification-receipt" data-index="${i}">Open</button></td></tr>`).join('')}</tbody></table></section></div>`;}

  function renderProjectSync(){const tabs=[['overview','Overview'],['locations','Locations & Authority'],['clients','Clients & Continuity'],['remote','Remote Projects'],['move','Move & Copy'],['conflicts','Conflicts'],['diagnostics','Diagnostics']].map(([id,label])=>({id,label}));return `<div class="manager-page page-enter">${pageHeader('network','Project Location & Sync','Configure project authority, local and remote locations, clients, execution hosts, continuity, copy/move operations, conflict behavior, and diagnostics.',`<button class="btn" data-action="test-project-sync">${icon('test')} Test continuity</button><button class="btn primary" data-action="add-project-location">${icon('plus')} Add location</button>`)}${managerTabs(tabs,state.projectSyncTab,'project-sync-tab')}<div class="manager-body"><div class="manager-scroll">${renderProjectSyncTab()}</div></div></div>`;}
  function renderProjectSyncTab(){const P=state.projectSync;if(state.projectSyncTab==='locations')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Project locations and authority</div><div class="panel-subtitle">Local, mounted, SSH, and hosted projections with one explicit file authority.</div></div><button class="btn primary" data-action="add-project-location">${icon('plus')} Add location</button></div><div class="workflow-list">${P.remotes.map((r,i)=>workflowStep(i+1,r.name,`${r.type} · ${r.address}`,cap(r.status),'edit-project-location',{id:r.id})).join('')}</div><div class="info-grid" style="margin-top:14px">${infoRow('Authoritative location',P.location)}${infoRow('File authority',P.fileAuthority)}${infoRow('Server host',P.serverHost)}${infoRow('Execution host',P.executionHost)}</div></section>`;if(state.projectSyncTab==='clients')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Connected clients</div><div class="panel-subtitle">Roles, compatibility, last sync, and continuity eligibility.</div></div><button class="btn" data-action="manage-clients">${icon('settings')} Manage</button></div><div class="workflow-list">${P.clients.map((c,i)=>workflowStep(i+1,c.name,`${c.platform} · ${c.role} · ${c.lastSync}`,cap(c.status),'open-project-client',{id:c.id})).join('')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Continuity</div><div class="panel-subtitle">Choose which durable activities can resume elsewhere.</div></div><button class="btn primary" data-action="edit-continuity">${icon('edit')} Configure</button></div><div class="info-grid">${Object.entries(P.continuity).map(([k,v])=>infoRow(humanize(k),v?'On':'Off')).join('')}</div></section></div>`;if(state.projectSyncTab==='remote')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Remote projects</div><div class="panel-subtitle">SSH remotes, mounted storage, and hosted repository imports.</div></div><button class="btn primary" data-action="add-ssh-remote">${icon('plus')} Add SSH remote</button></div><div class="workflow-list">${P.remotes.map((r,i)=>workflowStep(i+1,r.name,`${r.type} · ${r.address}`,cap(r.status),'edit-ssh-remote',{id:r.id})).join('')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Import remote project</div><div class="panel-subtitle">Choose remote, project path, local projection, source-control account, and execution host.</div></div><button class="btn" data-action="import-remote-project">${icon('download')} Import</button></div><div class="info-grid">${infoRow('SSH authentication','Credential store / agent')}${infoRow('Host keys','Strict')}${infoRow('Project files','Remote or synchronized projection')}${infoRow('Execution','Selected host')}</div></section></div>`;if(state.projectSyncTab==='move')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title">Move project</div><p class="section-description">Preview files, databases, artifacts, repository, Goals, clients, authority switch, and rollback.</p><button class="btn primary" data-action="move-project">${icon('arrowRight')} Configure move</button></section><section class="panel-card"><div class="panel-title">Copy project</div><p class="section-description">Copy project state while preserving the source and allowing independent settings afterward.</p><button class="btn" data-action="copy-project">${icon('copy')} Configure copy</button></section></div>`;if(state.projectSyncTab==='conflicts')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Conflict policy</div><div class="panel-subtitle">${escapeHtml(P.conflictPolicy)}</div></div><button class="btn primary" data-action="edit-conflict-policy">${icon('edit')} Edit policy</button></div><div class="info-grid">${infoRow('Text files','Three-way merge when safe')}${infoRow('Binary artifacts','Preserve both')}${infoRow('Goal state','Pause affected work')}${infoRow('Authority','Never silently switch')}</div></section><section class="panel-card"><div class="panel-title">Conflict simulator</div><p class="section-description">Create two synthetic edits and preview detection, merge, preservation, decision, and rollback.</p><button class="btn" data-action="simulate-sync-conflict">${icon('test')} Run simulation</button></section></div>`;if(state.projectSyncTab==='diagnostics')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Project Sync diagnostics</div><div class="panel-subtitle">Hosts, clients, authoritative paths, continuity, conflicts, and recovery.</div></div><button class="btn primary" data-action="run-project-sync-diagnostics">${icon('test')} Run</button><button class="btn" data-action="export-project-sync-report">${icon('download')} Export</button></div><div class="workflow-list">${['Server and execution hosts','Client compatibility','Authoritative paths','Goal/chat continuity','Conflict and recovery policy'].map((x,i)=>workflowStep(i+1,x,'Current fixture status','Ready','open-project-sync-diagnostic',{id:slug(x)})).join('')}</div></section>`;return `<div class="card-grid four"><article class="stat-card"><div class="stat-label">Server host</div><div class="stat-value" style="font-size:13px">${escapeHtml(P.serverHost)}</div><div class="stat-note">Online</div></article><article class="stat-card"><div class="stat-label">Execution host</div><div class="stat-value" style="font-size:13px">${escapeHtml(P.executionHost)}</div><div class="stat-note">Project default</div></article><article class="stat-card"><div class="stat-label">Clients</div><div class="stat-value">${P.clients.length}</div><div class="stat-note">${P.clients.filter(c=>c.status==='online').length} online</div></article><article class="stat-card"><div class="stat-label">File authority</div><div class="stat-value" style="font-size:13px">${escapeHtml(P.fileAuthority)}</div><div class="stat-note">Explicit</div></article></div><div class="card-grid two" style="margin-top:10px"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Current project authority</div><div class="panel-subtitle">The exact location and owning server remain visible.</div></div><button class="btn" data-action="edit-project-location">${icon('edit')} Edit</button></div><div class="info-grid">${infoRow('Project path',P.location)}${infoRow('Server host',P.serverHost)}${infoRow('Execution host',P.executionHost)}${infoRow('Sync mode',P.syncMode)}${infoRow('File authority',P.fileAuthority)}${infoRow('Conflict policy',P.conflictPolicy)}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Continuity health</div><div class="panel-subtitle">Goals, chats, unsaved editors, terminals, and debug sessions are controlled separately.</div></div><button class="btn" data-action="project-sync-tab" data-tab="clients">Manage continuity</button></div><div class="workflow-list">${P.clients.map((c,i)=>workflowStep(i+1,c.name,`${c.platform} · ${c.lastSync}`,cap(c.status),'open-project-client',{id:c.id})).join('')}</div></section></div>`;}

  function renderProjectHistory(){const tabs=[['history','Timeline'],['sessions','Sessions'],['artifacts','Artifacts'],['cleanup','Retention & Cleanup'],['export','Export & Import']].map(([id,label])=>({id,label}));return `<div class="manager-page page-enter">${pageHeader('history','History & Artifacts','Browse project history, resume durable sessions, inspect generated artifacts, apply retention and cleanup safely, and export selected records.',`<button class="btn" data-action="search-project-history">${icon('search')} Search</button><button class="btn primary" data-action="export-project-history">${icon('download')} Export</button>`)}${managerTabs(tabs,state.projectHistoryTab,'project-history-tab')}<div class="manager-body"><div class="manager-scroll">${renderProjectHistoryTab()}</div></div></div>`;}
  function renderProjectHistoryTab(){const H=state.projectHistory;if(state.projectHistoryTab==='sessions')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Durable project sessions</div><div class="panel-subtitle">Resume across compatible devices without losing Goal, chat, or editor context.</div></div><button class="btn primary" data-action="new-project-session">${icon('plus')} New session</button></div><table class="data-table"><thead><tr><th>Session</th><th>Device</th><th>Updated</th><th>State</th><th>Artifacts</th><th></th></tr></thead><tbody>${H.sessions.map(s=>`<tr><td><div class="table-primary">${escapeHtml(s.title)}</div></td><td>${escapeHtml(s.device)}</td><td>${escapeHtml(s.updated)}</td><td>${renderStatus(s.state==='Active'?'ready':s.state==='Paused'?'attention':'ready',s.state)}</td><td>${s.artifacts}</td><td><button class="btn small" data-action="resume-project-session" data-id="${s.id}">Resume</button><button class="icon-btn" data-action="project-session-menu" data-id="${s.id}">${icon('more')}</button></td></tr>`).join('')}</tbody></table></section>`;if(state.projectHistoryTab==='artifacts')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Project artifacts</div><div class="panel-subtitle">Ownership, type, size, retention, open/download, and safe deletion review.</div></div><button class="btn" data-action="add-artifact-location">${icon('plus')} Add location</button></div><table class="data-table"><thead><tr><th>Artifact</th><th>Type</th><th>Owner</th><th>Size</th><th>Retention</th><th></th></tr></thead><tbody>${H.artifacts.map(a=>`<tr><td><div class="table-primary">${escapeHtml(a.name)}</div></td><td>${escapeHtml(a.type)}</td><td>${escapeHtml(a.owner)}</td><td>${escapeHtml(a.size)}</td><td>${escapeHtml(a.retention)}</td><td><button class="btn small" data-action="open-project-artifact" data-id="${a.id}">Open</button><button class="icon-btn" data-action="project-artifact-menu" data-id="${a.id}">${icon('more')}</button></td></tr>`).join('')}</tbody></table></section>`;if(state.projectHistoryTab==='cleanup')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Retention policy</div><div class="panel-subtitle">Per-type defaults, pins, owner protection, redaction, and legal holds.</div></div><button class="btn primary" data-action="edit-project-retention">${icon('edit')} Edit</button></div><div class="info-grid">${infoRow('Chat history','Keep indefinitely')}${infoRow('Goal receipts','1 year')}${infoRow('Temporary artifacts','7 days')}${infoRow('Test evidence','90 days')}${infoRow('Pinned items','Keep')}${infoRow('Secrets','Redact before storage')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Cleanup review</div><div class="panel-subtitle">Nothing is deleted solely because it is old.</div></div><button class="btn primary" data-action="review-project-cleanup">${icon('eye')} Review 18 candidates</button></div><div class="workflow-list">${workflowStep(1,'Active ownership','Exclude active Goals and sessions','Ready','open-cleanup-rule',{id:'owner'})}${workflowStep(2,'Recovery value','Preserve rollback and audit evidence','Ready','open-cleanup-rule',{id:'recovery'})}${workflowStep(3,'User preview','Show every proposed deletion','Ready','open-cleanup-rule',{id:'preview'})}</div></section></div>`;if(state.projectHistoryTab==='export')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Export project history</div><div class="panel-subtitle">Select range, event types, receipts, artifacts, redaction, and format.</div></div><button class="btn primary" data-action="configure-history-export">${icon('download')} Configure export</button></div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Import history archive</div><div class="panel-subtitle">Validate project identity, schema, duplication, and provenance before merge.</div></div><button class="btn" data-action="import-project-history">${icon('upload')} Import</button></div></section></div>`;return `<div class="card-grid four"><article class="stat-card"><div class="stat-label">Sessions</div><div class="stat-value">${H.sessions.length}</div><div class="stat-note">${H.sessions.filter(s=>s.state==='Active').length} active</div></article><article class="stat-card"><div class="stat-label">Artifacts</div><div class="stat-value">${H.artifacts.length}</div><div class="stat-note">Across Goals, tests, and exports</div></article><article class="stat-card"><div class="stat-label">Cleanup candidates</div><div class="stat-value">18</div><div class="stat-note">Review required</div></article><article class="stat-card"><div class="stat-label">Goal receipts</div><div class="stat-value" style="font-size:13px">1 year</div><div class="stat-note">Default retention</div></article></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Recent project timeline</div><div class="panel-subtitle">Meaningful user and agent events—not an unstructured log wall.</div></div><button class="btn" data-action="filter-project-history">${icon('search')} Filter</button></div><div class="workflow-list">${H.sessions.map((s,i)=>workflowStep(i+1,s.title,`${s.device} · ${s.updated}`,s.state,'resume-project-session',{id:s.id})).join('')}</div></section>`;}

  function renderPermissions(){const tabs=[['profiles','Profiles'],['effective','Effective Access'],['rules','Ordered Rules'],['filesafe','FileSafe'],['approvals','Approvals'],['guardrails','Runaway Guardrails'],['simulator','Simulator'],['audit','Audit']].map(([id,label])=>({id,label}));return `<div class="manager-page page-enter">${pageHeader('shield','Safety & Permissions','Configure permission profiles, ordered rules, effective access, FileSafe boundaries, approvals, external actions, runaway protection, simulation, and audit history.',`<button class="btn" data-action="simulate-permission">${icon('test')} Simulate action</button><button class="btn primary" data-action="create-permission-profile">${icon('plus')} New profile</button>`)}${managerTabs(tabs,state.permissionTab,'permission-tab')}<div class="manager-body"><div class="manager-scroll">${renderPermissionTab()}</div></div></div>`;}
  function renderPermissionTab(){if(state.permissionTab==='effective')return renderEffectivePermissions();if(state.permissionTab==='rules')return renderPermissionRules();if(state.permissionTab==='filesafe')return renderFileSafe();if(state.permissionTab==='approvals')return renderApprovals();if(state.permissionTab==='guardrails')return renderGuardrails();if(state.permissionTab==='simulator')return renderPermissionSimulator();if(state.permissionTab==='audit')return renderPermissionAudit();const selected=state.permissionProfiles.find(p=>p.id===state.selectedPermissionProfile)||state.permissionProfiles[0];return `<div class="library-grid"><section class="library-list"><div class="roster-head"><div class="roster-title">Profiles (${state.permissionProfiles.length})</div><button class="icon-btn" data-action="create-permission-profile">${icon('plus')}</button></div><div class="library-list-scroll">${state.permissionProfiles.map(p=>`<button class="library-item ${p.id===selected.id?'active':''}" data-action="select-permission-profile" data-id="${p.id}"><span class="resource-avatar">${icon('shield')}</span><span class="library-item-copy"><span class="library-item-name">${escapeHtml(p.name)} ${p.status==='default'?'<span class="badge purple">Default</span>':''}</span><span class="library-item-desc">${escapeHtml(p.description)}</span></span></button>`).join('')}</div></section><section class="library-detail"><div class="panel-title-row"><div><div class="panel-title" style="font-size:14px">${escapeHtml(selected.name)}</div><div class="panel-subtitle">${escapeHtml(selected.scope)} · ${selected.rules} ordered rules</div></div><button class="btn primary" data-action="edit-permission-profile" data-id="${selected.id}">${icon('edit')} Edit</button><button class="icon-btn" data-action="permission-profile-menu" data-id="${selected.id}">${icon('more')}</button></div><p class="section-description" style="font-size:10px">${escapeHtml(selected.description)}</p><div class="info-grid">${infoRow('Scope',selected.scope)}${infoRow('Rules',String(selected.rules))}${infoRow('Default',selected.status==='default'?'Yes':'No')}${infoRow('FileSafe','Project root + protected paths')}${infoRow('External actions','Ask with preview')}${infoRow('Destructive actions','Deny or temporary override')}</div><div style="display:flex;gap:7px;margin-top:14px"><button class="btn primary" data-action="activate-permission-profile" data-id="${selected.id}">${icon('check')} Use profile</button><button class="btn" data-action="duplicate-permission-profile" data-id="${selected.id}">${icon('copy')} Duplicate</button><button class="btn" data-action="preview-effective-permissions" data-id="${selected.id}">${icon('eye')} Preview</button></div></section></div>`;}
  function renderEffectivePermissions(){return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Effective access now</div><div class="panel-subtitle">Resolved from profile, project overrides, resource owners, temporary grants, and hard boundaries.</div></div><button class="btn" data-action="refresh-effective-permissions">${icon('refresh')} Recalculate</button></div><div class="info-grid">${infoRow('Active profile',state.permissionProfiles.find(p=>p.status==='default')?.name||'None')}${infoRow('Project reads','Allow inside project')}${infoRow('Project writes','Allow inside FileSafe')}${infoRow('Network','Approved tools; ask for new destinations')}${infoRow('External messages','Ask with recipient/content preview')}${infoRow('Force push','Deny on protected branches')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Why is this allowed?</div><div class="panel-subtitle">Trace every contributing rule and override.</div></div><button class="btn primary" data-action="trace-permission-decision">${icon('route')} Trace</button></div><div class="workflow-list">${workflowStep(1,'Hard boundary','Credentials cannot be read directly','Applied','open-permission-trace',{id:'hard'})}${workflowStep(2,'Active profile','Hands-off development','Applied','open-permission-trace',{id:'profile'})}${workflowStep(3,'Project rule','Writes inside project root','Applied','open-permission-trace',{id:'project'})}${workflowStep(4,'Resource owner','Plans writes follow owner workflows','Applied','open-permission-trace',{id:'owner'})}</div></section></div>`;}
  function renderPermissionRules(){return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Ordered permission rules</div><div class="panel-subtitle">Specific rules override general profile behavior while hard safety boundaries always remain.</div></div><button class="btn primary" data-action="add-permission-rule">${icon('plus')} Add rule</button></div><div class="workflow-list">${state.permissionRules.map((r,i)=>workflowStep(i+1,r.action,`${r.decision} · ${r.condition} · ${r.source}`,r.decision,'edit-permission-rule',{index:i})).join('')}</div>${state.permissionRules.map((r,i)=>`<div class="table-actions" style="justify-content:flex-end;margin-top:4px"><button class="btn small" data-action="move-permission-rule" data-index="${i}" data-direction="-1">Move up</button><button class="btn small" data-action="move-permission-rule" data-index="${i}" data-direction="1">Move down</button></div>`).join('')}</section>`;}
  function renderFileSafe(){return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">FileSafe boundaries</div><div class="panel-subtitle">Exact paths, access, inheritance, status, evaluation, and credential protection.</div></div><button class="btn primary" data-action="add-filesafe-path">${icon('plus')} Add boundary</button></div><table class="data-table"><thead><tr><th>Path</th><th>Access</th><th>Inheritance</th><th>Status</th><th></th></tr></thead><tbody>${state.fileSafePaths.map((p,i)=>`<tr><td><div class="table-primary">${escapeHtml(p.path)}</div></td><td>${escapeHtml(p.access)}</td><td>${escapeHtml(p.inheritance)}</td><td>${renderStatus(p.status,p.status)}</td><td><button class="btn small" data-action="edit-filesafe-path" data-index="${i}">Edit</button></td></tr>`).join('')}</tbody></table><button class="btn" style="margin-top:12px" data-action="evaluate-filesafe-path">${icon('test')} Evaluate a path</button></section>`;}
  function renderApprovals(){return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Pending approvals</div><div class="panel-subtitle">Exact action, requester, risk, preview, temporary grant, and receipt.</div></div><button class="btn" data-action="review-all-approvals">Review all</button></div><div class="workflow-list">${state.pendingApprovals.map((a,i)=>workflowStep(i+1,a.action,`${a.requester} · ${a.risk}`,a.status,'open-approval',{id:a.id})).join('')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Approval policy</div><div class="panel-subtitle">External actions, installs, credentials, destructive operations, and temporary overrides.</div></div><button class="btn primary" data-action="edit-approval-policy">${icon('edit')} Configure</button></div><div class="info-grid">${infoRow('Provider CLI install','Always ask')}${infoRow('Project dependency','Ask with package/source/version')}${infoRow('External message','Ask with recipient/content')}${infoRow('Destructive source control','Deny or explicit override')}${infoRow('Temporary grants','Time- and scope-bounded')}${infoRow('Receipts','Retained')}</div></section></div>`;}
  function renderGuardrails(){return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Runaway protection</div><div class="panel-subtitle">Repeated failures, tool loops, resource growth, timeouts, and pause/resume.</div></div><button class="btn primary" data-action="edit-runaway-policy">${icon('edit')} Configure</button></div><div class="info-grid">${infoRow('Repeated identical failure','Pause after 3')}${infoRow('Tool loop','Pause and preserve trace')}${infoRow('CPU/memory growth','Throttle, then pause')}${infoRow('Wall-clock timeout','Per task profile')}${infoRow('Partial work','Always preserve')}${infoRow('Resume','After repair or override')}</div><button class="btn" style="margin-top:12px" data-action="simulate-runaway">${icon('test')} Simulate</button></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Resource guardrails</div><div class="panel-subtitle">Concurrency, command duration, network, storage, and evidence limits.</div></div><button class="btn" data-action="edit-resource-guardrails">${icon('edit')} Edit limits</button></div></section></div>`;}
  function renderPermissionSimulator(){return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Permission simulator</div><div class="panel-subtitle">Evaluate actor, action, target, context, profiles, rules, FileSafe, and approval policy without executing.</div></div><button class="btn primary" data-action="simulate-permission">${icon('test')} Configure simulation</button></div><div class="workflow-list">${workflowStep(1,'Define proposed action','Actor, command/tool, target, and context','Ready','simulate-permission',{step:'define'})}${workflowStep(2,'Resolve effective policy','Profile, ordered rules, hard boundaries','Next','simulate-permission',{step:'resolve'})}${workflowStep(3,'Show decision and reason','Allow, ask, deny, or bounded override','Pending','simulate-permission',{step:'decision'})}</div></section>`;}
  function renderPermissionAudit(){return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Safety policy audit</div><div class="panel-subtitle">Profiles, conflicting rules, FileSafe, approvals, temporary grants, guardrails, and recent decisions.</div></div><button class="btn primary" data-action="audit-permission-policy">${icon('test')} Run audit</button><button class="btn" data-action="export-permission-audit">${icon('download')} Export</button></div><div class="workflow-list">${['Profile references','Ordered rule conflicts','FileSafe exact paths','Approval backlog','Runaway guardrails','Effective-policy receipts'].map((x,i)=>workflowStep(i+1,x,'Current fixture status','Ready','open-permission-audit',{id:slug(x)})).join('')}</div></section>`;}

  function renderSettingsTransfer(){const tabs=[['copy','Copy from Project'],['import-export','Import & Export'],['history','History & Rollback']].map(([id,label])=>({id,label}));return `<div class="manager-page page-enter">${pageHeader('copy','Settings Transfer','Copy selected settings from another project, preview differences, import/export archives, preserve credential ownership, and roll back safely.',`<button class="btn" data-action="export-settings">${icon('download')} Export</button><button class="btn primary" data-action="copy-settings-project">${icon('copy')} Copy from project</button>`)}${managerTabs(tabs,state.settingsTransferTab,'settings-transfer-tab')}<div class="manager-body"><div class="manager-scroll">${renderSettingsTransferTab()}</div></div></div>`;}
  function renderSettingsTransferTab(){if(state.settingsTransferTab==='import-export')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Export settings</div><div class="panel-subtitle">Select categories, scope, resource references, redaction, and encryption.</div></div><button class="btn primary" data-action="export-settings">${icon('download')} Configure export</button></div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Import settings</div><div class="panel-subtitle">Validate version, scope, conflicts, resource references, and rollback point.</div></div><button class="btn" data-action="import-settings">${icon('upload')} Import archive</button></div></section></div>`;if(state.settingsTransferTab==='history')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Transfer history</div><div class="panel-subtitle">Open receipts, inspect categories/conflicts, and restore a prior snapshot.</div></div><button class="btn" data-action="export-transfer-history">${icon('download')} Export</button></div><table class="data-table"><thead><tr><th>Time</th><th>Action</th><th>Categories</th><th>Result</th><th></th></tr></thead><tbody>${state.settingsTransferHistory.map((h,i)=>`<tr><td>${escapeHtml(h.time)}</td><td>${escapeHtml(h.action)}</td><td>${h.categories}</td><td>${escapeHtml(h.result)}</td><td><button class="btn small" data-action="open-transfer-receipt" data-index="${i}">Open</button><button class="btn small" data-action="rollback-settings-transfer" data-index="${i}">Roll back</button></td></tr>`).join('')}</tbody></table></section>`;const categories=['AI providers & accounts','Model routing','Source control','Notifications & sounds','Permissions','Testing profiles','Appearance & input','Context & memory behavior','Goals & personas','Project & sync'];return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Source project</div><div class="panel-subtitle">Copy values into this project, then diverge independently.</div></div><button class="btn primary" data-action="choose-source-project">${icon('folder')} Choose project</button></div><div class="info-grid">${infoRow('Source','Settings Lab')}${infoRow('Destination','Puppet Master')}${infoRow('Conflict behavior','Review differences')}${infoRow('Credentials','Keep destination credentials')}${infoRow('Resource references','Reconnect when needed')}${infoRow('Rollback','Create snapshot')}</div><button class="btn" style="margin-top:12px" data-action="edit-copy-behavior">${icon('edit')} Edit behavior</button></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Categories</div><div class="panel-subtitle">Choose coherent groups instead of copying opaque internal fields.</div></div><button class="btn" data-action="select-all-transfer-categories">Select all</button></div><div class="chip-select">${categories.map(c=>`<button class="${state.transferCategories.includes(c)?'active':''}" data-action="toggle-transfer-category" data-category="${escAttr(c)}">${escapeHtml(c)}</button>`).join('')}</div><button class="btn primary" style="margin-top:12px" data-action="preview-settings-copy">${icon('eye')} Preview ${state.transferCategories.length} categories</button></section></div>`;}

  function renderBackup(){const tabs=[['overview','Overview'],['destinations','Destinations'],['schedules','Schedules'],['retention','Retention & Cleanup'],['restore','Restore'],['history','History']].map(([id,label])=>({id,label}));return `<div class="manager-page page-enter">${pageHeader('archive','Data, Backup & Retention','Back up complete application state, manage destinations and schedules, verify backups, restore selectively, configure retention, and inspect receipts.',`<button class="btn" data-action="verify-latest-backup">${icon('test')} Verify latest</button><button class="btn primary" data-action="run-backup">${icon('archive')} Back up now</button>`)}${managerTabs(tabs,state.backupTab,'backup-tab')}<div class="manager-body"><div class="manager-scroll">${renderBackupTab()}</div></div></div>`;}
  function renderBackupTab(){const B=state.backup;if(state.backupTab==='destinations')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Backup destinations</div><div class="panel-subtitle">Path/bucket, credentials, encryption, test, verification, and safe removal.</div></div><button class="btn primary" data-action="add-backup-destination">${icon('plus')} Add destination</button></div><div class="workflow-list">${B.destinations.map((d,i)=>workflowStep(i+1,d.name,`${d.type} · ${d.path} · ${d.encryption}`,cap(d.status),'test-backup-destination',{id:d.id})).join('')}</div>${B.destinations.map(d=>`<div class="table-actions" style="justify-content:flex-end"><button class="icon-btn" data-action="backup-destination-menu" data-id="${d.id}">${icon('more')}</button></div>`).join('')}</section>`;if(state.backupTab==='schedules')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Backup schedules</div><div class="panel-subtitle">Type, time, destination, retention, enabled state, and verification.</div></div><button class="btn primary" data-action="add-backup-schedule">${icon('plus')} Add schedule</button></div><table class="data-table"><thead><tr><th>Schedule</th><th>When</th><th>Destination</th><th>Retention</th><th>Enabled</th><th></th></tr></thead><tbody>${B.schedules.map(s=>`<tr><td><div class="table-primary">${escapeHtml(s.name)}</div></td><td>${escapeHtml(s.when)}</td><td>${escapeHtml(s.destination)}</td><td>${escapeHtml(s.retention)}</td><td><button class="toggle ${s.enabled?'on':''}" data-action="toggle-backup-schedule" data-id="${s.id}"></button></td><td><button class="btn small" data-action="edit-backup-schedule" data-id="${s.id}">Edit</button></td></tr>`).join('')}</tbody></table></section>`;if(state.backupTab==='retention')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Data retention</div><div class="panel-subtitle">Per-type retention with pins, legal holds, and owner protection.</div></div><button class="btn primary" data-action="edit-backup-retention">${icon('edit')} Edit</button></div><div class="info-grid">${Object.entries(B.retention).map(([k,v])=>infoRow(humanize(k),v)).join('')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Cleanup review</div><div class="panel-subtitle">Review candidates and recovery value before removal.</div></div><button class="btn" data-action="review-backup-cleanup">${icon('eye')} Review candidates</button></div></section></div>`;if(state.backupTab==='restore')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Restore from backup</div><div class="panel-subtitle">Verified receipt, scope, target, conflicts, compatibility, and pre-restore snapshot.</div></div><button class="btn primary" data-action="start-restore">${icon('restore')} Start restore</button></div><div class="info-grid">${infoRow('Latest verified',B.history[0]?.receipt||'None')}${infoRow('Full application restore','Available')}${infoRow('Settings-only restore','Available')}${infoRow('Granular groups','Available')}${infoRow('Compatibility check','Required')}${infoRow('Rollback point','Required')}</div><button class="btn" style="margin-top:12px" data-action="configure-granular-restore">Configure granular restore</button></section><section class="panel-card"><div class="panel-title">Restore safeguards</div><div class="workflow-list">${workflowStep(1,'Validate backup','Hashes, encryption, schema','Ready','open-restore-step',{id:'validate'})}${workflowStep(2,'Create current snapshot','Rollback before apply','Ready','open-restore-step',{id:'snapshot'})}${workflowStep(3,'Preview changes','Files, DB, settings, conflicts','Ready','open-restore-step',{id:'preview'})}${workflowStep(4,'Apply and verify','Selected scope only','Ready','open-restore-step',{id:'apply'})}</div></section></div>`;if(state.backupTab==='history')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Backup history</div><div class="panel-subtitle">Open, verify, restore, export, and inspect every receipt.</div></div><button class="btn" data-action="export-backup-history">${icon('download')} Export</button></div><table class="data-table"><thead><tr><th>Time</th><th>Type</th><th>Destination</th><th>Size</th><th>Result</th><th></th></tr></thead><tbody>${B.history.map((h,i)=>`<tr><td>${escapeHtml(h.time)}</td><td>${escapeHtml(h.type)}</td><td>${escapeHtml(h.destination)}</td><td>${escapeHtml(h.size)}</td><td>${renderStatus(h.result==='Verified'?'ready':'attention',h.result)}</td><td><button class="btn small" data-action="open-backup-receipt" data-index="${i}">Open</button><button class="icon-btn" data-action="backup-receipt-menu" data-index="${i}">${icon('more')}</button></td></tr>`).join('')}</tbody></table></section>`;return `<div class="card-grid four"><article class="stat-card"><div class="stat-label">Destinations</div><div class="stat-value">${B.destinations.length}</div><div class="stat-note">${B.destinations.filter(d=>d.status==='ready').length} ready</div></article><article class="stat-card"><div class="stat-label">Schedules</div><div class="stat-value">${B.schedules.filter(s=>s.enabled).length}</div><div class="stat-note">Enabled</div></article><article class="stat-card"><div class="stat-label">Latest backup</div><div class="stat-value" style="font-size:13px">${escapeHtml(B.history[0]?.result||'None')}</div><div class="stat-note">${escapeHtml(B.history[0]?.time||'Never')}</div></article><article class="stat-card"><div class="stat-label">Coverage</div><div class="stat-value" style="font-size:13px">Full state</div><div class="stat-note">Settings, DB, Goals, history</div></article></div><div class="card-grid two" style="margin-top:10px"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Backup coverage</div><div class="panel-subtitle">Understand exactly what is protected and what is intentionally excluded.</div></div><button class="btn" data-action="view-backup-coverage">${icon('eye')} View coverage</button></div><div class="info-grid">${infoRow('Application databases','Included')}${infoRow('Settings','Included')}${infoRow('Provider credentials','Secure references')}${infoRow('Goal/chat state','Included')}${infoRow('Project metadata','Included')}${infoRow('Disposable caches','Excluded')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Latest verified receipt</div><div class="panel-subtitle">${escapeHtml(B.history[0]?.receipt||'No backup')}</div></div><button class="btn primary" data-action="open-backup-receipt" data-index="0">Open receipt</button></div><div class="info-grid">${B.history[0]?Object.entries(B.history[0]).map(([k,v])=>infoRow(humanize(k),v)).join(''):''}</div></section></div>`;}

  function renderDoctor(){const ready=state.doctorChecks.filter(c=>c.status==='ready').length;return `<div class="manager-page page-enter">${pageHeader('test','Doctor','Run direct health checks, open evidence, repair safe findings, configure policy, and export a redacted report—without an unnecessary dropdown.',`<button class="btn primary" data-action="run-doctor">${icon('test')} ${state.doctorRunning?'Running…':'Run Doctor'}</button>`)}<div class="manager-body"><div class="manager-scroll"><div class="card-grid three"><article class="stat-card"><div class="stat-label">Checks ready</div><div class="stat-value">${ready}/${state.doctorChecks.length}</div><div class="stat-note">Actionable warnings stay visible</div></article><article class="stat-card"><div class="stat-label">Last run</div><div class="stat-value" style="font-size:12px">${escapeHtml(state.doctorLastRun)}</div><div class="stat-note">Results persist until rerun</div></article><article class="stat-card"><div class="stat-label">Automatic repair</div><div class="stat-value" style="font-size:13px">Safe only</div><div class="stat-note">Everything else previews first</div></article></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Health checks</div><div class="panel-subtitle">Open any result for evidence, failure, repair, and affected features.</div></div><button class="btn" data-action="export-doctor-report">${icon('download')} Export</button></div><div class="workflow-list">${state.doctorChecks.map((c,i)=>workflowStep(i+1,c.name,c.detail,c.status==='ready'?'Ready':'Attention','open-doctor-check',{id:c.id})).join('')}</div></section><div class="card-grid two" style="margin-top:10px"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Recommended repair</div><div class="panel-subtitle">One MCP catalog is stale; connection and credentials remain healthy.</div></div><button class="btn primary" data-action="repair-doctor-finding" data-id="toolchain">${icon('refresh')} Refresh MCP tools</button></div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Doctor policy</div><div class="panel-subtitle">Startup checks, notifications, retention, and safe-repair boundaries.</div></div><button class="btn" data-action="edit-doctor-policy">${icon('edit')} Configure</button></div></section></div></div></div></div>`;}
  function renderServers(){return `<div class="manager-page page-enter">${pageHeader('network','Servers & Installation','A lightweight status and ownership surface. Full host claiming, deployment, syncing, continuity, updates, and installation flows remain owned by the Project Syncing and Updates work.',`<button class="btn" data-action="test-server-status">${icon('test')} Refresh status</button>`)}<div class="manager-body"><div class="manager-scroll"><div class="card-grid three"><article class="stat-card"><div class="stat-label">Server host</div><div class="stat-value" style="font-size:13px">Home TrueNAS</div><div class="stat-note">Online · authoritative service</div></article><article class="stat-card"><div class="stat-label">Execution host</div><div class="stat-value" style="font-size:13px">Windows WSL</div><div class="stat-note">Ready · project default</div></article><article class="stat-card"><div class="stat-label">Clients</div><div class="stat-value">3</div><div class="stat-note">All compatible</div></article></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">Current topology</div><div class="panel-subtitle">Enough information to understand the active configuration without inventing the later manager.</div></div><button class="btn" data-action="navigate" data-domain="projects" data-workspace="project-sync">Open Project Sync</button></div><div class="info-grid">${infoRow('Server host','Home TrueNAS · Linux container')}${infoRow('Execution host','Windows Workstation · WSL2')}${infoRow('Mac execution','Available')}${infoRow('Browser client','Connected')}${infoRow('Project authority','TrueNAS mounted path')}${infoRow('Installations','Tracked per host')}</div></section><div class="alert-strip info">${icon('info')}<div><strong>Planned owner:</strong> Project Syncing and Updates. Advanced deployment and host-claim management are intentionally deferred; status, navigation, and diagnostics remain usable.</div></div><section class="panel-card" style="margin-top:10px"><div class="workflow-list">${workflowStep(1,'Server host reachable','WebSocket and health endpoint','Ready','open-server-check',{id:'server'})}${workflowStep(2,'Execution host ready','WSL distribution and project path','Ready','open-server-check',{id:'execution'})}${workflowStep(3,'Client compatibility','Version and protocol','Ready','open-server-check',{id:'clients'})}${workflowStep(4,'Project authority','Mounted path and permissions','Ready','open-server-check',{id:'authority'})}</div></section></div></div></div>`;}
  function renderUpdates(){const tabs=[{id:'overview',label:'Overview'},{id:'history',label:'History & Rollback'}],U=state.updates;return `<div class="manager-page page-enter">${pageHeader('refresh','App Updates','Control automatic updates through GitHub Releases, inspect provenance and migration readiness, view history, and perform guarded rollback.',`<button class="btn" data-action="check-for-updates">${icon('refresh')} Check now</button><button class="btn primary" data-action="install-update">${icon('download')} Install ${escapeHtml(U.availableVersion)}</button>`)}${managerTabs(tabs,state.updatesTab,'updates-tab')}<div class="manager-body"><div class="manager-scroll">${renderUpdatesTab()}</div></div></div>`;}
  function renderUpdatesTab(){const U=state.updates;if(state.updatesTab==='history')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Update history</div><div class="panel-subtitle">Installed versions, source, provenance, migrations, restarts, and rollback eligibility.</div></div><button class="btn" data-action="export-update-history">${icon('download')} Export</button></div><table class="data-table"><thead><tr><th>Version</th><th>Installed</th><th>Result</th><th>Notes</th><th></th></tr></thead><tbody>${U.history.map((h,i)=>`<tr><td><div class="table-primary">${escapeHtml(h.version)}</div></td><td>${escapeHtml(h.installed)}</td><td>${renderStatus(h.result==='Current'?'ready':h.result.includes('rollback')?'attention':'ready',h.result)}</td><td>${escapeHtml(h.notes)}</td><td><button class="btn small" data-action="open-update-receipt" data-index="${i}">Open</button>${h.result.includes('rollback')?`<button class="btn small" data-action="rollback-update" data-index="${i}">Roll back</button>`:''}</td></tr>`).join('')}</tbody></table></section>`;return `<div class="card-grid four"><article class="stat-card"><div class="stat-label">Current version</div><div class="stat-value" style="font-size:13px">${escapeHtml(U.currentVersion)}</div><div class="stat-note">${escapeHtml(U.source)}</div></article><article class="stat-card"><div class="stat-label">Available</div><div class="stat-value" style="font-size:13px">${escapeHtml(U.availableVersion)}</div><div class="stat-note">${escapeHtml(U.channel)}</div></article><article class="stat-card"><div class="stat-label">Automatic updates</div><div class="stat-value" style="font-size:13px">${U.automatic?'On':'Off'}</div><div class="stat-note">${escapeHtml(U.checkInterval)}</div></article><article class="stat-card"><div class="stat-label">Last check</div><div class="stat-value" style="font-size:13px">${escapeHtml(U.lastCheck)}</div><div class="stat-note">Signature verified</div></article></div><div class="card-grid two" style="margin-top:10px"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Update behavior</div><div class="panel-subtitle">One primary Automatic Updates choice with advanced details available.</div></div><button class="btn primary" data-action="edit-update-settings">${icon('edit')} Configure</button></div><div class="info-grid">${infoRow('Automatic updates',U.automatic?'On':'Off')}${infoRow('Channel',U.channel)}${infoRow('Install source',U.source)}${infoRow('Check schedule',U.checkInterval)}${infoRow('Download','Background; install when safe')}${infoRow('Restart','Ask after preserving state')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Available update</div><div class="panel-subtitle">Provenance, migration, restart, and rollback readiness.</div></div><button class="btn" data-action="preview-update">${icon('eye')} View details</button></div><div class="info-grid">${infoRow('Version',U.availableVersion)}${infoRow('Signature','Verified')}${infoRow('Database migration','Compatible')}${infoRow('Settings migration','Preview available')}${infoRow('Restart','Required')}${infoRow('Rollback point','Will be created')}</div></section></div>`;}

  /* ----- interaction layer ------------------------------------------------ */
  const diagnostics = {
    booted: false,
    renderCount: 0,
    actions: {},
    genericActions: [],
    unhandledActions: [],
    errors: []
  };

  function recordAction(action) {
    diagnostics.actions[action] = (diagnostics.actions[action] || 0) + 1;
  }

  function ds(el, key, fallback = '') {
    return el?.dataset?.[key] ?? fallback;
  }

  function rerender(title = '', message = '', type = 'success') {
    saveState();
    renderApp({ soft: !state.home });
    if (title) showToast(title, message, type);
  }

  function readForm(form) {
    const out = {};
    for (const field of [...form.elements]) {
      if (!field.name || field.disabled) continue;
      if (field.type === 'checkbox') out[field.name] = field.checked;
      else if (field.type === 'radio') { if (field.checked) out[field.name] = field.value; }
      else if (field.type === 'file') out[field.name] = field.files?.[0]?.name || '';
      else out[field.name] = field.value;
    }
    return out;
  }

  function listValue(value) {
    if (Array.isArray(value)) return value;
    return String(value || '').split(/\n|,/).map(v => v.trim()).filter(Boolean);
  }

  function numberValue(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function uid(prefix, name = '') {
    return `${prefix}-${slug(name || Date.now())}-${String(Date.now()).slice(-5)}`;
  }

  function moveItem(list, index, direction) {
    const to = index + Number(direction);
    if (!Array.isArray(list) || index < 0 || index >= list.length || to < 0 || to >= list.length) return false;
    const [item] = list.splice(index, 1);
    list.splice(to, 0, item);
    return true;
  }

  function formGrid(fields) {
    return `<div class="form-grid">${fields.map(field => {
      if (field.html) return field.html;
      return formField(field.label, field.name, field.value, {
        type: field.type,
        choices: field.choices,
        help: field.help,
        placeholder: field.placeholder,
        autofocus: field.autofocus,
        full: field.full
      });
    }).join('')}</div>`;
  }

  function editObjectDialog({ title, subtitle = '', object, fields, saveLabel = 'Save changes', wide = false, onSave }) {
    return openDialog({
      title,
      subtitle,
      body: formGrid(fields),
      saveLabel,
      wide,
      onSave: (_data, form) => {
        const values = readForm(form);
        if (onSave) onSave(values, form);
        else for (const field of fields) {
          if (!field.name || field.html) continue;
          const current = object[field.name];
          if (Array.isArray(current) || field.list) object[field.name] = listValue(values[field.name]);
          else if (typeof current === 'boolean' || field.type === 'checkbox') object[field.name] = !!values[field.name];
          else if (typeof current === 'number' || field.number) object[field.name] = numberValue(values[field.name], current);
          else object[field.name] = values[field.name];
        }
        saveState();
        renderApp();
        showToast('Changes saved', `${title} was updated.`);
      }
    });
  }

  function infoDrawer(title, subtitle, rows = [], options = {}) {
    const body = `${options.intro ? `<div class="alert-strip info">${icon('info')}<div>${escapeHtml(options.intro)}</div></div>` : ''}
      <div class="info-grid">${rows.map(([label, value]) => infoRow(label, value == null ? 'Not configured' : String(value))).join('')}</div>
      ${options.extra || ''}`;
    return openDrawer({ title, subtitle, body, primaryLabel: options.primaryLabel || '', onPrimary: options.onPrimary || null });
  }

  function confirmDialog(title, message, confirmLabel, onConfirm, danger = false) {
    return openDialog({
      title,
      subtitle: message,
      body: `<div class="alert-strip ${danger ? 'danger' : 'info'}">${icon(danger ? 'alert' : 'info')}<div>${escapeHtml(message)}</div></div>`,
      saveLabel: confirmLabel,
      onSave: () => { onConfirm?.(); return true; }
    });
  }

  function taskDrawer(title, steps, options = {}) {
    const taskId = uid('task');
    const body = `<div class="alert-strip info" id="${taskId}-summary">${icon('refresh')}<div><strong>Running checks…</strong><br>${escapeHtml(options.summary || 'This concept simulates the operation and preserves a compact receipt.')}</div></div>
      <div class="workflow-list" id="${taskId}">${steps.map((step, i) => workflowStep(i + 1, step[0] || step, step[1] || 'Waiting', i === 0 ? 'Next' : 'Pending', 'task-step-details', {task:taskId,index:i})).join('')}</div>`;
    openDrawer({ title, subtitle: options.subtitle || 'Progress, evidence, and typed failures stay inspectable.', body });
    const run = document.getElementById(taskId);
    const summary = document.getElementById(`${taskId}-summary`);
    if (!run) return;
    const nodes = [...run.querySelectorAll('.workflow-step')];
    nodes.forEach((node, index) => {
      setTimeout(() => {
        const status = node.querySelector('.workflow-status');
        if (status) status.innerHTML = `<span class="status-dot active"></span>Passed`;
        node.classList.add('is-complete');
        if (index === nodes.length - 1 && summary) {
          summary.className = 'alert-strip success';
          summary.innerHTML = `${icon('check')}<div><strong>${escapeHtml(options.successTitle || 'Operation completed')}</strong><br>${escapeHtml(options.successMessage || 'All simulated stages passed and a receipt is available.')}</div>`;
          options.onComplete?.();
        }
      }, 180 + index * 220);
    });
  }

  function openMenu(anchor, items, title = '') {
    document.querySelectorAll('.popover').forEach(el => el.remove());
    const pop = document.createElement('div');
    pop.className = 'popover';
    pop.setAttribute('role', 'menu');
    pop.innerHTML = `${title ? `<div class="popover-title">${escapeHtml(title)}</div>` : ''}${items.map(item => {
      if (item.separator) return '<div class="menu-sep"></div>';
      const callback = registerAction(() => { pop.remove(); item.onClick?.(); });
      return `<button class="menu-item ${item.danger ? 'danger' : ''}" role="menuitem" data-callback="${callback}" ${item.disabled ? 'disabled' : ''}>${icon(item.icon || 'settings')}<span>${escapeHtml(item.label)}</span>${item.meta ? `<span class="menu-meta">${escapeHtml(item.meta)}</span>` : ''}</button>`;
    }).join('')}`;
    document.body.append(pop);
    const rect = anchor?.getBoundingClientRect?.() || {right:window.innerWidth - 16,bottom:16,left:window.innerWidth - 220,top:16};
    const width = Math.max(190, pop.offsetWidth || 210);
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
    const top = Math.min(window.innerHeight - (pop.offsetHeight || 240) - 8, rect.bottom + 6);
    pop.style.left = `${left}px`;
    pop.style.top = `${Math.max(8, top)}px`;
    requestAnimationFrame(() => pop.querySelector('button:not([disabled])')?.focus());
    return pop;
  }

  function genericActionDrawer(action, el) {
    const title = humanize(action);
    const attrs = Object.entries(el?.dataset || {}).filter(([key]) => key !== 'action');
    diagnostics.genericActions.push(action);
    infoDrawer(title, 'This control is wired to a complete concept interaction rather than an inert banner.', [
      ['Workspace', getWorkspace().label],
      ['Domain', getDomain().label],
      ['Action', title],
      ...attrs.map(([key, value]) => [humanize(key), value])
    ], {
      intro: 'The production implementation will bind this interaction to the owning command and receipt. This concept keeps the complete setup path, resulting state, and owner visible.',
      extra: `<div class="workflow-list" style="margin-top:12px">${workflowStep(1,'Review current configuration','Inspect defaults, inherited values, prerequisites, and owner','Ready','generic-workflow-detail',{action})}${workflowStep(2,'Preview effective changes','Show the exact affected scope before applying','Next','generic-workflow-detail',{action})}${workflowStep(3,'Apply through the owning manager','Preserve a receipt, validation result, and rollback path','Pending','generic-workflow-detail',{action})}</div>`
    });
  }

  function providerById(id = state.selectedProvider) { return state.providers.find(p => p.id === id) || state.providers[0]; }
  function freeRouteById(id = state.selectedFreeRoute) { return state.freeRoutes.find(r => r.id === id) || state.freeRoutes[0]; }
  function webRouteById(id = state.selectedWebRoute) { return state.webRoutes.find(r => r.id === id) || state.webRoutes[0]; }
  function mediaRouteById(id = state.selectedMediaRoute) { return state.mediaRoutes.find(r => r.id === id) || state.mediaRoutes[0]; }
  function toolById(kind, id = state.selectedTool[kind]) { return state.toolchain[kind]?.find(item => item.id === id) || state.toolchain[kind]?.[0]; }

  function endpointOptions(capability = '') {
    const options = [];
    for (const provider of state.providers) {
      if (!provider.installed || !provider.signedIn || provider.id === 'free-models') continue;
      for (const model of provider.models || []) {
        if (!model.enabled) continue;
        if (capability && !(model.caps || []).includes(capability) && !['code','reasoning','tools'].includes(capability)) continue;
        const account = provider.accounts.find(a => a.id === provider.defaultAccount) || provider.accounts.find(a => a.active);
        options.push({
          value: `${provider.id}::${model.id}::${account?.id || ''}`,
          label: `${provider.name} · ${model.name}${account ? ` · ${account.nickname}` : ''}`,
          provider, model, account
        });
      }
    }
    return options;
  }

  function applyEndpoint(route, encoded) {
    const [providerId, modelId, accountId] = String(encoded).split('::');
    const provider = providerById(providerId);
    const model = provider.models.find(m => m.id === modelId) || provider.models[0];
    const account = provider.accounts.find(a => a.id === accountId) || provider.accounts.find(a => a.id === provider.defaultAccount) || provider.accounts[0];
    route.primary = { provider: provider.name, model: model?.name || modelId, account: account?.nickname || 'Default account' };
    route.status = 'ready';
  }

  function openProviderSetup() {
    const supported = state.providers.filter(p => p.id !== 'free-models');
    const body = `<div class="alert-strip info">${icon('info')}<div>Only supported Puppet Master integrations appear here. Provider CLIs install from the provider's official source after an explicit user action.</div></div>
      <div class="workflow-list" style="margin-top:12px">${supported.map((p, index) => workflowStep(index + 1, p.name, p.statusLabel, p.installed ? 'Ready' : 'Setup', 'choose-provider-setup', {provider:p.id})).join('')}</div>`;
    openDrawer({ title:'Set up an AI provider', subtitle:'Choose a supported connection, then complete installation, sign-in, account, and model checks.', body });
  }

  function editProviderAccount(provider, account = null) {
    const creating = !account;
    editObjectDialog({
      title: creating ? `Add ${provider.name} account` : `Edit ${account.nickname}`,
      subtitle: 'Authentication, entitlement, account health, and usage remain separate readiness checks.',
      object: account || {},
      fields: [
        {label:'Nickname',name:'nickname',value:account?.nickname || '',autofocus:true},
        {label:'Identity or product label',name:'identity',value:account?.identity || ''},
        {label:'Sign-in method',name:'method',value:account?.method || (provider.kind === 'CLI' ? 'Provider CLI sign-in' : 'Browser sign-in'),type:'select',choices:['Provider CLI sign-in','Browser sign-in','API key','Existing local credentials']},
        {label:'Keep this account active',name:'active',value:account?.active ?? true,type:'checkbox',full:true,help:'Inactive accounts stay saved but are skipped during routing.'}
      ],
      saveLabel: creating ? 'Add account' : 'Save account',
      onSave: (values, form) => {
        const v = readForm(form);
        if (creating) {
          const id = uid('acct', v.nickname);
          provider.accounts.push({id,nickname:v.nickname || 'New account',identity:v.identity || 'Connected identity',active:v.active,default:provider.accounts.length===0,method:v.method,health:'Healthy',usage:'Ready for invocation test'});
          if (!provider.defaultAccount) provider.defaultAccount = id;
        } else Object.assign(account,{nickname:v.nickname,identity:v.identity,method:v.method,active:v.active});
        provider.signedIn = provider.accounts.some(a => a.active);
        provider.installed = true;
        provider.status = provider.signedIn ? 'active' : 'attention';
        provider.statusLabel = provider.signedIn ? `Active · ${provider.accounts.filter(a=>a.active).length} account${provider.accounts.filter(a=>a.active).length===1?'':'s'}` : 'Installed · Sign in';
        saveState(); renderApp(); showToast('Account saved', `${provider.name} account configuration was updated.`);
      }
    });
  }

  function editProviderModel(provider, model) {
    editObjectDialog({
      title:`Configure ${model.name}`,
      subtitle:'Capabilities are model-specific. Routing workspaces consume this exact endpoint record.',
      object:model,
      wide:true,
      fields:[
        {label:'Display name',name:'name',value:model.name,autofocus:true},
        {label:'Plan / product',name:'plan',value:model.plan},
        {label:'Context class',name:'context',value:model.context,type:'select',choices:['N/A','Standard','Large','Very large']},
        {label:'Health',name:'health',value:model.health,type:'select',choices:['Ready','Sign-in required','Invocation blocked','Unavailable']},
        {label:'Capabilities (comma separated)',name:'caps',value:(model.caps||[]).join(', '),full:true,help:'Examples: code, reasoning, tools, vision, browser, image-generation, speech-to-text.'},
        {label:'Eligible for routing',name:'enabled',value:model.enabled,type:'checkbox',full:true}
      ],
      onSave: (_v, form) => {
        const v=readForm(form); Object.assign(model,{name:v.name,plan:v.plan,context:v.context,health:v.health,caps:listValue(v.caps),enabled:v.enabled});
        saveState();renderApp();showToast('Model updated',`${model.name} capabilities and eligibility were saved.`);
      }
    });
  }

  function editProviderRouting(provider) {
    const models = provider.models.map(m => m.id);
    editObjectDialog({
      title:`${provider.name} routing`,
      subtitle:'Choose the provider default model, account exhaustion behavior, and paid-usage guard.',
      object:provider.routing,
      fields:[
        {label:'Default exact model',name:'defaultModel',value:provider.routing.defaultModel || '',type:'select',choices:models},
        {label:'When usage or account is unavailable',name:'exhaustion',value:provider.routing.exhaustion,type:'select',choices:['Try next eligible account, then fallback route','Fallback to balanced coding route','Ask before paid usage, otherwise fallback','Stop and wait','Use next configured provider route']},
        {label:'Allow paid overage within configured guard',name:'paidOverage',value:provider.routing.paidOverage,type:'checkbox',full:true}
      ],
      onSave:(_v,form)=>{const v=readForm(form);provider.routing.defaultModel=v.defaultModel;provider.routing.exhaustion=v.exhaustion;provider.routing.paidOverage=v.paidOverage;saveState();renderApp();showToast('Routing saved',`${provider.name} defaults were updated.`);}
    });
  }

  function configureRoute(kind, route) {
    const capabilityMap = {
      search:'browser', fetch:'tools', crawl:'browser', browser:'browser', map:'tools', extract:'tools',
      'image-generation':'image-generation', vision:'vision', transcription:'speech-to-text', 'text-to-speech':'text-to-speech',
      'audio-generation':'audio-generation', 'video-generation':'video-generation', 'artifact-output':''
    };
    const options = endpointOptions(capabilityMap[route.id] || '');
    const currentProvider = state.providers.find(p=>p.name===route.primary?.provider);
    const currentModel = currentProvider?.models.find(m=>m.name===route.primary?.model);
    const currentAccount = currentProvider?.accounts.find(a=>a.nickname===route.primary?.account);
    const current = currentProvider && currentModel ? `${currentProvider.id}::${currentModel.id}::${currentAccount?.id||''}` : options[0]?.value || '';
    const fields = [
      {label:'Primary exact endpoint',name:'endpoint',value:current,type:'select',choices:options.map(o=>o.value),help:'Options contain only configured, enabled model endpoints compatible with this capability.',full:true},
      {label:'Account attribution',name:'attribution',value:'Always show provider, model, and account in receipts',type:'select',choices:['Always show provider, model, and account in receipts','Show provider and model','Compact receipt']},
      {label:'Failure behavior',name:'failure',value:'Try ordered fallbacks, then ask',type:'select',choices:['Try ordered fallbacks, then ask','Stop with typed error','Ask before fallback']}
    ];
    editObjectDialog({title:`Configure ${route.name}`,subtitle:`${kind === 'web' ? 'Web & Research' : 'Media & Output'} routes use exact endpoints, ordered fallbacks, policy, and a test receipt.`,object:route,fields,saveLabel:'Save route',wide:true,onSave:(_v,form)=>{const v=readForm(form);if(v.endpoint)applyEndpoint(route,v.endpoint);route.receiptAttribution=v.attribution;route.failureBehavior=v.failure;saveState();renderApp();showToast('Route configured',`${route.name} now resolves to ${route.primary.provider} · ${route.primary.model}.`);}});
  }

  function configureRoutePolicy(kind, route) {
    const policy = kind === 'media' ? route.output : route.policy;
    const entries = Object.entries(policy || {});
    editObjectDialog({
      title:`${route.name} ${kind === 'media' ? 'output & storage' : 'policy'}`,
      subtitle:'Review every effective policy value before testing or using the route.',
      object:policy,
      wide:true,
      fields:entries.map(([key,value])=>({label:humanize(key),name:key,value:String(value),full:String(value).length>45})),
      onSave:(_v,form)=>{const values=readForm(form);for(const [key,old] of entries){policy[key]=typeof old==='boolean'?values[key]===true||values[key]==='true':typeof old==='number'?numberValue(values[key],old):values[key];}saveState();renderApp();showToast('Policy updated',`${route.name} effective configuration was saved.`);}
    });
  }

  function configureFallback(kind, route, existing = null) {
    const options = endpointOptions('');
    editObjectDialog({
      title: existing ? `Edit ${route.name} fallback` : `Add ${route.name} fallback`,
      subtitle:'Fallbacks are tried in the displayed order and must be compatible with the capability.',
      object:existing || {},
      fields:[{label:'Fallback exact endpoint',name:'endpoint',value:options[0]?.value||'',type:'select',choices:options.map(o=>o.value),full:true},{label:'Use only when',name:'condition',value:existing?.condition||'Primary unavailable or exhausted',type:'select',choices:['Primary unavailable or exhausted','Primary invocation fails','Usage guard reached','Manual selection only']}],
      saveLabel:existing?'Save fallback':'Add fallback',
      onSave:(_v,form)=>{const v=readForm(form),parts=v.endpoint.split('::'),p=providerById(parts[0]),m=p.models.find(x=>x.id===parts[1]),a=p.accounts.find(x=>x.id===parts[2])||p.accounts[0];const item={provider:p.name,model:m?.name||parts[1],account:a?.nickname||'Default account',condition:v.condition};if(existing)Object.assign(existing,item);else(route.fallbacks||(route.fallbacks=[])).push(item);saveState();renderApp();showToast('Fallback saved',`${route.name} fallback order was updated.`);}
    });
  }

  function editToolResource(kind, item = null) {
    const creating = !item;
    const singular = toolSingular(kind);
    let fields;
    if (kind === 'lsps') fields = [
      {label:'Display name',name:'name',value:item?.name||'',autofocus:true},
      {label:'Language',name:'language',value:item?.language||'',placeholder:'Rust, Python, TypeScript…'},
      {label:'Discovery / install source',name:'source',value:item?.source||'Auto-detected toolchain',type:'select',choices:['Auto-detected toolchain','Workspace package','Project environment','Managed tool','Explicit executable']},
      {label:'Executable command',name:'command',value:item?.command||'',help:'A local executable or workspace command—not a URL.'},
      {label:'Arguments (comma or new line)',name:'args',value:(item?.args||[]).join(', '),full:true},
      {label:'Root markers',name:'rootMarkers',value:(item?.rootMarkers||[]).join(', '),full:true,help:'Files that identify the language workspace, such as Cargo.toml or pyproject.toml.'},
      {label:'Scope',name:'scope',value:item?.scope||'Project',type:'select',choices:['Project','User','Application']}
    ];
    else if (kind === 'formatters') fields = [
      {label:'Display name',name:'name',value:item?.name||'',autofocus:true},
      {label:'Languages / file types',name:'languages',value:(item?.languages||[]).join(', '),full:true},
      {label:'Discovery / install source',name:'source',value:item?.source||'Workspace package',type:'select',choices:['Workspace package','Project environment','System tool','Managed tool','Explicit executable']},
      {label:'Package or executable',name:'executable',value:item?.executable||'',help:'Example: node_modules/.bin/prettier or .venv/bin/ruff.'},
      {label:'Arguments',name:'args',value:(item?.args||[]).join(', '),full:true},
      {label:'Configuration file',name:'config',value:item?.config||'Auto-detect'},
      {label:'Ignore file',name:'ignore',value:item?.ignore||'None'},
      {label:'Format on save',name:'onSave',value:item?.onSave??true,type:'checkbox',full:true},
      {label:'Format on paste',name:'onPaste',value:item?.onPaste??false,type:'checkbox',full:true},
      {label:'Changed lines only when supported',name:'changedLines',value:item?.changedLines??false,type:'checkbox',full:true}
    ];
    else if (kind === 'mcps') fields = [
      {label:'Display name',name:'name',value:item?.name||'',autofocus:true},
      {label:'Transport',name:'transport',value:item?.transport||'stdio',type:'select',choices:['stdio','http'],help:'stdio launches a local process. http connects to a remote Streamable HTTP endpoint.'},
      {label:'Local command (stdio)',name:'command',value:item?.command||'',help:'Executable name or path. This is not a website link.'},
      {label:'Command arguments',name:'args',value:(item?.args||[]).join(', '),full:true},
      {label:'Environment / credential mappings',name:'env',value:(item?.env||[]).join('\n'),type:'textarea',full:true,help:'Secrets stay in the credential store; list only variable mappings.'},
      {label:'Remote Streamable HTTP URL',name:'url',value:item?.url||'',placeholder:'https://…',help:'Used only when Transport is http.'},
      {label:'HTTP headers / credential mappings',name:'headers',value:(item?.headers||[]).join('\n'),type:'textarea',full:true},
      {label:'Permission policy',name:'permissions',value:item?.permissions||'Ask for writes',type:'select',choices:['Read only','Ask for writes','FileSafe boundaries','Project permission profile']},
      {label:'Scope',name:'scope',value:item?.scope||'Project',type:'select',choices:['Project','User','Application']}
    ];
    else if (kind === 'commands') fields = [
      {label:'Name',name:'name',value:item?.name||'',autofocus:true},{label:'Command',name:'command',value:item?.command||''},{label:'Keyboard shortcut',name:'shortcut',value:item?.shortcut||'',help:'Leave empty to keep this command unbound.'},{label:'Category',name:'category',value:item?.category||'Custom'},{label:'Enabled',name:'enabled',value:item?.enabled??true,type:'checkbox',full:true}
    ];
    else if (kind === 'skills') fields = [
      {label:'Name',name:'name',value:item?.name||'',autofocus:true},{label:'Source',name:'source',value:item?.source||'Imported',type:'select',choices:['Built-in','Imported','Project-local']},{label:'Version',name:'version',value:item?.version||'1.0'},{label:'Scope',name:'scope',value:item?.scope||'Project',type:'select',choices:['Project','User']},{label:'Requirements',name:'requirements',value:item?.requirements||'',full:true},{label:'Enabled',name:'enabled',value:(item?.status||'enabled')==='enabled',type:'checkbox',full:true}
    ];
    else if (kind === 'plugins') fields = [
      {label:'Name',name:'name',value:item?.name||'',autofocus:true},{label:'Version / source',name:'version',value:item?.version||'Optional'},{label:'Permissions',name:'permissions',value:(item?.permissions||[]).join(', '),full:true},{label:'Update policy',name:'update',value:item?.update||'Managed with app'},{label:'Enabled',name:'enabled',value:(item?.status||'enabled')==='enabled',type:'checkbox',full:true}
    ];
    else fields = [
      {label:'Name',name:'name',value:item?.name||'',autofocus:true},{label:'Owner',name:'owner',value:item?.owner||'Puppet Master'},{label:'Permission',name:'permission',value:item?.permission||'Ask for sensitive actions'},{label:'Priority',name:'priority',value:item?.priority||1,type:'number',number:true}
    ];
    editObjectDialog({
      title:`${creating?'Add':'Configure'} ${singular}`,
      subtitle:kind==='mcps'?'Choose local stdio or remote Streamable HTTP explicitly; transport-specific fields remain visible and explained.':kind==='lsps'?'Language servers are discovered or launched as local processes and attached to language workspaces.':kind==='formatters'?'Formatter setup includes executable/package, language matching, config, ignore, and save/paste behavior.':'Edit the owning resource and validate it before use.',
      object:item||{},fields,wide:true,saveLabel:creating?`Add ${singular}`:'Save configuration',
      onSave:(_values,form)=>{
        const v=readForm(form); let target=item;
        if(!target){target={id:uid(slug(singular),v.name),status:kind==='skills'||kind==='plugins'?'enabled':'ready'};state.toolchain[kind].push(target);state.selectedTool[kind]=target.id;}
        Object.assign(target,v);
        for(const key of ['args','rootMarkers','languages','env','headers','permissions']) if(v[key]!==undefined && (Array.isArray(target[key]) || ['args','rootMarkers','languages','env','headers','permissions'].includes(key))) target[key]=listValue(v[key]);
        if(kind==='skills'||kind==='plugins')target.status=v.enabled?'enabled':'disabled';
        if(kind==='agentTools')target.priority=numberValue(v.priority,target.priority||1);
        delete target.enabled;
        saveState();renderApp();showToast(`${cap(singular)} saved`,`${target.name} is ready for validation.`);
      }
    });
  }

  function editTestProfile(profile = null) {
    const creating=!profile;
    editObjectDialog({title:creating?'Create testing profile':`Edit ${profile.name}`,subtitle:'Profiles specify trigger, stages, browser/native coverage, evidence, and completion behavior.',object:profile||{},wide:true,fields:[
      {label:'Profile name',name:'name',value:profile?.name||'',autofocus:true},{label:'Description',name:'description',value:profile?.description||'',type:'textarea',full:true},{label:'Trigger',name:'trigger',value:profile?.trigger||'Manual or before delivery'},{label:'Stages',name:'stages',value:(profile?.stages||[]).join('\n'),type:'textarea',full:true},{label:'Browser coverage',name:'browser',value:profile?.browser||'When applicable'},{label:'Native coverage',name:'native',value:profile?.native||'When applicable'},{label:'Evidence policy',name:'evidence',value:profile?.evidence||'Receipts, logs, and screenshots on failure'}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=profile;if(!target){target={id:uid('test',v.name),status:'ready'};state.testProfiles.push(target);state.selectedTestProfile=target.id;}Object.assign(target,v,{stages:listValue(v.stages)});saveState();renderApp();showToast('Testing profile saved',`${target.name} is available for Goals and manual runs.`);}});
  }

  function editDebugProfile(profile = null) {
    const creating=!profile;
    editObjectDialog({title:creating?'Add debug profile':`Edit ${profile.name}`,subtitle:'Debug adapters use explicit program, arguments, environment, working directory, and launch behavior.',object:profile||{},wide:true,fields:[
      {label:'Name',name:'name',value:profile?.name||'',autofocus:true},{label:'Adapter',name:'adapter',value:profile?.adapter||''},{label:'Program / executable',name:'program',value:profile?.program||''},{label:'Arguments',name:'args',value:(profile?.args||[]).join(', '),full:true},{label:'Environment',name:'env',value:(profile?.env||[]).join('\n'),type:'textarea',full:true},{label:'Working directory',name:'cwd',value:profile?.cwd||'${projectRoot}'}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=profile;if(!target){target={id:uid('debug',v.name),status:'ready'};state.debugProfiles.push(target);state.selectedDebugProfile=target.id;}Object.assign(target,v,{args:listValue(v.args),env:listValue(v.env)});saveState();renderApp();showToast('Debug profile saved',`${target.name} can now be tested or launched.`);}});
  }

  function editMemory(memory = null) {
    const creating=!memory;
    editObjectDialog({title:creating?'Create memory':`Edit ${memory.title}`,subtitle:'Memories retain source, type, confidence, scope, and text independently.',object:memory||{},wide:true,fields:[
      {label:'Title',name:'title',value:memory?.title||'',autofocus:true},{label:'Store',name:'store',value:memory?.store||'Project memory',type:'select',choices:['Project memory','User memory','Goal memory','Thread memory']},{label:'Type',name:'type',value:memory?.type||'Preference',type:'select',choices:['Preference','Decision','Constraint','Fact','Workflow','Correction']},{label:'Source',name:'source',value:memory?.source||'User-authored'},{label:'Confidence',name:'confidence',value:memory?.confidence||'High',type:'select',choices:['High','Medium','Low']},{label:'Memory text',name:'text',value:memory?.text||'',type:'textarea',full:true},{label:'Pinned',name:'pinned',value:memory?.pinned??false,type:'checkbox',full:true}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=memory;if(!target){target={id:uid('memory',v.title),updated:'Now'};state.memories.unshift(target);state.selectedMemory=target.id;}Object.assign(target,v,{updated:'Now'});saveState();renderApp();showToast('Memory saved',`${target.title} was updated with source and scope metadata.`);}});
  }

  function editGoalTemplate(template = null) {
    const creating=!template;
    editObjectDialog({title:creating?'Create Goal template':`Edit ${template.name}`,subtitle:'Templates define persona, exact route, phases, checkpoints, subagent policy, verification, and evidence.',object:template||{},wide:true,fields:[
      {label:'Name',name:'name',value:template?.name||'',autofocus:true},{label:'Description',name:'description',value:template?.description||'',type:'textarea',full:true},{label:'Default persona',name:'persona',value:template?.persona||'Puppet Master'},{label:'Model route',name:'route',value:template?.route||'Balanced coding route'},{label:'Phases',name:'phases',value:(template?.phases||[]).join('\n'),type:'textarea',full:true},{label:'Checkpoints',name:'checkpoints',value:template?.checkpoints||'At phase boundaries'},{label:'Subagent policy',name:'subagents',value:template?.subagents||'Use bounded specialists when required'},{label:'Verification',name:'verification',value:template?.verification||'Required before completion'},{label:'Evidence',name:'evidence',value:template?.evidence||'Receipts and changed files'}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=template;if(!target){target={id:uid('goal-template',v.name)};state.goalTemplates.push(target);state.selectedGoalTemplate=target.id;}Object.assign(target,v,{phases:listValue(v.phases)});saveState();renderApp();showToast('Goal template saved',`${target.name} now includes route, phases, verification, and evidence.`);}});
  }

  function editPersona(persona = null, duplicate = false) {
    const creating=!persona||duplicate;
    const base=persona||{};
    editObjectDialog({title:duplicate?`Duplicate ${base.name}`:creating?'Create custom persona':`Edit ${base.name}`,subtitle:'Core, bundled, and custom personas live in one searchable library. Custom personas remain fully manageable.',object:base,wide:true,fields:[
      {label:'Name',name:'name',value:duplicate?`${base.name} Copy`:base.name||'',autofocus:true},{label:'Group',name:'group',value:creating?'Custom':base.group||'Custom',type:'select',choices:['Custom','Bundled','Core']},{label:'Description',name:'description',value:base.description||'',type:'textarea',full:true},{label:'Tone',name:'tone',value:base.tone||'Clear and collaborative'},{label:'Exact model route',name:'route',value:base.route||'Balanced coding route'},{label:'Allowed tools',name:'tools',value:(base.tools||[]).join(', '),full:true},{label:'System prompt / behavior contract',name:'prompt',value:base.prompt||'',type:'textarea',full:true},{label:'Crew membership',name:'crews',value:(base.crews||[]).join(', '),full:true}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=persona;if(creating){target={id:uid('persona',v.name),locked:false};state.personas.push(target);state.selectedPersona=target.id;}Object.assign(target,v,{tools:listValue(v.tools),crews:listValue(v.crews),locked:target.locked&&target.group==='Core'});saveState();renderApp();showToast('Persona saved',`${target.name} is available in the unified persona library.`);}});
  }

  function editCrew(crew = null) {
    const creating=!crew;
    const personaNames=state.personas.map(p=>p.name);
    editObjectDialog({title:creating?'Create crew':`Edit ${crew.name}`,subtitle:'Crews combine existing personas with an explicit lead, route, handoff contract, and concurrency limit.',object:crew||{},wide:true,fields:[
      {label:'Crew name',name:'name',value:crew?.name||'',autofocus:true},{label:'Members',name:'members',value:(crew?.members||personaNames.slice(0,2)).join(', '),full:true,help:'Use persona names from the unified Core, Bundled, and Custom library.'},{label:'Lead persona',name:'lead',value:crew?.lead||personaNames[0],type:'select',choices:personaNames},{label:'Model route',name:'route',value:crew?.route||'Balanced coding route'},{label:'Handoff contract',name:'handoff',value:crew?.handoff||'Structured assignment and result receipt',type:'textarea',full:true},{label:'Maximum concurrency',name:'concurrency',value:crew?.concurrency||2,type:'number',number:true}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=crew;if(!target){target={id:uid('crew',v.name)};state.crews.push(target);state.selectedCrew=target.id;}Object.assign(target,v,{members:listValue(v.members),concurrency:numberValue(v.concurrency,2)});saveState();renderApp();showToast('Crew saved',`${target.name} has ${target.members.length} configured members.`);}});
  }

  function editSourceTool(item = null) {
    const creating=!item;
    editObjectDialog({title:creating?'Add source-control tool':`Configure ${item.name}`,subtitle:'Local tools are discovered, installed, updated, and verified independently on each host.',object:item||{},fields:[
      {label:'Tool name',name:'name',value:item?.name||'',autofocus:true},{label:'Kind',name:'kind',value:item?.kind||'Local tool'},{label:'Host / environment',name:'host',value:item?.host||'Server host',type:'select',choices:['Server host','Windows WSL','Mac execution host','Linux execution host']},{label:'Version',name:'version',value:item?.version||'Not detected'},{label:'Installation source',name:'source',value:item?.source||'Official release',type:'select',choices:['System package','Official release','Official installer','Managed tool']}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=item;if(!target){target={id:uid('source-tool',v.name),status:'ready',default:false};state.sourceControl.tools.push(target);state.selectedSourceTool=target.id;}Object.assign(target,v);saveState();renderApp();showToast('Source-control tool saved',`${target.name} is ready for executable verification.`);}});
  }

  function editForge(forge = null) {
    const creating=!forge;
    const choices=['GitHub','GitLab','Azure DevOps','Bitbucket'];
    editObjectDialog({title:creating?'Connect hosted forge':`Manage ${forge.name}`,subtitle:'Hosted connections manage accounts, scopes, SSH/token health, repository discovery, testing, and disconnect separately from local Git/Jujutsu tools.',object:forge||{},wide:true,fields:[
      {label:'Forge',name:'name',value:forge?.name||'GitHub',type:'select',choices},{label:'Account / organization',name:'defaultAccount',value:forge?.defaultAccount==='None'?'':forge?.defaultAccount||'',autofocus:true},{label:'Requested scopes',name:'scopes',value:(forge?.scopes||['Repository','Pull requests']).join(', '),full:true},{label:'SSH status',name:'ssh',value:forge?.ssh||'Not tested',type:'select',choices:['Not tested','Healthy','Needs setup','Disabled']}
    ],saveLabel:creating?'Connect account':'Save connection',onSave:(_v,form)=>{const v=readForm(form);let target=forge;if(!target){target=state.sourceControl.forges.find(f=>f.name===v.name);if(!target){target={id:uid('forge',v.name)};state.sourceControl.forges.push(target);}}Object.assign(target,v,{status:'active',accounts:1,scopes:listValue(v.scopes),lastTest:'Ready to test'});state.selectedForge=target.id;saveState();renderApp();showToast('Forge connected',`${target.name} account and scopes were saved.`);}});
  }

  function editRepository(repo = null) {
    const creating=!repo;
    editObjectDialog({title:creating?'Add repository':`Configure ${repo.name}`,subtitle:'Repositories retain forge, remote, default branch, protection, LFS, and import or initialization history.',object:repo||{},fields:[
      {label:'Repository name',name:'name',value:repo?.name||'',autofocus:true},{label:'Forge / location',name:'forge',value:repo?.forge||'GitHub',type:'select',choices:['GitHub','GitLab','Azure DevOps','Bitbucket','Local']},{label:'Remote name',name:'remote',value:repo?.remote||'origin'},{label:'Default branch',name:'branch',value:repo?.branch||'main'},{label:'Protection',name:'protection',value:repo?.protection||'Protected',type:'select',choices:['Protected','Review required','None']},{label:'Git LFS',name:'lfs',value:repo?.lfs||'Ready',type:'select',choices:['Ready','Not needed','Needs setup']}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=repo;if(!target){target={state:'Clean'};state.sourceControl.repositories.push(target);}Object.assign(target,v);state.selectedRepository=target.name;saveState();renderApp();showToast('Repository saved',`${target.name} source-control defaults were updated.`);}});
  }

  function editWorktree(worktree = null) {
    const creating=!worktree;
    editObjectDialog({title:creating?'Create worktree':`Manage ${worktree.name}`,subtitle:'Worktrees expose path, revision, active owner, lease, state, cleanup, and patch-preservation behavior.',object:worktree||{},fields:[
      {label:'Name',name:'name',value:worktree?.name||'',autofocus:true},{label:'Path',name:'path',value:worktree?.path||'/mnt/Cursor/.worktrees/'},{label:'Branch / revision',name:'branch',value:worktree?.branch||''},{label:'Owner',name:'owner',value:worktree?.owner||'No active owner'},{label:'Lease',name:'lease',value:worktree?.lease||'Persistent',type:'select',choices:['Persistent','Active Goal','Session','Stale · cleanup eligible']},{label:'Working state',name:'state',value:worktree?.state||'Clean',type:'select',choices:['Clean','Changed','Conflicted']}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=worktree;if(!target){target={};state.sourceControl.worktrees.push(target);}Object.assign(target,v);state.selectedWorktree=target.name;saveState();renderApp();showToast('Worktree saved',`${target.name} ownership and lease are visible.`);}});
  }

  function editNotificationDestination(item = null) {
    const creating=!item;
    editObjectDialog({title:creating?'Add notification destination':`Configure ${item.name}`,subtitle:'Destinations retain address, credentials, urgency, delivery testing, retry, and history without duplicating event routing.',object:item||{},wide:true,fields:[
      {label:'Name',name:'name',value:item?.name||'',autofocus:true},{label:'Type',name:'type',value:item?.type||'Discord webhook',type:'select',choices:['Built-in','Operating system','Discord webhook','Slack webhook','ntfy','Pushover','Telegram','Generic webhook']},{label:'Address / topic / channel',name:'address',value:item?.address||'',help:'Secrets are stored separately and remain redacted here.'},{label:'Urgent events allowed',name:'urgent',value:item?.urgent??false,type:'checkbox',full:true}
    ],saveLabel:creating?'Add destination':'Save destination',onSave:(_v,form)=>{const v=readForm(form);let target=item;if(!target){target={id:uid('destination',v.name)};state.notifications.destinations.push(target);state.selectedDestination=target.id;}Object.assign(target,v,{status:'active'});saveState();renderApp();showToast('Destination saved',`${target.name} is ready for a delivery test.`);}});
  }

  function editNotificationAgent(item = null) {
    const creating=!item;
    const destinations=state.notifications.destinations.map(d=>d.name);
    editObjectDialog({title:creating?'Create notification agent':`Configure ${item.name}`,subtitle:'Agents group events, destinations, escalation, retries, and urgency into a reusable routing policy.',object:item||{},wide:true,fields:[
      {label:'Agent name',name:'name',value:item?.name||'',autofocus:true},{label:'Events',name:'events',value:(item?.events||[]).join(', '),full:true},{label:'Destinations',name:'destinations',value:(item?.destinations||destinations.slice(0,1)).join(', '),full:true,help:`Configured destinations: ${destinations.join(', ')}`},{label:'Escalation',name:'escalation',value:item?.escalation||'None'},{label:'Enabled',name:'enabled',value:(item?.status||'active')==='active',type:'checkbox',full:true}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=item;if(!target){target={id:uid('notification-agent',v.name)};state.notifications.agents.push(target);state.selectedNotificationAgent=target.id;}Object.assign(target,v,{events:listValue(v.events),destinations:listValue(v.destinations),status:v.enabled?'active':'disabled'});delete target.enabled;saveState();renderApp();showToast('Notification agent saved',`${target.name} routes ${target.events.length} event(s).`);}});
  }

  function editNotificationEvent(index = -1) {
    const item=index>=0?state.notifications.events[index]:null;
    const creating=!item;
    const destinations=state.notifications.destinations.map(d=>d.name);
    const sounds=['None',...state.notifications.sounds.map(s=>s.name)];
    editObjectDialog({title:creating?'Add notification event':`Configure ${item.name}`,subtitle:'Assign destinations, sound, priority, and enabled state to an event. Testing uses this exact combination.',object:item||{},wide:true,fields:[
      {label:'Event name',name:'name',value:item?.name||'',autofocus:true},{label:'Destinations',name:'destinations',value:(item?.destinations||destinations.slice(0,1)).join(', '),full:true},{label:'Sound',name:'sound',value:item?.sound||'None',type:'select',choices:sounds},{label:'Priority',name:'priority',value:item?.priority||'Normal',type:'select',choices:['Low','Normal','Urgent']},{label:'Enabled',name:'enabled',value:item?.enabled??true,type:'checkbox',full:true}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=item;if(!target){target={};state.notifications.events.push(target);}Object.assign(target,v,{destinations:listValue(v.destinations)});saveState();renderApp();showToast('Event routing saved',`${target.name} has destinations, sound, priority, and testable state.`);}});
  }

  function editSound(sound = null, fileName = '') {
    const creating=!sound;
    editObjectDialog({title:creating?'Add sound to library':`Edit ${sound.name}`,subtitle:'Upload, preview, rename, replace, assign, export, or remove sounds from the same Notifications & Sounds manager.',object:sound||{},fields:[
      {label:'Sound name',name:'name',value:sound?.name||fileName.replace(/\.[^.]+$/,'')||'',autofocus:true},{label:'Source',name:'source',value:sound?.source||(fileName?'Custom upload':'Built-in'),type:'select',choices:['Custom upload','Built-in','PeonPing pack','Imported pack']},{label:'File',name:'file',value:'',type:'file',full:true,help:'WAV, MP3, OGG, or M4A. The concept stores only filename and metadata.'},{label:'Preview volume',name:'volume',value:sound?.volume||70,type:'number',number:true}
    ],saveLabel:creating?'Add sound':'Save sound',onSave:(_v,form)=>{const v=readForm(form);let target=sound;if(!target){target={id:uid('sound',v.name),duration:'0:02.0',format:(v.file.split('.').pop()||'WAV').toUpperCase(),assignments:0};state.notifications.sounds.push(target);state.selectedSound=target.id;}Object.assign(target,{name:v.name||target.name,source:v.source,volume:numberValue(v.volume,70)});if(v.file){target.format=(v.file.split('.').pop()||'WAV').toUpperCase();target.source='Custom upload';}saveState();renderApp();showToast('Sound library updated',`${target.name} is available for preview and event assignment.`);}});
  }

  function editPermissionProfile(profile = null) {
    const creating=!profile;
    editObjectDialog({title:creating?'Create permission profile':`Edit ${profile.name}`,subtitle:'Profiles are readable policy bundles. Ordered rules, FileSafe boundaries, approvals, and hard denials remain separately inspectable.',object:profile||{},wide:true,fields:[
      {label:'Profile name',name:'name',value:profile?.name||'',autofocus:true},{label:'Description',name:'description',value:profile?.description||'',type:'textarea',full:true},{label:'Scope',name:'scope',value:profile?.scope||'Project',type:'select',choices:['Project','Session','User']},{label:'Rule count',name:'rules',value:profile?.rules||0,type:'number',number:true}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=profile;if(!target){target={id:uid('permission',v.name),status:'available'};state.permissionProfiles.push(target);state.selectedPermissionProfile=target.id;}Object.assign(target,v,{rules:numberValue(v.rules,0)});saveState();renderApp();showToast('Permission profile saved',`${target.name} is available for simulation and activation.`);}});
  }

  function editPermissionRule(index = -1) {
    const rule=index>=0?state.permissionRules[index]:null;
    const creating=!rule;
    editObjectDialog({title:creating?'Add ordered permission rule':`Edit rule: ${rule.action}`,subtitle:'Rules are evaluated in displayed order after hard boundaries and before approval escalation.',object:rule||{},wide:true,fields:[
      {label:'Action',name:'action',value:rule?.action||'',autofocus:true},{label:'Decision',name:'decision',value:rule?.decision||'Ask',type:'select',choices:['Allow','Ask','Deny']},{label:'Condition',name:'condition',value:rule?.condition||'',type:'textarea',full:true},{label:'Policy source',name:'source',value:rule?.source||'Project rule'}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=rule;if(!target){target={};state.permissionRules.push(target);}Object.assign(target,v);saveState();renderApp();showToast('Permission rule saved',`${target.action} will evaluate as ${target.decision} when its condition matches.`);}});
  }

  function editFileSafePath(index = -1) {
    const item=index>=0?state.fileSafePaths[index]:null;
    const creating=!item;
    editObjectDialog({title:creating?'Add FileSafe boundary':`Edit ${item.path}`,subtitle:'FileSafe paths use explicit read/write contracts, inheritance, and protected-path behavior.',object:item||{},fields:[
      {label:'Exact path or supported variable',name:'path',value:item?.path||'${projectRoot}',autofocus:true},{label:'Access',name:'access',value:item?.access||'Read only',type:'select',choices:['Read and write','Read only','Source-control tools only','Temporary artifacts only','Deny direct read']},{label:'Inheritance / owner',name:'inheritance',value:item?.inheritance||'Project root'},{label:'Status',name:'status',value:item?.status||'active',type:'select',choices:['active','attention','disabled']}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=item;if(!target){target={};state.fileSafePaths.push(target);}Object.assign(target,v);saveState();renderApp();showToast('FileSafe boundary saved',`${target.path} now has an explicit access contract.`);}});
  }

  function editBackupDestination(item = null) {
    const creating=!item;
    editObjectDialog({title:creating?'Add backup destination':`Configure ${item.name}`,subtitle:'Destinations include location, encryption, verification, health, and removal behavior.',object:item||{},fields:[
      {label:'Name',name:'name',value:item?.name||'',autofocus:true},{label:'Type',name:'type',value:item?.type||'Network storage',type:'select',choices:['Network storage','This device','S3-compatible storage','External drive']},{label:'Path / bucket',name:'path',value:item?.path||''},{label:'Encryption',name:'encryption',value:item?.encryption||'On',type:'select',choices:['On','OS protected','Provider managed','Off']}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=item;if(!target){target={id:uid('backup-destination',v.name),lastVerified:'Not yet'};state.backup.destinations.push(target);}Object.assign(target,v,{status:'ready'});saveState();renderApp();showToast('Backup destination saved',`${target.name} is ready for a write and restore verification.`);}});
  }

  function editBackupSchedule(item = null) {
    const creating=!item;
    editObjectDialog({title:creating?'Add backup schedule':`Edit ${item.name}`,subtitle:'Schedules specify backup type, time, destination, retention, and enabled state.',object:item||{},fields:[
      {label:'Name',name:'name',value:item?.name||'',autofocus:true},{label:'When',name:'when',value:item?.when||'2:00 AM'},{label:'Destination',name:'destination',value:item?.destination||state.backup.destinations[0]?.name,type:'select',choices:state.backup.destinations.map(d=>d.name)},{label:'Retention',name:'retention',value:item?.retention||'30 daily'},{label:'Enabled',name:'enabled',value:item?.enabled??true,type:'checkbox',full:true}
    ],onSave:(_v,form)=>{const v=readForm(form);let target=item;if(!target){target={id:uid('backup-schedule',v.name)};state.backup.schedules.push(target);}Object.assign(target,v);saveState();renderApp();showToast('Backup schedule saved',`${target.name} is ${target.enabled?'enabled':'disabled'}.`);}});
  }

  function editProjectSync(kind) {
    const P=state.projectSync;
    if(kind==='clients') return infoDrawer('Clients & continuity','Manage client roles, compatibility, last sync, and continuity eligibility.',P.clients.map(c=>[c.name,`${c.platform} · ${c.status} · ${c.role} · ${c.lastSync}`]),{primaryLabel:'Add client',onPrimary:()=>{showToast('Client enrollment','The full enrollment flow is owned by Project Syncing and Updates.','info');}});
    if(kind==='location') return editObjectDialog({title:'Project location & authority',subtitle:'Project path, server authority, execution host, sync mode, and conflict handling stay explicit.',object:P,wide:true,fields:[{label:'Project location',name:'location',value:P.location,full:true},{label:'Server host',name:'serverHost',value:P.serverHost},{label:'Execution host',name:'executionHost',value:P.executionHost},{label:'File authority',name:'fileAuthority',value:P.fileAuthority,type:'select',choices:['Server host','Current client','Repository remote']},{label:'Sync mode',name:'syncMode',value:P.syncMode},{label:'Conflict policy',name:'conflictPolicy',value:P.conflictPolicy,type:'textarea',full:true}]});
    if(kind==='continuity') return editObjectDialog({title:'Cross-device continuity',subtitle:'Choose which durable states may resume across clients.',object:P.continuity,fields:[{label:'Goals',name:'goals',value:P.continuity.goals,type:'checkbox',full:true},{label:'Chat threads',name:'chats',value:P.continuity.chats,type:'checkbox',full:true},{label:'Unsaved editor buffers',name:'unsavedEditors',value:P.continuity.unsavedEditors,type:'checkbox',full:true},{label:'Terminal sessions',name:'terminals',value:P.continuity.terminals,type:'checkbox',full:true},{label:'Active debugger',name:'activeDebug',value:P.continuity.activeDebug,type:'checkbox',full:true}]});
    return editProjectSync('location');
  }

  function dispatchAction(action, el, event) {
    recordAction(action);
    const value = ds(el,'value');
    switch (action) {
      /* navigation and ordinary settings */
      case 'home': goHome(); return;
      case 'navigate-domain': {
        const domain=getDomain(ds(el,'domain')); navigate(domain.id,domain.defaultWorkspace); return;
      }
      case 'navigate': navigate(ds(el,'domain'),ds(el,'workspace')); return;
      case 'jump-workspace': {
        const wsId = ds(el, 'workspace');
        if (wsId === state.workspace) {
          jumpToWorkspace(wsId);
        } else {
          navigate(state.domain, wsId);
        }
        return;
      }
      case 'toggle-rail': state.railOpen=!state.railOpen;renderApp();return;
      case 'toggle-resource-roster': state.resourceRosterOpen=!state.resourceRosterOpen;renderApp();return;
      case 'open-search': focusSettingsSearch(); return;
      case 'page-options': {
        const workspace = getWorkspace();
        const items = [];
        if (workspace?.sections?.length) {
          items.push({ label: 'Show all explanations', icon: 'info', onClick: () => showAllDetails(workspace) });
        }
        items.push(
          { label: 'Show advanced controls', icon: 'sliders', onClick: () => showToast('Advanced controls', 'Expert and advanced rows stay available in their owning sections.', 'info') },
          { label: 'Reset this section', icon: 'refresh', onClick: () => showToast('Reset requires confirmation', 'No settings were changed by this concept simulation.', 'warning') },
          { label: 'Copy deep link', icon: 'link', onClick: () => { navigator.clipboard?.writeText(location.href); showToast('Deep link copied', 'The current destination is encoded in the URL.'); } }
        );
        openMenu(el, items, 'Page options');
        return;
      }
      case 'project-menu': openMenu(el,[
        {label:'All Project Settings',icon:'settings',onClick:()=>navigate('projects','project-settings')},
        {label:'Project Location & Sync',icon:'network',onClick:()=>navigate('projects','project-sync')},
        {label:'History & Artifacts',icon:'history',onClick:()=>navigate('projects','project-history')},
        {separator:true},{label:'Settings Transfer',icon:'copy',onClick:()=>navigate('system','settings-transfer')}
      ],'Puppet Master');return;
      case 'scroll-section': {
        const sectionId = ds(el, 'section');
        const wsId = ds(el, 'workspace');
        if (wsId && wsId !== state.workspace) state.workspace = wsId;
        scrollToSection(sectionId);
        return;
      }
      case 'setting-details': {
        if (el.closest('.drawer-wrap,.overlay')) closeOverlay();
        const settingId = ds(el, 'setting');
        if (state.detailSetting === settingId) {
          closeDetailSetting();
          return;
        }
        openDetailSetting(settingId, ds(el, 'workspace') || state.workspace, ds(el, 'section'));
        return;
      }
      case 'close-details':
        closeDetailSetting();
        return;
      case 'show-all-details': showAllDetails(getWorkspace());return;
      case 'section-details': {
        const workspaceId=ds(el,'workspace')||state.workspace;
        const workspace=getDomain().workspaces.find(w=>w.id===workspaceId)||getWorkspace();
        const section=workspace.sections?.find(s=>s.id===ds(el,'section'));
        if(!section)return;openDrawer({title:section.label,subtitle:section.description||'Section guide',body:`<div class="workflow-list">${section.settings.map((s,i)=>workflowStep(i+1,s.label,s.description,'Ready','setting-details',{setting:s.id,workspace:workspace.id,section:section.id})).join('')}</div>`});return;
      }
      case 'toggle-setting': {
        const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;state.settings[id]=!settingValue(found.setting);state.changed[id]=true;rerender('Setting updated',`${found.setting.label} is now ${state.settings[id]?'on':'off'}.`);return;
      }
      case 'set-setting': {
        const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;state.settings[id]=value;state.changed[id]=true;rerender('Setting updated',`${found.setting.label} is now ${value}.`);return;
      }
      case 'step-setting': {
        const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;const current=Number(settingValue(found.setting))||0;const next=current+Number(ds(el,'step','1'));const min=found.setting.min??0,max=found.setting.max??100;state.settings[id]=Math.max(min,Math.min(max,next));state.changed[id]=true;rerender();return;
      }
      case 'toggle-multi-setting': {
        const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;const arr=[...(settingValue(found.setting)||[])],i=arr.indexOf(value);if(i>=0)arr.splice(i,1);else arr.push(value);state.settings[id]=arr;state.changed[id]=true;rerender();return;
      }
      case 'move-setting-item': {
        const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;const arr=[...(settingValue(found.setting)||[])];if(moveItem(arr,Number(ds(el,'index')),Number(ds(el,'direction')))){state.settings[id]=arr;state.changed[id]=true;rerender();}return;
      }
      case 'reset-setting': {
        const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;delete state.settings[id];delete state.changed[id];rerender('Default restored',`${found.setting.label} now uses its default value.`);return;
      }
      case 'open-resource-setting': {
        const found=findSettingGlobal(ds(el,'setting'));if(!found)return;infoDrawer(found.setting.label,found.setting.description,[['Current value',settingValue(found.setting)],['Owner',`${found.domain.label} › ${found.workspace.label}`],['Scope',found.setting.detail?.applies||'Project']],{intro:found.setting.detail?.what||found.setting.description,primaryLabel:'Open owner',onPrimary:()=>navigate(found.domain.id,found.workspace.id,{section:found.section.id,detailSetting:found.setting.id})});return;
      }
      case 'run-setting-action': {
        const found=findSettingGlobal(ds(el,'setting'));if(!found)return;
        if(found.setting.id==='restore-defaults'){
          confirmDialog('Restore default settings','Preview and restore application defaults while preserving provider credentials, project files, histories, and a rollback receipt?', 'Restore defaults',()=>{state.settings={};state.changed={};state.detailSetting=null;rerender('Defaults restored','Ordinary settings returned to defaults; owned resources and credentials were preserved.','warning');},true);return;
        }
        taskDrawer(found.setting.label,[['Preview affected state',found.setting.detail?.applies||'Current project'],['Validate prerequisites','Owner, scope, permissions, and rollback'],['Apply action','Preserve a receipt and changed settings']],{successTitle:'Action preview completed',successMessage:'No production state was changed by this concept.'});return;
      }
      case 'search-related': {
        const input = root.querySelector('[data-global-search], [data-hero-search]');
        if (input) {
          input.value = ds(el, 'query') || '';
          input.focus();
          openSearch(input);
        }
        return;
      }
      case 'search-result': return;

      /* provider manager */
      case 'select-provider': state.selectedProvider=ds(el,'provider');state.providerTab='overview';navigate('ai','providers');return;
      case 'provider-tab': case 'provider-tab-jump': state.providerTab=ds(el,'tab');rerender();return;
      case 'add-provider': openProviderSetup();return;
      case 'choose-provider-setup': {
        const p=providerById(ds(el,'provider'));closeOverlay();state.selectedProvider=p.id;state.providerTab=p.installed?(p.signedIn?'overview':'accounts'):'installation';navigate('ai','providers');return;
      }
      case 'install-provider': {
        const p=providerById(ds(el,'provider'));taskDrawer(`Install ${p.name}`,[['Verify official provider source',p.installSource],['Download and verify package','No silent install'],['Install on selected execution host','Preserve installation receipt'],['Detect CLI or connection','Then offer sign-in']],{onComplete:()=>{p.installed=true;p.version='Installed · verification pending';p.status='attention';p.statusLabel='Installed · Sign in';p.diagnostics.push('Official installation completed in concept session');saveState();}});return;
      }
      case 'reconnect-provider': {
        const p=providerById(ds(el,'provider'));taskDrawer(`Reconnect ${p.name}`,[['Open supported sign-in method',p.kind==='CLI'?'Provider CLI profile':'Browser sign-in'],['Validate authentication','Token or local credentials'],['Validate entitlement','Plan or product access'],['Run representative invocation','Exact default model']],{onComplete:()=>{p.installed=true;p.signedIn=true;p.status='active';p.statusLabel=`Active · ${Math.max(1,p.accounts.filter(a=>a.active).length)} account${p.accounts.filter(a=>a.active).length===1?'':'s'}`;saveState();}});return;
      }
      case 'test-provider': case 'test-provider-route': {
        const p=providerById(ds(el,'provider'));taskDrawer(`Test ${p.name}`,[['Installation or connection',p.version],['Authentication',p.signedIn?'Signed in':'Sign-in required'],['Product and model catalog',p.product],['Representative invocation',p.routing.defaultModel||'No model selected']],{successTitle:p.signedIn?'Provider ready':'Setup issue found',successMessage:p.signedIn?'Authentication and invocation checks passed.':'Install or sign in before this provider can route work.'});return;
      }
      case 'add-provider-account': editProviderAccount(providerById(ds(el,'provider')));return;
      case 'test-account': {
        const p=providerById(ds(el,'provider')),a=p.accounts.find(x=>x.id===ds(el,'account'));taskDrawer(`Test ${a?.nickname||'account'}`,[['Authentication',a?.method||'Configured method'],['Plan entitlement',a?.identity||'Connected account'],['Usage state',a?.usage||'Unknown'],['Invocation',p.models.find(m=>m.enabled)?.name||'No enabled model']],{successMessage:'The account result remains independent from provider installation state.'});return;
      }
      case 'move-account': {
        const p=providerById(ds(el,'provider')),id=ds(el,'account'),index=p.accounts.findIndex(a=>a.id===id);if(moveItem(p.accounts,index,Number(ds(el,'direction')))){p.routing.accountOrder=p.accounts.map(a=>a.id);rerender('Account priority updated',`${p.name} will try accounts in the displayed order.`);}return;
      }
      case 'account-menu': {
        const p=providerById(ds(el,'provider')),a=p.accounts.find(x=>x.id===ds(el,'account'));if(!a)return;
        openMenu(el,[{label:'Edit account',icon:'edit',onClick:()=>editProviderAccount(p,a)},{label:'Make default',icon:'check',onClick:()=>{p.accounts.forEach(x=>x.default=false);a.default=true;p.defaultAccount=a.id;rerender('Default account changed',a.nickname);}},{label:a.active?'Deactivate':'Activate',icon:a.active?'pause':'play',onClick:()=>{a.active=!a.active;rerender('Account state changed',`${a.nickname} is ${a.active?'active':'inactive'}.`);}},{separator:true},{label:'Remove account',icon:'trash',danger:true,onClick:()=>confirmDialog('Remove account',`Remove ${a.nickname} from ${p.name}? Credentials and account-specific routing will be removed from this concept.`, 'Remove',()=>{p.accounts=p.accounts.filter(x=>x.id!==a.id);if(p.defaultAccount===a.id)p.defaultAccount=p.accounts[0]?.id||null;rerender('Account removed',a.nickname,'warning');},true)}],a.nickname);return;
      }
      case 'edit-account-behavior': editProviderRouting(providerById(ds(el,'provider')));return;
      case 'toggle-model': {
        const p=providerById(ds(el,'provider')),m=p.models.find(x=>x.id===ds(el,'model'));if(!m)return;m.enabled=!m.enabled;rerender('Model eligibility changed',`${m.name} is ${m.enabled?'enabled':'disabled'} for routing.`);return;
      }
      case 'edit-model': {
        const p=providerById(ds(el,'provider')),m=p.models.find(x=>x.id===ds(el,'model'));if(m)editProviderModel(p,m);return;
      }
      case 'refresh-models': {
        const p=providerById(ds(el,'provider'));taskDrawer(`Refresh ${p.name} model catalog`,[['Check account and entitlement',p.product],['Read supported catalog','Preserve last-known models on failure'],['Map model-specific capabilities','Vision, browser, media, tools, context'],['Reconcile routing eligibility','Do not silently replace selected endpoints']],{onComplete:()=>{p.diagnostics.push(`Catalog refreshed at ${nowLabel()}`);saveState();}});return;
      }
      case 'edit-provider-default-model': editProviderRouting(providerById(ds(el,'provider')));return;
      case 'check-provider-update': {
        const p=providerById(ds(el,'provider'));taskDrawer(`Check ${p.name} update`,[['Detect installation method',p.installSource],['Check official source','No third-party installer'],['Compare detected version',p.version],['Preview update and rollback','Explicit user action required']],{successMessage:'The detected installation method remains the update authority.'});return;
      }
      case 'repair-provider': {
        const p=providerById(ds(el,'provider'));taskDrawer(`Repair ${p.name}`,[['Preserve account and routing settings','No credential export'],['Recheck installation','Official source'],['Reconnect supported authentication','No unsupported OAuth'],['Retest exact model endpoint',p.routing.defaultModel||'First enabled model']],{onComplete:()=>{p.status=p.signedIn?'active':'attention';p.statusLabel=p.signedIn?`Active · ${p.accounts.length} account${p.accounts.length===1?'':'s'}`:'Installed · Sign in';saveState();}});return;
      }
      case 'provider-menu': {
        const p=providerById(ds(el,'provider'));openMenu(el,[{label:'Manage accounts',icon:'users',onClick:()=>{state.providerTab='accounts';rerender();}},{label:'Models & capabilities',icon:'brain',onClick:()=>{state.providerTab='models';rerender();}},{label:'Routing & fallback',icon:'route',onClick:()=>{state.providerTab='routing';rerender();}},{label:'Installation & updates',icon:'download',onClick:()=>{state.providerTab='installation';rerender();}},{label:'Export diagnostics',icon:'download',onClick:()=>dispatchAction('export-provider-diagnostics',el,event)},{separator:true},{label:'Uninstall provider',icon:'trash',danger:true,disabled:p.id==='free-models'||!p.installed,onClick:()=>dispatchAction('uninstall-provider',el,event)}],p.name);return;
      }
      case 'uninstall-provider': {
        const p=providerById(ds(el,'provider'));confirmDialog(`Uninstall ${p.name}`,'Remove the local integration while preserving an exportable configuration receipt? Accounts and models will become unavailable.', 'Uninstall',()=>{p.installed=false;p.signedIn=false;p.status='not-installed';p.statusLabel='Not installed';rerender('Provider uninstalled',p.name,'warning');},true);return;
      }
      case 'export-provider-diagnostics': showToast('Diagnostics exported','A redacted provider readiness receipt was prepared.','info');return;

      /* Free Models: one Settings provider, nested routes */
      case 'select-free-route': state.selectedFreeRoute=ds(el,'route');if(ds(el,'openTab'))state.providerTab=ds(el,'openTab');rerender();return;
      case 'enable-free-route': {
        const r=freeRouteById(ds(el,'route'));r.enabled=true;r.status='ready';rerender('Free route enabled',`${r.name} controls are now available inside Free Models only.`);return;
      }
      case 'disable-free-route': {
        const r=freeRouteById(ds(el,'route'));confirmDialog(`Disable ${r.name}`,'The route will remain known but its models will disappear from operational selectors until re-enabled.', 'Disable',()=>{r.enabled=false;r.status='disabled';rerender('Free route disabled',r.name,'warning');},true);return;
      }
      case 'edit-free-route': {
        const r=freeRouteById(ds(el,'route'));editObjectDialog({title:`Configure ${r.name}`,subtitle:'Enabled free providers remain nested here; they never become peer provider tabs in Settings.',object:r,fields:[{label:'Sign-in / setup',name:'signIn',value:r.signIn},{label:'Usage limit',name:'limit',value:r.limit},{label:'Terms / privacy',name:'terms',value:r.terms,type:'textarea',full:true},{label:'Priority',name:'priority',value:r.priority,type:'number',number:true}],onSave:(_v,form)=>{const v=readForm(form);Object.assign(r,v,{priority:numberValue(v.priority,r.priority)});saveState();renderApp();showToast('Free route saved',`${r.name} remains contained inside Free Models.`);}});return;
      }
      case 'move-free-route': {
        const r=freeRouteById(ds(el,'route')),enabled=state.freeRoutes.filter(x=>x.enabled).sort((a,b)=>a.priority-b.priority),index=enabled.findIndex(x=>x.id===r.id);if(moveItem(enabled,index,Number(ds(el,'direction')))){enabled.forEach((x,i)=>x.priority=i+1);state.freeRoutes.sort((a,b)=>(a.enabled?0:1)-(b.enabled?0:1)||a.priority-b.priority);rerender('Free route priority updated','Operational pickers will still show the actual provider that runs each model.');}return;
      }
      case 'test-free-route': case 'reconnect-free-route': case 'refresh-free-route': case 'discover-free-route': {
        const r=freeRouteById(ds(el,'route'));taskDrawer(`${humanize(action)} · ${r.name}`,[['Validate nested route setup',r.signIn],['Refresh models',`${r.models.length} known`],['Check current limits',r.limit],['Run representative free invocation','Show actual provider attribution']],{onComplete:()=>{r.status='ready';r.enabled=true;saveState();}});return;
      }
      case 'test-all-free-routes': case 'refresh-all-free-models': taskDrawer(humanize(action),state.freeRoutes.filter(r=>r.enabled).map(r=>[r.name,`${r.models.length} models · ${r.limit}`]),{successMessage:'Every enabled free route was checked without adding provider tabs to Settings.'});return;
      case 'test-free-fallback': taskDrawer('Test Free Models fallback order',state.freeRoutes.filter(r=>r.enabled).sort((a,b)=>a.priority-b.priority).map(r=>[r.name,`Priority ${r.priority}`]),{successMessage:'The receipt reports the actual free provider and model selected.'});return;
      case 'refresh-free-limits': showToast('Limits refreshed','Free route limits and reset metadata were refreshed.');return;

      /* exact capability routes */
      case 'select-web-route': state.selectedWebRoute=ds(el,'route');state.webRouteTab='route';rerender();return;
      case 'web-route-tab': state.webRouteTab=ds(el,'tab');rerender();return;
      case 'edit-web-route': configureRoute('web',webRouteById(ds(el,'route')));return;
      case 'select-media-route': state.selectedMediaRoute=ds(el,'route');state.mediaRouteTab='route';rerender();return;
      case 'media-route-tab': state.mediaRouteTab=ds(el,'tab');rerender();return;
      case 'edit-media-route': configureRoute('media',mediaRouteById(ds(el,'route')));return;
      case 'edit-route-policy': {
        const kind=ds(el,'kind'),route=kind==='media'?mediaRouteById(ds(el,'route')):webRouteById(ds(el,'route'));configureRoutePolicy(kind,route);return;
      }
      case 'add-route-fallback': {
        const kind=ds(el,'kind'),route=kind==='media'?mediaRouteById(ds(el,'route')):webRouteById(ds(el,'route'));configureFallback(kind,route);return;
      }
      case 'test-web-route': case 'run-web-test-lab': {
        const r=webRouteById(ds(el,'route'));taskDrawer(`Test ${r.name} route`,[['Resolve exact endpoint',`${r.primary.provider} · ${r.primary.model}`],['Validate account and policy',r.primary.account||'No account'],['Run representative request',r.description],['Write route receipt','Provider, model, fallback, duration, and typed errors']],{successMessage:`${r.name} completed through ${r.primary.provider} · ${r.primary.model}.`});return;
      }
      case 'test-media-route': case 'run-media-test-lab': {
        const r=mediaRouteById(ds(el,'route'));taskDrawer(`Test ${r.name} route`,[['Resolve exact endpoint',`${r.primary.provider} · ${r.primary.model}`],['Validate output policy',Object.keys(r.output||{}).join(', ')],['Run safe sample','No production asset'],['Write artifact receipt','Model, format, destination, duration']],{successMessage:`${r.name} completed through ${r.primary.provider} · ${r.primary.model}.`});return;
      }
      case 'test-all-web-routes': taskDrawer('Test Web & Research routes',state.webRoutes.map(r=>[r.name,`${r.primary.provider} · ${r.primary.model}`]));return;
      case 'test-all-media-routes': taskDrawer('Test Media & Output routes',state.mediaRoutes.map(r=>[r.name,`${r.primary.provider} · ${r.primary.model}`]));return;
      case 'web-route-wizard': case 'media-route-wizard': {
        const kind=action.startsWith('web')?'web':'media',routes=kind==='web'?state.webRoutes:state.mediaRoutes;
        openDrawer({title:`Configure ${kind==='web'?'Web & Research':'Media & Output'} capability`,subtitle:'Choose a capability first; endpoint, fallback, policy, test, and diagnostics remain in one manager.',body:`<div class="workflow-list">${routes.map((r,i)=>workflowStep(i+1,r.name,`${r.primary.provider} · ${r.primary.model}`,r.status==='ready'?'Ready':'Setup',kind==='web'?'select-web-route':'select-media-route',{route:r.id})).join('')}</div>`});return;
      }
      case 'preview-route-config': {
        const kind=ds(el,'kind'),r=kind==='media'?mediaRouteById(ds(el,'route')):webRouteById(ds(el,'route'));infoDrawer(`${r.name} effective route`,'Preview before changing or invoking anything',[['Primary',`${r.primary.provider} · ${r.primary.model}`],['Account',r.primary.account||'None'],['Fallback order',(r.fallbacks||[]).map(f=>`${f.provider} · ${f.model}`).join(' → ')||'None'],['Policy',JSON.stringify(kind==='media'?r.output:r.policy)]],{intro:'Capabilities are resolved at the exact model or built-in endpoint level, not the provider level.'});return;
      }
      case 'route-test-menu': openMenu(el,[{label:'Run normal test',icon:'play',onClick:()=>dispatchAction(ds(el,'kind')==='media'?'test-media-route':'test-web-route',el,event)},{label:'Simulate primary failure',icon:'alert',onClick:()=>taskDrawer('Fallback simulation',[['Fail primary endpoint','Injected typed failure'],['Evaluate ordered fallbacks','Capability and policy compatibility'],['Select next eligible route','Preserve attribution'],['Write receipt','Why the fallback ran']])},{label:'View last receipt',icon:'file',onClick:()=>genericActionDrawer('open-route-receipt',el)}],'Route test');return;

      /* Back Seat Driver exact route */
      case 'set-bsd-field': state.bsd[ds(el,'field')]=value;rerender('Back Seat Driver updated',`${humanize(ds(el,'field'))}: ${value}`);return;
      case 'test-bsd-route': taskDrawer('Test Back Seat Driver route',[['Resolve exact provider and account',`${state.bsd.provider} · ${state.bsd.account}`],['Resolve exact model',state.bsd.model],['Validate context and intervention policy',`${state.bsd.contexts.length} contexts`],['Simulate fallback',`${state.bsd.fallbackProvider} · ${state.bsd.fallbackModel}`]],{successMessage:'BSD route, usage boundary, and fallback are fully attributable.'});return;
      case 'preview-bsd': infoDrawer('Back Seat Driver effective configuration','The advisor route is independent from the primary task route.',[['Mode',state.bsd.mode],['Primary',`${state.bsd.provider} · ${state.bsd.model}`],['Account',state.bsd.account],['Fallback',`${state.bsd.fallbackProvider} · ${state.bsd.fallbackModel}`],['Sensitivity',state.bsd.sensitivity],['Usage boundary',state.bsd.usageBoundary],['Intervention',state.bsd.intervention],['Contexts',state.bsd.contexts.join(', ')]]);return;
      case 'edit-bsd-contexts': editObjectDialog({title:'Back Seat Driver contexts',subtitle:'Choose where the advisor observes and when its route may spend usage.',object:state.bsd,fields:[{label:'Enabled contexts',name:'contexts',value:state.bsd.contexts.join(', '),full:true},{label:'Usage boundary',name:'usageBoundary',value:state.bsd.usageBoundary},{label:'Intervention behavior',name:'intervention',value:state.bsd.intervention,type:'textarea',full:true}],onSave:(_v,form)=>{const v=readForm(form);state.bsd.contexts=listValue(v.contexts);state.bsd.usageBoundary=v.usageBoundary;state.bsd.intervention=v.intervention;saveState();renderApp();showToast('BSD contexts saved','Observation scope and usage behavior were updated.');}});return;
      case 'edit-bsd-policy': dispatchAction('edit-bsd-contexts',el,event);return;
      case 'open-provider-from-bsd': {
        const name=ds(el,'providerName'),p=state.providers.find(x=>x.name===name);if(p){state.selectedProvider=p.id;state.providerTab='overview';navigate('ai','providers');}else showToast('Provider not found',`${name} is not a configured Settings provider.`,'warning');return;
      }

      /* Toolchain & extensions */
      case 'select-tool-resource': state.toolTab=ds(el,'kind');state.selectedTool[state.toolTab]=ds(el,'id');rerender();return;
      case 'tool-tab': state.toolTab=ds(el,'tab');rerender();return;
      case 'tool-detail-tab': case 'tool-detail-tab-jump': state.toolDetailTab[ds(el,'kind')]=ds(el,'tab');rerender();return;
      case 'add-tool-resource': editToolResource(ds(el,'kind'));return;
      case 'edit-tool-resource': {
        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(item)editToolResource(kind,item);return;
      }
      case 'test-tool-resource': {
        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(!item)return;
        const specifics=kind==='lsps'?[['Resolve executable',item.command],['Start local language process',(item.args||[]).join(' ')||'No arguments'],['Detect workspace',(item.rootMarkers||[]).join(', ')],['Open test document',item.language]]:kind==='formatters'?[['Resolve package or executable',item.executable],['Load config and ignore',`${item.config} · ${item.ignore}`],['Format safe fixture',(item.languages||[]).join(', ')],['Compare preview','No production file changed']]:kind==='mcps'?[['Validate transport',item.transport==='stdio'?`Local process: ${item.command}`:`Streamable HTTP: ${item.url}`],['Resolve credentials','Credential mappings remain redacted'],['List exposed tools',`${item.tools} currently known`],['Apply permission policy',item.permissions]]:[['Resolve resource owner',item.owner||item.source||'Puppet Master'],['Validate configuration','Schema and compatibility'],['Run safe sample','No external mutation'],['Write receipt','Status and diagnostics']];
        taskDrawer(`Test ${item.name}`,specifics,{onComplete:()=>{item.status=kind==='skills'||kind==='plugins'?'enabled':'ready';item.lastTest='Passed just now';saveState();}});return;
      }
      case 'restart-tool-resource': {
        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));taskDrawer(`Restart ${item?.name||'resource'}`,[['Stop current process','Graceful timeout'],['Preserve diagnostics','Logs remain inspectable'],['Start with current configuration','No hidden defaults'],['Re-run health test','Update status']],{onComplete:()=>{if(item){item.status='ready';item.lastTest='Passed after restart';saveState();}}});return;
      }
      case 'remove-tool-resource': {
        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(!item)return;confirmDialog(`Remove ${item.name}`,'Remove this resource configuration? The underlying package or executable is not silently uninstalled.', 'Remove',()=>{state.toolchain[kind]=state.toolchain[kind].filter(x=>x.id!==item.id);state.selectedTool[kind]=state.toolchain[kind][0]?.id||null;rerender('Resource removed',item.name,'warning');},true);return;
      }
      case 'tool-resource-menu': {
        const kind=ds(el,'kind'),item=toolById(kind,ds(el,'id'));if(!item)return;openMenu(el,[{label:'Edit configuration',icon:'edit',onClick:()=>editToolResource(kind,item)},{label:'Test resource',icon:'test',onClick:()=>dispatchAction('test-tool-resource',el,event)},{label:'Restart / refresh',icon:'refresh',onClick:()=>dispatchAction('restart-tool-resource',el,event)},{label:'Export diagnostics',icon:'download',onClick:()=>showToast('Diagnostics exported',`${item.name} logs and configuration were redacted and prepared.`,'info')},{separator:true},{label:'Remove configuration',icon:'trash',danger:true,onClick:()=>dispatchAction('remove-tool-resource',el,event)}],item.name);return;
      }
      case 'edit-lsp-initialization': {
        const item=toolById('lsps',ds(el,'id'));if(item)editObjectDialog({title:`${item.name} initialization`,subtitle:'Initialization options are applied after executable and workspace discovery.',object:item,fields:[{label:'Initialization JSON',name:'initialization',value:item.initialization||'{\n  "checkOnSave": true\n}',type:'textarea',full:true},{label:'Restart after save',name:'restartAfterSave',value:true,type:'checkbox',full:true}],onSave:(_v,form)=>{const v=readForm(form);item.initialization=v.initialization;saveState();renderApp();showToast('Initialization saved','Language server restart is ready.');}});return;
      }
      case 'edit-formatter-behavior': {
        const item=toolById('formatters',ds(el,'id'));if(item)editToolResource('formatters',item);return;
      }
      case 'preview-formatter': {
        const item=toolById('formatters',ds(el,'id'));infoDrawer(`${item?.name||'Formatter'} preview`,'Formatting runs against a safe in-memory fixture.',[['Executable',item?.executable],['Arguments',(item?.args||[]).join(' ')],['Config',item?.config],['Ignore',item?.ignore],['Languages',(item?.languages||[]).join(', ')]],{extra:'<div class="prompt-box">Before: const  x={a:1}\nAfter:  const x = { a: 1 };</div>'});return;
      }
      case 'manage-mcp-tools': {
        const item=toolById('mcps',ds(el,'id'));infoDrawer(`${item?.name||'MCP'} exposed tools`,'Refresh, inspect, and permission each tool without changing transport setup.',[['Transport',item?.transport],['Connection',item?.transport==='stdio'?item.command:item?.url],['Known tools',item?.tools],['Permission policy',item?.permissions],['Scope',item?.scope]],{primaryLabel:'Refresh tools',onPrimary:()=>dispatchAction('refresh-mcp-tools',el,event)});return;
      }
      case 'refresh-mcp-tools': {
        const item=toolById('mcps',ds(el,'id'));taskDrawer(`Refresh ${item?.name||'MCP'} tools`,[['Connect using configured transport',item?.transport==='stdio'?item?.command:item?.url],['Negotiate protocol and capabilities','No write calls'],['Read tool schemas',`${item?.tools||0} current tools`],['Reapply permissions',item?.permissions||'Project profile']],{onComplete:()=>{if(item){item.tools=Math.max(1,item.tools||0);item.status='ready';saveState();}}});return;
      }
      case 'record-shortcut': {
        const item=toolById('commands',ds(el,'id'));openDialog({title:`Record shortcut · ${item?.name||'Command'}`,subtitle:'Press a key combination. Conflicts are checked before assignment.',body:`<div class="key-recorder" tabindex="0" data-autofocus>Press shortcut…</div>${formField('Shortcut','shortcut',item?.shortcut||'',{help:'Example: Ctrl+Alt+T'})}`,saveLabel:'Assign shortcut',onSave:(_v,form)=>{const v=readForm(form);if(item)item.shortcut=v.shortcut;saveState();renderApp();showToast('Shortcut assigned',v.shortcut||'Shortcut cleared');}});return;
      }
      case 'check-shortcut-conflicts': {
        const item=toolById('commands',ds(el,'id'));taskDrawer(`Check shortcut · ${item?.name||'Command'}`,[['Normalize shortcut',item?.shortcut||'Unassigned'],['Check application commands','No exact conflict'],['Check platform-reserved keys','Available'],['Check project overrides','No override']],{successMessage:'No blocking shortcut conflict was found.'});return;
      }
      case 'run-command-demo': {
        const item=toolById('commands',ds(el,'id'));taskDrawer(`Run command demo · ${item?.name||'Command'}`,[['Parse command',item?.command],['Resolve scope and permissions',item?.category],['Preview affected state','No production mutation'],['Return command receipt','Input, output, duration']],{successMessage:`${item?.command||'Command'} completed in the concept sandbox.`});return;
      }
      case 'update-skill': {
        const item=toolById('skills',ds(el,'id'));taskDrawer(`Update ${item?.name||'skill'}`,[['Check source',item?.source],['Compare version',item?.version],['Validate requirements',item?.requirements],['Install and verify','Preserve rollback']],{onComplete:()=>{if(item){item.version=`${item.version}+`;item.status='enabled';saveState();}}});return;
      }
      case 'manage-plugin-permissions': {
        const item=toolById('plugins',ds(el,'id'));editObjectDialog({title:`${item?.name||'Plugin'} permissions`,subtitle:'Plugin permissions are explicit, reviewable, and cannot exceed the effective Safety & Permissions profile.',object:item||{},fields:[{label:'Permissions',name:'permissions',value:(item?.permissions||[]).join(', '),type:'textarea',full:true},{label:'Enabled',name:'enabled',value:(item?.status||'disabled')==='enabled',type:'checkbox',full:true}],onSave:(_v,form)=>{const v=readForm(form);item.permissions=listValue(v.permissions);item.status=v.enabled?'enabled':'disabled';saveState();renderApp();showToast('Plugin permissions saved',item.name);}});return;
      }
      case 'toolchain-discover': taskDrawer('Discover project toolchain',[['Inspect project manifests','Package, language, and config files'],['Detect installed executables','Current host and environment'],['Compare configured resources','No silent additions'],['Propose setup','User can review every resource']],{successMessage:'Discovery suggestions are ready to review.'});return;
      case 'clear-tool-logs': showToast('Logs cleared','Current resource logs were cleared; durable receipts remain.','info');return;
      case 'export-tool-logs': showToast('Logs exported','A redacted resource log bundle was prepared.','info');return;
      case 'open-tool-owner': {
        const owner=ds(el,'owner');if(/mcp/i.test(owner))navigate('code','toolchain');else if(/plugin/i.test(owner))navigate('code','toolchain');else infoDrawer('Tool owner',owner,[['Owner',owner],['Configuration workspace','Toolchain & Extensions'],['Permission owner','Safety & Permissions']]);return;
      }

      /* Testing & Debug */
      case 'testing-tab': state.testingTab=ds(el,'tab');rerender();return;
      case 'select-test-profile': state.selectedTestProfile=ds(el,'profile');rerender();return;
      case 'add-test-profile': editTestProfile();return;
      case 'edit-test-profile': editTestProfile(state.testProfiles.find(p=>p.id===ds(el,'profile')));return;
      case 'run-test-profile': {
        const p=state.testProfiles.find(x=>x.id===ds(el,'profile'))||state.testProfiles[0];taskDrawer(`Run ${p.name}`,p.stages.map(s=>[s,'Profile stage']),{successMessage:`${p.name} completed with ${p.evidence}.`});return;
      }
      case 'preview-test-plan': {
        const p=state.testProfiles.find(x=>x.id===ds(el,'profile'));infoDrawer(`${p?.name||'Testing'} plan`,p?.description,[['Trigger',p?.trigger],['Stages',(p?.stages||[]).join(' → ')],['Browser',p?.browser],['Native',p?.native],['Evidence',p?.evidence]]);return;
      }
      case 'select-debug-profile': state.selectedDebugProfile=ds(el,'profile');rerender();return;
      case 'add-debug-profile': editDebugProfile();return;
      case 'edit-debug-profile': editDebugProfile(state.debugProfiles.find(p=>p.id===ds(el,'profile')));return;
      case 'test-debug-profile': case 'launch-debug-profile': {
        const p=state.debugProfiles.find(x=>x.id===ds(el,'profile'));taskDrawer(`${action==='launch-debug-profile'?'Launch':'Test'} ${p?.name||'debug profile'}`,[['Resolve adapter',p?.adapter],['Resolve program and working directory',`${p?.program} · ${p?.cwd}`],['Launch with redacted environment',(p?.env||[]).join(', ')||'No variables'],['Capture stop and output','Debugger receipt']],{successMessage:'Debug session launched and stopped safely in the concept.'});return;
      }
      case 'edit-test-triggers': case 'edit-failure-policy': case 'edit-browser-testing': case 'edit-visual-testing': case 'edit-native-testing': case 'edit-runtime-testing': case 'edit-evidence-policy': {
        const title=humanize(action.replace(/^edit-/,''));editObjectDialog({title,subtitle:'These settings are fully configurable and apply through testing profiles and Goal completion gates.',object:state,wide:true,fields:[{label:'Mode',name:`config_${slug(action)}`,value:state[`config_${slug(action)}`]||'Auto',type:'select',choices:['Auto','On','Off']},{label:'Behavior / policy',name:`notes_${slug(action)}`,value:state[`notes_${slug(action)}`]||'Use the selected profile and preserve evidence on failure.',type:'textarea',full:true}],onSave:(_v,form)=>{const v=readForm(form);Object.assign(state,v);saveState();renderApp();showToast(`${title} saved`,'Testing policy was updated.');}});return;
      }
      case 'simulate-test-gate': taskDrawer('Verification gate simulator',[['Classify hypothetical change','GUI + provider routing'],['Resolve required profile','Thorough verification'],['Build stage list','Browser, unit, integration, visual, native'],['Preview completion gate','No real tests run']],{successMessage:'The effective test plan is ready for review.'});return;
      case 'run-native-smoke': taskDrawer('Native application smoke',[['Build current target','Compile and capture diagnostics'],['Launch application','Window and renderer'],['Exercise core interaction','Open, edit, save, close'],['Shutdown cleanly','No orphan process']],{successMessage:'Native smoke stages passed in the simulated receipt.'});return;
      case 'manage-browser-workflows': infoDrawer('Browser workflow catalog','Create, edit, reorder, and run reusable browser test flows.',[['Settings navigation','Enabled'],['Complex managers','Enabled'],['Menus, dialogs, hover & motion','Enabled'],['Responsive layouts','Enabled']],{primaryLabel:'Create workflow',onPrimary:()=>showToast('Workflow created','A new editable browser workflow was added to the concept.','info')});return;
      case 'open-test-history': infoDrawer('Testing history','Receipts remain attributable to profile, environment, trigger, and changed scope.',[['Today · 11:42 AM','Thorough verification · Passed'],['Yesterday','Fast feedback · Passed'],['Aug 22','Release candidate · Repaired and passed']]);return;

      /* Memory */
      case 'memory-tab': state.memoryTab=ds(el,'tab');rerender();return;
      case 'select-memory': state.selectedMemory=ds(el,'memory');rerender();return;
      case 'set-memory-filter': state.memoryFilter=ds(el,'filter');rerender();return;
      case 'add-memory': editMemory();return;
      case 'edit-memory': editMemory(state.memories.find(m=>m.id===ds(el,'memory')));return;
      case 'toggle-memory-pin': {
        const m=state.memories.find(x=>x.id===ds(el,'memory'));if(m){m.pinned=!m.pinned;rerender(m.pinned?'Memory pinned':'Memory unpinned',m.title);}return;
      }
      case 'forget-memory': {
        const m=state.memories.find(x=>x.id===ds(el,'memory'));if(!m)return;confirmDialog('Forget memory',`Remove “${m.title}” from its store? A deletion receipt remains in audit history.`, 'Forget',()=>{state.memories=state.memories.filter(x=>x.id!==m.id);state.selectedMemory=state.memories[0]?.id||null;rerender('Memory forgotten',m.title,'warning');},true);return;
      }
      case 'move-memory': {
        const m=state.memories.find(x=>x.id===ds(el,'memory')),i=state.memories.indexOf(m);if(moveItem(state.memories,i,-1))rerender('Memory priority updated',m.title);return;
      }
      case 'memory-menu': {
        const m=state.memories.find(x=>x.id===ds(el,'memory'));if(!m)return;openMenu(el,[{label:'Edit memory',icon:'edit',onClick:()=>editMemory(m)},{label:m.pinned?'Unpin':'Pin',icon:'pin',onClick:()=>{m.pinned=!m.pinned;rerender('Memory updated',m.title);}},{label:'View source',icon:'file',onClick:()=>dispatchAction('view-memory-source',el,event)},{separator:true},{label:'Forget memory',icon:'trash',danger:true,onClick:()=>dispatchAction('forget-memory',el,event)}],m.title);return;
      }
      case 'view-memory-source': {
        const m=state.memories.find(x=>x.id===ds(el,'memory'));infoDrawer(`${m?.title||'Memory'} source`,'Source and current memory text remain distinct.',[['Store',m?.store],['Type',m?.type],['Source',m?.source],['Updated',m?.updated],['Confidence',m?.confidence]],{extra:`<div class="prompt-box">${escapeHtml(m?.text||'')}</div>`});return;
      }
      case 'run-memory-retrieval': case 'test-memory-retrieval': taskDrawer('Memory retrieval test',[['Parse query',document.getElementById('memory-query')?.value||'Current context'],['Search eligible stores','Scope and privacy first'],['Rank candidates','Relevance, recency, confidence, pin'],['Explain selection','Source and exclusion reasons']],{successMessage:'Retrieval returned attributed memories with exclusion reasons.'});return;
      case 'manage-memory-stores': infoDrawer('Memory stores','Create, scope, export, clear, and inspect stores independently.',[['Project memory','5 items · shared by project'],['User memory','12 items · private user scope'],['Goal memory','2 active Goal stores'],['Thread memory','Current and archived threads']],{primaryLabel:'Add store',onPrimary:()=>showToast('Store wizard opened','Choose scope, retention, privacy, and allowed sources.','info')});return;
      case 'edit-memory-sources': case 'edit-retrieval-policy': case 'edit-memory-retention': case 'edit-memory-privacy': case 'manage-memory-conflicts': {
        const title=humanize(action.replace(/^(edit|manage)-/,''));editObjectDialog({title,subtitle:'Memory configuration includes stores, sources, retrieval, conflicts, retention, decay, privacy, and access.',object:state,wide:true,fields:[{label:'Policy',name:`memory_${slug(action)}`,value:state[`memory_${slug(action)}`]||'Balanced and explainable',type:'select',choices:['Balanced and explainable','Strict project only','User-directed only','Disabled']},{label:'Detailed behavior',name:`memory_notes_${slug(action)}`,value:state[`memory_notes_${slug(action)}`]||'Preserve source attribution and provide edit/forget controls.',type:'textarea',full:true}],onSave:(_v,form)=>{Object.assign(state,readForm(form));saveState();renderApp();showToast(`${title} saved`,'Memory management policy was updated.');}});return;
      }
      case 'review-memory-cleanup': infoDrawer('Memory cleanup review','Nothing is deleted until reviewed or covered by an explicit retention policy.',[['Expired candidates','3'],['Low-confidence candidates','2'],['Conflicting records','1'],['Pinned records','Never automatic']],{primaryLabel:'Open cleanup queue',onPrimary:()=>showToast('Cleanup queue opened','Candidate records remain reversible until confirmed.','info')});return;
      case 'run-memory-coverage-audit': taskDrawer('Memory inventory coverage audit',[['Inventory stores','Project, user, Goal, thread'],['Check source attribution','Every active record'],['Check edit/forget controls','No orphan records'],['Check retention and conflicts','Explain every disposition']],{successMessage:'Shared inventory coverage is complete and openable.'});return;
      case 'open-memory-library': state.memoryTab='memories';navigate('memory','context-memory');return;
      case 'open-memory-retention': state.memoryTab='retention';navigate('memory','context-memory');return;
      case 'open-memory-coverage': state.memoryTab='coverage';navigate('memory','context-memory');return;
      case 'open-context-composition': infoDrawer('Current context composition','Inspect loaded sources, active window, cache use, and compaction boundaries.',[['Current window','62% used'],['Tokens loaded','118K'],['Cache hit','74%'],['Project sources','42%'],['Thread history','31%'],['Tool receipts','27%']]);return;

      /* Goals & automation */
      case 'goal-tab': state.goalTab=ds(el,'tab');rerender();return;
      case 'select-goal-template': state.selectedGoalTemplate=ds(el,'template');rerender();return;
      case 'select-active-goal': state.selectedGoal=ds(el,'goal');rerender();return;
      case 'create-goal-template': editGoalTemplate();return;
      case 'edit-goal-template': editGoalTemplate(state.goalTemplates.find(t=>t.id===ds(el,'template')));return;
      case 'duplicate-goal-template': {
        const t=state.goalTemplates.find(x=>x.id===ds(el,'template'));if(t){const copy=clone(t);copy.id=uid('goal-template',`${t.name}-copy`);copy.name=`${t.name} Copy`;state.goalTemplates.push(copy);state.selectedGoalTemplate=copy.id;rerender('Template duplicated',copy.name);}return;
      }
      case 'goal-template-menu': {
        const t=state.goalTemplates.find(x=>x.id===ds(el,'template'));if(!t)return;openMenu(el,[{label:'Edit template',icon:'edit',onClick:()=>editGoalTemplate(t)},{label:'Duplicate',icon:'copy',onClick:()=>dispatchAction('duplicate-goal-template',el,event)},{label:'Preview flow',icon:'eye',onClick:()=>dispatchAction('preview-goal-template',el,event)},{label:'Start Goal',icon:'rocket',onClick:()=>dispatchAction('start-goal-from-template',el,event)}],t.name);return;
      }
      case 'preview-goal-template': {
        const t=state.goalTemplates.find(x=>x.id===ds(el,'template'));infoDrawer(`${t?.name||'Goal'} flow`,t?.description,[['Persona',t?.persona],['Route',t?.route],['Phases',(t?.phases||[]).join(' → ')],['Checkpoints',t?.checkpoints],['Subagents',t?.subagents],['Verification',t?.verification],['Evidence',t?.evidence]]);return;
      }
      case 'start-goal-from-template': case 'start-new-goal': {
        const t=state.goalTemplates.find(x=>x.id===ds(el,'template'))||state.goalTemplates[0];openDialog({title:'Start Goal',subtitle:'Confirm objective, template, exact route, persona, completion gate, and evidence before starting.',wide:true,body:formGrid([{label:'Goal name',name:'name',value:`New ${t?.name||'Implementation'} Goal`,autofocus:true},{label:'Objective',name:'objective',value:t?.description||'',type:'textarea',full:true},{label:'Template',name:'template',value:t?.name||'',type:'select',choices:state.goalTemplates.map(x=>x.name)},{label:'Persona',name:'persona',value:t?.persona||'Puppet Master'},{label:'Route',name:'route',value:t?.route||'Balanced coding route'},{label:'Require verification before completion',name:'verify',value:true,type:'checkbox',full:true}]),saveLabel:'Start Goal',onSave:(_v,form)=>{const v=readForm(form);const g={id:uid('goal',v.name),name:v.name,state:'Running',phase:'Plan',progress:4,route:v.route,persona:v.persona,checkpoint:'Not yet',updated:'Now'};state.activeGoals.unshift(g);state.selectedGoal=g.id;state.goalTab='active';saveState();renderApp();showToast('Goal started',`${g.name} is running with ${g.persona}.`);}});return;
      }
      case 'pause-goal': case 'resume-goal': case 'stop-goal': {
        const g=state.activeGoals.find(x=>x.id===ds(el,'goal'));if(!g)return;const next=action==='pause-goal'?'Paused':action==='resume-goal'?'Running':'Stopped';g.state=next;g.updated='Now';rerender(`Goal ${next.toLowerCase()}`,g.name,next==='Stopped'?'warning':'success');return;
      }
      case 'open-goal-details': {
        const g=state.activeGoals.find(x=>x.id===ds(el,'goal'));infoDrawer(g?.name||'Goal','Durable state remains resumable across threads and devices.',[['State',g?.state],['Phase',g?.phase],['Progress',`${g?.progress}%`],['Route',g?.route],['Persona',g?.persona],['Checkpoint',g?.checkpoint],['Updated',g?.updated]],{primaryLabel:g?.state==='Paused'?'Resume':'Open Goal',onPrimary:()=>{if(g?.state==='Paused'){g.state='Running';rerender('Goal resumed',g.name);}}});return;
      }
      case 'edit-goal-route': {
        const g=state.activeGoals.find(x=>x.id===ds(el,'goal'));if(g)editObjectDialog({title:`${g.name} route`,subtitle:'Change future work routing without rewriting completed receipts.',object:g,fields:[{label:'Exact route',name:'route',value:g.route},{label:'Persona',name:'persona',value:g.persona},{label:'Apply to',name:'applyTo',value:'Future work only',type:'select',choices:['Future work only','Current phase after checkpoint']}],onSave:(_v,form)=>{const v=readForm(form);g.route=v.route;g.persona=v.persona;saveState();renderApp();showToast('Goal route updated',g.name);}});return;
      }
      case 'manage-goal-phases': case 'edit-goal-defaults': case 'edit-goal-checkpoints': case 'edit-subagent-policy': case 'edit-goal-continuity': case 'edit-goal-recovery': case 'edit-goal-verification': case 'edit-goal-evidence': {
        const title=humanize(action.replace(/^(manage|edit)-/,''));editObjectDialog({title,subtitle:'Goal behavior is explicit, resumable, and tied to checkpoints, receipts, and completion gates.',object:state,wide:true,fields:[{label:'Policy',name:`goal_${slug(action)}`,value:state[`goal_${slug(action)}`]||'Project default'},{label:'Detailed behavior',name:`goal_notes_${slug(action)}`,value:state[`goal_notes_${slug(action)}`]||'Preserve durable state, continue automatically after bounded checkpoints, and stop only for typed blockers.',type:'textarea',full:true}],onSave:(_v,form)=>{Object.assign(state,readForm(form));saveState();renderApp();showToast(`${title} saved`,'Goal automation settings were updated.');}});return;
      }
      case 'preview-goal-flow': case 'preview-goal-routing': infoDrawer(humanize(action), 'Preview the effective Goal path before changing anything.', [['Template',state.goalTemplates.find(t=>t.id===state.selectedGoalTemplate)?.name],['Default persona','Puppet Master'],['Model route','Balanced coding route'],['Phases','Plan → Build → Test → Audit → Deliver'],['Checkpoint policy','At phase boundaries'],['Completion','Verification receipt required']]);return;
      case 'simulate-goal-recovery': taskDrawer('Goal recovery simulation',[['Pause at safe checkpoint','Persist phase and cursor'],['Simulate host or thread loss','No state kept only in context'],['Reconnect project and provider state','Resolve current authoritative host'],['Resume from durable receipt','Do not redo completed work']],{successMessage:'Goal resumed from durable state without losing completed phases.'});return;

      /* Personas & crews */
      case 'persona-tab': state.personaTab=ds(el,'tab');rerender();return;
      case 'select-persona': state.selectedPersona=ds(el,'persona');rerender();return;
      case 'set-persona-filter': state.personaFilter=ds(el,'filter');rerender();return;
      case 'create-persona': editPersona();return;
      case 'edit-persona': {
        const p=state.personas.find(x=>x.id===ds(el,'persona'));if(p){if(p.locked)showToast('Core persona is protected','Duplicate it to create an editable custom persona.','warning');else editPersona(p);}return;
      }
      case 'duplicate-persona': {
        const p=state.personas.find(x=>x.id===ds(el,'persona'));if(p)editPersona(p,true);return;
      }
      case 'delete-persona': {
        const p=state.personas.find(x=>x.id===ds(el,'persona'));if(!p)return;if(p.locked){showToast('Core persona cannot be deleted','Duplicate or change defaults instead.','warning');return;}confirmDialog('Delete persona',`Delete ${p.name}? Crew references will be shown before removal.`, 'Delete',()=>{state.personas=state.personas.filter(x=>x.id!==p.id);state.selectedPersona=state.personas[0]?.id||null;rerender('Persona deleted',p.name,'warning');},true);return;
      }
      case 'persona-menu': {
        const p=state.personas.find(x=>x.id===ds(el,'persona'));if(!p)return;openMenu(el,[{label:p.locked?'View protected definition':'Edit persona',icon:'edit',onClick:()=>dispatchAction('edit-persona',el,event)},{label:'Duplicate as custom',icon:'copy',onClick:()=>dispatchAction('duplicate-persona',el,event)},{label:'Preview behavior',icon:'eye',onClick:()=>dispatchAction('preview-persona',el,event)},{label:'Assign to crew',icon:'users',onClick:()=>dispatchAction('assign-persona-crew',el,event)},...(p.locked?[]:[{separator:true},{label:'Delete custom persona',icon:'trash',danger:true,onClick:()=>dispatchAction('delete-persona',el,event)}])],p.name);return;
      }
      case 'preview-persona': case 'run-persona-test': {
        const p=state.personas.find(x=>x.id===ds(el,'persona'))||state.personas.find(x=>x.id===state.selectedPersona);infoDrawer(`${p?.name||'Persona'} preview`,p?.description,[['Group',p?.group],['Tone',p?.tone],['Exact route',p?.route],['Tools',(p?.tools||[]).join(', ')],['Crews',(p?.crews||[]).join(', ')||'None']],{extra:`<div class="prompt-box">${escapeHtml(p?.prompt||'')}</div>`});return;
      }
      case 'import-persona': openDialog({title:'Import persona',subtitle:'Review name, prompt, route, tools, and permissions before adding it to the Custom group.',body:formGrid([{label:'Persona file',name:'file',value:'',type:'file',full:true},{label:'Imported name',name:'name',value:'Imported Persona'},{label:'Keep disabled until reviewed',name:'disabled',value:true,type:'checkbox',full:true}]),saveLabel:'Import',onSave:(_v,form)=>{const v=readForm(form);const p={id:uid('persona',v.name),name:v.name,group:'Custom',locked:false,description:`Imported from ${v.file||'persona file'}`,tone:'Imported',route:'Not assigned',tools:[],prompt:'Review imported instructions before use.',crews:[]};state.personas.push(p);state.selectedPersona=p.id;saveState();renderApp();showToast('Persona imported',p.name);}});return;
      case 'assign-persona-crew': {
        const p=state.personas.find(x=>x.id===ds(el,'persona'));if(!p)return;editObjectDialog({title:`Assign ${p.name} to crews`,subtitle:'Crews reference the unified persona library; Core, Bundled, and Custom personas are not separated into incompatible stores.',object:p,fields:[{label:'Crews',name:'crews',value:(p.crews||[]).join(', '),full:true,help:`Available: ${state.crews.map(c=>c.name).join(', ')}`}],onSave:(_v,form)=>{p.crews=listValue(readForm(form).crews);saveState();renderApp();showToast('Crew assignment saved',p.name);}});return;
      }
      case 'select-crew': state.selectedCrew=ds(el,'crew');rerender();return;
      case 'create-crew': editCrew();return;
      case 'edit-crew': editCrew(state.crews.find(c=>c.id===ds(el,'crew')));return;
      case 'add-crew-member': {
        const c=state.crews.find(x=>x.id===ds(el,'crew'));if(c)editCrew(c);return;
      }
      case 'crew-menu': {
        const c=state.crews.find(x=>x.id===ds(el,'crew'));if(!c)return;openMenu(el,[{label:'Edit crew',icon:'edit',onClick:()=>editCrew(c)},{label:'Test handoff',icon:'test',onClick:()=>dispatchAction('test-crew',el,event)},{label:'Duplicate crew',icon:'copy',onClick:()=>{const x=clone(c);x.id=uid('crew',`${c.name}-copy`);x.name=`${c.name} Copy`;state.crews.push(x);state.selectedCrew=x.id;rerender('Crew duplicated',x.name);}}],c.name);return;
      }
      case 'test-crew': {
        const c=state.crews.find(x=>x.id===ds(el,'crew'));taskDrawer(`Test ${c?.name||'crew'} handoff`,(c?.members||[]).map((name,i)=>[name,i===0?'Lead assignment and decomposition':'Bounded specialist result receipt']),{successMessage:'Assignments, results, route, and handoff contract were preserved.'});return;
      }
      case 'edit-persona-defaults': case 'edit-persona-inheritance': {
        const title=humanize(action.replace('edit-',''));editObjectDialog({title,subtitle:'Defaults and inheritance remain explicit projections of provider routes, tools, permissions, and crews.',object:state,fields:[{label:'Assistant Chat persona',name:'defaultAssistantPersona',value:state.defaultAssistantPersona||'Puppet Master'},{label:'Planning persona',name:'defaultPlanningPersona',value:state.defaultPlanningPersona||'Planning Compiler'},{label:'GUI persona',name:'defaultGuiPersona',value:state.defaultGuiPersona||'Frontend Craft'},{label:'Inheritance policy',name:'personaInheritance',value:state.personaInheritance||'Persona → project → application'}],onSave:(_v,form)=>{Object.assign(state,readForm(form));saveState();renderApp();showToast(`${title} saved`,'Persona defaults were updated.');}});return;
      }
      case 'compare-personas': infoDrawer('Compare personas','Compare route, tone, tools, and crew membership without starting a task.',state.personas.slice(0,6).map(p=>[p.name,`${p.group} · ${p.route} · ${(p.tools||[]).length} tools`]));return;
      case 'validate-personas': taskDrawer('Validate personas & crews',[['Model routes','Every route resolves to configured exact endpoints'],['Tool permissions','No persona exceeds effective policy'],['Crew membership','Every member exists in unified library'],['Custom prompts','No unresolved variables or hidden secrets']],{successMessage:'Persona and crew library validation passed.'});return;

      /* Source Control */
      case 'source-tab': state.sourceTab=ds(el,'tab');rerender();return;
      case 'select-source-tool': state.selectedSourceTool=ds(el,'id');rerender();return;
      case 'add-source-tool': editSourceTool();return;
      case 'edit-source-tool': editSourceTool(state.sourceControl.tools.find(t=>t.id===ds(el,'id')));return;
      case 'test-source-tool': {
        const t=state.sourceControl.tools.find(x=>x.id===ds(el,'id'));taskDrawer(`Verify ${t?.name||'source-control tool'}`,[['Resolve executable and version',`${t?.name} ${t?.version}`],['Check installation source',t?.source],['Run read-only repository command',t?.host],['Validate interoperability','Git/Jujutsu and LFS where applicable']],{successMessage:`${t?.name||'Tool'} is ready on ${t?.host||'the selected host'}.`});return;
      }
      case 'update-source-tool': {
        const t=state.sourceControl.tools.find(x=>x.id===ds(el,'id'));taskDrawer(`Check ${t?.name||'tool'} update`,[['Detect installation method',t?.source],['Query authoritative source','No cross-method updater'],['Compare version',t?.version],['Preview update and rollback','Explicit user action']],{successMessage:'No required update was installed silently.'});return;
      }
      case 'set-default-source-tool': {
        const t=state.sourceControl.tools.find(x=>x.id===ds(el,'id'));if(t){state.sourceControl.tools.forEach(x=>x.default=false);t.default=true;rerender('Default source-control tool changed',t.name);}return;
      }
      case 'source-tool-menu': {
        const t=state.sourceControl.tools.find(x=>x.id===ds(el,'id'));if(!t)return;openMenu(el,[{label:'Configure',icon:'edit',onClick:()=>editSourceTool(t)},{label:'Verify executable',icon:'test',onClick:()=>dispatchAction('test-source-tool',el,event)},{label:'Check update',icon:'refresh',onClick:()=>dispatchAction('update-source-tool',el,event)},{label:'Make default',icon:'check',disabled:t.default,onClick:()=>dispatchAction('set-default-source-tool',el,event)}],t.name);return;
      }
      case 'select-forge': state.selectedForge=ds(el,'id');rerender();return;
      case 'connect-forge': editForge(ds(el,'id')?state.sourceControl.forges.find(f=>f.id===ds(el,'id')):null);return;
      case 'edit-forge': editForge(state.sourceControl.forges.find(f=>f.id===ds(el,'id')));return;
      case 'test-forge': {
        const f=state.sourceControl.forges.find(x=>x.id===ds(el,'id'));taskDrawer(`Test ${f?.name||'forge'} connection`,[['Validate account token','Redacted credential store'],['Validate requested scopes',(f?.scopes||[]).join(', ')||'No scopes'],['Test repository discovery','Read-only query'],['Test SSH or HTTPS',f?.ssh||'Not configured']],{onComplete:()=>{if(f){f.status='active';f.lastTest='Passed just now';f.ssh=f.ssh==='Not tested'?'Healthy':f.ssh;saveState();}}});return;
      }
      case 'discover-repositories': {
        const f=state.sourceControl.forges.find(x=>x.id===ds(el,'id'));taskDrawer(`Discover ${f?.name||'forge'} repositories`,[['Check account and scopes',f?.defaultAccount||'No account'],['List accessible repositories','No write permission required'],['Inspect clone methods','SSH and HTTPS'],['Prepare import choices','Nothing imported automatically']],{successMessage:'Repository discovery results are ready to review.'});return;
      }
      case 'forge-menu': {
        const f=state.sourceControl.forges.find(x=>x.id===ds(el,'id'));if(!f)return;openMenu(el,[{label:f.status==='active'?'Manage connection':'Connect',icon:'edit',onClick:()=>editForge(f)},{label:'Test connection',icon:'test',onClick:()=>dispatchAction('test-forge',el,event)},{label:'Discover repositories',icon:'search',disabled:f.status!=='active',onClick:()=>dispatchAction('discover-repositories',el,event)},{separator:true},{label:'Disconnect',icon:'trash',danger:true,disabled:f.status!=='active',onClick:()=>confirmDialog(`Disconnect ${f.name}`,'Remove saved forge account and scopes while leaving local repositories intact?', 'Disconnect',()=>{f.status='not-connected';f.accounts=0;f.defaultAccount='None';f.scopes=[];rerender('Forge disconnected',f.name,'warning');},true)}],f.name);return;
      }
      case 'open-repository': {
        const r=state.sourceControl.repositories.find(x=>x.name===ds(el,'name'));if(r)infoDrawer(r.name,'Repository status, remote, protection, LFS, worktrees, and actions remain in one manager.',[['Forge',r.forge],['Remote',r.remote],['Branch',r.branch],['State',r.state],['Protection',r.protection],['Git LFS',r.lfs]],{primaryLabel:'Configure',onPrimary:()=>editRepository(r)});return;
      }
      case 'import-repository': editRepository();return;
      case 'initialize-repository': editRepository();return;
      case 'edit-repository-defaults': {
        const r=state.sourceControl.repositories.find(x=>x.name===state.selectedRepository)||state.sourceControl.repositories[0];if(r)editRepository(r);return;
      }
      case 'test-repository-remotes': {
        const r=state.sourceControl.repositories.find(x=>x.name===ds(el,'name'))||state.sourceControl.repositories[0];taskDrawer(`Test ${r?.name||'repository'} remotes`,[['Read configured remotes',r?.remote],['Resolve forge account',r?.forge],['Fetch read-only references','No branch mutation'],['Validate protected branch policy',r?.protection]],{successMessage:'Remote and protection checks passed.'});return;
      }
      case 'repository-menu': {
        const r=state.sourceControl.repositories.find(x=>x.name===ds(el,'name'));if(!r)return;openMenu(el,[{label:'Open repository',icon:'folder',onClick:()=>dispatchAction('open-repository',el,event)},{label:'Configure defaults',icon:'edit',onClick:()=>editRepository(r)},{label:'Test remotes',icon:'test',onClick:()=>dispatchAction('test-repository-remotes',el,event)},{label:'Create worktree',icon:'branch',onClick:()=>editWorktree()}],r.name);return;
      }
      case 'create-worktree': editWorktree();return;
      case 'open-worktree': {
        const w=state.sourceControl.worktrees.find(x=>x.name===ds(el,'name'));if(w)infoDrawer(w.name,'Worktree ownership, lease, changed state, and cleanup are explicit.',[['Path',w.path],['Branch / revision',w.branch],['Owner',w.owner],['State',w.state],['Lease',w.lease]],{primaryLabel:'Manage',onPrimary:()=>editWorktree(w)});return;
      }
      case 'worktree-menu': {
        const w=state.sourceControl.worktrees.find(x=>x.name===ds(el,'name'));if(!w)return;openMenu(el,[{label:'Manage worktree',icon:'edit',onClick:()=>editWorktree(w)},{label:'Open',icon:'folder',onClick:()=>dispatchAction('open-worktree',el,event)},{label:'Renew lease',icon:'refresh',onClick:()=>{w.lease='Active Goal';rerender('Lease renewed',w.name);}},{separator:true},{label:'Review cleanup',icon:'trash',danger:true,onClick:()=>infoDrawer('Worktree cleanup review','Patches and untracked files are preserved before removal.',[['Worktree',w.name],['State',w.state],['Owner',w.owner],['Lease',w.lease],['Removal','Requires review']])}],w.name);return;
      }
      case 'edit-source-policies': editObjectDialog({title:'Source-control policies & recovery',subtitle:'Configure branch protection, push, force-push, test-before-merge, recovery, worktree cleanup, SSH, and LFS behavior.',object:state,wide:true,fields:[{label:'Default branch protection',name:'sourceBranchProtection',value:state.sourceBranchProtection||'Review required'},{label:'Force push',name:'sourceForcePush',value:state.sourceForcePush||'Deny on protected branches',type:'select',choices:['Deny on protected branches','Ask with temporary override','Allow in disposable branches']},{label:'Test before merge',name:'sourceTestBeforeMerge',value:state.sourceTestBeforeMerge||'Required'},{label:'Recovery policy',name:'sourceRecovery',value:state.sourceRecovery||'Preserve reflog, patches, and worktree state',type:'textarea',full:true}],onSave:(_v,form)=>{Object.assign(state,readForm(form));saveState();renderApp();showToast('Source-control policies saved','Protection and recovery behavior were updated.');}});return;
      case 'test-source-recovery': taskDrawer('Source-control recovery simulation',[['Create disposable test state','No canonical branch mutation'],['Simulate failed operation','Preserve patches and reflog'],['Recover branch and worktree','Respect active leases'],['Validate final state','No lost changes']],{successMessage:'Recovery policy preserved all simulated changes.'});return;
      case 'run-workflow': {
        const name=ds(el,'name');taskDrawer(`Run workflow · ${name}`,[['Resolve workflow and trigger','Pinned GitHub Actions workflow'],['Confirm inputs and branch','No hidden defaults'],['Dispatch through connected forge','External action preview'],['Watch run and collect logs','Status and receipt']],{successMessage:`${name} workflow completed in the concept simulation.`});return;
      }
      case 'workflow-menu': openMenu(el,[{label:'Run workflow',icon:'play',onClick:()=>dispatchAction('run-workflow',el,event)},{label:'Open recent runs',icon:'history',onClick:()=>infoDrawer('Recent workflow runs','GitHub Actions history remains attributable to repository and commit.',[['Latest','Passing'],['Previous','Passing'],['Oldest retained','Failed · repaired']])},{label:'Configure inputs',icon:'edit',onClick:()=>genericActionDrawer('configure-workflow',el)},{label:'Pin / unpin',icon:'pin',onClick:()=>showToast('Workflow pin updated',ds(el,'name'))}],ds(el,'name'));return;
      case 'refresh-workflows': taskDrawer('Refresh GitHub Actions workflows',[['Validate GitHub connection','Account and scopes'],['Read workflow files','Repository default branch'],['Read recent runs','Status and logs'],['Reconcile pinned workflows','Preserve user choices']],{successMessage:'Workflow catalog and recent runs were refreshed.'});return;
      case 'test-source-control': case 'run-source-diagnostics': taskDrawer(humanize(action),[['Local Git and Jujutsu','Versions and interoperability'],['Hosted forges','Accounts, scopes, SSH, discovery'],['Repositories and remotes','Protection and LFS'],['Worktrees and recovery','Leases, changes, cleanup'],['GitHub Actions','Workflow readiness and recent runs']],{successMessage:'Source Control manager checks passed.'});return;
      case 'export-source-diagnostics': showToast('Source diagnostics exported','A redacted source-control receipt was prepared.','info');return;

      /* Notifications & Sounds */
      case 'notification-tab': state.notificationTab=ds(el,'tab');rerender();return;
      case 'select-notification-destination': state.selectedDestination=ds(el,'id');rerender();return;
      case 'add-notification-destination': editNotificationDestination();return;
      case 'edit-notification-destination': editNotificationDestination(state.notifications.destinations.find(d=>d.id===ds(el,'id')));return;
      case 'test-notification-destination': {
        const d=state.notifications.destinations.find(x=>x.id===ds(el,'id'));taskDrawer(`Test ${d?.name||'destination'}`,[['Validate destination configuration',d?.type],['Resolve redacted credentials',d?.address],['Send safe test payload',d?.urgent?'Urgent-capable':'Normal only'],['Record delivery result','Latency, retries, typed error']],{onComplete:()=>{if(d)d.status='active';saveState();}});return;
      }
      case 'notification-destination-menu': {
        const d=state.notifications.destinations.find(x=>x.id===ds(el,'id'));if(!d)return;openMenu(el,[{label:'Edit destination',icon:'edit',onClick:()=>editNotificationDestination(d)},{label:'Send test',icon:'test',onClick:()=>dispatchAction('test-notification-destination',el,event)},{label:'View delivery history',icon:'history',onClick:()=>dispatchAction('view-notification-destination-history',el,event)},{separator:true},{label:'Remove destination',icon:'trash',danger:true,onClick:()=>confirmDialog('Remove destination',`Remove ${d.name}? Event mappings will be flagged for repair.`, 'Remove',()=>{state.notifications.destinations=state.notifications.destinations.filter(x=>x.id!==d.id);rerender('Destination removed',d.name,'warning');},true)}],d.name);return;
      }
      case 'view-notification-destination-history': {
        const d=state.notifications.destinations.find(x=>x.id===ds(el,'id'));infoDrawer(`${d?.name||'Destination'} history`,'Delivery results retain event, time, latency, retries, and typed failures.',state.notifications.history.filter(h=>h.destination===d?.name).map(h=>[h.time,`${h.event} · ${h.result} · ${h.latency}`]).length?state.notifications.history.filter(h=>h.destination===d?.name).map(h=>[h.time,`${h.event} · ${h.result} · ${h.latency}`]):[['No delivery yet','Run a test to create a receipt']]);return;
      }
      case 'select-notification-agent': state.selectedNotificationAgent=ds(el,'id');rerender();return;
      case 'add-notification-agent': editNotificationAgent();return;
      case 'edit-notification-agent': editNotificationAgent(state.notifications.agents.find(a=>a.id===ds(el,'id')));return;
      case 'duplicate-notification-agent': {
        const a=state.notifications.agents.find(x=>x.id===ds(el,'id'));if(a){const c=clone(a);c.id=uid('notification-agent',`${a.name}-copy`);c.name=`${a.name} Copy`;state.notifications.agents.push(c);state.selectedNotificationAgent=c.id;rerender('Notification agent duplicated',c.name);}return;
      }
      case 'test-notification-agent': {
        const a=state.notifications.agents.find(x=>x.id===ds(el,'id'));taskDrawer(`Test ${a?.name||'notification agent'}`,[['Resolve event matches',(a?.events||[]).join(', ')],['Resolve destinations',(a?.destinations||[]).join(', ')],['Apply quiet hours and urgency',a?.escalation],['Send dry-run and write receipt','No external message unless confirmed']],{successMessage:'Agent routing and escalation were validated.'});return;
      }
      case 'notification-agent-menu': {
        const a=state.notifications.agents.find(x=>x.id===ds(el,'id'));if(!a)return;openMenu(el,[{label:'Edit agent',icon:'edit',onClick:()=>editNotificationAgent(a)},{label:'Duplicate',icon:'copy',onClick:()=>dispatchAction('duplicate-notification-agent',el,event)},{label:'Test routing',icon:'test',onClick:()=>dispatchAction('test-notification-agent',el,event)},{separator:true},{label:'Disable agent',icon:'pause',onClick:()=>{a.status='disabled';rerender('Agent disabled',a.name,'warning');}}],a.name);return;
      }
      case 'add-notification-event': editNotificationEvent(-1);return;
      case 'edit-notification-event': editNotificationEvent(Number(ds(el,'index')));return;
      case 'toggle-notification-event': {
        const e=state.notifications.events[Number(ds(el,'index'))];if(e){e.enabled=!e.enabled;rerender('Event state changed',`${e.name} is ${e.enabled?'enabled':'disabled'}.`);}return;
      }
      case 'test-notification-event': {
        const e=state.notifications.events[Number(ds(el,'index'))];taskDrawer(`Test ${e?.name||'notification event'}`,[['Resolve event configuration',e?.priority],['Resolve destinations',(e?.destinations||[]).join(', ')],['Resolve sound',e?.sound],['Apply quiet hours and send test','Receipt per destination']],{successMessage:'Event, destinations, sound, and policy were tested together.'});return;
      }
      case 'edit-notification-escalation': editObjectDialog({title:'Notification escalation policy',subtitle:'Escalation is explicit per agent and event priority.',object:state,fields:[{label:'Urgent repeat interval',name:'notificationUrgentRepeat',value:state.notificationUrgentRepeat||'10 minutes'},{label:'Failed delivery behavior',name:'notificationFailureBehavior',value:state.notificationFailureBehavior||'Retry twice, then alternate destination'},{label:'Maximum escalation',name:'notificationMaxEscalation',value:state.notificationMaxEscalation||'Phone alerts and system notification'}],onSave:(_v,form)=>{Object.assign(state,readForm(form));saveState();renderApp();showToast('Escalation policy saved','Notification agents will use the updated policy.');}});return;
      case 'select-sound': state.selectedSound=ds(el,'id');rerender();return;
      case 'upload-sound': editSound();return;
      case 'edit-sound': editSound(state.notifications.sounds.find(s=>s.id===ds(el,'id')));return;
      case 'replace-sound': editSound(state.notifications.sounds.find(s=>s.id===ds(el,'id')));return;
      case 'play-sound': {
        const s=state.notifications.sounds.find(x=>x.id===ds(el,'id'));
        if(!s)return;
        clearTimeout(soundTimer);
        const stopRow=row=>{row.classList.remove('is-playing');const b=row.querySelector('.sound-play.is-playing');if(b){b.classList.remove('is-playing');b.innerHTML=icon('play');}};
        document.querySelectorAll('.sound-row.is-playing').forEach(stopRow);
        state.soundPlaying=s.id;
        const row=el.closest('.sound-row');
        if(row){row.classList.add('is-playing');el.classList.add('is-playing');el.innerHTML=icon('volume');}
        showToast(`Playing ${s.name}`,`Preview volume ${s.volume||70}% · ${s.duration||'short clip'}`,'info',1800);
        soundTimer=setTimeout(()=>{state.soundPlaying=null;document.querySelectorAll('.sound-row.is-playing').forEach(stopRow);},1200);
        return;
      }
      case 'toggle-event-matrix': {
        if(!state.eventChecks)state.eventChecks={};
        const key=ds(el,'key');
        state.eventChecks[key]=!state.eventChecks[key];
        saveState();
        el.setAttribute('aria-pressed', state.eventChecks[key] ? 'true' : 'false');
        return;
      }
      case 'preview-sound-pack': showToast('Previewing pack','Playing a short sample from each validated sound.','info');return;
      case 'export-sound-pack': showToast('Pack export ready','A compatible PeonPing archive receipt was prepared.');return;
      case 'test-sound-mapping': taskDrawer('Test exact sound mapping',[['Resolve event','Selected event mapping'],['Apply quiet hours','Respect urgent override'],['Play assigned sound','Preview volume'],['Record receipt','Delivery history']],{successMessage:'Event, destination, and sound mapping validated.'});return;
      case 'assign-sound': {
        const s=state.notifications.sounds.find(x=>x.id===ds(el,'id'));if(!s)return;editObjectDialog({title:`Assign ${s.name}`,subtitle:'Choose one or more events; assignment count and event mapping update together.',object:s,fields:[{label:'Events',name:'events',value:state.notifications.events.filter(e=>e.sound===s.name).map(e=>e.name).join(', '),type:'textarea',full:true,help:`Available: ${state.notifications.events.map(e=>e.name).join(', ')}`}],onSave:(_v,form)=>{const names=listValue(readForm(form).events);state.notifications.events.forEach(e=>{if(names.includes(e.name))e.sound=s.name;else if(e.sound===s.name)e.sound='None';});s.assignments=names.length;saveState();renderApp();showToast('Sound assignments saved',`${s.name} is assigned to ${names.length} event(s).`);}});return;
      }
      case 'sound-menu': {
        const s=state.notifications.sounds.find(x=>x.id===ds(el,'id'));if(!s)return;openMenu(el,[{label:'Play preview',icon:'play',onClick:()=>dispatchAction('play-sound',el,event)},{label:'Edit metadata',icon:'edit',onClick:()=>editSound(s)},{label:'Replace file',icon:'upload',onClick:()=>editSound(s)},{label:'Assign to events',icon:'bell',onClick:()=>dispatchAction('assign-sound',el,event)},{label:'Export',icon:'download',onClick:()=>dispatchAction('export-sound',el,event)},{separator:true},{label:'Delete sound',icon:'trash',danger:true,onClick:()=>confirmDialog('Delete sound',`Delete ${s.name}? Existing event mappings will become None.`, 'Delete',()=>{state.notifications.events.forEach(e=>{if(e.sound===s.name)e.sound='None';});state.notifications.sounds=state.notifications.sounds.filter(x=>x.id!==s.id);state.selectedSound=state.notifications.sounds[0]?.id||null;rerender('Sound deleted',s.name,'warning');},true)}],s.name);return;
      }
      case 'export-sound': showToast('Sound exported','The selected sound and metadata were prepared.','info');return;
      case 'import-peonping-pack': openDialog({title:'Import PeonPing / OpenPeon-compatible pack',subtitle:'Validate format, provenance, license, duplicate names, assignments, and preview before importing.',wide:true,body:formGrid([{label:'Pack archive',name:'file',value:'',type:'file',full:true},{label:'Pack name',name:'name',value:'PeonPing Custom Pack'},{label:'License / provenance',name:'license',value:'Verify during import'},{label:'Import sounds disabled until reviewed',name:'review',value:true,type:'checkbox',full:true}]),saveLabel:'Validate & import',onSave:(_v,form)=>{const v=readForm(form);const p={id:uid('sound-pack',v.name),name:v.name,source:v.file||'Compatible pack',sounds:8,status:'active',license:v.license,version:'1.0'};state.notifications.packs.push(p);saveState();renderApp();showToast('PeonPing pack imported',`${p.sounds} sounds are ready to preview and assign.`);}});return;
      case 'sound-pack-menu': {
        const p=state.notifications.packs.find(x=>x.id===ds(el,'id'));openMenu(el,[{label:'Preview pack contents',icon:'play',onClick:()=>infoDrawer(p?.name||'Sound pack','Compatible pack metadata and sound inventory.',[['Source',p?.source],['Sounds',p?.sounds],['License',p?.license],['Version',p?.version],['Status',p?.status]])},{label:'Check update',icon:'refresh',onClick:()=>showToast('Pack checked','No update is required.')},{label:'Export pack',icon:'download',onClick:()=>showToast('Pack exported',p?.name,'info')},{separator:true},{label:'Remove pack',icon:'trash',danger:true,onClick:()=>showToast('Removal preview opened','Assigned sounds will be reviewed before removal.','warning')}],p?.name||'Sound pack');return;
      }
      case 'edit-quiet-hours': editObjectDialog({title:'Quiet hours & focus',subtitle:'Urgent overrides, schedules, weekends, projects, and destination-specific behavior are explicit.',object:state.notifications.quiet,fields:[{label:'Enable quiet hours',name:'enabled',value:state.notifications.quiet.enabled,type:'checkbox',full:true},{label:'Start',name:'start',value:state.notifications.quiet.start},{label:'End',name:'end',value:state.notifications.quiet.end},{label:'Weekend behavior',name:'weekends',value:state.notifications.quiet.weekends},{label:'Allow urgent override',name:'urgentOverride',value:state.notifications.quiet.urgentOverride,type:'checkbox',full:true}]});return;
      case 'preview-quiet-hours': infoDrawer('Quiet hours preview','Shows how normal and urgent events behave now.',[['Enabled',state.notifications.quiet.enabled?'Yes':'No'],['Schedule',`${state.notifications.quiet.start} → ${state.notifications.quiet.end}`],['Weekends',state.notifications.quiet.weekends],['Urgent override',state.notifications.quiet.urgentOverride?'Allowed':'Suppressed'],['Current outcome','Normal events queue; urgent events deliver']]);return;
      case 'send-test-notification': case 'run-notification-diagnostics': taskDrawer(humanize(action),[['Resolve selected event','Destinations, sound, and priority'],['Apply quiet hours','Urgency and schedule'],['Deliver to configured destinations','Per-destination status'],['Play selected sound','Preview volume and assignment'],['Write delivery receipts','Latency, retries, errors']],{successMessage:'Notification and sound configuration was tested end to end.'});return;
      case 'open-notification-receipt': {
        const h=state.notifications.history[Number(ds(el,'index'))];infoDrawer('Notification delivery receipt','Exact event, destination, result, latency, policy, and retries.',[['Time',h?.time],['Event',h?.event],['Destination',h?.destination],['Result',h?.result],['Latency',h?.latency]]);return;
      }
      case 'export-notification-history': showToast('Notification history exported','A redacted delivery history was prepared.','info');return;

      /* Projects, sync, history, and artifacts */
      case 'project-sync-tab': state.projectSyncTab=ds(el,'tab');rerender();return;
      case 'edit-project-location': case 'add-project-location': editProjectSync('location');return;
      case 'manage-clients': editProjectSync('clients');return;
      case 'edit-continuity': editProjectSync('continuity');return;
      case 'add-ssh-remote': case 'import-remote-project': {
        openDialog({title:action==='add-ssh-remote'?'Add SSH remote':'Import remote project',subtitle:'Configure a remote location, authentication method, file authority, sync behavior, and connection test.',wide:true,body:formGrid([{label:'Name',name:'name',value:action==='add-ssh-remote'?'Remote host':'Imported project',autofocus:true},{label:'Type',name:'type',value:action==='add-ssh-remote'?'SSH remote':'GitHub import',type:'select',choices:['SSH remote','Mounted storage','GitHub import']},{label:'Address / path',name:'address',value:action==='add-ssh-remote'?'user@host:/path':'owner/repository'},{label:'File authority',name:'authority',value:'Server host',type:'select',choices:['Server host','Remote host','Repository remote']},{label:'Test before saving',name:'test',value:true,type:'checkbox',full:true}]),saveLabel:'Add remote',onSave:(_v,form)=>{const v=readForm(form);state.projectSync.remotes.push({id:uid('remote',v.name),name:v.name,type:v.type,address:v.address,status:'ready'});saveState();renderApp();showToast('Remote project location saved',`${v.name} is ready for continuity and sync testing.`);}});return;
      }
      case 'move-project': case 'copy-project': {
        openDialog({title:action==='move-project'?'Move project':'Copy project',subtitle:'Preview files, Git state, databases, artifacts, credentials, active Goals, rollback, and authority before changing location.',wide:true,body:formGrid([{label:'Destination',name:'destination',value:'/mnt/Cursor/Puppet Master Copy',autofocus:true},{label:'Include project settings',name:'settings',value:true,type:'checkbox',full:true},{label:'Include Goal and chat continuity',name:'continuity',value:true,type:'checkbox',full:true},{label:'Retain provider credential references',name:'credentials',value:true,type:'checkbox',full:true},{label:'Verify destination before switching authority',name:'verify',value:true,type:'checkbox',full:true}]),saveLabel:action==='move-project'?'Preview move':'Preview copy',onSave:(_v,form)=>{const v=readForm(form);openDrawer({title:`${action==='move-project'?'Move':'Copy'} preview`,subtitle:'No files were changed. Review the bounded plan and rollback path.',body:`<div class="workflow-list">${workflowStep(1,'Inventory project state','Files, repository, databases, settings, Goals, chats','Ready','generic-workflow-detail',{action})}${workflowStep(2,'Copy to destination',v.destination,'Next','generic-workflow-detail',{action})}${workflowStep(3,'Verify hashes and runtime readiness','Destination remains non-authoritative','Pending','generic-workflow-detail',{action})}${workflowStep(4,action==='move-project'?'Switch authority and retain rollback':'Register copied project','Only after verification','Pending','generic-workflow-detail',{action})}</div>`});return false;}});return;
      }
      case 'edit-conflict-policy': editObjectDialog({title:'Project sync conflict policy',subtitle:'Conflicts preserve both versions, affected durable work state, and a three-way comparison.',object:state.projectSync,fields:[{label:'Conflict behavior',name:'conflictPolicy',value:state.projectSync.conflictPolicy,type:'textarea',full:true},{label:'Pause affected Goals',name:'pauseGoals',value:true,type:'checkbox',full:true},{label:'Preserve both file versions',name:'preserveBoth',value:true,type:'checkbox',full:true},{label:'Auto-resolve metadata-only changes',name:'autoMetadata',value:false,type:'checkbox',full:true}]});return;
      case 'simulate-sync-conflict': taskDrawer('Project sync conflict simulation',[['Create divergent safe fixtures','No production file'],['Detect authority and versions','Server, client, repository'],['Preserve both and pause affected work','No silent overwrite'],['Show three-way comparison','User or Goal can resolve'],['Resume continuity','After explicit resolution']],{successMessage:'Conflict policy preserved both versions and durable work state.'});return;
      case 'test-project-sync': case 'run-project-sync-diagnostics': taskDrawer(humanize(action),[['Server host',state.projectSync.serverHost],['Execution host',state.projectSync.executionHost],['Project path and authority',`${state.projectSync.location} · ${state.projectSync.fileAuthority}`],['Clients',`${state.projectSync.clients.length} configured`],['Remotes',`${state.projectSync.remotes.length} configured`],['Continuity','Goals, chats, editors, and receipts']],{successMessage:'Project location, sync, and continuity checks passed.'});return;
      case 'export-project-sync-report': showToast('Project sync report exported','A redacted topology and continuity report was prepared.','info');return;
      case 'project-history-tab': state.projectHistoryTab=ds(el,'tab');rerender();return;
      case 'resume-project-session': {
        const s=state.projectHistory.sessions.find(x=>x.id===ds(el,'id'));if(s){s.state='Active';s.updated='Now';rerender('Project session resumed',s.title);}return;
      }
      case 'new-project-session': openDialog({title:'Create project session',subtitle:'Sessions preserve project, thread/Goal associations, device, artifacts, and resumable state.',body:formGrid([{label:'Session name',name:'name',value:'New project session',autofocus:true},{label:'Device / client',name:'device',value:state.projectSync.clients[0]?.name,type:'select',choices:state.projectSync.clients.map(c=>c.name)},{label:'Start state',name:'state',value:'Active',type:'select',choices:['Active','Paused']}]),saveLabel:'Create session',onSave:(_v,form)=>{const v=readForm(form);state.projectHistory.sessions.unshift({id:uid('session',v.name),title:v.name,device:v.device,updated:'Now',state:v.state,artifacts:0});saveState();renderApp();showToast('Project session created',v.name);}});return;
      case 'project-session-menu': {
        const s=state.projectHistory.sessions.find(x=>x.id===ds(el,'id'));if(!s)return;openMenu(el,[{label:s.state==='Paused'?'Resume':'Open session',icon:'play',onClick:()=>{s.state='Active';s.updated='Now';rerender('Session opened',s.title);}},{label:'Rename',icon:'edit',onClick:()=>editObjectDialog({title:'Rename session',object:s,fields:[{label:'Session name',name:'title',value:s.title,autofocus:true}]})},{label:'Export session receipt',icon:'download',onClick:()=>showToast('Session receipt exported',s.title,'info')},{separator:true},{label:'Archive session',icon:'archive',onClick:()=>{s.state='Archived';rerender('Session archived',s.title,'warning');}}],s.title);return;
      }
      case 'open-project-artifact': {
        const a=state.projectHistory.artifacts.find(x=>x.id===ds(el,'id'));if(a)infoDrawer(a.name,'Artifact ownership, type, size, retention, provenance, and open/export actions.',[['Type',a.type],['Owner',a.owner],['Size',a.size],['Retention',a.retention],['Status','Available']],{primaryLabel:'Open',onPrimary:()=>showToast('Artifact opened',a.name,'info')});return;
      }
      case 'add-artifact-location': openDialog({title:'Add artifact location',subtitle:'Configure storage, ownership, retention, availability, and cleanup policy.',body:formGrid([{label:'Name',name:'name',value:'Project artifacts',autofocus:true},{label:'Location',name:'location',value:'${projectRoot}/Artifacts'},{label:'Retention',name:'retention',value:'Keep until project cleanup'},{label:'Available across clients',name:'sync',value:true,type:'checkbox',full:true}]),saveLabel:'Add location',onSave:(_v,form)=>{const v=readForm(form);state.projectHistory.artifacts.push({id:uid('artifact',v.name),name:v.name,type:'Artifact location',owner:'Project',size:'Managed',retention:v.retention});saveState();renderApp();showToast('Artifact location added',v.location);}});return;
      case 'project-artifact-menu': {
        const a=state.projectHistory.artifacts.find(x=>x.id===ds(el,'id'));if(!a)return;openMenu(el,[{label:'Open artifact',icon:'folder',onClick:()=>dispatchAction('open-project-artifact',el,event)},{label:'Change retention',icon:'clock',onClick:()=>editObjectDialog({title:`${a.name} retention`,object:a,fields:[{label:'Retention',name:'retention',value:a.retention}]})},{label:'Export',icon:'download',onClick:()=>showToast('Artifact exported',a.name,'info')},{separator:true},{label:'Review deletion',icon:'trash',danger:true,onClick:()=>infoDrawer('Artifact deletion review','Ownership and references are checked before deletion.',[['Artifact',a.name],['Owner',a.owner],['Retention',a.retention],['References','2 active receipts']])}],a.name);return;
      }
      case 'configure-history-export': editObjectDialog({title:'Project history export',subtitle:'Choose sessions, artifacts, redaction, format, and date range.',object:state,fields:[{label:'Format',name:'historyExportFormat',value:state.historyExportFormat||'JSON + Markdown',type:'select',choices:['JSON + Markdown','JSON','Markdown','Encrypted archive']},{label:'Include artifact metadata',name:'historyExportArtifacts',value:true,type:'checkbox',full:true},{label:'Redact credentials and secrets',name:'historyExportRedact',value:true,type:'checkbox',full:true}]});return;
      case 'export-project-history': showToast('Project history exported','Sessions and artifact metadata were prepared with redaction.','info');return;
      case 'import-project-history': openDialog({title:'Import project history',subtitle:'Preview session IDs, project identity, conflicts, artifacts, and redaction before import.',body:formGrid([{label:'History archive',name:'file',value:'',type:'file',full:true},{label:'Conflict behavior',name:'conflict',value:'Keep both with imported label',type:'select',choices:['Keep both with imported label','Merge matching sessions','Skip conflicts']}]),saveLabel:'Preview import',onSave:()=>{showToast('Import preview ready','No history was applied until confirmation.','info');}});return;
      case 'edit-project-retention': editObjectDialog({title:'Project history & artifact retention',subtitle:'Configure sessions, receipts, artifacts, temporary files, and deletion review separately.',object:state,fields:[{label:'Completed sessions',name:'projectSessionRetention',value:state.projectSessionRetention||'Keep indefinitely'},{label:'Goal receipts',name:'projectGoalReceiptRetention',value:state.projectGoalReceiptRetention||'1 year'},{label:'Large media artifacts',name:'projectMediaRetention',value:state.projectMediaRetention||'90 days'},{label:'Temporary artifacts',name:'projectTempRetention',value:state.projectTempRetention||'7 days'}]});return;
      case 'review-project-cleanup': infoDrawer('Project cleanup review','Cleanup is previewed by category, owner, reference, size, and reversibility.',[['Temporary artifacts','214 MB · 12 items'],['Expired visual recordings','1.8 GB · 4 items'],['Stale sessions','2 sessions'],['Active Goal artifacts','Protected']],{primaryLabel:'Build cleanup plan',onPrimary:()=>showToast('Cleanup plan built','Nothing has been deleted.','info')});return;
      case 'filter-project-history': case 'search-project-history': {
        openDialog({title:'Search project history',subtitle:'Filter sessions, events, artifacts, owners, devices, states, and dates without leaving the manager.',body:formGrid([{label:'Search',name:'query',value:'',autofocus:true},{label:'Record type',name:'type',value:'All',type:'select',choices:['All','Sessions','Artifacts','Goal receipts','Testing evidence']},{label:'Date range',name:'range',value:'All retained history',type:'select',choices:['Today','Last 7 days','Last 30 days','All retained history']}]),saveLabel:'Search',onSave:(_v,form)=>{const v=readForm(form);openDrawer({title:'Project history results',subtitle:`Query: ${v.query||'all records'} · ${v.type} · ${v.range}`,body:`<div class="workflow-list">${state.projectHistory.sessions.map((item,index)=>workflowStep(index+1,item.title,`${item.device} · ${item.updated}`,item.state,'resume-project-session',{id:item.id})).join('')}</div>`});return false;}});return;
      }

      /* Safety & Permissions */
      case 'permission-tab': state.permissionTab=ds(el,'tab');rerender();return;
      case 'select-permission-profile': state.selectedPermissionProfile=ds(el,'id');rerender();return;
      case 'create-permission-profile': editPermissionProfile();return;
      case 'edit-permission-profile': editPermissionProfile(state.permissionProfiles.find(p=>p.id===ds(el,'id')));return;
      case 'duplicate-permission-profile': {
        const p=state.permissionProfiles.find(x=>x.id===ds(el,'id'));if(p){const c=clone(p);c.id=uid('permission',`${p.name}-copy`);c.name=`${p.name} Copy`;c.status='available';state.permissionProfiles.push(c);state.selectedPermissionProfile=c.id;rerender('Permission profile duplicated',c.name);}return;
      }
      case 'activate-permission-profile': {
        const p=state.permissionProfiles.find(x=>x.id===ds(el,'id'));if(p){state.permissionProfiles.forEach(x=>{if(x.status==='default')x.status='available';});p.status='default';rerender('Permission profile activated',p.name);}return;
      }
      case 'permission-profile-menu': {
        const p=state.permissionProfiles.find(x=>x.id===ds(el,'id'));if(!p)return;openMenu(el,[{label:'Edit profile',icon:'edit',onClick:()=>editPermissionProfile(p)},{label:'Duplicate profile',icon:'copy',onClick:()=>dispatchAction('duplicate-permission-profile',el,event)},{label:'Preview effective policy',icon:'eye',onClick:()=>dispatchAction('preview-effective-permissions',el,event)},{label:'Activate',icon:'check',disabled:p.status==='default',onClick:()=>dispatchAction('activate-permission-profile',el,event)}],p.name);return;
      }
      case 'preview-effective-permissions': {
        const p=state.permissionProfiles.find(x=>x.id===ds(el,'id'))||state.permissionProfiles.find(x=>x.status==='default');infoDrawer(`${p?.name||'Effective'} policy`,'Shows the resolved profile, ordered rules, FileSafe boundaries, approvals, and hard guardrails.',[['Profile',p?.name],['Scope',p?.scope],['Rules',p?.rules],['FileSafe boundaries',state.fileSafePaths.length],['Pending approvals',state.pendingApprovals.length],['Hard denials','Protected branch force push; direct credential reads']]);return;
      }
      case 'refresh-effective-permissions': taskDrawer('Refresh effective permissions',[['Resolve active profile','Project, session, and user scope'],['Apply ordered rules',`${state.permissionRules.length} rules`],['Apply FileSafe boundaries',`${state.fileSafePaths.length} paths`],['Apply approvals and guardrails',`${state.pendingApprovals.length} pending`],['Write policy receipt','Decision explanations']],{successMessage:'Effective policy projection was refreshed.'});return;
      case 'add-permission-rule': editPermissionRule(-1);return;
      case 'edit-permission-rule': editPermissionRule(Number(ds(el,'index')));return;
      case 'move-permission-rule': {
        const i=Number(ds(el,'index'));if(moveItem(state.permissionRules,i,Number(ds(el,'direction'))))rerender('Rule order updated','Permission decisions will follow the displayed order.');return;
      }
      case 'add-filesafe-path': editFileSafePath(-1);return;
      case 'edit-filesafe-path': editFileSafePath(Number(ds(el,'index')));return;
      case 'evaluate-filesafe-path': {
        const p=state.fileSafePaths[Number(ds(el,'index'))];taskDrawer(`Evaluate ${p?.path||'FileSafe path'}`,[['Resolve path and variables',p?.path],['Apply inheritance',p?.inheritance],['Evaluate requested access',p?.access],['Check protected boundaries','Exact path and owner'],['Return decision receipt',p?.status]],{successMessage:'FileSafe decision is explainable and no file was touched.'});return;
      }
      case 'review-all-approvals': infoDrawer('Pending approvals','Review action, requester, risk, target, preview, expiration, and one-time or durable scope.',state.pendingApprovals.map(a=>[a.action,`${a.requester} · ${a.risk} · ${a.status}`]),{primaryLabel:'Review first',onPrimary:()=>showToast('Approval review opened',state.pendingApprovals[0]?.action||'No pending approvals','info')});return;
      case 'edit-approval-policy': editObjectDialog({title:'Approval policy',subtitle:'Configure which actions ask, how requests expire, whether temporary grants are allowed, and required previews.',object:state,wide:true,fields:[{label:'External messages',name:'approvalExternalMessages',value:state.approvalExternalMessages||'Always ask with preview'},{label:'Package / CLI install',name:'approvalInstalls',value:state.approvalInstalls||'Ask with source, version, host, and rollback'},{label:'Destructive actions',name:'approvalDestructive',value:state.approvalDestructive||'Always ask'},{label:'Temporary grants',name:'approvalTemporary',value:state.approvalTemporary||'One action or bounded session'},{label:'Request expiry',name:'approvalExpiry',value:state.approvalExpiry||'30 minutes'}]});return;
      case 'edit-runaway-policy': case 'edit-resource-guardrails': {
        const title=humanize(action.replace('edit-',''));editObjectDialog({title,subtitle:'Runaway protection and resource limits pause safely, preserve partial work, and expose a resumable trace.',object:state,wide:true,fields:[{label:'Repeated failure threshold',name:`${slug(action)}_failureThreshold`,value:'3'},{label:'Wall-clock timeout',name:`${slug(action)}_timeout`,value:'Task profile'},{label:'Concurrency limit',name:`${slug(action)}_concurrency`,value:'Profile and host capacity'},{label:'On limit',name:`${slug(action)}_behavior`,value:'Throttle, then pause and preserve state',type:'textarea',full:true}]});return;
      }
      case 'simulate-runaway': taskDrawer('Runaway protection simulation',[['Start safe repeating fixture','No production command'],['Detect repeated identical failure','Threshold 3'],['Throttle and pause','Preserve trace and partial work'],['Offer repair and resume','No silent retry loop']],{successMessage:'Runaway protection paused the fixture and preserved a resumable receipt.'});return;
      case 'simulate-permission': {
        openDialog({title:'Permission simulator',subtitle:'Evaluate a proposed action without executing it.',wide:true,body:formGrid([{label:'Actor / persona',name:'actor',value:'Puppet Master'},{label:'Action',name:'action',value:'Install project dependency'},{label:'Target',name:'target',value:'Project environment'},{label:'Context',name:'context',value:'Goal implementation phase'},{label:'Permission profile',name:'profile',value:state.permissionProfiles.find(p=>p.status==='default')?.name,type:'select',choices:state.permissionProfiles.map(p=>p.name)}]),saveLabel:'Simulate decision',onSave:(_v,form)=>{const v=readForm(form);openDrawer({title:'Permission decision · Ask',subtitle:'No action was executed.',body:`<div class="alert-strip">${icon('alert')}<div><strong>Approval required</strong><br>${escapeHtml(v.action)} requires source, version, target environment, permission, and rollback preview.</div></div><div class="info-grid" style="margin-top:12px">${infoRow('Actor',v.actor)}${infoRow('Action',v.action)}${infoRow('Target',v.target)}${infoRow('Context',v.context)}${infoRow('Profile',v.profile)}${infoRow('Matched rule','Install project dependency → Ask')}</div>`});return false;}});return;
      }
      case 'trace-permission-decision': infoDrawer('Permission decision trace','Every decision shows profile, ordered rule, hard boundary, approval, and final reason.',[['Actor','Puppet Master'],['Action','Write project file'],['Target','${projectRoot}/Concepts'],['Profile','Hands-off development'],['Rule','Write project files → Allow'],['FileSafe','Inside project root'],['Final decision','Allow']]);return;
      case 'audit-permission-policy': taskDrawer('Safety policy audit',[['Profile references',`${state.permissionProfiles.length} profiles`],['Ordered rule conflicts',`${state.permissionRules.length} rules`],['FileSafe exact paths',`${state.fileSafePaths.length} boundaries`],['Approval backlog',`${state.pendingApprovals.length} pending`],['Runaway guardrails','Configured'],['Effective-policy receipts','Current']],{successMessage:'Safety & Permissions audit passed with explainable decisions.'});return;
      case 'export-permission-audit': showToast('Permission audit exported','A redacted policy, FileSafe, approval, and decision report was prepared.','info');return;

      /* Settings Transfer */
      case 'settings-transfer-tab': state.settingsTransferTab=ds(el,'tab');rerender();return;
      case 'toggle-transfer-category': {
        const c=ds(el,'category'),i=state.transferCategories.indexOf(c);if(i>=0)state.transferCategories.splice(i,1);else state.transferCategories.push(c);rerender();return;
      }
      case 'select-all-transfer-categories': {
        state.transferCategories=['AI providers & accounts','Model routing','Source control','Notifications & sounds','Permissions','Testing profiles','Appearance & desktop','Memory & automation','Projects & sync','System behavior'];rerender('All categories selected','Credential ownership remains preserved rather than copied as plaintext.');return;
      }
      case 'copy-settings-project': case 'choose-source-project': {
        openDialog({title:'Copy settings from another project',subtitle:'Select a source, categories, preview behavior, credential references, and conflict rules. The destination diverges after copying.',wide:true,body:formGrid([{label:'Source project',name:'source',value:'Settings Lab',type:'select',choices:['Settings Lab','Puppet Master Stable','Concept Scratch']},{label:'Categories',name:'categories',value:state.transferCategories.join('\n'),type:'textarea',full:true},{label:'Provider credentials',name:'credentials',value:'Keep existing destination credential ownership',type:'select',choices:['Keep existing destination credential ownership','Reference compatible saved accounts','Do not copy provider account selection']},{label:'Conflict behavior',name:'conflicts',value:'Preview every changed value',type:'select',choices:['Preview every changed value','Keep destination on conflicts','Use source on conflicts']},{label:'Create rollback receipt',name:'rollback',value:true,type:'checkbox',full:true}]),saveLabel:'Preview copy',onSave:(_v,form)=>{const v=readForm(form);state.transferCategories=listValue(v.categories);openDrawer({title:'Settings copy preview',subtitle:`${state.transferCategories.length} categories from ${v.source}`,body:`<div class="workflow-list">${state.transferCategories.map((c,i)=>workflowStep(i+1,c,'Compare source, destination, inheritance, and owner','Ready','open-transfer-category',{category:c})).join('')}</div><div class="alert-strip info" style="margin-top:12px">${icon('info')}<div>Provider credentials remain in their existing secure owner. The copy applies selected references and settings, then the destination can diverge independently.</div></div>`,primaryLabel:'Apply copy',onPrimary:()=>{state.settingsTransferHistory.unshift({time:`Today · ${nowLabel()}`,action:`Copied from ${v.source}`,categories:state.transferCategories.length,result:'Applied with preview'});saveState();renderApp();showToast('Settings copied',`${state.transferCategories.length} categories applied with rollback receipt.`);}});return false;}});return;
      }
      case 'preview-settings-copy': dispatchAction('copy-settings-project',el,event);return;
      case 'edit-copy-behavior': editObjectDialog({title:'Settings copy behavior',subtitle:'Define inheritance, merge, conflict, credential ownership, and rollback defaults.',object:state,fields:[{label:'Default conflicts',name:'settingsCopyConflicts',value:state.settingsCopyConflicts||'Preview every changed value'},{label:'After copy',name:'settingsCopyAfter',value:state.settingsCopyAfter||'Destination diverges independently'},{label:'Credentials',name:'settingsCopyCredentials',value:state.settingsCopyCredentials||'Keep destination ownership'},{label:'Rollback receipt',name:'settingsCopyRollback',value:true,type:'checkbox',full:true}]});return;
      case 'import-settings': openDialog({title:'Import settings archive',subtitle:'Validate schema, project scope, credentials, unsupported settings, conflicts, and rollback before applying.',wide:true,body:formGrid([{label:'Settings archive',name:'file',value:'',type:'file',full:true},{label:'Passphrase (if encrypted)',name:'passphrase',value:'',type:'password'},{label:'Conflict behavior',name:'conflicts',value:'Preview every changed value',type:'select',choices:['Preview every changed value','Keep destination','Use imported']},{label:'Create rollback point',name:'rollback',value:true,type:'checkbox',full:true}]),saveLabel:'Validate import',onSave:(_v,form)=>{const v=readForm(form);state.settingsTransferHistory.unshift({time:`Today · ${nowLabel()}`,action:`Imported ${v.file||'settings archive'}`,categories:10,result:'Validated · preview required'});saveState();renderApp();showToast('Settings import validated','Open the preview before applying.','info');}});return;
      case 'export-settings': openDialog({title:'Export settings',subtitle:'Choose categories, project/user scope, redaction, credential references, and encryption.',wide:true,body:formGrid([{label:'Categories',name:'categories',value:state.transferCategories.join('\n'),type:'textarea',full:true},{label:'Format',name:'format',value:'Encrypted Puppet Master archive',type:'select',choices:['Encrypted Puppet Master archive','JSON bundle']},{label:'Include credential references (never secrets)',name:'credentialRefs',value:true,type:'checkbox',full:true},{label:'Redact paths and identities',name:'redact',value:true,type:'checkbox',full:true}]),saveLabel:'Export',onSave:(_v,form)=>{const v=readForm(form);state.settingsTransferHistory.unshift({time:`Today · ${nowLabel()}`,action:'Exported project settings',categories:listValue(v.categories).length,result:v.format});saveState();renderApp();showToast('Settings exported',v.format,'info');}});return;
      case 'open-transfer-receipt': {
        const h=state.settingsTransferHistory[Number(ds(el,'index'))];infoDrawer('Settings transfer receipt','Source, categories, preview, applied values, owner references, and rollback remain inspectable.',[['Time',h?.time],['Action',h?.action],['Categories',h?.categories],['Result',h?.result],['Rollback','Available'],['Credential material','Not exported']]);return;
      }
      case 'rollback-settings-transfer': {
        const h=state.settingsTransferHistory[Number(ds(el,'index'))];confirmDialog('Roll back settings transfer',`Restore values from before “${h?.action}”? Current changed values will be previewed first.`, 'Preview rollback',()=>showToast('Rollback preview ready','No setting was changed until confirmation.','info'));return;
      }
      case 'export-transfer-history': showToast('Transfer history exported','Receipts were prepared without credential secrets.','info');return;

      /* Data, Backup & Retention */
      case 'backup-tab': state.backupTab=ds(el,'tab');rerender();return;
      case 'add-backup-destination': editBackupDestination();return;
      case 'backup-destination-menu': {
        const d=state.backup.destinations.find(x=>x.id===ds(el,'id'));if(!d)return;openMenu(el,[{label:'Configure destination',icon:'edit',onClick:()=>editBackupDestination(d)},{label:'Test write & restore',icon:'test',onClick:()=>taskDrawer(`Test ${d.name}`,[['Validate path and access',d.path],['Write encrypted fixture',d.encryption],['Restore and hash fixture','Exact match'],['Remove fixture and write receipt','No production data']],{onComplete:()=>{d.lastVerified='Just now';d.status='ready';saveState();}})},{label:'View backup coverage',icon:'eye',onClick:()=>dispatchAction('view-backup-coverage',el,event)},{separator:true},{label:'Remove destination',icon:'trash',danger:true,onClick:()=>showToast('Destination removal review','Schedules and last-good restore points must be reassigned first.','warning')}],d.name);return;
      }
      case 'add-backup-schedule': editBackupSchedule();return;
      case 'edit-backup-schedule': editBackupSchedule(state.backup.schedules.find(s=>s.id===ds(el,'id')));return;
      case 'toggle-backup-schedule': {
        const s=state.backup.schedules.find(x=>x.id===ds(el,'id'));if(s){s.enabled=!s.enabled;rerender('Backup schedule changed',`${s.name} is ${s.enabled?'enabled':'disabled'}.`);}return;
      }
      case 'run-backup': taskDrawer('Back up Puppet Master now',[['Snapshot application state','Databases, settings, Goals, chats, provider references'],['Snapshot project data','According to destination and exclusions'],['Encrypt and transfer','Configured destination'],['Verify hashes and restore manifest','Before marking successful'],['Write backup receipt','Size, contents, destination, verification']],{onComplete:()=>{state.backup.history.unshift({time:`Today · ${nowLabel()}`,type:'Manual full',destination:state.backup.destinations[0]?.name||'Local recovery cache',size:'2.5 GB',result:'Verified',receipt:`BKP-${Math.floor(3000+Math.random()*6000)}`});saveState();}});return;
      case 'verify-latest-backup': {
        const h=state.backup.history[0];taskDrawer(`Verify ${h?.receipt||'latest backup'}`,[['Read manifest and signatures',h?.destination],['Verify artifact hashes',h?.size],['Run granular restore dry run','Temporary isolated location'],['Confirm application compatibility',h?.type],['Update verification receipt','No production restore']],{successMessage:'Latest backup is readable, complete, and restorable.'});return;
      }
      case 'view-backup-coverage': infoDrawer('Backup coverage','Shows what is included, excluded, encrypted, retained, and restore-tested.',[['Application databases','Included'],['Settings and preferences','Included'],['Goals, chats, and receipts','Included'],['Provider credentials','Secure references; secrets remain in credential owner'],['Project files','Per project destination policy'],['Temporary caches','Excluded'],['Restore manifest','Included and verified']]);return;
      case 'edit-backup-retention': editObjectDialog({title:'Data retention & cleanup',subtitle:'Retention is configured by data family and always exposes review or protected-state exceptions.',object:state.backup.retention,fields:Object.entries(state.backup.retention).map(([k,v])=>({label:humanize(k),name:k,value:v}))});return;
      case 'review-backup-cleanup': infoDrawer('Backup cleanup review','Expired backups, retained restore points, protected milestones, size, and deletion receipts.',[['Expired incremental backups','8 · 740 MB'],['Protected monthly restore point','1 · Keep'],['Failed partial uploads','2 · Safe to remove'],['Latest verified full','Protected']],{primaryLabel:'Build cleanup plan',onPrimary:()=>showToast('Cleanup plan built','Nothing has been deleted.','info')});return;
      case 'start-restore': case 'configure-granular-restore': openDialog({title:'Restore Puppet Master',subtitle:'Choose backup, scope, destination, compatibility checks, current-state backup, and rollback. No restore starts without preview.',wide:true,body:formGrid([{label:'Backup receipt',name:'backup',value:state.backup.history[0]?.receipt,type:'select',choices:state.backup.history.map(h=>h.receipt)},{label:'Restore scope',name:'scope',value:'Full application',type:'select',choices:['Full application','Settings only','Goals and chats','Project metadata','Selected data families']},{label:'Restore destination',name:'destination',value:'Current installation',type:'select',choices:['Current installation','New isolated installation','Temporary verification location']},{label:'Create current-state safety backup',name:'safety',value:true,type:'checkbox',full:true},{label:'Verify before switching',name:'verify',value:true,type:'checkbox',full:true}]),saveLabel:'Preview restore',onSave:(_v,form)=>{const v=readForm(form);openDrawer({title:'Restore preview',subtitle:'No data has been changed.',body:`<div class="workflow-list">${workflowStep(1,'Verify selected backup',v.backup,'Ready','generic-workflow-detail',{action})}${workflowStep(2,'Create current-state safety backup',v.safety?'Required':'Skipped by explicit choice','Next','generic-workflow-detail',{action})}${workflowStep(3,'Restore selected scope',v.scope,'Pending','generic-workflow-detail',{action})}${workflowStep(4,'Run application and data verification',v.destination,'Pending','generic-workflow-detail',{action})}${workflowStep(5,'Switch or roll back','Only after verification','Pending','generic-workflow-detail',{action})}</div>`});return false;}});return;
      case 'open-backup-receipt': {
        const h=state.backup.history[Number(ds(el,'index'))];infoDrawer(h?.receipt||'Backup receipt','Contents, destination, encryption, hashes, restore tests, and compatibility.',[['Time',h?.time],['Type',h?.type],['Destination',h?.destination],['Size',h?.size],['Result',h?.result],['Receipt',h?.receipt],['Restore test','Passed']]);return;
      }
      case 'backup-receipt-menu': {
        const h=state.backup.history[Number(ds(el,'index'))];openMenu(el,[{label:'Open receipt',icon:'file',onClick:()=>dispatchAction('open-backup-receipt',el,event)},{label:'Verify again',icon:'test',onClick:()=>dispatchAction('verify-latest-backup',el,event)},{label:'Restore from this backup',icon:'restore',onClick:()=>dispatchAction('start-restore',el,event)},{label:'Export receipt',icon:'download',onClick:()=>showToast('Backup receipt exported',h?.receipt,'info')}],h?.receipt||'Backup');return;
      }
      case 'export-backup-history': showToast('Backup history exported','Backup and restore receipts were prepared.','info');return;

      /* Doctor, Servers, Updates */
      case 'run-doctor': {
        state.doctorRunning=true;renderApp();taskDrawer('Run Puppet Master Doctor',state.doctorChecks.map(c=>[c.name,c.detail]),{onComplete:()=>{state.doctorRunning=false;state.doctorLastRun=`Today · ${nowLabel()}`;saveState();renderApp();showToast('Doctor completed','One safe toolchain repair remains available.');}});return;
      }
      case 'open-doctor-check': {
        const c=state.doctorChecks.find(x=>x.id===ds(el,'id'));infoDrawer(c?.name||'Doctor check',c?.detail,[['Status',cap(c?.status)],['Evidence','Current configuration and representative safe checks'],['Affected features',humanize(c?.id)],['Automatic repair',c?.status==='attention'?'Available after preview':'Not required'],['Last run',state.doctorLastRun]],{primaryLabel:c?.status==='attention'?'Repair':'Run check',onPrimary:()=>c?.status==='attention'?dispatchAction('repair-doctor-finding',el,event):dispatchAction('run-doctor',el,event)});return;
      }
      case 'repair-doctor-finding': {
        const c=state.doctorChecks.find(x=>x.id===ds(el,'id'));taskDrawer(`Repair ${c?.name||'finding'}`,[['Preview current issue',c?.detail],['Preserve settings and logs','No secret export'],['Apply bounded safe repair','Refresh MCP catalog only'],['Retest affected features','Tool schemas and permissions']],{onComplete:()=>{if(c)c.status='ready';saveState();renderApp();showToast('Doctor repair completed',c?.name||'Finding');}});return;
      }
      case 'edit-doctor-policy': editObjectDialog({title:'Doctor policy',subtitle:'Configure startup checks, scheduled checks, notifications, safe repair boundaries, evidence, and retention.',object:state,fields:[{label:'Automatic checks',name:'doctorAutomatic',value:state.doctorAutomatic||'On open and after relevant changes'},{label:'Safe repairs',name:'doctorSafeRepairs',value:state.doctorSafeRepairs||'Preview then apply'},{label:'Notifications',name:'doctorNotifications',value:state.doctorNotifications||'Only actionable warnings'},{label:'Report retention',name:'doctorRetention',value:state.doctorRetention||'30 days'}]});return;
      case 'export-doctor-report': showToast('Doctor report exported','A redacted health and repair report was prepared.','info');return;
      case 'test-server-status': taskDrawer('Refresh server and installation status',[['Server host reachability',state.projectSync.serverHost],['Execution host readiness',state.projectSync.executionHost],['Client compatibility',`${state.projectSync.clients.length} clients`],['Project authority',state.projectSync.location]],{successMessage:'Status refreshed. Full host claiming and deployment remain owned by Project Syncing and Updates.'});return;
      case 'open-server-check': infoDrawer(`Server check · ${humanize(ds(el,'id'))}`,'This lightweight surface exposes status and ownership without inventing the later full manager.',[['Status','Ready'],['Owner','Project Syncing and Updates'],['Server host',state.projectSync.serverHost],['Execution host',state.projectSync.executionHost],['Project location',state.projectSync.location]]);return;
      case 'updates-tab': state.updatesTab=ds(el,'tab');rerender();return;
      case 'check-for-updates': taskDrawer('Check for Puppet Master updates',[['Identify install source',state.updates.source],['Fetch signed release metadata',state.updates.channel],['Compare versions',`${state.updates.currentVersion} → ${state.updates.availableVersion}`],['Preview migrations and restart','No automatic install during check'],['Confirm rollback readiness','Current state preserved']],{onComplete:()=>{state.updates.lastCheck='Just now';saveState();}});return;
      case 'edit-update-settings': editObjectDialog({title:'Automatic update settings',subtitle:'One primary automatic-updates choice with advanced source, channel, check schedule, install, restart, provenance, and rollback behavior.',object:state.updates,fields:[{label:'Automatic updates',name:'automatic',value:state.updates.automatic,type:'checkbox',full:true},{label:'Channel',name:'channel',value:state.updates.channel,type:'select',choices:['Stable','Preview','Development']},{label:'Install source',name:'source',value:state.updates.source,type:'select',choices:['GitHub Releases','Package manager','Managed deployment']},{label:'Check schedule',name:'checkInterval',value:state.updates.checkInterval}]});return;
      case 'preview-update': infoDrawer(`Puppet Master ${state.updates.availableVersion}`,'Signed release, provenance, migrations, restart, compatibility, and rollback preview.',[['Current version',state.updates.currentVersion],['Available version',state.updates.availableVersion],['Channel',state.updates.channel],['Source',state.updates.source],['Signature','Verified'],['Database migration','Compatible'],['Settings migration','Preview available'],['Restart','Required'],['Rollback point','Will be created']]);return;
      case 'install-update': confirmDialog(`Install ${state.updates.availableVersion}`,'Download the signed release, create a rollback point, preserve durable work, apply migrations, restart, and verify before finalizing?', 'Install update',()=>taskDrawer(`Install ${state.updates.availableVersion}`,[['Download signed release',state.updates.source],['Verify signature and provenance',state.updates.channel],['Create rollback point',state.updates.currentVersion],['Apply migrations','Database and settings'],['Restart and verify','Resume Goals and chats']],{onComplete:()=>{const old=state.updates.currentVersion;state.updates.currentVersion=state.updates.availableVersion;state.updates.history.unshift({version:state.updates.currentVersion,installed:`Today · ${nowLabel()}`,result:'Current',notes:`Updated from ${old}`});saveState();renderApp();showToast('Update installed',state.updates.currentVersion);}}));return;
      case 'open-update-receipt': {
        const h=state.updates.history[Number(ds(el,'index'))];infoDrawer(`Update ${h?.version}`,'Source, signature, migrations, restart, verification, and rollback.',[['Version',h?.version],['Installed',h?.installed],['Result',h?.result],['Notes',h?.notes],['Source',state.updates.source],['Signature','Verified']]);return;
      }
      case 'rollback-update': {
        const h=state.updates.history[Number(ds(el,'index'))];confirmDialog(`Roll back to ${h?.version}`,'Create a current-state recovery point, validate compatibility, restore binaries and settings, restart, and verify?', 'Preview rollback',()=>showToast('Rollback preview ready',h?.version,'info'));return;
      }
      case 'export-update-history': showToast('Update history exported','Signed release, migration, restart, and rollback receipts were prepared.','info');return;

      /* shared information and intentionally generic deep controls */
      case 'audit-single-owners': taskDrawer('Audit canonical resource ownership',[['Provider accounts','Providers & Accounts'],['Web and media routes','AI & Providers capability managers'],['MCP servers','Toolchain & Extensions'],['Memories','Context & Memory'],['Source control','Source Control'],['Notification sounds','Notifications & Sounds'],['Backups','Data, Backup & Retention']],{successMessage:'No duplicate editable resource owners were found.'});return;
      case 'close-overlay': closeOverlay();return;
      case 'task-step-details': case 'generic-workflow-detail': case 'open-route-diagnostic': case 'open-browser-workflow': case 'open-persona-validation': case 'open-crew-member': case 'open-permission-audit': case 'open-transfer-category': {
        genericActionDrawer(action,el);return;
      }
      default:
        if (/^(test|run|simulate|audit|validate|refresh|check)-/.test(action)) {
          taskDrawer(humanize(action),[['Resolve current configuration','Owner, scope, prerequisites'],['Run safe concept check','No production mutation'],['Validate result','Typed status and affected features'],['Write receipt','Evidence and next action']],{successMessage:`${humanize(action)} completed.`}); return;
        }
        if (/^(edit|configure|manage|add|create|import|copy)-/.test(action)) {
          openDialog({title:humanize(action),subtitle:'This configuration control is wired and exposes scope, owner, preview, validation, and rollback behavior.',body:formGrid([{label:'Configuration name',name:'name',value:humanize(action),autofocus:true},{label:'Behavior / value',name:'value',value:'Project default'},{label:'Detailed notes',name:'notes',value:'Review effective state before applying. Preserve a receipt and rollback path.',type:'textarea',full:true}]),saveLabel:'Save configuration',onSave:()=>{showToast('Configuration saved',humanize(action));}});return;
        }
        if (/^(open|view|preview|review|trace|export)-/.test(action)) { genericActionDrawer(action,el);return; }
        diagnostics.unhandledActions.push(action);
        genericActionDrawer(action,el);
    }
  }

  function handleInputAction(action, el) {
    if (action === 'input-setting') {
      const id=ds(el,'setting'); state.settings[id]=el.value; state.changed[id]=true; saveState(); return;
    }
    if (action === 'filter-roster') {
      const q=el.value.trim().toLowerCase();
      const map={providers:'provider-roster','web-routes':'web-route-roster','media-routes':'media-route-roster',toolchain:'toolchain-roster'};
      const container=document.getElementById(map[ds(el,'roster')]||ds(el,'roster'));
      container?.querySelectorAll('[data-filter-text]').forEach(row=>{row.hidden=!!q&&!row.dataset.filterText.includes(q);});return;
    }
    if (action === 'filter-memory-list') {
      const q=el.value.trim().toLowerCase();document.querySelectorAll('#memory-list [data-filter-text]').forEach(row=>{row.hidden=!!q&&!row.dataset.filterText.includes(q);});return;
    }
    if (action === 'persona-search') {
      state.personaQuery=el.value;saveState();const q=el.value.trim().toLowerCase();
      const list=el.closest('.filter-row')?.nextElementSibling?.querySelector('.library-list-scroll');
      list?.querySelectorAll('.library-item').forEach(row=>{row.hidden=!!q&&!row.textContent.toLowerCase().includes(q);});return;
    }
  }

  function handleChangeAction(action, el) {
    if (action === 'change-setting') {
      const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;state.settings[id]=el.value;state.changed[id]=true;saveState();showToast('Setting updated',`${found.setting.label} is now ${el.value}.`);return;
    }
    if (action === 'change-bsd-provider') {
      state.bsd.provider=el.value;const p=state.providers.find(x=>x.name===el.value);state.bsd.model=p?.models.find(m=>m.enabled)?.name||'';state.bsd.account=p?.accounts.find(a=>a.id===p.defaultAccount)?.nickname||p?.accounts.find(a=>a.active)?.nickname||'';rerender('BSD provider changed',el.value);return;
    }
    if (action === 'change-bsd-model') {state.bsd.model=el.value;rerender('BSD model changed',el.value);return;}
    if (action === 'change-bsd-account') {state.bsd.account=el.value;rerender('BSD account changed',el.value);return;}
    if (action === 'change-bsd-fallback-provider') {state.bsd.fallbackProvider=el.value;const p=state.providers.find(x=>x.name===el.value);state.bsd.fallbackModel=p?.models.find(m=>m.enabled)?.name||'';rerender('BSD fallback provider changed',el.value);return;}
    if (action === 'change-bsd-field') {state.bsd[ds(el,'field')]=el.value;rerender('BSD route updated',`${humanize(ds(el,'field'))}: ${el.value}`);return;}
    if (action === 'set-event-sound') {
      const idx = Number(ds(el, 'index'));
      const event = state.notifications.events[idx];
      if (!event) return;
      event.sound = el.value;
      saveState();
      showToast('Sound assignment updated', `${event.name} → ${el.value}`);
      return;
    }
  }

  function showTooltip(target) {
    const text=target?.dataset?.tooltip;if(!text)return;
    clearTimeout(tooltipTimer);tooltipTimer=setTimeout(()=>{
      hideTooltip();tooltipEl=document.createElement('div');tooltipEl.className='tooltip';tooltipEl.textContent=text;document.body.append(tooltipEl);
      const r=target.getBoundingClientRect(),w=tooltipEl.offsetWidth,h=tooltipEl.offsetHeight;
      let left=Math.max(8,Math.min(window.innerWidth-w-8,r.left+(r.width-w)/2));let top=r.bottom+7;
      if(top+h>window.innerHeight-8)top=Math.max(8,r.top-h-7);
      tooltipEl.style.left=`${left}px`;tooltipEl.style.top=`${top}px`;
    },360);
  }

  function hideTooltip() {clearTimeout(tooltipTimer);tooltipTimer=null;if(tooltipEl){tooltipEl.remove();tooltipEl=null;}}

  function focusTrap(event) {
    if (event.key !== 'Tab') return;
    const modal=document.querySelector('.overlay [role="dialog"],.drawer-wrap [role="dialog"]');if(!modal)return;
    const focusable=[...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);
    if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }

  function bindEvents() {
    document.addEventListener('click', event => {
      const callbackEl=event.target.closest('[data-callback]');
      if(callbackEl){event.preventDefault();const cb=actionCallbacks.get(callbackEl.dataset.callback);if(cb){try{cb(callbackEl,event);}catch(err){diagnostics.errors.push(String(err));showToast('Action failed',err.message,'error');}}return;}
      const result = event.target.closest('[data-search-result]');
      if (result) {
        event.preventDefault();
        try { selectSearchResult(result); } catch (err) { showToast('Search result could not open', err.message, 'error'); }
        return;
      }
      const el=event.target.closest('[data-action]');
      if(el){
        if(['INPUT','SELECT','TEXTAREA'].includes(el.tagName))return;
        event.preventDefault();hideTooltip();
        try{dispatchAction(el.dataset.action,el,event);}catch(err){diagnostics.errors.push(`${el.dataset.action}: ${err.stack||err}`);console.error(err);showToast('Control could not complete',`${humanize(el.dataset.action)}: ${err.message}`,'error');}
        return;
      }
      if(searchEl && !event.target.closest('.search-results') && !event.target.closest('[data-global-search],[data-hero-search],.hero-search,.rail-search')){
        closeSearch();
      }
    });
    document.addEventListener('input', event => {
      const target = event.target;
      if (target.matches('[data-global-search], [data-hero-search]')) {
        openSearch(target);
        return;
      }
      const el = target.closest('[data-action]');
      if (!el) return;
      try { handleInputAction(el.dataset.action, el); } catch (err) { diagnostics.errors.push(`input ${el.dataset.action}: ${err}`); }
    });
    document.addEventListener('change',event=>{const el=event.target.closest('[data-action]');if(!el)return;try{handleChangeAction(el.dataset.action,el);}catch(err){diagnostics.errors.push(`change ${el.dataset.action}: ${err}`);}});
    document.addEventListener('mouseover',event=>{const el=event.target.closest('[data-tooltip]');if(el&&!el.contains(event.relatedTarget))showTooltip(el);});
    document.addEventListener('mouseout',event=>{const el=event.target.closest('[data-tooltip]');if(el&&!el.contains(event.relatedTarget))hideTooltip();});
    document.addEventListener('keydown',event=>{
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
        event.preventDefault();
        const input = root.querySelector('[data-global-search]');
        if (input) { input.focus(); openSearch(input); }
        return;
      }
      if(event.key==='Escape'){hideTooltip();closeSearch();closeOverlay();state.railOpen=false;state.resourceRosterOpen=false;document.querySelector('.pm-shell')?.classList.remove('rail-open');return;}
      focusTrap(event);
      const pop=event.target.closest('.popover');if(pop&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
        const items=[...pop.querySelectorAll('button:not([disabled])')];if(!items.length)return;event.preventDefault();let i=items.indexOf(document.activeElement);if(event.key==='Home')i=0;else if(event.key==='End')i=items.length-1;else i=(i+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;items[i].focus();
      }
    });
    window.addEventListener('popstate',()=>{readHash();renderApp();});
    window.addEventListener('hashchange',()=>{const before=`${state.domain}/${state.workspace}`;readHash();if(before!==`${state.domain}/${state.workspace}`)renderApp();});
    window.addEventListener('resize',()=>{hideTooltip();closeSearch();document.querySelectorAll('.popover').forEach(el=>el.remove());});
  }

  function runCompletenessAudit() {
    const expectedTypes=new Set(['settings','providers','webRoutes','mediaRoutes','bsd','toolchain','testing','memory','goals','personas','owners','sourceControl','notifications','projectSync','projectHistory','permissions','settingsTransfer','backup','doctor','servers','updates']);
    const workspaces=D.domains.flatMap(domain=>domain.workspaces.map(workspace=>({domain:domain.id,id:workspace.id,type:workspace.type})));
    const unknown=workspaces.filter(w=>!expectedTypes.has(w.type));
    return {domains:D.domains.length,workspaces:workspaces.length,unknownWorkspaceTypes:unknown,actionsSeen:Object.keys(diagnostics.actions).length,genericActions:[...new Set(diagnostics.genericActions)],unhandledActions:[...new Set(diagnostics.unhandledActions)],errors:[...diagnostics.errors]};
  }

  function boot() {
    if(!root)throw new Error('Missing #pm-settings-root');
    ensureStateShape();
    readHash();
    bindEvents();
    renderApp();
    diagnostics.booted=true;
    window.PM12_KIMI={
      version:'12.4-complete',
      getState:()=>clone(state),
      setState:next=>{state=mergeState(clone(defaultState),next||{});ensureStateShape();saveState();renderApp();},
      reset:()=>{localStorage.removeItem(STORAGE_KEY);state=clone(defaultState);ensureStateShape();renderApp();},
      navigate,
      renderApp,
      dispatchAction:(action,data={})=>{const el=document.createElement('button');el.dataset.action=action;for(const [k,v] of Object.entries(data))el.dataset[k]=v;dispatchAction(action,el,new Event('click'));},
      diagnostics,
      audit:runCompletenessAudit
    };
  }

  boot();
})();
