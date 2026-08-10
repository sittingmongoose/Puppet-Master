/* panel-protosKimi — panels/actions.js
   GITHUB ACTIONS side panel, 6 family variants.
   Canon kept (GI-006/008/012/015/017, GAAAF-007/014): device-code auth card,
   requested=effective disclosure, scope matrix, missing-workflow-scope
   blocked state with reconnect CTA, current-branch readiness + snapshot
   freshness, run rows, auto-expanded failure triage (job/step/logs/changed
   files/likely-next), status checks empty state, workflows with dispatch
   blocked not_configured, secrets/variables names-only. */
(function () {
  'use strict';

  var ICON = '<span class="pp-head-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg></span>';

  var AUTH_KV = '' +
    '<div class="pp-kv"><span class="pp-k">Account</span><span class="pp-v">jared-dev <span class="pp-chip pp-chip-ok">connected</span></span></div>' +
    '<div class="pp-kv"><span class="pp-k">Requested = effective</span><span class="pp-v">jared-dev</span></div>' +
    '<div class="pp-kv"><span class="pp-k">Scopes</span><span class="pp-v pp-mono">repo, read:user, user:email</span></div>';

  var AUTH_WARN = '' +
    '<div class="pp-blocked"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>workflow scope missing &mdash; you can view runs but cannot dispatch. Reconnect to add it.</span></div>' +
    '<button class="pp-btn pp-w100">Reconnect with workflow scope</button>';

  var RUNS = '' +
    '<div class="pp-row" data-crowd="run"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">CI &mdash; build + test</span><span class="pp-row-m">#312 &middot; main &middot; 2h</span><span class="pp-chip pp-chip-ok">success</span></div>' +
    '<div class="pp-row" data-crowd="run"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">CI &mdash; build + test</span><span class="pp-row-m">#311 &middot; lane-b-api &middot; 3h</span><span class="pp-chip pp-chip-ok">success</span></div>' +
    '<div class="pp-row" data-crowd="run"><span class="pp-dot pp-dot-err">&#9679;</span><span class="pp-row-label">CI &mdash; build + test</span><span class="pp-row-m">#310 &middot; import-fixes &middot; 5h</span><span class="pp-chip pp-chip-err">failed</span></div>';

  var TRIAGE = '' +
    '<div class="pp-inset" style="padding:var(--sm) var(--md);border-color:color-mix(in srgb, var(--accent-error) 40%, transparent)">' +
      '<div class="pp-note" style="font-weight:600"><span class="pp-dot-err">&#9888;</span> Failing job: <b>test</b> &middot; step: <b>cargo test</b></div>' +
      '<div class="pp-mono" style="display:flex;flex-direction:column;gap:1px;padding:var(--xs) 0">' +
        '<div>test import::normalize_units ... FAILED</div>' +
        '<div>assertion failed: qty.value == 1.5 (got 11.5)</div>' +
        '<div class="pp-dim">&#8627; &quot;1 1/2 cup&quot; parsed as 11/2 &mdash; mixed fraction bug</div>' +
      '</div>' +
      '<div class="pp-kv"><span class="pp-k">Changed files</span><span class="pp-v pp-mono">src/services/import.rs</span></div>' +
      '<div class="pp-kv"><span class="pp-k">Likely next</span><span class="pp-v">rerun after the parser fix</span></div>' +
      '<div class="pp-btnrow"><button class="pp-btn pp-btn-p">Rerun</button><button class="pp-mini">Compare last green</button><button class="pp-mini">Open in browser</button></div>' +
    '</div>';

  var CHECKS_EMPTY = '<div class="pp-note pp-dim">No open PR yet &mdash; Create PR from Source Control &gt; Worktrees when run #47 completes.</div>';

  var WORKFLOWS = '' +
    '<div class="pp-row" data-crowd="wf"><span class="pp-row-label">CI &mdash; build + test</span><button class="pp-mini" style="margin-left:auto" disabled title="Blocked: missing workflow scope — reconnect to enable dispatch">Dispatch</button></div>' +
    '<div class="pp-row" data-crowd="wf"><span class="pp-row-label">Release</span><button class="pp-mini" style="margin-left:auto" disabled title="Blocked: missing workflow scope — reconnect to enable dispatch">Dispatch</button></div>' +
    '<div class="pp-foot">Dispatch is blocked: not_configured (workflow scope). Recovery: Reconnect with workflow scope above.</div>';

  var SECRETS = '' +
    '<div class="pp-kv"><span class="pp-k pp-mono">DOCKER_USER</span><span class="pp-v"><span class="pp-chip pp-chip-ok">set</span></span></div>' +
    '<div class="pp-kv"><span class="pp-k pp-mono">DOCKER_PAT</span><span class="pp-v"><span class="pp-chip pp-chip-err">missing</span></span></div>' +
    '<div class="pp-kv"><span class="pp-k pp-mono">REGISTRY_URL</span><span class="pp-v"><span class="pp-chip pp-chip-ok">set</span></span></div>' +
    '<button class="pp-btn pp-w100">Manage on GitHub</button>';

  var BRANCH_KV = '' +
    '<div class="pp-kv"><span class="pp-k">Readiness</span><span class="pp-v">2 of 3 recent runs green</span></div>' +
    '<div class="pp-kv"><span class="pp-k">Snapshot</span><span class="pp-v">webhook transport &middot; 12s ago</span></div>';

  /* ============ v1 — LEDGER ============ */
  var v1 = '' +
  '<div class="pp-panel fam-ledger">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">GitHub Actions</span><span class="pp-head-sp"></span><span class="pp-chip">main</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="lg-sec open"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Connection</span><span class="lg-sec-m">jared-dev &middot; connected</span></div>' +
        '<div class="lg-sec-b"><div class="lg-grid">' +
          '<span class="pp-k">Account</span><span class="pp-v">jared-dev <span class="pp-chip pp-chip-ok">connected</span></span>' +
          '<span class="pp-k">Requested = effective</span><span class="pp-v">jared-dev</span>' +
          '<span class="pp-k">Scopes</span><span class="pp-v pp-mono">repo, read:user, user:email</span>' +
        '</div>' + AUTH_WARN + '</div>' +
      '</div>' +
      '<div class="lg-sec open"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Current branch</span><span class="lg-sec-m">2 of 3 green</span></div>' +
        '<div class="lg-sec-b"><div class="lg-grid">' +
          '<span class="pp-k">Readiness</span><span class="pp-v">2 of 3 recent runs green</span>' +
          '<span class="pp-k">Snapshot</span><span class="pp-v">webhook &middot; 12s ago</span>' +
        '</div>' + RUNS + TRIAGE + '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Status checks</span><span class="lg-sec-m">no open PR</span></div>' +
        '<div class="lg-sec-b">' + CHECKS_EMPTY + '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Workflows</span><span class="lg-sec-m">2 &middot; dispatch blocked</span></div>' +
        '<div class="lg-sec-b">' + WORKFLOWS + '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Secrets &amp; variables</span><span class="lg-sec-m">names only &middot; 1 missing</span></div>' +
        '<div class="lg-sec-b">' + SECRETS + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ============ v2 — RAIL TABS (canon subviews: Current Branch / Workflows / Settings) ============ */
  var v2 = '' +
  '<div class="pp-panel fam-railtabs">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">GitHub Actions</span><span class="pp-head-sp"></span><span class="pp-chip">main</span></div>' +
    '<div class="rt-strip" data-tabstrip>' +
      '<button class="rt-tab active" data-tab="branch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>Branch</button>' +
      '<button class="rt-tab" data-tab="wf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>Workflows</button>' +
      '<button class="rt-tab" data-tab="settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Settings</button>' +
    '</div>' +
    '<div class="pp-scroll" data-tabscope>' +
      '<div class="rt-view active" data-tabview="branch">' +
        BRANCH_KV + RUNS + TRIAGE +
        '<div class="pp-card"><div class="pp-card-h">Status checks</div>' + CHECKS_EMPTY + '</div>' +
      '</div>' +
      '<div class="rt-view" data-tabview="wf">' +
        '<div class="pp-card"><div class="pp-card-h">Workflows <span class="pp-card-m">dispatch blocked</span></div>' + WORKFLOWS + '</div>' +
      '</div>' +
      '<div class="rt-view" data-tabview="settings">' +
        '<div class="pp-card"><div class="pp-card-h">Connection</div>' + AUTH_KV + AUTH_WARN + '</div>' +
        '<div class="pp-card"><div class="pp-card-h">Secrets &amp; variables <span class="pp-card-m">names only</span></div>' + SECRETS + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ============ v3 — RECEIPT FEED ============ */
  var v3 = '' +
  '<div class="pp-panel fam-feed">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">GitHub Actions</span><span class="pp-head-sp"></span><span class="pp-chip">main</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="fd-filters" data-filters>' +
        '<button class="pp-flag active" data-filter="all">All</button>' +
        '<button class="pp-flag" data-filter="runs">Runs</button>' +
        '<button class="pp-flag" data-filter="admin">Admin</button>' +
      '</div>' +
      '<div class="fd-ghead">Attention <span class="pp-chip pp-chip-err">1</span></div>' +
      '<div class="fd-card" data-fam="runs" style="border-color:color-mix(in srgb, var(--accent-error) 40%, transparent)">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-err">&#9679;</span><span class="fd-title">CI &mdash; build + test</span><span class="pp-chip pp-chip-err" style="margin-left:auto">failed</span></div>' +
        '<div class="fd-l2">#310 &middot; import-fixes &middot; 5h ago &middot; job test &middot; step cargo test</div>' +
        '<div class="fd-l2 pp-mono">assertion failed: qty.value == 1.5 (got 11.5)</div>' +
        '<div class="fd-l3">Changed: src/services/import.rs &middot; likely next: rerun after the parser fix</div>' +
        '<div class="fd-l3"><button class="pp-btn pp-btn-p">Rerun</button><button class="pp-mini">Compare last green</button><button class="pp-mini">Open in browser</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="admin">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="fd-title">workflow scope missing</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">blocked</span></div>' +
        '<div class="fd-l2">You can view runs but cannot dispatch. Reconnect to add the workflow scope.</div>' +
        '<div class="fd-l3"><button class="pp-btn pp-w100">Reconnect with workflow scope</button></div>' +
      '</div>' +
      '<div class="fd-ghead">Recent runs <span class="pp-chip">2 of 3 green</span></div>' +
      '<div class="fd-card" data-fam="runs" data-crowd="run">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="fd-title">CI &mdash; build + test</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">success</span></div>' +
        '<div class="fd-l3">#312 &middot; main &middot; 2h ago</div>' +
      '</div>' +
      '<div class="fd-card" data-fam="runs" data-crowd="run">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="fd-title">CI &mdash; build + test</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">success</span></div>' +
        '<div class="fd-l3">#311 &middot; lane-b-api &middot; 3h ago</div>' +
      '</div>' +
      '<div class="fd-ghead">Admin <span class="pp-chip">main &middot; webhook 12s</span></div>' +
      '<div class="fd-card" data-fam="admin">' +
        '<div class="fd-l1"><span class="fd-title">Connection</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">connected</span></div>' +
        '<div class="fd-l3">jared-dev &middot; requested = effective &middot; repo, read:user, user:email</div>' +
      '</div>' +
      '<div class="fd-card" data-fam="admin">' +
        '<div class="fd-l1"><span class="fd-title">Workflows</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">dispatch blocked</span></div>' +
        '<div class="fd-l3">CI &mdash; build + test &middot; Release &middot; not_configured (workflow scope)</div>' +
      '</div>' +
      '<div class="fd-card" data-fam="admin">' +
        '<div class="fd-l1"><span class="fd-title">Secrets &amp; variables</span><span class="pp-chip" style="margin-left:auto">names only</span></div>' +
        '<div class="fd-l3"><span class="pp-mono">DOCKER_USER</span> <span class="pp-chip pp-chip-ok">set</span> &nbsp;<span class="pp-mono">DOCKER_PAT</span> <span class="pp-chip pp-chip-err">missing</span> &nbsp;<span class="pp-mono">REGISTRY_URL</span> <span class="pp-chip pp-chip-ok">set</span></div>' +
        '<div class="fd-acts"><button class="pp-mini">Manage on GitHub</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="runs">' +
        '<div class="fd-l1"><span class="fd-title">Status checks</span></div>' +
        '<div class="fd-l2">No open PR yet &mdash; Create PR from Source Control &gt; Worktrees when run #47 completes.</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ============ v4 — DATA GRID ============ */
  var v4 = '' +
  '<div class="pp-panel fam-grid">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">GitHub Actions</span><span class="pp-head-sp"></span><span class="pp-chip">main</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="gr-band"><span class="gr-band-t">Connection</span> <span class="pp-chip pp-chip-ok">connected</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Account</span><span class="pp-v">jared-dev</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Req = eff</span><span class="pp-v">jared-dev</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Scopes</span><span class="pp-v pp-mono">repo, read:user, user:email</span></div>' +
      '<div class="gr-row"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="gr-c1">workflow scope missing &mdash; view only</span><span class="gr-c2">blocked</span></div>' +
      '<div class="gr-actions"><button class="pp-btn pp-w100">Reconnect with workflow scope</button></div>' +
      '<div class="gr-band"><span class="gr-band-t">Current branch</span> <span class="pp-chip">2 of 3 green</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Snapshot</span><span class="pp-v">webhook &middot; 12s ago</span></div>' +
      '<div class="gr-row" data-crowd="run"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1">CI &mdash; build + test</span><span class="gr-c2">#312 &middot; main &middot; 2h</span></div>' +
      '<div class="gr-row" data-crowd="run"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1">CI &mdash; build + test</span><span class="gr-c2">#311 &middot; lane-b &middot; 3h</span></div>' +
      '<div class="gr-row sel" data-crowd="run"><span class="pp-dot pp-dot-err">&#9679;</span><span class="gr-c1">CI &mdash; build + test</span><span class="gr-c2">#310 &middot; import-fixes &middot; 5h</span></div>' +
      '<div class="gr-sub">FAILED &middot; job test &middot; step cargo test</div>' +
      '<div class="gr-sub pp-mono">assertion failed: qty.value == 1.5 (got 11.5)</div>' +
      '<div class="gr-sub">changed: src/services/import.rs &middot; likely next: rerun after the parser fix</div>' +
      '<div class="gr-actions"><button class="pp-btn pp-btn-p">Rerun</button><button class="pp-mini">Compare last green</button><button class="pp-mini">Open in browser</button></div>' +
      '<div class="gr-band">Status checks</div>' +
      '<div class="gr-row"><span></span><span class="gr-c1 pp-dim">No open PR yet &mdash; create from Source Control</span><span class="gr-c2"></span></div>' +
      '<div class="gr-band"><span class="gr-band-t">Workflows</span> <span class="pp-chip pp-chip-warn">blocked</span></div>' +
      '<div class="gr-row" data-crowd="wf"><span></span><span class="gr-c1">CI &mdash; build + test</span><span class="gr-c2"><button class="pp-mini" disabled title="Blocked: missing workflow scope">Dispatch</button></span></div>' +
      '<div class="gr-row" data-crowd="wf"><span></span><span class="gr-c1">Release</span><span class="gr-c2"><button class="pp-mini" disabled title="Blocked: missing workflow scope">Dispatch</button></span></div>' +
      '<div class="gr-sub">not_configured (workflow scope) &middot; recovery: reconnect above</div>' +
      '<div class="gr-band"><span class="gr-band-t">Secrets &amp; variables</span> <span class="pp-chip">names only</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k pp-mono">DOCKER_USER</span><span class="pp-v"><span class="pp-chip pp-chip-ok">set</span></span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k pp-mono">DOCKER_PAT</span><span class="pp-v"><span class="pp-chip pp-chip-err">missing</span></span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k pp-mono">REGISTRY_URL</span><span class="pp-v"><span class="pp-chip pp-chip-ok">set</span></span></div>' +
      '<div class="gr-actions"><button class="pp-btn pp-w100">Manage on GitHub</button></div>' +
    '</div>' +
  '</div>';

  /* ============ v5 — COMMAND BAR ============ */
  var v5 = '' +
  '<div class="pp-panel fam-command">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">GitHub Actions</span><span class="pp-head-sp"></span><span class="pp-chip">main</span></div>' +
    '<div class="cm-hero">' +
      '<div class="cm-stats">' +
        '<div class="cm-stat"><span class="cm-stat-v">2/3</span><span class="cm-stat-k">Green</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">12s</span><span class="cm-stat-k">Snapshot</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v"><span class="pp-chip pp-chip-err">1</span></span><span class="cm-stat-k">Failing</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v"><span class="pp-chip pp-chip-warn">scope</span></span><span class="cm-stat-k">Dispatch</span></div>' +
      '</div>' +
      '<div class="cm-actions"><button class="pp-btn pp-btn-p pp-flex1">Rerun #310</button><button class="pp-btn pp-flex1">Reconnect + workflow</button></div>' +
    '</div>' +
    '<div class="pp-scroll">' +
      '<div class="cm-list-h">Runs <span class="pp-chip">main &middot; webhook</span></div>' +
      '<div class="pp-row" data-crowd="run"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">CI &mdash; build + test</span><span class="pp-row-m">#312 &middot; 2h</span></div>' +
      '<div class="pp-row" data-crowd="run"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">CI &mdash; build + test</span><span class="pp-row-m">#311 &middot; 3h</span></div>' +
      '<div class="pp-row" data-crowd="run"><span class="pp-dot pp-dot-err">&#9679;</span><span class="pp-row-label">CI &mdash; build + test</span><span class="pp-row-m">#310 &middot; 5h</span><span class="pp-chip pp-chip-err">failed</span></div>' +
      TRIAGE +
      '<div class="cm-list-h">Workflows <span class="pp-chip pp-chip-warn">dispatch blocked</span></div>' +
      '<div class="pp-row" data-crowd="wf"><span class="pp-row-label">CI &mdash; build + test</span><button class="pp-mini" style="margin-left:auto" disabled title="Blocked: missing workflow scope">Dispatch</button></div>' +
      '<div class="pp-row" data-crowd="wf"><span class="pp-row-label">Release</span><button class="pp-mini" style="margin-left:auto" disabled title="Blocked: missing workflow scope">Dispatch</button></div>' +
      '<div class="pp-foot" style="padding:0 var(--xs)">not_configured (workflow scope) &middot; recovery: reconnect with workflow scope</div>' +
      '<div class="cm-list-h">Connection <span class="pp-chip pp-chip-ok">connected</span></div>' +
      '<div class="pp-kv" style="padding:0 var(--xs)"><span class="pp-k">jared-dev</span><span class="pp-v pp-mono">repo, read:user, user:email</span></div>' +
      '<div class="pp-kv" style="padding:0 var(--xs)"><span class="pp-k">Requested = effective</span><span class="pp-v">jared-dev</span></div>' +
      '<div class="cm-list-h">Secrets &amp; variables <span class="pp-chip">names only</span></div>' +
      '<div class="pp-kv" style="padding:0 var(--xs)"><span class="pp-k pp-mono">DOCKER_USER</span><span class="pp-v"><span class="pp-chip pp-chip-ok">set</span></span></div>' +
      '<div class="pp-kv" style="padding:0 var(--xs)"><span class="pp-k pp-mono">DOCKER_PAT</span><span class="pp-v"><span class="pp-chip pp-chip-err">missing</span></span></div>' +
      '<div class="pp-kv" style="padding:0 var(--xs)"><span class="pp-k pp-mono">REGISTRY_URL</span><span class="pp-v"><span class="pp-chip pp-chip-ok">set</span></span></div>' +
      '<div class="pp-btnrow" style="padding:0 var(--xs)"><button class="pp-btn pp-flex1">Manage on GitHub</button></div>' +
      '<div class="cm-list-h">Status checks</div>' +
      '<div class="pp-foot" style="padding:0 var(--xs)">No open PR yet &mdash; Create PR from Source Control &gt; Worktrees when run #47 completes.</div>' +
    '</div>' +
  '</div>';

  /* ============ v6 — FOCUS MODE ============ */
  var v6 = '' +
  '<div class="pp-panel fam-focus">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">GitHub Actions</span><span class="pp-head-sp"></span><span class="pp-chip">main</span></div>' +
    '<div class="fo-crumb"><span class="fo-crumb-home">GitHub Actions</span><button data-fo-back>&#8249; Home</button><span>/</span><b style="color:var(--text-secondary)" data-fo-crumb-current>Home</b></div>' +
    '<div class="pp-scroll">' +
      '<div class="fo-home">' +
        '<div class="pp-attn pp-attn-err">' +
          '<div class="pp-attn-l1"><span class="pp-dot pp-dot-err">&#9679;</span><span class="pp-attn-title">Run #310 failing</span><span class="pp-chip pp-chip-err" style="margin-left:auto">failed</span></div>' +
          '<div class="pp-attn-l2">CI &mdash; build + test &middot; import-fixes &middot; job test &middot; step cargo test</div>' +
          '<div class="pp-attn-l3"><button class="pp-btn pp-btn-p">Rerun</button><button class="pp-mini" data-fo-go="branch" data-fo-label="Current branch">Triage</button></div>' +
        '</div>' +
        '<div class="pp-attn pp-attn-warn">' +
          '<div class="pp-attn-l1"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="pp-attn-title">workflow scope missing</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">blocked</span></div>' +
          '<div class="pp-attn-l2">Dispatch is disabled until you reconnect.</div>' +
          '<div class="pp-attn-l3"><button class="pp-btn">Reconnect with workflow scope</button></div>' +
        '</div>' +
        '<div class="fo-nav">' +
          '<div class="fo-navitem" data-fo-go="branch" data-fo-label="Current branch"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg></span><span class="fo-nav-label">Current branch</span><span class="fo-nav-m">2 of 3 green</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="workflows" data-fo-label="Workflows"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg></span><span class="fo-nav-label">Workflows</span><span class="fo-nav-m">2 &middot; dispatch blocked</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="checks" data-fo-label="Status checks"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg></span><span class="fo-nav-label">Status checks</span><span class="fo-nav-m">no open PR</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="connection" data-fo-label="Connection &amp; scopes"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span><span class="fo-nav-label">Connection &amp; scopes</span><span class="fo-nav-m">jared-dev</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="secrets" data-fo-label="Secrets &amp; variables"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></span><span class="fo-nav-label">Secrets &amp; variables</span><span class="fo-nav-m">1 missing</span><span class="fo-nav-go">&#9656;</span></div>' +
        '</div>' +
        '<div class="pp-foot">Attention items pin to the top; sections open one at a time below.</div>' +
      '</div>' +
      '<div data-fo-view="branch">' + BRANCH_KV + RUNS + TRIAGE + '</div>' +
      '<div data-fo-view="workflows">' +
        '<div class="pp-card"><div class="pp-card-h">Workflows <span class="pp-card-m">dispatch blocked</span></div>' + WORKFLOWS + '</div>' +
      '</div>' +
      '<div data-fo-view="checks">' +
        '<div class="pp-card"><div class="pp-card-h">Status checks</div>' + CHECKS_EMPTY + '</div>' +
      '</div>' +
      '<div data-fo-view="connection">' +
        '<div class="pp-card"><div class="pp-card-h">Connection</div>' + AUTH_KV + AUTH_WARN + '</div>' +
      '</div>' +
      '<div data-fo-view="secrets">' +
        '<div class="pp-card"><div class="pp-card-h">Secrets &amp; variables <span class="pp-card-m">names only</span></div>' + SECRETS + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  PanelProtos.register('actions', 1, { name: 'Ledger', blurb: 'Accordion: connection, current branch (triage auto-open), checks, workflows, secrets. Aligned KV everywhere.', html: v1 });
  PanelProtos.register('actions', 2, { name: 'Rail Tabs', blurb: 'Canonical subviews as tabs: Branch / Workflows / Settings. Matches the owner-doc IA exactly.', html: v2 });
  PanelProtos.register('actions', 3, { name: 'Receipt Feed', blurb: 'Attention cards first (failing run, missing scope), then runs, then admin. Filterable by Runs / Admin.', html: v3 });
  PanelProtos.register('actions', 4, { name: 'Data Grid', blurb: 'Sticky bands per section; triage unfolds as sub-rows under the failed run.', html: v4 });
  PanelProtos.register('actions', 5, { name: 'Command Bar', blurb: 'Readiness stats + Rerun/Reconnect pinned. Lists below stay flat and quiet.', html: v5 });
  PanelProtos.register('actions', 6, { name: 'Focus Mode', blurb: 'Two attention cards pin to home; five sections drill in one at a time.', html: v6 });


  PanelProtos.registerCrowd('actions', [
    { group: 'run',
      fields: { label: ['.pp-row-label', '.gr-c1', '.fd-title'], meta: ['.pp-row-m', '.gr-c2', '.fd-l3'] },
      items: [
        { label: 'Release — publish images', meta: '#88 · v1.1 · 6d' },
        { label: 'Nightly — full matrix', meta: '#452 · main · 12h' },
        { label: 'CI — build + test', meta: '#309 · main · 7h' },
        { label: 'Docs — mdbook deploy', meta: '#21 · main · 2d' },
        { label: 'CI — build + test', meta: '#308 · lane-c · 9h' },
        { label: 'Import fixtures — corpus refresh', meta: '#14 · main · 3d' },
        { label: 'CI — build + test', meta: '#307 · import-fixes · 1d' },
        { label: 'Release — publish images', meta: '#87 · v1.0 · 2w' },
        { label: 'Nightly — full matrix', meta: '#451 · main · 1d' },
        { label: 'CI — build + test', meta: '#306 · main · 1d' },
        { label: 'Tantivy index — warm cache', meta: '#9 · main · 4d' },
        { label: 'CI — build + test', meta: '#305 · spike/r2 · 2d' }
      ] },
    { group: 'wf',
      fields: { label: ['.pp-row-label', '.gr-c1'] },
      items: [
        { label: 'Nightly full matrix' },
        { label: 'Docs deploy' },
        { label: 'Import fixtures refresh' },
        { label: 'Tantivy cache warm' },
        { label: 'Cleanup advisor dry-run' },
        { label: 'Unraid template mirror' }
      ] }
  ]);
})();
