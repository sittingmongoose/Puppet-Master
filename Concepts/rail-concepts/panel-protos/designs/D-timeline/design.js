/* =====================================================================
   DESIGN D — VERTICAL TIMELINE — renderer for all 7 panels.
   Registers window.PROTO_DESIGNS.D. Each render(panelId) returns HTML.
   A vertical spine runs down the left edge; every entry is a node on the
   spine with a compact card to its right. Story unfolds top→bottom.

   Status → node color:  passed/ok/done → ok, running/restart → run,
                          failed → fail, idle/waiting/pending/queued → idle,
                          neutral → accent.
   Spine variants: time spine (history/runs), match spine (search files +
                   nested hit nodes), status spine (docker containers),
                   lineage spine (tests sessions, agents), stage spine
                   (publish chain).
   ===================================================================== */
(function () {
  'use strict';
  var D = window.PROTO_DATA.getData();
  var h = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  // search hit bodies are pre-emphasized trusted HTML
  function trust(s) { return s; }

  /* ---- sprout menu builder (replaces <select>) ---- */
  function sproutMenu(opts) {
    // opts: { labelId, action, triggerClass, triggerExtra, current, items:[{value,label,meta}], block }
    var items = opts.items.map(function (it) {
      var sel = it.value === opts.current ? ' is-selected' : '';
      var meta = it.meta ? '<span class="pm6-mi-meta">' + h(it.meta) + '</span>' : '';
      return '<button type="button" class="pm6-tb-menu-item' + sel + '" data-value="' + h(it.value) + '">' +
        '<svg class="pm6-mi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<span class="pm6-mi-label">' + h(it.label) + '</span>' + meta + '</button>';
    }).join('');
    var block = opts.block ? ' block' : '';
    var trig = opts.triggerLabel != null
      ? opts.triggerLabel
      : '<span id="' + opts.labelId + '" class="pt-trig-label">' + h(opts.current) + '</span>';
    return '<div class="pm6-tb-menu-wrap" data-select="single"' +
      ' data-label-target="' + opts.labelId + '"' +
      (opts.action ? ' data-action="' + opts.action + '"' : '') + '>' +
      '<button type="button" class="pt-trigger' + block + '" aria-haspopup="menu" aria-expanded="false">' +
      (opts.triggerIcon || '') + trig +
      '<span class="pm6-tb-chev" style="font-size:8px;opacity:.6">&#9662;</span></button>' +
      '<div class="pm6-tb-menu sprout-left" role="menu">' + items + '</div></div>';
  }

  /* ---- helpers to map statuses ---- */
  function statusNode(st) {
    var s = String(st).toLowerCase();
    if (/^(pass|passed|ok|success|done|completed|connected|authenticated|reachable|ready|clean|running-healthy|green)$/.test(s)) return 'ok';
    if (/^(run|running|restart|restarting|in-?progress|active)$/.test(s)) return 'run';
    if (/^(fail|failed|err|error|exited|not_configured)$/.test(s)) return 'fail';
    if (/^(idle|wait|waiting|pending|queued|stale|exists|ready_to_push)$/.test(s)) return 'idle';
    return 'idle';
  }
  function statusChipClass(st) {
    var s = String(st).toLowerCase();
    if (/^(pass|passed|ok|success|done|completed|connected|authenticated|reachable|clean|green)$/.test(s)) return 'ok';
    if (/^(run|running|restart|restarting|in-?progress|active)$/.test(s)) return 'run';
    if (/^(fail|failed|err|error|exited|not_configured)$/.test(s)) return 'fail';
    if (/^(idle|wait|waiting|pending|queued|stale)$/.test(s)) return 'idle';
    return 'muted';
  }

  /* ===================================================== SEARCH (match spine) === */
  function renderSearch() {
    var s = D.search;

    var filesHtml = s.results.files.map(function (f, fi) {
      var hitsHtml = f.hits.map(function (hit) {
        return '<div class="pt-hit" onclick="PROTO_PICKER.toast(\'files.open → ' + h(f.path) + ':' + hit.ln + '\')">' +
          '<span class="pt-mini-node"></span>' +
          '<span class="pt-ln">' + hit.ln + '</span>' +
          '<span class="pt-code">' + trust(hit.html) + '</span></div>';
      }).join('');
      var more = f.count > 2
        ? '<div class="pt-meta" style="padding-left:16px">+ ' + (f.count - 2) + ' more in file</div>'
        : '';
      return '<div class="pt-entry">' +
        '<span class="pt-node accent"></span>' +
        '<div class="pt-card clickable" onclick="PROTO_PICKER.toast(\'files.open → ' + h(f.path) + '\')">' +
          '<div class="pt-line">' +
            '<span class="pt-title mono">' + h(f.path) + '</span>' +
            '<span class="pt-chip accent">' + f.count + '</span>' +
          '</div>' +
          '<div class="pt-sub-spine">' + hitsHtml + more + '</div>' +
        '</div>' +
        '</div>';
    }).join('');

    var flags = '<div class="pt-pills">' +
      '<button class="pt-pill" onclick="this.classList.toggle(\'active\')">.* <span class="pt-muted">Re</span></button>' +
      '<button class="pt-pill" onclick="this.classList.toggle(\'active\')">Aa <span class="pt-muted">Cc</span></button>' +
      '<button class="pt-pill" onclick="this.classList.toggle(\'active\')">\\b <span class="pt-muted">Wd</span></button>' +
      '<span class="pt-spacer"></span>' +
      sproutMenu({
        labelId: 'ptScopeSearch',
        action: 'cmd.search.set_scope',
        current: s.defaultScope,
        items: s.scopes.map(function (sc) { return { value: sc, label: sc }; })
      }) +
      '</div>';

    var indexSpine = '<div class="pt-spine">' +
      '<div class="pt-entry"><span class="pt-node ok"></span>' +
        '<div class="pt-card">' +
          '<div class="pt-line"><span class="pt-title mono">engine</span><span class="pt-chip ok">ready</span></div>' +
          '<div class="pt-sub mono">' + h(s.index.engine) + ' · ' + s.index.docs.toLocaleString() + ' docs</div>' +
        '</div></div>' +
      '<div class="pt-entry"><span class="pt-node idle"></span>' +
        '<div class="pt-card">' +
          '<div class="pt-line"><span class="pt-title">indexed</span></div>' +
          '<div class="pt-sub">' + h(s.index.lastIndexed) + '</div>' +
        '</div></div>' +
      '</div>';

    return '<div class="pt-root">' +
      '<div class="pt-head">' +
        '<div class="pt-line">' +
          '<input class="pt-input mono" placeholder="Search in files…" value="' + h(s.query) + '">' +
        '</div>' +
        flags +
        '<div class="pt-head-row"><span class="pt-head-label">Results</span>' +
          '<span class="pt-head-meta">' + s.results.total + ' in ' + s.results.fileCount + ' files</span></div>' +
      '</div>' +
      '<div class="pt-spine">' + filesHtml + '</div>' +
      '<div class="pt-btnrow">' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.search.previous_result\')">&#9650; Prev</button>' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.search.next_result\')">&#9660; Next</button>' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.search.replace_all → 7 across 3 files\')">Repl</button>' +
      '</div>' +
      '<div class="pt-group-label">Index status</div>' +
      indexSpine +
      '<button class="pt-btn block" onclick="PROTO_PICKER.toast(\'cmd.search.reindex → tantivy rebuild queued (' + s.index.docs + ' docs)\')">Rebuild index</button>' +
      '</div>';
  }

  /* ===================================================== SOURCE (lineage spine) === */
  function renderSource() {
    var s = D.source;

    // branch sprout menu
    var branchMenu = sproutMenu({
      labelId: 'ptBranchLabel',
      action: 'cmd.git.switch_branch',
      block: true,
      triggerIcon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M6 9v6"/></svg>',
      current: s.branch,
      items: s.branches.map(function (b) {
        return { value: b, label: b, meta: b === s.branch ? 'current' : '' };
      })
    });

    // changes as a spine — staged then unstaged
    function changeEntry(f, staged) {
      return '<div class="pt-entry">' +
        '<span class="pt-node ' + (f.status === 'M' ? 'run' : 'ok') + '"></span>' +
        '<div class="pt-card">' +
          '<div class="pt-line">' +
            '<span class="pt-gs ' + f.status + '">' + f.status + '</span>' +
            '<span class="pt-title mono" onclick="PROTO_PICKER.toast(\'cmd.git.open_diff → ' + h(f.path) + '\')">' + h(f.path) + '</span>' +
            (staged
              ? '<button class="pt-minibtn" title="Unstage" onclick="PROTO_PICKER.toast(\'cmd.git.unstage → ' + h(f.path) + '\')">−</button>'
              : '<button class="pt-minibtn" title="Stage" onclick="PROTO_PICKER.toast(\'cmd.git.stage → ' + h(f.path) + '\')">+</button>') +
            '<button class="pt-minibtn danger" title="Discard" onclick="PROTO_PICKER.toast(\'cmd.git.discard → ' + h(f.path) + '\')">×</button>' +
          '</div>' +
          '<div class="pt-sub">' + h(f.note) + '</div>' +
        '</div></div>';
    }
    var staged = s.changes.staged.map(function (f) { return changeEntry(f, true); }).join('');
    var unstaged = s.changes.unstaged.map(function (f) { return changeEntry(f, false); }).join('');

    var changesSpine =
      '<div class="pt-group-label">Staged · ' + s.changes.staged.length + '</div>' +
      (staged || '<div class="pt-meta">nothing staged</div>') +
      '<div class="pt-group-label">Unstaged · ' + s.changes.unstaged.length + '</div>' +
      (unstaged || '<div class="pt-meta">clean working tree</div>');

    var worktreeSpine = s.worktrees.map(function (w) {
      var pr = w.pr ? '<div class="pt-sub">PR: ' + h(w.pr) + '</div>' : '';
      return '<div class="pt-entry">' +
        '<span class="pt-node ' + (w.status === 'clean' ? 'ok' : 'warn') + '"></span>' +
        '<div class="pt-card clickable" onclick="PROTO_PICKER.toast(\'cmd.git.worktree.switch → ' + h(w.branch) + '\')">' +
          '<div class="pt-line"><span class="pt-title mono">' + h(w.branch) + '</span>' +
            '<span class="pt-chip ' + (w.status === 'clean' ? 'ok' : 'warn') + '">' + h(w.status) + '</span></div>' +
          '<div class="pt-sub">' + h(w.owner) + '</div>' +
          '<div class="pt-sub">' + h(w.base) + '</div>' +
          pr +
        '</div></div>';
    }).join('');

    var historySpine = s.history.map(function (c) {
      return '<div class="pt-entry">' +
        '<span class="pt-node accent"></span>' +
        '<div class="pt-card clickable" onclick="PROTO_PICKER.toast(\'cmd.git.show_commit → ' + c.sha + '\')">' +
          '<div class="pt-line"><span class="pt-title mono">' + c.sha + '</span><span class="pt-meta">' + h(c.when) + '</span></div>' +
          '<div class="pt-sub">' + h(c.msg) + '</div>' +
        '</div></div>';
    }).join('');

    var stashSpine = s.stash.map(function (st) {
      return '<div class="pt-entry"><span class="pt-node idle"></span>' +
        '<div class="pt-card">' +
          '<div class="pt-line"><span class="pt-title mono">' + h(st.name) + '</span><span class="pt-meta">' + st.files + ' files</span></div>' +
          '<div class="pt-sub">' + h(st.label) + '</div>' +
        '</div></div>';
    }).join('');

    return '<div class="pt-root">' +
      branchMenu +
      '<div class="pt-head-row"><span class="pt-head-label">Commit graph</span>' +
        '<span class="pt-head-meta">' + s.commit.incoming + '↓ · ' + s.commit.outgoing + '↑</span></div>' +
      '<div class="pt-group-label">Changes</div>' +
      '<div class="pt-spine">' + changesSpine + '</div>' +
      '<input class="pt-input mono" placeholder="Commit message…">' +
      '<div class="pt-btnrow">' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.git.commit_ai → drafting message\')">AI</button>' +
        '<button class="pt-btn primary" onclick="PROTO_PICKER.toast(\'cmd.git.commit → 3 files committed\')">Commit</button>' +
      '</div>' +
      '<div class="pt-btnrow">' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.git.pull\')">Pull</button>' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.git.push → ' + s.commit.outgoing + ' pushed\')">Push</button>' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.git.fetch\')">Fetch</button>' +
      '</div>' +
      '<div class="pt-group-label">Worktrees · ' + s.worktrees.length + '</div>' +
      '<div class="pt-spine">' + worktreeSpine + '</div>' +
      '<button class="pt-btn block" onclick="PROTO_PICKER.toast(\'cmd.git.worktree.new\')">+ New worktree</button>' +
      '<div class="pt-group-label">History · ' + s.history.length + '</div>' +
      '<div class="pt-spine">' + historySpine + '</div>' +
      '<div class="pt-group-label">Stash · ' + s.stash.length + '</div>' +
      '<div class="pt-spine">' + stashSpine + '</div>' +
      '</div>';
  }

  /* ===================================================== ACTIONS (runs spine) === */
  function renderActions() {
    var a = D.actions;

    var runsSpine = a.runs.map(function (r) {
      var nodeCls = statusNode(r.status);
      var chipCls = statusChipClass(r.status);
      var entry = '<div class="pt-entry">' +
        '<span class="pt-node ' + nodeCls + '"></span>' +
        '<div class="pt-card clickable" onclick="PROTO_PICKER.toast(\'cmd.github.actions.open_run → ' + r.id + '\')">' +
          '<div class="pt-line"><span class="pt-title">' + h(r.name) + '</span>' +
            '<span class="pt-chip ' + chipCls + '">' + h(r.status) + '</span></div>' +
          '<div class="pt-sub mono">' + h(r.meta) + '</div>';
      if (r.triage) {
        entry +=
          '<div class="pt-log" onclick="event.stopPropagation()">' +
            '<div class="pt-log-head">Failing: <b>' + h(r.triage.job) + '</b> / ' + h(r.triage.step) + '</div>' +
            r.triage.log.map(function (l, i) { return '<div class="' + (i === 0 ? 'pt-log-fail' : '') + '">' + h(l) + '</div>'; }).join('') +
          '</div>' +
          '<div class="pt-sub">changed: <span class="pt-mono">' + h(r.triage.changed) + '</span></div>' +
          '<div class="pt-sub">next: ' + h(r.triage.next) + '</div>' +
          '<div class="pt-btnrow" style="margin-top:var(--xs)" onclick="event.stopPropagation()">' +
            '<button class="pt-btn primary" onclick="PROTO_PICKER.toast(\'cmd.github.actions.rerun → ' + r.id + '\')">Rerun</button>' +
            '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.github.actions.compare_last_success\')">Diff green</button>' +
          '</div>';
      }
      entry += '</div></div>';
      return entry;
    }).join('');

    var connSpine = '<div class="pt-spine">' +
      '<div class="pt-entry"><span class="pt-node ok"></span>' +
        '<div class="pt-card"><div class="pt-line"><span class="pt-title mono">' + h(a.connection.account) + '</span>' +
          '<span class="pt-chip ok">connected</span></div>' +
          '<div class="pt-sub">scopes: ' + a.connection.scopes.join(', ') + '</div></div></div>' +
      '<div class="pt-entry"><span class="pt-node warn"></span>' +
        '<div class="pt-card"><div class="pt-line"><span class="pt-title">missing scope</span>' +
          '<span class="pt-chip warn">' + a.connection.missing.join(', ') + '</span></div></div></div>' +
      '</div>';

    var wfSpine = a.workflows.map(function (w) {
      return '<div class="pt-entry"><span class="pt-node idle"></span>' +
        '<div class="pt-card"><div class="pt-line"><span class="pt-title">' + h(w.name) + '</span>' +
          '<button class="pt-minibtn" title="Blocked: ' + w.reason + '" onclick="PROTO_PICKER.toast(\'Blocked: ' + w.reason + ' — reconnect with workflow scope\')">Dispatch</button></div>' +
        '<div class="pt-sub">blocked: ' + h(w.reason) + '</div></div></div>';
    }).join('');

    return '<div class="pt-root">' +
      '<div class="pt-head">' +
        '<div class="pt-head-row"><span class="pt-head-label">Runs · branch ' + h(a.branch) + '</span>' +
          '<span class="pt-head-meta">' + h(a.readiness) + '</span></div>' +
        '<div class="pt-foot">' + h(a.snapshot) + '</div>' +
      '</div>' +
      '<div class="pt-spine">' + runsSpine + '</div>' +
      '<div class="pt-group-label">Workflows · ' + a.workflows.length + '</div>' +
      '<div class="pt-spine">' + wfSpine + '</div>' +
      '<div class="pt-group-label">Connection</div>' +
      connSpine +
      '<button class="pt-btn block" onclick="PROTO_PICKER.toast(\'cmd.github.reconnect → device flow\')">Reconnect</button>' +
      '<div class="pt-group-label">Secrets · ' + a.secrets.length + '</div>' +
      '<div class="pt-spine">' +
        a.secrets.map(function (sec) {
          return '<div class="pt-entry"><span class="pt-node accent"></span>' +
            '<div class="pt-card"><div class="pt-line"><span class="pt-title mono">' + h(sec) + '</span></div></div></div>';
        }).join('') +
      '</div>' +
      '</div>';
  }

  /* ===================================================== DOCKER (status spine) === */
  function renderDocker() {
    var d = D.docker;

    // view sprout menu
    var viewMenu = sproutMenu({
      labelId: 'ptDockerView',
      action: 'cmd.docker.set_view',
      triggerIcon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M3 6h18M6 12h12M10 18h4"/></svg>',
      current: d.defaultView,
      items: d.views.map(function (v) { return { value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }; })
    });

    // sort containers into a status spine: running → restarting → exited
    var order = { running: 0, restarting: 1, exited: 2 };
    var containers = d.containers.slice().sort(function (a, b) {
      return (order[a.status] || 9) - (order[b.status] || 9);
    });
    var containersSpine = containers.map(function (c) {
      var nodeCls = c.status === 'running' ? 'run' : (c.status === 'restarting' ? 'warn' : 'idle');
      var chipCls = c.status === 'running' ? 'run' : (c.status === 'restarting' ? 'warn' : 'idle');
      return '<div class="pt-entry">' +
        '<span class="pt-node ' + nodeCls + '"></span>' +
        '<div class="pt-card">' +
          '<div class="pt-line"><span class="pt-title">' + h(c.name) + '</span>' +
            '<span class="pt-chip ' + chipCls + '">' + h(c.status) + '</span></div>' +
          '<div class="pt-sub mono">' + h(c.image) + '</div>' +
          '<div class="pt-sub">port ' + h(c.ports) + ' · ' + h(c.uptime) + '</div>' +
        '</div></div>';
    }).join('');

    var imagesSpine = d.images.map(function (im) {
      return '<div class="pt-entry"><span class="pt-node accent"></span>' +
        '<div class="pt-card"><div class="pt-line"><span class="pt-title mono">' + h(im.name) + '</span>' +
          '<span class="pt-meta">' + h(im.size) + '</span></div></div></div>';
    }).join('');

    // publish chain — stage spine
    var chainSteps = d.publish.map(function (p) {
      var done = p.state === 'exists' || p.state === 'ready_to_push';
      var run = p.state === 'ready_to_push';
      var cls = done ? (run ? 'run' : 'done') : '';
      var chipCls = done ? (run ? 'run' : 'ok') : 'idle';
      return '<div class="pt-chain-step ' + cls + '">' +
        '<span class="pt-chain-num">' + p.stage + '</span>' +
        '<span class="pt-chain-label">' + h(p.label) + '</span>' +
        '<span class="pt-chip ' + chipCls + '">' + h(p.state) + '</span>' +
        '</div>';
    }).join('');

    var buildKv = '<div class="pt-kv"><span class="pt-kv-k">Target</span><span class="pt-kv-v mono">' + h(d.build.target) + '</span></div>' +
      '<div class="pt-kv"><span class="pt-kv-k">Tag</span><span class="pt-kv-v mono">' + h(d.build.tag) + '</span></div>' +
      '<div class="pt-kv"><span class="pt-kv-k">Digest</span><span class="pt-kv-v mono">' + h(d.build.digest) + '</span></div>' +
      '<div class="pt-kv"><span class="pt-kv-k">Arch</span><span class="pt-kv-v mono">' + h(d.build.arch) + '</span></div>' +
      '<div class="pt-kv"><span class="pt-kv-k">buildx</span><span class="pt-kv-v mono">' + (d.build.buildx ? 'on' : 'off') + ' · bake ' + (d.build.bake ? 'on' : 'off') + '</span></div>';

    var composeSpine = d.compose.map(function (c) {
      var nodeCls = c.status === 'running' ? 'run' : 'idle';
      return '<div class="pt-entry"><span class="pt-node ' + nodeCls + '"></span>' +
        '<div class="pt-card"><div class="pt-line"><span class="pt-title mono">' + h(c.svc) + '</span>' +
          '<span class="pt-chip ' + statusChipClass(c.status) + '">' + h(c.status) + '</span></div>' +
        '<div class="pt-sub mono">' + h(c.image) + '</div></div></div>';
    }).join('');

    var regSpine = d.registries.map(function (r) {
      var nodeCls = r.state === 'authenticated' || r.state === 'reachable' ? 'ok' : 'idle';
      var chipCls = r.state === 'authenticated' || r.state === 'reachable' ? 'ok' : 'muted';
      return '<div class="pt-entry"><span class="pt-node ' + nodeCls + '"></span>' +
        '<div class="pt-card"><div class="pt-line"><span class="pt-title mono">' + h(r.name) + '</span>' +
          '<span class="pt-chip ' + chipCls + '">' + h(r.state) + '</span></div>' +
        '<div class="pt-sub">account: ' + h(r.account) + '</div></div></div>';
    }).join('');

    return '<div class="pt-root">' +
      '<div class="pt-head">' +
        '<div class="pt-head-row"><span class="pt-head-label">Runtime · context ' + h(d.runtime.context) + '</span>' +
          '<span class="pt-chip ok">' + h(d.runtime.state) + '</span></div>' +
        viewMenu +
      '</div>' +
      '<div class="pt-group-label">Containers · ' + d.containers.length + '</div>' +
      '<div class="pt-spine">' + containersSpine + '</div>' +
      '<div class="pt-btnrow">' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.restart\')">Restart</button>' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.stop\')">Stop</button>' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.logs\')">Logs</button>' +
      '</div>' +
      '<div class="pt-group-label">Build / bake</div>' +
      buildKv +
      '<button class="pt-btn primary block" onclick="PROTO_PICKER.toast(\'cmd.docker.build\')">Build image</button>' +
      '<div class="pt-group-label">Publish chain</div>' +
      '<div class="pt-chain">' + chainSteps + '</div>' +
      '<div class="pt-btnrow">' +
        '<button class="pt-btn primary" onclick="PROTO_PICKER.toast(\'cmd.docker.push\')">Push</button>' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.template_commit\')">Template</button>' +
      '</div>' +
      '<div class="pt-group-label">Compose · ' + d.compose.length + '</div>' +
      '<div class="pt-spine">' + composeSpine + '</div>' +
      '<div class="pt-group-label">Images · ' + d.images.length + '</div>' +
      '<div class="pt-spine">' + imagesSpine + '</div>' +
      '<div class="pt-group-label">Registries · ' + d.registries.length + '</div>' +
      '<div class="pt-spine">' + regSpine + '</div>' +
      '</div>';
  }

  /* ===================================================== TESTS (sessions spine) === */
  function renderTests() {
    var t = D.tests;

    var sessionsSpine = t.sessions.map(function (s) {
      return '<div class="pt-entry">' +
        '<span class="pt-node ok"></span>' +
        '<div class="pt-card clickable" onclick="PROTO_PICKER.toast(\'cmd.test.open_session → ' + h(s.id) + '\')">' +
          '<div class="pt-line"><span class="pt-title mono">' + h(s.suite) + '</span>' +
            '<span class="pt-chip ok">' + h(s.status) + '</span></div>' +
          '<div class="pt-sub">' + s.cases + ' cases · ' + h(s.dur) + '</div>' +
        '</div></div>';
    }).join('');

    var lastRunSpine = '<div class="pt-spine">' +
      '<div class="pt-entry"><span class="pt-node ok"></span>' +
        '<div class="pt-card"><div class="pt-line"><span class="pt-title mono">' + h(t.lastRun.command) + '</span>' +
          '<span class="pt-chip ok">' + h(t.lastRun.result) + '</span></div>' +
        '<div class="pt-sub">' + h(t.lastRun.when) + '</div>' +
        '<div class="pt-sub">' + h(t.lastRun.history) + '</div></div></div>' +
      '</div>';

    var policySpine = '<div class="pt-spine">' +
      '<div class="pt-entry"><span class="pt-node accent"></span>' +
        '<div class="pt-card"><div class="pt-line"><span class="pt-title">visibility</span>' +
          '<span class="pt-chip accent">' + h(t.policy) + '</span></div>' +
        '<div class="pt-sub wrap">' + h(t.policyNote) + '</div></div></div>' +
      '</div>';

    return '<div class="pt-root">' +
      '<div class="pt-head">' +
        '<div class="pt-head-row"><span class="pt-head-label">Last run</span>' +
          '<span class="pt-head-meta">' + h(t.lastRun.result) + '</span></div>' +
        '<div class="pt-foot">' + h(t.lastRun.when) + '</div>' +
      '</div>' +
      '<button class="pt-btn primary block" onclick="PROTO_PICKER.toast(\'cmd.test.run\')">Run tests</button>' +
      '<div class="pt-group-label">Sessions · ' + t.sessions.length + '</div>' +
      '<div class="pt-spine">' + sessionsSpine + '</div>' +
      '<div class="pt-group-label">Last run detail</div>' +
      lastRunSpine +
      '<div class="pt-btnrow">' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'cmd.test.rerun\')">Rerun</button>' +
        '<button class="pt-btn" onclick="PROTO_PICKER.toast(\'panels.show → run_debug\')">Debug</button>' +
      '</div>' +
      '<div class="pt-group-label">Policy</div>' +
      policySpine +
      '</div>';
  }

  /* ===================================================== AGENTS (activity spine) === */
  function renderAgents() {
    var a = D.agents;

    var spine = a.active.map(function (ag) {
      var nodeCls = statusNode(ag.status);
      var chipCls = statusChipClass(ag.status);
      return '<div class="pt-entry">' +
        '<span class="pt-node ' + nodeCls + '"></span>' +
        '<div class="pt-card clickable" onclick="PROTO_PICKER.toast(\'cmd.agent.focus → ' + h(ag.name) + '\')">' +
          '<div class="pt-line"><span class="pt-title">' + h(ag.name) + '</span>' +
            '<span class="pt-chip ' + chipCls + '">' + h(ag.status) + '</span></div>' +
          '<div class="pt-sub">' + h(ag.meta) + '</div>' +
        '</div></div>';
    }).join('');

    return '<div class="pt-root">' +
      '<div class="pt-head">' +
        '<div class="pt-head-row"><span class="pt-head-label">Activity</span>' +
          '<span class="pt-head-meta">' + a.active.length + ' subagents</span></div>' +
      '</div>' +
      '<div class="pt-spine">' + spine + '</div>' +
      '<button class="pt-btn block" onclick="PROTO_PICKER.toast(\'panels.open_chat\')">Open Chat</button>' +
      '<div class="pt-foot">' + h(a.note) + '</div>' +
      '</div>';
  }

  /* ===================================================== ARTIFACTS (evidence spine) === */
  function renderArtifacts() {
    var a = D.artifacts;

    var filterPills = '<div class="pt-pills">' +
      a.filters.map(function (f) {
        var sel = f === a.defaultFilter ? ' active' : '';
        return '<button class="pt-pill' + sel + '" onclick="PROTO_PICKER.toast(\'artifacts.filter → ' + f + '\')">' +
          f.charAt(0).toUpperCase() + f.slice(1) + '</button>';
      }).join('') + '</div>';

    var rowsSpine = a.rows.map(function (r) {
      var chipCls = statusChipClass(r.status);
      return '<div class="pt-entry">' +
        '<span class="pt-node ' + (chipCls === 'ok' ? 'ok' : 'accent') + '"></span>' +
        '<div class="pt-card clickable" onclick="PROTO_PICKER.toast(\'open ' + h(r.type) + ' → ' + h(r.label) + '\')">' +
          '<div class="pt-line"><span class="pt-chip accent">' + h(r.type) + '</span>' +
            '<span class="pt-chip ' + chipCls + '">' + h(r.status) + '</span></div>' +
          '<div class="pt-sub">' + h(r.label) + '</div>' +
          '<div class="pt-sub">' + h(r.prev) + '</div>' +
          '<div class="pt-meta mono">' + h(r.meta) + '</div>' +
        '</div></div>';
    }).join('');

    // investigation as a stage spine of role-steps
    var bundleChips = a.investigation.chips.map(function (c) {
      return '<span class="pt-chip ' + (c.ok ? 'ok' : 'muted') + '">' + h(c.label) + '</span>';
    }).join('');
    var stepsSpine = a.investigation.steps.map(function (s, i) {
      return '<div class="pt-entry">' +
        '<span class="pt-node accent"></span>' +
        '<div class="pt-card clickable" onclick="PROTO_PICKER.toast(\'open ' + h(s.role) + ' → ' + h(s.type) + '\')">' +
          '<div class="pt-line"><span class="pt-title">' + h(s.role) + '</span>' +
            '<span class="pt-chip accent">' + h(s.type) + '</span></div>' +
          '<div class="pt-sub">' + h(s.label) + '</div>' +
        '</div></div>';
    }).join('');

    return '<div class="pt-root">' +
      filterPills +
      '<div class="pt-head-row"><span class="pt-head-label">Evidence stream</span>' +
        '<span class="pt-head-meta">' + a.rows.length + ' rows</span></div>' +
      '<div class="pt-spine">' + rowsSpine + '</div>' +
      '<div class="pt-group-label">Investigation</div>' +
      '<div class="pt-bundle">' +
        '<div class="pt-bundle-id">' + h(a.investigation.id) + '</div>' +
        '<div class="pt-sub">' + h(a.investigation.title) + '</div>' +
        '<div class="pt-bundle-chips">' + bundleChips + '</div>' +
        '<div class="pt-spine">' + stepsSpine + '</div>' +
        '<button class="pt-btn block" onclick="PROTO_PICKER.toast(\'page.go → orchestrator:evidence\')">Open in Orchestrator</button>' +
      '</div>' +
      '<div class="pt-foot">Rows are compact receipts — payloads load on demand.</div>' +
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
  window.PROTO_DESIGNS.D = {
    id: 'D',
    name: 'Vertical Timeline',
    render: function (panel) {
      var fn = renderers[panel];
      return fn ? fn() : '<div class="pt-root"><div class="pt-foot">No renderer for ' + panel + '</div></div>';
    }
  };
})();
