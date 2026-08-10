/* panel-protosKimi — panels/docker.js
   DOCKER MANAGER side panel, 6 family variants.
   Canon kept (CRAU-007/009/011/012/013/022/029/035/063): runtime detection
   banner, 6 stable subviews + advanced foldouts (Networks/Volumes/Contexts),
   container rows with lifecycle actions, images with digest visibility +
   cleanup advisor (dry-run, protected assets), compose services + scenarios
   with stale-repair, registries with capability-disabled-with-reason, build
   target/tag/digest, publish chain with missing-link + hard gate + template
   repo states, Docker/Hosts as a routed page deep link (never a tab). */
(function () {
  'use strict';

  var ICON = '<span class="pp-head-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>';

  var RUNTIME_BANNER = '' +
    '<div style="display:flex;align-items:center;gap:var(--sm);padding:var(--sm) var(--md);font-size:var(--fs-2xs);color:var(--text-secondary);border-bottom:1px solid var(--border-light)">' +
      '<span class="pp-dot pp-dot-ok">&#9679;</span><span>Docker &middot; context <span class="pp-mono">default</span></span><span class="pp-chip pp-chip-ok" style="margin-left:auto">detected</span>' +
    '</div>';

  var CONTAINER_ROWS_FULL = '' +
    '<div class="pp-row" data-crowd="ctr"><span class="pp-dot pp-dot-run">&#9679;</span><span class="pp-row-label pp-mono">tastebook-web</span><span class="pp-row-m">:5173 &middot; up 4h</span><span style="margin-left:auto;display:flex;gap:2px"><button class="pp-mini" title="Logs">Logs</button><button class="pp-mini" title="Stop">Stop</button></span></div>' +
    '<div class="pp-row" data-crowd="ctr"><span class="pp-dot pp-dot-run">&#9679;</span><span class="pp-row-label pp-mono">tastebook-worker</span><span class="pp-row-m">up 4h</span><span style="margin-left:auto;display:flex;gap:2px"><button class="pp-mini" title="Logs">Logs</button><button class="pp-mini" title="Stop">Stop</button></span></div>' +
    '<div class="pp-row" data-crowd="ctr"><span class="pp-dot pp-dot-run">&#9679;</span><span class="pp-row-label pp-mono">postgres</span><span class="pp-row-m">:5432 &middot; up 2d</span><span style="margin-left:auto;display:flex;gap:2px"><button class="pp-mini" title="Logs">Logs</button><button class="pp-mini" title="Stop">Stop</button></span></div>' +
    '<div class="pp-row" data-crowd="ctr"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="pp-row-label pp-mono">redis</span><span class="pp-row-m">exited 2h ago</span><span style="margin-left:auto;display:flex;gap:2px"><button class="pp-mini" title="Start">Start</button><button class="pp-mini danger" title="Remove">&#10005;</button></span></div>' +
    '<div class="pp-row" data-crowd="ctr"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="pp-row-label pp-mono">import-worker</span><span class="pp-row-m">restarting x3</span><span style="margin-left:auto;display:flex;gap:2px"><button class="pp-mini" title="Logs">Logs</button><button class="pp-mini" title="Inspect">Inspect</button></span></div>';

  var IMAGES = '' +
    '<div class="pp-row" data-crowd="img"><span class="pp-row-label pp-mono">jared/tastebook:v1.1</span><span class="pp-row-m">412 MB</span></div>' +
    '<div class="pp-row" data-crowd="img"><span class="pp-row-label pp-mono">jared/tastebook-worker:v1.1</span><span class="pp-row-m">388 MB</span></div>' +
    '<div class="pp-row" data-crowd="img"><span class="pp-row-label pp-mono">postgres:16-alpine</span><span class="pp-row-m">243 MB</span></div>' +
    '<div class="pp-row" data-crowd="img"><span class="pp-row-label pp-mono">redis:7-alpine</span><span class="pp-row-m">41 MB</span></div>' +
    '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Pull</button><button class="pp-btn pp-flex1" title="Dry-run: frees 1.2 GB across 6 dangling layers — protected assets untouched">Cleanup Advisor</button></div>';

  var COMPOSE = '' +
    '<div class="pp-row" data-crowd="svc"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">db</span><span class="pp-row-m">postgres:16</span></div>' +
    '<div class="pp-row" data-crowd="svc"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">cache</span><span class="pp-row-m">redis:7</span></div>' +
    '<div class="pp-row" data-crowd="svc"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="pp-row-label">web</span><span class="pp-row-m">tastebook:v1.1</span></div>' +
    '<div class="pp-row" data-crowd="svc"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="pp-row-label">worker</span><span class="pp-row-m">tastebook-worker:v1.1</span></div>' +
    '<button class="pp-btn pp-btn-p pp-w100">Compose up</button>' +
    '<div class="pp-card-h" style="padding-top:var(--sm)">Scenarios</div>' +
    '<div class="pp-row"><span class="pp-row-label">dev &mdash; web + db only</span><button class="pp-mini" style="margin-left:auto">Run</button></div>' +
    '<div class="pp-row"><span class="pp-row-label">import-load &mdash; worker x3</span><span class="pp-chip pp-chip-warn">stale</span><button class="pp-mini" style="margin-left:auto" disabled title="Stale: compose file changed since saved — edit to refresh">Run</button></div>';

  var REGISTRIES = '' +
    '<div class="pp-kv"><span class="pp-k">Docker Hub</span><span class="pp-v">jared <span class="pp-chip pp-chip-ok">authenticated</span></span></div>' +
    '<div class="pp-kv"><span class="pp-k pp-mono">localhost:5000</span><span class="pp-v">registry-cache <span class="pp-chip pp-chip-ok">reachable</span></span></div>' +
    '<div class="pp-kv"><span class="pp-k pp-mono">ghcr.io</span><span class="pp-v"><span class="pp-chip pp-chip-warn" title="Blocked: not_configured — add a token in Settings > Integrations">not_configured</span></span></div>' +
    '<div class="pp-foot">ghcr push stays visible but disabled: missing <span class="pp-mono">images:push</span> capability &mdash; add a token in Settings &gt; Integrations.</div>' +
    '<button class="pp-btn pp-w100">Browse jared/tastebook</button>';

  var BUILD = '' +
    '<div class="pp-kv"><span class="pp-k">Dockerfile target</span><span class="pp-v pp-mono">runtime</span></div>' +
    '<div class="pp-kv"><span class="pp-k">Tag</span><span class="pp-v pp-mono">jared/tastebook:v1.2</span></div>' +
    '<div class="pp-kv"><span class="pp-k">Digest</span><span class="pp-v pp-mono">&mdash; not built yet</span></div>' +
    '<button class="pp-btn pp-btn-p pp-w100">Build image</button>' +
    '<div class="pp-foot">Buildx detected &middot; bake file none &middot; multi-arch amd64+arm64</div>';

  var PUBLISH_CHAIN = '' +
    '<div class="pp-row"><span class="pp-chip" style="width:18px;justify-content:center">1</span><span class="pp-row-label">Local build</span><span class="pp-chip" style="margin-left:auto">pending</span></div>' +
    '<div class="pp-row"><span class="pp-chip" style="width:18px;justify-content:center">2</span><span class="pp-row-label">Push tag + digest</span><span class="pp-chip" style="margin-left:auto">pending</span></div>' +
    '<div class="pp-row"><span class="pp-chip" style="width:18px;justify-content:center">3</span><span class="pp-row-label">Hub repo jared/tastebook</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">exists</span></div>' +
    '<div class="pp-row"><span class="pp-chip" style="width:18px;justify-content:center">4</span><span class="pp-row-label">Unraid template repo</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">ready_to_push</span></div>' +
    '<div class="pp-row"><span class="pp-chip" style="width:18px;justify-content:center">5</span><span class="pp-row-label">Unraid follow-on</span><span class="pp-chip" style="margin-left:auto">waiting</span></div>' +
    '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Push image</button><button class="pp-btn pp-flex1">Commit template</button><button class="pp-btn pp-flex1">Push template</button></div>' +
    '<div class="pp-foot">Repo creation is a hard gate &middot; digest receipts recorded &middot; partial chains show a missing-link marker.</div>';

  var FOLDOUTS = '' +
    '<div class="pp-card-h" style="padding-top:var(--sm)">Advanced</div>' +
    '<div class="pp-row"><span class="pp-row-label">Networks</span><span class="pp-row-m">2</span></div>' +
    '<div class="pp-row"><span class="pp-row-label">Volumes</span><span class="pp-row-m">3</span></div>' +
    '<div class="pp-row"><span class="pp-row-label">Contexts</span><span class="pp-row-m">default</span></div>' +
    '<button class="pp-btn pp-w100" title="Docker/Hosts is a routed page — opens in the center stage">Open Docker/Hosts page</button>';

  /* ============ v1 — LEDGER ============ */
  var v1 = '' +
  '<div class="pp-panel fam-ledger">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Docker Manager</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">detected</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="lg-sec open"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Containers</span><span class="lg-sec-m">3 running &middot; 1 exited &middot; 1 restarting</span></div>' +
        '<div class="lg-sec-b">' + CONTAINER_ROWS_FULL + '<div class="pp-foot">Logs stream into the Docker terminal group.</div></div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Images</span><span class="lg-sec-m">4 &middot; 1.2 GB reclaimable</span></div>' +
        '<div class="lg-sec-b">' + IMAGES + '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Compose</span><span class="lg-sec-m">tastebook &middot; 4 services</span></div>' +
        '<div class="lg-sec-b">' + COMPOSE + '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Registries</span><span class="lg-sec-m">2 ok &middot; 1 blocked</span></div>' +
        '<div class="lg-sec-b">' + REGISTRIES + '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Build / Bake</span><span class="lg-sec-m">v1.2</span></div>' +
        '<div class="lg-sec-b">' + BUILD + '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Publish / Unraid</span><span class="lg-sec-m">v1.2 &middot; 2 of 5 done</span></div>' +
        '<div class="lg-sec-b">' + PUBLISH_CHAIN + '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Advanced</span><span class="lg-sec-m">Networks &middot; Volumes &middot; Contexts</span></div>' +
        '<div class="lg-sec-b">' + FOLDOUTS + '</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ============ v2 — RAIL TABS ============ */
  var v2 = '' +
  '<div class="pp-panel fam-railtabs">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Docker Manager</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">detected</span></div>' +
    RUNTIME_BANNER +
    '<div class="rt-strip" data-tabstrip>' +
      '<button class="rt-tab active" data-tab="c"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>Boxes</button>' +
      '<button class="rt-tab" data-tab="i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>Images</button>' +
      '<button class="rt-tab" data-tab="k"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>Compose</button>' +
      '<button class="rt-tab" data-tab="r"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>Registry</button>' +
      '<button class="rt-tab" data-tab="b"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>Build</button>' +
      '<button class="rt-tab" data-tab="p"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>Publish</button>' +
    '</div>' +
    '<div class="pp-scroll" data-tabscope>' +
      '<div class="rt-view active" data-tabview="c">' + CONTAINER_ROWS_FULL + '<div class="pp-foot">Logs stream into the Docker terminal group.</div>' + FOLDOUTS + '</div>' +
      '<div class="rt-view" data-tabview="i">' + IMAGES + '</div>' +
      '<div class="rt-view" data-tabview="k">' + COMPOSE + '</div>' +
      '<div class="rt-view" data-tabview="r">' + REGISTRIES + '</div>' +
      '<div class="rt-view" data-tabview="b">' + BUILD + '</div>' +
      '<div class="rt-view" data-tabview="p">' + PUBLISH_CHAIN + '</div>' +
    '</div>' +
  '</div>';

  /* ============ v3 — RECEIPT FEED ============ */
  var v3 = '' +
  '<div class="pp-panel fam-feed">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Docker Manager</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">detected</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="fd-filters" data-filters>' +
        '<button class="pp-flag active" data-filter="all">All</button>' +
        '<button class="pp-flag" data-filter="box">Containers</button>' +
        '<button class="pp-flag" data-filter="img">Images</button>' +
        '<button class="pp-flag" data-filter="ops">Ops</button>' +
      '</div>' +
      '<div class="fd-ghead">Attention <span class="pp-chip pp-chip-warn">1</span></div>' +
      '<div class="fd-card" data-fam="box">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="fd-title pp-mono">import-worker</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">restarting x3</span></div>' +
        '<div class="fd-l3">restart loop &mdash; owned by Docker Manager attention</div>' +
        '<div class="fd-acts"><button class="pp-mini">Logs</button><button class="pp-mini">Inspect</button></div>' +
      '</div>' +
      '<div class="fd-ghead">Containers <span class="pp-chip">3 up &middot; 1 exited</span></div>' +
      '<div class="fd-card" data-fam="box" data-crowd="ctr"><div class="fd-l1"><span class="pp-dot pp-dot-run">&#9679;</span><span class="fd-title pp-mono">tastebook-web</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">running</span></div><div class="fd-l3">:5173 &middot; up 4h</div><div class="fd-acts"><button class="pp-mini">Logs</button><button class="pp-mini">Stop</button></div></div>' +
      '<div class="fd-card" data-fam="box" data-crowd="ctr"><div class="fd-l1"><span class="pp-dot pp-dot-run">&#9679;</span><span class="fd-title pp-mono">tastebook-worker</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">running</span></div><div class="fd-l3">up 4h</div><div class="fd-acts"><button class="pp-mini">Logs</button><button class="pp-mini">Stop</button></div></div>' +
      '<div class="fd-card" data-fam="box" data-crowd="ctr"><div class="fd-l1"><span class="pp-dot pp-dot-run">&#9679;</span><span class="fd-title pp-mono">postgres</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">running</span></div><div class="fd-l3">:5432 &middot; up 2d</div><div class="fd-acts"><button class="pp-mini">Logs</button><button class="pp-mini">Stop</button></div></div>' +
      '<div class="fd-card" data-fam="box" data-crowd="ctr"><div class="fd-l1"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="fd-title pp-mono">redis</span><span class="pp-chip" style="margin-left:auto">exited</span></div><div class="fd-l3">exited 2h ago</div><div class="fd-acts"><button class="pp-mini">Start</button><button class="pp-mini danger">Remove</button></div></div>' +
      '<div class="fd-ghead">Images <span class="pp-chip">1.2 GB reclaimable</span></div>' +
      '<div class="fd-card" data-fam="img" data-crowd="img"><div class="fd-l1"><span class="fd-title pp-mono">jared/tastebook:v1.1</span><span class="pp-chip" style="margin-left:auto">412 MB</span></div><div class="fd-l3">digest pinned in receipts</div></div>' +
      '<div class="fd-card" data-fam="img" data-crowd="img"><div class="fd-l1"><span class="fd-title pp-mono">postgres:16-alpine</span><span class="pp-chip" style="margin-left:auto">243 MB</span></div></div>' +
      '<div class="fd-card" data-fam="img"><div class="fd-l1"><span class="fd-title">Cleanup advisor</span><span class="pp-chip" style="margin-left:auto">dry-run</span></div><div class="fd-l3">frees 1.2 GB across 6 dangling layers &middot; protected assets untouched</div><div class="fd-acts"><button class="pp-mini">Review</button></div></div>' +
      '<div class="fd-ghead">Ops <span class="pp-chip">compose &middot; publish</span></div>' +
      '<div class="fd-card" data-fam="ops"><div class="fd-l1"><span class="fd-title">Compose &mdash; tastebook</span><span class="pp-chip" style="margin-left:auto">2 of 4 up</span></div><div class="fd-l3">db &middot; cache up &middot; web &middot; worker down</div><div class="fd-acts"><button class="pp-mini">Compose up</button></div></div>' +
      '<div class="fd-card" data-fam="ops"><div class="fd-l1"><span class="fd-title">Scenario: import-load</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">stale</span></div><div class="fd-l3">compose file changed since saved &mdash; edit to refresh</div><div class="fd-acts"><button class="pp-mini" disabled title="Stale scenario">Run</button></div></div>' +
      '<div class="fd-card" data-fam="ops"><div class="fd-l1"><span class="fd-title">Publish chain v1.2 &rarr; Unraid</span><span class="pp-chip" style="margin-left:auto">2 of 5</span></div><div class="fd-l3">build pending &middot; push pending &middot; hub exists &middot; template ready_to_push &middot; unraid waiting</div><div class="fd-acts"><button class="pp-mini">Open chain</button></div></div>' +
      '<div class="fd-card" data-fam="ops"><div class="fd-l1"><span class="fd-title">ghcr.io</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">not_configured</span></div><div class="fd-l3">missing images:push capability &mdash; add a token in Settings &gt; Integrations</div></div>' +
      '<div class="fd-card" data-fam="ops"><div class="fd-l1"><span class="fd-title">Docker/Hosts</span></div><div class="fd-l3">routed page for runtime detail &mdash; opens in the center stage</div><div class="fd-acts"><button class="pp-mini">Open page</button></div></div>' +
    '</div>' +
  '</div>';

  /* ============ v4 — DATA GRID ============ */
  var v4 = '' +
  '<div class="pp-panel fam-grid">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Docker Manager</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">detected</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="gr-band"><span class="gr-band-t">Containers</span> <span class="pp-chip">3/5 up</span></div>' +
      '<div class="gr-row" data-crowd="ctr"><span class="pp-dot pp-dot-run">&#9679;</span><span class="gr-c1 pp-mono">tastebook-web</span><span class="gr-c2">:5173 &middot; 4h</span></div>' +
      '<div class="gr-row" data-crowd="ctr"><span class="pp-dot pp-dot-run">&#9679;</span><span class="gr-c1 pp-mono">tastebook-worker</span><span class="gr-c2">4h</span></div>' +
      '<div class="gr-row" data-crowd="ctr"><span class="pp-dot pp-dot-run">&#9679;</span><span class="gr-c1 pp-mono">postgres</span><span class="gr-c2">:5432 &middot; 2d</span></div>' +
      '<div class="gr-row" data-crowd="ctr"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="gr-c1 pp-mono">redis</span><span class="gr-c2">exited 2h</span></div>' +
      '<div class="gr-row sel" data-crowd="ctr"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="gr-c1 pp-mono">import-worker</span><span class="gr-c2">restarting x3</span></div>' +
      '<div class="gr-sub">restart loop &middot; actions: Logs &middot; Inspect &middot; Stop</div>' +
      '<div class="gr-band"><span class="gr-band-t">Images</span> <span class="pp-chip">4</span></div>' +
      '<div class="gr-row" data-crowd="img"><span></span><span class="gr-c1 pp-mono">jared/tastebook:v1.1</span><span class="gr-c2">412 MB</span></div>' +
      '<div class="gr-row" data-crowd="img"><span></span><span class="gr-c1 pp-mono">jared/tastebook-worker:v1.1</span><span class="gr-c2">388 MB</span></div>' +
      '<div class="gr-row" data-crowd="img"><span></span><span class="gr-c1 pp-mono">postgres:16-alpine</span><span class="gr-c2">243 MB</span></div>' +
      '<div class="gr-row" data-crowd="img"><span></span><span class="gr-c1 pp-mono">redis:7-alpine</span><span class="gr-c2">41 MB</span></div>' +
      '<div class="gr-actions"><button class="pp-btn pp-flex1">Pull</button><button class="pp-btn pp-flex1">Cleanup Advisor</button></div>' +
      '<div class="gr-band"><span class="gr-band-t">Compose &mdash; tastebook</span> <span class="pp-chip">2/4 up</span></div>' +
      '<div class="gr-row" data-crowd="svc"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1">db</span><span class="gr-c2">postgres:16</span></div>' +
      '<div class="gr-row" data-crowd="svc"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1">cache</span><span class="gr-c2">redis:7</span></div>' +
      '<div class="gr-row" data-crowd="svc"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="gr-c1">web</span><span class="gr-c2">v1.1</span></div>' +
      '<div class="gr-row" data-crowd="svc"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="gr-c1">worker</span><span class="gr-c2">v1.1</span></div>' +
      '<div class="gr-sub">scenarios: dev (run) &middot; import-load (stale &mdash; edit to refresh)</div>' +
      '<div class="gr-actions"><button class="pp-btn pp-btn-p pp-w100">Compose up</button></div>' +
      '<div class="gr-band"><span class="gr-band-t">Registries</span> <span class="pp-chip pp-chip-warn">1 blocked</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Docker Hub</span><span class="pp-v">jared &middot; <span class="pp-chip pp-chip-ok">authenticated</span></span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k pp-mono">localhost:5000</span><span class="pp-v"><span class="pp-chip pp-chip-ok">reachable</span></span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k pp-mono">ghcr.io</span><span class="pp-v"><span class="pp-chip pp-chip-warn">not_configured</span></span></div>' +
      '<div class="gr-band"><span class="gr-band-t">Build / Bake</span> <span class="pp-chip">v1.2</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Target</span><span class="pp-v pp-mono">runtime</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Tag</span><span class="pp-v pp-mono">jared/tastebook:v1.2</span></div>' +
      '<div class="gr-kv"><span></span><span class="pp-k">Digest</span><span class="pp-v pp-mono">&mdash; not built yet</span></div>' +
      '<div class="gr-actions"><button class="pp-btn pp-btn-p pp-w100">Build image</button></div>' +
      '<div class="gr-band"><span class="gr-band-t">Publish / Unraid</span> <span class="pp-chip">2 of 5</span></div>' +
      '<div class="gr-row"><span class="gr-c2">1</span><span class="gr-c1">Local build</span><span class="gr-c2">pending</span></div>' +
      '<div class="gr-row"><span class="gr-c2">2</span><span class="gr-c1">Push tag + digest</span><span class="gr-c2">pending</span></div>' +
      '<div class="gr-row"><span class="gr-c2">3</span><span class="gr-c1">Hub repo jared/tastebook</span><span class="gr-c2" style="color:var(--accent-lime)">exists</span></div>' +
      '<div class="gr-row"><span class="gr-c2">4</span><span class="gr-c1">Unraid template repo</span><span class="gr-c2" style="color:var(--accent-lime)">ready_to_push</span></div>' +
      '<div class="gr-row"><span class="gr-c2">5</span><span class="gr-c1">Unraid follow-on</span><span class="gr-c2">waiting</span></div>' +
      '<div class="gr-actions"><button class="pp-btn pp-flex1">Push image</button><button class="pp-btn pp-flex1">Commit template</button><button class="pp-btn pp-flex1">Push template</button></div>' +
      '<div class="gr-actions" style="padding-top:0"><button class="pp-btn pp-w100">Open Docker/Hosts page</button></div>' +
    '</div>' +
  '</div>';

  /* ============ v5 — COMMAND BAR ============ */
  var v5 = '' +
  '<div class="pp-panel fam-command">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Docker Manager</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">detected</span></div>' +
    '<div class="cm-hero">' +
      '<div class="cm-stats">' +
        '<div class="cm-stat"><span class="cm-stat-v">3/5</span><span class="cm-stat-k">Up</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v"><span class="pp-chip pp-chip-warn">1</span></span><span class="cm-stat-k">Loops</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">1.2 GB</span><span class="cm-stat-k">Reclaim</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">2/5</span><span class="cm-stat-k">Chain</span></div>' +
      '</div>' +
      '<div class="cm-actions"><button class="pp-btn pp-btn-p pp-flex1">Compose up</button><button class="pp-btn pp-flex1">Build v1.2</button><button class="pp-btn pp-flex1">Push image</button></div>' +
    '</div>' +
    '<div class="pp-scroll">' +
      '<div class="cm-list-h">Containers <span class="pp-chip">context default</span></div>' +
      '<div class="pp-row" data-crowd="ctr"><span class="pp-dot pp-dot-run">&#9679;</span><span class="pp-row-label pp-mono">tastebook-web</span><span class="pp-row-m">:5173</span></div>' +
      '<div class="pp-row" data-crowd="ctr"><span class="pp-dot pp-dot-run">&#9679;</span><span class="pp-row-label pp-mono">tastebook-worker</span><span class="pp-row-m">4h</span></div>' +
      '<div class="pp-row" data-crowd="ctr"><span class="pp-dot pp-dot-run">&#9679;</span><span class="pp-row-label pp-mono">postgres</span><span class="pp-row-m">:5432</span></div>' +
      '<div class="pp-row" data-crowd="ctr"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="pp-row-label pp-mono">redis</span><span class="pp-row-m">exited 2h</span></div>' +
      '<div class="pp-row" data-crowd="ctr"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="pp-row-label pp-mono">import-worker</span><span class="pp-row-m">restarting x3</span><span style="margin-left:auto;display:flex;gap:2px"><button class="pp-mini">Logs</button></span></div>' +
      '<div class="cm-list-h">Compose <span class="pp-chip">2/4 up</span></div>' +
      '<div class="pp-row" data-crowd="svc"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">db &middot; cache</span><span class="pp-row-m">running</span></div>' +
      '<div class="pp-row"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="pp-row-label">web &middot; worker</span><span class="pp-row-m">down</span></div>' +
      '<div class="pp-row"><span class="pp-row-label">Scenario: import-load</span><span class="pp-chip pp-chip-warn">stale</span><button class="pp-mini" style="margin-left:auto" disabled title="Stale scenario — edit to refresh">Run</button></div>' +
      '<div class="cm-list-h">Publish chain <span class="pp-chip">v1.2 &rarr; Unraid</span></div>' +
      '<div class="pp-row"><span class="pp-chip" style="width:18px;justify-content:center">1</span><span class="pp-row-label">Local build</span><span class="pp-chip" style="margin-left:auto">pending</span></div>' +
      '<div class="pp-row"><span class="pp-chip" style="width:18px;justify-content:center">2</span><span class="pp-row-label">Push tag + digest</span><span class="pp-chip" style="margin-left:auto">pending</span></div>' +
      '<div class="pp-row"><span class="pp-chip" style="width:18px;justify-content:center">3</span><span class="pp-row-label">Hub repo</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">exists</span></div>' +
      '<div class="pp-row"><span class="pp-chip" style="width:18px;justify-content:center">4</span><span class="pp-row-label">Template repo</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">ready_to_push</span></div>' +
      '<div class="pp-row"><span class="pp-chip" style="width:18px;justify-content:center">5</span><span class="pp-row-label">Unraid follow-on</span><span class="pp-chip" style="margin-left:auto">waiting</span></div>' +
      '<div class="pp-foot" style="padding:0 var(--xs)">repo creation is a hard gate &middot; missing-link markers on partial chains</div>' +
      '<div class="cm-list-h">Registries <span class="pp-chip pp-chip-warn">ghcr blocked</span></div>' +
      '<div class="pp-kv" style="padding:0 var(--xs)"><span class="pp-k">Docker Hub &middot; localhost:5000</span><span class="pp-v"><span class="pp-chip pp-chip-ok">authenticated</span> <span class="pp-chip pp-chip-ok">reachable</span></span></div>' +
      '<div class="pp-kv" style="padding:0 var(--xs)"><span class="pp-k pp-mono">ghcr.io</span><span class="pp-v"><span class="pp-chip pp-chip-warn">not_configured</span></span></div>' +
      '<div class="pp-btnrow" style="padding:0 var(--xs)"><button class="pp-btn pp-flex1">Cleanup Advisor</button><button class="pp-btn pp-flex1">Docker/Hosts page</button></div>' +
    '</div>' +
  '</div>';

  /* ============ v6 — FOCUS MODE ============ */
  var v6 = '' +
  '<div class="pp-panel fam-focus">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Docker Manager</span><span class="pp-head-sp"></span><span class="pp-chip pp-chip-ok">detected</span></div>' +
    '<div class="fo-crumb"><span class="fo-crumb-home">Docker Manager</span><button data-fo-back>&#8249; Home</button><span>/</span><b style="color:var(--text-secondary)" data-fo-crumb-current>Home</b></div>' +
    '<div class="pp-scroll">' +
      '<div class="fo-home">' +
        '<div class="pp-attn pp-attn-warn">' +
          '<div class="pp-attn-l1"><span class="pp-dot pp-dot-warn">&#9679;</span><span class="pp-attn-title pp-mono">import-worker</span><span class="pp-chip pp-chip-warn" style="margin-left:auto">restarting x3</span></div>' +
          '<div class="pp-attn-l2">Restart loop &mdash; Docker Manager owns this attention item.</div>' +
          '<div class="pp-attn-l3"><button class="pp-btn">Logs</button><button class="pp-mini">Inspect</button></div>' +
        '</div>' +
        '<div class="fo-nav">' +
          '<div class="fo-navitem" data-fo-go="containers" data-fo-label="Containers"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg></span><span class="fo-nav-label">Containers</span><span class="fo-nav-m">3 of 5 up</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="images" data-fo-label="Images"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg></span><span class="fo-nav-label">Images</span><span class="fo-nav-m">4 &middot; 1.2 GB reclaimable</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="compose" data-fo-label="Compose"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></span><span class="fo-nav-label">Compose</span><span class="fo-nav-m">2 of 4 up</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="registries" data-fo-label="Registries"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></span><span class="fo-nav-label">Registries</span><span class="fo-nav-m">2 ok &middot; 1 blocked</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="build" data-fo-label="Build / Bake"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span><span class="fo-nav-label">Build / Bake</span><span class="fo-nav-m">v1.2</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="publish" data-fo-label="Publish / Unraid"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg></span><span class="fo-nav-label">Publish / Unraid</span><span class="fo-nav-m">2 of 5 done</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="hosts" data-fo-label="Docker/Hosts"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg></span><span class="fo-nav-label">Docker/Hosts</span><span class="fo-nav-m">routed page</span><span class="fo-nav-go">&#9656;</span></div>' +
        '</div>' +
        '<div class="pp-foot">Networks, Volumes, and Contexts live under Advanced inside each view.</div>' +
      '</div>' +
      '<div data-fo-view="containers">' + CONTAINER_ROWS_FULL + '<div class="pp-foot">Logs stream into the Docker terminal group.</div></div>' +
      '<div data-fo-view="images">' + IMAGES + '</div>' +
      '<div data-fo-view="compose">' + COMPOSE + '</div>' +
      '<div data-fo-view="registries">' + REGISTRIES + '</div>' +
      '<div data-fo-view="build">' + BUILD + '</div>' +
      '<div data-fo-view="publish">' + PUBLISH_CHAIN + '</div>' +
      '<div data-fo-view="hosts">' + FOLDOUTS + '</div>' +
    '</div>' +
  '</div>';

  PanelProtos.register('docker', 1, { name: 'Ledger', blurb: 'All six subviews + advanced as aligned accordion sections. Nothing overlaps; every meta clamps.', html: v1 });
  PanelProtos.register('docker', 2, { name: 'Rail Tabs', blurb: 'The 6 canonical subviews as icon tabs under a slim runtime banner. One view at a time.', html: v2 });
  PanelProtos.register('docker', 3, { name: 'Receipt Feed', blurb: 'Containers, images, and ops as filterable cards; the restart-loop container pins to Attention.', html: v3 });
  PanelProtos.register('docker', 4, { name: 'Data Grid', blurb: 'Sticky bands per subview; mono names, right-aligned state. The whole manager on one dense scroll.', html: v4 });
  PanelProtos.register('docker', 5, { name: 'Command Bar', blurb: 'Fleet stats + Compose/Build/Push pinned. Lists below condensed to one line per object.', html: v5 });
  PanelProtos.register('docker', 6, { name: 'Focus Mode', blurb: 'Restart loop pins to home; the 6 subviews + Docker/Hosts drill in one at a time.', html: v6 });


  PanelProtos.registerCrowd('docker', [
    { group: 'ctr',
      fields: { label: ['.pp-row-label', '.gr-c1', '.fd-title'], meta: ['.pp-row-m', '.gr-c2', '.fd-l3'] },
      items: [
        { label: 'tastebook-queue-consumer', meta: 'up 2h' },
        { label: 'tastebook-search-indexer', meta: ':9200 · up 1d' },
        { label: 'minio-dev-object-store', meta: 'exited 3d' },
        { label: 'mailhog', meta: ':8025 · up 5d' },
        { label: 'tastebook-migrate-one-shot', meta: 'exited 0 (ok)' },
        { label: 'redis-replica', meta: ':6380 · up 2d' },
        { label: 'tantivy-playground', meta: 'restarting x2' },
        { label: 'postgres-logical-sub', meta: ':5433 · up 6h' },
        { label: 'import-bulk-backfill-2026-07', meta: 'exited 1 (err)' },
        { label: 'docs-mdbook-serve', meta: ':3001 · up 4h' },
        { label: 'registry-cache-mirror', meta: ':5000 · up 9d' },
        { label: 'playwright-headed-runner', meta: 'created' }
      ] },
    { group: 'img',
      fields: { label: ['.pp-row-label', '.gr-c1', '.fd-title'], meta: ['.pp-row-m', '.gr-c2', '.pp-chip:last-child'] },
      items: [
        { label: 'jared/tastebook-web:v1.2-rc1', meta: '398 MB' },
        { label: 'jared/tastebook:v1.2-rc1', meta: '415 MB' },
        { label: 'jared/tastebook-migrate:v1.1', meta: '301 MB' },
        { label: 'minio/minio:latest', meta: '128 MB' },
        { label: 'mailhog/mailhog:v1.0.1', meta: '39 MB' },
        { label: 'rust:1.96-bookworm', meta: '1.4 GB' },
        { label: 'node:22-alpine', meta: '132 MB' },
        { label: 'tantivy-playground:dev', meta: '812 MB' },
        { label: '<none>:<none> (dangling x6)', meta: '1.2 GB' },
        { label: 'postgres:15-alpine', meta: '238 MB' },
        { label: 'redis:6-alpine', meta: '33 MB' },
        { label: 'ghcr.io/org/base-slint:1.17', meta: '512 MB' }
      ] },
    { group: 'svc',
      fields: { label: ['.pp-row-label', '.gr-c1'], meta: ['.pp-row-m', '.gr-c2'] },
      items: [
        { label: 'search', meta: 'tantivy:latest' },
        { label: 'queue', meta: 'tastebook-queue:v1.1' },
        { label: 'minio', meta: 'minio:latest' },
        { label: 'mailhog', meta: 'mailhog:v1.0.1' }
      ] }
  ]);
})();
