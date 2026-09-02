"""Assertion-guarded PM7 T36 physical-width layout repair.

T36 consumes T35 and adds presentation-only container-query rules for the
authorized Planning Wizard, Home, Projects, and Orchestrator narrow-layout
findings.  It adds no observer, command, event, persistence, Settings, or Chat
behavior.
"""

from __future__ import annotations

import re

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 T36: physical-width cross-page layout repair"

PAGE_INK_EXPORT_OLD = """    function resync() {
      var tab = strip.querySelector('.page-tab.active') || tabFor(window.PM_PAGES.current);
      if (!tab) tab = strip.querySelector('.page-tab[data-page]');
      if (tab) snap(tab);
    }
    try {
      new MutationObserver(resync).observe(document.documentElement, {
"""

PAGE_INK_EXPORT_NEW = """    function resync() {
      var tab = strip.querySelector('.page-tab.active') || tabFor(window.PM_PAGES.current);
      if (!tab) tab = strip.querySelector('.page-tab[data-page]');
      if (tab) snap(tab);
    }
    /* T36: the responsive title-bar density owner needs one visual-only
       resync after an overflow-only page becomes the visible active tab. */
    window.PM7_PAGE_TAB_INK = { resync: resync };
    try {
      new MutationObserver(resync).observe(document.documentElement, {
"""

TITLE_BAR_STATE_OLD = """    var fullThemeW = 0;
    var fullProjectW = 0;
"""

TITLE_BAR_STATE_NEW = """    var fullThemeW = 0;
    var fullProjectW = 0;
    /* T36: set after responsive title-bar geometry changes, or when
       page.changed selects a tab currently in the overflow menu. Normal
       wide-tab page-change spring motion stays intact. */
    var pageInkResyncPending = false;
"""

TITLE_BAR_SCHEDULE_OLD = """    function schedule() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        raf = null;
        applyDensity();
      });
    }
"""

TITLE_BAR_SCHEDULE_NEW = """    function schedule() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        raf = null;
        applyDensity();
        if (pageInkResyncPending) {
          pageInkResyncPending = false;
          if (window.PM7_PAGE_TAB_INK && typeof window.PM7_PAGE_TAB_INK.resync === 'function') {
            window.PM7_PAGE_TAB_INK.resync();
          }
        }
      });
    }
"""

TITLE_BAR_PAGE_EVENT_OLD = """        window.PM_DEMO.on('page.changed', schedule);
"""

TITLE_BAR_PAGE_EVENT_NEW = """        window.PM_DEMO.on('page.changed', function (payload) {
          var pageId = payload && payload.page;
          var activeTab = pageId && pageStrip
            ? pageStrip.querySelector('.page-tab[data-page="' + pageId + '"]')
            : null;
          if (activeTab && activeTab.classList.contains('is-overflow')) pageInkResyncPending = true;
          schedule();
        });
"""

TITLE_BAR_RESIZE_OLD = """    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(schedule);
      ro.observe(bar);
    } else {
      window.addEventListener('resize', schedule);
    }
"""

TITLE_BAR_RESIZE_NEW = """    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () {
        pageInkResyncPending = true;
        schedule();
      });
      ro.observe(bar);
    } else {
      window.addEventListener('resize', function () {
        pageInkResyncPending = true;
        schedule();
      });
    }
"""


def _assistant_slices(doc, need):
    popup = re.search(r"  function ctxPopupHTML\(\) \{.*?\n  \}\n(?=  function enhanceContext)", doc, re.S)
    drawer = re.search(r"  function contextDrawerHTML\(title\) \{.*?\n  \}\n(?=  function openContextDetails)", doc, re.S)
    need(popup is not None and drawer is not None, "T36: protected Assistant source slices missing")
    return popup.group(0), drawer.group(0)


def _settings_slice(doc, need):
    start = doc.find('<div class="page page-settings" id="panel-settings">')
    end = doc.find("\n        </main>", start)
    need(start >= 0 and end > start, "T36: protected Settings subtree missing")
    return doc[start:end]


