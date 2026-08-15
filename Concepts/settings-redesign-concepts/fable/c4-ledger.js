/* fable · Ledger — concept C4 controller (final cumulative packet, 2026-08-08).
   Thesis: object browser. Every setting AND every resource is a record with
   provenance; the INSPECTOR is the only editing surface. Document rows are
   read-only records; selecting one loads it into the inspector (control,
   provenance chain, requested-vs-effective, evidence, reset, risk framing).
   The navigator is a query engine: persistent query bar + state chips that
   filter navigator and document simultaneously (dim, never reflow).
   Native families (packet 08, concept 4): providers/roles/freeRoutes,
   storage, backup, settings lifecycle, history & sessions, runtime
   artifacts, source control & worktrees, GitHub Actions, containers &
   registries, web/search/fetch, project search index, workspace cleanup,
   and the future Server module shell. Context & Instructions moved to c1;
   Skills/Plugins/Tools and Commands & Shortcuts moved to c3 — each is now
   an honest cross-page receipt, never a rebuilt surface.
   Motion philosophy "Instantaneous": zero choreography. CSS declares no
   animations or transitions; jumps are forced to instant scrolls; staged
   operation phases APPEAR as state changes, they never animate.
   Slint notes appear inline where a web technique needs translation. */
(function () {
  'use strict';

  /* Boot order (contract rev 2): PMShell.init -> PMState.init -> build ->
     PMState.bindRouter. The store is assigned in the boot block below. */
  var store;

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

  function fmtInt(n) { return (typeof n === 'number' ? n : 0).toLocaleString(); }

  function fmtTime(iso) {
    if (!iso) { return 'None recorded'; }
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) { return String(iso); }
      return d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch (e) { return String(iso); }
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
    confirmedRisk: {},       // settingId -> bool (expert unlock, per session)
    navOpen: false,
    accountLogsOpen: {},     // providerId/identity -> bool (inline logs)
    installAdvOpen: {},      // installation id -> bool (advanced resolution)
    installHost: {},         // providerId -> chosen install host label
    catalogHistOpen: false,  // free catalog change history disclosure
    histFilter: null,        // sessions project filter (null = from data)
    importMode: null,        // 'merge' | 'replace' (null = from data)
    reset: { scope: 'category', domain: 'general', previewed: false, confirmed: false },
    cleanupConfirm: false,   // cleanup apply confirm gate (per visit)
    pruneConfirm: {}         // worktree id -> bool (prune confirm gate)
  };

  /* Live operation phases (truthful ObservableWork projections). Keyed
     "name:ref"; states appear instantly — zero-motion identity means they
     are state changes, never animations, so reduced motion is identical. */
  var opsLive = {};
  function opKey(name, ref) { return name + ':' + (ref == null ? '' : String(ref)); }
  function opPhase(name, ref) {
    var o = opsLive[opKey(name, ref)];
    return o ? o.phase : null;
  }
  var OP_PHASES = {
    'import-preview': ['reading', 'staged'],
    'import-apply': ['restore-point', 'applying', 'verifying', 'done'],
    'import-rollback': ['rolling-back', 'done'],
    'backup-now': ['snapshotting', 'verifying', 'done'],
    'test-restore': ['restoring-to-scratch', 'verifying-hashes', 'done'],
    'index-rebuild': ['scanning', 'indexing', 'done'],
    'cleanup-dry-run': ['estimating', 'done'],
    'actions-refresh': ['fetching', 'done'],
    'install-update': ['updating', 'verifying', 'ready', 'done'],
    'install-update-fail': ['updating', 'verifying', 'verification-failed', 'rolled-back'],
    'install-repair': ['repairing', 'done']
  };
  var PHASE_LABELS = {
    'reading': 'Reading file', 'staged': 'Preview staged',
    'restore-point': 'Restore point', 'applying': 'Applying', 'verifying': 'Verifying',
    'done': 'Done', 'rolling-back': 'Rolling back',
    'snapshotting': 'Snapshotting', 'verifying-hashes': 'Verifying hashes',
    'restoring-to-scratch': 'Restoring to scratch',
    'scanning': 'Scanning', 'indexing': 'Indexing', 'estimating': 'Estimating',
    'fetching': 'Fetching', 'updating': 'Updating', 'ready': 'Ready',
    'verification-failed': 'Verification failed', 'rolled-back': 'Rolled back',
    'repairing': 'Repairing'
  };
  function phaseStrip(name, ref) {
    var seq = OP_PHASES[name] || [];
    var cur = opPhase(name, ref);
    if (!cur || seq.length === 0) { return null; }
    var curIdx = seq.indexOf(cur);
    var wrap = h('div', { className: 'lg-phases', role: 'status', 'aria-label': 'Operation phases' });
    seq.forEach(function (ph, i) {
      wrap.appendChild(h('span', {
        className: 'lg-phase' + (curIdx >= 0 && i < curIdx ? ' is-done' : (i === curIdx ? ' is-current' : '')),
        text: PHASE_LABELS[ph] || cap(ph.replace(/-/g, ' '))
      }));
    });
    return wrap;
  }

  function fmtMB(mb) {
    if (typeof mb !== 'number') { return String(mb || 'Unknown'); }
    if (mb >= 1024) { return (Math.round(mb / 102.4) / 10) + ' GB'; }
    return Math.round(mb) + ' MB';
  }
  function fmtGB(gb) {
    if (typeof gb !== 'number') { return String(gb || 'Unknown'); }
    return (Math.round(gb * 10) / 10) + ' GB';
  }
  function hostName(hostId) {
    var topo = D().serverTopology || {};
    var hosts = arr(topo.hosts);
    for (var i = 0; i < hosts.length; i++) {
      if (hosts[i] && hosts[i].id === hostId) { return hosts[i].name; }
    }
    return hostId ? String(hostId).replace('host.', '').replace(/-/g, ' ') : 'Unknown host';
  }
  function envName(envId) {
    var topo = D().serverTopology || {};
    var hosts = arr(topo.hosts);
    for (var i = 0; i < hosts.length; i++) {
      var envs = arr(hosts[i] && hosts[i].environments);
      for (var j = 0; j < envs.length; j++) {
        if (envs[j] && envs[j].id === envId) { return envs[j].label; }
      }
    }
    return envId ? String(envId).replace('env.', '') : '';
  }

  /* Generic record row — every new manager renders through this, keeping
     the ledger grammar identical across families. */
  function recRow(opts) {
    var end = h('span', { className: 'lg-row-end' });
    arr(opts.chips).forEach(function (c) {
      if (c) { end.appendChild(chipEl(c[0], c[1], c[2])); }
    });
    if (opts.mono) { end.appendChild(h('span', { className: 'lg-mono', text: opts.mono })); }
    if (opts.word) { end.appendChild(statusWordEl(opts.word[0], opts.word[1])); }
    var attrs = {
      className: 'lg-row' + (opts.inert ? ' is-inert' : '') + (opts.subRow ? ' is-sub' : ''),
      type: 'button', 'aria-pressed': 'false',
      dataset: {
        rec: opts.kind + ':' + opts.id,
        mlabel: (str(opts.label) + ' ' + str(opts.search || '')).toLowerCase()
      }
    };
    if (opts.states) { attrs.dataset.states = opts.states; }
    var row = h('button', attrs,
      h('span', { className: 'lg-row-label' + (opts.monoLabel ? ' lg-mono' : ''), text: opts.label }),
      opts.sub ? h('span', { className: 'lg-row-sub', text: opts.sub }) : null,
      opts.marks || null,
      end
    );
    row.addEventListener('click', function () {
      selectRecord({ kind: opts.kind, id: opts.id, ref: opts.ref });
    });
    return row;
  }

  /* Honest empty state: real guidance, never a blank void. */
  function emptyState(iconName, title, body) {
    return h('div', { className: 'lg-calm' }, ico(iconName || 'info'),
      h('span', null,
        h('strong', { text: title + ' ' }),
        body || ''));
  }

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
    { id: 'providers', label: 'Providers & Models', icon: 'cloud', blurb: 'Accounts, connections, installations, catalogs, routes, and roles.' },
    { id: 'storage', label: 'Storage & Retention', icon: 'disk', blurb: 'The vault, retention classes, pressure, quarantine, and compaction.' },
    { id: 'backup', label: 'Backup & Restore', icon: 'database', blurb: 'Four distinct backup kinds, restore points, and test restores.' },
    { id: 'lifecycle', label: 'Settings Lifecycle', icon: 'undo', blurb: 'Export, import with preview and rollback, and reset to defaults.' },
    { id: 'history', label: 'History & Sessions', icon: 'history', blurb: 'Session records, export, compare, and deletion policy.' },
    { id: 'artifacts', label: 'Runtime Artifacts', icon: 'box', blurb: 'What runs produced, who owns it, where it lives, and how long it stays.' },
    { id: 'sourceControl', label: 'Source Control & Worktrees', icon: 'branch', blurb: 'Tools per host, hosting services, worktrees with leases, and safety.' },
    { id: 'actions', label: 'GitHub Actions', icon: 'workflow', blurb: 'Pinned workflows, current-branch readiness, and setup.' },
    { id: 'containers', label: 'Containers & Registries', icon: 'container', blurb: 'Docker, Podman, Kubernetes tools, clusters, registries, and Unraid.' },
    { id: 'web', label: 'Web, Search & Fetch', icon: 'globe', blurb: 'Provider priority, credit guards, caches, browser programs, and network.' },
    { id: 'searchIndex', label: 'Project Search Index', icon: 'search', blurb: 'Indexing status, exclusions, disk use, rebuilds, and failures.' },
    { id: 'cleanup', label: 'Workspace Cleanup', icon: 'broom', blurb: 'Reclaim space safely — dry run first, leases always protected.' },
    { id: 'servers', label: 'Servers & Modules', icon: 'server', blurb: 'The Home Server, execution hosts, clients, and reserved destinations.' }
  ];
  function managerById(id) {
    for (var i = 0; i < MANAGERS.length; i++) { if (MANAGERS[i].id === id) { return MANAGERS[i]; } }
    return null;
  }
  var NATIVE_VIEWS = {};
  MANAGERS.forEach(function (m) { NATIVE_VIEWS[m.id] = true; });

  var PROVIDER_SECTIONS = [
    { id: 'prov-tools', title: 'Installed tools & signed-in apps', kind: 'tool' },
    { id: 'prov-accounts', title: 'Connected accounts', kind: 'account' },
    { id: 'prov-api', title: 'API connections', kind: 'api' },
    { id: 'prov-servers', title: 'Server connections', kind: 'server' },
    { id: 'prov-free', title: 'Free & community', kind: 'free' },
    { id: 'prov-routes', title: 'Free routes & qualifiers' },
    { id: 'prov-catalog', title: 'Free catalog sources' },
    { id: 'prov-roles', title: 'Role assignments' },
    { id: 'prov-usage', title: 'Usage snapshot' }
  ];
  var STORAGE_SECTIONS = [
    { id: 'st-overview', title: 'Vault & pressure' },
    { id: 'st-usage', title: 'Usage by class' },
    { id: 'st-retention', title: 'Retention classes' },
    { id: 'st-quarantine', title: 'Quarantine' },
    { id: 'st-maintenance', title: 'Compaction & migration' },
    { id: 'st-settings', title: 'Storage settings' },
    { id: 'st-receipts', title: 'Receipts' }
  ];
  var BACKUP_SECTIONS = [
    { id: 'bk-kinds', title: 'The four kinds of backup' },
    { id: 'bk-points', title: 'Restore points' },
    { id: 'bk-schedule', title: 'Schedules, actions & status' },
    { id: 'bk-test', title: 'Test restore' },
    { id: 'bk-encryption', title: 'Encryption' }
  ];
  var LIFECYCLE_SECTIONS = [
    { id: 'lc-export', title: 'Export' },
    { id: 'lc-import', title: 'Import' },
    { id: 'lc-history', title: 'History' },
    { id: 'lc-reset', title: 'Reset to defaults' }
  ];
  var HISTORY_SECTIONS = [
    { id: 'hs-sessions', title: 'Sessions' },
    { id: 'hs-policy', title: 'Policy & actions' }
  ];
  var ARTIFACTS_SECTIONS = [
    { id: 'ar-entries', title: 'Artifacts' }
  ];
  var SC_SECTIONS = [
    { id: 'sc-overview', title: 'Overview' },
    { id: 'sc-repos', title: 'Repositories & source locations' },
    { id: 'sc-tools', title: 'Git & Jujutsu' },
    { id: 'sc-hosting', title: 'Hosting services' },
    { id: 'sc-auth', title: 'Accounts & sign-in' },
    { id: 'sc-envs', title: 'Execution environments' },
    { id: 'sc-worktrees', title: 'Worktrees & parallel work' },
    { id: 'sc-safety', title: 'Branch, push & merge safety' },
    { id: 'sc-updates', title: 'Automatic updates' },
    { id: 'sc-diagnostics', title: 'Diagnostics & receipts' }
  ];
  var ACTIONS_SECTIONS = [
    { id: 'gh-pinned', title: 'Pinned workflows' },
    { id: 'gh-runs', title: 'Recent runs' },
    { id: 'gh-setup', title: 'Account & setup' }
  ];
  var CONTAINERS_SECTIONS = [
    { id: 'ct-engines', title: 'Engines & tools' },
    { id: 'ct-clusters', title: 'Clusters' },
    { id: 'ct-registries', title: 'Registries' },
    { id: 'ct-unraid', title: 'Unraid publishing' }
  ];
  var WEB_SECTIONS = [
    { id: 'wb-providers', title: 'Providers & priority' },
    { id: 'wb-limits', title: 'Limits' },
    { id: 'wb-caches', title: 'Caches' },
    { id: 'wb-browser', title: 'Browser programs' },
    { id: 'wb-network', title: 'Proxy, certificates & air-gap' }
  ];
  var INDEX_SECTIONS = [
    { id: 'ix-status', title: 'Status & rebuild' },
    { id: 'ix-policy', title: 'Exclusions & policy' },
    { id: 'ix-failures', title: 'Failures' }
  ];
  var CLEANUP_SECTIONS = [
    { id: 'cu-categories', title: 'What can be reclaimed' },
    { id: 'cu-dryrun', title: 'Dry run & apply' }
  ];
  var SERVERS_SECTIONS = [
    { id: 'sv-server', title: 'Connected server' },
    { id: 'sv-project', title: 'This project' },
    { id: 'sv-hosts', title: 'Execution hosts & environments' },
    { id: 'sv-clients', title: 'Clients' },
    { id: 'sv-modules', title: 'Reserved destinations' }
  ];
  var MANAGER_SECTION_DEFS = {
    providers: PROVIDER_SECTIONS, storage: STORAGE_SECTIONS, backup: BACKUP_SECTIONS,
    lifecycle: LIFECYCLE_SECTIONS, history: HISTORY_SECTIONS, artifacts: ARTIFACTS_SECTIONS,
    sourceControl: SC_SECTIONS, actions: ACTIONS_SECTIONS, containers: CONTAINERS_SECTIONS,
    web: WEB_SECTIONS, searchIndex: INDEX_SECTIONS, cleanup: CLEANUP_SECTIONS,
    servers: SERVERS_SECTIONS
  };

  /* Managers this concept does NOT build. Search returns them as honest
     manager-receipt results; the home page lists the moved ones as receipt
     records with real cross-page links. */
  var COVERED_IN = {
    'manager.memory': { concept: 'c1-atlas', page: 'c1-atlas.html', label: 'fable · Atlas (c1)' },
    'manager.personas': { concept: 'c1-atlas', page: 'c1-atlas.html', label: 'fable · Atlas (c1)' },
    'manager.crew': { concept: 'c1-atlas', page: 'c1-atlas.html', label: 'fable · Atlas (c1)' },
    'manager.contextSources': { concept: 'c1-atlas', page: 'c1-atlas.html', label: 'fable · Atlas (c1)' },
    'manager.permissions': { concept: 'c1-atlas', page: 'c1-atlas.html', label: 'fable · Atlas (c1)' },
    'manager.bsd': { concept: 'c1-atlas', page: 'c1-atlas.html', label: 'fable · Atlas (c1)' },
    'manager.goal': { concept: 'c1-atlas', page: 'c1-atlas.html', label: 'fable · Atlas (c1)' },
    'manager.notifications': { concept: 'c2-mission-control', page: 'c2-mission-control.html', label: 'fable · Mission Control (c2)' },
    'manager.sounds': { concept: 'c2-mission-control', page: 'c2-mission-control.html', label: 'fable · Mission Control (c2)' },
    'manager.appearance': { concept: 'c2-mission-control', page: 'c2-mission-control.html', label: 'fable · Mission Control (c2)' },
    'manager.desktop': { concept: 'c2-mission-control', page: 'c2-mission-control.html', label: 'fable · Mission Control (c2)' },
    'manager.teacher': { concept: 'c2-mission-control', page: 'c2-mission-control.html', label: 'fable · Mission Control (c2)' },
    'manager.dictionary': { concept: 'c2-mission-control', page: 'c2-mission-control.html', label: 'fable · Mission Control (c2)' },
    'manager.media': { concept: 'c2-mission-control', page: 'c2-mission-control.html', label: 'fable · Mission Control (c2)' },
    'manager.mcp': { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'fable · Focus Stack (c3)' },
    'manager.lsp': { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'fable · Focus Stack (c3)' },
    'manager.skills': { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'fable · Focus Stack (c3)' },
    'manager.plugins': { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'fable · Focus Stack (c3)' },
    'manager.tools': { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'fable · Focus Stack (c3)' },
    'manager.commands': { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'fable · Focus Stack (c3)' },
    'manager.terminalProfiles': { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'fable · Focus Stack (c3)' },
    'manager.fileManager': { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'fable · Focus Stack (c3)' },
    'manager.formatters': { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'fable · Focus Stack (c3)' },
    'manager.testing': { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'fable · Focus Stack (c3)' }
  };

  /* The three manager families that MOVED OUT of this concept in the final
     packet — rendered on the home ledger as honest receipt records. */
  var MOVED_RECEIPTS = [
    { managerId: 'manager.contextSources', label: 'Context & Instructions', note: 'Moved to concept 1 — the full manager lives there.' },
    { managerId: 'manager.skills', label: 'Skills, Plugins & Tools', note: 'Moved to concept 3 — the exposure funnel lives there.' },
    { managerId: 'manager.commands', label: 'Commands & Shortcuts', note: 'Moved to concept 3 — remapping and conflicts live there.' }
  ];

  /* Deterministic deep-link routing: the hash owns navigation. writeRoute
     pushes on view changes (Back/forward is real) and replaces on
     scroll-driven updates. applyingRoute suppresses echo writes while the
     router itself is opening a link. */
  var applyingRoute = false;

  function routeForView(view) {
    if (view.kind === 'domain') { return { kind: 'dest', domainId: view.id, subId: view.subId || null }; }
    if (view.kind === 'manager') { return { kind: 'manager', managerId: 'manager.' + view.id }; }
    return { kind: 'home' };
  }

  function writeViewRoute(opts) {
    if (applyingRoute) { return; }
    try { window.PMState.writeRoute(routeForView(ui.view), opts || {}); } catch (e) { /* router optional */ }
  }

  function setView(view) {
    ui.view = view;
    ui.selected = null;
    ui.navOpen = false;
    els.root.classList.remove('nav-open');
    if (els.navBtn) { els.navBtn.setAttribute('aria-expanded', 'false'); }
    ui.cleanupConfirm = false;
    ui.reset.previewed = false;
    ui.reset.confirmed = false;
    store.set('view', { kind: view.kind, id: view.id || null });
    renderAll();
    els.doc.scrollTop = 0;
    updateStatusbar();
    writeViewRoute();
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
    if (!s) {
      window.PMState.receipt('Open setting', 'That record is not in the demo dataset.');
      return;
    }
    if (!loc) {
      /* A real row without a taxonomy slot (e.g. the deep-link probe target
         before its sub lands): the home all-records table lists it, and the
         inspector is the editing surface either way. */
      if (ui.view.kind !== 'home') { setView({ kind: 'home' }); }
      selectRecord({ kind: 'setting', id: sid });
      if (!applyingRoute) {
        try { window.PMState.writeRoute({ kind: 'setting', settingId: sid }); } catch (e) { /* router optional */ }
      }
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
    if (!applyingRoute) {
      try { window.PMState.writeRoute({ kind: 'setting', settingId: sid }); } catch (e) { /* router optional */ }
    }
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
     build resolve through the shared manifest to an honest cross-page
     receipt — never a silent no-op, never a rebuilt surface. */
  function routeManager(shortId, label) {
    if (shortId === 'roles') { revealManagerRecord('providers', 'prov-roles', null); return; }
    if (shortId === 'freeRoutes') { revealManagerRecord('providers', 'prov-routes', null); return; }
    if (NATIVE_VIEWS[shortId]) { openManager(shortId); return; }
    openCovered('manager.' + shortId, label);
  }

  /* An honest receipt for a manager proven in a sibling concept: the
     inspector holds the record with the real cross-page link. */
  function openCovered(managerId, label) {
    var cov = COVERED_IN[managerId] || null;
    try {
      var avail = window.PMState.managerAvailability(managerId);
      if (avail && avail.coveredIn) { cov = avail.coveredIn; }
    } catch (e) { /* manifest optional */ }
    selectRecord({ kind: 'covered', id: managerId, ref: cov });
    window.PMState.receipt('Open ' + (label || managerId.replace('manager.', '')),
      cov ? 'That manager is proven in ' + cov.label + '. The inspector holds the cross-page link — this concept never rebuilds it.'
        : 'That manager is not part of this bakeoff concept.');
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
      case 'open-lifecycle':
        openManager('lifecycle');
        return;
      case 'open-storage':
        openManager('storage');
        return;
      case 'open-web':
        openManager('web');
        return;
      case 'open-appearance':
        openCovered('manager.appearance', 'Appearance');
        return;
      case 'open-permissions':
        openDomain('permissions');
        return;
      case 'cleanup-dry-run':
        openManager('cleanup');
        window.PMState.trigger('cleanup-dry-run');
        return;
      case 'index-rebuild':
        openManager('searchIndex');
        window.PMState.trigger('index-rebuild');
        return;
      case 'open-changed':
        revealSetting('general.startup.restore-panel');
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
    return MANAGER_SECTION_DEFS[id] || [];
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
    /* Scroll-driven route update: replace, never push. */
    if (!applyingRoute && ui.view.kind === 'domain' && activeId && activeId.indexOf('lgsec-') === 0) {
      var subId = activeId.slice(6);
      if (subId.indexOf('diag-') !== 0) {
        try {
          window.PMState.writeRoute({ kind: 'dest', domainId: ui.view.id, subId: subId }, { replace: true });
        } catch (e) { /* router optional */ }
      }
    }
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

    /* Honest receipts for the manager families that moved to sibling
       concepts in the final packet. Real cross-page links, kind "receipt" —
       this concept never pretends to own them. */
    doc.appendChild(h('div', { className: 'lg-home-h' }, h('h2', { text: 'Covered in sibling concepts' }),
      h('span', { className: 'lg-home-note', text: 'Receipt records — each opens the concept that proves the manager' })));
    var covIdx = h('div', { className: 'lg-index', role: 'list' });
    MOVED_RECEIPTS.forEach(function (mr) {
      var cov = COVERED_IN[mr.managerId] || {};
      covIdx.appendChild(h('a', {
        className: 'lg-index-row is-link', role: 'listitem',
        href: str(cov.page) ? cov.page + '#/manager/' + mr.managerId : '#'
      },
        h('span', { className: 'lg-index-num', text: 'R' }),
        h('span', { className: 'lg-index-ico' }, ico('external')),
        h('span', { className: 'lg-index-main' },
          h('div', { className: 'lg-index-title', text: mr.label }),
          h('div', { className: 'lg-index-blurb', text: mr.note + ' Opens ' + (cov.label || 'the sibling concept') + '.' })
        ),
        h('span', { className: 'lg-index-status', text: 'Receipt' }),
        h('span', { className: 'lg-index-open' }, 'Open', ico('external'))
      ));
    });
    doc.appendChild(covIdx);

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

  var MANAGER_RENDERERS = {};
  function renderManager(managerId) {
    var fn = MANAGER_RENDERERS[managerId] || renderProvidersManager;
    fn();
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
          arr(p.installations).forEach(function (inst) { sec.appendChild(installationRowEl(p, inst)); });
          arr(p.models).forEach(function (m) { sec.appendChild(modelRowEl(p, m)); });
        });
        doc.appendChild(sec);
      } else if (secDef.id === 'prov-routes') {
        var routes = arr(D().freeRoutes);
        var sec2 = sectionEl(secDef.id, '', secDef.title, routes.length + ' routes',
          'No route is ever labeled plain "Free" — each carries its qualifier and one of six honest states.');
        routes.forEach(function (fr) { sec2.appendChild(freeRouteRowEl(fr)); });
        doc.appendChild(sec2);
      } else if (secDef.id === 'prov-catalog') {
        doc.appendChild(freeCatalogSectionEl(secDef));
      } else if (secDef.id === 'prov-roles') {
        var roles = arr(D().roles);
        var sec3 = sectionEl(secDef.id, '', secDef.title, roles.length + ' roles',
          'Which route each responsibility uses. Requested and effective routes are shown separately; nothing silently downgrades.');
        roles.forEach(function (r) { sec3.appendChild(roleRowEl(r)); });
        doc.appendChild(sec3);
      } else if (secDef.id === 'prov-usage') {
        doc.appendChild(usageSectionEl(secDef));
      }
    });
  }

  /* Installation record row: one humanized card per installation, collapsed
     to a ledger row. The inspector holds the resolution chain. */
  function installationRowEl(p, inst) {
    var ri = window.PMProvider.resolveInstallation(inst);
    var liveKey = p.id + '/' + inst.id;
    var busyPhase = opPhase('install-update', liveKey) || opPhase('install-update-fail', liveKey) || opPhase('install-repair', liveKey);
    var states = [];
    if (ri.update.tone === 'attention') { states.push('attention'); }
    var chips = [];
    if (ri.selected) { chips.push(['default', 'Selected']); }
    if (ri.shadowed) { chips.push(['not-configured', 'Shadowed', ri.shadowNote || '']); }
    if (ri.manualOnly) { chips.push(['managed', 'Manual only', ri.manualOnlyReason || '']); }
    var word = null;
    if (busyPhase && busyPhase !== 'done') {
      word = ['setup', PHASE_LABELS[busyPhase] || cap(busyPhase)];
    } else if (ri.update.state !== 'up-to-date') {
      word = [ri.update.tone === 'progress' ? 'setup' : ri.update.tone, ri.update.label];
    }
    return recRow({
      kind: 'installation', id: inst.id, ref: p.id, subRow: true,
      label: ri.title || inst.id,
      sub: 'v' + (ri.version || '?') + ' · ' + hostName(inst.hostId),
      search: p.name + ' installation ' + str(inst.method),
      chips: chips, word: word,
      states: states.join(' ')
    });
  }

  /* Free catalog sources: freshness records + change history. */
  function freeCatalogSectionEl(secDef) {
    var cat = D().freeCatalog || {};
    var sources = arr(cat.sources);
    var sec = sectionEl(secDef.id, '', secDef.title, sources.length + ' sources',
      'Models.dev and Free Coding Models refresh continuously. Validation failures fall back to the last known good import.');
    if (sources.length === 0) {
      sec.appendChild(emptyState('info', 'No catalog sources yet.', 'Free catalogs appear once a free route is configured.'));
      return sec;
    }
    sources.forEach(function (s) {
      var stale = s.validation === 'stale';
      sec.appendChild(recRow({
        kind: 'freeCatalogSource', id: s.id,
        label: s.name, sub: 'Source version ' + str(s.sourceVersion),
        search: 'catalog freshness ' + s.id,
        chips: [[stale ? 'not-configured' : 'default', stale ? 'Stale · last known good' : 'Validated', '']],
        mono: 'checked ' + fmtTime(s.lastChecked)
      }));
    });
    var open = ui.catalogHistOpen;
    sec.appendChild(h('button', {
      className: 'lg-disclosure', type: 'button', 'aria-expanded': open ? 'true' : 'false',
      onClick: function () { ui.catalogHistOpen = !ui.catalogHistOpen; renderDoc(); if (spyCtl) { spyCtl.refresh(); } }
    }, ico(open ? 'chevD' : 'chevR'), 'Change history (' + arr(cat.changeHistory).length + ')'));
    if (open) {
      var drawer = h('div', { className: 'lg-drawer' });
      arr(cat.changeHistory).forEach(function (c, i) {
        drawer.appendChild(h('div', { className: 'lg-row is-inert', tabindex: '0', dataset: { rec: 'catalogChange:' + i } },
          h('span', { className: 'lg-row-label', text: c.change }),
          h('span', { className: 'lg-row-end' }, h('span', { className: 'lg-mono', text: fmtTime(c.when) }))
        ));
      });
      sec.appendChild(drawer);
    }
    return sec;
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
    var rr = window.PMProvider.resolveFreeRoute(fr);
    var states = [];
    if (rr.state === 'no-longer-available') { states.push('unavailable'); }
    if (rr.tone === 'attention') { states.push('attention'); }
    return recRow({
      kind: 'freeRoute', id: fr.id,
      label: name, sub: under ? 'via ' + under.name : '',
      search: 'free route ' + str(fr.qualifier),
      chips: [[fr.qualifier === 'temporarily-unavailable' ? 'unavailable' : 'custom',
        QUALIFIER_LABELS[fr.qualifier] || 'Qualified route']],
      word: [rr.tone, rr.label],
      states: states.join(' '),
      inert: rr.state === 'no-longer-available'
    });
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

  /* ------------------------------------------------- storage manager --- */

  function renderStorageManager() {
    var doc = els.doc;
    var st = D().storage || {};
    var usage = st.usage || {};
    var pressure = st.pressure || {};
    doc.appendChild(managerHeader(managerById('storage'),
      'The vault holds ' + fmtGB(usage.totalGB || 0) + ' across ' + arr(usage.byClass).length +
      ' data classes. Every class, hold, and quarantined item is a record; select one to inspect.', null, null));

    var sec0 = sectionEl('st-overview', '', 'Vault & pressure', '', '');
    sec0.appendChild(recRow({
      kind: 'storageVault', id: 'vault', label: 'Vault',
      sub: st.mode === 'managed-vault' ? 'Managed vault' : cap(str(st.mode)),
      search: 'vault path storage mode', mono: str(st.vaultPath)
    }));
    var pTone = pressure.state === 'critical' ? 'attention' : (pressure.state === 'elevated' ? 'setup' : 'ok');
    sec0.appendChild(recRow({
      kind: 'storagePressure', id: 'pressure', label: 'Pressure',
      sub: fmtGB(pressure.freeGB) + ' free',
      search: 'disk pressure full space',
      word: [pTone, pressure.state === 'critical' ? 'Critical' : (pressure.state === 'elevated' ? 'Elevated' : 'Normal')],
      states: pTone === 'attention' ? 'attention' : ''
    }));
    doc.appendChild(sec0);

    var byClass = arr(usage.byClass);
    var sec1 = sectionEl('st-usage', '', 'Usage by class', fmtGB(usage.totalGB || 0) + ' total', '');
    if (byClass.length > 0) {
      /* Static stacked bar — proportions, no animation. Slint note: a
         HorizontalLayout of weighted rectangles over the same model. */
      var bar = h('div', { className: 'lg-usagebar', role: 'img', 'aria-label': 'Vault usage by class' });
      var total = Math.max(0.001, usage.totalGB || 0);
      byClass.forEach(function (c, i) {
        bar.appendChild(h('span', {
          className: 'lg-usagebar-seg lg-seg-' + (i % 4),
          style: 'width:' + Math.max(2, Math.round((c.gb / total) * 100)) + '%',
          title: c.label + ' · ' + fmtGB(c.gb)
        }));
      });
      sec1.appendChild(bar);
    }
    byClass.forEach(function (c) {
      sec1.appendChild(recRow({
        kind: 'usageClass', id: c.classId, label: c.label,
        search: 'usage class disk', mono: fmtGB(c.gb)
      }));
    });
    doc.appendChild(sec1);

    var sec2 = sectionEl('st-retention', '', 'Retention classes', arr(st.retention).length + ' records',
      'Each data class has its own retention. Legal holds pin evidence beyond normal expiry.');
    arr(st.retention).forEach(function (r) {
      var chips = [];
      if (r.legalHold) { chips.push(['managed', 'Legal hold', r.note || '']); }
      sec2.appendChild(recRow({
        kind: 'retentionClass', id: r.classId, label: r.label,
        sub: r.days != null ? r.days + ' days' : (r.policy === 'until-project-delete' ? 'Until the project is deleted' : cap(str(r.policy))),
        search: 'retention days legal hold',
        chips: chips, states: r.legalHold ? 'managed' : ''
      }));
    });
    doc.appendChild(sec2);

    var q = arr(st.quarantine);
    var sec3 = sectionEl('st-quarantine', '', 'Quarantine', q.length ? q.length + ' item' + (q.length === 1 ? '' : 's') : '', '');
    if (q.length === 0) {
      sec3.appendChild(emptyState('checkCircle', 'Nothing is quarantined.',
        'Items that fail integrity checks are isolated here for inspection instead of being deleted.'));
    } else {
      q.forEach(function (item) {
        sec3.appendChild(recRow({
          kind: 'quarantineItem', id: item.id, label: item.item,
          sub: fmtTime(item.when), search: 'quarantine integrity',
          word: ['attention', 'Quarantined'], states: 'attention'
        }));
      });
    }
    doc.appendChild(sec3);

    var sec4 = sectionEl('st-maintenance', '', 'Compaction & migration', '', '');
    var comp = st.compaction || {};
    sec4.appendChild(recRow({
      kind: 'storageMaint', id: 'compaction', label: 'Compaction',
      sub: 'Status record', search: 'compaction reclaim',
      mono: comp.lastRun ? ('last ' + fmtTime(comp.lastRun) + ' · ' + fmtMB(comp.reclaimedMB) + ' reclaimed') : 'never run'
    }));
    var mig = st.migration || {};
    if (mig.offer) {
      sec4.appendChild(recRow({
        kind: 'storageMaint', id: 'migration', label: 'Layout migration',
        sub: mig.offer === 'idle' ? 'Offered — runs when idle' : cap(str(mig.offer)),
        search: 'migration vault format',
        chips: [['recommended', 'When idle', mig.note || '']]
      }));
    }
    doc.appendChild(sec4);

    var sec5 = sectionEl('st-settings', '', 'Storage settings', '',
      'Ordinary setting records — same grammar, same inspector.');
    ['system.storage.evidence-retention', 'system.storage.pressure-action'].forEach(function (sid) {
      var s = settings()[sid];
      if (s) { sec5.appendChild(settingRowEl(s)); }
    });
    doc.appendChild(sec5);

    doc.appendChild(receiptsSectionEl('st-receipts', arr(st.receipts)));
  }

  function receiptsSectionEl(secId, receipts) {
    var sec = sectionEl(secId, '', 'Receipts', receipts.length ? receipts.length + ' kept' : '',
      'Durable records of what actually ran.');
    if (receipts.length === 0) {
      sec.appendChild(emptyState('doc', 'No receipts yet.', 'Every completed operation leaves one here.'));
      return sec;
    }
    receipts.forEach(function (r) {
      sec.appendChild(recRow({
        kind: 'receiptRec', id: r.id, label: r.label,
        search: 'receipt', mono: fmtTime(r.when)
      }));
    });
    return sec;
  }

  /* -------------------------------------------------- backup manager --- */

  function renderBackupManager() {
    var doc = els.doc;
    var bk = D().backups || {};
    var points = arr(bk.restorePoints);
    doc.appendChild(managerHeader(managerById('backup'),
      'Four distinct kinds of backup — never conflated. ' + points.length +
      (points.length === 1 ? ' restore point' : ' restore points') + ' on record.',
      'Back up now', function () {
        window.PMState.trigger('backup-now', 'bk.settings');
      }));

    var sec0 = sectionEl('bk-kinds', '', 'The four kinds of backup', arr(bk.kinds).length + ' kinds',
      'Internal recovery snapshots, settings backups, project backups, and full Server backups are different things with different owners.');
    arr(bk.kinds).forEach(function (k) {
      sec0.appendChild(recRow({
        kind: 'backupKind', id: k.id, label: k.label, sub: k.note,
        search: 'backup kind ' + k.id
      }));
    });
    doc.appendChild(sec0);

    var sec1 = sectionEl('bk-points', '', 'Restore points', points.length ? points.length + ' records' : '', '');
    var bkPhase = opPhase('backup-now', 'bk.settings');
    if (bkPhase && bkPhase !== 'done') {
      sec1.appendChild(phaseStrip('backup-now', 'bk.settings'));
    }
    if (points.length === 0) {
      sec1.appendChild(emptyState('database', 'No restore points yet.',
        'The first settings import creates one automatically before anything is applied; project backups start on their schedule.'));
    } else {
      points.forEach(function (rp) {
        var chips = [];
        if (rp.encrypted) { chips.push(['default', 'Encrypted']); }
        var word;
        if (rp.verified) { word = ['ok', 'Verified']; }
        else if (rp.verification === 'pending') { word = ['setup', 'Verification pending']; }
        else { word = ['attention', 'Not verified']; }
        sec1.appendChild(recRow({
          kind: 'restorePoint', id: rp.id, label: rp.label,
          sub: backupKindLabel(rp.kind) + (rp.target ? ' · ' + rp.target : ''),
          search: 'restore point backup',
          chips: chips, word: word, mono: fmtTime(rp.when),
          states: rp.verified ? '' : 'attention'
        }));
      });
    }
    doc.appendChild(sec1);

    /* Action vs setting vs status vs manager — kept visibly distinct
       (packet 02's canonical example, rendered literally). */
    var sec2 = sectionEl('bk-schedule', '', 'Schedules, actions & status', '',
      'One-shot actions, persistent settings, and read-only status are different record kinds and say so.');
    var actRow = recRow({
      kind: 'backupAction', id: 'backup-now', label: 'Back Up Now',
      sub: 'Runs one settings backup and verifies it',
      search: 'back up now action', chips: [['custom', 'Action']]
    });
    sec2.appendChild(actRow);
    var schedSetting = settings()['system.backup.project-schedule'];
    if (schedSetting) { sec2.appendChild(settingRowEl(schedSetting)); }
    var sched = bk.schedule || {};
    sec2.appendChild(recRow({
      kind: 'backupStatus', id: 'schedule-settings', label: 'Settings backup schedule',
      sub: str(sched.settings) === 'on-change' ? 'On every change' : str(sched.settings),
      search: 'schedule settings backup', chips: [['default', 'Status']]
    }));
    sec2.appendChild(recRow({
      kind: 'backupStatus', id: 'schedule-server', label: 'Full Server backup schedule',
      sub: str(sched.server) + ' — owned by the server itself',
      search: 'schedule server backup', chips: [['default', 'Status']]
    }));
    sec2.appendChild(recRow({
      kind: 'backupStatus', id: 'last-backup', label: 'Last backup',
      sub: points.length ? (points[0].label + ' · ' + fmtTime(points[0].when)) : 'None yet',
      search: 'last backup status', chips: [['default', 'Status']]
    }));
    doc.appendChild(sec2);

    var sec3 = sectionEl('bk-test', '', 'Test restore', '',
      'Restores the newest point to a scratch dataset and verifies hashes. The live project is never touched.');
    var trPhase = opPhase('test-restore', null);
    if (trPhase && trPhase !== 'done') { sec3.appendChild(phaseStrip('test-restore', null)); }
    var tr = (bk.testRestore && bk.testRestore.last) || null;
    if (tr) {
      sec3.appendChild(recRow({
        kind: 'testRestore', id: 'last', label: 'Last test restore',
        sub: 'Restored ' + str(tr.point) + ' to the ' + str(tr.target),
        search: 'test restore verify',
        word: [tr.result === 'passed' ? 'ok' : 'attention', tr.result === 'passed' ? 'Passed' : 'Failed'],
        mono: fmtTime(tr.when)
      }));
    } else {
      sec3.appendChild(emptyState('beaker', 'No test restore yet.',
        'Run one to prove the newest restore point actually restores.'));
    }
    sec3.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button', disabled: points.length === 0,
        onClick: function () { window.PMState.trigger('test-restore'); }
      }, ico('beaker'), 'Run test restore')));
    doc.appendChild(sec3);

    var enc = bk.encryption || {};
    var sec4 = sectionEl('bk-encryption', '', 'Encryption', '', '');
    sec4.appendChild(recRow({
      kind: 'backupEncryption', id: 'encryption', label: 'Backup encryption',
      sub: enc.enabled ? 'On · key owned by the ' + str(enc.keyOwner || 'PM vault') : 'Off',
      search: 'encryption key vault',
      word: enc.enabled ? ['ok', 'Encrypted'] : ['setup', 'Not encrypted']
    }));
    doc.appendChild(sec4);
  }

  function backupKindLabel(kindId) {
    var kinds = (D().backups && arr(D().backups.kinds)) || [];
    for (var i = 0; i < kinds.length; i++) { if (kinds[i].id === kindId) { return kinds[i].label; } }
    return 'Backup';
  }

  /* ----------------------------------------- settings lifecycle manager */

  function renderLifecycleManager() {
    var doc = els.doc;
    var lc = D().settingsLifecycle || {};
    var pv = lc.importPreview || {};
    doc.appendChild(managerHeader(managerById('lifecycle'),
      'Import is transactional: preview, restore point, atomic apply, verification, receipt, and one-click rollback. No raw format dropdown — the file is the format.',
      pv.state === 'dormant' || !pv.state ? 'Import settings file' : null,
      function () {
        window.PMState.trigger('import-preview');
      }));

    var sec0 = sectionEl('lc-export', '', 'Export', '', '');
    if (lc.lastExport) {
      sec0.appendChild(recRow({
        kind: 'exportRecord', id: 'last-export', label: str(lc.lastExport.file),
        sub: 'Scope: ' + str(lc.lastExport.scope) + ' · secrets never travel',
        search: 'export settings file', monoLabel: true,
        mono: fmtTime(lc.lastExport.when)
      }));
    } else {
      sec0.appendChild(emptyState('upload', 'Nothing exported yet.',
        'Export writes a portable settings file. Secrets stay behind vault references and never travel.'));
    }
    sec0.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () {
          window.PMState.receipt('Export settings',
            'A portable settings file would be written with a receipt. Secrets are excluded by design.');
        }
      }, ico('download'), 'Export now')));
    doc.appendChild(sec0);

    doc.appendChild(lifecycleImportSectionEl(lc, pv));

    var hist = arr(lc.history);
    var sec2 = sectionEl('lc-history', '', 'History', hist.length ? hist.length + ' events' : '',
      'Applied imports and rollbacks, each with its receipt. A rollback receipt records both directions.');
    if (hist.length === 0) {
      sec2.appendChild(emptyState('history', 'No lifecycle events yet.',
        'Applied imports, rollbacks, and resets are recorded here with receipts.'));
    } else {
      hist.forEach(function (ev, i) {
        var isRollback = ev.action === 'rollback-complete';
        sec2.appendChild(recRow({
          kind: 'lifecycleEvent', id: String(i),
          label: isRollback ? 'Rollback complete' : (ev.action === 'import-applied' ? 'Import applied' : cap(str(ev.action).replace(/-/g, ' '))),
          sub: str(ev.detail),
          search: 'history import rollback receipt',
          chips: [['default', 'Receipt', str(ev.receiptId)]],
          mono: fmtTime(ev.when)
        }));
      });
    }
    doc.appendChild(sec2);

    var sec3 = sectionEl('lc-reset', '', 'Reset to defaults', '',
      'Scoped to one category or everything. Preview first; apply is gated behind an explicit confirmation.');
    sec3.appendChild(recRow({
      kind: 'resetDefaults', id: 'reset', label: 'Reset settings to defaults',
      sub: 'Select to choose a scope, preview the effect, and confirm',
      search: 'reset defaults restore',
      chips: [['custom', 'Action']]
    }));
    if (lc.reset && lc.reset.lastReset) {
      sec3.appendChild(recRow({
        kind: 'backupStatus', id: 'last-reset', label: 'Last reset',
        sub: str(lc.reset.lastReset), search: 'last reset', chips: [['default', 'Status']]
      }));
    }
    doc.appendChild(sec3);
  }

  function lifecycleImportSectionEl(lc, pv) {
    var state = str(pv.state) || 'dormant';
    var counts = pv.counts || {};
    var sec = sectionEl('lc-import', '', 'Import', state === 'dormant' ? '' : cap(state.replace(/-/g, ' ')), '');

    var applyPhase = opPhase('import-apply', null);
    var rbPhase = opPhase('import-rollback', null);
    if (applyPhase && state !== 'applied') { sec.appendChild(phaseStrip('import-apply', null)); }
    if (rbPhase && state === 'applied') { sec.appendChild(phaseStrip('import-rollback', null)); }

    if (state === 'dormant') {
      sec.appendChild(emptyState('download', 'No import in progress.',
        'Choose a settings file to stage a full preview. Nothing is applied until you confirm, and a restore point is created first.'));
      return sec;
    }

    /* The import itself is a record — select it to review counts and act. */
    var stateWord = { staged: ['setup', 'Preview staged'], applying: ['setup', 'Applying'], applied: ['ok', 'Applied'], 'rolled-back': ['ok', 'Rolled back'] }[state] || ['setup', cap(state)];
    sec.appendChild(recRow({
      kind: 'importState', id: 'import', label: str(pv.source) || 'Settings import',
      sub: 'Created on ' + str(pv.createdOn) + ' · mode: ' + (ui.importMode || str(pv.mode) || 'merge'),
      search: 'import preview staged conflicts', monoLabel: true,
      word: stateWord
    }));

    if (state === 'staged') {
      /* Count strip: add / change / conflict / invalid / legacy-migrated. */
      var strip = h('div', { className: 'lg-counts', role: 'group', 'aria-label': 'Import preview counts' });
      [['Add', counts.add], ['Change', counts.change], ['Conflicts', counts.conflict],
       ['Invalid', counts.invalid], ['Migrated', counts.legacyMigrated]].forEach(function (c) {
        strip.appendChild(h('span', { className: 'lg-count-cell' + (c[0] === 'Conflicts' && c[1] ? ' is-conflict' : '') },
          h('span', { className: 'lg-mono', text: String(c[1] == null ? 0 : c[1]) }), c[0]));
      });
      sec.appendChild(strip);

      arr(pv.conflicts).forEach(function (c) {
        sec.appendChild(recRow({
          kind: 'importConflict', id: c.settingId,
          label: settingLabelFor(c.settingId),
          sub: 'Local: ' + str(c.local) + ' · Incoming: ' + str(c.incoming),
          search: 'conflict import ' + c.settingId,
          word: ['attention', 'Conflict'], states: 'attention'
        }));
      });
      arr(pv.invalid).forEach(function (iv) {
        sec.appendChild(recRow({
          kind: 'importInvalid', id: iv.key, label: iv.key, monoLabel: true,
          sub: str(iv.reason), search: 'invalid key skipped',
          chips: [['unavailable', 'Will be skipped']], states: 'unavailable'
        }));
      });
      arr(pv.legacyMigrated).forEach(function (lm, i) {
        sec.appendChild(recRow({
          kind: 'legacyMigration', id: String(i),
          label: lm.from + '  ->  ' + lm.to, monoLabel: true,
          sub: 'Legacy key migrated automatically',
          search: 'legacy key migration',
          chips: [['auto', 'Migrated']]
        }));
      });
      sec.appendChild(h('p', { className: 'lg-drawer-note', text: str(pv.secretNote) +
        ' Managed rows are excluded from import. Restore point ' + str(pv.restorePointId) + ' is staged before anything applies.' }));
    }

    if (state === 'applied') {
      sec.appendChild(h('p', { className: 'lg-drawer-note', text: 'The import applied atomically after verification. Rollback stays one click away in the import record inspector.' }));
    }
    if (state === 'rolled-back') {
      var rb = lc.rollbackJustCompleted || {};
      sec.appendChild(h('div', { className: 'lg-calm' }, ico('checkCircle'),
        h('span', null, h('strong', { text: 'Rollback complete. ' }),
          str(rb.detail) || 'Settings match the pre-import snapshot again.')));
    }
    return sec;
  }

  function settingLabelFor(sid) {
    var s = settings()[sid];
    return s ? str(s.label) : sid;
  }

  /* ------------------------------------------- history & sessions ------ */

  function renderHistoryManager() {
    var doc = els.doc;
    var hs = D().sessionsHistory || {};
    var all = arr(hs.sessions);
    var projects = [];
    all.forEach(function (s) { if (projects.indexOf(s.project) < 0) { projects.push(s.project); } });
    var filter = ui.histFilter !== null ? ui.histFilter : str((hs.filters || {}).project) || 'all';
    var shown = filter === 'all' ? all : all.filter(function (s) { return s.project === filter; });
    doc.appendChild(managerHeader(managerById('history'),
      all.length + (all.length === 1 ? ' session' : ' sessions') + ' on record across ' + projects.length +
      (projects.length === 1 ? ' project' : ' projects') + '. Sessions are records; deletion always asks first.', null, null));

    var sec0 = sectionEl('hs-sessions', '', 'Sessions', shown.length + ' shown', '');
    /* Project filter — a filter control, not a destination. */
    var filterSel = h('select', { className: 'lg-select', style: 'width:auto', 'aria-label': 'Filter sessions by project' });
    filterSel.appendChild(h('option', { value: 'all', text: 'All projects' }));
    projects.forEach(function (pName) {
      var opt = h('option', { value: pName, text: pName });
      if (pName === filter) { opt.selected = true; }
      filterSel.appendChild(opt);
    });
    if (filter === 'all') { filterSel.value = 'all'; }
    filterSel.addEventListener('change', function () {
      ui.histFilter = filterSel.value;
      redrawDocPreservingScroll();
    });
    sec0.appendChild(h('div', { className: 'lg-insp-actions', style: 'margin:0 0 8px' }, filterSel));
    if (all.length === 0) {
      sec0.appendChild(emptyState('history', 'No sessions recorded yet.',
        'Conversations and runs appear here as they happen. History retention is governed by Storage & Retention.'));
    } else if (shown.length === 0) {
      sec0.appendChild(emptyState('history', 'No sessions in this project.', 'Switch the filter to see other projects.'));
    } else {
      shown.forEach(function (s) {
        var chips = [];
        if (s.archived) { chips.push(['not-configured', 'Archived']); }
        sec0.appendChild(recRow({
          kind: 'session', id: s.id, label: s.title,
          sub: s.project + ' · ' + s.turns + ' turns · ' + arr(s.routes).join(', '),
          search: 'session history ' + s.project,
          chips: chips, mono: fmtMB(s.sizeMB),
          states: s.archived ? '' : ''
        }));
      });
    }
    doc.appendChild(sec0);

    var pol = hs.policy || {};
    var sec1 = sectionEl('hs-policy', '', 'Policy & actions', '',
      'Compare, export, and rebuild are one-shot actions; archive and deletion are policies.');
    sec1.appendChild(recRow({
      kind: 'histAction', id: 'compare', label: 'Compare two sessions',
      sub: 'Side-by-side turn comparison', search: 'compare sessions',
      chips: [['custom', 'Action']]
    }));
    sec1.appendChild(recRow({
      kind: 'histAction', id: 'export', label: 'Export a session',
      sub: 'Formats: ' + arr(pol.export).join(', '), search: 'export session markdown json',
      chips: [['custom', 'Action']]
    }));
    sec1.appendChild(recRow({
      kind: 'histAction', id: 'rebuild-index', label: 'Rebuild the history index',
      sub: 'Re-derives the search index over past sessions', search: 'rebuild history index',
      chips: [['custom', 'Action']]
    }));
    sec1.appendChild(recRow({
      kind: 'histPolicy', id: 'archive', label: 'Archive after',
      sub: pol.archiveAfterDays + ' days of inactivity', search: 'archive policy days',
      chips: [['default', 'Policy']]
    }));
    sec1.appendChild(recRow({
      kind: 'histPolicy', id: 'deletion', label: 'Deletion',
      sub: pol.deletion === 'ask' ? 'Always asks first — never silent' : cap(str(pol.deletion)),
      search: 'deletion policy ask',
      chips: [['default', 'Policy']]
    }));
    doc.appendChild(sec1);
  }

  /* ---------------------------------------------- artifacts manager ---- */

  var ARTIFACT_TYPE_LABELS = { report: 'Report', log: 'Log', capture: 'Capture', bundle: 'Bundle' };

  function renderArtifactsManager() {
    var doc = els.doc;
    var entries = arr((D().artifacts || {}).entries);
    var expired = entries.filter(function (a) { return a.retention === 'expired'; }).length;
    doc.appendChild(managerHeader(managerById('artifacts'),
      entries.length + (entries.length === 1 ? ' artifact' : ' artifacts') + ' tracked' +
      (expired ? ' · ' + expired + ' past retention (cleanup candidate)' : '') +
      '. Identity matters: PM-owned artifacts and provider-native ones are labeled apart.', null, null));

    var sec = sectionEl('ar-entries', '', 'Artifacts', entries.length ? entries.length + ' records' : '', '');
    if (entries.length === 0) {
      sec.appendChild(emptyState('box', 'No runtime artifacts yet.',
        'Runs that produce reports, logs, captures, or bundles list them here with retention and receipts.'));
    } else {
      entries.forEach(function (a) {
        var chips = [];
        chips.push([a.identity === 'pm' ? 'default' : 'auto',
          a.identity === 'pm' ? 'PM-owned' : 'Provider-native', str(a.identityNote || '')]);
        if (a.redaction && a.redaction.state === 'pending') { chips.push(['not-configured', 'Redaction pending']); }
        if (a.redaction && a.redaction.state === 'applied') { chips.push(['default', 'Redacted']); }
        var word = null;
        var states = [];
        if (a.retention === 'expired') { word = ['attention', 'Expired']; states.push('attention'); }
        sec.appendChild(recRow({
          kind: 'artifact', id: a.id, label: a.name,
          sub: (ARTIFACT_TYPE_LABELS[a.type] || cap(str(a.type))) + ' · produced by ' + str(a.producedBy) + ' · v' + a.version,
          search: 'artifact ' + str(a.type) + ' output',
          chips: chips, word: word, states: states.join(' ')
        }));
      });
    }
    doc.appendChild(sec);
  }

  /* ------------------------------------------ source control manager --- */

  function renderSourceControlManager() {
    var doc = els.doc;
    var sc = D().sourceControl || {};
    var wt = sc.worktrees || {};
    var active = arr(wt.active);
    var forges = arr(sc.forges);
    var connected = forges.filter(function (f) { return f.state === 'connected'; }).length;
    doc.appendChild(managerHeader(managerById('sourceControl'),
      'Tools collapse to one human card per tool per host. ' + connected + ' hosting service' +
      (connected === 1 ? '' : 's') + ' connected · ' + active.length + ' worktree' + (active.length === 1 ? '' : 's') +
      '. Settings owns setup and policy; day-to-day operations stay in the left-rail Source Control panel.', null, null));

    /* Overview */
    var sec0 = sectionEl('sc-overview', '', 'Overview', '', '');
    var gitTool = arr(sc.tools).filter(function (t) { return t.id === 'tool.git'; })[0];
    var gitHome = gitTool && arr(gitTool.hostStates).filter(function (hs) { return hs.state === 'ready'; })[0];
    sec0.appendChild(recRow({
      kind: 'scOverview', id: 'backend', label: 'Effective backend',
      sub: gitHome ? 'Git ' + str(gitHome.version) + ' on ' + hostName(gitHome.hostId) : 'No tool ready yet',
      search: 'backend git effective',
      word: gitHome ? ['ok', 'Ready'] : ['setup', 'Not set up']
    }));
    var gh = forges.filter(function (f) { return f.id === 'forge.github'; })[0];
    sec0.appendChild(recRow({
      kind: 'forge', id: gh ? gh.id : 'forge.github', label: 'GitHub',
      sub: gh && gh.state === 'connected' ? 'Connected as ' + str(gh.account) : (gh && gh.state === 'unreachable' ? str(gh.stateNote || 'Unreachable') : 'Not connected'),
      search: 'github forge hosting',
      word: gh && gh.state === 'connected' ? ['ok', 'Connected'] : (gh && gh.state === 'unreachable' ? ['attention', 'Unreachable'] : ['setup', 'Not connected']),
      states: gh && gh.state === 'unreachable' ? 'attention' : ''
    }));
    doc.appendChild(sec0);

    /* Repositories & source locations */
    var proj = (D().serverTopology || {}).project || {};
    var sec1 = sectionEl('sc-repos', '', 'Repositories & source locations', '', '');
    sec1.appendChild(recRow({
      kind: 'scRepo', id: 'project', label: 'Puppet Master',
      sub: 'Hosted on ' + str(proj.hostedOn || 'the Home Server'),
      search: 'repository checkout source location',
      mono: str(proj.files)
    }));
    doc.appendChild(sec1);

    /* Git & Jujutsu: one human card per tool per host. */
    var sec2 = sectionEl('sc-tools', '', 'Git & Jujutsu', '',
      'Install applies to actual tools only, always naming the exact host and environment.');
    arr(sc.tools).forEach(function (tool) {
      arr(tool.hostStates).forEach(function (hs) {
        var where = hs.envId ? envName(hs.envId) : hostName(hs.hostId);
        var ready = hs.state === 'ready';
        sec2.appendChild(recRow({
          kind: 'scTool', id: tool.id + '@' + (hs.envId || hs.hostId), ref: { toolId: tool.id, hostId: hs.hostId, envId: hs.envId },
          label: tool.name,
          sub: ready ? ('Ready on ' + where + ' · ' + str(hs.version)) : ('Not installed on ' + where),
          search: 'tool install ' + tool.name.toLowerCase(),
          word: ready ? ['ok', 'Ready'] : ['setup', 'Not installed'],
          chips: !ready && hs.installOffer ? [['recommended', hs.installOffer.label, hs.installOffer.note || '']] : [],
          states: ready ? '' : 'unavailable'
        }));
      });
    });
    doc.appendChild(sec2);

    /* Hosting services: CONNECT vocabulary, never install. */
    var sec3 = sectionEl('sc-hosting', '', 'Hosting services', forges.length + ' services',
      'Hosted services are connected, never installed. A forge connection never requires its optional CLI.');
    forges.forEach(function (f) {
      var isConn = f.state === 'connected';
      var isUnreach = f.state === 'unreachable';
      var chips = [];
      if (isConn && arr(f.scopes).length) { chips.push(['default', 'Scopes: ' + arr(f.scopes).join(', ')]); }
      if (!isConn && !isUnreach && f.connectOffer) { chips.push(['recommended', f.connectOffer.label, f.connectOffer.note || '']); }
      sec3.appendChild(recRow({
        kind: 'forge', id: f.id, label: f.name,
        sub: isConn ? 'Connected as ' + str(f.account) : (isUnreach ? str(f.stateNote || 'Unreachable — local repositories keep working') : 'Not connected'),
        search: 'forge connect ' + f.name.toLowerCase(),
        chips: chips,
        word: isConn ? ['ok', 'Connected'] : (isUnreach ? ['attention', 'Unreachable'] : ['setup', 'Not connected']),
        states: isUnreach ? 'attention' : (isConn ? '' : 'unavailable')
      }));
    });
    doc.appendChild(sec3);

    /* Accounts & sign-in */
    var ssh = sc.ssh || {};
    var keys = arr(ssh.keys);
    var sec4 = sectionEl('sc-auth', '', 'Accounts & sign-in', keys.length ? keys.length + ' SSH keys' : '', '');
    if (keys.length === 0) {
      sec4.appendChild(emptyState('key', 'No SSH keys yet.',
        'Add an SSH key or certificate, or use an existing SSH profile, when a connection needs one.'));
    } else {
      keys.forEach(function (k) {
        sec4.appendChild(recRow({
          kind: 'sshKey', id: k.id, label: k.label, monoLabel: true,
          sub: str(k.algo) + ' · used for ' + arr(k.hosts).join(', '),
          search: 'ssh key certificate', mono: 'added ' + str(k.created)
        }));
      });
    }
    doc.appendChild(sec4);

    /* Execution environments (summary — the full host view lives in
       Servers & Modules; this section keeps source-control context). */
    var sec5 = sectionEl('sc-envs', '', 'Execution environments', '',
      'Tool actions always target an explicit environment. WSL is optional — Off is healthy.');
    envRows(sec5, ['host.win-desktop', 'host.home-truenas']);
    sec5.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () { openManager('servers'); }
      }, ico('server'), 'Open Servers & Modules')));
    doc.appendChild(sec5);

    /* Worktrees & parallel work */
    var sec6 = sectionEl('sc-worktrees', '', 'Worktrees & parallel work', active.length ? active.length + ' active' : '',
      'Policy: ' + (wt.policy === 'auto-per-goal' ? 'one worktree per Goal, created automatically.' : str(wt.policy)) +
      ' Leased worktrees are never touched by cleanup.');
    if (active.length === 0) {
      sec6.appendChild(emptyState('worktree', 'No worktrees.',
        'Goals create leased worktrees automatically when parallel work starts.'));
    } else {
      active.forEach(function (w) {
        var chips = [];
        var word = null;
        var states = [];
        if (w.state === 'leased' && w.lease) {
          chips.push(['managed', 'Leased', 'Held by ' + str(w.lease.holder) + ' until ' + fmtTime(w.lease.expires)]);
          word = ['ok', 'In use'];
          states.push('managed');
        } else if (w.state === 'stale') {
          word = ['attention', 'Stale'];
          states.push('attention');
        } else {
          word = ['muted', 'Idle'];
        }
        sec6.appendChild(recRow({
          kind: 'worktree', id: w.id, label: w.branch, monoLabel: true,
          sub: w.state === 'stale' ? str(w.staleNote) : str(w.path),
          search: 'worktree branch parallel',
          chips: chips, word: word, states: states.join(' ')
        }));
      });
    }
    doc.appendChild(sec6);

    /* Branch, push & merge safety */
    var push = wt.pushPolicy || {};
    var sec7 = sectionEl('sc-safety', '', 'Branch, push & merge safety', '', '');
    sec7.appendChild(recRow({
      kind: 'scPolicy', id: 'test-before-merge', label: 'Test before merge',
      sub: wt.testBeforeMerge === 'on' ? 'On — merges wait for the project test suite' : 'Off',
      search: 'test before merge safety',
      word: wt.testBeforeMerge === 'on' ? ['ok', 'On'] : ['setup', 'Off']
    }));
    sec7.appendChild(recRow({
      kind: 'scPolicy', id: 'force-push', label: 'Force push',
      sub: push.force === 'never' ? 'Never — no agent or rule can force-push' : cap(str(push.force)),
      search: 'force push policy never',
      chips: [['managed', 'Safety floor']]
    }));
    sec7.appendChild(recRow({
      kind: 'scPolicy', id: 'protected', label: 'Protected branches',
      sub: arr(push.protected).join(', ') || 'None',
      search: 'protected branches main'
    }));
    sec7.appendChild(recRow({
      kind: 'scPolicy', id: 'leases', label: 'Worktree leases',
      sub: 'Active Goals hold leases; leased worktrees are excluded from every cleanup and prune',
      search: 'lease worktree protect'
    }));
    doc.appendChild(sec7);

    /* Automatic updates: shared installation lifecycle, not a bespoke engine. */
    var sec8 = sectionEl('sc-updates', '', 'Automatic updates', '',
      'Source tools reuse the shared installation lifecycle — no source-control-only update engine.');
    sec8.appendChild(recRow({
      kind: 'scPolicy', id: 'update-check', label: 'Check for tool updates',
      sub: 'Automatic', search: 'update check automatic'
    }));
    sec8.appendChild(recRow({
      kind: 'scPolicy', id: 'update-install', label: 'Install tool updates',
      sub: 'Ask first · roll back on failed verification', search: 'update install ask'
    }));
    doc.appendChild(sec8);

    /* Diagnostics & receipts */
    var rec = sc.recovery || {};
    var sec9 = sectionEl('sc-diagnostics', '', 'Diagnostics & receipts', '', '');
    sec9.appendChild(recRow({
      kind: 'scPolicy', id: 'recovery', label: 'Branch & bookmark recovery',
      sub: str(rec.note) || (rec.reflogDays + ' days of movement kept'),
      search: 'recovery reflog undo',
      mono: rec.reflogDays ? rec.reflogDays + ' days' : ''
    }));
    sec9.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () {
          window.PMState.receipt('Open the Source Control panel',
            'Branch, diff, commit, and conflict operations live in the left-rail panel — Settings never duplicates them.');
        }
      }, ico('external'), 'Open the operational panel')));
    doc.appendChild(sec9);
  }

  function envRows(sec, hostIds) {
    var topo = D().serverTopology || {};
    arr(topo.hosts).forEach(function (host) {
      if (hostIds && hostIds.indexOf(host.id) < 0) { return; }
      arr(host.environments).forEach(function (env) {
        var word;
        if (env.state === 'ready') { word = ['ok', 'Ready']; }
        else if (env.state === 'off') { word = ['muted', 'Off']; } /* Off is healthy — no warning. */
        else if (env.state === 'not-set-up') { word = ['muted', 'Not set up']; }
        else { word = ['muted', cap(str(env.state))]; }
        sec.appendChild(recRow({
          kind: 'envRec', id: env.id, ref: host.id,
          label: env.label,
          sub: hostName(host.id) + (env.healthNote ? ' · ' + env.healthNote : ''),
          search: 'environment host ' + str(env.kind),
          chips: env.optional ? [['default', 'Optional']] : [],
          word: word
        }));
      });
    });
  }

  /* -------------------------------------------- GitHub Actions manager - */

  function renderActionsManager() {
    var doc = els.doc;
    var ga = D().githubActions || {};
    var pinned = arr(ga.pinned);
    var failing = pinned.filter(function (w) { return w.readiness === 'failing'; }).length;
    doc.appendChild(managerHeader(managerById('actions'),
      pinned.length + ' pinned workflow' + (pinned.length === 1 ? '' : 's') +
      (failing ? ' · ' + failing + ' failing' : '') +
      '. Settings owns pinning, readiness, and setup; run and log browsing in depth stays in the left-rail GitHub Actions panel.',
      null, null));

    var sec0 = sectionEl('gh-pinned', '', 'Pinned workflows', pinned.length ? pinned.length + ' records' : '', '');
    var refPhase = opPhase('actions-refresh', null);
    if (refPhase && refPhase !== 'done') { sec0.appendChild(phaseStrip('actions-refresh', null)); }
    if (pinned.length === 0) {
      sec0.appendChild(emptyState('workflow', 'No workflows pinned yet.',
        'Pin the workflows that matter to this project, or start from a starter template below.'));
    } else {
      pinned.forEach(function (w) {
        var pass = w.readiness === 'passing';
        sec0.appendChild(recRow({
          kind: 'workflow', id: w.id, label: w.name, monoLabel: true,
          sub: (pass ? 'Passing on ' : 'Failing on ') + str(w.branch) +
            (!pass && w.lastRun && w.lastRun.failedJob ? ' · failed at ' + w.lastRun.failedJob : ''),
          search: 'workflow ci pinned ' + w.name,
          word: pass ? ['ok', 'Passing'] : ['attention', 'Failing'],
          states: pass ? '' : 'attention'
        }));
      });
    }
    var refreshRow = h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button', disabled: !!ga.refreshDisabled,
        onClick: function () { window.PMState.trigger('actions-refresh'); }
      }, ico('refresh'), 'Refresh readiness'),
      ga.refreshDisabled ? h('span', { className: 'lg-note-line', text: str(ga.refreshDisabled) } )
        : (ga.refreshedAt ? h('span', { className: 'lg-note-line', text: 'Refreshed ' + fmtTime(ga.refreshedAt) }) : null));
    sec0.appendChild(refreshRow);
    doc.appendChild(sec0);

    var runs = arr(ga.runs);
    var sec1 = sectionEl('gh-runs', '', 'Recent runs', runs.length ? runs.length + ' records' : '',
      'A readiness summary, not an operations console. Jobs and log excerpts open in the inspector.');
    if (runs.length === 0) {
      sec1.appendChild(emptyState('history', 'No runs fetched yet.', 'Runs appear after the first refresh.'));
    } else {
      runs.forEach(function (r) {
        var ok = r.result === 'success';
        sec1.appendChild(recRow({
          kind: 'wfRun', id: r.id, label: r.workflow + ' · ' + r.id, monoLabel: true,
          sub: Math.round(r.durationS / 60) + 'm ' + (r.durationS % 60) + 's · ' + arr(r.jobs).length + ' jobs',
          search: 'run workflow ' + r.workflow,
          word: ok ? ['ok', 'Success'] : ['attention', 'Failure'],
          mono: fmtTime(r.when),
          states: ok ? '' : 'attention'
        }));
      });
    }
    doc.appendChild(sec1);

    var cap0 = ga.accountCapability || {};
    var sec2 = sectionEl('gh-setup', '', 'Account & setup', '', '');
    sec2.appendChild(recRow({
      kind: 'ghAccount', id: 'capability', label: 'Account capability',
      sub: str(cap0.account) + (cap0.actions ? ' · workflow read and dispatch available' : ' · workflows not available on this connection'),
      search: 'account capability actions',
      word: cap0.actions ? ['ok', 'Capable'] : ['setup', 'Limited']
    }));
    if (ga.starterOffer) {
      sec2.appendChild(recRow({
        kind: 'ghStarter', id: 'starter', label: 'Starter workflow',
        sub: str(ga.starterOffer.note),
        search: 'starter workflow template',
        chips: [['recommended', 'Offer']]
      }));
    }
    doc.appendChild(sec2);
  }

  /* ---------------------------------------------- containers manager --- */

  function renderContainersManager() {
    var doc = els.doc;
    var ct = D().containers || {};
    var res = arr(ct.resources);
    var ready = res.filter(function (r) { return r.state === 'ready'; }).length;
    doc.appendChild(managerHeader(managerById('containers'),
      'Three human top-level resources — Docker, Podman, Kubernetes tools. ' + ready + ' of ' + res.length +
      ' ready. Detail (engine, CLI, compose, sockets, contexts) lives in the inspector.',
      'Add registry', function () {
        window.PMState.receipt('Add registry',
          'The add-registry flow validates the URL, checks the certificate chain, and stores auth as a vault reference. A self-signed certificate pauses here with trust guidance instead of failing silently.');
      }));

    var sec0 = sectionEl('ct-engines', '', 'Engines & tools', res.length + ' resources',
      'Shared tool lifecycle, domain-specific capability probes.');
    res.forEach(function (r) {
      var word;
      var states = [];
      if (r.state === 'ready') { word = ['ok', 'Ready']; }
      else if (r.state === 'partial') { word = ['setup', 'Partial']; }
      else { word = ['setup', 'Not installed']; states.push('unavailable'); }
      sec0.appendChild(recRow({
        kind: 'ctr', id: r.id, label: r.name,
        sub: str(r.summary),
        search: 'container engine ' + r.name.toLowerCase(),
        chips: r.installOffer ? [['recommended', r.installOffer.label, r.installOffer.note || '']] : [],
        word: word, states: states.join(' ')
      }));
    });
    doc.appendChild(sec0);

    var clusters = arr(ct.clusters);
    var sec1 = sectionEl('ct-clusters', '', 'Clusters', clusters.length ? clusters.length + ' known' : '', '');
    if (clusters.length === 0) {
      sec1.appendChild(emptyState('kube', 'No clusters yet.', 'Reachable clusters and kubeconfig contexts appear here.'));
    } else {
      clusters.forEach(function (c) {
        var current = arr(c.kubeconfigContexts).filter(function (x) { return x.current; })[0];
        sec1.appendChild(recRow({
          kind: 'cluster', id: c.id, label: c.name, monoLabel: true,
          sub: arr(c.kubeconfigContexts).length + ' kubeconfig contexts' + (current ? ' · current: ' + current.name : ''),
          search: 'cluster kubernetes kubeconfig',
          word: c.state === 'reachable' ? ['ok', 'Reachable'] : ['attention', cap(str(c.state))]
        }));
      });
    }
    doc.appendChild(sec1);

    var regs = arr(ct.registries);
    var sec2 = sectionEl('ct-registries', '', 'Registries', regs.length + ' configured', '');
    regs.forEach(function (r) {
      var warn = r.state === 'cert-warning';
      sec2.appendChild(recRow({
        kind: 'registry', id: r.id, label: r.url, monoLabel: true,
        sub: warn ? str(r.authNote) : ('Auth: ' + str(r.auth || 'None')),
        search: 'registry push pull',
        word: warn ? ['attention', 'Certificate warning'] : ['ok', 'Ready'],
        states: warn ? 'attention' : ''
      }));
    });
    doc.appendChild(sec2);

    var un = ct.unraidPublishing || {};
    var sec3 = sectionEl('ct-unraid', '', 'Unraid publishing', '', '');
    sec3.appendChild(recRow({
      kind: 'unraid', id: 'publishing', label: str(un.server) || 'Unraid',
      sub: (un.templates || 0) + ' PM app templates published to the community feed',
      search: 'unraid template publish',
      word: un.state === 'connected' ? ['ok', 'Connected'] : ['setup', cap(str(un.state || 'Not connected'))]
    }));
    doc.appendChild(sec3);
  }

  /* ------------------------------------------------- web manager ------- */

  var WEB_KIND_LABELS = { search: 'Search', 'crawl-extract': 'Crawl & extract', fetch: 'Fetch' };

  function renderWebManager() {
    var doc = els.doc;
    var web = D().webResearch || {};
    var provs = arr(web.providers);
    var warns = provs.filter(function (w) { return w.guard && (w.guard.state === 'warning' || w.guard.state === 'stop'); }).length;
    doc.appendChild(managerHeader(managerById('web'),
      provs.length + ' providers by priority' + (warns ? ' · ' + warns + ' credit guard active' : '') +
      '. Guards stop spending before a surprise bill; fetch keeps working when crawls pause.', null, null));

    var sec0 = sectionEl('wb-providers', '', 'Providers & priority', provs.length + ' records', '');
    provs.forEach(function (w) {
      var word;
      var states = [];
      if (w.state === 'ready') {
        if (w.guard && w.guard.state === 'warning') { word = ['attention', 'Credit warning']; states.push('attention'); }
        else { word = ['ok', 'Ready']; }
      } else if (w.state === 'needs-setup') { word = ['setup', 'Needs setup']; }
      else { word = ['attention', w.guard && w.guard.state === 'stop' ? 'Paused by guard' : 'Unavailable']; states.push('unavailable'); if (w.guard && w.guard.state === 'stop') { states.push('attention'); } }
      var creditNote = w.credits ? (w.credits.used + ' / ' + w.credits.total + ' ' + w.credits.unit) : (w.builtIn ? 'Built in' : '');
      sec0.appendChild(recRow({
        kind: 'webProvider', id: w.id, label: w.name,
        sub: (WEB_KIND_LABELS[w.kind] || cap(str(w.kind))) + (w.setupNote ? ' · ' + w.setupNote : (w.stateNote ? ' · ' + w.stateNote : '')),
        search: 'web provider ' + str(w.kind) + ' credits',
        mono: 'P' + (w.priority || '-') + (creditNote ? ' · ' + creditNote : ''),
        word: word, states: states.join(' ')
      }));
    });
    doc.appendChild(sec0);

    var lim = web.limits || {};
    var sec1 = sectionEl('wb-limits', '', 'Limits', '',
      'The fetch size cap is an ordinary setting record; the rest are policy records.');
    var fetchRow = settings()['extensions.web.fetch-size-limit'];
    if (fetchRow) { sec1.appendChild(settingRowEl(fetchRow)); }
    sec1.appendChild(recRow({
      kind: 'webLimits', id: 'limits', label: 'Crawl, map & extract limits',
      sub: 'Depth ' + lim.crawlDepth + ' · map ' + lim.mapMaxPages + ' pages · extract ' + lim.extractMaxPages + ' pages',
      search: 'crawl depth map extract limits'
    }));
    doc.appendChild(sec1);

    var caches = web.caches || {};
    var sec2 = sectionEl('wb-caches', '', 'Caches', '', '');
    sec2.appendChild(recRow({
      kind: 'webCache', id: 'cache', label: 'Fetch & crawl cache',
      sub: 'TTL ' + caches.ttlHours + ' hours · last cleared ' + fmtTime(caches.lastCleared),
      search: 'cache clear web',
      mono: fmtMB(caches.sizeMB)
    }));
    doc.appendChild(sec2);

    var bs = web.browserSessions || {};
    var sec3 = sectionEl('wb-browser', '', 'Browser programs', '',
      'PM-native vocabulary only. The protected sign-in session is human-only by design.');
    sec3.appendChild(recRow({
      kind: 'browserSession', id: 'program', label: str(bs.program) || 'PM Browser Program',
      sub: 'The ordinary agent browser environment',
      search: 'browser program', word: ['ok', 'Available']
    }));
    sec3.appendChild(recRow({
      kind: 'browserSession', id: 'expert', label: str(bs.expert) || 'Expert Browser Program',
      sub: 'Advanced capabilities granted automatically under permissions and sandbox policy — no master switch',
      search: 'expert browser advanced', word: ['ok', 'Policy-driven']
    }));
    var auth = bs.authSession || {};
    sec3.appendChild(recRow({
      kind: 'browserSession', id: 'auth', label: 'Protected sign-in session',
      sub: str(auth.note) || 'Human-only. Agents can never inspect its pages, screenshots, console, or network.',
      search: 'protected sign in human only',
      chips: [['managed', 'Human-only']], states: 'managed'
    }));
    doc.appendChild(sec3);

    var sec4 = sectionEl('wb-network', '', 'Proxy, certificates & air-gap', '', '');
    sec4.appendChild(recRow({
      kind: 'webNetwork', id: 'proxy', label: 'Proxy',
      sub: web.proxy === 'system' ? 'System proxy settings' : cap(str(web.proxy)),
      search: 'proxy network'
    }));
    arr(web.certificates).forEach(function (c) {
      sec4.appendChild(recRow({
        kind: 'webCert', id: c.id, label: c.name,
        sub: 'Custom certificate authority · added ' + str(c.added),
        search: 'certificate ca trust'
      }));
    });
    sec4.appendChild(recRow({
      kind: 'webNetwork', id: 'airgap', label: 'Air-gap behavior',
      sub: web.airgap === 'detected' ? 'Air-gap detected — web routes report honest unavailability' : 'Off — normal networking',
      search: 'air gap offline',
      word: web.airgap === 'detected' ? ['attention', 'Detected'] : ['muted', 'Off'],
      states: web.airgap === 'detected' ? 'attention' : ''
    }));
    doc.appendChild(sec4);
  }

  /* ------------------------------------------- search index manager ---- */

  function renderSearchIndexManager() {
    var doc = els.doc;
    var ix = D().searchIndex || {};
    doc.appendChild(managerHeader(managerById('searchIndex'),
      ix.enabled
        ? ('Indexing is on: ' + (ix.files || 0).toLocaleString() + ' files · ' + fmtMB(ix.diskMB || 0) + ' on disk.')
        : 'Indexing is off. Search falls back to slower on-demand scans until it is enabled.', null, null));

    var sec0 = sectionEl('ix-status', '', 'Status & rebuild', '', '');
    var phase = str(ix.phase);
    var word;
    var states = [];
    if (!ix.enabled || phase === 'disabled') { word = ['muted', 'Disabled']; }
    else if (phase === 'ready') { word = ['ok', 'Ready']; }
    else if (phase === 'failed') { word = ['attention', 'Failed']; states.push('attention'); }
    else { word = ['setup', cap(phase)]; }
    sec0.appendChild(recRow({
      kind: 'indexStatus', id: 'status', label: 'Project index',
      sub: ix.enabled
        ? (phase === 'ready' ? 'Last build ' + fmtTime(ix.lastBuild) : (ix.progress ? str(ix.progress.note) : cap(phase)))
        : 'Turn it on in the inspector to build the first index',
      search: 'index status rebuild',
      word: word, states: states.join(' '),
      /* Determinate progress only with a real denominator (register §11):
         counts once the scan has measured them, the phase word before. */
      mono: ix.enabled && ix.progress && typeof ix.progress.completed === 'number'
        ? fmtInt(ix.progress.completed) + ' of ' + fmtInt(ix.progress.total) + ' files'
        : ''
    }));
    var ixPhase = opPhase('index-rebuild', null);
    if (ixPhase && ixPhase !== 'done') {
      sec0.appendChild(phaseStrip('index-rebuild', null));
      if (ix.progress && typeof ix.progress.completed === 'number' && ix.progress.total > 0) {
        /* Static determinate bar from measured counts; no transition. */
        var ixw = Math.round((ix.progress.completed / ix.progress.total) * 100);
        sec0.appendChild(h('div', {
          className: 'lg-progress', role: 'progressbar',
          'aria-valuenow': String(ix.progress.completed),
          'aria-valuemin': '0', 'aria-valuemax': String(ix.progress.total),
          'aria-valuetext': fmtInt(ix.progress.completed) + ' of ' + fmtInt(ix.progress.total) + ' files (measured)'
        }, h('span', { className: 'lg-progress-fill', style: 'width:' + ixw + '%' })));
        sec0.appendChild(h('div', { className: 'lg-note-line' },
          fmtInt(ix.progress.completed) + ' of ' + fmtInt(ix.progress.total) + ' files · measured'));
      } else if (ix.progress) {
        /* Scanning has no denominator yet: honest phase text, no bar. */
        sec0.appendChild(h('div', { className: 'lg-note-line' }, str(ix.progress.note) || 'Working'));
      }
    }
    doc.appendChild(sec0);

    var sec1 = sectionEl('ix-policy', '', 'Exclusions & policy', '', '');
    sec1.appendChild(recRow({
      kind: 'indexPolicy', id: 'exclusions', label: 'Exclusions',
      sub: arr(ix.exclusions).join(' · ') || 'None',
      search: 'exclusions ignore index'
    }));
    sec1.appendChild(recRow({
      kind: 'indexPolicy', id: 'large-file', label: 'Large-file limit',
      sub: 'Files above the limit are skipped and listed under failures',
      search: 'large file limit',
      mono: ((ix.largeFilePolicy || {}).maxMB || 8) + ' MB'
    }));
    sec1.appendChild(recRow({
      kind: 'indexPolicy', id: 'symlinks', label: 'Symbolic links',
      sub: ix.symlinkPolicy === 'skip' ? 'Skipped — loops are reported, never followed' : cap(str(ix.symlinkPolicy)),
      search: 'symlink policy'
    }));
    var rc = ix.remoteCache || {};
    sec1.appendChild(recRow({
      kind: 'indexPolicy', id: 'remote-cache', label: 'Remote cache',
      sub: rc.state === 'ready' ? 'Shared on ' + hostName(rc.hostId) : cap(str(rc.state || 'Off')),
      search: 'remote cache truenas',
      word: rc.state === 'ready' ? ['ok', 'Ready'] : ['muted', cap(str(rc.state || 'Off'))]
    }));
    doc.appendChild(sec1);

    var fails = arr(ix.failures);
    var sec2 = sectionEl('ix-failures', '', 'Failures', fails.length ? fails.length + ' paths' : '', '');
    if (fails.length === 0) {
      sec2.appendChild(emptyState('checkCircle', 'No failures.', 'Paths the indexer had to skip would be listed here with reasons.'));
    } else {
      fails.forEach(function (f, i) {
        sec2.appendChild(recRow({
          kind: 'indexFailure', id: String(i), label: f.path, monoLabel: true,
          sub: str(f.reason), search: 'index failure skipped',
          word: ['attention', 'Skipped'], states: 'attention'
        }));
      });
    }
    doc.appendChild(sec2);
  }

  /* ----------------------------------------------- cleanup manager ----- */

  function renderCleanupManager() {
    var doc = els.doc;
    var cl = D().cleanup || {};
    var cats = arr(cl.categories);
    var totalMB = cats.reduce(function (t, c) { return t + (c.sizeMB || 0); }, 0);
    doc.appendChild(managerHeader(managerById('cleanup'),
      'About ' + fmtMB(totalMB) + ' could be reclaimed across ' + cats.length +
      ' categories. A dry run only reports; nothing is deleted until you apply, and leased items are always skipped.', null, null));

    var sec0 = sectionEl('cu-categories', '', 'What can be reclaimed', cats.length + ' categories', '');
    var anything = false;
    cats.forEach(function (c) {
      if (c.count > 0) { anything = true; }
      sec0.appendChild(recRow({
        kind: 'cleanupCat', id: c.id, label: c.label,
        sub: c.count === 0 ? 'Nothing to clean' : (c.count + ' item' + (c.count === 1 ? '' : 's')) + (c.safety ? ' · ' + c.safety : ''),
        search: 'cleanup reclaim ' + c.label.toLowerCase(),
        chips: c.safety ? [['managed', 'Safety', c.safety]] : [],
        mono: c.sizeMB ? fmtMB(c.sizeMB) : '',
        inert: c.count === 0
      }));
    });
    if (!anything) {
      sec0.appendChild(emptyState('checkCircle', 'Nothing to clean.', 'The workspace is tidy. Categories fill in as snapshots, worktrees, and caches age.'));
    }
    doc.appendChild(sec0);

    var dry = (cl.dryRun && cl.dryRun.last) || null;
    var sec1 = sectionEl('cu-dryrun', '', 'Dry run & apply', '',
      str((cl.dryRun || {}).note) || 'A dry run only reports. Nothing is deleted until you apply.');
    var duPhase = opPhase('cleanup-dry-run', null);
    if (duPhase && duPhase !== 'done') { sec1.appendChild(phaseStrip('cleanup-dry-run', null)); }
    if (dry) {
      sec1.appendChild(recRow({
        kind: 'dryRunRecord', id: 'last', label: 'Last dry run',
        sub: 'Would free ' + fmtMB(dry.wouldFreeMB) + ' · ' + arr(dry.skipped).length + ' item skipped (leased)',
        search: 'dry run report',
        chips: [['default', 'Receipt', str(dry.receiptId)]],
        mono: fmtTime(dry.when)
      }));
    } else {
      sec1.appendChild(emptyState('broom', 'No dry run yet.', 'Run one to see exactly what a cleanup would remove — and what the leases protect.'));
    }
    var actions = h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.trigger('cleanup-dry-run'); }
      }, ico('broom'), 'Run dry run'));
    if (dry && !ui.cleanupConfirm) {
      actions.appendChild(h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { ui.cleanupConfirm = true; redrawDocPreservingScroll(); }
      }, ico('trash'), 'Apply cleanup'));
    }
    sec1.appendChild(actions);
    if (dry && ui.cleanupConfirm) {
      sec1.appendChild(h('div', { className: 'lg-caution' },
        h('div', { className: 'lg-caution-head' }, ico('warning'), 'Apply cleanup'),
        h('p', { text: 'This deletes the reported items permanently — about ' + fmtMB(dry.wouldFreeMB) +
          '. Leased worktrees are always skipped, and anything under a legal hold is never touched. This cannot be undone.' }),
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn is-primary', type: 'button',
            onClick: function () {
              ui.cleanupConfirm = false;
              window.PMState.receipt('Cleanup applied',
                'The reported items would be deleted now, with a receipt per category. Nothing was deleted in this demo.');
              redrawDocPreservingScroll();
            }
          }, 'I understand — apply'),
          h('button', {
            className: 'lg-btn is-quiet', type: 'button',
            onClick: function () { ui.cleanupConfirm = false; redrawDocPreservingScroll(); }
          }, 'Cancel'))));
    }
    doc.appendChild(sec1);
  }

  /* -------------------------------------- servers & modules manager ---- */

  function renderServersManager() {
    var doc = els.doc;
    var topo = D().serverTopology || {};
    var mods = D().serverModules || {};
    var reserved = arr(mods.reserved);
    doc.appendChild(managerHeader(managerById('servers'),
      'The connected Home Server, execution hosts, and paired clients — plus ' + reserved.length +
      ' reserved destinations whose state machines belong to named owners. Nothing here is invented.', null, null));

    /* Connected server card (packet 07 example, literally). */
    var card = mods.connectedServerCard || {};
    var sec0 = sectionEl('sv-server', '', 'Connected server', '', '');
    sec0.appendChild(recRow({
      kind: 'serverCard', id: 'server', label: str(card.name) || 'Home TrueNAS',
      sub: 'Processing on this server: ' + (card.processing === 'on' ? 'On' : 'Off') + ' · Clients: ' + (card.clients || 0) + ' paired',
      search: 'server connected home truenas',
      word: card.state === 'connected' ? ['ok', 'Connected'] : ['attention', cap(str(card.state || 'Offline'))],
      states: card.state === 'connected' ? '' : 'attention'
    }));
    sec0.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Change Server', 'Server selection is owned by the Server Backbone module and opens there in the finished product.'); }
      }, 'Change Server'),
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Add Server', 'Claim and bootstrap flows are owned by the Server Backbone module.'); }
      }, ico('plus'), 'Add Server')));
    doc.appendChild(sec0);

    /* Project card (packet 07 example). */
    var proj = topo.project || {};
    var sec1 = sectionEl('sv-project', '', 'This project', '', '');
    sec1.appendChild(recRow({
      kind: 'projectCard', id: 'hosted-on', label: 'Hosted On',
      sub: 'Where the canonical project lives', search: 'hosted on project',
      mono: str(proj.hostedOn)
    }));
    sec1.appendChild(recRow({
      kind: 'projectCard', id: 'files', label: 'Project Files',
      sub: 'The canonical file location', search: 'project files path',
      mono: str(proj.files)
    }));
    sec1.appendChild(recRow({
      kind: 'projectCard', id: 'run-work', label: 'Run Work',
      sub: 'Where execution lands by default', search: 'run work automatic',
      mono: str(proj.runWork)
    }));
    doc.appendChild(sec1);

    /* Hosts & environments. WSL Off is healthy — never a warning. */
    var sec2 = sectionEl('sv-hosts', '', 'Execution hosts & environments', arr(topo.hosts).length + ' hosts',
      'Setup for optional environments appears only when a selected capability requires it. Windows native is complete without WSL.');
    arr(topo.hosts).forEach(function (host) {
      var word;
      var states = [];
      if (host.state === 'connected') { word = ['ok', 'Connected']; }
      else if (host.state === 'reachable') { word = ['ok', 'Reachable']; }
      else { word = ['attention', 'Offline']; states.push('attention'); }
      sec2.appendChild(recRow({
        kind: 'hostRec', id: host.id, label: host.name,
        sub: (host.isDefaultExecutionHost ? 'Default execution host · ' : '') + arr(host.environments).length + ' environments',
        search: 'host execution ' + str(host.kind),
        word: word, states: states.join(' ')
      }));
      arr(host.environments).forEach(function (env) {
        var eword;
        if (env.state === 'ready') { eword = ['ok', 'Ready']; }
        else if (env.state === 'off') { eword = ['muted', 'Off']; }
        else if (env.state === 'not-set-up') { eword = ['muted', 'Not set up']; }
        else { eword = ['muted', cap(str(env.state))]; }
        sec2.appendChild(recRow({
          kind: 'envRec', id: env.id, ref: host.id, subRow: true,
          label: env.label,
          sub: str(env.healthNote || ''),
          search: 'environment ' + str(env.kind),
          chips: env.optional ? [['default', 'Optional']] : [],
          word: eword
        }));
      });
    });
    doc.appendChild(sec2);

    var clients = arr(topo.clients);
    var sec3 = sectionEl('sv-clients', '', 'Clients', clients.length + ' paired', '');
    clients.forEach(function (c) {
      sec3.appendChild(recRow({
        kind: 'clientRec', id: c.id, label: c.name,
        sub: c.platform + ' · last seen ' + fmtTime(c.lastSeen),
        search: 'client paired ' + c.platform.toLowerCase()
      }));
    });
    doc.appendChild(sec3);

    /* Reserved destinations: deferred_named_owner made honest. */
    var sec4 = sectionEl('sv-modules', '', 'Reserved destinations', reserved.length + ' modules',
      'Each destination names its canonical owner and insertion contract. Their backend state machines are deliberately NOT invented in this bakeoff.');
    reserved.forEach(function (m) {
      var partial = m.state === 'partial';
      sec4.appendChild(recRow({
        kind: 'serverModule', id: m.id, label: m.label,
        sub: 'Coming from ' + str(m.namedOwner),
        search: 'reserved module ' + m.label.toLowerCase(),
        chips: [[partial ? 'auto' : 'not-configured', partial ? 'Partly live here' : 'Reserved']],
        inert: !partial
      }));
    });
    doc.appendChild(sec4);
  }

  MANAGER_RENDERERS = {
    providers: renderProvidersManager,
    storage: renderStorageManager,
    backup: renderBackupManager,
    lifecycle: renderLifecycleManager,
    history: renderHistoryManager,
    artifacts: renderArtifactsManager,
    sourceControl: renderSourceControlManager,
    actions: renderActionsManager,
    containers: renderContainersManager,
    web: renderWebManager,
    searchIndex: renderSearchIndexManager,
    cleanup: renderCleanupManager,
    servers: renderServersManager
  };

  function redrawDocPreservingScroll() {
    var scroll = els.doc.scrollTop;
    renderDoc();
    els.doc.scrollTop = scroll;
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

  function renderInspector() {
    detachSpells();
    var insp = els.insp;
    insp.innerHTML = '';
    var sel = ui.selected;
    els.root.classList.toggle('insp-open', !!sel);
    if (!sel) { renderInspectorSummary(); return; }
    var fns = {
      setting: inspectSetting, notice: inspectNotice, provider: inspectProvider,
      model: inspectModel, freeRoute: inspectFreeRoute, role: inspectRole,
      installation: inspectInstallation, freeCatalogSource: inspectFreeCatalogSource,
      covered: inspectCovered,
      storageVault: inspectStorageVault, storagePressure: inspectStoragePressure,
      usageClass: inspectUsageClass, retentionClass: inspectRetentionClass,
      quarantineItem: inspectQuarantineItem, storageMaint: inspectStorageMaint,
      receiptRec: inspectReceiptRec,
      backupKind: inspectBackupKind, restorePoint: inspectRestorePoint,
      backupAction: inspectBackupAction, backupStatus: inspectBackupStatus,
      testRestore: inspectTestRestore, backupEncryption: inspectBackupEncryption,
      importState: inspectImportState, importConflict: inspectImportConflict,
      importInvalid: inspectImportInvalid, legacyMigration: inspectLegacyMigration,
      lifecycleEvent: inspectLifecycleEvent, exportRecord: inspectExportRecord,
      resetDefaults: inspectResetDefaults,
      session: inspectSession, histAction: inspectHistAction, histPolicy: inspectHistPolicy,
      artifact: inspectArtifact,
      scOverview: inspectScPolicy, scRepo: inspectScRepo, scTool: inspectScTool,
      forge: inspectForge, sshKey: inspectSshKey, worktree: inspectWorktree,
      scPolicy: inspectScPolicy, envRec: inspectEnvRec,
      workflow: inspectWorkflow, wfRun: inspectWfRun,
      ghAccount: inspectGhAccount, ghStarter: inspectGhStarter,
      ctr: inspectContainer, cluster: inspectCluster, registry: inspectRegistry,
      unraid: inspectUnraid,
      webProvider: inspectWebProvider, webLimits: inspectWebLimits,
      webCache: inspectWebCache, browserSession: inspectBrowserSession,
      webNetwork: inspectWebNetwork, webCert: inspectWebCert,
      indexStatus: inspectIndexStatus, indexPolicy: inspectIndexPolicy,
      indexFailure: inspectIndexFailure,
      cleanupCat: inspectCleanupCat, dryRunRecord: inspectDryRunRecord,
      serverCard: inspectServerCard, projectCard: inspectProjectCard,
      hostRec: inspectHostRec, clientRec: inspectClientRec,
      serverModule: inspectServerModule
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
    var d = D();
    if (id === 'storage') {
      var st = d.storage || {};
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Data classes', arr((st.usage || {}).byClass).length),
        summaryCell('Retention classes', arr(st.retention).length),
        summaryCell('Legal holds', arr(st.retention).filter(function (r) { return r.legalHold; }).length),
        summaryCell('Quarantined', arr(st.quarantine).length)
      );
    }
    if (id === 'backup') {
      var bk = d.backups || {};
      var pts = arr(bk.restorePoints);
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Backup kinds', arr(bk.kinds).length),
        summaryCell('Restore points', pts.length),
        summaryCell('Verified', pts.filter(function (p) { return p.verified; }).length),
        summaryCell('Verification pending', pts.filter(function (p) { return p.verification === 'pending'; }).length)
      );
    }
    if (id === 'lifecycle') {
      var lc = d.settingsLifecycle || {};
      var pvState = str((lc.importPreview || {}).state);
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('History events', arr(lc.history).length),
        summaryCell('Conflicts staged', pvState === 'staged' ? ((lc.importPreview.counts || {}).conflict || 0) : 0),
        summaryCell('Exports', lc.lastExport ? 1 : 0),
        summaryCell('Rollbacks', arr(lc.history).filter(function (e) { return e.action === 'rollback-complete'; }).length)
      );
    }
    if (id === 'history') {
      var ses = arr((d.sessionsHistory || {}).sessions);
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Sessions', ses.length),
        summaryCell('Archived', ses.filter(function (s) { return s.archived; }).length),
        summaryCell('Projects', ses.reduce(function (acc, s) { return acc.indexOf(s.project) < 0 ? acc.concat([s.project]) : acc; }, []).length),
        summaryCell('Turns recorded', ses.reduce(function (t, s) { return t + (s.turns || 0); }, 0))
      );
    }
    if (id === 'artifacts') {
      var ents = arr((d.artifacts || {}).entries);
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Artifacts', ents.length),
        summaryCell('PM-owned', ents.filter(function (a) { return a.identity === 'pm'; }).length),
        summaryCell('Redaction pending', ents.filter(function (a) { return a.redaction && a.redaction.state === 'pending'; }).length),
        summaryCell('Past retention', ents.filter(function (a) { return a.retention === 'expired'; }).length)
      );
    }
    if (id === 'sourceControl') {
      var sc = d.sourceControl || {};
      var hostStates = [];
      arr(sc.tools).forEach(function (t) { hostStates = hostStates.concat(arr(t.hostStates)); });
      var wts = arr((sc.worktrees || {}).active);
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Tool records', hostStates.length),
        summaryCell('Ready', hostStates.filter(function (s) { return s.state === 'ready'; }).length),
        summaryCell('Forges connected', arr(sc.forges).filter(function (f) { return f.state === 'connected'; }).length),
        summaryCell('Worktrees', wts.length),
        summaryCell('Leased', wts.filter(function (w) { return w.state === 'leased'; }).length),
        summaryCell('Stale', wts.filter(function (w) { return w.state === 'stale'; }).length)
      );
    }
    if (id === 'actions') {
      var ga = d.githubActions || {};
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Pinned', arr(ga.pinned).length),
        summaryCell('Failing', arr(ga.pinned).filter(function (w) { return w.readiness === 'failing'; }).length),
        summaryCell('Runs fetched', arr(ga.runs).length),
        summaryCell('Capable account', ga.accountCapability && ga.accountCapability.actions ? 1 : 0)
      );
    }
    if (id === 'containers') {
      var ct = d.containers || {};
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Resources', arr(ct.resources).length),
        summaryCell('Ready', arr(ct.resources).filter(function (r) { return r.state === 'ready'; }).length),
        summaryCell('Registries', arr(ct.registries).length),
        summaryCell('Certificate warnings', arr(ct.registries).filter(function (r) { return r.state === 'cert-warning'; }).length)
      );
    }
    if (id === 'web') {
      var wp = arr((d.webResearch || {}).providers);
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Providers', wp.length),
        summaryCell('Ready', wp.filter(function (w) { return w.state === 'ready'; }).length),
        summaryCell('Needs setup', wp.filter(function (w) { return w.state === 'needs-setup'; }).length),
        summaryCell('Guard active', wp.filter(function (w) { return w.guard && w.guard.state !== 'ok'; }).length)
      );
    }
    if (id === 'searchIndex') {
      var ix = d.searchIndex || {};
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Files indexed', ix.files || 0),
        summaryCell('Disk (MB)', ix.diskMB || 0),
        summaryCell('Exclusions', arr(ix.exclusions).length),
        summaryCell('Failures', arr(ix.failures).length)
      );
    }
    if (id === 'cleanup') {
      var cats = arr((d.cleanup || {}).categories);
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Categories', cats.length),
        summaryCell('Items', cats.reduce(function (t, c) { return t + (c.count || 0); }, 0)),
        summaryCell('Reclaimable (MB)', cats.reduce(function (t, c) { return t + (c.sizeMB || 0); }, 0)),
        summaryCell('Protected by lease', arr(((d.cleanup || {}).dryRun && d.cleanup.dryRun.last && d.cleanup.dryRun.last.skipped) || []).length)
      );
    }
    if (id === 'servers') {
      var topo = d.serverTopology || {};
      var envCount = 0;
      arr(topo.hosts).forEach(function (hst) { envCount += arr(hst.environments).length; });
      return h('div', { className: 'lg-summary-grid' },
        summaryCell('Hosts', arr(topo.hosts).length),
        summaryCell('Environments', envCount),
        summaryCell('Clients paired', arr(topo.clients).length),
        summaryCell('Reserved modules', arr((d.serverModules || {}).reserved).length)
      );
    }
    return h('div', { className: 'lg-summary-grid' },
      summaryCell('Records', 0));
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

    /* Authentication boundary — single source: PMProvider. */
    if (p.authBoundary) {
      var abd = window.PMProvider.resolveAuthBoundary(p);
      insp.appendChild(block('Authentication boundary',
        kv([['Ownership', abd.label]]),
        abd.note ? h('p', { className: 'lg-insp-desc', text: abd.note }) : null,
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () {
              window.PMState.receipt(abd.signInVerb, abd.pmDirect
                ? 'Puppet Master runs its own sign-in flow; tokens are stored as vault references and never shown.'
                : 'The flow is owned outside Puppet Master; PM launches it and verifies readiness afterward. Simulated.');
            }
          }, ico('key'), abd.signInVerb))));
    }

    /* External server detail (OpenCode-style connections). */
    if (p.serverInfo) {
      insp.appendChild(block('Server',
        kv([
          ['Address', p.serverInfo.url, 'mono'],
          ['Server version', p.serverInfo.version],
          ['Reachability', cap(str(p.serverInfo.reachability))],
          ['Last handshake', fmtTime(p.serverInfo.lastHandshake)],
          ['Catalog', p.serverInfo.catalogSource === 'server-supplied' ? 'Supplied by the server' : str(p.serverInfo.catalogSource)]
        ]),
        h('p', { className: 'lg-note-line', text: 'The server owns its provider credentials. Puppet Master holds only a scoped access token reference.' })));
    }

    /* Explicit install offer (never bundled, never silent). */
    if (p.setupOffer) {
      var offer = window.PMProvider.installOfferSteps(p);
      var hostChoices = arr(offer.hostChoices);
      var chosen = ui.installHost[p.id] || (hostChoices[0] ? hostChoices[0].label : '');
      var hostGroup = h('div', { className: 'lg-radio-group', role: 'radiogroup', 'aria-label': 'Where to install' });
      hostChoices.forEach(function (hc) {
        hostGroup.appendChild(h('button', {
          className: 'lg-radio', type: 'button', role: 'radio',
          'aria-checked': chosen === hc.label ? 'true' : 'false',
          onClick: function () { ui.installHost[p.id] = hc.label; renderInspector(); }
        }, h('span', { className: 'lg-radio-dot' }), h('span', { text: hc.label })));
      });
      var stepsList = h('div', { className: 'lg-steps' });
      arr(offer.steps).forEach(function (st2, i) {
        stepsList.appendChild(h('div', { className: 'lg-step' },
          h('span', { className: 'lg-step-num', text: String(i + 1) }),
          h('div', { className: 'lg-step-main' },
            h('div', { className: 'lg-step-title', text: st2.title }),
            h('p', { className: 'lg-step-body', text: st2.body }))));
      });
      insp.appendChild(block('Set up ' + p.name,
        kv([['Official source', offer.officialSource, 'mono']]),
        offer.sourceNote ? h('p', { className: 'lg-insp-desc', text: offer.sourceNote }) : null,
        h('div', { className: 'lg-insp-block' }, h('h3', { text: 'Exact host & environment' }), hostGroup),
        stepsList,
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn is-primary', type: 'button', disabled: !chosen,
            onClick: function () {
              window.PMState.receipt('Install ' + p.name + ' on ' + chosen,
                'The signed release would download from ' + offer.officialSource + ', verify, stage, and activate on ' + chosen + ' only. Sign-in stays a separate step. Nothing was installed.');
            }
          }, ico('download'), 'Install on ' + (chosen || 'a host'))),
        h('p', { className: 'lg-note-line', text: offer.policyNote })));
    }

    /* Installation records live in the document as sub-rows. */
    if (arr(p.installations).length > 0) {
      insp.appendChild(block('Installations',
        h('p', { className: 'lg-insp-desc', text: arr(p.installations).length +
          ' installation record' + (p.installations.length === 1 ? '' : 's') +
          ' listed under this connection in the document. Each carries the full resolution chain — configured command, resolved launcher, actual executable — plus update policy and history.' })));
    }

    /* Usage details unavailable but provider ready (honest split). */
    var ud = window.PMProvider.resolveUsageDetails(p);
    if (ud.state === 'unavailable') {
      insp.appendChild(block('Usage details',
        h('div', { className: 'lg-unavail-note' }, ico('info'),
          h('span', null, str(ud.reason)))));
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
      var perfBlock = block('Performance', effortSpeedMenu(m, hasEffort, hasFast));
      if (m.fastNote) { perfBlock.appendChild(h('p', { className: 'lg-note-line', text: m.fastNote })); }
      insp.appendChild(perfBlock);
    } else {
      insp.appendChild(block('Performance',
        h('p', { className: 'lg-insp-desc', text: m.fastNote || 'This model runs at a single effort and speed, so no selector is shown.' })));
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
    var rr = window.PMProvider.resolveFreeRoute(fr);
    appendChild(insp, inspHeader('Free route record', hit ? hit.model.name : fr.modelRef));
    insp.appendChild(h('p', null,
      statusWordEl(rr.tone, rr.label), ' ',
      chipEl(fr.qualifier === 'temporarily-unavailable' ? 'unavailable' : 'custom',
        QUALIFIER_LABELS[fr.qualifier] || 'Qualified route')));
    if (rr.note) { insp.appendChild(h('p', { className: 'lg-insp-desc', text: rr.note })); }
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: QUALIFIER_EXPLAIN[fr.qualifier] || '' }));
    insp.appendChild(block('Route', kv([
      ['State', rr.label],
      ['Underlying connection', under ? under.name : fr.underlyingProviderId],
      ['Model reference', fr.modelRef, 'mono']
    ]),
      h('p', { className: 'lg-note-line', text: rr.wrapperNote })));

    /* Setup only where the state honestly calls for it. Other states get
       their explanation and a way back to the model row. */
    if (rr.state !== 'needs-setup' && rr.state !== 'unverified') {
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () {
            if (hit) { revealManagerRecord('providers', sectionForProvider(hit.provider), { kind: 'model', id: hit.model.id, providerId: hit.provider.id }); }
            else { openManager('providers'); }
          }
        }, ico('arrowL'), 'Go to the model row')));
      return;
    }

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

    /* Requested vs effective — the inspector's natural diff panel. */
    var route = window.PMProvider.resolveRoute(r);
    if (route.differs) {
      insp.appendChild(block('Requested vs effective',
        h('div', { className: 'lg-diff' },
          h('div', { className: 'lg-diff-row' }, h('span', { className: 'lg-diff-key', text: 'Requested' }),
            h('span', { className: 'lg-diff-val', text: route.requested })),
          h('div', { className: 'lg-diff-row' }, h('span', { className: 'lg-diff-key', text: 'Effective' }),
            h('span', { className: 'lg-diff-val', text: route.effective })),
          h('p', { className: 'lg-diff-why', text: route.why || '' })
        )));
    }
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

  /* --------------------------------------------- installation inspector */

  var INSTALL_METHOD_LABELS = {
    'npm-global': 'npm (global)', 'homebrew': 'Homebrew', 'pm-tool-store': 'PM Tool Store',
    'installer': 'Signed installer', 'gh-extension': 'GitHub CLI extension', 'unknown': 'Unknown'
  };

  function findInstallationRec(providerId, instId) {
    var p = providerById(providerId);
    if (p) {
      var insts = arr(p.installations);
      for (var i = 0; i < insts.length; i++) { if (insts[i].id === instId) { return { provider: p, inst: insts[i] }; } }
    }
    var provs = arr(D().providers);
    for (var j = 0; j < provs.length; j++) {
      var list = arr(provs[j].installations);
      for (var k = 0; k < list.length; k++) { if (list[k].id === instId) { return { provider: provs[j], inst: list[k] }; } }
    }
    return null;
  }

  function inspectInstallation(sel) {
    var hit = findInstallationRec(sel.ref, sel.id);
    if (!hit) { renderInspectorSummary(); return; }
    var p = hit.provider;
    var inst = hit.inst;
    var ri = window.PMProvider.resolveInstallation(inst);
    var upd = ri.update;
    var liveKey = p.id + '/' + inst.id;
    var insp = els.insp;
    appendChild(insp, inspHeader('Installation record · ' + p.name, ri.title || inst.id));
    insp.appendChild(h('p', null,
      statusWordEl(upd.tone, upd.label),
      ri.selected ? chipEl('default', 'Selected') : null,
      ri.shadowed ? chipEl('not-configured', 'Shadowed') : null));

    /* Live phases from the trigger registry — instant state changes. */
    ['install-update', 'install-update-fail', 'install-repair'].forEach(function (opName) {
      var strip = phaseStrip(opName, liveKey);
      if (strip && opPhase(opName, liveKey) !== 'done') { insp.appendChild(strip); }
    });

    if (ri.shadowed) {
      insp.appendChild(h('p', { className: 'lg-insp-desc', text: ri.shadowNote }));
    }
    if (ri.manualOnly) {
      insp.appendChild(block('Manual only',
        h('div', { className: 'lg-managed-note' }, ico('lock'),
          h('span', null, ri.manualOnlyReason))));
    }

    /* Humanized card — normal GUI level. */
    insp.appendChild(block('Card', kv([
      ['Version', ri.version],
      ['Host', hostName(inst.hostId)],
      ['Environment', envName(inst.envId) || 'Native'],
      ['Installed with', INSTALL_METHOD_LABELS[str(inst.method)] || cap(str(inst.method))],
      ['Confidence', ri.confidence.label]
    ])));

    /* Update lifecycle: policy, availability, history, verify checklist. */
    var pol = upd.policy || {};
    var updBlock = block('Updates', kv([
      ['Check', pol.check === 'automatic' ? 'Automatically' : cap(str(pol.check))],
      ['Install', pol.install === 'auto-idle' ? 'Automatically when idle' : 'After asking first'],
      ['Version policy', pol.versionPolicy === 'latest-compatible' ? 'Latest compatible' : cap(str(pol.versionPolicy))],
      ['Roll back on failed verification', pol.rollbackOnFailedVerify ? 'On' : 'Off'],
      upd.available ? ['Available', upd.available.version + (upd.available.published ? ' · published ' + upd.available.published : '')] : null
    ].filter(Boolean)));
    if (upd.detail) { updBlock.appendChild(h('p', { className: 'lg-insp-desc', text: upd.detail })); }
    if (upd.state === 'verifying' || upd.state === 'verification-failed' || upd.state === 'rolled-back' || upd.state === 'update-available') {
      updBlock.appendChild(h('p', { className: 'lg-cat-subhead', text: 'Verification checklist' }));
      var chk = h('div', { className: 'lg-cat-log' });
      arr(upd.verifyChecklist).forEach(function (item) {
        chk.appendChild(h('div', { className: 'lg-cat-log-item' }, ico('check'), h('div', { className: 'lg-cat-log-main', text: item })));
      });
      chk.appendChild(h('div', { className: 'lg-cat-log-item' }, ico('warning'),
        h('div', { className: 'lg-cat-log-main', text: 'Installer exit code 0 is never success on its own.' })));
      updBlock.appendChild(chk);
    }
    var histEntries = arr(upd.history);
    if (histEntries.length > 0) {
      updBlock.appendChild(h('p', { className: 'lg-cat-subhead', text: 'History' }));
      var hl = h('div', { className: 'lg-cat-log' });
      histEntries.forEach(function (e) {
        hl.appendChild(h('div', { className: 'lg-cat-log-item' },
          h('span', { className: 'lg-cat-log-at lg-mono', text: fmtTime(e.when) }),
          h('div', { className: 'lg-cat-log-main' },
            h('div', { text: e.from + ' -> ' + e.to + ' — ' + (e.result === 'verified' ? 'Verified' : (e.result === 'verification-failed' ? 'Verification failed' : 'Rolled back')) }),
            e.detail ? h('div', { className: 'lg-cat-log-effect', text: e.detail }) : null)));
      });
      updBlock.appendChild(hl);
    }
    insp.appendChild(updBlock);

    /* Advanced resolution: the full chain, disclosed on demand. */
    var advOpen = !!ui.installAdvOpen[inst.id];
    var adv = ri.advanced;
    insp.appendChild(h('button', {
      className: 'lg-disclosure', type: 'button', 'aria-expanded': advOpen ? 'true' : 'false',
      onClick: function () { ui.installAdvOpen[inst.id] = !ui.installAdvOpen[inst.id]; renderInspector(); }
    }, ico(advOpen ? 'chevD' : 'chevR'), 'Advanced resolution'));
    if (advOpen) {
      var chain = h('div', { className: 'lg-chain' });
      [['Configured', adv.configuredCommand], ['Launcher', adv.resolvedLauncher], ['Executable', adv.actualExecutable]].forEach(function (step, i) {
        chain.appendChild(h('div', { className: 'lg-chain-layer' + (i === 2 ? ' is-active' : '') },
          h('span', { className: 'lg-chain-name', text: step[0] }),
          h('span', { className: 'lg-chain-note lg-mono', text: step[1] || '—' })));
      });
      var advWrap = h('div', { className: 'lg-drawer' },
        chain,
        kv([
          ['Method', adv.method, 'mono'],
          ['Package identity', adv.packageIdentity, 'mono'],
          ['Manager root', adv.managerRoot, 'mono'],
          ['Host id', adv.hostId, 'mono'],
          ['Environment id', adv.envId, 'mono'],
          ['Architecture', adv.arch, 'mono']
        ]));
      if (arr(adv.evidence).length > 0) {
        advWrap.appendChild(h('p', { className: 'lg-cat-subhead', text: 'Discovery evidence' }));
        var evl = h('div', { className: 'lg-cat-log' });
        arr(adv.evidence).forEach(function (e) {
          evl.appendChild(h('div', { className: 'lg-cat-log-item' }, ico('check'), h('div', { className: 'lg-cat-log-main', text: e })));
        });
        advWrap.appendChild(evl);
      }
      insp.appendChild(advWrap);
    }

    /* Actions come from the resolver; manual-only records offer none.
       The action list is DRIVEN by PMProvider.resolveInstallation. */
    var actions = h('div', { className: 'lg-insp-actions' });
    ri.actions.forEach(function (a) {
      if (a.id === 'details') { return; /* the disclosure above is the details surface */ }
      var btn;
      if (a.id === 'select') {
        btn = h('button', { className: 'lg-btn', type: 'button', onClick: function () {
          window.PMState.trigger('install-select', liveKey);
        } }, ico('check'), a.label);
      } else if (a.id === 'update') {
        btn = h('button', { className: 'lg-btn is-primary', type: 'button', onClick: function () {
          window.PMState.trigger('install-update', liveKey);
        } }, ico('download'), a.label);
      } else if (a.id === 'repair') {
        btn = h('button', { className: 'lg-btn', type: 'button', onClick: function () {
          window.PMState.trigger('install-repair', liveKey);
        } }, ico('wrench'), a.label);
      } else if (a.id === 'rollback') {
        btn = h('button', { className: 'lg-btn', type: 'button', onClick: function () {
          window.PMState.receipt('Roll back', 'The previous generation would be restored and re-verified. Simulated.');
        } }, ico('undo'), a.label);
      } else if (a.id === 'verify') {
        btn = h('button', { className: 'lg-btn', type: 'button', onClick: function () {
          window.PMState.receipt('Verify installation',
            'All seven success conditions would be checked: exact path, launch health, auth identity, model catalog, adapter handshake, required capabilities, dependent routes.');
        } }, ico('checkCircle'), a.label);
      } else {
        btn = h('button', { className: 'lg-btn', type: 'button', onClick: function () {
          window.PMState.receipt(a.label, 'This action runs through the shared installation lifecycle in the finished product.');
        } }, a.label);
      }
      actions.appendChild(btn);
    });
    /* The rolled-back fixture invites a retry that fails honestly again. */
    if (upd.state === 'rolled-back' && p.id === 'copilot') {
      actions.appendChild(h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.trigger('install-update-fail', 'copilot/inst.copilot.ghext'); }
      }, ico('refresh'), 'Retry the update'));
    }
    if (actions.childNodes.length > 0) { insp.appendChild(actions); }
  }

  /* ------------------------------------------ free catalog inspector --- */

  function inspectFreeCatalogSource(sel) {
    var cat = D().freeCatalog || {};
    var s = arr(cat.sources).filter(function (x) { return x.id === sel.id; })[0];
    if (!s) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Catalog source record', s.name));
    insp.appendChild(h('p', null, statusWordEl(s.validation === 'stale' ? 'muted' : 'ok',
      s.validation === 'stale' ? 'Stale · last known good' : 'Validated')));
    insp.appendChild(block('Freshness', kv([
      ['Source version', s.sourceVersion, 'mono'],
      ['Last checked', fmtTime(s.lastChecked)],
      ['Last imported', fmtTime(s.lastImported)],
      ['Last activated', fmtTime(s.lastActivated)],
      ['Validation', cap(str(s.validation))],
      ['Last known good', s.lastKnownGood ? 'Kept — routes never vanish mid-session' : 'None']
    ])));
    var hist = arr(cat.changeHistory);
    if (hist.length > 0) {
      var log = h('div', { className: 'lg-cat-log' });
      hist.forEach(function (c) {
        log.appendChild(h('div', { className: 'lg-cat-log-item' },
          h('span', { className: 'lg-cat-log-at lg-mono', text: fmtTime(c.when) }),
          h('div', { className: 'lg-cat-log-main', text: c.change })));
      });
      insp.appendChild(block('Change history', log));
    }
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.trigger('catalog-refresh', 'free-community'); }
      }, ico('refresh'), 'Refresh now')));
  }

  /* ---------------------------------------- covered-manager inspector -- */

  function inspectCovered(sel) {
    var cov = sel.ref || COVERED_IN[sel.id] || null;
    var label = sel.id.replace('manager.', '');
    arr(window.PMState.managerDefs).forEach(function (m) { if (m.id === sel.id) { label = m.label; } });
    var insp = els.insp;
    appendChild(insp, inspHeader('Coverage receipt', label));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: cov
      ? 'This manager family is proven in ' + cov.label + '. The four bakeoff concepts divide the families; this concept links across honestly instead of rebuilding.'
      : 'This manager is not part of the bakeoff.' }));
    if (cov) {
      insp.appendChild(block('Where it lives', kv([
        ['Concept', cov.label],
        ['Page', cov.page, 'mono'],
        ['Deep link', cov.page + '#/manager/' + sel.id, 'mono']
      ])));
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('a', { className: 'lg-btn is-primary', href: cov.page + '#/manager/' + sel.id },
          ico('external'), 'Open in ' + cov.label)));
    }
  }

  /* ------------------------------------------------ storage inspectors  */

  function inspectStorageVault(sel) {
    void sel;
    var st = D().storage || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Storage record', 'Vault'));
    insp.appendChild(block('Record', kv([
      ['Mode', st.mode === 'managed-vault' ? 'Managed vault — PM owns layout and integrity' : cap(str(st.mode))],
      ['Path', st.vaultPath, 'mono'],
      ['Total in use', fmtGB((st.usage || {}).totalGB)]
    ])));
    var mig = st.migration || {};
    if (mig.offer) {
      insp.appendChild(block('Migration',
        h('p', { className: 'lg-insp-desc', text: str(mig.note) }),
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () {
              window.PMState.receipt('Migrate when idle',
                'The layout migration is queued for the next idle window. A restore point is taken first; nothing moved now.');
            }
          }, ico('hourglass'), 'Migrate when idle'))));
    }
  }

  function inspectStoragePressure(sel) {
    void sel;
    var pr = (D().storage || {}).pressure || {};
    var critical = pr.state === 'critical';
    var insp = els.insp;
    appendChild(insp, inspHeader('Storage record', 'Pressure'));
    insp.appendChild(h('p', null, statusWordEl(critical ? 'attention' : (pr.state === 'elevated' ? 'setup' : 'ok'),
      critical ? 'Critical' : (pr.state === 'elevated' ? 'Elevated' : 'Normal'))));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: str(pr.note) }));
    insp.appendChild(block('Record', kv([
      ['Free space', fmtGB(pr.freeGB)],
      ['State', cap(str(pr.state))]
    ])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn' + (critical ? ' is-primary' : ''), type: 'button',
        onClick: function () { runAct('cleanup-dry-run'); }
      }, ico('broom'), 'Run a cleanup dry run'),
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () { revealSetting('system.storage.pressure-action'); }
      }, 'Open the pressure setting')));
  }

  function inspectUsageClass(sel) {
    var st = D().storage || {};
    var c = arr((st.usage || {}).byClass).filter(function (x) { return x.classId === sel.id; })[0];
    if (!c) { renderInspectorSummary(); return; }
    var ret = arr(st.retention).filter(function (x) { return x.classId === sel.id; })[0];
    var insp = els.insp;
    appendChild(insp, inspHeader('Usage record', c.label));
    insp.appendChild(block('Record', kv([
      ['In use', fmtGB(c.gb)],
      ['Share of vault', Math.round((c.gb / Math.max(0.001, (st.usage || {}).totalGB)) * 100) + '%'],
      ret ? ['Retention', ret.days != null ? ret.days + ' days' : 'Until the project is deleted'] : null
    ].filter(Boolean))));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Usage is a read-only status projection. Retention policy is the setting; it lives one section below.' }));
  }

  function inspectRetentionClass(sel) {
    var st = D().storage || {};
    var r = arr(st.retention).filter(function (x) { return x.classId === sel.id; })[0];
    if (!r) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Retention record', r.label));
    insp.appendChild(block('Policy', kv([
      ['Keeps data for', r.days != null ? r.days + ' days' : (r.policy === 'until-project-delete' ? 'Until the project is deleted' : cap(str(r.policy)))],
      ['Applies to', r.label]
    ])));
    if (r.legalHold) {
      insp.appendChild(block('Legal hold',
        h('div', { className: 'lg-managed-note' }, ico('lock'),
          h('span', null, str(r.note) + ' Held items ignore normal expiry entirely and stay until the hold is lifted by the person who placed it.'))));
    }
    if (r.classId === 'run-evidence') {
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn is-quiet', type: 'button',
          onClick: function () { revealSetting('system.storage.evidence-retention'); }
        }, 'Open the retention setting')));
    }
  }

  function inspectQuarantineItem(sel) {
    var q = arr((D().storage || {}).quarantine).filter(function (x) { return x.id === sel.id; })[0];
    if (!q) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Quarantine record', q.item));
    insp.appendChild(h('p', null, statusWordEl('attention', 'Quarantined')));
    insp.appendChild(block('Why', kv([
      ['Reason', q.reason],
      ['Since', fmtTime(q.when)]
    ])));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Quarantined items are isolated, never silently deleted. Releasing or discarding one is an explicit decision with a receipt.' }));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Inspect quarantined item', 'The bundle opens read-only for inspection in the finished product.'); }
      }, ico('eye'), 'Inspect contents'),
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () { window.PMState.receipt('Discard quarantined item', 'Discarding asks for confirmation and keeps the receipt. Nothing was discarded.'); }
      }, ico('trash'), 'Discard')));
  }

  function inspectStorageMaint(sel) {
    var st = D().storage || {};
    var insp = els.insp;
    if (sel.id === 'compaction') {
      var comp = st.compaction || {};
      appendChild(insp, inspHeader('Maintenance record', 'Compaction'));
      insp.appendChild(block('Record', kv([
        ['Last run', fmtTime(comp.lastRun)],
        ['Reclaimed', fmtMB(comp.reclaimedMB)]
      ])));
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () { window.PMState.receipt('Compact now', 'Compaction is queued for the next idle window; it never interrupts active runs.'); }
        }, ico('bolt'), 'Compact when idle')));
    } else {
      var mig = st.migration || {};
      appendChild(insp, inspHeader('Maintenance record', 'Layout migration'));
      insp.appendChild(h('p', { className: 'lg-insp-desc', text: str(mig.note) }));
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () { window.PMState.receipt('Migrate when idle', 'Queued for the next idle window with a restore point first. Nothing moved now.'); }
        }, ico('hourglass'), 'Migrate when idle')));
    }
  }

  function inspectReceiptRec(sel) {
    var lists = [arr((D().storage || {}).receipts)];
    var r = null;
    lists.forEach(function (list) {
      list.forEach(function (x) { if (x && x.id === sel.id) { r = x; } });
    });
    if (!r) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Receipt', r.label));
    insp.appendChild(block('Record', kv([
      ['Receipt id', r.id, 'mono'],
      ['When', fmtTime(r.when)]
    ])));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Receipts are durable: they record what actually ran, when, and with what outcome.' }));
  }

  /* ------------------------------------------------- backup inspectors  */

  function inspectBackupKind(sel) {
    var bk = D().backups || {};
    var k = arr(bk.kinds).filter(function (x) { return x.id === sel.id; })[0];
    if (!k) { renderInspectorSummary(); return; }
    var points = arr(bk.restorePoints).filter(function (rp) { return rp.kind === k.id; });
    var insp = els.insp;
    appendChild(insp, inspHeader('Backup kind record', k.label));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: k.note }));
    insp.appendChild(block('Record', kv([
      ['Restore points of this kind', String(points.length)],
      k.id === 'bk.server' ? ['Owner', 'The Server itself — scheduled and stored server-side'] : null,
      k.id === 'bk.recovery' ? ['Owner', 'Automatic and internal — not a backup you manage'] : null
    ].filter(Boolean))));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'The four kinds never blur: internal recovery snapshots, settings backups, project backups, and full Server backups have different owners, schedules, and restore paths.' }));
  }

  function inspectRestorePoint(sel) {
    var bk = D().backups || {};
    var rp = arr(bk.restorePoints).filter(function (x) { return x.id === sel.id; })[0];
    if (!rp) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Restore point record', rp.label));
    insp.appendChild(h('p', null, rp.verified ? statusWordEl('ok', 'Verified')
      : (rp.verification === 'pending' ? statusWordEl('setup', 'Verification pending') : statusWordEl('attention', 'Not verified'))));
    insp.appendChild(block('Record', kv([
      ['Kind', backupKindLabel(rp.kind)],
      ['Taken', fmtTime(rp.when)],
      ['Origin', rp.origin === 'pre-import' ? 'Automatic, before a settings import' : (rp.origin === 'schedule' ? 'Scheduled' : 'Manual')],
      ['Size', fmtMB(rp.sizeMB)],
      rp.target ? ['Stored on', rp.target, 'mono'] : null,
      rp.encrypted ? ['Encryption', 'Encrypted — key owned by the PM vault'] : null
    ].filter(Boolean))));
    if (rp.verification === 'pending') {
      insp.appendChild(h('p', { className: 'lg-insp-desc', text: 'The monthly Server backup wrote to ' + str(rp.target) + ', but its verification pass has not run yet. Until it does, this point is not proven restorable.' }));
    }
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () {
          window.PMState.receipt('Restore from ' + rp.label,
            'Restore previews what changes, creates a fresh restore point of the current state first, then applies. Nothing was restored.');
        }
      }, ico('undo'), 'Restore…'),
      rp.verification === 'pending' ? h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Verify backup', 'The verification pass would run on the server and report honestly.'); }
      }, ico('checkCircle'), 'Verify now') : null));
  }

  function inspectBackupAction(sel) {
    void sel;
    var insp = els.insp;
    appendChild(insp, inspHeader('Action record', 'Back Up Now'));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: 'A one-shot ACTION: it runs once, verifies, and leaves a restore point and a receipt. The backup schedule is a separate persistent setting, and "Last backup" is read-only status — the ledger keeps the three kinds visibly distinct.' }));
    var strip = phaseStrip('backup-now', 'bk.settings');
    if (strip) { insp.appendChild(strip); }
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn is-primary', type: 'button',
        onClick: function () { window.PMState.trigger('backup-now', 'bk.settings'); }
      }, ico('database'), 'Back Up Now')));
  }

  function inspectBackupStatus(sel) {
    var insp = els.insp;
    var labels = {
      'schedule-settings': ['Settings backup schedule', 'Settings back up on every change, plus automatically before any import.'],
      'schedule-server': ['Full Server backup schedule', 'The Server schedules and stores its own full backup; Settings only reports it.'],
      'last-backup': ['Last backup', 'Read-only status. The newest restore point above is the source of truth.']
    };
    var meta = labels[sel.id] || ['Status record', ''];
    appendChild(insp, inspHeader('Status record', meta[0]));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: meta[1] }));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Status records are projections — they cannot be edited, and they say so.' }));
  }

  function inspectTestRestore(sel) {
    void sel;
    var tr = ((D().backups || {}).testRestore || {}).last || null;
    var insp = els.insp;
    appendChild(insp, inspHeader('Test restore record', 'Last test restore'));
    if (tr) {
      insp.appendChild(h('p', null, statusWordEl(tr.result === 'passed' ? 'ok' : 'attention', tr.result === 'passed' ? 'Passed' : 'Failed')));
      insp.appendChild(block('Record', kv([
        ['Point tested', tr.point, 'mono'],
        ['Target', tr.target],
        ['When', fmtTime(tr.when)],
        ['Note', tr.note]
      ])));
    } else {
      insp.appendChild(h('p', { className: 'lg-insp-desc', text: 'No test restore has run yet.' }));
    }
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.trigger('test-restore'); }
      }, ico('beaker'), 'Run test restore')));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Test restores land in a scratch dataset and verify hashes. The live project is never touched.' }));
  }

  function inspectBackupEncryption(sel) {
    void sel;
    var enc = (D().backups || {}).encryption || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Encryption record', 'Backup encryption'));
    insp.appendChild(h('p', null, statusWordEl(enc.enabled ? 'ok' : 'setup', enc.enabled ? 'Encrypted' : 'Not encrypted')));
    insp.appendChild(block('Record', kv([
      ['State', enc.enabled ? 'On' : 'Off'],
      ['Key owner', str(enc.keyOwner) || 'PM vault'],
      ['Note', str(enc.note)]
    ])));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'The key never leaves the vault, and the interface never shows it. Portable secrets require a separately encrypted advanced flow.' }));
  }

  /* ------------------------------------------- lifecycle inspectors ---- */

  function inspectImportState(sel) {
    void sel;
    var lc = D().settingsLifecycle || {};
    var pv = lc.importPreview || {};
    var state = str(pv.state) || 'dormant';
    var counts = pv.counts || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Import record', str(pv.source) || 'Settings import'));
    var word = { staged: ['setup', 'Preview staged'], applied: ['ok', 'Applied'], 'rolled-back': ['ok', 'Rolled back'], dormant: ['muted', 'Dormant'] }[state] || ['setup', cap(state)];
    insp.appendChild(h('p', null, statusWordEl(word[0], word[1])));
    var applyStrip = phaseStrip('import-apply', null);
    if (applyStrip) { insp.appendChild(applyStrip); }
    var rbStrip = phaseStrip('import-rollback', null);
    if (rbStrip && state !== 'staged') { insp.appendChild(rbStrip); }

    insp.appendChild(block('Record', kv([
      ['File', pv.source, 'mono'],
      ['Created on', pv.createdOn],
      ['Restore point', pv.restorePointId, 'mono']
    ])));

    if (state === 'staged') {
      insp.appendChild(block('Preview', kv([
        ['Adds', String(counts.add || 0)],
        ['Changes', String(counts.change || 0)],
        ['Conflicts', String(counts.conflict || 0) + ' — each is a record in the document'],
        ['Invalid keys', String(counts.invalid || 0) + ' — skipped with reasons'],
        ['Legacy keys migrated', String(counts.legacyMigrated || 0)]
      ])));
      /* Merge vs replace — an explicit mode, not a format dropdown. */
      var mode = ui.importMode || str(pv.mode) || 'merge';
      var modeGroup = h('div', { className: 'lg-radio-group', role: 'radiogroup', 'aria-label': 'Import mode' });
      [['merge', 'Merge — imported values overlay your current settings'],
       ['replace', 'Replace — the file becomes the whole settings set']].forEach(function (opt) {
        modeGroup.appendChild(h('button', {
          className: 'lg-radio', type: 'button', role: 'radio',
          'aria-checked': mode === opt[0] ? 'true' : 'false',
          onClick: function () {
            ui.importMode = opt[0];
            window.PMState.receipt('Import mode', 'Mode set to ' + opt[0] + ' for this staged import.');
            renderInspector();
          }
        }, h('span', { className: 'lg-radio-dot' }), h('span', { text: opt[1] })));
      });
      insp.appendChild(block('Mode', modeGroup));
      insp.appendChild(h('p', { className: 'lg-note-line', text: str(pv.secretNote) + ' Managed rows are excluded.' }));
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn is-primary', type: 'button',
          onClick: function () { window.PMState.trigger('import-apply'); }
        }, ico('check'), 'Apply import'),
        h('button', {
          className: 'lg-btn is-quiet', type: 'button',
          onClick: function () { window.PMState.trigger('import-cancel'); }
        }, 'Cancel')));
      insp.appendChild(h('p', { className: 'lg-note-line', text: 'Apply is atomic: restore point, then apply, then verify. If verification fails, nothing is kept.' }));
    } else if (state === 'applied') {
      insp.appendChild(h('p', { className: 'lg-insp-desc', text: 'The import applied atomically and verified. The pre-import snapshot remains available for one-click rollback.' }));
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () { window.PMState.trigger('import-rollback'); }
        }, ico('undo'), 'Roll back to the snapshot')));
    } else if (state === 'rolled-back') {
      var rb = lc.rollbackJustCompleted || {};
      insp.appendChild(block('Rollback', kv([
        ['Completed', fmtTime(rb.when)],
        ['Receipt', rb.receiptId, 'mono'],
        ['Detail', rb.detail]
      ])));
      insp.appendChild(h('p', { className: 'lg-note-line', text: 'The receipt records both directions — what was applied and what was reverted.' }));
    } else {
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn is-primary', type: 'button',
          onClick: function () { window.PMState.trigger('import-preview'); }
        }, ico('download'), 'Stage an import preview')));
    }
  }

  function inspectImportConflict(sel) {
    var pv = (D().settingsLifecycle || {}).importPreview || {};
    var c = arr(pv.conflicts).filter(function (x) { return x.settingId === sel.id; })[0];
    if (!c) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Import conflict record', settingLabelFor(c.settingId)));
    insp.appendChild(h('p', null, statusWordEl('attention', 'Conflict')));
    insp.appendChild(block('Local vs incoming',
      h('div', { className: 'lg-diff' },
        h('div', { className: 'lg-diff-row' }, h('span', { className: 'lg-diff-key', text: 'Local' }),
          h('span', { className: 'lg-diff-val', text: str(c.local) })),
        h('div', { className: 'lg-diff-row' }, h('span', { className: 'lg-diff-key', text: 'Incoming' }),
          h('span', { className: 'lg-diff-val', text: str(c.incoming) })),
        c.note ? h('p', { className: 'lg-diff-why', text: c.note }) : null)));
    insp.appendChild(block('Record', kv([['Canonical id', c.settingId, 'mono']])));
    var choiceKey = 'import.choice.' + c.settingId;
    var chosen = str(store.get(choiceKey)) || 'incoming';
    var group = h('div', { className: 'lg-radio-group', role: 'radiogroup', 'aria-label': 'Conflict resolution' });
    [['incoming', 'Take the incoming value'], ['local', 'Keep the local value']].forEach(function (opt) {
      group.appendChild(h('button', {
        className: 'lg-radio', type: 'button', role: 'radio',
        'aria-checked': chosen === opt[0] ? 'true' : 'false',
        onClick: function () {
          store.set(choiceKey, opt[0]);
          window.PMState.receipt('Conflict decision', '"' + settingLabelFor(c.settingId) + '": ' + opt[1].toLowerCase() + ' when the import applies.');
          renderInspector();
        }
      }, h('span', { className: 'lg-radio-dot' }), h('span', { text: opt[1] })));
    });
    insp.appendChild(block('Decision', group));
  }

  function inspectImportInvalid(sel) {
    var pv = (D().settingsLifecycle || {}).importPreview || {};
    var iv = arr(pv.invalid).filter(function (x) { return x.key === sel.id; })[0];
    if (!iv) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Invalid key record', iv.key));
    insp.appendChild(h('p', null, chipEl('unavailable', 'Will be skipped')));
    insp.appendChild(block('Why', kv([['Reason', iv.reason]])));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Invalid keys never block the rest of the import; they are skipped and listed in the receipt.' }));
  }

  function inspectLegacyMigration(sel) {
    var pv = (D().settingsLifecycle || {}).importPreview || {};
    var lm = arr(pv.legacyMigrated)[parseInt(sel.id, 10)];
    if (!lm) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Legacy key record', lm.from));
    var chain = h('div', { className: 'lg-chain' },
      h('div', { className: 'lg-chain-layer' },
        h('span', { className: 'lg-chain-name', text: 'Legacy' }),
        h('span', { className: 'lg-chain-note lg-mono', text: lm.from })),
      h('div', { className: 'lg-chain-layer is-active' },
        h('span', { className: 'lg-chain-name', text: 'Current' }),
        h('span', { className: 'lg-chain-note lg-mono', text: lm.to })));
    insp.appendChild(block('Migration', chain,
      h('p', { className: 'lg-note-line', text: 'Migrated automatically during preview. The receipt names every migrated key.' })));
  }

  function inspectLifecycleEvent(sel) {
    var hist = arr((D().settingsLifecycle || {}).history);
    var ev = hist[parseInt(sel.id, 10)];
    if (!ev) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Lifecycle event record',
      ev.action === 'rollback-complete' ? 'Rollback complete' : (ev.action === 'import-applied' ? 'Import applied' : cap(str(ev.action).replace(/-/g, ' ')))));
    insp.appendChild(block('Record', kv([
      ['When', fmtTime(ev.when)],
      ['Receipt', ev.receiptId, 'mono'],
      ['Detail', ev.detail]
    ])));
    if (ev.action === 'rollback-complete') {
      insp.appendChild(h('p', { className: 'lg-note-line', text: 'A rollback receipt records both directions: what the import changed and what the rollback reverted.' }));
    }
  }

  function inspectExportRecord(sel) {
    void sel;
    var ex = (D().settingsLifecycle || {}).lastExport || null;
    if (!ex) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Export record', ex.file));
    insp.appendChild(block('Record', kv([
      ['When', fmtTime(ex.when)],
      ['Scope', ex.scope],
      ['Receipt', ex.receiptId, 'mono']
    ])));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Secrets never travel in settings files. Tokens and keys stay behind vault references.' }));
  }

  function inspectResetDefaults(sel) {
    void sel;
    var insp = els.insp;
    appendChild(insp, inspHeader('Action record', 'Reset settings to defaults'));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: 'Choose a scope, preview what changes, then confirm. Managed rows are never touched by a reset.' }));

    var scopeGroup = h('div', { className: 'lg-radio-group', role: 'radiogroup', 'aria-label': 'Reset scope' });
    [['category', 'One category'], ['all', 'Everything']].forEach(function (opt) {
      scopeGroup.appendChild(h('button', {
        className: 'lg-radio', type: 'button', role: 'radio',
        'aria-checked': ui.reset.scope === opt[0] ? 'true' : 'false',
        onClick: function () { ui.reset.scope = opt[0]; ui.reset.previewed = false; ui.reset.confirmed = false; renderInspector(); }
      }, h('span', { className: 'lg-radio-dot' }), h('span', { text: opt[1] })));
    });
    var scopeBlock = block('Scope', scopeGroup);
    if (ui.reset.scope === 'category') {
      var domSel = h('select', { className: 'lg-select', 'aria-label': 'Category to reset' });
      arr(D().taxonomy).forEach(function (dom) {
        var opt = h('option', { value: dom.id, text: dom.title });
        if (dom.id === ui.reset.domain) { opt.selected = true; }
        domSel.appendChild(opt);
      });
      domSel.addEventListener('change', function () {
        ui.reset.domain = domSel.value;
        ui.reset.previewed = false;
        ui.reset.confirmed = false;
        renderInspector();
      });
      scopeBlock.appendChild(domSel);
    }
    insp.appendChild(scopeBlock);

    if (!ui.reset.previewed) {
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () { ui.reset.previewed = true; renderInspector(); }
        }, ico('eye'), 'Preview the reset')));
      return;
    }

    /* Preview: count custom rows in scope from the live store. */
    var affected = 0;
    var managedSkipped = 0;
    Object.keys(settings()).forEach(function (sid) {
      var s = settings()[sid];
      var loc = locate(sid);
      if (ui.reset.scope === 'category' && (!loc || loc.domainId !== ui.reset.domain)) { return; }
      if (s.valueSource === 'managed') { managedSkipped++; return; }
      if (s.valueSource === 'custom') { affected++; }
    });
    insp.appendChild(block('Preview', kv([
      ['Rows returning to defaults', String(affected)],
      ['Managed rows skipped', String(managedSkipped)],
      ['Restore point', 'Created automatically before the reset']
    ])));
    if (!ui.reset.confirmed) {
      insp.appendChild(h('div', { className: 'lg-caution' },
        h('div', { className: 'lg-caution-head' }, ico('warning'), 'Confirm the reset'),
        h('p', { text: 'This returns ' + affected + ' customized row' + (affected === 1 ? '' : 's') +
          (ui.reset.scope === 'category' ? ' in one category' : ' across every category') +
          ' to their defaults. A restore point is created first, so it can be undone.' }),
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn is-primary', type: 'button', disabled: affected === 0,
            onClick: function () {
              ui.reset.previewed = false;
              window.PMState.receipt('Reset applied',
                affected + ' row' + (affected === 1 ? '' : 's') + ' would return to defaults after a restore point. Nothing changed in this demo.');
              renderInspector();
            }
          }, 'I understand — reset'),
          h('button', {
            className: 'lg-btn is-quiet', type: 'button',
            onClick: function () { ui.reset.previewed = false; renderInspector(); }
          }, 'Cancel'))));
    }
  }

  /* --------------------------------------------- history inspectors ---- */

  function inspectSession(sel) {
    var hs = D().sessionsHistory || {};
    var s = arr(hs.sessions).filter(function (x) { return x.id === sel.id; })[0];
    if (!s) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Session record · ' + s.project, s.title));
    insp.appendChild(block('Record', kv([
      ['Started', fmtTime(s.started)],
      ['Turns', String(s.turns)],
      ['Routes used', arr(s.routes).join(', ')],
      ['Size', fmtMB(s.sizeMB)],
      ['State', s.archived ? 'Archived' : 'Active'],
      ['Session id', s.id, 'mono']
    ])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Compare sessions', 'Pick a second session to compare turn by turn. Opens as its own surface in the finished product.'); }
      }, ico('scales'), 'Compare'),
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Export session', '"' + s.title + '" would export as Markdown or JSON with a receipt.'); }
      }, ico('download'), 'Export'),
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () {
          s.archived = !s.archived;
          window.PMState.receipt(s.archived ? 'Session archived' : 'Session unarchived',
            '"' + s.title + '" ' + (s.archived ? 'moved to the archive. It stays searchable.' : 'is active again.'));
          refreshManagerRowAndInspector();
        }
      }, ico('folder'), s.archived ? 'Unarchive' : 'Archive'),
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () {
          window.PMState.receipt('Delete session', 'Deletion policy is "ask": a confirmation names the session, its size, and its receipts before anything is removed. Nothing was deleted.');
        }
      }, ico('trash'), 'Delete…')));
  }

  function inspectHistAction(sel) {
    var meta = {
      'compare': ['Compare two sessions', 'Side-by-side turn comparison with route and cost annotations.'],
      'export': ['Export a session', 'Writes Markdown or JSON with a receipt. Redaction rules apply on the way out.'],
      'rebuild-index': ['Rebuild the history index', 'Re-derives the search index over past sessions. Sessions stay readable while it runs.']
    }[sel.id] || ['Action', ''];
    var insp = els.insp;
    appendChild(insp, inspHeader('Action record', meta[0]));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: meta[1] }));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt(meta[0], 'Runs as its own flow in the finished product; simulated here.'); }
      }, ico('play'), 'Run')));
  }

  function inspectHistPolicy(sel) {
    var pol = (D().sessionsHistory || {}).policy || {};
    var insp = els.insp;
    if (sel.id === 'archive') {
      appendChild(insp, inspHeader('Policy record', 'Archive after'));
      insp.appendChild(block('Record', kv([
        ['Archive after', pol.archiveAfterDays + ' days of inactivity'],
        ['Effect', 'Archived sessions leave the default list but stay stored and searchable']
      ])));
      return;
    }
    appendChild(insp, inspHeader('Policy record', 'Deletion'));
    var chosen = str(store.get('hist.deletion')) || str(pol.deletion) || 'ask';
    var group = h('div', { className: 'lg-radio-group', role: 'radiogroup', 'aria-label': 'Deletion policy' });
    [['ask', 'Ask first — every deletion is confirmed by name'],
     ['manual', 'Manual only — nothing is ever deleted automatically']].forEach(function (opt) {
      group.appendChild(h('button', {
        className: 'lg-radio', type: 'button', role: 'radio',
        'aria-checked': chosen === opt[0] ? 'true' : 'false',
        onClick: function () {
          store.set('hist.deletion', opt[0]);
          window.PMState.receipt('Deletion policy', 'Set to "' + opt[0] + '" for future simulated deletions.');
          renderInspector();
        }
      }, h('span', { className: 'lg-radio-dot' }), h('span', { text: opt[1] })));
    });
    insp.appendChild(block('Policy', group));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'There is no silent-delete option by design.' }));
  }

  /* --------------------------------------------- artifact inspector ---- */

  function inspectArtifact(sel) {
    var a = arr((D().artifacts || {}).entries).filter(function (x) { return x.id === sel.id; })[0];
    if (!a) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Artifact record · ' + (ARTIFACT_TYPE_LABELS[a.type] || cap(str(a.type))), a.name));
    if (a.retention === 'expired') {
      insp.appendChild(h('p', null, statusWordEl('attention', 'Past retention'),
        chipEl('unavailable', 'Cleanup candidate')));
    }
    insp.appendChild(block('Identity', kv([
      ['Owner', a.identity === 'pm' ? 'Puppet Master — produced and tracked by PM' : 'Provider-native — produced by the provider, tracked by PM'],
      a.identityNote ? ['Note', a.identityNote] : null,
      ['Produced by', a.producedBy, 'mono'],
      ['Version', 'v' + a.version]
    ].filter(Boolean))));
    insp.appendChild(block('Storage', kv([
      ['Location', a.location, 'mono'],
      ['Retention', a.retention === 'expired' ? 'Expired — eligible for cleanup' : (a.retention === 'until-project-delete' ? 'Until the project is deleted' : a.retention)],
      ['Receipt', a.receiptId, 'mono']
    ])));
    var red = a.redaction || {};
    var redBlock = block('Redaction', kv([
      ['State', red.state === 'applied' ? 'Applied' : (red.state === 'pending' ? 'Pending' : 'None')],
      arr(red.rules).length ? ['Rules', arr(red.rules).join(', ')] : null
    ].filter(Boolean)));
    if (red.state === 'pending') {
      redBlock.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () {
            red.state = 'applied';
            window.PMState.receipt('Redaction applied', 'Rules (' + arr(red.rules).join(', ') + ') applied to ' + a.name + '. The original stays sealed in the vault.');
            refreshManagerRowAndInspector();
          }
        }, ico('shield'), 'Apply redaction now')));
    }
    insp.appendChild(redBlock);
    var actions = h('div', { className: 'lg-insp-actions' });
    [['open', 'Open', 'doc'], ['reveal', 'Reveal in vault', 'folder'], ['export', 'Export', 'download']].forEach(function (act) {
      if (arr(a.actions).indexOf(act[0]) < 0) { return; }
      actions.appendChild(h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () {
          window.PMState.receipt(act[1] + ' artifact', '"' + a.name + '" — ' + act[1].toLowerCase() + ' runs in the finished product; nothing left the vault.');
        }
      }, ico(act[2]), act[1]));
    });
    if (arr(a.actions).indexOf('clean') >= 0) {
      actions.appendChild(h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () {
          window.PMState.receipt('Clean artifact', a.retention === 'expired'
            ? '"' + a.name + '" is past retention. Cleaning asks for confirmation and leaves a receipt. Nothing was deleted.'
            : '"' + a.name + '" is still within retention; cleaning would ask for an explicit confirmation first.');
        }
      }, ico('broom'), 'Clean…'));
    }
    insp.appendChild(actions);
  }

  /* --------------------------------------- source control inspectors --- */

  function inspectScRepo(sel) {
    void sel;
    var proj = (D().serverTopology || {}).project || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Repository record', 'Puppet Master'));
    insp.appendChild(block('Source location', kv([
      ['Hosted on', proj.hostedOn],
      ['Project files', proj.files, 'mono'],
      ['Run work', proj.runWork]
    ])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Connect existing checkout', 'Maps an existing local checkout to this project without cloning again.'); }
      }, ico('link'), 'Connect existing checkout'),
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Add checkout or worktree', 'Creates an additional checkout or worktree on a chosen host and environment.'); }
      }, ico('plus'), 'Add checkout or worktree')));
  }

  function inspectScTool(sel) {
    var ref = sel.ref || {};
    var sc = D().sourceControl || {};
    var tool = arr(sc.tools).filter(function (t) { return t.id === ref.toolId; })[0];
    if (!tool) { renderInspectorSummary(); return; }
    var hs = arr(tool.hostStates).filter(function (x) {
      return (ref.envId && x.envId === ref.envId) || (!ref.envId && x.hostId === ref.hostId && !x.envId) || (x.hostId === ref.hostId && x.envId === ref.envId);
    })[0] || arr(tool.hostStates).filter(function (x) { return x.hostId === ref.hostId; })[0];
    if (!hs) { renderInspectorSummary(); return; }
    var where = hs.envId ? envName(hs.envId) : hostName(hs.hostId);
    var ready = hs.state === 'ready';
    var insp = els.insp;
    appendChild(insp, inspHeader('Tool record · ' + where, tool.name));
    insp.appendChild(h('p', null, statusWordEl(ready ? 'ok' : 'setup', ready ? 'Ready' : 'Not installed')));
    if (ready) {
      insp.appendChild(block('Card', kv([
        ['Version', hs.version, 'mono'],
        ['Where', where],
        hs.installationNote ? ['Installation', hs.installationNote] : null
      ].filter(Boolean))));
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () { window.PMState.receipt('Update ' + tool.name + ' on ' + where, 'Updates go through the shared installation lifecycle: stage, verify, activate, keep the previous generation for rollback.'); }
        }, ico('download'), 'Update ' + tool.name + ' on ' + where),
        h('button', {
          className: 'lg-btn is-quiet', type: 'button',
          onClick: function () { window.PMState.receipt('Repair ' + tool.name, 'Repair re-links and re-verifies the installation on ' + where + '.'); }
        }, ico('wrench'), 'Repair')));
    } else {
      var offer = hs.installOffer || {};
      insp.appendChild(block('Install',
        h('p', { className: 'lg-insp-desc', text: str(offer.note) || 'Installs only into the exact selected environment.' }),
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn is-primary', type: 'button',
            onClick: function () {
              window.PMState.receipt(str(offer.label) || ('Install ' + tool.name + ' on ' + where),
                'Installs from the official source into ' + where + ' only. Nothing was installed in this demo.');
            }
          }, ico('download'), str(offer.label) || ('Install ' + tool.name + ' on ' + where)))));
      if (hs.envId === 'env.win.wsl') {
        insp.appendChild(h('p', { className: 'lg-note-line', text: 'WSL itself stays optional; Windows-native work is unaffected either way.' }));
      }
    }
  }

  function inspectForge(sel) {
    var f = arr((D().sourceControl || {}).forges).filter(function (x) { return x.id === sel.id; })[0];
    if (!f) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Hosting service record', f.name));
    if (f.state === 'connected') {
      insp.appendChild(h('p', null, statusWordEl('ok', 'Connected')));
      var capb = f.capability || {};
      insp.appendChild(block('Connection', kv([
        ['Account', f.account],
        ['Scopes', arr(f.scopes).join(', ')],
        ['Workflows', capb.actions ? 'Available on this connection' : 'Not available on this connection'],
        ['Packages', capb.packages ? 'Available' : 'Not available on this connection']
      ])));
      if (f.connectNote) { insp.appendChild(h('p', { className: 'lg-note-line', text: f.connectNote })); }
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn is-quiet', type: 'button',
          onClick: function () { window.PMState.receipt('Disconnect ' + f.name, 'Disconnecting removes the token reference and asks about dependent features first.'); }
        }, 'Disconnect…')));
    } else if (f.state === 'unreachable') {
      insp.appendChild(h('p', null, statusWordEl('attention', 'Unreachable')));
      insp.appendChild(h('p', { className: 'lg-insp-desc', text: str(f.stateNote) || 'Offline. Local repositories keep working.' }));
    } else {
      insp.appendChild(h('p', null, statusWordEl('setup', 'Not connected')));
      var offer = f.connectOffer || {};
      insp.appendChild(block('Connect',
        h('p', { className: 'lg-insp-desc', text: str(offer.note) || 'Connect the hosted service. Installing a CLI is never required for the connection itself.' }),
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn is-primary', type: 'button',
            onClick: function () {
              window.PMState.receipt(str(offer.label) || ('Connect ' + f.name),
                'Preferred flows: device code, official URL plus returned code, or a secure key form. Simulated.');
            }
          }, ico('plug'), str(offer.label) || ('Connect ' + f.name)))));
    }
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Hosted services CONNECT; only actual tools install. There is no "Install ' + f.name + '".' }));
  }

  function inspectSshKey(sel) {
    var k = arr(((D().sourceControl || {}).ssh || {}).keys).filter(function (x) { return x.id === sel.id; })[0];
    if (!k) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('SSH key record', k.label));
    insp.appendChild(block('Record', kv([
      ['Algorithm', k.algo],
      ['Created', k.created],
      ['Used for', arr(k.hosts).join(', ')]
    ])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Copy public key', 'The public half would copy to the clipboard. Private keys never surface in the interface.'); }
      }, ico('copy'), 'Copy public key'),
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () { window.PMState.receipt('Remove key', 'Removal asks which connections depend on this key first. Nothing was removed.'); }
      }, ico('trash'), 'Remove…')));
  }

  function inspectWorktree(sel) {
    var wt = (D().sourceControl || {}).worktrees || {};
    var w = arr(wt.active).filter(function (x) { return x.id === sel.id; })[0];
    if (!w) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Worktree record', w.branch));
    var word = w.state === 'leased' ? ['ok', 'In use'] : (w.state === 'stale' ? ['attention', 'Stale'] : ['muted', 'Idle']);
    insp.appendChild(h('p', null, statusWordEl(word[0], word[1])));
    insp.appendChild(block('Record', kv([
      ['Branch', w.branch, 'mono'],
      ['Path', w.path, 'mono'],
      w.state === 'stale' ? ['Why stale', w.staleNote] : null
    ].filter(Boolean))));
    if (w.state === 'leased' && w.lease) {
      insp.appendChild(block('Lease',
        h('div', { className: 'lg-managed-note' }, ico('lock'),
          h('span', null, 'Held by ' + str(w.lease.holder) + ' until ' + fmtTime(w.lease.expires) +
            '. Leased worktrees are protected: cleanup and prune always skip them.'))));
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', { className: 'lg-btn', type: 'button', disabled: true }, ico('trash'), 'Prune')));
      insp.appendChild(h('p', { className: 'lg-note-line', text: 'Prune is disabled while the lease holds.' }));
    } else {
      var confirmed = !!ui.pruneConfirm[w.id];
      if (!confirmed) {
        insp.appendChild(h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () { ui.pruneConfirm[w.id] = true; renderInspector(); }
          }, ico('trash'), 'Prune…')));
      } else {
        insp.appendChild(h('div', { className: 'lg-caution' },
          h('div', { className: 'lg-caution-head' }, ico('warning'), 'Prune this worktree'),
          h('p', { text: 'Removes the checkout at ' + w.path + '. The branch itself stays; ' +
            ((D().sourceControl || {}).recovery || {}).reflogDays + ' days of movement remain recoverable.' }),
          h('div', { className: 'lg-insp-actions' },
            h('button', {
              className: 'lg-btn is-primary', type: 'button',
              onClick: function () {
                ui.pruneConfirm[w.id] = false;
                window.PMState.receipt('Worktree pruned', w.branch + ' would be pruned with a receipt. Nothing was removed in this demo.');
                renderInspector();
              }
            }, 'I understand — prune'),
            h('button', {
              className: 'lg-btn is-quiet', type: 'button',
              onClick: function () { ui.pruneConfirm[w.id] = false; renderInspector(); }
            }, 'Cancel'))));
      }
    }
  }

  function inspectScPolicy(sel) {
    var meta = {
      'backend': ['Effective backend', 'The tool PM actually uses for this project right now. Details live on the tool records above.'],
      'test-before-merge': ['Test before merge', 'When on, merges wait for the project test suite to pass in the worktree being merged. Failures block the merge with the log attached.'],
      'force-push': ['Force push', 'Never. No agent, rule, or profile can force-push — this is a safety floor, not a preference.'],
      'protected': ['Protected branches', 'Pushes to protected branches require the test-before-merge gate and never rewrite history.'],
      'leases': ['Worktree leases', 'Active Goals hold leases on their worktrees. Cleanup, prune, and other destructive operations always skip leased worktrees.'],
      'recovery': ['Branch & bookmark recovery', 'Both Git and Jujutsu movement is tracked so accidental resets can be recovered.'],
      'update-check': ['Check for tool updates', 'Checking is automatic and safe; nothing installs from a check.'],
      'update-install': ['Install tool updates', 'Ask first. Requested and effective policy can differ when an organization manages a tool — the record shows both.']
    }[sel.id] || ['Policy record', ''];
    var insp = els.insp;
    appendChild(insp, inspHeader('Policy record', meta[0]));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: meta[1] }));
    if (sel.id === 'force-push' || sel.id === 'leases') {
      insp.appendChild(block('Managed',
        h('div', { className: 'lg-managed-note' }, ico('lock'),
          h('span', null, 'This is a safety floor. No profile, Persona, or rule can widen it.'))));
    }
  }

  function inspectEnvRec(sel) {
    var topo = D().serverTopology || {};
    var host = null, env = null;
    arr(topo.hosts).forEach(function (hst) {
      arr(hst.environments).forEach(function (e) {
        if (e.id === sel.id) { host = hst; env = e; }
      });
    });
    if (!env) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Environment record · ' + host.name, env.label));
    var word = env.state === 'ready' ? ['ok', 'Ready'] : (env.state === 'off' ? ['muted', 'Off'] : ['muted', cap(str(env.state).replace(/-/g, ' '))]);
    insp.appendChild(h('p', null, statusWordEl(word[0], word[1]), env.optional ? chipEl('default', 'Optional') : null));
    insp.appendChild(block('Record', kv([
      ['Host', host.name],
      ['Kind', cap(str(env.kind).replace(/-/g, ' '))],
      env.healthNote ? ['Health', env.healthNote] : null
    ].filter(Boolean))));
    if (env.state === 'off' && env.optional) {
      insp.appendChild(h('p', { className: 'lg-note-line', text: 'Off is a healthy state for an optional environment. Setup is offered only when a selected capability actually requires it — there is nothing to fix here.' }));
    }
    if (env.state === 'not-set-up') {
      insp.appendChild(h('p', { className: 'lg-note-line', text: str(env.healthNote) || 'Set up only when a capability demands it.' }));
    }
  }

  /* --------------------------------------------- actions inspectors ---- */

  function inspectWorkflow(sel) {
    var ga = D().githubActions || {};
    var w = arr(ga.pinned).filter(function (x) { return x.id === sel.id; })[0];
    if (!w) { renderInspectorSummary(); return; }
    var pass = w.readiness === 'passing';
    var run = arr(ga.runs).filter(function (r) { return r.id === (w.lastRun || {}).id; })[0];
    var insp = els.insp;
    appendChild(insp, inspHeader('Workflow record', w.name));
    insp.appendChild(h('p', null, statusWordEl(pass ? 'ok' : 'attention', pass ? 'Passing' : 'Failing')));
    insp.appendChild(block('Readiness', kv([
      ['Branch', w.branch, 'mono'],
      ['Last run', (w.lastRun || {}).result === 'success' ? 'Success' : 'Failure'],
      ['When', fmtTime((w.lastRun || {}).when)],
      !pass && (w.lastRun || {}).failedJob ? ['Failed at', (w.lastRun || {}).failedJob, 'mono'] : null
    ].filter(Boolean))));
    if (!pass && run) {
      var log = h('div', { className: 'lg-account-log', role: 'log', 'aria-label': 'Log excerpt' });
      arr(run.logExcerpt).forEach(function (line) {
        log.appendChild(h('div', { className: 'lg-account-log-line', text: line }));
      });
      insp.appendChild(block('Log excerpt', log));
    }
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button', disabled: !!ga.refreshDisabled,
        onClick: function () { window.PMState.trigger('actions-refresh'); }
      }, ico('refresh'), 'Refresh'),
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () { window.PMState.receipt('Unpin workflow', w.name + ' would leave the pinned list; the workflow itself is untouched.'); }
      }, ico('pin'), 'Unpin'),
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () { window.PMState.receipt('Open the GitHub Actions panel', 'Run browsing, retries, and dispatch live in the left-rail panel — Settings owns pinning and readiness only.'); }
      }, ico('external'), 'Open in the panel')));
    if (ga.refreshDisabled) { insp.appendChild(h('p', { className: 'lg-note-line', text: str(ga.refreshDisabled) })); }
  }

  function inspectWfRun(sel) {
    var ga = D().githubActions || {};
    var r = arr(ga.runs).filter(function (x) { return x.id === sel.id; })[0];
    if (!r) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Run record · ' + r.workflow, r.id));
    insp.appendChild(h('p', null, statusWordEl(r.result === 'success' ? 'ok' : 'attention', r.result === 'success' ? 'Success' : 'Failure')));
    var jobs = h('table', { className: 'lg-evidence' },
      h('thead', null, h('tr', null,
        h('th', { text: 'Job' }), h('th', { text: 'Result' }), h('th', { text: 'Duration' }))),
      h('tbody', null, arr(r.jobs).map(function (j) {
        return h('tr', null,
          h('td', { className: 'lg-mono', text: j.name }),
          h('td', { className: 'lg-ev-state', text: cap(j.status) }),
          h('td', { className: 'lg-ev-at', text: j.durationS + 's' }));
      })));
    insp.appendChild(block('Jobs', jobs));
    var log = h('div', { className: 'lg-account-log', role: 'log', 'aria-label': 'Log excerpt' });
    arr(r.logExcerpt).forEach(function (line) {
      log.appendChild(h('div', { className: 'lg-account-log-line', text: line }));
    });
    insp.appendChild(block('Log excerpt', log));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Full logs and retries live in the left-rail GitHub Actions panel; this record is a readiness summary.' }));
  }

  function inspectGhAccount(sel) {
    void sel;
    var capb = (D().githubActions || {}).accountCapability || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Capability record', 'Account capability'));
    insp.appendChild(block('Record', kv([
      ['Account', capb.account],
      ['Workflows', capb.actions ? 'Read and dispatch available' : 'Not available'],
      ['Note', capb.note]
    ])));
  }

  function inspectGhStarter(sel) {
    void sel;
    var offer = (D().githubActions || {}).starterOffer || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Offer record', 'Starter workflow'));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: str(offer.note) }));
    insp.appendChild(block('Record', kv([['Template', offer.template, 'mono']])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Create starter workflow', 'A ' + str(offer.template) + ' workflow file would be committed to a branch for review — never straight to main.'); }
      }, ico('plus'), 'Create from starter')));
  }

  /* ------------------------------------------- containers inspectors --- */

  function inspectContainer(sel) {
    var ct = D().containers || {};
    var r = arr(ct.resources).filter(function (x) { return x.id === sel.id; })[0];
    if (!r) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Container resource record', r.name));
    var word = r.state === 'ready' ? ['ok', 'Ready'] : (r.state === 'partial' ? ['setup', 'Partial'] : ['setup', 'Not installed']);
    insp.appendChild(h('p', null, statusWordEl(word[0], word[1])));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: str(r.summary) + ' · ' + hostName(r.hostId) }));
    var d = r.detail || {};
    if (r.id === 'ctr.docker') {
      insp.appendChild(block('Components', kv([
        ['Engine', d.engine, 'mono'],
        ['CLI', d.cli, 'mono'],
        ['Compose', d.compose, 'mono'],
        ['Buildx', d.buildx, 'mono'],
        ['Socket', d.socket, 'mono'],
        ['Socket state', cap(str(d.socketState))]
      ])));
    } else if (r.id === 'ctr.k8s') {
      insp.appendChild(block('Components', kv([
        ['kubectl', (d.kubectl || {}).state === 'ready' ? 'Ready · ' + (d.kubectl || {}).version : 'Not installed'],
        ['Helm', (d.helm || {}).state === 'ready' ? 'Ready' : 'Not installed']
      ])));
      var helmOffer = (d.helm || {}).installOffer;
      if (helmOffer) {
        insp.appendChild(h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () { window.PMState.receipt(helmOffer.label, str(helmOffer.note) + ' Installs from the official source into the exact selected host. Nothing was installed.'); }
          }, ico('download'), helmOffer.label)));
      }
    }
    if (r.installOffer) {
      insp.appendChild(block('Install',
        h('p', { className: 'lg-insp-desc', text: str(r.installOffer.note) }),
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn is-primary', type: 'button',
            onClick: function () { window.PMState.receipt(r.installOffer.label, 'Installs from the official source into the exact selected host. Nothing was installed in this demo.'); }
          }, ico('download'), r.installOffer.label))));
    }
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Container tools reuse the shared installation lifecycle; capability probes (socket reachability, context health) stay domain-specific.' }));
  }

  function inspectCluster(sel) {
    var c = arr((D().containers || {}).clusters).filter(function (x) { return x.id === sel.id; })[0];
    if (!c) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Cluster record', c.name));
    insp.appendChild(h('p', null, statusWordEl(c.state === 'reachable' ? 'ok' : 'attention', cap(str(c.state)))));
    var ctxBlock = block('Kubeconfig contexts');
    arr(c.kubeconfigContexts).forEach(function (ctx) {
      ctxBlock.appendChild(h('div', { className: 'lg-chain-layer' + (ctx.current ? ' is-active' : '') },
        h('span', { className: 'lg-chain-name lg-mono', style: 'width:14ch', text: ctx.name }),
        h('span', { className: 'lg-chain-note', text: ctx.current ? 'Current context' : '' }),
        !ctx.current ? h('button', {
          className: 'lg-btn is-quiet', type: 'button',
          onClick: function () {
            arr(c.kubeconfigContexts).forEach(function (x) { x.current = x.name === ctx.name; });
            window.PMState.receipt('Context switched', ctx.name + ' is now the current kubeconfig context for future simulated work.');
            refreshManagerRowAndInspector();
          }
        }, 'Use') : null));
    });
    insp.appendChild(ctxBlock);
  }

  function inspectRegistry(sel) {
    var r = arr((D().containers || {}).registries).filter(function (x) { return x.id === sel.id; })[0];
    if (!r) { renderInspectorSummary(); return; }
    var warn = r.state === 'cert-warning';
    var insp = els.insp;
    appendChild(insp, inspHeader('Registry record', r.url));
    insp.appendChild(h('p', null, statusWordEl(warn ? 'attention' : 'ok', warn ? 'Certificate warning' : 'Ready')));
    insp.appendChild(block('Record', kv([
      ['Registry', r.url, 'mono'],
      r.auth ? ['Authentication', r.auth] : null
    ].filter(Boolean))));
    if (warn) {
      insp.appendChild(block('Trust guidance',
        h('div', { className: 'lg-unavail-note' }, ico('certificate'),
          h('span', null, str(r.authNote))),
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () { window.PMState.receipt('Add CA to trust store', 'The registry’s CA would be added to the PM trust store after showing you its fingerprint.'); }
          }, ico('certificate'), 'Add the CA'),
          h('button', {
            className: 'lg-btn is-quiet', type: 'button',
            onClick: function () { window.PMState.receipt('Trust for LAN only', 'The registry would be trusted for this LAN only, and the decision recorded with a receipt.'); }
          }, 'Trust for this LAN only'))));
    }
  }

  function inspectUnraid(sel) {
    void sel;
    var un = (D().containers || {}).unraidPublishing || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Publishing record', str(un.server) || 'Unraid'));
    insp.appendChild(h('p', null, statusWordEl(un.state === 'connected' ? 'ok' : 'setup', cap(str(un.state || 'not connected')))));
    insp.appendChild(block('Record', kv([
      ['Templates published', String(un.templates || 0)],
      ['Note', un.note]
    ])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Open template feed', 'The community template feed opens in the finished product.'); }
      }, ico('external'), 'Open the template feed')));
  }

  /* ------------------------------------------------- web inspectors ---- */

  function inspectWebProvider(sel) {
    var web = D().webResearch || {};
    var w = arr(web.providers).filter(function (x) { return x.id === sel.id; })[0];
    if (!w) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Web provider record · ' + (WEB_KIND_LABELS[w.kind] || cap(str(w.kind))), w.name));
    var word;
    if (w.state === 'ready') { word = w.guard && w.guard.state === 'warning' ? ['attention', 'Credit warning'] : ['ok', 'Ready']; }
    else if (w.state === 'needs-setup') { word = ['setup', 'Needs setup']; }
    else { word = ['attention', w.guard && w.guard.state === 'stop' ? 'Paused by guard' : 'Unavailable']; }
    insp.appendChild(h('p', null, statusWordEl(word[0], word[1]), w.builtIn ? chipEl('default', 'Built in') : null));
    if (w.stateNote) { insp.appendChild(h('p', { className: 'lg-insp-desc', text: w.stateNote })); }
    if (w.setupNote) { insp.appendChild(h('p', { className: 'lg-insp-desc', text: w.setupNote })); }

    if (w.credits) {
      var pct = Math.min(100, Math.round((w.credits.used / Math.max(1, w.credits.total)) * 100));
      var credBlock = block('Credits', kv([
        ['Used', w.credits.used + ' of ' + w.credits.total + ' ' + w.credits.unit + ' (' + pct + '%)']
      ]));
      /* Real denominator: expose the actual units, not a bare percentage. */
      credBlock.appendChild(h('div', {
        className: 'lg-progress', role: 'progressbar',
        'aria-valuenow': String(w.credits.used), 'aria-valuemin': '0',
        'aria-valuemax': String(w.credits.total),
        'aria-valuetext': w.credits.used + ' of ' + w.credits.total + ' ' + w.credits.unit + ' (measured)'
      }, h('span', { className: 'lg-progress-fill' + (pct >= 80 ? ' is-warn' : ''), style: 'width:' + pct + '%' })));
      insp.appendChild(credBlock);
    }
    if (w.guard) {
      insp.appendChild(block('Credit guard', kv([
        ['Warn at', w.guard.warnAtPct + '%'],
        ['Stop at', w.guard.stopAtPct + '%'],
        ['State', w.guard.state === 'ok' ? 'Quiet' : cap(str(w.guard.state))],
        w.guard.note ? ['Note', w.guard.note] : null
      ].filter(Boolean)),
        h('p', { className: 'lg-note-line', text: 'The guard stops spending before a surprise bill. Fetch keeps working when crawls pause.' })));
    }
    var prioWrap = block('Priority');
    var prioSel = h('select', { className: 'lg-select', style: 'width:auto', 'aria-label': 'Priority for ' + w.name });
    for (var i = 1; i <= arr(web.providers).length; i++) {
      var opt = h('option', { value: String(i), text: 'Priority ' + i });
      if (w.priority === i) { opt.selected = true; }
      prioSel.appendChild(opt);
    }
    prioSel.addEventListener('change', function () {
      w.priority = parseInt(prioSel.value, 10);
      window.PMState.receipt('Provider priority', w.name + ' moves to priority ' + w.priority + ' for its kind.');
      refreshManagerRowAndInspector();
    });
    prioWrap.appendChild(prioSel);
    insp.appendChild(prioWrap);
    if (w.state === 'needs-setup') {
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn is-primary', type: 'button',
          onClick: function () { window.PMState.receipt('Add API key reference', 'The key is stored as a vault reference and validated with a safe probe. Never shown in the interface.'); }
        }, ico('key'), 'Add API key reference')));
    }
  }

  function inspectWebLimits(sel) {
    void sel;
    var lim = (D().webResearch || {}).limits || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Limits record', 'Crawl, map & extract limits'));
    insp.appendChild(block('Record', kv([
      ['Crawl depth', String(lim.crawlDepth)],
      ['Map', lim.mapMaxPages + ' pages'],
      ['Extract', lim.extractMaxPages + ' pages'],
      ['Largest fetch', lim.fetchMaxMB + ' MB — an ordinary setting record']
    ])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () { revealSetting('extensions.web.fetch-size-limit'); }
      }, 'Open the fetch size setting')));
  }

  function inspectWebCache(sel) {
    void sel;
    var caches = (D().webResearch || {}).caches || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Cache record', 'Fetch & crawl cache'));
    insp.appendChild(block('Record', kv([
      ['Size', fmtMB(caches.sizeMB)],
      ['Time to live', caches.ttlHours + ' hours'],
      ['Last cleared', fmtTime(caches.lastCleared)]
    ])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button', disabled: !caches.sizeMB,
        onClick: function () {
          caches.sizeMB = 0;
          caches.lastCleared = new Date().toISOString();
          window.PMState.receipt('Cache cleared', 'The fetch and crawl cache was emptied. Fresh requests will refill it.');
          refreshManagerRowAndInspector();
        }
      }, ico('broom'), 'Clear cache')));
  }

  function inspectBrowserSession(sel) {
    var bs = (D().webResearch || {}).browserSessions || {};
    var insp = els.insp;
    if (sel.id === 'auth') {
      var auth = bs.authSession || {};
      appendChild(insp, inspHeader('Protected session record', 'Protected sign-in session'));
      insp.appendChild(block('Human-only',
        h('div', { className: 'lg-managed-note' }, ico('lock'),
          h('span', null, str(auth.note) + ' Puppet Master agents cannot view or record this sign-in window.'))));
      insp.appendChild(h('p', { className: 'lg-note-line', text: 'By design there is no recording toggle, no agent takeover, and no inspection surface for this session class.' }));
      return;
    }
    var isExpert = sel.id === 'expert';
    appendChild(insp, inspHeader('Browser program record', isExpert ? str(bs.expert) || 'Expert Browser Program' : str(bs.program) || 'PM Browser Program'));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: isExpert
      ? 'Eligible agents receive advanced ordinary-browser capabilities automatically under permissions and sandbox policy. There is no master "enable expert tools" switch to leave on by mistake.'
      : 'The ordinary agent browser environment: page loads, reading, and interaction under the permission rules.' }));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Safety and policy controls for browser side effects, recording, retention, and domains live under Permissions.' }));
  }

  function inspectWebNetwork(sel) {
    var web = D().webResearch || {};
    var insp = els.insp;
    if (sel.id === 'proxy') {
      appendChild(insp, inspHeader('Network record', 'Proxy'));
      insp.appendChild(block('Record', kv([['Mode', web.proxy === 'system' ? 'System proxy settings' : cap(str(web.proxy))]])));
      return;
    }
    appendChild(insp, inspHeader('Network record', 'Air-gap behavior'));
    insp.appendChild(h('p', null, statusWordEl(web.airgap === 'detected' ? 'attention' : 'muted',
      web.airgap === 'detected' ? 'Detected' : 'Off')));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: web.airgap === 'detected'
      ? 'No network route is available. Web providers report honest unavailability; local models and repositories keep working.'
      : 'Normal networking. If the network disappears, web routes degrade honestly instead of hanging.' }));
  }

  function inspectWebCert(sel) {
    var c = arr((D().webResearch || {}).certificates).filter(function (x) { return x.id === sel.id; })[0];
    if (!c) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Certificate record', c.name));
    insp.appendChild(block('Record', kv([
      ['Kind', 'Custom certificate authority'],
      ['Added', c.added]
    ])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () { window.PMState.receipt('Remove CA', 'Removal warns about the LAN registry and any routes that rely on this CA first.'); }
      }, ico('trash'), 'Remove…')));
  }

  /* ------------------------------------------ search index inspectors -- */

  function inspectIndexStatus(sel) {
    void sel;
    var ix = D().searchIndex || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Index record', 'Project index'));
    var phase = str(ix.phase);
    var word = !ix.enabled || phase === 'disabled' ? ['muted', 'Disabled']
      : (phase === 'ready' ? ['ok', 'Ready'] : (phase === 'failed' ? ['attention', 'Failed'] : ['setup', cap(phase)]));
    insp.appendChild(h('p', null, statusWordEl(word[0], word[1])));
    var strip = phaseStrip('index-rebuild', null);
    if (strip) { insp.appendChild(strip); }
    insp.appendChild(block('Control',
      h('button', {
        className: 'lg-toggle', type: 'button', role: 'switch',
        'aria-checked': ix.enabled ? 'true' : 'false',
        onClick: function () {
          ix.enabled = !ix.enabled;
          ix.phase = ix.enabled ? (ix.lastBuild ? 'ready' : 'disabled') : 'disabled';
          window.PMState.receipt(ix.enabled ? 'Indexing enabled' : 'Indexing disabled',
            ix.enabled ? 'Run a rebuild to create the first index.' : 'Search falls back to slower on-demand scans.');
          refreshManagerRowAndInspector();
        }
      },
        h('span', { className: 'lg-toggle-track' }, h('span', { className: 'lg-toggle-knob' })),
        h('span', { className: 'lg-toggle-word', text: ix.enabled ? 'On' : 'Off' }))));
    if (ix.enabled) {
      insp.appendChild(block('Record', kv([
        ['Last build', fmtTime(ix.lastBuild)],
        ['Files', (ix.files || 0).toLocaleString()],
        ['On disk', fmtMB(ix.diskMB || 0)],
        arr(ix.failures).length ? ['Failures', arr(ix.failures).length + ' paths — listed in the Failures section'] : null
      ].filter(Boolean))));
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn' + (phase === 'failed' ? ' is-primary' : ''), type: 'button',
          onClick: function () { window.PMState.trigger('index-rebuild'); }
        }, ico('refresh'), 'Rebuild the index')));
      if (phase === 'failed') {
        insp.appendChild(h('p', { className: 'lg-note-line', text: 'Search still works from the last good index while failures stand.' }));
      }
    }
  }

  function inspectIndexPolicy(sel) {
    var ix = D().searchIndex || {};
    var insp = els.insp;
    if (sel.id === 'exclusions') {
      appendChild(insp, inspHeader('Policy record', 'Exclusions'));
      var wrap = h('div', { className: 'lg-list-editor' });
      arr(ix.exclusions).forEach(function (x) { wrap.appendChild(h('div', { className: 'lg-list-item lg-mono', text: x })); });
      insp.appendChild(block('Excluded patterns', wrap,
        h('div', { className: 'lg-insp-actions' },
          h('button', {
            className: 'lg-btn', type: 'button',
            onClick: function () { window.PMState.receipt('Edit exclusions', 'The pattern editor validates each glob and shows what it would exclude before saving.'); }
          }, ico('edit'), 'Edit patterns'))));
      return;
    }
    if (sel.id === 'remote-cache') {
      var rc = ix.remoteCache || {};
      appendChild(insp, inspHeader('Policy record', 'Remote cache'));
      insp.appendChild(block('Record', kv([
        ['State', cap(str(rc.state || 'off'))],
        rc.hostId ? ['Shared on', hostName(rc.hostId)] : null
      ].filter(Boolean))));
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () { window.PMState.receipt('Clear remote cache', 'The shared index cache on ' + hostName(rc.hostId) + ' would be cleared; local indexes are unaffected.'); }
        }, ico('broom'), 'Clear remote cache')));
      return;
    }
    var meta = {
      'large-file': ['Large-file limit', 'Files above ' + ((ix.largeFilePolicy || {}).maxMB || 8) + ' MB are skipped and reported under Failures instead of silently indexed.'],
      'symlinks': ['Symbolic links', 'Symlinks are skipped. Loops are detected and reported — never followed into infinity.']
    }[sel.id] || ['Policy record', ''];
    appendChild(insp, inspHeader('Policy record', meta[0]));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: meta[1] }));
  }

  function inspectIndexFailure(sel) {
    var f = arr((D().searchIndex || {}).failures)[parseInt(sel.id, 10)];
    if (!f) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Failure record', f.path));
    insp.appendChild(h('p', null, statusWordEl('attention', 'Skipped')));
    insp.appendChild(block('Why', kv([
      ['Path', f.path, 'mono'],
      ['Reason', f.reason]
    ])));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'A skipped path never blocks the rest of the index. Fix the cause and rebuild, or exclude the path.' }));
  }

  /* ----------------------------------------------- cleanup inspectors -- */

  function inspectCleanupCat(sel) {
    var c = arr((D().cleanup || {}).categories).filter(function (x) { return x.id === sel.id; })[0];
    if (!c) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Cleanup category record', c.label));
    insp.appendChild(block('Record', kv([
      ['Items', String(c.count)],
      ['Reclaimable', fmtMB(c.sizeMB)],
      c.safety ? ['Safety', c.safety] : null
    ].filter(Boolean))));
    if (c.safety) {
      insp.appendChild(block('Protected',
        h('div', { className: 'lg-managed-note' }, ico('lock'),
          h('span', null, 'Leased items are never touched by cleanup — the lease is a hard boundary, not a suggestion.'))));
    }
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'Run a dry run to see the exact items before anything is deleted.' }));
  }

  function inspectDryRunRecord(sel) {
    void sel;
    var dry = ((D().cleanup || {}).dryRun || {}).last || null;
    if (!dry) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Dry run record', 'Last dry run'));
    insp.appendChild(block('Record', kv([
      ['When', fmtTime(dry.when)],
      ['Would free', fmtMB(dry.wouldFreeMB)],
      ['Receipt', dry.receiptId, 'mono']
    ])));
    var skipped = arr(dry.skipped);
    if (skipped.length > 0) {
      var log = h('div', { className: 'lg-cat-log' });
      skipped.forEach(function (s) {
        log.appendChild(h('div', { className: 'lg-cat-log-item' }, ico('lock'),
          h('div', { className: 'lg-cat-log-main' },
            h('div', { className: 'lg-mono', text: s.ref }),
            h('div', { className: 'lg-cat-log-effect', text: s.reason }))));
      });
      insp.appendChild(block('Skipped', log));
    }
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'A dry run only reports — nothing was deleted, and nothing ever is until Apply is confirmed.' }));
  }

  /* ------------------------------------------------ server inspectors -- */

  function inspectServerCard(sel) {
    void sel;
    var card = (D().serverModules || {}).connectedServerCard || {};
    var insp = els.insp;
    appendChild(insp, inspHeader('Server record', str(card.name) || 'Home TrueNAS'));
    insp.appendChild(h('p', null, statusWordEl(card.state === 'connected' ? 'ok' : 'attention', cap(str(card.state || 'offline')))));
    insp.appendChild(block('Record', kv([
      ['Processing on this server', card.processing === 'on' ? 'On' : 'Off'],
      ['Clients', (card.clients || 0) + ' paired']
    ])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Change Server', 'Server selection is owned by the Server Backbone module; the flow opens there in the finished product.'); }
      }, 'Change Server'),
      h('button', {
        className: 'lg-btn', type: 'button',
        onClick: function () { window.PMState.receipt('Add Server', 'Claim and bootstrap are owned by the Server Backbone module.'); }
      }, ico('plus'), 'Add Server')));
  }

  function inspectProjectCard(sel) {
    var proj = (D().serverTopology || {}).project || {};
    var meta = {
      'hosted-on': ['Hosted On', proj.hostedOn, 'Where the canonical project lives. Moving it is a transactional flow owned by the Project Sync owner.'],
      'files': ['Project Files', proj.files, 'The canonical file location on the hosting server.'],
      'run-work': ['Run Work', proj.runWork, 'Where execution lands by default. Automatic prefers the Home Server when capability-compatible.']
    }[sel.id] || ['Project record', '', ''];
    var insp = els.insp;
    appendChild(insp, inspHeader('Project record', meta[0]));
    insp.appendChild(block('Record', kv([[meta[0], meta[1], sel.id === 'files' ? 'mono' : undefined]])));
    insp.appendChild(h('p', { className: 'lg-insp-desc', text: meta[2] }));
    if (sel.id === 'hosted-on' || sel.id === 'files') {
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () { window.PMState.receipt(sel.id === 'files' ? 'Change Project Files' : 'Move Project', 'This transactional flow is owned by storage-plan.md (Project Sync) and is deliberately not invented in this bakeoff.'); }
        }, sel.id === 'files' ? 'Change Project Files' : 'Move Project')));
    }
  }

  function inspectHostRec(sel) {
    var host = arr((D().serverTopology || {}).hosts).filter(function (x) { return x.id === sel.id; })[0];
    if (!host) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Host record', host.name));
    insp.appendChild(h('p', null, statusWordEl(host.state === 'connected' || host.state === 'reachable' ? 'ok' : 'attention', cap(str(host.state)))));
    insp.appendChild(block('Record', kv([
      ['Kind', cap(str(host.kind))],
      ['Roles', arr(host.role).map(function (r) { return cap(r.replace(/-/g, ' ')); }).join(', ')],
      ['Default execution host', host.isDefaultExecutionHost ? 'Yes — the Home Server runs work when compatible' : 'No'],
      ['Environments', String(arr(host.environments).length)]
    ])));
  }

  function inspectClientRec(sel) {
    var c = arr((D().serverTopology || {}).clients).filter(function (x) { return x.id === sel.id; })[0];
    if (!c) { renderInspectorSummary(); return; }
    var insp = els.insp;
    appendChild(insp, inspHeader('Client record', c.name));
    insp.appendChild(block('Record', kv([
      ['Platform', c.platform],
      ['Last seen', fmtTime(c.lastSeen)]
    ])));
    insp.appendChild(h('div', { className: 'lg-insp-actions' },
      h('button', {
        className: 'lg-btn is-quiet', type: 'button',
        onClick: function () { window.PMState.receipt('Revoke pairing', c.name + ' would be unpaired after confirmation. Its local data stays on the device.'); }
      }, 'Revoke pairing…')));
  }

  function inspectServerModule(sel) {
    var m = arr((D().serverModules || {}).reserved).filter(function (x) { return x.id === sel.id; })[0];
    if (!m) { renderInspectorSummary(); return; }
    var partial = m.state === 'partial';
    var insp = els.insp;
    appendChild(insp, inspHeader('Reserved destination', m.label));
    insp.appendChild(h('p', null, chipEl(partial ? 'auto' : 'not-configured', partial ? 'Partly live here' : 'Reserved')));
    insp.appendChild(block('Ownership', kv([
      ['Coming from', m.namedOwner],
      ['Insertion contract', m.insertionContract]
    ])));
    insp.appendChild(h('p', { className: 'lg-note-line', text: 'This destination is reserved so the winning Settings framework can accept the module later. Its backend state machine belongs to the named owner and is deliberately not invented here.' }));
    if (m.id === 'mod.backup-restore') {
      insp.appendChild(h('div', { className: 'lg-insp-actions' },
        h('button', {
          className: 'lg-btn', type: 'button',
          onClick: function () { openManager('backup'); }
        }, ico('database'), 'Open Backup & Restore (live part)')));
    }
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
        (mid === 'providers' && (managerHits.roles || managerHits.freeRoutes));
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
      /* Non-native managers render as honest cross-page receipts — a real
         anchor to the concept that proves them, never a rebuilt surface. */
      if (r.kind === 'manager-receipt') {
        var cov = r.coveredIn || COVERED_IN[r.id] || {};
        var mark = (str(cov.concept).match(/^c\d/) || ['ref'])[0];
        list.appendChild(h('a', {
          className: 'lg-else-item is-receipt', role: 'listitem',
          href: str(cov.page) ? cov.page + '#/manager/' + r.id : '#'
        },
          h('span', { className: 'lg-else-kind', text: mark }),
          h('span', { className: 'lg-else-label', text: r.label }),
          h('span', { className: 'lg-else-exp', text: 'Covered in ' + (cov.label || 'a sibling concept') })
        ));
        return;
      }
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
    if (r.kind === 'manager' || r.kind === 'manager-receipt') { routeManager(r.id.replace('manager.', ''), r.label); return; }
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
      opsLive = {};
      renderAll();
    });
    store.on('receipt', function (r) {
      try { window.PMShell.toast(r.message); } catch (e) { /* ignore */ }
    });
    store.on('provider', function () { onLiveDataChange(); });
    store.on('catalog', function () { onLiveDataChange(); });

    /* Truthful operation phases: states appear the instant they change.
       Zero-motion identity — a phase strip is content, never animation. */
    var OP_VIEW = {
      'import-preview': 'lifecycle', 'import-cancel': 'lifecycle',
      'import-apply': 'lifecycle', 'import-rollback': 'lifecycle',
      'backup-now': 'backup', 'test-restore': 'backup',
      'index-rebuild': 'searchIndex', 'cleanup-dry-run': 'cleanup',
      'actions-refresh': 'actions',
      'install-update': 'providers', 'install-update-fail': 'providers',
      'install-repair': 'providers', 'install-select': 'providers', 'install-scan': 'providers'
    };
    store.on('op', function (payload) {
      if (!payload || !payload.name) { return; }
      opsLive[opKey(payload.name, payload.ref)] = payload;
      var viewId = OP_VIEW[payload.name];
      if (viewId && ui.view.kind === 'manager' && ui.view.id === viewId) {
        redrawDocPreservingScroll();
      }
      if (ui.selected && (ui.selected.kind === 'installation' || ui.selected.kind === 'importState' ||
        ui.selected.kind === 'backupAction' || ui.selected.kind === 'indexStatus' || ui.selected.kind === 'testRestore')) {
        renderInspector();
      }
    });

    /* Data-change events from the trigger registry → live redraws. */
    var EVT_VIEW = {
      lifecycle: 'lifecycle', backup: 'backup', searchIndex: 'searchIndex',
      cleanup: 'cleanup', actions: 'actions'
    };
    Object.keys(EVT_VIEW).forEach(function (evt) {
      store.on(evt, function () {
        if (ui.view.kind === 'manager' && ui.view.id === EVT_VIEW[evt]) { redrawDocPreservingScroll(); }
      });
    });
    store.on('change', function (p) {
      if (p && p.key === 'installations') {
        onLiveDataChange();
        if (ui.selected && ui.selected.kind === 'installation') { renderInspector(); }
      }
    });
    store.on('notices', function () {
      if (ui.view.kind === 'home') { redrawDocPreservingScroll(); }
    });
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

  /* ==================================================== router ========= */

  function openManagerRoute(managerId) {
    var mid = str(managerId);
    if (mid === 'manager.roles') { revealManagerRecord('providers', 'prov-roles', null); return; }
    if (mid === 'manager.freeRoutes') { revealManagerRecord('providers', 'prov-routes', null); return; }
    var shortId = mid.replace('manager.', '');
    if (NATIVE_VIEWS[shortId]) {
      if (!(ui.view.kind === 'manager' && ui.view.id === shortId)) { setView({ kind: 'manager', id: shortId }); }
      return;
    }
    openCovered(mid, null);
  }

  /* PMState.bindRouter entry point. The router applies scenario/fixtures
     first, then calls this with the route; triggers run afterward. */
  function openRoute(route, dl) {
    applyingRoute = true;
    try {
      route = route || { kind: 'home' };
      if (route.kind === 'dest') {
        var dom = domainById(str(route.domainId));
        if (dom) {
          if (!(ui.view.kind === 'domain' && ui.view.id === dom.id)) { setView({ kind: 'domain', id: dom.id }); }
          if (route.subId) { jumpToSection('lgsec-' + route.subId); }
        } else if (ui.view.kind !== 'home') { setView({ kind: 'home' }); }
      } else if (route.kind === 'manager') {
        openManagerRoute(route.managerId);
      } else if (route.kind === 'setting') {
        revealSetting(str(route.settingId));
      } else if (route.kind === 'search') {
        /* Search deep link: fill the query bar and execute. */
        els.query.value = str(route.query);
        ui.query = els.query.value;
        updateFilter();
        try { els.query.focus(); } catch (e) { /* focus optional */ }
      } else if (ui.view.kind !== 'home') {
        setView({ kind: 'home' });
      }
      if (dl && dl.focus) { revealSetting(str(dl.focus)); }
    } finally {
      applyingRoute = false;
    }
  }

  /* Persisted view validation: the final packet moved Context, Tools, and
     Commands to sibling concepts — a stale persisted view naming them (or
     anything unknown) falls back to home instead of a broken surface. */
  function validatedView() {
    var v = store.get('view');
    if (v && v.kind === 'domain' && domainById(v.id)) { return { kind: 'domain', id: v.id }; }
    if (v && v.kind === 'manager' && managerById(v.id)) { return { kind: 'manager', id: v.id }; }
    return { kind: 'home' };
  }

  /* ==================================================== boot =========== */
  /* Contract rev 2 order: PMShell.init -> PMState.init -> build -> bindRouter. */

  window.PMShell.init({
    concept: 'c4-ledger',
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

  store = window.PMState.init('c4-ledger');

  /* Manager manifest: native families here, everything else covered in a
     named sibling concept. Search renders non-native managers as honest
     cross-page receipts through this registration. */
  window.PMState.registerManagers({
    conceptId: 'c4-ledger',
    native: [
      'manager.providers', 'manager.roles', 'manager.freeRoutes',
      'manager.storage', 'manager.backup', 'manager.lifecycle',
      'manager.history', 'manager.artifacts', 'manager.sourceControl',
      'manager.actions', 'manager.containers', 'manager.web',
      'manager.searchIndex', 'manager.cleanup', 'manager.servers'
    ],
    coveredIn: COVERED_IN
  });

  window.PMState.mountStatesDrawer(store);

  buildIndex();
  wire();
  ui.view = validatedView();
  renderAll();
  updateStatusbar();

  /* Router last: applies any deep link (scenario -> fixtures -> route ->
     focus -> triggers), then stamps data-pm-state="ready". Back/forward
     re-enter through openRoute; withInstantMotion keeps every jump instant. */
  window.PMState.bindRouter({ open: openRoute });
})();
