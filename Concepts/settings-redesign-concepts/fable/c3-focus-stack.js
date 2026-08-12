/* c3-focus-stack.js — fable · Focus Stack (final cumulative packet, rev 2)
   Layered focus: one surface at a time. Every navigation pushes a
   full-height sheet onto a visible layer spine; every disclosure is
   navigation (advanced settings, row details, warning details and expert
   confirmations each push a (half-)sheet). Lowest density of the four
   fable concepts.
   Native manager stacks (packet 08, concept 3): File Manager, Terminal,
   LSP, Formatters, Commands & Shortcuts, MCP, Skills, Plugins, Tools,
   Testing & Debug, plus the shared Providers/Installations grammar.
   Every native manager is a SHEET STACK: list sheet, then detail sheet,
   then diagnostics sheet. Personas moved to c1 Atlas; this page answers
   with an honest cross-page receipt.
   Router: PMState.bindRouter drives the stack from deterministic deep
   links; sheet pushes write pushState routes, scrollspy writes replace.
   Consumes the shared contract APIs: PMShell, PMState, PMSpy, PMSpell,
   PMIcons, PMProvider, PM_DATA. Plain JS, no build step, no libraries.
   Slint notes inline. No emoji anywhere. */
(function () {
  'use strict';

  var store = null;
  var stage = null;
  var layersEl = null;
  var spineEl = null;
  var layers = [];       // [{id, kind, spineLabel, el, bodyEl, render, ...}]
  var SHEET_ANIM_MS = 320;
  var routing = false;   // true while the router reconciles the stack

  /* ================================================= tiny DOM helpers */

  function elm(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function icoEl(name, cls) {
    var i = document.createElement('i');
    i.setAttribute('data-ico', name);
    if (cls) i.className = cls;
    try { window.PMIcons.hydrate(i); } catch (e) { /* decorative */ }
    return i;
  }

  function btn(label, icon, cls, onClick) {
    var b = elm('button', 'fs-btn' + (cls ? ' ' + cls : ''));
    b.type = 'button';
    if (icon) b.appendChild(icoEl(icon));
    b.appendChild(elm('span', null, label));
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }

  function statusWordEl(tone, word) {
    var icons = { attention: 'warning', setup: 'clipboard', recommended: 'sparkle', ok: 'checkCircle', muted: 'minus', progress: 'hourglass' };
    var s = elm('span', 'pm-status-word');
    s.setAttribute('data-tone', tone);
    s.appendChild(icoEl(icons[tone] || 'info'));
    s.appendChild(elm('span', null, word));
    return s;
  }

  function chipEl(kind, label) {
    var c = elm('span', 'pm-chip-value', label);
    c.setAttribute('data-kind', kind);
    return c;
  }

  function fmtWhen(iso) {
    if (!iso) return 'Not yet';
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      var now = new Date();
      var sameDay = d.toDateString() === now.toDateString();
      var time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      if (sameDay) return time + ' today';
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + time;
    } catch (e) { return String(iso); }
  }

  function motionReduced() {
    var html = document.documentElement;
    if (html.getAttribute('data-motion') === 'reduced') return true;
    if (html.getAttribute('data-reduced-motion') === '1') return true;
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    } catch (e) { /* ignore */ }
    return false;
  }

  function data() { return store ? store.data : {}; }

  function domainById(id) {
    var t = data().taxonomy || [];
    for (var i = 0; i < t.length; i++) if (t[i].id === id) return t[i];
    return null;
  }

  function settingById(id) { return (data().settings || {})[id] || null; }

  function providerById(id) {
    var list = data().providers || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function byId(list, id) {
    list = list || [];
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return list[i];
    return null;
  }

  function terminalById(id) { return byId(data().terminalProfiles, id); }
  function mcpById(id) { return byId(data().mcp, id); }
  function lspById(id) { return byId(data().lsp, id); }
  function formatterById(id) { return byId((data().formatters || {}).entries, id); }

  function hostLabel(hostId) {
    var topo = data().serverTopology || {};
    var h = byId(topo.hosts, hostId);
    return h ? h.name : (hostId ? String(hostId).replace(/^host\./, '') : 'This computer');
  }

  function envLabel(hostId, envId) {
    var topo = data().serverTopology || {};
    var h = byId(topo.hosts, hostId);
    var e = h ? byId(h.environments, envId) : null;
    return e ? e.label : null;
  }

  function settingLocation(settingId) {
    var t = data().taxonomy || [];
    for (var i = 0; i < t.length; i++) {
      var subs = t[i].subs || [];
      for (var j = 0; j < subs.length; j++) {
        if ((subs[j].settingIds || []).indexOf(settingId) >= 0) {
          return { domain: t[i], sub: subs[j], subIndex: j };
        }
      }
    }
    return null;
  }

  function subNum(domain, sub) {
    var idx = (domain.subs || []).indexOf(sub);
    return domain.num + '.' + (idx + 1);
  }

  /* ============================================= humanized vocabulary */

  /* Provider state words come from PMProvider — the single source of the
     shared vocabulary — with a small humanizer for demo-only states so a
     raw enum can never print. */
  var EXTRA_STATUS_HUMAN = { 'not-configured': 'Not set up yet' };
  function provStatus(p) {
    var r = window.PMProvider.resolveProviderStatus(p);
    var word = r.label;
    if (EXTRA_STATUS_HUMAN[r.state]) word = EXTRA_STATUS_HUMAN[r.state];
    else if (/^[a-z0-9-]+$/.test(word) && word.indexOf('-') >= 0) word = 'Unknown';
    return { word: word, tone: r.tone === 'progress' ? 'progress' : r.tone, note: r.note };
  }

  var AUTH_HUMAN = {
    'cli-profile': 'Sign-in owned by the CLI profile',
    'pm-direct-oauth': 'Puppet Master direct sign-in',
    'api-key': 'API key in the system keychain',
    'server': 'Server connection',
    'none': 'No sign-in'
  };

  var ISOLATION_HUMAN = {
    'native-profile': 'Native named profile inside the tool',
    'cli-home': 'Isolated CLI home directory',
    'auth-isolated': 'Auth-isolated profile with allow-listed preferences',
    'pm-managed': 'Held directly by Puppet Master',
    'credential-pool': 'Shared credential pool',
    'single-login': 'Single active login'
  };

  var HEALTH_HUMAN = {
    'ok': 'Healthy', 'ready': 'Ready',
    'signed-out': 'Signed out',
    'auth-no-invoke': 'Signed in, cannot run models',
    'refreshing': 'Refreshing',
    'not-installed': 'Not installed',
    'usage-exhausted': 'Included usage exhausted',
    'degraded': 'Degraded', 'error': 'Error', 'unknown': 'Unknown'
  };

  /* Internal states never print raw: anything unmapped reads as Unknown. */
  function healthWord(h) { return HEALTH_HUMAN[h] || 'Unknown'; }

  var PRESSURE_HUMAN = {
    'low': 'Low pressure', 'medium': 'Moderate pressure', 'high': 'High pressure',
    'exhausted': 'Exhausted', 'none': 'No included cap', 'unknown': 'Unknown'
  };

  var QUALIFIER_HUMAN = {
    'rate-limited': 'Free, rate limited',
    'promotional': 'Free, promotional window',
    'account-required': 'Free, account required',
    'keyless': 'Free, no key needed',
    'data-sharing': 'Free, prompts may train the model',
    'subscription-included': 'Included with a subscription',
    'temporarily-unavailable': 'Temporarily unavailable'
  };

  var WHATNEXT_HUMAN = {
    'stop-wait': 'Stop and wait for the reset',
    'extra-balance': 'Spend the extra balance',
    'paid-after-plan': 'Continue with paid usage after the plan',
    'saved-reset': 'Save the run and resume after the reset',
    'switch-account': 'Switch to another enabled account',
    'free-models': 'Fall back to free or community models',
    'api-billing': 'Use the API billing route',
    'ask': 'Ask me each time'
  };

  var EVIDENCE_HUMAN = {
    'supported': 'Supported',
    'unsupported': 'Not supported',
    'likely': 'Likely supported',
    'unverified': 'Unverified',
    'temporarily-unavailable': 'Temporarily unavailable',
    'via-transformation': 'Via a Puppet Master transformation',
    'via-other-route': 'Via another configured route'
  };

  var GROUP_TITLES = {
    'tool': 'Installed tools & signed-in apps',
    'account': 'Connected accounts',
    'api': 'API connections',
    'server': 'Server connections',
    'free': 'Free & community'
  };

  var SCOPE_HUMAN = {
    'turn': 'This turn only',
    'thread': 'This conversation',
    'run': 'This run',
    'goal': 'This Goal run',
    'persona': 'This Persona',
    'provider': 'This provider',
    'account': 'This account',
    'project': 'Project default',
    'global': 'Global default',
    'child-only': 'Child agents only'
  };

  /* ==================================== cross-concept coverage map */

  /* Families this concept does NOT own natively. Search returns them as
     manager-receipts; opening one renders an honest receipt sheet with a
     real cross-page link (never a duplicated surface, never a dead end). */
  var COVERED_IN = {
    'manager.memory': { concept: 'c1 Atlas', page: 'c1-atlas.html', label: 'Memory' },
    'manager.personas': { concept: 'c1 Atlas', page: 'c1-atlas.html', label: 'Personas' },
    'manager.crew': { concept: 'c1 Atlas', page: 'c1-atlas.html', label: 'Crew templates' },
    'manager.contextSources': { concept: 'c1 Atlas', page: 'c1-atlas.html', label: 'Context sources' },
    'manager.permissions': { concept: 'c1 Atlas', page: 'c1-atlas.html', label: 'Permissions & FileSafe' },
    'manager.bsd': { concept: 'c1 Atlas', page: 'c1-atlas.html', label: 'Back Seat Driver' },
    'manager.goal': { concept: 'c1 Atlas', page: 'c1-atlas.html', label: 'Goal & automation defaults' },
    'manager.notifications': { concept: 'c2 Mission Control', page: 'c2-mission-control.html', label: 'Notifications & sounds' },
    'manager.sounds': { concept: 'c2 Mission Control', page: 'c2-mission-control.html', label: 'Sound library' },
    'manager.appearance': { concept: 'c2 Mission Control', page: 'c2-mission-control.html', label: 'Appearance & themes' },
    'manager.desktop': { concept: 'c2 Mission Control', page: 'c2-mission-control.html', label: 'Desktop, tray & windows' },
    'manager.teacher': { concept: 'c2 Mission Control', page: 'c2-mission-control.html', label: 'Teacher & guided help' },
    'manager.dictionary': { concept: 'c2 Mission Control', page: 'c2-mission-control.html', label: 'Dictionaries' },
    'manager.media': { concept: 'c2 Mission Control', page: 'c2-mission-control.html', label: 'Media routes' },
    'manager.storage': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'Storage & retention' },
    'manager.backup': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'Backup & restore' },
    'manager.lifecycle': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'Settings import, export & reset' },
    'manager.history': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'History & sessions' },
    'manager.artifacts': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'Runtime artifacts' },
    'manager.sourceControl': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'Source control & worktrees' },
    'manager.actions': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'GitHub Actions' },
    'manager.containers': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'Containers & registries' },
    'manager.web': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'Web, search & fetch' },
    'manager.searchIndex': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'Project search index' },
    'manager.cleanup': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'Workspace cleanup' },
    'manager.servers': { concept: 'c4 Ledger', page: 'c4-ledger.html', label: 'Servers & execution hosts' }
  };

  var NATIVE_MANAGERS = [
    'manager.providers', 'manager.roles', 'manager.freeRoutes',
    'manager.mcp', 'manager.lsp', 'manager.skills', 'manager.plugins',
    'manager.tools', 'manager.commands', 'manager.terminalProfiles',
    'manager.fileManager', 'manager.formatters', 'manager.testing'
  ];

  /* ==================================== routes + small shared pieces */

  function mgrHash(shortId, focus) {
    return window.PMState.buildHash({ kind: 'manager', managerId: 'manager.' + shortId },
      focus ? { focus: focus } : null);
  }

  function destHash(domainId, subId, focus) {
    return window.PMState.buildHash({ kind: 'dest', domainId: domainId, subId: subId || null },
      focus ? { focus: focus } : null);
  }

  /* Every in-app stack mutation writes the resulting top route (pushState),
     so browser Back closes the top sheet: the previous history entry is the
     sheet underneath. The router sets `routing` while it reconciles, so
     route-driven pushes never write history themselves. */
  function writeTopRoute() {
    if (routing) return;
    var top = currentTop();
    if (!top) return;
    var hash = top.route || '#/home';
    try { window.PMState.writeRoute(hash); } catch (e) { /* no router yet */ }
    if (store) store.set('view', hash);
  }

  function navRow(icon, label, note, onClick) {
    var row = elm('button', 'fs-navrow');
    row.type = 'button';
    row.appendChild(icoEl(icon));
    row.appendChild(elm('span', null, label));
    if (note) row.appendChild(elm('span', 'fs-navrow-note', note));
    row.addEventListener('click', onClick);
    return row;
  }

  /* Manager list row: name + tag, note, right-aligned status nodes, chevron. */
  function mrowBtn(opts) {
    var row = elm('button', 'fs-mrow');
    row.type = 'button';
    if (opts.id) row.id = opts.id;
    var name = elm('span', 'fs-mrow-name');
    name.appendChild(icoEl(opts.ico || 'doc'));
    name.appendChild(elm('span', null, opts.title));
    if (opts.tag) name.appendChild(elm('span', 'fs-mrow-tag', opts.tag));
    row.appendChild(name);
    row.appendChild(elm('span', 'fs-mrow-note', opts.note || ''));
    var st = elm('span', 'fs-mrow-status');
    (opts.status || []).forEach(function (node) { if (node) st.appendChild(node); });
    row.appendChild(st);
    var openI = elm('span', 'fs-mrow-open');
    openI.appendChild(icoEl('chevR'));
    row.appendChild(openI);
    if (opts.onOpen) row.addEventListener('click', opts.onOpen);
    return row;
  }

  function emptyState(text, actionLabel, onAction) {
    var wrap = elm('div', 'fs-empty');
    wrap.appendChild(elm('p', 'fs-quiet', text));
    if (actionLabel) wrap.appendChild(btn(actionLabel, 'plus', null, onAction));
    return wrap;
  }

  /* Labeled text input appended to a sheet body (form sheets share this). */
  function formField(body, labelText, value, placeholder, mono) {
    body.appendChild(elm('label', 'fs-hero-label', labelText));
    var input = elm('input', 'fs-text');
    input.type = 'text';
    input.style.width = '100%';
    if (mono) input.style.fontFamily = 'var(--mono-font)';
    input.value = value || '';
    input.placeholder = placeholder || '';
    input.setAttribute('aria-label', labelText);
    body.appendChild(input);
    return input;
  }

  /* Ad-hoc manager rows (label + description + one control). These carry
     manager-owned values that are not settings-registry rows. */
  function controlRow(label, desc, controlEl) {
    var row = elm('div', 'fs-row');
    var main = elm('div', 'fs-row-main');
    main.appendChild(elm('div', 'fs-row-label', label));
    if (desc) main.appendChild(elm('div', 'fs-row-desc', desc));
    row.appendChild(main);
    var control = elm('div', 'fs-row-control');
    control.appendChild(controlEl);
    row.appendChild(control);
    return row;
  }

  function selectRow(label, desc, current, options, onPick) {
    var sel = elm('select', 'fs-select');
    sel.setAttribute('aria-label', label);
    options.forEach(function (o) {
      var opt = elm('option', null, o.label);
      opt.value = o.value;
      if (String(current) === String(o.value)) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function () { onPick(sel.value); });
    return controlRow(label, desc, sel);
  }

  function toggleRow(label, desc, current, onFlip) {
    var sw = elm('button', 'fs-switch');
    sw.type = 'button';
    sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-checked', current ? 'true' : 'false');
    sw.setAttribute('aria-label', label);
    sw.addEventListener('click', function () {
      var next = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', next ? 'true' : 'false');
      onFlip(next);
    });
    return controlRow(label, desc, sw);
  }

  function numberRow(label, desc, current, min, max, onSet) {
    var num = elm('input', 'fs-number');
    num.type = 'number';
    num.min = String(min); num.max = String(max);
    num.value = String(current);
    num.setAttribute('aria-label', label);
    num.addEventListener('change', function () {
      var v = Number(num.value);
      if (isNaN(v) || v < min || v > max) { num.value = String(current); window.PMShell.toast('Enter a number between ' + min + ' and ' + max + '.'); return; }
      onSet(v);
    });
    return controlRow(label, desc, num);
  }

  /* Always-visible radio stack. options: [{v, label}]. */
  function radioGroup(ariaLabel, options, currentValue, onPick) {
    var group = elm('div', 'fs-radios');
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', ariaLabel);
    options.forEach(function (o) {
      var r = elm('button', 'fs-radio');
      r.type = 'button';
      r.setAttribute('role', 'radio');
      r.setAttribute('aria-checked', String(currentValue) === String(o.v) ? 'true' : 'false');
      r.appendChild(elm('span', 'fs-radio-dot'));
      r.appendChild(elm('span', null, o.label));
      r.addEventListener('click', function () {
        var all = group.querySelectorAll('.fs-radio');
        for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-checked', 'false');
        r.setAttribute('aria-checked', 'true');
        onPick(o.v);
      });
      group.appendChild(r);
    });
    return group;
  }

  function codeEl(text) {
    var pre = elm('pre', 'fs-code');
    pre.textContent = text;
    return pre;
  }

  function kbdEl(keys) {
    var wrap = elm('span', 'fs-kbd-combo');
    String(keys).split('+').forEach(function (k, i) {
      if (i > 0) wrap.appendChild(elm('span', 'fs-kbd-plus', '+'));
      wrap.appendChild(elm('kbd', 'fs-kbd', k));
    });
    return wrap;
  }

  function anchorBtn(label, href, icon) {
    var a = elm('a', 'fs-btn');
    a.href = href;
    a.appendChild(icoEl(icon || 'external'));
    a.appendChild(elm('span', null, label));
    return a;
  }

  /* Truthful staged-phase display: any element carrying data-op-ref shows
     the latest op phase for that ref. Ops fire on the shared trigger
     registry; state changes are never skipped under reduced motion. */
  var OP_PHASE_HUMAN = {
    'scanning': 'Scanning for candidates…',
    'updating': 'Updating…',
    'verifying': 'Verifying: path, launch health, auth identity, catalog, handshake, capabilities, dependent routes…',
    'ready': 'Verified — activating…',
    'done': 'Done.',
    'verification-failed': 'Verification failed: the adapter handshake was rejected. Installer exit code alone is never success.',
    'rolled-back': 'Rolled back — the previous generation was restored and re-verified.',
    'repairing': 'Repairing…',
    'stopping': 'Stopping the server…',
    'starting': 'Starting the server…',
    'running': 'Running the sample…',
    'failed': 'Failed.',
    'reconnecting': 'Reconnecting…'
  };

  function opLine(ref) {
    var line = elm('p', 'fs-opline', '');
    line.setAttribute('data-op-ref', String(ref));
    line.setAttribute('role', 'status');
    line.hidden = true;
    return line;
  }

  function handleOpEvent(payload) {
    if (!payload || payload.ref == null) return;
    var nodes = document.querySelectorAll('[data-op-ref]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.getAttribute('data-op-ref') !== String(payload.ref)) continue;
      n.hidden = false;
      n.textContent = OP_PHASE_HUMAN[payload.phase] || String(payload.phase);
      if (payload.phase === 'done') n.classList.add('is-done');
    }
  }

  /* =============================================== the layer stack */

  function currentTop() { return layers[layers.length - 1] || null; }

  function updateSpine() {
    spineEl.innerHTML = '';
    layers.forEach(function (layer, i) {
      var item = elm('button', 'fs-spine-item' + (i === layers.length - 1 ? ' is-top' : ''));
      item.type = 'button';
      item.textContent = layer.spineLabel;
      item.title = i === layers.length - 1 ? layer.spineLabel : 'Back to ' + layer.spineLabel;
      item.setAttribute('aria-current', i === layers.length - 1 ? 'true' : 'false');
      if (i < layers.length - 1) {
        item.addEventListener('click', function () { popTo(i); });
      } else {
        item.setAttribute('aria-disabled', 'true');
      }
      spineEl.appendChild(item);
    });
    var depth = elm('span', 'fs-spine-depth', 'Depth ' + layers.length);
    spineEl.appendChild(depth);
    var right = document.getElementById('pmStatusRight');
    if (right) right.textContent = layers.map(function (l) { return l.spineLabel; }).join(' > ');
  }

  function markUnder() {
    layers.forEach(function (layer, i) {
      var top = i === layers.length - 1;
      layer.el.classList.toggle('is-top', top);
      layer.el.classList.toggle('is-under', !top);
      if (top) {
        layer.el.inert = false;
        layer.el.removeAttribute('aria-hidden');
      } else {
        try { layer.el.inert = true; } catch (e) { /* older engines */ }
        layer.el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /* Builds sheet chrome: header (back, kicker+title, optional search),
     optional outline chip row, scrollable body. */
  function buildSheet(desc) {
    var sheet = elm('section', 'fs-sheet' + (desc.half ? ' is-half' : ''));
    sheet.setAttribute('data-kind', desc.kind || 'sheet');
    sheet.setAttribute('role', desc.half ? 'dialog' : 'region');
    sheet.setAttribute('aria-label', desc.title);

    if (desc.kind !== 'home') {
      var head = elm('header', 'fs-head');
      var back = elm('button', 'fs-back');
      back.type = 'button';
      back.title = 'Back';
      back.appendChild(icoEl('chevL'));
      var backSr = elm('span', 'pm-visually-hidden', 'Back');
      back.appendChild(backSr);
      back.addEventListener('click', function () { popTo(layers.length - 2); });
      head.appendChild(back);

      var titles = elm('div', 'fs-head-titles');
      titles.appendChild(elm('span', 'fs-kicker', desc.kicker || 'Settings'));
      var titleEl = elm('h2', 'fs-title', desc.title);
      titleEl.tabIndex = -1;
      titles.appendChild(titleEl);
      head.appendChild(titles);
      desc._titleEl = titleEl;

      if (desc.withSearch) {
        var wrap = elm('div', 'fs-head-search');
        wrap.appendChild(icoEl('search'));
        var input = elm('input');
        input.type = 'search';
        input.placeholder = 'Search all settings';
        input.setAttribute('aria-label', 'Search all settings');
        wrap.appendChild(input);
        head.appendChild(wrap);
        attachSearchPopover(sheet, wrap, input);
      }
      sheet.appendChild(head);
    }

    if (desc.withChip) {
      var chipRow = elm('div', 'fs-chiprow');
      var chip = elm('button', 'fs-chip');
      chip.type = 'button';
      chip.setAttribute('aria-haspopup', 'dialog');
      chip.setAttribute('aria-expanded', 'false');
      chip.appendChild(icoEl('layers'));
      var wrapT = elm('span', 'fs-chip-textwrap');
      var t1 = elm('span', 'fs-chip-text', '');
      var t2 = elm('span', 'fs-chip-text is-out', '');
      wrapT.appendChild(t1); wrapT.appendChild(t2);
      chip.appendChild(wrapT);
      chipRow.appendChild(chip);
      chipRow.appendChild(elm('span', 'fs-chip-hint', 'You are here — tap for the outline'));
      sheet.appendChild(chipRow);
      desc._chip = { button: chip, spans: [t1, t2], active: 0 };
    }

    var body = elm('div', 'fs-body');
    sheet.appendChild(body);
    desc.el = sheet;
    desc.bodyEl = body;
    return desc;
  }

  /* The chip drops the category prefix when the shell is narrow so the
     subcategory (the part that changes) never truncates away. */
  function chipLabel(dom, sub) {
    var shell = document.getElementById('pmShell');
    var narrow = shell && shell.classList.contains('is-narrow');
    var subPart = subNum(dom, sub) + ' ' + sub.title;
    return narrow ? subPart : dom.title + ' › ' + subPart;
  }

  /* Crossfading chip text: fixed geometry, opacity swap only. */
  function setChipText(layer, text) {
    var chip = layer._chip;
    if (!chip) return;
    var cur = chip.spans[chip.active];
    if (cur.textContent === text) return;
    var next = chip.spans[1 - chip.active];
    next.textContent = text;
    next.classList.remove('is-out');
    cur.classList.add('is-out');
    chip.active = 1 - chip.active;
  }

  function push(desc) {
    var invoker = document.activeElement;
    buildSheet(desc);
    desc.invoker = (invoker && invoker !== document.body) ? invoker : null;
    layers.push(desc);
    desc.el.classList.add('is-entering');
    layersEl.appendChild(desc.el);
    try { desc.render(desc.bodyEl, desc); } catch (e) { desc.bodyEl.appendChild(elm('p', 'fs-quiet', 'This surface could not render.')); }
    markUnder();
    updateSpine();
    // Double rAF: layout lands, then the push transition plays (reduced
    // motion collapses it to an instant swap via the global kill switch).
    // Timeout fallback: rAF never fires in a hidden tab, and a sheet must
    // settle even when motion is interrupted or the page is backgrounded.
    var settleEntering = function () { desc.el.classList.remove('is-entering'); };
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(settleEntering);
    });
    window.setTimeout(settleEntering, 400);
    var focusTarget = desc._titleEl || desc.el;
    window.setTimeout(function () {
      try { focusTarget.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      if (desc.onReveal) { try { desc.onReveal(desc); } catch (e2) { /* ignore */ } }
    }, motionReduced() ? 20 : 120);
    // Sheet navigation is real navigation: it lands in browser history.
    if (desc.route) writeTopRoute();
    return desc;
  }

  function popTo(index) {
    if (index < 0 || index >= layers.length - 1) return;
    var removed = layers.slice(index + 1);
    layers = layers.slice(0, index + 1);
    removed.forEach(function (layer) {
      if (layer.onPop) { try { layer.onPop(layer); } catch (e) { /* ignore */ } }
      layer.el.classList.add('is-exiting');
      layer.el.inert = true;
    });
    window.setTimeout(function () {
      removed.forEach(function (layer) {
        if (layer.el.parentNode) layer.el.parentNode.removeChild(layer.el);
      });
    }, motionReduced() ? 30 : SHEET_ANIM_MS);
    markUnder();
    updateSpine();
    writeTopRoute();
    var top = currentTop();
    if (top) {
      // Home refreshes on reveal so plate footnotes and Resume affordances
      // reflect what just happened one layer up.
      if (top.kind === 'home') rerenderLayer(top);
      if (top.onReveal) { try { top.onReveal(top); } catch (e) { /* ignore */ } }
      var bottomMost = removed[0];
      var refocus = bottomMost && bottomMost.invoker;
      window.setTimeout(function () {
        try {
          if (refocus && document.contains(refocus)) refocus.focus({ preventScroll: true });
          else if (top._titleEl) top._titleEl.focus({ preventScroll: true });
        } catch (e) { /* ignore */ }
      }, motionReduced() ? 20 : 80);
    }
  }

  /* Sideways swap: replace the top layer with another at the same depth
     (cross-category moves without growing the stack). */
  function swapTop(desc) {
    if (layers.length < 2) { push(desc); return; }
    popTo(layers.length - 2);
    window.setTimeout(function () { push(desc); }, motionReduced() ? 10 : 60);
  }

  function rerenderLayer(layer) {
    if (!layer || !layer.bodyEl) return;
    var scrollPos = layer.bodyEl.scrollTop;
    layer.bodyEl.innerHTML = '';
    try { layer.render(layer.bodyEl, layer); } catch (e) { layer.bodyEl.appendChild(elm('p', 'fs-quiet', 'This surface could not render.')); }
    layer.bodyEl.scrollTop = scrollPos;
    if (layer.spy) { try { layer.spy.refresh(); } catch (e) { /* ignore */ } }
  }

  function rerenderAll() {
    layers.forEach(rerenderLayer);
    updateSpine();
  }

  /* ================================================== global search */

  /* Search popover for workspace/manager sheet headers: results appear in
     a small overlay; activation deep-links through the stack. */
  function attachSearchPopover(sheet, wrap, input) {
    var pop = elm('div', 'fs-outline is-closed');
    pop.setAttribute('role', 'listbox');
    pop.setAttribute('aria-label', 'Search results');
    pop.style.left = 'auto';
    pop.style.right = '14px';
    pop.style.top = '54px';
    sheet.appendChild(pop);

    function close() { pop.classList.add('is-closed'); }

    function run() {
      var q = input.value.trim();
      if (!q) { close(); return; }
      var results = window.PMState.search(q, data()).slice(0, 12);
      pop.innerHTML = '';
      pop.appendChild(elm('h3', null, results.length ? 'Results' : 'No results'));
      results.forEach(function (r) {
        var item = elm('button', 'fs-outline-item');
        item.type = 'button';
        item.setAttribute('role', 'option');
        item.appendChild(elm('span', null, r.label));
        var loc = r.domainId ? domainById(r.domainId) : null;
        var meta = (r.kind === 'manager' ? 'Manager' : (r.kind === 'action' ? 'Action' : (loc ? loc.title : 'Setting')));
        if (r.exposure && r.exposure !== 'standard') meta += ' · ' + r.exposure.charAt(0).toUpperCase() + r.exposure.slice(1);
        var metaEl = elm('span', 'fs-outline-num', meta);
        metaEl.style.minWidth = 'auto';
        metaEl.style.marginLeft = 'auto';
        item.appendChild(metaEl);
        item.addEventListener('click', function () {
          close();
          input.value = '';
          openSearchResult(r);
        });
        pop.appendChild(item);
      });
      pop.classList.remove('is-closed');
    }

    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!pop.classList.contains('is-closed')) { e.stopPropagation(); close(); input.value = ''; }
      } else if (e.key === 'ArrowDown') {
        var first = pop.querySelector('.fs-outline-item');
        if (first) { e.preventDefault(); first.focus(); }
      }
    });
    pop.addEventListener('keydown', function (e) {
      var items = Array.prototype.slice.call(pop.querySelectorAll('.fs-outline-item'));
      var idx = items.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.stopPropagation(); close(); input.focus(); }
      else if (e.key === 'ArrowDown' && idx < items.length - 1) { e.preventDefault(); items[idx + 1].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (idx > 0) items[idx - 1].focus(); else input.focus(); }
    });
    document.addEventListener('mousedown', function (e) {
      if (!pop.classList.contains('is-closed') && !pop.contains(e.target) && !wrap.contains(e.target)) close();
    }, true);
  }

  function openSearchResult(r) {
    if (r.kind === 'manager') { openManager(r.id); return; }
    if (r.kind === 'manager-receipt') { pushCoveredSheet(r.id); return; }
    if (r.kind === 'action') {
      var notices = data().notices || [];
      for (var i = 0; i < notices.length; i++) {
        if (notices[i].id === r.id) { openNoticeTarget(notices[i]); return; }
      }
      pushNoticesSheet();
      return;
    }
    // setting
    openSetting(r.id);
  }

  /* Deep link to a setting: load owner category sheet, then — because in
     Focus Stack disclosure is navigation — advanced/expert/diagnostic
     targets push their disclosure sheet before the focus flash. */
  function openSetting(settingId) {
    var loc = settingLocation(settingId);
    if (!loc) { window.PMState.receipt('Open setting', 'The setting could not be located.'); return; }
    var s = settingById(settingId);
    var exposure = (s && s.exposure) || 'standard';
    ensureDomainLayer(loc.domain.id, function (domainLayer) {
      if (exposure === 'advanced' || exposure === 'expert') {
        pushAdvancedSheet(loc.domain, loc.sub, settingId);
      } else if (exposure === 'diagnostic') {
        pushDiagnosticsSheet(loc.domain, loc.sub, settingId);
      } else {
        var rowEl = document.getElementById('fs-row-' + settingId);
        window.PMSpy.reveal({
          controller: domainLayer.spy,
          ensure: [],
          targetId: 'fs-sub-' + loc.sub.id,
          focusEl: rowEl
        });
      }
    });
  }

  /* Ensure the stack is exactly Home > Domain(domainId); then continue. */
  function ensureDomainLayer(domainId, then) {
    var top = currentTop();
    if (top && top.kind === 'domain' && top.domainId === domainId) { then(top); return; }
    var existing = -1;
    layers.forEach(function (l, i) { if (l.kind === 'domain' && l.domainId === domainId) existing = i; });
    if (existing >= 0) {
      popTo(existing);
      window.setTimeout(function () { then(layers[existing]); }, motionReduced() ? 30 : 120);
      return;
    }
    if (layers.length > 1) popTo(0);
    window.setTimeout(function () {
      var layer = pushDomainSheet(domainId);
      window.setTimeout(function () { then(layer); }, motionReduced() ? 40 : 200);
    }, layers.length > 1 ? (motionReduced() ? 30 : 120) : 0);
  }

  /* Native manager routing: every id maps to a sheet stack. Non-native ids
     answer with the honest cross-concept receipt sheet. */
  function openManager(managerId) {
    var id = String(managerId).replace(/^manager\./, '');
    if (id === 'providers') { pushProvidersSheet(); return; }
    if (id === 'roles') { pushProvidersSheet('roles'); return; }
    if (id === 'freeRoutes') { pushProvidersSheet('free'); return; }
    if (id === 'terminalProfiles') { pushTerminalSheet(); return; }
    if (id === 'fileManager') { pushFileManagerSheet(); return; }
    if (id === 'lsp') { pushLspSheet(); return; }
    if (id === 'formatters') { pushFormattersSheet(); return; }
    if (id === 'commands') { pushCommandsSheet(); return; }
    if (id === 'mcp') { pushMcpSheet(); return; }
    if (id === 'skills') { pushSkillsSheet(); return; }
    if (id === 'plugins') { pushPluginsSheet(); return; }
    if (id === 'tools') { pushToolsSheet(); return; }
    if (id === 'testing') { pushTestingSheet(); return; }
    pushCoveredSheet('manager.' + id);
  }

  function openNoticeTarget(notice) {
    var t = notice.target || {};
    var act = (notice.primary && notice.primary.act) || '';
    if (act === 'reconnect' && (t.sub === 'mcp' || t.manager === 'mcp')) {
      // The reconnect-required fixture flags a connected tool server, not a
      // provider: open the MCP stack on the flagged server, then reconnect.
      var flagged = (data().mcp || []).filter(function (s) { return s && s.reconnectRequired; })[0] ||
        (data().mcp || []).filter(function (s) { return s && (s.health === 'disconnected' || s.state === 'disconnected'); })[0];
      if (flagged) {
        popTo(0);
        pushMcpSheet();
        pushMcpDetail(flagged.id);
        window.setTimeout(function () { mcpReconnect(flagged.id); }, motionReduced() ? 40 : 300);
        return;
      }
    }
    if (act === 'invoke-test' || act === 'reconnect') {
      window.PMState.trigger(act, t.providerId || null);
      window.PMShell.status(act === 'invoke-test' ? 'Running an invocation test…' : 'Reconnecting…');
      return;
    }
    if (act === 'open-usage') {
      window.PMState.receipt('Open the Usage page', 'Usage lives on its own page outside Settings.');
      return;
    }
    if (t.providerId) { pushProviderDetail(t.providerId); return; }
    if (t.personaId) { pushCoveredSheet('manager.personas'); return; }
    if (t.settingId) { openSetting(t.settingId); return; }
    if (t.manager) { openManager(t.manager); return; }
    if (t.domain) {
      ensureDomainLayer(t.domain, function () { /* landed */ });
      return;
    }
    pushNoticesSheet();
  }

  /* The honest cross-concept receipt: what it is, where it lives, and a
     real link that carries the deep link across pages. */
  function pushCoveredSheet(managerId) {
    var cover = COVERED_IN[managerId];
    var def = byId(window.PMState.managerDefs, managerId);
    var label = (cover && cover.label) || (def && def.label) || 'This manager';
    push({
      id: 'covered-' + managerId,
      kind: 'covered',
      spineLabel: label,
      kicker: 'Covered elsewhere',
      title: label,
      half: true,
      render: function (body) {
        if (!cover) {
          body.appendChild(elm('p', 'fs-quiet', 'This surface is not part of the bakeoff scope. Nothing is hidden behind this sheet.'));
          return;
        }
        body.appendChild(elm('p', 'fs-para', label + ' is demonstrated in full by the ' + cover.concept +
          ' concept. Focus Stack points there instead of duplicating the surface — the data is shared, the idiom is not.'));
        var facts = elm('dl', 'fs-facts');
        factInto(facts, 'Demonstrated in', cover.concept);
        factInto(facts, 'Page', cover.page);
        factInto(facts, 'Deep link', cover.page + '#/manager/' + managerId);
        body.appendChild(facts);
        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(anchorBtn('Open in ' + cover.concept, cover.page + '#/manager/' + managerId));
        body.appendChild(actions);
        body.appendChild(elm('p', 'fs-quiet', 'The link carries the manager route across pages, so the sibling concept opens directly on this surface.'));
      }
    });
  }

  /* ======================================================== HOME */

  function noticeCounts() {
    var n = { attention: 0, setup: 0, recommended: 0, total: 0 };
    (data().notices || []).forEach(function (x) {
      if (x && n[x.kind] !== undefined) { n[x.kind]++; n.total++; }
    });
    return n;
  }

  function plural(n, one, many) { return n === 1 ? one : many; }

  function renderHome(body, layer) {
    var home = elm('div', 'fs-home');
    body.appendChild(home);

    // Hero search: the room's only furniture.
    var hero = elm('div', 'fs-hero');
    var heroLabel = elm('label', 'fs-hero-label', 'Find any setting, manager, or action');
    heroLabel.setAttribute('for', 'fsHeroSearch');
    hero.appendChild(heroLabel);
    var hwrap = elm('div', 'fs-hero-search');
    hwrap.appendChild(icoEl('search'));
    var hinput = elm('input');
    hinput.type = 'search';
    hinput.id = 'fsHeroSearch';
    hinput.placeholder = 'Search settings';
    hinput.setAttribute('aria-label', 'Search settings');
    hwrap.appendChild(hinput);
    hero.appendChild(hwrap);
    home.appendChild(hero);

    // One collapsed notice queue row (or a genuinely calm line).
    var counts = noticeCounts();
    var queue;
    if (counts.total === 0) {
      queue = elm('div', 'fs-queue is-calm');
      queue.appendChild(statusWordEl('ok', 'Settled'));
      var calmText = elm('span', 'fs-queue-text');
      calmText.textContent = 'Nothing needs attention. Nothing is waiting on you.';
      queue.appendChild(calmText);
    } else {
      queue = elm('button', 'fs-queue');
      queue.type = 'button';
      var lead = counts.attention > 0 ? 'attention' : (counts.setup > 0 ? 'setup' : 'recommended');
      queue.appendChild(statusWordEl(lead, lead === 'attention' ? 'Needs attention' : (lead === 'setup' ? 'Setup' : 'Recommended')));
      var parts = [];
      if (counts.attention) parts.push(counts.attention + ' ' + plural(counts.attention, 'thing needs', 'things need') + ' attention');
      if (counts.setup) parts.push(counts.setup + ' ' + plural(counts.setup, 'setup to finish', 'setups to finish'));
      if (counts.recommended) parts.push(counts.recommended + ' ' + plural(counts.recommended, 'suggestion', 'suggestions'));
      var text = elm('span', 'fs-queue-text');
      var b = elm('b', null, parts.shift());
      text.appendChild(b);
      if (parts.length) text.appendChild(document.createTextNode(' · ' + parts.join(' · ')));
      queue.appendChild(text);
      queue.appendChild(icoEl('chevR', 'fs-queue-chev'));
      queue.addEventListener('click', function () { pushNoticesSheet(); });
    }
    home.appendChild(queue);

    // Destination plates.
    var platesWrap = elm('div');
    var plates = elm('div', 'fs-plates');
    plates.setAttribute('role', 'list');
    platesWrap.appendChild(elm('div', 'fs-plates-label', 'Places'));
    (data().taxonomy || []).forEach(function (dom) {
      plates.appendChild(buildPlate(dom));
    });
    platesWrap.appendChild(plates);

    var mgrPlates = elm('div', 'fs-plates');
    mgrPlates.setAttribute('role', 'list');
    var mlabel = elm('div', 'fs-plates-label', 'Managers');
    mlabel.style.marginTop = '22px';
    platesWrap.appendChild(mlabel);
    HOME_MANAGERS.forEach(function (m) {
      var plate = elm('button', 'fs-plate is-manager');
      plate.type = 'button';
      plate.setAttribute('role', 'listitem');
      var numEl = elm('span', 'fs-plate-num');
      numEl.appendChild(icoEl(m.ico));
      plate.appendChild(numEl);
      plate.appendChild(elm('span', 'fs-plate-title', m.title));
      plate.appendChild(elm('span', 'fs-plate-sub', m.sub));
      var foot = elm('span', 'fs-plate-foot');
      foot.appendChild(elm('span', null, managerFootnote(m.id)));
      plate.appendChild(foot);
      plate.addEventListener('click', function () { openManager(m.id); });
      mgrPlates.appendChild(plate);
    });
    platesWrap.appendChild(mgrPlates);

    // Personas moved to c1 Atlas: an honest receipt entry, not a surface.
    var moved = elm('button', 'fs-home-recents');
    moved.type = 'button';
    moved.appendChild(icoEl('masks'));
    moved.appendChild(elm('span', null, 'Personas'));
    moved.appendChild(elm('span', 'fs-recents-latest', '· demonstrated in c1 Atlas — opens a receipt with the cross-page link'));
    moved.addEventListener('click', function () { pushCoveredSheet('manager.personas'); });
    platesWrap.appendChild(moved);

    // Continue / recents presence: one quiet line into a half sheet.
    var recents = data().recents || [];
    if (recents.length) {
      var rbtn = elm('button', 'fs-home-recents');
      rbtn.type = 'button';
      rbtn.appendChild(icoEl('history'));
      rbtn.appendChild(elm('span', null, 'Recent changes'));
      rbtn.appendChild(elm('span', 'fs-recents-latest', '· ' + recents[0].label));
      rbtn.addEventListener('click', function () { pushRecentsSheet(); });
      platesWrap.appendChild(rbtn);
    }

    home.appendChild(platesWrap);

    // Search results replace the plates in the same stack.
    var results = elm('div', 'fs-results');
    results.hidden = true;
    results.setAttribute('role', 'list');
    results.setAttribute('aria-label', 'Search results');
    home.appendChild(results);

    function runSearch() {
      var q = hinput.value.trim();
      // The hash mirrors the search (replace, so typing never spams history).
      if (!routing && currentTop() === layer) {
        try {
          window.PMState.writeRoute(q
            ? window.PMState.buildHash({ kind: 'search', query: q })
            : '#/home', { replace: true });
        } catch (e) { /* router optional */ }
      }
      if (!q) {
        results.hidden = true;
        platesWrap.hidden = false;
        return;
      }
      var found = window.PMState.search(q, data());
      results.innerHTML = '';
      if (!found.length) {
        results.appendChild(elm('div', 'fs-result-none', 'Nothing matches "' + q + '". Try a different word, or open a place below.'));
      }
      found.slice(0, 24).forEach(function (r) {
        var item = elm('button', 'fs-result');
        item.type = 'button';
        item.setAttribute('role', 'listitem');
        item.appendChild(elm('span', 'fs-result-label', r.label));
        var dom = r.domainId ? domainById(r.domainId) : null;
        var pathBits = [];
        if (r.kind === 'manager') pathBits.push('Manager');
        else if (r.kind === 'manager-receipt') pathBits.push('Manager · demonstrated in ' + (r.coveredIn ? r.coveredIn.concept : 'a sibling concept'));
        else if (r.kind === 'action') pathBits.push('Action');
        if (dom) pathBits.push(dom.num + ' ' + dom.title);
        item.appendChild(elm('span', 'fs-result-path', pathBits.join(' · ') || 'Setting'));
        var meta = elm('span', 'fs-result-meta');
        if (r.exposure && r.exposure !== 'standard') {
          meta.appendChild(chipEl(r.exposure === 'unavailable' ? 'unavailable' : 'custom',
            r.exposure.charAt(0).toUpperCase() + r.exposure.slice(1)));
        }
        meta.appendChild(icoEl('arrowR'));
        item.appendChild(meta);
        item.addEventListener('click', function () { openSearchResult(r); });
        results.appendChild(item);
      });
      platesWrap.hidden = true;
      results.hidden = false;
    }

    hinput.addEventListener('input', runSearch);
    hinput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hinput.value) { e.stopPropagation(); hinput.value = ''; runSearch(); }
    });
    if (layer.searchQuery) { hinput.value = layer.searchQuery; runSearch(); }
    hinput.addEventListener('change', function () { layer.searchQuery = hinput.value; });
    hinput.addEventListener('input', function () { layer.searchQuery = hinput.value; });
  }

  function buildPlate(dom) {
    var plate = elm('button', 'fs-plate');
    plate.type = 'button';
    plate.setAttribute('role', 'listitem');
    plate.appendChild(elm('span', 'fs-plate-num', dom.num));
    plate.appendChild(elm('span', 'fs-plate-title', dom.title));
    plate.appendChild(elm('span', 'fs-plate-sub', dom.blurb));

    var foot = elm('span', 'fs-plate-foot');
    var domNotices = (data().notices || []).filter(function (n) {
      return n && n.target && n.target.domain === dom.id;
    });
    var attention = domNotices.filter(function (n) { return n.kind === 'attention'; }).length;
    var setups = domNotices.filter(function (n) { return n.kind === 'setup'; }).length;
    if (attention > 0) {
      foot.appendChild(statusWordEl('attention', attention + ' ' + plural(attention, 'notice', 'notices')));
    } else if (setups > 0) {
      foot.appendChild(statusWordEl('setup', setups + ' ' + plural(setups, 'setup', 'setups')));
    } else {
      foot.appendChild(elm('span', null, 'Settled'));
    }
    foot.appendChild(elm('span', null, (dom.subs || []).length + ' sections'));
    plate.appendChild(foot);

    var resume = store.get('resume.' + dom.id);
    if (resume && resume.subId && domainById(dom.id)) {
      var rbtn = elm('button', 'fs-plate-resume');
      rbtn.type = 'button';
      rbtn.appendChild(icoEl('play'));
      rbtn.appendChild(elm('span', null, 'Resume at ' + resume.num + ' ' + resume.title));
      rbtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var layer = pushDomainSheet(dom.id);
        window.setTimeout(function () {
          if (layer.spy) layer.spy.jumpTo('fs-sub-' + resume.subId, {});
        }, motionReduced() ? 60 : 260);
      });
      plate.appendChild(rbtn);
    }

    plate.addEventListener('click', function () { pushDomainSheet(dom.id); });
    return plate;
  }

  /* The eleven native manager plates: this concept's packet assignment. */
  var HOME_MANAGERS = [
    { id: 'providers', title: 'Providers & Models', sub: 'Accounts, installations, catalogs, and every model you can route to.', ico: 'cloud' },
    { id: 'fileManager', title: 'Files & Editor', sub: 'Tree behavior, tabs and split groups, changed-on-disk policy, and recovery.', ico: 'folder' },
    { id: 'terminalProfiles', title: 'Terminal Profiles', sub: 'Shells, fonts, colors, and retention for embedded terminals.', ico: 'terminal' },
    { id: 'lsp', title: 'Language Servers', sub: 'The registry, per-server attachment, restarts, logs, and custom servers.', ico: 'server' },
    { id: 'formatters', title: 'Formatters', sub: 'Which formatter runs for each file type, and when.', ico: 'wrench' },
    { id: 'commands', title: 'Commands & Shortcuts', sub: 'Custom commands with dry-run preview, and every keyboard shortcut.', ico: 'keyboard' },
    { id: 'mcp', title: 'Connected Servers', sub: 'Tool servers over MCP: transport, protocol, approval, resources, logs.', ico: 'plug' },
    { id: 'skills', title: 'Skills', sub: 'Packaged instructions: provenance, trust, and project enablement.', ico: 'sparkle' },
    { id: 'plugins', title: 'Plugins', sub: 'Installed extensions and their lifecycle, update to failed.', ico: 'puzzle' },
    { id: 'tools', title: 'Tools', sub: 'The availability funnel, installed through invoked, with honest reasons.', ico: 'toolbox' },
    { id: 'testing', title: 'Testing & Debug', sub: 'Eleven capabilities, global and per-project, each with a reason when off.', ico: 'beaker' }
  ];

  function managerFootnote(id) {
    var d = data();
    function n(list) { return (list || []).length; }
    if (id === 'providers') {
      var ready = (d.providers || []).filter(function (p) { return p.status === 'ready'; }).length;
      return ready + ' of ' + n(d.providers) + ' connections ready';
    }
    if (id === 'terminalProfiles') return n(d.terminalProfiles) + ' ' + plural(n(d.terminalProfiles), 'profile', 'profiles');
    if (id === 'fileManager') {
      var off = n((d.fileManager || {}).unavailable);
      return off ? off + ' ' + plural(off, 'path', 'paths') + ' offline' : 'Settled';
    }
    if (id === 'lsp') {
      var run = (d.lsp || []).filter(function (l) { return l.health === 'running'; }).length;
      var miss = (d.lsp || []).filter(function (l) { return l.state === 'missing'; }).length;
      return run + ' running' + (miss ? ' · ' + miss + ' missing' : '') + ' of ' + n(d.lsp);
    }
    if (id === 'formatters') {
      var ent = (d.formatters || {}).entries || [];
      var det = ent.filter(function (f) { return f.state === 'detected'; }).length;
      var nf = ent.filter(function (f) { return f.state === 'not-found'; }).length;
      return det + ' ready' + (nf ? ' · ' + nf + ' not found' : '') + ' of ' + ent.length;
    }
    if (id === 'commands') {
      var ci = d.commandsInfo || {};
      var conf = n(ci.conflicts);
      return n(ci.customCommands) + ' commands · ' + n(ci.shortcuts) + ' shortcuts' + (conf ? ' · ' + conf + ' conflict' : '');
    }
    if (id === 'mcp') {
      var conn = (d.mcp || []).filter(function (s) { return s.health === 'connected' && !s.reconnectRequired; }).length;
      return n(d.mcp) === 0 ? 'None connected yet' : conn + ' of ' + n(d.mcp) + ' connected';
    }
    if (id === 'skills') {
      var en = (d.skills || []).filter(function (s) { return s.enabled; }).length;
      return n(d.skills) === 0 ? 'None installed yet' : en + ' of ' + n(d.skills) + ' enabled';
    }
    if (id === 'plugins') {
      var bad = (d.plugins || []).filter(function (p) { return p.lifecycle === 'failed'; }).length;
      var upd = (d.plugins || []).filter(function (p) { return p.lifecycle === 'update-available'; }).length;
      if (!n(d.plugins)) return 'None installed yet';
      return n(d.plugins) + ' installed' + (upd ? ' · 1 update' : '') + (bad ? ' · 1 failed' : '');
    }
    if (id === 'tools') {
      var avail = (d.tools || []).filter(function (t) { return t.available; }).length;
      return n(d.tools) === 0 ? 'None yet' : avail + ' of ' + n(d.tools) + ' available now';
    }
    if (id === 'testing') {
      var caps = (d.testingDebug || {}).capabilities || [];
      var offc = caps.filter(function (c) { return c.global === 'off'; }).length;
      return caps.length + ' capabilities' + (offc ? ' · ' + offc + ' off with reasons' : '');
    }
    return '';
  }

  /* ================================================ domain workspace */

  function pushDomainSheet(domainId) {
    var desc = makeDomainDesc(domainId);
    if (!desc) return null;
    push(desc);
    return desc;
  }

  function renderDomain(body, layer, domainId) {
    var dom = domainById(domainId);
    if (!dom) { body.appendChild(elm('p', 'fs-quiet', 'This category is not available.')); return; }

    var managed = data().managedWorkspace;
    if (managed && managed.active) {
      var note = elm('div', 'fs-managed-note');
      note.appendChild(icoEl('lock'));
      note.appendChild(elm('span', null, managed.note));
      body.appendChild(note);
    }

    // Managers that live in this category: reachable as places. Families a
    // sibling concept owns appear too, honestly labeled as receipts.
    var mgrs = domainManagers(domainId);
    if (mgrs.length) {
      mgrs.forEach(function (m) {
        var note = m.covered
          ? 'Demonstrated in ' + ((COVERED_IN['manager.' + m.id] || {}).concept || 'a sibling concept') + ' · opens a receipt'
          : 'Opens a manager sheet';
        body.appendChild(navRow(m.ico, m.label, note, function () {
          if (m.covered) pushCoveredSheet('manager.' + m.id);
          else openManager(m.id);
        }));
      });
      body.appendChild(elm('div', 'fs-section-gap'));
    }

    var sections = [];
    (dom.subs || []).forEach(function (sub) {
      var sec = elm('section', 'fs-sub');
      sec.id = 'fs-sub-' + sub.id;
      var head = elm('div', 'fs-sub-head');
      head.appendChild(elm('span', 'fs-sub-num', subNum(dom, sub)));
      head.appendChild(elm('h3', 'fs-sub-title', sub.title));
      sec.appendChild(head);
      if (sub.blurb) sec.appendChild(elm('p', 'fs-sub-blurb', sub.blurb));

      var buckets = { standard: [], advanced: [], diagnostic: [] };
      (sub.settingIds || []).forEach(function (sid) {
        var s = settingById(sid);
        if (!s) return;
        var exp = s.exposure || 'standard';
        if (exp === 'advanced' || exp === 'expert') buckets.advanced.push(s);
        else if (exp === 'diagnostic') buckets.diagnostic.push(s);
        else buckets.standard.push(s); // standard, managed, unavailable stay visible
      });

      buckets.standard.forEach(function (s) {
        sec.appendChild(renderSettingRow(s, { domain: dom, sub: sub }));
      });

      if (buckets.advanced.length) {
        var adv = elm('button', 'fs-navrow');
        adv.type = 'button';
        adv.appendChild(icoEl('layers'));
        adv.appendChild(elm('span', null, 'Advanced ' + sub.title.toLowerCase()));
        adv.appendChild(elm('span', 'fs-navrow-note', buckets.advanced.length + ' ' + plural(buckets.advanced.length, 'setting', 'settings') + ' · opens a sheet'));
        adv.addEventListener('click', function () { pushAdvancedSheet(dom, sub); });
        sec.appendChild(adv);
      }
      if (buckets.diagnostic.length) {
        var diag = elm('button', 'fs-navrow');
        diag.type = 'button';
        diag.appendChild(icoEl('wrench'));
        diag.appendChild(elm('span', null, 'Diagnostics'));
        diag.appendChild(elm('span', 'fs-navrow-note', buckets.diagnostic.length + ' read-mostly · opens a drawer sheet'));
        diag.addEventListener('click', function () { pushDiagnosticsSheet(dom, sub); });
        sec.appendChild(diag);
      }

      body.appendChild(sec);
      sections.push(sec);
    });

    // Scrollspy: cached-offset math via the shared module; the outline chip
    // is the only persistent "you are here" (no sidebar in Focus Stack).
    if (layer.spy) { try { layer.spy.dispose(); } catch (e) { /* ignore */ } }
    layer.spy = window.PMSpy.attach({
      scroller: body,
      topOffset: 8,
      getSections: function () { return sections.filter(function (s) { return document.contains(s); }); },
      onChange: function (activeId) {
        var subId = String(activeId || '').replace(/^fs-sub-/, '');
        var sub = (dom.subs || []).filter(function (s) { return s.id === subId; })[0];
        if (sub) setChipText(layer, chipLabel(dom, sub));
        syncOutlineActive(layer, activeId);
        // Scrollspy refines the route with replaceState — never pushState,
        // so reading a category does not spam browser history.
        if (sub && !routing && currentTop() === layer) {
          layer.route = destHash(domainId, sub.id);
          try { window.PMState.writeRoute(layer.route, { replace: true }); } catch (e) { /* optional */ }
        }
      }
    });
    var first = (dom.subs || [])[0];
    if (first) setChipText(layer, chipLabel(dom, first));
    if (layer._chip && !layer._chip.wired) {
      layer._chip.wired = true;
      layer._chip.button.addEventListener('click', function () { toggleOutline(layer, dom); });
    }
  }

  function domainManagers(domainId) {
    var map = {
      agents: [
        { id: 'providers', label: 'Providers & Models manager', ico: 'cloud' },
        { id: 'personas', label: 'Personas', ico: 'masks', covered: true }
      ],
      code: [
        { id: 'fileManager', label: 'Files & Editor manager', ico: 'folder' },
        { id: 'lsp', label: 'Language servers', ico: 'server' },
        { id: 'formatters', label: 'Formatters manager', ico: 'wrench' },
        { id: 'terminalProfiles', label: 'Terminal Profiles manager', ico: 'terminal' }
      ],
      planning: [{ id: 'testing', label: 'Testing & Debug manager', ico: 'beaker' }],
      context: [{ id: 'memory', label: 'Assistant memory', ico: 'brain', covered: true }],
      collaboration: [{ id: 'crew', label: 'Crew templates', ico: 'users', covered: true }],
      extensions: [
        { id: 'mcp', label: 'Connected tool servers', ico: 'plug' },
        { id: 'skills', label: 'Skills manager', ico: 'sparkle' },
        { id: 'plugins', label: 'Plugins manager', ico: 'puzzle' },
        { id: 'tools', label: 'Tools funnel', ico: 'toolbox' },
        { id: 'commands', label: 'Commands & shortcuts', ico: 'keyboard' }
      ],
      media: [{ id: 'media', label: 'Media routes', ico: 'film', covered: true }],
      system: [{ id: 'storage', label: 'Storage & retention', ico: 'database', covered: true }]
    };
    return map[domainId] || [];
  }

  /* Outline overlay: expands from the chip; jumps within the category,
     sideways-swaps to another category, or pops home. */
  function toggleOutline(layer, dom) {
    if (layer._outline && !layer._outline.classList.contains('is-closed')) {
      closeOutline(layer);
      return;
    }
    if (!layer._outline) {
      var panel = elm('div', 'fs-outline is-closed');
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Outline');
      panel.style.top = '96px';
      panel.style.left = '18px';
      layer.el.appendChild(panel);
      layer._outline = panel;
      panel.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.stopPropagation(); closeOutline(layer, true); }
      });
      document.addEventListener('mousedown', function (e) {
        if (!panel.classList.contains('is-closed') &&
            !panel.contains(e.target) && !layer._chip.button.contains(e.target)) {
          closeOutline(layer);
        }
      }, true);
    }
    var panel2 = layer._outline;
    panel2.innerHTML = '';
    panel2.appendChild(elm('h3', null, dom.num + ' · ' + dom.title));
    (dom.subs || []).forEach(function (sub) {
      var item = elm('button', 'fs-outline-item');
      item.type = 'button';
      item.setAttribute('data-sub', 'fs-sub-' + sub.id);
      item.appendChild(elm('span', 'fs-outline-num', subNum(dom, sub)));
      item.appendChild(elm('span', null, sub.title));
      if (layer.spy && layer.spy.state.activeId === 'fs-sub-' + sub.id) item.classList.add('is-active');
      item.addEventListener('click', function () {
        closeOutline(layer, true);
        layer.spy.jumpTo('fs-sub-' + sub.id, {});
      });
      panel2.appendChild(item);
    });
    panel2.appendChild(elm('h3', null, 'Other categories'));
    (data().taxonomy || []).forEach(function (other) {
      if (other.id === dom.id) return;
      var item = elm('button', 'fs-outline-item');
      item.type = 'button';
      item.appendChild(elm('span', 'fs-outline-num', other.num));
      item.appendChild(elm('span', null, other.title));
      item.addEventListener('click', function () {
        closeOutline(layer);
        swapTop(makeDomainDesc(other.id));
      });
      panel2.appendChild(item);
    });
    var homeItem = elm('button', 'fs-outline-item');
    homeItem.type = 'button';
    homeItem.appendChild(elm('span', 'fs-outline-num', ''));
    homeItem.appendChild(elm('span', null, 'Back to Settings Home'));
    homeItem.addEventListener('click', function () { closeOutline(layer); popTo(0); });
    panel2.appendChild(homeItem);

    layer._chip.button.setAttribute('aria-expanded', 'true');
    panel2.classList.remove('is-closed');
    var firstItem = panel2.querySelector('.fs-outline-item.is-active') || panel2.querySelector('.fs-outline-item');
    if (firstItem) firstItem.focus();
  }

  function closeOutline(layer, refocus) {
    if (!layer._outline) return;
    layer._outline.classList.add('is-closed');
    if (layer._chip) layer._chip.button.setAttribute('aria-expanded', 'false');
    if (refocus && layer._chip) layer._chip.button.focus();
  }

  function syncOutlineActive(layer, activeId) {
    if (!layer._outline) return;
    var items = layer._outline.querySelectorAll('.fs-outline-item[data-sub]');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('is-active', items[i].getAttribute('data-sub') === activeId);
    }
  }

  function makeDomainDesc(domainId) {
    var dom = domainById(domainId);
    if (!dom) return null;
    return {
      id: 'domain-' + domainId,
      kind: 'domain',
      domainId: domainId,
      spineLabel: dom.title,
      kicker: 'Category ' + dom.num,
      title: dom.title,
      withSearch: true,
      withChip: true,
      route: destHash(domainId),
      render: function (body, l) { renderDomain(body, l, domainId); },
      onReveal: function (l) { if (l.spy) l.spy.refresh(); },
      onPop: function (l) {
        // Remember where the reader was for the plate's Resume affordance.
        var active = l.spy && l.spy.state.activeId;
        if (active) {
          var subId = active.replace(/^fs-sub-/, '');
          var d2 = domainById(domainId);
          var sub = d2 && (d2.subs || []).filter(function (s) { return s.id === subId; })[0];
          if (sub && l.bodyEl.scrollTop > 40) {
            store.set('resume.' + domainId, { subId: subId, num: subNum(d2, sub), title: sub.title });
          } else {
            store.set('resume.' + domainId, null);
          }
        }
        if (l.spy) l.spy.dispose();
      }
    };
  }

  /* ================================================== setting rows */

  function renderSettingRow(s, ctx) {
    var rs = window.PMState.resolveRowState(s);
    var row = elm('div', 'fs-row');
    row.id = 'fs-row-' + s.id;
    if (!rs.editable && rs.exposure === 'unavailable') row.classList.add('is-inert');

    var main = elm('div', 'fs-row-main');
    var label = elm('div', 'fs-row-label');
    if (rs.exposure === 'managed' || rs.valueKind === 'managed') label.appendChild(icoEl('lock'));
    label.appendChild(elm('span', null, s.label));
    rs.flags.forEach(function (f) {
      var fi = icoEl(f.icon);
      fi.title = f.label;
      fi.setAttribute('aria-label', f.label);
      fi.setAttribute('role', 'img');
      label.appendChild(fi);
    });
    main.appendChild(label);
    if (s.desc) main.appendChild(elm('div', 'fs-row-desc', s.desc));
    row.appendChild(main);

    var chips = elm('div', 'fs-row-chips');
    rs.chips.forEach(function (c) { chips.appendChild(chipEl(c.kind, c.label)); });
    chips.appendChild(elm('span', 'fs-row-source', rs.sourceLabel));
    row.appendChild(chips);

    var control = elm('div', 'fs-row-control');
    control.appendChild(controlFor(s, rs, ctx));
    var open = elm('button', 'fs-row-open');
    open.type = 'button';
    open.title = 'Details for ' + s.label;
    open.appendChild(icoEl('chevR'));
    var sr = elm('span', 'pm-visually-hidden', 'Details for ' + s.label);
    open.appendChild(sr);
    open.addEventListener('click', function () { pushDetailsSheet(s.id); });
    control.appendChild(open);
    row.appendChild(control);
    return row;
  }

  function refreshRow(settingId) {
    var oldRow = document.getElementById('fs-row-' + settingId);
    var s = settingById(settingId);
    if (!oldRow || !s) return;
    var fresh = renderSettingRow(s, {});
    oldRow.parentNode.replaceChild(fresh, oldRow);
  }

  function setSettingValue(s, value, opts) {
    opts = opts || {};
    s.value = value;
    s.valueSource = 'custom';
    refreshRow(s.id);
    window.PMShell.status('Saved: ' + s.label + ' is now ' + displayValue(s));
    if (opts.receipt) window.PMState.receipt(opts.receipt, s.label);
  }

  function displayValue(s) {
    var rs = window.PMState.resolveRowState(s);
    return rs.valueLabel || 'set';
  }

  function controlFor(s, rs, ctx) {
    var wrap = elm('span');
    var exp = rs.exposure;

    if (!rs.editable) {
      // Managed / unavailable: the chip already carries the state; the
      // reason lives in the source line and the details sheet.
      return wrap;
    }

    var isExpert = exp === 'expert';

    function guard(applyFn, proposedLabel) {
      if (isExpert) pushConfirmSheet(s, proposedLabel, applyFn);
      else applyFn();
    }

    if (s.type === 'toggle') {
      var sw = elm('button', 'fs-switch');
      sw.type = 'button';
      sw.setAttribute('role', 'switch');
      sw.setAttribute('aria-checked', s.value ? 'true' : 'false');
      sw.setAttribute('aria-label', s.label);
      sw.addEventListener('click', function () {
        var next = !s.value;
        guard(function () { setSettingValue(s, next); }, next ? 'On' : 'Off');
      });
      wrap.appendChild(sw);
      return wrap;
    }

    if (s.type === 'select' && Array.isArray(s.options)) {
      var sel = elm('select', 'fs-select');
      sel.setAttribute('aria-label', s.label);
      s.options.forEach(function (o) {
        var val = (o && typeof o === 'object') ? (o.value != null ? o.value : o.id) : o;
        var lab = (o && typeof o === 'object') ? (o.label || String(val)) : String(o);
        var opt = elm('option', null, lab);
        opt.value = String(val);
        if (String(s.value) === String(val)) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function () {
        var v = sel.value;
        guard(function () { setSettingValue(s, v); }, v);
      });
      wrap.appendChild(sel);
      return wrap;
    }

    if (s.type === 'radio' && Array.isArray(s.options)) {
      var group = elm('div', 'fs-radios');
      group.setAttribute('role', 'radiogroup');
      group.setAttribute('aria-label', s.label);
      s.options.forEach(function (o) {
        var val = (o && typeof o === 'object') ? (o.value != null ? o.value : o.id) : o;
        var lab = (o && typeof o === 'object') ? (o.label || String(val)) : String(o);
        var r = elm('button', 'fs-radio');
        r.type = 'button';
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', String(s.value) === String(val) ? 'true' : 'false');
        r.appendChild(elm('span', 'fs-radio-dot'));
        r.appendChild(elm('span', null, lab));
        r.addEventListener('click', function () {
          guard(function () {
            setSettingValue(s, val);
          }, lab);
        });
        group.appendChild(r);
      });
      wrap.appendChild(group);
      return wrap;
    }

    if (s.type === 'number' || s.type === 'slider') {
      var num = elm('input', 'fs-number');
      num.type = 'number';
      num.setAttribute('aria-label', s.label);
      if (s.value != null) num.value = s.value;
      num.addEventListener('change', function () {
        var v = num.value === '' ? s['default'] : Number(num.value);
        guard(function () { setSettingValue(s, v); }, String(v));
      });
      wrap.appendChild(num);
      return wrap;
    }

    if (s.type === 'action') {
      var act = btn(typeof s.value === 'string' && s.value ? s.value : 'Open', 'arrowR', null, function () {
        window.PMState.receipt(s.label, 'This action runs outside the demo.');
      });
      wrap.appendChild(act);
      return wrap;
    }

    // text / path / list / keyvalue / multiselect: no ambiguous blank inputs
    // inline. The value chip states the value; editing happens in the
    // details sheet (disclosure is navigation).
    var editBtn = btn('Edit', 'edit', 'is-quiet', function () { pushDetailsSheet(s.id); });
    wrap.appendChild(editBtn);
    return wrap;
  }

  /* --------------------------- details / advanced / diagnostics sheets */

  function pushDetailsSheet(settingId) {
    var loc = settingLocation(settingId);
    push({
      id: 'details-' + settingId,
      kind: 'details',
      spineLabel: 'Details',
      kicker: loc ? (loc.domain.title + ' · ' + subNum(loc.domain, loc.sub) + ' ' + loc.sub.title) : 'Setting',
      title: (settingById(settingId) || {}).label || 'Setting',
      half: true,
      route: window.PMState.buildHash({ kind: 'setting', settingId: settingId }),
      render: function (body) { renderDetails(body, settingId); }
    });
  }

  function renderDetails(body, settingId) {
    var s = settingById(settingId);
    if (!s) { body.appendChild(elm('p', 'fs-quiet', 'This setting is not available in the current scenario.')); return; }
    var rs = window.PMState.resolveRowState(s);

    if (s.desc) body.appendChild(elm('p', 'fs-para', s.desc));

    var facts = elm('dl', 'fs-facts');
    function fact(k, v) {
      if (v == null || v === '') return;
      var f = elm('div', 'fs-fact');
      f.appendChild(elm('dt', null, k));
      f.appendChild(elm('dd', null, v));
      facts.appendChild(f);
    }
    fact('Current value', rs.valueLabel);
    fact('Value source', rs.sourceLabel);
    fact('Default', formatRaw(s, s['default']));
    if (s.recommended !== undefined) fact('Recommended', formatRaw(s, s.recommended));
    if (Array.isArray(s.scope) && s.scope.length) {
      fact('Scope', s.scope.map(function (x) { return SCOPE_HUMAN[x] || x; }).join(' · '));
    }
    if (s.scopeNote) fact('Scope note', s.scopeNote);
    if (s.effective !== undefined && JSON.stringify(s.effective) !== JSON.stringify(s.value)) {
      fact('Requested', formatRaw(s, s.value));
      fact('Effective right now', formatRaw(s, s.effective));
    }
    if (s.managedReason) fact('Why it is managed', s.managedReason);
    if (s.unavailableReason) fact('Why it is unavailable', s.unavailableReason);
    rs.flags.forEach(function (f) { fact('Note', f.label); });
    body.appendChild(facts);

    if (s.riskNote) {
      var caution = elm('div', 'fs-caution');
      var ch = elm('div', 'fs-caution-head');
      ch.appendChild(icoEl('warning'));
      ch.appendChild(elm('span', null, 'Use with care'));
      caution.appendChild(ch);
      caution.appendChild(elm('div', 'fs-caution-body', s.riskNote));
      body.appendChild(caution);
    }

    // Text-like editing lives here so blank inline fields never appear.
    var textish = ['text', 'path', 'list', 'keyvalue', 'multiselect'].indexOf(s.type) >= 0;
    if (rs.editable && textish && (s.type === 'text' || s.type === 'path')) {
      var lbl = elm('label', 'fs-hero-label', 'Set a value');
      lbl.setAttribute('for', 'fs-edit-' + s.id);
      body.appendChild(lbl);
      var input = elm('input', 'fs-text');
      input.id = 'fs-edit-' + s.id;
      input.type = 'text';
      input.style.width = '100%';
      input.placeholder = 'Type a value, or leave and keep "' + rs.valueLabel + '"';
      if (s.valueSource === 'custom' && typeof s.value === 'string') input.value = s.value;
      body.appendChild(input);
      var row = elm('div', 'fs-notice-actions');
      row.appendChild(btn('Save value', 'check', 'is-primary', function () {
        if (input.value.trim() === '') {
          window.PMShell.toast('Nothing entered, so the value stays "' + rs.valueLabel + '".');
          return;
        }
        setSettingValue(s, input.value.trim());
        popTo(layers.length - 2);
      }));
      body.appendChild(row);
    } else if (rs.editable && textish) {
      body.appendChild(elm('p', 'fs-quiet', 'This value is a structured list. In the full app it opens a dedicated editor; here the chip above states the current state.'));
      var openBtn = btn('Open the editor', 'external', null, function () {
        window.PMState.receipt('Open editor', s.label + ' would open its structured editor.');
      });
      body.appendChild(openBtn);
    }

    body.appendChild(elm('div', 'fs-section-gap'));
    var actions = elm('div', 'fs-notice-actions');
    if (rs.editable && s.valueSource !== 'default') {
      actions.appendChild(btn('Reset to default', 'refresh', null, function () {
        s.value = (s['default'] !== undefined) ? JSON.parse(JSON.stringify(s['default'])) : s.value;
        s.valueSource = 'default';
        refreshRow(s.id);
        window.PMShell.status('Reset: ' + s.label + ' is back to its default.');
        popTo(layers.length - 2);
      }));
    }
    if (!rs.editable) {
      actions.appendChild(elm('span', 'fs-quiet', rs.exposure === 'managed' || rs.valueKind === 'managed'
        ? 'This setting follows workspace policy and cannot be changed here.'
        : 'This setting is not available right now.'));
    }
    body.appendChild(actions);
  }

  function formatRaw(s, v) {
    if (v === undefined) return null;
    var fake = {};
    for (var k in s) { if (Object.prototype.hasOwnProperty.call(s, k)) fake[k] = s[k]; }
    fake.value = v;
    fake.valueSource = 'custom';
    var rs = window.PMState.resolveRowState(fake);
    return rs.valueLabel || String(v);
  }

  function pushAdvancedSheet(dom, sub, focusSettingId) {
    push({
      id: 'advanced-' + sub.id,
      kind: 'advanced',
      spineLabel: 'Advanced',
      kicker: dom.title + ' · ' + subNum(dom, sub) + ' ' + sub.title,
      title: 'Advanced ' + sub.title.toLowerCase(),
      half: true,
      route: destHash(dom.id, sub.id, 'advanced'),
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'Settings most people never need. Everything here still explains itself.'));
        var expertShown = false;
        (sub.settingIds || []).forEach(function (sid) {
          var s = settingById(sid);
          if (!s) return;
          if (s.exposure === 'advanced') body.appendChild(renderSettingRow(s, { domain: dom, sub: sub }));
        });
        (sub.settingIds || []).forEach(function (sid) {
          var s = settingById(sid);
          if (!s || s.exposure !== 'expert') return;
          if (!expertShown) {
            expertShown = true;
            var caution = elm('div', 'fs-caution');
            var ch = elm('div', 'fs-caution-head');
            ch.appendChild(icoEl('warning'));
            ch.appendChild(elm('span', null, 'Expert territory'));
            caution.appendChild(ch);
            caution.appendChild(elm('div', 'fs-caution-body', 'Changes below can remove protections. Each change asks you to confirm on its own sheet.'));
            body.appendChild(caution);
          }
          body.appendChild(renderSettingRow(s, { domain: dom, sub: sub }));
        });
      },
      onReveal: function () {
        if (focusSettingId) {
          var rowEl = document.getElementById('fs-row-' + focusSettingId);
          if (rowEl) {
            rowEl.scrollIntoView({ block: 'center', behavior: motionReduced() ? 'auto' : 'smooth' });
            window.PMSpy.focusFlash(rowEl);
          }
        }
      }
    });
  }

  function pushDiagnosticsSheet(dom, sub, focusSettingId) {
    push({
      id: 'diag-' + sub.id,
      kind: 'diagnostics',
      spineLabel: 'Diagnostics',
      kicker: dom.title + ' · ' + subNum(dom, sub) + ' ' + sub.title,
      title: 'Diagnostics',
      half: true,
      route: destHash(dom.id, sub.id, 'diagnostics'),
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'Read-mostly internals for troubleshooting. Values here describe the system rather than configure it.'));
        (sub.settingIds || []).forEach(function (sid) {
          var s = settingById(sid);
          if (!s || s.exposure !== 'diagnostic') return;
          body.appendChild(renderSettingRow(s, { domain: dom, sub: sub }));
        });
      },
      onReveal: function () {
        if (focusSettingId) {
          var rowEl = document.getElementById('fs-row-' + focusSettingId);
          if (rowEl) {
            rowEl.scrollIntoView({ block: 'center', behavior: motionReduced() ? 'auto' : 'smooth' });
            window.PMSpy.focusFlash(rowEl);
          }
        }
      }
    });
  }

  /* Expert changes confirm on their own sheet — disclosure is navigation,
     so even the confirmation is a place you visit and leave. */
  function pushConfirmSheet(s, proposedLabel, applyFn) {
    push({
      id: 'confirm-' + s.id,
      kind: 'confirm',
      spineLabel: 'Confirm',
      kicker: 'Expert change',
      title: 'Confirm: ' + s.label,
      half: true,
      render: function (body) {
        var caution = elm('div', 'fs-caution');
        var ch = elm('div', 'fs-caution-head');
        ch.appendChild(icoEl('warning'));
        ch.appendChild(elm('span', null, 'This change removes a protection'));
        caution.appendChild(ch);
        caution.appendChild(elm('div', 'fs-caution-body', s.riskNote || 'This is an expert setting. Make sure you understand the consequence before applying it.'));
        body.appendChild(caution);

        var facts = elm('dl', 'fs-facts');
        var f1 = elm('div', 'fs-fact');
        f1.appendChild(elm('dt', null, 'Current'));
        f1.appendChild(elm('dd', null, displayValue(s)));
        facts.appendChild(f1);
        var f2 = elm('div', 'fs-fact is-attention');
        f2.appendChild(elm('dt', null, 'After this change'));
        f2.appendChild(elm('dd', null, proposedLabel));
        facts.appendChild(f2);
        body.appendChild(facts);

        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn('Apply the change', 'check', 'is-primary', function () {
          popTo(layers.length - 2);
          window.setTimeout(function () {
            applyFn();
            window.PMState.receipt('Expert change applied', s.label + ' set to ' + proposedLabel + '.');
          }, motionReduced() ? 20 : 120);
        }));
        actions.appendChild(btn('Keep things as they are', null, 'is-quiet', function () {
          popTo(layers.length - 2);
        }));
        body.appendChild(actions);
      }
    });
  }

  /* ==================================================== notices sheet */

  function pushNoticesSheet() {
    push({
      id: 'notices',
      kind: 'notices',
      spineLabel: 'Queue',
      kicker: 'Settings Home',
      title: 'Things waiting on you',
      render: function (body) { renderNotices(body); }
    });
  }

  function renderNotices(body) {
    var groups = [
      { kind: 'attention', title: 'Needs attention', blurb: 'Broken, disconnected, or unsafe. These block work.' },
      { kind: 'setup', title: 'Continue setup', blurb: 'Intentionally unfinished. Pick up where you left off.' },
      { kind: 'recommended', title: 'Recommended', blurb: 'Optional improvements. Nothing is wrong.' }
    ];
    var all = data().notices || [];
    if (!all.length) {
      body.appendChild(elm('p', 'fs-quiet', 'Nothing is waiting on you. This queue stays empty until something genuinely needs a decision.'));
    }
    groups.forEach(function (g) {
      var items = all.filter(function (n) { return n && n.kind === g.kind; });
      if (!items.length) return;
      var grp = elm('div', 'fs-notice-group');
      var h = elm('h3');
      h.appendChild(statusWordEl(g.kind, g.title));
      h.appendChild(elm('span', 'fs-count', String(items.length)));
      grp.appendChild(h);
      grp.appendChild(elm('p', 'fs-quiet', g.blurb));
      items.forEach(function (n) {
        var r = window.PMState.resolveNotice(n);
        var card = elm('article', 'fs-notice');
        card.setAttribute('data-tone', r.tone);
        var st = elm('div', 'fs-notice-status');
        st.appendChild(statusWordEl(r.tone, r.statusWord));
        card.appendChild(st);
        card.appendChild(elm('div', 'fs-notice-headline', r.headline));
        card.appendChild(elm('div', 'fs-notice-consequence', r.consequence));
        var actions = elm('div', 'fs-notice-actions');
        if (r.primary && r.primary.label) {
          actions.appendChild(btn(r.primary.label, 'arrowR', 'is-primary', function () {
            openNoticeTarget(n);
          }));
        }
        if (r.secondary && r.secondary.label) {
          actions.appendChild(btn(r.secondary.label, null, 'is-quiet', function () {
            var clone = { target: n.target, primary: n.secondary };
            openNoticeTarget(clone);
          }));
        }
        card.appendChild(actions);
        grp.appendChild(card);
      });
      body.appendChild(grp);
    });

    // Designated prose field number two: a note-to-self, spellchecked.
    body.appendChild(elm('div', 'fs-section-gap'));
    var noteLabel = elm('h3', 'fs-sub-title', 'Leave a note for later');
    noteLabel.style.fontSize = 'var(--fs-md)';
    body.appendChild(noteLabel);
    var prose = elm('div', 'fs-prose');
    prose.contentEditable = 'true';
    prose.setAttribute('role', 'textbox');
    prose.setAttribute('aria-multiline', 'true');
    prose.setAttribute('aria-label', 'Note for later');
    prose.textContent = 'Dont forget: recieve the new Copilot seat untill the renewal clears.';
    body.appendChild(prose);
    body.appendChild(elm('p', 'fs-prose-hint', 'Spellcheck underlines suspicious words. Right-click (or press Cmd+period) for suggestions; nothing is ever replaced automatically.'));
    try { window.PMSpell.attach(prose, { store: store, projectDict: true }); } catch (e) { /* optional */ }
    var save = btn('Save note', 'check', null, function () {
      window.PMState.receipt('Save note', 'Notes attach to the Settings queue in the full app.');
    });
    body.appendChild(save);
  }

  /* ==================================================== recents sheet */

  function pushRecentsSheet() {
    push({
      id: 'recents',
      kind: 'recents',
      spineLabel: 'Recent',
      kicker: 'Settings Home',
      title: 'Recent changes',
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'The last few things you changed. Open one to jump back to it.'));
        (data().recents || []).forEach(function (r) {
          var row = elm('button', 'fs-mrow');
          row.type = 'button';
          var name = elm('span', 'fs-mrow-name');
          name.appendChild(icoEl('history'));
          name.appendChild(elm('span', null, r.label));
          row.appendChild(name);
          row.appendChild(elm('span', 'fs-mrow-note', r.detail + ' · ' + fmtWhen(r.at)));
          var openI = elm('span', 'fs-mrow-open');
          openI.appendChild(icoEl('chevR'));
          row.appendChild(openI);
          row.addEventListener('click', function () {
            var t = r.target || {};
            if (t.settingId) openSetting(t.settingId);
            else if (t.providerId) pushProviderDetail(t.providerId);
            else if (t.personaId) pushCoveredSheet('manager.personas');
            else if (t.manager) openManager(t.manager);
            else if (t.domain) ensureDomainLayer(t.domain, function () { /* landed */ });
          });
          body.appendChild(row);
        });
      }
    });
  }

  /* =============================================== providers manager */

  function pushProvidersSheet(focusSection) {
    // A manager is a place too: full sheet, one level below Home.
    var top = currentTop();
    if (top && top.kind === 'providers') {
      if (focusSection) revealProviderSection(top, focusSection);
      return;
    }
    var layer = push({
      id: 'providers',
      kind: 'providers',
      spineLabel: 'Providers',
      kicker: 'Manager',
      title: 'Providers & Models',
      withSearch: true,
      route: mgrHash(focusSection === 'roles' ? 'roles' : (focusSection === 'free' ? 'freeRoutes' : 'providers')),
      render: function (body, l) { renderProviders(body, l); },
      onReveal: function (l) { if (l.pendingSection) { revealProviderSection(l, l.pendingSection); l.pendingSection = null; } }
    });
    if (focusSection) layer.pendingSection = focusSection;
    return layer;
  }

  function revealProviderSection(layer, section) {
    var el = layer.bodyEl.querySelector(section === 'roles' ? '#fs-roles-group' : '#fs-free-group');
    if (el) {
      el.scrollIntoView({ block: 'start', behavior: motionReduced() ? 'auto' : 'smooth' });
      window.PMSpy.focusFlash(el);
    }
  }

  function twoStepStatus(p) {
    var signedIn = ['ready', 'degraded', 'auth-no-invoke', 'refreshing'].indexOf(p.status) >= 0;
    var canRun = p.status === 'ready' || p.status === 'degraded';
    var wrapEl = elm('span', 'fs-twostep');
    var s1 = elm('span', 'fs-step');
    s1.setAttribute('data-ok', signedIn ? 'true' : 'false');
    s1.appendChild(icoEl(signedIn ? 'checkCircle' : 'warning'));
    s1.appendChild(elm('span', null, signedIn ? 'Signed in' : (p.status === 'not-installed' ? 'Not installed' : 'Signed out')));
    wrapEl.appendChild(s1);
    var arrow = elm('span', 'fs-step-arrow');
    arrow.appendChild(icoEl('arrowR'));
    arrow.setAttribute('aria-hidden', 'true');
    wrapEl.appendChild(arrow);
    var s2 = elm('span', 'fs-step');
    s2.setAttribute('data-ok', canRun ? 'true' : 'false');
    s2.appendChild(icoEl(canRun ? 'checkCircle' : 'warning'));
    s2.appendChild(elm('span', null, canRun ? 'Runs models' : 'Cannot run models yet'));
    wrapEl.appendChild(s2);
    return wrapEl;
  }

  function renderProviders(body, layer) {
    var intro = elm('p', 'fs-para', 'Connections grouped by how they sign in. Signing in and being able to run models are two different steps, and both are shown.');
    body.appendChild(intro);

    var filterWrap = elm('div', 'fs-head-search');
    filterWrap.style.maxWidth = '320px';
    filterWrap.style.margin = '4px 0 6px';
    filterWrap.appendChild(icoEl('filter'));
    var filter = elm('input');
    filter.type = 'search';
    filter.placeholder = 'Filter connections';
    filter.setAttribute('aria-label', 'Filter connections');
    filterWrap.appendChild(filter);
    body.appendChild(filterWrap);

    var addRow = elm('div', 'fs-notice-actions');
    addRow.appendChild(btn('Connect a provider', 'plus', null, function () {
      window.PMState.receipt('Connect a provider', 'The connect flow lists installable tools, direct sign-ins, and API connections.');
    }));
    body.appendChild(addRow);

    var order = ['tool', 'account', 'api', 'server', 'free'];
    var groupsWrap = elm('div');
    body.appendChild(groupsWrap);

    function draw() {
      var q = filter.value.trim().toLowerCase();
      groupsWrap.innerHTML = '';
      order.forEach(function (gk) {
        var items = (data().providers || []).filter(function (p) {
          if (p.groupKind !== gk) return false;
          if (!q) return true;
          return (p.name + ' ' + p.family).toLowerCase().indexOf(q) >= 0;
        });
        var isFree = gk === 'free';
        var routes = isFree ? (data().freeRoutes || []).filter(function (r) {
          if (!q) return true;
          return (r.modelRef + ' ' + r.qualifier).toLowerCase().indexOf(q) >= 0;
        }) : [];
        if (!items.length && !routes.length) return;
        var grp = elm('div', 'fs-mgroup');
        if (isFree) grp.id = 'fs-free-group';
        grp.appendChild(elm('h3', null, GROUP_TITLES[gk]));
        if (gk === 'tool') grp.appendChild(elm('p', 'fs-mgroup-note', 'These tools own their sign-ins inside isolated profiles. Puppet Master launches each tool’s own login and never handles the token.'));
        if (gk === 'account') grp.appendChild(elm('p', 'fs-mgroup-note', 'Direct sign-ins that Puppet Master opens and holds on your behalf.'));
        items.forEach(function (p) {
          var row = elm('button', 'fs-mrow');
          row.type = 'button';
          row.id = 'fs-prov-' + p.id;
          var name = elm('span', 'fs-mrow-name');
          name.appendChild(icoEl(gk === 'server' ? 'server' : (gk === 'api' ? 'key' : (gk === 'free' ? 'globe' : 'cloud'))));
          name.appendChild(elm('span', null, p.name));
          name.appendChild(elm('span', 'fs-mrow-tag', p.family));
          row.appendChild(name);
          row.appendChild(elm('span', 'fs-mrow-note', p.statusNote || ''));
          var st = elm('span', 'fs-mrow-status');
          var sh = provStatus(p);
          st.appendChild(statusWordEl(sh.tone, sh.word));
          if (p.status !== 'not-installed') st.appendChild(twoStepStatus(p));
          row.appendChild(st);
          var openI = elm('span', 'fs-mrow-open');
          openI.appendChild(icoEl('chevR'));
          row.appendChild(openI);
          row.addEventListener('click', function () { pushProviderDetail(p.id); });
          grp.appendChild(row);
        });
        if (isFree && routes.length) {
          grp.appendChild(elm('p', 'fs-mgroup-note', 'Every free route says what "free" means for it. Setup opens the underlying connection and returns you to the model row.'));
          routes.forEach(function (r) { grp.appendChild(freeRouteRow(r)); });
        }
        if (isFree) grp.appendChild(freeCatalogBlock());
        groupsWrap.appendChild(grp);
      });
      if (!q) groupsWrap.appendChild(rolesGroup());
      if (!groupsWrap.children.length) {
        groupsWrap.appendChild(elm('p', 'fs-quiet', 'No connections match that filter.'));
      }
    }
    filter.addEventListener('input', draw);
    draw();
  }

  /* Catalog freshness for the free wrapper: source version, check/import/
     activation times, validation, and the last-known-good guarantee. */
  function freeCatalogBlock() {
    var wrap = elm('div');
    var fc = data().freeCatalog;
    if (!fc || !(fc.sources || []).length) return wrap;
    wrap.appendChild(elm('p', 'fs-mgroup-note', 'Catalog sources refresh on their own. A failed refresh never removes the last catalog that validated.'));
    var facts = elm('dl', 'fs-facts');
    (fc.sources || []).forEach(function (s) {
      var f = elm('div', 'fs-fact');
      f.appendChild(elm('dt', null, s.name));
      var dd = elm('dd');
      dd.appendChild(elm('div', null, 'Source ' + s.sourceVersion + ' · checked ' + fmtWhen(s.lastChecked) + ' · activated ' + fmtWhen(s.lastActivated)));
      var vLine = elm('div', 'fs-quiet');
      vLine.appendChild(document.createTextNode('Validation ' + s.validation + ' · '));
      vLine.appendChild(chipEl(s.lastKnownGood ? 'default' : 'unavailable', s.lastKnownGood ? 'Last known good' : 'No good catalog yet'));
      dd.appendChild(vLine);
      f.appendChild(dd);
      facts.appendChild(f);
    });
    wrap.appendChild(facts);
    if ((fc.changeHistory || []).length) {
      var hl = elm('div', 'fs-loglist');
      fc.changeHistory.slice(0, 4).forEach(function (h) {
        var row = elm('div', 'fs-logline');
        row.appendChild(elm('span', 'fs-logline-when', fmtWhen(h.when)));
        row.appendChild(elm('span', 'fs-logline-text', h.change));
        hl.appendChild(row);
      });
      wrap.appendChild(hl);
    }
    return wrap;
  }

  /* Model roles: the requested vs effective inspector for role routing.
     PMProvider.resolveRoute is the single resolver; the row never hides a
     fallback. */
  function rolesGroup() {
    var grp = elm('div', 'fs-mgroup');
    grp.id = 'fs-roles-group';
    grp.appendChild(elm('h3', null, 'Model roles'));
    grp.appendChild(elm('p', 'fs-mgroup-note', 'Named jobs and the route each one gets. When the effective route differs from the requested one, the reason is shown, never hidden.'));
    var roles = data().roles || [];
    if (!roles.length) {
      grp.appendChild(elm('p', 'fs-quiet', 'No roles are defined yet. Roles appear as soon as a workflow names one.'));
      return grp;
    }
    roles.forEach(function (r) {
      var rt = window.PMProvider.resolveRoute(r);
      var card = elm('div', 'fs-acct');
      var head = elm('div', 'fs-acct-head');
      head.appendChild(elm('span', 'fs-acct-nick', r.label));
      var right = elm('span', 'fs-acct-right');
      if (r.lockedHigh) right.appendChild(chipEl('managed', 'Kept on the high-quality route'));
      if (rt.differs) right.appendChild(chipEl('differs', 'Running elsewhere right now'));
      head.appendChild(right);
      card.appendChild(head);
      var facts = elm('dl', 'fs-facts');
      if (rt.differs) {
        factInto(facts, 'Requested', rt.requested);
        var f = elm('div', 'fs-fact is-attention');
        f.appendChild(elm('dt', null, 'Effective right now'));
        f.appendChild(elm('dd', null, rt.effective));
        facts.appendChild(f);
        factInto(facts, 'Why', rt.why);
      } else {
        factInto(facts, 'Route', rt.effective || r.assignedRoute);
      }
      card.appendChild(facts);
      if (r.note) card.appendChild(elm('p', 'fs-quiet', r.note));
      grp.appendChild(card);
    });
    return grp;
  }

  function freeRouteRow(r) {
    var under = providerById(r.underlyingProviderId);
    var model = under ? (under.models || []).filter(function (m) { return m.id === r.modelRef; })[0] : null;
    var row = elm('button', 'fs-mrow');
    row.type = 'button';
    row.id = 'fs-freeroute-' + r.id;
    var name = elm('span', 'fs-mrow-name');
    name.appendChild(icoEl('globe'));
    name.appendChild(elm('span', null, model ? model.name : r.modelRef));
    if (under) name.appendChild(elm('span', 'fs-mrow-tag', 'via ' + under.name));
    row.appendChild(name);
    var fr = window.PMProvider.resolveFreeRoute(r);
    row.appendChild(elm('span', 'fs-mrow-note', fr.note || ((r.setupSteps && r.setupSteps.length > 1) ? 'Needs setup before first use.' : 'Ready when you are.')));
    var st = elm('span', 'fs-mrow-status');
    st.appendChild(statusWordEl(fr.tone, fr.label));
    var kind = r.qualifier === 'temporarily-unavailable' ? 'unavailable' : 'custom';
    st.appendChild(chipEl(kind, QUALIFIER_HUMAN[r.qualifier] || r.qualifier));
    row.appendChild(st);
    var openI = elm('span', 'fs-mrow-open');
    openI.appendChild(icoEl('chevR'));
    row.appendChild(openI);
    row.addEventListener('click', function () { pushFreeRouteSheet(r.id); });
    return row;
  }

  function pushProviderDetail(pid) {
    var p = providerById(pid);
    if (!p) { window.PMState.receipt('Open provider', 'That provider is not present in this scenario.'); return; }
    // Guarantee the Providers list sits underneath, so popping feels spatial.
    var top = currentTop();
    if (!(top && (top.kind === 'providers' || top.kind === 'provider'))) {
      if (layers.length > 1) popTo(0);
      window.setTimeout(function () {
        pushProvidersSheet();
        window.setTimeout(function () { doPushProvider(pid); }, motionReduced() ? 30 : 140);
      }, layers.length > 1 ? (motionReduced() ? 30 : 140) : 0);
      return;
    }
    if (top.kind === 'provider') { popTo(layers.length - 2); window.setTimeout(function () { doPushProvider(pid); }, motionReduced() ? 30 : 140); return; }
    doPushProvider(pid);
  }

  function doPushProvider(pid) {
    var p = providerById(pid);
    if (!p) return;
    push({
      id: 'provider-' + pid,
      kind: 'provider',
      providerId: pid,
      spineLabel: p.name,
      kicker: 'Provider · ' + (GROUP_TITLES[p.groupKind] || 'Connection'),
      title: p.name,
      withSearch: false,
      route: mgrHash('providers', pid),
      render: function (body, l) { renderProviderDetail(body, l, pid); }
    });
  }

  function renderProviderDetail(body, layer, pid) {
    var p = providerById(pid);
    if (!p) { body.appendChild(elm('p', 'fs-quiet', 'This provider is not present in the current scenario.')); return; }

    // Status block: authenticated is not ready — two explicit steps.
    var statusWrap = elm('div', 'fs-acct');
    var sh = provStatus(p);
    var headRow = elm('div', 'fs-acct-head');
    headRow.appendChild(statusWordEl(sh.tone, sh.word));
    headRow.appendChild(twoStepStatus(p));
    statusWrap.appendChild(headRow);
    if (p.statusNote) statusWrap.appendChild(elm('p', 'fs-para', p.statusNote));
    var acts = elm('div', 'fs-acct-actions');
    acts.appendChild(btn('Refresh catalog', 'refresh', null, function () {
      window.PMState.trigger('catalog-refresh', pid);
      window.PMShell.status('Refreshing the ' + p.name + ' catalog…');
    }));
    if (p.status === 'signed-out' || p.status === 'degraded' || p.status === 'auth-no-invoke') {
      acts.appendChild(btn('Reconnect', 'plug', null, function () {
        window.PMState.trigger('reconnect', pid);
      }));
    }
    if (p.accounts && p.accounts.length) {
      acts.appendChild(btn('Run invocation test', 'play', null, function () {
        window.PMState.trigger('invoke-test', pid);
      }));
    }
    if (p.status === 'not-installed') {
      if (p.setupOffer) {
        // Explicit acquisition only: the offer sheet names the official
        // source and the exact host. Install and sign-in stay separate.
        acts.appendChild(btn('Set up ' + p.name, 'download', 'is-primary', function () {
          pushInstallOfferSheet(pid);
        }));
      } else {
        acts.appendChild(btn('Install the CLI', 'download', 'is-primary', function () {
          window.PMState.receipt('Install ' + p.name, 'Installation happens outside this demo; PM would verify the binary and open the tool’s own sign-in.');
        }));
      }
    }
    statusWrap.appendChild(acts);

    // Catalog freshness: refreshing never discards last-known-good rows.
    var cat = p.catalog || {};
    var catLine = elm('p', 'fs-quiet');
    if (cat.state === 'refreshing') {
      catLine.textContent = 'Catalog refreshing now — showing the last catalog that activated successfully' +
        (cat.lastActivated ? ' (' + fmtWhen(cat.lastActivated) + ')' : '') + '. Rows below stay usable.';
    } else if (cat.lastChecked) {
      catLine.textContent = 'Catalog checked ' + fmtWhen(cat.lastChecked) + (cat.sourceVersion ? ' · source ' + cat.sourceVersion : '') + '.';
    } else {
      catLine.textContent = 'No catalog yet.';
    }
    statusWrap.appendChild(catLine);
    body.appendChild(statusWrap);

    if (p.oauthNote) {
      var oauth = elm('div', 'fs-managed-note');
      oauth.appendChild(icoEl('key'));
      oauth.appendChild(elm('span', null, p.oauthNote));
      body.appendChild(oauth);
    }

    // Authentication boundary: who owns sign-in, resolved by PMProvider so
    // the boundary language cannot drift between concepts.
    if (p.authBoundary) {
      var ab2 = window.PMProvider.resolveAuthBoundary(p);
      var abWrap = elm('div', 'fs-managed-note');
      abWrap.appendChild(icoEl(ab2.pmDirect ? 'key' : 'lock'));
      var abText = elm('span');
      abText.appendChild(elm('b', null, ab2.label + '. '));
      abText.appendChild(document.createTextNode(ab2.note || ''));
      abWrap.appendChild(abText);
      body.appendChild(abWrap);
      var abActs = elm('div', 'fs-notice-actions');
      abActs.appendChild(btn(ab2.signInVerb, ab2.pmDirect ? 'key' : 'external', 'is-quiet', function () {
        window.PMState.receipt(ab2.signInVerb, ab2.kind === 'cli-owned'
          ? 'The CLI opens its own sign-in inside an isolated profile. Puppet Master never sees the token.'
          : (ab2.kind === 'pm-direct-oauth'
            ? 'Puppet Master opens its own OAuth flow; the token lands in the vault as a reference.'
            : 'The connection check runs against the stored reference; nothing is revealed.'));
      }));
      body.appendChild(abActs);
    }

    // External server identity (OpenCode): the server owns its provider
    // credentials; PM verifies reachability and holds one scoped token.
    if (p.serverInfo) {
      body.appendChild(sectionTitle('Server'));
      var svFacts = elm('dl', 'fs-facts');
      factInto(svFacts, 'Address', p.serverInfo.url);
      factInto(svFacts, 'Server version', p.serverInfo.version);
      factInto(svFacts, 'Reachability', p.serverInfo.reachability === 'reachable' ? 'Reachable' : 'Unreachable right now');
      factInto(svFacts, 'Last handshake', fmtWhen(p.serverInfo.lastHandshake));
      factInto(svFacts, 'Model catalog', p.serverInfo.catalogSource === 'server-supplied' ? 'Supplied by the server' : p.serverInfo.catalogSource);
      body.appendChild(svFacts);
      body.appendChild(elm('p', 'fs-quiet', 'Upstream provider keys never leave the server. Puppet Master stores one scoped access token reference for the server itself.'));
    }

    // The seven default-view answers.
    var ab = p.defaultAnswerBlock || {};
    body.appendChild(sectionTitle('At a glance'));
    var facts = elm('dl', 'fs-facts');
    factInto(facts, 'Connected', ab.connected === true ? 'Yes' : (ab.connected === false ? 'No' : String(ab.connected || 'Unknown')));
    factInto(facts, 'Account in use', ab.accountInUse);
    factInto(facts, 'Billing route', ab.billingRoute);
    factInto(facts, 'Included usage remaining', ab.remaining);
    factInto(facts, 'When it runs out', ab.onExhaust);
    factInto(facts, 'Models available', ab.modelsAvail);
    if (ab.attention) {
      var fa = elm('div', 'fs-fact is-attention');
      fa.appendChild(elm('dt', null, 'Needs attention'));
      fa.appendChild(elm('dd', null, ab.attention));
      facts.appendChild(fa);
    }
    body.appendChild(facts);

    // Accounts.
    if (p.accounts && p.accounts.length) {
      body.appendChild(sectionTitle('Accounts'));
      if (p.accounts.length > 1) body.appendChild(elm('p', 'fs-quiet', 'Several accounts on the same provider. Priority orders the fallback chain; switching only affects future requests.'));
      p.accounts.forEach(function (a) { body.appendChild(accountCard(p, a)); });
    }

    // Connections + isolation.
    if (p.connections && p.connections.length) {
      body.appendChild(sectionTitle('Connections'));
      var cfacts = elm('dl', 'fs-facts');
      p.connections.forEach(function (c) {
        var f = elm('div', 'fs-fact');
        f.appendChild(elm('dt', null, c.kind === 'cli' ? 'CLI profile' : (c.kind === 'oauth' ? 'Direct sign-in' : (c.kind === 'api' ? 'API' : (c.kind === 'grouping' ? 'Grouping' : 'Connection')))));
        var dd = elm('dd');
        dd.appendChild(elm('div', null, c.route));
        if (c.note) dd.appendChild(elm('div', 'fs-quiet', c.note));
        f.appendChild(dd);
        cfacts.appendChild(f);
      });
      body.appendChild(cfacts);
    }

    // Installation & updates: one humanized card per installation, one
    // sheet deeper. Advanced resolution detail is a sheet deeper still.
    if ((p.installations && p.installations.length) || p.setupOffer) {
      var instNote = p.setupOffer && !(p.installations && p.installations.length)
        ? 'Not installed anywhere yet · explicit install offer'
        : (p.installations.length + ' ' + plural(p.installations.length, 'installation', 'installations') +
          instAttentionNote(p));
      body.appendChild(navRow('package', 'Installation & updates', instNote + ' · opens a sheet', function () {
        if (p.installations && p.installations.length) pushInstallationsSheet(pid);
        else pushInstallOfferSheet(pid);
      }));
    }

    // Models.
    if (p.models && p.models.length) {
      body.appendChild(sectionTitle('Models'));
      p.models.forEach(function (m) { body.appendChild(modelRow(p, m)); });
    }

    // Free routes anchored to this provider.
    var routes = (data().freeRoutes || []).filter(function (r) { return r.underlyingProviderId === pid; });
    if (routes.length) {
      body.appendChild(sectionTitle('Free routes through this connection'));
      routes.forEach(function (r) { body.appendChild(freeRouteRow(r)); });
    }

    // Usage details unavailable is a fact, not a fault: readiness holds.
    var ud = window.PMProvider.resolveUsageDetails(p);
    if (ud.state === 'unavailable') {
      body.appendChild(sectionTitle('Usage'));
      var udWrap = elm('div', 'fs-managed-note');
      udWrap.appendChild(icoEl('info'));
      udWrap.appendChild(elm('span', null, 'Usage details are unavailable: ' + (ud.reason || 'this route does not report usage totals.') +
        ' The provider itself stays ready; nothing is blocked by the missing numbers.'));
      body.appendChild(udWrap);
    }

    // Usage snapshot (read-only) + what happens next.
    var snap = ((data().usageSnapshot || {}).perProvider || {})[pid];
    if (snap) {
      body.appendChild(sectionTitle('Usage snapshot'));
      body.appendChild(elm('p', 'fs-quiet', 'Read-only. The Usage page owns the full picture; this is the provider’s corner of it.'));
      var sfacts = elm('dl', 'fs-facts');
      factInto(sfacts, 'Included remaining', snap.includedRemaining);
      factInto(sfacts, 'Extra balance', snap.extra);
      factInto(sfacts, 'Resets', snap.resetAt ? fmtWhen(snap.resetAt) : 'No scheduled reset');
      factInto(sfacts, 'Pressure', PRESSURE_HUMAN[snap.pressure] || snap.pressure);
      factInto(sfacts, 'Last use', snap.lastUse ? fmtWhen(snap.lastUse) : 'Not recently');
      factInto(sfacts, 'Projection', snap.projection);
      factInto(sfacts, 'Freshness', snap.freshness);
      body.appendChild(sfacts);
      var usageBtn = btn('Open the Usage page', 'external', null, function () {
        window.PMState.receipt('Open the Usage page', 'Deep link into Usage focused on ' + p.name + '.');
      });
      body.appendChild(usageBtn);
    }

    if (p.whatNext && p.whatNext.length) {
      body.appendChild(sectionTitle('When included usage runs out'));
      body.appendChild(elm('p', 'fs-quiet', 'Only choices this provider actually supports are offered. There is no universal budget switch.'));
      var group = elm('div', 'fs-radios');
      group.setAttribute('role', 'radiogroup');
      group.setAttribute('aria-label', 'When included usage runs out');
      var saved = store.get('whatnext.' + pid) || p.whatNext[0];
      p.whatNext.forEach(function (w) {
        var r = elm('button', 'fs-radio');
        r.type = 'button';
        r.setAttribute('role', 'radio');
        r.setAttribute('aria-checked', saved === w ? 'true' : 'false');
        r.appendChild(elm('span', 'fs-radio-dot'));
        r.appendChild(elm('span', null, WHATNEXT_HUMAN[w] || w));
        r.addEventListener('click', function () {
          store.set('whatnext.' + pid, w);
          var all = group.querySelectorAll('.fs-radio');
          for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-checked', 'false');
          r.setAttribute('aria-checked', 'true');
          window.PMState.receipt('Exhaustion policy saved', p.name + ': ' + (WHATNEXT_HUMAN[w] || w));
        });
        group.appendChild(r);
      });
      body.appendChild(group);
    }

    // Role assignments touching this provider: requested vs effective is
    // resolved by PMProvider and never hidden.
    var roles = (data().roles || []).filter(function (r) {
      var probe = (String(r.assignedRoute || '') + ' ' + String(r.effectiveRoute || '')).toLowerCase();
      return probe.indexOf(p.name.toLowerCase().split(' ')[0]) >= 0;
    });
    if (roles.length) {
      body.appendChild(sectionTitle('Roles routed here'));
      var rfacts = elm('dl', 'fs-facts');
      roles.forEach(function (r) {
        var rt = window.PMProvider.resolveRoute(r);
        var f = elm('div', 'fs-fact' + (rt.differs ? ' is-attention' : ''));
        f.appendChild(elm('dt', null, r.label));
        var dd = elm('dd');
        if (rt.differs) {
          dd.appendChild(elm('div', null, 'Requested ' + rt.requested + ' · running as ' + rt.effective));
          if (rt.why) dd.appendChild(elm('div', 'fs-quiet', rt.why));
        } else {
          dd.appendChild(elm('span', null, (rt.effective || r.assignedRoute) + ' · ' + (r.quality === 'high' ? 'High quality route' : 'Standard route')));
        }
        if (r.lockedHigh) {
          dd.appendChild(elm('div', 'fs-quiet', 'Kept on the high-quality route by default. ' + (r.note || 'User discussion is never silently downgraded.')));
        } else if (r.note && !rt.differs) {
          dd.appendChild(elm('div', 'fs-quiet', r.note));
        }
        f.appendChild(dd);
        rfacts.appendChild(f);
      });
      body.appendChild(rfacts);
    }
  }

  function instAttentionNote(p) {
    var flag = '';
    (p.installations || []).forEach(function (i) {
      if (!i || !i.update) return;
      var st = i.update.state;
      if (!flag && (st === 'update-available' || st === 'verification-failed' || st === 'rolled-back' || st === 'needs-repair' || st === 'waiting-idle')) {
        flag = ' · ' + window.PMProvider.resolveUpdateState(i.update).label.toLowerCase();
      }
    });
    return flag;
  }

  function sectionTitle(text) {
    var h = elm('h3', 'fs-sub-title', text);
    h.style.margin = '20px 0 6px';
    h.style.fontSize = 'var(--fs-md)';
    return h;
  }

  function factInto(dl, k, v) {
    if (v == null || v === '') return;
    var f = elm('div', 'fs-fact');
    f.appendChild(elm('dt', null, k));
    f.appendChild(elm('dd', null, String(v)));
    dl.appendChild(f);
  }

  function accountCard(p, a) {
    var card = elm('div', 'fs-acct');
    card.id = 'fs-acct-' + a.id;
    var head = elm('div', 'fs-acct-head');
    head.appendChild(elm('span', 'fs-acct-nick', a.nickname));
    head.appendChild(elm('span', 'fs-acct-id', a.identity));
    var right = elm('span', 'fs-acct-right');
    var health = healthWord(a.health);
    var healthTone = (a.health === 'ok' || a.health === 'ready') ? 'ok'
      : (a.health === 'usage-exhausted' || a.health === 'signed-out' || a.health === 'auth-no-invoke' || a.health === 'degraded' || a.health === 'error') ? 'attention'
        : 'muted';
    right.appendChild(statusWordEl(healthTone, health));
    if (a.sticky) right.appendChild(chipEl('custom', 'Sticky to this thread'));
    if (a.useNext) right.appendChild(chipEl('recommended', 'Used next'));
    head.appendChild(right);
    card.appendChild(head);

    var grid = elm('div', 'fs-acct-grid');
    function cell(k, v) {
      if (v == null || v === '') return;
      var c = elm('div', 'fs-acct-cell');
      c.appendChild(elm('b', null, k));
      c.appendChild(document.createTextNode(String(v)));
      grid.appendChild(c);
    }
    cell('Sign-in', AUTH_HUMAN[a.authOwner] || a.authOwner);
    cell('Isolation', ISOLATION_HUMAN[a.isolation] || a.isolation);
    cell('Priority in the fallback chain', '#' + a.priority);
    if (a.usage) {
      cell('Included remaining', a.usage.includedRemaining);
      cell('Extra balance', a.usage.extra);
      cell('Resets', a.usage.resetAt ? fmtWhen(a.usage.resetAt) : 'No scheduled reset');
      cell('Pressure', PRESSURE_HUMAN[a.usage.pressure] || a.usage.pressure);
      cell('Last use', a.usage.lastUse ? fmtWhen(a.usage.lastUse) : 'Not recently');
    }
    card.appendChild(grid);
    if (a.projection) card.appendChild(elm('p', 'fs-quiet', a.projection));

    var actions = elm('div', 'fs-acct-actions');
    var enabled = elm('button', 'fs-switch');
    enabled.type = 'button';
    enabled.setAttribute('role', 'switch');
    enabled.setAttribute('aria-checked', a.enabled ? 'true' : 'false');
    enabled.setAttribute('aria-label', 'Enabled: ' + a.nickname);
    enabled.addEventListener('click', function () {
      a.enabled = !a.enabled;
      enabled.setAttribute('aria-checked', a.enabled ? 'true' : 'false');
      window.PMState.receipt(a.enabled ? 'Account enabled' : 'Account disabled', a.nickname + '. Applies to future requests only.');
    });
    actions.appendChild(enabled);
    actions.appendChild(elm('span', 'fs-stat', a.enabled ? 'Enabled' : 'Disabled'));
    if (!a.useNext) {
      actions.appendChild(btn('Use this account next', 'arrowR', null, function () {
        (p.accounts || []).forEach(function (x) { x.useNext = false; });
        a.useNext = true;
        rerenderLayer(currentTop());
        window.PMState.receipt('Account selection', a.nickname + ' will serve future requests. Running work is not moved.');
      }));
    }
    actions.appendChild(btn('Rename', 'edit', 'is-quiet', function () {
      pushRenameSheet(a);
    }));
    actions.appendChild(btn('Repair', 'wrench', 'is-quiet', function () {
      window.PMState.receipt('Repair sign-in', a.nickname + ': Puppet Master would re-check the stored credential, refresh the token, and re-run the invocation test.');
    }));
    actions.appendChild(btn('View logs', 'doc', 'is-quiet', function () {
      pushAccountLogsSheet(a);
    }));
    card.appendChild(actions);
    return card;
  }

  function pushAccountLogsSheet(a) {
    push({
      id: 'acct-logs-' + a.id,
      kind: 'account-logs',
      spineLabel: 'Account logs',
      kicker: 'Account',
      title: 'Recent activity — ' + (a.nickname || a.identity || 'Account'),
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'The last recorded events for this account: sign-ins, token refreshes, and usage checks. Nothing here changes anything.'));
        var events = [];
        if (Array.isArray(a.logsSample)) events = a.logsSample;
        else if (Array.isArray(a.logs)) events = a.logs;
        if (events.length) {
          var list = elm('div', 'fs-loglist');
          events.slice(0, 12).forEach(function (ev) {
            if (!ev) return;
            var row = elm('div', 'fs-logline');
            row.appendChild(elm('span', 'fs-logline-when', ev.at ? fmtWhen(ev.at) : ''));
            row.appendChild(elm('span', 'fs-logline-text', String(ev.line || ev.text || '')));
            list.appendChild(row);
          });
          body.appendChild(list);
        } else {
          var facts = elm('dl', 'fs-facts');
          factInto(facts, 'Health', healthWord(a.health));
          if (a.usage && a.usage.lastUse) factInto(facts, 'Last use', fmtWhen(a.usage.lastUse));
          if (a.lastCatalogRefresh) factInto(facts, 'Catalog last refreshed', fmtWhen(a.lastCatalogRefresh));
          body.appendChild(facts);
          body.appendChild(elm('p', 'fs-quiet', 'No detailed event log is recorded in this scenario. The summary above is everything Puppet Master holds for this account.'));
        }
        var actionsRow = elm('div', 'fs-notice-actions');
        actionsRow.appendChild(btn('Open the full log', 'arrowR', 'is-quiet', function () {
          window.PMState.receipt('Open the full log', 'The complete account log lives in the diagnostics area outside Settings.');
        }));
        body.appendChild(actionsRow);
      }
    });
  }

  function pushRenameSheet(a) {
    push({
      id: 'rename-' + a.id,
      kind: 'rename',
      spineLabel: 'Rename',
      kicker: 'Account',
      title: 'Nickname for ' + a.identity,
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'Nicknames are how this account appears everywhere in Puppet Master.'));
        var input = elm('input', 'fs-text');
        input.type = 'text';
        input.style.width = '100%';
        input.value = a.nickname || '';
        input.setAttribute('aria-label', 'Nickname');
        body.appendChild(input);
        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn('Save nickname', 'check', 'is-primary', function () {
          if (input.value.trim()) {
            a.nickname = input.value.trim();
            popTo(layers.length - 2);
            window.setTimeout(function () { rerenderLayer(currentTop()); }, motionReduced() ? 30 : 140);
            window.PMState.receipt('Nickname saved', a.nickname);
          } else {
            window.PMShell.toast('A nickname cannot be empty; the old one stays.');
          }
        }));
        body.appendChild(actions);
      }
    });
  }

  function modelRow(p, m) {
    var row = elm('div', 'fs-model');
    row.id = 'fs-model-' + p.id + '-' + m.id;
    if (m.hidden) row.classList.add('is-hidden-model');
    if (m.unavailableReason) row.classList.add('is-hidden-model');

    var fav = elm('button', 'fs-fav');
    fav.type = 'button';
    fav.setAttribute('aria-pressed', m.fav ? 'true' : 'false');
    fav.title = m.fav ? 'Unfavorite ' + m.name : 'Favorite ' + m.name;
    fav.appendChild(icoEl(m.fav ? 'starFill' : 'star'));
    var favSr = elm('span', 'pm-visually-hidden', 'Favorite ' + m.name);
    fav.appendChild(favSr);
    fav.addEventListener('click', function () {
      m.fav = !m.fav;
      var parent = row.parentNode;
      if (parent) parent.replaceChild(modelRow(p, m), row);
      window.PMShell.status((m.fav ? 'Favorited ' : 'Unfavorited ') + m.name);
    });
    row.appendChild(fav);

    var name = elm('div', 'fs-model-name');
    name.appendChild(elm('span', null, m.name));
    if (m.alias) name.appendChild(elm('span', 'fs-model-alias', '"' + m.alias + '"'));
    row.appendChild(name);

    var meta = elm('div', 'fs-model-meta');
    meta.appendChild(elm('span', null, Math.round((m.ctx || 0) / 1000) + 'k context'));
    meta.appendChild(elm('span', null, '· priority ' + m.priority));
    if (m.effort) meta.appendChild(chipEl('custom', 'Effort: ' + m.effort.join(' / ')));
    if (m.fast === true) meta.appendChild(chipEl('custom', 'Normal / Fast'));
    if (m.hidden) meta.appendChild(chipEl('unavailable', 'Hidden from pickers'));
    if (m.unavailableReason) meta.appendChild(chipEl('unavailable', 'Unavailable'));
    if (m.effectiveRoute && m.requested) meta.appendChild(chipEl('differs', 'Effective: ' + m.effectiveRoute));
    row.appendChild(meta);

    var extra = elm('div', 'fs-model-extra');
    if (m.unavailableReason) extra.appendChild(elm('div', null, m.unavailableReason));
    if (m.fastNote) extra.appendChild(elm('div', 'fs-quiet', m.fastNote));
    if (m.effectiveRoute && m.effectiveReason) {
      var why = elm('button', 'fs-btn is-quiet');
      why.type = 'button';
      why.appendChild(icoEl('info'));
      why.appendChild(elm('span', null, 'Why requests run elsewhere'));
      why.addEventListener('click', function () { pushRouteSheet(p, m); });
      extra.appendChild(why);
    }
    if (extra.childNodes.length) row.appendChild(extra);

    var actions = elm('div', 'fs-model-actions');
    if ((m.effort && m.effort.length) || m.fast === true) {
      var menuWrap = elm('span', 'fs-menu-wrap');
      var mbtn = btn('Effort & speed', 'gauge', null, null);
      mbtn.setAttribute('aria-haspopup', 'menu');
      mbtn.setAttribute('aria-expanded', 'false');
      menuWrap.appendChild(mbtn);
      mbtn.addEventListener('click', function () { toggleEffortMenu(menuWrap, mbtn, m); });
      actions.appendChild(menuWrap);
    }
    var evid = btn('Evidence', 'doc', 'is-quiet', function () { pushEvidenceSheet(p.id, m.id); });
    actions.appendChild(evid);
    var hide = elm('button', 'fs-row-open');
    hide.type = 'button';
    hide.title = m.hidden ? 'Show ' + m.name + ' in pickers' : 'Hide ' + m.name + ' from pickers';
    hide.appendChild(icoEl(m.hidden ? 'eyeOff' : 'eye'));
    var hideSr = elm('span', 'pm-visually-hidden', hide.title);
    hide.appendChild(hideSr);
    hide.addEventListener('click', function () {
      m.hidden = !m.hidden;
      var parent = row.parentNode;
      if (parent) parent.replaceChild(modelRow(p, m), row);
      window.PMShell.status(m.name + (m.hidden ? ' hidden from pickers.' : ' visible in pickers.'));
    });
    actions.appendChild(hide);
    row.appendChild(actions);
    return row;
  }

  /* Effort + Normal/Fast menu: only rendered when the data says the model
     supports it, and it stays open across both choices. */
  function toggleEffortMenu(wrap, anchor, m) {
    var existing = wrap.querySelector('.fs-menu');
    if (existing) { existing.remove(); anchor.setAttribute('aria-expanded', 'false'); anchor.focus(); return; }
    var menu = elm('div', 'fs-menu');
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Effort and speed for ' + m.name);

    function radioRow(groupName, label, checked, onPick) {
      var r = elm('button', 'fs-radio');
      r.type = 'button';
      r.setAttribute('role', 'menuitemradio');
      r.setAttribute('aria-checked', checked ? 'true' : 'false');
      r.appendChild(elm('span', 'fs-radio-dot'));
      r.appendChild(elm('span', null, label));
      r.addEventListener('click', function () {
        onPick();
        var siblings = menu.querySelectorAll('[data-group="' + groupName + '"]');
        for (var i = 0; i < siblings.length; i++) siblings[i].setAttribute('aria-checked', 'false');
        r.setAttribute('aria-checked', 'true');
        // The menu deliberately stays open: effort and speed are one visit.
      });
      r.setAttribute('data-group', groupName);
      return r;
    }

    if (m.effort && m.effort.length) {
      menu.appendChild(elm('h4', null, 'Effort'));
      if (!m.selectedEffort) m.selectedEffort = m.effort[Math.min(1, m.effort.length - 1)];
      m.effort.forEach(function (levelId) {
        var label = levelId.charAt(0).toUpperCase() + levelId.slice(1);
        menu.appendChild(radioRow('effort', label, m.selectedEffort === levelId, function () {
          m.selectedEffort = levelId;
          window.PMShell.status(m.name + ' effort: ' + label);
        }));
      });
    }
    if (m.fast === true) {
      menu.appendChild(elm('h4', null, 'Speed'));
      if (!m.selectedSpeed) m.selectedSpeed = 'normal';
      [{ id: 'normal', label: 'Normal' }, { id: 'fast', label: 'Fast' }].forEach(function (sp) {
        menu.appendChild(radioRow('speed', sp.label, m.selectedSpeed === sp.id, function () {
          m.selectedSpeed = sp.id;
          window.PMShell.status(m.name + ' speed: ' + sp.label);
        }));
      });
    }
    menu.appendChild(elm('p', 'fs-menu-note', 'Pick both, then close. Choices apply to future requests on this model.'));
    var done = btn('Done', 'check', 'fs-menu-done', function () { close(); });
    menu.appendChild(done);

    function close() {
      if (menu.parentNode) menu.parentNode.removeChild(menu);
      anchor.setAttribute('aria-expanded', 'false');
      document.removeEventListener('mousedown', outside, true);
      anchor.focus();
    }
    function outside(e) {
      if (!menu.contains(e.target) && !anchor.contains(e.target)) close();
    }
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
    });
    document.addEventListener('mousedown', outside, true);
    wrap.appendChild(menu);
    anchor.setAttribute('aria-expanded', 'true');
    var first = menu.querySelector('.fs-radio[aria-checked="true"]') || menu.querySelector('.fs-radio');
    if (first) first.focus();
  }

  function pushEvidenceSheet(pid, mid) {
    var p = providerById(pid);
    var m = p && (p.models || []).filter(function (x) { return x.id === mid; })[0];
    push({
      id: 'evidence-' + mid,
      kind: 'evidence',
      spineLabel: 'Evidence',
      kicker: p ? p.name : 'Model',
      title: m ? ('What ' + m.name + ' can do') : 'Capability evidence',
      half: true,
      render: function (body) {
        if (!m) { body.appendChild(elm('p', 'fs-quiet', 'Model not present in this scenario.')); return; }
        body.appendChild(elm('p', 'fs-quiet', 'Each capability states how Puppet Master knows, and when it last checked. Claims are never shown without a source.'));
        var list = elm('ul', 'fs-evidence');
        (m.evidence || []).forEach(function (ev) {
          var li = elm('li');
          li.appendChild(elm('span', 'fs-evidence-cap', humanCap(ev.cap)));
          var det = elm('span', 'fs-evidence-detail');
          det.appendChild(elm('span', null, (EVIDENCE_HUMAN[ev.state] || ev.state) + ' · ' + ev.source + ' · '));
          var t = elm('time', null, fmtWhen(ev.at));
          t.setAttribute('datetime', ev.at || '');
          det.appendChild(t);
          li.appendChild(det);
          list.appendChild(li);
        });
        if (!(m.evidence || []).length) body.appendChild(elm('p', 'fs-quiet', 'No capability checks recorded yet.'));
        body.appendChild(list);
        if (m.fastNote) body.appendChild(elm('p', 'fs-quiet', m.fastNote));
        if (m.unavailableReason) {
          var caution = elm('div', 'fs-caution');
          var ch = elm('div', 'fs-caution-head');
          ch.appendChild(icoEl('warning'));
          ch.appendChild(elm('span', null, 'Currently unavailable'));
          caution.appendChild(ch);
          caution.appendChild(elm('div', 'fs-caution-body', m.unavailableReason));
          body.appendChild(caution);
        }
      }
    });
  }

  function humanCap(cap) {
    var map = {
      'tool-use': 'Tool use', 'image-in': 'Reads images', 'structured-output': 'Structured output',
      'fast-variant': 'Fast variant', 'fast-mode': 'Fast mode', 'selectable-effort': 'Selectable effort',
      'invocation': 'Invocation', 'availability': 'Availability'
    };
    return map[cap] || cap;
  }

  function pushRouteSheet(p, m) {
    push({
      id: 'route-' + m.id,
      kind: 'route',
      spineLabel: 'Routing',
      kicker: p.name,
      title: 'Requested vs. effective',
      half: true,
      render: function (body) {
        var facts = elm('dl', 'fs-facts');
        factInto(facts, 'You asked for', m.name);
        var f = elm('div', 'fs-fact is-attention');
        f.appendChild(elm('dt', null, 'Requests actually run as'));
        f.appendChild(elm('dd', null, m.effectiveRoute));
        facts.appendChild(f);
        body.appendChild(facts);
        if (m.effectiveReason) body.appendChild(elm('p', 'fs-para', m.effectiveReason));
        body.appendChild(elm('p', 'fs-quiet', 'The requested choice is kept. When the condition clears, requests return to it on their own.'));
      }
    });
  }

  /* Free route setup: a stepped, PM-owned surface that always returns you
     to the originating model row. */
  function pushFreeRouteSheet(routeId) {
    var route = (data().freeRoutes || []).filter(function (r) { return r.id === routeId; })[0];
    if (!route) return;
    var under = providerById(route.underlyingProviderId);
    var model = under ? (under.models || []).filter(function (m) { return m.id === route.modelRef; })[0] : null;
    push({
      id: 'freeroute-' + routeId,
      kind: 'freeroute',
      spineLabel: 'Setup',
      kicker: 'Free route · ' + (QUALIFIER_HUMAN[route.qualifier] || route.qualifier),
      title: model ? model.name : route.modelRef,
      half: true,
      render: function (body) {
        var fr = window.PMProvider.resolveFreeRoute(route);
        var stLine = elm('div', 'fs-notice-actions');
        stLine.appendChild(statusWordEl(fr.tone, fr.label));
        if (fr.note) stLine.appendChild(elm('span', 'fs-quiet', fr.note));
        body.appendChild(stLine);
        var qual = elm('div', 'fs-managed-note');
        qual.appendChild(icoEl('info'));
        qual.appendChild(elm('span', null, qualifierExplanation(route.qualifier)));
        body.appendChild(qual);
        body.appendChild(elm('p', 'fs-quiet', fr.wrapperNote));
        if (under) body.appendChild(elm('p', 'fs-quiet', 'This route runs through the ' + under.name + ' connection. Setup happens here and returns you to the model row when done.'));

        var steps = elm('div', 'fs-steps');
        (route.setupSteps || []).forEach(function (st) {
          var item = elm('div', 'fs-step-item');
          var wrapT = elm('div');
          wrapT.appendChild(elm('div', 'fs-step-title', st.title));
          if (st.body) wrapT.appendChild(elm('div', 'fs-step-body', st.body));
          item.appendChild(wrapT);
          steps.appendChild(item);
        });
        // The stepped surface always ends with verification and quota truth.
        var verify = elm('div', 'fs-step-item');
        var vw = elm('div');
        vw.appendChild(elm('div', 'fs-step-title', 'Verify readiness'));
        vw.appendChild(elm('div', 'fs-step-body', 'Puppet Master runs a safe readiness check before the route is offered anywhere.'));
        var vbtn = btn('Run readiness check', 'play', null, function () {
          verify.classList.add('is-done');
          window.PMState.receipt('Readiness check', (model ? model.name : route.modelRef) + ' responded to a safe test call.');
        });
        vw.appendChild(elm('div', 'fs-section-gap'));
        vw.appendChild(vbtn);
        verify.appendChild(vw);
        steps.appendChild(verify);
        var quota = elm('div', 'fs-step-item');
        var qw = elm('div');
        qw.appendChild(elm('div', 'fs-step-title', 'Know the limits'));
        qw.appendChild(elm('div', 'fs-step-body', qualifierExplanation(route.qualifier)));
        quota.appendChild(qw);
        steps.appendChild(quota);
        body.appendChild(steps);

        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn('Return to the model row', 'arrowL', 'is-primary', function () {
          popTo(layers.length - 2);
          window.setTimeout(function () {
            var rowEl = document.getElementById('fs-freeroute-' + routeId) ||
              (model ? document.getElementById('fs-model-' + (under ? under.id : '') + '-' + model.id) : null);
            if (rowEl) window.PMSpy.focusFlash(rowEl);
          }, motionReduced() ? 60 : 260);
        }));
        body.appendChild(actions);
      }
    });
  }

  function qualifierExplanation(q) {
    var map = {
      'rate-limited': 'Free, but rate limited: bursts queue behind a shared per-minute cap. Long runs may pause.',
      'promotional': 'Free during a promotional window. The provider can end the promotion; PM will say so here.',
      'account-required': 'Free to use, but the provider requires an account and a key of your own.',
      'keyless': 'No key or account needed. Nothing to set up.',
      'data-sharing': 'Free because prompts may be used to improve the model. Do not send private material.',
      'subscription-included': 'Included with a subscription you already pay for.',
      'temporarily-unavailable': 'Temporarily unavailable. The route stays listed so saved setups are not lost.'
    };
    return map[q] || 'Free with conditions.';
  }

  /* ======================================= installations sheet stack
     Provider detail > Installations sheet > Advanced resolution sheet.
     Humanized card first; wrapper/symlink/package forensics one sheet
     deeper. All states and allowed actions resolve through PMProvider. */

  function pushInstallationsSheet(pid) {
    var p = providerById(pid);
    if (!p) return;
    push({
      id: 'installs-' + pid,
      kind: 'installations',
      spineLabel: 'Installations',
      kicker: p.name,
      title: 'Installation & updates',
      route: mgrHash('providers', pid + '/installations'),
      render: function (body) { renderInstallations(body, pid); }
    });
  }

  function renderInstallations(body, pid) {
    var p = providerById(pid);
    if (!p) { body.appendChild(elm('p', 'fs-quiet', 'This provider is not present in the current scenario.')); return; }
    var insts = p.installations || [];
    if (!insts.length) {
      body.appendChild(emptyState('No installation of ' + p.name + ' has been found or adopted yet. Discovery scans wrappers, symlinks, shims, and package databases before claiming anything.',
        'Scan for installations', function () { window.PMState.trigger('install-scan', pid); }));
      return;
    }

    body.appendChild(elm('p', 'fs-para', 'One card per installation. Selection decides which one the command resolves to; everything else stays installed but shadowed.'));

    // Update policy: the recommended defaults, stated once for the family.
    var pol = (insts[0].update && insts[0].update.policy) || {};
    var polFacts = elm('dl', 'fs-facts');
    factInto(polFacts, 'Check for updates', pol.check === 'automatic' ? 'Automatically' : 'Manually');
    factInto(polFacts, 'Install updates', pol.install === 'auto-idle' ? 'Automatically when idle' : 'Ask first');
    factInto(polFacts, 'Version policy', pol.versionPolicy === 'latest-compatible' ? 'Latest compatible' : (pol.versionPolicy || 'Latest compatible'));
    factInto(polFacts, 'After failed verification', pol.rollbackOnFailedVerify ? 'Roll back automatically' : 'Leave in place and ask');
    body.appendChild(polFacts);

    insts.forEach(function (inst) {
      body.appendChild(installationCard(p, inst));
    });

    var scanRow = elm('div', 'fs-notice-actions');
    scanRow.appendChild(btn('Scan again', 'search', 'is-quiet', function () {
      window.PMState.trigger('install-scan', pid);
    }));
    body.appendChild(opLine(pid));
    body.appendChild(scanRow);
  }

  function installationCard(p, inst) {
    var r = window.PMProvider.resolveInstallation(inst);
    var upd = r.update;
    var card = elm('div', 'fs-acct');
    card.id = 'fs-inst-' + r.id;

    var head = elm('div', 'fs-acct-head');
    head.appendChild(elm('span', 'fs-acct-nick', r.title));
    head.appendChild(elm('span', 'fs-acct-id', 'v' + (r.version || '?') + ' · ' + hostLabel(r.advanced.hostId)));
    var right = elm('span', 'fs-acct-right');
    if (r.selected) right.appendChild(chipEl('default', 'Selected'));
    if (r.shadowed) right.appendChild(chipEl('unavailable', 'Shadowed'));
    right.appendChild(statusWordEl(upd.tone, upd.label));
    head.appendChild(right);
    card.appendChild(head);

    if (r.shadowed) card.appendChild(elm('p', 'fs-quiet', r.shadowNote));
    if (upd.detail) card.appendChild(elm('p', 'fs-quiet', upd.detail));
    if (inst.update && inst.update.repairNote) card.appendChild(elm('p', 'fs-quiet', inst.update.repairNote));

    var grid = elm('div', 'fs-acct-grid');
    function cell(k, v) {
      if (v == null || v === '') return;
      var c = elm('div', 'fs-acct-cell');
      c.appendChild(elm('b', null, k));
      c.appendChild(document.createTextNode(String(v)));
      grid.appendChild(c);
    }
    cell('Discovery confidence', r.confidence.label);
    cell('Environment', envLabel(r.advanced.hostId, r.advanced.envId) || 'Native');
    if (upd.available) cell('Available', 'Version ' + upd.available.version + (upd.available.published ? ' · published ' + upd.available.published : ''));
    card.appendChild(grid);

    if (r.manualOnly) {
      var mo = elm('div', 'fs-managed-note');
      mo.appendChild(icoEl('lock'));
      mo.appendChild(elm('span', null, r.manualOnlyReason));
      card.appendChild(mo);
    }

    // Truthful staged phases land here while a trigger runs.
    card.appendChild(opLine(p.id + '/' + r.id));

    var actions = elm('div', 'fs-acct-actions');
    r.actions.forEach(function (a) {
      if (a.id === 'select') {
        actions.appendChild(btn('Use this installation', 'check', null, function () {
          window.PMState.trigger('install-select', p.id + '/' + r.id);
        }));
      } else if (a.id === 'update') {
        actions.appendChild(btn('Install update', 'download', 'is-primary', function () {
          window.PMState.trigger('install-update', p.id + '/' + r.id);
        }));
      } else if (a.id === 'rollback') {
        actions.appendChild(btn('Roll back', 'undo', null, function () {
          window.PMState.trigger('install-repair', p.id + '/' + r.id);
        }));
      } else if (a.id === 'repair') {
        actions.appendChild(btn('Repair', 'wrench', null, function () {
          window.PMState.trigger('install-repair', p.id + '/' + r.id);
        }));
      } else if (a.id === 'verify') {
        actions.appendChild(btn('Verify', 'checkCircle', 'is-quiet', function () {
          pushVerifySheet(p, inst);
        }));
      } else if (a.id === 'details') {
        actions.appendChild(btn('Advanced detail', 'layers', 'is-quiet', function () {
          pushInstallAdvancedSheet(p.id, r.id);
        }));
      }
    });
    // The rolled-back fixture keeps its retry honest: trying again replays
    // the truthful failure path, phase by phase, and rolls back again.
    if (upd.state === 'rolled-back' && upd.available && !r.manualOnly) {
      actions.appendChild(btn('Try the update again', 'refresh', null, function () {
        window.PMState.trigger('install-update-fail', p.id + '/' + r.id);
      }));
    }
    card.appendChild(actions);

    if ((upd.history || []).length) {
      var hl = elm('div', 'fs-loglist');
      upd.history.slice(0, 4).forEach(function (h) {
        var row = elm('div', 'fs-logline');
        row.appendChild(elm('span', 'fs-logline-when', fmtWhen(h.when)));
        row.appendChild(elm('span', 'fs-logline-text', h.from + ' to ' + h.to + ' · ' + h.result + (h.detail ? ' — ' + h.detail : '')));
        hl.appendChild(row);
      });
      card.appendChild(hl);
    }
    return card;
  }

  function pushInstallAdvancedSheet(pid, instId) {
    var p = providerById(pid);
    var inst = p ? byId(p.installations, instId) : null;
    if (!inst) return;
    var r = window.PMProvider.resolveInstallation(inst);
    push({
      id: 'inst-adv-' + instId,
      kind: 'install-advanced',
      spineLabel: 'Resolution',
      kicker: p.name + ' · ' + r.title,
      title: 'How this installation resolves',
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'The resolver traces the configured command through wrappers, symlinks, and shims to the actual executable, then asks the package databases who owns it. Nothing below is guessed from a path shape.'));
        var a = r.advanced;
        var facts = elm('dl', 'fs-facts');
        factInto(facts, 'Configured command', a.configuredCommand);
        factInto(facts, 'Resolved launcher', a.resolvedLauncher);
        factInto(facts, 'Actual executable', a.actualExecutable);
        factInto(facts, 'Installation method', a.method === 'unknown' ? 'Could not be identified' : a.method);
        factInto(facts, 'Package identity', a.packageIdentity || 'No package database claims this binary');
        factInto(facts, 'Manager root', a.managerRoot || 'None');
        factInto(facts, 'Host', hostLabel(a.hostId));
        factInto(facts, 'Environment', envLabel(a.hostId, a.envId) || 'Native');
        factInto(facts, 'Architecture', a.arch);
        factInto(facts, 'Confidence', r.confidence.label);
        body.appendChild(facts);
        if ((a.evidence || []).length) {
          body.appendChild(sectionTitle('Discovery evidence'));
          var list = elm('div', 'fs-loglist');
          a.evidence.forEach(function (ev) {
            var row = elm('div', 'fs-logline');
            row.appendChild(elm('span', 'fs-logline-when', ''));
            row.appendChild(elm('span', 'fs-logline-text', String(ev)));
            list.appendChild(row);
          });
          body.appendChild(list);
        }
        if (r.manualOnly) {
          var caution = elm('div', 'fs-caution');
          var ch = elm('div', 'fs-caution-head');
          ch.appendChild(icoEl('warning'));
          ch.appendChild(elm('span', null, 'Manual only'));
          caution.appendChild(ch);
          caution.appendChild(elm('div', 'fs-caution-body', r.manualOnlyReason));
          body.appendChild(caution);
        }
      }
    });
  }

  /* Verification: the seven success conditions. Installer exit code alone
     is never success — the checklist is the definition. */
  function pushVerifySheet(p, inst) {
    var r = window.PMProvider.resolveInstallation(inst);
    push({
      id: 'verify-' + r.id,
      kind: 'verify',
      spineLabel: 'Verify',
      kicker: p.name + ' · ' + r.title,
      title: 'Verification checklist',
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-para', 'An installation counts as healthy only when every check below passes. A clean installer exit code is not on the list on purpose.'));
        var list = elm('ul', 'fs-evidence');
        window.PMProvider.VERIFY_CHECKLIST.forEach(function (item, i) {
          var li = elm('li');
          li.appendChild(elm('span', 'fs-evidence-cap', 'Check ' + (i + 1)));
          li.appendChild(elm('span', 'fs-evidence-detail', item));
          list.appendChild(li);
        });
        body.appendChild(list);
        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn('Run verification', 'play', 'is-primary', function () {
          window.PMState.receipt('Verification', r.title + ': all seven checks passed against version ' + r.version + '. Dependent routes were refreshed.');
        }));
        body.appendChild(actions);
      }
    });
  }

  /* Explicit install offer (cursor-cli): official source, exact host, and
     the standing policy. Install and sign-in are separate on purpose. */
  function pushInstallOfferSheet(pid) {
    var p = providerById(pid);
    if (!p) return;
    var offer = window.PMProvider.installOfferSteps(p);
    push({
      id: 'offer-' + pid,
      kind: 'install-offer',
      spineLabel: 'Set up',
      kicker: p.name,
      title: 'Set up ' + p.name,
      route: mgrHash('providers', pid + '/installations'),
      render: function (body) {
        if (!offer.available) {
          body.appendChild(elm('p', 'fs-quiet', 'No install offer exists for this provider yet.'));
          return;
        }
        var policy = elm('div', 'fs-managed-note');
        policy.appendChild(icoEl('shield'));
        policy.appendChild(elm('span', null, offer.policyNote));
        body.appendChild(policy);

        body.appendChild(sectionTitle('Official source'));
        var sFacts = elm('dl', 'fs-facts');
        factInto(sFacts, 'Source', offer.officialSource);
        body.appendChild(sFacts);
        if (offer.sourceNote) body.appendChild(elm('p', 'fs-quiet', offer.sourceNote));

        body.appendChild(sectionTitle('Where it runs'));
        body.appendChild(elm('p', 'fs-quiet', 'Pick the exact host and environment. Nothing installs anywhere else.'));
        var chosen = { ref: null };
        body.appendChild(radioGroup('Install host',
          (offer.hostChoices || []).map(function (hc) { return { v: hc.label, label: hc.label, hc: hc }; }),
          null, function (v) {
            chosen.ref = (offer.hostChoices || []).filter(function (hc) { return hc.label === v; })[0] || null;
            installBtn.disabled = !chosen.ref;
          }));

        body.appendChild(sectionTitle('What happens'));
        var steps = elm('div', 'fs-steps');
        (offer.steps || []).forEach(function (st) {
          var item = elm('div', 'fs-step-item');
          var w = elm('div');
          w.appendChild(elm('div', 'fs-step-title', st.title));
          if (st.body) w.appendChild(elm('div', 'fs-step-body', st.body));
          item.appendChild(w);
          steps.appendChild(item);
        });
        body.appendChild(steps);

        var caution = elm('div', 'fs-caution');
        var ch = elm('div', 'fs-caution-head');
        ch.appendChild(icoEl('key'));
        ch.appendChild(elm('span', null, 'Installing is not signing in'));
        caution.appendChild(ch);
        caution.appendChild(elm('div', 'fs-caution-body', 'After installation the CLI still owns its own sign-in, which runs later inside an isolated profile. The two steps never merge.'));
        body.appendChild(caution);

        var actions = elm('div', 'fs-notice-actions');
        var installBtn = btn('Install from ' + offer.officialSource, 'download', 'is-primary', function () {
          if (!chosen.ref) return;
          window.PMState.receipt('Install ' + p.name,
            'Simulated: the signed release would download from ' + offer.officialSource + ', verify publisher and version, stage on ' + chosen.ref.label + ', then activate. Sign-in stays a separate step.');
        });
        installBtn.disabled = true;
        actions.appendChild(installBtn);
        actions.appendChild(elm('span', 'fs-quiet', 'Nothing installs until a host is chosen and this button is pressed.'));
        body.appendChild(actions);
      }
    });
  }

  /* ============================================ file manager stack
     Manager sheet > recovery sheet / unavailable-path sheet. Everything
     edits the live demo data; a blank field never stands for a policy. */

  function pushFileManagerSheet() {
    push({
      id: 'filemanager',
      kind: 'filemanager',
      spineLabel: 'Files',
      kicker: 'Manager',
      title: 'Files & Editor',
      withSearch: true,
      route: mgrHash('fileManager'),
      render: function (body) { renderFileManager(body); }
    });
  }

  function renderFileManager(body) {
    var fm = data().fileManager;
    if (!fm) { body.appendChild(elm('p', 'fs-quiet', 'File manager settings are not present in this scenario.')); return; }
    var limits = (data().desktop || {}).limits || {};

    body.appendChild(elm('p', 'fs-para', 'How the project tree, editor tabs, and recovery behave. Values save as you change them.'));

    body.appendChild(sectionTitle('Project tree'));
    body.appendChild(selectRow('When Files Are Dragged Between Folders', 'Moving files rewires imports and paths, so the tree can ask before it acts.', fm.tree.dragDrop, [
      { value: 'ask', label: 'Ask each time' },
      { value: 'move', label: 'Move without asking' },
      { value: 'copy', label: 'Copy instead of moving' }
    ], function (v) { fm.tree.dragDrop = v; window.PMShell.status('Drag and drop: ' + (v === 'ask' ? 'ask each time' : v) + '.'); }));
    body.appendChild(toggleRow('Show Hidden Files', 'Dotfiles and other hidden entries appear in the tree.', fm.tree.showHidden, function (v) {
      fm.tree.showHidden = v; window.PMShell.status('Hidden files ' + (v ? 'shown' : 'hidden') + '.');
    }));
    body.appendChild(selectRow('Ignored Files', 'Entries matched by ignore rules can stay visible but quiet, or vanish entirely.', fm.tree.ignoredStyle, [
      { value: 'dim', label: 'Show dimmed' },
      { value: 'hide', label: 'Hide entirely' }
    ], function (v) { fm.tree.ignoredStyle = v; window.PMShell.status('Ignored files: ' + (v === 'dim' ? 'shown dimmed' : 'hidden') + '.'); }));
    body.appendChild(numberRow('Large File Threshold (MB)', 'Files past this size open read-only with a warning instead of loading fully.', fm.tree.largeFileThresholdMB, 1, 500, function (v) {
      fm.tree.largeFileThresholdMB = v; window.PMShell.status('Large-file threshold: ' + v + ' MB.');
    }));

    body.appendChild(sectionTitle('Tabs & split groups'));
    body.appendChild(numberRow('Editor Tab Limit', 'Past the limit, the least recent unpinned tab closes first. The desktop shell caps this at ' + (limits.maxEditorTabs || 20) + '.', fm.tabs.max, 4, limits.maxEditorTabs || 20, function (v) {
      fm.tabs.max = v; window.PMShell.status('Tab limit: ' + v + '.');
    }));
    body.appendChild(numberRow('Split Editor Groups', 'How many side-by-side editor groups a window may hold.', fm.tabs.splitGroups, 1, 4, function (v) {
      fm.tabs.splitGroups = v; window.PMShell.status('Split groups: ' + v + '.');
    }));

    body.appendChild(sectionTitle('Changed on disk'));
    body.appendChild(selectRow('When A File Changes Outside The Editor', 'Applies when a file is edited by another tool while open here with unsaved changes.', fm.changedOnDisk, [
      { value: 'prompt', label: 'Ask what to do' },
      { value: 'reload', label: 'Reload from disk' },
      { value: 'keep', label: 'Keep my version' }
    ], function (v) { fm.changedOnDisk = v; window.PMShell.status('Changed-on-disk policy saved.'); }));

    body.appendChild(sectionTitle('Recovery'));
    body.appendChild(numberRow('Autosave Interval (seconds)', 'Unsaved buffers snapshot this often. Crash recovery restores from the newest snapshot.', fm.recovery.autosaveSeconds, 5, 300, function (v) {
      fm.recovery.autosaveSeconds = v; window.PMShell.status('Autosave every ' + v + ' seconds.');
    }));
    var recCount = (fm.recovery.recoveredBuffers || []).length;
    body.appendChild(navRow('history', 'Recovered buffers',
      (recCount ? recCount + ' ' + plural(recCount, 'entry', 'entries') : 'None') + ' · opens a drawer sheet',
      function () { pushRecoverySheet(); }));

    // Transient/unavailable paths: an honest reason, never a silent gap.
    var un = fm.unavailable || [];
    if (un.length) {
      body.appendChild(sectionTitle('Paths that are not available'));
      un.forEach(function (u) {
        body.appendChild(mrowBtn({
          ico: 'folder',
          title: u.path,
          note: u.reason + '. Entries under it stay listed but cannot open.',
          status: [statusWordEl('attention', 'Offline')],
          onOpen: function () { pushUnavailablePathSheet(u); }
        }));
      });
    }
  }

  function pushRecoverySheet() {
    push({
      id: 'fm-recovery',
      kind: 'fm-recovery',
      spineLabel: 'Recovery',
      kicker: 'Files & Editor',
      title: 'Recovered buffers',
      half: true,
      route: mgrHash('fileManager', 'recovery'),
      render: function (body) {
        var fm = data().fileManager || {};
        var buffers = (fm.recovery || {}).recoveredBuffers || [];
        body.appendChild(elm('p', 'fs-quiet', 'Unsaved work restored after a crash or forced quit. Each entry is a real buffer, not a diff.'));
        if (!buffers.length) {
          body.appendChild(elm('p', 'fs-quiet', 'Nothing has needed recovering. Autosave snapshots stand ready in the background.'));
          return;
        }
        buffers.forEach(function (b) {
          var card = elm('div', 'fs-acct');
          var head = elm('div', 'fs-acct-head');
          head.appendChild(elm('span', 'fs-acct-nick', b.path));
          var right = elm('span', 'fs-acct-right');
          right.appendChild(chipEl(b.restored ? 'default' : 'not-configured', b.restored ? 'Restored' : 'Waiting'));
          head.appendChild(right);
          card.appendChild(head);
          card.appendChild(elm('p', 'fs-quiet', 'Snapshot taken ' + fmtWhen(b.savedAt) + '.'));
          var actions = elm('div', 'fs-acct-actions');
          actions.appendChild(btn('Open the buffer', 'external', null, function () {
            window.PMState.receipt('Open recovered buffer', b.path + ' would open in the editor with the recovered content marked.');
          }));
          actions.appendChild(btn('Discard snapshot', 'trash', 'is-quiet', function () {
            var list = data().fileManager.recovery.recoveredBuffers;
            var at = list.indexOf(b);
            if (at >= 0) list.splice(at, 1);
            rerenderLayer(currentTop());
            window.PMState.receipt('Snapshot discarded', b.path + '. The file on disk is untouched.');
          }));
          card.appendChild(actions);
          body.appendChild(card);
        });
      }
    });
  }

  function pushUnavailablePathSheet(u) {
    push({
      id: 'fm-unavail-' + u.path,
      kind: 'fm-unavailable',
      spineLabel: 'Offline path',
      kicker: 'Files & Editor',
      title: u.path,
      half: true,
      render: function (body) {
        var st = elm('div', 'fs-notice-actions');
        st.appendChild(statusWordEl('attention', 'Offline'));
        st.appendChild(elm('span', 'fs-quiet', u.reason + '.'));
        body.appendChild(st);
        var facts = elm('dl', 'fs-facts');
        factInto(facts, 'Path', u.path);
        factInto(facts, 'Since', fmtWhen(u.since));
        factInto(facts, 'While offline', 'Entries stay listed and searchable from the last index; opening or writing is refused with this reason.');
        body.appendChild(facts);
        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn('Check again', 'refresh', null, function () {
          window.PMState.receipt('Mount check', u.path + ': still unreachable. The tree keeps its honest offline marker until the mount answers.');
        }));
        body.appendChild(actions);
      }
    });
  }

  /* ================================================ terminal manager */

  function pushTerminalSheet() {
    push({
      id: 'terminal',
      kind: 'terminal',
      spineLabel: 'Terminal',
      kicker: 'Manager',
      title: 'Terminal Profiles',
      withSearch: true,
      route: mgrHash('terminalProfiles'),
      render: function (body) {
        body.appendChild(elm('p', 'fs-para', 'Profiles for embedded terminals. Detected and inherited values stay labeled — a blank field never means "automatic".'));
        var addRow = elm('div', 'fs-notice-actions');
        addRow.appendChild(btn('New profile', 'plus', null, function () {
          window.PMState.receipt('New profile', 'A copy of the default profile would open for editing.');
        }));
        body.appendChild(addRow);
        (data().terminalProfiles || []).forEach(function (tp) {
          var row = elm('button', 'fs-mrow');
          row.type = 'button';
          var name = elm('span', 'fs-mrow-name');
          name.appendChild(icoEl('terminal'));
          name.appendChild(elm('span', null, tp.name));
          if (tp['default']) name.appendChild(elm('span', 'fs-mrow-tag', 'Default profile'));
          row.appendChild(name);
          row.appendChild(elm('span', 'fs-mrow-note', tp.font + ' ' + tp.fontSize + 'px · ' + tp.renderer + ' renderer · keeps output ' + tp.retention));
          var st = elm('span', 'fs-mrow-status');
          st.appendChild(shellSourceChip(tp));
          row.appendChild(st);
          var openI = elm('span', 'fs-mrow-open');
          openI.appendChild(icoEl('chevR'));
          row.appendChild(openI);
          row.addEventListener('click', function () { pushTerminalDetail(tp.id); });
          body.appendChild(row);
        });
      }
    });
  }

  function shellSourceChip(tp) {
    if (tp.shellSource === 'auto-detected') return chipEl('auto', 'Shell: Automatic · ' + tp.shell + ' detected');
    if (tp.shellSource === 'inherit') return chipEl('inherited', 'Shell: Inherited · ' + tp.shell);
    return chipEl('custom', 'Shell: ' + tp.shell);
  }

  function pushTerminalDetail(tid) {
    var tp = terminalById(tid);
    if (!tp) return;
    push({
      id: 'terminal-' + tid,
      kind: 'terminal-profile',
      spineLabel: tp.name,
      kicker: 'Terminal profile',
      title: tp.name,
      route: mgrHash('terminalProfiles', tid),
      render: function (body) { renderTerminalDetail(body, tid); }
    });
  }

  function renderTerminalDetail(body, tid) {
    var tp = terminalById(tid);
    if (!tp) { body.appendChild(elm('p', 'fs-quiet', 'Profile not present in this scenario.')); return; }

    body.appendChild(sectionTitle('Live preview'));
    body.appendChild(elm('p', 'fs-quiet', 'Rendered from this profile’s font, colors, and cursor. Edits below update it immediately.'));
    var previewHost = elm('div');
    body.appendChild(previewHost);

    function drawPreview() {
      previewHost.innerHTML = '';
      var term = elm('div', 'fs-term');
      var bar = elm('div', 'fs-term-bar');
      bar.appendChild(icoEl('terminal'));
      bar.appendChild(elm('span', null, tp.name + ' — ' + tp.shell + ' · ' + tp.cwdPolicy));
      term.appendChild(bar);
      var screen = elm('div', 'fs-term-screen');
      screen.style.background = tp.bg;
      screen.style.color = tp.fg;
      screen.style.fontFamily = '"' + tp.font + '", var(--mono-font)';
      screen.style.fontSize = tp.fontSize + 'px';
      screen.style.lineHeight = String(tp.lineHeight);
      screen.style.opacity = String(tp.opacity != null ? tp.opacity : 1);
      var a = tp.ansi || [];
      function span(text, color, bold) {
        var s = elm('span', null, text);
        if (color) s.style.color = color;
        if (bold) s.style.fontWeight = '700';
        return s;
      }
      // Sample output exercising the palette. Slint note: this preview maps
      // to a fixed sample buffer rendered by the real terminal component.
      screen.appendChild(span('~/puppet-master ', a[4] || tp.fg, true));
      screen.appendChild(span('on ', tp.fg));
      screen.appendChild(span('main\n', a[5] || tp.fg, true));
      screen.appendChild(span('$ cargo test --workspace\n', tp.fg));
      screen.appendChild(span('   Compiling', a[2] || tp.fg, true));
      screen.appendChild(span(' puppet-master v0.9.4\n', tp.fg));
      screen.appendChild(span('warning:', a[3] || tp.fg, true));
      screen.appendChild(span(' unused variable `wave`\n', tp.fg));
      screen.appendChild(span('error[E0308]:', a[1] || tp.fg, true));
      screen.appendChild(span(' mismatched types — expected `u32`\n', tp.fg));
      screen.appendChild(span('test result: ', tp.fg));
      screen.appendChild(span('ok', a[10] || a[2] || tp.fg, true));
      screen.appendChild(span('. 118 passed; ', tp.fg));
      screen.appendChild(span('1 failed', a[9] || a[1] || tp.fg, true));
      screen.appendChild(span('\n$ ', tp.fg));
      var cursor = elm('span', 'fs-term-cursor');
      cursor.style.background = String(tp.cursor).indexOf('block') >= 0 ? tp.fg : 'transparent';
      if (String(tp.cursor).indexOf('bar') >= 0) { cursor.style.background = tp.fg; cursor.style.width = '2px'; }
      if (String(tp.cursor).indexOf('underline') >= 0) { cursor.style.background = 'transparent'; cursor.style.borderBottom = '2px solid ' + tp.fg; }
      cursor.setAttribute('aria-hidden', 'true');
      screen.appendChild(cursor);
      term.appendChild(screen);
      previewHost.appendChild(term);

      var strip = elm('div', 'fs-ansi-strip');
      strip.setAttribute('role', 'img');
      strip.setAttribute('aria-label', 'The sixteen terminal palette colors');
      a.forEach(function (hex, i) {
        var cell = elm('span', 'fs-ansi-cell');
        cell.style.background = hex;
        cell.title = 'Palette color ' + (i + 1) + ': ' + hex;
        strip.appendChild(cell);
      });
      previewHost.appendChild(strip);
    }
    drawPreview();

    body.appendChild(sectionTitle('Type & cursor'));
    var facts = elm('dl', 'fs-facts');
    // Font row
    var fFont = elm('div', 'fs-fact');
    fFont.appendChild(elm('dt', null, 'Font'));
    var ddFont = elm('dd');
    var fontSel = elm('select', 'fs-select');
    fontSel.setAttribute('aria-label', 'Font');
    ['SF Mono', 'JetBrains Mono', 'Menlo', 'Fira Code', 'Cascadia Code'].forEach(function (f) {
      var o = elm('option', null, f);
      o.value = f;
      if (tp.font === f) o.selected = true;
      fontSel.appendChild(o);
    });
    fontSel.addEventListener('change', function () { tp.font = fontSel.value; drawPreview(); window.PMShell.status(tp.name + ' font: ' + tp.font); });
    ddFont.appendChild(fontSel);
    fFont.appendChild(ddFont);
    facts.appendChild(fFont);
    // Size row
    var fSize = elm('div', 'fs-fact');
    fSize.appendChild(elm('dt', null, 'Size & line height'));
    var ddSize = elm('dd');
    var sizeIn = elm('input', 'fs-number');
    sizeIn.type = 'number';
    sizeIn.min = '9'; sizeIn.max = '24';
    sizeIn.value = tp.fontSize;
    sizeIn.setAttribute('aria-label', 'Font size');
    sizeIn.addEventListener('change', function () { tp.fontSize = Number(sizeIn.value) || tp.fontSize; drawPreview(); });
    ddSize.appendChild(sizeIn);
    var lhIn = elm('input', 'fs-number');
    lhIn.type = 'number';
    lhIn.step = '0.05'; lhIn.min = '1'; lhIn.max = '2';
    lhIn.value = tp.lineHeight;
    lhIn.setAttribute('aria-label', 'Line height');
    lhIn.style.marginLeft = '8px';
    lhIn.addEventListener('change', function () { tp.lineHeight = Number(lhIn.value) || tp.lineHeight; drawPreview(); });
    ddSize.appendChild(lhIn);
    fSize.appendChild(ddSize);
    facts.appendChild(fSize);
    // Cursor row
    var fCur = elm('div', 'fs-fact');
    fCur.appendChild(elm('dt', null, 'Cursor'));
    var ddCur = elm('dd');
    var curSel = elm('select', 'fs-select');
    curSel.setAttribute('aria-label', 'Cursor');
    ['block, blinking off', 'bar, blinking off', 'underline, blinking off'].forEach(function (c) {
      var o = elm('option', null, c.replace(', blinking off', '') + ' (no blink)');
      o.value = c;
      if (tp.cursor === c) o.selected = true;
      curSel.appendChild(o);
    });
    curSel.addEventListener('change', function () { tp.cursor = curSel.value; drawPreview(); });
    ddCur.appendChild(curSel);
    ddCur.appendChild(elm('div', 'fs-quiet', 'Blinking stays off everywhere: a resting screen holds still.'));
    fCur.appendChild(ddCur);
    facts.appendChild(fCur);
    // Foreground/background: named swatches, not bare hex mystery. The
    // ANSI strip below the preview carries the sixteen palette slots.
    var fCol = elm('div', 'fs-fact');
    fCol.appendChild(elm('dt', null, 'Text & background'));
    var ddCol = elm('dd');
    var colWrap = elm('span', 'fs-colorpair');
    var fgSw = elm('span', 'fs-colorswatch');
    fgSw.style.background = tp.fg;
    fgSw.title = 'Foreground ' + tp.fg;
    colWrap.appendChild(fgSw);
    colWrap.appendChild(elm('span', null, 'Text ' + tp.fg));
    var bgSw = elm('span', 'fs-colorswatch');
    bgSw.style.background = tp.bg;
    bgSw.title = 'Background ' + tp.bg;
    colWrap.appendChild(bgSw);
    colWrap.appendChild(elm('span', null, 'Background ' + tp.bg));
    ddCol.appendChild(colWrap);
    ddCol.appendChild(elm('div', 'fs-quiet', 'The sixteen ANSI palette slots are shown under the preview; hover any swatch for its value.'));
    fCol.appendChild(ddCol);
    facts.appendChild(fCol);
    // Selection row: the treatment is data-driven; absent data reads as the
    // theme default rather than a blank field.
    var fSel = elm('div', 'fs-fact');
    fSel.appendChild(elm('dt', null, 'Selection'));
    var ddSel = elm('dd');
    if (tp.selection) ddSel.appendChild(elm('span', null, tp.selection));
    else ddSel.appendChild(chipEl('inherited', 'Theme default'));
    fSel.appendChild(ddSel);
    facts.appendChild(fSel);
    // Opacity row: a live control; the preview updates immediately.
    var fOp = elm('div', 'fs-fact');
    fOp.appendChild(elm('dt', null, 'Background opacity'));
    var ddOp = elm('dd');
    var opIn = elm('input', 'fs-number');
    opIn.type = 'number';
    opIn.min = '50'; opIn.max = '100'; opIn.step = '5';
    opIn.value = String(Math.round((tp.opacity != null ? tp.opacity : 1) * 100));
    opIn.setAttribute('aria-label', 'Background opacity, percent');
    opIn.addEventListener('change', function () {
      var v = Number(opIn.value);
      if (!isNaN(v) && v >= 50 && v <= 100) {
        tp.opacity = v / 100;
        drawPreview();
        window.PMShell.status(tp.name + ': background opacity ' + v + ' percent');
      } else {
        opIn.value = String(Math.round((tp.opacity != null ? tp.opacity : 1) * 100));
      }
    });
    ddOp.appendChild(opIn);
    ddOp.appendChild(elm('div', 'fs-quiet', 'Percent. 100 is fully opaque; the preview above shows the effect.'));
    fOp.appendChild(ddOp);
    facts.appendChild(fOp);
    body.appendChild(facts);

    body.appendChild(sectionTitle('Behavior'));
    var bfacts = elm('dl', 'fs-facts');
    // Shell row with explicit source chip; never a blank field.
    var fSh = elm('div', 'fs-fact');
    fSh.appendChild(elm('dt', null, 'Shell'));
    var ddSh = elm('dd');
    ddSh.appendChild(shellSourceChip(tp));
    if (tp.shellSource === 'auto-detected') ddSh.appendChild(elm('div', 'fs-quiet', 'Detected from your login shell. Set a custom shell to override.'));
    if (tp.shellSource === 'inherit') ddSh.appendChild(elm('div', 'fs-quiet', 'Follows the Default profile. Change it there, or set a custom shell here.'));
    fSh.appendChild(ddSh);
    bfacts.appendChild(fSh);
    factInto(bfacts, 'Working directory', tp.cwdPolicy);
    factInto(bfacts, 'Environment', tp.envPolicy);
    factInto(bfacts, 'Keeps output', tp.retention);
    factInto(bfacts, 'Renderer', tp.renderer);
    factInto(bfacts, 'On open', tp.startup === 'None' ? 'Nothing runs automatically' : tp.startup);
    // Paste and link policies: absent data falls back to the app default,
    // shown as an inherited chip rather than a blank field.
    if (tp.pastePolicy) {
      factInto(bfacts, 'Paste behavior', tp.pastePolicy);
    } else {
      var fPaste = elm('div', 'fs-fact');
      fPaste.appendChild(elm('dt', null, 'Paste behavior'));
      var ddPaste = elm('dd');
      ddPaste.appendChild(chipEl('inherited', 'App default · Paste as typed'));
      fPaste.appendChild(ddPaste);
      bfacts.appendChild(fPaste);
    }
    if (tp.linkPolicy) {
      factInto(bfacts, 'Links', tp.linkPolicy);
    } else {
      var fLink = elm('div', 'fs-fact');
      fLink.appendChild(elm('dt', null, 'Links'));
      var ddLink = elm('dd');
      ddLink.appendChild(chipEl('inherited', 'App default · Cmd-click opens links'));
      fLink.appendChild(ddLink);
      bfacts.appendChild(fLink);
    }
    body.appendChild(bfacts);

    var fgbg = elm('div', 'fs-managed-note');
    fgbg.appendChild(icoEl('info'));
    fgbg.appendChild(elm('span', null, 'Foreground and background: a terminal keeps running when its tab is in the background. Output is retained per the policy above, and a background terminal that produces new output marks its tab quietly rather than stealing focus.'));
    body.appendChild(fgbg);

    var copyRow = elm('div', 'fs-notice-actions');
    var copySw = elm('button', 'fs-switch');
    copySw.type = 'button';
    copySw.setAttribute('role', 'switch');
    copySw.setAttribute('aria-checked', tp.copyOnSelect ? 'true' : 'false');
    copySw.setAttribute('aria-label', 'Copy on select');
    copySw.addEventListener('click', function () {
      tp.copyOnSelect = !tp.copyOnSelect;
      copySw.setAttribute('aria-checked', tp.copyOnSelect ? 'true' : 'false');
      window.PMShell.status(tp.name + ': copy on select ' + (tp.copyOnSelect ? 'on' : 'off'));
    });
    copyRow.appendChild(copySw);
    copyRow.appendChild(elm('span', 'fs-stat', 'Copy on select'));
    if (!tp['default']) {
      copyRow.appendChild(btn('Make default profile', 'star', null, function () {
        (data().terminalProfiles || []).forEach(function (x) { x['default'] = false; });
        tp['default'] = true;
        window.PMState.receipt('Default profile', tp.name + ' is now the default for new terminals.');
      }));
    }
    body.appendChild(copyRow);

    // Diagnostics disclosure: navigation, not an expander — it opens a
    // drawer sheet, same as every other disclosure in Focus Stack.
    var logCount = Array.isArray(tp.logsSample) ? tp.logsSample.length : 0;
    var diagRow = elm('button', 'fs-navrow');
    diagRow.type = 'button';
    diagRow.appendChild(icoEl('wrench'));
    diagRow.appendChild(elm('span', null, 'Recent terminal diagnostics'));
    diagRow.appendChild(elm('span', 'fs-navrow-note', (logCount ? logCount + ' recent ' + plural(logCount, 'line', 'lines') : 'read-only') + ' · opens a drawer sheet'));
    diagRow.addEventListener('click', function () { pushTerminalLogsSheet(tp); });
    body.appendChild(diagRow);
  }

  function pushTerminalLogsSheet(tp) {
    push({
      id: 'terminal-logs-' + tp.id,
      kind: 'terminal-logs',
      spineLabel: 'Diagnostics',
      kicker: 'Terminal profile · ' + tp.name,
      title: 'Recent terminal diagnostics',
      half: true,
      route: mgrHash('terminalProfiles', tp.id + '/logs'),
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'The last few lines this profile logged about itself: shell startup, renderer notes, and policy decisions. Read-only.'));
        var events = Array.isArray(tp.logsSample) ? tp.logsSample : [];
        if (events.length) {
          var list = elm('div', 'fs-loglist');
          events.slice(0, 12).forEach(function (ev) {
            if (!ev) return;
            var row = elm('div', 'fs-logline');
            row.appendChild(elm('span', 'fs-logline-when', ev.at ? fmtWhen(ev.at) : ''));
            row.appendChild(elm('span', 'fs-logline-text', String(ev.line || '')));
            list.appendChild(row);
          });
          body.appendChild(list);
        } else {
          body.appendChild(elm('p', 'fs-quiet', 'No diagnostics recorded for this profile in this scenario. A healthy terminal is usually a quiet one.'));
        }
      }
    });
  }

  /* ================================================ LSP sheet stack
     Registry sheet > server detail sheet > logs sheet. Custom servers are
     real CRUD against the live store; restart runs the shared trigger with
     truthful phases. Built from PM_DATA.lsp + packet 05 — never from a
     sibling concept's markup. */

  var LSP_STATE_CHIP = {
    'installed': ['default', 'Installed'],
    'detected': ['auto', 'Detected on PATH'],
    'missing': ['not-configured', 'Not installed'],
    'custom': ['custom', 'Custom server']
  };

  var LSP_HEALTH_WORD = {
    'running': { word: 'Running', tone: 'ok' },
    'stopped': { word: 'Stopped', tone: 'muted' },
    'not-installed': { word: 'Not installed', tone: 'setup' },
    'failed': { word: 'Failed', tone: 'attention' }
  };

  function lspOwnership(l) {
    var exe = String(l.executable || '');
    if (l.custom) return 'Configured by you. Puppet Master runs exactly the command you wrote and never updates it.';
    if (exe.indexOf('puppet-master') >= 0) return 'PM Tool Store generation — ownership proven, updates and rollback managed by Puppet Master.';
    if (exe.indexOf('.cargo') >= 0) return 'Cargo-managed binary — adopted read-only. Updates stay with cargo.';
    return 'Found on PATH — ownership unproven, so Puppet Master never modifies it. Updates stay manual.';
  }

  function pushLspSheet() {
    push({
      id: 'lsp',
      kind: 'lsp',
      spineLabel: 'Language servers',
      kicker: 'Manager',
      title: 'Language Servers',
      withSearch: true,
      route: mgrHash('lsp'),
      render: function (body) { renderLspList(body); }
    });
  }

  function renderLspList(body) {
    var servers = data().lsp || [];
    body.appendChild(elm('p', 'fs-para', 'One row per language. Provenance is stated on every row: installed by Puppet Master, detected on PATH, missing, or configured by you.'));
    var addRow = elm('div', 'fs-notice-actions');
    addRow.appendChild(btn('Add a custom server', 'plus', null, function () { pushLspForm(null); }));
    body.appendChild(addRow);

    if (!servers.length) {
      body.appendChild(emptyState('No language servers are known yet. Detection runs when a project opens; custom servers can be added any time.'));
      return;
    }
    servers.forEach(function (l) {
      var chip = LSP_STATE_CHIP[l.custom ? 'custom' : l.state] || ['not-configured', l.state];
      var hw = LSP_HEALTH_WORD[l.health] || { word: 'Unknown', tone: 'muted' };
      body.appendChild(mrowBtn({
        id: 'fs-lsp-' + l.id,
        ico: 'server',
        title: l.language,
        tag: l.version || null,
        note: (l.capabilities || '') + (l.conflicts ? ' · ' + l.conflicts : ''),
        status: [statusWordEl(hw.tone, hw.word), chipEl(chip[0], chip[1])],
        onOpen: function () { pushLspDetail(l.id); }
      }));
    });
    body.appendChild(elm('p', 'fs-quiet', 'Servers start on demand and stop when idle. A stopped server with no open files is healthy, not broken.'));
  }

  function pushLspDetail(id) {
    var l = lspById(id);
    if (!l) return;
    push({
      id: 'lsp-' + id,
      kind: 'lsp-detail',
      spineLabel: l.language,
      kicker: 'Language server',
      title: l.language,
      route: mgrHash('lsp', id),
      render: function (body) { renderLspDetail(body, id); }
    });
  }

  function renderLspDetail(body, id) {
    var l = lspById(id);
    if (!l) { body.appendChild(elm('p', 'fs-quiet', 'This server is not present in the current scenario.')); return; }
    var hw = LSP_HEALTH_WORD[l.health] || { word: 'Unknown', tone: 'muted' };

    var st = elm('div', 'fs-notice-actions');
    st.appendChild(statusWordEl(hw.tone, hw.word));
    st.appendChild(elm('span', 'fs-quiet', l.version || 'No version recorded'));
    body.appendChild(st);
    body.appendChild(opLine(l.id));

    body.appendChild(sectionTitle('Command & configuration'));
    var facts = elm('dl', 'fs-facts');
    factInto(facts, 'Executable', l.executable === 'Auto-detected' ? 'Auto-detected on PATH' : (l.executable || 'Not resolved'));
    if (l.custom) {
      factInto(facts, 'Command', l.command);
      factInto(facts, 'Environment', l.env && Object.keys(l.env).length ? Object.keys(l.env).map(function (k) { return k + '=' + l.env[k]; }).join(' · ') : 'Inherits the project environment');
      factInto(facts, 'Initialization options', l.initOptions || 'None');
    }
    factInto(facts, 'Scope', l.scope === 'project' ? 'This project' : 'All projects');
    factInto(facts, 'Starts', l.startup);
    factInto(facts, 'Capabilities', l.capabilities);
    factInto(facts, 'Ownership', lspOwnership(l));
    body.appendChild(facts);

    // Requested vs effective attachment, resolved by the shared resolver so
    // the difference can never be papered over.
    body.appendChild(sectionTitle('Attachment: requested vs effective'));
    var att = elm('dl', 'fs-facts');
    var fmtRoute = window.PMProvider.resolveRoute({
      requestedRoute: 'This server',
      effectiveRoute: l.formatting || 'This server',
      fallbackReason: l.conflicts || null
    });
    if (fmtRoute.differs) {
      factInto(att, 'Formatting requested', fmtRoute.requested);
      var fd = elm('div', 'fs-fact is-attention');
      fd.appendChild(elm('dt', null, 'Formatting effective'));
      fd.appendChild(elm('dd', null, fmtRoute.effective + (fmtRoute.why ? ' — ' + fmtRoute.why : '')));
      att.appendChild(fd);
    } else {
      factInto(att, 'Formatting', 'This server formats its own files.');
    }
    factInto(att, 'Diagnostics owner', l.diagnosticsOwner || 'This server');
    factInto(att, 'Attached right now', l.health === 'running'
      ? 'Yes — serving its open documents.'
      : (l.health === 'stopped' ? 'No — the server is stopped; it reattaches the next time a matching file opens.' : 'No — nothing to attach until a server is installed.'));
    body.appendChild(att);

    // Host & remote behavior: honest degradation, stated before it bites.
    body.appendChild(sectionTitle('Host & remote behavior'));
    var offline = !!data().offline;
    var hostFacts = elm('dl', 'fs-facts');
    factInto(hostFacts, 'Runs on', 'The host that holds the project files (Home TrueNAS when the project runs there).');
    factInto(hostFacts, 'Remote editing', offline
      ? 'Offline right now: remote language features are unavailable; the editor falls back to syntax coloring and the last cached symbols.'
      : 'When the editor and server are on different machines, diagnostics stream with round-trip latency (about 40 ms on the LAN). Hover and completion degrade gracefully instead of blocking the editor.');
    body.appendChild(hostFacts);

    // Limits: concept-local guard rails, editable and honest about scope.
    body.appendChild(sectionTitle('Limits'));
    if (!l.limits) l.limits = { restartCap: 3, verbosity: 'Standard' };
    body.appendChild(numberRow('Automatic restarts', 'Per hour, after a crash. Past the cap the server stays down and the row says why.',
      l.limits.restartCap, 0, 10, function (v) {
        l.limits.restartCap = v;
        window.PMShell.status(l.language + ': up to ' + v + ' automatic restarts per hour.');
      }));
    body.appendChild(selectRow('Log detail', null, l.limits.verbosity,
      ['Errors only', 'Standard', 'Verbose'].map(function (o) { return { value: o, label: o }; }),
      function (v) {
        l.limits.verbosity = v;
        window.PMShell.status(l.language + ' log detail: ' + v + '.');
      }));

    var actions = elm('div', 'fs-notice-actions');
    if (l.state === 'missing') {
      actions.appendChild(btn('Set up a server', 'download', 'is-primary', function () {
        window.PMState.receipt('Set up ' + l.language + ' server',
          'Installation is explicit: official source, exact host and environment, verified before activation. Nothing installs from a background demand.');
      }));
    } else {
      actions.appendChild(btn('Restart server', 'refresh', 'is-primary', function () {
        window.PMState.trigger('lsp-restart', l.id);
      }));
    }
    actions.appendChild(btn('View logs', 'doc', null, function () { pushLspLogsSheet(l.id); }));
    if (l.custom) {
      actions.appendChild(btn('Edit', 'edit', 'is-quiet', function () { pushLspForm(l.id); }));
      actions.appendChild(btn('Remove', 'trash', 'is-quiet', function () { pushLspRemoveSheet(l.id); }));
    }
    body.appendChild(actions);
    if (l.lastRestart) body.appendChild(elm('p', 'fs-quiet', 'Last restart ' + fmtWhen(l.lastRestart) + '. The server reattached to its open documents.'));
  }

  function pushLspLogsSheet(id) {
    var l = lspById(id);
    if (!l) return;
    push({
      id: 'lsp-logs-' + id,
      kind: 'lsp-logs',
      spineLabel: 'Logs',
      kicker: 'Language server · ' + l.language,
      title: 'Server log',
      half: true,
      route: mgrHash('lsp', id + '/logs'),
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'The last lines this server logged. Read-only; the full log lives with diagnostics outside Settings.'));
        var events = l.logsSample || [];
        if (!events.length) {
          body.appendChild(elm('p', 'fs-quiet', 'No log lines recorded in this scenario.'));
          return;
        }
        var list = elm('div', 'fs-loglist');
        events.slice(0, 12).forEach(function (ev) {
          var row = elm('div', 'fs-logline');
          row.appendChild(elm('span', 'fs-logline-when', ev.at || ''));
          row.appendChild(elm('span', 'fs-logline-text', ev.line || ''));
          list.appendChild(row);
        });
        body.appendChild(list);
      }
    });
  }

  /* Custom server CRUD: a real form writing into the live store. */
  function pushLspForm(existingId) {
    var existing = existingId ? lspById(existingId) : null;
    push({
      id: existing ? 'lsp-edit-' + existingId : 'lsp-add',
      kind: 'lsp-form',
      spineLabel: existing ? 'Edit server' : 'Add server',
      kicker: 'Language servers',
      title: existing ? 'Edit ' + existing.language : 'Add a custom server',
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'A custom server runs exactly the command you write, in the scope you pick. Puppet Master supervises it but never rewrites it.'));
        var nameIn = formField(body, 'Language or name', existing ? existing.language : '', 'e.g. Zig');
        var cmdIn = formField(body, 'Command', existing ? existing.command : '', 'e.g. zls --enable-debug-log', true);
        var envIn = formField(body, 'Environment (KEY=value, space separated)', existing && existing.env ? Object.keys(existing.env).map(function (k) { return k + '=' + existing.env[k]; }).join(' ') : '', 'Optional', true);
        var initIn = formField(body, 'Initialization options (JSON)', existing ? existing.initOptions : '', 'Optional, passed on initialize', true);

        body.appendChild(elm('div', 'fs-section-gap'));
        var scopeVal = { v: existing ? existing.scope : 'project' };
        body.appendChild(radioGroup('Scope',
          [{ v: 'project', label: 'This project' }, { v: 'global', label: 'All projects' }],
          scopeVal.v, function (v) { scopeVal.v = v; }));

        var err = elm('p', 'fs-form-error');
        err.hidden = true;
        body.appendChild(err);

        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn(existing ? 'Save changes' : 'Add server', 'check', 'is-primary', function () {
          var name = nameIn.value.trim();
          var cmd = cmdIn.value.trim();
          if (!name || !cmd) {
            err.hidden = false;
            err.textContent = !name ? 'A name is required.' : 'A command is required — the server cannot start without one.';
            return;
          }
          var env = {};
          envIn.value.trim().split(/\s+/).forEach(function (pair) {
            var eq = pair.indexOf('=');
            if (eq > 0) env[pair.slice(0, eq)] = pair.slice(eq + 1);
          });
          if (existing) {
            existing.language = name;
            existing.command = cmd;
            existing.env = env;
            existing.initOptions = initIn.value.trim();
            existing.scope = scopeVal.v;
            window.PMState.receipt('Server updated', name + ' saved. Changes apply on the next start.');
          } else {
            data().lsp.push({
              id: 'lsp-custom-' + Date.now().toString(36),
              language: name,
              custom: true,
              state: 'installed',
              version: 'Custom command',
              scope: scopeVal.v,
              startup: 'On first matching file',
              capabilities: 'Declared by the server on first start',
              conflicts: null,
              executable: cmd.split(/\s+/)[0],
              command: cmd,
              env: env,
              initOptions: initIn.value.trim(),
              formatting: 'This server',
              diagnosticsOwner: 'This server',
              health: 'stopped',
              logsSample: []
            });
            window.PMState.receipt('Server added', name + ' is registered and will start on the first matching file.');
          }
          popTo(layers.length - 2);
          window.setTimeout(function () { rerenderLayer(currentTop()); }, motionReduced() ? 30 : 140);
        }));
        actions.appendChild(btn('Cancel', null, 'is-quiet', function () { popTo(layers.length - 2); }));
        body.appendChild(actions);
      }
    });
  }

  function pushLspRemoveSheet(id) {
    var l = lspById(id);
    if (!l) return;
    push({
      id: 'lsp-remove-' + id,
      kind: 'lsp-remove',
      spineLabel: 'Remove',
      kicker: 'Language servers',
      title: 'Remove ' + l.language + '?',
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-para', 'The custom server entry is deleted from the registry. The command itself is yours and stays on disk untouched.'));
        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn('Remove the server', 'trash', 'is-primary', function () {
          var list = data().lsp;
          var at = list.indexOf(l);
          if (at >= 0) list.splice(at, 1);
          popTo(0);
          pushLspSheet();
          window.PMState.receipt('Server removed', l.language + ' was removed from the registry.');
        }));
        actions.appendChild(btn('Keep it', null, 'is-quiet', function () { popTo(layers.length - 2); }));
        body.appendChild(actions);
      }
    });
  }

  /* ============================================ formatters sheet stack
     Manager sheet > formatter detail sheet. The Test action runs the
     shared trigger and renders the real before/after sample. */

  var FMT_STATE_WORD = {
    'detected': { word: 'Ready', tone: 'ok' },
    'not-found': { word: 'Not found', tone: 'setup' },
    'disabled': { word: 'Turned off', tone: 'muted' }
  };

  function pushFormattersSheet() {
    push({
      id: 'formatters',
      kind: 'formatters',
      spineLabel: 'Formatters',
      kicker: 'Manager',
      title: 'Formatters',
      withSearch: true,
      route: mgrHash('formatters'),
      render: function (body) { renderFormatters(body); }
    });
  }

  function renderFormatters(body) {
    var fm = data().formatters;
    if (!fm) { body.appendChild(elm('p', 'fs-quiet', 'Formatter settings are not present in this scenario.')); return; }
    var entries = fm.entries || [];
    var ready = entries.filter(function (f) { return f.state === 'detected'; }).length;

    body.appendChild(elm('p', 'fs-para', 'Which formatter runs for each file type. ' + ready + ' of ' + entries.length + ' are ready right now.'));

    // Global enable + the format-on-save canonical row.
    var enRow = elm('div', 'fs-notice-actions');
    var enSw = elm('button', 'fs-switch');
    enSw.type = 'button';
    enSw.setAttribute('role', 'switch');
    enSw.setAttribute('aria-checked', fm.enabled ? 'true' : 'false');
    enSw.setAttribute('aria-label', 'Formatters enabled');
    enSw.addEventListener('click', function () {
      fm.enabled = !fm.enabled;
      enSw.setAttribute('aria-checked', fm.enabled ? 'true' : 'false');
      window.PMShell.status('Formatters ' + (fm.enabled ? 'enabled' : 'disabled') + '.');
    });
    enRow.appendChild(enSw);
    enRow.appendChild(elm('span', 'fs-stat', 'Formatters enabled'));
    body.appendChild(enRow);
    var fos = settingById('code.formatters.format-on-save');
    if (fos) body.appendChild(renderSettingRow(fos, {}));

    var addRow = elm('div', 'fs-notice-actions');
    addRow.appendChild(btn('Add a custom formatter', 'plus', null, function () { pushFormatterForm(null); }));
    addRow.appendChild(btn('Reset custom entries', 'undo', 'is-quiet', function () { pushFormatterResetSheet(); }));
    body.appendChild(addRow);

    if (!entries.length) {
      body.appendChild(emptyState('No formatters are registered. Built-ins appear when their commands are detected; custom entries can be added any time.'));
      return;
    }
    entries.forEach(function (f) {
      var sw = FMT_STATE_WORD[f.state] || { word: 'Unknown', tone: 'muted' };
      var status = [statusWordEl(sw.tone, sw.word)];
      if (!f.builtIn) status.push(chipEl('custom', 'Custom'));
      var note = f.command + ' · ' + (f.extensions || []).join(' ') +
        (f.state === 'not-found' && f.installHint ? ' · ' + f.installHint : '') +
        (f.state === 'disabled' && f.disabledNote ? ' · ' + f.disabledNote : '');
      body.appendChild(mrowBtn({
        id: 'fs-fmt-' + f.id,
        ico: 'wrench',
        title: f.name,
        tag: f.version ? 'v' + f.version : null,
        note: note,
        status: status,
        onOpen: function () { pushFormatterDetail(f.id); }
      }));
    });
  }

  function pushFormatterDetail(id) {
    var f = formatterById(id);
    if (!f) return;
    push({
      id: 'fmt-' + id,
      kind: 'formatter',
      spineLabel: f.name,
      kicker: 'Formatter',
      title: f.name,
      route: mgrHash('formatters', id),
      render: function (body) { renderFormatterDetail(body, id); }
    });
  }

  function renderFormatterDetail(body, id) {
    var f = formatterById(id);
    if (!f) { body.appendChild(elm('p', 'fs-quiet', 'This formatter is not present in the current scenario.')); return; }
    var sw = FMT_STATE_WORD[f.state] || { word: 'Unknown', tone: 'muted' };

    var st = elm('div', 'fs-notice-actions');
    st.appendChild(statusWordEl(sw.tone, sw.word));
    if (f.version) st.appendChild(elm('span', 'fs-quiet', 'Version ' + f.version));
    body.appendChild(st);
    if (f.state === 'not-found' && f.installHint) {
      var hint = elm('div', 'fs-managed-note');
      hint.appendChild(icoEl('info'));
      hint.appendChild(elm('span', null, f.installHint + ' Detection re-runs automatically once the command exists.'));
      body.appendChild(hint);
    }
    if (f.state === 'disabled' && f.disabledNote) body.appendChild(elm('p', 'fs-quiet', f.disabledNote));
    body.appendChild(opLine(f.id));

    body.appendChild(sectionTitle('How it runs'));
    var facts = elm('dl', 'fs-facts');
    factInto(facts, 'Command', f.command);
    factInto(facts, 'Environment', f.env && Object.keys(f.env).length ? Object.keys(f.env).map(function (k) { return k + '=' + f.env[k]; }).join(' · ') : 'Inherits the project environment');
    factInto(facts, 'File types', (f.extensions || []).join('  '));
    body.appendChild(facts);

    // Scope: Global vs Project, live.
    body.appendChild(sectionTitle('Scope'));
    body.appendChild(radioGroup('Scope for ' + f.name,
      [{ v: 'project', label: 'This project' }, { v: 'global', label: 'All projects' }],
      f.scope, function (v) {
        f.scope = v;
        window.PMShell.status(f.name + ' scope: ' + (v === 'project' ? 'this project' : 'all projects') + '.');
      }));

    // Health & test: the real trigger, the real sample.
    body.appendChild(sectionTitle('Health & test'));
    if (f.lastTest) {
      body.appendChild(elm('p', 'fs-quiet', 'Last test ' + fmtWhen(f.lastTest.when) + (f.lastTest.ok ? ' — the sample formatted cleanly.' : ' — the test failed.')));
      if (f.lastTest.sample) {
        var sampleWrap = elm('div', 'fs-sample');
        var beforeCol = elm('div');
        beforeCol.appendChild(elm('div', 'fs-sample-label', 'Before'));
        beforeCol.appendChild(codeEl(f.lastTest.sample.before));
        var afterCol = elm('div');
        afterCol.appendChild(elm('div', 'fs-sample-label', 'After'));
        afterCol.appendChild(codeEl(f.lastTest.sample.after));
        sampleWrap.appendChild(beforeCol);
        sampleWrap.appendChild(afterCol);
        body.appendChild(sampleWrap);
      }
    } else {
      body.appendChild(elm('p', 'fs-quiet', 'No test has run yet. The test formats a small sample in a scratch buffer; project files are never touched.'));
    }
    var actions = elm('div', 'fs-notice-actions');
    if (f.state === 'detected') {
      actions.appendChild(btn('Test on a sample', 'play', 'is-primary', function () {
        window.PMState.trigger('formatter-test', f.id);
      }));
    } else if (f.state === 'disabled') {
      actions.appendChild(btn('Turn on', 'check', 'is-primary', function () {
        f.state = 'detected';
        delete f.disabledNote;
        rerenderLayer(currentTop());
        window.PMState.receipt('Formatter enabled', f.name + ' will run for its file types again.');
      }));
    }
    if (f.state === 'detected') {
      actions.appendChild(btn('Turn off', 'pause', 'is-quiet', function () {
        f.state = 'disabled';
        f.disabledNote = 'Turned off here. The command stays installed.';
        rerenderLayer(currentTop());
        window.PMState.receipt('Formatter disabled', f.name + ' will not run until turned on again.');
      }));
    }
    if (!f.builtIn) {
      actions.appendChild(btn('Edit', 'edit', 'is-quiet', function () { pushFormatterForm(f.id); }));
      actions.appendChild(btn('Remove', 'trash', 'is-quiet', function () {
        var list = data().formatters.entries;
        var at = list.indexOf(f);
        if (at >= 0) list.splice(at, 1);
        popTo(0);
        pushFormattersSheet();
        window.PMState.receipt('Formatter removed', f.name + ' was removed. The command itself stays on disk.');
      }));
    }
    body.appendChild(actions);
  }

  function pushFormatterForm(existingId) {
    var existing = existingId ? formatterById(existingId) : null;
    push({
      id: existing ? 'fmt-edit-' + existingId : 'fmt-add',
      kind: 'formatter-form',
      spineLabel: existing ? 'Edit' : 'Add formatter',
      kicker: 'Formatters',
      title: existing ? 'Edit ' + existing.name : 'Add a custom formatter',
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'A custom formatter runs your command over the saved file. Detection checks that the command resolves before the entry goes live.'));
        var nameIn = formField(body, 'Name', existing ? existing.name : '', 'e.g. taplo');
        var cmdIn = formField(body, 'Command', existing ? existing.command : '', 'e.g. taplo fmt', true);
        var extIn = formField(body, 'File extensions (space separated)', existing ? (existing.extensions || []).join(' ') : '', 'e.g. .toml', true);
        var err = elm('p', 'fs-form-error');
        err.hidden = true;
        body.appendChild(err);
        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn(existing ? 'Save changes' : 'Add formatter', 'check', 'is-primary', function () {
          var name = nameIn.value.trim();
          var cmd = cmdIn.value.trim();
          var exts = extIn.value.trim().split(/\s+/).filter(Boolean);
          if (!name || !cmd || !exts.length) {
            err.hidden = false;
            err.textContent = !name ? 'A name is required.' : (!cmd ? 'A command is required.' : 'At least one file extension is required.');
            return;
          }
          if (existing) {
            existing.name = name; existing.command = cmd; existing.extensions = exts;
            window.PMState.receipt('Formatter updated', name + ' saved.');
          } else {
            data().formatters.entries.push({
              id: 'fmt-custom-' + Date.now().toString(36),
              name: name, builtIn: false, state: 'detected', version: null,
              command: cmd, env: {}, extensions: exts, scope: 'project', lastTest: null
            });
            window.PMState.receipt('Formatter added', name + ': the command resolved on this computer. Run a sample test before trusting it on save.');
          }
          popTo(layers.length - 2);
          window.setTimeout(function () { rerenderLayer(currentTop()); }, motionReduced() ? 30 : 140);
        }));
        actions.appendChild(btn('Cancel', null, 'is-quiet', function () { popTo(layers.length - 2); }));
        body.appendChild(actions);
      }
    });
  }

  function pushFormatterResetSheet() {
    push({
      id: 'fmt-reset',
      kind: 'formatter-reset',
      spineLabel: 'Reset',
      kicker: 'Formatters',
      title: 'Reset custom entries?',
      half: true,
      render: function (body) {
        var customs = (data().formatters.entries || []).filter(function (f) { return !f.builtIn; });
        body.appendChild(elm('p', 'fs-para', customs.length
          ? 'This removes ' + customs.length + ' custom ' + plural(customs.length, 'entry', 'entries') + ' and keeps every built-in exactly as detected. Commands on disk are untouched.'
          : 'There are no custom entries to remove. Built-ins are already in their detected state.'));
        var actions = elm('div', 'fs-notice-actions');
        if (customs.length) {
          actions.appendChild(btn('Reset', 'undo', 'is-primary', function () {
            data().formatters.entries = data().formatters.entries.filter(function (f) { return f.builtIn; });
            popTo(layers.length - 2);
            window.setTimeout(function () { rerenderLayer(currentTop()); }, motionReduced() ? 30 : 140);
            window.PMState.receipt('Custom formatters removed', 'The table is back to detected built-ins.');
          }));
        }
        actions.appendChild(btn(customs.length ? 'Keep them' : 'Close', null, 'is-quiet', function () { popTo(layers.length - 2); }));
        body.appendChild(actions);
      }
    });
  }

  /* ==================================== commands & shortcuts stack
     Manager sheet > command editor sheet > dry-run preview sheet, and
     manager sheet > recorder sheet for remaps. A dry run NEVER sends work
     to an agent — the preview expands the command locally and stops. */

  function commandByName(name) {
    var list = (data().commandsInfo || {}).customCommands || [];
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].name === name) return list[i];
    return null;
  }

  function normalizeCombo(keys) { return String(keys || '').toLowerCase().replace(/\s+/g, ''); }

  function shortcutConflicts(combo, exclude) {
    var out = [];
    ((data().commandsInfo || {}).shortcuts || []).forEach(function (sc) {
      if (sc !== exclude && normalizeCombo(sc.keys) === normalizeCombo(combo)) out.push(sc);
    });
    return out;
  }

  var RISKY_COMMAND_PATTERNS = [
    { re: /rm\s+-rf?\b/, note: 'deletes recursively' },
    { re: /--force\b|-f\b.*push|push\s+--force/, note: 'force-pushes or overwrites' },
    { re: /sudo\b/, note: 'escalates privileges' },
    { re: />\s*\/dev\/|mkfs|dd\s+if=/, note: 'writes to devices' }
  ];

  function commandRiskNote(runs) {
    for (var i = 0; i < RISKY_COMMAND_PATTERNS.length; i++) {
      if (RISKY_COMMAND_PATTERNS[i].re.test(String(runs))) return RISKY_COMMAND_PATTERNS[i].note;
    }
    return null;
  }

  function pushCommandsSheet() {
    push({
      id: 'commands',
      kind: 'commands',
      spineLabel: 'Commands',
      kicker: 'Manager',
      title: 'Commands & Shortcuts',
      withSearch: true,
      route: mgrHash('commands'),
      render: function (body) { renderCommands(body); }
    });
  }

  function renderCommands(body) {
    var ci = data().commandsInfo || {};

    body.appendChild(sectionTitle('Custom commands'));
    body.appendChild(elm('p', 'fs-quiet', 'Slash commands that run a shell line you wrote. They run with your permissions, under the same permission rules as any other shell work.'));
    var addRow = elm('div', 'fs-notice-actions');
    addRow.appendChild(btn('New command', 'plus', null, function () { pushCommandEditor(null); }));
    body.appendChild(addRow);
    var cmds = ci.customCommands || [];
    if (!cmds.length) {
      body.appendChild(emptyState('No custom commands yet. A command is a name, a shell line, and a scope — nothing more mysterious than that.'));
    }
    cmds.forEach(function (c) {
      body.appendChild(mrowBtn({
        id: 'fs-cmd-' + c.name.replace(/\W/g, ''),
        ico: 'terminal',
        title: c.name,
        note: c.runs,
        status: [chipEl(c.scope === 'Project' ? 'custom' : 'default', c.scope === 'Project' ? 'This project' : 'All projects')],
        onOpen: function () { pushCommandEditor(c.name); }
      }));
    });

    body.appendChild(sectionTitle('Keyboard shortcuts'));

    // The conflict surface leads: unresolved collisions are never buried.
    (ci.conflicts || []).forEach(function (conf) {
      var card = elm('article', 'fs-notice');
      card.setAttribute('data-tone', 'attention');
      var stRow = elm('div', 'fs-notice-status');
      stRow.appendChild(statusWordEl('attention', 'Shortcut conflict'));
      card.appendChild(stRow);
      var head = elm('div', 'fs-notice-headline');
      head.appendChild(kbdEl(conf.keys));
      head.appendChild(document.createTextNode(' is claimed twice'));
      card.appendChild(head);
      card.appendChild(elm('div', 'fs-notice-consequence', conf.between.join('  vs.  ') + '. ' + conf.resolution + '.'));
      var acts = elm('div', 'fs-notice-actions');
      acts.appendChild(btn('Resolve', 'arrowR', 'is-primary', function () { pushConflictSheet(conf); }));
      card.appendChild(acts);
      body.appendChild(card);
    });

    var filterWrap = elm('div', 'fs-head-search');
    filterWrap.style.maxWidth = '320px';
    filterWrap.style.margin = '4px 0 8px';
    filterWrap.appendChild(icoEl('search'));
    var filter = elm('input');
    filter.type = 'search';
    filter.placeholder = 'Filter shortcuts';
    filter.setAttribute('aria-label', 'Filter shortcuts');
    filterWrap.appendChild(filter);
    body.appendChild(filterWrap);

    var listWrap = elm('div');
    body.appendChild(listWrap);

    function drawShortcuts() {
      var q = filter.value.trim().toLowerCase();
      listWrap.innerHTML = '';
      var rows = (ci.shortcuts || []).filter(function (sc) {
        if (!q) return true;
        return (sc.keys + ' ' + sc.command + ' ' + sc.scope).toLowerCase().indexOf(q) >= 0;
      });
      if (!rows.length) {
        listWrap.appendChild(elm('p', 'fs-quiet', 'No shortcuts match that filter.'));
        return;
      }
      rows.forEach(function (sc) {
        var row = elm('div', 'fs-shortcut');
        var keys = elm('span', 'fs-shortcut-keys');
        keys.appendChild(kbdEl(sc.keys));
        row.appendChild(keys);
        var label = elm('span', 'fs-shortcut-label');
        label.appendChild(elm('span', null, sc.command));
        label.appendChild(elm('span', 'fs-shortcut-scope', sc.scope));
        row.appendChild(label);
        var acts = elm('span', 'fs-shortcut-acts');
        if (sc.originalKeys && sc.originalKeys !== sc.keys) {
          acts.appendChild(btn('Reset', 'undo', 'is-quiet', function () {
            sc.keys = sc.originalKeys;
            delete sc.originalKeys;
            drawShortcuts();
            window.PMState.receipt('Shortcut reset', sc.command + ' is back on its default binding.');
          }));
        }
        acts.appendChild(btn('Remap', 'keyboard', 'is-quiet', function () { pushRecorderSheet(sc); }));
        row.appendChild(acts);
        listWrap.appendChild(row);
      });
    }
    filter.addEventListener('input', drawShortcuts);
    drawShortcuts();

    var tail = elm('div', 'fs-notice-actions');
    tail.appendChild(btn('Cheat sheet', 'doc', null, function () { pushCheatSheet(); }));
    tail.appendChild(btn('Export keymap', 'download', 'is-quiet', function () {
      window.PMState.receipt('Export keymap', 'A portable keymap file with ' + ((ci.shortcuts || []).length) + ' bindings would save to your chosen location.');
    }));
    tail.appendChild(btn('Import keymap', 'upload', 'is-quiet', function () {
      window.PMState.receipt('Import keymap', 'An import previews every change and flags conflicts before anything applies — same contract as settings import.');
    }));
    body.appendChild(tail);
  }

  function pushCommandEditor(existingName) {
    var existing = existingName ? commandByName(existingName) : null;
    push({
      id: existing ? 'cmd-edit-' + existingName.replace(/\W/g, '') : 'cmd-add',
      kind: 'command-editor',
      spineLabel: existing ? existing.name : 'New command',
      kicker: 'Commands & Shortcuts',
      title: existing ? 'Edit ' + existing.name : 'New command',
      half: true,
      render: function (body) {
        var nameIn = formField(body, 'Name (starts with /)', existing ? existing.name : '', '/deploy');
        var runsIn = formField(body, 'Runs', existing ? existing.runs : '', 'e.g. python3 scripts/deploy.py {branch}', true);
        body.appendChild(elm('p', 'fs-quiet', 'Parameters: {file}, {selection}, and {branch} expand at run time. Includes: reference another command with @name to reuse its line.'));

        var scopeVal = { v: existing ? existing.scope : 'Project' };
        body.appendChild(radioGroup('Scope',
          [{ v: 'Project', label: 'This project' }, { v: 'Global', label: 'All projects' }],
          scopeVal.v, function (v) { scopeVal.v = v; }));

        var safety = elm('div', 'fs-caution');
        var ch = elm('div', 'fs-caution-head');
        ch.appendChild(icoEl('shield'));
        ch.appendChild(elm('span', null, 'Shell safety'));
        safety.appendChild(ch);
        safety.appendChild(elm('div', 'fs-caution-body', 'The line runs in your shell with your permissions. Permission rules and FileSafe still apply; risky patterns are flagged below before you save.'));
        body.appendChild(safety);

        var err = elm('p', 'fs-form-error');
        err.hidden = true;
        body.appendChild(err);
        var warn = elm('p', 'fs-quiet');
        warn.hidden = true;
        body.appendChild(warn);
        runsIn.addEventListener('input', function () {
          var risk = commandRiskNote(runsIn.value);
          warn.hidden = !risk;
          if (risk) warn.textContent = 'Heads up: this line ' + risk + '. It will always ask before running.';
        });

        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn(existing ? 'Save changes' : 'Create command', 'check', 'is-primary', function () {
          var name = nameIn.value.trim();
          var runs = runsIn.value.trim();
          if (!/^\/[a-z0-9-]+$/i.test(name)) { err.hidden = false; err.textContent = 'Names start with / and use letters, digits, or dashes — like /gates.'; return; }
          if (!runs) { err.hidden = false; err.textContent = 'The command needs a shell line to run.'; return; }
          var dupe = commandByName(name);
          if (dupe && dupe !== existing) { err.hidden = false; err.textContent = name + ' already exists. Names must be unique.'; return; }
          if (existing) {
            existing.name = name; existing.runs = runs; existing.scope = scopeVal.v;
            window.PMState.receipt('Command saved', name + ' updated.');
          } else {
            data().commandsInfo.customCommands.push({ name: name, runs: runs, scope: scopeVal.v });
            window.PMState.receipt('Command created', name + ' is available in the palette under its scope.');
          }
          popTo(layers.length - 2);
          window.setTimeout(function () { rerenderLayer(currentTop()); }, motionReduced() ? 30 : 140);
        }));
        actions.appendChild(btn('Preview (dry run)', 'eye', null, function () {
          pushDryRunSheet({ name: nameIn.value.trim() || '(unnamed)', runs: runsIn.value.trim(), scope: scopeVal.v });
        }));
        if (existing) {
          actions.appendChild(btn('Delete', 'trash', 'is-quiet', function () {
            var list = data().commandsInfo.customCommands;
            var at = list.indexOf(existing);
            if (at >= 0) list.splice(at, 1);
            popTo(layers.length - 2);
            window.setTimeout(function () { rerenderLayer(currentTop()); }, motionReduced() ? 30 : 140);
            window.PMState.receipt('Command deleted', existing.name + ' was removed.');
          }));
        }
        body.appendChild(actions);
      }
    });
  }

  /* Dry run: expansion only. Nothing executes, nothing queues, and no
     agent is ever involved — that sentence is part of the surface. */
  function pushDryRunSheet(cmd) {
    push({
      id: 'dryrun',
      kind: 'dryrun',
      spineLabel: 'Dry run',
      kicker: 'Command preview',
      title: 'Dry run: ' + cmd.name,
      half: true,
      render: function (body) {
        var promise = elm('div', 'fs-managed-note');
        promise.appendChild(icoEl('shield'));
        promise.appendChild(elm('span', null, 'A dry run never sends work to an agent. Nothing executes, nothing is queued, and no model sees this. The preview expands the command locally and stops.'));
        body.appendChild(promise);

        var expanded = String(cmd.runs || '')
          .replace(/\{file\}/g, 'Concepts/settings-redesign-concepts/fable/c3-focus-stack.js')
          .replace(/\{selection\}/g, '"pushDryRunSheet"')
          .replace(/\{branch\}/g, 'main');
        body.appendChild(sectionTitle('Expansion'));
        body.appendChild(codeEl(expanded || '(empty command line)'));
        var facts = elm('dl', 'fs-facts');
        factInto(facts, 'Working directory', '/mnt/projects/Puppet-Master');
        factInto(facts, 'Environment', 'Project environment, minus provider keys');
        factInto(facts, 'Scope', cmd.scope === 'Project' ? 'This project' : 'All projects');
        var risk = commandRiskNote(cmd.runs);
        factInto(facts, 'On a real run', risk ? 'Would ask first — the line ' + risk + '.' : 'Runs under the current permission rules; matching allow rules apply.');
        body.appendChild(facts);
        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn('Copy expansion', 'copy', null, function () {
          window.PMState.receipt('Copied', 'The expanded line is on the clipboard. It has not been run.');
        }));
        body.appendChild(actions);
        body.appendChild(elm('p', 'fs-quiet', 'There is deliberately no run button on this sheet.'));
      }
    });
  }

  function pushConflictSheet(conf) {
    push({
      id: 'conflict-' + normalizeCombo(conf.keys),
      kind: 'conflict',
      spineLabel: 'Conflict',
      kicker: 'Keyboard shortcuts',
      title: 'Resolve ' + conf.keys,
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-para', 'Two bindings claim the same keys. Pick which one keeps them; the other is suspended until it gets a new binding.'));
        var chosen = { v: conf.between[0] };
        body.appendChild(radioGroup('Which binding wins',
          conf.between.map(function (name) { return { v: name, label: name }; }),
          chosen.v, function (v) { chosen.v = v; }));
        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn('Apply resolution', 'check', 'is-primary', function () {
          conf.resolution = chosen.v + ' keeps ' + conf.keys + '; the other binding is suspended and flagged here';
          popTo(layers.length - 2);
          window.setTimeout(function () { rerenderLayer(currentTop()); }, motionReduced() ? 30 : 140);
          window.PMState.receipt('Conflict resolved', chosen.v + ' keeps ' + conf.keys + '. The losing binding is suspended, not silently dropped.');
        }));
        actions.appendChild(btn('Leave as is', null, 'is-quiet', function () { popTo(layers.length - 2); }));
        body.appendChild(actions);
      }
    });
  }

  /* The recorder: functional key capture with a live conflict check.
     Slint note: maps to a FocusScope consuming key events while armed. */
  function pushRecorderSheet(sc) {
    push({
      id: 'recorder',
      kind: 'recorder',
      spineLabel: 'Record keys',
      kicker: 'Remap · ' + sc.command,
      title: 'Press the new keys',
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'Click the capture area, then press a combination. Escape cancels capture (so Escape itself cannot be recorded).'));
        var state = { combo: '' };
        var zone = elm('div', 'fs-capture');
        zone.tabIndex = 0;
        zone.setAttribute('role', 'application');
        zone.setAttribute('aria-label', 'Shortcut capture area. Press a key combination.');
        var comboLine = elm('div', 'fs-capture-keys');
        comboLine.appendChild(elm('span', 'fs-quiet', 'Waiting for keys — currently ' + sc.keys));
        zone.appendChild(comboLine);
        body.appendChild(zone);
        var conflictLine = elm('p', 'fs-form-error');
        conflictLine.hidden = true;
        body.appendChild(conflictLine);

        var actions = elm('div', 'fs-notice-actions');
        var applyBtn = btn('Apply binding', 'check', 'is-primary', function () {
          if (!state.combo) return;
          var clash = shortcutConflicts(state.combo, sc);
          if (clash.length) {
            conflictLine.hidden = false;
            conflictLine.textContent = state.combo + ' is already bound to "' + clash[0].command + '". Pick different keys, or free that binding first.';
            return;
          }
          if (!sc.originalKeys) sc.originalKeys = sc.keys;
          sc.keys = state.combo;
          popTo(layers.length - 2);
          window.setTimeout(function () { rerenderLayer(currentTop()); }, motionReduced() ? 30 : 140);
          window.PMState.receipt('Shortcut remapped', sc.command + ' is now ' + sc.keys + '. Reset restores the default any time.');
        });
        applyBtn.disabled = true;
        actions.appendChild(applyBtn);
        actions.appendChild(btn('Cancel', null, 'is-quiet', function () { popTo(layers.length - 2); }));
        body.appendChild(actions);

        zone.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') { e.stopPropagation(); state.combo = ''; comboLine.innerHTML = ''; comboLine.appendChild(elm('span', 'fs-quiet', 'Capture cancelled — press keys to try again.')); applyBtn.disabled = true; return; }
          e.preventDefault();
          e.stopPropagation();
          var parts = [];
          if (e.metaKey) parts.push('Cmd');
          if (e.ctrlKey) parts.push('Ctrl');
          if (e.altKey) parts.push('Alt');
          if (e.shiftKey) parts.push('Shift');
          var main = e.key;
          if (['Meta', 'Control', 'Alt', 'Shift'].indexOf(main) >= 0) main = null;
          if (main === ' ') main = 'Space';
          if (main && main.length === 1) main = main.toUpperCase();
          if (main) parts.push(main);
          state.combo = parts.join('+');
          comboLine.innerHTML = '';
          comboLine.appendChild(kbdEl(state.combo));
          var clash = main ? shortcutConflicts(state.combo, sc) : [];
          if (clash.length) {
            conflictLine.hidden = false;
            conflictLine.textContent = state.combo + ' is already bound to "' + clash[0].command + '" (' + clash[0].scope + ').';
          } else {
            conflictLine.hidden = true;
          }
          applyBtn.disabled = !main;
        });
        window.setTimeout(function () { try { zone.focus(); } catch (e2) { /* ignore */ } }, motionReduced() ? 30 : 160);
      }
    });
  }

  function pushCheatSheet() {
    push({
      id: 'cheatsheet',
      kind: 'cheatsheet',
      spineLabel: 'Cheat sheet',
      kicker: 'Keyboard shortcuts',
      title: 'Every binding at a glance',
      half: true,
      render: function (body) {
        var byScope = {};
        ((data().commandsInfo || {}).shortcuts || []).forEach(function (sc) {
          (byScope[sc.scope] = byScope[sc.scope] || []).push(sc);
        });
        Object.keys(byScope).forEach(function (scope) {
          body.appendChild(sectionTitle(scope));
          byScope[scope].forEach(function (sc) {
            var row = elm('div', 'fs-shortcut is-cheat');
            var keys = elm('span', 'fs-shortcut-keys');
            keys.appendChild(kbdEl(sc.keys));
            row.appendChild(keys);
            row.appendChild(elm('span', 'fs-shortcut-label', sc.command));
            body.appendChild(row);
          });
        });
        body.appendChild(elm('p', 'fs-quiet', 'Printable in the full app; here it stays a quiet reference sheet.'));
      }
    });
  }

  /* ================================================ MCP sheet stack
     Server list sheet > server detail sheet > logs sheet, plus the add
     form. Built from PM_DATA.mcp; approval, lazy exposure, protocol, and
     discovery cache are all shown honestly. */

  function mcpHealthWord(sv) {
    if (sv.reconnectRequired) return { word: 'Reconnect required', tone: 'attention' };
    if (sv.health === 'connecting') return { word: 'Connecting', tone: 'progress' };
    if (sv.health === 'connected' && sv.state !== 'disconnected') return { word: 'Connected', tone: 'ok' };
    if (sv.health === 'added') return { word: 'Not connected yet', tone: 'setup' };
    return { word: 'Disconnected', tone: 'attention' };
  }

  var APPROVAL_HUMAN = {
    'once': 'Ask every time',
    'session': 'Ask once per session',
    'persistent': 'Approved persistently'
  };

  function pushMcpSheet() {
    push({
      id: 'mcp',
      kind: 'mcp',
      spineLabel: 'Servers',
      kicker: 'Manager',
      title: 'Connected Servers',
      withSearch: true,
      route: mgrHash('mcp'),
      render: function (body) { renderMcpList(body); }
    });
  }

  function renderMcpList(body) {
    var servers = data().mcp || [];
    body.appendChild(elm('p', 'fs-para', 'Tool servers speaking MCP. Each row states its transport, how many tools it exposes, and whether the discovery cache is fresh.'));
    var addRow = elm('div', 'fs-notice-actions');
    addRow.appendChild(btn('Add a server', 'plus', null, function () { pushMcpForm(); }));
    body.appendChild(addRow);

    if (!servers.length) {
      body.appendChild(emptyState('No servers are connected yet. Adding one registers its transport and endpoint; connecting and discovering tools comes after, as its own honest step.'));
      return;
    }
    servers.forEach(function (sv) {
      var hw = mcpHealthWord(sv);
      var exposed = (sv.tools || []).filter(function (t) { return t.exposed; }).length;
      var status = [statusWordEl(hw.tone, hw.word), chipEl('custom', sv.transport)];
      if (sv.cache && sv.cache.freshness === 'stale') status.push(chipEl('not-configured', 'Cache stale'));
      body.appendChild(mrowBtn({
        id: 'fs-mcp-' + sv.id,
        ico: 'plug',
        title: sv.name,
        tag: sv.scope === 'project' ? 'This project' : 'All projects',
        note: (sv.stateNote ? sv.stateNote + ' · ' : '') + exposed + ' of ' + (sv.tools || []).length + ' tools exposed · ' + sv.auth,
        status: status,
        onOpen: function () { pushMcpDetail(sv.id); }
      }));
    });
  }

  function pushMcpDetail(id) {
    var sv = mcpById(id);
    if (!sv) return;
    push({
      id: 'mcp-' + id,
      kind: 'mcp-detail',
      spineLabel: sv.name,
      kicker: 'Connected server',
      title: sv.name,
      route: mgrHash('mcp', id),
      render: function (body) { renderMcpDetail(body, id); }
    });
  }

  function mcpReconnect(id) {
    var sv = mcpById(id);
    if (!sv) return;
    sv.health = 'connecting';
    rerenderLayer(currentTop());
    window.PMShell.status('Reconnecting to ' + sv.name + '…');
    // Wired to the shared reconnect trigger for its truthful phase events;
    // the MCP-side state lands here when the staged phases settle.
    window.PMState.trigger('reconnect', 'mcp:' + id).then(function () {
      var s2 = mcpById(id);
      if (!s2) return;
      s2.health = 'connected';
      s2.state = 'connected';
      delete s2.reconnectRequired;
      s2.stateNote = null;
      s2.protocol = s2.protocol || {};
      if (!s2.protocol.negotiated) s2.protocol.negotiated = s2.protocol.requested;
      s2.cache = s2.cache || {};
      s2.cache.lastDiscovery = 'moments ago';
      s2.cache.freshness = 'fresh';
      s2.cache.note = 'Tools and resources were rediscovered on this connect.';
      s2.logsSample = s2.logsSample || [];
      s2.logsSample.unshift('reconnected; ' + (s2.tools || []).length + ' tools rediscovered');
      window.PMState.receipt('Server reconnected', s2.name + ' negotiated protocol ' + (s2.protocol.negotiated || 'unknown') + ' and rediscovered its tools.');
      rerenderAll();
    });
  }

  function renderMcpDetail(body, id) {
    var sv = mcpById(id);
    if (!sv) { body.appendChild(elm('p', 'fs-quiet', 'This server is not present in the current scenario.')); return; }
    var hw = mcpHealthWord(sv);

    var st = elm('div', 'fs-notice-actions');
    st.appendChild(statusWordEl(hw.tone, hw.word));
    if (sv.stateNote) st.appendChild(elm('span', 'fs-quiet', sv.stateNote));
    body.appendChild(st);
    body.appendChild(opLine('mcp:' + id));
    if (hw.word !== 'Connected') {
      var reAct = elm('div', 'fs-notice-actions');
      reAct.appendChild(btn('Reconnect now', 'plug', 'is-primary', function () { mcpReconnect(id); }));
      body.appendChild(reAct);
    }

    body.appendChild(sectionTitle('Connection'));
    var facts = elm('dl', 'fs-facts');
    factInto(facts, 'Transport', sv.transport);
    factInto(facts, 'Authentication', sv.auth);
    factInto(facts, 'Scope', sv.scope === 'project' ? 'This project' : 'All projects');
    var proto = sv.protocol || {};
    if (proto.requested && proto.negotiated && proto.requested !== proto.negotiated) {
      factInto(facts, 'Protocol requested', proto.requested);
      var pf = elm('div', 'fs-fact is-attention');
      pf.appendChild(elm('dt', null, 'Protocol negotiated'));
      pf.appendChild(elm('dd', null, proto.negotiated + ' — the server speaks an older revision; features from the newer one stay off.'));
      facts.appendChild(pf);
    } else {
      factInto(facts, 'Protocol', proto.negotiated ? proto.negotiated + ' (as requested)' : (proto.requested ? proto.requested + ' requested — nothing negotiated while disconnected' : 'Unknown'));
    }
    if (sv.projection) factInto(facts, 'Projection', sv.projection.claudeCli ? 'Also projected read-only into the Claude CLI config; Puppet Master remains the owner.' : 'Used by Puppet Master only.');
    body.appendChild(facts);

    body.appendChild(sectionTitle('Tools'));
    if (sv.lazyExposure) body.appendChild(elm('p', 'fs-quiet', 'Exposure is lazy: agents see only tool names until a tool is first used, so an idle server costs no context.'));
    if (!(sv.tools || []).length) {
      body.appendChild(elm('p', 'fs-quiet', 'No tools discovered yet. Tools appear after the first successful connect.'));
    }
    (sv.tools || []).forEach(function (t) {
      body.appendChild(toggleRow(t.name, null, t.exposed, function (next) {
        t.exposed = next;
        window.PMShell.status(t.name + (t.exposed ? ' exposed to agents.' : ' hidden from agents.') +
          (hw.word === 'Connected' ? '' : ' Takes effect at the next connect.'));
      }));
    });

    // Approval policy: server default plus per-tool overrides.
    body.appendChild(sectionTitle('Approval'));
    var appr = sv.approval || (sv.approval = { mode: 'once' });
    body.appendChild(radioGroup('Approval policy',
      ['once', 'session', 'persistent'].map(function (m) { return { v: m, label: APPROVAL_HUMAN[m] }; }),
      appr.mode, function (v) {
        appr.mode = v;
        window.PMShell.status(sv.name + ' approval: ' + APPROVAL_HUMAN[v] + '.');
      }));
    if ((sv.tools || []).length) {
      body.appendChild(elm('p', 'fs-quiet', 'Per-tool overrides, when a single tool deserves a stricter answer:'));
      var ofacts = elm('dl', 'fs-facts');
      (sv.tools || []).forEach(function (t) {
        var f = elm('div', 'fs-fact');
        f.appendChild(elm('dt', null, t.name));
        var dd = elm('dd');
        var sel = elm('select', 'fs-select');
        sel.setAttribute('aria-label', 'Approval for ' + t.name);
        [{ v: '', l: 'Server policy' }, { v: 'once', l: APPROVAL_HUMAN.once }, { v: 'session', l: APPROVAL_HUMAN.session }, { v: 'persistent', l: APPROVAL_HUMAN.persistent }].forEach(function (o) {
          var opt = elm('option', null, o.l);
          opt.value = o.v;
          if (((appr.perTool || {})[t.name] || '') === o.v) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.addEventListener('change', function () {
          appr.perTool = appr.perTool || {};
          if (sel.value) appr.perTool[t.name] = sel.value;
          else delete appr.perTool[t.name];
          window.PMShell.status(t.name + ': ' + (sel.value ? APPROVAL_HUMAN[sel.value] : 'follows the server policy') + '.');
        });
        dd.appendChild(sel);
        f.appendChild(dd);
        ofacts.appendChild(f);
      });
      body.appendChild(ofacts);
    }

    // Discovered resources and templates.
    if ((sv.resources || []).length) {
      body.appendChild(sectionTitle('Resources & templates'));
      sv.resources.forEach(function (res) {
        var row = elm('div', 'fs-row');
        var main = elm('div', 'fs-row-main');
        var lab = elm('div', 'fs-row-label');
        lab.appendChild(elm('span', null, res.name));
        main.appendChild(lab);
        if (res.note) main.appendChild(elm('div', 'fs-row-desc', res.note));
        row.appendChild(main);
        var chips = elm('div', 'fs-row-chips');
        chips.appendChild(chipEl(res.kind === 'template' ? 'custom' : 'default', res.kind === 'template' ? 'Template — takes a parameter' : 'Resource'));
        row.appendChild(chips);
        body.appendChild(row);
      });
    }
    if ((sv.extensions || []).length) {
      body.appendChild(sectionTitle('Server extensions'));
      sv.extensions.forEach(function (x) {
        body.appendChild(elm('p', 'fs-quiet', x.name + ' — ' + x.note));
      });
    }

    // Discovery cache freshness.
    body.appendChild(sectionTitle('Discovery cache'));
    var cache = sv.cache || {};
    var cfacts = elm('dl', 'fs-facts');
    factInto(cfacts, 'Last discovery', cache.lastDiscovery || 'Never');
    var ff = elm('div', 'fs-fact' + (cache.freshness === 'stale' ? ' is-attention' : ''));
    ff.appendChild(elm('dt', null, 'Freshness'));
    ff.appendChild(elm('dd', null, (cache.freshness === 'fresh' ? 'Fresh' : (cache.freshness === 'stale' ? 'Stale' : 'No cache yet')) + (cache.note ? ' — ' + cache.note : '')));
    cfacts.appendChild(ff);
    body.appendChild(cfacts);
    var cacheActs = elm('div', 'fs-notice-actions');
    cacheActs.appendChild(btn('Rediscover now', 'refresh', null, function () {
      if (mcpHealthWord(sv).word !== 'Connected') {
        window.PMState.receipt('Rediscovery unavailable', sv.name + ' is not connected; discovery needs a live connection. The stale cache stays readable.');
        return;
      }
      sv.cache = sv.cache || {};
      sv.cache.lastDiscovery = 'moments ago';
      sv.cache.freshness = 'fresh';
      sv.cache.note = 'Tools and resources were rediscovered on demand.';
      rerenderLayer(currentTop());
      window.PMState.receipt('Rediscovery complete', sv.name + ': ' + (sv.tools || []).length + ' tools and ' + (sv.resources || []).length + ' resources confirmed.');
    }));
    cacheActs.appendChild(btn('View logs', 'doc', 'is-quiet', function () { pushMcpLogsSheet(sv.id); }));
    body.appendChild(cacheActs);
  }

  function pushMcpLogsSheet(id) {
    var sv = mcpById(id);
    if (!sv) return;
    push({
      id: 'mcp-logs-' + id,
      kind: 'mcp-logs',
      spineLabel: 'Logs',
      kicker: 'Connected server · ' + sv.name,
      title: 'Connection log',
      half: true,
      route: mgrHash('mcp', id + '/logs'),
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'The last connection events. Read-only; reconnect attempts and back-off decisions land here.'));
        var events = sv.logsSample || [];
        if (!events.length) {
          body.appendChild(elm('p', 'fs-quiet', 'No log lines recorded for this server yet.'));
          return;
        }
        var list = elm('div', 'fs-loglist');
        events.slice(0, 14).forEach(function (line) {
          var row = elm('div', 'fs-logline');
          var text = String(line);
          var m = text.match(/^(\d{2}:\d{2}:\d{2})\s+(.*)$/);
          row.appendChild(elm('span', 'fs-logline-when', m ? m[1] : ''));
          row.appendChild(elm('span', 'fs-logline-text', m ? m[2] : text));
          list.appendChild(row);
        });
        body.appendChild(list);
      }
    });
  }

  function pushMcpForm() {
    push({
      id: 'mcp-add',
      kind: 'mcp-form',
      spineLabel: 'Add server',
      kicker: 'Connected servers',
      title: 'Add a server',
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'Adding a server registers how to reach it. Connecting and discovering tools is a separate, visible step — a freshly added server is honestly "not connected yet".'));
        var nameIn = formField(body, 'Name', '', 'e.g. Sentry');
        var endpointIn = formField(body, 'Command or URL', '', 'e.g. npx sentry-mcp, or https://mcp.example.dev', true);

        var prefRow = settingById('extensions.mcp.default-transport');
        var preferred = prefRow ? String(prefRow.value) : 'Auto';
        body.appendChild(elm('label', 'fs-hero-label', 'Transport'));
        var tSel = elm('select', 'fs-select');
        tSel.setAttribute('aria-label', 'Transport');
        ['Auto', 'stdio', 'http', 'sse'].forEach(function (t) {
          var opt = elm('option', null, t === preferred ? t + ' (your preferred default)' : t);
          opt.value = t;
          if (t === preferred) opt.selected = true;
          tSel.appendChild(opt);
        });
        body.appendChild(tSel);
        if (prefRow) body.appendChild(elm('p', 'fs-quiet', 'The default comes from the Preferred Server Transport setting; changing that setting reconnects existing servers.'));

        body.appendChild(elm('label', 'fs-hero-label', 'Authentication'));
        var aSel = elm('select', 'fs-select');
        aSel.setAttribute('aria-label', 'Authentication');
        ['None - local process', 'OAuth (PM direct sign-in)', 'API key reference (vault)'].forEach(function (a) {
          aSel.appendChild(elm('option', null, a));
        });
        body.appendChild(aSel);

        var scopeVal = { v: 'project' };
        body.appendChild(radioGroup('Scope',
          [{ v: 'project', label: 'This project' }, { v: 'global', label: 'All projects' }],
          scopeVal.v, function (v) { scopeVal.v = v; }));

        var err = elm('p', 'fs-form-error');
        err.hidden = true;
        body.appendChild(err);

        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn('Add server', 'check', 'is-primary', function () {
          var name = nameIn.value.trim();
          var endpoint = endpointIn.value.trim();
          if (!name || !endpoint) {
            err.hidden = false;
            err.textContent = !name ? 'A name is required.' : 'A command or URL is required to reach the server.';
            return;
          }
          var idNew = 'mcp-custom-' + Date.now().toString(36);
          data().mcp.push({
            id: idNew,
            name: name,
            transport: tSel.value === 'Auto' ? (endpoint.indexOf('http') === 0 ? 'http' : 'stdio') : tSel.value,
            endpoint: endpoint,
            protocol: { requested: '2026-03-26', negotiated: null },
            auth: aSel.value,
            health: 'added',
            scope: scopeVal.v,
            tools: [],
            lazyExposure: true,
            approval: { mode: 'once' },
            logsSample: ['added; no connection attempted yet'],
            resources: [],
            cache: { lastDiscovery: null, freshness: 'none', note: 'Nothing discovered yet.' },
            projection: { claudeCli: false, note: 'Used by Puppet Master only.' }
          });
          popTo(layers.length - 2);
          window.setTimeout(function () {
            rerenderLayer(currentTop());
            pushMcpDetail(idNew);
          }, motionReduced() ? 30 : 160);
          window.PMState.receipt('Server added', name + ' is registered. Connect when the server is reachable; nothing has been discovered yet.');
        }));
        actions.appendChild(btn('Cancel', null, 'is-quiet', function () { popTo(layers.length - 2); }));
        body.appendChild(actions);
      }
    });
  }

  /* ================================= skills / plugins / tools stacks
     Three DISTINCT sheet stacks sharing one lifecycle grammar (status
     words, provenance chips, enable switches, honest reasons) while each
     domain keeps its own shape: skills are provenance-first, plugins are
     lifecycle-first, tools are a funnel. */

  function pushSkillsSheet() {
    push({
      id: 'skills',
      kind: 'skills',
      spineLabel: 'Skills',
      kicker: 'Manager',
      title: 'Skills',
      withSearch: true,
      route: mgrHash('skills'),
      render: function (body) { renderSkillsList(body); }
    });
  }

  function renderSkillsList(body) {
    var skills = data().firstRun ? [] : (data().skills || []);
    body.appendChild(elm('p', 'fs-para', 'Packaged instructions an agent can follow. Provenance and trust lead: where a skill comes from decides how much it may do.'));
    if (!skills.length) {
      body.appendChild(emptyState('No skills yet. Project skills appear when the repository defines them; catalog skills install explicitly, never as a side effect.', 'Browse the catalog', function () {
        window.PMState.receipt('Browse the skill catalog', 'The catalog opens with verified publishers first and community entries labeled.');
      }));
      return;
    }
    [
      { title: 'From this project', match: function (s) { return String(s.source).indexOf('Project') === 0; }, note: 'Defined by files in the repository. They update with the repo and never self-modify.' },
      { title: 'From the catalog', match: function (s) { return String(s.source).indexOf('Project') !== 0; }, note: 'Installed explicitly. Verified publishers are marked; community entries stay untrusted until you decide otherwise.' }
    ].forEach(function (g) {
      var items = skills.filter(g.match);
      if (!items.length) return;
      var grp = elm('div', 'fs-mgroup');
      grp.appendChild(elm('h3', null, g.title));
      grp.appendChild(elm('p', 'fs-mgroup-note', g.note));
      items.forEach(function (s) {
        grp.appendChild(mrowBtn({
          id: 'fs-skill-' + s.id,
          ico: 'sparkle',
          title: s.name,
          tag: s.scope === 'project' ? 'This project' : 'All projects',
          note: s.source + ' · ' + s.permissions,
          status: [
            statusWordEl(s.enabled ? 'ok' : 'muted', s.enabled ? 'Enabled' : 'Off'),
            chipEl(s.trusted ? 'default' : 'not-configured', s.trusted ? 'Trusted' : 'Not yet trusted')
          ],
          onOpen: function () { pushSkillDetail(s.id); }
        }));
      });
      body.appendChild(grp);
    });
  }

  function pushSkillDetail(id) {
    var s = byId(data().skills, id);
    if (!s) return;
    push({
      id: 'skill-' + id,
      kind: 'skill-detail',
      spineLabel: s.name,
      kicker: 'Skill',
      title: s.name,
      route: mgrHash('skills', id),
      render: function (body) {
        var st = elm('div', 'fs-notice-actions');
        st.appendChild(statusWordEl(s.enabled ? 'ok' : 'muted', s.enabled ? 'Enabled' : 'Off'));
        st.appendChild(chipEl(s.trusted ? 'default' : 'not-configured', s.trusted ? 'Trusted' : 'Not yet trusted'));
        body.appendChild(st);

        body.appendChild(sectionTitle('Provenance & trust'));
        var facts = elm('dl', 'fs-facts');
        factInto(facts, 'Source', s.source);
        factInto(facts, 'Permissions', s.permissions);
        factInto(facts, 'Scope', s.scope === 'project' ? 'This project' : 'All projects');
        factInto(facts, 'Trust', s.trusted
          ? 'Trusted: its permissions were reviewed and accepted.'
          : 'Not yet trusted: it requests real authority (' + s.permissions.toLowerCase() + '). Enabling asks you to accept exactly that.');
        body.appendChild(facts);

        body.appendChild(sectionTitle('Availability'));
        body.appendChild(elm('p', 'fs-quiet', s.enabled
          ? 'Installed, enabled for its scope, and offered to agents when relevant. Selection per turn stays with the agent runtime.'
          : 'Installed but off: agents never see it. Turning it on makes it available in its scope; nothing is invoked retroactively.'));

        var actions = elm('div', 'fs-notice-actions');
        actions.appendChild(btn(s.enabled ? 'Turn off' : 'Turn on', s.enabled ? 'pause' : 'check', 'is-primary', function () {
          if (!s.enabled && !s.trusted) {
            pushConfirmSheet({
              id: 'skill-trust-' + s.id, label: s.name, type: 'toggle', value: false, valueSource: 'custom', flags: {},
              riskNote: 'This skill requests: ' + s.permissions + '. Enabling it grants exactly that, inside the usual permission rules, and marks it trusted.'
            }, 'Enabled and trusted', function () {
              s.enabled = true; s.trusted = true;
              rerenderAll();
            });
            return;
          }
          s.enabled = !s.enabled;
          rerenderLayer(currentTop());
          window.PMState.receipt(s.enabled ? 'Skill enabled' : 'Skill disabled', s.name + '.');
        }));
        if (String(s.source).indexOf('Project') !== 0) {
          actions.appendChild(btn('Uninstall', 'trash', 'is-quiet', function () {
            var list = data().skills;
            var at = list.indexOf(s);
            if (at >= 0) list.splice(at, 1);
            popTo(0);
            pushSkillsSheet();
            window.PMState.receipt('Skill uninstalled', s.name + ' was removed. Reinstalling later starts untrusted again.');
          }));
        } else {
          actions.appendChild(elm('span', 'fs-quiet', 'Project skills live in the repository; remove the file to remove the skill.'));
        }
        body.appendChild(actions);
      }
    });
  }

  function pushPluginsSheet() {
    push({
      id: 'plugins',
      kind: 'plugins',
      spineLabel: 'Plugins',
      kicker: 'Manager',
      title: 'Plugins',
      withSearch: true,
      route: mgrHash('plugins'),
      render: function (body) { renderPluginsList(body); }
    });
  }

  var PLUGIN_LIFECYCLE_WORD = {
    'active': { word: 'Active', tone: 'ok' },
    'update-available': { word: 'Update available', tone: 'setup' },
    'failed': { word: 'Failed', tone: 'attention' },
    'disabled': { word: 'Unloaded', tone: 'muted' }
  };

  function renderPluginsList(body) {
    var plugins = data().firstRun ? [] : (data().plugins || []);
    body.appendChild(elm('p', 'fs-para', 'Extensions loaded into Puppet Master itself. Lifecycle leads here: active, update available, failed, or unloaded — each with its reason.'));
    if (!plugins.length) {
      body.appendChild(emptyState('No plugins are installed. Plugins install explicitly from the catalog and can always be unloaded without a restart.', 'Browse the catalog', function () {
        window.PMState.receipt('Browse the plugin catalog', 'The catalog opens; compatibility with this Puppet Master version is checked before anything installs.');
      }));
      return;
    }
    plugins.forEach(function (p) {
      var lw = PLUGIN_LIFECYCLE_WORD[p.lifecycle] || { word: 'Unknown', tone: 'muted' };
      body.appendChild(mrowBtn({
        id: 'fs-plugin-' + p.id,
        ico: 'puzzle',
        title: p.name,
        tag: p.channel === 'canary' ? 'Canary channel' : 'Stable channel',
        note: p.compat + ' · ' + p.permissions + (p.failed ? ' · ' + p.failed : ''),
        status: [statusWordEl(lw.tone, lw.word)],
        onOpen: function () { pushPluginDetail(p.id); }
      }));
    });
  }

  function pushPluginDetail(id) {
    var p = byId(data().plugins, id);
    if (!p) return;
    push({
      id: 'plugin-' + id,
      kind: 'plugin-detail',
      spineLabel: p.name,
      kicker: 'Plugin',
      title: p.name,
      route: mgrHash('plugins', id),
      render: function (body) {
        var lw = PLUGIN_LIFECYCLE_WORD[p.lifecycle] || { word: 'Unknown', tone: 'muted' };
        var st = elm('div', 'fs-notice-actions');
        st.appendChild(statusWordEl(lw.tone, lw.word));
        st.appendChild(chipEl(p.channel === 'canary' ? 'custom' : 'default', p.channel === 'canary' ? 'Canary channel' : 'Stable channel'));
        body.appendChild(st);
        body.appendChild(opLine('plugin:' + id));

        var facts = elm('dl', 'fs-facts');
        factInto(facts, 'Compatibility', p.compat);
        factInto(facts, 'Permissions', p.permissions);
        if (p.failed) {
          var pf = elm('div', 'fs-fact is-attention');
          pf.appendChild(elm('dt', null, 'Failure'));
          pf.appendChild(elm('dd', null, p.failed));
          facts.appendChild(pf);
        }
        body.appendChild(facts);

        var actions = elm('div', 'fs-notice-actions');
        if (p.lifecycle === 'update-available') {
          actions.appendChild(btn('Install update', 'download', 'is-primary', function () {
            // Local staged lifecycle with the shared phase vocabulary.
            var refKey = 'plugin:' + id;
            handleOpEvent({ ref: refKey, phase: 'updating' });
            window.setTimeout(function () {
              handleOpEvent({ ref: refKey, phase: 'verifying' });
              window.setTimeout(function () {
                p.lifecycle = 'active';
                p.compat = p.compat.replace(/^Update [^ ]+ /, 'Updated: ');
                handleOpEvent({ ref: refKey, phase: 'done' });
                rerenderAll();
                window.PMState.receipt('Plugin updated', p.name + ' updated, verified against this Puppet Master version, and reloaded.');
              }, motionReduced() ? 0 : 700);
            }, motionReduced() ? 0 : 600);
          }));
        }
        if (p.lifecycle === 'failed') {
          actions.appendChild(btn('Try loading again', 'refresh', null, function () {
            window.PMState.receipt('Load attempt', p.name + ': the crash reproduces on load, so it stays disabled. The author has been notified; the fix has not shipped yet.');
          }));
        }
        if (p.lifecycle === 'active' || p.lifecycle === 'update-available') {
          actions.appendChild(btn('Unload', 'pause', 'is-quiet', function () {
            p.lifecycle = 'disabled';
            rerenderAll();
            window.PMState.receipt('Plugin unloaded', p.name + ' is out of the process. No restart needed; reload any time.');
          }));
        }
        if (p.lifecycle === 'disabled') {
          actions.appendChild(btn('Load', 'play', 'is-primary', function () {
            p.lifecycle = 'active';
            rerenderAll();
            window.PMState.receipt('Plugin loaded', p.name + ' is active again.');
          }));
        }
        body.appendChild(actions);
      }
    });
  }

  function pushToolsSheet() {
    push({
      id: 'tools',
      kind: 'tools',
      spineLabel: 'Tools',
      kicker: 'Manager',
      title: 'Tools',
      withSearch: true,
      route: mgrHash('tools'),
      render: function (body) { renderToolsList(body); }
    });
  }

  var FUNNEL_STAGES = [
    { key: 'installed', label: 'Installed' },
    { key: 'projectEnabled', label: 'Enabled here' },
    { key: 'available', label: 'Available now' },
    { key: 'selectedThisTurn', label: 'Selected this turn' },
    { key: 'invokedRecently', label: 'Invoked recently' }
  ];

  function renderToolsList(body) {
    var tools = data().firstRun ? [] : (data().tools || []);
    body.appendChild(elm('p', 'fs-para', 'The effective availability funnel. Installed is not enabled, enabled is not available, and available is not used — each stage is measured, never assumed.'));
    if (!tools.length) {
      body.appendChild(emptyState('No tools are registered yet. Built-in tools appear with the first project; server tools arrive through Connected Servers.'));
      return;
    }

    // The funnel summary: honest counts at every stage.
    var funnel = elm('div', 'fs-funnel');
    funnel.setAttribute('role', 'img');
    var counts = FUNNEL_STAGES.map(function (st) {
      return tools.filter(function (t) { return !!t[st.key]; }).length;
    });
    funnel.setAttribute('aria-label', 'Funnel: ' + FUNNEL_STAGES.map(function (st, i) { return st.label + ' ' + counts[i]; }).join(', '));
    FUNNEL_STAGES.forEach(function (st, i) {
      var stage = elm('div', 'fs-funnel-stage');
      stage.appendChild(elm('b', null, String(counts[i])));
      stage.appendChild(elm('span', null, st.label));
      funnel.appendChild(stage);
      if (i < FUNNEL_STAGES.length - 1) {
        var arrow = elm('span', 'fs-funnel-arrow');
        arrow.appendChild(icoEl('arrowR'));
        funnel.appendChild(arrow);
      }
    });
    body.appendChild(funnel);

    tools.forEach(function (t) {
      var stageIdx = -1;
      FUNNEL_STAGES.forEach(function (st, i) { if (t[st.key]) stageIdx = i; });
      // The furthest CONTIGUOUS stage tells the truth about drop-off.
      var contiguous = -1;
      for (var i = 0; i < FUNNEL_STAGES.length; i++) {
        if (t[FUNNEL_STAGES[i].key]) contiguous = i; else break;
      }
      var word = contiguous >= 2
        ? { tone: 'ok', label: FUNNEL_STAGES[Math.max(contiguous, stageIdx)].label }
        : (contiguous === 1 ? { tone: 'attention', label: 'Enabled, not available' } : (contiguous === 0 ? { tone: 'muted', label: 'Installed, off here' } : { tone: 'muted', label: 'Not installed' }));
      body.appendChild(mrowBtn({
        id: 'fs-tool-' + t.id,
        ico: 'toolbox',
        title: t.name,
        tag: t.risk === 'high' ? 'High impact' : (t.risk === 'medium' ? 'Medium impact' : null),
        note: t.approval,
        status: [statusWordEl(word.tone, word.label)],
        onOpen: function () { pushToolDetail(t.id); }
      }));
    });
  }

  function pushToolDetail(id) {
    var t = byId(data().tools, id);
    if (!t) return;
    push({
      id: 'tool-' + id,
      kind: 'tool-detail',
      spineLabel: t.name,
      kicker: 'Tool',
      title: t.name,
      route: mgrHash('tools', id),
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'The funnel trace for this tool. A stage is true only when it was actually measured true — never inferred from the stage before it.'));
        var trace = elm('ul', 'fs-evidence');
        FUNNEL_STAGES.forEach(function (st) {
          var li = elm('li');
          li.appendChild(elm('span', 'fs-evidence-cap', st.label));
          var yes = !!t[st.key];
          var detail = yes ? 'Yes' : 'No';
          if (!yes && st.key === 'available' && t.projectEnabled) detail = 'No — ' + t.approval.replace(/^Allowed - /, '');
          if (!yes && st.key === 'projectEnabled' && t.installed) detail = 'No — turned off for this project';
          if (!yes && st.key === 'selectedThisTurn' && t.available) detail = 'No — the agent runtime did not select it this turn';
          if (!yes && st.key === 'invokedRecently') detail = yes ? 'Yes' : 'No — nothing has called it lately';
          li.appendChild(elm('span', 'fs-evidence-detail', detail));
          trace.appendChild(li);
        });
        body.appendChild(trace);

        body.appendChild(sectionTitle('Policy & risk'));
        var facts = elm('dl', 'fs-facts');
        factInto(facts, 'Impact', t.risk === 'high' ? 'High — can change things outside the editor' : (t.risk === 'medium' ? 'Medium — writes within guarded scopes' : 'Low — read-mostly'));
        factInto(facts, 'Approval', t.approval);
        body.appendChild(facts);

        var actions = elm('div', 'fs-notice-actions');
        var sw = elm('button', 'fs-switch');
        sw.type = 'button';
        sw.setAttribute('role', 'switch');
        sw.setAttribute('aria-checked', t.projectEnabled ? 'true' : 'false');
        sw.setAttribute('aria-label', 'Enabled for this project');
        sw.addEventListener('click', function () {
          t.projectEnabled = !t.projectEnabled;
          if (!t.projectEnabled) { t.available = false; t.selectedThisTurn = false; }
          sw.setAttribute('aria-checked', t.projectEnabled ? 'true' : 'false');
          rerenderLayer(currentTop());
          window.PMState.receipt(t.projectEnabled ? 'Tool enabled' : 'Tool disabled',
            t.name + (t.projectEnabled ? ': availability is re-measured on the next turn, not assumed.' : ': it leaves the funnel for this project.'));
        });
        actions.appendChild(sw);
        actions.appendChild(elm('span', 'fs-stat', 'Enabled for this project'));
        body.appendChild(actions);
      }
    });
  }

  /* ============================================ testing & debug stack
     One sheet: the eleven-capability matrix, Global and Project columns,
     Auto/On/Off (+ Inherit global) selects, reasons inline. Slint note:
     the matrix maps to a GridLayout of ComboBoxes inside one scroll view;
     the horizontal scroller is bounded, the sheet scroller is the page. */

  var CAP_LEVELS = [
    { v: 'auto', label: 'Auto' },
    { v: 'on', label: 'On' },
    { v: 'off', label: 'Off' }
  ];

  function pushTestingSheet() {
    push({
      id: 'testing',
      kind: 'testing',
      spineLabel: 'Testing',
      kicker: 'Manager',
      title: 'Testing & Debug',
      withSearch: true,
      route: mgrHash('testing'),
      render: function (body) { renderTestingMatrix(body); }
    });
  }

  function capLevelLabel(v) {
    if (v === 'inherit-global') return 'Inherit global';
    var hit = CAP_LEVELS.filter(function (o) { return o.v === v; })[0];
    return hit ? hit.label : 'Auto';
  }

  function renderTestingMatrix(body) {
    var td = data().testingDebug;
    if (!td || !(td.capabilities || []).length) {
      body.appendChild(elm('p', 'fs-quiet', 'Testing capabilities are not present in this scenario.'));
      return;
    }
    body.appendChild(elm('p', 'fs-para', 'Eleven capabilities, two columns. Auto lets Puppet Master decide per task; Off always says why. The Project column can inherit the global answer.'));

    var scrollWrap = elm('div', 'fs-matrix-scroll');
    var table = elm('table', 'fs-matrix');
    var thead = elm('thead');
    var hrow = elm('tr');
    ['Capability', 'Global', 'This project'].forEach(function (h) {
      hrow.appendChild(elm('th', null, h));
    });
    thead.appendChild(hrow);
    table.appendChild(thead);
    var tbody = elm('tbody');

    function capSelect(cap, col) {
      var sel = elm('select', 'fs-select');
      sel.setAttribute('aria-label', cap.label + ' — ' + (col === 'global' ? 'global' : 'this project'));
      var opts = CAP_LEVELS.slice();
      if (col === 'project') opts = [{ v: 'inherit-global', label: 'Inherit global' }].concat(opts);
      opts.forEach(function (o) {
        var opt = elm('option', null, o.label);
        opt.value = o.v;
        if (cap[col] === o.v) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function () {
        var chosen = sel.value;
        if (cap.exposure === 'expert' && chosen !== 'off') {
          sel.value = cap[col]; // revert until confirmed on its own sheet
          pushConfirmSheet({
            id: 'cap-' + cap.id, label: cap.label + ' (' + (col === 'global' ? 'global' : 'project') + ')',
            type: 'select', options: ['Auto', 'On', 'Off', 'Inherit global'],
            value: capLevelLabel(cap[col]), valueSource: 'custom', flags: {},
            riskNote: cap.reason || 'Long-lived eval state is powerful; it can hold secrets and side effects between runs.'
          }, capLevelLabel(chosen), function () {
            cap[col] = chosen;
            rerenderAll();
          });
          return;
        }
        cap[col] = chosen;
        window.PMShell.status(cap.label + ' (' + (col === 'global' ? 'global' : 'project') + '): ' + capLevelLabel(chosen) + '.');
        window.PMState.receipt('Capability set', cap.label + ' is now ' + capLevelLabel(chosen) + ' ' + (col === 'global' ? 'globally.' : 'for this project.'));
        if (col === 'global') rerenderLayer(currentTop()); // inherit-global notes refresh
      });
      return sel;
    }

    (td.capabilities || []).forEach(function (cap) {
      var tr = elm('tr');
      var nameTd = elm('td', 'fs-matrix-name');
      var lab = elm('div', 'fs-row-label');
      lab.appendChild(elm('span', null, cap.label));
      if (cap.exposure === 'advanced') lab.appendChild(chipEl('custom', 'Advanced'));
      if (cap.exposure === 'expert') lab.appendChild(chipEl('unavailable', 'Expert'));
      nameTd.appendChild(lab);
      if (cap.reason) nameTd.appendChild(elm('div', 'fs-row-desc', cap.reason));
      tr.appendChild(nameTd);
      var gTd = elm('td');
      gTd.appendChild(capSelect(cap, 'global'));
      tr.appendChild(gTd);
      var pTd = elm('td');
      pTd.appendChild(capSelect(cap, 'project'));
      if (cap.project === 'inherit-global') pTd.appendChild(elm('div', 'fs-quiet', 'Following global: ' + capLevelLabel(cap.global)));
      tr.appendChild(pTd);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scrollWrap.appendChild(table);
    body.appendChild(scrollWrap);

    body.appendChild(elm('p', 'fs-quiet', 'DAP debugging, the persistent eval session, and capture each ride this matrix — the debugger attaches only where its row allows, and eval is expert territory on purpose.'));
  }

  /* ======================================================== router
     Deterministic deep links drive the whole stack. specsForRoute builds
     the intended sheet stack for a route; reconcile pops/pushes the
     difference so Back and forward always land on a coherent stack. */

  function specsForRoute(route, dl) {
    var specs = [{ id: 'home', make: null }]; // home always sits at depth 0
    var settle = null;
    var params = dl || {};
    var kind = route && route.kind || 'home';

    if (kind === 'search') {
      settle = function () {
        var home = layers[0];
        home.searchQuery = route.query || '';
        rerenderLayer(home);
      };
      return { specs: specs, settle: settle };
    }

    if (kind === 'dest' && route.domainId && domainById(route.domainId)) {
      specs.push({ id: 'domain-' + route.domainId, make: function () { return makeDomainDesc(route.domainId); } });
      var focus = params.focus || null;
      var dom = domainById(route.domainId);
      var sub = route.subId ? byId(dom.subs, route.subId) : null;
      if (sub && focus === 'advanced') {
        specs.push({ id: 'advanced-' + sub.id, make: function () { return null; }, call: function () { pushAdvancedSheet(dom, sub); } });
      } else if (sub && focus === 'diagnostics') {
        specs.push({ id: 'diag-' + sub.id, make: function () { return null; }, call: function () { pushDiagnosticsSheet(dom, sub); } });
      } else {
        settle = function () {
          var layer = layers[1];
          if (!layer || !layer.spy) return;
          if (route.subId) layer.spy.jumpTo('fs-sub-' + route.subId, {});
          if (focus) {
            var rowEl = document.getElementById('fs-row-' + focus);
            if (rowEl) window.PMSpy.reveal({ controller: layer.spy, ensure: [], targetId: route.subId ? 'fs-sub-' + route.subId : null, focusEl: rowEl });
          }
        };
      }
      return { specs: specs, settle: settle };
    }

    if (kind === 'setting' && route.settingId) {
      var loc = settingLocation(route.settingId);
      if (loc) {
        specs.push({ id: 'domain-' + loc.domain.id, make: function () { return makeDomainDesc(loc.domain.id); } });
        settle = function () { openSettingWithin(loc, route.settingId); };
      }
      return { specs: specs, settle: settle };
    }

    if (kind === 'manager' && route.managerId) {
      var mid = String(route.managerId);
      var short = mid.replace(/^manager\./, '');
      if (NATIVE_MANAGERS.indexOf(mid) < 0) {
        specs.push({ id: 'covered-' + mid, make: function () { return null; }, call: function () { pushCoveredSheet(mid); } });
        return { specs: specs, settle: null };
      }
      var f = String(params.focus || '').split('/');
      var itemId = f[0] || null;
      var panel = f[1] || null;
      function pushSpec(id, call) { specs.push({ id: id, make: null, call: call }); }

      if (short === 'providers' || short === 'roles' || short === 'freeRoutes') {
        var section = short === 'roles' ? 'roles' : (short === 'freeRoutes' ? 'free' : null);
        pushSpec('providers', function () { pushProvidersSheet(section); });
        if (short === 'providers' && itemId) {
          if (panel === 'installations') {
            pushSpec('provider-' + itemId, function () { doPushProvider(itemId); });
            var offerTarget = providerById(itemId);
            if (offerTarget && offerTarget.setupOffer && !(offerTarget.installations || []).length) {
              pushSpec('offer-' + itemId, function () { pushInstallOfferSheet(itemId); });
            } else {
              pushSpec('installs-' + itemId, function () { pushInstallationsSheet(itemId); });
            }
          } else {
            pushSpec('provider-' + itemId, function () { doPushProvider(itemId); });
          }
        }
      } else if (short === 'terminalProfiles') {
        pushSpec('terminal', function () { pushTerminalSheet(); });
        if (itemId) {
          pushSpec('terminal-' + itemId, function () { pushTerminalDetail(itemId); });
          if (panel === 'logs') pushSpec('terminal-logs-' + itemId, function () { var tp2 = terminalById(itemId); if (tp2) pushTerminalLogsSheet(tp2); });
        }
      } else if (short === 'fileManager') {
        pushSpec('filemanager', function () { pushFileManagerSheet(); });
        if (itemId === 'recovery') pushSpec('fm-recovery', function () { pushRecoverySheet(); });
      } else if (short === 'lsp') {
        pushSpec('lsp', function () { pushLspSheet(); });
        if (itemId) {
          pushSpec('lsp-' + itemId, function () { pushLspDetail(itemId); });
          if (panel === 'logs') pushSpec('lsp-logs-' + itemId, function () { pushLspLogsSheet(itemId); });
        }
      } else if (short === 'formatters') {
        pushSpec('formatters', function () { pushFormattersSheet(); });
        if (itemId) pushSpec('fmt-' + itemId, function () { pushFormatterDetail(itemId); });
      } else if (short === 'commands') {
        pushSpec('commands', function () { pushCommandsSheet(); });
      } else if (short === 'mcp') {
        pushSpec('mcp', function () { pushMcpSheet(); });
        if (itemId) {
          pushSpec('mcp-' + itemId, function () { pushMcpDetail(itemId); });
          if (panel === 'logs') pushSpec('mcp-logs-' + itemId, function () { pushMcpLogsSheet(itemId); });
        }
      } else if (short === 'skills') {
        pushSpec('skills', function () { pushSkillsSheet(); });
        if (itemId) pushSpec('skill-' + itemId, function () { pushSkillDetail(itemId); });
      } else if (short === 'plugins') {
        pushSpec('plugins', function () { pushPluginsSheet(); });
        if (itemId) pushSpec('plugin-' + itemId, function () { pushPluginDetail(itemId); });
      } else if (short === 'tools') {
        pushSpec('tools', function () { pushToolsSheet(); });
        if (itemId) pushSpec('tool-' + itemId, function () { pushToolDetail(itemId); });
      } else if (short === 'testing') {
        pushSpec('testing', function () { pushTestingSheet(); });
      }
      return { specs: specs, settle: null };
    }

    // home (also the fallback for unknown routes)
    return { specs: specs, settle: null };
  }

  /* Deep-link a setting inside an already-open domain layer: standard rows
     reveal + flash; advanced/expert/diagnostic push their disclosure. */
  function openSettingWithin(loc, settingId) {
    var s = settingById(settingId);
    var exposure = (s && s.exposure) || 'standard';
    var layer = layers.filter(function (l) { return l.kind === 'domain' && l.domainId === loc.domain.id; })[0];
    if (exposure === 'advanced' || exposure === 'expert') {
      pushAdvancedSheet(loc.domain, loc.sub, settingId);
    } else if (exposure === 'diagnostic') {
      pushDiagnosticsSheet(loc.domain, loc.sub, settingId);
    } else if (layer && layer.spy) {
      var rowEl = document.getElementById('fs-row-' + settingId);
      window.PMSpy.reveal({ controller: layer.spy, ensure: [], targetId: 'fs-sub-' + loc.sub.id, focusEl: rowEl });
    }
  }

  function openRoute(route, dl) {
    var plan = specsForRoute(route, dl);
    routing = true;
    try {
      var specs = plan.specs;
      var keep = 0;
      while (keep < specs.length && keep < layers.length && layers[keep].id === specs[keep].id) keep++;
      if (layers.length > keep) popTo(keep - 1);
      for (var i = keep; i < specs.length; i++) {
        var spec = specs[i];
        if (spec.call) spec.call();
        else if (spec.make) {
          var desc = spec.make();
          if (desc) push(desc);
        }
      }
    } finally {
      routing = false;
    }
    if (plan.settle) {
      window.setTimeout(function () {
        routing = true;
        try { plan.settle(); } finally { routing = false; }
      }, motionReduced() ? 50 : 260);
    }
    return null;
  }

  /* Persisted-view restore: only when the URL carries no route of its own.
     Views naming surfaces this concept no longer owns (Personas moved to
     c1 Atlas) fall back to Home instead of resurrecting a ghost. */
  function restorePersistedView() {
    var saved = store ? String(store.get('view') || '') : '';
    if (!saved || saved === '#/home') return;
    if (/persona/i.test(saved)) {
      store.set('view', null);
      window.PMShell.status('Personas moved to the Atlas concept; starting at Home.');
      return;
    }
    var dl = window.PMState.parseDeepLink({ hash: saved });
    if (!dl) { store.set('view', null); return; }
    var mid = dl.route && dl.route.managerId;
    if (mid && NATIVE_MANAGERS.indexOf(mid) < 0 && !COVERED_IN[mid]) { store.set('view', null); return; }
    routing = true;
    try { openRoute(dl.route, dl); } finally { routing = false; }
    try { window.PMState.writeRoute(saved, { replace: true }); } catch (e) { /* optional */ }
  }

  /* ======================================================== boot */

  function boot() {
    stage = document.getElementById('pmStage');
    if (!stage) return;

    // Contract boot order: PMShell.init, PMState.init, build, bindRouter.
    window.PMShell.init({ concept: 'c3' });
    store = window.PMState.init('c3');

    // The manager manifest: what this concept proves natively, and where
    // every other family is demonstrated. Search receipts read this.
    window.PMState.registerManagers({
      conceptId: 'c3',
      native: NATIVE_MANAGERS.slice(),
      coveredIn: COVERED_IN
    });

    var root = elm('div', 'fs-root');
    spineEl = elm('nav', 'fs-spine');
    spineEl.setAttribute('aria-label', 'Layer spine');
    layersEl = elm('div', 'fs-layers');
    root.appendChild(spineEl);
    root.appendChild(layersEl);
    stage.appendChild(root);

    // Home is layer zero; it is never popped.
    var homeLayer = {
      id: 'home',
      kind: 'home',
      spineLabel: 'Home',
      title: 'Settings Home',
      route: '#/home',
      render: function (body, l) { renderHome(body, l); }
    };
    buildSheet(homeLayer);
    layers.push(homeLayer);
    layersEl.appendChild(homeLayer.el);
    homeLayer.render(homeLayer.bodyEl, homeLayer);
    markUnder();
    updateSpine();

    // Receipts surface as toasts; scenario/provider changes re-render.
    store.on('receipt', function (r) { if (r && r.message) window.PMShell.toast(r.message); });
    store.on('scenario', function () { rerenderAll(); window.PMShell.status('Scenario applied.'); });
    store.on('provider', function () { rerenderAll(); });
    store.on('catalog', function () { rerenderAll(); });
    // store.set() also emits 'change' for persisted prefs; only the
    // installation triggers' key warrants a sheet rebuild.
    store.on('change', function (c) { if (c && c.key === 'installations') rerenderLayer(currentTop()); });
    store.on('formatters', function () { rerenderLayer(currentTop()); });
    store.on('lsp', function () { rerenderLayer(currentTop()); });
    store.on('op', handleOpEvent);

    // Esc pops the top sheet (menus and overlays intercept their own Esc).
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      var target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      if (layers.length > 1) popTo(layers.length - 2);
    });

    window.PMState.mountStatesDrawer(store);
    window.PMShell.status('Settings Home — one surface at a time.');

    // The router owns the initial deep link (scenario, fixtures, route,
    // focus, triggers, in that order). When the URL carries no route, the
    // persisted view restores — unless it names a surface that moved.
    var hadHash = String(window.location.hash).indexOf('#/') === 0;
    window.PMState.bindRouter({ open: openRoute }).then(function () {
      if (!hadHash) restorePersistedView();
    });

    /* Debug/demo hook (read-only): lets automated checks inspect the stack.
       Not used by the UI itself. */
    window.FS_DEBUG = {
      get layers() { return layers; },
      get store() { return store; }
    };
  }

  /* Boot defensively: the concept only starts once the shared modules are
     present (hub preview panes can settle scripts late), and never twice. */
  var bootTries = 0;
  function tryBoot() {
    if (document.querySelector('.fs-root')) return;
    var ready = window.PMState && window.PMShell && window.PMSpy && window.PMIcons && window.PMProvider &&
      window.PM_DATA && document.getElementById('pmStage');
    if (ready) {
      try { boot(); return; } catch (e) { /* fall through to retry */ }
    }
    bootTries += 1;
    if (bootTries < 120) window.setTimeout(tryBoot, 125);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryBoot);
  } else {
    tryBoot();
  }
  window.addEventListener('load', tryBoot);
})();
