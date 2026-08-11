/* ====================================================================
   fable · Mission Control — c2 concept controller
   Thesis: operational console; system state organizes everything.
   - Persistent global health strip on Home, Workspace, every console.
   - Home: triage stack (ranked) above rectangular station cards.
   - Workspace: right-edge minimap is PRIMARY nav (PMSpy state drives
     proportional blocks + draggable viewport window); left station
     rail is secondary. Managers are primary surfaces; plain settings
     hang off them as "Configure" drawers.
   - Consoles: Providers/Models + Crew + Media as inventory/inspector.
   Motion "Instrumental": quick state-driven morphs; refresh shimmer
   only on the refreshing region; calm state is fully static.
   Slint notes inline. No emoji anywhere.
   ==================================================================== */
(function () {
  'use strict';

  /* double-load guard: the page carries a content-blocker fallback that
     re-fetches this file if the original request was cancelled */
  if (window.C2_BOOTED) { return; }
  window.C2_BOOTED = true;

  var store = null;
  var spy = null;
  var els = {};            // stable stage elements
  var subIndex = {};       // settingId -> {domainId, subId, domainTitle, subTitle}
  var expanders = {};      // (domainId+'/'+subId) -> {configure, advanced, expert, diagnostic}
  var expertUnlocked = {}; // subKey -> true after caution confirm
  var healthPrev = {};     // previous health strip text (drives morph-on-change only)
  var openMenu = null;     // currently open effort/speed or connect menu

  var view = {
    name: 'home',          // 'home' | 'workspace' | 'manager'
    domainId: null,
    managerId: null,
    sel: { providers: 'claude', crew: null, media: null },
    freeSetup: null,       // {routeId, done:[...]} stepped free-route setup
    filter: ''
  };

  /* ---------------- small DOM helpers ---------------- */

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text != null) { node.textContent = text; }
    return node;
  }

  function btn(className, label, onClick) {
    var node = el('button', className);
    node.type = 'button';
    if (label != null) { node.textContent = label; }
    if (onClick) { node.addEventListener('click', onClick); }
    return node;
  }

  function ico(name, cls) {
    var i = document.createElement('i');
    i.setAttribute('data-ico', name);
    if (cls) { i.className = cls; }
    i.setAttribute('aria-hidden', 'true');
    try { i.innerHTML = window.PMIcons.get(name); } catch (e) { /* decorative */ }
    return i;
  }

  function frag() {
    var f = document.createDocumentFragment();
    for (var i = 0; i < arguments.length; i++) { if (arguments[i]) { f.appendChild(arguments[i]); } }
    return f;
  }

  function clear(node) { while (node.firstChild) { node.removeChild(node.firstChild); } }

  function esc(sel) {
    if (window.CSS && CSS.escape) { return CSS.escape(sel); }
    return String(sel).replace(/["\\]/g, '\\$&');
  }

  function arr(x) { return Array.isArray(x) ? x : []; }

  /* Copy sanitizer: the shared demo data (read-only for concepts) carries
     one sentence using the banned "YOLO" access-mode name. Access modes
     are Full Access / Auto / Auto accept edits / Ask for approval, so
     rewrite it at render time. Recorded as a data defect in FINDINGS. */
  function sanitizeCopy(text) {
    if (typeof text !== 'string') { return text; }
    return text
      .replace(/YOLO mode cannot skip this\.?/g, 'No access mode can skip this.')
      .replace(/\bYOLO\b/g, 'Full Access');
  }

  function motionReduced() {
    var html = document.documentElement;
    if (html.getAttribute('data-motion') === 'reduced') { return true; }
    if (html.getAttribute('data-reduced-motion') === '1') { return true; }
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return true; }
    } catch (e) { /* ignore */ }
    return false;
  }

  function fmtWhen(iso) {
    if (!iso) { return 'No scheduled reset'; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return String(iso); }
    var now = new Date();
    var sameDay = d.toDateString() === now.toDateString();
    if (sameDay) { return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' +
      d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  /* ---------------- humanized vocabulary (no raw enums in copy) ----- */

  var PROVIDER_STATUS = {
    'ready': { word: 'Ready', ico: 'checkCircle', tone: 'ok' },
    'degraded': { word: 'Degraded', ico: 'warning', tone: 'attention' },
    'not-installed': { word: 'Not installed', ico: 'download', tone: 'muted' },
    'signed-out': { word: 'Signed out', ico: 'user', tone: 'setup' },
    'auth-no-invoke': { word: 'Signed in, not ready', ico: 'warning', tone: 'attention' },
    'refreshing': { word: 'Refreshing', ico: 'refresh', tone: 'setup' }
  };

  var GROUP_TITLES = {
    tool: 'Installed tools & signed-in apps',
    account: 'Connected accounts',
    api: 'API connections',
    server: 'Server connections',
    free: 'Free & community'
  };

  var AUTH_OWNER = {
    'cli-profile': 'Sign-in owned by the CLI',
    'pm-direct-oauth': 'PM-direct sign-in',
    'api-key': 'API key',
    'server': 'Server credentials',
    'none': 'No credentials'
  };

  var ISOLATION = {
    'native-profile': 'Native named profile',
    'cli-home': 'Isolated CLI home',
    'auth-isolated': 'Auth-isolated profile',
    'pm-managed': 'PM-managed sign-in',
    'credential-pool': 'API credential pool',
    'single-login': 'Single active login'
  };

  var HEALTH_WORD = {
    'ok': { word: 'Ready', tone: 'ok' },
    'ready': { word: 'Ready', tone: 'ok' },
    'signed-out': { word: 'Signed out', tone: 'attention' },
    'auth-no-invoke': { word: 'Signed in, cannot run models', tone: 'attention' },
    'usage-exhausted': { word: 'Included usage exhausted', tone: 'attention' },
    'degraded': { word: 'Degraded', tone: 'attention' },
    'refreshing': { word: 'Refreshing', tone: 'muted' },
    'not-installed': { word: 'Not installed', tone: 'muted' },
    'error': { word: 'Failing', tone: 'attention' },
    'unknown': { word: 'Unknown', tone: 'muted' }
  };

  var PRESSURE_WORD = {
    exhausted: 'Exhausted', high: 'High', elevated: 'Elevated',
    low: 'Low', none: 'None', unknown: 'Unknown'
  };

  var WHAT_NEXT = {
    'stop-wait': 'Stop and wait for the reset',
    'extra-balance': 'Use the extra balance',
    'paid-after-plan': 'Continue at paid rates after the plan',
    'saved-reset': 'Pause and resume automatically at the reset',
    'switch-account': 'Switch to another enabled account',
    'free-models': 'Fall back to free models',
    'api-billing': 'Route to API billing',
    'ask': 'Ask me each time'
  };

  var QUALIFIER = {
    'rate-limited': 'Rate limited',
    'promotional': 'Promotional',
    'account-required': 'Account required',
    'keyless': 'Keyless',
    'data-sharing': 'Shares data',
    'subscription-included': 'Included with subscription',
    'temporarily-unavailable': 'Temporarily unavailable'
  };

  var EVIDENCE_STATE = {
    'supported': 'Supported',
    'unsupported': 'Not supported',
    'likely': 'Likely',
    'unverified': 'Unverified',
    'temporarily-unavailable': 'Temporarily unavailable',
    'via-transformation': 'Via PM transformation',
    'via-other-route': 'Via another configured route'
  };

  var MEDIA_PURPOSE = {
    'image-gen': 'Image generation',
    'vision': 'Vision & screenshots',
    'audio-in': 'Audio input',
    'audio-out': 'Audio output',
    'video': 'Video generation'
  };

  var CONSOLES = {
    providers: {
      ico: 'server', title: 'Providers & Models',
      purpose: 'Every provider, account, connection, and model route on one operational surface.'
    },
    crew: {
      ico: 'users', title: 'Crew',
      purpose: 'Crew templates: composition, concurrency, guards, and isolation.'
    },
    media: {
      ico: 'film', title: 'Media routes',
      purpose: 'Where images, vision, audio, and video actually run.'
    }
  };

  /* which subcategories carry a console station (inverted relation:
     the console is primary; plain settings hang off it) */
  var SUB_CONSOLE = {
    'agents.accounts': 'providers',
    'collaboration.helpers': 'crew',
    'media.capabilities': 'media'
  };

  var MANAGER_ROUTE = {
    'manager.providers': { console: 'providers' },
    'manager.roles': { console: 'providers' },
    'manager.freeRoutes': { console: 'providers' },
    'manager.crew': { console: 'crew' },
    'manager.media': { console: 'media' },
    'manager.personas': { domain: 'agents' },
    'manager.memory': { domain: 'context' },
    'manager.contextSources': { domain: 'context' },
    'manager.mcp': { domain: 'extensions' },
    'manager.lsp': {
      domain: 'code',
      label: 'Language servers',
      crossConcept: 'The full Language servers console is built in the Atlas concept (Appendix D - Language servers). Mission Control routes you to its home station instead.'
    },
    'manager.skills': { domain: 'extensions' },
    'manager.plugins': { domain: 'extensions' },
    'manager.tools': { domain: 'extensions' },
    'manager.terminalProfiles': { domain: 'system' },
    'manager.dictionary': { domain: 'general' },
    'manager.commands': {
      domain: 'extensions',
      label: 'Commands & shortcuts',
      crossConcept: 'The full Commands & shortcuts console is built in the Ledger concept (c4). Mission Control routes you to its home station instead.'
    }
  };

  /* ---------------- data lookups ---------------- */

  function data() { return store.data || {}; }

  function domainById(id) {
    var t = arr(data().taxonomy);
    for (var i = 0; i < t.length; i++) { if (t[i].id === id) { return t[i]; } }
    return null;
  }

  function rebuildSubIndex() {
    subIndex = {};
    arr(data().taxonomy).forEach(function (dom) {
      arr(dom.subs).forEach(function (sub) {
        arr(sub.settingIds).forEach(function (sid) {
          subIndex[sid] = { domainId: dom.id, subId: sub.id, domainTitle: dom.title, subTitle: sub.title };
        });
      });
    });
  }

  function providerById(id) {
    var list = arr(data().providers);
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { return list[i]; } }
    return null;
  }

  function secId(domainId, sub) { return 'c2sec-' + domainId + '-' + sub; }

  /* ---------------- persistence ---------------- */

  function persistView() {
    store.set('c2.view', { name: view.name, domainId: view.domainId, managerId: view.managerId, sel: view.sel });
  }

  function restoreView() {
    var saved = store.get('c2.view');
    if (!saved || typeof saved !== 'object') { return; }
    if (saved.sel && typeof saved.sel === 'object') {
      view.sel.providers = saved.sel.providers || view.sel.providers;
      view.sel.crew = saved.sel.crew || null;
      view.sel.media = saved.sel.media || null;
    }
    if (saved.name === 'workspace' && domainById(saved.domainId)) {
      view.name = 'workspace'; view.domainId = saved.domainId;
    } else if (saved.name === 'manager' && CONSOLES[saved.managerId]) {
      view.name = 'manager'; view.managerId = saved.managerId;
    }
  }

  /* ---------------- health summaries ---------------- */

  function providersSummary() {
    var ready = 0, attention = 0, other = 0, total = 0;
    arr(data().providers).forEach(function (p) {
      total++;
      if (p.status === 'ready') { ready++; }
      else if (p.status === 'degraded' || p.status === 'signed-out' || p.status === 'auth-no-invoke') { attention++; }
      else { other++; }
    });
    return { ready: ready, attention: attention, other: other, total: total };
  }

  function worstPressure() {
    var rank = { exhausted: 4, high: 3, elevated: 2, unknown: 1, low: 0, none: 0 };
    var worst = null;
    arr(data().providers).forEach(function (p) {
      arr(p.accounts).forEach(function (a) {
        var pr = a.usage && a.usage.pressure ? a.usage.pressure : 'none';
        if (!worst || (rank[pr] || 0) > (rank[worst.pressure] || 0)) {
          worst = { pressure: pr, nickname: a.nickname, provider: p.name, resetAt: a.usage ? a.usage.resetAt : null };
        }
      });
    });
    return worst || { pressure: 'none', nickname: '', provider: '', resetAt: null };
  }

  function noticeCounts() {
    var c = { attention: 0, setup: 0, recommended: 0, total: 0 };
    arr(data().notices).forEach(function (n) {
      if (n && c[n.kind] !== undefined) { c[n.kind]++; c.total++; }
    });
    return c;
  }

  function domainHealth(domainId) {
    var res = { attention: 0, setup: 0 };
    var dom = domainById(domainId);
    if (dom) {
      arr(dom.subs).forEach(function (sub) {
        arr(sub.settingIds).forEach(function (sid) {
          var s = data().settings ? data().settings[sid] : null;
          if (!s) { return; }
          var rs = window.PMState.resolveRowState(s);
          if (rs.statusTone === 'attention') { res.attention++; }
          else if (rs.statusTone === 'setup') { res.setup++; }
        });
      });
    }
    arr(data().notices).forEach(function (n) {
      if (n && n.target && n.target.domain === domainId) {
        if (n.kind === 'attention') { res.attention++; }
        else if (n.kind === 'setup') { res.setup++; }
      }
    });
    return res;
  }

  function consoleSummary(id) {
    if (id === 'providers') {
      var ps = providersSummary();
      var text = ps.ready + ' of ' + ps.total + ' ready';
      if (ps.attention > 0) { text += ' · ' + ps.attention + ' need attention'; }
      return { text: text, tone: ps.attention > 0 ? 'attention' : 'ok' };
    }
    if (id === 'crew') {
      var crews = arr(data().crew);
      var queued = 0;
      crews.forEach(function (c) { queued += c.queuedWaves || 0; });
      var t = crews.length + (crews.length === 1 ? ' template' : ' templates');
      if (queued > 0) { t += ' · ' + queued + (queued === 1 ? ' wave queued' : ' waves queued'); }
      return { text: t, tone: queued > 0 ? 'setup' : 'ok' };
    }
    if (id === 'media') {
      var routes = arr(data().media);
      var live = 0, gaps = 0;
      routes.forEach(function (m) { if (m.providerRef) { live++; } else { gaps++; } });
      var mt = live + (live === 1 ? ' route live' : ' routes live');
      if (gaps > 0) { mt += ' · ' + gaps + (gaps === 1 ? ' needs a provider' : ' need a provider'); }
      return { text: mt, tone: gaps > 0 ? 'setup' : 'ok' };
    }
    return { text: '', tone: 'ok' };
  }

  /* ---------------- stage scaffold ---------------- */

  function buildStage() {
    var stage = document.getElementById('pmStage');
    clear(stage);
    var root = el('div', 'c2-root');
    root.style.position = 'relative';

    var topbar = el('div', 'c2-topbar');
    els.crumb = el('nav', 'c2-crumb');
    els.crumb.setAttribute('aria-label', 'Settings location');
    var cmdbar = btn('c2-cmdbar', null, function () { openPalette(''); });
    cmdbar.setAttribute('aria-haspopup', 'dialog');
    cmdbar.appendChild(ico('search'));
    var hint = el('span', 'c2-cmdbar-hint', 'Search settings, consoles, actions');
    cmdbar.appendChild(hint);
    var kbd = el('kbd', null, 'Ctrl K');
    cmdbar.appendChild(kbd);
    els.cmdbar = cmdbar;
    topbar.appendChild(els.crumb);
    topbar.appendChild(cmdbar);

    els.health = el('div', 'c2-health');
    els.health.setAttribute('aria-label', 'System health');
    els.body = el('div', 'c2-body');

    root.appendChild(topbar);
    root.appendChild(els.health);
    root.appendChild(els.body);

    /* narrow: outline bottom sheet (minimap folds into it) */
    els.outlineBtn = btn('c2-outline-btn', null, function () { openSheet(); });
    els.outlineBtn.appendChild(ico('list'));
    els.outlineBtn.appendChild(el('span', null, 'Outline'));
    els.outlineBtn.setAttribute('aria-haspopup', 'dialog');
    els.outlineBtn.hidden = true;
    root.appendChild(els.outlineBtn);

    els.sheet = el('div', 'c2-sheet');
    els.sheet.setAttribute('role', 'dialog');
    els.sheet.setAttribute('aria-label', 'Document outline');
    els.sheet.hidden = true;
    root.appendChild(els.sheet);

    els.root = root;
    stage.appendChild(root);

    /* command palette overlay */
    var backdrop = el('div', 'c2-palette-backdrop');
    backdrop.hidden = true;
    backdrop.addEventListener('mousedown', function (e) {
      if (e.target === backdrop) { closePalette(false); }
    });
    var pal = el('div', 'c2-palette');
    pal.setAttribute('role', 'dialog');
    pal.setAttribute('aria-label', 'Search settings, consoles, and actions');
    var inputWrap = el('div', 'c2-palette-input');
    inputWrap.appendChild(ico('search'));
    var input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('aria-label', 'Search settings, consoles, and actions');
    input.placeholder = 'Type to search everywhere';
    inputWrap.appendChild(input);
    var list = el('div', 'c2-palette-list');
    list.setAttribute('role', 'listbox');
    list.id = 'c2PaletteList';
    var foot = el('div', 'c2-palette-foot');
    foot.innerHTML = '<span><kbd>Up</kbd><kbd>Down</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span>';
    pal.appendChild(inputWrap);
    pal.appendChild(list);
    pal.appendChild(foot);
    backdrop.appendChild(pal);
    document.body.appendChild(backdrop);
    els.paletteBackdrop = backdrop;
    els.paletteInput = input;
    els.paletteList = list;

    input.addEventListener('input', function () { renderPaletteResults(input.value); });
    input.addEventListener('keydown', onPaletteKeydown);
  }

  /* ---------------- crumb + statusbar ---------------- */

  function renderCrumb() {
    clear(els.crumb);
    var rootBtn = btn(null, 'Mission Control', function () { go({ name: 'home' }); });
    if (view.name === 'home') {
      var here = el('span', 'c2-crumb-here', 'Mission Control');
      els.crumb.appendChild(here);
    } else {
      els.crumb.appendChild(rootBtn);
      els.crumb.appendChild(ico('chevR'));
      var label = view.name === 'workspace'
        ? (domainById(view.domainId) || {}).title || 'Workspace'
        : (CONSOLES[view.managerId] || {}).title + ' console';
      els.crumb.appendChild(el('span', 'c2-crumb-here', label));
    }
    var scenario = store.get('scenario') || 'baseline';
    var scnLabel = '';
    arr(window.PMState.scenarios).forEach(function (s) { if (s.id === scenario) { scnLabel = s.label || s.id; } });
    var right = document.getElementById('pmStatusRight');
    if (right) { right.textContent = 'fable · Mission Control — ' + scnLabel; }
  }

  /* ---------------- health strip ---------------- */

  function healthChip(key, icoName, label, note, tone, onClick) {
    var chip = btn('c2-health-chip', null, onClick);
    chip.setAttribute('data-tone', tone);
    var inner = el('span', null);
    inner.style.display = 'inline-flex';
    inner.style.alignItems = 'center';
    inner.style.gap = '8px';
    inner.style.minWidth = '0';
    inner.appendChild(ico(icoName));
    inner.appendChild(el('span', 'c2-health-label', label));
    inner.appendChild(el('span', 'c2-health-note', note));
    var sig = icoName + '|' + label + '|' + note + '|' + tone;
    if (healthPrev[key] && healthPrev[key] !== sig && !motionReduced()) {
      inner.classList.add('c2-morph'); // glyph + label morph together, once
    }
    healthPrev[key] = sig;
    chip.appendChild(inner);
    chip.setAttribute('aria-label', label + ': ' + note);
    return chip;
  }

  function renderHealth() {
    clear(els.health);
    var ps = providersSummary();
    var pText = ps.ready + ' ready';
    if (ps.attention > 0) { pText += ' · ' + ps.attention + ' need attention'; }
    else { pText += ' · all clear'; }
    els.health.appendChild(healthChip(
      'providers',
      ps.attention > 0 ? 'warning' : 'server',
      'Providers', pText,
      ps.attention > 0 ? 'attention' : 'ok',
      function () { go({ name: 'manager', managerId: 'providers' }); }
    ));

    var wp = worstPressure();
    var uText, uTone;
    if (wp.pressure === 'exhausted') {
      uText = 'Included usage exhausted on ' + wp.nickname + (wp.resetAt ? ' · resets ' + fmtWhen(wp.resetAt) : '');
      uTone = 'attention';
    } else if (wp.pressure === 'high' || wp.pressure === 'elevated') {
      uText = PRESSURE_WORD[wp.pressure] + ' pressure on ' + wp.nickname;
      uTone = 'watch';
    } else if (wp.pressure === 'unknown') {
      uText = 'Pressure unknown on ' + wp.nickname;
      uTone = 'watch';
    } else {
      uText = 'Low pressure everywhere';
      uTone = 'ok';
    }
    els.health.appendChild(healthChip('usage', 'gauge', 'Usage', uText, uTone, function () {
      go({ name: 'manager', managerId: 'providers' });
      window.PMShell.status('Usage snapshots live in each provider inspector; full history is on the Usage page.');
    }));

    var nc = noticeCounts();
    var nText = nc.total === 0 ? 'All clear'
      : nc.attention + ' attention · ' + nc.setup + ' setup · ' + nc.recommended + ' recommended';
    els.health.appendChild(healthChip(
      'notices',
      nc.attention > 0 ? 'warning' : 'checkCircle',
      nc.total === 0 ? 'Notices' : nc.total + (nc.total === 1 ? ' notice' : ' notices'),
      nText,
      nc.attention > 0 ? 'attention' : (nc.total > 0 ? 'watch' : 'ok'),
      function () { go({ name: 'home' }); }
    ));
  }

  /* ---------------- navigation ---------------- */

  function go(next) {
    closePalette(false);
    closeSheet(false);
    closeOpenMenu();
    view.name = next.name;
    if (next.name === 'workspace') { view.domainId = next.domainId; }
    if (next.name === 'manager') { view.managerId = next.managerId; }
    persistView();
    renderAll();
  }

  function renderAll() {
    if (spy) { spy.dispose(); spy = null; }
    renderCrumb();
    renderHealth();
    clear(els.body);
    els.outlineBtn.hidden = view.name !== 'workspace';
    if (view.name === 'home') { renderHome(); }
    else if (view.name === 'workspace') { renderWorkspace(view.domainId); }
    else { renderConsole(view.managerId); }
  }

  /* ==================================================================
     HOME
     ================================================================== */

  var NOTICE_ICON = { attention: 'warning', setup: 'wrench', recommended: 'sparkle' };
  var NOTICE_GROUP = { attention: 'Needs attention', setup: 'Continue setup', recommended: 'Recommended' };

  function renderHome() {
    var home = el('div', 'c2-home');
    var inner = el('div', 'c2-home-inner');
    home.appendChild(inner);

    var byKind = { attention: [], setup: [], recommended: [] };
    arr(data().notices).forEach(function (n) {
      if (n && byKind[n.kind]) { byKind[n.kind].push(n); }
    });

    if (byKind.attention.length + byKind.setup.length + byKind.recommended.length === 0) {
      /* calm state: genuinely quiet, zero animation */
      var calm = el('div', 'c2-calm');
      calm.appendChild(ico('checkCircle'));
      var calmText = el('div', null);
      var strong = el('strong', null, 'All clear');
      calmText.appendChild(strong);
      calmText.appendChild(document.createTextNode('Nothing needs your attention. Stations report normal operation.'));
      calm.appendChild(calmText);
      inner.appendChild(groupHead('Status', ''));
      inner.appendChild(calm);
    } else {
      ['attention', 'setup', 'recommended'].forEach(function (kind) {
        if (byKind[kind].length === 0) { return; }
        inner.appendChild(groupHead(NOTICE_GROUP[kind], String(byKind[kind].length)));
        var stack = el('div', 'c2-triage');
        byKind[kind].forEach(function (n) { stack.appendChild(renderNotice(n)); });
        inner.appendChild(stack);
      });
    }

    var recents = arr(data().recents);
    if (recents.length > 0) {
      inner.appendChild(groupHead('Pick up where you left off', ''));
      var rWrap = el('div', 'c2-recents');
      recents.slice(0, 4).forEach(function (r) {
        var row = btn('c2-recent', null, function () { followTarget(r.target || {}); });
        row.appendChild(ico('history'));
        row.appendChild(el('span', null, r.label));
        row.appendChild(el('span', 'c2-recent-detail', r.detail || ''));
        rWrap.appendChild(row);
      });
      inner.appendChild(rWrap);
    }

    inner.appendChild(groupHead('Consoles', ''));
    var cGrid = el('div', 'c2-stations');
    Object.keys(CONSOLES).forEach(function (id) {
      cGrid.appendChild(stationCard({
        icoName: CONSOLES[id].ico,
        title: CONSOLES[id].title,
        isConsole: true,
        purpose: CONSOLES[id].purpose,
        health: consoleSummary(id),
        onOpen: function () { go({ name: 'manager', managerId: id }); }
      }));
    });
    inner.appendChild(cGrid);

    inner.appendChild(groupHead('Stations', ''));
    var sGrid = el('div', 'c2-stations');
    arr(data().taxonomy).forEach(function (dom) {
      var dh = domainHealth(dom.id);
      var health;
      if (dh.attention > 0) {
        health = { text: dh.attention + (dh.attention === 1 ? ' needs attention' : ' need attention'), tone: 'attention' };
      } else if (dh.setup > 0) {
        health = { text: 'Setup unfinished', tone: 'setup' };
      } else {
        health = { text: 'All settled', tone: 'ok' };
      }
      sGrid.appendChild(stationCard({
        icoName: dom.icon || 'gear',
        title: dom.title,
        purpose: dom.blurb || '',
        health: health,
        onOpen: function () { go({ name: 'workspace', domainId: dom.id }); }
      }));
    });
    inner.appendChild(sGrid);

    els.body.appendChild(home);
  }

  function groupHead(title, count) {
    var head = el('div', 'c2-group-head');
    var h2 = el('h2', null, title);
    head.appendChild(h2);
    if (count) { head.appendChild(el('span', 'c2-group-count', count)); }
    return head;
  }

  function stationCard(opts) {
    var card = btn('c2-station', null, opts.onOpen);
    if (opts.isConsole) { card.setAttribute('data-console', '1'); }
    var iconWrap = el('span', 'c2-station-icon');
    iconWrap.appendChild(ico(opts.icoName));
    card.appendChild(iconWrap);
    var title = el('span', 'c2-station-title', opts.title);
    if (opts.isConsole) {
      var tag = el('span', 'c2-station-tag', 'Console');
      title.appendChild(tag);
    }
    card.appendChild(title);
    card.appendChild(el('span', 'c2-station-purpose', opts.purpose));
    var health = el('span', 'c2-station-health');
    health.setAttribute('data-tone', opts.health.tone);
    health.appendChild(ico(opts.health.tone === 'attention' ? 'warning' : (opts.health.tone === 'setup' ? 'wrench' : 'check')));
    health.appendChild(el('span', null, opts.health.text));
    card.appendChild(health);
    var open = el('span', 'c2-station-open');
    open.appendChild(el('span', null, 'Open'));
    open.appendChild(ico('arrowR'));
    card.appendChild(open);
    return card;
  }

  var STATUS_TONE_ICON = { attention: 'warning', setup: 'wrench', recommended: 'sparkle', ok: 'checkCircle', muted: 'info' };

  function statusWord(tone, word) {
    var span = el('span', 'pm-status-word', '');
    span.setAttribute('data-tone', tone);
    span.appendChild(ico(STATUS_TONE_ICON[tone] || 'info'));
    span.appendChild(document.createTextNode(word));
    return span;
  }

  function renderNotice(n) {
    var r = window.PMState.resolveNotice(n);
    var card = el('article', 'c2-notice');
    card.setAttribute('data-kind', r.tone);
    card.appendChild(statusWord(r.tone, r.statusWord));
    card.appendChild(el('h3', 'c2-notice-headline', r.headline));
    card.appendChild(el('p', 'c2-notice-consequence', r.consequence));
    var actions = el('div', 'c2-notice-actions');
    if (r.primary && r.primary.label) {
      var primary = btn('c2-btn' + (r.tone === 'attention' ? ' is-primary' : ''), r.primary.label, function () {
        runNoticeAction(n, r.primary);
      });
      actions.appendChild(primary);
    }
    if (r.secondary && r.secondary.label) {
      actions.appendChild(btn('c2-btn is-quiet', r.secondary.label, function () {
        runNoticeAction(n, r.secondary);
      }));
    }
    card.appendChild(actions);
    return card;
  }

  function runNoticeAction(notice, action) {
    var target = (notice && notice.target) || {};
    var act = action && action.act;
    if (act === 'reconnect' && target.providerId) {
      window.PMState.trigger('reconnect', target.providerId);
    }
    if (act === 'invoke-test') {
      window.PMState.trigger('invoke-test', target.providerId);
    }
    if (act === 'open-usage') {
      window.PMState.receipt('Open the Usage page', 'Deep link to Usage with this provider preselected.');
    }
    followTarget(target);
  }

  function followTarget(target) {
    if (target.settingId) { openSetting(target.settingId); return; }
    if (target.manager) {
      var m = target.manager;
      if (CONSOLES[m]) { go({ name: 'manager', managerId: m }); return; }
      var route = MANAGER_ROUTE['manager.' + m];
      if (route && route.crossConcept) {
        window.PMState.receipt('Open ' + (route.label || 'this console'), route.crossConcept);
      }
      if (route && route.domain) { go({ name: 'workspace', domainId: route.domain }); return; }
    }
    if (target.providerId) {
      view.sel.providers = target.providerId;
      go({ name: 'manager', managerId: 'providers' });
      return;
    }
    if (target.domain && domainById(target.domain)) {
      go({ name: 'workspace', domainId: target.domain });
      return;
    }
    go({ name: 'home' });
  }

  /* ==================================================================
     WORKSPACE — rail (secondary) + document + minimap (primary)
     ================================================================== */

  function renderWorkspace(domainId) {
    var dom = domainById(domainId) || arr(data().taxonomy)[0];
    if (!dom) { return; }
    view.domainId = dom.id;
    expanders = {};

    var wrap = el('div', 'c2-work');
    var rail = buildStationRail(dom.id);
    var doc = el('div', 'c2-doc');
    doc.id = 'c2Doc';
    doc.tabIndex = -1;
    doc.setAttribute('aria-label', dom.title + ' settings document');

    var head = el('header', 'c2-doc-head');
    head.appendChild(el('h1', null, dom.title));
    head.appendChild(el('p', null, dom.blurb || ''));
    doc.appendChild(head);

    arr(dom.subs).forEach(function (sub) {
      doc.appendChild(renderSubSection(dom, sub));
    });

    var map = el('div', 'c2-map');
    map.setAttribute('aria-label', 'Document minimap');
    var track = el('div', 'c2-map-track');
    map.appendChild(track);
    els.mapTrack = track;
    els.map = map;
    /* track click (outside blocks/window) scrolls to that fraction;
       wired once here, not in layoutMinimap (which re-runs) */
    track.addEventListener('mousedown', function (e) {
      if (e.target !== track) { return; }
      var rect = track.getBoundingClientRect();
      var fraction = (e.clientY - rect.top) / (rect.height || 1);
      doc.scrollTo({
        top: fraction * (doc.scrollHeight - doc.clientHeight),
        behavior: motionReduced() ? 'auto' : 'smooth'
      });
    });

    wrap.appendChild(rail);
    wrap.appendChild(doc);
    wrap.appendChild(map);
    els.body.appendChild(wrap);
    els.doc = doc;

    /* scrollspy: the section registry that also feeds the minimap.
       Slint: same registry maps to a Flickable offset table; the minimap
       renders from the registry model, never from widget geometry. */
    spy = window.PMSpy.attach({
      scroller: doc,
      topOffset: 10,
      getSections: function () {
        return Array.prototype.slice.call(doc.querySelectorAll('.c2-sec'));
      },
      onChange: function (activeId) { onActiveSection(activeId); }
    });

    layoutMinimap();
    doc.addEventListener('scroll', scheduleMapWindow, { passive: true });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { layoutMinimap(); });
      ro.observe(doc);
      ro.observe(map);
    }
    updateMapWindow();
    onActiveSection(spy.state.activeId);
  }

  function buildStationRail(activeDomain) {
    var rail = el('nav', 'c2-wrail');
    rail.setAttribute('aria-label', 'Stations');
    arr(data().taxonomy).forEach(function (dom) {
      var item = btn('c2-wrail-item', null, function () {
        if (dom.id === view.domainId) {
          var first = arr(dom.subs)[0];
          if (first && spy) { spy.jumpTo(secId(dom.id, first.id)); }
        } else {
          go({ name: 'workspace', domainId: dom.id });
        }
      });
      item.setAttribute('aria-label', dom.title);
      if (dom.id === activeDomain) { item.classList.add('is-active'); item.setAttribute('aria-current', 'true'); }
      item.appendChild(ico(dom.icon || 'gear'));
      item.appendChild(el('span', 'c2-wrail-label', dom.title));
      var dh = domainHealth(dom.id);
      var glyphTone = dh.attention > 0 ? 'attention' : (dh.setup > 0 ? 'setup' : 'ok');
      var glyph = ico(glyphTone === 'attention' ? 'warning' : (glyphTone === 'setup' ? 'wrench' : 'check'), 'c2-wrail-glyph');
      glyph.setAttribute('data-tone', glyphTone);
      item.appendChild(glyph);
      rail.appendChild(item);

      if (dom.id === activeDomain) {
        var subs = el('div', 'c2-wrail-subs');
        arr(dom.subs).forEach(function (sub) {
          var sBtn = btn('c2-wrail-sub', null, function () {
            if (spy) { spy.jumpTo(secId(dom.id, sub.id)); }
          });
          sBtn.setAttribute('data-sec', secId(dom.id, sub.id));
          sBtn.appendChild(el('span', 'c2-wrail-dot'));
          sBtn.appendChild(el('span', null, sub.title));
          subs.appendChild(sBtn);
        });
        rail.appendChild(subs);
      }
    });
    return rail;
  }

  function onActiveSection(activeId) {
    if (!activeId) { return; }
    var subBtns = els.body.querySelectorAll('.c2-wrail-sub');
    Array.prototype.forEach.call(subBtns, function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-sec') === activeId);
    });
    var blocks = els.mapTrack ? els.mapTrack.querySelectorAll('.c2-map-block') : [];
    Array.prototype.forEach.call(blocks, function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-sec') === activeId);
    });
    if (!els.sheet.hidden) { renderSheetItems(); }
  }

  /* ---------------- minimap (primary navigation) ---------------- */

  function sectionHeat(sectionElId) {
    /* heat from row semantics inside the section, not from pixels */
    var m = /^c2sec-(.+?)-(.+)$/.exec(sectionElId || '');
    if (!m) { return null; }
    var dom = domainById(m[1]);
    if (!dom) { return null; }
    var sub = null;
    arr(dom.subs).forEach(function (s) { if (s.id === m[2]) { sub = s; } });
    if (!sub) { return null; }
    var heat = null;
    arr(sub.settingIds).forEach(function (sid) {
      var s = data().settings ? data().settings[sid] : null;
      if (!s) { return; }
      var tone = window.PMState.resolveRowState(s).statusTone;
      if (tone === 'attention') { heat = 'attention'; }
      else if (tone === 'setup' && heat !== 'attention') { heat = 'setup'; }
    });
    return heat;
  }

  function layoutMinimap() {
    if (!els.mapTrack || !els.doc || !spy) { return; }
    var track = els.mapTrack;
    clear(track);
    var doc = els.doc;
    var totalH = doc.scrollHeight || 1;
    var mapH = els.map.clientHeight || 1;
    var sections = spy.state.sections;

    sections.forEach(function (s, idx) {
      var block = btn('c2-map-block', null, function () {
        if (spy) { spy.jumpTo(s.id); }
      });
      block.setAttribute('data-sec', s.id);
      var top = (s.offset / totalH) * mapH;
      var h = Math.max(10, (s.height / totalH) * mapH - 2);
      block.style.top = top.toFixed(1) + 'px';
      block.style.height = h.toFixed(1) + 'px';
      block.appendChild(el('span', null, String(idx + 1)));
      var heat = sectionHeat(s.id);
      var title = sectionTitle(s.id);
      if (heat) {
        block.setAttribute('data-heat', heat);
        block.appendChild(ico(heat === 'attention' ? 'warning' : 'wrench'));
        title += heat === 'attention' ? ' — needs attention' : ' — setup unfinished';
      }
      block.setAttribute('aria-label', 'Jump to ' + title);
      if (spy.state.activeId === s.id) { block.classList.add('is-active'); }
      track.appendChild(block);
    });

    /* draggable viewport window (role slider for keyboard parity) */
    var win = el('div', 'c2-map-window');
    win.setAttribute('role', 'slider');
    win.setAttribute('tabindex', '0');
    win.setAttribute('aria-label', 'Document position');
    win.setAttribute('aria-orientation', 'vertical');
    win.setAttribute('aria-valuemin', '0');
    win.setAttribute('aria-valuemax', '100');
    win.addEventListener('pointerdown', onMapWindowPointerDown);
    win.addEventListener('keydown', onMapWindowKeydown);
    track.appendChild(win);
    els.mapWindow = win;

    updateMapWindow();
  }

  function sectionTitle(sectionElId) {
    var elx = document.getElementById(sectionElId);
    if (!elx) { return sectionElId; }
    var h = elx.querySelector('h2');
    return h ? h.textContent : sectionElId;
  }

  var mapRaf = false;
  function scheduleMapWindow() {
    if (mapRaf) { return; }
    mapRaf = true;
    window.requestAnimationFrame(function () {
      mapRaf = false;
      updateMapWindow();
    });
  }

  function updateMapWindow() {
    if (!els.mapWindow || !els.doc || !els.map) { return; }
    var doc = els.doc;
    var mapH = els.map.clientHeight || 1;
    var totalH = doc.scrollHeight || 1;
    var top = (doc.scrollTop / totalH) * mapH;
    var h = Math.max(14, (doc.clientHeight / totalH) * mapH);
    els.mapWindow.style.top = top.toFixed(1) + 'px';
    els.mapWindow.style.height = h.toFixed(1) + 'px';
    var range = totalH - doc.clientHeight;
    var pct = range > 0 ? Math.round((doc.scrollTop / range) * 100) : 0;
    els.mapWindow.setAttribute('aria-valuenow', String(pct));
    els.mapWindow.setAttribute('aria-valuetext', 'Scrolled ' + pct + ' percent');
  }

  var mapDrag = null;
  function onMapWindowPointerDown(e) {
    var win = els.mapWindow;
    if (!win) { return; }
    e.preventDefault();
    var winRect = win.getBoundingClientRect();
    mapDrag = { grab: e.clientY - winRect.top };
    try { win.setPointerCapture(e.pointerId); } catch (err) { /* older engines */ }
    win.addEventListener('pointermove', onMapWindowPointerMove);
    win.addEventListener('pointerup', onMapWindowPointerUp);
  }
  function onMapWindowPointerMove(e) {
    if (!mapDrag || !els.doc || !els.map) { return; }
    var trackRect = els.map.getBoundingClientRect();
    var mapH = trackRect.height || 1;
    var top = e.clientY - trackRect.top - mapDrag.grab;
    var doc = els.doc;
    var totalH = doc.scrollHeight || 1;
    doc.scrollTop = (top / mapH) * totalH;
  }
  function onMapWindowPointerUp() {
    mapDrag = null;
    if (els.mapWindow) {
      els.mapWindow.removeEventListener('pointermove', onMapWindowPointerMove);
      els.mapWindow.removeEventListener('pointerup', onMapWindowPointerUp);
    }
  }
  function onMapWindowKeydown(e) {
    var doc = els.doc;
    if (!doc) { return; }
    var page = doc.clientHeight * 0.8;
    var behavior = motionReduced() ? 'auto' : 'smooth';
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault(); doc.scrollBy({ top: page, behavior: behavior });
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault(); doc.scrollBy({ top: -page, behavior: behavior });
    } else if (e.key === 'Home') {
      e.preventDefault(); doc.scrollTo({ top: 0, behavior: behavior });
    } else if (e.key === 'End') {
      e.preventDefault(); doc.scrollTo({ top: doc.scrollHeight, behavior: behavior });
    }
  }

  /* ---------------- bottom-sheet outline (narrow) ---------------- */

  function openSheet() {
    renderSheetItems();
    els.sheet.hidden = false;
    var first = els.sheet.querySelector('.c2-sheet-item');
    if (first) { first.focus(); }
  }
  function closeSheet(refocus) {
    if (els.sheet.hidden) { return; }
    els.sheet.hidden = true;
    if (refocus) { els.outlineBtn.focus(); }
  }
  function renderSheetItems() {
    clear(els.sheet);
    var head = el('div', 'c2-sheet-head');
    head.appendChild(el('h3', null, 'Outline'));
    var close = btn('c2-iconbtn', null, function () { closeSheet(true); });
    close.setAttribute('aria-label', 'Close outline');
    close.appendChild(ico('close'));
    head.appendChild(close);
    els.sheet.appendChild(head);
    var dom = domainById(view.domainId);
    if (!dom) { return; }
    arr(dom.subs).forEach(function (sub) {
      var id = secId(dom.id, sub.id);
      var item = btn('c2-sheet-item', null, function () {
        closeSheet(false);
        if (spy) { spy.jumpTo(id); }
      });
      if (spy && spy.state.activeId === id) { item.classList.add('is-active'); }
      item.appendChild(ico('chevR'));
      item.appendChild(el('span', null, sub.title));
      els.sheet.appendChild(item);
    });
    els.sheet.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeSheet(true); }
    });
  }

  /* ---------------- subcategory sections + rows ---------------- */

  function renderSubSection(dom, sub) {
    var sec = el('section', 'c2-sec');
    sec.id = secId(dom.id, sub.id);
    var head = el('div', 'c2-sec-head');
    head.appendChild(el('h2', null, sub.title));
    if (sub.blurb) { head.appendChild(el('span', 'c2-sec-blurb', sub.blurb)); }
    sec.appendChild(head);

    var groups = { standard: [], advanced: [], expert: [], diagnostic: [] };
    arr(sub.settingIds).forEach(function (sid) {
      var s = data().settings ? data().settings[sid] : null;
      if (!s) { return; }
      var exp = s.exposure || 'standard';
      if (exp === 'advanced') { groups.advanced.push(s); }
      else if (exp === 'expert') { groups.expert.push(s); }
      else if (exp === 'diagnostic') { groups.diagnostic.push(s); }
      else { groups.standard.push(s); } // standard, managed, unavailable stay visible
    });

    var subKey = dom.id + '/' + sub.id;
    var reg = { configure: null, advanced: null, expert: null, diagnostic: null };
    expanders[subKey] = reg;

    var consoleId = SUB_CONSOLE[dom.id + '.' + sub.id];
    var host = sec;
    if (consoleId) {
      /* inverted relation: the console station is the primary object;
         this subcategory's plain settings hang off it in a drawer */
      sec.appendChild(renderSubstation(consoleId));
      var conf = disclosure({
        label: 'Configure ' + sub.title.toLowerCase(),
        icoName: 'gear',
        kind: 'configure'
      });
      reg.configure = conf.expand;
      sec.appendChild(conf.root);
      host = conf.body;
    }

    groups.standard.forEach(function (s) { host.appendChild(renderRow(s, subKey)); });

    if (groups.advanced.length > 0) {
      var adv = disclosure({
        label: 'Advanced settings (' + groups.advanced.length + ')',
        icoName: 'wrench',
        kind: 'advanced'
      });
      reg.advanced = adv.expand;
      groups.advanced.forEach(function (s) { adv.body.appendChild(renderRow(s, subKey)); });
      host.appendChild(adv.root);
    }

    if (groups.expert.length > 0) {
      var expd = disclosure({
        label: 'Expert & risky (' + groups.expert.length + ')',
        icoName: 'warning',
        kind: 'expert'
      });
      reg.expert = expd.expand;
      var caution = el('div', 'c2-caution');
      caution.appendChild(ico('warning'));
      var ctext = el('div', null);
      ctext.appendChild(document.createTextNode(
        'These settings can break protections or lose work. They stay locked until you confirm you understand the risk.'
      ));
      var unlockBtn = btn('c2-btn', expertUnlocked[subKey] ? 'Expert settings unlocked' : 'I understand the risk — unlock', function () {
        expertUnlocked[subKey] = true;
        window.PMShell.status('Expert settings unlocked for ' + sub.title + ' (this session).');
        rerenderExpert();
      });
      unlockBtn.disabled = !!expertUnlocked[subKey];
      ctext.appendChild(el('div', null)).appendChild(unlockBtn);
      caution.appendChild(ctext);
      expd.body.appendChild(caution);
      var expertRows = el('div', null);
      expd.body.appendChild(expertRows);
      var rerenderExpert = function () {
        clear(expertRows);
        unlockBtn.disabled = !!expertUnlocked[subKey];
        if (expertUnlocked[subKey]) { unlockBtn.textContent = 'Expert settings unlocked'; }
        groups.expert.forEach(function (s) {
          expertRows.appendChild(renderRow(s, subKey, { lockUnlessConfirmed: !expertUnlocked[subKey] }));
        });
      };
      rerenderExpert();
      host.appendChild(expd.root);
    }

    if (groups.diagnostic.length > 0) {
      var diag = disclosure({
        label: 'Diagnostics (' + groups.diagnostic.length + ')',
        icoName: 'terminal',
        kind: 'diagnostic'
      });
      reg.diagnostic = diag.expand;
      groups.diagnostic.forEach(function (s) { diag.body.appendChild(renderRow(s, subKey)); });
      host.appendChild(diag.root);
    }

    return sec;
  }

  function renderSubstation(consoleId) {
    var meta = CONSOLES[consoleId];
    var sum = consoleSummary(consoleId);
    var panel = el('div', 'c2-substation');
    var iconWrap = el('span', 'c2-station-icon');
    iconWrap.appendChild(ico(meta.ico));
    panel.appendChild(iconWrap);
    var text = el('div', 'c2-substation-text', meta.title);
    var small = el('small', null, meta.purpose);
    text.appendChild(small);
    panel.appendChild(text);
    var health = el('div', 'c2-substation-health');
    health.appendChild(ico(sum.tone === 'attention' ? 'warning' : (sum.tone === 'setup' ? 'wrench' : 'check')));
    health.appendChild(el('span', null, sum.text));
    panel.appendChild(health);
    var open = btn('c2-btn is-primary', null, function () { go({ name: 'manager', managerId: consoleId }); });
    open.appendChild(el('span', null, 'Open console'));
    open.appendChild(ico('arrowR'));
    panel.appendChild(open);
    return panel;
  }

  function disclosure(opts) {
    var root = el('div', 'c2-disc');
    if (opts.kind) { root.setAttribute('data-kind', opts.kind); }
    var button = btn('c2-disc-btn', null, null);
    button.setAttribute('aria-expanded', 'false');
    button.appendChild(ico(opts.icoName || 'chevD'));
    button.appendChild(el('span', null, opts.label));
    button.appendChild(ico('chevD', 'c2-disc-chev'));
    var body = el('div', 'c2-disc-body');
    body.hidden = true;
    button.addEventListener('click', function () {
      var openNow = body.hidden;
      body.hidden = !openNow;
      button.setAttribute('aria-expanded', String(openNow));
      if (spy) { spy.refresh(); }
      layoutMinimap();
    });
    root.appendChild(button);
    root.appendChild(body);
    return {
      root: root,
      body: body,
      expand: function () {
        if (body.hidden) {
          body.hidden = false;
          button.setAttribute('aria-expanded', 'true');
          if (spy) { spy.refresh(); }
          layoutMinimap();
        }
      }
    };
  }

  /* ---------------- setting rows ---------------- */

  var FLAG_ICON_LABEL = {
    refresh: 'Restart required', plug: 'Reconnect required', gauge: 'Affects cost',
    lock: 'Privacy impact', shield: 'Safety relevant', bolt: 'Performance impact'
  };

  var SCOPE_WORDS = {
    global: 'Everywhere',
    project: 'This project',
    thread: 'This conversation',
    turn: 'This turn',
    goal: 'This Goal run'
  };

  function renderRow(s, subKey, rowOpts) {
    rowOpts = rowOpts || {};
    var rs = window.PMState.resolveRowState(s);
    var row = el('div', 'c2-row');
    row.setAttribute('data-setting-id', s.id);
    var locked = !rs.editable || rowOpts.lockUnlessConfirmed;
    if (!rs.editable) { row.setAttribute('data-inert', '1'); }

    var main = el('div', 'c2-row-main');
    var label = el('div', 'c2-row-label', s.label || s.id);
    if (rs.exposure === 'managed' || s.valueSource === 'managed') { label.appendChild(ico('lock')); }
    main.appendChild(label);
    if (s.desc) { main.appendChild(el('div', 'c2-row-desc', sanitizeCopy(s.desc))); }
    row.appendChild(main);

    var meta = el('div', 'c2-row-meta');
    rs.chips.forEach(function (c) {
      var chip = el('span', 'pm-chip-value', c.label);
      chip.setAttribute('data-kind', c.kind);
      meta.appendChild(chip);
    });
    rs.flags.forEach(function (f) {
      var flag = el('span', 'c2-row-flag');
      flag.appendChild(ico(f.icon));
      flag.appendChild(el('span', null, f.label || FLAG_ICON_LABEL[f.icon] || ''));
      meta.appendChild(flag);
    });
    if (rs.sourceLabel) { meta.appendChild(el('span', null, rs.sourceLabel)); }
    var scopeWords = arr(s.scope).map(function (sc) { return SCOPE_WORDS[sc]; }).filter(Boolean);
    if (scopeWords.length > 0) {
      meta.appendChild(el('span', 'c2-row-scope', 'Scope: ' + scopeWords.join(' — ')));
    }
    if (rs.statusTone === 'recommended' || rs.statusTone === 'attention') {
      meta.appendChild(statusWord(rs.statusTone,
        rs.statusTone === 'recommended' ? 'Recommended' : 'Needs attention'));
    }
    if (s.riskNote) {
      var risk = el('span', 'c2-row-flag');
      risk.appendChild(ico('warning'));
      risk.appendChild(el('span', null, s.riskNote));
      meta.appendChild(risk);
    }
    row.appendChild(meta);

    var control = el('div', 'c2-row-control');
    control.appendChild(buildControl(s, rs, locked, function () {
      replaceRow(row, s, subKey, rowOpts);
    }));
    if (rs.editable && !rowOpts.lockUnlessConfirmed && s.valueSource === 'custom' && s['default'] !== undefined) {
      var reset = btn('c2-btn is-quiet', null, function () {
        s.value = s['default'];
        s.valueSource = 'default';
        window.PMShell.status('Reset "' + s.label + '" to its default.');
        replaceRow(row, s, subKey, rowOpts);
      });
      reset.appendChild(ico('refresh'));
      reset.appendChild(el('span', null, 'Reset to default'));
      control.appendChild(reset);
    }
    row.appendChild(control);
    return row;
  }

  function replaceRow(oldRow, s, subKey, rowOpts) {
    var hadFocus = oldRow.contains(document.activeElement);
    var next = renderRow(s, subKey, rowOpts);
    oldRow.parentNode.replaceChild(next, oldRow);
    if (hadFocus) {
      var target = next.querySelector('[data-primary-control]') || next.querySelector('button, select, input');
      if (target) { target.focus(); }
    }
    if (spy) { spy.refresh(); }
  }

  function commit(s, value, label) {
    s.value = value;
    s.valueSource = 'custom';
    window.PMShell.status('Saved "' + (s.label || s.id) + '" — now ' + label + '.');
  }

  function buildControl(s, rs, locked, rerender) {
    var wrap = el('div', null);
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'flex-end';
    wrap.style.gap = '5px';

    if (rs.exposure === 'unavailable') {
      var chip = el('span', 'pm-chip-value', 'Unavailable');
      chip.setAttribute('data-kind', 'unavailable');
      wrap.appendChild(chip);
      return wrap;
    }

    var type = s.type || 'text';

    if (type === 'toggle') {
      var t = el('button', 'c2-toggle');
      t.type = 'button';
      t.setAttribute('role', 'switch');
      t.setAttribute('data-primary-control', '1');
      t.setAttribute('aria-checked', String(!!s.value));
      t.setAttribute('aria-label', s.label || s.id);
      t.disabled = locked;
      t.addEventListener('click', function () {
        commit(s, !s.value, !s.value ? 'On' : 'Off');
        rerender();
      });
      wrap.appendChild(t);
      return wrap;
    }

    if (type === 'select') {
      var sel = document.createElement('select');
      sel.className = 'c2-select';
      sel.setAttribute('data-primary-control', '1');
      sel.setAttribute('aria-label', s.label || s.id);
      sel.disabled = locked;
      arr(s.options).forEach(function (o) {
        var opt = document.createElement('option');
        var val = (o && typeof o === 'object') ? (o.value !== undefined ? o.value : o.id) : o;
        var lab = (o && typeof o === 'object') ? (o.label || String(val)) : String(o);
        opt.value = String(val);
        opt.textContent = lab;
        if (String(s.value) === String(val)) { opt.selected = true; }
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function () {
        commit(s, sel.value, sel.options[sel.selectedIndex].textContent);
        rerender();
      });
      wrap.appendChild(sel);
      return wrap;
    }

    if (type === 'radio') {
      var group = el('div', 'c2-radiogroup');
      group.setAttribute('role', 'radiogroup');
      group.setAttribute('aria-label', s.label || s.id);
      arr(s.options).forEach(function (o, idx) {
        var val = (o && typeof o === 'object') ? (o.value !== undefined ? o.value : o.id) : o;
        var lab = (o && typeof o === 'object') ? (o.label || String(val)) : String(o);
        var r = btn('c2-radio', null, function () {
          commit(s, val, lab);
          rerender();
        });
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', String(String(s.value) === String(val)));
        if (idx === 0) { r.setAttribute('data-primary-control', '1'); }
        r.disabled = locked;
        r.appendChild(el('span', 'c2-radio-dot'));
        r.appendChild(el('span', null, lab));
        group.appendChild(r);
      });
      wrap.appendChild(group);
      return wrap;
    }

    if (type === 'number' || type === 'slider') {
      var num = document.createElement('input');
      num.type = 'number';
      num.className = 'c2-input';
      num.setAttribute('data-primary-control', '1');
      num.setAttribute('aria-label', s.label || s.id);
      if (s.value != null && s.value !== '') { num.value = String(s.value); }
      num.disabled = locked;
      num.addEventListener('change', function () {
        var v = num.value === '' ? s['default'] : Number(num.value);
        commit(s, v, String(v));
        rerender();
      });
      wrap.appendChild(num);
      return wrap;
    }

    if (type === 'action') {
      var act = btn('c2-btn', typeof s.value === 'string' && s.value ? s.value : 'Open', function () {
        window.PMState.receipt(s.label || 'Run action', 'This demo returns a receipt instead of running the real action.');
      });
      act.setAttribute('data-primary-control', '1');
      act.disabled = locked;
      wrap.appendChild(act);
      return wrap;
    }

    if (type === 'list' || type === 'multiselect' || type === 'keyvalue') {
      var summary = el('span', 'pm-chip-value',
        window.PMState.resolveRowState(s).valueLabel || 'Manage');
      summary.setAttribute('data-kind', rs.valueKind);
      wrap.appendChild(summary);
      var manage = btn('c2-btn', 'Manage', function () {
        window.PMState.receipt('Manage "' + (s.label || s.id) + '"', 'The full editor for this collection is out of scope for the demo.');
      });
      manage.setAttribute('data-primary-control', '1');
      manage.disabled = locked;
      wrap.appendChild(manage);
      return wrap;
    }

    /* text / path: a blank input never means auto/inherit/not-configured —
       those states render an explicit chip plus a "Set value" affordance. */
    var blankState = rs.valueKind === 'auto' || rs.valueKind === 'inherited' ||
      rs.valueKind === 'not-configured' || rs.valueKind === 'managed';
    var hasText = s.value != null && s.value !== '';
    if (blankState && !hasText) {
      var stateChip = el('span', 'pm-chip-value', rs.valueLabel);
      stateChip.setAttribute('data-kind', rs.valueKind);
      wrap.appendChild(stateChip);
      if (!locked) {
        var setBtn = btn('c2-btn', 'Set a value', function () {
          clear(wrap);
          var input = document.createElement('input');
          input.type = 'text';
          input.className = 'c2-input';
          input.setAttribute('aria-label', s.label || s.id);
          input.placeholder = 'Enter a value';
          input.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter') { input.blur(); }
            if (ev.key === 'Escape') { rerender(); }
          });
          input.addEventListener('blur', function () {
            if (input.value !== '') { commit(s, input.value, input.value); }
            rerender();
          });
          wrap.appendChild(input);
          input.focus();
        });
        setBtn.setAttribute('data-primary-control', '1');
        wrap.appendChild(setBtn);
      }
      return wrap;
    }
    var text = document.createElement('input');
    text.type = 'text';
    text.className = 'c2-input';
    text.setAttribute('data-primary-control', '1');
    text.setAttribute('aria-label', s.label || s.id);
    text.value = hasText ? String(s.value) : '';
    text.disabled = locked;
    text.addEventListener('change', function () {
      commit(s, text.value, text.value === '' ? 'empty' : text.value);
      rerender();
    });
    wrap.appendChild(text);
    return wrap;
  }

  /* ---------------- deep links ---------------- */

  function openSetting(settingId) {
    var loc = subIndex[settingId];
    if (!loc) {
      window.PMState.receipt('Open setting', 'The setting "' + settingId + '" is not in this demo dataset.');
      return;
    }
    if (view.name !== 'workspace' || view.domainId !== loc.domainId) {
      view.name = 'workspace';
      view.domainId = loc.domainId;
      persistView();
      renderAll();
    }
    var s = data().settings ? data().settings[settingId] : null;
    var subKey = loc.domainId + '/' + loc.subId;
    var reg = expanders[subKey] || {};
    var ensure = [];
    if (reg.configure) { ensure.push(reg.configure); }
    var exp = s ? (s.exposure || 'standard') : 'standard';
    if (exp === 'advanced' && reg.advanced) { ensure.push(reg.advanced); }
    if (exp === 'expert' && reg.expert) { ensure.push(reg.expert); }
    if (exp === 'diagnostic' && reg.diagnostic) { ensure.push(reg.diagnostic); }

    window.PMSpy.reveal({
      controller: spy,
      ensure: ensure,
      targetId: secId(loc.domainId, loc.subId)
    }).then(function () {
      var rowEl = els.doc ? els.doc.querySelector('[data-setting-id="' + esc(settingId) + '"]') : null;
      if (rowEl) {
        rowEl.scrollIntoView({ block: 'center', behavior: 'auto' });
        window.PMSpy.focusFlash(rowEl);
      }
      window.PMShell.status('Opened ' + loc.domainTitle + ' — ' + loc.subTitle + '.');
    });
  }

  /* ==================================================================
     CONSOLES — shared frame
     ================================================================== */

  function renderConsole(managerId) {
    if (managerId === 'crew') { renderCrewConsole(); }
    else if (managerId === 'media') { renderMediaConsole(); }
    else { renderProvidersConsole(); }
  }

  function consoleFrame(opts) {
    var root = el('div', 'c2-console');
    var toolbar = el('div', 'c2-con-toolbar');
    toolbar.appendChild(el('h1', null, opts.title));
    var summary = el('span', 'c2-con-summary');
    summary.appendChild(ico(opts.summaryTone === 'attention' ? 'warning' : 'checkCircle'));
    summary.appendChild(el('span', null, opts.summary));
    toolbar.appendChild(summary);

    var filterWrap = el('div', 'c2-con-filter');
    filterWrap.appendChild(ico('filter'));
    var filter = document.createElement('input');
    filter.type = 'text';
    filter.placeholder = opts.filterPlaceholder || 'Filter';
    filter.setAttribute('aria-label', opts.filterPlaceholder || 'Filter inventory');
    filterWrap.appendChild(filter);
    toolbar.appendChild(filterWrap);

    if (opts.connectLabel) {
      var connect = btn('c2-btn is-primary', null, opts.onConnect);
      connect.appendChild(ico('plus'));
      connect.appendChild(el('span', null, opts.connectLabel));
      toolbar.appendChild(connect);
    }

    var split = el('div', 'c2-con-split');
    var inv = el('div', 'c2-inv');
    inv.setAttribute('role', 'list');
    var inspect = el('div', 'c2-inspect');
    split.appendChild(inv);
    split.appendChild(inspect);
    root.appendChild(toolbar);
    root.appendChild(split);
    els.body.appendChild(root);
    return { root: root, inv: inv, inspect: inspect, filter: filter };
  }

  function invRow(opts) {
    var row = btn('c2-inv-row', null, opts.onSelect);
    row.setAttribute('role', 'listitem');
    if (opts.selected) { row.classList.add('is-selected'); row.setAttribute('aria-current', 'true'); }
    var glyph = ico(opts.icoName, 'c2-inv-glyph');
    glyph.setAttribute('data-tone', opts.tone);
    row.appendChild(glyph);
    var name = el('span', 'c2-inv-name', '');
    name.appendChild(el('span', null, opts.name));
    var word = el('span', 'c2-inv-word', opts.word);
    word.setAttribute('data-tone', opts.tone);
    name.appendChild(word);
    row.appendChild(name);
    row.appendChild(el('span', 'c2-inv-note', opts.note || ''));
    row.setAttribute('data-filter-text', (opts.name + ' ' + (opts.note || '')).toLowerCase());
    return row;
  }

  function wireFilter(filterInput, invEl) {
    filterInput.addEventListener('input', function () {
      var q = filterInput.value.trim().toLowerCase();
      Array.prototype.forEach.call(invEl.querySelectorAll('.c2-inv-row'), function (row) {
        var text = row.getAttribute('data-filter-text') || '';
        row.style.display = (!q || text.indexOf(q) >= 0) ? '' : 'none';
      });
    });
  }

  function kvBlock(pairs) {
    var dl = el('dl', 'c2-kv');
    pairs.forEach(function (p) {
      if (p[1] == null || p[1] === '') { return; }
      dl.appendChild(el('dt', null, p[0]));
      var dd = el('dd', null, String(p[1]));
      if (p[2] === 'attention') { dd.className = 'is-attention'; }
      dl.appendChild(dd);
    });
    return dl;
  }

  function inspectHead(icoName, title) {
    var h = el('h3', null, '');
    h.appendChild(ico(icoName));
    h.appendChild(el('span', null, title));
    return h;
  }

  function closeOpenMenu() {
    if (openMenu) {
      var m = openMenu;
      openMenu = null;
      if (m.node && m.node.parentNode) { m.node.parentNode.removeChild(m.node); }
      if (m.trigger) { m.trigger.setAttribute('aria-expanded', 'false'); }
    }
  }

  /* ==================================================================
     PROVIDERS & MODELS console
     ================================================================== */

  function renderProvidersConsole() {
    var ps = providersSummary();
    var frame = consoleFrame({
      title: 'Providers & Models',
      summary: ps.ready + ' of ' + ps.total + ' ready' + (ps.attention ? ' · ' + ps.attention + ' need attention' : ''),
      summaryTone: ps.attention > 0 ? 'attention' : 'ok',
      filterPlaceholder: 'Filter providers',
      connectLabel: 'Connect',
      onConnect: function (e) { openConnectMenu(e.currentTarget); }
    });

    var order = ['tool', 'account', 'api', 'server', 'free'];
    var byGroup = {};
    arr(data().providers).forEach(function (p) {
      (byGroup[p.groupKind] = byGroup[p.groupKind] || []).push(p);
    });
    order.forEach(function (g) {
      if (!byGroup[g]) { return; }
      frame.inv.appendChild(el('div', 'c2-inv-group', GROUP_TITLES[g] || g));
      byGroup[g].forEach(function (p) {
        var st = PROVIDER_STATUS[p.status] || PROVIDER_STATUS.ready;
        frame.inv.appendChild(invRow({
          icoName: st.ico,
          tone: st.tone === 'muted' ? 'ok' : st.tone,
          name: p.name,
          word: st.word,
          note: p.statusNote || '',
          selected: view.sel.providers === p.id,
          onSelect: function () {
            view.sel.providers = p.id;
            view.freeSetup = null;
            persistView();
            renderAll();
          }
        }));
      });
    });

    /* role assignments panel below inventory */
    var rolesDisc = disclosure({ label: 'Role assignments', icoName: 'masks', kind: 'roles' });
    rolesDisc.root.classList.add('c2-roles');
    arr(data().roles).forEach(function (role) {
      rolesDisc.body.appendChild(renderRole(role));
    });
    frame.inv.appendChild(rolesDisc.root);

    wireFilter(frame.filter, frame.inv);

    var p = providerById(view.sel.providers) || arr(data().providers)[0];
    if (p) { renderProviderInspector(frame.inspect, p); }
    else { frame.inspect.appendChild(el('div', 'c2-inspect-empty', 'Select a provider to inspect it.')); }
  }

  function openConnectMenu(trigger) {
    closeOpenMenu();
    var menu = el('div', 'c2-menu');
    menu.style.position = 'absolute';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Connect');
    var options = [
      { label: 'Sign in through an installed CLI', detail: 'The CLI owns the login; PM verifies readiness.' },
      { label: 'Sign in directly through PM', detail: 'PM-direct sign-in for providers that support it.' },
      { label: 'Add an API key', detail: 'Stored in the system keychain.' },
      { label: 'Add a local or remote server', detail: 'Point PM at an inference endpoint.' }
    ];
    options.forEach(function (o) {
      var item = btn('c2-radio', null, function () {
        closeOpenMenu();
        window.PMState.receipt(o.label, o.detail + ' The real flow is out of scope for this demo.');
      });
      item.setAttribute('role', 'menuitem');
      item.appendChild(ico('plus'));
      item.appendChild(el('span', null, o.label));
      menu.appendChild(item);
    });
    trigger.parentNode.style.position = 'relative';
    trigger.setAttribute('aria-expanded', 'true');
    trigger.parentNode.appendChild(menu);
    openMenu = { node: menu, trigger: trigger };
    var first = menu.querySelector('button');
    if (first) { first.focus(); }
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeOpenMenu(); trigger.focus(); }
    });
  }

  function renderRole(role) {
    var card = el('div', 'c2-role');
    var head = el('div', 'c2-role-head');
    if (role.lockedHigh) { head.appendChild(ico('lock')); }
    head.appendChild(el('span', null, role.label));
    var q = el('span', 'c2-inv-word', role.quality === 'high' ? 'High quality' : 'Standard');
    q.setAttribute('data-tone', role.quality === 'high' ? 'ok' : 'setup');
    head.appendChild(q);
    card.appendChild(head);
    card.appendChild(el('div', 'c2-role-route', 'Route: ' + role.assignedRoute));
    if (role.note) { card.appendChild(el('div', 'c2-role-note', role.note)); }
    if (role.lockedHigh) {
      card.appendChild(btn('c2-btn is-quiet', 'Request a qualified override', function () {
        window.PMState.receipt('Request a qualified override for ' + role.label,
          'PM never silently downgrades this role; an explicit qualified override flow would open here.');
      }));
    } else {
      card.appendChild(btn('c2-btn is-quiet', 'Change route', function () {
        window.PMState.receipt('Change route for ' + role.label,
          'A qualified route picker (favorites first, with capability evidence) would open here.');
      }));
    }
    return card;
  }

  function renderProviderInspector(inspect, p) {
    clear(inspect);
    var st = PROVIDER_STATUS[p.status] || PROVIDER_STATUS.ready;

    var h2 = el('h2', null, p.name);
    var fam = el('span', 'c2-tag', p.family || '');
    h2.appendChild(fam);
    var word = el('span', 'c2-inv-word', st.word);
    word.setAttribute('data-tone', st.tone === 'muted' ? 'ok' : st.tone);
    h2.appendChild(word);
    inspect.appendChild(h2);
    if (p.statusNote) { inspect.appendChild(el('p', 'c2-inspect-sub', p.statusNote)); }

    /* two-step status: authenticated is not ready */
    var steps = el('div', 'c2-steps');
    var s1, s2;
    if (p.status === 'not-installed') {
      s1 = { state: 'blocked', label: 'Signed in', note: 'Install the tool first' };
      s2 = { state: 'blocked', label: 'Ready to run models', note: 'Blocked until install and sign-in' };
    } else if (p.status === 'signed-out') {
      s1 = { state: 'fail', label: 'Signed in', note: 'Signed out — sign in to continue' };
      s2 = { state: 'blocked', label: 'Ready to run models', note: 'Blocked until sign-in' };
    } else if (p.status === 'auth-no-invoke') {
      s1 = { state: 'pass', label: 'Signed in', note: 'Authentication succeeds' };
      s2 = { state: 'fail', label: 'Ready to run models', note: 'Last invocation was rejected' };
    } else if (p.status === 'refreshing') {
      s1 = { state: 'pass', label: 'Signed in', note: 'Authentication succeeds' };
      s2 = { state: 'blocked', label: 'Ready to run models', note: 'Checking the catalog now' };
    } else {
      s1 = { state: 'pass', label: 'Signed in', note: 'Authentication succeeds' };
      s2 = { state: 'pass', label: 'Ready to run models', note: p.status === 'degraded' ? 'Responding, but degraded' : 'A test invocation succeeded' };
    }
    [s1, s2].forEach(function (sdef, i) {
      var step = el('div', 'c2-step');
      step.setAttribute('data-state', sdef.state);
      step.appendChild(ico(sdef.state === 'pass' ? 'checkCircle' : (sdef.state === 'fail' ? 'close' : 'clock')));
      var t = el('span', null, (i + 1) + '. ' + sdef.label);
      t.appendChild(el('small', null, sdef.note));
      step.appendChild(t);
      steps.appendChild(step);
    });
    steps.appendChild(el('span', 'c2-steps-note', 'Signed in is not the same as ready — both checks must pass before PM routes work here.'));
    inspect.appendChild(steps);

    var stepActions = el('div', 'c2-notice-actions');
    if (p.status === 'not-installed') {
      stepActions.appendChild(btn('c2-btn is-primary', 'Install ' + p.name, function () {
        window.PMState.receipt('Install ' + p.name, 'The installer flow is out of scope for this demo.');
      }));
    }
    if (p.status === 'signed-out') {
      stepActions.appendChild(btn('c2-btn is-primary', 'Sign in again', function () {
        window.PMState.trigger('reconnect', p.id);
        window.PMShell.status('Reconnecting ' + p.name + '…');
      }));
    }
    if (p.status !== 'not-installed') {
      stepActions.appendChild(btn('c2-btn', 'Run invocation test', function () {
        window.PMState.trigger('invoke-test', p.id);
        window.PMShell.status('Running a short invocation test on ' + p.name + '…');
      }));
    }
    if (p.status === 'degraded' || p.status === 'auth-no-invoke') {
      stepActions.appendChild(btn('c2-btn', 'Reconnect', function () {
        window.PMState.trigger('reconnect', p.id);
      }));
    }
    inspect.appendChild(stepActions);

    /* at-a-glance answers */
    var ab = p.defaultAnswerBlock;
    if (ab) {
      inspect.appendChild(inspectHead('info', 'At a glance'));
      inspect.appendChild(kvBlock([
        ['Connected', ab.connected ? 'Yes' : 'No'],
        ['Account in use', ab.accountInUse],
        ['Billing route', ab.billingRoute],
        ['Remaining', ab.remaining],
        ['When it runs out', ab.onExhaust],
        ['Models available', ab.modelsAvail],
        ['Attention', ab.attention || 'Nothing needs attention', ab.attention ? 'attention' : null]
      ]));
    }

    /* connections + isolation model */
    if (arr(p.connections).length > 0 || p.oauthNote) {
      inspect.appendChild(inspectHead('plug', 'Connections & isolation'));
      if (p.oauthNote) {
        var oauth = el('div', 'c2-caution');
        oauth.style.borderColor = 'var(--border)';
        oauth.appendChild(ico('key'));
        oauth.appendChild(el('div', null, p.oauthNote));
        inspect.appendChild(oauth);
      }
      arr(p.connections).forEach(function (c) {
        var conn = el('div', 'c2-freeroute');
        var kind = el('span', 'c2-qualifier', c.kind === 'cli' ? 'CLI-owned' : (c.kind === 'api' ? 'API' : c.kind));
        conn.appendChild(kind);
        var body = el('span', null, '');
        body.appendChild(el('span', 'c2-freeroute-model', c.route));
        if (c.note) { body.appendChild(el('div', 'c2-prose-hint', c.note)); }
        conn.appendChild(body);
        inspect.appendChild(conn);
      });
    }

    /* accounts */
    if (arr(p.accounts).length > 0) {
      inspect.appendChild(inspectHead('users', 'Accounts (' + p.accounts.length + ')'));
      var accounts = el('div', 'c2-accounts');
      arr(p.accounts).forEach(function (a) {
        accounts.appendChild(renderAccountCard(p, a));
      });
      inspect.appendChild(accounts);
    }

    /* models + catalog */
    inspect.appendChild(inspectHead('layers', 'Models'));
    var refreshing = p.catalog && p.catalog.state === 'refreshing';
    var catalog = el('div', 'c2-catalog');
    if (p.catalog) {
      catalog.appendChild(el('span', null, 'Catalog checked ' + fmtWhen(p.catalog.lastChecked) +
        (p.catalog.sourceVersion ? ' · ' + p.catalog.sourceVersion : '')));
      if (p.catalog.state === 'stale') { catalog.appendChild(el('span', null, '· Stale — refresh recommended')); }
      if (refreshing) {
        var badge = el('span', 'c2-refresh-badge');
        badge.appendChild(ico('refresh'));
        badge.appendChild(el('span', null, 'Refreshing — showing last known good'));
        catalog.appendChild(badge);
      }
      if (p.catalog.state === 'quarantined') {
        var qBadge = el('span', 'c2-quarantine-badge');
        qBadge.appendChild(ico('warning'));
        qBadge.appendChild(el('span', null, p.catalog.lastKnownGood
          ? 'Quarantined — serving the last known good catalog'
          : 'Quarantined'));
        catalog.appendChild(qBadge);
      }
    }
    var refreshBtn = btn('c2-btn', refreshing ? 'Refreshing…' : 'Refresh catalog', function () {
      window.PMState.trigger('catalog-refresh', p.id);
      window.PMShell.status('Refreshing the ' + p.name + ' model catalog. Existing rows stay usable.');
    });
    refreshBtn.disabled = !!refreshing;
    catalog.appendChild(refreshBtn);
    inspect.appendChild(catalog);
    if (p.catalog && p.catalog.state === 'quarantined' && p.catalog.quarantineReason) {
      inspect.appendChild(el('p', 'c2-usage-note', p.catalog.quarantineReason));
    }
    var catChanges = arr(p.catalog && p.catalog.materialChanges);
    var catRemoved = arr(p.catalog && p.catalog.removedHistory);
    if (catChanges.length + catRemoved.length > 0) {
      var chDisc = disclosure({
        label: 'Catalog changes (' + (catChanges.length + catRemoved.length) + ')',
        icoName: 'clock',
        kind: 'advanced'
      });
      catChanges.forEach(function (ch) {
        ch = ch || {};
        var line = el('div', 'c2-cat-change');
        line.appendChild(el('strong', null, ch.at ? fmtWhen(ch.at) : 'Recently'));
        line.appendChild(el('span', null,
          (ch.what || 'Catalog entry updated') + (ch.effect ? ' — ' + ch.effect : '')));
        chDisc.body.appendChild(line);
      });
      catRemoved.forEach(function (rh) {
        rh = rh || {};
        var word = rh.change === 'no-longer-free' ? 'No longer free' : 'Removed';
        var line = el('div', 'c2-cat-change');
        line.appendChild(el('strong', null, rh.at ? fmtWhen(rh.at) : 'Recently'));
        line.appendChild(el('span', null,
          (rh.model || 'A model') + ' — ' + word + (rh.note ? '. ' + rh.note : '')));
        chDisc.body.appendChild(line);
      });
      inspect.appendChild(chDisc.root);
    }

    var models = el('div', 'c2-models');
    if (refreshing) { models.classList.add('c2-shimmer'); } /* only the refreshing region shimmers */
    if (arr(p.models).length === 0) {
      models.appendChild(el('div', 'c2-inspect-empty', p.status === 'not-installed'
        ? 'No models yet. Install ' + p.name + ' and sign in to discover its catalog.'
        : 'No models discovered for this connection yet.'));
    }
    arr(p.models).forEach(function (m) {
      models.appendChild(renderModelRow(p, m));
    });
    inspect.appendChild(models);

    /* free routes on this connection */
    var routes = arr(data().freeRoutes).filter(function (fr) { return fr.underlyingProviderId === p.id; });
    if (routes.length > 0) {
      inspect.appendChild(inspectHead('sparkle', 'Free routes on this connection'));
      var frWrap = el('div', 'c2-freeroutes');
      routes.forEach(function (fr) {
        frWrap.appendChild(renderFreeRoute(p, fr));
      });
      inspect.appendChild(frWrap);
      if (view.freeSetup && routes.some(function (fr) { return fr.id === view.freeSetup.routeId; })) {
        inspect.appendChild(renderFreeSetup(p, routes.filter(function (fr) { return fr.id === view.freeSetup.routeId; })[0]));
      }
    }

    /* usage snapshot (read-only) */
    var snap = data().usageSnapshot && data().usageSnapshot.perProvider
      ? data().usageSnapshot.perProvider[p.id] : null;
    if (snap) {
      inspect.appendChild(inspectHead('gauge', 'Usage snapshot'));
      inspect.appendChild(el('p', 'c2-usage-note',
        (data().usageSnapshot.note || 'Read-only snapshot.') + (snap.freshness ? ' Freshness: ' + snap.freshness + '.' : '')));
      inspect.appendChild(kvBlock([
        ['Included remaining', snap.includedRemaining],
        ['Extra balance', snap.extra],
        ['Resets', snap.resetAt ? fmtWhen(snap.resetAt) : 'No scheduled reset'],
        ['Pressure', PRESSURE_WORD[snap.pressure] || snap.pressure, (snap.pressure === 'high' || snap.pressure === 'exhausted') ? 'attention' : null],
        ['Projection', snap.projection]
      ]));
      var openUsage = btn('c2-btn', null, function () {
        window.PMState.receipt('Open the Usage page', 'Deep link to Usage focused on ' + p.name + '.');
      });
      openUsage.appendChild(ico('external'));
      openUsage.appendChild(el('span', null, 'Open the Usage page'));
      inspect.appendChild(openUsage);
    }

    /* what happens next: only provider-supported options */
    var nexts = arr(p.whatNext);
    if (nexts.length > 0) {
      inspect.appendChild(inspectHead('arrowR', 'When included usage runs out'));
      inspect.appendChild(el('p', 'c2-usage-note',
        'Only choices this provider actually supports. This is a per-provider policy, never a universal budget switch.'));
      var saved = store.get('whatNext.' + p.id);
      var group = el('div', 'c2-whatnext');
      group.setAttribute('role', 'radiogroup');
      group.setAttribute('aria-label', 'When included usage runs out on ' + p.name);
      nexts.forEach(function (key) {
        var lab = WHAT_NEXT[key] || key;
        var r = btn('c2-radio', null, function () {
          store.set('whatNext.' + p.id, key);
          window.PMShell.status(p.name + ': when included usage runs out, PM will ' + lab.toLowerCase() + '.');
          Array.prototype.forEach.call(group.querySelectorAll('.c2-radio'), function (x) {
            x.setAttribute('aria-checked', String(x === r));
          });
        });
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', String(saved === key));
        r.appendChild(el('span', 'c2-radio-dot'));
        r.appendChild(el('span', null, lab));
        group.appendChild(r);
      });
      inspect.appendChild(group);
    }
  }

  function renderAccountCard(p, a) {
    var card = el('div', 'c2-account');
    var head = el('div', 'c2-account-head');
    var nick = el('span', 'c2-account-nick', a.nickname || a.id);
    head.appendChild(nick);
    var editNick = btn('c2-iconbtn', null, function () {
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'c2-input';
      input.value = a.nickname || '';
      input.setAttribute('aria-label', 'Account nickname');
      nick.replaceWith(input);
      input.focus();
      var done = function () {
        if (input.value.trim() !== '') { a.nickname = input.value.trim(); }
        window.PMShell.status('Nickname saved.');
        renderAll();
      };
      input.addEventListener('blur', done);
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { input.blur(); }
        if (ev.key === 'Escape') { input.removeEventListener('blur', done); renderAll(); }
      });
    });
    editNick.setAttribute('aria-label', 'Edit nickname for ' + (a.nickname || a.id));
    editNick.appendChild(ico('edit'));
    head.appendChild(editNick);
    head.appendChild(el('span', 'c2-account-id', a.identity || ''));
    var hw = HEALTH_WORD[a.health] || HEALTH_WORD.unknown;
    head.appendChild(statusWord(hw.tone === 'ok' ? 'ok' : (hw.tone === 'attention' ? 'attention' : 'muted'), hw.word));
    card.appendChild(head);

    var tags = el('div', 'c2-account-tags');
    var owner = el('span', 'c2-tag');
    owner.appendChild(ico('key'));
    owner.appendChild(el('span', null, AUTH_OWNER[a.authOwner] || 'Credentials'));
    tags.appendChild(owner);
    var iso = el('span', 'c2-tag');
    iso.appendChild(ico('shield'));
    iso.appendChild(el('span', null, 'Isolation: ' + (ISOLATION[a.isolation] || 'Unspecified')));
    tags.appendChild(iso);
    card.appendChild(tags);

    var controls = el('div', 'c2-account-controls');

    var enabledCtl = el('span', 'c2-ctl');
    var enabledToggle = el('button', 'c2-toggle');
    enabledToggle.type = 'button';
    enabledToggle.setAttribute('role', 'switch');
    enabledToggle.setAttribute('aria-checked', String(!!a.enabled));
    enabledToggle.setAttribute('aria-label', 'Enable ' + (a.nickname || a.id));
    enabledToggle.addEventListener('click', function () {
      a.enabled = !a.enabled;
      window.PMShell.status((a.nickname || a.id) + (a.enabled ? ' enabled.' : ' disabled.') + ' Applies to future requests only.');
      renderAll();
    });
    enabledCtl.appendChild(enabledToggle);
    enabledCtl.appendChild(el('span', null, 'Enabled'));
    controls.appendChild(enabledCtl);

    var prio = el('span', 'c2-ctl');
    prio.appendChild(el('span', null, 'Priority'));
    var stepper = el('span', 'c2-stepper');
    var down = btn(null, null, function () { a.priority = (a.priority || 1) + 1; renderAll(); });
    down.setAttribute('aria-label', 'Lower priority of ' + (a.nickname || a.id));
    down.appendChild(ico('minus'));
    var val = el('span', 'c2-stepper-val', String(a.priority || 1));
    var up = btn(null, null, function () { a.priority = Math.max(1, (a.priority || 1) - 1); renderAll(); });
    up.setAttribute('aria-label', 'Raise priority of ' + (a.nickname || a.id));
    up.appendChild(ico('plus'));
    stepper.appendChild(down);
    stepper.appendChild(val);
    stepper.appendChild(up);
    prio.appendChild(stepper);
    controls.appendChild(prio);

    var useNext = btn('c2-radio', null, function () {
      arr(p.accounts).forEach(function (x) { x.useNext = (x === a); });
      window.PMState.receipt('Switch account',
        'Future simulated requests on ' + p.name + ' prefer ' + (a.nickname || a.id) + '. Running work keeps its current account.');
      renderAll();
    });
    useNext.setAttribute('role', 'radio');
    useNext.setAttribute('aria-checked', String(!!a.useNext));
    useNext.appendChild(el('span', 'c2-radio-dot'));
    useNext.appendChild(el('span', null, 'Use next'));
    controls.appendChild(useNext);

    var stickyCtl = el('span', 'c2-ctl');
    var sticky = el('button', 'c2-toggle');
    sticky.type = 'button';
    sticky.setAttribute('role', 'switch');
    sticky.setAttribute('aria-checked', String(!!a.sticky));
    sticky.setAttribute('aria-label', 'Sticky thread affinity for ' + (a.nickname || a.id));
    sticky.addEventListener('click', function () {
      a.sticky = !a.sticky;
      window.PMShell.status('Sticky thread affinity ' + (a.sticky ? 'on' : 'off') + ' for ' + (a.nickname || a.id) + '.');
      renderAll();
    });
    stickyCtl.appendChild(sticky);
    stickyCtl.appendChild(el('span', null, 'Sticky'));
    controls.appendChild(stickyCtl);

    card.appendChild(controls);

    /* mini-actions: repair + logs (receipt-backed where the real flow
       cannot run in the demo) */
    var mini = el('div', 'c2-account-mini');
    var accountName = a.nickname || a.identity || a.id || 'this account';
    var repair = btn('c2-btn is-quiet', null, function () {
      window.PMState.receipt('Repair ' + accountName,
        'Guided repair re-checks stored credentials, isolation, and runs a short test invocation. The real repair flow is out of scope for this demo.');
    });
    repair.appendChild(ico('wrench'));
    repair.appendChild(el('span', null, 'Repair'));
    mini.appendChild(repair);

    var logsDrawer = el('div', 'c2-account-logs');
    logsDrawer.hidden = true;
    var logsBtn = btn('c2-btn is-quiet', null, function () {
      logsDrawer.hidden = !logsDrawer.hidden;
      logsBtn.setAttribute('aria-expanded', String(!logsDrawer.hidden));
    });
    logsBtn.setAttribute('aria-expanded', 'false');
    logsBtn.appendChild(ico('terminal'));
    logsBtn.appendChild(el('span', null, 'View logs'));
    mini.appendChild(logsBtn);

    var logLines = [];
    logLines.push('Health: ' + hw.word);
    if (a.lastCatalogRefresh) { logLines.push('Catalog refreshed ' + fmtWhen(a.lastCatalogRefresh)); }
    if (a.usage && a.usage.lastUse) { logLines.push('Last used ' + fmtWhen(a.usage.lastUse)); }
    logLines.forEach(function (line) {
      logsDrawer.appendChild(el('div', 'c2-account-log-line', line));
    });
    logsDrawer.appendChild(el('div', 'c2-account-log-note',
      'Recent summary only. The full log lives outside this panel.'));
    var openLog = btn('c2-btn is-quiet', null, function () {
      window.PMState.receipt('Open the full log for ' + accountName,
        'Opens the account log file in your log viewer. Out of scope for this demo.');
    });
    openLog.appendChild(ico('external'));
    openLog.appendChild(el('span', null, 'Open the full log'));
    logsDrawer.appendChild(openLog);

    card.appendChild(mini);
    card.appendChild(logsDrawer);

    if (a.usage) {
      var usage = el('div', 'c2-account-usage');
      var pr = el('span', 'c2-pressure');
      pr.setAttribute('data-level', a.usage.pressure || 'none');
      pr.appendChild(ico('gauge'));
      pr.appendChild(el('span', null, 'Pressure: ' + (PRESSURE_WORD[a.usage.pressure] || 'None')));
      usage.appendChild(pr);
      usage.appendChild(el('div', null, 'Included: ' + (a.usage.includedRemaining || 'Unknown') +
        ' · Extra: ' + (a.usage.extra || 'None')));
      usage.appendChild(el('div', null, 'Resets ' + fmtWhen(a.usage.resetAt) +
        ' · Last used ' + fmtWhen(a.usage.lastUse)));
      if (a.projection) {
        var proj = el('div', null, '');
        proj.appendChild(el('strong', null, 'Projection: '));
        proj.appendChild(document.createTextNode(a.projection));
        usage.appendChild(proj);
      }
      card.appendChild(usage);
    }
    return card;
  }

  function modelPrefs(mId) {
    var all = store.get('modelPrefs') || {};
    return all[mId] || {};
  }
  function setModelPref(mId, key, val) {
    var all = store.get('modelPrefs') || {};
    var cur = all[mId] || {};
    cur[key] = val;
    all[mId] = cur;
    store.set('modelPrefs', all);
  }

  function renderModelRow(p, m) {
    var row = el('div', 'c2-model');
    row.setAttribute('data-model-id', m.id);
    if (m.unavailableReason) { row.setAttribute('data-unavailable', '1'); }

    var fav = btn('c2-model-fav', null, function () {
      m.fav = !m.fav;
      window.PMShell.status((m.fav ? 'Favorited ' : 'Unfavorited ') + m.name + '.');
      renderAll();
    });
    fav.setAttribute('aria-pressed', String(!!m.fav));
    fav.setAttribute('aria-label', (m.fav ? 'Unfavorite ' : 'Favorite ') + m.name);
    fav.appendChild(ico(m.fav ? 'starFill' : 'star'));
    row.appendChild(fav);

    var name = el('div', 'c2-model-name');
    name.appendChild(el('span', null, m.name));
    if (m.alias) { name.appendChild(el('span', 'c2-model-alias', '"' + m.alias + '"')); }
    if (m.hidden) {
      var hiddenWord = el('span', 'c2-inv-word', 'Hidden');
      name.appendChild(hiddenWord);
    }
    row.appendChild(name);

    var meta = el('div', 'c2-model-meta');
    if (m.ctx) { meta.appendChild(el('span', null, Math.round(m.ctx / 1000) + 'k context')); }
    if (arr(m.modalities).length) { meta.appendChild(el('span', null, arr(m.modalities).join(' · ').replace(/image-in/g, 'image in').replace(/audio-in/g, 'audio in'))); }
    meta.appendChild(el('span', null, 'Priority ' + (m.priority || 1)));
    var prefs = modelPrefs(m.id);
    if (arr(m.effort).length && prefs.effort) {
      meta.appendChild(el('span', null, 'Effort: ' + prefs.effort.charAt(0).toUpperCase() + prefs.effort.slice(1)));
    }
    if (m.fast === true && prefs.speed) {
      meta.appendChild(el('span', null, 'Speed: ' + prefs.speed));
    }
    row.appendChild(meta);

    var extra = el('div', 'c2-model-extra');
    if (m.unavailableReason) {
      var reason = el('div', 'c2-unavail-reason', '');
      reason.appendChild(document.createTextNode('Unavailable — ' + m.unavailableReason));
      extra.appendChild(reason);
    }
    if (m.requested && m.effectiveRoute) {
      var diff = el('div', null, '');
      var chip = el('span', 'pm-chip-value', 'Requested here');
      chip.setAttribute('data-kind', 'differs');
      diff.appendChild(chip);
      diff.appendChild(document.createTextNode(' Currently running as ' + m.effectiveRoute + '.'));
      extra.appendChild(diff);
    }

    /* capability evidence disclosure */
    if (arr(m.evidence).length > 0) {
      var evBtn = btn('c2-btn is-quiet', 'Capability evidence (' + m.evidence.length + ')', null);
      evBtn.setAttribute('aria-expanded', 'false');
      var evBody = el('div', 'c2-evidence');
      evBody.hidden = true;
      arr(m.evidence).forEach(function (ev) {
        var evRow = el('div', 'c2-evidence-row');
        evRow.appendChild(el('span', 'c2-evidence-cap', humanCap(ev.cap)));
        var stateSpan = el('span', 'c2-evidence-state', EVIDENCE_STATE[ev.state] || ev.state);
        stateSpan.setAttribute('data-state', ev.state);
        evRow.appendChild(stateSpan);
        evRow.appendChild(el('span', 'c2-evidence-src', ev.source + ' · ' + fmtWhen(ev.at)));
        evBody.appendChild(evRow);
      });
      evBtn.addEventListener('click', function () {
        evBody.hidden = !evBody.hidden;
        evBtn.setAttribute('aria-expanded', String(!evBody.hidden));
      });
      extra.appendChild(evBtn);
      extra.appendChild(evBody);
    }
    row.appendChild(extra);

    var actions = el('div', 'c2-model-actions');

    /* effort + Normal/Fast menu ONLY when the data says supported */
    var hasEffort = arr(m.effort).length > 0;
    var hasFast = m.fast === true;
    if (hasEffort || hasFast) {
      var menuBtn = btn('c2-iconbtn', null, function () { toggleEffortMenu(row, m, menuBtn); });
      menuBtn.setAttribute('aria-label', 'Effort and speed for ' + m.name);
      menuBtn.setAttribute('aria-haspopup', 'dialog');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.appendChild(ico('bolt'));
      actions.appendChild(menuBtn);
    }

    var aliasBtn = btn('c2-iconbtn', null, function () {
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'c2-input';
      input.value = m.alias || '';
      input.placeholder = 'Alias';
      input.setAttribute('aria-label', 'Alias for ' + m.name);
      name.appendChild(input);
      input.focus();
      var done = function () {
        m.alias = input.value.trim();
        window.PMShell.status(m.alias ? 'Alias saved for ' + m.name + '.' : 'Alias cleared for ' + m.name + '.');
        renderAll();
      };
      input.addEventListener('blur', done);
      input.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { input.blur(); }
        if (ev.key === 'Escape') { input.removeEventListener('blur', done); renderAll(); }
      });
    });
    aliasBtn.setAttribute('aria-label', 'Edit alias for ' + m.name);
    aliasBtn.appendChild(ico('edit'));
    actions.appendChild(aliasBtn);

    var upBtn = btn('c2-iconbtn', null, function () {
      m.priority = Math.max(1, (m.priority || 1) - 1);
      window.PMShell.status(m.name + ' priority raised to ' + m.priority + '.');
      renderAll();
    });
    upBtn.setAttribute('aria-label', 'Raise priority of ' + m.name);
    upBtn.appendChild(ico('chevU'));
    actions.appendChild(upBtn);

    var downBtn = btn('c2-iconbtn', null, function () {
      m.priority = (m.priority || 1) + 1;
      window.PMShell.status(m.name + ' priority lowered to ' + m.priority + '.');
      renderAll();
    });
    downBtn.setAttribute('aria-label', 'Lower priority of ' + m.name);
    downBtn.appendChild(ico('chevD'));
    actions.appendChild(downBtn);

    var hideBtn = btn('c2-iconbtn', null, function () {
      m.hidden = !m.hidden;
      window.PMShell.status((m.hidden ? 'Hid ' : 'Unhid ') + m.name + ' from pickers.');
      renderAll();
    });
    hideBtn.setAttribute('aria-pressed', String(!!m.hidden));
    hideBtn.setAttribute('aria-label', (m.hidden ? 'Unhide ' : 'Hide ') + m.name);
    hideBtn.appendChild(ico(m.hidden ? 'eyeOff' : 'eye'));
    actions.appendChild(hideBtn);

    row.appendChild(actions);
    return row;
  }

  function humanCap(cap) {
    var names = {
      'tool-use': 'Tool use', 'image-in': 'Image input', 'image-gen': 'Image generation',
      'audio-in': 'Audio input', 'audio-out': 'Audio output', 'video': 'Video',
      'long-context': 'Long context', 'json-mode': 'Structured output', 'vision': 'Vision'
    };
    return names[cap] || String(cap).replace(/-/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); });
  }

  function toggleEffortMenu(row, m, trigger) {
    if (openMenu && openMenu.trigger === trigger) { closeOpenMenu(); return; }
    closeOpenMenu();
    var menu = el('div', 'c2-menu');
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Effort and speed for ' + m.name);

    /* the menu stays open through BOTH choices; Done or Esc closes */
    if (arr(m.effort).length > 0) {
      menu.appendChild(el('h4', null, 'Effort'));
      var eGroup = el('div', 'c2-radiogroup');
      eGroup.setAttribute('role', 'radiogroup');
      eGroup.setAttribute('aria-label', 'Effort');
      var current = modelPrefs(m.id).effort || m.effort[Math.min(1, m.effort.length - 1)];
      m.effort.forEach(function (level) {
        var lab = level.charAt(0).toUpperCase() + level.slice(1);
        var r = btn('c2-radio', null, function () {
          setModelPref(m.id, 'effort', level);
          window.PMShell.status(m.name + ' effort set to ' + lab + '.');
          Array.prototype.forEach.call(eGroup.querySelectorAll('.c2-radio'), function (x) {
            x.setAttribute('aria-checked', String(x === r));
          });
          /* menu deliberately stays open */
        });
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', String(current === level));
        r.appendChild(el('span', 'c2-radio-dot'));
        r.appendChild(el('span', null, lab));
        eGroup.appendChild(r);
      });
      menu.appendChild(eGroup);
    }

    if (m.fast === true) {
      menu.appendChild(el('h4', null, 'Speed'));
      var sGroup = el('div', 'c2-radiogroup');
      sGroup.setAttribute('role', 'radiogroup');
      sGroup.setAttribute('aria-label', 'Speed');
      var curSpeed = modelPrefs(m.id).speed || 'Normal';
      ['Normal', 'Fast'].forEach(function (speed) {
        var r = btn('c2-radio', null, function () {
          setModelPref(m.id, 'speed', speed);
          window.PMShell.status(m.name + ' speed set to ' + speed + '.');
          Array.prototype.forEach.call(sGroup.querySelectorAll('.c2-radio'), function (x) {
            x.setAttribute('aria-checked', String(x === r));
          });
          /* menu deliberately stays open */
        });
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', String(curSpeed === speed));
        r.appendChild(el('span', 'c2-radio-dot'));
        r.appendChild(el('span', null, speed));
        sGroup.appendChild(r);
      });
      menu.appendChild(sGroup);
    }

    var doneWrap = el('div', 'c2-menu-done');
    doneWrap.appendChild(btn('c2-btn is-primary', 'Done', function () {
      closeOpenMenu();
      trigger.focus();
      renderAll(); /* reflect the new effort/speed summary in the row */
    }));
    menu.appendChild(doneWrap);

    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeOpenMenu();
        trigger.focus();
        renderAll();
      }
    });

    row.appendChild(menu);
    trigger.setAttribute('aria-expanded', 'true');
    openMenu = { node: menu, trigger: trigger };
    var first = menu.querySelector('.c2-radio[aria-checked="true"]') || menu.querySelector('.c2-radio, button');
    if (first) { first.focus(); }
  }

  function modelNameById(id) {
    var found = null;
    arr(data().providers).forEach(function (p) {
      arr(p.models).forEach(function (m) { if (m.id === id) { found = m.name; } });
    });
    return found || id;
  }

  function renderFreeRoute(p, fr) {
    var row = el('div', 'c2-freeroute');
    row.appendChild(el('span', 'c2-freeroute-model', modelNameById(fr.modelRef)));
    /* never an unqualified Free badge: the qualifier is the badge */
    var q = el('span', 'c2-qualifier', 'Free · ' + (QUALIFIER[fr.qualifier] || fr.qualifier));
    row.appendChild(q);
    var steps = arr(fr.setupSteps);
    var needsSetup = fr.qualifier === 'account-required' || fr.qualifier === 'subscription-included' ||
      (steps.length > 1);
    var open = btn('c2-btn' + (needsSetup ? ' is-primary' : ''), needsSetup ? 'Set up' : 'Details', function () {
      view.freeSetup = { routeId: fr.id, step: 0 };
      renderAll();
    });
    row.appendChild(open);
    return row;
  }

  function renderFreeSetup(p, fr) {
    var panel = el('div', 'c2-setup');
    panel.setAttribute('data-free-setup', fr.id);
    panel.appendChild(el('h4', null, 'Set up: ' + modelNameById(fr.modelRef)));
    panel.appendChild(el('p', null,
      'PM owns this stepped setup on the underlying ' + p.name + ' connection. ' +
      'Qualifier: ' + (QUALIFIER[fr.qualifier] || fr.qualifier) + '.'));
    var steps = arr(fr.setupSteps);
    var cur = view.freeSetup.step || 0;
    steps.forEach(function (stepDef, i) {
      var stepEl = el('div', 'c2-setup-step');
      stepEl.setAttribute('data-state', i < cur ? 'done' : (i === cur ? 'current' : 'pending'));
      var num = el('span', 'c2-setup-num', '');
      if (i < cur) { num.appendChild(ico('check')); } else { num.textContent = String(i + 1); }
      stepEl.appendChild(num);
      var body = el('div', null);
      body.appendChild(el('h5', null, stepDef.title));
      body.appendChild(el('p', null, stepDef.body));
      stepEl.appendChild(body);
      panel.appendChild(stepEl);
    });
    var foot = el('div', 'c2-setup-foot');
    if (cur > 0) {
      foot.appendChild(btn('c2-btn', 'Back', function () {
        view.freeSetup.step = cur - 1;
        renderAll();
      }));
    }
    if (cur < steps.length) {
      foot.appendChild(btn('c2-btn is-primary', cur === steps.length - 1 ? 'Finish (simulated)' : 'Mark step done (simulated)', function () {
        window.PMState.receipt(steps[cur].title, 'Marked done in the demo; the real step runs outside PM or in the keychain flow.');
        view.freeSetup.step = cur + 1;
        renderAll();
      }));
    } else {
      foot.appendChild(btn('c2-btn is-primary', 'Return to the model row', function () {
        view.freeSetup = null;
        renderAll();
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            var rowEl = els.body.querySelector('[data-model-id="' + esc(fr.modelRef) + '"]');
            if (rowEl) {
              rowEl.scrollIntoView({ block: 'center', behavior: 'auto' });
              window.PMSpy.focusFlash(rowEl);
            }
          });
        });
      }));
    }
    foot.appendChild(btn('c2-btn is-quiet', 'Close', function () {
      view.freeSetup = null;
      renderAll();
    }));
    panel.appendChild(foot);
    return panel;
  }

  /* ==================================================================
     CREW console
     ================================================================== */

  function renderCrewConsole() {
    var crews = arr(data().crew);
    var queued = 0;
    crews.forEach(function (c) { queued += c.queuedWaves || 0; });
    var frame = consoleFrame({
      title: 'Crew',
      summary: crews.length + (crews.length === 1 ? ' template' : ' templates') +
        (queued > 0 ? ' · ' + queued + (queued === 1 ? ' wave queued' : ' waves queued') : ''),
      summaryTone: 'ok',
      filterPlaceholder: 'Filter templates',
      connectLabel: 'New template',
      onConnect: function () {
        window.PMState.receipt('Create a Crew template', 'The template composer is out of scope for this demo.');
      }
    });

    if (!view.sel.crew && crews.length > 0) { view.sel.crew = crews[0].id; }

    frame.inv.appendChild(el('div', 'c2-inv-group', 'Templates'));
    crews.forEach(function (c) {
      var constrained = (c.effectiveConcurrency || 0) < (c.requestedConcurrency || 0);
      frame.inv.appendChild(invRow({
        icoName: constrained ? 'clock' : 'checkCircle',
        tone: constrained ? 'setup' : 'ok',
        name: c.name,
        word: constrained ? 'Queued' : 'Ready',
        note: c.purpose || '',
        selected: view.sel.crew === c.id,
        onSelect: function () {
          view.sel.crew = c.id;
          persistView();
          renderAll();
        }
      }));
    });
    wireFilter(frame.filter, frame.inv);

    var selected = null;
    crews.forEach(function (c) { if (c.id === view.sel.crew) { selected = c; } });
    if (selected) { renderCrewInspector(frame.inspect, selected); }
    else { frame.inspect.appendChild(el('div', 'c2-inspect-empty', 'Select a Crew template to inspect it.')); }
  }

  function renderCrewInspector(inspect, c) {
    clear(inspect);
    var h2 = el('h2', null, c.name);
    inspect.appendChild(h2);
    inspect.appendChild(el('p', 'c2-inspect-sub', c.purpose || ''));

    var threadSel = store.get('crew.threadSelection');
    var useBtn = btn('c2-btn' + (threadSel === c.id ? '' : ' is-primary'),
      threadSel === c.id ? 'Selected for this thread' : 'Use in this thread', function () {
        store.set('crew.threadSelection', c.id);
        window.PMShell.status('"' + c.name + '" selected for this thread only. Other threads keep their own selection.');
        renderAll();
      });
    useBtn.disabled = threadSel === c.id;
    inspect.appendChild(useBtn);
    inspect.appendChild(el('p', 'c2-usage-note',
      'Crew selection is thread-local: choosing a template here never changes any other thread.'));

    inspect.appendChild(inspectHead('info', 'Template summary'));
    inspect.appendChild(kvBlock([
      ['Members', c.minMembers + ' to ' + c.maxMembers + ' (' + arr(c.members).length + ' composed)'],
      ['Route policy', c.routePolicy === 'strict' ? 'Strict — members keep their assigned routes' : 'Adaptive — members may re-route under pressure'],
      ['Task board', c.board],
      ['Consensus', c.consensus],
      ['Spawn depth', 'Members may spawn helpers ' + ((c.spawning && c.spawning.depth) || 0) + ' level(s) deep'],
      ['On failure', c.failure]
    ]));

    inspect.appendChild(inspectHead('gauge', 'Concurrency: requested vs effective'));
    var pair = el('div', 'c2-pair');
    var req = el('div', 'c2-bignum');
    req.appendChild(el('div', 'c2-bignum-n', String(c.requestedConcurrency || 0)));
    req.appendChild(el('div', 'c2-bignum-l', 'Requested members running at once'));
    pair.appendChild(req);
    var eff = el('div', 'c2-bignum');
    eff.setAttribute('data-tone', 'effective');
    eff.appendChild(el('div', 'c2-bignum-n', String(c.effectiveConcurrency || 0)));
    eff.appendChild(el('div', 'c2-bignum-l', 'Effective right now (operational limit)'));
    pair.appendChild(eff);
    inspect.appendChild(pair);
    if ((c.queuedWaves || 0) > 0) {
      inspect.appendChild(el('p', 'c2-usage-note',
        c.queuedWaves + (c.queuedWaves === 1 ? ' wave' : ' waves') +
        ' queued: remaining members start as earlier waves finish.'));
    }
    var op = data().operational || {};
    if ((c.requestedConcurrency || 0) > (op.sustainableNow || Infinity) || (c.queuedWaves || 0) > 0) {
      var warn = el('div', 'c2-wave-warning');
      warn.appendChild(ico('warning'));
      var wText = el('div', null, '');
      wText.appendChild(document.createTextNode(op.waveWarning ||
        'Requested concurrency exceeds what is sustainable right now.'));
      if (op.reason) {
        wText.appendChild(el('div', 'c2-prose-hint', 'Why: ' + op.reason));
      }
      warn.appendChild(wText);
      inspect.appendChild(warn);
    }

    inspect.appendChild(inspectHead('shield', 'Guards, reserve & isolation'));
    var iso = c.isolation || {};
    inspect.appendChild(kvBlock([
      ['Usage guard', c.guards && c.guards.usage],
      ['Time guard', c.guards && c.guards.time],
      ['Reserve', c.reserve],
      ['Worktree', iso.worktree ? 'Each member works in an isolated worktree' : 'Shared working copy'],
      ['Allowed paths', arr(iso.paths).join(', ') || 'Unrestricted'],
      ['Test resources', iso.testResources]
    ]));

    var comp = disclosure({ label: 'Full composition (' + arr(c.members).length + ' members)', icoName: 'users', kind: 'advanced' });
    var table = document.createElement('table');
    table.className = 'c2-members';
    var thead = document.createElement('thead');
    thead.innerHTML = '<tr><th scope="col">Role</th><th scope="col">Persona</th><th scope="col">Route candidates</th></tr>';
    table.appendChild(thead);
    var tbody = document.createElement('tbody');
    arr(c.members).forEach(function (mm) {
      var tr = document.createElement('tr');
      var td1 = document.createElement('td');
      td1.textContent = mm.role;
      var td2 = document.createElement('td');
      td2.textContent = mm.persona;
      var td3 = document.createElement('td');
      arr(mm.routeCandidates).forEach(function (rc, i) {
        if (i > 0) { td3.appendChild(document.createElement('br')); }
        td3.appendChild(document.createTextNode(rc));
      });
      tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    comp.body.appendChild(table);
    inspect.appendChild(comp.root);

    /* thread note: designated spellcheck field with skip-region demo */
    inspect.appendChild(inspectHead('edit', 'Note to the crew lead (this thread)'));
    var prose = el('div', 'c2-prose');
    prose.contentEditable = 'true';
    prose.setAttribute('role', 'textbox');
    prose.setAttribute('aria-multiline', 'true');
    prose.setAttribute('aria-label', 'Note to the crew lead');
    var savedNote = store.get('crew.threadNote.' + c.id);
    prose.textContent = typeof savedNote === 'string' && savedNote !== '' ? savedNote :
      'Have the lead recheck teh FileSafe rules before merge. Keep changes inside src/ and tests/, and dont seperate the docs sweep — ask Claude Sonnet 4.5 to definately flag API_KEYS handling.';
    prose.addEventListener('input', function () {
      store.set('crew.threadNote.' + c.id, prose.textContent);
    });
    inspect.appendChild(prose);
    inspect.appendChild(el('p', 'c2-prose-hint',
      'Spellcheck underlines suspicious words but never auto-replaces. Paths like src/, ALL-CAPS tokens, and known model or dictionary names (FileSafe, Claude Sonnet) are skipped.'));
    try { window.PMSpell.attach(prose, { store: store, projectDict: true }); } catch (e) { /* optional */ }

    /* plain settings hang off the console (inverted relation) */
    var confDisc = disclosure({ label: 'Configure helper agents & Crew', icoName: 'gear', kind: 'configure' });
    var dom = domainById('collaboration');
    if (dom) {
      arr(dom.subs).forEach(function (sub) {
        if (sub.id !== 'helpers') { return; }
        arr(sub.settingIds).forEach(function (sid) {
          var s = data().settings ? data().settings[sid] : null;
          if (s) { confDisc.body.appendChild(renderRow(s, 'console/crew')); }
        });
      });
    }
    inspect.appendChild(confDisc.root);
  }

  /* ==================================================================
     MEDIA console
     ================================================================== */

  function renderMediaConsole() {
    var routes = arr(data().media);
    var live = 0, gaps = 0;
    routes.forEach(function (m) { if (m.providerRef) { live++; } else { gaps++; } });
    var frame = consoleFrame({
      title: 'Media routes',
      summary: live + (live === 1 ? ' route live' : ' routes live') +
        (gaps > 0 ? ' · ' + gaps + (gaps === 1 ? ' needs a provider' : ' need a provider') : ''),
      summaryTone: gaps > 0 ? 'attention' : 'ok',
      filterPlaceholder: 'Filter routes',
      connectLabel: 'Add route',
      onConnect: function () {
        window.PMState.receipt('Add a media route', 'Routes appear automatically when a connected provider offers the capability; manual routes are out of scope for this demo.');
      }
    });

    if (!view.sel.media && routes.length > 0) { view.sel.media = routes[0].id; }

    frame.inv.appendChild(el('div', 'c2-inv-group', 'Purposes'));
    routes.forEach(function (m) {
      var pName = m.providerRef ? ((providerById(m.providerRef) || {}).name || m.providerRef) : 'No provider';
      var lastOk = arr(m.history).length ? m.history[0].ok : true;
      var tone = !m.providerRef ? 'setup' : (lastOk ? 'ok' : 'attention');
      frame.inv.appendChild(invRow({
        icoName: !m.providerRef ? 'wrench' : (lastOk ? 'checkCircle' : 'warning'),
        tone: tone,
        name: MEDIA_PURPOSE[m.purpose] || m.purpose,
        word: !m.providerRef ? 'Needs provider' : (m.native ? 'Native' : 'PM transformed'),
        note: pName + (m.costRoute ? ' · ' + m.costRoute : ''),
        selected: view.sel.media === m.id,
        onSelect: function () {
          view.sel.media = m.id;
          persistView();
          renderAll();
        }
      }));
    });
    wireFilter(frame.filter, frame.inv);

    var selected = null;
    routes.forEach(function (m) { if (m.id === view.sel.media) { selected = m; } });
    if (selected) { renderMediaInspector(frame.inspect, selected); }
    else { frame.inspect.appendChild(el('div', 'c2-inspect-empty', 'Select a media route to inspect it.')); }
  }

  function renderMediaInspector(inspect, m) {
    clear(inspect);
    var provider = m.providerRef ? providerById(m.providerRef) : null;
    var h2 = el('h2', null, MEDIA_PURPOSE[m.purpose] || m.purpose);
    var kindTag = el('span', 'c2-tag', !m.providerRef ? 'Not configured'
      : (m.native ? 'Native provider capability' : 'PM transformation'));
    h2.appendChild(kindTag);
    inspect.appendChild(h2);

    if (!m.providerRef) {
      var warn = el('div', 'c2-wave-warning');
      warn.appendChild(ico('warning'));
      var wText = el('div', null, 'No connected provider offers this capability. Requests fail with an honest receipt until one is connected.');
      warn.appendChild(wText);
      inspect.appendChild(warn);
      var connectBtn = btn('c2-btn is-primary', 'Choose a provider', function () {
        go({ name: 'manager', managerId: 'providers' });
        window.PMShell.status('Connect a provider that offers video generation, then this route activates automatically.');
      });
      inspect.appendChild(connectBtn);
    }

    if (m.transformNote) {
      var note = el('div', 'c2-caution');
      note.style.borderColor = 'var(--border)';
      note.appendChild(ico('info'));
      note.appendChild(el('div', null, m.transformNote));
      inspect.appendChild(note);
    }

    inspect.appendChild(inspectHead('info', 'Route'));
    var fallbackName = m.fallbackRef ? ((providerById(m.fallbackRef) || {}).name || m.fallbackRef) : 'None configured';
    inspect.appendChild(kvBlock([
      ['Provider', provider ? provider.name : 'None connected', provider ? null : 'attention'],
      ['Kind', m.native ? 'Native — the provider serves this directly' : 'PM transformation — PM converts the request first'],
      ['Fallback route', fallbackName],
      ['Safety', m.safety],
      ['Cost route', m.costRoute],
      ['Output', (m.output ? m.output.location + ' · ' + m.output.format : 'Not applicable')]
    ]));

    if (m.purpose === 'image-gen' || m.purpose === 'vision') {
      inspect.appendChild(inspectHead('edit', 'Test prompt scratchpad'));
      var prose = el('div', 'c2-prose');
      prose.contentEditable = 'true';
      prose.setAttribute('role', 'textbox');
      prose.setAttribute('aria-multiline', 'true');
      prose.setAttribute('aria-label', 'Test prompt scratchpad');
      var saved = store.get('media.testPrompt.' + m.id);
      prose.textContent = typeof saved === 'string' && saved !== '' ? saved :
        'Generate a clean dashboard mockup accross two panels, then recieve feedback before iterating on artifacts/media/ output.';
      prose.addEventListener('input', function () {
        store.set('media.testPrompt.' + m.id, prose.textContent);
      });
      inspect.appendChild(prose);
      inspect.appendChild(el('p', 'c2-prose-hint',
        'Spellcheck suggests, never auto-corrects. Paths such as artifacts/media/ are skipped.'));
      try { window.PMSpell.attach(prose, { store: store, projectDict: true }); } catch (e) { /* optional */ }
      var run = btn('c2-btn', 'Run a test generation', function () {
        window.PMState.receipt('Test ' + (MEDIA_PURPOSE[m.purpose] || m.purpose).toLowerCase(),
          m.providerRef ? 'Simulated — no real provider call is made in this demo.' : 'No provider is connected for this purpose, so the request would fail.');
      });
      run.style.marginTop = '8px';
      inspect.appendChild(run);
    }

    inspect.appendChild(inspectHead('history', 'Generation history'));
    var hist = el('div', 'c2-history');
    if (arr(m.history).length === 0) {
      hist.appendChild(el('div', 'c2-inspect-empty', 'Nothing generated on this route yet.'));
    }
    arr(m.history).forEach(function (hh) {
      var row = el('div', 'c2-history-row');
      row.setAttribute('data-ok', hh.ok ? '1' : '0');
      row.appendChild(ico(hh.ok ? 'checkCircle' : 'close'));
      row.appendChild(el('span', null, hh.what));
      row.appendChild(el('span', 'c2-history-at', fmtWhen(hh.at)));
      hist.appendChild(row);
    });
    inspect.appendChild(hist);

    /* plain settings hang off the console (inverted relation) */
    var confDisc = disclosure({ label: 'Configure media handling', icoName: 'gear', kind: 'configure' });
    var dom = domainById('media');
    if (dom) {
      arr(dom.subs).forEach(function (sub) {
        arr(sub.settingIds).forEach(function (sid) {
          var s = data().settings ? data().settings[sid] : null;
          if (s) { confDisc.body.appendChild(renderRow(s, 'console/media')); }
        });
      });
    }
    inspect.appendChild(confDisc.root);
  }

  /* ==================================================================
     COMMAND PALETTE
     ================================================================== */

  var paletteResults = [];
  var paletteActive = 0;

  function openPalette(prefill) {
    els.paletteBackdrop.hidden = false;
    els.paletteInput.value = prefill || '';
    renderPaletteResults(els.paletteInput.value);
    els.paletteInput.focus();
  }

  function closePalette(refocus) {
    if (els.paletteBackdrop && !els.paletteBackdrop.hidden) {
      els.paletteBackdrop.hidden = true;
      if (refocus && els.cmdbar) { els.cmdbar.focus(); }
    }
  }

  function renderPaletteResults(query) {
    var list = els.paletteList;
    clear(list);
    paletteActive = 0;
    paletteResults = [];
    var q = String(query || '').trim();
    if (q === '') {
      list.appendChild(el('div', 'c2-palette-empty',
        'Type to search every setting, console, and action — with owner breadcrumbs.'));
      return;
    }
    paletteResults = arr(window.PMState.search(q, data())).slice(0, 20);
    if (paletteResults.length === 0) {
      list.appendChild(el('div', 'c2-palette-empty', 'No matches for "' + q + '".'));
      return;
    }
    paletteResults.forEach(function (r, i) {
      var item = btn('c2-palette-item', null, function () { activateResult(r); });
      item.setAttribute('role', 'option');
      item.id = 'c2pal-' + i;
      if (i === 0) { item.classList.add('is-active'); }
      item.appendChild(ico(r.kind === 'manager' ? 'grid' : (r.kind === 'action' ? 'bolt' : 'gear')));
      item.appendChild(el('span', 'c2-pal-label', r.label));
      var crumbText = '';
      if (r.kind === 'setting') {
        var loc = subIndex[r.id];
        crumbText = loc ? (loc.domainTitle + ' › ' + loc.subTitle) : '';
      } else if (r.domainId) {
        var d = domainById(r.domainId);
        crumbText = d ? d.title : '';
      }
      item.appendChild(el('span', 'c2-pal-crumb', crumbText));
      var kindLabel = r.kind === 'manager' ? 'Console' : (r.kind === 'action' ? 'Action' : 'Setting');
      if (r.kind === 'setting' && r.exposure && r.exposure !== 'standard') {
        var expLabel = { advanced: 'Advanced', expert: 'Expert', managed: 'Managed', diagnostic: 'Diagnostic', unavailable: 'Unavailable' }[r.exposure];
        if (expLabel) { kindLabel = expLabel; }
      }
      item.appendChild(el('span', 'c2-pal-kind', kindLabel));
      list.appendChild(item);
    });
  }

  function setPaletteActive(idx) {
    var items = els.paletteList.querySelectorAll('.c2-palette-item');
    if (items.length === 0) { return; }
    paletteActive = (idx + items.length) % items.length;
    Array.prototype.forEach.call(items, function (item, i) {
      item.classList.toggle('is-active', i === paletteActive);
    });
    var active = items[paletteActive];
    if (active && active.scrollIntoView) { active.scrollIntoView({ block: 'nearest' }); }
    els.paletteInput.setAttribute('aria-activedescendant', 'c2pal-' + paletteActive);
  }

  function onPaletteKeydown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setPaletteActive(paletteActive + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setPaletteActive(paletteActive - 1); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (paletteResults[paletteActive]) { activateResult(paletteResults[paletteActive]); }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePalette(true);
    }
  }

  function activateResult(r) {
    closePalette(false);
    if (r.kind === 'setting') { openSetting(r.id); return; }
    if (r.kind === 'manager') {
      var route = MANAGER_ROUTE[r.id];
      if (route && route.console) { go({ name: 'manager', managerId: route.console }); return; }
      if (route && route.domain) {
        go({ name: 'workspace', domainId: route.domain });
        if (route.crossConcept) {
          window.PMState.receipt('Open ' + (route.label || r.label || 'this console'), route.crossConcept);
        } else {
          window.PMShell.status(r.label + ' lives in this station in the demo; its full console belongs to another concept surface.');
        }
        return;
      }
      go({ name: 'home' });
      return;
    }
    if (r.kind === 'action') {
      var notice = null;
      arr(data().notices).forEach(function (n) { if (n && n.id === r.id) { notice = n; } });
      if (notice) { runNoticeAction(notice, notice.primary); return; }
      window.PMState.receipt(r.label, 'This action is only available from its notice.');
    }
  }

  /* ---------------- global wiring ---------------- */

  function onGlobalKeydown(e) {
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (els.paletteBackdrop.hidden) { openPalette(''); } else { closePalette(true); }
      return;
    }
    if (e.key === 'Escape') {
      if (!els.paletteBackdrop.hidden) { closePalette(true); return; }
      if (!els.sheet.hidden) { closeSheet(true); return; }
      if (openMenu) { closeOpenMenu(); return; }
    }
  }

  function onDocMousedown(e) {
    if (openMenu && openMenu.node && !openMenu.node.contains(e.target) &&
        e.target !== openMenu.trigger && !openMenu.trigger.contains(e.target)) {
      closeOpenMenu();
    }
  }

  /* ---------------- boot ---------------- */

  function boot() {
    store = window.PMState.init('c2-mission-control');
    rebuildSubIndex();

    window.PMShell.init({
      concept: 'c2-mission-control',
      store: store,
      onWidthChange: function () {
        if (view.name === 'workspace' && spy) {
          spy.refresh();
          layoutMinimap();
        }
      }
    });

    buildStage();
    restoreView();
    renderAll();

    window.PMState.mountStatesDrawer(store);

    store.on('scenario', function () {
      rebuildSubIndex();
      view.freeSetup = null;
      renderAll();
    });
    store.on('provider', function () {
      renderHealth();
      if (view.name === 'manager') {
        clear(els.body);
        renderConsole(view.managerId);
      }
    });
    store.on('catalog', function () {
      renderHealth();
      if (view.name === 'manager' && view.managerId === 'providers') {
        clear(els.body);
        renderConsole('providers');
      }
    });
    store.on('receipt', function (r) {
      if (r && r.message) { window.PMShell.toast(r.message); }
    });

    document.addEventListener('keydown', onGlobalKeydown);
    document.addEventListener('mousedown', onDocMousedown, true);

    window.PMShell.status('Mission Control ready.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
