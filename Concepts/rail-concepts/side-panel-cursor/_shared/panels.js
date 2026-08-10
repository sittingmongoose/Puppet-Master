/* Panel HTML builders for 6 layout languages. Feature-complete demo chrome. */
(function (global) {
  var I = function (n, s) { return SPIcons.svg(n, s); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sprout(id, label, items, cmd) {
    var opts = items.map(function (it, i) {
      var v = typeof it === 'string' ? it : it.value;
      var lab = typeof it === 'string' ? it : it.label;
      var meta = typeof it === 'object' && it.meta ? '<span class="meta">' + esc(it.meta) + '</span>' : '';
      return '<button type="button" class="sp-sprout-item" role="option" data-value="' + esc(v) + '" data-label="' + esc(lab) + '" aria-checked="' + (i === 0 ? 'true' : 'false') + '">' + esc(lab) + meta + '</button>';
    }).join('');
    return (
      '<button type="button" class="sp-sprout-trigger" data-sprout-menu="' + id + '" data-cmd="' + esc(cmd || 'select') + '" data-value="' + esc(typeof items[0] === 'string' ? items[0] : items[0].value) + '">' +
        '<span class="sp-sprout-label">' + esc(label) + '</span>' +
        '<span class="sp-sprout-chev">' + I('chev', 10) + '</span>' +
      '</button>' +
      '<div id="' + id + '" class="sp-sprout-menu" aria-hidden="true">' + opts + '</div>'
    );
  }

  function chip(text, kind) {
    return '<span class="sp-chip' + (kind ? ' ' + kind : '') + '">' + esc(text) + '</span>';
  }

  function head(title, trailing) {
    return '<div class="sp-head"><h1>' + esc(title) + '</h1>' + (trailing || '') + '</div>';
  }

  function flagBtns() {
    return (
      '<div class="sp-flags">' +
        '<button type="button" class="sp-iconbtn" title="Regex" data-toggle="flag">.*</button>' +
        '<button type="button" class="sp-iconbtn" title="Case sensitive" data-toggle="flag">Aa</button>' +
        '<button type="button" class="sp-iconbtn" title="Whole word" data-toggle="flag">Ab</button>' +
      '</div>'
    );
  }

  function searchHits() {
    return SPData.search.hits.map(function (f) {
      var lines = f.lines.map(function (ln) {
        return '<div class="sp-row search-hit" data-toast="OpenFile → ' + esc(f.file) + ':' + ln.ln + '">' +
          '<span class="mono" style="color:var(--text-muted);font-size:var(--fs-2xs);width:28px;flex:none">' + ln.ln + '</span>' +
          '<span class="primary mono">' + esc(ln.text) + '</span></div>';
      }).join('');
      return '<div class="sp-section-label elide">' + esc(f.file) + ' · ' + f.count + '</div>' + lines;
    }).join('');
  }

  /* ---- SEARCH ---- */
  function searchStacked(uid) {
    return head('Search', chip(SPData.search.index.status, 'ok') +
      '<button type="button" class="sp-iconbtn" data-sprout-menu="' + uid + '-idx" title="Index">' + I('more') + '</button>' +
      '<div id="' + uid + '-idx" class="sp-sprout-menu">' +
        '<div class="sp-sprout-heading">Index</div>' +
        '<button type="button" class="sp-sprout-item" data-value="rebuild" data-label="Rebuild index">Rebuild index</button>' +
        '<button type="button" class="sp-sprout-item" data-value="disable" data-label="Disable indexing">Disable indexing</button>' +
        '<button type="button" class="sp-sprout-item" data-value="exclusions" data-label="Generated exclusions">Generated exclusions</button>' +
      '</div>') +
      '<div class="sp-rail">' +
        '<input class="sp-input" placeholder="Search in files…" value="quantity">' +
        '<div id="' + uid + '-repl" class="hidden"><input class="sp-input" placeholder="Replace…"></div>' +
        '<div style="display:flex;gap:var(--xs);align-items:center;flex-wrap:wrap">' +
          '<button type="button" class="sp-iconbtn" data-toggle-id="' + uid + '-repl" title="Toggle replace">' + I('plus') + '</button>' +
          flagBtns() +
          sprout(uid + '-scope', 'All Files', SPData.search.scopes, 'cmd.search.set_scope') +
        '</div>' +
      '</div>' +
      '<div class="sp-list">' +
        '<div class="sp-section-label">Results · ' + SPData.searchStats().hits + ' in ' + SPData.searchStats().files + ' files</div>' +
        searchHits() +
      '</div>' +
      '<div class="sp-footer">' +
        '<button type="button" class="sp-btn" data-toast="cmd.search.replace_selected">Replace</button>' +
        '<button type="button" class="sp-btn primary" data-toast="cmd.search.replace_all">Replace all</button>' +
      '</div>';
  }

  function searchSegment(uid) {
    return head('Search', sprout(uid + '-scope', 'All Files', SPData.search.scopes, 'cmd.search.set_scope')) +
      '<div class="sp-rail">' +
        '<div class="sp-seg">' +
          '<button type="button" class="active" data-seg>Find</button>' +
          '<button type="button" data-seg data-toast="Replace mode">Replace</button>' +
          '<button type="button" data-seg data-toast="Index: Ready · tantivy · 1284">Index</button>' +
        '</div>' +
        '<input class="sp-input" placeholder="Search…" value="quantity">' +
        flagBtns() +
      '</div>' +
      '<div class="sp-list">' + searchHits() + '</div>';
  }

  function searchSheet(uid) {
    return head('Search', chip('Ready', 'ok')) +
      '<div class="sp-rail">' +
        '<input class="sp-input" placeholder="Search…" value="quantity">' +
        '<div style="display:flex;gap:var(--xs);align-items:center">' + flagBtns() + sprout(uid + '-scope', 'All Files', SPData.search.scopes, 'cmd.search.set_scope') + '</div>' +
      '</div>' +
      '<div class="sp-list">' + searchHits() + '</div>' +
      '<div class="sp-sheet open" id="' + uid + '-sheet">' +
        '<h3>Match detail</h3>' +
        '<p class="mono">src/services/import.rs:41</p>' +
        '<p>fn parse_<b>quantity</b>(raw: &str) -&gt; Result&lt;Qty&gt;</p>' +
        '<div style="display:flex;gap:var(--sm)">' +
          '<button type="button" class="sp-btn primary" data-toast="OpenFile path/range">Open</button>' +
          '<button type="button" class="sp-btn" data-toast="cmd.search.replace_selected">Replace</button>' +
        '</div>' +
      '</div>';
  }

  function searchToolbar(uid) {
    return head('Search') +
      '<div class="sp-rail">' +
        '<div style="display:flex;gap:2px;flex-wrap:wrap">' +
          '<button type="button" class="sp-iconbtn" title="Rebuild" data-toast="cmd.search.reindex">' + I('refresh') + '</button>' +
          '<button type="button" class="sp-iconbtn" title="Replace" data-toast="Toggle replace">' + I('plus') + '</button>' +
          '<button type="button" class="sp-iconbtn" title="Filter" data-toast="Include/exclude">' + I('filter') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-sprout-menu="' + uid + '-more">' + I('more') + '</button>' +
          '<div id="' + uid + '-more" class="sp-sprout-menu">' +
            '<button type="button" class="sp-sprout-item" data-value="case" data-label="Case sensitive">Case sensitive</button>' +
            '<button type="button" class="sp-sprout-item" data-value="word" data-label="Whole word">Whole word</button>' +
            '<button type="button" class="sp-sprout-item" data-value="regex" data-label="Regex">Regex</button>' +
            '<div class="sp-sprout-sep"></div>' +
            '<button type="button" class="sp-sprout-item" data-value="10mb" data-label="Large-file threshold 10MB">Large-file threshold 10MB</button>' +
          '</div>' +
        '</div>' +
        '<input class="sp-input" placeholder="Search…" value="quantity">' +
        sprout(uid + '-scope', 'All Files', SPData.search.scopes, 'cmd.search.set_scope') +
      '</div>' +
      '<div class="sp-list">' + searchHits() + '</div>' +
      '<div class="sp-footer"><button type="button" class="sp-btn primary" data-toast="cmd.search.replace_all">Replace all</button></div>';
  }

  function searchSpine(uid) {
    return head('Search', chip('Ready', 'ok')) +
      '<div class="sp-panel-inner">' +
        '<div class="sp-spine">' +
          '<button type="button" class="active" title="Find">' + I('search', 14) + '</button>' +
          '<button type="button" title="Replace" data-toast="Replace">' + I('plus', 14) + '</button>' +
          '<button type="button" title="Index" data-toast="Index status">' + I('refresh', 14) + '</button>' +
        '</div>' +
        '<div class="sp-spine-main">' +
          '<div class="sp-rail">' +
            '<input class="sp-input" placeholder="Search…" value="quantity">' +
            sprout(uid + '-scope', 'All Files', SPData.search.scopes, 'cmd.search.set_scope') +
          '</div>' +
          '<div class="sp-list">' + searchHits() + '</div>' +
        '</div>' +
      '</div>';
  }

  function searchLadder(uid) {
    return head('Search') +
      '<div class="sp-body layout-ladder">' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Query</span><span class="count">quantity</span></button>' +
        '<div class="sp-ladder-body open" style="padding:var(--md)">' +
          '<input class="sp-input" value="quantity" style="margin-bottom:var(--sm)">' +
          '<div style="display:flex;gap:var(--xs);flex-wrap:wrap;align-items:center">' + flagBtns() + sprout(uid + '-scope', 'All Files', SPData.search.scopes, 'cmd.search.set_scope') + '</div>' +
        '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Index</span><span class="count">Ready</span></button>' +
        '<div class="sp-ladder-body" style="padding:var(--md)">' +
          '<div class="sp-row"><span class="primary">Engine</span>' + chip('tantivy', 'info') + '</div>' +
          '<div class="sp-row"><span class="primary">Documents</span><span class="badge">' + esc(SPData.search.index.docs) + '</span></div>' +
          '<button type="button" class="sp-btn" style="margin-top:var(--sm)" data-toast="cmd.search.reindex">Rebuild</button>' +
        '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Results</span><span class="count">' + SPData.searchStats().hits + '</span></button>' +
        '<div class="sp-ladder-body">' + searchHits() + '</div>' +
      '</div>';
  }

  /* ---- SOURCE ---- */
  function sourceChangesList() {
    var staged = SPData.source.staged.map(function (f) {
      return '<div class="sp-row"><span class="primary elide">' + esc(f.path) + '</span>' + chip(f.status, 'ok') +
        '<button type="button" class="sp-minibtn" data-toast="cmd.git.unstage">−</button>' +
        '<button type="button" class="sp-minibtn" data-toast="Open diff preview">D</button></div>';
    }).join('');
    var unstaged = SPData.source.unstaged.map(function (f) {
      return '<div class="sp-row"><span class="primary elide">' + esc(f.path) + '</span>' + chip(f.status, 'warn') +
        '<button type="button" class="sp-minibtn" data-toast="cmd.git.stage">+</button>' +
        '<button type="button" class="sp-minibtn" data-toast="Open diff preview">D</button></div>';
    }).join('');
    var untracked = (SPData.source.untracked || []).map(function (f) {
      return '<div class="sp-row"><span class="primary elide">' + esc(f.path) + '</span>' + chip(f.status, 'info') +
        '<button type="button" class="sp-minibtn" data-toast="cmd.git.stage">+</button></div>';
    }).join('');
    var conflicts = (SPData.source.conflicts || []).map(function (f) {
      return '<div class="sp-row"><span class="primary elide">' + esc(f.path) + '</span>' + chip(f.status, 'err') +
        '<button type="button" class="sp-minibtn" data-toast="Conflict Assistant">!</button></div>';
    }).join('');
    return '<div class="sp-section-label">Staged · 2</div>' + staged +
      '<div class="sp-section-label">Unstaged · 1</div>' + unstaged +
      (untracked ? '<div class="sp-section-label">Untracked · 1</div>' + untracked : '') +
      (conflicts ? '<div class="sp-section-label">Conflicts · 1</div>' + conflicts : '');
  }

  function sourceWorktrees() {
    return SPData.source.worktrees.map(function (w) {
      return '<div class="sp-row" data-sheet-title="' + esc(w.name) + '" data-sheet-body="Owner: ' + esc(w.owner) + ' · ' + esc(w.status) + '">' +
        I('branch', 12) +
        '<div style="flex:1;min-width:0"><div class="primary">' + esc(w.name) + '</div><span class="secondary">' + esc(w.owner) + '</span></div>' +
        chip(w.status, w.status === 'clean' ? 'ok' : 'warn') +
        '<button type="button" class="sp-minibtn" data-sprout-menu="wt-' + esc(w.name.replace(/\W/g, '')) + '">' + I('more', 12) + '</button>' +
        '<div id="wt-' + esc(w.name.replace(/\W/g, '')) + '" class="sp-sprout-menu">' +
          '<button type="button" class="sp-sprout-item" data-value="open" data-label="Open">Open</button>' +
          '<button type="button" class="sp-sprout-item" data-value="compare" data-label="Compare">Compare</button>' +
          '<button type="button" class="sp-sprout-item" data-value="pr" data-label="PR">PR</button>' +
          '<div class="sp-sprout-sep"></div>' +
          '<button type="button" class="sp-sprout-item" data-value="remove" data-label="Remove (confirm)">Remove (confirm)</button>' +
        '</div></div>';
    }).join('');
  }

  function sourceCommon(uid, bodyExtra) {
    return sprout(uid + '-branch', 'main', SPData.source.branches, 'cmd.git.switch_branch') +
      (bodyExtra || '');
  }

  function sourceStacked(uid) {
    return head('Source Control', chip('2↑ 1↓', 'info')) +
      '<div class="sp-rail">' + sourceCommon(uid) +
        '<div class="sp-seg">' +
          [
            { short: 'Chg', full: 'Changes' },
            { short: 'Hist', full: 'History' },
            { short: 'Graph', full: 'Graph' },
            { short: 'WT', full: 'Worktrees' },
            { short: 'Br', full: 'Branches' },
            { short: 'Stash', full: 'Stash' }
          ].map(function (s, i) {
            return '<button type="button" title="' + esc(s.full) + '"' + (i === 0 ? ' class="active"' : '') + ' data-seg data-toast="Subview: ' + esc(s.full) + '">' + esc(s.short) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="sp-list">' + sourceChangesList() + '</div>' +
      '<div class="sp-footer">' +
        '<input class="sp-input" placeholder="Commit message…" style="flex:1 1 100%">' +
        '<button type="button" class="sp-btn" data-toast="cmd.git.commit_ai">AI</button>' +
        '<button type="button" class="sp-btn primary" data-toast="cmd.git.commit">Commit</button>' +
        '<button type="button" class="sp-btn" data-toast="cmd.git.pull">Pull</button>' +
        '<button type="button" class="sp-btn" data-toast="cmd.git.push">Push</button>' +
        '<button type="button" class="sp-btn" data-toast="cmd.git.fetch">Fetch</button>' +
        '<button type="button" class="sp-btn" data-toast="cmd.git.sync">Sync</button>' +
      '</div>';
  }

  function sourceSegment(uid) {
    return head('Source', sourceCommon(uid)) +
      '<div class="sp-rail"><div class="sp-seg">' +
        ['Changes', 'History', 'Worktrees', 'Graph'].map(function (s, i) {
          return '<button type="button"' + (i === 0 ? ' class="active"' : '') + ' data-panel-seg="' + s.toLowerCase() + '">' + esc(s) + '</button>';
        }).join('') +
      '</div>' +
      '<div class="sp-seg">' +
        ['All', 'Threads', 'Orch', 'Manual'].map(function (f, i) {
          return '<button type="button"' + (i === 0 ? ' class="active"' : '') + ' data-toast="Worktree filter: ' + f + '">' + f + '</button>';
        }).join('') +
      '</div></div>' +
      '<div class="sp-list" data-seg-panel="changes">' + sourceChangesList() + '</div>';
  }

  function sourceSheet(uid) {
    return head('Source', sourceCommon(uid)) +
      '<div class="sp-list">' + sourceWorktrees() + '</div>' +
      '<div class="sp-sheet open">' +
        '<h3>orch/lane-b-api</h3>' +
        '<p>Path · .worktrees/lane-b-api<br>Base · main · Age · 2d<br>Owner · Orchestrator lane-b</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:var(--sm)">' +
          '<button type="button" class="sp-btn primary" data-toast="Open worktree">Open</button>' +
          '<button type="button" class="sp-btn" data-toast="Compare">Compare</button>' +
          '<button type="button" class="sp-btn" data-toast="Review Mode">Review</button>' +
        '</div>' +
      '</div>';
  }

  function sourceToolbar(uid) {
    return head('Source') +
      '<div class="sp-rail">' +
        '<div style="display:flex;gap:2px;flex-wrap:wrap">' +
          '<button type="button" class="sp-iconbtn" data-toast="Fetch">' + I('refresh') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-toast="Pull">↓</button>' +
          '<button type="button" class="sp-iconbtn" data-toast="Push">↑</button>' +
          '<button type="button" class="sp-iconbtn" data-toast="Stash">S</button>' +
          '<button type="button" class="sp-iconbtn" data-sprout-menu="' + uid + '-more">' + I('more') + '</button>' +
          '<div id="' + uid + '-more" class="sp-sprout-menu">' +
            '<button type="button" class="sp-sprout-item" data-value="sync" data-label="Sync">Sync</button>' +
            '<button type="button" class="sp-sprout-item" data-value="conflict" data-label="Conflict Assistant">Conflict Assistant</button>' +
            '<button type="button" class="sp-sprout-item" data-value="graph" data-label="Graph">Graph</button>' +
          '</div>' +
        '</div>' +
        sourceCommon(uid) +
      '</div>' +
      '<div class="sp-list">' + sourceChangesList() + '</div>' +
      '<div class="sp-footer"><button type="button" class="sp-btn primary" data-toast="Commit">Commit</button></div>';
  }

  function sourceSpine(uid) {
    var icons = ['source', 'refresh', 'branch', 'branch', 'branch', 'filter'];
    var labels = ['Changes', 'History', 'Graph', 'Worktrees', 'Branches', 'Stash'];
    return head('Source', chip('dirty', 'warn')) +
      '<div class="sp-panel-inner">' +
        '<div class="sp-spine">' +
          labels.map(function (s, i) {
            return '<button type="button"' + (i === 0 ? ' class="active"' : '') + ' title="' + esc(s) + '" data-toast="' + esc(s) + '">' + I(icons[i], 14) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="sp-spine-main">' +
          '<div class="sp-rail">' + sourceCommon(uid) + '</div>' +
          '<div class="sp-list">' + sourceChangesList() + '</div>' +
          '<div class="sp-footer"><button type="button" class="sp-btn primary" data-toast="Commit">Commit</button></div>' +
        '</div>' +
      '</div>';
  }

  function sourceLadder(uid) {
    return head('Source', sourceCommon(uid)) +
      '<div class="sp-body layout-ladder">' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Changes</span><span class="count">' + SPData.changeCount() + '</span></button>' +
        '<div class="sp-ladder-body open">' + sourceChangesList() +
          '<div style="padding:var(--md);display:flex;gap:var(--sm)">' +
            '<input class="sp-input" placeholder="Commit message…">' +
            '<button type="button" class="sp-btn primary" data-toast="Commit">Commit</button>' +
          '</div></div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Worktrees</span><span class="count">' + SPData.source.worktrees.length + '</span></button>' +
        '<div class="sp-ladder-body">' + sourceWorktrees() + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>History</span><span class="count">' + SPData.source.history.length + '</span></button>' +
        '<div class="sp-ladder-body">' + SPData.source.history.map(function (h) {
          return '<div class="sp-row"><span class="mono badge">' + esc(h.hash) + '</span><span class="primary elide">' + esc(h.msg) + '</span><span class="secondary">' + esc(h.age) + '</span></div>';
        }).join('') + '</div>' +
      '</div>';
  }

  /* ---- ACTIONS ---- */
  function actionsRuns() {
    return SPData.actions.runs.map(function (r) {
      var k = r.status === 'passed' ? 'ok' : r.status === 'failed' ? 'err' : r.status === 'waiting' ? 'warn' : 'info';
      var extra = r.blocked
        ? '<button type="button" class="sp-minibtn" data-toast="Recovery: approve env">' + I('warn', 12) + '</button>'
        : '<button type="button" class="sp-minibtn" data-toast="Rerun">' + I('refresh', 12) + '</button>';
      return '<div class="sp-row" data-sheet-title="' + esc(r.name) + '" data-sheet-body="Status: ' + esc(r.status) + (r.blocked ? ' · blocked: ' + esc(r.blocked) : '') + ' · ' + esc(r.age) + '">' +
        (r.pin ? I('pin', 12) : '<span style="width:12px"></span>') +
        '<div style="flex:1;min-width:0"><div class="primary elide">' + esc(r.name) + '</div>' +
        (r.blocked ? '<span class="secondary">Blocked · ' + esc(r.blocked) + ' (wait ≠ failure)</span>' : '') +
        '</div>' + chip(r.status, k) + extra + '</div>';
    }).join('');
  }

  function actionsStacked(uid) {
    return head('GitHub Actions', chip('view+dispatch', 'info')) +
      '<div class="sp-rail">' +
        '<div class="sp-seg">' + SPData.actions.subviews.map(function (s, i) {
          return '<button type="button"' + (i === 0 ? ' class="active"' : '') + ' data-toast="' + esc(s) + '">' + esc(s) + '</button>';
        }).join('') + '</div>' +
        '<div class="sp-row" style="border:none;padding:0"><span class="secondary">Branch</span>' + sprout(uid + '-br', 'main', SPData.source.branches, 'actions.branch') + '</div>' +
      '</div>' +
      '<div class="sp-list"><div class="sp-section-label">Current Branch · readiness ok</div>' + actionsRuns() + '</div>' +
      '<div class="sp-footer">' +
        '<button type="button" class="sp-btn" data-toast="Failure triage">Triage</button>' +
        '<button type="button" class="sp-btn primary" data-toast="Dispatch">Dispatch</button>' +
      '</div>';
  }

  function actionsSegment(uid) {
    return head('Actions') +
      '<div class="sp-rail"><div class="sp-seg">' +
        ['Branch', 'Workflows', 'Settings'].map(function (s, i) {
          return '<button type="button"' + (i === 0 ? ' class="active"' : '') + '>' + s + '</button>';
        }).join('') + '</div></div>' +
      '<div class="sp-list">' + actionsRuns() + '</div>';
  }

  function actionsSheet(uid) {
    return head('Actions', chip('failed', 'err')) +
      '<div class="sp-list">' + actionsRuns() + '</div>' +
      '<div class="sp-sheet open">' +
        '<h3>Build & Publish · failed</h3>' +
        '<p>Failing step · docker bake · related diff in recipes.rs<br>Replay from last success available.</p>' +
        '<div style="display:flex;gap:var(--sm);flex-wrap:wrap">' +
          '<button type="button" class="sp-btn primary" data-toast="Open logs">Logs</button>' +
          '<button type="button" class="sp-btn" data-toast="Replay last good">Replay</button>' +
          '<button type="button" class="sp-btn" data-toast="Related worktree">Code</button>' +
        '</div>' +
      '</div>';
  }

  function actionsToolbar(uid) {
    return head('Actions') +
      '<div class="sp-rail">' +
        '<div style="display:flex;gap:2px">' +
          '<button type="button" class="sp-iconbtn" data-toast="Refresh">' + I('refresh') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-toast="Dispatch">' + I('play') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-toast="Pin">' + I('pin') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-sprout-menu="' + uid + '-more">' + I('more') + '</button>' +
          '<div id="' + uid + '-more" class="sp-sprout-menu">' +
            '<button type="button" class="sp-sprout-item" data-value="settings" data-label="Settings">Settings</button>' +
            '<button type="button" class="sp-sprout-item" data-value="runners" data-label="Runners">Runners</button>' +
          '</div>' +
        '</div>' +
        '<div class="sp-seg"><button class="active">Branch</button><button>Workflows</button><button>Settings</button></div>' +
      '</div>' +
      '<div class="sp-list">' + actionsRuns() + '</div>';
  }

  function actionsSpine(uid) {
    return head('Actions') +
      '<div class="sp-panel-inner">' +
        '<div class="sp-spine">' +
          '<button class="active" title="Current Branch">' + I('branch', 14) + '</button>' +
          '<button title="Workflows" data-toast="Workflows">' + I('actions', 14) + '</button>' +
          '<button title="Settings" data-toast="Settings">' + I('filter', 14) + '</button>' +
        '</div>' +
        '<div class="sp-spine-main"><div class="sp-list">' + actionsRuns() + '</div>' +
          '<div class="sp-footer"><button class="sp-btn primary" data-toast="Dispatch">Dispatch</button></div></div>' +
      '</div>';
  }

  function actionsLadder(uid) {
    return head('Actions') +
      '<div class="sp-body layout-ladder">' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Current Branch</span><span class="count">' + SPData.actions.runs.length + '</span></button>' +
        '<div class="sp-ladder-body open">' + actionsRuns() + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Workflows</span><span class="count">' + SPData.actions.workflows.length + '</span></button>' +
        '<div class="sp-ladder-body">' + SPData.actions.workflows.map(function (w) {
          return '<div class="sp-row"><span class="primary">' + esc(w.name) + '</span>' + chip(w.health, w.health === 'ok' ? 'ok' : 'warn') + '</div>';
        }).join('') + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Settings</span><span class="count">' + SPData.actions.settings.length + '</span></button>' +
        '<div class="sp-ladder-body">' + SPData.actions.settings.map(function (s) {
          return '<div class="sp-row"><span class="primary">' + esc(s.k) + '</span><span class="secondary">' + esc(s.v) + '</span></div>';
        }).join('') + '</div>' +
      '</div>';
  }

  /* ---- DOCKER ---- */
  function dockerContainers() {
    return SPData.docker.containers.map(function (c) {
      var k = c.state === 'running' ? 'ok' : 'err';
      return '<div class="sp-row" data-sheet-title="' + esc(c.name) + '" data-sheet-body="' + esc(c.image) + ' · ' + esc(c.state) + '">' +
        I('container', 12) +
        '<div style="flex:1;min-width:0"><div class="primary">' + esc(c.name) + '</div><span class="secondary elide">' + esc(c.image) + '</span></div>' +
        chip(c.state, k) +
        '<button type="button" class="sp-minibtn" data-sprout-menu="dc-' + esc(c.name) + '">' + I('more', 12) + '</button>' +
        '<div id="dc-' + esc(c.name) + '" class="sp-sprout-menu">' +
          '<button type="button" class="sp-sprout-item" data-value="logs" data-label="Logs">Logs</button>' +
          '<button type="button" class="sp-sprout-item" data-value="shell" data-label="Shell">Shell</button>' +
          '<button type="button" class="sp-sprout-item" data-value="inspect" data-label="Inspect">Inspect</button>' +
          '<div class="sp-sprout-sep"></div>' +
          '<button type="button" class="sp-sprout-item" data-value="restart" data-label="Restart">Restart</button>' +
          '<button type="button" class="sp-sprout-item" data-value="stop" data-label="Stop">Stop</button>' +
        '</div></div>';
    }).join('');
  }

  function dockerStacked(uid) {
    return head('Docker Manager', chip('Docker', 'ok')) +
      '<div class="sp-rail">' +
        sprout(uid + '-rt', 'Docker', ['Docker', 'Podman'], 'runtime') +
        '<div class="sp-seg" style="flex-wrap:wrap">' +
        [
          { short: 'Ctr', full: 'Containers' },
          { short: 'Img', full: 'Images' },
          { short: 'Cmp', full: 'Compose' },
          { short: 'Reg', full: 'Registries' },
          { short: 'Bake', full: 'Build/Bake' },
          { short: 'Pub', full: 'Publish/Unraid' },
          { short: 'Net', full: 'Networks' },
          { short: 'Vol', full: 'Volumes' },
          { short: 'Ctx', full: 'Contexts' },
          { short: 'K8s', full: 'Kubernetes' }
        ].map(function (s, i) {
          return '<button type="button" title="' + esc(s.full) + '"' + (i === 0 ? ' class="active"' : '') + ' data-toast="' + esc(s.full) + '">' + esc(s.short) + '</button>';
        }).join('') +
      '</div></div>' +
      '<div class="sp-list">' + dockerContainers() + '</div>';
  }

  function dockerSegment(uid) {
    return head('Docker') +
      '<div class="sp-rail"><div class="sp-seg">' +
        ['Ctr', 'Img', 'Cmp', 'Reg', 'Bake', 'Pub'].map(function (s, i) {
          return '<button type="button"' + (i === 0 ? ' class="active"' : '') + '>' + s + '</button>';
        }).join('') + '</div></div>' +
      '<div class="sp-list">' + dockerContainers() + '</div>';
  }

  function dockerSheet(uid) {
    return head('Docker', chip(String(SPData.docker.containers.filter(function (c) { return c.state === 'running'; }).length) + ' up', 'ok')) +
      '<div class="sp-list">' + dockerContainers() + '</div>' +
      '<div class="sp-sheet open">' +
        '<h3>tastebook-api</h3>' +
        '<p>Image tastebook-api:dev · ports 8080 · health ok<br>Open app URL · attach shell · inspect</p>' +
        '<div style="display:flex;gap:var(--sm);flex-wrap:wrap">' +
          '<button type="button" class="sp-btn primary" data-toast="Logs">Logs</button>' +
          '<button type="button" class="sp-btn" data-toast="Shell">Shell</button>' +
          '<button type="button" class="sp-btn" data-toast="Stop">Stop</button>' +
        '</div>' +
      '</div>';
  }

  function dockerToolbar(uid) {
    return head('Docker') +
      '<div class="sp-rail">' +
        '<div style="display:flex;gap:2px;flex-wrap:wrap">' +
          '<button type="button" class="sp-iconbtn" data-toast="Refresh">' + I('refresh') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-toast="Compose up">' + I('play') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-toast="Compose down">' + I('stop') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-sprout-menu="' + uid + '-more">' + I('more') + '</button>' +
          '<div id="' + uid + '-more" class="sp-sprout-menu">' +
            SPData.docker.subviews.map(function (s) {
              return '<button type="button" class="sp-sprout-item" data-value="' + esc(s) + '" data-label="' + esc(s) + '">' + esc(s) + '</button>';
            }).join('') +
          '</div>' +
        '</div>' +
        sprout(uid + '-rt', 'Docker', ['Docker', 'Podman'], 'runtime') +
      '</div>' +
      '<div class="sp-list">' + dockerContainers() + '</div>';
  }

  function dockerSpine(uid) {
    var spineIcons = ['container', 'files', 'tests', 'artifacts', 'play', 'check', 'source', 'agents', 'search', 'more'];
    return head('Docker') +
      '<div class="sp-panel-inner">' +
        '<div class="sp-spine">' +
          SPData.docker.subviews.map(function (s, i) {
            return '<button type="button"' + (i === 0 ? ' class="active"' : '') + ' title="' + esc(s) + '" data-toast="' + esc(s) + '">' +
              I(spineIcons[i] || 'docker', 14) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="sp-spine-main"><div class="sp-list">' + dockerContainers() + '</div></div>' +
      '</div>';
  }

  function dockerLadder(uid) {
    return head('Docker', sprout(uid + '-rt', 'Docker', ['Docker', 'Podman'], 'runtime')) +
      '<div class="sp-body layout-ladder">' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Containers</span><span class="count">' + SPData.docker.containers.length + '</span></button>' +
        '<div class="sp-ladder-body open">' + dockerContainers() + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Images</span><span class="count">' + SPData.docker.images.length + '</span></button>' +
        '<div class="sp-ladder-body">' + SPData.docker.images.map(function (im) {
          return '<div class="sp-row"><span class="primary elide">' + esc(im.name) + '</span><span class="badge">' + esc(im.size) + '</span></div>';
        }).join('') + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Compose</span><span class="count">' + SPData.docker.compose.length + '</span></button>' +
        '<div class="sp-ladder-body">' + SPData.docker.compose.map(function (c) {
          return '<div class="sp-row"><span class="primary">' + esc(c.name) + '</span>' + chip(c.state, c.state === 'up' ? 'ok' : 'warn') + '</div>';
        }).join('') + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Publish / Unraid</span><span class="count">chain</span></button>' +
        '<div class="sp-ladder-body" style="padding:var(--md)">' +
          '<p style="margin:0 0 var(--sm);font-size:var(--fs-xs);color:var(--text-secondary)">Requested vs effective auth · protected repo · publish chain</p>' +
          '<button type="button" class="sp-btn primary" data-toast="Open Publish/Unraid">Open publish</button>' +
        '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Advanced</span><span class="count">Net/Vol/Ctx/K8s</span></button>' +
        '<div class="sp-ladder-body">' +
          ['Networks', 'Volumes', 'Contexts', 'Kubernetes (conditional)'].map(function (x) {
            return '<div class="sp-row" data-toast="' + esc(x) + '"><span class="primary">' + esc(x) + '</span></div>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  /* ---- TESTS ---- */
  function testsRuns() {
    return SPData.tests.runs.map(function (r) {
      var k = r.status === 'passed' ? 'ok' : 'err';
      return '<div class="sp-row" data-sheet-title="' + esc(r.label) + '" data-sheet-body="' + esc(r.id) + ' · ' + esc(r.status) + '">' +
        '<span class="primary elide">' + esc(r.label) + '</span>' + chip(r.status, k) +
        '<span class="secondary">' + esc(r.age) + '</span></div>';
    }).join('');
  }

  function testsFailures() {
    return SPData.tests.failures.map(function (f) {
      return '<div class="sp-row" data-toast="Open failure ' + esc(f.file) + '"><span class="primary elide">' + esc(f.test) + '</span><span class="secondary mono">' + esc(f.file) + '</span></div>';
    }).join('');
  }

  function testsStacked(uid) {
    return head('Testing', chip(SPData.tests.policy, 'info') + chip(SPData.tests.lastStatus, 'err')) +
      '<div class="sp-rail">' +
        '<div style="display:flex;gap:var(--sm)">' +
          '<button type="button" class="sp-btn primary" data-toast="cmd.testing.run">' + I('play', 12) + ' Run</button>' +
          '<button type="button" class="sp-btn" data-toast="cmd.testing.watch">Watch</button>' +
          '<button type="button" class="sp-btn" data-toast="cmd.testing.cancel">Cancel</button>' +
        '</div>' +
        sprout(uid + '-pol', 'Policy: Auto', ['Auto', 'On', 'Off'], 'cmd.testing.policy') +
        '<div class="sp-row" style="border:none;padding:0"><span class="secondary">Runtime</span>' +
          chip(SPData.tests.runtimeReady ? 'ready' : 'disabled', SPData.tests.runtimeReady ? 'ok' : 'warn') +
          '<button type="button" class="sp-btn" data-toast="Open receipt tr-1842">Receipt</button></div>' +
      '</div>' +
      '<div class="sp-list">' +
        '<div class="sp-section-label">Run list</div>' + testsRuns() +
        '<div class="sp-section-label">Active run detail</div>' +
        '<div class="sp-row"><span class="primary">tr-1842 · import worker suite</span>' + chip('failed', 'err') + '</div>' +
        '<div class="sp-section-label">Failures</div>' + testsFailures() +
        '<div class="sp-section-label">Artifact preview</div>' +
        SPData.tests.artifacts.map(function (a) {
          return '<div class="sp-row"><span class="primary">' + esc(a) + '</span></div>';
        }).join('') +
        '<div class="sp-section-label">Redaction</div>' +
        '<div class="sp-row"><span class="secondary">Notice · secrets redacted before display</span></div>' +
      '</div>';
  }

  function testsSegment(uid) {
    return head('Tests', chip('failed', 'err')) +
      '<div class="sp-rail"><div class="sp-seg">' +
        ['Runs', 'Failures', 'Artifacts', 'Policy'].map(function (s, i) {
          return '<button type="button"' + (i === 0 ? ' class="active"' : '') + '>' + s + '</button>';
        }).join('') + '</div>' +
        '<button type="button" class="sp-btn primary" data-toast="Run tests">Run tests</button></div>' +
      '<div class="sp-list">' + testsRuns() + '</div>';
  }

  function testsSheet(uid) {
    return head('Tests') +
      '<div class="sp-rail"><button type="button" class="sp-btn primary" data-toast="Run">Run</button></div>' +
      '<div class="sp-list">' + testsRuns() + '</div>' +
      '<div class="sp-sheet open">' +
        '<h3>import worker suite · failed</h3>' +
        '<p>2 failures · receipt tr-1842 · redaction ok</p>' +
        testsFailures() +
        '<button type="button" class="sp-btn" style="margin-top:var(--sm)" data-toast="Export bundle">Export bundle</button>' +
      '</div>';
  }

  function testsToolbar(uid) {
    return head('Tests') +
      '<div class="sp-rail">' +
        '<div style="display:flex;gap:2px">' +
          '<button type="button" class="sp-iconbtn" data-toast="Run">' + I('play') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-toast="Watch">' + I('refresh') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-toast="Cancel">' + I('stop') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-sprout-menu="' + uid + '-more">' + I('more') + '</button>' +
          '<div id="' + uid + '-more" class="sp-sprout-menu">' +
            '<button type="button" class="sp-sprout-item" data-value="receipt" data-label="Open receipt">Open receipt</button>' +
            '<button type="button" class="sp-sprout-item" data-value="export" data-label="Export bundle">Export bundle</button>' +
            '<button type="button" class="sp-sprout-item" data-value="policy" data-label="Policy Auto/On/Off">Policy Auto/On/Off</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sp-list">' +
        '<div class="sp-section-label">Failures</div>' + testsFailures() +
        '<div class="sp-section-label">Runs</div>' + testsRuns() +
      '</div>';
  }

  function testsSpine(uid) {
    return head('Tests', chip('Auto', 'info')) +
      '<div class="sp-panel-inner">' +
        '<div class="sp-spine">' +
          '<button class="active" title="Runs">' + I('tests', 14) + '</button>' +
          '<button title="Failures" data-toast="Failures">' + I('warn', 14) + '</button>' +
          '<button title="Artifacts" data-toast="Artifacts">' + I('artifacts', 14) + '</button>' +
        '</div>' +
        '<div class="sp-spine-main">' +
          '<div class="sp-rail"><button class="sp-btn primary" data-toast="Run">Run</button></div>' +
          '<div class="sp-list">' + testsRuns() + '</div>' +
        '</div>' +
      '</div>';
  }

  function testsLadder(uid) {
    return head('Tests', sprout(uid + '-pol', 'Auto', ['Auto', 'On', 'Off'], 'policy')) +
      '<div class="sp-body layout-ladder">' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Run list</span><span class="count">' + SPData.tests.runs.length + '</span></button>' +
        '<div class="sp-ladder-body open">' + testsRuns() +
          '<div style="padding:var(--md)"><button class="sp-btn primary" data-toast="Run">Run tests</button></div></div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Failures</span><span class="count">' + SPData.tests.failures.length + '</span></button>' +
        '<div class="sp-ladder-body">' + testsFailures() + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Artifacts</span><span class="count">' + SPData.tests.artifacts.length + '</span></button>' +
        '<div class="sp-ladder-body">' + SPData.tests.artifacts.map(function (a) {
          return '<div class="sp-row"><span class="primary">' + esc(a) + '</span></div>';
        }).join('') + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Redaction</span><span class="count">ok</span></button>' +
        '<div class="sp-ladder-body" style="padding:var(--md)"><p style="margin:0;font-size:var(--fs-xs);color:var(--text-secondary)">Redaction notice · display blocked until resolved if redaction fails.</p></div>' +
      '</div>';
  }

  /* ---- AGENTS ---- */
  function agentsActive() {
    return SPData.agents.active.map(function (a) {
      return '<div class="sp-row" data-toast="Lineage → ' + esc(a.name) + '">' +
        I('agents', 12) +
        '<div style="flex:1;min-width:0"><div class="primary">' + esc(a.name) + '</div><span class="secondary">' + esc(a.parent) + '</span></div>' +
        chip(a.status, a.status === 'running' ? 'ok' : 'info') +
        '<button type="button" class="sp-minibtn" data-toast="Open lineage">' + I('lineage', 12) + '</button></div>';
    }).join('');
  }
  function agentsAvail() {
    return SPData.agents.available.map(function (a) {
      return '<div class="sp-row"><span class="primary">' + esc(a.name) + '</span><span class="secondary">' + esc(a.caps) + '</span></div>';
    }).join('');
  }

  function agentsStacked(uid) {
    return head('Agents', chip('registry', 'info')) +
      '<div class="sp-list">' +
        '<div class="sp-section-label">Active</div>' + agentsActive() +
        '<div class="sp-section-label">Available</div>' + agentsAvail() +
      '</div>' +
      '<div class="sp-footer"><button class="sp-btn" data-toast="Open lineage view">Lineage</button></div>';
  }

  function agentsSegment(uid) {
    return head('Agents') +
      '<div class="sp-rail"><div class="sp-seg">' +
        '<button class="active">Active</button><button data-toast="Available">Available</button><button data-toast="Lineage">Lineage</button>' +
      '</div></div>' +
      '<div class="sp-list">' + agentsActive() + '</div>';
  }

  function agentsSheet(uid) {
    return head('Agents') +
      '<div class="sp-list">' + agentsActive() + agentsAvail() + '</div>' +
      '<div class="sp-sheet open">' +
        '<h3>Planner · running</h3>' +
        '<p>Parent Goal #482 · no private subagent state in panel<br>Lineage entrypoint → agent lineage view</p>' +
        '<button class="sp-btn primary" data-toast="Open lineage">Open lineage</button>' +
      '</div>';
  }

  function agentsToolbar(uid) {
    return head('Agents') +
      '<div class="sp-rail">' +
        '<div style="display:flex;gap:2px">' +
          '<button type="button" class="sp-iconbtn" data-toast="Refresh registry">' + I('refresh') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-toast="Lineage">' + I('lineage') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-sprout-menu="' + uid + '-more">' + I('more') + '</button>' +
          '<div id="' + uid + '-more" class="sp-sprout-menu">' +
            '<button type="button" class="sp-sprout-item" data-value="active" data-label="Active only">Active only</button>' +
            '<button type="button" class="sp-sprout-item" data-value="available" data-label="Available">Available</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sp-list">' + agentsActive() + '</div>';
  }

  function agentsSpine(uid) {
    return head('Agents') +
      '<div class="sp-panel-inner">' +
        '<div class="sp-spine">' +
          '<button class="active" title="Active">' + I('agents', 14) + '</button>' +
          '<button title="Available" data-toast="Available">' + I('plus', 14) + '</button>' +
          '<button title="Lineage" data-toast="Lineage">' + I('lineage', 14) + '</button>' +
        '</div>' +
        '<div class="sp-spine-main"><div class="sp-list">' + agentsActive() + '</div></div>' +
      '</div>';
  }

  function agentsLadder(uid) {
    return head('Agents') +
      '<div class="sp-body layout-ladder">' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Active</span><span class="count">' + SPData.agents.active.length + '</span></button>' +
        '<div class="sp-ladder-body open">' + agentsActive() + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Available</span><span class="count">' + SPData.agents.available.length + '</span></button>' +
        '<div class="sp-ladder-body">' + agentsAvail() + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Lineage</span><span class="count">entry</span></button>' +
        '<div class="sp-ladder-body" style="padding:var(--md)">' +
          '<button class="sp-btn primary" data-toast="Open lineage views">Open lineage views</button>' +
        '</div>' +
      '</div>';
  }

  /* ---- ARTIFACTS ---- */
  function artRows(filter) {
    return SPData.artifacts.rows.filter(function (r) {
      return !filter || filter === 'all' || r.type === filter;
    }).map(function (r) {
      var k = r.health === 'ok' ? 'ok' : r.health === 'err' ? 'err' : r.health === 'blocked' ? 'warn' : 'warn';
      var extra = r.type === 'cost_usage'
        ? '<button type="button" class="sp-minibtn" data-sprout-menu="art-' + r.id + '">' + I('more', 12) + '</button>' +
          '<div id="art-' + r.id + '" class="sp-sprout-menu">' +
            '<button type="button" class="sp-sprout-item" data-value="ledger" data-label="Show in Ledger">Show in Ledger</button>' +
            '<button type="button" class="sp-sprout-item" data-value="usage" data-label="Show in Usage">Show in Usage</button>' +
          '</div>'
        : '<button type="button" class="sp-minibtn" data-toast="Open ' + esc(r.id) + '">' + I('artifacts', 12) + '</button>';
      return '<div class="sp-row" data-sheet-title="' + esc(r.title) + '" data-sheet-body="' + esc(r.type) + ' · ' + esc(r.id) + ' · ' + esc(r.fresh) + ' · ' + esc(r.health) + '">' +
        '<div style="flex:1;min-width:0"><div class="primary elide">' + esc(r.title) + '</div><span class="secondary">' + esc(r.type) + ' · ' + esc(r.id) + (r.health === 'blocked' ? ' · gated' : '') + '</span></div>' +
        chip(r.health, k) + extra + '</div>';
    }).join('');
  }

  function artifactsStacked(uid) {
    return head('Artifacts', chip('19 types', 'info')) +
      '<div class="sp-rail">' +
        sprout(uid + '-type', 'All types', ['All types'].concat(SPData.artifacts.types), 'artifacts.filter') +
        '<input class="sp-input" placeholder="Filter artifacts…">' +
      '</div>' +
      '<div class="sp-list">' + artRows() + '</div>';
  }

  function artifactsSegment(uid) {
    return head('Artifacts') +
      '<div class="sp-rail"><div class="sp-seg">' +
        ['All', 'diff', 'test', 'cost_usage', 'lineage'].map(function (s, i) {
          return '<button type="button"' + (i === 0 ? ' class="active"' : '') + ' data-toast="Filter ' + s + '">' + s + '</button>';
        }).join('') + '</div></div>' +
      '<div class="sp-list">' + artRows() + '</div>';
  }

  function artifactsSheet(uid) {
    return head('Artifacts') +
      '<div class="sp-list">' + artRows() + '</div>' +
      '<div class="sp-sheet open">' +
        '<h3>Goal #482 usage</h3>' +
        '<p>cost_usage · parent totals + child links<br>Estimated Cost when derived · demand-load preview</p>' +
        '<div style="display:flex;gap:var(--sm);flex-wrap:wrap">' +
          '<button class="sp-btn primary" data-toast="Show in Ledger">Ledger</button>' +
          '<button class="sp-btn" data-toast="Show in Usage">Usage</button>' +
        '</div>' +
      '</div>';
  }

  function artifactsToolbar(uid) {
    return head('Artifacts') +
      '<div class="sp-rail">' +
        '<div style="display:flex;gap:2px">' +
          '<button type="button" class="sp-iconbtn" data-toast="Refresh index">' + I('refresh') + '</button>' +
          '<button type="button" class="sp-iconbtn" data-sprout-menu="' + uid + '-type">' + I('filter') + '</button>' +
          '<div id="' + uid + '-type" class="sp-sprout-menu">' +
            ['all'].concat(SPData.artifacts.types).map(function (t) {
              return '<button type="button" class="sp-sprout-item" data-value="' + esc(t) + '" data-label="' + esc(t) + '">' + esc(t) + '</button>';
            }).join('') +
          '</div>' +
          '<button type="button" class="sp-iconbtn" data-sprout-menu="' + uid + '-more">' + I('more') + '</button>' +
          '<div id="' + uid + '-more" class="sp-sprout-menu">' +
            '<button type="button" class="sp-sprout-item" data-value="recover" data-label="Recover index">Recover index</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sp-list">' + artRows() + '</div>';
  }

  function artifactsSpine(uid) {
    return head('Artifacts') +
      '<div class="sp-panel-inner">' +
        '<div class="sp-spine">' +
          ['All', 'diff', 'test', 'cost', 'trace'].map(function (s, i) {
            return '<button type="button"' + (i === 0 ? ' class="active"' : '') + ' title="' + s + '" data-toast="' + s + '">' + I('artifacts', 14) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="sp-spine-main"><div class="sp-list">' + artRows() + '</div></div>' +
      '</div>';
  }

  function artifactsLadder(uid) {
    return head('Artifacts', sprout(uid + '-type', 'All types', ['All types'].concat(SPData.artifacts.types), 'filter')) +
      '<div class="sp-body layout-ladder">' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Recent</span><span class="count">' + SPData.artifacts.rows.length + '</span></button>' +
        '<div class="sp-ladder-body open">' + artRows() + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>cost_usage</span><span class="count">' + SPData.artifacts.rows.filter(function (r) { return r.type === 'cost_usage'; }).length + '</span></button>' +
        '<div class="sp-ladder-body">' + artRows('cost_usage') + '</div>' +
        '<button type="button" class="sp-ladder-h" data-ladder><span>Types (' + SPData.artifacts.types.length + ')</span><span class="count">MVP</span></button>' +
        '<div class="sp-ladder-body" style="padding:var(--md)">' +
          '<p style="margin:0;font-size:var(--fs-2xs);color:var(--text-muted);line-height:1.5">' + esc(SPData.artifacts.types.join(' · ')) + '</p>' +
        '</div>' +
      '</div>';
  }

  var LAYOUTS = {
    stacked: {
      search: searchStacked, source: sourceStacked, actions: actionsStacked,
      docker: dockerStacked, tests: testsStacked, agents: agentsStacked, artifacts: artifactsStacked
    },
    segment: {
      search: searchSegment, source: sourceSegment, actions: actionsSegment,
      docker: dockerSegment, tests: testsSegment, agents: agentsSegment, artifacts: artifactsSegment
    },
    sheet: {
      search: searchSheet, source: sourceSheet, actions: actionsSheet,
      docker: dockerSheet, tests: testsSheet, agents: agentsSheet, artifacts: artifactsSheet
    },
    toolbar: {
      search: searchToolbar, source: sourceToolbar, actions: actionsToolbar,
      docker: dockerToolbar, tests: testsToolbar, agents: agentsToolbar, artifacts: artifactsToolbar
    },
    spine: {
      search: searchSpine, source: sourceSpine, actions: actionsSpine,
      docker: dockerSpine, tests: testsSpine, agents: agentsSpine, artifacts: artifactsSpine
    },
    ladder: {
      search: searchLadder, source: sourceLadder, actions: actionsLadder,
      docker: dockerLadder, tests: testsLadder, agents: agentsLadder, artifacts: artifactsLadder
    }
  };

  var LAYOUT_CLASS = {
    stacked: 'layout-stacked',
    segment: 'layout-segment',
    sheet: 'layout-sheet',
    toolbar: 'layout-toolbar',
    spine: 'layout-spine',
    ladder: 'layout-ladder'
  };

  function renderPanel(panelId, layout, uid) {
    uid = uid || (panelId + '-' + layout);
    var fns = LAYOUTS[layout];
    if (!fns || !fns[panelId]) return '<div class="sp-panel"><div class="sp-head"><h1>Missing</h1></div></div>';
    var cls = 'sp-panel ' + (LAYOUT_CLASS[layout] || '');
    return '<div class="' + cls + '" data-panel="' + panelId + '" id="panel-' + uid + '">' + fns[panelId](uid) + '</div>';
  }

  function renderAllPanels(layout, prefix) {
    prefix = prefix || layout;
    return SPData.panels.map(function (p) {
      return renderPanel(p.id, layout, prefix + '-' + p.id);
    }).join('');
  }

  global.SPPanels = {
    render: renderPanel,
    renderAll: renderAllPanels,
    layouts: Object.keys(LAYOUTS),
    layoutClass: LAYOUT_CLASS
  };
})(window);
