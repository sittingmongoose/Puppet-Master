/* =====================================================================
   DESIGN B — SEGMENTED SUB-NAV — renderer for all 7 panels.
   Registers window.PROTO_DESIGNS.B. Each render(panelId) returns HTML
   whose signature element is a single-line pill segmented control: pick
   a sub-view, only that sub-view renders below. Eliminates accordion
   stacking — segments are peers, never parents of each other.

   Uses the .pb-* component vocabulary from design.css.
   ===================================================================== */
(function () {
  'use strict';
  var D = window.PROTO_DATA.getData();

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  // search hit bodies ship pre-emphasized HTML (<em>) in the data — trust it.
  function trust(s) { return s; }

  /* ---------------------------------------------------------------------
     SEGMENTED CONTROL — the signature element.
     segments = [{ id, full, short, icon? }]
     activeId = the segment shown first
     viewHtml = { id: html }  (each rendered independently below)
     The first segment in the row is active by default; pbSelectSeg swaps.
     --------------------------------------------------------------------- */
  function segmented(uid, segments, activeId, viewHtml) {
    var btns = segments.map(function (seg) {
      var active = seg.id === activeId ? ' active' : '';
      var iconHtml = seg.icon
        ? '<svg class="pb-seg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">' + seg.icon + '</svg>'
        : '';
      return '<button type="button" class="pb-seg-btn' + active + '" data-seg="' + seg.id + '"' +
        ' onclick="pbSelectSeg(this,\'' + uid + '\')" title="' + esc(seg.full) + '">' +
        iconHtml +
        '<span class="pb-seg-full">' + esc(seg.full) + '</span>' +
        '<span class="pb-seg-short">' + esc(seg.short) + '</span>' +
        '</button>';
    }).join('');

    var views = segments.map(function (seg) {
      var style = seg.id === activeId ? '' : ' style="display:none"';
      return '<div class="pb-seg-view" id="pbview-' + uid + '-' + seg.id + '"' + style + '>' +
        (viewHtml[seg.id] || '<div class="pb-empty">Nothing here yet.</div>') +
        '</div>';
    }).join('');

    return '<div class="pb-seg" data-seg-group="' + uid + '">' + btns + '</div>' +
      '<div class="pb-seg-views">' + views + '</div>';
  }

  /* ---- window helper: switch active segment + view ---- */
  window.pbSelectSeg = function (btn, uid) {
    var group = btn.closest('.pb-seg');
    if (group) {
      group.querySelectorAll('.pb-seg-btn').forEach(function (b) { b.classList.remove('active'); });
    }
    btn.classList.add('active');
    var segId = btn.getAttribute('data-seg');
    document.querySelectorAll('.pb-seg-view[id^="pbview-' + uid + '-"]').forEach(function (v) {
      v.style.display = 'none';
    });
    var target = document.getElementById('pbview-' + uid + '-' + segId);
    if (target) target.style.display = '';
  };

  /* ---- window helper: toggle a flag pill active state ---- */
  window.pbToggleFlag = function (btn, cmd) {
    btn.classList.toggle('active');
    PROTO_PICKER.toast(cmd + ' → ' + (btn.classList.contains('active') ? 'on' : 'off'));
  };

  /* ---- sprout menu (replaces native <select>) ---- */
  function sproutMenu(uid, options, selected, action, triggerClass, triggerIcon, labelExtra) {
    // options: [{ value, label, meta?, current? }]
    var items = options.map(function (o) {
      var sel = o.value === selected ? ' is-selected' : '';
      var meta = o.meta ? '<span class="pm6-mi-meta">' + esc(o.meta) + '</span>' : '';
      return '<button type="button" class="pm6-tb-menu-item' + sel + '" role="menuitem"' +
        ' data-value="' + esc(o.value) + '"' +
        ' data-on-select="protoSelectGeneric">' +
        '<svg class="pm6-mi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<span class="pm6-mi-label">' + esc(o.label) + '</span>' + meta +
        '</button>';
    }).join('');
    var trigClass = 'pm6-tb-menu-trigger ' + (triggerClass || 'pb-trigger');
    return '<div class="pm6-tb-menu-wrap" data-select="single"' +
      ' data-label-target="pbLabel-' + uid + '"' +
      ' data-action="' + esc(action) + '"' +
      ' style="display:flex;flex-direction:column;gap:var(--xs)">' +
      '<button type="button" class="' + trigClass + '" aria-haspopup="menu" aria-expanded="false">' +
      (triggerIcon || '') +
      '<span class="pb-trigger-label" id="pbLabel-' + uid + '">' + esc(selected) + '</span>' +
      '<span class="pm6-tb-chev" style="font-size:8px;opacity:.6">&#9662;</span>' +
      '</button>' +
      (labelExtra || '') +
      '<div class="pm6-tb-menu sprout-left" role="menu">' + items + '</div>' +
      '</div>';
  }

  /* small inline icons reused in segments */
  var ICO = {
    search:  '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    replace: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    index:   '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    diff:    '<path d="M12 3v18M3 8h4V4M3 8l4-4M21 16h-4v4M21 16l-4 4"/>',
    tree:    '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h6a3 3 0 0 1 3 3v6"/>',
    history: '<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l3 3"/>',
    branch:  '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M6 9v6"/><path d="M18 9a3 3 0 1 0 0-6"/>',
    play:    '<polygon points="6 4 20 12 6 20 6 4"/>',
    bolt:    '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    link:    '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    box:     '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    layers:  '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    build:   '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5z"/>',
    upload:  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    server:  '<rect x="2" y="3" width="20" height="6" rx="2"/><rect x="2" y="15" width="20" height="6" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    check:   '<circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.8 2.8L16.4 9"/>',
    clipboard:'<path d="M9 2h6a1 1 0 0 1 1 1v1H8V3a1 1 0 0 1 1-1z"/><rect x="4" y="4" width="16" height="18" rx="2"/>',
    policy:  '<path d="M12 2L3 6v6c0 5 3.8 9.4 9 11 5.2-1.6 9-6 9-11V6l-9-4z"/>',
    robot:   '<rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/>',
    grid:    '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    globe:   '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
    film:    '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="3" x2="7" y2="21"/><line x1="17" y1="3" x2="17" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>'
  };

  /* =================================================================
     PANEL: SEARCH  → [Find] [Replace] [Index]
     ================================================================= */
  function renderSearch() {
    var s = D.search;

    /* ---- Find view ---- */
    var hits = '';
    s.results.files.forEach(function (f) {
      hits += '<div class="pb-row" onclick="PROTO_PICKER.toast(\'files.open → ' + esc(f.path) + '\')">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);flex-shrink:0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
        '<span class="pb-row-main pb-mono">' + esc(f.path) + '</span>' +
        '<span class="pb-chip muted">' + f.count + '</span></div>';
      f.hits.forEach(function (hit) {
        hits += '<div class="pb-hit" onclick="PROTO_PICKER.toast(\'files.open → ' + esc(f.path) + ':' + hit.ln + '\')">' +
          '<span class="pb-ln">' + hit.ln + '</span>' +
          '<span class="pb-hit-code">' + trust(hit.html) + '</span></div>';
      });
    });
    var scopeOptions = s.scopes.map(function (sc) {
      return { value: sc, label: sc, meta: sc === s.defaultScope ? 'default' : null };
    });
    var findView =
      '<div class="pb-row" style="cursor:default;padding:0">' +
      '<input class="pb-input" placeholder="Search in files…" value="' + esc(s.query) + '">' +
      '</div>' +
      sproutMenu('searchScope', scopeOptions, s.defaultScope, 'cmd.search.set_scope', 'pb-trigger') +
      '<div class="pb-summary"><span>Results</span><span class="pb-count">' + s.results.total + ' in ' + s.results.fileCount + ' files</span></div>' +
      '<div class="pb-list">' + hits + '</div>' +
      '<div class="pb-btnrow">' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.search.previous_result\')">Prev</button>' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.search.next_result\')">Next</button>' +
      '</div>';

    /* ---- Replace view ---- */
    var replaceView =
      '<input class="pb-input" placeholder="Find…" value="' + esc(s.query) + '">' +
      '<input class="pb-input" placeholder="Replace with…" value="amount">' +
      '<div class="pb-pills">' +
      '<button class="pb-pill" onclick="pbToggleFlag(this,\'cmd.search.flag.regex\')">.* <span style="opacity:.6">Regex</span></button>' +
      '<button class="pb-pill" onclick="pbToggleFlag(this,\'cmd.search.flag.case\')">Aa <span style="opacity:.6">Case</span></button>' +
      '<button class="pb-pill" onclick="pbToggleFlag(this,\'cmd.search.flag.word\')">\\b <span style="opacity:.6">Word</span></button>' +
      '</div>' +
      '<button class="pb-btn primary block" onclick="PROTO_PICKER.toast(\'cmd.search.replace_all → 7 across 3 files\')">Replace all (7 in 3 files)</button>';

    /* ---- Index view ---- */
    var indexView =
      '<div class="pb-kv"><span class="pb-kv-k">Engine</span><span class="pb-kv-v mono">' + esc(s.index.engine) + '</span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">Docs</span><span class="pb-kv-v">' + s.index.docs.toLocaleString() + '</span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">State</span><span class="pb-kv-v"><span class="pb-chip ok">' + esc(s.index.state) + '</span></span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">Last</span><span class="pb-kv-v">' + esc(s.index.lastIndexed) + '</span></div>' +
      '<button class="pb-btn primary block" onclick="PROTO_PICKER.toast(\'cmd.search.reindex → tantivy rebuild queued (' + s.index.docs + ' docs)\')">Rebuild index</button>';

    return '<div class="pb-root">' + segmented('search', [
      { id: 'find', full: 'Find', short: 'F', icon: ICO.search },
      { id: 'replace', full: 'Replace', short: 'R', icon: ICO.replace },
      { id: 'index', full: 'Index', short: 'I', icon: ICO.index }
    ], 'find', { find: findView, replace: replaceView, index: indexView }) + '</div>';
  }

  /* =================================================================
     PANEL: SOURCE  → [Changes] [Worktrees] [History] [Branches]
     ================================================================= */
  function renderSource() {
    var s = D.source;

    var branchOptions = s.branches.map(function (b) {
      return { value: b, label: b, meta: b === s.branch ? 'current' : null };
    });
    var branchMenuHtml =
      '<div style="display:flex;align-items:center;gap:var(--sm)">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);flex-shrink:0">' + ICO.branch + '</svg>' +
      '<span style="font-size:var(--fs-2xs);text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);font-weight:700">Branch</span>' +
      '</div>' +
      sproutMenu('srcBranch', branchOptions, s.branch, 'cmd.git.switch_branch', 'pb-trigger');

    function fileRow(f, staged) {
      return '<div class="pb-row">' +
        '<span class="pb-gs ' + f.status + '">' + f.status + '</span>' +
        '<span class="pb-row-main pb-mono" onclick="PROTO_PICKER.toast(\'cmd.git.open_diff → ' + esc(f.path) + ' (' + esc(f.note) + ')\')">' + esc(f.path) + '</span>' +
        (staged
          ? '<button class="pb-minibtn" title="Unstage" onclick="PROTO_PICKER.toast(\'cmd.git.unstage → ' + esc(f.path) + '\')">−</button>'
          : '<button class="pb-minibtn" title="Stage" onclick="PROTO_PICKER.toast(\'cmd.git.stage → ' + esc(f.path) + '\')">+</button>') +
        '<button class="pb-minibtn danger" title="Discard" onclick="PROTO_PICKER.toast(\'cmd.git.discard → ' + esc(f.path) + '\')">×</button>' +
        '</div>';
    }
    var stagedHtml = s.changes.staged.map(function (f) { return fileRow(f, true); }).join('');
    var unstagedHtml = s.changes.unstaged.map(function (f) { return fileRow(f, false); }).join('');

    var changesView =
      '<div class="pb-summary"><span>Staged</span><span class="pb-count">' + s.changes.staged.length + '</span></div>' +
      (stagedHtml ? '<div class="pb-list">' + stagedHtml + '</div>' : '<div class="pb-empty">Nothing staged.</div>') +
      '<div class="pb-summary"><span>Unstaged</span><span class="pb-count">' + s.changes.unstaged.length + '</span></div>' +
      (unstagedHtml ? '<div class="pb-list">' + unstagedHtml + '</div>' : '<div class="pb-empty">Working tree clean.</div>') +
      '<input class="pb-input" placeholder="Commit message…">' +
      '<div class="pb-btnrow">' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.git.commit_ai → drafting message\')">AI</button>' +
      '<button class="pb-btn primary" onclick="PROTO_PICKER.toast(\'cmd.git.commit → 3 files committed\')">Commit</button>' +
      '</div>' +
      '<div class="pb-btnrow">' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.git.pull\')">Pull</button>' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.git.push → ' + s.commit.outgoing + ' pushed\')">Push</button>' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.git.fetch\')">Fetch</button>' +
      '</div>' +
      '<div class="pb-foot">' + s.commit.incoming + ' incoming · ' + s.commit.outgoing + ' outgoing</div>';

    var wtRows = s.worktrees.map(function (w) {
      var dotCls = w.status === 'clean' ? 'ok' : 'warn';
      return '<div class="pb-row" onclick="PROTO_PICKER.toast(\'cmd.git.worktree.switch → ' + esc(w.branch) + '\')">' +
        '<span class="pb-dot ' + dotCls + '"></span>' +
        '<span class="pb-row-main pb-stack">' +
        '<span class="pb-mono">' + esc(w.branch) + '</span>' +
        '<span class="pb-row-sub">' + esc(w.owner) + '</span>' +
        '</span>' +
        '</div>';
    }).join('');
    var worktreesView = (wtRows ? '<div class="pb-list">' + wtRows + '</div>' : '<div class="pb-empty">No worktrees.</div>') +
      '<button class="pb-btn block" onclick="PROTO_PICKER.toast(\'cmd.git.worktree.new\')">+ New worktree</button>';

    var histRows = s.history.map(function (c) {
      return '<div class="pb-row" onclick="PROTO_PICKER.toast(\'cmd.git.show_commit → ' + c.sha + '\')">' +
        '<span class="pb-mono" style="color:var(--accent-primary);flex-shrink:0">' + c.sha + '</span>' +
        '<span class="pb-row-main">' + esc(c.msg) + '</span>' +
        '<span class="pb-row-meta">' + c.when + '</span></div>';
    }).join('');
    var historyView = (histRows ? '<div class="pb-list">' + histRows + '</div>' : '<div class="pb-empty">No history.</div>');

    var branchesView =
      '<div class="pb-list">' + s.branches.map(function (b) {
        var dot = b === s.branch ? 'ok' : 'idle';
        return '<div class="pb-row" onclick="PROTO_PICKER.toast(\'cmd.git.switch_branch → ' + esc(b) + '\')">' +
          '<span class="pb-dot ' + dot + '"></span>' +
          '<span class="pb-row-main pb-mono">' + esc(b) + '</span>' +
          (b === s.branch ? '<span class="pb-chip ok">head</span>' : '') +
          '</div>';
      }).join('') + '</div>' +
      (s.stash.length ? '<div class="pb-summary"><span>Stash</span><span class="pb-count">' + s.stash.length + '</span></div>' +
        '<div class="pb-list">' + s.stash.map(function (st) {
          return '<div class="pb-row" onclick="PROTO_PICKER.toast(\'cmd.git.stash.pop → ' + esc(st.name) + '\')">' +
            '<span class="pb-row-main pb-stack"><span class="pb-mono">' + esc(st.name) + '</span>' +
            '<span class="pb-row-sub">' + esc(st.label) + ' · ' + st.files + ' files</span></span></div>';
        }).join('') + '</div>' : '<div class="pb-empty">No stashes.</div>');

    return '<div class="pb-root">' +
      branchMenuHtml +
      segmented('source', [
        { id: 'changes', full: 'Changes', short: 'Chg', icon: ICO.diff },
        { id: 'worktrees', full: 'Worktrees', short: 'Wt', icon: ICO.tree },
        { id: 'history', full: 'History', short: 'Hist', icon: ICO.history },
        { id: 'branches', full: 'Branches', short: 'Br', icon: ICO.branch }
      ], 'changes', { changes: changesView, worktrees: worktreesView, history: historyView, branches: branchesView }) +
      '</div>';
  }

  /* =================================================================
     PANEL: ACTIONS  → [Current] [Workflows] [Connection]
     ================================================================= */
  function renderActions() {
    var a = D.actions;

    var runsHtml = a.runs.map(function (r) {
      var dotClass = r.status === 'success' ? 'ok' : 'fail';
      var chipClass = r.status === 'success' ? 'ok' : 'err';
      var row = '<div class="pb-row" onclick="PROTO_PICKER.toast(\'cmd.github.actions.open_run → ' + r.id + '\')">' +
        '<span class="pb-dot ' + dotClass + '"></span>' +
        '<span class="pb-row-main pb-stack">' +
        '<span>' + esc(r.name) + '</span>' +
        '<span class="pb-row-sub">' + esc(r.meta) + '</span>' +
        '</span>' +
        '<span class="pb-chip ' + chipClass + '">' + r.status + '</span></div>';
      if (r.triage) {
        row += '<div class="pb-log">' +
          '<div>Failing: <b>' + esc(r.triage.job) + '</b> / ' + esc(r.triage.step) + '</div>' +
          '<div>Changed: <b>' + esc(r.triage.changed) + '</b></div>' +
          r.triage.log.map(function (l, i) { return '<div class="' + (i === 0 ? 'pb-log-fail' : '') + '">' + esc(l) + '</div>'; }).join('') +
          '<div style="margin-top:var(--xs);color:var(--text-muted)">Next: ' + esc(r.triage.next) + '</div>' +
          '</div>';
        row += '<div class="pb-btnrow">' +
          '<button class="pb-btn primary" onclick="PROTO_PICKER.toast(\'cmd.github.actions.rerun → ' + r.id + '\')">Rerun</button>' +
          '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.github.actions.compare_last_success\')">Compare green</button></div>';
      }
      return row;
    }).join('');
    var currentView =
      '<div class="pb-summary"><span>Branch ' + esc(a.branch) + '</span><span class="pb-count">' + esc(a.readiness) + '</span></div>' +
      (runsHtml ? '<div class="pb-list">' + runsHtml + '</div>' : '<div class="pb-empty">No recent runs.</div>') +
      '<div class="pb-foot">Snapshot: ' + esc(a.snapshot) + '</div>';

    var wfBody = a.workflows.map(function (w) {
      return '<div class="pb-row">' +
        '<span class="pb-row-main">' + esc(w.name) + '</span>' +
        '<button class="pb-minibtn" title="Blocked: ' + w.reason + '" onclick="PROTO_PICKER.toast(\'Blocked: ' + w.reason + ' — reconnect with workflow scope\')">Dispatch</button>' +
        '</div>';
    }).join('');
    var workflowsView =
      (wfBody ? '<div class="pb-list">' + wfBody + '</div>' : '<div class="pb-empty">No workflows.</div>') +
      '<div class="pb-summary"><span>Secrets</span><span class="pb-count">' + a.secrets.length + '</span></div>' +
      '<div class="pb-list">' + a.secrets.map(function (sec) {
        return '<div class="pb-row" onclick="PROTO_PICKER.toast(\'cmd.github.secret.view → ' + esc(sec) + '\')">' +
          '<span class="pb-row-main pb-mono">' + esc(sec) + '</span><span class="pb-chip muted">set</span></div>';
      }).join('') + '</div>';

    var connView =
      '<div class="pb-kv"><span class="pb-kv-k">Account</span><span class="pb-kv-v">' + esc(a.connection.account) + '</span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">State</span><span class="pb-kv-v"><span class="pb-chip ok">' + esc(a.connection.state) + '</span></span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">Scopes</span><span class="pb-kv-v">' + a.connection.scopes.join(', ') + '</span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">Missing</span><span class="pb-kv-v"><span class="pb-chip warn">' + a.connection.missing.join(', ') + '</span></span></div>' +
      '<button class="pb-btn primary block" onclick="PROTO_PICKER.toast(\'cmd.github.reconnect → device flow\')">Reconnect</button>';

    return '<div class="pb-root">' + segmented('actions', [
      { id: 'current', full: 'Current', short: 'Cur', icon: ICO.play },
      { id: 'workflows', full: 'Workflows', short: 'Wf', icon: ICO.bolt },
      { id: 'connection', full: 'Connection', short: 'Conn', icon: ICO.link }
    ], 'current', { current: currentView, workflows: workflowsView, connection: connView }) + '</div>';
  }

  /* =================================================================
     PANEL: DOCKER  → [Containers] [Images] [Compose] [Build] [Publish] [Registries]
     (6 segments — the worst case for narrow widths; collapses to short codes)
     ================================================================= */
  function renderDocker() {
    var d = D.docker;

    function statusDot(st) { return st === 'running' ? 'ok' : (st === 'restarting' ? 'run' : (st === 'idle' ? 'idle' : 'fail')); }
    function statusChip(st) {
      if (st === 'running') return '<span class="pb-chip ok">running</span>';
      if (st === 'restarting') return '<span class="pb-chip warn">restart</span>';
      if (st === 'idle') return '<span class="pb-chip muted">idle</span>';
      return '<span class="pb-chip muted">exited</span>';
    }

    var containersHtml = d.containers.map(function (c) {
      return '<div class="pb-row">' +
        '<span class="pb-dot ' + statusDot(c.status) + '"></span>' +
        '<span class="pb-row-main pb-stack">' +
        '<span>' + esc(c.name) + '</span>' +
        '<span class="pb-row-sub">' + esc(c.image) + '</span>' +
        '</span>' +
        statusChip(c.status) +
        '</div>';
    }).join('');
    var containersView =
      '<div class="pb-row" style="cursor:default"><span class="pb-dot ok"></span>' +
      '<span class="pb-row-main">Context <span class="pb-mono">' + esc(d.runtime.context) + '</span></span>' +
      '<span class="pb-chip ok">' + esc(d.runtime.state) + '</span></div>' +
      '<div class="pb-list">' + containersHtml + '</div>' +
      '<div class="pb-btnrow">' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.restart\')">Restart</button>' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.stop\')">Stop</button>' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.logs\')">Logs</button>' +
      '</div>';

    var imagesView =
      (d.images.length ? '<div class="pb-list">' + d.images.map(function (im) {
        return '<div class="pb-row" onclick="PROTO_PICKER.toast(\'cmd.docker.image.inspect → ' + esc(im.name) + '\')">' +
          '<span class="pb-row-main pb-mono">' + esc(im.name) + '</span>' +
          '<span class="pb-row-meta">' + im.size + '</span></div>';
      }).join('') + '</div>' : '<div class="pb-empty">No images.</div>');

    var composeView =
      (d.compose.length ? '<div class="pb-list">' + d.compose.map(function (c) {
        return '<div class="pb-row">' +
          '<span class="pb-dot ' + statusDot(c.status) + '"></span>' +
          '<span class="pb-row-main pb-stack"><span class="pb-mono">' + esc(c.svc) + '</span><span class="pb-row-sub">' + esc(c.image) + '</span></span>' +
          statusChip(c.status) + '</div>';
      }).join('') + '</div>' : '<div class="pb-empty">No compose services.</div>') +
      (d.scenarios.length ? '<div class="pb-summary"><span>Scenarios</span></div>' +
        '<div class="pb-list">' + d.scenarios.map(function (sc) {
          return '<div class="pb-row" onclick="PROTO_PICKER.toast(\'cmd.docker.scenario.up → ' + esc(sc.name) + '\')">' +
            '<span class="pb-dot ' + (sc.stale ? 'idle' : 'ok') + '"></span>' +
            '<span class="pb-row-main">' + esc(sc.name) + '</span>' +
            (sc.stale ? '<span class="pb-chip muted">stale</span>' : '') +
            '</div>';
        }).join('') + '</div>' : '');

    var buildView =
      '<div class="pb-kv"><span class="pb-kv-k">Target</span><span class="pb-kv-v mono">' + esc(d.build.target) + '</span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">Tag</span><span class="pb-kv-v mono">' + esc(d.build.tag) + '</span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">Digest</span><span class="pb-kv-v mono">' + esc(d.build.digest) + '</span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">Arch</span><span class="pb-kv-v">' + esc(d.build.arch) + '</span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">Buildx</span><span class="pb-kv-v"><span class="pb-chip ' + (d.build.buildx ? 'ok' : 'muted') + '">' + (d.build.buildx ? 'on' : 'off') + '</span></span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">Bake</span><span class="pb-kv-v"><span class="pb-chip ' + (d.build.bake ? 'ok' : 'muted') + '">' + (d.build.bake ? 'on' : 'off') + '</span></span></div>' +
      '<button class="pb-btn primary block" onclick="PROTO_PICKER.toast(\'cmd.docker.build\')">Build image</button>';

    var chainSteps = d.publish.map(function (p) {
      var done = p.state === 'exists' || p.state === 'ready_to_push';
      var cls = done ? 'done' : '';
      var chipCls = done ? 'ok' : 'muted';
      return '<div class="pb-chain-step ' + cls + '"><span class="pb-chain-num">' + p.stage + '</span>' +
        '<span style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(p.label) + '</span>' +
        '<span class="pb-chip ' + chipCls + '">' + esc(p.state) + '</span></div>';
    }).join('');
    var publishView =
      '<div class="pb-chain">' + chainSteps + '</div>' +
      '<div class="pb-btnrow">' +
      '<button class="pb-btn primary" onclick="PROTO_PICKER.toast(\'cmd.docker.push\')">Push</button>' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'cmd.docker.template_commit\')">Template</button>' +
      '</div>';

    var registriesView =
      (d.registries.length ? '<div class="pb-list">' + d.registries.map(function (r) {
        var st = r.state === 'authenticated' || r.state === 'reachable' ? 'ok' : 'warn';
        return '<div class="pb-row">' +
          '<span class="pb-row-main pb-stack"><span class="pb-mono">' + esc(r.name) + '</span><span class="pb-row-sub">' + esc(r.account) + '</span></span>' +
          '<span class="pb-chip ' + st + '">' + esc(r.state) + '</span></div>';
      }).join('') + '</div>' : '<div class="pb-empty">No registries.</div>');

    return '<div class="pb-root">' + segmented('docker', [
      { id: 'containers', full: 'Containers', short: 'Cnt', icon: ICO.box },
      { id: 'images', full: 'Images', short: 'Img', icon: ICO.layers },
      { id: 'compose', full: 'Compose', short: 'Cmp', icon: ICO.server },
      { id: 'build', full: 'Build', short: 'Bld', icon: ICO.build },
      { id: 'publish', full: 'Publish', short: 'Pub', icon: ICO.upload },
      { id: 'registries', full: 'Registries', short: 'Reg', icon: ICO.server }
    ], 'containers', {
      containers: containersView,
      images: imagesView,
      compose: composeView,
      build: buildView,
      publish: publishView,
      registries: registriesView
    }) + '</div>';
  }

  /* =================================================================
     PANEL: TESTS  → [Last run] [Sessions] [Policy]
     ================================================================= */
  function renderTests() {
    var t = D.tests;

    var lastView =
      '<div class="pb-kv"><span class="pb-kv-k">' + esc(t.lastRun.command) + '</span><span class="pb-kv-v"><span class="pb-chip ok">' + esc(t.lastRun.result) + '</span></span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">When</span><span class="pb-kv-v">' + esc(t.lastRun.when) + '</span></div>' +
      '<div class="pb-kv"><span class="pb-kv-k">History</span><span class="pb-kv-v">' + esc(t.lastRun.history) + '</span></div>' +
      '<div class="pb-btnrow">' +
      '<button class="pb-btn primary" onclick="PROTO_PICKER.toast(\'cmd.test.run\')">Run tests</button>' +
      '<button class="pb-btn" onclick="PROTO_PICKER.toast(\'panels.show → run_debug\')">Debug</button>' +
      '</div>';

    var sessionsView = (t.sessions.length ? '<div class="pb-list">' + t.sessions.map(function (s) {
      return '<div class="pb-row">' +
        '<span class="pb-dot ok"></span>' +
        '<span class="pb-row-main pb-mono">' + esc(s.suite) + '</span>' +
        '<span class="pb-row-meta">' + s.cases + ' · ' + s.dur + '</span>' +
        '<span class="pb-chip ok">' + esc(s.status) + '</span>' +
        '</div>';
    }).join('') + '</div>' : '<div class="pb-empty">No sessions.</div>');

    var policyView =
      '<div class="pb-kv"><span class="pb-kv-k">Visibility</span><span class="pb-kv-v"><span class="pb-chip ok">' + esc(t.policy) + '</span></span></div>' +
      '<div class="pb-foot">' + esc(t.policyNote) + '</div>';

    return '<div class="pb-root">' + segmented('tests', [
      { id: 'last', full: 'Last run', short: 'Last', icon: ICO.check },
      { id: 'sessions', full: 'Sessions', short: 'Sess', icon: ICO.clipboard },
      { id: 'policy', full: 'Policy', short: 'Pol', icon: ICO.policy }
    ], 'last', { last: lastView, sessions: sessionsView, policy: policyView }) + '</div>';
  }

  /* =================================================================
     PANEL: AGENTS  → [Active] [Done]
     ================================================================= */
  function renderAgents() {
    var a = D.agents;
    var active = a.active.filter(function (ag) { return ag.status === 'running' || ag.status === 'waiting'; });
    var done = a.active.filter(function (ag) { return ag.status === 'done'; });

    function rowsFor(list) {
      if (!list.length) return '<div class="pb-empty">None.</div>';
      return '<div class="pb-list">' + list.map(function (ag) {
        var dot = ag.status === 'running' ? 'run' : (ag.status === 'done' ? 'ok' : 'idle');
        var chip = ag.status === 'running' ? 'warn' : (ag.status === 'done' ? 'ok' : 'muted');
        return '<div class="pb-row">' +
          '<span class="pb-dot ' + dot + '"></span>' +
          '<span class="pb-row-main pb-stack">' +
          '<span>' + esc(ag.name) + '</span>' +
          '<span class="pb-row-sub">' + esc(ag.meta) + '</span>' +
          '</span>' +
          '<span class="pb-chip ' + chip + '">' + esc(ag.status) + '</span>' +
          '</div>';
      }).join('') + '</div>';
    }

    var activeView =
      '<div class="pb-summary"><span>Active</span><span class="pb-count">' + active.length + '</span></div>' +
      rowsFor(active);
    var doneView =
      '<div class="pb-summary"><span>Completed</span><span class="pb-count">' + done.length + '</span></div>' +
      rowsFor(done);

    return '<div class="pb-root">' + segmented('agents', [
      { id: 'active', full: 'Active', short: 'Act', icon: ICO.robot },
      { id: 'done', full: 'Done', short: 'Done', icon: ICO.check }
    ], 'active', { active: activeView, done: doneView }) +
      '<button class="pb-btn block" onclick="PROTO_PICKER.toast(\'panels.open_chat\')">Open Chat</button>' +
      '<div class="pb-foot">' + esc(a.note) + '</div>' +
      '</div>';
  }

  /* =================================================================
     PANEL: ARTIFACTS  → [All] [Web] [Browser] [Evidence]
     (segments map to the filters — selecting a segment filters the list)
     ================================================================= */
  function renderArtifacts() {
    var a = D.artifacts;

    // group rows by family; "all" shows everything
    var byFam = { all: a.rows, web: [], browser: [], evidence: [] };
    a.rows.forEach(function (r) { if (byFam[r.family]) byFam[r.family].push(r); });

    function rowsFor(list) {
      if (!list.length) return '<div class="pb-empty">No artifacts in this view.</div>';
      return '<div class="pb-list">' + list.map(function (r) {
        var chipCls = r.status === 'success' || r.status === 'completed' || r.status === 'pass on retry' ? 'ok' : 'muted';
        return '<div class="pb-row" onclick="PROTO_PICKER.toast(\'open ' + esc(r.type) + ' → ' + esc(r.label) + '\')">' +
          '<span class="pb-chip fam">' + esc(r.type) + '</span>' +
          '<span class="pb-row-main pb-stack">' +
          '<span>' + esc(r.label) + '</span>' +
          '<span class="pb-row-sub">' + esc(r.prev) + '</span>' +
          '</span>' +
          '<span class="pb-chip ' + chipCls + '">' + esc(r.status) + '</span>' +
          '</div>';
      }).join('') + '</div>';
    }

    var views = {
      all: rowsFor(byFam.all),
      web: rowsFor(byFam.web),
      browser: rowsOfBrowser(byFam.browser),
      evidence: rowsFor(byFam.evidence)
    };

    // bundle/investigation appears under "all" only, after the rows
    var bundleChips = a.investigation.chips.map(function (c) {
      return '<span class="pb-chip ' + (c.ok ? 'ok' : 'muted') + '">' + esc(c.label) + '</span>';
    }).join('');
    var bundleSteps = a.investigation.steps.map(function (s) {
      return '<div class="pb-row" onclick="PROTO_PICKER.toast(\'open ' + esc(s.role) + ' → ' + esc(s.type) + '\')">' +
        '<span class="pb-chip fam" style="min-width:64px;justify-content:center">' + esc(s.role) + '</span>' +
        '<span class="pb-row-main">' + esc(s.type) + ' · ' + esc(s.label) + '</span>' +
        '</div>';
    }).join('');
    var bundle =
      '<div class="pb-bundle">' +
      '<div class="pb-mono" style="color:var(--accent-primary)">' + esc(a.investigation.id) + '</div>' +
      '<div style="font-size:var(--fs-xs);color:var(--text-primary);font-weight:600">' + esc(a.investigation.title) + '</div>' +
      '<div class="pb-bundle-chips">' + bundleChips + '</div>' +
      '<div class="pb-list">' + bundleSteps + '</div>' +
      '<button class="pb-btn block" onclick="PROTO_PICKER.toast(\'page.go → orchestrator:evidence\')">Open in Orchestrator</button>' +
      '</div>';
    views.all = views.all + bundle;

    return '<div class="pb-root">' + segmented('artifacts', [
      { id: 'all', full: 'All', short: 'All', icon: ICO.grid },
      { id: 'web', full: 'Web', short: 'Web', icon: ICO.globe },
      { id: 'browser', full: 'Browser', short: 'Brws', icon: ICO.film },
      { id: 'evidence', full: 'Evidence', short: 'Evid', icon: ICO.check }
    ], 'all', views) +
      '<div class="pb-foot">Compact receipts — payloads load on demand.</div>' +
      '</div>';
  }
  // browser rows share rendering with the generic list but kept distinct
  // so the segment selector can later differentiate.
  function rowsOfBrowser(list) {
    if (!list.length) return '<div class="pb-empty">No browser artifacts.</div>';
    return '<div class="pb-list">' + list.map(function (r) {
      var chipCls = r.status === 'completed' ? 'ok' : 'muted';
      return '<div class="pb-row" onclick="PROTO_PICKER.toast(\'open ' + esc(r.type) + ' → ' + esc(r.label) + '\')">' +
        '<span class="pb-chip fam">' + esc(r.type) + '</span>' +
        '<span class="pb-row-main pb-stack">' +
        '<span>' + esc(r.label) + '</span>' +
        '<span class="pb-row-sub">' + esc(r.prev) + '</span>' +
        '</span>' +
        '<span class="pb-chip ' + chipCls + '">' + esc(r.status) + '</span>' +
        '</div>';
    }).join('') + '</div>';
  }

  /* =================================================================
     NARROW-MODE WATCHER — toggles .pb-is-narrow on the panel host
     when width drops below 240px so segments collapse to short codes.
     Listens to proto:resize emitted by proto-picker.
     ================================================================= */
  function wireNarrow() {
    function apply() {
      var slot = document.getElementById('sidePanelSlot');
      var host = document.getElementById('panelHost');
      if (!slot || !host) return;
      var w = slot.getBoundingClientRect().width;
      host.classList.toggle('pb-is-narrow', w < 240);
    }
    document.addEventListener('proto:resize', apply);
    // also catch initial mount + theme changes that may reflow
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(apply, 0);
    } else {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(apply, 0); });
    }
    // re-measure when switching TO design B (panelHost content replaced)
    var origRender = (window.PROTO_PICKER && window.PROTO_PICKER.render) || function () {};
    // do not override — proto:resize + the brief's re-render path is enough;
    // but also poll once right after each render via a MutationObserver fallback.
    var mo = new MutationObserver(function () { apply(); });
    var host0 = document.getElementById('panelHost');
    if (host0) mo.observe(host0, { childList: true });
  }
  wireNarrow();

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
  window.PROTO_DESIGNS.B = {
    id: 'B',
    name: 'Segmented Sub-nav',
    render: function (panel) {
      var fn = renderers[panel];
      return fn ? fn() : '<div class="pb-root"><div class="pb-foot">No renderer for ' + esc(panel) + '</div></div>';
    }
  };
})();
