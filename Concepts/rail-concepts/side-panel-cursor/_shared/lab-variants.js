/* 42 unique lab concepts — one visual/IA idea each, not layout-wrapper clones. */
(function (global) {
  var I = function (n, s) { return SPIcons.svg(n, s); };
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function chip(t, k) {
    return '<span class="sp-chip' + (k ? ' ' + k : '') + '">' + esc(t) + '</span>';
  }
  function head(title, trail) {
    return '<div class="sp-head"><h1>' + esc(title) + '</h1>' + (trail || '') + '</div>';
  }
  function sprout(id, label, items, cmd) {
    var opts = items.map(function (it, i) {
      var v = typeof it === 'string' ? it : it.value;
      var lab = typeof it === 'string' ? it : it.label;
      return '<button type="button" class="sp-sprout-item" role="option" data-value="' + esc(v) + '" data-label="' + esc(lab) + '" aria-checked="' + (i === 0 ? 'true' : 'false') + '">' + esc(lab) + '</button>';
    }).join('');
    return '<button type="button" class="sp-sprout-trigger" data-sprout-menu="' + id + '" data-cmd="' + esc(cmd || 'select') + '"><span class="sp-sprout-label">' + esc(label) + '</span><span class="sp-sprout-chev">' + I('chev', 10) + '</span></button><div id="' + id + '" class="sp-sprout-menu">' + opts + '</div>';
  }
  function wrap(uid, panel, skin, html) {
    return '<div class="sp-panel lab-skin-' + skin + ' active" data-panel="' + panel + '" id="panel-' + uid + '">' + html + '</div>';
  }

  /* ========== SEARCH (6) ========== */
  function search_rail(uid) {
    var hits = SPData.search.hits.map(function (f) {
      return '<div class="lab-file-block"><div class="lab-file-path elide">' + esc(f.file) + '<span class="lab-count">' + f.count + '</span></div>' +
        f.lines.map(function (ln) {
          return '<button type="button" class="lab-hit" data-toast="OpenFile → ' + esc(f.file) + ':' + ln.ln + '"><span class="ln">' + ln.ln + '</span><span class="code mono elide">' + esc(ln.text) + '</span></button>';
        }).join('') + '</div>';
    }).join('');
    return wrap(uid, 'search', 'rail',
      head('Search', chip('Ready', 'ok')) +
      '<div class="sp-rail lab-tight"><input class="sp-input" value="quantity" placeholder="Search…">' +
        '<div class="lab-flagrow">' +
          '<button type="button" class="sp-iconbtn" data-toggle="flag" title="Regex">.*</button>' +
          '<button type="button" class="sp-iconbtn" data-toggle="flag" title="Case">Aa</button>' +
          '<button type="button" class="sp-iconbtn" data-toggle="flag" title="Word">Ab</button>' +
          sprout(uid + '-sc', 'All Files', SPData.search.scopes, 'cmd.search.set_scope') +
        '</div></div>' +
      '<div class="sp-list lab-hits">' + hits + '</div>' +
      '<div class="sp-footer"><button class="sp-btn" data-toast="Replace">Replace</button><button class="sp-btn primary" data-toast="Replace all">Replace all</button></div>');
  }
  function search_dock(uid) {
    var lines = [];
    SPData.search.hits.forEach(function (f) {
      f.lines.forEach(function (ln) {
        lines.push('<div class="lab-dock-row" data-toast="Open ' + esc(f.file) + ':' + ln.ln + '"><div class="lab-dock-meta elide">' + esc(f.file.split('/').pop()) + ':' + ln.ln + '</div><div class="mono elide">' + esc(ln.text) + '</div></div>');
      });
    });
    return wrap(uid, 'search', 'dock',
      head('Search', '<span class="lab-eyebrow">' + SPData.searchStats().hits + ' matches</span>') +
      '<div class="sp-list lab-dock-list">' + lines.join('') + '</div>' +
      '<div class="lab-dock-bar">' +
        '<input class="sp-input" value="quantity">' +
        '<div class="lab-flagrow">' + sprout(uid + '-sc', 'All Files', SPData.search.scopes, 'scope') +
          '<button class="sp-btn primary" data-toast="Replace all">Replace</button></div>' +
      '</div>');
  }
  function search_path_tree(uid) {
    // Path-compressed outline: group by first two path segments with hit heat
    var roots = {};
    SPData.search.hits.forEach(function (f) {
      var parts = f.file.split('/');
      var key = parts.length >= 2 ? parts[0] + '/' + parts[1] : parts[0] || '(root)';
      if (!roots[key]) roots[key] = { files: [], hits: 0 };
      roots[key].files.push(f);
      roots[key].hits += f.count || (f.lines && f.lines.length) || 0;
    });
    var keys = Object.keys(roots);
    var max = 1;
    keys.forEach(function (k) { if (roots[k].hits > max) max = roots[k].hits; });
    var tree = keys.map(function (k, i) {
      var g = roots[k];
      var heat = Math.max(18, Math.round((g.hits / max) * 100));
      return '<details class="lab-tree lab-path-heat"' + (i === 0 ? ' open' : '') + '>' +
        '<summary><span class="lab-heat" style="--heat:' + heat + '%"></span>' +
        '<span class="elide">' + esc(k) + '</span>' + chip(String(g.hits), 'info') + '</summary>' +
        g.files.map(function (f) {
          var leaf = f.file.split('/').slice(2).join('/') || f.file;
          return '<button type="button" class="lab-path-file" data-toast="Open ' + esc(f.file) + '">' +
            '<span class="elide">' + esc(leaf) + '</span>' + chip(String(f.count), 'info') + '</button>' +
            f.lines.map(function (ln) {
              return '<button type="button" class="lab-hit nested" data-toast="OpenFile">' +
                '<span class="ln">' + ln.ln + '</span><span class="code mono elide">' + esc(ln.text) + '</span></button>';
            }).join('');
        }).join('') + '</details>';
    }).join('');
    return wrap(uid, 'search', 'path-tree',
      head('Path map', chip(String(keys.length) + ' folders', 'info')) +
      '<div class="sp-rail"><input class="sp-input" value="quantity">' + sprout(uid + '-sc', 'All Files', SPData.search.scopes, 'scope') + '</div>' +
      '<div class="sp-list">' + tree + '</div>');
  }
  function search_match_tape(uid) {
    var stats = SPData.searchStats();
    var tape = [];
    SPData.search.hits.forEach(function (f) {
      f.lines.forEach(function (ln) {
        tape.push('<div class="lab-tape-item" data-toast="Open ' + esc(f.file) + ':' + ln.ln + '">' +
          '<div class="lab-tape-file elide">' + esc(f.file) + '</div>' +
          '<div class="lab-tape-code mono"><span class="ln">' + ln.ln + '</span> ' + esc(ln.text) + '</div></div>');
      });
    });
    return wrap(uid, 'search', 'match-tape',
      '<div class="lab-tape-head">' +
        '<div class="lab-tape-stat"><b>' + stats.hits + '</b><span>hits</span></div>' +
        '<div class="lab-tape-stat"><b>' + stats.files + '</b><span>files</span></div>' +
        '<div class="lab-tape-stat"><b>Ready</b><span>index</span></div>' +
      '</div>' +
      '<div class="sp-rail lab-tight"><input class="sp-input" value="quantity"></div>' +
      '<div class="sp-list lab-tape">' + tape.join('') + '</div>');
  }
  function search_scope_ribbon(uid) {
    var scopes = SPData.search.scopes;
    var stats = SPData.searchStats();
    var moreFiles = Math.max(0, stats.files - 1);
    return wrap(uid, 'search', 'scope-ribbon',
      head('Search', chip('tantivy', 'info')) +
      '<div class="lab-ribbon-wrap">' +
        '<div class="lab-ribbon">' + scopes.map(function (s, i) {
          return '<button type="button" class="lab-ribbon-btn' + (i === 0 ? ' active' : '') + '" data-toast="Scope ' + esc(s) + '" title="' + esc(s) + '">' + esc(s.split(' ')[0]) + '</button>';
        }).join('') + '</div>' +
        '<div class="lab-ribbon-main">' +
          '<input class="sp-input" value="quantity" style="margin-bottom:var(--sm)">' +
          '<div class="sp-list">' + SPData.search.hits[0].lines.map(function (ln) {
            return '<div class="lab-hit" data-toast="Open"><span class="ln">' + ln.ln + '</span><span class="code mono elide">' + esc(ln.text) + '</span></div>';
          }).join('') +
          (moreFiles ? '<div class="sp-section-label">+ ' + moreFiles + ' more files · ' + stats.hits + ' hits</div>' : '') +
          '</div>' +
        '</div></div>');
  }
  function search_replace_studio(uid) {
    var stats = SPData.searchStats();
    return wrap(uid, 'search', 'replace-studio',
      head('Replace studio', chip(String(stats.hits), 'warn')) +
      '<div class="sp-rail">' +
        '<label class="lab-label">Find</label><input class="sp-input" value="quantity">' +
        '<label class="lab-label">Replace</label><input class="sp-input" value="amount">' +
        sprout(uid + '-sc', 'All Files', SPData.search.scopes, 'scope') +
      '</div>' +
      '<div class="lab-preview-strip">' +
        '<div class="lab-preview-row"><span class="lab-was mono">quantity</span><span class="lab-arrow">→</span><span class="lab-now mono">amount</span></div>' +
        '<div class="lab-preview-meta">Preview · ' + stats.hits + ' replacements across ' + stats.files + ' files</div>' +
      '</div>' +
      '<div class="sp-list">' + SPData.search.hits.map(function (f) {
        return '<div class="sp-row"><span class="primary elide">' + esc(f.file) + '</span>' + chip(String(f.count), 'info') + '</div>';
      }).join('') + '</div>' +
      '<div class="sp-footer"><button class="sp-btn" data-toast="Replace selected">Selected</button><button class="sp-btn primary" data-toast="Replace all">All</button></div>');
  }

  /* ========== SOURCE (6) ========== */
  function source_changes(uid) {
    return wrap(uid, 'source', 'changes-stack',
      head('Source', chip('dirty', 'warn')) +
      '<div class="sp-rail">' + sprout(uid + '-br', 'main', SPData.source.branches, 'branch') + '</div>' +
      '<div class="sp-list">' +
        '<div class="sp-section-label">Staged</div>' + SPData.source.staged.map(function (f) {
          return '<div class="sp-row"><span class="primary elide">' + esc(f.path) + '</span>' + chip(f.status, 'ok') + '</div>';
        }).join('') +
        '<div class="sp-section-label">Unstaged</div>' + SPData.source.unstaged.map(function (f) {
          return '<div class="sp-row"><span class="primary elide">' + esc(f.path) + '</span>' + chip(f.status, 'warn') + '<button class="sp-minibtn" data-toast="Stage">+</button></div>';
        }).join('') +
        '<div class="sp-section-label">Untracked</div>' + SPData.source.untracked.map(function (f) {
          return '<div class="sp-row"><span class="primary elide">' + esc(f.path) + '</span>' + chip(f.status, 'info') + '</div>';
        }).join('') +
        '<div class="sp-section-label">Conflicts</div>' + SPData.source.conflicts.map(function (f) {
          return '<div class="lab-conflict-row"><span class="primary elide">' + esc(f.path) + '</span><button class="sp-btn" data-toast="Conflict Assistant">Assist</button></div>';
        }).join('') +
      '</div>' +
      '<div class="sp-footer"><input class="sp-input" placeholder="Commit message…" style="flex:1 1 100%"><button class="sp-btn primary" data-toast="Commit">Commit</button></div>');
  }
  function source_worktree_first(uid) {
    return wrap(uid, 'source', 'worktree-first',
      head('Worktrees', sprout(uid + '-filt', 'All', ['All', 'Threads', 'Orchestrator', 'Manual'], 'filter')) +
      '<div class="sp-list">' + SPData.source.worktrees.map(function (w) {
        return '<button type="button" class="lab-wt-card" data-sheet-title="' + esc(w.name) + '" data-sheet-body="' + esc(w.owner) + ' · ' + esc(w.status) + '">' +
          '<div class="lab-wt-top"><span class="lab-wt-name elide">' + esc(w.name) + '</span>' + chip(w.status, w.status === 'clean' ? 'ok' : 'warn') + '</div>' +
          '<div class="lab-wt-owner elide">' + esc(w.owner) + '</div></button>';
      }).join('') + '</div>' +
      '<div class="sp-sheet open"><h3>orch/lane-b-api</h3><p>Open · Compare · Review · PR</p>' +
        '<div class="lab-btnrow"><button class="sp-btn primary" data-toast="Open">Open</button><button class="sp-btn" data-toast="Compare">Compare</button></div></div>');
  }
  function source_commit_composer(uid) {
    return wrap(uid, 'source', 'commit-composer',
      '<div class="lab-composer">' +
        '<div class="lab-composer-label">Commit on main</div>' +
        '<textarea class="lab-textarea" rows="3" placeholder="Commit message…">Normalize quantity parsing</textarea>' +
        '<div class="lab-btnrow"><button class="sp-btn" data-toast="AI message">AI</button><button class="sp-btn primary" data-toast="Commit">Commit ' + SPData.changeCount() + ' files</button></div>' +
      '</div>' +
      '<div class="sp-list">' +
        SPData.source.staged.concat(SPData.source.unstaged).map(function (f) {
          return '<label class="lab-check-row"><input type="checkbox" checked> <span class="elide">' + esc(f.path) + '</span>' + chip(f.status) + '</label>';
        }).join('') +
      '</div>');
  }
  function source_traffic(uid) {
    return wrap(uid, 'source', 'traffic',
      head('Sync', sprout(uid + '-br', 'main', SPData.source.branches, 'branch')) +
      '<div class="lab-traffic">' +
        '<div class="lab-traffic-cell"><b>2</b><span>ahead</span></div>' +
        '<div class="lab-traffic-cell"><b>1</b><span>behind</span></div>' +
        '<div class="lab-traffic-cell warn"><b>1</b><span>conflict</span></div>' +
      '</div>' +
      '<div class="lab-btnrow pad"><button class="sp-btn" data-toast="Fetch">Fetch</button><button class="sp-btn" data-toast="Pull">Pull</button><button class="sp-btn primary" data-toast="Push">Push</button></div>' +
      '<div class="sp-list"><div class="sp-section-label">Local changes</div>' +
        SPData.source.unstaged.concat(SPData.source.conflicts).map(function (f) {
          return '<div class="sp-row"><span class="primary elide">' + esc(f.path) + '</span>' + chip(f.status, f.status === 'UU' ? 'err' : 'warn') + '</div>';
        }).join('') + '</div>');
  }
  function source_conflict_radar(uid) {
    var n = SPData.source.conflicts.length;
    return wrap(uid, 'source', 'conflict-radar',
      '<div class="lab-radar-banner"><strong>' + n + ' conflict' + (n === 1 ? '' : 's') + '</strong> block sync · Assist ready</div>' +
      '<div class="lab-radar-map">' + SPData.source.conflicts.map(function (f, i) {
        return '<div class="lab-radar-blip" style="--i:' + i + '"><span class="lab-radar-ring"></span><span class="elide">' + esc(f.path.split('/').slice(-2).join('/')) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="sp-list">' +
        SPData.source.conflicts.map(function (f) {
          return '<div class="lab-radar-item"><div class="elide">' + esc(f.path) + '</div>' +
            '<div class="lab-btnrow"><button class="sp-btn primary" data-toast="Conflict Assistant">Resolve</button>' +
            '<button class="sp-btn" data-toast="Ours">Ours</button><button class="sp-btn" data-toast="Theirs">Theirs</button></div></div>';
        }).join('') +
        '<div class="sp-section-label">Safe to stage later</div>' +
        SPData.source.staged.concat(SPData.source.unstaged).slice(0, 6).map(function (f) {
          return '<div class="sp-row"><span class="primary elide">' + esc(f.path) + '</span>' + chip(f.status) + '</div>';
        }).join('') +
      '</div>');
  }
  function source_graph_strip(uid) {
    return wrap(uid, 'source', 'graph-strip',
      head('Graph', chip('compact', 'info')) +
      '<div class="lab-graph">' +
        SPData.source.history.map(function (h, i) {
          return '<div class="lab-graph-node"><span class="lab-dot' + (i === 0 ? ' tip' : '') + '"></span>' +
            '<div><div class="mono">' + esc(h.hash) + '</div><div class="elide">' + esc(h.msg) + '</div></div>' +
            '<span class="lab-age">' + esc(h.age) + '</span></div>';
        }).join('') +
      '</div>' +
      '<div class="sp-section-label">Worktree overlay</div>' +
      '<div class="sp-list">' + SPData.source.worktrees.map(function (w) {
        return '<div class="sp-row"><span class="primary elide">' + esc(w.name) + '</span>' + chip(w.status) + '</div>';
      }).join('') + '</div>');
  }

  /* ========== ACTIONS (6) ========== */
  function actions_branch_pulse(uid) {
    return wrap(uid, 'actions', 'branch-pulse',
      '<div class="lab-pulse-hero"><div class="lab-pulse-kicker">Current Branch</div><div class="lab-pulse-title">main</div>' +
        '<div class="lab-pulse-meta">Readiness ok · view + dispatch</div></div>' +
      '<div class="sp-list">' + SPData.actions.runs.map(function (r) {
        var k = r.status === 'passed' ? 'ok' : r.status === 'failed' ? 'err' : 'warn';
        return '<div class="sp-row"><span class="lab-status-dot ' + k + '"></span><span class="primary elide">' + esc(r.name) + '</span>' + chip(r.status, k) + '</div>';
      }).join('') + '</div>' +
      '<div class="sp-footer"><button class="sp-btn primary" data-toast="Dispatch">Dispatch</button></div>');
  }
  function actions_run_ticker(uid) {
    // Live event tape: stacked status events with mute/pin, not a plain age list
    var events = [];
    SPData.actions.runs.forEach(function (r) {
      var k = r.status === 'passed' ? 'ok' : r.status === 'failed' ? 'err' : r.status === 'waiting' ? 'warn' : 'info';
      events.push({ age: r.age, name: r.name, status: r.status, k: k, pin: r.pin, blocked: r.blocked });
      if (r.blocked) events.push({ age: r.age, name: 'blocked · ' + r.blocked, status: 'gate', k: 'warn', pin: false, blocked: null });
    });
    return wrap(uid, 'actions', 'run-ticker',
      head('Live tape', '<span class="lab-live-pill"><span class="lab-watch-dot"></span> streaming</span>') +
      '<div class="lab-tape-tools">' +
        '<button type="button" class="sp-minibtn active" title="Pin filter" data-toggle="flag">' + I('pin', 12) + '</button>' +
        '<button type="button" class="sp-minibtn" title="Mute noise" data-toast="Mute passed">Mute</button>' +
        '<span class="lab-sub">' + events.length + ' events</span></div>' +
      '<div class="sp-list lab-ticker lab-event-tape">' + events.map(function (e) {
        return '<div class="lab-ticker-row lab-event-' + e.k + '">' +
          '<span class="lab-ticker-age">' + esc(e.age) + '</span>' +
          '<span class="lab-status-dot ' + e.k + '"></span>' +
          '<span class="elide">' + esc(e.name) + '</span>' +
          (e.pin ? '<span class="lab-pin-mark">' + I('pin', 10) + '</span>' : '') +
          '</div>';
      }).join('') + '</div>');
  }
  function actions_triage_desk(uid) {
    var failed = SPData.actions.runs.filter(function (r) { return r.status === 'failed' || r.status === 'waiting'; });
    return wrap(uid, 'actions', 'triage-desk',
      head('Triage', chip(String(failed.length), 'err')) +
      '<div class="sp-list">' + failed.map(function (r) {
        return '<div class="lab-triage-card"><div class="lab-triage-title">' + esc(r.name) + '</div>' +
          '<div class="lab-triage-body">' + (r.blocked ? 'Blocked · ' + esc(r.blocked) + ' (wait ≠ failure)' : 'Failing step · docker bake') + '</div>' +
          '<div class="lab-btnrow"><button class="sp-btn primary" data-toast="Logs">Logs</button><button class="sp-btn" data-toast="Replay">Replay</button><button class="sp-btn" data-toast="Code">Code</button></div></div>';
      }).join('') + '</div>');
  }
  function actions_pin_board(uid) {
    var pins = SPData.actions.runs.filter(function (r) { return r.pin; });
    var workflows = SPData.actions.workflows;
    return wrap(uid, 'actions', 'pin-board',
      head('Pin board', chip(String(pins.length) + ' pinned', 'info')) +
      '<div class="lab-pin-board">' + pins.map(function (r) {
        var k = r.status === 'passed' ? 'ok' : r.status === 'failed' ? 'err' : 'warn';
        return '<button type="button" class="lab-pin-tile ' + k + '" data-toast="' + esc(r.name) + '">' +
          '<span class="lab-pin-mark">' + I('pin', 10) + '</span>' +
          '<b class="elide">' + esc(r.name) + '</b>' +
          '<span class="lab-sub">' + esc(r.status) + ' · ' + esc(r.age) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="sp-section-label">Workflow inventory</div>' +
      '<div class="sp-list">' + workflows.map(function (w) {
        return '<div class="sp-row"><span class="primary elide">' + esc(w.name) + '</span>' + chip(w.health, w.health === 'ok' ? 'ok' : 'warn') +
          '<button class="sp-minibtn" data-toast="Pin ' + esc(w.name) + '">' + I('pin', 12) + '</button></div>';
      }).join('') + '</div>');
  }
  function actions_dispatch_pad(uid) {
    return wrap(uid, 'actions', 'dispatch-pad',
      head('Dispatch') +
      '<div class="sp-rail">' +
        sprout(uid + '-wf', 'ci.yml', ['ci.yml', 'publish.yml', 'e2e.yml'], 'workflow') +
        '<label class="lab-label">Branch</label>' + sprout(uid + '-br', 'main', SPData.source.branches, 'branch') +
        '<label class="lab-label">Inputs</label><input class="sp-input" placeholder="ref = main">' +
      '</div>' +
      '<div class="lab-dispatch-cta"><button class="sp-btn primary lab-big" data-toast="workflow_dispatch">Run workflow</button></div>' +
      '<div class="sp-list"><div class="sp-section-label">Capability</div>' +
        '<div class="sp-row"><span class="primary">Effective</span>' + chip('view + dispatch', 'info') + '</div></div>');
  }
  function actions_settings_ledger(uid) {
    return wrap(uid, 'actions', 'settings-ledger',
      head('Settings', chip('view-only secrets', 'warn')) +
      '<div class="sp-list lab-ledger">' + SPData.actions.settings.map(function (s) {
        return '<div class="lab-ledger-row"><div class="lab-ledger-k">' + esc(s.k) + '</div><div class="lab-ledger-v">' + esc(s.v) + '</div></div>';
      }).join('') + '</div>');
  }

  /* ========== DOCKER (6) ========== */
  function docker_fleet(uid) {
    return wrap(uid, 'docker', 'fleet',
      head('Fleet', sprout(uid + '-rt', 'Docker', ['Docker', 'Podman'], 'runtime')) +
      '<div class="sp-list">' + SPData.docker.containers.map(function (c) {
        var k = c.state === 'running' ? 'ok' : 'err';
        return '<div class="lab-fleet-row state-' + k + '" data-toast="' + esc(c.name) + '">' +
          '<div class="lab-fleet-rail"></div><div class="lab-fleet-body"><div class="elide">' + esc(c.name) + '</div>' +
          '<div class="lab-sub elide">' + esc(c.image) + '</div></div>' + chip(c.state, k) +
          '<button class="sp-minibtn" data-sprout-menu="lab-dc-' + esc(c.name) + '">' + I('more', 12) + '</button>' +
          '<div id="lab-dc-' + esc(c.name) + '" class="sp-sprout-menu">' +
            '<button class="sp-sprout-item" data-value="logs" data-label="Logs">Logs</button>' +
            '<button class="sp-sprout-item" data-value="shell" data-label="Shell">Shell</button>' +
            '<button class="sp-sprout-item" data-value="stop" data-label="Stop">Stop</button></div></div>';
      }).join('') + '</div>');
  }
  function docker_compose_map(uid) {
    return wrap(uid, 'docker', 'compose-map',
      head('Compose', chip(String(SPData.docker.compose.length) + ' services', 'info')) +
      '<div class="lab-compose-grid">' + SPData.docker.compose.map(function (c) {
        var k = c.state === 'up' ? 'ok' : 'warn';
        return '<button type="button" class="lab-compose-tile ' + k + '" data-toast="' + esc(c.name) + '"><b>' + esc(c.name) + '</b><span>' + esc(c.state) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="lab-btnrow pad"><button class="sp-btn" data-toast="Down">Down</button><button class="sp-btn primary" data-toast="Up">Up</button></div>');
  }
  function docker_runtime_switch(uid) {
    // Capability sheet: Docker vs Podman diffs, then filtered fleet
    var caps = [
      { k: 'Compose', docker: 'native', podman: 'compose plugin' },
      { k: 'Rootless', docker: 'optional', podman: 'default' },
      { k: 'Unraid publish', docker: 'supported', podman: 'limited' },
      { k: 'BuildKit', docker: 'yes', podman: 'buildah' },
      { k: 'Socket', docker: '/var/run/docker.sock', podman: 'user podman.sock' }
    ];
    return wrap(uid, 'docker', 'runtime-switch',
      head('Runtime', chip('Docker active', 'ok')) +
      '<div class="lab-rt-toggle">' +
        '<button type="button" class="active" data-toast="Docker">Docker</button>' +
        '<button type="button" data-toast="Podman">Podman</button></div>' +
      '<div class="lab-cap-sheet">' +
        '<div class="lab-cap-h"><span></span><span>Docker</span><span>Podman</span></div>' +
        caps.map(function (c) {
          return '<div class="lab-cap-row"><span class="lab-cap-k elide">' + esc(c.k) + '</span>' +
            '<span class="lab-cap-v elide">' + esc(c.docker) + '</span>' +
            '<span class="lab-cap-v muted elide">' + esc(c.podman) + '</span></div>';
        }).join('') +
      '</div>' +
      '<div class="sp-section-label">Visible under Docker · ' + SPData.docker.containers.length + '</div>' +
      '<div class="sp-list">' + SPData.docker.containers.slice(0, 8).map(function (c) {
        return '<div class="sp-row"><span class="primary elide">' + esc(c.name) + '</span>' + chip(c.state, c.state === 'running' ? 'ok' : 'err') + '</div>';
      }).join('') +
        '<div class="sp-section-label">+ ' + Math.max(0, SPData.docker.containers.length - 8) + ' more filtered by runtime</div></div>');
  }
  function docker_ops_console(uid) {
    return wrap(uid, 'docker', 'ops-console',
      head('Ops', chip('api', 'ok')) +
      '<div class="sp-list">' + SPData.docker.containers.map(function (c, i) {
        return '<div class="sp-row' + (i === 0 ? ' selected' : '') + '" data-sheet-title="' + esc(c.name) + '" data-sheet-body="' + esc(c.image) + '"><span class="primary elide">' + esc(c.name) + '</span>' + chip(c.state, c.state === 'running' ? 'ok' : 'err') + '</div>';
      }).join('') + '</div>' +
      '<div class="sp-sheet open lab-console-sheet"><h3>tastebook-api</h3>' +
        '<pre class="lab-log mono">listening :8080\nhealth ok\nreq GET /recipes 200</pre>' +
        '<div class="lab-btnrow"><button class="sp-btn" data-toast="Shell">Shell</button><button class="sp-btn" data-toast="Inspect">Inspect</button><button class="sp-btn" data-toast="Stop">Stop</button></div></div>');
  }
  function docker_image_shelf(uid) {
    return wrap(uid, 'docker', 'image-shelf',
      head('Images') +
      '<div class="sp-list">' + SPData.docker.images.map(function (im) {
        var pct = im.name.indexOf('postgres') >= 0 ? 90 : im.name.indexOf('api') >= 0 ? 40 : 15;
        return '<div class="lab-img-row"><div class="elide">' + esc(im.name) + '</div>' +
          '<div class="lab-bar"><span style="width:' + pct + '%"></span></div><span class="lab-size">' + esc(im.size) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="sp-footer"><button class="sp-btn" data-toast="Prune">Prune</button><button class="sp-btn primary" data-toast="Pull">Pull</button></div>');
  }
  function docker_publish_chain(uid) {
    var steps = ['Auth (requested vs effective)', 'Protected repo check', 'Build / Bake', 'Push registry', 'Unraid template', 'Publish receipt'];
    return wrap(uid, 'docker', 'publish-chain',
      head('Publish / Unraid') +
      '<div class="lab-chain">' + steps.map(function (s, i) {
        return '<div class="lab-chain-step' + (i < 2 ? ' done' : i === 2 ? ' current' : '') + '"><span class="lab-chain-n">' + (i + 1) + '</span><span>' + esc(s) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="sp-footer"><button class="sp-btn primary" data-toast="Continue publish">Continue</button></div>');
  }

  /* ========== TESTS (6) ========== */
  function tests_run_board(uid) {
    return wrap(uid, 'tests', 'run-board',
      head('Testing', sprout(uid + '-pol', 'Auto', ['Auto', 'On', 'Off'], 'policy')) +
      '<div class="lab-btnrow pad"><button class="sp-btn primary" data-toast="Run">' + I('play', 12) + ' Run</button><button class="sp-btn" data-toast="Watch">Watch</button><button class="sp-btn" data-toast="Cancel">Cancel</button></div>' +
      '<div class="sp-list">' + SPData.tests.runs.map(function (r) {
        return '<div class="sp-row"><span class="primary elide">' + esc(r.label) + '</span>' + chip(r.status, r.status === 'passed' ? 'ok' : 'err') + '</div>';
      }).join('') + '</div>');
  }
  function tests_failure_first(uid) {
    return wrap(uid, 'tests', 'failure-first',
      '<div class="lab-fail-hero"><b>' + SPData.tests.failures.length + ' failures</b> · last run ' + esc(SPData.tests.lastStatus) + ' · redaction ok</div>' +
      '<div class="sp-list">' + SPData.tests.failures.map(function (f) {
        return '<button type="button" class="lab-fail-row" data-toast="Open failure ' + esc(f.file) + '"><div class="elide">' + esc(f.test) + '</div><div class="mono lab-sub">' + esc(f.file) + '</div></button>';
      }).join('') + '</div>' +
      '<div class="sp-footer"><button class="sp-btn" data-toast="Receipt">Receipt</button><button class="sp-btn primary" data-toast="Re-run">Re-run</button></div>');
  }
  function tests_receipt_card(uid) {
    return wrap(uid, 'tests', 'receipt-card',
      '<div class="lab-receipt"><div class="lab-receipt-status err">FAILED</div>' +
        '<div class="lab-receipt-id mono">tr-1842</div>' +
        '<div class="lab-receipt-title">import worker suite</div>' +
        '<div class="lab-receipt-meta">6m ago · policy Auto · runtime ready</div>' +
        '<div class="lab-btnrow"><button class="sp-btn" data-toast="Open receipt">Open receipt</button><button class="sp-btn primary" data-toast="Export">Export</button></div></div>' +
      '<div class="sp-section-label">Failures</div>' +
      '<div class="sp-list">' + SPData.tests.failures.map(function (f) {
        return '<div class="sp-row"><span class="primary elide">' + esc(f.test) + '</span></div>';
      }).join('') + '</div>');
  }
  function tests_watch_strip(uid) {
    var running = SPData.tests.runs.filter(function (r) { return r.status === 'failed' || r.status === 'passed'; }).length;
    var failed = SPData.tests.failures.length;
    return wrap(uid, 'tests', 'watch-strip',
      '<div class="lab-watch-hud">' +
        '<div class="lab-watch-top"><span class="lab-watch-dot"></span><b>Watching</b>' +
          '<button class="sp-btn" data-toast="Cancel watch">Cancel</button></div>' +
        '<div class="lab-watch-meters">' +
          '<div class="lab-meter"><span class="lab-meter-fill" style="width:62%"></span></div>' +
          '<div class="lab-watch-stats"><span>queue 3</span><span class="ok">pass ' + Math.max(0, running - 2) + '</span><span class="err">fail ' + failed + '</span></div>' +
        '</div></div>' +
      '<div class="lab-tick-stream">' +
        '<div class="lab-tick ok">api unit · passed</div>' +
        '<div class="lab-tick err">parse_quantity_mixed_fraction · failed</div>' +
        '<div class="lab-tick ok">search index boost · passed</div>' +
        '<div class="lab-tick warn">panel width 220 stress · queued</div>' +
      '</div>' +
      '<div class="sp-section-label">Live failures</div>' +
      '<div class="sp-list">' + SPData.tests.failures.map(function (f) {
        return '<div class="sp-row"><span class="primary elide">' + esc(f.test) + '</span><span class="secondary mono elide">' + esc(f.file) + '</span></div>';
      }).join('') + '</div>');
  }
  function tests_artifact_drawer(uid) {
    // Selection-driven filmstrip: artifacts belong to the selected run
    var runs = SPData.tests.runs;
    var arts = SPData.tests.artifacts;
    return wrap(uid, 'tests', 'artifact-drawer',
      head('Runs → artifacts') +
      '<div class="sp-list lab-run-select">' + runs.map(function (r, i) {
        return '<div class="sp-row' + (i === 0 ? ' selected' : '') + '" data-sheet-title="' + esc(r.label) + '" data-sheet-body="Artifacts for ' + esc(r.id) + ' · redaction ok">' +
          '<span class="primary elide">' + esc(r.label) + '</span>' + chip(r.status, r.status === 'passed' ? 'ok' : 'err') + '</div>';
      }).join('') + '</div>' +
      '<div class="lab-filmstrip">' +
        '<div class="lab-drawer-h">Filmstrip · ' + esc(runs[0].id) + '</div>' +
        '<div class="lab-film-row">' + arts.map(function (a) {
          return '<button type="button" class="lab-film-card" data-toast="Open ' + esc(a) + '"><span class="elide">' + esc(a) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="lab-sub">Selection-driven · secrets stripped</div></div>');
  }
  function tests_policy_gate(uid) {
    var rows = [
      { k: 'Inherited', v: 'Org · Auto on push to main', s: 'ok' },
      { k: 'Override', v: 'Repo · Auto (matches org)', s: 'ok' },
      { k: 'Effective', v: 'Auto · runtime ready', s: 'info' },
      { k: 'Blocked', v: 'production deploy tests · HITL', s: 'warn' },
      { k: 'Prohibited', v: 'none', s: 'ok' }
    ];
    return wrap(uid, 'tests', 'policy-gate',
      head('Policy inspector', chip('Auto', 'info')) +
      '<div class="lab-policy">' +
        '<button type="button" class="active">Auto</button><button type="button" data-toast="On">On</button><button type="button" data-toast="Off">Off</button></div>' +
      '<div class="sp-list lab-policy-inspect">' + rows.map(function (r) {
        return '<div class="lab-policy-row"><div class="lab-ledger-k">' + esc(r.k) + '</div>' +
          '<div class="lab-ledger-v elide">' + esc(r.v) + '</div>' + chip(r.s === 'warn' ? 'gate' : r.s, r.s) + '</div>';
      }).join('') + '</div>' +
      '<div class="sp-footer"><button class="sp-btn" data-toast="Explain gate">Explain</button><button class="sp-btn primary" data-toast="Run">Run allowed</button></div>');
  }

  /* ========== AGENTS (6) ========== */
  function agents_active_pulse(uid) {
    return wrap(uid, 'agents', 'active-pulse',
      head('Active', chip('registry', 'info')) +
      '<div class="sp-list">' + SPData.agents.active.map(function (a) {
        return '<div class="lab-agent-pulse"><span class="lab-pulse-dot ' + (a.status === 'running' ? 'on' : '') + '"></span>' +
          '<div><div class="elide">' + esc(a.name) + '</div><div class="lab-sub">' + esc(a.parent) + '</div></div>' +
          chip(a.status) + '<button class="sp-minibtn" data-toast="Lineage">' + I('lineage', 12) + '</button></div>';
      }).join('') + '</div>');
  }
  function agents_roster(uid) {
    return wrap(uid, 'agents', 'roster',
      head('Available') +
      '<div class="sp-list">' + SPData.agents.available.map(function (a) {
        return '<div class="lab-roster-card"><div class="lab-roster-name">' + esc(a.name) + '</div><div class="lab-sub">' + esc(a.caps) + '</div></div>';
      }).join('') + '</div>' +
      '<div class="sp-footer"><button class="sp-btn" data-toast="Show active">Active (' + SPData.agents.active.length + ')</button></div>');
  }
  function agents_lineage_tree(uid) {
    return wrap(uid, 'agents', 'lineage-tree',
      head('Lineage') +
      '<div class="lab-tree-agents">' +
        '<div class="lab-lin root">Goal #482</div>' +
        '<div class="lab-lin c1">Planner <span class="lab-sub">running</span></div>' +
        '<div class="lab-lin c2">Coder <span class="lab-sub">waiting</span></div>' +
        '<div class="lab-lin c3">Reviewer <span class="lab-sub">idle</span></div>' +
      '</div>' +
      '<div class="sp-footer"><button class="sp-btn primary" data-toast="Open lineage views">Open lineage</button></div>');
  }
  function agents_lane_cards(uid) {
    // Swimlanes by parent goal
    var lanes = {};
    SPData.agents.active.forEach(function (a) {
      var key = a.parent || 'Unassigned';
      if (!lanes[key]) lanes[key] = [];
      lanes[key].push(a);
    });
    return wrap(uid, 'agents', 'lane-cards',
      head('Lanes', chip(String(Object.keys(lanes).length), 'info')) +
      '<div class="sp-list lab-swim">' + Object.keys(lanes).map(function (lane) {
        return '<div class="lab-swim-lane">' +
          '<div class="lab-swim-h elide">' + esc(lane) + '<span class="lab-sub">' + lanes[lane].length + '</span></div>' +
          '<div class="lab-swim-track">' + lanes[lane].map(function (a) {
            var k = a.status === 'running' ? 'ok' : a.status === 'waiting' ? 'warn' : 'info';
            return '<button type="button" class="lab-swim-agent ' + k + '" data-toast="Lineage ' + esc(a.name) + '">' +
              '<span class="elide">' + esc(a.name) + '</span><span class="lab-sub">' + esc(a.status) + '</span></button>';
          }).join('') + '</div></div>';
      }).join('') + '</div>');
  }
  function agents_handoff(uid) {
    var waiting = SPData.agents.active.filter(function (a) { return a.status !== 'running'; });
    return wrap(uid, 'agents', 'handoff',
      '<div class="lab-handoff-banner">Handoff queue · ' + waiting.length + ' waiting</div>' +
      '<div class="sp-list">' + waiting.map(function (a, i) {
        return '<div class="lab-handoff-card">' +
          '<div class="lab-handoff-n">' + (i + 1) + '</div>' +
          '<div class="lab-handoff-body"><div class="elide"><b>' + esc(a.name) + '</b> ← ' + esc(a.parent) + '</div>' +
          '<div class="lab-sub">Needs accept · context pack ready</div>' +
          '<div class="lab-btnrow"><button class="sp-btn primary" data-toast="Accept ' + esc(a.name) + '">Accept</button>' +
          '<button class="sp-btn" data-toast="Defer">Defer</button></div></div></div>';
      }).join('') +
        '<div class="sp-section-label">Still running</div>' +
        SPData.agents.active.filter(function (a) { return a.status === 'running'; }).map(function (a) {
          return '<div class="sp-row"><span class="primary elide">' + esc(a.name) + '</span>' + chip('running', 'ok') + '</div>';
        }).join('') + '</div>');
  }
  function agents_registry_mirror(uid) {
    // Capability matrix: agent × caps
    var caps = ['web', 'ATS', 'compose', 'docs', 'scan', 'tokens'];
    function hasCap(a, c) {
      var s = (a.caps || '').toLowerCase();
      if (c === 'web') return s.indexOf('web') >= 0 || s.indexOf('citation') >= 0;
      if (c === 'ATS') return s.indexOf('ats') >= 0 || s.indexOf('junit') >= 0 || a.name === 'Tester';
      if (c === 'compose') return s.indexOf('compose') >= 0 || s.indexOf('docker') >= 0 || s.indexOf('publish') >= 0;
      if (c === 'docs') return s.indexOf('markdown') >= 0 || s.indexOf('adr') >= 0 || a.name === 'Docs';
      if (c === 'scan') return s.indexOf('secret') >= 0 || s.indexOf('deps') >= 0 || a.name === 'Security';
      if (c === 'tokens') return s.indexOf('token') >= 0 || s.indexOf('density') >= 0 || a.name === 'Designer';
      return false;
    }
    return wrap(uid, 'agents', 'registry-mirror',
      head('Capability matrix', '<span class="lab-eyebrow">registry</span>') +
      '<div class="lab-matrix-wrap">' +
        '<div class="lab-matrix-h"><span class="lab-matrix-corner">Agent</span>' +
          caps.map(function (c) { return '<span title="' + esc(c) + '">' + esc(c.slice(0, 3)) + '</span>'; }).join('') +
        '</div>' +
        SPData.agents.available.map(function (a) {
          return '<div class="lab-matrix-row"><span class="elide">' + esc(a.name) + '</span>' +
            caps.map(function (c) {
              return '<span class="lab-matrix-cell' + (hasCap(a, c) ? ' on' : '') + '" title="' + esc(c) + '">' + (hasCap(a, c) ? '●' : '·') + '</span>';
            }).join('') + '</div>';
        }).join('') +
      '</div>' +
      '<div class="sp-section-label">Local vs remote</div>' +
      '<div class="sp-list">' +
        '<div class="sp-row"><span class="primary">Local registry</span>' + chip(String(SPData.agents.available.length), 'ok') + '</div>' +
        '<div class="sp-row"><span class="primary">Remote mirror</span>' + chip('stale +1', 'warn') + '</div>' +
        '<div class="sp-row"><span class="primary">Delta</span><span class="secondary elide">Designer missing remotely</span></div>' +
      '</div>');
  }

  /* ========== ARTIFACTS (6) ========== */
  function art_type_filter(uid) {
    // Type mosaic: types are primary nav; list shows selected type
    var types = SPData.artifacts.types;
    var counts = {};
    types.forEach(function (t) { counts[t] = 0; });
    SPData.artifacts.rows.forEach(function (r) { counts[r.type] = (counts[r.type] || 0) + 1; });
    var active = 'diff';
    var shown = SPData.artifacts.rows.filter(function (r) { return r.type === active; });
    return wrap(uid, 'artifacts', 'type-filter',
      head('Type mosaic') +
      '<div class="lab-mosaic">' + types.map(function (t) {
        return '<button type="button" class="lab-mosaic-chip' + (t === active ? ' active' : '') + '" data-toast="Filter ' + esc(t) + '">' +
          '<span class="elide">' + esc(t) + '</span><span class="lab-mosaic-n">' + (counts[t] || 0) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="sp-section-label">' + esc(active) + ' · ' + shown.length + '</div>' +
      '<div class="sp-list">' + (shown.length ? shown.map(function (r) {
        return '<div class="sp-row"><span class="primary elide">' + esc(r.title) + '</span>' + chip(r.health, r.health === 'ok' ? 'ok' : 'warn') + '</div>';
      }).join('') : '<div class="lab-empty">No artifacts of this type</div>') + '</div>');
  }
  function art_freshness(uid) {
    function bucket(fresh) {
      if (!fresh) return 'stale';
      if (fresh.indexOf('m') >= 0 && parseInt(fresh, 10) < 60) return 'now';
      if (fresh.indexOf('h') >= 0 && parseInt(fresh, 10) < 12) return 'hour';
      if (fresh.indexOf('h') >= 0 || fresh.indexOf('d') >= 0 && parseInt(fresh, 10) <= 1) return 'day';
      return 'stale';
    }
    var groups = { now: [], hour: [], day: [], stale: [] };
    SPData.artifacts.rows.forEach(function (r) { groups[bucket(r.fresh)].push(r); });
    var labels = { now: 'Just now', hour: 'This hour', day: 'Today', stale: 'Stale' };
    return wrap(uid, 'artifacts', 'freshness',
      head('Freshness timeline') +
      '<div class="sp-list">' + ['now', 'hour', 'day', 'stale'].map(function (g) {
        if (!groups[g].length) return '';
        return '<div class="lab-fresh-bucket ' + g + '"><div class="sp-section-label">' + labels[g] + ' · ' + groups[g].length + '</div>' +
          groups[g].map(function (r) {
            return '<div class="lab-fresh-row"><span class="lab-fresh-age">' + esc(r.fresh) + '</span>' +
              '<div class="elide">' + esc(r.title) + '</div>' + chip(r.type) + '</div>';
          }).join('') + '</div>';
      }).join('') + '</div>');
  }
  function art_cost_spotlight(uid) {
    var cost = SPData.artifacts.rows.find(function (r) { return r.type === 'cost_usage'; });
    return wrap(uid, 'artifacts', 'cost-spotlight',
      '<div class="lab-cost-card"><div class="lab-eyebrow">cost_usage</div><div class="lab-cost-title">' + esc(cost.title) + '</div>' +
        '<div class="lab-sub">Parent totals · child links · Estimated Cost</div>' +
        '<div class="lab-btnrow"><button class="sp-btn primary" data-toast="Show in Ledger">Ledger</button><button class="sp-btn" data-toast="Show in Usage">Usage</button></div></div>' +
      '<div class="sp-list">' + SPData.artifacts.rows.filter(function (r) { return r.type !== 'cost_usage'; }).map(function (r) {
        return '<div class="sp-row"><span class="primary elide">' + esc(r.title) + '</span>' + chip(r.type) + '</div>';
      }).join('') + '</div>');
  }
  function art_health_rail(uid) {
    var groups = { ok: [], warn: [], err: [], blocked: [] };
    SPData.artifacts.rows.forEach(function (r) { (groups[r.health] || groups.warn).push(r); });
    return wrap(uid, 'artifacts', 'health-rail',
      head('By health') +
      '<div class="sp-list">' + ['blocked', 'err', 'warn', 'ok'].map(function (g) {
        if (!groups[g].length) return '';
        return '<div class="sp-section-label">' + g + ' · ' + groups[g].length + '</div>' + groups[g].map(function (r) {
          return '<div class="sp-row"><span class="primary elide">' + esc(r.title) + '</span></div>';
        }).join('');
      }).join('') + '</div>');
  }
  function art_identity_index(uid) {
    return wrap(uid, 'artifacts', 'identity-index',
      head('Lookup') +
      '<div class="sp-rail lab-tight"><input class="sp-input mono" placeholder="art-… or title" value="art-90">' +
        '<div class="lab-sub">Jump by stable id · titles secondary</div></div>' +
      '<div class="sp-list">' + SPData.artifacts.rows.map(function (r) {
        return '<button type="button" class="lab-id-row" data-toast="Open ' + esc(r.id) + '">' +
          '<span class="mono lab-id">' + esc(r.id) + '</span>' +
          '<span class="elide">' + esc(r.title) + '</span>' +
          '<span class="lab-sub">' + esc(r.type) + '</span></button>';
      }).join('') + '</div>');
  }
  function art_preview_sheet(uid) {
    var first = SPData.artifacts.rows[1] || SPData.artifacts.rows[0];
    var previewBody =
      first.type === 'cost_usage'
        ? '<div class="lab-preview-body"><div class="lab-spark">▁▂▃▅▇▅▃▄▆█</div><div class="lab-sub">Estimated Cost · parent rollup</div></div>'
        : first.type === 'diff'
          ? '<pre class="lab-preview-diff mono">- quantity: f32\n+ amount: f32\n  unit: Unit</pre>'
          : first.type === 'test'
            ? '<div class="lab-preview-body"><div class="err">FAILED · 8 cases</div><div class="lab-sub mono">junit import suite</div></div>'
            : '<div class="lab-preview-body"><div class="lab-sub">Demand-load · ' + esc(first.type) + ' body</div><div class="mono">' + esc(first.id) + '</div></div>';
    return wrap(uid, 'artifacts', 'preview-sheet',
      head('Preview') +
      '<div class="sp-list">' + SPData.artifacts.rows.map(function (r, i) {
        return '<div class="sp-row' + (i === 1 ? ' selected' : '') + '" data-sheet-title="' + esc(r.title) + '" data-sheet-body="' + esc(r.type) + ' · ' + esc(r.id) + '">' +
          '<span class="primary elide">' + esc(r.title) + '</span>' + chip(r.type) + '</div>';
      }).join('') + '</div>' +
      '<div class="sp-sheet open lab-typed-preview"><h3 class="elide">' + esc(first.title) + '</h3>' +
        '<div class="lab-eyebrow">' + esc(first.type) + ' · ' + esc(first.id) + '</div>' +
        previewBody +
        '<div class="lab-btnrow"><button class="sp-btn primary" data-toast="Open full">Open</button><button class="sp-btn" data-toast="Ledger">Ledger</button></div></div>');
  }

  var LAB = {
    search: {
      rail: search_rail, dock: search_dock, 'path-tree': search_path_tree,
      'match-tape': search_match_tape, 'scope-ribbon': search_scope_ribbon, 'replace-studio': search_replace_studio
    },
    source: {
      'changes-stack': source_changes, 'worktree-first': source_worktree_first, 'commit-composer': source_commit_composer,
      traffic: source_traffic, 'conflict-radar': source_conflict_radar, 'graph-strip': source_graph_strip
    },
    actions: {
      'branch-pulse': actions_branch_pulse, 'run-ticker': actions_run_ticker, 'triage-desk': actions_triage_desk,
      'pin-board': actions_pin_board, 'dispatch-pad': actions_dispatch_pad, 'settings-ledger': actions_settings_ledger
    },
    docker: {
      fleet: docker_fleet, 'compose-map': docker_compose_map, 'runtime-switch': docker_runtime_switch,
      'ops-console': docker_ops_console, 'image-shelf': docker_image_shelf, 'publish-chain': docker_publish_chain
    },
    tests: {
      'run-board': tests_run_board, 'failure-first': tests_failure_first, 'receipt-card': tests_receipt_card,
      'watch-strip': tests_watch_strip, 'artifact-drawer': tests_artifact_drawer, 'policy-gate': tests_policy_gate
    },
    agents: {
      'active-pulse': agents_active_pulse, roster: agents_roster, 'lineage-tree': agents_lineage_tree,
      'lane-cards': agents_lane_cards, handoff: agents_handoff, 'registry-mirror': agents_registry_mirror
    },
    artifacts: {
      'type-filter': art_type_filter, freshness: art_freshness, 'cost-spotlight': art_cost_spotlight,
      'health-rail': art_health_rail, 'identity-index': art_identity_index, 'preview-sheet': art_preview_sheet
    }
  };

  var LAB_META = {
    search: [
      { id: 'rail', name: 'Hit rail', note: 'Continuous file blocks + line hits. Status chip. Classic narrow search done cleanly.' },
      { id: 'dock', name: 'Query dock', note: 'Results dominate; query + scope dock to the bottom so hits get the vertical budget.' },
      { id: 'path-tree', name: 'Path map', note: 'Folder heat map — shared path prefixes collapse; expand only hot folders.' },
      { id: 'match-tape', name: 'Match tape', note: 'Stat strip + vertical tape of matches; path sits above each code line.' },
      { id: 'scope-ribbon', name: 'Scope ribbon', note: 'Vertical scope tabs beside the query — no OS select, instant switch.' },
      { id: 'replace-studio', name: 'Replace studio', note: 'Find/replace paired fields with live preview strip before committing All.' }
    ],
    source: [
      { id: 'changes-stack', name: 'Changes stack', note: 'Staged / unstaged / untracked / conflicts as clear bands with commit footer.' },
      { id: 'worktree-first', name: 'Worktree first', note: 'Worktrees are the product; filter sprout + peek sheet for Open/Compare.' },
      { id: 'commit-composer', name: 'Commit composer', note: 'Message hero first; files become a checklist under the composer.' },
      { id: 'traffic', name: 'Sync traffic', note: 'Ahead/behind/conflict meters then Fetch/Pull/Push — sync as the story.' },
      { id: 'conflict-radar', name: 'Conflict radar', note: 'Conflicts as a radar map + Resolve/Ours/Theirs — Assist is the primary path.' },
      { id: 'graph-strip', name: 'Graph strip', note: 'Compact history spine with worktree overlay — density without a canvas.' }
    ],
    actions: [
      { id: 'branch-pulse', name: 'Branch pulse', note: 'Current-branch hero + run list with status dots.' },
      { id: 'run-ticker', name: 'Live tape', note: 'Streaming event tape with pin/mute — blocked gates appear as events.' },
      { id: 'triage-desk', name: 'Triage desk', note: 'Only failed/waiting runs with Logs/Replay/Code actions.' },
      { id: 'pin-board', name: 'Pin board', note: 'Pinned workflows as status tiles; inventory scrolls below with pin affordance.' },
      { id: 'dispatch-pad', name: 'Dispatch pad', note: 'Workflow dispatch form as the panel — big Run CTA.' },
      { id: 'settings-ledger', name: 'Settings ledger', note: 'Secrets/vars/envs/runners as a scannable ledger (names only).' }
    ],
    docker: [
      { id: 'fleet', name: 'Fleet rail', note: 'Color state rail on each container + overflow sprout for ops.' },
      { id: 'compose-map', name: 'Compose map', note: 'Service tiles as a status map — Up/Down at the foot.' },
      { id: 'runtime-switch', name: 'Runtime sheet', note: 'Docker vs Podman capability matrix, then runtime-filtered fleet.' },
      { id: 'ops-console', name: 'Ops console', note: 'Pick a container; bottom sheet becomes a mini log console.' },
      { id: 'image-shelf', name: 'Image shelf', note: 'Images with relative size bars — prune/pull pinned.' },
      { id: 'publish-chain', name: 'Publish chain', note: 'Publish/Unraid as a numbered process, not nested cards.' }
    ],
    tests: [
      { id: 'run-board', name: 'Run board', note: 'Policy sprout + Run/Watch/Cancel + run list.' },
      { id: 'failure-first', name: 'Failure first', note: 'Failures own the panel; receipt/re-run at the foot.' },
      { id: 'receipt-card', name: 'Receipt card', note: 'Last run as a large receipt surface.' },
      { id: 'watch-strip', name: 'Watch HUD', note: 'Live queue meter + streaming pass/fail ticks + cancel.' },
      { id: 'artifact-drawer', name: 'Artifact filmstrip', note: 'Select a run; its artifacts appear as a filmstrip below.' },
      { id: 'policy-gate', name: 'Policy inspector', note: 'Inherited / override / effective / blocked — then Run allowed.' }
    ],
    agents: [
      { id: 'active-pulse', name: 'Active pulse', note: 'Running agents pulse; lineage one tap away.' },
      { id: 'roster', name: 'Roster', note: 'Available catalog first — pick capabilities, then check Active.' },
      { id: 'lineage-tree', name: 'Lineage tree', note: 'Indent tree Goal → Planner → Coder → Reviewer.' },
      { id: 'lane-cards', name: 'Swimlanes', note: 'Agents grouped by parent goal on status tracks.' },
      { id: 'handoff', name: 'Handoff queue', note: 'Numbered accept/defer queue for waiting agents.' },
      { id: 'registry-mirror', name: 'Capability matrix', note: 'Agent × capability grid + local vs remote delta.' }
    ],
    artifacts: [
      { id: 'type-filter', name: 'Type mosaic', note: 'Types as mosaic chips with counts; list follows selection.' },
      { id: 'freshness', name: 'Freshness timeline', note: 'Buckets: now / hour / day / stale with decay styling.' },
      { id: 'cost-spotlight', name: 'Cost spotlight', note: 'cost_usage pinned with Ledger/Usage; rest below.' },
      { id: 'health-rail', name: 'Health rail', note: 'Group by blocked/err/warn/ok — gated stays visible.' },
      { id: 'identity-index', name: 'Lookup console', note: 'Sticky id search; mono ids lead, titles secondary.' },
      { id: 'preview-sheet', name: 'Typed preview', note: 'Selection loads a type-specific preview body (diff/cost/test).' }
    ]
  };

  function renderLab(panelId, variantId, uid) {
    uid = uid || (panelId + '-' + variantId);
    var fn = LAB[panelId] && LAB[panelId][variantId];
    if (!fn) return '<div class="sp-panel active"><div class="sp-head"><h1>Missing variant</h1></div></div>';
    return fn(uid);
  }

  global.SPLab = { render: renderLab, meta: LAB_META, variants: LAB };
})(window);