T36_STYLE = r"""
<style id="pm7-t36-physical-layout">
/* PM7 T36: physical-width cross-page layout repair.  The owner is the real
   center pane, so Assistant docking participates in every threshold. */
.primary-content {
  container-type: inline-size;
  container-name: pm7-primary;
  min-width: 0;
}

/* Home owns a second responsive row inside the primary pane.  Assistant
   docking can squeeze this host while the outer primary container remains
   wider than the cross-page thresholds, so the host must own its query. */
#pm-home-workspace .pm-home-host[data-pm-home-host="home_main"] {
  container-type: inline-size;
  container-name: pm7-home-main;
}

@container pm7-home-main (max-width: 820px) {
  #pm-home-workspace .pm-home-host[data-pm-home-host="home_main"] > .pm-home-surface {
    min-width: 0 !important;
  }
}

/* The dashboard scrollport already owns `pm6dash`.  At the physical width
   where a CTA's actions no longer fit beside its copy, move the action group
   onto a full row and let its buttons share the available line.  This is a
   component rule: both the approval CTA and the Usage-warning CTA use the
   same rail and can occupy this physical width. */
@container pm6dash (max-width: 320px) {
  #pm-home-workspace #pm6DashCtaRail > .pm6-dash-cta {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  #pm-home-workspace #pm6DashCtaRail > .pm6-dash-cta .pm6-dash-cta-btns {
    flex: 1 1 100%;
    width: 100%;
    min-width: 0;
    justify-content: flex-start;
  }
  #pm-home-workspace #pm6DashCtaRail > .pm6-dash-cta .pm6-dash-cta-btns > .pm6-dash-btn {
    flex: 1 1 72px;
    min-width: 0;
    max-width: 100%;
    justify-content: center;
    white-space: normal;
  }
}

/* Below 220px the decorative leading glyph costs a full word column.  The
   title remains the complete identity, so hide only that decoration and give
   the copy the full physical row; actions remain on their own row above. */
@container pm6dash (max-width: 220px) {
  #pm-home-workspace #pm6DashCtaRail > .pm6-dash-cta .pm6-dash-cta-ico {
    display: none;
  }
  #pm-home-workspace #pm6DashCtaRail > .pm6-dash-cta .pm6-dash-cta-copy {
    flex: 1 1 100%;
    width: 100%;
    min-width: 0;
  }
  #pm-home-workspace #pm6DashCtaRail > .pm6-dash-cta .pm6-dash-cta-btns > .pm6-dash-btn {
    font-size: var(--fs-2xs);
    padding-inline: 8px;
  }
}

@container pm7-primary (max-width: 760px) {
  /* Planning Wizard: one natural document flow instead of viewport-derived
     two/three-column grids squeezed into the retained center pane. */
  .page-wizard {
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }
  .page-wizard :is(.pm6-wiz-runhead,.pm6-wiz-prdhead) {
    align-items: flex-start !important;
    flex-wrap: wrap !important;
    height: auto !important;
  }
  .page-wizard :is(.pm6-wiz-workgrid,.pm6-wiz-prdgrid) {
    flex: 0 0 auto !important;
    min-height: 0 !important;
    height: auto !important;
    grid-template-columns: minmax(0,1fr) !important;
    grid-template-rows: none !important;
    gap: var(--md) !important;
    padding: var(--md) !important;
    overflow: visible !important;
  }
  .page-wizard :is(.pm6-wiz-topics,.pm6-wiz-thread,.pm6-wiz-right,
                   .pm6-wiz-prdrail,.pm6-wiz-prdchat-wrap,.pm6-wiz-prdpreview) {
    min-width: 0 !important;
    min-height: 260px !important;
    max-height: none !important;
  }
  .page-wizard :is(.pm6-wiz-topic-list,.pm6-wiz-prdrail) {
    max-height: none !important;
  }
  .page-wizard :is(.pm6-wiz-runhead-state,.pm6-wiz-prdhead-state) {
    max-width: 100%;
    flex-wrap: wrap;
  }

  /* Home: empty side docks must consume zero stacked height.  Occupied docks
     retain their model-owned basis, capped only for this physical layout. */
  #pm-home-workspace .pm-home-host-grid {
    --pm7-home-left-stack: min(var(--pm-home-left-w), 180px);
    --pm7-home-right-stack: min(var(--pm-home-right-w), 180px);
    grid-template-columns: minmax(0,1fr) !important;
    grid-template-rows: var(--pm-home-top-h)
                        minmax(0,var(--pm7-home-left-stack))
                        minmax(0,1fr)
                        minmax(0,var(--pm7-home-right-stack))
                        var(--pm-home-bottom-h) !important;
    grid-template-areas: "top" "left" "main" "right" "bottom" !important;
  }
  #pm-home-workspace .pm-home-host-grid:has(> [data-pm-home-host="dock_left"].pm-home-host-empty) {
    --pm7-home-left-stack: 0px;
  }
  #pm-home-workspace .pm-home-host-grid:has(> [data-pm-home-host="dock_right"].pm-home-host-empty) {
    --pm7-home-right-stack: 0px;
  }
  #pm-home-workspace :is(#bottomPanel.pm-home-surface,.bottom-tabs-content,
                         #bottomTerminalHost,.terminal-workspace,
                         .terminal-split-node,.terminal-pane) {
    min-width: 0 !important;
    max-width: 100% !important;
  }

  /* Projects: cards and their controls collapse against the actual pane. */
  .page-projects {
    padding-inline: var(--md) !important;
    gap: var(--md) !important;
  }
  .page-projects .projects-header-bento {
    align-items: flex-start !important;
  }
  .page-projects :is(.projects-actions,.projects-toolbar) {
    width: 100%;
    min-width: 0;
  }
  .page-projects .projects-toolbar {
    align-items: stretch !important;
  }
  .page-projects .pm6-proj-toolbar-spacer { display: none !important; }
  .page-projects .pm6-proj-lbl-gap { margin-left: 0 !important; }
  .page-projects .pm6-proj-searchwrap { flex: 1 1 100%; min-width: 0; }
  .page-projects .pm6-proj-search { width: 100%; min-width: 0 !important; box-sizing: border-box; }
  .page-projects .projects-grid-bento { grid-template-columns: minmax(0,1fr) !important; gap: var(--md) !important; }
  .page-projects .pm6-proj-card .status-badge {
    position: static !important;
    max-width: 100% !important;
    align-self: flex-start;
  }
  .page-projects .pm6-proj-card .project-card-header {
    flex-wrap: wrap !important;
    gap: var(--sm) !important;
  }
  .page-projects .pm6-proj-card .project-card-title-area { padding-right: 0 !important; }
  .page-projects :is(.project-card-footer,.project-card-actions,.pm6-proj-confirm-btns) {
    flex-wrap: wrap !important;
  }

  /* Orchestrator: preserve every view and control while letting its chrome,
     cards, compile split, and graph inspector adapt to physical width. */
  .page-orchestrator .orch-header {
    height: auto !important;
    min-height: 32px !important;
    flex-wrap: wrap !important;
    padding-block: var(--xs) !important;
  }
  .page-orchestrator .pm6-orch-header-spacer { flex-basis: 100%; height: 0; }
  .page-orchestrator .orch-tabs {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    justify-content: flex-start !important;
    scrollbar-width: thin;
  }
  .page-orchestrator .orch-tab { flex: 0 0 auto; white-space: nowrap; }
  .page-orchestrator :is(.orch-content,.orch-tab-content,.pm6-orch-content,
                         .pm6-orch-pane,.pm6-orch-widget) { min-width: 0 !important; }
  .page-orchestrator .pm6-orch-cta {
    align-items: flex-start !important;
    flex-direction: column !important;
  }
  .page-orchestrator :is(.pm6-orch-cta-actions,.pm6-orch-gate-actions,
                         .pm6-orch-toolbar,.pm6-orch-row,.pm6-orch-kv,
                         .pm6-orch-graph-toolbar) { flex-wrap: wrap !important; }
  .page-orchestrator .pm6-orch-kv b { text-align: left; overflow-wrap: anywhere; }
  .page-orchestrator .pm6-orch-grid { grid-template-columns: minmax(0,1fr) !important; }
  .page-orchestrator .pm6-orch-w2 { grid-column: span 1 !important; }
  .page-orchestrator .pm6-orch-pc-main { flex-direction: column !important; }
  .page-orchestrator .pm6-orch-pc-sidecol {
    width: 100% !important;
    flex: 0 0 auto !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    overflow: visible !important;
  }
  .page-orchestrator .pm6-orch-pc-sidecol > * { flex: 1 1 180px; min-width: 0; }
  .page-orchestrator .pm6-orch-graph-body { flex-direction: column !important; }
  .page-orchestrator .pm6-orch-inspector {
    width: 100% !important;
    min-height: 190px;
    max-height: 42%;
    border-left: 0 !important;
    border-top: var(--border-width) solid var(--border);
  }
}

@container pm7-primary (max-width: 520px) {
  .page-wizard :is(.pm6-wiz-runhead,.pm6-wiz-runhead-titlerow,.pm6-wiz-prdhead) {
    align-items: flex-start !important;
    flex-direction: column !important;
  }
  .page-wizard .pm6-wiz-replay { white-space: normal !important; }
  .page-projects .projects-actions > button { flex: 1 1 auto; justify-content: center; }
  .page-projects .project-card-footer { align-items: flex-start !important; flex-direction: column !important; gap: var(--sm); }
  .page-projects .pm6-proj-card .project-card-header {
    align-items: flex-start !important;
    flex-direction: column !important;
    flex-wrap: nowrap !important;
  }
  .page-projects .pm6-proj-card .project-card-title-area {
    flex: 1 1 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  .page-projects .pm6-proj-card .project-card-title { max-width: 100% !important; }
  .page-orchestrator .orch-tab-content { padding-inline: var(--sm) !important; }
  .page-orchestrator .pm6-orch-widget { padding: var(--md) !important; }
  .page-orchestrator .pm6-orch-minimap { width: 120px; }
}

/* The canonical status zone spans the application layout on every primary
   page.  Glass keeps its material recipe but not the superseded floating
   side/bottom inset. */
html[data-theme^="glass"] #pm7GlobalStatusBar.pm7-statusbar,
html[data-theme^="glass"] .pm7-statusbar {
  left: -1px !important;
  bottom: -1px !important;
  width: calc(100% + 2px) !important;
  margin: 0 !important;
  border-radius: 0 !important;
}
</style>
"""


