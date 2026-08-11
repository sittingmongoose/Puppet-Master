/* c1-atlas.js — fable · Atlas
   Settings as a well-edited reference manual.
   - Home: full-width search over a grouped directory that morphs in place.
   - Workspace: leader-dot TOC tree, numbered sections, running header,
     marginalia column, inline editing, sequenced "typesetting" stagger.
   - Managers as appendices: A Providers & models, B Memory, C Connected servers,
     D Language servers.
   Consumes _shared APIs exactly as contracted. Plain JS, no build step.
   Slint notes are inline where a technique is web-only. No emoji anywhere. */
(function () {
  'use strict';

  var store = null;
  var spy = null;
  var stage = null;
  var docEl = null;          // current document scroller
  var spellHandles = [];     // PMSpell attachments for the current render
  var tuneOutside = null;    // outside-click closer for the depth/speed menu

  /* ============================ ui state ============================ */

  var ui = {
    view: { kind: 'home' },        // {kind:'home'} | {kind:'domain', id} | {kind:'appendix', id}
    openAdv: {},                   // "domain/sub" -> true
    openDiag: {},                  // domainId -> true
    openProviders: { claude: true },
    openEvidence: {},              // modelId -> true
    openGist: {},                  // gistId -> true
    openCapsule: {},               // gistId -> true (context capsule preview)
    openLog: {},                   // serverId -> true
    openLsp: {},                   // language server id -> true (entry expanded)
    openLspLog: {},                // language server id -> true (log drawer)
    mcpAddOpen: false,             // "Add a server" inline disclosure
    mcpAddTransport: 'stdio',      // chosen transport in the disclosure
    mcpAddName: '',                // typed name in the disclosure
    openConnLog: {},               // providerId -> true (connection log drawer)
    openRetention: false,          // memory: retention & redaction disclosure
    openRecall: false,             // memory: advanced recall dynamics
    unlocked: {},                  // expert settingId -> true (confirmed)
    editingText: {},               // settingId -> true (text override being typed)
    setupStep: {},                 // freeRouteId -> -1 not started / step index / 'done'
    tuneOpen: null,                // modelId whose depth/speed menu is open
    invoke: {},                    // providerId -> 'running'
    mcpBusy: {},                   // serverId -> 'reconnecting'
    whatNext: {},                  // providerId -> chosen option id
    homeQuery: '',
    navQuery: '',
    provQuery: '',
    memQuery: '',
    memShow: 'all',
    navOpen: false                 // narrow contents drawer
  };

  /* ============================ helpers ============================ */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function ico(name) { return '<i data-ico="' + name + '"></i>'; }
  function arr(x) { return Array.isArray(x) ? x : []; }

  function fmtTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    try {
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch (e) { return String(iso); }
  }

  function data() { return store.data || {}; }
  function scenario() { return String(store.get('scenario') || 'baseline'); }
  function calm() { return scenario() === 'calm'; }

  function taxonomy() { return arr(data().taxonomy); }
  function domainById(id) {
    var t = taxonomy();
    for (var i = 0; i < t.length; i++) if (t[i].id === id) return t[i];
    return null;
  }
  function getSetting(id) { return (data().settings || {})[id] || null; }

  function locIndex() {
    var idx = {};
    taxonomy().forEach(function (dom) {
      arr(dom.subs).forEach(function (sub, i) {
        arr(sub.settingIds).forEach(function (sid) {
          idx[sid] = { domainId: dom.id, subId: sub.id, num: dom.num + '.' + (i + 1) };
        });
      });
    });
    return idx;
  }

  var PARTS = [
    { label: 'Part I — Everyday workspace', domains: ['general', 'appearance'] },
    { label: 'Part II — Agents & safety', domains: ['agents', 'permissions'] },
    { label: 'Part III — The working craft', domains: ['code', 'context', 'planning', 'collaboration'] },
    { label: 'Part IV — Reach & machinery', domains: ['extensions', 'media', 'system'] }
  ];

  var APPENDICES = [
    { id: 'providers', letter: 'A', title: 'Providers & models', blurb: 'Every route work can take: signed-in tools, accounts, API keys, servers, and free routes.' },
    { id: 'memory', letter: 'B', title: 'Memory', blurb: 'What the Assistant remembers, with the evidence behind each gist.' },
    { id: 'mcp', letter: 'C', title: 'Connected servers', blurb: 'MCP servers, their discovered tools and resources, health, and approval policies.' },
    { id: 'lsp', letter: 'D', title: 'Language servers', blurb: 'One server per language: who supplies completions, who formats, and who owns diagnostics.' }
  ];
  function appendixById(id) {
    for (var i = 0; i < APPENDICES.length; i++) if (APPENDICES[i].id === id) return APPENDICES[i];
    return null;
  }

  var SCOPE_WORDS = {
    global: 'Everywhere', project: 'This project', thread: 'This conversation',
    turn: 'This turn', goal: 'This Goal run', account: 'Per account',
    persona: 'Per persona', run: 'Per run', session: 'This session'
  };
  function scopeLine(s) {
    var parts = arr(s.scope).map(function (x) {
      var w = SCOPE_WORDS[x];
      if (w) return w;
      var t = String(x);
      return 'Per ' + t.charAt(0).toLowerCase() + t.slice(1); // never a raw token
    });
    return parts.length ? parts.join(' · ') : '';
  }

  var EXPOSURE_WORDS = {
    standard: '', advanced: 'Advanced', expert: 'Expert', managed: 'Managed',
    diagnostic: 'Diagnostic', unavailable: 'Unavailable'
  };

  /* stagger helper: reading-order cadence, capped at 8 steps, silent in calm */
  function mkStagger() {
    var i = 0;
    return function () {
      if (calm()) return '';
      var step = Math.min(i, 8);
      i += 1;
      return ' atlas-set" style="--set-i:' + step + ';';
    };
  }

  function detachSpells() {
    spellHandles.forEach(function (h) { try { h.detach(); } catch (e) { /* ignore */ } });
    spellHandles = [];
  }

  function hydrate() { try { window.PMIcons.hydrate(stage); } catch (e) { /* ignore */ } }

  function persistView() { store.set('view', ui.view); }

  function setStatus(msg) { try { window.PMShell.status(msg); } catch (e) { /* ignore */ } }
  function setStatusRight(msg) {
    var el = document.getElementById('pmStatusRight');
    if (el) el.textContent = msg;
  }

  /* ============================ status summaries ============================ */

  function domainNotices(domId) {
    return arr(data().notices).filter(function (n) { return n && n.target && n.target.domain === domId; });
  }
  function domainStatus(dom) {
    var ns = domainNotices(dom.id);
    var att = ns.filter(function (n) { return n.kind === 'attention'; }).length;
    var setup = ns.filter(function (n) { return n.kind === 'setup'; }).length;
    if (att > 0) return { text: att === 1 ? '1 item needs attention' : att + ' items need attention', tone: 'attention', n: att };
    if (setup > 0) return { text: 'Setup underway', tone: 'setup', n: setup };
    var count = arr(dom.subs).reduce(function (a, s) { return a + arr(s.settingIds).length; }, 0);
    return { text: count + ' entries', tone: 'muted', short: count + ' entries' };
  }

  function providerBadStates(p) {
    return p.status === 'signed-out' || p.status === 'auth-no-invoke' || p.status === 'degraded';
  }
  function appendixStatus(appId) {
    var d = data();
    if (appId === 'providers') {
      var bad = arr(d.providers).filter(providerBadStates).length;
      if (bad > 0) return { text: bad === 1 ? '1 route needs attention' : bad + ' routes need attention', tone: 'attention', n: bad };
      return { text: arr(d.providers).length + ' connections', tone: 'muted', short: arr(d.providers).length + ' routes' };
    }
    if (appId === 'memory') {
      var waiting = arr(d.memory).filter(function (g) { return g.state === 'awaiting-review'; }).length;
      if (waiting > 0) return { text: waiting === 1 ? '1 gist awaiting review' : waiting + ' gists awaiting review', tone: 'setup', n: waiting };
      return { text: arr(d.memory).length + ' gists', tone: 'muted', short: arr(d.memory).length + ' gists' };
    }
    if (appId === 'mcp') {
      var down = arr(d.mcp).filter(function (s) { return s.health !== 'connected'; }).length;
      if (down > 0) return { text: down === 1 ? '1 server disconnected' : down + ' servers disconnected', tone: 'attention', n: down };
      return { text: arr(d.mcp).length + ' servers connected', tone: 'muted', short: arr(d.mcp).length + ' servers' };
    }
    if (appId === 'lsp') {
      var missing = arr(d.lsp).filter(function (s) { return s && s.state === 'missing'; }).length;
      if (missing > 0) return { text: missing === 1 ? '1 server not installed' : missing + ' servers not installed', tone: 'attention', n: missing };
      return { text: arr(d.lsp).length + ' language servers', tone: 'muted', short: arr(d.lsp).length + ' servers' };
    }
    return { text: '', tone: 'muted', short: '' };
  }

  /* Two-step connection status: authentication and readiness are separate. */
  function providerStatusWords(p) {
    var authWord = { tool: 'Signed in', account: 'Signed in', api: 'Key active', server: 'Connected', free: 'Available' }[p.groupKind] || 'Connected';
    switch (p.status) {
      case 'ready': return [{ w: authWord, t: 'ok' }, { w: 'Ready', t: 'ok' }];
      case 'not-installed': return [{ w: 'Not installed', t: 'muted' }];
      case 'signed-out': return [{ w: 'Installed', t: 'muted' }, { w: 'Signed out', t: 'attention' }];
      case 'auth-no-invoke': return [{ w: authWord, t: 'ok' }, { w: 'Not ready', t: 'attention' }];
      case 'degraded': return [{ w: authWord, t: 'ok' }, { w: 'Degraded', t: 'attention' }];
      case 'refreshing': return [{ w: authWord, t: 'ok' }, { w: 'Refreshing', t: 'setup' }];
      default: return [{ w: authWord, t: 'muted' }];
    }
  }
  function statusWordHtml(word, tone) {
    return '<span class="pm-status-word" data-tone="' + esc(tone) + '">' + esc(word) + '</span>';
  }

  /* ============================ HOME ============================ */

  function renderHome() {
    detachSpells();
    ui.view = { kind: 'home' };
    persistView();
    var d = data();
    var st = mkStagger();
    var settingsCount = Object.keys(d.settings || {}).length;

    var html = '<div class="atlas"><div class="atlas-home" id="atlasHome"><div class="atlas-home-inner">';

    html += '<header class="atlas-masthead' + st() + '">' +
      '<h1>Settings</h1>' +
      '<p class="atlas-edition">A reference manual for this workspace · Edition of August 5, 2026 · ' +
      settingsCount + ' entries in 11 sections and ' + APPENDICES.length + ' appendices</p>' +
      '<div class="atlas-masthead-rule"></div></header>';

    html += '<div class="atlas-search' + st() + '">' + ico('search') +
      '<input type="text" id="atlasHomeSearch" placeholder="Search the manual — settings, appendices, actions" ' +
      'aria-label="Search settings" autocomplete="off" value="' + esc(ui.homeQuery) + '">' +
      '<span class="atlas-search-hint">Results keep their section headings</span></div>';

    if (d.managedWorkspace && d.managedWorkspace.active) {
      html += '<div class="atlas-managed-banner' + st() + '">' + ico('lock') +
        '<span><strong>' + esc(d.managedWorkspace.label) + '.</strong> ' + esc(d.managedWorkspace.note) + '</span></div>';
    }

    html += '<div id="atlasNotices">' + noticesHtml(st) + '</div>';
    html += '<div class="atlas-directory" id="atlasDirectory">' + directoryHtml(ui.homeQuery, st) + '</div>';
    html += '<div id="atlasRecents">' + recentsHtml(st) + '</div>';

    html += '</div></div></div>';
    stage.innerHTML = html;
    hydrate();

    var input = document.getElementById('atlasHomeSearch');
    if (input) {
      input.addEventListener('input', function () {
        ui.homeQuery = input.value;
        var dir = document.getElementById('atlasDirectory');
        if (dir) { dir.innerHTML = directoryHtml(ui.homeQuery, function () { return ''; }); hydrate(); }
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var first = stage.querySelector('#atlasDirectory [data-result]');
          if (first) first.click();
        } else if (e.key === 'Escape' && input.value) {
          input.value = ''; ui.homeQuery = '';
          var dir = document.getElementById('atlasDirectory');
          if (dir) { dir.innerHTML = directoryHtml('', function () { return ''; }); hydrate(); }
        }
      });
    }
    setStatus('Settings home — the directory');
    setStatusRight('Scenario: ' + scenario());
  }

  function noticesHtml(st) {
    var d = data();
    var groups = [
      { kind: 'attention', title: 'Needs attention' },
      { kind: 'setup', title: 'Continue setup' },
      { kind: 'recommended', title: 'Worth considering' }
    ];
    var all = arr(d.notices);
    if (all.length === 0) {
      return '<div class="atlas-calm' + st() + '">' + ico('checkCircle') +
        '<span>Nothing needs attention. The manual is in good order; browse the directory below.</span></div>';
    }
    var html = '<div class="atlas-notices">';
    groups.forEach(function (g) {
      var items = all.filter(function (n) { return n && n.kind === g.kind; });
      if (!items.length) return;
      html += '<div class="atlas-notice-head' + st() + '">' + esc(g.title) +
        '<span class="atlas-count">' + items.length + '</span></div>';
      items.forEach(function (n) {
        var r = window.PMState.resolveNotice(n);
        html += '<article class="atlas-notice' + st() + '" data-tone="' + esc(r.tone) + '">' +
          '<div class="atlas-notice-headline">' + esc(r.headline) + '</div>' +
          statusWordHtml(r.statusWord, r.tone === 'attention' ? 'attention' : (r.tone === 'setup' ? 'setup' : 'recommended')) +
          '<p class="atlas-notice-consequence">' + esc(r.consequence) + '</p>' +
          '<div class="atlas-notice-acts">' +
          '<button type="button" class="atlas-btn is-primary" data-act="notice-primary" data-notice="' + esc(n.id) + '">' + esc(r.primary.label || 'Open') + '</button>' +
          (r.secondary ? '<button type="button" class="atlas-btn-quiet" data-act="notice-secondary" data-notice="' + esc(n.id) + '">' + esc(r.secondary.label) + '</button>' : '') +
          '</div></article>';
      });
    });
    html += '</div>';
    return html;
  }

  function dirRowHtml(opts) {
    return '<button type="button" class="atlas-dir-row' + (opts.appendix ? ' is-appendix' : '') + (opts.st || '') + '" ' +
      opts.data + (opts.result ? ' data-result="1"' : '') + '>' +
      '<span class="atlas-dir-num">' + esc(opts.num) + '</span>' +
      '<span class="atlas-dir-main"><span class="atlas-dir-title">' + esc(opts.title) + '</span>' +
      (opts.purpose ? '<span class="atlas-dir-purpose">' + esc(opts.purpose) + '</span>' : '') +
      (opts.crumb ? '<span class="atlas-dir-crumb">' + esc(opts.crumb) + '</span>' : '') +
      '</span>' +
      '<span class="atlas-dir-status">' + (opts.statusHtml || '') + '</span>' +
      ico('chevR') + '</button>';
  }

  function directoryHtml(query, st) {
    var q = String(query || '').trim();
    if (!q) return directoryListingHtml(st);
    return directoryResultsHtml(q);
  }

  function directoryListingHtml(st) {
    var html = '';
    PARTS.forEach(function (part) {
      html += '<div class="atlas-dir-part' + st() + '">' + esc(part.label) + '</div>';
      part.domains.forEach(function (domId) {
        var dom = domainById(domId);
        if (!dom) return;
        var s = domainStatus(dom);
        html += dirRowHtml({
          num: dom.num, title: dom.title, purpose: dom.blurb, st: st(),
          statusHtml: s.tone === 'muted' ? esc(s.text) : statusWordHtml(s.text, s.tone),
          data: 'data-act="open-domain" data-domain="' + esc(dom.id) + '"'
        });
      });
    });
    html += '<div class="atlas-dir-part' + st() + '">Appendices — the managers</div>';
    APPENDICES.forEach(function (app) {
      var s = appendixStatus(app.id);
      html += dirRowHtml({
        num: 'App. ' + app.letter, title: app.title, purpose: app.blurb, appendix: true, st: st(),
        statusHtml: s.tone === 'muted' ? esc(s.text) : statusWordHtml(s.text, s.tone),
        data: 'data-act="open-appendix" data-appendix="' + esc(app.id) + '"'
      });
    });
    return html;
  }

  function partForDomain(domId) {
    for (var i = 0; i < PARTS.length; i++) {
      if (PARTS[i].domains.indexOf(domId) >= 0) return PARTS[i];
    }
    return null;
  }

  function directoryResultsHtml(q) {
    var results = window.PMState.search(q, data());
    var idx = locIndex();
    if (!results.length) {
      return '<div class="atlas-dir-part">Results</div>' +
        '<div class="atlas-dir-empty">No entries match "' + esc(q) + '". The directory returns as you clear the search.</div>';
    }
    // Group results under the same persistent part headers as the listing.
    var buckets = {};
    var order = [];
    function bucket(label) {
      if (!buckets[label]) { buckets[label] = []; order.push(label); }
      return buckets[label];
    }
    results.forEach(function (r) {
      if (r.kind === 'manager') { bucket('Appendices — the managers').push(r); return; }
      var part = partForDomain(r.domainId);
      bucket(part ? part.label : 'Elsewhere in the manual').push(r);
    });
    // Groups keep their headings but lead with the best match, so Enter
    // (which activates the first row) always lands on the top-scored result.
    function bestScore(label) {
      return buckets[label].reduce(function (a, r) { return Math.max(a, r.score || 0); }, 0);
    }
    var labels = order.slice().sort(function (a, b) { return bestScore(b) - bestScore(a); });
    var html = '';
    labels.forEach(function (label) {
      html += '<div class="atlas-dir-part">' + esc(label) + '</div>';
      buckets[label].forEach(function (r) {
        html += resultRowHtml(r, idx);
      });
    });
    return html;
  }

  function resultRowHtml(r, idx) {
    var crumb = '';
    var num = '·';
    var statusHtml = '';
    if (r.kind === 'setting') {
      var loc = idx[r.id];
      var dom = loc && domainById(loc.domainId);
      var sub = dom && arr(dom.subs).filter(function (s) { return s.id === loc.subId; })[0];
      crumb = (dom ? dom.title : '') + (sub ? ' › ' + sub.title : '');
      num = loc ? loc.num : '·';
      var expo = EXPOSURE_WORDS[r.exposure] || '';
      if (expo) statusHtml = statusWordHtml(expo, r.exposure === 'unavailable' ? 'muted' : 'setup');
      return dirRowHtml({
        num: num, title: r.label, crumb: crumb, statusHtml: statusHtml, result: true,
        data: 'data-act="open-result" data-kind="setting" data-id="' + esc(r.id) + '"'
      });
    }
    if (r.kind === 'manager') {
      var m = managerTarget(r.id);
      var mDom = domainById(r.domainId);
      crumb = m.appendix ? 'Appendix ' + appendixById(m.appendix).letter : (mDom ? 'In section ' + mDom.num : 'Manager');
      return dirRowHtml({
        num: m.appendix ? 'App. ' + appendixById(m.appendix).letter : '·', title: r.label, crumb: crumb,
        appendix: !!m.appendix, result: true,
        data: 'data-act="open-result" data-kind="manager" data-id="' + esc(r.id) + '"'
      });
    }
    // action (from a notice)
    return dirRowHtml({
      num: '·', title: r.label, crumb: 'Notice action', result: true,
      data: 'data-act="open-result" data-kind="action" data-id="' + esc(r.id) + '"'
    });
  }

  function recentsHtml(st) {
    var rec = arr(data().recents);
    if (!rec.length) return '';
    var html = '<div class="atlas-recents"><div class="atlas-dir-part' + st() + '">Recently amended</div>';
    rec.forEach(function (r) {
      html += '<button type="button" class="atlas-recent-row' + st() + '" data-act="open-recent" data-recent="' + esc(r.id) + '">' +
        ico('history') +
        '<span class="atlas-recent-label">' + esc(r.label) + '</span>' +
        '<span class="atlas-recent-detail">' + esc(r.detail) + '</span></button>';
    });
    html += '</div>';
    return html;
  }

  /* ============================ WORKSPACE SHELL ============================ */

  function workFrameHtml(navInner, pageInner, runheadWhere) {
    return '<div class="atlas"><div class="atlas-work">' +
      '<nav class="atlas-nav' + (ui.navOpen ? ' is-open' : '') + '" id="atlasNav" aria-label="Contents">' + navInner + '</nav>' +
      '<button type="button" class="atlas-nav-scrim' + (ui.navOpen ? ' is-open' : '') + '" id="atlasScrim" aria-label="Close contents"></button>' +
      '<div class="atlas-doc" id="atlasDoc">' +
      '<div class="atlas-runhead">' +
      '<button type="button" class="atlas-contents-btn" data-act="toggle-contents" aria-expanded="' + (ui.navOpen ? 'true' : 'false') + '">' + ico('list') + 'Contents</button>' +
      '<span class="atlas-runhead-where" id="atlasRunWhere">' + esc(runheadWhere) + '</span>' +
      '<span class="atlas-runhead-book">Puppet Master — Settings</span>' +
      '</div>' +
      '<div class="atlas-page">' + pageInner + '</div>' +
      '</div></div></div>';
  }

  function navSearchHtml(id) {
    return '<div class="atlas-nav-search">' + ico('search') +
      '<input type="text" id="' + id + '" placeholder="Search the manual" aria-label="Search settings" autocomplete="off"></div>';
  }

  /* Tree statuses are compact (icon + count) so nothing ever clips in the
     302px column; the full phrase rides along as the accessible name. */
  function navStatusHtml(s) {
    if (s.tone === 'muted') {
      return '<span class="atlas-toc-status" data-tone="muted">' + esc(s.short || s.text) + '</span>';
    }
    var icon = s.tone === 'attention' ? 'warning' : 'clipboard';
    return '<span class="atlas-toc-status" data-tone="' + esc(s.tone) + '" role="img" aria-label="' + esc(s.text) + '" title="' + esc(s.text) + '">' +
      ico(icon) + (typeof s.n === 'number' ? '<span>' + s.n + '</span>' : '') + '</span>';
  }

  function navTreeHtml(active) {
    // active: {kind:'domain', id} | {kind:'appendix', id}
    var html = navSearchHtml('atlasNavSearch');
    html += '<div id="atlasNavTree">';
    html += '<button type="button" class="atlas-toc-entry atlas-toc-home" data-act="open-home">' +
      '<span class="atlas-toc-num">' + ico('arrowL') + '</span>' +
      '<span class="atlas-toc-title">Settings home — the directory</span></button>';
    html += '<div class="atlas-toc-label">Sections</div>';
    taxonomy().forEach(function (dom) {
      var isActive = active.kind === 'domain' && active.id === dom.id;
      var s = domainStatus(dom);
      html += '<button type="button" class="atlas-toc-entry" data-act="open-domain" data-domain="' + esc(dom.id) + '"' +
        (isActive ? ' aria-current="true"' : '') + '>' +
        '<span class="atlas-toc-num">' + esc(dom.num) + '</span>' +
        '<span class="atlas-toc-title">' + esc(dom.title) + '</span>' +
        '<span class="atlas-leader"></span>' +
        (isActive ? '' : navStatusHtml(s)) + '</button>';
      if (isActive) {
        html += '<div class="atlas-toc-subs" id="atlasTocSubs">';
        arr(dom.subs).forEach(function (sub, i) {
          var secId = 'sec-' + dom.id + '-' + sub.id;
          html += '<button type="button" class="atlas-toc-sub" data-act="jump-sub" data-sec="' + esc(secId) + '">' +
            '<span class="atlas-toc-num">' + esc(dom.num + '.' + (i + 1)) + '</span>' +
            '<span class="atlas-toc-title">' + esc(sub.title) + '</span>' +
            '<span class="atlas-leader"></span></button>';
        });
        if (domainDiagnostics(dom).length) {
          html += '<button type="button" class="atlas-toc-sub" data-act="jump-sub" data-sec="sec-' + esc(dom.id) + '-diagnostics">' +
            '<span class="atlas-toc-num">·</span><span class="atlas-toc-title">Diagnostics drawer</span>' +
            '<span class="atlas-leader"></span></button>';
        }
        html += '<span class="atlas-ink" id="atlasInk" aria-hidden="true"></span></div>';
      }
    });
    html += '<div class="atlas-toc-label">Appendices</div>';
    APPENDICES.forEach(function (app) {
      var isActive = active.kind === 'appendix' && active.id === app.id;
      var s = appendixStatus(app.id);
      html += '<button type="button" class="atlas-toc-entry is-appendix" data-act="open-appendix" data-appendix="' + esc(app.id) + '"' +
        (isActive ? ' aria-current="true"' : '') + '>' +
        '<span class="atlas-toc-num">' + esc(app.letter) + '</span>' +
        '<span class="atlas-toc-title">' + esc(app.title) + '</span>' +
        '<span class="atlas-leader"></span>' +
        (isActive ? '' : navStatusHtml(s)) + '</button>';
      if (isActive) {
        html += '<div class="atlas-toc-subs" id="atlasTocSubs">';
        appendixSections(app.id).forEach(function (sec) {
          html += '<button type="button" class="atlas-toc-sub" data-act="jump-sub" data-sec="' + esc(sec.id) + '">' +
            '<span class="atlas-toc-num">' + esc(sec.num) + '</span>' +
            '<span class="atlas-toc-title">' + esc(sec.short || sec.title) + '</span>' +
            '<span class="atlas-leader"></span></button>';
        });
        html += '<span class="atlas-ink" id="atlasInk" aria-hidden="true"></span></div>';
      }
    });
    html += '</div><div id="atlasNavResults" hidden></div>';
    return html;
  }

  function wireNavSearch() {
    var input = document.getElementById('atlasNavSearch');
    if (!input) return;
    var tree = document.getElementById('atlasNavTree');
    var out = document.getElementById('atlasNavResults');
    input.value = ui.navQuery || '';
    function apply() {
      var q = input.value.trim();
      ui.navQuery = q;
      if (!q) { tree.hidden = false; out.hidden = true; out.innerHTML = ''; return; }
      var results = window.PMState.search(q, data()).slice(0, 20);
      var idx = locIndex();
      var html = '<div class="atlas-toc-label">Results</div>';
      if (!results.length) html += '<div class="atlas-dir-empty">No matches.</div>';
      results.forEach(function (r) { html += resultRowHtml(r, idx); });
      out.innerHTML = html;
      tree.hidden = true; out.hidden = false;
      hydrate();
    }
    input.addEventListener('input', apply);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; apply(); }
      if (e.key === 'Enter') {
        var first = out.querySelector('[data-result]');
        if (first) first.click();
      }
    });
    if (ui.navQuery) apply();
  }

  /* ink marker follows the active TOC entry; slides in full motion,
     teleports under reduced motion (transition zeroed by the shell CSS). */
  function positionInk(secId) {
    var ink = document.getElementById('atlasInk');
    var subs = document.getElementById('atlasTocSubs');
    if (!ink || !subs) return;
    var target = subs.querySelector('[data-sec="' + secId + '"]');
    var all = subs.querySelectorAll('.atlas-toc-sub');
    for (var i = 0; i < all.length; i++) all[i].classList.toggle('is-active', all[i] === target);
    if (!target) { ink.style.opacity = '0'; return; }
    ink.style.opacity = '1';
    ink.style.top = (target.offsetTop + target.offsetHeight / 2 - 3) + 'px';
  }

  function attachSpy(getSections, labelFor) {
    if (spy) { try { spy.dispose(); } catch (e) { /* ignore */ } spy = null; }
    docEl = document.getElementById('atlasDoc');
    if (!docEl) return;
    var runhead = docEl.querySelector('.atlas-runhead');
    var offset = (runhead ? runhead.offsetHeight : 44) + 10;
    spy = window.PMSpy.attach({
      scroller: docEl,
      topOffset: offset,
      getSections: getSections,
      onChange: function (id) {
        var where = document.getElementById('atlasRunWhere');
        if (where) where.textContent = labelFor(id);
        positionInk(id);
      }
    });
    // Initialize header + ink to the current active section.
    if (spy.state.activeId) {
      var where = document.getElementById('atlasRunWhere');
      if (where) where.textContent = labelFor(spy.state.activeId);
      positionInk(spy.state.activeId);
    }
  }

  /* ============================ DOMAIN DOCUMENT ============================ */

  function domainDiagnostics(dom) {
    var out = [];
    arr(dom.subs).forEach(function (sub) {
      arr(sub.settingIds).forEach(function (sid) {
        var s = getSetting(sid);
        if (s && s.exposure === 'diagnostic') out.push(s);
      });
    });
    return out;
  }

  function openDomain(domId, opts) {
    opts = opts || {};
    var dom = domainById(domId);
    if (!dom) return;
    detachSpells();
    closeTune();
    ui.view = { kind: 'domain', id: domId };
    ui.navOpen = false;
    persistView();

    var st = mkStagger();
    var page = '';
    arr(dom.subs).forEach(function (sub, i) {
      page += sectionHtml(dom, sub, i, st);
    });
    page += diagnosticsHtml(dom, st);

    stage.innerHTML = workFrameHtml(
      navTreeHtml({ kind: 'domain', id: domId }),
      page,
      dom.num + ' — ' + dom.title
    );
    hydrate();
    wireNavSearch();
    wireProseFields();

    var labelFor = function (secId) {
      var m = secId.match(/^sec-[^-]+-(.+)$/);
      var subId = m ? m[1] : '';
      if (subId === 'diagnostics') return dom.num + ' ' + dom.title + ' — Diagnostics';
      var idx2 = -1;
      arr(dom.subs).forEach(function (s2, j) { if (s2.id === subId) idx2 = j; });
      if (idx2 < 0) return dom.num + ' — ' + dom.title;
      return dom.num + '.' + (idx2 + 1) + '  ' + arr(dom.subs)[idx2].title;
    };
    attachSpy(function () {
      return Array.prototype.slice.call(stage.querySelectorAll('.atlas-section'));
    }, labelFor);

    setStatus('Reading section ' + dom.num + ' — ' + dom.title);
    setStatusRight('Scenario: ' + scenario());
  }

  var XREFS = {
    'agents/routing': { app: 'providers', label: 'Appendix A — Providers & models' },
    'agents/accounts': { app: 'providers', label: 'Appendix A — Providers & models' },
    'context/memory': { app: 'memory', label: 'Appendix B — Memory' },
    'extensions/mcp': { app: 'mcp', label: 'Appendix C — Connected servers' },
    'code/language': { app: 'lsp', label: 'Appendix D — Language servers' }
  };

  function sectionHtml(dom, sub, i, st) {
    var num = dom.num + '.' + (i + 1);
    var subKey = dom.id + '/' + sub.id;
    var settings = arr(sub.settingIds).map(getSetting).filter(Boolean);
    var standard = settings.filter(function (s) { return s.exposure === 'standard' || s.exposure === 'managed' || s.exposure === 'unavailable'; });
    var advanced = settings.filter(function (s) { return s.exposure === 'advanced'; });
    var expert = settings.filter(function (s) { return s.exposure === 'expert'; });

    var html = '<section class="atlas-section" id="sec-' + esc(dom.id) + '-' + esc(sub.id) + '">' +
      '<div class="atlas-sec-head' + st() + '"><span class="atlas-sec-num">' + esc(num) + '</span>' +
      '<h2 class="atlas-sec-title">' + esc(sub.title) + '</h2></div>' +
      '<div class="atlas-rule' + st() + '"></div>' +
      '<p class="atlas-prologue' + st() + '">' + esc(sub.blurb) + '</p>';

    var xref = XREFS[subKey];
    if (xref) {
      html += '<p class="atlas-xref' + st() + '">See <button type="button" data-act="open-appendix" data-appendix="' +
        esc(xref.app) + '">' + esc(xref.label) + '</button> for the full inventory.</p>';
    }

    standard.forEach(function (s) { html += rowHtml(s, st()); });

    // Operational pairing: the wave warning sits with the concurrency ceiling.
    if (sub.settingIds.indexOf('planning.goal.concurrency-ceiling') >= 0) {
      var op = data().operational || {};
      var ceil = getSetting('planning.goal.concurrency-ceiling');
      var cur = ceil && (ceil.value !== undefined ? ceil.value : ceil['default']);
      if (op.waveWarning && typeof cur === 'number' && cur > (op.sustainableNow || 0)) {
        html += '<div class="atlas-opnote' + st() + '">' + ico('warning') +
          '<span><strong>Operational note.</strong> ' + esc(op.waveWarning) + ' ' + esc(op.reason || '') + '</span></div>';
      }
    }

    if (advanced.length || expert.length) {
      var open = !!ui.openAdv[subKey];
      var count = advanced.length + expert.length;
      html += '<button type="button" class="atlas-adv-btn" data-act="toggle-adv" data-subkey="' + esc(subKey) + '" aria-expanded="' + open + '">' +
        '<i data-ico="chevD" class="atlas-chev"></i>' +
        '<span>Advanced — ' + count + (count === 1 ? ' further entry' : ' further entries') +
        (expert.length ? ', including expert material' : '') + '</span></button>';
      if (open) {
        html += '<div class="atlas-adv-body">';
        advanced.forEach(function (s) { html += rowHtml(s, ''); });
        if (expert.length) {
          html += '<div class="atlas-caution"><div class="atlas-caution-head">' + ico('warning') +
            'Expert — read the margin before changing</div>' +
            '<p class="atlas-caution-note">These entries can break running work or remove protections. ' +
            'Each stays locked until you deliberately unlock it; unlocking is the confirmation.</p>';
          expert.forEach(function (s) { html += rowHtml(s, ''); });
          html += '</div>';
        }
        html += '</div>';
      }
    }

    // Spellcheck proofing sample lives with the writing entries.
    if (subKey === 'general/writing') {
      html += proseDemoHtml(st);
    }

    html += '</section>';
    return html;
  }

  function diagnosticsHtml(dom, st) {
    var diags = domainDiagnostics(dom);
    if (!diags.length) return '';
    var open = !!ui.openDiag[dom.id];
    var html = '<section class="atlas-section atlas-diag" id="sec-' + esc(dom.id) + '-diagnostics">' +
      '<div class="atlas-sec-head' + st() + '"><span class="atlas-sec-num">' + esc(dom.num) + '.d</span>' +
      '<h2 class="atlas-sec-title">Diagnostics drawer</h2></div>' +
      '<div class="atlas-rule' + st() + '"></div>' +
      '<p class="atlas-prologue' + st() + '">Read-mostly instruments for troubleshooting. They change nothing on their own.</p>' +
      '<button type="button" class="atlas-adv-btn" data-act="toggle-diag" data-domain="' + esc(dom.id) + '" aria-expanded="' + open + '">' +
      '<i data-ico="chevD" class="atlas-chev"></i><span>' + (open ? 'Close the drawer' : 'Open the diagnostics drawer — ' + diags.length + ' instruments') + '</span></button>';
    if (open) {
      html += '<div class="atlas-diag-body">';
      diags.forEach(function (s) { html += rowHtml(s, ''); });
      html += '<p class="atlas-diag-note">Diagnostic output stays on this machine.</p></div>';
    }
    html += '</section>';
    return html;
  }

  /* ---------------- setting rows ---------------- */

  function rowHtml(s, stAttr) {
    var st = window.PMState.resolveRowState(s);
    var inert = !st.editable;
    var html = '<div class="atlas-row' + (inert ? ' is-inert' : '') + (stAttr || '') + '" id="row-' + esc(s.id) + '">';
    html += '<div class="atlas-row-main">' +
      '<div class="atlas-row-label">' + esc(s.label) + '</div>' +
      '<p class="atlas-row-desc">' + esc(s.desc) + '</p>' +
      controlHtml(s, st) + '</div>';
    html += margHtml(s, st);
    html += '</div>';
    return html;
  }

  function margHtml(s, st) {
    var html = '<div class="atlas-marg">';
    if (st.statusTone === 'attention' || st.statusTone === 'setup' || st.statusTone === 'recommended') {
      var word = { attention: 'Attention', setup: 'Setup', recommended: 'Recommended' }[st.statusTone];
      html += statusWordHtml(word, st.statusTone);
    }
    st.chips.forEach(function (c) {
      html += '<span class="pm-chip-value" data-kind="' + esc(c.kind) + '">' + esc(c.label) + '</span>';
    });
    html += '<span class="atlas-marg-note">' + esc(st.sourceLabel) + '</span>';
    var sc = scopeLine(s);
    if (sc) html += '<span>Scope: ' + esc(sc) + '</span>';
    st.flags.forEach(function (f) {
      html += '<span class="atlas-marg-flag">' + ico(f.icon) + esc(f.label) + '</span>';
    });
    if (s.riskNote) html += '<span class="atlas-marg-risk">' + esc(s.riskNote) + '</span>';
    if (s.effectiveReason) html += '<span class="atlas-marg-note">' + esc(s.effectiveReason) + '</span>';
    html += '</div>';
    return html;
  }

  function cur(s) { return s.value !== undefined ? s.value : s['default']; }

  function optionsOf(s) {
    return arr(s.options).map(function (o) {
      if (o && typeof o === 'object') return { value: o.value !== undefined ? o.value : o.id, label: o.label || String(o.value) };
      return { value: o, label: String(o) };
    });
  }

  function controlHtml(s, st) {
    if (!st.editable) {
      return '<div class="atlas-ctl"><span class="atlas-inert-value">' + esc(st.valueLabel) + '</span></div>';
    }
    var locked = s.exposure === 'expert' && !ui.unlocked[s.id];
    if (locked) {
      return '<div class="atlas-ctl"><span class="atlas-inert-value">' + esc(st.valueLabel) + '</span>' +
        '<button type="button" class="atlas-btn" data-act="unlock-expert" data-setting="' + esc(s.id) + '">' +
        ico('unlock') + 'Unlock to edit</button></div>';
    }
    var html = '<div class="atlas-ctl">';
    var v = cur(s);
    var type = s.type;

    if (type === 'toggle') {
      html += '<button type="button" class="atlas-switch" role="switch" aria-checked="' + (v ? 'true' : 'false') +
        '" data-act="toggle-setting" data-setting="' + esc(s.id) + '" aria-label="' + esc(s.label) + '"></button>' +
        '<span class="atlas-switch-text">' + (v ? 'On' : 'Off') + '</span>';
    } else if (type === 'radio') {
      html += '<div class="atlas-seg" role="group" aria-label="' + esc(s.label) + '">';
      optionsOf(s).forEach(function (o) {
        html += '<button type="button" aria-pressed="' + (o.value === v ? 'true' : 'false') +
          '" data-act="set-option" data-setting="' + esc(s.id) + '" data-value="' + esc(o.value) + '">' + esc(o.label) + '</button>';
      });
      html += '</div>';
    } else if (type === 'select') {
      html += '<select data-setting="' + esc(s.id) + '" data-type="select" aria-label="' + esc(s.label) + '">';
      var opts = optionsOf(s);
      var seen = false;
      opts.forEach(function (o) {
        var sel = String(o.value) === String(v);
        if (sel) seen = true;
        html += '<option value="' + esc(o.value) + '"' + (sel ? ' selected' : '') + '>' + esc(o.label) + '</option>';
      });
      if (!seen && v !== undefined && v !== null && v !== '') {
        html += '<option value="' + esc(v) + '" selected>' + esc(String(v)) + '</option>';
      }
      html += '</select>';
    } else if (type === 'number') {
      html += '<input type="number" value="' + esc(v == null ? '' : v) + '" data-setting="' + esc(s.id) + '" data-type="number" aria-label="' + esc(s.label) + '">';
    } else if (type === 'slider') {
      html += '<input type="range" min="0" max="100" value="' + esc(v == null ? 50 : v) + '" data-setting="' + esc(s.id) + '" data-type="number" aria-label="' + esc(s.label) + '">' +
        '<span class="atlas-range-value">' + esc(v == null ? '' : v) + '</span>';
    } else if (type === 'text' || type === 'path') {
      var blank = (v === undefined || v === null || v === '');
      if (blank && s.valueSource !== 'custom' && !ui.editingText[s.id]) {
        // A blank input never stands for auto/inherit/not-configured — the
        // explicit chip in the margin carries the meaning; this is the entry point.
        html += '<button type="button" class="atlas-btn" data-act="edit-text" data-setting="' + esc(s.id) + '">' +
          ico('edit') + 'Set a value</button>';
      } else {
        html += '<input type="text" value="' + esc(v == null ? '' : v) + '" placeholder="Type, then press Enter" ' +
          'data-setting="' + esc(s.id) + '" data-type="text" aria-label="' + esc(s.label) + '">';
      }
    } else if (type === 'action') {
      html += '<button type="button" class="atlas-btn" data-act="run-setting-action" data-setting="' + esc(s.id) + '">' +
        ico('arrowR') + esc(typeof v === 'string' && v ? v : 'Open') + '</button>';
    } else { // list | keyvalue | multiselect
      html += '<span class="atlas-inert-value">' + esc(st.valueLabel) + '</span>' +
        '<button type="button" class="atlas-btn" data-act="edit-collection" data-setting="' + esc(s.id) + '">' +
        ico('edit') + 'Edit</button>';
    }

    if (st.valueKind === 'custom') {
      html += '<button type="button" class="atlas-btn-quiet" data-act="reset-setting" data-setting="' + esc(s.id) + '">Reset to default</button>';
    }
    html += '</div>';
    return html;
  }

  function rerenderRow(id) {
    var el = document.getElementById('row-' + id);
    var s = getSetting(id);
    if (!el || !s) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = rowHtml(s, '');
    var next = tmp.firstChild;
    el.parentNode.replaceChild(next, el);
    try { window.PMIcons.hydrate(next); } catch (e) { /* ignore */ }
  }

  function setSettingValue(id, value) {
    var s = getSetting(id);
    if (!s) return;
    s.value = value;
    s.valueSource = 'custom';
    delete ui.editingText[id];
    rerenderRow(id);
  }

  /* ---------------- spellcheck demo fields ---------------- */

  function proseDemoHtml(st) {
    return '<div class="atlas-prose' + st() + '">' +
      '<div class="atlas-prose-label">Proofing sample — a designated prose field</div>' +
      '<div class="atlas-prose-field" id="atlasProseDemo" contenteditable="true" role="textbox" aria-multiline="true" ' +
      'aria-label="Proofing sample">' +
      'Teh checker underlines mistakes here, and it can recieve corrections you definately choose yourself. ' +
      'It stays quiet inside skip regions: <code>teh code span keeps its text</code>, the path ' +
      '/Users/jared/Documents/PuppetMaster/Plans/FinalGUISpec.md, the token TEHCACHE, and the model name ' +
      'Claude Sonnet are never flagged.' +
      '</div>' +
      '<p class="atlas-prose-hint">Right-click an underlined word (or press Cmd+Period on it) for suggestions. ' +
      'Nothing is ever replaced automatically.</p></div>';
  }

  function wireProseFields() {
    var demo = document.getElementById('atlasProseDemo');
    if (demo && window.PMSpell) {
      var h = window.PMSpell.attach(demo, { store: store, projectDict: true });
      if (h) spellHandles.push(h);
    }
    var note = document.getElementById('atlasReviewNote');
    if (note && window.PMSpell) {
      var h2 = window.PMSpell.attach(note, { store: store, projectDict: true });
      if (h2) spellHandles.push(h2);
    }
  }

  /* ============================ APPENDICES ============================ */

  function appendixSections(appId) {
    if (appId === 'providers') {
      return [
        { id: 'sec-app-prov-tool', num: 'A.1', title: 'Installed tools & signed-in apps', short: 'Tools & apps', group: 'tool' },
        { id: 'sec-app-prov-account', num: 'A.2', title: 'Connected accounts', short: 'Accounts', group: 'account' },
        { id: 'sec-app-prov-api', num: 'A.3', title: 'API connections', short: 'API', group: 'api' },
        { id: 'sec-app-prov-server', num: 'A.4', title: 'Server connections', short: 'Servers', group: 'server' },
        { id: 'sec-app-prov-free', num: 'A.5', title: 'Free & community routes', short: 'Free routes', group: 'free' },
        { id: 'sec-app-prov-roles', num: 'A.6', title: 'Role assignments', short: 'Roles' }
      ];
    }
    if (appId === 'memory') {
      return [
        { id: 'sec-app-mem-gists', num: 'B.1', title: 'The gist library', short: 'Gists' },
        { id: 'sec-app-mem-recall', num: 'B.2', title: 'Recall dynamics', short: 'Recall' },
        { id: 'sec-app-mem-maint', num: 'B.3', title: 'Library maintenance', short: 'Maintenance' }
      ];
    }
    if (appId === 'mcp') {
      return [
        { id: 'sec-app-mcp-servers', num: 'C.1', title: 'Connected servers', short: 'Servers' },
        { id: 'sec-app-mcp-approvals', num: 'C.2', title: 'Approval policies', short: 'Approvals' }
      ];
    }
    if (appId === 'lsp') {
      return [
        { id: 'sec-app-lsp-servers', num: 'D.1', title: 'Servers by language', short: 'Servers' },
        { id: 'sec-app-lsp-ownership', num: 'D.2', title: 'Formatting & diagnostics ownership', short: 'Ownership' }
      ];
    }
    return [];
  }

  function renderAppendix(appId, opts) {
    opts = opts || {};
    var app = appendixById(appId);
    if (!app) return;
    detachSpells();
    closeTune();
    ui.view = { kind: 'appendix', id: appId };
    ui.navOpen = false;
    persistView();

    var st = mkStagger();
    var page = '';
    if (appId === 'providers') page = providersPageHtml(st);
    else if (appId === 'memory') page = memoryPageHtml(st);
    else if (appId === 'mcp') page = mcpPageHtml(st);
    else if (appId === 'lsp') page = lspPageHtml(st);

    stage.innerHTML = workFrameHtml(
      navTreeHtml({ kind: 'appendix', id: appId }),
      page,
      'Appendix ' + app.letter + ' — ' + app.title
    );
    hydrate();
    wireNavSearch();
    wireProseFields();
    wireAppendixFilters(appId);

    var secs = appendixSections(appId);
    var labelFor = function (secId) {
      for (var i = 0; i < secs.length; i++) {
        if (secs[i].id === secId) return secs[i].num + '  ' + secs[i].title;
      }
      return 'Appendix ' + app.letter + ' — ' + app.title;
    };
    attachSpy(function () {
      return Array.prototype.slice.call(stage.querySelectorAll('.atlas-section'));
    }, labelFor);

    if (typeof opts.scrollTop === 'number' && docEl) docEl.scrollTop = opts.scrollTop;
    setStatus('Reading Appendix ' + app.letter + ' — ' + app.title);
    setStatusRight('Scenario: ' + scenario());
  }

  function appendixHeadHtml(num, title, prologue, st) {
    return '<div class="atlas-sec-head' + st() + '"><span class="atlas-sec-num">' + esc(num) + '</span>' +
      '<h2 class="atlas-sec-title">' + esc(title) + '</h2></div>' +
      '<div class="atlas-rule' + st() + '"></div>' +
      '<p class="atlas-prologue' + st() + '">' + esc(prologue) + '</p>';
  }

  /* ---------------- Appendix A: providers & models ---------------- */

  var GROUP_PROLOGUES = {
    tool: 'Command-line tools and desktop apps that hold their own sign-ins. Puppet Master launches each tool\'s login and verifies readiness; it never handles those tokens itself.',
    account: 'Accounts where Puppet Master signs in directly on your behalf and manages the session.',
    api: 'Direct API routes billed per use. Keys live in the system keychain.',
    server: 'Machines you run yourself. No account, no metering — availability is whatever the server offers.',
    free: 'No-cost routes, each with its own qualifier. There is no such thing as an unqualified free model.'
  };

  function providersPageHtml(st) {
    var d = data();
    var html = '<div class="atlas-app-tools' + st() + '">' +
      '<div class="atlas-nav-search">' + ico('search') +
      '<input type="text" id="atlasProvSearch" placeholder="Filter connections" aria-label="Filter connections" autocomplete="off" value="' + esc(ui.provQuery) + '"></div>' +
      '<button type="button" class="atlas-btn" data-act="add-provider">' + ico('plus') + 'Connect a provider</button></div>';

    appendixSections('providers').forEach(function (sec) {
      html += '<section class="atlas-section" id="' + esc(sec.id) + '">';
      if (sec.group) {
        html += appendixHeadHtml(sec.num, sec.title, GROUP_PROLOGUES[sec.group] || '', st);
        var provs = arr(d.providers).filter(function (p) { return p.groupKind === sec.group; });
        if (ui.provQuery) {
          var q = ui.provQuery.toLowerCase();
          provs = provs.filter(function (p) {
            return (p.name + ' ' + p.family).toLowerCase().indexOf(q) >= 0;
          });
        }
        if (!provs.length) html += '<div class="atlas-dir-empty">No connections in this group' + (ui.provQuery ? ' match the filter' : '') + '.</div>';
        provs.forEach(function (p) { html += providerHtml(p, st); });
        if (sec.group === 'free') html += freeRoutesHtml(st);
      } else {
        html += appendixHeadHtml(sec.num, sec.title, 'Which route each kind of work uses. The PRD and Planning conversation is deliberately pinned to the high-quality route.', st);
        html += rolesHtml(st);
      }
      html += '</section>';
    });
    return html;
  }

  function providerHtml(p, st) {
    var open = !!ui.openProviders[p.id];
    var words = providerStatusWords(p);
    var html = '<article class="atlas-entry' + st() + '" id="prov-' + esc(p.id) + '">';
    html += '<button type="button" class="atlas-entry-head" data-act="toggle-provider" data-provider="' + esc(p.id) + '" aria-expanded="' + open + '">' +
      '<span class="atlas-entry-title">' + esc(p.name) + '<span class="atlas-entry-family">' + esc(p.family) + '</span></span>' +
      '<span class="atlas-entry-status">' + words.map(function (w) { return statusWordHtml(w.w, w.t); }).join('') + '</span>' +
      ico('chevD') +
      '<span class="atlas-entry-sub">' + esc(p.statusNote || '') + '</span>' +
      '</button>';
    if (open) {
      html += '<div class="atlas-entry-body">';
      html += providerAnswersHtml(p);
      html += providerAccountsHtml(p);
      html += providerConnectionsHtml(p);
      html += providerModelsHtml(p);
      html += providerCatalogHtml(p);
      html += providerUsageHtml(p);
      html += providerWhatNextHtml(p);
      html += '</div>';
    }
    html += '</article>';
    return html;
  }

  function providerAnswersHtml(p) {
    var b = p.defaultAnswerBlock;
    if (!b) return '';
    var html = '<div class="atlas-h4">At a glance</div><dl class="atlas-answers">';
    var rows = [
      ['Connected', b.connected ? 'Yes' : 'No'],
      ['Account in use', b.accountInUse],
      ['Billing route', b.billingRoute],
      ['Remaining', b.remaining],
      ['When usage runs out', b.onExhaust],
      ['Models available', b.modelsAvail]
    ];
    rows.forEach(function (r) {
      if (r[1] == null || r[1] === '') return;
      html += '<dt>' + esc(r[0]) + '</dt><dd>' + esc(String(r[1])) + '</dd>';
    });
    if (b.attention) {
      html += '<dt>Attention</dt><dd>' + statusWordHtml('Attention', 'attention') + ' ' + esc(String(b.attention === true ? 'See the notes above.' : b.attention)) + '</dd>';
    }
    html += '</dl>';
    return html;
  }

  var ISOLATION_WORDS = {
    'native-profile': 'Isolation: the tool\'s own named profile',
    'cli-home': 'Isolation: a separate CLI home directory',
    'auth-isolated': 'Isolation: auth-isolated profile with allow-listed preferences',
    'pm-managed': 'Isolation: credential managed directly by Puppet Master',
    'credential-pool': 'Isolation: shared API credential pool',
    'single-login': 'Isolation: the provider allows one active login'
  };
  var AUTH_OWNER_WORDS = {
    'cli-profile': 'Sign-in owned by the CLI',
    'pm-direct-oauth': 'Puppet Master direct sign-in',
    'api-key': 'API key',
    'server': 'Server connection',
    'none': 'No sign-in required'
  };
  var HEALTH_WORDS = {
    ok: { w: 'Healthy', t: 'ok' }, ready: { w: 'Ready', t: 'ok' },
    'usage-exhausted': { w: 'Included usage exhausted', t: 'attention' },
    'signed-out': { w: 'Signed out', t: 'attention' },
    'auth-no-invoke': { w: 'Signed in, cannot run models', t: 'attention' },
    degraded: { w: 'Degraded', t: 'attention' },
    refreshing: { w: 'Refreshing', t: 'setup' },
    'not-installed': { w: 'Not installed', t: 'muted' },
    error: { w: 'Error', t: 'attention' }
  };

  function providerAccountsHtml(p) {
    var accounts = arr(p.accounts);
    if (!accounts.length) return '';
    var html = '<div class="atlas-h4">Accounts</div>';
    accounts.slice().sort(function (a, b) { return (a.priority || 99) - (b.priority || 99); }).forEach(function (a) {
      var health = HEALTH_WORDS[a.health] || { w: 'Unknown', t: 'muted' };
      html += '<div class="atlas-acct" id="acct-' + esc(a.id) + '">';
      html += '<div class="atlas-acct-id"><div class="atlas-acct-nick">' + esc(a.nickname) +
        statusWordHtml(health.w, health.t) +
        (a.sticky ? '<span class="pm-chip-value" data-kind="custom">Sticky in threads</span>' : '') +
        (a.useNext ? '<span class="pm-chip-value" data-kind="recommended">Next new work starts here</span>' : '') +
        '</div><div class="atlas-acct-mail">' + esc(a.identity) + '</div></div>';
      html += '<div class="atlas-acct-meta">' + esc(AUTH_OWNER_WORDS[a.authOwner] || a.authOwner) + '<br>' +
        esc(ISOLATION_WORDS[a.isolation] || ('Isolation: ' + a.isolation)) + '</div>';
      if (a.usage) {
        html += '<div class="atlas-acct-meta">Included: ' + esc(String(a.usage.includedRemaining)) +
          (a.usage.extra && a.usage.extra !== 'None' ? ' · Extra: ' + esc(String(a.usage.extra)) : '') +
          (a.usage.resetAt ? ' · Resets ' + esc(fmtTime(a.usage.resetAt)) : '') +
          ' · Pressure: ' + esc(String(a.usage.pressure)) + '</div>';
        if (a.projection) html += '<div class="atlas-acct-meta">' + esc(a.projection) + '</div>';
      }
      var freshBits = [];
      if (a.lastCatalogRefresh) freshBits.push('Catalog refreshed ' + fmtTime(a.lastCatalogRefresh));
      if (a.usage && a.usage.lastUse) freshBits.push('Last generation ' + fmtTime(a.usage.lastUse));
      if (freshBits.length) html += '<div class="atlas-acct-meta">' + esc(freshBits.join(' · ')) + '</div>';
      html += '<div class="atlas-acct-ctl">' +
        '<button type="button" class="atlas-mini" role="switch" aria-checked="' + (a.enabled ? 'true' : 'false') + '" data-act="acct-enable" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '">' +
        ico(a.enabled ? 'check' : 'close') + (a.enabled ? 'Enabled' : 'Disabled') + '</button>' +
        '<span class="atlas-acct-meta">Priority ' + esc(String(a.priority)) + '</span>' +
        '<button type="button" class="atlas-mini" data-act="acct-prio" data-dir="-1" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '" aria-label="Raise priority of ' + esc(a.nickname) + '">' + ico('chevU') + 'Raise</button>' +
        '<button type="button" class="atlas-mini" data-act="acct-prio" data-dir="1" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '" aria-label="Lower priority of ' + esc(a.nickname) + '">' + ico('chevD') + 'Lower</button>' +
        '<button type="button" class="atlas-mini" aria-pressed="' + (a.useNext ? 'true' : 'false') + '" data-act="acct-usenext" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '">' + ico('arrowR') + 'Use next</button>' +
        '<button type="button" class="atlas-mini" aria-pressed="' + (a.sticky ? 'true' : 'false') + '" data-act="acct-sticky" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '">' + ico('pin') + 'Sticky</button>' +
        '<button type="button" class="atlas-mini" data-act="acct-rename" data-provider="' + esc(p.id) + '" data-account="' + esc(a.id) + '">' + ico('edit') + 'Rename</button>' +
        '</div></div>';
    });
    return html;
  }

  function providerConnectionsHtml(p) {
    var conns = arr(p.connections);
    if (!conns.length && !p.oauthNote) return '';
    var html = '<div class="atlas-h4">Connections & sign-in</div>';
    conns.forEach(function (c) {
      html += '<dl class="atlas-kv"><dt>' + esc(connKindWord(c.kind)) + '</dt><dd>' + esc(c.route) +
        (c.note ? '<br>' + esc(c.note) : '') + '</dd></dl>';
    });
    if (p.oauthNote) {
      html += '<p class="atlas-usage-note">' + esc(p.oauthNote) + '</p>';
    }
    if (p.status === 'signed-out') {
      html += '<button type="button" class="atlas-btn is-primary" data-act="cli-login" data-provider="' + esc(p.id) + '">' +
        ico('external') + 'Open the CLI\'s own sign-in</button>';
    }
    if (p.status === 'not-installed') {
      html += '<button type="button" class="atlas-btn is-primary" data-act="install-tool" data-provider="' + esc(p.id) + '">' +
        ico('download') + 'Install the CLI</button>';
    }
    if (p.status === 'auth-no-invoke') {
      html += '<button type="button" class="atlas-btn is-primary" data-act="invoke-test" data-provider="' + esc(p.id) + '">' +
        ico('play') + (ui.invoke[p.id] === 'running' ? 'Running a short test call…' : 'Run an invocation test') + '</button>';
    }
    var cliBacked = p.groupKind === 'tool' || conns.some(function (c) { return c && c.kind === 'cli'; });
    var connLogOpen = !!ui.openConnLog[p.id];
    html += '<div class="atlas-model-ctl">' +
      '<button type="button" class="atlas-mini" data-act="conn-repair" data-provider="' + esc(p.id) + '">' + ico('plug') + 'Repair this connection</button>' +
      '<button type="button" class="atlas-mini" data-act="conn-rescan" data-provider="' + esc(p.id) + '">' + ico('refresh') + 'Rescan installed tools</button>' +
      (cliBacked ? '<button type="button" class="atlas-mini" data-act="conn-update-cli" data-provider="' + esc(p.id) + '">' + ico('download') + 'Update the CLI</button>' : '') +
      '<button type="button" class="atlas-btn-quiet" data-act="toggle-conn-log" data-provider="' + esc(p.id) + '" aria-expanded="' + connLogOpen + '">' +
      (connLogOpen ? 'Hide connection logs' : 'View connection logs') + '</button></div>';
    if (connLogOpen) {
      html += '<div class="atlas-log">' + connectionLogLines(p).map(esc).join('\n') + '</div>';
    }
    return html;
  }

  /* Connection log drawer content: the provider's own log when the data has
     one, otherwise a short representative sample. */
  function connectionLogLines(p) {
    var own = arr(p.connectionLog).map(function (l) {
      if (l && typeof l === 'object') return (l.at ? fmtTime(l.at) + '  ' : '') + String(l.line || '');
      return String(l == null ? '' : l);
    }).filter(Boolean);
    if (own.length) return own;
    return [
      '09:41:02  readiness probe sent',
      '09:41:03  readiness probe answered in 480 ms',
      '11:15:44  session token refreshed by the tool',
      '13:02:10  catalog check completed, no changes'
    ];
  }
  function connKindWord(kind) {
    return { cli: 'CLI', api: 'API', oauth: 'Sign-in', server: 'Server', grouping: 'Grouping' }[kind] || kind;
  }

  var EVIDENCE_WORDS = {
    supported: 'Supported', unsupported: 'Not supported', likely: 'Likely',
    unverified: 'Unverified', 'temporarily-unavailable': 'Temporarily unavailable',
    'via-transformation': 'Via Puppet Master transformation', 'via-other-route': 'Via another configured route'
  };

  function providerModelsHtml(p) {
    var models = arr(p.models);
    if (!models.length) return '';
    var html = '<div class="atlas-h4">Models</div>';
    models.forEach(function (m) {
      var inert = !!m.unavailableReason;
      var tunable = arr(m.effort).length > 0 || m.fast === true;
      html += '<div class="atlas-model' + (inert ? ' is-inert' : '') + '" id="model-' + esc(m.id) + '">';
      html += '<div><div class="atlas-model-name">' + esc(m.name) +
        (m.alias ? '<span class="atlas-model-alias">"' + esc(m.alias) + '"</span>' : '') +
        (m.fav ? '<span class="pm-chip-value" data-kind="recommended">Favorite</span>' : '') +
        (m.hidden ? '<span class="pm-chip-value" data-kind="unavailable">Hidden from pickers</span>' : '') +
        '</div>';
      html += '<div class="atlas-model-meta">Priority ' + esc(String(m.priority)) +
        (m.ctx ? ' · ' + Math.round(m.ctx / 1000) + 'k context' : '') +
        (arr(m.modalities).length ? ' · ' + m.modalities.join(', ') : '') + '</div>';
      if (inert) {
        html += '<p class="atlas-model-reason">' + statusWordHtml('Unavailable', 'muted') + ' ' + esc(m.unavailableReason) + '</p>';
      }
      if (m.requested && m.effectiveRoute) {
        html += '<div class="atlas-effnote"><strong>Requested vs effective.</strong> ' + esc(m.effectiveReason || ('Currently runs as ' + m.effectiveRoute + '.')) + '</div>';
      }
      html += '<div class="atlas-model-ctl">' +
        '<button type="button" class="atlas-mini" aria-pressed="' + (m.fav ? 'true' : 'false') + '" data-act="model-fav" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '"' + (inert ? ' disabled' : '') + '>' + ico(m.fav ? 'starFill' : 'star') + 'Favorite</button>' +
        '<button type="button" class="atlas-mini" aria-pressed="' + (m.hidden ? 'true' : 'false') + '" data-act="model-hide" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '"' + (inert ? ' disabled' : '') + '>' + ico(m.hidden ? 'eyeOff' : 'eye') + (m.hidden ? 'Hidden' : 'Shown') + '</button>' +
        '<button type="button" class="atlas-mini" data-act="model-alias" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '"' + (inert ? ' disabled' : '') + '>' + ico('edit') + 'Alias</button>' +
        '<button type="button" class="atlas-mini" data-act="model-prio" data-dir="-1" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '"' + (inert ? ' disabled' : '') + ' aria-label="Raise priority of ' + esc(m.name) + '">' + ico('chevU') + 'Raise</button>' +
        '<button type="button" class="atlas-mini" data-act="model-prio" data-dir="1" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '"' + (inert ? ' disabled' : '') + ' aria-label="Lower priority of ' + esc(m.name) + '">' + ico('chevD') + 'Lower</button>' +
        (tunable && !inert
          ? '<button type="button" class="atlas-mini" data-act="open-tune" data-provider="' + esc(p.id) + '" data-model="' + esc(m.id) + '" aria-expanded="' + (ui.tuneOpen === m.id ? 'true' : 'false') + '" aria-haspopup="menu">' + ico('gauge') + 'Depth & speed</button>' +
            '<span class="atlas-model-meta" id="tuneSummary-' + esc(m.id) + '">' + esc(tuneSummary(m)) + '</span>'
          : '') +
        '</div>';
      if (ui.tuneOpen === m.id && tunable && !inert) html += tuneMenuHtml(m);
      // Capability evidence with source + timestamp
      var evOpen = !!ui.openEvidence[m.id];
      html += '<div class="atlas-evidence"><button type="button" class="atlas-btn-quiet" data-act="toggle-evidence" data-model="' + esc(m.id) + '" aria-expanded="' + evOpen + '">' +
        (evOpen ? 'Hide capability evidence' : 'Capability evidence (' + arr(m.evidence).length + ')') + '</button>';
      if (evOpen) {
        html += '<div class="atlas-evidence-table">';
        arr(m.evidence).forEach(function (ev) {
          html += '<span>' + esc(ev.cap) + '</span><span class="ev-state">' + esc(EVIDENCE_WORDS[ev.state] || ev.state) + '</span>' +
            '<span class="ev-src">' + esc(ev.source) + (ev.at ? ' · ' + esc(fmtTime(ev.at)) : '') + '</span>';
        });
        html += '</div>';
      }
      html += '</div>';
      html += '</div><div class="atlas-marg">' + modelMargHtml(m) + '</div></div>';
    });
    return html;
  }

  function modelMargHtml(m) {
    var bits = [];
    if (m.unavailableReason) bits.push('<span class="pm-chip-value" data-kind="unavailable">Unavailable</span>');
    if (m.requested && m.effectiveRoute) bits.push('<span class="pm-chip-value" data-kind="differs">Effective: ' + esc(m.effectiveRoute) + '</span>');
    if (arr(m.effort).length) bits.push('<span>Thinking depth: ' + m.effort.join(' / ') + '</span>');
    bits.push('<span>' + (m.fast === true ? 'Speed: Normal or Fast' : 'Speed: Normal only') + '</span>');
    if (m.toolSupport) bits.push('<span>Tools: ' + esc(m.toolSupport) + '</span>');
    return bits.join('');
  }

  function tuneSummary(m) {
    var parts = [];
    if (arr(m.effort).length) parts.push('Depth ' + (m.chosenEffort || defaultEffort(m)));
    if (m.fast === true) parts.push(m.chosenSpeed || 'Normal');
    return parts.join(' · ');
  }
  function defaultEffort(m) {
    return arr(m.effort).indexOf('medium') >= 0 ? 'medium' : (arr(m.effort)[0] || '');
  }

  /* The menu deliberately stays open across both choices; Done or Esc closes. */
  function tuneMenuHtml(m) {
    var html = '<div class="atlas-tune" id="atlasTune" role="menu" aria-label="Depth and speed for ' + esc(m.name) + '">';
    if (arr(m.effort).length) {
      html += '<div class="atlas-tune-group"><div class="atlas-tune-label">Thinking depth</div><div class="atlas-seg" role="group" aria-label="Thinking depth">';
      m.effort.forEach(function (e) {
        var on = (m.chosenEffort || defaultEffort(m)) === e;
        html += '<button type="button" aria-pressed="' + on + '" data-act="tune-effort" data-model="' + esc(m.id) + '" data-value="' + esc(e) + '">' +
          esc(e.charAt(0).toUpperCase() + e.slice(1)) + '</button>';
      });
      html += '</div></div>';
    }
    if (m.fast === true) {
      html += '<div class="atlas-tune-group"><div class="atlas-tune-label">Speed</div><div class="atlas-seg" role="group" aria-label="Speed">';
      ['Normal', 'Fast'].forEach(function (sp) {
        var on = (m.chosenSpeed || 'Normal') === sp;
        html += '<button type="button" aria-pressed="' + on + '" data-act="tune-speed" data-model="' + esc(m.id) + '" data-value="' + esc(sp) + '">' + sp + '</button>';
      });
      html += '</div></div>';
    }
    html += '<button type="button" class="atlas-btn atlas-tune-done" data-act="close-tune">Done</button></div>';
    return html;
  }

  function providerCatalogHtml(p) {
    var c = p.catalog;
    if (!c) return '';
    var html = '<div class="atlas-h4">Catalog</div><dl class="atlas-kv">';
    html += '<dt>Checked</dt><dd>' + esc(c.lastChecked ? fmtTime(c.lastChecked) : 'Never') +
      (c.sourceVersion ? ' · source ' + esc(c.sourceVersion) : '') + '</dd>';
    if (c.state === 'refreshing') {
      html += '<dt>State</dt><dd>' + statusWordHtml('Refreshing', 'setup') + ' The last good catalog stays active while the new one loads.</dd>';
    } else if (c.state === 'quarantined') {
      html += '<dt>State</dt><dd>' + statusWordHtml('Quarantined', 'attention') +
        ' A bad catalog update was rejected; the last known good catalog' +
        (c.lastActivated ? ' from ' + esc(fmtTime(c.lastActivated)) : '') + ' is still serving.' +
        (c.quarantineReason ? '<br>' + esc(c.quarantineReason) : '') + '</dd>';
    } else {
      html += '<dt>State</dt><dd>' + (c.state === 'fresh' ? 'Fresh' : 'Stale') + (c.lastKnownGood ? ' · last known good kept' : '') + '</dd>';
    }
    if (arr(c.materialChanges).length) {
      html += '<dt>Recent changes</dt><dd>';
      html += arr(c.materialChanges).map(function (mc) {
        mc = mc || {};
        var line = esc(String(mc.what || 'Catalog change'));
        if (mc.effect) line += ' — ' + esc(String(mc.effect));
        if (mc.at) line += ' (' + esc(fmtTime(mc.at)) + ')';
        return line;
      }).join('<br>');
      html += '</dd>';
    }
    if (arr(c.removedHistory).length) {
      html += '<dt>Removed or changed</dt><dd>';
      html += arr(c.removedHistory).map(function (rh) {
        rh = rh || {};
        var word = rh.change === 'no-longer-free' ? 'No longer free' : 'Removed';
        var line = esc(String(rh.model || 'A model')) + ' — ' + word;
        if (rh.at) line += ' (' + esc(fmtTime(rh.at)) + ')';
        if (rh.note) line += '<br><span class="ev-src">' + esc(String(rh.note)) + '</span>';
        return line;
      }).join('<br>');
      html += '</dd>';
    }
    html += '</dl><button type="button" class="atlas-btn" data-act="catalog-refresh" data-provider="' + esc(p.id) + '"' +
      (c.state === 'refreshing' ? ' aria-disabled="true" disabled' : '') + '>' + ico('refresh') +
      (c.state === 'refreshing' ? 'Refreshing…' : 'Refresh the catalog') + '</button>';
    return html;
  }

  function providerUsageHtml(p) {
    var snap = (data().usageSnapshot || {}).perProvider || {};
    var row = snap[p.id];
    if (!row) return '';
    var html = '<div class="atlas-h4">Usage snapshot</div>';
    html += '<p class="atlas-usage-note">' + esc((data().usageSnapshot || {}).note || 'Read-only snapshot.') + '</p>';
    html += '<dl class="atlas-kv">';
    html += '<dt>Included remaining</dt><dd>' + esc(String(row.includedRemaining)) + '</dd>';
    if (row.extra && row.extra !== 'None') html += '<dt>Extra</dt><dd>' + esc(String(row.extra)) + '</dd>';
    if (row.resetAt) html += '<dt>Resets</dt><dd>' + esc(fmtTime(row.resetAt)) + '</dd>';
    html += '<dt>Pressure</dt><dd>' + esc(String(row.pressure)) + '</dd>';
    if (row.lastUse) html += '<dt>Last successful use</dt><dd>' + esc(fmtTime(row.lastUse)) + '</dd>';
    if (row.projection) html += '<dt>Projection</dt><dd>' + esc(String(row.projection)) + '</dd>';
    if (row.freshness) html += '<dt>Freshness</dt><dd>' + esc(String(row.freshness)) + '</dd>';
    html += '</dl><button type="button" class="atlas-btn" data-act="open-usage">' + ico('external') + 'Open the Usage page</button>';
    return html;
  }

  var WHAT_NEXT_WORDS = {
    'stop-wait': 'Stop and wait for the reset',
    'extra-balance': 'Spend the extra balance',
    'paid-after-plan': 'Continue on paid usage after the plan',
    'saved-reset': 'Resume from a saved point after the reset',
    'switch-account': 'Switch to another enabled account',
    'free-models': 'Fall back to free routes',
    'api-billing': 'Use the API billing route',
    'ask': 'Ask me each time'
  };

  function providerWhatNextHtml(p) {
    var opts = arr(p.whatNext);
    if (!opts.length) return '';
    var chosen = ui.whatNext[p.id] || opts[0];
    var html = '<div class="atlas-h4">If included usage runs out</div>' +
      '<p class="atlas-usage-note">Only the choices this provider actually supports. There is no universal budget switch.</p>' +
      '<div class="atlas-seg" role="group" aria-label="What happens next on ' + esc(p.name) + '">';
    opts.forEach(function (o) {
      html += '<button type="button" aria-pressed="' + (o === chosen ? 'true' : 'false') +
        '" data-act="what-next" data-provider="' + esc(p.id) + '" data-value="' + esc(o) + '">' +
        esc(WHAT_NEXT_WORDS[o] || o) + '</button>';
    });
    html += '</div>';
    return html;
  }

  /* free routes: qualifier + stepped PM-owned setup surface */
  var QUALIFIER_WORDS = {
    'rate-limited': 'Free — rate-limited',
    'promotional': 'Free — promotional window',
    'account-required': 'Free — account required',
    'keyless': 'Free — keyless',
    'data-sharing': 'Free — prompts may be used for training',
    'subscription-included': 'Included with a subscription',
    'temporarily-unavailable': 'Free — temporarily unavailable'
  };

  function findModelAnywhere(modelId) {
    var found = null;
    arr(data().providers).forEach(function (p) {
      arr(p.models).forEach(function (m) { if (m.id === modelId) found = { provider: p, model: m }; });
    });
    return found;
  }

  function freeRoutesHtml(st) {
    var routes = arr(data().freeRoutes);
    if (!routes.length) return '';
    var html = '<div class="atlas-h4' + st() + '">Free routes</div>';
    routes.forEach(function (fr) {
      var hit = findModelAnywhere(fr.modelRef);
      var name = hit ? hit.model.name : fr.modelRef;
      var provName = hit ? hit.provider.name : (fr.underlyingProviderId || '');
      var needsSetup = arr(fr.setupSteps).length > 0;
      var step = ui.setupStep[fr.id];
      html += '<div class="atlas-entry' + st() + '" id="free-' + esc(fr.id) + '"><div class="atlas-entry-body" style="border-top:0;">' +
        '<div class="atlas-model-name" style="margin-top:12px;">' + esc(name) +
        '<span class="atlas-free-qualifier">' + esc(QUALIFIER_WORDS[fr.qualifier] || fr.qualifier) + '</span></div>' +
        '<div class="atlas-model-meta">Runs through ' + esc(provName) + '. Setup, when needed, opens the underlying connection and returns you to the model row.</div>';
      if (needsSetup) {
        if (step === undefined || step === -1) {
          html += '<div class="atlas-model-ctl"><button type="button" class="atlas-btn is-primary" data-act="free-setup-start" data-route="' + esc(fr.id) + '">' +
            ico('arrowR') + 'Begin setup — ' + fr.setupSteps.length + (fr.setupSteps.length === 1 ? ' step' : ' steps') + '</button></div>';
        } else {
          html += '<ol class="atlas-steps">';
          fr.setupSteps.forEach(function (s, i) {
            var done = step === 'done' || (typeof step === 'number' && i < step);
            var current = typeof step === 'number' && i === step;
            html += '<li class="atlas-step' + (done ? ' is-done' : '') + (current ? ' is-current' : '') + '">' +
              (done ? '<span class="atlas-step-check">' + (window.PMIcons ? window.PMIcons.get('checkCircle') : '') + '</span>' : '') +
              '<div><div class="atlas-step-title">' + esc(s.title) + '</div>' +
              '<div class="atlas-step-body">' + esc(s.body) + '</div></div>' +
              (current ? '<button type="button" class="atlas-btn" data-act="free-setup-advance" data-route="' + esc(fr.id) + '">Complete this step (simulated)</button>' : '') +
              '</li>';
          });
          html += '</ol>';
          if (step === 'done') {
            html += '<div class="atlas-model-ctl"><span class="pm-status-word" data-tone="ok">Setup complete (simulated)</span>' +
              '<button type="button" class="atlas-btn is-primary" data-act="goto-model" data-model="' + esc(fr.modelRef) + '" data-provider="' + esc(fr.underlyingProviderId || '') + '">' +
              ico('arrowR') + 'Return to the model row</button></div>';
          }
        }
      }
      html += '</div></div>';
    });
    return html;
  }

  function rolesHtml(st) {
    var html = '';
    arr(data().roles).forEach(function (r) {
      html += '<div class="atlas-row' + st() + '" id="role-' + esc(r.id) + '"><div class="atlas-row-main">' +
        '<div class="atlas-row-label">' + esc(r.label) + '</div>' +
        '<p class="atlas-row-desc">' + esc(r.note || '') + '</p>' +
        '<div class="atlas-ctl"><span class="atlas-inert-value">' + esc(r.assignedRoute) + '</span>' +
        (r.lockedHigh
          ? '<button type="button" class="atlas-btn" data-act="role-override" data-role="' + esc(r.id) + '">' + ico('edit') + 'Qualified override…</button>'
          : '<button type="button" class="atlas-btn" data-act="role-override" data-role="' + esc(r.id) + '">' + ico('edit') + 'Change route…</button>') +
        '</div></div>' +
        '<div class="atlas-marg">' +
        '<span class="pm-chip-value" data-kind="' + (r.quality === 'high' ? 'recommended' : 'default') + '">' + (r.quality === 'high' ? 'High-quality route' : 'Standard route') + '</span>' +
        (r.lockedHigh ? '<span class="atlas-marg-flag">' + ico('lock') + 'Locked to high quality — user discussion is never silently downgraded</span>' : '') +
        '</div></div>';
    });
    return html;
  }

  /* ---------------- Appendix B: memory ---------------- */

  function memoryPageHtml(st) {
    var d = data();
    var html = '<div class="atlas-app-tools' + st() + '">' +
      '<div class="atlas-nav-search">' + ico('search') +
      '<input type="text" id="atlasMemSearch" placeholder="Search gists" aria-label="Search gists" autocomplete="off" value="' + esc(ui.memQuery) + '"></div>' +
      '<select id="atlasMemShow" aria-label="Show">' +
      '<option value="all"' + (ui.memShow === 'all' ? ' selected' : '') + '>All gists</option>' +
      '<option value="verified"' + (ui.memShow === 'verified' ? ' selected' : '') + '>Verified</option>' +
      '<option value="awaiting-review"' + (ui.memShow === 'awaiting-review' ? ' selected' : '') + '>Awaiting review</option>' +
      '<option value="pinned"' + (ui.memShow === 'pinned' ? ' selected' : '') + '>Pinned</option>' +
      '</select>' +
      '<button type="button" class="atlas-btn" data-act="mem-add">' + ico('plus') + 'Record a gist</button></div>';

    html += '<section class="atlas-section" id="sec-app-mem-gists">' +
      appendixHeadHtml('B.1', 'The gist library',
        'Everything the Assistant may recall, each with the evidence it came from. Gists awaiting review are recalled cautiously until you verify them.', st);

    var gists = arr(d.memory).filter(function (g) {
      if (ui.memShow === 'verified' && g.state !== 'verified') return false;
      if (ui.memShow === 'awaiting-review' && g.state !== 'awaiting-review') return false;
      if (ui.memShow === 'pinned' && !g.pinned) return false;
      if (ui.memQuery && (g.text + ' ' + g.kind).toLowerCase().indexOf(ui.memQuery.toLowerCase()) < 0) return false;
      return true;
    });
    if (!gists.length) html += '<div class="atlas-dir-empty">No gists match.</div>';
    gists.forEach(function (g) { html += gistHtml(g, st); });
    html += '</section>';

    html += '<section class="atlas-section" id="sec-app-mem-recall">' +
      appendixHeadHtml('B.2', 'Recall dynamics',
        'Advanced. Half-life is how long a gist stays vivid: an unrecalled gist fades from recall — it is not deleted, and a pinned gist never fades.', st);
    var open = ui.openRecall;
    html += '<button type="button" class="atlas-adv-btn" data-act="toggle-recall" aria-expanded="' + open + '">' +
      '<i data-ico="chevD" class="atlas-chev"></i><span>' + (open ? 'Hide the recall table' : 'Show the recall table') + '</span></button>';
    if (open) {
      html += '<dl class="atlas-kv" style="margin-top:10px;">';
      arr(d.memory).forEach(function (g) {
        html += '<dt>' + esc(g.text.length > 44 ? g.text.slice(0, 44) + '…' : g.text) + '</dt>' +
          '<dd>Half-life: ' + esc(g.halfLife) + ' · Last recalled ' + esc(fmtTime(g.lastRecall) || 'never') + '</dd>';
      });
      html += '</dl>';
    }
    html += '</section>';

    html += '<section class="atlas-section" id="sec-app-mem-maint">' +
      appendixHeadHtml('B.3', 'Library maintenance',
        'Housekeeping for the library itself. These act on the index and the intake pipeline, never on what a gist says.', st);
    html += '<div class="atlas-model-ctl' + st() + '">' +
      '<button type="button" class="atlas-btn" data-act="mem-rebuild">' + ico('refresh') + 'Rebuild the index and merge duplicates</button>' +
      '<button type="button" class="atlas-btn-quiet" data-act="toggle-retention" aria-expanded="' + (ui.openRetention ? 'true' : 'false') + '">' +
      (ui.openRetention ? 'Hide retention & redaction' : 'Retention & redaction') + '</button></div>';
    if (ui.openRetention) {
      html += '<dl class="atlas-kv" style="margin-top:10px;">' +
        '<dt>What is kept</dt><dd>The gist text, its kind and scope, the quoted evidence it came from, and a version history of edits.</dd>' +
        '<dt>What is redacted</dt><dd>Before storage, secrets and API keys are stripped, file paths outside this project are removed, and raw conversation text is reduced to the quoted evidence you see above.</dd>' +
        '<dt>How long</dt><dd>Unpinned gists fade from recall on their half-life; nothing is deleted without an explicit discard.</dd>' +
        '</dl>';
    }
    html += '</section>';
    return html;
  }

  function gistHtml(g, st) {
    var open = !!ui.openGist[g.id];
    var stateWord = g.state === 'verified'
      ? statusWordHtml('Verified', 'ok')
      : statusWordHtml('Awaiting review', 'setup');
    var html = '<article class="atlas-entry' + st() + '" id="gist-' + esc(g.id) + '">' +
      '<button type="button" class="atlas-entry-head" data-act="toggle-gist" data-gist="' + esc(g.id) + '" aria-expanded="' + open + '">' +
      '<span class="atlas-entry-title" style="font-weight:500;"><span class="atlas-gist-text">' + esc(g.text) + '</span></span>' +
      '<span class="atlas-entry-status">' + stateWord +
      (g.pinned ? '<span class="pm-chip-value" data-kind="recommended">Pinned</span>' : '') + '</span>' +
      ico('chevD') +
      '<span class="atlas-entry-sub">' + esc(g.kind) + ' · ' + esc(SCOPE_WORDS[g.scope] || g.scope) +
      ' · last recalled ' + esc(fmtTime(g.lastRecall) || 'never') + '</span></button>';
    if (open) {
      html += '<div class="atlas-entry-body">';
      html += '<div class="atlas-h4">Evidence</div>';
      arr(g.evidence).forEach(function (ev) {
        html += '<blockquote class="atlas-quote">"' + esc(ev.quote) + '"' +
          '<span class="atlas-quote-src">— ' + esc(ev.source) + '</span></blockquote>';
      });
      html += '<div class="atlas-h4">Versions</div>';
      arr(g.versions).forEach(function (v, i) {
        html += '<div class="atlas-version-row"><span>' + esc(fmtTime(v.at)) + '</span><span>' + esc(v.note) + '</span>' +
          '<button type="button" class="atlas-mini" data-act="gist-restore" data-gist="' + esc(g.id) + '" data-version="' + i + '">' + ico('history') + 'Restore this version</button></div>';
      });
      html += '<div class="atlas-h4">Actions</div><div class="atlas-model-ctl">' +
        '<button type="button" class="atlas-mini" aria-pressed="' + (g.pinned ? 'true' : 'false') + '" data-act="gist-pin" data-gist="' + esc(g.id) + '">' + ico('pin') + (g.pinned ? 'Pinned' : 'Pin') + '</button>' +
        '<button type="button" class="atlas-mini" data-act="gist-edit" data-gist="' + esc(g.id) + '">' + ico('edit') + 'Edit</button>' +
        (g.state === 'awaiting-review'
          ? '<button type="button" class="atlas-btn is-primary" data-act="gist-verify" data-gist="' + esc(g.id) + '">' + ico('check') + 'Mark verified</button>' +
            '<button type="button" class="atlas-mini" data-act="gist-discard" data-gist="' + esc(g.id) + '">' + ico('trash') + 'Discard</button>'
          : '') +
        '<button type="button" class="atlas-mini" data-act="gist-forget" data-gist="' + esc(g.id) + '">' + ico('eyeOff') + 'Let it fade</button>' +
        '</div>';
      var capOpen = !!ui.openCapsule[g.id];
      html += '<div class="atlas-evidence"><button type="button" class="atlas-btn-quiet" data-act="toggle-capsule" data-gist="' + esc(g.id) + '" aria-expanded="' + capOpen + '">' +
        (capOpen ? 'Hide the context preview' : 'Context preview') + '</button>';
      if (capOpen) {
        html += '<div class="atlas-log" style="margin-top:8px;">' + esc(gistCapsuleLine(g)) + '</div>' +
          '<p class="atlas-usage-note">The one-line form this gist takes when it is admitted into the model context capsule.</p>';
      }
      html += '</div>';
      if (g.state === 'awaiting-review') {
        html += '<div class="atlas-prose"><div class="atlas-prose-label">Review note — a designated prose field</div>' +
          '<div class="atlas-prose-field" id="atlasReviewNote" contenteditable="true" role="textbox" aria-multiline="true" ' +
          'aria-label="Review note" data-placeholder="Add a note about why this gist is right or wrong. Spellcheck runs here."></div></div>';
      }
      html += '</div>';
    }
    html += '</article>';
    return html;
  }

  /* Compact one-line capsule form; every field is optional. */
  function gistCapsuleLine(g) {
    g = g || {};
    var text = String(g.text || '');
    if (text.length > 96) text = text.slice(0, 96) + '...';
    var bits = ['Memory'];
    if (g.kind) bits.push(String(g.kind));
    var scope = SCOPE_WORDS[g.scope] || (g.scope ? String(g.scope) : '');
    if (scope) bits.push(scope);
    var conf = g.state === 'verified' ? 'verified' : 'awaiting review, recalled cautiously';
    return bits.join(' / ') + ': "' + text + '" (' + conf + ')';
  }

  /* ---------------- Appendix C: MCP ---------------- */

  var TRANSPORT_WORDS = { http: 'HTTP', stdio: 'Local process', sse: 'Server-sent events', ws: 'WebSocket' };
  var APPROVAL_WORDS = { once: 'Ask every time', session: 'Ask once per session', persistent: 'Approved persistently' };

  function mcpPageHtml(st) {
    var d = data();
    var html = '<div class="atlas-app-tools' + st() + '">' +
      '<button type="button" class="atlas-btn" data-act="mcp-add" aria-expanded="' + (ui.mcpAddOpen ? 'true' : 'false') + '">' +
      ico('plus') + 'Add a server</button></div>';
    if (ui.mcpAddOpen) html += mcpAddFormHtml();

    html += '<section class="atlas-section" id="sec-app-mcp-servers">' +
      appendixHeadHtml('C.1', 'Connected servers',
        'Each server lists what it offers and what is actually exposed. Tools load lazily: agents see a name until the first request needs the details.', st);
    arr(d.mcp).forEach(function (s) { html += mcpServerHtml(s, st); });
    html += '</section>';

    html += '<section class="atlas-section" id="sec-app-mcp-approvals">' +
      appendixHeadHtml('C.2', 'Approval policies',
        'How tool calls from each server are approved. Policies are summarized here; the full approval history lives with each conversation.', st);
    html += '<dl class="atlas-kv">';
    arr(d.mcp).forEach(function (s) {
      var parts = [APPROVAL_WORDS[s.approval && s.approval.mode] || 'Ask every time'];
      if (s.approval && s.approval.perTool) {
        Object.keys(s.approval.perTool).forEach(function (t) {
          parts.push(humanToolName(t) + ': ' + (APPROVAL_WORDS[s.approval.perTool[t]] || s.approval.perTool[t]).toLowerCase());
        });
      }
      html += '<dt>' + esc(s.name) + '</dt><dd>' + esc(parts.join(' · ')) + '</dd>';
    });
    html += '</dl></section>';
    return html;
  }

  function humanToolName(name) {
    return String(name).replace(/[-_]+/g, ' ').replace(/^\w/, function (c) { return c.toUpperCase(); });
  }

  /* Inline "Add a server" disclosure. Connect returns an honest receipt —
     the demo cannot reach real servers, so nothing pretends to succeed. */
  function mcpAddFormHtml() {
    var t = ui.mcpAddTransport === 'http' ? 'http' : 'stdio';
    return '<div class="atlas-addsrv" id="atlasMcpAdd">' +
      '<div class="atlas-tune-label">Transport</div>' +
      '<div class="atlas-seg" role="group" aria-label="Transport">' +
      '<button type="button" aria-pressed="' + (t === 'stdio' ? 'true' : 'false') + '" data-act="mcp-add-transport" data-value="stdio">Local process</button>' +
      '<button type="button" aria-pressed="' + (t === 'http' ? 'true' : 'false') + '" data-act="mcp-add-transport" data-value="http">HTTP</button>' +
      '</div>' +
      '<div class="atlas-tune-label">Name</div>' +
      '<input type="text" id="atlasMcpAddName" placeholder="What should this server be called?" ' +
      'aria-label="Server name" autocomplete="off" value="' + esc(ui.mcpAddName) + '">' +
      '<div class="atlas-model-ctl">' +
      '<button type="button" class="atlas-btn is-primary" data-act="mcp-add-connect">' + ico('plug') + 'Connect</button>' +
      '<button type="button" class="atlas-btn-quiet" data-act="mcp-add-cancel">Cancel</button></div>' +
      '<p class="atlas-usage-note">Connecting negotiates a protocol before anything is exposed. In this demo the attempt is simulated and reported honestly.</p>' +
      '</div>';
  }

  function syncMcpAddName() {
    var el = document.getElementById('atlasMcpAddName');
    if (el) ui.mcpAddName = el.value;
  }

  function mcpServerHtml(s, st) {
    var open = !!ui.openLog[s.id];
    var busy = ui.mcpBusy[s.id] === 'reconnecting';
    var healthWord = busy ? statusWordHtml('Reconnecting', 'setup')
      : (s.health === 'connected' ? statusWordHtml('Connected', 'ok') : statusWordHtml('Disconnected', 'attention'));
    var negotiated = s.protocol && s.protocol.negotiated;
    var requested = s.protocol && s.protocol.requested;
    var exposed = arr(s.tools).filter(function (t) { return t.exposed; }).length;

    var html = '<article class="atlas-entry' + st() + '" id="mcp-' + esc(s.id) + '">' +
      '<div class="atlas-entry-body" style="border-top:0;padding-top:12px;">' +
      '<div class="atlas-entry-title">' + esc(s.name) +
      '<span class="atlas-entry-family">' + esc(TRANSPORT_WORDS[s.transport] || s.transport) + '</span>' +
      healthWord + '</div>' +
      '<dl class="atlas-kv">' +
      '<dt>Protocol</dt><dd>Requested ' + esc(requested || '—') + ' · ' +
      (negotiated ? (negotiated === requested ? 'negotiated as requested' : 'negotiated ' + esc(negotiated)) : 'nothing negotiated while disconnected') + '</dd>' +
      '<dt>Sign-in</dt><dd>' + esc(s.auth) + '</dd>' +
      '<dt>Scope</dt><dd>' + esc(SCOPE_WORDS[s.scope] || s.scope) + '</dd>' +
      '<dt>Tools</dt><dd>' + exposed + ' of ' + arr(s.tools).length + ' exposed now' +
      (s.lazyExposure ? ' · the rest load on first use' : '') + '</dd>' +
      mcpCacheRowHtml(s) + mcpProjectionRowHtml(s) +
      '</dl>';

    html += '<div class="atlas-model-ctl">';
    arr(s.tools).forEach(function (t) {
      html += '<span class="pm-chip-value" data-kind="' + (t.exposed ? 'custom' : 'not-configured') + '">' +
        esc(humanToolName(t.name)) + (t.exposed ? '' : ' — loads on first use') + '</span>';
    });
    html += '</div>';

    html += mcpResourcesHtml(s);
    html += mcpExtensionsHtml(s);

    html += '<div class="atlas-model-ctl">';
    if (s.health !== 'connected' && !busy) {
      html += '<button type="button" class="atlas-btn is-primary" data-act="mcp-reconnect" data-server="' + esc(s.id) + '">' + ico('plug') + 'Reconnect</button>';
    }
    if (busy) {
      html += '<span class="atlas-inert-value">Reconnecting — the last discovered tool list is kept…</span>';
    }
    html += '<button type="button" class="atlas-btn-quiet" data-act="toggle-log" data-server="' + esc(s.id) + '" aria-expanded="' + open + '">' +
      (open ? 'Hide the recent log' : 'Recent log') + '</button></div>';
    if (open) {
      html += '<div class="atlas-log">' + arr(s.logsSample).map(esc).join('\n') + '</div>';
    }
    html += '</div></article>';
    return html;
  }

  /* Discovery cache: "Discovered <time> — still fresh / gone stale", humanized. */
  function mcpCacheRowHtml(s) {
    var c = s && s.cache;
    if (!c || (!c.lastDiscovery && !c.freshness && !c.note)) return '';
    var line = c.lastDiscovery ? 'Discovered ' + fmtTime(c.lastDiscovery) : 'Not yet discovered';
    if (c.freshness === 'fresh') line += ' — still fresh';
    else if (c.freshness === 'stale') line += ' — gone stale, rediscovers on the next connect';
    var out = '<dt>Discovery</dt><dd>' + esc(line);
    if (c.note) out += '<br><span class="ev-src">' + esc(c.note) + '</span>';
    return out + '</dd>';
  }

  /* Where else this server's configuration is visible. */
  function mcpProjectionRowHtml(s) {
    var p = s && s.projection;
    if (!p) return '';
    var note = p.note || (p.claudeCli
      ? 'Also projected read-only into the Claude CLI\'s MCP config; Puppet Master remains the owner.'
      : 'Lives only in Puppet Master; no other tool sees this configuration.');
    return '<dt>Projection</dt><dd>' + esc(note) + '</dd>';
  }

  var RESOURCE_KIND_WORDS = { resource: 'Resource', template: 'Template' };

  function mcpResourcesHtml(s) {
    if (!s || !Array.isArray(s.resources)) return '';
    var html = '<div class="atlas-h4">Resources</div>';
    if (!s.resources.length) {
      return html + '<p class="atlas-usage-note">No resources discovered yet.</p>';
    }
    s.resources.forEach(function (r) {
      r = r || {};
      var kindWord = RESOURCE_KIND_WORDS[r.kind] || humanToolName(r.kind || 'resource');
      html += '<div class="atlas-res-row">' +
        '<span class="atlas-res-name">' + esc(r.name || 'Unnamed resource') + '</span>' +
        '<span class="pm-chip-value" data-kind="default">' + esc(kindWord) + '</span>' +
        (r.note ? '<span class="atlas-res-note">' + esc(r.note) + '</span>' : '') +
        '</div>';
    });
    return html;
  }

  function mcpExtensionsHtml(s) {
    var exts = arr(s && s.extensions);
    if (!exts.length) return '';
    var html = '<div class="atlas-h4">Extensions</div>';
    exts.forEach(function (x) {
      x = x || {};
      html += '<div class="atlas-res-row">' +
        '<span class="atlas-res-name">' + esc(x.name || 'Extension') + '</span>' +
        (x.note ? '<span class="atlas-res-note">' + esc(x.note) + '</span>' : '') +
        '</div>';
    });
    return html;
  }

  /* ---------------- Appendix D: language servers ---------------- */

  var LSP_STATE_WORDS = {
    detected: { w: 'Detected', t: 'setup' },
    installed: { w: 'Installed', t: 'ok' },
    missing: { w: 'Not installed', t: 'attention' }
  };

  function lspStatusWords(s) {
    var out = [];
    if (s.health === 'running') {
      out.push({ w: 'Running', t: 'ok' });
      return out;
    }
    out.push(LSP_STATE_WORDS[s.state] || { w: 'Detected', t: 'setup' });
    if (s.health === 'stopped') out.push({ w: 'Stopped', t: 'muted' });
    return out;
  }

  function lspLogLines(s) {
    return arr(s && s.logsSample).map(function (l) {
      if (l && typeof l === 'object') return (l.at ? fmtTime(l.at) + '  ' : '') + String(l.line || '');
      return String(l == null ? '' : l);
    }).filter(Boolean);
  }

  /* Unknown scope tokens are humanized, never shown raw. */
  function lspScopeWord(s) {
    if (!s || !s.scope) return 'This project';
    return SCOPE_WORDS[s.scope] || ('Per ' + String(s.scope).replace(/[-_]+/g, ' ').toLowerCase());
  }

  function lspOwnershipFacts(s) {
    return {
      formatting: s.formatting || 'This server',
      diagnostics: s.diagnosticsOwner || 'This server'
    };
  }

  function lspPageHtml(st) {
    var servers = arr(data().lsp);
    var html = '<section class="atlas-section" id="sec-app-lsp-servers">' +
      appendixHeadHtml('D.1', 'Servers by language',
        'One server per language, found on this machine or installed for the project. Each entry records where the executable lives, how the server starts, and what it is allowed to own.', st);
    if (!servers.length) {
      html += '<div class="atlas-dir-empty">No language servers are configured for this workspace.</div>';
    }
    servers.forEach(function (s) { html += lspServerHtml(s, st); });
    html += '</section>';

    html += '<section class="atlas-section" id="sec-app-lsp-ownership">' +
      appendixHeadHtml('D.2', 'Formatting & diagnostics ownership',
        'Two jobs are easy to double-book: formatting a file and judging it. This table records the single owner of each, so no two tools ever fight over the same line.', st);
    html += '<dl class="atlas-kv">';
    servers.forEach(function (s) {
      var own = lspOwnershipFacts(s);
      html += '<dt>' + esc(s.language || 'Unnamed language') + '</dt>' +
        '<dd>Formatting: ' + esc(own.formatting) + ' · Diagnostics: ' + esc(own.diagnostics) + '</dd>';
    });
    if (!servers.length) html += '<dt>Nothing to record</dt><dd>Ownership appears here once a server is configured.</dd>';
    html += '</dl></section>';
    return html;
  }

  function lspServerHtml(s, st) {
    s = s || {};
    var open = !!ui.openLsp[s.id];
    var words = lspStatusWords(s);
    var subBits = [];
    if (s.startup) subBits.push(s.startup);
    if (s.scope) subBits.push(lspScopeWord(s));

    var html = '<article class="atlas-entry' + st() + '" id="lsp-' + esc(s.id) + '">' +
      '<button type="button" class="atlas-entry-head" data-act="toggle-lsp" data-server="' + esc(s.id) + '" aria-expanded="' + open + '">' +
      '<span class="atlas-entry-title">' + esc(s.language || 'Unnamed language') +
      (s.version ? '<span class="atlas-entry-family">' + esc(s.version) + '</span>' : '') + '</span>' +
      '<span class="atlas-entry-status">' + words.map(function (w) { return statusWordHtml(w.w, w.t); }).join('') + '</span>' +
      ico('chevD') +
      '<span class="atlas-entry-sub">' + esc(subBits.join(' · ')) + '</span>' +
      '</button>';

    if (open) {
      var own = lspOwnershipFacts(s);
      var executable = s.executable && s.executable !== 'Auto-detected' ? String(s.executable) : '';
      html += '<div class="atlas-entry-body">';
      html += '<dl class="atlas-kv">' +
        '<dt>Covers</dt><dd>' + esc(s.language || 'No language recorded') + '</dd>' +
        '<dt>Executable</dt><dd>' + (executable
          ? esc(executable)
          : '<span class="pm-chip-value" data-kind="auto">Auto-detected</span>') + '</dd>' +
        '<dt>Version</dt><dd>' + esc(s.version || 'None yet — nothing is installed') + '</dd>' +
        '<dt>Scope</dt><dd><span class="pm-chip-value" data-kind="default">' + esc(lspScopeWord(s)) + '</span></dd>' +
        '<dt>Startup</dt><dd>' + esc(s.startup || 'Not started') + '</dd>' +
        '<dt>Capabilities</dt><dd>' + esc(s.capabilities || 'None recorded') + '</dd>' +
        '<dt>Formatting</dt><dd>' + esc(own.formatting) + '</dd>' +
        '<dt>Diagnostics</dt><dd>' + esc(own.diagnostics) + '</dd>' +
        '</dl>';
      if (s.conflicts) {
        html += '<div class="atlas-opnote">' + ico('warning') +
          '<span><strong>Caution.</strong> ' + esc(s.conflicts) + '</span></div>';
      }
      var logOpen = !!ui.openLspLog[s.id];
      html += '<div class="atlas-model-ctl">';
      if (s.state === 'missing') {
        html += '<button type="button" class="atlas-btn is-primary" data-act="lsp-install" data-server="' + esc(s.id) + '">' +
          ico('download') + 'Install</button>';
      } else {
        html += '<button type="button" class="atlas-btn" data-act="lsp-restart" data-server="' + esc(s.id) + '">' +
          ico('refresh') + 'Restart the server</button>';
      }
      html += '<button type="button" class="atlas-btn-quiet" data-act="toggle-lsp-log" data-server="' + esc(s.id) + '" aria-expanded="' + logOpen + '">' +
        (logOpen ? 'Hide logs' : 'View logs') + '</button></div>';
      if (logOpen) {
        var lines = lspLogLines(s);
        if (lines.length) html += '<div class="atlas-log">' + lines.map(esc).join('\n') + '</div>';
        else html += '<p class="atlas-usage-note">This server has not written any log lines yet.</p>';
      }
      html += '</div>';
    }
    html += '</article>';
    return html;
  }

  function wireAppendixFilters(appId) {
    if (appId === 'providers') {
      var pi = document.getElementById('atlasProvSearch');
      if (pi) pi.addEventListener('input', debounce(function () {
        ui.provQuery = pi.value;
        rerenderAppendixPreservingScroll();
        var again = document.getElementById('atlasProvSearch');
        if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
      }, 220));
    }
    if (appId === 'memory') {
      var mi = document.getElementById('atlasMemSearch');
      if (mi) mi.addEventListener('input', debounce(function () {
        ui.memQuery = mi.value;
        rerenderAppendixPreservingScroll();
        var again = document.getElementById('atlasMemSearch');
        if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
      }, 220));
      var ms = document.getElementById('atlasMemShow');
      if (ms) ms.addEventListener('change', function () {
        ui.memShow = ms.value;
        rerenderAppendixPreservingScroll();
      });
    }
    if (appId === 'mcp') {
      // The typed name survives rerenders (transport clicks, receipts).
      var an = document.getElementById('atlasMcpAddName');
      if (an) an.addEventListener('input', function () { ui.mcpAddName = an.value; });
    }
  }

  function debounce(fn, ms) {
    var t = 0;
    return function () {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(fn, ms);
    };
  }

  function rerenderAppendixPreservingScroll() {
    if (ui.view.kind !== 'appendix') return;
    var top = docEl ? docEl.scrollTop : 0;
    renderAppendix(ui.view.id, { scrollTop: top });
  }

  function rerenderCurrent() {
    if (ui.view.kind === 'home') renderHome();
    else if (ui.view.kind === 'domain') {
      var top = docEl ? docEl.scrollTop : 0;
      openDomain(ui.view.id);
      if (docEl) docEl.scrollTop = top;
      if (spy) spy.refresh();
    } else if (ui.view.kind === 'appendix') rerenderAppendixPreservingScroll();
  }

  /* ============================ deep links ============================ */

  function ensureRowVisible(row) {
    if (!row || !docEl) return;
    var head = docEl.querySelector('.atlas-runhead');
    var headH = head ? head.offsetHeight : 44;
    var rowTop = row.offsetTop;
    var rowBottom = rowTop + row.offsetHeight;
    var viewTop = docEl.scrollTop + headH;
    var viewBottom = docEl.scrollTop + docEl.clientHeight;
    if (rowTop < viewTop || rowBottom > viewBottom) {
      docEl.scrollTop = Math.max(0, rowTop - headH - 24);
    }
  }

  var dummyFlash = null;
  function suppressRevealFlash() {
    if (!dummyFlash) dummyFlash = document.createElement('span');
    return dummyFlash; // detached: reveal flashes it invisibly instead of the whole section
  }

  /* Renders swap the spy controller; reveals must always talk to the live one. */
  var spyProxy = {
    refresh: function () { if (spy) spy.refresh(); },
    jumpTo: function (id, o) { return spy ? spy.jumpTo(id, o) : Promise.resolve(false); }
  };

  function revealSetting(settingId) {
    var idx = locIndex();
    var loc = idx[settingId];
    var s = getSetting(settingId);
    if (!loc || !s) {
      window.PMState.receipt('Open setting', 'That entry is not in this demo dataset.');
      return;
    }
    var secId = s.exposure === 'diagnostic'
      ? 'sec-' + loc.domainId + '-diagnostics'
      : 'sec-' + loc.domainId + '-' + loc.subId;
    var ensures = [];
    ensures.push(function () {
      if (!(ui.view.kind === 'domain' && ui.view.id === loc.domainId)) openDomain(loc.domainId);
    });
    ensures.push(function () {
      var changed = false;
      var subKey = loc.domainId + '/' + loc.subId;
      if ((s.exposure === 'advanced' || s.exposure === 'expert') && !ui.openAdv[subKey]) { ui.openAdv[subKey] = true; changed = true; }
      if (s.exposure === 'diagnostic' && !ui.openDiag[loc.domainId]) { ui.openDiag[loc.domainId] = true; changed = true; }
      if (changed) rerenderCurrent();
    });
    window.PMSpy.reveal({ controller: spyProxy, ensure: ensures, targetId: secId, focusEl: suppressRevealFlash() })
      .then(function () {
        var row = document.getElementById('row-' + settingId);
        if (row) { ensureRowVisible(row); window.PMSpy.focusFlash(row); }
      });
  }

  function revealElementInAppendix(appId, secId, elId) {
    var ensures = [function () {
      if (!(ui.view.kind === 'appendix' && ui.view.id === appId)) renderAppendix(appId);
      else rerenderAppendixPreservingScroll(); // apply newly opened entries
    }];
    window.PMSpy.reveal({ controller: spyProxy, ensure: ensures, targetId: secId, focusEl: suppressRevealFlash() })
      .then(function () {
        var el = elId ? document.getElementById(elId) : null;
        if (el) { ensureRowVisible(el); window.PMSpy.focusFlash(el); }
      });
  }

  function groupSecId(p) { return 'sec-app-prov-' + (p ? p.groupKind : 'tool'); }

  function revealProvider(pid) {
    var p = null;
    arr(data().providers).forEach(function (x) { if (x.id === pid) p = x; });
    if (p) ui.openProviders[pid] = true;
    revealElementInAppendix('providers', groupSecId(p), 'prov-' + pid);
  }

  function revealFreeRoute(frId) {
    if (ui.setupStep[frId] === undefined) ui.setupStep[frId] = -1;
    revealElementInAppendix('providers', 'sec-app-prov-free', 'free-' + frId);
  }

  function revealModel(modelId, providerId) {
    var hit = findModelAnywhere(modelId);
    var p = hit ? hit.provider : null;
    if (!p && providerId) arr(data().providers).forEach(function (x) { if (x.id === providerId) p = x; });
    if (p) ui.openProviders[p.id] = true;
    revealElementInAppendix('providers', groupSecId(p), 'model-' + modelId);
  }

  function revealMcpServer(serverId) {
    revealElementInAppendix('mcp', 'sec-app-mcp-servers', 'mcp-' + serverId);
  }

  function revealLspServer(serverId) {
    ui.openLsp[serverId] = true;
    revealElementInAppendix('lsp', 'sec-app-lsp-servers', 'lsp-' + serverId);
  }

  var MANAGER_TARGETS = {
    'manager.providers': { appendix: 'providers' },
    'manager.roles': { appendix: 'providers', sec: 'sec-app-prov-roles' },
    'manager.freeRoutes': { appendix: 'providers', sec: 'sec-app-prov-free' },
    'manager.memory': { appendix: 'memory' },
    'manager.mcp': { appendix: 'mcp' },
    'manager.lsp': { appendix: 'lsp' }
  };
  function managerTarget(managerId) { return MANAGER_TARGETS[managerId] || {}; }

  function activateResult(kind, id) {
    if (kind === 'setting') { revealSetting(id); return; }
    if (kind === 'manager') {
      var t = managerTarget(id);
      if (t.appendix) {
        if (t.sec) revealElementInAppendix(t.appendix, t.sec, null);
        else renderAppendix(t.appendix);
        return;
      }
      // Managers this concept does not build get an honest receipt plus the owning section.
      var domId = null;
      var def = { 'manager.personas': 'agents', 'manager.crew': 'collaboration', 'manager.contextSources': 'context', 'manager.skills': 'extensions', 'manager.plugins': 'extensions', 'manager.tools': 'extensions', 'manager.commands': 'extensions', 'manager.terminalProfiles': 'system', 'manager.media': 'media', 'manager.dictionary': 'general' };
      domId = def[id];
      window.PMState.receipt('Open manager', 'Atlas builds Appendices A through D. This manager lives in another concept; opening its home section instead.');
      if (domId) openDomain(domId);
      return;
    }
    if (kind === 'action') {
      var n = arr(data().notices).filter(function (x) { return x.id === id; })[0];
      if (n) runNoticeAction(n, 'primary');
    }
  }

  /* ============================ notices ============================ */

  function findNotice(id) {
    return arr(data().notices).filter(function (n) { return n && n.id === id; })[0] || null;
  }

  function removeNotice(id) {
    var d = data();
    d.notices = arr(d.notices).filter(function (n) { return n.id !== id; });
  }

  function runNoticeAction(n, which) {
    var actObj = which === 'secondary' ? n.secondary : n.primary;
    if (!actObj) return;
    var act = actObj.act;
    var t = n.target || {};

    if (act === 'invoke-test') {
      window.PMState.trigger('invoke-test', t.providerId);
      revealProvider(t.providerId);
      return;
    }
    if (act === 'reconnect') {
      if (t.serverId) { mcpReconnect(t.serverId); revealMcpServer(t.serverId); return; }
      if (t.providerId) { window.PMState.trigger('reconnect', t.providerId); revealProvider(t.providerId); return; }
      window.PMState.receipt(actObj.label, 'Nothing to reconnect in this demo.');
      return;
    }
    if (act === 'cli-login') {
      window.PMState.receipt('Open the CLI sign-in', 'The tool\'s own login window would open in its isolated profile. Puppet Master never handles the token.');
      if (t.providerId) revealProvider(t.providerId);
      return;
    }
    if (act === 'open-usage') {
      window.PMState.receipt('Open the Usage page', 'Settings deep-links to Usage; balances and forecasts live there, not here.');
      return;
    }
    if (act === 'open-logs') {
      if (t.serverId) { ui.openLog[t.serverId] = true; revealMcpServer(t.serverId); }
      return;
    }
    if (act === 'open-free-route') {
      if (t.freeRouteId) revealFreeRoute(t.freeRouteId);
      return;
    }
    if (act === 'apply-recommended') {
      var s = t.settingId && getSetting(t.settingId);
      if (s && s.recommended !== undefined) {
        s.value = s.recommended;
        s.valueSource = 'recommended';
        removeNotice(n.id);
        window.PMShell.toast('Applied: ' + s.label + ' now follows the recommendation.');
        if (ui.view.kind === 'home') renderHome();
        return;
      }
    }
    // Default: navigate by target.
    if (t.manager === 'providers' && t.providerId) { revealProvider(t.providerId); return; }
    if (t.manager === 'providers') { renderAppendix('providers'); return; }
    if (t.manager === 'memory') { renderAppendix('memory'); return; }
    if (t.manager === 'mcp' && t.serverId) { revealMcpServer(t.serverId); return; }
    if (t.manager === 'mcp') { renderAppendix('mcp'); return; }
    if (t.manager === 'lsp' && t.serverId) { revealLspServer(t.serverId); return; }
    if (t.manager === 'lsp') { renderAppendix('lsp'); return; }
    if (t.settingId) { revealSetting(t.settingId); return; }
    if (t.domain) { openDomain(t.domain); return; }
    window.PMState.receipt(actObj.label, 'This action has no destination in the demo.');
  }

  /* MCP reconnect is not covered by PMState.trigger (providers only), so the
     concept stages it locally with the same last-known-good discipline. */
  function mcpReconnect(serverId) {
    var s = arr(data().mcp).filter(function (x) { return x.id === serverId; })[0];
    if (!s) return;
    ui.mcpBusy[serverId] = 'reconnecting';
    if (ui.view.kind === 'appendix' && ui.view.id === 'mcp') rerenderAppendixPreservingScroll();
    window.setTimeout(function () {
      delete ui.mcpBusy[serverId];
      s.health = 'connected';
      if (s.protocol) s.protocol.negotiated = s.protocol.requested;
      if (Array.isArray(s.logsSample)) {
        s.logsSample = s.logsSample.concat(['14:1' + Math.floor(Math.random() * 9) + ':00 reconnected, protocol ' + (s.protocol ? s.protocol.negotiated : '') + ' negotiated']);
      }
      window.PMState.receipt('Reconnect ' + s.name, 'The stream is back and the discovered tools were kept.');
      if (ui.view.kind === 'appendix' && ui.view.id === 'mcp') rerenderAppendixPreservingScroll();
    }, 1400);
  }

  /* ============================ tune menu plumbing ============================ */

  function closeTune() {
    if (ui.tuneOpen == null) return;
    ui.tuneOpen = null;
    if (tuneOutside) { document.removeEventListener('mousedown', tuneOutside, true); tuneOutside = null; }
    var menu = document.getElementById('atlasTune');
    if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
    var btn = stage.querySelector('[data-act="open-tune"][aria-expanded="true"]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function openTune(providerId, modelId, btn) {
    closeTune();
    var hit = findModelAnywhere(modelId);
    if (!hit) return;
    ui.tuneOpen = modelId;
    btn.setAttribute('aria-expanded', 'true');
    var row = document.getElementById('model-' + modelId);
    if (!row) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = tuneMenuHtml(hit.model);
    var menu = tmp.firstChild;
    row.appendChild(menu);
    try { window.PMIcons.hydrate(menu); } catch (e) { /* ignore */ }
    var first = menu.querySelector('button');
    if (first) first.focus();
    tuneOutside = function (e) {
      if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) closeTune();
    };
    document.addEventListener('mousedown', tuneOutside, true);
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeTune(); btn.focus(); }
    });
  }

  function tuneChoose(kind, modelId, value) {
    var hit = findModelAnywhere(modelId);
    if (!hit) return;
    if (kind === 'effort') hit.model.chosenEffort = value;
    else hit.model.chosenSpeed = value;
    // Update in place so the menu stays open through both choices.
    var menu = document.getElementById('atlasTune');
    if (menu) {
      var btns = menu.querySelectorAll('[data-act="tune-' + kind + '"]');
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-value') === value ? 'true' : 'false');
      }
    }
    var summary = document.getElementById('tuneSummary-' + modelId);
    if (summary) summary.textContent = tuneSummary(hit.model);
    window.PMShell.status(hit.model.name + ' — ' + tuneSummary(hit.model));
  }

  /* ============================ account + model actions ============================ */

  function findAccount(pid, aid) {
    var out = null;
    arr(data().providers).forEach(function (p) {
      if (p.id !== pid) return;
      arr(p.accounts).forEach(function (a) { if (a.id === aid) out = { provider: p, account: a }; });
    });
    return out;
  }

  function inlineRename(el, current, onDone) {
    // Small inline editor; Enter commits, Esc cancels.
    var input = document.createElement('input');
    input.type = 'text';
    input.value = current;
    input.setAttribute('aria-label', 'New name');
    input.style.maxWidth = '220px';
    el.parentNode.insertBefore(input, el.nextSibling);
    input.focus();
    input.select();
    function finish(commit) {
      var v = input.value.trim();
      if (input.parentNode) input.parentNode.removeChild(input);
      if (commit && v) onDone(v);
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') finish(true);
      if (e.key === 'Escape') finish(false);
    });
    input.addEventListener('blur', function () { finish(false); });
  }

  /* ============================ delegated events ============================ */

  function onStageClick(e) {
    var btn = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!btn || !stage.contains(btn)) return;
    var act = btn.getAttribute('data-act');
    var d = btn.dataset || {};

    switch (act) {
      /* navigation */
      case 'open-home': renderHome(); break;
      case 'open-domain': openDomain(d.domain); break;
      case 'open-appendix': renderAppendix(d.appendix); break;
      case 'toggle-contents':
        ui.navOpen = !ui.navOpen;
        var nav = document.getElementById('atlasNav');
        var scrim = document.getElementById('atlasScrim');
        if (nav) nav.classList.toggle('is-open', ui.navOpen);
        if (scrim) scrim.classList.toggle('is-open', ui.navOpen);
        btn.setAttribute('aria-expanded', ui.navOpen ? 'true' : 'false');
        break;
      case 'jump-sub':
        if (spy) spy.jumpTo(d.sec);
        if (ui.navOpen) {
          ui.navOpen = false;
          var nav2 = document.getElementById('atlasNav');
          var scrim2 = document.getElementById('atlasScrim');
          if (nav2) nav2.classList.remove('is-open');
          if (scrim2) scrim2.classList.remove('is-open');
        }
        break;
      case 'open-result': activateResult(d.kind, d.id); break;
      case 'open-recent': {
        var rec = arr(data().recents).filter(function (r) { return r.id === d.recent; })[0];
        if (rec && rec.target) {
          var t = rec.target;
          if (t.settingId) revealSetting(t.settingId);
          else if (t.manager === 'providers' && t.providerId) revealProvider(t.providerId);
          else if (t.manager && managerTarget('manager.' + t.manager).appendix) renderAppendix(managerTarget('manager.' + t.manager).appendix);
          else if (t.domain) openDomain(t.domain);
          else window.PMState.receipt('Open recent change', 'That surface lives in another concept.');
        }
        break;
      }
      case 'notice-primary': { var n1 = findNotice(d.notice); if (n1) runNoticeAction(n1, 'primary'); break; }
      case 'notice-secondary': { var n2 = findNotice(d.notice); if (n2) runNoticeAction(n2, 'secondary'); break; }

      /* workspace disclosures + rows */
      case 'toggle-adv':
        ui.openAdv[d.subkey] = !ui.openAdv[d.subkey];
        rerenderCurrent();
        break;
      case 'toggle-diag':
        ui.openDiag[d.domain] = !ui.openDiag[d.domain];
        rerenderCurrent();
        break;
      case 'toggle-setting': {
        var s1 = getSetting(d.setting);
        if (s1) setSettingValue(d.setting, !cur(s1));
        break;
      }
      case 'set-option': setSettingValue(d.setting, d.value); break;
      case 'edit-text':
        ui.editingText[d.setting] = true;
        rerenderRow(d.setting);
        var inp = document.querySelector('#row-' + CSS.escape(d.setting) + ' input[type="text"]');
        if (inp) inp.focus();
        break;
      case 'reset-setting': {
        var s2 = getSetting(d.setting);
        if (s2) {
          s2.value = s2['default'];
          s2.valueSource = 'default';
          delete ui.unlocked[d.setting];
          rerenderRow(d.setting);
          window.PMShell.toast(s2.label + ' reset to its default.');
        }
        break;
      }
      case 'unlock-expert':
        ui.unlocked[d.setting] = true;
        rerenderRow(d.setting);
        window.PMShell.toast('Unlocked for this visit. It re-locks when you leave the section.');
        break;
      case 'run-setting-action': {
        var s3 = getSetting(d.setting);
        window.PMState.receipt(s3 ? s3.label : 'Open', 'This opens a dedicated surface outside this demo page.');
        break;
      }
      case 'edit-collection': {
        var s4 = getSetting(d.setting);
        window.PMState.receipt('Edit ' + (s4 ? s4.label : 'list'), 'A list editor would open here; the demo keeps the current entries.');
        break;
      }

      /* providers */
      case 'add-provider':
        window.PMState.receipt('Connect a provider', 'The connection chooser would open: tool sign-ins, direct sign-ins, API keys, or a server address.');
        break;
      case 'toggle-provider':
        ui.openProviders[d.provider] = !ui.openProviders[d.provider];
        closeTune();
        rerenderAppendixPreservingScroll();
        break;
      case 'cli-login':
        window.PMState.receipt('Open the CLI sign-in', 'The tool\'s own login flow would open in its isolated profile. Puppet Master never sees the token.');
        break;
      case 'install-tool':
        window.PMState.receipt('Install the CLI', 'The installer would download from the vendor. Nothing was installed by this demo.');
        break;
      case 'invoke-test':
        ui.invoke[d.provider] = 'running';
        rerenderAppendixPreservingScroll();
        window.PMState.trigger('invoke-test', d.provider);
        break;
      case 'catalog-refresh':
        window.PMState.trigger('catalog-refresh', d.provider);
        break;
      case 'conn-repair':
        window.PMState.receipt('Repair this connection', 'The route would be re-verified end to end: reachability, sign-in state, then a safe readiness call. Nothing was changed by this demo.');
        break;
      case 'conn-rescan':
        window.PMState.receipt('Rescan installed tools', 'The known install locations would be re-checked and versions re-read. The inventory shown here is unchanged.');
        break;
      case 'conn-update-cli':
        window.PMState.receipt('Update the CLI', 'The vendor\'s updater would run in the tool\'s own profile; sign-ins are untouched. No update ran in this demo.');
        break;
      case 'toggle-conn-log':
        ui.openConnLog[d.provider] = !ui.openConnLog[d.provider];
        rerenderAppendixPreservingScroll();
        break;
      case 'acct-enable': {
        var hitA = findAccount(d.provider, d.account);
        if (hitA) {
          hitA.account.enabled = !hitA.account.enabled;
          rerenderAppendixPreservingScroll();
          window.PMState.receipt((hitA.account.enabled ? 'Enable ' : 'Disable ') + hitA.account.nickname,
            'Applies to future requests only; running work keeps its current account.');
        }
        break;
      }
      case 'acct-prio': {
        var hitP = findAccount(d.provider, d.account);
        if (hitP) {
          var dir = parseInt(d.dir, 10) || 1;
          hitP.account.priority = Math.max(1, (hitP.account.priority || 1) + dir);
          rerenderAppendixPreservingScroll();
        }
        break;
      }
      case 'acct-usenext': {
        var hitN = findAccount(d.provider, d.account);
        if (hitN) {
          arr(hitN.provider.accounts).forEach(function (a) { a.useNext = (a.id === d.account); });
          rerenderAppendixPreservingScroll();
          window.PMState.receipt('Use ' + hitN.account.nickname + ' next',
            'Future simulated requests start on this account. Running work is unaffected.');
        }
        break;
      }
      case 'acct-sticky': {
        var hitS = findAccount(d.provider, d.account);
        if (hitS) {
          hitS.account.sticky = !hitS.account.sticky;
          rerenderAppendixPreservingScroll();
        }
        break;
      }
      case 'acct-rename': {
        var hitR = findAccount(d.provider, d.account);
        if (hitR) {
          inlineRename(btn, hitR.account.nickname, function (v) {
            hitR.account.nickname = v;
            rerenderAppendixPreservingScroll();
            window.PMState.receipt('Rename account', 'Now shown as "' + v + '".');
          });
        }
        break;
      }
      case 'model-fav': {
        var hf = findModelAnywhere(d.model);
        if (hf) { hf.model.fav = !hf.model.fav; rerenderAppendixPreservingScroll(); }
        break;
      }
      case 'model-hide': {
        var hh = findModelAnywhere(d.model);
        if (hh) { hh.model.hidden = !hh.model.hidden; rerenderAppendixPreservingScroll(); }
        break;
      }
      case 'model-prio': {
        var hp = findModelAnywhere(d.model);
        if (hp) {
          hp.model.priority = Math.max(1, (hp.model.priority || 1) + (parseInt(d.dir, 10) || 1));
          rerenderAppendixPreservingScroll();
        }
        break;
      }
      case 'model-alias': {
        var ha = findModelAnywhere(d.model);
        if (ha) {
          inlineRename(btn, ha.model.alias || '', function (v) {
            ha.model.alias = v;
            rerenderAppendixPreservingScroll();
            window.PMState.receipt('Set alias', ha.model.name + ' is now "' + v + '".');
          });
        }
        break;
      }
      case 'open-tune': openTune(d.provider, d.model, btn); break;
      case 'close-tune': closeTune(); break;
      case 'tune-effort': tuneChoose('effort', d.model, d.value); break;
      case 'tune-speed': tuneChoose('speed', d.model, d.value); break;
      case 'toggle-evidence':
        ui.openEvidence[d.model] = !ui.openEvidence[d.model];
        rerenderAppendixPreservingScroll();
        break;
      case 'what-next': {
        ui.whatNext[d.provider] = d.value;
        rerenderAppendixPreservingScroll();
        window.PMState.receipt('On exhaustion: ' + (WHAT_NEXT_WORDS[d.value] || d.value),
          'Applies when this provider\'s included usage runs out.');
        break;
      }
      case 'free-setup-start':
        ui.setupStep[d.route] = 0;
        rerenderAppendixPreservingScroll();
        break;
      case 'free-setup-advance': {
        var fr = arr(data().freeRoutes).filter(function (x) { return x.id === d.route; })[0];
        var stepNow = ui.setupStep[d.route];
        if (fr && typeof stepNow === 'number') {
          var next = stepNow + 1;
          window.PMState.receipt('Setup step: ' + (fr.setupSteps[stepNow] ? fr.setupSteps[stepNow].title : 'Step'),
            next >= fr.setupSteps.length ? 'Verified with a safe readiness check. The key sits in the keychain.' : 'Marked complete.');
          ui.setupStep[d.route] = next >= fr.setupSteps.length ? 'done' : next;
          rerenderAppendixPreservingScroll();
        }
        break;
      }
      case 'goto-model': revealModel(d.model, d.provider); break;
      case 'role-override':
        window.PMState.receipt('Change role route', 'The picker offers qualified overrides only. User discussion keeps the high-quality route unless you explicitly accept a downgrade.');
        break;
      case 'open-usage':
        window.PMState.receipt('Open the Usage page', 'Settings deep-links to Usage; balances and forecasts live there, not here.');
        break;

      /* memory */
      case 'mem-add':
        window.PMState.receipt('Record a gist', 'New gists arrive from conversations; hand-written ones start as awaiting review.');
        break;
      case 'mem-rebuild':
        window.PMState.receipt('Rebuild the index', 'The library would be re-indexed and near-duplicate gists merged, keeping the better-evidenced copy. The demo library is left as it is.');
        break;
      case 'toggle-retention':
        ui.openRetention = !ui.openRetention;
        rerenderAppendixPreservingScroll();
        break;
      case 'gist-edit': {
        var ge = arr(data().memory).filter(function (g) { return g.id === d.gist; })[0];
        if (ge) {
          inlineRename(btn, ge.text || '', function (v) {
            ge.text = v;
            if (!Array.isArray(ge.versions)) ge.versions = [];
            ge.versions.push({ at: new Date().toISOString(), note: 'Edited by hand' });
            rerenderAppendixPreservingScroll();
            window.PMState.receipt('Edit gist', 'Saved. The previous wording stays in the version history.');
          });
        }
        break;
      }
      case 'toggle-capsule':
        ui.openCapsule[d.gist] = !ui.openCapsule[d.gist];
        rerenderAppendixPreservingScroll();
        break;
      case 'toggle-gist':
        ui.openGist[d.gist] = !ui.openGist[d.gist];
        rerenderAppendixPreservingScroll();
        wireProseFields();
        break;
      case 'gist-pin': {
        var g1 = arr(data().memory).filter(function (g) { return g.id === d.gist; })[0];
        if (g1) {
          g1.pinned = !g1.pinned;
          if (g1.pinned) g1.halfLife = 'protected while pinned';
          rerenderAppendixPreservingScroll();
        }
        break;
      }
      case 'gist-verify': {
        var g2 = arr(data().memory).filter(function (g) { return g.id === d.gist; })[0];
        if (g2) {
          g2.state = 'verified';
          rerenderAppendixPreservingScroll();
          window.PMShell.toast('Gist verified. It is now recalled with full confidence.');
        }
        break;
      }
      case 'gist-discard':
        window.PMState.receipt('Discard gist', 'It would be removed from recall entirely. The demo keeps it for inspection.');
        break;
      case 'gist-restore': {
        var g3 = arr(data().memory).filter(function (g) { return g.id === d.gist; })[0];
        var v = g3 && arr(g3.versions)[parseInt(d.version, 10)];
        window.PMState.receipt('Restore version', v ? 'Would restore the ' + fmtTime(v.at) + ' version ("' + v.note + '").' : 'Version not found.');
        break;
      }
      case 'gist-forget':
        window.PMState.receipt('Let it fade', 'Recall weight would decay from now on instead of being refreshed. Nothing is deleted.');
        break;
      case 'toggle-recall':
        ui.openRecall = !ui.openRecall;
        rerenderAppendixPreservingScroll();
        break;

      /* mcp */
      case 'mcp-add':
        syncMcpAddName();
        ui.mcpAddOpen = !ui.mcpAddOpen;
        rerenderAppendixPreservingScroll();
        if (ui.mcpAddOpen) {
          var addName = document.getElementById('atlasMcpAddName');
          if (addName) addName.focus();
        }
        break;
      case 'mcp-add-transport':
        syncMcpAddName();
        ui.mcpAddTransport = d.value === 'http' ? 'http' : 'stdio';
        rerenderAppendixPreservingScroll();
        break;
      case 'mcp-add-cancel':
        ui.mcpAddOpen = false;
        ui.mcpAddName = '';
        rerenderAppendixPreservingScroll();
        break;
      case 'mcp-add-connect': {
        syncMcpAddName();
        var newName = (ui.mcpAddName || '').trim();
        var transportWord = ui.mcpAddTransport === 'http' ? 'over HTTP' : 'as a local process';
        window.PMState.receipt('Connect ' + (newName || 'a new server'),
          'A real connection would start ' + transportWord + ' and negotiate a protocol before exposing anything. This demo cannot reach servers, so nothing was added.');
        ui.mcpAddOpen = false;
        ui.mcpAddName = '';
        rerenderAppendixPreservingScroll();
        break;
      }
      case 'mcp-reconnect': mcpReconnect(d.server); break;
      case 'toggle-log':
        ui.openLog[d.server] = !ui.openLog[d.server];
        rerenderAppendixPreservingScroll();
        break;

      /* language servers */
      case 'toggle-lsp':
        ui.openLsp[d.server] = !ui.openLsp[d.server];
        rerenderAppendixPreservingScroll();
        break;
      case 'toggle-lsp-log':
        ui.openLspLog[d.server] = !ui.openLspLog[d.server];
        rerenderAppendixPreservingScroll();
        break;
      case 'lsp-restart': {
        var lr = arr(data().lsp).filter(function (x) { return x && x.id === d.server; })[0];
        window.PMState.receipt('Restart the ' + (lr && lr.language ? lr.language : 'language') + ' server',
          'The process would stop and start fresh, then re-index open files within a few seconds. Nothing restarted in this demo.');
        break;
      }
      case 'lsp-install': {
        var li = arr(data().lsp).filter(function (x) { return x && x.id === d.server; })[0];
        window.PMState.receipt('Install the ' + (li && li.language ? li.language : 'language') + ' server',
          'The recommended server would be downloaded and pinned for this project. Nothing was installed by this demo.');
        break;
      }

      default: break;
    }
  }

  function onStageChange(e) {
    var el = e.target;
    if (!el || !el.getAttribute) return;
    var id = el.getAttribute('data-setting');
    if (!id) return;
    var type = el.getAttribute('data-type');
    var value = el.value;
    if (type === 'number') {
      var num = parseFloat(value);
      if (isNaN(num)) return;
      value = num;
    }
    setSettingValue(id, value);
  }

  function onStageKeydown(e) {
    if (e.key === 'Escape' && ui.navOpen) {
      ui.navOpen = false;
      var nav = document.getElementById('atlasNav');
      var scrim = document.getElementById('atlasScrim');
      if (nav) nav.classList.remove('is-open');
      if (scrim) scrim.classList.remove('is-open');
      var cbtn = stage.querySelector('[data-act="toggle-contents"]');
      if (cbtn) { cbtn.setAttribute('aria-expanded', 'false'); cbtn.focus(); }
    }
  }

  function onScrimClick() {
    if (!ui.navOpen) return;
    ui.navOpen = false;
    var nav = document.getElementById('atlasNav');
    var scrim = document.getElementById('atlasScrim');
    if (nav) nav.classList.remove('is-open');
    if (scrim) scrim.classList.remove('is-open');
  }

  /* ============================ boot ============================ */

  function boot() {
    stage = document.getElementById('pmStage');
    store = window.PMState.init('c1-atlas');
    window.PMShell.init({ concept: 'c1-atlas', store: store });
    window.PMState.mountStatesDrawer(store);

    store.on('receipt', function (r) {
      if (r && r.message) window.PMShell.toast(r.message);
    });
    store.on('scenario', function (s) {
      // Scenario swaps replace the working data wholesale; re-set the page
      // in the same typesetting cadence (calm renders static).
      ui.invoke = {};
      ui.mcpBusy = {};
      closeTune();
      rerenderCurrent();
      setStatusRight('Scenario: ' + (s && s.id ? s.id : scenario()));
    });
    store.on('provider', function (ev) {
      if (ev && ev.phase === 'invoke-done') delete ui.invoke[ev.id];
      if (ui.view.kind === 'appendix' && ui.view.id === 'providers') rerenderAppendixPreservingScroll();
      if (ui.view.kind === 'home') renderHome();
    });
    store.on('catalog', function () {
      if (ui.view.kind === 'appendix' && ui.view.id === 'providers') rerenderAppendixPreservingScroll();
    });

    stage.addEventListener('click', onStageClick);
    stage.addEventListener('change', onStageChange);
    stage.addEventListener('keydown', onStageKeydown);
    stage.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'atlasScrim') onScrimClick();
    });
    // Live label next to range sliders.
    stage.addEventListener('input', function (e) {
      var el = e.target;
      if (el && el.type === 'range') {
        var label = el.nextElementSibling;
        if (label && label.classList.contains('atlas-range-value')) label.textContent = el.value;
      }
    });

    // Restore the last reading position.
    var saved = store.get('view');
    if (saved && saved.kind === 'domain' && domainById(saved.id)) openDomain(saved.id);
    else if (saved && saved.kind === 'appendix' && appendixById(saved.id)) renderAppendix(saved.id);
    else renderHome();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
