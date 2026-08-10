/* panel-protosKimi — panels/tests.js
   TESTING side panel, 6 family variants.
   Canon kept (F3-451, ATS:2235-2237, ATS-009/024, RM-049): panel shows test
   policy (show_when_possible), last-run receipt summary, suites, history
   (failed -> fixed, blocked != failed), run-tests control wired to the
   canonical runner, Watch/Cancel only when running, Open receipt/failure,
   artifact handoff to Runtime Artifacts, redaction notice. */
(function () {
  'use strict';

  var ICON = '<span class="pp-head-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.8 2.8L16.4 9"/></svg></span>';

  var POLICY_KV = '' +
    '<div class="pp-kv"><span class="pp-k">Visibility</span><span class="pp-v"><span class="pp-chip pp-chip-ok">show_when_possible</span></span></div>' +
    '<div class="pp-kv"><span class="pp-k">Runner</span><span class="pp-v">cargo test &middot; adapter configured</span></div>';

  var LAST_RUN = '' +
    '<div class="pp-kv"><span class="pp-k">cargo test</span><span class="pp-v"><span class="pp-chip pp-chip-ok">passed</span></span></div>' +
    '<div class="pp-kv"><span class="pp-k">Result</span><span class="pp-v">214 passed &middot; 0 failed &middot; 3.4s</span></div>' +
    '<div class="pp-kv"><span class="pp-k">When</span><span class="pp-v">4m ago &middot; lane-b retry</span></div>';

  var SUITES = '' +
    '<div class="pp-row" data-crowd="suite"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">routes suite</span><span class="pp-row-m">96 passed</span></div>' +
    '<div class="pp-row" data-crowd="suite"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">services suite</span><span class="pp-row-m">76 passed</span></div>' +
    '<div class="pp-row" data-crowd="suite"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">import suite</span><span class="pp-row-m">42 passed &middot; retried</span></div>';

  var HISTORY = '' +
    '<div class="pp-row" data-crowd="hist"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">cargo test &mdash; lane-b retry</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">214 passed</span></div>' +
    '<div class="pp-row" data-crowd="hist"><span class="pp-dot pp-dot-err">&#9679;</span><span class="pp-row-label">cargo test &mdash; import suite</span><span class="pp-chip pp-chip-err" style="margin-left:auto">1 failed</span><button class="pp-mini">Open failure</button></div>' +
    '<div class="pp-row" data-crowd="hist"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="pp-row-label">browser smoke &mdash; editor flow</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">blocked</span></div>';

  var RUN_BTNS = '' +
    '<div class="pp-btnrow">' +
      '<button class="pp-btn pp-btn-p pp-flex1">Run tests</button>' +
      '<button class="pp-btn pp-flex1" disabled title="Watch enables while a run is queued or running">Watch</button>' +
      '<button class="pp-btn pp-flex1" disabled title="Cancel enables while a run is queued or running">Cancel</button>' +
    '</div>';

  var FOOT = '<div class="pp-foot">Receipts file to Runtime Artifacts &middot; blocked is never shown as failed &middot; evidence is redacted before display.</div>';

  /* ============ v1 — LEDGER ============ */
  var v1 = '' +
  '<div class="pp-panel fam-ledger">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Testing</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">214 passed</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="lg-sec open"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Policy</span><span class="lg-sec-m">show_when_possible</span></div>' +
        '<div class="lg-sec-b"><div class="lg-grid">' +
          '<span class="pp-k">Visibility</span><span class="pp-v"><span class="pp-chip pp-chip-ok">show_when_possible</span></span>' +
          '<span class="pp-k">Runner</span><span class="pp-v">cargo test</span>' +
        '</div><div class="pp-foot">Nodes surface test evidence whenever the runner reports it; silent runs are flagged stale.</div></div>' +
      '</div>' +
      '<div class="lg-sec open"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Last run</span><span class="lg-sec-m">214 passed &middot; 4m ago</span></div>' +
        '<div class="lg-sec-b"><div class="lg-grid">' +
          '<span class="pp-k">Status</span><span class="pp-v"><span class="pp-chip pp-chip-ok">passed</span></span>' +
          '<span class="pp-k">Result</span><span class="pp-v">214 &middot; 0 failed &middot; 3.4s</span>' +
          '<span class="pp-k">When</span><span class="pp-v">4m ago &middot; lane-b retry</span>' +
        '</div>' + RUN_BTNS + '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Suites</span><span class="lg-sec-m">3 &middot; all green</span></div>' +
        '<div class="lg-sec-b">' + SUITES + '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>History</span><span class="lg-sec-m">1 failed &rarr; fixed</span></div>' +
        '<div class="lg-sec-b">' + HISTORY + '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Open receipt</button><button class="pp-btn pp-flex1">Open in Run &amp; Debug</button></div></div>' +
      '</div>' +
      FOOT +
    '</div>' +
  '</div>';

  /* ============ v2 — RAIL TABS ============ */
  var v2 = '' +
  '<div class="pp-panel fam-railtabs">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Testing</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">214 passed</span></div>' +
    '<div class="rt-strip" data-tabstrip>' +
      '<button class="rt-tab active" data-tab="runs"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>Runs</button>' +
      '<button class="rt-tab" data-tab="fail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Failures</button>' +
      '<button class="rt-tab" data-tab="policy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M4.2 4.2l2.8 2.8m10 10l2.8 2.8M1 12h4m14 0h4M4.2 19.8l2.8-2.8m10-10l2.8-2.8"/></svg>Policy</button>' +
    '</div>' +
    '<div class="pp-scroll" data-tabscope>' +
      '<div class="rt-view active" data-tabview="runs">' +
        '<div class="pp-card"><div class="pp-card-h">Last run <span class="pp-card-m"><span class="pp-chip pp-chip-ok">passed</span></span></div>' + LAST_RUN + '</div>' +
        RUN_BTNS +
        '<div class="pp-card"><div class="pp-card-h">Suites <span class="pp-card-m">3</span></div>' + SUITES + '</div>' +
        '<div class="pp-card"><div class="pp-card-h">History</div>' + HISTORY + '</div>' +
      '</div>' +
      '<div class="rt-view" data-tabview="fail">' +
        '<div class="pp-card"><div class="pp-card-h">Failures <span class="pp-card-m">1 open</span></div>' +
          '<div class="pp-row"><span class="pp-dot pp-dot-err">&#9679;</span><span class="pp-row-label">import::normalize_units</span><span class="pp-chip pp-chip-err" style="margin-left:auto">failed</span></div>' +
          '<div class="pp-mono" style="padding:var(--xs)">assertion failed: qty.value == 1.5 (got 11.5)</div>' +
          '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Open failure</button><button class="pp-btn pp-flex1">Open receipt</button></div>' +
        '</div>' +
        '<div class="pp-note pp-dim">Blocked runs are listed separately from failures &mdash; blocked is never failed.</div>' +
        '<div class="pp-row" data-crowd="hist"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="pp-row-label">browser smoke &mdash; editor flow</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">blocked</span></div>' +
      '</div>' +
      '<div class="rt-view" data-tabview="policy">' +
        '<div class="pp-card"><div class="pp-card-h">Policy</div>' + POLICY_KV + '</div>' +
        '<div class="pp-foot">Evidence carries currentness + revalidation results; stale evidence never satisfies a gate. Redaction applies before display.</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ============ v3 — RECEIPT FEED ============ */
  var v3 = '' +
  '<div class="pp-panel fam-feed">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Testing</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">214 passed</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="fd-filters" data-filters>' +
        '<button class="pp-flag active" data-filter="all">All</button>' +
        '<button class="pp-flag" data-filter="pass">Passed</button>' +
        '<button class="pp-flag" data-filter="fail">Failed</button>' +
        '<button class="pp-flag" data-filter="blocked">Blocked</button>' +
      '</div>' +
      '<div class="fd-ghead">Latest <span class="pp-chip">4m ago</span></div>' +
      '<div class="fd-card" data-fam="pass">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="fd-title">cargo test &mdash; workspace</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">passed</span></div>' +
        '<div class="fd-l2">214 passed &middot; 0 failed &middot; 3.4s &middot; lane-b retry</div>' +
        '<div class="fd-l3">routes 96 &middot; services 76 &middot; import 42</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open receipt</button></div>' +
      '</div>' +
      '<div class="fd-ghead">Earlier</div>' +
      '<div class="fd-card" data-fam="fail">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-err">&#9679;</span><span class="fd-title">cargo test &mdash; import suite</span><span class="pp-chip pp-chip-err" style="margin-left:auto">1 failed</span></div>' +
        '<div class="fd-l2 pp-mono">import::normalize_units &mdash; qty.value == 1.5 (got 11.5)</div>' +
        '<div class="fd-l3">fixed by retry &middot; parser patch + regression fixture</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open failure</button><button class="pp-mini">Receipt</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="blocked">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="fd-title">browser smoke &mdash; editor flow</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">blocked</span></div>' +
        '<div class="fd-l2">capability_unavailable: headed browser not probed yet &mdash; blocked is not failed.</div>' +
        '<div class="fd-acts"><button class="pp-mini">Probe</button></div>' +
      '</div>' +
      '<div class="fd-card">' +
        '<div class="fd-l1"><span class="fd-title">Policy</span></div>' +
        '<div class="fd-l3"><span class="pp-chip pp-chip-ok">show_when_possible</span> silent runs flagged stale &middot; evidence redacted before display</div>' +
      '</div>' +
      '<div class="pp-btnrow"><button class="pp-btn pp-btn-p pp-flex1">Run tests</button><button class="pp-btn pp-flex1" disabled title="Watch enables while running">Watch</button></div>' +
    '</div>' +
  '</div>';

  /* ============ v4 — DATA GRID ============ */
  var v4 = '' +
  '<div class="pp-panel fam-grid">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Testing</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">214 passed</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="gr-band">Policy</div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Visibility</span><span class="pp-v"><span class="pp-chip pp-chip-ok">show_when_possible</span></span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Runner</span><span class="pp-v">cargo test</span></div>' +
      '<div class="gr-band"><span class="gr-band-t">Last run</span> <span class="pp-chip pp-chip-ok">passed</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Result</span><span class="pp-v">214 passed &middot; 0 failed &middot; 3.4s</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">When</span><span class="pp-v">4m ago &middot; lane-b retry</span></div>' +
      '<div class="gr-actions"><button class="pp-btn pp-btn-p pp-flex1">Run tests</button><button class="pp-btn pp-flex1" disabled title="Enables while running">Watch</button><button class="pp-btn pp-flex1" disabled title="Enables while running">Cancel</button></div>' +
      '<div class="gr-band"><span class="gr-band-t">Suites</span> <span class="pp-chip">3</span></div>' +
      '<div class="gr-row" data-crowd="suite"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1">routes suite</span><span class="gr-c2">96 passed</span></div>' +
      '<div class="gr-row" data-crowd="suite"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1">services suite</span><span class="gr-c2">76 passed</span></div>' +
      '<div class="gr-row" data-crowd="suite"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1">import suite</span><span class="gr-c2">42 &middot; retried</span></div>' +
      '<div class="gr-band"><span class="gr-band-t">History</span> <span class="pp-chip">1 failed &rarr; fixed</span></div>' +
      '<div class="gr-row" data-crowd="hist"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1">cargo test &mdash; lane-b retry</span><span class="gr-c2">214 passed</span></div>' +
      '<div class="gr-row" data-crowd="hist"><span class="pp-dot pp-dot-err">&#9679;</span><span class="gr-c1">cargo test &mdash; import suite</span><span class="gr-c2">1 failed</span></div>' +
      '<div class="gr-sub">import::normalize_units &middot; fixed by retry &middot; Open failure &middot; Open receipt</div>' +
      '<div class="gr-row" data-crowd="hist"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="gr-c1">browser smoke &mdash; editor flow</span><span class="gr-c2">blocked</span></div>' +
      '<div class="gr-sub">capability_unavailable &mdash; blocked is never shown as failed</div>' +
    '</div>' +
  '</div>';

  /* ============ v5 — COMMAND BAR ============ */
  var v5 = '' +
  '<div class="pp-panel fam-command">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Testing</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">show_when_possible</span></div>' +
    '<div class="cm-hero">' +
      '<div class="cm-stats">' +
        '<div class="cm-stat"><span class="cm-stat-v">214</span><span class="cm-stat-k">Passed</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">0</span><span class="cm-stat-k">Failed</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">3.4s</span><span class="cm-stat-k">Duration</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">4m</span><span class="cm-stat-k">Age</span></div>' +
      '</div>' +
      '<div class="cm-actions"><button class="pp-btn pp-btn-p pp-flex1">Run tests</button><button class="pp-btn pp-flex1" disabled title="Enables while running">Watch</button><button class="pp-btn pp-flex1">Open receipt</button></div>' +
    '</div>' +
    '<div class="pp-scroll">' +
      '<div class="cm-list-h">Suites <span class="pp-chip">3 green</span></div>' +
      '<div class="pp-row" data-crowd="suite"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">routes suite</span><span class="pp-row-m">96</span></div>' +
      '<div class="pp-row" data-crowd="suite"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">services suite</span><span class="pp-row-m">76</span></div>' +
      '<div class="pp-row" data-crowd="suite"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">import suite</span><span class="pp-row-m">42 &middot; retried</span></div>' +
      '<div class="cm-list-h">History <span class="pp-chip">1 failed &rarr; fixed</span></div>' +
      '<div class="pp-row" data-crowd="hist"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">cargo test &mdash; lane-b retry</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">passed</span></div>' +
      '<div class="pp-row" data-crowd="hist"><span class="pp-dot pp-dot-err">&#9679;</span><span class="pp-row-label">cargo test &mdash; import suite</span><span class="pp-chip pp-chip-err" style="margin-left:auto">1 failed</span></div>' +
      '<div class="pp-row" data-crowd="hist"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="pp-row-label">browser smoke &mdash; editor flow</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">blocked</span></div>' +
      '<div class="pp-foot" style="padding:0 var(--xs)">blocked is never shown as failed &middot; receipts file to Runtime Artifacts</div>' +
      '<div class="cm-list-h">Policy</div>' +
      '<div class="pp-kv" style="padding:0 var(--xs)"><span class="pp-k">Visibility</span><span class="pp-v"><span class="pp-chip pp-chip-ok">show_when_possible</span></span></div>' +
      '<div class="pp-kv" style="padding:0 var(--xs)"><span class="pp-k">Runner</span><span class="pp-v">cargo test &middot; adapter configured</span></div>' +
      '<div class="pp-btnrow" style="padding:0 var(--xs)"><button class="pp-btn pp-flex1">Open in Run &amp; Debug</button></div>' +
    '</div>' +
  '</div>';

  /* ============ v6 — FOCUS MODE ============ */
  var v6 = '' +
  '<div class="pp-panel fam-focus">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Testing</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">214 passed</span></div>' +
    '<div class="fo-crumb"><span class="fo-crumb-home">Testing</span><button data-fo-back>&#8249; Home</button><span>/</span><b style="color:var(--text-secondary)" data-fo-crumb-current>Home</b></div>' +
    '<div class="pp-scroll">' +
      '<div class="fo-home">' +
        '<div class="pp-attn">' +
          '<div class="pp-attn-l1"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-attn-title">cargo test &mdash; workspace</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">passed</span></div>' +
          '<div class="pp-attn-l2">214 passed &middot; 0 failed &middot; 3.4s &middot; 4m ago &middot; lane-b retry</div>' +
          '<div class="pp-attn-l3"><button class="pp-btn pp-btn-p">Run tests</button><button class="pp-mini" disabled title="Enables while running">Watch</button><button class="pp-mini">Open receipt</button></div>' +
        '</div>' +
        '<div class="fo-nav">' +
          '<div class="fo-navitem" data-fo-go="suites" data-fo-label="Suites"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg></span><span class="fo-nav-label">Suites</span><span class="fo-nav-m">3 &middot; all green</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="failures" data-fo-label="Failures"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span><span class="fo-nav-label">Failures</span><span class="fo-nav-m">1 &middot; fixed by retry</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="history" data-fo-label="History"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg></span><span class="fo-nav-label">History</span><span class="fo-nav-m">3 runs</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="policy" data-fo-label="Policy"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M4.2 4.2l2.8 2.8m10 10l2.8 2.8M1 12h4m14 0h4M4.2 19.8l2.8-2.8m10-10l2.8-2.8"/></svg></span><span class="fo-nav-label">Policy</span><span class="fo-nav-m">show_when_possible</span><span class="fo-nav-go">&#9656;</span></div>' +
        '</div>' +
        '<div class="pp-foot">Receipts file to Runtime Artifacts &middot; blocked is never failed.</div>' +
      '</div>' +
      '<div data-fo-view="suites">' + SUITES + '<div class="pp-btnrow"><button class="pp-btn pp-btn-p pp-flex1">Run tests</button><button class="pp-btn pp-flex1">Open receipt</button></div></div>' +
      '<div data-fo-view="failures">' +
        '<div class="pp-card"><div class="pp-card-h">Failures <span class="pp-card-m">1 open</span></div>' +
          '<div class="pp-row"><span class="pp-dot pp-dot-err">&#9679;</span><span class="pp-row-label">import::normalize_units</span><span class="pp-chip pp-chip-err" style="margin-left:auto">failed</span></div>' +
          '<div class="pp-mono" style="padding:var(--xs)">assertion failed: qty.value == 1.5 (got 11.5)</div>' +
          '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Open failure</button><button class="pp-btn pp-flex1">Open receipt</button></div>' +
        '</div>' +
        '<div class="pp-note pp-dim">Blocked runs are listed separately from failures &mdash; blocked is never failed.</div>' +
        '<div class="pp-row"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="pp-row-label">browser smoke &mdash; editor flow</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">blocked</span></div>' +
      '</div>' +
      '<div data-fo-view="history">' + HISTORY + '</div>' +
      '<div data-fo-view="policy">' +
        '<div class="pp-card"><div class="pp-card-h">Policy</div>' + POLICY_KV + '</div>' +
        '<div class="pp-foot">Evidence carries currentness + revalidation results; stale evidence never satisfies a gate. Redaction applies before display.</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  PanelProtos.register('tests', 1, { name: 'Ledger', blurb: 'Policy, last run, suites, history as aligned accordion sections with the run control pinned inside Last run.', html: v1 });
  PanelProtos.register('tests', 2, { name: 'Rail Tabs', blurb: 'Runs / Failures / Policy tabs. Failures get their own surface; blocked listed separately.', html: v2 });
  PanelProtos.register('tests', 3, { name: 'Receipt Feed', blurb: 'Every run a filterable receipt card (passed / failed / blocked), latest on top.', html: v3 });
  PanelProtos.register('tests', 4, { name: 'Data Grid', blurb: 'Sticky bands: policy, last run, suites, history. One dense scroll of mono rows.', html: v4 });
  PanelProtos.register('tests', 5, { name: 'Command Bar', blurb: 'Result stats + Run/Watch/Receipt pinned; suites and history flat below.', html: v5 });
  PanelProtos.register('tests', 6, { name: 'Focus Mode', blurb: 'Latest result as the home card; suites, failures, history, policy drill in.', html: v6 });


  PanelProtos.registerCrowd('tests', [
    { group: 'suite',
      fields: { label: ['.pp-row-label', '.gr-c1'], meta: ['.pp-row-m', '.gr-c2'] },
      items: [
        { label: 'models suite', meta: '58 passed' },
        { label: 'units crate suite', meta: '112 passed' },
        { label: 'api contract suite', meta: '34 passed' },
        { label: 'web component suite', meta: '67 passed' },
        { label: 'migration suite', meta: '19 passed' }
      ] },
    { group: 'hist',
      fields: { label: ['.pp-row-label', '.gr-c1'], meta: ['.gr-c2'] },
      items: [
        { label: 'cargo test — nightly full matrix', meta: 'passed' },
        { label: 'browser smoke — upload flow', meta: 'passed' },
        { label: 'cargo test — units crate', meta: 'passed' },
        { label: 'api contract — import endpoint', meta: 'passed' },
        { label: 'cargo test — migrations', meta: '1 failed' },
        { label: 'browser smoke — login flow', meta: 'blocked' },
        { label: 'cargo test — workspace', meta: 'passed' },
        { label: 'web component — quantity editor', meta: 'passed' },
        { label: 'cargo test — import suite', meta: 'passed' },
        { label: 'native preview — slint harness', meta: 'blocked' },
        { label: 'cargo test — routes suite', meta: 'passed' },
        { label: 'cargo test — services suite', meta: 'passed' }
      ] }
  ]);
})();