def apply(doc, notes, need):
    """Apply T36 after T35 while proving protected GUI bytes did not move."""
    need(TRANSFORM_MARKER not in doc, "T36: transform already applied")
    need("PM7 T35: Usage residual audit closure" in doc, "T36: T35 source marker missing")

    protected_owner_before = capture_protected_sources(doc, need, "T36 input")
    effects_before = capture_effect_surfaces(doc)
    assistant_before = _assistant_slices(doc, need)
    settings_before = _settings_slice(doc, need)
    for forbidden in (".page-settings", ".s4-", ".chat-", ".context-", ".pm7ctx", ".chm-"):
        need(forbidden not in T36_STYLE, "T36: protected selector entered CSS: %s" % forbidden)

    for old, new, label in (
        (PAGE_INK_EXPORT_OLD, PAGE_INK_EXPORT_NEW, "page ink visual API"),
        (TITLE_BAR_STATE_OLD, TITLE_BAR_STATE_NEW, "title-bar resync state"),
        (TITLE_BAR_SCHEDULE_OLD, TITLE_BAR_SCHEDULE_NEW, "title-bar density schedule"),
        (TITLE_BAR_PAGE_EVENT_OLD, TITLE_BAR_PAGE_EVENT_NEW, "title-bar page event"),
        (TITLE_BAR_RESIZE_OLD, TITLE_BAR_RESIZE_NEW, "title-bar resize resync"),
    ):
        need(doc.count(old) == 1, "T36: %s anchor drifted" % label)
        doc = doc.replace(old, new, 1)

    need(doc.count("</head>") == 1, "T36: unique head close missing")
    doc = doc.replace("</head>", T36_STYLE + "\n</head>", 1)

    need(_assistant_slices(doc, need) == assistant_before, "T36: protected Assistant source changed")
    need(_settings_slice(doc, need) == settings_before, "T36: protected Settings subtree changed")
    protected_receipt = assert_protected_sources_equal(
        protected_owner_before,
        capture_protected_sources(doc, need, "T36 output"),
        need,
        "T36",
    )
    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        {},
        need,
        "T36",
    )
    need(doc.count(TRANSFORM_MARKER) == 1, "T36: marker census mismatch")
    need("container-name: pm7-primary" in doc and "@container pm7-primary (max-width: 520px)" in doc, "T36: physical container contract missing")
    need("container-name: pm7-home-main" in doc and "@container pm7-home-main (max-width: 820px)" in doc, "T36: Home main container contract missing")
    need("@container pm6dash (max-width: 320px)" in doc and "@container pm6dash (max-width: 220px)" in doc and "#pm6DashCtaRail > .pm6-dash-cta" in T36_STYLE, "T36: Home CTA containment contract missing")
    need("flex-direction: column !important;\n    flex-wrap: nowrap !important;" in T36_STYLE, "T36: narrow Projects badge containment missing")
    need("pm-home-host-empty" in T36_STYLE and "grid-template-columns: minmax(0,1fr)" in T36_STYLE, "T36: narrow Home repair missing")
    need("#pm7GlobalStatusBar.pm7-statusbar" in T36_STYLE and "width: calc(100% + 2px) !important" in T36_STYLE, "T36: canonical full-width status zone missing")
    need(doc.count("window.PM7_PAGE_TAB_INK = { resync: resync };") == 1, "T36: page-tab ink visual resync export missing")
    need(doc.count("if (activeTab && activeTab.classList.contains('is-overflow')) pageInkResyncPending = true;") == 1, "T36: overflow page activation resync guard missing")
    need(doc.count("pageInkResyncPending = true;\n        schedule();") == 2, "T36: responsive ink resync must cover ResizeObserver and window resize fallback")

    notes.update({
        "decision": "authorized T36 Planning Wizard, Home, Projects, and Orchestrator physical-width repair plus canonical full-width status zone",
        "container_owner": ".primary-content",
        "physical_width_breakpoints_px": {"primary": [760, 520], "home_main": [820], "dashboard": [320]},
        "dashboard_cta_scope": "all direct CTA-rail cards, including approval and Usage warning",
        "page_tab_ink_overflow_resync": "visual-only after responsive title-bar geometry changes and overflow-page activation",
        "protected_embedded_source_guard": protected_receipt,
        "effect_surface_set_diff": effect_receipt,
    })
    return doc
