/* =====================================================================
   DESIGN F — FLOATING CARDS (BENTO-NARROW)
   Registers window.PROTO_DESIGNS.F. Each render(panelId) returns HTML.
   Every concept is its own detached, rounded, elevated card. Cards stack
   full-width vertically → always fit the 220px floor. Generous gaps +
   pill chips + hover-lift give the calm, premium, friendly feel.
   Uses the .pf-* component vocabulary from design.css.
   ===================================================================== */
(function () {
  'use strict';
  var D = window.PROTO_DATA.getData();
  // escape text we own; data ships some pre-emphasized HTML we trust verbatim
  var h = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  function trust(s) { return s; }

  /* ---- card wrapper ----
     card(title, bodyHtml, { chip, cls }) */
  function card(title, body, opt) {
    opt = opt || {};
    var head = '<div class="pf-head">' +
      '<span class="pf-title">' + h(title) + '</span>' +
      (opt.chip ? '<span class="pf-head-chip">' + opt.chip + '</span>' : '') +
      '</div>';
    return '<div class="pf-card' + (opt.cls ? ' ' + opt.cls : '') + '">' + head +
      '<div class="pf-body">' + body + '</div></div>';
  }

  /* ---- icons (SVG, no emoji) ---- */
  var IC = {
    branch: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M6 9v6"/><path d="M18 6a3 3 0 1 0 0 6c1.6 0 3-1 3-3V3"/></svg>',
    file:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    swap:   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    dock:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>'
  };

  /* ---- sprout menu (replaces <select>) ----
     labelId must be unique; returns full markup. */
  function sproutMenu(labelId, action, triggerInner, itemsHtml, full) {
    return '<div class="pm6-tb-menu-wrap pf-sprout-wrap' + (full ? ' pf-full' : '') + '" ' +
      'data-select="single" data-label-target="' + labelId + '"' +
      (action ? ' data-action="' + h(action) + '"' : '') + '>' +
      '<button type="button" class="pf-trigger" aria-haspopup="menu" aria-expanded="false">' +
      triggerInner + '</button>' +
      '<div class="pm6-tb-menu sprout-left" role="menu">' + itemsHtml + '</div></div>';
  }
  function menuItem(value, label, selected, meta) {
    return '<button type="button" class="pm6-tb-menu-item' + (selected ? ' is-selected' : '') + '" data-value="' + h(value) + '">' +
      '<svg class="pm6-mi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
      '<span class="pm6-mi-label">' + h(label) + '</span>' +
      (meta ? '<span class="pm6-mi-meta">' + h(meta) + '</span>' : '') +
      '</button>';
  }
  function chev() { return '<span class="pm6-tb-chev" style="font-size:8px;opacity:.6">&#9662;</span>'; }

  /* status → dot class */
  function dotFor(st) {
    var s = String(st).toLowerCase();
    if (['ok', 'success', 'pass', 'done', 'running-healthy', 'connected', 'authenticated', 'reachable', 'ready', 'clean', 'completed', 'pass on retry', 'running', 'exists', 'ready_to_push'].indexOf(s) > -1) {
      if (s === 'running' || s === 'restarting') return 'run';
      if (s === 'exists' || s === 'ready_to_push' || s === 'ready' || s === 'ready_to_push') return 'ok';
      return 'ok';
    }
    if (['running', 'restarting', 'in-progress', 'queued', 'waiting', 'pending', 'idle', 'planning'].indexOf(s) > -1) {
      if (s === 'running' || s === 'restarting' || s === 'in-progress') return 'run';
      return 'idle';
    }
    if (['failed', 'err', 'error', 'exited', 'failed'].indexOf(s) > -1) return 'fail';
    return 'idle';
  }

  /* ===================================================================
     SEARCH
     Cards: [Query] [Results] [Index]
     =================================================================== */
  function renderSearch() {
    var s = D.search;

    // ---- Query card ----
    var flags = '<div class="pf-pills">' +
      '<button class="pf-pill" onclick="this.classList.toggle(\'active\')">.* <span style="opacity:.6">Regex</span></button>' +
      '<button class="pf-pill" onclick="this.classList.toggle(\'active\')">Aa <span style="opacity:.6">Case</span></button>' +
      '<button class="pf-pill" onclick="this.classList.toggle(\'active\')">\\b <span style="opacity:.6">Word</span></button>' +
      '</div>';
    // scope sprout menu
    var scopeItems = s.scopes.map(function (sc) { return menuItem(sc, sc, sc === s.defaultScope); }).join('');
    var scopeTrigger = IC.dock +
      '<span class="pf-trigger-label" id="pfScope">' + h(s.defaultScope) + '</span>' + chev();
    var scopeMenu = sproutMenu('pfScope', 'cmd.search.set_scope', scopeTrigger, scopeItems, true);

    var queryBody =
      '<div class="pf-row" style="background:none;padding:0">' +
      '<input class="pf-input" placeholder="Search in files…" value="' + h(s.query) + '">' +
      '<button class="pf-iconbtn" title="Toggle replace" onclick="PROTO_PICKER.toast(\'cmd.search.toggle_replace\')">' + IC.swap + '</button>' +
      '</div>' +
      flags +
      scopeMenu;

    // ---- Results card ----
    var hitsHtml = '';
    s.results.files.forEach(function (f) {
      hitsHtml += '<div class="pf-row" onclick="PROTO_PICKER.toast(\'files.open → ' + h(f.path) + '\')">' +
        '<span style="color:var(--text-muted);flex-shrink:0">' + IC.file + '</span>' +
        '<span class="pf-main pf-mono">' + h(f.path) + '</span>' +
        '<span class="pf-chip muted">' + f.count + '</span>' +
        '</div>';
      f.hits.forEach(function (hit) {
        hitsHtml += '<div class="pf-hit" onclick="PROTO_PICKER.toast(\'files.open → ' + h(f.path) + ':' + hit.ln + '\')">' +
          '<span class="pf-ln">' + hit.ln + '</span>' +
          '<span class="pf-code">' + trust(hit.html) + '</span></div>';
      });
    });
    var resultsChip = '<span class="pf-chip ok"><span class="pf-chip-dot"></span>' + s.results.total + ' in ' + s.results.fileCount + ' files</span>';
    var resultsBody = '<div class="pf-list">' + hitsHtml + '</div>' +
      '<div class="pf-btnrow">' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.search.previous_result\')">&#9650; Prev</button>' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.search.next_result\')">&#9660; Next</button>' +
      '<button class="pf-btn primary" onclick="PROTO_PICKER.toast(\'cmd.search.replace_all → 7 across 3 files\')">Replace all</button>' +
      '</div>';

    // ---- Index card ----
    var indexBody = '<div class="pf-kvgrid">' +
      '<div class="pf-kv"><span class="pf-kv-k">Engine</span><span class="pf-kv-v mono">' + h(s.index.engine) + '</span></div>' +
      '<div class="pf-kv"><span class="pf-kv-k">Docs</span><span class="pf-kv-v">' + s.index.docs.toLocaleString() + '</span></div>' +
      '<div class="pf-kv"><span class="pf-kv-k">Last</span><span class="pf-kv-v">' + h(s.index.lastIndexed) + '</span></div>' +
      '</div>' +
      '<button class="pf-btn block" onclick="PROTO_PICKER.toast(\'cmd.search.reindex → tantivy rebuild queued (' + s.index.docs + ' docs)\')">Rebuild index</button>';

    return '<div class="pf-root">' +
      card('Query', queryBody) +
      card('Results', resultsBody, { chip: resultsChip }) +
      card('Index', indexBody, { chip: '<span class="pf-chip ok">ready</span>' }) +
      '</div>';
  }

  /* ===================================================================
     SOURCE
     Cards: [Branch] [Changes] [Commit] [Worktrees] [History]
     =================================================================== */
  function renderSource() {
    var s = D.source;

    // ---- Branch card (sprout) ----
    var branchItems = s.branches.map(function (b) {
      return menuItem(b, b, b === s.branch, b === s.branch ? 'current' : '');
    }).join('');
    var branchTrigger = IC.branch +
      '<span class="pf-trigger-label" id="pfBranch">' + h(s.branch) + '</span>' + chev();
    var branchMenu = sproutMenu('pfBranch', 'cmd.git.switch_branch', branchTrigger, branchItems, true);
    var branchBody = branchMenu +
      '<div class="pf-tally"><span>Incoming / Outgoing</span><span><b>' + s.commit.incoming + '</b> in · <b>' + s.commit.outgoing + '</b> out</span></div>';

    // ---- Changes card ----
    function fileRow(f, staged) {
      return '<div class="pf-row">' +
        '<span class="pf-gs ' + f.status + '">' + f.status + '</span>' +
        '<span class="pf-main pf-mono" onclick="PROTO_PICKER.toast(\'cmd.git.open_diff → ' + h(f.path) + ' (' + h(f.note) + ')\')">' + h(f.path) + '</span>' +
        (staged
          ? '<button class="pf-minibtn" title="Unstage" onclick="PROTO_PICKER.toast(\'cmd.git.unstage → ' + h(f.path) + '\')">−</button>'
          : '<button class="pf-minibtn" title="Stage" onclick="PROTO_PICKER.toast(\'cmd.git.stage → ' + h(f.path) + '\')">+</button>') +
        '<button class="pf-minibtn danger" title="Discard" onclick="PROTO_PICKER.toast(\'cmd.git.discard → ' + h(f.path) + '\')">×</button>' +
        '</div>';
    }
    var stagedRows = s.changes.staged.map(function (f) { return fileRow(f, true); }).join('');
    var unstagedRows = s.changes.unstaged.map(function (f) { return fileRow(f, false); }).join('');
    var changesBody = '<div class="pf-group-label">Staged · ' + s.changes.staged.length + '</div>' +
      '<div class="pf-list">' + (stagedRows || '<div class="pf-foot">Nothing staged.</div>') + '</div>' +
      '<div class="pf-divider"></div>' +
      '<div class="pf-group-label">Unstaged · ' + s.changes.unstaged.length + '</div>' +
      '<div class="pf-list">' + (unstagedRows || '<div class="pf-foot">Working tree clean.</div>') + '</div>';

    // ---- Commit card ----
    var commitBody = '<input class="pf-input" placeholder="Commit message…">' +
      '<div class="pf-btnrow">' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.git.commit_ai → drafting message\')">AI draft</button>' +
      '<button class="pf-btn primary" onclick="PROTO_PICKER.toast(\'cmd.git.commit → 3 files committed\')">Commit</button>' +
      '</div>' +
      '<div class="pf-btnrow">' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.git.pull\')">Pull</button>' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.git.push → ' + s.commit.outgoing + ' pushed\')">Push</button>' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.git.fetch\')">Fetch</button>' +
      '</div>';

    // ---- Worktrees card ----
    var wtRows = s.worktrees.map(function (w) {
      var dot = w.status === 'clean' ? 'ok' : 'run';
      return '<div class="pf-row" onclick="PROTO_PICKER.toast(\'cmd.git.worktree.switch → ' + h(w.branch) + '\')">' +
        '<span class="pf-dot ' + dot + '"></span>' +
        '<span class="pf-main">' + h(w.branch) + '<span class="pf-sub">' + h(w.owner) + ' · ' + h(w.base) + '</span></span>' +
        '<span class="pf-chip ' + (w.state === 'manual' ? 'muted' : 'fam') + '">' + h(w.state) + '</span>' +
        '</div>';
    }).join('');
    var worktreesBody = '<div class="pf-list">' + wtRows + '</div>' +
      '<button class="pf-btn block" onclick="PROTO_PICKER.toast(\'cmd.git.worktree.new\')">+ New worktree</button>';

    // ---- History card ----
    var histRows = s.history.map(function (c) {
      return '<div class="pf-row" onclick="PROTO_PICKER.toast(\'cmd.git.show_commit → ' + c.sha + '\')">' +
        '<span class="pf-mono accent" style="flex-shrink:0">' + c.sha + '</span>' +
        '<span class="pf-main">' + h(c.msg) + '</span>' +
        '<span class="pf-meta">' + c.when + '</span>' +
        '</div>';
    }).join('');
    var historyBody = '<div class="pf-list">' + histRows + '</div>';

    return '<div class="pf-root">' +
      card('Branch', branchBody) +
      card('Changes', changesBody) +
      card('Commit', commitBody) +
      card('Worktrees', worktreesBody, { chip: '<span class="pf-chip muted">' + s.worktrees.length + '</span>' }) +
      card('History', historyBody) +
      '</div>';
  }

  /* ===================================================================
     ACTIONS (GitHub Actions)
     Cards: [Connection] [Runs] [Workflows]
     =================================================================== */
  function renderActions() {
    var a = D.actions;

    // ---- Connection card ----
    var connBody = '<div class="pf-kvgrid">' +
      '<div class="pf-kv"><span class="pf-kv-k">Account</span><span class="pf-kv-v">' + h(a.connection.account) + '</span></div>' +
      '<div class="pf-kv"><span class="pf-kv-k">State</span><span class="pf-kv-v"><span class="pf-chip ok"><span class="pf-chip-dot"></span>' + h(a.connection.state) + '</span></span></div>' +
      '<div class="pf-kv"><span class="pf-kv-k">Missing</span><span class="pf-kv-v"><span class="pf-chip warn">' + h(a.connection.missing.join(', ')) + '</span></span></div>' +
      '</div>' +
      '<button class="pf-btn block" onclick="PROTO_PICKER.toast(\'cmd.github.reconnect → device flow\')">Reconnect</button>';

    // ---- Runs card ----
    var runsBody = '';
    a.runs.forEach(function (r) {
      var dot = r.status === 'success' ? 'ok' : 'fail';
      var chipCls = r.status === 'success' ? 'ok' : 'err';
      runsBody += '<div class="pf-row" onclick="PROTO_PICKER.toast(\'cmd.github.actions.open_run → ' + r.id + '\')">' +
        '<span class="pf-dot ' + dot + '"></span>' +
        '<span class="pf-main">' + h(r.name) + '<span class="pf-sub">' + h(r.meta) + '</span></span>' +
        '<span class="pf-chip ' + chipCls + '">' + h(r.status) + '</span>' +
        '</div>';
      if (r.triage) {
        runsBody += '<div class="pf-row flat" style="cursor:default"><span class="pf-main"><b>Failing:</b> ' + h(r.triage.job) + ' / ' + h(r.triage.step) + '<br><span class="pf-sub">' + h(r.triage.changed) + '</span></span></div>';
        runsBody += '<div class="pf-log">' +
          r.triage.log.map(function (l, i) { return '<div' + (i === 0 ? ' class="pf-log-fail"' : '') + '>' + h(l) + '</div>'; }).join('') +
          '</div>';
        runsBody += '<div class="pf-foot">' + h(r.triage.next) + '</div>';
        runsBody += '<div class="pf-btnrow">' +
          '<button class="pf-btn primary" onclick="PROTO_PICKER.toast(\'cmd.github.actions.rerun → ' + r.id + '\')">Rerun failed</button>' +
          '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.github.actions.compare_last_success\')">Compare green</button>' +
          '</div>';
      }
    });

    // ---- Workflows card ----
    var wfBody = a.workflows.map(function (w) {
      return '<div class="pf-row">' +
        '<span class="pf-main">' + h(w.name) + '</span>' +
        '<button class="pf-minibtn" title="Blocked: ' + h(w.reason) + '" onclick="PROTO_PICKER.toast(\'Blocked: ' + h(w.reason) + ' — reconnect with workflow scope\')">Dispatch</button>' +
        '</div>';
    }).join('');

    return '<div class="pf-root">' +
      card('Connection', connBody, { chip: '<span class="pf-chip ok">' + h(a.connection.state) + '</span>' }) +
      card('Recent runs · ' + h(a.readiness), '<div class="pf-list">' + runsBody + '</div>', { chip: '<span class="pf-chip muted">branch ' + h(a.branch) + '</span>' }) +
      card('Workflows', '<div class="pf-list">' + wfBody + '</div>', { chip: '<span class="pf-chip muted">' + a.workflows.length + '</span>' }) +
      '</div>';
  }

  /* ===================================================================
     DOCKER
     Cards: [Runtime] [Containers] [Build] [Publish chain] [Registries]
     View = pill row inside Runtime card.
     =================================================================== */
  function renderDocker() {
    var d = D.docker;

    // view pills
    var viewPills = d.views.map(function (v) {
      var sel = v === d.defaultView ? ' active' : '';
      var label = v.charAt(0).toUpperCase() + v.slice(1);
      return '<button class="pf-pill' + sel + '" onclick="PROTO_PICKER.toast(\'docker.view → ' + v + '\')">' + label + '</button>';
    }).join('');

    // ---- Runtime card ----
    var runtimeBody = '<div class="pf-row" style="cursor:default">' +
      '<span class="pf-dot ok"></span>' +
      '<span class="pf-main">Context <span class="pf-mono">' + h(d.runtime.context) + '</span></span>' +
      '<span class="pf-chip ok">' + h(d.runtime.state) + '</span>' +
      '</div>' +
      '<div class="pf-group-label">View</div>' +
      '<div class="pf-pills">' + viewPills + '</div>';

    // ---- Containers card ----
    function cStatus(st) {
      if (st === 'running') return { dot: 'ok', chip: 'ok', label: 'running' };
      if (st === 'restarting') return { dot: 'run', chip: 'warn', label: 'restart' };
      return { dot: 'idle', chip: 'muted', label: 'exited' };
    }
    var cRows = d.containers.map(function (c) {
      var s2 = cStatus(c.status);
      return '<div class="pf-row" onclick="PROTO_PICKER.toast(\'docker.inspect → ' + h(c.name) + '\')">' +
        '<span class="pf-dot ' + s2.dot + '"></span>' +
        '<span class="pf-main">' + h(c.name) + '<span class="pf-sub">' + h(c.image) + ' · :' + h(c.ports) + '</span></span>' +
        '<span class="pf-chip ' + s2.chip + '">' + s2.label + '</span>' +
        '</div>';
    }).join('');
    var containersBody = '<div class="pf-list">' + cRows + '</div>' +
      '<div class="pf-btnrow">' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.restart\')">Restart</button>' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.stop\')">Stop</button>' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.logs\')">Logs</button>' +
      '</div>';

    // ---- Build card ----
    var buildBody = '<div class="pf-kvgrid">' +
      '<div class="pf-kv"><span class="pf-kv-k">Target</span><span class="pf-kv-v mono">' + h(d.build.target) + '</span></div>' +
      '<div class="pf-kv"><span class="pf-kv-k">Tag</span><span class="pf-kv-v mono">' + h(d.build.tag) + '</span></div>' +
      '<div class="pf-kv"><span class="pf-kv-k">Digest</span><span class="pf-kv-v mono">' + h(d.build.digest) + '</span></div>' +
      '<div class="pf-kv"><span class="pf-kv-k">Arch</span><span class="pf-kv-v">' + h(d.build.arch) + '</span></div>' +
      '</div>' +
      '<button class="pf-btn primary block" onclick="PROTO_PICKER.toast(\'cmd.docker.build\')">Build image</button>';

    // ---- Publish chain card ----
    var chainSteps = d.publish.map(function (p) {
      var done = p.state === 'exists' || p.state === 'ready_to_push';
      return '<div class="pf-chain-step ' + (done ? 'done' : '') + '">' +
        '<span class="pf-chain-num">' + p.stage + '</span>' +
        '<span class="pf-chain-label">' + h(p.label) + '</span>' +
        '<span class="pf-chip ' + (done ? 'ok' : 'idle') + '">' + h(p.state) + '</span>' +
        '</div>';
    }).join('');
    var publishBody = '<div class="pf-chain">' + chainSteps + '</div>' +
      '<div class="pf-btnrow">' +
      '<button class="pf-btn primary" onclick="PROTO_PICKER.toast(\'cmd.docker.push\')">Push</button>' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.template_commit\')">Template</button>' +
      '</div>';

    // ---- Registries card ----
    var regRows = d.registries.map(function (r) {
      var ok = r.state === 'authenticated' || r.state === 'reachable';
      return '<div class="pf-row flat" style="cursor:default">' +
        '<span class="pf-main pf-mono">' + h(r.name) + '</span>' +
        '<span class="pf-chip ' + (ok ? 'ok' : 'warn') + '">' + h(r.state) + '</span>' +
        '</div>';
    }).join('');
    var registriesBody = '<div class="pf-list">' + regRows + '</div>';

    return '<div class="pf-root">' +
      card('Runtime', runtimeBody) +
      card('Containers', containersBody, { chip: '<span class="pf-chip muted">' + d.containers.length + '</span>' }) +
      card('Build / bake', buildBody) +
      card('Publish chain', publishBody) +
      card('Registries', registriesBody, { chip: '<span class="pf-chip muted">' + d.registries.length + '</span>' }) +
      '</div>';
  }

  /* ===================================================================
     TESTS
     Cards: [Last run] [Sessions] [Policy]
     =================================================================== */
  function renderTests() {
    var t = D.tests;

    var lastBody = '<div class="pf-kvgrid">' +
      '<div class="pf-kv"><span class="pf-kv-k">' + h(t.lastRun.command) + '</span><span class="pf-kv-v"><span class="pf-chip ok">' + h(t.lastRun.result) + '</span></span></div>' +
      '<div class="pf-kv"><span class="pf-kv-k">When</span><span class="pf-kv-v">' + h(t.lastRun.when) + '</span></div>' +
      '<div class="pf-kv"><span class="pf-kv-k">History</span><span class="pf-kv-v">' + h(t.lastRun.history) + '</span></div>' +
      '</div>' +
      '<div class="pf-btnrow">' +
      '<button class="pf-btn primary" onclick="PROTO_PICKER.toast(\'cmd.test.run\')">Run tests</button>' +
      '<button class="pf-btn" onclick="PROTO_PICKER.toast(\'panels.show → run_debug\')">Run &amp; Debug</button>' +
      '</div>';

    var sessRows = t.sessions.map(function (ss) {
      return '<div class="pf-row" onclick="PROTO_PICKER.toast(\'test.session → ' + h(ss.id) + '\')">' +
        '<span class="pf-dot ok"></span>' +
        '<span class="pf-main pf-mono">' + h(ss.suite) + '</span>' +
        '<span class="pf-chip ok">' + h(ss.status) + '</span>' +
        '<span class="pf-meta">' + ss.cases + ' · ' + h(ss.dur) + '</span>' +
        '</div>';
    }).join('');
    var sessionsBody = '<div class="pf-list">' + sessRows + '</div>';

    var policyBody = '<div class="pf-kv"><span class="pf-kv-k">Visibility</span><span class="pf-kv-v"><span class="pf-chip ok">' + h(t.policy) + '</span></span></div>' +
      '<div class="pf-foot">' + h(t.policyNote) + '</div>';

    return '<div class="pf-root">' +
      card('Last run', lastBody, { chip: '<span class="pf-chip ok">' + h(t.lastRun.result) + '</span>' }) +
      card('Sessions', sessionsBody, { chip: '<span class="pf-chip muted">' + t.sessions.length + '</span>' }) +
      card('Policy', policyBody) +
      '</div>';
  }

  /* ===================================================================
     AGENTS
     Cards: [Active agents]
     =================================================================== */
  function renderAgents() {
    var a = D.agents;
    var rows = a.active.map(function (ag) {
      var dot = ag.status === 'running' ? 'run' : (ag.status === 'done' ? 'ok' : 'idle');
      var chip = ag.status === 'running' ? 'warn' : (ag.status === 'done' ? 'ok' : 'muted');
      return '<div class="pf-row" onclick="PROTO_PICKER.toast(\'agent.open → ' + h(ag.name) + '\')">' +
        '<span class="pf-dot ' + dot + '"></span>' +
        '<span class="pf-main">' + h(ag.name) + '<span class="pf-sub">' + h(ag.meta) + '</span></span>' +
        '<span class="pf-chip ' + chip + '">' + h(ag.status) + '</span>' +
        '</div>';
    }).join('');
    var body = '<div class="pf-list">' + rows + '</div>' +
      '<button class="pf-btn block" onclick="PROTO_PICKER.toast(\'panels.open_chat\')">Open Chat</button>' +
      '<div class="pf-foot">' + h(a.note) + '</div>';

    return '<div class="pf-root">' +
      card('Active agents', body, { chip: '<span class="pf-chip muted">' + a.active.length + '</span>' }) +
      '</div>';
  }

  /* ===================================================================
     ARTIFACTS
     Cards: [Filters] [Artifacts] [Investigation bundle]
     =================================================================== */
  function renderArtifacts() {
    var a = D.artifacts;

    // filter pills
    var filterPills = a.filters.map(function (f) {
      var sel = f === a.defaultFilter ? ' active' : '';
      var label = f.charAt(0).toUpperCase() + f.slice(1);
      return '<button class="pf-pill' + sel + '" onclick="PROTO_PICKER.toast(\'artifacts.filter → ' + f + '\')">' + label + '</button>';
    }).join('');
    var filtersBody = '<div class="pf-pills">' + filterPills + '</div>';

    // artifact rows
    var rows = a.rows.map(function (r) {
      var ok = r.status === 'success' || r.status === 'completed' || r.status === 'pass on retry';
      return '<div class="pf-row" onclick="PROTO_PICKER.toast(\'open ' + h(r.type) + ' → ' + h(r.label) + '\')">' +
        '<span class="pf-chip fam">' + h(r.type) + '</span>' +
        '<span class="pf-main">' + h(r.label) + '<span class="pf-sub">' + h(r.prev) + '</span></span>' +
        '<span class="pf-chip ' + (ok ? 'ok' : 'muted') + '">' + h(r.status) + '</span>' +
        '</div>';
    }).join('');
    var artifactsBody = '<div class="pf-list">' + rows + '</div>' +
      '<div class="pf-foot">Rows are compact receipts — payloads load on demand.</div>';

    // investigation bundle
    var bundleChips = a.investigation.chips.map(function (c) {
      return '<span class="pf-chip ' + (c.ok ? 'ok' : 'muted') + '">' + h(c.label) + '</span>';
    }).join('');
    var bundleRows = a.investigation.steps.map(function (st) {
      return '<div class="pf-row flat" onclick="PROTO_PICKER.toast(\'open ' + h(st.role) + ' → ' + h(st.type) + '\')">' +
        '<span class="pf-chip fam">' + h(st.role) + '</span>' +
        '<span class="pf-main">' + h(st.type) + ' · ' + h(st.label) + '</span>' +
        '</div>';
    }).join('');
    var bundleBody = '<div class="pf-mono accent">' + h(a.investigation.id) + '</div>' +
      '<div class="pf-sub" style="color:var(--text-secondary);font-size:var(--fs-xs)">' + h(a.investigation.title) + '</div>' +
      '<div class="pf-bundle-chips">' + bundleChips + '</div>' +
      '<div class="pf-list">' + bundleRows + '</div>' +
      '<button class="pf-btn primary block" onclick="PROTO_PICKER.toast(\'page.go → orchestrator:evidence\')">Open in Orchestrator</button>';

    return '<div class="pf-root">' +
      card('Filters', filtersBody) +
      card('Artifacts', artifactsBody, { chip: '<span class="pf-chip muted">' + a.rows.length + '</span>' }) +
      card('Investigation bundle', bundleBody) +
      '</div>';
  }

  var renderers = {
    search: renderSearch,
    source: renderSource,
    actions: renderActions,
    docker: renderDocker,
    tests: renderTests,
    agents: renderAgents,
    artifacts: renderArtifacts
  };

  window.PROTO_DESIGNS = window.PROTO_DESIGNS || {};
  window.PROTO_DESIGNS.F = {
    id: 'F',
    name: 'Floating Cards',
    render: function (panel) {
      var fn = renderers[panel];
      return fn ? fn() : '<div class="pf-root"><div class="pf-card"><div class="pf-body"><div class="pf-foot">No renderer for ' + h(panel) + '</div></div></div></div>';
    }
  };
})();
