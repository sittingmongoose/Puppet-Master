/* panel-protosKimi — panels/artifacts.js
   RUNTIME ARTIFACTS side panel, 6 family variants.
   Canon kept (RAP-003/008/012/026/030/045/046/047): compact receipts with
   family chip + trust badges (freshness current/refreshing/stale, health
   healthy/degraded/unavailable), typed rows api_web_call + browser_recording
   with provenance + Open/Watch fallback, investigation bundle with evidence
   roles (baseline/repro/diagnosis/fix/verification), filters, live slot,
   deep links (Open in Chat, Orchestrator Evidence, Show in Ledger/Usage),
   payload-on-demand previews. */
(function () {
  'use strict';

  var ICON = '<span class="pp-head-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg></span>';

  var FILTERS = '' +
    '<div class="fd-filters" data-filters>' +
      '<button class="pp-flag active" data-filter="all">All</button>' +
      '<button class="pp-flag" data-filter="web">Web</button>' +
      '<button class="pp-flag" data-filter="browser">Browser</button>' +
      '<button class="pp-flag" data-filter="evidence">Evidence</button>' +
    '</div>';

  var ROW_DIFF = '' +
    '<div class="pp-attn" data-fam="evidence" data-crowd="art" style="cursor:pointer">' +
      '<div class="pp-attn-l1"><span class="pp-chip pp-chip-mono">code_diff</span><span class="pp-attn-title">Import quantity parser fix</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">success</span></div>' +
      '<div class="pp-attn-l2 pp-mono">src/services/import.rs +38 -9 &middot; regression fixture added</div>' +
      '<div class="pp-attn-l2" style="color:var(--text-muted)">no fallback &middot; 2 files &middot; node n-19 &middot; 6m ago &middot; <span class="pp-chip pp-chip-ok">current</span> <span class="pp-chip pp-chip-ok">healthy</span></div>' +
    '</div>';

  var ROW_TEST = '' +
    '<div class="pp-attn" data-fam="evidence" data-crowd="art" style="cursor:pointer">' +
      '<div class="pp-attn-l1"><span class="pp-chip pp-chip-mono">validation_test</span><span class="pp-attn-title">cargo test &mdash; import suite</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">pass on retry</span></div>' +
      '<div class="pp-attn-l2 pp-mono">214 passed &middot; 1 failed &rarr; fixed &middot; 3.4s</div>' +
      '<div class="pp-attn-l2" style="color:var(--text-muted)">retry 2 of 2 &middot; 214 cases &middot; lane-b &middot; 5m ago &middot; <span class="pp-chip pp-chip-ok">current</span></div>' +
    '</div>';

  var ROW_SHOT = '' +
    '<div class="pp-attn" data-fam="evidence" data-crowd="art" style="cursor:pointer">' +
      '<div class="pp-attn-l1"><span class="pp-chip pp-chip-mono">screenshot</span><span class="pp-attn-title">Recipe editor upload flow</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">success</span></div>' +
      '<div class="pp-attn-l2">Before/after pair &middot; media uploader with EXIF strip applied</div>' +
      '<div class="pp-attn-l2" style="color:var(--text-muted)">no fallback &middot; 2 captures &middot; lane-c &middot; 14m ago</div>' +
    '</div>';

  var ROW_WEB = '' +
    '<div class="pp-attn" data-fam="web">' +
      '<div class="pp-attn-l1"><span class="pp-chip pp-chip-acc pp-chip-mono">api_web_call</span><span class="pp-attn-title">Searching Web: schema.org Recipe markup coverage 2026</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">completed</span></div>' +
      '<div class="pp-attn-l2">operation_input: <span class="pp-mono">query = &quot;schema.org Recipe markup coverage 2026&quot;</span></div>' +
      '<div class="pp-attn-l2" style="color:var(--text-muted)">cmd.chat.web.search &middot; provider model-native &middot; no fallback &middot; cache miss &middot; 5 sources (3 read)</div>' +
      '<div class="pp-attn-l2">Agent searched web because freshness was required for import coverage claims. <span class="pp-chip">agent_judgment</span> <span class="pp-chip">scope *</span> <span class="pp-chip pp-chip-ok">approved</span></div>' +
      '<div class="pp-attn-l3"><button class="pp-mini">Sources (5)</button><button class="pp-mini">Open in Chat</button></div>' +
    '</div>';

  var ROW_BROWSER = '' +
    '<div class="pp-attn" data-fam="browser">' +
      '<div class="pp-attn-l1"><span class="pp-chip pp-chip-acc pp-chip-mono">browser_recording</span><span class="pp-attn-title">Reading Site: seriouseats.com/engineering/quantity-parsing</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">completed</span></div>' +
      '<div class="pp-attn-l2">Site Reader session <span class="pp-mono">sr-114</span> &middot; 42 actions &middot; 1 page &middot; read receipt recorded</div>' +
      '<div class="pp-attn-l2" style="color:var(--text-muted)">Site Reader (primary) &middot; no fallback &middot; citation [3] in research run &middot; 2 fields redacted</div>' +
      '<div class="pp-attn-l3"><button class="pp-mini">Open</button><button class="pp-mini">Watch</button></div>' +
    '</div>';

  var LIVE_SLOT = '' +
    '<div class="pp-note pp-dim" data-fam="web">Research run in progress &mdash; its <span class="pp-mono">api_web_call</span> artifact lands here with citations when the run completes.</div>';

  var BUNDLE = '' +
    '<div class="pp-card" data-fam="evidence">' +
      '<div class="pp-card-h">Investigation <span class="pp-card-m pp-mono">inv-import-7x</span></div>' +
      '<div class="pp-note">Import worker 7x quantity bug &mdash; bundle manifest</div>' +
      '<div style="display:flex;gap:var(--xs);flex-wrap:wrap">' +
        '<span class="pp-chip pp-chip-ok">final_state: fixed</span>' +
        '<span class="pp-chip">stop_reason: verified_fix</span>' +
        '<span class="pp-chip">artifacts: 5</span>' +
        '<span class="pp-chip pp-chip-ok">verification: strong</span>' +
      '</div>' +
      '<div class="pp-row"><span class="pp-chip pp-chip-mono">baseline</span><span class="pp-row-label">validation_test &middot; failing suite</span></div>' +
      '<div class="pp-row"><span class="pp-chip pp-chip-mono">repro</span><span class="pp-row-label">browser_recording &middot; fixture import</span></div>' +
      '<div class="pp-row"><span class="pp-chip pp-chip-mono">diagnosis</span><span class="pp-row-label">tool_llm_trace &middot; parse trace</span></div>' +
      '<div class="pp-row"><span class="pp-chip pp-chip-mono">fix</span><span class="pp-row-label">code_diff &middot; parser patch</span></div>' +
      '<div class="pp-row"><span class="pp-chip pp-chip-mono">verification</span><span class="pp-row-label">validation_test &middot; suite green</span></div>' +
      '<button class="pp-btn pp-w100" style="margin-top:var(--xs)">Open in Orchestrator Evidence</button>' +
    '</div>';

  var FOOT = '<div class="pp-foot">Rows are compact receipts &mdash; payloads load on demand from artifact refs.</div>';

  /* ============ v1 — LEDGER ============ */
  var v1 = '' +
  '<div class="pp-panel fam-ledger">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Artifacts</span><span class="pp-head-sp"></span><span class="pp-chip">7</span></div>' +
    '<div class="pp-scroll">' +
      '<div style="display:flex;gap:var(--xs);flex-wrap:wrap" data-filters>' +
        '<button class="pp-flag active" data-filter="all">All</button>' +
        '<button class="pp-flag" data-filter="web">Web</button>' +
        '<button class="pp-flag" data-filter="browser">Browser</button>' +
        '<button class="pp-flag" data-filter="evidence">Evidence</button>' +
      '</div>' +
      '<div class="lg-sec open"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Recent</span><span class="lg-sec-m">5 receipts</span></div>' +
        '<div class="lg-sec-b" style="gap:var(--sm)">' + ROW_DIFF + ROW_TEST + ROW_SHOT + ROW_WEB + ROW_BROWSER + LIVE_SLOT + '</div>' +
      '</div>' +
      '<div class="lg-sec open"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Investigation</span><span class="lg-sec-m pp-mono">inv-import-7x</span></div>' +
        '<div class="lg-sec-b">' + BUNDLE + '</div>' +
      '</div>' +
      FOOT +
    '</div>' +
  '</div>';

  /* ============ v2 — RAIL TABS ============ */
  var v2 = '' +
  '<div class="pp-panel fam-railtabs">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Artifacts</span><span class="pp-head-sp"></span><span class="pp-chip">7</span></div>' +
    '<div class="rt-strip" data-tabstrip>' +
      '<button class="rt-tab active" data-tab="all"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/></svg>All</button>' +
      '<button class="rt-tab" data-tab="web"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15.3 15.3 0 0 1 0 18 15.3 15.3 0 0 1 0-18z"/></svg>Web</button>' +
      '<button class="rt-tab" data-tab="browser"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/></svg>Browser</button>' +
      '<button class="rt-tab" data-tab="ev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>Evidence</button>' +
    '</div>' +
    '<div class="pp-scroll" data-tabscope>' +
      '<div class="rt-view active" data-tabview="all">' + ROW_DIFF + ROW_TEST + ROW_SHOT + ROW_WEB + ROW_BROWSER + LIVE_SLOT + BUNDLE + '</div>' +
      '<div class="rt-view" data-tabview="web">' + ROW_WEB + LIVE_SLOT + '</div>' +
      '<div class="rt-view" data-tabview="browser">' + ROW_BROWSER + '</div>' +
      '<div class="rt-view" data-tabview="ev">' + ROW_DIFF + ROW_TEST + ROW_SHOT + BUNDLE + '</div>' +
    '</div>' +
  '</div>';

  /* ============ v3 — RECEIPT FEED ============ */
  var v3 = '' +
  '<div class="pp-panel fam-feed">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Artifacts</span><span class="pp-head-sp"></span><span class="pp-chip">7</span></div>' +
    '<div class="pp-scroll">' +
      FILTERS +
      '<div class="fd-ghead">Receipts <span class="pp-chip">payload on demand</span></div>' +
      '<div class="fd-card" data-fam="evidence" data-crowd="art">' +
        '<div class="fd-l1"><span class="pp-chip pp-chip-mono">code_diff</span><span class="fd-title">Import quantity parser fix</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">success</span></div>' +
        '<div class="fd-l2 pp-mono">src/services/import.rs +38 -9 &middot; regression fixture added</div>' +
        '<div class="fd-l3">node n-19 &middot; 6m ago &middot; <span class="pp-chip pp-chip-ok">current</span> <span class="pp-chip pp-chip-ok">healthy</span></div>' +
        '<div class="fd-acts"><button class="pp-mini">Open diff</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="evidence" data-crowd="art">' +
        '<div class="fd-l1"><span class="pp-chip pp-chip-mono">validation_test</span><span class="fd-title">cargo test &mdash; import suite</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">pass on retry</span></div>' +
        '<div class="fd-l2 pp-mono">214 passed &middot; 1 failed &rarr; fixed &middot; 3.4s</div>' +
        '<div class="fd-l3">lane-b &middot; 5m ago &middot; <span class="pp-chip pp-chip-ok">current</span></div>' +
        '<div class="fd-acts"><button class="pp-mini">Open receipt</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="evidence" data-crowd="art">' +
        '<div class="fd-l1"><span class="pp-chip pp-chip-mono">screenshot</span><span class="fd-title">Recipe editor upload flow</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">success</span></div>' +
        '<div class="fd-l2">Before/after pair &middot; EXIF strip applied</div>' +
        '<div class="fd-l3">lane-c &middot; 14m ago</div>' +
        '<div class="fd-acts"><button class="pp-mini">View</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="web">' +
        '<div class="fd-l1"><span class="pp-chip pp-chip-acc pp-chip-mono">api_web_call</span><span class="fd-title">Searching Web: schema.org Recipe markup</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">completed</span></div>' +
        '<div class="fd-l2 pp-mono">query = &quot;schema.org Recipe markup coverage 2026&quot;</div>' +
        '<div class="fd-l3"><span class="pp-chip">agent_judgment</span> <span class="pp-chip">scope *</span> <span class="pp-chip pp-chip-ok">approved</span> &middot; 5 sources (3 read)</div>' +
        '<div class="fd-acts"><button class="pp-mini">Sources (5)</button><button class="pp-mini">Open in Chat</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="browser">' +
        '<div class="fd-l1"><span class="pp-chip pp-chip-acc pp-chip-mono">browser_recording</span><span class="fd-title">Reading Site: seriouseats.com</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">completed</span></div>' +
        '<div class="fd-l2">Site Reader sr-114 &middot; 42 actions &middot; 2 fields redacted</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open</button><button class="pp-mini">Watch</button></div>' +
      '</div>' +
      '<div class="pp-note pp-dim" data-fam="web">Research run in progress &mdash; its api_web_call artifact lands here with citations.</div>' +
      '<div class="fd-ghead">Investigation <span class="pp-chip pp-mono">inv-import-7x</span></div>' +
      '<div class="fd-card" data-fam="evidence">' +
        '<div class="fd-l1"><span class="fd-title">Import worker 7x quantity bug</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">fixed</span></div>' +
        '<div class="fd-l3"><span class="pp-chip">stop_reason: verified_fix</span> <span class="pp-chip">artifacts: 5</span> <span class="pp-chip pp-chip-ok">verification: strong</span></div>' +
        '<div class="fd-l2">baseline &rarr; repro &rarr; diagnosis &rarr; fix &rarr; verification</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open in Orchestrator</button></div>' +
      '</div>' +
      FOOT +
    '</div>' +
  '</div>';

  /* ============ v4 — DATA GRID ============ */
  var v4 = '' +
  '<div class="pp-panel fam-grid">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Artifacts</span><span class="pp-head-sp"></span>' +
      '<div class="pp-menuwrap">' +
        '<button type="button" class="pp-menu-trigger" aria-haspopup="menu" aria-expanded="false"><span class="pp-mt-label">All</span><span class="pp-mt-chev">&#9662;</span></button>' +
        '<div class="pp-menu" role="menu" aria-label="Artifact family">' +
          '<button type="button" class="pp-mitem is-selected" data-select-value="All">All</button>' +
          '<button type="button" class="pp-mitem" data-select-value="Web">Web</button>' +
          '<button type="button" class="pp-mitem" data-select-value="Browser">Browser</button>' +
          '<button type="button" class="pp-mitem" data-select-value="Evidence">Evidence</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="pp-scroll">' +
      '<div class="gr-band"><span class="gr-band-t">Receipts</span> <span class="pp-chip">5</span></div>' +
      '<div class="gr-row" data-crowd="art"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1"><span class="pp-chip pp-chip-mono">code_diff</span> Import quantity parser fix</span><span class="gr-c2">6m</span></div>' +
      '<div class="gr-sub pp-mono">src/services/import.rs +38 -9 &middot; current &middot; healthy</div>' +
      '<div class="gr-row" data-crowd="art"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1"><span class="pp-chip pp-chip-mono">validation_test</span> cargo test &mdash; import suite</span><span class="gr-c2">5m</span></div>' +
      '<div class="gr-sub pp-mono">214 passed &middot; 1 failed &rarr; fixed &middot; 3.4s &middot; current</div>' +
      '<div class="gr-row" data-crowd="art"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1"><span class="pp-chip pp-chip-mono">screenshot</span> Recipe editor upload flow</span><span class="gr-c2">14m</span></div>' +
      '<div class="gr-row"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1"><span class="pp-chip pp-chip-acc pp-chip-mono">api_web_call</span> schema.org Recipe markup</span><span class="gr-c2">web</span></div>' +
      '<div class="gr-sub">5 sources (3 read) &middot; agent_judgment &middot; approved &middot; Sources &middot; Open in Chat</div>' +
      '<div class="gr-row"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1"><span class="pp-chip pp-chip-acc pp-chip-mono">browser_recording</span> seriouseats.com</span><span class="gr-c2">sr-114</span></div>' +
      '<div class="gr-sub">42 actions &middot; 2 fields redacted &middot; Open &middot; Watch</div>' +
      '<div class="gr-band"><span class="gr-band-t">Investigation</span> <span class="pp-chip pp-mono">inv-import-7x</span></div>' +
      '<div class="gr-row"><span></span><span class="gr-c1">Import worker 7x quantity bug</span><span class="gr-c2" style="color:var(--accent-lime)">fixed</span></div>' +
      '<div class="gr-row"><span></span><span class="gr-c1"><span class="pp-chip pp-chip-mono">baseline</span> validation_test &middot; failing suite</span><span class="gr-c2"></span></div>' +
      '<div class="gr-row"><span></span><span class="gr-c1"><span class="pp-chip pp-chip-mono">repro</span> browser_recording &middot; fixture import</span><span class="gr-c2"></span></div>' +
      '<div class="gr-row"><span></span><span class="gr-c1"><span class="pp-chip pp-chip-mono">diagnosis</span> tool_llm_trace &middot; parse trace</span><span class="gr-c2"></span></div>' +
      '<div class="gr-row"><span></span><span class="gr-c1"><span class="pp-chip pp-chip-mono">fix</span> code_diff &middot; parser patch</span><span class="gr-c2"></span></div>' +
      '<div class="gr-row"><span></span><span class="gr-c1"><span class="pp-chip pp-chip-mono">verification</span> validation_test &middot; green</span><span class="gr-c2">strong</span></div>' +
      '<div class="gr-actions"><button class="pp-btn pp-w100">Open in Orchestrator Evidence</button></div>' +
    '</div>' +
  '</div>';

  /* ============ v5 — COMMAND BAR ============ */
  var v5 = '' +
  '<div class="pp-panel fam-command">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Artifacts</span><span class="pp-head-sp"></span><span class="pp-chip">7 receipts</span></div>' +
    '<div class="cm-hero">' +
      '<div class="cm-stats">' +
        '<div class="cm-stat"><span class="cm-stat-v">3</span><span class="cm-stat-k">Evidence</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">1</span><span class="cm-stat-k">Web</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">1</span><span class="cm-stat-k">Browser</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v"><span class="pp-chip pp-chip-ok">fixed</span></span><span class="cm-stat-k">inv-7x</span></div>' +
      '</div>' +
      '<div class="cm-actions"><button class="pp-btn pp-flex1">Open Orchestrator Evidence</button><button class="pp-btn pp-flex1">Show in Usage</button></div>' +
    '</div>' +
    '<div class="pp-scroll">' +
      '<div style="display:flex;gap:var(--xs);flex-wrap:wrap" data-filters>' +
        '<button class="pp-flag active" data-filter="all">All</button>' +
        '<button class="pp-flag" data-filter="web">Web</button>' +
        '<button class="pp-flag" data-filter="browser">Browser</button>' +
        '<button class="pp-flag" data-filter="evidence">Evidence</button>' +
      '</div>' +
      '<div class="cm-list-h">Latest</div>' +
      '<div class="pp-row" data-fam="evidence" data-crowd="art"><span class="pp-chip pp-chip-mono">code_diff</span><span class="pp-row-label">Import quantity parser fix</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">success</span></div>' +
      '<div class="pp-row" data-fam="evidence" data-crowd="art"><span class="pp-chip pp-chip-mono">validation_test</span><span class="pp-row-label">cargo test &mdash; import suite</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">pass on retry</span></div>' +
      '<div class="pp-row" data-fam="evidence" data-crowd="art"><span class="pp-chip pp-chip-mono">screenshot</span><span class="pp-row-label">Recipe editor upload flow</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">success</span></div>' +
      '<div class="pp-row" data-fam="web"><span class="pp-chip pp-chip-acc pp-chip-mono">api_web_call</span><span class="pp-row-label">schema.org Recipe markup coverage</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">completed</span></div>' +
      '<div class="pp-row" data-fam="browser"><span class="pp-chip pp-chip-acc pp-chip-mono">browser_recording</span><span class="pp-row-label">seriouseats.com &middot; sr-114</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">completed</span></div>' +
      '<div class="pp-note pp-dim" data-fam="web" style="padding:0 var(--xs)">Research run in progress &mdash; api_web_call lands here with citations.</div>' +
      '<div class="cm-list-h">Investigation <span class="pp-chip pp-mono">inv-import-7x</span></div>' +
      '<div class="pp-row"><span class="pp-chip pp-chip-mono">baseline</span><span class="pp-row-label">validation_test &middot; failing suite</span></div>' +
      '<div class="pp-row"><span class="pp-chip pp-chip-mono">repro</span><span class="pp-row-label">browser_recording &middot; fixture import</span></div>' +
      '<div class="pp-row"><span class="pp-chip pp-chip-mono">diagnosis</span><span class="pp-row-label">tool_llm_trace &middot; parse trace</span></div>' +
      '<div class="pp-row"><span class="pp-chip pp-chip-mono">fix</span><span class="pp-row-label">code_diff &middot; parser patch</span></div>' +
      '<div class="pp-row"><span class="pp-chip pp-chip-mono">verification</span><span class="pp-row-label">validation_test &middot; green</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">strong</span></div>' +
      FOOT +
    '</div>' +
  '</div>';

  /* ============ v6 — FOCUS MODE ============ */
  var v6 = '' +
  '<div class="pp-panel fam-focus">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Artifacts</span><span class="pp-head-sp"></span><span class="pp-chip">7</span></div>' +
    '<div class="fo-crumb"><span class="fo-crumb-home">Artifacts</span><button data-fo-back>&#8249; Home</button><span>/</span><b style="color:var(--text-secondary)" data-fo-crumb-current>Home</b></div>' +
    '<div class="pp-scroll">' +
      '<div class="fo-home">' +
        '<div class="fo-nav">' +
          '<div class="fo-navitem" data-fo-go="evidence" data-fo-label="Evidence"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg></span><span class="fo-nav-label">Evidence</span><span class="fo-nav-m">3 receipts</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="web" data-fo-label="Web"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15.3 15.3 0 0 1 0 18 15.3 15.3 0 0 1 0-18z"/></svg></span><span class="fo-nav-label">Web</span><span class="fo-nav-m">1 + live slot</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="browser" data-fo-label="Browser"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/></svg></span><span class="fo-nav-label">Browser</span><span class="fo-nav-m">sr-114</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="investigation" data-fo-label="Investigation"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg></span><span class="fo-nav-label">Investigation inv-import-7x</span><span class="fo-nav-m">fixed &middot; 5 artifacts</span><span class="fo-nav-go">&#9656;</span></div>' +
        '</div>' +
        '<div class="pp-inset" style="padding:var(--sm) var(--md)">' +
          '<div class="pp-card-h">Newest receipt</div>' +
          '<div class="pp-kv"><span class="pp-k pp-mono">code_diff</span><span class="pp-v"><span class="pp-chip pp-chip-ok">success</span></span></div>' +
          '<div class="pp-note">Import quantity parser fix &mdash; src/services/import.rs +38 -9</div>' +
          '<div class="pp-foot">no fallback &middot; 2 files &middot; node n-19 &middot; 6m ago &middot; current &middot; healthy</div>' +
        '</div>' +
        FOOT +
      '</div>' +
      '<div data-fo-view="evidence">' + ROW_DIFF + ROW_TEST + ROW_SHOT + '</div>' +
      '<div data-fo-view="web">' + ROW_WEB + LIVE_SLOT + '</div>' +
      '<div data-fo-view="browser">' + ROW_BROWSER + '</div>' +
      '<div data-fo-view="investigation">' + BUNDLE + '</div>' +
    '</div>' +
  '</div>';

  PanelProtos.register('artifacts', 1, { name: 'Ledger', blurb: 'Filters as flags; Recent and Investigation as aligned accordion sections with full trust badges on every receipt.', html: v1 });
  PanelProtos.register('artifacts', 2, { name: 'Rail Tabs', blurb: 'The family filter becomes the tab strip: All / Web / Browser / Evidence, each a clean receipt list.', html: v2 });
  PanelProtos.register('artifacts', 3, { name: 'Receipt Feed', blurb: 'The native fit: every artifact already is a receipt card — hover actions, provenance chips, trust badges.', html: v3 });
  PanelProtos.register('artifacts', 4, { name: 'Data Grid', blurb: 'Family filter as a header PM menu; receipts as mono grid rows with payload sub-rows.', html: v4 });
  PanelProtos.register('artifacts', 5, { name: 'Command Bar', blurb: 'Family counts + Orchestrator/Usage deep links pinned; flat receipt list below.', html: v5 });
  PanelProtos.register('artifacts', 6, { name: 'Focus Mode', blurb: 'Each artifact drills into its own full-height receipt view; family filter lives in the header menu.', html: v6 });


  PanelProtos.registerCrowd('artifacts', [
    { group: 'art',
      fields: { label: ['.pp-attn-title', '.fd-title', '.pp-row-label', '.gr-c1'], meta: ['.gr-c2'] },
      items: [
        { label: 'Bulk import endpoint contract', meta: '22m' },
        { label: 'EXIF strip before/after pair', meta: '31m' },
        { label: 'flaky auth refresh — trace capture', meta: '44m' },
        { label: 'release checklist draft v1.2', meta: '1h' },
        { label: 'tantivy remote cache design note', meta: '2h' },
        { label: 'lane-d infra plan approval record', meta: '2h' },
        { label: 'quantity parser fuzz corpus run', meta: '3h' },
        { label: 'ratings stars a11y audit', meta: '5h' },
        { label: 'postgres 16 upgrade dry-run log', meta: '8h' },
        { label: 'web upload flow e2e recording', meta: '1d' },
        { label: 'usage ledger weekly summary', meta: '1d' },
        { label: 'worktree cleanup advisory report', meta: '2d' }
      ] }
  ]);
})();
