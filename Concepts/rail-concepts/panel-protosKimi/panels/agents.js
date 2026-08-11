/* panel-protosKimi — panels/agents.js
   AGENTS side panel, 6 family variants.
   Canon kept (F3-452): the panel MIRRORS the subagent registry — it lists
   ACTIVE and AVAILABLE subagents and provides lineage entrypoints; it never
   keeps its own subagent state. Status taxonomy from chat (ACD):
   queued | running | awaiting_parent | blocked | complete | failed | cancelled.
   Demo-lineage fields (scope, run, duration, Open Chat) kept from PMConcept7. */
(function () {
  'use strict';

  var ICON = '<span class="pp-head-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/><path d="M9 12.5h.01M15 12.5h.01" stroke-width="2.4"/><path d="M9.5 16h5"/><path d="M3 12v4M21 12v4"/></svg></span>';

  var ACTIVE = '' +
    '<div class="pp-row" data-crowd="agent"><span class="pp-dot pp-dot-run">&#9679;</span><span class="pp-row-label">lane-b worker</span><span class="pp-row-m hide-tiny">API nodes &middot; run #47</span><span class="pp-chip" style="margin-left:auto">running</span></div>' +
    '<div class="pp-row" data-crowd="agent"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">Test Sleuth</span><span class="pp-row-m hide-tiny">debug thread &middot; 42s</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">complete</span></div>' +
    '<div class="pp-row" data-crowd="agent"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="pp-row-label">Auditor</span><span class="pp-row-m hide-tiny">review loop</span><span class="pp-chip" style="margin-left:auto">queued</span></div>';

  var AVAILABLE = '' +
    '<div class="pp-row" data-crowd="type"><span class="pp-row-label">explore</span><span class="pp-row-m">codebase search &middot; read-only</span></div>' +
    '<div class="pp-row" data-crowd="type"><span class="pp-row-label">general</span><span class="pp-row-m">multi-step tasks</span></div>' +
    '<div class="pp-row" data-crowd="type"><span class="pp-row-label">plan</span><span class="pp-row-m">read-only planning</span></div>';

  var FOOT = '<div class="pp-foot">Mirror of the subagent registry &mdash; the panel keeps no state of its own. Expand work streams in the thread.</div>';

  /* ============ v1 — LEDGER ============ */
  var v1 = '' +
  '<div class="pp-panel fam-ledger">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Agents</span><span class="pp-head-sp"></span><span class="pp-chip">3 active</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="lg-sec open"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Active subagents</span><span class="lg-sec-m">3</span></div>' +
        '<div class="lg-sec-b">' +
          '<div class="pp-row" data-crowd="agent"><span class="pp-dot pp-dot-run">&#9679;</span><span class="pp-row-label">lane-b worker</span><span class="pp-row-m hide-tiny">API nodes &middot; run #47</span><span class="pp-chip" style="margin-left:auto">running</span></div>' +
          '<div class="pp-row" data-crowd="agent"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">Test Sleuth</span><span class="pp-row-m hide-tiny">debug thread &middot; 42s</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">complete</span></div>' +
          '<div class="pp-row" data-crowd="agent"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="pp-row-label">Auditor</span><span class="pp-row-m hide-tiny">review loop</span><span class="pp-chip" style="margin-left:auto">queued</span></div>' +
          '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Open Chat</button><button class="pp-btn pp-flex1">Open lineage</button></div>' +
        '</div>' +
      '</div>' +
      '<div class="lg-sec"><div class="lg-sec-h" data-acc-h><span class="lg-chev">&#9656;</span><span>Available</span><span class="lg-sec-m">3 types</span></div>' +
        '<div class="lg-sec-b">' + AVAILABLE + '<div class="pp-foot">Launch happens in chat via task &mdash; the panel only mirrors the registry.</div></div>' +
      '</div>' +
      FOOT +
    '</div>' +
  '</div>';

  /* ============ v2 — RAIL TABS ============ */
  var v2 = '' +
  '<div class="pp-panel fam-railtabs">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Agents</span><span class="pp-head-sp"></span><span class="pp-chip">3 active</span></div>' +
    '<div class="rt-strip" data-tabstrip>' +
      '<button class="rt-tab active" data-tab="active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>Active</button>' +
      '<button class="rt-tab" data-tab="avail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/></svg>Available</button>' +
      '<button class="rt-tab" data-tab="lineage"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M5 8v3a5 5 0 0 0 5 5h0"/><path d="M19 8v3a5 5 0 0 1-5 5"/></svg>Lineage</button>' +
    '</div>' +
    '<div class="pp-scroll" data-tabscope>' +
      '<div class="rt-view active" data-tabview="active">' + ACTIVE +
        '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Open Chat</button></div>' +
      '</div>' +
      '<div class="rt-view" data-tabview="avail">' + AVAILABLE +
        '<div class="pp-foot">Launch happens in chat via task &mdash; the panel only mirrors the registry.</div>' +
      '</div>' +
      '<div class="rt-view" data-tabview="lineage">' +
        '<div class="pp-row"><span class="pp-row-label">lane-b worker</span><span class="pp-row-m">run #47 &middot; node n-19</span><button class="pp-mini" style="margin-left:auto">Run graph</button></div>' +
        '<div class="pp-row"><span class="pp-row-label">Test Sleuth</span><span class="pp-row-m">debug thread</span><button class="pp-mini" style="margin-left:auto">Thread</button></div>' +
        '<div class="pp-row"><span class="pp-row-label">Auditor</span><span class="pp-row-m hide-tiny">review loop</span><button class="pp-mini" style="margin-left:auto">Run graph</button></div>' +
        '<div class="pp-foot">Lineage entrypoints navigate to the agent lineage views (Run Graph / thread).</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  /* ============ v3 — RECEIPT FEED ============ */
  var v3 = '' +
  '<div class="pp-panel fam-feed">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Agents</span><span class="pp-head-sp"></span><span class="pp-chip">3 active</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="fd-filters" data-filters>' +
        '<button class="pp-flag active" data-filter="all">All</button>' +
        '<button class="pp-flag" data-filter="running">Running</button>' +
        '<button class="pp-flag" data-filter="queued">Queued</button>' +
        '<button class="pp-flag" data-filter="done">Done</button>' +
      '</div>' +
      '<div class="fd-ghead">Active <span class="pp-chip">3</span></div>' +
      '<div class="fd-card" data-fam="running" data-crowd="agent">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-run">&#9679;</span><span class="fd-title">lane-b worker</span><span class="pp-chip" style="margin-left:auto">running</span></div>' +
        '<div class="fd-l2">API nodes &middot; run #47 &middot; node n-19</div>' +
        '<div class="fd-acts"><button class="pp-mini">Lineage</button><button class="pp-mini">Open chat</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="queued" data-crowd="agent">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="fd-title">Auditor</span><span class="pp-chip" style="margin-left:auto">queued</span></div>' +
        '<div class="fd-l2">review loop &middot; waiting on lane-b</div>' +
        '<div class="fd-acts"><button class="pp-mini">Lineage</button></div>' +
      '</div>' +
      '<div class="fd-card" data-fam="done" data-crowd="agent">' +
        '<div class="fd-l1"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="fd-title">Test Sleuth</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">complete</span></div>' +
        '<div class="fd-l2">debug thread &middot; 42s &middot; fixed import parser</div>' +
        '<div class="fd-acts"><button class="pp-mini">Lineage</button><button class="pp-mini">Thread</button></div>' +
      '</div>' +
      '<div class="fd-ghead">Available <span class="pp-chip">registry</span></div>' +
      '<div class="fd-card"><div class="fd-l1"><span class="fd-title">explore</span></div><div class="fd-l2">codebase search &middot; read-only</div></div>' +
      '<div class="fd-card"><div class="fd-l1"><span class="fd-title">general</span></div><div class="fd-l2">multi-step tasks</div></div>' +
      '<div class="fd-card"><div class="fd-l1"><span class="fd-title">plan</span></div><div class="fd-l2">read-only planning</div></div>' +
      '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Open Chat</button></div>' +
      FOOT +
    '</div>' +
  '</div>';

  /* ============ v4 — DATA GRID ============ */
  var v4 = '' +
  '<div class="pp-panel fam-grid">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Agents</span><span class="pp-head-sp"></span><span class="pp-chip">3 active</span></div>' +
    '<div class="pp-scroll">' +
      '<div class="gr-band"><span class="gr-band-t">Active subagents</span> <span class="pp-chip">3</span></div>' +
      '<div class="gr-row" data-crowd="agent"><span class="pp-dot pp-dot-run">&#9679;</span><span class="gr-c1">lane-b worker</span><span class="gr-c2">running</span></div>' +
      '<div class="gr-sub">API nodes &middot; run #47 &middot; node n-19 &middot; lineage: Run graph</div>' +
      '<div class="gr-row" data-crowd="agent"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="gr-c1">Auditor</span><span class="gr-c2">queued</span></div>' +
      '<div class="gr-sub">review loop &middot; waiting on lane-b &middot; lineage: Run graph</div>' +
      '<div class="gr-row" data-crowd="agent"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="gr-c1">Test Sleuth</span><span class="gr-c2">complete &middot; 42s</span></div>' +
      '<div class="gr-sub">debug thread &middot; fixed import parser &middot; lineage: Thread</div>' +
      '<div class="gr-band"><span class="gr-band-t">Available</span> <span class="pp-chip">3 types</span></div>' +
      '<div class="gr-row" data-crowd="type"><span></span><span class="gr-c1">explore</span><span class="gr-c2">read-only</span></div>' +
      '<div class="gr-row" data-crowd="type"><span></span><span class="gr-c1">general</span><span class="gr-c2">multi-step</span></div>' +
      '<div class="gr-row" data-crowd="type"><span></span><span class="gr-c1">plan</span><span class="gr-c2">read-only</span></div>' +
      '<div class="gr-actions"><button class="pp-btn pp-flex1">Open Chat</button><button class="pp-btn pp-flex1">Open Run Graph</button></div>' +
    '</div>' +
  '</div>';

  /* ============ v5 — COMMAND BAR ============ */
  var v5 = '' +
  '<div class="pp-panel fam-command">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Agents</span><span class="pp-head-sp"></span><span class="pp-chip">registry mirror</span></div>' +
    '<div class="cm-hero">' +
      '<div class="cm-stats">' +
        '<div class="cm-stat"><span class="cm-stat-v">1</span><span class="cm-stat-k">Running</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">1</span><span class="cm-stat-k">Queued</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">1</span><span class="cm-stat-k">Complete</span></div>' +
        '<div class="cm-stat"><span class="cm-stat-v">3</span><span class="cm-stat-k">Available</span></div>' +
      '</div>' +
      '<div class="cm-actions"><button class="pp-btn pp-btn-p pp-flex1">Open Chat</button><button class="pp-btn pp-flex1">Open Run Graph</button></div>' +
    '</div>' +
    '<div class="pp-scroll">' +
      '<div class="cm-list-h">Active <span class="pp-chip">3</span></div>' +
      '<div class="pp-row" data-crowd="agent"><span class="pp-dot pp-dot-run">&#9679;</span><span class="pp-row-label">lane-b worker</span><span class="pp-row-m hide-tiny">run #47</span><span class="pp-chip" style="margin-left:auto">running</span></div>' +
      '<div class="pp-row" data-crowd="agent"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="pp-row-label">Auditor</span><span class="pp-row-m hide-tiny">review loop</span><span class="pp-chip" style="margin-left:auto">queued</span></div>' +
      '<div class="pp-row" data-crowd="agent"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">Test Sleuth</span><span class="pp-row-m hide-tiny">42s</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">complete</span></div>' +
      '<div class="cm-list-h">Available <span class="pp-chip">registry</span></div>' +
      '<div class="pp-row" data-crowd="type"><span class="pp-row-label">explore</span><span class="pp-row-m">read-only search</span></div>' +
      '<div class="pp-row" data-crowd="type"><span class="pp-row-label">general</span><span class="pp-row-m">multi-step</span></div>' +
      '<div class="pp-row" data-crowd="type"><span class="pp-row-label">plan</span><span class="pp-row-m">read-only</span></div>' +
      '<div class="pp-foot" style="padding:0 var(--xs)">Launch happens in chat via task &middot; expand work streams in the thread &middot; lineage opens the Run Graph.</div>' +
    '</div>' +
  '</div>';

  /* ============ v6 — FOCUS MODE ============ */
  var v6 = '' +
  '<div class="pp-panel fam-focus">' +
    '<div class="pp-head">' + ICON + '<span class="pp-head-title">Agents</span><span class="pp-head-sp"></span><span class="pp-chip">3 active</span></div>' +
    '<div class="fo-crumb"><span class="fo-crumb-home">Agents</span><button data-fo-back>&#8249; Home</button><span>/</span><b style="color:var(--text-secondary)" data-fo-crumb-current>Home</b></div>' +
    '<div class="pp-scroll">' +
      '<div class="fo-home">' +
        '<div class="pp-attn">' +
          '<div class="pp-attn-l1"><span class="pp-dot pp-dot-run">&#9679;</span><span class="pp-attn-title">lane-b worker</span><span class="pp-chip" style="margin-left:auto">running</span></div>' +
          '<div class="pp-attn-l2">API nodes &middot; run #47 &middot; node n-19</div>' +
          '<div class="pp-attn-l3"><button class="pp-btn">Open Chat</button><button class="pp-mini">Lineage</button></div>' +
        '</div>' +
        '<div class="fo-nav">' +
          '<div class="fo-navitem" data-fo-go="active" data-fo-label="Active"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/></svg></span><span class="fo-nav-label">Active subagents</span><span class="fo-nav-m">3</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="available" data-fo-label="Available"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.8 2.8L16.4 9"/></svg></span><span class="fo-nav-label">Available types</span><span class="fo-nav-m">3</span><span class="fo-nav-go">&#9656;</span></div>' +
          '<div class="fo-navitem" data-fo-go="lineage" data-fo-label="Lineage"><span class="fo-nav-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M5 8v3a5 5 0 0 0 5 5h0"/><path d="M19 8v3a5 5 0 0 1-5 5"/></svg></span><span class="fo-nav-label">Lineage</span><span class="fo-nav-m">run graph &middot; threads</span><span class="fo-nav-go">&#9656;</span></div>' +
        '</div>' +
        '<div class="pp-inset" style="padding:var(--sm) var(--md)">' +
          '<div class="pp-card-h">Also active</div>' +
          '<div class="pp-row"><span class="pp-dot pp-dot-idle">&#9679;</span><span class="pp-row-label">Auditor</span><span class="pp-row-m hide-tiny">review loop</span><span class="pp-chip" style="margin-left:auto">queued</span></div>' +
          '<div class="pp-row"><span class="pp-dot pp-dot-ok">&#9679;</span><span class="pp-row-label">Test Sleuth</span><span class="pp-row-m hide-tiny">42s</span><span class="pp-chip pp-chip-ok" style="margin-left:auto">complete</span></div>' +
        '</div>' +
        FOOT +
      '</div>' +
      '<div data-fo-view="active">' + ACTIVE +
        '<div class="pp-btnrow"><button class="pp-btn pp-flex1">Open Chat</button><button class="pp-btn pp-flex1">Open lineage</button></div>' +
      '</div>' +
      '<div data-fo-view="available">' + AVAILABLE +
        '<div class="pp-foot">Launch happens in chat via task &mdash; the panel only mirrors the registry.</div>' +
      '</div>' +
      '<div data-fo-view="lineage">' +
        '<div class="pp-row"><span class="pp-row-label">lane-b worker</span><span class="pp-row-m">run #47 &middot; node n-19</span><button class="pp-mini" style="margin-left:auto">Run graph</button></div>' +
        '<div class="pp-row"><span class="pp-row-label">Test Sleuth</span><span class="pp-row-m">debug thread</span><button class="pp-mini" style="margin-left:auto">Thread</button></div>' +
        '<div class="pp-row"><span class="pp-row-label">Auditor</span><span class="pp-row-m hide-tiny">review loop</span><button class="pp-mini" style="margin-left:auto">Run graph</button></div>' +
        '<div class="pp-foot">Lineage entrypoints navigate to the agent lineage views (Run Graph / thread).</div>' +
      '</div>' +
    '</div>' +
  '</div>';

  PanelProtos.register('agents', 1, { name: 'Ledger', blurb: 'Active / Available as two aligned accordion sections with chat + lineage actions inside.', html: v1 });
  PanelProtos.register('agents', 2, { name: 'Rail Tabs', blurb: 'Active / Available / Lineage tabs — the registry mirror plus a dedicated lineage surface.', html: v2 });
  PanelProtos.register('agents', 3, { name: 'Receipt Feed', blurb: 'Subagents as status-filterable cards with hover lineage actions.', html: v3 });
  PanelProtos.register('agents', 4, { name: 'Data Grid', blurb: 'Two bands (active, available) with scope/run/lineage as sub-rows.', html: v4 });
  PanelProtos.register('agents', 5, { name: 'Command Bar', blurb: 'Counts by state + Open Chat / Run Graph pinned; flat lists below.', html: v5 });
  PanelProtos.register('agents', 6, { name: 'Focus Mode', blurb: 'The one running agent pins to home; active, available, and lineage drill in.', html: v6 });


  PanelProtos.registerCrowd('agents', [
    { group: 'agent',
      fields: { label: ['.pp-row-label', '.gr-c1', '.fd-title'], meta: ['.pp-row-m', '.gr-c2', '.fd-l2'] },
      items: [
        { label: 'lane-c researcher', meta: 'schema.org survey · run #47' },
        { label: 'Import Historian', meta: 'log dig · 3m' },
        { label: 'PR Reviewer', meta: 'lane-b diff · waiting' },
        { label: 'Docs Scribe', meta: 'openapi sync · 12m' },
        { label: 'Flake Hunter', meta: 'auth refresh race · 1h' },
        { label: 'Release Wrangler', meta: 'v1.2 checklist · queued' },
        { label: 'Index Janitor', meta: 'tantivy cache · 30s' },
        { label: 'Conflict Medic', meta: 'lane-d rebase · blocked' },
        { label: 'Cost Watcher', meta: 'usage ledger · 5m' },
        { label: 'Schema Steward', meta: 'migrations · queued' },
        { label: 'UX Pass reviewer', meta: 'panel protos · 9m' },
        { label: 'Web Librarian', meta: 'source catalog · done' }
      ] },
    { group: 'type',
      fields: { label: ['.pp-row-label', '.gr-c1'], meta: ['.pp-row-m', '.gr-c2'] },
      items: [
        { label: 'reviewer', meta: 'diff audit · read-only' },
        { label: 'researcher', meta: 'web + citations' },
        { label: 'tester', meta: 'runner adapters' }
      ] }
  ]);
})();
