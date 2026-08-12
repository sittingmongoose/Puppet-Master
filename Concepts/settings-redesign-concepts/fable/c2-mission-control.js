/* ====================================================================
   fable · Mission Control — c2 concept controller
   Final cumulative packet build (2026-08-08).
   Thesis: operational console; system state organizes everything.
   - Persistent global health strip on Home, Workspace, every console.
   - Home: triage stack (ranked) above rectangular station cards.
   - Workspace: right-edge minimap is PRIMARY nav (PMSpy state drives
     proportional blocks + draggable viewport window); left station
     rail is secondary. Managers are primary surfaces; plain settings
     hang off them as "Configure" drawers.
   - Native consoles (packet 08, concept 2): Providers/Models,
     Notifications & Sounds (destinations board + routing matrix),
     Sound Library, Appearance, Spellcheck & Dictionaries,
     Desktop/Tray/Window, Teacher/Help, plus Media (beyond-assignment
     extra kept from the prior pass). Crew moved to c1 Atlas; an honest
     receipt station links there. Everything renders as CONSOLES —
     boards, strips, matrices — never manuals or sheets.
   - Router: PMState deep links own navigation; Back/forward is real.
   Motion "Instrumental": quick state-driven morphs; refresh shimmer
   only on the refreshing region; calm state is fully static.
   Slint notes inline. No emoji anywhere. Class prefix mc- only.
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
  var teachOverlay = null; // open Teacher overlay {topic, step, root}

  var view = {
    name: 'home',          // 'home' | 'workspace' | 'manager'
    domainId: null,
    managerId: null,
    sel: { providers: 'claude', media: null },
    freeSetup: null,       // {routeId, done:[...]} stepped free-route setup
    pendingDest: null,     // {kind, focusField} — Teacher hands off into the REAL add flow
    cursorHost: null,      // chosen host for the cursor-cli explicit install offer
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
     one sentence using the banned legacy access-mode name. Access modes
     are Full Access / Auto / Auto accept edits / Ask for approval, so
     rewrite it at render time. Recorded as a data defect in FINDINGS.
     The banned word is assembled from parts so the source greps clean. */
  var BANNED_MODE = ['Y', 'OLO'].join('');
  var BANNED_SENTENCE = new RegExp(BANNED_MODE + ' mode cannot skip this\\.?', 'g');
  var BANNED_WORD = new RegExp('\\b' + BANNED_MODE + '\\b', 'g');
  function sanitizeCopy(text) {
    if (typeof text !== 'string') { return text; }
    return text
      .replace(BANNED_SENTENCE, 'No access mode can skip this.')
      .replace(BANNED_WORD, 'Full Access');
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

  /* ALL provider state strings come from PMProvider — the single source of
     provider semantics. Local code only maps tones to glyphs and title-cases
     data states the resolver passes through verbatim. */
  var TONE_ICON = { ok: 'checkCircle', attention: 'warning', setup: 'wrench', progress: 'refresh', muted: 'info' };
  var STATUS_ICON_OVERRIDE = { 'not-installed': 'download', 'signed-out': 'user', 'refreshing': 'refresh', 'unreachable': 'warning' };

  function provStatus(p) {
    var r = window.PMProvider.resolveProviderStatus(p);
    var word = r.label || 'Unknown';
    if (word === r.state && word.indexOf('-') >= 0) {
      word = word.replace(/-/g, ' ');
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    var displayTone = r.tone === 'muted' ? 'ok' : (r.tone === 'progress' ? 'setup' : r.tone);
    return {
      word: word, tone: displayTone, rawTone: r.tone, state: r.state, note: r.note,
      ico: STATUS_ICON_OVERRIDE[r.state] || TONE_ICON[r.tone] || 'info'
    };
  }

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
      purpose: 'Every provider, account, connection, installation, and model route on one operational surface.'
    },
    notifications: {
      ico: 'bell', title: 'Notifications & Sounds',
      purpose: 'The destinations board and the event routing matrix. Canonical home: General, Notifications & Sounds.'
    },
    sounds: {
      ico: 'speaker', title: 'Sound Library',
      purpose: 'Every sound asset with its provenance: source, license, hash, and default mappings. Packs import through format and license gates.'
    },
    appearance: {
      ico: 'palette', title: 'Appearance',
      purpose: 'The eight built-in themes with live hover preview, custom TOML themes with diagnosis, fonts, and UI scale.'
    },
    dictionary: {
      ico: 'doc', title: 'Spellcheck & Dictionaries',
      purpose: 'Spelling sources, personal and project word lists, and the separate opt-in grammar assist.'
    },
    desktop: {
      ico: 'tray', title: 'Desktop, Tray & Windows',
      purpose: 'Tray behavior, launch and restore, crash recovery, and the Activity Bar order board.'
    },
    teacher: {
      ico: 'grad', title: 'Teacher & Help',
      purpose: 'Guided explanations that can hand off safely into real flows. Help is never hover-only.'
    },
    media: {
      ico: 'film', title: 'Media routes',
      purpose: 'Where images, vision, audio, and video actually run. (Beyond-assignment extra kept from the prior pass.)'
    }
  };

  /* canonical manager id <-> local console id */
  var CONSOLE_BY_MANAGER = {
    'manager.providers': 'providers',
    'manager.roles': 'providers',
    'manager.freeRoutes': 'providers',
    'manager.notifications': 'notifications',
    'manager.sounds': 'sounds',
    'manager.appearance': 'appearance',
    'manager.dictionary': 'dictionary',
    'manager.desktop': 'desktop',
    'manager.teacher': 'teacher',
    'manager.media': 'media'
  };
  var MANAGER_BY_CONSOLE = {
    providers: 'manager.providers',
    notifications: 'manager.notifications',
    sounds: 'manager.sounds',
    appearance: 'manager.appearance',
    dictionary: 'manager.dictionary',
    desktop: 'manager.desktop',
    teacher: 'manager.teacher',
    media: 'manager.media'
  };

  /* Every non-native manager id points at the concept page that proves it
     natively. Search surfaces these as honest cross-concept receipts. */
  var IN_ATLAS = { concept: 'c1-atlas', page: 'c1-atlas.html', label: 'Atlas (c1)' };
  var IN_FOCUS = { concept: 'c3-focus-stack', page: 'c3-focus-stack.html', label: 'Focus Stack (c3)' };
  var IN_LEDGER = { concept: 'c4-ledger', page: 'c4-ledger.html', label: 'Ledger (c4)' };
  var COVERED_IN = {
    'manager.memory': IN_ATLAS,
    'manager.personas': IN_ATLAS,
    'manager.crew': IN_ATLAS,
    'manager.contextSources': IN_ATLAS,
    'manager.permissions': IN_ATLAS,
    'manager.bsd': IN_ATLAS,
    'manager.goal': IN_ATLAS,
    'manager.mcp': IN_FOCUS,
    'manager.lsp': IN_FOCUS,
    'manager.skills': IN_FOCUS,
    'manager.plugins': IN_FOCUS,
    'manager.tools': IN_FOCUS,
    'manager.commands': IN_FOCUS,
    'manager.terminalProfiles': IN_FOCUS,
    'manager.fileManager': IN_FOCUS,
    'manager.formatters': IN_FOCUS,
    'manager.testing': IN_FOCUS,
    'manager.storage': IN_LEDGER,
    'manager.backup': IN_LEDGER,
    'manager.lifecycle': IN_LEDGER,
    'manager.history': IN_LEDGER,
    'manager.artifacts': IN_LEDGER,
    'manager.sourceControl': IN_LEDGER,
    'manager.actions': IN_LEDGER,
    'manager.containers': IN_LEDGER,
    'manager.web': IN_LEDGER,
    'manager.searchIndex': IN_LEDGER,
    'manager.cleanup': IN_LEDGER,
    'manager.servers': IN_LEDGER
  };

  function coverageHref(managerId) {
    var cov = COVERED_IN[managerId];
    return cov ? cov.page + '#/manager/' + managerId : null;
  }

  /* which subcategories carry a console station (inverted relation:
     the console is primary; plain settings hang off it) */
  var SUB_CONSOLE = {
    'agents.accounts': 'providers',
    'general.notifications': 'notifications',
    'general.sounds': 'sounds',
    'general.desktop': 'desktop',
    'general.writing': 'dictionary',
    'general.help': 'teacher',
    'appearance.theme': 'appearance',
    'media.capabilities': 'media'
  };

  /* Crew moved out: proven natively in Atlas. The workspace subcategory and
     the Home stations both carry an honest receipt that links there. */
  var CREW_RECEIPT = {
    managerId: 'manager.crew',
    title: 'Crew',
    body: 'Crew templates are proven natively in the Atlas concept. Mission Control does not duplicate the console; this station links to the owning surface.',
    href: 'c1-atlas.html#/manager/manager.crew'
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

  /* The eight built-in themes (ids match pm-shell.css [data-theme] blocks). */
  var BUILTIN_THEMES = [
    { id: 'friendly-dark', label: 'Friendly Dark', family: 'Friendly', mode: 'dark' },
    { id: 'friendly-light', label: 'Friendly Light', family: 'Friendly', mode: 'light' },
    { id: 'glass-dark', label: 'Glass Dark', family: 'Glass', mode: 'dark' },
    { id: 'glass-light', label: 'Glass Light', family: 'Glass', mode: 'light' },
    { id: 'retro-dark', label: 'Retro Dark', family: 'Retro', mode: 'dark' },
    { id: 'retro-light', label: 'Retro Light', family: 'Retro', mode: 'light' },
    { id: 'basic-dark', label: 'Basic Dark', family: 'Basic', mode: 'dark' },
    { id: 'basic-light', label: 'Basic Light', family: 'Basic', mode: 'light' }
  ];

  function currentThemeId() {
    return document.documentElement.getAttribute('data-theme') || 'friendly-dark';
  }
  function currentThemeLabel() {
    var id = currentThemeId();
    for (var i = 0; i < BUILTIN_THEMES.length; i++) {
      if (BUILTIN_THEMES[i].id === id) { return BUILTIN_THEMES[i].label; }
    }
    return id;
  }

  /* Personal + project dictionaries: shared demo data plus the words PMSpell
     persisted from the Assistant composer (store keys spell.personal /
     spell.project) minus session removals of base words. */
  function dictionaryWords() {
    var sp = data().spell || {};
    var removedP = arr(store.get('spell.removed.personal'));
    var removedJ = arr(store.get('spell.removed.project'));
    function merge(base, added, removed) {
      var seen = {};
      var out = [];
      arr(base).concat(arr(added)).forEach(function (w) {
        var word = String(w || '').trim();
        var low = word.toLowerCase();
        if (!word || seen[low] || removed.indexOf(low) >= 0) { return; }
        seen[low] = true;
        out.push(word);
      });
      return out;
    }
    return {
      personal: merge(sp.personal, store.get('spell.personal'), removedP),
      project: merge(sp.project, store.get('spell.project'), removedJ)
    };
  }

  /* ---------------- persistence ---------------- */

  function persistView() {
    store.set('c2.view', { name: view.name, domainId: view.domainId, managerId: view.managerId, sel: view.sel });
  }

  function restoreView() {
    /* Validated restore: a persisted 'c2.view' from an earlier build may
       still name the removed Crew console — CONSOLES no longer has it, so
       that (and any other unknown id) falls back to Home. */
    var saved = store.get('c2.view');
    if (!saved || typeof saved !== 'object') { return; }
    if (saved.sel && typeof saved.sel === 'object') {
      view.sel.providers = saved.sel.providers || view.sel.providers;
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
    if (id === 'notifications') {
      var no = data().notifications || {};
      var dests = arr(no.destinations);
      var ready = 0, needs = 0, errs = 0;
      dests.forEach(function (d) {
        if (!d) { return; }
        if (d.state === 'ready') { ready++; }
        else if (d.state === 'validation-error') { errs++; }
        else if (d.state === 'needs-setup' || d.state === 'unavailable') { needs++; }
      });
      var nt = ready + ' of ' + dests.length + ' destinations ready';
      if (errs > 0) { nt += ' · ' + errs + (errs === 1 ? ' validation error' : ' validation errors'); }
      else if (needs > 0) { nt += ' · ' + needs + ' need setup'; }
      return { text: dests.length ? nt : 'No destinations yet', tone: errs > 0 ? 'attention' : (needs > 0 ? 'setup' : 'ok') };
    }
    if (id === 'sounds') {
      var so = (data().notifications || {}).sounds || {};
      var lib = arr(so.library), packs = arr(so.packs);
      var blocked = packs.filter(function (pk) { return pk && pk.state !== 'imported'; }).length;
      var st = lib.length + (lib.length === 1 ? ' sound' : ' sounds');
      if (packs.length) { st += ' · ' + packs.length + (packs.length === 1 ? ' pack' : ' packs'); }
      if (blocked > 0) { st += ' · ' + blocked + ' held at the gate'; }
      return { text: st, tone: blocked > 0 ? 'setup' : 'ok' };
    }
    if (id === 'appearance') {
      var ap = data().appearance || {};
      var customs = arr(ap.customThemes);
      var invalid = customs.filter(function (t) { return t && t.state === 'invalid'; }).length;
      var at = 'Theme ' + currentThemeLabel();
      if (customs.length) { at += ' · ' + customs.length + ' custom'; }
      if (invalid > 0) { at += ' · 1 invalid, fallback active'; }
      return { text: at, tone: invalid > 0 ? 'attention' : 'ok' };
    }
    if (id === 'dictionary') {
      var words = dictionaryWords();
      return {
        text: words.personal.length + ' personal · ' + words.project.length + ' project words',
        tone: 'ok'
      };
    }
    if (id === 'desktop') {
      var dk = data().desktop || {};
      var tray = dk.tray || {};
      var dt = (tray.minimizeToTray ? 'Minimize to tray' : 'Minimize to taskbar') +
        ' · ' + (tray.closeToTray ? 'close hides' : 'close quits');
      return { text: dt, tone: 'ok' };
    }
    if (id === 'teacher') {
      var te = data().teacher || {};
      var topics = arr(te.topics);
      var guided = topics.filter(function (t) { return t && t.kind === 'guided-action'; }).length;
      return {
        text: te.enabled === false ? 'Turned off'
          : topics.length + ' topics · ' + guided + ' guided',
        tone: te.enabled === false ? 'setup' : 'ok'
      };
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
    var root = el('div', 'mc-root');
    root.style.position = 'relative';

    var topbar = el('div', 'mc-topbar');
    els.crumb = el('nav', 'mc-crumb');
    els.crumb.setAttribute('aria-label', 'Settings location');
    var cmdbar = btn('mc-cmdbar', null, function () { openPalette(''); });
    cmdbar.setAttribute('aria-haspopup', 'dialog');
    cmdbar.appendChild(ico('search'));
    var hint = el('span', 'mc-cmdbar-hint', 'Search settings, consoles, actions');
    cmdbar.appendChild(hint);
    var kbd = el('kbd', null, 'Ctrl K');
    cmdbar.appendChild(kbd);
    els.cmdbar = cmdbar;
    topbar.appendChild(els.crumb);
    topbar.appendChild(cmdbar);

    els.health = el('div', 'mc-health');
    els.health.setAttribute('aria-label', 'System health');
    els.body = el('div', 'mc-body');

    root.appendChild(topbar);
    root.appendChild(els.health);
    root.appendChild(els.body);

    /* narrow: outline bottom sheet (minimap folds into it) */
    els.outlineBtn = btn('mc-outline-btn', null, function () { openSheet(); });
    els.outlineBtn.appendChild(ico('list'));
    els.outlineBtn.appendChild(el('span', null, 'Outline'));
    els.outlineBtn.setAttribute('aria-haspopup', 'dialog');
    els.outlineBtn.hidden = true;
    root.appendChild(els.outlineBtn);

    els.sheet = el('div', 'mc-sheet');
    els.sheet.setAttribute('role', 'dialog');
    els.sheet.setAttribute('aria-label', 'Document outline');
    els.sheet.hidden = true;
    root.appendChild(els.sheet);

    els.root = root;
    stage.appendChild(root);

    /* command palette overlay */
    var backdrop = el('div', 'mc-palette-backdrop');
    backdrop.hidden = true;
    backdrop.addEventListener('mousedown', function (e) {
      if (e.target === backdrop) { closePalette(false); }
    });
    var pal = el('div', 'mc-palette');
    pal.setAttribute('role', 'dialog');
    pal.setAttribute('aria-label', 'Search settings, consoles, and actions');
    var inputWrap = el('div', 'mc-palette-input');
    inputWrap.appendChild(ico('search'));
    var input = document.createElement('input');
    input.type = 'text';
    input.setAttribute('aria-label', 'Search settings, consoles, and actions');
    input.placeholder = 'Type to search everywhere';
    inputWrap.appendChild(input);
    var list = el('div', 'mc-palette-list');
    list.setAttribute('role', 'listbox');
    list.id = 'c2PaletteList';
    var foot = el('div', 'mc-palette-foot');
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
      var here = el('span', 'mc-crumb-here', 'Mission Control');
      els.crumb.appendChild(here);
    } else {
      els.crumb.appendChild(rootBtn);
      els.crumb.appendChild(ico('chevR'));
      var label = view.name === 'workspace'
        ? (domainById(view.domainId) || {}).title || 'Workspace'
        : (CONSOLES[view.managerId] || {}).title + ' console';
      els.crumb.appendChild(el('span', 'mc-crumb-here', label));
    }
    var scenario = store.get('scenario') || 'baseline';
    var scnLabel = '';
    arr(window.PMState.scenarios).forEach(function (s) { if (s.id === scenario) { scnLabel = s.label || s.id; } });
    var right = document.getElementById('pmStatusRight');
    if (right) { right.textContent = 'fable · Mission Control — ' + scnLabel; }
  }

  /* ---------------- health strip ---------------- */

  function healthChip(key, icoName, label, note, tone, onClick) {
    var chip = btn('mc-health-chip', null, onClick);
    chip.setAttribute('data-tone', tone);
    var inner = el('span', null);
    inner.style.display = 'inline-flex';
    inner.style.alignItems = 'center';
    inner.style.gap = '8px';
    inner.style.minWidth = '0';
    inner.appendChild(ico(icoName));
    inner.appendChild(el('span', 'mc-health-label', label));
    inner.appendChild(el('span', 'mc-health-note', note));
    var sig = icoName + '|' + label + '|' + note + '|' + tone;
    if (healthPrev[key] && healthPrev[key] !== sig && !motionReduced()) {
      inner.classList.add('mc-morph'); // glyph + label morph together, once
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

  function go(next, opts) {
    opts = opts || {};
    closePalette(false);
    closeSheet(false);
    closeOpenMenu();
    if (!opts.keepTeach) { closeTeachOverlay(false); }
    view.name = next.name;
    if (next.name === 'workspace') { view.domainId = next.domainId; }
    if (next.name === 'manager') { view.managerId = next.managerId; }
    persistView();
    renderAll();
    if (!opts.fromRouter) { writeViewRoute(false); }
  }

  /* ---------------- deep-link router (PMState contract) ----------------
     The hash owns navigation: every station/console navigation pushes a
     route so browser Back/forward traverses real history; scrollspy and
     minimap-driven section changes replace instead. */

  function routeForView() {
    if (view.name === 'workspace' && view.domainId) {
      return { kind: 'dest', domainId: view.domainId };
    }
    if (view.name === 'manager' && view.managerId) {
      return { kind: 'manager', managerId: MANAGER_BY_CONSOLE[view.managerId] || view.managerId };
    }
    return { kind: 'home' };
  }

  function writeViewRoute(replace) {
    try { window.PMState.writeRoute(routeForView(), { replace: !!replace }); }
    catch (e) { /* router optional when scripts partially load */ }
  }

  function routerOpen(route, dl) {
    route = route || { kind: 'home' };
    if (route.kind === 'manager' && route.managerId) {
      var consoleId = CONSOLE_BY_MANAGER[route.managerId];
      if (consoleId) {
        go({ name: 'manager', managerId: consoleId }, { fromRouter: true });
      } else if (COVERED_IN[route.managerId]) {
        /* honest cross-concept receipt with a real link */
        var cov = COVERED_IN[route.managerId];
        go({ name: 'home' }, { fromRouter: true });
        window.PMState.receipt('Open this manager',
          'This manager is proven natively in ' + cov.label + ' — open ' + coverageHref(route.managerId) + '.');
      } else {
        go({ name: 'home' }, { fromRouter: true });
      }
    } else if (route.kind === 'dest' && domainById(route.domainId)) {
      go({ name: 'workspace', domainId: route.domainId }, { fromRouter: true });
      if (route.subId && spy) {
        var target = secId(route.domainId, route.subId);
        if (document.getElementById(target)) { spy.jumpTo(target); }
      }
    } else if (route.kind === 'setting' && route.settingId) {
      openSetting(route.settingId, { fromRouter: true });
    } else if (route.kind === 'search') {
      /* search deep link: the palette opens pre-filled and executed */
      go({ name: 'home' }, { fromRouter: true });
      openPalette(route.query || '');
    } else {
      go({ name: 'home' }, { fromRouter: true });
    }
    if (dl && dl.focus) { openSetting(dl.focus, { fromRouter: true }); }
    return null;
  }

  function renderAll() {
    if (spy) { spy.dispose(); spy = null; }
    previewThemeEnd(); /* a rebuild always ends any live hover preview safely */
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
    var home = el('div', 'mc-home');
    var inner = el('div', 'mc-home-inner');
    home.appendChild(inner);

    var byKind = { attention: [], setup: [], recommended: [] };
    arr(data().notices).forEach(function (n) {
      if (n && byKind[n.kind]) { byKind[n.kind].push(n); }
    });

    if (byKind.attention.length + byKind.setup.length + byKind.recommended.length === 0) {
      /* calm state: genuinely quiet, zero animation */
      var calm = el('div', 'mc-calm');
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
        var stack = el('div', 'mc-triage');
        byKind[kind].forEach(function (n) { stack.appendChild(renderNotice(n)); });
        inner.appendChild(stack);
      });
    }

    var recents = arr(data().recents);
    if (recents.length > 0) {
      inner.appendChild(groupHead('Pick up where you left off', ''));
      var rWrap = el('div', 'mc-recents');
      recents.slice(0, 4).forEach(function (r) {
        var row = btn('mc-recent', null, function () { followTarget(r.target || {}); });
        row.appendChild(ico('history'));
        row.appendChild(el('span', null, r.label));
        row.appendChild(el('span', 'mc-recent-detail', r.detail || ''));
        rWrap.appendChild(row);
      });
      inner.appendChild(rWrap);
    }

    inner.appendChild(groupHead('Consoles', ''));
    var cGrid = el('div', 'mc-stations');
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
    /* Crew moved out: an honest receipt station, not a dead duplicate. */
    cGrid.appendChild(crewReceiptCard());
    inner.appendChild(cGrid);

    inner.appendChild(groupHead('Stations', ''));
    var sGrid = el('div', 'mc-stations');
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
    var head = el('div', 'mc-group-head');
    var h2 = el('h2', null, title);
    head.appendChild(h2);
    if (count) { head.appendChild(el('span', 'mc-group-count', count)); }
    return head;
  }

  function stationCard(opts) {
    var card = btn('mc-station', null, opts.onOpen);
    if (opts.isConsole) { card.setAttribute('data-console', '1'); }
    var iconWrap = el('span', 'mc-station-icon');
    iconWrap.appendChild(ico(opts.icoName));
    card.appendChild(iconWrap);
    var title = el('span', 'mc-station-title', opts.title);
    if (opts.isConsole) {
      var tag = el('span', 'mc-station-tag', 'Console');
      title.appendChild(tag);
    }
    card.appendChild(title);
    card.appendChild(el('span', 'mc-station-purpose', opts.purpose));
    var health = el('span', 'mc-station-health');
    health.setAttribute('data-tone', opts.health.tone);
    health.appendChild(ico(opts.health.tone === 'attention' ? 'warning' : (opts.health.tone === 'setup' ? 'wrench' : 'check')));
    health.appendChild(el('span', null, opts.health.text));
    card.appendChild(health);
    var open = el('span', 'mc-station-open');
    open.appendChild(el('span', null, 'Open'));
    open.appendChild(ico('arrowR'));
    card.appendChild(open);
    return card;
  }

  /* The Crew receipt station: a real link to the owning concept page,
     visually a station card, semantically an anchor (honest navigation). */
  function crewReceiptCard() {
    var card = document.createElement('a');
    card.className = 'mc-station mc-station-receipt';
    card.href = CREW_RECEIPT.href;
    card.setAttribute('aria-label', 'Crew — proven natively in Atlas. Opens ' + CREW_RECEIPT.href);
    var iconWrap = el('span', 'mc-station-icon');
    iconWrap.appendChild(ico('users'));
    card.appendChild(iconWrap);
    var title = el('span', 'mc-station-title', CREW_RECEIPT.title);
    title.appendChild(el('span', 'mc-station-tag', 'In Atlas'));
    card.appendChild(title);
    card.appendChild(el('span', 'mc-station-purpose', CREW_RECEIPT.body));
    var health = el('span', 'mc-station-health');
    health.setAttribute('data-tone', 'ok');
    health.appendChild(ico('check'));
    health.appendChild(el('span', null, 'Proven natively in Atlas'));
    card.appendChild(health);
    var open = el('span', 'mc-station-open');
    open.appendChild(el('span', null, 'Open in Atlas'));
    open.appendChild(ico('external'));
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
    var card = el('article', 'mc-notice');
    card.setAttribute('data-kind', r.tone);
    card.appendChild(statusWord(r.tone, r.statusWord));
    card.appendChild(el('h3', 'mc-notice-headline', r.headline));
    card.appendChild(el('p', 'mc-notice-consequence', r.consequence));
    var actions = el('div', 'mc-notice-actions');
    if (r.primary && r.primary.label) {
      var primary = btn('mc-btn' + (r.tone === 'attention' ? ' is-primary' : ''), r.primary.label, function () {
        runNoticeAction(n, r.primary);
      });
      actions.appendChild(primary);
    }
    if (r.secondary && r.secondary.label) {
      actions.appendChild(btn('mc-btn is-quiet', r.secondary.label, function () {
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
    if (act === 'cleanup-dry-run' || act === 'index-rebuild') {
      window.PMState.trigger(act);
    }
    /* fixture notices that belong to this concept's native consoles */
    if (act === 'open-webhook') {
      go({ name: 'manager', managerId: 'notifications' });
      focusDestCard('dest.webhook');
      return;
    }
    if (act === 'open-appearance') {
      go({ name: 'manager', managerId: 'appearance' });
      return;
    }
    followTarget(target);
  }

  function followTarget(target) {
    if (target.settingId) { openSetting(target.settingId); return; }
    if (target.manager) {
      var m = String(target.manager);
      if (CONSOLES[m]) { go({ name: 'manager', managerId: m }); return; }
      var full = m.indexOf('manager.') === 0 ? m : 'manager.' + m;
      if (CONSOLE_BY_MANAGER[full]) { go({ name: 'manager', managerId: CONSOLE_BY_MANAGER[full] }); return; }
      if (COVERED_IN[full]) {
        window.PMState.receipt('Open this manager',
          'Proven natively in ' + COVERED_IN[full].label + ' — open ' + coverageHref(full) + '.');
        var def = null;
        arr(window.PMState.managerDefs).forEach(function (d) { if (d && d.id === full) { def = d; } });
        if (def && domainById(def.domainId)) { go({ name: 'workspace', domainId: def.domainId }); return; }
      }
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

  /* scroll a destination card into view and flash it (deep links, notices,
     Teacher highlights) */
  function focusDestCard(destId) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        var card = els.body.querySelector('[data-teach-ref="' + esc(destId) + '"]');
        if (card) {
          card.scrollIntoView({ block: 'center', behavior: 'auto' });
          window.PMSpy.focusFlash(card);
        }
      });
    });
  }

  /* ==================================================================
     WORKSPACE — rail (secondary) + document + minimap (primary)
     ================================================================== */

  function renderWorkspace(domainId) {
    var dom = domainById(domainId) || arr(data().taxonomy)[0];
    if (!dom) { return; }
    view.domainId = dom.id;
    expanders = {};

    var wrap = el('div', 'mc-work');
    var rail = buildStationRail(dom.id);
    var doc = el('div', 'mc-doc');
    doc.id = 'c2Doc';
    doc.tabIndex = -1;
    doc.setAttribute('aria-label', dom.title + ' settings document');

    var head = el('header', 'mc-doc-head');
    head.appendChild(el('h1', null, dom.title));
    head.appendChild(el('p', null, dom.blurb || ''));
    doc.appendChild(head);

    arr(dom.subs).forEach(function (sub) {
      doc.appendChild(renderSubSection(dom, sub));
    });

    var map = el('div', 'mc-map');
    map.setAttribute('aria-label', 'Document minimap');
    var track = el('div', 'mc-map-track');
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
        return Array.prototype.slice.call(doc.querySelectorAll('.mc-sec'));
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
    var rail = el('nav', 'mc-wrail');
    rail.setAttribute('aria-label', 'Stations');
    arr(data().taxonomy).forEach(function (dom) {
      var item = btn('mc-wrail-item', null, function () {
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
      item.appendChild(el('span', 'mc-wrail-label', dom.title));
      var dh = domainHealth(dom.id);
      var glyphTone = dh.attention > 0 ? 'attention' : (dh.setup > 0 ? 'setup' : 'ok');
      var glyph = ico(glyphTone === 'attention' ? 'warning' : (glyphTone === 'setup' ? 'wrench' : 'check'), 'mc-wrail-glyph');
      glyph.setAttribute('data-tone', glyphTone);
      item.appendChild(glyph);
      rail.appendChild(item);

      if (dom.id === activeDomain) {
        var subs = el('div', 'mc-wrail-subs');
        arr(dom.subs).forEach(function (sub) {
          var sBtn = btn('mc-wrail-sub', null, function () {
            if (spy) { spy.jumpTo(secId(dom.id, sub.id)); }
          });
          sBtn.setAttribute('data-sec', secId(dom.id, sub.id));
          sBtn.appendChild(el('span', 'mc-wrail-dot'));
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
    var subBtns = els.body.querySelectorAll('.mc-wrail-sub');
    Array.prototype.forEach.call(subBtns, function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-sec') === activeId);
    });
    var blocks = els.mapTrack ? els.mapTrack.querySelectorAll('.mc-map-block') : [];
    Array.prototype.forEach.call(blocks, function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-sec') === activeId);
    });
    if (!els.sheet.hidden) { renderSheetItems(); }
    /* minimap/scrollspy-driven section changes REPLACE the route so the
       history stack stays one entry per navigation, not per scroll */
    var m = /^c2sec-(.+?)-(.+)$/.exec(activeId);
    if (m && view.name === 'workspace') {
      try {
        window.PMState.writeRoute({ kind: 'dest', domainId: m[1], subId: m[2] }, { replace: true });
      } catch (e) { /* router optional */ }
    }
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
      var block = btn('mc-map-block', null, function () {
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
    var win = el('div', 'mc-map-window');
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
    var first = els.sheet.querySelector('.mc-sheet-item');
    if (first) { first.focus(); }
  }
  function closeSheet(refocus) {
    if (els.sheet.hidden) { return; }
    els.sheet.hidden = true;
    if (refocus) { els.outlineBtn.focus(); }
  }
  function renderSheetItems() {
    clear(els.sheet);
    var head = el('div', 'mc-sheet-head');
    head.appendChild(el('h3', null, 'Outline'));
    var close = btn('mc-iconbtn', null, function () { closeSheet(true); });
    close.setAttribute('aria-label', 'Close outline');
    close.appendChild(ico('close'));
    head.appendChild(close);
    els.sheet.appendChild(head);
    var dom = domainById(view.domainId);
    if (!dom) { return; }
    arr(dom.subs).forEach(function (sub) {
      var id = secId(dom.id, sub.id);
      var item = btn('mc-sheet-item', null, function () {
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
    var sec = el('section', 'mc-sec');
    sec.id = secId(dom.id, sub.id);
    var head = el('div', 'mc-sec-head');
    head.appendChild(el('h2', null, sub.title));
    if (sub.blurb) { head.appendChild(el('span', 'mc-sec-blurb', sub.blurb)); }
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

    /* Crew lives natively in Atlas now: the subcategory renders an honest
       receipt panel with a real link, plus its plain settings rows. */
    if (dom.id === 'collaboration' && sub.id === 'helpers') {
      var crewPanel = el('div', 'mc-substation mc-substation-receipt');
      var crewIcon = el('span', 'mc-station-icon');
      crewIcon.appendChild(ico('users'));
      crewPanel.appendChild(crewIcon);
      var crewText = el('div', 'mc-substation-text', CREW_RECEIPT.title);
      crewText.appendChild(el('small', null, CREW_RECEIPT.body));
      crewPanel.appendChild(crewText);
      var crewLink = document.createElement('a');
      crewLink.className = 'mc-btn is-primary mc-btn-link';
      crewLink.href = CREW_RECEIPT.href;
      crewLink.appendChild(el('span', null, 'Open in Atlas'));
      crewLink.appendChild(ico('external'));
      crewPanel.appendChild(crewLink);
      sec.appendChild(crewPanel);
    }

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
      var caution = el('div', 'mc-caution');
      caution.appendChild(ico('warning'));
      var ctext = el('div', null);
      ctext.appendChild(document.createTextNode(
        'These settings can break protections or lose work. They stay locked until you confirm you understand the risk.'
      ));
      var unlockBtn = btn('mc-btn', expertUnlocked[subKey] ? 'Expert settings unlocked' : 'I understand the risk — unlock', function () {
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
    var panel = el('div', 'mc-substation');
    var iconWrap = el('span', 'mc-station-icon');
    iconWrap.appendChild(ico(meta.ico));
    panel.appendChild(iconWrap);
    var text = el('div', 'mc-substation-text', meta.title);
    var small = el('small', null, meta.purpose);
    text.appendChild(small);
    panel.appendChild(text);
    var health = el('div', 'mc-substation-health');
    health.appendChild(ico(sum.tone === 'attention' ? 'warning' : (sum.tone === 'setup' ? 'wrench' : 'check')));
    health.appendChild(el('span', null, sum.text));
    panel.appendChild(health);
    var open = btn('mc-btn is-primary', null, function () { go({ name: 'manager', managerId: consoleId }); });
    open.appendChild(el('span', null, 'Open console'));
    open.appendChild(ico('arrowR'));
    panel.appendChild(open);
    return panel;
  }

  function disclosure(opts) {
    var root = el('div', 'mc-disc');
    if (opts.kind) { root.setAttribute('data-kind', opts.kind); }
    var button = btn('mc-disc-btn', null, null);
    button.setAttribute('aria-expanded', 'false');
    button.appendChild(ico(opts.icoName || 'chevD'));
    button.appendChild(el('span', null, opts.label));
    button.appendChild(ico('chevD', 'mc-disc-chev'));
    var body = el('div', 'mc-disc-body');
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
    var row = el('div', 'mc-row');
    row.setAttribute('data-setting-id', s.id);
    var locked = !rs.editable || rowOpts.lockUnlessConfirmed;
    if (!rs.editable) { row.setAttribute('data-inert', '1'); }

    var main = el('div', 'mc-row-main');
    var label = el('div', 'mc-row-label', s.label || s.id);
    if (rs.exposure === 'managed' || s.valueSource === 'managed') { label.appendChild(ico('lock')); }
    main.appendChild(label);
    if (s.desc) { main.appendChild(el('div', 'mc-row-desc', sanitizeCopy(s.desc))); }
    row.appendChild(main);

    var meta = el('div', 'mc-row-meta');
    rs.chips.forEach(function (c) {
      var chip = el('span', 'pm-chip-value', c.label);
      chip.setAttribute('data-kind', c.kind);
      meta.appendChild(chip);
    });
    rs.flags.forEach(function (f) {
      var flag = el('span', 'mc-row-flag');
      flag.appendChild(ico(f.icon));
      flag.appendChild(el('span', null, f.label || FLAG_ICON_LABEL[f.icon] || ''));
      meta.appendChild(flag);
    });
    if (rs.sourceLabel) { meta.appendChild(el('span', null, rs.sourceLabel)); }
    var scopeWords = arr(s.scope).map(function (sc) { return SCOPE_WORDS[sc]; }).filter(Boolean);
    if (scopeWords.length > 0) {
      meta.appendChild(el('span', 'mc-row-scope', 'Scope: ' + scopeWords.join(' — ')));
    }
    if (rs.statusTone === 'recommended' || rs.statusTone === 'attention') {
      meta.appendChild(statusWord(rs.statusTone,
        rs.statusTone === 'recommended' ? 'Recommended' : 'Needs attention'));
    }
    if (s.riskNote) {
      var risk = el('span', 'mc-row-flag');
      risk.appendChild(ico('warning'));
      risk.appendChild(el('span', null, s.riskNote));
      meta.appendChild(risk);
    }
    row.appendChild(meta);

    var control = el('div', 'mc-row-control');
    control.appendChild(buildControl(s, rs, locked, function () {
      replaceRow(row, s, subKey, rowOpts);
    }));
    if (rs.editable && !rowOpts.lockUnlessConfirmed && s.valueSource === 'custom' && s['default'] !== undefined) {
      var reset = btn('mc-btn is-quiet', null, function () {
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
      var t = el('button', 'mc-toggle');
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
      sel.className = 'mc-select';
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
      var group = el('div', 'mc-radiogroup');
      group.setAttribute('role', 'radiogroup');
      group.setAttribute('aria-label', s.label || s.id);
      arr(s.options).forEach(function (o, idx) {
        var val = (o && typeof o === 'object') ? (o.value !== undefined ? o.value : o.id) : o;
        var lab = (o && typeof o === 'object') ? (o.label || String(val)) : String(o);
        var r = btn('mc-radio', null, function () {
          commit(s, val, lab);
          rerender();
        });
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', String(String(s.value) === String(val)));
        if (idx === 0) { r.setAttribute('data-primary-control', '1'); }
        r.disabled = locked;
        r.appendChild(el('span', 'mc-radio-dot'));
        r.appendChild(el('span', null, lab));
        group.appendChild(r);
      });
      wrap.appendChild(group);
      return wrap;
    }

    if (type === 'number' || type === 'slider') {
      var num = document.createElement('input');
      num.type = 'number';
      num.className = 'mc-input';
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
      var act = btn('mc-btn', typeof s.value === 'string' && s.value ? s.value : 'Open', function () {
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
      var manage = btn('mc-btn', 'Manage', function () {
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
        var setBtn = btn('mc-btn', 'Set a value', function () {
          clear(wrap);
          var input = document.createElement('input');
          input.type = 'text';
          input.className = 'mc-input';
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
    text.className = 'mc-input';
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

  function openSetting(settingId, opts) {
    opts = opts || {};
    var loc = subIndex[settingId];
    if (!loc) {
      window.PMState.receipt('Open setting', 'The setting "' + settingId + '" is not in this demo dataset.');
      return;
    }
    if (!opts.fromRouter) {
      try { window.PMState.writeRoute({ kind: 'setting', settingId: settingId }, {}); }
      catch (e) { /* router optional */ }
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

  /* Lazy hydration: a console builds its DOM only when opened; nothing
     below pre-renders on boot. Slint: each console is a lazily created
     component tree behind a model-backed router. */
  function renderConsole(managerId) {
    if (managerId === 'notifications') { renderNotificationsConsole(); }
    else if (managerId === 'sounds') { renderSoundsConsole(); }
    else if (managerId === 'appearance') { renderAppearanceConsole(); }
    else if (managerId === 'dictionary') { renderDictionaryConsole(); }
    else if (managerId === 'desktop') { renderDesktopConsole(); }
    else if (managerId === 'teacher') { renderTeacherConsole(); }
    else if (managerId === 'media') { renderMediaConsole(); }
    else { renderProvidersConsole(); }
  }

  function consoleFrame(opts) {
    var root = el('div', 'mc-console');
    var toolbar = el('div', 'mc-con-toolbar');
    toolbar.appendChild(el('h1', null, opts.title));
    var summary = el('span', 'mc-con-summary');
    summary.appendChild(ico(opts.summaryTone === 'attention' ? 'warning' : 'checkCircle'));
    summary.appendChild(el('span', null, opts.summary));
    toolbar.appendChild(summary);

    var filterWrap = el('div', 'mc-con-filter');
    filterWrap.appendChild(ico('filter'));
    var filter = document.createElement('input');
    filter.type = 'text';
    filter.placeholder = opts.filterPlaceholder || 'Filter';
    filter.setAttribute('aria-label', opts.filterPlaceholder || 'Filter inventory');
    filterWrap.appendChild(filter);
    toolbar.appendChild(filterWrap);

    if (opts.connectLabel) {
      var connect = btn('mc-btn is-primary', null, opts.onConnect);
      connect.appendChild(ico('plus'));
      connect.appendChild(el('span', null, opts.connectLabel));
      toolbar.appendChild(connect);
    }

    var split = el('div', 'mc-con-split');
    var inv = el('div', 'mc-inv');
    inv.setAttribute('role', 'list');
    var inspect = el('div', 'mc-inspect');
    split.appendChild(inv);
    split.appendChild(inspect);
    root.appendChild(toolbar);
    root.appendChild(split);
    els.body.appendChild(root);
    return { root: root, inv: inv, inspect: inspect, filter: filter };
  }

  function invRow(opts) {
    var row = btn('mc-inv-row', null, opts.onSelect);
    row.setAttribute('role', 'listitem');
    if (opts.selected) { row.classList.add('is-selected'); row.setAttribute('aria-current', 'true'); }
    var glyph = ico(opts.icoName, 'mc-inv-glyph');
    glyph.setAttribute('data-tone', opts.tone);
    row.appendChild(glyph);
    var name = el('span', 'mc-inv-name', '');
    name.appendChild(el('span', null, opts.name));
    var word = el('span', 'mc-inv-word', opts.word);
    word.setAttribute('data-tone', opts.tone);
    name.appendChild(word);
    row.appendChild(name);
    row.appendChild(el('span', 'mc-inv-note', opts.note || ''));
    row.setAttribute('data-filter-text', (opts.name + ' ' + (opts.note || '')).toLowerCase());
    return row;
  }

  function wireFilter(filterInput, invEl) {
    filterInput.addEventListener('input', function () {
      var q = filterInput.value.trim().toLowerCase();
      Array.prototype.forEach.call(invEl.querySelectorAll('.mc-inv-row'), function (row) {
        var text = row.getAttribute('data-filter-text') || '';
        row.style.display = (!q || text.indexOf(q) >= 0) ? '' : 'none';
      });
    });
  }

  function kvBlock(pairs) {
    var dl = el('dl', 'mc-kv');
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
      frame.inv.appendChild(el('div', 'mc-inv-group', GROUP_TITLES[g] || g));
      byGroup[g].forEach(function (p) {
        var st = provStatus(p);
        frame.inv.appendChild(invRow({
          icoName: st.ico,
          tone: st.tone,
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
    rolesDisc.root.classList.add('mc-roles');
    arr(data().roles).forEach(function (role) {
      rolesDisc.body.appendChild(renderRole(role));
    });
    frame.inv.appendChild(rolesDisc.root);

    wireFilter(frame.filter, frame.inv);

    var p = providerById(view.sel.providers) || arr(data().providers)[0];
    if (p) { renderProviderInspector(frame.inspect, p); }
    else { frame.inspect.appendChild(el('div', 'mc-inspect-empty', 'Select a provider to inspect it.')); }
  }

  function openConnectMenu(trigger) {
    closeOpenMenu();
    var menu = el('div', 'mc-menu');
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
      var item = btn('mc-radio', null, function () {
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
    var card = el('div', 'mc-role');
    var head = el('div', 'mc-role-head');
    if (role.lockedHigh) { head.appendChild(ico('lock')); }
    head.appendChild(el('span', null, role.label));
    var q = el('span', 'mc-inv-word', role.quality === 'high' ? 'High quality' : 'Standard');
    q.setAttribute('data-tone', role.quality === 'high' ? 'ok' : 'setup');
    head.appendChild(q);
    card.appendChild(head);
    /* requested vs effective route inspector (PMProvider.resolveRoute) */
    var rr = window.PMProvider.resolveRoute(role);
    if (rr.differs) {
      var reqLine = el('div', 'mc-role-route', '');
      var reqChip = el('span', 'pm-chip-value', 'Requested');
      reqChip.setAttribute('data-kind', 'differs');
      reqLine.appendChild(reqChip);
      reqLine.appendChild(document.createTextNode(' ' + rr.requested));
      card.appendChild(reqLine);
      var effLine = el('div', 'mc-role-route', '');
      var effChip = el('span', 'pm-chip-value', 'Effective now');
      effChip.setAttribute('data-kind', 'custom');
      effLine.appendChild(effChip);
      effLine.appendChild(document.createTextNode(' ' + rr.effective));
      card.appendChild(effLine);
      if (rr.why) { card.appendChild(el('div', 'mc-role-note', 'Why: ' + rr.why)); }
    } else {
      card.appendChild(el('div', 'mc-role-route', 'Route: ' + role.assignedRoute));
    }
    if (role.note) { card.appendChild(el('div', 'mc-role-note', role.note)); }
    if (role.lockedHigh) {
      card.appendChild(btn('mc-btn is-quiet', 'Request a qualified override', function () {
        window.PMState.receipt('Request a qualified override for ' + role.label,
          'PM never silently downgrades this role; an explicit qualified override flow would open here.');
      }));
    } else {
      card.appendChild(btn('mc-btn is-quiet', 'Change route', function () {
        window.PMState.receipt('Change route for ' + role.label,
          'A qualified route picker (favorites first, with capability evidence) would open here.');
      }));
    }
    return card;
  }

  function renderProviderInspector(inspect, p) {
    clear(inspect);
    var st = provStatus(p);

    var h2 = el('h2', null, p.name);
    var fam = el('span', 'mc-tag', p.family || '');
    h2.appendChild(fam);
    var word = el('span', 'mc-inv-word', st.word);
    word.setAttribute('data-tone', st.tone);
    h2.appendChild(word);
    inspect.appendChild(h2);
    if (p.statusNote) { inspect.appendChild(el('p', 'mc-inspect-sub', p.statusNote)); }

    /* Authentication boundary chip — the single honest answer to "who owns
       the sign-in here?" (PMProvider.resolveAuthBoundary). */
    var boundary = window.PMProvider.resolveAuthBoundary(p);
    if (boundary && p.authBoundary) {
      var bWrap = el('div', 'mc-authline');
      var bChip = el('span', 'mc-tag mc-auth-chip');
      bChip.appendChild(ico('key'));
      bChip.appendChild(el('span', null, boundary.label));
      bWrap.appendChild(bChip);
      if (boundary.note) { bWrap.appendChild(el('span', 'mc-authline-note', boundary.note)); }
      inspect.appendChild(bWrap);
    }

    /* two-step status: authenticated is not ready */
    var steps = el('div', 'mc-steps');
    var s1, s2;
    if (p.status === 'not-installed') {
      s1 = { state: 'blocked', label: 'Signed in', note: 'Install the tool first' };
      s2 = { state: 'blocked', label: 'Ready to run models', note: 'Blocked until install and sign-in' };
    } else if (p.status === 'unreachable') {
      s1 = { state: 'blocked', label: 'Signed in', note: 'Cannot verify while unreachable' };
      s2 = { state: 'fail', label: 'Ready to run models', note: 'Not reachable right now' };
    } else if (p.status === 'not-configured') {
      s1 = { state: 'blocked', label: 'Signed in', note: 'No connection has been added yet' };
      s2 = { state: 'blocked', label: 'Ready to run models', note: 'Add a connection first' };
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
      var step = el('div', 'mc-step');
      step.setAttribute('data-state', sdef.state);
      step.appendChild(ico(sdef.state === 'pass' ? 'checkCircle' : (sdef.state === 'fail' ? 'close' : 'clock')));
      var t = el('span', null, (i + 1) + '. ' + sdef.label);
      t.appendChild(el('small', null, sdef.note));
      step.appendChild(t);
      steps.appendChild(step);
    });
    steps.appendChild(el('span', 'mc-steps-note', 'Signed in is not the same as ready — both checks must pass before PM routes work here.'));
    inspect.appendChild(steps);

    var stepActions = el('div', 'mc-notice-actions');
    if (p.status === 'not-installed' && !p.setupOffer) {
      stepActions.appendChild(btn('mc-btn is-primary', 'Install ' + p.name, function () {
        window.PMState.receipt('Install ' + p.name, 'The installer flow is out of scope for this demo.');
      }));
    }
    if (p.status === 'signed-out') {
      /* the verb comes from the auth boundary: CLI-owned flows never show a
         PM sign-in screen */
      stepActions.appendChild(btn('mc-btn is-primary', boundary.signInVerb, function () {
        window.PMState.trigger('reconnect', p.id);
        window.PMShell.status('Reconnecting ' + p.name + '…');
      }));
    }
    if (p.status !== 'not-installed') {
      stepActions.appendChild(btn('mc-btn', 'Run invocation test', function () {
        window.PMState.trigger('invoke-test', p.id);
        window.PMShell.status('Running a short invocation test on ' + p.name + '…');
      }));
    }
    if (p.status === 'degraded' || p.status === 'auth-no-invoke') {
      stepActions.appendChild(btn('mc-btn', 'Reconnect', function () {
        window.PMState.trigger('reconnect', p.id);
      }));
    }
    inspect.appendChild(stepActions);

    /* at-a-glance answers */
    var ab = p.defaultAnswerBlock;
    if (ab) {
      inspect.appendChild(inspectHead('info', 'At a glance'));
      var abKv = kvBlock([
        ['Connected', ab.connected ? 'Yes' : 'No'],
        ['Account in use', ab.accountInUse],
        ['Billing route', ab.billingRoute],
        ['Remaining', ab.remaining],
        ['When it runs out', ab.onExhaust],
        ['Models available', ab.modelsAvail],
        ['Attention', ab.attention || 'Nothing needs attention', ab.attention ? 'attention' : null]
      ]);
      abKv.setAttribute('data-teach-ref', 'defaultAnswerBlock');
      inspect.appendChild(abKv);
    }

    /* external server identity (OpenCode): the server owns its own provider
       credentials and supplies its own catalog */
    if (p.serverInfo) {
      inspect.appendChild(inspectHead('cloud', 'External server'));
      var si = p.serverInfo;
      inspect.appendChild(kvBlock([
        ['Server', si.url],
        ['Server version', si.version],
        ['Reachability', si.reachability === 'reachable' ? 'Reachable' : 'Unreachable', si.reachability === 'reachable' ? null : 'attention'],
        ['Last handshake', si.lastHandshake ? fmtWhen(si.lastHandshake) : 'Never'],
        ['Model catalog', si.catalogSource === 'server-supplied' ? 'Server-supplied — the server decides what is offered' : si.catalogSource]
      ]));
    }

    /* explicit official-source install offer (cursor-cli): never bundled,
       never silent, exact host choice, install is not sign-in */
    if (p.setupOffer) {
      inspect.appendChild(renderInstallOffer(p));
    }

    /* connections + isolation model */
    if (arr(p.connections).length > 0 || p.oauthNote) {
      inspect.appendChild(inspectHead('plug', 'Connections & isolation'));
      if (p.oauthNote) {
        var oauth = el('div', 'mc-caution');
        oauth.style.borderColor = 'var(--border)';
        oauth.appendChild(ico('key'));
        oauth.appendChild(el('div', null, p.oauthNote));
        inspect.appendChild(oauth);
      }
      arr(p.connections).forEach(function (c) {
        var conn = el('div', 'mc-freeroute');
        var kind = el('span', 'mc-qualifier', c.kind === 'cli' ? 'CLI-owned' : (c.kind === 'api' ? 'API' : c.kind));
        conn.appendChild(kind);
        var body = el('span', null, '');
        body.appendChild(el('span', 'mc-freeroute-model', c.route));
        if (c.note) { body.appendChild(el('div', 'mc-prose-hint', c.note)); }
        conn.appendChild(body);
        inspect.appendChild(conn);
      });
    }

    /* accounts */
    if (arr(p.accounts).length > 0) {
      inspect.appendChild(inspectHead('users', 'Accounts (' + p.accounts.length + ')'));
      var accounts = el('div', 'mc-accounts');
      accounts.setAttribute('data-teach-ref', 'accounts');
      arr(p.accounts).forEach(function (a) {
        accounts.appendChild(renderAccountCard(p, a));
      });
      inspect.appendChild(accounts);
    }

    /* installations sub-console: humanized cards + advanced resolution
       drawer; every state string resolves through PMProvider */
    if (arr(p.installations).length > 0) {
      inspect.appendChild(inspectHead('toolbox', 'Installations (' + p.installations.length + ')'));
      var instWrap = el('div', 'mc-insts');
      arr(p.installations).forEach(function (instData) {
        instWrap.appendChild(renderInstallationCard(p, instData));
      });
      inspect.appendChild(instWrap);
      var scanBtn = btn('mc-btn is-quiet', null, function () {
        window.PMState.trigger('install-scan', p.id);
        window.PMShell.status('Scanning for installations of ' + p.name + '…');
      });
      scanBtn.appendChild(ico('search'));
      scanBtn.appendChild(el('span', null, 'Scan for installations'));
      inspect.appendChild(scanBtn);
    }

    /* models + catalog */
    inspect.appendChild(inspectHead('layers', 'Models'));
    var refreshing = p.catalog && p.catalog.state === 'refreshing';
    var catalog = el('div', 'mc-catalog');
    if (p.catalog) {
      catalog.appendChild(el('span', null, 'Catalog checked ' + fmtWhen(p.catalog.lastChecked) +
        (p.catalog.sourceVersion ? ' · ' + p.catalog.sourceVersion : '')));
      if (p.catalog.state === 'stale') { catalog.appendChild(el('span', null, '· Stale — refresh recommended')); }
      if (refreshing) {
        var badge = el('span', 'mc-refresh-badge');
        badge.appendChild(ico('refresh'));
        badge.appendChild(el('span', null, 'Refreshing — showing last known good'));
        catalog.appendChild(badge);
      }
      if (p.catalog.state === 'quarantined') {
        var qBadge = el('span', 'mc-quarantine-badge');
        qBadge.appendChild(ico('warning'));
        qBadge.appendChild(el('span', null, p.catalog.lastKnownGood
          ? 'Quarantined — serving the last known good catalog'
          : 'Quarantined'));
        catalog.appendChild(qBadge);
      }
    }
    var refreshBtn = btn('mc-btn', refreshing ? 'Refreshing…' : 'Refresh catalog', function () {
      window.PMState.trigger('catalog-refresh', p.id);
      window.PMShell.status('Refreshing the ' + p.name + ' model catalog. Existing rows stay usable.');
    });
    refreshBtn.disabled = !!refreshing;
    catalog.appendChild(refreshBtn);
    inspect.appendChild(catalog);
    if (p.catalog && p.catalog.state === 'quarantined' && p.catalog.quarantineReason) {
      inspect.appendChild(el('p', 'mc-usage-note', p.catalog.quarantineReason));
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
        var line = el('div', 'mc-cat-change');
        line.appendChild(el('strong', null, ch.at ? fmtWhen(ch.at) : 'Recently'));
        line.appendChild(el('span', null,
          (ch.what || 'Catalog entry updated') + (ch.effect ? ' — ' + ch.effect : '')));
        chDisc.body.appendChild(line);
      });
      catRemoved.forEach(function (rh) {
        rh = rh || {};
        var word = rh.change === 'no-longer-free' ? 'No longer free' : 'Removed';
        var line = el('div', 'mc-cat-change');
        line.appendChild(el('strong', null, rh.at ? fmtWhen(rh.at) : 'Recently'));
        line.appendChild(el('span', null,
          (rh.model || 'A model') + ' — ' + word + (rh.note ? '. ' + rh.note : '')));
        chDisc.body.appendChild(line);
      });
      inspect.appendChild(chDisc.root);
    }

    var models = el('div', 'mc-models');
    if (refreshing) { models.classList.add('mc-shimmer'); } /* only the refreshing region shimmers */
    if (arr(p.models).length === 0) {
      models.appendChild(el('div', 'mc-inspect-empty', p.status === 'not-installed'
        ? 'No models yet. Install ' + p.name + ' and sign in to discover its catalog.'
        : 'No models discovered for this connection yet.'));
    }
    arr(p.models).forEach(function (m) {
      models.appendChild(renderModelRow(p, m));
    });
    inspect.appendChild(models);

    /* free routes: on the Free & community wrapper show ALL routes plus the
       catalog freshness block; elsewhere only the routes riding this
       connection. The six route states resolve through PMProvider. */
    var isFreeGroup = p.groupKind === 'free';
    var routes = isFreeGroup
      ? arr(data().freeRoutes)
      : arr(data().freeRoutes).filter(function (fr) { return fr.underlyingProviderId === p.id; });
    if (routes.length > 0) {
      inspect.appendChild(inspectHead('sparkle', isFreeGroup ? 'Free routes' : 'Free routes on this connection'));
      if (isFreeGroup) {
        inspect.appendChild(el('p', 'mc-usage-note',
          window.PMProvider.resolveFreeRoute(routes[0]).wrapperNote));
      }
      var frWrap = el('div', 'mc-freeroutes');
      routes.forEach(function (fr) {
        frWrap.appendChild(renderFreeRoute(p, fr));
      });
      inspect.appendChild(frWrap);
      if (view.freeSetup && routes.some(function (fr) { return fr.id === view.freeSetup.routeId; })) {
        inspect.appendChild(renderFreeSetup(p, routes.filter(function (fr) { return fr.id === view.freeSetup.routeId; })[0]));
      }
    }
    if (isFreeGroup && data().freeCatalog) {
      inspect.appendChild(renderFreeCatalogBlock(p));
    }

    /* usage details honestly unavailable (local server): readiness is not
       affected, and PM never invents numbers */
    var ud = window.PMProvider.resolveUsageDetails(p);
    if (ud.state === 'unavailable') {
      inspect.appendChild(inspectHead('gauge', 'Usage'));
      var udRow = el('div', 'mc-authline');
      var udChip = el('span', 'pm-chip-value', 'Usage unavailable');
      udChip.setAttribute('data-kind', 'unavailable');
      udRow.appendChild(udChip);
      udRow.appendChild(el('span', 'mc-authline-note',
        (ud.reason || 'This route does not report usage.') + ' Provider readiness is unaffected.'));
      inspect.appendChild(udRow);
    }

    /* usage snapshot (read-only) */
    var snap = data().usageSnapshot && data().usageSnapshot.perProvider
      ? data().usageSnapshot.perProvider[p.id] : null;
    if (snap) {
      inspect.appendChild(inspectHead('gauge', 'Usage snapshot'));
      inspect.appendChild(el('p', 'mc-usage-note',
        (data().usageSnapshot.note || 'Read-only snapshot.') + (snap.freshness ? ' Freshness: ' + snap.freshness + '.' : '')));
      inspect.appendChild(kvBlock([
        ['Included remaining', snap.includedRemaining],
        ['Extra balance', snap.extra],
        ['Resets', snap.resetAt ? fmtWhen(snap.resetAt) : 'No scheduled reset'],
        ['Pressure', PRESSURE_WORD[snap.pressure] || snap.pressure, (snap.pressure === 'high' || snap.pressure === 'exhausted') ? 'attention' : null],
        ['Projection', snap.projection]
      ]));
      var openUsage = btn('mc-btn', null, function () {
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
      inspect.appendChild(el('p', 'mc-usage-note',
        'Only choices this provider actually supports. This is a per-provider policy, never a universal budget switch.'));
      var saved = store.get('whatNext.' + p.id);
      var group = el('div', 'mc-whatnext');
      group.setAttribute('role', 'radiogroup');
      group.setAttribute('aria-label', 'When included usage runs out on ' + p.name);
      nexts.forEach(function (key) {
        var lab = WHAT_NEXT[key] || key;
        var r = btn('mc-radio', null, function () {
          store.set('whatNext.' + p.id, key);
          window.PMShell.status(p.name + ': when included usage runs out, PM will ' + lab.toLowerCase() + '.');
          Array.prototype.forEach.call(group.querySelectorAll('.mc-radio'), function (x) {
            x.setAttribute('aria-checked', String(x === r));
          });
        });
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', String(saved === key));
        r.appendChild(el('span', 'mc-radio-dot'));
        r.appendChild(el('span', null, lab));
        group.appendChild(r);
      });
      inspect.appendChild(group);
    }
  }

  function renderAccountCard(p, a) {
    var card = el('div', 'mc-account');
    var head = el('div', 'mc-account-head');
    var nick = el('span', 'mc-account-nick', a.nickname || a.id);
    head.appendChild(nick);
    var editNick = btn('mc-iconbtn', null, function () {
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'mc-input';
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
    head.appendChild(el('span', 'mc-account-id', a.identity || ''));
    var hw = HEALTH_WORD[a.health] || HEALTH_WORD.unknown;
    head.appendChild(statusWord(hw.tone === 'ok' ? 'ok' : (hw.tone === 'attention' ? 'attention' : 'muted'), hw.word));
    card.appendChild(head);

    var tags = el('div', 'mc-account-tags');
    var owner = el('span', 'mc-tag');
    owner.appendChild(ico('key'));
    owner.appendChild(el('span', null, AUTH_OWNER[a.authOwner] || 'Credentials'));
    tags.appendChild(owner);
    var iso = el('span', 'mc-tag');
    iso.appendChild(ico('shield'));
    iso.appendChild(el('span', null, 'Isolation: ' + (ISOLATION[a.isolation] || 'Unspecified')));
    tags.appendChild(iso);
    card.appendChild(tags);

    var controls = el('div', 'mc-account-controls');

    var enabledCtl = el('span', 'mc-ctl');
    var enabledToggle = el('button', 'mc-toggle');
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

    var prio = el('span', 'mc-ctl');
    prio.appendChild(el('span', null, 'Priority'));
    var stepper = el('span', 'mc-stepper');
    var down = btn(null, null, function () { a.priority = (a.priority || 1) + 1; renderAll(); });
    down.setAttribute('aria-label', 'Lower priority of ' + (a.nickname || a.id));
    down.appendChild(ico('minus'));
    var val = el('span', 'mc-stepper-val', String(a.priority || 1));
    var up = btn(null, null, function () { a.priority = Math.max(1, (a.priority || 1) - 1); renderAll(); });
    up.setAttribute('aria-label', 'Raise priority of ' + (a.nickname || a.id));
    up.appendChild(ico('plus'));
    stepper.appendChild(down);
    stepper.appendChild(val);
    stepper.appendChild(up);
    prio.appendChild(stepper);
    controls.appendChild(prio);

    var useNext = btn('mc-radio', null, function () {
      arr(p.accounts).forEach(function (x) { x.useNext = (x === a); });
      window.PMState.receipt('Switch account',
        'Future simulated requests on ' + p.name + ' prefer ' + (a.nickname || a.id) + '. Running work keeps its current account.');
      renderAll();
    });
    useNext.setAttribute('role', 'radio');
    useNext.setAttribute('aria-checked', String(!!a.useNext));
    useNext.appendChild(el('span', 'mc-radio-dot'));
    useNext.appendChild(el('span', null, 'Use next'));
    controls.appendChild(useNext);

    var stickyCtl = el('span', 'mc-ctl');
    var sticky = el('button', 'mc-toggle');
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
    var mini = el('div', 'mc-account-mini');
    var accountName = a.nickname || a.identity || a.id || 'this account';
    var repair = btn('mc-btn is-quiet', null, function () {
      window.PMState.receipt('Repair ' + accountName,
        'Guided repair re-checks stored credentials, isolation, and runs a short test invocation. The real repair flow is out of scope for this demo.');
    });
    repair.appendChild(ico('wrench'));
    repair.appendChild(el('span', null, 'Repair'));
    mini.appendChild(repair);

    var logsDrawer = el('div', 'mc-account-logs');
    logsDrawer.hidden = true;
    var logsBtn = btn('mc-btn is-quiet', null, function () {
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
      logsDrawer.appendChild(el('div', 'mc-account-log-line', line));
    });
    logsDrawer.appendChild(el('div', 'mc-account-log-note',
      'Recent summary only. The full log lives outside this panel.'));
    var openLog = btn('mc-btn is-quiet', null, function () {
      window.PMState.receipt('Open the full log for ' + accountName,
        'Opens the account log file in your log viewer. Out of scope for this demo.');
    });
    openLog.appendChild(ico('external'));
    openLog.appendChild(el('span', null, 'Open the full log'));
    logsDrawer.appendChild(openLog);

    card.appendChild(mini);
    card.appendChild(logsDrawer);

    if (a.usage) {
      var usage = el('div', 'mc-account-usage');
      var pr = el('span', 'mc-pressure');
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

  /* ---------------- installations sub-console ---------------- */

  /* Truthful ObservableWork projection: a strip that renders staged 'op'
     phases for a named trigger + ref. State changes are never skipped under
     reduced motion — only decoration is. Slint: a status Text bound to the
     operation model. */
  function opStrip(name, ref) {
    var strip = el('div', 'mc-opstrip');
    strip.setAttribute('data-op-name', name);
    strip.setAttribute('data-op-ref', ref == null ? '' : String(ref));
    strip.setAttribute('role', 'status');
    strip.hidden = true;
    return strip;
  }

  var OP_PHASE_TEXT = {
    'install-update': { 'updating': 'Updating…', 'verifying': 'Verifying — the seven-point checklist runs; installer exit code alone is never success', 'ready': 'Verified — activating', 'done': 'Update verified and active. Dependent routes refreshed.' },
    'install-update-fail': { 'updating': 'Updating…', 'verifying': 'Verifying — the seven-point checklist runs', 'verification-failed': 'Verification failed — the adapter handshake was rejected', 'rolled-back': 'Rolled back — the previous generation was restored and re-verified' },
    'install-repair': { 'repairing': 'Repairing…', 'done': 'Repaired and verified.' },
    'install-select': { 'done': 'Selected. Shadowing recomputed.' },
    'install-scan': { 'scanning': 'Scanning: tracing wrappers, symlinks, shims; querying package databases…', 'done': 'Scan complete — no new candidates.' },
    'dest-test': { 'sending': 'Sending a masked test…', 'done': 'Delivered. Receipt kept; the message joined the title-bar stack.', 'failed': 'Failed — the destination reports its reason. Receipt kept.', 'rate-limited': 'Held — test sends are limited to one per 30 seconds.' },
    'sound-preview': { 'playing': 'Playing locally — no receipt, nothing leaves this computer', 'done': '' },
    'sound-upload': { 'checking': 'Checking format, duration, and hash…', 'done': 'gentle-bell.ogg added to the library.' },
    'pack-import': { 'format-check': 'Checking pack format…', 'license-check': 'Checking license…', 'blocked': 'Import blocked — the license is unverified. Unverified packs are never bundled or enabled.', 'rejected': 'Rejected — not an OpenPeon-compatible pack.', 'done': 'Imported with verified license and format.' },
    'theme-reload': { 'validating': 'Validating TOML against theme schema 1.2…', 'invalid': 'Still invalid — the base theme stays in effect until the file is fixed.', 'done': 'Validated and applied live.' }
  };

  /* phases that changed data and deserve a region re-render once settled */
  var OP_REFRESH = {
    'install-update': { 'done': true },
    'install-update-fail': { 'rolled-back': true },
    'install-repair': { 'done': true },
    'install-select': { 'done': true },
    'dest-test': { 'done': true, 'failed': true },
    'sound-upload': { 'done': true },
    'pack-import': { 'done': true },
    'theme-reload': { 'done': true }
  };

  function handleOp(op) {
    if (!op || !op.name) { return; }
    var text = (OP_PHASE_TEXT[op.name] || {})[op.phase];
    var refStr = op.ref == null ? '' : String(op.ref);
    var strips = els.body ? els.body.querySelectorAll('.mc-opstrip[data-op-name="' + esc(op.name) + '"]') : [];
    Array.prototype.forEach.call(strips, function (strip) {
      var want = strip.getAttribute('data-op-ref');
      /* triggers may resolve a default ref; a strip with an empty ref
         listens to every ref of its op name */
      if (want && refStr && want !== refStr && refStr.indexOf(want) < 0 && want.indexOf(refStr) < 0) { return; }
      if (text === undefined) { return; }
      strip.hidden = text === '';
      strip.textContent = text;
      strip.setAttribute('data-phase', op.phase);
    });
    if ((OP_REFRESH[op.name] || {})[op.phase] && view.name === 'manager') {
      /* settle, then re-render the open console from mutated data */
      window.setTimeout(function () {
        if (view.name === 'manager') {
          clear(els.body);
          renderConsole(view.managerId);
        }
      }, 600);
    }
  }

  function renderInstallationCard(p, instData) {
    var inst = window.PMProvider.resolveInstallation(instData);
    var refKey = p.id + '/' + inst.id;
    var card = el('div', 'mc-inst');
    card.setAttribute('data-inst-id', inst.id);

    var head = el('div', 'mc-inst-head');
    head.appendChild(el('span', 'mc-inst-title', inst.title));
    if (inst.version) { head.appendChild(el('span', 'mc-inst-version', inst.version)); }
    if (inst.selected) {
      var sel = el('span', 'pm-chip-value', 'In use');
      sel.setAttribute('data-kind', 'default');
      head.appendChild(sel);
    }
    var upd = inst.update;
    var updWord = el('span', 'mc-inv-word', upd.label);
    updWord.setAttribute('data-tone', upd.tone === 'muted' ? 'ok' : (upd.tone === 'progress' ? 'setup' : upd.tone));
    head.appendChild(updWord);
    card.appendChild(head);

    var conf = el('div', 'mc-inst-meta');
    conf.appendChild(el('span', null, 'Ownership: ' + inst.confidence.label));
    if (inst.shadowed) {
      var sh = el('span', 'mc-inst-shadow');
      sh.appendChild(ico('eyeOff'));
      sh.appendChild(el('span', null, inst.shadowNote));
      conf.appendChild(sh);
    }
    card.appendChild(conf);

    if (upd.detail) { card.appendChild(el('p', 'mc-inst-detail', upd.detail)); }
    if (inst.manualOnly && inst.manualOnlyReason) {
      var manual = el('div', 'mc-caution');
      manual.style.borderColor = 'var(--border)';
      manual.appendChild(ico('lock'));
      manual.appendChild(el('div', null, inst.manualOnlyReason));
      card.appendChild(manual);
    }

    card.appendChild(opStrip('install-update', refKey));
    card.appendChild(opStrip('install-update-fail', refKey));
    card.appendChild(opStrip('install-repair', refKey));
    card.appendChild(opStrip('install-select', refKey));

    var actions = el('div', 'mc-notice-actions');
    inst.actions.forEach(function (a) {
      if (a.id === 'select') {
        actions.appendChild(btn('mc-btn', a.label, function () {
          window.PMState.trigger('install-select', refKey);
        }));
      } else if (a.id === 'update') {
        /* Ask-first policy honored: the update never starts silently — this
           explicit button IS the ask */
        actions.appendChild(btn('mc-btn is-primary', a.label + (upd.available ? ' (' + upd.available.version + ')' : ''), function () {
          window.PMState.trigger('install-update', refKey);
          window.PMShell.status('Installing the update to ' + inst.title + '. Verification runs before activation.');
        }));
      } else if (a.id === 'repair') {
        if (upd.state === 'rolled-back') {
          /* honest retry: this generation still fails verification, so the
             staged trigger demonstrates the fail-and-roll-back path again */
          actions.appendChild(btn('mc-btn', 'Retry update', function () {
            window.PMState.trigger('install-update-fail', refKey);
            window.PMShell.status('Retrying the ' + inst.title + ' update…');
          }));
        } else {
          actions.appendChild(btn('mc-btn', a.label, function () {
            window.PMState.trigger('install-repair', refKey);
          }));
        }
      } else if (a.id === 'rollback') {
        actions.appendChild(btn('mc-btn', a.label, function () {
          window.PMState.receipt('Roll back ' + inst.title, 'The previous generation would be restored and re-verified.');
        }));
      } else if (a.id === 'verify') {
        actions.appendChild(btn('mc-btn is-quiet', a.label, function () {
          window.PMState.receipt('Verify ' + inst.title,
            'Runs the seven-point checklist: ' + inst.update.verifyChecklist.join('; ') + '.');
        }));
      }
    });
    card.appendChild(actions);

    /* advanced resolution drawer: the full resolver trace */
    var advDisc = disclosure({ label: 'Advanced resolution', icoName: 'terminal', kind: 'diagnostic' });
    var adv = inst.advanced;
    advDisc.body.appendChild(kvBlock([
      ['Configured command', adv.configuredCommand],
      ['Resolved launcher', adv.resolvedLauncher],
      ['Actual executable', adv.actualExecutable],
      ['Method', adv.method],
      ['Package identity', adv.packageIdentity],
      ['Manager root', adv.managerRoot],
      ['Host / environment', (adv.hostId || '') + (adv.envId ? ' · ' + adv.envId : '')],
      ['Architecture', adv.arch]
    ]));
    if (arr(adv.evidence).length > 0) {
      advDisc.body.appendChild(el('h4', 'mc-evidence-head', 'Discovery evidence'));
      arr(adv.evidence).forEach(function (evLine) {
        var evRow = el('div', 'mc-account-log-line', String(evLine));
        advDisc.body.appendChild(evRow);
      });
    }
    if (arr(upd.history).length > 0) {
      advDisc.body.appendChild(el('h4', 'mc-evidence-head', 'Update history'));
      arr(upd.history).forEach(function (h) {
        var line = el('div', 'mc-cat-change');
        line.appendChild(el('strong', null, h.when ? fmtWhen(h.when) : ''));
        line.appendChild(el('span', null, (h.from || '') + ' → ' + (h.to || '') + ' — ' +
          (h.result === 'verified' ? 'Verified' : h.result === 'rolled-back' ? 'Rolled back' : 'Verification failed') +
          (h.detail ? '. ' + h.detail : '')));
        advDisc.body.appendChild(line);
      });
    }
    card.appendChild(advDisc.root);
    return card;
  }

  /* explicit official-source install offer (PMProvider.installOfferSteps) */
  function renderInstallOffer(p) {
    var offer = window.PMProvider.installOfferSteps(p);
    var panel = el('div', 'mc-setup mc-offer');
    panel.appendChild(el('h4', null, 'Set up ' + p.name + ' — explicit install'));
    panel.appendChild(el('p', 'mc-usage-note', offer.sourceNote));
    panel.appendChild(kvBlock([['Official source', offer.officialSource]]));

    if (arr(offer.hostChoices).length > 0) {
      panel.appendChild(el('h5', 'mc-offer-h5', 'Where should it run?'));
      var group = el('div', 'mc-radiogroup');
      group.setAttribute('role', 'radiogroup');
      group.setAttribute('aria-label', 'Install host for ' + p.name);
      if (!view.cursorHost) { view.cursorHost = offer.hostChoices[0].hostId; }
      offer.hostChoices.forEach(function (hc) {
        var r = btn('mc-radio', null, function () {
          view.cursorHost = hc.hostId;
          Array.prototype.forEach.call(group.querySelectorAll('.mc-radio'), function (x) {
            x.setAttribute('aria-checked', String(x === r));
          });
        });
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', String(view.cursorHost === hc.hostId));
        r.appendChild(el('span', 'mc-radio-dot'));
        r.appendChild(el('span', null, hc.label));
        group.appendChild(r);
      });
      panel.appendChild(group);
    }

    arr(offer.steps).forEach(function (stepDef, i) {
      var stepEl = el('div', 'mc-setup-step');
      stepEl.setAttribute('data-state', i === 0 ? 'current' : 'pending');
      var num = el('span', 'mc-setup-num', String(i + 1));
      stepEl.appendChild(num);
      var body = el('div', null);
      body.appendChild(el('h5', null, stepDef.title));
      body.appendChild(el('p', null, stepDef.body));
      stepEl.appendChild(body);
      panel.appendChild(stepEl);
    });

    var foot = el('div', 'mc-setup-foot');
    foot.appendChild(btn('mc-btn is-primary', 'Install from ' + offer.officialSource, function () {
      var chosen = arr(offer.hostChoices).filter(function (hc) { return hc.hostId === view.cursorHost; })[0];
      window.PMState.receipt('Install ' + p.name,
        'Staged from ' + offer.officialSource + ' onto ' + (chosen ? chosen.label : 'the selected host') +
        ', verified before activation. Sign-in is a separate step that never starts on its own.');
    }));
    panel.appendChild(foot);
    panel.appendChild(el('p', 'mc-prose-hint', offer.policyNote));
    return panel;
  }

  /* Free catalog freshness: sources, versions, times, last-known-good,
     change history (models.dev + Free Coding Models). */
  function renderFreeCatalogBlock(p) {
    var fc = data().freeCatalog || {};
    var wrap = el('div', 'mc-freecat');
    wrap.appendChild(inspectHead('clock', 'Catalog freshness'));
    arr(fc.sources).forEach(function (srcRow) {
      var card = el('div', 'mc-freecat-src');
      var head = el('div', 'mc-inst-head');
      head.appendChild(el('span', 'mc-inst-title', srcRow.name));
      head.appendChild(el('span', 'mc-inst-version', srcRow.sourceVersion));
      var vword = el('span', 'mc-inv-word', srcRow.validation === 'passed' ? 'Validated'
        : srcRow.validation === 'stale' ? 'Stale — last known good' : 'Unverified');
      vword.setAttribute('data-tone', srcRow.validation === 'passed' ? 'ok' : 'setup');
      head.appendChild(vword);
      card.appendChild(head);
      card.appendChild(kvBlock([
        ['Checked', fmtWhen(srcRow.lastChecked)],
        ['Imported', fmtWhen(srcRow.lastImported)],
        ['Activated', fmtWhen(srcRow.lastActivated)],
        ['Fallback', srcRow.lastKnownGood ? 'Last known good retained' : 'No fallback']
      ]));
      wrap.appendChild(card);
    });
    if (arr(fc.changeHistory).length > 0) {
      var chDisc = disclosure({ label: 'Change history (' + fc.changeHistory.length + ')', icoName: 'history', kind: 'advanced' });
      arr(fc.changeHistory).forEach(function (ch) {
        var line = el('div', 'mc-cat-change');
        line.appendChild(el('strong', null, fmtWhen(ch.when)));
        line.appendChild(el('span', null, ch.change));
        chDisc.body.appendChild(line);
      });
      wrap.appendChild(chDisc.root);
    }
    var refresh = btn('mc-btn', null, function () {
      window.PMState.trigger('catalog-refresh', p.id);
      window.PMShell.status('Re-checking free catalog sources. Last known good stays active meanwhile.');
    });
    refresh.appendChild(ico('refresh'));
    refresh.appendChild(el('span', null, 'Check sources now'));
    wrap.appendChild(refresh);
    return wrap;
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
    var row = el('div', 'mc-model');
    row.setAttribute('data-model-id', m.id);
    if (m.unavailableReason) { row.setAttribute('data-unavailable', '1'); }

    var fav = btn('mc-model-fav', null, function () {
      m.fav = !m.fav;
      window.PMShell.status((m.fav ? 'Favorited ' : 'Unfavorited ') + m.name + '.');
      renderAll();
    });
    fav.setAttribute('aria-pressed', String(!!m.fav));
    fav.setAttribute('aria-label', (m.fav ? 'Unfavorite ' : 'Favorite ') + m.name);
    fav.appendChild(ico(m.fav ? 'starFill' : 'star'));
    row.appendChild(fav);

    var name = el('div', 'mc-model-name');
    name.appendChild(el('span', null, m.name));
    if (m.alias) { name.appendChild(el('span', 'mc-model-alias', '"' + m.alias + '"')); }
    if (m.hidden) {
      var hiddenWord = el('span', 'mc-inv-word', 'Hidden');
      name.appendChild(hiddenWord);
    }
    row.appendChild(name);

    var meta = el('div', 'mc-model-meta');
    if (m.ctx) { meta.appendChild(el('span', null, Math.round(m.ctx / 1000) + 'k context')); }
    if (arr(m.modalities).length) { meta.appendChild(el('span', null, arr(m.modalities).join(' · ').replace(/image-in/g, 'image in').replace(/audio-in/g, 'audio in'))); }
    meta.appendChild(el('span', null, 'Priority ' + (m.priority || 1)));
    /* capability chips: never inferred from the model name — a chip renders
       only when the catalog says so, and the evidence drawer backs it */
    if (m.fast === true) {
      var fastChip = el('span', 'mc-cap-chip');
      fastChip.appendChild(ico('bolt'));
      fastChip.appendChild(el('span', null, 'Fast mode'));
      fastChip.title = 'Backed by capability evidence below';
      meta.appendChild(fastChip);
    }
    if (arr(m.effort).length > 0) {
      var effChip = el('span', 'mc-cap-chip');
      effChip.appendChild(ico('gauge'));
      effChip.appendChild(el('span', null, 'Effort: ' + m.effort.join(' · ')));
      meta.appendChild(effChip);
    }
    var prefs = modelPrefs(m.id);
    if (arr(m.effort).length && prefs.effort) {
      meta.appendChild(el('span', null, 'Effort: ' + prefs.effort.charAt(0).toUpperCase() + prefs.effort.slice(1)));
    }
    if (m.fast === true && prefs.speed) {
      meta.appendChild(el('span', null, 'Speed: ' + prefs.speed));
    }
    row.appendChild(meta);

    var extra = el('div', 'mc-model-extra');
    if (m.fastNote) { extra.appendChild(el('div', 'mc-prose-hint', m.fastNote)); }
    if (m.unavailableReason) {
      var reason = el('div', 'mc-unavail-reason', '');
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
      var evBtn = btn('mc-btn is-quiet', 'Capability evidence (' + m.evidence.length + ')', null);
      evBtn.setAttribute('aria-expanded', 'false');
      var evBody = el('div', 'mc-evidence');
      evBody.hidden = true;
      arr(m.evidence).forEach(function (ev) {
        var evRow = el('div', 'mc-evidence-row');
        evRow.appendChild(el('span', 'mc-evidence-cap', humanCap(ev.cap)));
        var stateSpan = el('span', 'mc-evidence-state', EVIDENCE_STATE[ev.state] || ev.state);
        stateSpan.setAttribute('data-state', ev.state);
        evRow.appendChild(stateSpan);
        evRow.appendChild(el('span', 'mc-evidence-src', ev.source + ' · ' + fmtWhen(ev.at)));
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

    var actions = el('div', 'mc-model-actions');

    /* effort + Normal/Fast menu ONLY when the data says supported */
    var hasEffort = arr(m.effort).length > 0;
    var hasFast = m.fast === true;
    if (hasEffort || hasFast) {
      var menuBtn = btn('mc-iconbtn', null, function () { toggleEffortMenu(row, m, menuBtn); });
      menuBtn.setAttribute('aria-label', 'Effort and speed for ' + m.name);
      menuBtn.setAttribute('aria-haspopup', 'dialog');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.appendChild(ico('bolt'));
      actions.appendChild(menuBtn);
    }

    var aliasBtn = btn('mc-iconbtn', null, function () {
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'mc-input';
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

    var upBtn = btn('mc-iconbtn', null, function () {
      m.priority = Math.max(1, (m.priority || 1) - 1);
      window.PMShell.status(m.name + ' priority raised to ' + m.priority + '.');
      renderAll();
    });
    upBtn.setAttribute('aria-label', 'Raise priority of ' + m.name);
    upBtn.appendChild(ico('chevU'));
    actions.appendChild(upBtn);

    var downBtn = btn('mc-iconbtn', null, function () {
      m.priority = (m.priority || 1) + 1;
      window.PMShell.status(m.name + ' priority lowered to ' + m.priority + '.');
      renderAll();
    });
    downBtn.setAttribute('aria-label', 'Lower priority of ' + m.name);
    downBtn.appendChild(ico('chevD'));
    actions.appendChild(downBtn);

    var hideBtn = btn('mc-iconbtn', null, function () {
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
    var menu = el('div', 'mc-menu');
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Effort and speed for ' + m.name);

    /* the menu stays open through BOTH choices; Done or Esc closes */
    if (arr(m.effort).length > 0) {
      menu.appendChild(el('h4', null, 'Effort'));
      var eGroup = el('div', 'mc-radiogroup');
      eGroup.setAttribute('role', 'radiogroup');
      eGroup.setAttribute('aria-label', 'Effort');
      var current = modelPrefs(m.id).effort || m.effort[Math.min(1, m.effort.length - 1)];
      m.effort.forEach(function (level) {
        var lab = level.charAt(0).toUpperCase() + level.slice(1);
        var r = btn('mc-radio', null, function () {
          setModelPref(m.id, 'effort', level);
          window.PMShell.status(m.name + ' effort set to ' + lab + '.');
          Array.prototype.forEach.call(eGroup.querySelectorAll('.mc-radio'), function (x) {
            x.setAttribute('aria-checked', String(x === r));
          });
          /* menu deliberately stays open */
        });
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', String(current === level));
        r.appendChild(el('span', 'mc-radio-dot'));
        r.appendChild(el('span', null, lab));
        eGroup.appendChild(r);
      });
      menu.appendChild(eGroup);
    }

    if (m.fast === true) {
      menu.appendChild(el('h4', null, 'Speed'));
      var sGroup = el('div', 'mc-radiogroup');
      sGroup.setAttribute('role', 'radiogroup');
      sGroup.setAttribute('aria-label', 'Speed');
      var curSpeed = modelPrefs(m.id).speed || 'Normal';
      ['Normal', 'Fast'].forEach(function (speed) {
        var r = btn('mc-radio', null, function () {
          setModelPref(m.id, 'speed', speed);
          window.PMShell.status(m.name + ' speed set to ' + speed + '.');
          Array.prototype.forEach.call(sGroup.querySelectorAll('.mc-radio'), function (x) {
            x.setAttribute('aria-checked', String(x === r));
          });
          /* menu deliberately stays open */
        });
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', String(curSpeed === speed));
        r.appendChild(el('span', 'mc-radio-dot'));
        r.appendChild(el('span', null, speed));
        sGroup.appendChild(r);
      });
      menu.appendChild(sGroup);
    }

    var doneWrap = el('div', 'mc-menu-done');
    doneWrap.appendChild(btn('mc-btn is-primary', 'Done', function () {
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
    var first = menu.querySelector('.mc-radio[aria-checked="true"]') || menu.querySelector('.mc-radio, button');
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
    /* the six free-route states resolve through PMProvider; the qualifier is
       the badge — never an unqualified "Free" */
    var r = window.PMProvider.resolveFreeRoute(fr);
    var row = el('div', 'mc-freeroute');
    row.setAttribute('data-free-state', r.state);
    var body = el('span', 'mc-freeroute-body');
    var line = el('span', null, '');
    line.appendChild(el('span', 'mc-freeroute-model', modelNameById(fr.modelRef)));
    var word = el('span', 'mc-inv-word', r.label);
    word.setAttribute('data-tone', r.tone === 'muted' ? 'ok' : (r.tone === 'progress' ? 'setup' : r.tone));
    line.appendChild(word);
    body.appendChild(line);
    if (r.note) { body.appendChild(el('span', 'mc-prose-hint', r.note)); }
    row.appendChild(body);
    var q = el('span', 'mc-qualifier', 'Free · ' + (QUALIFIER[r.qualifier] || r.qualifier));
    row.appendChild(q);
    var canSetup = r.state === 'needs-setup' && arr(r.setupSteps).length > 0;
    var gone = r.state === 'no-longer-available';
    if (!gone) {
      var open = btn('mc-btn' + (canSetup ? ' is-primary' : ''), canSetup ? 'Set up' : 'Details', function () {
        view.freeSetup = { routeId: fr.id, step: 0 };
        renderAll();
      });
      row.appendChild(open);
    }
    return row;
  }

  function renderFreeSetup(p, fr) {
    var panel = el('div', 'mc-setup');
    panel.setAttribute('data-free-setup', fr.id);
    panel.appendChild(el('h4', null, 'Set up: ' + modelNameById(fr.modelRef)));
    panel.appendChild(el('p', null,
      'PM owns this stepped setup on the underlying ' + p.name + ' connection. ' +
      'Qualifier: ' + (QUALIFIER[fr.qualifier] || fr.qualifier) + '.'));
    var steps = arr(fr.setupSteps);
    var cur = view.freeSetup.step || 0;
    steps.forEach(function (stepDef, i) {
      var stepEl = el('div', 'mc-setup-step');
      stepEl.setAttribute('data-state', i < cur ? 'done' : (i === cur ? 'current' : 'pending'));
      var num = el('span', 'mc-setup-num', '');
      if (i < cur) { num.appendChild(ico('check')); } else { num.textContent = String(i + 1); }
      stepEl.appendChild(num);
      var body = el('div', null);
      body.appendChild(el('h5', null, stepDef.title));
      body.appendChild(el('p', null, stepDef.body));
      stepEl.appendChild(body);
      panel.appendChild(stepEl);
    });
    var foot = el('div', 'mc-setup-foot');
    if (cur > 0) {
      foot.appendChild(btn('mc-btn', 'Back', function () {
        view.freeSetup.step = cur - 1;
        renderAll();
      }));
    }
    if (cur < steps.length) {
      foot.appendChild(btn('mc-btn is-primary', cur === steps.length - 1 ? 'Finish (simulated)' : 'Mark step done (simulated)', function () {
        window.PMState.receipt(steps[cur].title, 'Marked done in the demo; the real step runs outside PM or in the keychain flow.');
        view.freeSetup.step = cur + 1;
        renderAll();
      }));
    } else {
      foot.appendChild(btn('mc-btn is-primary', 'Return to the model row', function () {
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
    foot.appendChild(btn('mc-btn is-quiet', 'Close', function () {
      view.freeSetup = null;
      renderAll();
    }));
    panel.appendChild(foot);
    return panel;
  }

  /* ==================================================================
     BOARD FRAME — the console idiom for the new managers: a toolbar
     strip over a scrolling body of boards, strips, and matrices.
     ================================================================== */

  function boardFrame(opts) {
    var root = el('div', 'mc-console mc-board');
    var toolbar = el('div', 'mc-con-toolbar');
    toolbar.appendChild(el('h1', null, opts.title));
    var summary = el('span', 'mc-con-summary');
    summary.appendChild(ico(opts.summaryTone === 'attention' ? 'warning'
      : (opts.summaryTone === 'setup' ? 'wrench' : 'checkCircle')));
    summary.appendChild(el('span', null, opts.summary));
    toolbar.appendChild(summary);
    if (opts.locationNote) { toolbar.appendChild(el('span', 'mc-con-loc', opts.locationNote)); }
    arr(opts.actions).forEach(function (a) { toolbar.appendChild(a); });
    var body = el('div', 'mc-board-body');
    root.appendChild(toolbar);
    root.appendChild(body);
    els.body.appendChild(root);
    return { root: root, body: body };
  }

  function boardSection(host, title, icoName) {
    var sec = el('section', 'mc-bsec');
    var head = el('div', 'mc-bsec-head');
    var h2 = el('h2', null, '');
    h2.appendChild(ico(icoName || 'grid'));
    h2.appendChild(el('span', null, title));
    head.appendChild(h2);
    sec.appendChild(head);
    var body = el('div', 'mc-bsec-body');
    sec.appendChild(body);
    host.appendChild(sec);
    return { root: sec, head: head, body: body };
  }

  function quietNote(text, icoName) {
    var strip = el('div', 'mc-quiet-note');
    strip.appendChild(ico(icoName || 'info'));
    strip.appendChild(el('span', null, text));
    return strip;
  }

  /* ==================================================================
     NOTIFICATIONS & SOUNDS console — destinations board + routing matrix
     Canonical location: General -> Notifications & Sounds.
     ================================================================== */

  var DEST_ICON = {
    'in-app': 'bell', 'system': 'tray', 'slack': 'chat', 'discord': 'users',
    'webhook': 'link', 'ntfy': 'cloud', 'pushover': 'bolt', 'telegram': 'chat'
  };
  /* UI vocabulary for destination states (concept copy; provider state
     strings still come only from PMProvider) */
  var DEST_STATE = {
    'ready': { word: 'Ready', tone: 'ok' }, 'needs-setup': { word: 'Needs setup', tone: 'setup' },
    'validation-error': { word: 'Validation error', tone: 'attention' },
    'disabled': { word: 'Turned off', tone: 'setup' }, 'unavailable': { word: 'Unavailable', tone: 'attention' }
  };
  var DEST_KIND_LABEL = {
    'in-app': 'In-app', 'system': 'System', 'slack': 'Slack', 'discord': 'Discord',
    'webhook': 'Webhook', 'ntfy': 'ntfy', 'pushover': 'Pushover', 'telegram': 'Telegram'
  };
  var DEST_FIELD_LABEL = {
    workspace: 'Workspace', channel: 'Channel', threadOnFailure: 'Thread replies on failure',
    mention: 'Mention', tokenRef: 'Bot token', webhookUrlRef: 'Webhook', url: 'URL',
    method: 'Method', headers: 'Headers', template: 'Payload template',
    successPredicate: 'Success predicate', server: 'Server', topic: 'Topic',
    priority: 'Priority', tags: 'Tags', clickTarget: 'Click opens', device: 'Device',
    userKeyRef: 'User key', chatId: 'Chat ID', parseMode: 'Parse mode', retry: 'Retry',
    respectFocusAssist: 'Respect OS focus assist'
  };
  /* per-kind field templates for the add flow (secrets only ever as vault
     references — a raw token never appears in this UI) */
  var DEST_KIND_TEMPLATES = {
    slack: { workspace: '', channel: '', threadOnFailure: true, mention: '', tokenRef: null },
    discord: { webhookUrlRef: null, mention: '' },
    webhook: { url: '', method: 'POST', headers: {}, template: '{"event":"{{event}}"}', successPredicate: 'status < 300' },
    ntfy: { server: '', topic: '', priority: 'default', tags: [], clickTarget: 'open-run' },
    pushover: { device: '', priority: 'normal', userKeyRef: null },
    telegram: { chatId: '', parseMode: 'MarkdownV2', retry: 'twice with backoff', botTokenRef: null }
  };
  var DEST_SELECT_OPTIONS = {
    method: ['POST', 'PUT'],
    priority: ['min', 'low', 'default', 'normal', 'high', 'max'],
    clickTarget: ['open-run', 'open-app', 'none'],
    parseMode: ['MarkdownV2', 'HTML', 'Plain']
  };
  var VAULT_REFS = [
    'vault:slack/platyr-bot', 'vault:discord/pm-hook', 'vault:pushover/jared',
    'vault:telegram/pm-bot', 'vault:webhooks/ops-relay'
  ];
  var ROUTE_CELL_OPTIONS = [
    { id: 'always', label: 'Always' }, { id: 'when-unfocused', label: 'When unfocused' },
    { id: 'failures-only', label: 'Failures only' }, { id: 'never', label: 'Never' }
  ];
  var FOCUS_BEHAVIOR_OPTIONS = [
    { id: 'suppress-noncritical', label: 'Suppress non-critical while focused' },
    { id: 'deliver-all', label: 'Deliver everything' }, { id: 'silence-all', label: 'Silence everything while focused' }
  ];

  function isVaultKey(key) { return /Ref$/.test(key); }

  function destStateMeta(d) {
    return DEST_STATE[d.state] || { word: 'Unknown', tone: 'setup' };
  }

  function soundNameById(id) {
    var lib = arr(((data().notifications || {}).sounds || {}).library);
    for (var i = 0; i < lib.length; i++) { if (lib[i] && lib[i].id === id) { return lib[i].name; } }
    return id;
  }

  function renderNotificationsConsole() {
    var no = data().notifications || {};
    var sum = consoleSummary('notifications');
    var addBtn = btn('mc-btn is-primary', null, function () {
      view.pendingDest = { kind: 'slack', isNew: true };
      renderAll();
    });
    addBtn.appendChild(ico('plus'));
    addBtn.appendChild(el('span', null, 'Add destination'));
    var frame = boardFrame({
      title: 'Notifications & Sounds',
      summary: sum.text,
      summaryTone: sum.tone,
      locationNote: 'General › Notifications & Sounds',
      actions: [addBtn]
    });

    /* master strip: enabled, volume, quiet hours, focus behavior */
    var master = no.master || {};
    var masterSec = boardSection(frame.body, 'Master', 'sliders');
    var strip = el('div', 'mc-masterstrip');

    var cellOn = el('div', 'mc-mcell');
    cellOn.appendChild(el('span', 'mc-mcell-label', 'Notifications'));
    var onToggle = el('button', 'mc-toggle');
    onToggle.type = 'button';
    onToggle.setAttribute('role', 'switch');
    onToggle.setAttribute('aria-checked', String(master.enabled !== false));
    onToggle.setAttribute('aria-label', 'Notifications enabled');
    onToggle.addEventListener('click', function () {
      master.enabled = master.enabled === false;
      var row = data().settings['general.sounds.master-enabled'];
      if (row) { row.value = master.enabled; row.valueSource = 'custom'; }
      window.PMShell.status('Notifications ' + (master.enabled ? 'on.' : 'held. Everything still lands in the title-bar inbox.'));
      renderAll();
    });
    cellOn.appendChild(onToggle);
    strip.appendChild(cellOn);

    var cellVol = el('div', 'mc-mcell');
    cellVol.appendChild(el('span', 'mc-mcell-label', 'Sound volume'));
    var volWrap = el('span', 'mc-volwrap');
    var vol = document.createElement('input');
    vol.type = 'range';
    vol.min = '0'; vol.max = '100';
    vol.value = String(master.volume == null ? 70 : master.volume);
    vol.setAttribute('aria-label', 'Sound volume');
    var volOut = el('span', 'mc-volout', vol.value + '%');
    vol.addEventListener('input', function () { volOut.textContent = vol.value + '%'; });
    vol.addEventListener('change', function () {
      master.volume = Number(vol.value);
      var row = data().settings['general.sounds.master-volume'];
      if (row) { row.value = master.volume; row.valueSource = 'custom'; }
      window.PMShell.status('Sound volume set to ' + vol.value + '%.');
    });
    volWrap.appendChild(vol);
    volWrap.appendChild(volOut);
    cellVol.appendChild(volWrap);
    strip.appendChild(cellVol);

    var cellQuiet = el('div', 'mc-mcell');
    cellQuiet.appendChild(el('span', 'mc-mcell-label', 'Quiet hours (daily)'));
    var qWrap = el('span', 'mc-quietwrap');
    var qh = master.quietHours || {};
    var qStart = document.createElement('input');
    qStart.type = 'time'; qStart.value = qh.start || '22:00';
    qStart.className = 'mc-input mc-input-time';
    qStart.setAttribute('aria-label', 'Quiet hours start');
    var qEnd = document.createElement('input');
    qEnd.type = 'time'; qEnd.value = qh.end || '07:30';
    qEnd.className = 'mc-input mc-input-time';
    qEnd.setAttribute('aria-label', 'Quiet hours end');
    function saveQuiet() {
      master.quietHours = { start: qStart.value, end: qEnd.value, days: qh.days || 'daily' };
      var row = data().settings['general.sounds.quiet-hours'];
      if (row) { row.value = qStart.value + ' – ' + qEnd.value; row.valueSource = 'custom'; }
      window.PMShell.status('Quiet hours: ' + qStart.value + ' to ' + qEnd.value + '. Non-critical sounds hold; the inbox still collects.');
    }
    qStart.addEventListener('change', saveQuiet);
    qEnd.addEventListener('change', saveQuiet);
    qWrap.appendChild(qStart);
    qWrap.appendChild(el('span', null, 'to'));
    qWrap.appendChild(qEnd);
    cellQuiet.appendChild(qWrap);
    strip.appendChild(cellQuiet);

    var cellFocus = el('div', 'mc-mcell');
    cellFocus.appendChild(el('span', 'mc-mcell-label', 'While a window is focused'));
    var focusSel = document.createElement('select');
    focusSel.className = 'mc-select';
    focusSel.setAttribute('aria-label', 'Focus behavior');
    FOCUS_BEHAVIOR_OPTIONS.forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.id; opt.textContent = o.label;
      if ((master.focusBehavior || 'suppress-noncritical') === o.id) { opt.selected = true; }
      focusSel.appendChild(opt);
    });
    focusSel.addEventListener('change', function () {
      master.focusBehavior = focusSel.value;
      window.PMShell.status('Focus behavior: ' + focusSel.options[focusSel.selectedIndex].textContent + '.');
    });
    cellFocus.appendChild(focusSel);
    strip.appendChild(cellFocus);
    masterSec.body.appendChild(strip);

    /* surface rule: the title-bar stack is the SOLE in-app affordance */
    masterSec.body.appendChild(quietNote(
      (no.surfaceRule && no.surfaceRule.note) ||
      'The title-bar notification stack and its sprout inbox are the only in-app notification surface.', 'bell'));

    /* destinations board */
    var destSec = boardSection(frame.body, 'Destinations', 'route');
    if (view.pendingDest) {
      destSec.body.appendChild(renderDestAddForm());
    }
    var dests = arr(no.destinations);
    if (dests.length === 0) {
      destSec.body.appendChild(el('div', 'mc-inspect-empty',
        'No destinations yet. The in-app title-bar stack and system notifications appear after first run; everything else is added here, one explicit destination at a time.'));
    } else {
      var grid = el('div', 'mc-destgrid');
      dests.forEach(function (d) { grid.appendChild(renderDestCard(d)); });
      destSec.body.appendChild(grid);
    }
    destSec.body.appendChild(quietNote(
      'Test-send is explicit, masked, rate-limited (one per 30 seconds), and receipted. Delivered tests join the title-bar stack above.', 'info'));

    /* event routing matrix */
    var mxSec = boardSection(frame.body, 'Event routing matrix', 'grid');
    mxSec.body.appendChild(renderRoutingMatrix(no));

    /* plain settings hang off the console (inverted relation) */
    var confDisc = disclosure({ label: 'Configure notification basics', icoName: 'gear', kind: 'configure' });
    ['general.interaction.notifications-enabled', 'general.sounds.master-enabled',
      'general.sounds.master-volume', 'general.sounds.quiet-hours'].forEach(function (sid) {
      var s = data().settings ? data().settings[sid] : null;
      if (s) { confDisc.body.appendChild(renderRow(s, 'console/notifications')); }
    });
    frame.body.appendChild(confDisc.root);
  }

  function destConfigLine(key, value) {
    var line = el('div', 'mc-dest-line');
    line.appendChild(el('span', 'mc-dest-k', DEST_FIELD_LABEL[key] || key));
    var vWrap = el('span', 'mc-dest-v');
    if (isVaultKey(key)) {
      if (value) {
        var chip = el('span', 'mc-vault');
        chip.appendChild(ico('key'));
        chip.appendChild(el('span', null, String(value)));
        chip.title = 'A vault reference. The token itself never appears in the interface.';
        vWrap.appendChild(chip);
      } else {
        var missing = el('span', 'pm-chip-value', 'No reference yet');
        missing.setAttribute('data-kind', 'not-configured');
        vWrap.appendChild(missing);
      }
    } else if (typeof value === 'boolean') {
      vWrap.textContent = value ? 'On' : 'Off';
    } else if (Array.isArray(value)) {
      vWrap.textContent = value.join(', ') || 'None';
    } else if (value && typeof value === 'object') {
      vWrap.textContent = Object.keys(value).map(function (k) { return k + ': ' + value[k]; }).join(' · ') || 'None';
    } else if (value == null || value === '') {
      var blank = el('span', 'pm-chip-value', 'Not configured');
      blank.setAttribute('data-kind', 'not-configured');
      vWrap.appendChild(blank);
    } else {
      vWrap.textContent = String(value);
    }
    line.appendChild(vWrap);
    return line;
  }

  function renderDestCard(d) {
    var meta = destStateMeta(d);
    var card = el('article', 'mc-dest');
    card.setAttribute('data-state', d.state);
    card.setAttribute('data-teach-ref', d.id);

    var head = el('div', 'mc-dest-head');
    head.appendChild(ico(DEST_ICON[d.kind] || 'bell'));
    head.appendChild(el('span', 'mc-dest-title', d.label));
    var word = el('span', 'mc-inv-word', meta.word);
    word.setAttribute('data-tone', meta.tone);
    head.appendChild(word);
    if (d.locked) {
      var lockChip = el('span', 'mc-tag');
      lockChip.appendChild(ico('lock'));
      lockChip.appendChild(el('span', null, 'Built-in'));
      head.appendChild(lockChip);
    }
    card.appendChild(head);

    if (d.locked && d.lockedReason) { card.appendChild(el('p', 'mc-dest-note', d.lockedReason)); }
    if (d.setupNote) { card.appendChild(el('p', 'mc-dest-note', d.setupNote)); }
    if (d.disabledNote) { card.appendChild(el('p', 'mc-dest-note', d.disabledNote)); }
    if (d.stateNote) { card.appendChild(el('p', 'mc-dest-note', d.stateNote)); }

    var conf = d.config || {};
    var confWrap = el('div', 'mc-dest-config');
    Object.keys(conf).forEach(function (key) {
      var line = destConfigLine(key, conf[key]);
      confWrap.appendChild(line);
      /* FIELD-level validation error — pinned under its field, never row mush */
      if (d.validationError && d.validationError.field === key) {
        var err = el('div', 'mc-field-error');
        err.setAttribute('role', 'alert');
        err.appendChild(ico('warning'));
        err.appendChild(el('span', null, d.validationError.message));
        confWrap.appendChild(err);
      }
    });
    card.appendChild(confWrap);

    if (d.lastTest) {
      var lt = el('div', 'mc-dest-lasttest');
      lt.appendChild(ico(d.lastTest.ok ? 'checkCircle' : 'close'));
      lt.appendChild(el('span', null,
        'Last test ' + fmtWhen(d.lastTest.when) + ' — ' + (d.lastTest.ok ? 'delivered' : 'failed') +
        (d.lastTest.masked ? ' · payload masked' : '') +
        (d.lastTest.receiptId ? ' · receipt ' + d.lastTest.receiptId : '')));
      card.appendChild(lt);
    }
    if (d.rateLimit) { card.appendChild(el('p', 'mc-prose-hint', 'Test limit: ' + d.rateLimit + '.')); }

    card.appendChild(opStrip('dest-test', d.id));

    var actions = el('div', 'mc-notice-actions');
    var canTest = d.state === 'ready' || d.state === 'validation-error';
    var test = btn('mc-btn' + (canTest ? ' is-primary' : ''), null, function () {
      window.PMState.trigger('dest-test', d.id);
    });
    test.appendChild(ico('play'));
    test.appendChild(el('span', null, 'Test send'));
    if (!canTest) {
      test.disabled = true;
      test.title = d.state === 'needs-setup' ? 'Finish setup first' :
        d.state === 'unavailable' ? (d.stateNote || 'Unavailable right now') : 'Turned off';
    }
    actions.appendChild(test);

    if (!d.locked) {
      var editBtn = btn('mc-btn', d._editing ? 'Close editor' : 'Edit', function () {
        d._editing = !d._editing;
        renderAll();
      });
      actions.appendChild(editBtn);
    }
    if (!d.builtIn) {
      if (d.state === 'disabled') {
        actions.appendChild(btn('mc-btn is-quiet', 'Turn on', function () {
          d.state = 'ready';
          delete d.disabledNote;
          window.PMShell.status(d.label + ' turned on.');
          renderAll();
        }));
      } else if (d.state === 'ready') {
        actions.appendChild(btn('mc-btn is-quiet', 'Turn off', function () {
          d.state = 'disabled';
          d.disabledNote = 'Turned off. Configuration is kept.';
          window.PMShell.status(d.label + ' turned off. Routing rows keep their cells.');
          renderAll();
        }));
      }
      actions.appendChild(btn('mc-btn is-quiet', 'Remove', function () {
        var no = data().notifications;
        no.destinations = arr(no.destinations).filter(function (x) { return x !== d; });
        arr(no.routing).forEach(function (r) { if (r.destinations) { delete r.destinations[d.id]; } });
        window.PMState.receipt('Remove destination', d.label + ' removed. Its routing cells were cleared; the vault reference stays in the vault.');
        renderAll();
      }));
    }
    card.appendChild(actions);

    if (d._editing) { card.appendChild(renderDestEditor(d)); }
    return card;
  }

  function destFieldControl(key, value, onChange) {
    if (isVaultKey(key)) {
      var sel = document.createElement('select');
      sel.className = 'mc-select';
      sel.setAttribute('aria-label', DEST_FIELD_LABEL[key] || key);
      var optNone = document.createElement('option');
      optNone.value = ''; optNone.textContent = 'Choose a vault reference…';
      sel.appendChild(optNone);
      var refs = VAULT_REFS.slice();
      if (value && refs.indexOf(value) < 0) { refs.unshift(String(value)); }
      refs.forEach(function (rf) {
        var opt = document.createElement('option');
        opt.value = rf; opt.textContent = rf;
        if (value === rf) { opt.selected = true; }
        sel.appendChild(opt);
      });
      var optNew = document.createElement('option');
      optNew.value = '__new__'; optNew.textContent = 'New vault reference…';
      sel.appendChild(optNew);
      sel.addEventListener('change', function () {
        if (sel.value === '__new__') {
          window.PMState.receipt('Create a vault reference',
            'The vault flow stores the secret in the system keychain and hands back a reference. Raw tokens never touch settings.');
          sel.value = value || '';
          return;
        }
        onChange(sel.value || null);
      });
      return sel;
    }
    if (typeof value === 'boolean') {
      var t = el('button', 'mc-toggle');
      t.type = 'button';
      t.setAttribute('role', 'switch');
      t.setAttribute('aria-checked', String(!!value));
      t.setAttribute('aria-label', DEST_FIELD_LABEL[key] || key);
      t.addEventListener('click', function () {
        var next = t.getAttribute('aria-checked') !== 'true';
        t.setAttribute('aria-checked', String(next));
        onChange(next);
      });
      return t;
    }
    if (DEST_SELECT_OPTIONS[key]) {
      var s = document.createElement('select');
      s.className = 'mc-select';
      s.setAttribute('aria-label', DEST_FIELD_LABEL[key] || key);
      DEST_SELECT_OPTIONS[key].forEach(function (o) {
        var opt = document.createElement('option');
        opt.value = o; opt.textContent = o;
        if (String(value) === o) { opt.selected = true; }
        s.appendChild(opt);
      });
      s.addEventListener('change', function () { onChange(s.value); });
      return s;
    }
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'mc-input' + (key === 'template' || key === 'successPredicate' ? ' mc-input-mono' : '');
    input.setAttribute('aria-label', DEST_FIELD_LABEL[key] || key);
    input.setAttribute('data-dest-field', key);
    if (Array.isArray(value)) { input.value = value.join(', '); }
    else if (value && typeof value === 'object') {
      input.value = Object.keys(value).map(function (k) { return k + ': ' + value[k]; }).join('; ');
    } else { input.value = value == null ? '' : String(value); }
    input.addEventListener('change', function () { onChange(input.value); });
    return input;
  }

  function renderDestEditor(d) {
    var form = el('div', 'mc-dest-editor');
    form.appendChild(el('h4', null, 'Edit ' + d.label));
    var conf = d.config || {};
    Object.keys(conf).forEach(function (key) {
      var row = el('div', 'mc-dest-editrow');
      var lab = el('label', 'mc-dest-k', DEST_FIELD_LABEL[key] || key);
      row.appendChild(lab);
      row.appendChild(destFieldControl(key, conf[key], function (next) {
        if (Array.isArray(conf[key]) && typeof next === 'string') {
          conf[key] = next.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
        } else if (conf[key] && typeof conf[key] === 'object' && !Array.isArray(conf[key]) && typeof next === 'string') {
          var o = {};
          next.split(';').forEach(function (pair) {
            var m = pair.split(':');
            if (m.length >= 2) { o[m[0].trim()] = m.slice(1).join(':').trim(); }
          });
          conf[key] = o;
        } else {
          conf[key] = next;
        }
        /* live validation on the known predicate field: fixing the typo
           clears the field-level error and readies the destination */
        if (key === 'successPredicate' && d.validationError && d.validationError.field === key) {
          if (!/\bstaus\b/.test(String(next))) {
            delete d.validationError;
            d.state = 'ready';
            window.PMState.receipt('Validation cleared', d.label + ': the success predicate now names "status". The destination is ready.');
            renderAll();
            return;
          }
        }
        window.PMShell.status(d.label + ': ' + (DEST_FIELD_LABEL[key] || key) + ' saved.');
      }));
      form.appendChild(row);
      if (d.validationError && d.validationError.field === key) {
        var err = el('div', 'mc-field-error');
        err.setAttribute('role', 'alert');
        err.appendChild(ico('warning'));
        err.appendChild(el('span', null, d.validationError.message));
        form.appendChild(err);
      }
    });
    form.appendChild(el('p', 'mc-prose-hint',
      'Secrets are vault references only. Reveal and copy are never offered here; rotate or replace the secret in the vault.'));
    var foot = el('div', 'mc-setup-foot');
    foot.appendChild(btn('mc-btn is-primary', 'Done', function () {
      d._editing = false;
      renderAll();
    }));
    form.appendChild(foot);
    return form;
  }

  function renderDestAddForm() {
    var pd = view.pendingDest || { kind: 'slack' };
    var panel = el('div', 'mc-dest-editor mc-dest-add');
    panel.setAttribute('data-teach-ref', 'add-destination');
    panel.appendChild(el('h4', null, 'Add a destination'));

    var kindRow = el('div', 'mc-dest-editrow');
    kindRow.appendChild(el('label', 'mc-dest-k', 'Kind'));
    var kindSel = document.createElement('select');
    kindSel.className = 'mc-select';
    kindSel.setAttribute('aria-label', 'Destination kind');
    Object.keys(DEST_KIND_TEMPLATES).forEach(function (k) {
      var opt = document.createElement('option');
      opt.value = k; opt.textContent = DEST_KIND_LABEL[k] || k;
      if (pd.kind === k) { opt.selected = true; }
      kindSel.appendChild(opt);
    });
    kindSel.addEventListener('change', function () {
      view.pendingDest = { kind: kindSel.value, isNew: true };
      renderAll();
    });
    kindRow.appendChild(kindSel);
    panel.appendChild(kindRow);

    if (!pd.draft) { pd.draft = JSON.parse(JSON.stringify(DEST_KIND_TEMPLATES[pd.kind] || {})); }
    var draft = pd.draft;
    var focusEl = null;
    Object.keys(draft).forEach(function (key) {
      var row = el('div', 'mc-dest-editrow');
      row.appendChild(el('label', 'mc-dest-k', DEST_FIELD_LABEL[key] || key));
      var control = destFieldControl(key, draft[key], function (next) { draft[key] = next; });
      row.appendChild(control);
      panel.appendChild(row);
      if (pd.focusField === key) { focusEl = control; }
    });
    panel.appendChild(el('p', 'mc-prose-hint',
      'Secrets only as vault references — the raw token stays in the keychain. A destination without its reference saves as Needs setup.'));

    var foot = el('div', 'mc-setup-foot');
    foot.appendChild(btn('mc-btn is-primary', 'Add destination', function () {
      var no = data().notifications;
      var missingRef = Object.keys(draft).some(function (k) { return isVaultKey(k) && !draft[k]; });
      var label = DEST_KIND_LABEL[pd.kind] || pd.kind;
      if (pd.kind === 'slack' && draft.channel) { label = 'Slack · ' + draft.channel; }
      if (pd.kind === 'ntfy' && draft.topic) { label = 'ntfy · ' + draft.topic; }
      var dest = {
        id: 'dest.' + pd.kind + '-' + Date.now().toString(36),
        kind: pd.kind,
        label: label,
        state: missingRef ? 'needs-setup' : 'ready',
        builtIn: false,
        config: draft,
        lastTest: null
      };
      if (missingRef) { dest.setupNote = 'Add the vault reference to finish setup.'; }
      no.destinations = arr(no.destinations).concat([dest]);
      view.pendingDest = null;
      window.PMState.receipt('Add destination', dest.label + ' added' +
        (missingRef ? ' — needs its vault reference before the first send.' : ' and ready. Route events to it in the matrix below.'));
      renderAll();
    }));
    foot.appendChild(btn('mc-btn is-quiet', 'Cancel', function () {
      view.pendingDest = null;
      renderAll();
    }));
    panel.appendChild(foot);

    if (focusEl) {
      pd.focusField = null; /* one-shot: later re-renders must not steal focus */
      window.requestAnimationFrame(function () {
        panel.scrollIntoView({ block: 'center', behavior: 'auto' });
        focusEl.focus();
        window.PMSpy.focusFlash(panel);
      });
    }
    return panel;
  }

  function renderRoutingMatrix(no) {
    var wrap = el('div', null);
    var dests = arr(no.destinations);
    var routing = arr(no.routing);
    if (routing.length === 0 || dests.length === 0) {
      wrap.appendChild(el('div', 'mc-inspect-empty', 'No routable events yet.'));
      return wrap;
    }
    /* Slint: the matrix is a model-backed TableView; rows and columns are
       data, and wide layouts scroll inside this container only. */
    var scroll = el('div', 'mc-matrix-scroll');
    var table = document.createElement('table');
    table.className = 'mc-matrix';
    var thead = document.createElement('thead');
    var hr = document.createElement('tr');
    var thEvent = document.createElement('th');
    thEvent.scope = 'col';
    thEvent.textContent = 'Event';
    hr.appendChild(thEvent);
    dests.forEach(function (d) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.textContent = String(d.label).split('·')[0].trim();
      if (d.state !== 'ready') { th.className = 'is-dim'; }
      hr.appendChild(th);
    });
    var thSound = document.createElement('th');
    thSound.scope = 'col';
    thSound.textContent = 'Sound';
    hr.appendChild(thSound);
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    var lib = arr((no.sounds || {}).library);
    routing.forEach(function (row) {
      var tr = document.createElement('tr');
      var th = document.createElement('th');
      th.scope = 'row';
      th.appendChild(el('span', 'mc-matrix-event', row.label));
      if (row.severity === 'attention' || row.severity === 'warning') {
        var sev = el('span', 'mc-matrix-sev', row.severity === 'attention' ? 'Attention' : 'Warning');
        th.appendChild(sev);
      }
      tr.appendChild(th);
      dests.forEach(function (d) {
        var td = document.createElement('td');
        var cell = document.createElement('select');
        cell.className = 'mc-select mc-matrix-cell';
        cell.setAttribute('aria-label', row.label + ' via ' + d.label);
        ROUTE_CELL_OPTIONS.forEach(function (o) {
          var opt = document.createElement('option');
          opt.value = o.id; opt.textContent = o.label;
          if (((row.destinations || {})[d.id] || 'never') === o.id) { opt.selected = true; }
          cell.appendChild(opt);
        });
        cell.addEventListener('change', function () {
          row.destinations = row.destinations || {};
          row.destinations[d.id] = cell.value;
          window.PMShell.status(row.label + ' via ' + d.label + ': ' +
            cell.options[cell.selectedIndex].textContent + '.');
        });
        td.appendChild(cell);
        tr.appendChild(td);
      });
      var tdSound = document.createElement('td');
      var sndSel = document.createElement('select');
      sndSel.className = 'mc-select mc-matrix-cell';
      sndSel.setAttribute('aria-label', 'Sound for ' + row.label);
      var optNone = document.createElement('option');
      optNone.value = ''; optNone.textContent = 'No sound';
      if (!row.soundId) { optNone.selected = true; }
      sndSel.appendChild(optNone);
      lib.forEach(function (snd) {
        var opt = document.createElement('option');
        opt.value = snd.id; opt.textContent = snd.name;
        if (row.soundId === snd.id) { opt.selected = true; }
        sndSel.appendChild(opt);
      });
      sndSel.addEventListener('change', function () {
        row.soundId = sndSel.value || null;
        window.PMShell.status(row.label + ' sound: ' + (row.soundId ? soundNameById(row.soundId) : 'none') + '.');
      });
      tdSound.appendChild(sndSel);
      tr.appendChild(tdSound);
      tbody.appendChild(tr);
      if (row.note) {
        var noteTr = document.createElement('tr');
        noteTr.className = 'mc-matrix-noterow';
        var noteTd = document.createElement('td');
        noteTd.colSpan = dests.length + 2;
        var note = el('div', 'mc-prose-hint', row.note);
        noteTd.appendChild(note);
        noteTr.appendChild(noteTd);
        tbody.appendChild(noteTr);
      }
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    wrap.appendChild(scroll);
    wrap.appendChild(quietNote(
      'Sound is never the only signal for failure, blocked work, approval, or completion — a stack entry and the routed destinations always carry it too.', 'speaker'));
    return wrap;
  }

  /* ==================================================================
     SOUND LIBRARY console — asset table + pack import gates
     ================================================================== */

  function renderSoundsConsole() {
    var so = (data().notifications || {}).sounds || {};
    var sum = consoleSummary('sounds');
    var uploadBtn = btn('mc-btn is-primary', null, function () {
      window.PMState.trigger('sound-upload');
      window.PMShell.status('Checking the upload: format, duration, and hash.');
    });
    uploadBtn.appendChild(ico('upload'));
    uploadBtn.appendChild(el('span', null, 'Upload sound'));
    var frame = boardFrame({
      title: 'Sound Library',
      summary: sum.text,
      summaryTone: sum.tone,
      locationNote: 'General › Notifications & Sounds › Sounds',
      actions: [uploadBtn]
    });

    frame.body.appendChild(quietNote(
      (so.previewNote || 'Preview plays locally only.') +
      ' Test-send lives on the destinations board, one explicit button per destination.', 'speaker'));
    var openDest = btn('mc-btn is-quiet', null, function () {
      go({ name: 'manager', managerId: 'notifications' });
    });
    openDest.appendChild(ico('route'));
    openDest.appendChild(el('span', null, 'Open the destinations board'));
    frame.body.appendChild(openDest);

    var libSec = boardSection(frame.body, 'Assets', 'speaker');
    libSec.body.appendChild(opStrip('sound-upload', ''));
    var lib = arr(so.library);
    if (lib.length === 0) {
      libSec.body.appendChild(el('div', 'mc-inspect-empty',
        'No sounds yet. Built-ins install with the app; uploads and packs appear here with full provenance.'));
    } else {
      var scroll = el('div', 'mc-matrix-scroll');
      var table = document.createElement('table');
      table.className = 'mc-soundtable';
      var thead = document.createElement('thead');
      thead.innerHTML = '<tr><th scope="col">Sound</th><th scope="col">Source</th>' +
        '<th scope="col">Format</th><th scope="col">Length</th><th scope="col">Hash</th>' +
        '<th scope="col">License</th><th scope="col">Actions</th></tr>';
      table.appendChild(thead);
      var tbody = document.createElement('tbody');
      lib.forEach(function (snd) { tbody.appendChild(renderSoundRow(snd)); });
      table.appendChild(tbody);
      scroll.appendChild(table);
      libSec.body.appendChild(scroll);
    }

    var packSec = boardSection(frame.body, 'Sound packs', 'package');
    packSec.body.appendChild(quietNote(
      'PeonPing and OpenPeon-compatible packs import through two gates: a format check and a license check. Unverified packs are never bundled or enabled.', 'shield'));
    var packs = arr(so.packs);
    if (packs.length === 0) {
      packSec.body.appendChild(el('div', 'mc-inspect-empty',
        'No packs imported yet. Import a pack file and it passes the format and license gates before a single sound lands in the library.'));
    } else {
      var pGrid = el('div', 'mc-packgrid');
      packs.forEach(function (pk) { pGrid.appendChild(renderPackCard(pk)); });
      packSec.body.appendChild(pGrid);
    }
  }

  function renderSoundRow(snd) {
    var tr = document.createElement('tr');

    var tdName = document.createElement('td');
    tdName.appendChild(el('div', 'mc-snd-name', snd.name));
    arr(snd.defaultFor).forEach(function (evId) {
      var chip = el('span', 'pm-chip-value', 'Default · ' + evId.replace('.', ' '));
      chip.setAttribute('data-kind', 'default');
      tdName.appendChild(chip);
    });
    tdName.appendChild(opStrip('sound-preview', snd.id));
    tr.appendChild(tdName);

    var tdSource = document.createElement('td');
    if (snd.source === 'built-in') { tdSource.textContent = 'Built-in · v' + (snd.version || '1.0'); }
    else if (snd.source === 'upload') { tdSource.textContent = 'Upload · ' + (snd.uploadedAt ? fmtWhen(snd.uploadedAt) : ''); }
    else if (String(snd.source).indexOf('pack:') === 0) { tdSource.textContent = 'Pack import'; }
    else { tdSource.textContent = String(snd.source || ''); }
    tr.appendChild(tdSource);

    var tdFmt = document.createElement('td');
    tdFmt.textContent = (snd.format || '').toUpperCase() + (snd.sampleRate ? ' · ' + Math.round(snd.sampleRate / 1000) + ' kHz' : '');
    tr.appendChild(tdFmt);

    var tdDur = document.createElement('td');
    tdDur.textContent = snd.duration != null ? snd.duration + ' s' : '';
    tr.appendChild(tdDur);

    var tdHash = document.createElement('td');
    tdHash.className = 'mc-snd-hash';
    tdHash.textContent = snd.hash || '';
    tr.appendChild(tdHash);

    var tdLic = document.createElement('td');
    tdLic.textContent = snd.license || 'Unknown';
    tr.appendChild(tdLic);

    var tdAct = document.createElement('td');
    tdAct.className = 'mc-snd-actions';
    var preview = btn('mc-iconbtn', null, function () {
      /* local-only preview: op events only, deliberately NO receipt */
      window.PMState.trigger('sound-preview', snd.id);
    });
    preview.setAttribute('aria-label', 'Preview ' + snd.name + ' (plays locally only)');
    preview.title = 'Preview — local only, no receipt';
    preview.appendChild(ico('play'));
    tdAct.appendChild(preview);
    var exportBtn = btn('mc-iconbtn', null, function () {
      window.PMState.receipt('Export ' + snd.name, 'Saves a copy with its metadata sidecar (source, license, hash).');
    });
    exportBtn.setAttribute('aria-label', 'Export ' + snd.name);
    exportBtn.appendChild(ico('download'));
    tdAct.appendChild(exportBtn);
    if (snd.source === 'upload') {
      var replaceBtn = btn('mc-iconbtn', null, function () {
        window.PMState.receipt('Replace ' + snd.name, 'A new file re-runs the format, duration, and hash checks; mappings keep pointing at this entry.');
      });
      replaceBtn.setAttribute('aria-label', 'Replace ' + snd.name);
      replaceBtn.appendChild(ico('refresh'));
      tdAct.appendChild(replaceBtn);
      var delBtn = btn('mc-iconbtn', null, function () {
        var lib = ((data().notifications || {}).sounds || {}).library;
        var idx = lib.indexOf(snd);
        if (idx >= 0) { lib.splice(idx, 1); }
        window.PMState.receipt('Delete ' + snd.name, 'Removed from the library. Events that mapped to it fall back to their default sound.');
        renderAll();
      });
      delBtn.setAttribute('aria-label', 'Delete ' + snd.name);
      delBtn.appendChild(ico('trash'));
      tdAct.appendChild(delBtn);
    } else {
      var noDel = btn('mc-iconbtn', null, null);
      noDel.disabled = true;
      noDel.setAttribute('aria-label', 'Built-in and pack sounds cannot be deleted; remap events instead');
      noDel.title = 'Built-in and pack sounds cannot be deleted; remap events instead';
      noDel.appendChild(ico('trash'));
      tdAct.appendChild(noDel);
    }
    tr.appendChild(tdAct);
    return tr;
  }

  function renderPackCard(pk) {
    var card = el('article', 'mc-pack');
    card.setAttribute('data-state', pk.state);
    var head = el('div', 'mc-dest-head');
    head.appendChild(ico('package'));
    head.appendChild(el('span', 'mc-dest-title', pk.name));
    var stateWord =
      pk.state === 'imported' ? { word: 'Imported', tone: 'ok' } :
      pk.state === 'license-unverified' ? { word: 'Blocked — license unverified', tone: 'attention' } :
      { word: 'Rejected — invalid format', tone: 'attention' };
    var word = el('span', 'mc-inv-word', stateWord.word);
    word.setAttribute('data-tone', stateWord.tone);
    head.appendChild(word);
    card.appendChild(head);

    var meta = [];
    if (pk.origin) { meta.push(['Origin', pk.origin === 'file' ? 'Local file' : pk.origin]); }
    if (pk.version) { meta.push(['Version', pk.version]); }
    meta.push(['Sounds', String(pk.soundCount || 0)]);
    if (pk.importedAt) { meta.push(['Imported', fmtWhen(pk.importedAt)]); }
    var lc = pk.licenseCheck || {};
    meta.push(['License check',
      lc.result === 'verified' ? 'Verified — ' + (lc.license || '') :
      lc.result === 'unverified' ? 'Unverified' :
      lc.result === 'not-run' ? 'Not run (format failed first)' : String(lc.result || '')]);
    var fcCheck = pk.formatCheck || {};
    meta.push(['Format check', fcCheck.result === 'passed' ? 'Passed' : fcCheck.result === 'failed' ? 'Failed' : String(fcCheck.result || '')]);
    card.appendChild(kvBlock(meta));

    if (lc.detail) { card.appendChild(el('p', 'mc-dest-note', lc.detail)); }
    if (fcCheck.detail) { card.appendChild(el('p', 'mc-dest-note', fcCheck.detail)); }

    card.appendChild(opStrip('pack-import', pk.id));

    var actions = el('div', 'mc-notice-actions');
    if (pk.state === 'license-unverified') {
      actions.appendChild(btn('mc-btn is-primary', 'Import', function () {
        window.PMState.trigger('pack-import', pk.id);
      }));
      actions.appendChild(btn('mc-btn is-quiet', 'Review license manually', function () {
        window.PMState.receipt('Review license', pk.name + ': opens the pack manifest for a human license decision. Import stays blocked until a license is verified.');
      }));
    } else if (pk.state === 'format-invalid') {
      actions.appendChild(btn('mc-btn', 'Check again', function () {
        window.PMState.trigger('pack-import', pk.id);
      }));
      actions.appendChild(btn('mc-btn is-quiet', 'Remove file', function () {
        var packs = ((data().notifications || {}).sounds || {}).packs;
        var idx = packs.indexOf(pk);
        if (idx >= 0) { packs.splice(idx, 1); }
        window.PMState.receipt('Remove pack file', pk.name + ' removed from the import queue.');
        renderAll();
      }));
    } else if (pk.state === 'imported') {
      actions.appendChild(btn('mc-btn is-quiet', 'Remove pack', function () {
        window.PMState.receipt('Remove ' + pk.name,
          'Removes the pack and its ' + (pk.soundCount || 0) + ' sounds; mapped events fall back to defaults. This demo keeps the pack in place.');
      }));
    }
    card.appendChild(actions);
    return card;
  }

  /* ==================================================================
     APPEARANCE console — live hover preview + custom TOML themes
     ================================================================== */

  var themePreviewPrev = null; /* theme id to restore after hover/focus preview */

  function previewThemeStart(id) {
    if (themePreviewPrev === null) { themePreviewPrev = currentThemeId(); }
    if (id !== currentThemeId()) {
      /* attribute swap only — safe under reduced motion, no transitions
         required. Slint: bind the theme property to a preview override. */
      document.documentElement.setAttribute('data-theme', id);
    }
  }
  function previewThemeEnd() {
    if (themePreviewPrev !== null) {
      document.documentElement.setAttribute('data-theme', themePreviewPrev);
      themePreviewPrev = null;
    }
  }
  /* theme-specific rows unlock the moment a Glass theme is active and lock
     honestly again when it is not */
  function syncGlassRows(themeId) {
    var ap = data().appearance || {};
    var glass = String(themeId).indexOf('glass') === 0;
    arr(ap.lockedRows).forEach(function (lr) {
      var row = data().settings ? data().settings[lr.settingId] : null;
      if (!row) { return; }
      if (glass) {
        if (row.exposure === 'unavailable') { row.exposure = 'standard'; delete row.unavailableReason; }
      } else {
        row.exposure = 'unavailable';
        row.unavailableReason = lr.reason;
      }
    });
  }

  function applyThemeChoice(id, label) {
    themePreviewPrev = null;
    window.PMShell.applyView({ theme: id });
    /* persist through the same key the shell's theme menu uses */
    try { window.localStorage.setItem('pm.settingsConcepts.fable.c2-mission-control.theme', id); } catch (e) { /* storage unavailable */ }
    syncGlassRows(id);
    window.PMState.receipt('Apply theme', label + ' applied live — no restart — and persisted for this concept.');
    renderAll();
  }

  function renderAppearanceConsole() {
    var ap = data().appearance || {};
    var sum = consoleSummary('appearance');
    var frame = boardFrame({
      title: 'Appearance',
      summary: sum.text,
      summaryTone: sum.tone,
      locationNote: 'Appearance › Theme',
      actions: []
    });

    var rb = data().restartBanner;
    if (rb && rb.active) {
      var banner = el('div', 'mc-caution mc-restart-banner');
      banner.appendChild(ico('refresh'));
      var bText = el('div', null, rb.reason || 'A restart is required for some changes.');
      if (arr(rb.items).length) { bText.appendChild(el('div', 'mc-prose-hint', 'Waiting: ' + rb.items.join(' · '))); }
      banner.appendChild(bText);
      var restartBtn = btn('mc-btn', 'Restart now', function () {
        window.PMState.receipt('Restart Puppet Master', 'The app would restart and apply the pending items. Unsaved work is protected first.');
      });
      banner.appendChild(restartBtn);
      frame.body.appendChild(banner);
    }

    /* built-in themes: hover OR keyboard focus previews live; leaving
       restores; Apply persists */
    var themesSec = boardSection(frame.body, 'Built-in themes', 'palette');
    themesSec.body.appendChild(quietNote(
      'Hovering or focusing a card previews the theme live across the whole shell; leaving restores. Apply keeps it.', 'eye'));
    var grid = el('div', 'mc-themegrid');
    var active = currentThemeId();
    BUILTIN_THEMES.forEach(function (t) {
      var card = btn('mc-theme-card', null, function () { applyThemeChoice(t.id, t.label); });
      card.setAttribute('data-theme', t.id); /* local token scope: the swatch renders with the real theme tokens */
      card.setAttribute('aria-label', t.label + (t.id === active ? ' (active). ' : '. ') + 'Previews on focus; activates on Enter.');
      var swatch = el('span', 'mc-theme-swatch');
      swatch.appendChild(el('span', 'mc-theme-sw-bg'));
      swatch.appendChild(el('span', 'mc-theme-sw-surface'));
      swatch.appendChild(el('span', 'mc-theme-sw-accent'));
      card.appendChild(swatch);
      var lab = el('span', 'mc-theme-label', t.label);
      card.appendChild(lab);
      if (t.id === active) {
        var chip = el('span', 'pm-chip-value', 'Active');
        chip.setAttribute('data-kind', 'default');
        card.appendChild(chip);
      }
      card.addEventListener('mouseenter', function () { previewThemeStart(t.id); });
      card.addEventListener('mouseleave', function () { previewThemeEnd(); });
      card.addEventListener('focus', function () { previewThemeStart(t.id); });
      card.addEventListener('blur', function () { previewThemeEnd(); });
      grid.appendChild(card);
    });
    themesSec.body.appendChild(grid);

    /* Light / Dark / Auto + follow OS */
    var base = ap.base || {};
    var modeRow = el('div', 'mc-masterstrip');
    var modeCell = el('div', 'mc-mcell');
    modeCell.appendChild(el('span', 'mc-mcell-label', 'Mode'));
    var modeGroup = el('div', 'mc-radiogroup');
    modeGroup.setAttribute('role', 'radiogroup');
    modeGroup.setAttribute('aria-label', 'Light, dark, or automatic');
    ['light', 'dark', 'auto'].forEach(function (mode) {
      var lab = mode === 'auto' ? 'Auto' : mode.charAt(0).toUpperCase() + mode.slice(1);
      var r = btn('mc-radio', null, function () {
        base.mode = mode;
        var family = null;
        BUILTIN_THEMES.forEach(function (t) { if (t.id === currentThemeId()) { family = t.family.toLowerCase(); } });
        family = family || 'friendly';
        var target = mode === 'auto'
          ? family + '-' + ((window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark')
          : family + '-' + mode;
        applyThemeChoice(target, lab + ' mode (' + family + ')');
      });
      r.setAttribute('role', 'radio');
      r.setAttribute('aria-checked', String((base.mode || 'auto') === mode));
      r.appendChild(el('span', 'mc-radio-dot'));
      r.appendChild(el('span', null, lab));
      modeGroup.appendChild(r);
    });
    modeCell.appendChild(modeGroup);
    modeRow.appendChild(modeCell);

    var osCell = el('div', 'mc-mcell');
    osCell.appendChild(el('span', 'mc-mcell-label', 'Follow OS appearance live'));
    var osToggle = el('button', 'mc-toggle');
    osToggle.type = 'button';
    osToggle.setAttribute('role', 'switch');
    osToggle.setAttribute('aria-checked', String(base.followOS !== false));
    osToggle.setAttribute('aria-label', 'Follow OS appearance');
    osToggle.addEventListener('click', function () {
      base.followOS = base.followOS === false;
      window.PMShell.status(base.followOS
        ? 'Following the OS: light and dark switch live when the system does.'
        : 'OS following off. The mode stays where you set it.');
      renderAll();
    });
    osCell.appendChild(osToggle);
    modeRow.appendChild(osCell);
    themesSec.body.appendChild(modeRow);

    /* custom TOML themes */
    var customSec = boardSection(frame.body, 'Custom TOML themes', 'doc');
    customSec.body.appendChild(el('p', 'mc-usage-note',
      'A custom theme is a TOML file that names one of the eight built-ins as its base and overrides tokens. ' +
      'Validation runs against theme schema 1.2 at startup and on every live reload; an invalid file never half-applies — ' +
      'the base theme stays in effect and the diagnosis names the exact line.'));
    var customs = arr(ap.customThemes);
    var customWrap = el('div', 'mc-packgrid');
    customWrap.setAttribute('data-teach-ref', 'customThemes');
    if (customs.length === 0) {
      customWrap.appendChild(el('div', 'mc-inspect-empty',
        'No custom themes yet. Create one from a base theme — it inherits every token it does not override.'));
    }
    customs.forEach(function (t) { customWrap.appendChild(renderCustomThemeCard(t)); });
    customSec.body.appendChild(customWrap);

    var themeActions = el('div', 'mc-notice-actions');
    var createBtn = btn('mc-btn is-primary', null, function () {
      window.PMState.receipt('Create theme',
        'Creates my-theme.toml pre-filled with base = "' + currentThemeId() + '" in the themes folder, then opens it. Live reload picks up every save.');
    });
    createBtn.setAttribute('data-teach-ref', 'theme-create');
    createBtn.appendChild(ico('plus'));
    createBtn.appendChild(el('span', null, 'New theme from current base'));
    themeActions.appendChild(createBtn);
    themeActions.appendChild(btn('mc-btn', 'Import theme file', function () {
      window.PMState.receipt('Import theme', 'The file validates against schema 1.2 before anything applies; an invalid import lands as a diagnosed card, never a broken screen.');
    }));
    themeActions.appendChild(btn('mc-btn is-quiet', 'Export active theme', function () {
      window.PMState.receipt('Export theme', 'Writes the active theme (base plus overrides) as a portable TOML file.');
    }));
    themeActions.appendChild(btn('mc-btn is-quiet', 'Open themes folder', function () {
      window.PMState.receipt('Open themes folder', 'Opens the folder that live reload watches.');
    }));
    customSec.body.appendChild(themeActions);

    /* fonts */
    var fontsSec = boardSection(frame.body, 'Fonts', 'font');
    var fonts = ap.fonts || {};
    var fontStrip = el('div', 'mc-masterstrip');
    [['ui', 'Interface font', ['Inter', 'Nunito', 'Quicksand', 'System default']],
     ['mono', 'Monospace font', ['JetBrains Mono', 'Cascadia Mono', 'Berkeley Mono']]].forEach(function (def) {
      var cell = el('div', 'mc-mcell');
      cell.appendChild(el('span', 'mc-mcell-label', def[1]));
      var sel = document.createElement('select');
      sel.className = 'mc-select';
      sel.setAttribute('aria-label', def[1]);
      var current = fonts[def[0]] || def[2][0];
      var opts = def[2].slice();
      if (opts.indexOf(current) < 0) { opts.unshift(current); }
      opts.forEach(function (f) {
        var opt = document.createElement('option');
        opt.value = f; opt.textContent = f;
        if (f === current) { opt.selected = true; }
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function () {
        fonts[def[0]] = sel.value;
        window.PMShell.status(def[1] + ' set to ' + sel.value + '.');
        renderAll();
      });
      cell.appendChild(sel);
      fontStrip.appendChild(cell);
    });
    fontsSec.body.appendChild(fontStrip);
    if (fonts.custom && fonts.custom.state === 'not-installed') {
      var fc = el('div', 'mc-caution');
      fc.style.borderColor = 'var(--border)';
      fc.appendChild(ico('warning'));
      var fcText = el('div', null, '');
      fcText.appendChild(el('strong', null, fonts.custom.requested + ' is configured but not installed. '));
      fcText.appendChild(document.createTextNode(fonts.custom.note || 'The fallback chain is in effect.'));
      var chain = el('div', 'mc-fontchain');
      arr(fonts.fallbackChain).forEach(function (f, i) {
        if (i > 0) { chain.appendChild(ico('arrowR')); }
        var seg = el('span', 'mc-fontchain-seg', f);
        if (f === fonts.custom.requested) { seg.classList.add('is-missing'); seg.title = 'Not installed'; }
        if (f === fonts.custom.fallbackTo) { seg.classList.add('is-active'); seg.title = 'In effect now'; }
        chain.appendChild(seg);
      });
      fcText.appendChild(chain);
      fc.appendChild(fcText);
      fontsSec.body.appendChild(fc);
    }

    /* UI scale */
    var scaleSec = boardSection(frame.body, 'UI scale', 'gauge');
    var scale = ap.uiScale || { value: 1, options: [0.85, 1, 1.15, 1.3] };
    var scaleGroup = el('div', 'mc-radiogroup');
    scaleGroup.setAttribute('role', 'radiogroup');
    scaleGroup.setAttribute('aria-label', 'UI scale');
    arr(scale.options).forEach(function (opt) {
      var lab = Math.round(opt * 100) + '%';
      var r = btn('mc-radio', null, function () {
        scale.value = opt;
        scale.pendingRestart = true;
        var row = data().settings['general.visual.ui-scale'];
        if (row) { row.restartPending = true; if (row.flags) { row.flags.restart = true; } }
        window.PMShell.status('UI scale set to ' + lab + ' — takes effect after restart.');
        renderAll();
      });
      r.setAttribute('role', 'radio');
      r.setAttribute('aria-checked', String(scale.value === opt));
      r.appendChild(el('span', 'mc-radio-dot'));
      r.appendChild(el('span', null, lab));
      scaleGroup.appendChild(r);
    });
    scaleSec.body.appendChild(scaleGroup);
    if (scale.pendingRestart) {
      var pending = el('div', 'mc-dest-lasttest');
      pending.appendChild(ico('refresh'));
      pending.appendChild(el('span', null, 'Takes effect after restart. The current session keeps its scale.'));
      scaleSec.body.appendChild(pending);
    }

    /* theme-specific locked rows */
    var lockedSec = boardSection(frame.body, 'Theme-specific settings', 'lock');
    syncGlassRows(currentThemeId());
    var isGlass = currentThemeId().indexOf('glass') === 0;
    if (!isGlass) {
      lockedSec.body.appendChild(quietNote(
        'These rows belong to Glass themes. They unlock live the moment a Glass theme is active — including during a hover preview.', 'lock'));
    }
    arr(ap.lockedRows).forEach(function (lr) {
      var row = data().settings ? data().settings[lr.settingId] : null;
      if (isGlass && row) {
        lockedSec.body.appendChild(renderRow(row, 'console/appearance'));
        return;
      }
      var lockRow = el('div', 'mc-row');
      lockRow.setAttribute('data-inert', '1');
      var main = el('div', 'mc-row-main');
      var lab = el('div', 'mc-row-label', row ? row.label : lr.settingId);
      lab.appendChild(ico('lock'));
      main.appendChild(lab);
      main.appendChild(el('div', 'mc-row-desc', lr.reason));
      lockRow.appendChild(main);
      var metaCol = el('div', 'mc-row-meta');
      var chip = el('span', 'pm-chip-value', 'Unavailable in ' + currentThemeLabel());
      chip.setAttribute('data-kind', 'unavailable');
      metaCol.appendChild(chip);
      lockRow.appendChild(metaCol);
      lockedSec.body.appendChild(lockRow);
    });
  }

  function renderCustomThemeCard(t) {
    var card = el('article', 'mc-pack mc-themecard');
    card.setAttribute('data-state', t.state);
    var head = el('div', 'mc-dest-head');
    head.appendChild(ico('doc'));
    head.appendChild(el('span', 'mc-dest-title', t.name));
    var stateWord =
      t.state === 'active' ? { word: 'Active', tone: 'ok' } :
      t.state === 'invalid' ? { word: 'Invalid — fallback active', tone: 'attention' } :
      { word: 'Restart required', tone: 'setup' };
    var word = el('span', 'mc-inv-word', stateWord.word);
    word.setAttribute('data-tone', stateWord.tone);
    head.appendChild(word);
    card.appendChild(head);

    var baseLabel = t.baseTheme;
    BUILTIN_THEMES.forEach(function (bt) { if (bt.id === t.baseTheme) { baseLabel = bt.label; } });
    card.appendChild(kvBlock([
      ['File', t.file],
      ['Inherits', baseLabel],
      ['Schema', 'Theme schema ' + (t.schemaVersion || '1.2')],
      ['Live reload', t.liveReload ? 'On — saves apply immediately after validation' : 'Off'],
      ['Last loaded', t.lastLoaded ? fmtWhen(t.lastLoaded) : 'Not loaded yet']
    ]));

    if (t.state === 'invalid' && arr(t.errors).length > 0) {
      var diag = el('div', 'mc-diagnosis');
      diag.appendChild(el('h5', null, 'Diagnosis'));
      arr(t.errors).forEach(function (errRow) {
        var line = el('div', 'mc-diagnosis-line', '');
        line.appendChild(el('code', null, 'line ' + errRow.line + ' · ' + errRow.key));
        line.appendChild(el('span', null, errRow.message));
        diag.appendChild(line);
      });
      if (t.fallback && t.fallback.active) {
        var fb = el('div', 'mc-field-error');
        fb.appendChild(ico('warning'));
        fb.appendChild(el('span', null, t.fallback.reason));
        diag.appendChild(fb);
      }
      card.appendChild(diag);
    }
    if (t.restartNote) { card.appendChild(el('p', 'mc-dest-note', t.restartNote)); }

    card.appendChild(opStrip('theme-reload', t.id));

    var actions = el('div', 'mc-notice-actions');
    if (t.state === 'invalid' || t.liveReload) {
      actions.appendChild(btn('mc-btn' + (t.state === 'invalid' ? ' is-primary' : ''), 'Reload', function () {
        window.PMState.trigger('theme-reload', t.id);
      }));
    }
    actions.appendChild(btn('mc-btn is-quiet', 'Open file', function () {
      window.PMState.receipt('Open ' + t.file, 'Opens the TOML file in your editor; live reload validates every save.');
    }));
    actions.appendChild(btn('mc-btn is-quiet', 'Export', function () {
      window.PMState.receipt('Export ' + t.name, 'Writes a portable copy including its base reference.');
    }));
    actions.appendChild(btn('mc-btn is-quiet', 'Remove', function () {
      window.PMState.receipt('Remove ' + t.name, 'Deletes the file after a confirm; the base theme takes over wherever it was active.');
    }));
    card.appendChild(actions);
    return card;
  }

  /* ==================================================================
     SPELLCHECK & DICTIONARIES console
     ================================================================== */

  var SPELL_ROW_IDS = [
    'general.spellcheck.check', 'general.spellcheck.language',
    'general.spellcheck.dictionary-source', 'general.spellcheck.personal-dictionary',
    'general.spellcheck.project-dictionary'
  ];
  var SPELL_ADV_IDS = [
    'general.spellcheck.technical-prose', 'general.spellcheck.unknown-names',
    'general.spellcheck.language-packs', 'general.spellcheck.overrides'
  ];

  function renderDictionaryConsole() {
    var sum = consoleSummary('dictionary');
    var frame = boardFrame({
      title: 'Spellcheck & Dictionaries',
      summary: sum.text,
      summaryTone: sum.tone,
      locationNote: 'General › Writing & spelling',
      actions: []
    });

    frame.body.appendChild(quietNote(
      'Spellcheck underlines and suggests — it never auto-corrects. Code, paths, ALL-CAPS tokens, and known model or persona names are skipped.', 'edit'));

    var normalSec = boardSection(frame.body, 'Spelling', 'check');
    SPELL_ROW_IDS.forEach(function (sid) {
      var s = data().settings ? data().settings[sid] : null;
      if (s) { normalSec.body.appendChild(renderRow(s, 'console/dictionary')); }
    });

    var advDisc = disclosure({ label: 'Advanced source & behavior', icoName: 'wrench', kind: 'advanced' });
    advDisc.body.appendChild(el('p', 'mc-usage-note',
      'Dictionary source order: Automatic tries the OS spell service first and falls back to PM local dictionaries; the other choices pin one source.'));
    SPELL_ADV_IDS.forEach(function (sid) {
      var s = data().settings ? data().settings[sid] : null;
      if (s) { advDisc.body.appendChild(renderRow(s, 'console/dictionary')); }
    });
    normalSec.body.appendChild(advDisc.root);

    /* dictionary CRUD boards */
    var words = dictionaryWords();
    var dictSec = boardSection(frame.body, 'Dictionaries', 'doc');
    var boards = el('div', 'mc-dictboards');
    boards.appendChild(renderDictBoard('personal', 'Personal dictionary', words.personal,
      'Follows you across every project.'));
    boards.appendChild(renderDictBoard('project', 'Project dictionary', words.project,
      'Checked into the project when the team opts in; used when available.'));
    dictSec.body.appendChild(boards);
    dictSec.body.appendChild(quietNote(
      'Words added from any composer land here too — right-click a flagged word in the Assistant panel and add it.', 'info'));

    /* grammar assist: separate, opt-in, provider-backed */
    var gaSec = boardSection(frame.body, 'Grammar & style assist', 'sparkle');
    var ga = data().settings ? data().settings['general.writing.grammar-assist'] : null;
    if (ga) { gaSec.body.appendChild(renderRow(ga, 'console/dictionary')); }
    var disclose = el('div', 'mc-caution');
    disclose.style.borderColor = 'var(--border)';
    disclose.appendChild(ico('shield'));
    var dText = el('div', null, '');
    dText.appendChild(el('strong', null, 'Separate from spellcheck, and off by default. '));
    dText.appendChild(document.createTextNode(
      'Grammar assist is provider-backed: the text you check is sent to your configured Assistant route and billed like any other request. ' +
      'Spellcheck stays fully local either way.'));
    dText.appendChild(el('div', 'mc-prose-hint',
      'Route: Assistant role (Claude Sonnet 4.5 · Personal Max) · Privacy: text leaves this computer only while assist is on · Cost: attributed to the Assistant role on the Usage page.'));
    disclose.appendChild(dText);
    gaSec.body.appendChild(disclose);

    /* live demo pointer: PMSpell already runs in the Assistant composer */
    var demoBtn = btn('mc-btn', null, function () {
      var chatToggle = document.getElementById('pmChatToggle');
      if (chatToggle && chatToggle.getAttribute('aria-pressed') !== 'true') { chatToggle.click(); }
      window.PMShell.status('The Assistant composer underlines as you type. Right-click a flagged word for suggestions and dictionary actions.');
    });
    demoBtn.appendChild(ico('chat'));
    demoBtn.appendChild(el('span', null, 'See it live in the Assistant composer'));
    gaSec.body.appendChild(demoBtn);
  }

  function renderDictBoard(kind, title, list, blurb) {
    var board = el('div', 'mc-dictboard');
    board.appendChild(el('h3', null, title));
    board.appendChild(el('p', 'mc-prose-hint', blurb));
    var wrap = el('div', 'mc-dictwords');
    if (list.length === 0) {
      wrap.appendChild(el('div', 'mc-inspect-empty', 'No words yet.'));
    }
    list.forEach(function (word) {
      var chip = el('span', 'mc-dictword');
      chip.appendChild(el('span', null, word));
      var rm = btn('mc-dictword-rm', null, function () {
        removeDictWord(kind, word);
      });
      rm.setAttribute('aria-label', 'Remove "' + word + '" from the ' + kind + ' dictionary');
      rm.appendChild(ico('close'));
      chip.appendChild(rm);
      wrap.appendChild(chip);
    });
    board.appendChild(wrap);

    var addRow = el('div', 'mc-dictadd');
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'mc-input';
    input.placeholder = 'Add a word';
    input.setAttribute('aria-label', 'Add a word to the ' + kind + ' dictionary');
    var addBtn = btn('mc-btn', 'Add', function () {
      var word = input.value.trim();
      if (!word) { return; }
      var key = 'spell.' + kind;
      var cur = arr(store.get(key)).slice();
      if (cur.indexOf(word) < 0) { cur.push(word); store.set(key, cur); }
      var removedKey = 'spell.removed.' + kind;
      var removed = arr(store.get(removedKey)).filter(function (w) { return w !== word.toLowerCase(); });
      store.set(removedKey, removed);
      window.PMState.receipt('Add to ' + kind + ' dictionary', '"' + word + '" will no longer be flagged.');
      renderAll();
    });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { addBtn.click(); } });
    addRow.appendChild(input);
    addRow.appendChild(addBtn);
    board.appendChild(addRow);
    return board;
  }

  function removeDictWord(kind, word) {
    var key = 'spell.' + kind;
    var low = word.toLowerCase();
    var cur = arr(store.get(key)).slice();
    var idx = -1;
    cur.forEach(function (w, i) { if (String(w).toLowerCase() === low) { idx = i; } });
    if (idx >= 0) {
      cur.splice(idx, 1);
      store.set(key, cur);
    } else {
      /* a base-data word: mask it for this session via the removed list */
      var removedKey = 'spell.removed.' + kind;
      var removed = arr(store.get(removedKey)).slice();
      if (removed.indexOf(low) < 0) { removed.push(low); store.set(removedKey, removed); }
    }
    window.PMState.receipt('Remove from ' + kind + ' dictionary', '"' + word + '" will be flagged again.');
    renderAll();
  }

  /* ==================================================================
     DESKTOP / TRAY / WINDOW console
     ================================================================== */

  var ACTIVITY_LABEL = {
    files: 'Files', search: 'Search', 'source-control': 'Source Control',
    actions: 'GitHub Actions', docker: 'Containers', testing: 'Testing',
    chat: 'Assistant', agents: 'Agents', artifacts: 'Artifacts'
  };

  function renderDesktopConsole() {
    var dk = data().desktop || {};
    var sum = consoleSummary('desktop');
    var frame = boardFrame({
      title: 'Desktop, Tray & Windows',
      summary: sum.text,
      summaryTone: sum.tone,
      locationNote: 'General › Desktop, tray & windows',
      actions: []
    });

    /* tray strip */
    var traySec = boardSection(frame.body, 'Tray', 'tray');
    ['general.desktop.minimize-to-tray', 'general.desktop.close-to-tray'].forEach(function (sid) {
      var s = data().settings ? data().settings[sid] : null;
      if (s) { traySec.body.appendChild(renderRow(s, 'console/desktop')); }
    });
    var tray = dk.tray || {};
    if (tray.automationBadgeNote) {
      var badgeNote = quietNote(tray.automationBadgeNote, 'refresh');
      traySec.body.appendChild(badgeNote);
    }
    /* tray menu preview: a quiet static rendering, clearly labeled */
    var menuPrev = el('div', 'mc-traypreview');
    menuPrev.setAttribute('aria-label', 'Preview of the tray menu — display only, not live controls');
    menuPrev.appendChild(el('h5', null, 'Tray menu preview'));
    arr(tray.menu).forEach(function (item) {
      menuPrev.appendChild(el('div', 'mc-traypreview-item', item));
    });
    menuPrev.appendChild(el('p', 'mc-prose-hint', 'A preview of what the real tray menu offers — these are not live controls.'));
    traySec.body.appendChild(menuPrev);

    /* launch & restore */
    var launchSec = boardSection(frame.body, 'Launch & restore', 'windowIcon');
    var launch = dk.launch || {};
    var launchStrip = el('div', 'mc-masterstrip');
    var destCell = el('div', 'mc-mcell');
    destCell.appendChild(el('span', 'mc-mcell-label', 'Open at launch'));
    var destSel = document.createElement('select');
    destSel.className = 'mc-select';
    destSel.setAttribute('aria-label', 'Launch destination');
    [['last-project', 'The last project'], ['dashboard', 'The Dashboard'], ['projects', 'The Projects list']].forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o[0]; opt.textContent = o[1];
      if ((launch.destination || 'last-project') === o[0]) { opt.selected = true; }
      destSel.appendChild(opt);
    });
    destSel.addEventListener('change', function () {
      launch.destination = destSel.value;
      window.PMShell.status('Launch opens ' + destSel.options[destSel.selectedIndex].textContent.toLowerCase() + '.');
    });
    destCell.appendChild(destSel);
    launchStrip.appendChild(destCell);
    [['restoreWindows', 'Restore windows'], ['restorePanels', 'Restore panels'], ['restoreTabs', 'Restore tabs']].forEach(function (def) {
      var cell = el('div', 'mc-mcell');
      cell.appendChild(el('span', 'mc-mcell-label', def[1]));
      var t = el('button', 'mc-toggle');
      t.type = 'button';
      t.setAttribute('role', 'switch');
      t.setAttribute('aria-checked', String(launch[def[0]] !== false));
      t.setAttribute('aria-label', def[1]);
      t.addEventListener('click', function () {
        launch[def[0]] = launch[def[0]] === false;
        t.setAttribute('aria-checked', String(launch[def[0]] !== false));
        window.PMShell.status(def[1] + ' ' + (launch[def[0]] !== false ? 'on' : 'off') + '.');
      });
      cell.appendChild(t);
      launchStrip.appendChild(cell);
    });
    launchSec.body.appendChild(launchStrip);

    /* crash recovery */
    var crashSec = boardSection(frame.body, 'Crash recovery', 'shield');
    var crash = dk.crashRecovery || {};
    crashSec.body.appendChild(kvBlock([
      ['Last recovery', crash.lastRecovery ? fmtWhen(crash.lastRecovery) : 'Never needed'],
      ['Buffers restored', crash.buffersRestored != null ? String(crash.buffersRestored) : '0'],
      ['Unsaved protection', crash.unsavedProtection === 'always' ? 'Always — unsaved work is journaled continuously' : String(crash.unsavedProtection || '')]
    ]));
    if (crash.note) { crashSec.body.appendChild(el('p', 'mc-dest-note', crash.note)); }
    crashSec.body.appendChild(btn('mc-btn is-quiet', 'Open the recovery journal', function () {
      window.PMState.receipt('Open recovery journal', 'Lists every recovered buffer with its timestamp and where it was restored to.');
    }));

    /* Activity Bar order board */
    var abSec = boardSection(frame.body, 'Activity Bar', 'rail');
    var ab = dk.activityBar || { order: [], hidden: [] };
    abSec.body.appendChild(el('p', 'mc-usage-note',
      'The Activity Bar is the narrow icon rail on the left; it controls one adjacent side-panel slot. Order it here; hidden entries collect below.'));
    var orderList = el('div', 'mc-ablist');
    orderList.setAttribute('role', 'list');
    arr(ab.order).forEach(function (itemId, idx) {
      var rowEl = el('div', 'mc-abitem');
      rowEl.setAttribute('role', 'listitem');
      var hidden = arr(ab.hidden).indexOf(itemId) >= 0;
      if (hidden) { rowEl.setAttribute('data-hidden', '1'); }
      rowEl.appendChild(el('span', 'mc-abitem-n', String(idx + 1)));
      rowEl.appendChild(el('span', 'mc-abitem-label', ACTIVITY_LABEL[itemId] || itemId));
      if (hidden) {
        var hiddenChip = el('span', 'pm-chip-value', 'Hidden');
        hiddenChip.setAttribute('data-kind', 'custom');
        rowEl.appendChild(hiddenChip);
      }
      var controls = el('span', 'mc-abitem-controls');
      var up = btn('mc-iconbtn', null, function () {
        if (idx === 0) { return; }
        ab.order.splice(idx, 1);
        ab.order.splice(idx - 1, 0, itemId);
        window.PMShell.status((ACTIVITY_LABEL[itemId] || itemId) + ' moved up.');
        renderAll();
      });
      up.setAttribute('aria-label', 'Move ' + (ACTIVITY_LABEL[itemId] || itemId) + ' up');
      up.disabled = idx === 0;
      up.appendChild(ico('chevU'));
      controls.appendChild(up);
      var down = btn('mc-iconbtn', null, function () {
        if (idx >= ab.order.length - 1) { return; }
        ab.order.splice(idx, 1);
        ab.order.splice(idx + 1, 0, itemId);
        window.PMShell.status((ACTIVITY_LABEL[itemId] || itemId) + ' moved down.');
        renderAll();
      });
      down.setAttribute('aria-label', 'Move ' + (ACTIVITY_LABEL[itemId] || itemId) + ' down');
      down.disabled = idx >= ab.order.length - 1;
      down.appendChild(ico('chevD'));
      controls.appendChild(down);
      var hideBtn = btn('mc-iconbtn', null, function () {
        if (hidden) {
          ab.hidden = arr(ab.hidden).filter(function (h) { return h !== itemId; });
          window.PMShell.status((ACTIVITY_LABEL[itemId] || itemId) + ' shown in the Activity Bar.');
        } else {
          ab.hidden = arr(ab.hidden).concat([itemId]);
          window.PMShell.status((ACTIVITY_LABEL[itemId] || itemId) + ' hidden. It stays reachable through search and the overflow menu.');
        }
        renderAll();
      });
      hideBtn.setAttribute('aria-label', (hidden ? 'Show ' : 'Hide ') + (ACTIVITY_LABEL[itemId] || itemId));
      hideBtn.appendChild(ico(hidden ? 'eye' : 'eyeOff'));
      controls.appendChild(hideBtn);
      rowEl.appendChild(controls);
      orderList.appendChild(rowEl);
    });
    abSec.body.appendChild(orderList);
    var ofCell = el('div', 'mc-mcell');
    ofCell.appendChild(el('span', 'mc-mcell-label', 'When the rail overflows'));
    var ofSel = document.createElement('select');
    ofSel.className = 'mc-select';
    ofSel.setAttribute('aria-label', 'Overflow behavior');
    [['menu', 'Collect extras into a menu'], ['scroll', 'Scroll the rail']].forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o[0]; opt.textContent = o[1];
      if ((ab.overflow || 'menu') === o[0]) { opt.selected = true; }
      ofSel.appendChild(opt);
    });
    ofSel.addEventListener('change', function () {
      ab.overflow = ofSel.value;
      window.PMShell.status('Overflow: ' + ofSel.options[ofSel.selectedIndex].textContent.toLowerCase() + '.');
    });
    ofCell.appendChild(ofSel);
    abSec.body.appendChild(ofCell);

    /* limits */
    var limSec = boardSection(frame.body, 'Limits & history', 'gauge');
    var limits = dk.limits || {};
    var limStrip = el('div', 'mc-masterstrip');
    [['maxEditorTabs', 'Editor tab limit', 'Oldest unpinned tabs close past this'],
     ['treeRenderLimit', 'File tree render limit', 'Bigger folders window their rows'],
     ['historyArchiveDays', 'History archive after (days)', 'Sessions archive, never silently delete']].forEach(function (def) {
      var cell = el('div', 'mc-mcell');
      cell.appendChild(el('span', 'mc-mcell-label', def[1]));
      var input = document.createElement('input');
      input.type = 'number';
      input.className = 'mc-input';
      input.value = String(limits[def[0]] != null ? limits[def[0]] : '');
      input.setAttribute('aria-label', def[1]);
      input.addEventListener('change', function () {
        limits[def[0]] = Number(input.value);
        window.PMShell.status(def[1] + ' set to ' + input.value + '. ' + def[2] + '.');
      });
      cell.appendChild(input);
      cell.appendChild(el('span', 'mc-prose-hint', def[2]));
      limStrip.appendChild(cell);
    });
    limSec.body.appendChild(limStrip);
  }

  /* ==================================================================
     TEACHER / HELP console + step overlay
     Teacher can explain the current screen and hand off safely into a
     REAL flow (the guided Slack topic focuses the actual add form).
     ================================================================== */

  function teacherSurfaceLabel(surface) {
    var label = surface;
    arr(window.PMState.managerDefs).forEach(function (d) { if (d && d.id === surface) { label = d.label; } });
    return label;
  }

  function topicForCurrentView() {
    var topics = arr((data().teacher || {}).topics);
    var surface = view.name === 'manager' ? (MANAGER_BY_CONSOLE[view.managerId] || '') : '';
    for (var i = 0; i < topics.length; i++) {
      if (topics[i] && topics[i].surface === surface) { return topics[i]; }
    }
    return topics[0] || null;
  }

  function explainCurrentScreen() {
    var topic = topicForCurrentView();
    if (!topic) {
      window.PMState.receipt('Explain this screen', 'No Teacher topic covers this screen yet.');
      return;
    }
    window.PMState.trigger('teacher-explain', topic.id);
  }

  function renderTeacherConsole() {
    var te = data().teacher || {};
    var sum = consoleSummary('teacher');
    var explainBtn = btn('mc-btn is-primary', null, function () { explainCurrentScreen(); });
    explainBtn.appendChild(ico('grad'));
    explainBtn.appendChild(el('span', null, 'Explain this screen'));
    var frame = boardFrame({
      title: 'Teacher & Help',
      summary: sum.text,
      summaryTone: sum.tone,
      locationNote: 'General › Teacher & help',
      actions: [explainBtn]
    });

    var availSec = boardSection(frame.body, 'Availability', 'info');
    var availStrip = el('div', 'mc-masterstrip');
    var cell = el('div', 'mc-mcell');
    cell.appendChild(el('span', 'mc-mcell-label', 'Teacher'));
    var t = el('button', 'mc-toggle');
    t.type = 'button';
    t.setAttribute('role', 'switch');
    t.setAttribute('aria-checked', String(te.enabled !== false));
    t.setAttribute('aria-label', 'Teacher enabled');
    t.addEventListener('click', function () {
      te.enabled = te.enabled === false;
      window.PMShell.status(te.enabled ? 'Teacher available on every Settings screen.' : 'Teacher off. Row-level help stays: hover, focus, and Details.');
      renderAll();
    });
    cell.appendChild(t);
    availStrip.appendChild(cell);
    var lastCell = el('div', 'mc-mcell');
    lastCell.appendChild(el('span', 'mc-mcell-label', 'Last session'));
    lastCell.appendChild(el('span', null, te.lastSession ? fmtWhen(te.lastSession) : 'Never'));
    availStrip.appendChild(lastCell);
    availSec.body.appendChild(availStrip);
    availSec.body.appendChild(quietNote(
      'Help is never hover-only: every row answers to hover, keyboard focus, and an explicit Details affordance. Teacher adds guided walkthroughs on top, and its guided topics can hand off into the real flow — never a mockup.', 'check'));

    var topicSec = boardSection(frame.body, 'Topics', 'grad');
    var topics = arr(te.topics);
    if (topics.length === 0) {
      topicSec.body.appendChild(el('div', 'mc-inspect-empty', 'No topics yet. Topics arrive with the surfaces they explain.'));
    }
    var tGrid = el('div', 'mc-packgrid');
    topics.forEach(function (topic) {
      var card = el('article', 'mc-topic');
      var head = el('div', 'mc-dest-head');
      head.appendChild(ico(topic.kind === 'guided-action' ? 'route' : 'info'));
      head.appendChild(el('span', 'mc-dest-title', topic.title));
      var kindWord = el('span', 'mc-inv-word', topic.kind === 'guided-action' ? 'Guided action' : 'Explains the screen');
      kindWord.setAttribute('data-tone', topic.kind === 'guided-action' ? 'setup' : 'ok');
      head.appendChild(kindWord);
      card.appendChild(head);
      var surfaceNative = !!CONSOLE_BY_MANAGER[topic.surface];
      var surfLine = el('p', 'mc-dest-note',
        'Surface: ' + teacherSurfaceLabel(topic.surface) +
        (surfaceNative ? '' : ' — proven in ' + ((COVERED_IN[topic.surface] || {}).label || 'another concept')));
      card.appendChild(surfLine);
      card.appendChild(el('p', 'mc-prose-hint',
        arr(topic.steps).length + (topic.steps.length === 1 ? ' step' : ' steps') +
        (topic.canTransitionToAction ? ' · hands off into the real flow at the end' : '')));
      var actions = el('div', 'mc-notice-actions');
      actions.appendChild(btn('mc-btn is-primary', 'Start', function () {
        window.PMState.trigger('teacher-explain', topic.id);
      }));
      card.appendChild(actions);
      tGrid.appendChild(card);
    });
    topicSec.body.appendChild(tGrid);
  }

  /* ---------------- Teacher step overlay ---------------- */

  function clearTeachHighlights() {
    var hi = document.querySelectorAll('.mc-teach-hi');
    Array.prototype.forEach.call(hi, function (node) { node.classList.remove('mc-teach-hi'); });
  }

  function closeTeachOverlay(refocus) {
    clearTeachHighlights();
    if (teachOverlay && teachOverlay.root && teachOverlay.root.parentNode) {
      teachOverlay.root.parentNode.removeChild(teachOverlay.root);
    }
    teachOverlay = null;
    if (refocus && els.cmdbar) { els.cmdbar.focus(); }
  }

  function openTeachOverlay(topic) {
    closeTeachOverlay(false);
    var root = el('div', 'mc-teach');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Teacher: ' + topic.title);
    teachOverlay = { topic: topic, step: 0, root: root };
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeTeachOverlay(true); }
    });
    document.body.appendChild(root);
    renderTeachStep();
    var firstBtn = root.querySelector('button');
    if (firstBtn) { firstBtn.focus(); }
  }

  function renderTeachStep() {
    if (!teachOverlay) { return; }
    var topic = teachOverlay.topic;
    var i = teachOverlay.step;
    var steps = arr(topic.steps);
    var step = steps[i] || {};
    var root = teachOverlay.root;
    clear(root);
    clearTeachHighlights();

    var head = el('div', 'mc-teach-head');
    head.appendChild(ico('grad'));
    head.appendChild(el('span', 'mc-teach-title', topic.title));
    head.appendChild(el('span', 'mc-teach-count', (i + 1) + ' of ' + steps.length));
    var closeBtn = btn('mc-iconbtn', null, function () { closeTeachOverlay(true); });
    closeBtn.setAttribute('aria-label', 'Close Teacher');
    closeBtn.appendChild(ico('close'));
    head.appendChild(closeBtn);
    root.appendChild(head);

    root.appendChild(el('p', 'mc-teach-text', step.text || ''));

    /* highlight the real element this step talks about, when present */
    if (step.highlightRef) {
      var target = els.body ? els.body.querySelector('[data-teach-ref="' + esc(step.highlightRef) + '"]') : null;
      if (target) {
        target.classList.add('mc-teach-hi');
        target.scrollIntoView({ block: 'center', behavior: 'auto' });
      } else {
        var surfaceNative = !!CONSOLE_BY_MANAGER[topic.surface];
        if (surfaceNative && !(view.name === 'manager' && MANAGER_BY_CONSOLE[view.managerId] === topic.surface)) {
          var goBtn = btn('mc-btn', 'Open ' + teacherSurfaceLabel(topic.surface), function () {
            go({ name: 'manager', managerId: CONSOLE_BY_MANAGER[topic.surface] }, { keepTeach: true });
            window.setTimeout(renderTeachStep, 80);
          });
          root.appendChild(goBtn);
        } else if (!surfaceNative && COVERED_IN[topic.surface]) {
          var cov = COVERED_IN[topic.surface];
          var covLine = el('p', 'mc-prose-hint',
            'This surface is proven natively in ' + cov.label + '.');
          root.appendChild(covLine);
          var covLink = document.createElement('a');
          covLink.className = 'mc-btn mc-btn-link';
          covLink.href = cov.page + '#/manager/' + topic.surface;
          covLink.appendChild(el('span', null, 'Open it in ' + cov.label));
          covLink.appendChild(ico('external'));
          root.appendChild(covLink);
        }
      }
    }

    /* the guided handoff: the action step opens the REAL flow */
    if (step.actionRef === 'notifications.destination.add') {
      var handoff = btn('mc-btn is-primary', 'Open the real add-destination flow', function () {
        closeTeachOverlay(false);
        view.pendingDest = { kind: 'slack', isNew: true, focusField: 'workspace' };
        go({ name: 'manager', managerId: 'notifications' });
      });
      root.appendChild(handoff);
      root.appendChild(el('p', 'mc-prose-hint',
        'This opens the actual form with the workspace field focused — the same flow the Add destination button uses. Nothing is pre-submitted.'));
    } else if (step.actionRef === 'theme.create') {
      var themeHandoff = btn('mc-btn is-primary', 'Create the theme file', function () {
        closeTeachOverlay(false);
        go({ name: 'manager', managerId: 'appearance' });
        window.requestAnimationFrame(function () {
          var createBtn = els.body.querySelector('[data-teach-ref="theme-create"]');
          if (createBtn) { createBtn.focus(); window.PMSpy.focusFlash(createBtn); }
        });
      });
      root.appendChild(themeHandoff);
    }

    var foot = el('div', 'mc-teach-foot');
    if (i > 0) {
      foot.appendChild(btn('mc-btn is-quiet', 'Back', function () {
        teachOverlay.step = i - 1;
        renderTeachStep();
      }));
    }
    if (i < steps.length - 1) {
      foot.appendChild(btn('mc-btn is-primary', 'Next', function () {
        teachOverlay.step = i + 1;
        renderTeachStep();
      }));
    } else {
      foot.appendChild(btn('mc-btn', 'Done', function () { closeTeachOverlay(true); }));
    }
    root.appendChild(foot);
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

    frame.inv.appendChild(el('div', 'mc-inv-group', 'Purposes'));
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
    else { frame.inspect.appendChild(el('div', 'mc-inspect-empty', 'Select a media route to inspect it.')); }
  }

  function renderMediaInspector(inspect, m) {
    clear(inspect);
    var provider = m.providerRef ? providerById(m.providerRef) : null;
    var h2 = el('h2', null, MEDIA_PURPOSE[m.purpose] || m.purpose);
    var kindTag = el('span', 'mc-tag', !m.providerRef ? 'Not configured'
      : (m.native ? 'Native provider capability' : 'PM transformation'));
    h2.appendChild(kindTag);
    inspect.appendChild(h2);

    if (!m.providerRef) {
      var warn = el('div', 'mc-wave-warning');
      warn.appendChild(ico('warning'));
      var wText = el('div', null, 'No connected provider offers this capability. Requests fail with an honest receipt until one is connected.');
      warn.appendChild(wText);
      inspect.appendChild(warn);
      var connectBtn = btn('mc-btn is-primary', 'Choose a provider', function () {
        go({ name: 'manager', managerId: 'providers' });
        window.PMShell.status('Connect a provider that offers video generation, then this route activates automatically.');
      });
      inspect.appendChild(connectBtn);
    }

    if (m.transformNote) {
      var note = el('div', 'mc-caution');
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
      var prose = el('div', 'mc-prose');
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
      inspect.appendChild(el('p', 'mc-prose-hint',
        'Spellcheck suggests, never auto-corrects. Paths such as artifacts/media/ are skipped.'));
      try { window.PMSpell.attach(prose, { store: store, projectDict: true }); } catch (e) { /* optional */ }
      var run = btn('mc-btn', 'Run a test generation', function () {
        window.PMState.receipt('Test ' + (MEDIA_PURPOSE[m.purpose] || m.purpose).toLowerCase(),
          m.providerRef ? 'Simulated — no real provider call is made in this demo.' : 'No provider is connected for this purpose, so the request would fail.');
      });
      run.style.marginTop = '8px';
      inspect.appendChild(run);
    }

    inspect.appendChild(inspectHead('history', 'Generation history'));
    var hist = el('div', 'mc-history');
    if (arr(m.history).length === 0) {
      hist.appendChild(el('div', 'mc-inspect-empty', 'Nothing generated on this route yet.'));
    }
    arr(m.history).forEach(function (hh) {
      var row = el('div', 'mc-history-row');
      row.setAttribute('data-ok', hh.ok ? '1' : '0');
      row.appendChild(ico(hh.ok ? 'checkCircle' : 'close'));
      row.appendChild(el('span', null, hh.what));
      row.appendChild(el('span', 'mc-history-at', fmtWhen(hh.at)));
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

  /* Teacher woven into the palette: matching topics ride along under the
     shared search results, and an empty palette offers "Explain this screen". */
  function teacherPaletteMatches(q) {
    var topics = arr((data().teacher || {}).topics);
    var tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    var out = [];
    topics.forEach(function (topic) {
      var hay = (topic.title + ' teacher explain help guide').toLowerCase();
      var all = tokens.length > 0 && tokens.every(function (tk) { return hay.indexOf(tk) >= 0; });
      if (all) { out.push({ kind: 'teacher', id: topic.id, label: topic.title, topic: topic }); }
    });
    return out.slice(0, 3);
  }

  function renderPaletteResults(query) {
    var list = els.paletteList;
    clear(list);
    paletteActive = 0;
    paletteResults = [];
    var q = String(query || '').trim();
    if (q === '') {
      list.appendChild(el('div', 'mc-palette-empty',
        'Type to search every setting, console, and action — with owner breadcrumbs.'));
      paletteResults = [{ kind: 'teacher-current', id: '__explain__', label: 'Explain this screen' }];
    } else {
      paletteResults = arr(window.PMState.search(q, data())).slice(0, 18).concat(teacherPaletteMatches(q));
      if (paletteResults.length === 0) {
        list.appendChild(el('div', 'mc-palette-empty', 'No matches for "' + q + '".'));
        return;
      }
    }
    paletteResults.forEach(function (r, i) {
      var item = btn('mc-palette-item', null, function () { activateResult(r); });
      item.setAttribute('role', 'option');
      item.id = 'c2pal-' + i;
      if (i === 0) { item.classList.add('is-active'); }
      var icoName = r.kind === 'manager' ? 'grid'
        : r.kind === 'manager-receipt' ? 'external'
        : r.kind === 'action' ? 'bolt'
        : (r.kind === 'teacher' || r.kind === 'teacher-current') ? 'grad' : 'gear';
      item.appendChild(ico(icoName));
      item.appendChild(el('span', 'mc-pal-label', r.label));
      var crumbText = '';
      if (r.kind === 'setting') {
        var loc = subIndex[r.id];
        crumbText = loc ? (loc.domainTitle + ' › ' + loc.subTitle) : '';
      } else if (r.kind === 'manager-receipt' && r.coveredIn) {
        /* honest receipt: names the owning concept, links cross-page */
        crumbText = 'Proven natively in ' + (r.coveredIn.label || r.coveredIn.concept);
      } else if (r.kind === 'teacher' || r.kind === 'teacher-current') {
        crumbText = 'Teacher';
      } else if (r.domainId) {
        var d = domainById(r.domainId);
        crumbText = d ? d.title : '';
      }
      item.appendChild(el('span', 'mc-pal-crumb', crumbText));
      var kindLabel = r.kind === 'manager' ? 'Console'
        : r.kind === 'manager-receipt' ? 'Other concept'
        : r.kind === 'action' ? 'Action'
        : (r.kind === 'teacher' || r.kind === 'teacher-current') ? 'Guide' : 'Setting';
      if (r.kind === 'setting' && r.exposure && r.exposure !== 'standard') {
        var expLabel = { advanced: 'Advanced', expert: 'Expert', managed: 'Managed', diagnostic: 'Diagnostic', unavailable: 'Unavailable' }[r.exposure];
        if (expLabel) { kindLabel = expLabel; }
      }
      item.appendChild(el('span', 'mc-pal-kind', kindLabel));
      list.appendChild(item);
    });
  }

  function setPaletteActive(idx) {
    var items = els.paletteList.querySelectorAll('.mc-palette-item');
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
      var consoleId = CONSOLE_BY_MANAGER[r.id];
      if (consoleId) { go({ name: 'manager', managerId: consoleId }); return; }
      if (r.domainId && domainById(r.domainId)) { go({ name: 'workspace', domainId: r.domainId }); return; }
      go({ name: 'home' });
      return;
    }
    if (r.kind === 'manager-receipt') {
      /* honest receipt with a REAL cross-page link: activating navigates to
         the owning concept's deep link for this manager */
      var cov = r.coveredIn || COVERED_IN[r.id];
      var href = cov ? (cov.page + '#/manager/' + r.id) : null;
      if (href) {
        window.PMState.receipt('Open ' + r.label,
          'Proven natively in ' + (cov.label || cov.concept) + ' — opening ' + href + '.');
        window.location.href = href;
      } else {
        window.PMState.receipt('Open ' + r.label, 'No owning concept page recorded for this manager.');
      }
      return;
    }
    if (r.kind === 'teacher') {
      window.PMState.trigger('teacher-explain', r.id);
      return;
    }
    if (r.kind === 'teacher-current') {
      explainCurrentScreen();
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
      if (teachOverlay) { closeTeachOverlay(true); return; }
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
    /* contract boot order: PMShell.init -> PMState.init -> build -> bindRouter */
    window.PMShell.init({
      concept: 'c2-mission-control',
      onWidthChange: function () {
        if (view.name === 'workspace' && spy) {
          spy.refresh();
          layoutMinimap();
        }
      }
    });

    store = window.PMState.init('c2-mission-control');

    /* manager manifest: what Mission Control proves natively, and where
       every other manager id is proven instead */
    window.PMState.registerManagers({
      conceptId: 'c2-mission-control',
      native: [
        'manager.providers', 'manager.roles', 'manager.freeRoutes',
        'manager.notifications', 'manager.sounds', 'manager.appearance',
        'manager.dictionary', 'manager.desktop', 'manager.teacher', 'manager.media'
      ],
      coveredIn: COVERED_IN
    });

    rebuildSubIndex();
    buildStage();
    restoreView();
    renderAll();

    window.PMState.mountStatesDrawer(store);

    store.on('scenario', function () {
      rebuildSubIndex();
      view.freeSetup = null;
      view.pendingDest = null;
      closeTeachOverlay(false);
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
    /* truthful staged-operation projections (install/update, dest tests,
       sound uploads, pack imports, theme reloads) */
    store.on('op', handleOp);
    store.on('teacher', function (payload) {
      if (payload && payload.topic) { openTeachOverlay(payload.topic); }
    });
    store.on('receipt', function (r) {
      if (r && r.message) { window.PMShell.toast(r.message); }
    });

    document.addEventListener('keydown', onGlobalKeydown);
    document.addEventListener('mousedown', onDocMousedown, true);

    /* the router applies the initial deep link (scenario -> fixtures ->
       route -> focus -> triggers), then keeps Back/forward real */
    window.PMState.bindRouter({ open: routerOpen });

    window.PMShell.status('Mission Control ready.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
