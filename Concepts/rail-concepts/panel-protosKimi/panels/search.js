/* panel-protosKimi — panels/search.js
   SEARCH side panel, 6 family variants.
   Canon kept in every variant (F3-045/046/048): index freshness states
   (indexed/stale/unindexed/fallback), results-pane "(unindexed)" annotation,
   query + replace, flags (regex/case/word), include scope (PM menu — never a
   native select), grouped grep-style rows, replace preview actions, prev/next. */
(function () {
  'use strict';

  var ICON = '<span class="pp-head-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>';

  var SCOPE_MENU = '' +
    '<div class="pp-menuwrap">' +
      '<button type="button" class="pp-menu-trigger" aria-haspopup="menu" aria-expanded="false">' +
        '<span class="pp-mt-label">All Files</span><span class="pp-mt-chev">&#9662;</span>' +
      '</button>' +
      '<div class="pp-menu" role="menu" aria-label="Search scope">' +
        '<button type="button" class="pp-mitem is-selected" data-select-value="All Files">All Files</button>' +
        '<button type="button" class="pp-mitem" data-select-value="Open Files">Open Files</button>' +
        '<button type="button" class="pp-mitem" data-select-value="src/ only">src/ only</button>' +
        '<button type="button" class="pp-mitem" data-select-value="web/ only">web/ only</button>' +
        '<div class="pp-msep"></div>' +
        '<button type="button" class="pp-mitem" data-select-value="Include globs&hellip;">Include globs&hellip; <span class="pp-mi-meta">cmd.search</span></button>' +
        '<button type="button" class="pp-mitem" data-select-value="Exclude globs&hellip;">Exclude globs&hellip;</button>' +
      '</div>' +
    '</div>';

  var FLAGS = '' +
    '<button class="pp-flag active" title="Regex">.*</button>' +
    '<button class="pp-flag" title="Case sensitive">Aa</button>' +
    '<button class="pp-flag" title="Whole word">\\b</button>';

  var RESULT_ROWS = '' +
    '<div class="pp-row" style="font-weight:600;color:var(--text-secondary)"><span class="pp-row-label">src/services/import.rs</span><span class="pp-row-m">3</span></div>' +
    '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">41</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">fn parse_<span class="pp-match">quantity</span>(raw: &amp;str)</span></div>' +
    '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">58</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">// mixed fractions: not <span class="pp-match">quantity</span> 11/2</span></div>' +
    '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">73</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">normalize_units(<span class="pp-match">quantity</span>, unit)</span></div>' +
    '<div class="pp-row" style="font-weight:600;color:var(--text-secondary)"><span class="pp-row-label">src/routes/recipes.rs</span><span class="pp-row-m">2</span></div>' +
    '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">112</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">pub <span class="pp-match">quantity</span>: f32,</span></div>' +
    '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">240</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">ingredient.<span class="pp-match">quantity</span> * ratio</span></div>' +
    '<div class="pp-row" style="font-weight:600;color:var(--text-secondary)"><span class="pp-row-label">web/src/lib/Editor.svelte</span><span class="pp-row-m">2</span></div>' +
    '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">88</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">&lt;input bind:value={row.<span class="pp-match">quantity</span>} /&gt;</span></div>' +
    '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">131</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">export let <span class="pp-match">quantity</span>Step</span></div>';

  /* ============ v1 — LEDGER ============ */
  var v1 = '' +
  '<div class="pp-panel fam-ledger">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Search</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">indexed</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="lg-sec open">' +
        '<div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Index</span><span class="lg-sec-m">tantivy &middot; 1,284 docs</span></div>' +
        '<div class="lg-sec-b">' +
          '<div class="lg-grid">' +
            '<span class="pp-k">State</span><span class="pp-v"><span class="pp-chip pp-chip-ok">indexed</span></span>' +
            '<span class="pp-k">Engine</span><span class="pp-v">tantivy</span>' +
            '<span class="pp-k">Documents</span><span class="pp-v">1,284</span>' +
            '<span class="pp-k">Last indexed</span><span class="pp-v pp-mono">abc12ef &middot; 4m ago</span>' +
          '</div>' +
          '<button class="pp-btn pp-w100">Rebuild index</button>' +
        '</div>' +
      '</div>' +
      '<div class="lg-sec open">' +
        '<div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Query</span><span class="lg-sec-m">7 in 3 files</span></div>' +
        '<div class="lg-sec-b">' +
          '<div style="display:flex;gap:var(--xs)">' +
            '<button class="pp-iconb" data-replace-toggle title="Toggle replace">&#9656;</button>' +
            '<input class="pp-input pp-flex1" placeholder="Search in files..." value="quantity">' +
          '</div>' +
          '<div class="pp-hidden" data-replace-row style="display:flex;gap:var(--xs)">' +
            '<span style="width:24px;flex:none"></span>' +
            '<input class="pp-input pp-flex1" placeholder="Replace...">' +
            '<button class="pp-btn">All</button>' +
          '</div>' +
          '<div style="display:flex;gap:var(--xs);align-items:center">' + FLAGS + '<span class="pp-flex1"></span>' + SCOPE_MENU + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="lg-sec open">' +
        '<div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Results</span><span class="lg-sec-m">7 in 3 files</span></div>' +
        '<div class="lg-sec-b" style="padding-left:0;padding-right:0">' +
          '<div class="pp-foot" style="padding:0 var(--md) var(--xs)">Matches for <span class="pp-mono">quantity</span> &middot; served by index</div>' +
          RESULT_ROWS +
        '</div>' +
      '</div>' +
      '<div class="pp-btnrow">' +
        '<button class="pp-btn pp-flex1">Replace</button>' +
        '<button class="pp-btn pp-flex1">Replace all</button>' +
      '</div>' +
      '<div class="pp-btnrow" style="margin-top:0">' +
        '<button class="pp-btn pp-flex1">&#9650; Prev</button>' +
        '<button class="pp-btn pp-flex1">&#9660; Next</button>' +
      '</div>' +
      '<div class="pp-foot">Fell back to raw ripgrep, results would be marked <span class="pp-mono">(unindexed)</span> here &mdash; never in the status bar.</div>' +
    '</div>' +
  '</div>';

  /* ============ v2 — RAIL TABS ============ */
  var v2 = '' +
  '<div class="pp-panel fam-railtabs">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Search</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">indexed</span></div>' +
    '<div class="rt-strip" data-tabstrip>' +
      '<button class="rt-tab active" data-tab="find"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Find</button>' +
      '<button class="rt-tab" data-tab="replace"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>Replace</button>' +
      '<button class="rt-tab" data-tab="index"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>Index</button>' +
    '</div>' +
    '<div class="pp-scroll" data-tabscope>' +
      '<div class="rt-view active" data-tabview="find">' +
        '<input class="pp-input" placeholder="Search in files..." value="quantity">' +
        '<div style="display:flex;gap:var(--xs);align-items:center">' + FLAGS + '<span class="pp-flex1"></span>' + SCOPE_MENU + '</div>' +
        '<div class="pp-card" style="padding:var(--xs) 0">' +
          '<div class="pp-card-h" style="padding:0 var(--md)">Results <span class="pp-card-m">7 in 3 files</span></div>' +
          RESULT_ROWS +
        '</div>' +
        '<div class="pp-btnrow"><button class="pp-btn pp-flex1">&#9650; Prev</button><button class="pp-btn pp-flex1">&#9660; Next</button></div>' +
      '</div>' +
      '<div class="rt-view" data-tabview="replace">' +
        '<input class="pp-input" placeholder="Search in files..." value="quantity">' +
        '<input class="pp-input" placeholder="Replace with...">' +
        '<div class="pp-card">' +
          '<div class="pp-card-h">Preview <span class="pp-card-m">7 occurrences &middot; 3 files</span></div>' +
          '<div class="pp-note">Replace runs against the current result snapshot. Confirmation shows every file before anything is written.</div>' +
        '</div>' +
        '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Replace selected</button><button class="pp-btn pp-btn-p pp-flex1">Replace all</button></div>' +
      '</div>' +
      '<div class="rt-view" data-tabview="index">' +
        '<div class="pp-card">' +
          '<div class="pp-card-h">Search index</div>' +
          '<div class="pp-kv"><span class="pp-k">State</span><span class="pp-v"><span class="pp-chip pp-chip-ok">indexed</span></span></div>' +
          '<div class="pp-kv"><span class="pp-k">Engine</span><span class="pp-v">tantivy</span></div>' +
          '<div class="pp-kv"><span class="pp-k">Documents</span><span class="pp-v">1,284</span></div>' +
          '<div class="pp-kv"><span class="pp-k">Last indexed</span><span class="pp-v pp-mono">abc12ef &middot; 4m ago</span></div>' +
          '<div class="pp-kv"><span class="pp-k">Large-file cutoff</span><span class="pp-v">10 MB</span></div>' +
          '<button class="pp-btn pp-w100">Rebuild index</button>' +
        '</div>' +
        '<div class="pp-foot">Refresh keeps serving the last valid snapshot &mdash; Search never looks fully unindexed while one exists.</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ============ v3 — RECEIPT FEED ============ */
  var v3 = '' +
  '<div class="pp-panel fam-feed">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Search</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">indexed</span></div>' +
    '<div class="pp-scroll">' +
      '<div style="display:flex;gap:var(--xs)">' +
        '<button class="pp-iconb" data-replace-toggle title="Toggle replace">&#9656;</button>' +
        '<input class="pp-input pp-flex1" placeholder="Search in files..." value="quantity">' +
      '</div>' +
      '<div class="pp-hidden" data-replace-row style="display:flex;gap:var(--xs)">' +
        '<span style="width:24px;flex:none"></span>' +
        '<input class="pp-input pp-flex1" placeholder="Replace...">' +
        '<button class="pp-btn">All</button>' +
      '</div>' +
      '<div style="display:flex;gap:var(--xs);align-items:center">' + FLAGS + '<span class="pp-flex1"></span>' + SCOPE_MENU + '</div>' +
      '<div class="fd-ghead">Results <span class="pp-chip">7 in 3 files</span></div>' +
      '<div class="fd-card" data-fam="file" data-crowd="file">' +
        '<div class="fd-l1"><span class="fd-title">src/services/import.rs</span><span class="pp-chip" style="margin-left:auto">3</span></div>' +
        '<div class="fd-l2 pp-mono">41 &middot; fn parse_<span class="pp-match">quantity</span>(raw: &amp;str)</div>' +
        '<div class="fd-l2 pp-mono">58 &middot; // mixed fractions: not <span class="pp-match">quantity</span> 11/2</div>' +
        '<div class="fd-l2 pp-mono">73 &middot; normalize_units(<span class="pp-match">quantity</span>, unit)</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open</button><button class="pp-mini">Replace</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="file" data-crowd="file">' +
        '<div class="fd-l1"><span class="fd-title">src/routes/recipes.rs</span><span class="pp-chip" style="margin-left:auto">2</span></div>' +
        '<div class="fd-l2 pp-mono">112 &middot; pub <span class="pp-match">quantity</span>: f32,</div>' +
        '<div class="fd-l2 pp-mono">240 &middot; ingredient.<span class="pp-match">quantity</span> * ratio</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open</button><button class="pp-mini">Replace</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="file" data-crowd="file">' +
        '<div class="fd-l1"><span class="fd-title">web/src/lib/Editor.svelte</span><span class="pp-chip" style="margin-left:auto">2</span></div>' +
        '<div class="fd-l2 pp-mono">88 &middot; &lt;input bind:value={row.<span class="pp-match">quantity</span>} /&gt;</div>' +
        '<div class="fd-l2 pp-mono">131 &middot; export let <span class="pp-match">quantity</span>Step</div>' +
        '<div class="fd-acts"><button class="pp-mini">Open</button><button class="pp-mini">Replace</button></div>' +
      '</div>' +
      '<div class="fd-ghead">Session</div>' +
      '<div class="fd-card">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="fd-title">Index ready</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">indexed</span></div>' +
        '<div class="fd-l3">tantivy &middot; 1,284 docs &middot; abc12ef &middot; 4m ago</div>' +
        '<div class="fd-acts"><button class="pp-mini">Rebuild</button></div>' +
      '</div>' +
      '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Replace all</button><button class="pp-btn pp-flex1">&#9650; Prev</button><button class="pp-btn pp-flex1">&#9660; Next</button></div>' +
    '</div>' +
  '</div>';

  /* ============ v4 — DATA GRID ============ */
  var v4 = '' +
  '<div class="pp-panel fam-grid">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Search</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">indexed</span></div>' +
    '<div style="padding:var(--sm) var(--md);display:flex;gap:var(--xs);border-bottom:1px solid var(--border-light)">' +
      '<button class="pp-iconb" data-replace-toggle title="Toggle replace">&#9656;</button>' +
      '<input class="pp-input pp-flex1" placeholder="Search in files..." value="quantity">' +
    '</div>' +
    '<div class="pp-hidden" data-replace-row style="padding:var(--sm) var(--md);display:flex;gap:var(--xs);border-bottom:1px solid var(--border-light)">' +
      '<input class="pp-input pp-flex1" placeholder="Replace...">' +
      '<button class="pp-btn">All</button>' +
    '</div>' +
    '<div style="padding:var(--sm) var(--md);display:flex;gap:var(--xs);align-items:center;border-bottom:1px solid var(--border-light)">' + FLAGS + '<span class="pp-flex1"></span>' + SCOPE_MENU + '</div>' +
    '<div class="pp-scroll">' +
      '<div class="gr-band"><span class="gr-band-t">src/services/import.rs</span> <span class="pp-chip">3</span></div>' +
      '<div class="gr-row" data-crowd="hit"><span></span><span class="gr-c1 pp-mono">fn parse_<span class="pp-match">quantity</span>(raw: &amp;str)</span><span class="gr-c2">41</span></div>' +
      '<div class="gr-row" data-crowd="hit"><span></span><span class="gr-c1 pp-mono">// mixed fractions: not <span class="pp-match">quantity</span> 11/2</span><span class="gr-c2">58</span></div>' +
      '<div class="gr-row sel"><span></span><span class="gr-c1 pp-mono">normalize_units(<span class="pp-match">quantity</span>, unit)</span><span class="gr-c2">73</span></div>' +
      '<div class="gr-band"><span class="gr-band-t">src/routes/recipes.rs</span> <span class="pp-chip">2</span></div>' +
      '<div class="gr-row" data-crowd="hit"><span></span><span class="gr-c1 pp-mono">pub <span class="pp-match">quantity</span>: f32,</span><span class="gr-c2">112</span></div>' +
      '<div class="gr-row" data-crowd="hit"><span></span><span class="gr-c1 pp-mono">ingredient.<span class="pp-match">quantity</span> * ratio</span><span class="gr-c2">240</span></div>' +
      '<div class="gr-band"><span class="gr-band-t">web/src/lib/Editor.svelte</span> <span class="pp-chip">2</span></div>' +
      '<div class="gr-row" data-crowd="hit"><span></span><span class="gr-c1 pp-mono">&lt;input bind:value={row.<span class="pp-match">quantity</span>} /&gt;</span><span class="gr-c2">88</span></div>' +
      '<div class="gr-row" data-crowd="hit"><span></span><span class="gr-c1 pp-mono">export let <span class="pp-match">quantity</span>Step</span><span class="gr-c2">131</span></div>' +
      '<div class="gr-band"><span class="gr-band-t">Session</span> <span class="pp-chip pp-chip-ok">indexed</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Engine</span><span class="pp-v">tantivy</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Documents</span><span class="pp-v">1,284</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Last indexed</span><span class="pp-v pp-mono">abc12ef &middot; 4m ago</span></div>' +
      '<div class="gr-actions">' +
        '<button class="pp-btn pp-flex1">Replace</button>' +
        '<button class="pp-btn pp-flex1">Replace all</button>' +
        '<button class="pp-btn">&#9650;</button>' +
        '<button class="pp-btn">&#9660;</button>' +
        '<button class="pp-btn">Rebuild index</button>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ============ v5 — COMMAND BAR ============ */
  var v5 = '' +
  '<div class="pp-panel fam-command">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Search</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">indexed</span></div>' +
    '<div class="cm-hero">' +
      '<div style="display:flex;gap:var(--xs)">' +
        '<button class="pp-iconb" data-replace-toggle title="Toggle replace">&#9656;</button>' +
        '<input class="pp-input pp-flex1" placeholder="Search in files..." value="quantity">' +
      '</div>' +
      '<div class="pp-hidden" data-replace-row style="display:flex;gap:var(--xs)">' +
        '<input class="pp-input pp-flex1" placeholder="Replace...">' +
        '<button class="pp-btn">All</button>' +
      '</div>' +
      '<div style="display:flex;gap:var(--xs);align-items:center">' + FLAGS + '<span class="pp-flex1"></span>' + SCOPE_MENU + '</div>' +
      '<div class="cm-stats">' +
        '<div class="cm-stat"><span class="cm-stat-v">7</span><span class="cm-stat-k">Matches</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">3</span><span class="cm-stat-k">Files</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">12ms</span><span class="cm-stat-k">Indexed query</span></div>' +
      '</div>' +
      '<div class="cm-actions">' +
        '<button class="pp-btn pp-flex1">&#9650; Prev</button>' +
        '<button class="pp-btn pp-flex1">&#9660; Next</button>' +
        '<button class="pp-btn pp-btn-p pp-flex1">Replace all</button>' +
      '</div>' +
    '</div>' +
    '<div class="pp-scroll">' +
      '<div class="cm-list-h">Results <span class="pp-chip">7 in 3 files</span></div>' +
      '<div class="pp-row"><span class="pp-row-label" style="font-weight:600">src/services/import.rs</span><span class="pp-row-m">3</span></div>' +
      '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">41</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">fn parse_<span class="pp-match">quantity</span>(raw: &amp;str)</span></div>' +
      '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">58</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">// mixed fractions: not <span class="pp-match">quantity</span> 11/2</span></div>' +
      '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">73</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">normalize_units(<span class="pp-match">quantity</span>, unit)</span></div>' +
      '<div class="pp-row"><span class="pp-row-label" style="font-weight:600">src/routes/recipes.rs</span><span class="pp-row-m">2</span></div>' +
      '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">112</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">pub <span class="pp-match">quantity</span>: f32,</span></div>' +
      '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">240</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">ingredient.<span class="pp-match">quantity</span> * ratio</span></div>' +
      '<div class="pp-row"><span class="pp-row-label" style="font-weight:600">web/src/lib/Editor.svelte</span><span class="pp-row-m">2</span></div>' +
      '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">88</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">&lt;input bind:value={row.<span class="pp-match">quantity</span>} /&gt;</span></div>' +
      '<div class="pp-row" data-crowd="hit"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">131</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">export let <span class="pp-match">quantity</span>Step</span></div>' +
      '<div class="cm-list-h">Index <span class="pp-chip pp-chip-ok">indexed</span><span style="margin-left:auto"></span><button class="pp-mini">Rebuild</button></div>' +
      '<div class="pp-foot" style="padding:0 var(--xs)">tantivy &middot; 1,284 docs &middot; abc12ef &middot; 4m ago &middot; 10 MB cutoff</div>' +
    '</div>' +
  '</div>';

  /* ============ v6 — FOCUS MODE ============ */
  var v6 = '' +
  '<div class="pp-panel fam-focus">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Search</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">indexed</span></div>' +
    '<div class="fo-crumb"><span class="fo-crumb-home">Search</span><button data-fo-back>&#8249; Home</button><span>/</span><b style="color:var(--text-secondary)" data-fo-crumb-current>Home</b></div>' +
    '<div class="pp-scroll">' +
      '<div class="fo-home">' +
        '<div class="fo-nav">' +
          '<div class="fo-navitem" data-fo-go="results" data-fo-label="Results"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span><span class="fo-nav-label">Results</span><span class="fo-nav-m">7 in 3 files</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="query" data-fo-label="Query &amp; scope"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span><span class="fo-nav-label">Query &amp; scope</span><span class="fo-nav-m">quantity &middot; All Files</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="replace" data-fo-label="Replace"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg></span><span class="fo-nav-label">Replace</span><span class="fo-nav-m">preview 7</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="index" data-fo-label="Index"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></span><span class="fo-nav-label">Index</span><span class="fo-nav-m">indexed &middot; 1,284 docs</span><span class="fo-nav-go">&#9656;</span></div>' +
        '</div>' +
        '<div class="pp-inset" style="padding:var(--sm) var(--md)">' +
          '<div class="pp-card-h">Top file &mdash; src/services/import.rs <span class="pp-card-m">3</span></div>' +
          '<div class="pp-row"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">41</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">fn parse_<span class="pp-match">quantity</span>(raw: &amp;str)</span></div>' +
          '<div class="pp-row"><span class="pp-row-m" style="margin:0;width:22px;text-align:right">73</span><span class="pp-row-label pp-mono" style="font-size:var(--fs-xs)">normalize_units(<span class="pp-match">quantity</span>, unit)</span></div>' +
        '</div>' +
        '<div class="pp-foot">Each section opens full-height; the crumb takes you back home.</div>' +
      '</div>' +
      '<div data-fo-view="results">' +
        '<div class="pp-foot">Matches for <span class="pp-mono">quantity</span> &middot; All Files &middot; served by index <span class="pp-mono">abc12ef</span></div>' +
        RESULT_ROWS +
        '<div class="pp-btnrow"><button class="pp-btn pp-flex1">&#9650; Prev</button><button class="pp-btn pp-flex1">&#9660; Next</button><button class="pp-btn pp-flex1">Replace all</button></div>' +
      '</div>' +
      '<div data-fo-view="query">' +
        '<input class="pp-input" placeholder="Search in files..." value="quantity">' +
        '<div style="display:flex;gap:var(--xs);align-items:center">' + FLAGS + '<span class="pp-flex1"></span>' + SCOPE_MENU + '</div>' +
        '<div class="pp-foot">Scope maps to include/exclude globs in the command payload; the query session persists across panel switches.</div>' +
      '</div>' +
      '<div data-fo-view="replace">' +
        '<input class="pp-input" placeholder="Search in files..." value="quantity">' +
        '<input class="pp-input" placeholder="Replace with...">' +
        '<div class="pp-card"><div class="pp-card-h">Preview <span class="pp-card-m">7 occurrences &middot; 3 files</span></div><div class="pp-note">Replace runs against the current result snapshot. Confirmation shows every file before anything is written.</div></div>' +
        '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Replace selected</button><button class="pp-btn pp-btn-p pp-flex1">Replace all</button></div>' +
      '</div>' +
      '<div data-fo-view="index">' +
        '<div class="pp-card"><div class="pp-card-h">Search index</div>' +
          '<div class="pp-kv"><span class="pp-k">State</span><span class="pp-v"><span class="pp-chip pp-chip-ok">indexed</span></span></div>' +
          '<div class="pp-kv"><span class="pp-k">Engine</span><span class="pp-v">tantivy</span></div>' +
          '<div class="pp-kv"><span class="pp-k">Documents</span><span class="pp-v">1,284</span></div>' +
          '<div class="pp-kv"><span class="pp-k">Last indexed</span><span class="pp-v pp-mono">abc12ef &middot; 4m ago</span></div>' +
          '<div class="pp-kv"><span class="pp-k">Large-file cutoff</span><span class="pp-v">10 MB</span></div>' +
          '<button class="pp-btn pp-w100">Rebuild index</button>' +
        '</div>' +
        '<div class="pp-foot">Refresh keeps serving the last valid snapshot &mdash; Search never looks fully unindexed while one exists.</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  PanelProtos.register('search', 1, { name: 'Ledger', blurb: 'Accordion sections with strict two-column alignment. Index, query, and results each collapse; values right-align so nothing drifts.', html: v1 });
  PanelProtos.register('search', 2, { name: 'Rail Tabs', blurb: 'Find / Replace / Index as icon tabs. One job per view; no accordions, no stacked cards.', html: v2 });
  PanelProtos.register('search', 3, { name: 'Receipt Feed', blurb: 'Every file is a compact card with hover actions. Query controls ride the top as a slim bar.', html: v3 });
  PanelProtos.register('search', 4, { name: 'Data Grid', blurb: 'Sticky file bands, fixed line-number column, mono rows. Maximum density, zero card chrome.', html: v4 });
  PanelProtos.register('search', 5, { name: 'Command Bar', blurb: 'Query + key stats + primary actions pinned under the header; results are a plain list below.', html: v5 });
  PanelProtos.register('search', 6, { name: 'Focus Mode', blurb: 'One section at a time via the header section menu. Results drill in per file.', html: v6 });

  PanelProtos.registerCrowd('search', [
    { group: 'hit',
      fields: { label: ['.gr-c1', '.pp-row-label'], meta: ['.gr-c2', '.pp-row-m'] },
      items: [
        { label: 'let servings = row.quantity * ratio(requested)', meta: '204' },
        { label: 'Quantity::from_str(raw).map_err(ParseErr::Mixed)', meta: '96' },
        { label: 'assert_eq!(normalize_units(quantity, unit), expected)', meta: '318' },
        { label: 'const quantityStep = snap(0.25)', meta: '57' },
        { label: 'display_quantity(qty.value, qty.unit, locale)', meta: '141' },
        { label: 'debug!("quantity parse fallback engaged", raw)', meta: '66' },
        { label: 'fn estimate_quantity_from_text(span: &str) -> Option<Qty>', meta: '12' },
        { label: 'row.quantity = clamp(row.quantity, MIN_QTY, MAX_QTY)', meta: '233' },
        { label: 'if quantity.is_nan() { return Err(InputError::BadQuantity) }', meta: '175' },
        { label: 'let scaled = quantity * factor * calibration::CUP_ML', meta: '289' },
        { label: 'write!(f, "{}", quantity.round_dp(2))', meta: '340' },
        { label: 'quantity_label.set_text(&format_qty(quantity))', meta: '88' }
      ] },
    { group: 'file',
      fields: { label: ['.fd-title'] },
      items: [
        { label: 'src/services/normalize.rs' },
        { label: 'src/routes/import.rs' },
        { label: 'tests/quantity_parser_fixture.rs' },
        { label: 'web/src/lib/RecipeRow.svelte' },
        { label: 'web/src/lib/units/quantity-format.ts' },
        { label: 'web/src/routes/recipe/[id]/+page.svelte' }
      ] }
  ]);
})();
