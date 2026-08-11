/* c3-focus-stack.js — fable · Focus Stack
   Layered focus: one surface at a time. Every navigation pushes a
   full-height sheet onto a visible layer spine; every disclosure is
   navigation (advanced settings, row details, warning details and expert
   confirmations each push a (half-)sheet). Lowest density of the four
   fable concepts.
   Consumes the shared contract APIs: PMShell, PMState, PMSpy, PMSpell,
   PMIcons, PM_DATA. Plain JS, no build step, no libraries.
   Slint notes inline. No emoji anywhere. */
(function () {
  'use strict';

  var store = null;
  var stage = null;
  var layersEl = null;
  var spineEl = null;
  var layers = [];       // [{id, kind, spineLabel, el, bodyEl, render, ...}]
  var SHEET_ANIM_MS = 320;

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
    var icons = { attention: 'warning', setup: 'clipboard', recommended: 'sparkle', ok: 'checkCircle', muted: 'minus' };
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

  function personaById(id) {
    var list = data().personas || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function terminalById(id) {
    var list = data().terminalProfiles || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
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

  var STATUS_HUMAN = {
    'ready': { word: 'Ready', tone: 'ok' },
    'not-installed': { word: 'Not installed', tone: 'setup' },
    'signed-out': { word: 'Signed out', tone: 'attention' },
    'auth-no-invoke': { word: 'Signed in, cannot run models', tone: 'attention' },
    'degraded': { word: 'Degraded', tone: 'attention' },
    'refreshing': { word: 'Refreshing', tone: 'muted' }
  };

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

  /* Managers whose full surface lives in a sibling concept: Focus Stack
     answers with an honest receipt instead of an empty sheet. */
  var CROSS_CONCEPT_MANAGERS = {
    commands: {
      title: 'Commands & shortcuts',
      note: 'The Commands & shortcuts manager is built out in the Ledger concept (c4). Focus Stack points there rather than duplicating the surface.'
    },
    lsp: {
      title: 'Language servers',
      note: 'The Language servers manager is built out in the Atlas concept (Appendix D). Focus Stack points there rather than duplicating the surface.'
    }
  };

  function openManager(managerId) {
    var id = String(managerId).replace(/^manager\./, '');
    if (id === 'providers' || id === 'roles' || id === 'freeRoutes') { pushProvidersSheet(); return; }
    if (id === 'personas') { pushPersonasSheet(); return; }
    if (id === 'terminalProfiles') { pushTerminalSheet(); return; }
    var cross = CROSS_CONCEPT_MANAGERS[id];
    if (cross) { window.PMState.receipt(cross.title, cross.note); return; }
    pushMiniManager(id);
  }

  function openNoticeTarget(notice) {
    var t = notice.target || {};
    var act = (notice.primary && notice.primary.act) || '';
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
    if (t.personaId) { pushPersonaDefinition(t.personaId); return; }
    if (t.settingId) { openSetting(t.settingId); return; }
    if (t.manager) { openManager(t.manager); return; }
    if (t.domain) {
      ensureDomainLayer(t.domain, function () { /* landed */ });
      return;
    }
    pushNoticesSheet();
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
    [
      { id: 'providers', title: 'Providers & Models', sub: 'Accounts, connections, catalogs, and every model you can route to.', ico: 'cloud' },
      { id: 'personas', title: 'Personas', sub: 'Working styles the agents can adopt. Definitions, runtime footprint, capsule previews.', ico: 'masks' },
      { id: 'terminalProfiles', title: 'Terminal Profiles', sub: 'Shells, fonts, colors, and retention for embedded terminals.', ico: 'terminal' }
    ].forEach(function (m) {
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

  function managerFootnote(id) {
    var d = data();
    if (id === 'providers') {
      var ready = (d.providers || []).filter(function (p) { return p.status === 'ready'; }).length;
      return ready + ' of ' + (d.providers || []).length + ' connections ready';
    }
    if (id === 'personas') {
      var n = (d.personas || []).length;
      var child = (d.personas || []).filter(function (p) { return p.childOnly; }).length;
      return n + ' personas, ' + child + ' child-only';
    }
    if (id === 'terminalProfiles') {
      return (d.terminalProfiles || []).length + ' profiles';
    }
    return '';
  }

  /* ================================================ domain workspace */

  function pushDomainSheet(domainId) {
    var dom = domainById(domainId);
    if (!dom) return null;
    var layer = {
      id: 'domain-' + domainId,
      kind: 'domain',
      domainId: domainId,
      spineLabel: dom.title,
      kicker: 'Category ' + dom.num,
      title: dom.title,
      withSearch: true,
      withChip: true,
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
    push(layer);
    return layer;
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

    // Managers that live in this category: reachable as places.
    var mgrs = domainManagers(domainId);
    if (mgrs.length) {
      mgrs.forEach(function (m) {
        var row = elm('button', 'fs-navrow');
        row.type = 'button';
        row.appendChild(icoEl(m.ico));
        row.appendChild(elm('span', null, m.label));
        row.appendChild(elm('span', 'fs-navrow-note', 'Opens a manager sheet'));
        row.addEventListener('click', function () { openManager(m.id); });
        body.appendChild(row);
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
        { id: 'personas', label: 'Personas manager', ico: 'masks' }
      ],
      code: [{ id: 'terminalProfiles', label: 'Terminal Profiles manager', ico: 'terminal' }, { id: 'lsp', label: 'Language servers', ico: 'server' }],
      context: [{ id: 'memory', label: 'Assistant memory', ico: 'brain' }],
      collaboration: [{ id: 'crew', label: 'Crew templates', ico: 'users' }],
      extensions: [
        { id: 'mcp', label: 'Connected tool servers', ico: 'plug' },
        { id: 'skills', label: 'Skills & plugins', ico: 'sparkle' },
        { id: 'tools', label: 'Tools funnel', ico: 'toolbox' }
      ],
      media: [{ id: 'media', label: 'Media routes', ico: 'film' }],
      system: []
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
    return {
      id: 'domain-' + domainId,
      kind: 'domain',
      domainId: domainId,
      spineLabel: dom.title,
      kicker: 'Category ' + dom.num,
      title: dom.title,
      withSearch: true,
      withChip: true,
      render: function (body, l) { renderDomain(body, l, domainId); },
      onReveal: function (l) { if (l.spy) l.spy.refresh(); },
      onPop: function (l) { if (l.spy) l.spy.dispose(); }
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
            else if (t.personaId) pushPersonaDefinition(t.personaId);
            else if (t.manager) openManager(t.manager);
            else if (t.domain) ensureDomainLayer(t.domain, function () { /* landed */ });
          });
          body.appendChild(row);
        });
      }
    });
  }

  /* =============================================== providers manager */

  function pushProvidersSheet() {
    // A manager is a place too: full sheet, one level below Home.
    var top = currentTop();
    if (top && top.kind === 'providers') return;
    push({
      id: 'providers',
      kind: 'providers',
      spineLabel: 'Providers',
      kicker: 'Manager',
      title: 'Providers & Models',
      withSearch: true,
      render: function (body, l) { renderProviders(body, l); }
    });
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
          var sh = STATUS_HUMAN[p.status] || { word: p.status, tone: 'muted' };
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
        groupsWrap.appendChild(grp);
      });
      if (!groupsWrap.children.length) {
        groupsWrap.appendChild(elm('p', 'fs-quiet', 'No connections match that filter.'));
      }
    }
    filter.addEventListener('input', draw);
    draw();
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
    row.appendChild(elm('span', 'fs-mrow-note', (r.setupSteps && r.setupSteps.length > 1) ? 'Needs setup before first use.' : 'Ready when you are.'));
    var st = elm('span', 'fs-mrow-status');
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
      render: function (body, l) { renderProviderDetail(body, l, pid); }
    });
  }

  function renderProviderDetail(body, layer, pid) {
    var p = providerById(pid);
    if (!p) { body.appendChild(elm('p', 'fs-quiet', 'This provider is not present in the current scenario.')); return; }

    // Status block: authenticated is not ready — two explicit steps.
    var statusWrap = elm('div', 'fs-acct');
    var sh = STATUS_HUMAN[p.status] || { word: p.status, tone: 'muted' };
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
      acts.appendChild(btn('Install the CLI', 'download', 'is-primary', function () {
        window.PMState.receipt('Install ' + p.name, 'Installation happens outside this demo; PM would verify the binary and open the tool’s own sign-in.');
      }));
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

    // Role assignments touching this provider.
    var roles = (data().roles || []).filter(function (r) {
      return String(r.assignedRoute || '').toLowerCase().indexOf(p.name.toLowerCase().split(' ')[0]) >= 0;
    });
    if (roles.length) {
      body.appendChild(sectionTitle('Roles routed here'));
      var rfacts = elm('dl', 'fs-facts');
      roles.forEach(function (r) {
        var f = elm('div', 'fs-fact');
        f.appendChild(elm('dt', null, r.label));
        var dd = elm('dd');
        dd.appendChild(elm('span', null, r.assignedRoute + ' · ' + (r.quality === 'high' ? 'High quality route' : 'Standard route')));
        if (r.lockedHigh) {
          dd.appendChild(elm('div', 'fs-quiet', 'Kept on the high-quality route by default. ' + (r.note || 'User discussion is never silently downgraded.')));
        } else if (r.note) {
          dd.appendChild(elm('div', 'fs-quiet', r.note));
        }
        f.appendChild(dd);
        rfacts.appendChild(f);
      });
      body.appendChild(rfacts);
    }
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
      'fast-variant': 'Fast variant', 'selectable-effort': 'Selectable effort', 'invocation': 'Invocation',
      'availability': 'Availability'
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
        var qual = elm('div', 'fs-managed-note');
        qual.appendChild(icoEl('info'));
        qual.appendChild(elm('span', null, qualifierExplanation(route.qualifier)));
        body.appendChild(qual);
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

  /* ================================================ personas manager */

  function pushPersonasSheet() {
    push({
      id: 'personas',
      kind: 'personas',
      spineLabel: 'Personas',
      kicker: 'Manager',
      title: 'Personas',
      withSearch: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-para', 'Working styles the agents can adopt. A Persona shapes behavior; it can never widen Plan/Review limits, permissions, FileSafe, network access, project access, or a parent agent’s ceilings.'));

        var filterWrap = elm('div', 'fs-head-search');
        filterWrap.style.maxWidth = '320px';
        filterWrap.style.margin = '4px 0 6px';
        filterWrap.appendChild(icoEl('filter'));
        var filter = elm('input');
        filter.type = 'search';
        filter.placeholder = 'Filter personas';
        filter.setAttribute('aria-label', 'Filter personas');
        filterWrap.appendChild(filter);
        body.appendChild(filterWrap);

        var addRow = elm('div', 'fs-notice-actions');
        addRow.appendChild(btn('New persona', 'plus', null, function () {
          window.PMState.receipt('New persona', 'A blank definition sheet would open.');
        }));
        body.appendChild(addRow);

        var listWrap = elm('div');
        body.appendChild(listWrap);

        function draw() {
          var q = filter.value.trim().toLowerCase();
          listWrap.innerHTML = '';
          var groups = [
            { title: 'Available as Chat defaults', match: function (x) { return !x.childOnly; } },
            { title: 'Child agents only', match: function (x) { return !!x.childOnly; }, note: 'These exist for helper agents and are deliberately excluded from Chat default pickers.' }
          ];
          groups.forEach(function (g) {
            var items = (data().personas || []).filter(function (x) {
              if (!g.match(x)) return false;
              if (!q) return true;
              return (x.name + ' ' + x.role).toLowerCase().indexOf(q) >= 0;
            });
            if (!items.length) return;
            var grp = elm('div', 'fs-mgroup');
            grp.appendChild(elm('h3', null, g.title));
            if (g.note) grp.appendChild(elm('p', 'fs-mgroup-note', g.note));
            items.forEach(function (persona) {
              var row = elm('button', 'fs-mrow');
              row.type = 'button';
              var name = elm('span', 'fs-mrow-name');
              name.appendChild(icoEl('masks'));
              name.appendChild(elm('span', null, persona.name));
              row.appendChild(name);
              row.appendChild(elm('span', 'fs-mrow-note', persona.role + ' — ' + persona.definitionSummary));
              var st = elm('span', 'fs-mrow-status');
              st.appendChild(chipEl('default', 'Applies to: ' + (SCOPE_HUMAN[persona.scopeDefault] || persona.scopeDefault)));
              if (persona.childOnly) st.appendChild(chipEl('managed', 'Never a Chat default'));
              row.appendChild(st);
              var openI = elm('span', 'fs-mrow-open');
              openI.appendChild(icoEl('chevR'));
              row.appendChild(openI);
              row.addEventListener('click', function () { pushPersonaDefinition(persona.id); });
              grp.appendChild(row);
            });
            listWrap.appendChild(grp);
          });
          if (!listWrap.children.length) listWrap.appendChild(elm('p', 'fs-quiet', 'No personas match that filter.'));
        }
        filter.addEventListener('input', draw);
        draw();
      }
    });
  }

  /* Sheet 1 of 3: the definition. Deeper truths are deeper sheets. */
  function pushPersonaDefinition(pid) {
    var persona = personaById(pid);
    if (!persona) return;
    push({
      id: 'persona-' + pid,
      kind: 'persona',
      spineLabel: persona.name,
      kicker: 'Persona · Definition',
      title: persona.name,
      render: function (body) {
        body.appendChild(elm('p', 'fs-para', persona.role + '.'));

        body.appendChild(sectionTitle('Definition'));
        body.appendChild(elm('p', 'fs-quiet', 'The prose that shapes this persona. Spellcheck underlines only prose — code, paths, ALL-CAPS tokens, and known model or persona names are skipped.'));
        var prose = elm('div', 'fs-prose');
        prose.contentEditable = 'true';
        prose.setAttribute('role', 'textbox');
        prose.setAttribute('aria-multiline', 'true');
        prose.setAttribute('aria-label', 'Definition of ' + persona.name);
        prose.innerHTML = '';
        // Skip-region demo content: prose misspellings + code + path + names.
        prose.appendChild(document.createTextNode(persona.definitionSummary + ' Definately keep findings seperate from guesses, and cite the source accross drafts. Prefer Claude for synthesis. Check '));
        var codeBit = elm('code', null, 'PMState.receipt');
        prose.appendChild(codeBit);
        prose.appendChild(document.createTextNode(' before claiming an action ran, and keep notes out of puppet-master-rs/src/main.rs. TODO markers stay ALL-CAPS.'));
        body.appendChild(prose);
        body.appendChild(elm('p', 'fs-prose-hint', 'Right-click an underlined word (or press Cmd+period) for suggestions, ignore options, and dictionary adds. Nothing is replaced automatically.'));
        try { window.PMSpell.attach(prose, { store: store, projectDict: true }); } catch (e) { /* optional */ }

        var ceiling = elm('div', 'fs-managed-note');
        ceiling.appendChild(icoEl('shield'));
        ceiling.appendChild(elm('span', null, 'Ceiling rule: this persona can narrow behavior, but cannot widen Plan/Review limits, permissions, FileSafe, network access, project access, or a parent agent’s ceilings.'));
        body.appendChild(ceiling);

        if (persona.childOnly) {
          var child = elm('div', 'fs-managed-note');
          child.appendChild(icoEl('users'));
          child.appendChild(elm('span', null, 'Child agents only: this persona never appears in Chat default pickers. Helper agents may adopt it when a parent assigns it.'));
          body.appendChild(child);
        }

        var nav = elm('button', 'fs-navrow');
        nav.type = 'button';
        nav.appendChild(icoEl('gauge'));
        nav.appendChild(elm('span', null, 'Runtime behavior & scope'));
        nav.appendChild(elm('span', 'fs-navrow-note', 'Deeper sheet'));
        nav.addEventListener('click', function () { pushPersonaRuntime(pid); });
        body.appendChild(nav);
      }
    });
  }

  /* Sheet 2 of 3: runtime metadata + the scope picker. */
  function pushPersonaRuntime(pid) {
    var persona = personaById(pid);
    if (!persona) return;
    push({
      id: 'persona-rt-' + pid,
      kind: 'persona-runtime',
      spineLabel: 'Runtime',
      kicker: 'Persona · Runtime',
      title: persona.name + ' at runtime',
      half: true,
      render: function (body) {
        var facts = elm('dl', 'fs-facts');
        factInto(facts, 'Eligible right now', persona.runtime && persona.runtime.eligible ? 'Yes' : 'No — see below');
        factInto(facts, 'Context footprint', persona.runtime ? persona.runtime.footprint : null);
        body.appendChild(facts);
        if (persona.childOnly) {
          body.appendChild(elm('p', 'fs-quiet', 'Not eligible as a Chat default because it is a child-only persona. It becomes active only when a parent agent assigns it to a helper.'));
        }

        body.appendChild(sectionTitle('Where it applies'));
        body.appendChild(elm('p', 'fs-quiet', 'Pick how far a selection of this persona reaches.'));
        var scopes = ['turn', 'thread', 'goal', 'project', 'global', 'child-only'];
        var saved = store.get('personaScope.' + pid) || persona.scopeDefault || 'thread';
        var group = elm('div', 'fs-radios');
        group.setAttribute('role', 'radiogroup');
        group.setAttribute('aria-label', 'Scope for ' + persona.name);
        scopes.forEach(function (sc) {
          var r = elm('button', 'fs-radio');
          r.type = 'button';
          r.setAttribute('role', 'radio');
          var locked = persona.childOnly && sc !== 'child-only';
          r.setAttribute('aria-checked', (persona.childOnly ? sc === 'child-only' : saved === sc) ? 'true' : 'false');
          if (locked) r.setAttribute('aria-disabled', 'true');
          r.appendChild(elm('span', 'fs-radio-dot'));
          r.appendChild(elm('span', null, SCOPE_HUMAN[sc]));
          r.addEventListener('click', function () {
            if (locked) {
              window.PMShell.toast('Child-only personas cannot become Chat or project defaults.');
              return;
            }
            store.set('personaScope.' + pid, sc);
            var all = group.querySelectorAll('.fs-radio');
            for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-checked', 'false');
            r.setAttribute('aria-checked', 'true');
            window.PMShell.status(persona.name + ' now applies to: ' + SCOPE_HUMAN[sc]);
          });
          group.appendChild(r);
        });
        body.appendChild(group);

        var nav = elm('button', 'fs-navrow');
        nav.type = 'button';
        nav.appendChild(icoEl('doc'));
        nav.appendChild(elm('span', null, 'Capsule preview'));
        nav.appendChild(elm('span', 'fs-navrow-note', 'What agents actually receive'));
        nav.addEventListener('click', function () { pushPersonaCapsule(pid); });
        body.appendChild(nav);
      }
    });
  }

  /* Sheet 3 of 3: the compact capsule agents actually receive. */
  function pushPersonaCapsule(pid) {
    var persona = personaById(pid);
    if (!persona) return;
    push({
      id: 'persona-cap-' + pid,
      kind: 'persona-capsule',
      spineLabel: 'Capsule',
      kicker: 'Persona · Capsule',
      title: 'What agents receive',
      half: true,
      render: function (body) {
        body.appendChild(elm('p', 'fs-quiet', 'The compact capsule is the only part injected into a run. The full definition stays here.'));
        var cap = elm('div', 'fs-capsule');
        cap.appendChild(elm('span', 'fs-capsule-kicker', persona.name + ' · ' + (persona.runtime ? persona.runtime.footprint : '')));
        cap.appendChild(document.createTextNode(persona.capsulePreview || ''));
        body.appendChild(cap);
        body.appendChild(elm('p', 'fs-quiet', 'Depth here is deliberate: definition, then runtime, then capsule — each one sheet deeper, each one smaller than the last.'));
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

  /* ============================================= mini managers (rest) */

  var MINI_TITLES = {
    memory: 'Assistant memory',
    crew: 'Crew templates',
    mcp: 'Connected tool servers',
    lsp: 'Language servers',
    skills: 'Skills',
    plugins: 'Plugins',
    tools: 'Tools funnel',
    media: 'Media routes',
    contextSources: 'Context sources',
    dictionary: 'Dictionaries'
  };

  function pushMiniManager(id) {
    push({
      id: 'mini-' + id,
      kind: 'mini',
      spineLabel: MINI_TITLES[id] || 'Manager',
      kicker: 'Manager',
      title: MINI_TITLES[id] || 'Manager',
      render: function (body) { renderMiniManager(body, id); }
    });
  }

  function renderMiniManager(body, id) {
    body.appendChild(elm('p', 'fs-quiet', 'A compact inventory view. The full ' + (MINI_TITLES[id] || 'manager').toLowerCase() + ' surface is explored by a sibling concept; rows here are read-only and honest about it.'));
    var d = data();
    var rows = [];
    if (id === 'memory') {
      (d.memory || []).forEach(function (g) {
        rows.push({ ico: 'brain', title: g.text, note: (g.kind || '') + ' · ' + (g.scope || ''), chip: g.state === 'verified' ? ['default', 'Verified'] : ['not-configured', 'Awaiting review'] });
      });
    } else if (id === 'crew') {
      (d.crew || []).forEach(function (c) {
        rows.push({ ico: 'users', title: c.name, note: c.purpose, chip: ['custom', 'Requested ' + c.requestedConcurrency + ' · running ' + c.effectiveConcurrency] });
      });
    } else if (id === 'mcp') {
      (d.mcp || []).forEach(function (m2) {
        rows.push({ ico: 'plug', title: m2.name, note: (m2.transport || '') + ' · ' + ((m2.tools || []).length) + ' tools', chip: m2.health === 'ok' ? ['default', 'Healthy'] : ['unavailable', 'Needs attention'] });
      });
    } else if (id === 'lsp') {
      (d.lsp || []).forEach(function (l2) {
        rows.push({ ico: 'server', title: l2.language, note: (l2.version || '') + ' · ' + (l2.scope || ''), chip: l2.state === 'installed' ? ['default', 'Installed'] : (l2.state === 'detected' ? ['auto', 'Detected'] : ['not-configured', 'Missing']) });
      });
    } else if (id === 'skills' || id === 'plugins') {
      (d[id] || []).forEach(function (s2) {
        rows.push({ ico: 'sparkle', title: s2.name, note: s2.source || s2.channel || '', chip: (s2.enabled || s2.lifecycle === 'active') ? ['default', 'Enabled'] : ['not-configured', 'Off'] });
      });
    } else if (id === 'tools') {
      (d.tools || []).forEach(function (t2) {
        rows.push({ ico: 'toolbox', title: t2.name, note: 'Installed ' + (t2.installed ? 'yes' : 'no') + ' · selected this turn ' + (t2.selectedThisTurn ? 'yes' : 'no'), chip: t2.available ? ['default', 'Available'] : ['unavailable', 'Unavailable'] });
      });
    } else if (id === 'media') {
      (d.media || []).forEach(function (m3) {
        rows.push({ ico: 'film', title: (m3.purpose || '') + ' via ' + (m3.providerRef || ''), note: m3.native ? 'Native support' : ('Puppet Master transformation. ' + (m3.transformNote || '')), chip: m3.native ? ['default', 'Native'] : ['auto', 'Transformed'] });
      });
    } else if (id === 'dictionary') {
      (d.spell && d.spell.personal || []).forEach(function (w) { rows.push({ ico: 'doc', title: w, note: 'Personal dictionary', chip: ['custom', 'Personal'] }); });
      (d.spell && d.spell.project || []).forEach(function (w) { rows.push({ ico: 'doc', title: w, note: 'Project dictionary', chip: ['custom', 'Project'] }); });
    } else if (id === 'contextSources') {
      var ct = d.contextSources || {};
      ((ct.lastTurn || {}).admitted || []).forEach(function (aRow) {
        rows.push({ ico: 'layers', title: aRow.source, note: 'Admitted last turn · ' + (aRow.why || ''), chip: ['default', (aRow.tokens || 0) + ' tokens'] });
      });
      ((ct.lastTurn || {}).omitted || []).forEach(function (o) {
        rows.push({ ico: 'layers', title: o.source, note: 'Left out last turn · ' + (o.why || ''), chip: ['not-configured', 'Omitted'] });
      });
    }
    if (!rows.length) {
      body.appendChild(elm('p', 'fs-quiet', 'Nothing to show in this scenario.'));
      return;
    }
    rows.slice(0, 40).forEach(function (r) {
      var row = elm('div', 'fs-mrow');
      row.style.cursor = 'default';
      var name = elm('span', 'fs-mrow-name');
      name.appendChild(icoEl(r.ico));
      name.appendChild(elm('span', null, r.title));
      row.appendChild(name);
      row.appendChild(elm('span', 'fs-mrow-note', r.note));
      var st = elm('span', 'fs-mrow-status');
      st.appendChild(chipEl(r.chip[0], r.chip[1]));
      row.appendChild(st);
      body.appendChild(row);
    });
  }

  /* ======================================================== boot */

  function boot() {
    stage = document.getElementById('pmStage');
    if (!stage) return;

    store = window.PMState.init('c3-focus-stack');
    window.PMShell.init({ concept: 'c3-focus-stack', store: store });

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

    // Esc pops the top sheet (menus and overlays intercept their own Esc).
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      var target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      if (layers.length > 1) popTo(layers.length - 2);
    });

    window.PMState.mountStatesDrawer(store);
    window.PMShell.status('Settings Home — one surface at a time.');

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
    var ready = window.PMState && window.PMShell && window.PMSpy && window.PMIcons && window.PM_DATA &&
      document.getElementById('pmStage');
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
