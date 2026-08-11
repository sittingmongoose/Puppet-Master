/* panel-protosKimi — panels/source.js
   SOURCE CONTROL side panel, 6 family variants.
   Canon kept (W-014/031/032/033/034, GI, FileManager): branch picker as PM
   menu, staged/unstaged groups with per-file actions, AI commit (advisory),
   pull/push/fetch + incoming/outgoing, git-mutations-not-undo note, remote
   projection badges (freshness/health), worktree rows with owner + lifecycle
   + blocked-disabled-with-reason, ownership filters, history, graph,
   branches & stash. */
(function () {
  'use strict';

  var ICON = '<span class="pp-head-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 15V9a3 3 0 0 0-3-3H9"/><line x1="6" y1="9" x2="6" y2="15"/></svg></span>';

  var BRANCH_MENU = '' +
    '<div class="pp-menuwrap">' +
      '<button type="button" class="pp-menu-trigger" aria-haspopup="menu" aria-expanded="false" title="Switch branch">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>' +
        '<span class="pp-mt-label">main</span><span class="pp-mt-chev">&#9662;</span>' +
      '</button>' +
      '<div class="pp-menu" role="menu" aria-label="Branch">' +
        '<div class="pp-mhead">Branches</div>' +
        '<button type="button" class="pp-mitem is-selected" data-select-value="main">main <span class="pp-mi-meta">current</span></button>' +
        '<button type="button" class="pp-mitem" data-select-value="orch/lane-b-api">orch/lane-b-api <span class="pp-mi-meta">read-only &middot; run #47</span></button>' +
        '<button type="button" class="pp-mitem" data-select-value="orch/lane-d-infra">orch/lane-d-infra <span class="pp-mi-meta">read-only &middot; run #47</span></button>' +
        '<button type="button" class="pp-mitem" data-select-value="thread/import-fixes">thread/import-fixes</button>' +
        '<button type="button" class="pp-mitem" data-select-value="spike/r2-storage">spike/r2-storage</button>' +
        '<div class="pp-msep"></div>' +
        '<button type="button" class="pp-mitem" data-select-value="+ New branch">+ New branch&hellip;</button>' +
      '</div>' +
    '</div>';

  var STAGED = '' +
    '<div class="pp-row" data-crowd="chg"><span class="pp-row-label pp-ell">src/routes/recipes.rs</span><span class="pp-gs pp-gs-m">M</span><span style="margin-left:auto;display:flex;gap:2px"><button class="pp-mini" title="Unstage">-</button><button class="pp-mini danger" title="Discard">&#10005;</button></span></div>' +
    '<div class="pp-row" data-crowd="chg"><span class="pp-row-label pp-ell">web/src/lib/RecipeCard.svelte</span><span class="pp-gs pp-gs-a">A</span><span style="margin-left:auto;display:flex;gap:2px"><button class="pp-mini" title="Unstage">-</button><button class="pp-mini danger" title="Discard">&#10005;</button></span></div>';

  var UNSTAGED = '' +
    '<div class="pp-row" data-crowd="chg"><span class="pp-row-label pp-ell">src/services/image.rs</span><span class="pp-gs pp-gs-m">M</span><span style="margin-left:auto;display:flex;gap:2px"><button class="pp-mini" title="Stage">+</button><button class="pp-mini danger" title="Discard">&#10005;</button></span></div>';

  var COMMIT_ROW = '' +
    '<div style="display:flex;gap:var(--xs)">' +
      '<input class="pp-input pp-flex1" placeholder="Commit message...">' +
      '<button class="pp-btn" title="Generate with AI (advisory only)">AI</button>' +
      '<button class="pp-btn pp-btn-p">Commit</button>' +
    '</div>';

  var SYNC_ROW = '' +
    '<div class="pp-btnrow" style="margin-top:0">' +
      '<button class="pp-btn pp-flex1">Pull</button>' +
      '<button class="pp-btn pp-flex1">Push</button>' +
      '<button class="pp-btn pp-flex1">Fetch</button>' +
    '</div>' +
    '<div class="pp-foot">0 incoming &middot; 2 outgoing &middot; git mutations do not join editor undo</div>';

  var PROJECTION = '' +
    '<div class="pp-kv"><span class="pp-k">Freshness</span><span class="pp-v"><span class="pp-chip pp-chip-ok">current</span></span></div>' +
    '<div class="pp-kv"><span class="pp-k">Health</span><span class="pp-v"><span class="pp-chip pp-chip-ok">healthy</span></span></div>';

  var WT_FILTERS = '' +
    '<div style="display:flex;gap:var(--xs);flex-wrap:wrap" data-filters>' +
      '<button class="pp-flag active" data-filter="all">All</button>' +
      '<button class="pp-flag" data-filter="thread">Threads</button>' +
      '<button class="pp-flag" data-filter="orchestrator">Orchestrator</button>' +
      '<button class="pp-flag" data-filter="manual">Manual</button>' +
    '</div>';

  var WT_ROWS = '' +
    '<div data-expand data-crowd="wt" data-fam="orchestrator" style="border:1px solid var(--border-light);border-radius:var(--radius-xs)">' +
      '<div class="pp-row" data-expand-h><span class="lg-chev pp-xchev" style="font-size:8px;color:var(--text-muted)">&#9656;</span><span class="pp-pill pp-pill-clean">clean</span><span class="pp-row-label pp-mono" style="font-weight:600">orch/lane-b-api</span><span class="pp-row-m">Orch: lane-b API</span></div>' +
      '<div class="pp-xdetail" style="padding:0 var(--sm) var(--xs)">' +
        '<div class="pp-kv"><span class="pp-k">Path</span><span class="pp-v pp-mono">.worktrees/lane-b-api</span></div>' +
        '<div class="pp-kv"><span class="pp-k">Base</span><span class="pp-v">main &middot; age 2h</span></div>' +
        '<div class="pp-btnrow"><button class="pp-mini">Open files</button><button class="pp-mini">Compare</button><button class="pp-mini">Merge</button><button class="pp-mini">Open lane</button><button class="pp-mini danger" disabled title="Owned by run #47 — remove unlocks when the lane releases it">Remove</button></div>' +
      '</div>' +
    '</div>' +
    '<div data-expand data-crowd="wt" data-fam="orchestrator" style="border:1px solid var(--border-light);border-radius:var(--radius-xs)">' +
      '<div class="pp-row" data-expand-h><span class="lg-chev pp-xchev" style="font-size:8px;color:var(--text-muted)">&#9656;</span><span class="pp-pill pp-pill-dirty">dirty</span><span class="pp-row-label pp-mono" style="font-weight:600">orch/lane-d-infra</span><span class="pp-row-m">Orch: lane-d infra</span></div>' +
      '<div class="pp-xdetail" style="padding:0 var(--sm) var(--xs)">' +
        '<div class="pp-kv"><span class="pp-k">Path</span><span class="pp-v pp-mono">.worktrees/lane-d-infra</span></div>' +
        '<div class="pp-kv"><span class="pp-k">PR</span><span class="pp-v">none yet &mdash; unlocks when run #47 completes</span></div>' +
        '<div class="pp-btnrow"><button class="pp-mini">Open files</button><button class="pp-mini">Compare</button><button class="pp-mini">Create PR</button><button class="pp-mini">Open lane</button></div>' +
      '</div>' +
    '</div>' +
    '<div data-expand data-crowd="wt" data-fam="thread" style="border:1px solid var(--border-light);border-radius:var(--radius-xs)">' +
      '<div class="pp-row" data-expand-h><span class="lg-chev pp-xchev" style="font-size:8px;color:var(--text-muted)">&#9656;</span><span class="pp-pill pp-pill-clean">clean</span><span class="pp-row-label pp-mono" style="font-weight:600">thread/import-fixes</span><span class="pp-row-m">Thread</span></div>' +
      '<div class="pp-xdetail" style="padding:0 var(--sm) var(--xs)">' +
        '<div class="pp-kv"><span class="pp-k">Path</span><span class="pp-v pp-mono">.worktrees/import-fixes</span></div>' +
        '<div class="pp-btnrow"><button class="pp-mini">Open files</button><button class="pp-mini">Open thread</button><button class="pp-mini">Merge</button><button class="pp-mini danger">Remove</button></div>' +
      '</div>' +
    '</div>' +
    '<div data-expand data-crowd="wt" data-fam="manual" style="border:1px solid var(--border-light);border-radius:var(--radius-xs)">' +
      '<div class="pp-row" data-expand-h><span class="lg-chev pp-xchev" style="font-size:8px;color:var(--text-muted)">&#9656;</span><span class="pp-pill pp-pill-clean">clean</span><span class="pp-row-label pp-mono" style="font-weight:600">spike/r2-storage</span><span class="pp-row-m">Manual</span></div>' +
      '<div class="pp-xdetail" style="padding:0 var(--sm) var(--xs)">' +
        '<div class="pp-kv"><span class="pp-k">Path</span><span class="pp-v pp-mono">.worktrees/r2-spike</span></div>' +
        '<div class="pp-btnrow"><button class="pp-mini">Open files</button><button class="pp-mini">Compare</button><button class="pp-mini">Merge</button><button class="pp-mini danger">Remove</button></div>' +
      '</div>' +
    '</div>';

  var HISTORY = '' +
    '<div class="pp-row" data-crowd="hist" style="flex-direction:column;align-items:stretch;gap:0"><span style="display:flex;justify-content:space-between"><span class="pp-mono" style="color:var(--accent-primary);font-weight:600">abc12ef</span><span class="pp-row-m">4m ago</span></span><span class="pp-row-label" style="white-space:normal">feat(search): tantivy query endpoint + ranked results</span></div>' +
    '<div class="pp-row" data-crowd="hist" style="flex-direction:column;align-items:stretch;gap:0"><span style="display:flex;justify-content:space-between"><span class="pp-mono" style="color:var(--accent-primary);font-weight:600">def34ab</span><span class="pp-row-m">2h ago</span></span><span class="pp-row-label" style="white-space:normal">feat(ratings): schema + API + stars UI</span></div>' +
    '<div class="pp-row" data-crowd="hist" style="flex-direction:column;align-items:stretch;gap:0"><span style="display:flex;justify-content:space-between"><span class="pp-mono" style="color:var(--accent-primary);font-weight:600">789feed</span><span class="pp-row-m">yesterday</span></span><span class="pp-row-label" style="white-space:normal">chore: compose stack + registry cache</span></div>';

  var GRAPH = '' +
    '<div class="pp-mono" style="display:flex;flex-direction:column;gap:3px;font-size:var(--fs-xs)">' +
      '<div><span style="color:var(--accent-primary)">&#9679;</span> main &nbsp;abc12ef</div>' +
      '<div style="padding-left:var(--md);color:var(--text-secondary)">&#8627; <span style="color:var(--accent-orange)">&#9679;</span> orch/lane-b-api</div>' +
      '<div style="padding-left:var(--md);color:var(--text-secondary)">&#8627; <span style="color:var(--accent-orange)">&#9679;</span> orch/lane-d-infra</div>' +
      '<div style="padding-left:var(--md);color:var(--text-secondary)">&#8627; <span style="color:var(--accent-lime)">&#9679;</span> thread/import-fixes</div>' +
    '</div>';

  var BRANCHES_STASH = '' +
    '<div class="pp-row"><span class="pp-row-label pp-mono" style="font-weight:600">main</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">current</span></div>' +
    '<div class="pp-row"><span class="pp-row-label pp-mono">orch/lane-b-api</span><span class="pp-row-m">read-only</span></div>' +
    '<div class="pp-row"><span class="pp-row-label pp-mono">orch/lane-d-infra</span><span class="pp-row-m">read-only</span></div>' +
    '<div class="pp-row"><span class="pp-row-label pp-mono">thread/import-fixes</span></div>' +
    '<div class="pp-row"><span class="pp-row-label pp-mono">spike/r2-storage</span></div>' +
    '<div class="pp-row" data-crowd="chg"><span class="pp-row-label pp-ell">stash@{0}: WIP image resize ladder</span><span style="margin-left:auto;display:flex;gap:2px"><button class="pp-mini">Pop</button><button class="pp-mini danger">Drop</button></span></div>';

  /* ============ v1 — LEDGER ============ */
  var v1 = '' +
  '<div class="pp-panel fam-ledger">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Source Control</span><span class="pp-head-sp"></span>' + BRANCH_MENU + '</div>' +
    '<div class="pp-scroll">' +
      '<div class="lg-sec open"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Changes</span><span class="lg-sec-m">2 staged, 1 unstaged</span></div>' +
        '<div class="lg-sec-b">' +
          '<div class="pp-card-h">Staged <span class="pp-card-m"><span class="pp-chip pp-chip-ok">2</span></span></div>' + STAGED +
          '<div class="pp-card-h" style="padding-top:var(--sm)">Unstaged <span class="pp-card-m"><span class="pp-chip pp-chip-warn">1</span></span></div>' + UNSTAGED +
          '<div class="pp-foot">Hunk-level stage / unstage / discard lives in the diff view.</div>' +
          COMMIT_ROW + SYNC_ROW +
        '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Remote projection</span><span class="lg-sec-m">current &middot; healthy</span></div>' +
        '<div class="lg-sec-b">' + PROJECTION + '<div class="pp-foot">Badges derive from canonical reason codes; click cycles demo states.</div></div>' +
      '</div>' +
      '<div class="lg-sec open"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Worktrees</span><span class="lg-sec-m">4 active</span></div>' +
        '<div class="lg-sec-b">' + WT_FILTERS + WT_ROWS + '<button class="pp-btn pp-w100">+ New Worktree</button></div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>History</span><span class="lg-sec-m">3 recent</span></div>' +
        '<div class="lg-sec-b">' + HISTORY + '<button class="pp-btn pp-w100">Set compare target</button></div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Graph</span></div>' +
        '<div class="lg-sec-b">' + GRAPH + '<button class="pp-btn pp-w100">Open full graph</button></div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Branches &amp; Stash</span><span class="lg-sec-m">5 branches, 1 stash</span></div>' +
        '<div class="lg-sec-b">' + BRANCHES_STASH + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ============ v2 — RAIL TABS ============ */
  var v2 = '' +
  '<div class="pp-panel fam-railtabs">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Source Control</span><span class="pp-head-sp"></span>' + BRANCH_MENU + '</div>' +
    '<div class="rt-strip" data-tabstrip>' +
      '<button class="rt-tab active" data-tab="changes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Changes</button>' +
      '<button class="rt-tab" data-tab="wt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>Trees</button>' +
      '<button class="rt-tab" data-tab="hist"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>History</button>' +
      '<button class="rt-tab" data-tab="graph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M5 8v3a5 5 0 0 0 5 5h0"/><path d="M19 8v3a5 5 0 0 1-5 5"/></svg>Graph</button>' +
      '<button class="rt-tab" data-tab="br"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>Refs</button>' +
    '</div>' +
    '<div class="pp-scroll" data-tabscope>' +
      '<div class="rt-view active" data-tabview="changes">' +
        '<div class="pp-card"><div class="pp-card-h">Staged <span class="pp-card-m"><span class="pp-chip pp-chip-ok">2</span></span></div>' + STAGED + '</div>' +
        '<div class="pp-card"><div class="pp-card-h">Unstaged <span class="pp-card-m"><span class="pp-chip pp-chip-warn">1</span></span></div>' + UNSTAGED + '<div class="pp-foot">Hunk-level actions live in the diff view.</div></div>' +
        COMMIT_ROW + SYNC_ROW +
        '<div class="pp-card"><div class="pp-card-h">Remote projection</div>' + PROJECTION + '</div>' +
      '</div>' +
      '<div class="rt-view" data-tabview="wt">' + WT_FILTERS + WT_ROWS + '<button class="pp-btn pp-w100">+ New Worktree</button></div>' +
      '<div class="rt-view" data-tabview="hist">' + HISTORY + '<button class="pp-btn pp-w100">Set compare target</button></div>' +
      '<div class="rt-view" data-tabview="graph">' + GRAPH + '<button class="pp-btn pp-w100">Open full graph</button></div>' +
      '<div class="rt-view" data-tabview="br">' +
        '<div class="pp-card"><div class="pp-card-h">Branches <span class="pp-card-m">5</span></div>' + BRANCHES_STASH + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ============ v3 — RECEIPT FEED ============ */
  var v3 = '' +
  '<div class="pp-panel fam-feed">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Source Control</span><span class="pp-head-sp"></span>' + BRANCH_MENU + '</div>' +
    '<div class="pp-scroll">' +
      '<div class="fd-filters" data-filters>' +
        '<button class="pp-flag active" data-filter="all">All</button>' +
        '<button class="pp-flag" data-filter="change">Changes</button>' +
        '<button class="pp-flag" data-filter="orchestrator">Orchestrator</button>' +
        '<button class="pp-flag" data-filter="thread">Threads</button>' +
        '<button class="pp-flag" data-filter="manual">Manual</button>' +
      '</div>' +
      '<div class="fd-ghead">Changes <span class="pp-chip">3 files</span></div>' +
      '<div class="fd-card" data-fam="change" data-crowd="chg">' +
        '<div class="fd-l1"><span class="pp-gs pp-gs-m">M</span><span class="fd-title">src/routes/recipes.rs</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">staged</span></div>' +
        '<div class="fd-acts"><button class="pp-mini">Unstage</button><button class="pp-mini danger">Discard</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="change" data-crowd="chg">' +
        '<div class="fd-l1"><span class="pp-gs pp-gs-a">A</span><span class="fd-title">web/src/lib/RecipeCard.svelte</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">staged</span></div>' +
        '<div class="fd-acts"><button class="pp-mini">Unstage</button><button class="pp-mini danger">Discard</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="change" data-crowd="chg">' +
        '<div class="fd-l1"><span class="pp-gs pp-gs-m">M</span><span class="fd-title">src/services/image.rs</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">unstaged</span></div>' +
        '<div class="fd-acts"><button class="pp-mini">Stage</button><button class="pp-mini danger">Discard</button></div>' +
      '</div>' +
      '<div class="fd-card">' +
        '<div class="fd-l1"><span class="fd-title">Commit</span><span class="pp-chip" style="margin-left:auto">2 outgoing</span></div>' +
        '<div style="display:flex;gap:var(--xs)"><input class="pp-input pp-flex1" placeholder="Commit message..."><button class="pp-btn" title="Advisory only">AI</button></div>' +
        '<div class="fd-l3"><button class="pp-btn pp-btn-p pp-flex1">Commit</button><button class="pp-btn pp-flex1">Pull</button><button class="pp-btn pp-flex1">Push</button><button class="pp-btn pp-flex1">Fetch</button></div>' +
        '<div class="fd-l3">0 incoming &middot; git mutations do not join editor undo</div>' +
      '</div>' +
      '<div class="fd-ghead">Worktrees <span class="pp-chip">4 active</span></div>' +
      '<div class="fd-card" data-fam="orchestrator" data-crowd="wt">' +
        '<div class="fd-l1"><span class="pp-pill pp-pill-clean">clean</span><span class="fd-title pp-mono">orch/lane-b-api</span></div>' +
        '<div class="fd-l3">Orch: lane-b API &middot; .worktrees/lane-b-api &middot; base main &middot; 2h</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open</button><button class="pp-mini">Merge</button><button class="pp-mini danger" disabled title="Owned by run #47">Remove</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="orchestrator" data-crowd="wt">' +
        '<div class="fd-l1"><span class="pp-pill pp-pill-dirty">dirty</span><span class="fd-title pp-mono">orch/lane-d-infra</span></div>' +
        '<div class="fd-l3">Orch: lane-d infra &middot; PR none yet &mdash; unlocks when run #47 completes</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open</button><button class="pp-mini">Create PR</button><button class="pp-mini">Open lane</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="thread" data-crowd="wt">' +
        '<div class="fd-l1"><span class="pp-pill pp-pill-clean">clean</span><span class="fd-title pp-mono">thread/import-fixes</span></div>' +
        '<div class="fd-l3">Thread: Import worker debugging &middot; base main &middot; 1d</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open</button><button class="pp-mini">Merge</button><button class="pp-mini danger">Remove</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="manual" data-crowd="wt">' +
        '<div class="fd-l1"><span class="pp-pill pp-pill-clean">clean</span><span class="fd-title pp-mono">spike/r2-storage</span></div>' +
        '<div class="fd-l3">Manual &middot; base main &middot; 3d</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open</button><button class="pp-mini">Merge</button><button class="pp-mini danger">Remove</button></div>' +
      '</div>' +
      '<div class="fd-ghead">History <span class="pp-chip">3</span></div>' +
      '<div class="fd-card"><div class="fd-l1"><span class="fd-title pp-mono" style="color:var(--accent-primary)">abc12ef</span><span class="pp-chip" style="margin-left:auto">4m ago</span></div><div class="fd-l2">feat(search): tantivy query endpoint + ranked results</div></div>' +
      '<div class="fd-card"><div class="fd-l1"><span class="fd-title pp-mono" style="color:var(--accent-primary)">def34ab</span><span class="pp-chip" style="margin-left:auto">2h ago</span></div><div class="fd-l2">feat(ratings): schema + API + stars UI</div></div>' +
      '<div class="fd-card"><div class="fd-l1"><span class="fd-title pp-mono" style="color:var(--accent-primary)">789feed</span><span class="pp-chip" style="margin-left:auto">yesterday</span></div><div class="fd-l2">chore: compose stack + registry cache</div></div>' +
      '<div class="pp-btnrow"><button class="pp-btn pp-flex1">+ New Worktree</button><button class="pp-btn pp-flex1">Open full graph</button></div>' +
    '</div>' +
  '</div>';

  /* ============ v4 — DATA GRID ============ */
  var v4 = '' +
  '<div class="pp-panel fam-grid">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Source Control</span><span class="pp-head-sp"></span>' + BRANCH_MENU + '</div>' +
    '<div class="pp-scroll">' +
      '<div class="gr-band"><span class="gr-band-t">Staged</span> <span class="pp-chip pp-chip-ok">2</span></div>' +
      '<div class="gr-row" data-crowd="chg"><span class="pp-gs pp-gs-m">M</span><span class="gr-c1">src/routes/recipes.rs</span><span class="gr-c2">- &#10005;</span></div>' +
      '<div class="gr-row" data-crowd="chg"><span class="pp-gs pp-gs-a">A</span><span class="gr-c1">web/src/lib/RecipeCard.svelte</span><span class="gr-c2">- &#10005;</span></div>' +
      '<div class="gr-band"><span class="gr-band-t">Unstaged</span> <span class="pp-chip pp-chip-warn">1</span></div>' +
      '<div class="gr-row" data-crowd="chg"><span class="pp-gs pp-gs-m">M</span><span class="gr-c1">src/services/image.rs</span><span class="gr-c2">+ &#10005;</span></div>' +
      '<div class="gr-actions">' +
        '<input class="pp-input pp-flex1" placeholder="Commit message...">' +
        '<button class="pp-btn" title="Advisory only">AI</button>' +
        '<button class="pp-btn pp-btn-p">Commit</button>' +
      '</div>' +
      '<div class="gr-actions" style="padding-top:0">' +
        '<button class="pp-btn pp-flex1">Pull</button><button class="pp-btn pp-flex1">Push</button><button class="pp-btn pp-flex1">Fetch</button>' +
        '<span class="pp-foot" style="width:100%">0 incoming &middot; 2 outgoing &middot; git mutations do not join editor undo &middot; remote: current &middot; healthy</span>' +
      '</div>' +
      '<div class="gr-band"><span class="gr-band-t">Worktrees</span> <span class="pp-chip">4</span></div>' +
      '<div class="gr-row" data-crowd="wt"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1 pp-mono">orch/lane-b-api</span><span class="gr-c2">Orch &middot; 2h</span></div>' +
      '<div class="gr-sub">clean &middot; .worktrees/lane-b-api &middot; remove blocked: owned by run #47</div>' +
      '<div class="gr-row" data-crowd="wt"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="gr-c1 pp-mono">orch/lane-d-infra</span><span class="gr-c2">Orch &middot; 2h</span></div>' +
      '<div class="gr-sub">dirty &middot; PR none yet &mdash; unlocks when run #47 completes</div>' +
      '<div class="gr-row" data-crowd="wt"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1 pp-mono">thread/import-fixes</span><span class="gr-c2">Thread &middot; 1d</span></div>' +
      '<div class="gr-row" data-crowd="wt"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1 pp-mono">spike/r2-storage</span><span class="gr-c2">Manual &middot; 3d</span></div>' +
      '<div class="gr-actions"><button class="pp-btn pp-w100">+ New Worktree</button></div>' +
      '<div class="gr-band"><span class="gr-band-t">History</span> <span class="pp-chip">3</span></div>' +
      '<div class="gr-row" data-crowd="hist"><span></span><span class="gr-c1">feat(search): tantivy query endpoint</span><span class="gr-c2">abc12ef</span></div>' +
      '<div class="gr-row" data-crowd="hist"><span></span><span class="gr-c1">feat(ratings): schema + API + stars UI</span><span class="gr-c2">def34ab</span></div>' +
      '<div class="gr-row" data-crowd="hist"><span></span><span class="gr-c1">chore: compose stack + registry cache</span><span class="gr-c2">789feed</span></div>' +
      '<div class="gr-band">Graph</div>' +
      '<div class="gr-row"><span style="color:var(--accent-primary)">&#9679;</span><span class="gr-c1 pp-mono">main</span><span class="gr-c2">abc12ef</span></div>' +
      '<div class="gr-row"><span style="color:var(--accent-orange)">&#9679;</span><span class="gr-c1 pp-mono" style="padding-left:var(--md)">&#8627; orch/lane-b-api</span><span class="gr-c2">lane</span></div>' +
      '<div class="gr-row"><span style="color:var(--accent-orange)">&#9679;</span><span class="gr-c1 pp-mono" style="padding-left:var(--md)">&#8627; orch/lane-d-infra</span><span class="gr-c2">lane</span></div>' +
      '<div class="gr-row"><span style="color:var(--accent-lime)">&#9679;</span><span class="gr-c1 pp-mono" style="padding-left:var(--md)">&#8627; thread/import-fixes</span><span class="gr-c2">thread</span></div>' +
      '<div class="gr-actions"><button class="pp-btn pp-flex1">Set compare target</button><button class="pp-btn pp-flex1">Open full graph</button></div>' +
      '<div class="gr-band"><span class="gr-band-t">Branches &amp; Stash</span> <span class="pp-chip">5 + 1</span></div>' +
      '<div class="gr-row"><span></span><span class="gr-c1 pp-mono">main</span><span class="gr-c2"><span class="pp-chip pp-chip-ok">current</span></span></div>' +
      '<div class="gr-row"><span></span><span class="gr-c1 pp-mono">orch/lane-b-api</span><span class="gr-c2">read-only</span></div>' +
      '<div class="gr-row"><span></span><span class="gr-c1 pp-mono">thread/import-fixes</span><span class="gr-c2"></span></div>' +
      '<div class="gr-row"><span></span><span class="gr-c1 pp-mono">stash@{0}: WIP image resize ladder</span><span class="gr-c2">Pop &#10005;</span></div>' +
    '</div>' +
  '</div>';

  /* ============ v5 — COMMAND BAR ============ */
  var v5 = '' +
  '<div class="pp-panel fam-command">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Source Control</span><span class="pp-head-sp"></span>' + BRANCH_MENU + '</div>' +
    '<div class="cm-hero">' +
      '<div class="cm-stats">' +
        '<div class="cm-stat"><span class="cm-stat-v">3</span><span class="cm-stat-k">Changed</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">2</span><span class="cm-stat-k">Outgoing</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">4</span><span class="cm-stat-k">Trees</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v"><span class="pp-chip pp-chip-ok">current</span></span><span class="cm-stat-k">Remote</span></div>' +
      '</div>' +
      '<div style="display:flex;gap:var(--xs)"><input class="pp-input pp-flex1" placeholder="Commit message..."><button class="pp-btn" title="Advisory only">AI</button><button class="pp-btn pp-btn-p">Commit</button></div>' +
      '<div class="cm-actions"><button class="pp-btn pp-flex1">Pull</button><button class="pp-btn pp-flex1">Push</button><button class="pp-btn pp-flex1">Fetch</button><button class="pp-btn pp-flex1">+ Worktree</button></div>' +
    '</div>' +
    '<div class="pp-scroll">' +
      '<div class="cm-list-h">Changes <span class="pp-chip">3</span></div>' +
      '<div class="pp-row" data-crowd="chg"><span class="pp-gs pp-gs-m">M</span><span class="pp-row-label">src/routes/recipes.rs</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">staged</span></div>' +
      '<div class="pp-row" data-crowd="chg"><span class="pp-gs pp-gs-a">A</span><span class="pp-row-label">web/src/lib/RecipeCard.svelte</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">staged</span></div>' +
      '<div class="pp-row" data-crowd="chg"><span class="pp-gs pp-gs-m">M</span><span class="pp-row-label">src/services/image.rs</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">unstaged</span></div>' +
      '<div class="cm-list-h">Worktrees <span class="pp-chip">4</span></div>' +
      '<div class="pp-row" data-crowd="wt"><span class="pp-pill pp-pill-clean">clean</span><span class="pp-row-label pp-mono">orch/lane-b-api</span><span class="pp-row-m">Orch &middot; 2h</span></div>' +
      '<div class="pp-row" data-crowd="wt"><span class="pp-pill pp-pill-dirty">dirty</span><span class="pp-row-label pp-mono">orch/lane-d-infra</span><span class="pp-row-m">Orch &middot; 2h</span></div>' +
      '<div class="pp-row" data-crowd="wt"><span class="pp-pill pp-pill-clean">clean</span><span class="pp-row-label pp-mono">thread/import-fixes</span><span class="pp-row-m">Thread &middot; 1d</span></div>' +
      '<div class="pp-row" data-crowd="wt"><span class="pp-pill pp-pill-clean">clean</span><span class="pp-row-label pp-mono">spike/r2-storage</span><span class="pp-row-m">Manual &middot; 3d</span></div>' +
      '<div class="cm-list-h">History <span class="pp-chip">3</span><span style="margin-left:auto"></span><button class="pp-mini">Full graph</button></div>' +
      '<div class="pp-row" data-crowd="hist"><span class="pp-mono" style="color:var(--accent-primary)">abc12ef</span><span class="pp-row-label">feat(search): tantivy query endpoint</span><span class="pp-row-m">4m</span></div>' +
      '<div class="pp-row" data-crowd="hist"><span class="pp-mono" style="color:var(--accent-primary)">def34ab</span><span class="pp-row-label">feat(ratings): schema + stars UI</span><span class="pp-row-m">2h</span></div>' +
      '<div class="pp-row" data-crowd="hist"><span class="pp-mono" style="color:var(--accent-primary)">789feed</span><span class="pp-row-label">chore: compose + registry cache</span><span class="pp-row-m">1d</span></div>' +
      '<div class="pp-foot" style="padding:0 var(--xs)">git mutations do not join editor undo &middot; hunk-level actions live in the diff view</div>' +
    '</div>' +
  '</div>';

  /* ============ v6 — FOCUS MODE ============ */
  var v6 = '' +
  '<div class="pp-panel fam-focus">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Source Control</span><span class="pp-head-sp"></span>' + BRANCH_MENU + '</div>' +
    '<div class="fo-crumb"><span class="fo-crumb-home">Source Control</span><button data-fo-back>&#8249; Home</button><span>/</span><b style="color:var(--text-secondary)" data-fo-crumb-current>Home</b></div>' +
    '<div class="pp-scroll">' +
      '<div class="fo-home">' +
        '<div class="pp-attn pp-attn-warn">' +
          '<div class="pp-attn-l1"><span class="pp-pill pp-pill-dirty">dirty</span><span class="pp-attn-title pp-mono">orch/lane-d-infra</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">needs PR</span></div>' +
          '<div class="pp-attn-l2">PR none yet &mdash; unlocks when run #47 completes.</div>' +
          '<div class="pp-attn-l3"><button class="pp-btn">Open lane</button><button class="pp-mini">Compare</button></div>' +
        '</div>' +
        '<div class="fo-nav">' +
          '<div class="fo-navitem" data-fo-go="changes" data-fo-label="Changes"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span><span class="fo-nav-label">Changes</span><span class="fo-nav-m">2 staged, 1 unstaged</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="worktrees" data-fo-label="Worktrees"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg></span><span class="fo-nav-label">Worktrees</span><span class="fo-nav-m">4 active</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="history" data-fo-label="History"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg></span><span class="fo-nav-label">History</span><span class="fo-nav-m">3 recent</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="graph" data-fo-label="Graph"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M5 8v3a5 5 0 0 0 5 5h0"/><path d="M19 8v3a5 5 0 0 1-5 5"/></svg></span><span class="fo-nav-label">Graph</span><span class="fo-nav-m">main + 3</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="branches" data-fo-label="Branches &amp; Stash"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg></span><span class="fo-nav-label">Branches &amp; Stash</span><span class="fo-nav-m">5 + 1</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="remote" data-fo-label="Remote projection"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 8"/></svg></span><span class="fo-nav-label">Remote projection</span><span class="fo-nav-m">current &middot; healthy</span><span class="fo-nav-go">&#9656;</span></div>' +
        '</div>' +
      '</div>' +
      '<div data-fo-view="changes">' +
        '<div class="pp-card"><div class="pp-card-h">Staged <span class="pp-card-m"><span class="pp-chip pp-chip-ok">2</span></span></div>' + STAGED + '</div>' +
        '<div class="pp-card"><div class="pp-card-h">Unstaged <span class="pp-card-m"><span class="pp-chip pp-chip-warn">1</span></span></div>' + UNSTAGED + '<div class="pp-foot">Hunk-level actions live in the diff view.</div></div>' +
        COMMIT_ROW + SYNC_ROW +
      '</div>' +
      '<div data-fo-view="worktrees">' + WT_FILTERS + WT_ROWS + '<button class="pp-btn pp-w100">+ New Worktree</button></div>' +
      '<div data-fo-view="history">' + HISTORY + '<button class="pp-btn pp-w100">Set compare target</button></div>' +
      '<div data-fo-view="graph">' + GRAPH + '<button class="pp-btn pp-w100">Open full graph</button></div>' +
      '<div data-fo-view="branches">' +
        '<div class="pp-card"><div class="pp-card-h">Branches &amp; Stash <span class="pp-card-m">5 + 1</span></div>' + BRANCHES_STASH + '</div>' +
      '</div>' +
      '<div data-fo-view="remote">' +
        '<div class="pp-card"><div class="pp-card-h">Remote projection</div>' + PROJECTION + '<div class="pp-foot">Badges derive from canonical reason codes; click cycles demo states.</div></div>' +
      '</div>' +
    '</div>' +
  '</div>';

  PanelProtos.register('source', 1, { name: 'Ledger', blurb: 'The current accordion, fixed: aligned columns, clamped metas, clean section rhythm. Branch picker is a PM menu.', html: v1 });
  PanelProtos.register('source', 2, { name: 'Rail Tabs', blurb: 'Changes / Trees / History / Graph / Refs as icon tabs. One subview at a time, no scrolling past five sections.', html: v2 });
  PanelProtos.register('source', 3, { name: 'Receipt Feed', blurb: 'Changes, worktrees, and commits as one filterable feed of cards with hover actions.', html: v3 });
  PanelProtos.register('source', 4, { name: 'Data Grid', blurb: 'Sticky bands per section, status-letter column, mono refs right-aligned. Densest option.', html: v4 });
  PanelProtos.register('source', 5, { name: 'Command Bar', blurb: 'Branch + repo stats + commit/sync actions pinned; changes, worktrees, history as flat lists below.', html: v5 });
  PanelProtos.register('source', 6, { name: 'Focus Mode', blurb: 'A home screen of six section targets; each opens full-height. Nothing competes for the narrow column.', html: v6 });

  PanelProtos.registerCrowd('source', [
    { group: 'chg',
      fields: { label: ['.gr-c1', '.pp-row-label', '.fd-title'] },
      items: [
        { label: 'src/services/normalize/units/quantity/parser.rs' },
        { label: 'web/src/lib/ingredients/IngredientQuantityEditor.svelte' },
        { label: 'src/routes/api/v1/recipes/import/bulk.rs' },
        { label: 'tests/fixtures/mixed-fraction-corpus.json' },
        { label: 'migrations/0003_quantity_normalization.sql' },
        { label: 'web/src/lib/units/format-with-locale-and-rounding.ts' },
        { label: 'src/services/image/resize/ladder.rs' },
        { label: 'docs/quantity-parsing-regression-notes.md' },
        { label: 'src/bin/import-worker/main.rs' },
        { label: 'web/src/routes/recipe/[id]/edit/+page.svelte' },
        { label: 'src/services/import/legacy/blogspot.rs' },
        { label: '.github/workflows/release.yml' }
      ] },
    { group: 'wt',
      fields: { label: ['.pp-row-label', '.gr-c1', '.fd-title'], meta: ['.pp-row-m', '.gr-c2', '.fd-l2'] },
      items: [
        { label: 'orch/lane-a-web-upload-flow', meta: 'Orch · 45m' },
        { label: 'orch/lane-c-quantity-parser-regression-hunt', meta: 'Orch · 1h' },
        { label: 'thread/recipe-import-7x-bug-investigation', meta: 'Thread · 2d' },
        { label: 'thread/ratings-stars-polish', meta: 'Thread · 5h' },
        { label: 'spike/tantivy-remote-index-cache', meta: 'Manual · 4d' },
        { label: 'orch/lane-e-infra-terraform-rework', meta: 'Orch · 3h' },
        { label: 'thread/image-resize-ladder-quality', meta: 'Thread · 1d' },
        { label: 'spike/slint-port-panel-renderer', meta: 'Manual · 2d' },
        { label: 'orch/lane-f-api-rate-limiting', meta: 'Orch · 6h' },
        { label: 'thread/auth-session-refresh-flake', meta: 'Thread · 3d' },
        { label: 'spike/postgres-16-alpine-upgrade', meta: 'Manual · 1d' },
        { label: 'orch/lane-g-docs-and-openapi', meta: 'Orch · 8h' }
      ] },
    { group: 'hist',
      fields: { label: ['.pp-row-label', '.gr-c1', '.fd-l2'], meta: ['.pp-row-m', '.gr-c2'] },
      items: [
        { label: 'fix(import): mixed fractions no longer parse as 11/2', meta: '3h ago' },
        { label: 'feat(web): recipe card image uploader with EXIF strip', meta: '5h ago' },
        { label: 'refactor(services): split normalize_units into units crate', meta: '8h ago' },
        { label: 'test(import): regression fixture for 7x quantity bug', meta: '1d ago' },
        { label: 'chore(ci): cache tantivy index across workflow runs', meta: '1d ago' },
        { label: 'feat(api): bulk import endpoint with per-row errors', meta: '2d ago' },
        { label: 'fix(web): quantity step snaps to 0.25 increments', meta: '2d ago' },
        { label: 'docs: worktree ownership and lane lifecycle', meta: '3d ago' },
        { label: 'feat(docker): publish chain receipts with digest pins', meta: '3d ago' },
        { label: 'fix(auth): refresh token race on session resume', meta: '4d ago' },
        { label: 'chore: bump postgres to 16-alpine, redis to 7-alpine', meta: '5d ago' },
        { label: 'feat(search): sparse n-gram acceleration for regex mode', meta: '6d ago' }
      ] }
  ]);
})();
