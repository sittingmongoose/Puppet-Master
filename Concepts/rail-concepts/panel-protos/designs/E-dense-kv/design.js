/* =====================================================================
   DESIGN E — DENSE KEY/VALUE GRID (terminal / IDE inspector)
   Registers window.PROTO_DESIGNS.E.
   Each render(panelId) returns an HTML string using the .pk-* vocabulary.
   The densest design: hairline dividers instead of card chrome, uppercase
   muted keys, right-aligned mono values, monospace list rows with right-
   aligned meta. Zero wasted border pixels → survives 220px.
   ===================================================================== */
(function () {
  'use strict';
  var D = window.PROTO_DATA.getData();

  // escape for plain text; data hit bodies store pre-emphasized HTML (trusted)
  function h(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function trust(s) { return s; }

  /* ---- shared sprout menu builder (replaces native <select>) ---- */
  function sprout(opts) {
    // opts: { labelId, action, current, items:[{value,label,meta?}], label, icon }
    var items = opts.items.map(function (it) {
      var sel = it.value === opts.current ? ' is-selected' : '';
      var meta = it.meta ? '<span class="pm6-mi-meta">' + h(it.meta) + '</span>' : '';
      return '<button type="button" class="pm6-tb-menu-item' + sel + '" data-value="' + h(it.value) + '">' +
        '<svg class="pm6-mi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<span class="pm6-mi-label">' + h(it.label) + '</span>' + meta +
        '</button>';
    }).join('');
    var icon = opts.icon || '';
    return '<div class="pm6-tb-menu-wrap pk-sprout-wrap" data-select="single"' +
      (opts.labelId ? ' data-label-target="' + opts.labelId + '"' : '') +
      (opts.action ? ' data-action="' + h(opts.action) + '"' : '') + '>' +
      '<button type="button" class="pk-sprout" aria-haspopup="menu" aria-expanded="false">' +
      icon +
      '<span class="pk-sprout-label"' + (opts.labelId ? ' id="' + opts.labelId + '"' : '') + '>' +
      h(opts.current) + '</span>' +
      '<span class="pm6-tb-chev">&#9662;</span></button>' +
      '<div class="pm6-tb-menu sprout-left" role="menu">' + items + '</div></div>';
  }

  /* ---- section wrapper (hairline on top + uppercase header) ---- */
  function section(label, count, bodyHtml) {
    var countHtml = (count != null && count !== '')
      ? '<span class="pk-section-count">' + h(count) + '</span>' : '';
    return '<div class="pk-section">' +
      '<div class="pk-section-head">' +
      '<span class="pk-section-label">' + h(label) + '</span>' + countHtml +
      '</div>' + bodyHtml + '</div>';
  }

  /* ---- KV row ---- */
  function kv(k, v, vClass) {
    return '<div class="pk-kv"><span class="pk-kv-k">' + h(k) + '</span>' +
      '<span class="pk-kv-v' + (vClass ? ' ' + vClass : '') + '">' + v + '</span></div>';
  }

  /* ---- action footer ---- */
  function foot(buttonsHtml, noteHtml) {
    var n = noteHtml ? '<div class="pk-note" style="flex-basis:100%">' + noteHtml + '</div>' : '';
    return '<div class="pk-foot">' + buttonsHtml + n + '</div>';
  }
  // text button for the footer
  function tbtn(label, onclick, cls) {
    return '<button type="button" class="pk-tbtn' + (cls ? ' ' + cls : '') + '" onclick="' + onclick + '">' + h(label) + '</button>';
  }

  /* ===================================================== SEARCH ===== */
  function renderSearch() {
    var s = D.search;

    // primary input + replace icon
    var primary = '<div class="pk-primary">' +
      '<input class="pk-input" placeholder="search in files…" value="' + h(s.query) + '">' +
      '<button class="pk-minibtn" title="toggle replace" onclick="PROTO_PICKER.toast(\'cmd.search.toggle_replace\')">&#8693;</button>' +
      '</div>';

    // inline flag pills + scope sprout
    var flags = '<div class="pk-pills">' +
      '<button class="pk-pill" onclick="this.classList.toggle(\'active\')"><span class="pk-pill-k">.*</span></button>' +
      '<button class="pk-pill" onclick="this.classList.toggle(\'active\')"><span class="pk-pill-k">Aa</span></button>' +
      '<button class="pk-pill" onclick="this.classList.toggle(\'active\')"><span class="pk-pill-k">\\b</span></button>' +
      '<span style="flex:1;min-width:0"></span>' +
      sprout({
        labelId: 'pkScopeLabel',
        action: 'cmd.search.set_scope',
        current: s.defaultScope,
        items: s.scopes.map(function (sc) { return { value: sc, label: sc }; })
      }) +
      '</div>';

    // Index KV section
    var indexBody =
      kv('engine', '<span class="pk-mono">' + h(s.index.engine) + '</span>') +
      kv('docs', s.index.docs.toLocaleString()) +
      kv('last', h(s.index.lastIndexed)) +
      kv('state', '<span class="pk-chip ok">' + h(s.index.state) + '</span>');

    // Matches dense list — file row then nested hit rows
    var matchesHtml = '';
    s.results.files.forEach(function (f) {
      matchesHtml += '<div class="pk-row" onclick="PROTO_PICKER.toast(\'files.open → ' + h(f.path) + '\')">' +
        '<span class="pk-row-main pk-row-mono">' + h(f.path) + '</span>' +
        '<span class="pk-row-meta">' + f.count + '</span></div>';
      f.hits.forEach(function (hit) {
        matchesHtml += '<div class="pk-hit" onclick="PROTO_PICKER.toast(\'files.open → ' + h(f.path) + ':' + hit.ln + '\')">' +
          '<span class="pk-ln">' + hit.ln + '</span>' +
          '<span class="pk-hit-code">' + trust(hit.html) + '</span></div>';
      });
    });

    var searchFoot = foot(
      tbtn('prev', 'PROTO_PICKER.toast(\'cmd.search.previous_result\')') +
      tbtn('next', 'PROTO_PICKER.toast(\'cmd.search.next_result\')') +
      '<span class="pk-foot-spacer"></span>' +
      tbtn('replace all', 'PROTO_PICKER.toast(\'cmd.search.replace_all → 7 across 3 files\')') +
      tbtn('rebuild', 'PROTO_PICKER.toast(\'cmd.search.reindex → tantivy rebuild queued (' + s.index.docs + ' docs)\')', 'primary')
    );

    return '<div class="pk-root">' +
      primary +
      flags +
      section('matches', s.results.total + ' in ' + s.results.fileCount + ' files', '<div class="pk-list">' + matchesHtml + '</div>') +
      section('index', null, indexBody) +
      searchFoot +
      '</div>';
  }

  /* ===================================================== SOURCE ===== */
  function renderSource() {
    var s = D.source;

    // Branch sprout (no <select>)
    var branchItems = s.branches.map(function (b) {
      return { value: b, label: b, meta: b === s.branch ? 'current' : '' };
    });
    var branchLine = '<div class="pk-titleline">' +
      '<span class="pk-title">branch</span>' +
      sprout({
        labelId: 'pkBranchLabel',
        action: 'cmd.git.switch_branch',
        current: s.branch,
        items: branchItems
      }) +
      '</div>';

    // Changes: staged then unstaged with a hairline between
    function fileRow(f, staged) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'cmd.git.open_diff → ' + h(f.path) + '\')">' +
        '<span class="pk-gs ' + f.status + '">' + f.status + '</span>' +
        '<span class="pk-row-main pk-row-mono">' + h(f.path) + '</span>' +
        (staged
          ? '<button class="pk-minibtn" title="unstage" onclick="event.stopPropagation();PROTO_PICKER.toast(\'cmd.git.unstage → ' + h(f.path) + '\')">&minus;</button>'
          : '<button class="pk-minibtn" title="stage" onclick="event.stopPropagation();PROTO_PICKER.toast(\'cmd.git.stage → ' + h(f.path) + '\')">+</button>') +
        '<button class="pk-minibtn danger" title="discard" onclick="event.stopPropagation();PROTO_PICKER.toast(\'cmd.git.discard → ' + h(f.path) + '\')">&times;</button>' +
        '</div>';
    }
    var stagedRows = s.changes.staged.map(function (f) { return fileRow(f, true); }).join('');
    var unstagedRows = s.changes.unstaged.map(function (f) { return fileRow(f, false); }).join('');
    var stagedPart = s.changes.staged.length
      ? section('staged', s.changes.staged.length, '<div class="pk-list">' + stagedRows + '</div>')
      : '';
    var unstagedPart = s.changes.unstaged.length
      ? section('unstaged', s.changes.unstaged.length, '<div class="pk-list">' + unstagedRows + '</div>')
      : '';

    // commit msg + commit/pull/push footer
    var commitInput = '<div class="pk-primary"><input class="pk-input" placeholder="commit message…"></div>';
    var syncFoot = foot(
      tbtn('ai', 'PROTO_PICKER.toast(\'cmd.git.commit_ai → drafting message\')') +
      tbtn('commit', 'PROTO_PICKER.toast(\'cmd.git.commit → 3 files committed\')', 'primary') +
      '<span class="pk-foot-spacer"></span>' +
      tbtn('pull', 'PROTO_PICKER.toast(\'cmd.git.pull\')') +
      tbtn('push', 'PROTO_PICKER.toast(\'cmd.git.push → ' + s.commit.outgoing + ' pushed\')') +
      tbtn('fetch', 'PROTO_PICKER.toast(\'cmd.git.fetch\')')
    );

    // Sync KV (incoming/outgoing)
    var syncBody =
      kv('incoming', String(s.commit.incoming)) +
      kv('outgoing', String(s.commit.outgoing)) +
      kv('freshness', h(s.projection.freshness)) +
      kv('health', '<span class="pk-chip ok">' + h(s.projection.health) + '</span>');

    // Worktrees dense list
    var wtRows = s.worktrees.map(function (w) {
      var dot = w.status === 'clean' ? 'ok' : 'fail';
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'cmd.git.worktree.switch → ' + h(w.branch) + '\')">' +
        '<span class="pk-dot ' + dot + '"></span>' +
        '<span class="pk-row-main pk-row-mono">' + h(w.branch) + '</span>' +
        '<span class="pk-row-meta">' + h(w.state) + '</span></div>';
    }).join('');

    // History dense list (sha : msg : when)
    var histRows = s.history.map(function (c) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'cmd.git.show_commit → ' + c.sha + '\')">' +
        '<span class="pk-row-mono" style="color:var(--accent-primary);flex-shrink:0">' + c.sha + '</span>' +
        '<span class="pk-row-main">' + h(c.msg) + '</span>' +
        '<span class="pk-row-meta">' + h(c.when) + '</span></div>';
    }).join('');

    // Stash
    var stashRows = s.stash.map(function (st) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'cmd.git.stash.apply → ' + h(st.name) + '\')">' +
        '<span class="pk-row-main pk-row-mono">' + h(st.label) + '</span>' +
        '<span class="pk-row-meta">' + st.files + 'f</span></div>';
    }).join('');

    return '<div class="pk-root">' +
      branchLine +
      stagedPart +
      unstagedPart +
      commitInput +
      syncFoot +
      section('sync', null, syncBody) +
      section('worktrees', s.worktrees.length, '<div class="pk-list">' + wtRows + '</div>') +
      section('history', s.history.length, '<div class="pk-list">' + histRows + '</div>') +
      section('stash', s.stash.length, '<div class="pk-list">' + stashRows + '</div>') +
      '</div>';
  }

  /* ===================================================== ACTIONS ===== */
  function renderActions() {
    var a = D.actions;

    // title line: branch + readiness
    var titleLine = '<div class="pk-titleline">' +
      '<span class="pk-title">branch ' + h(a.branch) + '</span>' +
      '<span class="pk-title-meta">' + h(a.readiness) + '</span>' +
      '</div>';

    // Connection KV
    var connBody =
      kv('account', '<span class="pk-mono">' + h(a.connection.account) + '</span>') +
      kv('state', '<span class="pk-chip ok">' + h(a.connection.state) + '</span>') +
      kv('scopes', '<span class="pk-mono">' + h(a.connection.scopes.join(' ')) + '</span>') +
      kv('missing', '<span class="pk-chip warn">' + h(a.connection.missing.join(', ')) + '</span>') +
      kv('snapshot', h(a.snapshot));

    // Runs dense list with triage
    var runsHtml = '';
    a.runs.forEach(function (r) {
      var dotCls = r.status === 'success' ? 'ok' : 'fail';
      var chipCls = r.status === 'success' ? 'ok' : 'err';
      runsHtml += '<div class="pk-row" onclick="PROTO_PICKER.toast(\'cmd.github.actions.open_run → ' + r.id + '\')">' +
        '<span class="pk-dot ' + dotCls + '"></span>' +
        '<span class="pk-row-main">' + h(r.name) + '</span>' +
        '<span class="pk-chip ' + chipCls + '">' + h(r.status) + '</span></div>';
      // meta sub-row
      runsHtml += '<div class="pk-row flush" onclick="PROTO_PICKER.toast(\'cmd.github.actions.open_run → ' + r.id + '\')">' +
        '<span class="pk-row-sub pk-row-mono">' + h(r.meta) + '</span></div>';
      if (r.triage) {
        runsHtml += '<div class="pk-log">' +
          '<div class="pk-log-line">failing: <b>' + h(r.triage.job) + '</b> / ' + h(r.triage.step) + '</div>' +
          '<div class="pk-log-line">changed: ' + h(r.triage.changed) + '</div>' +
          r.triage.log.map(function (l, i) {
            return '<div class="pk-log-line' + (i === 0 ? ' pk-log-fail' : '') + '">' + h(l) + '</div>';
          }).join('') +
          '<div class="pk-log-line">next: ' + h(r.triage.next) + '</div>' +
          '</div>';
        runsHtml += '<div class="pk-foot" style="border-top:none;padding-top:var(--xs)">' +
          tbtn('rerun', 'PROTO_PICKER.toast(\'cmd.github.actions.rerun → ' + r.id + '\')', 'primary') +
          '<span class="pk-foot-spacer"></span>' +
          tbtn('compare green', 'PROTO_PICKER.toast(\'cmd.github.actions.compare_last_success\')') +
          '</div>';
      }
    });

    // Workflows dense list
    var wfRows = a.workflows.map(function (w) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'blocked: ' + h(w.reason) + ' — reconnect with workflow scope\')">' +
        '<span class="pk-row-main">' + h(w.name) + '</span>' +
        '<span class="pk-chip muted">' + h(w.reason) + '</span></div>';
    }).join('');

    // Secrets
    var secRows = a.secrets.map(function (sec) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'cmd.github.secret.reveal → ' + h(sec) + '\')">' +
        '<span class="pk-row-main pk-row-mono">' + h(sec) + '</span>' +
        '<span class="pk-row-meta">&bull;&bull;&bull;&bull;</span></div>';
    }).join('');

    var connFoot = foot(
      tbtn('reconnect', 'PROTO_PICKER.toast(\'cmd.github.reconnect → device flow\')', 'primary')
    );

    return '<div class="pk-root">' +
      titleLine +
      section('runs', a.runs.length, '<div class="pk-list">' + runsHtml + '</div>') +
      section('connection', null, connBody + connFoot) +
      section('workflows', a.workflows.length, '<div class="pk-list">' + wfRows + '</div>') +
      section('secrets', a.secrets.length, '<div class="pk-list">' + secRows + '</div>') +
      '</div>';
  }

  /* ===================================================== DOCKER ===== */
  function renderDocker() {
    var d = D.docker;

    // Runtime KV + view sprout
    var runtimeBody =
      kv('context', '<span class="pk-mono">' + h(d.runtime.context) + '</span>') +
      kv('state', '<span class="pk-chip ok">' + h(d.runtime.state) + '</span>');

    var viewItems = d.views.map(function (v) { return { value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }; });
    var viewLine = '<div class="pk-titleline">' +
      '<span class="pk-title">view</span>' +
      sprout({
        labelId: 'pkDockerView',
        action: 'docker.view',
        current: d.defaultView.charAt(0).toUpperCase() + d.defaultView.slice(1),
        items: viewItems
      }) +
      '</div>';

    function statusDot(st) { return st === 'running' ? 'ok' : (st === 'restarting' ? 'run' : 'idle'); }
    function statusChip(st) {
      if (st === 'running') return '<span class="pk-chip ok">run</span>';
      if (st === 'restarting') return '<span class="pk-chip warn">restart</span>';
      return '<span class="pk-chip muted">' + h(st) + '</span>';
    }

    // Containers dense list: name : status : port
    var containerRows = d.containers.map(function (c) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'docker.inspect → ' + h(c.name) + '\')">' +
        '<span class="pk-dot ' + statusDot(c.status) + '"></span>' +
        '<span class="pk-row-main">' + h(c.name) + '</span>' +
        '<span class="pk-row-meta">' + h(c.ports) + '</span>' +
        statusChip(c.status) +
        '</div>';
    }).join('');

    // Images dense list
    var imageRows = d.images.map(function (im) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'docker.image.inspect → ' + h(im.name) + '\')">' +
        '<span class="pk-row-main pk-row-mono">' + h(im.name) + '</span>' +
        '<span class="pk-row-meta">' + h(im.size) + '</span></div>';
    }).join('');

    // Compose dense list
    var composeRows = d.compose.map(function (c) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'compose.up → ' + h(c.svc) + '\')">' +
        '<span class="pk-row-main pk-row-mono">' + h(c.svc) + '</span>' +
        '<span class="pk-row-meta">' + h(c.status) + '</span></div>';
    }).join('');

    // Build KV
    var buildBody =
      kv('target', '<span class="pk-mono">' + h(d.build.target) + '</span>') +
      kv('tag', '<span class="pk-mono">' + h(d.build.tag) + '</span>') +
      kv('digest', '<span class="pk-mono">' + h(d.build.digest) + '</span>') +
      kv('arch', '<span class="pk-mono">' + h(d.build.arch) + '</span>') +
      kv('buildx', d.build.buildx ? 'yes' : 'no') +
      kv('bake', d.build.bake ? 'yes' : 'no');

    // Publish chain — numbered dense steps
    function pubChipCls(state) {
      if (state === 'exists' || state === 'ready_to_push') return 'ok';
      if (state === 'waiting') return 'muted';
      return 'warn';
    }
    var publishRows = d.publish.map(function (p) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'docker.publish.stage → ' + p.stage + '\')">' +
        '<span class="pk-row-mono" style="color:var(--text-muted);flex-shrink:0">' + p.stage + '</span>' +
        '<span class="pk-row-main">' + h(p.label) + '</span>' +
        '<span class="pk-chip ' + pubChipCls(p.state) + '">' + h(p.state) + '</span></div>';
    }).join('');

    // Registries dense list
    var regRows = d.registries.map(function (r) {
      var cls = r.state === 'authenticated' || r.state === 'reachable' ? 'ok' : 'muted';
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'docker.registry → ' + h(r.name) + '\')">' +
        '<span class="pk-row-main pk-row-mono">' + h(r.name) + '</span>' +
        '<span class="pk-chip ' + cls + '">' + h(r.state) + '</span></div>';
    }).join('');

    // Scenarios
    var scenRows = d.scenarios.map(function (sc) {
      var cls = sc.stale ? 'warn' : 'ok';
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'docker.scenario → ' + h(sc.name) + '\')">' +
        '<span class="pk-row-main">' + h(sc.name) + '</span>' +
        (sc.stale ? '<span class="pk-chip warn">stale</span>' : '<span class="pk-chip ok">fresh</span>') +
        '</div>';
    }).join('');

    var containerFoot = foot(
      tbtn('restart', 'PROTO_PICKER.toast(\'cmd.docker.restart\')') +
      tbtn('stop', 'PROTO_PICKER.toast(\'cmd.docker.stop\')') +
      '<span class="pk-foot-spacer"></span>' +
      tbtn('logs', 'PROTO_PICKER.toast(\'cmd.docker.logs\')')
    );
    var buildFoot = foot(
      tbtn('build', 'PROTO_PICKER.toast(\'cmd.docker.build\')', 'primary')
    );
    var publishFoot = foot(
      tbtn('push', 'PROTO_PICKER.toast(\'cmd.docker.push\')', 'primary') +
      '<span class="pk-foot-spacer"></span>' +
      tbtn('template', 'PROTO_PICKER.toast(\'cmd.docker.template_commit\')')
    );

    return '<div class="pk-root">' +
      viewLine +
      section('runtime', null, runtimeBody) +
      section('containers', d.containers.length, '<div class="pk-list">' + containerRows + '</div>' + containerFoot) +
      section('images', d.images.length, '<div class="pk-list">' + imageRows + '</div>') +
      section('compose', d.compose.length, '<div class="pk-list">' + composeRows + '</div>') +
      section('scenarios', d.scenarios.length, '<div class="pk-list">' + scenRows + '</div>') +
      section('build / bake', null, buildBody + buildFoot) +
      section('publish', d.publish.length, '<div class="pk-list">' + publishRows + '</div>' + publishFoot) +
      section('registries', d.registries.length, '<div class="pk-list">' + regRows + '</div>') +
      '</div>';
  }

  /* ===================================================== TESTS ===== */
  function renderTests() {
    var t = D.tests;

    // Last run KV
    var lastBody =
      kv('command', '<span class="pk-mono">' + h(t.lastRun.command) + '</span>') +
      kv('result', '<span class="pk-chip ok">' + h(t.lastRun.result) + '</span>') +
      kv('when', h(t.lastRun.when)) +
      kv('history', h(t.lastRun.history));

    // Sessions dense list: suite : cases : dur : status
    function sessDot(st) { return st === 'pass' ? 'ok' : (st === 'fail' ? 'fail' : 'idle'); }
    var sessRows = t.sessions.map(function (ss) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'test.open_session → ' + h(ss.id) + '\')">' +
        '<span class="pk-dot ' + sessDot(ss.status) + '"></span>' +
        '<span class="pk-row-main pk-row-mono">' + h(ss.suite) + '</span>' +
        '<span class="pk-row-meta">' + ss.cases + 'c &middot; ' + h(ss.dur) + '</span>' +
        '<span class="pk-chip ok">' + h(ss.status) + '</span></div>';
    }).join('');

    // Policy KV
    var policyBody =
      kv('visibility', '<span class="pk-chip ok">' + h(t.policy) + '</span>') +
      '<div class="pk-note">' + h(t.policyNote) + '</div>';

    var lastFoot = foot(
      tbtn('run tests', 'PROTO_PICKER.toast(\'cmd.test.run\')', 'primary') +
      '<span class="pk-foot-spacer"></span>' +
      tbtn('debug', 'PROTO_PICKER.toast(\'panels.show → run_debug\')')
    );

    return '<div class="pk-root">' +
      section('last run', h(t.lastRun.result), lastBody + lastFoot) +
      section('sessions', t.sessions.length, '<div class="pk-list">' + sessRows + '</div>') +
      section('policy', null, policyBody) +
      '</div>';
  }

  /* ===================================================== AGENTS ===== */
  function renderAgents() {
    var a = D.agents;

    function agDot(st) { return st === 'running' ? 'run' : (st === 'done' ? 'ok' : 'idle'); }
    function agChip(st) { return st === 'running' ? 'run' : (st === 'done' ? 'ok' : 'muted'); }

    var agentRows = a.active.map(function (ag) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'agent.expand → ' + h(ag.name) + '\')">' +
        '<span class="pk-dot ' + agDot(ag.status) + '"></span>' +
        '<span class="pk-row-main">' + h(ag.name) + '</span>' +
        '<span class="pk-chip ' + agChip(ag.status) + '">' + h(ag.status) + '</span></div>' +
        '<div class="pk-row flush" onclick="PROTO_PICKER.toast(\'agent.expand → ' + h(ag.name) + '\')">' +
        '<span class="pk-row-sub pk-row-mono">' + h(ag.meta) + '</span></div>';
    }).join('');

    var agentFoot = foot(
      tbtn('open chat', 'PROTO_PICKER.toast(\'panels.open_chat\')', 'primary'),
      h(a.note)
    );

    return '<div class="pk-root">' +
      section('active', a.active.length + ' subagents', '<div class="pk-list">' + agentRows + '</div>' + agentFoot) +
      '</div>';
  }

  /* ===================================================== ARTIFACTS ===== */
  function renderArtifacts() {
    var a = D.artifacts;

    // Filter pills
    var filterItems = a.filters.map(function (f) {
      var sel = f === a.defaultFilter ? ' active' : '';
      return '<button class="pk-pill' + sel + '" onclick="PROTO_PICKER.toast(\'artifacts.filter → ' + h(f) + '\')">' +
        '<span class="pk-pill-k">' + h(f) + '</span></button>';
    }).join('');

    // dense artifact rows: type : label : status : time
    function rowChipCls(st) {
      if (st === 'success' || st === 'completed' || st === 'pass on retry') return 'ok';
      return 'muted';
    }
    // extract a short time token from the meta tail (last "… ago" fragment)
    function timeOf(meta) {
      var m = String(meta).match(/(\d+[mh]?\s*(?:ago|min|sec)?)\s*$/i);
      return m ? m[1] : '';
    }
    var artRows = a.rows.map(function (r) {
      return '<div class="pk-row" onclick="PROTO_PICKER.toast(\'open ' + h(r.type) + ' → ' + h(r.label) + '\')">' +
        '<span class="pk-chip fam">' + h(r.type) + '</span>' +
        '<span class="pk-row-main">' + h(r.label) + '</span>' +
        '<span class="pk-chip ' + rowChipCls(r.status) + '">' + h(r.status) + '</span></div>' +
        '<div class="pk-row flush" onclick="PROTO_PICKER.toast(\'open ' + h(r.type) + ' → ' + h(r.label) + '\')">' +
        '<span class="pk-row-sub pk-row-mono">' + h(r.prev) + '</span>' +
        '<span class="pk-row-meta">' + h(timeOf(r.meta)) + '</span></div>';
    }).join('');

    // Investigation
    var inv = a.investigation;
    var chipRows = inv.chips.map(function (c) {
      return kv(h(c.label), c.ok ? 'yes' : 'no', c.ok ? '' : 'primary');
    }).join('');

    var stepRows = inv.steps.map(function (s, i) {
      return '<div class="pk-step" onclick="PROTO_PICKER.toast(\'open ' + h(s.role) + ' → ' + h(s.type) + '\')">' +
        '<span class="pk-step-num">' + (i + 1) + '</span>' +
        '<span class="pk-step-main">' + h(s.label) + '</span>' +
        '<span class="pk-step-type">' + h(s.type) + '</span></div>';
    }).join('');

    var invFoot = foot(
      tbtn('open in orchestrator', 'PROTO_PICKER.toast(\'page.go → orchestrator:evidence\')', 'primary')
    );

    return '<div class="pk-root">' +
      '<div class="pk-pills">' + filterItems + '</div>' +
      section('artifacts', a.rows.length, '<div class="pk-list">' + artRows + '</div>') +
      section('investigation ' + inv.id, null,
        kv('title', h(inv.title)) +
        chipRows +
        '<div class="pk-list">' + stepRows + '</div>' +
        invFoot
      ) +
      '<div class="pk-note">rows are compact receipts — payloads load on demand.</div>' +
      '</div>';
  }

  /* ===================================================== registry ===== */
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
  window.PROTO_DESIGNS.E = {
    id: 'E',
    name: 'Dense KV Grid',
    render: function (panel) {
      var fn = renderers[panel];
      return fn ? fn() : '<div class="pk-root"><div class="pk-note">no renderer for ' + h(panel) + '</div></div>';
    }
  };
})();
