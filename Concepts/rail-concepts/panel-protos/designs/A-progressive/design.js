/* =====================================================================
   DESIGN A — PROGRESSIVE REVEAL — renderer for all 7 panels.
   Registers window.PROTO_DESIGNS.A. Each render(panelId) returns HTML.
   At rest: primary action + ~2 summary rows. "Show more" disclosures expand.
   Uses the .pa-* component vocabulary from design.css.
   ===================================================================== */
(function () {
  'use strict';
  var D = window.PROTO_DATA.getData();
  var h = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var esc = h;
  // we stored some pre-emphasized HTML in data; trust it for hit bodies.
  function trust(s) { return s; }

  function scopeMenu(selected, scopes, action) {
    // PM sprout menu replacing the native <select>
    var items = scopes.map(function (s) {
      var sel = s === selected ? ' is-selected' : '';
      return '<button type="button" class="pm6-tb-menu-item' + sel + '" data-value="' + h(s) + '">' +
        '<svg class="pm6-mi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<span class="pm6-mi-label">' + h(s) + '</span></button>';
    }).join('');
    return '<div class="pm6-tb-menu-wrap pa-scope-wrap" data-select="single" data-label-target="paScopeLabel-' + action + '" data-action="cmd.search.set_scope">' +
      '<button type="button" class="pa-pill" aria-haspopup="menu" aria-expanded="false">' +
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M6 12h12M10 18h4"/></svg>' +
      '<span id="paScopeLabel-' + action + '">' + h(selected) + '</span>' +
      '<span class="pm6-tb-chev" style="font-size:8px;opacity:.6">&#9662;</span></button>' +
      '<div class="pm6-tb-menu sprout-left" role="menu">' + items + '</div></div>';
  }

  function disclosure(id, label, count, bodyHtml, openDefault) {
    return '<div class="pa-disclosure">' +
      '<button type="button" class="pa-disc-btn" aria-expanded="' + (openDefault ? 'true' : 'false') + '" onclick="protoToggleDisc(this)">' +
      '<span>' + label + (count != null ? ' <span class="pa-count">(' + count + ')</span>' : '') + '</span>' +
      '<span class="pa-disc-chev">&#9656;</span></button>' +
      '<div class="pa-disc-body' + (openDefault ? ' open' : '') + '" id="' + id + '"><div class="pa-disc-inner"><div class="pa-disc-inner-content">' + bodyHtml + '</div></div></div>' +
      '</div>';
  }
  window.protoToggleDisc = function (btn) {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    var body = btn.nextElementSibling;
    if (body) body.classList.toggle('open', open);
  };

  /* ---------------- SEARCH ---------------- */
  function renderSearch() {
    var s = D.search;
    var hits = '';
    s.results.files.forEach(function (f) {
      hits += '<div class="pa-row" onclick="PROTO_PICKER.toast(\'files.open → ' + h(f.path) + '\')">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);flex-shrink:0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
        '<span class="pa-row-main pa-mono">' + h(f.path) + '</span>' +
        '<span class="pa-chip muted">' + f.count + '</span></div>';
      // only show first 2 hits per file at rest
      f.hits.forEach(function (hit) {
        hits += '<div class="pa-hit" onclick="PROTO_PICKER.toast(\'files.open → ' + h(f.path) + ':' + hit.ln + '\')">' +
          '<span class="pa-ln">' + hit.ln + '</span>' +
          '<span class="pa-hit-code">' + trust(hit.html) + '</span></div>';
      });
    });

    var flags = '<div class="pa-pills">' +
      '<button class="pa-pill" onclick="this.classList.toggle(\'active\')">.* <span style="opacity:.6">Regex</span></button>' +
      '<button class="pa-pill" onclick="this.classList.toggle(\'active\')">Aa <span style="opacity:.6">Case</span></button>' +
      '<button class="pa-pill" onclick="this.classList.toggle(\'active\')">\\b <span style="opacity:.6">Word</span></button>' +
      '<span style="flex:1"></span>' +
      scopeMenu(s.defaultScope, s.scopes, 'search') +
      '</div>';

    var indexBody = '<div class="pa-kv"><span class="pa-kv-k">Engine</span><span class="pa-kv-v mono">' + s.index.engine + '</span></div>' +
      '<div class="pa-kv"><span class="pa-kv-k">Docs</span><span class="pa-kv-v">' + s.index.docs.toLocaleString() + '</span></div>' +
      '<div class="pa-kv"><span class="pa-kv-k">Last</span><span class="pa-kv-v">' + h(s.index.lastIndexed) + '</span></div>' +
      '<button class="pa-btn block" onclick="PROTO_PICKER.toast(\'cmd.search.reindex → tantivy rebuild queued (' + s.index.docs + ' docs)\')">Rebuild index</button>';

    return '<div class="pa-root">' +
      '<div class="pa-primary">' +
      '<input class="pa-input" placeholder="Search in files…" value="' + h(s.query) + '">' +
      '<button class="pa-iconbtn" title="Toggle replace" onclick="PROTO_PICKER.toast(\'cmd.search.toggle_replace\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></button>' +
      '</div>' +
      flags +
      '<div class="pa-summary"><span>Results</span><span class="pa-count">' + s.results.total + ' in ' + s.results.fileCount + ' files</span></div>' +
      '<div class="pa-list">' + hits + '</div>' +
      '<div class="pa-btnrow">' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.search.previous_result\')">&#9650; Prev</button>' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.search.next_result\')">&#9660; Next</button>' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.search.replace_all → 7 across 3 files\')">Replace all</button>' +
      '</div>' +
      disclosure('paIdx', 'Index status', null, indexBody, false) +
      '</div>';
  }

  /* ---------------- SOURCE ---------------- */
  function renderSource() {
    var s = D.source;
    // branch menu (sprout replacing <select>)
    var branchItems = s.branches.map(function (b) {
      var sel = b === s.branch ? ' is-selected' : '';
      return '<button type="button" class="pm6-tb-menu-item' + sel + '" data-value="' + h(b) + '">' +
        '<svg class="pm6-mi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<span class="pm6-mi-label">' + h(b) + '</span>' +
        (b === s.branch ? '<span class="pm6-mi-meta">current</span>' : '') +
        '</button>';
    }).join('');
    var branchMenu = '<div class="pm6-tb-menu-wrap" data-select="single" data-label-target="paBranchLabel" data-action="cmd.git.switch_branch" style="margin-bottom:var(--md)">' +
      '<button type="button" class="pa-btn block" style="justify-content:flex-start" aria-haspopup="menu" aria-expanded="false">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M6 9v6"/></svg>' +
      '<span id="paBranchLabel" style="flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis">' + h(s.branch) + '</span>' +
      '<span class="pm6-tb-chev" style="font-size:8px;opacity:.6">&#9662;</span></button>' +
      '<div class="pm6-tb-menu sprout-left" role="menu">' + branchItems + '</div></div>';

    function fileRow(f, staged) {
      return '<div class="pa-row">' +
        '<span class="pa-gs ' + f.status + '">' + f.status + '</span>' +
        '<span class="pa-row-main pa-mono" onclick="PROTO_PICKER.toast(\'cmd.git.open_diff → ' + h(f.path) + ' (' + h(f.note) + ')\')">' + h(f.path) + '</span>' +
        (staged
          ? '<button class="pa-minibtn" title="Unstage" onclick="PROTO_PICKER.toast(\'cmd.git.unstage → ' + h(f.path) + '\')">−</button>'
          : '<button class="pa-minibtn" title="Stage" onclick="PROTO_PICKER.toast(\'cmd.git.stage → ' + h(f.path) + '\')">+</button>') +
        '<button class="pa-minibtn danger" title="Discard" onclick="PROTO_PICKER.toast(\'cmd.git.discard → ' + h(f.path) + '\')">×</button>' +
        '</div>';
    }

    var staged = s.changes.staged.map(function (f) { return fileRow(f, true); }).join('');
    var unstaged = s.changes.unstaged.map(function (f) { return fileRow(f, false); }).join('');

    var changesBody = '<div class="pa-summary"><span>Staged</span><span class="pa-count">' + s.changes.staged.length + '</span></div>' +
      '<div class="pa-list">' + staged + '</div>' +
      '<div class="pa-summary" style="margin-top:var(--sm)"><span>Unstaged</span><span class="pa-count">' + s.changes.unstaged.length + '</span></div>' +
      '<div class="pa-list">' + unstaged + '</div>' +
      '<input class="pa-input" style="margin-top:var(--sm)" placeholder="Commit message…">' +
      '<div class="pa-btnrow">' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.git.commit_ai → drafting message\')">AI</button>' +
      '<button class="pa-btn primary" onclick="PROTO_PICKER.toast(\'cmd.git.commit → 3 files committed\')">Commit</button>' +
      '</div>' +
      '<div class="pa-btnrow">' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.git.pull\')">Pull</button>' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.git.push → ' + s.commit.outgoing + ' pushed\')">Push</button>' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.git.fetch\')">Fetch</button>' +
      '</div>' +
      '<div class="pa-foot">' + s.commit.incoming + ' incoming · ' + s.commit.outgoing + ' outgoing</div>';

    var wtRows = s.worktrees.map(function (w) {
      return '<div class="pa-row">' +
        '<span class="pa-dot ' + (w.status === 'clean' ? 'ok' : 'warn') + '"></span>' +
        '<span class="pa-row-main pa-mono" onclick="PROTO_PICKER.toast(\'cmd.git.worktree.switch → ' + h(w.branch) + '\')">' + h(w.branch) + '</span>' +
        '</div>';
    }).join('');
    var worktreesBody = '<div class="pa-list">' + wtRows + '</div>' +
      '<button class="pa-btn block" onclick="PROTO_PICKER.toast(\'cmd.git.worktree.new\')">+ New worktree</button>';

    var histRows = s.history.map(function (c) {
      return '<div class="pa-row" onclick="PROTO_PICKER.toast(\'cmd.git.show_commit → ' + c.sha + '\')">' +
        '<span class="pa-mono" style="color:var(--accent-primary);flex-shrink:0">' + c.sha + '</span>' +
        '<span class="pa-row-main">' + h(c.msg) + '</span>' +
        '<span class="pa-row-meta">' + c.when + '</span></div>';
    }).join('');
    var historyBody = '<div class="pa-list">' + histRows + '</div>';

    return '<div class="pa-root">' +
      branchMenu +
      disclosure('paChg', 'Changes', s.changes.staged.length + s.changes.unstaged.length, changesBody, true) +
      disclosure('paWt', 'Worktrees', s.worktrees.length, worktreesBody, false) +
      disclosure('paHist', 'History', s.history.length, historyBody, false) +
      '</div>';
  }

  /* ---------------- ACTIONS (GitHub Actions) ---------------- */
  function renderActions() {
    var a = D.actions;
    var runsHtml = a.runs.map(function (r) {
      var dotClass = r.status === 'success' ? 'ok' : 'fail';
      var chipClass = r.status === 'success' ? 'ok' : 'err';
      var row = '<div class="pa-row" onclick="PROTO_PICKER.toast(\'cmd.github.actions.open_run → ' + r.id + '\')">' +
        '<span class="pa-dot ' + dotClass + '"></span>' +
        '<span class="pa-row-main">' + h(r.name) + '</span>' +
        '<span class="pa-chip ' + chipClass + '">' + r.status + '</span></div>';
      if (r.triage) {
        row += '<div class="pa-log" style="margin:var(--xs) 0">' +
          '<div>Failing: <b>' + h(r.triage.job) + '</b> / ' + h(r.triage.step) + '</div>' +
          r.triage.log.map(function (l, i) { return '<div class="' + (i === 0 ? 'pa-log-fail' : '') + '">' + h(l) + '</div>'; }).join('') +
          '</div>';
        row += '<div class="pa-btnrow" style="margin-bottom:var(--sm)">' +
          '<button class="pa-btn primary" onclick="PROTO_PICKER.toast(\'cmd.github.actions.rerun → ' + r.id + '\')">Rerun</button>' +
          '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.github.actions.compare_last_success\')">Compare green</button></div>';
      }
      return row;
    }).join('');

    var connBody = '<div class="pa-kv"><span class="pa-kv-k">Account</span><span class="pa-kv-v pa-kv-v-row"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">' + h(a.connection.account) + '</span><span class="pa-chip ok">connected</span></span></div>' +
      '<div class="pa-kv"><span class="pa-kv-k">Missing</span><span class="pa-kv-v pa-kv-v-row"><span class="pa-chip warn">' + a.connection.missing.join(', ') + '</span></span></div>' +
      '<button class="pa-btn block" onclick="PROTO_PICKER.toast(\'cmd.github.reconnect → device flow\')">Reconnect</button>';

    var wfBody = a.workflows.map(function (w) {
      return '<div class="pa-row">' +
        '<span class="pa-row-main">' + h(w.name) + '</span>' +
        '<button class="pa-minibtn" title="Blocked: ' + w.reason + '" onclick="PROTO_PICKER.toast(\'Blocked: ' + w.reason + ' — reconnect with workflow scope\')">Dispatch</button>' +
        '</div>';
    }).join('');

    return '<div class="pa-root">' +
      '<div class="pa-summary"><span>Branch ' + h(a.branch) + '</span><span class="pa-count">' + h(a.readiness) + '</span></div>' +
      '<div class="pa-list">' + runsHtml + '</div>' +
      disclosure('paGhConn', 'GitHub connection', null, connBody, false) +
      disclosure('paGhWf', 'Workflows', a.workflows.length, wfBody, false) +
      '</div>';
  }

  /* ---------------- DOCKER ---------------- */
  function renderDocker() {
    var d = D.docker;
    var viewItems = d.views.map(function (v) {
      var sel = v === d.defaultView ? ' active' : '';
      var label = v.charAt(0).toUpperCase() + v.slice(1);
      return '<button class="pa-pill' + sel + '" onclick="PROTO_PICKER.toast(\'docker.view → ' + v + '\')">' + label + '</button>';
    }).join('');

    function statusDot(st) { return st === 'running' ? 'ok' : (st === 'restarting' ? 'run' : 'idle'); }
    function statusChip(st) {
      if (st === 'running') return '<span class="pa-chip ok">running</span>';
      if (st === 'restarting') return '<span class="pa-chip warn">restart</span>';
      return '<span class="pa-chip muted">exited</span>';
    }

    var containers = d.containers.map(function (c) {
      return '<div class="pa-row">' +
        '<span class="pa-dot ' + statusDot(c.status) + '"></span>' +
        '<span class="pa-row-main">' + h(c.name) + '</span>' +
        statusChip(c.status) +
        '</div>';
    }).join('');

    var containersBody = '<div class="pa-list">' + containers + '</div>' +
      '<div class="pa-btnrow">' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.restart\')">Restart</button>' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.stop\')">Stop</button>' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.logs\')">Logs</button>' +
      '</div>';

    // publish chain — vertical, progressive
    var chainSteps = d.publish.map(function (p) {
      var cls = p.state === 'exists' || p.state === 'ready_to_push' ? 'done' : 'waiting';
      return '<div class="pa-chain-step ' + cls + '"><span class="pa-chain-num">' + p.stage + '</span>' +
        '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + h(p.label) + '</span>' +
        '<span class="pa-chip ' + (cls === 'done' ? 'ok' : 'muted') + '">' + h(p.state) + '</span></div>';
    }).join('');
    var publishBody = '<div class="pa-chain">' + chainSteps + '</div>' +
      '<div class="pa-btnrow">' +
      '<button class="pa-btn primary" onclick="PROTO_PICKER.toast(\'cmd.docker.push\')">Push</button>' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.template_commit\')">Template</button>' +
      '</div>';

    var buildBody = '<div class="pa-kv"><span class="pa-kv-k">Target</span><span class="pa-kv-v mono">' + h(d.build.target) + '</span></div>' +
      '<div class="pa-kv"><span class="pa-kv-k">Tag</span><span class="pa-kv-v mono">' + h(d.build.tag) + '</span></div>' +
      '<div class="pa-kv"><span class="pa-kv-k">Digest</span><span class="pa-kv-v mono">' + h(d.build.digest) + '</span></div>' +
      '<button class="pa-btn primary block" onclick="PROTO_PICKER.toast(\'cmd.docker.build\')">Build image</button>';

    var regBody = d.registries.map(function (r) {
      var st = r.state === 'authenticated' || r.state === 'reachable' ? 'ok' : 'warn';
      return '<div class="pa-kv"><span class="pa-kv-k mono">' + h(r.name) + '</span><span class="pa-kv-v"><span class="pa-chip ' + st + '">' + h(r.state) + '</span></span></div>';
    }).join('');

    return '<div class="pa-root">' +
      '<div class="pa-row" style="cursor:default"><span class="pa-dot ok"></span><span class="pa-row-main">Docker · context <span class="pa-mono">' + h(d.runtime.context) + '</span></span><span class="pa-chip ok">detected</span></div>' +
      '<div class="pa-pills">' + viewItems + '</div>' +
      disclosure('paDmC', 'Containers', d.containers.length, containersBody, true) +
      disclosure('paDmB', 'Build / bake', null, buildBody, false) +
      disclosure('paDmP', 'Publish chain', null, publishBody, false) +
      disclosure('paDmR', 'Registries', d.registries.length, regBody, false) +
      '</div>';
  }

  /* ---------------- TESTS ---------------- */
  function renderTests() {
    var t = D.tests;
    var sessions = t.sessions.map(function (s) {
      return '<div class="pa-row">' +
        '<span class="pa-dot ok"></span>' +
        '<span class="pa-row-main pa-mono">' + h(s.suite) + '</span>' +
        '<span class="pa-row-meta">' + s.cases + ' · ' + s.dur + '</span>' +
        '<span class="pa-chip ok">pass</span>' +
        '</div>';
    }).join('');

    var lastBody = '<div class="pa-kv"><span class="pa-kv-k">' + h(t.lastRun.command) + '</span><span class="pa-kv-v"><span class="pa-chip ok">' + h(t.lastRun.result) + '</span></span></div>' +
      '<div class="pa-kv"><span class="pa-kv-k">When</span><span class="pa-kv-v">' + h(t.lastRun.when) + '</span></div>' +
      '<div class="pa-kv"><span class="pa-kv-k">History</span><span class="pa-kv-v">' + h(t.lastRun.history) + '</span></div>' +
      '<div class="pa-btnrow">' +
      '<button class="pa-btn primary" onclick="PROTO_PICKER.toast(\'cmd.test.run\')">Run tests</button>' +
      '<button class="pa-btn" onclick="PROTO_PICKER.toast(\'panels.show → run_debug\')">Run &amp; Debug</button>' +
      '</div>';

    var policyBody = '<div class="pa-kv"><span class="pa-kv-k">Visibility</span><span class="pa-kv-v"><span class="pa-chip ok">' + h(t.policy) + '</span></span></div>' +
      '<div class="pa-foot">' + h(t.policyNote) + '</div>';

    return '<div class="pa-root">' +
      '<div class="pa-summary"><span>Last run</span><span class="pa-count">' + h(t.lastRun.result) + '</span></div>' +
      '<button class="pa-btn primary block" onclick="PROTO_PICKER.toast(\'cmd.test.run\')">Run tests</button>' +
      '<div class="pa-list">' + sessions + '</div>' +
      disclosure('paTLast', 'Last run detail', null, lastBody, false) +
      disclosure('paTPol', 'Policy', null, policyBody, false) +
      '</div>';
  }

  /* ---------------- AGENTS ---------------- */
  function renderAgents() {
    var a = D.agents;
    var rows = a.active.map(function (ag) {
      var dot = ag.status === 'running' ? 'run' : (ag.status === 'done' ? 'ok' : 'idle');
      var chip = ag.status === 'running' ? 'warn' : (ag.status === 'done' ? 'ok' : 'muted');
      return '<div class="pa-row">' +
        '<span class="pa-dot ' + dot + '"></span>' +
        '<span class="pa-row-main pa-stack"><span class="pa-stack-main">' + h(ag.name) + '</span><span class="pa-stack-sub">' + h(ag.meta) + '</span></span>' +
        '<span class="pa-chip ' + chip + '">' + h(ag.status) + '</span>' +
        '</div>';
    }).join('');

    return '<div class="pa-root">' +
      '<div class="pa-summary"><span>Active</span><span class="pa-count">' + a.active.length + ' subagents</span></div>' +
      '<div class="pa-list">' + rows + '</div>' +
      '<button class="pa-btn block" onclick="PROTO_PICKER.toast(\'panels.open_chat\')">Open Chat</button>' +
      '<div class="pa-foot">' + h(a.note) + '</div>' +
      '</div>';
  }

  /* ---------------- ARTIFACTS ---------------- */
  function renderArtifacts() {
    var a = D.artifacts;
    var filterItems = a.filters.map(function (f) {
      var sel = f === a.defaultFilter ? ' active' : '';
      var label = f.charAt(0).toUpperCase() + f.slice(1);
      return '<button class="pa-pill' + sel + '" onclick="PROTO_PICKER.toast(\'artifacts.filter → ' + f + '\')">' + label + '</button>';
    }).join('');

    var rows = a.rows.map(function (r) {
      var chipCls = r.status === 'success' || r.status === 'completed' || r.status === 'pass on retry' ? 'ok' : 'muted';
      return '<div class="pa-row" onclick="PROTO_PICKER.toast(\'open ' + h(r.type) + ' → ' + h(r.label) + '\')">' +
        '<span class="pa-chip fam">' + h(r.type) + '</span>' +
        '<span class="pa-row-main">' + h(r.label) + '</span>' +
        '<span class="pa-chip ' + chipCls + '">' + h(r.status) + '</span>' +
        '</div>';
    }).join('');

    var bundleChips = a.investigation.chips.map(function (c) {
      return '<span class="pa-chip ' + (c.ok ? 'ok' : 'muted') + '">' + h(c.label) + '</span>';
    }).join('');
    var bundleSteps = a.investigation.steps.map(function (s) {
      return '<div class="pa-row" onclick="PROTO_PICKER.toast(\'open ' + h(s.role) + ' → ' + h(s.type) + '\')">' +
        '<span class="pa-chip fam" style="min-width:64px;justify-content:center">' + h(s.role) + '</span>' +
        '<span class="pa-row-main">' + h(s.type) + ' · ' + h(s.label) + '</span>' +
        '</div>';
    }).join('');
    var bundleBody = '<div class="pa-bundle">' +
      '<div class="pa-mono" style="color:var(--accent-primary)">' + h(a.investigation.id) + '</div>' +
      '<div class="pa-bundle-chips">' + bundleChips + '</div>' +
      '<div class="pa-list">' + bundleSteps + '</div>' +
      '<button class="pa-btn block" onclick="PROTO_PICKER.toast(\'page.go → orchestrator:evidence\')">Open in Orchestrator</button>' +
      '</div>';

    return '<div class="pa-root">' +
      '<div class="pa-pills">' + filterItems + '</div>' +
      '<div class="pa-list">' + rows + '</div>' +
      disclosure('paArtB', 'Investigation ' + a.investigation.id, a.investigation.steps.length, bundleBody, false) +
      '<div class="pa-foot">Rows are compact receipts — payloads load on demand.</div>' +
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
  window.PROTO_DESIGNS.A = {
    id: 'A',
    name: 'Progressive Reveal',
    render: function (panel) {
      var fn = renderers[panel];
      return fn ? fn() : '<div class="pa-root"><div class="pa-foot">No renderer for ' + panel + '</div></div>';
    }
  };
})();
