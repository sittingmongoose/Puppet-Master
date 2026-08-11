/* =====================================================================
   DESIGN C — COMMAND-RAIL — renderer for all 7 panels.
   Registers window.PROTO_DESIGNS.C.

   Philosophy: every row is a strict TWO-COLUMN layout:
     [ 26px fixed gutter ] [ flex-1 text column (label + right meta) ]
   The gutter carries a status dot or a per-row action glyph; the text
   column carries the label + a right-aligned meta value. Header at top =
   title + a single full-width primary input. Footer at bottom = full-width
   action buttons. Sprout menus (not native <select>) wherever a dropdown
   is needed. SVG icons only. No emojis.
   ===================================================================== */
(function () {
  'use strict';

  var D = window.PROTO_DATA.getData();

  // escape text for safe insertion (we never trust data into HTML verbatim)
  function h(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  // search hit bodies are pre-emphasized HTML in the data; trust them as-is
  function trust(s) { return s; }

  // toast quoted message safely
  function toast(msg) {
    return "PROTO_PICKER.toast(" + JSON.stringify(String(msg)) + ")";
  }

  /* ------------------------------------------------------------------
     SVG icon library — tiny inline glyphs, stroke=currentColor.
     ------------------------------------------------------------------ */
  var SVG = {
    file:   '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    branch: '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="9" r="3"/><path d="M18 12v0a3 3 0 0 1-3 3H9"/><path d="M6 9v6"/></svg>',
    check:  '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    diff:   '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 12h6M15 12h6M6 9l-3 3 3 3M18 9l3 3-3 3"/></svg>',
    box:    '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    camera: '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    globe:  '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    film:   '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="1"/><line x1="7" y1="3" x2="7" y2="21"/><line x1="17" y1="3" x2="17" y2="21"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/></svg>',
    warn:   '<svg class="pc-warn-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    code:   '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    list:   '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    search: '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    filter: '<svg class="pc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    chevR:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:10px;height:10px"><polyline points="9 18 15 12 9 6"/></svg>'
  };

  /* ------------------------------------------------------------------
     PM sprout menu builders (replacing every native <select>).
     IMPORTANT: the trigger button MUST carry class `pm6-tb-menu-trigger`
     because proto-sprout.js looks that class up inside the wrap.
     ------------------------------------------------------------------ */

  // pill-style trigger for inline use (search scope, docker view)
  function sproutPill(selected, options, uniqId, action) {
    var items = options.map(function (o) {
      var sel = o === selected ? ' is-selected' : '';
      return '<button type="button" class="pm6-tb-menu-item' + sel + '" data-value="' + h(o) + '">' +
        '<svg class="pm6-mi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<span class="pm6-mi-label">' + h(o) + '</span></button>';
    }).join('');
    return '<div class="pm6-tb-menu-wrap" data-select="single" data-label-target="' + uniqId + '"' +
      (action ? ' data-action="' + h(action) + '"' : '') + '>' +
      '<button type="button" class="pc-pill pm6-tb-menu-trigger" aria-haspopup="menu" aria-expanded="false">' +
      '<span id="' + uniqId + '">' + h(selected) + '</span>' +
      '<span class="pm6-tb-chev">&#9662;</span></button>' +
      '<div class="pm6-tb-menu sprout-left" role="menu">' + items + '</div></div>';
  }

  // full-width block trigger for primary pickers (branch, docker context)
  function sproutBlock(icoSvg, selected, options, uniqId, action, suffix) {
    var items = options.map(function (o) {
      var sel = o === selected ? ' is-selected' : '';
      var meta = o === selected ? '<span class="pm6-mi-meta">current</span>' : '';
      return '<button type="button" class="pm6-tb-menu-item' + sel + '" data-value="' + h(o) + '">' +
        '<svg class="pm6-mi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
        '<span class="pm6-mi-label">' + h(o) + '</span>' + meta + '</button>';
    }).join('');
    return '<div class="pm6-tb-menu-wrap" data-select="single" data-label-target="' + uniqId + '"' +
      (action ? ' data-action="' + h(action) + '"' : '') + '>' +
      '<button type="button" class="pc-block-trigger pm6-tb-menu-trigger" aria-haspopup="menu" aria-expanded="false">' +
      '<span class="pc-trig-ico">' + icoSvg + '</span>' +
      '<span id="' + uniqId + '" class="pc-trig-label">' + h(selected) + '</span>' +
      (suffix || '') +
      '<span class="pm6-tb-chev">&#9662;</span></button>' +
      '<div class="pm6-tb-menu sprout-left" role="menu">' + items + '</div></div>';
  }

  /* ------------------------------------------------------------------
     ROW BUILDER — the canonical two-column command-rail row.
     gutterHtml → content of the 26px gutter (dot/glyph/badge/ln chip)
     label      → text column label
     metaHtml   → optional right-aligned meta (string or HTML)
     opts       → { cls, labelCls, metaCls, onclick, title }
     ------------------------------------------------------------------ */
  function row(gutterHtml, label, metaHtml, opts) {
    opts = opts || {};
    var cls = 'pc-row' + (opts.cls ? ' ' + opts.cls : '');
    var onclick = opts.onclick ? ' onclick="' + opts.onclick + '"' : '';
    var title = opts.title ? ' title="' + h(opts.title) + '"' : '';
    var labelCls = 'pc-label' + (opts.labelCls ? ' ' + opts.labelCls : '');
    var meta = metaHtml ? '<span class="pc-meta' + (opts.metaCls ? ' ' + opts.metaCls : '') + '">' + metaHtml + '</span>' : '';
    return '<div class="' + cls + '"' + onclick + title + '>' +
      '<div class="pc-gutter">' + (gutterHtml || '') + '</div>' +
      '<div class="pc-text">' +
        '<span class="' + labelCls + '">' + label + '</span>' +
        meta +
      '</div>' +
    '</div>';
  }

  // a status dot for the gutter, mapping well-known states → colors
  function dotClass(state) {
    var s = String(state || '').toLowerCase();
    if (['ok','success','pass','done','running-healthy','passing','passed','connected','authenticated','reachable','running','detected','exists','completed'].indexOf(s) >= 0) return 'ok';
    if (['running','in-progress','restarting','restart','queued','ready_to_push','waiting','pending'].indexOf(s) >= 0) return s === 'restarting' || s === 'restart' || s === 'running' || s === 'in-progress' ? 'run' : 'idle';
    if (['failed','err','error','failed_run','exited','not_configured','dirty','stale'].indexOf(s) >= 0) return s === 'exited' || s === 'not_configured' || s === 'stale' ? 'idle' : 'fail';
    if (s === 'idle' || s === 'waiting') return 'idle';
    return 'idle';
  }

  function dot(state) { return '<span class="pc-dot ' + dotClass(state) + '"></span>'; }

  /* =====================================================================
     SEARCH
     gutter = file icon for file rows, line-number chip for hit rows
     header = full-width search input (primary action)
     ===================================================================== */
  function renderSearch() {
    var s = D.search;

    // file rows + nested hit rows (gutter = ln chip)
    var rows = '';
    s.results.files.forEach(function (f) {
      rows += row(SVG.file, h(f.path),
        '<span class="pc-chip muted">' + f.count + '</span>',
        { labelCls: 'mono', onclick: toast('files.open → ' + f.path) });
      f.hits.forEach(function (hit) {
        rows += '<div class="pc-hit" ' + dataAttr(toast('files.open → ' + f.path + ':' + hit.ln)) + '>' +
          '<div class="pc-gutter"><span class="pc-ln">' + hit.ln + '</span></div>' +
          '<div class="pc-text"><span class="pc-hit-code">' + trust(hit.html) + '</span></div>' +
        '</div>';
      });
    });

    // header: full-width input row + inline flags + scope sprout
    var flags = '<div class="pc-pills">' +
      togglePill('.*', 'Regex') +
      togglePill('Aa', 'Case') +
      togglePill('\\b', 'Word') +
      '<span style="flex:1 1 auto;min-width:0"></span>' +
      sproutPill(s.defaultScope, s.scopes, 'pcScopeLbl', 'cmd.search.set_scope') +
      '</div>';

    // index status rows (gutter = a tiny info glyph)
    var idxRows =
      row('<span class="pc-dot ok"></span>', 'Index ready', h(s.index.engine), { metaCls: 'mono' }) +
      row(SVG.list, 'Documents', s.index.docs.toLocaleString(), { onclick: toast('cmd.search.reindex → queued'), title: 'Rebuild index' }) +
      row(SVG.check, 'Last indexed', h(s.index.lastIndexed), { metaCls: 'dim' });

    return '<div class="pc-root">' +
      '<div class="pc-header">' +
        '<div class="pc-header-title">' +
          '<span class="pc-h-label">Find in files</span>' +
          '<span class="pc-h-meta">' + s.results.total + ' / ' + s.results.fileCount + 'f</span>' +
        '</div>' +
        '<div class="pc-input-row">' +
          '<input class="pc-input" placeholder="Search in files…" value="' + h(s.query) + '">' +
          '<button class="pc-mini" title="Replace" ' + dataAttr(toast('cmd.search.toggle_replace')) + '>' + SVG.warn + '</button>' +
        '</div>' +
        flags +
      '</div>' +
      '<div class="pc-list">' + rows + '</div>' +
      '<div class="pc-section"><span>Index status</span>' +
        '<button class="pc-mini" ' + dataAttr(toast('cmd.search.reindex → tantivy rebuild queued (' + s.index.docs + ' docs)')) + '>Rebuild</button></div>' +
      '<div class="pc-list">' + idxRows + '</div>' +
      '<div class="pc-footer">' +
        '<button class="pc-btn" ' + dataAttr(toast('cmd.search.previous_result')) + '>&#9650; Prev</button>' +
        '<button class="pc-btn" ' + dataAttr(toast('cmd.search.next_result')) + '>&#9660; Next</button>' +
        '<button class="pc-btn" ' + dataAttr(toast('cmd.search.replace_all → 7 across 3 files')) + '>Replace</button>' +
      '</div>' +
    '</div>';
  }

  // tiny helper: render an onclick= string safely
  function dataAttr(onclickStr) {
    // onclickStr already starts with "onclick=" … actually we pass the value; rebuild safely
    return onclickStr;
  }

  // a toggle flag pill with a leading glyph + label
  function togglePill(glyph, label) {
    return '<button class="pc-pill" onclick="this.classList.toggle(\'active\')">' +
      '<span style="font-family:var(--mono-font)">' + glyph + '</span>' +
      '<span style="opacity:.7">' + label + '</span></button>';
  }

  /* =====================================================================
     SOURCE
     gutter = git-status letter badge (M/A) for changes, branch-dot for
     worktrees, commit-dot for history, stash glyph for stash
     header = branch picker (full-width sprout) + commit message input
     ===================================================================== */
  function renderSource() {
    var s = D.source;

    function changeRow(f) {
      var g = '<span class="pc-gs ' + f.status + '">' + f.status + '</span>';
      var meta = '<button class="pc-mini" title="Stage/unstage" ' +
        onclickAttr('cmd.git.stage → ' + f.path) + '>+</button>' +
        '<button class="pc-mini danger" title="Discard" ' +
        onclickAttr('cmd.git.discard → ' + f.path) + '>×</button>';
      return row(g, h(f.path), meta, {
        labelCls: 'mono',
        onclick: onclickAttrValue('cmd.git.open_diff → ' + f.path + ' (' + f.note + ')'),
        title: f.note
      });
    }

    var staged = s.changes.staged.map(changeRow).join('');
    var unstaged = s.changes.unstaged.map(changeRow).join('');

    // worktree rows: gutter = worktree dot (clean=ok, dirty=warn)
    var wtRows = s.worktrees.map(function (w) {
      var dotC = w.status === 'clean' ? 'ok' : 'warn';
      return row('<span class="pc-wt-dot ' + dotC + '"></span>',
        h(w.branch),
        '<span class="pc-meta">' + h(w.owner.replace(/^Orch: /, ' Orch · ').replace(/^Thread: /, ' Thread · ').replace(/^Manual$/, ' manual')) + '</span>',
        { labelCls: 'mono', onclick: onclickAttrValue('cmd.git.worktree.switch → ' + w.branch), title: w.path + ' · ' + w.base });
    }).join('');

    // history rows: gutter = commit dot; text = msg; meta = sha + when
    var histRows = s.history.map(function (c) {
      return row('<span class="pc-commit-dot"></span>',
        h(c.msg),
        '<span class="pc-meta mono" style="color:var(--accent-primary)">' + c.sha + '</span>',
        { onclick: onclickAttrValue('cmd.git.show_commit → ' + c.sha), title: c.when });
    }).join('');

    // stash rows
    var stashRows = s.stash.map(function (st) {
      return row(SVG.box, h(st.label),
        '<span class="pc-meta">' + st.files + 'f</span>',
        { labelCls: 'mono', onclick: onclickAttrValue('cmd.git.stash.apply → ' + st.name) });
    }).join('');

    // branch picker = full-width sprout (primary header action)
    var branchPicker = sproutBlock(SVG.branch, s.branch, s.branches, 'pcBranchLbl', 'cmd.git.switch_branch',
      '<span class="pc-chip ok" style="margin-left:auto">' + s.commit.outgoing + '↑</span>');

    // commit input + actions (header secondary)
    var commitRow = '<div class="pc-input-row" style="margin-top:var(--xs)">' +
      '<input class="pc-input mono" placeholder="Commit message…" />' +
      '<button class="pc-mini" title="AI message" ' + dataAttr(onclickAttr('cmd.git.commit_ai → drafting message')) + '>AI</button>' +
      '</div>';

    return '<div class="pc-root">' +
      '<div class="pc-header">' +
        '<div class="pc-header-title">' +
          '<span class="pc-h-label">Source control</span>' +
          '<span class="pc-h-meta">' + s.commit.incoming + '↓ ' + s.commit.outgoing + '↑</span>' +
        '</div>' +
        branchPicker +
        commitRow +
      '</div>' +

      '<div class="pc-section"><span>Staged</span><span class="pc-sec-count">' + s.changes.staged.length + '</span></div>' +
      '<div class="pc-list">' + (staged || emptyRow('Nothing staged')) + '</div>' +

      '<div class="pc-section"><span>Unstaged</span><span class="pc-sec-count">' + s.changes.unstaged.length + '</span></div>' +
      '<div class="pc-list">' + (unstaged || emptyRow('Working tree clean')) + '</div>' +

      '<div class="pc-section"><span>Worktrees</span><span class="pc-sec-count">' + s.worktrees.length + '</span></div>' +
      '<div class="pc-list">' + wtRows + '</div>' +

      '<div class="pc-section"><span>Recent</span><span class="pc-sec-count">' + s.history.length + '</span></div>' +
      '<div class="pc-list">' + histRows + '</div>' +

      (stashRows ? '<div class="pc-section"><span>Stash</span><span class="pc-sec-count">' + s.stash.length + '</span></div>' +
        '<div class="pc-list">' + stashRows + '</div>' : '') +

      '<div class="pc-footer">' +
        '<button class="pc-btn primary" ' + dataAttr(onclickAttr('cmd.git.commit → 3 files committed')) + '>Commit</button>' +
        '<button class="pc-btn" ' + dataAttr(onclickAttr('cmd.git.pull')) + '>Pull</button>' +
        '<button class="pc-btn" ' + dataAttr(onclickAttr('cmd.git.push → ' + s.commit.outgoing + ' pushed')) + '>Push</button>' +
      '</div>' +
    '</div>';
  }

  // a muted empty-state row
  function emptyRow(text) {
    return row('<span class="pc-dot idle"></span>', h(text), '', { cls: 'muted' });
  }

  // build an onclick attribute safely (returns the full `onclick="..."`)
  function onclickAttr(msg) {
    return 'onclick="' + toast(msg).replace(/"/g, '&quot;') + '"';
  }
  // the raw value used when row() builds its own onclick (no `onclick=` prefix)
  function onclickAttrValue(msg) {
    return toast(msg).replace(/"/g, '&quot;');
  }

  /* =====================================================================
     ACTIONS (GitHub Actions)
     gutter = run status dot (ok/fail); failed rows get a warning glyph
     header = readiness title + a "Re-run failed" primary button (full width)
     ===================================================================== */
  function renderActions() {
    var a = D.actions;

    var runsHtml = a.runs.map(function (r) {
      var isFail = r.status === 'failed';
      var g = '<span class="pc-dot ' + (isFail ? 'fail' : 'ok') + '"></span>';
      var meta = '<span class="pc-chip ' + (isFail ? 'err' : 'ok') + '">' + h(r.status) + '</span>';
      var r0 = row(g, h(r.name), meta, {
        onclick: onclickAttrValue('cmd.github.actions.open_run → ' + r.id),
        title: r.meta
      });

      if (r.triage) {
        r0 += '<div class="pc-triage">' +
          '<div class="pc-triage-head">Failed: <b>' + h(r.triage.job) + '</b> / ' + h(r.triage.step) + '</div>' +
          r.triage.log.map(function (l, i) {
            return '<div class="pc-triage-line' + (i === 0 ? ' fail' : '') + '">' + h(l) + '</div>';
          }).join('') +
          '<div class="pc-triage-next">' + h(r.triage.next) + '</div>' +
          '</div>';
        // inline rerun row (still two columns)
        r0 += row(SVG.warn,
          'Rerun after parser fix',
          '<button class="pc-mini" ' + dataAttr(onclickAttr('cmd.github.actions.rerun → ' + r.id)) + '>Rerun</button>',
          { onclick: onclickAttrValue('cmd.github.actions.compare_last_success') });
      }
      return r0;
    }).join('');

    // connection rows
    var connRows =
      row(dot(a.connection.state), 'Account',
        '<span class="pc-meta mono">' + h(a.connection.account) + '</span>',
        { onclick: onclickAttrValue('cmd.github.reconnect → device flow') }) +
      row(dot('ok'), 'Scopes',
        '<span class="pc-meta">' + h(a.connection.scopes.join(' ')) + '</span>') +
      row(dot('not_configured'), 'Missing',
        '<span class="pc-chip warn">' + h(a.connection.missing.join(',')) + '</span>');

    // workflow rows (blocked → warning glyph in gutter)
    var wfRows = a.workflows.map(function (w) {
      return row(SVG.warn,
        h(w.name),
        '<button class="pc-mini" title="Blocked: ' + h(w.reason) + '" ' +
          dataAttr(onclickAttr('Blocked: ' + w.reason + ' — reconnect with workflow scope')) + '>Dispatch</button>');
    }).join('');

    return '<div class="pc-root">' +
      '<div class="pc-header">' +
        '<div class="pc-header-title">' +
          '<span class="pc-h-label">Actions · ' + h(a.branch) + '</span>' +
          '<span class="pc-h-meta">' + h(a.readiness.split(' ').slice(0,3).join(' ')) + '</span>' +
        '</div>' +
        '<button class="pc-btn primary block" ' + dataAttr(onclickAttr('cmd.github.actions.rerun_failed → wf-310')) + '>Re-run failed</button>' +
      '</div>' +

      '<div class="pc-section"><span>Recent runs</span><span class="pc-sec-count">' + a.runs.length + '</span></div>' +
      '<div class="pc-list">' + runsHtml + '</div>' +

      '<div class="pc-section"><span>Connection</span></div>' +
      '<div class="pc-list">' + connRows + '</div>' +

      '<div class="pc-section"><span>Workflows</span><span class="pc-sec-count">' + a.workflows.length + '</span></div>' +
      '<div class="pc-list">' + wfRows + '</div>' +

      '<div class="pc-footer">' +
        '<button class="pc-btn" ' + dataAttr(onclickAttr('cmd.github.reconnect → device flow')) + '>Reconnect</button>' +
        '<button class="pc-btn" ' + dataAttr(onclickAttr('cmd.github.actions.history')) + '>History</button>' +
      '</div>' +
    '</div>';
  }

  /* =====================================================================
     DOCKER
     gutter = container status dot; right meta = port
     header = context picker (full-width sprout) + view pills
     ===================================================================== */
  function renderDocker() {
    var d = D.docker;

    // view pills + the default view as a sprout (per the brief — no <select>)
    var viewPills = '<div class="pc-pills">' +
      d.views.slice(0, 3).map(function (v) {
        var sel = v === d.defaultView ? ' active' : '';
        return '<button class="pc-pill' + sel + '" ' + dataAttr(onclickAttr('docker.view → ' + v)) + '>' +
          h(v.charAt(0).toUpperCase() + v.slice(1)) + '</button>';
      }).join('') +
      sproutPill('More', d.views.slice(3), 'pcDockerMoreView', 'docker.view') +
      '</div>';

    // container rows: gutter = status dot; meta = port
    var contRows = d.containers.map(function (c) {
      var dotC = c.status === 'running' ? 'ok' : (c.status === 'restarting' ? 'run' : 'idle');
      var meta = '<span class="pc-meta mono">' + h(c.ports) + '</span>';
      return row('<span class="pc-dot ' + dotC + '"></span>',
        h(c.name),
        meta,
        { onclick: onclickAttrValue('cmd.docker.inspect → ' + c.name), title: c.image + ' · ' + c.uptime });
    }).join('');

    // image rows: gutter = box icon; meta = size
    var imgRows = d.images.map(function (im) {
      return row(SVG.box, h(im.name), '<span class="pc-meta">' + h(im.size) + '</span>',
        { labelCls: 'mono' });
    }).join('');

    // publish chain: gutter = stage number
    var chainSteps = d.publish.map(function (p) {
      var cls = p.state === 'exists' ? 'done' : (p.state === 'ready_to_push' ? 'ready' : '');
      return '<div class="pc-chain-step ' + cls + '">' +
        '<span class="pc-chain-num">' + p.stage + '</span>' +
        '<span class="pc-chain-label">' + h(p.label) + '</span>' +
        '<span class="pc-chip ' + (cls === 'done' ? 'ok' : (cls === 'ready' ? 'fam' : 'muted')) + '">' + h(p.state) + '</span>' +
      '</div>';
    }).join('');

    // build KV rows (gutter = small glyph)
    var buildRows =
      kvRow('Target', d.build.target, true) +
      kvRow('Tag', d.build.tag, true) +
      kvRow('Digest', d.build.digest, true) +
      kvRow('Arch', d.build.arch, false) +
      kvRow('Buildx', d.build.buildx ? 'on' : 'off', false);

    // registry rows: gutter = dot
    var regRows = d.registries.map(function (r) {
      return row(dot(r.state), h(r.name),
        '<span class="pc-chip ' + (r.state === 'not_configured' ? 'muted' : 'ok') + '">' + h(r.state) + '</span>',
        { onclick: onclickAttrValue('cmd.docker.registry.open → ' + r.name), title: 'account: ' + r.account });
    }).join('');

    return '<div class="pc-root">' +
      '<div class="pc-header">' +
        '<div class="pc-header-title">' +
          '<span class="pc-h-label">Docker</span>' +
          '<span class="pc-h-meta">' + h(d.runtime.state) + '</span>' +
        '</div>' +
        sproutBlock(SVG.box, d.runtime.context, ['default', 'desktop-linux', 'colima'], 'pcDockerCtx', 'cmd.docker.set_context') +
        viewPills +
      '</div>' +

      '<div class="pc-section"><span>Containers</span><span class="pc-sec-count">' + d.containers.length + '</span></div>' +
      '<div class="pc-list">' + contRows + '</div>' +

      '<div class="pc-section"><span>Images</span><span class="pc-sec-count">' + d.images.length + '</span></div>' +
      '<div class="pc-list">' + imgRows + '</div>' +

      '<div class="pc-section"><span>Build · ' + h(d.build.target) + '</span></div>' +
      '<div class="pc-list">' + buildRows + '</div>' +

      '<div class="pc-section"><span>Publish chain</span></div>' +
      '<div class="pc-chain">' + chainSteps + '</div>' +

      '<div class="pc-section"><span>Registries</span><span class="pc-sec-count">' + d.registries.length + '</span></div>' +
      '<div class="pc-list">' + regRows + '</div>' +

      '<div class="pc-footer">' +
        '<button class="pc-btn primary" ' + dataAttr(onclickAttr('cmd.docker.build')) + '>Build</button>' +
        '<button class="pc-btn" ' + dataAttr(onclickAttr('cmd.docker.push')) + '>Push</button>' +
        '<button class="pc-btn" ' + dataAttr(onclickAttr('cmd.docker.restart')) + '>Restart</button>' +
      '</div>' +
    '</div>';
  }

  // a KV row that still honors the 26px gutter (gutter = small dot placeholder)
  function kvRow(key, value, mono) {
    return '<div class="pc-kv">' +
      '<div class="pc-gutter"><span class="pc-dot idle" style="width:5px;height:5px"></span></div>' +
      '<span class="pc-kv-k">' + h(key) + '</span>' +
      '<span class="pc-kv-spacer"></span>' +
      '<span class="pc-kv-v' + (mono ? ' mono' : '') + '">' + h(value) + '</span>' +
    '</div>';
  }

  /* =====================================================================
     TESTS
     gutter = pass dot; right meta = case count + duration
     header = last-run result + full-width Run button
     ===================================================================== */
  function renderTests() {
    var t = D.tests;

    var sessRows = t.sessions.map(function (s) {
      return row(dot('pass'),
        h(s.suite),
        '<span class="pc-meta mono">' + s.cases + ' · ' + h(s.dur) + '</span>',
        { labelCls: 'mono', onclick: onclickAttrValue('cmd.test.open_session → ' + s.id) });
    }).join('');

    var lastRows =
      kvRow('Command', t.lastRun.command, true) +
      kvRow('Result', t.lastRun.result, false) +
      kvRow('When', t.lastRun.when, false) +
      kvRow('History', t.lastRun.history, false);

    var policyRows =
      kvRow('Visibility', t.policy, false);

    return '<div class="pc-root">' +
      '<div class="pc-header">' +
        '<div class="pc-header-title">' +
          '<span class="pc-h-label">Tests</span>' +
          '<span class="pc-h-meta">' + h(t.lastRun.result.split(' ')[0]) + ' ok</span>' +
        '</div>' +
        '<button class="pc-btn primary block" ' + dataAttr(onclickAttr('cmd.test.run')) + '>Run cargo test</button>' +
      '</div>' +

      '<div class="pc-section"><span>Sessions</span><span class="pc-sec-count">' + t.sessions.length + '</span></div>' +
      '<div class="pc-list">' + sessRows + '</div>' +

      '<div class="pc-section"><span>Last run</span></div>' +
      '<div class="pc-list">' + lastRows + '</div>' +

      '<div class="pc-section"><span>Policy</span></div>' +
      '<div class="pc-list">' + policyRows + '</div>' +
      '<div class="pc-foot">' + h(t.policyNote) + '</div>' +

      '<div class="pc-footer">' +
        '<button class="pc-btn" ' + dataAttr(onclickAttr('cmd.test.run')) + '>Run</button>' +
        '<button class="pc-btn" ' + dataAttr(onclickAttr('panels.show → run_debug')) + '>Debug</button>' +
        '<button class="pc-btn" ' + dataAttr(onclickAttr('cmd.test.coverage')) + '>Coverage</button>' +
      '</div>' +
    '</div>';
  }

  /* =====================================================================
     AGENTS
     gutter = status dot (run/ok/idle); right meta = status chip
     header = active count + full-width "Open Chat" button
     ===================================================================== */
  function renderAgents() {
    var a = D.agents;

    function statusMeta(st) {
      if (st === 'running') return '<span class="pc-chip warn">run</span>';
      if (st === 'done') return '<span class="pc-chip ok">done</span>';
      return '<span class="pc-chip muted">idle</span>';
    }

    var rows = a.active.map(function (ag) {
      var dc = ag.status === 'running' ? 'run' : (ag.status === 'done' ? 'ok' : 'idle');
      // two-line text: name + meta on a wrapped second line
      var label = h(ag.name) +
        '<br><span class="pc-meta" style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500">' + h(ag.meta) + '</span>';
      return row('<span class="pc-dot ' + dc + '"></span>', label, statusMeta(ag.status),
        { cls: 'stack', onclick: onclickAttrValue('panels.open_chat → ' + ag.name) });
    }).join('');

    return '<div class="pc-root">' +
      '<div class="pc-header">' +
        '<div class="pc-header-title">' +
          '<span class="pc-h-label">Agents</span>' +
          '<span class="pc-h-meta">' + a.active.length + ' active</span>' +
        '</div>' +
        '<button class="pc-btn primary block" ' + dataAttr(onclickAttr('panels.open_chat')) + '>Open Chat</button>' +
      '</div>' +

      '<div class="pc-section"><span>Active subagents</span></div>' +
      '<div class="pc-list">' + rows + '</div>' +

      '<div class="pc-foot">' + h(a.note) + '</div>' +
    '</div>';
  }

  /* =====================================================================
     ARTIFACTS
     gutter = artifact-type icon (diff/checkbox/camera/globe/film)
     header = filter pills + default filter
     ===================================================================== */
  function renderArtifacts() {
    var a = D.artifacts;

    var typeIcon = {
      code_diff: SVG.diff,
      validation_test: SVG.check,
      screenshot: SVG.camera,
      api_web_call: SVG.globe,
      browser_recording: SVG.film,
      tool_llm_trace: SVG.code
    };

    function statusChip(st) {
      var okStates = ['success', 'completed', 'pass on retry', 'pass'];
      if (okStates.indexOf(st) >= 0) return '<span class="pc-chip ok">' + h(st) + '</span>';
      return '<span class="pc-chip muted">' + h(st) + '</span>';
    }

    var rows = a.rows.map(function (r) {
      var ico = typeIcon[r.type] || SVG.box;
      return row(ico, h(r.label), statusChip(r.status),
        { onclick: onclickAttrValue('open ' + r.type + ' → ' + r.label), title: r.prev });
    }).join('');

    // investigation bundle
    var chipsHtml = a.investigation.chips.map(function (c) {
      return '<span class="pc-chip ' + (c.ok ? 'ok' : 'muted') + '">' + h(c.label) + '</span>';
    }).join('');

    var stepRows = a.investigation.steps.map(function (s) {
      var ico = typeIcon[s.type] || SVG.box;
      return row(ico,
        '<span style="color:var(--text-muted);font-weight:700">' + h(s.role) + '</span> · ' + h(s.label),
        '',
        { onclick: onclickAttrValue('open ' + s.role + ' → ' + s.type) });
    }).join('');

    // filter pills (first 3 inline, rest via sprout)
    var filterPills = '<div class="pc-pills">' +
      a.filters.slice(0, 3).map(function (f) {
        var sel = f === a.defaultFilter ? ' active' : '';
        return '<button class="pc-pill' + sel + '" ' + dataAttr(onclickAttr('artifacts.filter → ' + f)) + '>' +
          h(f.charAt(0).toUpperCase() + f.slice(1)) + '</button>';
      }).join('') +
      '</div>';

    return '<div class="pc-root">' +
      '<div class="pc-header">' +
        '<div class="pc-header-title">' +
          '<span class="pc-h-label">Artifacts</span>' +
          '<span class="pc-h-meta">' + a.rows.length + ' rows</span>' +
        '</div>' +
        filterPills +
      '</div>' +

      '<div class="pc-section"><span>Recent</span><span class="pc-sec-count">' + a.rows.length + '</span></div>' +
      '<div class="pc-list">' + rows + '</div>' +

      '<div class="pc-section"><span>Investigation</span>' +
        '<span class="pc-sec-count mono" style="color:var(--accent-primary)">' + h(a.investigation.id) + '</span></div>' +
      '<div class="pc-bundle">' +
        '<div class="pc-bundle-title">' + h(a.investigation.title) + '</div>' +
        '<div class="pc-bundle-chips">' + chipsHtml + '</div>' +
        '<div class="pc-list">' + stepRows + '</div>' +
      '</div>' +

      '<div class="pc-footer">' +
        '<button class="pc-btn primary" ' + dataAttr(onclickAttr('page.go → orchestrator:evidence')) + '>Open bundle</button>' +
        '<button class="pc-btn" ' + dataAttr(onclickAttr('artifacts.export')) + '>Export</button>' +
      '</div>' +
      '<div class="pc-foot">Rows are compact receipts — payloads load on demand.</div>' +
    '</div>';
  }

  /* ---- registry ---- */
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
  window.PROTO_DESIGNS.C = {
    id: 'C',
    name: 'Command-Rail',
    render: function (panel) {
      var fn = renderers[panel];
      if (!fn) return '<div class="pc-root"><div class="pc-foot">No renderer for ' + h(panel) + '</div></div>';
      try {
        return fn();
      } catch (e) {
        return '<div class="pc-root"><div class="pc-foot">Error: ' + h(e.message || e) + '</div></div>';
      }
    }
  };
})();
